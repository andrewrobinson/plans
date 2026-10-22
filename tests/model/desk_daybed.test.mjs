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

// The daybed in the room as it opens, in Billy's place, with the TV above it
// and the speakers on it
function withTvAndSpeakers(edit = () => {}) {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.billy.in.livingRoom.on = false;
  configuration.pieces.deskDaybed.in.livingRoom = { on: true, move: null, tvAbove: true };
  configuration.pieces.speakers.in.livingRoom.on = 'deskDaybed';
  edit(configuration);
  return buildFlat(configuration);
}

test('the TV above it: centred on its bed, 150 over its top', () => {
  const { description } = withTvAndSpeakers();
  assert.match(description, /Above the daybed: a 75" TV \(1680 × 960\), centred on its bed, from 1150 to 2110\./);
  const pulledOut = withTvAndSpeakers(c => { c.pieces.deskDaybed.in.livingRoom.move = { x: 1500, y: 500, turn: 0 }; });
  assert.match(pulledOut.description, /No TV above the daybed: it isn't against the back wall\./);
});

test('the speakers on its bookcase, either side of the TV, their fronts flush with it', () => {
  const box = withTvAndSpeakers().boxes['speakers.livingRoom'];
  const bedMiddle = 421 + 1900 / 2;                          // its desk's column, then half its bed, from the left wall
  assert.equal((box.from[0] + box.to[0]) / 2, bedMiddle);
  assert.equal(box.to[0] - box.from[0] - 170, 1680 + 2 * 100 + 170);
  assert.deepEqual([box.from[2], box.to[1] - 2], [1000, 240]);   // on its top; the badge 2 proud of the front
});

// The daybed in Billy's place, its back's middle at x (slid along the back
// wall), and a chair at its desk
function atX(x, edit = () => {}) {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.billy.in.livingRoom.on = false;
  configuration.pieces.deskDaybed.in.livingRoom = { on: true, move: { x, y: 0, turn: 0 }, tvAbove: false, chair: 'small' };
  edit(configuration);
  return buildFlat(configuration);
}

test('the chair at its desk: pulled up at the open end, and the room there said', () => {
  const built = atX(1950);                                    // slid against BillyChest: its desk's end at 635
  assert.match(built.description, /At the daybed's desk there's 635 from its end to the left wall\. Pulled up to it, the smaller armless chair \(drawn\) reaches 430 past it, 205 to spare; the office chair reaches 470 past it, 165 to spare\./);
  const chair = built.boxes['workChair.livingRoom'];
  assert.deepEqual([chair.from[0], chair.to[0]], [635 - 430, 635 + 170]);   // its base 300 either side of a centre 130 out from the end
});

test('the chair\'s room, with a corner cupboard in the way, or the desk at the other end', () => {
  const cupboard = atX(1950, c => { c.pieces.cornerCupboard.design.option = 10; });   // its 800 along the back wall
  assert.match(cupboard.description, /no room to sit: the corner cupboard reaches 165 in over its end\./);
  const right = atX(1315, c => {
    Object.assign(c.pieces.deskDaybed, { design: { deskAt: 'right' } });
    c.pieces.deskDaybed.in.livingRoom.chair = 'office';
    c.pieces.sofa.design.model = 'none';                      // the Drift, as the page opens, stands across that end
  });
  assert.match(right.description, /there's 634 from its end to BillyChest\..*the office chair \(drawn\) reaches 470 past it, 164 to spare/);
  assert.equal(atX(1950, c => { c.pieces.deskDaybed.in.livingRoom.chair = 'none'; }).boxes['workChair.livingRoom'], null);
});
