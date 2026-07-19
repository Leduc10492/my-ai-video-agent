#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { builtinModules } from 'node:module';

const repoRoot = process.cwd();
const skillsRoot = path.join(repoRoot, '.agents', 'skills');

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(entryPath));
    else files.push(entryPath);
  }
  return files;
}

function run(label, command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (result.status === 0) {
    console.log(`PASS ${label}${output ? ` — ${output}` : ''}`);
    return true;
  }
  console.error(`FAIL ${label}${output ? `\n${output}` : ''}`);
  return false;
}

function pass(label, detail = '') {
  console.log(`PASS ${label}${detail ? ` — ${detail}` : ''}`);
  return true;
}

function fail(label, errors) {
  const values = Array.isArray(errors) ? errors : [errors];
  console.error(`FAIL ${label}\n${values.map((error) => `- ${error}`).join('\n')}`);
  return false;
}

function stripCode(value) {
  return value.trim().replace(/^`|`$/g, '');
}

function markdownTargets(source) {
  return [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
    .map((match) => match[1].trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0])
    .filter((target) => target
      && !/^(?:https?:|mailto:|\/|#)/i.test(target)
      && !/[<{*]/.test(target));
}

function validateMarkdownDocument(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const missing = [];
  for (const target of new Set(markdownTargets(source))) {
    if (!existsSync(path.resolve(path.dirname(filePath), target))) missing.push(target);
  }
  return missing;
}

function validateSkill(skillDirectory) {
  const skillPath = path.join(skillDirectory, 'SKILL.md');
  const source = readFileSync(skillPath, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const errors = [];

  if (!frontmatter) {
    errors.push('missing or malformed YAML frontmatter');
  } else {
    const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    const directoryName = path.basename(skillDirectory);

    if (!name) errors.push('frontmatter is missing name');
    else {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) errors.push(`invalid skill name: ${name}`);
      if (name.length > 64) errors.push(`skill name exceeds 64 characters: ${name.length}`);
      if (name !== directoryName) errors.push(`name ${name} does not match directory ${directoryName}`);
    }
    if (!description) errors.push('frontmatter is missing description');
    else if (description.length > 1024) errors.push(`description exceeds 1024 characters: ${description.length}`);
  }

  for (const target of new Set(markdownTargets(source))) {
    if (!existsSync(path.resolve(skillDirectory, target))) {
      errors.push(`missing relative Markdown reference: ${target}`);
    }
  }

  const inlineResources = [...source.matchAll(/`([^`\n]+\.(?:md|html|mjs|js))`/g)]
    .map((match) => match[1].trim())
    .filter((target) => /^(?:\.\.\/|\.\/|reference\/|references\/|templates\/|assets\/|scripts\/)/.test(target))
    .filter((target) => target !== 'assets/asset_manifest.md')
    .filter((target) => !/[<{*]/.test(target));
  for (const target of new Set(inlineResources)) {
    if (!existsSync(path.resolve(skillDirectory, target))) {
      errors.push(`missing inline file reference: ${target}`);
    }
  }

  if (errors.length > 0) {
    console.error(`FAIL Skill ${path.basename(skillDirectory)}\n${errors.map((error) => `- ${error}`).join('\n')}`);
    return false;
  }
  console.log(`PASS Skill ${path.basename(skillDirectory)}`);
  return true;
}

function validateCorePaths() {
  const required = [
    'AGENTS.md',
    'README.md',
    'QUICK_START.md',
    '.agents/skill_registry.md',
    '.codex/config.toml',
    'deliverables/0_admin/locks.md',
    'deliverables/0_admin/changelog.md',
    'deliverables/0_admin/qa_reports/README.md',
    'deliverables/1_story/README.md',
    'deliverables/2_assets/README.md',
    'deliverables/3_shotlist/README.md',
    'archives/README.md',
    'package.json',
    'pnpm-lock.yaml',
  ];
  const missing = required.filter((target) => !existsSync(path.join(repoRoot, target)));
  return missing.length === 0 ? pass('core repository paths', `${required.length} present`) : fail('core repository paths', missing);
}

function validateStageDirectoryNaming() {
  const active = ['0_admin', '1_story', '2_assets', '3_shotlist'];
  // Build deprecated padded names without leaving them as apparent path
  // references in the repository contract itself.
  const deprecated = [
    ['0', '0_admin'].join(''),
    ['1', '0_story'].join(''),
    ['2', '0_assets'].join(''),
    ['3', '0_shotlist'].join(''),
  ];
  const errors = [];

  for (const directory of active) {
    if (!existsSync(path.join(repoRoot, 'deliverables', directory))) {
      errors.push(`missing single-digit stage directory deliverables/${directory}`);
    }
  }
  for (const directory of deprecated) {
    if (existsSync(path.join(repoRoot, 'deliverables', directory))) {
      errors.push(`deprecated padded stage directory still exists: deliverables/${directory}`);
    }
    if (existsSync(path.join(repoRoot, 'archives', directory))) {
      errors.push(`deprecated padded archive directory still exists: archives/${directory}`);
    }
  }

  const contractFiles = [
    path.join(repoRoot, 'AGENTS.md'),
    path.join(repoRoot, 'README.md'),
    path.join(repoRoot, 'QUICK_START.md'),
    path.join(repoRoot, '.gitignore'),
    ...walk(path.join(repoRoot, '.agents')),
    ...walk(path.join(repoRoot, '.codex')),
    ...walk(path.join(repoRoot, 'deliverables')),
    ...walk(path.join(repoRoot, 'archives')),
  ].filter((filePath) => /(?:\.md|\.toml|\.mjs|\.js|\.html|\.json|\.gitignore)$/.test(filePath));

  for (const filePath of contractFiles) {
    const source = readFileSync(filePath, 'utf8');
    for (const directory of deprecated) {
      if (source.includes(directory)) {
        errors.push(`${path.relative(repoRoot, filePath)} references deprecated stage directory ${directory}`);
      }
    }
  }

  return errors.length === 0
    ? pass('single-digit stage directory contract', `${active.length} stages`)
    : fail('single-digit stage directory contract', errors);
}

function parseRegistry() {
  const registryPath = path.join(repoRoot, '.agents', 'skill_registry.md');
  const rows = readFileSync(registryPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^\|\s*`[^`]+`\s*\|/.test(line))
    .map((line) => line.split('|').slice(1, -1).map(stripCode));
  return rows.map(([slot, skill, owner]) => ({ slot, skill, owner }));
}

function validateRegistry(rows) {
  const errors = [];
  const slots = new Set();
  for (const row of rows) {
    if (slots.has(row.slot)) errors.push(`duplicate slot: ${row.slot}`);
    slots.add(row.slot);
    if (!existsSync(path.join(skillsRoot, row.skill, 'SKILL.md'))) {
      errors.push(`${row.slot} references missing Skill ${row.skill}`);
    }
    if (row.owner !== '当前写入者' && !existsSync(path.join(repoRoot, '.codex', 'agents', `${row.owner}.toml`))) {
      errors.push(`${row.slot} references missing Agent ${row.owner}`);
    }
  }
  return errors.length === 0 ? pass('Skill Registry contracts', `${rows.length} slots`) : fail('Skill Registry contracts', errors);
}

function sectionValues(source, heading) {
  const section = source.match(new RegExp(`# ${heading}\\n([\\s\\S]*?)(?=\\n# |\\n\"\"\")`))?.[1] ?? '';
  return [...section.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1]);
}

function validateAgents(registryRows) {
  const agentRoot = path.join(repoRoot, '.codex', 'agents');
  const slots = new Set(registryRows.map((row) => row.slot));
  const errors = [];
  const files = readdirSync(agentRoot).filter((name) => name.endsWith('.toml')).sort();
  for (const fileName of files) {
    const filePath = path.join(agentRoot, fileName);
    const source = readFileSync(filePath, 'utf8');
    const name = source.match(/^name\s*=\s*"([^"]+)"/m)?.[1];
    const expectedName = path.basename(fileName, '.toml');
    if (name !== expectedName) errors.push(`${fileName} declares name=${name ?? 'missing'}`);
    for (const slot of sectionValues(source, 'Relevant Skill Slots')) {
      if (!slots.has(slot)) errors.push(`${fileName} references missing slot ${slot}`);
    }
    for (const skill of sectionValues(source, 'Current Default Skills')) {
      if (!existsSync(path.join(skillsRoot, skill, 'SKILL.md'))) {
        errors.push(`${fileName} references missing Skill ${skill}`);
      }
    }
  }
  return errors.length === 0 ? pass('Agent TOML contracts', `${files.length} agents`) : fail('Agent TOML contracts', errors);
}

function validatePackageAndImports(scriptFiles) {
  const packagePath = path.join(repoRoot, 'package.json');
  const lockPath = path.join(repoRoot, 'pnpm-lock.yaml');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const lock = readFileSync(lockPath, 'utf8');
  const dependencies = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
  const errors = [];

  if (!/^pnpm@\d+\.\d+\.\d+$/.test(packageJson.packageManager ?? '')) {
    errors.push('package.json must pin packageManager as pnpm@x.y.z');
  }
  if (!packageJson.engines?.node) errors.push('package.json is missing engines.node');
  if (!packageJson.engines?.pnpm) errors.push('package.json is missing engines.pnpm');

  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    const nodeTarget = command.match(/^node\s+([^\s]+)/)?.[1];
    if (nodeTarget && !existsSync(path.resolve(repoRoot, nodeTarget))) {
      errors.push(`package script ${name} references missing ${nodeTarget}`);
    }
  }
  for (const [name, specifier] of Object.entries(dependencies)) {
    if (!lock.includes(`${name}:`) || !lock.includes(`specifier: ${specifier}`)) {
      errors.push(`pnpm-lock.yaml does not lock ${name}@${specifier}`);
    }
  }

  const builtin = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)]);
  for (const scriptFile of scriptFiles) {
    const source = readFileSync(scriptFile, 'utf8');
    const imports = [
      ...source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g),
      ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g),
    ].map((match) => match[1]);
    for (const target of new Set(imports)) {
      if (target.startsWith('.')) {
        if (!existsSync(path.resolve(path.dirname(scriptFile), target))) {
          errors.push(`${path.relative(repoRoot, scriptFile)} imports missing ${target}`);
        }
      } else if (!builtin.has(target)) {
        const packageName = target.startsWith('@') ? target.split('/').slice(0, 2).join('/') : target.split('/')[0];
        if (!(packageName in dependencies)) {
          errors.push(`${path.relative(repoRoot, scriptFile)} imports undeclared package ${packageName}`);
        }
      }
    }
  }
  return errors.length === 0 ? pass('package scripts, lockfile, and imports', `${Object.keys(dependencies).length} dependencies`) : fail('package scripts, lockfile, and imports', errors);
}

function validateConvenienceLinks() {
  const links = new Map([
    ['skills', '.agents/skills'],
    ['codex-agents', '.codex/agents'],
  ]);
  const errors = [];
  for (const [name, target] of links) {
    const linkPath = path.join(repoRoot, name);
    if (!existsSync(linkPath)) {
      errors.push(`missing convenience link ${name}`);
      continue;
    }
    if (!lstatSync(linkPath).isSymbolicLink()) errors.push(`${name} is not a symbolic link`);
    else if (readlinkSync(linkPath) !== target) errors.push(`${name} points to ${readlinkSync(linkPath)}, expected ${target}`);
    if (!existsSync(path.resolve(repoRoot, target))) errors.push(`${name} target does not exist: ${target}`);
    const ignoreCheck = spawnSync('git', ['check-ignore', '-q', name], { cwd: repoRoot });
    if (ignoreCheck.status === 0) errors.push(`${name} is ignored by Git and would be missing from a fresh clone`);
  }
  return errors.length === 0 ? pass('repository convenience links', `${links.size} links`) : fail('repository convenience links', errors);
}

function validateDocumentationLinks() {
  const markdownFiles = [
    path.join(repoRoot, 'AGENTS.md'),
    path.join(repoRoot, 'README.md'),
    path.join(repoRoot, 'QUICK_START.md'),
    ...walk(path.join(repoRoot, '.agents')).filter((filePath) => filePath.endsWith('.md')),
    ...walk(path.join(repoRoot, 'deliverables', '0_admin')).filter((filePath) => filePath.endsWith('.md')),
  ];
  const errors = [];
  for (const filePath of markdownFiles) {
    for (const target of validateMarkdownDocument(filePath)) {
      errors.push(`${path.relative(repoRoot, filePath)} links missing ${target}`);
    }
  }
  return errors.length === 0 ? pass('Markdown file links', `${markdownFiles.length} files`) : fail('Markdown file links', errors);
}

if (!existsSync(skillsRoot)) {
  console.error(`FAIL skills root not found: ${skillsRoot}`);
  process.exit(1);
}
const skillDirectories = readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(skillsRoot, entry.name, 'SKILL.md')))
  .map((entry) => path.join(skillsRoot, entry.name))
  .sort();
const scriptFiles = walk(skillsRoot)
  .filter((filePath) => /[/\\]scripts[/\\].+\.(?:js|mjs)$/.test(filePath))
  .sort();

let passed = true;
passed = validateCorePaths() && passed;
passed = validateStageDirectoryNaming() && passed;
const registryRows = parseRegistry();
passed = validateRegistry(registryRows) && passed;
passed = validateAgents(registryRows) && passed;
passed = validateConvenienceLinks() && passed;
passed = validateDocumentationLinks() && passed;
for (const skillDirectory of skillDirectories) {
  passed = validateSkill(skillDirectory) && passed;
}
passed = validatePackageAndImports(scriptFiles) && passed;
for (const scriptFile of scriptFiles) {
  passed = run(`Node syntax ${path.relative(repoRoot, scriptFile)}`, process.execPath, ['--check', scriptFile]) && passed;
}

console.log(`Checked ${skillDirectories.length} Skills and ${scriptFiles.length} Node scripts.`);
if (!passed) process.exitCode = 1;
