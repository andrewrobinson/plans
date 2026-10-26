// Walking space round the bedroom's bed (asked for, 26 Oct 2026; the
// choices in notes/WALKING_SPACE.md). A person walks in through the bedroom
// door, along the bed's near side, round its foot and up its far side, and
// stands at each of the new cupboard's doors. Each gap on the way gets a
// dimension on the floor, coloured by whether a person fits it walking
// forwards: green, orange (tight) or red (sideways, or not at all).
//
// How: everything drawn between BODY_LOW and BODY_HIGH off the bedroom
// floor is laid on a grid of CELL squares; each square's clearance (how far
// to the nearest thing) gives the route that keeps furthest from things;
// the narrowest point on each stretch of it is then measured exactly, from
// the shapes themselves, not the grid.
import * as THREE from 'three';
import { MM, makeCanvas } from '../kit/floor_kit.js';
import { OTHER_ROOM, OTHER_ROOM_CORNER } from '../floor.js';
import { world } from './state.js';

const CELL = 10;               // the grid's square, mm (chosen: fine enough for a person, quick enough to redo on each change)
const BODY_LOW = 30;           // what's in the way starts this high off the floor: not the carpet (chosen)
const BODY_HIGH = 1500;        // ...and stops here: not a shelf over your head (chosen)
export const WALK_EASY = 600;  // walking forwards past it: shoulders and sway (the user's rule, 26 Oct 2026)
export const WALK_TIGHT = 460; // an adult's shoulders (estimated): forwards, but tight; under it you'd turn sideways
const LOOK_OUT = 900;          // how far out from the bed's side the spot to stand beside it is looked for (chosen)
const AGAINST = 100;           // a side with no more clearance than this out to LOOK_OUT is against something (chosen)
const DOOR_IN = 700;           // how far into the room the start is looked for, from the doorway (chosen)
const THROUGH_DOOR = 600;      // the route's first stretch, in through the doorway, isn't judged: the wall's behind you (chosen)
const STEER = 300;             // the route keeps this far from things where it can (chosen: half of WALK_EASY)
const HANDLE_CLEAR = 80;       // a cupboard door's handle stands out about this far: its measure starts past it (estimated)
const DOOR_REACH = 2000;       // a cupboard door's measure stops here: room enough whatever's beyond (chosen)
const HINGE_CLEAR = 80;        // the bedroom door's frame round its hinge isn't in its way (estimated)
const SWING_MARGIN = 3;        // degrees short of where the bedroom door stands: its own leaf isn't in its way (chosen)
const FRAME_OUT = 40;          // the door frame stands this far into the room from the hallway wall: not in the door's way (estimated)
const DIM_HEIGHT = 20;         // the dimensions' height off the floor, mm (chosen)
const TICK = 60;               // half the length of a dimension's end ticks, mm (chosen)
const LABEL_ROOM = 250;        // labels closer than this are moved apart, mm (chosen: a label's about 130 high)

// The colours, as the hanging line's (room_3d.css's data-verdict)
const SHADES = { easy: '#1e7a34', tight: '#c25e00', narrow: '#b3261e' };
const VERDICT_WORDS = { easy: '', tight: ' (tight)', narrow: ' (too narrow)' };
const DOOR_WORDS = { easy: '', tight: ' (opens, but tight to stand at)', narrow: " (can't open fully)" };
const VERDICTS = { easy: 'ideal', tight: 'enough', narrow: 'short' };   // room_3d.css's hint colours
const shadeOf = width => (width >= WALK_EASY ? 'easy' : width >= WALK_TIGHT ? 'tight' : 'narrow');

// The bedroom in its own mm: u from the window wall to the kitchen-side
// wall, v from the hallway wall to the chimney breast, the recess on to
// recessBack where u < recessWidth
const { length: ROOM_U, breastFace, recessBack, recessWidth } = OTHER_ROOM;
const ROOM_OUTLINE = [[0, 0], [ROOM_U, 0], [ROOM_U, breastFace], [recessWidth, breastFace], [recessWidth, recessBack], [0, recessBack]];
const NU = Math.ceil(ROOM_U / CELL) + 1, NV = Math.ceil(recessBack / CELL) + 1;
const inRoom = (u, v) => u >= 0 && u <= ROOM_U && v >= 0 && (v <= breastFace || (u <= recessWidth && v <= recessBack));
const toRoom = p => [p.x / MM - OTHER_ROOM_CORNER.x, p.z / MM - OTHER_ROOM_CORNER.y, p.y / MM];   // a scene point: u, v, height
const toScene = (u, v, h = DIM_HEIGHT) => new THREE.Vector3((u + OTHER_ROOM_CORNER.x) * MM, h * MM, (v + OTHER_ROOM_CORNER.y) * MM);
const cellAt = (u, v) => Math.round(u / CELL) * NV + Math.round(v / CELL);
const cellU = k => Math.floor(k / NV) * CELL, cellV = k => (k % NV) * CELL;

// ---------------------------------------------------------------------------
// What's in the way: every triangle drawn at body height, flat on the floor
// ---------------------------------------------------------------------------

// The triangles, as [u1, v1, u2, v2, u3, v3] each, and the room's walls as
// triangles with two corners the same; those of `own` (the bedroom door's
// leaf) in a list of their own as well
function obstacles(own) {
  const tris = [];
  ROOM_OUTLINE.forEach(([u, v], i) => { const [u2, v2] = ROOM_OUTLINE[(i + 1) % ROOM_OUTLINE.length]; tris.push([u, v, u2, v2, u2, v2]); });
  world.updateMatrixWorld(true);
  world.traverseVisible(o => {
    if (!o.isMesh || !o.geometry?.attributes.position) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const box = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
    const [u0, v0, h0] = toRoom(box.min), [u1, v1, h1] = toRoom(box.max);
    if (u1 < -CELL || u0 > ROOM_U + CELL || v1 < -CELL || v0 > recessBack + CELL || h1 < BODY_LOW || h0 > BODY_HIGH) return;
    trianglesOf(o, tris);
  });
  const ownTris = [];
  own?.traverseVisible(o => { if (o.isMesh) trianglesOf(o, ownTris); });
  return { tris, ownTris };
}
function trianglesOf(mesh, tris) {
  const pos = mesh.geometry.attributes.position, index = mesh.geometry.index, p = new THREE.Vector3();
  const corner = i => toRoom(p.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
  const count = index ? index.count : pos.count;
  for (let t = 0; t < count; t += 3) {
    const [a, b, c] = [0, 1, 2].map(n => corner(index ? index.getX(t + n) : t + n));
    if (Math.max(a[2], b[2], c[2]) < BODY_LOW || Math.min(a[2], b[2], c[2]) > BODY_HIGH) continue;
    tris.push([a[0], a[1], b[0], b[1], c[0], c[1]]);
  }
}

// The nearest point of a triangle to (x, y), and how far it is: 0 inside
function nearestOn([ax, ay, bx, by, cx, cy], x, y) {
  const side = (px, py, qx, qy) => (qx - px) * (y - py) - (qy - py) * (x - px);
  const s1 = side(ax, ay, bx, by), s2 = side(bx, by, cx, cy), s3 = side(cx, cy, ax, ay);
  const area = Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  if (area > 1 && ((s1 >= 0 && s2 >= 0 && s3 >= 0) || (s1 <= 0 && s2 <= 0 && s3 <= 0))) return { x, y, d: 0 };
  let best = null;
  for (const [px, py, qx, qy] of [[ax, ay, bx, by], [bx, by, cx, cy], [cx, cy, ax, ay]]) {
    const dx = qx - px, dy = qy - py, len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((x - px) * dx + (y - py) * dy) / len2)) : 0;
    const nx = px + t * dx, ny = py + t * dy, d = Math.hypot(x - nx, y - ny);
    if (!best || d < best.d) best = { x: nx, y: ny, d };
  }
  return best;
}

// The grid: 1 where something stands, or outside the room
function blockedGrid(tris) {
  const blocked = new Uint8Array(NU * NV);
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) if (!inRoom(i * CELL, j * CELL)) blocked[i * NV + j] = 1;
  for (const tri of tris) {
    const us = [tri[0], tri[2], tri[4]], vs = [tri[1], tri[3], tri[5]];
    const i0 = Math.max(0, Math.floor(Math.min(...us) / CELL)), i1 = Math.min(NU - 1, Math.ceil(Math.max(...us) / CELL));
    const j0 = Math.max(0, Math.floor(Math.min(...vs) / CELL)), j1 = Math.min(NV - 1, Math.ceil(Math.max(...vs) / CELL));
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      if (!blocked[i * NV + j] && nearestOn(tri, i * CELL, j * CELL).d <= CELL / 2) blocked[i * NV + j] = 1;
    }
  }
  return blocked;
}

// Each square's clearance, mm: how far its middle is from the nearest
// blocked square's (an exact distance transform, Felzenszwalb and
// Huttenlocher's, a column at a time and then a row at a time)
function clearances(blocked) {
  const FAR = 1e20, n = Math.max(NU, NV);
  const f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  const squared = Float64Array.from(blocked, b => (b ? 0 : FAR));
  const along = len => {
    let k = 0; v[0] = 0; z[0] = -FAR; z[1] = FAR;
    const meet = q => (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    for (let q = 1; q < len; q++) {
      let s = meet(q);
      while (s <= z[k]) { k--; s = meet(q); }
      k++; v[k] = q; z[k] = s; z[k + 1] = FAR;
    }
    k = 0;
    for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
  };
  for (let i = 0; i < NU; i++) {
    for (let j = 0; j < NV; j++) f[j] = squared[i * NV + j];
    along(NV);
    for (let j = 0; j < NV; j++) squared[i * NV + j] = d[j];
  }
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) f[i] = squared[i * NV + j];
    along(NU);
    for (let i = 0; i < NU; i++) squared[i * NV + j] = d[i];
  }
  return Float32Array.from(squared, s => Math.sqrt(s) * CELL);
}

// ---------------------------------------------------------------------------
// The route, and its narrowest point
// ---------------------------------------------------------------------------

// The route from square `from` to square `to` that keeps furthest from
// things (each step costs more the closer it passes, as STEER says), through
// something only if there's no way round
function route(clear, from, to) {
  const N = NU * NV, cost = new Float64Array(N).fill(Infinity), back = new Int32Array(N).fill(-1);
  const heap = new MinHeap(N * 4);
  cost[from] = 0; heap.push(0, from);
  const steps = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]];
  while (heap.size) {
    const [c, k] = heap.pop();
    if (k === to) break;
    if (c > cost[k]) continue;
    const i = Math.floor(k / NV), j = k % NV;
    for (const [di, dj, len] of steps) {
      const a = i + di, b = j + dj;
      if (a < 0 || a >= NU || b < 0 || b >= NV) continue;
      const n = a * NV + b, room = clear[n];
      const step = len * (room > 0 ? 1 + (STEER / room) ** 2 : 1e6);
      if (c + step < cost[n]) { cost[n] = c + step; back[n] = k; heap.push(c + step, n); }
    }
  }
  const path = [];
  for (let k = to; k !== -1; k = back[k]) path.push(k);
  return path.reverse();
}
class MinHeap {
  constructor(size) { this.keys = new Float64Array(size); this.items = new Int32Array(size); this.size = 0; }
  push(key, item) {
    if (this.size === this.keys.length) this.grow();
    let k = this.size++;
    while (k && this.keys[(k - 1) >> 1] > key) { const p = (k - 1) >> 1; this.keys[k] = this.keys[p]; this.items[k] = this.items[p]; k = p; }
    this.keys[k] = key; this.items[k] = item;
  }
  pop() {
    const top = [this.keys[0], this.items[0]], key = this.keys[--this.size], item = this.items[this.size];
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= this.size) break;
      if (c + 1 < this.size && this.keys[c + 1] < this.keys[c]) c++;
      if (this.keys[c] >= key) break;
      this.keys[k] = this.keys[c]; this.items[k] = this.items[c]; k = c;
    }
    this.keys[k] = key; this.items[k] = item;
    return top;
  }
  grow() {
    const keys = new Float64Array(this.keys.length * 2), items = new Int32Array(this.items.length * 2);
    keys.set(this.keys); items.set(this.items); this.keys = keys; this.items = items;
  }
}

// The route's narrowest square: the middle of its narrowest stretch
// (leaving out any squares in `skip`)
function narrowestOn(fullPath, clear, skip = () => false) {
  const path = fullPath.filter(k => !skip(k));
  const least = Math.min(...path.map(k => clear[k])), near = k => clear[k] <= least + CELL / 2;
  let best = [0, 0], run = null;
  path.forEach((k, n) => {
    if (near(k)) { run ??= n; if (n - run > best[1] - best[0]) best = [run, n]; } else run = null;
  });
  return path[Math.round((best[0] + best[1]) / 2)];
}

// The gap at (u, v), measured exactly: its nearest point of anything, and
// the nearest on the other side of (u, v) from it
function gapAt(tris, u, v) {
  const nearest = keep => tris.reduce((best, tri) => {
    const p = nearestOn(tri, u, v);
    return p.d < (best?.d ?? Infinity) && keep(p) ? p : best;
  }, null);
  const one = nearest(() => true);
  if (!one || one.d === 0) return null;
  const two = nearest(p => (p.x - u) * (one.x - u) + (p.y - v) * (one.y - v) < 0);
  return two && { from: [one.x, one.y], to: [two.x, two.y], width: Math.round(Math.hypot(two.x - one.x, two.y - one.y)) };
}

// ---------------------------------------------------------------------------
// The bed, and the spots to walk to
// ---------------------------------------------------------------------------

// The bed's footprint, and each of its edges but the head's, with its ends,
// the way out from it and a name: the bed's head is the edge at its own spot
const FACING = { '-1,0': 'window side', '1,0': 'door side', '0,-1': 'hallway side', '0,1': 'breast side' };
function bedSides(bed, spot) {
  const box = new THREE.Box3().setFromObject(bed), [u0, v0] = toRoom(box.min), [u1, v1] = toRoom(box.max);
  const edges = [
    { ends: [[u0, v0], [u0, v1]], out: [-1, 0] }, { ends: [[u1, v0], [u1, v1]], out: [1, 0] },
    { ends: [[u0, v0], [u1, v0]], out: [0, -1] }, { ends: [[u0, v1], [u1, v1]], out: [0, 1] },
  ].map(e => ({ ...e, mid: [(e.ends[0][0] + e.ends[1][0]) / 2, (e.ends[0][1] + e.ends[1][1]) / 2], name: FACING[e.out.join()] }));
  const head = edges.reduce((a, e) => (Math.hypot(e.mid[0] - spot.u, e.mid[1] - spot.v) < Math.hypot(a.mid[0] - spot.u, a.mid[1] - spot.v) ? e : a));
  const foot = edges.find(e => e.out[0] === -head.out[0] && e.out[1] === -head.out[1]);
  foot.name = 'foot';
  return { box: [u0, v0, u1, v1], foot, sides: edges.filter(e => e !== head && e !== foot) };
}
// The roomiest square out along `out` from any of `starts`, up to `reach`,
// or null where there's no room to stand
function spotOut(clear, starts, [du, dv], reach) {
  let best = null;
  for (const [u, v] of starts) {
    for (let d = CELL; d <= reach; d += CELL) {
      const pu = u + du * d, pv = v + dv * d;
      if (!inRoom(pu, pv)) break;
      const k = cellAt(pu, pv);
      if (best === null || clear[k] > clear[best]) best = k;
    }
  }
  return best !== null && clear[best] > AGAINST ? best : null;
}
// Points along a bed's edge to look out from: something standing by part
// of it (a basket, a bedside table) leaves the rest to stand at
const ALONG = [0.1, 0.3, 0.5, 0.7, 0.9];
const alongEdge = ({ ends: [[ua, va], [ub, vb]] }) => ALONG.map(t => [ua + t * (ub - ua), va + t * (vb - va)]);

// ---------------------------------------------------------------------------
// The measures
// ---------------------------------------------------------------------------

// Each gap: { name, width, shade, from, to }, from the door round the bed
// (a stretch with no way through gives width 0 and no from/to), then each
// of the new cupboard's doors
export function walkingGaps({ bed, bedSpot, cupboard, bedroomDoor }) {
  const { tris, ownTris } = obstacles(bedroomDoor?.leaf), blocked = blockedGrid(tris), clear = clearances(blocked);
  const swing = bedroomDoor ? [swingGap(blocked, bedroomDoor, ownTris)] : [];
  const doorMid = (OTHER_ROOM.doorFrom + OTHER_ROOM.doorTo) / 2;
  const start = spotOut(clear, [[doorMid, 0]], [0, 1], DOOR_IN);
  const { box, foot, sides } = bedSides(bed, bedSpot);
  const spots = sides.map(s => ({ ...s, at: spotOut(clear, alongEdge(s), s.out, LOOK_OUT) })).filter(s => s.at !== null);
  if (start === null || !spots.length) return swing;
  const doorDistance = s => Math.hypot(cellU(s.at) - doorMid, cellV(s.at));
  const [near, far] = spots.sort((a, b) => doorDistance(a) - doorDistance(b));
  const footSpot = spotOut(clear, alongEdge(foot), foot.out, LOOK_OUT);
  const stops = [{ at: start }, near, ...(footSpot !== null ? [{ ...foot, at: footSpot }] : []), ...(far ? [far] : [])];
  const gaps = [];
  for (let n = 1; n < stops.length; n++) {
    const path = route(clear, stops[n - 1].at, stops[n].at);
    const inDoorway = k => n === 1 && Math.hypot(cellU(k) - cellU(start), cellV(k) - cellV(start)) < THROUGH_DOOR;
    const k = narrowestOn(path, clear, inDoorway);
    const name = placeName(cellU(k), cellV(k), box, foot, sides) ?? 'From the door';
    const gap = clear[k] > 0 ? gapAt(tris, cellU(k), cellV(k)) : null;
    const width = gap?.width ?? 0;
    const same = gaps.findIndex(g => g.name === name);           // two stretches narrowest in the same place: the narrower
    if (same >= 0 && gaps[same].width <= width) continue;
    if (same >= 0) gaps.splice(same, 1);
    gaps.push({ name, width, shade: shadeOf(width), ...(gap && { from: gap.from, to: gap.to }) });
  }
  return [...swing, ...gaps, ...doorGaps(clear, cupboard)];
}

// The bedroom door must be able to swing shut from where it stands (the
// user, 26 Oct 2026): anything on the floor it sweeps, bar its own leaf and
// frame, is red, its dimension from the hinge to the nearest of it
function swingGap(blocked, { swing, open, leaf }, ownTris) {
  const name = 'Bedroom door swinging shut';
  if (open <= SWING_MARGIN) return { name, width: 0, shade: 'easy', say: 'it stands shut', words: '' };
  const own = blockedGrid(ownTris.concat()), sector = swing.swept(open - SWING_MARGIN), [hu, hv] = swing.hinge;
  let nearest = null;
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const k = i * NV + j, u = i * CELL, v = j * CELL, r = Math.hypot(u - hu, v - hv);
    if (!blocked[k] || v < FRAME_OUT || r < HINGE_CLEAR || r > swing.width || !inRoom(u, v) || insideOwn(own, k) || !inside(sector, u, v)) continue;
    if (!nearest || r < nearest.r) nearest = { r, at: [u, v] };
  }
  if (!nearest) return { name, width: swing.width, shade: 'easy', say: 'nothing in its way', words: '' };
  return { name, width: Math.round(nearest.r), shade: 'narrow', words: " (something's in its way: it can't swing shut)", from: [hu, hv], to: nearest.at };
}
// Squares the door's own leaf covers (blockedGrid also marks everything
// outside the room, which isn't the leaf)
const insideOwn = (own, k) => own[k] && inRoom(cellU(k), cellV(k));
// Whether (u, v) is inside a polygon of [u, v] points
function inside(polygon, u, v) {
  let inn = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ua, va] = polygon[a], [ub, vb] = polygon[b];
    if ((va > v) !== (vb > v) && u < ((ub - ua) * (v - va)) / (vb - va) + ua) inn = !inn;
  }
  return inn;
}
// Where on the way round a narrowest point is: past the bed's foot, or
// beside one of its sides
function placeName(u, v, [u0, v0, u1, v1], foot, sides) {
  const past = ({ mid, out }) => (u - mid[0]) * out[0] + (v - mid[1]) * out[1] > 0;
  if (past(foot)) return 'Round the foot';
  const side = sides.find(past);
  return side ? `The bed's ${side.name}` : null;
}

// Each of the new cupboard's doors, while it's drawn: how far it is from
// its face to the nearest thing in front, across its width. Red if it can't
// open to 90°, orange if it opens but leaves less than WALK_EASY to stand.
function doorGaps(clear, cupboard) {
  if (!cupboard?.visible) return [];
  const doors = [];
  cupboard.traverseVisible(o => { if (o.isMesh && o.userData.kind === 'Doors') doors.push(o); });
  return doors.map((door, n) => {
    const box = new THREE.Box3().setFromObject(door), [u0, v0] = toRoom(box.min), [u1, v1] = toRoom(box.max);
    const acrossU = u1 - u0 >= v1 - v0, width = Math.round(acrossU ? u1 - u0 : v1 - v0);
    const front = out => frontOf(clear, acrossU, out, [u0, v0, u1, v1]);
    const [toLow, toHigh] = [front(-1), front(1)];
    const out = toHigh.room >= toLow.room ? toHigh : toLow;     // the open side: the other's the cupboard
    const shade = out.room < width ? 'narrow' : out.room < WALK_EASY ? 'tight' : 'easy';
    const open = out.room >= DOOR_REACH;                        // nothing in front: no dimension to draw
    return { name: `Cupboard door ${n + 1} (${width} wide)`, width: out.room, doorWidth: width, shade, words: DOOR_WORDS[shade], ...(!open && { from: out.from, to: out.to }), open };
  });
}
// How much room there is out from one face of a door, the least of five
// lines out across its width, each starting past the handle
function frontOf(clear, acrossU, out, [u0, v0, u1, v1]) {
  let least = null;
  for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    const along = acrossU ? u0 + t * (u1 - u0) : v0 + t * (v1 - v0);
    const face = out > 0 ? (acrossU ? v1 : u1) : (acrossU ? v0 : u0);
    let d = HANDLE_CLEAR;
    for (; d < DOOR_REACH; d += CELL) {
      const [u, v] = acrossU ? [along, face + out * d] : [face + out * d, along];
      if (!inRoom(u, v) || clear[cellAt(u, v)] < CELL / 2) break;
    }
    if (!least || d < least.room) {
      const at = s => (acrossU ? [along, face + out * s] : [face + out * s, along]);
      least = { room: Math.round(d), from: at(0), to: at(d) };
    }
  }
  return least;
}

// ---------------------------------------------------------------------------
// Drawn, and said
// ---------------------------------------------------------------------------

let drawnGroup = null, lastGaps = [];

// The dimensions on the bedroom floor, or taken away (the page's
// display.walking); after each build, before the doors are turned, so the
// cupboard's doors are measured shut
export function drawWalking(on, pieces) {
  if (drawnGroup) world.remove(drawnGroup);
  drawnGroup = null;
  lastGaps = on ? walkingGaps(pieces) : [];
  if (!on) return;
  drawnGroup = new THREE.Group();
  drawnGroup.userData.walking = true;
  const labels = [];
  for (const gap of lastGaps) if (gap.from) dimension(gap, drawnGroup, labels);
  world.add(drawnGroup);
}
const lineMats = Object.fromEntries(Object.entries(SHADES).map(([shade, colour]) =>
  [shade, new THREE.LineBasicMaterial({ color: colour, depthTest: false })]));
function dimension({ from, to, width, shade }, g, labels) {
  const [du, dv] = [to[0] - from[0], to[1] - from[1]], len = Math.hypot(du, dv) || 1, [tu, tv] = [-dv / len * TICK, du / len * TICK];
  const line = points => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMats[shade]); l.renderOrder = 10; g.add(l); };
  line([toScene(...from), toScene(...to)]);
  for (const [u, v] of [from, to]) line([toScene(u - tu, v - tv), toScene(u + tu, v + tv)]);
  // Its label at the middle, or moved on along the line's ticks' way past
  // any label already there
  let [u, v] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  while (labels.some(([lu, lv]) => Math.hypot(lu - u, lv - v) < LABEL_ROOM)) [u, v] = [u + tu / TICK * LABEL_ROOM, v + tv / TICK * LABEL_ROOM];
  labels.push([u, v]);
  label(String(width), toScene(u, v), SHADES[shade], g);
}
function label(text, at, colour, g) {
  const canvas = makeCanvas(), ctx = canvas.getContext('2d');
  ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
  canvas.width = Math.ceil(ctx.measureText(text).width) + 12;
  canvas.height = 48;
  ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colour;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 6, 25);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
  const size = 0.13;   // as the 2D views' dimensions (kit/floor_kit.js's dimLabel)
  sprite.scale.set(size * canvas.width / canvas.height, size, 1);
  sprite.position.copy(at);
  sprite.renderOrder = 11;
  sprite.userData.text = text;
  g.add(sprite);
}

// The menu's line: each gap, its width and how it does
export function walkingText() {
  const said = g => g.say ?? (g.open ? `${DOOR_REACH} or more` : g.from ? g.width : 'no way through');
  return lastGaps.map(g => `${g.name}: ${said(g)}${g.words ?? VERDICT_WORDS[g.shade]}`).join('. ') + (lastGaps.length ? '.' : '');
}
// The worst of them, for the line's colour
export function walkingVerdict() {
  const worst = ['narrow', 'tight', 'easy'].find(s => lastGaps.some(g => g.shade === s));
  return worst ? VERDICTS[worst] : '';
}
export const walkingNow = () => lastGaps;
