// The model's shared state (a piece of flat_model.js): `world`, what's drawn
// into; what's shown as the page opens (DISPLAY_START); each room's box; and `config`,
// the settings, held as the configuration is, with each piece's rooms and
// places. The other pieces read these; only the setters here change the
// lets.
import * as THREE from 'three';
import * as Config from '../kit/config_kit.js';
import { CUPBOARD_MATERIALS, seeThrough, CURRENT_ROOM } from '../corner_cupboard.js';
import { SOFA_MODELS } from '../sofas.js';
import { bookcase } from '../bookcase.js';
import { BILLY_CHEST, billySizes } from '../billy.js';
import { CHESHAM, CORNWALL } from '../tables.js';
import { pineCupboard, OTHER_ROOM_START } from '../other_room.js';
import { WICKER_BENCH_START } from '../wicker_bench.js';
import { SHOE_RACK_START } from '../shoe_rack.js';
import { STAIR_WALLS_START } from '../stair_walls.js';
import { GARAGE, GARAGE_CORNER, GARAGE_START } from '../garage.js';
import {
  floor, drawFloor, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, OTHER_ROOM, OTHER_ROOM_CORNER, HALLWAY, hallway, 
  ENTRANCE
} from '../floor.js';
import { BEDROOM_MATERIALS } from './materials.js';

// Everything drawn: the flat, the hallway and stairs, the garage, in the
// scene's metres (room (x, y, z) mm -> (x, z, y) / 1000)
export const world = new THREE.Group();

// What's shown (the display), which the dimensions, the things to store's
// labels and the hallway follow, given to each build rather than kept here
// (notes/ui_paradigm_analysis.md, recommendation 3): a 2D view or not
// (flat), which (flatView: 'plan', 'back', …) and the room it's of
// (flatRoom); the cupboard on its own (Cupboard only); and the Dimensions
// and Door sizes buttons; and the cupboards' hanging space compared with
// the pine cupboard's (hanging, model/hanging.js). As the page opens:
export const DISPLAY_START = { flat: false, flatView: null, flatRoom: 'livingRoom', cupboardOnly: false, showDims: true, showDoorDims: true, hanging: false };

// The rooms whose wall views the hallway's stairwell would hang below the
// floor of, next door (the hallway's group holds downstairs and the garage
// too, which the garage's own wall views need)
const STAIRWELL_SHOWS_IN = ['livingRoom', 'bedroom'];
export function showHallway({ flat, flatView, flatRoom }) {
  hallway.visible = !flat || flatView === 'plan' || !STAIRWELL_SHOWS_IN.includes(flatRoom);
}

// See-through: every corner cupboard's boards drawn faint, set on their
// materials, which keep it
export function seeThroughCupboards(on) {
  for (const materials of [CUPBOARD_MATERIALS, BEDROOM_MATERIALS]) seeThrough(materials, on);
}

// Each room's box, in the living room's mm (x0 < x1, y0 < y1), its floor
// and its ceiling's height: for the 2D views of its walls (living_room.js's
// wallView()) and their dimensions. The 2D wall views look along x or y at
// the wall on that side: 'back' at y0, 'front' at y1, 'left' at x0, 'right'
// at x1. Downstairs has a plan but no wall views
export const ROOM_BOXES = {
  livingRoom: { x0: 0, x1: ROOM_WIDTH, y0: 0, y1: ROOM_DEPTH, floor: 0, ceiling: CEILING_HEIGHT },
  bedroom: { x0: OTHER_ROOM_CORNER.x, x1: OTHER_ROOM_CORNER.x + OTHER_ROOM.length, y0: OTHER_ROOM_CORNER.y,
    y1: OTHER_ROOM_CORNER.y + OTHER_ROOM.recessBack, floor: 0, ceiling: OTHER_ROOM.ceiling },
  hallway: { x0: HALLWAY.xEnd, x1: HALLWAY.x0, y0: 0, y1: HALLWAY.ySetBack, floor: 0, ceiling: CEILING_HEIGHT },
  garage: { x0: GARAGE_CORNER.x, x1: GARAGE_CORNER.x + GARAGE.length, y0: GARAGE_CORNER.y, y1: GARAGE_CORNER.y + GARAGE.width,
    floor: ENTRANCE.floor, ceiling: ENTRANCE.floor + GARAGE.height },
};

// Room coordinates in mm: x along the back wall from the left wall, y from
// the back wall towards the front, z up. The scene is y-up in metres:
// room (x, y, z) -> scene (x, z, y). kit/floor_kit.js has the stage
// (renderer, cameras, lights) and the helpers that draw in these mm.

// What the last build drew, which the other pieces look up: the TV's
// middle (room [x, y, height], or where it would be), the first window's
// radiator while it's in (floor.js draws it), and the back wall's pieces by
// their keys
const drawn = { tvAt: null, tv: null, radiator: null, backWall: {} };

drawFloor();                                                    // once: the walls, the rooms' shells, the stairs
world.add(floor);
// ---------------------------------------------------------------------------
// The living room as it is now (the user's photo and measurements, 18 Oct
// 2026): no cupboard or bench yet; BillyChest in the corner by the
// windows, its back to the window wall and its drawers facing the left wall,
// and along the back wall to its left, Billy lying on its side; the Drift
// with its back to Billy; in the corner by the door, Cornwall on the floor
// with its legs off, 1200 along the left wall, and Chesham on its end on
// it, its top against the back wall. Each spot is the middle of its back,
// room x and y, and its turn, as the pieces' sliders give it (in 5s).
// Turned 90°, a piece faces the left wall, its back to the right; 270°,
// the other way round.
// ---------------------------------------------------------------------------
const PIPE_GAP = 90;               // BillyChest's back to the window wall, for the radiator's pipe: measured
const BILLY_TO_CHEST = 380;        // the gap between Billy's end and BillyChest: measured
const SOFA_OFF_BILLY = 300;        // the sofa's back from Billy's front: estimated from the photo
const to5 = mm => Math.round(mm / 5) * 5;                         // as the sliders hold it
const LOUNGE_NOW = (() => {
  const chestBack = ROOM_WIDTH - PIPE_GAP;                                          // 3748
  const billyLong = billySizes(true).w;                                              // 2020 lying
  const billyX = to5(chestBack - BILLY_CHEST.d - BILLY_TO_CHEST - billyLong / 2);    // 1875
  const sofaD = SOFA_MODELS.list.drift.d;
  return {
    billyChest: { x: chestBack, y: to5(BILLY_CHEST.w / 2), turn: 90 },             // its side against the back wall
    billy: { x: billyX, y: 0, turn: 0 },
    sofa: { x: billyX, y: billySizes(true).d + SOFA_OFF_BILLY + sofaD / 2, turn: 180 },   // its back to Billy; y 975
    cornwall: { x: 0, y: CORNWALL.L / 2, turn: 270 },              // from the back wall along the left wall, nearly to the door frame (1329)
    chesham: { x: CHESHAM.W / 2, y: 0, turn: 0 },                  // in the corner, on Cornwall
  };
})();

// ---------------------------------------------------------------------------
// The settings: everything the menus set and the address saves, in one
// place, changed by the menus only through set() (below). They're the
// configuration, as the page holds it (REFACTOR_PLAN.md items 14 and 15):
// laid out as it is, each setting by its word, so a setting's path is the
// same in both, and the address is them written out (configurationNow()).
// The cupboard's sizes keep the short names the drawing code and
// room_dimensions.md use; a function that draws reads the ones it needs at
// its top, as `const { T, R, BOARD } = config.pieces.cornerCupboard.design;`.
// What's worked out from the settings isn't kept here (the heights above
// the bench, the TV's width and height, where the dresser stands), and nor
// is the view (kit/view_kit.js).
// ---------------------------------------------------------------------------
const config = {
  // Each piece once, with its design and the rooms it's in, as the
  // configuration has it (room_dimensions.md)
  pieces: {
    // The living room's corner cupboard: its design, as corner_cupboard.js's
    // CUPBOARD_SETTINGS, which cupboardSettings() gives makeCupboard()
    cornerCupboard: { design: {
      option: 10,                      // the option on show, by its number (7 to 11, or 16): 10 here, for the bedroom's copy; the living room's is set to 16 below OPTIONS
      // The left-wall cupboard's depth from the wall: 0 (none), or 300 to 800 in
      // 10s. Option 8 needs it, so it's unavailable at 0. Everything
      // along the back wall starts from it. 600 to start, as option 7 has when
      // chosen.
      T: 600,
      R: 330,                          // the rear-wall cupboards' and bench's depth from the back wall: 300 to 800
      F: 1200,                         // the left-wall cupboard's front, out from the back wall: 1000 up to the room's door (cupboardLimits()). Its inside leg along the left wall is F - R
      // The thickness of the boards (MDF or chipboard) every cupboard is built
      // from, 12 to 25: the same for all of them. Cupboards' outside sizes stay
      // as set, so thicker boards take room from the inside.
      BOARD: 18,
      TOP: 0,                          // how high the full-height parts stand: 0 to the ceiling, or 1800 up to it (asked for, 18 Oct 2026)
      LEG: 600,                        // option 7's back-wall leg, inside along the back wall: 400 to 1200 (the bedroom's to its recess). Its door is LEG - BOARD - 2 * DOOR_GAP wide, or more doors past MAX_DOOR_W. Option 8 has its own, DIAG_RUN
      LEG_D: 600,                      // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench, which stays R deep
      L_SHELVES: { back: [600, 1200, 1800], left: [600, 1200, 1800] },   // ...and its shelf tops in the back-wall leg (with the inside corner) and the left-wall leg
      DIAG_RUN: 700,                   // option 8's back-wall leg, inside along the back wall from the left-wall cupboard: 400 up to the room's limit (700 as it was first drawn)
      DIAG_BACK: 0,                    // ...its front running straight in from the back-wall leg's end before the diagonal starts: 0 (none) on
      DIAG_LEFT: 0,                    // ...and likewise from the left-wall leg's end (both asked for, 18 Oct 2026)
      ENDS: false,                     // options 7 and 8's shallow ends: each leg's last stretch shallower, stepping in (asked for, 22 Oct 2026)
      END_BACK: 400,                   // ...the back-wall leg's, in from its end (100 to 1200; held to the leg) and its depth from the back wall (150 to 800): both chosen
      END_BACK_D: 300,
      END_LEFT: 400,                   // ...and the left-wall leg's, in from its end (100 to 1300) and its depth from the left wall
      END_LEFT_D: 300,
      WARD: 900,                       // option 9's full-height double-door cupboard on the back wall: 600 to 1400 wide
      WARD_D: 600,                     // ...its own depth from the back wall (330 to 1000), so it can stand deeper than the bench and tower, which stay R deep
      TOWER: 400,                      // ...then an open shelving tower: 0 to 600 wide (0 for none)
      CORNER_W: 800,                   // options 10 and 11's full-height corner cupboard, along the back wall: 500 to 1200 (the bedroom's to its recess). Option 10's doors are (CORNER_W - BOARD - 3 * DOOR_GAP) / 2 wide each, or two pairs past MAX_DOOR_W
      CORNER_D: 650,                   // ...and out along the left wall, in place of F: 0 to 1329 (the door frame; the bedroom's to its door's swing). Too shallow (cornerTooShallow()), it isn't built
      SIDE_SHELF: false,               // option 10's full-height side bookshelf, between the corner cupboard and the TV: drawn or not
      SIDE_W: 400,                     // ...its width along the back wall, 200 to 800, the cupboard's side included (it shares it)
      SIDE_D: 330,                     // ...and its depth from the back wall, 150 to 800
      // Option 10's fold-down desk, on the cupboard's side facing the windows
      // (corner_cupboard.js's foldDownDesk()): drawn or not, its width along
      // the side (held to the side's clear run), how far it reaches out when
      // open, and its top's height when open (chosen with the user, 20 Oct
      // 2026: 780 fills the 820 the photo layout's side leaves, 20 clear each
      // end; 500 deep for a laptop and arms; 740, a usual desk height).
      // Whether it's folded away or down is with the doors' angles, in the
      // view (doors.desk, DESK_SHOWN)
      DESK: false,
      DESK_W: 780,
      DESK_D: 500,
      DESK_H: 740,
    } },
    // The bedroom's corner cupboard (its New cupboard): its own settings, as
    // the living room's. To start, a copy of the living room's (set below
    // OPTIONS)
    bedroomCupboard: { design: null },
    // The right-hand corner cupboard (asked for, 26 Oct 2026): the living
    // room's corner cupboard mirrored into the back-right corner, so the
    // bench runs between two matching cupboards; on or off, and its own
    // reach out along the right-hand wall from the back wall, which the first
    // window's recess holds short (cupboards.js's RIGHT_REACH_MOST: 724).
    // Its option, sizes, colour and doors are the left one's
    rightCupboard: { in: { livingRoom: { on: false, reach: 724 } } },
    // The bench along the back wall: its height (700, 780, 800 or 900), and
    // drawn, with what's above it; off, the back wall's bare (there's none
    // yet: LOUNGE_NOW)
    bench: { design: { height: 780 }, in: { livingRoom: { on: false } } },
    // Above the bench: its shelves, one of ABOVE_BENCH (laid out round the
    // TV while that's on), and their depth (150 to 400)
    aboveBench: { design: { what: 'shelves', shelfDepth: 250 } },
    // The TV, a piece of its own (the user's, 24 Oct 2026): its size in
    // inches, one of TV_SIZES; on the back wall or not; and its middle from
    // the left wall and its bottom off the floor, or null for where it
    // goes on its own (tvSpot(): over the bench, else over the daybed, else
    // on the clear wall)
    tv: { design: { inches: 75 }, in: { livingRoom: { on: false, along: null, bottom: null } } },
    // The dresser's, larder's and sofa's sizes, and which larder and sofa:
    // these until set from dressers.js, larders.js and sofas.js below
    dresser: { design: { w: 1320, h: 2100, baseD: 400, baseH: 900, upperD: 290 } },
    larder: { design: { model: '', w: 1100, h: 1950, d: 510 } },
    sofa: {
      design: { model: 'none', w: 1690, d: 1000, h: 920,   // model 'none' (NO_SOFA), or one of SOFAS
        asBed: false },          // a daybed (the Drift) laid out as a bed, its arms down
      in: { livingRoom: { front: 1900,                 // its front from the TV wall
        move: LOUNGE_NOW.sofa } },   // ...or moved and turned from there: { x, y, turn } (see sofaSpot), or null where it starts
    },
    // The island: which, one of ISLAND_TYPES; IKEA's (tornviken.js) layout,
    // one of ISLAND_LAYOUTS; the custom one's (custom_island.js) worktop's
    // length, width and overhang (CUSTOM_ISLAND's to start); where it is, one of ISLAND_AT; out there, where its
    // middle is and how far it's turned (ISLAND_HOME to start); and its
    // chairs, one of ISLAND_CHAIRS
    island: { design: { type: 'ikea', layout: 'standard', custom: { length: 0, width: 0, overhang: 0 } }, in: { livingRoom: { at: 'room', x: 0, y: 0, turn: 0, chairs: 'in' } } },
    // In the living room against the back wall, or in front of the bench
    // while it's on: the bedroom's bookcase and pine
    // cupboard, Billy and BillyChest from the garage (billy.js), and the daybed with a desk and bookcase, each moved
    // round the room from there ({ x, y, turn }, see BACK_WALL_PIECES, or null
    // where it starts), Billy standing or lying on its long side, its open
    // side out
    bookcase: { in: { livingRoom: { on: false, move: null } } },
    pineCupboard: { in: { livingRoom: { on: false, move: null } } },
    billy: { in: { livingRoom: { on: true, lying: true, move: LOUNGE_NOW.billy } } },   // where it is now
    billyChest: { in: { livingRoom: { on: false, move: LOUNGE_NOW.billyChest } } },      // in the corner, as now, but out to start (asked for, 24 Oct 2026: the lounge not cluttered)
    // ...and the daybed with a desk and bookcase (desk_daybed.js), out to
    // start, its desk at the left end or the right (deskAt), as it can be
    // put together; and the work chair at its desk: none, or one of WORK_CHAIRS (the smaller, for who'll use it)
    deskDaybed: { design: { deskAt: 'left' }, in: { livingRoom: { on: false, move: null, chair: 'small' } } },
    // The Ivar (ivar.js), by the first radiator, lying on its side, as it is
    // now (IVAR_HOME), out to start (asked for, 24 Oct 2026), and moved
    // round the room from there, or null where it starts
    ivar: { in: { livingRoom: { on: false, lying: true, move: null } } },
    // The kitchen tables (tables.js), in the corner by the door, as it is now
    // (LOUNGE_NOW), hidden to start (asked for, 19 Oct 2026): Chesham on its
    // end, its top against the wall behind it (else on its legs), Cornwall
    // on the floor with its legs off (else on its legs); each moved round the
    // room from there, as the Ivar
    chesham: { in: { livingRoom: { on: false, onItsEnd: true, move: null } } },
    cornwall: { in: { livingRoom: { on: false, legsOff: true, move: null } } },
    // The desk on castors (castor_desk.js), off to start, parked by the door
    // ('byTheDoor') or wheeled out in front of the TV ('atTheTv'): CASTOR_DESK_HOMES;
    // and moved from there, as the Ivar
    castorDesk: { in: { livingRoom: { on: false, at: 'byTheDoor', move: null } } },
    // The dining table (dining_table.js), to try with the four Foxglove
    // chairs: rectangular or round (one of DINING_SHAPES), its size (chosen
    // to start: what two chairs a side want, and four round), out to start,
    // its chairs tucked in or pulled out, and moved from the middle of the
    // room (null there), as the Ivar
    diningTable: { design: { shape: 'rectangular', length: 1500, width: 850, diameter: 1050 },
      in: { livingRoom: { on: false, chairsOut: false, move: null } } },
    // The speakers (speakers.js), a pair: on nothing to start ('none'), or
    // on one of SPEAKER_PLACES; and on the bench, Billy and the daybed, the distance
    // between their middles, or null for where they start there
    // The shelves over the desk in the desk recess (model/kitchen.js): how
    // many (0, 1 or 2, one of DESK_SHELF_COUNTS) and how deep (150 to 400;
    // 250 to start, as the TV wall's)
    deskShelves: { design: { count: 0, depth: 250 } },
    speakers: { in: { livingRoom: { on: 'none', spacing: { bench: null, billy: null, deskDaybed: null } } } },
  },
  colours: { floor: 0, cupboard: 4, wall: 0, woodwork: 0, dresser: 0, carpet: 0, bedroomCupboard: 0, diningChairs: 0,   // a RAL code or finish for each of COLOUR_TARGETS, 0 for its default: AI Olive cupboards, the bedroom's following them
    shelves: 0 },                  // the shelves' wood, which of SHELF_WOODS
  livingRoom: { frontWall: 'none',     // on the front wall between the sink and the desk: one of FRONT_PIECES (none yet)
    firstRadiator: true },             // the radiator under the first window, which could be taken out (asked for, 22 Oct 2026)
  // The bedroom's door: which way it swings going in, 'right' as it is or
  // 'left' (bedroom_door.js); swinging left, how far it must be able to
  // open, which the new cupboard keeps clear of (chosen to start: right
  // back to the wall); and its swing drawn on the floor, or not
  bedroom: { door: { swings: 'right', mustOpenTo: 90, swingShown: false } },
  // The things to store: shown or not, which of PACKINGS, where (0 by the
  // middle window, 1 in the corner cupboard, 2 moved by hand), and each
  // thing's { x, y, turned, z } once moved by hand (set up with STORED below)
  thingsToStore: { shown: false, packing: 0, where: 'window', spots: [] },   // ...where they are now once STORED is set up (STORED_NOW)
  // The hallway: the shelves and pictures on the walls over the stairs, and
  // the shoe boxes on the sills, none to start (stair_walls.js,
  // shoe_boxes.js); and the bathroom and WC drawn, or hidden to see the
  // hallway and stairs past them
  hallway: { ...structuredClone(STAIR_WALLS_START), bathroomShown: true },
};
// A piece's place in the living room, by its key in the living room's
// controls (BACK_WALL_KEYS, the tables, the Ivar, the desk on castors):
// the bookshelf is the bookcase, and the pine the pine cupboard
const LIVING_ROOM_PIECES = { bookshelf: 'bookcase', pine: 'pineCupboard' };
// The other rooms' settings, from their modules, laid out as the
// configuration is: the bedroom's furniture, where it stands and its sizes
// (other_room.js)
Config.mergeInto(config, structuredClone(OTHER_ROOM_START));
// ...and the hallway's wicker bench: its sizes, and in which rooms and
// where (wicker_bench.js)
Config.mergeInto(config, structuredClone(WICKER_BENCH_START));
// ...and the shoe rack at the foot of the stairs: its sizes, and whether
// it's there (shoe_rack.js)
Config.mergeInto(config, structuredClone(SHOE_RACK_START));
// ...and Sean, Billy, BillyChest and the rest, in the garage: where each
// stands (garage.js)
Config.mergeInto(config, structuredClone(GARAGE_START));
export const inLivingRoom = key => config.pieces[LIVING_ROOM_PIECES[key] ?? key].in.livingRoom;

// How far each door is open, in degrees, up to its slider's most
// (index.html): the room door, the left-wall cupboard's tall door, the
// option's other door or doors, the bedroom's, downstairs the flat's own
// door and the lobby's outside door, and the bedroom cupboard's tall and
// other doors; each fold-down desk folded away (0) or down (90,
// DESK_SHOWN); and the garage door, not shown, open or closed (garage.js's
// GARAGE_DOOR). They're the view's, not the configuration's: a door's
// angle changes nothing that's made, so it's how you're looking, as the
// camera is (REFACTOR_PLAN.md item 12, decided 17 Oct 2026 in
// notes/ui_paradigm_analysis.md). Set by the door controls and by some views (the
// room door shut on walking in, the cupboard's open for packing), and
// turned by turnDoors(), without rebuilding
const DOORS_START = { room: 90, tall: 0, second: 0, bedroom: 90, flat: 0, outside: 0, bedroomCupboardTall: 0, bedroomCupboardSecond: 0, desk: 0, bedroomCupboardDesk: 0, recess: 0, garage: 'hidden' };   // recess: the upper recess cupboard's doors, all together
const doors = structuredClone(DOORS_START);


// ---------------------------------------------------------------------------
// The corner cupboard: corner_cupboard.js's makeCupboard() makes it from its
// settings (its piece of the configuration, config.pieces.cornerCupboard.design), the living
// room as its place, and its materials; buildOption() keeps it in
// `cupboard`. Its shelves are drawn round the things to store (from
// drawStored()).
// ---------------------------------------------------------------------------
// A corner cupboard's settings, by its piece's name: a copy, so a
// cupboard built from them isn't changed by the menus till it's built again
const cupboardSettings = (piece = 'cornerCupboard') => ({ ...config.pieces[piece].design });
// The bedroom's New cupboard starts as option 10 (its list has no current
// room); the living room has no cupboard yet, the current room (LOUNGE_NOW)
config.pieces.bedroomCupboard.design = structuredClone(config.pieces.cornerCupboard.design);
config.pieces.cornerCupboard.design.option = CURRENT_ROOM;

// What the other pieces of the model use
export {
  DOORS_START, LOUNGE_NOW, config, cupboardSettings, doors, drawn
};
