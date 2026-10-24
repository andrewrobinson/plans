// The colour pickers and the palette (a piece of living_room.js).
import { RAL } from '../kit/floor_kit.js';
import {
  CURRENT_ROOM, FINISHES, SHELF_WOODS, STORED, carcassMat, colourOf, cupboard, dresserMat, handleMat, islandMat, 
  islandOnWall, islandTopMat, kitchenMat, oakMat, screenMat, shelfMat, shownCode, config, storedMats, drawn, 
  tvMat, worktopMat, tvOn, aboveNow
} from '../flat_model.js';
import { COLOUR_TARGETS, applyColour } from '../model/colours.js';
import { wallMat, frameMat, ceilingMat, carpetMat } from '../floor.js';
import { about, change, drawSoon } from '../living_room.js';
import { spectrum } from './spectrum.js';

// The cupboard and dresser colours: named colours to compare, or "Other
// colours…", which shows a second dropdown of popular cupboard colours and
// every RAL colour by family. ◀ and ▶ step between the named ones.
const POPULAR = [9010, 9001, 1013, 9016, 7035, 7044, 7038, 7030, 7004, 7016, 7021, 5014, 5008, 5011,
  6021, 6011, 6003, 6009, 1019, 1015, 8025, 3012, 9005];
const FAMILIES = [
  ['Whites and blacks', '9'], ['Greys', '7'], ['Beiges and yellows', '1'], ['Greens', '6'],
  ['Blues', '5'], ['Browns', '8'], ['Reds and pinks', '3'],
];
const ralLabel = code => `RAL ${code} ${RAL[code][0]}`;
// The named colours both pickers offer, then each picker's own extras
const NAMED = [
  [5, 'Clerkenwell Gloss White (as the kitchen)'], [4, 'AI Olive (from the AI picture)'],
  [6, "Bella Brittany (the blinds' fabric)"], [7, 'Blinds as drawn (the window colour)'],
  [8, 'Kitchen worktop (light stone)'], [9, 'Kitchen island (painted white)'], [10, 'Kitchen island top (honey oak)'],
];
const OTHER = 'other';
const OTHER_OPTIONS =
  `<optgroup label="Popular for cupboards">${POPULAR.map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('')}</optgroup>` +
  FAMILIES.map(([label, first]) => `<optgroup label="RAL ${label.toLowerCase()}">` +
    Object.keys(RAL).filter(c => c.startsWith(first)).map(c => `<option value="${c}">${ralLabel(c)}</option>`).join('') +
    '</optgroup>').join('');
const colourRefreshers = [];
const refreshColours = () => colourRefreshers.forEach(f => f());
// Every target painted as the settings say, so those following one follow it
// too: for a colour tried before it's kept
const paintAll = () => { for (const target of Object.keys(COLOUR_TARGETS)) applyColour(target); drawSoon(); };
// A colour picker for one target: a dropdown of the named colours and the
// extras, ◀ ▶ to step between them, "Other colours…" for any RAL colour, and
// the swatch, which opens a spectrum to drag over
function colourPicker(target, [selectId, otherId, otherRowId, prevId, nextId, swatchId], extras, named = NAMED) {
  const select = document.getElementById(selectId), other = document.getElementById(otherId);
  const choices = [...named, ...extras], compare = choices.map(([code]) => code);
  select.innerHTML = choices.map(([code, label]) => `<option value="${code}">${label}</option>`).join('') +
    `<option value="${OTHER}">Other colours…</option>`;
  other.innerHTML = OTHER_OPTIONS;
  colourRefreshers.push(() => {
    const code = config.colours[target];
    const named = compare.includes(code);
    select.value = named ? String(code) : OTHER;
    document.getElementById(otherRowId).hidden = named;
    // The same colour can appear twice (popular and its family); keep whichever is selected
    if (!named && Number(other.value) !== code) other.value = String(code);
    const colour = colourOf(shownCode(target));
    document.getElementById(swatchId).style.background = colour ? colour.hex : 'transparent';
    picker.show(shownCode(target));
  });
  const pick = code => change([[`colours.${target}`, code]]);   // anything following it changes too (settle())
  const picker = spectrumUnder(target, document.getElementById(otherRowId), document.getElementById(swatchId), pick);
  // "Other colours…" starts on the other dropdown's current choice
  select.addEventListener('change', () => pick(select.value === OTHER ? Number(other.value) : Number(select.value)));
  other.addEventListener('change', () => pick(Number(other.value)));
  for (const [id, step] of [[prevId, -1], [nextId, 1]]) {
    document.getElementById(id).addEventListener('click', () => {
      // From a named colour, go to the next; from another colour, back to the first
      const k = compare.indexOf(config.colours[target]);
      pick(compare[k < 0 ? 0 : (k + step + compare.length) % compare.length]);
    });
  }
}
// The swatch's spectrum, in a row of its own after `row`: dragging over it
// paints as it goes, and letting go keeps the colour (one change)
function spectrumUnder(target, row, swatch, pick) {
  let before = null;                          // the setting as the drag began
  const picker = spectrum({
    onSlide: code => {
      if (before === null) before = config.colours[target];
      config.colours[target] = code;
      paintAll();
      swatch.style.background = colourOf(code).hex;
    },
    onLetGo: keep => {
      if (before === null) return;
      const code = config.colours[target];
      config.colours[target] = before;
      before = null;
      if (keep && code !== config.colours[target]) pick(code);
      else { paintAll(); refreshColours(); }
    },
  });
  const spectrumRow = document.createElement('div');
  spectrumRow.className = 'colrow spectrumRow';
  spectrumRow.hidden = true;
  spectrumRow.append(picker.element);
  row.after(spectrumRow);
  swatch.addEventListener('click', () => {
    spectrumRow.hidden = !spectrumRow.hidden;
    swatch.setAttribute('aria-expanded', String(!spectrumRow.hidden));
  });
  return picker;
}
colourPicker('cupboard', ['ral-cupboard', 'ral-other', 'otherRow', 'colPrev', 'colNext', 'cupboardSwatch'],
  [[0, 'Same colour as the door'], [1, 'Same colour as the walls']]);
colourPicker('dresser', ['ral-dresser', 'ral-dresser-other', 'dresserOtherRow', 'dresserPrev', 'dresserNext', 'dresserSwatch'],
  [[0, 'Same as the cupboards'], [2, 'Same colour as the door'], [1, 'Same colour as the walls']]);
// The bedroom cupboard's own colour (in Bedroom options): the lounge
// cupboard's to start, as the dresser's
colourPicker('bedroomCupboard', ['ral-bedroomCupboard', 'ral-bedroomCupboard-other', 'bedroomCupboardOtherRow', 'bedroomCupboardColPrev', 'bedroomCupboardColNext', 'bedroomCupboardSwatch'],
  [[0, 'Same as the lounge cupboard'], [2, 'Same colour as the door'], [1, 'Same colour as the walls']]);
// The carpet: from the doorway photo (0, its default), the first photos'
// colour made lighter, or as it was, or Dormouse from the maker's swatch;
// none of the cupboards' named colours
colourPicker('carpet', ['ral-carpet', 'ral-carpet-other', 'carpetOtherRow', 'carpetPrev', 'carpetNext', 'carpetSwatch'],
  [[0, 'From the doorway photo'], [13, 'From the room photos, lighter (greyer)'], [12, 'From the room photos (darker)'], [11, 'Cormar Dormouse swatch (browner)']], []);
refreshColours();

// The shelf colour: the wooden shelves everywhere (above the bench, in the
// corner and upper units, option 9's tower) and option 9's oak top. As drawn,
// the shelves are a pale oak and option 9's oak is a little deeper; the
// others make them all one wood. Screen colours are approximate.
const shelfSelect = document.getElementById('shelfWood');
shelfSelect.innerHTML = SHELF_WOODS.map((w, i) => `<option value="${i}">${w.name}</option>`).join('');
function showShelfWood() {
  shelfSelect.value = String(config.colours.shelves);
  document.getElementById('shelfSwatch').style.background = [].concat(SHELF_WOODS[config.colours.shelves].hex)[0];
}
showShelfWood();
shelfSelect.addEventListener('change', () => change([['colours.shelves', Number(shelfSelect.value)]]));

// "Colours in this view" in the menu: a colour square for each part on show,
// read from the model's own materials so it follows the choices above. Parts
// whose materials are local to their drawing code are listed by value.
function updatePalette() {
  const { shelves: shelfWood } = config.colours, above = aboveNow(), { option } = config.pieces.cornerCupboard.design;
  const current = option === CURRENT_ROOM;                       // the room as it is, no cupboards
  const paintedFront = !islandOnWall() && ['dresser', 'larder'].includes(config.livingRoom.frontWall);   // in the dresser colour
  const hex = m => `#${m.color.getHexString().toUpperCase()}`;
  const rows = [
    ...(current ? [] : [['Cupboards and bench', hex(carcassMat), colourOf(shownCode('cupboard')).name], ['Handles', hex(handleMat)]]),
    ...(paintedFront ? [['Dresser', hex(dresserMat), colourOf(shownCode('dresser')).name]] : []),
    ['Shelves', hex(shelfMat), SHELF_WOODS[shelfWood].name],
    ...(option === 9 ? [['Tower shelves and oak top', hex(oakMat), SHELF_WOODS[shelfWood].name]] : []),
    ...(tvOn() ? [['TV', hex(tvMat)], ['TV screen', hex(screenMat)]] : []),
    ['Walls', hex(wallMat), colourOf(shownCode('wall')).name],
    ['Door, frame and sills', hex(frameMat), colourOf(shownCode('woodwork')).name],
    ['Ceiling', hex(ceilingMat), 'Pure Brilliant White, matt'],
    ['Floor', FINISHES[3].hex, 'Howdens oak 3-strip, on average'],
    ['Carpet (bedroom and stairs)', hex(carpetMat), colourOf(shownCode('carpet')).name],
    ['Kitchen units', hex(kitchenMat), 'Clerkenwell Gloss White'],
    ['Kitchen worktop', hex(worktopMat), 'Light stone laminate'],
    ['Sink', '#C4C8CC', 'Stainless steel'],
    ['Alcove tiles', '#EEEEEA'],
    ['Island', hex(islandMat), 'Painted white'],
    ['Island top', hex(islandTopMat), 'Oak'],
    ['Desk', '#F2F1EE'],
    ['Chair, monitors and riser', '#222222'],
    ['Window panes (blinds)', '#CFE3EF', 'See-through: shows as about #B8C0BF'],
    ['Radiators', '#F6F6F4'],
    ...(config.thingsToStore.shown ? STORED.map((t, k) => [t.name, hex(storedMats[k]), 'to store']) : []),
  ];
  document.getElementById('paletteList').innerHTML = rows.map(([what, value, name]) =>
    `<div class="colrow"><span class="swatch" style="background:${value}"></span>` +
    `<span class="what">${what}${name ? ` · ${name}` : ''}</span><code>${value}</code></div>`).join('');
}
// The palette starts folded away; remember if the viewer opens it
const palette = document.getElementById('palette');
try { palette.open = localStorage.getItem('paletteOpen') === '1'; } catch (e) { /* not important */ }
palette.addEventListener('toggle', () => {
  try { localStorage.setItem('paletteOpen', palette.open ? '1' : '0'); } catch (e) { /* not important */ }
});

// What the other pieces of the model use
export {
  POPULAR, FAMILIES, paintAll,
  refreshColours, showShelfWood, updatePalette
};
