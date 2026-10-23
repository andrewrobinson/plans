// The two corner cupboards (a piece of flat_model.js): where each stands,
// the bedroom's door they must clear, building the option on show, and the
// bench and shelves the living room's option draws round it.
import * as THREE from 'three';
import { box, clearDrawing } from '../kit/floor_kit.js';
import {
  CUPBOARD_MATERIALS, makeCupboard, optionOf, CURRENT_ROOM, diagonal, MIN_DIAGONAL
} from '../corner_cupboard.js';
import { showNewCupboard } from '../other_room.js';
import { QUARTER_TURN } from '../kit/units_kit.js';
import { DOOR_SWINGS, sweepInto, opensTo } from '../bedroom_door.js';
import {
  ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, OTHER_ROOM, hallway
} from '../floor.js';
import { config, cupboardSettings, doors, drawn, world } from './state.js';
import {
  BACK_WALL_PIECES, TV_BOTTOM, TV_H, baseCupboards, benchDrawn, benchStandIns, benchStart, wallClearFrom
} from './bench_wall.js';
import { pieces } from './front_wall.js';
import { BEDROOM_MATERIALS, benchMat } from './materials.js';
import { SLIDER_RANGES } from './slider_ranges.js';

// The living room, as the cupboard stands in it: its back-left corner,
// and the room door it can meet (760 x 44, hinged at y 1400 on the left wall)
const LIVING_ROOM_PLACE = {
  width: ROOM_WIDTH, depth: ROOM_DEPTH, ceiling: CEILING_HEIGHT,
  door: { frameFrom: DOOR_FRAME_STARTS_AT, hingeAt: DOOR_HINGE_AT, width: ROOM_DOOR, thickness: 44 },
};

// The bedroom's New cupboard: a corner cupboard of its own, in the corner
// where the chimney breast meets the kitchen-side wall (other_room.js's
// NEW_CUPBOARD), turned half round, so its back wall runs along the breast
// (3682 to the window wall) and its left wall along the kitchen-side wall
// (2841 out to the hallway wall), under the bedroom's 2445 ceiling. No door
// on its walls (the bedroom's is in the far one). Its settings
// (config.pieces.bedroomCupboard.design), colour (colours.bedroomCupboard, following the
// living room's unless set), doors, materials, shelves and cutting list are
// its own; its shelves' wood is the flat's.
const BEDROOM_PLACE = { width: OTHER_ROOM.length, depth: OTHER_ROOM.breastFace, ceiling: OTHER_ROOM.ceiling, door: null };

// How far the bedroom's cupboard can reach (asked for, 18 Oct 2026): along
// the chimney breast up to the recess, where its fitted cupboards stand
// (OTHER_ROOM.breastLength, 1858), and out along the kitchen-side wall till
// it meets the bedroom door's swing (bedroom_door.js). Its x along the
// breast from the kitchen-side wall is the door's x, and its y out from the
// breast is the room's depth there less the door's v.
const BEDROOM_ALONG_BREAST = OTHER_ROOM.breastLength;
const DOOR_SWING_CLEAR = 10;       // kept clear of the door's swing (chosen)
// How far the door must be able to open, which the cupboard keeps clear of:
// swinging right, all the way (as it was before it could swing left);
// swinging left, as far as the setting says
const bedroomDoor = () => config.bedroom.door;
const mustOpenTo = () => (bedroomDoor().swings === 'right' ? DOOR_SWINGS.right.stopsAt : bedroomDoor().mustOpenTo);
// How far out from the breast a cupboard `deep` out from the kitchen-side
// wall can reach before the bedroom door's swing
function clearOfBedroomDoor(deep) {
  return Math.floor(OTHER_ROOM.breastFace - sweepInto(bedroomDoor().swings, mustOpenTo(), deep) - DOOR_SWING_CLEAR);
}
// The bedroom cupboard's leg along the kitchen-side wall, as built: how
// deep it is and how far out from the breast it comes (options 10 and 11's
// corner cupboard, or the left-wall cupboard), or null with none
function bedroomLegAlongKitchenWall() {
  const settings = config.pieces.bedroomCupboard.design, { option: no, T, F, CORNER_W } = settings, option = optionOf(no);
  if (!config.pieces.bedroomCupboard.in.bedroom.on || no === CURRENT_ROOM) return null;
  if (option.front) return { deep: CORNER_W, out: option.front(settings) };
  return T === 0 ? null : { deep: T, out: F };
}
// How far the bedroom door can open as things stand: to the wall it
// meets, or to the bedroom cupboard's leg along the kitchen-side wall
export function bedroomDoorOpensTo() {
  const { swings } = bedroomDoor(), leg = bedroomLegAlongKitchenWall();
  return leg ? opensTo(swings, leg.deep, OTHER_ROOM.breastFace - leg.out) : DOOR_SWINGS[swings].stopsAt;
}
// What the bedroom door's settings mean for the new cupboard, for Bedroom
// options' Doors section: how far the door opens, and how far the cupboard
// can come out along the kitchen-side wall before its swing
export function bedroomDoorText() {
  const { swings } = bedroomDoor(), { stopsAt } = DOOR_SWINGS[swings], leg = bedroomLegAlongKitchenWall();
  const door = swings === 'right'
    ? `Swinging right as you go in, it opens back to the hallway wall (${stopsAt}°).`
    : `Swinging left as you go in, it opens along the kitchen-side wall, to ${stopsAt}° where it meets it.`;
  if (!leg) return `${door} Switch on the new cupboard to see how far it can come out along the kitchen-side wall before the door's swing.`;
  const must = swings === 'right' ? 'all the way' : `to ${mustOpenTo()}°`;
  return `${door} The new cupboard, ${leg.deep} deep, can come out along the kitchen-side wall up to ${clearOfBedroomDoor(leg.deep)} ` +
    `and still let the door open ${must}. It comes out ${leg.out}, so the door opens to ${bedroomDoorOpensTo()}°.`;
}
// The most each of a cupboard's sizes can be, given its other `settings`,
// where it's less than its slider's end. In either room, option 8's straight
// fronts leave its diagonal MIN_DIAGONAL along each wall. The living room's
// sliders end at its own limits (the back wall's bench takes the rest, and
// the room door's frame starts 1329 out along the left wall); in the
// bedroom, the back-wall sizes go to the recess and the left-wall ones to
// the door's swing.
export function cupboardLimits(piece, settings = config.pieces[piece].design) {
  const { T, R, F, DIAG_RUN, CORNER_W } = settings;
  const onSteps = (v, name) => Math.floor(v / SLIDER_RANGES[name][2]) * SLIDER_RANGES[name][2];   // where its slider can stop
  const diagonal = { DIAG_BACK: onSteps(DIAG_RUN - MIN_DIAGONAL, 'diagBack'), DIAG_LEFT: onSteps(F - R - MIN_DIAGONAL, 'diagLeft') };
  if (piece !== 'bedroomCupboard') return diagonal;
  return { ...diagonal, LEG: BEDROOM_ALONG_BREAST - T, DIAG_RUN: BEDROOM_ALONG_BREAST - T, CORNER_W: BEDROOM_ALONG_BREAST,
    F: clearOfBedroomDoor(T), CORNER_D: clearOfBedroomDoor(CORNER_W) };
}
let cupboard = null;         // the living room's corner cupboard (makeCupboard())
let livingGroup = null;      // the cupboard and everything round it that the option's build draws: the bench wall, the front wall, the sofa
let bedroomCupboard = null;  // the bedroom's own corner cupboard (BEDROOM_PLACE), while its New cupboard switch is on


// The bedroom's New cupboard switch: its own cupboard, built from its own
// settings against the bedroom (BEDROOM_PLACE) in its own materials, its
// shelves whole (nothing's stored in it), or none. As the living room's
// (build()), option 8 falls back to 7 with no left-wall cupboard, and a new
// option starts with its second door shut (`onShow`: the option on show
// till now)
function buildBedroomCupboard(onShow) {
  bedroomCupboard = null;
  if (config.pieces.bedroomCupboard.design.option !== onShow) doors.bedroomCupboardSecond = 0;
  if (!config.pieces.bedroomCupboard.in.bedroom.on) return showNewCupboard(null);
  bedroomCupboard = makeCupboard(cupboardSettings('bedroomCupboard'), BEDROOM_PLACE, BEDROOM_MATERIALS);
  bedroomCupboard.drawShelves([]);
  showNewCupboard(bedroomCupboard.group);
}
// Each corner cupboard as built (makeCupboard()), by its piece's name, or
// null while there's none
export const cupboardOf = piece => ({ cornerCupboard: cupboard, bedroomCupboard })[piece] ?? null;
// The options on show, each cupboard's, as build() is told them when the
// menus have already set new ones
export const optionsOnShow = () => ({ cornerCupboard: config.pieces.cornerCupboard.design.option, bedroomCupboard: config.pieces.bedroomCupboard.design.option });

// An option's description, with the bench off: no bench (rather than its
// length) and nothing on the back wall (or the bookcase there), and what
// stood on the bench at bench height
function withoutBench(text) {
  if (benchDrawn()) return text;
  const instead = benchStandIns().map(key => BACK_WALL_PIECES[key].short).join(' and ');
  const backWall = instead ? ` No bench: ${instead} ${benchStandIns().length > 1 ? 'stand' : 'stands'} there instead.` : ' No bench, so nothing on the back wall.';
  return text
    .replace(/ ?Bench (shortened to )?\d+[^.;]*? deep(;[^.]*)?\./g, backWall)
    .replace(/\. Base cupboards with \d+ doors under an oak top run on to the right-hand wall: [^.]*? deep\./, '. No base cupboards (no bench), so nothing on the back wall beyond.')
    .replace(/, where it's clear of the \d+-deep bench (\(y [^)]*\))/, ' $1')
    .replace(', behind the bench end.', '.')
    .replace(/Above the bench, /g, 'Above bench height, ');
}


// The option's cupboard (corner_cupboard.js), in a new group in place of
// the last, which everything round it is then drawn into
function buildOption() {
  if (livingGroup) {
    world.remove(livingGroup);
    clearDrawing(livingGroup);                                  // its geometry freed
  }
  livingGroup = new THREE.Group();
  world.add(livingGroup);
  pieces.dresser = pieces.larder = pieces.sofa = pieces.ivar = pieces.chesham = pieces.cornwall = pieces.castorDesk = pieces.speakers = pieces.workChair = null;
  drawn.backWall = {};
  drawn.radiator = null;
  cupboard = makeCupboard(cupboardSettings(), LIVING_ROOM_PLACE, CUPBOARD_MATERIALS);
  livingGroup.add(cupboard.group);
  return livingGroup;
}

// The bench beside the option's cupboard, from where the option says it
// starts to the right-hand wall, R deep and BENCH high: base cupboards for
// option 9, a bench top for the rest
function drawBench(option, group) {
  const BENCH = config.pieces.bench.design.height, { R } = config.pieces.cornerCupboard.design, from = benchStart(option);
  const bench = new THREE.Group();
  group.add(bench);
  if (option.no === 9) baseCupboards(from, bench);
  else box({ from: [from, 0, 0], to: [ROOM_WIDTH, R, BENCH] }, benchMat, bench);
}

// The bench off: nothing above it either, but the TV's place is kept for
// the sofa to face
function keepTvPlace(option) {
  drawn.tvAt = [(wallClearFrom(option) + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
}


// A piece moved in the living room: a spot that fits in it, its turn in
// quarter turns
const spotFits = ({ x, y, turn }) => x >= 0 && x <= ROOM_WIDTH && y >= 0 && y <= ROOM_DEPTH && turn >= 0 && turn < 360 && turn % QUARTER_TURN === 0;


const SHELF_WOODS = [
  { name: 'As drawn (pale oak)', hex: ['#D6BC8F', '#C8A26B'] },
  { name: 'Honey oak (as the island top)', hex: '#D6A562' },
  { name: 'Dark oak', hex: '#8A5A33' },
  { name: 'Walnut', hex: '#5C3D26' },
];

// Shelf tops from 100 up to under the top board (of `board` thickness,
// under `ceiling`: the living room cupboard's unless given), each once, in
// order: as typed, any numbers in the text, and from a configuration
const shelfTopsOf = (tops, board = config.pieces.cornerCupboard.design.BOARD, ceiling = CEILING_HEIGHT) =>
  [...new Set(tops.filter(v => v >= 100 && v <= ceiling - 2 * board))].sort((a, b) => a - b);
const readShelves = text => shelfTopsOf(String(text).split(/[^0-9]+/).map(Number));

// What the other pieces of the model use
export {
  BEDROOM_ALONG_BREAST, BEDROOM_PLACE, LIVING_ROOM_PLACE, SHELF_WOODS, bedroomCupboard, bedroomDoor, 
  buildBedroomCupboard, buildOption, cupboard, drawBench, keepTvPlace, livingGroup, mustOpenTo, readShelves, 
  shelfTopsOf, spotFits, withoutBench
};
