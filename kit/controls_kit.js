// The controls kit: the pieces of the drawers' menus that the rooms'
// modules share (REFACTOR_PLAN.md, item 8), each as the HTML it adds. Each
// piece keeps its own menu in its own file (other_room.js, garage.js,
// wicker_bench.js, shoe_rack.js, shoe_boxes.js, stair_walls.js); these are
// only the parts they have in common.

// The size sliders' labels, by the size's key
export const SIZE_LABEL = { w: 'Width', d: 'Depth', h: 'Height' };

// A labelled slider for [path, label, lowest, highest, step, unit, tip],
// its ids from id(path): the slider id(path), its label's text
// `${id(path)}Label` and its value `${id(path)}Value`. The tip, if any, is
// the label's tooltip: what a short label leaves out (notes/UI_CRITIQUE.md, step 9)
export function slider(id) {
  return ([path, label, lo, hi, step, , tip]) =>
    `<label for="${id(path)}"${tip ? ` title="${tip}"` : ''}><span id="${id(path)}Label">${label}</span>: <span id="${id(path)}Value"></span></label>` +
    `<input id="${id(path)}" type="range" min="${lo}" max="${hi}" step="${step}">`;
}

// The switch for a bookcase lying down (Billy, in the bedroom and the garage)
export const LYING_LABEL = 'Lying on its long side, open side out';
export const lyingSwitch = switchId => `<label class="switch"><input type="checkbox" id="${switchId}"> ${LYING_LABEL}</label>`;

// A dropdown of the room's walls, `walls` { key: { label } }, to stand a
// piece against
export function wallPick(pickId, walls) {
  return `<label for="${pickId}">On the wall:</label> <select id="${pickId}">` +
    Object.entries(walls).map(([k, { label }]) => `<option value="${k}">${label}</option>`).join('') + '</select>';
}

// A piece's buttons to put its dimensions and its location back as they
// started, for the piece with `sizes` and `place` sliders, number i in its
// room's list (the buttons' data-piece; the room's module listens for them)
export function resetButtons(piece, i) {
  const button = (what, text) => `<button data-reset="${what}" data-piece="${i}">${text}</button>`;
  const buttons = [piece.sizes.length && button('sizes', 'Reset dimensions'), piece.place.length && button('place', 'Reset location')].filter(Boolean);
  return buttons.length ? `<div class="row">${buttons.join('')}</div>` : '';
}

// A number box in place of each chosen slider's value (notes/UI_CRITIQUE.md,
// step 3): a size or place can be typed, not only dragged to. Every slider
// in `root` with a value (`${slider.id}Value`) for which isWanted(slider,
// value) is true gets one, so call this once the controls show their
// values. A number typed goes to the slider, which holds it to its range
// and step, and on through the slider's own input listener, as a drag
// would; anything that isn't a number is refused, the box showing the
// slider again. The box follows the slider as the page puts the slider in
// step: each time its value is written (a MutationObserver on it). Where
// the value is a word (Cupboard height: ceiling), the word stays after the
// box.
export function numberBoxes(root, isWanted) {
  for (const slider of root.querySelectorAll('input[type=range]')) {
    const value = document.getElementById(`${slider.id}Value`);
    if (value && isWanted(slider, value.textContent)) numberBox(slider, value);
  }
}

function numberBox(slider, value) {
  const box = document.createElement('input');
  Object.assign(box, { type: 'number', id: `${slider.id}Box`, className: 'numberBox', inputMode: 'decimal' });
  box.setAttribute('aria-label', document.querySelector(`label[for="${slider.id}"]`).textContent.replace(/:.*$/s, ''));
  value.before(box);
  // The box as the slider stands, its range too (some follow the room: a
  // wall's length). Its number is the value written, which can be off the
  // slider's step (a saved 1372 on a slider in 5s), so is truer than the
  // slider's own; a word is kept beside the slider's number, a number shown once
  const follow = () => {
    for (const k of ['min', 'max', 'step']) box[k] = slider[k];
    const written = value.textContent.trim(), isNumber = written !== '' && Number.isFinite(Number(written));
    box.value = isNumber ? written : slider.value;
    value.hidden = isNumber;
  };
  follow();
  new MutationObserver(follow).observe(value, { childList: true, characterData: true, subtree: true });
  box.addEventListener('change', () => {
    if (box.value === '' || !Number.isFinite(Number(box.value))) return follow();
    slider.value = box.value;                               // held to its range and step, as the slider holds it
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));   // as a slider let go: one change, for the page's history
    follow();
  });
}
