// The front wall between the sink and the desk: the dresser or a larder can
// stand there in every option, the room as it is (16) too (asked for, 22 Oct
// 2026), unless the island's against that wall.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat, CURRENT_ROOM } from '../../flat_model.js';

const DEFAULT = structuredClone(buildFlat({ version: 2 }).configuration);   // the room as it is
// The default configuration with the front wall's piece and the island's place
function withFrontWall(piece, islandAt = 'room') {
  const c = structuredClone(DEFAULT);
  c.livingRoom.frontWall = piece;
  c.pieces.island.in.livingRoom.at = islandAt;
  return c;
}

test('the dresser and a larder stand on the front wall in the room as it is', () => {
  assert.equal(DEFAULT.pieces.cornerCupboard.design.option, CURRENT_ROOM);
  assert.match(buildFlat(withFrontWall('dresser')).description, /A dresser on the front wall between the sink and the desk/);
  assert.match(buildFlat(withFrontWall('larder')).description, /A larder on the front wall between the sink and the desk/);
  assert.doesNotMatch(buildFlat(withFrontWall('none')).description, /on the front wall between the sink and the desk/);
});

test('the island against the front wall takes the dresser\'s place', () => {
  const { description } = buildFlat(withFrontWall('dresser', 'along'));
  assert.match(description, /The kitchen island against the front wall/);
  assert.doesNotMatch(description, /A dresser on the front wall/);
});
