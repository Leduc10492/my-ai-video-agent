#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { initialize, selectWorking, editLocal, importNotion, selectProduction,
  resolveArtifact, archiveArtifact, status, recover } from './script-store.mjs';

export function main(argv = process.argv.slice(2)) {
  const command = argv.shift();
  if (!command || command === '--help') {
    console.log('Usage: workflow-state.mjs <status|init|select-working|edit|import|select-production|resolve|archive|recover> [--root <project>] [--request <json-file>]');
    console.log('All commands are local. Only project-director commits state. Import consumes a completed connector capture; it never fetches or writes Notion. See version-management/references/local-script-workflow.md.');
    return;
  }
  const options = { root: process.cwd() };
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    if (!['--root', '--request'].includes(name) || !argv[index + 1]) throw new Error(`Unknown or incomplete argument: ${name}`);
    if (options[name.slice(2)] && name !== '--root') throw new Error(`Repeated option: ${name}`);
    options[name.slice(2)] = argv[index + 1];
  }
  const handlers = { status, init: initialize, 'select-working': selectWorking, edit: editLocal,
    import: importNotion, 'select-production': selectProduction, resolve: resolveArtifact, archive: archiveArtifact, recover };
  if (!handlers[command]) throw new Error(`Unknown command: ${command}`);
  if (!options.request && !['status', 'recover'].includes(command)) throw new Error(`${command} requires --request <json-file>`);
  const request = options.request ? JSON.parse(fs.readFileSync(path.resolve(options.request), 'utf8')) : {};
  const result = handlers[command](path.resolve(options.root), request);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); }
  catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}
