#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const testRoot = path.resolve(__dirname, "..");
const scriptFile = path.join(testRoot, "deliverables", "10_story", "01_script_v10.md");
const breakdownFile = path.join(testRoot, "deliverables", "30_shotlist", "03_shotlist_breakdown_v2.md");
const packageRoot = path.join(testRoot, "deliverables", "30_shotlist", "scenes", "scenes-078-085_096-098_v2");
const htmlFile = path.join(packageRoot, "Shotlist_scenes-078-085_096-098_ZH_v2.html");

const selectedScenes = [
  ["scene-078", "EXT. SCHOOL GYM - NIGHT"],
  ["scene-079", "INT. SCHOOL GYM - NIGHT"],
  ["scene-080", "EXT. NAGI BRIDGE - NIGHT"],
  ["scene-081", "EXT. BRIDGE CHECKPOINT - NIGHT"],
  ["scene-082", "EXT. NAGI STREET - NIGHT"],
  ["scene-083", "INT. TOWN HALL - NIGHT"],
  ["scene-084", "EXT. NAGI - NIGHT"],
  ["scene-085", "EXT. SCHOOL HILL - NIGHT"],
  ["scene-096", "INT. SUBWAY - MORNING"],
  ["scene-097", "EXT. TOKYO STREETS - CONTINUOUS"],
  ["scene-098", "EXT. SHRINE STAIRS - LATE AFTERNOON"],
];
const expectedSections = [
  "scene-078", "scene-079", "scene-080", "scene-081", "scene-082", "scene-083",
  "scene-084", "scene-085", "scene-096", "scene-097", "scene-098-pass", "scene-098-recognition",
];

const errors = [];
const warnings = [];

for (const file of [scriptFile, breakdownFile, htmlFile]) {
  if (!fs.existsSync(file)) errors.push(`Missing required artifact: ${path.relative(testRoot, file)}`);
}
if (errors.length) finish();

const script = fs.readFileSync(scriptFile, "utf8");
const breakdown = decode(fs.readFileSync(breakdownFile, "utf8"));
const html = fs.readFileSync(htmlFile, "utf8");
const prompts = [...html.matchAll(/<pre[^>]+class=["'][^"']*prompt-block[^"']*["'][^>]+id=["'](P\d{3})["'][^>]*>([\s\S]*?)<\/pre>/gi)]
  .map((match) => ({ id: match[1], text: decode(stripTags(match[2])) }));
const rows = [...html.matchAll(/<tr\b[^>]*data-row-id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => ({
  id: match[1],
  action: decode(stripTags((match[2].match(/<td[^>]+class=["'][^"']*c-act[^"']*["'][^>]*>([\s\S]*?)<\/td>/i) || ["", ""])[1])),
}));
const sections = [...html.matchAll(/<section\b[^>]*class=["'][^"']*scene[^"']*["'][^>]*id=["']([^"']+)["']/gi)].map((match) => match[1]);
const dialogue = extractDialogue(script);

assert(dialogue.length === 23, `Expected 23 source dialogue lines, found ${dialogue.length}`);
assert(rows.length === 52, `Expected 52 shot rows, found ${rows.length}`);
assert(prompts.length === 23, `Expected 23 prompt envelopes, found ${prompts.length}`);
assert(JSON.stringify(sections) === JSON.stringify(expectedSections), `Scene section hierarchy differs: ${sections.join(", ")}`);
assert(rows.length === new Set(rows.map((row) => row.id)).size, "Shot Row IDs are not unique");
assert(prompts.length === new Set(prompts.map((prompt) => prompt.id)).size, "Prompt IDs are not unique");
assert(prompts[0]?.id === "P429" && prompts.at(-1)?.id === "P451", "Prompt reservation must be P429-P451");

for (const [sceneId, header] of selectedScenes) {
  assert(breakdown.includes(`| \`${sceneId}\` | \`${header}\``), `Breakdown scene inventory is missing ${sceneId}: ${header}`);
}

for (const entry of dialogue) {
  const promptMatches = prompts.filter((prompt) => prompt.text.includes(`\"${entry.text}\"`));
  const rowMatches = rows.filter((row) => row.action.includes(`\"${entry.text}\"`));
  assert(breakdown.includes(entry.text), `Breakdown omitted source dialogue from ${entry.sceneId}: ${entry.speaker}: ${entry.text}`);
  assert(rowMatches.length === 1, `${entry.sceneId} dialogue must occur in exactly one Shot Row action, found ${rowMatches.length}: ${entry.text}`);
  assert(promptMatches.length === 1, `${entry.sceneId} spoken dialogue must occur in exactly one prompt, found ${promptMatches.length}: ${entry.text}`);
}

for (const prompt of prompts) {
  assert(/15\s*秒/.test(prompt.text), `${prompt.id} does not declare a 15-second duration`);
  assert(prompt.text.includes("21:9"), `${prompt.id} does not declare 21:9`);
  assert(!/Emmanuel Lubezki|Roger Deakins/i.test(prompt.text), `${prompt.id} uses a named cinematographer shortcut`);
  assert(!/text_dna_draft/.test(prompt.text), `${prompt.id} still uses the legacy reference-state token`);

  const timings = [...prompt.text.matchAll(/【镜头(\d+)】\s*(\d+)(?:-(\d+))?秒/g)].map((match) => ({
    number: Number(match[1]),
    min: Number(match[2]),
    max: Number(match[3] || match[2]),
  }));
  if (/multi-shot|多机位剪辑/i.test(prompt.text)) {
    assert(timings.length >= 2, `${prompt.id} declares multi-shot without at least two timed internal shots`);
  }
  if (timings.length) {
    assert(timings.length <= 5, `${prompt.id} has ${timings.length} internal shots; maximum is 5`);
    assert(timings.every((timing, index) => timing.number === index + 1), `${prompt.id} internal shot numbers are not sequential`);
    const minTotal = timings.reduce((sum, timing) => sum + timing.min, 0);
    const maxTotal = timings.reduce((sum, timing) => sum + timing.max, 0);
    assert(minTotal <= 15 && maxTotal >= 15, `${prompt.id} timing range ${minTotal}-${maxTotal}s cannot resolve to 15s`);
  }
}

for (const field of [
  "asset_origin: generated_from_text",
  "reference_binding: images_attached",
  "reference_approval: draft",
  "output_status: prompt_only",
]) {
  assert(decode(html).includes(field), `HTML is missing state field: ${field}`);
}

finish();

function extractDialogue(source) {
  const lines = source.split(/\r?\n/);
  const output = [];
  for (const [sceneId, header] of selectedScenes) {
    const start = lines.findIndex((line) => line.trim() === header);
    if (start < 0) {
      errors.push(`Source script is missing ${sceneId}: ${header}`);
      continue;
    }
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^(?:INT|EXT)\./.test(lines[index].trim())) {
        end = index;
        break;
      }
    }
    for (let index = start + 1; index < end; index += 1) {
      const cue = lines[index].trim();
      if (!/^[A-Z][A-Z0-9 .'-]*(?: \([^)]*\))?$/.test(cue) || /^(?:CUT|FADE)\b/.test(cue)) continue;
      let dialogueIndex = index + 1;
      while (dialogueIndex < end && !lines[dialogueIndex].trim()) dialogueIndex += 1;
      if (dialogueIndex >= end) continue;
      const text = lines[dialogueIndex].trim();
      if (!text || /^(?:INT|EXT)\./.test(text)) continue;
      output.push({ sceneId, speaker: cue, text });
    }
  }
  return output;
}

function decode(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;|&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripTags(value) {
  return String(value).replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function finish() {
  process.stdout.write(`Shotlist regression fidelity: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  for (const warning of warnings) process.stdout.write(`WARN ${warning}\n`);
  for (const error of errors) process.stderr.write(`ERROR ${error}\n`);
  process.exit(errors.length ? 1 : 0);
}
