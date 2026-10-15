// The shoe rack: downstairs, at the foot of the stairs, a simple open rack
// of shelves between two sides (asked for, 15 Oct 2026; not bought yet, so
// its sizes are sliders). It stands on the foot's floor, between the bottom
// step and the building's back wall, and starts against the outside wall,
// clear of the flat's door, which opens into the foot.
//
// living_room.js holds the settings (state.shoeRack, starting as
// SHOE_RACK_START) and puts them in its address (SHOE_RACK_ADDRESS); this
// file says how it looks, draws it (drawShoeRack()) and makes its menu block
// (shoeRackControls()).
import * as THREE from 'three';
import { MM, material, box, valueAt } from './kit/floor_kit.js';
import { hallway, HALLWAY, ENTRANCE } from './floor.js';
import { QUARTER_TURN, SIZE_LABEL, slider } from './other_room.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm: the width, depth and height asked for (15 Oct 2026);
// the boards' thickness and the shelves' spacing chosen, as a plain
// flat-pack rack's
// ---------------------------------------------------------------------------
const RACK = {
  w: 600, d: 200, h: 1200,
  board: 18,                       // the sides' and shelves' thickness (chosen)
  bottomShelf: 40,                 // the lowest shelf's top off the floor (chosen)
  shelfPitch: 200,                 // about this far between shelves, enough for most shoes (chosen)
};
const rackMat = material(0xc9a77c);                // pale pine (chosen)

// ---------------------------------------------------------------------------
// The foot of the stairs: its floor runs along from the back wall to the
// bottom step's riser, and across from the outside wall to the wall with
// the flat's door in it (floor.js's ENTRANCE and HALLWAY)
// ---------------------------------------------------------------------------
const FOOT_LENGTH = HALLWAY.xFoot - ENTRANCE.xBack;                     // 1357
const FOOT_WIDTH = HALLWAY.yWellIn - HALLWAY.yWellOut;                  // the well: 900

// Where it starts: its back to the outside wall, its near end clear of the
// flat's door as it swings, by DOOR_GAP. The door is hinged at the back
// wall's end of its opening and sweeps a quarter circle as wide as the door,
// so it passes the rack's front corner this far along from the hinge
const DOOR_GAP = 50;                                                     // between the swinging door's edge and the rack (chosen)
const step5 = mm => Math.round(mm / 5) * 5;                              // onto the place sliders' steps
function clearOfTheDoor({ w, d }) {
  const door = ENTRANCE.flatDoor.width, hingeAcross = FOOT_WIDTH - d;   // from the hinge to the rack's front, across
  const pastHinge = Math.sqrt(Math.max(door * door - hingeAcross * hingeAcross, 0));
  return step5(ENTRANCE.flatDoor.fromBackWall + pastHinge + DOOR_GAP + w / 2);   // 745: its middle, about 310 short of the bottom step
}

export const SHOE_RACK_START = {
  w: RACK.w, d: RACK.d, h: RACK.h,
  along: clearOfTheDoor(RACK),     // its back's middle from the back wall
  across: 0,                       // ...and from the outside wall: against it
  turn: 0,
};

// The sliders, as other_room.js's: [path in state.shoeRack, label, lowest,
// highest, step, unit]. Its back's middle can go anywhere on the foot's
// floor; the turn goes all the way round to 360°, back where it began
const SIZE_SLIDERS = [['w', 300, 1200], ['d', 150, 500], ['h', 300, 2000]].map(([k, lo, hi]) => [k, SIZE_LABEL[k], lo, hi, 10, '']);
const PLACE_SLIDERS = [
  ['along', 'Back’s middle from the back wall (the window’s)', 0, FOOT_LENGTH, 5, ''],
  ['across', 'Back’s middle from the outside wall', 0, FOOT_WIDTH, 5, ''],
  ['turn', 'Turned (0° faces the internal door’s wall, 90° the back wall)', 0, 360, QUARTER_TURN, '°'],
];
const SLIDERS = [...SIZE_SLIDERS, ...PLACE_SLIDERS];
const SIZE_KEYS = SIZE_SLIDERS.map(([k]) => k);
const PLACE_KEYS = PLACE_SLIDERS.map(([k]) => k);

// ---------------------------------------------------------------------------
// The address: `w.d.h.along.across.turn`, each number held to its slider's
// range, the turn to quarter turns
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([k, , lo, hi]) => [k, [lo, hi]]));
function held(key, text, was) {
  const [lo, hi] = RANGES[key], n = text ? Number(text) : NaN;
  if (key === 'turn' && n % QUARTER_TURN !== 0) return was;
  return n >= lo && n <= hi ? n : was;
}
const ADDRESS_KEYS = [...SIZE_KEYS, ...PLACE_KEYS];
export const SHOE_RACK_ADDRESS = [
  ['shoeRack',
    r => ADDRESS_KEYS.map(k => r[k]).join('.'),
    (text, r) => {
      const parts = text.split('.');
      return Object.fromEntries(ADDRESS_KEYS.map((k, i) => [k, held(k, parts[i], r[k])]));
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
  shoeRack = rack(s);
  shoeRack.position.set((ENTRANCE.xBack + s.along) * MM, ENTRANCE.floor * MM, (HALLWAY.yWellOut + s.across) * MM);
  shoeRack.rotation.y = THREE.MathUtils.degToRad(-s.turn);
  hallway.add(shoeRack);
}

// Two sides, the full height, and shelves between them, evenly spaced from
// the bottom one up to one at the top, about RACK.shelfPitch apart
function rack({ w, d, h }) {
  const g = new THREE.Group(), half = w / 2, { board } = RACK;
  for (const x of [-half, half - board]) box({ from: [x, 0, 0], to: [x + board, d, h] }, rackMat, g);
  for (const top of shelfTops(h)) box({ from: [-half + board, 0, top - board], to: [half - board, d, top] }, rackMat, g);
  return g;
}

function shelfTops(h) {
  const rise = h - RACK.bottomShelf;
  const gaps = Math.max(1, Math.round(rise / RACK.shelfPitch));
  return Array.from({ length: gaps + 1 }, (_, i) => RACK.bottomShelf + rise * i / gaps);
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
    `<div class="depth"><div><b>Its sizes</b></div>${SIZE_SLIDERS.map(slider(id)).join('')}${reset('sizes', 'Reset dimensions')}</div>` +
    `<div class="depth"><div><b>Where it stands</b></div>${PLACE_SLIDERS.map(slider(id)).join('')}${reset('place', 'Reset location')}</div>`;

  for (const [key] of SLIDERS) document.getElementById(id(key)).addEventListener('input', e => change([[key, Number(e.target.value)]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    const keys = b.dataset.reset === 'sizes' ? SIZE_KEYS : PLACE_KEYS;
    change(keys.map(key => [key, valueAt(SHOE_RACK_START, key)]));
  }));

  return s => {
    for (const [key, , , , , unit] of SLIDERS) {
      document.getElementById(id(key)).value = String(s[key]);
      document.getElementById(`${id(key)}Value`).textContent = `${s[key]}${unit}`;
    }
  };
}
