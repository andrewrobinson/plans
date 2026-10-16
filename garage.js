// The garage: away from the flat, outdoors, at the ground's level (asked
// for, 16 Oct 2026). Its walls, its door, and two sets of shelves in it,
// Sean and Billy, which can be moved about and turned.
//
// living_room.js holds the settings (state.garage, starting as
// GARAGE_START) and puts them in its address (GARAGE_ADDRESS); this file
// says where the garage is, draws it and what's in it (drawGarage()), and
// makes its menu block (garageControls()).
import * as THREE from 'three';
import { MM, material, box, slab, valueAt } from './kit/floor_kit.js';
import { hallway, HALLWAY, ENTRANCE, ceilingMat, insideFace, faceAround } from './floor.js';
import { bookcase, QUARTER_TURN, slider } from './other_room.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm (the user's, 16 Oct 2026): 5327 long, from its door to
// its back wall, 2866 wide and 2432 to the ceiling. The door's an
// estimate: a standard single up-and-over door, 7' by 6'6", centred in the
// end wall, not measured.
// ---------------------------------------------------------------------------
export const GARAGE = {
  length: 5327, width: 2866, height: 2432,
  door: { width: 2134, height: 1981, thick: 40 },
};

// Where it is: scaled off the user's site plan (16 Oct 2026), the flat
// outlined in red and the garage in pink. Read with the user: the flat's
// back wall is the end the path comes to, its windows face the road, and
// the garage's door is on its end facing the driveway. The scale is the
// garage's own, its outline matching its measured size at about 36 mm a
// pixel; the flat's outline doesn't match the model as well. The garage is
// turned about 20° to the flat on the plan, but is drawn square to it (the
// user's choice). Its middle, in pixels read by eye off the plan, from the
// corner of the flat's outline where the back wall meets the stairs'
// outside wall: along the flat's length (out past the back wall is
// negative) and across it (to the right looking out is negative). So all
// estimated, to within a metre or so
const SITE_PLAN = { mmPerPixel: 36, along: -782, across: -316 };
const flatCorner = { x: ENTRANCE.xBack - ENTRANCE.backWall, y: HALLWAY.yWellOut };
const garageMiddle = {
  x: flatCorner.x + SITE_PLAN.along * SITE_PLAN.mmPerPixel,    // about 28 m out
  y: flatCorner.y + SITE_PLAN.across * SITE_PLAN.mmPerPixel,   // about 11 m to the right
};

// Its corner: its back wall's end on the right, looking in. In the
// living room's mm, as the hallway's: outside is towards -x, and looking
// out of the external door, right is towards -y. Its door faces the flat
export const GARAGE_CORNER = {
  x: Math.round(garageMiddle.x - GARAGE.length / 2),
  y: Math.round(garageMiddle.y - GARAGE.width / 2),
};

// Drawn in its own group at that corner and the lobby's level (the ground
// outside taken as level with it), in its own
// mm: x from the back wall (0) to the door's wall (5327), y from the
// right-hand wall looking in (0) to the left-hand wall (2866). It's in
// the hallway's group, so the living room's wall views leave it out too
export const garage = new THREE.Group();
garage.position.set(GARAGE_CORNER.x * MM, ENTRANCE.floor * MM, GARAGE_CORNER.y * MM);
hallway.add(garage);

const concreteMat = material(0xa9a7a2);            // a plain concrete floor (chosen: its finish isn't known)
const garageWallMat = material(0xdcd8d0);          // painted block, off-white (chosen), its own so the Colours menu leaves it be
const garageDoorMat = material(0x8f969c);          // a grey steel door (chosen)

// The floor, the walls (seen from inside only, so the views from above look
// in), the door, shut, in the end wall facing the flat, and the ceiling,
// facing down
{
  const { length: L, width: W, height: H, door } = GARAGE;
  const face = (w, h, at, facing) => insideFace(w, h, garageWallMat, at, facing, garage);
  slab([[0, 0], [L, 0], [L, W], [0, W]], -20, 0, concreteMat, garage);
  face(W, H, [0, W / 2, H / 2], '+u');                          // the back wall
  face(L, H, [L / 2, 0, H / 2], '+v');                          // the right-hand wall, looking in
  face(L, H, [L / 2, W, H / 2], '-v');                          // the left-hand wall
  const d0 = (W - door.width) / 2, d1 = d0 + door.width;
  faceAround(W, [d0, d1], [0, door.height], H, garageWallMat, a => [L, a], '-u', garage);
  box({ from: [L - door.thick, d0, 0], to: [L, d1, door.height] }, garageDoorMat, garage);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(L * MM, W * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set(L / 2 * MM, H * MM, W / 2 * MM);
  garage.add(top);
}

// ---------------------------------------------------------------------------
// What's in it: Sean and Billy, each drawn as a bookcase, a box of shelves
// (other_room.js's bookcase()). Their sizes are the user's (16 Oct 2026);
// their colours chosen
// ---------------------------------------------------------------------------
const PIECES = {
  sean: { label: 'Sean', w: 2500, d: 535, h: 1575, mat: material(0x7d8288) },    // grey, as steel shelving
  billy: { label: 'Billy', w: 800, d: 280, h: 2020, mat: material(0xf4f3ef) },   // white, as IKEA's Billy
};
const PIECE_KEYS = Object.keys(PIECES);

// Where each stands: the middle of its back, and which way it faces, in
// quarter turns as the bedroom's furniture: 0° away from the right-hand
// wall, 90° the back wall, 180° the left-hand wall, 270° the door. They
// start, as chosen, Sean along the right-hand wall in the back corner, and
// Billy against the back wall in the other corner
export const GARAGE_START = {
  sean: { x: PIECES.sean.w / 2, y: 0, turn: 0 },
  billy: { x: 0, y: GARAGE.width - PIECES.billy.w / 2, turn: 270 },
};

// The sliders, as other_room.js's: [path in state.garage, label, lowest,
// highest, step, unit]
const placeSliders = piece => [
  [`${piece}.x`, 'Back’s middle from the back wall', 0, GARAGE.length, 5, ''],
  [`${piece}.y`, 'Back’s middle from the right-hand wall (looking in)', 0, GARAGE.width, 5, ''],
  [`${piece}.turn`, 'Turned (0° faces the left-hand wall, 90° the back wall)', 0, 360 - QUARTER_TURN, QUARTER_TURN, '°'],
];
const SLIDERS = PIECE_KEYS.flatMap(placeSliders);

// ---------------------------------------------------------------------------
// The address: each piece's place as `x.y.turn`, each held to its slider's
// range, in quarter turns
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([path, , lo, hi]) => [path, [lo, hi]]));
function held(path, text, was) {
  const [lo, hi] = RANGES[path], n = text ? Number(text) : NaN;
  if (path.endsWith('.turn') && n % QUARTER_TURN !== 0) return was;   // only quarter turns
  return n >= lo && n <= hi ? n : was;
}
const PLACE_KEYS = ['x', 'y', 'turn'];
export const GARAGE_ADDRESS = PIECE_KEYS.map(piece => [`garage.${piece}`,
  p => PLACE_KEYS.map(k => p[k]).join('.'),
  (text, p) => {
    const parts = text.split('.');
    return Object.fromEntries(PLACE_KEYS.map((k, i) => [k, held(`${piece}.${k}`, parts[i], p[k])]));
  }]);

// ---------------------------------------------------------------------------
// Drawing: each piece in its own group, its back's middle at the origin,
// its width along x and its depth out along y, then placed and turned
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
garage.add(furniture);
export const garagePieces = { sean: null, billy: null };      // each piece as drawn now, to look at

export function drawGarage(s) {
  furniture.clear();
  for (const piece of PIECE_KEYS) {
    const { w, d, h, mat } = PIECES[piece], g = bookcase({ w, d, h }, mat), { x, y, turn } = s[piece];
    g.position.set(x * MM, 0, y * MM);
    g.rotation.y = THREE.MathUtils.degToRad(-turn);
    furniture.add(g);
    garagePieces[piece] = g;
  }
}

// ---------------------------------------------------------------------------
// The menu's block, built into `container`: for each piece its sizes, the
// sliders that place it and a button to put it back. change(edits) is
// called with a list of [path, value]; the function returned puts the
// controls in step with the settings `s`
// ---------------------------------------------------------------------------
export function garageControls(container, change) {
  const id = path => `garage_${path.replace('.', '_')}`;
  container.innerHTML = PIECE_KEYS.map(piece => {
    const { label, w, d, h } = PIECES[piece];
    return `<div class="depth"><div><b>${label}</b> (${w} wide, ${d} deep, ${h} high)</div>` +
      `${placeSliders(piece).map(slider(id)).join('')}` +
      `<div class="row"><button data-reset="${piece}">Reset location</button></div></div>`;
  }).join('');

  for (const [path] of SLIDERS) document.getElementById(id(path)).addEventListener('input', e => change([[path, Number(e.target.value)]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    change(placeSliders(b.dataset.reset).map(([path]) => [path, valueAt(GARAGE_START, path)]));
  }));

  return s => {
    for (const [path, , , , , unit] of SLIDERS) {
      const value = valueAt(s, path);
      document.getElementById(id(path)).value = String(value);
      document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
    }
  };
}
