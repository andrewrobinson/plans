// The radiator under the first window, which can be taken out (asked for,
// 22 Oct 2026), and the pine cupboard by the door, with the bench past it
// (route b in notes/PERMUTATIONS.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat } from '../../flat_model.js';

const DEFAULT = structuredClone(buildFlat({ version: 2 }).configuration);   // the room as it is
// The room with Billy, BillyChest and the Ivar out and the daybed on the
// back wall, its back's middle at x
function withDaybed(x, firstRadiator = true) {
  const c = structuredClone(DEFAULT);
  for (const key of ['billy', 'billyChest', 'ivar']) c.pieces[key].in.livingRoom.on = false;
  c.pieces.deskDaybed.in.livingRoom = { on: true, tvAbove: false, chair: 'none', move: { x, y: 0, turn: 0 } };
  c.livingRoom.firstRadiator = firstRadiator;
  return c;
}
const DAYBED_FLUSH_X = 3838 - 2630 / 2;            // its end flush to the window wall
const DAYBED_CLEAR_X = 3838 - 132 - 2630 / 2;      // its end at the radiator's front

test('the first radiator is in to start, and a piece that runs into it is said', () => {
  assert.equal(DEFAULT.livingRoom.firstRadiator, true);
  assert.match(buildFlat(withDaybed(DAYBED_FLUSH_X)).description, /The daybed runs into the radiator under the first window\./);
  assert.doesNotMatch(buildFlat(withDaybed(DAYBED_CLEAR_X)).description, /runs into the radiator/);   // up against its front
  assert.doesNotMatch(buildFlat(DEFAULT).description, /runs into the radiator/);                     // the Ivar against it
});

test('taken out, the daybed can stand flush to the window wall', () => {
  const { description } = buildFlat(withDaybed(DAYBED_FLUSH_X, false));
  assert.match(description, /The radiator under the first window is taken out, and its pipes\./);
  assert.doesNotMatch(description, /runs into the radiator/);
});

test('the pine cupboard by the door stands beside the bench, which starts past it', () => {
  const c = structuredClone(DEFAULT);
  for (const key of ['billy', 'billyChest']) c.pieces[key].in.livingRoom.on = false;
  c.pieces.bench.in.livingRoom.on = true;
  c.pieces.pineCupboard.in.livingRoom = { on: true, move: { x: 60, y: 710, turn: 270 } };
  const { description } = buildFlat(c);
  assert.match(description, /Bench 3278, from x 560 \(past the pine cupboard by the door\) to the right-hand wall/);
  assert.match(description, /pine cupboard \(1300 wide, 500 deep, 1790 high\) in the corner by the door/);
  // ...but on the back wall, it's in the bench's place, as before
  c.pieces.pineCupboard.in.livingRoom.move = null;
  assert.match(buildFlat(c).description, /No bench: the pine cupboard stands there instead\./);
});
