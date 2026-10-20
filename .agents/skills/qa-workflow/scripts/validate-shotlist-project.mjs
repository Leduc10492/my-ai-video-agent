#!/usr/bin/env node

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseScreenplay, indexRegisteredScript } from '../../shotlist-breakdown-workflow/scripts/index-screenplay-scenes.mjs';

const CUE_RE = /^[A-Z][A-Z0-9 ./'&()’\-]*$/;
const GENERIC_ADDRESSEE_RE = /^(?:场景内明确听者|明确听者|对话对象|本Scene动作对象或对话对象)$/i;

function parseArgs(argv) {
  const args = { scriptPath: null, shotlistRoot: null, requireComplete: false, statePath: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--script') {
      args.scriptPath = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--state') {
      args.statePath = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--shotlist-root') {
      args.shotlistRoot = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === '--require-complete') {
      args.requireComplete = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }
  if (!args.scriptPath || !args.shotlistRoot) {
    throw new Error('Usage: validate-shotlist-project.mjs --script <script-path> --shotlist-root <deliverables/3_shotlist> [--state <workflow_state.json>] [--require-complete]');
  }
  return {
    scriptPath: path.resolve(args.scriptPath),
    shotlistRoot: path.resolve(args.shotlistRoot),
    requireComplete: args.requireComplete,
    statePath: args.statePath ? path.resolve(args.statePath) : null,
  };
}

function isSlugline(value) {
  return /^(?:\d+[A-Z]?[.)]?\s+)?(?:INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.|I\/E\.)\s+\S/i.test(value);
}

function isSpeakerCue(value) {
  if (!value || value.length > 80 || value.endsWith(':') || isSlugline(value)) return false;
  if (!/[A-Z]/.test(value) || value !== value.toUpperCase()) return false;
  return CUE_RE.test(value);
}

function extractSourceDialogue(scene) {
  const lines = scene.body.replace(/\r\n?/g, '\n').split('\n');
  const dialogue = [];

  for (let index = 1; index < lines.length - 1; index += 1) {
    const cue = lines[index].trim();
    if (!isSpeakerCue(cue)) continue;

    let cursor = index + 1;
    if (!lines[cursor]?.trim()) continue;
    if (/^\([^)]*\)$/.test(lines[cursor].trim())) cursor += 1;
    if (!lines[cursor]?.trim() || isSpeakerCue(lines[cursor].trim()) || isSlugline(lines[cursor].trim())) continue;

    const spoken = [];
    while (cursor < lines.length && lines[cursor].trim()) {
      if (cursor > index + 1 && isSpeakerCue(lines[cursor].trim())) break;
      spoken.push(lines[cursor].trim());
      cursor += 1;
    }
    if (spoken.length === 0) continue;

    dialogue.push({
      cue,
      text: spoken.join(' '),
      offscreen: /\((?:O\.S\.|V\.O\.)\)/.test(cue),
    });
    index = cursor - 1;
  }
  return dialogue;
}

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function allMatches(value, regex, group = 1) {
  return [...value.matchAll(regex)].map((match) => match[group]);
}

function canonicalText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function canonicalCue(value) {
  return canonicalText(value).toUpperCase();
}

function normalizePerson(value) {
  return value
    .toUpperCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\d+/g, '')
    .replace(/[^A-Z\u3400-\u9FFF]/g, '');
}

function tagAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? '') : null;
}

function parseDialogueMetadata(html) {
  const directives = [];
  for (const match of html.matchAll(/<tr\b[^>]*>/gi)) {
    const tag = match[0];
    const cue = tagAttribute(tag, 'data-dialogue-cue');
    const dialogue = tagAttribute(tag, 'data-dialogue-text');
    const addressee = tagAttribute(tag, 'data-dialogue-addressee');
    const mode = tagAttribute(tag, 'data-dialogue-mode');
    if (![cue, dialogue, addressee, mode].some((value) => value !== null)) continue;
    directives.push({
      raw: tag,
      row: tagAttribute(tag, 'data-row-id'),
      speaker: cue,
      dialogue,
      addressee,
      mode,
      offscreen: mode === 'offscreen',
      lipSync: mode === 'lip_sync',
    });
  }
  return directives;
}

function countCanonicalOccurrences(value, target) {
  const haystack = canonicalText(value);
  const needle = canonicalText(target);
  if (!needle) return 0;
  let count = 0;
  let offset = 0;
  while (true) {
    const index = haystack.indexOf(needle, offset);
    if (index < 0) return count;
    count += 1;
    offset = index + needle.length;
  }
}

function manifestField(manifest, field) {
  const match = manifest.match(new RegExp(`^- ${field}:\\s*(.+)$`, 'm'));
  return match?.[1]?.trim() ?? null;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function issueCollector() {
  const issues = [];
  return {
    add(severity, code, scope, message) {
      issues.push({ severity, code, scope, message });
    },
    issues,
  };
}

function compareDialogue(expected, actual, rows, promptBlocks, sceneLabel, add) {
  if (expected.length !== actual.length) {
    add('error', 'dialogue-count', sceneLabel, `source=${expected.length}, html=${actual.length}`);
  }

  const max = Math.max(expected.length, actual.length);
  for (let index = 0; index < max; index += 1) {
    const sourceLine = expected[index];
    const directive = actual[index];
    if (!sourceLine) {
      add('error', 'dialogue-extra', sceneLabel, `HTML extra line ${index + 1}: ${directive?.dialogue ?? directive?.raw ?? 'unreadable'}`);
      continue;
    }
    if (!directive) {
      add('error', 'dialogue-missing', sceneLabel, `Missing ${sourceLine.cue}: "${sourceLine.text}"`);
      continue;
    }
    if (!directive.dialogue) {
      add('error', 'dialogue-unreadable', sceneLabel, `Cannot parse dialogue directive ${index + 1}`);
    } else if (canonicalText(sourceLine.text) !== canonicalText(directive.dialogue)) {
      add('error', 'dialogue-order-or-text', sceneLabel, `line ${index + 1}: source="${sourceLine.text}" html="${directive.dialogue}"`);
    }
    if (!directive.speaker || canonicalCue(sourceLine.cue) !== canonicalCue(directive.speaker)) {
      add('error', 'speaker', sceneLabel, `line ${index + 1}: source=${sourceLine.cue}, html=${directive.speaker ?? 'unreadable'}`);
    }
    if (!directive.row || !rows.includes(directive.row)) {
      add('error', 'dialogue-row', sceneLabel, `line ${index + 1} points to missing Row ${directive.row ?? 'unreadable'}`);
    }
    if (sourceLine.offscreen !== directive.offscreen) {
      add('error', 'dialogue-mode', sceneLabel, `${sourceLine.cue} source off-screen=${sourceLine.offscreen}, html off-screen=${directive.offscreen}`);
    }
    if (!['lip_sync', 'offscreen'].includes(directive.mode)) {
      add('error', 'dialogue-mode', sceneLabel, `${sourceLine.cue} has unsupported data-dialogue-mode=${directive.mode ?? 'missing'}`);
    }
    if (!sourceLine.offscreen && !directive.lipSync) {
      add('error', 'lip-sync', sceneLabel, `${sourceLine.cue} lacks a lip-sync shot`);
    }
    if (!directive.addressee) {
      add('error', 'addressee', sceneLabel, `${sourceLine.cue} addressee is unreadable; inspect current Scene action and blocking`);
    } else if (GENERIC_ADDRESSEE_RE.test(directive.addressee.trim())) {
      add('error', 'addressee', sceneLabel, `${sourceLine.cue} uses generic addressee "${directive.addressee}"; inspect current Scene evidence`);
    } else {
      const speakerNames = sourceLine.cue
        .replace(/\([^)]*\)/g, '')
        .split('/')
        .map(normalizePerson)
        .filter(Boolean);
      if (speakerNames.includes(normalizePerson(directive.addressee))) {
        add('warning', 'self-direction', sceneLabel, `${sourceLine.cue} points toward ${directive.addressee}; inspect current Scene evidence`);
      }
    }

    const matchingPromptBlocks = promptBlocks.filter((block) => countCanonicalOccurrences(block, sourceLine.text) > 0);
    const promptOccurrences = matchingPromptBlocks.reduce(
      (count, block) => count + countCanonicalOccurrences(block, sourceLine.text),
      0,
    );
    if (promptOccurrences === 0) {
      add('error', 'dialogue-prompt-missing', sceneLabel, `${sourceLine.cue}: "${sourceLine.text}" is absent from prompt blocks`);
    } else if (promptOccurrences > 1) {
      add('error', 'dialogue-prompt-duplicate', sceneLabel, `${sourceLine.cue}: "${sourceLine.text}" occurs ${promptOccurrences} times in prompt blocks`);
    } else if (!matchingPromptBlocks[0].includes(sourceLine.cue)) {
      add('error', 'dialogue-prompt-speaker', sceneLabel, `${sourceLine.cue} cue is absent beside its exact prompt dialogue`);
    }
  }

  const usedRows = new Map();
  for (const directive of actual) {
    if (!directive.row) continue;
    if (usedRows.has(directive.row)) {
      add('error', 'reused-dialogue-row', sceneLabel, `${directive.row} carries more than one source dialogue line`);
    }
    usedRows.set(directive.row, true);
  }
}

async function validatePackage({ packagePath, directoryName, sourceScene, add, globalPromptOwners }) {
  const label = directoryName.match(/^(scene-\d{3}[a-z]?)_v\d+$/)?.[1];
  if (!label) return null;
  const fileNames = await readdir(packagePath);
  const htmlFiles = fileNames.filter((name) => new RegExp(`^Shotlist_${label}_ZH_v\\d+\\.html$`).test(name));
  const breakdownFiles = fileNames.filter((name) => new RegExp(`^03_shotlist_breakdown_${label}_v\\d+\\.md$`).test(name));
  const manifestFiles = fileNames.filter((name) => name === 'manifest.md');

  if (htmlFiles.length !== 1) add('error', 'html-file', label, `expected 1 HTML, found ${htmlFiles.length}`);
  if (breakdownFiles.length !== 1) add('error', 'breakdown-file', label, `expected 1 Breakdown, found ${breakdownFiles.length}`);
  if (manifestFiles.length !== 1) add('error', 'manifest-file', label, `expected 1 manifest.md, found ${manifestFiles.length}`);
  if (htmlFiles.length !== 1 || manifestFiles.length !== 1) return null;

  const htmlPath = path.join(packagePath, htmlFiles[0]);
  const manifestPath = path.join(packagePath, manifestFiles[0]);
  const [html, manifest] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    readFile(manifestPath, 'utf8'),
  ]);
  const rows = allMatches(html, /data-row-id="([^"]+)"/g);
  const promptIds = allMatches(html, /data-prompt-id="(P\d+)"/g);
  const directives = parseDialogueMetadata(html);

  const uniqueRows = new Set(rows);
  const uniquePrompts = new Set(promptIds);
  if (uniqueRows.size !== rows.length) add('error', 'duplicate-row', label, 'duplicate data-row-id values');
  if (uniquePrompts.size !== promptIds.length) add('error', 'duplicate-prompt', label, 'duplicate data-prompt-id values inside package');
  for (const row of rows) {
    if (!new RegExp(`^${label}-R\\d{2,}$`).test(row)) add('error', 'row-format', label, `invalid Row ${row}`);
  }
  for (const promptId of promptIds) {
    if (globalPromptOwners.has(promptId)) {
      add('error', 'duplicate-prompt', label, `${promptId} also appears in ${globalPromptOwners.get(promptId)}`);
    } else {
      globalPromptOwners.set(promptId, label);
    }
  }

  if (html.includes('{{')) add('error', 'placeholder', label, 'unresolved template placeholder in HTML');

  const promptBlockPattern = /<pre\b(?=[^>]*\bclass=["'][^"']*\bprompt-block\b[^"']*["'])[^>]*>([\s\S]*?)<\/pre>/gi;
  const promptBlocks = allMatches(html, promptBlockPattern).map(decodeHtml);
  const htmlOutsidePromptBlocks = html.replace(promptBlockPattern, '');
  const decodedHtmlOutsidePrompts = decodeHtml(htmlOutsidePromptBlocks);
  const forbiddenPromptStatePatterns = [
    /⚠️\s*参考(?:图)?状态/i,
    /\b(?:asset_origin|reference_binding|reference_approval|output_status)\s*[:=]/i,
    /\b(?:user_provided|generated_from_text|generated_from_references|text_only|images_attached|prompt[-_ ]only|smoke_test|review_ready|production_approved|text_only_draft|text_dna_draft|image_reference_bound)\b/i,
    /文本\s*DNA|未附图|不得声称身份锁定|未获用户站位锁定/i,
  ];
  for (const [index, promptBlock] of promptBlocks.entries()) {
    if (forbiddenPromptStatePatterns.some((pattern) => pattern.test(promptBlock))) {
      add('error', 'prompt-purity', label, `Prompt block ${index + 1} contains project reference/output status metadata`);
    }
  }

  for (const field of ['asset_origin', 'reference_binding', 'reference_approval', 'output_status']) {
    const declared = manifestField(manifest, field);
    if (!declared) {
      add('error', 'reference-state', label, `manifest is missing ${field}`);
    } else {
      const claim = `${field}=${declared}`;
      const claimCount = decodedHtmlOutsidePrompts.split(claim).length - 1;
      if (claimCount === 0) {
        add('error', 'reference-state', label, `Scene HTML header does not expose manifest claim ${claim}`);
      } else if (claimCount > 1) {
        add('error', 'reference-state', label, `Scene HTML repeats ${claim}; expose each state field once outside prompt blocks`);
      }
    }
  }
  const declaredRows = Number.parseInt(manifestField(manifest, 'shot_row_count') ?? '', 10);
  const declaredPrompts = Number.parseInt(manifestField(manifest, 'prompt_envelope_count') ?? '', 10);
  if (!Number.isNaN(declaredRows) && declaredRows !== rows.length) add('error', 'manifest-row-count', label, `manifest=${declaredRows}, html=${rows.length}`);
  if (!Number.isNaN(declaredPrompts) && declaredPrompts !== promptIds.length) add('error', 'manifest-prompt-count', label, `manifest=${declaredPrompts}, html=${promptIds.length}`);

  const declaredPromptIds = (manifestField(manifest, 'prompt_ids') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (declaredPromptIds.length > 0 && declaredPromptIds.join(',') !== promptIds.join(',')) {
    add('error', 'manifest-prompt-ids', label, `manifest=${declaredPromptIds.join(',')}, html=${promptIds.join(',')}`);
  }

  if (sourceScene) {
    const declaredLines = manifestField(manifest, 'source_lines')?.match(/^L(\d+)[–-]L(\d+)$/);
    if (!declaredLines
      || Number(declaredLines[1]) !== sourceScene.startLine
      || Number(declaredLines[2]) !== sourceScene.endLine) {
      add('error', 'source-lines', label, `expected L${sourceScene.startLine}–L${sourceScene.endLine}, manifest=${manifestField(manifest, 'source_lines') ?? 'missing'}`);
    }
    compareDialogue(extractSourceDialogue(sourceScene), directives, rows, promptBlocks, label, add);
  }

  return { label, rows: rows.length, prompts: promptIds.length, dialogue: directives.length };
}

function printIssues(issues) {
  const order = { error: 0, warning: 1 };
  const sorted = [...issues].sort((a, b) => order[a.severity] - order[b.severity] || a.scope.localeCompare(b.scope));
  const limit = 80;
  for (const issue of sorted.slice(0, limit)) {
    console.log(`- ${issue.severity.toUpperCase()} [${issue.code}] ${issue.scope}: ${issue.message}`);
  }
  if (sorted.length > limit) console.log(`- ... ${sorted.length - limit} more issues omitted`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const [scriptSource, entries] = await Promise.all([
    readFile(args.scriptPath, 'utf8'),
    readdir(args.shotlistRoot, { withFileTypes: true }),
  ]);
  const screenplay = args.statePath
    ? await indexRegisteredScript(scriptSource, args.scriptPath, args.statePath)
    : parseScreenplay(scriptSource, args.scriptPath);
  const sourceByLabel = new Map(screenplay.scenes.map((scene) => [scene.label, scene]));
  const packages = entries
    .filter((entry) => entry.isDirectory() && /^scene-\d{3}[a-z]?_v\d+$/.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const { add, issues } = issueCollector();
  const seenLabels = new Set();
  const globalPromptOwners = new Map();
  const stats = [];

  for (const entry of packages) {
    const label = entry.name.match(/^(scene-\d{3}[a-z]?)_v\d+$/)[1];
    if (seenLabels.has(label)) add('error', 'duplicate-scene-package', label, 'more than one current version directory');
    seenLabels.add(label);
    const sourceScene = sourceByLabel.get(label);
    if (!sourceScene) add('error', 'scene-mapping', label, 'no matching Scene in source screenplay');
    const value = await validatePackage({
      packagePath: path.join(args.shotlistRoot, entry.name),
      directoryName: entry.name,
      sourceScene,
      add,
      globalPromptOwners,
    });
    if (value) stats.push(value);
  }

  const missingScenes = screenplay.scenes.filter((scene) => !seenLabels.has(scene.label));
  if (missingScenes.length > 0) {
    add(args.requireComplete ? 'error' : 'warning', 'scene-coverage', 'project', `${missingScenes.length} source Scenes have no package; first=${missingScenes[0].label}`);
  }

  const promptNumbers = [...globalPromptOwners.keys()]
    .map((id) => Number.parseInt(id.slice(1), 10))
    .sort((a, b) => a - b);
  for (let index = 1; index < promptNumbers.length; index += 1) {
    if (promptNumbers[index] !== promptNumbers[index - 1] + 1) {
      add('error', 'prompt-gap', 'project', `gap between P${String(promptNumbers[index - 1]).padStart(3, '0')} and P${String(promptNumbers[index]).padStart(3, '0')}`);
    }
  }

  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  const totals = stats.reduce((sum, item) => ({
    rows: sum.rows + item.rows,
    prompts: sum.prompts + item.prompts,
    dialogue: sum.dialogue + item.dialogue,
  }), { rows: 0, prompts: 0, dialogue: 0 });

  console.log('# Independent Shotlist Validation');
  console.log(`- script: ${args.scriptPath}`);
  console.log(`- screenplay_scenes: ${screenplay.sceneCount}`);
  console.log(`- scene_packages: ${packages.length}`);
  console.log(`- require_complete: ${args.requireComplete}`);
  console.log(`- shot_rows: ${totals.rows}`);
  console.log(`- prompt_envelopes: ${totals.prompts}`);
  console.log(`- dialogue_lines_in_html: ${totals.dialogue}`);
  console.log(`- result: ${errors > 0 ? 'blocked' : warnings > 0 ? 'pass-with-warnings' : 'pass'}`);
  console.log(`- errors: ${errors}`);
  console.log(`- warnings: ${warnings}`);
  if (issues.length > 0) {
    console.log('');
    console.log('## Findings');
    printIssues(issues);
  }

  if (errors > 0) process.exitCode = 1;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}
