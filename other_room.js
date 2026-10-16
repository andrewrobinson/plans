// The other room's (the bedroom's) furniture and fitted cupboards: the bed,
// with its headboard and mattress; the bookcase and the pine cupboard,
// which can be resized and moved; and the two fitted cupboards in the
// recess beside the chimney breast, the lower one's depth adjustable. Drawn
// in the room's own u, v mm (OTHER_ROOM in floor.js: u from the window wall,
// v from the hallway wall).
//
// living_room.js holds the settings (state.otherRoom, starting as
// OTHER_ROOM_START) and their address; this file says how each piece looks,
// draws them (drawOtherRoom()), and makes the menu's sliders for them
// (otherRoomControls()).
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';
import { OTHER_ROOM, otherRoom } from './floor.js';

// ---------------------------------------------------------------------------
// The pieces' sizes, in mm. Measured 15 Oct 2026 unless it says otherwise.
// ---------------------------------------------------------------------------
const BED = {
  width: 1360, length: 1940,       // the base and the mattress
  baseTop: 350,                    // the base's top, off the carpet
  mattress: 260,                   // thick, on the base: its top at 610
  // The headboard: black metal, 25 thick, its top 950 off the carpet; posts
  // at either side and three rails across, as in the photo (the posts' and
  // rails' sizes and the rails' heights are estimated from it)
  headboard: { top: 950, thick: 25, post: 40, rails: [[910, 950], [790, 820], [660, 690]] },
  rail: { thick: 40, high: 50 },   // the base's metal frame (estimated)
};
// Where you lie on the bed and stand beside it (the Look menu's Where), in
// the bed's own mm: across it from its middle, and along it from the back
// of its headboard. Your eyes 300 in from the headboard, on the pillow, and
// beside it halfway along its side away from the window (with the bed as it
// starts, the room side), 450 out: room to stand (all chosen)
// The bed's foot, from the back of its headboard, for what stands at it
export const BED_FOOT = BED.headboard.thick + BED.length;
export const BED_SPOTS = {
  pillow: [0, BED.headboard.thick + 300],
  side: [BED.width / 2 + 450, BED.headboard.thick + BED.length / 2],
};
const BOOKCASE = {
  w: 1490, d: 290, h: 1220,        // dark brown, open shelves
  board: 18, back: 6, plinth: 70,  // its boards, back and plinth (estimated)
  shelfGap: 300,                   // shelves about this far apart: three in 1220 (from the photo)
};
// The pine cupboard: three doors over a row of three drawers and a row of
// two, a cornice on top (from the photo). It stands 560 out from the wall
// for 500 of depth: the carpet, the skirting and its lean hold it 60 off.
const PINE = {
  w: 1300, d: 500, h: 1790,
  offWall: 560 - 500,
  plinth: 60, cornice: 50, corniceProud: 25,    // estimated from the photo
  drawerRows: [240, 180],          // the two rows of drawers, bottom up (estimated)
  front: 18, gap: 3,               // the doors' and drawers' thickness, and the gaps round them (estimated)
};
// The recess's fitted cupboards: the upper one 1800 wide, 420 deep and 1625
// high, up to the ceiling; the lower one 820 high, 301 deep (its front 119
// behind the upper one's: 2888 - 2769), all measured. Centred in the 1824
// recess. The upper one's fronts
// as in the photo: a row of short doors along the top, a tall door either
// side, and in the middle open shelves over three drawers (heights estimated).
// Two changes can be tried on the upper one: drawers over the open shelves,
// as many as fit at about the height of those below, and a mirror on each
// tall door, `mirrorInset` in from its edges (chosen), `mirrorThick` proud.
const RECESS_CUPBOARDS = {
  w: 1800, upperD: 420, lowerTop: 820, lowerD: 301,
  topDoors: 400, drawersTop: 1400, plinth: 80, lowerDoors: 4,
  drawers: 3,                      // the drawers under the open shelves
  front: 18, gap: 3,
  mirrorInset: 60, mirrorThick: 4,
};

// The new cupboard: whatever Cupboard options and the option list build in
// the living room's corner (the back wall and the left wall), copied into
// the corner where the chimney breast's face meets the kitchen-side wall,
// where the pine cupboard and the bookcase meet (asked for, 16 Oct 2026).
// Turned half round, the living room's back wall runs along the chimney
// breast and its left wall along the kitchen-side wall: the only way into
// that corner without drawing it mirrored.
const NEW_CUPBOARD = { u: OTHER_ROOM.length, v: OTHER_ROOM.breastFace, turn: 180 };

// The mirror: none there yet, so its size and place are chosen to start
// with, on the chimney breast over the bookcase, 180 above the bookcase's
// top. A thin dark frame round the glass, standing off the wall.
const MIRROR = {
  w: 1000, h: 800, bottom: BOOKCASE.h + 180,
  frame: 30, thick: 25,            // the frame's width round the glass, and how far it stands out (chosen)
};

const bedFrameMat = material(0x262626);
const mattressMat = material(0xece8e0);
const bookcaseMat = material(0x4a2e1c);
const pineMat = material(0xc98a45);
const knobMat = material(0x8a5a2b);
const fittedMat = material(0xf2f0ea);
const shadowMat = material(0x6f6a62);              // the open shelves' inside, in shade
const mirrorFrameMat = material(0x2b2b2b);
// The glass: pale and shiny, a hint of a mirror rather than a reflection
const glassMat = new THREE.MeshStandardMaterial({ color: 0xdfe8ec, roughness: 0.1, metalness: 0.3 });

// ---------------------------------------------------------------------------
// The settings: where each movable piece is, and the sizes of those that
// can be resized. A piece's place is the middle of its back (the bed's
// head end), so a change of size keeps it against its wall. turn is which
// way it faces: 0° away from the hallway wall (the bed's head against it),
// 90° the window wall, 180° the hallway wall, 270° the kitchen-side wall.
// The mirror hangs on one of WALLS instead: `along` is its middle along that
// wall, and `bottom` its bottom edge off the carpet.
// ---------------------------------------------------------------------------

// The walls the mirror can hang on, in the menu's order: its name there; the
// turn that puts a piece's back to it; which way it runs (u or v), measured
// from the window wall or the hallway wall; from where to where along it;
// and where it stands across (its own u or v). The chimney breast's face
// only, not the recess beside it, which the fitted cupboards fill.
const WALLS = {
  breast: { label: 'The chimney breast (over the bookcase)', turn: 180, runs: 'u', from: OTHER_ROOM.recessWidth, to: OTHER_ROOM.length, at: OTHER_ROOM.breastFace },
  hallway: { label: 'The hallway wall', turn: 0, runs: 'u', from: 0, to: OTHER_ROOM.length, at: 0 },
  window: { label: 'The window wall', turn: 270, runs: 'v', from: 0, to: OTHER_ROOM.recessBack, at: 0 },
  kitchen: { label: 'The kitchen-side wall', turn: 90, runs: 'v', from: 0, to: OTHER_ROOM.breastFace, at: OTHER_ROOM.length },
};
const WALL_KEYS = Object.keys(WALLS);
const ALONG_LABEL = { u: 'Middle from the window wall', v: 'Middle from the hallway wall' };
const alongWall = (wall, along) => Math.min(WALLS[wall].to, Math.max(WALLS[wall].from, along));
export const OTHER_ROOM_START = {
  // Where they stand now (from the photos, 15 Oct 2026): the bed's head
  // against the hallway wall, 680 from the window wall (measured); the
  // bookcase's back to the chimney breast, from the recess; the pine
  // cupboard's back to the kitchen-side wall, its side up to the bookcase's
  // front
  bed: { u: 680 + BED.width / 2, v: 0, turn: 0 },
  bookcase: { u: OTHER_ROOM.recessWidth + BOOKCASE.w / 2, v: OTHER_ROOM.breastFace, turn: 180, w: BOOKCASE.w, d: BOOKCASE.d, h: BOOKCASE.h },
  cupboard: { u: OTHER_ROOM.length, v: OTHER_ROOM.breastFace - BOOKCASE.d - PINE.w / 2, turn: 90, w: PINE.w, d: PINE.d, h: PINE.h },
  bookcaseOn: true,                // the bookcase there, or not (whatever's in the living room)
  cupboardOn: true,                // the pine cupboard likewise
  mirrorOn: true,                  // the mirror likewise
  newCupboardOn: false,            // the living room's corner cupboard copied in (NEW_CUPBOARD), in place of the pine cupboard
  lowerD: RECESS_CUPBOARDS.lowerD,
  upperDrawers: false,             // the upper recess cupboard: drawers over its open shelves
  upperMirrors: false,             // ...and mirrors on its two tall doors
  mirror: { wall: 'breast', along: OTHER_ROOM.recessWidth + BOOKCASE.w / 2, bottom: MIRROR.bottom, w: MIRROR.w, h: MIRROR.h },
};

// Each slider: [the setting's path in state.otherRoom, its label, lowest,
// highest, step, unit], in the menu's order under each piece's heading.
// Turned goes in quarter turns, all that's needed to stand a piece square
// to a wall (chosen 15 Oct 2026)
export const QUARTER_TURN = 90;
const PLACE = (piece) => [
  [`${piece}.u`, 'Back’s middle from the window wall', 0, OTHER_ROOM.length, 5, ''],
  [`${piece}.v`, 'Back’s middle from the hallway wall', 0, OTHER_ROOM.recessBack, 5, ''],
  [`${piece}.turn`, 'Turned', 0, 360 - QUARTER_TURN, QUARTER_TURN, '°'],
];
// The mirror's place: along its wall (the slider's label and range follow
// the wall), and up it
const MIRROR_PLACE = [
  ['mirror.along', ALONG_LABEL.u, 0, OTHER_ROOM.length, 5, ''],
  ['mirror.bottom', 'Bottom off the carpet', 0, OTHER_ROOM.ceiling, 10, ''],
];
const SIZES = {
  bookcase: [['w', 400, 2000], ['d', 200, 500], ['h', 600, 2200]],
  cupboard: [['w', 600, 2000], ['d', 300, 700], ['h', 1200, 2400]],
  mirror: [['w', 200, 2000], ['h', 200, 2000]],
};
// The bookcase's: also its sliders in the living room, on the front wall
export const BOOKCASE_SIZES = SIZES.bookcase;
export const SIZE_LABEL = { w: 'Width', d: 'Depth', h: 'Height' };
const sizeSliders = piece => SIZES[piece].map(([k, lo, hi]) => [`${piece}.${k}`, SIZE_LABEL[k], lo, hi, 10, '']);
// The menu's pieces, in order: each its heading (if it has one), its size sliders and its
// place sliders (each with a reset button, back to OTHER_ROOM_START), and
// for the mirror the choice of wall, reset with its place
const PIECES = [
  // The new cupboard first, just its switch (asked for, 16 Oct 2026)
  { sizes: [], place: [], switches: [['newCupboardOn', 'New cupboard']] },
  { heading: 'Bed (with its headboard and mattress)', sizes: [], place: PLACE('bed') },
  { heading: 'Bookcase', sizes: sizeSliders('bookcase'), place: PLACE('bookcase'), switches: [['bookcaseOn', 'In the bedroom']] },
  { heading: 'Pine cupboard', sizes: sizeSliders('cupboard'), place: PLACE('cupboard'), switches: [['cupboardOn', 'In the bedroom']] },
  // The lower one's depth up to 800, as far as it might go (asked for, 15 Oct 2026)
  { heading: 'Recess cupboards', sizes: [['lowerD', 'Lower cupboard’s depth', 150, 800, 1, '']], place: [],
    switches: [['upperDrawers', 'Upper cupboard: drawers over the open shelves'], ['upperMirrors', 'Upper cupboard: mirrors on the tall doors']] },
  { heading: 'Mirror', sizes: sizeSliders('mirror'), place: MIRROR_PLACE, wall: 'mirror.wall', switches: [['mirrorOn', 'In the bedroom']] },
];
const SLIDERS = PIECES.flatMap(p => [...p.sizes, ...p.place]);
const SWITCHES = PIECES.flatMap(p => p.switches ?? []);

// The settings' address fields, for living_room.js's ADDRESS: each piece as
// its numbers joined by '.', each held to its slider's range
const RANGES = Object.fromEntries(SLIDERS.map(([path, , lo, hi]) => [path, [lo, hi]]));
const held = (path, text, was) => {
  const [lo, hi] = RANGES[path], n = text ? Number(text) : NaN;
  if (path.endsWith('.turn') && n % QUARTER_TURN !== 0) return was;   // only quarter turns
  return n >= lo && n <= hi ? n : was;
};
const pieceField = (piece, keys) => [`otherRoom.${piece}`,
  p => keys.map(k => p[k]).join('.'),
  (text, p) => {
    const parts = text.split('.');
    return Object.fromEntries(keys.map((k, i) => [k, held(`${piece}.${k}`, parts[i], p[k])]));
  }];
export const OTHER_ROOM_ADDRESS = [
  pieceField('bed', ['u', 'v', 'turn']),
  pieceField('bookcase', ['u', 'v', 'turn', 'w', 'd', 'h']),
  pieceField('cupboard', ['u', 'v', 'turn', 'w', 'd', 'h']),
  ['otherRoom.lowerD', String, (text, was) => held('lowerD', text, was)],
];
// The mirror's, added later, so at the end of ADDRESS: its wall (as its
// place in WALLS), then along, bottom, w and h
export const MIRROR_ADDRESS = [['otherRoom.mirror',
  m => [WALL_KEYS.indexOf(m.wall), m.along, m.bottom, m.w, m.h].join('.'),
  (text, m) => {
    const [wall, ...parts] = text.split('.');
    const read = Object.fromEntries(['along', 'bottom', 'w', 'h'].map((k, i) => [k, held(`mirror.${k}`, parts[i], m[k])]));
    return { ...read, wall: WALL_KEYS[Number(wall)] ?? m.wall };
  }]];
// Then the upper recess cupboard's drawers and mirrors, as `drawers.mirrors`,
// each 1 or 0
const onOff = (text, was) => (text === '1' ? true : text === '0' ? false : was);
export const RECESS_FRONTS_ADDRESS = [['otherRoom',
  r => `${r.upperDrawers ? 1 : 0}.${r.upperMirrors ? 1 : 0}`,
  (text, r) => {
    const [drawers, mirrors] = text.split('.');
    return { ...r, upperDrawers: onOff(drawers, r.upperDrawers), upperMirrors: onOff(mirrors, r.upperMirrors) };
  }]];
// Then whether the bookcase is in the bedroom, 1 or 0 (added later; links
// from before have it there)
export const BOOKCASE_ON_ADDRESS = [['otherRoom.bookcaseOn', on => (on ? 1 : 0), (text, was) => onOff(text, was)]];
// And the pine cupboard's, added later still
export const CUPBOARD_ON_ADDRESS = [['otherRoom.cupboardOn', on => (on ? 1 : 0), (text, was) => onOff(text, was)]];
// And the mirror's, added later again (15 Oct 2026)
export const MIRROR_ON_ADDRESS = [['otherRoom.mirrorOn', on => (on ? 1 : 0), (text, was) => onOff(text, was)]];
// And the new cupboard's (16 Oct 2026)
export const NEW_CUPBOARD_ON_ADDRESS = [['otherRoom.newCupboardOn', on => (on ? 1 : 0), (text, was) => onOff(text, was)]];

// ---------------------------------------------------------------------------
// Drawing. Each movable piece is drawn in its own group, its back's middle
// at the group's origin, its width along x, its depth out along y, so
// placing it is setting where that group stands and how far it's turned.
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
otherRoom.add(furniture);
// The new cupboard's own group, apart from the furniture as it's redrawn
// from the living room's cupboard (showNewCupboard()), not from `s`
const newCupboardSpot = new THREE.Group();
newCupboardSpot.position.set(NEW_CUPBOARD.u * MM, 0, NEW_CUPBOARD.v * MM);
newCupboardSpot.rotation.y = THREE.MathUtils.degToRad(-NEW_CUPBOARD.turn);
otherRoom.add(newCupboardSpot);
export const otherRoomPieces = { bed: null, bookcase: null, cupboard: null, mirror: null, newCupboard: newCupboardSpot };   // each piece's group as drawn now, to look at

// Draw everything again from the settings `s` (state.otherRoom). With the
// bookcase, the pine cupboard or the mirror switched off it's hidden,
// though still placed, so Looking at it aims at its spot. The new cupboard
// takes the pine cupboard's place, so hides it too.
export function drawOtherRoom(s) {
  furniture.clear();
  otherRoomPieces.bed = place(bed(), s.bed);
  otherRoomPieces.bookcase = place(bookcase(s.bookcase), s.bookcase);
  otherRoomPieces.bookcase.visible = s.bookcaseOn;
  otherRoomPieces.cupboard = place(pineCupboard(s.cupboard), s.cupboard);
  otherRoomPieces.cupboard.visible = s.cupboardOn && !s.newCupboardOn;
  recessCupboards(s);
  otherRoomPieces.mirror = place(mirror(s.mirror), mirrorPlace(s.mirror));
  otherRoomPieces.mirror.visible = s.mirrorOn;
}

// The new cupboard: `cupboard`, a copy of the living room's, drawn in the
// living room's mm from its corner, put in the bedroom's corner; or none
export function showNewCupboard(cupboard) {
  newCupboardSpot.clear();
  if (cupboard) newCupboardSpot.add(cupboard);
}

// Where the mirror's back is, and its turn, from its wall and how far along
function mirrorPlace({ wall, along }) {
  const { runs, at, turn } = WALLS[wall], a = alongWall(wall, along);
  return runs === 'u' ? { u: a, v: at, turn } : { u: at, v: a, turn };
}

function place(g, { u, v, turn }) {
  g.position.set(u * MM, 0, v * MM);
  g.rotation.y = THREE.MathUtils.degToRad(-turn);
  furniture.add(g);
  return g;
}

// The bed: the headboard at the back, then the base's frame on legs and
// the mattress on it
function bed() {
  const g = new THREE.Group(), half = BED.width / 2;
  const { top, thick, post, rails } = BED.headboard;
  box({ from: [-half, 0, 0], to: [-half + post, thick, top] }, bedFrameMat, g);        // posts
  box({ from: [half - post, 0, 0], to: [half, thick, top] }, bedFrameMat, g);
  for (const [z0, z1] of rails) box({ from: [-half + post, 0, z0], to: [half - post, thick, z1] }, bedFrameMat, g);
  const y0 = thick, y1 = thick + BED.length, { thick: t, high } = BED.rail, under = BED.baseTop - high;
  box({ from: [-half, y0, under], to: [-half + t, y1, BED.baseTop] }, bedFrameMat, g);     // side rails
  box({ from: [half - t, y0, under], to: [half, y1, BED.baseTop] }, bedFrameMat, g);
  box({ from: [-half + t, y1 - t, under], to: [half - t, y1, BED.baseTop] }, bedFrameMat, g);   // foot rail
  for (const x of [-half, half - t]) box({ from: [x, y1 - t, 0], to: [x + t, y1, under] }, bedFrameMat, g);   // feet at the foot (the posts hold the head)
  box({ from: [-half, y0, BED.baseTop], to: [half, y1, BED.baseTop + BED.mattress] }, mattressMat, g);
  return g;
}

// The bookcase: sides, top, a bottom over a plinth, a thin back, and shelves
// about BOOKCASE.shelfGap apart between. Exported for the living room, where
// it can stand in place of the bench, and for the garage's shelving, in
// its own colour (`mat`).
export function bookcase({ w, d, h }, mat = bookcaseMat) {
  const g = new THREE.Group(), half = w / 2, { board: t, back, plinth } = BOOKCASE;
  box({ from: [-half, 0, 0], to: [-half + t, d, h] }, mat, g);                    // sides
  box({ from: [half - t, 0, 0], to: [half, d, h] }, mat, g);
  box({ from: [-half + t, 0, h - t], to: [half - t, d, h] }, mat, g);             // top
  box({ from: [-half + t, d - t, 0], to: [half - t, d, plinth] }, mat, g);        // plinth, at the front
  box({ from: [-half + t, 0, plinth], to: [half - t, d, plinth + t] }, mat, g);   // bottom
  box({ from: [-half + t, 0, plinth + t], to: [half - t, back, h - t] }, mat, g); // back
  const inside = h - t - (plinth + t), spaces = Math.max(1, Math.round(inside / BOOKCASE.shelfGap));
  for (let k = 1; k < spaces; k++) {
    const z = plinth + t + k * inside / spaces;
    box({ from: [-half + t, back, z - t / 2], to: [half - t, d, z + t / 2] }, mat, g);
  }
  return g;
}

// The pine cupboard: its body, held offWall off the wall behind, a cornice
// standing out over it, and on its front two rows of drawers (two, then
// three) under three doors, each with a knob
export function pineCupboard({ w, d, h }) {
  const g = new THREE.Group(), half = w / 2, { offWall, plinth, cornice, corniceProud, drawerRows, front, gap } = PINE;
  const y0 = offWall, y1 = offWall + d, body = y1 - front;
  box({ from: [-half, y0, 0], to: [half, body, h - cornice] }, pineMat, g);
  box({ from: [-half - corniceProud, y0, h - cornice], to: [half + corniceProud, y1 + corniceProud, h] }, pineMat, g);
  const knob = (x, z) => box({ from: [x - 15, y1, z - 15], to: [x + 15, y1 + 25, z + 15] }, knobMat, g);
  // one row of n fronts from z0 to z1, knobs at `knobZ` up each (a fraction)
  const row = (n, z0, z1, knobZ) => {
    const each = (w - (n + 1) * gap) / n;
    for (let i = 0; i < n; i++) {
      const x0 = -half + gap + i * (each + gap);
      box({ from: [x0, body, z0 + gap], to: [x0 + each, y1, z1] }, pineMat, g);
      knob(x0 + each / 2, z0 + (z1 - z0) * knobZ);
    }
  };
  box({ from: [-half, body, 0], to: [half, y1, plinth] }, pineMat, g);                    // plinth
  const [low, high] = drawerRows, doorsFrom = plinth + low + high;
  row(2, plinth, plinth + low, 0.5);
  row(3, plinth + low, doorsFrom, 0.5);
  row(3, doorsFrom, h - cornice - gap, 0.1);       // the doors' knobs low on them, as in the photo
  return g;
}

// The mirror: a frame against the wall and the glass set in it, its bottom
// `bottom` off the carpet
function mirror({ w, h, bottom }) {
  const g = new THREE.Group(), half = w / 2, { frame, thick } = MIRROR, top = bottom + h;
  box({ from: [-half, 0, bottom], to: [half, thick - 2, top] }, mirrorFrameMat, g);
  box({ from: [-half + frame, thick - 2, bottom + frame], to: [half - frame, thick, top - frame] }, glassMat, g, false);
  return g;
}

// The recess's two fitted cupboards, against its back wall and filling its
// width: the upper one up to the ceiling, standing out over the lower one
function recessCupboards({ lowerD, upperDrawers, upperMirrors }) {
  const { w, upperD, lowerTop, topDoors, drawersTop, plinth, lowerDoors, drawers, front, gap } = RECESS_CUPBOARDS;
  const back = OTHER_ROOM.recessBack, top = OTHER_ROOM.ceiling;
  const u0 = (OTHER_ROOM.recessWidth - w) / 2, u1 = u0 + w;     // centred in the recess
  const panel = (a0, a1, z0, z1, frontV, mat = fittedMat) =>
    box({ from: [a0 + gap / 2, frontV - front, z0 + gap / 2], to: [a1 - gap / 2, frontV, z1 - gap / 2] }, mat, furniture);

  // The lower one: its body, a plinth, and doors across
  const lowFront = back - lowerD;
  box({ from: [u0, lowFront + front, 0], to: [u1, back, lowerTop] }, fittedMat, furniture);
  box({ from: [u0, lowFront, 0], to: [u1, lowFront + front, plinth] }, fittedMat, furniture);
  const doorW = w / lowerDoors;
  for (let i = 0; i < lowerDoors; i++) panel(u0 + i * doorW, u0 + (i + 1) * doorW, plinth, lowerTop, lowFront + front);

  // The upper one, in three equal columns: short doors along the top; tall
  // doors either side (with mirrors, if chosen); in the middle, open
  // shelves (in shade) over drawers, or drawers all the way up
  const upFront = back - upperD, col = w / 3, under = top - topDoors;
  box({ from: [u0, upFront + front, lowerTop], to: [u1, back, top] }, fittedMat, furniture);
  for (let i = 0; i < 3; i++) panel(u0 + i * col, u0 + (i + 1) * col, under, top, upFront + front);
  for (const a0 of [u0, u1 - col]) {
    panel(a0, a0 + col, lowerTop, under, upFront + front);
    if (upperMirrors) doorMirror(a0, a0 + col, lowerTop, under, upFront);
  }
  drawerStack(u0 + col, u1 - col, lowerTop, drawersTop, drawers, panel, upFront + front);
  if (upperDrawers) {
    const drawerH = (drawersTop - lowerTop) / drawers;
    drawerStack(u0 + col, u1 - col, drawersTop, under, Math.max(1, Math.round((under - drawersTop) / drawerH)), panel, upFront + front);
    return;
  }
  panel(u0 + col, u1 - col, drawersTop, under, upFront + front, shadowMat);       // the open shelves
  const shelf = (drawersTop + under) / 2;
  box({ from: [u0 + col + gap, upFront, shelf - 9], to: [u1 - col - gap, upFront + front, shelf + 9] }, fittedMat, furniture);
}

// n drawer fronts, of equal height, from z0 up to z1 between a0 and a1
function drawerStack(a0, a1, z0, z1, n, panel, frontV) {
  const each = (z1 - z0) / n;
  for (let i = 0; i < n; i++) panel(a0, a1, z0 + i * each, z0 + (i + 1) * each, frontV);
}

// A mirror on the face of the door from a0 to a1 and z0 to z1, whose face
// is at faceV, set in from its edges
function doorMirror(a0, a1, z0, z1, faceV) {
  const { mirrorInset: inset, mirrorThick: thick } = RECESS_CUPBOARDS;
  box({ from: [a0 + inset, faceV - thick, z0 + inset], to: [a1 - inset, faceV, z1 - inset] }, glassMat, furniture, false);
}

// ---------------------------------------------------------------------------
// The menu's block: for each piece a heading, the mirror's wall, its
// sliders, and buttons to put its dimensions and its location back as they
// started, built into `container`. change(edits) is called with a list of
// [path, value] as anything changes; the function returned puts the
// controls in step with the settings `s`.
// ---------------------------------------------------------------------------
const valueAt = (s, path) => path.split('.').reduce((o, k) => o[k], s);

export function otherRoomControls(container, change) {
  const id = path => `otherRoom_${path.replace('.', '_')}`;
  let shown = OTHER_ROOM_START;                        // the settings last put in the controls
  container.innerHTML = PIECES.map((piece, i) => `<div class="depth">${piece.heading ? `<div><b>${piece.heading}</b></div>` : ''}` +
    (piece.wall ? wallPick(id(piece.wall)) : '') +
    (piece.switches ?? []).map(([path, label]) => `<label class="switch"><input type="checkbox" id="${id(path)}"> ${label}</label>`).join('') +
    [...piece.sizes, ...piece.place].map(slider(id)).join('') +
    resetButtons(piece, i) + '</div>').join('');

  for (const [path] of SLIDERS) document.getElementById(id(path)).addEventListener('input', e => change([[path, Number(e.target.value)]]));
  for (const [path] of SWITCHES) document.getElementById(id(path)).addEventListener('change', e => change([[path, e.target.checked]]));
  // A new wall keeps the mirror as far along as it can
  document.getElementById(id('mirror.wall')).addEventListener('change', e =>
    change([['mirror.wall', e.target.value], ['mirror.along', alongWall(e.target.value, shown.mirror.along)]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    const piece = PIECES[Number(b.dataset.piece)], what = b.dataset.reset;
    const paths = what === 'sizes' ? piece.sizes.map(([path]) => path) : [...piece.place.map(([path]) => path), ...(piece.wall ? [piece.wall] : [])];
    change(paths.map(path => [path, valueAt(OTHER_ROOM_START, path)]));
  }));

  return s => {
    shown = s;
    for (const [path, , , , , unit] of SLIDERS) {
      const value = valueAt(s, path);
      document.getElementById(id(path)).value = String(value);
      document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
    }
    for (const [path] of SWITCHES) document.getElementById(id(path)).checked = valueAt(s, path);
    document.getElementById(id('cupboardOn')).disabled = s.newCupboardOn;   // the new cupboard stands in its place
    followWall(id, s.mirror);
  };
}

// A labelled slider for [path, label, lowest, highest, step], its ids from
// id(path); also the wicker bench's (wicker_bench.js)
export function slider(id) {
  return ([path, label, lo, hi, step]) =>
    `<label for="${id(path)}"><span id="${id(path)}Label">${label}</span>: <span id="${id(path)}Value"></span></label>` +
    `<input id="${id(path)}" type="range" min="${lo}" max="${hi}" step="${step}">`;
}

function wallPick(pickId) {
  return `<label for="${pickId}">On the wall:</label> <select id="${pickId}">` +
    WALL_KEYS.map(k => `<option value="${k}">${WALLS[k].label}</option>`).join('') + '</select>';
}

function resetButtons(piece, i) {
  const button = (what, text) => `<button data-reset="${what}" data-piece="${i}">${text}</button>`;
  const buttons = [piece.sizes.length && button('sizes', 'Reset dimensions'), piece.place.length && button('place', 'Reset location')].filter(Boolean);
  return buttons.length ? `<div class="row">${buttons.join('')}</div>` : '';
}

// The mirror's wall chosen, and its along slider labelled and ranged for it
function followWall(id, { wall, along }) {
  const { runs, from, to } = WALLS[wall], alongId = id('mirror.along');
  document.getElementById(id('mirror.wall')).value = wall;
  document.getElementById(`${alongId}Label`).textContent = ALONG_LABEL[runs];
  const input = document.getElementById(alongId);
  input.min = String(from);
  input.max = String(to);
  input.value = String(alongWall(wall, along));
}
