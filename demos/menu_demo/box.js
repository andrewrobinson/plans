// The box: a plain rectangular block placed in the room.
//
// It's described in the same room coordinates as room.js (mm; x from the left
// wall, y from the back wall, z up from the floor), by its size and by where
// its corner nearest the back-left of the room (and lowest) stands.

import * as THREE from 'three';
import { addSolidBox, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT } from './room.js';

// The box's settings to start with: a 1200 x 600 x 900 block, a little out from
// the back-left corner, standing on the floor
export const STARTING_BOX = {
  width: 1200,                  // along x, the back wall's direction
  depth: 600,                   // along y, out from the back wall
  height: 900,                  // along z, up
  distanceFromLeftWall: 800,    // from the left wall to the box's left side
  distanceFromBackWall: 1500,   // from the back wall to the box's back
  heightOffFloor: 0,            // from the floor to the box's underside
};

// What each setting may be, in mm. The size limits are the room's own; how far
// the box can move depends on its size (see furthestItCanMove below).
export const SIZE_LIMITS = {
  width: { smallest: 50, largest: ROOM_WIDTH },
  depth: { smallest: 50, largest: ROOM_DEPTH },
  height: { smallest: 50, largest: CEILING_HEIGHT },
};

// How far the box can move from the left wall, the back wall and the floor
// and still be inside the main rectangle of the room
export function furthestItCanMove(box) {
  return {
    distanceFromLeftWall: ROOM_WIDTH - box.width,
    distanceFromBackWall: ROOM_DEPTH - box.depth,
    heightOffFloor: CEILING_HEIGHT - box.height,
  };
}

// The box's settings with each move pulled back, if needed, so it stays
// inside the room (after it's been made bigger, say)
export function keptInsideTheRoom(box) {
  const furthest = furthestItCanMove(box);
  return {
    ...box,
    distanceFromLeftWall: Math.min(box.distanceFromLeftWall, furthest.distanceFromLeftWall),
    distanceFromBackWall: Math.min(box.distanceFromBackWall, furthest.distanceFromBackWall),
    heightOffFloor: Math.min(box.heightOffFloor, furthest.heightOffFloor),
  };
}

// The box's two opposite corners in room mm: `from` is its back-left-bottom
// corner, `to` its front-right-top
export function cornersOf(box) {
  const from = [box.distanceFromLeftWall, box.distanceFromBackWall, box.heightOffFloor];
  const to = [from[0] + box.width, from[1] + box.depth, from[2] + box.height];
  return { from, to };
}

// How much space is left between the box and each wall, the floor and the ceiling
export function gapsAroundThe(box) {
  const { from, to } = cornersOf(box);
  return {
    toLeftWall: from[0],
    toRightWall: ROOM_WIDTH - to[0],
    toBackWall: from[1],
    toFrontWall: ROOM_DEPTH - to[1],
    toFloor: from[2],
    toCeiling: CEILING_HEIGHT - to[2],
  };
}

// A warm orange, so the box stands out from the room's whites
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xe8893a, roughness: 0.6 });

// The box as drawn. It lives in a group of its own, and redrawing it empties
// the group and draws it again at its new size and place.
export function createDrawnBox(scene) {
  const group = new THREE.Group();
  group.name = 'box';
  scene.add(group);

  function redraw(box) {
    for (const oldMesh of [...group.children]) {
      group.remove(oldMesh);
      oldMesh.geometry.dispose();                                     // free the old shape's memory
      for (const outline of oldMesh.children) outline.geometry.dispose();
    }
    addSolidBox(group, cornersOf(box), boxMaterial);
  }

  return { redraw };
}
