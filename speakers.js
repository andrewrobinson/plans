// The Fenris A5: Argon Audio's active speakers, the user's pair, in white
// with their grilles on (asked for, 22 Oct 2026). They stand as a pair on
// the bench, on Billy lying in the lounge, or on the corner cupboard when
// it stops short of the ceiling; flat_model.js says where.
import * as THREE from 'three';
import { MM, material, box, slab } from './kit/floor_kit.js';

// Argon's: 28 × 17 × 22 cm (H × W × L), grille on.
// https://argonaudio.com/products/fenris-a5
export const FENRIS_A5 = { w: 170, d: 220, h: 280 };
// From the user's photo of the white pair, one with its grille on
// (estimated): the cabinet's upright edges are rounded; the grille, grey
// fabric on a frame held by magnets, stands proud of the cabinet's front,
// a little in from its sides, top and foot; and a round badge, Argon's
// logo, sits low on it, in the middle
const EDGE_R = 15;                                 // the cabinet's upright edges' radius
const EDGE_STEPS = 4;                              // each rounded edge drawn as this many flat faces (chosen: enough to look round)
const GRILLE_T = 8;                                // how far the grille stands proud of the cabinet's front, in its 220
const GRILLE_IN = 8;                               // the grille's edges in from the cabinet's sides, top and foot
const BADGE_R = 12, BADGE_UP = 30;                 // the badge's radius, and its middle up from the grille's foot
const BADGE_T = 2;                                 // how far the badge stands proud of the fabric
const cabinetMat = material(0xf4f4f2);             // white PVC
const grilleMat = material(0xbdbdbb);              // the grille's light grey fabric
const badgeMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 });

// The cabinet's plan: w wide and `deep` deep, from its back at y 0, its
// four upright edges rounded
function roundedPlan(w, deep) {
  const corners = [[w / 2 - EDGE_R, EDGE_R, -90], [w / 2 - EDGE_R, deep - EDGE_R, 0], [-w / 2 + EDGE_R, deep - EDGE_R, 90], [-w / 2 + EDGE_R, EDGE_R, 180]];
  return corners.flatMap(([cx, cy, from]) => Array.from({ length: EDGE_STEPS + 1 }, (_, k) => {
    const a = THREE.MathUtils.degToRad(from + 90 * k / EDGE_STEPS);
    return [cx + EDGE_R * Math.cos(a), cy + EDGE_R * Math.sin(a)];
  }));
}

// One speaker, its back's middle at the origin, facing out along y
export function fenrisA5() {
  const g = new THREE.Group(), { w, d, h } = FENRIS_A5, cabinetD = d - GRILLE_T;
  slab(roundedPlan(w, cabinetD), 0, h, cabinetMat, g);
  box({ from: [-w / 2 + GRILLE_IN, cabinetD, GRILLE_IN], to: [w / 2 - GRILLE_IN, d, h - GRILLE_IN] }, grilleMat, g);
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(BADGE_R * MM, BADGE_R * MM, BADGE_T * MM, 24), badgeMat);
  badge.rotation.x = Math.PI / 2;                                // its face towards the front
  badge.position.set(0, (GRILLE_IN + BADGE_UP) * MM, (d + BADGE_T / 2) * MM);
  g.add(badge);
  return g;
}
