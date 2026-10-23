// The living room's back wall (a piece of flat_model.js): the bench and the
// TV and shelves above it, the base cupboards, the pieces that stand along
// the wall in its place (Billy, the pine cupboard, the daybed) and the
// daybed's TV.
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
// What can be above the bench (aboveBench.design.what), by its word, and
// whether each has a TV, and shelves
const ABOVE_BENCH = ['nothing', 'shelves', 'tv', 'tvAndShelves', 'tvAndTopShelf'];
export const aboveHasTv = what => what.startsWith('tv');
export const aboveHasShelves = what => what === 'shelves' || what === 'tvAndShelves' || what === 'tvAndTopShelf';
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
  [, TV_W, TV_H] = TV_SIZES.find(([inches]) => inches === config.pieces.aboveBench.design.tv);
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
function drawTv(middle, bottom, g) {
  const tx = middle - TV_W / 2;
  drawn.tvAt = [middle, 0, bottom + TV_H / 2];
  box({ from: [tx, 0, bottom], to: [tx + TV_W, 50, bottom + TV_H] }, tvMat, g);
  box({ from: [tx + 15, 50, bottom + 15], to: [tx + TV_W - 15, 52, bottom + TV_H - 15] }, screenMat, g, false);
}
// "a 75"" or "an 85"", for the summary
const tvWords = inches => `${String(inches).startsWith('8') ? 'an' : 'a'} ${inches}"`;
function benchWall(x0, g) {
  const { what: above, shelfDepth } = config.pieces.aboveBench.design, { R } = config.pieces.cornerCupboard.design;
  const span = ROOM_WIDTH - x0;
  drawn.tvAt = [(x0 + ROOM_WIDTH) / 2, 0, TV_BOTTOM + TV_H / 2];
  if (above === 'nothing' || span <= 0) return '';                         // nothing, or no bench (the current room)
  return benchWallItems(x0, span, g) +
    (shelfDepth > R && above !== 'tv' ? ` The shelves stand ${shelfDepth - R} proud of the ${R}-deep bench.` : '');
}

function benchWallItems(x0, span, g) {
  const { what: above, shelfDepth, tv } = config.pieces.aboveBench.design;
  if (above === 'shelves') {
    shelves(x0, ROOM_WIDTH, g);
    return ` Above the bench: three ${shelfDepth}-deep shelves, ${span} long, at ${SHELF_TOPS.join(', ')}.`;
  }
  if (span < TV_W + 20) {                                         // the TV doesn't fit beside the cupboards
    const none = ` Above the bench: no room for the ${tv}" TV, ${TV_W} wide, only ${span} of clear wall.`;
    if (above === 'tv') return none;
    const tops = above === 'tvAndTopShelf' ? TV_SHELF_TOPS.slice(1) : TV_SHELF_TOPS;
    if (!tops.length) return none;
    shelves(x0, ROOM_WIDTH, g, tops);
    return none + ` ${shelfDepth}-deep shelves right across, ${span} long, at ${tops.join(' and ')}.`;
  }
  drawTv(x0 + span / 2, TV_BOTTOM, g);                             // centred on the clear wall
  const tvText = ` Above the bench: ${tvWords(tv)} TV (${TV_W} × ${TV_H}), centred on the ${span} of clear wall, from ${TV_BOTTOM} to ${TV_BOTTOM + TV_H}.`;
  const [below, over] = TV_SHELF_TOPS;
  const noTop = ` No room for a shelf above it: it would be within 60 of the ceiling.`;
  if (above === 'tv') return tvText;
  if (above === 'tvAndTopShelf') {
    if (!over) return tvText + noTop;
    shelves(x0, ROOM_WIDTH, g, [over]);
    return tvText + ` A ${shelfDepth}-deep shelf right across above it, ${span} long, at ${over}.`;
  }
  shelves(x0, ROOM_WIDTH, g, TV_SHELF_TOPS);
  const shelfText = over
    ? ` ${shelfDepth}-deep shelves right across, ${span} long, below it at ${below} and above it at ${over}.`
    : ` A ${shelfDepth}-deep shelf right across below it, ${span} long, at ${below}.` + noTop;
  const side = Math.floor((span - TV_W) / 2 - TV_GAP);
  if (side < 200) return tvText + shelfText + ` No room for a middle shelf beside it: only ${Math.max(side, 0)} each side.`;
  shelves(x0, x0 + side, g, [TV_MIDDLE_SHELF]);
  shelves(ROOM_WIDTH - side, ROOM_WIDTH, g, [TV_MIDDLE_SHELF]);
  return tvText + shelfText + ` A middle shelf at ${TV_MIDDLE_SHELF} either side, ${side} long, ${TV_GAP} clear of the TV.`;
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

// The TV on the wall above the daybed (asked for, 22 Oct 2026), while the
// daybed stands with its back to the back wall: centred on its bed, its
// bottom TV_GAP clear of the daybed's top, at the TV size above the bench's.
// Where it is: { middle, bottom } along the back wall; or { missing }, the
// summary's sentence saying why it isn't there ('' when it's not asked for)
function daybedTv() {
  const place = config.pieces.deskDaybed.in.livingRoom, { tv: inches } = config.pieces.aboveBench.design;
  if (!place.on || !place.tvAbove) return { missing: '' };
  const { x, y, turn } = spotOf('deskDaybed'), bottom = DESK_DAYBED.h + TV_GAP;
  if (y !== 0 || turn !== 0) return { missing: ' No TV above the daybed: it isn\'t against the back wall.' };
  if (bottom + TV_H > CEILING_HEIGHT) return { missing: ` No room for the ${inches}" TV above the daybed: it would reach ${bottom + TV_H}, past the ceiling.` };
  return { middle: x + bedMiddle(config.pieces.deskDaybed.design.deskAt), bottom };
}
export const daybedTvShown = () => !('missing' in daybedTv());
// Drawn into the option's group, if it's there. Returns a sentence for the summary
function tvAboveDaybed(g) {
  const tv = daybedTv(), { tv: inches } = config.pieces.aboveBench.design;
  if ('missing' in tv) return tv.missing;
  drawTv(tv.middle, tv.bottom, g);
  return ` Above the daybed: ${tvWords(inches)} TV (${TV_W} × ${TV_H}), centred on its bed, from ${tv.bottom} to ${tv.bottom + TV_H}.`;
}

// What the other pieces of the model use
export {
  ABOVE_BENCH, BACK_WALL_KEYS, BACK_WALL_PIECES, FACING, SHELF_T, SHELF_TOPS, TOP_T, TV_BOTTOM, TV_GAP, TV_H, 
  TV_MIDDLE_SHELF, TV_SHELF_TOPS, TV_SIZES, TV_W, baseCupboards, benchDrawn, benchHeights, benchStandIns, 
  benchStart, benchWall, onBackWall, pieceOnBenchWall, shelves, spotOf, tvAboveDaybed, wallClearFrom
};
