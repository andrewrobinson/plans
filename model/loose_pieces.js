// The living room's loose pieces (a piece of flat_model.js): the chair at
// the daybed's desk and what's in its way, the first window's radiator,
// Ivar, the kitchen tables, the castor desk and the speakers.
import * as THREE from 'three';
import * as Cupboard from '../corner_cupboard.js';
import { MM, box } from '../kit/floor_kit.js';
import { boxesMeet, rangesOf } from '../kit/shape_kit.js';
import { optionOf } from '../corner_cupboard.js';
import { bookcase } from '../bookcase.js';
import { billy, billySizes } from '../billy.js';
import { daybed } from '../daybed.js';
import { ivar, ivarSizes } from '../ivar.js';
import { CHESHAM, CORNWALL, kitchenTable, tableSizes } from '../tables.js';
import { castorDesk, castorDeskSizes } from '../castor_desk.js';
import { FENRIS_A5, fenrisA5 } from '../speakers.js';
import { DESK_DAYBED, DAYBED_TOP_D, deskDaybed, bedMiddle, deskOpenEnd } from '../desk_daybed.js';
import { WORK_CHAIRS } from '../work_chairs.js';
import {
  floor, ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, DOOR_FRAME_STARTS_AT, OUTER, radiators
} from '../floor.js';
import { LOUNGE_NOW, config, cupboardSettings, drawn, inLivingRoom } from './state.js';
import { islandGroup } from './kitchen.js';
import { LIVING_ROOM_PLACE, cupboard } from './cupboards.js';
import {
  BACK_WALL_PIECES, FACING, SHELF_T, TV_SHELF_TOPS, TV_W, aboveHasTv, benchDrawn, benchStart, daybedTvShown, 
  spotOf
} from './bench_wall.js';
import { pieces, sofa } from './front_wall.js';
import { SLIDER_RANGES } from './slider_ranges.js';

// ---------------------------------------------------------------------------
// The work chair at the daybed's desk (asked for, 22 Oct 2026): pulled up,
// in use, at the desk's open end and facing it, centred on the knee space
// under it, its seat's front SEAT_UNDER_DESK under the desk top; it moves
// and turns with the daybed. And the room there is to sit: from the desk's
// end to the nearest thing beyond it (the corner cupboard, another piece, a
// wall) across the office chair's width, said in the summary, with how far
// each chair reaches past the end and whether it fits
// ---------------------------------------------------------------------------
const SEAT_UNDER_DESK = 100;       // the seat's front under the desk top (chosen: pulled up to work)
const WALL_NAMES = { left: 'the left wall', right: 'the right-hand wall', back: 'the back wall', front: 'the front wall' };
// How far a chair reaches past the desk's end, pulled up: its seat's back
// half, less what's under the desk, and its base behind that
const chairReach = ({ seatHalf, baseHalf }) => seatHalf - SEAT_UNDER_DESK + baseHalf;
// What could be in the way, as [name, box in the scene] for each of their
// solid parts: the room's walls, the corner cupboard, the island and the
// living room's loose pieces, but not the daybed itself
function obstacles(daybed) {
  const solid = 100;                                            // the walls' boxes' thickness, behind their faces (chosen)
  const wall = (x0, y0, x1, y1) => new THREE.Box3(new THREE.Vector3(x0 * MM, 0, y0 * MM), new THREE.Vector3(x1 * MM, CEILING_HEIGHT * MM, y1 * MM));
  const found = [[WALL_NAMES.left, wall(-solid, 0, 0, ROOM_DEPTH)], [WALL_NAMES.right, wall(ROOM_WIDTH, 0, ROOM_WIDTH + solid, ROOM_DEPTH)],
    [WALL_NAMES.back, wall(0, -solid, ROOM_WIDTH, 0)], [WALL_NAMES.front, wall(0, ROOM_DEPTH, ROOM_WIDTH, ROOM_DEPTH + solid)]];
  const named = [[cupboard?.group, 'the corner cupboard'], [islandGroup, 'the island'], [drawn.radiator, RADIATOR_NAME],
    ...loosePieces().filter(([piece]) => piece !== daybed)];
  for (const [object, name] of named) found.push(...meshBoxes(object).map(box => [name, box]));
  return found;
}
// The living room's loose pieces as drawn, as [object, name]: the sofa, the
// Ivar, the tables, the desk on castors and the back wall's pieces
const loosePieces = () => [[pieces.sofa, 'the sofa'], [pieces.ivar, 'the Ivar'], [pieces.chesham, 'Chesham'], [pieces.cornwall, 'Cornwall'],
  [pieces.castorDesk, 'the desk on castors'], ...Object.entries(drawn.backWall).map(([key, piece]) => [piece, BACK_WALL_PIECES[key].short])]
  .filter(([piece]) => piece);
// The boxes, in the scene, of each solid part of an object (none for none)
function meshBoxes(object) {
  const boxes = [];
  object?.updateMatrixWorld(true);
  object?.traverse(o => { if (o.isMesh) boxes.push(new THREE.Box3().setFromObject(o)); });
  return boxes;
}
// The room beyond the desk's end (`end`, deskOpenEnd()'s) across a band `half`
// either side of `across`, out from the back: { gap, name }, to the nearest
// thing there, negative for something reaching in over the desk's end (as
// far as the desk's width). Worked out in the daybed's own frame, as it
// stands and turns
function roomBeyond(daybed, { x, outward, width }, across, half) {
  daybed.updateMatrixWorld(true);
  const toDaybed = daybed.matrixWorld.clone().invert();
  let nearest = { gap: Infinity, name: '' };
  for (const [name, box] of obstacles(daybed)) {
    const local = box.clone().applyMatrix4(toDaybed);           // exact, the daybed turned in quarter turns
    const [lo, hi, out0, out1] = [local.min.x, local.max.x, local.min.z, local.max.z].map(v => v / MM);
    if (out1 <= across - half || out0 >= across + half) continue;   // not across the chair's way
    if (outward < 0 ? lo >= x + width : hi <= x - width) continue;   // not out to the desk's end: no matter to the chair
    const gap = Math.round(outward < 0 ? x - hi : lo - x);
    if (gap < nearest.gap) nearest = { gap, name };
  }
  return nearest;
}
// The chair drawn into the daybed, and a sentence for the summary
function chairAtDaybedDesk() {
  const daybed = drawn.backWall.deskDaybed;
  if (!daybed) return '';
  const end = deskOpenEnd(config.pieces.deskDaybed.design.deskAt), across = (end.knee[0] + end.knee[1]) / 2;
  const { gap, name } = roomBeyond(daybed, end, across, WORK_CHAIRS.office.baseHalf);
  const chosen = WORK_CHAIRS[config.pieces.deskDaybed.in.livingRoom.chair];
  if (chosen) {
    const chair = chosen.draw();
    chair.position.set((end.x - end.outward * (SEAT_UNDER_DESK - chosen.seatHalf)) * MM, 0, across * MM);
    chair.rotation.y = -end.outward * Math.PI / 2;              // facing the desk
    daybed.add(chair);
    pieces.workChair = chair;
  }
  if (gap < 0) return ` At the daybed's desk there's no room to sit: ${name} ${-gap < end.width ? `reaches ${-gap} in over its end` : 'stands across its end'}.`;
  if (gap === 0) return ` At the daybed's desk there's no room to sit: ${name} is right up against its end.`;
  const fits = chair => {
    const spare = gap - chairReach(chair);
    return `${chair.name}${chair === chosen ? ' (drawn)' : ''} reaches ${chairReach(chair)} past it, ${spare >= 0 ? `${spare} to spare` : `${-spare} short`}`;
  };
  return ` At the daybed's desk there's ${gap} from its end to ${name}. Pulled up to it, ${Object.values(WORK_CHAIRS).map(fits).join('; ')}.`;
}

// The radiator under the first window (the one nearest the back wall),
// which could be taken out, pipes and all (asked for, 22 Oct 2026), to give
// the daybed and a chair at its desk more room. In, it's shown and any of
// the room's pieces that runs into it is said; out, the daybed
// can stand flush to the window wall
const RADIATOR_NAME = 'the radiator under the first window';
const FIRST_WINDOW = 0;
function firstRadiator() {
  radiators[FIRST_WINDOW].visible = config.livingRoom.firstRadiator;
  if (!config.livingRoom.firstRadiator) return ' The radiator under the first window is taken out, and its pipes.';
  drawn.radiator = radiators[FIRST_WINDOW];
  const [radiator] = meshBoxes(drawn.radiator);
  const meeting = loosePieces().filter(([piece]) => meshBoxes(piece).some(box => boxesMeet(rangesOf(box, 'xyz'), rangesOf(radiator, 'xyz'), -TOUCHING)));
  return meeting.map(([, name]) => ` ${name[0].toUpperCase()}${name.slice(1)} runs into ${RADIATOR_NAME}.`).join('');
}
const TOUCHING = 1e-6;             // in scene units (a thousandth of a mm): overlapping by less, a piece only touches the radiator, as set against its front (chosen)

// The Ivar in the living room, where it is now (the user's, 18 Oct 2026):
// by the first radiator (the one nearest the back wall), a 300 side to the
// radiator's front and centred on it, 830 out into the room as it lies on
// its side. Placed as the back wall's pieces are, the middle of its back
// and its turn: turned 0°, its back faces the back wall and its length runs
// out from the radiator. Its sliders move it from there
function ivarHome() {
  const { windows: [first], radiator } = OUTER, { w, d } = ivarSizes(config.pieces.ivar.in.livingRoom.lying);
  const radiatorMiddle = (first.y[0] + first.y[1]) / 2, radiatorFront = ROOM_WIDTH - radiator.out;
  return { x: radiatorFront - w / 2, y: radiatorMiddle - d / 2, turn: 0 };
}
const ivarSpot = () => config.pieces.ivar.in.livingRoom.move ?? ivarHome();

// The kitchen tables in the living room, each starting where it is now
// (LOUNGE_NOW) and moved from there by its sliders. A table on top of
// another where they overlap (Chesham on Cornwall) stands on it
const TABLES = {
  cornwall: { table: CORNWALL, name: 'The Cornwall table', pose: () => ({ legsOff: config.pieces.cornwall.in.livingRoom.legsOff }),
    posed: () => (config.pieces.cornwall.in.livingRoom.legsOff ? 'on the floor with its legs off' : 'on its legs') },
  chesham: { table: CHESHAM, name: 'The Chesham table', pose: () => ({ onItsEnd: config.pieces.chesham.in.livingRoom.onItsEnd }),
    posed: () => (config.pieces.chesham.in.livingRoom.onItsEnd ? 'on its end, its top against the wall behind it' : 'on its legs') },
};
const TABLE_KEYS = Object.keys(TABLES);                         // Cornwall first, as Chesham may stand on it
const tableSpot = key => inLivingRoom(key).move ?? LOUNGE_NOW[key];
// Where a piece stands on the floor, in the scene: its box's x and z
const footprint = piece => { piece.updateMatrixWorld(true); return new THREE.Box3().setFromObject(piece); };
const overlaps = (a, b) => boxesMeet(rangesOf(a, 'xz'), rangesOf(b, 'xz'));
// Drawn into the option's group, each that's in. Returns their sentences for the summary
function tablesInLivingRoom(g) {
  const placed = [];
  let text = '';
  for (const key of TABLE_KEYS) {
    if (!inLivingRoom(key).on) continue;
    const { table, name, pose, posed } = TABLES[key], { x, y, turn } = tableSpot(key), { w, d, h } = tableSizes(table, pose());
    const piece = kitchenTable(table, pose());
    piece.position.set(x * MM, 0, y * MM);
    piece.rotation.y = THREE.MathUtils.degToRad(-turn);
    // measured before it joins the group, so in the room's own scene units
    const under = placed.find(other => overlaps(footprint(piece), other));
    if (under) piece.position.y = under.max.y;                  // on top of it
    placed.push(footprint(piece));
    g.add(piece);
    pieces[key] = piece;
    const on = under ? ', on the other table' : '';
    text += ` ${name}, ${posed()}${on} (${w} along, ${d} out, ${h} high): the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}, facing ${FACING[turn]}.`;
  }
  return text;
}
// The desk on castors: parked against the left wall, its far end
// CASTOR_DESK_CLEAR short of the door frame, so it sits between the frame
// and the corner cupboard; or wheeled out in front of the TV, centred on it,
// its back CASTOR_DESK_CLEAR out from the bench (or the back wall), where you
// sit facing the TV. Placed as the tables are, the middle of its back and
// its turn; its sliders move it from either
const CASTOR_DESK_CLEAR = { byTheDoor: 20, atTheTv: 100 };   // chosen
const CASTOR_DESK_HOMES = {
  byTheDoor: () => ({ x: 0, y: DOOR_FRAME_STARTS_AT - CASTOR_DESK_CLEAR.byTheDoor - castorDeskSizes().w / 2, turn: 270 }),   // its back to the left wall
  atTheTv: () => ({ x: drawn.tvAt[0], y: (benchDrawn() ? config.pieces.cornerCupboard.design.R : 0) + CASTOR_DESK_CLEAR.atTheTv, turn: 0 }),     // its back to the TV
};
const castorDeskSpot = () => config.pieces.castorDesk.in.livingRoom.move ?? CASTOR_DESK_HOMES[config.pieces.castorDesk.in.livingRoom.at]();
const CASTOR_DESK_WHERE = {
  byTheDoor: () => `parked by the door: its back against the left wall, ${CASTOR_DESK_CLEAR.byTheDoor} short of the door frame`,
  atTheTv: () => `in front of the TV, centred on it, its back ${CASTOR_DESK_CLEAR.atTheTv} out from the ${benchDrawn() ? 'bench' : 'back wall'}, facing away from it`,
};
// Drawn into the option's group if it's in, after the cupboard and the
// bench wall (it uses where the TV is). Returns a sentence for the summary,
// saying if it stands where the cupboard is
function castorDeskInLivingRoom(g) {
  if (!config.pieces.castorDesk.in.livingRoom.on) return '';
  const { x, y, turn } = castorDeskSpot(), { w, d, h } = castorDeskSizes();
  const piece = castorDesk();
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  // measured before it joins the group, as the tables are, with the cupboard's doors still shut
  const clash = cupboard && overlaps(footprint(piece), footprint(cupboard.group)) ? ' It stands where the corner cupboard is.' : '';
  g.add(piece);
  pieces.castorDesk = piece;
  const where = config.pieces.castorDesk.in.livingRoom.move ? `moved: the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}, facing ${FACING[turn]}` : CASTOR_DESK_WHERE[config.pieces.castorDesk.in.livingRoom.at]();
  return ` The desk on castors (${w} long, ${d} deep, ${h} high), ${where}.${clash}`;
}
// Drawn into the option's group if it's in. Returns a sentence for the summary
function ivarInLivingRoom(g) {
  if (!config.pieces.ivar.in.livingRoom.on) return '';
  const { x, y, turn } = ivarSpot(), { w, d, h } = ivarSizes(config.pieces.ivar.in.livingRoom.lying);
  const piece = ivar(config.pieces.ivar.in.livingRoom.lying);
  piece.position.set(x * MM, 0, y * MM);
  piece.rotation.y = THREE.MathUtils.degToRad(-turn);
  g.add(piece);
  pieces.ivar = piece;
  const named = `The Ivar, ${config.pieces.ivar.in.livingRoom.lying ? 'lying on its side' : 'standing'} (${w} long, ${d} wide, ${h} high)`;
  if (config.pieces.ivar.in.livingRoom.move) return ` ${named}, moved: the middle of its back at x ${Math.round(x)}, y ${Math.round(y)}.`;
  return ` ${named}, against the first radiator, ${w} out into the room.`;
}

// ---------------------------------------------------------------------------
// The speakers (speakers.js), as a pair, facing out from the front of what
// they stand on, side by side along it (chosen with the user, 22 Oct 2026):
// - on the daybed's bookcase, as on the bench, centred on its bed and on
//   the TV above it while there's one;
// - on the bench, centred on the TV (or where it would be), each starting
//   SPEAKER_TV_CLEAR clear of its side, or SPEAKER_SPACING_NO_TV apart with
//   no TV above the bench;
// - on Billy, lying in the lounge, centred on it, each starting
//   SPEAKER_BILLY_END in from its end; they move and turn with it;
// - on the corner cupboard's part along the back wall
//   (corner_cupboard.js's topAlongBackWall()) when it stops short of the
//   ceiling, spread evenly along it, the gaps beside and between them alike.
// On the bench, Billy and the daybed their spacing (between their middles) can be set,
// held to what they stand on. Where their place isn't there, they aren't
// drawn and the summary says why; the choice is kept
// ---------------------------------------------------------------------------
const SPEAKER_PLACES = ['none', 'bench', 'billy', 'deskDaybed', 'cupboard'];
const SPEAKER_SET_BACK = 20;                // their fronts back from the front edge of what they stand on (chosen)
const SPEAKER_TV_CLEAR = 100;               // on the bench, each starting this far clear of the TV's side (chosen)
const SPEAKER_SPACING_NO_TV = 1500;         // on the bench with no TV, their middles this far apart to start (chosen)
const SPEAKER_BILLY_END = 100;              // on Billy, each starting this far in from its end (chosen)
// What they stand on, by place: in the frame of a spot ({ x, y, turn }, as
// the pieces' spots are: x along it, y out from its back, as the back
// wall's pieces are drawn), from x0 to x1 along it, its front edge `front`
// out, its top `top` high; the pair centred on `middle`, `start` apart to
// begin with (null where they can't be moved apart); and a phrase for the
// summary. Or { missing }, why they can't stand there
const SPEAKER_SURFACES = {
  bench() {
    if (!benchDrawn()) return { missing: 'the bench, which isn\'t there' };
    const option = optionOf(config.pieces.cornerCupboard.design.option), { what } = config.pieces.aboveBench.design;
    const x0 = benchStart(option), tvShown = aboveHasTv(what) && ROOM_WIDTH - x0 >= TV_W + 20;   // as benchWallItems() draws it
    return { spot: { x: 0, y: 0, turn: 0 }, x0, x1: ROOM_WIDTH, front: config.pieces.cornerCupboard.design.R, top: config.pieces.bench.design.height,
      middle: drawn.tvAt[0], start: tvShown ? TV_W + 2 * SPEAKER_TV_CLEAR + FENRIS_A5.w : SPEAKER_SPACING_NO_TV,
      on: tvShown ? 'on the bench, either side of the TV' : 'on the bench, centred on it' };
  },
  billy() {
    const { on, lying } = config.pieces.billy.in.livingRoom;
    if (!on) return { missing: 'Billy, which isn\'t in the lounge' };
    if (!lying) return { missing: 'Billy lying on its side, and it\'s standing' };
    const { w, d, h } = billySizes(true);
    return { spot: spotOf('billy'), x0: -w / 2, x1: w / 2, front: d, top: h, middle: 0,
      start: w - 2 * SPEAKER_BILLY_END - FENRIS_A5.w, on: 'on Billy, lying on its side' };
  },
  // On the daybed's bookcase top, as deep as they are with 20 to spare, so
  // their fronts are flush with its edge
  deskDaybed() {
    if (!config.pieces.deskDaybed.in.livingRoom.on) return { missing: 'the daybed, which isn\'t in the lounge' };
    const { w, h } = DESK_DAYBED, tvShown = daybedTvShown();
    return { spot: spotOf('deskDaybed'), x0: -w / 2, x1: w / 2, front: DAYBED_TOP_D, setBack: 0, top: h, middle: bedMiddle(config.pieces.deskDaybed.design.deskAt),
      start: tvShown ? TV_W + 2 * SPEAKER_TV_CLEAR + FENRIS_A5.w : SPEAKER_SPACING_NO_TV,
      on: tvShown ? 'on the daybed\'s bookcase, either side of the TV above it' : 'on the daybed\'s bookcase, centred on its bed' };
  },
  cupboard() {
    const top = Cupboard.topAlongBackWall(cupboardSettings(), LIVING_ROOM_PLACE);
    if (!top) return { missing: 'the corner cupboard, and there\'s none' };
    if (top.h >= CEILING_HEIGHT) return { missing: 'the corner cupboard, which runs to the ceiling' };
    if (CEILING_HEIGHT - top.h < FENRIS_A5.h) return { missing: `the corner cupboard, with only ${CEILING_HEIGHT - top.h} clear above it for them, ${FENRIS_A5.h} high` };
    const gap = (top.x1 - top.x0 - 2 * FENRIS_A5.w) / 3;
    return { spot: { x: 0, y: 0, turn: 0 }, x0: top.x0, x1: top.x1, front: top.d, top: top.h, middle: (top.x0 + top.x1) / 2,
      start: null, spacing: top.x1 - top.x0 - 2 * gap - FENRIS_A5.w, on: `on the corner cupboard, ${top.h} high, spread evenly along its ${top.x1 - top.x0} on the back wall` };
  },
};
// The spacing on a surface: as set, or where it starts, held to what they
// stand on (centred on its middle); `most`, the furthest apart they can be
function speakerSpacingOn(place, surface) {
  if (surface.start === null) return { spacing: surface.spacing, most: surface.spacing };
  const { w } = FENRIS_A5, [least, highest] = SLIDER_RANGES.speakerSpacing;
  const most = Math.min(highest, 2 * Math.min(surface.middle - surface.x0, surface.x1 - surface.middle) - w);
  const asked = config.pieces.speakers.in.livingRoom.spacing[place] ?? surface.start;
  return { spacing: Math.max(least, Math.min(asked, most)), most, held: asked > most };
}
// The spacing slider's, for the menu: the spacing in use and the most it
// can be, or null where it can't be set (no speakers, the cupboard, or
// their place isn't there)
export function speakerSpacingNow() {
  const { on } = config.pieces.speakers.in.livingRoom, surface = SPEAKER_SURFACES[on]?.();
  if (!surface || surface.missing || surface.start === null) return null;
  return speakerSpacingOn(on, surface);
}
// Whether the corner cupboard can be offered to stand them on: one with a
// top along the back wall, set lower than the ceiling
export const cupboardTopForSpeakers = () => {
  const top = Cupboard.topAlongBackWall(cupboardSettings(), LIVING_ROOM_PLACE);
  return Boolean(top) && top.h < CEILING_HEIGHT;
};
// On the bench, the shelf right across under the TV (TV and shelves) may
// come down lower than the speakers' tops, over them: a sentence saying so
function speakersUnderShelf(surface) {
  const { what, shelfDepth } = config.pieces.aboveBench.design, [below] = TV_SHELF_TOPS, bench = config.pieces.bench.design.height;
  const speakersBack = surface.front - SPEAKER_SET_BACK - FENRIS_A5.d, clear = below - SHELF_T - bench;
  if (what !== 'tvAndShelves' || clear >= FENRIS_A5.h || shelfDepth <= speakersBack) return '';
  return ` They clash with the shelf at ${below}: it's only ${clear} clear of the bench.`;
}
// Drawn into the option's group, on their place if it's there. Returns a
// sentence for the summary
function speakersInLivingRoom(g) {
  const { on } = config.pieces.speakers.in.livingRoom;
  if (on === 'none') return '';
  const surface = SPEAKER_SURFACES[on](), { w, d, h } = FENRIS_A5;
  if (surface.missing) return ` No speakers: they go on ${surface.missing}.`;
  const { spacing, held } = speakerSpacingOn(on, surface);
  const pair = new THREE.Group();
  for (const side of [-1, 1]) {
    const speaker = fenrisA5();
    speaker.position.set((surface.middle + side * spacing / 2) * MM, surface.top * MM, (surface.front - (surface.setBack ?? SPEAKER_SET_BACK) - d) * MM);
    pair.add(speaker);
  }
  pair.position.set(surface.spot.x * MM, 0, surface.spot.y * MM);
  pair.rotation.y = THREE.MathUtils.degToRad(-surface.spot.turn);
  g.add(pair);
  pieces.speakers = pair;
  const apart = `their middles ${Math.round(spacing)} apart${held ? ', as far apart as it lets them' : ''}`;
  return ` The speakers (Argon Fenris A5, ${w} wide, ${d} deep, ${h} high) ${surface.on}, ${apart}.${on === 'bench' ? speakersUnderShelf(surface) : ''}`;
}

// What the other pieces of the model use
export {
  CASTOR_DESK_HOMES, SPEAKER_PLACES, castorDeskInLivingRoom, castorDeskSpot, chairAtDaybedDesk, firstRadiator, 
  ivarInLivingRoom, ivarSpot, speakersInLivingRoom, tableSpot, tablesInLivingRoom
};
