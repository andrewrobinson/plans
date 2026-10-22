// Switching options, and the controls (a piece of living_room.js): the
// bedroom cupboard's copies of the lounge's, the doors' sliders, the
// address, and change(), which every control edits the settings through.
import * as Config from '../kit/config_kit.js';
import { cupboardControls, copyControls, idIn } from '../cupboard_controls.js';
import {
  rebuild, turnDoors, describe, BACK_WALL_KEYS, CURRENT_ROOM, OPTIONS, benchDrawn, configurationNow, dims, 
  islandOnWall, optionOf, pieces, setAll, optionsOnShow, config, updateDims, BEDROOM_CUPBOARD_RANGES, doorsNow, 
  setDoors, inLivingRoom, aboveHasTv, aboveHasShelves, daybedTvShown
} from '../flat_model.js';
import {
  addressRead, applyCut, configurationKit, showCastorDesk, showCuttingLists, showIvar, showPlace, showSofaPlace, 
  showSpeakers, showStoredMenu, showTables, syncControls, updatePalette, viewKit, viewNow, xray
} from '../living_room.js';

// ---------------------------------------------------------------------------
// Switching options, and the controls
// ---------------------------------------------------------------------------
// The bedroom cupboard's controls: a copy of the lounge cupboard's sliders
// (bar See-through, which is both cupboards') and of its door sliders, in
// Bedroom options, each id with 'bedroomCupboard' before it
// (cupboard_controls.js)
const BEDROOM_CUPBOARD = 'bedroomCupboard';
document.getElementById('bedroomCupboardControls').append(...copyControls([...document.getElementById('cupboardControls').children], BEDROOM_CUPBOARD));
document.getElementById(idIn(BEDROOM_CUPBOARD)('xray')).closest('label').remove();
document.getElementById('bedroomCupboardDoors').append(...copyControls(['tallBlock', 'secondBlock', 'deskDoorBlock'].map(id => document.getElementById(id)), BEDROOM_CUPBOARD));
// Its sliders that reach further than the living room's: along the chimney
// breast to the recess, and out towards the hallway wall
for (const [name, [min, max, step]] of Object.entries(BEDROOM_CUPBOARD_RANGES)) {
  Object.assign(document.getElementById(idIn(BEDROOM_CUPBOARD)(name)), { min, max, step });
}

// The door sliders, by their names in the view's doors. The entrance's two
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
// Each cupboard's fold-down desk, folded away or down (its two radios, by
// their name, each worth its word in the configuration: flat_model.js's
// DESK_SHOWN), by its name in the view's doors
const DESK_RADIOS = { desk: 'deskShown', bedroomCupboardDesk: idIn(BEDROOM_CUPBOARD)('deskShown') };
const deskRadios = name => [...document.getElementsByName(DESK_RADIOS[name])];
// ...and the garage door's, not shown, open or closed (Garage options,
// garage.js's garageControls())
const garageDoorRadios = () => [...document.getElementsByName('garageDoor')];
// The doors turned to their angles in the view's doors (the model's
// turnDoors()), and their controls put in step with them
function update() {
  turnDoors();
  if (dims) updateDims();                                       // the doors' labels go with them
  showDoors();
}
// The cut and the doors' controls, with the doors as turned
function showDoors() {
  applyCut();                                                   // the doors may have moved across a cut
  const shown = doorsNow();
  for (const [name, slider] of Object.entries(DOOR_SLIDERS)) {
    slider.value = String(shown[name]);
    document.getElementById(`${slider.id}Value`).textContent = `${shown[name]}°`;
  }
  for (const name of Object.keys(DESK_RADIOS)) for (const radio of deskRadios(name)) radio.checked = radio.value === shown[name];
  for (const radio of garageDoorRadios()) radio.checked = radio.value === shown.garage;
}
// Doors turned, { name: degrees } (a fold-down desk's or the garage
// door's, its word): the view's, so nothing's built again, as a door's
// angle changes nothing that's made (the fast path). The address follows
// from the controls (below, with the view kit) or the view that turned them
function turnDoorsTo(angles) {
  setDoors(Object.entries(angles));
  update();
}

for (const [name, slider] of Object.entries(DOOR_SLIDERS)) slider.addEventListener('input', () => turnDoorsTo({ [name]: Number(slider.value) }));
for (const name of Object.keys(DESK_RADIOS)) {
  for (const radio of deskRadios(name)) radio.addEventListener('change', () => turnDoorsTo({ [name]: radio.value }));
}


// Show the option chosen: the model builds it and all that's drawn from it
// (rebuild()), then the menus, the view and the rest of the page follow.
// onShow: the option on show till now, when the menus have already set it
function show(onShow) {
  const { option, same, aboveText, storedText } = rebuild(onShow);
  showInMenus(option, config.pieces.cornerCupboard.design.option, aboveText);
  if (!same) viewKit.refresh();                                 // to the new option's cupboard (doors open, if packing), or TV
  redrawAround(storedText);
}

// The menus for option `no`: the option list, the description, and only the
// blocks of controls that apply to it
function showInMenus(option, no, aboveText) {
  const above = config.pieces.aboveBench.design.what;
  loungeCupboard.showBlocks();
  showBedroomCupboard();
  document.getElementById('summary').innerHTML = describe(option, aboveText);
  const shown = (id, yes) => { document.getElementById(id).style.display = yes ? '' : 'none'; };
  shown('tvBlock', (benchDrawn() && aboveHasTv(above)) || daybedTvShown());   // the bench's TV, or the daybed's
  shown('shelfBlock', benchDrawn() && aboveHasShelves(above));   // only with shelves above the bench
  shown('benchDetails', benchDrawn());
  const piece = islandOnWall() ? 'none' : config.livingRoom.frontWall;   // the dresser or a larder, if either is drawn
  shown('frontBlock', !islandOnWall());   // in every option, the room as it is too (asked for, 22 Oct 2026)
  shown('islandMoveBlock', config.pieces.island.in.livingRoom.at === 'room');         // moving and turning: out there only
  const islandThere = config.pieces.island.in.livingRoom.at !== 'none', custom = config.pieces.island.design.type === 'custom';
  shown('islandTypeBlock', islandThere);
  shown('islandSizeBlock', islandThere && custom);
  shown('islandSeatBlock', islandThere);
  shown('islandLayoutRow', !custom);    // the shelves are IKEA's
  shown('islandChairsRow', custom || config.pieces.island.design.layout !== 'trolleys');   // the trolleys are in the chairs' place
  for (const [k, id, unit] of [['x', 'islandX', ''], ['y', 'islandY', ''], ['turn', 'islandTurn', '°']]) {
    document.getElementById(id).value = String(config.pieces.island.in.livingRoom[k]);
    document.getElementById(`${id}Value`).textContent = `${config.pieces.island.in.livingRoom[k]}${unit}`;
  }
  for (const [k, id] of [['length', 'islandLength'], ['width', 'islandWidth']]) {
    document.getElementById(id).value = String(config.pieces.island.design.custom[k]);
    document.getElementById(`${id}Value`).textContent = String(config.pieces.island.design.custom[k]);
  }
  shown('dresserBlock', piece === 'dresser');
  shown('larderBlock', piece === 'larder');
  shown('bookshelfBlock', piece === 'bookshelf');
  for (const key of BACK_WALL_KEYS) {
    shown(`${key}MoveBlock`, inLivingRoom(key).on);
    showPlace(key);                                             // where it starts follows the option's clear wall
  }
  showIvar();
  showTables();
  showCastorDesk();
  showSpeakers();
  showSofaPlace();                                              // where it starts follows the TV
}

// The page round the option as rebuilt: the colours, the things to
// store's menu (`storedText`, what's said of them), the cutting list, the
// address, the cut and the doors' controls
function redrawAround(storedText) {
  updatePalette();
  showStoredMenu(storedText);
  showCuttingLists();                                           // with its shelves as drawn, round the things to store
  writeAddress();
  showDoors();
}

// Nothing's written till the page has read its own address, at the start
let addressWrites = 0;
async function writeAddress(replace = false) {
  if (!addressRead) return;
  const write = ++addressWrites;
  const configuration = configurationNow(), view = viewNow();
  configurationKit?.refresh();
  const hash = `#${await Config.pack(configuration)}~${await Config.pack(view)}`;
  if (write !== addressWrites) return;
  try {
    if (replace) history.replaceState(null, '', hash);
    else location.hash = hash;
  } catch (e) { /* not important */ }
}

window.addEventListener('keydown', e => {
  const n = Number(e.key);
  if (optionOf(n)) loungeCupboard.choose(n);
});

// Every settings control changes the settings through here, by their paths
// in the configuration: the model's setAll(edits) changes them ([path,
// value] pairs, each value the configuration's), then every control is put
// in step with them (syncControls()), the option is built again round them
// (show()), and, with look, the view follows anything looked at that's
// moved. (The things to store change theirs with set() too, but redraw
// only themselves; the doors are the view's, turnDoorsTo().)
function change(edits, { look = false } = {}) {
  const onShow = optionsOnShow();                              // before they change
  setAll(edits);
  syncControls();
  show(onShow);
  if (look) viewKit.refresh();
}

// The living room's corner cupboard's controls, in Lounge options
// (cupboard_controls.js): its option list, sizes, shelves and front, by
// its design's path in the configuration
const loungeCupboard = cupboardControls({ piece: 'cornerCupboard', change, hasBench: benchDrawn });
// ...and the bedroom's, in Bedroom options: every option bar the current
// room (no cupboard), and no left-wall front to the door frame (there's no
// door on its walls)
const bedroomCupboardControls = cupboardControls({ piece: BEDROOM_CUPBOARD, id: idIn(BEDROOM_CUPBOARD), change,
  options: OPTIONS.map(o => o.no).filter(no => no !== CURRENT_ROOM) });
// Its block shown only while it's there (Bedroom options' New cupboard switch)
function showBedroomCupboard() {
  const on = config.pieces.bedroomCupboard.in.bedroom.on;
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

// What the other pieces of the model use
export {
  DESK_RADIOS, DOOR_SLIDERS, about, bedroomCupboardControls, change, deskRadios, loungeCupboard, show, 
  turnDoorsTo, update, writeAddress
};
