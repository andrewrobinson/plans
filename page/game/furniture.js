// The lounge's furniture as the game UI handles it (a piece of
// living_room.js): each piece the picker offers, its icon, where its
// settings are, where it stands now and the object drawn for it. The
// picker (page/game/shell.js) puts them in and takes them out; Plan
// (page/game/plan_edit.js) selects, moves and turns them.
import * as THREE from 'three';
import { MM } from '../../kit/floor_kit.js';
import {
  config, drawn, pieces, spotOf, ivarSpot, tableSpot, castorDeskSpot, sofaHome, currentSofa
} from '../../flat_model.js';

// Each piece, in the picker's order: its key, its name (and a shorter one
// for under its icon, where the name's too long), its icon (the
// Tabler icon font's, loaded by index.html), where its settings are in the
// configuration, where it stands ({ x, y, turn }: the middle of its back,
// the sofa's middle) and the object drawn for it, or null while it's out.
// `fixed`: it has no place of its own to move (the bench is the back
// wall's); `stays`: it can't be taken out (the sofa: the room's always got
// one, it's resized and moved instead)
const FURNITURE = [
  { key: 'billy', name: 'Billy', icon: 'books', place: 'pieces.billy.in.livingRoom', spot: () => spotOf('billy'), object: () => drawn.backWall.billy },
  { key: 'billyChest', short: 'Chest', name: 'BillyChest', icon: 'archive', place: 'pieces.billyChest.in.livingRoom', spot: () => spotOf('billyChest'), object: () => drawn.backWall.billyChest },
  { key: 'ivar', name: 'Ivar', icon: 'layout-columns', place: 'pieces.ivar.in.livingRoom', spot: ivarSpot, object: () => pieces.ivar },
  { key: 'cornwall', short: 'Cornwall', name: 'Cornwall table', icon: 'table', place: 'pieces.cornwall.in.livingRoom', spot: () => tableSpot('cornwall'), object: () => pieces.cornwall },
  { key: 'chesham', short: 'Chesham', name: 'Chesham table', icon: 'table-alias', place: 'pieces.chesham.in.livingRoom', spot: () => tableSpot('chesham'), object: () => pieces.chesham },
  { key: 'castorDesk', short: 'Desk', name: 'Desk on castors', icon: 'desk', place: 'pieces.castorDesk.in.livingRoom', spot: castorDeskSpot, object: () => pieces.castorDesk },
  { key: 'bookshelf', name: 'Bookcase', icon: 'bookmarks', place: 'pieces.bookcase.in.livingRoom', spot: () => spotOf('bookshelf'), object: () => drawn.backWall.bookshelf },
  { key: 'pine', short: 'Pine', name: 'Pine cupboard', icon: 'door', place: 'pieces.pineCupboard.in.livingRoom', spot: () => spotOf('pine'), object: () => drawn.backWall.pine },
  { key: 'deskDaybed', short: 'Daybed', name: 'Daybed and desk', icon: 'bed-flat', place: 'pieces.deskDaybed.in.livingRoom', spot: () => spotOf('deskDaybed'), object: () => drawn.backWall.deskDaybed },
  // The bench isn't kept as one object, so it's put in and taken out from the picker alone
  { key: 'bench', name: 'Bench', icon: 'layout-rows', place: 'pieces.bench.in.livingRoom', fixed: true, object: () => null },
];
const SOFA = { key: 'sofa', name: 'Sofa', icon: 'sofa', place: 'pieces.sofa.in.livingRoom', stays: true,
  spot: () => config.pieces.sofa.in.livingRoom.move ?? sofaHome(currentSofa()), object: () => pieces.sofa };

// The setting at a dotted path in the configuration
const at = path => path.split('.').reduce((o, k) => o?.[k], config);
// Whether a piece is in the room: the sofa while one's chosen; the bench
// while it's on, though something standing in its place hides it
const isIn = piece => (piece === SOFA ? Boolean(currentSofa()) : Boolean(at(piece.place).on));
// The pieces that can be selected in Plan, each that's in and drawn
const inRoom = () => [SOFA, ...FURNITURE].filter(piece => isIn(piece) && piece.object());

// Where a piece stands on the floor, in the room's mm: { x0, x1, y0, y1 }
// (scene x is room x, scene z room y)
function floorBox(object) {
  object.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(object);
  return { x0: b.min.x / MM, x1: b.max.x / MM, y0: b.min.z / MM, y1: b.max.z / MM, top: b.max.y / MM };
}
// The way a piece turned `turn` degrees faces, in the room's x and y (as
// the menus' Turned: 0 faces the front wall, 90 the left wall)
const facing = turn => ({ x: -Math.sin(THREE.MathUtils.degToRad(turn)), y: Math.cos(THREE.MathUtils.degToRad(turn)) });

export { FURNITURE, SOFA, at, isIn, inRoom, floorBox, facing };
