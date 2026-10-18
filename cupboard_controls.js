// A corner cupboard's controls: its option list, its sizes (each held to
// where it can reach in its room: cupboardLimits()), its height, option
// 10's side bookshelf and option 7's shelves, each
// changing the cupboard's design by its path in the configuration
// (pieces.<piece>.design, through the page's change()), and its door
// sliders' blocks shown as its option has them. The living room's are
// index.html's own, in Lounge options; the bedroom's are a copy of them
// (copyControls()), in Bedroom options, each id with the piece's name
// before it. living_room.js makes both.
import { OPTIONS, optionAt, get, cupboardOf, cupboardSettings, readShelves, idIn, cupboardLimits } from './flat_model.js';

// The sliders, by their ids, and the settings they change, bar the
// left-wall cupboard's depth (with its "none")
const CUPBOARD_SLIDERS = [['rear', 'R'], ['leftLen', 'F'], ['board', 'BOARD'], ['leg', 'LEG'], ['legD', 'LEG_D'],
  ['diagRun', 'DIAG_RUN'], ['diagBack', 'DIAG_BACK'], ['diagLeft', 'DIAG_LEFT'], ['ward', 'WARD'], ['wardD', 'WARD_D'],
  ['tower', 'TOWER'], ['cornerW', 'CORNER_W'], ['cornerD', 'CORNER_D'], ['sideW', 'SIDE_W'], ['sideD', 'SIDE_D']];
// The left-wall cupboard's depth slider: none at its far left (290, index.html),
// then 300 to 800
const NO_LEFT_WALL = 290, LEFT_WALL_FROM = 300;
// The height slider: at its far right (2450, index.html), up to the ceiling,
// which is TOP 0
const TO_THE_CEILING = 2450;

// A control's id in a copy of the controls (flat_model.js has it, for the
// configuration's entries)
export { idIn };
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
// its list offers. Gives choose(i), an option chosen as from the list,
// sync(), every control in step with the settings, and showBlocks(), only
// the blocks that apply to its option shown
export function cupboardControls({ piece, id = name => name, change, options = OPTIONS.map((o, i) => i) }) {
  const at = key => `pieces.${piece}.design.${key}`;
  const value = key => get(at(key));
  const set = (key, v) => change([[at(key), v]]);
  // A size set, held to where it can reach, and any other size it now holds
  // back brought in with it (a deeper left-wall cupboard meets the
  // bedroom door's swing sooner, so its length comes in)
  function setSize(key, v) {
    const next = { ...cupboardSettings(piece), [key]: v };
    next[key] = Math.min(v, cupboardLimits(piece, next)[key] ?? Infinity);
    const edits = [[at(key), next[key]]];
    for (const [k, most] of Object.entries(cupboardLimits(piece, next))) if (k !== key && next[k] > most) edits.push([at(k), most]);
    change(edits);
  }
  const el = name => document.getElementById(id(name));
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
    setSize('T', v < LEFT_WALL_FROM ? 0 : v);
  });
  el('top').addEventListener('input', e => {
    const v = Number(e.target.value);
    set('TOP', v >= TO_THE_CEILING ? 0 : v);
  });
  for (const [name, key] of CUPBOARD_SLIDERS) el(name).addEventListener('input', e => setSize(key, Number(e.target.value)));
  el('sideShelfOn').addEventListener('change', e => set('SIDE_SHELF', e.target.checked));
  for (const k of ['back', 'left']) shelfInputs[k].addEventListener('change', () => set(`L_SHELVES.${k}`, readShelves(shelfInputs[k].value)));

  function sync() {
    const slide = (name, v, text = v) => {
      el(name).value = String(v);
      el(`${name}Value`).textContent = text;
    };
    const T = value('T');
    slide('depth', T || NO_LEFT_WALL, T || 'none');
    const TOP = value('TOP');
    slide('top', TOP || TO_THE_CEILING, TOP || 'ceiling');
    for (const [name, key] of CUPBOARD_SLIDERS) slide(name, value(key));
    el('sideShelfOn').checked = value('SIDE_SHELF');
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
    shown('diagBlock', no === 8);
    shown('wardBlock', no === 9);
    shown('cornerBlock', no === 10 || no === 11);
    shown('sideShelfBlock', no === 10);                         // option 11's doors open where it would stand
    shown('sideShelfDetails', value('SIDE_SHELF'));
    shown('leftLenBlock', !option.front);                       // options 10 and 11 have their own depth (cornerD)
    shown('depthBlock', !option.fixedWidth);
    shown('secondBlock', option.second);
    el('secondLabel').textContent = option.second || '';
  }

  return { choose, sync, showBlocks };
}
