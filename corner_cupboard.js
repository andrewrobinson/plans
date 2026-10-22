// The corner cupboard: its options (7 to 11, and 16 for none), the builders
// that draw them, the shelves inside and their cutting back round the things
// to store, its inside spaces, its dimensions and door sizes, and its
// cutting list. Nothing here reads the flat's settings or a room's
// constants: each builder is given
//
//   settings   the cupboard's piece of the configuration: `option` (its
//              number, 7 to 11 or 16), T, R, F, BOARD, TOP, LEG, LEG_D,
//              L_SHELVES, DIAG_RUN, DIAG_BACK, DIAG_LEFT, ENDS, END_BACK,
//              END_BACK_D, END_LEFT, END_LEFT_D, WARD, WARD_D, TOWER,
//              CORNER_W, CORNER_D, SIDE_SHELF, SIDE_W, SIDE_D, DESK, DESK_W,
//              DESK_D, DESK_H
//              (room_dimensions.md has what each is)
//   place      the room it stands in, in its own mm: `width` along the
//              back wall, `depth` out from it, `ceiling`, and its `door`
//              (frameFrom, hingeAt, width, thickness), which option 8's
//              left door and option 10's doors can meet
//   materials  its own, from makeMaterials(): the living room's is
//              CUPBOARD_MATERIALS
//
// makeCupboard() builds the chosen option into a group, the cupboard
// standing in its room's back-left corner (x along the back wall, y out
// from it, z up), and gives what's asked of it. REFACTOR_PLAN.md step 6d.
import * as THREE from 'three';
import { MM, material, box, slab, part, skewHinge, dimLabel, chain } from './kit/floor_kit.js';

// A cupboard's own materials: its boards (carcass), shelves and doors, the
// handles, and option 9's and 10's oak shelves and light strips. Each
// cupboard has its own set, so each can be coloured on its own.
export const makeMaterials = () => ({
  carcass: material(0xc9a877),
  shelf: material(0xd6bc8f),
  door: material(0xd8bd92),
  handle: material(0x333333),
  oak: material(0xc8a26b),
  glow: new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd28a, emissiveIntensity: 1.2 }),
});
// The living room cupboard's (the flat's colour picker and shelf wood
// recolour them)
export const CUPBOARD_MATERIALS = makeMaterials();

// See-through: a cupboard's boards drawn faint, so what's inside shows (a
// way of looking, set from the view)
export function seeThrough(materials, on) {
  const { carcass } = materials;
  carcass.transparent = on;
  carcass.opacity = on ? 0.25 : 1;
  carcass.depthWrite = !on;
  carcass.needsUpdate = true;
}

// The settings a cupboard is built from: its piece of the configuration
export const CUPBOARD_SETTINGS = ['option', 'T', 'R', 'F', 'BOARD', 'TOP', 'LEG', 'LEG_D', 'L_SHELVES', 'DIAG_RUN', 'DIAG_BACK',
  'DIAG_LEFT', 'ENDS', 'END_BACK', 'END_BACK_D', 'END_LEFT', 'END_LEFT_D', 'WARD', 'WARD_D', 'TOWER', 'CORNER_W', 'CORNER_D', 'SIDE_SHELF', 'SIDE_W', 'SIDE_D', 'DESK', 'DESK_W', 'DESK_D', 'DESK_H'];

// How high the cupboard's full-height parts stand: up to the ceiling, or
// lower when TOP (0 for the ceiling) is set below it
export const cupboardHeight = ({ TOP }, { ceiling }) => (TOP && TOP < ceiling ? TOP : ceiling);
// The top of the cupboard's part along the back wall, for what stands on it
// (the speakers): from x0 to x1 along the back wall, d deep from it, and how
// high it is. null when there's none: option 16, or a corner cupboard too
// shallow to build. Each option's backTop() gives the part
export function topAlongBackWall(s, place) {
  const top = optionOf(s.option)?.backTop?.(s);
  return top ? { ...top, h: cupboardHeight(s, place) } : null;
}
// "floor to ceiling", or how high it stands when it's lower, for the summaries
const fullHeightText = (s, place) => (cupboardHeight(s, place) < place.ceiling ? `${cupboardHeight(s, place)} high, from the floor` : 'floor to ceiling');
// ...and "full-height", or "2100-high"
const fullHeightWord = (s, place) => (cupboardHeight(s, place) < place.ceiling ? `${cupboardHeight(s, place)}-high` : 'full-height');

// The doors' handles: bars from 950 to 1250 off the floor, HANDLE_W wide
// and standing HANDLE_OUT off the door, HANDLE_IN in from its free edge
// (chosen, not measured)
const HANDLE_BOTTOM = 950, HANDLE_TOP = 1250, HANDLE_W = 20, HANDLE_OUT = 22, HANDLE_IN = 20;
// The doors stand DOOR_GAP clear of the cupboard's edges, the floor, the
// ceiling and each other (chosen), so n doors across a span are
// (span - (n + 1) * DOOR_GAP) / n wide
export const DOOR_GAP = 3;
// No door is wider than MAX_DOOR_W (chosen by the user, 18 Oct 2026, so the
// doors can be built and hung): a longer front has more doors, all the same
// width, hung in pairs (doorRow())
export const MAX_DOOR_W = 600;
// Option 8's shelves stop SHELF_SETBACK behind its front (chosen), and its
// diagonal is never less than MIN_DIAGONAL along either wall (chosen), however
// far the straight fronts before it run
const SHELF_SETBACK = 25;
export const MIN_DIAGONAL = 100;
// The shelf tops in options 8 to 11 (chosen; option 7's are settings)
const SHELF_TOPS = [600, 1200, 1800];
// The base cupboards along the bench have doors about this wide (chosen)
const BASE_DOOR_W = 450;

// How many doors base cupboards `span` long have
export const baseDoorCount = span => Math.max(1, Math.round(span / BASE_DOOR_W));

// How many doors a front `span` long has: the fewest, all the same width
// and DOOR_GAP clear of its ends and each other, with none wider than
// MAX_DOOR_W; an even number when `paired` (the fronts that have a pair)
export function doorCount(span, paired = false) {
  const n = Math.max(1, Math.ceil((span - DOOR_GAP) / (MAX_DOOR_W + DOOR_GAP)));
  return paired ? 2 * Math.ceil(n / 2) : n;
}
// ...and how wide each is
export const doorWidth = (span, n = doorCount(span)) => (span - (n + 1) * DOOR_GAP) / n;
// For the summaries: "a 576 door" or "two 431 doors" across a front, "a
// pair of 437 doors" or "two pairs of 300 doors" across a paired one, and a
// door's width alone, "576" or "two of 431"
const COUNT_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const countWord = n => COUNT_WORDS[n] ?? String(n);
export function doorsText(span, paired = false) {
  const n = doorCount(span, paired), w = Math.round(doorWidth(span, n));
  if (paired) return n === 2 ? `a pair of ${w} doors` : `${countWord(n / 2)} pairs of ${w} doors`;
  return n === 1 ? `a ${w} door` : `${countWord(n)} ${w} doors`;
}
const doorWidthText = span => {
  const n = doorCount(span), w = Math.round(doorWidth(span, n));
  return n === 1 ? `${w}` : `${countWord(n)} of ${w}`;
};

// The cupboard being built: what each builder below is given. H is how high
// the full-height boards run (cupboardHeight()); shelves are recorded into
// `shelves` (cupShelf()) as the boards go up.
const cupboardJob = (settings, place, materials) => ({ s: settings, place, H: cupboardHeight(settings, place), mats: materials, shelves: [] });

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
// A shelf: { poly, top, mat }, its plan outline and top, BOARD thick. None
// with no left-wall cupboard, nor above the cupboard's top board
function cupShelf(job, poly, top, mat) {
  const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
  if (x1 > x0 && y1 > y0 && top <= job.H - job.s.BOARD) job.shelves.push({ poly, top, mat });
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
// Doors
// ---------------------------------------------------------------------------

// The doors across a front, seen from above: the line from room point `a`
// to `b` ([x, y], the room on the left going from a to b), with the doors
// standing BOARD thick in front of it, doorCount() of them. They hang in
// pairs that meet in the middle, each hinged at its outer edge (turning
// about that edge of its outside face); with an odd number, the one at the
// `single` end ('a' or 'b') hangs on its own, hinged at that end. Each
// door's handle is near its free edge. Returns the doors' hinges, from a
// to b.
function doorRow(job, g, name, a, b, { paired = false, single = 'b' } = {}) {
  const { BOARD: B } = job.s, { H, mats } = job;
  const span = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / span, uy = (b[1] - a[1]) / span;
  const angle = THREE.MathUtils.radToDeg(Math.atan2(-uy, ux));   // for skewHinge(): the door's x axis along the front
  const n = doorCount(span, paired), w = doorWidth(span, n);
  return Array.from({ length: n }, (_, k) => {
    const atA = hingedAtA(k, n, single);
    const along = DOOR_GAP + k * (w + DOOR_GAP) + (atA ? 0 : w);   // the hinged edge, along the front from a
    const [hx, hy] = [a[0] + along * ux - B * uy, a[1] + along * uy + B * ux];   // ...on the door's outside face, B out from the front
    const h = skewHinge(hx, hy, angle, atA ? -1 : 1, g);          // each opens out into the room
    const side = atA ? 1 : -1;                                   // which way the door runs from its hinge
    board(job, name, { from: [Math.min(0, side * w), -B, DOOR_GAP], to: [Math.max(0, side * w), 0, H - DOOR_GAP] }, h, 'Doors');
    const handle = side * (w - HANDLE_IN), handleEnd = handle - side * HANDLE_W;
    box({ from: [Math.min(handle, handleEnd), 0, HANDLE_BOTTOM], to: [Math.max(handle, handleEnd), HANDLE_OUT, HANDLE_TOP] }, mats.handle, h, false);
    return h;
  });
}
// Whether door k of n across a front (counted from its end a) is hinged at
// its edge towards a: the lone door of an odd number at its own end, and in
// each pair the first towards a, the second towards b
function hingedAtA(k, n, single) {
  const odd = n % 2 === 1;
  if (odd && single === 'a' && k === 0) return true;
  if (odd && single === 'b' && k === n - 1) return false;
  const inPair = odd && single === 'a' ? k - 1 : k;              // its place counting the pairs from a
  return inPair % 2 === 0;
}

// ---------------------------------------------------------------------------
// Parts of options 7 to 9
// ---------------------------------------------------------------------------

// The left-wall leg's doors, across its front (x = T) from F (or `front`)
// back to `back`, hinged at the front end when there's one. Returns their
// hinges, none with no left-wall leg.
function tallDoors(job, g, back, { front = job.s.F } = {}) {
  const { T } = job.s;
  if (T === 0) return [];
  return doorRow(job, g, 'Left-wall leg door', [T, front], [T, back], { single: 'a' });
}

// Options 7 and 8's shallow ends (asked for, 22 Oct 2026): with ENDS on,
// the last END_BACK of the back-wall leg stands END_BACK_D deep, and the
// last END_LEFT of the left-wall leg END_LEFT_D deep, each with a return
// board at its step and no doors, as open bookshelves, with a divider
// between it and the cupboard (both asked for, 22 Oct 2026).
// Given the back-wall leg's end E, each leg's depth (backD from the back
// wall, leftD from the left wall) and how much of each can be shallow
// (backRoom, leftRoom), gives the ends: the steps at x = xs along the back
// wall and y = ys out along the left wall, and the ends' depths db and dl.
// A leg with no shallow end has its step at its end and keeps its depth.
const MIN_DEEP = 200;   // the least a leg's deep part keeps beside its shallow end, for a door (chosen); less, and the whole leg is shallow
function shallowEnds(s, { E, backD, leftD, backRoom, leftRoom }) {
  const length = (len, d, deep, room) => {
    if (!s.ENDS || d >= deep) return 0;
    const fits = Math.min(len, room);
    return room - fits < MIN_DEEP ? room : fits;
  };
  const back = length(s.END_BACK, s.END_BACK_D, backD, backRoom), left = length(s.END_LEFT, s.END_LEFT_D, leftD, leftRoom);
  return { E, xs: E - back, db: back ? s.END_BACK_D : backD, ys: s.F - left, dl: left ? s.END_LEFT_D : leftD, back, left };
}
// For the summaries: what the shallow ends are, or '' with none
function shallowEndsText({ back, left, db, dl }) {
  const ends = [back && `the back-wall leg's last ${back} is ${db} deep`, left && `the left-wall leg's last ${left} is ${dl} deep`].filter(Boolean);
  return ends.length ? ` Shallow ends: ${ends.join(' and ')}, open, as bookshelves.` : '';
}
// The boards at the steps, where a leg's deep part meets its shallow end,
// each on the deep side (none where a leg has no shallow end): the step,
// full height from the end's front out to the leg's, and the divider
// behind it, back to the rear panel, between the top and bottom
function stepBoards(job, g, { xs, db, ys, dl }, backD) {
  const { T, BOARD: B } = job.s, { H } = job;
  board(job, 'Back-wall leg step', { from: [xs - B, db, 0], to: [xs, backD, H] }, g);
  board(job, 'Left-wall leg step', { from: [dl, ys - B, 0], to: [T, ys, H] }, g);
  if (db < backD) board(job, 'Back-wall leg divider', { from: [xs - B, B, B], to: [xs, db, H - B] }, g);
  if (dl < T) board(job, 'Left-wall leg divider', { from: [B, ys - B, B], to: [dl, ys, H - B] }, g);
}
// The left-wall leg's doors back to `back`, across its deep part (its
// shallow end has none)
function steppedLeftDoors(job, g, back, { ys }) {
  return ys > back ? tallDoors(job, g, back, { front: ys }) : [];
}
// The back-wall leg's doors from x0 (its deep part's front `front` out from
// the back wall) to its shallow end, which has none
function steppedBackDoors(job, g, x0, front, { xs }) {
  return xs > x0 ? backLegDoors(job, g, x0, xs, front) : [];
}

// The full-height L of option 7: legs inside LEG along the back wall (x 0 to
// T + LEG, LEG_D deep) and F - LEG_D along the left wall (y LEG_D to F), one
// space round the corner, with any shallow ends (fullHeightEnds()). Returns
// the doors' hinges: the left-wall leg's (tall) and the back-wall leg's
// (second).
function fullHeightL(job, g) {
  const { T, F, BOARD: B, LEG_D: Dl, L_SHELVES } = job.s, { H, mats } = job;   // Dl: the back-wall leg's depth
  const ends = fullHeightEnds(job.s), { E, xs, db, ys, dl } = ends;
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [E, B, H] }, g);                    // runs through the corner
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, T ? F : Dl, H] }, g);            // stops at it; with no left-wall leg, the back-wall leg's side
  board(job, 'Left-wall leg front end', { from: [B, F - B, 0], to: [dl, F, H] }, g);
  board(job, 'Back-wall leg end', { from: [E - B, B, 0], to: [E, db, H] }, g);
  stepBoards(job, g, ends, Dl);
  // Tops and bottoms, between them: each leg's deep part's up to its step,
  // its shallow end's on from there (none without one)
  const levels = [['top', H - B, H], ['bottom', 0, B]];
  for (const [part, z0, z1] of levels) {
    board(job, `Back-wall leg ${part}`, { from: [B, B, z0], to: [xs - B, Dl, z1] }, g);
    board(job, `Left-wall leg ${part}`, { from: [B, Dl, z0], to: [T, ys - B, z1] }, g);
  }
  for (const [part, z0, z1] of levels) {
    board(job, `Back-wall leg end ${part}`, { from: [xs - B, B, z0], to: [E - B, db, z1] }, g);
    board(job, `Left-wall leg end ${part}`, { from: [B, ys - B, z0], to: [dl, F - B, z1] }, g);
  }
  const inside = fullHeightInside(job.s);
  for (const poly of inside.back) for (const top of L_SHELVES.back) cupShelf(job, poly, top, mats.carcass);
  if (T) for (const poly of inside.left) for (const top of L_SHELVES.left) cupShelf(job, poly, top, mats.carcass);
  return { tall: steppedLeftDoors(job, g, Dl, ends), second: steppedBackDoors(job, g, T + B, Dl, ends) };
}
// Option 7's shallow ends: as much of the back-wall leg as it runs past the
// left-wall leg (all of it with none, bar MIN_DEEP), and all of the
// left-wall leg
const fullHeightEnds = s => shallowEnds(s, { E: s.T + s.LEG, backD: s.LEG_D, leftD: s.T,
  backRoom: s.T ? s.LEG : s.LEG - MIN_DEEP, leftRoom: s.T ? s.F - s.LEG_D : 0 });
// Option 7's inside, a board in from its panels and fronts: the back-wall
// leg's (with the corner) and the left-wall leg's, each a list of spaces:
// the leg's deep part, then its shallow end's past the divider (none
// without one). For its shelves, and the things to store (insideSpaces())
function fullHeightInside(s) {
  const { T, F, BOARD: B, LEG_D: Dl } = s, { E, xs, db, ys, dl, back, left } = fullHeightEnds(s);
  return {
    back: [rectPoly(B, B, xs - B, Dl - B), ...(back ? [rectPoly(xs, B, E - B, db - B)] : [])],
    left: [rectPoly(B, Dl - B, T - B, ys - B), ...(left ? [rectPoly(B, ys, dl - B, F - B)] : [])],
  };
}

// The doors across the front of a back-wall leg (its front `front` out from
// the back wall), from x0 to its end at E, hinged at E when there's one.
// Returns their hinges.
function backLegDoors(job, g, x0, E, front) {
  return doorRow(job, g, 'Back-wall leg door', [x0, front], [E, front]);
}

// Option 8's front, seen from above: the back-wall leg runs DIAG_RUN inside
// along the back wall (to E = T + DIAG_RUN), R deep, and the left-wall leg
// out to F, T deep. Each leg's front runs straight in from its end, DIAG_BACK
// along the back-wall leg and DIAG_LEFT along the left-wall leg (0 for none),
// then the diagonal joins them, from (T, yd) on the left-wall leg to (xd, R)
// on the back-wall leg. The straight runs are held so the diagonal keeps
// MIN_DIAGONAL along each wall.
function diagonalFront({ T, R, F, DIAG_RUN, DIAG_BACK, DIAG_LEFT }) {
  const E = T + DIAG_RUN;
  const back = Math.max(0, Math.min(DIAG_BACK, DIAG_RUN - MIN_DIAGONAL));
  const left = Math.max(0, Math.min(DIAG_LEFT, F - R - MIN_DIAGONAL));
  return { E, back, left, xd: E - back, yd: F - left };
}

// Option 8's diagonal, from (T, yd) to (xd, R): its ends, its length, its
// direction (ux, uy) from the left end, and its doors: how many (in pairs)
// and each one's width.
export function diagonal(settings) {
  const { T, R } = settings, { xd, yd } = diagonalFront(settings);
  const dx = xd - T, dy = R - yd;
  const length = Math.hypot(dx, dy);
  const doors = doorCount(length, true);
  return { from: [T, yd], to: [xd, R], length, ux: dx / length, uy: dy / length, doors, door: doorWidth(length, doors) };
}

// The gap between option 8's left door, opened to 90°, and the room's door
// opened into the room (its hinge at y door.hingeAt on the left wall, so it
// stands door.thickness thick and door.width out from the wall); below 0
// they clash. The open door points straight out from the front, so sample
// its outline there.
function roomDoorGap(settings, { door: roomDoor }) {
  const { BOARD } = settings;
  const { from, ux, uy, door } = diagonal(settings);
  const ox = -uy, oy = ux;                                      // out of the cupboard
  const x0 = from[0] + DOOR_GAP * ux + BOARD * ox, y0 = from[1] + DOOR_GAP * uy + BOARD * oy;   // the left door's hinge (doorRow())
  let nearest = Infinity;
  for (let a = 0; a <= door; a += 1) {
    for (const b of [0, BOARD]) {                                  // the door's two faces, BOARD apart
      const x = x0 + a * ox + b * ux, y = y0 + a * oy + b * uy;
      if (y >= roomDoor.hingeAt && y <= roomDoor.hingeAt + roomDoor.thickness) nearest = Math.min(nearest, x);
    }
  }
  return nearest === Infinity ? Infinity : Math.round(nearest - roomDoor.width);
}

// Option 8's carcass: rear panels and ends as option 7's, and a top and
// bottom between them that run out to its front: behind the room's side of
// the front (diagonalFront()), between the ends
function diagonalCarcass(job, g) {
  const { T, R, F, BOARD: B } = job.s, { H, mats } = job;
  const { E, xd, yd } = diagonalFront(job.s), ends = diagonalEnds(job.s), { xs, db, ys, dl } = ends;
  board(job, 'Back-wall rear panel', { from: [0, 0, 0], to: [E, B, H] }, g);                // runs through the corner
  board(job, 'Left-wall rear panel', { from: [0, B, 0], to: [B, F, H] }, g);                // stops at it
  board(job, 'Left-wall end', { from: [B, F - B, 0], to: [dl, F, H] }, g);
  board(job, 'Back-wall end', { from: [E - B, B, 0], to: [E, db, H] }, g);
  stepBoards(job, g, ends, R);
  const backEnd = ends.back ? [[E, db], [xs - B, db], [xs - B, R]] : [[E, R]];   // round the step boards
  const leftEnd = ends.left ? [[T, ys - B], [dl, ys - B], [dl, F]] : [[T, F]];
  const behindFront = [[B, B], [E, B], ...backEnd, [xd, R], [T, yd], ...leftEnd, [B, F]];
  const outline = withoutRepeats(clipPoly(clipPoly(behindFront, 0, E - B, true), 1, F - B, true));
  ofKind('Panels', part('Top', slab(outline, H - B, H, mats.carcass, g)));
  ofKind('Panels', part('Bottom', slab(outline, 0, B, mats.carcass, g)));
}
// A polygon with no point the same as the one before it (a straight front
// of 0 leaves one twice)
const withoutRepeats = poly => poly.filter((p, i) => {
  const q = poly[(i + poly.length - 1) % poly.length];
  return Math.abs(p[0] - q[0]) > 1e-9 || Math.abs(p[1] - q[1]) > 1e-9;
});

// Option 8's shallow ends: each the outer part of a leg's straight front
// (none where the diagonal runs to the leg's end)
function diagonalEnds(s) {
  const { E, back, left } = diagonalFront(s);
  return shallowEnds(s, { E, backD: s.R, leftD: s.T, backRoom: back, leftRoom: left });
}

// Option 8's inside, SHELF_SETBACK behind its front: the cupboard inside
// its ends (x up to E - B, y up to F - B) and any dividers, then the
// shallow ends' bookshelves past them. Its shelves, and the spaces for the
// things to store (insideSpaces()), have these outlines.
function diagonalInside(settings) {
  const { BOARD: B } = settings, { E, xs, db, ys, dl, back, left } = diagonalEnds(settings);
  const cupboard = clipPoly(clipPoly(diagonalCupboardInside(settings), 0, xs - B, true), 1, ys - B, true);
  return [withoutRepeats(cupboard), ...(back ? [rectPoly(xs, B, E - B, db - SHELF_SETBACK)] : []),
    ...(left ? [rectPoly(B, ys, dl - SHELF_SETBACK, settings.F - B)] : [])];
}
// ...the cupboard's, as with no shallow ends
function diagonalCupboardInside(settings) {
  const { R, F, BOARD: B } = settings;
  const { E, back, left } = diagonalFront(settings);
  const { from: [x0, y0], ux, uy } = diagonal(settings);
  const nx = uy, ny = -ux;                                   // unit normal, pointing into the cupboard
  const c = x0 * nx + y0 * ny + SHELF_SETBACK;               // the line n · p = c, SHELF_SETBACK behind the diagonal
  const yOnLine = x => (c - x * nx) / ny, xOnLine = y => (c - y * ny) / nx;
  const y1 = R - SHELF_SETBACK, x1 = settings.T - SHELF_SETBACK;   // behind the straight fronts
  const alongBack = back ? [[E - B, y1], [xOnLine(y1), y1]] : [[E - B, yOnLine(E - B)]];
  const alongLeft = left ? [[x1, yOnLine(x1)], [x1, F - B]] : [[xOnLine(F - B), F - B]];
  return [[B, B], [E - B, B], ...alongBack, ...alongLeft, [B, F - B]];
}

// Option 8's doors: pairs across the diagonal, and doors across each
// straight front, as option 7's: the left-wall leg's (tallDoors()) hinged at
// its end, and the back-wall leg's likewise. Returns the left-wall leg's
// doors' hinges (tall), and the others' (second).
function diagonalDoors(job, g) {
  const { xd, yd } = diagonalFront(job.s), { from, to } = diagonal(job.s), ends = diagonalEnds(job.s);
  const second = doorRow(job, g, 'Diagonal door', from, to, { paired: true });
  second.push(...steppedBackDoors(job, g, xd, job.s.R, ends));
  return { tall: steppedLeftDoors(job, g, yd, ends), second };
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

// Option 9's doors, in pairs across T + B to E, the front of the
// double-door cupboard. Returns their hinges.
function wardDoors(job, g) {
  const { T, BOARD: B, WARD, WARD_D: Dw } = job.s;
  return doorRow(job, g, 'Cupboard door', [T + B, Dw], [T + WARD, Dw], { paired: true });
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
  const { CORNER_D: F, BOARD: B, CORNER_W: X } = job.s, { H } = job;
  const E = X - B;
  board(job, 'Side facing the windows', { from: [E, B, 0], to: [X, F, H] }, g);
  return doorRow(job, g, 'Cupboard door', [0, F - B], [E, F - B], { paired: true });   // from the wall to the side
}

// Option 11's corner cupboard: its end facing the kitchen, its side by the
// bench, and a pair of doors on its side where it's clear of the bench
// (y R to F), facing the windows. Returns their hinges.
function cornerDoorsToWindows(job, g) {
  const { R, CORNER_D: F, BOARD: B, CORNER_W: X } = job.s, { H } = job;
  const E = X - B;
  board(job, 'End facing the kitchen', { from: [0, F - B, 0], to: [X, F, H] }, g);
  board(job, 'Side by the bench', { from: [E, B, 0], to: [X, R, H] }, g);
  return doorRow(job, g, 'Cupboard door', [E, F - B], [E, R], { paired: true });   // on the side beyond the bench, from the kitchen end to the bench end
}

// Option 10's side bookshelf: full height, open, from the corner cupboard
// (x CORNER_W - BOARD, sharing its side) to CORNER_W + SIDE_W, SIDE_D deep,
// with five shelves evenly up it and a light strip under the front of each,
// as option 9's tower. Where it's deeper than the cupboard (or there's no
// cupboard), it has a side of its own there. Its boards are part of the
// cupboard, so they're in its cutting list.
const sideShelfOn = s => s.SIDE_SHELF && s.option === 10;
const sideShelfW = s => (sideShelfOn(s) ? s.SIDE_W : 0);   // how far it takes the bench along
const SIDE_SHELVES = 5;
const sideShelfTops = ({ BOARD }, H) => [...Array(SIDE_SHELVES).keys()].map(k => Math.round(BOARD + (k + 1) * (H - 2 * BOARD) / (SIDE_SHELVES + 1)));
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
  return `Beside it, a ${SIDE_W}-wide, ${SIDE_D}-deep open bookshelf (x ${X}-${X + SIDE_W}), ${fullHeightText(s, place)}, sharing the cupboard's side, ` +
    `with ${SIDE_SHELVES} lit shelves ${SIDE_W - BOARD} long, their tops at ${sideShelfTops(s, cupboardHeight(s, place)).join(', ')}. `;
}

// ---------------------------------------------------------------------------
// Option 10's fold-down desk, on its side facing the windows
// ---------------------------------------------------------------------------

// A flap hinged along its bottom edge on the cupboard's side, where the side
// is clear of the side bookshelf (or of the bench, with none): closed, it
// stands upright against the side; open (90°), it's level, its top DESK_H
// high, DESK_D out towards the windows and DESK_W along the side, centred
// in the side's clear run. Two folding brackets on the side hold it level:
// each an arm under it, which drops down flat against the side as the desk
// closes, beside a bar fixed to the side. Its sizes are settings (agreed
// with the user, 20 Oct 2026); these are chosen:
const DESK_CLEAR = 20;             // the flap clear of each end of the side's clear run
const DESK_LEAST = 300;            // the least run along the side a desk is drawn in
const OAK_FACE = 1;                // the oak writing surface on the flap's top, drawn, not a board of its own
// The brackets' steel: its square `bar`, the fixed bar's length below the
// arm (`drop`), each bracket `in` from the flap's end, its arm `short` of the
// flap's far edge
const BRACKET = { bar: 25, drop: 300, in: 80, short: 50 };

const deskOn = s => s.DESK && s.option === 10 && !cornerTooShallow(s, 'kitchen');
// The side's run clear of what stands against it along the back wall: the
// side bookshelf, or with none the bench (R deep), from `from` out to the
// cupboard's end
const deskRun = s => ({ from: sideShelfOn(s) ? s.SIDE_D : s.R, to: s.CORNER_D });
// Where the desk is, or null when there's none (switched off, another
// option, or less than DESK_LEAST of clear side): the side's face at room
// x, its ends y0 and y1 (its width w, held to the clear run), how far it
// reaches out (d) and its top's height (h)
export function deskSpot(s) {
  if (!deskOn(s)) return null;
  const { from, to } = deskRun(s), room = to - from - 2 * DESK_CLEAR;
  if (room < DESK_LEAST) return null;
  const w = Math.min(s.DESK_W, room), middle = (from + to) / 2;
  return { x: s.CORNER_W, y0: middle - w / 2, y1: middle + w / 2, w, d: s.DESK_D, h: s.DESK_H };
}

// A flap or arm turning about a level hinge that runs along the room's y,
// at room (x, z): its boxes are given in mm from the hinge in x and z, and
// in the room's y. Built level, reaching out to +x; turnDoors() turns it by
// `dir`, 1 lifting it upright, -1 dropping it down. Marked as a door's, so
// it's not part of the cupboard's outline.
function levelHinge(x, z, dir, parent) {
  const h = new THREE.Group();
  Object.assign(h.userData, { hinge: true, dir });
  h.position.set(x * MM, z * MM, 0);
  parent.add(h);
  return h;
}
// The desk: its flap (in the cupboard's colour, with an oak top) and its
// brackets. Returns the flap's and the arms' hinges, none with no desk.
function foldDownDesk(job, g) {
  const spot = deskSpot(job.s);
  if (!spot) return [];
  const { BOARD: B } = job.s, { mats } = job, { x, y0, y1, d, h } = spot;
  const flap = levelHinge(x, h, 1, g);
  board(job, 'Desk flap', { from: [0, y0, -B - OAK_FACE], to: [d, y1, -OAK_FACE] }, flap);
  box({ from: [0, y0, -OAK_FACE], to: [d, y1, 0] }, mats.oak, flap, false);
  const fixed = new THREE.Group();                               // the brackets' fixed bars, not the cupboard's outline
  fixed.userData.hinge = true;
  g.add(fixed);
  const { bar, drop, short } = BRACKET, armTop = h - B - OAK_FACE;   // the arms meet the flap's underside
  const arms = [y0 + BRACKET.in, y1 - BRACKET.in - 2 * bar].map(y => {
    const arm = levelHinge(x, armTop - bar, -1, g);
    box({ from: [0, y, 0], to: [d - short, y + bar, bar] }, mats.handle, arm);
    box({ from: [x, y + bar, armTop - bar - drop], to: [x + bar, y + 2 * bar, armTop] }, mats.handle, fixed);   // beside the arm, which folds down against the side next to it
    return arm;
  });
  return [flap, ...arms];
}
function deskText(s) {
  if (!s.DESK || s.option !== 10 || cornerTooShallow(s, 'kitchen')) return '';
  const spot = deskSpot(s), { from, to } = deskRun(s);
  if (!spot) return `No room for the fold-down desk: the side has only ${Math.max(0, to - from)} clear (it needs ${DESK_LEAST + 2 * DESK_CLEAR}). `;
  const { x, w, d, h } = spot;
  return `On its side facing the windows, a fold-down desk ${Math.round(w)} wide${w < s.DESK_W ? ` (held to the side's clear ${to - from})` : ''} and ${d} deep, ` +
    `hinged along its bottom edge: open, it's level, its oak top ${h} high, reaching ${x + d} from the left wall, on two folding brackets; ` +
    `closed, it stands upright against the side, up to ${h + d}. `;
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
// What R (the back-wall cupboard depth) sets in each option when there's no
// bench (the bedroom's cupboard, or the living room's with the Bench switch
// off), for its slider's label: none in options 7, 10 and 16, where it's
// only the bench's depth, so the slider's hidden (asked for, 18 Oct 2026)
const REAR_WITHOUT_BENCH = {
  8: () => 'Back-wall cupboard depth',                          // its back-wall leg
  9: ({ TOWER }) => (TOWER >= 100 ? 'Shelving tower depth' : null),   // its tower, when there's one
  11: () => 'Doors start, out from the back wall',               // its side panel runs from the back wall to R
};
// The R slider's label for option `no` with settings s, null when R does
// nothing: with the bench, R is its depth too (and option 9's base
// cupboards')
export function rearLabel(no, s, withBench) {
  const own = REAR_WITHOUT_BENCH[no]?.(s) ?? null;
  if (!withBench) return own;
  return own ? 'Back-wall cupboard depth' : 'Bench depth';
}

export const OPTIONS = [
  {
    name: '7. Full-height L-shaped cupboard',
    defaultLeft: 600,                                  // chosen with no left-wall cupboard: one this deep (it can be taken away again)
    source: 'plan3/room_3d.html',
    clearFrom: ({ T, LEG }) => T + LEG,
    benchFrom: ({ T, LEG }) => T + LEG,
    backTop: ({ T, LEG, LEG_D }) => ({ x0: 0, x1: T + LEG, d: LEG_D }),   // the back-wall leg, the corner with it
    summaryNoLeft: (s, place) => {
      const { R, BOARD, LEG, LEG_D } = s, n = doorCount(LEG - BOARD);
      return `No left-wall cupboard: a ${fullHeightWord(s, place)} cupboard on the back wall (x 0-${LEG}, ${LEG_D} deep), with ${n === 1 ? 'a' : countWord(n)} ${Math.round(doorWidth(LEG - BOARD, n))} × ${cupboardHeight(s, place) - 2 * DOOR_GAP} door${n === 1 ? '' : 's'}. Bench ${place.width - LEG}, from x = ${LEG}, ${R} deep.` + shallowEndsText(fullHeightEnds(s));
    },
    summary: (s, place) => {
      const { T, R, F, BOARD, LEG, LEG_D } = s;
      return `Both legs of the L run ${fullHeightText(s, place)}, ${LEG} inside along the back wall (${LEG_D} deep) and ${F - LEG_D} along the left wall, one space round the corner. Doors ${cupboardHeight(s, place) - 2 * DOOR_GAP} high, ${BOARD} thick: ${doorWidthText(LEG - BOARD)} wide on the back-wall leg, ${doorWidthText(F - LEG_D)} wide on the left-wall leg (it covers the corner). Bench shortened to ${place.width - T - LEG}, from x = ${T + LEG}, ${R} deep.` + shallowEndsText(fullHeightEnds(s));
    },
    second: 'Back-wall leg door',
    build: fullHeightL,
  },
  {
    name: '8. Full-height corner unit, diagonal double doors',
    needsLeft: true,                                   // not available without a left-wall cupboard
    source: 'option 7 (new)',
    clearFrom: ({ T, DIAG_RUN }) => T + DIAG_RUN,
    benchFrom: ({ T, DIAG_RUN }) => T + DIAG_RUN,
    backTop: ({ T, R, DIAG_RUN }) => ({ x0: 0, x1: T + DIAG_RUN, d: R }),   // the back-wall leg, the corner with it
    summary: (s, place) => {
      const { T, R, F, BOARD } = s, { from, to, length, doors } = diagonal(s), { E, back, left } = diagonalFront(s);
      const gap = place.door ? roomDoorGap(s, place) : Infinity;
      const straight = [left && `${left} in from the left-wall leg's end (${doorsText(left)})`, back && `${back} in from the back-wall leg's end (${doorsText(back - BOARD)})`].filter(Boolean);
      const lower = cupboardHeight(s, place) < place.ceiling ? ` It stands ${fullHeightText(s, place)}.` : '';
      return (straight.length ? `As option 7, ${E} along the back wall (${R} deep) and ${F} out along the left wall (${T} deep).${lower} Its front runs straight ${straight.join(' and ')}, then`
                              : `As option 7,${lower ? ` ${cupboardHeight(s, place)} high,` : ''} but the front runs`) +
        ` straight across from where its ${doors === 2 ? 'two' : 'outer'}${straight.length ? ' diagonal' : ''} doors hinge (x ${from[0]}, y ${from[1]} to x ${to[0]}, y ${to[1]}), about ${Math.round(length)} wide, with ${doorsText(length, true)}. Behind them it is one cupboard. ` +
        (gap === Infinity ? '' : gap < 0 ? `Opened to 90°, the left door crosses the open room door's path by about ${-gap}: open one at a time. `
                 : `Opened to 90°, the left door clears the open room door by about ${gap}. `) +
        `Bench ${place.width - E}, from x = ${E}, ${R} deep.` + shallowEndsText(diagonalEnds(s));
    },
    second: 'Double doors',
    build(job, g) {
      diagonalCarcass(job, g);
      for (const poly of diagonalInside(job.s)) for (const top of SHELF_TOPS) cupShelf(job, poly, top, job.mats.shelf);
      return diagonalDoors(job, g);
    },
  },
  {
    name: '9. Double-door cupboard and shelves',
    source: 'option 7 and the photo (new)',
    clearFrom: ({ T, WARD, TOWER }) => T + WARD + TOWER,
    benchFrom: ({ T, WARD, TOWER }) => T + WARD + TOWER,
    backTop: ({ T, WARD, WARD_D }) => ({ x0: 0, x1: T + WARD, d: WARD_D }),   // the double-door cupboard and any left-wall leg, not the shallower tower
    marks: ({ T, WARD }) => [T + WARD],
    summary: (s, place, { BENCH }) => {
      const { T, R, F, BOARD, WARD, WARD_D, TOWER } = s, { width } = place;
      return `${T ? `Option 7's left-wall leg (${F - WARD_D} inside, with its door${doorCount(F - WARD_D) > 1 ? 's' : ''}), joined to a` : 'No left-wall cupboard. A'} ${fullHeightWord(s, place)} cupboard on the back wall (x ${T}-${T + WARD}, ${WARD_D} deep) with ${doorsText(WARD - BOARD, true)}` +
      (TOWER >= 100 ? `, then a ${TOWER}-wide, ${R}-deep open shelving tower (to x ${T + WARD + TOWER}), ${fullHeightText(s, place)}, with five lit shelves` : '') +
      `. Base cupboards with ${baseDoorCount(width - T - WARD - TOWER)} doors under an oak top run on to the right-hand wall: ${width - T - WARD - TOWER} long, ${BENCH} high, ${R} deep.`;
    },
    second: 'Cupboard doors',
    build(job, g) {
      const { T, WARD, WARD_D, TOWER } = job.s;
      const E = T + WARD;
      wardCarcass(job, g);
      shelvingTower(job, E, E + TOWER, g);
      const second = wardDoors(job, g);
      return { tall: tallDoors(job, g, WARD_D), second };
    },
  },

  {
    name: '10. Corner cupboard, doors facing the kitchen',
    source: 'option 10 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D }) => CORNER_D,                           // its own depth out along the left wall, in place of F
    clearFrom: s => s.CORNER_W + sideShelfW(s),                  // past the side bookshelf, when there is one
    benchFrom: s => s.CORNER_W + sideShelfW(s),
    backTop: s => (cornerTooShallow(s, 'kitchen') ? null : { x0: 0, x1: s.CORNER_W, d: s.CORNER_D }),   // the corner cupboard, not the side bookshelf
    marks: s => (sideShelfOn(s) ? [s.CORNER_W] : []),
    summary: (s, place) => {
      const { R, CORNER_D: F, BOARD, CORNER_W } = s, { door } = place;
      const S = CORNER_W + sideShelfW(s), bench = `Bench ${place.width - S}, from x = ${S}, ${R} deep.`;
      if (cornerTooShallow(s, 'kitchen')) return `${tooShallowText(s, 'kitchen')}${sideShelfText(s, place)}${bench}`;
      const span = CORNER_W - BOARD, reach = F + Math.round(doorWidth(span, doorCount(span, true)));
      return `A ${fullHeightWord(s, place)} cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
        `${F === door.frameFrom ? ', right up to the door frame' : ''}, with ${doorsText(span, true)} on its end, facing the kitchen. ` +
        (reach > door.hingeAt ? `Opened to 90°, they reach ${reach} from the back wall, past the room door's hinge at ${door.hingeAt}: they can't open fully while the room door is open. ` : '') +
        `${deskText(s)}${sideShelfText(s, place)}${bench}`;
    },
    second: 'Cupboard doors',
    build(job, g) {
      const doors = cornerCupboard(job, g, 'kitchen');
      if (sideShelfOn(job.s)) sideBookshelf(job, g);
      return { second: doors, desk: foldDownDesk(job, g) };
    },
  },
  {
    name: '11. Corner cupboard, doors facing the windows',
    source: 'option 11 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D }) => CORNER_D,                           // its own depth out along the left wall, in place of F
    clearFrom: ({ CORNER_W }) => CORNER_W,
    benchFrom: ({ CORNER_W }) => CORNER_W,
    backTop: s => (cornerTooShallow(s, 'windows') ? null : { x0: 0, x1: s.CORNER_W, d: s.CORNER_D }),
    summary: (s, place) => {
      const { R, CORNER_D: F, BOARD, CORNER_W } = s, { width, door } = place;
      return cornerTooShallow(s, 'windows') ? `${tooShallowText(s, 'windows')}Bench ${width - CORNER_W}, from x = ${CORNER_W}, ${R} deep.` : `A ${fullHeightWord(s, place)} cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
        `${F === door.frameFrom ? ', right up to the door frame' : ''}, with ${doorsText(F - R - BOARD, true)} on its side, facing the windows, ` +
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
    summary: ({ R }, { width }, { benchFrom = 0 } = {}) => `The room as it is now, with no cupboards. Bench ${width - benchFrom}, ${benchFrom ? `from x ${benchFrom} (past the pine cupboard by the door) to the right-hand wall` : 'the whole back wall'}, ${R} deep. Oak floor, Crown Gallery White walls, Pure Brilliant White door, frame and ceiling, and the kitchen, island and desk.`,
    build() {
      return {};
    },
  },
];
// Each option's number is the one in its name. The list starts at 7 (options
// 1 to 6 were taken out), so an option is held and found by its number,
// never by its place in the list: optionOf(9) is option 9, undefined if
// there's none.
for (const o of OPTIONS) o.no = parseInt(o.name, 10);
export const optionOf = no => OPTIONS.find(o => o.no === no);
// Option 16, the room as it is with no cupboards (the living room's to start)
export const CURRENT_ROOM = 16;

// A corner cupboard: the chosen option (settings.option) built into a new
// group, standing in place's back-left corner, and what's asked of it.
//   group             everything it's built of, its shelves included
//   doors             { tall, second, desk }: the hinges of the left-wall
//                     leg's doors (options 7 to 9), of the option's other
//                     doors, and of option 10's fold-down desk and its arms
//   shelves           what it recorded as it was built, for drawShelves()
//   drawShelves(things), shelfCutText(things)
//                     its shelves drawn round the things to store (each
//                     { name, h, x, y, z, w, d }), and what's cut back
//   turnDoors(angles) its doors opened to angles.tall and angles.second, in
//                     degrees, each stopping at its room's walls, and its
//                     desk to angles.desk (0 closed, 90 level)
//   cuttingList(), cuttingRows()
//   partOf(o, withDoors), dims(view, g), doorDims(view, g)
//                     what Cupboard only shows, and its dimensions in a view
//                     ({ flat, flatView })
export function makeCupboard(settings, place, materials) {
  const job = cupboardJob(settings, place, materials);
  const group = new THREE.Group();
  const { tall = [], second = [], desk = [] } = optionOf(settings.option).build(job, group);
  const shelfGroup = new THREE.Group();                          // drawn into by drawShelves()
  shelfGroup.userData.cupShelves = true;                         // so its dimensions know the shelves from an open tower's
  group.add(shelfGroup);
  let cuts = [];                                                 // what drawShelves() last cut
  const turn = degrees => THREE.MathUtils.degToRad(degrees);
  return {
    group, doors: { tall, second, desk }, shelves: job.shelves,
    drawShelves(things) { cuts = drawShelves(job.shelves, things, settings.BOARD, shelfGroup); },
    shelfCutText: things => shelfCutText(cuts, job.shelves, things, settings.BOARD),
    turnDoors(angles) {
      const open = (h, degrees) => { h.rotation.y = (h.userData.dir ?? 1) * turn(Math.min(degrees, opensTo(h, group, place))); };
      for (const h of tall) open(h, angles.tall);
      for (const h of second) open(h, angles.second);
      const lowered = Math.min(Math.max(angles.desk ?? 0, 0), 90);   // the desk's flap from upright (0) to level (90)
      for (const h of desk) h.rotation.z = h.userData.dir * turn(90 - lowered);
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
  const { T, F, BOARD: B, WARD, WARD_D, CORNER_W, CORNER_D } = settings;
  const rect = (x0, y0, x1, y1, h) => ({ poly: rectPoly(x0, y0, x1, y1), h });
  const full = cupboardHeight(settings, place) - 2 * B;                                  // inside a full-height cupboard
  const leftLeg = from => T ? [rect(B, from, T - B, F - B, full)] : [];
  const no = settings.option;
  switch (no) {
    case 7: {                                                    // the full-height L, one space round the corner
      const { back, left } = fullHeightInside(settings);
      return [...back, ...(T ? left : [])].map(poly => ({ poly, h: full }));
    }
    case 8:                                                      // the corner unit, to SHELF_SETBACK behind its diagonal front
      return diagonalInside(settings).map(poly => ({ poly, h: full }));
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
