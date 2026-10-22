// The things to store (a piece of flat_model.js): what they are, where
// they're packed (in the cupboard, by the window or by hand) and their
// labels.
import * as THREE from 'three';
import * as Cupboard from '../corner_cupboard.js';
import { MM, box, makeCanvas, dimLabel } from '../kit/floor_kit.js';
import { spanOf } from '../corner_cupboard.js';
import { floor, CEILING_HEIGHT } from '../floor.js';
import { config, cupboardSettings, flat, flatView, world } from './state.js';
import { LIVING_ROOM_PLACE, cupboard } from './cupboards.js';
import { shelves } from './bench_wall.js';
import { P } from './dimensions.js';

// The things to store, for the shelves to be cut round: each { name, h, x,
// y, z, w, d }, in STORED's order, none while they're not shown
const storedThings = () => (!config.thingsToStore.shown ? [] : STORED.map((s, k) => {
  const { x, y, z } = storedSpots()[k], [w, d] = storedSize(k);
  return { name: s.name, h: s.h, x, y, z, w, d };
}));

// ---------------------------------------------------------------------------
// Things to store, eventually in the corner cupboard: bulky things standing
// on the floor, as plain blocks (the tub as a cylinder). Each footprint is w
// along x by d along y; turned swaps them. They're packed in one of PACKINGS,
// either loose on the floor right of the island, opposite the middle window,
// or pushed into the current option's corner cupboard, where anything that
// doesn't fit turns red. In the plan view each can be dragged, and
// double-clicked or double-tapped to turn it round; the outline round them
// all is the floor area they need. Where they are is saved in the address
// after "~".
// ---------------------------------------------------------------------------
const STORED = [
  { name: 'Rack 1', label: 'Rack 1', w: 740, d: 100, h: 630, colour: 0x7b5ea7 },   // a drying rack, 740 long, 630 wide and 100 thick, stood on its edge; purple, to stand out from the cupboard
  { name: 'Folding ladder', label: 'Ladder', w: 380, d: 220, h: 1200, colour: 0xaab0b6 },
  { name: 'Long ladder', label: 'Long ladder', w: 520, d: 100, h: 1620, colour: 0x8a9199 },
  { name: 'Mop', label: 'Mop', w: 380, d: 310, h: 290, colour: 0x4f86b8 },
  { name: 'Dustpan and hoover', label: 'Hoover', w: 320, d: 280, h: 1000, colour: 0xb8473a },
  { name: 'Yellow tub', label: 'Tub', w: 550, d: 550, h: 450, colour: 0xf2c230, round: true },   // 550 across
  // Last, as it was added last (the two racks were one block, first)
  { name: 'Rack 2', label: 'Rack 2', w: 740, d: 100, h: 630, colour: 0x9b7fd0 },   // the other drying rack, the same size, a lighter purple
];
// The tightest packings, found by trying every order and turn: [x, y, turned]
// for each thing in STORED's order, from the packing's back left corner.
// They were found with the two racks as one 800 × 300 block, and the racks
// and mop at their old sizes (800 × 100 × 700, 400 × 320 × 1200); the racks
// now stand 150 apart within it. Smaller since, they still fit as placed.
const PACKINGS = [
  { name: '850 × 1090, the tightest', at: [[550, 280, 1], [100, 0, 0], [0, 0, 1], [100, 220, 0], [500, 0, 0], [0, 540, 0], [700, 280, 1]] },
  { name: '860 × 1080', at: [[550, 280, 1], [0, 0, 1], [0, 400, 0], [220, 0, 1], [540, 0, 0], [0, 500, 0], [700, 280, 1]] },
  { name: '700 × 1370, no side over 700', at: [[0, 0, 1], [300, 0, 0], [0, 800, 1], [300, 220, 0], [300, 540, 0], [100, 820, 0], [150, 0, 1]] },
  { name: '580 × 1770, no side over 600', at: [[0, 0, 1], [300, 0, 1], [0, 800, 0], [0, 900, 0], [300, 380, 1], [0, 1220, 0], [150, 0, 1]] },
];
const sizeOf = (k, turned) => turned ? [STORED[k].d, STORED[k].w] : [STORED[k].w, STORED[k].d];
config.thingsToStore.spots = STORED.map(() => ({ x: 0, y: 0, turned: false, z: 0 }));   // z: how high it stands, as on a shelf
// Where they are (config.thingsToStore.where): by the middle window, in the
// corner cupboard, or moved by hand
const STORED_WHERE = ['window', 'cupboard', 'byHand'];
const BY_HAND = 'byHand', IN_THE_CUPBOARD = 'cupboard';
// Where they are now (the user's photo, 18 Oct 2026; estimated from it), in
// STORED's order, each its back left corner: where Cornwall stands
// (LOUNGE_NOW), the ladders against the left wall at its door end, the
// hoover at its front, the mop's bucket and a rack by Chesham, the other
// rack (not in the photo) behind that one; the tub in front, clear of the
// sofa and the door. All on the floor, as the tables are hidden to start
// (asked for, 19 Oct 2026); on Cornwall they'd be LEGS_OFF_H up.
const ON_THE_FLOOR = 0;
const STORED_NOW = [
  { x: 330, y: 380, turned: true, z: ON_THE_FLOOR },             // Rack 1
  { x: 100, y: 700, turned: true, z: ON_THE_FLOOR },             // the folding ladder
  { x: 0, y: 650, turned: true, z: ON_THE_FLOOR },               // the long ladder
  { x: 450, y: 450, turned: true, z: ON_THE_FLOOR },             // the mop's bucket
  { x: 440, y: 880, turned: false, z: ON_THE_FLOOR },            // the hoover
  { x: 820, y: 1380, turned: false, z: ON_THE_FLOOR },           // the tub
  { x: 30, y: 30, turned: false, z: ON_THE_FLOOR },              // Rack 2
];
Object.assign(config.thingsToStore, { shown: true, where: BY_HAND, spots: structuredClone(STORED_NOW) });   // shown, as they are now
const storedGroup = new THREE.Group();
world.add(storedGroup);
const storedMats = STORED.map(s => new THREE.MeshStandardMaterial({ color: s.colour, roughness: 0.7 }));
const storedLineMat = new THREE.LineBasicMaterial({ color: 0x1f4e79, depthTest: false });
const storedSize = k => sizeOf(k, storedSpots()[k].turned);

// A thing's short name printed flat on its top face, along its longer side,
// reading the right way up when facing the back wall
function faceLabel(text, x, y, w, d, z, g) {
  const along = Math.max(w, d), across = Math.min(w, d);
  const canvas = makeCanvas();
  canvas.width = 512;
  canvas.height = Math.max(48, Math.round(512 * across / along));
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 100px Helvetica, Arial, sans-serif';
  const size = Math.min(canvas.height * 0.6, 100 * canvas.width * 0.9 / ctx.measureText(text).width);
  ctx.font = `bold ${size}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#1b2a38';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(along * MM, across * MM), new THREE.MeshBasicMaterial({ map, transparent: true }));
  m.rotation.x = -Math.PI / 2;                                   // face up, text's top towards the back wall
  if (d > w) m.rotation.z = Math.PI / 2;                         // along y when that's the longer side
  m.position.copy(P(x + w / 2, y + d / 2, z + 2));
  g.add(m);
}
// The inside of the current option's corner cupboard, as floor shapes with
// the clear height above each, in mm (corner_cupboard.js's insideSpaces())
const cupboardSpaces = () => Cupboard.insideSpaces(cupboardSettings(), LIVING_ROOM_PLACE);
// The inside as words, for the description: each space's width along the
// back wall × depth out from it, and the clear height
function insideText() {
  const spaces = cupboardSpaces();
  if (!spaces.length) return '';
  const sizes = spaces.map(({ poly }) => {
    const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
    return `${Math.round(x1 - x0)} × ${Math.round(y1 - y0)}${poly.length > 4 ? ' at most' : ''}`;
  });
  return ` Inside, within its ${config.pieces.cornerCupboard.design.BOARD} boards (rear panels against the walls included): ${sizes.join(spaces.length > 1 ? ' along the back wall and ' : '')}` +
    `${spaces.length > 1 ? ' along the left wall' : ''}, ${spaces[0].h} high.`;
}
function inPoly([px, py], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// Whether thing k at spot {x, y, turned} is inside the cupboard: 'fits',
// 'out' (not in it at all), 'tall' (in it, but too tall there) or 'sticks'
// (partly outside it). Points across its footprint are tested.
function fitOf(k, { x, y, turned, z = 0 }, spaces) {
  const [w, d] = sizeOf(k, turned), { round } = STORED[k], h = STORED[k].h + z;   // up to its top, from the floor
  const steps = n => Array.from({ length: Math.ceil((n - 2) / 20) + 1 }, (_, i) => Math.min(1 + i * 20, n - 1));
  let any = 0, roomy = 0, all = 0;
  for (const dx of steps(w)) for (const dy of steps(d)) {
    if (round && Math.hypot(dx - w / 2, dy - d / 2) > w / 2 - 1) continue;
    const point = [x + dx, y + dy], inside = spaces.filter(sp => inPoly(point, sp.poly));
    all++;
    if (inside.length) any++;
    if (inside.some(sp => sp.h >= h)) roomy++;
  }
  return roomy === all ? 'fits' : !any ? 'out' : any === all ? 'tall' : 'sticks';
}
// Where the things stand: config.thingsToStore.spots, the settings, once they're
// moved by hand (where is BY_HAND); else worked out, by the window or in
// the cupboard as their packing has them (placeStored()), and never kept
// in the settings (REFACTOR_PLAN.md item 13)
let packedSpots = STORED.map(() => ({ x: 0, y: 0, turned: false, z: 0 }));
export const storedSpots = () => (config.thingsToStore.where === BY_HAND ? config.thingsToStore.spots : packedSpots);
// Put the things where config.thingsToStore.where says, in its packing
export function placeStored() {
  const { packing, where } = config.thingsToStore;
  if (where === BY_HAND) return;                                 // moved by hand: where they were put
  const pack = PACKINGS[packing].at;
  // flip: the packing turned to run the other way (its x and y swapped).
  // A packing stands on the floor (z 0), wherever they were before
  const lay = (ox, oy, flip) => pack.map(([x, y, t]) => ({ ...(flip ? { x: ox + y, y: oy + x, turned: !t } : { x: ox + x, y: oy + y, turned: Boolean(t) }), z: 0 }));
  const depth = Math.max(...pack.map(([, y, t], k) => y + sizeOf(k, t)[1]));
  let spots = lay(2000, Math.round((2907 - depth / 2) / 10) * 10, false);   // centred on the middle window
  const spaces = cupboardSpaces();
  if (where === IN_THE_CUPBOARD && spaces.length) {
    // Into a corner of the cupboard, whichever corner and way round fits most
    let best = -1;
    // (a board out from the walls, inside the rear panels)
    const corners = spaces.map(sp => [Math.min(...sp.poly.map(p => p[0])), Math.min(...sp.poly.map(p => p[1]))]);
    for (const [cx, cy] of corners) for (const flip of [false, true]) {
      const tryThis = lay(Math.round(cx), Math.round(cy), flip);
      const fit = tryThis.filter((spot, k) => fitOf(k, spot, spaces) === 'fits').length;
      if (fit > best) [best, spots] = [fit, tryThis];
    }
  }
  packedSpots = spots;
}

// In the plan: the cupboard's inside (a rectangle, or an L of two), outlined
// green when everything in it fits and red when something doesn't, and
// over each thing that sticks out, the part outside it shaded red, with how
// far it sticks out past the inside's edges
const planFitMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f, transparent: true, opacity: 0.55, depthTest: false, side: THREE.DoubleSide });
const planFitLine = { good: new THREE.LineBasicMaterial({ color: 0x2e7d32, depthTest: false }), bad: new THREE.LineBasicMaterial({ color: 0xb3261e, depthTest: false }) };
function planFit(spaces, fits) {
  const bad = fits.some(f => f === 'tall' || f === 'sticks');
  const lineMat = planFitLine[bad ? 'bad' : 'good'];
  for (const { poly } of spaces) {
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(poly.map(([x, y]) => P(x, y, CEILING_HEIGHT + 50))), lineMat);
    line.renderOrder = 8;
    storedGroup.add(line);
  }
  const [ix0, ix1] = spanOf(spaces.flatMap(s => s.poly), 0), [iy0, iy1] = spanOf(spaces.flatMap(s => s.poly), 1);
  dimLabel(`Cupboard inside ${Math.round(ix1 - ix0)} × ${Math.round(iy1 - iy0)}${spaces.length > 1 ? ' (an L)' : ''}`,
    P((ix0 + ix1) / 2, iy0 - 60, CEILING_HEIGHT + 100), storedGroup, bad ? '#b3261e' : '#2e7d32', 0.07);
  // The part of each thing outside, as 20 squares merged into one mesh
  const cells = [];
  STORED.forEach((s, k) => {
    if (fits[k] !== 'sticks') return;
    const { x, y } = storedSpots()[k], [w, d] = storedSize(k);
    let ox0 = Infinity, oy0 = Infinity, ox1 = -Infinity, oy1 = -Infinity;
    for (let cx = x; cx < x + w; cx += 20) for (let cy = y; cy < y + d; cy += 20) {
      const c = [cx + 10, cy + 10];
      if (s.round && Math.hypot(c[0] - x - w / 2, c[1] - y - d / 2) > w / 2) continue;
      if (spaces.some(sp => inPoly(c, sp.poly))) continue;
      cells.push([cx, cy, Math.min(cx + 20, x + w), Math.min(cy + 20, y + d)]);
      [ox0, oy0, ox1, oy1] = [Math.min(ox0, cx), Math.min(oy0, cy), Math.max(ox1, Math.min(cx + 20, x + w)), Math.max(oy1, Math.min(cy + 20, y + d))];
    }
    if (ox0 === Infinity) return;
    // How far past the inside it reaches, on whichever sides it does
    const over = [x < ix0 && `${Math.round(ix0 - x)} left`, x + w > ix1 && `${Math.round(x + w - ix1)} right`,
      y < iy0 && `${Math.round(iy0 - y)} back`, y + d > iy1 && `${Math.round(y + d - iy1)} front`].filter(Boolean);
    dimLabel(over.length ? `out ${over.join(', ')}` : `out ${Math.round(ox1 - ox0)} × ${Math.round(oy1 - oy0)}`,
      P((ox0 + ox1) / 2, (oy0 + oy1) / 2, CEILING_HEIGHT + 120), storedGroup, '#b3261e', 0.055);
  });
  if (!cells.length) return;
  const pos = [];
  for (const [a, b, c, d] of cells) {
    const q = [P(a, b, CEILING_HEIGHT + 40), P(c, b, CEILING_HEIGHT + 40), P(c, d, CEILING_HEIGHT + 40), P(a, d, CEILING_HEIGHT + 40)];
    for (const i of [0, 1, 2, 0, 2, 3]) pos.push(q[i].x, q[i].y, q[i].z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.Mesh(geo, planFitMat);
  m.renderOrder = 9;
  storedGroup.add(m);
}

function drawStored() {
  const { shown, where: placed } = config.thingsToStore, stored = storedSpots();
  storedGroup.traverse(o => {
    o.geometry?.dispose();
    if (o.isSprite || o.material?.map) {                        // labels have their own materials
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
  storedGroup.clear();
  storedGroup.visible = shown;
  cupboard?.drawShelves(storedThings());                        // cut back round where they now stand
  const plan = flat && flatView === 'plan';
  const spaces = cupboardSpaces(), fits = STORED.map((s, k) => fitOf(k, stored[k], spaces));
  if (plan && spaces.length) planFit(spaces, fits);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  STORED.forEach((s, k) => {
    const { x, y, z } = stored[k], [w, d] = storedSize(k);
    storedMats[k].depthTest = !plan;                             // in the plan they show through cupboard tops
    storedMats[k].emissive.set(fits[k] === 'tall' || fits[k] === 'sticks' ? 0x8a0f0f : 0x000000);   // red: in the cupboard but not fitting
    let m;
    if (s.round) {
      m = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 * MM, w / 2 * MM, s.h * MM, 40), storedMats[k]);
      m.position.copy(P(x + w / 2, y + d / 2, z + s.h / 2));
      m.castShadow = m.receiveShadow = true;
      storedGroup.add(m);
    } else {
      m = box({ from: [x, y, z], to: [x + w, y + d, z + s.h] }, storedMats[k], storedGroup);
    }
    m.userData.stored = k;
    m.renderOrder = plan ? 6 : 0;
    if (plan) dimLabel(s.label, P(x + w / 2, y + d / 2, CEILING_HEIGHT + 100), storedGroup, '#1f4e79', 0.06);
    else faceLabel(s.label, x, y, w, d, z + s.h, storedGroup);
    [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x + w), Math.max(y1, y + d)];
  });
  // The floor area they take, outlined just above the floor
  storedLineMat.color.set(fits.some(f => f === 'tall' || f === 'sticks') ? 0xb3261e : 0x1f4e79);   // red when something doesn't fit
  const outline = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => P(x, y, 5));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(outline), storedLineMat);
  line.renderOrder = 7;
  storedGroup.add(line);
  const area = `${x1 - x0} × ${y1 - y0}`;
  if (plan) dimLabel(`Storage area ${area}`, P((x0 + x1) / 2, y1 + 110, CEILING_HEIGHT + 100), storedGroup, '#1f4e79', 0.08);
  const footprints = STORED.reduce((sum, s) => sum + s.w * s.d, 0);
  const lower = name => name.charAt(0).toLowerCase() + name.slice(1).replace(/ \(\d\)$/, '');   // 'drying racks', not 'Drying racks (2)'
  const why = { out: 'no room for it', tall: 'too tall there', sticks: 'sticks out' };
  const misfits = STORED.map((s, k) => fits[k] !== 'fits' ? `the ${lower(s.name)} (${why[fits[k]]})` : '').filter(Boolean);
  const inCupboard = fits.filter(f => f !== 'out').length;
  const where = !spaces.length
    ? (placed === IN_THE_CUPBOARD ? ' This option has no corner cupboard, so they stay by the middle window.' : '')
    : placed === IN_THE_CUPBOARD || inCupboard
      ? ` In option ${config.pieces.cornerCupboard.design.option}'s corner cupboard: ${fits.filter(f => f === 'fits').length} of ${STORED.length} fit` +
        (misfits.length ? `; not ${misfits.join(', ')}.` : '.') + (cupboard.shelfCutText(storedThings()) || ' No shelves need cutting back.')
      : '';
  return `Standing on the floor they take ${area} (${((x1 - x0) * (y1 - y0) / 1e6).toFixed(2)} m², for ` +
    `${(footprints / 1e6).toFixed(2)} m² of footprints), up to ${Math.max(...STORED.map(s => s.h))} high.` + where +
    ' In the plan view, drag them to move them; double-click or double-tap one to turn it round.';
}

// What the other pieces of the model use
export {
  BY_HAND, PACKINGS, STORED, STORED_WHERE, drawStored, insideText, storedGroup, storedMats, storedSize
};
