#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(args.repo || process.cwd());
const projectRoot = args.project ? path.resolve(args.project) : null;
const results = [];

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    if (name === "json" || name === "strict-warnings") {
      parsed[name] = true;
    } else {
      parsed[name] = argv[i + 1];
      i += 1;
    }
  }
  return parsed;
}

function add(level, code, message, file) {
  results.push({ level, code, message, file: file ? relativeDisplay(file) : undefined });
}

function relativeDisplay(file) {
  const absolute = path.resolve(file);
  for (const [label, root] of [["repo", repoRoot], ["project", projectRoot]]) {
    if (!root) continue;
    const rel = path.relative(root, absolute);
    if (!rel.startsWith("..") && !path.isAbsolute(rel)) return `${label}:${rel || "."}`;
  }
  return absolute;
}

function exists(file) {
  return fs.existsSync(file);
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    add("error", "read_failed", error.message, file);
    return "";
  }
}

function walk(root, predicate = () => true) {
  if (!exists(root)) return [];
  const output = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(current)) {
        if ([".git", "node_modules"].includes(name)) continue;
        stack.push(path.join(current, name));
      }
    } else if (predicate(current)) {
      output.push(current);
    }
  }
  return output.sort();
}

function stripCode(value) {
  return String(value || "").trim().replace(/^`|`$/g, "");
}

function frontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (field) data[field[1]] = field[2].trim();
  }
  return data;
}

function compatibility(text) {
  const section = text.match(/## Slot Compatibility\s*\n([\s\S]*?)(?=\n## |$)/);
  if (!section) return null;
  const get = (name) => {
    const match = section[1].match(new RegExp("^- " + name + ":\\s*`([^`]+)`", "m"));
    return match ? match[1] : null;
  };
  const outputBlock = section[1].match(/^- canonical_outputs:\s*\n([\s\S]*?)(?=^- [a-z_]+:|$)/m);
  const outputs = outputBlock
    ? [...outputBlock[1].matchAll(/^\s+-\s+`([^`]+)`/gm)].map((match) => match[1])
    : [];
  return {
    slot: get("slot"),
    contractVersion: get("contract_version"),
    qaHandoff: get("qa_handoff"),
    stateContract: get("state_contract"),
    outputs,
  };
}

function registryRows(registryText) {
  const rows = [];
  for (const line of registryText.split("\n")) {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|$/);
    if (match) rows.push({ slot: match[1], skill: match[2], owner: match[3].trim(), output: match[4].trim() });
  }
  return rows;
}

function validateSkill(skillDir, expectedSlot) {
  const skillFile = path.join(skillDir, "SKILL.md");
  if (!exists(skillFile)) {
    add("error", "skill_missing", "SKILL.md does not exist", skillFile);
    return null;
  }
  const text = read(skillFile);
  const fm = frontmatter(text);
  const folderName = path.basename(skillDir);
  if (!fm) add("error", "frontmatter_missing", "YAML frontmatter is missing", skillFile);
  if (fm && fm.name !== folderName) add("error", "skill_name_mismatch", `frontmatter name ${fm.name} does not match folder ${folderName}`, skillFile);
  if (fm && !fm.description) add("error", "description_missing", "frontmatter description is empty", skillFile);

  const contract = compatibility(text);
  if (expectedSlot) {
    if (!contract) {
      add("error", "slot_declaration_missing", `Slot Compatibility is required for ${expectedSlot}`, skillFile);
    } else {
      if (contract.slot !== expectedSlot) add("error", "slot_mismatch", `declares ${contract.slot || "none"}, expected ${expectedSlot}`, skillFile);
      if (contract.contractVersion !== "1") add("error", "contract_version", "contract_version must be 1", skillFile);
      if (!contract.outputs.length) add("error", "canonical_outputs_missing", "canonical_outputs must contain at least one item", skillFile);
      if (!contract.qaHandoff) add("error", "qa_handoff_missing", "qa_handoff is required", skillFile);
      if (!contract.stateContract) add("error", "state_contract_missing", "state_contract is required", skillFile);
    }
  }

  validateReferences(skillFile, text);
  return { text, fm, contract, skillFile };
}

function validateReferences(sourceFile, text) {
  const refs = new Set();
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) refs.add(match[1]);
  for (const match of text.matchAll(/`((?:\.\.\/|\.\/|reference\/|references\/|templates\/|scripts\/)[^`\n]+)`/g)) refs.add(match[1]);

  for (let raw of refs) {
    raw = raw.replace(/^<|>$/g, "").split("#")[0];
    if (!raw || /^(https?:|skill:|\/mnt\/)/.test(raw)) continue;
    if (/[{}<>]/.test(raw)) continue;
    const target = path.resolve(path.dirname(sourceFile), raw);
    if (raw.includes("*")) {
      const dir = path.dirname(target);
      if (!exists(dir)) add("error", "reference_dir_missing", `reference directory does not exist: ${raw}`, sourceFile);
      continue;
    }
    if (!exists(target)) add("error", "reference_missing", `referenced file does not exist: ${raw}`, sourceFile);
  }
}

function validateRepo() {
  const registryFile = path.join(repoRoot, ".agents", "skill_registry.md");
  if (!exists(registryFile)) {
    add("error", "registry_missing", "skill registry does not exist", registryFile);
    return;
  }
  const registryText = read(registryFile);
  const rows = registryRows(registryText);
  if (!rows.length) add("error", "registry_empty", "no Current Slot Map rows could be parsed", registryFile);

  const seenSlots = new Set();
  for (const row of rows) {
    if (seenSlots.has(row.slot)) add("error", "duplicate_slot", `duplicate slot ${row.slot}`, registryFile);
    seenSlots.add(row.slot);
    validateSkill(path.join(repoRoot, ".agents", "skills", row.skill), row.slot);
  }

  if (args.slot || args.candidate) {
    if (!args.slot || !args.candidate) {
      add("error", "candidate_args", "--slot and --candidate must be used together");
    } else {
      const row = rows.find((item) => item.slot === args.slot);
      if (!row) {
        add("error", "unknown_slot", `slot ${args.slot} is not in the registry`, registryFile);
      } else {
        const candidateDir = path.resolve(repoRoot, args.candidate);
        const candidate = validateSkill(candidateDir, args.slot);
        if (candidate && candidate.contract) {
          const pathTokens = [...row.output.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
          for (const token of pathTokens) {
            const prefix = token.split(/[<{]/)[0];
            if (prefix && !candidate.contract.outputs.some((output) => output.startsWith(prefix))) {
              add("error", "candidate_output_mismatch", `candidate does not declare canonical output beginning with ${prefix}`, candidate.skillFile);
            }
          }
        }
      }
    }
  }

  const allSkillFiles = walk(path.join(repoRoot, ".agents", "skills"), (file) => /\.(md|js|html)$/.test(file));
  for (const file of allSkillFiles.filter((item) => item.endsWith(".md"))) validateReferences(file, read(file));

  const forbiddenMarkers = ["Roko", "Gandelfina", "Daichi", "P389", '"Your name?"'];
  const shotlistRoot = path.join(repoRoot, ".agents", "skills", "sketch-shotlist-workflow");
  for (const file of walk(shotlistRoot, (item) => item.endsWith(".md"))) {
    const text = read(file);
    for (const marker of forbiddenMarkers) {
      if (text.includes(marker)) add("error", "project_specific_example", `reusable skill contains project-specific marker: ${marker}`, file);
    }
  }

  const house = path.join(shotlistRoot, "assets", "shotlist-house-template.html");
  if (!exists(house)) add("error", "house_template_missing", "self-contained HTML asset is missing", house);

  const packageFile = path.join(repoRoot, "package.json");
  if (!exists(packageFile)) {
    add("error", "package_manifest_missing", "package.json is required for the DOCX exporter dependency", packageFile);
  } else {
    try {
      const pkg = JSON.parse(read(packageFile));
      if (!pkg.dependencies || !pkg.dependencies.docx) add("error", "docx_dependency_missing", "package.json must declare docx", packageFile);
    } catch (error) {
      add("error", "package_manifest_invalid", error.message, packageFile);
    }
  }

  const diff = spawnSync("git", ["-C", repoRoot, "diff", "--check"], { encoding: "utf8" });
  if (diff.status !== 0) add("error", "git_diff_check", (diff.stdout || diff.stderr).trim() || "git diff --check failed");
}

function parseArtifact(text) {
  return {
    type: (text.match(/^# Artifact:\s*(.+)$/m) || [])[1],
    id: stripCode((text.match(/^- id:\s*(.+)$/m) || [])[1]),
    version: stripCode((text.match(/^- version:\s*(.+)$/m) || [])[1]),
    upstream: (text.match(/^- upstream:\s*(.+)$/m) || [])[1],
  };
}

function field(text, name) {
  const match = text.match(new RegExp(`^- ${name}:\\s*(.+)$`, "m"));
  return stripCode(match ? match[1] : "");
}

function decodeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, "");
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const a = html.match(new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"));
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["']`, "i"));
  return a ? a[1] : b ? b[1] : "";
}

function allPromptIds(html) {
  return [...html.matchAll(/<pre[^>]+id=["'](P\d{3,})["'][^>]*>/g)].map((match) => match[1]);
}

function promptBlocks(html) {
  return [...html.matchAll(/<pre[^>]+class=["'][^"']*prompt-block[^"']*["'][^>]+id=["'](P\d{3,})["'][^>]*>([\s\S]*?)<\/pre>/g)]
    .map((match) => ({ id: match[1], text: decodeHtml(match[2]) }));
}

function validateState(text, file) {
  const allowed = {
    asset_origin: ["user_provided", "generated_from_text", "generated_from_references", "mixed"],
    reference_binding: ["none", "text_only", "images_attached"],
    reference_approval: ["draft", "reviewed", "locked"],
    output_status: ["prompt_only", "smoke_test", "review_ready", "production_approved"],
  };
  const state = {};
  for (const [name, values] of Object.entries(allowed)) {
    state[name] = field(text, name);
    if (!state[name]) add("error", "state_field_missing", `${name} is required`, file);
    else if (!values.includes(state[name])) add("error", "state_field_invalid", `${name}=${state[name]} is invalid`, file);
  }
  if (state.output_status === "production_approved" && (state.reference_binding !== "images_attached" || state.reference_approval !== "locked")) {
    add("error", "production_state_invalid", "production_approved requires images_attached and locked", file);
  }
  return state;
}

function validateBreakdown(file, prompts, rowIds) {
  if (!exists(file)) {
    add("error", "breakdown_missing", "source breakdown does not exist", file);
    return;
  }
  const text = read(file);
  const required = [
    "## Phase 1 - 剧本拆解",
    "## Phase 2 - 资产请求",
    "## Phase 3 - 范围与空间调度",
    "## Phase 4 - HTML 分镜生成计划",
    "### Shot Row Plan",
    "### Prompt Envelope Plan",
    "### Prompt ID Reservation",
  ];
  for (const heading of required) {
    if (!text.includes(heading)) add("error", "breakdown_section_missing", `missing ${heading}`, file);
  }
  const promptMap = new Map(prompts.map((prompt) => [prompt.id, prompt.text]));
  for (const id of promptMap.keys()) {
    if (!text.includes(`\`${id}\``) && !text.includes(`| ${id} |`)) add("error", "prompt_not_planned", `${id} is absent from Prompt Envelope Plan`, file);
  }
  for (const id of rowIds) {
    if (!text.includes(id)) add("error", "row_not_planned", `${id} is absent from Shot Row Plan`, file);
  }

  for (const line of text.split("\n")) {
    if (!/^\|\s*`?P\d{3,}`?\s*\|/.test(line)) continue;
    const columns = line.split("|").slice(1, -1).map((value) => value.trim().replace(/^`|`$/g, ""));
    const id = columns[0];
    if (!promptMap.has(id) || columns.length < 9) continue;
    const dialogue = columns[5];
    for (const match of dialogue.matchAll(/"([^"]+)"/g)) {
      if (!promptMap.get(id).includes(`"${match[1]}"`)) add("error", "dialogue_not_preserved", `${id} does not preserve source dialogue: ${match[1]}`, file);
    }
  }
}

function validatePackage(packagePath) {
  const absolute = path.resolve(projectRoot, packagePath);
  if (!exists(absolute) || !fs.statSync(absolute).isDirectory()) {
    add("error", "package_missing", "scene package directory does not exist", absolute);
    return;
  }

  const manifestFile = path.join(absolute, "manifest.md");
  if (!exists(manifestFile)) {
    add("error", "manifest_missing", "manifest.md is required", manifestFile);
    return;
  }
  const manifest = read(manifestFile);
  const artifact = parseArtifact(manifest);
  if (!artifact.type) add("error", "artifact_header_missing", "manifest must start with Artifact metadata", manifestFile);
  if (!/^A-\d{8}-\d{3}$/.test(artifact.id || "")) add("error", "artifact_id_invalid", `invalid artifact id: ${artifact.id || "missing"}`, manifestFile);
  if (!/^v\d+$/.test(artifact.version || "")) add("error", "artifact_version_invalid", `invalid version: ${artifact.version || "missing"}`, manifestFile);
  const state = validateState(manifest, manifestFile);

  const htmlFiles = fs.readdirSync(absolute).filter((name) => /^Shotlist_.*_ZH_v\d+\.html$/.test(name));
  if (htmlFiles.length !== 1) {
    add("error", "html_count", `expected one versioned Chinese shotlist HTML, found ${htmlFiles.length}`, absolute);
    return;
  }
  const htmlFile = path.join(absolute, htmlFiles[0]);
  const html = read(htmlFile);
  if (!/<html[^>]+lang=["']zh-CN["']/i.test(html)) add("error", "html_language", "HTML must declare zh-CN", htmlFile);
  if (/\{\{[^}]+\}\}/.test(html)) add("error", "html_placeholder", "HTML contains unreplaced template placeholders", htmlFile);
  if (meta(html, "artifact-id") !== artifact.id) add("error", "html_artifact_id", "HTML artifact-id does not match manifest", htmlFile);
  if (meta(html, "artifact-version") !== artifact.version) add("error", "html_artifact_version", "HTML artifact-version does not match manifest", htmlFile);
  if (/\/Users\/|file:\/\//.test(html)) add("error", "absolute_path", "portable HTML contains an absolute local path", htmlFile);

  const prompts = promptBlocks(html);
  const promptIds = prompts.map((item) => item.id);
  const uniquePrompts = new Set(promptIds);
  if (uniquePrompts.size !== promptIds.length) add("error", "duplicate_prompt_id", "prompt IDs are duplicated in HTML", htmlFile);
  const declaredPromptCount = Number(field(manifest, "prompt_envelopes"));
  if (!Number.isInteger(declaredPromptCount)) add("error", "prompt_count_missing", "manifest prompt_envelopes must be an integer", manifestFile);
  else if (declaredPromptCount !== promptIds.length) add("error", "prompt_count_mismatch", `manifest=${declaredPromptCount}, html=${promptIds.length}`, manifestFile);

  const dataPromptIds = [...html.matchAll(/data-prompt-id=["'](P\d{3,})["']/g)].map((match) => match[1]);
  if (new Set(dataPromptIds).size !== uniquePrompts.size || dataPromptIds.length !== promptIds.length) {
    add("error", "prompt_mapping", "data-prompt-id and <pre id> mappings differ", htmlFile);
  }

  const rowIds = [...html.matchAll(/data-row-id=["']([^"']+)["']/g)].map((match) => match[1]);
  if (!rowIds.length) add("error", "row_ids_missing", "HTML contains no data-row-id values", htmlFile);
  if (new Set(rowIds).size !== rowIds.length) add("error", "duplicate_row_id", "shot-row IDs are duplicated", htmlFile);
  for (const id of rowIds) {
    if (!/^[a-z0-9][a-z0-9_-]*-R\d{2,3}$/i.test(id)) add("error", "row_id_invalid", `invalid shot-row ID ${id}`, htmlFile);
    if (/^P\d+$/.test(id)) add("error", "row_prompt_conflation", `${id} is used as a shot-row ID`, htmlFile);
  }
  const declaredRowCount = Number(field(manifest, "shot_rows"));
  if (!Number.isInteger(declaredRowCount)) add("error", "row_count_missing", "manifest shot_rows must be an integer", manifestFile);
  else if (declaredRowCount !== rowIds.length) add("error", "row_count_mismatch", `manifest=${declaredRowCount}, html=${rowIds.length}`, manifestFile);

  const requiredPromptMarkers = ["@image", "⚠️机位锁定", "⚠️画面构图锁定", "⚠️动作边界", "⚠️失败规避", "15秒。21:9。"];
  const rejectedBoilerplate = [
    "起始先停半拍，眼神锁定本镜头目标",
    "动作中段用手指、脚步、肩线或喉结体现压力",
    "结束时保留0.4秒余震，让本镜头动作读清楚",
  ];
  for (const prompt of prompts) {
    for (const marker of requiredPromptMarkers) {
      if (!prompt.text.includes(marker)) add("error", "prompt_gate", `${prompt.id} is missing ${marker}`, htmlFile);
    }
    if (!/动作[：:]/.test(prompt.text)) add("error", "prompt_action", `${prompt.id} lacks an action path`, htmlFile);
    if (!/机位[：:]/.test(prompt.text)) add("error", "prompt_camera", `${prompt.id} lacks a shot camera block`, htmlFile);
    for (const phrase of rejectedBoilerplate) {
      if (prompt.text.includes(phrase)) add("error", "generic_microbeat", `${prompt.id} contains rejected generic micro-beat boilerplate`, htmlFile);
    }
    if (/Emmanuel Lubezki|Roger Deakins/.test(prompt.text)) add("error", "named_style_shortcut", `${prompt.id} uses a named-cinematographer style shortcut`, htmlFile);
  }

  const englishUi = [/<th>Action<\/th>/i, /<th>Scene Text<\/th>/i, />Copy<\/button>/i, />Production Notes</i, />Asset List</i];
  if (englishUi.some((pattern) => pattern.test(html))) add("error", "visible_english_ui", "reader-facing UI contains legacy English labels", htmlFile);

  const sourceBreakdown = field(manifest, "source_breakdown");
  if (!sourceBreakdown) {
    add("error", "source_breakdown_missing", "manifest source_breakdown is required", manifestFile);
  } else {
    validateBreakdown(path.resolve(projectRoot, sourceBreakdown), prompts, rowIds);
  }

  const previewFile = path.join(absolute, "previews", "manifest.md");
  if (!exists(previewFile)) {
    add("error", "preview_manifest_missing", "previews/manifest.md is required", previewFile);
  } else {
    const preview = read(previewFile);
    const previewState = validateState(preview, previewFile);
    for (const key of ["asset_origin", "reference_binding", "reference_approval", "output_status"]) {
      if (previewState[key] !== state[key]) add("error", "preview_state_mismatch", `${key} differs from package manifest`, previewFile);
    }
    for (const id of promptIds) {
      if (!preview.includes(id)) add("error", "preview_entry_missing", `${id} has no preview manifest entry`, previewFile);
    }
    if (state.output_status !== "prompt_only") {
      for (const src of [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map((match) => match[1])) {
        if (/^(data:|https?:)/.test(src)) continue;
        if (!exists(path.resolve(absolute, src))) add("error", "preview_file_missing", `embedded preview does not exist: ${src}`, htmlFile);
      }
    }
  }

  const assetPaths = [...manifest.matchAll(/^\s+-\s+`(deliverables\/20_assets\/[^`]+)`/gm)].map((match) => match[1]);
  for (const rel of assetPaths) {
    if (!exists(path.resolve(projectRoot, rel))) add("error", "common_asset_missing", `common asset path does not exist: ${rel}`, manifestFile);
  }

  const sceneMatches = [...html.matchAll(/<section[^>]+class=["'][^"']*scene[^"']*["'][^>]+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/section>/g)];
  const sceneOrder = sceneMatches.map((match) => match[1]);
  if (!sceneOrder.length) add("error", "scene_sections_missing", "HTML contains no scene sections", htmlFile);
  const declaredSceneSections = Number(field(manifest, "scene_sections"));
  const declaredScreenplayScenes = Number(field(manifest, "screenplay_scenes"));
  if (!Number.isInteger(declaredSceneSections)) add("error", "scene_section_count_missing", "manifest scene_sections must be an integer", manifestFile);
  else if (declaredSceneSections !== sceneOrder.length) add("error", "scene_section_count_mismatch", `manifest=${declaredSceneSections}, html=${sceneOrder.length}`, manifestFile);
  if (!Number.isInteger(declaredScreenplayScenes)) add("error", "screenplay_scene_count_missing", "manifest screenplay_scenes must be an integer", manifestFile);
  else if (sceneOrder.length < declaredScreenplayScenes) add("error", "scene_hierarchy_conflation", `HTML has ${sceneOrder.length} sections for ${declaredScreenplayScenes} screenplay scenes`, htmlFile);
  for (const match of sceneMatches) {
    const sectionId = match[1];
    for (const rowMatch of match[2].matchAll(/<tr\b([^>]*)>/g)) {
      const rowScene = (rowMatch[1].match(/data-scene=["']([^"']+)["']/) || [])[1];
      const rowId = (rowMatch[1].match(/data-row-id=["']([^"']+)["']/) || [])[1];
      if (!rowScene || !rowId) continue;
      if (rowScene !== sectionId) add("error", "row_scene_mismatch", `${rowId} declares ${rowScene} inside ${sectionId}`, htmlFile);
      if (!rowId.startsWith(`${rowScene}-R`)) add("error", "row_scene_prefix", `${rowId} does not use its scene label ${rowScene}`, htmlFile);
    }
  }

  if (state.output_status === "production_approved") {
    const qaPath = field(manifest, "qa_report");
    if (!qaPath || !exists(path.resolve(projectRoot, qaPath))) add("error", "production_qa_missing", "production-approved package requires an existing qa_report", manifestFile);
  }
}

function validateProject() {
  if (!projectRoot || !exists(projectRoot)) {
    add("error", "project_missing", "--project directory does not exist", projectRoot || args.project);
    return;
  }
  if (!args.package) {
    add("error", "package_arg_missing", "--package is required when --project is used");
    return;
  }
  validatePackage(args.package);

  const activeSceneRoot = path.join(projectRoot, "deliverables", "30_shotlist", "scenes");
  const promptOwners = new Map();
  for (const htmlFile of walk(activeSceneRoot, (file) => /^Shotlist_.*\.html$/.test(path.basename(file)))) {
    for (const id of allPromptIds(read(htmlFile))) {
      if (!promptOwners.has(id)) promptOwners.set(id, []);
      promptOwners.get(id).push(htmlFile);
    }
  }
  for (const [id, files] of promptOwners) {
    if (files.length > 1) add("error", "project_prompt_collision", `${id} appears in ${files.length} active scene packages`, files[0]);
  }
}

validateRepo();
if (projectRoot) validateProject();

const counts = results.reduce((acc, item) => {
  acc[item.level] = (acc[item.level] || 0) + 1;
  return acc;
}, { error: 0, warning: 0, info: 0 });

if (args.json) {
  process.stdout.write(`${JSON.stringify({ repo: repoRoot, project: projectRoot, counts, results }, null, 2)}\n`);
} else {
  for (const item of results) {
    const where = item.file ? ` (${item.file})` : "";
    process.stdout.write(`${item.level.toUpperCase()} ${item.code}: ${item.message}${where}\n`);
  }
  process.stdout.write(`Validation complete: ${counts.error} error(s), ${counts.warning} warning(s).\n`);
}

process.exit(counts.error || (args["strict-warnings"] && counts.warning) ? 1 : 0);
