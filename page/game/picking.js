// What's under the pointer, for the game UI (a piece of living_room.js):
// the point on the floor in Plan, the meshes hit in either view, the
// lounge piece a mesh is part of, and the colour setting it's painted by.
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import { COLOUR_TARGETS } from '../../model/colours.js';
import { display } from '../display.js';
import { renderer, scene, camera, flatCamera } from '../../living_room.js';
import { inRoom } from './furniture.js';

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
// The lounge piece (furniture.js) a mesh is part of, if any
function pieceOf(mesh) {
  const pieces = inRoom();
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

// Where a point in the room (mm: x, y, and z up) is on the screen, in the view on show
function screenOf(x, y, z) {
  const r = canvas.getBoundingClientRect(), v = new THREE.Vector3(x * MM, z * MM, y * MM).project(display.flat ? flatCamera : camera);
  return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top };
}

export { planPoint, hitsUnder, pieceOf, colourTargetOf, screenOf };
