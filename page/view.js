// The view (a piece of living_room.js): the 2D views' cameras and fit, the
// view kit (kit/view_kit.js) with the room's places and things, the
// Configuration list, the loading cover and the dimension buttons.
import * as THREE from 'three';
import * as ViewKit from '../kit/view_kit.js';
import * as ConfigurationKit from '../kit/configuration_kit.js';
import * as Config from '../kit/config_kit.js';
import { popMenus, flatViews, cutViews } from '../kit/floor_kit.js';
import { GARAGE_CORNER } from '../garage.js';
import {
  CHAIR_TURN, configurationNow, 
  cupboard, cupboardPart, deskChair, dims, updateDims, doorsNow, readDoors
} from '../flat_model.js';
import { display, setDisplay } from './display.js';
import { OTHER_ROOM_CORNER } from '../floor.js';
import {
  DESK_RADIOS, DOOR_SLIDERS, anchors, builtInViews, camera, change, controls, deskRadios, drawers, fillRoomKinds, 
  flatCamera, flatControls, packingView, renderer, scene, setCupboardOnly, setSeeThrough, showRoomOptions, 
  showStored, turnDoorsTo, update, writeAddress, xray
} from '../living_room.js';


// In the wall views, anything wholly on the camera's side of the view's cut
// is left out, so the wall and what stands against it aren't hidden behind
// the island, the desk or the outside of the outer wall: the kit's, with
// the view's cut, and with the cupboard on its own, only its parts.
// The view's cut, [axis, where in mm, the camera's side], or null
const viewCut = () => (display.flat && display.flatView && !display.cupboardOnly ? (builtInViews[display.flatView].rooms?.[display.flatRoom] ?? builtInViews[display.flatView]).cut : null);   // on its own, the cupboard needs no cut
const applyCut = cutViews(scene, {
  get cut() { return viewCut(); },
  get only() { return display.cupboardOnly ? cupboardPart : null; },
});

// In a 2D view, the cupboard on its own fills the screen, with room for its
// dimensions round it
function frameCupboard() {
  if (!display.flat || !display.cupboardOnly || !cupboard) return;
  scene.updateMatrixWorld(true);
  const b = new THREE.Box3();
  cupboard.group.traverse(o => { if (o.isMesh && cupboardPart(o, false)) b.expandByObject(o); });
  if (b.isEmpty()) return;
  const c = b.getCenter(new THREE.Vector3()), size = b.getSize(new THREE.Vector3()), margin = 1.6;
  const t = flatControls.target, shift = new THREE.Vector3();
  if (display.flatView === 'plan') {
    shift.set(c.x - t.x, 0, c.z - t.z);
    flatFit = [size.x + margin, size.z + margin];
  } else if (display.flatView === 'back' || display.flatView === 'front') {
    shift.set(c.x - t.x, c.y - t.y, 0);
    flatFit = [size.x + margin, size.y + margin];
  } else {
    shift.set(0, c.y - t.y, c.z - t.z);
    flatFit = [size.z + margin, size.y + margin];
  }
  t.add(shift);
  flatCamera.position.add(shift);
  flatCamera.zoom = 1;
  resize();
  flatControls.update();
}

// ---------------------------------------------------------------------------
// The address: the configuration (below, with SCHEMA), then "~" and the
// view, each packed (kit/config_kit.js), so a link shows just what was on
// screen. room_dimensions.md has the format.
// ---------------------------------------------------------------------------
// replace: change the address without adding to the history, as when
// looking round. Packing is asynchronous, so each write is numbered, and
// one overtaken by a later write is dropped
let configurationKit = null;       // the Configuration list (see below), shown the configuration on screen as it changes
let flatFit = builtInViews.plan.fit;
let flatPerM = null;               // the 2D views' scale, pixels per metre at zoom 1
// The 2D/3D switch, fitting the views to the screen, and the render loop:
// kit/floor_kit.js's, reading the views' framing from here
const { setFlat, resize, startLoop, draw, drawSoon } = flatViews({ scene, renderer, camera, controls, flatCamera, flatControls }, {
  get flat() { return display.flat; },
  set flat(on) { setDisplay({ flat: on }); },
  get flatFit() { return flatFit; },
  get flatPerM() { return flatPerM; },
  set flatPerM(perM) { flatPerM = perM; },
  get hfov() { return viewKit.hfov; },
  get drawers() { return drawers; },
});

const startingAddress = location.hash.slice(1);                 // read before anything rewrites it
const viewKit = ViewKit.create({
  THREE, camera, controls, canvas: renderer.domElement,
  room: 'room_3d',
  config: ROOM_VIEWS,
  builtIn: builtInViews,
  origins: { bedroom: [OTHER_ROOM_CORNER.x, OTHER_ROOM_CORNER.y], garage: [GARAGE_CORNER.x, GARAGE_CORNER.y] },   // their places and things are in their own mm
  anchors,
  computed: { packing: packingView },
  actions: {
    shutRoomDoor() {
      turnDoorsTo({ room: 0 });
    },
    openDesk() {                                                // sitting at the fold-down desk, it's open
      turnDoorsTo({ desk: 'down' });
    },
  },
  chair: { object: deskChair, rest: CHAIR_TURN, eyes: 150 },
  el: {
    where: document.getElementById('where'), lookAt: document.getElementById('lookAt'), eye: document.getElementById('eye'),
    save: document.getElementById('saveView'), remove: document.getElementById('deleteView'),   // the views are listed in the room buttons' ▾ (fillRoomKinds())
    looks: document.getElementById('lookPick'), saveLook: document.getElementById('saveLook'), removeLook: document.getElementById('deleteLook'),
  },
  hooks: {
    place(v, id, room) {
      showRoomOptions(room);
      setFlat(Boolean(v.fit));
      const [cam, ctl] = display.flat ? [flatCamera, flatControls] : [camera, controls];
      cam.position.set(...v.position);
      ctl.target.set(...v.target);
      setDisplay({ flatView: display.flat ? id : null, flatRoom: room });   // the hallway's hidden in the wall views (setDisplay())
      updateDims(display);
      applyCut();
      showStored();
      if (display.flat) {
        flatFit = v.fit;
        flatCamera.zoom = 1;
      }
      resize();                                                 // applies the view's fit or field of view
      ctl.update();
      frameCupboard();                                          // on its own, framed to fill the screen
    },
    isFlat: () => display.flat,
    viewsChanged: () => fillRoomKinds(),
    resize: () => resize(),
    writeAddress: () => writeAddress(true),
  },
});
// The doors' angles into the address a moment after they stop, as the view's
Object.values(DOOR_SLIDERS).forEach(d => d.addEventListener('input', viewKit.writeView));
for (const radio of Object.keys(DESK_RADIOS).flatMap(deskRadios)) radio.addEventListener('change', viewKit.writeView);
// The screen greyed while the page loads (index.html's #loading): shown as
// it starts, and hidden once the room's first drawn (startLoop(), at the
// end); shown again as a configuration's chosen, which loads the page
// again, its name kept for the new page to show
const loading = document.getElementById('loading');
function showLoading(name) {
  try { if (name) sessionStorage.setItem('loadingName', name); } catch (e) { /* not important */ }
  loading.querySelector('span').textContent = name ? `Loading ${name}…` : 'Loading…';
  loading.hidden = false;
}
// Configurations: every setting in every room bar the view, from
// living_room.configurations.js or saved here. Showing one loads the page
// again with its settings, keeping the view.
// The pop-up menus: the views list and look at the top right, the
// configurations at the bottom right
popMenus(renderer.domElement);
configurationKit = ConfigurationKit.create({
  room: 'room_3d',
  config: window.ROOM_CONFIGURATIONS,
  el: { pick: document.getElementById('configurationPick'), save: document.getElementById('saveConfiguration'), remove: document.getElementById('deleteConfiguration') },
  get: () => configurationNow(),
  async apply(configuration) {
    showLoading(document.getElementById('configurationPick').selectedOptions[0]?.textContent);
    history.replaceState(null, '', `#${await Config.pack(configuration)}~${await Config.pack(viewNow())}`);
    location.reload();
  },
});

// The 2D views' Dimensions and Door sizes buttons
const dimsButton = document.getElementById('dims'), doorDimsButton = document.getElementById('doorDims');
function setDims(on) {
  setDisplay({ showDims: on });
  dimsButton.textContent = `Dimensions: ${display.showDims ? 'on' : 'off'}`;
  updateDims(display);
}
function setDoorDims(on) {
  setDisplay({ showDoorDims: on });
  doorDimsButton.textContent = `Door sizes: ${display.showDoorDims ? 'on' : 'off'}`;
  updateDims(display);
}
dimsButton.addEventListener('click', () => {
  setDims(!display.showDims);
  viewKit.writeView();
});
doorDimsButton.addEventListener('click', () => {
  setDoorDims(!display.showDoorDims);
  viewKit.writeView();
});

// The view, as JSON: the view kit's (the room, the view or the camera, the
// eye height), then the switches for what's shown and the doors, so a link
// shows them too. Reading one sets the switches and doors it has, then the
// view
const VIEW_VERSION = 1;            // up only when a field changes its meaning
const viewNow = () => ({ version: VIEW_VERSION, ...viewKit.view(),
  dimensions: display.showDims, doorSizes: display.showDoorDims, cupboardOnly: display.cupboardOnly, seeThrough: xray, doors: doorsNow() });
function readDisplay(view) {
  const given = key => typeof view?.[key] === 'boolean';
  if (given('dimensions')) setDims(view.dimensions);
  if (given('doorSizes')) setDoorDims(view.doorSizes);
  if (given('cupboardOnly')) setCupboardOnly(view.cupboardOnly);
  if (given('seeThrough')) setSeeThrough(view.seeThrough);
  if (view?.doors && typeof view.doors === 'object') {
    readDoors(view.doors);
    update();
  }
}

// What the other pieces of the model use
export {
  applyCut, configurationKit, draw, drawSoon, flatFit, loading, readDisplay, resize, startLoop, startingAddress, 
  viewCut, viewKit, viewNow
};
