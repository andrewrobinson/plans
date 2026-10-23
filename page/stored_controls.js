// The things to store's controls (a piece of living_room.js): the cutting
// lists, the Stored menu, lifting them off the floor and dragging them
// about the plan.
import * as THREE from 'three';
import { MM } from '../kit/floor_kit.js';
import {
  drawStored, CURRENT_ROOM, CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE, PACKINGS, STORED, cupboard, 
  cuttingList, optionOf, pieces, placeStored, setAll, get, sizesInOrder, config, storedGroup, storedSpots
} from '../flat_model.js';
import { display } from './display.js';
import { CEILING_HEIGHT, floor } from '../floor.js';
import { change, flatCamera, renderer, updatePalette, writeAddress } from '../living_room.js';
import { clamp } from '../kit/units_kit.js';

// A corner cupboard's cutting list as HTML, by its piece's name: the living
// room's, in Lounge options, or the bedroom's, in Bedroom options
function cuttingListHtml(piece) {
  const design = key => get(`pieces.${piece}.design.${key}`);
  const option = optionOf(design('option'));
  if (option.no === CURRENT_ROOM) return '<b>No cutting list</b>: no cupboard in this option.';
  const kinds = cuttingList(piece);
  let boards = 0, area = 0;
  const rows = CUT_KINDS.filter(k => kinds.has(k)).map(kind => {
    return `<div class="cutKind">${kind}</div>` + sizesInOrder(kinds.get(kind)).map(({ l, w, shaped, n, parts }) => {
      boards += n;
      area += n * l * w;
      const what = [[...parts].map((p, i) => i ? p[0].toLowerCase() + p.slice(1) : p).join(', '), shaped ? 'shaped' : ''].filter(Boolean).join('; ');
      return `<div class="cutRow"><span>${n} ×</span><span>${l} × ${w}</span><span>${what}</span></div>`;
    }).join('');
  }).join('');
  return `<div class="cutHead">${option.name}: boards ${design('BOARD')} thick, length × width in mm</div>` +
    `<div class="cutRule">${CUT_RULE}${CUT_EXCEPTIONS[option.no] ? ` ${CUT_EXCEPTIONS[option.no]}` : ''}</div>${rows}` +
    `<div class="cutTotal">${boards} boards, ${(area / 1e6).toFixed(2)} m² in all</div>`;
}
// Each corner cupboard's cutting list, folded away in its room's options:
// [its <details>, where the list goes, the cupboard's piece]. Drawn when
// unfolded, and again as anything changes while it's open
const CUTTING_LISTS = [['loungeCutting', 'loungeCutList', 'cornerCupboard'], ['bedroomCutting', 'bedroomCutList', 'bedroomCupboard']];
function showCuttingLists() {
  for (const [details, list, piece] of CUTTING_LISTS) {
    if (document.getElementById(details).open) document.getElementById(list).innerHTML = cuttingListHtml(piece);
  }
}
for (const [details] of CUTTING_LISTS) document.getElementById(details).addEventListener('toggle', showCuttingLists);

// Each thing's height off the floor, as on a shelf: 0 on the floor
const storedLifts = document.getElementById('storedLifts');
storedLifts.append(Object.assign(document.createElement('div'), { textContent: 'Off the floor (mm)', className: 'colhead' }), document.createElement('div'));
const liftInputs = STORED.map((s, k) => {
  const input = Object.assign(document.createElement('input'), { type: 'number', min: 0, max: CEILING_HEIGHT, step: 10, value: 0 });
  input.setAttribute('aria-label', `${s.name}: off the floor`);
  input.addEventListener('change', () => {
    const z = clamp(Number(input.value) || 0, 0, CEILING_HEIGHT);
    input.value = z;
    if (storedValue('where') !== BY_HAND) document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = false; });
    moveStored(k, { z });
    showStored();
    writeAddress();
  });
  storedLifts.append(Object.assign(document.createElement('label'), { textContent: s.name }), input);
  return input;
});
function showLifts() { liftInputs.forEach((input, k) => { input.value = storedSpots()[k].z; }); }
// The things to store's settings, by their keys in the configuration's
// thingsToStore: changing them (without building the flat again: their own
// redraw follows), and one's value. Where they are, as the configuration
// words it: by the window, in the cupboard, or moved by hand
const storedAt = key => `thingsToStore.${key}`;
const setStored = edits => setAll(edits.map(([key, value]) => [storedAt(key), value]));
const storedValue = key => get(storedAt(key));
const BY_HAND = 'byHand', BY_THE_WINDOW = 'window';
// Thing k moved by hand: its spot changed by `change` ({ x, y }, { z } or
// { turned }), the others kept where they are (packed, they're the
// model's, not settings, till now)
function moveStored(k, change) {
  const spots = structuredClone(storedSpots());
  spots[k] = { ...spots[k], ...change };
  setStored([['where', BY_HAND], ['spots', spots]]);           // by hand first, as only then are the spots read
}
// Moved by hand, they go back to the window when packed again
const unlessByHand = () => (storedValue('where') === BY_HAND ? [['where', BY_THE_WINDOW]] : []);
// The things to store drawn (the model's drawStored()), and their part of
// the menu put in step
function showStored() {
  showStoredMenu(drawStored(display));
}
// Their part of the menu, `storedText` what drawStored() said of them
function showStoredMenu(storedText) {
  const { shown, packing, where } = config.thingsToStore;
  document.getElementById('storedInfo').textContent = storedText;
  showLifts();
  document.getElementById('storedToggle').checked = shown;
  document.getElementById('storedPacking').value = String(packing);
  document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = r.value === where; });
}
document.getElementById('storedToggle').addEventListener('change', e => {
  setStored([['shown', e.target.checked]]);
  showStored();
  updatePalette();
  writeAddress();
});
function restow() {
  placeStored();
  showStored();
  writeAddress();
}
document.getElementById('storedPack').addEventListener('click', () => {
  setStored(unlessByHand());                                    // back to the window from wherever they were moved
  restow();
});
document.getElementById('storedPacking').innerHTML = PACKINGS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('');
document.getElementById('storedPacking').addEventListener('change', e => {
  setStored([['packing', Number(e.target.value)], ...unlessByHand()]);
  restow();
});
document.querySelectorAll('input[name=storedWhere]').forEach(r => r.addEventListener('change', () => {
  setStored([['where', r.value]]);
  restow();
}));

// Dragging in the plan view. These listeners run before the view's own
// panning, and stop it when a stored thing is under the pointer.
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let storedDrag = null, lastTap = { k: -1, t: 0 };
function storedUnder(e, cam = flatCamera) {
  const r = renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  cam.updateMatrixWorld();                                      // as they are now, even before the next frame
  storedGroup.updateMatrixWorld();
  raycaster.setFromCamera(pointer, cam);
  const hit = raycaster.intersectObjects(storedGroup.children, false).find(h => h.object.userData.stored !== undefined);
  return { k: hit ? hit.object.userData.stored : -1, x: raycaster.ray.origin.x / MM, y: raycaster.ray.origin.z / MM };
}
const canDrag = () => config.thingsToStore.shown && display.flat && display.flatView === 'plan';
renderer.domElement.addEventListener('pointerdown', e => {
  if (!canDrag()) return;
  const { k, x, y } = storedUnder(e);
  if (k < 0) return;
  e.stopImmediatePropagation();
  const now = performance.now();
  if (lastTap.k === k && now - lastTap.t < 350) {                // a double-click or double-tap turns it round
    moveStored(k, { turned: !storedSpots()[k].turned });
    lastTap = { k: -1, t: 0 };
    showStored();
    writeAddress();
    return;
  }
  lastTap = { k, t: now };
  storedDrag = { k, dx: x - storedSpots()[k].x, dy: y - storedSpots()[k].y };
  renderer.domElement.setPointerCapture(e.pointerId);
}, { capture: true });
renderer.domElement.addEventListener('pointermove', e => {
  if (!canDrag()) return;
  const { k, x, y } = storedUnder(e);
  if (!storedDrag) {
    renderer.domElement.style.cursor = k >= 0 ? 'grab' : '';
    return;
  }
  e.stopImmediatePropagation();
  renderer.domElement.style.cursor = 'grabbing';
  const round = v => Math.round(v / 10) * 10;                   // to the nearest 10
  moveStored(storedDrag.k, { x: round(x - storedDrag.dx), y: round(y - storedDrag.dy) });
  showStored();
}, { capture: true });
for (const type of ['pointerup', 'pointercancel']) {
  renderer.domElement.addEventListener(type, e => {
    if (!storedDrag) return;
    e.stopImmediatePropagation();
    storedDrag = null;
    renderer.domElement.style.cursor = '';
    writeAddress();
  }, { capture: true });
}

// What the other pieces of the model use
export {
  showCuttingLists, showStored, showStoredMenu, storedDrag, storedUnder
};
