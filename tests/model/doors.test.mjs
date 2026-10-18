// The corner cupboards' doors (corner_cupboard.js's doorCount() and
// doorWidth()): the fewest across a front that keep each one MAX_DOOR_W or
// under, all the same width, DOOR_GAP clear of the front's ends and each
// other, and an even number across the fronts that have a pair. That no
// cupboard built has a wider door, in any option with its settings at their
// ends, generated.test.mjs checks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { doorCount, doorWidth, DOOR_GAP, MAX_DOOR_W } from '../../corner_cupboard.js';

test('a front has one door up to MAX_DOOR_W, then more, all the same width', () => {
  const widest = MAX_DOOR_W + 2 * DOOR_GAP;                      // the longest front with one door
  assert.equal(doorCount(widest), 1);
  assert.equal(doorWidth(widest), MAX_DOOR_W);
  assert.equal(doorCount(widest + 1), 2);
  assert.equal(doorCount(2 * MAX_DOOR_W + 3 * DOOR_GAP), 2);
  assert.equal(doorCount(2 * MAX_DOOR_W + 3 * DOOR_GAP + 1), 3);
  for (const span of [100, 606, 607, 900, 1240, 1858, 2700]) {
    const n = doorCount(span), w = doorWidth(span, n);
    assert.ok(w <= MAX_DOOR_W, `${span}: ${n} of ${w}`);
    assert.ok(n === 1 || doorWidth(span, n - 1) > MAX_DOOR_W, `${span}: ${n} isn't the fewest`);
    assert.equal(n * w + (n + 1) * DOOR_GAP, span);
  }
});

test('a front that has a pair keeps an even number', () => {
  assert.equal(doorCount(300, true), 2);
  assert.equal(doorCount(1209, true), 2);
  assert.equal(doorCount(1210, true), 4);                        // three would do, but they hang in pairs
  assert.equal(doorCount(1840, true), 4);
});
