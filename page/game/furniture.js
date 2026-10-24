// The furniture as the game UI handles it (a piece of living_room.js),
// room by room: each piece the picker offers in the lounge and in the
// bedroom, its icon, where its settings are, where it stands now and the
// object drawn for it. The picker (page/game/shell.js) puts them in and
// takes them out; Plan (page/game/plan_edit.js) selects, moves and turns
// them.
//
// Where a piece stands, spot(), is the middle of its back and its turn, in
// its room's own mm (the bedroom's u and v are x and y here); moveTo(spot)
// gives the settings' edits that put it there. A piece on a wall (`onWall`:
// in the bedroom Billy, the bedside tables and so on, which stand with
// their backs to one of its walls) is put against the wall nearest where
// it's dropped instead.
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import {
  config, drawn, pieces, spotOf, ivarSpot, tableSpot, castorDeskSpot, diningTableSpot, sofaHome, currentSofa, NO_SOFA, speakerPlaceFor, ROOM_BOXES, CURRENT_ROOM
} from '../../flat_model.js';
import { SOFA_MODELS } from '../../sofas.js';
import { otherRoomPieces, settingPath, WALLS } from '../../other_room.js';
import { wickerBenches } from '../../wicker_bench.js';
import { OTHER_ROOM_CORNER } from '../../floor.js';
import { GARAGE_PIECES, GARAGE_CORNER, garagePieces, garagePlace } from '../../garage.js';

// The setting at a dotted path in the configuration
const at = path => path.split('.').reduce((o, k) => o?.[k], config);

// ---------------------------------------------------------------------------
// The lounge's pieces: placed by `move` ({ x, y, turn }, null where they
// start), in the room's mm
// ---------------------------------------------------------------------------
// The pickers' Other folder, the lounge's and the bedroom's, for the less
// important pieces (asked for, 24 Oct 2026)
const OTHER = { key: 'other', name: 'Other', icon: 'folder' };
// The lounge's Front wall and island folder: the island, and the dresser
// and larder, which share the front wall (asked for, 24 Oct 2026)
const KITCHEN = { key: 'kitchen', name: 'Front wall and island', short: 'Kitchen', icon: 'tools-kitchen-2' };
// The lounge's corner cupboard, in or out: in, it's the option last chosen
// (10 to start, as the bedroom's copy starts); out, the room as it is
// (CURRENT_ROOM). Its `on` is the option, `isIn` and `inValue` read and set
// it as a switch
const CUPBOARD_OPTION = 'pieces.cornerCupboard.design.option';
const FIRST_CUPBOARD = 10;         // the option it comes in as till one's chosen (chosen)
let lastCupboard = FIRST_CUPBOARD;
const CORNER_CUPBOARD = { key: 'cornerCupboard', name: 'Corner cupboard', short: 'Cupboard', icon: 'layout-board', on: CUPBOARD_OPTION,
  place: 'pieces.cornerCupboard.design', fixed: true, object: () => null,
  isIn: () => {
    const option = at(CUPBOARD_OPTION);
    if (option !== CURRENT_ROOM) lastCupboard = option;          // kept, to come back as
    return option !== CURRENT_ROOM;
  },
  inValue: on => (on ? lastCupboard : CURRENT_ROOM) };
// The sofa, in or out as the cupboard: in, the model last chosen (the
// Drift to start, SOFA_MODELS.start); out, none (NO_SOFA). Moved and
// resized in Plan
const SOFA_MODEL = 'pieces.sofa.design.model';
let lastSofa = SOFA_MODELS.start;
const SOFA = { key: 'sofa', name: 'Sofa', icon: 'sofa', place: 'pieces.sofa.in.livingRoom', on: SOFA_MODEL,
  isIn: () => {
    const model = at(SOFA_MODEL);
    if (model !== NO_SOFA) lastSofa = model;                     // kept, to come back as
    return Boolean(currentSofa());
  },
  inValue: on => (on ? lastSofa : NO_SOFA),
  spot: () => config.pieces.sofa.in.livingRoom.move ?? sofaHome(currentSofa()),
  moveTo: s => [['pieces.sofa.in.livingRoom.move', s]], object: () => pieces.sofa };
// The speakers, a pair, in or out as the cupboard: their setting is what
// they stand on (Lounge options' Speakers: none, or a place); in, they go
// where they last stood if it's there now, else on the first place that is
// (speakerPlaceFor()), Billy to start. They move with what they're on, so
// aren't moved in Plan (asked for, 24 Oct 2026)
const SPEAKERS_ON = 'pieces.speakers.in.livingRoom.on';
const NO_SPEAKERS = 'none';
let lastSpeakerPlace = 'billy';
const SPEAKERS = { key: 'speakers', name: 'Speakers', icon: 'device-speaker', on: SPEAKERS_ON, place: 'pieces.speakers.in.livingRoom',
  fixed: true, object: () => null, folder: OTHER,
  isIn: () => {
    const place = at(SPEAKERS_ON);
    if (place !== NO_SPEAKERS) lastSpeakerPlace = place;           // kept, to come back to
    return place !== NO_SPEAKERS;
  },
  inValue: on => (on ? speakerPlaceFor(lastSpeakerPlace) : NO_SPEAKERS) };
// The island, in or out as the cupboard: its setting is where it stands
// (out in the room, or its long or short side to the front wall, or none);
// in, where it last stood (out in the room to start). Moved by its options'
// sliders
const ISLAND_AT = 'pieces.island.in.livingRoom.at';
const NO_ISLAND = 'none';
let lastIslandAt = 'room';
const ISLAND = { key: 'island', name: 'Kitchen island', short: 'Island', icon: 'chef-hat', on: ISLAND_AT, place: 'pieces.island.in.livingRoom',
  fixed: true, object: () => null, folder: KITCHEN,
  isIn: () => {
    const where = at(ISLAND_AT);
    if (where !== NO_ISLAND) lastIslandAt = where;              // kept, to come back to
    return where !== NO_ISLAND;
  },
  inValue: on => (on ? lastIslandAt : NO_ISLAND) };
// The dresser and the larder, each the front wall's piece or not: one put
// in takes the other out, as they share the setting (`on`)
const FRONT_WALL = 'livingRoom.frontWall';
const frontPiece = (key, name, icon) => ({ key, name, icon, on: FRONT_WALL, place: 'livingRoom', fixed: true, object: () => null, folder: KITCHEN,
  isIn: () => at(FRONT_WALL) === key, inValue: on => (on ? key : 'none') });
const lounge = (key, name, icon, place, spot, object, more = {}) =>
  ({ key, name, icon, place, on: `${place}.on`, spot, moveTo: s => [[`${place}.move`, s]], object, ...more });
// In the picker's order, the most important first (asked for, 24 Oct 2026)
const LOUNGE = [
  CORNER_CUPBOARD,
  SOFA,
  lounge('deskDaybed', 'Daybed and desk', 'bed-flat', 'pieces.deskDaybed.in.livingRoom', () => spotOf('deskDaybed'), () => drawn.backWall.deskDaybed, { short: 'Daybed' }),
  // The bench isn't kept as one object, so it's put in and taken out from the picker alone
  lounge('bench', 'Bench', 'layout-rows', 'pieces.bench.in.livingRoom', null, () => null, { fixed: true }),
  // (the Front wall and island folder before Other)
  ISLAND,
  frontPiece('dresser', 'Dresser', 'layout-board-split'),
  frontPiece('larder', 'Larder', 'fridge'),
  lounge('billy', 'Billy', 'books', 'pieces.billy.in.livingRoom', () => spotOf('billy'), () => drawn.backWall.billy),
  lounge('billyChest', 'BillyChest', 'archive', 'pieces.billyChest.in.livingRoom', () => spotOf('billyChest'), () => drawn.backWall.billyChest, { short: 'Chest', folder: OTHER }),
  lounge('ivar', 'Ivar', 'layout-columns', 'pieces.ivar.in.livingRoom', ivarSpot, () => pieces.ivar, { folder: OTHER }),
  lounge('cornwall', 'Cornwall table', 'table', 'pieces.cornwall.in.livingRoom', () => tableSpot('cornwall'), () => pieces.cornwall, { short: 'Cornwall', folder: OTHER }),
  lounge('chesham', 'Chesham table', 'table-alias', 'pieces.chesham.in.livingRoom', () => tableSpot('chesham'), () => pieces.chesham, { short: 'Chesham', folder: OTHER }),
  lounge('diningTable', 'Dining table', 'tools-kitchen-2', 'pieces.diningTable.in.livingRoom', diningTableSpot, () => pieces.diningTable, { short: 'Dining', folder: OTHER }),
  lounge('castorDesk', 'Desk on castors', 'desk', 'pieces.castorDesk.in.livingRoom', castorDeskSpot, () => pieces.castorDesk, { short: 'Desk', folder: OTHER }),
  lounge('bookshelf', 'Bookcase', 'bookmarks', 'pieces.bookcase.in.livingRoom', () => spotOf('bookshelf'), () => drawn.backWall.bookshelf, { folder: OTHER }),
  lounge('pine', 'Pine cupboard', 'door', 'pieces.pineCupboard.in.livingRoom', () => spotOf('pine'), () => drawn.backWall.pine, { short: 'Pine' }),
  lounge('wickerBench', 'Wicker bench', 'armchair-2', 'pieces.wickerBench.in.livingRoom', () => fromXY('pieces.wickerBench.in.livingRoom'), () => wickerBenches.livingRoom,
    { moveTo: s => xyEdits('pieces.wickerBench.in.livingRoom', s, 'x', 'y'), short: 'Wicker', folder: OTHER }),
  SPEAKERS,
  // The TV, on the back wall: dragged along it only (`slides`), its middle
  // setting `along` (its height's on its slider, in its options)
  lounge('tv', 'TV', 'device-tv', 'pieces.tv.in.livingRoom', () => ({ x: drawn.tvAt[0], y: 0, turn: 0 }), () => drawn.tv,
    { moveTo: s => [['pieces.tv.in.livingRoom.along', Math.round(s.x)]], slides: 'x', onWall: true }),
];

// A piece placed by two settings and its turn (the wicker bench, the bedroom's)
function fromXY(place, x = 'x', y = 'y') {
  const p = at(place);
  return { x: p[x], y: p[y], turn: p.turn };
}
const xyEdits = (place, s, x, y) => [[`${place}.${x}`, s.x], [`${place}.${y}`, s.y], [`${place}.turn`, s.turn]];

// ---------------------------------------------------------------------------
// The bedroom's pieces (other_room.js): placed by u, v and turn, or against
// one of its WALLS by `wall` and `along`
// ---------------------------------------------------------------------------
const bedroomPlace = key => settingPath(`${key}On`).replace(/\.on$/, '');
function free(key, name, icon, more = {}) {
  const place = bedroomPlace(key);
  return { key, name, icon, place, on: `${place}.on`, spot: () => fromXY(place, 'u', 'v'), moveTo: s => xyEdits(place, s, 'u', 'v'),
    object: () => otherRoomPieces[key], ...more };
}
function onWall(key, name, icon, more = {}) {
  const place = bedroomPlace(key);
  const spot = () => {
    const { wall, along } = at(place), w = WALLS[wall];
    return w.runs === 'u' ? { x: along, y: w.at, turn: w.turn } : { x: w.at, y: along, turn: w.turn };
  };
  return { key, name, icon, place, on: `${place}.on`, spot, onWall: true, moveTo: s => wallEdits(place, s),
    object: () => otherRoomPieces[key], ...more };
}
// Against the wall nearest a spot, its middle along it there
function wallEdits(place, { x, y }) {
  const distance = w => (w.runs === 'u' ? Math.abs(y - w.at) : Math.abs(x - w.at)) + Math.max(0, w.from - (w.runs === 'u' ? x : y), (w.runs === 'u' ? x : y) - w.to);
  const [wall, w] = Object.entries(WALLS).reduce((best, entry) => (distance(entry[1]) < distance(best[1]) ? entry : best));
  return [[`${place}.wall`, wall], [`${place}.along`, Math.round(w.runs === 'u' ? x : y)]];
}
// The things to store (model/stored.js), all at once, as the top bar's
// Stored switch has them: in the lounge, so the bedroom's picker shows the
// lounge's (asked for, 24 Oct 2026). Put in and taken out by that switch
// (`viaSwitch`), as they aren't changed through change(); they're moved
// in Plan as before (page/stored_controls.js)
const STORED = { key: 'stored', name: 'Things to store', short: 'Stored', icon: 'package', on: 'thingsToStore.shown', place: 'thingsToStore',
  room: 'livingRoom', fixed: true, viaSwitch: 'storedToggle', object: () => null };

const BEDROOM = [
  // A fitted corner cupboard in the pine cupboard's place, in or out only: first, the most important
  { key: 'newCupboard', name: 'New cupboard', short: 'Cupboard', icon: 'layout-board', place: bedroomPlace('newCupboard'), on: settingPath('newCupboardOn'),
    fixed: true, object: () => null },
  free('bookcase', 'Bookcase', 'bookmarks'),
  free('cupboard', 'Pine cupboard', 'door', { short: 'Pine', replacedBy: 'newCupboard' }),
  onWall('billy', 'Billy', 'books'),
  onWall('billyChest', 'BillyChest', 'archive', { short: 'Chest', folder: OTHER }),
  onWall('ivar', 'Ivar', 'layout-columns', { folder: OTHER }),
  onWall('bedsideTable', 'Bedside table by the bed', 'lamp', { short: 'Bedside', folder: OTHER }),
  onWall('bedsideTableByCupboard', 'Bedside table by the pine cupboard', 'lamp-2', { short: 'Bedside 2', folder: OTHER }),
  onWall('kvistbro', 'Kvistbro', 'stack-2', { folder: OTHER }),
  free('laundryBasket', 'Laundry basket', 'basket', { short: 'Basket', folder: OTHER }),
  onWall('mirror', 'Mirror', 'frame'),
  { key: 'wickerBench', name: 'Wicker bench', short: 'Wicker', icon: 'armchair-2', place: 'pieces.wickerBench.in.bedroom', on: 'pieces.wickerBench.in.bedroom.on', folder: OTHER,
    spot: () => fromXY('pieces.wickerBench.in.bedroom', 'u', 'v'), moveTo: s => xyEdits('pieces.wickerBench.in.bedroom', s, 'u', 'v'), object: () => wickerBenches.bedroom },
  STORED,
];
// The bed can't be taken out either
const BED = { ...free('bed', 'Bed', 'bed'), on: null };

// ---------------------------------------------------------------------------
// The hallway's and stairs' (Hallway options): each fixed to its wall, sill
// or spot, so put in and taken out from the picker, and set from its
// options by a long-press (options.js)
// ---------------------------------------------------------------------------
const toggle = (key, name, short, icon, on) => ({ key, name, short, icon, on, place: on.replace(/\.[^.]+$/, ''), fixed: true, object: () => null });
const HALLWAY = [
  { ...toggle('wcShelves', "Shelves on the WC's wall", 'WC shelves', 'align-justified', 'hallway.wcWall.shelves.on'), replacedBy: 'cornerShelves' },
  toggle('wcPicture', "Picture on the WC's wall", 'WC picture', 'photo', 'hallway.wcWall.picture.on'),
  toggle('loungeShelves', "Shelves on the lounge's wall", 'Lounge shelves', 'align-justified', 'hallway.loungeWall.shelves.on'),
  toggle('loungePicture', "Picture on the lounge's wall", 'Lounge picture', 'photo', 'hallway.loungeWall.picture.on'),
  { ...toggle('tvShelves', "Shelves on the TV's wall", 'TV shelves', 'align-justified', 'hallway.tvWall.shelves.on'), replacedBy: 'cornerShelves' },
  toggle('tvPicture', "Picture on the TV's wall", 'TV picture', 'photo', 'hallway.tvWall.picture.on'),
  toggle('cornerShelves', 'L-shaped shelves in the corner', 'L shelves', 'border-corner-square', 'hallway.cornerShelves.on'),
  toggle('leftShoeBoxes', 'Shoe boxes on the left sill', 'Left boxes', 'box', 'hallway.shoeBoxes.left.on'),
  toggle('rightShoeBoxes', 'Shoe boxes on the right sill', 'Right boxes', 'box', 'hallway.shoeBoxes.right.on'),
  toggle('shoeRack', 'Shoe rack', 'Shoe rack', 'shoe', 'pieces.shoeRack.in.hallway.on'),
  toggle('wickerBench', 'Wicker bench', 'Wicker', 'armchair-2', 'pieces.wickerBench.in.hallway.on'),
  toggle('bathroom', 'The bathroom and WC: shown, or hidden to see past them', 'Bathroom', 'bath', 'hallway.bathroomShown'),
];

// ---------------------------------------------------------------------------
// The garage's (garage.js), each placed by x, y and turn in the garage's
// own mm, from its corner
// ---------------------------------------------------------------------------
// (the flat's pieces with the icons they have in the lounge's and bedroom's)
const GARAGE_ICONS = {
  sean: 'columns', billy: 'books', billyChest: 'archive', metal: 'table', yellow: 'box', scaffoldBench: 'layout-rows',
  smallBilly: 'books', potters: 'layout-columns', biltong: 'box-multiple', trellis: 'box', pine: 'door', ivar: 'layout-columns',
  cornwall: 'table', chesham: 'table-alias', castorDesk: 'desk', bookcase: 'bookmarks', wickerBench: 'armchair-2',
  bedsideTable: 'lamp', bedsideTableByCupboard: 'lamp-2', kvistbro: 'stack-2', laundryBasket: 'basket',
};
const GARAGE_SHORT = {
  billyChest: 'Chest', scaffoldBench: 'Scaffold', smallBilly: 'Small Billy', pine: 'Pine', cornwall: 'Cornwall', chesham: 'Chesham',
  castorDesk: 'Desk', wickerBench: 'Wicker', bedsideTable: 'Bedside', bedsideTableByCupboard: 'Bedside 2', laundryBasket: 'Basket',
};
// The garage's picker: what's kept there first, the flat's furniture put
// away there (Garage options' Home) in a folder (asked for, 24 Oct
// 2026: home furniture apart from what's already there)
const HOME = { key: 'home', name: 'Home', icon: 'home', group: 'home' };
const GARAGE = Object.entries(GARAGE_PIECES).map(([key, { label, group }]) => {
  const place = garagePlace(key);
  return { key, name: label, short: GARAGE_SHORT[key], icon: GARAGE_ICONS[key] ?? 'box', place, on: `${place}.on`,
    ...(group === HOME.group ? { folder: HOME } : {}),
    spot: () => fromXY(place), moveTo: s => xyEdits(place, s, 'x', 'y'), object: () => garagePieces[key] };
});

// ---------------------------------------------------------------------------
// The rooms with furniture to arrange: their pieces in the picker, those
// always there, and where their mm start in the living room's (the
// bedroom's group stands at its corner, unturned)
// ---------------------------------------------------------------------------
const ROOMS = {
  livingRoom: { picker: [...LOUNGE, STORED], always: [], origin: { x: 0, y: 0 } },
  bedroom: { picker: BEDROOM, always: [BED], origin: OTHER_ROOM_CORNER },
  // Hallway options are the hallway's and downstairs'
  hallway: { picker: HALLWAY, always: [], origin: { x: 0, y: 0 } },
  downstairs: { picker: HALLWAY, always: [], origin: { x: 0, y: 0 } },
  garage: { picker: GARAGE, always: [], origin: GARAGE_CORNER },
};
for (const [room, r] of Object.entries(ROOMS)) for (const piece of [...r.picker, ...r.always]) piece.room ??= room;
const roomOf = piece => ROOMS[piece.room];

// Whether a piece is in its room: always for those that are always there.
// One `replacedBy` another (the pine cupboard by the bedroom's new
// cupboard, the TV and WC walls' shelves by the L-shaped shelves, as their
// menus have it) isn't while that one's in, whatever its own switch says
const switchedOn = piece => (piece.isIn ? piece.isIn() : piece.on ? Boolean(at(piece.on)) : true);
const replacerOf = piece => (piece.replacedBy ? ROOMS[piece.room].picker.find(p => p.key === piece.replacedBy) : null);
const replacedNow = piece => Boolean(replacerOf(piece) && switchedOn(replacerOf(piece)));
const isIn = piece => switchedOn(piece) && !replacedNow(piece);
// The pieces in a room that can be selected in Plan, each that's in and drawn
const inRoom = room => (ROOMS[room] ? [...ROOMS[room].always, ...ROOMS[room].picker] : []).filter(piece => isIn(piece) && piece.object());
// The room's walls, in the living room's mm (flat_model.js's ROOM_BOXES)
const wallsOf = room => ROOM_BOXES[room];

// Where a piece stands on the floor, in the living room's mm: { x0, x1, y0,
// y1 } (scene x is room x, scene z room y), and how high it reaches
function floorBox(object) {
  object.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(object);
  return { x0: b.min.x / MM, x1: b.max.x / MM, y0: b.min.z / MM, y1: b.max.z / MM, top: b.max.y / MM };
}
// The way a piece turned `turn` degrees faces, in the room's x and y (as
// the menus' Turned: 0 faces away from the back or hallway wall, 90 the
// left or window wall)
const facing = turn => ({ x: -Math.sin(THREE.MathUtils.degToRad(turn)), y: Math.cos(THREE.MathUtils.degToRad(turn)) });

export { ROOMS, SOFA, BED, at, isIn, replacerOf, replacedNow, inRoom, roomOf, wallsOf, floorBox, facing };
