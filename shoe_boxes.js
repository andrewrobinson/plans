// Shoe boxes on the sills (asked for and agreed, 19 Oct 2026): at the top
// of the stairs, one box on each of the two white sill boards either side
// of the stairwell (floor.js's HALLWAY.leftSill and rightSill), for shoes.
// Each is closed on its bottom, top, back and both ends and open on the
// long side that faces the stairs, made of 18 white panels with nothing
// inside. Its length runs along the stairs, its width from the wall (or
// the banister's base) out towards the stairs, no wider than its sill, and
// its height up from the sill. The left sill runs on under the WC wall,
// with only the sill's drop below the hallway floor for headroom: there the
// box steps down at the wall's face and its top slopes to nothing at the
// sill's far corner. None bought yet, so all sliders, both off to start.
//
// stair_walls.js holds the settings (config.hallway.shoeBoxes, starting
// as SHOE_BOXES_START) and keeps the walls' shelves and pictures clear of
// the boxes; this file gives their entries in the configuration
// (SHOE_BOXES_SCHEMA), holds each box on its sill (onTheSill()), says where
// it is (shoeBoxBounds()), draws them (drawShoeBoxes()) and makes the menu
// block (shoeBoxesControls()).
import * as THREE from 'three';
import { profile, clearDrawing } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import { hallway, HALLWAY, frameMat } from './floor.js';
import { slider } from './kit/controls_kit.js';

// ---------------------------------------------------------------------------
// The two sills, in the living room's mm (as floor.js's HALLWAY), seen
// looking down the stairs. Each: where a box's place along it is measured
// from (startX: the end by the winders; boxes run from there in -x), the
// sill's top (z), the box's back (backY, against the banister's base or
// the TV wall) and the way out from it to the stairs (outY, +1 or -1), and
// the sill's width and length. The left one's last stretch is under the WC
// wall: `open` is how far it's clear of it, `headroom` the room under it
// The left sill's end by the winders has the second newel post standing
// on it (floor.js), so its box starts behind that (agreed 19 Oct 2026)
// ---------------------------------------------------------------------------
const LEFT_START = HALLWAY.xTurn - HALLWAY.post;
const SILLS = {
  left: { label: 'On the left sill', where: 'Looking down the stairs, the sill by the banister, below the hallway floor. Past the hallway’s end it runs on under the WC wall, where the box slopes down to fit.',
    from: 'the newel posts', startX: LEFT_START, z: -HALLWAY.leftSill.below, backY: HALLWAY.ySillEdge, outY: -1,
    width: HALLWAY.leftSill.width, length: LEFT_START - HALLWAY.xSillEnd,
    underWall: { open: LEFT_START - HALLWAY.xEnd, headroom: HALLWAY.leftSill.below } },
  right: { label: 'On the right sill', where: 'Looking down the stairs, the sill against the TV wall, just below the hallway floor.',
    from: 'the lounge door wall', startX: HALLWAY.x0, z: -HALLWAY.rightSill.below, backY: HALLWAY.yHallOut, outY: 1,
    width: HALLWAY.rightSill.width, length: HALLWAY.length, underWall: null },
};
const SILL_KEYS = Object.keys(SILLS);                                  // left 240 × 1560 behind the post (1340 clear of the WC wall), right 120 × 2330

// ---------------------------------------------------------------------------
// Sizes, in mm
// ---------------------------------------------------------------------------
const PANEL_T = 18;                 // the panels' thickness (agreed: 18, white)
const SHORTEST = 200;               // the least length a box can be (chosen)
const HEIGHTS = [100, 1000];        // a box's height above its sill, lowest and highest (agreed)

// Each box as it starts: its near end at the winders' end of its sill, as
// wide as the sill, 1200 long and 300 high (agreed), the left one 370 high
// (the user's, from their link, 19 Oct 2026); off. The right one can be
// kept with its top level with the left one's (levelWithLeft, asked for
// the same day), off to start
const SHOE_BOXES_START = {
  left: { on: false, from: 0, length: 1200, width: SILLS.left.width, height: 370 },
  right: { on: false, from: 0, length: 1200, width: SILLS.right.width, height: 300, levelWithLeft: false },
};
export { SHOE_BOXES_START };

// The sliders: [key, label, lowest, highest, step], for a sill; the
// height's range agreed, the width no wider than the sill (agreed)
const slidersFor = sill => [
  ['from', `Near end, from ${sill.from}`, 0, sill.length - SHORTEST, 10],
  ['length', 'Length, along the stairs', SHORTEST, sill.length, 10],
  ['width', 'Width, out towards the stairs', 80, sill.width, 10],
  ['height', 'Height, above the sill', ...HEIGHTS, 10],
];
const LEVEL_LABEL = 'Top level with the left box’s';

// The configuration's entries: hallway.shoeBoxes.<left|right>.<key>
export const SHOE_BOXES_SCHEMA = SILL_KEYS.flatMap(key => [
  Config.onOff(`hallway.shoeBoxes.${key}.on`),
  ...slidersFor(SILLS[key]).map(([k, , lo, hi, step]) => Config.number(`hallway.shoeBoxes.${key}.${k}`, lo, hi, step)),
  ...(key === 'right' ? [Config.onOff('hallway.shoeBoxes.right.levelWithLeft')] : []),
]);

// A box held on its sill: as long as the sill at most, its near end
// brought back towards the winders so its far end is on it
export function onTheSill(key, b) {
  const { length: sillLength } = SILLS[key];
  const length = Math.min(b.length, sillLength);
  return { ...b, length, from: Math.min(b.from, sillLength - length) };
}

// The boxes with the right one's top level with the left one's, if it's
// kept so: its height the left one's less the right sill's height above
// the left (185), within its slider's range
export function levelled(boxes) {
  if (!boxes.right.levelWithLeft) return boxes;
  const height = boxes.left.height + SILLS.left.z - SILLS.right.z;
  return { ...boxes, right: { ...boxes.right, height: Math.min(Math.max(height, HEIGHTS[0]), HEIGHTS[1]) } };
}

// ---------------------------------------------------------------------------
// Its shape. `u` is the distance along the sill from its winders' end. The
// box's top is at its height, except under the WC wall: from the wall's
// face (u = open), it starts no higher than the headroom there and slopes
// to the sill at its far corner (u = the sill's length)
// ---------------------------------------------------------------------------
function topAlong(sill, b) {
  const wall = sill.underWall;
  const under = u => Math.min(b.height, wall.headroom) * (sill.length - u) / (sill.length - wall.open);
  return {
    isUnder: u => Boolean(wall) && u >= wall.open,
    near: !wall || b.from < wall.open ? b.height : under(b.from),
    far: !wall || b.from + b.length <= wall.open ? b.height : under(b.from + b.length),
    under,
  };
}

// Where a box is, in the living room's mm, for keeping the walls' shelves
// and pictures clear of it: its corners in plan, and its bottom and top
// (above the hallway floor). Null when it's off
export function shoeBoxBounds(key, b) {
  if (!b.on) return null;
  const sill = SILLS[key], openY = sill.backY + sill.outY * b.width;
  const [y0, y1] = [sill.backY, openY].sort((p, q) => p - q);
  return { x0: sill.startX - b.from - b.length, x1: sill.startX - b.from, y0, y1, z0: sill.z, z1: sill.z + b.height };
}

// The box's panels, each a side view: a polygon of [u, height above the
// sill], and whether it's the back (the rest go right across the box)
function panels(sill, b) {
  const T = PANEL_T, u0 = b.from, u1 = b.from + b.length, top = topAlong(sill, b);
  const wall = sill.underWall, open = wall ? wall.open : Infinity;
  const rect = (a, c, z0, z1) => [[a, z0], [c, z0], [c, z1], [a, z1]];
  // A strip a panel thick under a stretch of the sloping top
  const underSlope = (a, c) => [[a, top.under(a)], [c, top.under(c)], [c, Math.max(0, top.under(c) - T)], [a, Math.max(0, top.under(a) - T)]];
  // The top's height at u, as an end panel meets it
  const topAt = u => (top.isUnder(u) ? top.under(u) : b.height);

  const outline = [[u0, 0], [u0, top.near]];
  if (u0 < open && u1 > open) outline.push([open, b.height], [open, top.under(open)]);   // the step down at the WC wall's face
  outline.push([u1, top.far], [u1, 0]);

  const across = [rect(u0, u1, 0, T)];                                            // the bottom
  across.push([[u0, 0], [u0 + T, 0], [u0 + T, topAt(u0 + T)], [u0, topAt(u0)]]);   // the near end
  if (top.far > 0) across.push([[u1 - T, 0], [u1, 0], [u1, top.far], [u1 - T, topAt(u1 - T)]]);   // the far end, unless it's the sill's corner
  if (u0 < open) across.push(rect(u0, Math.min(u1, open), b.height - T, b.height));   // the top, clear of the WC wall
  if (u0 < open && u1 > open && b.height > wall.headroom) across.push(rect(open - T, open, wall.headroom - T, b.height));   // the step, against the wall's face
  if (u1 > open) across.push(underSlope(Math.max(u0, open), u1));                 // the top, under the wall
  return [{ points: outline, back: true }, ...across.map(points => ({ points, back: false }))];
}

// Consecutive points the same once, so a panel narrowing to a point (the
// slope at the sill's corner) is still a plain polygon
const withoutRepeats = points => points.filter(([u, z], i) => {
  const [pu, pz] = points[(i + points.length - 1) % points.length];
  return u !== pu || z !== pz;
});

// ---------------------------------------------------------------------------
// Drawing, in a group in the hallway's
// ---------------------------------------------------------------------------
const shoeBoxes = new THREE.Group();
hallway.add(shoeBoxes);

function drawBox(sill, b) {
  const openY = sill.backY + sill.outY * b.width, innerBackY = sill.backY + sill.outY * PANEL_T;
  for (const { points, back } of panels(sill, b)) {
    const side = withoutRepeats(points).map(([u, z]) => [sill.startX - u, sill.z + z]);
    if (side.length < 3) continue;
    const [y0, y1] = (back ? [sill.backY, innerBackY] : [sill.backY, openY]).sort((p, q) => p - q);
    profile(side, y0, y1, frameMat, shoeBoxes);
  }
}

export function drawShoeBoxes(boxes) {
  clearDrawing(shoeBoxes);
  for (const key of SILL_KEYS) if (boxes[key].on) drawBox(SILLS[key], boxes[key]);
}

// ---------------------------------------------------------------------------
// The menu's block, built into `container`: for each sill, its box's
// switch and sliders. change(edits) is called with a list of [path in
// config.hallway, value]. refusal(hallway, key, box) says why a box
// can't be where it's asked to be (it would meet a wall's shelves or
// picture), or gives null, and the edit isn't made where it can't be. The
// function returned puts the controls in step with config.hallway
// ---------------------------------------------------------------------------
export function shoeBoxesControls(container, change, refusal) {
  const id = path => `shoeBoxes_${path.replace(/\./g, '_')}`;
  const el = path => document.getElementById(id(path));
  container.innerHTML = SILL_KEYS.map(key => {
    const sill = SILLS[key];
    return `<div class="depth"><div><b>${sill.label}</b></div><div class="hint">${sill.where}</div>` +
      `<label class="switch"><input type="checkbox" id="${id(`${key}.on`)}"> A shoe box</label>` +
      `<div class="hint" id="${id(`${key}.blocked`)}" hidden></div>` +
      `<div class="depth" id="${id(`${key}.block`)}">${slidersFor(sill).map(([k, ...rest]) => slider(id)([`${key}.${k}`, ...rest])).join('')}` +
      (key === 'right' ? `<label class="switch"><input type="checkbox" id="${id('right.levelWithLeft')}"> ${LEVEL_LABEL}</label>` : '') + '</div></div>';
  }).join('');

  let shown = null;                                                    // config.hallway as last put in the controls
  const sync = stairWalls => {
    shown = stairWalls;
    for (const key of SILL_KEYS) {
      const b = stairWalls.shoeBoxes[key];
      el(`${key}.on`).checked = b.on;
      el(`${key}.blocked`).hidden = true;
      el(`${key}.block`).hidden = !b.on;
      for (const [k] of slidersFor(SILLS[key])) {
        el(`${key}.${k}`).value = String(b[k]);
        document.getElementById(`${id(`${key}.${k}`)}Value`).textContent = String(b[k]);
      }
    }
    el('right.levelWithLeft').checked = stairWalls.shoeBoxes.right.levelWithLeft;
    el('right.height').disabled = stairWalls.shoeBoxes.right.levelWithLeft;   // it follows the left box's
  };
  // One box's setting changed: held on its sill, the right one kept level
  // with the left if it's so, and each box that changes kept clear of the
  // walls' shelves and pictures, or nothing changed, saying why
  const edit = (key, k, value) => {
    const asked = levelled({ ...shown.shoeBoxes, [key]: onTheSill(key, { ...shown.shoeBoxes[key], [k]: value }) });
    const edits = SILL_KEYS.flatMap(b => Object.keys(asked[b]).filter(s => asked[b][s] !== shown.shoeBoxes[b][s]).map(s => [`shoeBoxes.${b}.${s}`, asked[b][s]]));
    const blocked = SILL_KEYS.find(b => edits.some(([path]) => path.startsWith(`shoeBoxes.${b}.`)) && refusal(shown, b, asked[b]));
    if (blocked) {
      sync(shown);
      el(`${key}.blocked`).textContent = refusal(shown, blocked, asked[blocked]);
      el(`${key}.blocked`).hidden = false;
      return;
    }
    change(edits);
  };
  for (const key of SILL_KEYS) {
    el(`${key}.on`).addEventListener('change', e => edit(key, 'on', e.target.checked));
    for (const [k] of slidersFor(SILLS[key])) el(`${key}.${k}`).addEventListener('input', e => edit(key, k, Number(e.target.value)));
  }
  el('right.levelWithLeft').addEventListener('change', e => edit('right', 'levelWithLeft', e.target.checked));
  return sync;
}
