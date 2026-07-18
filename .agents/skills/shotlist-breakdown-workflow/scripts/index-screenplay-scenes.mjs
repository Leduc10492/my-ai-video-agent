#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SLUGLINE_RE = /^(?:\d+[A-Z]?[.)]?\s+)?(?:INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.|I\/E\.)\s+\S/i;
const EXPLICIT_SCENE_RE = /^(\d+)([A-Z]?)[.)]?\s+(?=(?:INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.|I\/E\.)\s+)/i;

function explicitSceneLabel(header) {
  const match = header.match(EXPLICIT_SCENE_RE);
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

export function parseScreenplay(source, sourcePath = '<memory>') {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const headings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const value = lines[index].trim();
    if (SLUGLINE_RE.test(value)) headings.push({ index, header: value, explicitLabel: explicitSceneLabel(value) });
  }

  if (headings.length === 0) {
    throw new Error(`No screenplay sluglines found in ${sourcePath}`);
  }

  const explicitCount = headings.filter((heading) => heading.explicitLabel).length;
  if (explicitCount > 0 && explicitCount !== headings.length) {
    throw new Error(`Mixed numbered and unnumbered sluglines in ${sourcePath}; normalize Scene IDs before indexing`);
  }
  const labels = explicitCount === headings.length
    ? headings.map((heading) => heading.explicitLabel)
    : headings.map((_, sceneIndex) => `scene-${String(sceneIndex + 1).padStart(3, '0')}`);
  if (new Set(labels).size !== labels.length) {
    throw new Error(`Duplicate explicit Scene IDs in ${sourcePath}`);
  }

  const scenes = headings.map((heading, sceneIndex) => {
    const nextHeading = headings[sceneIndex + 1];
    const finalIndex = lastContentIndex(
      lines,
      heading.index,
      nextHeading ? nextHeading.index - 1 : lines.length - 1,
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
    labelMode: explicitCount === headings.length ? 'source' : 'derived_from_order',
    scenes,
  };
}

function parseArgs(argv) {
  const args = { scriptPath: null, selectedScene: null, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') {
      args.json = true;
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
    throw new Error('Usage: index-screenplay-scenes.mjs <script-path> [--scene scene-001] [--json]');
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
  const index = parseScreenplay(source, args.scriptPath);

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
