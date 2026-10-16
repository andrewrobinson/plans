// The living room: its fittings (kitchen, desk, chair, island), its cupboard
// options, their 2D dimensions and cutting list, the things to store, its
// settings and address, its controls and views. Its walls, door frame and
// windows are in floor.js; the engine is in kit/. index.html loads it.
//
// How it works: `state` holds every setting. The controls change it through
// changeSettings(), which puts every control in step (syncControls()) and
// calls show(). show() builds the option chosen (its build() in OPTIONS),
// then the bench, what's above it, the dresser or larder and the sofa round
// it; redrawAround() then redraws the dimensions, colours, things to store,
// cutting list and the address. The address (ADDRESS) is read at the start
// and written on every change, so a link brings the same settings back.
//
// In order, below: the materials and the room's fittings (kitchen, desk,
// chair, island); the settings (state); the corner cupboard's shelves; the
// parts of options 7 to 9; above the bench (shelves and TV); the colours;
// option 9's base cupboards and the dresser; the larders, island, sofa and
// front wall; options 10 and 11's corner cupboard and side bookshelf; the
// options (OPTIONS); the 2D dimensions, cuts and cutting list; the things to
// store; switching options, the address and the controls; the views and
// scenes; and starting the page.
import * as THREE from 'three';
import { MM, createStage, material, box, slab, part, hinge, skewHinge, RAL, oakBoards,
  number, within, radio, sizes, writeFields, readFields, setValueAt,
  narrow, popMenus, createDrawers, resetButton, shareButton, screenshotButton, workOffline, flatViews,
  dimLine, dimLabel, chain, cutViews } from './kit/floor_kit.js';
import * as ViewKit from './kit/view_kit.js';
import * as SceneKit from './kit/scene_kit.js';
import { drawOtherRoom, bookcase, pineCupboard, otherRoomControls, otherRoomPieces, OTHER_ROOM_START, BOOKCASE_ON_ADDRESS, CUPBOARD_ON_ADDRESS, MIRROR_ON_ADDRESS, NEW_CUPBOARD_ON_ADDRESS, showNewCupboard, BOOKCASE_SIZES, SIZE_LABEL, QUARTER_TURN, OTHER_ROOM_ADDRESS, MIRROR_ADDRESS, RECESS_FRONTS_ADDRESS, BED_SPOTS } from './other_room.js';
import { drawWickerBench, wickerBenches, wickerBenchControls, WICKER_BENCH_START, WICKER_BENCH_ADDRESS } from './wicker_bench.js';
import { drawShoeRack, shoeRack, shoeRackControls, SHOE_RACK_START, SHOE_RACK_ADDRESS } from './shoe_rack.js';
import { drawGarage, garagePieces, garageControls, GARAGE, GARAGE_CORNER, GARAGE_START, GARAGE_ADDRESS } from './garage.js';
import { floor, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, WALL_THICKNESS, wallMat, floorMat, FRIDGE_W, RECESS_FROM, KITCHEN_SETBACK, KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, WALL_BETWEEN_RECESSES, SINK_RECESS, DESK_TOP, DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, JAMB, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat, ceilingMat, ceiling, downlightMat, OUTER, OTHER_ROOM, OTHER_ROOM_CORNER, bedroomHinge, carpetMat, CARPET_COLOURS, HALLWAY, hallway, ENTRANCE, flatDoorHinge, outsideDoorHinge } from './floor.js';

// Room coordinates in mm: x along the back wall from the left wall, y from
// the back wall towards the front, z up. The scene is y-up in metres:
// room (x, y, z) -> scene (x, z, y). kit/floor_kit.js has the stage
// (renderer, cameras, lights) and the helpers that draw in these mm.

const { scene, renderer, camera, controls, flatCamera, flatControls } = createStage(document.getElementById('view'));
let flat = false;

const carcassMat = material(0xc9a877);
const shelfMat = material(0xd6bc8f);
const doorMat = material(0xd8bd92);
const handleMat = material(0x333333);
// The cupboard doors' handles: bars from 950 to 1250 off the floor, 20 wide
// and standing 22 off the door, near its free edge (chosen, not measured)
const HANDLE_BOTTOM = 950, HANDLE_TOP = 1250;
// The cupboard doors stand DOOR_GAP clear of the cupboard's edges, the floor,
// the ceiling and each other (chosen), so a pair across a span is
// (span - 3 * DOOR_GAP) / 2 wide
const DOOR_GAP = 3;
const benchMat = material(0xe8d9bf);

// A named board from room corner (x0, y0, z0) to (x1, y1, z1), in mm: a box
// for the cutting list. Every cupboard is built of these, with rear panels
// against the walls, so its inside doesn't lean on them. The rule (see
// CUT_RULE): rear panels and ends run full height; in a corner the back-wall
// rear panel runs through and the left-wall one stops at it; tops, bottoms
// and dividers fit between them; shelves fit inside; doors cover the front
// edges, DOOR_GAP clear.
function board(name, x0, y0, z0, x1, y1, z1, g, mat = carcassMat) {
  return part(name, box({ from: [x0, y0, z0], to: [x1, y1, z1] }, mat, g));
}

scene.add(floor);

let deskChair = null;            // the office chair
let islandGroup = null;          // the kitchen island
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
  // The loose island: its top 770 wide x 1260 long, 900 high, its long edge
  // 1010 from the door wall and its short end 2941 from the back wall; the top
  // overhangs the base by 10 all round (all measured)
  island: { x: 1010, y: 2941, width: 770, length: 1260, top: 900, overhang: 10, topT: 40 },   // topT: the top's thickness (estimated)
};
const kitchenMat = new THREE.MeshStandardMaterial({ color: 0xf5f4ef, roughness: 0.18 });   // Clerkenwell Gloss White
const worktopMat = material(0xcfc3b0);                                                     // light stone laminate
const islandMat = material(0xede6d5);                                                      // the island's painted white, warmer than the kitchen
const islandTopMat = material(0xd6a562);                                                   // the island's oak top
{
  const { from, depth, worktop, worktopT, worktopProud, tall, wallUnits, wallDepth, frontRunTo, counterPast, island } = KITCHEN;
  const runEnd = frontRunTo + counterPast;                         // where the front-wall run ends
  const run = from + FRIDGE_W;                                     // the base run starts after the tall unit
  const X = KITCHEN_RECESS_BACK_WALL_X, F = X + depth;                                // the recess wall, and the units' fronts
  box({ from: [X, from, 0], to: [F, run, tall] }, kitchenMat, scene);                 // tall fridge unit
  const back = ROOM_DEPTH + KITCHEN.alcove.depth, edge = KITCHEN.alcove.x[1];  // the sink recess's back wall, and its right edge
  box({ from: [X, run, 0], to: [F, back, worktop - worktopT] }, kitchenMat, scene);         // base units along the left wall, on into the sink recess
  box({ from: [X, run, worktop - worktopT], to: [F + worktopProud, back, worktop] }, worktopMat, scene);
  box({ from: [X, run, wallUnits[0]], to: [X + wallDepth, run + 600, wallUnits[1]] }, kitchenMat, scene);         // wall units
  box({ from: [X, run + 1200, wallUnits[0]], to: [X + wallDepth, ROOM_DEPTH, wallUnits[1]] }, kitchenMat, scene);          // (the extractor sits between), on to the corner
  box({ from: [F, back - depth, 0], to: [edge, back, worktop - worktopT] }, kitchenMat, scene);                          // base units along the front wall, in the sink recess
  box({ from: [edge, back - depth, 0], to: [runEnd, ROOM_DEPTH, worktop - worktopT] }, kitchenMat, scene);                         // and the 75 past it, in front of the wall
  box({ from: [F + worktopProud, back - depth - worktopProud, worktop - worktopT], to: [edge, back, worktop] }, worktopMat, scene);
  box({ from: [edge, back - depth - worktopProud, worktop - worktopT], to: [runEnd, ROOM_DEPTH, worktop] }, worktopMat, scene);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0xc4c8cc, roughness: 0.3, metalness: 0.6 });
  box({ from: [KITCHEN.sink.x[0], back - 520, worktop - 6], to: [KITCHEN.sink.x[1], back - 90, worktop + 2] }, sinkMat, scene);  // sink, set into the worktop

  // The front wall, seen only from inside (like the ceiling), so the views from
  // outside still see in. It has the alcove above the sink.
  const { alcove } = KITCHEN;
  const tileMat = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.4 });
  const face = (w, h, mat, x, z, y, turn) => {                    // a one-sided wall face, w x h mm, centred at (x, y, z)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), mat);
    m.position.set(x * MM, z * MM, y * MM);
    m.rotation.set(turn[0], turn[1], 0);
    m.receiveShadow = true;
    scene.add(m);
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
  box({ from: [dx0, deskFront, DESK_TOP - DESK_TOP_T], to: [dx1, dBack, DESK_TOP] }, deskMat, scene);                         // top
  for (const x of [dx0 + 50, dx1 - 90]) box({ from: [x, deskFront + 80, 0], to: [x + 40, dBack - 80, DESK_TOP - DESK_TOP_T] }, deskMat, scene);  // legs
  // Two monitors (measured): screens 610 wide x 360 high, tops 550 above the
  // desk, spaced evenly across it
  const MON_W = 610, MON_H = 360, monTop = DESK_TOP + 550, gap = (DESK_W - 2 * MON_W) / 3;
  // They stand on a riser (measured): 1080 wide (centred on the desk), 230
  // deep, 100 high, black, starting 80 from the back of the recess. The screens
  // stay at their measured height, so the stands are shorter
  const RISER = { w: 1080, d: 230, h: 100, back: 80 };
  const rx0 = dx0 + (DESK_W - RISER.w) / 2, ry1 = dBack - RISER.back, ry0 = ry1 - RISER.d, onRiser = DESK_TOP + RISER.h;
  box({ from: [rx0, ry0, DESK_TOP], to: [rx0 + RISER.w, ry1, onRiser] }, blackMat, scene);                           // riser
  for (const k of [0, 1]) {
    const m0 = dx0 + gap + k * (MON_W + gap), mid = m0 + MON_W / 2;
    box({ from: [m0, ry0 + 30, monTop - MON_H], to: [m0 + MON_W, ry0 + 60, monTop] }, blackMat, scene);               // screen
    box({ from: [mid - 30, ry0 + 60, onRiser], to: [mid + 30, ry0 + 100, monTop - MON_H] }, blackMat, scene);          // stand
    box({ from: [mid - 120, ry0 + 20, onRiser], to: [mid + 120, ry1 - 20, onRiser + 10] }, blackMat, scene);           // foot, on the riser
  }
  // The office chair, swivelled round to face the room as it was for the
  // desk-chair photo, with you (the desk-chair view) sitting in it
  deskChair = new THREE.Group();
  deskChair.position.set((dx0 + DESK_W / 2) * MM, 0, (deskFront - 350) * MM);   // centred on the desk, 350 out from it
  deskChair.rotation.y = CHAIR_TURN;
  scene.add(deskChair);
  const cx = 0, cy = 0;                                          // the chair's own centre
  // Seat at 590 and headrest top at 1400 (measured); the rest estimated
  const SEAT = 590, CHAIR_TOP = 1400;
  box({ from: [cx - 250, cy - 250, SEAT - 70], to: [cx + 250, cy + 250, SEAT] }, blackMat, deskChair);                   // seat
  box({ from: [cx - 230, cy - 280, SEAT], to: [cx + 230, cy - 230, CHAIR_TOP - 250] }, blackMat, deskChair);             // back
  box({ from: [cx - 140, cy - 290, CHAIR_TOP - 230], to: [cx + 140, cy - 240, CHAIR_TOP] }, blackMat, deskChair);       // headrest
  for (const side of [-1, 1]) {                                                                  // armrests, making it 600 wide (measured)
    box({ from: [cx + side * 300 - (side > 0 ? 50 : 0), cy - 200, SEAT + 200], to: [cx + side * 300 + (side < 0 ? 50 : 0), cy + 150, SEAT + 230] }, blackMat, deskChair);
    box({ from: [cx + side * 275 - 10, cy - 40, SEAT], to: [cx + side * 275 + 10, cy, SEAT + 200] }, blackMat, deskChair);
  }
  box({ from: [cx - 25, cy - 25, 80], to: [cx + 25, cy + 25, SEAT - 70] }, blackMat, deskChair);                         // column
  box({ from: [cx - 320, cy - 25, 40], to: [cx + 320, cy + 25, 80] }, blackMat, deskChair);                              // base
  box({ from: [cx - 25, cy - 320, 40], to: [cx + 25, cy + 320, 80] }, blackMat, deskChair);
  face(a1 - a0, CEILING_HEIGHT - aTop, wallMat, (a0 + a1) / 2, (aTop + CEILING_HEIGHT) / 2, ROOM_DEPTH, intoRoom);        // above it
  face(a1 - a0, aTop - worktop, tileMat, (a0 + a1) / 2, (worktop + aTop) / 2, aBack, intoRoom);   // the alcove's tiled back
  face(a1 - a0, worktop, wallMat, (a0 + a1) / 2, worktop / 2, aBack, intoRoom);                     // behind the units
  face(alcove.depth, aTop - worktop, tileMat, a1, (worktop + aTop) / 2, ROOM_DEPTH + alcove.depth / 2, [0, -Math.PI / 2]);   // its right side (the left is the kitchen recess's wall)
  face(alcove.depth, worktop, wallMat, a1, worktop / 2, ROOM_DEPTH + alcove.depth / 2, [0, -Math.PI / 2]);
  face(a1 - a0, alcove.depth, tileMat, (a0 + a1) / 2, aTop, ROOM_DEPTH + alcove.depth / 2, [Math.PI / 2, 0]);    // its top, facing down
  // The island, in a group of its own so it can be moved (see placeIsland):
  // drawn round its middle, its long side along y
  const { width, length, top, overhang, topT } = island;
  islandGroup = new THREE.Group();
  scene.add(islandGroup);
  box({ from: [overhang - width / 2, overhang - length / 2, 0], to: [width / 2 - overhang, length / 2 - overhang, top - topT] }, islandMat, islandGroup);   // the base, under the top
  box({ from: [-width / 2, -length / 2, top - topT], to: [width / 2, length / 2, top] }, islandTopMat, islandGroup);                                        // the oak top
}

// Room door: 760 x 44 x 1978, hinged at (0, 1400), opens into the room
const roomHinge = hinge(0, DOOR_HINGE_AT, scene);
const roomDoorMat = material(0x8fb3d9);
box({ from: [-44, 0, 0], to: [0, ROOM_DOOR, ROOM_DOOR_H] }, roomDoorMat, roomHinge);
box({ from: [0, 600, 1000], to: [60, 720, 1020] }, handleMat, roomHinge, false);

// ---------------------------------------------------------------------------
// The settings: everything the menus set and the address saves, in one
// place. The cupboards' sizes keep the short names the drawing code and
// room_dimensions.md use; a function that draws reads the ones it needs at
// its top, as `const { T, R, BOARD } = state;`. What's worked out from the
// settings isn't kept here (the heights above the bench, the TV's width and
// height, where the dresser stands), and nor is the view (kit/view_kit.js).
// ---------------------------------------------------------------------------
const state = {
  option: 0,                       // the option on show, its index in OPTIONS (not its number, as the list starts at 7): option 10 to start, set below OPTIONS
  // The left-wall cupboard's depth from the wall: 0 (none), or 300 to 800 in
  // 10s. Option 8 needs it, so it's unavailable at 0. Everything
  // along the back wall starts from it. 600 to start, as option 7 has when
  // chosen.
  T: 600,
  R: 330,                          // the rear-wall cupboards' and bench's depth from the back wall: 300 to 800
  F: 1200,                         // the left-wall cupboard's front: 1200, or 1329 right up to the door frame. Its inside leg along the left wall is F - R
  // The thickness of the boards (MDF or chipboard) every cupboard is built
  // from, 12 to 25: the same for all of them. Cupboards' outside sizes stay
  // as set, so thicker boards take room from the inside.
  BOARD: 18,
  LEG: 600,                        // option 7's back-wall leg, inside along the back wall: 400 to 1200. Its door is LEG - BOARD - 2 * DOOR_GAP wide. Option 8 keeps 700
  LEG_D: 600,                      // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench, which stays R deep
  L_SHELVES: { back: [600, 1200, 1800], left: [600, 1200, 1800] },   // ...and its shelf tops in the back-wall leg (with the inside corner) and the left-wall leg
  WARD: 900,                       // option 9's full-height double-door cupboard on the back wall: 600 to 1400 wide
  WARD_D: 600,                     // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench and tower, which stay R deep
  TOWER: 400,                      // ...then an open shelving tower: 0 to 600 wide (0 for none)
  CORNER_W: 800,                   // options 10 and 11's full-height corner cupboard, along the back wall: 500 to 1200. Option 10's doors are (CORNER_W - BOARD - 3 * DOOR_GAP) / 2 wide each
  CORNER_D: 650,                   // ...and out along the left wall, in place of F: 0 to 1329 (the door frame). Too shallow (cornerTooShallow()), it isn't built
  SIDE_SHELF: false,               // option 10's full-height side bookshelf, between the corner cupboard and the TV: drawn or not
  SIDE_W: 400,                     // ...its width along the back wall, 200 to 800, the cupboard's side included (it shares it)
  SIDE_D: 330,                     // ...and its depth from the back wall, 150 to 800
  benchOn: true,                   // the bench drawn, with what's above it; off, the back wall's bare
  bookshelfOn: false,              // the bedroom's bookcase on the back wall in place of the bench (and what's above it), which is then off whatever benchOn says
  bookshelfMove: null,             // ...and moved round the room from there: { x, y, turn } (see BACK_WALL_PIECES), or null where it starts
  pineOn: false,                   // the bedroom's pine cupboard likewise, in place of the bench
  pineMove: null,                  // ...and moved round the room from there, as the bookshelf
  BENCH: 780,                      // the bench's height: 700, 780, 800 or 900
  above: 3,                        // above the bench: 0 nothing, 1 shelves, 2 TV, 3 TV and shelves, 4 TV and top shelf
  shelfDepth: 250,                 // the shelves above the bench: 150 to 400 deep
  tv: 75,                          // the TV's size in inches, one of TV_SIZES
  colours: { floor: 0, cupboard: 4, wall: 0, woodwork: 0, dresser: 0, carpet: 0 },   // a RAL code or finish for each of COLOUR_TARGETS, 0 for its default: AI Olive cupboards
  shelfWood: 0,                    // the shelves' wood, which of SHELF_WOODS
  frontPiece: 'dresser',           // on the front wall between the sink and the desk: one of FRONT_PIECES
  // The dresser's, larder's and sofa's sizes, and which larder and sofa:
  // these until set from dressers.js, larders.js and sofas.js below
  dresser: { w: 1320, h: 2100, baseD: 400, baseH: 900, upperD: 290, drawer: 160 },
  larder: { key: '', size: { w: 1100, h: 1950, d: 510 } },
  sofa: { key: '', front: 1900, size: { w: 1690, d: 1000, h: 920 },     // key '' for none; front: its front from the TV wall
          move: null },          // ...or moved and turned from there: { x, y, turn } (see sofaSpot), or null where it starts
  island: { at: 'room', move: null },   // where the island is, one of ISLAND_AT; out there, where its middle is and how far it's turned (ISLAND_HOME to start)
  // The things to store: shown or not, which of PACKINGS, where (0 by the
  // middle window, 1 in the corner cupboard, 2 moved by hand), and each
  // thing's { x, y, turned, z } (set up with STORED below)
  stored: { shown: false, packing: 0, where: 0, spots: [] },
  otherRoom: structuredClone(OTHER_ROOM_START),   // the bedroom's furniture: where it stands and its sizes (other_room.js)
  wickerBench: structuredClone(WICKER_BENCH_START),   // the hallway's wicker bench: its sizes, and in which rooms and where (wicker_bench.js)
  shoeRack: structuredClone(SHOE_RACK_START),         // the shoe rack at the foot of the stairs: its sizes and where it stands (shoe_rack.js)
  garage: structuredClone(GARAGE_START),              // Sean, Billy, BillyChest and the rest, in the garage: where each stands (garage.js)
};

const baseDoorCount = () => Math.max(1, Math.round((ROOM_WIDTH - state.T - state.WARD - state.TOWER) / 450));

// ---------------------------------------------------------------------------
// Shelves inside the corner cupboard. Options record them with cupShelf() as
// they're built; drawCupShelves() draws them, and when the things to store
// are shown, cuts each one back where something stands under it that needs
// more height than it leaves: a shelfless bay up to where shelves are fine.
// ---------------------------------------------------------------------------
const LIFT = 50;                   // clear above a stored thing, to lift it in over the cupboard's bottom board
let cupShelves = [];               // { poly, top, mat }: plan outline and top, BOARD thick
let cupCuts = [];                  // what drawCupShelves() last cut: { top, from, to, axis, things }
const cupShelfGroup = new THREE.Group();
cupShelfGroup.userData.cupShelves = true;   // so the cutting list knows them in the bedroom's copy too
const spanOf = (poly, axis) => [Math.min(...poly.map(p => p[axis])), Math.max(...poly.map(p => p[axis]))];
const rectPoly = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
function cupShelf(poly, top, mat) {
  const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
  if (x1 > x0 && y1 > y0) cupShelves.push({ poly, top, mat });  // none with no left-wall cupboard
}

// The part of polygon `poly` with its x (axis 0) or y (axis 1) on one side
// of `at`: below it when `below`, else above it
function clipPoly(poly, axis, at, below) {
  const inside = p => below ? p[axis] <= at : p[axis] >= at;
  const out = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    if (inside(p)) out.push(p);
    if (inside(p) !== inside(q)) {
      const t = (at - p[axis]) / (q[axis] - p[axis]);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}

// Draw the recorded shelves. A shelf is cut across its short way, over the
// things standing under it that are within LIFT of its underside (a 10 gap
// either side); what's left under 100 long is left out.
function drawCupShelves() {
  const { BOARD, stored } = state;
  cupShelfGroup.traverse(o => o.geometry?.dispose());
  cupShelfGroup.clear();
  cupCuts = [];
  for (const { poly, top, mat } of cupShelves) {
    const [sx0, sx1] = spanOf(poly, 0), [sy0, sy1] = spanOf(poly, 1);
    // Things up through it (not those resting on it, or above it)
    const clash = !stored.shown ? [] : STORED.map((s, k) => k).filter(k => {
      const { x, y, z } = stored.spots[k], [w, d] = storedSize(k);
      return z < top - BOARD && Math.max(z, BOARD) + STORED[k].h + LIFT > top - BOARD && x < sx1 && x + w > sx0 && y < sy1 && y + d > sy0;
    });
    if (!clash.length) {
      part(`Shelf at ${top}`, slab(poly, top - BOARD, top, mat, cupShelfGroup));
      continue;
    }
    const axis = sx1 - sx0 >= sy1 - sy0 ? 0 : 1;                // along the shelf's long way
    const from = Math.min(...clash.map(k => stored.spots[k][axis ? 'y' : 'x'])) - 10;
    const to = Math.max(...clash.map(k => stored.spots[k][axis ? 'y' : 'x'] + storedSize(k)[axis])) + 10;
    cupCuts.push({ top, axis, from: Math.max(from, axis ? sy0 : sx0), to: Math.min(to, axis ? sy1 : sx1), things: clash });
    for (const piece of [clipPoly(poly, axis, from, true), clipPoly(poly, axis, to, false)]) {
      if (piece.length < 3) continue;
      const [a, b] = spanOf(piece, axis);
      if (b - a >= 100) part(`Shelf at ${top}, cut back`, slab(piece, top - BOARD, top, mat, cupShelfGroup));
    }
  }
}

// What the cuts come to, for the menu: which shelves are cut back, over
// what, and the lowest shelf left over the bay
function cupCutText() {
  if (!cupCuts.length) return '';
  const { BOARD } = state;
  const lower = name => name.charAt(0).toLowerCase() + name.slice(1).replace(/ \(\d\)$/, '');
  const tops = [...new Set(cupCuts.map(c => c.top))].sort((a, b) => a - b);
  const parts = tops.map(top => {
    const cuts = cupCuts.filter(c => c.top === top);
    const where = cuts.map(c => `${c.axis ? 'y' : 'x'} ${Math.round(c.from)}-${Math.round(c.to)}`).join(' and ');
    const over = [...new Set(cuts.flatMap(c => c.things))].map(k => lower(STORED[k].name));
    return `at ${top} over ${where} (for the ${over.join(', ')})`;
  });
  // The lowest uncut shelf over the tallest thing in the bay
  const tallest = Math.max(...cupCuts.flatMap(c => c.things.map(k => STORED[k].h)));
  const bay = [...new Set(cupCuts.flatMap(c => c.things))].map(k => [state.stored.spots[k], storedSize(k)]);
  const overBay = ({ poly }) => {
    const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
    return bay.some(([{ x, y }, [w, d]]) => x < x1 && x + w > x0 && y < y1 && y + d > y0);
  };
  const kept = cupShelves.filter(s => s.top > Math.max(...tops) && overBay(s)).map(s => s.top).sort((a, b) => a - b)[0];
  return ` Shelves cut back for a shelfless bay: ${parts.join('; ')}.` +
    (kept ? ` Above the bay the ${kept} shelf stays: ${kept - 2 * BOARD} clear from the cupboard floor, ${kept - 2 * BOARD - tallest} over the ${tallest}-high ${lower(STORED[STORED.findIndex(s => s.h === tallest)].name)}.`
          : '');
}

// ---------------------------------------------------------------------------
// Parts of options 7 to 9
// ---------------------------------------------------------------------------

// Left-wall cupboard door: (F - back - 2 gaps) x (H - 2 gaps) on x T to
// T + BOARD, y back + DOOR_GAP to F - DOOR_GAP, hinged at y = F
function tallDoor(g, back = state.R) {                          // back: where the door's run starts, normally R
  const { T, F, BOARD } = state;
  if (T === 0) return null;
  const h = hinge(T, F, g);
  const w = F - back - 2 * DOOR_GAP;
  part('Left-wall leg door', box({ from: [0, -w - DOOR_GAP, DOOR_GAP], to: [BOARD, -DOOR_GAP, CEILING_HEIGHT - DOOR_GAP] }, doorMat, h));
  box({ from: [BOARD, -w + 17, HANDLE_BOTTOM], to: [BOARD + 22, -w + 37, HANDLE_TOP] }, handleMat, h, false); // handle near the free edge
  return h;
}

// The full-height L of option 7: legs inside LEG along the back wall (x 0 to
// T + LEG, LEG_D deep) and F - LEG_D along the left wall (y LEG_D to F), one
// space round the corner, bench from x = T + LEG, R deep. Returns the
// back-wall leg door's hinge.
function fullHeightL(g) {
  const { T, R, F, BOARD: B, BENCH, LEG, LEG_D, L_SHELVES } = state;
  const E = T + LEG, Dl = LEG_D;                                 // Dl: the back-wall leg's depth
  box({ from: [E, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, g);
  board('Back-wall rear panel', 0, 0, 0, E, B, CEILING_HEIGHT, g);                    // runs through the corner
  board('Left-wall rear panel', 0, B, 0, B, T ? F : Dl, CEILING_HEIGHT, g);            // stops at it; with no left-wall leg, the back-wall leg's side
  board('Left-wall leg front end', B, F - B, 0, T, F, CEILING_HEIGHT, g);
  board('Back-wall leg end', E - B, B, 0, E, Dl, CEILING_HEIGHT, g);
  board('Back-wall leg top', B, B, CEILING_HEIGHT - B, E - B, Dl, CEILING_HEIGHT, g);              // tops and bottoms, between them
  board('Left-wall leg top', B, Dl, CEILING_HEIGHT - B, T, F - B, CEILING_HEIGHT, g);
  board('Back-wall leg bottom', B, B, 0, E - B, Dl, B, g);
  board('Left-wall leg bottom', B, Dl, 0, T, F - B, B, g);
  for (const top of L_SHELVES.back) cupShelf(rectPoly(B, B, E - B, Dl - B), top, carcassMat);
  if (T) for (const top of L_SHELVES.left) cupShelf(rectPoly(B, Dl - B, T - B, F - B), top, carcassMat);
  const second = hinge(E, Dl + B, g);
  part('Back-wall leg door', box({ from: [T + B + DOOR_GAP - E, -B, DOOR_GAP], to: [-DOOR_GAP, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, second));
  box({ from: [T + B + 20 - E, 0, HANDLE_BOTTOM], to: [T + B + 40 - E, 22, HANDLE_TOP] }, handleMat, second, false);
  return second;
}

// Option 8's diagonal front, from (T, F) to (T + 700, R): its length, its
// direction (ux, uy) from the left end, each door's width, and the angle
// for skewHinge() at the left end.
function diagonal() {
  const { R, F } = state;
  const dx = 700, dy = R - F;
  const length = Math.hypot(dx, dy);
  const ux = dx / length, uy = dy / length;
  return { length, ux, uy, door: (length - 3 * DOOR_GAP) / 2, angle: THREE.MathUtils.radToDeg(Math.atan2(-uy, ux)) };
}

// The gap between option 8's left door, opened to 90°, and the open room
// door (y 1400-1444, x 0-760); below 0 they clash. The open door points
// straight out from the front, so sample its outline there.
function roomDoorGap() {
  const { T, F, BOARD } = state;
  const { ux, uy, door } = diagonal();
  const ox = -uy, oy = ux;                                      // out of the cupboard
  let nearest = Infinity;
  for (let a = DOOR_GAP; a <= DOOR_GAP + door; a += 1) {
    for (const b of [0, -BOARD]) {                                 // the door's two faces, BOARD apart
      const x = T + a * ox + b * ux, y = F + a * oy + b * uy;
      if (y >= DOOR_HINGE_AT && y <= DOOR_HINGE_AT + 44) nearest = Math.min(nearest, x);
    }
  }
  return nearest === Infinity ? Infinity : Math.round(nearest - 760);
}

// Option 8's carcass: rear panels and ends as option 7's, and a top and
// bottom between them that run out to the diagonal front
function diagonalCarcass(g) {
  const { T, R, F, BOARD: B } = state;
  const E = T + 700;
  board('Back-wall rear panel', 0, 0, 0, E, B, CEILING_HEIGHT, g);                // runs through the corner
  board('Left-wall rear panel', 0, B, 0, B, F, CEILING_HEIGHT, g);                // stops at it
  board('Left-wall end', B, F - B, 0, T, F, CEILING_HEIGHT, g);
  board('Back-wall end', E - B, B, 0, E, R, CEILING_HEIGHT, g);
  const across = (x, y) => [[x, R + (E - x) * (F - R) / 700], [T + (F - y) * 700 / (F - R), y]];   // where x and y meet the front
  const outline = [[B, B], [E - B, B], ...across(E - B, F - B), [B, F - B]];
  part('Top', slab(outline, CEILING_HEIGHT - B, CEILING_HEIGHT, carcassMat, g));
  part('Bottom', slab(outline, 0, B, carcassMat, g));
}

// Option 8's shelves, at 600, 1200 and 1800. They stop SHELF_SETBACK behind
// the diagonal front: that line meets x = E - B and y = F - B
function diagonalShelves() {
  const { T, F, BOARD: B } = state;
  const E = T + 700, { ux, uy } = diagonal();
  const SHELF_SETBACK = 25;
  const nx = uy, ny = -ux;                                   // unit normal, pointing into the cupboard
  const c = T * nx + F * ny + SHELF_SETBACK;                  // the line n · p = c
  const inside = [[B, B], [E - B, B], [E - B, (c - (E - B) * nx) / ny], [(c - (F - B) * ny) / nx, F - B], [B, F - B]];
  for (const top of [600, 1200, 1800]) cupShelf(inside, top, shelfMat);
}

// Option 8's pair of doors across the diagonal front, each
// (length - 3 * DOOR_GAP) / 2: the left one hinged at (T, F), the right at
// (E, R). Returns their hinges.
function diagonalDoors(g) {
  const { T, R, F, BOARD: B } = state;
  const E = T + 700, { door, angle } = diagonal();
  const left = skewHinge(T, F, angle, -1, g);
  part('Diagonal door', box({ from: [DOOR_GAP, 0, DOOR_GAP], to: [DOOR_GAP + door, B, CEILING_HEIGHT - DOOR_GAP] }, doorMat, left));
  box({ from: [door - 40, B, HANDLE_BOTTOM], to: [door - 20, B + 22, HANDLE_TOP] }, handleMat, left, false);
  const right = skewHinge(E, R, angle - 180, 1, g);
  part('Diagonal door', box({ from: [DOOR_GAP, -B, DOOR_GAP], to: [DOOR_GAP + door, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, right));
  box({ from: [door - 40, -B - 22, HANDLE_BOTTOM], to: [door - 20, -B, HANDLE_TOP] }, handleMat, right, false);
  return [left, right];
}

// Option 9's carcass: the double-door cupboard on the back wall (x T to
// T + WARD, WARD_D deep) and option 7's left-wall leg behind it, with their
// shelves
function wardCarcass(g) {
  const { T, F, BOARD: B, WARD, WARD_D: Dw } = state;          // Dw: the double-door cupboard's depth
  const E = T + WARD;
  // Rear panels: the back wall's runs through the corner, the left wall's
  // stops at it (and with no left-wall leg, is the cupboard's side)
  board('Back-wall rear panel', 0, 0, 0, E, B, CEILING_HEIGHT, g);
  board('Left-wall rear panel', 0, B, 0, B, T ? F : Dw, CEILING_HEIGHT, g);
  // The left-wall leg, as in option 7, behind the deeper cupboard; with no
  // left-wall cupboard these draw nothing
  board('Left-wall leg front end', B, F - B, 0, T, F, CEILING_HEIGHT, g);
  board('Left-wall leg top', B, Dw, CEILING_HEIGHT - B, T, F - B, CEILING_HEIGHT, g);
  board('Left-wall leg bottom', B, Dw, 0, T, F - B, B, g);
  // The double-door cupboard on the back wall
  board('Cupboard end', E - B, B, 0, E, Dw, CEILING_HEIGHT, g);
  board('Cupboard top', B, B, CEILING_HEIGHT - B, E - B, Dw, CEILING_HEIGHT, g);
  board('Cupboard bottom', B, B, 0, E - B, Dw, B, g);
  for (const top of [600, 1200, 1800]) {
    cupShelf(rectPoly(B, B, E - B, Dw - B), top, carcassMat);
    if (T) cupShelf(rectPoly(B, Dw - B, T - B, F - B), top, carcassMat);   // none with no left-wall leg
  }
}

// Option 9's pair of doors across T + B + DOOR_GAP to E - DOOR_GAP, meeting
// in the middle. Returns their hinges.
function wardDoors(g) {
  const { T, BOARD: B, WARD, WARD_D: Dw } = state;
  const E = T + WARD;
  const w = (WARD - B - 3 * DOOR_GAP) / 2;
  const left = hinge(T + B + DOOR_GAP, Dw + B, g);
  left.userData.dir = -1;
  part('Cupboard door', box({ from: [0, -B, DOOR_GAP], to: [w, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, left));
  box({ from: [w - 40, 0, HANDLE_BOTTOM], to: [w - 20, 22, HANDLE_TOP] }, handleMat, left, false);
  const right = hinge(E - DOOR_GAP, Dw + B, g);
  part('Cupboard door', box({ from: [-w, -B, DOOR_GAP], to: [0, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, right));
  box({ from: [20 - w, 0, HANDLE_BOTTOM], to: [40 - w, 22, HANDLE_TOP] }, handleMat, right, false);
  return [left, right];
}

// ---------------------------------------------------------------------------
// Above the bench, on the clear back wall from x0 to W: nothing, three
// shelves, a TV, or a TV with shelves either side. Each option's clearFrom()
// gives x0, where its cupboards above the bench end (benchFrom() is where the
// bench itself starts). Returns a sentence for
// the summary.
// ---------------------------------------------------------------------------
const SHELF_T = 25, TV_GAP = 150;
// Standard TV sizes in inches, with each TV's overall width and height in mm,
// from LG UK's size guide (lg.com/uk, "How to measure and read TV sizes").
// The slider steps through them; 75" (1680 x 960) to start with.
const TV_SIZES = [[32, 720, 440], [40, 900, 500], [42, 930, 540], [43, 970, 570], [48, 1070, 620],
  [50, 1120, 650], [55, 1230, 710], [60, 1340, 770], [65, 1450, 830], [70, 1570, 910], [75, 1680, 960],
  [77, 1710, 980], [83, 1840, 1050], [85, 1890, 1080], [86, 1930, 1110]];
// The TV's width and height, and heights above the bench, set from the TV
// size and BENCH by benchHeights(). With
// the bench at 780 and a 65" TV: shelves at 1200, 1550, 1900; the TV from 1100
// to 1930; with the TV, a bottom shelf at 1000 under it and a top one at 2080
// over it, both right across, and a middle one at 1550 beside it. A TV over
// 65" pushes the top shelf up to keep it 150 clear, and if that leaves under
// 60 below the ceiling there's no top shelf.
let TV_W, TV_H, SHELF_TOPS, TV_BOTTOM, TV_SHELF_TOPS, TV_MIDDLE_SHELF;
function benchHeights() {
  const { BENCH } = state;
  [, TV_W, TV_H] = TV_SIZES.find(([inches]) => inches === state.tv);
  SHELF_TOPS = [BENCH + 420, BENCH + 770, BENCH + 1120];
  TV_BOTTOM = BENCH + 320;
  const top = Math.max(BENCH + 1300, TV_BOTTOM + TV_H + TV_GAP);
  TV_SHELF_TOPS = [BENCH + 220, ...(top <= CEILING_HEIGHT - 60 ? [top] : [])];
  TV_MIDDLE_SHELF = BENCH + 770;
}
benchHeights();
const tvMat = material(0x1a1a1a);
const screenMat = new THREE.MeshStandardMaterial({ color: 0x0c1824, roughness: 0.3, metalness: 0.2 });

function shelves(x0, x1, g, tops = SHELF_TOPS) {
  for (const top of tops) box({ from: [x0, 0, top - SHELF_T], to: [x1, state.shelfDepth, top] }, shelfMat, g);
}

let tvAt = null;                   // the TV's middle, room [x, y, height], or where it would be
function benchWall(x0, g) {
  const { R, above, shelfDepth } = state;
  const span = ROOM_WIDTH - x0;
  tvAt = [(x0 + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
  if (above === 0 || span <= 0) return '';                         // nothing, or no bench (the current room)
  return benchWallItems(x0, span, g) +
    (shelfDepth > R && above !== 2 ? ` The shelves stand ${shelfDepth - R} proud of the ${R}-deep bench.` : '');
}

function benchWallItems(x0, span, g) {
  const { above, shelfDepth, tv } = state;
  if (above === 1) {
    shelves(x0, ROOM_WIDTH, g);
    return ` Above the bench: three ${shelfDepth}-deep shelves, ${span} long, at ${SHELF_TOPS.join(', ')}.`;
  }
  if (span < TV_W + 20) {                                         // the TV doesn't fit beside the cupboards
    const none = ` Above the bench: no room for the ${tv}" TV, ${TV_W} wide, only ${span} of clear wall.`;
    if (above === 2) return none;
    const tops = above === 4 ? TV_SHELF_TOPS.slice(1) : TV_SHELF_TOPS;
    if (!tops.length) return none;
    shelves(x0, ROOM_WIDTH, g, tops);
    return none + ` ${shelfDepth}-deep shelves right across, ${span} long, at ${tops.join(' and ')}.`;
  }
  const tx = x0 + (span - TV_W) / 2;                               // centred on the clear wall
  tvAt = [tx + TV_W / 2, 0, TV_BOTTOM + TV_H / 2];
  box({ from: [tx, 0, TV_BOTTOM], to: [tx + TV_W, 50, TV_BOTTOM + TV_H] }, tvMat, g);
  box({ from: [tx + 15, 50, TV_BOTTOM + 15], to: [tx + TV_W - 15, 52, TV_BOTTOM + TV_H - 15] }, screenMat, g, false);
  const tvText = ` Above the bench: ${String(tv).startsWith('8') ? 'an' : 'a'} ${tv}" TV (${TV_W} × ${TV_H}), centred on the ${span} of clear wall, from ${TV_BOTTOM} to ${TV_BOTTOM + TV_H}.`;
  const [below, over] = TV_SHELF_TOPS;
  const noTop = ` No room for a shelf above it: it would be within 60 of the ceiling.`;
  if (above === 2) return tvText;
  if (above === 4) {
    if (!over) return tvText + noTop;
    shelves(x0, ROOM_WIDTH, g, [over]);
    return tvText + ` A ${shelfDepth}-deep shelf right across above it, ${span} long, at ${over}.`;
  }
  shelves(x0, ROOM_WIDTH, g, TV_SHELF_TOPS);
  const shelfText = over
    ? ` ${shelfDepth}-deep shelves right across, ${span} long, below it at ${below} and above it at ${over}.`
    : ` A ${shelfDepth}-deep shelf right across below it, ${span} long, at ${below}.` + noTop;
  const side = Math.floor((span - TV_W) / 2 - TV_GAP);
  if (side < 200) return tvText + shelfText + ` No room for a middle shelf beside it: only ${Math.max(side, 0)} each side.`;
  shelves(x0, x0 + side, g, [TV_MIDDLE_SHELF]);
  shelves(ROOM_WIDTH - side, ROOM_WIDTH, g, [TV_MIDDLE_SHELF]);
  return tvText + shelfText + ` A middle shelf at ${TV_MIDDLE_SHELF} either side, ${side} long, ${TV_GAP} clear of the TV.`;
}

// ---------------------------------------------------------------------------
// The room's colours. The RAL table and the oak floor's texture are in
// kit/floor_kit.js.
// What each colour box changes, and the model's own colours when it's empty
// The room's own finishes, chosen by name. Numbered below 1000 so they share
// the address with RAL codes. Their screen colours are approximate too.
const FINISHES = {
  1: { name: 'Crown Gallery White', hex: '#DCDEDB' },              // Crown K9710C
  2: { name: 'Dulux Pure Brilliant White', hex: '#F8F8F6' },       // shown as a clean white, as it looks in the room
  3: { name: 'Howdens oak 3-strip', hex: '#D29A50', oak: true },    // SDH3220, as in the room photos; nearest RAL 1002
  // From the cupboards in an AI-generated picture of the room, corrected for
  // its dim, warm light; nearest RAL 7032 Pebble grey
  4: { name: 'AI Olive', hex: '#B8B0A4' },
  // Howdens Clerkenwell Gloss White (FRK24), as on the kitchen units: a crisp,
  // neutral high-gloss white, a hair warmer than the woodwork in the room photo
  5: { name: 'Clerkenwell Gloss White', hex: '#F5F4EF', gloss: true },
  // The blinds' fabric, Bella Brittany (blockout, The Fabric Box): a dusty
  // blue, averaged from the maker's swatch photo; nearest RAL 7040 / 7001
  6: { name: 'Bella Brittany', hex: '#85A3B4' },
  // The window panes as they show on screen (#B8C0BF in the island view), as
  // a solid colour that shows the same under the room's light
  7: { name: 'Blinds as drawn', hex: '#BECEDB' },
  // The kitchen's own colours, as drawn: its light stone laminate worktop,
  // and the island's warmer painted white
  8: { name: 'Kitchen worktop', hex: '#CFC3B0' },
  9: { name: 'Kitchen island', hex: '#EDE6D5' },
  10: { name: 'Kitchen island top', hex: '#D6A562' },                // the island's honey oak top, as a plain colour
  // The carpet (bedroom and stairs): Dormouse from the maker's swatch, the
  // colour from the room photos, that made lighter, and the colour from the
  // doorway photo, as it's drawn (floor.js's CARPET_COLOURS)
  11: { name: 'Cormar Dormouse', hex: CARPET_COLOURS.dormouse },
  12: { name: 'Carpet from the photos', hex: CARPET_COLOURS.fromPhotos },
  13: { name: 'Carpet, lighter', hex: CARPET_COLOURS.lighter },
  14: { name: 'Carpet from the doorway photo', hex: CARPET_COLOURS.doorwayPhoto },
};
const colourOf = code => RAL[code] ? { name: RAL[code][0], hex: RAL[code][1] } : FINISHES[code];

// Each box's default (`room`) is the room as it is now: its own finishes. The
// cupboards (and the bench with them) default to whatever the woodwork is.
const dresserMat = material(0xc9a877), dresserDoorMat = material(0xd8bd92);   // set by setRal() below
const COLOUR_TARGETS = {
  floor: { mats: [floorMat], room: 3 },
  cupboard: { mats: [carcassMat, doorMat, benchMat], follows: 'woodwork' },
  wall: { mats: [wallMat], room: 1 },
  woodwork: { mats: [frameMat, roomDoorMat], room: 2 },
  dresser: { mats: [dresserMat, dresserDoorMat], follows: 'cupboard' },
  carpet: { mats: [carpetMat], room: 14 },
};


// Set one target to a RAL code or finish (0 for its default). Returns the
// colour's name, or null if the code isn't known.
// The code a target actually shows: its own, else its default
function shownCode(target) {
  const { room, follows } = COLOUR_TARGETS[target];
  return state.colours[target] || room || (follows ? shownCode(follows) : 0);
}

function setRal(target, code) {
  const { mats } = COLOUR_TARGETS[target];
  if (code && !colourOf(code)) return null;
  state.colours[target] = code || 0;
  // Every target resolves to a colour: its own, its room finish, or the one it follows
  const colour = colourOf(shownCode(target));
  mats.forEach(m => {
    const oak = colour.oak && target === 'floor';
    m.map = oak ? oakBoards() : null;
    m.color.set(oak ? 0xffffff : colour.hex);
    // High-gloss finishes shine; the bench top stays matt
    m.roughness = colour.gloss && m !== benchMat ? 0.18 : 0.8;
    m.needsUpdate = true;
  });
  // Anything that follows this target, and is on its default, follows it now
  for (const [other, t] of Object.entries(COLOUR_TARGETS)) {
    if (t.follows === target && !state.colours[other]) setRal(other, 0);
  }
  return code ? colour.name : '';
}
for (const target of Object.keys(COLOUR_TARGETS)) setRal(target, state.colours[target]);   // the room as it is now, with AI Olive cupboards

// ---------------------------------------------------------------------------
// Parts for option 9
// ---------------------------------------------------------------------------
const glowMat = new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd28a, emissiveIntensity: 1.2 });
const oakMat = material(0xc8a26b);
const PLINTH = 100, TOP_T = 30;                                  // kick plinth height, bench top thickness

// Base cupboards along the bench, x0 to W: a recessed plinth, doors about 450
// wide hinged in pairs, and an oak top at BENCH. Returns how many doors.
function baseCupboards(x0, parent) {
  const { R, BOARD, BENCH } = state;
  const g = new THREE.Group();                                   // the bench, to leave out when it's off
  g.userData.bench = true;
  parent.add(g);
  box({ from: [x0, 0, PLINTH], to: [ROOM_WIDTH, R - BOARD, BENCH - TOP_T] }, carcassMat, g);   // carcass behind the doors
  box({ from: [x0, 0, 0], to: [ROOM_WIDTH, R - 60, PLINTH] }, carcassMat, g);              // plinth, set back 60
  box({ from: [x0, 0, BENCH - TOP_T], to: [ROOM_WIDTH, R, BENCH] }, oakMat, g);            // top
  const span = ROOM_WIDTH - x0;
  const n = Math.max(1, Math.round(span / 450));
  const w = (span - DOOR_GAP * (n + 1)) / n;
  for (let k = 0; k < n; k++) {
    const d0 = x0 + DOOR_GAP + k * (w + DOOR_GAP);
    box({ from: [d0, R - BOARD, PLINTH + DOOR_GAP], to: [d0 + w, R, BENCH - TOP_T - DOOR_GAP] }, doorMat, g);
    // Doors open in pairs, so handles sit by the edges that meet
    const hx = k % 2 === 0 ? d0 + w - 40 : d0 + 20;
    box({ from: [hx, R, BENCH - TOP_T - 180], to: [hx + 20, R + 22, BENCH - TOP_T - 40] }, handleMat, g, false);
  }
  return n;
}

// The dresser on the front wall between the sink and the desk, a bit like
// the Cotswold Company's Chester dresser: 1320 wide overall (the top
// overhangs its body by 20 each side), centred in the 1415
// between the end of the kitchen counter (75 past the alcove) and the desk
// recess, 2100 high. Up to 900 it's 400
// deep: two drawers over two doors, under a wooden top. Above, it's 290 deep,
// with three open shelves and a top that overhangs a little. These are the
// starting sizes; its sliders change them. Painted parts
// are in the dresser colour (the cupboards' unless chosen), the top and
// shelves in the shelf colour.
// Drawn in every option but the current room.
// The dresser's sizes can be changed from its sliders: [key, slider id, lowest,
// highest, step]. It stays centred on the wall, and its upper part is never
// deeper than its base.
const DRESSER_SLIDERS = [['w', 'dresserW', 900, 1415, 5], ['h', 'dresserH', 1500, 2400, 10],
  ['baseD', 'dresserBaseD', 300, 600, 10], ['baseH', 'dresserBaseH', 700, 1000, 10], ['upperD', 'dresserUpperD', 150, 600, 10]];
// Start with the dresser chosen in dressers.js (a link keeps its own)
const DRESSERS = window.ROOM_DRESSERS?.list ?? {};
for (const [k] of DRESSER_SLIDERS) state.dresser[k] = DRESSERS[window.ROOM_DRESSERS?.start]?.[k] ?? state.dresser[k];
function placeDresser() {
  state.dresser.upperD = Math.min(state.dresser.upperD, state.dresser.baseD);
  const from = KITCHEN.frontRunTo + KITCHEN.counterPast, gap = DESK_RECESS.x0 - from;   // 1415 clear
  state.dresser.x0 = Math.round(from + (gap - state.dresser.w) / 2);
  state.dresser.x1 = state.dresser.x0 + state.dresser.w;
}
placeDresser();
function dresser(g) {
  // Its width is overall, with the top's 20 overhang each side, so the body is 40 narrower
  const { h, baseD, baseH, upperD, drawer } = state.dresser, x0 = state.dresser.x0 + 20, x1 = state.dresser.x1 - 20, w = state.dresser.w - 40;
  const yb = ROOM_DEPTH - baseD, yu = ROOM_DEPTH - upperD;                         // the fronts of the base and the upper part
  const doorTop = baseH - TOP_T - drawer - 3;                    // the doors stop under the drawers
  box({ from: [x0, yb + 18, 0], to: [x1, ROOM_DEPTH, baseH - TOP_T] }, dresserMat, g);      // base, behind its fronts
  box({ from: [x0 - 15, yb - 15, baseH - TOP_T], to: [x1 + 15, ROOM_DEPTH, baseH] }, shelfMat, g);   // wooden top, 15 proud
  const half = (w - 9) / 2;                                      // two drawers and two doors, 3 apart
  for (const k of [0, 1]) {
    const f0 = x0 + 3 + k * (half + 3), f1 = f0 + half, mid = (f0 + f1) / 2;
    box({ from: [f0, yb, doorTop + 3], to: [f1, yb + 18, baseH - TOP_T - 3] }, dresserDoorMat, g);   // drawer front
    box({ from: [mid - 50, yb - 20, doorTop + drawer / 2 - 8], to: [mid + 50, yb, doorTop + drawer / 2 + 8] }, handleMat, g, false);
    box({ from: [f0, yb, PLINTH], to: [f1, yb + 18, doorTop] }, dresserDoorMat, g);       // door, over a plinth
    const hx = k === 0 ? f1 - 50 : f0 + 30;                      // knobs by the edges that meet
    box({ from: [hx, yb - 20, doorTop - 160], to: [hx + 20, yb, doorTop - 140] }, handleMat, g, false);
  }
  box({ from: [x0 + 30, yb + 40, 0], to: [x1 - 30, yb + 58, PLINTH] }, dresserMat, g);   // plinth, set back
  box({ from: [x0, yu, baseH], to: [x0 + 18, ROOM_DEPTH, h - 40] }, dresserMat, g);         // upper sides
  box({ from: [x1 - 18, yu, baseH], to: [x1, ROOM_DEPTH, h - 40] }, dresserMat, g);
  box({ from: [x0 + 18, ROOM_DEPTH - 12, baseH], to: [x1 - 18, ROOM_DEPTH, h - 40] }, dresserMat, g);   // back
  box({ from: [x0 - 20, yu - 20, h - 40], to: [x1 + 20, ROOM_DEPTH, h] }, dresserMat, g);   // top, 20 proud
  const shelfTops = [1, 2, 3].map(k => Math.round(baseH + k * (h - 40 - baseH) / 4));   // evenly up the upper part
  for (const top of shelfTops) box({ from: [x0 + 18, yu, top - 22], to: [x1 - 18, ROOM_DEPTH - 12, top] }, shelfMat, g);
  return ` A dresser on the front wall between the sink and the desk (x ${state.dresser.x0}-${state.dresser.x1}): ${state.dresser.w} wide overall (its body ${w}), ${h} high, ${baseD} deep up to ${baseH} ` +
    `(two drawers over two doors, under a wooden top), then ${upperD} deep with three open shelves.`;
}

// ---------------------------------------------------------------------------
// Larders, from larders.js. Drawn as the dresser is, with its back on
// the front wall from x0, facing into the room. Its parts stack from the
// floor up. Returns a description.
const LARDERS = window.ROOM_LARDERS?.list ?? {};
state.larder.key = Object.hasOwn(LARDERS, window.ROOM_LARDERS?.start ?? '') ? ROOM_LARDERS.start : Object.keys(LARDERS)[0] ?? '';
// The larder's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a larder sets them to its own.
const partHeight = p => p.legs ?? p.plinth ?? p.top ?? p.cornice ?? p.h ?? 0;
const larderHeight = L => L.parts.reduce((t, p) => t + partHeight(p), 0);
const larderDepth = L => Math.max(L.d, ...L.parts.map(p => p.d ?? 0));
const LARDER_SLIDERS = [['w', 'larderW', 400, 1500], ['h', 'larderH', 1500, 2400], ['d', 'larderD', 300, 700]];
const larderOwnSize = L => ({ w: L.w, h: larderHeight(L), d: L.d });
if (LARDERS[state.larder.key]) state.larder.size = larderOwnSize(LARDERS[state.larder.key]);
// The larder chosen, at the sliders' sizes: a change of height goes on (or
// comes off) its tallest doors, and parts set back from its front (a
// shallower top section) stay set back as much
function currentLarder() {
  const L = LARDERS[state.larder.key];
  if (!L) return null;
  const { w, h, d } = state.larder.size;
  const parts = L.parts.map(p => (p.d ? { ...p, d: p.d + d - L.d } : p));
  let tallest = -1;
  parts.forEach((p, k) => { if (p.doors && (tallest < 0 || p.h > parts[tallest].h)) tallest = k; });
  if (tallest >= 0) parts[tallest] = { ...parts[tallest], h: Math.max(200, parts[tallest].h + h - larderHeight(L)) };
  const own = larderOwnSize(L);
  const resized = own.w !== w || own.h !== h || own.d !== d;
  return { ...L, label: resized ? `${L.label}, resized` : L.label, w, d, parts };
}
function larder(g, L, x0) {
  const x1 = x0 + L.w;
  let z = 0;
  for (const p of L.parts) {
    const h = partHeight(p), d = p.d ?? L.d, yf = ROOM_DEPTH - d, z1 = z + h;   // yf: its front
    if (p.legs) {
      for (const x of [x0 + 20, x1 - 70]) for (const y of [yf + 20, ROOM_DEPTH - 70]) box({ from: [x, y, z], to: [x + 50, y + 50, z1] }, dresserMat, g);
    } else if (p.plinth) {
      box({ from: [x0 + 20, yf + 20, z], to: [x1 - 20, ROOM_DEPTH, z1] }, dresserMat, g);  // set back
    } else if (p.top) {
      box({ from: [x0 - 15, yf - 15, z], to: [x1 + 15, ROOM_DEPTH, z1] }, shelfMat, g);     // wooden, 15 proud
    } else if (p.cornice) {
      box({ from: [x0 - 20, yf - 20, z], to: [x1 + 20, ROOM_DEPTH, z1] }, dresserMat, g);   // 20 proud
    } else if (p.drawers) {
      const [rows, cols] = Array.isArray(p.drawers) ? p.drawers : [1, p.drawers];
      box({ from: [x0, yf + 18, z], to: [x1, ROOM_DEPTH, z1] }, dresserMat, g);             // behind the fronts
      const fw = (L.w - 3 * (cols + 1)) / cols, fh = (h - 3 * (rows + 1)) / rows;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const f0 = x0 + 3 + c * (fw + 3), b0 = z + 3 + r * (fh + 3), mx = f0 + fw / 2, mz = b0 + fh / 2;
        box({ from: [f0, yf, b0], to: [f0 + fw, yf + 18, b0 + fh] }, dresserDoorMat, g);
        box({ from: [mx - 15, yf - 20, mz - 15], to: [mx + 15, yf, mz + 15] }, handleMat, g, false);   // knob
      }
    } else if (p.doors) {
      // A hollow cupboard (sides, back, bottom, top and shelves), so it
      // shows inside with its doors open
      box({ from: [x0, yf + 18, z], to: [x0 + 18, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x1 - 18, yf + 18, z], to: [x1, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x0 + 18, ROOM_DEPTH - 12, z], to: [x1 - 18, ROOM_DEPTH, z1] }, dresserMat, g);
      box({ from: [x0 + 18, yf + 18, z], to: [x1 - 18, ROOM_DEPTH - 12, z + 18] }, dresserMat, g);
      box({ from: [x0 + 18, yf + 18, z1 - 18], to: [x1 - 18, ROOM_DEPTH - 12, z1] }, dresserMat, g);
      const shelves = p.shelves ?? 0;
      for (let k = 1; k <= shelves; k++) {
        const top = Math.round(z + k * h / (shelves + 1)) + 11;
        box({ from: [x0 + 18, yf + 40, top - 22], to: [x1 - 18, ROOM_DEPTH - 12, top] }, shelfMat, g);
      }
      // Facing it, your right is the lower x: a pair is hinged at the outer
      // edges, a single door on the side its hinge says
      const n = p.doors === 2 ? 2 : 1, dw = (L.w - 3 * (n + 1)) / n;
      for (let k = 0; k < n; k++) {
        const low = n === 2 ? k === 0 : p.hinge !== 'left';
        const leaf = hinge(low ? x0 + 3 : x1 - 3, yf, g);
        if (!low) leaf.userData.dir = -1;
        box({ from: [low ? 0 : -dw, 0, z + 3], to: [low ? dw : 0, 18, z1 - 3] }, dresserDoorMat, leaf);
        const kx = low ? dw - 50 : 30 - dw, kz = n === 2 || h < 1000 ? (z + z1) / 2 : z + 150;   // knob by the free edge
        box({ from: [kx, -20, kz - 10], to: [kx + 20, 0, kz + 10] }, handleMat, leaf, false);
      }
    }
    z = z1;
  }
  return `${L.label}: ${L.w} wide, ${larderHeight(L)} high, ${larderDepth(L)} deep`;
}
// The dresser or a larder, in a group of its own, to look at
function placePiece(g) {
  const sub = new THREE.Group();
  g.add(sub);
  return sub;
}
// On the front wall between the sink and the desk: the dresser, a larder,
// a bookcase like the bedroom's or nothing, in every option but the current room.
// Their order is their code in the address, so the bookshelf, added later,
// is last.
const FRONT_PIECES = ['dresser', 'larder', 'none', 'bookshelf'];
const pieces = { dresser: null, larder: null, sofa: null };   // where each is drawn now, to look at
const frontFrom = () => KITCHEN.frontRunTo + KITCHEN.counterPast;
const frontGap = () => DESK_RECESS.x0 - frontFrom();             // 1415
const frontX0 = w => Math.round(frontFrom() + (frontGap() - w) / 2);   // a piece w wide, centred there
const larderFrontX0 = L => frontX0(L.w);
const widerThanFrontGap = w => (w > frontGap() ? ` It's ${w - frontGap()} wider than the ${frontGap()} of wall there.` : '');
// Where the island stands, in any option: where it is ('room'), or against
// the front wall between the sink and the desk, in place of the dresser or
// larder: its end against the wall and its long side running out into the
// room, against the end of the kitchen counter ('out', long side out), or
// its long side along the wall, centred there ('along', short side out); or
// not there at all ('none'). Their order is their code in the address.
const ISLAND_AT = ['room', 'along', 'out', 'none'];
const islandOnWall = () => state.island.at === 'along' || state.island.at === 'out';   // in the dresser or larder's place
// Out there, the island can be moved and turned from its sliders: where its
// middle is, and how far it's turned (0 to 180°). It starts where it is.
const ISLAND_HOME = { x: KITCHEN.island.x + KITCHEN.island.width / 2, y: KITCHEN.island.y + KITCHEN.island.length / 2, turn: 0 };
state.island.move = { ...ISLAND_HOME };
function islandSpot() {
  const { width, length } = KITCHEN.island, { at, move } = state.island;
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
  const { x0, x1, y0, y1, turned, angle } = islandSpot();
  islandGroup.position.set((x0 + x1) / 2 * MM, 0, (y0 + y1) / 2 * MM);
  islandGroup.rotation.y = angle ?? (turned ? Math.PI / 2 : 0);
  islandGroup.visible = state.island.at !== 'none';
  for (const [k, id, unit] of [['x', 'islandX', ''], ['y', 'islandY', ''], ['turn', 'islandTurn', '°']]) {
    document.getElementById(id).value = String(state.island.move[k]);
    document.getElementById(`${id}Value`).textContent = `${state.island.move[k]}${unit}`;
  }
}
// A sofa from sofas.js, in any option: facing the TV, centred on it,
// its front state.sofa.front from the TV wall. Returns a description.
const SOFAS = window.ROOM_SOFAS?.list ?? {};
state.sofa.key = Object.hasOwn(SOFAS, window.ROOM_SOFAS?.start ?? '') ? ROOM_SOFAS.start : '';
state.sofa.front = window.ROOM_SOFAS?.front ?? 1900;
// The sofa's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a sofa sets them to its own.
const SOFA_SLIDERS = [['w', 'sofaW', 1200, 2600], ['d', 'sofaD', 700, 1200], ['h', 'sofaH', 700, 1100]];
const sofaOwnSize = S => ({ w: S.w, d: S.d, h: S.h });
if (SOFAS[state.sofa.key]) state.sofa.size = sofaOwnSize(SOFAS[state.sofa.key]);
// The sofa chosen, at the sliders' sizes: the seat keeps its depth (the back
// gets thinner) unless that leaves less than 150 for the back, and the arms
// stay as they are, under the top of the back
function currentSofa() {
  const S = SOFAS[state.sofa.key];
  if (!S) return null;
  const { w, d, h } = state.sofa.size, own = sofaOwnSize(S);
  const resized = own.w !== w || own.d !== d || own.h !== h;
  return { ...S, label: resized ? `${S.label}, resized` : S.label, w, d, h,
    seatD: Math.min(S.seatD, d - 150), armH: Math.min(S.armH, h - 50) };
}
const sofaMat = material(0x9da3a6);
// Where the sofa stands: the middle of the floor it covers, room x and y,
// and how far it's turned, in quarter turns as the bookshelf (360 is 0
// again). It starts centred on the TV, facing it, its front
// state.sofa.front from the TV wall; its sliders move it from there.
const SOFA_FACING = { 0: 'the TV wall', 90: 'the right-hand wall', 180: 'the front wall', 270: 'the left wall' };
function sofaHome(S) {
  return { x: (tvAt ?? [ROOM_WIDTH / 2])[0], y: state.sofa.front + S.d / 2, turn: 0 };
}
// Where it is now, and the floor it covers (x0 to x1, y0 to y1), square to
// the walls, as it's turned
function sofaSpot() {
  const S = currentSofa(), { x, y, turn } = state.sofa.move ?? sofaHome(S);
  const sideways = turn % 180 !== 0;
  const across = sideways ? S.d : S.w, along = sideways ? S.w : S.d;
  const x0 = Math.round(x - across / 2), y0 = Math.round(y - along / 2);
  return { S, x, y, turn, x0, x1: x0 + across, y0, y1: y0 + along };
}
// Drawn in a group of its own, its middle at the group's origin and its
// front to -y (facing the TV wall), then moved and turned into place
function sofa(g) {
  if (!SOFAS[state.sofa.key]) return '';
  const spot = sofaSpot(), { S } = spot, sub = new THREE.Group(), cushion = 150;
  const x0 = -S.w / 2, x1 = S.w / 2, y0 = -S.d / 2, y1 = S.d / 2;
  sub.position.set(spot.x * MM, 0, spot.y * MM);
  sub.rotation.y = THREE.MathUtils.degToRad(-spot.turn);
  g.add(sub);
  pieces.sofa = sub;
  sofaMat.color.set(S.colour ?? '#9DA3A6');
  for (const x of [x0 + 40, x1 - 90]) for (const y of [y0 + 40, y1 - 90]) box({ from: [x, y, 0], to: [x + 50, y + 50, S.legH] }, shelfMat, sub);   // wooden legs
  box({ from: [x0 + S.armW, y0 + 20, S.legH], to: [x1 - S.armW, y1, S.seatH - cushion] }, sofaMat, sub);   // the frame under the seat
  const inner = x1 - x0 - 2 * S.armW, half = (inner - 10) / 2;                            // two seat cushions
  for (const k of [0, 1]) box({ from: [x0 + S.armW + k * (half + 10), y0, S.seatH - cushion], to: [x0 + S.armW + k * (half + 10) + half, y0 + S.seatD, S.seatH] }, sofaMat, sub);
  box({ from: [x0, y0, S.legH], to: [x0 + S.armW, y1, S.armH] }, sofaMat, sub);    // arms
  box({ from: [x1 - S.armW, y0, S.legH], to: [x1, y1, S.armH] }, sofaMat, sub);
  box({ from: [x0 + S.armW, y0 + S.seatD, S.seatH - cushion], to: [x1 - S.armW, y1, S.h] }, sofaMat, sub);   // the back
  return sofaText(spot);
}
// The sofa's sentence for the summary, from its spot (sofaSpot)
function sofaText(spot) {
  const { S, x, y, turn, x0, x1, y0, y1 } = spot;
  const sizes = `the ${S.label}: ${S.w} wide, ${S.d} deep, ${S.h} high, its seat at ${S.seatH}.`;
  const floor = `(x ${x0}-${x1}, y ${y0}-${y1})`;
  if (!state.sofa.move) return ` A sofa facing the TV, ${sizes} Its front is ${y0} from the TV wall ${floor}.${sofaByIsland(spot)}`;
  return ` A sofa, ${sizes} Moved: its middle at x ${Math.round(x)}, y ${Math.round(y)}, facing ${SOFA_FACING[turn]} ${floor}.${sofaByIsland(spot)}`;
}
// Whether the sofa's floor runs into the island's, or how far behind it the
// island starts (where the sofa's square to the TV, its back to the island)
function sofaByIsland({ turn, x0, x1, y0, y1 }) {
  if (state.island.at === 'none') return '';
  const { x0: ix0, x1: ix1, y0: iy0, y1: iy1 } = islandSpot();
  const level = x0 < ix1 && x1 > ix0;
  if (level && y1 > iy0 && y0 < iy1) return ' It runs into the island.';
  return level && iy0 >= y1 && turn === 0 ? ` Behind it, ${iy0 - y1} to the island.` : '';
}
function frontWall(g, i) {
  if (islandOnWall()) {
    const { x0, x1, y0 } = islandSpot();
    return ` The kitchen island against the front wall between the sink and the desk, its ${state.island.at === 'out' ? 'long' : 'short'} side out (x ${x0}-${x1}), coming ${ROOM_DEPTH - y0} out from the wall to y ${y0}.`;
  }
  if (i === CURRENT) return '';
  if (state.frontPiece === 'dresser') return dresser(pieces.dresser = placePiece(g));
  if (state.frontPiece === 'bookshelf') return bookcaseOnFrontWall(g);
  const L = currentLarder();
  if (state.frontPiece !== 'larder' || !L) return '';
  const x0 = larderFrontX0(L);
  const text = larder(pieces.larder = placePiece(g), L, x0);
  return ` A larder on the front wall between the sink and the desk (x ${x0}-${x0 + L.w}): the ${text}.` + widerThanFrontGap(L.w);
}
// A bookcase like the bedroom's on the front wall between the sink and the
// desk, at its bedroom sizes: its back to the wall, centred there. Each
// place has its own, so it's drawn whether or not there's one on the back
// wall or in the bedroom.
function bookcaseOnFrontWall(g) {
  const { w, d, h } = state.otherRoom.bookcase, x0 = frontX0(w);
  const piece = bookcase({ w, d, h });                           // drawn with its back's middle at its origin, facing out
  piece.position.set((x0 + w / 2) * MM, 0, ROOM_DEPTH * MM);
  piece.rotation.y = Math.PI;                                    // facing into the room
  g.add(piece);
  return ` A bookcase like the bedroom's on the front wall between the sink and the desk (x ${x0}-${x0 + w}): ${w} wide, ${d} deep, ${h} high.` + widerThanFrontGap(w);
}
// The front-wall piece's span and heights, for the 2D dimensions
function frontSpan() {
  if (islandOnWall()) {
    const { x0, x1 } = islandSpot();
    return { x0, x1, heights: [0, KITCHEN.island.top] };
  }
  if (state.option === CURRENT) return null;
  if (state.frontPiece === 'dresser') return { x0: state.dresser.x0, x1: state.dresser.x1, heights: [0, state.dresser.baseH, state.dresser.h] };
  if (state.frontPiece === 'bookshelf') {
    const { w, h } = state.otherRoom.bookcase;
    return { x0: frontX0(w), x1: frontX0(w) + w, heights: [0, h] };
  }
  const L = currentLarder();
  if (state.frontPiece !== 'larder' || !L) return null;
  return { x0: larderFrontX0(L), x1: larderFrontX0(L) + L.w, heights: [0, larderHeight(L)] };
}
// The open shelving tower, x0 to x1, full height, with a light strip under
// the front of each shelf
function shelvingTower(x0, x1, g) {
  if (x1 - x0 < 100) return;
  const { R, BOARD: B } = state;
  board('Shelving tower rear panel', x0, 0, 0, x1, B, CEILING_HEIGHT, g);                 // against the back wall
  board('Shelving tower side', x1 - B, B, 0, x1, R, CEILING_HEIGHT, g);
  board('Shelving tower top', x0, B, CEILING_HEIGHT - B, x1 - B, R, CEILING_HEIGHT, g);
  part('Shelving tower plinth', box({ from: [x0, B, 0], to: [x1 - B, R, PLINTH] }, carcassMat, g));   // a block, not a board
  const step = (CEILING_HEIGHT - B - PLINTH) / 6;
  for (let k = 1; k <= 5; k++) {
    const top = Math.round(PLINTH + k * step);
    box({ from: [x0, B, top - 25], to: [x1 - B, R, top] }, oakMat, g);
    box({ from: [x0 + 20, R - 40, top - 32], to: [x1 - B - 20, R - 30, top - 25] }, glowMat, g, false);
  }
}

// Options 10 and 11: a full-height cupboard in the corner, CORNER_W along the
// back wall and CORNER_D (F here) out along the left wall, with the bench
// from it to the right-hand wall. Its pair of doors face the kitchen (on its
// end, at y = F) or the windows (on its side, where it's clear of the bench,
// y R to F). Returns the doors' hinges, none if it's too shallow to build.
function cornerCupboard(g, facing, benchFrom = state.CORNER_W) {   // benchFrom: past option 10's side bookshelf
  const { R, BENCH } = state;
  box({ from: [benchFrom, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, g);                // bench, to the right-hand wall
  if (cornerTooShallow(facing)) return [];
  cornerCarcass(g);
  return facing === 'kitchen' ? cornerDoorsToKitchen(g) : cornerDoorsToWindows(g);
}

// The corner cupboard's rear panels, top, bottom and shelves, the same
// whichever way it faces
function cornerCarcass(g) {
  const { CORNER_D: F, BOARD: B, CORNER_W: X } = state;
  const E = X - B;
  board('Back-wall rear panel', 0, 0, 0, X, B, CEILING_HEIGHT, g);                   // runs through the corner
  // The left-wall rear panel stops at it, and at the front: behind option
  // 10's doors, or behind option 11's end, which runs across it
  board('Left-wall rear panel', 0, B, 0, B, F - B, CEILING_HEIGHT, g);
  board('Top', B, B, CEILING_HEIGHT - B, E, F - B, CEILING_HEIGHT, g);                            // top and bottom, between them
  board('Bottom', B, B, 0, E, F - B, B, g);
  for (const top of [600, 1200, 1800]) cupShelf(rectPoly(B, B, E, F - B), top, shelfMat);
}

// Option 10's corner cupboard: its side facing the windows, and a pair of
// doors on its end (y = F), facing the kitchen. Returns their hinges.
function cornerDoorsToKitchen(g) {
  const { CORNER_D: F, BOARD: B, CORNER_W: X } = state;
  const E = X - B;
  board('Side facing the windows', E, B, 0, X, F, CEILING_HEIGHT, g);
  const w = (E - 3 * DOOR_GAP) / 2;                              // a pair, DOOR_GAP from the wall, each other and the side
  const left = hinge(DOOR_GAP, F, g);
  left.userData.dir = -1;
  part('Cupboard door', box({ from: [0, -B, DOOR_GAP], to: [w, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, left));
  box({ from: [w - 40, 0, HANDLE_BOTTOM], to: [w - 20, 22, HANDLE_TOP] }, handleMat, left, false);
  const right = hinge(E - DOOR_GAP, F, g);
  part('Cupboard door', box({ from: [-w, -B, DOOR_GAP], to: [0, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, right));
  box({ from: [20 - w, 0, HANDLE_BOTTOM], to: [40 - w, 22, HANDLE_TOP] }, handleMat, right, false);
  return [left, right];
}

// Option 11's corner cupboard: its end facing the kitchen, its side by the
// bench, and a pair of doors on its side where it's clear of the bench
// (y R to F), facing the windows. Returns their hinges.
function cornerDoorsToWindows(g) {
  const { R, CORNER_D: F, BOARD: B, CORNER_W: X } = state;
  const E = X - B;
  board('End facing the kitchen', 0, F - B, 0, X, F, CEILING_HEIGHT, g);
  board('Side by the bench', E, B, 0, X, R, CEILING_HEIGHT, g);
  const w = (F - R - B - 3 * DOOR_GAP) / 2;                       // a pair on the side beyond the bench
  const back = hinge(E, R + DOOR_GAP, g);                         // hinged at the bench end
  part('Cupboard door', box({ from: [0, 0, DOOR_GAP], to: [B, w, CEILING_HEIGHT - DOOR_GAP] }, doorMat, back));
  box({ from: [B, w - 40, HANDLE_BOTTOM], to: [B + 22, w - 20, HANDLE_TOP] }, handleMat, back, false);
  const front = hinge(E, F - B - DOOR_GAP, g);                    // hinged at the kitchen end
  front.userData.dir = -1;
  part('Cupboard door', box({ from: [0, -w, DOOR_GAP], to: [B, 0, CEILING_HEIGHT - DOOR_GAP] }, doorMat, front));
  box({ from: [B, 20 - w, HANDLE_BOTTOM], to: [B + 22, 40 - w, HANDLE_TOP] }, handleMat, front, false);
  return [back, front];
}

// Option 10's side bookshelf: full height, open, from the corner cupboard
// (x CORNER_W - BOARD, sharing its side) to CORNER_W + SIDE_W, SIDE_D deep,
// with five shelves evenly up it and a light strip under the front of each,
// as option 9's tower. Where it's deeper than the cupboard (or there's no
// cupboard), it has a side of its own there. Its boards are part of the
// cupboard, so they're in its cutting list.
const sideShelfOn = () => state.SIDE_SHELF && OPTIONS[state.option].no === 10;
const sideShelfW = () => (sideShelfOn() ? state.SIDE_W : 0);   // how far it takes the bench along
const SIDE_SHELVES = 5;
const sideShelfTops = () => [...Array(SIDE_SHELVES).keys()].map(k => Math.round(state.BOARD + (k + 1) * (CEILING_HEIGHT - 2 * state.BOARD) / (SIDE_SHELVES + 1)));
function sideBookshelf(g) {
  const { CORNER_W: X, CORNER_D, BOARD: B, SIDE_W, SIDE_D: d } = state;
  const alone = cornerTooShallow('kitchen');                     // no cupboard beside it, nor its rear panel
  const x1 = X + SIDE_W, shared = alone ? B : Math.max(B, Math.min(CORNER_D, d));   // y the cupboard's side covers
  board('Bookshelf rear panel', alone ? X - B : X, 0, 0, x1, B, CEILING_HEIGHT, g);     // against the back wall, on from the cupboard's
  board('Bookshelf side', x1 - B, B, 0, x1, d, CEILING_HEIGHT, g);
  board('Bookshelf side, past the cupboard', X - B, shared, 0, X, d, CEILING_HEIGHT, g);
  board('Bookshelf top', X, B, CEILING_HEIGHT - B, x1 - B, d, CEILING_HEIGHT, g);
  board('Bookshelf bottom', X, B, 0, x1 - B, d, B, g);
  for (const top of sideShelfTops()) {
    board('Bookshelf shelf', X, B, top - B, x1 - B, d, top, g, shelfMat);
    box({ from: [X + 20, d - 40, top - B - 7], to: [x1 - B - 20, d - 30, top - B] }, glowMat, g, false);
  }
}
const sideShelfText = () => {
  if (!sideShelfOn()) return '';
  const { CORNER_W: X, SIDE_W, SIDE_D, BOARD } = state;
  return `Beside it, a ${SIDE_W}-wide, ${SIDE_D}-deep open bookshelf (x ${X}-${X + SIDE_W}), floor to ceiling, sharing the cupboard's side, ` +
    `with ${SIDE_SHELVES} lit shelves ${SIDE_W - BOARD} long, their tops at ${sideShelfTops().join(', ')}. `;
};

// The least depth (CORNER_D) options 10 and 11's cupboard can be built at, as
// the slider goes down to 0: room inside for its top and bottom (between the
// left-wall rear panel and the doors, for option 10), and for
// option 11 room for its doors beside the bench. Below it, the cupboard isn't
// drawn and the description says so.
const cornerLeast = facing => facing === 'kitchen' ? 2 * state.BOARD + 1 : state.R + state.BOARD + 10;
const cornerTooShallow = facing => state.CORNER_D < cornerLeast(facing);
const tooShallowText = facing => `No corner cupboard: at ${state.CORNER_D} out along the left wall it's too shallow to build ` +
  `(it needs at least ${cornerLeast(facing)}${facing === 'kitchen' ? '' : `, for doors beside the ${state.R}-deep bench`}). `;

// ---------------------------------------------------------------------------
// The options. Summaries are functions of the settings, as their sizes depend
// on them: each part reads the sizes it needs from state when it's called,
// as `clearFrom: ({ T, LEG } = state) => T + LEG`.
// ---------------------------------------------------------------------------
const OPTIONS = [
  {
    name: '7. Full-height L-shaped cupboard',
    defaultLeft: 600,                                  // chosen with no left-wall cupboard: one this deep (it can be taken away again)
    source: 'plan3/room_3d.html',
    clearFrom: ({ T, LEG } = state) => T + LEG,
    benchFrom: ({ T, LEG } = state) => T + LEG,
    summaryNoLeft: ({ R, BOARD, LEG, LEG_D } = state) => `No left-wall cupboard: a full-height cupboard on the back wall (x 0-${LEG}, ${LEG_D} deep), with a ${LEG - BOARD - 2 * DOOR_GAP} × ${CEILING_HEIGHT - 2 * DOOR_GAP} door. Bench ${ROOM_WIDTH - LEG}, from x = ${LEG}, ${R} deep.`,
    summary: ({ T, R, F, BOARD, LEG, LEG_D } = state) => `Both legs of the L run floor to ceiling, ${LEG} inside along the back wall (${LEG_D} deep) and ${F - LEG_D} along the left wall, one space round the corner. Doors ${CEILING_HEIGHT - 2 * DOOR_GAP} high, ${BOARD} thick: ${LEG - BOARD - 2 * DOOR_GAP} wide on the back-wall leg, ${F - LEG_D - 2 * DOOR_GAP} wide on the left-wall leg (it covers the corner). Bench shortened to ${ROOM_WIDTH - T - LEG}, from x = ${T + LEG}, ${R} deep.`,
    second: 'Back-wall leg door',
    build(g) {
      const { LEG_D } = state;
      return { tall: tallDoor(g, LEG_D), second: fullHeightL(g) };
    },
  },
  {
    name: '8. Full-height corner unit, diagonal double doors',
    needsLeft: true,                                   // not available without a left-wall cupboard
    source: 'option 7 (new)',
    clearFrom: ({ T } = state) => T + 700,
    benchFrom: ({ T } = state) => T + 700,
    summary: ({ T, R, F } = state) => {
      const { length, door } = diagonal();
      const gap = roomDoorGap();
      return `As option 7, but the front runs straight across from where its two doors hinge (x ${T}, y ${F} to x ${T + 700}, y ${R}), about ${Math.round(length)} wide, with a pair of ${Math.round(door)} doors. Behind them it is one cupboard. ` +
        (gap < 0 ? `Opened to 90°, the left door crosses the open room door's path by about ${-gap}: open one at a time. `
                 : `Opened to 90°, the left door clears the open room door by about ${gap}. `) +
        `Bench ${ROOM_WIDTH - T - 700}, from x = ${T + 700}, ${R} deep.`;
    },
    second: 'Double doors',
    build(g) {
      const { T, R, BENCH } = state;
      box({ from: [T + 700, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, g);   // bench, to the right-hand wall
      diagonalCarcass(g);
      diagonalShelves();
      return { second: diagonalDoors(g) };
    },
  },
  {
    name: '9. Double-door cupboard and shelves',
    source: 'option 7 and the photo (new)',
    clearFrom: ({ T, WARD, TOWER } = state) => T + WARD + TOWER,
    benchFrom: ({ T, WARD, TOWER } = state) => T + WARD + TOWER,
    marks: ({ T, WARD } = state) => [T + WARD],
    summary: ({ T, R, F, BOARD, BENCH, WARD, WARD_D, TOWER } = state) => `${T ? `Option 7's left-wall leg (${F - WARD_D} inside, with its door), joined to a` : 'No left-wall cupboard. A'} full-height cupboard on the back wall (x ${T}-${T + WARD}, ${WARD_D} deep) with a pair of ${Math.round((WARD - BOARD - 3 * DOOR_GAP) / 2)} doors` +
      (TOWER >= 100 ? `, then a ${TOWER}-wide, ${R}-deep open shelving tower (to x ${T + WARD + TOWER}), floor to ceiling, with five lit shelves` : '') +
      `. Base cupboards with ${baseDoorCount()} doors under an oak top run on to the right-hand wall: ${ROOM_WIDTH - T - WARD - TOWER} long, ${BENCH} high, ${R} deep.`,
    second: 'Cupboard doors',
    build(g) {
      const { T, WARD, WARD_D, TOWER } = state;
      const E = T + WARD, S = E + TOWER;
      baseCupboards(S, g);
      wardCarcass(g);
      shelvingTower(E, S, g);
      const second = wardDoors(g);
      return { tall: tallDoor(g, WARD_D), second };
    },
  },

  {
    name: '10. Corner cupboard, doors facing the kitchen',
    source: 'option 10 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D } = state) => CORNER_D,                   // its own depth out along the left wall, in place of F
    clearFrom: ({ CORNER_W } = state) => CORNER_W + sideShelfW(),   // past the side bookshelf, when there is one
    benchFrom: ({ CORNER_W } = state) => CORNER_W + sideShelfW(),
    marks: ({ CORNER_W } = state) => (sideShelfOn() ? [CORNER_W] : []),
    summary: ({ R, CORNER_D: F, BOARD, CORNER_W } = state) => {
      const S = CORNER_W + sideShelfW(), bench = `Bench ${ROOM_WIDTH - S}, from x = ${S}, ${R} deep.`;
      if (cornerTooShallow('kitchen')) return `${tooShallowText('kitchen')}${sideShelfText()}${bench}`;
      const w = Math.round((CORNER_W - BOARD - 3 * DOOR_GAP) / 2), reach = F + w;
      return `A full-height cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
        `${F === DOOR_FRAME_STARTS_AT ? ', right up to the door frame' : ''}, with a pair of ${w} doors on its end, facing the kitchen. ` +
        (reach > DOOR_HINGE_AT ? `Opened to 90°, they reach ${reach} from the back wall, past the room door's hinge at ${DOOR_HINGE_AT}: they can't open fully while the room door is open. ` : '') +
        `${sideShelfText()}${bench}`;
    },
    second: 'Cupboard doors',
    build(g) {
      const doors = cornerCupboard(g, 'kitchen', state.CORNER_W + sideShelfW());
      if (sideShelfOn()) sideBookshelf(g);
      return { second: doors };
    },
  },
  {
    name: '11. Corner cupboard, doors facing the windows',
    source: 'option 11 (new)',
    fixedWidth: true,                                            // the left-wall cupboard's depth doesn't apply
    front: ({ CORNER_D } = state) => CORNER_D,                   // its own depth out along the left wall, in place of F
    clearFrom: ({ CORNER_W } = state) => CORNER_W,
    benchFrom: ({ CORNER_W } = state) => CORNER_W,
    summary: ({ R, CORNER_D: F, BOARD, CORNER_W } = state) => cornerTooShallow('windows') ? `${tooShallowText('windows')}Bench ${ROOM_WIDTH - CORNER_W}, from x = ${CORNER_W}, ${R} deep.` : `A full-height cupboard in the corner, ${CORNER_W} along the back wall and ${F} out along the left wall` +
      `${F === DOOR_FRAME_STARTS_AT ? ', right up to the door frame' : ''}, with a pair of ${Math.round((F - R - BOARD - 3 * DOOR_GAP) / 2)} doors on its side, facing the windows, ` +
      `where it's clear of the ${R}-deep bench (y ${R}-${F}). Behind the doors it runs back to the back wall, behind the bench end. ` +
      `Bench ${ROOM_WIDTH - CORNER_W}, from x = ${CORNER_W}, ${R} deep.`,
    second: 'Cupboard doors',
    build(g) {
      return { second: cornerCupboard(g, 'windows') };
    },
  },

  {
    name: '16. Current room, no cupboards yet',
    source: 'the room as it is now',
    clearFrom: () => 0,                                           // what's above the bench goes on the bare back wall
    benchFrom: () => 0,
    summary: ({ R } = state) => `The room as it is now, with no cupboards. Bench ${ROOM_WIDTH}, the whole back wall, ${R} deep. Oak floor, Crown Gallery White walls, Pure Brilliant White door, frame and ceiling, and the kitchen, island and desk.`,
    build(g) {
      const { R, BENCH } = state;
      box({ from: [0, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, g);                    // bench, the whole back wall (left out with the bench off)
      return {};
    },
  },
];
// Each option's number is the one in its name. The list starts at 7 (options
// 1 to 6 were taken out), so options are found by number, never by their
// place in the list: optionAt(9) is option 9's index, -1 if there's none.
for (const o of OPTIONS) o.no = parseInt(o.name, 10);
const optionAt = no => OPTIONS.findIndex(o => o.no === no);
const CURRENT = OPTIONS.length - 1;
state.option = optionAt(10);
// In the address each option keeps the code it was first given, so links made
// before options 10 and on still work: 1 to 9 as numbered, 10 for the current
// room (it was option 10), then 11 on for options 10 on. A code for an option
// taken out (1 to 6) reads as none (undefined), so the page keeps its own.
const optionCode = i => i === CURRENT ? 10 : OPTIONS[i].no <= 9 ? OPTIONS[i].no : OPTIONS[i].no + 1;
const optionIndex = code => {
  const i = code === 10 ? CURRENT : optionAt(code <= 9 ? code : code - 1);
  return i >= 0 ? i : undefined;
};

// ---------------------------------------------------------------------------
// Dimensions for the 2D views, drawn from the current option and settings
// ---------------------------------------------------------------------------
let showDims = true;
let flatView = null;               // 'plan', 'back' or 'left' while 2D
let flatRoom = 'living';           // the room the plan is of (the Look menu's Room)
let dims = null;                   // the group of dimensions on show

// Room (x, y, z) in mm to a scene point
const P = (x, y, z) => new THREE.Vector3(x * MM, z * MM, y * MM);

// dimLine(), dimLabel() and chain(), which draw them, are the kit's

// Heights of what's above the bench: shelf tops, and the TV's bottom and top
function aboveHeights(x0) {
  const { above } = state;
  const tv = [TV_BOTTOM, TV_BOTTOM + TV_H];
  if (above === 1) return SHELF_TOPS;
  if (above === 2) return tv;
  if (above === 4) return [...tv, ...TV_SHELF_TOPS.slice(1)];
  if (above === 3) {
    const side = Math.floor((ROOM_WIDTH - x0 - TV_W) / 2 - TV_GAP);
    return [...TV_SHELF_TOPS, ...tv, ...(side >= 200 ? [TV_MIDDLE_SHELF] : [])];
  }
  return [];
}

// Heights up the back wall, for the back view: the bench and what's above
// it, or the bookcase's top in its place (unless it's been moved off the
// wall), or nothing with neither
function backWallHeights(option) {
  if (benchDrawn()) return [state.BENCH, ...aboveHeights(option.clearFrom())];
  const againstWall = key => { const m = state[`${key}Move`]; return !m || (m.y === 0 && m.turn === 0); };
  return onBackWall().filter(againstWall).map(key => BACK_WALL_PIECES[key].sizes().h);
}

function updateDims() {
  if (dims) scene.remove(dims);
  dims = null;
  if (cupboardOnly && current && (!flat || showDims)) {
    dims = new THREE.Group();
    scene.add(dims);
    cupboardDims(dims);
    doorDims(dims);
    return;
  }
  if (!flat || !showDims || !flatView) return;
  dims = new THREE.Group();
  scene.add(dims);
  const { T, R, F, BENCH, above, shelfDepth } = state;
  const option = OPTIONS[state.option];
  const alongBack = [0, option.fixedWidth ? 0 : T, ...(option.marks ? option.marks() : []), option.benchFrom(), option.clearFrom(), ROOM_WIDTH];
  const alongLeft = [0, R, ...(option.front ? [option.front()] : T || option.fixedWidth ? [F] : []), DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, DOOR_HINGE_AT + ROOM_DOOR, FRAME_END];
  if (flatView === 'plan' && flatRoom === 'bedroom') {
    bedroomPlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'hallway') {
    hallwayPlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'downstairs') {
    entrancePlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'garage') {
    garagePlanDims(dims);
  } else if (flatView === 'plan') {
    chain(alongBack, (v, off) => P(v, -250 - off, CEILING_HEIGHT), dims);
    chain([...alongLeft, RECESS_FROM, ROOM_DEPTH], (v, off) => P(KITCHEN_RECESS_BACK_WALL_X - 300 - off, v, CEILING_HEIGHT), dims);
    chain([KITCHEN_RECESS_BACK_WALL_X, KITCHEN_RECESS_BACK_WALL_X + KITCHEN_DEPTH, 0], (v, off) => P(v, ROOM_DEPTH + 250 + off, CEILING_HEIGHT), dims); // the recess and kitchen depth
    chain([0, ROOM_WIDTH], (v, off) => P(v, ROOM_DEPTH + 250 + off, CEILING_HEIGHT), dims);
    chain([0, R, ...(above === 1 || above >= 3 ? [shelfDepth] : []), ROOM_DEPTH], (v, off) => P(ROOM_WIDTH + 250 + off, v, CEILING_HEIGHT), dims);
  } else if (flatView === 'back') {
    chain(alongBack, (v, off) => P(v, ROOM_DEPTH, -200 - off), dims);
    chain([0, ...backWallHeights(option), CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH + 250 + off, ROOM_DEPTH, v), dims);
  } else if (flatView === 'left') {
    chain([...alongLeft, RECESS_FROM, ROOM_DEPTH], (v, off) => P(ROOM_WIDTH, v, -200 - off), dims);
    chain([0, ROOM_DOOR_H, FRAME_H, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, FRAME_END + 300 + off, v), dims);
    chain([0, BENCH, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, -250 - off, v), dims);
  } else if (flatView === 'front') {
    const { alcove, worktop } = KITCHEN;
    const piece = frontSpan();                                  // the dresser or larder on the front wall
    chain([KITCHEN_RECESS_BACK_WALL_X, alcove.x[1], KITCHEN.frontRunTo + KITCHEN.counterPast, ...(piece ? [piece.x0, piece.x1] : []), DESK_RECESS.x0, ROOM_WIDTH], (v, off) => P(v, ROOM_DEPTH, -200 - off), dims);
    if (piece) chain(piece.heights, (v, off) => P(piece.x0 + 200 + off, ROOM_DEPTH, v), dims);   // on its face
    chain([0, worktop, alcove.top, CEILING_HEIGHT], (v, off) => P(KITCHEN_RECESS_BACK_WALL_X - 250 - off, ROOM_DEPTH, v), dims);   // the kitchen side
    chain([0, DESK_TOP, DESK_TOP + 550, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH + 250 + off, ROOM_DEPTH, v), dims);     // the desk and monitor tops
  } else if (flatView === 'right') {
    const { windows, sill, top, radiator, end } = OUTER;
    chain([0, ...windows.flatMap(w => w.y), ROOM_DEPTH, end], (v, off) => P(ROOM_WIDTH, v, -200 - off), dims);
    chain([0, radiator.bottom, radiator.top, sill, top, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, -250 - off, v), dims);
  }
  doorDims(dims);
}

// The bedroom's plan: along its hallway wall (the door's opening), its
// window wall (the window) and the recess's back (the chimney breast), in
// its own mm, from its corner by the window and the hallway
function bedroomPlanDims(g) {
  const { length, breastFace, recessBack, recessWidth, ceiling, doorFrom, doorTo, window: win } = OTHER_ROOM, { x, y } = OTHER_ROOM_CORNER;
  chain([0, doorFrom, doorTo, length], (v, off) => P(x + v, y - 250 - off, ceiling), g);
  chain([0, win.from, win.from + win.width, breastFace, recessBack], (v, off) => P(x - win.reveal - 250 - off, y + v, ceiling), g);
  chain([0, recessWidth, length], (v, off) => P(x + v, y + recessBack + 250 + off, ceiling), g);
}
// The hallway's plan, in the living room's mm: along its stairs side (the
// winders' square, to the newel), along its bedroom side (the step back and
// the doorway), and across at its far end (the right sill board, the well,
// the left board and the banister's base, and the kitchen side)
function hallwayPlanDims(g) {
  const { x0, xStep, xEnd, xTurn, yHallOut, yWellOut, yWellIn, ySillEdge, yBoxFace, kitchenSide, ySetBack, bedroomDoor } = HALLWAY;
  chain([xEnd, xTurn, x0], (v, off) => P(v, -250 - off, CEILING_HEIGHT), g);
  chain([xEnd, bedroomDoor[0], xStep, x0], (v, off) => P(v, ySetBack + 250 + off, CEILING_HEIGHT), g);
  chain([yHallOut, yWellOut, yWellIn, ySillEdge, yBoxFace, kitchenSide, ySetBack], (v, off) => P(xEnd - 250 - off, v, CEILING_HEIGHT), g);
}

// The stairs' and entrance's plan, in the living room's mm: along the
// stairs' outside wall (the back wall, the flat's door, the bottom step,
// the winders' square, the door wall), and across beside the back wall
// (the well, the wall to the lobby, the outside door and the lobby)
function entrancePlanDims(g) {
  const { x0, xTurn, xFoot, yWellOut, yWellIn } = HALLWAY;
  const { xBack, flatDoorHingeX: f0, flatDoor, yLobby0, yLobby1, outsideDoorHingeY: o1, outsideDoor } = ENTRANCE;
  chain([xBack, f0, f0 + flatDoor.width, xFoot, xTurn, x0], (v, off) => P(v, yWellOut - 250 - off, CEILING_HEIGHT), g);
  chain([yWellOut, yWellIn, yLobby0, o1 - outsideDoor.width, o1, yLobby1], (v, off) => P(xBack - 250 - off, v, CEILING_HEIGHT), g);
}

// The garage's plan, from its corner (garage.js): along its right-hand
// wall, looking in (its length), and across its door's end (the door)
function garagePlanDims(g) {
  const { length, width, height, door } = GARAGE, { x, y } = GARAGE_CORNER, top = ENTRANCE.floor + height;
  const d0 = (width - door.width) / 2;
  chain([0, length], (v, off) => P(x + v, y - 250 - off, top), g);
  chain([0, d0, d0 + door.width, width], (v, off) => P(x + length + 250 + off, y + v, top), g);
}

// In the wall views, anything wholly on the camera's side of the view's cut
// is left out, so the wall and what stands against it aren't hidden behind
// the island, the desk or the outside of the outer wall: the kit's, with
// the view's cut, and with the cupboard on its own, only its parts.
const applyCut = cutViews(scene, {
  get cut() { return flat && flatView && !cupboardOnly ? builtInViews[flatView].cut : null; },   // on its own, the cupboard needs no cut
  get only() { return cupboardOnly ? cupboardPart : null; },
});

// Cupboard only: the corner cupboard on its own (the option's build, bar its
// bench), with its dimensions, in the 3D and 2D views alike
let cupboardOnly = false;
function cupboardPart(o, withDoors = true) {
  if (!current?.cupboard || o.material === benchMat) return false;
  for (let p = o; p; p = p.parent) {
    if (p.userData.bench || (!withDoors && p.userData.hinge)) return false;
    if (p === current.cupboard) return true;
  }
  return false;
}
// In a 2D view, the cupboard on its own fills the screen, with room for its
// dimensions round it
function frameCupboard() {
  if (!flat || !cupboardOnly || !current?.cupboard) return;
  scene.updateMatrixWorld(true);
  const b = new THREE.Box3();
  current.cupboard.traverse(o => { if (o.isMesh && cupboardPart(o, false)) b.expandByObject(o); });
  if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()), margin = 1.6;
  const t = flatControls.target, shift = new THREE.Vector3();
  if (flatView === 'plan') {
    shift.set(c.x - t.x, 0, c.z - t.z);
    flatFit = [size.x + margin, size.z + margin];
  } else if (flatView === 'back' || flatView === 'front') {
    shift.set(c.x - t.x, c.y - t.y, 0);
    flatFit = [size.x + margin, size.y + margin];
  } else {
    shift.set(0, c.y - t.y, c.z - t.z);
    flatFit = [size.z + margin, size.y + margin];
  }
  t.add(shift);
  flatCamera.position.add(shift);
  flatCamera.zoom = 1;
  resize();
  flatControls.update();
}

// The cupboard's dimensions, from its parts (bar its doors, which may be
// open): along the back wall and out from it, the edges of its outline in
// plan, and up, its height and its shelves'
function cupboardDims(g) {
  scene.updateMatrixWorld(true);
  const boxes = [], shelfTops = [];
  current.cupboard.traverse(o => {
    if (!o.isMesh || o.material === glowMat || !cupboardPart(o, false)) return;
    const b = new THREE.Box3().setFromObject(o);
    boxes.push({ x0: b.min.x / MM, x1: b.max.x / MM, y0: b.min.z / MM, y1: b.max.z / MM, z0: b.min.y / MM, z1: b.max.y / MM });
    // The cupboard's own shelves (as recorded with cupShelf()), not an open tower's beside it
    for (let p = o.parent; p; p = p.parent) if (p === cupShelfGroup) { shelfTops.push(Math.round(b.max.y / MM)); break; }
  });
  if (!boxes.length) return;
  const inside = (x, y) => boxes.some(b => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);
  const lo = k => Math.min(...boxes.map(b => b[k + '0'])), hi = k => Math.max(...boxes.map(b => b[k + '1']));
  const [x0, x1, y0, y1, z1] = [lo('x'), hi('x'), lo('y'), hi('y'), hi('z')];
  // An edge of the outline: on one side of it the plan is filled somewhere, on the other not
  const edges = (k, from, to) => [...new Set(boxes.flatMap(b => [b[k + '0'], b[k + '1']]).map(Math.round))].filter(v => {
    for (let t = from + 5; t < to; t += 20) {
      const a = k === 'x' ? inside(v - 3, t) : inside(t, v - 3), b = k === 'x' ? inside(v + 3, t) : inside(t, v + 3);
      if (a !== b) return true;
    }
    return false;
  });
  const along = edges('x', y0, y1), out = edges('y', x0, x1);
  const heights = [0, ...shelfTops.filter(z => z > 60 && z < z1 - 40), z1];
  // Each chain, and outside it the overall size, when it's in parts
  const withTotal = (at, place, g) => {
    chain(at, place, g);
    const v = [...new Set(at.map(Math.round))];
    if (v.length > 2) chain([Math.min(...v), Math.max(...v)], (u, off) => place(u, off + 330), g);
  };
  if (flatView === 'back') {
    withTotal(along, (v, off) => P(v, y1, -200 - off), g);
    withTotal(heights, (v, off) => P(x1 + 250 + off, y1, v), g);
  } else if (flatView === 'left' || flatView === 'right') {
    withTotal(out, (v, off) => P(x1, v, -200 - off), g);
    withTotal(heights, (v, off) => P(x1, y1 + 250 + off, v), g);
  } else {                                                      // the plan, and the 3D views
    withTotal(along, (v, off) => P(v, y0 - 250 - off, z1), g);
    withTotal(out, (v, off) => P(x0 - 250 - off, v, z1), g);
    if (!flat) withTotal(heights, (v, off) => P(x1 + 250 + off, y0, v), g);
  }
}

// The corner cupboard's doors, each labelled with its size, width × height
// in mm, from the door as built (so it follows the boards' thickness): in
// the plan all of them, in a wall view those facing it, and with the
// cupboard on its own in 3D, all of them. The bench's base cupboards are
// left out.
let showDoorDims = true;            // the Door sizes button
function doorDims(g) {
  if (!current?.cupboard || !showDoorDims) return;
  scene.updateMatrixWorld(true);
  const facing = { back: 'z', front: 'z', left: 'x', right: 'x' }[flatView];   // in a wall view, the scene axis a door facing it is thin along
  current.cupboard.traverse(o => {
    if (!o.isMesh || o.material !== doorMat) return;
    for (let p = o; p; p = p.parent) if (p.userData.bench) return;
    const b = new THREE.Box3().setFromObject(o), size = b.getSize(new THREE.Vector3()), at = b.getCenter(new THREE.Vector3());
    if (flat && facing && size[facing] > size[facing === 'x' ? 'z' : 'x']) return;   // side on to this view
    const { width, height, depth } = o.geometry.parameters;
    if (flat && flatView === 'plan') at.y = (CEILING_HEIGHT + 150) * MM;          // over the cupboard
    dimLabel(`Door ${Math.round(Math.max(width, depth) / MM)} × ${Math.round(height / MM)}`, at, g, '#1f4e79', 0.11);
  });
}

// The cutting list: every board in the corner cupboard as it's built, by
// kind and size, largest first, with how many of each. It's read from the
// model, so it follows every setting, the boards' thickness included. A
// board's size is its length × width, its two larger sides; its thickness is
// BOARD. A shaped board (option 8's top and bottom, a shelf cut round a bay)
// is given as the rectangle it's cut from. The bench's base cupboards, and
// parts that aren't boards (option 9's oak shelves and plinth), are left out.
// Each size of board lists what it's for, from the names part() gives them.
// CUT_RULE, at its head, says which boards are shortened where they meet.
// cuttingList() reads the living room's cupboard, or the one given (the
// bedroom's copy, for window.plans.snapshot()).
const CUT_RULE = 'Rear panels (against the walls) and ends run full height. In a corner the back-wall rear panel runs through; ' +
  'the left-wall rear panel stops at it. Tops, bottoms and dividers fit between them. Shelves fit inside; doors cover the front edges, 3 clear.';
const CUT_EXCEPTIONS = {
  10: "Option 10's left-wall rear panel stops behind its doors.",
  11: "Option 11's end facing the kitchen runs across the left-wall rear panel.",
};
const BOARD_KINDS = new Map([[carcassMat, 'Panels'], [doorMat, 'Doors'], [shelfMat, 'Shelves']]);
function cuttingList(cupboard = current?.cupboard) {
  const { BOARD } = state, kinds = new Map();               // kind -> Map of 'l×w×shaped' -> { l, w, shaped, n, parts }
  cupboard?.traverse(o => {
    if (!o.isMesh || !BOARD_KINDS.has(o.material)) return;
    let kind = BOARD_KINDS.get(o.material);
    for (let p = o; p; p = p.parent) {
      if (p.userData.bench) return;
      if (p.userData.cupShelves) kind = 'Shelves';              // the cupboard's shelves, whatever their colour
    }
    o.geometry.computeBoundingBox();
    const [t, w, l] = o.geometry.boundingBox.getSize(new THREE.Vector3()).toArray().map(v => Math.round(v / MM)).sort((a, b) => a - b);
    if (t !== BOARD) return;
    const shaped = o.geometry.type === 'ExtrudeGeometry' && new Set(o.geometry.parameters.shapes.getPoints().map(p => `${p.x},${p.y}`)).size !== 4;
    if (!kinds.has(kind)) kinds.set(kind, new Map());
    const sizes = kinds.get(kind), key = `${l}×${w}×${shaped}`;
    if (!sizes.has(key)) sizes.set(key, { l, w, shaped, n: 0, parts: new Set() });
    sizes.get(key).n++;
    if (o.userData.part) sizes.get(key).parts.add(o.userData.part);
  });
  return kinds;
}
// Its kinds in the order listed, and each kind's sizes, largest first
const CUT_KINDS = ['Panels', 'Doors', 'Shelves'];
const sizesInOrder = sizes => [...sizes.values()].sort((a, b) => b.l - a.l || b.w - a.w);
const cutList = document.getElementById('cutList'), cutToggle = document.getElementById('cutToggle');
function showCuttingList() {
  const option = OPTIONS[state.option];
  if (state.option === CURRENT) {
    cutList.innerHTML = '<b>No cutting list</b>: no cupboard in this option.';
    return;
  }
  const kinds = cuttingList();
  let boards = 0, area = 0;
  const rows = CUT_KINDS.filter(k => kinds.has(k)).map(kind => {
    return `<div class="cutKind">${kind}</div>` + sizesInOrder(kinds.get(kind)).map(({ l, w, shaped, n, parts }) => {
      boards += n;
      area += n * l * w;
      const what = [[...parts].map((p, i) => i ? p[0].toLowerCase() + p.slice(1) : p).join(', '), shaped ? 'shaped' : ''].filter(Boolean).join('; ');
      return `<div class="cutRow"><span>${n} ×</span><span>${l} × ${w}</span><span>${what}</span></div>`;
    }).join('');
  }).join('');
  cutList.innerHTML = `<div class="cutHead">${option.name}: boards ${state.BOARD} thick, length × width in mm</div>` +
    `<div class="cutRule">${CUT_RULE}${CUT_EXCEPTIONS[option.no] ? ` ${CUT_EXCEPTIONS[option.no]}` : ''}</div>${rows}` +
    `<div class="cutTotal">${boards} boards, ${(area / 1e6).toFixed(2)} m² in all</div>`;
}
cutToggle.addEventListener('click', () => {
  cutList.hidden = !cutList.hidden;
  cutToggle.textContent = cutList.hidden ? 'Show cutting list' : 'Hide cutting list';
  cutToggle.setAttribute('aria-expanded', String(!cutList.hidden));
  if (!cutList.hidden) showCuttingList();
});

// ---------------------------------------------------------------------------
// Things to store, eventually in the corner cupboard: bulky things standing
// on the floor, as plain blocks (the tub as a cylinder). Each footprint is w
// along x by d along y; turned swaps them. They're packed in one of PACKINGS,
// either loose on the floor right of the island, opposite the middle window,
// or pushed into the current option's corner cupboard, where anything that
// doesn't fit turns red. In the plan view each can be dragged, and
// double-clicked or double-tapped to turn it round; the outline round them
// all is the floor area they need. Where they are is saved in the address
// after "~".
// ---------------------------------------------------------------------------
const STORED = [
  { name: 'Rack 1', label: 'Rack 1', w: 740, d: 100, h: 630, colour: 0x7b5ea7 },   // a drying rack, 740 long, 630 wide and 100 thick, stood on its edge; purple, to stand out from the cupboard
  { name: 'Folding ladder', label: 'Ladder', w: 380, d: 220, h: 1200, colour: 0xaab0b6 },
  { name: 'Long ladder', label: 'Long ladder', w: 520, d: 100, h: 1620, colour: 0x8a9199 },
  { name: 'Mop', label: 'Mop', w: 380, d: 310, h: 290, colour: 0x4f86b8 },
  { name: 'Dustpan and hoover', label: 'Hoover', w: 320, d: 280, h: 1000, colour: 0xb8473a },
  { name: 'Yellow tub', label: 'Tub', w: 550, d: 550, h: 450, colour: 0xf2c230, round: true },   // 550 across
  // Last, so addresses from when the two racks were one block (first) still read right
  { name: 'Rack 2', label: 'Rack 2', w: 740, d: 100, h: 630, colour: 0x9b7fd0 },   // the other drying rack, the same size, a lighter purple
];
// The tightest packings, found by trying every order and turn: [x, y, turned]
// for each thing in STORED's order, from the packing's back left corner.
// They were found with the two racks as one 800 × 300 block, and the racks
// and mop at their old sizes (800 × 100 × 700, 400 × 320 × 1200); the racks
// now stand 150 apart within it. Smaller since, they still fit as placed.
const PACKINGS = [
  { name: '850 × 1090, the tightest', at: [[550, 280, 1], [100, 0, 0], [0, 0, 1], [100, 220, 0], [500, 0, 0], [0, 540, 0], [700, 280, 1]] },
  { name: '860 × 1080', at: [[550, 280, 1], [0, 0, 1], [0, 400, 0], [220, 0, 1], [540, 0, 0], [0, 500, 0], [700, 280, 1]] },
  { name: '700 × 1370, no side over 700', at: [[0, 0, 1], [300, 0, 0], [0, 800, 1], [300, 220, 0], [300, 540, 0], [100, 820, 0], [150, 0, 1]] },
  { name: '580 × 1770, no side over 600', at: [[0, 0, 1], [300, 0, 1], [0, 800, 0], [0, 900, 0], [300, 380, 1], [0, 1220, 0], [150, 0, 1]] },
];
const sizeOf = (k, turned) => turned ? [STORED[k].d, STORED[k].w] : [STORED[k].w, STORED[k].d];
state.stored.spots = STORED.map(() => ({ x: 0, y: 0, turned: false, z: 0 }));   // z: how high it stands, as on a shelf
let liftInputs = [];               // the menu's inputs for each thing's height off the floor (see below)
const storedGroup = new THREE.Group();
scene.add(storedGroup);
const storedMats = STORED.map(s => new THREE.MeshStandardMaterial({ color: s.colour, roughness: 0.7 }));
const storedLineMat = new THREE.LineBasicMaterial({ color: 0x1f4e79, depthTest: false });
const storedSize = k => sizeOf(k, state.stored.spots[k].turned);

// A thing's short name printed flat on its top face, along its longer side,
// reading the right way up when facing the back wall
function faceLabel(text, x, y, w, d, z, g) {
  const along = Math.max(w, d), across = Math.min(w, d);
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = Math.max(48, Math.round(512 * across / along));
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 100px Helvetica, Arial, sans-serif';
  const size = Math.min(canvas.height * 0.6, 100 * canvas.width * 0.9 / ctx.measureText(text).width);
  ctx.font = `bold ${size}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
  ctx.fillStyle = '#1b2a38';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(along * MM, across * MM), new THREE.MeshBasicMaterial({ map, transparent: true }));
  m.rotation.x = -Math.PI / 2;                                   // face up, text's top towards the back wall
  if (d > w) m.rotation.z = Math.PI / 2;                         // along y when that's the longer side
  m.position.copy(P(x + w / 2, y + d / 2, z + 2));
  g.add(m);
}

// The inside of the current option's corner cupboard, as floor shapes with
// the clear height above each, in mm. Shelves inside are taken to be
// removable; bench tops, dividers and the cupboard's own panels count, the
// rear panels against the walls included: the inside starts a board (B) out
// from each wall, so it follows the boards' thickness.
function cupboardSpaces() {
  const { T, F, BOARD: B, LEG, LEG_D, WARD, WARD_D, CORNER_W, CORNER_D } = state;
  const rect = (x0, y0, x1, y1, h) => ({ poly: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], h });
  const full = CEILING_HEIGHT - 2 * B;                                                   // inside a full-height cupboard
  const leftLeg = from => T ? [rect(B, from, T - B, F - B, full)] : [];
  switch (OPTIONS[state.option].no) {
    case 7:                                                      // the full-height L, one space round the corner
      return [rect(B, B, T + LEG - B, LEG_D - B, full), ...leftLeg(LEG_D - B)];
    case 8: {                                                    // the corner unit, to 25 behind its diagonal front
      const E = T + 700, { ux, uy } = diagonal(), nx = uy, ny = -ux, c = T * nx + F * ny + 25;
      return [{ poly: [[B, B], [E - B, B], [E - B, (c - (E - B) * nx) / ny], [(c - (F - B) * ny) / nx, F - B], [B, F - B]], h: full }];
    }
    case 9:                                                      // the double-door cupboard and the left-wall leg
      return [rect(B, B, T + WARD - B, WARD_D, full), ...leftLeg(WARD_D)];
    case 10: case 11:                                            // the CORNER_W × CORNER_D corner cupboard, back to the wall behind the bench
      return cornerTooShallow(OPTIONS[state.option].no === 10 ? 'kitchen' : 'windows') ? [] : [rect(B, B, CORNER_W - B, CORNER_D - B, full)];
    default:
      return [];
  }
}
// The inside as words, for the description: each space's width along the
// back wall × depth out from it, and the clear height
function insideText() {
  const spaces = cupboardSpaces();
  if (!spaces.length) return '';
  const sizes = spaces.map(({ poly }) => {
    const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
    return `${Math.round(x1 - x0)} × ${Math.round(y1 - y0)}${poly.length > 4 ? ' at most' : ''}`;
  });
  return ` Inside, within its ${state.BOARD} boards (rear panels against the walls included): ${sizes.join(spaces.length > 1 ? ' along the back wall and ' : '')}` +
    `${spaces.length > 1 ? ' along the left wall' : ''}, ${spaces[0].h} high.`;
}
function inPoly([px, py], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// Whether thing k at spot {x, y, turned} is inside the cupboard: 'fits',
// 'out' (not in it at all), 'tall' (in it, but too tall there) or 'sticks'
// (partly outside it). Points across its footprint are tested.
function fitOf(k, { x, y, turned, z = 0 }, spaces) {
  const [w, d] = sizeOf(k, turned), { round } = STORED[k], h = STORED[k].h + z;   // up to its top, from the floor
  const steps = n => Array.from({ length: Math.ceil((n - 2) / 20) + 1 }, (_, i) => Math.min(1 + i * 20, n - 1));
  let any = 0, roomy = 0, all = 0;
  for (const dx of steps(w)) for (const dy of steps(d)) {
    if (round && Math.hypot(dx - w / 2, dy - d / 2) > w / 2 - 1) continue;
    const point = [x + dx, y + dy], inside = spaces.filter(sp => inPoly(point, sp.poly));
    all++;
    if (inside.length) any++;
    if (inside.some(sp => sp.h >= h)) roomy++;
  }
  return roomy === all ? 'fits' : !any ? 'out' : any === all ? 'tall' : 'sticks';
}
// Put the things where state.stored.where says, in its packing
function placeStored() {
  const { packing, where, spots: stored } = state.stored;
  if (where === 2) return;                                       // moved by hand: leave them
  const pack = PACKINGS[packing].at;
  // flip: the packing turned to run the other way (its x and y swapped)
  const lay = (ox, oy, flip) => pack.map(([x, y, t]) => flip ? { x: ox + y, y: oy + x, turned: !t } : { x: ox + x, y: oy + y, turned: Boolean(t) });
  const depth = Math.max(...pack.map(([, y, t], k) => y + sizeOf(k, t)[1]));
  let spots = lay(2000, Math.round((2907 - depth / 2) / 10) * 10, false);   // centred on the middle window
  const spaces = cupboardSpaces();
  if (where === 1 && spaces.length) {
    // Into a corner of the cupboard, whichever corner and way round fits most
    let best = -1;
    // (a board out from the walls, inside the rear panels)
    const corners = spaces.map(sp => [Math.min(...sp.poly.map(p => p[0])), Math.min(...sp.poly.map(p => p[1]))]);
    for (const [cx, cy] of corners) for (const flip of [false, true]) {
      const tryThis = lay(Math.round(cx), Math.round(cy), flip);
      const fit = tryThis.filter((spot, k) => fitOf(k, spot, spaces) === 'fits').length;
      if (fit > best) [best, spots] = [fit, tryThis];
    }
  }
  spots.forEach((spot, k) => Object.assign(stored[k], spot));
}

// In the plan: the cupboard's inside (a rectangle, or an L of two), outlined
// green when everything in it fits and red when something doesn't, and
// over each thing that sticks out, the part outside it shaded red, with how
// far it sticks out past the inside's edges
const planFitMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f, transparent: true, opacity: 0.55, depthTest: false, side: THREE.DoubleSide });
const planFitLine = { good: new THREE.LineBasicMaterial({ color: 0x2e7d32, depthTest: false }), bad: new THREE.LineBasicMaterial({ color: 0xb3261e, depthTest: false }) };
function planFit(spaces, fits) {
  const bad = fits.some(f => f === 'tall' || f === 'sticks');
  const lineMat = planFitLine[bad ? 'bad' : 'good'];
  for (const { poly } of spaces) {
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(poly.map(([x, y]) => P(x, y, CEILING_HEIGHT + 50))), lineMat);
    line.renderOrder = 8;
    storedGroup.add(line);
  }
  const [ix0, ix1] = spanOf(spaces.flatMap(s => s.poly), 0), [iy0, iy1] = spanOf(spaces.flatMap(s => s.poly), 1);
  dimLabel(`Cupboard inside ${Math.round(ix1 - ix0)} × ${Math.round(iy1 - iy0)}${spaces.length > 1 ? ' (an L)' : ''}`,
    P((ix0 + ix1) / 2, iy0 - 60, CEILING_HEIGHT + 100), storedGroup, bad ? '#b3261e' : '#2e7d32', 0.07);
  // The part of each thing outside, as 20 squares merged into one mesh
  const cells = [];
  STORED.forEach((s, k) => {
    if (fits[k] !== 'sticks') return;
    const { x, y } = state.stored.spots[k], [w, d] = storedSize(k);
    let ox0 = Infinity, oy0 = Infinity, ox1 = -Infinity, oy1 = -Infinity;
    for (let cx = x; cx < x + w; cx += 20) for (let cy = y; cy < y + d; cy += 20) {
      const c = [cx + 10, cy + 10];
      if (s.round && Math.hypot(c[0] - x - w / 2, c[1] - y - d / 2) > w / 2) continue;
      if (spaces.some(sp => inPoly(c, sp.poly))) continue;
      cells.push([cx, cy, Math.min(cx + 20, x + w), Math.min(cy + 20, y + d)]);
      [ox0, oy0, ox1, oy1] = [Math.min(ox0, cx), Math.min(oy0, cy), Math.max(ox1, Math.min(cx + 20, x + w)), Math.max(oy1, Math.min(cy + 20, y + d))];
    }
    if (ox0 === Infinity) return;
    // How far past the inside it reaches, on whichever sides it does
    const over = [x < ix0 && `${Math.round(ix0 - x)} left`, x + w > ix1 && `${Math.round(x + w - ix1)} right`,
      y < iy0 && `${Math.round(iy0 - y)} back`, y + d > iy1 && `${Math.round(y + d - iy1)} front`].filter(Boolean);
    dimLabel(over.length ? `out ${over.join(', ')}` : `out ${Math.round(ox1 - ox0)} × ${Math.round(oy1 - oy0)}`,
      P((ox0 + ox1) / 2, (oy0 + oy1) / 2, CEILING_HEIGHT + 120), storedGroup, '#b3261e', 0.055);
  });
  if (!cells.length) return;
  const pos = [];
  for (const [a, b, c, d] of cells) {
    const q = [P(a, b, CEILING_HEIGHT + 40), P(c, b, CEILING_HEIGHT + 40), P(c, d, CEILING_HEIGHT + 40), P(a, d, CEILING_HEIGHT + 40)];
    for (const i of [0, 1, 2, 0, 2, 3]) pos.push(q[i].x, q[i].y, q[i].z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const m = new THREE.Mesh(geo, planFitMat);
  m.renderOrder = 9;
  storedGroup.add(m);
}

function drawStored() {
  const { shown, packing, where: placed, spots: stored } = state.stored;
  storedGroup.traverse(o => {
    o.geometry?.dispose();
    if (o.isSprite || o.material?.map) {                        // labels have their own materials
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
  storedGroup.clear();
  storedGroup.visible = shown;
  showLifts();
  drawCupShelves();                                             // cut back round where they now stand
  copyCupboardToBedroom();                                      // with those shelves
  document.getElementById('storedToggle').textContent = `Stored things: ${shown ? 'shown' : 'hidden'}`;
  const plan = flat && flatView === 'plan';
  const spaces = cupboardSpaces(), fits = STORED.map((s, k) => fitOf(k, stored[k], spaces));
  if (plan && spaces.length) planFit(spaces, fits);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  STORED.forEach((s, k) => {
    const { x, y, z } = stored[k], [w, d] = storedSize(k);
    storedMats[k].depthTest = !plan;                             // in the plan they show through cupboard tops
    storedMats[k].emissive.set(fits[k] === 'tall' || fits[k] === 'sticks' ? 0x8a0f0f : 0x000000);   // red: in the cupboard but not fitting
    let m;
    if (s.round) {
      m = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 * MM, w / 2 * MM, s.h * MM, 40), storedMats[k]);
      m.position.copy(P(x + w / 2, y + d / 2, z + s.h / 2));
      m.castShadow = m.receiveShadow = true;
      storedGroup.add(m);
    } else {
      m = box({ from: [x, y, z], to: [x + w, y + d, z + s.h] }, storedMats[k], storedGroup);
    }
    m.userData.stored = k;
    m.renderOrder = plan ? 6 : 0;
    if (plan) dimLabel(s.label, P(x + w / 2, y + d / 2, CEILING_HEIGHT + 100), storedGroup, '#1f4e79', 0.06);
    else faceLabel(s.label, x, y, w, d, z + s.h, storedGroup);
    [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x + w), Math.max(y1, y + d)];
  });
  // The floor area they take, outlined just above the floor
  storedLineMat.color.set(fits.some(f => f === 'tall' || f === 'sticks') ? 0xb3261e : 0x1f4e79);   // red when something doesn't fit
  const outline = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => P(x, y, 5));
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(outline), storedLineMat);
  line.renderOrder = 7;
  storedGroup.add(line);
  const area = `${x1 - x0} × ${y1 - y0}`;
  if (plan) dimLabel(`Storage area ${area}`, P((x0 + x1) / 2, y1 + 110, CEILING_HEIGHT + 100), storedGroup, '#1f4e79', 0.08);
  const footprints = STORED.reduce((sum, s) => sum + s.w * s.d, 0);
  const lower = name => name.charAt(0).toLowerCase() + name.slice(1).replace(/ \(\d\)$/, '');   // 'drying racks', not 'Drying racks (2)'
  const why = { out: 'no room for it', tall: 'too tall there', sticks: 'sticks out' };
  const misfits = STORED.map((s, k) => fits[k] !== 'fits' ? `the ${lower(s.name)} (${why[fits[k]]})` : '').filter(Boolean);
  const inCupboard = fits.filter(f => f !== 'out').length;
  const where = !spaces.length
    ? (placed === 1 ? ' This option has no corner cupboard, so they stay by the middle window.' : '')
    : placed === 1 || inCupboard
      ? ` In option ${OPTIONS[state.option].no}'s corner cupboard: ${fits.filter(f => f === 'fits').length} of ${STORED.length} fit` +
        (misfits.length ? `; not ${misfits.join(', ')}.` : '.') + (cupCutText() || ' No shelves need cutting back.')
      : '';
  document.getElementById('storedInfo').textContent =
    `Standing on the floor they take ${area} (${((x1 - x0) * (y1 - y0) / 1e6).toFixed(2)} m², for ` +
    `${(footprints / 1e6).toFixed(2)} m² of footprints), up to ${Math.max(...STORED.map(s => s.h))} high.` + where +
    ' In the plan view, drag them to move them; double-click or double-tap one to turn it round.';
  document.getElementById('storedPacking').value = String(packing);
  document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = Number(r.value) === placed; });
}

// In the address: shown.packing.where, then x.y.turned for each (used when
// they've been moved by hand), and .z when it stands off the floor. Older
// links have only shown, and positions.
const storedAddress = ({ shown, packing, where, spots } = state.stored) => `${shown ? 1 : 0}.${packing}.${where}_` +
  spots.map(({ x, y, turned, z }) => `${x}.${y}.${turned ? 1 : 0}${z ? `.${z}` : ''}`).join('_');
function readStoredAddress(text) {
  if (!text) return;
  const [head, ...spots] = text.split('_');
  const [on, packing, where = 2] = head.split('.').map(Number), stored = state.stored;
  stored.shown = on !== 0;
  if (PACKINGS[packing]) stored.packing = packing;
  if ([0, 1, 2].includes(where)) stored.where = where;
  if (stored.where === 2) spots.forEach((spot, k) => {
    const [x, y, turned, z = 0] = spot.split('.').map(Number);
    if (stored.spots[k] && Number.isFinite(x) && Number.isFinite(y)) Object.assign(stored.spots[k], { x, y, turned: turned === 1, z: z >= 0 && z <= CEILING_HEIGHT ? z : 0 });
  });
  // From when the two racks were one 800 × 300 block: rack 2 stands beside
  // rack 1, 150 on, within it
  if (stored.where === 2 && spots.length < STORED.length) {
    const r = stored.spots[0];
    Object.assign(stored.spots[STORED.length - 1], { x: r.x + (r.turned ? 150 : 0), y: r.y + (r.turned ? 0 : 150), turned: r.turned });
  }
}
// Each thing's height off the floor, as on a shelf: 0 on the floor
const storedLifts = document.getElementById('storedLifts');
storedLifts.append(Object.assign(document.createElement('div'), { textContent: 'Off the floor (mm)', className: 'colhead' }), document.createElement('div'));
liftInputs = STORED.map((s, k) => {
  const input = Object.assign(document.createElement('input'), { type: 'number', min: 0, max: CEILING_HEIGHT, step: 10, value: 0 });
  input.setAttribute('aria-label', `${s.name}: off the floor`);
  input.addEventListener('change', () => {
    const { stored } = state;
    stored.spots[k].z = Math.min(CEILING_HEIGHT, Math.max(0, Number(input.value) || 0));
    input.value = stored.spots[k].z;
    if (stored.where !== 2) {                                   // as placed by hand, now
      stored.where = 2;
      document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = false; });
    }
    drawStored();
    writeAddress();
  });
  storedLifts.append(Object.assign(document.createElement('label'), { textContent: s.name }), input);
  return input;
});
function showLifts() { liftInputs.forEach((input, k) => { input.value = state.stored.spots[k].z; }); }
document.getElementById('storedToggle').addEventListener('click', () => {
  state.stored.shown = !state.stored.shown;
  drawStored();
  updatePalette();
  writeAddress();
});
function restow() {
  placeStored();
  drawStored();
  writeAddress();
}
document.getElementById('storedPack').addEventListener('click', () => {
  if (state.stored.where === 2) state.stored.where = 0;          // back to the window from wherever they were moved
  restow();
});
document.getElementById('storedPacking').innerHTML = PACKINGS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
document.getElementById('storedPacking').addEventListener('change', e => {
  state.stored.packing = Number(e.target.value);
  if (state.stored.where === 2) state.stored.where = 0;
  restow();
});
document.querySelectorAll('input[name=storedWhere]').forEach(r => r.addEventListener('change', () => {
  state.stored.where = Number(r.value);
  restow();
}));

// Dragging in the plan view. These listeners run before the view's own
// panning, and stop it when a stored thing is under the pointer.
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let storedDrag = null, lastTap = { k: -1, t: 0 };
function storedUnder(e, cam = flatCamera) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  cam.updateMatrixWorld();                                      // as they are now, even before the next frame
  storedGroup.updateMatrixWorld();
  raycaster.setFromCamera(pointer, cam);
  const hit = raycaster.intersectObjects(storedGroup.children, false).find(h => h.object.userData.stored !== undefined);
  return { k: hit ? hit.object.userData.stored : -1, x: raycaster.ray.origin.x / MM, y: raycaster.ray.origin.z / MM };
}
const canDrag = () => state.stored.shown && flat && flatView === 'plan';
renderer.domElement.addEventListener('pointerdown', e => {
  if (!canDrag()) return;
  const { k, x, y } = storedUnder(e);
  if (k < 0) return;
  e.stopImmediatePropagation();
  const now = performance.now();
  if (lastTap.k === k && now - lastTap.t < 350) {                // a double-click or double-tap turns it round
    const { stored } = state;
    stored.spots[k].turned = !stored.spots[k].turned;
    stored.where = 2;
    lastTap = { k: -1, t: 0 };
    drawStored();
    writeAddress();
    return;
  }
  lastTap = { k, t: now };
  storedDrag = { k, dx: x - state.stored.spots[k].x, dy: y - state.stored.spots[k].y };
  renderer.domElement.setPointerCapture(e.pointerId);
}, { capture: true });
renderer.domElement.addEventListener('pointermove', e => {
  if (!canDrag()) return;
  const { k, x, y } = storedUnder(e);
  if (!storedDrag) {
    renderer.domElement.style.cursor = k >= 0 ? 'grab' : '';
    return;
  }
  e.stopImmediatePropagation();
  renderer.domElement.style.cursor = 'grabbing';
  const spot = state.stored.spots[storedDrag.k];
  spot.x = Math.round((x - storedDrag.dx) / 10) * 10;           // to the nearest 10
  spot.y = Math.round((y - storedDrag.dy) / 10) * 10;
  state.stored.where = 2;
  drawStored();
}, { capture: true });
// The name and size of the thing under the pointer, in any view: on hover
// with a mouse, and for a moment after a tap on a touch screen
const tip = document.getElementById('tip');
let tipTimer = null;
function showTip(e) {
  const { k } = state.stored.shown && !storedDrag ? storedUnder(e, flat ? flatCamera : camera) : { k: -1 };
  if (k < 0) {
    tip.style.display = 'none';
    return;
  }
  const s = STORED[k], [w, d] = storedSize(k);
  tip.textContent = `${s.name}: ${s.round ? `${w} across` : `${w} × ${d} on the floor`}, ${s.h} high`;
  tip.style.display = 'block';
  const left = e.clientX + 14 + tip.offsetWidth > window.innerWidth ? e.clientX - 14 - tip.offsetWidth : e.clientX + 14;
  tip.style.left = `${left}px`;
  tip.style.top = `${e.clientY + 14}px`;
}
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' && !e.buttons) showTip(e);
  else if (e.pointerType === 'mouse') tip.style.display = 'none';   // not while rotating or panning
});
renderer.domElement.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
renderer.domElement.addEventListener('pointerup', e => {
  if (e.pointerType === 'mouse') return;
  showTip(e);
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { tip.style.display = 'none'; }, 2500);
});
for (const type of ['pointerup', 'pointercancel']) {
  renderer.domElement.addEventListener(type, e => {
    if (!storedDrag) return;
    e.stopImmediatePropagation();
    storedDrag = null;
    renderer.domElement.style.cursor = '';
    writeAddress();
  }, { capture: true });
}

// ---------------------------------------------------------------------------
// Switching options, and the controls
// ---------------------------------------------------------------------------
const tallSlider = document.getElementById('tallDoor');
const secondSlider = document.getElementById('secondDoor');
const roomSlider = document.getElementById('roomDoor');
const bedroomSlider = document.getElementById('bedroomDoor');
// The entrance's two doors (floor.js's ENTRANCE): the flat's own, into the
// stairs' foot, and the shared lobby's outside door
const flatDoorSlider = document.getElementById('flatDoor');
const outsideDoorSlider = document.getElementById('outsideDoor');
let current = null;          // { group, tall, second }
let bedroomCopy = null;      // the bedroom's copy of the corner cupboard, while it's there (copyCupboardToBedroom())

function update() {
  if (current) {
    if (current.tall) current.tall.rotation.y = -THREE.MathUtils.degToRad(Number(tallSlider.value));
    for (const s of [].concat(current.second ?? [])) s.rotation.y = (s.userData.dir ?? 1) * THREE.MathUtils.degToRad(Number(secondSlider.value));
  }
  roomHinge.rotation.y = THREE.MathUtils.degToRad(Number(roomSlider.value));
  bedroomHinge.rotation.y = -THREE.MathUtils.degToRad(Number(bedroomSlider.value));   // it opens the other way, into the bedroom
  for (const [h, s] of [[flatDoorHinge, flatDoorSlider], [outsideDoorHinge, outsideDoorSlider]]) h.rotation.y = (h.userData.dir ?? 1) * THREE.MathUtils.degToRad(Number(s.value));
  if (dims) updateDims();                                       // the doors' labels go with them
  applyCut();                                                   // the doors may have moved across a cut
  document.getElementById('tallDoorValue').textContent = `${tallSlider.value}°`;
  document.getElementById('secondDoorValue').textContent = `${secondSlider.value}°`;
  document.getElementById('roomDoorValue').textContent = `${roomSlider.value}°`;
  document.getElementById('bedroomDoorValue').textContent = `${bedroomSlider.value}°`;
  document.getElementById('flatDoorValue').textContent = `${flatDoorSlider.value}°`;
  document.getElementById('outsideDoorValue').textContent = `${outsideDoorSlider.value}°`;
  copyCupboardToBedroom();                                      // with its doors as they now stand
}

// The bedroom's New cupboard switch: a copy of the option's cupboard as
// built, doors, shelves and all, bar its bench, in the bedroom's corner
// (other_room.js). Copied again whenever the cupboard, its doors or its
// shelves change; the copy shares their shapes and colours.
function copyCupboardToBedroom() {
  bedroomCopy = null;
  if (!state.otherRoom.newCupboardOn || !current) return showNewCupboard(null);
  const copy = current.cupboard.clone();
  const benches = [];
  copy.traverse(o => { if (isBench(o)) benches.push(o); });
  for (const o of benches) o.parent?.remove(o);
  showNewCupboard(copy);
  bedroomCopy = copy;
}
[tallSlider, secondSlider, roomSlider, bedroomSlider, flatDoorSlider, outsideDoorSlider].forEach(s => s.addEventListener('input', update));

// The top bar's dropdown of options, kept in step by show()
const currentSelect = document.getElementById('current');
currentSelect.innerHTML = OPTIONS.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');
currentSelect.addEventListener('change', () => chooseOption(Number(currentSelect.value)));
// Choosing an option (not a link to one): with no left-wall cupboard, an
// option with a default for it gets one
function chooseOption(i) {
  changeSettings(s => { if (s.T === 0 && OPTIONS[i].defaultLeft) s.T = OPTIONS[i].defaultLeft; }, { option: i });
}


// The bedroom's pieces that can stand in the living room in place of the
// bench (the back wall's Bookshelf and Pine cupboard switches), each at its
// bedroom sizes: its settings are state[`${key}On`] and state[`${key}Move`],
// its controls `${key}On`, `${key}X` and so on. Where one stands: the middle
// of its back, room x and y, and how far it's turned, in quarter turns (as
// in the bedroom), which way it faces given in FACING. Each starts with its
// back to the back wall (`home`, from x0, where the clear wall starts): the
// bookcase centred on the clear wall, as the TV is, or against the
// cupboards if it's wider than that wall; the pine cupboard in the corner
// by the right-hand wall (chosen, 15 Oct 2026), the bookcase then centred
// on what's left, so the two can stand together. Their
// sliders move them from there.
const BACK_WALL_PIECES = {
  bookshelf: {
    sizes: () => state.otherRoom.bookcase, draw: bookcase, name: "A bookcase like the bedroom's", short: 'the bookcase',
    home: (x0, w) => ({ x: Math.max(x0 + w / 2, (x0 + clearTo()) / 2), y: 0, turn: 0 }),
    homeText(x0, w) {
      const span = clearTo() - x0, beside = pineInCorner() ? ' beside the pine cupboard' : '';
      return w <= span ? `centred on the ${span} of clear wall${beside}` : `against the cupboards, ${w - span} wider than the ${span} of clear wall${beside}`;
    },
  },
  pine: {
    sizes: () => state.otherRoom.cupboard, draw: pineCupboard, name: "The bedroom's pine cupboard", short: 'the pine cupboard',
    home: (x0, w) => ({ x: ROOM_WIDTH - w / 2, y: 0, turn: 0 }),
    homeText: () => 'in the corner by the right-hand wall',
  },
};
// Where the bookcase's clear wall ends: at the right-hand wall, or at the
// pine cupboard while it's in the corner there, where it starts
const pineInCorner = () => state.pineOn && !state.pineMove;
const clearTo = () => (pineInCorner() ? ROOM_WIDTH - state.otherRoom.cupboard.w : ROOM_WIDTH);
const BACK_WALL_KEYS = Object.keys(BACK_WALL_PIECES);
const FACING = { 0: 'the front wall', 90: 'the left wall', 180: 'the back wall', 270: 'the right wall' };
const onBackWall = () => BACK_WALL_KEYS.filter(key => state[`${key}On`]);
// The bench is drawn when it's on and nothing stands in its place
const benchDrawn = () => state.benchOn && onBackWall().length === 0;
const spotOf = key => state[`${key}Move`] ?? BACK_WALL_PIECES[key].home(OPTIONS[state.option].clearFrom(), BACK_WALL_PIECES[key].sizes().w);
// Draw one, clear of the bench wall from x0. Returns a sentence for the summary.
function pieceOnBenchWall(key, x0, g) {
  const { sizes, draw, name, homeText } = BACK_WALL_PIECES[key], { w, d, h } = sizes();
  const moved = state[`${key}Move`], { x, y, turn } = spotOf(key);
  const piece = draw({ w, d, h });                              // drawn with its back's middle at its origin, facing out
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  g.add(piece);
  const named = `${name} (${w} wide, ${d} deep, ${h} high)`;
  if (moved) return ` ${named} in place of the bench, moved: the middle of its back at x ${x}, y ${y}, facing ${FACING[turn]}.`;
  return ` ${named} on the back wall, ${homeText(x0, w)}.`;
}

// An option's description, with the bench off: no bench (rather than its
// length) and nothing on the back wall (or the bookcase there), and what
// stood on the bench at bench height
function withoutBench(text) {
  if (benchDrawn()) return text;
  const instead = onBackWall().map(key => BACK_WALL_PIECES[key].short).join(' and ');
  const backWall = instead ? ` No bench: ${instead} ${onBackWall().length > 1 ? 'stand' : 'stands'} there instead.` : ' No bench, so nothing on the back wall.';
  return text
    .replace(/ ?Bench (shortened to )?\d+[^.;]*? deep(;[^.]*)?\./g, backWall)
    .replace(/\. Base cupboards with \d+ doors under an oak top run on to the right-hand wall: [^.]*? deep\./, '. No base cupboards (no bench), so nothing on the back wall beyond.')
    .replace(/, where it's clear of the \d+-deep bench (\(y [^)]*\))/, ' $1')
    .replace(', behind the bench end.', '.')
    .replace(/Above the bench, /g, 'Above bench height, ');
}

// Build option i. A new option starts with its second door shut; rebuilding
// the same one (a size changed) leaves the doors as they were.
function show(i) {
  if (state.T === 0 && OPTIONS[i].needsLeft) i = optionAt(7);  // 8 falls back to 7
  const option = OPTIONS[i];
  const same = i === state.option && current;
  state.option = i;
  const group = buildOption(option);
  if (!benchDrawn()) takeOutBench(group, option);
  const backWall = benchDrawn() ? benchWall(option.clearFrom(), group)
    : onBackWall().map(key => pieceOnBenchWall(key, option.clearFrom(), group)).join('');
  const aboveText = backWall + frontWall(group, i) + sofa(group);
  showInMenus(option, i, aboveText);
  if (!same) secondSlider.value = 0;
  if (!same) viewKit.refresh();                                 // to the new option's cupboard (doors open, if packing), or TV
  redrawAround();
}

// The option's own build, in a new group in place of the last: its
// cupboard (and bench), and its cupboard shelves
function buildOption(option) {
  if (current) scene.remove(current.group);
  const group = new THREE.Group();
  scene.add(group);
  cupShelves = [];                                              // the option records its cupboard shelves as it's built
  pieces.dresser = pieces.larder = pieces.sofa = null;
  const cupboard = new THREE.Group();                           // the option's own build: its cupboard (and bench)
  group.add(cupboard);
  current = { group, cupboard, ...option.build(cupboard) };
  cupboard.add(cupShelfGroup);                                  // its shelves, drawn by drawStored(), round the things to store
  return group;
}

// The bench, as an option draws it: a bench top, or base cupboards
const isBench = o => o.userData.bench || (o.isMesh && o.material === benchMat);

// The bench off: the options draw it (a bench top, or base cupboards), so
// it's taken out again, with nothing above it; the TV's place is kept for
// the sofa to face
function takeOutBench(group, option) {
  const benches = [];
  group.traverse(o => { if (isBench(o)) benches.push(o); });
  for (const o of benches) o.parent?.remove(o);
  tvAt = [(option.clearFrom() + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
}

// The menus for option i: the option list, the description, and only the
// blocks of controls that apply to it
function showInMenus(option, i, aboveText) {
  const { T, above } = state;
  [...currentSelect.options].forEach((o, j) => { o.disabled = T === 0 && Boolean(OPTIONS[j].needsLeft); });
  currentSelect.value = String(i);
  document.getElementById('summary').innerHTML =
    `${withoutBench((T === 0 && option.summaryNoLeft ? option.summaryNoLeft : option.summary)())}${insideText()}${aboveText}<div class="src">From ${option.source}</div>`;
  const shown = (id, yes) => { document.getElementById(id).style.display = yes ? '' : 'none'; };
  shown('tallBlock', current.tall);
  const { no } = option;
  shown('legBlock', no === 7);
  shown('wardBlock', no === 9);
  shown('cornerBlock', no === 10 || no === 11);
  shown('sideShelfBlock', no === 10);                           // option 11's doors open where it would stand
  shown('sideShelfDetails', state.SIDE_SHELF);
  shown('front', !option.front);                                // options 10 and 11 have their own depth (cornerD)
  shown('depthBlock', !option.fixedWidth);
  shown('secondBlock', option.second);
  shown('tvBlock', above >= 2);
  shown('shelfBlock', above === 1 || above >= 3);               // only with shelves above the bench
  shown('benchDetails', benchDrawn());
  const piece = i === CURRENT || islandOnWall() ? 'none' : state.frontPiece;   // the dresser or a larder, if either is drawn
  shown('frontBlock', !(i === CURRENT || islandOnWall()));
  shown('islandMoveBlock', state.island.at === 'room');         // moving and turning: out there only
  shown('dresserBlock', piece === 'dresser');
  shown('larderBlock', piece === 'larder');
  shown('bookshelfBlock', piece === 'bookshelf');
  for (const key of BACK_WALL_KEYS) {
    shown(`${key}MoveBlock`, state[`${key}On`]);
    showPlace(key);                                             // where it starts follows the option's clear wall
  }
  showSofaPlace();                                              // where it starts follows the TV
  document.getElementById('secondLabel').textContent = option.second || '';
}

// Everything drawn round the option: dimensions, colours, the things to
// store and the cupboard shelves round them, the cutting list, the address
function redrawAround() {
  drawOtherRoom(state.otherRoom);                               // the bedroom's furniture
  drawWickerBench(state.wickerBench);                           // the wicker bench, in each room it's on in
  drawShoeRack(state.shoeRack);                                 // the shoe rack, downstairs
  drawGarage(state.garage, state.otherRoom.cupboard);                                     // Sean, Billy, BillyChest and the rest, in the garage
  updateDims();
  updatePalette();
  placeStored();                                                // the cupboard they go in may have changed
  drawStored();
  if (cupboardOnly) updateDims();                                // its shelves are drawn now, to dimension
  if (!cutList.hidden) showCuttingList();                       // with its shelves as drawn, round the things to store
  writeAddress();
  update();
}

// ---------------------------------------------------------------------------
// The address: the settings, one field each in this order, joined with "-"
// (room_dimensions.md has them all), then "~" and where the things to store
// are. Each field is [its place in state, how to write it, how to read it
// back]. Reading checks the text and gives the new value, or undefined to
// leave the setting as it was; it's given the value as it is, for fields of
// several parts. Adding a setting means adding it to state and here. The
// readers (number, within, radio, sizes) and the loops that write and read
// the fields are in kit/floor_kit.js.
// ---------------------------------------------------------------------------
const colour = number(code => (code === 0 || colourOf(code) ? code : undefined));
const ADDRESS = [
  ['option', optionCode, number(code => (code >= 1 ? optionIndex(code) : undefined))],
  ['T', String, number(t => (t === 0 || (t >= 300 && t <= 800) ? t : undefined))],
  ['R', String, within(300, 800)],
  ['F', String, radio('front')],
  ['above', String, radio('above')],
  ['shelfDepth', String, within(150, 400)],
  ['BENCH', String, radio('bench')],
  ['LEG', String, within(400, 1200)],
  ['WARD', String, within(600, 1400)],
  ['TOWER', String, within(0, 600)],
  ['WARD_D', String, within(330, 1000)],
  ['colours.floor', String, colour],
  ['colours.cupboard', String, colour],
  ['colours.wall', String, colour],
  ['colours.woodwork', String, colour],
  ['shelfWood', String, number(i => (SHELF_WOODS[i] ? i : undefined))],
  ['tv', String, number(t => (TV_SIZES.some(([inches]) => inches === t) ? t : undefined))],
  ['colours.dresser', String, colour],
  ['dresser', ...sizes(DRESSER_SLIDERS, true)],
  ['frontPiece', p => FRONT_PIECES.indexOf(p), number(i => FRONT_PIECES[i])],
  // A larder or sofa chosen comes at its own size, unless its sizes follow
  ['larder', l => l.key, (key, l) => (Object.hasOwn(LARDERS, key) ? { ...l, key, size: larderOwnSize(LARDERS[key]) } : undefined)],
  ['island.at', at => ISLAND_AT.indexOf(at), number(i => ISLAND_AT[i])],
  ['sofa', s => s.key || 'none', (key, s) => key === 'none' ? { ...s, key: '' }
    : Object.hasOwn(SOFAS, key) ? { ...s, key, size: sofaOwnSize(SOFAS[key]) } : undefined],
  ['sofa.front', String, within(1000, 3500)],
  ['larder.size', ...sizes(LARDER_SLIDERS)],
  ['sofa.size', ...sizes(SOFA_SLIDERS)],
  ['benchOn', on => (on ? 1 : 0), t => (t === '1' ? true : t === '0' ? false : undefined)],
  ['LEG_D', String, within(330, 1000)],
  ['L_SHELVES.back', tops => tops.join('.') || 0, text => readShelves(text)],
  ['L_SHELVES.left', tops => tops.join('.') || 0, text => readShelves(text)],
  ['island.move', m => `${m.x}.${m.y}.${m.turn}`, (text, m) => {
    const [x, y, turn] = text.split('.').map(v => (v ? Number(v) : NaN));
    return { x: x >= 0 && x <= ROOM_WIDTH ? x : m.x, y: y >= 0 && y <= ROOM_DEPTH ? y : m.y, turn: turn >= 0 && turn <= 180 ? turn : m.turn };
  }],
  ['BOARD', String, within(12, 25)],
  ['CORNER_W', String, within(500, 1200)],
  ['CORNER_D', String, within(0, 1329)],
  ['SIDE_SHELF', on => (on ? 1 : 0), t => (t === '1' ? true : t === '0' ? false : undefined)],
  ['SIDE_W', String, within(200, 800)],
  ['SIDE_D', String, within(150, 800)],
  ...OTHER_ROOM_ADDRESS,                                        // the bedroom's furniture
  ['bookshelfOn', on => (on ? 1 : 0), t => (t === '1' ? true : t === '0' ? false : undefined)],
  ...MIRROR_ADDRESS,                                            // the bedroom's mirror
  ...RECESS_FRONTS_ADDRESS,                                     // the upper recess cupboard's drawers and mirrors
  ['bookshelfMove', writeSpot, readSpot],
  ...BOOKCASE_ON_ADDRESS,                                       // the bedroom's bookcase there or not
  ...WICKER_BENCH_ADDRESS,                                      // the wicker bench's sizes, then where it is in each room
  ...CUPBOARD_ON_ADDRESS,                                       // the bedroom's pine cupboard there or not
  ['pineOn', on => (on ? 1 : 0), t => (t === '1' ? true : t === '0' ? false : undefined)],   // the pine cupboard in the living room
  ['pineMove', writeSpot, readSpot],
  ...MIRROR_ON_ADDRESS,                                         // the bedroom's mirror there or not
  ['colours.carpet', String, colour],                           // the carpet's colour (bedroom and stairs)
  ...SHOE_RACK_ADDRESS,                                         // the shoe rack's sizes and place, downstairs
  ...NEW_CUPBOARD_ON_ADDRESS,                                   // the corner cupboard copied into the bedroom, or not
  ['sofa.move', m => writeSpot(m, SOFA_HOME), text => readSpot(text, SOFA_HOME)],   // the sofa moved and turned, or where it starts
  ...GARAGE_ADDRESS,                                            // where Sean, Billy, BillyChest and the rest stand in the garage (the later ones added later)
];
// A piece in place of the bench moved, as `x.y.turn`, or AT_HOME where it
// starts (as links from before the bookshelf could move keep it); the sofa
// likewise, SOFA_HOME where it starts, facing the TV
const AT_HOME = 'wall', SOFA_HOME = 'tv';
function writeSpot(m, home = AT_HOME) {
  return m ? `${m.x}.${m.y}.${m.turn}` : home;
}
function readSpot(text, home = AT_HOME) {
  if (text === home) return null;
  const [x, y, turn] = text.split('.').map(v => (v ? Number(v) : NaN));
  const fits = x >= 0 && x <= ROOM_WIDTH && y >= 0 && y <= ROOM_DEPTH && turn >= 0 && turn < 360 && turn % QUARTER_TURN === 0;
  return fits ? { x, y, turn } : undefined;
}
// The settings: everything on show bar the view, as text (a scene's address)
function settingsAddress() {
  return `${writeFields(ADDRESS, state)}~${storedAddress()}`;
}
// Read a settings address (the part of the page's address before the
// view) into state. The boards' thickness goes first, as option 7's shelves
// are checked against it.
function readAddress(text) {
  const [settings, stored] = text.split('~');
  readFields(ADDRESS, state, settings, ['BOARD']);
  readStoredAddress(stored);
}
// replace: change the address without adding to the history, as when
// looking round
let sceneKit = null;               // the Scenes list (see below), shown the scene on screen as it changes
function writeAddress(replace = false) {
  const hash = `#${settingsAddress()}~${viewKit.address()}`;
  sceneKit?.refresh();
  try {
    if (replace) history.replaceState(null, '', hash);
    else location.hash = hash;
  } catch (e) { /* not important */ }
}

window.addEventListener('keydown', e => {
  const n = Number(e.key);
  if (n >= 1 && optionAt(n) >= 0) chooseOption(optionAt(n));
});

// Every settings control changes the settings through here: edit(state)
// changes them, then every control is put in step with them
// (syncControls()), the option is built again round them (show()), and, with
// look, the view follows anything looked at that's moved. option: the option
// to show, when one is chosen.
function changeSettings(edit, { option = state.option, look = false } = {}) {
  edit(state);
  syncControls();
  show(option);
  if (look) viewKit.refresh();
}

// The left-wall cupboard's depth: none at the far left (290 on the slider),
// then 300 to 800
const depthSlider = document.getElementById('depth');
depthSlider.addEventListener('input', () => {
  const v = Number(depthSlider.value);
  changeSettings(s => { s.T = v < 300 ? 0 : v; });
});
const rearSlider = document.getElementById('rear');
rearSlider.addEventListener('input', () => changeSettings(s => { s.R = Number(rearSlider.value); }));
const boardSlider = document.getElementById('board');
boardSlider.addEventListener('input', () => changeSettings(s => { s.BOARD = Number(boardSlider.value); }));
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.BENCH = Number(r.value); })));
// The description starts folded away; remember if the viewer opens it
const about = document.getElementById('about');
try { about.open = localStorage.getItem('aboutOpen') === '1'; } catch (e) { /* not important */ }
about.addEventListener('toggle', () => {
  try { localStorage.setItem('aboutOpen', about.open ? '1' : '0'); } catch (e) { /* not important */ }
});
// The drawer's other sections open or closed as they were left here
for (const sec of document.querySelectorAll('#panel details.sec[id^=sec]')) {
  try { const was = localStorage.getItem(`room_3d:${sec.id}`); if (was) sec.open = was === '1'; } catch (e) { /* not important */ }
  sec.addEventListener('toggle', () => {
    try { localStorage.setItem(`room_3d:${sec.id}`, sec.open ? '1' : '0'); } catch (e) { /* not important */ }
  });
}

for (const [id, key] of [['ward', 'WARD'], ['wardD', 'WARD_D'], ['tower', 'TOWER'], ['legD', 'LEG_D'], ['cornerW', 'CORNER_W'], ['cornerD', 'CORNER_D'], ['sideW', 'SIDE_W'], ['sideD', 'SIDE_D']]) {
  const slider = document.getElementById(id);
  slider.addEventListener('input', () => changeSettings(s => { s[key] = Number(slider.value); }));
}
// Option 10's side bookshelf: drawn, or not
const sideShelfSwitch = document.getElementById('sideShelfOn');
sideShelfSwitch.addEventListener('change', () => changeSettings(s => { s.SIDE_SHELF = sideShelfSwitch.checked; }));
const legSlider = document.getElementById('leg');
legSlider.addEventListener('input', () => changeSettings(s => { s.LEG = Number(legSlider.value); }));
// The cupboard and dresser colours: named colours to compare, or "Other
// colours…", which shows a second dropdown of popular cupboard colours and
// every RAL colour by family. ◀ and ▶ step between the named ones.
const POPULAR = [9010, 9001, 1013, 9016, 7035, 7044, 7038, 7030, 7004, 7016, 7021, 5014, 5008, 5011,
  6021, 6011, 6003, 6009, 1019, 1015, 8025, 3012, 9005];
const FAMILIES = [
  ['Whites and blacks', '9'], ['Greys', '7'], ['Beiges and yellows', '1'], ['Greens', '6'],
  ['Blues', '5'], ['Browns', '8'], ['Reds and pinks', '3'],
];
const ralLabel = code => `RAL ${code} ${RAL[code][0]}`;
// The named colours both pickers offer, then each picker's own extras
const NAMED = [
  [5, 'Clerkenwell Gloss White (as the kitchen)'], [4, 'AI Olive (from the AI picture)'],
  [6, "Bella Brittany (the blinds' fabric)"], [7, 'Blinds as drawn (the window colour)'],
  [8, 'Kitchen worktop (light stone)'], [9, 'Kitchen island (painted white)'], [10, 'Kitchen island top (honey oak)'],
];
const OTHER = 'other';
const OTHER_OPTIONS =
  `<optgroup label="Popular for cupboards">${POPULAR.map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('')}</optgroup>` +
  FAMILIES.map(([label, first]) => `<optgroup label="RAL ${label.toLowerCase()}">` +
    Object.keys(RAL).filter(c => c.startsWith(first)).map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('') +
    '</optgroup>').join('');
const colourRefreshers = [];
const refreshColours = () => colourRefreshers.forEach(f => f());
// A colour picker for one target: a dropdown of the named colours and the
// extras, ◀ ▶ to step between them, and "Other colours…" for any RAL colour
function colourPicker(target, [selectId, otherId, otherRowId, prevId, nextId, swatchId], extras, named = NAMED) {
  const select = document.getElementById(selectId), other = document.getElementById(otherId);
  const choices = [...named, ...extras], compare = choices.map(([code]) => code);
  select.innerHTML = choices.map(([code, label]) => `<option value="${code}">${label}</option>`).join('') +
    `<option value="${OTHER}">Other colours…</option>`;
  other.innerHTML = OTHER_OPTIONS;
  colourRefreshers.push(() => {
    const code = state.colours[target];
    const named = compare.includes(code);
    select.value = named ? String(code) : OTHER;
    document.getElementById(otherRowId).hidden = named;
    // The same colour can appear twice (popular and its family); keep whichever is selected
    if (!named && Number(other.value) !== code) other.value = String(code);
    const colour = colourOf(shownCode(target));
    document.getElementById(swatchId).style.background = colour ? colour.hex : 'transparent';
  });
  const pick = code => changeSettings(() => setRal(target, code));   // anything following it changes too
  // "Other colours…" starts on the other dropdown's current choice
  select.addEventListener('change', () => pick(select.value === OTHER ? Number(other.value) : Number(select.value)));
  other.addEventListener('change', () => pick(Number(other.value)));
  for (const [id, step] of [[prevId, -1], [nextId, 1]]) {
    document.getElementById(id).addEventListener('click', () => {
      // From a named colour, go to the next; from another colour, back to the first
      const k = compare.indexOf(state.colours[target]);
      pick(compare[k < 0 ? 0 : (k + step + compare.length) % compare.length]);
    });
  }
}
colourPicker('cupboard', ['ral-cupboard', 'ral-other', 'otherRow', 'colPrev', 'colNext', 'cupboardSwatch'],
  [[0, 'Same colour as the door'], [1, 'Same colour as the walls']]);
colourPicker('dresser', ['ral-dresser', 'ral-dresser-other', 'dresserOtherRow', 'dresserPrev', 'dresserNext', 'dresserSwatch'],
  [[0, 'Same as the cupboards'], [2, 'Same colour as the door'], [1, 'Same colour as the walls']]);
// The carpet: from the doorway photo (0, its default), the first photos'
// colour made lighter, or as it was, or Dormouse from the maker's swatch;
// none of the cupboards' named colours
colourPicker('carpet', ['ral-carpet', 'ral-carpet-other', 'carpetOtherRow', 'carpetPrev', 'carpetNext', 'carpetSwatch'],
  [[0, 'From the doorway photo'], [13, 'From the room photos, lighter (greyer)'], [12, 'From the room photos (darker)'], [11, 'Cormar Dormouse swatch (browner)']], []);
refreshColours();

// The shelf colour: the wooden shelves everywhere (above the bench, in the
// corner and upper units, option 9's tower) and option 9's oak top. As drawn,
// the shelves are a pale oak and option 9's oak is a little deeper; the
// others make them all one wood. Screen colours are approximate.
const SHELF_WOODS = [
  { name: 'As drawn (pale oak)', hex: ['#D6BC8F', '#C8A26B'] },
  { name: 'Honey oak (as the island top)', hex: '#D6A562' },
  { name: 'Dark oak', hex: '#8A5A33' },
  { name: 'Walnut', hex: '#5C3D26' },
];
const shelfSelect = document.getElementById('shelfWood');
shelfSelect.innerHTML = SHELF_WOODS.map((w, i) => `<option value="${i}">${w.name}</option>`).join('');
function setShelfWood(i) {
  state.shelfWood = i;
  const [shelves, oak = shelves] = [].concat(SHELF_WOODS[i].hex);   // one colour, or the shelves' and option 9's oak
  shelfMat.color.set(shelves);
  oakMat.color.set(oak);
  shelfSelect.value = String(i);
  document.getElementById('shelfSwatch').style.background = shelves;
}
setShelfWood(state.shelfWood);
shelfSelect.addEventListener('change', () => changeSettings(s => { s.shelfWood = Number(shelfSelect.value); }));

// "Colours in this view" in the menu: a colour square for each part on show,
// read from the model's own materials so it follows the choices above. Parts
// whose materials are local to their drawing code are listed by value.
function updatePalette() {
  const { option, shelfWood, above } = state;
  const current = option === OPTIONS.length - 1;                // the room as it is, no cupboards
  const hex = m => `#${m.color.getHexString().toUpperCase()}`;
  const rows = [
    ...(current ? [] : [['Cupboards and bench', hex(carcassMat), colourOf(shownCode('cupboard')).name], ['Handles', hex(handleMat)]]),
    ...(current ? [] : [['Dresser', hex(dresserMat), colourOf(shownCode('dresser')).name]]),
    ['Shelves', hex(shelfMat), SHELF_WOODS[shelfWood].name],
    ...(OPTIONS[option].no === 9 ? [['Tower shelves and oak top', hex(oakMat), SHELF_WOODS[shelfWood].name]] : []),
    ...(above >= 2 ? [['TV', hex(tvMat)], ['TV screen', hex(screenMat)]] : []),
    ['Walls', hex(wallMat), colourOf(shownCode('wall')).name],
    ['Door, frame and sills', hex(frameMat), colourOf(shownCode('woodwork')).name],
    ['Ceiling', hex(ceilingMat), 'Pure Brilliant White, matt'],
    ['Floor', FINISHES[3].hex, 'Howdens oak 3-strip, on average'],
    ['Carpet (bedroom and stairs)', hex(carpetMat), colourOf(shownCode('carpet')).name],
    ['Kitchen units', hex(kitchenMat), 'Clerkenwell Gloss White'],
    ['Kitchen worktop', hex(worktopMat), 'Light stone laminate'],
    ['Sink', '#C4C8CC', 'Stainless steel'],
    ['Alcove tiles', '#EEEEEA'],
    ['Island', hex(islandMat), 'Painted white'],
    ['Island top', hex(islandTopMat), 'Oak'],
    ['Desk', '#F2F1EE'],
    ['Chair, monitors and riser', '#222222'],
    ['Window panes (blinds)', '#CFE3EF', 'See-through: shows as about #B8C0BF'],
    ['Radiators', '#F6F6F4'],
    ...(state.stored.shown ? STORED.map((t, k) => [t.name, hex(storedMats[k]), 'to store']) : []),
  ];
  document.getElementById('paletteList').innerHTML = rows.map(([what, value, name]) =>
    `<div class="colrow"><span class="swatch" style="background:${value}"></span>` +
    `<span class="what">${what}${name ? ` · ${name}` : ''}</span><code>${value}</code></div>`).join('');
}
// The palette starts folded away; remember if the viewer opens it
const palette = document.getElementById('palette');
try { palette.open = localStorage.getItem('paletteOpen') === '1'; } catch (e) { /* not important */ }
palette.addEventListener('toggle', () => {
  try { localStorage.setItem('paletteOpen', palette.open ? '1' : '0'); } catch (e) { /* not important */ }
});

const shelfSlider = document.getElementById('shelfDepth');
shelfSlider.addEventListener('input', () => changeSettings(s => { s.shelfDepth = Number(shelfSlider.value); }));
// The TV size, one of TV_SIZES by its place in the list
const tvSlider = document.getElementById('tvSize');
// The dresser's sliders
// sizes: { key: mm } for any of the slider keys, each held to its slider's range
function setDresser(sizes) {
  for (const [k, , lo, hi] of DRESSER_SLIDERS) if (Number.isFinite(sizes[k])) state.dresser[k] = Math.min(hi, Math.max(lo, sizes[k]));
  placeDresser();
}
function showDresser() {
  for (const [k, id] of DRESSER_SLIDERS) {                       // the upper depth may have been held to the base's
    document.getElementById(id).value = String(state.dresser[k]);
    document.getElementById(`${id}Value`).textContent = state.dresser[k];
  }
  showDresserPick();
}
for (const [key, id] of DRESSER_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => changeSettings(() => setDresser({ [key]: Number(e.target.value) })));
}
// The Dresser dropdown: the dressers in dressers.js, or Custom when
// the sliders match none of them
const dresserPick = document.getElementById('dresserPick');
const dresserCustom = Object.assign(document.createElement('option'), { value: '', textContent: 'Custom (the sliders below)', disabled: true });
dresserPick.append(dresserCustom, ...Object.entries(DRESSERS).map(([id, d]) =>
  Object.assign(document.createElement('option'), { value: id, textContent: `${d.label} (${d.w} × ${d.h})` })));
function showDresserPick() {
  const match = Object.entries(DRESSERS).find(([, d]) => DRESSER_SLIDERS.every(([k]) => d[k] === state.dresser[k]));
  dresserPick.value = match ? match[0] : '';
}
// Looking at the dresser: at it as it is now
dresserPick.addEventListener('change', () => changeSettings(() => setDresser(DRESSERS[dresserPick.value]), { look: true }));
// The sofa: none, or one from the list, and how far its front is from the TV wall
const sofaPick = document.getElementById('sofaPick'), sofaSlider = document.getElementById('sofaFront');
sofaPick.append(Object.assign(document.createElement('option'), { value: '', textContent: 'None' }),
  ...Object.entries(SOFAS).map(([id, S]) => Object.assign(document.createElement('option'), { value: id, textContent: `${S.label} (${S.w} × ${S.d})` })));
// The dropdown shows Custom when the sliders have changed its sizes
const sofaCustom = Object.assign(document.createElement('option'), { value: 'custom', disabled: true });
sofaPick.insertBefore(sofaCustom, sofaPick.options[1] ?? null);
function showSofa() {
  const { key, front, size } = state.sofa, own = SOFAS[key] && sofaOwnSize(SOFAS[key]);
  sofaCustom.textContent = `Custom: the ${SOFAS[key]?.label ?? 'sofa'}, resized`;
  sofaPick.value = !key ? '' : SOFA_SLIDERS.every(([k]) => own[k] === size[k]) ? key : 'custom';
  sofaSlider.value = front;
  document.getElementById('sofaFrontValue').textContent = front;
  for (const [k, id] of SOFA_SLIDERS) {
    document.getElementById(id).value = String(size[k]);
    document.getElementById(`${id}Value`).textContent = size[k];
  }
  document.getElementById('sofaFrontBlock').style.display = key ? '' : 'none';
  document.getElementById('sofaFrontRow').style.display = state.sofa.move ? 'none' : '';   // moved, its sliders say where
}
// sizes: { key: mm } for any of the slider keys, each held to its slider's range
function setSofaSize(sizes) {
  for (const [k, , lo, hi] of SOFA_SLIDERS) if (Number.isFinite(sizes[k])) state.sofa.size[k] = Math.min(hi, Math.max(lo, sizes[k]));
}
for (const [key, id] of SOFA_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => changeSettings(() => setSofaSize({ [key]: Number(e.target.value) }), { look: true }));
}
sofaPick.addEventListener('change', () => changeSettings(s => {
  s.sofa.key = sofaPick.value;
  if (SOFAS[s.sofa.key]) s.sofa.size = sofaOwnSize(SOFAS[s.sofa.key]);
}, { look: true }));
sofaSlider.addEventListener('input', () => changeSettings(s => { s.sofa.front = Number(sofaSlider.value); }, { look: true }));
// Cupboard only: the rest of the room hidden, and the cupboard's dimensions shown
document.getElementById('cupboardOnly').addEventListener('change', e => {
  cupboardOnly = e.target.checked;
  applyCut();
  updateDims();
  if (flat) viewKit.setView(viewKit.viewId || 'plan');          // framed for it, or for the room again
});
// The bench: drawn, or not (and nothing above it)
const benchSwitch = document.getElementById('benchOn');
benchSwitch.addEventListener('change', () => changeSettings(s => { s.benchOn = benchSwitch.checked; }, { look: true }));
// The bookshelf and the pine cupboard, in place of the bench. While either
// is on, the Bench switch is off and can't be changed; benchOn is kept, for
// when they're off again. Moving one, and turning it in quarter turns: the
// first move starts from where it stands; Reset location puts it back
// against the wall
const PLACE_SLIDERS = [['x', 'X', ROOM_WIDTH, 5, ''], ['y', 'Y', ROOM_DEPTH, 5, ''], ['turn', 'Turn', 360 - QUARTER_TURN, QUARTER_TURN, '°']];
const roundedSpot = ({ x, y, turn }) => ({ x: Math.round(x), y: Math.round(y), turn });
const backWallSwitches = {};
for (const key of BACK_WALL_KEYS) {
  const onSwitch = backWallSwitches[key] = document.getElementById(`${key}On`);
  onSwitch.addEventListener('change', () => changeSettings(s => { s[`${key}On`] = onSwitch.checked; }, { look: true }));
  for (const [k, suffix, max, step] of PLACE_SLIDERS) {
    const input = Object.assign(document.getElementById(`${key}${suffix}`), { min: '0', max: String(max), step: String(step) });
    input.addEventListener('input', () => changeSettings(s => { s[`${key}Move`] = { ...roundedSpot(spotOf(key)), [k]: Number(input.value) }; }));
  }
  document.getElementById(`${key}Home`).addEventListener('click', () => changeSettings(s => { s[`${key}Move`] = null; }));
}
function showPlace(key) {
  const spot = roundedSpot(spotOf(key));
  for (const [k, suffix, , , unit] of PLACE_SLIDERS) {
    document.getElementById(`${key}${suffix}`).value = String(spot[k]);
    document.getElementById(`${key}${suffix}Value`).textContent = `${spot[k]}${unit}`;
  }
}
// Moving the sofa about the room, and turning it about its middle in quarter
// turns: the first move starts from where it stands, centred on the TV;
// Reset location puts it back there, its front the slider's distance away
const sofaTurn = document.getElementById('sofaTurn');
for (const [k, suffix, max, step] of PLACE_SLIDERS.filter(([k]) => k !== 'turn')) {
  const input = Object.assign(document.getElementById(`sofa${suffix}`), { min: '0', max: String(max), step: String(step) });
  input.addEventListener('input', () => changeSettings(s => { s.sofa.move = { ...sofaPlace(), [k]: Number(input.value) }; }, { look: true }));
}
sofaTurn.addEventListener('change', () => changeSettings(s => { s.sofa.move = { ...sofaPlace(), turn: Number(sofaTurn.value) }; }, { look: true }));
document.getElementById('sofaHome').addEventListener('click', () => changeSettings(s => { s.sofa.move = null; }, { look: true }));
// Where the sofa is, to the nearest mm (the TV's middle may fall on a half)
function sofaPlace() {
  return roundedSpot(state.sofa.move ?? sofaHome(currentSofa()));
}
function showSofaPlace() {
  if (!SOFAS[state.sofa.key]) return;
  const { x, y, turn } = sofaPlace();
  for (const [suffix, v] of [['X', x], ['Y', y]]) {
    document.getElementById(`sofa${suffix}`).value = String(v);
    document.getElementById(`sofa${suffix}Value`).textContent = v;
  }
  sofaTurn.value = String(turn);
}
// On the front wall, the bookcase's sizes: the bedroom's (its sliders in
// Bedroom options), so either set changes the one bookcase
const bookshelfSizeId = k => `bookshelf${k.toUpperCase()}`;
document.getElementById('bookshelfSizes').innerHTML = BOOKCASE_SIZES.map(([k, lo, hi]) =>
  `<label for="${bookshelfSizeId(k)}">Bookshelf ${SIZE_LABEL[k].toLowerCase()}: <span id="${bookshelfSizeId(k)}Value"></span></label>` +
  `<input id="${bookshelfSizeId(k)}" type="range" min="${lo}" max="${hi}" step="10">`).join('');
for (const [k] of BOOKCASE_SIZES) {
  document.getElementById(bookshelfSizeId(k)).addEventListener('input', e => changeSettings(s => { s.otherRoom.bookcase[k] = Number(e.target.value); }, { look: true }));
}
function showBookshelfSizes() {
  for (const [k] of BOOKCASE_SIZES) {
    document.getElementById(bookshelfSizeId(k)).value = String(state.otherRoom.bookcase[k]);
    document.getElementById(`${bookshelfSizeId(k)}Value`).textContent = state.otherRoom.bookcase[k];
  }
}
// Option 7's shelves: a list of tops for each leg, 100 up to just under the
// ceiling (none is fine)
const shelfInputs = { back: document.getElementById('shelvesBack'), left: document.getElementById('shelvesLeft') };
const readShelves = text => [...new Set(String(text).split(/[^0-9]+/).map(Number).filter(v => v >= 100 && v <= CEILING_HEIGHT - 2 * state.BOARD))].sort((a, b) => a - b);
function showShelves() {
  for (const k of ['back', 'left']) shelfInputs[k].value = state.L_SHELVES[k].join(', ');
}
for (const k of ['back', 'left']) shelfInputs[k].addEventListener('change', () => changeSettings(s => { s.L_SHELVES[k] = readShelves(shelfInputs[k].value); }));
// The island: where it is, or against the front wall
document.querySelectorAll('input[name=islandAt]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.island.at = r.value; }, { look: true })));
// Out there: the island's middle, and how far it's turned
for (const [k, id] of [['x', 'islandX'], ['y', 'islandY'], ['turn', 'islandTurn']]) {
  document.getElementById(id).addEventListener('input', e => changeSettings(s => { s.island.move[k] = Number(e.target.value); }));
}
// On the front wall: the dresser, a larder or nothing; and which larder
document.querySelectorAll('input[name=frontPiece]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.frontPiece = r.value; }, { look: true })));
// The Larder dropdown: the larders in larders.js, or Custom when the
// sliders have changed its sizes (it keeps that larder's front)
const larderPick = document.getElementById('larderPick');
const larderCustom = Object.assign(document.createElement('option'), { value: '', disabled: true });
larderPick.append(larderCustom, ...Object.entries(LARDERS).map(([id, L]) =>
  Object.assign(document.createElement('option'), { value: id, textContent: `${L.label} (${L.w} × ${larderHeight(L)})` })));
// sizes: { key: mm } for any of the slider keys, each held to its slider's range
function setLarderSize(sizes) {
  for (const [k, , lo, hi] of LARDER_SLIDERS) if (Number.isFinite(sizes[k])) state.larder.size[k] = Math.min(hi, Math.max(lo, sizes[k]));
}
function showLarder() {
  const { key, size } = state.larder;
  for (const [k, id] of LARDER_SLIDERS) {
    document.getElementById(id).value = String(size[k]);
    document.getElementById(`${id}Value`).textContent = size[k];
  }
  const L = LARDERS[key], own = L && larderOwnSize(L);
  larderCustom.textContent = `Custom: the ${L?.label ?? 'larder'}, resized`;
  larderPick.value = own && LARDER_SLIDERS.every(([k]) => own[k] === size[k]) ? key : '';
}
larderPick.addEventListener('change', () => changeSettings(s => {
  s.larder.key = larderPick.value;
  s.larder.size = larderOwnSize(LARDERS[s.larder.key]);
}, { look: true }));
for (const [key, id] of LARDER_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => changeSettings(() => setLarderSize({ [key]: Number(e.target.value) }), { look: true }));
}
tvSlider.addEventListener('input', () => changeSettings(s => { s.tv = TV_SIZES[Number(tvSlider.value)][0]; }));
document.querySelectorAll('input[name=above]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.above = Number(r.value); })));
document.querySelectorAll('input[name=front]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.F = Number(r.value); })));

let xray = false;
document.getElementById('xray').addEventListener('click', e => {
  xray = !xray;
  carcassMat.transparent = xray;
  carcassMat.opacity = xray ? 0.25 : 1;
  carcassMat.depthWrite = !xray;
  carcassMat.needsUpdate = true;
  e.target.textContent = `See-through cupboards: ${xray ? 'on' : 'off'}`;
});

// The room's own views, in scene metres: [x, height, y], so room (x, y, z)
// in mm / 1000 as (x, z, y). 3D views place the perspective camera at
// `position`, looking at `target`, and may set hfov, the angle across in
// degrees; 2D views place the flat one and give the width and height (m) to
// fit on screen. The config-defined views, the places you can be and the
// things you can look at are in living_room.views.js, for editing; kit/view_kit.js
// does the choosing (see viewKit below).
// The bedroom and the hallway (floor.js), for the bird's eye and the plan,
// which frame whichever room is chosen (the kit's `rooms`): each one's
// middle and size, in scene metres, and the bedroom's window wall's x
const BEDROOM_AREA = { x: (OTHER_ROOM_CORNER.x + OTHER_ROOM.length / 2) * MM, y: (OTHER_ROOM_CORNER.y + OTHER_ROOM.recessBack / 2) * MM,
  w: OTHER_ROOM.length * MM, d: OTHER_ROOM.recessBack * MM };
const HALLWAY_AREA = { x: (HALLWAY.x0 + HALLWAY.xEnd) / 2 * MM, y: HALLWAY.ySetBack / 2 * MM, w: HALLWAY.length * MM, d: HALLWAY.ySetBack * MM };
// The stairs and the entrance: from the hallway's door wall to the
// building's back wall, and from the stairs' outside wall across the lobby
const ENTRANCE_AREA = { x: (HALLWAY.x0 + ENTRANCE.xBack) / 2 * MM, y: ENTRANCE.yLobby1 / 2 * MM, w: (HALLWAY.x0 - ENTRANCE.xBack) * MM, d: ENTRANCE.yLobby1 * MM };
const BEDROOM_WINDOW_WALL = OTHER_ROOM_CORNER.x * MM;
// The garage (garage.js), likewise, and its floor's level
const GARAGE_AREA = { x: (GARAGE_CORNER.x + GARAGE.length / 2) * MM, y: (GARAGE_CORNER.y + GARAGE.width / 2) * MM, w: GARAGE.length * MM, d: GARAGE.width * MM };
const GARAGE_FLOOR = ENTRANCE.floor * MM;
// A room's plan: straight down on its middle, the back wall's side at the
// top as in the living room's, with room round it for its dimensions
const PLAN_MARGIN = 1.4;                                        // metres, chosen
const planOf = ({ x, y, w, d }) => ({ position: [x, 20, y + 0.001], target: [x, 0, y], fit: [w + PLAN_MARGIN, d + PLAN_MARGIN] });
const builtInViews = {
  top:    { label: 'Top', title: 'Straight down from above', position: [1.92, 9.5, 2.9], target: [1.92, 0, 2.86] },
  corner: { label: 'Corner', title: 'From high in the corner by the desk', position: [4.6, 3.4, 5.4], target: [1.0, 1.0, 1.0] },
  // High above the windows, looking down across the room towards the door
  // and the kitchen. The outer wall and ceiling only show from inside, so
  // the room is open from here; any further out and the outer wall's brick
  // face would hide the floor along it. The same over the bedroom, from
  // above its window, and over the hallway, from above the stairs' outside
  // wall, which likewise only shows from inside
  birdseye: { label: "Bird's eye", title: 'Looking down on the room', position: [4.5, 7.5, 2.75], target: [1.2, 0, 2.75], hfov: 66,
    rooms: {
      bedroom: { position: [BEDROOM_WINDOW_WALL - 0.66, 7.5, BEDROOM_AREA.y], target: [BEDROOM_WINDOW_WALL + 2.6, 0, BEDROOM_AREA.y] },
      hallway: { position: [HALLWAY_AREA.x, 6.0, -1.8], target: [HALLWAY_AREA.x, 0, 1.6] },
      downstairs: { position: [ENTRANCE_AREA.x, 3.6, -3.4], target: [ENTRANCE_AREA.x, ENTRANCE.floor / 2 * MM, 1.2] },   // aimed halfway down the stairs, chosen to fit
      garage: { position: [GARAGE_AREA.x + 4.5, GARAGE_FLOOR + 6.5, GARAGE_AREA.y], target: [GARAGE_AREA.x - 0.6, GARAGE_FLOOR, GARAGE_AREA.y] },   // above its door, looking in (chosen to fit)
    } },
  // The wall views leave out what's on the camera's side of their cut (see
  // applyCut): the back wall view everything past the return wall, the left
  // wall view the island, the dresser and beyond, the front wall view
  // everything short of the island's far end, the right wall view everything
  // left of the desk recess
  plan:   { label: 'Plan (2D)', position: [1.4, 20, 2.861], target: [1.4, 0, 2.86], fit: [6.0, 6.9],    // back wall at the top
    rooms: { bedroom: planOf(BEDROOM_AREA), hallway: planOf(HALLWAY_AREA), downstairs: planOf(ENTRANCE_AREA), garage: planOf(GARAGE_AREA) } },
  back:   { label: 'Back wall (2D)', position: [1.9, 1.0, 30], target: [1.9, 1.0, 0], fit: [5.0, 3.2], cut: ['y', 2240, 1] },        // facing the back wall
  left:   { label: 'Left wall (2D)', position: [30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.0, 3.2], cut: ['x', 700, 1] },         // facing the left wall, back wall on the right
  front:  { label: 'Front wall (2D)', position: [1.37, 1.0, -30], target: [1.37, 1.0, 0], fit: [6.2, 3.2], cut: ['y', 4300, -1] },   // facing the front wall, left wall on the right
  right:  { label: 'Right wall (2D)', position: [-30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.2, 3.2], cut: ['x', 2220, -1] },   // facing the right wall, back wall on the left
};

// Packing: standing back from the corner cupboard's door (PACK_BACK, below),
// eyes at standing height, looking in and down a little, with its doors open wide.
// Where that is depends on the option, so it's worked out when chosen.
// Returns the middle of the door opening (or for an L, its inside corner)
// and the way out of it.
function packingSpot() {
  const { T, R, F, LEG, LEG_D, WARD, WARD_D, CORNER_W, CORNER_D } = state;
  const mid = (x, y, nx, ny) => ({ x, y, nx, ny });
  // An L (back-wall leg Dl deep, left-wall leg T deep): standing diagonally
  // in front of its inside corner, looking into it, to see into both legs
  const lCorner = Dl => mid(T, Dl, Math.SQRT1_2, Math.SQRT1_2);
  switch (OPTIONS[state.option].no) {
    case 7:                                                      // an L: in front of its inside corner; else the back-wall leg's door
      return T ? lCorner(LEG_D) : mid(T + LEG / 2, LEG_D, 0, 1);
    case 8: {                                                    // the diagonal doors
      const { ux, uy } = diagonal();
      return mid(T + 350, (F + R) / 2, -uy, ux);
    }
    case 9:                                                      // likewise an L, else the double doors
      return T ? lCorner(WARD_D) : mid(T + WARD / 2, WARD_D, 0, 1);
    case 10:                                                     // doors on its end, facing the kitchen
      return cornerTooShallow('kitchen') ? null : mid(CORNER_W / 2, CORNER_D, 0, 1);
    case 11:                                                     // doors on its side, facing the windows
      return cornerTooShallow('windows') ? null : mid(CORNER_W, (R + CORNER_D) / 2, 1, 0);
    default:
      return null;
  }
}
const PACK_BACK = 1250;             // mm out from the cupboard's door: arm's reach (750) and half a metre
function packingView() {
  const at = packingSpot();
  if (!at) return builtInViews.corner;                                  // no corner cupboard: the corner view
  // Its doors open wide, all of them, folded back out of the way (at 90° one
  // can stand across the front of the other; an option with only one has
  // the other slider unused)
  tallSlider.value = 170;
  secondSlider.value = 170;
  roomSlider.value = 0;                                          // the room door shut, as it can hide the cupboard
  update();
  const { x, y, nx, ny } = at, m = v => v / 1000;
  return { posture: 'stand', position: [m(x + PACK_BACK * nx), 1.6, m(y + PACK_BACK * ny)], target: [m(x - 300 * nx), 0.9, m(y - 300 * ny)], hfov: 95 };
}
let flatFit = builtInViews.plan.fit;
let flatPerM = null;               // the 2D views' scale, pixels per metre at zoom 1
// The 2D/3D switch, fitting the views to the screen, and the render loop:
// kit/floor_kit.js's, reading the views' framing from here
const { setFlat, resize, startLoop, draw } = flatViews({ scene, renderer, camera, controls, flatCamera, flatControls }, {
  get flat() { return flat; },
  set flat(on) { flat = on; },
  get flatFit() { return flatFit; },
  get flatPerM() { return flatPerM; },
  set flatPerM(perM) { flatPerM = perM; },
  get hfov() { return viewKit.hfov; },
  get drawers() { return drawers; },
});

// Things to look at that move with the option or the sliders: where to aim,
// room [x, y, height] in mm
// The middle of what's drawn, room [x, y, height] in mm
function middleOf(object) {
  const c = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  return [c.x / MM, c.z / MM, c.y / MM];
}
// A point given in a piece's own mm (across it, along it), on the floor,
// room [x, y] in mm, wherever the piece now stands and however it's turned
function pointOn(piece, [across, along]) {
  piece.updateWorldMatrix(true, false);
  const p = piece.localToWorld(new THREE.Vector3(across * MM, 0, along * MM));
  return [p.x / MM, p.z / MM];
}
const anchors = {
  // Wherever they are, else where they'd be on the front wall
  dresser: () => pieces.dresser ? middleOf(pieces.dresser) : [(state.dresser.x0 + state.dresser.x1) / 2, ROOM_DEPTH - state.dresser.baseD / 2, state.dresser.h / 2],
  larder: () => pieces.larder ? middleOf(pieces.larder) : [frontFrom() + frontGap() / 2, ROOM_DEPTH - 250, 1000],
  island: () => middleOf(islandGroup),
  sofa: () => pieces.sofa ? middleOf(pieces.sofa) : [ROOM_WIDTH / 2, 2400, 500],
  // Sitting on it: in the middle, eyes over the back of the seat
  sofaSeat: () => {
    if (!SOFAS[state.sofa.key] || !pieces.sofa) return [ROOM_WIDTH / 2, 2500];
    const S = currentSofa();
    return pointOn(pieces.sofa, [0, -S.d / 2 + S.seatD - 100]);
  },
  cupboard: () => {                                             // the middle of its door, else the corner
    const at = packingSpot();
    return at ? [at.x, at.y, 1200] : [400, 400, 1200];
  },
  tv: () => tvAt ?? [ROOM_WIDTH / 2, 0, 1400],
  // The bedroom's furniture (other_room.js), and where you lie on the bed
  // and stand beside it, as it's moved and turned
  bed: () => middleOf(otherRoomPieces.bed),
  bookcase: () => middleOf(otherRoomPieces.bookcase),
  pineCupboard: () => middleOf(otherRoomPieces.cupboard),
  newCupboard: () => {                                          // with none (switched off, or option 16), the pine cupboard's spot
    const drawn = new THREE.Box3().setFromObject(otherRoomPieces.newCupboard);
    return middleOf(drawn.isEmpty() ? otherRoomPieces.cupboard : otherRoomPieces.newCupboard);
  },
  mirror: () => middleOf(otherRoomPieces.mirror),
  bedPillow: () => pointOn(otherRoomPieces.bed, BED_SPOTS.pillow),
  bedSide: () => pointOn(otherRoomPieces.bed, BED_SPOTS.side),
  // The wicker bench (wicker_bench.js), wherever it is in each room
  hallBench: () => middleOf(wickerBenches.hallway),
  bedroomBench: () => middleOf(wickerBenches.bedroom),
  livingBench: () => middleOf(wickerBenches.livingRoom),
  // The shoe rack (shoe_rack.js), wherever it stands at the foot of the stairs
  shoeRack: () => middleOf(shoeRack),
  // Sean, Billy, BillyChest and the rest (garage.js), wherever they stand in the garage
  ...Object.fromEntries(Object.keys(garagePieces).map(piece => [piece, () => middleOf(garagePieces[piece])])),
};
const DOORS = [roomSlider, tallSlider, secondSlider, bedroomSlider, flatDoorSlider, outsideDoorSlider];   // newer doors last, so older links leave them as they start
const addressView = location.hash.split('~')[2];               // read before anything rewrites the address
const viewKit = ViewKit.create({
  THREE, camera, controls, canvas: renderer.domElement,
  room: 'room_3d',
  config: ROOM_VIEWS,
  builtIn: builtInViews,
  origins: { bedroom: [OTHER_ROOM_CORNER.x, OTHER_ROOM_CORNER.y], garage: [GARAGE_CORNER.x, GARAGE_CORNER.y] },   // their places and things are in their own mm
  anchors,
  computed: { packing: packingView },
  actions: {
    shutRoomDoor() {
      roomSlider.value = 0;
      update();
    },
  },
  chair: { object: deskChair, rest: CHAIR_TURN, eyes: 150 },
  el: {
    room: document.getElementById('room'), where: document.getElementById('where'), lookAt: document.getElementById('lookAt'), eye: document.getElementById('eye'),
    views: document.getElementById('viewPick'), save: document.getElementById('saveView'), remove: document.getElementById('deleteView'),
    looks: document.getElementById('lookPick'), saveLook: document.getElementById('saveLook'), removeLook: document.getElementById('deleteLook'),
  },
  hooks: {
    place(v, id, room) {
      setFlat(Boolean(v.fit));
      const [cam, ctl] = flat ? [flatCamera, flatControls] : [camera, controls];
      cam.position.set(...v.position);
      ctl.target.set(...v.target);
      flatView = flat ? id : null;
      flatRoom = room;
      hallway.visible = !flat || id === 'plan';                 // the wall views are the living room's: its stairwell would hang below their floor
      updateDims();
      applyCut();
      drawStored();
      if (flat) {
        flatFit = v.fit;
        flatCamera.zoom = 1;
      }
      resize();                                                 // applies the view's fit or field of view
      ctl.update();
      frameCupboard();                                          // on its own, framed to fill the screen
    },
    isFlat: () => flat,
    resize: () => resize(),
    writeAddress: () => writeAddress(true),
    // The doors' angles: the room door's, the left-wall cupboard's, the
    // option's own, the bedroom's and the entrance's two, as some views open or shut them
    sceneState: {
      get: () => DOORS.map(d => d.value).join('-'),
      set(text) {
        text.split('-').map(Number).forEach((a, k) => { if (DOORS[k] && a >= 0 && a <= Number(DOORS[k].max)) DOORS[k].value = a; });
        update();
      },
    },
  },
});
DOORS.forEach(d => d.addEventListener('input', viewKit.writeView));
// Scenes: everything on show bar the view, from living_room.scenes.js or saved
// here. Showing one loads the page again with its settings, keeping the view.
// The pop-up menus: the views list and look at the top right, the scenes at
// the bottom right
popMenus(renderer.domElement);
sceneKit = SceneKit.create({
  room: 'room_3d',
  config: window.ROOM_SCENES,
  el: { scenes: document.getElementById('scenePick'), save: document.getElementById('saveScene'), remove: document.getElementById('deleteScene') },
  get: settingsAddress,
  apply(address) {
    history.replaceState(null, '', `#${address}~${viewKit.address()}`);
    location.reload();
  },
});

document.getElementById('dims').addEventListener('click', e => {
  showDims = !showDims;
  e.target.textContent = `Dimensions: ${showDims ? 'on' : 'off'}`;
  updateDims();
});
document.getElementById('doorDims').addEventListener('click', e => {
  showDoorDims = !showDoorDims;
  e.target.textContent = `Door sizes: ${showDoorDims ? 'on' : 'off'}`;
  updateDims();
});

// The settings drawers, one open at a time, all closed to start on every
// screen: Other options, opened by ☰, and Cupboard options, Bedroom
// options and Garage options by their buttons.
// Each: [its button, the class on <body> while it's open]. The 2D views
// move clear of the drawer as it opens and closes.
const DRAWERS = { panel: ['menu', 'menu-open'], cupPanel: ['cupMenu', 'cup-open'], bedPanel: ['bedMenu', 'bed-open'],
  garagePanel: ['garageMenu', 'garage-open'] };
const drawers = createDrawers(DRAWERS, () => resize(true));
drawers.setMenu(null);

resetButton(document.getElementById('reset'));
// Share: the link is always to the published page, so it works for others
// even when this copy is on a local server
shareButton(document.getElementById('share'), 'https://andrewrobinson.github.io/plans/index.html', () => OPTIONS[state.option].name);
screenshotButton(document.getElementById('screenshot'), renderer.domElement, draw, () => OPTIONS[state.option].name);
resize();

workOffline('sw.js');

// Every control in step with state: the sliders, radio buttons, switches
// and dropdowns, the reverse of their listeners above, which all go through
// changeSettings(). The colours, the shelves' wood, the dresser's place and
// the island go on the model too. The option's own controls, and the things
// to store's, are show()'s.
// The bedroom's sliders (other_room.js): each sets its setting in
// state.otherRoom, a path such as 'bed.u'
const syncOtherRoom = otherRoomControls(document.getElementById('otherRoomBlock'), edits => changeSettings(s => {
  for (const [path, value] of edits) {
    const keys = path.split('.'), last = keys.pop();
    keys.reduce((o, k) => o[k], s.otherRoom)[last] = value;
  }
}));

// The wicker bench's (wicker_bench.js): each sets its setting in
// state.wickerBench, a path such as 'hallway.along'
const syncWickerBench = wickerBenchControls(document.getElementById('wickerBenchBlock'), edits => changeSettings(s => {
  for (const [path, value] of edits) setValueAt(s.wickerBench, path, value);
}, { look: true }));

// The shoe rack's (shoe_rack.js): each sets its setting in state.shoeRack
const syncShoeRack = shoeRackControls(document.getElementById('shoeRackBlock'), edits => changeSettings(s => {
  for (const [key, value] of edits) s.shoeRack[key] = value;
}, { look: true }));

// The garage's (garage.js): each sets its setting in state.garage, a path
// such as 'sean.x'
const syncGarage = garageControls(document.getElementById('garageBlock'), edits => changeSettings(s => {
  for (const [path, value] of edits) setValueAt(s.garage, path, value);
}, { look: true }));

function syncControls() {
  const { T, R, F, BOARD, BENCH, above, shelfDepth, tv, frontPiece, island } = state;
  const slide = (id, value, text = value) => {
    document.getElementById(id).value = String(value);
    document.getElementById(`${id}Value`).textContent = text;
  };
  const check = (name, value) => { document.querySelector(`input[name=${name}][value="${value}"]`).checked = true; };
  slide('depth', T || 290, T || 'none');
  slide('rear', R);
  slide('board', BOARD);
  for (const [id, key] of [['leg', 'LEG'], ['legD', 'LEG_D'], ['ward', 'WARD'], ['wardD', 'WARD_D'], ['tower', 'TOWER'], ['cornerW', 'CORNER_W'], ['cornerD', 'CORNER_D'], ['sideW', 'SIDE_W'], ['sideD', 'SIDE_D']]) slide(id, state[key]);
  sideShelfSwitch.checked = state.SIDE_SHELF;
  check('front', F);
  benchSwitch.checked = benchDrawn();
  benchSwitch.disabled = onBackWall().length > 0;
  for (const key of BACK_WALL_KEYS) backWallSwitches[key].checked = state[`${key}On`];
  showBookshelfSizes();
  check('bench', BENCH);
  check('above', above);
  slide('shelfDepth', shelfDepth);
  benchHeights();                                               // the TV's size, and the heights above the bench
  slide('tvSize', TV_SIZES.findIndex(([inches]) => inches === tv), `${tv}" (${TV_W} × ${TV_H})`);
  showShelves();
  for (const target of Object.keys(COLOUR_TARGETS)) setRal(target, state.colours[target]);
  refreshColours();
  setShelfWood(state.shelfWood);
  check('frontPiece', frontPiece);
  placeDresser();
  showDresser();
  showLarder();
  showSofa();
  check('islandAt', island.at);
  placeIsland();
  syncOtherRoom(state.otherRoom);
  syncWickerBench(state.wickerBench);
  syncShoeRack(state.shoeRack);
  syncGarage(state.garage);
}

// ---------------------------------------------------------------------------
// window.plans: the settings and what's made of them, for the tests and the
// browser console (REFACTOR_PLAN.md, step 6a). Read-only: nothing here
// changes the page.
//   get()       the settings: state, as JSON, and the doors' angles
//   snapshot()  the settings, each corner cupboard's cutting list, the
//               dimension figures on show and the description, which the
//               tests save beside each address (tests/snapshots/)
// ---------------------------------------------------------------------------
const DOOR_NAMES = ['room', 'tall', 'second', 'bedroom', 'flat', 'outside'];   // DOORS' order
function settingsNow() {
  const doors = Object.fromEntries(DOOR_NAMES.map((name, k) => [name, Number(DOORS[k].value)]));
  return { ...JSON.parse(JSON.stringify(state)), doors };
}
// A cupboard's cutting list as rows, in the order the page lists them
function cuttingRows(cupboard) {
  const kinds = cuttingList(cupboard);
  return CUT_KINDS.filter(k => kinds.has(k)).flatMap(kind => sizesInOrder(kinds.get(kind)).map(({ l, w, shaped, n, parts }) =>
    ({ kind, length: l, width: w, shaped, count: n, parts: [...parts] })));
}
// The dimensions' figures on show (only in a 2D view, or with the cupboard
// on its own), in the order they're drawn
function dimensionFigures() {
  const figures = [];
  dims?.traverse(o => { if (o.userData.text) figures.push(o.userData.text); });
  return figures;
}
window.plans = {
  get: settingsNow,
  snapshot: () => ({
    settings: settingsNow(),
    cupboards: {
      livingRoom: state.option === CURRENT ? null : cuttingRows(current?.cupboard),   // the current room has no cupboard
      bedroom: bedroomCopy ? cuttingRows(bedroomCopy) : null,
    },
    dimensions: dimensionFigures(),
    description: document.getElementById('summary').textContent,
  }),
};

// Start on the settings in the address (room_dimensions.md has their
// order). Anything it leaves out, and everything with no address, starts as
// in state: option 7 with a 600 left-wall cupboard, TV and shelves above the
// bench, and AI Olive cupboards.
readAddress(location.hash.slice(1));
syncControls();
show(state.option);
// The view: the address's, else the last chosen here. After show(), as
// some views are worked out from the option
viewKit.start(addressView);
startLoop();
