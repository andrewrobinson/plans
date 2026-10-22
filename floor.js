// The floor plan: the walls, the door frame and the windows, drawn into
// `floor`, a group the page adds to its scene, by drawFloor() (at the end). For now only the living room's
// (PLAN.md has the floor plan to come), in its mm: x along the back wall from
// the left wall, y from the back wall towards the front, z up. It exports
// the room's measurements (ROOM_WIDTH, the recesses, the door frame, …) and
// the materials the colours menu changes, for living_room.js.
import * as THREE from 'three';
import { MM, material, box, slab, hinge, skewHinge, oakBoards } from './kit/floor_kit.js';

export const floor = new THREE.Group();

const ROOM_WIDTH = 3838, ROOM_DEPTH = 5379, CEILING_HEIGHT = 2443, WALL_THICKNESS = 100;   // D: back wall to front wall, measured; H: ceiling, measured 2441-2446

const wallMat = material(0xf2efe9);
const floorMat = material(0xd9d3c5);
// The windows' glass, every window's: pale blue, see-through from both sides (chosen)
const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe3ef, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
// Past the door frame the left wall steps back: a short return wall (with the
// light switch on it) and a recess for the kitchen. The kitchen's fronts are
// 405 behind the door wall and the fridge unit is 590 deep (both measured), so
// the recess's back wall is at x = -(405 + 590).
// The front wall's two recesses, over the sink and for the desk, are as deep
// as each other: 372 (the sink recess's back at 5751, less the front wall's
// 5379, both measured)
const FRONT_RECESS_DEPTH = 372;
// The return wall: from the back of the sink recess along the left wall
// come the corner (the worktop's depth), the counter's inner edge and the
// fridge cabinet (all measured), so it's at 2386, 155 past the door frame
const WORKTOP_DEPTH = 610, COUNTER_RUN = 2125, FRIDGE_W = 630;
const RECESS_FROM = ROOM_DEPTH + FRONT_RECESS_DEPTH - WORKTOP_DEPTH - COUNTER_RUN - FRIDGE_W;
const KITCHEN_SETBACK = 405, KITCHEN_DEPTH = 590;
const KITCHEN_RECESS_BACK_WALL_X = -(KITCHEN_SETBACK + KITCHEN_DEPTH);
// The front wall has a full-height recess for the desk, 1623 across (measured)
// and taken to run to the right-hand wall, as deep as the alcove over the sink
// (FRONT_RECESS_DEPTH). Between it and the sink alcove is 1490 of wall (measured).
const DESK_RECESS = { x0: ROOM_WIDTH - 1623, depth: FRONT_RECESS_DEPTH };
const WALL_BETWEEN_RECESSES = 1490;
// The recess over the sink, also from the floor: from the kitchen recess's
// back wall (so the L of units turns into it) to 1490 short of the desk
// recess, FRONT_RECESS_DEPTH deep, up to about 1990 (estimated)
const SINK_RECESS = { x0: KITCHEN_RECESS_BACK_WALL_X, x1: DESK_RECESS.x0 - WALL_BETWEEN_RECESSES, depth: FRONT_RECESS_DEPTH, top: 1990 };
const DESK_TOP = 830;                                                // the desk in the recess, measured
// The doorway: the frame starts 1329 from the back wall, the furthest a
// cupboard on the left wall can come. The door hinges at 1400, so the frame
// is 71 each side of the door; the far side is assumed to match. The frame
// is 2050 high and the door 1978, both measured to the floor.
const DOOR_FRAME_STARTS_AT = 1329, DOOR_HINGE_AT = 1400, ROOM_DOOR = 760, JAMB = DOOR_HINGE_AT - DOOR_FRAME_STARTS_AT;
const FRAME_H = 2050, ROOM_DOOR_H = 1978;
const FRAME_END = DOOR_HINGE_AT + ROOM_DOOR + JAMB;                          // 2231
const frameMat = material(0xffffff);

// The living room's floor (L-shaped, the room plus the recess; its texture
// laid by position, in metres, so the oak boards keep their size
// everywhere), its back wall, the left wall round the doorway and the
// kitchen recess, and the door's frame
function drawLivingRoomWalls() {
  slab([[0, 0], [ROOM_WIDTH, 0], [ROOM_WIDTH, ROOM_DEPTH + DESK_RECESS.depth], [DESK_RECESS.x0, ROOM_DEPTH + DESK_RECESS.depth], [DESK_RECESS.x0, ROOM_DEPTH],
    [SINK_RECESS.x1, ROOM_DEPTH], [SINK_RECESS.x1, ROOM_DEPTH + SINK_RECESS.depth], [KITCHEN_RECESS_BACK_WALL_X, ROOM_DEPTH + SINK_RECESS.depth], [KITCHEN_RECESS_BACK_WALL_X, RECESS_FROM], [0, RECESS_FROM]], -20, 0, floorMat, floor);
  box({ from: [-WALL_THICKNESS, -WALL_THICKNESS, 0], to: [ROOM_WIDTH + WALL_THICKNESS, 0, CEILING_HEIGHT] }, wallMat, floor, false);         // back wall
  box({ from: [-WALL_THICKNESS, 0, 0], to: [0, DOOR_FRAME_STARTS_AT, CEILING_HEIGHT] }, wallMat, floor, false);                // left wall, behind the doorway
  box({ from: [-WALL_THICKNESS, FRAME_END, 0], to: [0, RECESS_FROM, CEILING_HEIGHT] }, wallMat, floor, false);  // left wall, past the doorway to the return
  box({ from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, RECESS_FROM - WALL_THICKNESS, 0], to: [0, RECESS_FROM, CEILING_HEIGHT] }, wallMat, floor, false); // the return wall, facing the front
  box({ from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, RECESS_FROM, 0], to: [KITCHEN_RECESS_BACK_WALL_X, ROOM_DEPTH + SINK_RECESS.depth, CEILING_HEIGHT] }, wallMat, floor, false);   // the recess's back wall, on into the sink recess
  box({ from: [-WALL_THICKNESS, DOOR_FRAME_STARTS_AT, FRAME_H], to: [0, FRAME_END, CEILING_HEIGHT] }, wallMat, floor, false);     // over the doorway
  box({ from: [-WALL_THICKNESS, DOOR_FRAME_STARTS_AT, 0], to: [0, DOOR_HINGE_AT, FRAME_H] }, frameMat, floor);               // frame, hinge side
  box({ from: [-WALL_THICKNESS, FRAME_END - JAMB, 0], to: [0, FRAME_END, FRAME_H] }, frameMat, floor); // frame, far side
  box({ from: [-WALL_THICKNESS, DOOR_HINGE_AT, ROOM_DOOR_H], to: [0, FRAME_END - JAMB, FRAME_H] }, frameMat, floor); // frame head, down to the door
}

// The ceiling, white, with six downlights. It faces down only, so from above
// (the corner and top views) it can't be seen and the room stays open.
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xedece7, roughness: 0.9, side: THREE.FrontSide });
const downlightMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0, side: THREE.FrontSide });
let ceiling;                                                         // drawn by drawCeilingAndLights()
function drawCeilingAndLights() {
  ceiling = new THREE.Mesh(new THREE.PlaneGeometry((ROOM_WIDTH - KITCHEN_RECESS_BACK_WALL_X) * MM, ROOM_DEPTH * MM), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;                                   // facing down
  ceiling.position.set((ROOM_WIDTH + KITCHEN_RECESS_BACK_WALL_X) / 2 * MM, CEILING_HEIGHT * MM, ROOM_DEPTH / 2 * MM);
  floor.add(ceiling);
  for (const x of [960, 1920, 2880]) {
    for (const y of [1500, 3700]) {
      const light = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), downlightMat);
      light.rotation.x = Math.PI / 2;
      light.position.set(x * MM, CEILING_HEIGHT * MM - 0.002, y * MM);
      floor.add(light);
    }
  }
}

// The outer (right-hand) wall, seen only from inside like the front wall, with
// three windows and a radiator under each. Window recesses (measured): 923
// wide, 1390 high, 207 deep, sills at 912, starting 734, 2446 and 4137 from
// the back wall. Radiators (measured): 600 wide, 600 high, 100 thick, 240 off
// the floor, their fronts 132 out from the wall; centred under the windows
// (assumed).
const OUTER = {
  end: ROOM_DEPTH + FRONT_RECESS_DEPTH,                   // the wall runs on past the desk recess
  windows: [734, 2446, 4137].map(y => ({ y: [y, y + 923] })),   // where each recess starts
  sill: 912, top: 912 + 1390, reveal: 207,      // sill height measured
  radiator: { width: 600, bottom: 240, top: 840, out: 132, thick: 100 },
};
function drawOuterWall() {
  const { end, windows, sill, top, reveal, radiator } = OUTER;
  const intoRoom = Math.PI / -2;                 // a face at x = W looking back into the room
  const face = (w, h, mat, y, z, x = ROOM_WIDTH, turn = [0, intoRoom]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), mat);
    m.position.set(x * MM, z * MM, y * MM);
    m.rotation.set(turn[0], turn[1], 0);
    m.receiveShadow = true;
    floor.add(m);
  };
  face(end, sill, wallMat, end / 2, sill / 2);                      // below the windows
  face(end, CEILING_HEIGHT - top, wallMat, end / 2, (top + CEILING_HEIGHT) / 2);              // above them
  const edges = [0, ...windows.flatMap(w => w.y), end];             // the wall between them
  for (let k = 0; k < edges.length; k += 2) face(edges[k + 1] - edges[k], top - sill, wallMat, (edges[k] + edges[k + 1]) / 2, (sill + top) / 2);

  // The outside of this wall, 300 out from the inside face (the thickness is
  // estimated; the recesses are 207 to the glass). It faces outwards only, so
  // it shows when looking in from outside and not from inside. Brick colour
  // is a placeholder.
  const OUT = ROOM_WIDTH + 300, outward = [0, Math.PI / 2];
  const brickMat = material(0xa0614a);
  face(end + WALL_THICKNESS, sill, brickMat, (end - WALL_THICKNESS) / 2, sill / 2, OUT, outward);
  face(end + WALL_THICKNESS, CEILING_HEIGHT - top + 200, brickMat, (end - WALL_THICKNESS) / 2, (top + CEILING_HEIGHT + 200) / 2, OUT, outward);   // up past the ceiling a little
  const outEdges = [-WALL_THICKNESS, ...windows.flatMap(w => w.y), end];
  for (let k = 0; k < outEdges.length; k += 2) face(outEdges[k + 1] - outEdges[k], top - sill, brickMat, (outEdges[k] + outEdges[k + 1]) / 2, (sill + top) / 2, OUT, outward);
  for (const { y: [y0, y1] } of windows) {                         // the outer reveals, from the glass out
    const t = OUT - ROOM_WIDTH - reveal, mid = (y0 + y1) / 2;
    face(t, top - sill, brickMat, y0, (sill + top) / 2, ROOM_WIDTH + reveal + t / 2, [0, 0]);
    face(t, top - sill, brickMat, y1, (sill + top) / 2, ROOM_WIDTH + reveal + t / 2, [0, Math.PI]);
    face(t, y1 - y0, brickMat, mid, top, ROOM_WIDTH + reveal + t / 2, [Math.PI / 2, 0]);
    face(t, y1 - y0, brickMat, mid, sill, ROOM_WIDTH + reveal + t / 2, [-Math.PI / 2, 0]);
  }
  for (const { y: [y0, y1] } of windows) {
    const mid = (y0 + y1) / 2, wide = y1 - y0;
    face(wide, top - sill, glassMat, mid, (sill + top) / 2, ROOM_WIDTH + reveal);                       // glass, at the back of the reveal
    face(reveal, top - sill, wallMat, y0, (sill + top) / 2, ROOM_WIDTH + reveal / 2, [0, 0]);          // reveal sides, facing into the opening
    face(reveal, top - sill, wallMat, y1, (sill + top) / 2, ROOM_WIDTH + reveal / 2, [0, Math.PI]);
    face(reveal, wide, wallMat, mid, top, ROOM_WIDTH + reveal / 2, [Math.PI / 2, 0]);                  // reveal top, facing down
    box({ from: [ROOM_WIDTH - 30, y0 - 30, sill - 25], to: [ROOM_WIDTH + reveal, y1 + 30, sill] }, frameMat, floor);               // window sill
  }
  windows.forEach((w, k) => { radiators[k] = drawRadiator(k); });
}
// The radiators, one under each window (0 nearest the back wall); the
// first can be taken out, so it's hidden (flat_model.js's firstRadiator()).
// Each is a group, not a bare mesh: the cut views (floor_kit.js's
// cutViews()) set every mesh visible again on each change of view, but
// leave groups as they are
export const radiators = [];
const radMat = material(0xf6f6f4);
function drawRadiator(k) {
  const { windows, radiator } = OUTER, mid = (windows[k].y[0] + windows[k].y[1]) / 2;
  const group = new THREE.Group();
  box({ from: [ROOM_WIDTH - radiator.out, mid - radiator.width / 2, radiator.bottom], to: [ROOM_WIDTH - radiator.out + radiator.thick, mid + radiator.width / 2, radiator.top] }, radMat, group);
  floor.add(group);
  return group;
}

// ---------------------------------------------------------------------------
// The hallway, from the living room's door to the bedroom's, with the top of
// the stairs along one side, in the living room's mm (x, y as there), as
// its measurements were taken from there: the measure sheet's letters,
// 15 Oct 2026. Measured before the bedroom, as they place it; drawn after
// it. Beyond its far end are the bathroom and WC (BATHROOM, below).
// ---------------------------------------------------------------------------
const HALLWAY = {
  doorWall: 150,                   // the living room door's wall, so the hallway starts at x -150 (B, measured as about 150)
  kitchenSide: 2221,               // y: the wall opposite the stairs, beside the kitchen, from the back wall's line (C, measured)
  setBack: 150,                    // that wall steps back this far at the bedroom's door (AC, measured)
  stepAlong: 1050,                 // the step, along from the door wall's hallway face (E, measured)
  length: 2330,                    // the door wall's hallway face to the WC wall at the far end (Y, measured; to check, as the drawing scales 3360)
  // The banister, from the kitchen side at the living room door (AB,
  // measured). D, 1054 from the stepped-back wall, puts it 5 further: the same line
  width: 909,
  // The stairs (measured and counted 15 Oct 2026, with photos): up from the
  // foot below, a straight flight of 11 steps along the outside wall
  // towards the living room door, 3 winders turning right, and 1 more
  // step, its tread level with the hallway floor, where the carpet meets
  // the oak. Each rise is 190 and each straight step 810 wide; the
  // stairwell is 900 wall to wall (and to the handrail's wall). The going
  // is still to measure: 220 is the drawing's
  well: 900, stepWidth: 810, rise: 190, going: 220,
  flightSteps: 11, winders: 3, topSteps: 1,
  // At the top, the opening is wider than the well: on each side a white
  // window-sill board bridges the gap from the well's wall to the hallway
  // floor (measured 15 Oct 2026; the boards' thickness taken as the
  // bedroom's sill's). Looking down the stairs, the left one, on the
  // hallway side, is 240 wide and 210 below the hallway floor; it runs
  // 1650 from the winders, past the hallway's far end into a corner under
  // the WC wall. Between it and the hallway floor, a 110 base the
  // banister stands on, its hallway face the banister's (its height
  // estimated from the photos). The right one, against the outside wall,
  // is 120 wide and 2370 long to where the stairs turn: drawn the
  // hallway's length, 2330. Its top is 25 below the hallway floor (the
  // user, 19 Oct 2026, to check: it was drawn level with the floor), and
  // the left one's 210 below it, 20 below the first step down's tread
  base: 110, baseH: 150,
  leftSill: { width: 240, below: 210, length: 1650 },
  rightSill: { width: 120, below: 25 },
  sillThick: 25,
  // Beyond the hallway's far end the flight runs on under the bathroom's
  // floor to its foot, which runs on to the building's back wall
  // (ENTRANCE, below). The floor's thickness, bathroomFloor, is set there,
  // from the foot's ceiling, measured at its window. Over the well
  // the WC wall stops at the hallway floor's level, its bottom as deep as
  // the left board runs past the far end (1650 − 1430: 220)
  // The banister's rail height and its spindles' spacing (estimated)
  rail: 900, spindles: 120,
  post: 90, railW: 60, spindle: 30,  // the newel posts' and the rail's width, the spindles' thickness (estimated)
  // At the winders, a second newel post (the user, 19 Oct 2026, from
  // photos): 90 square like the first, in line with it along the stairs,
  // 200 from it towards the outside wall, over the left board's end, and
  // running down beside the well's hallway-side wall to the tread 5 steps
  // down. Between their tops a short rail like the banister's, and under
  // it a board sloping from the base's top at the first post to the first
  // step down's level at the second, with one spindle on it, halfway
  newelGap: 200, newelFoot: 5,
  slopeBoard: { w: 60, h: 50 },      // its width along the stairs and depth (chosen, as the rail's)
  cap: { w: 130, h: 40 },            // the square cap on each of the two posts at the winders (estimated from the photos)
  // The handrail on the well's hallway-side wall, down the straight flight
  // (the user, 19 Oct 2026): its top end 420 along from the second newel
  // post, 2400 long (along its slope), on 3 brackets the same distance
  // apart. The highest bracket meets the wall 540 along from the second
  // post, 245 below the left board's top. Steps counted from the bottom
  // (the foot): the lowest meets the wall 875 above step 2, the rail 990
  // above it; taken as under the step's middle. The middle one halfway
  // between. (The user also gave the highest as 845 above step 9: with
  // the going as drawn, 220, a guess, that's 160 higher, so it's left out
  // till the going's measured.) The rail's thickness and how far it stands
  // out are estimated from the photos
  handrail: { fromPost: 420, length: 2400, brackets: 3,
    low: { step: 2, wall: 875, rail: 990 }, high: { fromPost: 540, belowLeftSill: 245 },
    d: 40, out: 65,                    // the rail's diameter and its middle's distance from the wall (estimated)
    // Each bracket (from the user's photo): a round plate on the wall, an
    // arm out from it bending up to a collar round the rail (estimated)
    plate: { d: 60, t: 10 }, collar: { d: 50, length: 40 }, arm: 16 },
};
// Where its walls are, in the living room's x and y
HALLWAY.x0 = -HALLWAY.doorWall;                                         // the door wall's hallway face: -150
HALLWAY.xStep = HALLWAY.x0 - HALLWAY.stepAlong;                         // where the wall steps back: -1200
HALLWAY.xEnd = HALLWAY.x0 - HALLWAY.length;                             // the far end: -2480
HALLWAY.yBanister = HALLWAY.kitchenSide - HALLWAY.width;                // 1312
HALLWAY.ySetBack = HALLWAY.kitchenSide + HALLWAY.setBack;               // the bedroom's wall: 2371
// The stairwell, across: the banister base's hallway face (with the rail
// flush with it), then the base and the left board, then the well. That
// puts its outside wall 122 in from the living room's back wall line, as
// the drawing has it (its stairs drawn about 130 in); above the right
// board, the outside wall is all but in line with the living room's
HALLWAY.yBoxFace = HALLWAY.yBanister + HALLWAY.railW;                   // 1372
HALLWAY.ySillEdge = HALLWAY.yBoxFace - HALLWAY.base;                    // the left board's hallway edge: 1262
HALLWAY.yWellIn = HALLWAY.ySillEdge - HALLWAY.leftSill.width;           // the well's hallway-side wall: 1022
HALLWAY.yWellOut = HALLWAY.yWellIn - HALLWAY.well;                      // its outside wall: 122
HALLWAY.yHallOut = HALLWAY.yWellOut - HALLWAY.rightSill.width;          // that wall above the right board: 2
// And along: the winders turn in a square as wide as the well, against
// the door wall; the newel at its inner corner tops the straight flight
HALLWAY.xTurn = HALLWAY.x0 - HALLWAY.well;                              // -1050
HALLWAY.xFoot = HALLWAY.xTurn - HALLWAY.flightSteps * HALLWAY.going;    // the bottom step's riser: -3470
HALLWAY.risers = HALLWAY.flightSteps + HALLWAY.winders + HALLWAY.topSteps;   // 15
HALLWAY.drop = HALLWAY.risers * HALLWAY.rise;                           // floor to floor: 2850
HALLWAY.xSillEnd = HALLWAY.xTurn - HALLWAY.leftSill.length;             // the left board's corner, under the WC wall: -2700
HALLWAY.yNewel = HALLWAY.yBoxFace - 2 * HALLWAY.post - HALLWAY.newelGap; // the second newel post's outside-wall face: 992

// ---------------------------------------------------------------------------
// The other room (the bedroom), beyond the kitchen recess. It has its own
// coordinates, as measured there: u along the hallway wall from the window
// wall (0) to the kitchen-side wall (3682), v from the hallway wall (0) to
// the chimney breast's face (2841) and on into the recess beside it (3189).
// otherRoom is placed at that corner in the living room's coordinates; its
// u runs the same way as the living room's x, its v as y.
// ---------------------------------------------------------------------------
const OTHER_ROOM = {
  length: 3682,                    // u: window wall to kitchen-side wall (H, measured)
  breastFace: 2841,                // v: hallway wall to the chimney breast's face (J, measured)
  recessBack: 3189,                // v: to the back of the recess: the upper recess cupboard's front (2769, measured) + its depth (420, measured)
  breastLength: 1858,              // u: the chimney breast, from the kitchen-side wall to its end (L, measured), so the recess is 3682 - 1858 = 1824 wide
  ceiling: 2445,                   // the lower recess cupboard's top (820, AL) + the upper one's height to the ceiling (1625, AM), both measured
  kitchenWall: 150,                // the wall between the kitchen recess and this room (F: it can't be reached, so taken as G)
  // The door, in the hallway wall: 60 from the kitchen-side wall (Q,
  // measured as 50 or 60), a 760 opening (R), in a 150 wall (G), all
  // measured; hinged at the end away from the kitchen and opening into the
  // room (seen in photos), or, to try, at the kitchen end (bedroom_door.js).
  // The door and its frame are as the living room's.
  door: { fromKitchenWall: 60, width: 760, wall: 150 },
  // The window, in the window wall: 655 from the hallway wall and 1540 wide
  // (N, P), the sill's top at 990 and 25 thick, and the opening's top at
  // 2270 (T, U). Its reveal is 250 deep, glass to the wall's face, and the
  // sill 290 from the glass to its front edge, so the sill stands 40 out
  // from the wall. The sill is 1590 across, centred on the opening. All
  // measured. (A later 1355 "across the recess" doesn't fit the radiator's
  // gaps below, which add up to the 1540, so 1540 stands.)
  window: { from: 655, width: 1540, sill: 990, sillThick: 25, top: 2270, reveal: 250, sillDepth: 290, sillWidth: 1590 },
  // The radiator under it, all measured 15 Oct 2026: 1000 wide, 270 to 870
  // off the floor (so 95 under the sill), 105 thick, its front 135 out from
  // the wall. It's off-centre: 290 from the opening's hallway side (on the
  // right, facing the window) and 255 from the other, 5 more than the 1540
  // leaves, so it's placed from the hallway side.
  radiator: { width: 1000, bottom: 270, top: 870, out: 135, thick: 105, fromHallwaySide: 290 },
};
// Its corner (window wall, hallway wall) in the living room's coordinates.
// The kitchen-side wall stands behind the kitchen recess's back wall, the
// wall F thick; the hallway wall is G thick, behind the hallway's
// stepped-back wall (C + AC). So its recess's back is at 5710, 41 short of
// the living room's sink recess.
OTHER_ROOM.recessWidth = OTHER_ROOM.length - OTHER_ROOM.breastLength;          // 1824
OTHER_ROOM.doorTo = OTHER_ROOM.length - OTHER_ROOM.door.fromKitchenWall;       // u: the door's opening, from 2862 (its hinge side) to 3622
OTHER_ROOM.doorFrom = OTHER_ROOM.doorTo - OTHER_ROOM.door.width;
const OTHER_ROOM_CORNER = {
  x: KITCHEN_RECESS_BACK_WALL_X - OTHER_ROOM.kitchenWall - OTHER_ROOM.length,   // -4827
  y: HALLWAY.ySetBack + OTHER_ROOM.door.wall,                                   // 2521
};
// ---------------------------------------------------------------------------
// The entrance, at the stairs' foot, on the first floor (2850 below the
// hallway): the flight's foot runs on to the building's back wall, and
// beside it, through the flat's own door, is the lobby shared with the
// downstairs neighbour, with the outside door in the back wall and the
// neighbour's door at its far end (drawings/first_floor_plan.png, red and
// blue). All scaled off that drawing (about 8.4 mm a pixel), so estimated,
// not measured. In the living room's mm, as the hallway.
// ---------------------------------------------------------------------------
const ENTRANCE = {
  // The back wall's inside face, taken in line with the bedroom's window
  // wall above (the drawing has them within a pixel or two)
  xBack: OTHER_ROOM_CORNER.x,
  backWall: 350,                   // its thickness (the drawing's about 40 px)
  wellWall: 150,                   // between the stairs' foot and the lobby (about 18 px)
  // The flat's door, in that wall: its opening starts 100 from the back
  // wall, hinged at that end, and opens into the stairs' foot, as far as
  // lying along the back wall (90°)
  flatDoor: { fromBackWall: 100, width: 760 },
  // The lobby: 970 across (from the well's wall), 1090 from the back wall to
  // the neighbour's wall
  lobby: { width: 970, length: 1090 },
  // The outside door, in the back wall: from 85 in from the well's wall,
  // 800 wide, hinged at the far side and opening into the lobby, as far as
  // lying along its side wall (90°)
  outsideDoor: { fromWellWall: 85, width: 800, height: 2000, frameDepth: 100 },   // its frame at the wall's inside face, the rest a plain reveal
  // The neighbour's door, in the far wall, near the well's wall, opening
  // away from the lobby: drawn shut
  neighbourDoor: { fromWellWall: 80, width: 760, wall: 150 },
  doorT: 44,                       // each door's thickness (estimated, as the room door)
  // The small window in the back wall at the stairs' foot, left of the
  // outside door (measured 15 Oct 2026): its recess 560 wide and 990 high,
  // 265 deep from the wall's face to the glass, its bottom at the sill's
  // top, 1395 off the floor, and its top 280 below the ceiling. The sill is
  // 25 thick, 300 deep from the glass (so it stands 35 out from the wall)
  // and 620 across, centred on the recess. Across the well it's taken as
  // centred, as the drawing has it, within a few pixels
  stairWindow: { width: 560, height: 990, depth: 265, sill: 1395, belowCeiling: 280, sillThick: 25, sillDepth: 300, sillWidth: 620 },
};
ENTRANCE.floor = -HALLWAY.drop;                                         // the first floor's level: -2850
// Up to the ceiling, the bathroom floor's underside: from the window's
// measurements, so the bathroom floor is what's left of the 2850
ENTRANCE.height = ENTRANCE.stairWindow.sill + ENTRANCE.stairWindow.height + ENTRANCE.stairWindow.belowCeiling;   // 2665
HALLWAY.bathroomFloor = HALLWAY.drop - ENTRANCE.height;                 // 185 (it was estimated as 300)
ENTRANCE.yStairWindow = (HALLWAY.yWellOut + HALLWAY.yWellIn - ENTRANCE.stairWindow.width) / 2;   // the recess's outside-wall side: 292
ENTRANCE.yLobby0 = HALLWAY.yWellIn + ENTRANCE.wellWall;                 // the lobby's well-side wall: 1172
ENTRANCE.yLobby1 = ENTRANCE.yLobby0 + ENTRANCE.lobby.width;             // its far side: 2142
ENTRANCE.xLobbyEnd = ENTRANCE.xBack + ENTRANCE.lobby.length;            // the neighbour's wall: -3737
ENTRANCE.flatDoorHingeX = ENTRANCE.xBack + ENTRANCE.flatDoor.fromBackWall;                   // -4727
ENTRANCE.outsideDoorHingeY = ENTRANCE.yLobby0 + ENTRANCE.outsideDoor.fromWellWall + ENTRANCE.outsideDoor.width;   // 2057

// The bathroom and WC, beyond the hallway's far end, out to the back wall
// over the entrance. All scaled off the second floor plan (about 8.4 mm a
// pixel), so estimates. The measured Y (2330) is to the bathroom's wall
// over the stairs (the drawing's stairs' end wall, scaled 2400); the
// drawing's 3360 is to the WC's door: past the bathroom's wall the
// hallway runs on into a small lobby, the bathroom's door on its left, the
// WC's at its end. The bathroom is beside the stairs' line, over the
// flight's lower end; the WC over the entrance's lobby.
const BATHROOM = {
  wall: 100,                       // the bathroom's walls inside the flat (the drawing's about 12 px)
  yPartition: 1500,                // the bathroom's side of the wall between it and the lobby and WC (scaled 1510)
  lobbyLength: 3360 - 2330,        // the bathroom's wall over the stairs to the WC's front wall: the drawing's length less the measured one
  door: { width: 700, fromWall: 80 },             // in the wall to the lobby, hinged at the hallway end, opening into the bathroom (scaled 714); 80 clears the frame (JAMB)
  wcDoor: { width: 610, fromBedroomWall: 80 },    // in the WC's front wall, hinged at the bedroom's wall, opening into the lobby; 80 clears the frame
  // The windows in the back wall, along y; the heights aren't on the
  // drawing (chosen, as the bedroom's top)
  window: { y0: 400, y1: 1370, sill: 1000, top: 2270, reveal: 250, sillThick: 25, sillDepth: 150 },
  wcWindow: { y0: 1760, y1: 2210 },
  shower: { length: 1100, width: 700, trayH: 40, screenH: 2000, endWall: 800 },   // the tray against the outside wall and the hallway end; a wall at its far end, 800 out
  basin: { fromBackWall: 450, width: 500, depth: 420, top: 850, bowl: 150, pedestal: 200 },   // on the outside wall
  wc: { width: 380, cisternDepth: 180, cisternH: 800, bowlDepth: 520, bowlH: 400 },          // against the back wall, in the middle
};
BATHROOM.xIn = HALLWAY.xEnd - BATHROOM.wall;                          // the bathroom's hallway-end wall, its inside face: -2580
BATHROOM.yLobby = BATHROOM.yPartition + BATHROOM.wall;                 // the lobby's and WC's side of the wall: 1600
BATHROOM.xWcFront = HALLWAY.xEnd - BATHROOM.lobbyLength;               // the WC's front wall, its lobby face: -3510
BATHROOM.xWcIn = BATHROOM.xWcFront - BATHROOM.wall;                    // its WC face: -3610

// The bedroom door's thickness, as the living room's (estimated); its
// hinges, one for each way it can swing (bedroom_door.js), are set when the
// room is drawn below, and its swing drawn on the floor while it's asked for
const BEDROOM_DOOR_T = 44;
const bedroomHinges = {};
const doorSwingMat = new THREE.MeshBasicMaterial({ color: 0xc0392b, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false });
const SWING_ABOVE_CARPET = 2;      // the swing drawn just above the carpet, so it shows (chosen)
let bedroomDoorSwing = null;
// The carpet, in the bedroom and on the stairs: Cormar's Hampstead wool
// twist in Dormouse. It's drawn in the colour from the user's photo from the
// bedroom doorway into the hallway (15 Oct 2026), the carpet beside the
// oak, the woodwork and the walls. The photo's light is warm: the carpet
// (#99806C there) is corrected by the woodwork's white (#D2C3B0 there,
// Dulux Pure Brilliant White, drawn #F8F8F6), channel by channel in linear
// light. Kept to choose in the Colours menu: the colour first taken from
// the room photos (#8F8780), that mixed a quarter of the way to white, and
// Dormouse averaged from the maker's overhead swatch photo
// (cormarcarpets.co.uk, Hampstead, variants, Dormouse), which looked too brown.
const CARPET_COLOURS = { doorwayPhoto: '#B5A499', lighter: '#ABA5A0', dormouse: '#A2907C', fromPhotos: '#8F8780' };
const carpetMat = material(CARPET_COLOURS.doorwayPhoto);
// The hallway's floor: oak boards, as the living room's oak (from the
// photos, 15 Oct 2026), its own so the living room's floor colour leaves it
// be; the stairs are carpet, as the bedroom is, with a metal strip where
// the top step's carpet meets the oak
const hallFloorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: oakBoards(), roughness: 0.8 });
const trimMat = new THREE.MeshStandardMaterial({ color: 0xc8c8c4, roughness: 0.3, metalness: 0.6 });
const NOSING = { w: 30, h: 5 };                    // the strip's width and how far it stands up (estimated from the photos)
const otherRoom = new THREE.Group();
otherRoom.position.set(OTHER_ROOM_CORNER.x * MM, 0, OTHER_ROOM_CORNER.y * MM);

// A wall's face, seen from inside only: w across and h high, its middle at
// (u, v, z), facing the way `facing` says: '+u', '-u', '+v' or '-v'. From
// outside the room it can't be seen, so the views from above look in.
const FACING = { '+u': Math.PI / 2, '-u': -Math.PI / 2, '+v': 0, '-v': Math.PI };
function insideFace(w, h, mat, [u, v, z], facing, parent = otherRoom) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), mat);
  m.position.set(u * MM, z * MM, v * MM);
  m.rotation.y = FACING[facing];
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
// A wall face with an opening in it: [a0, a1] along the wall, [z0, z1] up it.
// along(a) gives the face's middle for a stretch's middle a.
function faceAround(length, [a0, a1], [z0, z1], height, mat, along, facing, parent = otherRoom) {
  const piece = (from, to, lo, hi) => { if (to > from && hi > lo) insideFace(to - from, hi - lo, mat, [...along((from + to) / 2), (lo + hi) / 2], facing, parent); };
  piece(0, a0, 0, height);                         // either side of it, full height
  piece(a1, length, 0, height);
  piece(a0, a1, 0, z0);                            // below it
  piece(a0, a1, z1, height);                       // above it
}

// The bedroom's shell: its floor, walls, door, window and ceiling
function drawBedroomShell() {
  const { length, breastFace, recessBack, recessWidth, ceiling, door, doorFrom, doorTo, window: win, radiator } = OTHER_ROOM;
  // The floor: the room and the recess, carpeted
  slab([[0, 0], [length, 0], [length, breastFace], [recessWidth, breastFace], [recessWidth, recessBack], [0, recessBack]], -20, 0, carpetMat, otherRoom);

  // The hallway wall, with the door's opening (to the top of its frame's
  // trim; the frame fills the rest). The door's hinge end is away from the kitchen.
  faceAround(length, [doorFrom - JAMB, doorTo + JAMB], [0, FRAME_H], ceiling, wallMat, a => [a, 0], '+v');
  box({ from: [doorFrom - JAMB, -door.wall, 0], to: [doorFrom, 0, FRAME_H] }, frameMat, otherRoom);            // frame, hinge side
  box({ from: [doorTo, -door.wall, 0], to: [doorTo + JAMB, 0, FRAME_H] }, frameMat, otherRoom);                // frame, kitchen side
  box({ from: [doorFrom, -door.wall, ROOM_DOOR_H], to: [doorTo, 0, FRAME_H] }, frameMat, otherRoom);           // frame head, down to the door
  // The door, on a hinge at one end of the opening, drawn shut across it
  // (flush with the room's face of the wall); the Doors menu's slider swings
  // it into the room. Swinging right as you go in, it's hinged at the
  // window end (doorFrom); swinging left, at the kitchen end (doorTo). Only
  // the one it swings on is shown (flat_model.js's turnDoors())
  bedroomHinges.right = hinge(doorFrom, 0, otherRoom);
  box({ from: [0, -BEDROOM_DOOR_T, 0], to: [door.width, 0, ROOM_DOOR_H] }, frameMat, bedroomHinges.right);
  bedroomHinges.left = hinge(doorTo, 0, otherRoom);
  box({ from: [-door.width, -BEDROOM_DOOR_T, 0], to: [0, 0, ROOM_DOOR_H] }, frameMat, bedroomHinges.left);

  // The kitchen-side wall, then the chimney breast's face and its side
  // into the recess, and the recess's back
  insideFace(breastFace, ceiling, wallMat, [length, breastFace / 2, ceiling / 2], '-u');
  insideFace(length - recessWidth, ceiling, wallMat, [(recessWidth + length) / 2, breastFace, ceiling / 2], '-v');
  insideFace(recessBack - breastFace, ceiling, wallMat, [recessWidth, (breastFace + recessBack) / 2, ceiling / 2], '-u');
  insideFace(recessWidth, ceiling, wallMat, [recessWidth / 2, recessBack, ceiling / 2], '-v');

  // The window wall, with the window: its glass at the back of the reveal,
  // the reveal's sides and top, a sill and the radiator under it
  const w0 = win.from, w1 = win.from + win.width, mid = (w0 + w1) / 2;
  faceAround(recessBack, [w0, w1], [win.sill, win.top], ceiling, wallMat, a => [0, a], '+u');
  insideFace(win.width, win.top - win.sill, glassMat, [-win.reveal, mid, (win.sill + win.top) / 2], '+u');
  insideFace(win.reveal, win.top - win.sill, wallMat, [-win.reveal / 2, w0, (win.sill + win.top) / 2], '+v');
  insideFace(win.reveal, win.top - win.sill, wallMat, [-win.reveal / 2, w1, (win.sill + win.top) / 2], '-v');
  const revealTop = insideFace(win.reveal, win.width, wallMat, [-win.reveal / 2, mid, win.top], '+u');
  revealTop.rotation.set(Math.PI / 2, 0, 0);                     // lying flat, facing down
  box({ from: [-win.reveal, mid - win.sillWidth / 2, win.sill - win.sillThick], to: [win.sillDepth - win.reveal, mid + win.sillWidth / 2, win.sill] }, frameMat, otherRoom);   // window sill
  const r0 = w0 + radiator.fromHallwaySide;
  box({ from: [radiator.out - radiator.thick, r0, radiator.bottom], to: [radiator.out, r0 + radiator.width, radiator.top] }, material(0xf6f6f4), otherRoom);

  // The ceiling, facing down only, so the views from above look in
  const top = new THREE.Mesh(new THREE.PlaneGeometry(length * MM, recessBack * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set(length / 2 * MM, ceiling * MM, recessBack / 2 * MM);
  otherRoom.add(top);
}

// The bedroom door's swing, on the carpet: the floor its free edge sweeps
// going from shut to `degrees`, swinging `swings` ('right' or 'left', as
// bedroom_door.js has it), or nothing unless `shown`. It shows what a
// cupboard along the kitchen-side wall has to keep clear of
function drawBedroomDoorSwing(swings, degrees, shown) {
  if (bedroomDoorSwing) otherRoom.remove(bedroomDoorSwing);
  bedroomDoorSwing = null;
  if (!shown) return;
  const { doorFrom, doorTo, door } = OTHER_ROOM;
  const hingeU = swings === 'right' ? doorFrom : doorTo, toward = swings === 'right' ? 1 : -1;   // the door runs +u from its hinge, shut, or -u
  const outline = new THREE.Shape();
  outline.moveTo(hingeU * MM, 0);
  for (let a = 0; a <= degrees; a++) {
    const rad = THREE.MathUtils.degToRad(a);
    outline.lineTo((hingeU + toward * door.width * Math.cos(rad)) * MM, door.width * Math.sin(rad) * MM);
  }
  bedroomDoorSwing = new THREE.Mesh(new THREE.ShapeGeometry(outline), doorSwingMat);
  bedroomDoorSwing.rotation.x = Math.PI / 2;                     // lying flat: the shape's y along v
  bedroomDoorSwing.position.y = SWING_ABOVE_CARPET * MM;
  otherRoom.add(bedroomDoorSwing);
}

// ---------------------------------------------------------------------------
// The hallway, drawn: its walls (as measured above), floor and stairs
// ---------------------------------------------------------------------------
// The bedroom's doorway, its frame's outer edges in the living room's x
// (OTHER_ROOM is in the bedroom's own u, v), and where its frame starts
// through the wall, on the hallway side
HALLWAY.bedroomDoor = [OTHER_ROOM_CORNER.x + OTHER_ROOM.doorFrom - JAMB, OTHER_ROOM_CORNER.x + OTHER_ROOM.doorTo + JAMB];
HALLWAY.bedroomFrameBack = OTHER_ROOM_CORNER.y - OTHER_ROOM.door.wall;

// The winders' treads, in plan: the turn's square cut into equal angles
// from the newel's corner, the lowest (against the flight) first
function winderTreads({ x0, xTurn, yWellIn, yWellOut, well, winders }) {
  const edge = deg => {                                      // where a line at this angle from the outside wall's way leaves the square
    const a = THREE.MathUtils.degToRad(deg), dx = Math.sin(a), dy = -Math.cos(a), t = well / Math.max(dx, -dy);
    return [xTurn + t * dx, yWellIn + t * dy];
  };
  const angle = 90 / winders;
  return Array.from({ length: winders }, (_, i) => {
    const a0 = i * angle, a1 = (i + 1) * angle;
    const outerCorner = a0 < 45 && a1 > 45 ? [[x0, yWellOut]] : [];
    return [[xTurn, yWellIn], edge(a0), ...outerCorner, edge(a1)];
  });
}

const hallway = new THREE.Group();                                     // at the living room's origin

// The hallway's walls, floors, stairs and banisters
function drawHallwayAndStairs() {
  const { x0, xStep, xEnd, xTurn, xFoot, xSillEnd, kitchenSide, yBanister, yBoxFace, ySillEdge, yWellIn, yWellOut, yHallOut, ySetBack, well, stepWidth, rise, going, flightSteps, winders, topSteps, drop,
    baseH, leftSill, rightSill, sillThick, bathroomFloor, rail, spindles, post, railW, spindle, bedroomDoor, bedroomFrameBack } = HALLWAY;
  const leftSillTop = -leftSill.below;
  const face = (w, h, at, facing) => insideFace(w, h, wallMat, at, facing, hallway);
  const level = n => -n * rise;                                 // a tread n steps down from the hallway floor
  const xBack = ENTRANCE.xBack;                                 // the building's back wall, at the stairs' foot
  const yWell = (yWellOut + yWellIn) / 2;

  // The floors: the hallway's oak up to the banister's box, and the top
  // step, its tread level with it, carpet, the metal strip between them;
  // along the well's hallway side, from the newel, the base the banister
  // stands on, down to the left board below it, which runs on under the
  // WC wall; along the outside wall, the right board, level with the floor
  slab([[x0, yBoxFace], [xEnd, yBoxFace], [xEnd, ySetBack], [xStep, ySetBack], [xStep, kitchenSide], [x0, kitchenSide]], -20, 0, hallFloorMat, hallway);
  slab([[x0, yWellIn], [xTurn, yWellIn], [xTurn, yBoxFace], [x0, yBoxFace]], level(1), 0, carpetMat, hallway);
  box({ from: [xTurn, yBoxFace, 0], to: [x0, yBoxFace + NOSING.w, NOSING.h] }, trimMat, hallway, false);
  box({ from: [xEnd, ySillEdge, leftSillTop], to: [xTurn, yBoxFace, baseH] }, frameMat, hallway);
  box({ from: [xSillEnd, yWellIn, leftSillTop - sillThick], to: [xTurn, ySillEdge, leftSillTop] }, frameMat, hallway);
  face(xEnd - xSillEnd, leftSill.below, [(xEnd + xSillEnd) / 2, ySillEdge, leftSillTop / 2], '-v');   // behind it, under the WC wall
  box({ from: [xEnd, yHallOut, -rightSill.below - sillThick], to: [x0, yWellOut, -rightSill.below] }, frameMat, hallway);

  // The living room door's wall: its hallway face, and the sides and head
  // of the doorway through the part of it the living room's 100 leaves,
  // and its face on down the well at the winders
  faceAround(kitchenSide, [DOOR_FRAME_STARTS_AT, FRAME_END], [0, FRAME_H], CEILING_HEIGHT, wallMat, a => [x0, a], '-u', hallway);
  const reveal = HALLWAY.doorWall - WALL_THICKNESS;
  face(reveal, FRAME_H, [x0 + reveal / 2, DOOR_FRAME_STARTS_AT, FRAME_H / 2], '+v');
  face(reveal, FRAME_H, [x0 + reveal / 2, FRAME_END, FRAME_H / 2], '-v');
  face(reveal, FRAME_END - DOOR_FRAME_STARTS_AT, [x0 + reveal / 2, (DOOR_FRAME_STARTS_AT + FRAME_END) / 2, FRAME_H], '-u').rotation.set(Math.PI / 2, 0, 0);   // flat, facing down
  face(well, drop, [x0, yWell, -drop / 2], '-u');

  // The kitchen side, the step back at the bedroom's door, and the
  // bedroom's wall with its doorway (its near edge at the step, as E found),
  // lined through to the bedroom's frame
  face(x0 - xStep, CEILING_HEIGHT, [(x0 + xStep) / 2, kitchenSide, CEILING_HEIGHT / 2], '-v');
  face(ySetBack - kitchenSide, CEILING_HEIGHT, [xStep, (kitchenSide + ySetBack) / 2, CEILING_HEIGHT / 2], '-u');
  const doorway = [xStep - Math.min(xStep, bedroomDoor[1]), xStep - bedroomDoor[0]];   // along the wall from the step
  faceAround(xStep - xEnd, doorway, [0, FRAME_H], CEILING_HEIGHT, wallMat, a => [xStep - a, ySetBack], '-v', hallway);
  const lining = bedroomFrameBack - ySetBack;                   // none, now G is measured: the frame runs through the wall
  if (lining > 0) {
    face(lining, FRAME_H, [bedroomDoor[0], ySetBack + lining / 2, FRAME_H / 2], '+u');
    face(lining, FRAME_H, [xStep, ySetBack + lining / 2, FRAME_H / 2], '-u');
    face(doorway[1] - doorway[0], lining, [xStep - (doorway[0] + doorway[1]) / 2, ySetBack + lining / 2, FRAME_H], '-u').rotation.set(Math.PI / 2, 0, 0);
  }

  // The far end (the WC wall), across the hallway and the opening, down to
  // the floor's level; its bottom, over the well and the left board, as far
  // as the board's corner; there its far face, down to the bathroom
  // floor's underside over the well and to the board beside it: the
  // flight runs on beneath them
  const underWC = ySillEdge - yWellOut;
  face(BATHROOM.yLobby - yHallOut, CEILING_HEIGHT, [xEnd, (yHallOut + BATHROOM.yLobby) / 2, CEILING_HEIGHT / 2], '+u');   // only as far as the lobby, beyond it
  face(xEnd - xSillEnd, underWC, [(xEnd + xSillEnd) / 2, (yWellOut + ySillEdge) / 2, 0], '-u').rotation.set(Math.PI / 2, 0, 0);   // flat, facing down
  face(well, bathroomFloor, [xSillEnd, yWell, -bathroomFloor / 2], '+u');
  face(leftSill.width, leftSill.below, [xSillEnd, (yWellIn + ySillEdge) / 2, leftSillTop / 2], '+u');
  face(xSillEnd - xBack, well, [(xSillEnd + xBack) / 2, yWell, -bathroomFloor], '-u').rotation.set(Math.PI / 2, 0, 0);   // the bathroom floor's underside, flat, facing down

  // The well's walls: the outside one, above the right board as far as the
  // hallway goes, from the board's top; below it, up to the board's top
  // as far as it goes and to the hallway floor's level on to the left
  // board's corner, and then up to the bathroom floor's underside; the
  // hallway side, up to the left board and then likewise (on down to the
  // foot, with the flat's door, below)
  const wallAbove = CEILING_HEIGHT + rightSill.below;
  face(x0 - xEnd, wallAbove, [(x0 + xEnd) / 2, yHallOut, CEILING_HEIGHT - wallAbove / 2], '+v');
  face(x0 - xEnd, drop - rightSill.below, [(x0 + xEnd) / 2, yWellOut, -(drop + rightSill.below) / 2], '+v');
  face(xEnd - xSillEnd, drop, [(xEnd + xSillEnd) / 2, yWellOut, -drop / 2], '+v');
  face(xSillEnd - xBack, drop - bathroomFloor, [(xSillEnd + xBack) / 2, yWellOut, -(drop + bathroomFloor) / 2], '+v');
  face(xTurn - xSillEnd, drop - leftSill.below, [(xTurn + xSillEnd) / 2, yWellIn, -(drop + leftSill.below) / 2], '-v');

  // The stairs, each tread a block down to the foot's floor: the straight
  // flight's carpet 810 wide between white strings, then the winders,
  // carpeted wall to wall (simplified), up to the top step
  const string = (well - stepWidth) / 2;
  for (let j = 0; j < flightSteps; j++) {                       // from the top of the flight down
    const xFrom = xTurn - (j + 1) * going, xTo = xTurn - j * going, top = level(topSteps + winders + j);
    box({ from: [xFrom, yWellOut + string, -drop], to: [xTo, yWellIn - string, top] }, carpetMat, hallway);
    for (const y of [yWellOut, yWellIn - string]) box({ from: [xFrom, y, -drop], to: [xTo, y + string, top] }, frameMat, hallway, false);
  }
  winderTreads(HALLWAY).forEach((plan, i) => slab(plan, -drop, level(topSteps + winders - 1 - i), carpetMat, hallway));

  // The banister on its base, from the newel at the winders' corner to the
  // far end: a rail on spindles, a newel post at each end, all flush with
  // the base's hallway face
  box({ from: [xEnd, yBanister, rail - 50], to: [xTurn, yBoxFace, rail] }, frameMat, hallway);
  for (const x of [xTurn - post, xEnd]) box({ from: [x, yBoxFace - post, 0], to: [x + post, yBoxFace, rail + 100] }, frameMat, hallway);
  const gaps = Math.round((xTurn - xEnd - 2 * post) / spindles);
  for (let k = 1; k < gaps; k++) {
    const x = xEnd + post + k * (xTurn - xEnd - 2 * post) / gaps;
    box({ from: [x - spindle / 2, yBanister + (railW - spindle) / 2, baseH], to: [x + spindle / 2, yBanister + (railW + spindle) / 2, rail - 50] }, frameMat, hallway, false);
  }
  newelsAtTheWinders(HALLWAY, level);
  wallHandrail(HALLWAY, level);
  // No ceiling over the hallway: left out, as asked (15 Oct 2026)
}

// The handrail down the straight flight, on the well's hallway-side wall:
// a round rail on its line through the two heights given, from 420 past
// the second newel post for its length, and its brackets, each a plate on
// the wall, an arm out from it and up, and a collar round the rail
function wallHandrail({ xTurn, yWellIn, post, going, risers, flightSteps, leftSill, handrail }, level) {
  const { fromPost, length, brackets, low, high, d, out, plate, collar, arm } = handrail;
  const stepMiddle = n => xTurn - (flightSteps - n + 0.5) * going;   // step n from the foot, along the flight
  const tread = n => level(risers - n);
  const rise = low.rail - low.wall;                                  // the rail's top above where its bracket meets the wall
  const a = [xTurn - post - high.fromPost, -leftSill.below - high.belowLeftSill + rise - d / 2];   // the rail's middle line, at its two end brackets
  const b = [stepMiddle(low.step), tread(low.step) + low.rail - d / 2];
  const slope = (a[1] - b[1]) / (a[0] - b[0]), angle = Math.atan(slope);
  const zAt = x => b[1] + (x - b[0]) * slope;
  const xTop = xTurn - post - fromPost, xBottom = xTop - length * Math.cos(angle);
  const y = yWellIn - out;
  // A round piece, its middle at [x, y, z] (mm), its axis upright to
  // start, then turned by `turn` ([about x, about z])
  const round = (diameter, long, [x, y, z], [aboutX, aboutZ]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(diameter / 2 * MM, diameter / 2 * MM, long * MM, 16), frameMat);
    m.rotation.set(aboutX, 0, aboutZ);
    m.position.set(x * MM, z * MM, y * MM);
    m.castShadow = true;
    hallway.add(m);
  };
  const alongRail = [0, Math.PI / 2 + angle];                         // the axis laid along the rail's line
  const xMid = (xTop + xBottom) / 2;
  round(d, length, [xMid, y, zAt(xMid)], alongRail);
  for (let i = 0; i < brackets; i++) {
    const x = a[0] + (b[0] - a[0]) * i / (brackets - 1);
    const zWall = zAt(x) + d / 2 - rise;
    round(plate.d, plate.t, [x, yWellIn - plate.t / 2, zWall], [Math.PI / 2, 0]);   // the plate, flat on the wall
    box({ from: [x - arm / 2, y, zWall - arm / 2], to: [x + arm / 2, yWellIn - plate.t, zWall + arm / 2] }, frameMat, hallway, false);   // the arm, out from the wall...
    box({ from: [x - arm / 2, y - arm / 2, zWall - arm / 2], to: [x + arm / 2, y + arm / 2, zAt(x)] }, frameMat, hallway, false);   // ...and up to the rail
    round(collar.d, collar.length, [x, y, zAt(x)], alongRail);       // the collar round it
  }
}

// The two newel posts at the winders, side by side across the top of the
// stairs: the banister's end post and the second one, a short rail between
// their tops, under it the sloping board with its one spindle, and a cap
// on each post. `level(n)` is the tread n steps down
function newelsAtTheWinders({ xTurn, yBoxFace, yNewel, post, rail, railW, spindle, baseH, newelFoot, slopeBoard, cap }, level) {
  const x0 = xTurn - post, xMid = xTurn - post / 2;             // both posts' ends along the stairs, and their middle
  const postTop = rail + 100;                                   // as the banister's posts
  const yInner = yNewel + post, yOuter = yBoxFace - post;       // the faces between the posts: the second's and the end post's
  box({ from: [x0, yNewel, level(newelFoot)], to: [xTurn, yInner, postTop] }, frameMat, hallway);
  box({ from: [xMid - railW / 2, yInner, rail - 50], to: [xMid + railW / 2, yOuter, rail] }, frameMat, hallway);
  for (const y of [yNewel, yOuter]) box({ from: [xMid - cap.w / 2, y + post / 2 - cap.w / 2, postTop], to: [xMid + cap.w / 2, y + post / 2 + cap.w / 2, postTop + cap.h] }, frameMat, hallway);

  // The sloping board, its top from the base's top at the end post down to
  // the first step's level at the second: a box laid along that line
  const [highZ, lowZ] = [baseH, level(1)];
  const run = yOuter - yInner, drop = highZ - lowZ, length = Math.hypot(run, drop);
  const yMid = (yInner + yOuter) / 2, zMid = (highZ + lowZ) / 2;
  const board = box({ from: [xMid - slopeBoard.w / 2, yMid - length / 2, zMid - slopeBoard.h], to: [xMid + slopeBoard.w / 2, yMid + length / 2, zMid] }, frameMat, hallway);
  board.geometry.translate(0, slopeBoard.h / 2 * MM, 0);        // turn it about its top's middle...
  board.children[0].geometry.translate(0, slopeBoard.h / 2 * MM, 0);
  board.position.y = zMid * MM;
  board.rotation.x = -Math.atan2(drop, run);                    // ...so its top falls towards the second post (the scene's z is the plan's y)
  box({ from: [xMid - spindle / 2, yMid - spindle / 2, zMid], to: [xMid + spindle / 2, yMid + spindle / 2, rail - 50] }, frameMat, hallway, false);   // the spindle, from the board's middle
}

// ---------------------------------------------------------------------------
// The entrance, drawn: the stairs' foot and the shared lobby, in a group at
// the first floor's level, so heights in it are from that floor. The two
// doors you go through are on hinges, opened by the Doors menu's sliders
// ---------------------------------------------------------------------------
const entrance = new THREE.Group();
entrance.position.y = ENTRANCE.floor * MM;
const lobbyFloorMat = material(0xb9b4ab);          // a plain grey-beige: its finish isn't known
const outsideDoorMat = material(0x3d4a5c);         // a dark blue-grey: its colour isn't known
let flatDoorHinge, outsideDoorHinge;

// A door frame through a wall that runs along x, from y0 to y1: a jamb
// each side of the opening [x0, x1] and the head, down to the door's top
function frameAlongX(x0, x1, y0, y1, doorH, frameH, parent = entrance) {
  box({ from: [x0 - JAMB, y0, 0], to: [x0, y1, frameH] }, frameMat, parent);
  box({ from: [x1, y0, 0], to: [x1 + JAMB, y1, frameH] }, frameMat, parent);
  box({ from: [x0, y0, doorH], to: [x1, y1, frameH] }, frameMat, parent);
}
// And through a wall that runs along y, from x0 to x1, the opening [y0, y1]
function frameAlongY(y0, y1, x0, x1, doorH, frameH, parent = entrance) {
  box({ from: [x0, y0 - JAMB, 0], to: [x1, y0, frameH] }, frameMat, parent);
  box({ from: [x0, y1, 0], to: [x1, y1 + JAMB, frameH] }, frameMat, parent);
  box({ from: [x0, y0, doorH], to: [x1, y1, frameH] }, frameMat, parent);
}

// The stairs' window, in the back wall at the foot: its glass at the back
// of the recess, the recess's sides and top through the wall, the outer
// part's bottom, and the sill. Returns the opening's sides [y0, y1], for
// the wall's faces round it
function drawStairWindow() {
  const { xBack, backWall, stairWindow: win, yStairWindow: y0 } = ENTRANCE;
  const y1 = y0 + win.width, mid = (y0 + y1) / 2, top = win.sill + win.height, zMid = (win.sill + top) / 2;
  const glassX = xBack - win.depth, xThrough = xBack - backWall / 2, outer = backWall - win.depth;
  const face = (w, h, at, facing) => insideFace(w, h, wallMat, at, facing, entrance);
  insideFace(win.width, win.height, glassMat, [glassX, mid, zMid], '+u', entrance);
  face(backWall, win.height, [xThrough, y0, zMid], '+v');
  face(backWall, win.height, [xThrough, y1, zMid], '-v');
  face(backWall, win.width, [xThrough, mid, top], '+u').rotation.set(Math.PI / 2, 0, 0);                      // the top, flat, facing down
  face(outer, win.width, [glassX - outer / 2, mid, win.sill], '+u').rotation.set(-Math.PI / 2, 0, 0);        // outside the glass, the bottom, facing up
  box({ from: [glassX, mid - win.sillWidth / 2, win.sill - win.sillThick], to: [glassX + win.sillDepth, mid + win.sillWidth / 2, win.sill] }, frameMat, entrance);   // the sill
  return [y0, y1];
}

// The stairs' foot and the lobby: its floor, walls, doors and window
function drawEntrance() {
  const { xBack, backWall, flatDoor, outsideDoor, neighbourDoor, doorT, height, stairWindow, lobby, yLobby0, yLobby1, xLobbyEnd, flatDoorHingeX, outsideDoorHingeY } = ENTRANCE;
  const { xFoot, xSillEnd, yWellOut, yWellIn, well } = HALLWAY;
  const face = (w, h, at, facing) => insideFace(w, h, wallMat, at, facing, entrance);

  // The stairs' foot: its floor, from the bottom step to the back wall, and
  // the back wall's face
  slab([[xFoot, yWellOut], [xBack, yWellOut], [xBack, yWellIn], [xFoot, yWellIn]], -20, 0, hallFloorMat, entrance);
  const stairWindowOpening = drawStairWindow();
  faceAround(well, stairWindowOpening.map(y => y - yWellOut), [stairWindow.sill, stairWindow.sill + stairWindow.height], height, wallMat, a => [xBack, yWellOut + a], '+u', entrance);

  // The wall between the foot and the lobby, with the flat's door: the
  // wall's face on each side, the frame through it, and the door, flush
  // with the foot's side, hinged at the back wall's end
  const f0 = flatDoorHingeX, f1 = f0 + flatDoor.width;
  const flatOpening = [flatDoor.fromBackWall - JAMB, flatDoor.fromBackWall + flatDoor.width + JAMB];
  faceAround(xSillEnd - xBack, flatOpening, [0, FRAME_H], height, wallMat, a => [xBack + a, yWellIn], '-v', entrance);
  faceAround(lobby.length, flatOpening, [0, FRAME_H], height, wallMat, a => [xBack + a, yLobby0], '+v', entrance);
  frameAlongX(f0, f1, yWellIn, yLobby0, ROOM_DOOR_H, FRAME_H);
  flatDoorHinge = hinge(f0, yWellIn, entrance);
  box({ from: [0, 0, 0], to: [flatDoor.width, doorT, ROOM_DOOR_H] }, frameMat, flatDoorHinge);

  // The lobby: its floor and its side wall
  slab([[xBack, yLobby0], [xLobbyEnd, yLobby0], [xLobbyEnd, yLobby1], [xBack, yLobby1]], -20, 0, lobbyFloorMat, entrance);
  face(lobby.length, height, [(xBack + xLobbyEnd) / 2, yLobby1, height / 2], '-v');

  // The back wall, with the outside door: its frame at the wall's inside
  // face and a plain reveal through the rest; the door in the frame,
  // hinged at the side away from the stairs, turned to run along the wall
  // and opening inwards (dir -1)
  const o1 = outsideDoorHingeY, o0 = o1 - outsideDoor.width;
  const outsideFrameH = outsideDoor.height + JAMB;
  faceAround(lobby.width, [o0 - JAMB - yLobby0, o1 + JAMB - yLobby0], [0, outsideFrameH], height, wallMat, a => [xBack, yLobby0 + a], '+u', entrance);
  frameAlongY(o0, o1, xBack - outsideDoor.frameDepth, xBack, outsideDoor.height, outsideFrameH);
  const reveal = backWall - outsideDoor.frameDepth, xReveal = xBack - outsideDoor.frameDepth - reveal / 2;
  face(reveal, outsideFrameH, [xReveal, o0 - JAMB, outsideFrameH / 2], '+v');
  face(reveal, outsideFrameH, [xReveal, o1 + JAMB, outsideFrameH / 2], '-v');
  face(reveal, o1 - o0 + 2 * JAMB, [xReveal, (o0 + o1) / 2, outsideFrameH], '+u').rotation.set(Math.PI / 2, 0, 0);   // flat, facing down
  // The back wall's outside face, for standing outside the external door:
  // across the well, round the stairs' window, and across the lobby (and
  // the wall between), round the door
  const outsideFace = xBack - backWall;
  faceAround(well, stairWindowOpening.map(y => y - yWellOut), [stairWindow.sill, stairWindow.sill + stairWindow.height], height, wallMat, a => [outsideFace, yWellOut + a], '-u', entrance);
  faceAround(yLobby1 - yWellIn, [o0 - JAMB - yWellIn, o1 + JAMB - yWellIn], [0, outsideFrameH], height, wallMat, a => [outsideFace, yWellIn + a], '-u', entrance);
  outsideDoorHinge = skewHinge(xBack - doorT, o1, 90, -1, entrance);
  box({ from: [0, 0, 0], to: [outsideDoor.width, doorT, outsideDoor.height] }, outsideDoorMat, outsideDoorHinge);

  // The far wall, with the neighbour's door, shut, flush with the wall's
  // far side, as it opens away from the lobby
  const n0 = yLobby0 + neighbourDoor.fromWellWall, n1 = n0 + neighbourDoor.width, xFar = xLobbyEnd + neighbourDoor.wall;
  faceAround(lobby.width, [n0 - JAMB - yLobby0, n1 + JAMB - yLobby0], [0, FRAME_H], height, wallMat, a => [xLobbyEnd, yLobby0 + a], '-u', entrance);
  frameAlongY(n0, n1, xLobbyEnd, xFar, ROOM_DOOR_H, FRAME_H);
  box({ from: [xFar - doorT, n0, 0], to: [xFar, n1, ROOM_DOOR_H] }, frameMat, entrance);
}

// ---------------------------------------------------------------------------
// The bathroom and WC, drawn (a first pass: plain shapes, sized from the
// drawing, BATHROOM above). On the hallway's floor level, in the hallway's
// group. Both doors are drawn open, as the drawing has them; no ceilings,
// as the hallway has none
// ---------------------------------------------------------------------------
const bathFloorMat = material(0xcfccc6);           // a pale grey tile: its finish isn't known
const sanitaryMat = material(0xfafafa);            // the shower tray, basin and WC: white
const bathroom = new THREE.Group();

const bathFace = (w, h, at, facing) => insideFace(w, h, wallMat, at, facing, bathroom);

// A window in the back wall, [y0, y1] along it: its glass at the back of
// the reveal, the reveal's sides and top, and a sill
function backWallWindow(y0, y1) {
  const { sill, top, reveal, sillThick, sillDepth } = BATHROOM.window;
  const xBack = ENTRANCE.xBack, mid = (y0 + y1) / 2, zMid = (sill + top) / 2, xReveal = xBack - reveal / 2;
  insideFace(y1 - y0, top - sill, glassMat, [xBack - reveal, mid, zMid], '+u', bathroom);
  bathFace(reveal, top - sill, [xReveal, y0, zMid], '+v');
  bathFace(reveal, top - sill, [xReveal, y1, zMid], '-v');
  bathFace(reveal, y1 - y0, [xReveal, mid, top], '+u').rotation.set(Math.PI / 2, 0, 0);   // the top, flat, facing down
  box({ from: [xBack - reveal, y0 - sillThick, sill - sillThick], to: [xBack + sillDepth, y1 + sillThick, sill] }, frameMat, bathroom);
}

// The floors: the hallway's oak on into the lobby, tiles in the bathroom and WC
function drawBathroomFloors() {
  const { xEnd, yHallOut, ySetBack } = HALLWAY;
  const { xIn, yPartition, yLobby, xWcFront, xWcIn } = BATHROOM, xBack = ENTRANCE.xBack;
  slab([[xEnd, yLobby], [xWcFront, yLobby], [xWcFront, ySetBack], [xEnd, ySetBack]], -20, 0, hallFloorMat, bathroom);
  slab([[xIn, yHallOut], [xBack, yHallOut], [xBack, yPartition], [xIn, yPartition]], -20, 0, bathFloorMat, bathroom);
  slab([[xWcIn, yLobby], [xBack, yLobby], [xBack, ySetBack], [xWcIn, ySetBack]], -20, 0, bathFloorMat, bathroom);
}

// The bathroom: its four walls, the door in the wall to the lobby (open
// into the bathroom, against the hallway-end wall, as drawn) and the window
function drawBathroomRoom() {
  const { yHallOut } = HALLWAY;
  const { xIn, yPartition, yLobby, xWcFront, door, window: win } = BATHROOM, xBack = ENTRANCE.xBack;
  const H = CEILING_HEIGHT, length = xIn - xBack, width = yPartition - yHallOut;
  bathFace(width, H, [xIn, (yHallOut + yPartition) / 2, H / 2], '-u');
  bathFace(length, H, [(xIn + xBack) / 2, yHallOut, H / 2], '+v');
  faceAround(width, [win.y0 - yHallOut, win.y1 - yHallOut], [win.sill, win.top], H, wallMat, a => [xBack, yHallOut + a], '+u', bathroom);
  backWallWindow(win.y0, win.y1);

  const hingeX = xIn - door.fromWall, d0 = hingeX - door.width;    // the opening, along x
  const opening = [xIn - hingeX - JAMB, xIn - d0 + JAMB];          // along the wall from the bathroom's hallway end
  faceAround(length, opening, [0, FRAME_H], H, wallMat, a => [xIn - a, yPartition], '-v', bathroom);
  faceAround(HALLWAY.xEnd - xWcFront, opening.map(a => a + BATHROOM.wall), [0, FRAME_H], H, wallMat, a => [HALLWAY.xEnd - a, yLobby], '+v', bathroom);
  frameAlongX(d0, hingeX, yPartition, yLobby, ROOM_DOOR_H, FRAME_H, bathroom);
  box({ from: [hingeX - ENTRANCE.doorT, yPartition - door.width, 0], to: [hingeX, yPartition, ROOM_DOOR_H] }, frameMat, bathroom);
}

// What's in the bathroom: the shower tray in the corner by the hallway end,
// a glass screen along its open side and a wall at its far end; the basin
// on the outside wall near the back
function drawBathroomFittings() {
  const { yHallOut } = HALLWAY;
  const { xIn, wall, shower, basin } = BATHROOM, xBack = ENTRANCE.xBack;
  const xTrayEnd = xIn - shower.length, yScreen = yHallOut + shower.width;
  box({ from: [xTrayEnd, yHallOut, 0], to: [xIn, yScreen, shower.trayH] }, sanitaryMat, bathroom);
  insideFace(shower.length, shower.screenH, glassMat, [(xIn + xTrayEnd) / 2, yScreen, shower.trayH + shower.screenH / 2], '+v', bathroom);
  box({ from: [xTrayEnd - wall, yHallOut, 0], to: [xTrayEnd, yHallOut + shower.endWall, CEILING_HEIGHT] }, wallMat, bathroom);

  const cx = xBack + basin.fromBackWall, half = basin.width / 2, stem = basin.pedestal / 2;
  box({ from: [cx - half, yHallOut, basin.top - basin.bowl], to: [cx + half, yHallOut + basin.depth, basin.top] }, sanitaryMat, bathroom);
  box({ from: [cx - stem, yHallOut + basin.depth / 2 - stem, 0], to: [cx + stem, yHallOut + basin.depth / 2 + stem, basin.top - basin.bowl] }, sanitaryMat, bathroom);
}

// The lobby's far side and the WC: the lobby's side of the bedroom's wall,
// the WC's front wall with its door (open into the lobby, as drawn), the
// WC's walls and window, and the WC against the back wall
function drawWc() {
  const { xEnd, ySetBack } = HALLWAY;
  const { yLobby, xWcFront, xWcIn, wcDoor, wcWindow, window: win, wc } = BATHROOM, xBack = ENTRANCE.xBack;
  const H = CEILING_HEIGHT, width = ySetBack - yLobby, length = xWcIn - xBack;
  bathFace(xEnd - xWcFront, H, [(xEnd + xWcFront) / 2, ySetBack, H / 2], '-v');

  const hingeY = ySetBack - wcDoor.fromBedroomWall, w0 = hingeY - wcDoor.width;
  const opening = [w0 - JAMB - yLobby, hingeY + JAMB - yLobby];
  faceAround(width, opening, [0, FRAME_H], H, wallMat, a => [xWcFront, yLobby + a], '+u', bathroom);
  faceAround(width, opening, [0, FRAME_H], H, wallMat, a => [xWcIn, yLobby + a], '-u', bathroom);
  frameAlongY(w0, hingeY, xWcIn, xWcFront, ROOM_DOOR_H, FRAME_H, bathroom);
  box({ from: [xWcFront, hingeY - ENTRANCE.doorT, 0], to: [xWcFront + wcDoor.width, hingeY, ROOM_DOOR_H] }, frameMat, bathroom);

  bathFace(length, H, [(xWcIn + xBack) / 2, yLobby, H / 2], '+v');
  bathFace(length, H, [(xWcIn + xBack) / 2, ySetBack, H / 2], '-v');
  faceAround(width, [wcWindow.y0 - yLobby, wcWindow.y1 - yLobby], [win.sill, win.top], H, wallMat, a => [xBack, yLobby + a], '+u', bathroom);
  backWallWindow(wcWindow.y0, wcWindow.y1);

  const mid = (yLobby + ySetBack) / 2, half = wc.width / 2, xCistern = xBack + wc.cisternDepth;
  box({ from: [xBack, mid - half, 0], to: [xCistern, mid + half, wc.cisternH] }, sanitaryMat, bathroom);
  box({ from: [xCistern, mid - half, 0], to: [xCistern + wc.bowlDepth, mid + half, wc.bowlH] }, sanitaryMat, bathroom);
}

// The bathroom and WC, in their order
function drawBathroom() {
  drawBathroomFloors();
  drawBathroomRoom();
  drawBathroomFittings();
  drawWc();
}

// ---------------------------------------------------------------------------
// The floor plan drawn, once, by flat_model.js as it loads (REFACTOR_PLAN.md
// item 9): importing this module only makes its groups and measurements.
// Each group goes into its parent where it always has, before its contents
// ---------------------------------------------------------------------------
let drawn = false;
export function drawFloor() {
  if (drawn) return;
  drawn = true;
  drawLivingRoomWalls();
  drawCeilingAndLights();
  drawOuterWall();
  floor.add(otherRoom);
  drawBedroomShell();
  floor.add(hallway);
  drawHallwayAndStairs();
  hallway.add(entrance);
  drawEntrance();
  hallway.add(bathroom);
  drawBathroom();
}

export { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, WALL_THICKNESS, wallMat, floorMat, FRIDGE_W, RECESS_FROM, KITCHEN_SETBACK, KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, WALL_BETWEEN_RECESSES, SINK_RECESS, DESK_TOP, DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, JAMB, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat, ceilingMat, ceiling, downlightMat, OUTER, OTHER_ROOM, OTHER_ROOM_CORNER, otherRoom, bedroomHinges, drawBedroomDoorSwing, carpetMat, CARPET_COLOURS, HALLWAY, hallway, ENTRANCE, entrance, BATHROOM, bathroom, flatDoorHinge, outsideDoorHinge, insideFace, faceAround };
