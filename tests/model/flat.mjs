// Shared by the model's tests (REFACTOR_PLAN.md, step 6c): the saved
// configurations (tests/configs/, and those in living_room.configurations.js)
// and their snapshots (tests/snapshots/), and a snapshot made in Node, as
// the page's window.plans.snapshot() makes it.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { buildFlat } from '../../flat_model.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

// Each saved configuration: { name, configuration, view } (one in
// living_room.configurations.js has no view: it's seen as the page starts,
// from above)
const STARTING_VIEW = { room: 'livingRoom', view: 'birdseye', dimensions: true, doorSizes: true, cupboardOnly: false };
export function savedConfigurations() {
  const configs = fs.readdirSync(path.join(ROOT, 'tests', 'configs')).filter(f => f.endsWith('.json'))
    .map(f => ({ name: f.replace(/\.json$/, ''), ...readJson(path.join(ROOT, 'tests', 'configs', f)) }));
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'living_room.configurations.js'), 'utf8'), sandbox);
  const named = Object.entries(sandbox.window.ROOM_CONFIGURATIONS.list)
    .map(([id, entry]) => ({ name: `configuration-${id}`, configuration: entry.configuration, view: STARTING_VIEW }));
  return [...configs, ...named];
}
export const savedSnapshot = name => readJson(path.join(ROOT, 'tests', 'snapshots', `${name}.json`));

// The 2D views, by their ids in living_room.js's builtInViews (those with
// a `fit`); any other is 3D
const FLAT_VIEWS = ['plan', 'back', 'left', 'front', 'right'];
// What the page shows, from a view as the address holds it, in the model's
// terms (setDisplay()), with its doors
export const displayOf = view => ({
  flat: FLAT_VIEWS.includes(view.view),
  flatView: FLAT_VIEWS.includes(view.view) ? view.view : null,
  flatRoom: view.room,
  cupboardOnly: view.cupboardOnly,
  showDims: view.dimensions,
  showDoorDims: view.doorSizes,
  doors: view.doors,
});
// The text of the description's HTML, as the page's textContent gives it
const textOf = html => html.replace(/<[^>]*>/g, '');

// A configuration's snapshot, made in Node: as the page's
export function snapshotOf(configuration, view = STARTING_VIEW) {
  const flat = buildFlat(configuration, displayOf(view));
  return {
    configuration: flat.configuration,
    cupboards: flat.cupboards,
    dimensions: flat.dimensions,
    description: textOf(flat.description),
    boxes: flat.boxes,
  };
}
