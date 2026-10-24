// The custom kitchen island: a built-in one (asked for,
// 22 Oct 2026), in place of IKEA's TORNVIKEN (tornviken.js). Base units back
// to back, drawers on both the kitchen side (-x) and the window side (+x),
// under a grey oak effect worktop at the kitchen's height; the worktop runs
// on past the units at one end (-y, the TV wall's) for two ROSENTORP stools
// (rosentorp.js) facing along it. Its length, width and overhang come from
// sliders.
// Drawn round its middle, its long side along y, like TORNVIKEN;
// model/kitchen.js says where it stands.
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';
import { rosentorpChair, ROSENTORP } from './rosentorp.js';

// The user's: the worktop 2400 x 950, white gloss fronts (Clerkenwell
// gloss white, as the kitchen), units in 1000 widths with 16 end panels;
// the rest estimated
export const CUSTOM_ISLAND = {
  length: 2400, width: 950,     // the worktop, as it starts (the user's)
  overhang: 400,                // how far it runs past the units for the stools' knees, as it starts (chosen: 2400 leaves 2000, two units each side)
  top: 894, topT: 40,           // as the kitchen's worktop (KITCHEN.worktop, measured; its thickness estimated)
  unitMax: 1000,                // the units' widest (the user's)
  endPanelT: 16,                // end panels (the user's)
  proud: 20,                    // how far the worktop stands out past the fronts along each side (estimated, as the kitchen's)
  plinth: 150, plinthBack: 50,  // the plinth's height, and how far it's set back under the fronts (estimated)
  drawers: 3,                   // each unit's drawers (the user's)
  frontGap: 3,                  // between the drawer fronts (estimated)
  frontT: 18,                   // the fronts' thickness (estimated)
};
// The stools: pushed in, their fronts stop this short of the end panel;
// pulled out, as if sat at, their backs stand this far past the worktop's
// end, whatever the overhang (both chosen: pulled out at a 400 overhang
// it's 300 further out than pushed in, as TORNVIKEN's)
const STOOL_CLEAR = 20, STOOL_OUT_PAST_TOP = 370;

const worktopMat = material(0x9c958c);   // grey oak effect (the user's)
const carcassMat = material(0xf2f2ee);   // white

// The island, its fronts in `frontMat` (the kitchen's gloss white): a group
// whose body placeCustomIsland() draws to its size, and two stools, which it
// puts in
export function customIsland(frontMat) {
  const group = new THREE.Group(), body = new THREE.Group();
  group.add(body);
  return { group, body, frontMat, chairs: [rosentorpChair(), rosentorpChair()], size: null };
}

// Its size ({ length, width, overhang }, its worktop's) and where its stools are ('in',
// 'out' or 'none')
export function placeCustomIsland(island, size, chairsAt) {
  if (['length', 'width', 'overhang'].some(k => island.size?.[k] !== size[k])) {
    redraw(island, size);
    island.size = { ...size };
  }
  placeStools(island, size, chairsAt);
}

function redraw({ body, frontMat }, { length, width, overhang }) {
  for (const m of [...body.children]) { body.remove(m); m.geometry?.dispose(); }
  const { top, topT } = CUSTOM_ISLAND;
  box({ from: [-width / 2, -length / 2, top - topT], to: [width / 2, length / 2, top] }, worktopMat, body);
  drawUnits(body, frontMat, length, width, overhang);
}

// Where the units run, along y: from past the stools' end to the far end
const unitsFrom = (length, overhang) => -length / 2 + overhang;

// The units back to back between two end panels, a plinth under them, and
// each side's drawer fronts
function drawUnits(body, frontMat, length, width, overhang) {
  const { top, topT, endPanelT, proud, plinth, plinthBack, frontT } = CUSTOM_ISLAND;
  const y0 = unitsFrom(length, overhang), y1 = length / 2, under = top - topT;
  const face = width / 2 - proud;                     // the fronts' faces, either side of the middle
  for (const y of [y0, y1 - endPanelT]) box({ from: [-face, y, 0], to: [face, y + endPanelT, under] }, carcassMat, body);   // end panels
  const inner = face - frontT;                        // the carcasses' fronts, behind the doors
  box({ from: [-inner, y0 + endPanelT, plinth], to: [inner, y1 - endPanelT, under] }, carcassMat, body);    // the carcasses
  box({ from: [-inner + plinthBack, y0 + endPanelT, 0], to: [inner - plinthBack, y1 - endPanelT, plinth] }, carcassMat, body);   // plinth
  for (const side of [-1, 1]) drawFronts(body, frontMat, side, y0 + endPanelT, y1 - endPanelT, inner, face);
}

// One side's drawer fronts (side -1 the kitchen's, +1 the window's): the
// run from y0 to y1 split into equal units no wider than unitMax, each with
// its drawers, between the fronts' back and face (as distances from the middle)
function drawFronts(body, frontMat, side, y0, y1, back, face) {
  const { top, topT, unitMax, plinth, drawers, frontGap } = CUSTOM_ISLAND;
  const units = Math.max(1, Math.ceil((y1 - y0) / unitMax)), unitW = (y1 - y0) / units;
  const drawerH = (top - topT - plinth) / drawers;
  const [x0, x1] = side > 0 ? [back, face] : [-face, -back];
  for (let u = 0; u < units; u++) for (let d = 0; d < drawers; d++) {
    const ya = y0 + u * unitW, za = plinth + d * drawerH;
    box({ from: [x0, ya + frontGap / 2, za + frontGap / 2], to: [x1, ya + unitW - frontGap / 2, za + drawerH - frontGap / 2] }, frontMat, body);
  }
}

// The stools side by side under the worktop's end, facing along it (+y)
function placeStools({ group, chairs }, { length, width, overhang }, chairsAt) {
  const pushedIn = unitsFrom(length, overhang) - STOOL_CLEAR - ROSENTORP.depth / 2;
  const pulledOut = -length / 2 - STOOL_OUT_PAST_TOP + ROSENTORP.depth / 2;
  const y = chairsAt === 'out' ? pulledOut : pushedIn;
  chairs.forEach((chair, k) => {
    if (chairsAt === 'none') { group.remove(chair); return; }   // taken out, so the island's size leaves it out
    chair.position.set((k ? 1 : -1) * width / 4 * MM, 0, y * MM);
    group.add(chair);
  });
}
