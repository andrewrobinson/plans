// Ivar: IKEA's Ivar shelving unit in pine, the 2 × 2 cubes, the user's
// (asked for, 18 Oct 2026). It can be in the living room, the bedroom and
// the garage, each on its own. In the living room it lies on its side by
// the first radiator, as it is now; elsewhere it stands. Each room's file
// says where it stands.
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';

// IKEA's: 80 × 30 × 83 cm. https://www.ikea.com/gb/en/p/ivar-shelving-unit-pine-00522330/
export const IVAR = { w: 800, d: 300, h: 830 };
const BOARD = 18;                                  // its boards' thickness (estimated)
const pineMat = material(0xe6c99a);                // untreated pine (chosen)

// What it takes up: along its back, out from it and high. Lying on its
// side, its height runs along and its width is how high it is
export const ivarSizes = lying => (lying ? { w: IVAR.h, d: IVAR.d, h: IVAR.w } : { ...IVAR });

// The Ivar, its back's middle at the origin, facing out: two sides, a top
// and a bottom, and across the middle a divider and a shelf, making four
// cubes, open front and back. Lying, it's turned a quarter about the line
// out from its back, its top to the left, and sits on the floor
export function ivar(lying) {
  const g = new THREE.Group(), { w, d, h } = IVAR, half = w / 2, t = BOARD;
  box({ from: [-half, 0, 0], to: [-half + t, d, h] }, pineMat, g);                    // sides
  box({ from: [half - t, 0, 0], to: [half, d, h] }, pineMat, g);
  box({ from: [-half + t, 0, h - t], to: [half - t, d, h] }, pineMat, g);             // top
  box({ from: [-half + t, 0, 0], to: [half - t, d, t] }, pineMat, g);                 // bottom
  box({ from: [-t / 2, 0, t], to: [t / 2, d, h - t] }, pineMat, g);                   // the divider
  box({ from: [-half + t, 0, h / 2 - t / 2], to: [-t / 2, d, h / 2 + t / 2] }, pineMat, g);   // the shelf, either side of it
  box({ from: [t / 2, 0, h / 2 - t / 2], to: [half - t, d, h / 2 + t / 2] }, pineMat, g);
  if (!lying) return g;
  const turned = new THREE.Group();
  g.rotation.z = Math.PI / 2;
  g.position.set(h / 2 * MM, w / 2 * MM, 0);
  turned.add(g);
  return turned;
}
