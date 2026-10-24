// The page: the living room and the rest of the flat in 3D, its menus and
// controls, the views, the configurations and the address. What's drawn, from the
// settings, is the model's, flat_model.js (the fittings, the cupboard
// options, the dimensions, the cutting list, the things to store, and the
// configuration's schema); the walls, door frame and windows are floor.js's;
// the engine is in kit/. index.html loads it.
//
// How it works: `config` (the model's) holds every setting, as the
// configuration lays them out. The controls change it through
// change(edits), by the settings' paths (the model's set()), which puts
// every control in step
// (syncControls()) and calls show(). show() has the model build the option
// chosen and draw everything round it (rebuild()), shows it in the menus,
// then redrawAround() puts the rest of the page in step: the colours, the
// things to store's menu, the cutting list and the address. The address, the settings as a configuration
// (SCHEMA) and the view, is read at the start and written on every change,
// so a link brings the same settings back.
//
// Its pieces are in page/ (CODE_MAP.md lists them), imported below in the
// order they set the page up: the stage, the things to store's controls,
// the controls and the address, the colours, the pieces' controls, the
// built-in views, tips, the view, and the rooms' buttons and drawers. A
// piece takes the other pieces' names from here (the exports at the
// bottom), not from each other, so this file's imports alone set that
// order. What's left here is window.plans and starting the page.
import * as THREE from 'three';
import * as ViewKit from './kit/view_kit.js';
import * as ConfigurationKit from './kit/configuration_kit.js';
import * as Config from './kit/config_kit.js';
import {
  MM, createStage, RAL, popMenus, createDrawers, reloadButton, resetButton, SHEET_HEIGHT_KEY, shareButton, 
  screenshotButton, workOffline, flatViews, cutViews
} from './kit/floor_kit.js';
import { otherRoomControls, otherRoomPieces, BOOKCASE_SIZES, BED_SPOTS } from './other_room.js';
import { SIZE_LABEL, numberBoxes } from './kit/controls_kit.js';
import { drawerTabs, showTabOf } from './kit/tabs_kit.js';
import { wickerBenches, wickerBenchControls } from './wicker_bench.js';
import { shoeRack, shoeRackControls } from './shoe_rack.js';
import { stairWallsControls, shoeBoxRefusal } from './stair_walls.js';
import { shoeBoxesControls } from './shoe_boxes.js';
import { garage, garagePieces, garageControls, GARAGE, GARAGE_CORNER } from './garage.js';
import { cupboardControls, copyControls, idIn } from './cupboard_controls.js';
import { CASTOR_DESK } from './castor_desk.js';
import {
  world, ROOM_BOXES, rebuild, 
  drawStored, turnDoors, describe, settle, cupboardRows, startAgain, BACK_WALL_KEYS, CHAIR_TURN, CURRENT_ROOM, 
  CUT_EXCEPTIONS, CUT_KINDS, CUT_RULE, DRESSERS, DRESSER_SLIDERS, FINISHES, LARDERS, LARDER_SLIDERS, OPTIONS, 
  PACKINGS, SCHEMA, SHELF_WOODS, SOFAS, SOFA_SLIDERS, STORED, TV_H, TV_SIZES, TV_W, benchDrawn, carcassMat, 
  colourOf, configurationNow, cornerTooShallow, cupboard, cupboardPart, cupboardSettings, currentSofa, 
  cuttingList, deskChair, deskSpot, diagonal, dimensionFigures, dims, dresserMat, frontFrom, frontGap, handleMat, 
  islandGroup, islandMat, islandOnWall, islandTopMat, kitchenMat, larderHeight, larderOwnSize, oakMat, 
  onBackWall, benchStandIns, optionOf, namedPieces, pieceBoxes, pieces, placeStored, readConfiguration, 
  screenMat, shelfMat, setAll, get, optionsOnShow, shownCode, sizesInOrder, sofaHome, sofaOwnSize, spotOf, 
  ivarSpot, tableSpot, castorDeskSpot, config, storedGroup, storedMats, storedSize, drawn, tvMat, updateDims, 
  worktopMat, BEDROOM_CUPBOARD_RANGES, DOORS_SCHEMA, doorsNow, readDoors, setDoors, doorAngles, dresserSpan, 
  storedSpots, inLivingRoom, aboveHasTv, aboveHasShelves, NO_SOFA, speakerSpacingNow, cupboardTopForSpeakers, 
  daybedTvShown, bedroomDoorText, aboveNow, tvOn
} from './flat_model.js';
import { display } from './page/display.js';
import {
  ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT, wallMat, frameMat, ceilingMat, OTHER_ROOM, OTHER_ROOM_CORNER, 
  carpetMat, HALLWAY, ENTRANCE, floor, otherRoom, hallway, entrance, bathroom
} from './floor.js';
import { camera, controls, flatCamera, flatControls } from './page/stage.js';
import './page/stored_controls.js';
import { followHistory, show } from './page/controls.js';
import './page/colours.js';
import './page/piece_controls.js';
import './page/views.js';
import './page/tips.js';
import {
  drawSoon, flatFit, loading, readDisplay, startLoop, startingAddress, viewCut, viewKit, viewNow
} from './page/view.js';
import { syncControls } from './page/room_buttons.js';
import './page/game/shell.js';
import './page/game/plan_edit.js';
import './page/game/walk.js';

let addressRead = false;
// ---------------------------------------------------------------------------
// window.plans: the settings and what's made of them, for the tests and the
// browser console (REFACTOR_PLAN.md, steps 6a and 6b). Only load() changes
// the settings.
//   get()       the settings (the model's config), as JSON, with the view's doors' angles
//   export()    the settings as a configuration (SCHEMA, above)
//   load(json)  shows a configuration, keeping the view
//   view()      the view, as JSON
//   schema()    the configuration's entries, then the view's doors', bar
//               their functions
//   snapshot()  the configuration, each corner cupboard's cutting list, the
//               dimension figures on show, the description and each piece's
//               box, which the
//               tests save beside each address (tests/snapshots/)
//   showTabOf(id) shows the drawer's tab holding the element with that id,
//               for a test to reach a control in a tab not chosen
// ---------------------------------------------------------------------------
function settingsNow() {
  return { ...JSON.parse(JSON.stringify(config)), doors: doorAngles() };
}
// Show a configuration in place of the settings on show: everything it
// leaves out as the page starts. The view stays, bar following what moves
function loadConfiguration(configuration) {
  startAgain();
  readConfiguration(configuration);
  syncControls();
  show();
  viewKit.refresh();
  drawSoon();                                                   // not in answer to an event, so asked for
}

// The view as data (REFACTOR_PLAN.md item 3, agreed 21 Oct 2026): what the
// view's own work makes of the flat, which the model's snapshot can't say,
// as Node has no camera. The room and the view (its id, or null when moved
// by hand), whether it's 2D, the camera's place and aim in the living
// room's mm, what a 2D view frames (mm across and up), the cut and Cupboard
// only; and for each piece and each room's shell, how much of it the view
// shows: 'all', 'part' (some cut away) or 'none', null where it isn't
// built. Nothing that follows the screen's size, so it's the same on every
// device.
const ROOM_SHELLS = {
  // The living room's walls, floor and ceiling: the floor group's own meshes
  // (the other rooms are groups in it)
  livingRoom: () => floor.children.filter(o => o.isMesh),
  bedroom: () => [otherRoom], hallway: () => [hallway], downstairs: () => [entrance], garage: () => [garage], bathroom: () => [bathroom],
};
// A mesh is on show if it and every group it's in are
const meshShown = mesh => { for (let o = mesh; o; o = o.parent) if (!o.visible) return false; return true; };
function howMuchShown(objects) {
  const meshes = [];
  for (const object of objects) object?.traverse(o => { if (o.isMesh) meshes.push(o); });
  if (!meshes.length) return null;
  const shown = meshes.filter(meshShown).length;
  return shown === meshes.length ? 'all' : shown ? 'part' : 'none';
}
const roomMm = v => [v.x, v.z, v.y].map(n => Math.round(n / MM) || 0);   // scene metres to the room's mm (|| 0: no -0)
function viewSnapshot() {
  const [cam, ctl] = display.flat ? [flatCamera, flatControls] : [camera, controls];
  return {
    room: viewKit.room,
    view: viewKit.viewId || null,
    flat: display.flat,
    camera: { at: roomMm(cam.position), aim: roomMm(ctl.target) },
    frames: display.flat ? flatFit.map(m => Math.round(m / MM)) : null,
    cut: viewCut(),
    cupboardOnly: display.cupboardOnly,
    shown: {
      ...Object.fromEntries(Object.entries(ROOM_SHELLS).map(([room, objects]) => [`shell.${room}`, howMuchShown(objects())])),
      ...Object.fromEntries(Object.entries(namedPieces()).map(([name, object]) => [name, howMuchShown([object])])),
    },
  };
}

window.plans = {
  viewSnapshot,
  get: settingsNow,
  export: configurationNow,
  load: loadConfiguration,
  view: viewNow,
  showTabOf: elementId => showTabOf(document.getElementById(elementId)),
  schema: () => [...SCHEMA, ...DOORS_SCHEMA].map(({ read, write, isColour, also, ...entry }) => structuredClone(entry)),
  snapshot: () => ({
    configuration: configurationNow(),
    cupboards: cupboardRows(),
    dimensions: dimensionFigures(),
    description: document.getElementById('summary').textContent,
    boxes: pieceBoxes(),
  }),
};

// Start on the configuration and the view in the address (room_dimensions.md
// has their format), unpacked first. Anything the configuration leaves out,
// and everything with no address, starts as the model's config does: the
// rooms as they are (the living room's LOUNGE_NOW).
const [configurationText, viewText] = startingAddress.split('~');
const [startingConfiguration, startingView] = await Promise.all([Config.unpack(configurationText), Config.unpack(viewText)]);
if (startingConfiguration) readConfiguration(startingConfiguration);
addressRead = true;
followHistory(loadConfiguration);
syncControls();
show();
// A number box for each millimetre slider, now each shows its value: not
// the angles (in °: turns, doors, the shoe rack's slope), the TV (a list of
// sizes) or the shelves' counts
numberBoxes(document, (slider, value) => !value.endsWith('°') && slider.id !== 'tvSize' && !slider.id.endsWith('_count'));
// The view: the address's, else the last chosen here. After show(), as
// some views are worked out from the option; the switches for what's shown
// first, as Cupboard only frames the view
readDisplay(startingView);
viewKit.start(startingView);
startLoop(() => { loading.hidden = true; });


// What the pieces export for the page and the tests
// What the pieces use from here
export {
  addressRead
};
export {
  camera, controls, flatCamera, flatControls, renderer, scene
} from './page/stage.js';
export {
  DESK_RADIOS, DOOR_SLIDERS, about, bedroomCupboardControls, change, deskRadios, loungeCupboard, turnDoorsTo, 
  update, writeAddress
} from './page/controls.js';
export {
  FAMILIES, POPULAR, paintAll, refreshColours, showShelfWood, updatePalette
} from './page/colours.js';
export {
  applyCut, configurationKit, draw, drawSoon, resize, viewKit, viewNow
} from './page/view.js';
export {
  showCuttingLists, showStored, showStoredMenu, storedDrag, storedUnder
} from './page/stored_controls.js';
export {
  backWallSwitches, benchSwitch, billyLying, deskDaybedChair, deskDaybedRight, firstRadiatorSwitch, tvOnSwitch, 
  setCupboardOnly, setSeeThrough, showBookshelfSizes, showCastorDesk, showDresser, showIvar, showLarder, 
  showPlace, showSofa, showSofaPlace, showSpeakers, showTables, xray
} from './page/piece_controls.js';
export {
  drawers, fillRoomKinds, showRoomOptions, syncControls
} from './page/room_buttons.js';
export {
  builtInViews, packingSpot, packingView
} from './page/views.js';
export {
  anchors
} from './page/tips.js';
