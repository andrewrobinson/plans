// A corner cupboard's controls: its option list, its sizes, option 10's side
// bookshelf, option 7's shelves and the left-wall cupboard's front, each
// changing the cupboard's design by its path in the configuration
// (pieces.<piece>.design, through the page's change()), and its door
// sliders' blocks shown as its option has them. The living room's are
// index.html's own, in Lounge options; the bedroom's are a copy of them
// (copyControls()), in Bedroom options, each id with the piece's name
// before it. living_room.js makes both.
import { OPTIONS, optionAt, get, cupboardOf, readShelves } from './flat_model.js';

// The sliders, by their ids, and the settings they change, bar the
// left-wall cupboard's depth (with its "none")
const CUPBOARD_SLIDERS = [['rear', 'R'], ['board', 'BOARD'], ['leg', 'LEG'], ['legD', 'LEG_D'], ['ward', 'WARD'], ['wardD', 'WARD_D'],
  ['tower', 'TOWER'], ['cornerW', 'CORNER_W'], ['cornerD', 'CORNER_D'], ['sideW', 'SIDE_W'], ['sideD', 'SIDE_D']];
// The left-wall cupboard's depth slider: none at its far left (290, index.html),
// then 300 to 800
const NO_LEFT_WALL = 290, LEFT_WALL_FROM = 300;

// A control's id in a copy of the controls: the piece's name, then the
// living room's id with a capital, as 'bedroomCupboardDepth' for 'depth'
export const idIn = piece => name => `${piece}${name[0].toUpperCase()}${name.slice(1)}`;
// Copies of `elements`, every id (and the labels' and radios' references to
// one) given its name in the copy (idIn(piece))
export function copyControls(elements, piece) {
  const id = idIn(piece);
  return elements.map(element => {
    const copy = element.cloneNode(true);
    for (const el of [copy, ...copy.querySelectorAll('[id], [for], [name]')]) {
      for (const attr of ['id', 'for', 'name']) if (el.hasAttribute(attr)) el.setAttribute(attr, id(el.getAttribute(attr)));
    }
    return copy;
  });
}

// The controls for the cupboard `piece` ('cornerCupboard' or
// 'bedroomCupboard'): `id(name)` gives a control's id from the living
// room's; `change(edits)` is the page's; `options`, the places in OPTIONS
// its list offers; `front`, whether it has the left-wall front's choice
// (only the living room has a door frame to go up to). Gives choose(i), an
// option chosen as from the list, sync(), every control in step with the
// settings, and showBlocks(), only the blocks that apply to its option shown
export function cupboardControls({ piece, id = name => name, change, options = OPTIONS.map((o, i) => i), front = true }) {
  const at = key => `pieces.${piece}.design.${key}`;
  const value = key => get(at(key));
  const set = (key, v) => change([[at(key), v]]);
  const el = name => document.getElementById(id(name));
  const frontRadios = () => document.querySelectorAll(`input[name=${id('front')}]`);
  const shelfInputs = { back: el('shelvesBack'), left: el('shelvesLeft') };

  // The option list; choosing an option (not a link to one): with no
  // left-wall cupboard, an option with a default for it gets one
  const list = el('current');
  list.innerHTML = options.map(i => `<option value="${i}">${OPTIONS[i].name}</option>`).join('');
  list.addEventListener('change', () => choose(Number(list.value)));
  function choose(i) {
    const { no, defaultLeft } = OPTIONS[i];
    const edits = [[at('option'), no]];
    if (value('T') === 0 && defaultLeft) edits.push([at('T'), defaultLeft]);
    change(edits);
  }

  el('depth').addEventListener('input', e => {
    const v = Number(e.target.value);
    set('T', v < LEFT_WALL_FROM ? 0 : v);
  });
  for (const [name, key] of CUPBOARD_SLIDERS) el(name).addEventListener('input', e => set(key, Number(e.target.value)));
  el('sideShelfOn').addEventListener('change', e => set('SIDE_SHELF', e.target.checked));
  for (const k of ['back', 'left']) shelfInputs[k].addEventListener('change', () => set(`L_SHELVES.${k}`, readShelves(shelfInputs[k].value)));
  frontRadios().forEach(r => r.addEventListener('change', () => set('F', Number(r.value))));

  function sync() {
    const slide = (name, v, text = v) => {
      el(name).value = String(v);
      el(`${name}Value`).textContent = text;
    };
    const T = value('T');
    slide('depth', T || NO_LEFT_WALL, T || 'none');
    for (const [name, key] of CUPBOARD_SLIDERS) slide(name, value(key));
    el('sideShelfOn').checked = value('SIDE_SHELF');
    frontRadios().forEach(r => { r.checked = Number(r.value) === value('F'); });
    for (const k of ['back', 'left']) shelfInputs[k].value = value(`L_SHELVES.${k}`).join(', ');
  }

  // After it's built, as option 8 falls back to 7 with no left-wall cupboard
  function showBlocks() {
    const i = optionAt(value('option')), option = OPTIONS[i], { no } = option;
    [...list.options].forEach(o => { o.disabled = value('T') === 0 && Boolean(OPTIONS[Number(o.value)].needsLeft); });
    list.value = String(i);
    const shown = (name, yes) => { el(name).style.display = yes ? '' : 'none'; };
    shown('tallBlock', Boolean(cupboardOf(piece)?.doors.tall));
    shown('legBlock', no === 7);
    shown('wardBlock', no === 9);
    shown('cornerBlock', no === 10 || no === 11);
    shown('sideShelfBlock', no === 10);                         // option 11's doors open where it would stand
    shown('sideShelfDetails', value('SIDE_SHELF'));
    shown('front', front && !option.front);                     // options 10 and 11 have their own depth (cornerD)
    shown('depthBlock', !option.fixedWidth);
    shown('secondBlock', option.second);
    el('secondLabel').textContent = option.second || '';
  }

  return { choose, sync, showBlocks };
}
