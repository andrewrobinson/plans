// Billy and BillyChest, the user's, from the garage: each can stand in the
// garage, on the living room's back wall and in the bedroom, each on its
// own (asked for, 18 Oct 2026). Their sizes are fixed. Billy, IKEA's Billy
// bookcase, can stand up, or lie on its long side on the floor with its
// open side looking out, much like a bench; it's drawn as the bedroom's
// bookcase is (bookcase.js), in white. BillyChest is a plain white box.
// Each room's file says where they stand.
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';
import { bookcase } from './bookcase.js';

export const BILLY = { w: 800, d: 280, h: 2020 };   // the user's (16 Oct 2026): w along its back, d out from it, h high
export const BILLY_CHEST = { w: 805, d: 484, h: 780 };   // the user's (16 Oct 2026)
const billyMat = material(0xf4f3ef);                 // as IKEA's Billy, both

// What it takes up as it stands: along the wall behind it, out from it and
// high. Lying, its height runs along the wall and its width is how high it is
export const billySizes = lying => (lying ? { w: BILLY.h, d: BILLY.d, h: BILLY.w } : { ...BILLY });

// Billy, its back's middle at the origin, facing out, standing or lying.
// Lying, it's the standing one turned a quarter about the line out from
// the wall, its top to the left, then moved so it sits on the floor,
// centred on the origin again
export function billy(lying) {
  const body = bookcase(BILLY, billyMat);
  if (!lying) return body;
  const g = new THREE.Group();
  body.rotation.z = Math.PI / 2;
  body.position.set(BILLY.h / 2 * MM, BILLY.w / 2 * MM, 0);
  g.add(body);
  return g;
}

// BillyChest, its back's middle at the origin, facing out: a plain box
export function billyChest() {
  const g = new THREE.Group(), { w, d, h } = BILLY_CHEST;
  box({ from: [-w / 2, 0, 0], to: [w / 2, d, h] }, billyMat, g);
  return g;
}
