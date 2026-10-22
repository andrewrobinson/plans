// The EKBY ALEX shelf with drawers (IKEA, white), hung under the kitchen
// island's top in its 'drawers' layout (tornviken.js). Drawn round its own
// centre, its top at 0 so it hangs down, its drawers' fronts towards -x.
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

const whiteMat = material(0xf4f3ef), shadowMat = material(0x9a9a96);

// IKEA's sizes: 1190 long, 290 deep, 115 high, two drawers. The rest
// estimated from the owner's photo
export const EKBY_ALEX = {
  length: 1190, depth: 290, height: 115,
  drawers: 2,
  frontT: 15,                  // the drawers' fronts' thickness (estimated)
  gap: 4,                      // between the fronts (estimated)
  grip: [200, 25],             // the cut-out grip at the top of each front: its length and depth (estimated)
};

export function ekbyAlex() {
  const g = new THREE.Group();
  const { length, depth, height, drawers, frontT, gap, grip } = EKBY_ALEX;
  const x0 = -depth / 2, x1 = depth / 2, y0 = -length / 2;
  box({ from: [x0 + frontT, y0, -height], to: [x1, -y0, 0] }, whiteMat, g);   // the case
  const frontL = (length - (drawers - 1) * gap) / drawers;
  for (let k = 0; k < drawers; k++) {
    const f0 = y0 + k * (frontL + gap), mid = f0 + frontL / 2;
    box({ from: [x0, f0, -height], to: [x0 + frontT, f0 + frontL, 0] }, whiteMat, g);   // front
    box({ from: [x0 - 1, mid - grip[0] / 2, -grip[1]], to: [x0 + frontT, mid + grip[0] / 2, 0] }, shadowMat, g, false);   // its grip
  }
  return g;
}
