// The living room's pieces' controls (a piece of living_room.js): the
// shelves and TV, the dresser, sofa and larder, the back wall's pieces,
// Ivar, the tables, the castor desk, the speakers, the island and
// See-through.
import { BOOKCASE_SIZES } from '../other_room.js';
import { SIZE_LABEL } from '../kit/controls_kit.js';
import {
  BACK_WALL_KEYS, DRESSERS, DRESSER_SLIDERS, LARDERS, LARDER_SLIDERS, SOFAS, 
  SOFA_SLIDERS, TV_SIZES, cupboard, currentSofa, larderHeight, larderOwnSize, pieces, get, sofaHome, sofaOwnSize, 
  spotOf, ivarSpot, tableSpot, castorDeskSpot, config, updateDims, inLivingRoom, NO_SOFA, speakerSpacingNow, 
  cupboardTopForSpeakers
} from '../flat_model.js';
import { display, setDisplay } from './display.js';
import { ROOM_WIDTH, ROOM_DEPTH } from '../floor.js';
import { applyCut, change, viewKit } from '../living_room.js';
import { clamp, QUARTER_TURN } from '../kit/units_kit.js';

const shelfSlider = document.getElementById('shelfDepth');
shelfSlider.addEventListener('input', () => change([['pieces.aboveBench.design.shelfDepth', Number(shelfSlider.value)]]));
// The TV size, one of TV_SIZES by its place in the list
const tvSlider = document.getElementById('tvSize');
// A piece's sizes as edits: { key: mm } for any of its sliders' keys
// (DRESSER_SLIDERS and the like, [key, id, lowest, highest]), each held to
// its slider's range, at its path in the piece's design
const sizeEdits = (design, sliders, sizes) => sliders.filter(([k]) => Number.isFinite(sizes[k]))
  .map(([k, , lo, hi]) => [`${design}.${k}`, clamp(sizes[k], lo, hi)]);
// The dresser's sliders (it's placed from its width as it's drawn, the model's dresserSpan())
const setDresser = sizes => sizeEdits('pieces.dresser.design', DRESSER_SLIDERS, sizes);
function showDresser() {
  for (const [k, id] of DRESSER_SLIDERS) {                       // the upper depth may have been held to the base's
    document.getElementById(id).value = String(config.pieces.dresser.design[k]);
    document.getElementById(`${id}Value`).textContent = config.pieces.dresser.design[k];
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
  const match = Object.entries(DRESSERS).find(([, d]) => DRESSER_SLIDERS.every(([k]) => d[k] === config.pieces.dresser.design[k]));
  dresserPick.value = match ? match[0] : '';
}
// Looking at the dresser: at it as it is now
dresserPick.addEventListener('change', () => change(setDresser(DRESSERS[dresserPick.value]), { look: true }));
// The sofa: none, or one from the list, and how far its front is from the TV wall
const sofaPick = document.getElementById('sofaPick'), sofaSlider = document.getElementById('sofaFront');
sofaPick.append(Object.assign(document.createElement('option'), { value: NO_SOFA, textContent: 'None' }),
  ...Object.entries(SOFAS).map(([id, S]) => Object.assign(document.createElement('option'), { value: id, textContent: `${S.label} (${S.w} × ${S.d})` })));
// The dropdown shows Custom when the sliders have changed its sizes
const sofaCustom = Object.assign(document.createElement('option'), { value: 'custom', disabled: true });
sofaPick.insertBefore(sofaCustom, sofaPick.options[1] ?? null);
function showSofa() {
  const size = config.pieces.sofa.design, { model: key } = size, { front } = config.pieces.sofa.in.livingRoom, own = SOFAS[key] && sofaOwnSize(SOFAS[key]);
  sofaCustom.textContent = `Custom: the ${SOFAS[key]?.label ?? 'sofa'}, resized`;
  sofaPick.value = key === NO_SOFA ? NO_SOFA : SOFA_SLIDERS.every(([k]) => own[k] === size[k]) ? key : 'custom';
  sofaSlider.value = front;
  document.getElementById('sofaFrontValue').textContent = front;
  for (const [k, id] of SOFA_SLIDERS) {
    document.getElementById(id).value = String(size[k]);
    document.getElementById(`${id}Value`).textContent = size[k];
  }
  document.getElementById('sofaFrontBlock').style.display = key !== NO_SOFA ? '' : 'none';
  document.getElementById('sofaAsBedRow').style.display = SOFAS[key]?.daybed ? '' : 'none';   // a daybed only
  sofaAsBed.checked = config.pieces.sofa.design.asBed;
  document.getElementById('sofaFrontRow').style.display = config.pieces.sofa.in.livingRoom.move ? 'none' : '';   // moved, its sliders say where
}
const setSofaSize = sizes => sizeEdits('pieces.sofa.design', SOFA_SLIDERS, sizes);
for (const [key, id] of SOFA_SLIDERS) {
  document.getElementById(id).addEventListener('input', e => change(setSofaSize({ [key]: Number(e.target.value) }), { look: true }));
}
// A sofa chosen comes in its own sizes (NO_SOFA is none)
sofaPick.addEventListener('change', () => {
  const S = SOFAS[sofaPick.value];
  change([['pieces.sofa.design.model', sofaPick.value], ...(S ? setSofaSize(sofaOwnSize(S)) : [])], { look: true });
});
const SOFA_PLACE = 'pieces.sofa.in.livingRoom';
// A daybed (the Drift) can be laid out as a bed
const sofaAsBed = document.getElementById('sofaAsBed');
sofaAsBed.addEventListener('change', () => change([['pieces.sofa.design.asBed', sofaAsBed.checked]], { look: true }));
sofaSlider.addEventListener('input', () => change([[`${SOFA_PLACE}.front`, Number(sofaSlider.value)]], { look: true }));
// Cupboard only: the rest of the room hidden, and the cupboard's dimensions shown
const cupboardOnlySwitch = document.getElementById('cupboardOnly');
function setCupboardOnly(on) {
  cupboardOnlySwitch.checked = on;
  setDisplay({ cupboardOnly: on });
  applyCut();
  updateDims(display);
  if (display.flat) viewKit.setView(viewKit.viewId || 'plan');          // framed for it, or for the room again
}
cupboardOnlySwitch.addEventListener('change', () => {
  setCupboardOnly(cupboardOnlySwitch.checked);
  viewKit.writeView();
});
// The bench: drawn, or not (and nothing above it)
const benchSwitch = document.getElementById('benchOn');
benchSwitch.addEventListener('change', () => change([['pieces.bench.in.livingRoom.on', benchSwitch.checked]], { look: true }));
// The radiator under the first window: in, or taken out
const firstRadiatorSwitch = document.getElementById('firstRadiatorOn');
firstRadiatorSwitch.addEventListener('change', () => change([['livingRoom.firstRadiator', firstRadiatorSwitch.checked]], { look: true }));
// The bookshelf and the pine cupboard, against the back wall, or in front
// of the bench while it's on (the bench is drawn whenever it's on). Moving one, and turning it in quarter turns: the
// first move starts from where it stands; Reset location puts it back
// against the wall
const PLACE_SLIDERS = [['x', 'X', ROOM_WIDTH, 5, ''], ['y', 'Y', ROOM_DEPTH, 5, ''], ['turn', 'Turn', 360 - QUARTER_TURN, QUARTER_TURN, '°']];
const roundedSpot = ({ x, y, turn }) => ({ x: Math.round(x), y: Math.round(y), turn });
const backWallSwitches = {};
// Each one's place in the living room in the configuration, by its key
const BACK_WALL_PLACES = { bookshelf: 'pieces.bookcase.in.livingRoom', pine: 'pieces.pineCupboard.in.livingRoom', billy: 'pieces.billy.in.livingRoom',
  billyChest: 'pieces.billyChest.in.livingRoom', deskDaybed: 'pieces.deskDaybed.in.livingRoom' };
// Billy can also lie on its long side there
const billyLying = document.getElementById('billyLying');
billyLying.addEventListener('change', () => change([[`${BACK_WALL_PLACES.billy}.lying`, billyLying.checked]], { look: true }));
// ...and the daybed's desk can be at its right-hand end
const deskDaybedRight = document.getElementById('deskDaybedRight');
deskDaybedRight.addEventListener('change', () => change([['pieces.deskDaybed.design.deskAt', deskDaybedRight.checked ? 'right' : 'left']], { look: true }));
// ...and the work chair at its desk, or none (the summary says the room to sit there either way)
const deskDaybedChair = [...document.getElementsByName('deskDaybedChair')];
for (const radio of deskDaybedChair) radio.addEventListener('change', () => change([[`${BACK_WALL_PLACES.deskDaybed}.chair`, radio.value]], { look: true }));
for (const key of BACK_WALL_KEYS) {
  const place = BACK_WALL_PLACES[key];
  const onSwitch = backWallSwitches[key] = document.getElementById(`${key}On`);
  onSwitch.addEventListener('change', () => change([[`${place}.on`, onSwitch.checked]], { look: true }));
  placeControls(key, place, () => spotOf(key));
}
// A piece's X, Y and Turn sliders (`${key}X` and so on) and its Reset
// location button (`${key}Home`), moving it at `place`.move from where it
// is now, spotNow()
function placeControls(key, place, spotNow) {
  for (const [k, suffix, max, step] of PLACE_SLIDERS) {
    const input = Object.assign(document.getElementById(`${key}${suffix}`), { min: '0', max: String(max), step: String(step) });
    input.addEventListener('input', () => change([[`${place}.move`, { ...roundedSpot(spotNow()), [k]: Number(input.value) }]]));
  }
  document.getElementById(`${key}Home`).addEventListener('click', () => change([[`${place}.move`, null]]));
}
// The Ivar: in the lounge or not, lying or standing, and moved from where
// it starts, by the first radiator (flat_model.js's ivarHome())
const IVAR_PLACE = 'pieces.ivar.in.livingRoom';
const ivarOn = document.getElementById('ivarOn'), ivarLying = document.getElementById('ivarLying');
ivarOn.addEventListener('change', () => change([[`${IVAR_PLACE}.on`, ivarOn.checked]], { look: true }));
ivarLying.addEventListener('change', () => change([[`${IVAR_PLACE}.lying`, ivarLying.checked]], { look: true }));
placeControls('ivar', IVAR_PLACE, ivarSpot);
function showIvar() {
  ivarOn.checked = config.pieces.ivar.in.livingRoom.on;
  ivarLying.checked = config.pieces.ivar.in.livingRoom.lying;
  document.getElementById('ivarMoveBlock').style.display = config.pieces.ivar.in.livingRoom.on ? '' : 'none';
  showPlace('ivar', ivarSpot());
}
// The kitchen tables: each in the lounge or not, in its pose (Cornwall's
// legs off, Chesham on its end) or not, and moved from where it is now
// (flat_model.js's LOUNGE_NOW)
const TABLE_POSES = { cornwall: 'legsOff', chesham: 'onItsEnd' };
// A switch's id, by its table and its setting in the table's place: cornwallOn, cornwallLegsOff
const tableSwitchName = (key, setting) => `${key}${setting[0].toUpperCase()}${setting.slice(1)}`;
const tableSwitch = (key, setting) => document.getElementById(tableSwitchName(key, setting));
for (const [key, pose] of Object.entries(TABLE_POSES)) {
  const place = `pieces.${key}.in.livingRoom`;
  for (const setting of ['on', pose]) {
    const input = tableSwitch(key, setting);
    input.addEventListener('change', () => change([[`${place}.${setting}`, input.checked]], { look: true }));
  }
  placeControls(key, place, () => tableSpot(key));
}
function showTables() {
  for (const [key, pose] of Object.entries(TABLE_POSES)) {
    for (const setting of ['on', pose]) tableSwitch(key, setting).checked = inLivingRoom(key)[setting];
    document.getElementById(`${key}MoveBlock`).style.display = inLivingRoom(key).on ? '' : 'none';
    showPlace(key, tableSpot(key));
  }
}
// The desk on castors: in the lounge or not, parked by the door or at the
// TV (choosing one wheels it there), and moved from either
// (flat_model.js's CASTOR_DESK_HOMES)
const CASTOR_DESK_PLACE = 'pieces.castorDesk.in.livingRoom';
const castorDeskOn = document.getElementById('castorDeskOn'), castorDeskAt = [...document.getElementsByName('castorDeskAt')];
castorDeskOn.addEventListener('change', () => change([[`${CASTOR_DESK_PLACE}.on`, castorDeskOn.checked]], { look: true }));
for (const radio of castorDeskAt) {
  radio.addEventListener('change', () => change([[`${CASTOR_DESK_PLACE}.at`, radio.value], [`${CASTOR_DESK_PLACE}.move`, null]], { look: true }));
}
placeControls('castorDesk', CASTOR_DESK_PLACE, castorDeskSpot);
function showCastorDesk() {
  castorDeskOn.checked = config.pieces.castorDesk.in.livingRoom.on;
  for (const radio of castorDeskAt) radio.checked = radio.value === get(`${CASTOR_DESK_PLACE}.at`);
  document.getElementById('castorDeskMoveBlock').style.display = config.pieces.castorDesk.in.livingRoom.on ? '' : 'none';
  showPlace('castorDesk', castorDeskSpot());
}
// The speakers: on nothing, or as a pair on the bench, on Billy lying, or
// on the corner cupboard (offered only when it stops short of the ceiling,
// or while they're on it); and, on the bench, Billy and the daybed, how far apart,
// each place keeping its own (flat_model.js's speakerSpacingNow())
const SPEAKERS_PLACE = 'pieces.speakers.in.livingRoom';
const speakersOn = [...document.getElementsByName('speakersOn')], speakerSpacing = document.getElementById('speakerSpacing');
for (const radio of speakersOn) radio.addEventListener('change', () => change([[`${SPEAKERS_PLACE}.on`, radio.value]], { look: true }));
speakerSpacing.addEventListener('input', () => change([[`${SPEAKERS_PLACE}.spacing.${config.pieces.speakers.in.livingRoom.on}`, Number(speakerSpacing.value)]]));
function showSpeakers() {
  const { on } = config.pieces.speakers.in.livingRoom, spacing = speakerSpacingNow();
  for (const radio of speakersOn) radio.checked = radio.value === on;
  document.getElementById('speakersOnCupboardRow').style.display = cupboardTopForSpeakers() || on === 'cupboard' ? '' : 'none';
  document.getElementById('speakerSpacingBlock').style.display = spacing ? '' : 'none';
  if (!spacing) return;
  speakerSpacing.max = String(Math.max(Number(speakerSpacing.min), Math.floor(spacing.most / 10) * 10));   // held to what they stand on, in the slider's 10s
  speakerSpacing.value = String(Math.round(spacing.spacing));
  document.getElementById('speakerSpacingValue').textContent = Math.round(spacing.spacing);
}
function showPlace(key, at = spotOf(key)) {
  const spot = roundedSpot(at);
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
  return roundedSpot(config.pieces.sofa.in.livingRoom.move ?? sofaHome(currentSofa()));
}
function showSofaPlace() {
  if (!SOFAS[config.pieces.sofa.design.model]) return;
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
    document.getElementById(bookshelfSizeId(k)).value = String(config.pieces.bookcase.design[k]);
    document.getElementById(`${bookshelfSizeId(k)}Value`).textContent = config.pieces.bookcase.design[k];
  }
}
// The island: where it is, or against the front wall
const ISLAND_PLACE = 'pieces.island.in.livingRoom';
document.querySelectorAll('input[name=islandAt]').forEach(r => r.addEventListener('change', () => change([[`${ISLAND_PLACE}.at`, r.value]], { look: true })));
// Out there: the island's middle, and how far it's turned
for (const [k, id] of [['x', 'islandX'], ['y', 'islandY'], ['turn', 'islandTurn']]) {
  document.getElementById(id).addEventListener('input', e => change([[`${ISLAND_PLACE}.${k}`, Number(e.target.value)]]));
}
// Which island, the custom one's size, IKEA's layout, and the chairs
document.querySelectorAll('input[name=islandType]').forEach(r => r.addEventListener('change', () => change([['pieces.island.design.type', r.value]])));
for (const [k, id] of [['length', 'islandLength'], ['width', 'islandWidth'], ['overhang', 'islandOverhang']]) {
  document.getElementById(id).addEventListener('input', e => change([[`pieces.island.design.custom.${k}`, Number(e.target.value)]]));
}
document.querySelectorAll('input[name=islandLayout]').forEach(r => r.addEventListener('change', () => change([['pieces.island.design.layout', r.value]])));
document.querySelectorAll('input[name=islandChairs]').forEach(r => r.addEventListener('change', () => change([[`${ISLAND_PLACE}.chairs`, r.value]])));
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
  const size = config.pieces.larder.design, { model: key } = size;
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
tvSlider.addEventListener('input', () => change([['pieces.tv.design.inches', TV_SIZES[Number(tvSlider.value)][0]]]));
// The TV: on or not, moved along the back wall and up and down from where
// it goes on its own, and back there by Reset location
const TV_PLACE = 'pieces.tv.in.livingRoom';
const tvOnSwitch = document.getElementById('tvOn');
tvOnSwitch.addEventListener('change', () => change([[`${TV_PLACE}.on`, tvOnSwitch.checked]], { look: true }));
for (const [key, id] of [['along', 'tvAlong'], ['bottom', 'tvBottom']]) {
  document.getElementById(id).addEventListener('input', e => change([[`${TV_PLACE}.${key}`, Number(e.target.value)]]));
}
document.getElementById('tvHome').addEventListener('click', () => change([[`${TV_PLACE}.along`, null], [`${TV_PLACE}.bottom`, null]], { look: true }));
// The radios hold the shelves' words
const ABOVE = 'pieces.aboveBench.design.what';
document.querySelectorAll('input[name=above]').forEach(r => r.addEventListener('change', () => change([[ABOVE, r.value]])));
// The shelves over the desk: how many, and how deep
const DESK_SHELVES = 'pieces.deskShelves.design';
document.querySelectorAll('input[name=deskShelves]').forEach(r => r.addEventListener('change', () => change([[`${DESK_SHELVES}.count`, Number(r.value)]])));
const deskShelfSlider = document.getElementById('deskShelfDepth');
deskShelfSlider.addEventListener('input', () => change([[`${DESK_SHELVES}.depth`, Number(deskShelfSlider.value)]]));

let xray = false;
const xraySwitch = document.getElementById('xray');
function setSeeThrough(on) {
  xray = on;
  setDisplay({ seeThrough: xray });
  xraySwitch.checked = xray;
}
xraySwitch.addEventListener('change', () => {
  setSeeThrough(xraySwitch.checked);
  viewKit.writeView();
});

// What the other pieces of the model use
export {
  backWallSwitches, benchSwitch, billyLying, deskDaybedChair, deskDaybedRight, firstRadiatorSwitch, tvOnSwitch, 
  setCupboardOnly, setSeeThrough, showBookshelfSizes, showCastorDesk, showDresser, showIvar, showLarder, 
  showPlace, showSofa, showSofaPlace, showSpeakers, showTables, xray
};
