// The shoe rack: downstairs, at the foot of the stairs, a simple open rack
// of shelves between two sides (asked for, 15 Oct 2026; not bought yet, so
// its sizes are sliders). It always stands in the same place, as the user
// asked: in the foot's back right corner looking down the stairs, its back
// to the window and its end against the outside wall, facing the stairs,
// so its shelves slope down towards the window.
//
// living_room.js holds the settings (state.shoeRack, starting as
// SHOE_RACK_START) and puts them in its address (SHOE_RACK_ADDRESS) and its
// configuration (SHOE_RACK_SCHEMA); this
// file says how it looks, draws it (drawShoeRack()) and makes its menu block
// (shoeRackControls()).
import * as THREE from 'three';
import { MM, material, box, slab, valueAt } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import { hallway, HALLWAY, ENTRANCE } from './floor.js';
import { QUARTER_TURN, SIZE_LABEL, slider } from './other_room.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm: the user's conclusion (15 Oct 2026), to fit a pair of
// UK 11 shoes on each shelf: 300 deep, 1290 high, its shelves sloping 45°,
// with the bevel cut for the internal door opening to 72° (the width, 460,
// is for without the bevel: with it, it's the well's). The boards'
// thickness and the shelves' spacing chosen, as a plain flat-pack rack's
// ---------------------------------------------------------------------------
const RACK = {
  w: 460, d: 300, h: 1290,
  board: 18,                       // the sides' and shelves' thickness (chosen)
  bottomShelf: 40,                 // the lowest shelf's top off the floor (chosen)
  shelfPitch: 200,                 // about this far between shelves, enough for most shoes (chosen)
  slope: 45,                       // the shelves' slant, down towards the back, in degrees (the user's conclusion)
};
const rackMat = material(0xc9a77c);                // pale pine (chosen)
// A UK size 11 shoe (the user's size), to see what fits: a foot about 295
// long, the shoe about 20 longer outside, about 110 wide and 100 high at the
// heel (estimated, typical of a man's shoe)
const SHOE = { length: 315, width: 110, height: 100, apart: 20 };   // apart: the gap between the pair (chosen)
const shoeMat = material(0x3a2f2a);                // dark brown leather (chosen)

// ---------------------------------------------------------------------------
// The foot of the stairs: its floor runs along from the back wall (a) to
// the bottom step's riser, and across from the outside wall (b) to the wall
// with the flat's door in it (floor.js's ENTRANCE and HALLWAY)
// ---------------------------------------------------------------------------
const FOOT_WIDTH = HALLWAY.yWellIn - HALLWAY.yWellOut;                  // the well: 900

export const SHOE_RACK_START = {
  w: RACK.w, d: RACK.d, h: RACK.h,
  bevel: true,                     // its front-left corner cut away for the internal door (below)
  slope: RACK.slope,               // the shelves' slant
  shoes: true,                     // a pair of UK 11 shoes on each shelf, to see what fits
  bevelDoor: 72,                   // the internal door's angle the bevel is cut for, in degrees (the user's conclusion)
};

// Where it stands: in its own mm (its back's middle at 0, its width along
// x, its front at y = d), turned to face the stairs, its back on the back
// wall and its end on the outside wall. On the foot's floor that's a = y
// (along from the back wall) and b = w / 2 - x (across from the outside
// wall): its front-left corner, (-w / 2, d), is the one by the door
const onFoot = (w, [x, y]) => [y, w / 2 - x];

// ---------------------------------------------------------------------------
// The internal door, on the foot's floor: hinged at the back wall's end of
// its opening, it turns from lying along its wall (0°) to across the foot
// (90°). Its leading face runs from the hinge; its thickness trails behind.
// At `deg`: how far a point is ahead of that face, the way it swings
// (`ahead`), and how far out along it from the hinge (`out`)
// ---------------------------------------------------------------------------
const HINGE = [ENTRANCE.flatDoor.fromBackWall, FOOT_WIDTH];
function doorAt(deg) {
  const t = THREE.MathUtils.degToRad(deg), along = [Math.cos(t), -Math.sin(t)], lead = [-Math.sin(t), -Math.cos(t)];
  const rel = ([a, b]) => [a - HINGE[0], b - HINGE[1]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  return { ahead: p => dot(rel(p), lead), out: p => dot(rel(p), along) };
}

// ---------------------------------------------------------------------------
// The bevel (asked for, 15 Oct 2026): the rack is as wide as it can be, the
// well's whole width, and cut for the internal door opening to an angle of
// its own slider (bevelDoor), so the cut stays whatever the door does:
// only what the door sweeps to reach that angle, BEVEL_GAP clear, the part
// of its front-left corner behind the door's leading face and within the
// door's length of the hinge. The depth and that angle are there to try.
// Without the bevel, the menu says how far the door opens before meeting
// the rack (doorOpensTo())
// ---------------------------------------------------------------------------
const BEVEL_GAP = 10;              // between the door's face and the cut (chosen)
export const widthOf = s => (s.bevel ? FOOT_WIDTH : s.w);
// A board's outline, in the rack's own mm, as the pieces left once the
// door at `deg` has swept what it reaches: the part still ahead of its
// face (by BEVEL_GAP), and the part beyond its end
function aroundTheDoor(points, w, deg) {
  const door = doorAt(deg), reach = ENTRANCE.flatDoor.width + BEVEL_GAP;
  const ahead = p => door.ahead(onFoot(w, p)) - BEVEL_GAP;              // >= 0: not swept yet
  const beyond = p => door.out(onFoot(w, p)) - reach;                    // >= 0: past its end
  return [clip(points, ahead), clip(clip(points, beyond), p => -ahead(p))].filter(o => o.length >= 3);
}
// With the bevel, how wide the rack's front edge is left, in mm, to the
// nearest one: its points not swept by the door
export function frontLeft(s, deg) {
  const w = widthOf(s), door = doorAt(deg), reach = ENTRANCE.flatDoor.width + BEVEL_GAP;
  let kept = 0;
  for (let x = -w / 2 + 0.5; x < w / 2; x++) {
    const p = onFoot(w, [x, s.d]);
    if (door.ahead(p) >= BEVEL_GAP || door.out(p) >= reach) kept++;
  }
  return kept;
}
// An outline less the part where f < 0, f being straight (Sutherland-Hodgman)
function clip(points, f) {
  const out = [];
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length], fp = f(p), fq = f(q);
    if (fp >= 0) out.push(p);
    if (fp * fq < 0) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

// How far the door opens before it meets the rack, uncut, in degrees to
// the nearest DOOR_STEP, up to its 90°: each angle tried in turn until the
// door's outline overlaps the rack's
const DOOR_STEP = 0.5;             // degrees between the angles tried (chosen)
export function doorOpensTo({ w, d }) {
  const rackOutline = [[-w / 2, 0], [w / 2, 0], [w / 2, d], [-w / 2, d]].map(p => onFoot(w, p));
  let open = 0;
  for (let deg = DOOR_STEP; deg <= 90; deg += DOOR_STEP) {
    if (overlap(doorOutline(deg), rackOutline)) break;
    open = deg;
  }
  return open;
}
function doorOutline(deg) {
  const t = THREE.MathUtils.degToRad(deg), along = [Math.cos(t), -Math.sin(t)], lead = [-Math.sin(t), -Math.cos(t)];
  const at = (l, k) => [HINGE[0] + l * along[0] + k * lead[0], HINGE[1] + l * along[1] + k * lead[1]];
  return [at(0, 0), at(ENTRANCE.flatDoor.width, 0), at(ENTRANCE.flatDoor.width, -ENTRANCE.doorT), at(0, -ENTRANCE.doorT)];
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
// highest, step, unit]
const SIZE_SLIDERS = [...[['w', 300, 1200], ['d', 150, 500], ['h', 300, 2000]].map(([k, lo, hi]) => [k, SIZE_LABEL[k], lo, hi, 10, '']),
  ['slope', 'Shelves’ slope, down towards the window', 0, 45, 5, '°']];
const BEVEL_SLIDER = ['bevelDoor', 'Bevel for internal door angle', 0, 90, 1, '°'];
const SLIDERS = [...SIZE_SLIDERS, BEVEL_SLIDER];
const SIZE_KEYS = SIZE_SLIDERS.map(([k]) => k);

// ---------------------------------------------------------------------------
// The address: `w.d.h.bevel.slope.shoes.bevelDoor`, each number held to its
// slider's range, the bevel and the shoes 1 or 0. A link from before has
// fewer: the rest as they start
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([k, , lo, hi]) => [k, [lo, hi]]));
function held(key, text, was) {
  const [lo, hi] = RANGES[key], n = text ? Number(text) : NaN;
  return n >= lo && n <= hi ? n : was;
}
const ADDRESS_KEYS = ['w', 'd', 'h', 'bevel', 'slope', 'shoes', 'bevelDoor'];
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

// The configuration's entries (kit/config_kit.js): the rack's design, each
// size held to its slider's range. It always stands in the same place
// downstairs, so it has no `in`
const designEntry = key => {
  const at = `pieces.shoeRack.design.${key}`, setting = `shoeRack.${key}`;
  if (SWITCHES.includes(key)) return Config.onOff(at, setting);
  const [, , lo, hi, step] = SLIDERS.find(([k]) => k === key);
  return Config.number(at, setting, lo, hi, step);
};
export const SHOE_RACK_SCHEMA = ADDRESS_KEYS.map(designEntry);

// ---------------------------------------------------------------------------
// Drawing: the rack in its own group, its back's middle at the origin, its
// width along x and its depth out along y, as the bedroom's pieces are;
// placed in the hallway's group at the first floor's level, in its corner
// ---------------------------------------------------------------------------
// The rack as drawn now, to look at
export let shoeRack = null;
const FACING_THE_STAIRS = 270;     // its turn, in degrees as the group turns: its back to the window

export function drawShoeRack(s) {
  if (shoeRack) shoeRack.removeFromParent();
  const sized = { ...s, w: widthOf(s) };
  shoeRack = rack(sized, s.bevel ? s.bevelDoor : null);
  if (s.shoes) shoeRack.add(shoePairs(sized));
  shoeRack.position.set(ENTRANCE.xBack * MM, ENTRANCE.floor * MM, (HALLWAY.yWellOut + sized.w / 2) * MM);
  shoeRack.rotation.y = THREE.MathUtils.degToRad(-FACING_THE_STAIRS);
  hallway.add(shoeRack);
}

// Two sides, the full height, and shelves between them, evenly spaced from
// the bottom one up to one at the top, about RACK.shelfPitch apart. Each
// board is its outline in plan, cut round the door when there's a bevel,
// stood up. The shelves slope down to the back: each outline is stretched
// to its length along the slope and tilted at its front edge
function rack({ w, d, h, slope }, doorDeg) {
  const g = new THREE.Group(), half = w / 2, { board } = RACK;
  const pieces = (x0, x1) => {
    const outline = [[x0, 0], [x1, 0], [x1, d], [x0, d]];
    return doorDeg === null ? [outline] : aroundTheDoor(outline, w, doorDeg);
  };
  for (const [x0, x1] of [[-half, -half + board], [half - board, half]]) {   // the sides
    for (const o of pieces(x0, x1)) slab(o, 0, h, rackMat, g);
  }
  const tilt = THREE.MathUtils.degToRad(slope), shelf = pieces(-half + board, half - board);
  for (const front of shelfFronts({ d, h, slope })) {
    const tilted = new THREE.Group();
    tilted.position.set(0, front * MM, d * MM);                         // pivoting on its front edge's top
    tilted.rotation.x = -tilt;                                          // its back down
    for (const o of shelf) slab(o.map(([x, y]) => [x, (y - d) / Math.cos(tilt)]), -board, 0, rackMat, tilted);
    g.add(tilted);
  }
  return g;
}

// How far each shelf drops from front to back, and how long a shoe can lie
// along it: its length on the slope, front edge to back
const shelfDrop = ({ d, slope }) => d * Math.tan(THREE.MathUtils.degToRad(slope));
export const shoeRoom = ({ d, slope }) => Math.round(d / Math.cos(THREE.MathUtils.degToRad(slope)));

// A pair of UK 11 shoes on every shelf, the top one too, lying along its
// slope, their heels at its front edge, as far right as they go looking
// down the stairs: against the side board at the outside wall's end, clear
// of the bevel. What sticks out past the back shows when they don't fit
function shoePairs(s) {
  const tilt = THREE.MathUtils.degToRad(s.slope), g = new THREE.Group();
  const right = s.w / 2 - RACK.board;                                  // the inside of the right-hand side board
  for (const front of shelfFronts(s)) {
    const pair = new THREE.Group();
    pair.position.set(0, front * MM, s.d * MM);
    pair.rotation.x = -tilt;
    for (const x1 of [right, right - SHOE.width - SHOE.apart]) {
      box({ from: [x1 - SHOE.width, -SHOE.length, 0], to: [x1, 0, SHOE.height] }, shoeMat, pair);
    }
    g.add(pair);
  }
  return g;
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
// The menu's block, built into `container`: its sizes, with a button to put
// them back as they started, and the bevel. change(edits) is called with a
// list of [key, value]; the function returned puts the controls in step
// with the settings `s`
// ---------------------------------------------------------------------------
export function shoeRackControls(container, change) {
  const id = key => `shoeRack_${key}`;
  container.innerHTML =
    `<div class="hint">It stands in the back right corner looking down the stairs: its back to the window, its end against the outside wall.</div>` +
    `<div class="depth"><div><b>Its sizes</b></div>${SIZE_SLIDERS.map(slider(id)).join('')}` +
    `<div class="hint" id="${id('fits')}"></div>` +
    `<label class="switch"><input type="checkbox" id="${id('shoes')}"> Show UK 11 shoes, a pair on each shelf</label>` +
    `<div class="row"><button data-reset="sizes">Reset dimensions</button></div></div>` +
    `<div class="depth"><label class="switch"><input type="checkbox" id="${id('bevel')}"> Bevel for the door</label>` +
    `<div class="hint">Makes it as wide as the well and cuts off its front-left corner where the internal door swings, as far as the angle below. The cut stays as the door opens and closes (Doors menu), so set the door, read its angle, and set this to match. Try its depth too.</div>` +
    `<div id="${id('bevelSlider')}">${slider(id)(BEVEL_SLIDER)}</div>` +
    `<div class="hint" id="${id('door')}"></div></div>`;

  for (const [key] of SLIDERS) document.getElementById(id(key)).addEventListener('input', e => change([[key, Number(e.target.value)]]));
  for (const key of SWITCHES) document.getElementById(id(key)).addEventListener('change', e => change([[key, e.target.checked]]));
  container.querySelector('button[data-reset]').addEventListener('click', () => change(SIZE_KEYS.map(key => [key, valueAt(SHOE_RACK_START, key)])));

  return s => {
    const shown = { ...s, w: widthOf(s) };                             // with the bevel, the well's width
    for (const [key, , , , , unit] of SLIDERS) {
      document.getElementById(id(key)).value = String(shown[key]);
      document.getElementById(`${id(key)}Value`).textContent = `${shown[key]}${unit}`;
    }
    document.getElementById(id('w')).disabled = s.bevel;
    document.getElementById(id('bevelSlider')).hidden = !s.bevel;
    for (const key of SWITCHES) document.getElementById(id(key)).checked = s[key];
    const room = shoeRoom(s);
    document.getElementById(id('fits')).textContent = `A shoe up to ${room} long lies on a shelf, front to back along its slope: a UK 11 is about ${SHOE.length}, so it ${room >= SHOE.length ? 'fits' : `sticks out ${SHOE.length - room} past the back`}.`;
    const opens = doorOpensTo(s);
    document.getElementById(id('door')).textContent = s.bevel
      ? `Cut for the door at ${s.bevelDoor}°, its front is ${frontLeft(s, s.bevelDoor)} wide of the ${shown.w} at the back.`
      : opens >= 90 ? 'The internal door opens all the way (90°).' : `The internal door opens to ${opens}° before it meets the rack.`;
  };
}
