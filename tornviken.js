// The kitchen island: IKEA's TORNVIKEN (off-white, oak top), with its two
// ROSENTORP bar stools (rosentorp.js). Drawn round its middle, its long side along
// y, the chairs' side (the windows') towards +x and the shelves' (the
// kitchen's) towards -x. model/kitchen.js says where it stands.
//
// Four layouts (asked for, 22 Oct 2026):
// - 'standard', as IKEA builds it: open shelves along the kitchen side,
//   a back panel down the middle, knee room along the window side with a
//   footrest bar, both chairs side by side there.
// - 'facing', as a TORNVIKEN owner rebuilt theirs (photos): the shelves cut
//   in half across their length and set side by side, filling the whole
//   depth of the front-wall half of the island, with a pine panel closing
//   them off; the TV wall's half is knee room right through, a chair on
//   each side, facing (the halves as the user asked, 22 Oct 2026).
// - 'trolleys', as another owner has theirs (photo): IKEA's shelves, and
//   three LOSHULT trolleys (loshult.js) in the chairs' place on the window
//   side, which just fill the length between its legs; no chairs.
// - 'drawers', as a third owner has theirs (photo): IKEA's, with an EKBY
//   ALEX shelf with drawers (ekby_alex.js) hung under the top on the
//   kitchen side, behind the legs (it's longer than the gap between them).
//
// The photos are in images/tornvikken_options/.
import * as THREE from 'three';
import { MM, material, box } from './kit/floor_kit.js';
import { rosentorpChair, ROSENTORP } from './rosentorp.js';
import { loshultTrolley, LOSHULT } from './loshult.js';
import { ekbyAlex, EKBY_ALEX } from './ekby_alex.js';

export const ISLAND_LAYOUTS = ['standard', 'facing', 'trolleys', 'drawers'];
export const ISLAND_CHAIRS = ['in', 'out', 'none'];   // pushed in, pulled out as if sat at, or not there

// Its top 770 wide x 1260 long, 900 high (IKEA's sizes, and measured), which
// overhangs the base by 10 all round (measured); the rest estimated from
// IKEA's and the owner's photos
export const TORNVIKEN = {
  width: 770, length: 1260, top: 900, overhang: 10,
  topT: 40,                     // the top's thickness (estimated)
  leg: 50,                      // the legs' square (estimated)
  apron: 40,                    // the rail under the top, all round (estimated: the trolleys, 820 high, fit under it in the photo)
  endPanelBottom: 150,          // the ends' panels stop short of the floor (estimated)
  shelfDepth: 330,              // the shelves, front to back: dinner plates fit with room (estimated)
  shelves: [150, 450],          // the shelves' heights, bottom and middle; a review gives 260 clear on the lower (estimated)
  shelfT: 20, panelT: 18,       // the shelves' and the back or pine panel's thickness (estimated)
  footrest: 150,                // the footrest bar's height, in the standard layout (estimated)
};
// The chairs: pushed in, their fronts stop this short of what's under the
// island (or of each other, facing); pulled out, they're this much further
// out (both chosen)
const CHAIR_CLEAR = 20, CHAIR_OUT = 300;

const pineMat = material(0xd9a86a), footrestMat = material(0x222222);

// The island, `baseMat` and `topMat` its painted base and oak top (its
// shelves are oak too, IKEA's page says): every layout drawn, and two chairs, which placeTornviken() puts in and moves
export function tornviken(baseMat, topMat) {
  const group = new THREE.Group();
  const { width, length, top, topT } = TORNVIKEN;
  box({ from: [-width / 2, -length / 2, top - topT], to: [width / 2, length / 2, top] }, topMat, group);   // the oak top
  drawFrame(group, baseMat);
  const layouts = Object.fromEntries(ISLAND_LAYOUTS.map(name => [name, new THREE.Group()]));
  drawStandardShelves(layouts.standard, baseMat, topMat);
  drawFacingShelves(layouts.facing, topMat);
  drawStandardShelves(layouts.trolleys, baseMat, topMat, 'trolleys');
  drawTrolleys(layouts.trolleys);
  drawStandardShelves(layouts.drawers, baseMat, topMat, 'drawers');
  drawDrawers(layouts.drawers);
  const chairs = [rosentorpChair(), rosentorpChair()];   // placeTornviken() adds those shown
  return { group, layouts, chairs };
}

// Which layout shows, and where the chairs are ('in', 'out' or 'none'). With
// `againstWall` the island's kitchen side is against the wall, so no chair
// there
export function placeTornviken({ group, layouts, chairs }, layout, chairsAt, againstWall) {
  for (const [name, g] of Object.entries(layouts)) if (name === layout) group.add(g); else group.remove(g);   // only the one shown is in the scene
  const spots = chairSpots(layout, chairsAt);
  chairs.forEach((chair, k) => {
    const spot = spots[k];
    const shown = spot && chairsAt !== 'none' && !(againstWall && spot.side < 0);
    if (!shown) { group.remove(chair); return; }   // taken out, not hidden, so the island's size leaves it out
    chair.position.set(spot.x * MM, 0, spot.y * MM);
    chair.rotation.y = -spot.side * Math.PI / 2;     // facing across the island
    group.add(chair);
  });
}

// Where each chair's middle is, and which side it's on (+1 the window side,
// -1 the kitchen's)
function chairSpots(layout, chairsAt) {
  const { width, length } = TORNVIKEN;
  const out = chairsAt === 'out' ? CHAIR_OUT : 0;
  const centreFrom = knee => width / 2 - knee + CHAIR_CLEAR + out + ROSENTORP.depth / 2;   // the chair's middle, out from the island's
  if (layout === 'trolleys') return [];                      // the trolleys are in their place
  if (layout === 'facing') {
    const x = centreFrom(width / 2), y = -length / 4;         // across the knee-room half, meeting in the middle
    return [{ x, y, side: 1 }, { x: -x, y, side: -1 }];
  }
  const x = centreFrom(kneeRoom(layout));
  return [{ x, y: -length / 4, side: 1 }, { x, y: length / 4, side: 1 }];
}
// With shelves along the kitchen side: how deep they are, out to the back
// panel behind them, and the knee room left under the window side, past
// the back panel
const storageDepth = layout => ({
  drawers: TORNVIKEN.leg + EKBY_ALEX.depth,     // the shelves run back to the drawers' back
}[layout] ?? TORNVIKEN.shelfDepth);
const kneeRoom = layout => {
  const { width, overhang, panelT } = TORNVIKEN;
  return width - overhang - storageDepth(layout) - panelT;
};

// The four legs, the apron under the top, and the panelled ends
function drawFrame(g, mat) {
  const { width, length, top, topT, overhang, leg, apron, endPanelBottom, panelT } = TORNVIKEN;
  const x0 = overhang - width / 2, x1 = width / 2 - overhang, y0 = overhang - length / 2, y1 = length / 2 - overhang;
  const under = top - topT;
  for (const x of [x0, x1 - leg]) for (const y of [y0, y1 - leg]) box({ from: [x, y, 0], to: [x + leg, y + leg, under] }, mat, g);
  box({ from: [x0 + leg, y0, under - apron], to: [x1 - leg, y0 + panelT, under] }, mat, g);   // apron, along each end
  box({ from: [x0 + leg, y1 - panelT, under - apron], to: [x1 - leg, y1, under] }, mat, g);
  box({ from: [x0, y0 + leg, under - apron], to: [x0 + panelT, y1 - leg, under] }, mat, g);   // and along each side
  box({ from: [x1 - panelT, y0 + leg, under - apron], to: [x1, y1 - leg, under] }, mat, g);
  for (const y of [y0, y1 - panelT]) box({ from: [x0 + leg, y, endPanelBottom], to: [x1 - leg, y + panelT, under - apron] }, mat, g);   // the ends' panels
}

// IKEA's layout: shelves along the kitchen side, a back panel behind them,
// and a footrest bar for the chairs on the window side (none with the
// trolleys there); as deep as `layout` has them
function drawStandardShelves(g, mat, shelfMat, layout = 'standard') {
  const { width, length, overhang, leg, shelves, shelfT } = TORNVIKEN;
  const x0 = overhang - width / 2, back = x0 + storageDepth(layout), y0 = overhang + leg - length / 2, y1 = length / 2 - overhang - leg;
  for (const z of shelves) box({ from: [x0, y0, z], to: [back, y1, z + shelfT] }, shelfMat, g);
  drawBackPanel(g, mat, back, layout !== 'trolleys');
}
// The panel behind the shelves, its kitchen side at x `back`, and the
// chairs' footrest bar just past it (left out with `footrest` false)
function drawBackPanel(g, mat, back, withFootrest = true) {
  const { length, overhang, leg, top, topT, apron, shelves, panelT, footrest } = TORNVIKEN;
  const y0 = overhang + leg - length / 2, y1 = length / 2 - overhang - leg;
  box({ from: [back, y0, shelves[0]], to: [back + panelT, y1, top - topT - apron] }, mat, g);   // back panel
  if (withFootrest) box({ from: [back + panelT + 30, y0, footrest], to: [back + panelT + 50, y1, footrest + 20] }, footrestMat, g, false);   // footrest bar
}

// Another owner's layout: three trolleys side by side along the window
// side, between the legs, where the chairs would be
function drawTrolleys(g) {
  const { width, length, overhang, leg } = TORNVIKEN;
  const x1 = width / 2 - overhang, y0 = overhang + leg - length / 2;
  for (let k = 0; k < 3; k++) {
    const trolley = loshultTrolley();
    trolley.position.set((x1 - LOSHULT.depth / 2) * MM, 0, (y0 + (k + 0.5) * LOSHULT.width) * MM);
    g.add(trolley);
  }
}

// The drawers, hung under the top behind the kitchen side's legs, in the
// middle of its length
function drawDrawers(g) {
  const { width, overhang, leg, top, topT } = TORNVIKEN;
  const drawers = ekbyAlex();
  drawers.position.set((overhang + leg - width / 2 + EKBY_ALEX.depth / 2) * MM, (top - topT) * MM, 0);
  g.add(drawers);
}

// The owner's layout: the shelves right across one half (+y, the front
// wall's), closed off at the middle by a pine panel; knee room through the
// other half
function drawFacingShelves(g, shelfMat) {
  const { width, length, overhang, leg, top, topT, apron, shelves, shelfT, panelT } = TORNVIKEN;
  const x0 = overhang + leg - width / 2, x1 = width / 2 - overhang - leg, y1 = length / 2 - overhang - leg;
  for (const z of shelves) box({ from: [x0, 0, z], to: [x1, y1, z + shelfT] }, shelfMat, g);
  box({ from: [x0 - leg, -panelT, shelves[0]], to: [x1 + leg, 0, top - topT - apron] }, pineMat, g);   // pine panel
}
