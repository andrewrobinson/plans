// The game UI's frame (a piece of living_room.js): the room chips along
// the top, the view switch at the bottom (Plan, Overhead, Walk), the
// furniture picker down the left, the ☰ menu holding what the top bar
// had on a phone, and the note at the bottom with Undo. Agreed with the
// user, 23 Oct 2026 (the mobile-first branch). On a phone it stands in for
// the top bar; on the desktop it sits beside it. `?classic` in the address
// leaves it out, the page as it was (the tests of the old controls use it).
import { display } from '../display.js';
import { viewKit, change, camera, controls, drawSoon } from '../../living_room.js';
import { ROOMS, at, isIn, replacerOf, replacedNow } from './furniture.js';
import { dragFromPicker, deselect } from './plan_edit.js';

const classic = document.body.classList.contains('classic');

// ---------------------------------------------------------------------------
// The view modes, each a view every room has: its plan, its bird's eye, or
// standing in it as you come in (its rooms' `enter`, living_room.views.js)
// ---------------------------------------------------------------------------
const MODES = {
  plan: { label: 'Plan', icon: 'layout-2', view: () => 'plan' },
  overhead: { label: 'Overhead', icon: '3d-cube-sphere', view: () => 'birdseye' },
  walk: { label: 'Walk', icon: 'walk', view: room => { const { place, thing } = window.ROOM_VIEWS.rooms[room].enter; return `look:${place}:${thing}`; } },
};
// The mode on show, from the view: none for the 2D walls
function modeNow() {
  if (display.flat) return display.flatView === 'plan' ? 'plan' : null;
  return viewKit.asPerson ? 'walk' : 'overhead';
}
// Between two 3D views the camera glides, so you see where you've gone
const GLIDE_MS = 450;              // chosen: long enough to follow, short enough not to wait for
function glideFrom(from) {
  const to = { position: camera.position.clone(), target: controls.target.clone() };
  const start = performance.now();
  (function step() {
    const t = Math.min(1, (performance.now() - start) / GLIDE_MS), ease = t * (2 - t);
    camera.position.lerpVectors(from.position, to.position, ease);
    controls.target.lerpVectors(from.target, to.target, ease);
    if (t < 1) requestAnimationFrame(step);
  })();
}
// Room r in mode m; to the room's entrance in Walk
function goTo(room, mode) {
  const from = display.flat ? null : { position: camera.position.clone(), target: controls.target.clone() };
  deselect();
  viewKit.showRoom(room, MODES[mode].view(room));
  if (from && !display.flat) glideFrom(from);
  drawSoon();
  showShell();
}

// ---------------------------------------------------------------------------
// The room chips, the view switch and the ☰ menu
// ---------------------------------------------------------------------------
const ROOM_CHIPS = [
  ['livingRoom', 'Lounge', 'sofa'], ['bedroom', 'Bedroom', 'bed'], ['hallway', 'Hall', 'stairs'],
  ['downstairs', 'Downstairs', 'door'], ['garage', 'Garage', 'building-warehouse'],
];
const icon = name => `<i class="ti ti-${name}" aria-hidden="true"></i>`;
const roomsRow = document.getElementById('gameRooms'), modesBar = document.getElementById('gameModes');
const picker = document.getElementById('picker'), toastBox = document.getElementById('gameToast');

roomsRow.innerHTML = `<button id="gameMenu" class="gameIcon" aria-label="Menu" aria-haspopup="menu" aria-expanded="false">${icon('menu-2')}</button>` +
  ROOM_CHIPS.map(([room, name, i]) => `<button class="gameChip" data-room="${room}">${icon(i)}${name}</button>`).join('');
roomsRow.addEventListener('click', e => {
  const chip = e.target.closest('[data-room]');
  if (chip) goTo(chip.dataset.room, modeNow() ?? 'overhead');
});
modesBar.innerHTML = Object.entries(MODES).map(([mode, { label, icon: i }]) =>
  `<button role="radio" data-view="${mode}" aria-checked="false">${icon(i)}<span>${label}</span></button>`).join('');
modesBar.addEventListener('click', e => {
  const button = e.target.closest('[data-view]');
  if (button) goTo(viewKit.room, button.dataset.view);
});

// ☰: what the top bar holds that the game UI doesn't, each by pressing the
// top bar's own control, which stays in the page out of sight on a phone
const MENU = [
  ['adjustments', 'Room options', () => document.getElementById('roomOptions').click()],
  ['settings', 'Other options', () => document.getElementById('menu').click()],
  ['share', 'Share', () => document.getElementById('share').click()],
  ['camera', 'Screenshot', () => document.getElementById('screenshot').click()],
];
const menuButton = document.getElementById('gameMenu'), menu = document.getElementById('gameMenuList');
menu.innerHTML = MENU.map(([i, label], n) => `<button role="menuitem" data-n="${n}">${icon(i)}${label}</button>`).join('');
function openMenu(open) {
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
}
menuButton.addEventListener('click', () => openMenu(menu.hidden));
menu.addEventListener('click', e => {
  const item = e.target.closest('[data-n]');
  if (!item) return;
  openMenu(false);
  MENU[item.dataset.n][2]();
});
window.addEventListener('pointerdown', e => { if (!menu.hidden && !e.target.closest('#gameMenuList, #gameMenu')) openMenu(false); });

// ---------------------------------------------------------------------------
// The picker: an icon for each of the room's pieces (furniture.js's ROOMS),
// a dot on those in it, in every view. Tapping one puts it in or takes it
// out (with Undo); dragging one sideways into the room puts it where it's
// dropped, in Plan (plan_edit.js); dragging up and down scrolls the list
// ---------------------------------------------------------------------------
let pickerRoom = null;
// A piece's `folder` puts it in a folder, whose icon comes after the rest
// (the lounge's Other): tapped, its pieces open in a panel beside the
// picker, level with it, and work as the picker's own do
const pickButton = ({ key, name, short = name, icon: i }) =>
  `<button class="pick" data-key="${key}" aria-label="${name}" title="${name}">${icon(i)}<span>${short}</span></button>`;
const folderPanel = document.getElementById('pickerFolder');
let pickerPieces = [];
function fillPicker(room) {
  pickerRoom = room;
  closeFolder();
  pickerPieces = ROOMS[room]?.picker ?? [];
  const folders = [...new Set(pickerPieces.map(p => p.folder).filter(Boolean))];
  picker.innerHTML = pickerPieces.filter(p => !p.folder).map(pickButton).join('') + folders.map(folder =>
    `<button class="pick folderPick" data-folder="${folder.key}" aria-expanded="false" aria-controls="pickerFolder" title="${folder.name}">${icon(folder.icon)}<span>${folder.name}</span></button>`).join('');
}
const FOLDER_GAP = 6;              // px between the picker and the folder's panel (chosen)
function openFolder(button) {
  const folder = pickerPieces.find(p => p.folder?.key === button.dataset.folder).folder;
  folderPanel.innerHTML = pickerPieces.filter(p => p.folder === folder).map(pickButton).join('');
  folderPanel.dataset.folder = folder.key;
  folderPanel.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  const at = button.getBoundingClientRect(), high = folderPanel.offsetHeight;
  folderPanel.style.left = `${picker.getBoundingClientRect().right + FOLDER_GAP}px`;
  folderPanel.style.top = `${Math.max(FOLDER_GAP, Math.min(at.top, innerHeight - high - FOLDER_GAP))}px`;   // level with its icon, on the screen
  showShell();
}
function closeFolder() {
  folderPanel.hidden = true;
  folderPanel.replaceChildren();                                 // its pieces are its room's, so gone with it
  picker.querySelectorAll('[data-folder]').forEach(b => b.setAttribute('aria-expanded', 'false'));
}
picker.addEventListener('click', e => {
  const button = e.target.closest('[data-folder]');
  if (!button) return;
  if (folderPanel.hidden || folderPanel.dataset.folder !== button.dataset.folder) openFolder(button);
  else closeFolder();
});
// Shut by a tap anywhere else
window.addEventListener('pointerdown', e => { if (!folderPanel.hidden && !e.target.closest('#pickerFolder, [data-folder]')) closeFolder(); });
const pieceOf = button => pickerPieces.find(p => p.key === button.dataset.key);
// A tap and a drag told apart by how far the pointer goes
const DRAG_START_PX = 8;           // chosen: a finger's wobble on a tap stays under it
// The picker's icons and the folder's
const pressPick = e => {
  const button = e.target.closest('.pick');
  if (!button || button.dataset.folder || e.button > 0) return;
  const piece = pieceOf(button), x = e.clientX, y = e.clientY;
  const move = m => {
    if (Math.hypot(m.clientX - x, m.clientY - y) < DRAG_START_PX) return;
    stop();
    if (isIn(piece) || piece.fixed) return;                     // one in is moved in the room itself; the bench has no place to drop
    closeFolder();
    dragFromPicker(piece, m, () => { if (modeNow() !== 'plan') goTo(pickerRoom, 'plan'); });
  };
  const up = () => { stop(); togglePiece(piece); };
  const stop = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', stop);                // the list scrolled instead
};
picker.addEventListener('pointerdown', pressPick);
folderPanel.addEventListener('pointerdown', pressPick);
// In or out, from the picker
function togglePiece(piece) {
  const on = !isIn(piece);
  setIn(piece, on, `${piece.name} ${on ? 'put in' : 'taken out'}`);
}
// A piece put in or taken out, with a note to undo it: Undo puts back
// every setting of its place in the room as it was (one that's fixed, its
// switch alone)
function setIn(piece, on, note, edits = []) {
  // Put in where something else stands in its place: that one's taken out, a swap
  if (on && replacedNow(piece)) {
    const other = replacerOf(piece);
    edits = [...edits, [other.on, false]];
    note = `${note}, ${other.name} taken out`;
  }
  if (piece.viaSwitch) {                                         // its own switch, which does the rest
    const flip = () => document.getElementById(piece.viaSwitch).click();
    flip();
    return toast(note, flip);
  }
  const before = (piece.fixed ? [[piece.on, at(piece.on)]]
    : Object.entries(at(piece.place)).map(([k, v]) => [`${piece.place}.${k}`, structuredClone(v)]))
    .concat(edits.filter(([path]) => !path.startsWith(`${piece.place}.`)).map(([path]) => [path, structuredClone(at(path))]));   // and anything else it changes
  change([[piece.on, piece.inValue ? piece.inValue(on) : on], ...edits], { look: true });
  toast(note, () => change(before, { look: true }));
}
// Whether the pointer's over the picker, to drop a piece on it
const overPicker = e => !picker.hidden && e.clientX <= picker.getBoundingClientRect().right;
const markDropOut = on => picker.classList.toggle('dropOut', on);

// ---------------------------------------------------------------------------
// The note at the bottom, with Undo, a few seconds
// ---------------------------------------------------------------------------
const TOAST_MS = 4000;             // chosen, as phones' own notes
let toastTimer = null;
function toast(text, undo = null) {
  toastBox.innerHTML = `<span>${text}</span>${undo ? '<button>Undo</button>' : ''}`;
  toastBox.hidden = false;
  toastBox.querySelector('button')?.addEventListener('click', () => { toastBox.hidden = true; undo(); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastBox.hidden = true; }, TOAST_MS);
}

// ---------------------------------------------------------------------------
// Putting the frame in step with the view and the settings
// ---------------------------------------------------------------------------
function showShell() {
  if (classic) return;
  const mode = modeNow(), room = viewKit.room;
  for (const chip of roomsRow.querySelectorAll('[data-room]')) chip.classList.toggle('on', chip.dataset.room === room);
  for (const b of modesBar.querySelectorAll('[data-view]')) b.setAttribute('aria-checked', String(b.dataset.view === mode));
  document.body.dataset.gameMode = mode ?? 'wall';
  if (room !== pickerRoom) fillPicker(room);
  picker.hidden = !ROOMS[room];
  for (const button of document.querySelectorAll('#picker .pick[data-key], #pickerFolder .pick')) {
    const piece = pieceOf(button);
    if (!piece) continue;
    button.classList.toggle('in', isIn(piece));
    // greyed while something else stands in its place: a tap swaps them
    const replaced = replacedNow(piece);
    button.classList.toggle('replaced', replaced);
    button.title = replaced ? `${piece.name}: ${replacerOf(piece).name} is in its place. Tap to swap` : piece.name;
  }
  // a folder's icon dotted while anything in it is in
  for (const button of picker.querySelectorAll('[data-folder]')) {
    button.classList.toggle('in', pickerPieces.some(p => p.folder?.key === button.dataset.folder && isIn(p)));
  }
  if (picker.hidden) closeFolder();
}
// After every change and every view, at the next frame, once however many
// asked: never inside the controls' own 'change', which the render loop
// sends, so nothing here can stop the room being drawn (as a piece no
// longer in the picker once did, 24 Oct 2026)
let shellWanted = false;
function showShellSoon() {
  if (shellWanted) return;
  shellWanted = true;
  requestAnimationFrame(() => { shellWanted = false; showShell(); });
}
controls.addEventListener('change', showShellSoon);
for (const type of ['pointerup', 'change', 'popstate']) window.addEventListener(type, showShellSoon);
showShellSoon();

export { modeNow, goTo, toast, setIn, overPicker, markDropOut, showShell, classic };
