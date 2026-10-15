// The floor plan: the walls, the door frame and the windows, drawn into
// `floor`, a group the page adds to its scene. For now only the living room's
// (PLAN.md has the floor plan to come), in its mm: x along the back wall from
// the left wall, y from the back wall towards the front, z up. It exports
// the room's measurements (ROOM_WIDTH, the recesses, the door frame, …) and
// the materials the colours menu changes, for living_room.js.
import * as THREE from 'three';
import { MM, material, box, slab } from './kit/floor_kit.js';

export const floor = new THREE.Group();

const ROOM_WIDTH = 3838, ROOM_DEPTH = 5379, CEILING_HEIGHT = 2443, WALL_THICKNESS = 100;   // D: back wall to front wall, measured; H: ceiling, measured 2441-2446

const wallMat = material(0xf2efe9);
const floorMat = material(0xd9d3c5);
// Past the door frame the left wall steps back: a short return wall (with the
// light switch on it) and a recess for the kitchen. The kitchen's fronts are
// 405 behind the door wall and the fridge unit is 590 deep (both measured), so
// the recess's back wall is at x = -(405 + 590).
// The return wall: from the back of the sink recess (D + 372) along the left
// wall come the corner (the 610 worktop), the counter's 2125 inner edge and
// the 630 fridge cabinet (all measured), so it's at 2386, 155 past the door frame
const FRIDGE_W = 630;
const RECESS_FROM = ROOM_DEPTH + 372 - 610 - 2125 - FRIDGE_W;
const KITCHEN_SETBACK = 405, KITCHEN_DEPTH = 590;
const KITCHEN_RECESS_BACK_WALL_X = -(KITCHEN_SETBACK + KITCHEN_DEPTH);
// The floor: L-shaped, the room plus the recess. Its texture is laid by
// position, in metres, so the oak boards keep their size everywhere.
// The front wall has a full-height recess for the desk, 1623 across (measured)
// and taken to run to the right-hand wall, as deep as the alcove over the sink
// (372, measured). Between it and the sink alcove is 1490 of wall (measured).
const DESK_RECESS = { x0: ROOM_WIDTH - 1623, depth: 372 };
const WALL_BETWEEN_RECESSES = 1490;
// The recess over the sink, also from the floor: from the kitchen recess's
// back wall (so the L of units turns into it) to 1490 short of the desk
// recess, 372 deep (5751 - 5379, both measured), up to about 1990 (estimated)
const SINK_RECESS = { x0: KITCHEN_RECESS_BACK_WALL_X, x1: DESK_RECESS.x0 - WALL_BETWEEN_RECESSES, depth: 372, top: 1990 };
const DESK_TOP = 830;                                                // the desk in the recess, measured
slab([[0, 0], [ROOM_WIDTH, 0], [ROOM_WIDTH, ROOM_DEPTH + DESK_RECESS.depth], [DESK_RECESS.x0, ROOM_DEPTH + DESK_RECESS.depth], [DESK_RECESS.x0, ROOM_DEPTH],
  [SINK_RECESS.x1, ROOM_DEPTH], [SINK_RECESS.x1, ROOM_DEPTH + SINK_RECESS.depth], [KITCHEN_RECESS_BACK_WALL_X, ROOM_DEPTH + SINK_RECESS.depth], [KITCHEN_RECESS_BACK_WALL_X, RECESS_FROM], [0, RECESS_FROM]], -20, 0, floorMat, floor);
box({ from: [-WALL_THICKNESS, -WALL_THICKNESS, 0], to: [ROOM_WIDTH + WALL_THICKNESS, 0, CEILING_HEIGHT] }, wallMat, floor, false);         // back wall
// The doorway: the frame starts 1329 from the back wall, the furthest a
// cupboard on the left wall can come. The door hinges at 1400, so the frame
// is 71 each side of the door; the far side is assumed to match. The frame
// is 2050 high and the door 1978, both measured to the floor.
const DOOR_FRAME_STARTS_AT = 1329, DOOR_HINGE_AT = 1400, ROOM_DOOR = 760, JAMB = DOOR_HINGE_AT - DOOR_FRAME_STARTS_AT;
const FRAME_H = 2050, ROOM_DOOR_H = 1978;
const FRAME_END = DOOR_HINGE_AT + ROOM_DOOR + JAMB;                          // 2231
const frameMat = material(0xffffff);
box({ from: [-WALL_THICKNESS, 0, 0], to: [0, DOOR_FRAME_STARTS_AT, CEILING_HEIGHT] }, wallMat, floor, false);                // left wall, behind the doorway
box({ from: [-WALL_THICKNESS, FRAME_END, 0], to: [0, RECESS_FROM, CEILING_HEIGHT] }, wallMat, floor, false);  // left wall, past the doorway to the return
box({ from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, RECESS_FROM - WALL_THICKNESS, 0], to: [0, RECESS_FROM, CEILING_HEIGHT] }, wallMat, floor, false); // the return wall, facing the front
box({ from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, RECESS_FROM, 0], to: [KITCHEN_RECESS_BACK_WALL_X, ROOM_DEPTH + SINK_RECESS.depth, CEILING_HEIGHT] }, wallMat, floor, false);   // the recess's back wall, on into the sink recess
box({ from: [-WALL_THICKNESS, DOOR_FRAME_STARTS_AT, FRAME_H], to: [0, FRAME_END, CEILING_HEIGHT] }, wallMat, floor, false);     // over the doorway
box({ from: [-WALL_THICKNESS, DOOR_FRAME_STARTS_AT, 0], to: [0, DOOR_HINGE_AT, FRAME_H] }, frameMat, floor);               // frame, hinge side
box({ from: [-WALL_THICKNESS, FRAME_END - JAMB, 0], to: [0, FRAME_END, FRAME_H] }, frameMat, floor); // frame, far side
box({ from: [-WALL_THICKNESS, DOOR_HINGE_AT, ROOM_DOOR_H], to: [0, FRAME_END - JAMB, FRAME_H] }, frameMat, floor); // frame head, down to the door

// The ceiling, white, with six downlights. It faces down only, so from above
// (the corner and top views) it can't be seen and the room stays open.
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xedece7, roughness: 0.9, side: THREE.FrontSide });
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry((ROOM_WIDTH - KITCHEN_RECESS_BACK_WALL_X) * MM, ROOM_DEPTH * MM), ceilingMat);
ceiling.rotation.x = Math.PI / 2;                                   // facing down
ceiling.position.set((ROOM_WIDTH + KITCHEN_RECESS_BACK_WALL_X) / 2 * MM, CEILING_HEIGHT * MM, ROOM_DEPTH / 2 * MM);
floor.add(ceiling);
const downlightMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0, side: THREE.FrontSide });
for (const x of [960, 1920, 2880]) {
  for (const y of [1500, 3700]) {
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), downlightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(x * MM, CEILING_HEIGHT * MM - 0.002, y * MM);
    floor.add(light);
  }
}

// The outer (right-hand) wall, seen only from inside like the front wall, with
// three windows and a radiator under each. Window recesses (measured): 923
// wide, 1390 high, 207 deep, sills at 912, starting 734, 2446 and 4137 from
// the back wall. Radiators (measured): 600 wide, 600 high, 100 thick, 240 off
// the floor, their fronts 132 out from the wall; centred under the windows
// (assumed).
const OUTER = {
  end: ROOM_DEPTH + 372,                                  // the wall runs on past the desk recess
  windows: [734, 2446, 4137].map(y => ({ y: [y, y + 923] })),   // where each recess starts
  sill: 912, top: 912 + 1390, reveal: 207,      // sill height measured
  radiator: { width: 600, bottom: 240, top: 840, out: 132, thick: 100 },
};
{
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
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe3ef, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

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
  const radMat = material(0xf6f6f4);
  for (const { y: [y0, y1] } of windows) {
    const mid = (y0 + y1) / 2, wide = y1 - y0;
    face(wide, top - sill, glassMat, mid, (sill + top) / 2, ROOM_WIDTH + reveal);                       // glass, at the back of the reveal
    face(reveal, top - sill, wallMat, y0, (sill + top) / 2, ROOM_WIDTH + reveal / 2, [0, 0]);          // reveal sides, facing into the opening
    face(reveal, top - sill, wallMat, y1, (sill + top) / 2, ROOM_WIDTH + reveal / 2, [0, Math.PI]);
    face(reveal, wide, wallMat, mid, top, ROOM_WIDTH + reveal / 2, [Math.PI / 2, 0]);                  // reveal top, facing down
    box({ from: [ROOM_WIDTH - 30, y0 - 30, sill - 25], to: [ROOM_WIDTH + reveal, y1 + 30, sill] }, frameMat, floor);               // window sill
    box({ from: [ROOM_WIDTH - radiator.out, mid - radiator.width / 2, radiator.bottom], to: [ROOM_WIDTH - radiator.out + radiator.thick, mid + radiator.width / 2, radiator.top] }, radMat, floor);  // radiator
  }
}

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
  ceiling: 2451,                   // the lower recess cupboard's top (819) + the upper one's height to the ceiling (1632), both measured
  kitchenWall: 125,                // the wall between the kitchen recess and this room (F, estimated)
  // The door, in the hallway wall: 60 from the kitchen-side wall, a 760
  // opening, 120 thick wall (Q, R, G, all estimated); hinged at the end away
  // from the kitchen and opening into the room (seen in photos). The door
  // and its frame are as the living room's.
  door: { fromKitchenWall: 60, width: 760, wall: 120 },
  // The window, in the window wall: 670 from the hallway wall and 1510 wide
  // (N, P, estimated from the drawing), sill and top as the living room's
  // (T, U, not yet measured). Its reveal is 250 deep, glass to the wall's
  // face, and the sill 290 from the glass to its front edge (both measured),
  // so the sill stands 40 out from the wall
  window: { from: 670, width: 1510, sill: 912, top: 2302, reveal: 250, sillDepth: 290 },
  // A radiator under it, seen in a photo; its size as the living room's (estimated)
  radiator: { width: 600, bottom: 240, top: 840, out: 132, thick: 100 },
};
// Its corner (window wall, hallway wall) in the living room's coordinates.
// The kitchen-side wall stands behind the kitchen recess's back wall, the
// wall F thick. The recess is taken to line up with the living room's sink
// recess, both 5751 from the living room's back wall (assumed, until F and G
// are measured), which puts the hallway wall at 5751 - 3189.
OTHER_ROOM.recessWidth = OTHER_ROOM.length - OTHER_ROOM.breastLength;          // 1824
OTHER_ROOM.doorTo = OTHER_ROOM.length - OTHER_ROOM.door.fromKitchenWall;       // u: the door's opening, from 2862 (its hinge side) to 3622
OTHER_ROOM.doorFrom = OTHER_ROOM.doorTo - OTHER_ROOM.door.width;
const OTHER_ROOM_CORNER = {
  x: KITCHEN_RECESS_BACK_WALL_X - OTHER_ROOM.kitchenWall - OTHER_ROOM.length,   // -4802
  y: ROOM_DEPTH + SINK_RECESS.depth - OTHER_ROOM.recessBack,                   // 2562
};
const carpetMat = material(0x8f8780);             // grey-beige, from the photos
const otherRoom = new THREE.Group();
otherRoom.position.set(OTHER_ROOM_CORNER.x * MM, 0, OTHER_ROOM_CORNER.y * MM);
floor.add(otherRoom);

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

{
  const { length, breastFace, recessBack, recessWidth, ceiling, door, doorFrom, doorTo, window: win, radiator } = OTHER_ROOM;
  // The floor: the room and the recess, carpeted
  slab([[0, 0], [length, 0], [length, breastFace], [recessWidth, breastFace], [recessWidth, recessBack], [0, recessBack]], -20, 0, carpetMat, otherRoom);

  // The hallway wall, with the door's opening (to the top of its frame's
  // trim; the frame fills the rest). The door's hinge end is away from the kitchen.
  faceAround(length, [doorFrom - JAMB, doorTo + JAMB], [0, FRAME_H], ceiling, wallMat, a => [a, 0], '+v');
  box({ from: [doorFrom - JAMB, -door.wall, 0], to: [doorFrom, 0, FRAME_H] }, frameMat, otherRoom);            // frame, hinge side
  box({ from: [doorTo, -door.wall, 0], to: [doorTo + JAMB, 0, FRAME_H] }, frameMat, otherRoom);                // frame, kitchen side
  box({ from: [doorFrom, -door.wall, ROOM_DOOR_H], to: [doorTo, 0, FRAME_H] }, frameMat, otherRoom);           // frame head, down to the door
  // The door, open square into the room along its hinge side
  box({ from: [doorFrom, 0, 0], to: [doorFrom + 44, door.width, ROOM_DOOR_H] }, frameMat, otherRoom);

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
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe3ef, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  insideFace(win.width, win.top - win.sill, glassMat, [-win.reveal, mid, (win.sill + win.top) / 2], '+u');
  insideFace(win.reveal, win.top - win.sill, wallMat, [-win.reveal / 2, w0, (win.sill + win.top) / 2], '+v');
  insideFace(win.reveal, win.top - win.sill, wallMat, [-win.reveal / 2, w1, (win.sill + win.top) / 2], '-v');
  const revealTop = insideFace(win.reveal, win.width, wallMat, [-win.reveal / 2, mid, win.top], '+u');
  revealTop.rotation.set(Math.PI / 2, 0, 0);                     // lying flat, facing down
  box({ from: [-win.reveal, w0 - 30, win.sill - 25], to: [win.sillDepth - win.reveal, w1 + 30, win.sill] }, frameMat, otherRoom);   // window sill
  box({ from: [radiator.out - radiator.thick, mid - radiator.width / 2, radiator.bottom], to: [radiator.out, mid + radiator.width / 2, radiator.top] }, material(0xf6f6f4), otherRoom);

  // The ceiling, facing down only, so the views from above look in
  const top = new THREE.Mesh(new THREE.PlaneGeometry(length * MM, recessBack * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set(length / 2 * MM, ceiling * MM, recessBack / 2 * MM);
  otherRoom.add(top);
}

// ---------------------------------------------------------------------------
// The hallway, from the living room's door to the bedroom's, with the top of
// the stairs along one side. Drawn in the living room's mm (x, y as there),
// as its measurements were taken from there: the measure sheet's letters,
// 15 Oct 2026. Beyond its far end are the bathroom and WC, not drawn yet.
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
  // The stairs: at the top, by the living room door, winders turn you into
  // the hallway; drawn as a landing this far along (estimated from the
  // drawing), then a straight flight down to the far end. Each step's rise
  // and going are estimated (about 2750 floor to floor in 13 risers), as
  // are the banister's rail height and its spindles' spacing
  landing: 800,
  rise: 210, going: 220,
  rail: 900, spindles: 120,
};
// Where its walls are, in the living room's x and y
HALLWAY.x0 = -HALLWAY.doorWall;                                         // the door wall's hallway face: -150
HALLWAY.xStep = HALLWAY.x0 - HALLWAY.stepAlong;                         // where the wall steps back: -1200
HALLWAY.xEnd = HALLWAY.x0 - HALLWAY.length;                             // the far end: -2480
HALLWAY.xLanding = HALLWAY.x0 - HALLWAY.landing;                        // the top of the flight: -950
HALLWAY.yBanister = HALLWAY.kitchenSide - HALLWAY.width;                // 1312
HALLWAY.ySetBack = HALLWAY.kitchenSide + HALLWAY.setBack;               // the bedroom's wall: 2371
HALLWAY.steps = Math.round((HALLWAY.xLanding - HALLWAY.xEnd) / HALLWAY.going);   // 7, in the flight as far as the far end
HALLWAY.drop = HALLWAY.steps * HALLWAY.rise;                            // how far down the stairs go before the far end
// The bedroom's doorway, its frame's outer edges in the living room's x
// (OTHER_ROOM is in the bedroom's own u, v), and where its frame starts
// through the wall, on the hallway side
HALLWAY.bedroomDoor = [OTHER_ROOM_CORNER.x + OTHER_ROOM.doorFrom - JAMB, OTHER_ROOM_CORNER.x + OTHER_ROOM.doorTo + JAMB];
HALLWAY.bedroomFrameBack = OTHER_ROOM_CORNER.y - OTHER_ROOM.door.wall;

const hallway = new THREE.Group();                                     // at the living room's origin
floor.add(hallway);
{
  const { x0, xStep, xEnd, xLanding, kitchenSide, yBanister, ySetBack, steps, rise, drop, rail, spindles, bedroomDoor, bedroomFrameBack } = HALLWAY;
  const face = (w, h, at, facing) => insideFace(w, h, wallMat, at, facing, hallway);

  // The floor: the landing at the top of the stairs, and the hallway
  slab([[x0, 0], [xLanding, 0], [xLanding, yBanister], [xEnd, yBanister], [xEnd, ySetBack], [xStep, ySetBack], [xStep, kitchenSide], [x0, kitchenSide]], -20, 0, carpetMat, hallway);

  // The living room door's wall: its hallway face, and the sides and head
  // of the doorway through the part of it the living room's 100 leaves
  faceAround(kitchenSide, [DOOR_FRAME_STARTS_AT, FRAME_END], [0, FRAME_H], CEILING_HEIGHT, wallMat, a => [x0, a], '-u', hallway);
  const reveal = HALLWAY.doorWall - WALL_THICKNESS;
  face(reveal, FRAME_H, [x0 + reveal / 2, DOOR_FRAME_STARTS_AT, FRAME_H / 2], '+v');
  face(reveal, FRAME_H, [x0 + reveal / 2, FRAME_END, FRAME_H / 2], '-v');
  face(reveal, FRAME_END - DOOR_FRAME_STARTS_AT, [x0 + reveal / 2, (DOOR_FRAME_STARTS_AT + FRAME_END) / 2, FRAME_H], '-u').rotation.set(Math.PI / 2, 0, 0);   // flat, facing down

  // The kitchen side, the step back at the bedroom's door, and the
  // bedroom's wall with its doorway (its near edge at the step, as E found),
  // lined through to the bedroom's frame
  face(x0 - xStep, CEILING_HEIGHT, [(x0 + xStep) / 2, kitchenSide, CEILING_HEIGHT / 2], '-v');
  face(ySetBack - kitchenSide, CEILING_HEIGHT, [xStep, (kitchenSide + ySetBack) / 2, CEILING_HEIGHT / 2], '-u');
  const doorway = [xStep - Math.min(xStep, bedroomDoor[1]), xStep - bedroomDoor[0]];   // along the wall from the step
  faceAround(xStep - xEnd, doorway, [0, FRAME_H], CEILING_HEIGHT, wallMat, a => [xStep - a, ySetBack], '-v', hallway);
  const lining = bedroomFrameBack - ySetBack;
  face(lining, FRAME_H, [bedroomDoor[0], ySetBack + lining / 2, FRAME_H / 2], '+u');
  face(lining, FRAME_H, [xStep, ySetBack + lining / 2, FRAME_H / 2], '-u');
  face(doorway[1] - doorway[0], lining, [xStep - (doorway[0] + doorway[1]) / 2, ySetBack + lining / 2, FRAME_H], '-u').rotation.set(Math.PI / 2, 0, 0);

  // The far end, and the outside wall behind the stairs, both on down into
  // the stairwell
  face(ySetBack, CEILING_HEIGHT + drop, [xEnd, ySetBack / 2, (CEILING_HEIGHT - drop) / 2], '+u');
  face(x0 - xEnd, CEILING_HEIGHT + drop, [(x0 + xEnd) / 2, 0, (CEILING_HEIGHT - drop) / 2], '+v');

  // The stairs: a straight flight down from the landing, each step a block
  // to the bottom, with the hallway floor's edge and the landing's above them
  for (let k = 0; k < steps; k++) {
    const going = (xLanding - xEnd) / steps;
    box({ from: [xLanding - (k + 1) * going, 0, -drop], to: [xLanding - k * going, yBanister, -(k + 1) * rise] }, carpetMat, hallway);
  }
  face(xLanding - xEnd, drop, [(xLanding + xEnd) / 2, yBanister, -drop / 2], '-v');
  face(yBanister, drop, [xLanding, yBanister / 2, -drop / 2], '-u');

  // The banister along the flight: a rail on spindles, a newel post at each end
  const post = 90, spindle = 30, railW = 60;
  box({ from: [xEnd, yBanister, rail - 50], to: [xLanding, yBanister + railW, rail] }, frameMat, hallway);
  for (const x of [xLanding - post, xEnd]) box({ from: [x, yBanister, 0], to: [x + post, yBanister + post, rail + 100] }, frameMat, hallway);
  const gaps = Math.round((xLanding - xEnd - 2 * post) / spindles);
  for (let k = 1; k < gaps; k++) {
    const x = xEnd + post + k * (xLanding - xEnd - 2 * post) / gaps;
    box({ from: [x - spindle / 2, yBanister + (railW - spindle) / 2, 0], to: [x + spindle / 2, yBanister + (railW + spindle) / 2, rail - 50] }, frameMat, hallway, false);
  }

  // The ceiling, as the living room's (not measured here), facing down only
  const top = new THREE.Mesh(new THREE.PlaneGeometry((x0 - xEnd) * MM, ySetBack * MM), ceilingMat);
  top.rotation.x = Math.PI / 2;
  top.position.set((x0 + xEnd) / 2 * MM, CEILING_HEIGHT * MM, ySetBack / 2 * MM);
  hallway.add(top);
}

export { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, WALL_THICKNESS, wallMat, floorMat, FRIDGE_W, RECESS_FROM, KITCHEN_SETBACK, KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, WALL_BETWEEN_RECESSES, SINK_RECESS, DESK_TOP, DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, JAMB, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat, ceilingMat, ceiling, downlightMat, OUTER, OTHER_ROOM, OTHER_ROOM_CORNER, otherRoom, HALLWAY, hallway };
