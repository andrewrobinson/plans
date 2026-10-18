// The bedroom's bookcase: its measured sizes and its make, and how it's
// drawn. Its own file, as the garage's Billy is drawn as one too
// (billy.js), and the living room's bookshelf is this one; other_room.js
// says where it stands in the bedroom.
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

// Measured 15 Oct 2026 unless it says otherwise
export const BOOKCASE = {
  w: 1490, d: 290, h: 1220,        // dark brown, open shelves
  board: 18, back: 6, plinth: 70,  // its boards, back and plinth (estimated)
  shelfGap: 300,                   // shelves about this far apart: three in 1220 (from the photo)
};
const bookcaseMat = material(0x4a2e1c);

// The bookcase: sides, top, a bottom over a plinth, a thin back, and shelves
// about BOOKCASE.shelfGap apart between. Exported for the living room, where
// it can stand in place of the bench, and for the garage's shelving, in
// its own colour (`mat`).
export function bookcase({ w, d, h }, mat = bookcaseMat) {
  const g = new THREE.Group(), half = w / 2, { board: t, back, plinth } = BOOKCASE;
  box({ from: [-half, 0, 0], to: [-half + t, d, h] }, mat, g);                    // sides
  box({ from: [half - t, 0, 0], to: [half, d, h] }, mat, g);
  box({ from: [-half + t, 0, h - t], to: [half - t, d, h] }, mat, g);             // top
  box({ from: [-half + t, d - t, 0], to: [half - t, d, plinth] }, mat, g);        // plinth, at the front
  box({ from: [-half + t, 0, plinth], to: [half - t, d, plinth + t] }, mat, g);   // bottom
  box({ from: [-half + t, 0, plinth + t], to: [half - t, back, h - t] }, mat, g); // back
  const inside = h - t - (plinth + t), spaces = Math.max(1, Math.round(inside / BOOKCASE.shelfGap));
  for (let k = 1; k < spaces; k++) {
    const z = plinth + t + k * inside / spaces;
    box({ from: [-half + t, back, z - t / 2], to: [half - t, d, z + t / 2] }, mat, g);
  }
  return g;
}
