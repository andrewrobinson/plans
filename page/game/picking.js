// What's under the pointer, for the game UI (a piece of living_room.js):
// the point on the floor in Plan, the meshes hit in either view, the
// lounge piece a mesh is part of, and the colour setting it's painted by.
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import { COLOUR_TARGETS } from '../../model/colours.js';
import { display } from '../display.js';
import { renderer, scene, camera, flatCamera } from '../../living_room.js';
import { inRoom } from './furniture.js';
import { ROOM_BOXES } from '../../flat_model.js';
import { HALLWAY, ENTRANCE } from '../../floor.js';

const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
const canvas = renderer.domElement;
function rayFrom(e) {
  const r = canvas.getBoundingClientRect(), cam = display.flat ? flatCamera : camera;
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  cam.updateMatrixWorld();
  raycaster.setFromCamera(ndc, cam);
  return raycaster;
}
// In Plan, the point on the floor under the pointer, in the room's mm: the
// 2D camera looks straight down, so it's where the ray starts
function planPoint(e) {
  const { origin } = rayFrom(e).ray;
  return { x: origin.x / MM, y: origin.z / MM };
}
// The meshes under the pointer, nearest first: those on show, bar the game
// UI's own marks (userData.overlay)
const isShown = o => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
function hitsUnder(e) {
  scene.updateMatrixWorld();
  return rayFrom(e).intersectObject(scene, true).filter(h => h.object.isMesh && !h.object.userData.overlay && isShown(h.object));
}
// The piece (furniture.js) in the room a mesh is part of, if any
function pieceOf(mesh, room) {
  const pieces = inRoom(room);
  for (let o = mesh; o; o = o.parent) {
    const piece = pieces.find(p => p.object() === o);
    if (piece) return piece;
  }
  return null;
}
// The colour setting (COLOUR_TARGETS) a mesh is painted by, if any
function colourTargetOf(mesh) {
  const materials = [].concat(mesh.material);
  return Object.keys(COLOUR_TARGETS).find(target => COLOUR_TARGETS[target].mats.some(m => materials.includes(m))) ?? null;
}

// The room a point in the scene is in, by the rooms' walls and floors
// (flat_model.js's ROOM_BOXES), or null: the bedroom and the garage before
// the lounge and hallway they're beside; downstairs, below the hallway's
// floor, from the flat's back wall to the stairs' top, out to the lobby's
// far side (as page/views.js frames it)
const DOWNSTAIRS = { x0: ENTRANCE.xBack, x1: HALLWAY.x0, y0: 0, y1: ENTRANCE.yLobby1, floor: ENTRANCE.floor, ceiling: 0 };
const ROOMS_IN_ORDER = ['bedroom', 'garage', 'livingRoom', 'hallway'];
const ABOVE_FLOOR = 50;            // mm: a point this far below a floor still counts as on it (a rug, a rounding)
function roomAt(point) {
  const x = point.x / MM, y = point.z / MM, z = point.y / MM;
  const inside = ({ x0, x1, y0, y1, floor, ceiling }) =>
    x >= Math.min(x0, x1) && x <= Math.max(x0, x1) && y >= Math.min(y0, y1) && y <= Math.max(y0, y1) && z >= floor - ABOVE_FLOOR && z <= ceiling;
  return ROOMS_IN_ORDER.find(room => inside(ROOM_BOXES[room])) ?? (inside(DOWNSTAIRS) ? 'downstairs' : null);
}
// Where a point in the room (mm: x, y, and z up) is on the screen, in the view on show
function screenOf(x, y, z) {
  const r = canvas.getBoundingClientRect(), v = new THREE.Vector3(x * MM, z * MM, y * MM).project(display.flat ? flatCamera : camera);
  return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top };
}

export { planPoint, hitsUnder, pieceOf, colourTargetOf, screenOf, roomAt };
