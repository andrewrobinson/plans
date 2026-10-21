// A loose desk on castors for the living room (asked for, 20 Oct 2026):
// parked against the left wall between the corner cupboard and the door
// frame, or wheeled out in front of the TV. An oak top on a black steel
// frame, with a shelf under it for a laptop and papers, on four locking
// castors. flat_model.js says where it stands.
import * as THREE from 'three';
import { box, material } from './kit/floor_kit.js';

// Its sizes, all chosen with the user (20 Oct 2026): L along its back, W
// from its back to its front (where you sit), H to the top of its top,
// castors included. 950 long parks in the 1002 between Option 13's
// cupboard (327 out along the left wall) and the door frame (1329), with
// room to spare; 550 deep for a laptop and arms; 740, a usual desk height.
// The rest estimated, as such desks are made: the top's thickness, the
// steel's square section, the rails under the top, the castors' height and
// the shelf's height off the floor.
export const CASTOR_DESK = { L: 950, W: 550, H: 740, top: 25, steel: 30, rail: 60, castor: 50, shelfAt: 180, shelf: 18 };
const oakMat = material(0xc8a26b);                 // as the cupboards' oak shelves and the fold-down desk's top
const steelMat = material(0x2b2b2b);               // black steel
const castorMat = material(0x1a1a1a);              // the castors' wheels and brakes

// What it takes up: along its back, out from it and high
export const castorDeskSizes = () => ({ w: CASTOR_DESK.L, d: CASTOR_DESK.W, h: CASTOR_DESK.H });

// The desk, its back's middle at the origin, facing out (as ivar() is): x
// along its length from its middle, y out from its back to its front, z up
export function castorDesk() {
  const { L, W, H, top, steel: s, rail, castor, shelfAt, shelf } = CASTOR_DESK;
  const g = new THREE.Group(), under = H - top, x0 = -L / 2, x1 = L / 2;
  box({ from: [x0, 0, under], to: [x1, W, H] }, oakMat, g);                                   // the top
  for (const x of [x0, x1 - s]) {
    for (const y of [0, W - s]) {
      box({ from: [x, y, castor], to: [x + s, y + s, under] }, steelMat, g);                  // a leg
      box({ from: [x + 2, y + 2, 0], to: [x + s - 2, y + s - 2, castor] }, castorMat, g);     // its castor
    }
  }
  box({ from: [x0 + s, 0, under - rail], to: [x1 - s, s, under] }, steelMat, g);              // the rails under the top: back,
  box({ from: [x0 + s, W - s, under - rail], to: [x1 - s, W, under] }, steelMat, g);          // front,
  box({ from: [x0, s, under - rail], to: [x0 + s, W - s, under] }, steelMat, g);              // and ends
  box({ from: [x1 - s, s, under - rail], to: [x1, W - s, under] }, steelMat, g);
  box({ from: [x0 + s, s, shelfAt], to: [x1 - s, W - s, shelfAt + shelf] }, oakMat, g);       // the shelf, between the legs
  return g;
}
