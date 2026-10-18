// The page: the living room and the rest of the flat in 3D, its menus and
// controls, the views, the scenes and the address. What's drawn, from the
// settings, is the model's, flat_model.js (the fittings, the cupboard
// options, the dimensions, the cutting list, the things to store, and the
// configuration's schema); the walls, door frame and windows are floor.js's;
// the engine is in kit/. index.html loads it.
//
// How it works: `state` (the model's) holds every setting. The controls
// change it through change(edits), by the settings' paths in the
// configuration (the model's set()), which puts every control in step
// (syncControls()) and calls show(). show() has the model build the option
// chosen and everything round it (build()), shows it in the menus, then
// redrawAround() redraws the dimensions, colours, things to store, cutting
// list and the address. The address, the settings as a configuration
// (SCHEMA) and the view, is read at the start and written on every change,
// so a link brings the same settings back.
//
// In order, below: the stage; the 2D views' cuts and Cupboard only; the
// cutting list's menu; the things to store's controls and dragging; the door
// sliders and the option list; show() and the menus; the address; the
// controls; the colours; the views and scenes; the display switches and the
// view; window.plans; and starting the page.
import * as THREE from 'three';
import { MM, createStage, RAL, popMenus, createDrawers, resetButton,
  shareButton, screenshotButton, workOffline, flatViews, cutViews } from './kit/floor_kit.js';
import * as ViewKit from './kit/view_kit.js';
import * as SceneKit from './kit/scene_kit.js';
import * as Config from './kit/config_kit.js';
import { otherRoomControls, otherRoomPieces, BOOKCASE_SIZES, SIZE_LABEL, QUARTER_TURN, BED_SPOTS } from './other_room.js';
import { wickerBenches, wickerBenchControls } from './wicker_bench.js';
import { shoeRack, shoeRackControls } from './shoe_rack.js';
import { garagePieces, garageControls, GARAGE, GARAGE_CORNER } from './garage.js';
import { cupboardControls, copyControls, idIn } from './cupboard_controls.js';
import { world, setDisplay, flat, flatView, cupboardOnly, showDims, showDoorDims, build,
  drawStored, turnDoors, describe, settle, cupboardRows, startAgain, BACK_WALL_KEYS, CHAIR_TURN, CURRENT,
  CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE, DRESSERS, DRESSER_SLIDERS, FINISHES,
  LARDERS, LARDER_SLIDERS, OPTIONS, PACKINGS, SCHEMA, SHELF_WOODS, SOFAS, SOFA_SLIDERS, STORED,
  TV_H, TV_SIZES, TV_W, benchDrawn, carcassMat, colourOf, configurationNow, cornerTooShallow,
  cupboard, cupboardPart, cupboardSettings, currentSofa, cuttingList, deskChair, diagonal, dimensionFigures, dims,
  dresserMat, frontFrom, frontGap, handleMat, islandGroup, islandMat, islandOnWall, islandTopMat,
  kitchenMat, larderHeight, larderOwnSize, oakMat, onBackWall, optionAt, pieceBoxes, pieces,
  placeStored, readConfiguration, screenMat, shelfMat, setAll, get, wordAt, pathOfSetting, optionsOnShow,
  shownCode, sizesInOrder, sofaHome, sofaOwnSize, spotOf, state, storedGroup, storedMats,
  storedSize, tvAt, tvMat, updateDims, worktopMat } from './flat_model.js';
import { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, wallMat, frameMat, ceilingMat, OTHER_ROOM,
  OTHER_ROOM_CORNER, carpetMat, HALLWAY, ENTRANCE } from './floor.js';

// The page: the stage, with the model (flat_model.js) in it
const { scene, renderer, camera, controls, flatCamera, flatControls } = createStage(document.getElementById('view'));
scene.add(world);

// In the wall views, anything wholly on the camera's side of the view's cut
// is left out, so the wall and what stands against it aren't hidden behind
// the island, the desk or the outside of the outer wall: the kit's, with
// the view's cut, and with the cupboard on its own, only its parts.
const applyCut = cutViews(scene, {
  get cut() { return flat && flatView && !cupboardOnly ? builtInViews[flatView].cut : null; },   // on its own, the cupboard needs no cut
  get only() { return cupboardOnly ? cupboardPart : null; },
});

// In a 2D view, the cupboard on its own fills the screen, with room for its
// dimensions round it
function frameCupboard() {
  if (!flat || !cupboardOnly || !cupboard) return;
  scene.updateMatrixWorld(true);
  const b = new THREE.Box3();
  cupboard.group.traverse(o => { if (o.isMesh && cupboardPart(o, false)) b.expandByObject(o); });
  if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()), margin = 1.6;
  const t = flatControls.target, shift = new THREE.Vector3();
  if (flatView === 'plan') {
    shift.set(c.x - t.x, 0, c.z - t.z);
    flatFit = [size.x + margin, size.z + margin];
  } else if (flatView === 'back' || flatView === 'front') {
    shift.set(c.x - t.x, c.y - t.y, 0);
    flatFit = [size.x + margin, size.y + margin];
  } else {
    shift.set(0, c.y - t.y, c.z - t.z);
    flatFit = [size.z + margin, size.y + margin];
  }
  t.add(shift);
  flatCamera.position.add(shift);
  flatCamera.zoom = 1;
  resize();
  flatControls.update();
}

// A corner cupboard's cutting list as HTML, by its piece's name: the living
// room's, in Lounge options, or the bedroom's, in Bedroom options
function cuttingListHtml(piece) {
  const design = key => get(`pieces.${piece}.design.${key}`);
  const option = OPTIONS[optionAt(design('option'))];
  if (option === OPTIONS[CURRENT]) return '<b>No cutting list</b>: no cupboard in this option.';
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
    const z = Math.min(CEILING_HEIGHT, Math.max(0, Number(input.value) || 0));
    input.value = z;
    if (storedValue('where') !== BY_HAND) document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = false; });
    moveStored(k, { z });
    showStored();
    writeAddress();
  });
  storedLifts.append(Object.assign(document.createElement('label'), { textContent: s.name }), input);
  return input;
});
function showLifts() { liftInputs.forEach((input, k) => { input.value = state.stored.spots[k].z; }); }
// The things to store's settings, by their keys in the configuration's
// thingsToStore: changing them (without building the flat again: their own
// redraw follows), and one's value. Where they are, as the configuration
// words it: by the window, in the cupboard, or moved by hand
const storedAt = key => `thingsToStore.${key}`;
const setStored = edits => setAll(edits.map(([key, value]) => [storedAt(key), value]));
const storedValue = key => get(storedAt(key));
const BY_HAND = 'byHand', BY_THE_WINDOW = 'window';
// Thing k moved by hand: its spot changed by `change` ({ x, y }, { z } or
// { turned }), the others kept where they are
function moveStored(k, change) {
  const spots = storedValue('spots');
  spots[k] = { ...spots[k], ...change };
  setStored([['where', BY_HAND], ['spots', spots]]);           // by hand first, as only then are the spots read
}
// Moved by hand, they go back to the window when packed again
const unlessByHand = () => (storedValue('where') === BY_HAND ? [['where', BY_THE_WINDOW]] : []);
// The things to store drawn (the model's showStored()), and their part of
// the menu put in step
function showStored() {
  const { shown, packing, where } = state.stored;
  document.getElementById('storedInfo').textContent = drawStored();
  showLifts();
  document.getElementById('storedToggle').textContent = `Stored things: ${shown ? 'shown' : 'hidden'}`;
  document.getElementById('storedPacking').value = String(packing);
  document.querySelectorAll('input[name=storedWhere]').forEach(r => { r.checked = Number(r.value) === where; });
}
document.getElementById('storedToggle').addEventListener('click', () => {
  setStored([['shown', !storedValue('shown')]]);
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
  setStored([['where', wordAt(storedAt('where'), Number(r.value))]]);   // the radios hold the page's 0 to 2
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
const canDrag = () => state.stored.shown && flat && flatView === 'plan';
renderer.domElement.addEventListener('pointerdown', e => {
  if (!canDrag()) return;
  const { k, x, y } = storedUnder(e);
  if (k < 0) return;
  e.stopImmediatePropagation();
  const now = performance.now();
  if (lastTap.k === k && now - lastTap.t < 350) {                // a double-click or double-tap turns it round
    moveStored(k, { turned: !state.stored.spots[k].turned });
    lastTap = { k: -1, t: 0 };
    showStored();
    writeAddress();
    return;
  }
  lastTap = { k, t: now };
  storedDrag = { k, dx: x - state.stored.spots[k].x, dy: y - state.stored.spots[k].y };
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
// The name and size of the thing under the pointer, in any view: on hover
// with a mouse, and for a moment after a tap on a touch screen
const tip = document.getElementById('tip');
let tipTimer = null;
function showTip(e) {
  const { k } = state.stored.shown && !storedDrag ? storedUnder(e, flat ? flatCamera : camera) : { k: -1 };
  if (k < 0) {
    tip.style.display = 'none';
    return;
  }
  const s = STORED[k], [w, d] = storedSize(k);
  tip.textContent = `${s.name}: ${s.round ? `${w} across` : `${w} × ${d} on the floor`}, ${s.h} high`;
  tip.style.display = 'block';
  const left = e.clientX + 14 + tip.offsetWidth > window.innerWidth ? e.clientX - 14 - tip.offsetWidth : e.clientX + 14;
  tip.style.left = `${left}px`;
  tip.style.top = `${e.clientY + 14}px`;
}
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' && !e.buttons) showTip(e);
  else if (e.pointerType === 'mouse') tip.style.display = 'none';   // not while rotating or panning
});
renderer.domElement.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
renderer.domElement.addEventListener('pointerup', e => {
  if (e.pointerType === 'mouse') return;
  showTip(e);
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { tip.style.display = 'none'; }, 2500);
});
for (const type of ['pointerup', 'pointercancel']) {
  renderer.domElement.addEventListener(type, e => {
    if (!storedDrag) return;
    e.stopImmediatePropagation();
    storedDrag = null;
    renderer.domElement.style.cursor = '';
    writeAddress();
  }, { capture: true });
}

// ---------------------------------------------------------------------------
// Switching options, and the controls
// ---------------------------------------------------------------------------
// The bedroom cupboard's controls: a copy of the lounge cupboard's sliders
// (bar See-through, which is both cupboards') and of its door sliders, in
// Bedroom options, each id with 'bedroomCupboard' before it
// (cupboard_controls.js)
const BEDROOM_CUPBOARD = 'bedroomCupboard';
document.getElementById('bedroomCupboardControls').append(...copyControls([...document.getElementById('cupboardControls').children], BEDROOM_CUPBOARD));
document.getElementById(idIn(BEDROOM_CUPBOARD)('xray')).closest('.row').remove();
document.getElementById('bedroomCupboardDoors').append(...copyControls(['tallBlock', 'secondBlock'].map(id => document.getElementById(id)), BEDROOM_CUPBOARD));

// The door sliders, by their names in the configuration's doors. The entrance's two
// doors (floor.js's ENTRANCE) are the flat's own, into the stairs' foot,
// and the shared lobby's outside door; the bedroom cupboard's are copies of
// the lounge cupboard's
const DOOR_SLIDERS = {
  room: document.getElementById('roomDoor'),
  tall: document.getElementById('tallDoor'),
  second: document.getElementById('secondDoor'),
  bedroom: document.getElementById('bedroomDoor'),
  flat: document.getElementById('flatDoor'),
  outside: document.getElementById('outsideDoor'),
  bedroomCupboardTall: document.getElementById('bedroomCupboardTallDoor'),
  bedroomCupboardSecond: document.getElementById('bedroomCupboardSecondDoor'),
};
// The doors turned to their angles in the configuration's doors (the
// model's turnDoors()), and their sliders put in step with them
const doorAt = name => `doors.${name}`;
function update() {
  turnDoors();
  if (dims) updateDims();                                       // the doors' labels go with them
  applyCut();                                                   // the doors may have moved across a cut
  for (const [name, slider] of Object.entries(DOOR_SLIDERS)) {
    const angle = get(doorAt(name));
    slider.value = String(angle);
    document.getElementById(`${slider.id}Value`).textContent = `${angle}°`;
  }
}
// Doors turned, { name: degrees }: set() like any setting, but nothing's
// built again, as a door's angle changes nothing that's made (the fast path)
function turnDoorsTo(angles) {
  setAll(Object.entries(angles).map(([name, angle]) => [doorAt(name), angle]));
  update();
}

for (const [name, slider] of Object.entries(DOOR_SLIDERS)) slider.addEventListener('input', () => turnDoorsTo({ [name]: Number(slider.value) }));


// Show option i: the model builds it (build()), then the menus, the view
// and everything drawn round it follow. onShow: the option on show till
// now, when the menus have already set i
function show(i, onShow) {
  const { option, same, aboveText } = build(i, onShow);
  showInMenus(option, state.cornerCupboard.option, aboveText);
  if (!same) viewKit.refresh();                                 // to the new option's cupboard (doors open, if packing), or TV
  redrawAround();
}

// The menus for option i: the option list, the description, and only the
// blocks of controls that apply to it
function showInMenus(option, i, aboveText) {
  const { above } = state;
  loungeCupboard.showBlocks();
  showBedroomCupboard();
  document.getElementById('summary').innerHTML = describe(option, aboveText);
  const shown = (id, yes) => { document.getElementById(id).style.display = yes ? '' : 'none'; };
  shown('tvBlock', above >= 2);
  shown('shelfBlock', above === 1 || above >= 3);               // only with shelves above the bench
  shown('benchDetails', benchDrawn());
  const piece = i === CURRENT || islandOnWall() ? 'none' : state.frontPiece;   // the dresser or a larder, if either is drawn
  shown('frontBlock', !(i === CURRENT || islandOnWall()));
  shown('islandMoveBlock', state.island.at === 'room');         // moving and turning: out there only
  for (const [k, id, unit] of [['x', 'islandX', ''], ['y', 'islandY', ''], ['turn', 'islandTurn', '°']]) {
    document.getElementById(id).value = String(state.island.move[k]);
    document.getElementById(`${id}Value`).textContent = `${state.island.move[k]}${unit}`;
  }
  shown('dresserBlock', piece === 'dresser');
  shown('larderBlock', piece === 'larder');
  shown('bookshelfBlock', piece === 'bookshelf');
  for (const key of BACK_WALL_KEYS) {
    shown(`${key}MoveBlock`, state[`${key}On`]);
    showPlace(key);                                             // where it starts follows the option's clear wall
  }
  showSofaPlace();                                              // where it starts follows the TV
}

// Everything drawn round the option: dimensions, colours, the things to
// store and the cupboard shelves round them, the cutting list, the address
function redrawAround() {
  updateDims();
  updatePalette();
  showStored();
  if (cupboardOnly) updateDims();                                // its shelves are drawn now, to dimension
  showCuttingLists();                                           // with its shelves as drawn, round the things to store
  writeAddress();
  update();
}

// ---------------------------------------------------------------------------
// The address: the configuration (below, with SCHEMA), then "~" and the
// view, each packed (kit/config_kit.js), so a link shows just what was on
// screen. room_dimensions.md has the format.
// ---------------------------------------------------------------------------
// replace: change the address without adding to the history, as when
// looking round. Packing is asynchronous, so each write is numbered, and
// one overtaken by a later write is dropped
let sceneKit = null;               // the Scenes list (see below), shown the scene on screen as it changes
// Nothing's written till the page has read its own address, at the start
let addressWrites = 0;
let addressRead = false;
async function writeAddress(replace = false) {
  if (!addressRead) return;
  const write = ++addressWrites;
  const configuration = configurationNow(), view = viewNow();
  sceneKit?.refresh();
  const hash = `#${await Config.pack(configuration)}~${await Config.pack(view)}`;
  if (write !== addressWrites) return;
  try {
    if (replace) history.replaceState(null, '', hash);
    else location.hash = hash;
  } catch (e) { /* not important */ }
}

window.addEventListener('keydown', e => {
  const n = Number(e.key);
  if (n >= 1 && optionAt(n) >= 0) loungeCupboard.choose(optionAt(n));
});

// Every settings control changes the settings through here, by their paths
// in the configuration: the model's setAll(edits) changes them ([path,
// value] pairs, each value the configuration's), then every control is put
// in step with them (syncControls()), the option is built again round them
// (show()), and, with look, the view follows anything looked at that's
// moved. (The things to store and the doors change theirs with set() too,
// but redraw only themselves.)
function change(edits, { look = false } = {}) {
  const onShow = optionsOnShow();                              // before they change
  setAll(edits);
  syncControls();
  show(state.cornerCupboard.option, onShow);
  if (look) viewKit.refresh();
}

// The living room's corner cupboard's controls, in Lounge options
// (cupboard_controls.js): its option list, sizes, shelves and front, by
// its design's path in the configuration
const loungeCupboard = cupboardControls({ piece: 'cornerCupboard', change });
// ...and the bedroom's, in Bedroom options: every option bar the current
// room (no cupboard), and no left-wall front to the door frame (there's no
// door on its walls)
const bedroomCupboardControls = cupboardControls({ piece: BEDROOM_CUPBOARD, id: idIn(BEDROOM_CUPBOARD), change,
  options: OPTIONS.map((o, i) => i).filter(i => i !== CURRENT), front: false });
// Its block shown only while it's there (Bedroom options' New cupboard switch)
function showBedroomCupboard() {
  const on = state.otherRoom.newCupboardOn;
  document.getElementById('bedroomCupboardBlock').hidden = !on;
  document.getElementById('bedroomCupboardOff').hidden = on;
  if (on) bedroomCupboardControls.showBlocks();
}
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => change([['pieces.bench.design.height', Number(r.value)]])));
// The description starts folded away; remember if the viewer opens it
const about = document.getElementById('about');
try { about.open = localStorage.getItem('aboutOpen') === '1'; } catch (e) { /* not important */ }
about.addEventListener('toggle', () => {
  try { localStorage.setItem('aboutOpen', about.open ? '1' : '0'); } catch (e) { /* not important */ }
});
// The drawers' sections open or closed as they were left here
for (const sec of document.querySelectorAll('.drawer details.sec[id^=sec]')) {
  try { const was = localStorage.getItem(`room_3d:${sec.id}`); if (was) sec.open = was === '1'; } catch (e) { /* not important */ }
  sec.addEventListener('toggle', () => {
    try { localStorage.setItem(`room_3d:${sec.id}`, sec.open ? '1' : '0'); } catch (e) { /* not important */ }
  });
}

// The cupboard and dresser colours: named colours to compare, or "Other
// colours…", which shows a second dropdown of popular cupboard colours and
// every RAL colour by family. ◀ and ▶ step between the named ones.
const POPULAR = [9010, 9001, 1013, 9016, 7035, 7044, 7038, 7030, 7004, 7016, 7021, 5014, 5008, 5011,
  6021, 6011, 6003, 6009, 1019, 1015, 8025, 3012, 9005];
const FAMILIES = [
  ['Whites and blacks', '9'], ['Greys', '7'], ['Beiges and yellows', '1'], ['Greens', '6'],
  ['Blues', '5'], ['Browns', '8'], ['Reds and pinks', '3'],
];
const ralLabel = code => `RAL ${code} ${RAL[code][0]}`;
// The named colours both pickers offer, then each picker's own extras
const NAMED = [
  [5, 'Clerkenwell Gloss White (as the kitchen)'], [4, 'AI Olive (from the AI picture)'],
  [6, "Bella Brittany (the blinds' fabric)"], [7, 'Blinds as drawn (the window colour)'],
  [8, 'Kitchen worktop (light stone)'], [9, 'Kitchen island (painted white)'], [10, 'Kitchen island top (honey oak)'],
];
const OTHER = 'other';
const OTHER_OPTIONS =
  `<optgroup label="Popular for cupboards">${POPULAR.map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('')}</optgroup>` +
  FAMILIES.map(([label, first]) => `<optgroup label="RAL ${label.toLowerCase()}">` +
    Object.keys(RAL).filter(c => c.startsWith(first)).map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('') +
    '</optgroup>').join('');
const colourRefreshers = [];
const refreshColours = () => colourRefreshers.forEach(f => f());
// A colour picker for one target: a dropdown of the named colours and the
// extras, ◀ ▶ to step between them, and "Other colours…" for any RAL colour
function colourPicker(target, [selectId, otherId, otherRowId, prevId, nextId, swatchId], extras, named = NAMED) {
  const select = document.getElementById(selectId), other = document.getElementById(otherId);
  const choices = [...named, ...extras], compare = choices.map(([code]) => code);
  select.innerHTML = choices.map(([code, label]) => `<option value="${code}">${label}</option>`).join('') +
    `<option value="${OTHER}">Other colours…</option>`;
  other.innerHTML = OTHER_OPTIONS;
  colourRefreshers.push(() => {
    const code = state.colours[target];
    const named = compare.includes(code);
    select.value = named ? String(code) : OTHER;
    document.getElementById(otherRowId).hidden = named;
    // The same colour can appear twice (popular and its family); keep whichever is selected
    if (!named && Number(other.value) !== code) other.value = String(code);
    const colour = colourOf(shownCode(target));
    document.getElementById(swatchId).style.background = colour ? colour.hex : 'transparent';
  });
  const pick = code => change([[`colours.${target}`, code]]);   // anything following it changes too (settle())
  // "Other colours…" starts on the other dropdown's current choice
  select.addEventListener('change', () => pick(select.value === OTHER ? Number(other.value) : Number(select.value)));
  other.addEventListener('change', () => pick(Number(other.value)));
  for (const [id, step] of [[prevId, -1], [nextId, 1]]) {
    document.getElementById(id).addEventListener('click', () => {
      // From a named colour, go to the next; from another colour, back to the first
      const k = compare.indexOf(state.colours[target]);
      pick(compare[k < 0 ? 0 : (k + step + compare.length) % compare.length]);
    });
  }
}
colourPicker('cupboard', ['ral-cupboard', 'ral-other', 'otherRow', 'colPrev', 'colNext', 'cupboardSwatch'],
  [[0, 'Same colour as the door'], [1, 'Same colour as the walls']]);
colourPicker('dresser', ['ral-dresser', 'ral-dresser-other', 'dresserOtherRow', 'dresserPrev', 'dresserNext', 'dresserSwatch'],
  [[0, 'Same as the cupboards'], [2, 'Same colour as the door'], [1, 'Same colour as the walls']]);
// The bedroom cupboard's own colour (in Bedroom options): the lounge
// cupboard's to start, as the dresser's
colourPicker('bedroomCupboard', ['ral-bedroomCupboard', 'ral-bedroomCupboard-other', 'bedroomCupboardOtherRow', 'bedroomCupboardColPrev', 'bedroomCupboardColNext', 'bedroomCupboardSwatch'],
  [[0, 'Same as the lounge cupboard'], [2, 'Same colour as the door'], [1, 'Same colour as the walls']]);
// The carpet: from the doorway photo (0, its default), the first photos'
// colour made lighter, or as it was, or Dormouse from the maker's swatch;
// none of the cupboards' named colours
colourPicker('carpet', ['ral-carpet', 'ral-carpet-other', 'carpetOtherRow', 'carpetPrev', 'carpetNext', 'carpetSwatch'],
  [[0, 'From the doorway photo'], [13, 'From the room photos, lighter (greyer)'], [12, 'From the room photos (darker)'], [11, 'Cormar Dormouse swatch (browner)']], []);
refreshColours();

// The shelf colour: the wooden shelves everywhere (above the bench, in the
// corner and upper units, option 9's tower) and option 9's oak top. As drawn,
// the shelves are a pale oak and option 9's oak is a little deeper; the
// others make them all one wood. Screen colours are approximate.
const shelfSelect = document.getElementById('shelfWood');
shelfSelect.innerHTML = SHELF_WOODS.map((w, i) => `<option value="${i}">${w.name}</option>`).join('');
function showShelfWood() {
  shelfSelect.value = String(state.shelfWood);
  document.getElementById('shelfSwatch').style.background = [].concat(SHELF_WOODS[state.shelfWood].hex)[0];
}
showShelfWood();
shelfSelect.addEventListener('change', () => change([['colours.shelves', Number(shelfSelect.value)]]));

// "Colours in this view" in the menu: a colour square for each part on show,
// read from the model's own materials so it follows the choices above. Parts
// whose materials are local to their drawing code are listed by value.
function updatePalette() {
  const { shelfWood, above } = state, { option } = state.cornerCupboard;
  const current = option === OPTIONS.length - 1;                // the room as it is, no cupboards
  const hex = m => `#${m.color.getHexString().toUpperCase()}`;
  const rows = [
    ...(current ? [] : [['Cupboards and bench', hex(carcassMat), colourOf(shownCode('cupboard')).name], ['Handles', hex(handleMat)]]),
    ...(current ? [] : [['Dresser', hex(dresserMat), colourOf(shownCode('dresser')).name]]),
    ['Shelves', hex(shelfMat), SHELF_WOODS[shelfWood].name],
    ...(OPTIONS[option].no === 9 ? [['Tower shelves and oak top', hex(oakMat), SHELF_WOODS[shelfWood].name]] : []),
    ...(above >= 2 ? [['TV', hex(tvMat)], ['TV screen', hex(screenMat)]] : []),
    ['Walls', hex(wallMat), colourOf(shownCode('wall')).name],
    ['Door, frame and sills', hex(frameMat), colourOf(shownCode('woodwork')).name],
    ['Ceiling', hex(ceilingMat), 'Pure Brilliant White, matt'],
    ['Floor', FINISHES[3].hex, 'Howdens oak 3-strip, on average'],
    ['Carpet (bedroom and stairs)', hex(carpetMat), colourOf(shownCode('carpet')).name],
    ['Kitchen units', hex(kitchenMat), 'Clerkenwell Gloss White'],
    ['Kitchen worktop', hex(worktopMat), 'Light stone laminate'],
    ['Sink', '#C4C8CC', 'Stainless steel'],
    ['Alcove tiles', '#EEEEEA'],
    ['Island', hex(islandMat), 'Painted white'],
    ['Island top', hex(islandTopMat), 'Oak'],
    ['Desk', '#F2F1EE'],
    ['Chair, monitors and riser', '#222222'],
    ['Window panes (blinds)', '#CFE3EF', 'See-through: shows as about #B8C0BF'],
    ['Radiators', '#F6F6F4'],
    ...(state.stored.shown ? STORED.map((t, k) => [t.name, hex(storedMats[k]), 'to store']) : []),
  ];
  document.getElementById('paletteList').innerHTML = rows.map(([what, value, name]) =>
    `<div class="colrow"><span class="swatch" style="background:${value}"></span>` +
    `<span class="what">${what}${name ? ` · ${name}` : ''}</span><code>${value}</code></div>`).join('');
}
// The palette starts folded away; remember if the viewer opens it
const palette = document.getElementById('palette');
try { palette.open = localStorage.getItem('paletteOpen') === '1'; } catch (e) { /* not important */ }
palette.addEventListener('toggle', () => {
  try { localStorage.setItem('paletteOpen', palette.open ? '1' : '0'); } catch (e) { /* not important */ }
});

const shelfSlider = document.getElementById('shelfDepth');
shelfSlider.addEventListener('input', () => change([['pieces.aboveBench.design.shelfDepth', Number(shelfSlider.value)]]));
// The TV size, one of TV_SIZES by its place in the list
const tvSlider = document.getElementById('tvSize');
// A piece's sizes as edits: { key: mm } for any of its sliders' keys
// (DRESSER_SLIDERS and the like, [key, id, lowest, highest]), each held to
// its slider's range, at its path in the piece's design
const sizeEdits = (design, sliders, sizes) => sliders.filter(([k]) => Number.isFinite(sizes[k]))
  .map(([k, , lo, hi]) => [`${design}.${k}`, Math.min(hi, Math.max(lo, sizes[k]))]);
// The dresser's sliders (it's placed again from its sizes by settle())
const setDresser = sizes => sizeEdits('pieces.dresser.design', DRESSER_SLIDERS, sizes);
function showDresser() {
  for (const [k, id] of DRESSER_SLIDERS) {                       // the upper depth may have been held to the base's
    document.getElementById(id).value = String(state.dresser[k]);
    document.getElementById(`${id}Value`).textContent = state.dresser[k];
  }
  showDresserPick();
}
for (const [key, id] of DRESSER_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => change(setDresser({ [key]: Number(e.target.value) })));
}
// The Dresser dropdown: the dressers in dressers.js, or Custom when
// the sliders match none of them
const dresserPick = document.getElementById('dresserPick');
const dresserCustom = Object.assign(document.createElement('option'), { value: '', textContent: 'Custom (the sliders below)', disabled: true });
dresserPick.append(dresserCustom, ...Object.entries(DRESSERS).map(([id, d]) =>
  Object.assign(document.createElement('option'), { value: id, textContent: `${d.label} (${d.w} × ${d.h})` })));
function showDresserPick() {
  const match = Object.entries(DRESSERS).find(([, d]) => DRESSER_SLIDERS.every(([k]) => d[k] === state.dresser[k]));
  dresserPick.value = match ? match[0] : '';
}
// Looking at the dresser: at it as it is now
dresserPick.addEventListener('change', () => change(setDresser(DRESSERS[dresserPick.value]), { look: true }));
// The sofa: none, or one from the list, and how far its front is from the TV wall
const sofaPick = document.getElementById('sofaPick'), sofaSlider = document.getElementById('sofaFront');
sofaPick.append(Object.assign(document.createElement('option'), { value: '', textContent: 'None' }),
  ...Object.entries(SOFAS).map(([id, S]) => Object.assign(document.createElement('option'), { value: id, textContent: `${S.label} (${S.w} × ${S.d})` })));
// The dropdown shows Custom when the sliders have changed its sizes
const sofaCustom = Object.assign(document.createElement('option'), { value: 'custom', disabled: true });
sofaPick.insertBefore(sofaCustom, sofaPick.options[1] ?? null);
function showSofa() {
  const { key, front, size } = state.sofa, own = SOFAS[key] && sofaOwnSize(SOFAS[key]);
  sofaCustom.textContent = `Custom: the ${SOFAS[key]?.label ?? 'sofa'}, resized`;
  sofaPick.value = !key ? '' : SOFA_SLIDERS.every(([k]) => own[k] === size[k]) ? key : 'custom';
  sofaSlider.value = front;
  document.getElementById('sofaFrontValue').textContent = front;
  for (const [k, id] of SOFA_SLIDERS) {
    document.getElementById(id).value = String(size[k]);
    document.getElementById(`${id}Value`).textContent = size[k];
  }
  document.getElementById('sofaFrontBlock').style.display = key ? '' : 'none';
  document.getElementById('sofaFrontRow').style.display = state.sofa.move ? 'none' : '';   // moved, its sliders say where
}
const setSofaSize = sizes => sizeEdits('pieces.sofa.design', SOFA_SLIDERS, sizes);
for (const [key, id] of SOFA_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => change(setSofaSize({ [key]: Number(e.target.value) }), { look: true }));
}
// A sofa chosen comes in its own sizes ('' is none, the configuration's 'none')
sofaPick.addEventListener('change', () => {
  const S = SOFAS[sofaPick.value];
  change([['pieces.sofa.design.model', wordAt('pieces.sofa.design.model', sofaPick.value)], ...(S ? setSofaSize(sofaOwnSize(S)) : [])], { look: true });
});
const SOFA_PLACE = 'pieces.sofa.in.livingRoom';
sofaSlider.addEventListener('input', () => change([[`${SOFA_PLACE}.front`, Number(sofaSlider.value)]], { look: true }));
// Cupboard only: the rest of the room hidden, and the cupboard's dimensions shown
const cupboardOnlySwitch = document.getElementById('cupboardOnly');
function setCupboardOnly(on) {
  cupboardOnlySwitch.checked = on;
  setDisplay({ cupboardOnly: on });
  applyCut();
  updateDims();
  if (flat) viewKit.setView(viewKit.viewId || 'plan');          // framed for it, or for the room again
}
cupboardOnlySwitch.addEventListener('change', () => {
  setCupboardOnly(cupboardOnlySwitch.checked);
  viewKit.writeView();
});
// The bench: drawn, or not (and nothing above it)
const benchSwitch = document.getElementById('benchOn');
benchSwitch.addEventListener('change', () => change([['pieces.bench.in.livingRoom.on', benchSwitch.checked]], { look: true }));
// The bookshelf and the pine cupboard, in place of the bench. While either
// is on, the Bench switch is off and can't be changed; benchOn is kept, for
// when they're off again. Moving one, and turning it in quarter turns: the
// first move starts from where it stands; Reset location puts it back
// against the wall
const PLACE_SLIDERS = [['x', 'X', ROOM_WIDTH, 5, ''], ['y', 'Y', ROOM_DEPTH, 5, ''], ['turn', 'Turn', 360 - QUARTER_TURN, QUARTER_TURN, '°']];
const roundedSpot = ({ x, y, turn }) => ({ x: Math.round(x), y: Math.round(y), turn });
const backWallSwitches = {};
// Each one's place in the living room in the configuration, by its key
const BACK_WALL_PLACES = { bookshelf: 'pieces.bookcase.in.livingRoom', pine: 'pieces.pineCupboard.in.livingRoom' };
for (const key of BACK_WALL_KEYS) {
  const place = BACK_WALL_PLACES[key];
  const onSwitch = backWallSwitches[key] = document.getElementById(`${key}On`);
  onSwitch.addEventListener('change', () => change([[`${place}.on`, onSwitch.checked]], { look: true }));
  for (const [k, suffix, max, step] of PLACE_SLIDERS) {
    const input = Object.assign(document.getElementById(`${key}${suffix}`), { min: '0', max: String(max), step: String(step) });
    input.addEventListener('input', () => change([[`${place}.move`, { ...roundedSpot(spotOf(key)), [k]: Number(input.value) }]]));
  }
  document.getElementById(`${key}Home`).addEventListener('click', () => change([[`${place}.move`, null]]));
}
function showPlace(key) {
  const spot = roundedSpot(spotOf(key));
  for (const [k, suffix, , , unit] of PLACE_SLIDERS) {
    document.getElementById(`${key}${suffix}`).value = String(spot[k]);
    document.getElementById(`${key}${suffix}Value`).textContent = `${spot[k]}${unit}`;
  }
}
// Moving the sofa about the room, and turning it about its middle in quarter
// turns: the first move starts from where it stands, centred on the TV;
// Reset location puts it back there, its front the slider's distance away
const sofaTurn = document.getElementById('sofaTurn');
for (const [k, suffix, max, step] of PLACE_SLIDERS.filter(([k]) => k !== 'turn')) {
  const input = Object.assign(document.getElementById(`sofa${suffix}`), { min: '0', max: String(max), step: String(step) });
  input.addEventListener('input', () => change([[`${SOFA_PLACE}.move`, { ...sofaPlace(), [k]: Number(input.value) }]], { look: true }));
}
sofaTurn.addEventListener('change', () => change([[`${SOFA_PLACE}.move`, { ...sofaPlace(), turn: Number(sofaTurn.value) }]], { look: true }));
document.getElementById('sofaHome').addEventListener('click', () => change([[`${SOFA_PLACE}.move`, null]], { look: true }));
// Where the sofa is, to the nearest mm (the TV's middle may fall on a half)
function sofaPlace() {
  return roundedSpot(state.sofa.move ?? sofaHome(currentSofa()));
}
function showSofaPlace() {
  if (!SOFAS[state.sofa.key]) return;
  const { x, y, turn } = sofaPlace();
  for (const [suffix, v] of [['X', x], ['Y', y]]) {
    document.getElementById(`sofa${suffix}`).value = String(v);
    document.getElementById(`sofa${suffix}Value`).textContent = v;
  }
  sofaTurn.value = String(turn);
}
// On the front wall, the bookcase's sizes: the bedroom's (its sliders in
// Bedroom options), so either set changes the one bookcase
const bookshelfSizeId = k => `bookshelf${k.toUpperCase()}`;
document.getElementById('bookshelfSizes').innerHTML = BOOKCASE_SIZES.map(([k, lo, hi]) =>
  `<label for="${bookshelfSizeId(k)}">Bookshelf ${SIZE_LABEL[k].toLowerCase()}: <span id="${bookshelfSizeId(k)}Value"></span></label>` +
  `<input id="${bookshelfSizeId(k)}" type="range" min="${lo}" max="${hi}" step="10">`).join('');
for (const [k] of BOOKCASE_SIZES) {
  document.getElementById(bookshelfSizeId(k)).addEventListener('input', e => change([[`pieces.bookcase.design.${k}`, Number(e.target.value)]], { look: true }));
}
function showBookshelfSizes() {
  for (const [k] of BOOKCASE_SIZES) {
    document.getElementById(bookshelfSizeId(k)).value = String(state.otherRoom.bookcase[k]);
    document.getElementById(`${bookshelfSizeId(k)}Value`).textContent = state.otherRoom.bookcase[k];
  }
}
// The island: where it is, or against the front wall
const ISLAND_PLACE = 'pieces.island.in.livingRoom';
document.querySelectorAll('input[name=islandAt]').forEach(r => r.addEventListener('change', () => change([[`${ISLAND_PLACE}.at`, r.value]], { look: true })));
// Out there: the island's middle, and how far it's turned
for (const [k, id] of [['x', 'islandX'], ['y', 'islandY'], ['turn', 'islandTurn']]) {
  document.getElementById(id).addEventListener('input', e => change([[`${ISLAND_PLACE}.${k}`, Number(e.target.value)]]));
}
// On the front wall: the dresser, a larder or nothing; and which larder
document.querySelectorAll('input[name=frontPiece]').forEach(r => r.addEventListener('change', () => change([['livingRoom.frontWall', r.value]], { look: true })));
// The Larder dropdown: the larders in larders.js, or Custom when the
// sliders have changed its sizes (it keeps that larder's front)
const larderPick = document.getElementById('larderPick');
const larderCustom = Object.assign(document.createElement('option'), { value: '', disabled: true });
larderPick.append(larderCustom, ...Object.entries(LARDERS).map(([id, L]) =>
  Object.assign(document.createElement('option'), { value: id, textContent: `${L.label} (${L.w} × ${larderHeight(L)})` })));
const setLarderSize = sizes => sizeEdits('pieces.larder.design', LARDER_SLIDERS, sizes);
function showLarder() {
  const { key, size } = state.larder;
  for (const [k, id] of LARDER_SLIDERS) {
    document.getElementById(id).value = String(size[k]);
    document.getElementById(`${id}Value`).textContent = size[k];
  }
  const L = LARDERS[key], own = L && larderOwnSize(L);
  larderCustom.textContent = `Custom: the ${L?.label ?? 'larder'}, resized`;
  larderPick.value = own && LARDER_SLIDERS.every(([k]) => own[k] === size[k]) ? key : '';
}
// A larder chosen comes in its own sizes
larderPick.addEventListener('change', () => change([['pieces.larder.design.model', larderPick.value],
  ...setLarderSize(larderOwnSize(LARDERS[larderPick.value]))], { look: true }));
for (const [key, id] of LARDER_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => change(setLarderSize({ [key]: Number(e.target.value) }), { look: true }));
}
tvSlider.addEventListener('input', () => change([['pieces.aboveBench.design.tv', TV_SIZES[Number(tvSlider.value)][0]]]));
// The radios hold the page's 0 to 4
const ABOVE = 'pieces.aboveBench.design.what';
document.querySelectorAll('input[name=above]').forEach(r => r.addEventListener('change', () => change([[ABOVE, wordAt(ABOVE, Number(r.value))]])));

let xray = false;
const xrayButton = document.getElementById('xray');
function setSeeThrough(on) {
  xray = on;
  setDisplay({ seeThrough: xray });
  xrayButton.textContent = `See-through cupboards: ${xray ? 'on' : 'off'}`;
}
xrayButton.addEventListener('click', () => {
  setSeeThrough(!xray);
  viewKit.writeView();
});

// The room's own views, in scene metres: [x, height, y], so room (x, y, z)
// in mm / 1000 as (x, z, y). 3D views place the perspective camera at
// `position`, looking at `target`, and may set hfov, the angle across in
// degrees; 2D views place the flat one and give the width and height (m) to
// fit on screen. The config-defined views, the places you can be and the
// things you can look at are in living_room.views.js, for editing; kit/view_kit.js
// does the choosing (see viewKit below).
// The bedroom and the hallway (floor.js), for the bird's eye and the plan,
// which frame whichever room is chosen (the kit's `rooms`): each one's
// middle and size, in scene metres, and the bedroom's window wall's x
const BEDROOM_AREA = { x: (OTHER_ROOM_CORNER.x + OTHER_ROOM.length / 2) * MM, y: (OTHER_ROOM_CORNER.y + OTHER_ROOM.recessBack / 2) * MM,
  w: OTHER_ROOM.length * MM, d: OTHER_ROOM.recessBack * MM };
const HALLWAY_AREA = { x: (HALLWAY.x0 + HALLWAY.xEnd) / 2 * MM, y: HALLWAY.ySetBack / 2 * MM, w: HALLWAY.length * MM, d: HALLWAY.ySetBack * MM };
// The stairs and the entrance: from the hallway's door wall to the
// building's back wall, and from the stairs' outside wall across the lobby
const ENTRANCE_AREA = { x: (HALLWAY.x0 + ENTRANCE.xBack) / 2 * MM, y: ENTRANCE.yLobby1 / 2 * MM, w: (HALLWAY.x0 - ENTRANCE.xBack) * MM, d: ENTRANCE.yLobby1 * MM };
const BEDROOM_WINDOW_WALL = OTHER_ROOM_CORNER.x * MM;
// The garage (garage.js), likewise, and its floor's level
const GARAGE_AREA = { x: (GARAGE_CORNER.x + GARAGE.length / 2) * MM, y: (GARAGE_CORNER.y + GARAGE.width / 2) * MM, w: GARAGE.length * MM, d: GARAGE.width * MM };
const GARAGE_FLOOR = ENTRANCE.floor * MM;
// A room's plan: straight down on its middle, the back wall's side at the
// top as in the living room's, with room round it for its dimensions
const PLAN_MARGIN = 1.4;                                        // metres, chosen
const planOf = ({ x, y, w, d }) => ({ position: [x, 20, y + 0.001], target: [x, 0, y], fit: [w + PLAN_MARGIN, d + PLAN_MARGIN] });
const builtInViews = {
  top:    { label: 'Top', title: 'Straight down from above', position: [1.92, 9.5, 2.9], target: [1.92, 0, 2.86] },
  corner: { label: 'Corner', title: 'From high in the corner by the desk', position: [4.6, 3.4, 5.4], target: [1.0, 1.0, 1.0] },
  // High above the windows, looking down across the room towards the door
  // and the kitchen. The outer wall and ceiling only show from inside, so
  // the room is open from here; any further out and the outer wall's brick
  // face would hide the floor along it. The same over the bedroom, from
  // above its window, and over the hallway, from above the stairs' outside
  // wall, which likewise only shows from inside
  birdseye: { label: "Bird's eye", title: 'Looking down on the room', position: [4.5, 7.5, 2.75], target: [1.2, 0, 2.75], hfov: 66,
    rooms: {
      bedroom: { position: [BEDROOM_WINDOW_WALL - 0.66, 7.5, BEDROOM_AREA.y], target: [BEDROOM_WINDOW_WALL + 2.6, 0, BEDROOM_AREA.y] },
      hallway: { position: [HALLWAY_AREA.x, 6.0, -1.8], target: [HALLWAY_AREA.x, 0, 1.6] },
      downstairs: { position: [ENTRANCE_AREA.x, 3.6, -3.4], target: [ENTRANCE_AREA.x, ENTRANCE.floor / 2 * MM, 1.2] },   // aimed halfway down the stairs, chosen to fit
      garage: { position: [GARAGE_AREA.x + 4.5, GARAGE_FLOOR + 6.5, GARAGE_AREA.y], target: [GARAGE_AREA.x - 0.6, GARAGE_FLOOR, GARAGE_AREA.y] },   // above its door, looking in (chosen to fit)
    } },
  // The wall views leave out what's on the camera's side of their cut (see
  // applyCut): the back wall view everything past the return wall, the left
  // wall view the island, the dresser and beyond, the front wall view
  // everything short of the island's far end, the right wall view everything
  // left of the desk recess
  plan:   { label: 'Plan (2D)', position: [1.4, 20, 2.861], target: [1.4, 0, 2.86], fit: [6.0, 6.9],    // back wall at the top
    rooms: { bedroom: planOf(BEDROOM_AREA), hallway: planOf(HALLWAY_AREA), downstairs: planOf(ENTRANCE_AREA), garage: planOf(GARAGE_AREA) } },
  back:   { label: 'Back wall (2D)', position: [1.9, 1.0, 30], target: [1.9, 1.0, 0], fit: [5.0, 3.2], cut: ['y', 2240, 1] },        // facing the back wall
  left:   { label: 'Left wall (2D)', position: [30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.0, 3.2], cut: ['x', 700, 1] },         // facing the left wall, back wall on the right
  front:  { label: 'Front wall (2D)', position: [1.37, 1.0, -30], target: [1.37, 1.0, 0], fit: [6.2, 3.2], cut: ['y', 4300, -1] },   // facing the front wall, left wall on the right
  right:  { label: 'Right wall (2D)', position: [-30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.2, 3.2], cut: ['x', 2220, -1] },   // facing the right wall, back wall on the left
};

// Packing: standing back from the corner cupboard's door (PACK_BACK, below),
// eyes at standing height, looking in and down a little, with its doors open wide.
// Where that is depends on the option, so it's worked out when chosen.
// Returns the middle of the door opening (or for an L, its inside corner)
// and the way out of it.
function packingSpot() {
  const { T, R, F, LEG, LEG_D, WARD, WARD_D, CORNER_W, CORNER_D } = state.cornerCupboard;
  const mid = (x, y, nx, ny) => ({ x, y, nx, ny });
  // An L (back-wall leg Dl deep, left-wall leg T deep): standing diagonally
  // in front of its inside corner, looking into it, to see into both legs
  const lCorner = Dl => mid(T, Dl, Math.SQRT1_2, Math.SQRT1_2);
  switch (OPTIONS[state.cornerCupboard.option].no) {
    case 7:                                                      // an L: in front of its inside corner; else the back-wall leg's door
      return T ? lCorner(LEG_D) : mid(T + LEG / 2, LEG_D, 0, 1);
    case 8: {                                                    // the diagonal doors
      const { ux, uy } = diagonal(cupboardSettings());
      return mid(T + 350, (F + R) / 2, -uy, ux);
    }
    case 9:                                                      // likewise an L, else the double doors
      return T ? lCorner(WARD_D) : mid(T + WARD / 2, WARD_D, 0, 1);
    case 10:                                                     // doors on its end, facing the kitchen
      return cornerTooShallow(cupboardSettings(), 'kitchen') ? null : mid(CORNER_W / 2, CORNER_D, 0, 1);
    case 11:                                                     // doors on its side, facing the windows
      return cornerTooShallow(cupboardSettings(), 'windows') ? null : mid(CORNER_W, (R + CORNER_D) / 2, 1, 0);
    default:
      return null;
  }
}
const PACK_BACK = 1250;             // mm out from the cupboard's door: arm's reach (750) and half a metre
const PACKING_DOORS = 170;          // degrees: the cupboard's doors folded back, out of the way (chosen; the sliders go to 180)
function packingView() {
  const at = packingSpot();
  if (!at) return builtInViews.corner;                                  // no corner cupboard: the corner view
  // Its doors open wide, all of them, folded back out of the way (at 90° one
  // can stand across the front of the other; an option with only one has
  // the other slider unused)
  turnDoorsTo({ tall: PACKING_DOORS, second: PACKING_DOORS, room: 0 });   // the room door shut, as it can hide the cupboard
  const { x, y, nx, ny } = at, m = v => v / 1000;
  return { posture: 'stand', position: [m(x + PACK_BACK * nx), 1.6, m(y + PACK_BACK * ny)], target: [m(x - 300 * nx), 0.9, m(y - 300 * ny)], hfov: 95 };
}
let flatFit = builtInViews.plan.fit;
let flatPerM = null;               // the 2D views' scale, pixels per metre at zoom 1
// The 2D/3D switch, fitting the views to the screen, and the render loop:
// kit/floor_kit.js's, reading the views' framing from here
const { setFlat, resize, startLoop, draw } = flatViews({ scene, renderer, camera, controls, flatCamera, flatControls }, {
  get flat() { return flat; },
  set flat(on) { setDisplay({ flat: on }); },
  get flatFit() { return flatFit; },
  get flatPerM() { return flatPerM; },
  set flatPerM(perM) { flatPerM = perM; },
  get hfov() { return viewKit.hfov; },
  get drawers() { return drawers; },
});

// Things to look at that move with the option or the sliders: where to aim,
// room [x, y, height] in mm
// The middle of what's drawn, room [x, y, height] in mm
function middleOf(object) {
  const c = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  return [c.x / MM, c.z / MM, c.y / MM];
}
// A point given in a piece's own mm (across it, along it), on the floor,
// room [x, y] in mm, wherever the piece now stands and however it's turned
function pointOn(piece, [across, along]) {
  piece.updateWorldMatrix(true, false);
  const p = piece.localToWorld(new THREE.Vector3(across * MM, 0, along * MM));
  return [p.x / MM, p.z / MM];
}
const anchors = {
  // Wherever they are, else where they'd be on the front wall
  dresser: () => pieces.dresser ? middleOf(pieces.dresser) : [(state.dresser.x0 + state.dresser.x1) / 2, ROOM_DEPTH - state.dresser.baseD / 2, state.dresser.h / 2],
  larder: () => pieces.larder ? middleOf(pieces.larder) : [frontFrom() + frontGap() / 2, ROOM_DEPTH - 250, 1000],
  island: () => middleOf(islandGroup),
  sofa: () => pieces.sofa ? middleOf(pieces.sofa) : [ROOM_WIDTH / 2, 2400, 500],
  // Sitting on it: in the middle, eyes over the back of the seat
  sofaSeat: () => {
    if (!SOFAS[state.sofa.key] || !pieces.sofa) return [ROOM_WIDTH / 2, 2500];
    const S = currentSofa();
    return pointOn(pieces.sofa, [0, -S.d / 2 + S.seatD - 100]);
  },
  cupboard: () => {                                             // the middle of its door, else the corner
    const at = packingSpot();
    return at ? [at.x, at.y, 1200] : [400, 400, 1200];
  },
  tv: () => tvAt ?? [ROOM_WIDTH / 2, 0, 1400],
  // The bedroom's furniture (other_room.js), and where you lie on the bed
  // and stand beside it, as it's moved and turned
  bed: () => middleOf(otherRoomPieces.bed),
  bookcase: () => middleOf(otherRoomPieces.bookcase),
  pineCupboard: () => middleOf(otherRoomPieces.cupboard),
  newCupboard: () => {                                          // with none (switched off, or option 16), the pine cupboard's spot
    const drawn = new THREE.Box3().setFromObject(otherRoomPieces.newCupboard);
    return middleOf(drawn.isEmpty() ? otherRoomPieces.cupboard : otherRoomPieces.newCupboard);
  },
  mirror: () => middleOf(otherRoomPieces.mirror),
  bedPillow: () => pointOn(otherRoomPieces.bed, BED_SPOTS.pillow),
  bedSide: () => pointOn(otherRoomPieces.bed, BED_SPOTS.side),
  // The wicker bench (wicker_bench.js), wherever it is in each room
  hallBench: () => middleOf(wickerBenches.hallway),
  bedroomBench: () => middleOf(wickerBenches.bedroom),
  livingBench: () => middleOf(wickerBenches.livingRoom),
  // The shoe rack (shoe_rack.js), wherever it stands at the foot of the stairs
  shoeRack: () => middleOf(shoeRack),
  // Sean, Billy, BillyChest and the rest (garage.js), wherever they stand in the garage
  ...Object.fromEntries(Object.keys(garagePieces).map(piece => [piece, () => middleOf(garagePieces[piece])])),
};
const startingAddress = location.hash.slice(1);                 // read before anything rewrites it
const viewKit = ViewKit.create({
  THREE, camera, controls, canvas: renderer.domElement,
  room: 'room_3d',
  config: ROOM_VIEWS,
  builtIn: builtInViews,
  origins: { bedroom: [OTHER_ROOM_CORNER.x, OTHER_ROOM_CORNER.y], garage: [GARAGE_CORNER.x, GARAGE_CORNER.y] },   // their places and things are in their own mm
  anchors,
  computed: { packing: packingView },
  actions: {
    shutRoomDoor() {
      turnDoorsTo({ room: 0 });
    },
  },
  chair: { object: deskChair, rest: CHAIR_TURN, eyes: 150 },
  el: {
    room: document.getElementById('room'), where: document.getElementById('where'), lookAt: document.getElementById('lookAt'), eye: document.getElementById('eye'),
    views: document.getElementById('viewPick'), save: document.getElementById('saveView'), remove: document.getElementById('deleteView'),
    looks: document.getElementById('lookPick'), saveLook: document.getElementById('saveLook'), removeLook: document.getElementById('deleteLook'),
  },
  hooks: {
    place(v, id, room) {
      showRoomOptions(room);
      setFlat(Boolean(v.fit));
      const [cam, ctl] = flat ? [flatCamera, flatControls] : [camera, controls];
      cam.position.set(...v.position);
      ctl.target.set(...v.target);
      setDisplay({ flatView: flat ? id : null, flatRoom: room });   // the hallway's hidden in the wall views (the model's setDisplay())
      updateDims();
      applyCut();
      showStored();
      if (flat) {
        flatFit = v.fit;
        flatCamera.zoom = 1;
      }
      resize();                                                 // applies the view's fit or field of view
      ctl.update();
      frameCupboard();                                          // on its own, framed to fill the screen
    },
    isFlat: () => flat,
    resize: () => resize(),
    writeAddress: () => writeAddress(true),
  },
});
// The doors' angles into the address a moment after they stop, as the view's
Object.values(DOOR_SLIDERS).forEach(d => d.addEventListener('input', viewKit.writeView));
// Scenes: everything on show bar the view, from living_room.scenes.js or saved
// here. Showing one loads the page again with its settings, keeping the view.
// The pop-up menus: the views list and look at the top right, the scenes at
// the bottom right
popMenus(renderer.domElement);
sceneKit = SceneKit.create({
  room: 'room_3d',
  config: window.ROOM_SCENES,
  el: { scenes: document.getElementById('scenePick'), save: document.getElementById('saveScene'), remove: document.getElementById('deleteScene') },
  get: () => configurationNow(),
  async apply(configuration) {
    history.replaceState(null, '', `#${await Config.pack(configuration)}~${await Config.pack(viewNow())}`);
    location.reload();
  },
});

// The 2D views' Dimensions and Door sizes buttons
const dimsButton = document.getElementById('dims'), doorDimsButton = document.getElementById('doorDims');
function setDims(on) {
  setDisplay({ showDims: on });
  dimsButton.textContent = `Dimensions: ${showDims ? 'on' : 'off'}`;
  updateDims();
}
function setDoorDims(on) {
  setDisplay({ showDoorDims: on });
  doorDimsButton.textContent = `Door sizes: ${showDoorDims ? 'on' : 'off'}`;
  updateDims();
}
dimsButton.addEventListener('click', () => {
  setDims(!showDims);
  viewKit.writeView();
});
doorDimsButton.addEventListener('click', () => {
  setDoorDims(!showDoorDims);
  viewKit.writeView();
});

// The view, as JSON: the view kit's (the room, the view or the camera, the
// eye height), then the switches for what's shown, so a link shows them
// too. Reading one sets the switches it has, then the view
const VIEW_VERSION = 1;            // up only when a field changes its meaning
const viewNow = () => ({ version: VIEW_VERSION, ...viewKit.view(),
  dimensions: showDims, doorSizes: showDoorDims, cupboardOnly, seeThrough: xray });
function readDisplay(view) {
  const given = key => typeof view?.[key] === 'boolean';
  if (given('dimensions')) setDims(view.dimensions);
  if (given('doorSizes')) setDoorDims(view.doorSizes);
  if (given('cupboardOnly')) setCupboardOnly(view.cupboardOnly);
  if (given('seeThrough')) setSeeThrough(view.seeThrough);
}

// ---------------------------------------------------------------------------
// The rooms' buttons and the settings drawers. In the top bar, a split
// button for each room: its name goes to it, seen as its dropdown says
// (Bird's eye to start, or the plan), remembered for each on this device.
// At the bottom left, the options for the room in view: its drawer.
// Downstairs has no button of its own; its options are the hallway's.
// ---------------------------------------------------------------------------
const ROOM_BUTTONS = {
  livingRoom: { name: 'Lounge', drawer: 'loungePanel', options: 'Lounge options' },
  bedroom: { name: 'Bedroom', drawer: 'bedPanel', options: 'Bedroom options' },
  garage: { name: 'Garage', drawer: 'garagePanel', options: 'Garage options' },
  hallway: { name: 'Hallway', drawer: 'hallPanel', options: 'Hallway and stairs' },
};
const optionsOf = room => ROOM_BUTTONS[room] ?? ROOM_BUTTONS.hallway;     // downstairs: the hallway's
// How a room's button shows it: views that frame every room (builtInViews')
const ROOM_VIEW_KINDS = [['birdseye', "Bird's eye"], ['plan', 'Plan (2D)']];
const viewKindKey = room => `room_3d:viewKind:${room}`;
function viewKindOf(room) {
  try { return localStorage.getItem(viewKindKey(room)) ?? ROOM_VIEW_KINDS[0][0]; } catch (e) { return ROOM_VIEW_KINDS[0][0]; }
}
// To room, as its button's dropdown says: the drawers shut, and the whole
// room shown (not Cupboard only)
function goToRoom(room) {
  drawers.setMenu(null);
  if (cupboardOnly) setCupboardOnly(false);
  viewKit.showRoom(room, viewKindOf(room));
}
for (const [room, { name }] of Object.entries(ROOM_BUTTONS)) {
  const id = `${name.toLowerCase()}View`;                           // loungeView, bedroomView and so on
  const split = Object.assign(document.createElement('div'), { className: 'split' });
  const go = Object.assign(document.createElement('button'), { id, className: 'chip', textContent: `${name} view`, title: `Go to the ${name.toLowerCase()}` });
  const kind = Object.assign(document.createElement('select'), { id: `${id}Kind`, className: 'pick' });
  kind.setAttribute('aria-label', `${name} view: seen from`);
  kind.append(...ROOM_VIEW_KINDS.map(([value, label]) => Object.assign(document.createElement('option'), { value, textContent: label })));
  kind.value = viewKindOf(room);
  go.addEventListener('click', () => goToRoom(room));
  kind.addEventListener('change', () => {
    try { localStorage.setItem(viewKindKey(room), kind.value); } catch (e) { /* not important */ }
    goToRoom(room);
  });
  const kindBox = Object.assign(document.createElement('span'), { className: 'kind' });   // shows ▾ over it
  kindBox.append(kind);
  split.append(go, kindBox);
  document.getElementById('roomViews').append(split);
}

// The settings drawers, one open at a time, all closed to start on every
// screen: Other options (the wicker bench, the colours in this view),
// opened by ☰, and each room's, the hallway and stairs' too, by the options
// button at the bottom left.
// Each: [its button, or null for the options button's, the class on
// <body> while it's open]. The 2D views move clear of the drawer as it
// opens and closes.
const DRAWERS = { panel: ['menu', 'menu-open'], loungePanel: [null, 'lounge-open'], bedPanel: [null, 'bed-open'],
  garagePanel: [null, 'garage-open'], hallPanel: [null, 'hall-open'] };
const roomOptions = document.getElementById('roomOptions');
const drawers = createDrawers(DRAWERS, () => {
  resize(true);
  roomOptions.setAttribute('aria-expanded', String(drawers.openDrawer() === optionsOf(viewKit.room).drawer));
});
roomOptions.addEventListener('click', () => {
  const { drawer } = optionsOf(viewKit.room);
  drawers.setMenu(drawers.openDrawer() === drawer ? null : drawer);
});
// The options button names the room in view's (from hooks.place())
function showRoomOptions(room) {
  const { drawer, options } = optionsOf(room);
  roomOptions.textContent = options;
  roomOptions.setAttribute('aria-controls', drawer);
}
drawers.setMenu(null);

resetButton(document.getElementById('reset'));
// Share: the link is always to the published page, so it works for others
// even when this copy is on a local server
shareButton(document.getElementById('share'), 'https://andrewrobinson.github.io/plans/index.html', () => OPTIONS[state.cornerCupboard.option].name);
screenshotButton(document.getElementById('screenshot'), renderer.domElement, draw, () => OPTIONS[state.cornerCupboard.option].name);
resize();

workOffline('sw.js');

// Every control in step with the settings: the sliders, radio buttons,
// switches and dropdowns, the reverse of their listeners above, which all go
// through change(). The colours, the shelves' wood, the dresser's place and
// the island go on the model too. The option's own controls, and the things
// to store's, are show()'s.
// The rooms' modules' controls name each setting by its path in their own
// part of state (`within`), as 'bed.u' in state.otherRoom, each value the
// page's: as edits, by their paths in the configuration
const roomEdits = (within, edits) => edits.map(([path, value]) => {
  const at = pathOfSetting(`${within}.${path}`);
  return [at, wordAt(at, value)];
});
// The bedroom's sliders (other_room.js), in state.otherRoom
const syncOtherRoom = otherRoomControls(document.getElementById('otherRoomBlock'), edits => change(roomEdits('otherRoom', edits)));
// The wicker bench's (wicker_bench.js), in state.wickerBench, as 'hallway.along'
const syncWickerBench = wickerBenchControls(document.getElementById('wickerBenchBlock'), edits => change(roomEdits('wickerBench', edits), { look: true }));
// The shoe rack's (shoe_rack.js), in state.shoeRack
const syncShoeRack = shoeRackControls(document.getElementById('shoeRackBlock'), edits => change(roomEdits('shoeRack', edits), { look: true }));
// The garage's (garage.js), in state.garage, as 'sean.x'
const syncGarage = garageControls(document.getElementById('garageBlock'), edits => change(roomEdits('garage', edits), { look: true }));

function syncControls() {
  settle();                                                     // the TV's size, the colours and the dresser's place, worked out
  const { BENCH, above, shelfDepth, tv, frontPiece, island } = state;
  const slide = (id, value, text = value) => {
    document.getElementById(id).value = String(value);
    document.getElementById(`${id}Value`).textContent = text;
  };
  const check = (name, value) => { document.querySelector(`input[name=${name}][value="${value}"]`).checked = true; };
  loungeCupboard.sync();
  bedroomCupboardControls.sync();
  benchSwitch.checked = benchDrawn();
  benchSwitch.disabled = onBackWall().length > 0;
  for (const key of BACK_WALL_KEYS) backWallSwitches[key].checked = state[`${key}On`];
  showBookshelfSizes();
  check('bench', BENCH);
  check('above', above);
  slide('shelfDepth', shelfDepth);
  slide('tvSize', TV_SIZES.findIndex(([inches]) => inches === tv), `${tv}" (${TV_W} × ${TV_H})`);
  refreshColours();
  showShelfWood();
  check('frontPiece', frontPiece);
  showDresser();
  showLarder();
  showSofa();
  check('islandAt', island.at);
  syncOtherRoom(state.otherRoom);
  syncWickerBench(state.wickerBench);
  syncShoeRack(state.shoeRack);
  syncGarage(state.garage);
}

// ---------------------------------------------------------------------------
// window.plans: the settings and what's made of them, for the tests and the
// browser console (REFACTOR_PLAN.md, steps 6a and 6b). Only load() changes
// the page.
//   get()       the settings: state, as JSON, the doors' angles with them
//   export()    the settings as a configuration (SCHEMA, above)
//   load(json)  shows a configuration, keeping the view
//   view()      the view, as JSON
//   schema()    the configuration's entries, bar their functions
//   snapshot()  the configuration, each corner cupboard's cutting list, the
//               dimension figures on show, the description and each piece's
//               box, which the
//               tests save beside each address (tests/snapshots/)
// ---------------------------------------------------------------------------
function settingsNow() {
  return JSON.parse(JSON.stringify(state));
}
// Show a configuration in place of the settings on show: everything it
// leaves out as the page starts. The view stays, bar following what moves
function loadConfiguration(configuration) {
  startAgain();
  readConfiguration(configuration);
  syncControls();
  show(state.cornerCupboard.option);
  viewKit.refresh();
}

window.plans = {
  get: settingsNow,
  export: configurationNow,
  load: loadConfiguration,
  view: viewNow,
  schema: () => SCHEMA.map(({ read, write, isColour, also, ...entry }) => structuredClone(entry)),
  snapshot: () => ({
    configuration: configurationNow(),
    cupboards: cupboardRows(),
    dimensions: dimensionFigures(),
    description: document.getElementById('summary').textContent,
    boxes: pieceBoxes(),
  }),
};

// Start on the configuration and the view in the address (room_dimensions.md
// has their format), unpacked first. Anything the configuration leaves out,
// and everything with no address, starts as in state: option 10, TV and
// shelves above the bench, and AI Olive cupboards.
const [configurationText, viewText] = startingAddress.split('~');
const [startingConfiguration, startingView] = await Promise.all([Config.unpack(configurationText), Config.unpack(viewText)]);
if (startingConfiguration) readConfiguration(startingConfiguration);
addressRead = true;
syncControls();
show(state.cornerCupboard.option);
// The view: the address's, else the last chosen here. After show(), as
// some views are worked out from the option; the switches for what's shown
// first, as Cupboard only frames the view
readDisplay(startingView);
viewKit.start(startingView);
startLoop();
