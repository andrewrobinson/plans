// The game UI's frame (a piece of living_room.js): the room chips along
// the top, the view switch at the bottom (Plan, Overhead, Walk), the
// furniture picker down the left, the ☰ menu holding what the top bar
// had on a phone, and the note at the bottom with Undo. Agreed with the
// user, 23 Oct 2026 (the mobile-first branch). On a phone it stands in for
// the top bar; on the desktop it sits beside it. `?classic` in the address
// leaves it out, the page as it was (the tests of the old controls use it).
import { display } from '../display.js';
import { viewKit, change, camera, controls, drawSoon } from '../../living_room.js';
import { ROOMS, at, isIn } from './furniture.js';
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
  ['package', 'Things to store: on or off', () => document.getElementById('storedToggle').click()],
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
function fillPicker(room) {
  pickerRoom = room;
  picker.innerHTML = (ROOMS[room]?.picker ?? []).map(({ key, name, short = name, icon: i }) =>
    `<button class="pick" data-key="${key}" aria-label="${name}" title="${name}">${icon(i)}<span>${short}</span></button>`).join('');
}
const pieceOf = button => ROOMS[pickerRoom].picker.find(p => p.key === button.dataset.key);
// A tap and a drag told apart by how far the pointer goes
const DRAG_START_PX = 8;           // chosen: a finger's wobble on a tap stays under it
picker.addEventListener('pointerdown', e => {
  const button = e.target.closest('.pick');
  if (!button || e.button > 0) return;
  const piece = pieceOf(button), x = e.clientX, y = e.clientY;
  const move = m => {
    if (Math.hypot(m.clientX - x, m.clientY - y) < DRAG_START_PX) return;
    stop();
    if (isIn(piece) || piece.fixed) return;                     // one in is moved in the room itself; the bench has no place to drop
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
});
// In or out, from the picker
function togglePiece(piece) {
  const on = !isIn(piece);
  setIn(piece, on, `${piece.name} ${on ? 'put in' : 'taken out'}`);
}
// A piece put in or taken out, with a note to undo it: Undo puts back
// every setting of its place in the room as it was
function setIn(piece, on, note, edits = []) {
  const before = Object.entries(at(piece.place)).map(([k, v]) => [`${piece.place}.${k}`, structuredClone(v)]);
  change([[piece.on, on], ...edits], { look: true });
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
  for (const button of picker.querySelectorAll('.pick')) button.classList.toggle('in', isIn(pieceOf(button)));
}
// After every change and every view: cheap, so on each frame something's drawn
controls.addEventListener('change', showShell);
window.addEventListener('pointerup', () => requestAnimationFrame(showShell));
window.addEventListener('change', () => requestAnimationFrame(showShell));
window.addEventListener('popstate', () => requestAnimationFrame(showShell));
requestAnimationFrame(showShell);

export { modeNow, goTo, toast, setIn, overPicker, markDropOut, showShell, classic };
