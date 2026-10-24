// The living room's front wall (a piece of flat_model.js): the dresser,
// the larder, the sofa, the front wall's own options and the bookcase on
// it.
import * as THREE from 'three';
import { MM, box, hinge } from '../kit/floor_kit.js';
import { PLINTH } from '../corner_cupboard.js';
import { DRESSER_MODELS } from '../dressers.js';
import { LARDER_MODELS } from '../larders.js';
import { SOFA_MODELS } from '../sofas.js';
import { bookcase } from '../bookcase.js';
import { daybed, daybedFrame } from '../daybed.js';
import { floor, ROOM_WIDTH, ROOM_DEPTH, DESK_RECESS } from '../floor.js';
import { config, doors, drawn } from './state.js';
import { KITCHEN, islandOnWall, islandSize, islandSpot } from './kitchen.js';
import { TOP_T, shelves } from './bench_wall.js';
import { dresserDoorMat, dresserMat, handleMat, shelfMat, sofaMat } from './materials.js';

// The dresser on the front wall between the sink and the desk, a bit like
// the Cotswold Company's Chester dresser: 1320 wide overall (the top
// overhangs its body by 20 each side), centred in the 1415
// between the end of the kitchen counter (75 past the alcove) and the desk
// recess, 2100 high. Up to 900 it's 400
// deep: two drawers over two doors, under a wooden top. Above, it's 290 deep,
// with three open shelves and a top that overhangs a little. These are the
// starting sizes; its sliders change them. Painted parts
// are in the dresser colour (the cupboards' unless chosen), the top and
// shelves in the shelf colour.
// Drawn in every option but the current room.
// The dresser's sizes can be changed from its sliders: [key, slider id, lowest,
// highest, step]. It stays centred on the wall, and its upper part is never
// deeper than its base.
const DRESSER_SLIDERS = [['w', 'dresserW', 900, 1415, 5], ['h', 'dresserH', 1500, 2400, 10],
  ['baseD', 'dresserBaseD', 300, 600, 10], ['baseH', 'dresserBaseH', 700, 1000, 10], ['upperD', 'dresserUpperD', 150, 600, 10]];
// Start with the dresser chosen in dressers.js (a link keeps its own)
const DRESSERS = DRESSER_MODELS.list;
for (const [k] of DRESSER_SLIDERS) config.pieces.dresser.design[k] = DRESSERS[DRESSER_MODELS.start]?.[k] ?? config.pieces.dresser.design[k];
// Where it stands along the front wall, worked out from its width: centred
// between the counter's end and the desk recess, x0 to x1
// Its drawers' fronts' height (estimated, as drawn from the start)
const DRESSER_DRAWER_H = 160;
export function dresserSpan() {
  const from = KITCHEN.frontRunTo + KITCHEN.counterPast, gap = DESK_RECESS.x0 - from;   // 1415 clear
  const x0 = Math.round(from + (gap - config.pieces.dresser.design.w) / 2);
  return { x0, x1: x0 + config.pieces.dresser.design.w };
}
function dresser(g) {
  // Its width is overall, with the top's 20 overhang each side, so the body is 40 narrower
  const span = dresserSpan();
  const drawer = DRESSER_DRAWER_H, { h, baseD, baseH, upperD } = config.pieces.dresser.design, x0 = span.x0 + 20, x1 = span.x1 - 20, w = config.pieces.dresser.design.w - 40;
  const yb = ROOM_DEPTH - baseD, yu = ROOM_DEPTH - upperD;                         // the fronts of the base and the upper part
  const doorTop = baseH - TOP_T - drawer - 3;                    // the doors stop under the drawers
  box({ from: [x0, yb + 18, 0], to: [x1, ROOM_DEPTH, baseH - TOP_T] }, dresserMat, g);      // base, behind its fronts
  box({ from: [x0 - 15, yb - 15, baseH - TOP_T], to: [x1 + 15, ROOM_DEPTH, baseH] }, shelfMat, g);   // wooden top, 15 proud
  const half = (w - 9) / 2;                                      // two drawers and two doors, 3 apart
  for (const k of [0, 1]) {
    const f0 = x0 + 3 + k * (half + 3), f1 = f0 + half, mid = (f0 + f1) / 2;
    box({ from: [f0, yb, doorTop + 3], to: [f1, yb + 18, baseH - TOP_T - 3] }, dresserDoorMat, g);   // drawer front
    box({ from: [mid - 50, yb - 20, doorTop + drawer / 2 - 8], to: [mid + 50, yb, doorTop + drawer / 2 + 8] }, handleMat, g, false);
    box({ from: [f0, yb, PLINTH], to: [f1, yb + 18, doorTop] }, dresserDoorMat, g);       // door, over a plinth
    const hx = k === 0 ? f1 - 50 : f0 + 30;                      // knobs by the edges that meet
    box({ from: [hx, yb - 20, doorTop - 160], to: [hx + 20, yb, doorTop - 140] }, handleMat, g, false);
  }
  box({ from: [x0 + 30, yb + 40, 0], to: [x1 - 30, yb + 58, PLINTH] }, dresserMat, g);   // plinth, set back
  box({ from: [x0, yu, baseH], to: [x0 + 18, ROOM_DEPTH, h - 40] }, dresserMat, g);         // upper sides
  box({ from: [x1 - 18, yu, baseH], to: [x1, ROOM_DEPTH, h - 40] }, dresserMat, g);
  box({ from: [x0 + 18, ROOM_DEPTH - 12, baseH], to: [x1 - 18, ROOM_DEPTH, h - 40] }, dresserMat, g);   // back
  box({ from: [x0 - 20, yu - 20, h - 40], to: [x1 + 20, ROOM_DEPTH, h] }, dresserMat, g);   // top, 20 proud
  const shelfTops = [1, 2, 3].map(k => Math.round(baseH + k * (h - 40 - baseH) / 4));   // evenly up the upper part
  for (const top of shelfTops) box({ from: [x0 + 18, yu, top - 22], to: [x1 - 18, ROOM_DEPTH - 12, top] }, shelfMat, g);
  return ` A dresser on the front wall between the sink and the desk (x ${span.x0}-${span.x1}): ${config.pieces.dresser.design.w} wide overall (its body ${w}), ${h} high, ${baseD} deep up to ${baseH} ` +
    `(two drawers over two doors, under a wooden top), then ${upperD} deep with three open shelves.`;
}

// ---------------------------------------------------------------------------
// Larders, from larders.js. Drawn as the dresser is, with its back on
// the front wall from x0, facing into the room. Its parts stack from the
// floor up. Returns a description.
const LARDERS = LARDER_MODELS.list;
config.pieces.larder.design.model = Object.hasOwn(LARDERS, LARDER_MODELS.start ?? '') ? LARDER_MODELS.start : Object.keys(LARDERS)[0] ?? '';
// The larder's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a larder sets them to its own.
const partHeight = p => p.legs ?? p.plinth ?? p.top ?? p.cornice ?? p.h ?? 0;
const larderHeight = L => L.parts.reduce((t, p) => t + partHeight(p), 0);
const larderDepth = L => Math.max(L.d, ...L.parts.map(p => p.d ?? 0));
const LARDER_SLIDERS = [['w', 'larderW', 400, 1500, 10], ['h', 'larderH', 1500, 2400, 10], ['d', 'larderD', 300, 700, 10]];
const larderOwnSize = L => ({ w: L.w, h: larderHeight(L), d: L.d });
if (LARDERS[config.pieces.larder.design.model]) Object.assign(config.pieces.larder.design, larderOwnSize(LARDERS[config.pieces.larder.design.model]));
// The larder chosen, at the sliders' sizes: a change of height goes on (or
// comes off) its tallest doors, and parts set back from its front (a
// shallower top section) stay set back as much
function currentLarder() {
  const L = LARDERS[config.pieces.larder.design.model];
  if (!L) return null;
  const { w, h, d } = config.pieces.larder.design;
  const parts = L.parts.map(p => (p.d ? { ...p, d: p.d + d - L.d } : p));
  let tallest = -1;
  parts.forEach((p, k) => { if (p.doors && (tallest < 0 || p.h > parts[tallest].h)) tallest = k; });
  if (tallest >= 0) parts[tallest] = { ...parts[tallest], h: Math.max(200, parts[tallest].h + h - larderHeight(L)) };
  const own = larderOwnSize(L);
  const resized = own.w !== w || own.h !== h || own.d !== d;
  return { ...L, label: resized ? `${L.label}, resized` : L.label, w, d, parts };
}
function larder(g, L, x0) {
  const x1 = x0 + L.w;
  let z = 0;
  for (const p of L.parts) {
    const h = partHeight(p), d = p.d ?? L.d, yf = ROOM_DEPTH - d, z1 = z + h;   // yf: its front
    if (p.legs) {
      for (const x of [x0 + 20, x1 - 70]) for (const y of [yf + 20, ROOM_DEPTH - 70]) box({ from: [x, y, z], to: [x + 50, y + 50, z1] }, dresserMat, g);
    } else if (p.plinth) {
      box({ from: [x0 + 20, yf + 20, z], to: [x1 - 20, ROOM_DEPTH, z1] }, dresserMat, g);  // set back
    } else if (p.top) {
      box({ from: [x0 - 15, yf - 15, z], to: [x1 + 15, ROOM_DEPTH, z1] }, shelfMat, g);     // wooden, 15 proud
    } else if (p.cornice) {
      box({ from: [x0 - 20, yf - 20, z], to: [x1 + 20, ROOM_DEPTH, z1] }, dresserMat, g);   // 20 proud
    } else if (p.drawers) {
      const [rows, cols] = Array.isArray(p.drawers) ? p.drawers : [1, p.drawers];
      box({ from: [x0, yf + 18, z], to: [x1, ROOM_DEPTH, z1] }, dresserMat, g);             // behind the fronts
      const fw = (L.w - 3 * (cols + 1)) / cols, fh = (h - 3 * (rows + 1)) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const f0 = x0 + 3 + c * (fw + 3), b0 = z + 3 + r * (fh + 3), mx = f0 + fw / 2, mz = b0 + fh / 2;
        box({ from: [f0, yf, b0], to: [f0 + fw, yf + 18, b0 + fh] }, dresserDoorMat, g);
        box({ from: [mx - 15, yf - 20, mz - 15], to: [mx + 15, yf, mz + 15] }, handleMat, g, false);   // knob
      }
    } else if (p.doors) {
      // A hollow cupboard (sides, back, bottom, top and shelves), so it
      // shows inside with its doors open
      box({ from: [x0, yf + 18, z], to: [x0 + 18, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x1 - 18, yf + 18, z], to: [x1, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x0 + 18, ROOM_DEPTH - 12, z], to: [x1 - 18, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x0 + 18, yf + 18, z], to: [x1 - 18, ROOM_DEPTH - 12, z + 18] }, dresserMat, g);
      box({ from: [x0 + 18, yf + 18, z1 - 18], to: [x1 - 18, ROOM_DEPTH - 12, z1] }, dresserMat, g);
      const shelves = p.shelves ?? 0;
      for (let k = 1; k <= shelves; k++) {
        const top = Math.round(z + k * h / (shelves + 1)) + 11;
        box({ from: [x0 + 18, yf + 40, top - 22], to: [x1 - 18, ROOM_DEPTH - 12, top] }, shelfMat, g);
      }
      // Facing it, your right is the lower x: a pair is hinged at the outer
      // edges, a single door on the side its hinge says
      const n = p.doors === 2 ? 2 : 1, dw = (L.w - 3 * (n + 1)) / n;
      for (let k = 0; k < n; k++) {
        const low = n === 2 ? k === 0 : p.hinge !== 'left';
        const leaf = hinge(low ? x0 + 3 : x1 - 3, yf, g);
        if (!low) leaf.userData.dir = -1;
        box({ from: [low ? 0 : -dw, 0, z + 3], to: [low ? dw : 0, 18, z1 - 3] }, dresserDoorMat, leaf);
        const kx = low ? dw - 50 : 30 - dw, kz = n === 2 || h < 1000 ? (z + z1) / 2 : z + 150;   // knob by the free edge
        box({ from: [kx, -20, kz - 10], to: [kx + 20, 0, kz + 10] }, handleMat, leaf, false);
      }
    }
    z = z1;
  }
  return `${L.label}: ${L.w} wide, ${larderHeight(L)} high, ${larderDepth(L)} deep`;
}
// The dresser or a larder, in a group of its own, to look at
function placePiece(g) {
  const sub = new THREE.Group();
  g.add(sub);
  return sub;
}
// On the front wall between the sink and the desk: the dresser, a larder,
// a bookcase like the bedroom's or nothing, in every option but the current room.
// The configuration names them as here.
const FRONT_PIECES = ['dresser', 'larder', 'none', 'bookshelf'];
const pieces = { dresser: null, larder: null, sofa: null, ivar: null, chesham: null, cornwall: null, castorDesk: null, diningTable: null, speakers: null, workChair: null };


const frontFrom = () => KITCHEN.frontRunTo + KITCHEN.counterPast;
const frontGap = () => DESK_RECESS.x0 - frontFrom();             // 1415
const frontX0 = w => Math.round(frontFrom() + (frontGap() - w) / 2);   // a piece w wide, centred there
const larderFrontX0 = L => frontX0(L.w);
const widerThanFrontGap = w => (w > frontGap() ? ` It's ${w - frontGap()} wider than the ${frontGap()} of wall there.` : '');
// A sofa from sofas.js, in any option: facing the TV, centred on it,
// its front config.pieces.sofa.in.livingRoom.front from the TV wall. Returns a description.
const SOFAS = SOFA_MODELS.list;
export const NO_SOFA = 'none';   // the sofa's model with no sofa
config.pieces.sofa.design.model = Object.hasOwn(SOFAS, SOFA_MODELS.start ?? '') ? SOFA_MODELS.start : NO_SOFA;
config.pieces.sofa.in.livingRoom.front = SOFA_MODELS.front ?? 1900;
// The sofa's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a sofa sets them to its own.
// Height from 600, for the Drift's 670 (asked for, 18 Oct 2026)
const SOFA_SLIDERS = [['w', 'sofaW', 1200, 2600, 10], ['d', 'sofaD', 700, 1200, 10], ['h', 'sofaH', 600, 1100, 10]];
const sofaOwnSize = S => ({ w: S.w, d: S.d, h: S.h });
if (SOFAS[config.pieces.sofa.design.model]) Object.assign(config.pieces.sofa.design, sofaOwnSize(SOFAS[config.pieces.sofa.design.model]));
// The sofa chosen, at the sliders' sizes: the seat keeps its depth (the back
// gets thinner) unless that leaves less than 150 for the back, and the arms
// stay as they are, under the top of the back. A daybed's width is the
// floor it covers, wider as a bed (config.pieces.sofa.design.asBed); `sofaW` is its
// slider's, as a sofa
function currentSofa() {
  const S = SOFAS[config.pieces.sofa.design.model];
  if (!S) return null;
  const { w, d, h } = config.pieces.sofa.design, own = sofaOwnSize(S);
  const resized = own.w !== w || own.d !== d || own.h !== h;
  const label = resized ? `${S.label}, resized` : S.label;
  if (S.daybed) {
    // Worked out from the catalogue's own sizes (S), before w becomes the
    // floor it covers: wider as a bed
    const asBed = config.pieces.sofa.design.asBed, frame = daybedFrame(S, w, asBed);
    return { ...S, label: asBed ? `${label}, as a bed` : label, w: frame.width, sofaW: w, frame, d, h, asBed,
      seatD: Math.min(S.seatD, d - 150) };
  }
  return { ...S, label, w, d, h, seatD: Math.min(S.seatD, d - 150), armH: Math.min(S.armH, h - 50) };
}
// Where the sofa stands: the middle of the floor it covers, room x and y,
// and how far it's turned, in quarter turns as the bookshelf (360 is 0
// again). It starts centred on the TV, facing it, its front
// config.pieces.sofa.in.livingRoom.front from the TV wall; its sliders move it from there.
const SOFA_FACING = { 0: 'the TV wall', 90: 'the right-hand wall', 180: 'the front wall', 270: 'the left wall' };
function sofaHome(S) {
  return { x: (drawn.tvAt ?? [ROOM_WIDTH / 2])[0], y: config.pieces.sofa.in.livingRoom.front + S.d / 2, turn: 0 };
}
// Where it is now, and the floor it covers (x0 to x1, y0 to y1), square to
// the walls, as it's turned
function sofaSpot() {
  const S = currentSofa(), { x, y, turn } = config.pieces.sofa.in.livingRoom.move ?? sofaHome(S);
  const sideways = turn % 180 !== 0;
  const across = sideways ? S.d : S.w, along = sideways ? S.w : S.d;
  const x0 = Math.round(x - across / 2), y0 = Math.round(y - along / 2);
  return { S, x, y, turn, x0, x1: x0 + across, y0, y1: y0 + along };
}
// Drawn in a group of its own, its middle at the group's origin and its
// front to -y (facing the TV wall), then moved and turned into place
function sofa(g) {
  if (!SOFAS[config.pieces.sofa.design.model]) return '';
  const spot = sofaSpot(), { S } = spot, sub = new THREE.Group(), cushion = 150;
  const x0 = -S.w / 2, x1 = S.w / 2, y0 = -S.d / 2, y1 = S.d / 2;
  sub.position.set(spot.x * MM, 0, spot.y * MM);
  sub.rotation.y = THREE.MathUtils.degToRad(-spot.turn);
  g.add(sub);
  pieces.sofa = sub;
  sofaMat.color.set(S.colour ?? '#9DA3A6');
  if (S.daybed) {
    sub.add(daybed(S, sofaMat));
    return sofaText(spot);
  }
  for (const x of [x0 + 40, x1 - 90]) for (const y of [y0 + 40, y1 - 90]) box({ from: [x, y, 0], to: [x + 50, y + 50, S.legH] }, shelfMat, sub);   // wooden legs
  box({ from: [x0 + S.armW, y0 + 20, S.legH], to: [x1 - S.armW, y1, S.seatH - cushion] }, sofaMat, sub);   // the frame under the seat
  const inner = x1 - x0 - 2 * S.armW, half = (inner - 10) / 2;                            // two seat cushions
  for (const k of [0, 1]) box({ from: [x0 + S.armW + k * (half + 10), y0, S.seatH - cushion], to: [x0 + S.armW + k * (half + 10) + half, y0 + S.seatD, S.seatH] }, sofaMat, sub);
  box({ from: [x0, y0, S.legH], to: [x0 + S.armW, y1, S.armH] }, sofaMat, sub);    // arms
  box({ from: [x1 - S.armW, y0, S.legH], to: [x1, y1, S.armH] }, sofaMat, sub);
  box({ from: [x0 + S.armW, y0 + S.seatD, S.seatH - cushion], to: [x1 - S.armW, y1, S.h] }, sofaMat, sub);   // the back
  return sofaText(spot);
}
// The sofa's sentence for the summary, from its spot (sofaSpot)
function sofaText(spot) {
  const { S, x, y, turn, x0, x1, y0, y1 } = spot;
  const sizes = `the ${S.label}: ${S.w} wide, ${S.d} deep, ${S.h} high, its seat at ${S.seatH}.`;
  const floor = `(x ${x0}-${x1}, y ${y0}-${y1})`;
  if (!config.pieces.sofa.in.livingRoom.move) return ` A sofa facing the TV, ${sizes} Its front is ${y0} from the TV wall ${floor}.${sofaByIsland(spot)}`;
  return ` A sofa, ${sizes} Moved: its middle at x ${Math.round(x)}, y ${Math.round(y)}, facing ${SOFA_FACING[turn]} ${floor}.${sofaByIsland(spot)}`;
}
// Whether the sofa's floor runs into the island's, or how far behind it the
// island starts (where the sofa's square to the TV, its back to the island)
function sofaByIsland({ turn, x0, x1, y0, y1 }) {
  if (config.pieces.island.in.livingRoom.at === 'none') return '';
  const { x0: ix0, x1: ix1, y0: iy0, y1: iy1 } = islandSpot();
  const level = x0 < ix1 && x1 > ix0;
  if (level && y1 > iy0 && y0 < iy1) return ' It runs into the island.';
  return level && iy0 >= y1 && turn === 0 ? ` Behind it, ${iy0 - y1} to the island.` : '';
}
function frontWall(g) {
  if (islandOnWall()) {
    const { x0, x1, y0 } = islandSpot();
    return ` The kitchen island against the front wall between the sink and the desk, its ${config.pieces.island.in.livingRoom.at === 'out' ? 'long' : 'short'} side out (x ${x0}-${x1}), coming ${ROOM_DEPTH - y0} out from the wall to y ${y0}.`;
  }
  if (config.livingRoom.frontWall === 'dresser') return dresser(pieces.dresser = placePiece(g));
  if (config.livingRoom.frontWall === 'bookshelf') return bookcaseOnFrontWall(g);
  const L = currentLarder();
  if (config.livingRoom.frontWall !== 'larder' || !L) return '';
  const x0 = larderFrontX0(L);
  const text = larder(pieces.larder = placePiece(g), L, x0);
  return ` A larder on the front wall between the sink and the desk (x ${x0}-${x0 + L.w}): the ${text}.` + widerThanFrontGap(L.w);
}
// A bookcase like the bedroom's on the front wall between the sink and the
// desk, at its bedroom sizes: its back to the wall, centred there. Each
// place has its own, so it's drawn whether or not there's one on the back
// wall or in the bedroom.
function bookcaseOnFrontWall(g) {
  const { w, d, h } = config.pieces.bookcase.design, x0 = frontX0(w);
  const piece = bookcase({ w, d, h });                           // drawn with its back's middle at its origin, facing out
  piece.position.set((x0 + w / 2) * MM, 0, ROOM_DEPTH * MM);
  piece.rotation.y = Math.PI;                                    // facing into the room
  g.add(piece);
  return ` A bookcase like the bedroom's on the front wall between the sink and the desk (x ${x0}-${x0 + w}): ${w} wide, ${d} deep, ${h} high.` + widerThanFrontGap(w);
}
// The front-wall piece's span and heights, for the 2D dimensions
function frontSpan() {
  if (islandOnWall()) {
    const { x0, x1 } = islandSpot();
    return { x0, x1, heights: [0, islandSize().top] };
  }
  if (config.livingRoom.frontWall === 'dresser') return { ...dresserSpan(), heights: [0, config.pieces.dresser.design.baseH, config.pieces.dresser.design.h] };
  if (config.livingRoom.frontWall === 'bookshelf') {
    const { w, h } = config.pieces.bookcase.design;
    return { x0: frontX0(w), x1: frontX0(w) + w, heights: [0, h] };
  }
  const L = currentLarder();
  if (config.livingRoom.frontWall !== 'larder' || !L) return null;
  return { x0: larderFrontX0(L), x1: larderFrontX0(L) + L.w, heights: [0, larderHeight(L)] };
}

// What the other pieces of the model use
export {
  DRESSERS, DRESSER_SLIDERS, FRONT_PIECES, LARDERS, LARDER_SLIDERS, SOFAS, SOFA_SLIDERS, currentSofa, frontFrom, 
  frontGap, frontSpan, frontWall, larderHeight, larderOwnSize, pieces, sofa, sofaHome, sofaOwnSize
};
