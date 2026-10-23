// The living room's back wall (a piece of flat_model.js): the bench and the
// TV and shelves above it, the base cupboards, the pieces that stand along
// the wall in its place (Billy, the pine cupboard, the daybed) and the
// daybed's TV.
import * as THREE from 'three';
import { MM, box } from '../kit/floor_kit.js';
import { optionOf, DOOR_GAP, PLINTH, baseDoorCount } from '../corner_cupboard.js';
import { bookcase } from '../bookcase.js';
import { BILLY_CHEST, billy, billySizes, billyChest } from '../billy.js';
import { daybed } from '../daybed.js';
import { DESK_DAYBED, deskDaybed, bedMiddle } from '../desk_daybed.js';
import { pineCupboard } from '../other_room.js';
import { ROOM_WIDTH, CEILING_HEIGHT } from '../floor.js';
import { config, cupboardSettings, drawn, inLivingRoom } from './state.js';
import { cupboard } from './cupboards.js';
import { carcassMat, doorMat, handleMat, oakMat, screenMat, shelfMat, tvMat } from './materials.js';
import { turnPiece } from '../kit/units_kit.js';

// ---------------------------------------------------------------------------
// Above the bench, on the clear back wall from x0 to W: nothing, three
// shelves, a TV, or a TV with shelves either side. Each option's clearFrom()
// gives x0, where its cupboards above the bench end (benchFrom() is where the
// bench itself starts). Returns a sentence for
// the summary.
// ---------------------------------------------------------------------------
const SHELF_T = 25, TV_GAP = 150;
// Standard TV sizes in inches, with each TV's overall width and height in mm,
// from LG UK's size guide (lg.com/uk, "How to measure and read TV sizes").
// The slider steps through them; 75" (1680 x 960) to start with.
// The shelves above the bench (aboveBench.design.what), by their word:
// none, three right across (round the TV while it's on), or one at the top
const ABOVE_BENCH = ['nothing', 'shelves', 'topShelf'];
// The TV's a piece of its own (pieces.tv, the user's, 24 Oct 2026), so
// what's above the bench is its shelves and, while the bench and the TV are
// both there, the TV: as one word, as it was before ('tv' alone, 'tvAndShelves',
// 'tvAndTopShelf'), which the layout and the dimensions go by
export const tvOn = () => config.pieces.tv.in.livingRoom.on;
const WITH_TV = { nothing: 'tv', shelves: 'tvAndShelves', topShelf: 'tvAndTopShelf' };
export const aboveNow = () => {
  const { what } = config.pieces.aboveBench.design;
  return tvOn() && benchDrawn() ? WITH_TV[what] : what;
};
export const aboveHasTv = what => what.startsWith('tv');
export const aboveHasShelves = what => what !== 'nothing' && what !== 'tv';
const TV_SIZES = [[32, 720, 440], [40, 900, 500], [42, 930, 540], [43, 970, 570], [48, 1070, 620],
  [50, 1120, 650], [55, 1230, 710], [60, 1340, 770], [65, 1450, 830], [70, 1570, 910], [75, 1680, 960],
  [77, 1710, 980], [83, 1840, 1050], [85, 1890, 1080], [86, 1930, 1110]];
// The TV's width and height, and heights above the bench, set from the TV
// size and BENCH by benchHeights(). With
// the bench at 780 and a 65" TV: shelves at 1200, 1550, 1900; the TV from 1100
// to 1930; with the TV, a bottom shelf at 1000 under it and a top one at 2080
// over it, both right across, and a middle one at 1550 beside it. A TV over
// 65" pushes the top shelf up to keep it 150 clear, and if that leaves under
// 60 below the ceiling there's no top shelf.
let TV_W, TV_H, SHELF_TOPS, TV_BOTTOM, TV_SHELF_TOPS, TV_MIDDLE_SHELF;
function benchHeights() {
  const BENCH = config.pieces.bench.design.height;
  [, TV_W, TV_H] = TV_SIZES.find(([inches]) => inches === config.pieces.tv.design.inches);
  SHELF_TOPS = [BENCH + 420, BENCH + 770, BENCH + 1120];
  TV_BOTTOM = BENCH + 320;
  const top = Math.max(BENCH + 1300, TV_BOTTOM + TV_H + TV_GAP);
  TV_SHELF_TOPS = [BENCH + 220, ...(top <= CEILING_HEIGHT - 60 ? [top] : [])];
  TV_MIDDLE_SHELF = BENCH + 770;
}

function shelves(x0, x1, g, tops = SHELF_TOPS) {
  for (const top of tops) box({ from: [x0, 0, top - SHELF_T], to: [x1, config.pieces.aboveBench.design.shelfDepth, top] }, shelfMat, g);
}


// The TV on the back wall, its middle at x along it and its bottom that
// high: its case 50 deep and its screen, 15 in from its edges; drawn.tvAt there
// The TV drawn in a group of its own (drawn.tv), so it can be picked out:
// its middle `middle` along the back wall, its bottom `bottom` off the floor
function drawTv(middle, bottom, g) {
  const tx = middle - TV_W / 2, tv = new THREE.Group();
  drawn.tvAt = [middle, 0, bottom + TV_H / 2];
  box({ from: [tx, 0, bottom], to: [tx + TV_W, 50, bottom + TV_H] }, tvMat, tv);
  box({ from: [tx + 15, 50, bottom + 15], to: [tx + TV_W - 15, 52, bottom + TV_H - 15] }, screenMat, tv, false);
  g.add(tv);
  drawn.tv = tv;
}
// "a 75"" or "an 85"", for the summary
const tvWords = inches => `${String(inches).startsWith('8') ? 'an' : 'a'} ${inches}"`;

// ---------------------------------------------------------------------------
// The TV, a piece of its own: where it goes on its own, over the bench
// (centred on the clear wall, TV_BOTTOM up), else over the daybed against
// the back wall, else on the clear wall as over the bench; or where it's
// been put (along and bottom, either or both). x0: where the back wall's
// clear from. { middle, bottom, how }: how it got there, 'bench', 'daybed',
// 'wall' or 'moved'
// ---------------------------------------------------------------------------
function tvSpot(x0) {
  const onWall = { middle: (x0 + ROOM_WIDTH) / 2, bottom: TV_BOTTOM };
  const daybed = daybedTv();
  // (over the daybed only while it's on: off, its place is the wall's, as the sofa's centred on it)
  const auto = benchDrawn() ? { ...onWall, how: 'bench' } : tvOn() && 'middle' in daybed ? { ...daybed, how: 'daybed' } : { ...onWall, how: 'wall' };
  const { along, bottom } = config.pieces.tv.in.livingRoom;
  if (along === null && bottom === null) return auto;
  return { middle: along ?? auto.middle, bottom: bottom ?? auto.bottom, how: 'moved' };
}
// Where the TV is with the settings as they are now, for its sliders
export const tvSpotNow = () => tvSpot(wallClearFrom(optionOf(config.pieces.cornerCupboard.design.option)));
// The TV's over the daybed (where the speakers there go either side of it)
export const daybedTvShown = () => tvOn() && tvSpot(0).how === 'daybed';
// Drawn, if it's on, unless over the bench, where the bench's shelves are
// laid out round it and say it (benchWallItems()). Returns a sentence for
// the summary
function tvPiece(tv, x0, g) {
  if (!tvOn() || tv.how === 'bench') return '';
  drawTv(tv.middle, tv.bottom, g);
  const what = `${tvWords(config.pieces.tv.design.inches)} TV (${TV_W} × ${TV_H})`, height = `from ${tv.bottom} to ${tv.bottom + TV_H}`;
  if (tv.how === 'daybed') return ` Above the daybed: ${what}, centred on its bed, ${height}.`;
  if (tv.how === 'wall') return ` On the back wall: ${what}, centred on the ${ROOM_WIDTH - x0} of clear wall, ${height}.`;
  return ` On the back wall: ${what}, its middle ${Math.round(tv.middle)} from the left wall, ${height}.`;
}

function benchWall(x0, g, tv) {
  const { shelfDepth } = config.pieces.aboveBench.design, above = aboveNow(), { R } = config.pieces.cornerCupboard.design;
  const span = ROOM_WIDTH - x0;
  if (above === 'nothing' || span <= 0) return '';                         // nothing, or no bench (the current room)
  return benchWallItems(x0, span, g, tv) +
    (shelfDepth > R && above !== 'tv' ? ` The shelves stand ${shelfDepth - R} proud of the ${R}-deep bench.` : '');
}

// Above the bench: its shelves, and the TV while it's on, the shelves laid
// out round it. Over the bench by itself, the TV's drawn here, centred on
// the clear wall if it fits; put somewhere else, it's drawn as a piece
// (tvPiece()) and the shelves beside it still keep TV_GAP clear of it
function benchWallItems(x0, span, g, tv) {
  const { shelfDepth } = config.pieces.aboveBench.design, above = aboveNow(), inches = config.pieces.tv.design.inches;
  if (above === 'shelves') {
    shelves(x0, ROOM_WIDTH, g);
    return ` Above the bench: three ${shelfDepth}-deep shelves, ${span} long, at ${SHELF_TOPS.join(', ')}.`;
  }
  const [below, over] = TV_SHELF_TOPS;
  if (above === 'topShelf') {
    if (!over) return ` Above the bench: no room for a top shelf: it would be within 60 of the ceiling.`;
    shelves(x0, ROOM_WIDTH, g, [over]);
    return ` Above the bench: a ${shelfDepth}-deep shelf right across, ${span} long, at ${over}.`;
  }
  const own = tv.how === 'bench';
  if (own && span < TV_W + 20) {                                 // the TV doesn't fit beside the cupboards
    const none = ` Above the bench: no room for the ${inches}" TV, ${TV_W} wide, only ${span} of clear wall.`;
    if (above === 'tv') return none;
    const tops = above === 'tvAndTopShelf' ? TV_SHELF_TOPS.slice(1) : TV_SHELF_TOPS;
    if (!tops.length) return none;
    shelves(x0, ROOM_WIDTH, g, tops);
    return none + ` ${shelfDepth}-deep shelves right across, ${span} long, at ${tops.join(' and ')}.`;
  }
  if (own) drawTv(tv.middle, tv.bottom, g);                      // centred on the clear wall
  const tvText = own ? ` Above the bench: ${tvWords(inches)} TV (${TV_W} × ${TV_H}), centred on the ${span} of clear wall, from ${TV_BOTTOM} to ${TV_BOTTOM + TV_H}.` : '';
  const shelvesText = own ? '' : ' Above the bench:';
  const noTop = ` No room for a shelf above it: it would be within 60 of the ceiling.`;
  if (above === 'tv') return tvText;
  if (above === 'tvAndTopShelf') {
    if (!over) return tvText + noTop;
    shelves(x0, ROOM_WIDTH, g, [over]);
    return tvText + `${shelvesText} A ${shelfDepth}-deep shelf right across above it, ${span} long, at ${over}.`;
  }
  shelves(x0, ROOM_WIDTH, g, TV_SHELF_TOPS);
  const shelfText = over
    ? `${shelvesText} ${shelfDepth}-deep shelves right across, ${span} long, below it at ${below} and above it at ${over}.`
    : `${shelvesText} A ${shelfDepth}-deep shelf right across below it, ${span} long, at ${below}.` + noTop;
  // A middle shelf each side of the TV, TV_GAP clear of it, where there's room
  const left = Math.floor(tv.middle - TV_W / 2 - TV_GAP - x0), right = Math.floor(ROOM_WIDTH - (tv.middle + TV_W / 2 + TV_GAP));
  if (left < 200 && right < 200) return tvText + shelfText + ` No room for a middle shelf beside it: only ${Math.max(Math.min(left, right), 0)} each side.`;
  if (left >= 200) shelves(x0, x0 + left, g, [TV_MIDDLE_SHELF]);
  if (right >= 200) shelves(ROOM_WIDTH - right, ROOM_WIDTH, g, [TV_MIDDLE_SHELF]);
  if (left === right) return tvText + shelfText + ` A middle shelf at ${TV_MIDDLE_SHELF} either side, ${left} long, ${TV_GAP} clear of the TV.`;
  const sides = [left >= 200 ? `${left} long on its left` : '', right >= 200 ? `${right} long on its right` : ''].filter(Boolean).join(' and ');
  return tvText + shelfText + ` A middle shelf at ${TV_MIDDLE_SHELF}, ${sides}, ${TV_GAP} clear of the TV.`;
}


// ---------------------------------------------------------------------------
// The bench's base cupboards (option 9's), drawn by drawBench()
// ---------------------------------------------------------------------------
const TOP_T = 30;                                               // the bench top's thickness (chosen)

// Base cupboards along the bench, x0 to W: a recessed plinth, doors about 450
// wide hinged in pairs, and an oak top at BENCH. Returns how many doors.
function baseCupboards(x0, g) {
  const BENCH = config.pieces.bench.design.height, { R, BOARD } = config.pieces.cornerCupboard.design;
  box({ from: [x0, 0, PLINTH], to: [ROOM_WIDTH, R - BOARD, BENCH - TOP_T] }, carcassMat, g);   // carcass behind the doors
  box({ from: [x0, 0, 0], to: [ROOM_WIDTH, R - 60, PLINTH] }, carcassMat, g);              // plinth, set back 60
  box({ from: [x0, 0, BENCH - TOP_T], to: [ROOM_WIDTH, R, BENCH] }, oakMat, g);            // top
  const span = ROOM_WIDTH - x0;
  const n = baseDoorCount(span);
  const w = (span - DOOR_GAP * (n + 1)) / n;
  for (let k = 0; k < n; k++) {
    const d0 = x0 + DOOR_GAP + k * (w + DOOR_GAP);
    box({ from: [d0, R - BOARD, PLINTH + DOOR_GAP], to: [d0 + w, R, BENCH - TOP_T - DOOR_GAP] }, doorMat, g);
    // Doors open in pairs, so handles sit by the edges that meet
    const hx = k % 2 === 0 ? d0 + w - 40 : d0 + 20;
    box({ from: [hx, R, BENCH - TOP_T - 180], to: [hx + 20, R + 22, BENCH - TOP_T - 40] }, handleMat, g, false);
  }
  return n;
}

// The pieces that can stand in the living room in place of the bench (the
// back wall's Bookshelf, Pine cupboard, Billy and BillyChest switches), the
// bedroom's at their bedroom sizes, Billy (standing or lying) and BillyChest
// at their own: its settings are inLivingRoom(key).on and .move,
// its controls `${key}On`, `${key}X` and so on. Where one stands: the middle
// of its back, room x and y, and how far it's turned, in quarter turns (as
// in the bedroom), which way it faces given in FACING. Each starts with its
// back to the back wall (`home`, from x0, where the clear wall starts): the
// bookcase centred on the clear wall, as the TV is, or against the
// cupboards if it's wider than that wall; the pine cupboard in the corner
// by the right-hand wall (chosen, 15 Oct 2026), the bookcase then centred
// on what's left, so the two can stand together; Billy and BillyChest
// against the cupboards, where the bench starts (asked for, 18 Oct 2026). Their
// sliders move them from there.
const BACK_WALL_PIECES = {
  bookshelf: {
    sizes: () => config.pieces.bookcase.design, draw: bookcase, name: "A bookcase like the bedroom's", short: 'the bookcase',
    home: (x0, w) => ({ x: Math.max(x0 + w / 2, (x0 + clearTo()) / 2), y: 0, turn: 0 }),
    homeText(x0, w) {
      const span = clearTo() - x0, beside = pineInCorner() ? ' beside the pine cupboard' : '';
      return w <= span ? `centred on the ${span} of clear wall${beside}` : `against the cupboards, ${w - span} wider than the ${span} of clear wall${beside}`;
    },
  },
  pine: {
    sizes: () => config.pieces.pineCupboard.design, draw: pineCupboard, name: "The bedroom's pine cupboard", short: 'the pine cupboard',
    home: (x0, w) => ({ x: ROOM_WIDTH - w / 2, y: 0, turn: 0 }),
    homeText: () => 'in the corner by the right-hand wall',
  },
  billy: {
    sizes: () => billySizes(config.pieces.billy.in.livingRoom.lying), draw: () => billy(config.pieces.billy.in.livingRoom.lying), short: 'Billy',
    get name() { return config.pieces.billy.in.livingRoom.lying ? 'Billy, from the garage, lying on its long side' : 'Billy, from the garage'; },
    home: (x0, w) => ({ x: x0 + w / 2, y: 0, turn: 0 }),
    homeText: () => 'against the cupboards, where the bench starts',
  },
  billyChest: {
    sizes: () => BILLY_CHEST, draw: billyChest, name: 'BillyChest, from the garage', short: 'BillyChest',
    home: (x0, w) => ({ x: x0 + w / 2, y: 0, turn: 0 }),
    homeText: () => 'against the cupboards, where the bench starts',
  },
  deskDaybed: {
    sizes: () => DESK_DAYBED, draw: () => deskDaybed(config.pieces.deskDaybed.design.deskAt), short: 'the daybed',
    get name() { return `The daybed with a desk and bookcase, its desk at the ${config.pieces.deskDaybed.design.deskAt} end`; },
    home: (x0, w) => ({ x: x0 + w / 2, y: 0, turn: 0 }),
    homeText: () => 'against the cupboards, where the bench starts',
  },
};
// Where the bookcase's clear wall ends: at the right-hand wall, or at the
// pine cupboard while it's in the corner there, where it starts
const pineInCorner = () => config.pieces.pineCupboard.in.livingRoom.on && !config.pieces.pineCupboard.in.livingRoom.move;
const clearTo = () => (pineInCorner() ? ROOM_WIDTH - config.pieces.pineCupboard.design.w : ROOM_WIDTH);
const BACK_WALL_KEYS = Object.keys(BACK_WALL_PIECES);
const FACING = { 0: 'the front wall', 90: 'the left wall', 180: 'the back wall', 270: 'the right wall' };
const onBackWall = () => BACK_WALL_KEYS.filter(key => inLivingRoom(key).on);
// The pine cupboard in the corner by the door, standing in for the corner
// cupboard there (route b in notes/PERMUTATIONS.md, 22 Oct 2026): moved, its back
// to the left wall (facing the right wall), no further from it than
// PINE_BY_DOOR_X. There it isn't in the bench's place: the bench, and what's
// above it, start past it
const PINE_BY_DOOR_X = 100;          // its back's furthest from the left wall, to count as against it (chosen: it stands 60 off)
const FACING_RIGHT_WALL = 270;
function pineByTheDoor() {
  const { on, move } = inLivingRoom('pine');
  return on && Boolean(move) && move.turn === FACING_RIGHT_WALL && move.x <= PINE_BY_DOOR_X;
}
// The back wall's pieces standing where the bench would be: in front of
// it while it's there, in its place while it isn't
const benchStandIns = () => onBackWall().filter(key => key !== 'pine' || !pineByTheDoor());
// Past the pine cupboard by the door, if it's there
const pastPine = x => (pineByTheDoor() ? Math.max(x, inLivingRoom('pine').move.x + config.pieces.pineCupboard.design.d) : x);
// Where the bench starts, and where the back wall above it is clear from,
// for the option: past its cupboards, and past the pine cupboard by the door
const benchStart = option => pastPine(option.benchFrom(cupboardSettings()));
const wallClearFrom = option => pastPine(option.clearFrom(cupboardSettings()));
// The bench is drawn whenever it's on: it matters more than the pieces
// that once stood in its place and hid it (the user's, 24 Oct 2026)
const benchDrawn = () => config.pieces.bench.in.livingRoom.on;
// Where a piece stands: where it's been moved to, else its home against
// the back wall, or just in front of the bench while that's there (the
// bench is the cupboards' depth from the wall, R)
function spotOf(key) {
  const { move } = inLivingRoom(key);
  if (move) return move;
  const home = BACK_WALL_PIECES[key].home(optionOf(config.pieces.cornerCupboard.design.option).clearFrom(cupboardSettings()), BACK_WALL_PIECES[key].sizes().w);
  return benchDrawn() ? { ...home, y: home.y + config.pieces.cornerCupboard.design.R } : home;
}
// Draw one, clear of the bench wall from x0. Returns a sentence for the summary.
function pieceOnBenchWall(key, x0, g) {
  const { sizes, draw, name, homeText } = BACK_WALL_PIECES[key], { w, d, h } = sizes();
  const moved = inLivingRoom(key).move, { x, y, turn } = spotOf(key);
  const piece = draw({ w, d, h });                              // drawn with its back's middle at its origin, facing out
  piece.position.set(x * MM, 0, y * MM);
  turnPiece(piece, turn);
  g.add(piece);
  drawn.backWall[key] = piece;
  const named = `${name} (${w} wide, ${d} deep, ${h} high)`;
  if (key === 'pine' && pineByTheDoor()) return ` ${named} in the corner by the door, standing in for a corner cupboard: the middle of its back at x ${x}, y ${y}, facing ${FACING[turn]}.`;
  if (moved) return ` ${named}${benchDrawn() ? '' : ' in place of the bench'}, moved: the middle of its back at x ${x}, y ${y}, facing ${FACING[turn]}.`;
  return ` ${named} ${benchDrawn() ? 'in front of the bench' : 'on the back wall'}, ${homeText(x0, w)}.`;
}

// Over the daybed (asked for, 22 Oct 2026), where the TV goes on its own
// while the daybed stands with its back to the back wall and there's no
// bench: centred on its bed, its bottom TV_GAP clear of the daybed's top.
// { middle, bottom } along the back wall, or { missing } when it can't
function daybedTv() {
  const place = config.pieces.deskDaybed.in.livingRoom;
  if (!place.on) return { missing: 'no daybed' };
  const { x, y, turn } = spotOf('deskDaybed'), bottom = DESK_DAYBED.h + TV_GAP;
  if (y !== 0 || turn !== 0) return { missing: 'not against the back wall' };
  if (bottom + TV_H > CEILING_HEIGHT) return { missing: 'past the ceiling' };
  return { middle: x + bedMiddle(config.pieces.deskDaybed.design.deskAt), bottom };
}

// What the other pieces of the model use
export {
  ABOVE_BENCH, BACK_WALL_KEYS, BACK_WALL_PIECES, FACING, SHELF_T, SHELF_TOPS, TOP_T, TV_BOTTOM, TV_GAP, TV_H, 
  TV_MIDDLE_SHELF, TV_SHELF_TOPS, TV_SIZES, TV_W, baseCupboards, benchDrawn, benchHeights, benchStandIns, 
  benchStart, benchWall, onBackWall, pieceOnBenchWall, shelves, spotOf, tvPiece, tvSpot, wallClearFrom
};
