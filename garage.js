// The garage: away from the flat, outdoors, at the ground's level (asked
// for, 16 Oct 2026). Its walls, its door, and two sets of shelves in it,
// Sean, Billy and BillyChest, which can be moved about, turned and taken
// out, and the other things the user keeps there.
//
// living_room.js holds the settings (state.garage, starting as
// GARAGE_START); this file gives their entries in the configuration
// (GARAGE_SCHEMA), says where the garage is, draws it and what's in it (drawGarage()), and
// makes Garage options' block (garageControls()).
import * as THREE from 'three';
import { MM, material, box, slab, valueAt, clearDrawing } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import { hallway, HALLWAY, ENTRANCE, ceilingMat, insideFace, faceAround } from './floor.js';
import { pineCupboard, OTHER_ROOM_START, QUARTER_TURN, slider, lyingSwitch } from './other_room.js';
import { bookcase } from './bookcase.js';
import { BILLY, BILLY_CHEST, billy, billyChest } from './billy.js';
import { IVAR, ivar } from './ivar.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm (the user's, 16 Oct 2026): 5327 long, from its door to
// its back wall, 2866 wide and 2432 to the ceiling. The door's an
// estimate: a standard single up-and-over door, 7' by 6'6", centred in the
// end wall, not measured. It opens as the user described it (18 Oct 2026):
// pushed in at its top, which runs back on a rail under the ceiling, while
// its bottom swings out in front of the garage, never more than 1 m
// (swingOut).
// ---------------------------------------------------------------------------
export const GARAGE = {
  length: 5327, width: 2866, height: 2432,
  door: { width: 2134, height: 1981, thick: 40, swingOut: 1000 },
};
// The door as drawn (Garage options): not at all (to start), open or closed
export const GARAGE_DOOR = { hidden: 'Not shown', open: 'Open', closed: 'Closed' };

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
// in), the doorway in the end wall facing the flat, and the ceiling, facing
// down. The door itself is drawGarage()'s, as Garage options say
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
  const top = new THREE.Mesh(new THREE.PlaneGeometry(L * MM, W * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set(L / 2 * MM, H * MM, W / 2 * MM);
  garage.add(top);
}

// ---------------------------------------------------------------------------
// What's in it: Sean, timber shelving: a frame at each end holding up
// shelves of scaffold boards (the user's photo, 16 Oct 2026); Billy
// (billy.js), standing or lying on its long side (`canLie`); BillyChest (billy.js), a plain box (the user's, 16
// Oct 2026); then (also 16 Oct 2026) Metal, a table; Yellow, a cupboard;
// the scaffold bench, a scaffold board on legs; Small Billy, a cupboard;
// Potters, open shelves; and Biltong and Trellis, boxes open at the top;
// the bedroom's pine cupboard (other_room.js's pineCupboard()), at the
// sizes set in Bedroom options (`bedroomSizes`), as its copy in the living
// room. Each can be taken out, as the bedroom's furniture. Their sizes are the
// user's: w along its back, d out from it, h high; their colours chosen.
// Yellow sits on the scaffold bench and Biltong on Trellis, so those two
// have a height above the floor (`lifted`); Small Billy and Potters stand
// a little off the wall behind them, held off by the floor's and the
// walls' slopes, so those two have a gap from it (`offWall`)
// ---------------------------------------------------------------------------
const white = material(0xf4f3ef);                  // as IKEA's Billy
const steel = material(0x7d8288);                  // grey, as steel shelving
const newPine = material(0xe3c48f);                // pale, as new construction timber
const scaffoldBoard = material(0xc9a66b);          // a scaffold board's sandy pine
const PIECES = {
  sean: { label: 'Sean', w: 2500, d: 535, h: 1575, mat: newPine, shape: 'timber shelves' },
  billy: { label: 'Billy', ...BILLY, shape: 'billy', canLie: true },
  billyChest: { label: 'BillyChest', ...BILLY_CHEST, shape: 'billyChest' },
  metal: { label: 'Metal', w: 710, d: 670, h: 895, mat: steel, shape: 'table' },
  yellow: { label: 'Yellow', w: 875, d: 310, h: 700, mat: material(0xe2b93b), shape: 'box', lifted: true },
  scaffoldBench: { label: 'Scaffold bench', w: 1820, d: 220, h: 438, mat: scaffoldBoard, shape: 'bench' },
  smallBilly: { label: 'Small Billy', w: 600, d: 290, h: 1540, mat: white, shape: 'box', offWall: true },
  potters: { label: 'Potters', w: 430, d: 390, h: 1535, mat: material(0x9a7b55), shape: 'shelves', offWall: true },   // a mid wood
  biltong: { label: 'Biltong', w: 940, d: 445, h: 460, mat: material(0x8a6a4a), shape: 'open box', lifted: true },
  trellis: { label: 'Trellis', w: 860, d: 720, h: 750, mat: material(0x6f8a5a), shape: 'open box' },   // a garden green
  pine: { label: 'Pine cupboard', ...sizesOf(OTHER_ROOM_START.cupboard), shape: 'pine', bedroomSizes: true },
  ivar: { label: 'Ivar', ...IVAR, shape: 'ivar' },
};
function sizesOf({ w, d, h }) { return { w, d, h }; }
const PIECE_KEYS = Object.keys(PIECES);
const LYING_KEYS = PIECE_KEYS.filter(piece => PIECES[piece].canLie);

// Their make, chosen as typical, none measured: the table's top and legs,
// the bench's board (a scaffold board's 38 thick) and legs, and the open
// boxes' sides and bottom
const TABLE = { top: 30, leg: 40 };
const BENCH = { board: 38, leg: 50, legIn: 100 };  // legIn: the legs in from the board's ends
const OPEN_BOX_SIDE = 18;
// Sean's make, read off the user's photo (16 Oct 2026) and agreed with them,
// none measured: a frame at each end, two uprights (front and back) joined
// across the depth by a rail under each shelf, all 38 by 89 construction
// timber (CLS, the usual "2 by 4"), the 89 along the depth and upright on
// the rails; one brace on the back, from the top at one end to the bottom
// at the other; and three shelves, each two scaffold boards (225 wide and
// 38 thick, the standard) side by side, flush to the front, so 85 of the
// frame's 535 is spare at the back, by the wall. `shelfTops` are the top
// of each shelf's boards, estimated from the photo, the last Sean's top.
// Each board's ends are bound with a blue steel band, `band` along it.
// It stands on a castor under each upright (the user's, 16 Oct 2026: their
// wheels about 60 across); a castor's height, wheel, swivel and plate, is
// estimated, and Sean's 1575 is taken as to its top from the floor, castors
// and all, so the bottom shelf sits just over a rail on the castors
const TIMBER_SHELVES = {
  timber: { thin: 38, wide: 89 },
  board: { wide: 225, thick: 38, perShelf: 2 },
  shelfTops: [210, 820, 1575],
  band: 40,
  castor: { wheel: 60, wheelThick: 25, high: 80 },
};
const castorMat = material(0x2b2b2b);              // black rubber and dark steel
const bandMat = material(0x3f6fa8);                // the blue of the bands in the photo
// The most a piece can stand off the wall behind it (chosen: room to spare)
const MOST_OFF_WALL = 200;

// Where each stands: the middle of its back, and which way it faces, in
// quarter turns as the bedroom's furniture: 0° away from the right-hand
// wall, 90° the back wall, 180° the left-hand wall, 270° the door; and,
// for Yellow and Biltong, how high off the floor its bottom is: on the
// scaffold bench and on Trellis. All start where the user put them (16 Oct
// 2026, sent as links), with BillyChest out
export const GARAGE_START = {
  door: 'hidden',
  sean: { on: true, x: 1255, y: 2865, turn: 180 },
  billy: { on: true, x: 0, y: 1920, turn: 270, lying: false },
  billyChest: { on: false, x: 0, y: 1100, turn: 270 },
  metal: { on: true, x: 670, y: 360, turn: 90 },
  yellow: { on: true, x: 3390, y: 2550, turn: 0, z: PIECES.scaffoldBench.h },
  scaffoldBench: { on: true, x: 3430, y: 2650, turn: 0 },
  smallBilly: { on: true, x: 2480, y: 0, turn: 0, off: 0 },   // flush to start, for the user to set
  potters: { on: true, x: 3090, y: 0, turn: 0, off: 0 },
  biltong: { on: true, x: 580, y: 1070, turn: 90, z: PIECES.trellis.h },
  trellis: { on: true, x: 730, y: 1160, turn: 90 },
  pine: { on: true, x: 1425, y: 0, turn: 0 },
  ivar: { on: false, x: 0, y: 1100, turn: 270 },     // out to start, at BillyChest's spot (asked for, 18 Oct 2026)
};

// The sliders, as other_room.js's: [path in state.garage, label, lowest,
// highest, step, unit]. The height above the floor goes up to the ceiling
// less the piece, in 1s so it can sit on what's under it exactly; the gap
// from the wall in 1s too, as it's small
const placeSliders = piece => [
  [`${piece}.x`, 'Back’s middle from the back wall', 0, GARAGE.length, 5, ''],
  [`${piece}.y`, 'Back’s middle from the right-hand wall (looking in)', 0, GARAGE.width, 5, ''],
  [`${piece}.turn`, 'Turned (0° faces the left-hand wall, 90° the back wall)', 0, 360 - QUARTER_TURN, QUARTER_TURN, '°'],
  ...(PIECES[piece].lifted ? [[`${piece}.z`, 'Height above the floor', 0, GARAGE.height - PIECES[piece].h, 1, '']] : []),
  ...(PIECES[piece].offWall ? [[`${piece}.off`, 'Gap from the wall behind', 0, MOST_OFF_WALL, 1, '']] : []),
];
const SLIDERS = PIECE_KEYS.flatMap(placeSliders);

// The configuration's entries (kit/config_kit.js): for each piece, whether
// it's in the garage and its place there, each held to its slider's range,
// its turn to quarter turns. Their sizes are fixed, so they've no design
// here; the pine cupboard is the bedroom's, under its name there
const PIECE_NAME = { pine: 'pineCupboard' };
function pieceEntries(piece) {
  const at = `pieces.${PIECE_NAME[piece] ?? piece}.in.garage`;
  return [
    Config.onOff(`${at}.on`, `garage.${piece}.on`),
    ...(PIECES[piece].canLie ? [Config.onOff(`${at}.lying`, `garage.${piece}.lying`)] : []),
    ...placeSliders(piece).map(([path, , lo, hi, step]) => {
      const key = path.split('.')[1];
      return Config.number(`${at}.${key}`, `garage.${path}`, lo, hi, step, { onSteps: key === 'turn' });
    }),
  ];
}
// ...and the door, with the flat's doors
export const GARAGE_SCHEMA = [Config.choice('doors.garage', 'garage.door', Object.keys(GARAGE_DOOR)), ...PIECE_KEYS.flatMap(pieceEntries)];

// ---------------------------------------------------------------------------
// Drawing: each piece in its own group, its back's middle at the origin,
// its width along x and its depth out along y, then placed (and raised)
// and turned; one standing off the wall is moved out by its gap inside that
// group, so its place stays its spot on the wall
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
garage.add(furniture);
const doorGroup = new THREE.Group();                   // the door, as Garage options say
garage.add(doorGroup);
const swingMat = material(0x8f969c);                   // the ground the door swings over: the door's grey, faint (chosen)
swingMat.transparent = true;
swingMat.opacity = 0.25;
swingMat.depthWrite = false;

// The door: closed, filling the doorway just inside the end wall; or open,
// level on its rail just under the opening's head, its bottom edge as far
// out in front as it ever swings (door.swingOut), the rest inside, with
// that ground in front marked faintly; or not drawn
const SWING_MARK = 2;                                  // the mark's height off the ground, so it isn't lost in it
function drawGarageDoor(state) {
  doorGroup.clear();
  const { length: L, width: W, door } = GARAGE;
  const d0 = (W - door.width) / 2, d1 = d0 + door.width;
  if (state === 'closed') box({ from: [L - door.thick, d0, 0], to: [L, d1, door.height] }, garageDoorMat, doorGroup);
  if (state === 'open') {
    const out = L + door.swingOut;
    box({ from: [out - door.height, d0, door.height - door.thick], to: [out, d1, door.height] }, garageDoorMat, doorGroup);
    box({ from: [L, d0, 0], to: [out, d1, SWING_MARK] }, swingMat, doorGroup, false);
  }
}
// Each piece as drawn now, to look at: one taken out is hidden, but still
// placed, so Looking at it aims at its spot
export const garagePieces = Object.fromEntries(PIECE_KEYS.map(piece => [piece, null]));

// `pineSizes`: the pine cupboard's sizes as set in Bedroom options
export function drawGarage(s, pineSizes) {
  drawGarageDoor(s.door);
  clearDrawing(furniture);
  for (const piece of PIECE_KEYS) {
    const sizes = PIECES[piece].bedroomSizes ? sizesOf(pineSizes) : {};
    const { x, y, turn, z = 0, off = 0, lying } = s[piece], g = new THREE.Group(), body = drawn({ ...PIECES[piece], ...sizes }, lying);
    body.position.z = off * MM;                   // its depth, out from the wall, is the group's z
    g.add(body);
    g.position.set(x * MM, z * MM, y * MM);
    g.rotation.y = THREE.MathUtils.degToRad(-turn);
    g.visible = s[piece].on;
    furniture.add(g);
    garagePieces[piece] = g;
  }
}
function drawn({ w, d, h, mat, shape }, lying) {
  if (shape === 'billy') return billy(lying);
  if (shape === 'billyChest') return billyChest();
  if (shape === 'ivar') return ivar(false);
  if (shape === 'shelves') return bookcase({ w, d, h }, mat);
  if (shape === 'pine') return pineCupboard({ w, d, h }, 0);   // flush: no carpet or skirting to hold it off
  const g = new THREE.Group();
  if (shape === 'table') table(w, d, h, mat, g);
  else if (shape === 'bench') bench(w, d, h, mat, g);
  else if (shape === 'timber shelves') timberShelves(w, d, h, mat, g);
  else if (shape === 'open box') openBox(w, d, h, mat, g);
  else box({ from: [-w / 2, 0, 0], to: [w / 2, d, h] }, mat, g);
  return g;
}
// A leg, square, `size` across, its corner at (x, y) and the rest towards
// the middle, from the floor to `top`
function leg(x, y, size, top, mat, g) {
  const x1 = x + Math.sign(-x) * size, y1 = y + (y === 0 ? size : -size);
  box({ from: [Math.min(x, x1), Math.min(y, y1), 0], to: [Math.max(x, x1), Math.max(y, y1), top] }, mat, g);
}
// A table: a top on a leg at each corner
function table(w, d, h, mat, g) {
  const { top, leg: size } = TABLE;
  box({ from: [-w / 2, 0, h - top], to: [w / 2, d, h] }, mat, g);
  for (const x of [-w / 2, w / 2]) for (const y of [0, d]) leg(x, y, size, h - top, mat, g);
}
// The scaffold bench: a board on four legs, each BENCH.legIn in from its ends
function bench(w, d, h, mat, g) {
  const { board, leg: size, legIn } = BENCH;
  box({ from: [-w / 2, 0, h - board], to: [w / 2, d, h] }, mat, g);
  for (const x of [-w / 2 + legIn, w / 2 - legIn]) for (const y of [0, d]) leg(x, y, size, h - board, mat, g);
}
// Sean: timber shelving (TIMBER_SHELVES), the frames in `mat`
function timberShelves(w, d, h, mat, g) {
  const { timber: { thin }, shelfTops } = TIMBER_SHELVES;
  for (const end of [-1, 1]) endFrame(end * (w / 2 - thin / 2), d, h, mat, g);
  backBrace(w, h, mat, g);
  const inside = w / 2 - thin;                   // the boards run between the frames' uprights
  for (const top of shelfTops) shelfBoards(inside, d, top, g);
}
// One end's frame, its middle across at x: an upright at the front and the
// back, and a rail between them under each shelf, on the uprights' inside
function endFrame(x, d, h, mat, g) {
  const { timber: { thin, wide }, board, shelfTops, castor } = TIMBER_SHELVES;
  for (const [y0, y1] of [[0, wide], [d - wide, d]]) {
    box({ from: [x - thin / 2, y0, castor.high], to: [x + thin / 2, y1, h] }, mat, g);
    castorUnder(x, (y0 + y1) / 2, g);
  }
  const railX = x - Math.sign(x) * thin;         // one timber in, towards the middle
  for (const top of shelfTops) {
    const under = top - board.thick;
    box({ from: [railX - thin / 2, wide, under - wide], to: [railX + thin / 2, d - wide, under] }, mat, g);
  }
}
// A castor under the upright whose foot's middle is (x, y): its wheel, on
// edge and running along the depth, and above it the swivel and plate as
// one block, up to the upright
function castorUnder(x, y, g) {
  const { wheel, wheelThick, high } = TIMBER_SHELVES.castor;
  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(wheel / 2 * MM, wheel / 2 * MM, wheelThick * MM, 24), castorMat);
  tyre.rotation.z = Math.PI / 2;                 // its axle across, along the width
  tyre.position.set(x * MM, wheel / 2 * MM, y * MM);
  g.add(tyre);
  box({ from: [x - wheelThick / 2, y - wheel / 2, wheel], to: [x + wheelThick / 2, y + wheel / 2, high] }, castorMat, g);
}
// The brace: one timber flat on the back, from the top at the left-hand end
// to the bottom at the right, between the uprights, as on the photo
function backBrace(w, h, mat, g) {
  const { timber: { thin, wide } } = TIMBER_SHELVES;
  const { castor } = TIMBER_SHELVES, bottom = castor.high, mid = (bottom + h) / 2;
  const run = w - 2 * thin - wide, rise = h - bottom - wide;   // its middle line's ends, kept a timber in
  const half = Math.hypot(run, rise) / 2;
  const brace = box({ from: [-half, 0, mid - wide / 2], to: [half, thin, mid + wide / 2] }, mat, g);
  brace.rotation.z = -Math.atan2(rise, run);      // about the depth: down to the right
}
// One shelf: its boards side by side from the front, `inside` each way of
// the middle, their tops at `top`, each end bound with a band
function shelfBoards(inside, d, top, g) {
  const { board: { wide, thick, perShelf }, band } = TIMBER_SHELVES;
  const BAND_PROUD = 1;                          // the band's steel, standing just off the board all round
  for (let i = 0; i < perShelf; i++) {
    const y1 = d - i * wide, y0 = y1 - wide;
    box({ from: [-inside, y0, top - thick], to: [inside, y1, top] }, scaffoldBoard, g);
    for (const end of [-1, 1]) {
      const [x0, x1] = end < 0 ? [-inside - BAND_PROUD, -inside + band] : [inside - band, inside + BAND_PROUD];
      box({ from: [x0, y0 - BAND_PROUD, top - thick - BAND_PROUD], to: [x1, y1 + BAND_PROUD, top + BAND_PROUD] }, bandMat, g);
    }
  }
}
// A box open at the top: a bottom and four sides
function openBox(w, d, h, mat, g) {
  const t = OPEN_BOX_SIDE;
  box({ from: [-w / 2, 0, 0], to: [w / 2, d, t] }, mat, g);
  box({ from: [-w / 2, 0, t], to: [-w / 2 + t, d, h] }, mat, g);
  box({ from: [w / 2 - t, 0, t], to: [w / 2, d, h] }, mat, g);
  box({ from: [-w / 2 + t, 0, t], to: [w / 2 - t, t, h] }, mat, g);
  box({ from: [-w / 2 + t, d - t, t], to: [w / 2 - t, d, h] }, mat, g);
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
  const doorRadios = () => container.querySelectorAll('input[name=garageDoor]');
  container.innerHTML = `<div id="garageDoorBlock" class="depth">Garage door:` +
    Object.entries(GARAGE_DOOR).map(([value, label]) => `<label><input type="radio" name="garageDoor" value="${value}"> ${label}</label>`).join('') +
    `<div class="hint">Up and over: its top runs back on a rail under the ceiling, its bottom swings out, at most ${GARAGE.door.swingOut / 1000} m (marked on the ground when it's open).</div></div>` +
    PIECE_KEYS.map(piece => {
    const { label, w, d, h, bedroomSizes } = PIECES[piece];
    const sizes = bedroomSizes ? 'its sizes as in Bedroom options' : `${w} wide, ${d} deep, ${h} high`;
    return `<div class="depth"><div><b>${label}</b> (${sizes})</div>` +
      `<label class="switch"><input type="checkbox" id="${id(`${piece}.on`)}"> In the garage</label>` +
      (PIECES[piece].canLie ? lyingSwitch(id(`${piece}.lying`)) : '') +
      placeSliders(piece).map(slider(id)).join('') +
      `<div class="row"><button data-reset="${piece}">Reset location</button></div></div>`;
  }).join('');

  doorRadios().forEach(r => r.addEventListener('change', () => change([['door', r.value]])));
  for (const [path] of SLIDERS) document.getElementById(id(path)).addEventListener('input', e => change([[path, Number(e.target.value)]]));
  for (const piece of PIECE_KEYS) document.getElementById(id(`${piece}.on`)).addEventListener('change', e => change([[`${piece}.on`, e.target.checked]]));
  for (const piece of LYING_KEYS) document.getElementById(id(`${piece}.lying`)).addEventListener('change', e => change([[`${piece}.lying`, e.target.checked]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    change(placeSliders(b.dataset.reset).map(([path]) => [path, valueAt(GARAGE_START, path)]));
  }));

  return s => {
    doorRadios().forEach(r => { r.checked = r.value === s.door; });
    for (const [path, , , , , unit] of SLIDERS) {
      const value = valueAt(s, path);
      document.getElementById(id(path)).value = String(value);
      document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
    }
    for (const piece of PIECE_KEYS) document.getElementById(id(`${piece}.on`)).checked = s[piece].on;
    for (const piece of LYING_KEYS) document.getElementById(id(`${piece}.lying`)).checked = s[piece].lying;
  };
}
