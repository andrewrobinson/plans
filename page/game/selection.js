// What's selected in the game UI (a piece of living_room.js), and how it
// shows: a blue outline round it in the scene (red while a piece being
// moved overlaps another) and the action bar floating over it, as phones'
// editors do. A selection is a lounge piece ({ piece }) or something
// painted by a colour setting ({ surface: { target, object, name } }).
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import { scene, drawSoon } from '../../living_room.js';
import { floorBox } from './furniture.js';
import { screenOf } from './picking.js';

let selected = null;
let overlapping = false;
// The action bar's buttons, each shown when it can be used: set by
// plan_edit.js and colour_sheet.js (setActions())
const actions = {};
const bar = document.getElementById('actionBar');
const BUTTONS = [
  ['turn', 'rotate-clockwise', 'Turn'], ['colour', 'palette', 'Colour'], ['resize', 'arrows-horizontal', 'Resize'], ['remove', 'trash', 'Take out'],
];
bar.innerHTML = BUTTONS.map(([action, icon, label]) =>
  `<button data-action="${action}" aria-label="${label}" title="${label}"><i class="ti ti-${icon}" aria-hidden="true"></i></button>`).join('');
bar.addEventListener('click', e => {
  const button = e.target.closest('[data-action]');
  if (button && selected) actions[button.dataset.action]?.do(selected);
});
bar.addEventListener('pointerdown', e => e.stopPropagation());   // not a tap on the room behind it

// ---------------------------------------------------------------------------
// The outline: a frame of four bars round the selection's footprint, at
// its top, drawn over everything so it's seen through what's above it
// ---------------------------------------------------------------------------
const FRAME_BAR = 40;              // mm wide: about 3 px in a phone's plan of the lounge (chosen)
const FRAME_BLUE = 0x378add, FRAME_RED = 0xe24b4a;   // the selection's blue, and the overlap's red
const frameMat = new THREE.MeshBasicMaterial({ color: FRAME_BLUE, depthTest: false, transparent: true });
const fillMat = new THREE.MeshBasicMaterial({ color: FRAME_BLUE, depthTest: false, transparent: true, opacity: 0.12 });
const outline = new THREE.Group();
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const [fill, ...bars] = [fillMat, frameMat, frameMat, frameMat, frameMat].map(m => {
  const mesh = new THREE.Mesh(unitBox, m);
  mesh.userData.overlay = true;
  mesh.renderOrder = 999;
  outline.add(mesh);
  return mesh;
});
outline.visible = false;
scene.add(outline);
// Fitted round a footprint in mm ({ x0, x1, y0, y1, top })
function frame({ x0, x1, y0, y1, top }) {
  const w = (x1 - x0) * MM, d = (y1 - y0) * MM, cx = (x0 + x1) / 2 * MM, cz = (y0 + y1) / 2 * MM, y = top * MM + 0.005, t = FRAME_BAR * MM;
  fill.position.set(cx, y, cz);
  fill.scale.set(w, 0.001, d);
  const sides = [[cx, cz - d / 2, w + t, t], [cx, cz + d / 2, w + t, t], [cx - w / 2, cz, t, d + t], [cx + w / 2, cz, t, d + t]];
  sides.forEach(([x, z, sx, sz], i) => { bars[i].position.set(x, y, z); bars[i].scale.set(sx, 0.002, sz); });
}

// The object selected, as drawn now (a change rebuilds it)
const objectOf = sel => (sel?.piece ? sel.piece.object() : sel?.surface?.object) ?? null;

function select(sel) {
  selected = sel;
  overlapping = false;
  bar.classList.remove('popIn');
  void bar.offsetWidth;                                          // so the pop plays again
  bar.classList.add('popIn');
  navigator.vibrate?.(10);
  follow();
}
function deselect() {
  selected = null;
  follow();
}
function setOverlapping(on) {
  overlapping = on;
  frameMat.color.set(on ? FRAME_RED : FRAME_BLUE);
  fillMat.color.set(on ? FRAME_RED : FRAME_BLUE);
}

// ---------------------------------------------------------------------------
// Each frame: the outline and the action bar kept on the selection, which
// a change, a drag or the camera moves
// ---------------------------------------------------------------------------
const BAR_GAP = 14;                // px between the action bar and what it's over (chosen)
let lastKey = '';
function follow() {
  const object = objectOf(selected);
  if (!object) {
    if (outline.visible) { outline.visible = false; drawSoon(); }
    bar.hidden = true;
    lastKey = '';
    return;
  }
  const box = floorBox(object), key = JSON.stringify(box) + overlapping;
  if (key !== lastKey) {
    if (selected.piece) setOverlapping(overlapsOthers?.(selected.piece, box) ?? false);
    frame(box);
    outline.visible = true;
    drawSoon();
    lastKey = key;
  }
  for (const b of bar.querySelectorAll('[data-action]')) b.hidden = !actions[b.dataset.action]?.can(selected);
  bar.hidden = !bar.querySelector('[data-action]:not([hidden])');
  placeBar(box);
}
// Over the selection's middle, at its top; under it if that's off the top
const TOP_ROW = 60;                // px the room chips take at the top (game.css)
const BOTTOM_ROW = 90;             // px the view switch takes at the bottom (game.css)
function placeBar({ x0, x1, y0, y1, top }) {
  const corners = [screenOf(x0, y0, top), screenOf(x1, y0, top), screenOf(x0, y1, top), screenOf(x1, y1, top)];
  const mid = (corners[0].x + corners[3].x) / 2, above = Math.min(...corners.map(c => c.y)), below = Math.max(...corners.map(c => c.y));
  const w = bar.offsetWidth, h = bar.offsetHeight, roomAbove = above - h - BAR_GAP > TOP_ROW;
  bar.style.left = `${Math.max(8, Math.min(mid - w / 2, innerWidth - w - 8))}px`;
  bar.style.top = `${roomAbove ? above - h - BAR_GAP : Math.min(below + BAR_GAP, innerHeight - h - BOTTOM_ROW)}px`;
}
(function everyFrame() {
  if (selected) follow();
  requestAnimationFrame(everyFrame);
})();

const setActions = more => Object.assign(actions, more);
// Whether a piece standing at a footprint overlaps another: set by plan_edit.js
let overlapsOthers = null;
const setOverlapCheck = check => { overlapsOthers = check; };
const selection = () => selected;

export { select, deselect, selection, setActions, setOverlapping, setOverlapCheck, objectOf };
