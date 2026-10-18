// The back-wall cupboard depth slider (R) is named for what it sets
// (corner_cupboard.js's rearLabel()), and hidden where it sets nothing: in
// options 7 and 10 it's only the bench's depth, so with no bench (the
// bedroom's cupboard, or the Bench switch off) there's no slider, and
// nothing about a bench.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rearLabel } from '../../corner_cupboard.js';

const TOWER = { TOWER: 400 }, NO_TOWER = { TOWER: 0 };

test('with no bench, R is named for the cupboard it sets, or hidden', () => {
  assert.equal(rearLabel(7, TOWER, false), null);
  assert.equal(rearLabel(10, TOWER, false), null);
  assert.equal(rearLabel(8, TOWER, false), 'Back-wall cupboard depth');
  assert.equal(rearLabel(9, TOWER, false), 'Shelving tower depth');
  assert.equal(rearLabel(9, NO_TOWER, false), null);
  assert.equal(rearLabel(11, TOWER, false), 'Doors start, out from the back wall');
  for (const no of [7, 8, 9, 10, 11]) assert.ok(!/bench/i.test(rearLabel(no, TOWER, false) ?? ''), `option ${no}`);
});

test('with the bench, R is the bench\'s depth, and the cupboard\'s where it sets one', () => {
  assert.equal(rearLabel(7, TOWER, true), 'Bench depth');
  assert.equal(rearLabel(10, TOWER, true), 'Bench depth');
  assert.equal(rearLabel(16, TOWER, true), 'Bench depth');
  assert.equal(rearLabel(8, TOWER, true), 'Back-wall cupboard depth');
  assert.equal(rearLabel(9, TOWER, true), 'Back-wall cupboard depth');
  assert.equal(rearLabel(11, TOWER, true), 'Back-wall cupboard depth');
});
