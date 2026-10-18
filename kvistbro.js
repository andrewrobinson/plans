// Kvistbro: IKEA's round storage table in white, the user's, in the
// bedroom on the window side of the bed (asked for, 18 Oct 2026). Its top
// lifts off a basket of steel wire. other_room.js says where it stands.
import * as THREE from 'three';
import { MM, material } from './kit/floor_kit.js';

// IKEA's: 44 cm across, 42 high.
// https://www.ikea.com/gb/en/p/kvistbro-storage-table-white-30349452/
export const KVISTBRO = { w: 440, h: 420 };
const TOP = 18;                                    // the top's fibreboard (estimated)
const BASKET_FOOT = 360;                           // the basket's width at the floor: it narrows down (estimated from the user's photo)
const WIRES = 16;                                  // the wire pattern's sides round (chosen: enough to suggest it)
const whiteMat = material(0xf4f4f2);
// The basket's wire: a see-through white with a wireframe over it, a hint
// of the crossed wires (chosen: the wireframe alone barely showed)
const meshMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.8, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
const wireMat = new THREE.MeshBasicMaterial({ color: 0xb8b8b4, wireframe: true });

// A Kvistbro, its back's middle at the origin (so its back against a wall
// there), out along y: the basket and its top on it
export function kvistbro() {
  const g = new THREE.Group(), { w, h } = KVISTBRO, middle = w / 2 * MM, basketH = h - TOP;
  const basketShape = new THREE.CylinderGeometry(w / 2 * MM, BASKET_FOOT / 2 * MM, basketH * MM, WIRES, 4, true);
  const basket = new THREE.Mesh(basketShape, meshMat);
  basket.add(new THREE.Mesh(basketShape, wireMat));
  basket.position.set(0, basketH / 2 * MM, middle);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 * MM, w / 2 * MM, TOP * MM, 40), whiteMat);
  top.position.set(0, (h - TOP / 2) * MM, middle);
  top.castShadow = top.receiveShadow = true;
  g.add(basket, top);
  return g;
}
