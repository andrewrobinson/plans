// The colour sheet (a piece of living_room.js): it slides up from the
// bottom with the room still in view above it, and sliding a finger along
// its strip of colours paints what's selected as the finger goes, before
// anything's kept. ✓ keeps the colour (one change, one history entry), ✕
// puts it back. Spectrum opens a rectangle of every hue to drag over (each
// colour the nearest RAL); More opens every RAL colour, by family, to tap.
import { RAL } from '../../kit/floor_kit.js';
import { config, colourOf, shownCode } from '../../flat_model.js';
import { change, paintAll, resize, POPULAR, FAMILIES } from '../../living_room.js';
import { spectrum } from '../spectrum.js';

// What each colour setting paints, as the sheet names it
const TARGET_NAMES = {
  floor: 'The floor', cupboard: 'The cupboards and bench', wall: 'The walls', woodwork: 'The door frames and doors',
  dresser: 'The dresser', carpet: 'The carpet', bedroomCupboard: "The bedroom's cupboard",
};
// The strip: the room's own finishes, then the cupboard colours most
// chosen (page/colours.js's POPULAR), as many as fit a phone's width
const FINISH_CODES = [2, 1, 5, 4, 6, 3];
const STRIP_RAL = 8;               // chosen: 14 swatches, each a finger's width on a 390-wide phone
const STRIP = [...FINISH_CODES, ...POPULAR.slice(0, STRIP_RAL)];

const sheet = document.getElementById('colourSheet'), strip = document.getElementById('colourStrip');
const grid = document.getElementById('colourGrid'), more = document.getElementById('colourMore');
const spectrumBox = document.getElementById('colourSpectrum'), spectrumButton = document.getElementById('colourSpectrumButton');
const dot = document.getElementById('colourDot'), nameBox = document.getElementById('colourName'), forBox = document.getElementById('colourFor');
const swatch = code => `<button class="swatch" data-code="${code}" style="background:${colourOf(code).hex}" aria-label="${colourOf(code).name}"></button>`;
strip.innerHTML = STRIP.map(swatch).join('');
grid.innerHTML = [['Popular for cupboards', POPULAR], ...FAMILIES.map(([label, first]) => [label, Object.keys(RAL).filter(c => c.startsWith(first)).map(Number)])]
  .map(([label, codes]) => `<div class="family">${label}</div>${codes.map(swatch).join('')}`).join('');

let open = null;                   // { target, before, code }
function preview(code) {
  if (!open || !Number.isFinite(code)) return;
  open.code = code;
  config.colours[open.target] = code;
  paintAll();
  showChosen();
}
function showChosen() {
  const colour = colourOf(shownCode(open.target));
  dot.style.background = colour.hex;
  nameBox.textContent = colour.name;
  const shown = shownCode(open.target);
  for (const b of sheet.querySelectorAll('.swatch')) b.classList.toggle('chosen', Number(b.dataset.code) === shown);
  spectrumPicker.show(shown);
}
function openColours({ target, name }) {
  if (open) close(false);
  open = { target, before: config.colours[target], code: config.colours[target] };
  forBox.textContent = name ?? TARGET_NAMES[target];
  showBelow(null);
  sheet.hidden = false;
  requestAnimationFrame(() => { sheet.classList.add('up'); resize(); });   // the 2D views fitted above it
  showChosen();
}
// Closed, keeping the colour or putting it back
function close(keep) {
  if (!open) return;
  const { target, before, code } = open;
  open = null;
  config.colours[target] = before;
  if (keep && code !== before) change([[`colours.${target}`, code]]);
  else paintAll();
  sheet.classList.remove('up');
  sheet.hidden = true;
  resize();
}

// Sliding along the strip paints as it goes; a tap on the grid paints too
const codeUnder = e => Number(document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.swatch')?.dataset.code);
strip.addEventListener('pointerdown', e => {
  strip.setPointerCapture(e.pointerId);
  preview(codeUnder(e));
});
strip.addEventListener('pointermove', e => { if (strip.hasPointerCapture(e.pointerId)) preview(codeUnder(e)); });
grid.addEventListener('click', e => preview(Number(e.target.closest('.swatch')?.dataset.code)));
// Below the strip: the spectrum, the grid or neither, each button opening or closing its own
const spectrumPicker = spectrum({ onSlide: preview });
spectrumBox.append(spectrumPicker.element);
const BELOW = [[spectrumBox, spectrumButton], [grid, more]];
function showBelow(shown) {
  for (const [box, button] of BELOW) {
    box.hidden = box !== shown;
    button.setAttribute('aria-expanded', String(box === shown));
  }
}
for (const [box, button] of BELOW) button.addEventListener('click', () => showBelow(box.hidden ? box : null));
document.getElementById('colourKeep').addEventListener('click', () => close(true));
document.getElementById('colourCancel').addEventListener('click', () => close(false));
sheet.addEventListener('pointerdown', e => e.stopPropagation());
window.addEventListener('keydown', e => { if (open && e.key === 'Escape') close(false); if (open && e.key === 'Enter') close(true); });

export { openColours, TARGET_NAMES };
