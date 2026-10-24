// Resizing with handles, in Plan (a piece of living_room.js): a round
// handle at each end of a thing's width, and at the front of its depth (or
// both ends, when it grows both ways), shown with its options (options.js).
// Dragging one moves the thing's own size slider, as dragging the slider
// itself would: its range, its steps, one history entry for the drag, and
// the thing rebuilt as it goes. The value shows by the finger.
import * as THREE from 'three';
import { floorBox } from './furniture.js';
import { planPoint, screenOf } from './picking.js';
import { modeNow } from './shell.js';

const handles = document.getElementById('resizeHandles'), readout = document.getElementById('resizeReadout');
let active = null;                 // { object(), sizes }

// A thing's sizes, each { id: its slider's id, along: 'w' or 'd', factor }:
// factor 2 where it grows both ways about its middle (a handle at each
// end), 1 where it grows from its back or one side (the depth's handle at
// its front only)
function startResize(object, sizes) {
  stopResize();
  if (modeNow() !== 'plan') return;
  active = { object, sizes: sizes.filter(s => document.getElementById(s.id)) };
  handles.replaceChildren(...active.sizes.flatMap(size => ends(size).map(end => {
    const h = document.createElement('div');
    h.className = 'handle';
    h.setAttribute('aria-label', 'Resize');
    Object.assign(h, { size, end });
    return h;
  })));
  handles.hidden = false;
  navigator.vibrate?.(15);
}
function stopResize() {
  active = null;
  handles.hidden = true;
  readout.hidden = true;
  handles.replaceChildren();
}
// The ends with a handle: both for a width, or for a depth that grows both
// ways; the front alone for one that grows from the back
const ends = ({ along, factor = along === 'w' ? 2 : 1 }) => (along === 'd' && factor === 1 ? [1] : [-1, 1]);
const factorOf = ({ along, factor = along === 'w' ? 2 : 1 }) => factor;
// A size whose slider's block is hidden now, as a change can hide it with
// the sheet open (a round dining table's length and width, a rectangular
// one's diameter): syncControls() hides blocks by their style, or hidden
const sizeHidden = ({ id }) => Boolean(document.getElementById(id)?.closest('[style*="display: none"], [hidden]'));

// The thing's own axes on the floor: its width runs along its local x, its
// front is its local +z, each as the living room's x and y
function axes(object) {
  object.updateMatrixWorld(true);
  const x = new THREE.Vector3(1, 0, 0).transformDirection(object.matrixWorld);
  const z = new THREE.Vector3(0, 0, 1).transformDirection(object.matrixWorld);
  return { w: { x: x.x, y: x.z }, d: { x: z.x, y: z.z } };
}
// Each frame: the handles at the thing's ends, on its footprint's edges
(function placeHandles() {
  requestAnimationFrame(placeHandles);
  if (!active) return;
  const object = active.object();
  if (!object || modeNow() !== 'plan') return stopResize();
  const b = floorBox(object), mid = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }, half = { x: (b.x1 - b.x0) / 2, y: (b.y1 - b.y0) / 2 };
  const ax = axes(object);
  for (const h of handles.children) {
    h.hidden = sizeHidden(h.size);
    const a = ax[h.size.along];
    // the footprint's edge the way the axis runs (the box is square to the walls)
    const out = Math.abs(a.x) > Math.abs(a.y) ? { x: Math.sign(a.x) * half.x, y: 0 } : { x: 0, y: Math.sign(a.y) * half.y };
    const s = screenOf(mid.x + h.end * out.x, mid.y + h.end * out.y, b.top);
    h.style.left = `${s.x}px`;
    h.style.top = `${s.y}px`;
  }
})();

// Dragging a handle: its slider set to its value then plus how far the
// handle's gone out along the thing's axis
handles.addEventListener('pointerdown', e => {
  const handle = e.target.closest('.handle');
  if (!handle || !active) return;
  e.stopPropagation();
  handle.setPointerCapture(e.pointerId);
  const { size, end } = handle, slider = document.getElementById(size.id), a = axes(active.object())[size.along];
  const from = planPoint(e), start = Number(slider.value), factor = factorOf(size);
  const label = document.querySelector(`label[for="${size.id}"]`)?.textContent.split(':')[0] ?? '';
  const move = m => {
    const p = planPoint(m), out = ((p.x - from.x) * a.x + (p.y - from.y) * a.y) * end;
    slider.value = String(start + factor * out);              // held to the slider's range and steps by the slider
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    readout.hidden = false;
    readout.textContent = `${label}: ${slider.value}`;
    readout.style.left = handle.style.left;
    readout.style.top = handle.style.top;
  };
  const up = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    readout.hidden = true;
    slider.dispatchEvent(new Event('change', { bubbles: true }));   // the drag's done, as a slider's let go
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});

const resizing = () => Boolean(active);

export { startResize, stopResize, resizing };
