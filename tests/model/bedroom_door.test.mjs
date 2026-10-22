// The bedroom door's swing (bedroom_door.js) and how it limits the new
// cupboard along the kitchen-side wall (flat_model.js's cupboardLimits()):
// swinging right, as it was, the limits are as before; swinging left, the
// cupboard keeps clear of the door opened as far as it must, its length
// brought in when the door's settings change, and the door stops where it
// meets the cupboard.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sweepInto, opensTo, DOOR_SWINGS } from '../../bedroom_door.js';
import { buildFlat, DEFAULT_CONFIGURATION, cupboardLimits, bedroomDoorOpensTo, config } from '../../flat_model.js';

const BREAST_FACE = 2841, CLEAR = 10;   // floor.js's OTHER_ROOM.breastFace; flat_model.js's DOOR_SWING_CLEAR

// The default configuration with the new cupboard on as option 7 at depth
// `T` and length `F`, and the door swinging `swings`, built
function withCupboard({ T = 600, F = 1200, swings = 'right', mustOpenTo = 90 } = {}) {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.bedroomCupboard.in.bedroom.on = true;
  Object.assign(configuration.pieces.bedroomCupboard.design, { option: 7, T, F });
  configuration.bedroom.door = { ...configuration.bedroom.door, swings, mustOpenTo };
  return buildFlat(configuration);
}

test('swinging right, the limits are as before: the door sweeps right round', () => {
  for (const [T, most] of [[400, 2197], [600, 2103], [800, 2071]]) {
    withCupboard({ T });
    assert.equal(cupboardLimits('bedroomCupboard').F, most, `at ${T} deep`);
  }
});

test('swinging left, the door sweeps its full width out along the kitchen-side wall at 90°', () => {
  assert.equal(DOOR_SWINGS.left.stopsAt, 94);                   // its free edge meets the wall 60 from its hinge
  assert.equal(sweepInto('left', 90, 300), 760);
  assert.equal(sweepInto('left', 0, 300), 0);
  for (const T of [300, 600, 800]) {
    withCupboard({ T, swings: 'left' });
    assert.equal(cupboardLimits('bedroomCupboard').F, BREAST_FACE - 760 - CLEAR, `at ${T} deep`);
  }
});

test('swinging left, needing it to open less lets the cupboard come out further', () => {
  withCupboard({ swings: 'left', mustOpenTo: 60 });
  const at60 = cupboardLimits('bedroomCupboard').F;
  withCupboard({ swings: 'left', mustOpenTo: 75 });
  const at75 = cupboardLimits('bedroomCupboard').F;
  assert.ok(at60 > at75 && at75 > BREAST_FACE - 760 - CLEAR, `${at60}, ${at75}`);
});

test('a cupboard too long for the door swinging left is brought in', () => {
  const built = withCupboard({ T: 396, F: 2192, swings: 'left' });
  assert.equal(built.configuration.pieces.bedroomCupboard.design.F, BREAST_FACE - 760 - CLEAR);
  assert.equal(bedroomDoorOpensTo(), DOOR_SWINGS.left.stopsAt);  // shorter than the limit, the door opens to the wall
});

test('the door stops where it meets the cupboard', () => {
  withCupboard({ T: 396, F: 2192, swings: 'left', mustOpenTo: 60 });
  assert.equal(config.pieces.bedroomCupboard.design.F, 2192);    // allowed, as it only has to open to 60°
  const opens = bedroomDoorOpensTo();
  assert.ok(opens >= 60 && opens < 90, `${opens}`);
  assert.equal(opens, opensTo('left', 396, BREAST_FACE - 2192));
});
