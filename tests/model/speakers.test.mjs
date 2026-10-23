// The speakers (flat_model.js's SPEAKER_SURFACES): a pair on the bench,
// centred on the TV; on Billy lying, moving with it; on the corner
// cupboard's top when it stops short of the ceiling with room above; and
// nowhere, said why, when their place isn't there. Their spacing on the
// bench and Billy is held to what they stand on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat, DEFAULT_CONFIGURATION } from '../../flat_model.js';

const SPEAKER_W = 170, SET_BACK = 20;   // speakers.js's FENRIS_A5.w; flat_model.js's SPEAKER_SET_BACK

// The default configuration with the speakers `on`, and more edits made
// to it by `edit(configuration)`
function withSpeakers(on, edit = () => {}, spacing = { bench: null, billy: null }) {
  const configuration = structuredClone(DEFAULT_CONFIGURATION);
  configuration.pieces.speakers.in.livingRoom = { on, spacing };
  edit(configuration);
  return buildFlat(configuration);
}
// The pair's box, and their middles' distance apart, along x (turned 0)
const pair = built => built.boxes['speakers.livingRoom'];
const apart = box => box.to[0] - box.from[0] - SPEAKER_W;
// The bench in place of Billy and BillyChest
// The bench on, with the TV over it (a piece of its own since 24 Oct 2026)
const benchOn = c => {
  c.pieces.billy.in.livingRoom.on = c.pieces.billyChest.in.livingRoom.on = false;
  c.pieces.bench.in.livingRoom.on = true;
  c.pieces.tv.in.livingRoom.on = true;
};

test('none to start', () => {
  assert.equal(pair(buildFlat(DEFAULT_CONFIGURATION)), null);
});

test('on the bench, centred on the 75" TV, 100 clear of each side', () => {
  const box = pair(withSpeakers('bench', benchOn));
  assert.equal(apart(box), 1680 + 2 * 100 + SPEAKER_W);
  assert.equal((box.from[0] + box.to[0]) / 2, 3838 / 2);
  assert.equal(box.from[2], 780);                                   // on the bench's top
});

test('on the bench, set apart, and held to the bench', () => {
  assert.equal(apart(pair(withSpeakers('bench', benchOn, { bench: 2500, billy: null }))), 2500);
  const option10 = c => { benchOn(c); c.pieces.cornerCupboard.design.option = 10; };   // the bench from 800, past its corner cupboard
  const held = withSpeakers('bench', option10, { bench: 3000, billy: null });
  assert.equal(pair(held).from[0], 800);                            // as far as the bench's end
  assert.match(held.description, /as far apart as it lets them/);
});

test('under the shelf below the TV, the description says they clash', () => {
  assert.match(withSpeakers('bench', benchOn).description, /They clash with the shelf at 1000/);
  assert.doesNotMatch(withSpeakers('bench', c => { benchOn(c); c.pieces.aboveBench.design.what = 'nothing'; }).description, /clash/);
});

test('on Billy, lying: 100 in from its ends, on its top, flush with its front less the set-back', () => {
  const box = pair(withSpeakers('billy'));
  assert.equal(apart(box), 2020 - 2 * 100 - SPEAKER_W);
  assert.equal(box.from[2], 800);
  assert.equal(box.to[1] - 2, 280 - SET_BACK);                      // the badge stands 2 proud
});

test('on Billy, they turn with it', () => {
  const box = pair(withSpeakers('billy', c => { c.pieces.billy.in.livingRoom.move = { x: 1500, y: 2500, turn: 90 }; }));
  assert.ok(box.to[1] - box.from[1] > box.to[0] - box.from[0]);     // the pair now runs along y
});

test('on Billy standing, none, said why', () => {
  const built = withSpeakers('billy', c => { c.pieces.billy.in.livingRoom.lying = false; });
  assert.equal(pair(built), null);
  assert.match(built.description, /No speakers: they go on Billy lying on its side/);
});

test('on the corner cupboard: only below the ceiling, with room above', () => {
  const option10 = top => c => Object.assign(c.pieces.cornerCupboard.design, { option: 10, TOP: top });
  assert.match(withSpeakers('cupboard', option10(0)).description, /runs to the ceiling/);
  assert.match(withSpeakers('cupboard', option10(2200)).description, /only 243 clear above it/);
  const box = pair(withSpeakers('cupboard', option10(2100)));
  assert.equal(box.from[2], 2100);
  const gap = (800 - 2 * SPEAKER_W) / 3;                            // option 10's corner cupboard, 800 along the back wall
  assert.ok(Math.abs(box.from[0] - gap) <= 1 && Math.abs(800 - box.to[0] - gap) <= 1);
});
