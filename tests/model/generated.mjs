// Generated configurations (REFACTOR_PLAN.md, step 6c): from the default,
// for every option, one setting at a time at each end of its range (each
// choice of a choice, on and off), and each board thickness; so each piece
// in each room it can be in too; and the bedroom's own cupboard in each
// option, its settings at their ends. Each must build without error, with no
// size that isn't a number, no board in the cutting lists of no size, no
// door wider than MAX_DOOR_W, the corner cupboard and what stands on the
// front wall inside the living room (with its doors at each end of their
// sliders too: they stop at the walls),
// and the same configuration back after a trip through the address. A
// failure names the setting and gives its link, to open and look at.
//
// They're shared out among SHARDS files (generated_1.test.mjs and on), each
// taking every SHARDS-th configuration, as `node --test` runs files at once
// (one alone took about 75 s).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFlat, SCHEMA, OPTIONS } from '../../flat_model.js';
import { MAX_DOOR_W } from '../../corner_cupboard.js';
import { pack, unpack, valueAt, setValueAt } from '../../kit/config_kit.js';
import { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT } from '../../floor.js';

const PAGE = 'https://andrewrobinson.github.io/plans/index.html';
const DEFAULT = structuredClone(buildFlat({ version: 2 }).configuration);
const OPTION = 'pieces.cornerCupboard.design.option';
const BOARD = 'pieces.cornerCupboard.design.BOARD';
const OPTION_NUMBERS = OPTIONS.map(o => o.no);
const BEDROOM_DESIGN = 'pieces.bedroomCupboard.design', BEDROOM_OPTION = `${BEDROOM_DESIGN}.option`, BEDROOM_ON = 'pieces.bedroomCupboard.in.bedroom.on';

// The values to try for an entry: a number's ends, a choice's every
// choice, on and off, two colours; for the others a few of their own (the
// option is tried anyway, and the things to store's places follow their
// packing unless moved by hand)
const MOVED = { x: 1500, y: 2000, turn: 90 };
function valuesOf(entry) {
  switch (entry.kind) {
    case 'number': return [entry.min, entry.max];
    case 'onOff': return [true, false];
    case 'choice': return entry.choices.map(([word]) => word);
    case 'colour': return [0, 9010];
    default:
      if (entry.path.includes('L_SHELVES')) return [[], [100], [100, 800, 1500, 2200]];
      if (entry.path.endsWith('.move')) return [null, MOVED];
      return [];
  }
}
// Every configuration to try, as [what it is, the configuration]
function* configurations() {
  for (const no of OPTION_NUMBERS) {
    const base = structuredClone(DEFAULT);
    setValueAt(base, OPTION, no);
    yield [`option ${no}`, base];
    const changed = (path, value) => {
      const c = structuredClone(base);
      setValueAt(c, path, structuredClone(value));
      return c;
    };
    for (const entry of SCHEMA) {
      for (const value of valuesOf(entry)) {
        if (JSON.stringify(value) !== JSON.stringify(valueAt(base, entry.path))) yield [`option ${no}, ${entry.path} ${JSON.stringify(value)}`, changed(entry.path, value)];
      }
    }
    for (let board = 12; board <= 25; board++) yield [`option ${no}, boards ${board} thick`, changed(BOARD, board)];
  }
  // The bedroom's own corner cupboard, on, in each option, its settings at
  // their ends one at a time (above, with it off, they build nothing)
  for (const no of OPTION_NUMBERS) {
    const base = structuredClone(DEFAULT);
    setValueAt(base, BEDROOM_ON, true);
    setValueAt(base, BEDROOM_OPTION, no);
    yield [`the bedroom's option ${no}`, base];
    for (const entry of SCHEMA.filter(e => e.path.startsWith(BEDROOM_DESIGN))) {
      for (const value of valuesOf(entry)) {
        if (JSON.stringify(value) === JSON.stringify(valueAt(base, entry.path))) continue;
        const c = structuredClone(base);
        setValueAt(c, entry.path, structuredClone(value));
        yield [`the bedroom's option ${no}, ${entry.path} ${JSON.stringify(value)}`, c];
      }
    }
  }
}

// What's wrong with what's built, if anything
const inLivingRoom = ({ from, to }) => from.every(v => v >= 0) && to[0] <= ROOM_WIDTH && to[1] <= ROOM_DEPTH && to[2] <= CEILING_HEIGHT;
// The cupboard's doors stop at the walls (flat_model.js's opensTo()), so the
// room's checked with them opened too
function problems(flat) {
  const found = [];
  flat.world.traverse(o => {
    if (o.isMesh && o.geometry.attributes.position.array.some(v => !Number.isFinite(v))) found.push(`a shape with a size that isn't a number (${o.userData.part ?? 'unnamed'})`);
  });
  for (const [cupboard, rows] of Object.entries(flat.cupboards)) {
    for (const row of rows ?? []) if (!(row.length > 0 && row.width > 0 && row.count > 0)) found.push(`the ${cupboard} cutting list has ${JSON.stringify(row)}`);
    for (const row of rows ?? []) if (row.kind === 'Doors' && row.width > MAX_DOOR_W) found.push(`the ${cupboard} has a door ${row.width} wide`);
  }
  for (const piece of ['cornerCupboard', 'dresser', 'larder']) {
    const box = flat.boxes[piece];
    if (box?.shown && !inLivingRoom(box)) found.push(`the ${piece} reaches out of the living room: ${JSON.stringify(box)}`);
  }
  return found;
}

export const SHARDS = 6;              // chosen: the Mac has 8 cores, leaving two for the other tests
const ALL_TRIED = 1000;               // at least this many in all, so a schema that lost its entries fails

export function testShard(shard) {
  test(`generated configurations build, fit and round-trip (${shard} of ${SHARDS})`, () => tryShard(shard));
}
async function tryShard(shard) {
  const failures = [];
  let tried = 0, k = 0;
  for (const [what, configuration] of configurations()) {
    if (k++ % SHARDS !== shard - 1) continue;
    tried++;
    const fail = async problem => failures.push(`${what}: ${problem}\n  ${PAGE}#${await pack(configuration)}`);
    let flat;
    try {
      flat = buildFlat(configuration);
    } catch (e) {
      await fail(e.stack.split('\n').slice(0, 3).join(' '));
      continue;
    }
    for (const p of problems(flat)) await fail(p);
    // Through the address and back: what it read, read again the same
    const read = structuredClone(flat.configuration);
    const again = buildFlat(await unpack(await pack(read))).configuration;
    if (JSON.stringify(again) !== JSON.stringify(read)) await fail('changed on the way through the address');
  }
  assert.ok(tried > ALL_TRIED / SHARDS, `only ${tried} tried`);
  assert.deepStrictEqual(failures, [], `${failures.length} of ${tried} failed`);
}
