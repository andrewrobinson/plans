// The flat's model: everything drawn, from the settings, with no page: the
// living room's fittings and its corner cupboard (built by
// corner_cupboard.js from its piece of the settings), the bench and what's
// above it, the dresser, larder, island and sofa, the things to store,
// the other rooms' furniture (their modules'), the doors, the 2D views'
// dimensions, the cutting list and the description; and the configuration's
// schema (SCHEMA), its two-way map onto the settings (state). Drawn into
// `world`, which living_room.js, the page, adds to its scene; Node builds it
// too, for the model's tests (tests/model/), as buildFlat(configuration)
// (REFACTOR_PLAN.md, step 6c). Nothing here reads the DOM: textures are
// drawn on the kit's makeCanvas().
//
// The page's menus change the settings by their paths in the configuration
// (set(), setAll()) and it calls rebuild(); what the page shows that the
// drawing follows (2D or 3D, which view, Cupboard only, the dimension
// buttons) it sets with setDisplay().
import * as THREE from 'three';
import { MM, material, box, slab, part, hinge, skewHinge, RAL, oakBoards, makeCanvas,
  dimLabel, chain, clearDrawing } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import * as Cupboard from './corner_cupboard.js';
import { CUPBOARD_MATERIALS, makeCupboard, makeMaterials, seeThrough, OPTIONS, optionOf, CURRENT_ROOM, DOOR_GAP, PLINTH, baseDoorCount,
  spanOf, CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE, sizesInOrder, diagonal, cornerTooShallow, deskSpot, MIN_DIAGONAL } from './corner_cupboard.js';
import { DRESSER_MODELS } from './dressers.js';
import { LARDER_MODELS } from './larders.js';
import { SOFA_MODELS } from './sofas.js';
import { bookcase } from './bookcase.js';
import { BILLY_CHEST, billy, billySizes, billyChest } from './billy.js';
import { daybed, daybedFrame } from './daybed.js';
import { ivar, ivarSizes } from './ivar.js';
import { CHESHAM, CORNWALL, kitchenTable, tableSizes } from './tables.js';
import { castorDesk, castorDeskSizes } from './castor_desk.js';
import { drawOtherRoom, pineCupboard, otherRoomPieces, OTHER_ROOM_START, showNewCupboard,
  QUARTER_TURN, OTHER_ROOM_SCHEMA } from './other_room.js';
import { drawWickerBench, wickerBenches, WICKER_BENCH_START, WICKER_BENCH_SCHEMA } from './wicker_bench.js';
import { drawShoeRack, shoeRack, SHOE_RACK_START, SHOE_RACK_SCHEMA } from './shoe_rack.js';
import { drawStairWalls, settleStairWalls, STAIR_WALLS_START, STAIR_WALLS_SCHEMA } from './stair_walls.js';
import { drawShoeBoxes, SHOE_BOXES_SCHEMA } from './shoe_boxes.js';
import { drawGarage, drawGarageDoor, garagePieces, GARAGE, GARAGE_CORNER, GARAGE_DOOR, GARAGE_START, GARAGE_SCHEMA } from './garage.js';
import { floor, drawFloor, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, wallMat, floorMat, FRIDGE_W, RECESS_FROM,
  KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, SINK_RECESS, DESK_TOP,
  DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat,
  ceilingMat, OUTER, OTHER_ROOM, OTHER_ROOM_CORNER, bedroomHinge, carpetMat, CARPET_COLOURS,
  HALLWAY, hallway, ENTRANCE, bathroom, flatDoorHinge, outsideDoorHinge } from './floor.js';

// Everything drawn: the flat, the hallway and stairs, the garage, in the
// scene's metres (room (x, y, z) mm -> (x, z, y) / 1000)
export const world = new THREE.Group();

// What the page shows, which the dimensions and the things to store's labels
// follow: a 2D view or not (flat), which (flatView: 'plan', 'back', …) and
// the room it's of (flatRoom); the cupboard on its own (Cupboard only);
// the Dimensions and Door sizes buttons; and See-through, every corner
// cupboard's boards drawn faint. The hallway is hidden in the lounge's and
// the bedroom's wall views: its stairwell would hang below their floor
// See-through is set on the cupboards' materials, which keep it, and isn't
// kept here (ui_paradigm_analysis.md: the view's switches are to leave this
// module's state)
// The rooms whose wall views the hallway's stairwell would hang below the
// floor of, next door (the hallway's group holds downstairs and the garage
// too, which the garage's own wall views need)
const STAIRWELL_SHOWS_IN = ['livingRoom', 'bedroom'];
let flat = false, flatView = null, flatRoom = 'livingRoom', cupboardOnly = false, showDims = true, showDoorDims = true;
export function setDisplay(shown) {
  if ('seeThrough' in shown) for (const materials of [CUPBOARD_MATERIALS, BEDROOM_MATERIALS]) seeThrough(materials, shown.seeThrough);
  if ('flat' in shown) flat = shown.flat;
  if ('flatView' in shown) flatView = shown.flatView;
  if ('flatRoom' in shown) flatRoom = shown.flatRoom;
  if ('cupboardOnly' in shown) cupboardOnly = shown.cupboardOnly;
  if ('showDims' in shown) showDims = shown.showDims;
  if ('showDoorDims' in shown) showDoorDims = shown.showDoorDims;
  hallway.visible = !flat || flatView === 'plan' || !STAIRWELL_SHOWS_IN.includes(flatRoom);
}

// Each room's box, in the living room's mm (x0 < x1, y0 < y1), its floor
// and its ceiling's height: for the 2D views of its walls (living_room.js's
// wallView()) and their dimensions. The 2D wall views look along x or y at
// the wall on that side: 'back' at y0, 'front' at y1, 'left' at x0, 'right'
// at x1. Downstairs has a plan but no wall views
export const ROOM_BOXES = {
  livingRoom: { x0: 0, x1: ROOM_WIDTH, y0: 0, y1: ROOM_DEPTH, floor: 0, ceiling: CEILING_HEIGHT },
  bedroom: { x0: OTHER_ROOM_CORNER.x, x1: OTHER_ROOM_CORNER.x + OTHER_ROOM.length, y0: OTHER_ROOM_CORNER.y,
    y1: OTHER_ROOM_CORNER.y + OTHER_ROOM.recessBack, floor: 0, ceiling: OTHER_ROOM.ceiling },
  hallway: { x0: HALLWAY.xEnd, x1: HALLWAY.x0, y0: 0, y1: HALLWAY.ySetBack, floor: 0, ceiling: CEILING_HEIGHT },
  garage: { x0: GARAGE_CORNER.x, x1: GARAGE_CORNER.x + GARAGE.length, y0: GARAGE_CORNER.y, y1: GARAGE_CORNER.y + GARAGE.width,
    floor: ENTRANCE.floor, ceiling: ENTRANCE.floor + GARAGE.height },
};

// Room coordinates in mm: x along the back wall from the left wall, y from
// the back wall towards the front, z up. The scene is y-up in metres:
// room (x, y, z) -> scene (x, z, y). kit/floor_kit.js has the stage
// (renderer, cameras, lights) and the helpers that draw in these mm.


const { carcass: carcassMat, shelf: shelfMat, door: doorMat, handle: handleMat, oak: oakMat } = CUPBOARD_MATERIALS;
const benchMat = material(0xe8d9bf);

drawFloor();                                                    // once: the walls, the rooms' shells, the stairs
world.add(floor);

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
  deskChair = new THREE.Group();
  deskChair.position.set((dx0 + DESK_W / 2) * MM, 0, (deskFront - 350) * MM);   // centred on the desk, 350 out from it
  deskChair.rotation.y = CHAIR_TURN;
  world.add(deskChair);
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
  world.add(islandGroup);
  box({ from: [overhang - width / 2, overhang - length / 2, 0], to: [width / 2 - overhang, length / 2 - overhang, top - topT] }, islandMat, islandGroup);   // the base, under the top
  box({ from: [-width / 2, -length / 2, top - topT], to: [width / 2, length / 2, top] }, islandTopMat, islandGroup);                                        // the oak top
}

// Room door: 760 x 44 x 1978, hinged at (0, 1400), opens into the room
const roomHinge = hinge(0, DOOR_HINGE_AT, world);
const roomDoorMat = material(0x8fb3d9);
box({ from: [-44, 0, 0], to: [0, ROOM_DOOR, ROOM_DOOR_H] }, roomDoorMat, roomHinge);
box({ from: [0, 600, 1000], to: [60, 720, 1020] }, handleMat, roomHinge, false);

// ---------------------------------------------------------------------------
// The living room as it is now (the user's photo and measurements, 18 Oct
// 2026): no cupboard or bench yet; BillyChest in the corner by the
// windows, its back to the window wall and its drawers facing the left wall,
// and along the back wall to its left, Billy lying on its side; the Drift
// with its back to Billy; in the corner by the door, Cornwall on the floor
// with its legs off, 1200 along the left wall, and Chesham on its end on
// it, its top against the back wall. Each spot is the middle of its back,
// room x and y, and its turn, as the pieces' sliders give it (in 5s).
// Turned 90°, a piece faces the left wall, its back to the right; 270°,
// the other way round.
// ---------------------------------------------------------------------------
const PIPE_GAP = 90;               // BillyChest's back to the window wall, for the radiator's pipe: measured
const BILLY_TO_CHEST = 380;        // the gap between Billy's end and BillyChest: measured
const SOFA_OFF_BILLY = 300;        // the sofa's back from Billy's front: estimated from the photo
const to5 = mm => Math.round(mm / 5) * 5;                         // as the sliders hold it
const LOUNGE_NOW = (() => {
  const chestBack = ROOM_WIDTH - PIPE_GAP;                                          // 3748
  const billyLong = billySizes(true).w;                                              // 2020 lying
  const billyX = to5(chestBack - BILLY_CHEST.d - BILLY_TO_CHEST - billyLong / 2);    // 1875
  const sofaD = SOFA_MODELS.list.drift.d;
  return {
    billyChest: { x: chestBack, y: to5(BILLY_CHEST.w / 2), turn: 90 },             // its side against the back wall
    billy: { x: billyX, y: 0, turn: 0 },
    sofa: { x: billyX, y: billySizes(true).d + SOFA_OFF_BILLY + sofaD / 2, turn: 180 },   // its back to Billy; y 975
    cornwall: { x: 0, y: CORNWALL.L / 2, turn: 270 },              // from the back wall along the left wall, nearly to the door frame (1329)
    chesham: { x: CHESHAM.W / 2, y: 0, turn: 0 },                  // in the corner, on Cornwall
  };
})();

// ---------------------------------------------------------------------------
// The settings: everything the menus set and the address saves, in one
// place, changed by the menus only through set() (below). Laid out as the
// configuration is (REFACTOR_PLAN.md item 14): each schema entry maps a
// path onto itself. The cupboard's sizes keep the short names the drawing code
// and room_dimensions.md use; a function that draws reads the ones it needs
// at its top, as `const { T, R, BOARD } = state.pieces.cornerCupboard.design;`.
// What's worked out from the settings isn't kept here (the heights above
// the bench, the TV's width and height, where the dresser stands), and nor
// is the view (kit/view_kit.js).
// ---------------------------------------------------------------------------
const state = {
  // Each piece once, with its design and the rooms it's in, as the
  // configuration has it (room_dimensions.md)
  pieces: {
    // The living room's corner cupboard: its design, as corner_cupboard.js's
    // CUPBOARD_SETTINGS, which cupboardSettings() gives makeCupboard()
    cornerCupboard: { design: {
      option: 10,                      // the option on show, by its number (7 to 11, or 16): 10 here, for the bedroom's copy; the living room's is set to 16 below OPTIONS
      // The left-wall cupboard's depth from the wall: 0 (none), or 300 to 800 in
      // 10s. Option 8 needs it, so it's unavailable at 0. Everything
      // along the back wall starts from it. 600 to start, as option 7 has when
      // chosen.
      T: 600,
      R: 330,                          // the rear-wall cupboards' and bench's depth from the back wall: 300 to 800
      F: 1200,                         // the left-wall cupboard's front, out from the back wall: 1000 up to the room's door (cupboardLimits()). Its inside leg along the left wall is F - R
      // The thickness of the boards (MDF or chipboard) every cupboard is built
      // from, 12 to 25: the same for all of them. Cupboards' outside sizes stay
      // as set, so thicker boards take room from the inside.
      BOARD: 18,
      TOP: 0,                          // how high the full-height parts stand: 0 to the ceiling, or 1800 up to it (asked for, 18 Oct 2026)
      LEG: 600,                        // option 7's back-wall leg, inside along the back wall: 400 to 1200 (the bedroom's to its recess). Its door is LEG - BOARD - 2 * DOOR_GAP wide, or more doors past MAX_DOOR_W. Option 8 has its own, DIAG_RUN
      LEG_D: 600,                      // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench, which stays R deep
      L_SHELVES: { back: [600, 1200, 1800], left: [600, 1200, 1800] },   // ...and its shelf tops in the back-wall leg (with the inside corner) and the left-wall leg
      DIAG_RUN: 700,                   // option 8's back-wall leg, inside along the back wall from the left-wall cupboard: 400 up to the room's limit (700 as it was first drawn)
      DIAG_BACK: 0,                    // ...its front running straight in from the back-wall leg's end before the diagonal starts: 0 (none) on
      DIAG_LEFT: 0,                    // ...and likewise from the left-wall leg's end (both asked for, 18 Oct 2026)
      WARD: 900,                       // option 9's full-height double-door cupboard on the back wall: 600 to 1400 wide
      WARD_D: 600,                     // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench and tower, which stay R deep
      TOWER: 400,                      // ...then an open shelving tower: 0 to 600 wide (0 for none)
      CORNER_W: 800,                   // options 10 and 11's full-height corner cupboard, along the back wall: 500 to 1200 (the bedroom's to its recess). Option 10's doors are (CORNER_W - BOARD - 3 * DOOR_GAP) / 2 wide each, or two pairs past MAX_DOOR_W
      CORNER_D: 650,                   // ...and out along the left wall, in place of F: 0 to 1329 (the door frame; the bedroom's to its door's swing). Too shallow (cornerTooShallow()), it isn't built
      SIDE_SHELF: false,               // option 10's full-height side bookshelf, between the corner cupboard and the TV: drawn or not
      SIDE_W: 400,                     // ...its width along the back wall, 200 to 800, the cupboard's side included (it shares it)
      SIDE_D: 330,                     // ...and its depth from the back wall, 150 to 800
      // Option 10's fold-down desk, on the cupboard's side facing the windows
      // (corner_cupboard.js's foldDownDesk()): drawn or not, its width along
      // the side (held to the side's clear run), how far it reaches out when
      // open, and its top's height when open (chosen with the user, 20 Oct
      // 2026: 780 fills the 820 the photo layout's side leaves, 20 clear each
      // end; 500 deep for a laptop and arms; 740, a usual desk height).
      // Whether it's folded away or down is with the doors' angles, in the
      // view (doors.desk, DESK_SHOWN)
      DESK: false,
      DESK_W: 780,
      DESK_D: 500,
      DESK_H: 740,
    } },
    // The bedroom's corner cupboard (its New cupboard): its own settings, as
    // the living room's. To start, a copy of the living room's (set below
    // OPTIONS)
    bedroomCupboard: { design: null },
    // The bench along the back wall: its height (700, 780, 800 or 900), and
    // drawn, with what's above it; off, the back wall's bare (there's none
    // yet: LOUNGE_NOW)
    bench: { design: { height: 780 }, in: { livingRoom: { on: false } } },
    // Above the bench: what (0 nothing, 1 shelves, 2 TV, 3 TV and shelves, 4
    // TV and top shelf), the shelves' depth (150 to 400) and the TV's size in
    // inches, one of TV_SIZES
    aboveBench: { design: { what: 3, shelfDepth: 250, tv: 75 } },
    // The dresser's, larder's and sofa's sizes, and which larder and sofa:
    // these until set from dressers.js, larders.js and sofas.js below
    dresser: { design: { w: 1320, h: 2100, baseD: 400, baseH: 900, upperD: 290 } },
    larder: { design: { model: '', w: 1100, h: 1950, d: 510 } },
    sofa: {
      design: { model: '', w: 1690, d: 1000, h: 920,   // model '' for none
        asBed: false },          // a daybed (the Drift) laid out as a bed, its arms down
      in: { livingRoom: { front: 1900,                 // its front from the TV wall
        move: LOUNGE_NOW.sofa } },   // ...or moved and turned from there: { x, y, turn } (see sofaSpot), or null where it starts
    },
    // Where the island is, one of ISLAND_AT; out there, where its middle is
    // and how far it's turned (ISLAND_HOME to start)
    island: { in: { livingRoom: { at: 'room', x: 0, y: 0, turn: 0 } } },
    // In the living room in place of the bench (and what's above it), which is
    // then off whatever its own switch says: the bedroom's bookcase and pine
    // cupboard, and Billy and BillyChest from the garage (billy.js), each moved
    // round the room from there ({ x, y, turn }, see BACK_WALL_PIECES, or null
    // where it starts), Billy standing or lying on its long side, its open
    // side out
    bookcase: { in: { livingRoom: { on: false, move: null } } },
    pineCupboard: { in: { livingRoom: { on: false, move: null } } },
    billy: { in: { livingRoom: { on: true, lying: true, move: LOUNGE_NOW.billy } } },   // where it is now
    billyChest: { in: { livingRoom: { on: true, move: LOUNGE_NOW.billyChest } } },       // in the corner, as now
    // The Ivar (ivar.js), by the first radiator, lying on its side, as it is
    // now (IVAR_HOME), and moved round the room from there, or null where it
    // starts
    ivar: { in: { livingRoom: { on: true, lying: true, move: null } } },
    // The kitchen tables (tables.js), in the corner by the door, as it is now
    // (LOUNGE_NOW), hidden to start (asked for, 19 Oct 2026): Chesham on its
    // end, its top against the wall behind it (else on its legs), Cornwall
    // on the floor with its legs off (else on its legs); each moved round the
    // room from there, as the Ivar
    chesham: { in: { livingRoom: { on: false, onItsEnd: true, move: null } } },
    cornwall: { in: { livingRoom: { on: false, legsOff: true, move: null } } },
    // The desk on castors (castor_desk.js), off to start, parked by the door
    // ('door') or wheeled out in front of the TV ('tv'): CASTOR_DESK_HOMES;
    // and moved from there, as the Ivar
    castorDesk: { in: { livingRoom: { on: false, at: 'door', move: null } } },
  },
  colours: { floor: 0, cupboard: 4, wall: 0, woodwork: 0, dresser: 0, carpet: 0, bedroomCupboard: 0,   // a RAL code or finish for each of COLOUR_TARGETS, 0 for its default: AI Olive cupboards, the bedroom's following them
    shelves: 0 },                  // the shelves' wood, which of SHELF_WOODS
  livingRoom: { frontWall: 'none' },   // on the front wall between the sink and the desk: one of FRONT_PIECES (none yet)
  // The things to store: shown or not, which of PACKINGS, where (0 by the
  // middle window, 1 in the corner cupboard, 2 moved by hand), and each
  // thing's { x, y, turned, z } once moved by hand (set up with STORED below)
  thingsToStore: { shown: false, packing: 0, where: 0, spots: [] },   // ...shown where they are now once STORED is set up (STORED_NOW)
  // The hallway: the shelves and pictures on the walls over the stairs, and
  // the shoe boxes on the sills, none to start (stair_walls.js,
  // shoe_boxes.js); and the bathroom and WC drawn, or hidden to see the
  // hallway and stairs past them
  hallway: { ...structuredClone(STAIR_WALLS_START), bathroomShown: true },
};
// A piece's place in the living room, by its key in the living room's
// controls (BACK_WALL_KEYS, the tables, the Ivar, the desk on castors):
// the bookshelf is the bookcase, and the pine the pine cupboard
const LIVING_ROOM_PIECES = { bookshelf: 'bookcase', pine: 'pineCupboard' };
// The other rooms' settings, from their modules, laid out as the
// configuration is: the bedroom's furniture, where it stands and its sizes
// (other_room.js)
Config.mergeInto(state, structuredClone(OTHER_ROOM_START));
// ...and the hallway's wicker bench: its sizes, and in which rooms and
// where (wicker_bench.js)
Config.mergeInto(state, structuredClone(WICKER_BENCH_START));
// ...and the shoe rack at the foot of the stairs: its sizes, and whether
// it's there (shoe_rack.js)
Config.mergeInto(state, structuredClone(SHOE_RACK_START));
// ...and Sean, Billy, BillyChest and the rest, in the garage: where each
// stands (garage.js)
Config.mergeInto(state, structuredClone(GARAGE_START));
export const inLivingRoom = key => state.pieces[LIVING_ROOM_PIECES[key] ?? key].in.livingRoom;

// How far each door is open, in degrees, up to its slider's most
// (index.html): the room door, the left-wall cupboard's tall door, the
// option's other door or doors, the bedroom's, downstairs the flat's own
// door and the lobby's outside door, and the bedroom cupboard's tall and
// other doors; each fold-down desk folded away (0) or down (90,
// DESK_SHOWN); and the garage door, not shown, open or closed (garage.js's
// GARAGE_DOOR). They're the view's, not the configuration's: a door's
// angle changes nothing that's made, so it's how you're looking, as the
// camera is (REFACTOR_PLAN.md item 12, decided 17 Oct 2026 in
// ui_paradigm_analysis.md). Set by the door controls and by some views (the
// room door shut on walking in, the cupboard's open for packing), and
// turned by turnDoors(), without rebuilding
const DOORS_START = { room: 90, tall: 0, second: 0, bedroom: 90, flat: 0, outside: 0, bedroomCupboardTall: 0, bedroomCupboardSecond: 0, desk: 0, bedroomCupboardDesk: 0, garage: 'hidden' };
const doors = structuredClone(DOORS_START);


// ---------------------------------------------------------------------------
// The corner cupboard: corner_cupboard.js's makeCupboard() makes it from its
// settings (its piece of the configuration, state.pieces.cornerCupboard.design), the living
// room as its place, and its materials; buildOption() keeps it in
// `cupboard`. Its shelves are drawn round the things to store (from
// drawStored()).
// ---------------------------------------------------------------------------
// A corner cupboard's settings, by its piece's name in state: a copy, so a
// cupboard built from them isn't changed by the menus till it's built again
const cupboardSettings = (piece = 'cornerCupboard') => ({ ...state.pieces[piece].design });
// The living room, as the cupboard stands in it: its back-left corner,
// and the room door it can meet (760 x 44, hinged at y 1400 on the left wall)
const LIVING_ROOM_PLACE = {
  width: ROOM_WIDTH, depth: ROOM_DEPTH, ceiling: CEILING_HEIGHT,
  door: { frameFrom: DOOR_FRAME_STARTS_AT, hingeAt: DOOR_HINGE_AT, width: ROOM_DOOR, thickness: 44 },
};

// The bedroom's New cupboard: a corner cupboard of its own, in the corner
// where the chimney breast meets the kitchen-side wall (other_room.js's
// NEW_CUPBOARD), turned half round, so its back wall runs along the breast
// (3682 to the window wall) and its left wall along the kitchen-side wall
// (2841 out to the hallway wall), under the bedroom's 2445 ceiling. No door
// on its walls (the bedroom's is in the far one). Its settings
// (state.pieces.bedroomCupboard.design), colour (colours.bedroomCupboard, following the
// living room's unless set), doors, materials, shelves and cutting list are
// its own; its shelves' wood is the flat's.
const BEDROOM_PLACE = { width: OTHER_ROOM.length, depth: OTHER_ROOM.breastFace, ceiling: OTHER_ROOM.ceiling, door: null };

// How far the bedroom's cupboard can reach (asked for, 18 Oct 2026): along
// the chimney breast up to the recess, where its fitted cupboards stand
// (OTHER_ROOM.breastLength, 1858), and out along the kitchen-side wall till
// it meets the bedroom door's swing. The door, in the cupboard's own mm (x
// along the breast from the kitchen-side wall, y out from the breast): in
// the hallway wall (y = breastFace), its opening from x = fromKitchenWall to
// fromKitchenWall + width, hinged at the far end and opening into the room,
// so its edge sweeps a circle `width` round the hinge.
const BEDROOM_ALONG_BREAST = OTHER_ROOM.breastLength;
const BEDROOM_DOOR_SWING = { x: OTHER_ROOM.door.fromKitchenWall + OTHER_ROOM.door.width, y: OTHER_ROOM.breastFace, r: OTHER_ROOM.door.width };
const DOOR_SWING_CLEAR = 10;       // kept clear of the door's swing (chosen)
// How far out from the breast a cupboard `deep` out from the kitchen-side
// wall can reach before the bedroom door's swing
function clearOfBedroomDoor(deep) {
  const { x, y, r } = BEDROOM_DOOR_SWING, across = x - deep;      // from the cupboard's front to the hinge, along the breast
  const reach = across >= r ? 0 : across <= 0 ? r : Math.sqrt(r * r - across * across);   // how far into the room the door sweeps there
  return Math.floor(y - reach - DOOR_SWING_CLEAR);
}
// The most each of a cupboard's sizes can be, given its other `settings`,
// where it's less than its slider's end. In either room, option 8's straight
// fronts leave its diagonal MIN_DIAGONAL along each wall. The living room's
// sliders end at its own limits (the back wall's bench takes the rest, and
// the room door's frame starts 1329 out along the left wall); in the
// bedroom, the back-wall sizes go to the recess and the left-wall ones to
// the door's swing.
export function cupboardLimits(piece, settings = state.pieces[piece].design) {
  const { T, R, F, DIAG_RUN, CORNER_W } = settings;
  const onSteps = (v, name) => Math.floor(v / SLIDER_RANGES[name][2]) * SLIDER_RANGES[name][2];   // where its slider can stop
  const diagonal = { DIAG_BACK: onSteps(DIAG_RUN - MIN_DIAGONAL, 'diagBack'), DIAG_LEFT: onSteps(F - R - MIN_DIAGONAL, 'diagLeft') };
  if (piece !== 'bedroomCupboard') return diagonal;
  return { ...diagonal, LEG: BEDROOM_ALONG_BREAST - T, DIAG_RUN: BEDROOM_ALONG_BREAST - T, CORNER_W: BEDROOM_ALONG_BREAST,
    F: clearOfBedroomDoor(T), CORNER_D: clearOfBedroomDoor(CORNER_W) };
}
const BEDROOM_MATERIALS = makeMaterials();
// The things to store, for the shelves to be cut round: each { name, h, x,
// y, z, w, d }, in STORED's order, none while they're not shown
const storedThings = () => (!state.thingsToStore.shown ? [] : STORED.map((s, k) => {
  const { x, y, z } = storedSpots()[k], [w, d] = storedSize(k);
  return { name: s.name, h: s.h, x, y, z, w, d };
}));

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
  const BENCH = state.pieces.bench.design.height;
  [, TV_W, TV_H] = TV_SIZES.find(([inches]) => inches === state.pieces.aboveBench.design.tv);
  SHELF_TOPS = [BENCH + 420, BENCH + 770, BENCH + 1120];
  TV_BOTTOM = BENCH + 320;
  const top = Math.max(BENCH + 1300, TV_BOTTOM + TV_H + TV_GAP);
  TV_SHELF_TOPS = [BENCH + 220, ...(top <= CEILING_HEIGHT - 60 ? [top] : [])];
  TV_MIDDLE_SHELF = BENCH + 770;
}
const tvMat = material(0x1a1a1a);
const screenMat = new THREE.MeshStandardMaterial({ color: 0x0c1824, roughness: 0.3, metalness: 0.2 });

function shelves(x0, x1, g, tops = SHELF_TOPS) {
  for (const top of tops) box({ from: [x0, 0, top - SHELF_T], to: [x1, state.pieces.aboveBench.design.shelfDepth, top] }, shelfMat, g);
}

let tvAt = null;                   // the TV's middle, room [x, y, height], or where it would be
function benchWall(x0, g) {
  const { what: above, shelfDepth } = state.pieces.aboveBench.design, { R } = state.pieces.cornerCupboard.design;
  const span = ROOM_WIDTH - x0;
  tvAt = [(x0 + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
  if (above === 0 || span <= 0) return '';                         // nothing, or no bench (the current room)
  return benchWallItems(x0, span, g) +
    (shelfDepth > R && above !== 2 ? ` The shelves stand ${shelfDepth - R} proud of the ${R}-deep bench.` : '');
}

function benchWallItems(x0, span, g) {
  const { what: above, shelfDepth, tv } = state.pieces.aboveBench.design;
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
// the configuration's colour codes with RAL's. Their screen colours are approximate too.
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
const dresserMat = material(0xc9a877), dresserDoorMat = material(0xd8bd92);   // set by applyColour() below
const COLOUR_TARGETS = {
  floor: { mats: [floorMat], room: 3 },
  cupboard: { mats: [carcassMat, doorMat, benchMat], follows: 'woodwork' },
  wall: { mats: [wallMat], room: 1 },
  woodwork: { mats: [frameMat, roomDoorMat], room: 2 },
  dresser: { mats: [dresserMat, dresserDoorMat], follows: 'cupboard' },
  carpet: { mats: [carpetMat], room: 14 },
  bedroomCupboard: { mats: [BEDROOM_MATERIALS.carcass, BEDROOM_MATERIALS.door], follows: 'cupboard' },
};


// Set one target to a RAL code or finish (0 for its default). Returns the
// colour's name, or null if the code isn't known.
// The code a target actually shows: its own, else its default
function shownCode(target) {
  const { room, follows } = COLOUR_TARGETS[target];
  return state.colours[target] || room || (follows ? shownCode(follows) : 0);
}

// A colour target's materials coloured as its setting (state.colours) says
function applyColour(target) {
  const { mats } = COLOUR_TARGETS[target];
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
    if (t.follows === target && !state.colours[other]) applyColour(other);
  }
}
for (const target of Object.keys(COLOUR_TARGETS)) applyColour(target);   // the room as it is now, with AI Olive cupboards

// ---------------------------------------------------------------------------
// The bench's base cupboards (option 9's), drawn by drawBench()
// ---------------------------------------------------------------------------
const TOP_T = 30;                                               // the bench top's thickness (chosen)

// Base cupboards along the bench, x0 to W: a recessed plinth, doors about 450
// wide hinged in pairs, and an oak top at BENCH. Returns how many doors.
function baseCupboards(x0, g) {
  const BENCH = state.pieces.bench.design.height, { R, BOARD } = state.pieces.cornerCupboard.design;
  box({ from: [x0, 0, PLINTH], to: [ROOM_WIDTH, R - BOARD, BENCH - TOP_T] }, carcassMat, g);   // carcass behind the doors
  box({ from: [x0, 0, 0], to: [ROOM_WIDTH, R - 60, PLINTH] }, carcassMat, g);              // plinth, set back 60
  box({ from: [x0, 0, BENCH - TOP_T], to: [ROOM_WIDTH, R, BENCH] }, oakMat, g);            // top
  const span = ROOM_WIDTH - x0;
  const n = baseDoorCount(span);
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
const DRESSERS = DRESSER_MODELS.list;
for (const [k] of DRESSER_SLIDERS) state.pieces.dresser.design[k] = DRESSERS[DRESSER_MODELS.start]?.[k] ?? state.pieces.dresser.design[k];
// Where it stands along the front wall, worked out from its width: centred
// between the counter's end and the desk recess, x0 to x1
// Its drawers' fronts' height (estimated, as drawn from the start)
const DRESSER_DRAWER_H = 160;
export function dresserSpan() {
  const from = KITCHEN.frontRunTo + KITCHEN.counterPast, gap = DESK_RECESS.x0 - from;   // 1415 clear
  const x0 = Math.round(from + (gap - state.pieces.dresser.design.w) / 2);
  return { x0, x1: x0 + state.pieces.dresser.design.w };
}
function dresser(g) {
  // Its width is overall, with the top's 20 overhang each side, so the body is 40 narrower
  const span = dresserSpan();
  const drawer = DRESSER_DRAWER_H, { h, baseD, baseH, upperD } = state.pieces.dresser.design, x0 = span.x0 + 20, x1 = span.x1 - 20, w = state.pieces.dresser.design.w - 40;
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
  return ` A dresser on the front wall between the sink and the desk (x ${span.x0}-${span.x1}): ${state.pieces.dresser.design.w} wide overall (its body ${w}), ${h} high, ${baseD} deep up to ${baseH} ` +
    `(two drawers over two doors, under a wooden top), then ${upperD} deep with three open shelves.`;
}

// ---------------------------------------------------------------------------
// Larders, from larders.js. Drawn as the dresser is, with its back on
// the front wall from x0, facing into the room. Its parts stack from the
// floor up. Returns a description.
const LARDERS = LARDER_MODELS.list;
state.pieces.larder.design.model = Object.hasOwn(LARDERS, LARDER_MODELS.start ?? '') ? LARDER_MODELS.start : Object.keys(LARDERS)[0] ?? '';
// The larder's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a larder sets them to its own.
const partHeight = p => p.legs ?? p.plinth ?? p.top ?? p.cornice ?? p.h ?? 0;
const larderHeight = L => L.parts.reduce((t, p) => t + partHeight(p), 0);
const larderDepth = L => Math.max(L.d, ...L.parts.map(p => p.d ?? 0));
const LARDER_SLIDERS = [['w', 'larderW', 400, 1500, 10], ['h', 'larderH', 1500, 2400, 10], ['d', 'larderD', 300, 700, 10]];
const larderOwnSize = L => ({ w: L.w, h: larderHeight(L), d: L.d });
if (LARDERS[state.pieces.larder.design.model]) Object.assign(state.pieces.larder.design, larderOwnSize(LARDERS[state.pieces.larder.design.model]));
// The larder chosen, at the sliders' sizes: a change of height goes on (or
// comes off) its tallest doors, and parts set back from its front (a
// shallower top section) stay set back as much
function currentLarder() {
  const L = LARDERS[state.pieces.larder.design.model];
  if (!L) return null;
  const { w, h, d } = state.pieces.larder.design;
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
// The configuration names them as here.
const FRONT_PIECES = ['dresser', 'larder', 'none', 'bookshelf'];
const pieces = { dresser: null, larder: null, sofa: null, ivar: null, chesham: null, cornwall: null, castorDesk: null };   // where each is drawn now, to look at
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
// not there at all ('none'), as the configuration names them.
const ISLAND_AT = ['room', 'along', 'out', 'none'];
const islandOnWall = () => state.pieces.island.in.livingRoom.at === 'along' || state.pieces.island.in.livingRoom.at === 'out';   // in the dresser or larder's place
// Out there, the island can be moved and turned from its sliders: where its
// middle is, and how far it's turned (0 to 180°). It starts where it is.
const ISLAND_HOME = { x: KITCHEN.island.x + KITCHEN.island.width / 2, y: KITCHEN.island.y + KITCHEN.island.length / 2, turn: 0 };
Object.assign(state.pieces.island.in.livingRoom, ISLAND_HOME);
function islandSpot() {
  const { width, length } = KITCHEN.island, move = state.pieces.island.in.livingRoom, { at } = move;
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
  islandGroup.visible = state.pieces.island.in.livingRoom.at !== 'none';
}
// A sofa from sofas.js, in any option: facing the TV, centred on it,
// its front state.pieces.sofa.in.livingRoom.front from the TV wall. Returns a description.
const SOFAS = SOFA_MODELS.list;
state.pieces.sofa.design.model = Object.hasOwn(SOFAS, SOFA_MODELS.start ?? '') ? SOFA_MODELS.start : '';
state.pieces.sofa.in.livingRoom.front = SOFA_MODELS.front ?? 1900;
// The sofa's sizes can be changed from its sliders: [key, slider id,
// lowest, highest]. Choosing a sofa sets them to its own.
// Height from 600, for the Drift's 670 (asked for, 18 Oct 2026)
const SOFA_SLIDERS = [['w', 'sofaW', 1200, 2600, 10], ['d', 'sofaD', 700, 1200, 10], ['h', 'sofaH', 600, 1100, 10]];
const sofaOwnSize = S => ({ w: S.w, d: S.d, h: S.h });
if (SOFAS[state.pieces.sofa.design.model]) Object.assign(state.pieces.sofa.design, sofaOwnSize(SOFAS[state.pieces.sofa.design.model]));
// The sofa chosen, at the sliders' sizes: the seat keeps its depth (the back
// gets thinner) unless that leaves less than 150 for the back, and the arms
// stay as they are, under the top of the back. A daybed's width is the
// floor it covers, wider as a bed (state.pieces.sofa.design.asBed); `sofaW` is its
// slider's, as a sofa
function currentSofa() {
  const S = SOFAS[state.pieces.sofa.design.model];
  if (!S) return null;
  const { w, d, h } = state.pieces.sofa.design, own = sofaOwnSize(S);
  const resized = own.w !== w || own.d !== d || own.h !== h;
  const label = resized ? `${S.label}, resized` : S.label;
  if (S.daybed) {
    // Worked out from the catalogue's own sizes (S), before w becomes the
    // floor it covers: wider as a bed
    const asBed = state.pieces.sofa.design.asBed, frame = daybedFrame(S, w, asBed);
    return { ...S, label: asBed ? `${label}, as a bed` : label, w: frame.width, sofaW: w, frame, d, h, asBed,
      seatD: Math.min(S.seatD, d - 150) };
  }
  return { ...S, label, w, d, h, seatD: Math.min(S.seatD, d - 150), armH: Math.min(S.armH, h - 50) };
}
const sofaMat = material(0x9da3a6);
// Where the sofa stands: the middle of the floor it covers, room x and y,
// and how far it's turned, in quarter turns as the bookshelf (360 is 0
// again). It starts centred on the TV, facing it, its front
// state.pieces.sofa.in.livingRoom.front from the TV wall; its sliders move it from there.
const SOFA_FACING = { 0: 'the TV wall', 90: 'the right-hand wall', 180: 'the front wall', 270: 'the left wall' };
function sofaHome(S) {
  return { x: (tvAt ?? [ROOM_WIDTH / 2])[0], y: state.pieces.sofa.in.livingRoom.front + S.d / 2, turn: 0 };
}
// Where it is now, and the floor it covers (x0 to x1, y0 to y1), square to
// the walls, as it's turned
function sofaSpot() {
  const S = currentSofa(), { x, y, turn } = state.pieces.sofa.in.livingRoom.move ?? sofaHome(S);
  const sideways = turn % 180 !== 0;
  const across = sideways ? S.d : S.w, along = sideways ? S.w : S.d;
  const x0 = Math.round(x - across / 2), y0 = Math.round(y - along / 2);
  return { S, x, y, turn, x0, x1: x0 + across, y0, y1: y0 + along };
}
// Drawn in a group of its own, its middle at the group's origin and its
// front to -y (facing the TV wall), then moved and turned into place
function sofa(g) {
  if (!SOFAS[state.pieces.sofa.design.model]) return '';
  const spot = sofaSpot(), { S } = spot, sub = new THREE.Group(), cushion = 150;
  const x0 = -S.w / 2, x1 = S.w / 2, y0 = -S.d / 2, y1 = S.d / 2;
  sub.position.set(spot.x * MM, 0, spot.y * MM);
  sub.rotation.y = THREE.MathUtils.degToRad(-spot.turn);
  g.add(sub);
  pieces.sofa = sub;
  sofaMat.color.set(S.colour ?? '#9DA3A6');
  if (S.daybed) {
    sub.add(daybed(S, sofaMat));
    return sofaText(spot);
  }
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
  if (!state.pieces.sofa.in.livingRoom.move) return ` A sofa facing the TV, ${sizes} Its front is ${y0} from the TV wall ${floor}.${sofaByIsland(spot)}`;
  return ` A sofa, ${sizes} Moved: its middle at x ${Math.round(x)}, y ${Math.round(y)}, facing ${SOFA_FACING[turn]} ${floor}.${sofaByIsland(spot)}`;
}
// Whether the sofa's floor runs into the island's, or how far behind it the
// island starts (where the sofa's square to the TV, its back to the island)
function sofaByIsland({ turn, x0, x1, y0, y1 }) {
  if (state.pieces.island.in.livingRoom.at === 'none') return '';
  const { x0: ix0, x1: ix1, y0: iy0, y1: iy1 } = islandSpot();
  const level = x0 < ix1 && x1 > ix0;
  if (level && y1 > iy0 && y0 < iy1) return ' It runs into the island.';
  return level && iy0 >= y1 && turn === 0 ? ` Behind it, ${iy0 - y1} to the island.` : '';
}
function frontWall(g, no) {
  if (islandOnWall()) {
    const { x0, x1, y0 } = islandSpot();
    return ` The kitchen island against the front wall between the sink and the desk, its ${state.pieces.island.in.livingRoom.at === 'out' ? 'long' : 'short'} side out (x ${x0}-${x1}), coming ${ROOM_DEPTH - y0} out from the wall to y ${y0}.`;
  }
  if (no === CURRENT_ROOM) return '';
  if (state.livingRoom.frontWall === 'dresser') return dresser(pieces.dresser = placePiece(g));
  if (state.livingRoom.frontWall === 'bookshelf') return bookcaseOnFrontWall(g);
  const L = currentLarder();
  if (state.livingRoom.frontWall !== 'larder' || !L) return '';
  const x0 = larderFrontX0(L);
  const text = larder(pieces.larder = placePiece(g), L, x0);
  return ` A larder on the front wall between the sink and the desk (x ${x0}-${x0 + L.w}): the ${text}.` + widerThanFrontGap(L.w);
}
// A bookcase like the bedroom's on the front wall between the sink and the
// desk, at its bedroom sizes: its back to the wall, centred there. Each
// place has its own, so it's drawn whether or not there's one on the back
// wall or in the bedroom.
function bookcaseOnFrontWall(g) {
  const { w, d, h } = state.pieces.bookcase.design, x0 = frontX0(w);
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
  if (state.pieces.cornerCupboard.design.option === CURRENT_ROOM) return null;
  if (state.livingRoom.frontWall === 'dresser') return { ...dresserSpan(), heights: [0, state.pieces.dresser.design.baseH, state.pieces.dresser.design.h] };
  if (state.livingRoom.frontWall === 'bookshelf') {
    const { w, h } = state.pieces.bookcase.design;
    return { x0: frontX0(w), x1: frontX0(w) + w, heights: [0, h] };
  }
  const L = currentLarder();
  if (state.livingRoom.frontWall !== 'larder' || !L) return null;
  return { x0: larderFrontX0(L), x1: larderFrontX0(L) + L.w, heights: [0, larderHeight(L)] };
}
// The bedroom's New cupboard starts as option 10 (its list has no current
// room); the living room has no cupboard yet, the current room (LOUNGE_NOW)
state.pieces.bedroomCupboard.design = structuredClone(state.pieces.cornerCupboard.design);
state.pieces.cornerCupboard.design.option = CURRENT_ROOM;


// ---------------------------------------------------------------------------
// Dimensions for the 2D views, drawn from the current option and settings
// ---------------------------------------------------------------------------
let dims = null;                   // the group of dimensions on show

// Room (x, y, z) in mm to a scene point
const P = (x, y, z) => new THREE.Vector3(x * MM, z * MM, y * MM);

// dimLine(), dimLabel() and chain(), which draw them, are the kit's

// Heights of what's above the bench: shelf tops, and the TV's bottom and top
function aboveHeights(x0) {
  const above = state.pieces.aboveBench.design.what;
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
  if (benchDrawn()) return [state.pieces.bench.design.height, ...aboveHeights(option.clearFrom(cupboardSettings()))];
  const againstWall = key => { const m = inLivingRoom(key).move; return !m || (m.y === 0 && m.turn === 0); };
  return onBackWall().filter(againstWall).map(key => BACK_WALL_PIECES[key].sizes().h);
}

function updateDims() {
  if (dims) world.remove(dims);
  dims = null;
  if (cupboardOnly && cupboard && (!flat || showDims)) {
    dims = new THREE.Group();
    world.add(dims);
    cupboard.dims({ flat, flatView }, dims);
    doorDims(dims);
    return;
  }
  if (!flat || !showDims || !flatView) return;
  dims = new THREE.Group();
  world.add(dims);
  const BENCH = state.pieces.bench.design.height, { what: above, shelfDepth } = state.pieces.aboveBench.design, { T, R, F } = state.pieces.cornerCupboard.design;
  const option = optionOf(state.pieces.cornerCupboard.design.option), settings = cupboardSettings();
  const alongBack = [0, option.fixedWidth ? 0 : T, ...(option.marks ? option.marks(settings) : []), option.benchFrom(settings), option.clearFrom(settings), ROOM_WIDTH];
  const alongLeft = [0, R, ...(option.front ? [option.front(settings)] : T || option.fixedWidth ? [F] : []), DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, DOOR_HINGE_AT + ROOM_DOOR, FRAME_END];
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
  } else if (flatRoom !== 'livingRoom') {
    roomWallDims(ROOM_BOXES[flatRoom], flatView, dims);
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

// Another room's wall, seen from inside: the wall's length, under it, and
// the room's height, beside it
function roomWallDims(box, view, g) {
  if (!box) return;
  const { x0, x1, y0, y1, floor: f, ceiling: c } = box;
  const alongX = view === 'back' || view === 'front', y = view === 'back' ? y1 : y0, x = view === 'left' ? x1 : x0;
  if (alongX) {
    chain([x0, x1], (v, off) => P(v, y, f - 200 - off), g);
    chain([f, c], (v, off) => P(x1 + 250 + off, y, v), g);
  } else {
    chain([y0, y1], (v, off) => P(x, v, f - 200 - off), g);
    chain([f, c], (v, off) => P(x, y1 + 250 + off, v), g);
  }
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


// Cupboard only: the corner cupboard on its own (the option's build), with
// its dimensions, in the 3D and 2D views alike
const cupboardPart = (o, withDoors = true) => Boolean(cupboard) && cupboard.partOf(o, withDoors);
// The cupboard's door sizes, with the Door sizes button on
function doorDims(g) {
  if (cupboard && showDoorDims) cupboard.doorDims({ flat, flatView }, g);
}

// A corner cupboard's cutting list, by its piece's name (the living room's
// unless given), for the page
const cuttingList = (piece = 'cornerCupboard') => cupboardOf(piece)?.cuttingList() ?? new Map();

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
  // Last, as it was added last (the two racks were one block, first)
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
state.thingsToStore.spots = STORED.map(() => ({ x: 0, y: 0, turned: false, z: 0 }));   // z: how high it stands, as on a shelf
// Where they are (state.thingsToStore.where), by the configuration's words: by the
// window, in the cupboard, or moved by hand
const STORED_WHERE = { window: 0, cupboard: 1, byHand: 2 };
const BY_HAND = STORED_WHERE.byHand;
// Where they are now (the user's photo, 18 Oct 2026; estimated from it), in
// STORED's order, each its back left corner: where Cornwall stands
// (LOUNGE_NOW), the ladders against the left wall at its door end, the
// hoover at its front, the mop's bucket and a rack by Chesham, the other
// rack (not in the photo) behind that one; the tub in front, clear of the
// sofa and the door. All on the floor, as the tables are hidden to start
// (asked for, 19 Oct 2026); on Cornwall they'd be LEGS_OFF_H up.
const ON_THE_FLOOR = 0;
const STORED_NOW = [
  { x: 330, y: 380, turned: true, z: ON_THE_FLOOR },             // Rack 1
  { x: 100, y: 700, turned: true, z: ON_THE_FLOOR },             // the folding ladder
  { x: 0, y: 650, turned: true, z: ON_THE_FLOOR },               // the long ladder
  { x: 450, y: 450, turned: true, z: ON_THE_FLOOR },             // the mop's bucket
  { x: 440, y: 880, turned: false, z: ON_THE_FLOOR },            // the hoover
  { x: 820, y: 1380, turned: false, z: ON_THE_FLOOR },           // the tub
  { x: 30, y: 30, turned: false, z: ON_THE_FLOOR },              // Rack 2
];
Object.assign(state.thingsToStore, { shown: true, where: BY_HAND, spots: structuredClone(STORED_NOW) });   // shown, as they are now
const storedGroup = new THREE.Group();
world.add(storedGroup);
const storedMats = STORED.map(s => new THREE.MeshStandardMaterial({ color: s.colour, roughness: 0.7 }));
const storedLineMat = new THREE.LineBasicMaterial({ color: 0x1f4e79, depthTest: false });
const storedSize = k => sizeOf(k, storedSpots()[k].turned);

// A thing's short name printed flat on its top face, along its longer side,
// reading the right way up when facing the back wall
function faceLabel(text, x, y, w, d, z, g) {
  const along = Math.max(w, d), across = Math.min(w, d);
  const canvas = makeCanvas();
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
// the clear height above each, in mm (corner_cupboard.js's insideSpaces())
const cupboardSpaces = () => Cupboard.insideSpaces(cupboardSettings(), LIVING_ROOM_PLACE);
// The inside as words, for the description: each space's width along the
// back wall × depth out from it, and the clear height
function insideText() {
  const spaces = cupboardSpaces();
  if (!spaces.length) return '';
  const sizes = spaces.map(({ poly }) => {
    const [x0, x1] = spanOf(poly, 0), [y0, y1] = spanOf(poly, 1);
    return `${Math.round(x1 - x0)} × ${Math.round(y1 - y0)}${poly.length > 4 ? ' at most' : ''}`;
  });
  return ` Inside, within its ${state.pieces.cornerCupboard.design.BOARD} boards (rear panels against the walls included): ${sizes.join(spaces.length > 1 ? ' along the back wall and ' : '')}` +
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
// Where the things stand: state.thingsToStore.spots, the settings, once they're
// moved by hand (where is BY_HAND); else worked out, by the window or in
// the cupboard as their packing has them (placeStored()), and never kept
// in the settings (REFACTOR_PLAN.md item 13)
let packedSpots = STORED.map(() => ({ x: 0, y: 0, turned: false, z: 0 }));
export const storedSpots = () => (state.thingsToStore.where === BY_HAND ? state.thingsToStore.spots : packedSpots);
// Put the things where state.thingsToStore.where says, in its packing
export function placeStored() {
  const { packing, where } = state.thingsToStore;
  if (where === BY_HAND) return;                                 // moved by hand: where they were put
  const pack = PACKINGS[packing].at;
  // flip: the packing turned to run the other way (its x and y swapped).
  // A packing stands on the floor (z 0), wherever they were before
  const lay = (ox, oy, flip) => pack.map(([x, y, t]) => ({ ...(flip ? { x: ox + y, y: oy + x, turned: !t } : { x: ox + x, y: oy + y, turned: Boolean(t) }), z: 0 }));
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
  packedSpots = spots;
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
    const { x, y } = storedSpots()[k], [w, d] = storedSize(k);
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
  const { shown, where: placed } = state.thingsToStore, stored = storedSpots();
  storedGroup.traverse(o => {
    o.geometry?.dispose();
    if (o.isSprite || o.material?.map) {                        // labels have their own materials
      o.material.map?.dispose();
      o.material.dispose();
    }
  });
  storedGroup.clear();
  storedGroup.visible = shown;
  cupboard?.drawShelves(storedThings());                        // cut back round where they now stand
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
      ? ` In option ${state.pieces.cornerCupboard.design.option}'s corner cupboard: ${fits.filter(f => f === 'fits').length} of ${STORED.length} fit` +
        (misfits.length ? `; not ${misfits.join(', ')}.` : '.') + (cupboard.shelfCutText(storedThings()) || ' No shelves need cutting back.')
      : '';
  return `Standing on the floor they take ${area} (${((x1 - x0) * (y1 - y0) / 1e6).toFixed(2)} m², for ` +
    `${(footprints / 1e6).toFixed(2)} m² of footprints), up to ${Math.max(...STORED.map(s => s.h))} high.` + where +
    ' In the plan view, drag them to move them; double-click or double-tap one to turn it round.';
}


let cupboard = null;         // the living room's corner cupboard (makeCupboard())
let livingGroup = null;      // the cupboard and everything round it that the option's build draws: the bench wall, the front wall, the sofa
let bedroomCupboard = null;  // the bedroom's own corner cupboard (BEDROOM_PLACE), while its New cupboard switch is on


// The bedroom's New cupboard switch: its own cupboard, built from its own
// settings against the bedroom (BEDROOM_PLACE) in its own materials, its
// shelves whole (nothing's stored in it), or none. As the living room's
// (build()), option 8 falls back to 7 with no left-wall cupboard, and a new
// option starts with its second door shut (`onShow`: the option on show
// till now)
function buildBedroomCupboard(onShow) {
  bedroomCupboard = null;
  if (state.pieces.bedroomCupboard.design.option !== onShow) doors.bedroomCupboardSecond = 0;
  if (!state.pieces.bedroomCupboard.in.bedroom.on) return showNewCupboard(null);
  bedroomCupboard = makeCupboard(cupboardSettings('bedroomCupboard'), BEDROOM_PLACE, BEDROOM_MATERIALS);
  bedroomCupboard.drawShelves([]);
  showNewCupboard(bedroomCupboard.group);
}
// Each corner cupboard as built (makeCupboard()), by its piece's name, or
// null while there's none
export const cupboardOf = piece => ({ cornerCupboard: cupboard, bedroomCupboard })[piece] ?? null;
// The options on show, each cupboard's, as build() is told them when the
// menus have already set new ones
export const optionsOnShow = () => ({ cornerCupboard: state.pieces.cornerCupboard.design.option, bedroomCupboard: state.pieces.bedroomCupboard.design.option });

// The pieces that can stand in the living room in place of the bench (the
// back wall's Bookshelf, Pine cupboard, Billy and BillyChest switches), the
// bedroom's at their bedroom sizes, Billy (standing or lying) and BillyChest
// at their own: its settings are inLivingRoom(key).on and .move,
// its controls `${key}On`, `${key}X` and so on. Where one stands: the middle
// of its back, room x and y, and how far it's turned, in quarter turns (as
// in the bedroom), which way it faces given in FACING. Each starts with its
// back to the back wall (`home`, from x0, where the clear wall starts): the
// bookcase centred on the clear wall, as the TV is, or against the
// cupboards if it's wider than that wall; the pine cupboard in the corner
// by the right-hand wall (chosen, 15 Oct 2026), the bookcase then centred
// on what's left, so the two can stand together; Billy and BillyChest
// against the cupboards, where the bench starts (asked for, 18 Oct 2026). Their
// sliders move them from there.
const BACK_WALL_PIECES = {
  bookshelf: {
    sizes: () => state.pieces.bookcase.design, draw: bookcase, name: "A bookcase like the bedroom's", short: 'the bookcase',
    home: (x0, w) => ({ x: Math.max(x0 + w / 2, (x0 + clearTo()) / 2), y: 0, turn: 0 }),
    homeText(x0, w) {
      const span = clearTo() - x0, beside = pineInCorner() ? ' beside the pine cupboard' : '';
      return w <= span ? `centred on the ${span} of clear wall${beside}` : `against the cupboards, ${w - span} wider than the ${span} of clear wall${beside}`;
    },
  },
  pine: {
    sizes: () => state.pieces.pineCupboard.design, draw: pineCupboard, name: "The bedroom's pine cupboard", short: 'the pine cupboard',
    home: (x0, w) => ({ x: ROOM_WIDTH - w / 2, y: 0, turn: 0 }),
    homeText: () => 'in the corner by the right-hand wall',
  },
  billy: {
    sizes: () => billySizes(state.pieces.billy.in.livingRoom.lying), draw: () => billy(state.pieces.billy.in.livingRoom.lying), short: 'Billy',
    get name() { return state.pieces.billy.in.livingRoom.lying ? 'Billy, from the garage, lying on its long side' : 'Billy, from the garage'; },
    home: (x0, w) => ({ x: x0 + w / 2, y: 0, turn: 0 }),
    homeText: () => 'against the cupboards, where the bench starts',
  },
  billyChest: {
    sizes: () => BILLY_CHEST, draw: billyChest, name: 'BillyChest, from the garage', short: 'BillyChest',
    home: (x0, w) => ({ x: x0 + w / 2, y: 0, turn: 0 }),
    homeText: () => 'against the cupboards, where the bench starts',
  },
};
// Where the bookcase's clear wall ends: at the right-hand wall, or at the
// pine cupboard while it's in the corner there, where it starts
const pineInCorner = () => state.pieces.pineCupboard.in.livingRoom.on && !state.pieces.pineCupboard.in.livingRoom.move;
const clearTo = () => (pineInCorner() ? ROOM_WIDTH - state.pieces.pineCupboard.design.w : ROOM_WIDTH);
const BACK_WALL_KEYS = Object.keys(BACK_WALL_PIECES);
const FACING = { 0: 'the front wall', 90: 'the left wall', 180: 'the back wall', 270: 'the right wall' };
const onBackWall = () => BACK_WALL_KEYS.filter(key => inLivingRoom(key).on);
// The bench is drawn when it's on and nothing stands in its place
const benchDrawn = () => state.pieces.bench.in.livingRoom.on && onBackWall().length === 0;
const spotOf = key => inLivingRoom(key).move ?? BACK_WALL_PIECES[key].home(optionOf(state.pieces.cornerCupboard.design.option).clearFrom(cupboardSettings()), BACK_WALL_PIECES[key].sizes().w);
// Draw one, clear of the bench wall from x0. Returns a sentence for the summary.
function pieceOnBenchWall(key, x0, g) {
  const { sizes, draw, name, homeText } = BACK_WALL_PIECES[key], { w, d, h } = sizes();
  const moved = inLivingRoom(key).move, { x, y, turn } = spotOf(key);
  const piece = draw({ w, d, h });                              // drawn with its back's middle at its origin, facing out
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  g.add(piece);
  const named = `${name} (${w} wide, ${d} deep, ${h} high)`;
  if (moved) return ` ${named} in place of the bench, moved: the middle of its back at x ${x}, y ${y}, facing ${FACING[turn]}.`;
  return ` ${named} on the back wall, ${homeText(x0, w)}.`;
}

// The Ivar in the living room, where it is now (the user's, 18 Oct 2026):
// by the first radiator (the one nearest the back wall), a 300 side to the
// radiator's front and centred on it, 830 out into the room as it lies on
// its side. Placed as the back wall's pieces are, the middle of its back
// and its turn: turned 0°, its back faces the back wall and its length runs
// out from the radiator. Its sliders move it from there
function ivarHome() {
  const { windows: [first], radiator } = OUTER, { w, d } = ivarSizes(state.pieces.ivar.in.livingRoom.lying);
  const radiatorMiddle = (first.y[0] + first.y[1]) / 2, radiatorFront = ROOM_WIDTH - radiator.out;
  return { x: radiatorFront - w / 2, y: radiatorMiddle - d / 2, turn: 0 };
}
const ivarSpot = () => state.pieces.ivar.in.livingRoom.move ?? ivarHome();

// The kitchen tables in the living room, each starting where it is now
// (LOUNGE_NOW) and moved from there by its sliders. A table on top of
// another where they overlap (Chesham on Cornwall) stands on it
const TABLES = {
  cornwall: { table: CORNWALL, name: 'The Cornwall table', pose: () => ({ legsOff: state.pieces.cornwall.in.livingRoom.legsOff }),
    posed: () => (state.pieces.cornwall.in.livingRoom.legsOff ? 'on the floor with its legs off' : 'on its legs') },
  chesham: { table: CHESHAM, name: 'The Chesham table', pose: () => ({ onItsEnd: state.pieces.chesham.in.livingRoom.onItsEnd }),
    posed: () => (state.pieces.chesham.in.livingRoom.onItsEnd ? 'on its end, its top against the wall behind it' : 'on its legs') },
};
const TABLE_KEYS = Object.keys(TABLES);                         // Cornwall first, as Chesham may stand on it
const tableSpot = key => inLivingRoom(key).move ?? LOUNGE_NOW[key];
// Where a piece stands on the floor, in the scene: its box's x and z
const footprint = piece => { piece.updateMatrixWorld(true); return new THREE.Box3().setFromObject(piece); };
const overlaps = (a, b) => a.min.x < b.max.x && b.min.x < a.max.x && a.min.z < b.max.z && b.min.z < a.max.z;
// Drawn into the option's group, each that's in. Returns their sentences for the summary
function tablesInLivingRoom(g) {
  const drawn = [];
  let text = '';
  for (const key of TABLE_KEYS) {
    if (!inLivingRoom(key).on) continue;
    const { table, name, pose, posed } = TABLES[key], { x, y, turn } = tableSpot(key), { w, d, h } = tableSizes(table, pose());
    const piece = kitchenTable(table, pose());
    piece.position.set(x * MM, 0, y * MM);
    piece.rotation.y = THREE.MathUtils.degToRad(-turn);
    // measured before it joins the group, so in the room's own scene units
    const under = drawn.find(other => overlaps(footprint(piece), other));
    if (under) piece.position.y = under.max.y;                  // on top of it
    drawn.push(footprint(piece));
    g.add(piece);
    pieces[key] = piece;
    const on = under ? ', on the other table' : '';
    text += ` ${name}, ${posed()}${on} (${w} along, ${d} out, ${h} high): the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}, facing ${FACING[turn]}.`;
  }
  return text;
}
// The desk on castors: parked against the left wall, its far end
// CASTOR_DESK_CLEAR short of the door frame, so it sits between the frame
// and the corner cupboard; or wheeled out in front of the TV, centred on it,
// its back CASTOR_DESK_CLEAR out from the bench (or the back wall), where you
// sit facing the TV. Placed as the tables are, the middle of its back and
// its turn; its sliders move it from either
const CASTOR_DESK_CLEAR = { door: 20, tv: 100 };   // chosen
const CASTOR_DESK_HOMES = {
  door: () => ({ x: 0, y: DOOR_FRAME_STARTS_AT - CASTOR_DESK_CLEAR.door - castorDeskSizes().w / 2, turn: 270 }),   // its back to the left wall
  tv: () => ({ x: tvAt[0], y: (benchDrawn() ? state.pieces.cornerCupboard.design.R : 0) + CASTOR_DESK_CLEAR.tv, turn: 0 }),     // its back to the TV
};
const castorDeskSpot = () => state.pieces.castorDesk.in.livingRoom.move ?? CASTOR_DESK_HOMES[state.pieces.castorDesk.in.livingRoom.at]();
const CASTOR_DESK_WHERE = {
  door: () => `parked by the door: its back against the left wall, ${CASTOR_DESK_CLEAR.door} short of the door frame`,
  tv: () => `in front of the TV, centred on it, its back ${CASTOR_DESK_CLEAR.tv} out from the ${benchDrawn() ? 'bench' : 'back wall'}, facing away from it`,
};
// Drawn into the option's group if it's in, after the cupboard and the
// bench wall (it uses where the TV is). Returns a sentence for the summary,
// saying if it stands where the cupboard is
function castorDeskInLivingRoom(g) {
  if (!state.pieces.castorDesk.in.livingRoom.on) return '';
  const { x, y, turn } = castorDeskSpot(), { w, d, h } = castorDeskSizes();
  const piece = castorDesk();
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  // measured before it joins the group, as the tables are, with the cupboard's doors still shut
  const clash = cupboard && overlaps(footprint(piece), footprint(cupboard.group)) ? ' It stands where the corner cupboard is.' : '';
  g.add(piece);
  pieces.castorDesk = piece;
  const where = state.pieces.castorDesk.in.livingRoom.move ? `moved: the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}, facing ${FACING[turn]}` : CASTOR_DESK_WHERE[state.pieces.castorDesk.in.livingRoom.at]();
  return ` The desk on castors (${w} long, ${d} deep, ${h} high), ${where}.${clash}`;
}
// Drawn into the option's group if it's in. Returns a sentence for the summary
function ivarInLivingRoom(g) {
  if (!state.pieces.ivar.in.livingRoom.on) return '';
  const { x, y, turn } = ivarSpot(), { w, d, h } = ivarSizes(state.pieces.ivar.in.livingRoom.lying);
  const piece = ivar(state.pieces.ivar.in.livingRoom.lying);
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  g.add(piece);
  pieces.ivar = piece;
  const named = `The Ivar, ${state.pieces.ivar.in.livingRoom.lying ? 'lying on its side' : 'standing'} (${w} long, ${d} wide, ${h} high)`;
  if (state.pieces.ivar.in.livingRoom.move) return ` ${named}, moved: the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}.`;
  return ` ${named}, against the first radiator, ${w} out into the room.`;
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


// The option's cupboard (corner_cupboard.js), in a new group in place of
// the last, which everything round it is then drawn into
function buildOption() {
  if (livingGroup) {
    world.remove(livingGroup);
    clearDrawing(livingGroup);                                  // its geometry freed
  }
  livingGroup = new THREE.Group();
  world.add(livingGroup);
  pieces.dresser = pieces.larder = pieces.sofa = pieces.ivar = pieces.chesham = pieces.cornwall = pieces.castorDesk = null;
  cupboard = makeCupboard(cupboardSettings(), LIVING_ROOM_PLACE, CUPBOARD_MATERIALS);
  livingGroup.add(cupboard.group);
  return livingGroup;
}

// The bench beside the option's cupboard, from where the option says it
// starts to the right-hand wall, R deep and BENCH high: base cupboards for
// option 9, a bench top for the rest
function drawBench(option, group) {
  const BENCH = state.pieces.bench.design.height, { R } = state.pieces.cornerCupboard.design, from = option.benchFrom(cupboardSettings());
  const bench = new THREE.Group();
  group.add(bench);
  if (option.no === 9) baseCupboards(from, bench);
  else box({ from: [from, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, bench);
}

// The bench off: nothing above it either, but the TV's place is kept for
// the sofa to face
function keepTvPlace(option) {
  tvAt = [(option.clearFrom(cupboardSettings()) + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
}


// A piece moved in the living room: a spot that fits in it, its turn in
// quarter turns
const spotFits = ({ x, y, turn }) => x >= 0 && x <= ROOM_WIDTH && y >= 0 && y <= ROOM_DEPTH && turn >= 0 && turn < 360 && turn % QUARTER_TURN === 0;


const SHELF_WOODS = [
  { name: 'As drawn (pale oak)', hex: ['#D6BC8F', '#C8A26B'] },
  { name: 'Honey oak (as the island top)', hex: '#D6A562' },
  { name: 'Dark oak', hex: '#8A5A33' },
  { name: 'Walnut', hex: '#5C3D26' },
];

// Shelf tops from 100 up to under the top board (of `board` thickness,
// under `ceiling`: the living room cupboard's unless given), each once, in
// order: as typed, any numbers in the text, and from a configuration
const shelfTopsOf = (tops, board = state.pieces.cornerCupboard.design.BOARD, ceiling = CEILING_HEIGHT) =>
  [...new Set(tops.filter(v => v >= 100 && v <= ceiling - 2 * board))].sort((a, b) => a - b);
const readShelves = text => shelfTopsOf(String(text).split(/[^0-9]+/).map(Number));

// ---------------------------------------------------------------------------
// The configuration: every setting as JSON, by piece, each piece with its
// design and the rooms it's in (`in`), with the doors, the colours and the
// things to store (REFACTOR_PLAN.md, step 6; room_dimensions.md has its
// format). SCHEMA has an entry for each setting (kit/config_kit.js), the
// living room's here and the other rooms' from their modules; to start,
// it's a two-way map onto state, which the drawing code still reads.
// Ranges are the sliders' in index.html, unless an entry says.
// ---------------------------------------------------------------------------
const CONFIGURATION_VERSION = 2;   // up only when a setting changes its path or meaning: 2 when the doors went into the view (22 Oct 2026)
// The ranges of the sliders the schema's numbers follow, chosen, as in
// index.html: [lowest, highest, step], by the slider's id. A test checks
// they agree with index.html's (room_3d.spec.js). The dresser's, larder's
// and sofa's are in DRESSER_SLIDERS, LARDER_SLIDERS and SOFA_SLIDERS
const SLIDER_RANGES = {
  roomDoor: [0, 110, 1], tallDoor: [0, 180, 1], secondDoor: [0, 180, 1], bedroomDoor: [0, 180, 1], flatDoor: [0, 90, 1], outsideDoor: [0, 90, 1],
  bedroomCupboardTallDoor: [0, 180, 1], bedroomCupboardSecondDoor: [0, 180, 1],
  rear: [300, 800, 10], board: [12, 25, 1], leg: [400, 1200, 1], legD: [330, 1000, 1],
  ward: [600, 1400, 50], wardD: [330, 1000, 10], tower: [0, 600, 50],
  cornerW: [500, 1200, 10], cornerD: [0, 1329, 1], sideW: [200, 800, 10], sideD: [150, 800, 10],
  deskW: [300, 1200, 10], deskD: [300, 700, 10], deskH: [650, 800, 10],
  leftLen: [1000, 1329, 1], top: [1800, 2450, 10], diagRun: [400, 1200, 10], diagBack: [0, 1800, 10], diagLeft: [0, 2700, 10],
  shelfDepth: [150, 400, 10], islandTurn: [0, 180, 5], sofaFront: [1000, 3500, 50],
};
for (const [, id, lo, hi, step] of [...DRESSER_SLIDERS, ...LARDER_SLIDERS, ...SOFA_SLIDERS]) SLIDER_RANGES[id] = [lo, hi, step];
// A control's id in a copy of the living room's controls: the piece's name,
// then the living room's id with a capital, as 'bedroomCupboardDepth' for
// 'depth' (cupboard_controls.js's copyControls())
export const idIn = piece => name => `${piece}${name[0].toUpperCase()}${name.slice(1)}`;
// The bedroom cupboard's sliders that reach further than the living
// room's (a copy of them, each id with 'bedroomCupboard' before it): along
// the chimney breast to the recess, and out to the hallway wall (where they
// can go as its settings stand is cupboardLimits())
export const BEDROOM_CUPBOARD_RANGES = {
  leg: [400, BEDROOM_ALONG_BREAST, 1], diagRun: [400, BEDROOM_ALONG_BREAST, 1], cornerW: [500, BEDROOM_ALONG_BREAST, 1],   // in 1s, to reach the recess exactly
  leftLen: [1000, OTHER_ROOM.breastFace, 1], cornerD: [0, OTHER_ROOM.breastFace, 1],
};
// A number held to the range of the slider with this id, which it keeps
// (`slider`), for the test; `range`, when it isn't the living room's
function fromSlider(path, setting, id, more, range = SLIDER_RANGES[id]) {
  const [min, max, step] = range;
  return { ...Config.number(path, setting, min, max, step, more), slider: id };
}
const isColour = code => code === 0 || Boolean(colourOf(code));
// A place moved to in the living room, or null where it starts
const spotOrHome = (path, setting) => Config.other(path, setting, v => (v === null ? null : v && spotFits(v) ? { x: v.x, y: v.y, turn: v.turn } : undefined));
// The things to store's places are read only when they've been moved by
// hand; otherwise they're worked out from the packing (placeStored())
function readStoredSpots(spots, was, settings) {
  if (settings.thingsToStore.where !== BY_HAND || !Array.isArray(spots)) return undefined;
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  return was.map((spot, k) => {
    const { x, y, turned, z } = spots[k] ?? {};
    if (!finite(x) || !finite(y)) return spot;
    return { x, y, turned: turned === true, z: finite(z) && z >= 0 && z <= CEILING_HEIGHT ? z : 0 };
  });
}
// A corner cupboard's entries: its design at `design` in the configuration
// (as 'pieces.cornerCupboard.design'), its settings at `setting` in state
// (as 'cornerCupboard'), under its room's `ceiling`, its sliders' ids
// `id(name)` from the living room's, and their `ranges` where they aren't
// the living room's. The option by its number, as state has it; the boards' thickness before option 7's shelves, checked against
// it and the ceiling
function cupboardEntries(design, setting, ceiling, { id = name => name, ranges = {} } = {}) {
  const at = key => `${design}.${key}`, of = key => `${setting}.${key}`;
  const slider = (key, name) => fromSlider(at(key), of(key), id(name), {}, ranges[name] ?? SLIDER_RANGES[name]);
  return [
    Config.other(at('option'), of('option'), no => (optionOf(no) ? no : undefined), no => no),
    Config.number(at('T'), of('T'), 0, 800, 10, { also: t => t === 0 || t >= 300 }),   // none, or 300 to 800
    slider('R', 'rear'),
    slider('F', 'leftLen'),
    slider('BOARD', 'board'),
    Config.number(at('TOP'), of('TOP'), 0, ceiling, 10, { also: top => top === 0 || top >= SLIDER_RANGES.top[0] }),   // the ceiling, or 1800 up to it
    slider('LEG', 'leg'),
    slider('LEG_D', 'legD'),
    ...['back', 'left'].map(leg => Config.other(at(`L_SHELVES.${leg}`), of(`L_SHELVES.${leg}`),
      (tops, was, settings) => (Array.isArray(tops) ? shelfTopsOf(tops.filter(Number.isFinite), Config.valueAt(settings, of('BOARD')), ceiling) : undefined),
      tops => [...tops])),
    slider('DIAG_RUN', 'diagRun'),
    slider('DIAG_BACK', 'diagBack'),
    slider('DIAG_LEFT', 'diagLeft'),
    slider('WARD', 'ward'),
    slider('WARD_D', 'wardD'),
    slider('TOWER', 'tower'),
    slider('CORNER_W', 'cornerW'),
    slider('CORNER_D', 'cornerD'),
    Config.onOff(at('SIDE_SHELF'), of('SIDE_SHELF')),
    slider('SIDE_W', 'sideW'),
    slider('SIDE_D', 'sideD'),
    Config.onOff(at('DESK'), of('DESK')),
    slider('DESK_W', 'deskW'),
    slider('DESK_D', 'deskD'),
    slider('DESK_H', 'deskH'),
  ];
}
// Each cupboard's fold-down desk is shown one of two ways (asked for, 20 Oct
// 2026), not turned by a slider as the doors are: folded away (upright, 0°)
// or down, ready to use (level, 90°). Its angle is kept with the doors'
const DESK_ANGLES = ['desk', 'bedroomCupboardDesk'];
export const DESK_SHOWN = { foldedAway: 0, down: 90 };
// The doors' entries, in the view's doors (`doors`, above), each by its
// name: the sliders' angles (roomDoor, tallDoor and so on), the fold-down
// desks and the garage door
const SLIDER_DOORS = Object.keys(DOORS_START).filter(name => !DESK_ANGLES.includes(name) && name !== 'garage');
export const DOORS_SCHEMA = Config.withDefaults([
  ...SLIDER_DOORS.map(name => fromSlider(name, name, `${name}Door`)),
  ...DESK_ANGLES.map(name => Config.choice(name, name, DESK_SHOWN)),
  Config.choice('garage', 'garage', Object.keys(GARAGE_DOOR)),
], doors);
const LIVING_ROOM_SCHEMA = [
  ...Object.keys(COLOUR_TARGETS).map(key => Config.colour(`colours.${key}`, `colours.${key}`, isColour)),
  Config.number('colours.shelves', 'colours.shelves', 0, SHELF_WOODS.length - 1, 1, { onSteps: true }),
  Config.choice('livingRoom.frontWall', 'livingRoom.frontWall', FRONT_PIECES),
  ...cupboardEntries('pieces.cornerCupboard.design', 'pieces.cornerCupboard.design', CEILING_HEIGHT),
  ...cupboardEntries('pieces.bedroomCupboard.design', 'pieces.bedroomCupboard.design', BEDROOM_PLACE.ceiling, { id: idIn('bedroomCupboard'), ranges: BEDROOM_CUPBOARD_RANGES }),
  // The bench along the back wall, and what's above it
  Config.choice('pieces.bench.design.height', 'pieces.bench.design.height', [700, 780, 800, 900]),
  Config.onOff('pieces.bench.in.livingRoom.on', 'pieces.bench.in.livingRoom.on'),
  Config.choice('pieces.aboveBench.design.what', 'pieces.aboveBench.design.what', { nothing: 0, shelves: 1, tv: 2, tvAndShelves: 3, tvAndTopShelf: 4 }),
  fromSlider('pieces.aboveBench.design.shelfDepth', 'pieces.aboveBench.design.shelfDepth', 'shelfDepth'),
  Config.choice('pieces.aboveBench.design.tv', 'pieces.aboveBench.design.tv', TV_SIZES.map(([inches]) => inches)),
  // The dresser, the larder and the sofa: each a model from dressers.js,
  // larders.js or sofas.js, and its sizes (the larder's and the sofa's held
  // to their sliders' ends)
  ...DRESSER_SLIDERS.map(([key, id]) => fromSlider(`pieces.dresser.design.${key}`, `pieces.dresser.design.${key}`, id)),
  Config.choice('pieces.larder.design.model', 'pieces.larder.design.model', Object.keys(LARDERS)),
  ...LARDER_SLIDERS.map(([key, id]) => fromSlider(`pieces.larder.design.${key}`, `pieces.larder.design.${key}`, id, { clamp: true })),
  Config.choice('pieces.island.in.livingRoom.at', 'pieces.island.in.livingRoom.at', ISLAND_AT),
  Config.number('pieces.island.in.livingRoom.x', 'pieces.island.in.livingRoom.x', 0, ROOM_WIDTH, 5),
  Config.number('pieces.island.in.livingRoom.y', 'pieces.island.in.livingRoom.y', 0, ROOM_DEPTH, 5),
  fromSlider('pieces.island.in.livingRoom.turn', 'pieces.island.in.livingRoom.turn', 'islandTurn'),
  Config.choice('pieces.sofa.design.model', 'pieces.sofa.design.model', { none: '', ...Object.fromEntries(Object.keys(SOFAS).map(key => [key, key])) }),
  ...SOFA_SLIDERS.map(([key, id]) => fromSlider(`pieces.sofa.design.${key}`, `pieces.sofa.design.${key}`, id, { clamp: true })),
  Config.onOff('pieces.sofa.design.asBed', 'pieces.sofa.design.asBed'),
  fromSlider('pieces.sofa.in.livingRoom.front', 'pieces.sofa.in.livingRoom.front', 'sofaFront'),
  spotOrHome('pieces.sofa.in.livingRoom.move', 'pieces.sofa.in.livingRoom.move'),
  // The bedroom's pieces (other_room.js), then the bookcase and the pine
  // cupboard in the living room, in place of the bench
  ...OTHER_ROOM_SCHEMA,
  Config.onOff('pieces.bookcase.in.livingRoom.on', 'pieces.bookcase.in.livingRoom.on'),
  spotOrHome('pieces.bookcase.in.livingRoom.move', 'pieces.bookcase.in.livingRoom.move'),
  Config.onOff('pieces.pineCupboard.in.livingRoom.on', 'pieces.pineCupboard.in.livingRoom.on'),
  spotOrHome('pieces.pineCupboard.in.livingRoom.move', 'pieces.pineCupboard.in.livingRoom.move'),
  Config.onOff('pieces.billy.in.livingRoom.on', 'pieces.billy.in.livingRoom.on'),
  Config.onOff('pieces.billy.in.livingRoom.lying', 'pieces.billy.in.livingRoom.lying'),
  spotOrHome('pieces.billy.in.livingRoom.move', 'pieces.billy.in.livingRoom.move'),
  Config.onOff('pieces.billyChest.in.livingRoom.on', 'pieces.billyChest.in.livingRoom.on'),
  spotOrHome('pieces.billyChest.in.livingRoom.move', 'pieces.billyChest.in.livingRoom.move'),
  Config.onOff('pieces.ivar.in.livingRoom.on', 'pieces.ivar.in.livingRoom.on'),
  Config.onOff('pieces.ivar.in.livingRoom.lying', 'pieces.ivar.in.livingRoom.lying'),
  spotOrHome('pieces.ivar.in.livingRoom.move', 'pieces.ivar.in.livingRoom.move'),
  Config.onOff('pieces.chesham.in.livingRoom.on', 'pieces.chesham.in.livingRoom.on'),
  Config.onOff('pieces.chesham.in.livingRoom.onItsEnd', 'pieces.chesham.in.livingRoom.onItsEnd'),
  spotOrHome('pieces.chesham.in.livingRoom.move', 'pieces.chesham.in.livingRoom.move'),
  Config.onOff('pieces.castorDesk.in.livingRoom.on', 'pieces.castorDesk.in.livingRoom.on'),
  Config.choice('pieces.castorDesk.in.livingRoom.at', 'pieces.castorDesk.in.livingRoom.at', { byTheDoor: 'door', atTheTv: 'tv' }),
  spotOrHome('pieces.castorDesk.in.livingRoom.move', 'pieces.castorDesk.in.livingRoom.move'),
  Config.onOff('pieces.cornwall.in.livingRoom.on', 'pieces.cornwall.in.livingRoom.on'),
  Config.onOff('pieces.cornwall.in.livingRoom.legsOff', 'pieces.cornwall.in.livingRoom.legsOff'),
  spotOrHome('pieces.cornwall.in.livingRoom.move', 'pieces.cornwall.in.livingRoom.move'),
];
const SCHEMA = Config.withDefaults([
  ...LIVING_ROOM_SCHEMA,
  ...WICKER_BENCH_SCHEMA,
  ...SHOE_RACK_SCHEMA,
  ...STAIR_WALLS_SCHEMA,
  ...SHOE_BOXES_SCHEMA,
  Config.onOff('hallway.bathroomShown', 'hallway.bathroomShown'),
  ...GARAGE_SCHEMA,
  // The things to store: shown or not, which packing, and where
  Config.onOff('thingsToStore.shown', 'thingsToStore.shown'),
  Config.number('thingsToStore.packing', 'thingsToStore.packing', 0, PACKINGS.length - 1, 1, { onSteps: true }),
  Config.choice('thingsToStore.where', 'thingsToStore.where', STORED_WHERE),
  Config.other('thingsToStore.spots', 'thingsToStore.spots', readStoredSpots, (spots, settings) => (settings.thingsToStore.where === BY_HAND ? structuredClone(spots) : undefined)),   // only when they're settings
], state);
// The settings as a configuration, and a configuration read into them. One
// of version 1 had the doors in it (`doors`), which are the view's now, so
// they're read as the view's, and the rest as it is: a link from before
// keeps working
const configurationNow = () => Config.writeConfiguration(SCHEMA, state, { version: CONFIGURATION_VERSION });
function readConfiguration(configuration) {
  if (configuration?.version === 1) {
    readDoors(configuration.doors);
    configuration = { ...configuration, version: CONFIGURATION_VERSION };
  }
  if (configuration?.version !== CONFIGURATION_VERSION) {
    console.warn(`A configuration of version ${configuration?.version}, not ${CONFIGURATION_VERSION}: the page starts as it is`);
    return;
  }
  Config.readConfiguration(SCHEMA, configuration, state);
  holdSettings();
}
const DEFAULT_CONFIGURATION = Config.defaultConfiguration(SCHEMA, { version: CONFIGURATION_VERSION });

// ---------------------------------------------------------------------------
// Changing the settings, by their paths in the configuration: what the
// menus do, in place of writing state (REFACTOR_PLAN.md, set(path, value)).
// Each value is the configuration's (an option's number, `above`'s word,
// sizes in mm), checked by its entry as a link's are, so one that fails
// changes nothing. A cupboard's controls name its design's path, so the
// same controls can change either cupboard. state stays, for the drawing
// code to read, until the configuration is the store itself
// ---------------------------------------------------------------------------
function entryFor(path) {
  const entry = Config.entryAt(SCHEMA, path);
  if (!entry) throw new Error(`no setting at ${path}`);
  return entry;
}
// Each [path, value] of `edits` in turn, as one change (a setting checked
// against another comes after it, as the schema lists them). Returns
// whether every one was taken. One refused is an error in the console, as
// it means a control and its setting's entry disagree (the browser tests
// fail on one)
export function setAll(edits) {
  const refused = edits.filter(([path, value]) => !Config.readEntry(entryFor(path), value, state));
  for (const [path, value] of refused) console.error(`${JSON.stringify(value)} isn't a setting for ${path}: left as it was`);
  holdSettings();
  return refused.length === 0;
}
// Settings held to what can be built, as they're set or read, so building
// writes none (REFACTOR_PLAN.md item 13): each cupboard's option 8 needs a
// left-wall cupboard, so with none it's option 7, the L; the dresser's
// upper part is never deeper than its base; and the shelves, pictures and
// shoe boxes over the stairs stay on their walls and sills and clear of
// each other (stair_walls.js's settleStairWalls())
function holdSettings() {
  for (const piece of ['cornerCupboard', 'bedroomCupboard']) {
    const settings = state.pieces[piece].design;
    if (settings.T === 0 && optionOf(settings.option).needsLeft) settings.option = 7;
  }
  state.pieces.dresser.design.upperD = Math.min(state.pieces.dresser.design.upperD, state.pieces.dresser.design.baseD);
  settleStairWalls(state.hallway);
}
export const set = (path, value) => setAll([[path, value]]);
// A setting's value, as the configuration has it
export const get = path => Config.configurationValue(entryFor(path), state);
// For a control holding the page's own value (an option's place in OPTIONS,
// `above`'s 0 to 4): the configuration's, for set()
export const wordAt = (path, pageValue) => Config.wordFor(entryFor(path), pageValue);


// The dimensions' figures on show (only in a 2D view, or with the cupboard
// on its own), in the order they're drawn
function dimensionFigures() {
  const figures = [];
  dims?.traverse(o => { if (o.userData.text) figures.push(o.userData.text); });
  return figures;
}
// Where each piece is drawn: its box in the living room's mm (x along its
// back wall, y out from it, z up; the other rooms lie round it), to the mm,
// and whether it's on show (a piece taken out is still placed), so a piece
// moved even 2 mm changes the snapshot. null for one not drawn
function boxOf(object) {
  if (!object) return null;
  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;
  const round = n => Math.round(n / MM) || 0;                  // || 0: no -0, which the tests tell from 0
  const mm = v => [round(v.x), round(v.z), round(v.y)];
  let shown = true;
  for (let o = object; o; o = o.parent) shown &&= o.visible;
  return { from: mm(box.min), to: mm(box.max), shown };
}
// Each piece drawn, by its name, null where it isn't built: for
// pieceBoxes() and the page's view snapshot (which says how much of each a
// view shows)
const namedPieces = () => ({
  livingRoom: livingGroup,                                      // the option and all round it: the bench wall, the front wall, the sofa
  cornerCupboard: cupboard?.group,                              // the option's own build, without the bench
  dresser: pieces.dresser, larder: pieces.larder, sofa: pieces.sofa, island: islandGroup, 'ivar.livingRoom': pieces.ivar,
  'chesham.livingRoom': pieces.chesham, 'cornwall.livingRoom': pieces.cornwall, 'castorDesk.livingRoom': pieces.castorDesk,
  bedroomCupboard: otherRoomPieces.newCupboard,
  bed: otherRoomPieces.bed, bookcase: otherRoomPieces.bookcase, pineCupboard: otherRoomPieces.cupboard, mirror: otherRoomPieces.mirror,
  'billy.bedroom': otherRoomPieces.billy, 'billyChest.bedroom': otherRoomPieces.billyChest, 'ivar.bedroom': otherRoomPieces.ivar,
  bedsideTable: otherRoomPieces.bedsideTable, bedsideTableByCupboard: otherRoomPieces.bedsideTableByCupboard,
  kvistbro: otherRoomPieces.kvistbro, laundryBasket: otherRoomPieces.laundryBasket,
  ...Object.fromEntries(Object.entries(wickerBenches).map(([room, bench]) => [`wickerBench.${room}`, bench])),
  shoeRack,
  ...Object.fromEntries(Object.entries(garagePieces).map(([key, piece]) => [key === 'pine' ? 'pineCupboard.garage' : key, piece])),
});
const pieceBoxes = () => Object.fromEntries(Object.entries(namedPieces()).map(([name, object]) => [name, boxOf(object)]));

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------
// Worked out from the settings before anything's drawn, none of it kept in
// them (REFACTOR_PLAN.md item 13): the colours' materials, the shelves'
// wood, the TV's size and the heights above the bench, and where the
// island is
export function settle() {
  for (const target of Object.keys(COLOUR_TARGETS)) applyColour(target);
  applyShelfWood();
  benchHeights();
  placeIsland();
}
// The shelves' wood, and option 9's oak, from state.colours.shelves: one colour,
// or the shelves' and the oak's
function applyShelfWood() {
  const [shelves, oak = shelves] = [].concat(SHELF_WOODS[state.colours.shelves].hex);
  for (const materials of [CUPBOARD_MATERIALS, BEDROOM_MATERIALS]) {    // both cupboards'
    materials.shelf.color.set(shelves);
    materials.oak.color.set(oak);
  }
}

// Build the option chosen and everything round it, in every room, reading
// the settings and writing none. A new option starts with its second door
// shut; rebuilding the same one (a size changed) leaves the doors as they
// were. Then the things to store are placed (drawStored() draws them).
// `onShow`: each cupboard's option on show till now (optionsOnShow()), when
// the menus have already set new ones. Returns the option built, whether
// it's the one built before, and the description of what's round it
// (describe())
export function build(onShow = optionsOnShow()) {
  settle();
  const no = state.pieces.cornerCupboard.design.option, option = optionOf(no);
  const same = no === onShow.cornerCupboard && Boolean(cupboard);
  const group = buildOption();
  if (benchDrawn()) drawBench(option, group);
  else keepTvPlace(option);
  const clearFrom = option.clearFrom(cupboardSettings());
  const backWall = benchDrawn() ? benchWall(clearFrom, group)
    : onBackWall().map(key => pieceOnBenchWall(key, clearFrom, group)).join('');
  const aboveText = backWall + frontWall(group, no) + sofa(group) + ivarInLivingRoom(group) + tablesInLivingRoom(group) + castorDeskInLivingRoom(group);
  if (!same) doors.second = 0;
  drawOtherRoom(state);                                         // the bedroom's furniture
  buildBedroomCupboard(onShow.bedroomCupboard);                 // and its own corner cupboard
  drawWickerBench(state.pieces.wickerBench);                           // the wicker bench, in each room it's on in
  drawShoeRack(state.pieces.shoeRack);                                 // the shoe rack, downstairs
  drawStairWalls(state.hallway);                             // the shelves and pictures over the stairs
  drawShoeBoxes(state.hallway.shoeBoxes);                    // and the shoe boxes on the sills
  bathroom.visible = state.hallway.bathroomShown;                       // the bathroom and WC, or not
  drawGarage(state, state.pieces.pineCupboard.design);           // Sean, Billy, BillyChest and the rest, in the garage
  placeStored();                                                // the cupboard they go in may have changed
  return { option, same, aboveText };
}

// Build the option chosen and draw everything that follows from it, in the order
// each needs (REFACTOR_PLAN.md item 6), as both the page and buildFlat()
// do: build(), the things to store (and the cupboard's shelves cut round
// them), the doors turned, and last the dimensions, of the shelves and
// doors as drawn. Returns build()'s, and what drawStored() says of the
// things to store
export function rebuild(onShow = optionsOnShow()) {
  const built = build(onShow);
  const storedText = drawStored();
  turnDoors();
  updateDims();
  return { ...built, storedText };
}

const turn = degrees => THREE.MathUtils.degToRad(degrees);


// The doors as the view writes them, and a view's doors read in: any it
// leaves out, or that fail their check, stay as they were
export const doorsNow = () => Config.writeConfiguration(DOORS_SCHEMA, doors);
export const readDoors = given => Config.readConfiguration(DOORS_SCHEMA, given ?? {}, doors);
// Doors turned, as setAll() changes settings: [name, value] pairs, each
// value the view's (a desk's word). Returns whether every one was taken
export function setDoors(edits) {
  const refused = edits.filter(([name, value]) => !Config.readEntry(Config.entryAt(DOORS_SCHEMA, name), value, doors));
  for (const [name, value] of refused) console.error(`${JSON.stringify(value)} isn't an angle for the ${name} door: left as it was`);
  return refused.length === 0;
}
// The doors' angles as they're drawn (a desk's in degrees), for the tests
export const doorAngles = () => structuredClone(doors);

// The doors turned to their angles (they don't rebuild), each corner
// cupboard's second doors stopping at its room's walls, and the garage
// door drawn as it is
export function turnDoors() {
  cupboard?.turnDoors(doors);
  bedroomCupboard?.turnDoors({ tall: doors.bedroomCupboardTall, second: doors.bedroomCupboardSecond, desk: doors.bedroomCupboardDesk });
  roomHinge.rotation.y = turn(doors.room);
  bedroomHinge.rotation.y = -turn(doors.bedroom);              // it opens the other way, into the bedroom
  for (const [h, name] of [[flatDoorHinge, 'flat'], [outsideDoorHinge, 'outside']]) h.rotation.y = (h.userData.dir ?? 1) * turn(doors[name]);
  drawGarageDoor(doors.garage);
}

// The description of the option built: its summary (without the bench, if
// it's off), where the things to store go, what's round it, and its source,
// as HTML
export function describe(option, aboveText) {
  const summary = state.pieces.cornerCupboard.design.T === 0 && option.summaryNoLeft ? option.summaryNoLeft : option.summary;
  return `${withoutBench(summary(cupboardSettings(), LIVING_ROOM_PLACE, { BENCH: state.pieces.bench.design.height }))}${insideText()}${aboveText}<div class="src">From ${option.source}</div>`;
}

// The flat built from a configuration, with no page, seen as `view` shows it
// (setDisplay()'s fields: a 2D view's id and room, and the switches, for the
// dimensions; and its doors, as the view writes them, any left out as they
// start): what the page's snapshot holds (tests/snapshots/), the
// description as HTML, and the doors as turned
export function buildFlat(configuration, view = {}) {
  startAgain();
  Object.assign(doors, structuredClone(DOORS_START));
  readConfiguration(configuration);                             // (one of version 1 has doors)
  readDoors(view.doors);
  setDisplay({ flat: false, flatView: null, flatRoom: 'livingRoom', cupboardOnly: false, showDims: true, showDoorDims: true, ...view });
  const { option, aboveText } = rebuild();
  return {
    world,
    configuration: configurationNow(),
    cupboards: cupboardRows(),
    dimensions: dimensionFigures(),
    description: describe(option, aboveText),
    boxes: pieceBoxes(),
    doors: doorsNow(),
  };
}
// Each corner cupboard's cutting list as rows: the living room's and the
// bedroom's own, while it's there (none for the current room)
export const cupboardRows = () => ({
  livingRoom: state.pieces.cornerCupboard.design.option === CURRENT_ROOM ? null : cupboard.cuttingRows(),
  bedroom: bedroomCupboard && state.pieces.bedroomCupboard.design.option !== CURRENT_ROOM ? bedroomCupboard.cuttingRows() : null,
});

// The settings as the page starts, and putting them back so: everything,
// not only what's in the configuration (the things to store's places, read
// only when they've been moved by hand, and what's worked out, as where the
// dresser stands), so one configuration shown after another isn't left with
// any of the other's
const START = structuredClone(state);
export function startAgain() {
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, structuredClone(START));
}

// What the page reads, besides the functions exported where they're defined
export {
  flat, flatView, flatRoom, cupboardOnly, showDims, showDoorDims, drawStored,
  BACK_WALL_KEYS, CHAIR_TURN, CURRENT_ROOM, CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE,
  DEFAULT_CONFIGURATION, DRESSERS, DRESSER_SLIDERS, FINISHES, LARDERS,
  LARDER_SLIDERS, OPTIONS, PACKINGS, SCHEMA, SHELF_WOODS, SOFAS,
  SOFA_SLIDERS, STORED, TV_H, TV_SIZES, TV_W, benchDrawn, carcassMat,
  colourOf, configurationNow, cornerTooShallow, cupboard, cupboardPart, deskSpot,
  currentSofa, cuttingList, deskChair, diagonal, dimensionFigures, dims,
  dresserMat, frontFrom, frontGap, handleMat, islandGroup, islandMat,
  islandOnWall, islandTopMat, kitchenMat, larderHeight, larderOwnSize,
  cupboardSettings, oakMat, onBackWall, optionOf, namedPieces, pieceBoxes, pieces,
  readConfiguration, readShelves, screenMat, shelfMat,
  shownCode, sizesInOrder, sofaHome, sofaOwnSize, spotOf, ivarSpot, tableSpot, castorDeskSpot, state, storedGroup,
  storedMats, storedSize, tvAt, tvMat, updateDims, worktopMat,
};
