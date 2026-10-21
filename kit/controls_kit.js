// The controls kit: the pieces of the drawers' menus that the rooms'
// modules share (REFACTOR_PLAN.md, item 8), each as the HTML it adds. Each
// piece keeps its own menu in its own file (other_room.js, garage.js,
// wicker_bench.js, shoe_rack.js, shoe_boxes.js, stair_walls.js); these are
// only the parts they have in common.

// The size sliders' labels, by the size's key
export const SIZE_LABEL = { w: 'Width', d: 'Depth', h: 'Height' };

// A labelled slider for [path, label, lowest, highest, step], its ids from
// id(path): the slider id(path), its label's text `${id(path)}Label` and its
// value `${id(path)}Value`
export function slider(id) {
  return ([path, label, lo, hi, step]) =>
    `<label for="${id(path)}"><span id="${id(path)}Label">${label}</span>: <span id="${id(path)}Value"></span></label>` +
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
