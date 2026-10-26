// Hanging space (asked for, 24 Oct 2026; HANGING_SPACE.md has the choices):
// each room's cupboards' rails, compared with the pine cupboard's, and
// drawn while Compare hanging space is on. A section HANG_DEPTH deep or
// more has a rail; a shallower one has none and is drawn over in red.
import { HANG_DEPTH, SHALLOW_MAT } from '../corner_cupboard.js';
import { PINE, recessHanging, markRecessShallow } from '../other_room.js';
import { config } from './state.js';
import { cupboardOf } from './cupboards.js';

// The pine cupboard's rail, all of it, and the ideal: half as much again
// (the user's, 24 Oct 2026). The bedroom's must have at least the pine
// cupboard's; the lounge's is only compared
export const PINE_RAIL = PINE.rails.reduce((sum, rail) => sum + rail, 0);
export const IDEAL_RAIL = PINE_RAIL * 1.5;

// The rooms' cupboards to compare, by the room's name as the menus have it
// (the lounge's corner cupboard; the bedroom's new cupboard, when it's in,
// and its recess cupboard's two outer columns, too shallow, unless it's all
// drawers)
function sectionsIn(room) {
  if (room === 'livingRoom') return cupboardOf('cornerCupboard')?.hanging ?? [];
  const recess = recessHanging(config.pieces.recessCupboards.design).map(column => ({ ...column, deep: column.depth >= HANG_DEPTH, from: 0, to: column.w }));
  return [...(cupboardOf('bedroomCupboard')?.hanging ?? []), ...recess];
}
const railOf = ({ from, to }) => Math.round(to - from);
// The length of rail a room's cupboards have, deep enough to hang in
export const railIn = room => sectionsIn(room).filter(s => s.deep).reduce((sum, s) => sum + railOf(s), 0);

// How a room's rail compares: in the bedroom, 'short' of the pine
// cupboard's, 'enough', or 'ideal'; in the lounge, null (only compared)
export function hangingVerdict(room) {
  if (room !== 'bedroom') return null;
  const rail = railIn(room);
  return rail < PINE_RAIL ? 'short' : rail < IDEAL_RAIL ? 'enough' : 'ideal';
}

// What a room's line says of cupboards with no sections: the recess
// cupboard as all drawers
const notesIn = room => (room === 'bedroom' && config.pieces.recessCupboards.design.upperAllDrawers ? ['Recess cupboard: all drawers, no hanging'] : []);

// What a room's cupboards hold, for its menu: the rail against the pine
// cupboard's, then each section's rail and depth, or why it has none
export function hangingText(room) {
  const sections = sectionsIn(room), rail = railIn(room), notes = notesIn(room);
  if (!sections.length && !notes.length) return 'No cupboard to hang in.';
  const percent = Math.round(100 * rail / PINE_RAIL);
  const judged = {
    short: ` That's ${PINE_RAIL - rail} short of the pine cupboard's.`,
    enough: ` That's enough, ${Math.round(IDEAL_RAIL - rail)} short of the ideal ${IDEAL_RAIL} (half as much again).`,
    ideal: ` That's the ideal ${IDEAL_RAIL} (half as much again) or more.`,
  }[hangingVerdict(room)] ?? '';
  const each = sections.map(s => s.deep
    ? `${s.name}: ${railOf(s)} of rail, ${s.depth} deep${s.h ? `, ${s.h} high` : ''}`
    : `${s.name}: ${s.depth} deep, too shallow`).concat(notes);
  return `Hanging rail ${HANG_DEPTH} deep or more: ${rail}, ${percent}% of the pine cupboard's ${PINE_RAIL}.${judged} ${each.join('; ')}.`;
}

// The rails and the red drawn in each room's cupboards, or taken out (the
// page's display.hanging); after each build, which draws them afresh
export function drawHanging(on) {
  for (const piece of ['cornerCupboard', 'bedroomCupboard']) cupboardOf(piece)?.showHanging(on);
  if (on) markRecessShallow(SHALLOW_MAT);
}
