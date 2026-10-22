// A guard on the model's settings (REFACTOR_PLAN.md item 4, 21 Oct 2026):
// only the model (flat_model.js) writes `config`, its settings. Every other file that
// imports it, the page and its menus, only reads it, and changes a setting
// through set(path, value) or setAll(edits), which check it against the
// schema. A search of the source, so it fails before the page is run.
// (The model's own helpers in other files, as stair_walls.js's
// settleStairWalls(), are handed a part of it by the model, and don't
// import it.) Run with `npm run test:model`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFlat, readConfiguration, startAgain, config } from '../../flat_model.js';
import { savedConfigurations, displayOf } from './flat.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODEL = 'flat_model.js';
// The page's own files: those at the top and in kit/ (the tests aren't the page)
const SOURCES = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.js')),
  ...fs.readdirSync(path.join(ROOT, 'kit')).filter(f => f.endsWith('.js')).map(f => `kit/${f}`),
].filter(f => f !== MODEL);

// The name a file imports the model's settings (config) as, or null if it doesn't
function configImportedAs(source) {
  for (const [, names, from] of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    if (path.basename(from) !== MODEL) continue;
    for (const name of names.split(',')) {
      const [imported, as] = name.trim().split(/\s+as\s+/);
      if (imported === 'config') return as ?? imported;
    }
  }
  return null;
}

// Comments left out, so one may mention a write; each line kept in its
// place, so a write is reported by its line
const withoutComments = source => source
  .replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '))
  .replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// The ways to write to `name`, or to anything in it: assigned (=, +=, ??=
// and the like, not == or ===), stepped (++, --), Object.assign()ed,
// deleted, or an array in it changed in place
function writesTo(name) {
  const at = `\\b${name}(?:\\.[\\w$]+|\\[[^\\]]+\\])*`;
  return [
    new RegExp(`${at}\\s*(?:[-+*/%&|^]|\\*\\*|<<|>>>?|&&|\\|\\||\\?\\?)?=(?!=)`),
    new RegExp(`${at}\\s*(?:\\+\\+|--)|(?:\\+\\+|--)\\s*${at}`),
    new RegExp(`Object\\.assign\\(\\s*${at}\\s*,`),
    new RegExp(`\\bdelete\\s+${at}`),
    new RegExp(`${at}\\.(?:push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin)\\(`),
  ];
}

test('only the model writes its settings (config)', () => {
  const importers = [];
  const writes = [];
  for (const file of SOURCES) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const name = configImportedAs(source);
    if (!name) continue;
    importers.push(file);
    const patterns = writesTo(name);
    withoutComments(source).split('\n').forEach((line, i) => {
      if (patterns.some(p => p.test(line))) writes.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.ok(importers.includes('living_room.js'), 'living_room.js imports config (else this guards nothing)');
  assert.deepEqual(writes, [], 'config written outside the model: change it through set(path, value) or setAll(edits)');
});

// ...and building writes none of it (REFACTOR_PLAN.md item 13, 22 Oct
// 2026): what's worked out (the dresser's place, where the things to
// store stand when packed) is the build's, and what's held to what can be
// built (option 8 with no left-wall cupboard, the stairs' walls) is held as
// a setting is set or read. So every saved configuration's settings, as
// read, are as they were once it's built
test('building writes no settings', () => {
  const changed = [];
  for (const { name, configuration, view } of savedConfigurations()) {
    startAgain();
    readConfiguration(configuration);
    const read = JSON.stringify(config);
    buildFlat(configuration, view ? displayOf(view) : {});
    if (JSON.stringify(config) !== read) changed.push(name);
  }
  assert.deepEqual(changed, [], 'building changed these configurations\' settings');
});
