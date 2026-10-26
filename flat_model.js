// The flat's model: everything drawn, from the settings, with no page: the
// living room's fittings and its corner cupboard (built by
// corner_cupboard.js from its piece of the settings), the bench and what's
// above it, the dresser, larder, island and sofa, the things to store,
// the other rooms' furniture (their modules'), the doors, the 2D views'
// dimensions, the cutting list and the description; and the settings
// themselves, `config`, held as the configuration is, with its schema
// (SCHEMA), each setting's check and default. Drawn into
// `world`, which living_room.js, the page, adds to its scene; Node builds it
// too, for the model's tests (tests/model/), as buildFlat(configuration)
// (REFACTOR_PLAN.md, step 6c). Nothing here reads the DOM: textures are
// drawn on the kit's makeCanvas().
//
// The page's menus change the settings by their paths in the configuration
// (set(), setAll()) and it calls rebuild(display), with what the page
// shows that the drawing follows (2D or 3D, which view, Cupboard only, the
// dimension buttons; DISPLAY_START's fields).
//
// Its pieces are in model/ (CODE_MAP.md lists them): this file builds the
// flat from them, turns the doors, and is what the page and the tests
// import. The schema (model/settings.js) reads the other pieces as it
// loads, so no piece imports it: a piece needing set() or get() at run
// time imports them from here.
import * as THREE from 'three';
import * as Config from './kit/config_kit.js';
import * as Cupboard from './corner_cupboard.js';
import {
  MM, material, box, slab, part, hinge, skewHinge, RAL, oakBoards, makeCanvas, dimLabel, chain, clearDrawing
} from './kit/floor_kit.js';
import {
  CUPBOARD_MATERIALS, makeCupboard, makeMaterials, seeThrough, OPTIONS, optionOf, CURRENT_ROOM, DOOR_GAP, PLINTH, 
  baseDoorCount, spanOf, CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE, sizesInOrder, diagonal, cornerTooShallow, deskSpot, 
  MIN_DIAGONAL
} from './corner_cupboard.js';
import { DRESSER_MODELS } from './dressers.js';
import { LARDER_MODELS } from './larders.js';
import { SOFA_MODELS } from './sofas.js';
import { bookcase } from './bookcase.js';
import { BILLY_CHEST, billy, billySizes, billyChest } from './billy.js';
import { daybed, daybedFrame } from './daybed.js';
import { ivar, ivarSizes } from './ivar.js';
import { CHESHAM, CORNWALL, kitchenTable, tableSizes } from './tables.js';
import { castorDesk, castorDeskSizes } from './castor_desk.js';
import { FENRIS_A5, fenrisA5 } from './speakers.js';
import { DESK_DAYBED, DAYBED_TOP_D, deskDaybed, bedMiddle, deskOpenEnd } from './desk_daybed.js';
import { WORK_CHAIRS, officeChair } from './work_chairs.js';
import {
  drawOtherRoom, pineCupboard, otherRoomPieces, OTHER_ROOM_START, showNewCupboard, turnRecessDoors, 
  OTHER_ROOM_SCHEMA
} from './other_room.js';
import { DOOR_SWINGS, SWING_WAYS } from './bedroom_door.js';
import { drawWickerBench, wickerBenches, WICKER_BENCH_START, WICKER_BENCH_SCHEMA } from './wicker_bench.js';
import { drawShoeRack, shoeRack, SHOE_RACK_START, SHOE_RACK_SCHEMA } from './shoe_rack.js';
import { drawStairWalls, settleStairWalls, STAIR_WALLS_START, STAIR_WALLS_SCHEMA } from './stair_walls.js';
import { drawShoeBoxes, SHOE_BOXES_SCHEMA } from './shoe_boxes.js';
import {
  drawGarage, drawGarageDoor, garagePieces, GARAGE, GARAGE_CORNER, GARAGE_DOOR, GARAGE_START, GARAGE_SCHEMA
} from './garage.js';
import {
  floor, drawFloor, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, wallMat, floorMat, FRIDGE_W, RECESS_FROM, 
  KITCHEN_DEPTH, KITCHEN_RECESS_BACK_WALL_X, DESK_RECESS, SINK_RECESS, DESK_TOP, DOOR_FRAME_STARTS_AT, 
  DOOR_HINGE_AT, ROOM_DOOR, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat, ceilingMat, OUTER, OTHER_ROOM, 
  OTHER_ROOM_CORNER, bedroomHinges, drawBedroomDoorSwing, carpetMat, CARPET_COLOURS, HALLWAY, hallway, ENTRANCE, 
  bathroom, flatDoorHinge, outsideDoorHinge, radiators
} from './floor.js';
import {
  DISPLAY_START, DOORS_START, config, cupboardSettings, doors, drawn, showHallway, world
} from './model/state.js';
import { CHAIR_TURN, deskChair, deskShelves, islandGroup, islandOnWall, placeIsland, roomHinge } from './model/kitchen.js';
import {
  LIVING_ROOM_PLACE, SHELF_WOODS, bedroomCupboard, bedroomDoor, bedroomDoorOpensTo, buildBedroomCupboard, 
  buildOption, cupboard, drawBench, keepTvPlace, livingGroup, mustOpenTo, optionsOnShow, readShelves, 
  rightCupboard, rightCupboardText, withoutBench
} from './model/cupboards.js';
import {
  BACK_WALL_KEYS, TV_H, TV_SIZES, TV_W, benchDrawn, benchHeights, benchStandIns, benchStart, benchWall, 
  onBackWall, pieceOnBenchWall, shelves, spotOf, tvPiece, tvSpot, wallClearFrom, wallEnd
} from './model/bench_wall.js';
import { COLOUR_TARGETS, FINISHES, applyColour, colourOf, shownCode } from './model/colours.js';
import { drawHanging } from './model/hanging.js';
import { drawWalking } from './model/walking.js';
import {
  DRESSERS, DRESSER_SLIDERS, LARDERS, LARDER_SLIDERS, SOFAS, SOFA_SLIDERS, currentSofa, frontFrom, frontGap, 
  frontWall, larderHeight, larderOwnSize, pieces, sofa, sofaHome, sofaOwnSize
} from './model/front_wall.js';
import { cupboardPart, cuttingList, dims, updateDims } from './model/dimensions.js';
import {
  PACKINGS, STORED, drawStored, insideText, placeStored, storedGroup, storedMats, storedSize
} from './model/stored.js';
import {
  castorDeskInLivingRoom, castorDeskSpot, chairAtDaybedDesk, diningTableInLivingRoom, diningTableSpot, firstRadiator, ivarInLivingRoom, ivarSpot, 
  speakersInLivingRoom, tableSpot, tablesInLivingRoom
} from './model/loose_pieces.js';
import {
  DEFAULT_CONFIGURATION, DOORS_SCHEMA, SCHEMA, configurationNow, readConfiguration
} from './model/settings.js';
import {
  BEDROOM_MATERIALS, carcassMat, dresserMat, handleMat, islandMat, islandTopMat, kitchenMat, oakMat, screenMat, 
  shelfMat, tvMat, worktopMat
} from './model/materials.js';

// The dimensions' figures on show (only in a 2D view, or with the cupboard
// on its own), in the order they're drawn
function dimensionFigures() {
  const figures = [];
  dims?.traverse(o => { if (o.userData.text) figures.push(o.userData.text); });
  return figures;
}
// Where each piece is drawn: its box in the living room's mm (x along its
// back wall, y out from it, z up; the other rooms lie round it), to the mm,
// and whether it's on show (a piece taken out is still placed), so a piece
// moved even 2 mm changes the snapshot. null for one not drawn
function boxOf(object) {
  if (!object) return null;
  object.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;
  const round = n => Math.round(n / MM) || 0;                  // || 0: no -0, which the tests tell from 0
  const mm = v => [round(v.x), round(v.z), round(v.y)];
  let shown = true;
  for (let o = object; o; o = o.parent) shown &&= o.visible;
  return { from: mm(box.min), to: mm(box.max), shown };
}
// Each piece drawn, by its name, null where it isn't built: for
// pieceBoxes() and the page's view snapshot (which says how much of each a
// view shows)
const namedPieces = () => {
  const named = flatPieces();
  // The garage's by their keys, but '.garage' after one the flat has already
  // (the pine cupboard, and since 24 Oct 2026 the bookcase, the bedside
  // tables and the rest put away there)
  for (const [key, piece] of Object.entries(garagePieces)) named[key === 'pine' ? 'pineCupboard.garage' : key in named ? `${key}.garage` : key] = piece;
  return named;
};
const flatPieces = () => ({
  livingRoom: livingGroup,                                      // the option and all round it: the bench wall, the front wall, the sofa
  cornerCupboard: cupboard?.group,                              // the option's own build, without the bench
  rightCupboard: rightCupboard?.group,                          // ...and mirrored in the right-hand corner, while it's on
  dresser: pieces.dresser, larder: pieces.larder, sofa: pieces.sofa, island: islandGroup, 'ivar.livingRoom': pieces.ivar,
  'chesham.livingRoom': pieces.chesham, 'cornwall.livingRoom': pieces.cornwall, 'castorDesk.livingRoom': pieces.castorDesk,
  'diningTable.livingRoom': pieces.diningTable,
  'speakers.livingRoom': pieces.speakers,
  'workChair.livingRoom': pieces.workChair,
  bedroomCupboard: otherRoomPieces.newCupboard,
  bed: otherRoomPieces.bed, bookcase: otherRoomPieces.bookcase, pineCupboard: otherRoomPieces.cupboard, mirror: otherRoomPieces.mirror,
  'billy.bedroom': otherRoomPieces.billy, 'billyChest.bedroom': otherRoomPieces.billyChest, 'ivar.bedroom': otherRoomPieces.ivar,
  bedsideTable: otherRoomPieces.bedsideTable, bedsideTableByCupboard: otherRoomPieces.bedsideTableByCupboard,
  kvistbro: otherRoomPieces.kvistbro, laundryBasket: otherRoomPieces.laundryBasket,
  ...Object.fromEntries(Object.entries(wickerBenches).map(([room, bench]) => [`wickerBench.${room}`, bench])),
  shoeRack,
});
const pieceBoxes = () => Object.fromEntries(Object.entries(namedPieces()).map(([name, object]) => [name, boxOf(object)]));

// ---------------------------------------------------------------------------
// Building
// ---------------------------------------------------------------------------
// Worked out from the settings before anything's drawn, none of it kept in
// them (REFACTOR_PLAN.md item 13): the colours' materials, the shelves'
// wood, the TV's size and the heights above the bench, and where the
// island is
export function settle() {
  for (const target of Object.keys(COLOUR_TARGETS)) applyColour(target);
  applyShelfWood();
  benchHeights();
  placeIsland();
}
// The shelves' wood, and option 9's oak, from config.colours.shelves: one colour,
// or the shelves' and the oak's
function applyShelfWood() {
  const [shelves, oak = shelves] = [].concat(SHELF_WOODS[config.colours.shelves].hex);
  for (const materials of [CUPBOARD_MATERIALS, BEDROOM_MATERIALS]) {    // both cupboards'
    materials.shelf.color.set(shelves);
    materials.oak.color.set(oak);
  }
}

// Build the option chosen and everything round it, in every room, reading
// the settings and writing none. A new option starts with its second door
// shut; rebuilding the same one (a size changed) leaves the doors as they
// were. Then the things to store are placed (drawStored() draws them).
// `onShow`: each cupboard's option on show till now (optionsOnShow()), when
// the menus have already set new ones. Returns the option built, whether
// it's the one built before, and the description of what's round it
// (describe())
export function build(onShow = optionsOnShow()) {
  settle();
  const no = config.pieces.cornerCupboard.design.option, option = optionOf(no);
  const same = no === onShow.cornerCupboard && Boolean(cupboard);
  const group = buildOption();
  if (benchDrawn()) drawBench(option, group);
  else keepTvPlace(option);
  const clearFrom = wallClearFrom(option);
  // The back wall's pieces, in front of the bench if it's there; the
  // bench's shelves; and the TV, a piece of its own (its place kept, for
  // the sofa and the views, even when it's off)
  const standing = onBackWall().map(key => pieceOnBenchWall(key, clearFrom, group)).join('');
  const tv = tvSpot(clearFrom);
  drawn.tv = null;
  drawn.tvAt = [tv.middle, 0, tv.bottom + TV_H / 2];
  const backWall = standing + (benchDrawn() ? benchWall(clearFrom, group, tv) : '') + tvPiece(tv, clearFrom, group);
  const aboveText = backWall + frontWall(group) + sofa(group) + ivarInLivingRoom(group) + tablesInLivingRoom(group) + castorDeskInLivingRoom(group) + diningTableInLivingRoom(group) + speakersInLivingRoom(group) + deskShelves(group) + firstRadiator() + chairAtDaybedDesk();
  if (!same) doors.second = 0;
  drawOtherRoom(config);                                         // the bedroom's furniture
  buildBedroomCupboard(onShow.bedroomCupboard);                 // and its own corner cupboard
  drawWickerBench(config.pieces.wickerBench);                           // the wicker bench, in each room it's on in
  drawShoeRack(config.pieces.shoeRack);                                 // the shoe rack, downstairs
  drawStairWalls(config.hallway);                             // the shelves and pictures over the stairs
  drawShoeBoxes(config.hallway.shoeBoxes);                    // and the shoe boxes on the sills
  bathroom.visible = config.hallway.bathroomShown;                       // the bathroom and WC, or not
  drawBedroomDoorSwing(DOOR_SWINGS[bedroomDoor().swings], mustOpenTo(), bedroomDoor().swingShown);   // what the bedroom cupboard keeps clear of
  drawGarage(config);                                          // Sean, Billy, BillyChest and the rest, in the garage
  placeStored();                                                // the cupboard they go in may have changed
  return { option, same, aboveText };
}

// Build the option chosen and draw everything that follows from it, in the order
// each needs (REFACTOR_PLAN.md item 6), as both the page and buildFlat()
// do: build(), the hanging space (while it's compared), the things to store (and the cupboard's shelves cut round
// them), the walking space round the bed (while it's shown, with the doors shut), the doors turned, and last the dimensions, of the shelves and
// doors as drawn. Returns build()'s, and what drawStored() says of the
// things to store
export function rebuild(display, onShow = optionsOnShow()) {
  const built = build(onShow);
  drawHanging(display.hanging);
  const storedText = drawStored(display);
  if (display.walking) withDoorsShut(() => drawWalking(true, walkingPieces()));
  else drawWalking(false);
  turnDoors();
  updateDims(display);
  return { ...built, storedText };
}

const turn = degrees => THREE.MathUtils.degToRad(degrees);


// The doors as the view writes them, and a view's doors read in: any it
// leaves out, or that fail their check, stay as they were
export const doorsNow = () => Config.writeConfiguration(DOORS_SCHEMA, doors);
export const readDoors = given => Config.readConfiguration(DOORS_SCHEMA, given ?? {}, doors);
// Doors turned, as setAll() changes settings: [name, value] pairs, each
// value the view's (a desk's word). Returns whether every one was taken
export function setDoors(edits) {
  const refused = edits.filter(([name, value]) => !Config.readEntry(Config.entryAt(DOORS_SCHEMA, name), value, doors));
  for (const [name, value] of refused) console.error(`${JSON.stringify(value)} isn't an angle for the ${name} door: left as it was`);
  return refused.length === 0;
}
// The doors' angles as they're drawn (a desk's in degrees), for the tests
export const doorAngles = () => structuredClone(doors);

// What walking space measures from: the bed, the new cupboard, and the
// bedroom door as it's kept (withDoorsShut()), which must be able to swing shut
function walkingPieces() {
  const { swings } = bedroomDoor();
  return {
    bed: otherRoomPieces.bed, bedSpot: config.pieces.bed.in.bedroom, cupboard: otherRoomPieces.newCupboard,
    bedroomDoor: { swing: DOOR_SWINGS[swings], open: doors.bedroom, leaf: bedroomHinges[swings] },
  };
}
// Every door shut while `measure` runs (walking space: a cupboard's door is
// measured from its face) but the bedroom's, opened as far as it goes, as
// the user keeps it, against the Knarrevik (26 Oct 2026); then back as the
// view has them, for turnDoors() to turn
function withDoorsShut(measure) {
  const open = { ...doors };
  for (const [name, angle] of Object.entries(doors)) if (typeof angle === 'number') doors[name] = 0;
  doors.bedroom = bedroomDoorOpensTo();
  turnDoors();
  measure();
  Object.assign(doors, open);
}

// The doors turned to their angles (they don't rebuild), each corner
// cupboard's second doors stopping at its room's walls, the recess
// cupboard's together, and the garage door drawn as it is
export function turnDoors() {
  cupboard?.turnDoors(doors);
  rightCupboard?.turnDoors(doors);                              // the right-hand cupboard's with the left one's
  bedroomCupboard?.turnDoors({ tall: doors.bedroomCupboardTall, second: doors.bedroomCupboardSecond, desk: doors.bedroomCupboardDesk });
  roomHinge.rotation.y = turn(doors.room);
  turnBedroomDoor();
  turnRecessDoors(doors.recess);
  for (const [h, name] of [[flatDoorHinge, 'flat'], [outsideDoorHinge, 'outside']]) h.rotation.y = (h.userData.dir ?? 1) * turn(doors[name]);
  drawGarageDoor(doors.garage);
}

// The bedroom door on the hinge it swings on, the other hidden, opened as
// far as its slider says or as far as it can go (bedroomDoorOpensTo()).
// Into the bedroom, so the other way from the living room's door; swinging
// left it turns the other way again
const BEDROOM_DOOR_TURN = { right: -1, left: 1 };
function turnBedroomDoor() {
  const { swings } = bedroomDoor();
  for (const way of SWING_WAYS) bedroomHinges[way].visible = way === swings;
  bedroomHinges[swings].rotation.y = BEDROOM_DOOR_TURN[swings] * turn(Math.min(doors.bedroom, bedroomDoorOpensTo()));
}

// The description of the option built: its summary (without the bench, if
// it's off), where the things to store go, what's round it, and its source,
// as HTML
export function describe(option, aboveText) {
  const summary = config.pieces.cornerCupboard.design.T === 0 && option.summaryNoLeft ? option.summaryNoLeft : option.summary;
  // (the bench's length in it, from the room's width: to the right-hand cupboard while it's there)
  return `${withoutBench(summary(cupboardSettings(), { ...LIVING_ROOM_PLACE, width: wallEnd() }, { BENCH: config.pieces.bench.design.height, benchFrom: benchDrawn() ? benchStart(option) : 0 }))}${rightCupboardText()}${insideText()}${aboveText}<div class="src">From ${option.source}</div>`;
}

// The flat built from a configuration, with no page, seen as `view` shows it
// (DISPLAY_START's fields: a 2D view's id and room, and the switches, for the
// dimensions; and its doors, as the view writes them, any left out as they
// start): what the page's snapshot holds (tests/snapshots/), the
// description as HTML, and the doors as turned
export function buildFlat(configuration, view = {}) {
  startAgain();
  Object.assign(doors, structuredClone(DOORS_START));
  readConfiguration(configuration);                             // (one of version 1 has doors)
  readDoors(view.doors);
  const display = { ...DISPLAY_START, ...view };
  showHallway(display);
  const { option, aboveText } = rebuild(display);
  return {
    world,
    configuration: configurationNow(),
    cupboards: cupboardRows(),
    dimensions: dimensionFigures(),
    description: describe(option, aboveText),
    boxes: pieceBoxes(),
    doors: doorsNow(),
  };
}
// Each corner cupboard's cutting list as rows: the living room's (and its
// mirror on the right, while it's on) and the bedroom's own, while it's
// there (none for the current room)
export const cupboardRows = () => ({
  livingRoom: config.pieces.cornerCupboard.design.option === CURRENT_ROOM ? null : cupboard.cuttingRows(),
  ...(rightCupboard ? { livingRoomRight: rightCupboard.cuttingRows() } : {}),
  bedroom: bedroomCupboard && config.pieces.bedroomCupboard.design.option !== CURRENT_ROOM ? bedroomCupboard.cuttingRows() : null,
});

// The settings as the page starts, and putting them back so: everything,
// not only what's in the configuration (the things to store's places, read
// only when they've been moved by hand, and what's worked out, as where the
// dresser stands), so one configuration shown after another isn't left with
// any of the other's
const START = structuredClone(config);
export function startAgain() {
  for (const key of Object.keys(config)) delete config[key];
  Object.assign(config, structuredClone(START));
}

// What the page reads, besides the functions exported where they're defined
export {
  drawStored,
  BACK_WALL_KEYS, CHAIR_TURN, CURRENT_ROOM, CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE,
  DEFAULT_CONFIGURATION, DRESSERS, DRESSER_SLIDERS, FINISHES, LARDERS,
  LARDER_SLIDERS, OPTIONS, PACKINGS, SCHEMA, SHELF_WOODS, SOFAS,
  SOFA_SLIDERS, STORED, TV_H, TV_SIZES, TV_W, benchDrawn, carcassMat,
  colourOf, configurationNow, cornerTooShallow, cupboard, cupboardPart, deskSpot,
  currentSofa, cuttingList, deskChair, diagonal, dimensionFigures, dims,
  dresserMat, frontFrom, frontGap, handleMat, islandGroup, islandMat,
  islandOnWall, islandTopMat, kitchenMat, larderHeight, larderOwnSize,
  cupboardSettings, oakMat, onBackWall, benchStandIns, optionOf, namedPieces, pieceBoxes, pieces,
  readConfiguration, readShelves, screenMat, shelfMat,
  shownCode, sizesInOrder, sofaHome, sofaOwnSize, spotOf, ivarSpot, tableSpot, castorDeskSpot, diningTableSpot, config, storedGroup,
  storedMats, storedSize, drawn, tvMat, updateDims, worktopMat,
};


// What the pieces export for the page and the tests
export {
  DISPLAY_START, ROOM_BOXES, inLivingRoom, seeThroughCupboards, showHallway, world
} from './model/state.js';
export {
  bedroomDoorOpensTo, bedroomDoorText, cupboardLimits, cupboardOf, optionsOnShow, rightCupboard
} from './model/cupboards.js';
export {
  aboveHasShelves, aboveHasTv, aboveNow, daybedTvShown, tvOn, tvSpotNow
} from './model/bench_wall.js';
export {
  NO_SOFA, dresserSpan
} from './model/front_wall.js';
export {
  placeStored, storedSpots
} from './model/stored.js';
export {
  cupboardTopForSpeakers, speakerSpacingNow, speakerPlaceFor
} from './model/loose_pieces.js';
export {
  BEDROOM_CUPBOARD_RANGES, DESK_SHOWN, DOORS_SCHEMA, get, idIn, set, setAll
} from './model/settings.js';
export {
  hangingText, hangingVerdict, railIn, PINE_RAIL, IDEAL_RAIL
} from './model/hanging.js';
export { walkingText, walkingVerdict, walkingNow, WALK_EASY, WALK_TIGHT } from './model/walking.js';
