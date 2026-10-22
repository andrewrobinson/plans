// Starts the page: draws the room and the box, and connects the two menus.
//
//   room.js        the room's sizes and how to draw it (a copy from ../room_3d.html)
//   box.js         the box's settings, and how to draw it
//   view.js        the 3D view: scene, lights and camera
//   sliders.js     the box menu's sliders
//   debug_text.js  the debug menu's text

import { buildTheRoom } from './room.js';
import { STARTING_BOX, keptInsideTheRoom, createDrawnBox } from './box.js';
import { createView } from './view.js';
import { createSliders } from './sliders.js';
import { debugText } from './debug_text.js';

// ---------------------------------------------------------------------------
// The view, the room and the box
// ---------------------------------------------------------------------------

const view = createView(document.getElementById('view'));
view.scene.add(buildTheRoom());

// The box's current settings. Every change makes a new settings object and
// passes it to showTheBox, which is the only place they're applied.
let box = STARTING_BOX;
const drawnBox = createDrawnBox(view.scene);

function showTheBox(newSettings) {
  box = keptInsideTheRoom(newSettings);
  drawnBox.redraw(box);
  sliders.showSettings(box);
  refreshDebugText();
}

// ---------------------------------------------------------------------------
// The box menu: a panel that slides in from the left, holding the sliders
// ---------------------------------------------------------------------------

const sliders = createSliders({
  sizeContainer: document.getElementById('size-sliders'),
  positionContainer: document.getElementById('position-sliders'),
  box,
  onChange: (setting, value) => showTheBox({ ...box, [setting]: value }),
});

document.getElementById('reset-box').addEventListener('click', () => showTheBox(STARTING_BOX));

// ---------------------------------------------------------------------------
// The debug menu: a panel on the right with the debug text
// ---------------------------------------------------------------------------

const debugOutput = document.getElementById('debug-text');

function refreshDebugText() {
  if (!debugMenu.isOpen()) return;                                   // no need while it's hidden
  const text = debugText(box, view);
  if (debugOutput.textContent !== text) debugOutput.textContent = text;
}

// The camera moves while it's dragged, so the debug text keeps up every frame
view.afterEachFrame.push(refreshDebugText);

// ---------------------------------------------------------------------------
// Opening and closing the menus. Each has a button in the top bar that opens
// and closes it, and a × to close it. Open, a panel has the class "open",
// which the stylesheet uses to slide it into view.
// ---------------------------------------------------------------------------

function connectMenu({ panelId, openButtonId, closeButtonId }) {
  const panel = document.getElementById(panelId);
  const openButton = document.getElementById(openButtonId);
  const closeButton = document.getElementById(closeButtonId);

  const isOpen = () => panel.classList.contains('open');
  function setOpen(open) {
    panel.classList.toggle('open', open);
    panel.inert = !open;                                             // a closed panel can't be tabbed into
    openButton.setAttribute('aria-expanded', String(open));
  }

  openButton.addEventListener('click', () => {
    setOpen(!isOpen());
    refreshDebugText();
  });
  closeButton.addEventListener('click', () => setOpen(false));
  setOpen(false);
  return { isOpen, setOpen };
}

const boxMenu = connectMenu({ panelId: 'box-menu', openButtonId: 'open-box-menu', closeButtonId: 'close-box-menu' });
const debugMenu = connectMenu({ panelId: 'debug-menu', openButtonId: 'open-debug-menu', closeButtonId: 'close-debug-menu' });

// Escape closes whichever menus are open
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  boxMenu.setOpen(false);
  debugMenu.setOpen(false);
});

// On a wide screen the box menu starts open, so the sliders are the first
// thing seen. On a phone it would cover the room, so it starts closed.
const WIDE_SCREEN = 700;
boxMenu.setOpen(window.innerWidth >= WIDE_SCREEN);
showTheBox(box);
