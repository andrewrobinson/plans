// The kitchen as it is (a piece of flat_model.js): its units, worktop and
// wall units as rough blocks, the island, the office chair and the room's
// door.
import * as THREE from 'three';
import { MM, material, box, hinge } from '../kit/floor_kit.js';
import { officeChair } from '../work_chairs.js';
import { tornviken, placeTornviken, TORNVIKEN, ISLAND_LAYOUTS, ISLAND_CHAIRS } from '../tornviken.js';
import { customIsland, placeCustomIsland, CUSTOM_ISLAND } from '../custom_island.js';
import {
  ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, wallMat, FRIDGE_W, RECESS_FROM, KITCHEN_DEPTH, 
  KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, SINK_RECESS, DESK_TOP, DOOR_HINGE_AT, ROOM_DOOR, ROOM_DOOR_H, 
  ceilingMat
} from '../floor.js';
import { config, world } from './state.js';
import { frontFrom, frontGap } from './front_wall.js';
import { handleMat, islandMat, islandTopMat, kitchenMat, roomDoorMat, worktopMat } from './materials.js';


let deskChair = null;            // the office chair
let tornvikenIsland = null;              // the kitchen island (tornviken.js): its group, layouts and chairs
let builtInIsland = null;        // or the custom one (custom_island.js)
let islandGroup = null;          // the group holding both, which moves
const CHAIR_TURN = THREE.MathUtils.degToRad(-160);   // as it stands: facing back into the room, 20° towards the door
// The kitchen and island as they are, as rough blocks in their real colours
// for comparing with the cupboard options: an L of 590-deep units in the
// recess, along its back wall and the front wall, wall units above, and the
// loose island with its oak top. Mostly measured; estimates are noted below.
const KITCHEN = {
  from: RECESS_FROM,             // the left-wall run starts at the return wall, in the recess
  depth: KITCHEN_DEPTH, tall: 2400, wallUnits: [1450, 2400],
  worktop: 894,                  // to the top of the worktop, measured
  worktopT: 40, worktopProud: 20,   // the worktop's thickness, and how far it stands out past the units (estimated)
  wallDepth: 400,                // wall units, measured
  frontRunTo: SINK_RECESS.x1,    // the sink recess's edge
  counterPast: 75,               // the front-wall run (base units and worktop) carries on 75 past it, in front of the wall
  // The front-wall run stands at the back of the sink recess (SINK_RECESS)
  alcove: { x: [SINK_RECESS.x0, SINK_RECESS.x1], top: SINK_RECESS.top, depth: SINK_RECESS.depth },
  sink: { x: [-250, 550] },      // a stainless sink below the alcove (estimated)
  // The loose island (tornviken.js): its long edge 1010 from the door wall
  // and its short end 2941 from the back wall (measured)
  island: { x: 1010, y: 2941, width: TORNVIKEN.width, length: TORNVIKEN.length, top: TORNVIKEN.top },
};
{
  const { from, depth, worktop, worktopT, worktopProud, tall, wallUnits, wallDepth, frontRunTo, counterPast, island } = KITCHEN;
  const runEnd = frontRunTo + counterPast;                         // where the front-wall run ends
  const run = from + FRIDGE_W;                                     // the base run starts after the tall unit
  const X = KITCHEN_RECESS_BACK_WALL_X, F = X + depth;                                // the recess wall, and the units' fronts
  box({ from: [X, from, 0], to: [F, run, tall] }, kitchenMat, world);                 // tall fridge unit
  const back = ROOM_DEPTH + KITCHEN.alcove.depth, edge = KITCHEN.alcove.x[1];  // the sink recess's back wall, and its right edge
  box({ from: [X, run, 0], to: [F, back, worktop - worktopT] }, kitchenMat, world);         // base units along the left wall, on into the sink recess
  box({ from: [X, run, worktop - worktopT], to: [F + worktopProud, back, worktop] }, worktopMat, world);
  box({ from: [X, run, wallUnits[0]], to: [X + wallDepth, run + 600, wallUnits[1]] }, kitchenMat, world);         // wall units
  box({ from: [X, run + 1200, wallUnits[0]], to: [X + wallDepth, ROOM_DEPTH, wallUnits[1]] }, kitchenMat, world);          // (the extractor sits between), on to the corner
  box({ from: [F, back - depth, 0], to: [edge, back, worktop - worktopT] }, kitchenMat, world);                          // base units along the front wall, in the sink recess
  box({ from: [edge, back - depth, 0], to: [runEnd, ROOM_DEPTH, worktop - worktopT] }, kitchenMat, world);                         // and the 75 past it, in front of the wall
  box({ from: [F + worktopProud, back - depth - worktopProud, worktop - worktopT], to: [edge, back, worktop] }, worktopMat, world);
  box({ from: [edge, back - depth - worktopProud, worktop - worktopT], to: [runEnd, ROOM_DEPTH, worktop] }, worktopMat, world);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0xc4c8cc, roughness: 0.3, metalness: 0.6 });
  box({ from: [KITCHEN.sink.x[0], back - 520, worktop - 6], to: [KITCHEN.sink.x[1], back - 90, worktop + 2] }, sinkMat, world);  // sink, set into the worktop

  // The front wall, seen only from inside (like the ceiling), so the views from
  // outside still see in. It has the alcove above the sink.
  const { alcove } = KITCHEN;
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.4 });
  const face = (w, h, mat, x, z, y, turn) => {                    // a one-sided wall face, w x h mm, centred at (x, y, z)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), mat);
    m.position.set(x * MM, z * MM, y * MM);
    m.rotation.set(turn[0], turn[1], 0);
    m.receiveShadow = true;
    world.add(m);
  };
  const intoRoom = [0, Math.PI];                                   // a face looking back into the room
  const [a0, a1] = alcove.x, aTop = alcove.top, aBack = ROOM_DEPTH + alcove.depth;
  const d0 = DESK_RECESS.x0, dBack = ROOM_DEPTH + DESK_RECESS.depth;
  face(d0 - a1, CEILING_HEIGHT, wallMat, (a1 + d0) / 2, CEILING_HEIGHT / 2, ROOM_DEPTH, intoRoom);                        // right of it, to the desk recess
  face(ROOM_WIDTH - d0, CEILING_HEIGHT, wallMat, (d0 + ROOM_WIDTH) / 2, CEILING_HEIGHT / 2, dBack, intoRoom);                      // the desk recess's back
  face(DESK_RECESS.depth, CEILING_HEIGHT, wallMat, d0, CEILING_HEIGHT / 2, ROOM_DEPTH + DESK_RECESS.depth / 2, [0, Math.PI / 2]);   // its side
  face(ROOM_WIDTH - d0, DESK_RECESS.depth, ceilingMat, (d0 + ROOM_WIDTH) / 2, CEILING_HEIGHT, ROOM_DEPTH + DESK_RECESS.depth / 2, [Math.PI / 2, 0]); // its ceiling

  // The desk in the recess and its chair, rough blocks: a white desk 1600 wide
  // (filling the 1623 recess), 802 deep from the recess back and 830 high (all
  // measured), a monitor, and a black office chair in front (estimated)
  const deskMat = material(0xf2f1ee), blackMat = material(0x222222);
  const DESK_W = 1600, DESK_TOP_T = 25, deskFront = dBack - 802;   // DESK_TOP_T: its top's thickness (estimated)
  const dx0 = d0 + (ROOM_WIDTH - d0 - DESK_W) / 2, dx1 = dx0 + DESK_W;
  box({ from: [dx0, deskFront, DESK_TOP - DESK_TOP_T], to: [dx1, dBack, DESK_TOP] }, deskMat, world);                         // top
  for (const x of [dx0 + 50, dx1 - 90]) box({ from: [x, deskFront + 80, 0], to: [x + 40, dBack - 80, DESK_TOP - DESK_TOP_T] }, deskMat, world);  // legs
  // Two monitors (measured): screens 610 wide x 360 high, tops 550 above the
  // desk, spaced evenly across it
  const MON_W = 610, MON_H = 360, monTop = DESK_TOP + 550, gap = (DESK_W - 2 * MON_W) / 3;
  // They stand on a riser (measured): 1080 wide (centred on the desk), 230
  // deep, 100 high, black, starting 80 from the back of the recess. The screens
  // stay at their measured height, so the stands are shorter
  const RISER = { w: 1080, d: 230, h: 100, back: 80 };
  const rx0 = dx0 + (DESK_W - RISER.w) / 2, ry1 = dBack - RISER.back, ry0 = ry1 - RISER.d, onRiser = DESK_TOP + RISER.h;
  box({ from: [rx0, ry0, DESK_TOP], to: [rx0 + RISER.w, ry1, onRiser] }, blackMat, world);                           // riser
  for (const k of [0, 1]) {
    const m0 = dx0 + gap + k * (MON_W + gap), mid = m0 + MON_W / 2;
    box({ from: [m0, ry0 + 30, monTop - MON_H], to: [m0 + MON_W, ry0 + 60, monTop] }, blackMat, world);               // screen
    box({ from: [mid - 30, ry0 + 60, onRiser], to: [mid + 30, ry0 + 100, monTop - MON_H] }, blackMat, world);          // stand
    box({ from: [mid - 120, ry0 + 20, onRiser], to: [mid + 120, ry1 - 20, onRiser + 10] }, blackMat, world);           // foot, on the riser
  }
  // The office chair, swivelled round to face the room as it was for the
  // desk-chair photo, with you (the desk-chair view) sitting in it
  deskChair = officeChair();
  deskChair.position.set((dx0 + DESK_W / 2) * MM, 0, (deskFront - 350) * MM);   // centred on the desk, 350 out from it
  deskChair.rotation.y = CHAIR_TURN;
  world.add(deskChair);
  face(a1 - a0, CEILING_HEIGHT - aTop, wallMat, (a0 + a1) / 2, (aTop + CEILING_HEIGHT) / 2, ROOM_DEPTH, intoRoom);        // above it
  face(a1 - a0, aTop - worktop, tileMat, (a0 + a1) / 2, (worktop + aTop) / 2, aBack, intoRoom);   // the alcove's tiled back
  face(a1 - a0, worktop, wallMat, (a0 + a1) / 2, worktop / 2, aBack, intoRoom);                     // behind the units
  face(alcove.depth, aTop - worktop, tileMat, a1, (worktop + aTop) / 2, ROOM_DEPTH + alcove.depth / 2, [0, -Math.PI / 2]);   // its right side (the left is the kitchen recess's wall)
  face(alcove.depth, worktop, wallMat, a1, worktop / 2, ROOM_DEPTH + alcove.depth / 2, [0, -Math.PI / 2]);
  face(a1 - a0, alcove.depth, tileMat, (a0 + a1) / 2, aTop, ROOM_DEPTH + alcove.depth / 2, [Math.PI / 2, 0]);    // its top, facing down
  // The island, in a group of its own so it can be moved (see placeIsland)
  tornvikenIsland = tornviken(islandMat, islandTopMat);
  builtInIsland = customIsland(kitchenMat);
  islandGroup = new THREE.Group();
  world.add(islandGroup);
}

// Room door: 760 x 44 x 1978, hinged at (0, 1400), opens into the room
const roomHinge = hinge(0, DOOR_HINGE_AT, world);
box({ from: [-44, 0, 0], to: [0, ROOM_DOOR, ROOM_DOOR_H] }, roomDoorMat, roomHinge);
box({ from: [0, 600, 1000], to: [60, 720, 1020] }, handleMat, roomHinge, false);

// Where the island stands, in any option: where it is ('room'), or against
// the front wall between the sink and the desk, in place of the dresser or
// larder: its end against the wall and its long side running out into the
// room, against the end of the kitchen counter ('out', long side out), or
// its long side along the wall, centred there ('along', short side out); or
// not there at all ('none'), as the configuration names them.
const ISLAND_AT = ['room', 'along', 'out', 'none'];
const islandOnWall = () => config.pieces.island.in.livingRoom.at === 'along' || config.pieces.island.in.livingRoom.at === 'out';   // in the dresser or larder's place
// Out there, the island can be moved and turned from its sliders: where its
// middle is, and how far it's turned (0 to 180°). It starts where it is.
const ISLAND_HOME = { x: KITCHEN.island.x + KITCHEN.island.width / 2, y: KITCHEN.island.y + KITCHEN.island.length / 2, turn: 0 };
Object.assign(config.pieces.island.in.livingRoom, ISLAND_HOME);
// Which island it is: IKEA's TORNVIKEN or the custom one, and the size of
// the one shown (its top's)
const ISLAND_TYPES = ['ikea', 'custom'];
Object.assign(config.pieces.island.design.custom, { length: CUSTOM_ISLAND.length, width: CUSTOM_ISLAND.width });
function islandSize() {
  const { type, custom } = config.pieces.island.design;
  if (type === 'custom') return { width: custom.width, length: custom.length, top: CUSTOM_ISLAND.top };
  return { width: TORNVIKEN.width, length: TORNVIKEN.length, top: TORNVIKEN.top };
}
function islandSpot() {
  const { width, length } = islandSize(), move = config.pieces.island.in.livingRoom, { at } = move;
  if (at === 'room') {
    // The floor it covers, as a box square to the walls round it turned
    const a = THREE.MathUtils.degToRad(move.turn);
    const hx = (Math.abs(Math.cos(a)) * width + Math.abs(Math.sin(a)) * length) / 2;
    const hy = (Math.abs(Math.sin(a)) * width + Math.abs(Math.cos(a)) * length) / 2;
    const { x, y } = move;
    return { x0: Math.round(x - hx), x1: Math.round(x + hx), y0: Math.round(y - hy), y1: Math.round(y + hy), angle: a };
  }
  const along = at === 'along' ? length : width, out = at === 'along' ? width : length;
  const x0 = at === 'along' ? Math.round(frontFrom() + (frontGap() - along) / 2) : frontFrom();
  return { x0, x1: x0 + along, y0: ROOM_DEPTH - out, y1: ROOM_DEPTH, turned: at === 'along' };
}
function placeIsland() {
  const { x0, x1, y0, y1, turned, angle } = islandSpot(), { at, chairs } = config.pieces.island.in.livingRoom;
  islandGroup.position.set((x0 + x1) / 2 * MM, 0, (y0 + y1) / 2 * MM);
  islandGroup.rotation.y = angle ?? (turned ? Math.PI / 2 : 0);   // turned, its chairs' side faces out into the room
  islandGroup.visible = at !== 'none';
  const { type, layout, custom } = config.pieces.island.design;
  const [shown, hidden] = type === 'custom' ? [builtInIsland, tornvikenIsland] : [tornvikenIsland, builtInIsland];
  islandGroup.remove(hidden.group);   // taken out, so the island's size is the one shown
  islandGroup.add(shown.group);
  if (type === 'custom') placeCustomIsland(builtInIsland, custom, chairs);
  else placeTornviken(tornvikenIsland, layout, chairs, at === 'along');
}

// What the other pieces of the model use
export {
  CHAIR_TURN, ISLAND_AT, ISLAND_CHAIRS, ISLAND_LAYOUTS, ISLAND_TYPES, KITCHEN, deskChair, islandGroup, islandOnWall, islandSize, islandSpot,
  placeIsland, roomHinge
};
