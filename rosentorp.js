// The ROSENTORP bar stool with a backrest (IKEA, counter height, white),
// two of them at the kitchen island. Drawn round its own centre, facing out along
// y, its back towards -y, like the work chairs (work_chairs.js).
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';

const chairMat = material(0xf2efe6);   // painted white, as the island's base
const footrestMat = material(0x8a8d90);   // its footrest is metal

// IKEA's sizes: 400 wide, 450 deep, 920 high, its seat 400 x 360 at 630.
// The legs, rails and seat's thickness are estimated from the photos
export const ROSENTORP = {
  width: 400, depth: 450, height: 920, seat: 630, seatDepth: 360,
  seatT: 30, leg: 35,                  // the seat's thickness, and the legs' square (estimated)
  footrest: 250, rung: 150,            // the front rung (a footrest) and the side rungs' heights (estimated)
  topRail: 90,                         // the backrest's top rail, its height (estimated)
};

export function rosentorpChair() {
  const g = new THREE.Group();
  const { width, depth, height, seat, seatDepth, seatT, leg, footrest, rung, topRail } = ROSENTORP;
  const x0 = -width / 2, x1 = width / 2, front = depth / 2, back = -depth / 2;
  const seatBack = front - seatDepth;                                        // the back legs stand behind the seat
  box({ from: [x0, seatBack, seat - seatT], to: [x1, front, seat] }, chairMat, g);   // seat
  for (const x of [x0, x1 - leg]) {
    box({ from: [x, front - leg, 0], to: [x + leg, front, seat - seatT] }, chairMat, g);   // front leg
    box({ from: [x, back, 0], to: [x + leg, back + leg, height] }, chairMat, g);          // back leg, up to the top of the backrest
    box({ from: [x, back + leg, rung], to: [x + leg, front - leg, rung + 20] }, chairMat, g);   // side rung
  }
  box({ from: [x0 + leg, front - leg, footrest], to: [x1 - leg, front - 5, footrest + 25] }, footrestMat, g);   // footrest
  box({ from: [x0 + leg, back, height - topRail], to: [x1 - leg, back + 20, height] }, chairMat, g);         // top rail
  box({ from: [x0 + leg, back, seat + 20], to: [x1 - leg, back + 20, seat + 60] }, chairMat, g);             // bottom rail of the back
  backCross(g, x1 - leg - (x0 + leg), seat + 60, height - topRail, back + 10);
  return g;
}

// The X across the backrest: two slats corner to corner of the gap between
// its rails, `span` wide from z0 to z1, in the plane at y
function backCross(g, span, z0, z1, y) {
  const rise = z1 - z0, slat = Math.hypot(span, rise), tilt = Math.atan2(rise, span);
  for (const turn of [tilt, -tilt]) {
    const s = box({ from: [-slat / 2, y - 8, -15], to: [slat / 2, y + 8, 15] }, chairMat, g);
    s.position.y = (z0 + z1) / 2 * MM;     // lifted to the gap's middle
    s.rotation.z = turn;                   // turned in the back's plane
  }
}
