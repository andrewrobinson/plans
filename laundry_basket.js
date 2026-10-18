// The laundry basket: grey plastic, round and panelled, narrowing to its
// foot, the user's, in the bedroom in front of the Kvistbro (asked for, 18
// Oct 2026, with a photo). other_room.js says where it stands.
import * as THREE from 'three';
import { MM, material } from './kit/floor_kit.js';

// Its sizes estimated from the photo, against the Kvistbro beside it (440
// across): about as wide at its rim, a little taller
export const LAUNDRY_BASKET = { w: 440, foot: 340, h: 480 };
const PANELS = 12;                                 // its panels round (counted in the photo, roughly)
const greyMat = new THREE.MeshStandardMaterial({ color: 0x51565c, roughness: 0.8, side: THREE.DoubleSide });

// The basket, its back's middle at the origin, out along y: open at the top
export function laundryBasket() {
  const g = new THREE.Group(), { w, foot, h } = LAUNDRY_BASKET;
  const sides = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 * MM, foot / 2 * MM, h * MM, PANELS, 1, true), greyMat);
  sides.position.set(0, h / 2 * MM, w / 2 * MM);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(foot / 2 * MM, PANELS), greyMat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.set(0, 1 * MM, w / 2 * MM);
  for (const m of [sides, bottom]) m.castShadow = m.receiveShadow = true;
  g.add(sides, bottom);
  return g;
}
