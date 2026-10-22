// What the page shows (a piece of living_room.js), which each build is
// given rather than the model keeping it (notes/ui_paradigm_analysis.md,
// recommendation 3): the model's DISPLAY_START's fields, a 2D view or not
// and which, Cupboard only and the dimension buttons. Changed only through
// setDisplay(), which keeps the hallway and See-through in step.
import { DISPLAY_START, seeThroughCupboards, showHallway } from '../flat_model.js';

export const display = { ...DISPLAY_START };

export function setDisplay({ seeThrough, ...shown }) {
  if (seeThrough !== undefined) seeThroughCupboards(seeThrough);   // kept by the cupboards' materials
  Object.assign(display, shown);
  showHallway(display);
}
