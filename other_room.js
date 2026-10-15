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
const RECESS_CUPBOARDS = {
  w: 1800, upperD: 420, lowerTop: 820, lowerD: 301,
  topDoors: 400, drawersTop: 1400, plinth: 80, lowerDoors: 4,
  front: 18, gap: 3,
};

const bedFrameMat = material(0x262626);
const mattressMat = material(0xece8e0);
const bookcaseMat = material(0x4a2e1c);
const pineMat = material(0xc98a45);
const knobMat = material(0x8a5a2b);
const fittedMat = material(0xf2f0ea);
const shadowMat = material(0x6f6a62);              // the open shelves' inside, in shade

// ---------------------------------------------------------------------------
// The settings: where each movable piece is, and the sizes of those that
// can be resized. A piece's place is the middle of its back (the bed's
// head end), so a change of size keeps it against its wall. turn is which
// way it faces: 0° away from the hallway wall (the bed's head against it),
// 90° the window wall, 180° the hallway wall, 270° the kitchen-side wall.
// ---------------------------------------------------------------------------
export const OTHER_ROOM_START = {
  // Where they stand now (from the photos, 15 Oct 2026): the bed's head
  // against the hallway wall, 680 from the window wall (measured); the
  // bookcase's back to the chimney breast, from the recess; the pine
  // cupboard's back to the kitchen-side wall, its side up to the bookcase's
  // front
  bed: { u: 680 + BED.width / 2, v: 0, turn: 0 },
  bookcase: { u: OTHER_ROOM.recessWidth + BOOKCASE.w / 2, v: OTHER_ROOM.breastFace, turn: 180, w: BOOKCASE.w, d: BOOKCASE.d, h: BOOKCASE.h },
  cupboard: { u: OTHER_ROOM.length, v: OTHER_ROOM.breastFace - BOOKCASE.d - PINE.w / 2, turn: 90, w: PINE.w, d: PINE.d, h: PINE.h },
  lowerD: RECESS_CUPBOARDS.lowerD,
};

// Each slider: [the setting's path in state.otherRoom, its label, lowest,
// highest, step, unit], in the menu's order under each piece's heading
const PLACE = (piece) => [
  [`${piece}.u`, 'Back’s middle from the window wall', 0, OTHER_ROOM.length, 5, ''],
  [`${piece}.v`, 'Back’s middle from the hallway wall', 0, OTHER_ROOM.recessBack, 5, ''],
  [`${piece}.turn`, 'Turned', 0, 355, 5, '°'],
];
const SIZES = {
  bookcase: [['w', 400, 2000], ['d', 200, 500], ['h', 600, 2200]],
  cupboard: [['w', 600, 2000], ['d', 300, 700], ['h', 1200, 2400]],
};
const SIZE_LABEL = { w: 'Width', d: 'Depth', h: 'Height' };
const sizeSliders = piece => SIZES[piece].map(([k, lo, hi]) => [`${piece}.${k}`, SIZE_LABEL[k], lo, hi, 10, '']);
export const OTHER_ROOM_SLIDERS = [
  ['Bed (with its headboard and mattress)', PLACE('bed')],
  ['Bookcase', [...sizeSliders('bookcase'), ...PLACE('bookcase')]],
  ['Pine cupboard', [...sizeSliders('cupboard'), ...PLACE('cupboard')]],
  ['Recess cupboards', [['lowerD', 'Lower cupboard’s depth', 150, 600, 1, '']]],
];

// The settings' address fields, for living_room.js's ADDRESS: each piece as
// its numbers joined by '.', each held to its slider's range
const RANGES = Object.fromEntries(OTHER_ROOM_SLIDERS.flatMap(([, sliders]) => sliders.map(([path, , lo, hi]) => [path, [lo, hi]])));
const held = (path, text, was) => {
  const [lo, hi] = RANGES[path], n = text ? Number(text) : NaN;
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

// ---------------------------------------------------------------------------
// Drawing. Each movable piece is drawn in its own group, its back's middle
// at the group's origin, its width along x, its depth out along y, so
// placing it is setting where that group stands and how far it's turned.
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
otherRoom.add(furniture);
export const otherRoomPieces = { bed: null, bookcase: null, cupboard: null };   // each piece's group as drawn now, to look at

// Draw everything again from the settings `s` (state.otherRoom)
export function drawOtherRoom(s) {
  furniture.clear();
  otherRoomPieces.bed = place(bed(), s.bed);
  otherRoomPieces.bookcase = place(bookcase(s.bookcase), s.bookcase);
  otherRoomPieces.cupboard = place(pineCupboard(s.cupboard), s.cupboard);
  recessCupboards(s.lowerD);
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
// about BOOKCASE.shelfGap apart between
function bookcase({ w, d, h }) {
  const g = new THREE.Group(), half = w / 2, { board: t, back, plinth } = BOOKCASE;
  box({ from: [-half, 0, 0], to: [-half + t, d, h] }, bookcaseMat, g);                    // sides
  box({ from: [half - t, 0, 0], to: [half, d, h] }, bookcaseMat, g);
  box({ from: [-half + t, 0, h - t], to: [half - t, d, h] }, bookcaseMat, g);             // top
  box({ from: [-half + t, d - t, 0], to: [half - t, d, plinth] }, bookcaseMat, g);        // plinth, at the front
  box({ from: [-half + t, 0, plinth], to: [half - t, d, plinth + t] }, bookcaseMat, g);   // bottom
  box({ from: [-half + t, 0, plinth + t], to: [half - t, back, h - t] }, bookcaseMat, g); // back
  const inside = h - t - (plinth + t), spaces = Math.max(1, Math.round(inside / BOOKCASE.shelfGap));
  for (let k = 1; k < spaces; k++) {
    const z = plinth + t + k * inside / spaces;
    box({ from: [-half + t, back, z - t / 2], to: [half - t, d, z + t / 2] }, bookcaseMat, g);
  }
  return g;
}

// The pine cupboard: its body, held offWall off the wall behind, a cornice
// standing out over it, and on its front two rows of drawers (two, then
// three) under three doors, each with a knob
function pineCupboard({ w, d, h }) {
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

// The recess's two fitted cupboards, against its back wall and filling its
// width: the upper one up to the ceiling, standing out over the lower one
function recessCupboards(lowerD) {
  const { w, upperD, lowerTop, topDoors, drawersTop, plinth, lowerDoors, front, gap } = RECESS_CUPBOARDS;
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
  // doors either side; in the middle, open shelves (in shade) over drawers
  const upFront = back - upperD, col = w / 3, under = top - topDoors;
  box({ from: [u0, upFront + front, lowerTop], to: [u1, back, top] }, fittedMat, furniture);
  for (let i = 0; i < 3; i++) panel(u0 + i * col, u0 + (i + 1) * col, under, top, upFront + front);
  panel(u0, u0 + col, lowerTop, under, upFront + front);
  panel(u1 - col, u1, lowerTop, under, upFront + front);
  const drawer = (drawersTop - lowerTop) / 3;
  for (let i = 0; i < 3; i++) panel(u0 + col, u1 - col, lowerTop + i * drawer, lowerTop + (i + 1) * drawer, upFront + front);
  panel(u0 + col, u1 - col, drawersTop, under, upFront + front, shadowMat);       // the open shelves
  const shelf = (drawersTop + under) / 2;
  box({ from: [u0 + col + gap, upFront, shelf - 9], to: [u1 - col - gap, upFront + front, shelf + 9] }, fittedMat, furniture);
}

// ---------------------------------------------------------------------------
// The menu's block: a heading and sliders for each piece, built into
// `container`. change(path, value) is called as a slider moves; the
// function returned puts the sliders in step with the settings `s`.
// ---------------------------------------------------------------------------
export function otherRoomControls(container, change) {
  const id = path => `otherRoom_${path.replace('.', '_')}`;
  container.innerHTML = OTHER_ROOM_SLIDERS.map(([heading, sliders]) => `<div class="depth"><div><b>${heading}</b></div>` +
    sliders.map(([path, label, lo, hi, step]) =>
      `<label for="${id(path)}">${label}: <span id="${id(path)}Value"></span></label>` +
      `<input id="${id(path)}" type="range" min="${lo}" max="${hi}" step="${step}">`).join('') + '</div>').join('');
  for (const [, sliders] of OTHER_ROOM_SLIDERS) {
    for (const [path] of sliders) document.getElementById(id(path)).addEventListener('input', e => change(path, Number(e.target.value)));
  }
  return s => {
    for (const [, sliders] of OTHER_ROOM_SLIDERS) {
      for (const [path, , , , , unit] of sliders) {
        const value = path.split('.').reduce((o, k) => o[k], s);
        document.getElementById(id(path)).value = String(value);
        document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
      }
    }
  };
}
