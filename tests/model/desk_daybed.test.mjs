// The daybed with a desk and bookcase (desk_daybed.js): drawn at the
// maker's sizes, its desk at either end; out to start, and in the
// lounge, in place of the bench, as Billy is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import { deskDaybed, DESK_DAYBED } from '../../desk_daybed.js';
import { buildFlat, DEFAULT_CONFIGURATION } from '../../flat_model.js';

const DESK_H = 740;                                          // desk_daybed.js's: the desk top's height

// Its size, in mm: [along, up, out]
const sizeOf = object => new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()).toArray().map(v => Math.round(v / MM));
// The desk top's middle along it, in mm: the board whose top is at the desk's height
function deskMiddle(daybed) {
  const top = daybed.children.find(m => Math.round(new THREE.Box3().setFromObject(m).max.y / MM) === DESK_H);
  return Math.round(top.position.x / MM);
}

test('drawn at the maker\'s 263 × 114 × 100 cm', () => {
  const { w, d, h } = DESK_DAYBED;
  assert.deepEqual(sizeOf(deskDaybed()), [w, h, d]);
});

test('its desk at the left end, or put together the other way round', () => {
  const left = deskMiddle(deskDaybed('left')), right = deskMiddle(deskDaybed('right'));
  assert.ok(left < 0);
  assert.ok(Math.abs(right + left) <= 1, `${left} and ${right}`);   // mirrored (its middle on a half mm, rounded)
});

test('out to start; on, in place of the bench, said where', () => {
  assert.doesNotMatch(buildFlat(DEFAULT_CONFIGURATION).description, /daybed with a desk/);
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.billy.in.livingRoom.on = false;
  configuration.pieces.bench.in.livingRoom.on = true;
  Object.assign(configuration.pieces.deskDaybed, { design: { deskAt: 'right' }, in: { livingRoom: { on: true, move: null } } });
  const { description } = buildFlat(configuration);
  assert.match(description, /The daybed with a desk and bookcase, its desk at the right end \(2630 wide, 1140 deep, 1000 high\) on the back wall/);
  assert.match(description, /No bench: BillyChest and the daybed stand there instead/);
});
