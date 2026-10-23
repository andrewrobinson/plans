// A thing's options, by long-pressing it (a piece of living_room.js): the
// sheet slides up from the bottom holding that thing's own controls from
// Lounge, Bedroom or Hallway options, moved there while it's open and put
// back as it closes, so each works just as it does in its drawer and the
// thing changes above the sheet as it's set. What has no section of its
// own opens its room's whole drawer. Something painted also gets a Colour
// button, for the colour sheet. Asked for, 23 Oct 2026.
import { cupboard, drawn, islandGroup, pieces, tvMat, namedPieces } from '../../flat_model.js';
import { benchMat } from '../../model/materials.js';
import { otherRoomPieces } from '../../other_room.js';
import { wickerBenches } from '../../wicker_bench.js';
import { shoeRack } from '../../shoe_rack.js';
import { stairWalls } from '../../stair_walls.js';
import { shoeBoxes } from '../../shoe_boxes.js';
import { garage } from '../../garage.js';
import { bathroom } from '../../floor.js';
import { drawers, resize } from '../../living_room.js';
import { colourTargetOf } from './picking.js';
import { select, deselect } from './selection.js';
import { openColours, TARGET_NAMES } from './colour_sheet.js';

// ---------------------------------------------------------------------------
// Each thing: its name, the objects drawn for it (any part of one, pressed,
// is it) or the materials it's made of, and its controls' ids in the
// drawers (sections, or blocks within one), in the order they're shown
// ---------------------------------------------------------------------------
const ISLAND = ['islandBlock', 'islandMoveBlock', 'islandTypeBlock', 'islandSizeBlock', 'islandSeatBlock'];
const BEDROOM_PIECES = {
  bed: 'Bed', bookcase: 'Bookcase', cupboard: 'Pine cupboard', billy: 'Billy', billyChest: 'BillyChest', ivar: 'Ivar',
  bedsideTable: 'Bedside table', bedsideTableByCupboard: 'Bedside table', kvistbro: 'Kvistbro', laundryBasket: 'Laundry basket', mirror: 'Mirror',
};
const THINGS = [
  // The lounge
  { name: 'Sofa', objects: () => [pieces.sofa], ids: ['secSofa'] },
  { name: 'Kitchen island', objects: () => [islandGroup], ids: ISLAND },
  { name: 'Dresser', objects: () => [pieces.dresser], ids: ['frontBlock', 'dresserBlock'] },
  { name: 'Larder', objects: () => [pieces.larder], ids: ['frontBlock', 'larderBlock'] },
  { name: 'Corner cupboard', objects: () => [cupboard?.group], ids: ['secCupboard'] },
  { name: 'Ivar', objects: () => [pieces.ivar], ids: ['secIvar'] },
  { name: 'Cornwall table', objects: () => [pieces.cornwall], ids: ['secCornwall'] },
  { name: 'Chesham table', objects: () => [pieces.chesham], ids: ['secChesham'] },
  { name: 'Desk on castors', objects: () => [pieces.castorDesk], ids: ['secCastorDesk'] },
  { name: 'Speakers', objects: () => [pieces.speakers], ids: ['secSpeakers'] },
  { name: 'Billy', objects: () => [drawn.backWall.billy], ids: ['billyMoveBlock'] },
  { name: 'BillyChest', objects: () => [drawn.backWall.billyChest], ids: ['billyChestMoveBlock'] },
  { name: 'Bookcase', objects: () => [drawn.backWall.bookshelf], ids: ['bookshelfMoveBlock'] },
  { name: 'Pine cupboard', objects: () => [drawn.backWall.pine], ids: ['pineMoveBlock'] },
  { name: 'Daybed and desk', objects: () => [drawn.backWall.deskDaybed], ids: ['deskDaybedMoveBlock'] },
  { name: 'The back wall: bench, TV and shelves', materials: () => [benchMat, tvMat], ids: ['secBench'] },
  // The bedroom
  ...Object.entries(BEDROOM_PIECES).map(([key, name]) => ({ name, objects: () => [otherRoomPieces[key]], ids: [`otherRoomPiece_${key}`] })),
  { name: "The bedroom's new cupboard", objects: () => [namedPieces().bedroomCupboard], ids: ['secBedroomCupboard'] },
  // Any room's wicker bench
  { name: 'Wicker bench', objects: () => Object.values(wickerBenches), ids: ['secWickerBench'] },
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
    if (thing) return { thing, object: o };
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

function openOptions({ thing, object }, target = null) {
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
  sheet.hidden = false;
  body.scrollTop = 0;
  requestAnimationFrame(() => { sheet.classList.add('up'); resize(); });   // the 2D views fitted above it
}
function closeOptions() {
  if (sheet.hidden) return;
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

export { optionsFor, openOptions, closeOptions, thingOf, hasOptions };
