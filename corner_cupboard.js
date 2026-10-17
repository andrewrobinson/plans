// The corner cupboard: its options (7 to 11, and 16 for none), the builders
// that draw them, the shelves inside and their cutting back round the things
// to store, its inside spaces, its dimensions and door sizes, and its
// cutting list. Nothing here reads the flat's settings or a room's
// constants: each builder is given
//
//   settings   the cupboard's piece of the configuration: `option` (its
//              index in OPTIONS), T, R, F, BOARD, LEG, LEG_D, L_SHELVES,
//              WARD, WARD_D, TOWER, CORNER_W, CORNER_D, SIDE_SHELF, SIDE_W,
//              SIDE_D (room_dimensions.md has what each is)
//   place      the room it stands in, in its own mm: `width` along the
//              back wall, `depth` out from it, `ceiling`, and its `door`
//              (frameFrom, hingeAt, width, thickness), which option 8's
//              left door and option 10's doors can meet
//   materials  CUPBOARD_MATERIALS, or another cupboard's own
//
// makeCupboard() builds the chosen option into a group, the cupboard
// standing in its room's back-left corner (x along the back wall, y out
// from it, z up), and gives what's asked of it. REFACTOR_PLAN.md step 6d.
import * as THREE from 'three';
import { MM, material, box, slab, part, hinge, skewHinge, dimLabel, chain } from './kit/floor_kit.js';

// The living room cupboard's materials: its boards (carcass), shelves and
// doors, the handles, and option 9's and 10's oak shelves and light strips
// (the flat's colour picker and shelf wood recolour them)
export const CUPBOARD_MATERIALS = {
  carcass: material(0xc9a877),
  shelf: material(0xd6bc8f),
  door: material(0xd8bd92),
  handle: material(0x333333),
  oak: material(0xc8a26b),
  glow: new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd28a, emissiveIntensity: 1.2 }),
};

// The settings a cupboard is built from: its piece of the configuration
export const CUPBOARD_SETTINGS = ['option', 'T', 'R', 'F', 'BOARD', 'LEG', 'LEG_D', 'L_SHELVES', 'WARD', 'WARD_D',
  'TOWER', 'CORNER_W', 'CORNER_D', 'SIDE_SHELF', 'SIDE_W', 'SIDE_D'];

// The doors' handles: bars from 950 to 1250 off the floor, 20 wide and
// standing 22 off the door, near its free edge (chosen, not measured)
const HANDLE_BOTTOM = 950, HANDLE_TOP = 1250;
// The doors stand DOOR_GAP clear of the cupboard's edges, the floor, the
// ceiling and each other (chosen), so a pair across a span is
// (span - 3 * DOOR_GAP) / 2 wide
export const DOOR_GAP = 3;
// Option 8's diagonal front runs DIAGONAL_RUN along the back wall from the
// left-wall cupboard (chosen), and its shelves stop SHELF_SETBACK behind it
const DIAGONAL_RUN = 700, SHELF_SETBACK = 25;
// The shelf tops in options 8 to 11 (chosen; option 7's are settings)
const SHELF_TOPS = [600, 1200, 1800];
// The base cupboards along the bench have doors about this wide (chosen)
const BASE_DOOR_W = 450;

// How many doors base cupboards `span` long have
export const baseDoorCount = span => Math.max(1, Math.round(span / BASE_DOOR_W));

// The cupboard being built: what each builder below is given. H is the
// ceiling, which the full-height boards run up to; shelves are recorded
// into `shelves` (cupShelf()) as the boards go up.
const cupboardJob = (settings, place, materials) => ({ s: settings, place, H: place.ceiling, mats: materials, shelves: [] });

// A named board from room corner `from` [x, y, z] to corner `to`, in mm, as
// box() takes them, of a kind in the cutting list (CUT_KINDS: 'Panels',
// 'Doors' or 'Shelves'), in that kind's material. Every cupboard is built of
// these, with rear panels against the walls, so its inside doesn't lean on
// them. The rule (see CUT_RULE): rear panels and ends run full height; in a
// corner the back-wall rear panel runs through and the left-wall one stops
// at it; tops, bottoms and dividers fit between them; shelves fit inside;
// doors cover the front edges, DOOR_GAP clear.
function board(job, name, { from, to }, g, kind = 'Panels') {
  const mat = { Panels: job.mats.carcass, Doors: job.mats.door, Shelves: job.mats.shelf }[kind];
  return ofKind(kind, part(name, box({ from, to }, mat, g)));
}
// A board marked with its kind, for the cutting list (a shaped one, from
// slab(), is marked so too); none when there's nothing to draw (box() gives
// null for a board with no size, as the left-wall leg's with no leg)
function ofKind(kind, mesh) {
  if (mesh) mesh.userData.kind = kind;
  return mesh;
}

// ---------------------------------------------------------------------------
// Shelves inside the cupboard. Options record them with cupShelf() as
// they're built; drawShelves() draws them, and when the things to store
// are shown, cuts each one back where something stands under it that needs
// more height than it leaves: a shelfless bay up to where shelves are fine.
// ---------------------------------------------------------------------------
const LIFT = 50;                   // clear above a stored thing, to lift it in over the cupboard's bottom board
export const spanOf = (poly, axis) => [Math.min(...poly.map(p => p[axis])), Math.max(...poly.map(p => p[axis]))];
const rectPoly = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
// A shelf: { poly, top, mat }, its plan outline and top, BOARD thick
function cupShelf(job, poly, top, mat) {
  const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
  if (x1 > x0 && y1 > y0) job.shelves.push({ poly, top, mat });  // none with no left-wall cupboard
}

// The part of polygon `poly` with its x (axis 0) or y (axis 1) on one side
// of `at`: below it when `below`, else above it
function clipPoly(poly, axis, at, below) {
  const inside = p => below ? p[axis] <= at : p[axis] >= at;
  const out = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) {
      const t = (at - p[axis]) / (q[axis] - p[axis]);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

// Draw the recorded shelves into `group`, BOARD thick, round `things`: the
// things to store, each { name, h, x, y, z, w, d } (its footprint w along x
// by d along y, as it's turned), or none when they aren't shown. A shelf is
// cut across its short way, over the things standing under it that are
// within LIFT of its underside (a 10 gap either side); what's left under 100
// long is left out. Returns the cuts: { top, from, to, axis, things }, the
// things by their place in `things`.
function drawShelves(shelves, things, BOARD, group) {
  group.traverse(o => o.geometry?.dispose());
  group.clear();
  const cuts = [];
  for (const { poly, top, mat } of shelves) {
    const [sx0, sx1] = spanOf(poly, 0), [sy0, sy1] = spanOf(poly, 1);
    // Things up through it (not those resting on it, or above it)
    const clash = things.map((t, k) => k).filter(k => {
      const { x, y, z, w, d, h } = things[k];
      return z < top - BOARD && Math.max(z, BOARD) + h + LIFT > top - BOARD && x < sx1 && x + w > sx0 && y < sy1 && y + d > sy0;
    });
    if (!clash.length) {
      ofKind('Shelves', part(`Shelf at ${top}`, slab(poly, top - BOARD, top, mat, group)));
      continue;
    }
    const axis = sx1 - sx0 >= sy1 - sy0 ? 0 : 1;                // along the shelf's long way
    const at = k => things[k][axis ? 'y' : 'x'], size = k => things[k][axis ? 'd' : 'w'];
    const from = Math.min(...clash.map(at)) - 10;
    const to = Math.max(...clash.map(k => at(k) + size(k))) + 10;
    cuts.push({ top, axis, from: Math.max(from, axis ? sy0 : sx0), to: Math.min(to, axis ? sy1 : sx1), things: clash });
    for (const piece of [clipPoly(poly, axis, from, true), clipPoly(poly, axis, to, false)]) {
      if (piece.length < 3) continue;
      const [a, b] = spanOf(piece, axis);
      if (b - a >= 100) ofKind('Shelves', part(`Shelf at ${top}, cut back`, slab(piece, top - BOARD, top, mat, group)));
    }
  }
  return cuts;
}

// What the cuts come to, for the menu: which shelves are cut back, over
// what, and the lowest shelf left over the bay
function shelfCutText(cuts, shelves, things, BOARD) {
  if (!cuts.length) return '';
  const lower = name => name.charAt(0).toLowerCase() + name.slice(1).replace(/ \(\d\)$/, '');
  const tops = [...new Set(cuts.map(c => c.top))].sort((a, b) => a - b);
  const parts = tops.map(top => {
    const atTop = cuts.filter(c => c.top === top);
    const where = atTop.map(c => `${c.axis ? 'y' : 'x'} ${Math.round(c.from)}-${Math.round(c.to)}`).join(' and ');
    const over = [...new Set(atTop.flatMap(c => c.things))].map(k => lower(things[k].name));
    return `at ${top} over ${where} (for the ${over.join(', ')})`;
  });
  // The lowest uncut shelf over the tallest thing in the bay
  const tallest = Math.max(...cuts.flatMap(c => c.things.map(k => things[k].h)));
  const bay = [...new Set(cuts.flatMap(c => c.things))].map(k => things[k]);
  const overBay = ({ poly }) => {
    const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
    return bay.some(({ x, y, w, d }) => x < x1 && x + w > x0 && y < y1 && y + d > y0);
  };
  const kept = shelves.filter(s => s.top > Math.max(...tops) && overBay(s)).map(s => s.top).sort((a, b) => a - b)[0];
  return ` Shelves cut back for a shelfless bay: ${parts.join('; ')}.` +
    (kept ? ` Above the bay the ${kept} shelf stays: ${kept - 2 * BOARD} clear from the cupboard floor, ${kept - 2 * BOARD - tallest} over the ${tallest}-high ${lower(things.find(t => t.h === tallest).name)}.`
          : '');
}

// ---------------------------------------------------------------------------
// Parts of options 7 to 9
// ---------------------------------------------------------------------------

// Left-wall cupboard door: (F - back - 2 gaps) x (H - 2 gaps) on x T to
// T + BOARD, y back + DOOR_GAP to F - DOOR_GAP, hinged at y = F
function tallDoor(job, g, back) {                                 // back: where the door's run starts
  const { T, F, BOARD } = job.s, { H, mats } = job;
  if (T === 0) return null;
  const h = hinge(T, F, g);
  const w = F - back - 2 * DOOR_GAP;
  board(job, 'Left-wall leg door', { from: [0, -w - DOOR_GAP, DOOR_GAP], to: [BOARD, -DOOR_GAP, H - DOOR_GAP] }, h, 'Doors');
  box({ from: [BOARD, -w + 17, HANDLE_BOTTOM], to: [BOARD + 22, -w + 37, HANDLE_TOP] }, mats.handle, h, false); // handle near the free edge
  return h;
}

// The full-height L of option 7: legs inside LEG along the back wall (x 0 to
// T + LEG, LEG_D deep) and F - LEG_D along the left wall (y LEG_D to F), one
// space round the corner. Returns the back-wall leg door's hinge.
function fullHeightL(job, g) {
  const { T, F, BOARD: B, LEG, LEG_D, L_SHELVES } = job.s, { H, mats } = job;
  const E = T + LEG, Dl = LEG_D;                                 // Dl: the back-wall leg's depth
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [E, B, H] }, g);                    // runs through the corner
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, T ? F : Dl, H] }, g);            // stops at it; with no left-wall leg, the back-wall leg's side
  board(job, 'Left-wall leg front end', { from: [B, F - B, 0], to: [T, F, H] }, g);
  board(job, 'Back-wall leg end', { from: [E - B, B, 0], to: [E, Dl, H] }, g);
  board(job, 'Back-wall leg top', { from: [B, B, H - B], to: [E - B, Dl, H] }, g);              // tops and bottoms, between them
  board(job, 'Left-wall leg top', { from: [B, Dl, H - B], to: [T, F - B, H] }, g);
  board(job, 'Back-wall leg bottom', { from: [B, B, 0], to: [E - B, Dl, B] }, g);
  board(job, 'Left-wall leg bottom', { from: [B, Dl, 0], to: [T, F - B, B] }, g);
  for (const top of L_SHELVES.back) cupShelf(job, rectPoly(B, B, E - B, Dl - B), top, mats.carcass);
  if (T) for (const top of L_SHELVES.left) cupShelf(job, rectPoly(B, Dl - B, T - B, F - B), top, mats.carcass);
  const second = hinge(E, Dl + B, g);
  board(job, 'Back-wall leg door', { from: [T + B + DOOR_GAP - E, -B, DOOR_GAP], to: [-DOOR_GAP, 0, H - DOOR_GAP] }, second, 'Doors');
  box({ from: [T + B + 20 - E, 0, HANDLE_BOTTOM], to: [T + B + 40 - E, 22, HANDLE_TOP] }, mats.handle, second, false);
  return second;
}

// Option 8's diagonal front, from (T, F) to (T + DIAGONAL_RUN, R): its
// length, its direction (ux, uy) from the left end, each door's width, and
// the angle for skewHinge() at the left end.
export function diagonal({ R, F }) {
  const dx = DIAGONAL_RUN, dy = R - F;
  const length = Math.hypot(dx, dy);
  const ux = dx / length, uy = dy / length;
  return { length, ux, uy, door: (length - 3 * DOOR_GAP) / 2, angle: THREE.MathUtils.radToDeg(Math.atan2(-uy, ux)) };
}

// The gap between option 8's left door, opened to 90°, and the room's door
// opened into the room (its hinge at y door.hingeAt on the left wall, so it
// stands door.thickness thick and door.width out from the wall); below 0
// they clash. The open door points straight out from the front, so sample
// its outline there.
function roomDoorGap(settings, { door: roomDoor }) {
  const { T, F, BOARD } = settings;
  const { ux, uy, door } = diagonal(settings);
  const ox = -uy, oy = ux;                                      // out of the cupboard
  let nearest = Infinity;
  for (let a = DOOR_GAP; a <= DOOR_GAP + door; a += 1) {
    for (const b of [0, -BOARD]) {                                 // the door's two faces, BOARD apart
      const x = T + a * ox + b * ux, y = F + a * oy + b * uy;
      if (y >= roomDoor.hingeAt && y <= roomDoor.hingeAt + roomDoor.thickness) nearest = Math.min(nearest, x);
    }
  }
  return nearest === Infinity ? Infinity : Math.round(nearest - roomDoor.width);
}

// Option 8's carcass: rear panels and ends as option 7's, and a top and
// bottom between them that run out to the diagonal front
function diagonalCarcass(job, g) {
  const { T, R, F, BOARD: B } = job.s, { H, mats } = job;
  const E = T + DIAGONAL_RUN;
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [E, B, H] }, g);                // runs through the corner
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, F, H] }, g);                // stops at it
  board(job, 'Left-wall end', { from: [B, F - B, 0], to: [T, F, H] }, g);
  board(job, 'Back-wall end', { from: [E - B, B, 0], to: [E, R, H] }, g);
  const across = (x, y) => [[x, R + (E - x) * (F - R) / DIAGONAL_RUN], [T + (F - y) * DIAGONAL_RUN / (F - R), y]];   // where x and y meet the front
  const outline = [[B, B], [E - B, B], ...across(E - B, F - B), [B, F - B]];
  ofKind('Panels', part('Top', slab(outline, H - B, H, mats.carcass, g)));
  ofKind('Panels', part('Bottom', slab(outline, 0, B, mats.carcass, g)));
}

// Option 8's inside, SHELF_SETBACK behind the diagonal front: that line
// meets x = E - B and y = F - B. Its shelves, and the space for the things
// to store (insideSpaces()), have this outline.
function diagonalInside(settings) {
  const { T, F, BOARD: B } = settings;
  const E = T + DIAGONAL_RUN, { ux, uy } = diagonal(settings);
  const nx = uy, ny = -ux;                                   // unit normal, pointing into the cupboard
  const c = T * nx + F * ny + SHELF_SETBACK;                  // the line n · p = c
  return [[B, B], [E - B, B], [E - B, (c - (E - B) * nx) / ny], [(c - (F - B) * ny) / nx, F - B], [B, F - B]];
}

// Option 8's pair of doors across the diagonal front, each
// (length - 3 * DOOR_GAP) / 2: the left one hinged at (T, F), the right at
// (E, R). Returns their hinges.
function diagonalDoors(job, g) {
  const { T, R, F, BOARD: B } = job.s, { H, mats } = job;
  const E = T + DIAGONAL_RUN, { door, angle } = diagonal(job.s);
  const left = skewHinge(T, F, angle, -1, g);
  board(job, 'Diagonal door', { from: [DOOR_GAP, 0, DOOR_GAP], to: [DOOR_GAP + door, B, H - DOOR_GAP] }, left, 'Doors');
  box({ from: [door - 40, B, HANDLE_BOTTOM], to: [door - 20, B + 22, HANDLE_TOP] }, mats.handle, left, false);
  const right = skewHinge(E, R, angle - 180, 1, g);
  board(job, 'Diagonal door', { from: [DOOR_GAP, -B, DOOR_GAP], to: [DOOR_GAP + door, 0, H - DOOR_GAP] }, right, 'Doors');
  box({ from: [door - 40, -B - 22, HANDLE_BOTTOM], to: [door - 20, -B, HANDLE_TOP] }, mats.handle, right, false);
  return [left, right];
}

// Option 9's carcass: the double-door cupboard on the back wall (x T to
// T + WARD, WARD_D deep) and option 7's left-wall leg behind it, with their
// shelves
function wardCarcass(job, g) {
  const { T, F, BOARD: B, WARD, WARD_D: Dw } = job.s, { H, mats } = job;   // Dw: the double-door cupboard's depth
  const E = T + WARD;
  // Rear panels: the back wall's runs through the corner, the left wall's
  // stops at it (and with no left-wall leg, is the cupboard's side)
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [E, B, H] }, g);
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, T ? F : Dw, H] }, g);
  // The left-wall leg, as in option 7, behind the deeper cupboard; with no
  // left-wall cupboard these draw nothing
  board(job, 'Left-wall leg front end', { from: [B, F - B, 0], to: [T, F, H] }, g);
  board(job, 'Left-wall leg top', { from: [B, Dw, H - B], to: [T, F - B, H] }, g);
  board(job, 'Left-wall leg bottom', { from: [B, Dw, 0], to: [T, F - B, B] }, g);
  // The double-door cupboard on the back wall
  board(job, 'Cupboard end', { from: [E - B, B, 0], to: [E, Dw, H] }, g);
  board(job, 'Cupboard top', { from: [B, B, H - B], to: [E - B, Dw, H] }, g);
  board(job, 'Cupboard bottom', { from: [B, B, 0], to: [E - B, Dw, B] }, g);
  for (const top of SHELF_TOPS) {
    cupShelf(job, rectPoly(B, B, E - B, Dw - B), top, mats.carcass);
    if (T) cupShelf(job, rectPoly(B, Dw - B, T - B, F - B), top, mats.carcass);   // none with no left-wall leg
  }
}

// Option 9's pair of doors across T + B + DOOR_GAP to E - DOOR_GAP, meeting
// in the middle. Returns their hinges.
function wardDoors(job, g) {
  const { T, BOARD: B, WARD, WARD_D: Dw } = job.s, { H, mats } = job;
  const E = T + WARD;
  const w = (WARD - B - 3 * DOOR_GAP) / 2;
  const left = hinge(T + B + DOOR_GAP, Dw + B, g);
  left.userData.dir = -1;
  board(job, 'Cupboard door', { from: [0, -B, DOOR_GAP], to: [w, 0, H - DOOR_GAP] }, left, 'Doors');
  box({ from: [w - 40, 0, HANDLE_BOTTOM], to: [w - 20, 22, HANDLE_TOP] }, mats.handle, left, false);
  const right = hinge(E - DOOR_GAP, Dw + B, g);
  board(job, 'Cupboard door', { from: [-w, -B, DOOR_GAP], to: [0, 0, H - DOOR_GAP] }, right, 'Doors');
  box({ from: [20 - w, 0, HANDLE_BOTTOM], to: [40 - w, 22, HANDLE_TOP] }, mats.handle, right, false);
  return [left, right];
}

// Option 9's open shelving tower, x0 to x1, full height, with a light strip
// under the front of each shelf
export const PLINTH = 100;               // its kick plinth's height, as the base cupboards' (chosen)
function shelvingTower(job, x0, x1, g) {
  if (x1 - x0 < 100) return;
  const { R, BOARD: B } = job.s, { H, mats } = job;
  board(job, 'Shelving tower rear panel', { from: [x0, 0, 0], to: [x1, B, H] }, g);                 // against the back wall
  board(job, 'Shelving tower side', { from: [x1 - B, B, 0], to: [x1, R, H] }, g);
  board(job, 'Shelving tower top', { from: [x0, B, H - B], to: [x1 - B, R, H] }, g);
  part('Shelving tower plinth', box({ from: [x0, B, 0], to: [x1 - B, R, PLINTH] }, mats.carcass, g));   // a block, not a board
  const step = (H - B - PLINTH) / 6;
  for (let k = 1; k <= 5; k++) {
    const top = Math.round(PLINTH + k * step);
    box({ from: [x0, B, top - 25], to: [x1 - B, R, top] }, mats.oak, g);
    box({ from: [x0 + 20, R - 40, top - 32], to: [x1 - B - 20, R - 30, top - 25] }, mats.glow, g, false);
  }
}

// ---------------------------------------------------------------------------
// Options 10 and 11: a full-height cupboard in the corner
// ---------------------------------------------------------------------------

// CORNER_W along the back wall and CORNER_D (F here) out along the left
// wall. Its pair of doors face the kitchen (on its end, at y = F) or the
// windows (on its side, where it's clear of the bench, y R to F). Returns
// the doors' hinges, none if it's too shallow to build.
function cornerCupboard(job, g, facing) {
  if (cornerTooShallow(job.s, facing)) return [];
  cornerCarcass(job, g);
  return facing === 'kitchen' ? cornerDoorsToKitchen(job, g) : cornerDoorsToWindows(job, g);
}

// The corner cupboard's rear panels, top, bottom and shelves, the same
// whichever way it faces
function cornerCarcass(job, g) {
  const { CORNER_D: F, BOARD: B, CORNER_W: X } = job.s, { H, mats } = job;
  const E = X - B;
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [X, B, H] }, g);                   // runs through the corner
  // The left-wall rear panel stops at it, and at the front: behind option
  // 10's doors, or behind option 11's end, which runs across it
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, F - B, H] }, g);
  board(job, 'Top', { from: [B, B, H - B], to: [E, F - B, H] }, g);                            // top and bottom, between them
  board(job, 'Bottom', { from: [B, B, 0], to: [E, F - B, B] }, g);
  for (const top of SHELF_TOPS) cupShelf(job, rectPoly(B, B, E, F - B), top, mats.shelf);
}

// Option 10's corner cupboard: its side facing the windows, and a pair of
// doors on its end (y = F), facing the kitchen. Returns their hinges.
function cornerDoorsToKitchen(job, g) {
  const { CORNER_D: F, BOARD: B, CORNER_W: X } = job.s, { H, mats } = job;
  const E = X - B;
  board(job, 'Side facing the windows', { from: [E, B, 0], to: [X, F, H] }, g);
  const w = (E - 3 * DOOR_GAP) / 2;                              // a pair, DOOR_GAP from the wall, each other and the side
  const left = hinge(DOOR_GAP, F, g);
  left.userData.dir = -1;
  board(job, 'Cupboard door', { from: [0, -B, DOOR_GAP], to: [w, 0, H - DOOR_GAP] }, left, 'Doors');
  box({ from: [w - 40, 0, HANDLE_BOTTOM], to: [w - 20, 22, HANDLE_TOP] }, mats.handle, left, false);
  const right = hinge(E - DOOR_GAP, F, g);
  board(job, 'Cupboard door', { from: [-w, -B, DOOR_GAP], to: [0, 0, H - DOOR_GAP] }, right, 'Doors');
  box({ from: [20 - w, 0, HANDLE_BOTTOM], to: [40 - w, 22, HANDLE_TOP] }, mats.handle, right, false);
  return [left, right];
}

// Option 11's corner cupboard: its end facing the kitchen, its side by the
// bench, and a pair of doors on its side where it's clear of the bench
// (y R to F), facing the windows. Returns their hinges.
function cornerDoorsToWindows(job, g) {
  const { R, CORNER_D: F, BOARD: B, CORNER_W: X } = job.s, { H, mats } = job;
  const E = X - B;
  board(job, 'End facing the kitchen', { from: [0, F - B, 0], to: [X, F, H] }, g);
  board(job, 'Side by the bench', { from: [E, B, 0], to: [X, R, H] }, g);
  const w = (F - R - B - 3 * DOOR_GAP) / 2;                       // a pair on the side beyond the bench
  const back = hinge(E, R + DOOR_GAP, g);                         // hinged at the bench end
  board(job, 'Cupboard door', { from: [0, 0, DOOR_GAP], to: [B, w, H - DOOR_GAP] }, back, 'Doors');
  box({ from: [B, w - 40, HANDLE_BOTTOM], to: [B + 22, w - 20, HANDLE_TOP] }, mats.handle, back, false);
  const front = hinge(E, F - B - DOOR_GAP, g);                    // hinged at the kitchen end
  front.userData.dir = -1;
  board(job, 'Cupboard door', { from: [0, -w, DOOR_GAP], to: [B, 0, H - DOOR_GAP] }, front, 'Doors');
  box({ from: [B, 20 - w, HANDLE_BOTTOM], to: [B + 22, 40 - w, HANDLE_TOP] }, mats.handle, front, false);
  return [back, front];
}

// Option 10's side bookshelf: full height, open, from the corner cupboard
// (x CORNER_W - BOARD, sharing its side) to CORNER_W + SIDE_W, SIDE_D deep,
// with five shelves evenly up it and a light strip under the front of each,
// as option 9's tower. Where it's deeper than the cupboard (or there's no
// cupboard), it has a side of its own there. Its boards are part of the
// cupboard, so they're in its cutting list.
const sideShelfOn = s => s.SIDE_SHELF && OPTIONS[s.option].no === 10;
const sideShelfW = s => (sideShelfOn(s) ? s.SIDE_W : 0);   // how far it takes the bench along
const SIDE_SHELVES = 5;
const sideShelfTops = ({ BOARD }, ceiling) => [...Array(SIDE_SHELVES).keys()].map(k => Math.round(BOARD + (k + 1) * (ceiling - 2 * BOARD) / (SIDE_SHELVES + 1)));
function sideBookshelf(job, g) {
  const { CORNER_W: X, CORNER_D, BOARD: B, SIDE_W, SIDE_D: d } = job.s, { H, mats } = job;
  const alone = cornerTooShallow(job.s, 'kitchen');               // no cupboard beside it, nor its rear panel
  const x1 = X + SIDE_W, shared = alone ? B : Math.max(B, Math.min(CORNER_D, d));   // y the cupboard's side covers
  board(job, 'Bookshelf rear panel', { from: [alone ? X - B : X, 0, 0], to: [x1, B, H] }, g);     // against the back wall, on from the cupboard's
  board(job, 'Bookshelf side', { from: [x1 - B, B, 0], to: [x1, d, H] }, g);
  board(job, 'Bookshelf side, past the cupboard', { from: [X - B, shared, 0], to: [X, d, H] }, g);
  board(job, 'Bookshelf top', { from: [X, B, H - B], to: [x1 - B, d, H] }, g);
  board(job, 'Bookshelf bottom', { from: [X, B, 0], to: [x1 - B, d, B] }, g);
  for (const top of sideShelfTops(job.s, H)) {
    board(job, 'Bookshelf shelf', { from: [X, B, top - B], to: [x1 - B, d, top] }, g, 'Shelves');
    box({ from: [X + 20, d - 40, top - B - 7], to: [x1 - B - 20, d - 30, top - B] }, mats.glow, g, false);
  }
}
function sideShelfText(s, place) {
  if (!sideShelfOn(s)) return '';
  const { CORNER_W: X, SIDE_W, SIDE_D, BOARD } = s;
  return `Beside it, a ${SIDE_W}-wide, ${SIDE_D}-deep open bookshelf (x ${X}-${X + SIDE_W}), floor to ceiling, sharing the cupboard's side, ` +
    `with ${SIDE_SHELVES} lit shelves ${SIDE_W - BOARD} long, their tops at ${sideShelfTops(s, place.ceiling).join(', ')}. `;
}

// The least depth (CORNER_D) options 10 and 11's cupboard can be built at, as
// the slider goes down to 0: room inside for its top and bottom (between the
// left-wall rear panel and the doors, for option 10), and for
// option 11 room for its doors beside the bench. Below it, the cupboard isn't
// drawn and the description says so.
const cornerLeast = ({ BOARD, R }, facing) => facing === 'kitchen' ? 2 * BOARD + 1 : R + BOARD + 10;
export const cornerTooShallow = (s, facing) => s.CORNER_D < cornerLeast(s, facing);
const tooShallowText = (s, facing) => `No corner cupboard: at ${s.CORNER_D} out along the left wall it's too shallow to build ` +
  `(it needs at least ${cornerLeast(s, facing)}${facing === 'kitchen' ? '' : `, for doors beside the ${s.R}-deep bench`}). `;

// ---------------------------------------------------------------------------
// The options. Each part is a function of the settings (`s`), as their
// sizes depend on them; a summary also of the room (`place`) and of what's
// round the cupboard that it mentions (`around`: the bench's height,
// BENCH). The bench itself the room draws, from benchFrom() to its
// right-hand wall.
// ---------------------------------------------------------------------------
export const OPTIONS = [
  {
    name: '7. Full-height L-shaped cupboard',
    defaultLeft: 600,                                  // chosen with no left-wall cupboard: one this deep (it can be taken away again)
    source: 'plan3/room_3d.html',
    clearFrom: ({ T, LEG }) => T + LEG,
    benchFrom: ({ T, LEG }) => T + LEG,
    summaryNoLeft: ({ R, BOARD, LEG, LEG_D }, { width, ceiling }) => `No left-wall cupboard: a full-height cupboard on the back wall (x 0-${LEG}, ${LEG_D} deep), with a ${LEG - BOARD - 2 * DOOR_GAP} × ${ceiling - 2 * DOOR_GAP} door. Bench ${width - LEG}, from x = ${LEG}, ${R} deep.`,
    summary: ({ T, R, F, BOARD, LEG, LEG_D }, { width, ceiling }) => `Both legs of the L run floor to ceiling, ${LEG} inside along the back wall (${LEG_D} deep) and ${F - LEG_D} along the left wall, one space round the corner. Doors ${ceiling - 2 * DOOR_GAP} high, ${BOARD} thick: ${LEG - BOARD - 2 * DOOR_GAP} wide on the back-wall leg, ${F - LEG_D - 2 * DOOR_GAP} wide on the left-wall leg (it covers the corner). Bench shortened to ${width - T - LEG}, from x = ${T + LEG}, ${R} deep.`,
    second: 'Back-wall leg door',
    build(job, g) {
      return { tall: tallDoor(job, g, job.s.LEG_D), second: fullHeightL(job, g) };
    },
  },
  {
    name: '8. Full-height corner unit, diagonal double doors',
    needsLeft: true,                                   // not available without a left-wall cupboard
    source: 'option 7 (new)',
    clearFrom: ({ T }) => T + DIAGONAL_RUN,
    benchFrom: ({ T }) => T + DIAGONAL_RUN,
    summary: (s, place) => {
      const { T, R, F } = s, { length, door } = diagonal(s), gap = roomDoorGap(s, place), E = T + DIAGONAL_RUN;
      return `As option 7, but the front runs straight across from where its two doors hinge (x ${T}, y ${F} to x ${E}, y ${R}), about ${Math.round(length)} wide, with a pair of ${Math.round(door)} doors. Behind them it is one cupboard. ` +
        (gap < 0 ? `Opened to 90°, the left door crosses the open room door's path by about ${-gap}: open one at a time. `
                 : `Opened to 90°, the left door clears the open room door by about ${gap}. `) +
        `Bench ${place.width - E}, from x = ${E}, ${R} deep.`;
    },
    second: 'Double doors',
    build(job, g) {
      diagonalCarcass(job, g);
      for (const top of SHELF_TOPS) cupShelf(job, diagonalInside(job.s), top, job.mats.shelf);
      return { second: diagonalDoors(job, g) };
    },
  },
  {
    name: '9. Double-door cupboard and shelves',
    source: 'option 7 and the photo (new)',
    clearFrom: ({ T, WARD, TOWER }) => T + WARD + TOWER,
    benchFrom: ({ T, WARD, TOWER }) => T + WARD + TOWER,
    marks: ({ T, WARD }) => [T + WARD],
    summary: ({ T, R, F, BOARD, WARD, WARD_D, TOWER }, { width }, { BENCH }) => `${T ? `Option 7's left-wall leg (${F - WARD_D} inside, with its door), joined to a` : 'No left-wall cupboard. A'} full-height cupboard on the back wall (x ${T}-${T + WARD}, ${WARD_D} deep) with a pair of ${Math.round((WARD - BOARD - 3 * DOOR_GAP) / 2)} doors` +
      (TOWER >= 100 ? `, then a ${TOWER}-wide, ${R}-deep open shelving tower (to x ${T + WARD + TOWER}), floor to ceiling, with five lit shelves` : '') +
      `. Base cupboards with ${baseDoorCount(width - T - WARD - TOWER)} doors under an oak top run on to the right-hand wall: ${width - T - WARD - TOWER} long, ${BENCH} high, ${R} deep.`,
    second: 'Cupboard doors',
    build(job, g) {
      const { T, WARD, WARD_D, TOWER } = job.s;
      const E = T + WARD;
      wardCarcass(job, g);
      shelvingTower(job, E, E + TOWER, g);
      const second = wardDoors(job, g);
      return { tall: tallDoor(job, g, WARD_D), second };
    },
  },

  {
    name: '10. Corner cupboard, doors facing the kitchen',
    source: 'option 10 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D }) => CORNER_D,                           // its own depth out along the left wall, in place of F
    clearFrom: s => s.CORNER_W + sideShelfW(s),                  // past the side bookshelf, when there is one
    benchFrom: s => s.CORNER_W + sideShelfW(s),
    marks: s => (sideShelfOn(s) ? [s.CORNER_W] : []),
    summary: (s, place) => {
      const { R, CORNER_D: F, BOARD, CORNER_W } = s, { door } = place;
      const S = CORNER_W + sideShelfW(s), bench = `Bench ${place.width - S}, from x = ${S}, ${R} deep.`;
      if (cornerTooShallow(s, 'kitchen')) return `${tooShallowText(s, 'kitchen')}${sideShelfText(s, place)}${bench}`;
      const w = Math.round((CORNER_W - BOARD - 3 * DOOR_GAP) / 2), reach = F + w;
      return `A full-height cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
        `${F === door.frameFrom ? ', right up to the door frame' : ''}, with a pair of ${w} doors on its end, facing the kitchen. ` +
        (reach > door.hingeAt ? `Opened to 90°, they reach ${reach} from the back wall, past the room door's hinge at ${door.hingeAt}: they can't open fully while the room door is open. ` : '') +
        `${sideShelfText(s, place)}${bench}`;
    },
    second: 'Cupboard doors',
    build(job, g) {
      const doors = cornerCupboard(job, g, 'kitchen');
      if (sideShelfOn(job.s)) sideBookshelf(job, g);
      return { second: doors };
    },
  },
  {
    name: '11. Corner cupboard, doors facing the windows',
    source: 'option 11 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D }) => CORNER_D,                           // its own depth out along the left wall, in place of F
    clearFrom: ({ CORNER_W }) => CORNER_W,
    benchFrom: ({ CORNER_W }) => CORNER_W,
    summary: (s, { width, door }) => {
      const { R, CORNER_D: F, BOARD, CORNER_W } = s;
      return cornerTooShallow(s, 'windows') ? `${tooShallowText(s, 'windows')}Bench ${width - CORNER_W}, from x = ${CORNER_W}, ${R} deep.` : `A full-height cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
        `${F === door.frameFrom ? ', right up to the door frame' : ''}, with a pair of ${Math.round((F - R - BOARD - 3 * DOOR_GAP) / 2)} doors on its side, facing the windows, ` +
        `where it's clear of the ${R}-deep bench (y ${R}-${F}). Behind the doors it runs back to the back wall, behind the bench end. ` +
        `Bench ${width - CORNER_W}, from x = ${CORNER_W}, ${R} deep.`;
    },
    second: 'Cupboard doors',
    build(job, g) {
      return { second: cornerCupboard(job, g, 'windows') };
    },
  },

  {
    name: '16. Current room, no cupboards yet',
    source: 'the room as it is now',
    clearFrom: () => 0,                                           // what's above the bench goes on the bare back wall
    benchFrom: () => 0,
    summary: ({ R }, { width }) => `The room as it is now, with no cupboards. Bench ${width}, the whole back wall, ${R} deep. Oak floor, Crown Gallery White walls, Pure Brilliant White door, frame and ceiling, and the kitchen, island and desk.`,
    build() {
      return {};
    },
  },
];
// Each option's number is the one in its name. The list starts at 7 (options
// 1 to 6 were taken out), so options are found by number, never by their
// place in the list: optionAt(9) is option 9's index, -1 if there's none.
for (const o of OPTIONS) o.no = parseInt(o.name, 10);
export const optionAt = no => OPTIONS.findIndex(o => o.no === no);
export const CURRENT = OPTIONS.length - 1;

// A corner cupboard: the chosen option (settings.option) built into a new
// group, standing in place's back-left corner, and what's asked of it.
//   group             everything it's built of, its shelves included
//   doors             { tall, second }: the left-wall leg's door (options 7
//                     and 9) and the option's other door or doors, hinges
//   shelves           what it recorded as it was built, for drawShelves()
//   drawShelves(things), shelfCutText(things)
//                     its shelves drawn round the things to store (each
//                     { name, h, x, y, z, w, d }), and what's cut back
//   turnDoors(angles) its doors opened to angles.tall and angles.second, in
//                     degrees, each second door stopping at its room's walls
//   cuttingList(), cuttingRows()
//   partOf(o, withDoors), dims(view, g), doorDims(view, g)
//                     what Cupboard only shows, and its dimensions in a view
//                     ({ flat, flatView })
export function makeCupboard(settings, place, materials) {
  const job = cupboardJob(settings, place, materials);
  const group = new THREE.Group();
  const { tall = null, second = null } = OPTIONS[settings.option].build(job, group);
  const shelfGroup = new THREE.Group();                          // drawn into by drawShelves()
  shelfGroup.userData.cupShelves = true;                         // so its dimensions know the shelves from an open tower's
  group.add(shelfGroup);
  let cuts = [];                                                 // what drawShelves() last cut
  const turn = degrees => THREE.MathUtils.degToRad(degrees);
  return {
    group, doors: { tall, second }, shelves: job.shelves,
    drawShelves(things) { cuts = drawShelves(job.shelves, things, settings.BOARD, shelfGroup); },
    shelfCutText: things => shelfCutText(cuts, job.shelves, things, settings.BOARD),
    turnDoors(angles) {
      if (tall) tall.rotation.y = -turn(angles.tall);
      for (const h of [].concat(second ?? [])) h.rotation.y = (h.userData.dir ?? 1) * turn(Math.min(angles.second, opensTo(h, group, place)));
    },
    cuttingList: () => cuttingList(group, settings.BOARD),
    cuttingRows: () => cuttingRows(group, settings.BOARD),
    partOf: (o, withDoors = true) => partOfCupboard(o, group, withDoors),
    dims: (view, g) => cupboardDims(group, materials, view, g),
    doorDims: (view, g) => doorDims(group, place, view, g),
  };
}

// ---------------------------------------------------------------------------
// The inside, for the things to store
// ---------------------------------------------------------------------------

// The cupboard's inside spaces, for packing: each a plan outline (room x, y)
// and the clear height above it, in mm. Shelves inside are taken to be
// removable; the cupboard's own panels count, the rear panels against the
// walls included: the inside starts a board (B) out from each wall, so it
// follows the boards' thickness.
export function insideSpaces(settings, place) {
  const { T, F, BOARD: B, LEG, LEG_D, WARD, WARD_D, CORNER_W, CORNER_D } = settings;
  const rect = (x0, y0, x1, y1, h) => ({ poly: rectPoly(x0, y0, x1, y1), h });
  const full = place.ceiling - 2 * B;                                                    // inside a full-height cupboard
  const leftLeg = from => T ? [rect(B, from, T - B, F - B, full)] : [];
  const no = OPTIONS[settings.option].no;
  switch (no) {
    case 7:                                                      // the full-height L, one space round the corner
      return [rect(B, B, T + LEG - B, LEG_D - B, full), ...leftLeg(LEG_D - B)];
    case 8:                                                      // the corner unit, to SHELF_SETBACK behind its diagonal front
      return [{ poly: diagonalInside(settings), h: full }];
    case 9:                                                      // the double-door cupboard and the left-wall leg
      return [rect(B, B, T + WARD - B, WARD_D, full), ...leftLeg(WARD_D)];
    case 10: case 11:                                            // the CORNER_W × CORNER_D corner cupboard, back to the wall behind the bench
      return cornerTooShallow(settings, no === 10 ? 'kitchen' : 'windows') ? [] : [rect(B, B, CORNER_W - B, CORNER_D - B, full)];
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Its doors
// ---------------------------------------------------------------------------

// How far a door can open before it meets a wall of the cupboard's room, in
// degrees, up to the slider's 180: option 10's left door stops at the left
// wall, near 90°, and option 8's right door at the back wall when the
// diagonal's deep. Found by turning it a degree at a time, once for each
// build of the door; the door's box is taken in the cupboard's own mm, which
// are its room's (cupboard: its group).
function opensTo(hinge, cupboard, place) {
  if (hinge.userData.opensTo === undefined) {
    let degrees = 0;
    while (degrees < 180) {
      hinge.rotation.y = (hinge.userData.dir ?? 1) * THREE.MathUtils.degToRad(degrees + 1);
      if (!insideRoom(hinge, cupboard, place)) break;
      degrees++;
    }
    hinge.userData.opensTo = degrees;
  }
  return hinge.userData.opensTo;
}
// Whether a door on its hinge lies inside its room's walls, floor and
// ceiling, to the mm
function insideRoom(hinge, cupboard, { width, depth, ceiling }) {
  cupboard.updateWorldMatrix(true, true);
  const toCupboard = cupboard.matrixWorld.clone().invert(), box = new THREE.Box3(), meshBox = new THREE.Box3();
  hinge.traverse(o => {
    if (!o.isMesh) return;
    o.geometry.computeBoundingBox();
    box.union(meshBox.copy(o.geometry.boundingBox).applyMatrix4(toCupboard.clone().multiply(o.matrixWorld)));
  });
  const mm = v => [v.x, v.z, v.y].map(n => Math.round(n / MM) || 0);   // room (x, y, z) from the scene's (x, z, y)
  const from = mm(box.min), to = mm(box.max);
  return from.every(v => v >= 0) && to[0] <= width && to[1] <= depth && to[2] <= ceiling;
}

// ---------------------------------------------------------------------------
// Its dimensions, for the 2D views and Cupboard only
// ---------------------------------------------------------------------------

// Room (x, y, z) in mm to a scene point
const P = (x, y, z) => new THREE.Vector3(x * MM, z * MM, y * MM);

// Whether o is part of the cupboard (its group), its doors left out unless
// withDoors: what Cupboard only shows
function partOfCupboard(o, cupboard, withDoors = true) {
  for (let p = o; p; p = p.parent) {
    if (!withDoors && p.userData.hinge) return false;
    if (p === cupboard) return true;
  }
  return false;
}

// The cupboard's dimensions, from its parts (bar its doors, which may be
// open): along the back wall and out from it, the edges of its outline in
// plan, and up, its height and its shelves'. view: { flat, flatView }, as
// the page shows it.
function cupboardDims(cupboard, materials, { flat, flatView }, g) {
  cupboard.updateWorldMatrix(true, true);
  const boxes = [], shelfTops = [];
  cupboard.traverse(o => {
    if (!o.isMesh || o.material === materials.glow || !partOfCupboard(o, cupboard, false)) return;
    const b = new THREE.Box3().setFromObject(o);
    boxes.push({ x0: b.min.x / MM, x1: b.max.x / MM, y0: b.min.z / MM, y1: b.max.z / MM, z0: b.min.y / MM, z1: b.max.y / MM });
    // The cupboard's own shelves (as recorded with cupShelf()), not an open tower's beside it
    for (let p = o.parent; p; p = p.parent) if (p.userData.cupShelves) { shelfTops.push(Math.round(b.max.y / MM)); break; }
  });
  if (!boxes.length) return;
  const inside = (x, y) => boxes.some(b => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);
  const lo = k => Math.min(...boxes.map(b => b[k + '0'])), hi = k => Math.max(...boxes.map(b => b[k + '1']));
  const [x0, x1, y0, y1, z1] = [lo('x'), hi('x'), lo('y'), hi('y'), hi('z')];
  // An edge of the outline: on one side of it the plan is filled somewhere, on the other not
  const edges = (k, from, to) => [...new Set(boxes.flatMap(b => [b[k + '0'], b[k + '1']]).map(Math.round))].filter(v => {
    for (let t = from + 5; t < to; t += 20) {
      const a = k === 'x' ? inside(v - 3, t) : inside(t, v - 3), b = k === 'x' ? inside(v + 3, t) : inside(t, v + 3);
      if (a !== b) return true;
    }
    return false;
  });
  const along = edges('x', y0, y1), out = edges('y', x0, x1);
  const heights = [0, ...shelfTops.filter(z => z > 60 && z < z1 - 40), z1];
  // Each chain, and outside it the overall size, when it's in parts
  const withTotal = (at, place, g) => {
    chain(at, place, g);
    const v = [...new Set(at.map(Math.round))];
    if (v.length > 2) chain([Math.min(...v), Math.max(...v)], (u, off) => place(u, off + 330), g);
  };
  if (flatView === 'back') {
    withTotal(along, (v, off) => P(v, y1, -200 - off), g);
    withTotal(heights, (v, off) => P(x1 + 250 + off, y1, v), g);
  } else if (flatView === 'left' || flatView === 'right') {
    withTotal(out, (v, off) => P(x1, v, -200 - off), g);
    withTotal(heights, (v, off) => P(x1, y1 + 250 + off, v), g);
  } else {                                                      // the plan, and the 3D views
    withTotal(along, (v, off) => P(v, y0 - 250 - off, z1), g);
    withTotal(out, (v, off) => P(x0 - 250 - off, v, z1), g);
    if (!flat) withTotal(heights, (v, off) => P(x1 + 250 + off, y0, v), g);
  }
}

// The cupboard's doors, each labelled with its size, width × height in mm,
// from the door as built (so it follows the boards' thickness): in the plan
// all of them (over the cupboard, under the room's ceiling), in a wall view
// those facing it, and with the cupboard on its own in 3D, all of them.
function doorDims(cupboard, place, { flat, flatView }, g) {
  cupboard.updateWorldMatrix(true, true);
  const facing = { back: 'z', front: 'z', left: 'x', right: 'x' }[flatView];   // in a wall view, the scene axis a door facing it is thin along
  cupboard.traverse(o => {
    if (!o.isMesh || o.userData.kind !== 'Doors') return;
    const b = new THREE.Box3().setFromObject(o), size = b.getSize(new THREE.Vector3()), at = b.getCenter(new THREE.Vector3());
    if (flat && facing && size[facing] > size[facing === 'x' ? 'z' : 'x']) return;   // side on to this view
    const { width, height, depth } = o.geometry.parameters;
    if (flat && flatView === 'plan') at.y = (place.ceiling + 150) * MM;          // over the cupboard
    dimLabel(`Door ${Math.round(Math.max(width, depth) / MM)} × ${Math.round(height / MM)}`, at, g, '#1f4e79', 0.11);
  });
}

// ---------------------------------------------------------------------------
// Its cutting list
// ---------------------------------------------------------------------------

// Every board in the cupboard as it's built, by kind and size, largest
// first, with how many of each. It's read from the model, so it follows
// every setting, the boards' thickness included. A board's size is its
// length × width, its two larger sides; its thickness is BOARD. A shaped
// board (option 8's top and bottom, a shelf cut round a bay) is given as the
// rectangle it's cut from. Parts that aren't boards (option 9's oak shelves
// and plinth) are left out. Each size of board lists what it's for, from
// the names part() gives them. CUT_RULE, at its head, says which boards are
// shortened where they meet.
export const CUT_RULE = 'Rear panels (against the walls) and ends run full height. In a corner the back-wall rear panel runs through; ' +
  'the left-wall rear panel stops at it. Tops, bottoms and dividers fit between them. Shelves fit inside; doors cover the front edges, 3 clear.';
export const CUT_EXCEPTIONS = {
  10: "Option 10's left-wall rear panel stops behind its doors.",
  11: "Option 11's end facing the kitchen runs across the left-wall rear panel.",
};
// group: the cupboard's, or a copy of it (the bedroom's). Each board is
// listed under the kind board() or ofKind() marked it with. Returns a Map
// of kind -> Map of 'l×w×shaped' -> { l, w, shaped, n, parts }
export function cuttingList(group, BOARD) {
  const kinds = new Map();
  group?.traverse(o => {
    const { kind } = o.userData;
    if (!o.isMesh || !kind) return;
    o.geometry.computeBoundingBox();
    const [t, w, l] = o.geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map(v => Math.round(v / MM)).sort((a, b) => a - b);
    if (t !== BOARD) return;
    const shaped = o.geometry.type === 'ExtrudeGeometry' && new Set(o.geometry.parameters.shapes.getPoints().map(p => `${p.x},${p.y}`)).size !== 4;
    if (!kinds.has(kind)) kinds.set(kind, new Map());
    const sizes = kinds.get(kind), key = `${l}×${w}×${shaped}`;
    if (!sizes.has(key)) sizes.set(key, { l, w, shaped, n: 0, parts: new Set() });
    sizes.get(key).n++;
    if (o.userData.part) sizes.get(key).parts.add(o.userData.part);
  });
  return kinds;
}
// Its kinds in the order listed, and each kind's sizes, largest first
export const CUT_KINDS = ['Panels', 'Doors', 'Shelves'];
export const sizesInOrder = sizes => [...sizes.values()].sort((a, b) => b.l - a.l || b.w - a.w);

// The cutting list as rows, in the order the page lists them
export function cuttingRows(group, BOARD) {
  const kinds = cuttingList(group, BOARD);
  return CUT_KINDS.filter(k => kinds.has(k)).flatMap(kind => sizesInOrder(kinds.get(kind)).map(({ l, w, shaped, n, parts }) =>
    ({ kind, length: l, width: w, shaped, count: n, parts: [...parts] })));
}
