// Walking through the rooms (a piece of living_room.js), in Walk: tap the
// floor and you glide there; tap anything else and you turn to face it;
// pinch to zoom like a lens; drag to look round (the view kit's, as before).
// The mini plan in the corner shows where you are and which way you face,
// and a tap on it takes you there. In Walk and Overhead, a long-press on
// something painted (walls, floor, cupboards) opens its colours. Sit and
// Stand change your eye height (the Look menu's Eye height).
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import { ROOM_BOXES } from '../../flat_model.js';
import { renderer, camera, controls, viewKit, drawSoon } from '../../living_room.js';
import { hitsUnder, colourTargetOf } from './picking.js';
import { modeNow, classic } from './shell.js';
import { select } from './selection.js';
import { openColours, TARGET_NAMES } from './colour_sheet.js';

const canvas = renderer.domElement;
const TAP_PX = 8;                  // a finger's wobble on a tap stays under it (chosen)
const TAP_MS = 300;                // longer is a hold, not a tap (chosen)
const LONG_PRESS_MS = 500;         // as phones' own long-press
const GLIDE_MS = 600;              // the walk to where you tapped (chosen)
const WALL_CLEARANCE = 300;        // mm: you stop this far from a wall, as you would (chosen)
const FLOOR_FACING = 0.7;          // a surface facing up more than this is floor to walk on
const FLOOR_BELOW_EYES = 0.8;      // m: ...and this far below your eyes, so not a table top
const WHEEL_PER_PINCH = 1000;      // the view kit's wheel zooms by exp(deltaY / 1000): a pinch's ratio as its deltaY

const inWalk = () => !classic && modeNow() === 'walk';

// ---------------------------------------------------------------------------
// Gliding: you, or your aim, moved smoothly; the view kit sees it as moved
// by hand, so it can be saved
// ---------------------------------------------------------------------------
function glide(position, target, ms = GLIDE_MS) {
  const from = { position: camera.position.clone(), target: controls.target.clone() }, start = performance.now();
  controls.dispatchEvent({ type: 'start' });
  (function step() {
    const t = Math.min(1, (performance.now() - start) / ms), ease = t * t * (3 - 2 * t);
    camera.position.lerpVectors(from.position, position, ease);
    controls.target.lerpVectors(from.target, target, ease);
    controls.dispatchEvent({ type: 'change' });
    if (t < 1) requestAnimationFrame(step);
    else controls.dispatchEvent({ type: 'end' });
  })();
}
// To a point in the room you're in (its mm, x and y), its walls held clear of
function walkTo(x, y) {
  const box = ROOM_BOXES[viewKit.room], c = WALL_CLEARANCE;
  const to = new THREE.Vector3(THREE.MathUtils.clamp(x, box.x0 + c, box.x1 - c) * MM, camera.position.y,
    THREE.MathUtils.clamp(y, box.y0 + c, box.y1 - c) * MM);
  const shift = to.clone().sub(camera.position);
  glide(to, controls.target.clone().add(shift));
  ripple(to);
}
// Turned to face a point, staying where you are: the aim kept as close in
// front as the view kit keeps it
function faceTowards(point) {
  const aim = controls.target.distanceTo(camera.position);
  glide(camera.position.clone(), camera.position.clone().addScaledVector(point.clone().sub(camera.position).normalize(), aim));
}

// A ring on the floor where you tapped, fading, so you see where you're going
const ringBox = document.getElementById('walkRing');
function ripple(point) {
  const v = point.clone().setY(point.y - 1).project(camera), r = canvas.getBoundingClientRect();
  ringBox.style.left = `${(v.x + 1) / 2 * r.width + r.left}px`;
  ringBox.style.top = `${(1 - v.y) / 2 * r.height + r.top}px`;
  ringBox.classList.remove('go');
  void ringBox.offsetWidth;
  ringBox.classList.add('go');
}

// ---------------------------------------------------------------------------
// Taps, long-presses and pinches on the room
// ---------------------------------------------------------------------------
const pointers = new Map();
let press = null, pinchFrom = null;
canvas.addEventListener('pointerdown', e => {
  if (classic || display3d() === false) return;
  pointers.set(e.pointerId, e);
  if (pointers.size === 2) { clearTimeout(press?.timer); press = null; pinchFrom = spread(); return; }
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
  press.timer = setTimeout(() => longPress(e), LONG_PRESS_MS);
});
canvas.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, e);
  if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_PX) { clearTimeout(press.timer); press = null; }
  if (pointers.size === 2 && pinchFrom && inWalk()) {
    const now = spread();
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: -Math.log(now / pinchFrom) * WHEEL_PER_PINCH, cancelable: true }));
    pinchFrom = now;
  }
});
const endPointer = e => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchFrom = null;
  if (!press || press.id !== e.pointerId) return;
  clearTimeout(press.timer);
  const quick = performance.now() - press.t < TAP_MS;
  press = null;
  if (quick && inWalk()) tap(e);
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
const spread = () => { const [a, b] = [...pointers.values()]; return Math.max(1, Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)); };
const display3d = () => modeNow() === 'walk' || modeNow() === 'overhead';

function tap(e) {
  const hit = hitsUnder(e)[0];
  if (!hit) return;
  const normal = hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : null;
  const isFloor = normal && normal.y > FLOOR_FACING && hit.point.y < camera.position.y - FLOOR_BELOW_EYES;
  if (isFloor) walkTo(hit.point.x / MM, hit.point.z / MM);
  else faceTowards(hit.point);
}
function longPress(e) {
  press = null;
  if (!display3d()) return;
  const hit = hitsUnder(e)[0], target = hit ? colourTargetOf(hit.object) : null;
  if (!target) return;
  navigator.vibrate?.(15);
  const surface = { target, object: hit.object, name: TARGET_NAMES[target] };
  select({ surface });
  openColours(surface);
}

// ---------------------------------------------------------------------------
// Sit and Stand: the Look menu's Eye height, the same person
// ---------------------------------------------------------------------------
const postureButton = document.getElementById('walkPosture'), eyeSelect = document.getElementById('eye');
postureButton.addEventListener('click', () => {
  const [posture, person] = viewKit.eye.split('-'), other = posture === 'sit' ? 'stand' : 'sit';
  const key = [...eyeSelect.options].map(o => o.value).find(v => v === `${other}-${person}`) ?? [...eyeSelect.options].map(o => o.value).find(v => v.startsWith(other));
  if (!key) return;
  eyeSelect.value = key;
  eyeSelect.dispatchEvent(new Event('change', { bubbles: true }));
});

// ---------------------------------------------------------------------------
// The mini plan: the room's outline, you as a dot and a wedge the way you
// face. Drawn each frame in Walk, as you move
// ---------------------------------------------------------------------------
const mini = document.getElementById('miniPlan'), ctx = mini.getContext('2d');
const MINI_MARGIN = 8;             // px round the room's outline (chosen)
function miniScale() {
  const box = ROOM_BOXES[viewKit.room], w = mini.width - 2 * MINI_MARGIN, h = mini.height - 2 * MINI_MARGIN;
  const s = Math.min(w / (box.x1 - box.x0), h / (box.y1 - box.y0));
  const ox = MINI_MARGIN + (w - s * (box.x1 - box.x0)) / 2, oy = MINI_MARGIN + (h - s * (box.y1 - box.y0)) / 2;
  return { box, s, ox, oy };
}
function drawMini() {
  const { box, s, ox, oy } = miniScale(), dpr = mini.width / mini.clientWidth || 1;
  ctx.clearRect(0, 0, mini.width, mini.height);
  ctx.lineWidth = 2 * dpr;
  ctx.strokeStyle = '#5f5e5a';
  ctx.strokeRect(ox, oy, s * (box.x1 - box.x0), s * (box.y1 - box.y0));
  const x = ox + s * (camera.position.x / MM - box.x0), y = oy + s * (camera.position.z / MM - box.y0);
  const turn = Math.atan2(controls.target.z - camera.position.z, controls.target.x - camera.position.x), half = 0.5, len = 22 * dpr;
  ctx.fillStyle = 'rgba(55, 138, 221, 0.3)';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, len, turn - half, turn + half);
  ctx.fill();
  ctx.fillStyle = '#378add';
  ctx.beginPath();
  ctx.arc(x, y, 5 * dpr, 0, 2 * Math.PI);
  ctx.fill();
}
mini.addEventListener('click', e => {
  const r = mini.getBoundingClientRect(), dpr = mini.width / r.width, { box, s, ox, oy } = miniScale();
  walkTo(((e.clientX - r.left) * dpr - ox) / s + box.x0, ((e.clientY - r.top) * dpr - oy) / s + box.y0);
});
(function everyFrame() {
  requestAnimationFrame(everyFrame);
  if (inWalk()) drawMini();
})();
drawSoon();
