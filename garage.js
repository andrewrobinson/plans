// The garage: away from the flat, outdoors, at the ground's level (asked
// for, 16 Oct 2026). Its walls, its door, and two sets of shelves in it,
// Sean, Billy and BillyChest, which can be moved about, turned and taken
// out.
//
// living_room.js holds the settings (state.garage, starting as
// GARAGE_START) and puts them in its address (GARAGE_ADDRESS); this file
// says where the garage is, draws it and what's in it (drawGarage()), and
// makes Garage options' block (garageControls()).
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
// in), the door in the end wall facing the flat, and the ceiling, facing
// down. The door's drawn open, as the user asked (16 Oct 2026), to look in
// from outside: up and over, lying flat inside, its outer face down, its
// edge at the opening's head
{
  const { length: L, width: W, height: H, door } = GARAGE;
  const face = (w, h, at, facing) => insideFace(w, h, garageWallMat, at, facing, garage);
  slab([[0, 0], [L, 0], [L, W], [0, W]], -20, 0, concreteMat, garage);
  face(W, H, [0, W / 2, H / 2], '+u');                          // the back wall
  face(L, H, [L / 2, 0, H / 2], '+v');                          // the right-hand wall, looking in
  face(L, H, [L / 2, W, H / 2], '-v');                          // the left-hand wall
  const d0 = (W - door.width) / 2, d1 = d0 + door.width;
  faceAround(W, [d0, d1], [0, door.height], H, garageWallMat, a => [L, a], '-u', garage);
  // ...and its outside face, in the same plane (its thickness isn't known),
  // so looking in from outside shows the wall round the doorway; from
  // above the door it hides a little of the floor (the user's choice)
  faceAround(W, [d0, d1], [0, door.height], H, garageWallMat, a => [L, a], '+u', garage);
  box({ from: [L - door.height, d0, door.height], to: [L, d1, door.height + door.thick] }, garageDoorMat, garage);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(L * MM, W * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set(L / 2 * MM, H * MM, W / 2 * MM);
  garage.add(top);
}

// ---------------------------------------------------------------------------
// What's in it: Sean and Billy, each drawn as a bookcase, a box of shelves
// (other_room.js's bookcase()), and BillyChest, a plain box. Each can be
// taken out, as the bedroom's furniture. Their sizes are the user's (16 Oct
// 2026); their colours chosen
// ---------------------------------------------------------------------------
const white = material(0xf4f3ef);                  // as IKEA's Billy
const PIECES = {
  sean: { label: 'Sean', w: 2500, d: 535, h: 1575, mat: material(0x7d8288), shape: 'shelves' },   // grey, as steel shelving
  billy: { label: 'Billy', w: 800, d: 280, h: 2020, mat: white, shape: 'shelves' },
  billyChest: { label: 'BillyChest', w: 805, d: 484, h: 780, mat: white, shape: 'box' },
};
const PIECE_KEYS = Object.keys(PIECES);

// Where each stands: the middle of its back, and which way it faces, in
// quarter turns as the bedroom's furniture: 0° away from the right-hand
// wall, 90° the back wall, 180° the left-hand wall, 270° the door. They
// start where the user put them (16 Oct 2026): Sean's back to the
// left-hand wall, near the back, and Billy's to the back wall, facing the
// door, nearer the left-hand wall than the right. All start in; BillyChest
// with its back to the back wall beside Billy, on his right-hand-wall side,
// CHEST_GAP from him (chosen)
const CHEST_GAP = 20;
const besideBilly = 1920 - PIECES.billy.w / 2 - CHEST_GAP - PIECES.billyChest.w / 2;
export const GARAGE_START = {
  sean: { on: true, x: 1255, y: 2865, turn: 180 },
  billy: { on: true, x: 0, y: 1920, turn: 270 },
  billyChest: { on: true, x: 0, y: Math.round(besideBilly / 5) * 5, turn: 270 },   // onto the sliders' 5s
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
// The address: each piece as `on.x.y.turn`, on 1 or 0, its place held to
// its slider's range, in quarter turns. Sean's and Billy's were `x.y.turn`
// before they could be taken out, which still reads, with them in
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([path, , lo, hi]) => [path, [lo, hi]]));
function held(path, text, was) {
  const [lo, hi] = RANGES[path], n = text ? Number(text) : NaN;
  if (path.endsWith('.turn') && n % QUARTER_TURN !== 0) return was;   // only quarter turns
  return n >= lo && n <= hi ? n : was;
}
const PLACE_KEYS = ['x', 'y', 'turn'];
const onOff = (text, was) => (text === '1' ? true : text === '0' ? false : was);
export const GARAGE_ADDRESS = PIECE_KEYS.map(piece => [`garage.${piece}`,
  p => [p.on ? 1 : 0, ...PLACE_KEYS.map(k => p[k])].join('.'),
  (text, p) => {
    const parts = text.split('.');
    const on = parts.length > PLACE_KEYS.length ? onOff(parts.shift(), p.on) : p.on;
    return { on, ...Object.fromEntries(PLACE_KEYS.map((k, i) => [k, held(`${piece}.${k}`, parts[i], p[k])])) };
  }]);

// ---------------------------------------------------------------------------
// Drawing: each piece in its own group, its back's middle at the origin,
// its width along x and its depth out along y, then placed and turned
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
garage.add(furniture);
// Each piece as drawn now, to look at: one taken out is hidden, but still
// placed, so Looking at it aims at its spot
export const garagePieces = { sean: null, billy: null, billyChest: null };

export function drawGarage(s) {
  furniture.clear();
  for (const piece of PIECE_KEYS) {
    const g = drawn(PIECES[piece]), { x, y, turn } = s[piece];
    g.position.set(x * MM, 0, y * MM);
    g.rotation.y = THREE.MathUtils.degToRad(-turn);
    g.visible = s[piece].on;
    furniture.add(g);
    garagePieces[piece] = g;
  }
}
function drawn({ w, d, h, mat, shape }) {
  if (shape === 'shelves') return bookcase({ w, d, h }, mat);
  const g = new THREE.Group();
  box({ from: [-w / 2, 0, 0], to: [w / 2, d, h] }, mat, g);
  return g;
}

// ---------------------------------------------------------------------------
// Garage options' block, built into `container`, laid out as Bedroom
// options: for each piece its name and sizes, its In the garage switch, the
// sliders that place it and a button to put it back. change(edits) is
// called with a list of [path, value]; the function returned puts the
// controls in step with the settings `s`
// ---------------------------------------------------------------------------
export function garageControls(container, change) {
  const id = path => `garage_${path.replace('.', '_')}`;
  container.innerHTML = PIECE_KEYS.map(piece => {
    const { label, w, d, h } = PIECES[piece];
    return `<div class="depth"><div><b>${label}</b> (${w} wide, ${d} deep, ${h} high)</div>` +
      `<label class="switch"><input type="checkbox" id="${id(`${piece}.on`)}"> In the garage</label>` +
      placeSliders(piece).map(slider(id)).join('') +
      `<div class="row"><button data-reset="${piece}">Reset location</button></div></div>`;
  }).join('');

  for (const [path] of SLIDERS) document.getElementById(id(path)).addEventListener('input', e => change([[path, Number(e.target.value)]]));
  for (const piece of PIECE_KEYS) document.getElementById(id(`${piece}.on`)).addEventListener('change', e => change([[`${piece}.on`, e.target.checked]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    change(placeSliders(b.dataset.reset).map(([path]) => [path, valueAt(GARAGE_START, path)]));
  }));

  return s => {
    for (const [path, , , , , unit] of SLIDERS) {
      const value = valueAt(s, path);
      document.getElementById(id(path)).value = String(value);
      document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
    }
    for (const piece of PIECE_KEYS) document.getElementById(id(`${piece}.on`)).checked = s[piece].on;
  };
}
