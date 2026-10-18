// Billy: IKEA's Billy bookcase, the user's, which can stand in the garage,
// on the living room's back wall and in the bedroom, each on its own (asked
// for, 18 Oct 2026). Its size is fixed. In each room it can stand up, or
// lie on its long side on the floor with its open side looking out, much
// like a bench. Drawn as the bedroom's bookcase is (bookcase.js), in white;
// each room's file says where it stands.
import * as THREE from 'three';
import { MM, material } from './kit/floor_kit.js';
import { bookcase } from './bookcase.js';

export const BILLY = { w: 800, d: 280, h: 2020 };   // the user's (16 Oct 2026): w along its back, d out from it, h high
const billyMat = material(0xf4f3ef);                 // as IKEA's Billy

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
