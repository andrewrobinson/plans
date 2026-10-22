// The living room: its sizes, and how to draw its floor, walls, windows and door.
//
// This is a copy of the room definition in ../room_3d.html (the section headed
// "The room, the same in every option", the front wall, and the room door),
// rewritten with longer names. Only the room itself is here: the kitchen units,
// desk, chair and island are furniture, and aren't copied.
//
// HOW POSITIONS ARE GIVEN
// Every position and size here is in millimetres, in ROOM coordinates:
//   x  along the back wall, from the left wall (where the door is) to the right
//      wall (with the windows)
//   y  out from the back wall, towards the front wall (with the sink and desk)
//   z  up from the floor
// three.js, which draws the room, works in metres with its y axis pointing up,
// so drawing turns room (x, y, z) in mm into scene (x, z, y) in metres. Only the
// drawing functions at the bottom of this file need to know that.

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// The room's sizes, in mm
// ---------------------------------------------------------------------------

// The main rectangle of the room, wall to wall (all measured)
export const ROOM_WIDTH = 3838;           // left wall to right wall, along x
export const ROOM_DEPTH = 5379;           // back wall to front wall, along y
export const CEILING_HEIGHT = 2443;       // floor to ceiling, measured 2441 to 2446
const WALL_THICKNESS = 100;               // how thick the walls are drawn

// The doorway in the left wall. The frame starts 1329 out from the back wall,
// and the door hinges at 1400, so the frame is 71 wide each side of the door
// (the far side is assumed to match the near side). Heights measured to the floor.
const DOOR_FRAME_STARTS_AT = 1329;
const DOOR_HINGE_AT = 1400;
const DOOR_WIDTH = 760;
const DOOR_THICKNESS = 44;
const DOOR_HEIGHT = 1978;
const DOOR_FRAME_HEIGHT = 2050;
const DOOR_FRAME_SIDE_WIDTH = DOOR_HINGE_AT - DOOR_FRAME_STARTS_AT;                  // 71
const DOOR_FRAME_ENDS_AT = DOOR_HINGE_AT + DOOR_WIDTH + DOOR_FRAME_SIDE_WIDTH;     // 2231

// Past the doorway, the left wall steps back: a short "return" wall, then a
// recess that holds the kitchen. The kitchen's fronts are 405 behind the door
// wall and its units are 590 deep (both measured), so the back wall of the
// recess is 405 + 590 behind the left wall.
const KITCHEN_FRONTS_BEHIND_LEFT_WALL = 405;
const KITCHEN_UNIT_DEPTH = 590;
const KITCHEN_RECESS_BACK_WALL_X = -(KITCHEN_FRONTS_BEHIND_LEFT_WALL + KITCHEN_UNIT_DEPTH);   // -995

// Where the kitchen recess starts along the left wall. Measured back from the
// sink alcove (372 past the front wall): the 610 corner worktop, the counter's
// 2125 inner edge and the 630 fridge cabinet.
const SINK_ALCOVE_DEPTH = 372;            // 5751 - 5379, measured
const KITCHEN_RECESS_STARTS_AT = ROOM_DEPTH + SINK_ALCOVE_DEPTH - 610 - 2125 - 630;   // 2386

// The front wall has two recesses, both 372 deep:
//   - the desk recess, full height, 1623 across (measured), taken to run to the right wall
//   - the sink alcove, from the kitchen recess's back wall to 1490 short of the desk recess
//     (1490 of wall between them, measured), up to about 1990 (estimated)
const DESK_RECESS = { startsAtX: ROOM_WIDTH - 1623, depth: 372 };
const WALL_BETWEEN_RECESSES = 1490;
const SINK_ALCOVE = {
  startsAtX: KITCHEN_RECESS_BACK_WALL_X,
  endsAtX: DESK_RECESS.startsAtX - WALL_BETWEEN_RECESSES,
  depth: SINK_ALCOVE_DEPTH,
  topHeight: 1990,
};
const KITCHEN_WORKTOP_HEIGHT = 894;       // the alcove's tiles start above the worktop (measured)

// The right wall has three windows, with a radiator under each. Window
// recesses (measured): 923 wide, 1390 high, 207 deep, sills 912 off the floor,
// starting 734, 2446 and 4137 out from the back wall. Radiators (measured):
// 600 wide, 600 high, 100 thick, 240 off the floor, their fronts 132 out from
// the wall, centred under the windows (assumed).
const RIGHT_WALL_LENGTH = ROOM_DEPTH + DESK_RECESS.depth;   // it runs on past the desk recess
const WINDOW_WIDTH = 923;
const WINDOW_SILL_HEIGHT = 912;
const WINDOW_TOP_HEIGHT = 912 + 1390;
const WINDOW_RECESS_DEPTH = 207;
const WINDOWS_START_AT = [734, 2446, 4137];
const RADIATOR = { width: 600, bottomHeight: 240, topHeight: 840, frontOutFromWall: 132, thickness: 100 };

// The six downlights in the ceiling
const DOWNLIGHTS_ALONG_X = [960, 1920, 2880];
const DOWNLIGHTS_ALONG_Y = [1500, 3700];

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

const MILLIMETRES_TO_METRES = 0.001;

function matteMaterial(colour) {
  return new THREE.MeshStandardMaterial({ color: colour, roughness: 0.8 });
}

const wallMaterial = matteMaterial(0xf2efe9);
const floorMaterial = matteMaterial(0xd9d3c5);
const doorFrameMaterial = matteMaterial(0xffffff);
const doorMaterial = matteMaterial(0x8fb3d9);
const doorHandleMaterial = matteMaterial(0x333333);
const radiatorMaterial = matteMaterial(0xf6f6f4);
const tileMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.4 });
// The ceiling only shows its lower face, so looking down from above it can't
// be seen and the room stays open to view
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xedece7, roughness: 0.9, side: THREE.FrontSide });
const downlightMaterial = new THREE.MeshBasicMaterial({ color: 0xfff6e0, side: THREE.FrontSide });
const windowGlassMaterial = new THREE.MeshStandardMaterial({
  color: 0xcfe3ef, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
});
const outlineMaterial = new THREE.LineBasicMaterial({ color: 0x3b2a12 });

// ---------------------------------------------------------------------------
// Drawing: the one place that turns room mm into three.js metres
// ---------------------------------------------------------------------------

// A solid box from one corner (x0, y0, z0) to the opposite corner (x1, y1, z1),
// in room mm. With `outlined`, its edges are drawn in a dark line.
function addSolidBox(parent, { from: [x0, y0, z0], to: [x1, y1, z1] }, material, outlined = true) {
  const geometry = new THREE.BoxGeometry(
    (x1 - x0) * MILLIMETRES_TO_METRES,
    (z1 - z0) * MILLIMETRES_TO_METRES,
    (y1 - y0) * MILLIMETRES_TO_METRES,
  );
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (x0 + x1) / 2 * MILLIMETRES_TO_METRES,
    (z0 + z1) / 2 * MILLIMETRES_TO_METRES,
    (y0 + y1) / 2 * MILLIMETRES_TO_METRES,
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (outlined) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), outlineMaterial));
  parent.add(mesh);
  return mesh;
}

// A flat slab whose outline from above is `cornersSeenFromAbove` ([x, y] pairs
// in mm), from height `bottom` up to `top`
function addFlatSlab(parent, cornersSeenFromAbove, bottom, top, material) {
  const outline = new THREE.Shape(cornersSeenFromAbove.map(([x, y]) =>
    new THREE.Vector2(x * MILLIMETRES_TO_METRES, y * MILLIMETRES_TO_METRES)));
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: (top - bottom) * MILLIMETRES_TO_METRES, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2);                     // lay it flat: its outline now runs along the floor, thickness downwards
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = top * MILLIMETRES_TO_METRES;
  mesh.receiveShadow = true;
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), outlineMaterial));
  parent.add(mesh);
  return mesh;
}

// The ways a one-sided face can look. A face is only visible from the side it
// looks towards, so the walls hide themselves when looked at from outside.
const LOOKING = {
  towardsTheBackWall: [0, Math.PI],          // a face on the front wall, looking into the room
  towardsTheLeftWall: [0, -Math.PI / 2],     // a face on the right wall, looking into the room
  towardsTheRightWall: [0, Math.PI / 2],
  towardsTheFrontWall: [0, 0],
  down: [Math.PI / 2, 0],
  up: [-Math.PI / 2, 0],
};

// A flat face, `width` by `height` mm, centred on room point (x, y, z), looking
// the way `looking` (one of LOOKING) says
function addOneSidedFace(parent, { width, height, centre: [x, y, z], looking }, material) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width * MILLIMETRES_TO_METRES, height * MILLIMETRES_TO_METRES),
    material,
  );
  mesh.position.set(x * MILLIMETRES_TO_METRES, z * MILLIMETRES_TO_METRES, y * MILLIMETRES_TO_METRES);
  mesh.rotation.set(looking[0], looking[1], 0);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// ---------------------------------------------------------------------------
// The room, piece by piece
// ---------------------------------------------------------------------------

// The floor is L-shaped: the main rectangle, plus the kitchen recess on the
// left, plus the two recesses in the front wall. It sits just below z = 0.
function addFloor(room) {
  const frontWall = ROOM_DEPTH;
  addFlatSlab(room, [
    [0, 0],                                                              // back-left corner
    [ROOM_WIDTH, 0],                                                     // back-right corner
    [ROOM_WIDTH, frontWall + DESK_RECESS.depth],                         // into the desk recess
    [DESK_RECESS.startsAtX, frontWall + DESK_RECESS.depth],
    [DESK_RECESS.startsAtX, frontWall],                                  // out of the desk recess
    [SINK_ALCOVE.endsAtX, frontWall],
    [SINK_ALCOVE.endsAtX, frontWall + SINK_ALCOVE.depth],                // into the sink alcove
    [KITCHEN_RECESS_BACK_WALL_X, frontWall + SINK_ALCOVE.depth],
    [KITCHEN_RECESS_BACK_WALL_X, KITCHEN_RECESS_STARTS_AT],              // back along the kitchen recess
    [0, KITCHEN_RECESS_STARTS_AT],                                       // the return wall, back to the left wall
  ], -20, 0, floorMaterial);
}

function addBackWall(room) {
  addSolidBox(room, {
    from: [-WALL_THICKNESS, -WALL_THICKNESS, 0],
    to: [ROOM_WIDTH + WALL_THICKNESS, 0, CEILING_HEIGHT],
  }, wallMaterial, false);
}

// The left wall, with the doorway in it, then the step back into the kitchen recess
function addLeftWall(room) {
  const behindTheLeftWall = -WALL_THICKNESS, leftWall = 0;
  addSolidBox(room, {                                                   // from the back wall to the doorway
    from: [behindTheLeftWall, 0, 0], to: [leftWall, DOOR_FRAME_STARTS_AT, CEILING_HEIGHT],
  }, wallMaterial, false);
  addSolidBox(room, {                                                   // above the doorway
    from: [behindTheLeftWall, DOOR_FRAME_STARTS_AT, DOOR_FRAME_HEIGHT], to: [leftWall, DOOR_FRAME_ENDS_AT, CEILING_HEIGHT],
  }, wallMaterial, false);
  addSolidBox(room, {                                                   // from the doorway to the kitchen recess
    from: [behindTheLeftWall, DOOR_FRAME_ENDS_AT, 0], to: [leftWall, KITCHEN_RECESS_STARTS_AT, CEILING_HEIGHT],
  }, wallMaterial, false);
  addSolidBox(room, {                                                   // the short return wall, facing the front of the room
    from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, KITCHEN_RECESS_STARTS_AT - WALL_THICKNESS, 0],
    to: [leftWall, KITCHEN_RECESS_STARTS_AT, CEILING_HEIGHT],
  }, wallMaterial, false);
  addSolidBox(room, {                                                   // the kitchen recess's back wall, on into the sink alcove
    from: [KITCHEN_RECESS_BACK_WALL_X - WALL_THICKNESS, KITCHEN_RECESS_STARTS_AT, 0],
    to: [KITCHEN_RECESS_BACK_WALL_X, ROOM_DEPTH + SINK_ALCOVE.depth, CEILING_HEIGHT],
  }, wallMaterial, false);
}

// The white door frame and the (blue) door, shut
function addDoorway(room) {
  const behindTheLeftWall = -WALL_THICKNESS, leftWall = 0;
  addSolidBox(room, {                                                   // frame, hinge side
    from: [behindTheLeftWall, DOOR_FRAME_STARTS_AT, 0], to: [leftWall, DOOR_HINGE_AT, DOOR_FRAME_HEIGHT],
  }, doorFrameMaterial);
  addSolidBox(room, {                                                   // frame, far side
    from: [behindTheLeftWall, DOOR_FRAME_ENDS_AT - DOOR_FRAME_SIDE_WIDTH, 0], to: [leftWall, DOOR_FRAME_ENDS_AT, DOOR_FRAME_HEIGHT],
  }, doorFrameMaterial);
  addSolidBox(room, {                                                   // frame, across the top
    from: [behindTheLeftWall, DOOR_HINGE_AT, DOOR_HEIGHT], to: [leftWall, DOOR_FRAME_ENDS_AT - DOOR_FRAME_SIDE_WIDTH, DOOR_FRAME_HEIGHT],
  }, doorFrameMaterial);
  addSolidBox(room, {                                                   // the door
    from: [-DOOR_THICKNESS, DOOR_HINGE_AT, 0], to: [leftWall, DOOR_HINGE_AT + DOOR_WIDTH, DOOR_HEIGHT],
  }, doorMaterial);
  addSolidBox(room, {                                                   // its handle, on the room side
    from: [leftWall, DOOR_HINGE_AT + 600, 1000], to: [leftWall + 60, DOOR_HINGE_AT + 720, 1020],
  }, doorHandleMaterial, false);
}

// The right wall: one-sided faces around three window recesses, with glass at
// the back of each recess, a sill, and a radiator underneath
function addRightWallWithWindows(room) {
  const rightWall = ROOM_WIDTH;
  const intoTheRoom = LOOKING.towardsTheLeftWall;

  addOneSidedFace(room, {                                               // below the windows, all along
    width: RIGHT_WALL_LENGTH, height: WINDOW_SILL_HEIGHT,
    centre: [rightWall, RIGHT_WALL_LENGTH / 2, WINDOW_SILL_HEIGHT / 2], looking: intoTheRoom,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // above the windows, all along
    width: RIGHT_WALL_LENGTH, height: CEILING_HEIGHT - WINDOW_TOP_HEIGHT,
    centre: [rightWall, RIGHT_WALL_LENGTH / 2, (WINDOW_TOP_HEIGHT + CEILING_HEIGHT) / 2], looking: intoTheRoom,
  }, wallMaterial);

  // Between the windows: the stretches of wall from the back wall to the first
  // window, between each pair, and from the last to the end of the wall
  const windowEdges = WINDOWS_START_AT.flatMap(start => [start, start + WINDOW_WIDTH]);
  const solidStretchEdges = [0, ...windowEdges, RIGHT_WALL_LENGTH];
  for (let k = 0; k < solidStretchEdges.length; k += 2) {
    const stretchStart = solidStretchEdges[k], stretchEnd = solidStretchEdges[k + 1];
    addOneSidedFace(room, {
      width: stretchEnd - stretchStart, height: WINDOW_TOP_HEIGHT - WINDOW_SILL_HEIGHT,
      centre: [rightWall, (stretchStart + stretchEnd) / 2, (WINDOW_SILL_HEIGHT + WINDOW_TOP_HEIGHT) / 2], looking: intoTheRoom,
    }, wallMaterial);
  }

  for (const windowStart of WINDOWS_START_AT) {
    const windowEnd = windowStart + WINDOW_WIDTH;
    const windowMiddle = (windowStart + windowEnd) / 2;
    const windowMiddleHeight = (WINDOW_SILL_HEIGHT + WINDOW_TOP_HEIGHT) / 2;
    const windowHeight = WINDOW_TOP_HEIGHT - WINDOW_SILL_HEIGHT;
    const halfwayIntoTheRecess = rightWall + WINDOW_RECESS_DEPTH / 2;

    addOneSidedFace(room, {                                             // the glass, at the back of the recess
      width: WINDOW_WIDTH, height: windowHeight,
      centre: [rightWall + WINDOW_RECESS_DEPTH, windowMiddle, windowMiddleHeight], looking: intoTheRoom,
    }, windowGlassMaterial);
    addOneSidedFace(room, {                                             // the recess's near side
      width: WINDOW_RECESS_DEPTH, height: windowHeight,
      centre: [halfwayIntoTheRecess, windowStart, windowMiddleHeight], looking: LOOKING.towardsTheFrontWall,
    }, wallMaterial);
    addOneSidedFace(room, {                                             // the recess's far side
      width: WINDOW_RECESS_DEPTH, height: windowHeight,
      centre: [halfwayIntoTheRecess, windowEnd, windowMiddleHeight], looking: LOOKING.towardsTheBackWall,
    }, wallMaterial);
    addOneSidedFace(room, {                                             // the recess's top
      width: WINDOW_RECESS_DEPTH, height: WINDOW_WIDTH,
      centre: [halfwayIntoTheRecess, windowMiddle, WINDOW_TOP_HEIGHT], looking: LOOKING.down,
    }, wallMaterial);
    addSolidBox(room, {                                                 // the sill, sticking out 30 into the room
      from: [rightWall - 30, windowStart - 30, WINDOW_SILL_HEIGHT - 25],
      to: [rightWall + WINDOW_RECESS_DEPTH, windowEnd + 30, WINDOW_SILL_HEIGHT],
    }, doorFrameMaterial);
    const radiatorFront = rightWall - RADIATOR.frontOutFromWall;
    addSolidBox(room, {                                                 // the radiator under it
      from: [radiatorFront, windowMiddle - RADIATOR.width / 2, RADIATOR.bottomHeight],
      to: [radiatorFront + RADIATOR.thickness, windowMiddle + RADIATOR.width / 2, RADIATOR.topHeight],
    }, radiatorMaterial);
  }
}

// The front wall: one-sided faces, so the room can be seen into from the
// front. From left to right: the sink alcove (tiled above the worktop), plain
// wall, then the desk recess.
function addFrontWall(room) {
  const frontWall = ROOM_DEPTH;
  const intoTheRoom = LOOKING.towardsTheBackWall;
  const { startsAtX: alcoveLeft, endsAtX: alcoveRight, topHeight: alcoveTop } = SINK_ALCOVE;
  const alcoveWidth = alcoveRight - alcoveLeft, alcoveMiddleX = (alcoveLeft + alcoveRight) / 2;
  const alcoveBack = frontWall + SINK_ALCOVE.depth, halfwayIntoTheAlcove = frontWall + SINK_ALCOVE.depth / 2;
  const deskRecessLeft = DESK_RECESS.startsAtX, deskRecessBack = frontWall + DESK_RECESS.depth;

  // The sink alcove
  addOneSidedFace(room, {                                               // the wall above it
    width: alcoveWidth, height: CEILING_HEIGHT - alcoveTop,
    centre: [alcoveMiddleX, frontWall, (alcoveTop + CEILING_HEIGHT) / 2], looking: intoTheRoom,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // its back, tiled above the worktop
    width: alcoveWidth, height: alcoveTop - KITCHEN_WORKTOP_HEIGHT,
    centre: [alcoveMiddleX, alcoveBack, (KITCHEN_WORKTOP_HEIGHT + alcoveTop) / 2], looking: intoTheRoom,
  }, tileMaterial);
  addOneSidedFace(room, {                                               // and plain below it
    width: alcoveWidth, height: KITCHEN_WORKTOP_HEIGHT,
    centre: [alcoveMiddleX, alcoveBack, KITCHEN_WORKTOP_HEIGHT / 2], looking: intoTheRoom,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // its right side, tiled above the worktop
    width: SINK_ALCOVE.depth, height: alcoveTop - KITCHEN_WORKTOP_HEIGHT,
    centre: [alcoveRight, halfwayIntoTheAlcove, (KITCHEN_WORKTOP_HEIGHT + alcoveTop) / 2], looking: LOOKING.towardsTheLeftWall,
  }, tileMaterial);
  addOneSidedFace(room, {                                               // and plain below it
    width: SINK_ALCOVE.depth, height: KITCHEN_WORKTOP_HEIGHT,
    centre: [alcoveRight, halfwayIntoTheAlcove, KITCHEN_WORKTOP_HEIGHT / 2], looking: LOOKING.towardsTheLeftWall,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // its top
    width: alcoveWidth, height: SINK_ALCOVE.depth,
    centre: [alcoveMiddleX, halfwayIntoTheAlcove, alcoveTop], looking: LOOKING.down,
  }, tileMaterial);

  // The plain wall between the alcove and the desk recess
  addOneSidedFace(room, {
    width: deskRecessLeft - alcoveRight, height: CEILING_HEIGHT,
    centre: [(alcoveRight + deskRecessLeft) / 2, frontWall, CEILING_HEIGHT / 2], looking: intoTheRoom,
  }, wallMaterial);

  // The desk recess
  addOneSidedFace(room, {                                               // its back
    width: ROOM_WIDTH - deskRecessLeft, height: CEILING_HEIGHT,
    centre: [(deskRecessLeft + ROOM_WIDTH) / 2, deskRecessBack, CEILING_HEIGHT / 2], looking: intoTheRoom,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // its left side
    width: DESK_RECESS.depth, height: CEILING_HEIGHT,
    centre: [deskRecessLeft, frontWall + DESK_RECESS.depth / 2, CEILING_HEIGHT / 2], looking: LOOKING.towardsTheRightWall,
  }, wallMaterial);
  addOneSidedFace(room, {                                               // its ceiling
    width: ROOM_WIDTH - deskRecessLeft, height: DESK_RECESS.depth,
    centre: [(deskRecessLeft + ROOM_WIDTH) / 2, frontWall + DESK_RECESS.depth / 2, CEILING_HEIGHT], looking: LOOKING.down,
  }, ceilingMaterial);
}

// The ceiling, over the room and the kitchen recess, with six round downlights
function addCeilingWithDownlights(room) {
  const ceilingWidth = ROOM_WIDTH - KITCHEN_RECESS_BACK_WALL_X;
  addOneSidedFace(room, {
    width: ceilingWidth, height: ROOM_DEPTH,
    centre: [(ROOM_WIDTH + KITCHEN_RECESS_BACK_WALL_X) / 2, ROOM_DEPTH / 2, CEILING_HEIGHT], looking: LOOKING.down,
  }, ceilingMaterial);

  for (const x of DOWNLIGHTS_ALONG_X) {
    for (const y of DOWNLIGHTS_ALONG_Y) {
      const downlight = new THREE.Mesh(new THREE.CircleGeometry(45 * MILLIMETRES_TO_METRES, 24), downlightMaterial);
      downlight.rotation.x = LOOKING.down[0];
      downlight.position.set(x * MILLIMETRES_TO_METRES, (CEILING_HEIGHT - 2) * MILLIMETRES_TO_METRES, y * MILLIMETRES_TO_METRES);
      room.add(downlight);
    }
  }
}

// The whole room, as one three.js group to add to the scene
export function buildTheRoom() {
  const room = new THREE.Group();
  room.name = 'living room';
  addFloor(room);
  addBackWall(room);
  addLeftWall(room);
  addDoorway(room);
  addRightWallWithWindows(room);
  addFrontWall(room);
  addCeilingWithDownlights(room);
  return room;
}

// Shared with the box: the same drawing, so the box looks like the room's furniture
export { addSolidBox, MILLIMETRES_TO_METRES };
