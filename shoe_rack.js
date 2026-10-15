// The shoe rack: downstairs, at the foot of the stairs, a simple open rack
// of shelves between two sides (asked for, 15 Oct 2026; not bought yet, so
// its sizes are sliders). It stands on the foot's floor, between the bottom
// step and the building's back wall, and starts where the user put it: in
// the corner of the back wall and the outside wall, under the window.
//
// living_room.js holds the settings (state.shoeRack, starting as
// SHOE_RACK_START) and puts them in its address (SHOE_RACK_ADDRESS); this
// file says how it looks, draws it (drawShoeRack()) and makes its menu block
// (shoeRackControls()).
import * as THREE from 'three';
import { MM, material, box, slab, valueAt } from './kit/floor_kit.js';
import { hallway, HALLWAY, ENTRANCE } from './floor.js';
import { QUARTER_TURN, SIZE_LABEL, slider } from './other_room.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm: the width, depth and height the user chose with the
// sliders (15 Oct 2026); the boards' thickness and the shelves' spacing
// chosen, as a plain flat-pack rack's
// ---------------------------------------------------------------------------
const RACK = {
  w: 430, d: 190, h: 1240,
  board: 18,                       // the sides' and shelves' thickness (chosen)
  bottomShelf: 40,                 // the lowest shelf's top off the floor (chosen)
  shelfPitch: 200,                 // about this far between shelves, enough for most shoes (chosen)
  slope: 30,                       // the shelves' slant, down towards the back, in degrees (asked for, 15 Oct 2026)
};
const rackMat = material(0xc9a77c);                // pale pine (chosen)
// A UK size 11 shoe (the user's size), to see what fits: a foot about 295
// long, the shoe about 20 longer outside, about 110 wide and 100 high at the
// heel (estimated, typical of a man's shoe)
const SHOE = { length: 315, width: 110, height: 100, apart: 20 };   // apart: the gap between the pair (chosen)
const shoeMat = material(0x3a2f2a);                // dark brown leather (chosen)

// ---------------------------------------------------------------------------
// The foot of the stairs: its floor runs along from the back wall to the
// bottom step's riser, and across from the outside wall to the wall with
// the flat's door in it (floor.js's ENTRANCE and HALLWAY)
// ---------------------------------------------------------------------------
const FOOT_LENGTH = HALLWAY.xFoot - ENTRANCE.xBack;                     // 1357
const FOOT_WIDTH = HALLWAY.yWellIn - HALLWAY.yWellOut;                  // the well: 900

// Where it starts, where the user placed it (15 Oct 2026): in the corner
// of the back wall and the outside wall, under the window, its back to the
// window (turned 270°, so it faces the stairs) and its end against the
// outside wall: to the right, looking down the stairs. The internal door,
// swinging in, stops on its front-left corner (see doorOpensTo())
export const SHOE_RACK_START = {
  w: RACK.w, d: RACK.d, h: RACK.h,
  along: 0,                        // its back's middle from the back wall: against it
  across: 215,                     // ...and from the outside wall: half its width, so its end is against it
  turn: 270,
  bevel: false,                    // its front-left corner cut away for the door (below)
  slope: RACK.slope,               // the shelves' slant
  shoes: true,                     // a pair of UK 11 shoes on its bottom shelf, to see what fits
  bevelFront: 200, bevelSide: 150, // the bevel's cut: along the front from that corner, and back along its end (chosen to start: the door then opens to 78.5°, from 73.5°)
};

// ---------------------------------------------------------------------------
// The bevel (asked for, 15 Oct 2026), only where it's wanted: the rack's
// back to the window, as far right as it goes looking down the stairs (the
// corner it starts in). Its front-left corner, the one the internal door
// swings into, is cut off straight, by two sliders: how far along the front
// and how far back along its end. The door's whole swing passes over the
// rack's front there, so no bevel lets it open fully; the menu says how far
// it then opens (doorOpensTo())
// ---------------------------------------------------------------------------
// Where it stands, as set, or with the bevel in that corner
export function placeOf(s) {
  if (!s.bevel) return { along: s.along, across: s.across, turn: s.turn };
  return { along: 0, across: s.w / 2, turn: 270 };
}
// The cut, in mm (none without the bevel), held inside the rack: a board's
// width of front left at the far end, and its end's back board
export function bevelCut({ w, d, bevel, bevelFront, bevelSide }) {
  if (!bevel) return { front: 0, side: 0 };
  return { front: Math.min(bevelFront, w - 2 * RACK.board), side: Math.min(bevelSide, d) };
}

// ---------------------------------------------------------------------------
// How far the internal door opens before it meets the rack, in degrees (to
// the nearest half), up to its 90°. Worked out on the foot's floor, in mm
// along from the back wall (a) and across from the outside wall (b): the
// door, a slab ENTRANCE.flatDoor.width long and doorT thick, turns about its
// hinge from lying along its wall (0°) to across the foot (90°); the rack is
// its outline, trimmed by the bevel and placed. Each angle is tried in turn
// until the two overlap
// ---------------------------------------------------------------------------
const DOOR_STEP = 0.5;             // degrees between the angles tried (chosen)
export function doorOpensTo(s) {
  const rackOutline = footOutline(s);
  const hinge = [ENTRANCE.flatDoor.fromBackWall, FOOT_WIDTH], long = ENTRANCE.flatDoor.width, thick = ENTRANCE.doorT;
  let open = 0;
  for (let deg = DOOR_STEP; deg <= 90; deg += DOOR_STEP) {
    const t = THREE.MathUtils.degToRad(deg);
    const along = [Math.cos(t), -Math.sin(t)], lead = [-Math.sin(t), -Math.cos(t)];   // the door's length, and the way it swings
    const at = (l, k) => [hinge[0] + l * along[0] + k * lead[0], hinge[1] + l * along[1] + k * lead[1]];
    if (overlap([at(0, 0), at(long, 0), at(long, thick), at(0, thick)], rackOutline)) break;
    open = deg;
  }
  return open;
}
// The rack's outline on the foot's floor, [a, b], as it stands
function footOutline(s) {
  const { along, across, turn } = placeOf(s), half = s.w / 2, t = THREE.MathUtils.degToRad(-turn);
  // As the group's turn: its own x and depth (y) onto the floor's a and b
  return trimmed([[-half, 0], [half, 0], [half, s.d], [-half, s.d]], half, s.d, bevelCut(s))
    .map(([x, y]) => [along + x * Math.cos(t) + y * Math.sin(t), across - x * Math.sin(t) + y * Math.cos(t)]);
}
// Whether two convex outlines overlap: they don't if some edge of either
// has the other wholly on its far side (separating axes)
function overlap(p, q) {
  for (const poly of [p, q]) {
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length], axis = [y0 - y1, x1 - x0];
      const span = pts => pts.map(([x, y]) => x * axis[0] + y * axis[1]);
      const sp = span(p), sq = span(q);
      if (Math.max(...sp) <= Math.min(...sq) || Math.max(...sq) <= Math.min(...sp)) return false;
    }
  }
  return true;
}

// The sliders, as other_room.js's: [path in state.shoeRack, label, lowest,
// highest, step, unit]. Its back's middle can go anywhere on the foot's
// floor; the turn goes all the way round to 360°, back where it began
const RACK_MAX = { w: 1200, d: 500 };
const SIZE_SLIDERS = [...[['w', 300, RACK_MAX.w], ['d', 150, RACK_MAX.d], ['h', 300, 2000]].map(([k, lo, hi]) => [k, SIZE_LABEL[k], lo, hi, 10, '']),
  ['slope', 'Shelves’ slope, down towards the back', 0, 45, 5, '°']];
const PLACE_SLIDERS = [
  ['along', 'Back’s middle from the back wall (the window’s)', 0, FOOT_LENGTH, 5, ''],
  ['across', 'Back’s middle from the outside wall', 0, FOOT_WIDTH, 5, ''],
  ['turn', 'Turned (0° faces the internal door’s wall, 90° the back wall, 270° the stairs)', 0, 360, QUARTER_TURN, '°'],
];
const BEVEL_SLIDERS = [
  ['bevelFront', 'Bevel along the front', 0, RACK_MAX.w, 5, ''],
  ['bevelSide', 'Bevel back along its end', 0, RACK_MAX.d, 5, ''],
];
const SLIDERS = [...SIZE_SLIDERS, ...PLACE_SLIDERS, ...BEVEL_SLIDERS];
const SIZE_KEYS = SIZE_SLIDERS.map(([k]) => k);
const PLACE_KEYS = PLACE_SLIDERS.map(([k]) => k);

// ---------------------------------------------------------------------------
// The address: `w.d.h.along.across.turn.bevel.slope.shoes.bevelFront.bevelSide`,
// each number held to its slider's range, the turn to quarter turns; the
// bevel and the shoes 1 or 0. A link from before has fewer: the rest as they start
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([k, , lo, hi]) => [k, [lo, hi]]));
function held(key, text, was) {
  const [lo, hi] = RANGES[key], n = text ? Number(text) : NaN;
  if (key === 'turn' && n % QUARTER_TURN !== 0) return was;
  return n >= lo && n <= hi ? n : was;
}
const NUMBER_KEYS = ['w', 'd', 'h', ...PLACE_KEYS];
const ADDRESS_KEYS = [...NUMBER_KEYS, 'bevel', 'slope', 'shoes', 'bevelFront', 'bevelSide'];
const SWITCHES = ['bevel', 'shoes'];
const onOff = (text, was) => (text === '1' ? true : text === '0' ? false : was);
export const SHOE_RACK_ADDRESS = [
  ['shoeRack',
    r => ADDRESS_KEYS.map(k => (SWITCHES.includes(k) ? (r[k] ? 1 : 0) : r[k])).join('.'),
    (text, r) => {
      const parts = text.split('.');
      return Object.fromEntries(ADDRESS_KEYS.map((k, i) => {
        if (parts[i] === undefined) return [k, SHOE_RACK_START[k]];        // an older link: as it starts
        return [k, SWITCHES.includes(k) ? onOff(parts[i], r[k]) : held(k, parts[i], r[k])];
      }));
    }],
];

// ---------------------------------------------------------------------------
// Drawing: the rack in its own group, its back's middle at the origin, its
// width along x and its depth out along y, as the bedroom's pieces are;
// placed in the hallway's group at the first floor's level
// ---------------------------------------------------------------------------
// The rack as drawn now, to look at
export let shoeRack = null;

export function drawShoeRack(s) {
  if (shoeRack) shoeRack.removeFromParent();
  const { along, across, turn } = placeOf(s);
  shoeRack = rack(s, bevelCut(s));
  if (s.shoes) shoeRack.add(shoePair(s));
  shoeRack.position.set((ENTRANCE.xBack + along) * MM, ENTRANCE.floor * MM, (HALLWAY.yWellOut + across) * MM);
  shoeRack.rotation.y = THREE.MathUtils.degToRad(-turn);
  hallway.add(shoeRack);
}

// Two sides, the full height, and shelves between them, evenly spaced from
// the bottom one up to one at the top, about RACK.shelfPitch apart. With a
// bevel, each board is cut by it: drawn as its outline, trimmed, stood up.
// The shelves slope down to the back: each is its outline in plan, trimmed,
// stretched to its length along the slope and tilted at its front edge
function rack({ w, d, h, slope }, cut) {
  const g = new THREE.Group(), half = w / 2, { board } = RACK;
  const outline = (x0, x1) => trimmed([[x0, 0], [x1, 0], [x1, d], [x0, d]], half, d, cut);
  for (const [x0, x1] of [[-half, -half + board], [half - board, half]]) {   // the sides
    const o = outline(x0, x1);
    if (o.length >= 3) slab(o, 0, h, rackMat, g);
  }
  const tilt = THREE.MathUtils.degToRad(slope), o = outline(-half + board, half - board);
  for (const front of shelfFronts({ d, h, slope })) {
    const shelf = new THREE.Group();
    shelf.position.set(0, front * MM, d * MM);                          // pivoting on its front edge's top
    shelf.rotation.x = -tilt;                                           // its back down
    slab(o.map(([x, y]) => [x, (y - d) / Math.cos(tilt)]), -board, 0, rackMat, shelf);
    g.add(shelf);
  }
  return g;
}

// How far each shelf drops from front to back, and how long a shoe can lie
// along it: its length on the slope, front edge to back
const shelfDrop = ({ d, slope }) => d * Math.tan(THREE.MathUtils.degToRad(slope));
export const shoeRoom = ({ d, slope }) => Math.round(d / Math.cos(THREE.MathUtils.degToRad(slope)));

// A pair of UK 11 shoes on the bottom shelf, lying along its slope, their
// heels at its front edge, side by side in its middle: what sticks out
// past the back shows when they don't fit
function shoePair(s) {
  const tilt = THREE.MathUtils.degToRad(s.slope), front = shelfFronts(s)[0];
  const pair = new THREE.Group();
  pair.position.set(0, front * MM, s.d * MM);
  pair.rotation.x = -tilt;
  for (const x of [-SHOE.apart / 2 - SHOE.width, SHOE.apart / 2]) {
    box({ from: [x, -SHOE.length, 0], to: [x + SHOE.width, 0, SHOE.height] }, shoeMat, pair);
  }
  return pair;
}

// An outline [x, y] in the rack's own mm (its back's middle at 0, its front
// at y = d, its left end at x = -half), less what's beyond the bevel's cut:
// the line from `front` along the front to `side` back along the left end
function trimmed(points, half, d, { front, side }) {
  if (!front || !side) return points;
  const a = [-half + front, d], b = [-half, d - side];
  const keep = ([x, y]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);   // which side of the cut; the back-right corner's side is kept
  const sign = Math.sign(keep([half, 0]));
  const out = [];
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length], kp = keep(p) * sign, kq = keep(q) * sign;
    if (kp >= 0) out.push(p);
    if (kp * kq < 0) {                                                  // the edge crosses the cut: where
      const t = kp / (kp - kq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

// The shelves' front edges' heights: the lowest with its back RACK.bottomShelf
// off the floor, the top one at the rack's top, evenly spaced between
function shelfFronts(s) {
  const lowest = RACK.bottomShelf + shelfDrop(s), rise = s.h - lowest;
  if (rise <= 0) return [s.h];
  const gaps = Math.max(1, Math.round(rise / RACK.shelfPitch));
  return Array.from({ length: gaps + 1 }, (_, i) => lowest + rise * i / gaps);
}

// ---------------------------------------------------------------------------
// The menu's block, built into `container`: its sizes and its place, each
// with a button to put them back as they started. change(edits) is called
// with a list of [key, value]; the function returned puts the controls in
// step with the settings `s`.
// ---------------------------------------------------------------------------
export function shoeRackControls(container, change) {
  const id = key => `shoeRack_${key}`;
  const reset = (what, text) => `<div class="row"><button data-reset="${what}">${text}</button></div>`;
  container.innerHTML =
    `<div class="depth"><div><b>Its sizes</b></div>${SIZE_SLIDERS.map(slider(id)).join('')}` +
    `<div class="hint" id="${id('fits')}"></div>` +
    `<label class="switch"><input type="checkbox" id="${id('shoes')}"> Show a pair of UK 11 shoes</label>${reset('sizes', 'Reset dimensions')}</div>` +
    `<div class="depth"><label class="switch"><input type="checkbox" id="${id('bevel')}"> Bevel for the door</label>` +
    `<div class="hint">Stands it with its back to the window, as far right as it goes looking down the stairs, and cuts off its front-left corner, which the internal door swings into.</div>` +
    `<div id="${id('bevelSizes')}">${BEVEL_SLIDERS.map(slider(id)).join('')}</div>` +
    `<div class="hint" id="${id('door')}"></div></div>` +
    `<div class="depth" id="${id('place')}"><div><b>Where it stands</b></div>${PLACE_SLIDERS.map(slider(id)).join('')}${reset('place', 'Reset location')}</div>`;

  for (const [key] of SLIDERS) document.getElementById(id(key)).addEventListener('input', e => change([[key, Number(e.target.value)]]));
  for (const key of SWITCHES) document.getElementById(id(key)).addEventListener('change', e => change([[key, e.target.checked]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    const keys = b.dataset.reset === 'sizes' ? [...SIZE_KEYS, ...BEVEL_SLIDERS.map(([k]) => k)] : PLACE_KEYS;
    change(keys.map(key => [key, valueAt(SHOE_RACK_START, key)]));
  }));

  // The place sliders show where it stands; with the bevel that's the
  // corner, so they're greyed out
  return s => {
    const at = { ...s, ...placeOf(s) };
    for (const [key, , , , , unit] of SLIDERS) {
      document.getElementById(id(key)).value = String(at[key]);
      document.getElementById(`${id(key)}Value`).textContent = `${at[key]}${unit}`;
    }
    for (const [key] of PLACE_SLIDERS) document.getElementById(id(key)).disabled = s.bevel;
    container.querySelector('button[data-reset="place"]').disabled = s.bevel;
    for (const key of SWITCHES) document.getElementById(id(key)).checked = s[key];
    const room = shoeRoom(s);
    document.getElementById(id('fits')).textContent = `A shoe up to ${room} long lies on a shelf, front to back along its slope: a UK 11 is about ${SHOE.length}, so it ${room >= SHOE.length ? 'fits' : `sticks out ${SHOE.length - room} past the back`}.`;
    document.getElementById(id('bevelSizes')).hidden = !s.bevel;
    const opens = doorOpensTo(s);
    document.getElementById(id('door')).textContent = opens >= 90 ? 'The internal door opens all the way (90°).' : `The internal door opens to ${opens}° before it meets the rack.`;
  };
}
