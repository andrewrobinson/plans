// The kitchen tables, the user's (asked for, 18 Oct 2026), in the living
// room for now, each with its own place. Chesham, a pine top on green legs,
// is on its end, its top against the back wall and its legs out into the
// room; it can be stood up. Cornwall, an oak-coloured top on a white frame
// and white legs, is on the floor with its legs off; they can go back on.
// flat_model.js says where each stands.
import * as THREE from 'three';
import { box, material } from './kit/floor_kit.js';

// Each one's top, length by width, and its height on its legs: the user's.
// The rest estimated from the photos: how thick the top is, the legs, how
// deep the frame under the top, and how far the legs stand in from its edges
export const CHESHAM = { L: 1190, W: 740, H: 730, top: 30, leg: 55, frame: 90, inset: 30,
  topMat: material(0xd9a66b), frameMat: material(0x2f6b3a) };    // honey pine; green, as in the photo
export const CORNWALL = { L: 1200, W: 800, H: 730, top: 30, leg: 60, frame: 120, inset: 30,
  topMat: material(0xc99a62), frameMat: material(0xf2f0ea) };    // oak-coloured; white
// Cornwall with its legs off: its top and frame, on the floor: the user's
export const LEGS_OFF_H = 150;

// What one takes up as it stands, along its back, out from it and high:
// on its legs, its length along; on its end, its width along, its height out
// and its length up
export function tableSizes(table, { onItsEnd = false, legsOff = false } = {}) {
  const H = legsOff ? LEGS_OFF_H : table.H;
  return onItsEnd ? { w: table.W, d: H, h: table.L } : { w: table.L, d: table.W, h: H };
}

// The table's boards, as boxes in its own mm standing on its legs: x along
// its length from its middle, y across it from its back edge, z up
function boards(table, legsOff) {
  const { L, W, top, leg, frame, inset } = table, H = legsOff ? LEGS_OFF_H : table.H;
  const under = H - top, x0 = -L / 2 + inset, x1 = L / 2 - inset, y0 = inset, y1 = W - inset;
  const parts = [{ from: [-L / 2, 0, under], to: [L / 2, W, H], top: true }];          // the top
  const frameFrom = legsOff ? 0 : under - frame;                                        // with no legs, the frame stands on the floor
  parts.push(
    { from: [x0, y0, frameFrom], to: [x1, y0 + 20, under] }, { from: [x0, y1 - 20, frameFrom], to: [x1, y1, under] },   // the long sides of the frame
    { from: [x0, y0, frameFrom], to: [x0 + 20, y1, under] }, { from: [x1 - 20, y0, frameFrom], to: [x1, y1, under] },   // ...and its ends
  );
  if (!legsOff) {
    for (const x of [x0, x1 - leg]) for (const y of [y0, y1 - leg]) parts.push({ from: [x, y, 0], to: [x + leg, y + leg, under] });
  }
  return parts;
}

// From the table standing to the table on its end, its top against the wall
// behind it: its width runs along the wall, its height out from it, its
// length up. Each box's corners map to corners, so it stays a box
function ontoItsEnd(table, legsOff, { from, to }) {
  const H = legsOff ? LEGS_OFF_H : table.H;
  const point = ([x, y, z]) => [y - table.W / 2, H - z, x + table.L / 2];
  const a = point(from), b = point(to);
  return { from: a.map((v, k) => Math.min(v, b[k])), to: a.map((v, k) => Math.max(v, b[k])) };
}

// A table, its back's middle at the origin, facing out (as ivar() is)
export function kitchenTable(table, { onItsEnd = false, legsOff = false } = {}) {
  const g = new THREE.Group();
  for (const part of boards(table, legsOff)) {
    const placed = onItsEnd ? ontoItsEnd(table, legsOff, part) : part;
    box(placed, part.top ? table.topMat : table.frameMat, g);
  }
  return g;
}
