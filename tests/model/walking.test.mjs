// Walking space round the bedroom's bed (model/walking.js): the narrowest
// gaps on the way round, measured from what's drawn, for today's bedroom
// and the designer's configurations, with their colours.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildFlat, walkingNow, walkingText } from '../../flat_model.js';
import { bedroomDoorOpensTo } from '../../model/cupboards.js';

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('../../living_room.configurations.js', import.meta.url), 'utf8'), sandbox);
const named = sandbox.window.ROOM_CONFIGURATIONS.list;

// Each gap's width and colour, by name, with walking space shown
function gapsIn(id) {
  buildFlat(structuredClone(named[id].configuration), { walking: true });
  return Object.fromEntries(walkingNow().map(g => [g.name, [g.width, g.shade]]));
}

test("today: the bookcase leaves 586 round the foot, the radiator 545 on the window side, both tight", () => {
  const gaps = gapsIn('oct18');
  assert.deepEqual(gaps['Round the foot'], [586, 'tight']);
  assert.deepEqual(gaps["The bed's window side"], [545, 'tight']);
});

test("Designer 2's L: 258 round the foot, and the door at the bed's foot can't open", () => {
  const gaps = gapsIn('designerEnd');
  assert.deepEqual(gaps['Round the foot'], [258, 'narrow']);
  assert.deepEqual(gaps['Cupboard door 6 (409 wide)'], [250, 'narrow']);
  assert.match(walkingText(), /Round the foot: 258 \(too narrow\)/);
});

test("Designer 3's shortest L: 699 round the foot, corner to corner", () => {
  assert.deepEqual(gapsIn('designerShortL')['Round the foot'], [699, 'easy']);
});

test('the bedroom door, kept open, stops at the Knarrevik by the bed and swings shut', () => {
  gapsIn('designerEnd');
  const opensTo = bedroomDoorOpensTo();
  assert.ok(opensTo > 90 && opensTo < 180, `opens to ${opensTo}°`);
  assert.deepEqual(walkingNow().find(g => g.name === 'Bedroom door swinging shut').shade, 'easy');
});

test("something in the bedroom door's sweep that it doesn't stop at (the laundry basket) is red", () => {
  const configuration = structuredClone(named.designerEnd.configuration);
  Object.assign(configuration.pieces.laundryBasket.in.bedroom, { on: true, u: 2700, v: 300 });
  buildFlat(configuration, { walking: true });
  assert.equal(walkingNow().find(g => g.name === 'Bedroom door swinging shut').shade, 'narrow');
  assert.match(walkingText(), /Bedroom door swinging shut: \d+ \(something's in its way: it can't swing shut\)/);
});
