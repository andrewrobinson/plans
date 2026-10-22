// Writes the saved configurations again through the model (buildFlat()), so
// a new setting comes into each at its default, in the export's order, and
// their snapshots with them: tests/configs/, the configurations in
// living_room.configurations.js and tests/snapshots/. Run with
// `npm run regen` after adding a setting, then check the diff adds only it
// (REFACTOR_PLAN.md: done by hand each time before 19 Oct 2026).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { savedConfigurations, snapshotOf, displayOf } from './flat.mjs';
import { buildFlat } from '../../flat_model.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const CONFIGS = path.join(ROOT, 'tests', 'configs');
const SNAPSHOTS = path.join(ROOT, 'tests', 'snapshots');
const LISTED = path.join(ROOT, 'living_room.configurations.js');
const LISTED_PREFIX = 'configuration-';                               // savedConfigurations()'s names for those listed
const asJson = value => `${JSON.stringify(value, null, 2)}\n`;

// A configuration as the model reads it back: every setting, in order; and
// the doors as built, which a saved address's view holds (one of version 1
// had them in its configuration: REFACTOR_PLAN.md item 12)
const throughModel = (configuration, view) => buildFlat(configuration, displayOf(view));

// The text of the object that starts at `from` (its opening brace) in
// `text`, braces counted outside strings
function objectEnd(text, from) {
  let depth = 0, inString = false;
  for (let i = from; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i + 1;
  }
  throw new Error('unclosed object');
}

// living_room.configurations.js with entry `id`'s configuration replaced
// by `configuration`, indented as it was
function withListedConfiguration(text, id, configuration) {
  const entry = text.search(new RegExp(`^\\s*${id}: \\{`, 'm'));
  if (entry < 0) throw new Error(`no configuration ${id}`);
  const key = text.indexOf('configuration: {', entry);
  const start = text.indexOf('{', key), end = objectEnd(text, start);
  const indent = text.slice(text.lastIndexOf('\n', key) + 1, key);
  const json = JSON.stringify(configuration, null, 2).replace(/\n/g, `\n${indent}`);
  return text.slice(0, start) + json + text.slice(end);
}

let listed = fs.readFileSync(LISTED, 'utf8');
for (const { name, configuration, view } of savedConfigurations()) {
  const { configuration: regenerated, doors } = throughModel(configuration, view);
  let seen = view;
  if (name.startsWith(LISTED_PREFIX)) {
    listed = withListedConfiguration(listed, name.slice(LISTED_PREFIX.length), regenerated);
  } else {
    const file = path.join(CONFIGS, `${name}.json`);
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    seen = { ...view, doors };
    fs.writeFileSync(file, asJson({ ...saved, configuration: regenerated, view: seen }));
  }
  fs.writeFileSync(path.join(SNAPSHOTS, `${name}.json`), asJson(snapshotOf(regenerated, seen)));
}
fs.writeFileSync(LISTED, listed);
