// The rooms' buttons and the settings drawers (a piece of living_room.js),
// and keeping each drawer's controls in step with the settings.
import {
  createDrawers, reloadButton, resetButton, SHEET_HEIGHT_KEY, shareButton, screenshotButton, workOffline
} from '../kit/floor_kit.js';
import { otherRoomControls } from '../other_room.js';
import { drawerTabs } from '../kit/tabs_kit.js';
import { wickerBenchControls } from '../wicker_bench.js';
import { shoeRackControls } from '../shoe_rack.js';
import { stairWallsControls, shoeBoxRefusal } from '../stair_walls.js';
import { shoeBoxesControls } from '../shoe_boxes.js';
import { garage, garageControls } from '../garage.js';
import {
  cupboardOnly, settle, BACK_WALL_KEYS, TV_H, TV_SIZES, TV_W, benchDrawn, benchStandIns, optionOf, config, 
  inLivingRoom, bedroomDoorText
} from '../flat_model.js';
import { hallway } from '../floor.js';
import {
  backWallSwitches, bedroomCupboardControls, benchSwitch, billyLying, builtInViews, change, controls, 
  deskDaybedChair, deskDaybedRight, deskDaybedTv, draw, firstRadiatorSwitch, loungeCupboard, refreshColours, 
  renderer, resize, setCupboardOnly, showBookshelfSizes, showDresser, showLarder, showShelfWood, showSofa, 
  turnDoorsTo, viewKit
} from '../living_room.js';

// ---------------------------------------------------------------------------
// The rooms' buttons and the settings drawers. In the top bar, a split
// button for each room: its name goes to it, seen as its dropdown says
// (Bird's eye to start, or the plan), remembered for each on this device.
// At the bottom left, the options for the room in view: its drawer.
// Downstairs has no button of its own; its options are the hallway's.
// ---------------------------------------------------------------------------
const ROOM_BUTTONS = {
  livingRoom: { name: 'Lounge', drawer: 'loungePanel', options: 'Lounge options' },
  bedroom: { name: 'Bedroom', drawer: 'bedPanel', options: 'Bedroom options' },
  garage: { name: 'Garage', drawer: 'garagePanel', options: 'Garage options' },
  hallway: { name: 'Hallway', drawer: 'hallPanel', options: 'Hallway and stairs' },
};
const optionsOf = room => ROOM_BUTTONS[room] ?? ROOM_BUTTONS.hallway;     // downstairs: the hallway's
// What each room's button offers in its ▾ (the Views menu went, 21 Oct
// 2026, as notes/VIEWS_MENU.md says): the views that frame any room (Bird's eye,
// Plan), the room's four walls in 2D (each named as the room's own wall),
// the room's config-defined views (living_room.views.js) and the views saved
// in it on this device. The hallway's carries downstairs too, which has no
// button. A choice's value is the view's id, or "downstairs/<id>" for
// downstairs' under the hallway's
const WHOLE_ROOM_VIEWS = [['birdseye', "Bird's eye"], ['plan', 'Plan (2D)']];
const WALL_NAMES = {
  livingRoom: { back: 'Back wall, the TV', left: 'Left wall, the door', front: 'Front wall, the kitchen', right: 'Right wall, the windows' },
  bedroom: { back: 'Hallway wall', front: 'Chimney breast', left: 'Window wall', right: 'Kitchen-side wall' },
  hallway: { back: "Stairs' outside wall", front: 'Bedroom side', right: 'Lounge door wall', left: 'WC wall' },
  garage: { left: 'Back wall', right: 'Door', back: 'Right-hand wall, going in', front: 'Left-hand wall, going in' },
};
const BUTTON_ALSO = { hallway: ['downstairs'] };                   // rooms with no button of their own, under this one's
const ROOMS_OWN_BUILT_IN = { stairsSide: 'hallway' };             // built-in views of one room alone, by id: theirs
const configViewsIn = room => Object.entries(ROOM_VIEWS.views).filter(([, v]) => (v.room ?? 'livingRoom') === room);
const savedViewsIn = room => viewKit.savedViews.filter(v => (v.room ?? 'livingRoom') === room);
// Its choices, in groups: [heading, [[value, label], …]]
function roomViewChoices(room) {
  const ownRoom = r => (prefixed => [
    [prefixed('Whole room'), WHOLE_ROOM_VIEWS.map(([id, label]) => [id, label])],
    ...(WALL_NAMES[r] ? [[prefixed('Walls'), Object.entries(WALL_NAMES[r]).map(([id, label]) => [id, `${label} (2D)`])]] : []),
    [prefixed('Views'), [...Object.entries(ROOMS_OWN_BUILT_IN).filter(([, at]) => at === r).map(([id]) => [id, builtInViews[id].label]),
      ...configViewsIn(r).map(([id, v]) => [id, v.label])]],
    [prefixed('Saved on this device'), savedViewsIn(r).map(v => [`saved:${v.name}`, v.name])],
  ])(heading => (r === room ? heading : `${ROOM_VIEWS.rooms[r].label}: ${heading.toLowerCase()}`));
  const groups = [...ownRoom(room), ...(BUTTON_ALSO[room] ?? []).flatMap(other =>
    ownRoom(other).map(([heading, choices]) => [heading, choices.map(([id, label]) => [`${other}/${id}`, label])]))];
  return groups.filter(([, choices]) => choices.length);
}
// A choice's room and view: "downstairs/plan" is downstairs' plan, else the button's room's
function choiceOf(room, value) {
  const at = value.indexOf('/');
  return at < 0 ? { room, id: value } : { room: value.slice(0, at), id: value.slice(at + 1) };
}
const viewKindKey = room => `room_3d:viewKind:${room}`;
// The room's choice, as last made on this device, if it's still offered (a saved view may have gone)
function viewKindOf(room) {
  let kind = null;
  try { kind = localStorage.getItem(viewKindKey(room)); } catch (e) { /* not important */ }
  const offered = roomViewChoices(room).flatMap(([, choices]) => choices.map(([value]) => value));
  return offered.includes(kind) ? kind : WHOLE_ROOM_VIEWS[0][0];
}
// To room, as its button's dropdown says: the drawers shut, and the whole
// room shown (not Cupboard only)
function goToRoom(room) {
  drawers.setMenu(null);
  if (cupboardOnly) setCupboardOnly(false);
  const { room: to, id } = choiceOf(room, viewKindOf(room));
  viewKit.showRoom(to, id);
}
// Each button's ▾ filled with its choices, the one last made chosen: again
// whenever a view's saved or deleted
const roomKinds = {};
function fillRoomKinds() {
  for (const [room, kind] of Object.entries(roomKinds)) {
    kind.replaceChildren(...roomViewChoices(room).map(([heading, choices]) => {
      const group = Object.assign(document.createElement('optgroup'), { label: heading });
      group.append(...choices.map(([value, label]) => Object.assign(document.createElement('option'), { value, textContent: label })));
      return group;
    }));
    kind.value = viewKindOf(room);
  }
}
for (const [room, { name }] of Object.entries(ROOM_BUTTONS)) {
  const id = `${name.toLowerCase()}View`;                           // loungeView, bedroomView and so on
  const split = Object.assign(document.createElement('div'), { className: 'split' });
  const go = Object.assign(document.createElement('button'), { id, className: 'chip', textContent: name, title: `Go to the ${name.toLowerCase()}` });   // the room's name alone, short for the phone's top bar (asked for, 19 Oct 2026)
  const kind = roomKinds[room] = Object.assign(document.createElement('select'), { id: `${id}Kind`, className: 'pick' });
  kind.setAttribute('aria-label', `${name}: how to see it`);
  go.addEventListener('click', () => goToRoom(room));
  kind.addEventListener('change', () => {
    try { localStorage.setItem(viewKindKey(room), kind.value); } catch (e) { /* not important */ }
    goToRoom(room);
  });
  const kindBox = Object.assign(document.createElement('span'), { className: 'kind' });   // shows ▾ over it
  kindBox.append(kind);
  split.append(go, kindBox);
  document.getElementById('roomViews').append(split);
}
fillRoomKinds();

// The settings drawers, one open at a time, all closed to start on every
// screen: Other options (the wicker bench, the colours in this view),
// opened by ☰, and each room's, the hallway and stairs' too, by the options
// button at the bottom left.
// Each: [its button, or null for the options button's, the class on
// <body> while it's open]. The 2D views move clear of the drawer as it
// opens and closes.
const DRAWERS = { panel: ['menu', 'menu-open'], loungePanel: [null, 'lounge-open'], bedPanel: [null, 'bed-open'],
  garagePanel: [null, 'garage-open'], hallPanel: [null, 'hall-open'] };
const roomOptions = document.getElementById('roomOptions');
const drawers = createDrawers(DRAWERS, () => {
  resize(true);
  roomOptions.setAttribute('aria-expanded', String(drawers.openDrawer() === optionsOf(viewKit.room).drawer));
});
roomOptions.addEventListener('click', () => {
  const { drawer } = optionsOf(viewKit.room);
  drawers.setMenu(drawers.openDrawer() === drawer ? null : drawer);
});
// The options button names the room in view's (from hooks.place())
function showRoomOptions(room) {
  const { drawer, options } = optionsOf(room);
  roomOptions.textContent = options;
  roomOptions.setAttribute('aria-controls', drawer);
}
drawers.setMenu(null);

// Reload forgets what's remembered on this device (asked for, 18 Oct 2026):
// the view (where the camera was, each room's Bird's eye or Plan), which
// sections are open, the Description and Colours in this view, and the
// sheet's height; not the saved views, looks and configurations
reloadButton(document.getElementById('reload'), () => ['room_3d:startView', ...Object.keys(ROOM_BUTTONS).map(viewKindKey),
  ...DRAWER_SECTIONS.map(sectionKey), 'aboutOpen', 'paletteOpen', SHEET_HEIGHT_KEY]);
resetButton(document.getElementById('reset'));
// Share: the link is always to the published page, so it works for others
// even when this copy is on a local server
shareButton(document.getElementById('share'), 'https://andrewrobinson.github.io/plans/index.html', () => optionOf(config.pieces.cornerCupboard.design.option).name);
screenshotButton(document.getElementById('screenshot'), renderer.domElement, draw, () => optionOf(config.pieces.cornerCupboard.design.option).name);
resize();

workOffline('sw.js');

// Every control in step with the settings: the sliders, radio buttons,
// switches and dropdowns, the reverse of their listeners above, which all go
// through change(). The colours, the shelves' wood, the dresser's place and
// the island go on the model too. The option's own controls, and the things
// to store's, are show()'s.
// The rooms' modules' controls name each setting by its path in the
// configuration; the stair walls' and the shoe boxes' name theirs within
// the hallway's, as 'wcWall.shelves.on'
const inHallway = edits => edits.map(([path, value]) => [`hallway.${path}`, value]);
// The bedroom's sliders (other_room.js)
const syncOtherRoom = otherRoomControls(document.getElementById('otherRoomTop'), document.getElementById('otherRoomBlock'), edits => change(edits));
// The wicker bench's (wicker_bench.js), in pieces.wickerBench
const syncWickerBench = wickerBenchControls(document.getElementById('wickerBenchBlock'), edits => change(edits, { look: true }));
// The shoe rack's (shoe_rack.js), in pieces.shoeRack
const syncShoeRack = shoeRackControls(document.getElementById('shoeRackBlock'), edits => change(edits, { look: true }));
// The shelves and pictures over the stairs (stair_walls.js), in
// config.hallway, as 'wcWall.shelves.count'
const syncStairWalls = stairWallsControls(document.getElementById('stairWallsBlock'), edits => change(inHallway(edits)));
// The shoe boxes on the sills (shoe_boxes.js), in config.hallway too,
// as 'shoeBoxes.left.length', kept clear of the walls' shelves and pictures
const syncShoeBoxes = shoeBoxesControls(document.getElementById('shoeBoxesBlock'), edits => change(inHallway(edits)), shoeBoxRefusal);
// The bathroom and WC shown or hidden (Hallway and stairs options), as
// they stand in the way of seeing the hallway and stairs
const bathroomShown = document.getElementById('bathroomShown');
bathroomShown.addEventListener('change', () => change([['hallway.bathroomShown', bathroomShown.checked]]));
// The bedroom door (Bedroom options' Doors): which way it swings going in;
// swinging left, how far it must open, which the new cupboard keeps clear
// of; its swing shown on the floor; and what that means for the cupboard
const bedroomDoorSwings = () => [...document.getElementsByName('bedroomDoorSwings')];
const bedroomDoorMustOpenTo = document.getElementById('bedroomDoorMustOpenTo');
const bedroomDoorSwingShown = document.getElementById('bedroomDoorSwingShown');
for (const radio of bedroomDoorSwings()) radio.addEventListener('change', () => change([['bedroom.door.swings', radio.value]]));
bedroomDoorMustOpenTo.addEventListener('input', () => change([['bedroom.door.mustOpenTo', Number(bedroomDoorMustOpenTo.value)]]));
bedroomDoorSwingShown.addEventListener('change', () => change([['bedroom.door.swingShown', bedroomDoorSwingShown.checked]]));
function syncBedroomDoor() {
  const { swings, mustOpenTo, swingShown } = config.bedroom.door;
  for (const radio of bedroomDoorSwings()) radio.checked = radio.value === swings;
  document.getElementById('bedroomDoorMustBlock').hidden = swings !== 'left';
  bedroomDoorMustOpenTo.value = String(mustOpenTo);
  document.getElementById('bedroomDoorMustOpenToValue').textContent = `${mustOpenTo}°`;
  bedroomDoorSwingShown.checked = swingShown;
  document.getElementById('bedroomDoorText').textContent = bedroomDoorText();
}
// The garage's (garage.js), each piece's place in.garage
const syncGarage = garageControls(document.getElementById('garageBlock'), edits => change(edits, { look: true }), word => {
  turnDoorsTo({ garage: word });
  viewKit.writeView();                                          // the view's, as the door sliders'
});
// The long drawers' tabs (notes/MENU_TABS.md): Lounge, Hallway and stairs, and
// Garage options, the garage's built by garage.js, so after it
drawerTabs();
// The drawers' sections open or closed as they were left here, those the
// rooms' modules build too (Bedroom options' Bed, Extras and Recess
// cupboards), so after them
const DRAWER_SECTIONS = [...document.querySelectorAll('.drawer details.sec[id^=sec]')];
const sectionKey = sec => `room_3d:${sec.id}`;
for (const sec of DRAWER_SECTIONS) {
  try { const was = localStorage.getItem(sectionKey(sec)); if (was) sec.open = was === '1'; } catch (e) { /* not important */ }
  sec.addEventListener('toggle', () => {
    try { localStorage.setItem(sectionKey(sec), sec.open ? '1' : '0'); } catch (e) { /* not important */ }
  });
}

function syncControls() {
  settle();                                                     // the TV's size and the colours, worked out
  const BENCH = config.pieces.bench.design.height, { what: above, shelfDepth, tv } = config.pieces.aboveBench.design;
  const { frontWall: frontPiece } = config.livingRoom, island = config.pieces.island.in.livingRoom;
  const slide = (id, value, text = value) => {
    document.getElementById(id).value = String(value);
    document.getElementById(`${id}Value`).textContent = text;
  };
  const check = (name, value) => { document.querySelector(`input[name=${name}][value="${value}"]`).checked = true; };
  loungeCupboard.sync();
  bedroomCupboardControls.sync();
  benchSwitch.checked = benchDrawn();
  firstRadiatorSwitch.checked = config.livingRoom.firstRadiator;
  benchSwitch.disabled = benchStandIns().length > 0;
  for (const key of BACK_WALL_KEYS) backWallSwitches[key].checked = inLivingRoom(key).on;
  billyLying.checked = config.pieces.billy.in.livingRoom.lying;
  deskDaybedRight.checked = config.pieces.deskDaybed.design.deskAt === 'right';
  deskDaybedTv.checked = config.pieces.deskDaybed.in.livingRoom.tvAbove;
  for (const radio of deskDaybedChair) radio.checked = radio.value === config.pieces.deskDaybed.in.livingRoom.chair;
  showBookshelfSizes();
  check('bench', BENCH);
  check('above', above);
  slide('shelfDepth', shelfDepth);
  slide('tvSize', TV_SIZES.findIndex(([inches]) => inches === tv), `${tv}" (${TV_W} × ${TV_H})`);
  refreshColours();
  showShelfWood();
  check('frontPiece', frontPiece);
  showDresser();
  showLarder();
  showSofa();
  check('islandAt', island.at);
  syncOtherRoom(config);
  syncWickerBench(config);
  syncShoeRack(config);
  syncStairWalls(config.hallway);
  syncShoeBoxes(config.hallway);
  bathroomShown.checked = config.hallway.bathroomShown;
  syncBedroomDoor();
  syncGarage(config);
}

// What the other pieces of the model use
export {
  drawers, fillRoomKinds, showRoomOptions, syncControls
};
