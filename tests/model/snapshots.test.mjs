// Every saved configuration gives, in Node, the snapshot saved beside it
// from the page (tests/snapshots/), exactly: its configuration read back,
// each cupboard's cutting list, the dimensions on show, the description and
// where each piece is drawn. Run with `npm run test:model`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { savedConfigurations, savedSnapshot, snapshotOf } from './flat.mjs';

for (const { name, configuration, view } of savedConfigurations()) {
  test(`${name} gives its saved snapshot`, () => {
    assert.deepStrictEqual(snapshotOf(configuration, view), savedSnapshot(name));
  });
}
