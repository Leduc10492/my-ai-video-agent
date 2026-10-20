import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { parseScreenplay } from '../../shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs';

export const STATE_PATH = 'deliverables/0_admin/workflow_state.json';
const PREVIOUS_PATH = 'deliverables/0_admin/workflow_state.previous.json';
const LOCK_PATH = 'deliverables/0_admin/.workflow-state.lock';
export const hash = (text) => createHash('sha256').update(text).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const clone = (value) => structuredClone(value);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const refKey = (ref) => `${ref.artifact_id}@v${ref.version}`;
const now = () => new Date().toISOString();

// Every writable path is project-relative, including through existing symlinks.
function localPath(root, relative) {
  assert(typeof relative === 'string' && relative && !path.isAbsolute(relative), `Expected project-relative path: ${relative}`);
  const base = fs.realpathSync(root);
  const target = path.resolve(base, relative);
  assert(target.startsWith(`${base}${path.sep}`), `Path escapes project: ${relative}`);
  let ancestor = target;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const real = fs.realpathSync(ancestor);
  assert(real === base || real.startsWith(`${base}${path.sep}`), `Symlink escapes project: ${relative}`);
  return target;
}

function syncDirectory(directory) {
  const fd = fs.openSync(directory, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

function writeAtomic(root, relative, content, { replace = false } = {}) {
  const destination = localPath(root, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try {
    fs.writeFileSync(fd, content, 'utf8');
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  try {
    assert(hash(fs.readFileSync(temporary)) === hash(content), `Read-back failed: ${relative}`);
    if (replace) fs.renameSync(temporary, destination);
    else {
      // link is atomic and refuses to overwrite an existing version.
      fs.linkSync(temporary, destination);
      fs.unlinkSync(temporary);
    }
    syncDirectory(path.dirname(destination));
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return { path: relative, sha256: hash(content) };
}

function readReference(root, ref) {
  assert(ref && /^[a-f0-9]{64}$/.test(ref.sha256 ?? ''), 'Reference requires a SHA-256 hash');
  const candidates = [ref.path];
  if (ref.path?.startsWith('deliverables/')) candidates.push(ref.path.replace(/^deliverables\//, 'archives/'));
  for (const candidate of candidates) {
    const file = localPath(root, candidate);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    assert(hash(content) === ref.sha256, `Hash mismatch: ${candidate}. Preserve the external edit and reconcile it explicitly.`);
    return { path: candidate, content };
  }
  throw new Error(`Unresolved artifact: ${ref.path}`);
}

function emptyState() {
  return { schema_version: 1, revision: 0, source: null, source_history: [], working_script: null, production_inputs: null,
    artifacts: {}, scene_labels: [], locks: null, last_change: null };
}

export function readState(root, { optional = false } = {}) {
  const file = localPath(root, STATE_PATH);
  if (!fs.existsSync(file) && optional) return null;
  const state = JSON.parse(fs.readFileSync(file, 'utf8'));
  validateStateShape(state);
  return state;
}

function validateStateShape(state) {
  assert(state.schema_version === 1, `Unsupported schema_version: ${state.schema_version}`);
  assert(Number.isSafeInteger(state.revision) && state.revision >= 1 && state.artifacts && !Array.isArray(state.artifacts)
    && Array.isArray(state.scene_labels) && Array.isArray(state.source_history) && state.last_change, 'Malformed workflow state');
  for (const [key, ref] of Object.entries(state.artifacts)) {
    assert(ref.artifact_id && Number.isSafeInteger(ref.version) && ref.version > 0 && refKey(ref) === key
      && ['script', 'audit', 'decision'].includes(ref.kind), `Malformed artifact reference: ${key}`);
    if (ref.kind === 'script') {
      assert(Array.isArray(ref.scene_map) && ['stable', 'positional'].includes(ref.numbering)
        && /^[a-f0-9]{64}$/.test(ref.body_sha256 ?? ''), `Malformed script mapping: ${key}`);
      assert(new Set(ref.scene_map.map((scene) => scene.label)).size === ref.scene_map.length
        && ref.scene_map.every((scene, index) => scene.position === index + 1 && state.scene_labels.includes(scene.label)), `Invalid Scene identities: ${key}`);
    }
  }
  const registered = (ref, kind) => ref?.kind === kind && JSON.stringify(state.artifacts[refKey(ref)]) === JSON.stringify(ref);
  assert(registered(state.working_script, 'script'), 'Working reference is not registered');
  assert(state.production_inputs === null || (registered(state.production_inputs?.script, 'script')
    && registered(state.production_inputs?.audit, 'audit') && registered(state.production_inputs?.decision, 'decision')
    && ['interactive', 'autonomous'].includes(state.production_inputs.mode)
    && Array.isArray(state.production_inputs.scope) && state.production_inputs.scope.length > 0), 'Malformed production selection');
  assert(state.source === null || state.source?.type === 'notion', 'Malformed source identity');
}

function validateReferences(root, state) {
  for (const ref of Object.values(state.artifacts)) readReference(root, ref);
  if (state.working_script) readReference(root, state.working_script);
  if (state.production_inputs) {
    for (const key of ['script', 'audit', 'decision']) readReference(root, state.production_inputs[key]);
  }
  for (const source of [state.source, ...(state.source_history ?? [])].filter(Boolean)) {
    for (const entry of source.imports) {
      readReference(root, entry.snapshot);
      readReference(root, entry.capture);
      assert(state.artifacts[entry.result_script?.key]?.sha256 === entry.result_script?.sha256, 'Source import result is not registered');
    }
  }
}

function withLock(root, action) {
  const lock = localPath(root, LOCK_PATH);
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  const owner = json({ pid: process.pid, hostname: os.hostname(), started_at: now(), token: randomUUID() });
  try { writeAtomic(root, LOCK_PATH, owner); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('Workflow writer lock exists. If its process stopped, run recover; do not delete an active writer lock.');
    if (fs.existsSync(lock) && fs.readFileSync(lock, 'utf8') === owner) fs.unlinkSync(lock);
    throw error;
  }
  try { return action(); } finally { fs.unlinkSync(lock); }
}

function commit(root, previous, next, change, hooks = {}) {
  // Recheck inputs immediately before committing; a user's external file edit
  // is a conflict, never something to overwrite or hide with a new hash.
  if (previous) validateReferences(root, previous);
  next.revision = (previous?.revision ?? 0) + 1;
  next.last_change = { at: now(), ...change };
  validateStateShape(next);
  validateReferences(root, next);
  hooks.onPhase?.('before_state');
  if (previous) writeAtomic(root, PREVIOUS_PATH, json(previous), { replace: true });
  writeAtomic(root, STATE_PATH, json(next), { replace: true });
  hooks.onPhase?.('after_state');
  return { state: next, change: next.last_change };
}

function readLocks(root) {
  const relative = 'deliverables/0_admin/locks.md';
  const file = localPath(root, relative);
  return fs.existsSync(file) ? { path: relative, sha256: hash(fs.readFileSync(file)) } : null;
}

function unwrap(text) {
  if (/^# Artifact:/.test(text)) {
    const separator = /\r?\n---\r?\n(?:\r?\n)?/.exec(text);
    assert(separator, 'Artifact header is missing its --- body separator');
    const end = separator.index + separator[0].length;
    return { header: text.slice(0, end), body: text.slice(end) };
  }
  return { header: '', body: text };
}

function allocateArtifactId(root) {
  const prefix = `A-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-`;
  let sequence = 0;
  const scan = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const id = fs.readFileSync(file, 'utf8').match(/^- id:\s*(\S+)/m)?.[1];
        if (id?.startsWith(prefix)) sequence = Math.max(sequence, Number(id.slice(prefix.length)) || 0);
      }
    }
  };
  for (const stage of ['deliverables', 'archives']) scan(localPath(root, stage));
  return `${prefix}${String(sequence + 1).padStart(3, '0')}`;
}

function metadata(text, relative, kind = 'script', fallbackId) {
  const version = Number(path.basename(relative).match(/_v([1-9]\d*)\.md$/)?.[1]);
  assert(version, `Expected versioned Markdown path: ${relative}`);
  const { header } = unwrap(text);
  const declared = header.match(/^- version:\s*v(\d+)\s*$/m)?.[1];
  assert(!declared || Number(declared) === version, `Filename/header version mismatch: ${relative}`);
  return { artifact_id: header.match(/^- id:\s*(\S+)\s*$/m)?.[1] ?? fallbackId, version, kind };
}

function sceneOptions(state, previousScenes, bindings) {
  return { previousScenes, reservedLabels: state.scene_labels, bindings: bindings ?? {}, numbering: state.working_script?.numbering ?? 'stable' };
}

function segments(body, options = {}) {
  let index;
  try { index = parseScreenplay(body, '<local-script>', options); }
  catch (error) {
    if (!error.message.startsWith('No screenplay sluglines')) throw error;
    assert(!(options.previousScenes?.length), 'All Scene headings disappeared; confirm a new mapping or preserve screenplay headings');
    return { scenes: [], units: [{ label: '@document', header: 'Document', start: 0, end: body.length, text: body }] };
  }
  const units = index.scenes.map((scene) => ({ label: scene.label, header: scene.header,
    start: scene.startOffset, end: scene.endOffset, text: body.slice(scene.startOffset, scene.endOffset) }));
  units.unshift({ label: '@preamble', header: 'Preamble', start: 0, end: units[0].start, text: body.slice(0, units[0].start) });
  const end = units.at(-1).end;
  units.push({ label: '@suffix', header: 'Suffix', start: end, end: body.length, text: body.slice(end) });
  assert(units.map((unit) => unit.text).join('') === body, 'Scene ranges must cover the body without changing bytes');
  return { scenes: index.scenes.map(({ label, position, header, contentHash, matchHeader }) => ({ label, position, header, contentHash, matchHeader })), units };
}

function registeredSegments(root, ref) {
  const { content } = readReference(root, ref);
  const { header, body } = unwrap(content);
  const bindings = Object.fromEntries(ref.scene_map.map((scene) => [scene.position, scene.label]));
  return { header, body, ...segments(body, { previousScenes: ref.scene_map, bindings, numbering: ref.numbering }) };
}

function scriptCandidates(root) {
  const result = [];
  for (const stage of ['deliverables/1_story', 'archives/1_story']) {
    const directory = localPath(root, stage);
    if (!fs.existsSync(directory)) continue;
    for (const name of fs.readdirSync(directory).sort()) {
      if (/^01_script_v[1-9]\d*\.md$/.test(name)) result.push(`${stage}/${name}`);
    }
  }
  // Compatibility links and identical active/archive copies are one candidate.
  return result.filter((relative, index) => !result.slice(0, index).some((earlier) =>
    path.basename(earlier) === path.basename(relative)
    && hash(fs.readFileSync(localPath(root, earlier))) === hash(fs.readFileSync(localPath(root, relative)))));
}

function registerScript(root, relative, state, bindings, numbering = state.working_script?.numbering ?? 'stable') {
  assert(/^(deliverables|archives)\/1_story\/01_script_v[1-9]\d*\.md$/.test(relative), 'Select an exact canonical script path');
  const content = fs.readFileSync(localPath(root, relative), 'utf8');
  assert(['stable', 'positional'].includes(numbering), 'numbering must be stable or positional');
  const parsed = segments(unwrap(content).body, { ...sceneOptions(state, state.working_script?.scene_map ?? [], bindings), numbering });
  const ref = { ...metadata(content, relative, 'script', state.working_script?.artifact_id ?? allocateArtifactId(root)), path: relative, sha256: hash(content),
    body_sha256: hash(unwrap(content).body), scene_map: parsed.scenes, numbering };
  assert(!Object.values(state.artifacts).some((item) => refKey(item) === refKey(ref) && item.sha256 !== ref.sha256), 'Artifact identity/version already registered with different content');
  state.artifacts[refKey(ref)] = ref;
  state.scene_labels = [...new Set([...state.scene_labels, ...parsed.scenes.map((scene) => scene.label)])];
  return ref;
}

function saveScript(root, state, body, header, parsed, hooks, numbering = state.working_script?.numbering ?? 'stable') {
  const old = state.working_script;
  if (old?.body_sha256 === hash(body)) return { ref: old, changed: false };
  const versions = scriptCandidates(root).map((candidate) => Number(candidate.match(/_v(\d+)\.md$/)[1]));
  const version = Math.max(0, ...versions, ...Object.values(state.artifacts).filter((item) => item.kind === 'script').map((item) => item.version)) + 1;
  const artifact_id = old?.artifact_id ?? allocateArtifactId(root);
  const locks = readLocks(root);
  if (header) {
    assert(/^- version:\s*v\d+\s*$/m.test(header) && /^- id:\s*\S+\s*$/m.test(header), 'Existing Artifact header needs id and version');
    header = header.replace(/(^- version:\s*)v\d+/m, `$1v${version}`);
  } else {
    header = `# Artifact: 剧本\n- id: ${artifact_id}\n- version: v${version}\n- upstream: []\n- locks: ${locks ? `${locks.path} (sha256: ${locks.sha256})` : '[]'}\n\n---\n\n`;
  }
  const relative = `deliverables/1_story/01_script_v${version}.md`;
  const file = writeAtomic(root, relative, header + body);
  hooks.onPhase?.('after_script');
  const ref = { ...file, artifact_id, version, kind: 'script', body_sha256: hash(body), scene_map: parsed.scenes, numbering,
    derived_from: old ? refKey(old) : null };
  state.artifacts[refKey(ref)] = ref;
  state.working_script = ref;
  state.locks = locks;
  state.scene_labels = [...new Set([...state.scene_labels, ...parsed.scenes.map((scene) => scene.label)])];
  return { ref, changed: true };
}

function requireWorking(state, request) {
  assert(state?.working_script, 'No local working script. Initialize an exact file or complete the first import.');
  assert(request.expected_sha256 === state.working_script.sha256, 'Expected working SHA-256 is missing or stale; resolve working first.');
}

function difference(before, after) {
  const old = new Map(before.map((unit) => [unit.label, unit.text]));
  const next = new Map(after.map((unit) => [unit.label, unit.text]));
  const changed = [...new Set([...old.keys(), ...next.keys()])].filter((key) => old.get(key) !== next.get(key));
  if (before.map((item) => item.label).join('|') !== after.map((item) => item.label).join('|')) changed.push('@order');
  return changed;
}

export function initialize(root, request = {}, hooks = {}) {
  return withLock(root, () => {
    assert(!readState(root, { optional: true }), 'State already exists; use select-working for an explicit change');
    const candidates = scriptCandidates(root);
    const interrupted = fs.existsSync(localPath(root, PREVIOUS_PATH)) || fs.existsSync(localPath(root, 'archives/1_story/notion_imports'));
    assert(request.script || !interrupted, 'Recovery evidence exists without state; inspect saved captures/backup and select an exact file. Do not automatically promote an interrupted candidate.');
    const selected = request.script ?? (candidates.length === 1 ? candidates[0] : null);
    assert(selected, `Working script is ambiguous; select an exact path. Candidates: ${JSON.stringify(candidates)}`);
    const state = emptyState();
    state.working_script = registerScript(root, selected, state, request.scene_bindings, request.numbering);
    state.locks = readLocks(root);
    return commit(root, null, state, { operation: 'initialize', changed: false, selected }, hooks);
  });
}

export function selectWorking(root, request, hooks = {}) {
  return withLock(root, () => {
    const previous = readState(root);
    requireWorking(previous, request);
    const state = clone(previous);
    const selectedText = fs.readFileSync(localPath(root, request.script), 'utf8');
    const selectedVersion = Number(request.script.match(/_v(\d+)\.md$/)?.[1]);
    const known = Object.values(state.artifacts).find((ref) => ref.kind === 'script' && ref.version === selectedVersion && ref.sha256 === hash(selectedText));
    state.working_script = known && !request.reindex ? known : registerScript(root, request.script, state, request.scene_bindings, request.numbering);
    readReference(root, state.working_script);
    return commit(root, previous, state, { operation: 'select-working', changed: false, selected: request.script }, hooks);
  });
}

export function editLocal(root, request, hooks = {}) {
  return withLock(root, () => {
    const previous = readState(root);
    requireWorking(previous, request);
    const state = clone(previous);
    const current = registeredSegments(root, previous.working_script);
    assert(Array.isArray(request.edits) && request.edits.length > 0, 'Local edit requires exact before/after replacements');
    const replacements = request.edits.map((edit) => {
      assert(typeof edit.before === 'string' && edit.before.length && typeof edit.after === 'string', 'Each edit requires nonempty before and string after');
      const unit = edit.scope ? current.units.find((item) => item.label === edit.scope) : { start: 0, text: current.body };
      assert(unit, `Unknown edit scope: ${edit.scope}`);
      const offset = unit.text.indexOf(edit.before);
      assert(offset >= 0 && unit.text.indexOf(edit.before, offset + 1) === -1, `Local edit target is missing or ambiguous in ${edit.scope ?? 'document'}`);
      return { start: unit.start + offset, end: unit.start + offset + edit.before.length, text: edit.after };
    }).sort((a, b) => b.start - a.start);
    let body = current.body;
    for (let index = 0; index < replacements.length; index++) {
      const edit = replacements[index];
      assert(index === 0 || edit.end <= replacements[index - 1].start, 'Local edit ranges overlap');
      body = body.slice(0, edit.start) + edit.text + body.slice(edit.end);
    }
    // Exact local edits that retain every heading retain their existing range
    // identities, including repeated location titles. Insertion needs matching.
    const fresh = segments(body);
    const sameHeadings = fresh.scenes.length === current.scenes.length && fresh.scenes.every((scene, index) => scene.header === current.scenes[index].header);
    const bindings = request.scene_bindings ?? (sameHeadings ? Object.fromEntries(current.scenes.map((scene) => [scene.position, scene.label])) : {});
    const parsed = segments(body, sceneOptions(state, current.scenes, bindings));
    const saved = saveScript(root, state, body, current.header, parsed, hooks);
    const affected = difference(current.units, parsed.units);
    return commit(root, previous, state, { operation: 'local-edit', changed: saved.changed, affected, requires_review: saved.changed ? affected : [] }, hooks);
  });
}

function validateCapture(capture) {
  assert(capture?.source?.type === 'notion', 'Capture source.type must be notion');
  const page = capture.source.page_id?.replaceAll('-', '').toLowerCase();
  assert(/^[a-f0-9]{32}$/.test(page ?? ''), 'A verified Notion page_id is required');
  const url = new URL(capture.source.url);
  assert(url.protocol === 'https:' && /(^|\.)notion\.(so|site)$/.test(url.hostname), 'Expected the verified Notion page URL');
  assert(url.pathname.replaceAll('-', '').toLowerCase().endsWith(page), 'Notion URL and page_id do not match');
  assert(typeof capture.script === 'string' && capture.script.trim(), 'Complete screenplay text is required');
  for (const key of ['body', 'pagination', 'children', 'properties', 'appendices']) {
    assert(capture.complete?.[key] === true, `Incomplete Notion capture: ${key}`);
  }
  assert(typeof capture.read_evidence === 'string' && capture.read_evidence.trim(), 'Connector read evidence is required');
  assert(typeof capture.read_at === 'string' && Number.isFinite(Date.parse(capture.read_at)), 'Connector read_at is required');
  assert(capture.properties && typeof capture.properties === 'object' && !Array.isArray(capture.properties), 'Preserve properties separately (use {} when verified empty)');
  assert(Array.isArray(capture.attachments), 'Record attachments, including unavailable media (use [] when verified empty)');
  return page;
}

function baselineDescriptors(source) {
  return Object.entries(source.baselines).filter(([label]) => label.startsWith('scene-'))
    .map(([label, baseline]) => ({ label, ...baseline.scene }));
}

function sourceUnit(root, source, label) {
  const baseline = source.baselines[label];
  assert(baseline, `No adopted source baseline for ${label}; initialize its mapping explicitly`);
  const snapshot = source.imports.find((entry) => entry.import_id === baseline.import_id);
  assert(snapshot, `Missing baseline snapshot for ${label}`);
  const body = readReference(root, snapshot.snapshot).content;
  const capture = JSON.parse(readReference(root, snapshot.capture).content);
  const parsed = segments(body, { previousScenes: capture.scene_map, bindings: Object.fromEntries(capture.scene_map.map((scene) => [scene.position, scene.label])), numbering: capture.numbering });
  const unit = parsed.units.find((item) => item.label === label);
  assert(unit && hash(unit.text) === baseline.sha256, `Invalid source baseline for ${label}`);
  return unit;
}

export function importNotion(root, request, hooks = {}) {
  return withLock(root, () => {
    const previous = readState(root, { optional: true });
    const state = clone(previous ?? emptyState());
    assert(['initial', 'partial', 'full'].includes(request.mode), 'Import requires initial, partial, or full mode');
    assert(typeof request.authorization === 'string' && request.authorization.trim(), 'Record the user request authorizing this Notion import/update');
    const page = validateCapture(request.capture);
    if (request.mode === 'initial') {
      assert(!state.source && !state.working_script && scriptCandidates(root).length === 0, 'Local scripts already exist; initialize the selected local file, then explicitly request a full Notion update');
    } else {
      requireWorking(state, request);
      if (request.mode === 'partial') assert(state.source, 'Partial refresh needs an adopted source baseline');
    }
    if (state.source && state.source.page_id !== page) {
      assert(request.mode === 'full' && request.replace_source === true, 'Different Notion page; explicit full source replacement is required');
    }
    const current = state.working_script ? registeredSegments(root, state.working_script) : { header: '', body: '', scenes: [], units: [] };
    const sameSource = state.source?.page_id === page;
    const numbering = request.numbering ?? state.working_script?.numbering ?? 'stable';
    assert(['stable', 'positional'].includes(numbering), 'numbering must be stable or positional');
    assert(!state.working_script || numbering === state.working_script.numbering, 'Numbering policy cannot change during import; resolve the identity migration separately');
    let sourceBindings = request.scene_bindings;
    if (!sourceBindings && sameSource) {
      const identical = state.source.imports.find((entry) => entry.snapshot.sha256 === hash(request.capture.script));
      if (identical) {
        const priorCapture = JSON.parse(readReference(root, identical.capture).content);
        sourceBindings = Object.fromEntries(priorCapture.scene_map.filter((scene) => state.source.baselines[scene.label]).map((scene) => [scene.position, scene.label]));
      }
    }
    const incoming = segments(request.capture.script, { ...sceneOptions(state,
      sameSource ? baselineDescriptors(state.source) : current.scenes, sourceBindings), numbering, allowUnmapped: request.mode === 'partial' });
    let body = request.capture.script;
    let parsed = incoming;
    let scope = incoming.units.map((unit) => unit.label);
    const comparisons = [];
    if (request.mode === 'partial') {
      scope = request.scope;
      assert(Array.isArray(scope) && scope.length && new Set(scope).size === scope.length, 'Partial refresh requires unique exact scope IDs');
      const patches = scope.map((label) => {
        const local = current.units.find((unit) => unit.label === label);
        const remote = incoming.units.find((unit) => unit.label === label);
        assert(local && remote, `Scope ${label} is missing/deleted or ambiguous; resolve its boundaries before updating. Candidates: ${JSON.stringify(incoming.scenes.map(({ label, position, header }) => ({ label, position, header })))}`);
        const baseline = sourceUnit(root, state.source, label);
        comparisons.push({ scope: label, baseline_sha256: hash(baseline.text), local_sha256: hash(local.text), incoming_sha256: hash(remote.text), local_changed: local.text !== baseline.text, source_changed: remote.text !== baseline.text });
        return { ...local, text: remote.text };
      }).sort((a, b) => b.start - a.start);
      body = current.body;
      for (const patch of patches) body = body.slice(0, patch.start) + patch.text + body.slice(patch.end);
      // Identity follows the explicit target range even if its title changed.
      const bindings = Object.fromEntries(current.scenes.map((scene) => [scene.position, scene.label]));
      parsed = segments(body, sceneOptions(state, current.scenes, bindings));
      const unintended = difference(current.units, parsed.units).filter((label) => !scope.includes(label));
      assert(unintended.length === 0, `Partial update changed non-target ranges: ${unintended.join(', ')}`);
    }
    const import_id = randomUUID();
    const directory = `archives/1_story/notion_imports/${page}`;
    const snapshot = writeAtomic(root, `${directory}/${import_id}.md`, request.capture.script);
    const { script, ...captureMetadata } = request.capture;
    const capture = writeAtomic(root, `${directory}/${import_id}.json`, json({ ...captureMetadata, scene_map: incoming.scenes, numbering }));
    hooks.onPhase?.('after_snapshot');
    const entry = { import_id, imported_at: now(), snapshot, capture, mode: request.mode, scope, authorization: request.authorization };
    const source = sameSource ? clone(state.source) : { type: 'notion', page_id: page, url: request.capture.source.url, imports: [], baselines: {} };
    source.imports.push(entry);
    source.last_explicit_import = entry.imported_at;
    source.last_source_version = request.capture.source.version ?? null;
    source.last_update_scope = scope;
    if (request.mode !== 'partial') source.baselines = {};
    for (const label of scope) {
      const unit = incoming.units.find((item) => item.label === label);
      source.baselines[label] = { import_id, sha256: hash(unit.text), scene: incoming.scenes.find((item) => item.label === label) ?? null };
    }
    if (state.source && !sameSource) state.source_history.push(state.source);
    state.source = source;
    const saved = saveScript(root, state, body, current.header, parsed, hooks, numbering);
    entry.result_script = { key: refKey(saved.ref), sha256: saved.ref.sha256 };
    const affected = difference(current.units, parsed.units);
    return commit(root, previous, state, { operation: `notion-${request.mode}`, changed: saved.changed, scope, affected, comparisons, requires_review: saved.changed ? affected : [] }, hooks);
  });
}

export function resolveArtifact(root, request) {
  const state = readState(root);
  let ref;
  if (request.kind === 'working') ref = state.working_script;
  else if (request.kind === 'production') {
    assert(state.production_inputs, 'No selected production input; same-version audit and decision are required');
    ref = state.production_inputs.script;
    if (request.expected_script_sha256) assert(ref.sha256 === request.expected_script_sha256, 'Requested script is not the selected production version; audit and accept that version first');
    if (request.scope) assert(state.production_inputs.scope.includes('*') || request.scope.every((scene) => state.production_inputs.scope.includes(scene)), 'Requested Scene scope is not covered by the production decision');
    for (const key of ['audit', 'decision']) readReference(root, state.production_inputs[key]);
  } else ref = state.artifacts[request.key];
  assert(ref, 'Artifact selection is missing; use working, production, or an exact artifact key');
  return { ...ref, resolved_path: readReference(root, ref).path };
}

export function selectProduction(root, request, hooks = {}) {
  return withLock(root, () => {
    const previous = readState(root);
    const state = clone(previous);
    const script = Object.values(state.artifacts).find((item) => item.kind === 'script' && item.sha256 === request.script_sha256);
    assert(script, 'Select a registered script by its exact hash');
    readReference(root, script);
    const auditPath = request.audit?.path;
    assert(/^(deliverables|archives)\/1_story\/01_audit_report_v[1-9]\d*\.md$/.test(auditPath ?? ''), 'An exact same-version audit report is required');
    const auditText = fs.readFileSync(localPath(root, auditPath), 'utf8');
    let audit = { ...metadata(auditText, auditPath, 'audit'), path: auditPath, sha256: hash(auditText) };
    assert(audit.artifact_id, 'Production audit needs an Artifact header with an id');
    assert(audit.version === script.version && request.audit.script_sha256 === script.sha256, 'Audit is not bound to this script version and hash');
    assert(request.audit.sha256 === audit.sha256, 'Audit SHA-256 is missing or stale');
    assert(request.audit.coverage === 'full', 'New version requires a complete traceable audit conclusion, including explicitly reused evidence');
    assert(Array.isArray(request.audit.unresolved_p0_p1) && request.audit.unresolved_p0_p1.length === 0, 'Unresolved or unspecified P0/P1 block production');
    const decision = request.authorization;
    assert(['interactive', 'autonomous'].includes(decision?.mode), 'A production decision mode is required');
    assert(typeof decision.evidence === 'string' && decision.evidence.trim(), 'Record actual acceptance or autonomous scope evidence');
    assert(Number.isFinite(Date.parse(decision.recorded_at)), 'Decision timestamp is required');
    assert(decision.script_sha256 === script.sha256 && decision.audit_sha256 === audit.sha256, 'Decision does not cover the selected script/audit hashes');
    assert(Array.isArray(decision.scope) && decision.scope.length && new Set(decision.scope).size === decision.scope.length, 'Decision requires an exact scope');
    assert(decision.scope.every((label) => label === '*' || script.scene_map.some((scene) => scene.label === label)), 'Decision names an unknown Scene');
    if (decision.mode === 'autonomous') assert(Array.isArray(request.audit.unresolved_downstream_p2) && request.audit.unresolved_downstream_p2.length === 0, 'Autonomous production requires downstream P2 repair evidence');
    const existingAudit = state.artifacts[refKey(audit)];
    assert(!existingAudit || existingAudit.sha256 === audit.sha256, 'Audit identity/version already has different registered content');
    if (existingAudit) audit = existingAudit;
    const decision_id = randomUUID();
    const evidence = writeAtomic(root, `deliverables/0_admin/script_decisions/${decision_id}.json`, json({ script, audit: { ...request.audit, ref: audit }, authorization: decision }));
    const decisionRef = { ...evidence, artifact_id: `decision-${decision_id}`, version: script.version, kind: 'decision' };
    state.artifacts[refKey(audit)] = audit;
    state.artifacts[refKey(decisionRef)] = decisionRef;
    state.production_inputs = { script, audit, decision: decisionRef, mode: decision.mode, scope: decision.scope };
    return commit(root, previous, state, { operation: 'select-production', changed: false, selected: refKey(script) }, hooks);
  });
}

export function archiveArtifact(root, request, hooks = {}) {
  return withLock(root, () => {
    const previous = readState(root);
    const state = clone(previous);
    const ref = state.artifacts[request.key];
    assert(ref && ['script', 'audit'].includes(ref.kind), 'Archive an exact registered script or audit key');
    const original = ref.path;
    const current = readReference(root, ref);
    if (original.startsWith('archives/')) return { state, change: { operation: 'archive', changed: false } };
    const archived = original.replace(/^deliverables\//, 'archives/');
    if (fs.existsSync(localPath(root, archived))) readReference(root, { path: archived, sha256: ref.sha256 });
    else writeAtomic(root, archived, current.content);
    hooks.onPhase?.('after_archive_copy');
    const replacePaths = (value) => {
      if (!value || typeof value !== 'object') return;
      if (value.path === original && value.sha256 === ref.sha256) value.path = archived;
      for (const child of Object.values(value)) replacePaths(child);
    };
    replacePaths(state);
    const result = commit(root, previous, state, { operation: 'archive', changed: false, original, archived }, hooks);
    // Old manifests and Markdown/HTML links keep working at their original path.
    readReference(root, { path: original, sha256: ref.sha256 });
    const alias = `${localPath(root, original)}.${randomUUID()}.tmp`;
    fs.symlinkSync(path.relative(path.dirname(localPath(root, original)), localPath(root, archived)), alias);
    fs.renameSync(alias, localPath(root, original));
    syncDirectory(path.dirname(localPath(root, original)));
    return result;
  });
}

export function status(root) {
  const state = readState(root, { optional: true });
  if (!state) return { initialized: false, candidates: scriptCandidates(root),
    recovery_evidence: fs.existsSync(localPath(root, PREVIOUS_PATH)) || fs.existsSync(localPath(root, 'archives/1_story/notion_imports')) };
  validateReferences(root, state);
  const known = new Set(Object.values(state.artifacts).filter((ref) => ref.kind === 'script').map((ref) => path.basename(ref.path)));
  return { initialized: true, state, unregistered_scripts: scriptCandidates(root).filter((candidate) => !known.has(path.basename(candidate))) };
}

export function recover(root, { restore_previous = false } = {}) {
  const file = localPath(root, LOCK_PATH);
  if (fs.existsSync(file)) {
    const lock = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert(lock.hostname === os.hostname() && Number.isSafeInteger(lock.pid) && lock.pid > 0, 'Cannot verify lock owner; inspect the writer before recovery');
    let alive = true;
    try { process.kill(lock.pid, 0); } catch (error) { if (error.code === 'ESRCH') alive = false; else throw error; }
    assert(!alive, `Writer process ${lock.pid} is still active`);
    fs.unlinkSync(file);
  }
  return withLock(root, () => {
    if (restore_previous) {
      const backup = JSON.parse(fs.readFileSync(localPath(root, PREVIOUS_PATH), 'utf8'));
      validateStateShape(backup);
      validateReferences(root, backup);
      const currentPath = localPath(root, STATE_PATH);
      if (fs.existsSync(currentPath)) writeAtomic(root, `deliverables/0_admin/recovery/${randomUUID()}.json`, fs.readFileSync(currentPath, 'utf8'));
      writeAtomic(root, STATE_PATH, json(backup), { replace: true });
    }
    // Uncommitted candidate files remain recoverable, but are never promoted.
    return status(root);
  });
}
