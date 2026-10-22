// The settings' schema (a piece of flat_model.js): each setting's path,
// check and default, reading and writing a configuration, and set() and
// get(), which the menus change the settings by.
import * as Config from '../kit/config_kit.js';
import { optionOf } from '../corner_cupboard.js';
import { WORK_CHAIRS } from '../work_chairs.js';
import { OTHER_ROOM_SCHEMA } from '../other_room.js';
import { SWING_WAYS } from '../bedroom_door.js';
import { WICKER_BENCH_SCHEMA } from '../wicker_bench.js';
import { SHOE_RACK_SCHEMA } from '../shoe_rack.js';
import { settleStairWalls, STAIR_WALLS_SCHEMA } from '../stair_walls.js';
import { SHOE_BOXES_SCHEMA } from '../shoe_boxes.js';
import { GARAGE_DOOR, GARAGE_SCHEMA } from '../garage.js';
import { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, OTHER_ROOM, hallway } from '../floor.js';
import { DOORS_START, config, doors } from './state.js';
import { ISLAND_AT, ISLAND_CHAIRS, ISLAND_LAYOUTS, ISLAND_TYPES } from './kitchen.js';
import {
  BEDROOM_ALONG_BREAST, BEDROOM_PLACE, SHELF_WOODS, bedroomCupboard, cupboardLimits, shelfTopsOf, spotFits
} from './cupboards.js';
import { ABOVE_BENCH, TV_SIZES } from './bench_wall.js';
import { COLOUR_TARGETS, colourOf } from './colours.js';
import {
  DRESSER_SLIDERS, FRONT_PIECES, LARDERS, LARDER_SLIDERS, NO_SOFA, SOFAS, SOFA_SLIDERS, pieces
} from './front_wall.js';
import { BY_HAND, PACKINGS, STORED_WHERE } from './stored.js';
import { CASTOR_DESK_HOMES, SPEAKER_PLACES } from './loose_pieces.js';
import { SLIDER_RANGES } from './slider_ranges.js';
import { readDoors } from '../flat_model.js';

// ---------------------------------------------------------------------------
// The configuration: every setting as JSON, by piece, each piece with its
// design and the rooms it's in (`in`), with the doors, the colours and the
// things to store (REFACTOR_PLAN.md, step 6; room_dimensions.md has its
// format). SCHEMA has an entry for each setting (kit/config_kit.js), the
// living room's here and the other rooms' from their modules: each its path,
// in the configuration and in `config` alike, its check and its default.
// Ranges are the sliders' in index.html, unless an entry says.
// ---------------------------------------------------------------------------
const CONFIGURATION_VERSION = 2;   // up only when a setting changes its path or meaning: 2 when the doors went into the view (22 Oct 2026)
for (const [, id, lo, hi, step] of [...DRESSER_SLIDERS, ...LARDER_SLIDERS, ...SOFA_SLIDERS]) SLIDER_RANGES[id] = [lo, hi, step];
// A control's id in a copy of the living room's controls: the piece's name,
// then the living room's id with a capital, as 'bedroomCupboardDepth' for
// 'depth' (cupboard_controls.js's copyControls())
export const idIn = piece => name => `${piece}${name[0].toUpperCase()}${name.slice(1)}`;
// The bedroom cupboard's sliders that reach further than the living
// room's (a copy of them, each id with 'bedroomCupboard' before it): along
// the chimney breast to the recess, and out to the hallway wall (where they
// can go as its settings stand is cupboardLimits())
export const BEDROOM_CUPBOARD_RANGES = {
  leg: [400, BEDROOM_ALONG_BREAST, 1], diagRun: [400, BEDROOM_ALONG_BREAST, 1], cornerW: [500, BEDROOM_ALONG_BREAST, 1],   // in 1s, to reach the recess exactly
  leftLen: [1000, OTHER_ROOM.breastFace, 1], cornerD: [0, OTHER_ROOM.breastFace, 1],
};
// A number held to the range of the slider with this id, which it keeps
// (`slider`), for the test; `range`, when it isn't the living room's
function fromSlider(path, id, more, range = SLIDER_RANGES[id]) {
  const [min, max, step] = range;
  return { ...Config.number(path, min, max, step, more), slider: id };
}
const isColour = code => code === 0 || Boolean(colourOf(code));
// The speakers' spacing on one place: on the slider's steps, or null where they start
function speakerSpacingEntry(path) {
  const [min, max, step] = SLIDER_RANGES.speakerSpacing;
  return Config.other(path, v => (v === null ? null : Number.isFinite(v) && v >= min && v <= max && (v - min) % step === 0 ? v : undefined));
}
// A place moved to in the living room, or null where it starts
const spotOrHome = path => Config.other(path, v => (v === null ? null : v && spotFits(v) ? { x: v.x, y: v.y, turn: v.turn } : undefined));
// The things to store's places are read only when they've been moved by
// hand; otherwise they're worked out from the packing (placeStored())
function readStoredSpots(spots, was, settings) {
  if (settings.thingsToStore.where !== BY_HAND || !Array.isArray(spots)) return undefined;
  const finite = v => typeof v === 'number' && Number.isFinite(v);
  return was.map((spot, k) => {
    const { x, y, turned, z } = spots[k] ?? {};
    if (!finite(x) || !finite(y)) return spot;
    return { x, y, turned: turned === true, z: finite(z) && z >= 0 && z <= CEILING_HEIGHT ? z : 0 };
  });
}
// A corner cupboard's entries: its design at `design` (as
// 'pieces.cornerCupboard.design'), under its room's `ceiling`, its sliders'
// ids `id(name)` from the living room's, and their `ranges` where they
// aren't the living room's. The option by its number; the boards'
// thickness before option 7's shelves, checked against it and the ceiling
function cupboardEntries(design, ceiling, { id = name => name, ranges = {} } = {}) {
  const at = key => `${design}.${key}`;
  const slider = (key, name) => fromSlider(at(key), id(name), {}, ranges[name] ?? SLIDER_RANGES[name]);
  return [
    Config.other(at('option'), no => (optionOf(no) ? no : undefined), no => no),
    Config.number(at('T'), 0, 800, 10, { also: t => t === 0 || t >= 300 }),   // none, or 300 to 800
    slider('R', 'rear'),
    slider('F', 'leftLen'),
    slider('BOARD', 'board'),
    Config.number(at('TOP'), 0, ceiling, 10, { also: top => top === 0 || top >= SLIDER_RANGES.top[0] }),   // the ceiling, or 1800 up to it
    slider('LEG', 'leg'),
    slider('LEG_D', 'legD'),
    ...['back', 'left'].map(leg => Config.other(at(`L_SHELVES.${leg}`),
      (tops, was, settings) => (Array.isArray(tops) ? shelfTopsOf(tops.filter(Number.isFinite), Config.valueAt(settings, at('BOARD')), ceiling) : undefined),
      tops => [...tops])),
    slider('DIAG_RUN', 'diagRun'),
    slider('DIAG_BACK', 'diagBack'),
    slider('DIAG_LEFT', 'diagLeft'),
    slider('WARD', 'ward'),
    slider('WARD_D', 'wardD'),
    slider('TOWER', 'tower'),
    slider('CORNER_W', 'cornerW'),
    slider('CORNER_D', 'cornerD'),
    Config.onOff(at('SIDE_SHELF')),
    slider('SIDE_W', 'sideW'),
    slider('SIDE_D', 'sideD'),
    Config.onOff(at('DESK')),
    slider('DESK_W', 'deskW'),
    slider('DESK_D', 'deskD'),
    slider('DESK_H', 'deskH'),
  ];
}
// Each cupboard's fold-down desk is shown one of two ways (asked for, 20 Oct
// 2026), not turned by a slider as the doors are: folded away (upright, 0°)
// or down, ready to use (level, 90°). Its angle is kept with the doors'
const DESK_ANGLES = ['desk', 'bedroomCupboardDesk'];
export const DESK_SHOWN = { foldedAway: 0, down: 90 };
// The doors' entries, in the view's doors (`doors`, above), each by its
// name: the sliders' angles (roomDoor, tallDoor and so on), the fold-down
// desks and the garage door
const SLIDER_DOORS = Object.keys(DOORS_START).filter(name => !DESK_ANGLES.includes(name) && name !== 'garage');
export const DOORS_SCHEMA = Config.withDefaults([
  ...SLIDER_DOORS.map(name => fromSlider(name, `${name}Door`)),
  ...DESK_ANGLES.map(name => Config.choice(name, DESK_SHOWN)),
  Config.choice('garage', Object.keys(GARAGE_DOOR)),
], doors);
const LIVING_ROOM_SCHEMA = [
  ...Object.keys(COLOUR_TARGETS).map(key => Config.colour(`colours.${key}`, isColour)),
  Config.number('colours.shelves', 0, SHELF_WOODS.length - 1, 1, { onSteps: true }),
  Config.choice('livingRoom.frontWall', FRONT_PIECES),
  Config.onOff('livingRoom.firstRadiator'),
  ...cupboardEntries('pieces.cornerCupboard.design', CEILING_HEIGHT),
  ...cupboardEntries('pieces.bedroomCupboard.design', BEDROOM_PLACE.ceiling, { id: idIn('bedroomCupboard'), ranges: BEDROOM_CUPBOARD_RANGES }),
  // The bench along the back wall, and what's above it
  Config.choice('pieces.bench.design.height', [700, 780, 800, 900]),
  Config.onOff('pieces.bench.in.livingRoom.on'),
  Config.choice('pieces.aboveBench.design.what', ABOVE_BENCH),
  fromSlider('pieces.aboveBench.design.shelfDepth', 'shelfDepth'),
  Config.choice('pieces.aboveBench.design.tv', TV_SIZES.map(([inches]) => inches)),
  // The dresser, the larder and the sofa: each a model from dressers.js,
  // larders.js or sofas.js, and its sizes (the larder's and the sofa's held
  // to their sliders' ends)
  ...DRESSER_SLIDERS.map(([key, id]) => fromSlider(`pieces.dresser.design.${key}`, id)),
  Config.choice('pieces.larder.design.model', Object.keys(LARDERS)),
  ...LARDER_SLIDERS.map(([key, id]) => fromSlider(`pieces.larder.design.${key}`, id, { clamp: true })),
  Config.choice('pieces.island.in.livingRoom.at', ISLAND_AT),
  Config.number('pieces.island.in.livingRoom.x', 0, ROOM_WIDTH, 5),
  Config.number('pieces.island.in.livingRoom.y', 0, ROOM_DEPTH, 5),
  fromSlider('pieces.island.in.livingRoom.turn', 'islandTurn'),
  Config.choice('pieces.island.design.type', ISLAND_TYPES),
  Config.choice('pieces.island.design.layout', ISLAND_LAYOUTS),
  fromSlider('pieces.island.design.custom.length', 'islandLength'),
  fromSlider('pieces.island.design.custom.width', 'islandWidth'),
  Config.choice('pieces.island.in.livingRoom.chairs', ISLAND_CHAIRS),
  Config.choice('pieces.sofa.design.model', [NO_SOFA, ...Object.keys(SOFAS)]),
  ...SOFA_SLIDERS.map(([key, id]) => fromSlider(`pieces.sofa.design.${key}`, id, { clamp: true })),
  Config.onOff('pieces.sofa.design.asBed'),
  fromSlider('pieces.sofa.in.livingRoom.front', 'sofaFront'),
  spotOrHome('pieces.sofa.in.livingRoom.move'),
  // The bedroom's pieces (other_room.js), then the bookcase and the pine
  // cupboard in the living room, in place of the bench
  ...OTHER_ROOM_SCHEMA,
  Config.onOff('pieces.bookcase.in.livingRoom.on'),
  spotOrHome('pieces.bookcase.in.livingRoom.move'),
  Config.onOff('pieces.pineCupboard.in.livingRoom.on'),
  spotOrHome('pieces.pineCupboard.in.livingRoom.move'),
  Config.onOff('pieces.billy.in.livingRoom.on'),
  Config.onOff('pieces.billy.in.livingRoom.lying'),
  spotOrHome('pieces.billy.in.livingRoom.move'),
  Config.onOff('pieces.billyChest.in.livingRoom.on'),
  spotOrHome('pieces.billyChest.in.livingRoom.move'),
  Config.choice('pieces.deskDaybed.design.deskAt', ['left', 'right']),
  Config.onOff('pieces.deskDaybed.in.livingRoom.on'),
  Config.onOff('pieces.deskDaybed.in.livingRoom.tvAbove'),
  Config.choice('pieces.deskDaybed.in.livingRoom.chair', ['none', ...Object.keys(WORK_CHAIRS)]),
  spotOrHome('pieces.deskDaybed.in.livingRoom.move'),
  Config.onOff('pieces.ivar.in.livingRoom.on'),
  Config.onOff('pieces.ivar.in.livingRoom.lying'),
  spotOrHome('pieces.ivar.in.livingRoom.move'),
  Config.onOff('pieces.chesham.in.livingRoom.on'),
  Config.onOff('pieces.chesham.in.livingRoom.onItsEnd'),
  spotOrHome('pieces.chesham.in.livingRoom.move'),
  Config.onOff('pieces.castorDesk.in.livingRoom.on'),
  Config.choice('pieces.castorDesk.in.livingRoom.at', Object.keys(CASTOR_DESK_HOMES)),
  spotOrHome('pieces.castorDesk.in.livingRoom.move'),
  Config.onOff('pieces.cornwall.in.livingRoom.on'),
  Config.onOff('pieces.cornwall.in.livingRoom.legsOff'),
  spotOrHome('pieces.cornwall.in.livingRoom.move'),
  // The speakers: where, and how far apart on the bench and on Billy (null
  // for where they start)
  Config.choice('pieces.speakers.in.livingRoom.on', SPEAKER_PLACES),
  ...Object.keys(config.pieces.speakers.in.livingRoom.spacing).map(place => speakerSpacingEntry(`pieces.speakers.in.livingRoom.spacing.${place}`)),
];
const SCHEMA = Config.withDefaults([
  ...LIVING_ROOM_SCHEMA,
  ...WICKER_BENCH_SCHEMA,
  ...SHOE_RACK_SCHEMA,
  ...STAIR_WALLS_SCHEMA,
  ...SHOE_BOXES_SCHEMA,
  Config.onOff('hallway.bathroomShown'),
  // The bedroom's door: which way it swings, how far it must open, and its swing shown
  Config.choice('bedroom.door.swings', SWING_WAYS),
  fromSlider('bedroom.door.mustOpenTo', 'bedroomDoorMustOpenTo'),
  Config.onOff('bedroom.door.swingShown'),
  ...GARAGE_SCHEMA,
  // The things to store: shown or not, which packing, and where
  Config.onOff('thingsToStore.shown'),
  Config.number('thingsToStore.packing', 0, PACKINGS.length - 1, 1, { onSteps: true }),
  Config.choice('thingsToStore.where', STORED_WHERE),
  Config.other('thingsToStore.spots', readStoredSpots, (spots, settings) => (settings.thingsToStore.where === BY_HAND ? structuredClone(spots) : undefined)),   // only when they're settings
], config);
// The settings as a configuration, and a configuration read into them. One
// of version 1 had the doors in it (`doors`), which are the view's now, so
// they're read as the view's, and the rest as it is: a link from before
// keeps working
const configurationNow = () => Config.writeConfiguration(SCHEMA, config, { version: CONFIGURATION_VERSION });
function readConfiguration(configuration) {
  if (configuration?.version === 1) {
    readDoors(configuration.doors);
    configuration = { ...configuration, version: CONFIGURATION_VERSION };
  }
  if (configuration?.version !== CONFIGURATION_VERSION) {
    console.warn(`A configuration of version ${configuration?.version}, not ${CONFIGURATION_VERSION}: the page starts as it is`);
    return;
  }
  Config.readConfiguration(SCHEMA, configuration, config);
  holdSettings();
}
const DEFAULT_CONFIGURATION = Config.defaultConfiguration(SCHEMA, { version: CONFIGURATION_VERSION });

// ---------------------------------------------------------------------------
// Changing the settings, by their paths in the configuration: what the
// menus do, rather than writing `config` themselves (REFACTOR_PLAN.md,
// set(path, value)). Each value is the configuration's (an option's
// number, `what`'s word, sizes in mm), checked by its entry as a link's
// are, so one that fails changes nothing. A cupboard's controls name its
// design's path, so the same controls can change either cupboard
// ---------------------------------------------------------------------------
function entryFor(path) {
  const entry = Config.entryAt(SCHEMA, path);
  if (!entry) throw new Error(`no setting at ${path}`);
  return entry;
}
// Each [path, value] of `edits` in turn, as one change (a setting checked
// against another comes after it, as the schema lists them). Returns
// whether every one was taken. One refused is an error in the console, as
// it means a control and its setting's entry disagree (the browser tests
// fail on one)
export function setAll(edits) {
  const refused = edits.filter(([path, value]) => !Config.readEntry(entryFor(path), value, config));
  for (const [path, value] of refused) console.error(`${JSON.stringify(value)} isn't a setting for ${path}: left as it was`);
  holdSettings();
  return refused.length === 0;
}
// Settings held to what can be built, as they're set or read, so building
// writes none (REFACTOR_PLAN.md item 13): each cupboard's option 8 needs a
// left-wall cupboard, so with none it's option 7, the L; the dresser's
// upper part is never deeper than its base; the bedroom cupboard keeps
// clear of its door's swing; and the shelves, pictures and
// shoe boxes over the stairs stay on their walls and sills and clear of
// each other (stair_walls.js's settleStairWalls())
function holdSettings() {
  for (const piece of ['cornerCupboard', 'bedroomCupboard']) {
    const settings = config.pieces[piece].design;
    if (settings.T === 0 && optionOf(settings.option).needsLeft) settings.option = 7;
  }
  config.pieces.dresser.design.upperD = Math.min(config.pieces.dresser.design.upperD, config.pieces.dresser.design.baseD);
  holdClearOfBedroomDoor();
  settleStairWalls(config.hallway);
}
// The bedroom cupboard brought in clear of its door's swing, which a
// change of the door's settings may have moved: its length along the
// kitchen-side wall first, then what that holds back (its diagonal)
function holdClearOfBedroomDoor() {
  const design = config.pieces.bedroomCupboard.design;
  for (const key of ['F', 'CORNER_D']) design[key] = Math.min(design[key], cupboardLimits('bedroomCupboard')[key]);
  for (const [key, most] of Object.entries(cupboardLimits('bedroomCupboard'))) if (design[key] > most && most >= 0) design[key] = most;
}
export const set = (path, value) => setAll([[path, value]]);
// A setting's value, as the configuration has it
export const get = path => Config.configurationValue(entryFor(path), config);

// What the other pieces of the model use
export {
  DEFAULT_CONFIGURATION, SCHEMA, configurationNow, readConfiguration
};
