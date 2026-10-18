// A daybed, as sofas.js gives it (its `daybed`): drawn as Futon Company's
// Drift is, rather than upholstered. An oak base on four legs with a futon
// on it; each end of the base, with its futon, hinged up as an arm (laid
// flat, it's a bed); an oak rail at the back on two posts; and, as a sofa,
// a back cushion against it.
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';

const oakMat = material(0xd2ad7c);                 // the base's satin-oiled oak (chosen)
const BACK_CUSHION = 150;                          // the back cushion's thickness (estimated)

// The base's length and the arms' tilt, for a daybed `S` at the width
// `sofaW` (the menu's slider): the arms keep the tilt they have at its own
// width (its w), and the base takes up the rest. As a bed they lie flat
export function daybedFrame(S, sofaW, asBed) {
  const { bedW, armLong } = S.daybed, ownBase = bedW - 2 * armLong;
  const tilt = Math.acos(Math.min(1, (S.w - ownBase) / (2 * armLong)));
  const base = sofaW - 2 * armLong * Math.cos(tilt);
  return { base, tilt: asBed ? 0 : tilt, width: asBed ? base + 2 * armLong : sofaW };
}

// The daybed, its middle at the origin, its front to -y, `d` deep and its
// back rail `h` high; `fabric` the futon's material
export function daybed(S, sofaW, asBed, fabric) {
  const g = new THREE.Group(), { futon, rail, leg, armLong, backRail } = S.daybed;
  const { base, tilt } = daybedFrame(S, sofaW, asBed), half = base / 2;
  const y0 = -S.d / 2, y1 = S.d / 2, top = S.seatH - futon, under = top - rail;
  for (const x of [-half, half - leg]) for (const y of [y0, y1 - leg]) box({ from: [x, y, 0], to: [x + leg, y + leg, under] }, oakMat, g);   // legs
  box({ from: [-half, y0, under], to: [half, y1, top] }, oakMat, g);              // the base's frame
  box({ from: [-half, y0, top], to: [half, y1, S.seatH] }, fabric, g);           // the futon on it
  for (const side of [-1, 1]) g.add(arm(side, half, top, tilt, S, fabric));
  // The back rail on its posts, at the back, up to h
  const { w: railW, h: railH, post } = backRail;
  for (const x of [-railW / 2, railW / 2 - post]) box({ from: [x, y1 - post, top], to: [x + post, y1, S.h - railH] }, oakMat, g);
  box({ from: [-railW / 2, y1 - post, S.h - railH], to: [railW / 2, y1, S.h] }, oakMat, g);
  if (!asBed) box({ from: [-half, y1 - post - BACK_CUSHION, S.seatH], to: [half, y1 - post, S.h] }, fabric, g);   // the back cushion
  return g;
}

// One arm, at the base's left (-1) or right (1) end: that end of the frame
// and the futon on it, hinged at the frame's top there and tilted up
function arm(side, half, top, tilt, S, fabric) {
  const g = new THREE.Group(), { futon, rail, armLong } = S.daybed, y0 = -S.d / 2, y1 = S.d / 2;
  const [x0, x1] = side > 0 ? [0, armLong] : [-armLong, 0];
  box({ from: [x0, y0, -rail], to: [x1, y1, 0] }, oakMat, g);
  box({ from: [x0, y0, 0], to: [x1, y1, futon] }, fabric, g);
  g.position.set(side * half * MM, top * MM, 0);
  g.rotation.z = side * tilt;                      // about the hinge, along the depth
  return g;
}
