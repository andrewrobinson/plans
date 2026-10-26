// A thing's options, by long-pressing it (a piece of living_room.js): the
// sheet slides up from the bottom holding that thing's own controls from
// Lounge, Bedroom or Hallway options, moved there while it's open and put
// back as it closes, so each works just as it does in its drawer and the
// thing changes above the sheet as it's set. What has no section of its
// own opens its room's whole drawer. Something painted also gets a Colour
// button, for the colour sheet. Asked for, 23 Oct 2026.
import { cupboard, drawn, islandGroup, pieces, namedPieces, rightCupboard } from '../../flat_model.js';
import { benchMat } from '../../model/materials.js';
import { otherRoomPieces } from '../../other_room.js';
import { wickerBenches } from '../../wicker_bench.js';
import { shoeRack } from '../../shoe_rack.js';
import { stairWalls } from '../../stair_walls.js';
import { shoeBoxes } from '../../shoe_boxes.js';
import { garage } from '../../garage.js';
import { bathroom } from '../../floor.js';
import { drawers, resize, renderer } from '../../living_room.js';
import { colourTargetOf, hitsUnder } from './picking.js';
import { select, deselect, selection, objectOf } from './selection.js';
import { openColours, TARGET_NAMES } from './colour_sheet.js';
import { startResize, stopResize } from './resize.js';

// ---------------------------------------------------------------------------
// Each thing: its name, the objects drawn for it (any part of one, pressed,
// is it) or the materials it's made of, its controls' ids in the drawers
// (sections, or blocks within one), in the order they're shown, and the
// size sliders its handles move in Plan (resize.js: `along` its width or
// depth; factor 2 where it grows both ways about its middle, 1 from its
// back or one side). Heights have no handles: the plan looks down on them
// ---------------------------------------------------------------------------
const w = (id, factor = 2) => ({ id, along: 'w', factor });
const d = (id, factor = 1) => ({ id, along: 'd', factor });
const BEDROOM_SIZES = {
  bookcase: [w('otherRoom_bookcase_w'), d('otherRoom_bookcase_d')],
  cupboard: [w('otherRoom_cupboard_w'), d('otherRoom_cupboard_d')],
  mirror: [w('otherRoom_mirror_w')],
};
const ISLAND = ['islandBlock', 'islandMoveBlock', 'islandTypeBlock', 'islandSizeBlock', 'islandSeatBlock'];
const BEDROOM_PIECES = {
  bed: 'Bed', bookcase: 'Bookcase', cupboard: 'Pine cupboard', billy: 'Billy', billyChest: 'BillyChest', ivar: 'Ivar',
  bedsideTable: 'Bedside table', bedsideTableByCupboard: 'Bedside table', kvistbro: 'Kvistbro', laundryBasket: 'Laundry basket', mirror: 'Mirror',
};
const THINGS = [
  // The lounge
  { name: 'Sofa', objects: () => [pieces.sofa], ids: ['secSofa'], sizes: [w('sofaW'), d('sofaD', 2)] },
  // the custom island's: IKEA's is the size it is (its sliders are hidden then, and so its handles)
  // (its length runs front to back, as its own axes go)
  { name: 'Kitchen island', objects: () => [islandGroup], ids: ISLAND, sizes: [w('islandWidth'), d('islandLength', 2)] },
  // the dresser and larder grow from their left-hand side, along the front wall
  { name: 'Dresser', objects: () => [pieces.dresser], ids: ['frontBlock', 'dresserBlock', 'dresserColourBlock'], sizes: [w('dresserW', 1)] },
  { name: 'Larder', objects: () => [pieces.larder], ids: ['frontBlock', 'larderBlock', 'dresserColourBlock'], sizes: [w('larderW', 1), d('larderD')] },
  { name: 'Corner cupboard', objects: () => [cupboard?.group, rightCupboard?.group], ids: ['secCupboard'] },   // the right-hand one is its mirror
  { name: 'Ivar', objects: () => [pieces.ivar], ids: ['secIvar'] },
  { name: 'Cornwall table', objects: () => [pieces.cornwall], ids: ['secCornwall'] },
  { name: 'Chesham table', objects: () => [pieces.chesham], ids: ['secChesham'] },
  // the dining table grows both ways about its middle; round, its diameter (the other sliders hidden, so their handles)
  { name: 'Dining table', objects: () => [pieces.diningTable], ids: ['secDiningTable'], sizes: [w('diningLength'), d('diningWidth', 2), w('diningDiameter')] },
  { name: 'Desk on castors', objects: () => [pieces.castorDesk], ids: ['secCastorDesk'] },
  { name: 'Speakers', objects: () => [pieces.speakers], ids: ['secSpeakers'] },
  { name: 'Billy', objects: () => [drawn.backWall.billy], ids: ['billyMoveBlock'] },
  { name: 'BillyChest', objects: () => [drawn.backWall.billyChest], ids: ['billyChestMoveBlock'] },
  // the lounge's bookcase and pine cupboard are the bedroom's, at the bedroom's sizes
  { name: 'Bookcase', objects: () => [drawn.backWall.bookshelf], ids: ['bookshelfMoveBlock'], sizes: BEDROOM_SIZES.bookcase },
  { name: 'Pine cupboard', objects: () => [drawn.backWall.pine], ids: ['pineMoveBlock'], sizes: BEDROOM_SIZES.cupboard },
  { name: 'Daybed and desk', objects: () => [drawn.backWall.deskDaybed], ids: ['deskDaybedMoveBlock'] },
  { name: 'TV', objects: () => [drawn.tv], ids: ['secTv'] },
  { name: 'The back wall: bench and shelves', materials: () => [benchMat], ids: ['secBench'] },
  // The bedroom
  ...Object.entries(BEDROOM_PIECES).map(([key, name]) => ({ name, objects: () => [otherRoomPieces[key]], ids: [`otherRoomPiece_${key}`], sizes: BEDROOM_SIZES[key] })),
  { name: "The bedroom's new cupboard", objects: () => [namedPieces().bedroomCupboard], ids: ['secBedroomCupboard'] },
  // Any room's wicker bench
  { name: 'Wicker bench', objects: () => Object.values(wickerBenches), ids: ['secWickerBench'], sizes: [w('wickerBench_w'), d('wickerBench_d')] },
  // The hallway and stairs, and the garage
  { name: 'Shelves and pictures over the stairs', objects: () => [stairWalls], ids: ['secStairWalls'] },
  { name: 'Shoe boxes', objects: () => [shoeBoxes], ids: ['secShoeBoxes'] },
  { name: 'Shoe rack', objects: () => [shoeRack], ids: ['secShoeRack'] },
  { name: 'Bathroom and WC', objects: () => [bathroom], ids: ['secBathroom'] },
  { name: 'Garage', objects: () => [garage], ids: ['garageBlock'] },
];

// The thing a pressed mesh is part of: the nearest that holds it, so a
// piece in the garage is the piece, and anything else there the garage
function thingOf(mesh) {
  const materials = [].concat(mesh.material);
  const byMaterial = THINGS.find(t => t.materials?.().some(m => materials.includes(m)));
  if (byMaterial) return { thing: byMaterial, object: mesh };
  for (let o = mesh; o; o = o.parent) {
    const thing = THINGS.find(t => t.objects?.().includes(o));
    // the object as drawn now, as a change draws it again
    if (thing) { const i = thing.objects().indexOf(o); return { thing, object: o, now: () => thing.objects()[i] }; }
  }
  return null;
}

// ---------------------------------------------------------------------------
// The sheet: each control moved in from its drawer, a placeholder left
// where it was, and put back as the sheet closes
// ---------------------------------------------------------------------------
const sheet = document.getElementById('optionsSheet'), body = document.getElementById('optionsBody');
const title = document.getElementById('optionsTitle'), colourButton = document.getElementById('optionsColour');
let borrowed = [];                 // [element, placeholder]
let colourFor = null;
// The drawers' styles (.drawer's labels, sliders and sections) for what's
// moved in; set now, after the drawers have had their sheet handles added,
// so this isn't given one
body.classList.add('drawer');

function openOptions({ thing, object, now }, target = null) {
  closeOptions();
  drawers.setMenu(null);
  for (const id of thing.ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const placeholder = document.createComment(`options: ${id}`);
    el.replaceWith(placeholder);
    if (el.tagName === 'DETAILS') el.open = true;
    body.append(el);
    borrowed.push([el, placeholder]);
  }
  title.textContent = thing.name;
  colourFor = target;
  colourButton.hidden = !target;
  select({ thing: { object, name: thing.name } });
  // Its handles, for those of its sizes shown (IKEA's island has none)
  const shown = (thing.sizes ?? []).filter(s => sliderShown(document.getElementById(s.id)));
  if (now && shown.length) startResize(now, thing.sizes);   // all of them, each handle hidden while its slider is (resize.js)
  sheet.hidden = false;
  body.scrollTop = 0;
  requestAnimationFrame(() => { sheet.classList.add('up'); resize(); });   // the 2D views fitted above it
}
// A slider shown where it is, in the sheet or its drawer, open or not:
// none of the blocks round it hidden (as IKEA's island hides the custom
// one's sizes), though its drawer, tab or section may be shut
function sliderShown(slider) {
  for (let o = slider; o && o !== body && !o.classList.contains('drawer'); o = o.parentElement) {
    if (o.classList.contains('tabpanel')) continue;
    if (o.hidden || getComputedStyle(o).display === 'none') return false;
  }
  return Boolean(slider);
}
function closeOptions() {
  if (sheet.hidden) return;
  stopResize();
  for (const [el, placeholder] of borrowed) placeholder.replaceWith(el);
  borrowed = [];
  sheet.classList.remove('up');
  sheet.hidden = true;
  deselect();
  resize();
}
document.getElementById('optionsDone').addEventListener('click', closeOptions);
colourButton.addEventListener('click', () => {
  const target = colourFor;
  closeOptions();
  const surface = { target, object: null, name: TARGET_NAMES[target] };
  openColours(surface);
});
sheet.addEventListener('pointerdown', e => e.stopPropagation());
window.addEventListener('keydown', e => { if (!sheet.hidden && e.key === 'Escape') closeOptions(); });

// A long-press on a mesh: its thing's options, or the room's drawer; for
// something painted with no options of its own, its colours
function optionsFor(mesh) {
  const found = thingOf(mesh), target = colourTargetOf(mesh);
  navigator.vibrate?.(15);
  if (found) return openOptions(found, target);
  if (target) {
    const surface = { target, object: mesh, name: TARGET_NAMES[target] };
    select({ surface });
    return openColours(surface);
  }
  document.getElementById('roomOptions').click();
}
const hasOptions = mesh => Boolean(thingOf(mesh));

// ---------------------------------------------------------------------------
// The laptop's ways to a thing's options, in every view, as a long-press:
// a right-click (not a right-drag, which pans), a double-click, and Enter
// or O for what's selected
// ---------------------------------------------------------------------------
const canvas = renderer.domElement;
const gameOn = () => !document.body.classList.contains('classic');
const CLICK_PX = 6;                // a right-click moves no further than this; more is a drag (chosen)
let rightDown = null;
canvas.addEventListener('pointerdown', e => { if (e.button === 2) rightDown = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', e => {
  if (e.button !== 2 || !rightDown || !gameOn()) return;
  const still = Math.hypot(e.clientX - rightDown.x, e.clientY - rightDown.y) <= CLICK_PX;
  rightDown = null;
  const hit = still ? hitsUnder(e)[0] : null;
  if (hit) optionsFor(hit.object);
});
canvas.addEventListener('contextmenu', e => { if (gameOn()) e.preventDefault(); });   // the browser's own menu, not over the room
canvas.addEventListener('dblclick', e => {
  if (!gameOn()) return;
  const hit = hitsUnder(e)[0];
  if (hit) optionsFor(hit.object);
});
window.addEventListener('keydown', e => {
  if (!gameOn() || !sheet.hidden || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, select, textarea, button')) return;
  if (e.key !== 'Enter' && e.key.toLowerCase() !== 'o') return;
  if (!document.getElementById('colourSheet').hidden) return;     // Enter keeps a colour there
  const object = objectOf(selection());
  if (!object) return;
  e.preventDefault();
  optionsFor(object);
});

export { optionsFor, openOptions, closeOptions, thingOf, hasOptions };
