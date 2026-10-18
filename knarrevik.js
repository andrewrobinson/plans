// Knarrevik: IKEA's bedside table in black steel, the user's two, in the
// bedroom (asked for, 18 Oct 2026). other_room.js says where they stand.
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

// IKEA's: 37 × 28 × 45 cm (the smaller of its two sizes, the user's).
// https://www.ikea.com/gb/en/p/knarrevik-bedside-table-black-00576318/
export const KNARREVIK = { w: 370, d: 280, h: 450 };
// The page gives no more than "metal bars without welded joints" and two
// shelves, so these are estimated from the product photo: square legs at
// the corners, rising past the top to a rail round its back and sides; the
// top and the lower shelf sheet steel, their edges turned down
const BAR = 12;                                    // the legs' and the rail's bars
const TOP = 410;                                   // the top's surface, off the floor: the rail stands 40 over it
const SHELF = 120;                                 // the lower shelf's surface
const SHEET = 20;                                  // how deep the shelves' turned-down edges are
const steelMat = material(0x1e1e1e);

// A Knarrevik, its back's middle at the origin, facing out
export function knarrevik() {
  const g = new THREE.Group(), { w, d, h } = KNARREVIK, half = w / 2;
  for (const x of [-half, half - BAR]) {
    for (const y of [0, d - BAR]) box({ from: [x, y, 0], to: [x + BAR, y + BAR, h] }, steelMat, g);   // legs
  }
  for (const z of [TOP, SHELF]) box({ from: [-half + BAR, BAR, z - SHEET], to: [half - BAR, d - BAR, z] }, steelMat, g);   // top, shelf
  box({ from: [-half + BAR, 0, h - BAR], to: [half - BAR, BAR, h] }, steelMat, g);                     // the rail: along the back
  for (const x of [-half, half - BAR]) box({ from: [x, BAR, h - BAR], to: [x + BAR, d - BAR, h] }, steelMat, g);   // and the sides
  return g;
}
