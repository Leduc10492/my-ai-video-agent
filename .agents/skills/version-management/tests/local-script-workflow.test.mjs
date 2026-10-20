import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { STATE_PATH, hash, readState, initialize, selectWorking, importNotion, editLocal,
  selectProduction, resolveArtifact, archiveArtifact, status, recover } from '../scripts/script-store.mjs';
import { indexRegisteredScript } from '../../shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs';

const moduleURL = new URL('../scripts/script-store.mjs', import.meta.url).href;
const cli = fileURLToPath(new URL('../scripts/workflow-state.mjs', import.meta.url));
const source = '# 测试剧本\n\n1 INT. 甲室 - 日\n甲\n原话甲。\n\n2 EXT. 乙街 - 夜\n乙\n原话乙。\n\n3 INT. 丙屋 - 日\n丙\n原话丙。\n';
const page = '0123456789abcdef0123456789abcdef';
const artifact = (body, version = 7, id = 'A-test-script') => `# Artifact: 剧本\n- id: ${id}\n- version: v${version}\n- upstream: []\n- locks: []\n\n---\n\n${body}`;
const read = (root, relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const write = (root, relative, content) => {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), content);
};
function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'local-script-workflow-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  write(root, 'deliverables/0_admin/locks.md', '# Locks\n');
  return root;
}
function capture(script = source) {
  return { source: { type: 'notion', page_id: page, url: `https://www.notion.so/${page}`, version: 'test-revision' },
    script, complete: { body: true, pagination: true, children: true, properties: true, appendices: true },
    read_at: '2026-09-13T00:00:00Z', read_evidence: 'Synthetic connector receipt for deterministic tests only',
    properties: { LUT: 'Test.cube', 'Style Prefix': '@Loc-A 原始控制串', asset_origin: 'user_provided' },
    attachments: [{ url: 'https://example.invalid/reference.png', status: 'unavailable', reason: 'Test fixture has no media' }] };
}
function initial(root, text = source, extras = {}) {
  return importNotion(root, { mode: 'initial', capture: capture(text), authorization: '测试首次导入', ...extras });
}
const working = (root) => readState(root).working_script;
const expected = (root) => ({ expected_sha256: working(root).sha256 });
const localText = (root) => read(root, resolveArtifact(root, { kind: 'working' }).resolved_path);
const body = (root) => localText(root).split('\n---\n\n').slice(1).join('\n---\n\n');
const scriptFiles = (root) => fs.readdirSync(path.join(root, 'deliverables/1_story')).filter((name) => /^01_script_v\d+\.md$/.test(name));
function refresh(root, text, scope, extras = {}) {
  return importNotion(root, { mode: scope ? 'partial' : 'full', capture: capture(text), scope,
    ...expected(root), authorization: scope ? '测试只按 Notion 更新指定场景' : '测试全部按 Notion 更新', ...extras });
}
function edit(root, before = '原话甲。', after = '本地甲。', scope = 'scene-001') {
  return editLocal(root, { ...expected(root), edits: [{ before, after, scope }] });
}
function accept(root, overrides = {}) {
  const ref = working(root);
  const auditPath = `deliverables/1_story/01_audit_report_v${ref.version}.md`;
  const auditText = artifact('# 测试审核\n全剧覆盖，无 P0/P1。本例为测试输入，不是实际创作结论。\n', ref.version, 'A-test-audit');
  write(root, auditPath, auditText);
  const request = { script_sha256: ref.sha256,
    audit: { path: auditPath, sha256: hash(auditText), script_sha256: ref.sha256, coverage: 'full', unresolved_p0_p1: [], unresolved_downstream_p2: [] },
    authorization: { mode: 'interactive', script_sha256: ref.sha256, audit_sha256: hash(auditText),
      scope: ['scene-001'], recorded_at: '2026-09-13T01:00:00Z', evidence: 'Synthetic acceptance for this test scope only' }, ...overrides };
  return selectProduction(root, request);
}

test('A1: complete import preserves raw body, exact tags, properties and unavailable attachments', (t) => {
  const root = workspace(t);
  const original = source.replaceAll('\n', '\r\n') + '\r\n@char_测试 TAG 大小写保留\r\n';
  const result = initial(root, original);
  assert.equal(body(root), original);
  assert.equal(result.state.production_inputs, null);
  const entry = result.state.source.imports[0];
  assert.equal(read(root, entry.snapshot.path), original);
  assert.equal(hash(read(root, entry.snapshot.path)), entry.snapshot.sha256);
  const receipt = JSON.parse(read(root, entry.capture.path));
  assert.deepEqual(receipt.properties, capture().properties);
  assert.deepEqual(receipt.attachments, capture().attachments);
  assert.equal(result.state.working_script.version, 1);
});

test('A2/A3: continue, resolve and local edits work without any remote access', (t) => {
  const root = workspace(t);
  initial(root);
  const remoteOnly = capture(source.replace('原话甲。', '远端未授权变化。'));
  const beforeSource = readState(root).source;
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Notion is offline; no network allowed'); };
  try {
    assert.equal(status(root).initialized, true);
    assert.ok(read(root, resolveArtifact(root, { kind: 'working' }).path).includes('原话甲。'));
    edit(root);
    assert.ok(body(root).includes('本地甲。'));
    assert.ok(!body(root).includes('远端未授权变化。'));
    assert.deepEqual(readState(root).source, beforeSource);
    assert.ok(remoteOnly.script.includes('远端未授权变化。'));
  } finally { globalThis.fetch = fetchBefore; }
});

test('A4: consecutive partial refreshes preserve other local bytes and independent adopted baselines', (t) => {
  const root = workspace(t);
  initial(root);
  const originalImport = readState(root).source.imports[0].import_id;
  edit(root, '原话乙。', '本地乙。', 'scene-002');
  edit(root, '原话丙。', '本地丙。', 'scene-003');
  const remote1 = source.replace('原话甲。', '远端甲一。').replace('原话乙。', '远端乙一。');
  const first = refresh(root, remote1, ['scene-001']);
  assert.equal(body(root), source.replace('原话甲。', '远端甲一。').replace('原话乙。', '本地乙。').replace('原话丙。', '本地丙。'));
  assert.equal(first.state.source.baselines['scene-002'].import_id, originalImport);
  const firstBaseline = first.state.source.baselines['scene-001'];
  const remote2 = source.replace('原话甲。', '远端甲二。').replace('原话乙。', '远端乙二。');
  const second = refresh(root, remote2, ['scene-002']);
  assert.equal(body(root), source.replace('原话甲。', '远端甲一。').replace('原话乙。', '远端乙二。').replace('原话丙。', '本地丙。'));
  assert.deepEqual(second.state.source.baselines['scene-001'], firstBaseline);
  assert.equal(second.change.comparisons[0].baseline_sha256, hash('2 EXT. 乙街 - 夜\n乙\n原话乙。\n\n'));
  assert.equal(second.change.comparisons[0].local_changed, true);
  assert.deepEqual(second.change.affected, ['scene-002']);
});

test('A5: full refresh preserves old version; explicit rollback never collides with archived version numbers', (t) => {
  const root = workspace(t);
  initial(root);
  edit(root);
  const old = working(root);
  const oldText = read(root, old.path);
  refresh(root, source.replace('原话丙。', '全量新版丙。'));
  assert.equal(body(root), source.replace('原话丙。', '全量新版丙。'));
  assert.equal(read(root, old.path), oldText);
  archiveArtifact(root, { key: `${old.artifact_id}@v${old.version}` });
  const archived = readState(root).artifacts[`${old.artifact_id}@v${old.version}`];
  selectWorking(root, { ...expected(root), script: archived.path });
  write(root, 'archives/1_story/01_script_v20.md', artifact(source, 20));
  edit(root, '本地甲。', '恢复后的甲。');
  assert.equal(working(root).version, 21);
  assert.ok(body(root).includes('恢复后的甲。'));
  assert.equal(read(root, old.path), oldText);
});

test('A6: identical refresh advances check/source record but creates no version or downstream invalidation', (t) => {
  const root = workspace(t);
  initial(root);
  const before = working(root);
  const result = refresh(root, source, ['scene-002']);
  assert.deepEqual(working(root), before);
  assert.equal(scriptFiles(root).length, 1);
  assert.equal(result.change.changed, false);
  assert.deepEqual(result.change.requires_review, []);
  assert.equal(result.state.source.imports.length, 2);
});

test('A6: local no-op does not make a version; ambiguous exact replacement and stale hash fail safely', (t) => {
  const root = workspace(t);
  initial(root);
  const before = read(root, STATE_PATH);
  assert.throws(() => editLocal(root, { ...expected(root), edits: [{ before: '原话', after: '替换' }] }), /ambiguous/);
  assert.equal(read(root, STATE_PATH), before);
  const old = expected(root);
  edit(root);
  assert.throws(() => editLocal(root, { ...old, edits: [{ before: '本地甲。', after: '过期改动。' }] }), /stale/);
  assert.equal(edit(root, '本地甲。', '本地甲。').change.changed, false);
  assert.equal(scriptFiles(root).length, 2);
});

test('A7: every incomplete connector receipt leaves the current state and script untouched', (t) => {
  const root = workspace(t);
  initial(root);
  const before = read(root, STATE_PATH);
  for (const key of ['body', 'pagination', 'children', 'properties', 'appendices']) {
    const packet = capture(source.replace('原话甲。', '不完整的新稿。'));
    packet.complete[key] = false;
    assert.throws(() => refresh(root, packet.script, null, { capture: packet }), /Incomplete/);
    assert.equal(read(root, STATE_PATH), before);
  }
  assert.equal(scriptFiles(root).length, 1);
});

for (const phase of ['after_snapshot', 'after_script', 'before_state', 'after_state']) {
  test(`A7: interrupted save at ${phase} leaves a complete committed version`, (t) => {
    const root = workspace(t);
    initial(root);
    const prior = working(root);
    const nextBody = source.replace('原话甲。', '中断后的甲。');
    assert.throws(() => importNotion(root, { mode: 'full', ...expected(root), capture: capture(nextBody), authorization: '测试全量更新' },
      { onPhase: (current) => { if (phase === current) throw new Error('Injected storage interruption'); } }), /Injected/);
    assert.equal(status(root).initialized, true);
    if (phase === 'after_state') assert.equal(body(root), nextBody);
    else assert.equal(working(root).sha256, prior.sha256);
    assert.equal(read(root, prior.path).includes('原话甲。'), true);
  });
}

test('A7: real process exit after writing candidate leaves old state; recover releases only a dead lock', (t) => {
  const root = workspace(t);
  initial(root);
  const prior = working(root);
  const program = `import { editLocal } from ${JSON.stringify(moduleURL)}; editLocal(${JSON.stringify(root)}, ${JSON.stringify({ ...expected(root), edits: [{ before: '原话甲。', after: '退出前甲。' }] })}, { onPhase: (phase) => { if (phase === 'after_script') process.exit(73); } });`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', program], { encoding: 'utf8' });
  assert.equal(result.status, 73, result.stderr);
  assert.equal(status(root).state.working_script.sha256, prior.sha256);
  assert.throws(() => edit(root), /lock exists/);
  const recovered = recover(root);
  assert.deepEqual(recovered.unregistered_scripts, ['deliverables/1_story/01_script_v2.md']);
  edit(root);
  assert.equal(working(root).version, 3);
  write(root, 'deliverables/0_admin/.workflow-state.lock', JSON.stringify({ pid: process.pid, hostname: os.hostname() }));
  assert.throws(() => recover(root), /still active/);
});

test('A7: corrupt state can explicitly restore verified previous state, retaining damaged state and all scripts', (t) => {
  const root = workspace(t);
  initial(root);
  const first = working(root);
  edit(root);
  write(root, STATE_PATH, '{damaged');
  assert.throws(() => status(root));
  const recovered = recover(root, { restore_previous: true });
  assert.equal(recovered.state.working_script.sha256, first.sha256);
  assert.equal(scriptFiles(root).length, 2);
  const saved = fs.readdirSync(path.join(root, 'deliverables/0_admin/recovery'));
  assert.equal(read(root, `deliverables/0_admin/recovery/${saved[0]}`), '{damaged');
});

test('A7: first-import interruption cannot be mistaken for automatic legacy migration', (t) => {
  const root = workspace(t);
  assert.throws(() => importNotion(root, { mode: 'initial', authorization: 'Synthetic initial import', capture: capture() }, { onPhase: (phase) => {
    if (phase === 'after_script') throw new Error('First import interrupted');
  } }), /interrupted/);
  assert.equal(recover(root).initialized, false);
  assert.equal(status(root).recovery_evidence, true);
  assert.throws(() => initialize(root), /Do not automatically promote/);
  // Explicit recovery reuses the verified candidate and capture, with no fetch.
  initialize(root, { script: 'deliverables/1_story/01_script_v1.md' });
  refresh(root, source);
  assert.equal(working(root).version, 1);
  assert.equal(readState(root).source.page_id, page);
});

test('A8: accepted v7 stays selected after v8 edit and script/audit archive; legacy links still resolve', (t) => {
  const root = workspace(t);
  write(root, 'deliverables/1_story/01_script_v7.md', artifact(source));
  initialize(root, { script: 'deliverables/1_story/01_script_v7.md' });
  accept(root);
  const selected = readState(root).production_inputs;
  const oldScript = read(root, selected.script.path);
  const oldAudit = read(root, selected.audit.path);
  edit(root);
  assert.equal(working(root).version, 8);
  assert.equal(resolveArtifact(root, { kind: 'production' }).version, 7);
  assert.throws(() => resolveArtifact(root, { kind: 'production', expected_script_sha256: working(root).sha256 }), /not the selected/);
  assert.throws(() => resolveArtifact(root, { kind: 'production', scope: ['scene-002'] }), /scope/);
  archiveArtifact(root, { key: `${selected.script.artifact_id}@v7` });
  archiveArtifact(root, { key: `${selected.audit.artifact_id}@v7` });
  assert.ok(resolveArtifact(root, { kind: 'production' }).resolved_path.startsWith('archives/'));
  assert.equal(read(root, selected.script.path), oldScript);
  assert.equal(read(root, selected.audit.path), oldAudit);
  assert.equal(readState(root).production_inputs.decision.sha256, selected.decision.sha256);
  assert.ok(fs.lstatSync(path.join(root, selected.script.path)).isSymbolicLink());
  assert.ok(body(root).includes('本地甲。'));
  // Selecting via a legacy alias must reuse the canonical registered reference.
  selectWorking(root, { ...expected(root), script: selected.script.path });
  assert.equal(status(root).state.working_script.sha256, selected.script.sha256);
  const evidence = JSON.parse(read(root, selected.decision.path));
  selectProduction(root, { script_sha256: selected.script.sha256, audit: evidence.audit, authorization: evidence.authorization });
  assert.equal(status(root).state.production_inputs.audit.path, 'archives/1_story/01_audit_report_v7.md');
});

test('A8: missing, stale, partial, blocking audits and hash/scope-free acceptance cannot select production', (t) => {
  const root = workspace(t);
  initial(root);
  assert.throws(() => selectProduction(root, { script_sha256: working(root).sha256 }), /audit/);
  assert.throws(() => accept(root, { authorization: { mode: 'interactive', evidence: 'unbound acceptance', recorded_at: '2026-09-13' } }), /hashes/);
  assert.equal(readState(root).production_inputs, null);
  accept(root);
  const evidence = JSON.parse(read(root, readState(root).production_inputs.decision.path));
  for (const replacement of [{ coverage: 'partial' }, { unresolved_p0_p1: ['P1'] }, { script_sha256: 'a'.repeat(64) }]) {
    assert.throws(() => selectProduction(root, { script_sha256: working(root).sha256, audit: { ...evidence.audit, ...replacement }, authorization: evidence.authorization }));
  }
});

test('A9: unnumbered insertion retains existing identities and registered index exposes persistent order', async (t) => {
  const root = workspace(t);
  const unnumbered = source.replace(/^\d+ /gm, '');
  initial(root, unnumbered);
  refresh(root, unnumbered.replace('INT. 甲室', 'INT. 新房 - 早\n新动作。\n\nINT. 甲室'));
  assert.deepEqual(working(root).scene_map.map((scene) => scene.label), ['scene-004', 'scene-001', 'scene-002', 'scene-003']);
  const ref = working(root);
  const index = await indexRegisteredScript(read(root, ref.path), path.join(root, ref.path), path.join(root, STATE_PATH));
  assert.deepEqual(index.scenes.map((scene) => scene.label), ['scene-004', 'scene-001', 'scene-002', 'scene-003']);
});

test('A9: positional numbers may change after insertion without changing Scene identities', (t) => {
  const root = workspace(t);
  initial(root, source, { numbering: 'positional' });
  const revised = '1 INT. 新房 - 早\n新动作。\n\n' + source.replace(/^([1-3]) /gm, (_, number) => `${Number(number) + 1} `);
  refresh(root, revised);
  assert.deepEqual(working(root).scene_map.map((scene) => scene.label), ['scene-004', 'scene-001', 'scene-002', 'scene-003']);
});

test('A9: duplicate titles with indistinguishable bodies require explicit bindings and preserve old state', (t) => {
  const root = workspace(t);
  const repeated = 'INT. 同室 - 日\n相同动作。\n\nINT. 同室 - 日\n相同动作。\n';
  initial(root, repeated);
  const previous = read(root, STATE_PATH);
  assert.throws(() => refresh(root, repeated.replaceAll('相同动作。', '改变动作。')), /Ambiguous Scene mapping.*Candidates/);
  assert.equal(read(root, STATE_PATH), previous);
  refresh(root, repeated.replaceAll('相同动作。', '改变动作。'), null, { scene_bindings: { 1: 'scene-001', 2: 'scene-002' } });
  assert.deepEqual(working(root).scene_map.map((scene) => scene.label), ['scene-001', 'scene-002']);
});

test('A9/A6: an unchanged duplicate-title snapshot and exact local dialogue edit retain identities', (t) => {
  const root = workspace(t);
  const repeated = 'INT. 同室 - 日\n相同台词。\n\nINT. 同室 - 日\n相同台词。\n';
  initial(root, repeated);
  assert.equal(refresh(root, repeated).change.changed, false);
  edit(root, '相同台词。', '指定改词。', 'scene-002');
  assert.equal(body(root), 'INT. 同室 - 日\n相同台词。\n\nINT. 同室 - 日\n指定改词。\n');
  assert.deepEqual(working(root).scene_map.map((scene) => scene.label), ['scene-001', 'scene-002']);
});

test('A4: ambiguous unselected source scenes do not block a uniquely selected partial update', (t) => {
  const root = workspace(t);
  const unnumbered = source.replace(/^\d+ /gm, '');
  initial(root, unnumbered);
  const incoming = unnumbered.replace('原话甲。', '只采用甲。').replace('EXT. 乙街 - 夜\n乙\n原话乙。', 'INT. 新标题 - 日\n相同新动作。').replace('INT. 丙屋 - 日\n丙\n原话丙。', 'INT. 新标题 - 日\n相同新动作。');
  const before = readState(root).source.baselines['scene-002'];
  refresh(root, incoming, ['scene-001']);
  assert.equal(body(root), unnumbered.replace('原话甲。', '只采用甲。'));
  assert.deepEqual(readState(root).source.baselines['scene-002'], before);
  assert.equal(refresh(root, incoming, ['scene-001']).change.changed, false);
});

test('archive failure before reference switch keeps the original and can be retried', (t) => {
  const root = workspace(t);
  initial(root);
  const ref = working(root);
  const before = read(root, STATE_PATH);
  assert.throws(() => archiveArtifact(root, { key: `${ref.artifact_id}@v${ref.version}` }, { onPhase: (phase) => {
    if (phase === 'after_archive_copy') throw new Error('Interrupted archive');
  } }), /Interrupted/);
  assert.equal(read(root, STATE_PATH), before);
  assert.equal(hash(read(root, ref.path)), ref.sha256);
  archiveArtifact(root, { key: `${ref.artifact_id}@v${ref.version}` });
  assert.equal(status(root).initialized, true);
  assert.equal(hash(read(root, ref.path)), ref.sha256);
});

test('legacy migration lists multiple candidates and never assumes the highest is accepted', (t) => {
  const root = workspace(t);
  write(root, 'deliverables/1_story/01_script_v7.md', artifact(source));
  write(root, 'deliverables/1_story/01_script_v8.md', artifact(source, 8));
  assert.throws(() => initialize(root), /ambiguous.*v7.*v8/);
  assert.equal(status(root).initialized, false);
  initialize(root, { script: 'deliverables/1_story/01_script_v7.md' });
  assert.equal(working(root).version, 7);
  assert.equal(readState(root).production_inputs, null);
  assert.throws(() => initial(root), /already exist/);
});

test('external local modifications are preserved and stale registered hashes block writes', (t) => {
  const root = workspace(t);
  initial(root);
  const ref = working(root);
  const external = read(root, ref.path).replace('原话甲。', '用户外部编辑。');
  write(root, ref.path, external);
  assert.throws(() => edit(root), /Hash mismatch/);
  assert.equal(read(root, ref.path), external);
});

test('different Notion page requires explicit full replacement, never accidental partial rebinding', (t) => {
  const root = workspace(t);
  initial(root);
  const packet = capture();
  packet.source.page_id = 'a'.repeat(32);
  packet.source.url = `https://www.notion.so/${packet.source.page_id}`;
  assert.throws(() => refresh(root, source, ['scene-001'], { capture: packet }), /Different Notion page/);
  assert.throws(() => refresh(root, source, null, { capture: packet }), /Different Notion page/);
  refresh(root, source, null, { capture: packet, replace_source: true });
  assert.equal(readState(root).source.page_id, packet.source.page_id);
  assert.equal(readState(root).source_history[0].page_id, page);
  assert.equal(read(root, readState(root).source_history[0].imports[0].snapshot.path), source);
});

test('CLI can resolve local state from another cwd and rejects missing explicit mutation input', (t) => {
  const root = workspace(t);
  initial(root);
  write(root, 'resolve.json', JSON.stringify({ kind: 'working' }));
  const result = spawnSync(process.execPath, [cli, 'resolve', '--root', root, '--request', path.join(root, 'resolve.json')], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).sha256, working(root).sha256);
  const rejected = spawnSync(process.execPath, [cli, 'import', '--root', root], { encoding: 'utf8' });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /requires --request/);
});
