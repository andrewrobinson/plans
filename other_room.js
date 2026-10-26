// The other room's (the bedroom's) furniture and fitted cupboards: the bed,
// with its headboard and mattress; the bookcase and the pine cupboard,
// which can be resized and moved; Billy and BillyChest, from the garage
// (billy.js), the Ivar (ivar.js), the two Knarrevik bedside tables
// (knarrevik.js) and the Kvistbro (kvistbro.js), on any wall; the laundry
// basket (laundry_basket.js), anywhere; and the two fitted cupboards in the
// recess beside the chimney breast, the lower one's depth adjustable. Drawn
// in the room's own u, v mm (OTHER_ROOM in floor.js: u from the window wall,
// v from the hallway wall).
//
// The model (flat_model.js) holds the settings, laid out as the
// configuration is: each piece's design and its place in the bedroom
// (`pieces.bed.in.bedroom`), starting as OTHER_ROOM_START. This file names
// each setting as its controls do (`bed.u`, `bookcaseOn`: settingPath()
// gives its path), gives their entries in the configuration
// (OTHER_ROOM_SCHEMA), says how each piece looks, draws them
// (drawOtherRoom()), and makes the menu's sliders for them
// (otherRoomControls()).
import * as THREE from 'three';
import { MM, material, box, clearDrawing } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import { SIZE_LABEL, slider, LYING_LABEL, wallPick, resetButtons } from './kit/controls_kit.js';
import { OTHER_ROOM, otherRoom } from './floor.js';
import { BOOKCASE, bookcase } from './bookcase.js';
import { BILLY_CHEST, billy, billySizes, billyChest } from './billy.js';
import { IVAR, ivar } from './ivar.js';
import { KNARREVIK, knarrevik } from './knarrevik.js';
import { KVISTBRO, kvistbro } from './kvistbro.js';
import { LAUNDRY_BASKET, laundryBasket } from './laundry_basket.js';
import { QUARTER_TURN, turnPiece } from './kit/units_kit.js';
const { valueAt } = Config;

// ---------------------------------------------------------------------------
// The pieces' sizes, in mm. Measured 15 Oct 2026 unless it says otherwise.
// ---------------------------------------------------------------------------
const BED = {
  width: 1360, length: 1940,       // the base and the mattress
  baseTop: 350,                    // the base's top, off the carpet
  mattress: 260,                   // thick, on the base: its top at 610
  // The headboard: black metal, 25 thick, its top 950 off the carpet; posts
  // at either side and three rails across, as in the photo (the posts' and
  // rails' sizes and the rails' heights are estimated from it)
  headboard: { top: 950, thick: 25, post: 40, rails: [[910, 950], [790, 820], [660, 690]] },
  rail: { thick: 40, high: 50 },   // the base's metal frame (estimated)
};
// Where you lie on the bed and stand beside it (the Look menu's Where), in
// the bed's own mm: across it from its middle, and along it from the back
// of its headboard. Your eyes 300 in from the headboard, on the pillow, and
// beside it halfway along its side away from the window (with the bed as it
// starts, the room side), 450 out: room to stand (all chosen)
// The bed's foot, from the back of its headboard, for what stands at it
export const BED_FOOT = BED.headboard.thick + BED.length;
export const BED_SPOTS = {
  pillow: [0, BED.headboard.thick + 300],
  side: [BED.width / 2 + 450, BED.headboard.thick + BED.length / 2],
};
// The pine cupboard: three doors over a row of three drawers and a row of
// two, a cornice on top (from the photo). It stands 560 out from the wall
// for 500 of depth: the carpet, the skirting and its lean hold it 60 off.
export const PINE = {
  w: 1300, d: 500, h: 1790,
  offWall: 560 - 500,
  plinth: 60, cornice: 50, corniceProud: 25,    // estimated from the photo
  drawerRows: [240, 180],          // the two rows of drawers, bottom up (estimated)
  front: 18, gap: 3,               // the doors' and drawers' thickness, and the gaps round them (estimated)
  // Its hanging rails: the 2-door section's and the 1-door section's, 475
  // deep inside, just enough (corner_cupboard.js's HANG_DEPTH; all three
  // measured by the user, 24 Oct 2026). The yardstick for the new cupboards
  rails: [840, 400],
};
// The recess's fitted cupboards: the upper one 1800 wide, 420 deep and 1625
// high, up to the ceiling; the lower one 820 high, 301 deep (its front 119
// behind the upper one's: 2888 - 2769), all measured. Centred in the 1824
// recess. The upper one is an IKEA PLATSA (the user's plan of it, 24 Oct
// 2026: 1800 × 1629 × 420): three 600 columns, a row of short doors along
// the top over a fixed shelf; tall doors either side, behind each a
// clothes rail running front to back (IKEA HJÄLPA) under that shelf, and a
// shelf over a wire basket at the bottom; the middle open, with two
// shelves. Its boards' thickness and the heights inside are estimated from
// IKEA's pictures. Three changes can be tried on the upper one: drawers in
// place of the middle's open shelves; drawers in all three columns, in
// place of the tall doors and the open shelves (the short doors stay over
// them); and a mirror on each tall door's panel, inside its frame,
// `mirrorThick` proud. The drawers are IKEA HJÄLPA (made for a 600 × 400
// PLATSA frame) behind SANNIDAL fronts, drawn shut.
const RECESS_CUPBOARDS = {
  w: 1800, upperD: 420, lowerTop: 820, lowerD: 301,
  tallDoors: 1200, topDoors: 400,  // the upper one's doors' heights (the user's, 24 Oct 2026), from its bottom up; its top shows over them
  plinth: 80, lowerDoors: 4,
  front: 18, gap: 3,
  board: 18,                       // PLATSA's frames' boards (estimated)
  middleShelves: [600, 900],       // the middle's shelves' tops, up from the upper cupboard's base (estimated)
  lowShelf: 300,                   // the outer columns' shelf over the basket, likewise (estimated)
  basket: [40, 260],               // ...and the wire basket under it, its bottom and top (estimated)
  railDrop: 60, rail: 20,          // the rails under the fixed shelf, and how thick (estimated)
  // The SANNIDAL drawer fronts: 200 high and 16 thick (IKEA's sizes), so
  // six fill a 1200 column; their frame round the panel estimated
  drawerFront: { h: 200, thick: 16, frame: 40 },
  // Its doors are IKEA SANNIDAL (the user's, 24 Oct 2026): a raised frame
  // round a panel set in from it (both estimated from IKEA's picture)
  doorFrame: 60, panelSetIn: 5,
  mirrorThick: 4,
};
const wireMat = material(0xc9ccce);   // the PLATSA's wire baskets
const railMat = material(0x9a9da0);   // ...and its rails

// The new cupboard: a corner cupboard of its own (flat_model.js's
// buildBedroomCupboard()), built as a living room cupboard is in that
// room's corner (the back wall and the left wall), stood in the corner
// where the chimney breast's face meets the kitchen-side wall,
// where the pine cupboard and the bookcase meet (asked for, 16 Oct 2026).
// Turned half round, the living room's back wall runs along the chimney
// breast and its left wall along the kitchen-side wall: the only way into
// that corner without drawing it mirrored.
const NEW_CUPBOARD = { u: OTHER_ROOM.length, v: OTHER_ROOM.breastFace, turn: 180 };

// The mirror: none there yet, so its size and place are chosen to start
// with, on the chimney breast over the bookcase, 180 above the bookcase's
// top. A thin dark frame round the glass, standing off the wall.
const OVER_THE_BOOKCASE = OTHER_ROOM.recessWidth + BOOKCASE.w / 2;   // along the chimney breast, the bookcase's middle as it starts
const MIRROR = {
  w: 1000, h: 800, bottom: BOOKCASE.h + 180,
  frame: 30, thick: 25,            // the frame's width round the glass, and how far it stands out (chosen)
};

const bedFrameMat = material(0x262626);
const mattressMat = material(0xece8e0);
const pineMat = material(0xc98a45);
const knobMat = material(0x8a5a2b);
const fittedMat = material(0xf2f0ea);
const shadowMat = material(0x6f6a62);              // the open shelves' inside, in shade
const mirrorFrameMat = material(0x2b2b2b);
// The glass: pale and shiny, a hint of a mirror rather than a reflection
const glassMat = new THREE.MeshStandardMaterial({ color: 0xdfe8ec, roughness: 0.1, metalness: 0.3 });

// ---------------------------------------------------------------------------
// The settings: where each movable piece is, and the sizes of those that
// can be resized. A piece's place is the middle of its back (the bed's
// head end), so a change of size keeps it against its wall. turn is which
// way it faces: 0° away from the hallway wall (the bed's head against it),
// 90° the window wall, 180° the hallway wall, 270° the kitchen-side wall.
// The mirror hangs on one of WALLS instead: `along` is its middle along that
// wall, and `bottom` its bottom edge off the carpet. Billy, BillyChest, the
// Ivar, the bedside tables and the Kvistbro stand with their backs to one
// of WALLS likewise, the middle `along` it.
// ---------------------------------------------------------------------------

// The walls the mirror can hang on and Billy, BillyChest and the Ivar stand against, in the menu's order: its name there; the
// turn that puts a piece's back to it; which way it runs (u or v), measured
// from the window wall or the hallway wall; from where to where along it;
// and where it stands across (its own u or v). The chimney breast's face
// only, not the recess beside it, which the fitted cupboards fill.
export const WALLS = {
  breast: { label: 'The chimney breast (over the bookcase)', turn: 180, runs: 'u', from: OTHER_ROOM.recessWidth, to: OTHER_ROOM.length, at: OTHER_ROOM.breastFace },
  hallway: { label: 'The hallway wall', turn: 0, runs: 'u', from: 0, to: OTHER_ROOM.length, at: 0 },
  window: { label: 'The window wall', turn: 270, runs: 'v', from: 0, to: OTHER_ROOM.recessBack, at: 0 },
  kitchen: { label: 'The kitchen-side wall', turn: 90, runs: 'v', from: 0, to: OTHER_ROOM.breastFace, at: OTHER_ROOM.length },
};
const WALL_KEYS = Object.keys(WALLS);
const ALONG_LABEL = { u: 'Middle from the window wall', v: 'Middle from the hallway wall' };
// Held to its wall, a piece's middle at least `half` (half its width) in
// from each end; on a wall too short for it, against its far end
// (not clamp(), where the lowest wins)
const alongWall = (wall, along, half = 0) => Math.min(WALLS[wall].to - half, Math.max(WALLS[wall].from + half, along));
// Where the things by the bed start: each one's middle along its wall,
// worked out from the bed and the pine cupboard as they start
const BED_START_U = 680 + BED.width / 2;           // the bed's middle: its side 680 from the window wall (measured)
const PINE_START_V = OTHER_ROOM.breastFace - BOOKCASE.d - PINE.w / 2;   // the pine cupboard's middle: its side up to the bookcase's front
const BEDSIDE_GAP = 50;                            // a Knarrevik's side off the bed's or the pine cupboard's (estimated)
const KVISTBRO_GAP = 60;                           // the Kvistbro's side off the bed's (estimated from the user's photo)
const IN_FRONT_OF_THE_KVISTBRO = 20;               // the laundry basket's back off the Kvistbro's front (estimated from the photo)
const BESIDE_THE_BED = BED_START_U + BED.width / 2 + BEDSIDE_GAP + KNARREVIK.w / 2;
const BESIDE_THE_PINE_CUPBOARD = PINE_START_V - PINE.w / 2 - BEDSIDE_GAP - KNARREVIK.w / 2;
const WINDOW_SIDE_OF_THE_BED = BED_START_U - BED.width / 2 - KVISTBRO_GAP - KVISTBRO.w / 2;
// The settings as they start, by their names in this file's controls
// (OTHER_ROOM_START is them laid out as the configuration is, below)
const AS_THEY_START = {
  // Where they stand now (from the photos, 15 Oct 2026): the bed's head
  // against the hallway wall, 680 from the window wall (measured); the
  // bookcase's back to the chimney breast, from the recess; the pine
  // cupboard's back to the kitchen-side wall, its side up to the bookcase's
  // front
  bed: { u: BED_START_U, v: 0, turn: 0 },
  bookcase: { u: OTHER_ROOM.recessWidth + BOOKCASE.w / 2, v: OTHER_ROOM.breastFace, turn: 180, w: BOOKCASE.w, d: BOOKCASE.d, h: BOOKCASE.h },
  cupboard: { u: OTHER_ROOM.length, v: PINE_START_V, turn: 90, w: PINE.w, d: PINE.d, h: PINE.h },
  bookcaseOn: true,                // the bookcase there, or not (whatever's in the living room)
  cupboardOn: true,                // the pine cupboard likewise
  mirrorOn: false,                 // the mirror likewise: none yet (the user's, 18 Oct 2026)
  newCupboardOn: false,            // a corner cupboard of its own (NEW_CUPBOARD), in place of the pine cupboard
  newCupboard: { ladders: false }, // ...with the two ladders standing in its L's corner (asked for, 26 Oct 2026)
  lowerD: RECESS_CUPBOARDS.lowerD,
  upperDrawers: false,             // the upper recess cupboard: drawers in place of its middle's open shelves
  upperMirrors: false,             // ...and mirrors on its two tall doors
  upperAllDrawers: false,          // ...or drawers in all three columns, under the short doors (asked for, 26 Oct 2026)
  mirror: { wall: 'breast', along: OVER_THE_BOOKCASE, bottom: MIRROR.bottom, w: MIRROR.w, h: MIRROR.h },
  // Billy, out to start; when it's in, standing against the chimney breast,
  // where the mirror starts (asked for, 18 Oct 2026)
  billyOn: false,
  billy: { wall: 'breast', along: OVER_THE_BOOKCASE, lying: false },
  billyChestOn: false,             // BillyChest likewise, out to start, then where Billy starts
  billyChest: { wall: 'breast', along: OVER_THE_BOOKCASE },
  ivarOn: false,                   // the Ivar likewise
  ivar: { wall: 'breast', along: OVER_THE_BOOKCASE },
  // What's by the bed now (the user's, 18 Oct 2026): a Knarrevik on the
  // bed's side away from the window, between it and the door, and another
  // on the kitchen-side wall on the hallway side of the pine cupboard; the
  // Kvistbro on the window side, between the bed and the window wall; all
  // against the walls. The laundry basket in front of the Kvistbro
  bedsideTableOn: true,
  bedsideTable: { wall: 'hallway', along: BESIDE_THE_BED },
  bedsideTableByCupboardOn: true,
  bedsideTableByCupboard: { wall: 'kitchen', along: BESIDE_THE_PINE_CUPBOARD },
  kvistbroOn: true,
  kvistbro: { wall: 'hallway', along: WINDOW_SIDE_OF_THE_BED },
  laundryBasketOn: true,
  laundryBasket: { u: WINDOW_SIDE_OF_THE_BED, v: KVISTBRO.w + IN_FRONT_OF_THE_KVISTBRO, turn: 0 },
};

// Each slider: [the setting's name (settingPath()), its label, lowest,
// highest, step, unit], in the menu's order under each piece's heading.
// Turned goes in quarter turns, all that's needed to stand a piece square
// to a wall (chosen 15 Oct 2026)
const PLACE = (piece) => [
  [`${piece}.u`, 'Back’s middle from the window wall', 0, OTHER_ROOM.length, 5, ''],
  [`${piece}.v`, 'Back’s middle from the hallway wall', 0, OTHER_ROOM.recessBack, 5, ''],
  [`${piece}.turn`, 'Turned', 0, 360 - QUARTER_TURN, QUARTER_TURN, '°'],
];
// The mirror's place: along its wall (the slider's label and range follow
// the wall), and up it
const MIRROR_PLACE = [
  ['mirror.along', ALONG_LABEL.u, 0, OTHER_ROOM.length, 5, ''],
  ['mirror.bottom', 'Bottom off the carpet', 0, OTHER_ROOM.ceiling, 10, ''],
];
// The switch to lay Billy on its long side, its open side looking out; also
// the living room's and the garage's
// Billy's, BillyChest's and the Ivar's places: along its wall
const placeAlongWall = piece => [[`${piece}.along`, ALONG_LABEL.u, 0, OTHER_ROOM.length, 5, '']];
const SIZES = {
  bookcase: [['w', 400, 2000], ['d', 200, 500], ['h', 600, 2200]],
  cupboard: [['w', 600, 2000], ['d', 300, 700], ['h', 1200, 2400]],
  mirror: [['w', 200, 2000], ['h', 200, 2000]],
};
// The bookcase's: also its sliders in the living room, on the front wall
export const BOOKCASE_SIZES = SIZES.bookcase;
const sizeSliders = piece => SIZES[piece].map(([k, lo, hi]) => [`${piece}.${k}`, SIZE_LABEL[k], lo, hi, 10, '']);
// The menu's sections, each a triangle that opens and closes, in order,
// all closed to start (asked for, 18 Oct 2026, to shorten the menu): the
// bed and what's by it; the pieces that may or may not be in the bedroom,
// Extras; the recess cupboards
const SECTIONS = [
  { key: 'bed', summary: 'Bed, and what’s by it' },
  { key: 'extras', summary: 'Extras' },
  { key: 'recess', summary: 'Recess cupboards' },
];
// The switch that says whether a piece is in the bedroom; switched off,
// the piece's other controls are hidden (asked for, 18 Oct 2026)
const IN_THE_BEDROOM = 'In the bedroom';
// The menu's pieces, in order: each its key, its section, its heading (if
// it has one), its In the bedroom switch (`on`, if it has one), its size
// sliders and its place sliders (each with a reset button, back to
// OTHER_ROOM_START), and for those on a wall the choice of wall, reset
// with its place
const PIECES = [
  // The new cupboard first, just its switch (asked for, 16 Oct 2026), at the
  // menu's top, over the new cupboard's own section (`top`, asked for 18 Oct 2026)
  { key: 'newCupboard', sizes: [], place: [], top: true, switches: [['newCupboardOn', 'New cupboard'],
    ['newCupboard.ladders', 'Ladders in the corner', 'The two ladders upright in the corner of its L, the rail into the corner starting past them']] },
  { key: 'bed', section: 'bed', heading: 'Bed (with its headboard and mattress)', sizes: [], place: PLACE('bed') },
  { key: 'bedsideTable', section: 'bed', heading: 'Bedside table by the bed (Knarrevik)', sizes: [], place: placeAlongWall('bedsideTable'), wall: 'bedsideTable.wall',
    on: 'bedsideTableOn', halfAlong: () => KNARREVIK.w / 2 },
  { key: 'bedsideTableByCupboard', section: 'bed', heading: 'Bedside table by the pine cupboard (Knarrevik)', sizes: [], place: placeAlongWall('bedsideTableByCupboard'), wall: 'bedsideTableByCupboard.wall',
    on: 'bedsideTableByCupboardOn', halfAlong: () => KNARREVIK.w / 2 },
  { key: 'kvistbro', section: 'bed', heading: 'Kvistbro (storage table)', sizes: [], place: placeAlongWall('kvistbro'), wall: 'kvistbro.wall',
    on: 'kvistbroOn', halfAlong: () => KVISTBRO.w / 2 },
  { key: 'laundryBasket', section: 'bed', heading: 'Laundry basket', sizes: [], place: PLACE('laundryBasket'), on: 'laundryBasketOn' },
  { key: 'bookcase', section: 'extras', heading: 'Bookcase', sizes: sizeSliders('bookcase'), place: PLACE('bookcase'), on: 'bookcaseOn' },
  { key: 'cupboard', section: 'extras', heading: 'Pine cupboard', sizes: sizeSliders('cupboard'), place: PLACE('cupboard'), on: 'cupboardOn' },
  { key: 'billy', section: 'extras', heading: 'Billy (from the garage)', sizes: [], place: placeAlongWall('billy'), wall: 'billy.wall',
    on: 'billyOn', switches: [['billy.lying', LYING_LABEL]], halfAlong: at => billySizes(at('billy.lying')).w / 2 },
  { key: 'billyChest', section: 'extras', heading: 'BillyChest (from the garage)', sizes: [], place: placeAlongWall('billyChest'), wall: 'billyChest.wall',
    on: 'billyChestOn', halfAlong: () => BILLY_CHEST.w / 2 },
  { key: 'ivar', section: 'extras', heading: 'Ivar', sizes: [], place: placeAlongWall('ivar'), wall: 'ivar.wall',
    on: 'ivarOn', halfAlong: () => IVAR.w / 2 },
  { key: 'mirror', section: 'extras', heading: 'Mirror', sizes: sizeSliders('mirror'), place: MIRROR_PLACE, wall: 'mirror.wall', on: 'mirrorOn' },
  // The lower one's depth up to 800, as far as it might go (asked for, 15 Oct 2026);
  // no heading, its section's name says what it is
  { key: 'recess', section: 'recess', sizes: [['lowerD', 'Lower cupboard’s depth', 150, 800, 1, '']], place: [],
    switches: [['upperAllDrawers', 'Upper cupboard: all drawers', 'Drawers in all three columns, in place of the tall doors and the open shelves'],
      ['upperDrawers', 'Upper cupboard: drawers', 'Drawers in place of the upper cupboard’s open shelves'],
      ['upperMirrors', 'Upper cupboard: mirrors', 'Mirrors on the upper cupboard’s two tall doors']] },
];
// Those on a wall (`wall` the name of its choice of wall): the mirror,
// Billy, BillyChest, the Ivar, the bedside tables and the Kvistbro, each by
// its key, and how far its middle must be from the wall's ends, given the
// settings by name (`at`): half its width (Billy's as it stands or lies);
// the mirror's middle may go right to the end
const ON_A_WALL = PIECES.filter(p => p.wall).map(p => ({ key: p.wall.split('.')[0], halfAlong: p.halfAlong ?? (() => 0) }));
const SLIDERS = PIECES.flatMap(p => [...p.sizes, ...p.place]);
const SWITCHES = PIECES.flatMap(p => [...(p.on ? [[p.on, IN_THE_BEDROOM]] : []), ...(p.switches ?? [])]);

// Each setting's path in the configuration, by its name here (as the
// controls, and their ids, have it): `bookcaseOn`, whether the bookcase is
// in the bedroom; `bed.u`, where the bed stands there; `bookcase.w`, a size,
// the piece's design; the recess cupboards' by their own names. The pine
// cupboard is `cupboard` here, `pineCupboard` there, as it goes to other
// rooms too; the New cupboard is the bedroom's own corner cupboard
const CONFIG_NAME = { cupboard: 'pineCupboard', newCupboard: 'bedroomCupboard' };
const pieceAt = piece => `pieces.${CONFIG_NAME[piece] ?? piece}`;
const DESIGN_KEYS = ['w', 'd', 'h'];
const RECESS_KEYS = ['lowerD', 'upperDrawers', 'upperMirrors', 'upperAllDrawers'];
export function settingPath(name) {
  if (RECESS_KEYS.includes(name)) return `pieces.recessCupboards.design.${name}`;
  if (name.endsWith('On')) return `${pieceAt(name.slice(0, -'On'.length))}.in.bedroom.on`;
  const [piece, key] = name.split('.');
  return `${pieceAt(piece)}.${DESIGN_KEYS.includes(key) ? 'design' : 'in.bedroom'}.${key}`;
}
const SETTING_NAMES = [...SLIDERS.map(([name]) => name), ...SWITCHES.map(([name]) => name), ...PIECES.filter(p => p.wall).map(p => p.wall)];
export const OTHER_ROOM_START = {};
for (const name of SETTING_NAMES) Config.setValueAt(OTHER_ROOM_START, settingPath(name), structuredClone(valueAt(AS_THEY_START, name)));

// The configuration's entries (kit/config_kit.js), by the settings' names:
// each piece's design and its place in the bedroom, each number held to its
// slider's range, turns to quarter turns
function sliderEntry(name) {
  const [, , lo, hi, step] = SLIDERS.find(([p]) => p === name), path = settingPath(name);
  return Config.number(path, lo, hi, step, { onSteps: name.endsWith('.turn') });
}
const onOffEntry = name => Config.onOff(settingPath(name));
const designEntries = piece => SIZES[piece].map(([k]) => sliderEntry(`${piece}.${k}`));
const placeEntries = (piece, keys = ['u', 'v', 'turn']) => keys.map(k => sliderEntry(`${piece}.${k}`));
const inBedroom = piece => onOffEntry(`${piece}On`);
const wallEntry = piece => Config.choice(settingPath(`${piece}.wall`), WALL_KEYS);
// A piece on a wall's entries: whether it's there, its wall and how far along
const wallPieceEntries = piece => [inBedroom(piece), wallEntry(piece), ...placeEntries(piece, ['along'])];
export const OTHER_ROOM_SCHEMA = [
  inBedroom('newCupboard'), onOffEntry('newCupboard.ladders'),
  ...placeEntries('bed'),
  ...designEntries('bookcase'), inBedroom('bookcase'), ...placeEntries('bookcase'),
  ...designEntries('cupboard'), inBedroom('cupboard'), ...placeEntries('cupboard'),
  inBedroom('billy'), wallEntry('billy'), ...placeEntries('billy', ['along']), onOffEntry('billy.lying'),
  inBedroom('billyChest'), wallEntry('billyChest'), ...placeEntries('billyChest', ['along']),
  inBedroom('ivar'), wallEntry('ivar'), ...placeEntries('ivar', ['along']),
  ...wallPieceEntries('bedsideTable'), ...wallPieceEntries('bedsideTableByCupboard'), ...wallPieceEntries('kvistbro'),
  inBedroom('laundryBasket'), ...placeEntries('laundryBasket'),
  sliderEntry('lowerD'), onOffEntry('upperDrawers'), onOffEntry('upperMirrors'), onOffEntry('upperAllDrawers'),
  ...designEntries('mirror'), inBedroom('mirror'), wallEntry('mirror'), ...placeEntries('mirror', ['along', 'bottom']),
];

// ---------------------------------------------------------------------------
// Drawing. Each movable piece is drawn in its own group, its back's middle
// at the group's origin, its width along x, its depth out along y, so
// placing it is setting where that group stands and how far it's turned.
// ---------------------------------------------------------------------------
const furniture = new THREE.Group();
otherRoom.add(furniture);
// The new cupboard's own group, apart from the furniture as it's redrawn
// from the living room's cupboard (showNewCupboard()), not from `s`
const newCupboardSpot = new THREE.Group();
newCupboardSpot.position.set(NEW_CUPBOARD.u * MM, 0, NEW_CUPBOARD.v * MM);
newCupboardSpot.rotation.y = THREE.MathUtils.degToRad(-NEW_CUPBOARD.turn);
otherRoom.add(newCupboardSpot);
export const otherRoomPieces = { bed: null, bookcase: null, cupboard: null, billy: null, billyChest: null, ivar: null, bedsideTable: null, bedsideTableByCupboard: null, kvistbro: null, laundryBasket: null, mirror: null, newCupboard: newCupboardSpot };   // each piece's group as drawn now, to look at

// Draw everything again from the settings `s` (the model's, laid out as the
// configuration). With a piece switched off it's hidden, though still
// placed, so Looking at it aims at its spot. The new cupboard takes the
// pine cupboard's place, so hides it too.
export function drawOtherRoom(s) {
  // A piece as it is in the bedroom, by its key here: its design, then its
  // place there (with whether it's there, `on`)
  const inBedroom = key => ({ ...s.pieces[CONFIG_NAME[key] ?? key].design, ...s.pieces[CONFIG_NAME[key] ?? key].in.bedroom });
  const [bookcaseHere, pineHere, billyHere, mirrorHere] = ['bookcase', 'cupboard', 'billy', 'mirror'].map(inBedroom);
  clearDrawing(furniture);
  otherRoomPieces.bed = place(bed(), inBedroom('bed'));
  otherRoomPieces.bookcase = place(bookcase(bookcaseHere), bookcaseHere);
  otherRoomPieces.bookcase.visible = bookcaseHere.on;
  otherRoomPieces.cupboard = place(pineCupboard(pineHere), pineHere);
  otherRoomPieces.cupboard.visible = pineHere.on && !inBedroom('newCupboard').on;
  otherRoomPieces.billy = place(billy(billyHere.lying), wallPlace(billyHere, billySizes(billyHere.lying).w / 2));
  otherRoomPieces.billy.visible = billyHere.on;
  showPiece('billyChest', billyChest(), wallPlace(inBedroom('billyChest'), BILLY_CHEST.w / 2), inBedroom('billyChest').on);
  showPiece('ivar', ivar(false), wallPlace(inBedroom('ivar'), IVAR.w / 2), inBedroom('ivar').on);
  for (const key of ['bedsideTable', 'bedsideTableByCupboard']) showPiece(key, knarrevik(), wallPlace(inBedroom(key), KNARREVIK.w / 2), inBedroom(key).on);
  showPiece('kvistbro', kvistbro(), wallPlace(inBedroom('kvistbro'), KVISTBRO.w / 2), inBedroom('kvistbro').on);
  showPiece('laundryBasket', laundryBasket(), inBedroom('laundryBasket'), inBedroom('laundryBasket').on);
  recessCupboards(s.pieces.recessCupboards.design);
  otherRoomPieces.mirror = place(mirror(mirrorHere), wallPlace(mirrorHere));
  otherRoomPieces.mirror.visible = mirrorHere.on;
}

// The new cupboard: `cupboard`, its group, drawn in its own mm from its
// corner, put in the bedroom's corner; or none
export function showNewCupboard(cupboard) {
  newCupboardSpot.clear();
  if (cupboard) newCupboardSpot.add(cupboard);
}

// Where a piece on a wall has its back, and its turn, from its wall and how
// far along, its middle `half` or more from the wall's ends
function wallPlace({ wall, along }, half = 0) {
  const { runs, at, turn } = WALLS[wall], a = alongWall(wall, along, half);
  return runs === 'u' ? { u: a, v: at, turn } : { u: at, v: a, turn };
}

// Draw the piece `key` as the group `g` at `where`, hidden unless it's `on`
function showPiece(key, g, where, on) {
  otherRoomPieces[key] = place(g, where);
  otherRoomPieces[key].visible = on;
}

function place(g, { u, v, turn }) {
  g.position.set(u * MM, 0, v * MM);
  turnPiece(g, turn);
  furniture.add(g);
  return g;
}

// The bed: the headboard at the back, then the base's frame on legs and
// the mattress on it
function bed() {
  const g = new THREE.Group(), half = BED.width / 2;
  const { top, thick, post, rails } = BED.headboard;
  box({ from: [-half, 0, 0], to: [-half + post, thick, top] }, bedFrameMat, g);        // posts
  box({ from: [half - post, 0, 0], to: [half, thick, top] }, bedFrameMat, g);
  for (const [z0, z1] of rails) box({ from: [-half + post, 0, z0], to: [half - post, thick, z1] }, bedFrameMat, g);
  const y0 = thick, y1 = thick + BED.length, { thick: t, high } = BED.rail, under = BED.baseTop - high;
  box({ from: [-half, y0, under], to: [-half + t, y1, BED.baseTop] }, bedFrameMat, g);     // side rails
  box({ from: [half - t, y0, under], to: [half, y1, BED.baseTop] }, bedFrameMat, g);
  box({ from: [-half + t, y1 - t, under], to: [half - t, y1, BED.baseTop] }, bedFrameMat, g);   // foot rail
  for (const x of [-half, half - t]) box({ from: [x, y1 - t, 0], to: [x + t, y1, under] }, bedFrameMat, g);   // feet at the foot (the posts hold the head)
  box({ from: [-half, y0, BED.baseTop], to: [half, y1, BED.baseTop + BED.mattress] }, mattressMat, g);
  return g;
}

// The pine cupboard: its body, held offWall off the wall behind, a cornice
// standing out over it, and on its front two rows of drawers (two, then
// three) under three doors, each with a knob
// (`offWall` how far off the wall it stands: the bedroom's lean to start)
export function pineCupboard({ w, d, h }, offWall = PINE.offWall) {
  const g = new THREE.Group(), half = w / 2, { plinth, cornice, corniceProud, drawerRows, front, gap } = PINE;
  const y0 = offWall, y1 = offWall + d, body = y1 - front;
  box({ from: [-half, y0, 0], to: [half, body, h - cornice] }, pineMat, g);
  box({ from: [-half - corniceProud, y0, h - cornice], to: [half + corniceProud, y1 + corniceProud, h] }, pineMat, g);
  const knob = (x, z) => box({ from: [x - 15, y1, z - 15], to: [x + 15, y1 + 25, z + 15] }, knobMat, g);
  // one row of n fronts from z0 to z1, knobs at `knobZ` up each (a fraction)
  const row = (n, z0, z1, knobZ) => {
    const each = (w - (n + 1) * gap) / n;
    for (let i = 0; i < n; i++) {
      const x0 = -half + gap + i * (each + gap);
      box({ from: [x0, body, z0 + gap], to: [x0 + each, y1, z1] }, pineMat, g);
      knob(x0 + each / 2, z0 + (z1 - z0) * knobZ);
    }
  };
  box({ from: [-half, body, 0], to: [half, y1, plinth] }, pineMat, g);                    // plinth
  const [low, high] = drawerRows, doorsFrom = plinth + low + high;
  row(2, plinth, plinth + low, 0.5);
  row(3, plinth + low, doorsFrom, 0.5);
  row(3, doorsFrom, h - cornice - gap, 0.1);       // the doors' knobs low on them, as in the photo
  return g;
}

// The mirror: a frame against the wall and the glass set in it, its bottom
// `bottom` off the carpet
function mirror({ w, h, bottom }) {
  const g = new THREE.Group(), half = w / 2, { frame, thick } = MIRROR, top = bottom + h;
  box({ from: [-half, 0, bottom], to: [half, thick - 2, top] }, mirrorFrameMat, g);
  box({ from: [-half + frame, thick - 2, bottom + frame], to: [half - frame, thick, top - frame] }, glassMat, g, false);
  return g;
}

// The recess's two fitted cupboards, against its back wall and filling its
// width: the upper one up to the ceiling, standing out over the lower one
function recessCupboards({ lowerD, upperDrawers, upperMirrors, upperAllDrawers }) {
  const { w, upperD, lowerTop, tallDoors, topDoors, plinth, lowerDoors, front, gap } = RECESS_CUPBOARDS;
  const back = OTHER_ROOM.recessBack, top = OTHER_ROOM.ceiling;
  const u0 = (OTHER_ROOM.recessWidth - w) / 2, u1 = u0 + w;     // centred in the recess
  const panel = (a0, a1, z0, z1, frontV, mat = fittedMat) =>
    box({ from: [a0 + gap / 2, frontV - front, z0 + gap / 2], to: [a1 - gap / 2, frontV, z1 - gap / 2] }, mat, furniture);

  // The lower one: its body, a plinth, and doors across
  const lowFront = back - lowerD;
  box({ from: [u0, lowFront + front, 0], to: [u1, back, lowerTop] }, fittedMat, furniture);
  box({ from: [u0, lowFront, 0], to: [u1, lowFront + front, plinth] }, fittedMat, furniture);
  const doorW = w / lowerDoors;
  for (let i = 0; i < lowerDoors; i++) panel(u0 + i * doorW, u0 + (i + 1) * doorW, plinth, lowerTop, lowFront + front);

  // The upper one, the PLATSA: its three columns' frames, short doors along
  // the top, and under them drawers in every column, or tall doors either
  // side (with mirrors, if chosen) and the middle open or drawers there. Its
  // doors open (turnRecessDoors()): the left column's and the middle's on
  // their left, the right column's on their right
  recessHinges.length = 0;
  recessAllDrawers = upperAllDrawers;
  const upFront = back - upperD, col = w / 3, under = lowerTop + tallDoors;
  for (let i = 0; i < 3; i++) {
    platsaFrame(u0 + i * col, u0 + (i + 1) * col, upFront + front, under);
    recessDoor(u0 + i * col, u0 + (i + 1) * col, under, under + topDoors, i === 2 ? 'right' : 'left');
  }
  if (upperAllDrawers) {
    for (let i = 0; i < 3; i++) sannidalDrawers(u0 + i * col, u0 + (i + 1) * col, lowerTop, under);
    return;
  }
  for (const a0 of [u0, u1 - col]) {
    hangingColumn(a0, a0 + col, upFront + front, under);
    recessDoor(a0, a0 + col, lowerTop, under, a0 === u0 ? 'left' : 'right', upperMirrors);
  }
  if (upperDrawers) sannidalDrawers(u0 + col, u1 - col, lowerTop, under);
  else openShelves(u0 + col, u1 - col, upFront + front, under);
}
// Whether the upper one was last drawn with drawers in every column (for
// its hanging: none then)
let recessAllDrawers = false;

// A column's SANNIDAL drawer fronts, a0 to a1 across the recess, from z0 up
// to z1: as many as fit `drawerFront.h` high, their faces flush with the
// doors', each a frame round a panel set in
function sannidalDrawers(a0, a1, z0, z1) {
  const { upperD, gap, panelSetIn, drawerFront: { h, thick, frame } } = RECESS_CUPBOARDS;
  const faceV = OTHER_ROOM.recessBack - upperD, n = Math.max(1, Math.round((z1 - z0) / h)), each = (z1 - z0) / n;
  for (let k = 0; k < n; k++) {
    const bottom = z0 + k * each + gap / 2, top = z0 + (k + 1) * each - gap / 2;
    frameAndPanel(furniture, [a0 + gap / 2, a1 - gap / 2], faceV, thick, [bottom, top], frame, panelSetIn);
  }
}
// A SANNIDAL front in `parent`'s mm: across x0 to x1, its face at v (the
// room's side) and `thick` back from it, z0 to z1 up; a raised frame
// `frame` wide round a panel set in by `setIn`
function frameAndPanel(parent, [x0, x1], v, thick, [z0, z1], frame, setIn) {
  const part = (a0, a1, v0, b0, b1) => box({ from: [a0, v0, b0], to: [a1, v + thick, b1] }, fittedMat, parent);
  part(x0, x1, v + setIn, z0, z1);                               // its back, the panel's face set in
  part(x0, x0 + frame, v, z0, z1);                               // the frame: its two stiles,
  part(x1 - frame, x1, v, z0, z1);
  part(x0 + frame, x1 - frame, v, z0, z0 + frame);               // ...and its rails
  part(x0 + frame, x1 - frame, v, z1 - frame, z1);
}

// A PLATSA column's frame, a0 to a1 across the recess, from its front (the
// doors' back, at v) to the recess's back, from the lower cupboard's top
// to the ceiling: its sides, back, top and bottom, and the fixed shelf
// under the short doors (`under`), all `board` thick
function platsaFrame(a0, a1, v, under) {
  const { board: b, lowerTop } = RECESS_CUPBOARDS, back = OTHER_ROOM.recessBack, top = OTHER_ROOM.ceiling;
  box({ from: [a0, v, lowerTop], to: [a0 + b, back, top] }, fittedMat, furniture);
  box({ from: [a1 - b, v, lowerTop], to: [a1, back, top] }, fittedMat, furniture);
  box({ from: [a0 + b, back - b, lowerTop], to: [a1 - b, back, top] }, fittedMat, furniture);
  for (const z of [lowerTop, under - b, top - b]) box({ from: [a0 + b, v, z], to: [a1 - b, back - b, z + b] }, fittedMat, furniture);
}
// An outer column's fittings, under its fixed shelf: the clothes rail
// running front to back, and the shelf over the wire basket at the bottom
function hangingColumn(a0, a1, v, under) {
  const { board: b, lowerTop, lowShelf, basket: [basketBottom, basketTop], railDrop, rail } = RECESS_CUPBOARDS, back = OTHER_ROOM.recessBack;
  const middle = (a0 + a1) / 2;
  box({ from: [middle - rail / 2, v, under - b - railDrop - rail], to: [middle + rail / 2, back - b, under - b - railDrop] }, railMat, furniture, false);
  box({ from: [a0 + b, v, lowerTop + lowShelf - b], to: [a1 - b, back - b, lowerTop + lowShelf] }, fittedMat, furniture);
  box({ from: [a0 + b + 10, v + 10, lowerTop + basketBottom], to: [a1 - b - 10, back - b - 10, lowerTop + basketTop] }, wireMat, furniture);
}
// The middle column's open shelves: its back in shade, so it reads as open
function openShelves(a0, a1, v, under) {
  const { board: b, lowerTop, middleShelves } = RECESS_CUPBOARDS, back = OTHER_ROOM.recessBack;
  box({ from: [a0 + b, back - b - 1, lowerTop + b], to: [a1 - b, back - b, under - b] }, shadowMat, furniture, false);
  for (const z of middleShelves) box({ from: [a0 + b, v, lowerTop + z - b], to: [a1 - b, back - b, lowerTop + z] }, fittedMat, furniture);
}

// The upper recess cupboard's sections for hanging (model/hanging.js): its
// two outer columns, each as deep inside as from its doors to its back
// board, and as wide inside as between its sides. Their rails run front
// to back, so they're counted on their own, not as rails across
// (HANGING_SPACE.md). With drawers in every column there are none
const { w: RECESS_W, upperD: RECESS_D, front: RECESS_FRONT, board: RECESS_BOARD } = RECESS_CUPBOARDS;
export const recessHanging = ({ upperAllDrawers }) => (upperAllDrawers ? [] : ['left', 'right'].map(side => ({
  name: `Recess cupboard's ${side} column`,
  depth: RECESS_D - RECESS_FRONT - RECESS_BOARD,
  w: RECESS_W / 3 - 2 * RECESS_BOARD,
  frontToBack: RECESS_D - RECESS_FRONT - RECESS_BOARD,   // its rail's length, as hangingColumn() draws it
})));
// ...drawn over in `mat` (the red of a section too shallow to hang in),
// under their fixed shelves, a millimetre proud of their doors
export function markRecessShallow(mat) {
  if (recessAllDrawers) return;
  const { w, upperD, lowerTop, tallDoors } = RECESS_CUPBOARDS, back = OTHER_ROOM.recessBack;
  const u0 = (OTHER_ROOM.recessWidth - w) / 2, col = w / 3;
  for (const a0 of [u0, u0 + w - col]) {
    const red = box({ from: [a0, back - upperD - 1, lowerTop], to: [a0 + col, back, lowerTop + tallDoors] }, mat, furniture, false);
    red.castShadow = red.receiveShadow = false;
  }
}

// The upper recess cupboard's doors' hinges, as drawn, each turning its
// door: the left-hinged ones' `dir` 1, the right-hinged ones' -1
const recessHinges = [];
// A SANNIDAL door across a0 to a1 and z0 to z1 on the upper cupboard's
// front, hinged at its `side` edge on its outside face, so it swings out
// into the room: a raised frame round a panel set in (doorFrame,
// panelSetIn), with a mirror on the panel if asked
function recessDoor(a0, a1, z0, z1, side, mirrored = false) {
  const { upperD, front, gap, doorFrame: f, panelSetIn: setIn, mirrorThick } = RECESS_CUPBOARDS;
  const faceV = OTHER_ROOM.recessBack - upperD;                 // the doors' outside face
  const hinge = new THREE.Group();
  const dir = side === 'left' ? 1 : -1;
  hinge.position.set((side === 'left' ? a0 + gap / 2 : a1 - gap / 2) * MM, 0, faceV * MM);
  hinge.userData.dir = dir;
  furniture.add(hinge);
  recessHinges.push(hinge);
  // In the hinge's own mm: across from it (out to `width`, the way `dir`
  // says), v back from the outside face, z up
  const width = a1 - a0 - gap;
  const across = (d0, d1) => [Math.min(dir * d0, dir * d1), Math.max(dir * d0, dir * d1)];
  const bottom = z0 + gap / 2, top = z1 - gap / 2;
  frameAndPanel(hinge, across(0, width), 0, front, [bottom, top], f, setIn);
  if (mirrored) {
    const [m0, m1] = across(f, width - f);
    box({ from: [m0, setIn - mirrorThick, bottom + f], to: [m1, setIn, top - f] }, glassMat, hinge);
  }
}
// The upper recess cupboard's doors opened to `degrees`, all together, out
// into the room (none stops them)
export function turnRecessDoors(degrees) {
  for (const hinge of recessHinges) hinge.rotation.y = hinge.userData.dir * THREE.MathUtils.degToRad(degrees);
}

// ---------------------------------------------------------------------------
// The menu's block: its sections (SECTIONS), in each, for each piece a
// heading, its In the bedroom switch, its wall, its sliders, and buttons
// to put its dimensions and its location back as they started, built into
// `container`, those marked `top` into `topContainer` instead. change(edits) is called with a list of
// [path, value] as anything changes, each path the configuration's; the
// function returned puts the controls in step with the settings `s`.
// ---------------------------------------------------------------------------

// The new cupboard's options with an L's corner the ladders can stand in
const LADDER_OPTIONS = [7, 8, 9];
export function otherRoomControls(topContainer, container, change) {
  const id = path => `otherRoom_${path.replace('.', '_')}`;
  let shown = name => valueAt(OTHER_ROOM_START, settingPath(name));   // the settings last put in the controls, by name
  const switchHtml = ([path, label, tip]) => `<label class="switch"${tip ? ` title="${tip}"` : ''}><input type="checkbox" id="${id(path)}"> ${label}</label>`;
  // A piece's block: its heading and In the bedroom switch, then the rest
  // of its controls, hidden while it's out
  const pieceBlock = (piece, i) => `<div class="depth" id="otherRoomPiece_${piece.key}">` +
    (piece.heading ? `<div><b>${piece.heading}</b></div>` : '') +
    (piece.on ? switchHtml([piece.on, IN_THE_BEDROOM]) : '') +
    `<div id="otherRoomPiece_${piece.key}Details">` +
    (piece.wall ? wallPick(id(piece.wall), WALLS) : '') +
    (piece.switches ?? []).map(switchHtml).join('') +
    [...piece.sizes, ...piece.place].map(slider(id)).join('') +
    resetButtons(piece, i) + '</div></div>';
  const blocksIn = section => PIECES.map((piece, i) => (piece.section === section ? pieceBlock(piece, i) : '')).join('');
  const sectionHtml = ({ key, summary, open }) => `<details class="sec" id="secOtherRoom_${key}"${open ? ' open' : ''}>` +
    `<summary>${summary}</summary>${blocksIn(key)}</details>`;
  topContainer.innerHTML = PIECES.map((piece, i) => (piece.top ? pieceBlock(piece, i) : '')).join('');
  container.innerHTML = SECTIONS.map(sectionHtml).join('');

  // Settings changed, [name, value] pairs, as edits by their paths
  const changeNamed = edits => change(edits.map(([name, value]) => [settingPath(name), value]));
  for (const [name] of SLIDERS) document.getElementById(id(name)).addEventListener('input', e => changeNamed([[name, Number(e.target.value)]]));
  for (const [name] of SWITCHES) document.getElementById(id(name)).addEventListener('change', e => changeNamed([[name, e.target.checked]]));
  // A new wall keeps a piece on a wall as far along as it can
  for (const { key, halfAlong } of ON_A_WALL) {
    document.getElementById(id(`${key}.wall`)).addEventListener('change', e =>
      changeNamed([[`${key}.wall`, e.target.value], [`${key}.along`, alongWall(e.target.value, shown(`${key}.along`), halfAlong(shown))]]));
  }
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    const piece = PIECES[Number(b.dataset.piece)], what = b.dataset.reset;
    const names = what === 'sizes' ? piece.sizes.map(([name]) => name) : [...piece.place.map(([name]) => name), ...(piece.wall ? [piece.wall] : [])];
    changeNamed(names.map(name => [name, valueAt(OTHER_ROOM_START, settingPath(name))]));
  }));

  return s => {
    const at = name => valueAt(s, settingPath(name));
    shown = at;
    for (const [name, , , , , unit] of SLIDERS) {
      const value = at(name);
      document.getElementById(id(name)).value = String(value);
      document.getElementById(`${id(name)}Value`).textContent = `${value}${unit}`;
    }
    for (const [name] of SWITCHES) document.getElementById(id(name)).checked = at(name);
    for (const piece of PIECES.filter(p => p.on)) document.getElementById(`otherRoomPiece_${piece.key}Details`).hidden = !at(piece.on);
    document.getElementById(id('cupboardOn')).disabled = at('newCupboardOn');   // the new cupboard stands in its place
    // The ladders only where the new cupboard has an L's corner (options 7 to 9)
    const hasCorner = at('newCupboardOn') && LADDER_OPTIONS.includes(s.pieces.bedroomCupboard.design.option);
    document.getElementById(id('newCupboard.ladders')).closest('label').style.display = hasCorner ? '' : 'none';
    // With all drawers, there's no open middle and no tall doors to change
    for (const name of ['upperDrawers', 'upperMirrors']) document.getElementById(id(name)).closest('label').style.display = at('upperAllDrawers') ? 'none' : '';
    for (const { key, halfAlong } of ON_A_WALL) followWall(id, key, { wall: at(`${key}.wall`), along: at(`${key}.along`) }, halfAlong(at));
  };
}

// A piece's wall chosen (one of ON_A_WALL, by its key), and its
// along slider labelled and ranged for it, its middle `half` or more from
// the wall's ends
function followWall(id, key, { wall, along }, half) {
  const { runs } = WALLS[wall], alongId = id(`${key}.along`);
  document.getElementById(id(`${key}.wall`)).value = wall;
  document.getElementById(`${alongId}Label`).textContent = ALONG_LABEL[runs];
  const input = document.getElementById(alongId);
  input.min = String(alongWall(wall, -Infinity, half));
  input.max = String(alongWall(wall, Infinity, half));
  input.value = String(alongWall(wall, along, half));
  document.getElementById(`${alongId}Value`).textContent = input.value;
}
