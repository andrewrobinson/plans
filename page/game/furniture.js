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
  config, drawn, pieces, spotOf, ivarSpot, tableSpot, castorDeskSpot, sofaHome, currentSofa, ROOM_BOXES
} from '../../flat_model.js';
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
// The picker's Other folder, for the less important pieces (asked for, 24 Oct 2026)
const OTHER = { key: 'other', name: 'Other', icon: 'folder' };
const lounge = (key, name, icon, place, spot, object, more = {}) =>
  ({ key, name, icon, place, on: `${place}.on`, spot, moveTo: s => [[`${place}.move`, s]], object, ...more });
const LOUNGE = [
  lounge('billy', 'Billy', 'books', 'pieces.billy.in.livingRoom', () => spotOf('billy'), () => drawn.backWall.billy),
  lounge('billyChest', 'BillyChest', 'archive', 'pieces.billyChest.in.livingRoom', () => spotOf('billyChest'), () => drawn.backWall.billyChest, { short: 'Chest' }),
  lounge('ivar', 'Ivar', 'layout-columns', 'pieces.ivar.in.livingRoom', ivarSpot, () => pieces.ivar),
  lounge('cornwall', 'Cornwall table', 'table', 'pieces.cornwall.in.livingRoom', () => tableSpot('cornwall'), () => pieces.cornwall, { short: 'Cornwall', folder: OTHER }),
  lounge('chesham', 'Chesham table', 'table-alias', 'pieces.chesham.in.livingRoom', () => tableSpot('chesham'), () => pieces.chesham, { short: 'Chesham', folder: OTHER }),
  lounge('castorDesk', 'Desk on castors', 'desk', 'pieces.castorDesk.in.livingRoom', castorDeskSpot, () => pieces.castorDesk, { short: 'Desk', folder: OTHER }),
  lounge('bookshelf', 'Bookcase', 'bookmarks', 'pieces.bookcase.in.livingRoom', () => spotOf('bookshelf'), () => drawn.backWall.bookshelf),
  lounge('pine', 'Pine cupboard', 'door', 'pieces.pineCupboard.in.livingRoom', () => spotOf('pine'), () => drawn.backWall.pine, { short: 'Pine' }),
  lounge('deskDaybed', 'Daybed and desk', 'bed-flat', 'pieces.deskDaybed.in.livingRoom', () => spotOf('deskDaybed'), () => drawn.backWall.deskDaybed, { short: 'Daybed' }),
  lounge('wickerBench', 'Wicker bench', 'armchair-2', 'pieces.wickerBench.in.livingRoom', () => fromXY('pieces.wickerBench.in.livingRoom'), () => wickerBenches.livingRoom,
    { moveTo: s => xyEdits('pieces.wickerBench.in.livingRoom', s, 'x', 'y'), short: 'Wicker', folder: OTHER }),
  // The bench isn't kept as one object, so it's put in and taken out from the picker alone
  lounge('bench', 'Bench', 'layout-rows', 'pieces.bench.in.livingRoom', null, () => null, { fixed: true }),
];
// The sofa can't be taken out (the room's always got one): it's moved and resized instead
const SOFA = { key: 'sofa', name: 'Sofa', icon: 'sofa', place: 'pieces.sofa.in.livingRoom', on: null,
  spot: () => config.pieces.sofa.in.livingRoom.move ?? sofaHome(currentSofa()),
  moveTo: s => [['pieces.sofa.in.livingRoom.move', s]], object: () => pieces.sofa };

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
  free('bookcase', 'Bookcase', 'bookmarks'),
  free('cupboard', 'Pine cupboard', 'door', { short: 'Pine' }),
  onWall('billy', 'Billy', 'books'),
  onWall('billyChest', 'BillyChest', 'archive', { short: 'Chest' }),
  onWall('ivar', 'Ivar', 'layout-columns'),
  onWall('bedsideTable', 'Bedside table by the bed', 'lamp', { short: 'Bedside' }),
  onWall('bedsideTableByCupboard', 'Bedside table by the pine cupboard', 'lamp-2', { short: 'Bedside 2' }),
  onWall('kvistbro', 'Kvistbro', 'stack-2'),
  free('laundryBasket', 'Laundry basket', 'basket', { short: 'Basket' }),
  onWall('mirror', 'Mirror', 'frame'),
  { key: 'wickerBench', name: 'Wicker bench', short: 'Wicker', icon: 'armchair-2', place: 'pieces.wickerBench.in.bedroom', on: 'pieces.wickerBench.in.bedroom.on',
    spot: () => fromXY('pieces.wickerBench.in.bedroom', 'u', 'v'), moveTo: s => xyEdits('pieces.wickerBench.in.bedroom', s, 'u', 'v'), object: () => wickerBenches.bedroom },
  // A fitted corner cupboard in the pine cupboard's place: in or out only
  STORED,
  { key: 'newCupboard', name: 'New cupboard', short: 'Cupboard', icon: 'layout-board', place: bedroomPlace('newCupboard'), on: settingPath('newCupboardOn'),
    fixed: true, object: () => null },
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
  toggle('wcShelves', "Shelves on the WC's wall", 'WC shelves', 'align-justified', 'hallway.wcWall.shelves.on'),
  toggle('wcPicture', "Picture on the WC's wall", 'WC picture', 'photo', 'hallway.wcWall.picture.on'),
  toggle('loungeShelves', "Shelves on the lounge's wall", 'Lounge shelves', 'align-justified', 'hallway.loungeWall.shelves.on'),
  toggle('loungePicture', "Picture on the lounge's wall", 'Lounge picture', 'photo', 'hallway.loungeWall.picture.on'),
  toggle('tvShelves', "Shelves on the TV's wall", 'TV shelves', 'align-justified', 'hallway.tvWall.shelves.on'),
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
const GARAGE_ICONS = {
  sean: 'columns', billy: 'books', billyChest: 'archive', metal: 'table', yellow: 'box', scaffoldBench: 'layout-rows',
  smallBilly: 'books', potters: 'layout-columns', biltong: 'box-multiple', trellis: 'box', pine: 'door', ivar: 'layout-columns',
};
const GARAGE_SHORT = { billyChest: 'Chest', scaffoldBench: 'Scaffold', smallBilly: 'Small Billy', pine: 'Pine' };
const GARAGE = Object.entries(GARAGE_PIECES).map(([key, { label }]) => {
  const place = garagePlace(key);
  return { key, name: label, short: GARAGE_SHORT[key], icon: GARAGE_ICONS[key] ?? 'box', place, on: `${place}.on`,
    spot: () => fromXY(place), moveTo: s => xyEdits(place, s, 'x', 'y'), object: () => garagePieces[key] };
});

// ---------------------------------------------------------------------------
// The rooms with furniture to arrange: their pieces in the picker, those
// always there, and where their mm start in the living room's (the
// bedroom's group stands at its corner, unturned)
// ---------------------------------------------------------------------------
const ROOMS = {
  livingRoom: { picker: [...LOUNGE, STORED], always: [SOFA], origin: { x: 0, y: 0 } },
  bedroom: { picker: BEDROOM, always: [BED], origin: OTHER_ROOM_CORNER },
  // Hallway options are the hallway's and downstairs'
  hallway: { picker: HALLWAY, always: [], origin: { x: 0, y: 0 } },
  downstairs: { picker: HALLWAY, always: [], origin: { x: 0, y: 0 } },
  garage: { picker: GARAGE, always: [], origin: GARAGE_CORNER },
};
for (const [room, r] of Object.entries(ROOMS)) for (const piece of [...r.picker, ...r.always]) piece.room ??= room;
const roomOf = piece => ROOMS[piece.room];

// Whether a piece is in its room: always for those that are always there
const isIn = piece => (piece === SOFA ? Boolean(currentSofa()) : piece.on ? Boolean(at(piece.on)) : true);
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

export { ROOMS, SOFA, BED, at, isIn, inRoom, roomOf, wallsOf, floorBox, facing };
