// The work chairs: the user's office chair, at the kitchen desk, and a
// smaller armless one for the daybed's desk (asked for, 22 Oct 2026: the
// person working there is smaller, but the full-size chair's room is worth
// knowing too). Each is drawn round its own centre, facing out along y, its
// back towards -y; flat_model.js says where they stand.
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

const blackMat = material(0x222222);

// The office chair: seat at 590 and headrest top at 1400, 600 across its
// armrests (measured); the rest estimated
const OFFICE = { seat: 590, top: 1400, seatHalf: 250, baseHalf: 320 };
export function officeChair() {
  const g = new THREE.Group(), { seat: SEAT, top: CHAIR_TOP } = OFFICE;
  box({ from: [-250, -250, SEAT - 70], to: [250, 250, SEAT] }, blackMat, g);                 // seat
  box({ from: [-230, -280, SEAT], to: [230, -230, CHAIR_TOP - 250] }, blackMat, g);          // back
  box({ from: [-140, -290, CHAIR_TOP - 230], to: [140, -240, CHAIR_TOP] }, blackMat, g);     // headrest
  for (const side of [-1, 1]) {                                                              // armrests, making it 600 wide
    box({ from: [side * 300 - (side > 0 ? 50 : 0), -200, SEAT + 200], to: [side * 300 + (side < 0 ? 50 : 0), 150, SEAT + 230] }, blackMat, g);
    box({ from: [side * 275 - 10, -40, SEAT], to: [side * 275 + 10, 0, SEAT + 200] }, blackMat, g);
  }
  box({ from: [-25, -25, 80], to: [25, 25, SEAT - 70] }, blackMat, g);                       // column
  box({ from: [-320, -25, 40], to: [320, 25, 80] }, blackMat, g);                            // base
  box({ from: [-25, -320, 40], to: [25, 320, 80] }, blackMat, g);
  return g;
}

// A smaller armless task chair (estimated, as a typical one): its seat 460
// square at 470 (set low, for a smaller person), its back 420 wide up to
// 900, on a base 600 across
const SMALL = { seat: 470, top: 900, seatHalf: 230, baseHalf: 300 };
function smallChair() {
  const g = new THREE.Group(), { seat: SEAT, top } = SMALL;
  box({ from: [-230, -230, SEAT - 60], to: [230, 230, SEAT] }, blackMat, g);                 // seat
  box({ from: [-210, -265, SEAT + 80], to: [210, -230, top] }, blackMat, g);                 // back
  box({ from: [-15, -265, SEAT - 60], to: [15, -230, SEAT + 80] }, blackMat, g);             // its stem, to the seat
  box({ from: [-25, -25, 80], to: [25, 25, SEAT - 60] }, blackMat, g);                       // column
  box({ from: [-300, -25, 40], to: [300, 25, 80] }, blackMat, g);                            // base
  box({ from: [-25, -300, 40], to: [25, 300, 80] }, blackMat, g);
  return g;
}

// Each by its word in the configuration: what to call it, how to draw it,
// how far its seat reaches each way from its centre and its base too
// (which reaches further), and how high it is
export const WORK_CHAIRS = {
  small: { name: 'the smaller armless chair', draw: smallChair, ...SMALL },
  office: { name: 'the office chair', draw: officeChair, ...OFFICE },
};
