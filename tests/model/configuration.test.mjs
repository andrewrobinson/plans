// Reading a configuration (kit/config_kit.js, through the model's SCHEMA):
// what's left out takes its default, what isn't known is ignored, and a
// value out of its range or of the wrong kind keeps its default, as do
// configurations of another version. These were browser tests, of links;
// the saved configurations' round trips through the page stay there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat, configurationNow, get, set, setAll, startAgain } from '../../flat_model.js';
import { setValueAt } from '../../kit/config_kit.js';

const DEFAULT = structuredClone(buildFlat({ version: 2 }).configuration);
// The default configuration with settings changed, as { path: value };
// undefined takes one out
function edited(changes) {
  const c = structuredClone(DEFAULT);
  for (const [path, value] of Object.entries(changes)) {
    const keys = path.split('.'), last = keys.pop();
    const parent = keys.reduce((o, k) => o[k], c);
    if (value === undefined) delete parent[last];
    else setValueAt(c, path, value);
  }
  return c;
}
const read = configuration => structuredClone(buildFlat(configuration).configuration);

test('settings left out keep their defaults, and what isn\'t known, or is out of range, is ignored', () => {
  assert.deepStrictEqual(read(edited({
    'pieces.wickerBench': undefined, 'pieces.shoeRack.design': undefined, 'pieces.sean': undefined, 'pieces.mirror.in': undefined,
    'colours.carpet': undefined, 'pieces.sofa.in': undefined, thingsToStore: undefined,
    'pieces.cornerCupboard.design.R': 5000, 'pieces.cornerCupboard.design.T': 200, 'pieces.bench.design.height': 750,
    'pieces.aboveBench.design.what': 'everything', 'pieces.billy.in.garage.turn': 45, 'pieces.bench.in.livingRoom.on': 'yes',
    'pieces.unknown': { design: { w: 1 } },
  })), DEFAULT);
});

// Changing settings by their paths (the menus' set()): a value is the
// configuration's, checked as a link's are, so one that fails changes
// nothing; several at once in order
test('set(path, value) changes the configuration at its path, and only with a value it takes', () => {
  startAgain();
  const before = configurationNow();                            // as it starts, before anything's built (as the things to store's places)
  assert.equal(set('pieces.cornerCupboard.design.option', 7), true);
  assert.equal(set('pieces.aboveBench.design.what', 'shelves'), true);
  assert.equal(set('pieces.cornerCupboard.design.T', 200), false);       // under 300, and not 0
  assert.equal(setAll([['pieces.cornerCupboard.design.R', 500], ['pieces.bench.design.height', 750]]), false);
  assert.equal(get('pieces.cornerCupboard.design.option'), 7);
  const expected = structuredClone(before);
  for (const [path, value] of [['pieces.cornerCupboard.design.option', 7], ['pieces.aboveBench.design.what', 'shelves'],
    ['pieces.cornerCupboard.design.R', 500]]) setValueAt(expected, path, value);
  assert.deepStrictEqual(configurationNow(), expected);
  assert.throws(() => set('pieces.cornerCupboard.design.nothing', 1));
  startAgain();
});

test('a configuration of another version isn\'t read', () => {
  assert.deepStrictEqual(read(edited({ version: 3, 'pieces.cornerCupboard.design.option': 7 })), DEFAULT);
});

// The doors are the view's (REFACTOR_PLAN.md item 12): not in the
// configuration, which ignores any given it; taken from the view, each
// checked as a setting is, those it leaves out as they start. A
// configuration of version 1 had them, and is still read, its doors as the
// view's
test('the doors are the view\'s, and a version 1 configuration\'s doors are read as the view\'s', () => {
  assert.equal(DEFAULT.doors, undefined);
  const start = buildFlat({ version: 2 }).doors;
  assert.deepStrictEqual(buildFlat({ ...DEFAULT, doors: { room: 0 } }).doors, start);
  assert.deepStrictEqual(buildFlat(DEFAULT, { doors: { room: 0, tall: 500, desk: 'down', garage: 'open' } }).doors,
    { ...start, room: 0, desk: 'down', garage: 'open' });                                      // 500 is past the tall door's 180
  const old = buildFlat({ ...edited({ 'pieces.cornerCupboard.design.option': 7 }), version: 1, doors: { second: 170, garage: 'closed' } });
  assert.deepStrictEqual(old.configuration, edited({ 'pieces.cornerCupboard.design.option': 7 }));
  assert.deepStrictEqual(old.doors, { ...start, second: 170, garage: 'closed' });
});

// The garage's things: their places kept, held to the garage, in quarter
// turns; a gap from the wall, or Billy lying, left out (as from before
// there was one) as it starts
test('the garage\'s places are kept, held to the garage', () => {
  const garage = c => Object.fromEntries(['sean', 'billy', 'smallBilly'].map(k => [k, c.pieces[k].in.garage]));
  assert.deepStrictEqual(garage(read(edited({
    'pieces.sean.in.garage': { on: false, x: 3000, y: 2000, turn: 180 },
    'pieces.billy.in.garage': { on: true, x: 500, y: 500, turn: 0 },
    'pieces.smallBilly.in.garage': { on: false, x: 1000, y: 0, turn: 90 },
  }))), {
    sean: { on: false, x: 3000, y: 2000, turn: 180 },
    billy: { on: true, x: 500, y: 500, turn: 0, lying: false },
    smallBilly: { on: false, x: 1000, y: 0, turn: 90, off: 0 },
  });
  // Past the back wall's far end, and not a quarter turn
  assert.deepStrictEqual(read(edited({ 'pieces.sean.in.garage': { on: true, x: 9000, y: 2000, turn: 45 } })).pieces.sean.in.garage,
    { on: true, x: 1255, y: 2000, turn: 180 });
});

// The shoe rack's design: kept, some left out as they start, and each held
// to its slider
test('the shoe rack\'s design is kept, and held to its sliders', () => {
  const rack = design => read(edited({ 'pieces.shoeRack.design': design })).pieces.shoeRack.design;
  const chosen = { w: 900, d: 250, h: 1500, bevel: false, slope: 15, shoes: false, bevelDoor: 60 };
  assert.deepStrictEqual(rack(chosen), chosen);
  assert.deepStrictEqual(rack({ w: 900, d: 250, h: 1500 }), { w: 900, d: 250, h: 1500, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
  // Too wide, a bad switch, too steep, past 90°
  assert.deepStrictEqual(rack({ w: 5000, d: 250, h: 1500, bevel: 2, slope: 90, shoes: true, bevelDoor: 120 }),
    { w: 460, d: 250, h: 1500, bevel: true, slope: 45, shoes: true, bevelDoor: 72 });
});
