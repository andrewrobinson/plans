// The daybed with a desk and bookcase: a white single daybed sold at B&Q
// (Abrihome's, and Matteo's the same), asked for 22 Oct 2026 to try in the
// lounge in place of the bench or of Billy lying. Along its back runs a
// bookcase; at one end, a tall column of shelves with a desk out from it
// (the desk's end), at the other a deep end unit, niches at its top; the
// bed between, with two drawers under it. No mattress comes with it; one's
// drawn, to judge it as a seat. flat_model.js says where it stands.
// https://www.diy.com/departments/single-daybed-with-bookcase-computer-desk-3ft-sofa-bed-with-storage-drawers-90-x-190-cm-for-living-room-white/7377605653003_BQ.prd
import * as THREE from 'three';
import { material, box } from './kit/floor_kit.js';

// The maker's drawing (in cm on it): 263 long, 114 deep, 100 high; the
// bed 190 × 90; the desk 74 high, 113 out from the back; the desk's column
// 38.5 wide inside; the drawers 88.5 long, 49 deep, 17 high; the rail over
// them 10 high; the end unit's niches 21.5 high
export const DESK_DAYBED = { w: 2630, d: 1140, h: 1000 };
const BED_L = 1900, BED_W = 900;
const DESK_H = 740, DESK_D = 1130;
const COLUMN_IN = 385;
const DRAWER = { l: 885, d: 490, h: 170 };
const RAIL_H = 100;
const NICHE_H = 215;
// Estimated from the drawing and the photos
const BOARD = 18;                                  // the boards' thickness
const BACK_D = DESK_DAYBED.d - BED_W;              // the bookcase behind the bed: 240, what the bed leaves of the depth
const COLUMN_W = COLUMN_IN + 2 * BOARD;            // the desk's column, its boards with it: 421
const END_W = DESK_DAYBED.w - COLUMN_W - BED_L;    // the end unit: 309, what's left of the length
const LEDGE = 350;                                 // the bookcase's bottom board, just above the mattress's foot
const BOOKCASE_SHELVES = [LEDGE, 520, 785];        // the bookcase's shelf tops, from the drawing's 15, 24.5 and 20 high spaces
const UPPER_DIVIDERS = [1 / 3, 2 / 3];             // the bookcase's upright boards, along the bed: in the top row
const LOWER_DIVIDERS = [620 / BED_L, 1 - 945 / BED_L];   // ...and the row below, from its 62 and 94.5 spaces
const UNDER_DESK_SHELF = 340;                      // the shelf under the desk, at the back: the drawing's 34
const DRAWER_GAP = 20;                             // the drawers off the floor, on their castors
const SLATS = { n: 14, w: 70, t: 18 };             // the bed's slats: how many, how wide, how thick
const SLAT_TOP = DRAWER_GAP + DRAWER.h + RAIL_H - 40;   // the slats' top, in the rails
const MATTRESS_T = 150;                            // the mattress drawn on it (none comes with it): chosen
const whiteMat = material(0xf4f3ef);
const slatMat = material(0xe0c9a0);                // the slats' pale pine
const mattressMat = material(0xd9d6cf);            // a plain light grey cover

// The daybed, its back's middle at the origin, facing out along y, its desk
// at the left end, or at the right (`deskAt`), as it can be put together
export function deskDaybed(deskAt = 'left') {
  const g = new THREE.Group(), { w, d, h } = DESK_DAYBED;
  // A board from x0 to x1 along it, from the desk's end (0) on, mirrored
  // for the desk at the right
  const flip = deskAt === 'right';
  const board = ([x0, y0, z0], [x1, y1, z1], mat = whiteMat) => {
    const [a, b] = flip ? [w / 2 - x1, w / 2 - x0] : [x0 - w / 2, x1 - w / 2];
    box({ from: [a, y0, z0], to: [b, y1, z1] }, mat, g);
  };
  deskEnd(board);
  bookcase(board);
  endUnit(board);
  bed(board);
  return g;
}

// The desk's end: the column of shelves at the back, full height, its outer
// side the daybed's end; and the desk top out from it, on a panel down to
// the floor at the bed's foot, open for your knees at the end
function deskEnd(board) {
  const { h } = DESK_DAYBED, inner = COLUMN_W - BOARD;
  board([0, 0, 0], [BOARD, BACK_D, h]);                                    // the column's outer side
  board([BOARD, 0, h - BOARD], [inner, BACK_D, h]);                        // its top
  board([BOARD, 0, UNDER_DESK_SHELF - BOARD], [inner, BACK_D, UNDER_DESK_SHELF]);   // the shelf under the desk
  board([0, 0, DESK_H - BOARD], [COLUMN_W, DESK_D, DESK_H]);               // the desk top
  board([inner, 0, 0], [COLUMN_W, DESK_D, DESK_H - BOARD]);               // the panel under it, the bed's foot end
  board([inner, 0, DESK_H], [COLUMN_W, BACK_D, h]);                        // the column's side above the desk
}

// The bookcase behind the bed: its back, its shelves and its upright boards
function bookcase(board) {
  const { h } = DESK_DAYBED, x0 = COLUMN_W, x1 = COLUMN_W + BED_L;
  board([x0, 0, LEDGE - BOARD], [x1, BOARD, h]);                           // the back
  for (const top of [...BOOKCASE_SHELVES, h]) board([x0, 0, top - BOARD], [x1, BACK_D, top]);
  board([x0, BACK_D - BOARD, 0], [x1, BACK_D, LEDGE - BOARD]);             // the bed's back rail, under it
  const [, middle, upper] = BOOKCASE_SHELVES;
  for (const f of UPPER_DIVIDERS) board([x0 + f * BED_L, 0, upper], [x0 + f * BED_L + BOARD, BACK_D, h - BOARD]);
  for (const f of LOWER_DIVIDERS) board([x0 + f * BED_L, 0, middle], [x0 + f * BED_L + BOARD, BACK_D, upper - BOARD]);
}

// The end unit, the full depth and height, the niches at its top open
// to the bed
function endUnit(board) {
  const { w, d, h } = DESK_DAYBED, x0 = w - END_W, nicheFloor = h - BOARD - NICHE_H;
  board([w - BOARD, 0, 0], [w, d, h]);                                     // its outer side
  board([x0, 0, 0], [x0 + BOARD, d, nicheFloor]);                          // its inner side, below the niches
  board([x0, 0, h - BOARD], [w - BOARD, d, h]);                            // its top
  board([x0 + BOARD, 0, nicheFloor - BOARD], [w - BOARD, d, nicheFloor]);  // the niches' floor
  board([x0 + BOARD, d - BOARD, 0], [w - BOARD, d, nicheFloor - BOARD]);   // its front
}

// The bed: the front rail over the two drawers, the slats, and a mattress
function bed(board) {
  const { d } = DESK_DAYBED, x0 = COLUMN_W, x1 = COLUMN_W + BED_L, railFoot = DRAWER_GAP + DRAWER.h;
  board([x0, d - BOARD, railFoot], [x1, d, railFoot + RAIL_H]);            // the front rail
  for (let k = 0; k < 2; k++) {                                            // the drawers, side by side, their fronts flush with the rail
    const from = x0 + (BED_L / 2 - DRAWER.l) / 2 + k * BED_L / 2;
    board([from, d - DRAWER.d, DRAWER_GAP], [from + DRAWER.l, d, railFoot]);
  }
  const pitch = (BED_L - SLATS.w) / (SLATS.n - 1);
  for (let k = 0; k < SLATS.n; k++) board([x0 + k * pitch, BACK_D, SLAT_TOP - SLATS.t], [x0 + k * pitch + SLATS.w, d - BOARD, SLAT_TOP], slatMat);
  board([x0, BACK_D, SLAT_TOP], [x1, d - BOARD, SLAT_TOP + MATTRESS_T], mattressMat);
}
