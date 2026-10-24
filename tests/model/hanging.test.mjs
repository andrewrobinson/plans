// Hanging space (model/hanging.js, corner_cupboard.js's hangingSections()):
// each section HANG_DEPTH deep has a rail, the corner of an L counted once,
// and the bedroom's rail judged against the pine cupboard's 1240.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat, DEFAULT_CONFIGURATION, cupboardOf, hangingText, hangingVerdict, railIn, PINE_RAIL, IDEAL_RAIL } from '../../flat_model.js';
import { HANG_DEPTH } from '../../corner_cupboard.js';

const B = 18;   // the default board (model/state.js's BOARD)

// The default configuration with the bedroom's new cupboard in, its
// design changed by `design`, built with the hanging space compared
function bedroomWith(design) {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.bedroomCupboard.in.bedroom.on = true;
  Object.assign(configuration.pieces.bedroomCupboard.design, design);
  buildFlat(configuration, { hanging: true });
  return cupboardOf('bedroomCupboard').hanging;
}

test('the pine cupboard: 840 and 400 of rail, the ideal half as much again', () => {
  assert.equal(PINE_RAIL, 1240);
  assert.equal(IDEAL_RAIL, 1860);
});

test("option 7's L: the back-wall leg's rail runs into the corner, the left-wall leg's starts past it", () => {
  const sections = bedroomWith({ option: 7, T: 600, F: 1200, LEG: 600, LEG_D: 600, ENDS: false });
  assert.deepEqual(sections.map(s => [s.name, Math.round(s.to - s.from), s.depth, s.deep]), [
    ['Back-wall leg, into the corner', 1200 - 2 * B, 600 - B, true],
    ['Left-wall leg', 1200 - B - 600, 600 - B, true],
  ]);
  assert.equal(railIn('bedroom'), 1746);
  assert.equal(hangingVerdict('bedroom'), 'enough');
  assert.match(hangingText('bedroom'), /Recess cupboard's left column \(its rail runs front to back\): 384 deep, too shallow/);
});

test("a back-wall leg too shallow to hang in: the left-wall leg's rail runs into the corner instead", () => {
  const sections = bedroomWith({ option: 7, T: 600, F: 1200, LEG: 600, LEG_D: 450, ENDS: false });
  const [back, left] = sections;
  assert.deepEqual([back.deep, back.from, left.deep, left.from], [false, 600, true, B]);
  assert.equal(railIn('bedroom'), 1200 - 2 * B);
  assert.equal(hangingVerdict('bedroom'), 'short');
});

test("option 8's diagonal: only the stretches HANG_DEPTH deep have rails", () => {
  const sections = bedroomWith({ option: 8, T: 600, R: 400, F: 1400, DIAG_RUN: 1000, DIAG_BACK: 0, DIAG_LEFT: 0, ENDS: false });
  const deep = sections.filter(s => s.deep);
  assert.ok(deep.length >= 1 && sections.some(s => !s.deep), 'deep stretches and the shallow rest by the diagonal');
  for (const s of deep) assert.ok(s.depth >= HANG_DEPTH, `${s.name} is ${s.depth} deep`);
});

test("the lounge's cupboard is only compared: no verdict", () => {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  Object.assign(configuration.pieces.cornerCupboard.design, { option: 10, CORNER_W: 1200, CORNER_D: 650 });
  buildFlat(configuration, { hanging: true });
  assert.equal(hangingVerdict('livingRoom'), null);
  assert.equal(railIn('livingRoom'), 1200 - 2 * B);
});
