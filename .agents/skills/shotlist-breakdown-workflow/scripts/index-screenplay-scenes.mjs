#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SLUGLINE_RE = /^(?:\d+[A-Z]?[.)]?\s+)?(?:INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.|I\/E\.)\s+\S/i;
const EXPLICIT_SCENE_RE = /^(\d+)([A-Z]?)[.)]?\s+(?=(?:INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.|I\/E\.)\s+)/i;
const CHINESE_SCENE_RE = /^第\s*(\d+)([A-Z]?)\s*场(?:\s*[·.、:：-]\s*|\s+)\S/i;

function sceneHeading(value) {
  const markdown = value.match(/^(#{1,6})\s+(.+)$/);
  const text = markdown ? markdown[2] : value;
  if (!SLUGLINE_RE.test(text) && !CHINESE_SCENE_RE.test(text) && !/^场景[：:]/.test(text)) return null;
  return { header: value, headingLevel: markdown?.[1].length ?? null, explicitLabel: explicitSceneLabel(text) };
}

function explicitSceneLabel(header) {
  const match = header.match(EXPLICIT_SCENE_RE) ?? header.match(CHINESE_SCENE_RE);
  if (!match) return null;
  return `scene-${String(Number(match[1])).padStart(3, '0')}${match[2].toLowerCase()}`;
}

function lastContentIndex(lines, start, end) {
  let last = end;
  for (let index = start; index <= end; index += 1) {
    if (/^```/.test(lines[index]?.trim() ?? '')) {
      last = index - 1;
      break;
    }
  }
  while (last >= start && !(lines[last]?.trim())) last -= 1;
  return last;
}

function firstContent(lines, start, end) {
  for (let index = start; index <= end; index += 1) {
    const value = lines[index]?.trim();
    if (value && !/^```/.test(value)) return value;
  }
  return '';
}

// Position is presentation order, never identity once a mapping exists.
export function assignSceneLabels(headings, { previousScenes, reservedLabels = [], bindings = {}, allowUnmapped = false } = {}) {
  const previous = previousScenes ?? [];
  const used = new Set();
  const reserved = new Set([...reservedLabels, ...previous.map((scene) => scene.label)]);
  const labels = new Array(headings.length);
  const claim = (index, label) => {
    if (!/^scene-\d+[a-z]?$/.test(label) || used.has(label)) {
      throw new Error(`Invalid or duplicate Scene identity: ${label}; position ${index + 1}`);
    }
    labels[index] = label;
    used.add(label);
    reserved.add(label);
  };
  for (const key of Object.keys(bindings)) {
    if (!/^[1-9]\d*$/.test(key) || Number(key) > headings.length) throw new Error(`Invalid Scene binding position: ${key}`);
  }
  headings.forEach((heading, index) => {
    const binding = bindings[index + 1];
    if (heading.explicitLabel) {
      if (binding && binding !== heading.explicitLabel) throw new Error(`Binding contradicts source Scene ID at ${index + 1}`);
      claim(index, heading.explicitLabel);
    } else if (binding && binding !== 'new') {
      if (!previous.some((scene) => scene.label === binding)) throw new Error(`Unknown previous Scene binding: ${binding}`);
      claim(index, binding);
    }
  });
  // A unique unchanged title, or a uniquely unchanged body after a title edit,
  // can retain identity. Duplicate candidates require explicit bindings.
  for (const field of ['matchHeader', 'contentHash']) {
    headings.forEach((heading, index) => {
      if (labels[index] || bindings[index + 1] === 'new') return;
      const candidates = previous.filter((scene) => (field === 'matchHeader' ? scene.matchHeader ?? scene.header : scene[field]) === heading[field]);
      const peers = headings.filter((scene) => scene[field] === heading[field]);
      if (candidates.length === 1 && peers.length === 1 && !used.has(candidates[0].label)) claim(index, candidates[0].label);
    });
  }
  const unresolved = headings.flatMap((heading, index) => labels[index] || bindings[index + 1] === 'new' ? [] : [{ ...heading, position: index + 1 }]);
  const unmatchedPrevious = previous.filter((scene) => !used.has(scene.label));
  const ambiguous = previous.length ? unresolved.filter((heading) =>
    headings.filter((other) => other.matchHeader === heading.matchHeader).length > 1
    || previous.some((other) => (other.matchHeader ?? other.header) === heading.matchHeader)
    || (previousScenes !== undefined && unmatchedPrevious.length > 0)) : [];
  if (ambiguous.length && !allowUnmapped) {
    throw new Error(`Ambiguous Scene mapping; provide bindings by position (existing label or "new"). Candidates: ${JSON.stringify({ incoming: ambiguous.map(({ position, header }) => ({ position, header })), previous: unmatchedPrevious.map(({ label, header }) => ({ label, header })) })}`);
  }
  let next = Math.max(0, ...[...reserved].map((label) => Number(label.match(/^scene-(\d+)/)?.[1] ?? 0))) + 1;
  headings.forEach((_, index) => {
    if (!labels[index]) claim(index, `scene-${String(next++).padStart(3, '0')}`);
  });
  return labels;
}

export function parseScreenplay(source, sourcePath = '<memory>', options = {}) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const offsets = [0];
  for (const match of source.matchAll(/\r\n|\r|\n/g)) offsets.push(match.index + match[0].length);
  const headings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const value = lines[index].trim();
    const heading = sceneHeading(value);
    if (heading) headings.push({ index, ...heading });
  }

  if (headings.length === 0) {
    throw new Error(`No screenplay sluglines found in ${sourcePath}`);
  }

  const explicitCount = headings.filter((heading) => heading.explicitLabel).length;
  if (explicitCount > 0 && explicitCount !== headings.length) {
    throw new Error(`Mixed numbered and unnumbered sluglines in ${sourcePath}; normalize Scene IDs before indexing`);
  }
  headings.forEach((heading, index) => {
    let boundary = headings[index + 1]?.index ?? lines.length;
    // A final Markdown Scene must not absorb a following shot table or notes.
    if (index === headings.length - 1 && heading.headingLevel) {
      const nextSection = lines.findIndex((line, i) => i > heading.index && /^(#{1,6})\s+/.test(line.trim()) && line.trim().match(/^(#+)/)[1].length <= heading.headingLevel);
      if (nextSection >= 0) boundary = nextSection;
    }
    heading.boundary = boundary;
    const end = lastContentIndex(lines, heading.index, boundary - 1);
    heading.contentHash = createHash('sha256').update(lines.slice(heading.index + 1, end + 1).join('\n')).digest('hex');
    heading.matchHeader = options.numbering === 'positional' ? heading.header.replace(EXPLICIT_SCENE_RE, '') : heading.header;
    if (options.numbering === 'positional') heading.explicitLabel = null;
  });
  const labels = assignSceneLabels(headings, options);
  if (new Set(labels).size !== labels.length) {
    throw new Error(`Duplicate explicit Scene IDs in ${sourcePath}`);
  }

  const scenes = headings.map((heading, sceneIndex) => {
    const nextHeading = headings[sceneIndex + 1];
    const finalIndex = lastContentIndex(
      lines,
      heading.index,
      heading.boundary - 1,
    );
    const label = labels[sceneIndex];
    const startLine = heading.index + 1;
    // For non-final Scenes, include the blank separator immediately before the
    // next slugline in the stable source range. Keep closingLine/body trimmed.
    const endLine = nextHeading ? nextHeading.index : Math.max(startLine, finalIndex + 1);

    return {
      label,
      position: sceneIndex + 1,
      header: heading.header,
      startLine,
      endLine,
      startOffset: offsets[heading.index],
      endOffset: offsets[endLine] ?? source.length,
      contentHash: heading.contentHash,
      matchHeader: heading.matchHeader,
      previous: sceneIndex > 0 ? labels[sceneIndex - 1] : null,
      next: nextHeading ? labels[sceneIndex + 1] : null,
      openingLine: firstContent(lines, heading.index + 1, finalIndex),
      closingLine: finalIndex > heading.index ? lines[finalIndex].trim() : '',
      body: lines.slice(heading.index, finalIndex + 1).join('\n'),
    };
  });

  return {
    sourcePath: path.resolve(sourcePath),
    sha256: createHash('sha256').update(source).digest('hex'),
    sceneCount: scenes.length,
    labelMode: explicitCount === headings.length && options.numbering !== 'positional' ? 'source' : options.previousScenes ? 'persistent_mapping' : 'initial_order',
    scenes,
  };
}

export async function indexRegisteredScript(source, sourcePath, statePath) {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  if (state.schema_version !== 1) throw new Error('Unsupported workflow state schema');
  const hash = createHash('sha256').update(source).digest('hex');
  const ref = Object.values(state.artifacts ?? {}).find((artifact) => artifact.kind === 'script' && artifact.sha256 === hash);
  if (!ref) throw new Error(`Script is not registered at this hash: ${sourcePath}`);
  const previousScenes = ref.scene_map ?? [];
  const bindings = Object.fromEntries(previousScenes.map((scene) => [scene.position, scene.label]));
  return parseScreenplay(source, sourcePath, { previousScenes, bindings, numbering: ref.numbering });
}

function parseArgs(argv) {
  const args = { scriptPath: null, selectedScene: null, json: false, statePath: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      args.json = true;
    } else if (arg === '--state') {
      args.statePath = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--scene') {
      args.selectedScene = argv[index + 1] ?? null;
      index += 1;
    } else if (!arg.startsWith('-') && !args.scriptPath) {
      args.scriptPath = arg;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }
  if (!args.scriptPath) {
    throw new Error('Usage: index-screenplay-scenes.mjs <script-path> [--state <workflow_state.json>] [--scene scene-001] [--json]');
  }
  return args;
}

function escapeCell(value) {
  return String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function printMarkdown(index, selectedScene) {
  const selected = selectedScene
    ? index.scenes.find((scene) => scene.label === selectedScene)
    : null;
  if (selectedScene && !selected) throw new Error(`Scene not found: ${selectedScene}`);

  console.log(`# Screenplay Scene Index`);
  console.log(`- source: \`${index.sourcePath}\``);
  console.log(`- sha256: \`${index.sha256}\``);
  console.log(`- scene_count: ${index.sceneCount}`);
  console.log(`- label_mode: ${index.labelMode}`);
  console.log('');
  console.log('| Scene | Position | Lines | Header | Previous | Next |');
  console.log('| --- | ---: | --- | --- | --- | --- |');
  for (const scene of selected ? [selected] : index.scenes) {
    console.log(`| ${scene.label} | ${scene.position}/${index.sceneCount} | L${scene.startLine}–L${scene.endLine} | ${escapeCell(scene.header)} | ${scene.previous ?? '—'} | ${scene.next ?? '—'} |`);
  }

  if (selected) {
    console.log('');
    console.log(`## ${selected.label}`);
    console.log(`- opening: ${selected.openingLine || '—'}`);
    console.log(`- closing: ${selected.closingLine || '—'}`);
    console.log('');
    console.log('```text');
    console.log(selected.body);
    console.log('```');
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = await readFile(args.scriptPath, 'utf8');
  const index = args.statePath
    ? await indexRegisteredScript(source, args.scriptPath, args.statePath)
    : parseScreenplay(source, args.scriptPath);

  if (args.json) {
    const value = args.selectedScene
      ? { ...index, scenes: index.scenes.filter((scene) => scene.label === args.selectedScene) }
      : index;
    if (args.selectedScene && value.scenes.length === 0) {
      throw new Error(`Scene not found: ${args.selectedScene}`);
    }
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  printMarkdown(index, args.selectedScene);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
