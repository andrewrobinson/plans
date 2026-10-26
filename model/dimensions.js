// The 2D views' dimensions (a piece of flat_model.js): each wall's and
// each room's plan's, the doors' sizes and the cutting list.
import * as THREE from 'three';
import { MM, box, chain } from '../kit/floor_kit.js';
import { optionOf } from '../corner_cupboard.js';
import { GARAGE, GARAGE_CORNER } from '../garage.js';
import {
  ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, RECESS_FROM, KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, 
  DESK_TOP, DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, ROOM_DOOR, FRAME_H, ROOM_DOOR_H, FRAME_END, OUTER, OTHER_ROOM, 
  OTHER_ROOM_CORNER, HALLWAY, hallway, ENTRANCE
} from '../floor.js';
import {
  ROOM_BOXES, config, cupboardSettings, inLivingRoom, world
} from './state.js';
import { KITCHEN, MONITOR_TOP, deskShelfTops } from './kitchen.js';
import { bedroomDoor, cupboard, cupboardOf } from './cupboards.js';
import {
  BACK_WALL_PIECES, SHELF_TOPS, TV_BOTTOM, TV_GAP, TV_H, TV_MIDDLE_SHELF, TV_SHELF_TOPS, TV_W, aboveHasShelves, aboveNow, 
  benchDrawn, benchStart, onBackWall, shelves, wallClearFrom, wallEnd
} from './bench_wall.js';
import { frontSpan } from './front_wall.js';

// ---------------------------------------------------------------------------
// Dimensions for the 2D views, drawn from the current option and settings
// ---------------------------------------------------------------------------
let dims = null;                   // the group of dimensions on show

// Room (x, y, z) in mm to a scene point
const P = (x, y, z) => new THREE.Vector3(x * MM, z * MM, y * MM);

// dimLine(), dimLabel() and chain(), which draw them, are the kit's

// Heights of what's above the bench: shelf tops, and the TV's bottom and top
function aboveHeights(x0) {
  const above = aboveNow();
  const tv = [TV_BOTTOM, TV_BOTTOM + TV_H];
  if (above === 'shelves') return SHELF_TOPS;
  if (above === 'topShelf') return TV_SHELF_TOPS.slice(1);
  if (above === 'tv') return tv;
  if (above === 'tvAndTopShelf') return [...tv, ...TV_SHELF_TOPS.slice(1)];
  if (above === 'tvAndShelves') {
    const side = Math.floor((wallEnd() - x0 - TV_W) / 2 - TV_GAP);
    return [...TV_SHELF_TOPS, ...tv, ...(side >= 200 ? [TV_MIDDLE_SHELF] : [])];
  }
  return [];
}

// Heights up the back wall, for the back view: the bench and what's above
// it, or the bookcase's top in its place (unless it's been moved off the
// wall), or nothing with neither
function backWallHeights(option) {
  if (benchDrawn()) return [config.pieces.bench.design.height, ...aboveHeights(wallClearFrom(option))];
  const againstWall = key => { const m = inLivingRoom(key).move; return !m || (m.y === 0 && m.turn === 0); };
  return onBackWall().filter(againstWall).map(key => BACK_WALL_PIECES[key].sizes().h);
}

// The dimensions for what's shown (`display`, as DISPLAY_START)
function updateDims(display) {
  const { flat, flatView, flatRoom, cupboardOnly, showDims } = display;
  if (dims) world.remove(dims);
  dims = null;
  if (cupboardOnly && cupboard && (!flat || showDims)) {
    dims = new THREE.Group();
    world.add(dims);
    cupboard.dims({ flat, flatView }, dims);
    doorDims(dims, display);
    return;
  }
  if (!flat || !showDims || !flatView) return;
  dims = new THREE.Group();
  world.add(dims);
  const BENCH = config.pieces.bench.design.height, { shelfDepth } = config.pieces.aboveBench.design, above = aboveNow(), { T, R, F } = config.pieces.cornerCupboard.design;
  const option = optionOf(config.pieces.cornerCupboard.design.option), settings = cupboardSettings();
  const alongBack = [0, option.fixedWidth ? 0 : T, ...(option.marks ? option.marks(settings) : []), benchStart(option), wallClearFrom(option), wallEnd(), ROOM_WIDTH];
  const alongLeft = [0, R, ...(option.front ? [option.front(settings)] : T || option.fixedWidth ? [F] : []), DOOR_FRAME_STARTS_AT, DOOR_HINGE_AT, DOOR_HINGE_AT + ROOM_DOOR, FRAME_END];
  if (flatView === 'plan' && flatRoom === 'bedroom') {
    bedroomPlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'hallway') {
    hallwayPlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'downstairs') {
    entrancePlanDims(dims);
  } else if (flatView === 'plan' && flatRoom === 'garage') {
    garagePlanDims(dims);
  } else if (flatView === 'plan') {
    chain(alongBack, (v, off) => P(v, -250 - off, CEILING_HEIGHT), dims);
    chain([...alongLeft, RECESS_FROM, ROOM_DEPTH], (v, off) => P(KITCHEN_RECESS_BACK_WALL_X - 300 - off, v, CEILING_HEIGHT), dims);
    chain([KITCHEN_RECESS_BACK_WALL_X, KITCHEN_RECESS_BACK_WALL_X + KITCHEN_DEPTH, 0], (v, off) => P(v, ROOM_DEPTH + 250 + off, CEILING_HEIGHT), dims); // the recess and kitchen depth
    chain([0, ROOM_WIDTH], (v, off) => P(v, ROOM_DEPTH + 250 + off, CEILING_HEIGHT), dims);
    chain([0, R, ...(aboveHasShelves(above) ? [shelfDepth] : []), ROOM_DEPTH], (v, off) => P(ROOM_WIDTH + 250 + off, v, CEILING_HEIGHT), dims);
  } else if (flatRoom !== 'livingRoom') {
    roomWallDims(ROOM_BOXES[flatRoom], flatView, dims);
  } else if (flatView === 'back') {
    chain(alongBack, (v, off) => P(v, ROOM_DEPTH, -200 - off), dims);
    chain([0, ...backWallHeights(option), CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH + 250 + off, ROOM_DEPTH, v), dims);
  } else if (flatView === 'left') {
    chain([...alongLeft, RECESS_FROM, ROOM_DEPTH], (v, off) => P(ROOM_WIDTH, v, -200 - off), dims);
    chain([0, ROOM_DOOR_H, FRAME_H, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, FRAME_END + 300 + off, v), dims);
    chain([0, BENCH, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, -250 - off, v), dims);
  } else if (flatView === 'front') {
    const { alcove, worktop } = KITCHEN;
    const piece = frontSpan();                                  // the dresser or larder on the front wall
    chain([KITCHEN_RECESS_BACK_WALL_X, alcove.x[1], KITCHEN.frontRunTo + KITCHEN.counterPast, ...(piece ? [piece.x0, piece.x1] : []), DESK_RECESS.x0, ROOM_WIDTH], (v, off) => P(v, ROOM_DEPTH, -200 - off), dims);
    if (piece) chain(piece.heights, (v, off) => P(piece.x0 + 200 + off, ROOM_DEPTH, v), dims);   // on its face
    chain([0, worktop, alcove.top, CEILING_HEIGHT], (v, off) => P(KITCHEN_RECESS_BACK_WALL_X - 250 - off, ROOM_DEPTH, v), dims);   // the kitchen side
    chain([0, DESK_TOP, MONITOR_TOP, ...deskShelfTops(), CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH + 250 + off, ROOM_DEPTH, v), dims);     // the desk, monitor and shelf tops
  } else if (flatView === 'right') {
    const { windows, sill, top, radiator, end } = OUTER;
    chain([0, ...windows.flatMap(w => w.y), ROOM_DEPTH, end], (v, off) => P(ROOM_WIDTH, v, -200 - off), dims);
    chain([0, radiator.bottom, radiator.top, sill, top, CEILING_HEIGHT], (v, off) => P(ROOM_WIDTH, -250 - off, v), dims);
  }
  doorDims(dims, display);
}

// Another room's wall, seen from inside: the wall's length, under it, and
// the room's height, beside it
function roomWallDims(box, view, g) {
  if (!box) return;
  const { x0, x1, y0, y1, floor: f, ceiling: c } = box;
  const alongX = view === 'back' || view === 'front', y = view === 'back' ? y1 : y0, x = view === 'left' ? x1 : x0;
  if (alongX) {
    chain([x0, x1], (v, off) => P(v, y, f - 200 - off), g);
    chain([f, c], (v, off) => P(x1 + 250 + off, y, v), g);
  } else {
    chain([y0, y1], (v, off) => P(x, v, f - 200 - off), g);
    chain([f, c], (v, off) => P(x, y1 + 250 + off, v), g);
  }
}

// The bedroom's plan: along its hallway wall (the door's opening), its
// window wall (the window) and the recess's back (the chimney breast), in
// its own mm, from its corner by the window and the hallway
function bedroomPlanDims(g) {
  const { length, breastFace, recessBack, recessWidth, ceiling, doorFrom, doorTo, window: win } = OTHER_ROOM, { x, y } = OTHER_ROOM_CORNER;
  chain([0, doorFrom, doorTo, length], (v, off) => P(x + v, y - 250 - off, ceiling), g);
  chain([0, win.from, win.from + win.width, breastFace, recessBack], (v, off) => P(x - win.reveal - 250 - off, y + v, ceiling), g);
  chain([0, recessWidth, length], (v, off) => P(x + v, y + recessBack + 250 + off, ceiling), g);
}
// The hallway's plan, in the living room's mm: along its stairs side (the
// winders' square, to the newel), along its bedroom side (the step back and
// the doorway), and across at its far end (the right sill board, the well,
// the left board and the banister's base, and the kitchen side)
function hallwayPlanDims(g) {
  const { x0, xStep, xEnd, xTurn, yHallOut, yWellOut, yWellIn, ySillEdge, yBoxFace, kitchenSide, ySetBack, bedroomDoor } = HALLWAY;
  chain([xEnd, xTurn, x0], (v, off) => P(v, -250 - off, CEILING_HEIGHT), g);
  chain([xEnd, bedroomDoor[0], xStep, x0], (v, off) => P(v, ySetBack + 250 + off, CEILING_HEIGHT), g);
  chain([yHallOut, yWellOut, yWellIn, ySillEdge, yBoxFace, kitchenSide, ySetBack], (v, off) => P(xEnd - 250 - off, v, CEILING_HEIGHT), g);
}

// The stairs' and entrance's plan, in the living room's mm: along the
// stairs' outside wall (the back wall, the flat's door, the bottom step,
// the winders' square, the door wall), and across beside the back wall
// (the well, the wall to the lobby, the outside door and the lobby)
function entrancePlanDims(g) {
  const { x0, xTurn, xFoot, yWellOut, yWellIn } = HALLWAY;
  const { xBack, flatDoorHingeX: f0, flatDoor, yLobby0, yLobby1, outsideDoorHingeY: o1, outsideDoor } = ENTRANCE;
  chain([xBack, f0, f0 + flatDoor.width, xFoot, xTurn, x0], (v, off) => P(v, yWellOut - 250 - off, CEILING_HEIGHT), g);
  chain([yWellOut, yWellIn, yLobby0, o1 - outsideDoor.width, o1, yLobby1], (v, off) => P(xBack - 250 - off, v, CEILING_HEIGHT), g);
}

// The garage's plan, from its corner (garage.js): along its right-hand
// wall, looking in (its length), and across its door's end (the door)
function garagePlanDims(g) {
  const { length, width, height, door } = GARAGE, { x, y } = GARAGE_CORNER, top = ENTRANCE.floor + height;
  const d0 = (width - door.width) / 2;
  chain([0, length], (v, off) => P(x + v, y - 250 - off, top), g);
  chain([0, d0, d0 + door.width, width], (v, off) => P(x + length + 250 + off, y + v, top), g);
}


// Cupboard only: the corner cupboard on its own (the option's build), with
// its dimensions, in the 3D and 2D views alike
const cupboardPart = (o, withDoors = true) => Boolean(cupboard) && cupboard.partOf(o, withDoors);
// The cupboard's door sizes, with the Door sizes button on
function doorDims(g, { flat, flatView, showDoorDims }) {
  if (cupboard && showDoorDims) cupboard.doorDims({ flat, flatView }, g);
}

// A corner cupboard's cutting list, by its piece's name (the living room's
// unless given), for the page
const cuttingList = (piece = 'cornerCupboard') => cupboardOf(piece)?.cuttingList() ?? new Map();

// What the other pieces of the model use
export {
  P, cupboardPart, cuttingList, dims, updateDims
};
