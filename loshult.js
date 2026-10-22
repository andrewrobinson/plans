// The LOSHULT trolley (IKEA, pine), three of them under the kitchen island in
// its 'trolleys' layout (tornviken.js). Drawn standing on the floor round its
// own centre, front and back alike, across x.
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

const pineMat = material(0xe8cf9f), castorMat = material(0x222222);

// IKEA's sizes: 380 x 380, 820 high on its castors, three shelves. The rest
// estimated from the owner's photo
export const LOSHULT = {
  width: 380, depth: 380, height: 820,
  castor: 70,                  // the castors' height, to the frame (estimated)
  leg: 35,                     // the legs' square (estimated)
  shelves: [110, 430, 750],    // the three shelves' heights (estimated)
  shelfT: 12, lip: 70,         // the plywood shelves' thickness, and the rails round each (estimated)
  topRail: 90,                 // the rail round the top, front and back (estimated)
};

export function loshultTrolley() {
  const g = new THREE.Group();
  const { width, depth, height, castor, leg, shelves, shelfT, lip, topRail } = LOSHULT;
  const x0 = -depth / 2, x1 = depth / 2, y0 = -width / 2, y1 = width / 2;
  for (const x of [x0, x1 - leg]) for (const y of [y0, y1 - leg]) {
    box({ from: [x, y, castor], to: [x + leg, y + leg, height] }, pineMat, g);                       // leg
    box({ from: [x + 5, y + 5, 0], to: [x + leg - 5, y + leg - 5, castor] }, castorMat, g, false);   // castor
  }
  for (const z of shelves) {
    box({ from: [x0 + leg, y0, z], to: [x1 - leg, y1, z + shelfT] }, pineMat, g);   // shelf
    for (const x of [x0, x1 - 15]) box({ from: [x, y0 + leg, z], to: [x + 15, y1 - leg, z + lip] }, pineMat, g);   // its rails, front and back
  }
  for (const x of [x0, x1 - 15]) box({ from: [x, y0 + leg, height - topRail], to: [x + 15, y1 - leg, height] }, pineMat, g);   // top rails
  return g;
}
