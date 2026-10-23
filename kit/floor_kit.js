// The engine for the floor plan pages: what any room needs, and nothing
// about one room in particular. An ES module: living_room.js imports it, so
// the page needs a server (GitHub Pages, the installed app, or
// `python3 serve.py` here), as demos/menu_demo/ does. three.js comes from the
// page's import map.
//
// Coordinates, as in each room: mm, x along the room's back wall from its
// left wall, y from the back wall towards the front, z up. The scene is y-up
// in metres: room (x, y, z) -> scene (x, z, y).
//
// REFACTOR_PLAN.md step 4 moves the general code here a piece at a time.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clamp } from './units_kit.js';

export const MM = 0.001;

// ---------------------------------------------------------------------------
// The stage: the scene, its renderer (its canvas put in `container`), the 3D
// camera and the 2D views' camera, each with its controls, and the lights
// ---------------------------------------------------------------------------
export function createStage(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef0f2);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // The 2D views: a parallel projection, to scale, with panning and zooming
  // but no rotating
  const flatCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const flatControls = new OrbitControls(flatCamera, renderer.domElement);
  flatControls.enableRotate = false;
  flatControls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  flatControls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
  flatControls.enabled = false;

  // Bright, even light like a lit room, so white paint reads as white on every
  // wall: soft light all round, a main light casting shadows, and a fill light
  // on the left wall (the door and its frame) from across the room
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xe8dcc8, 1.9));     // a touch warm, as in the room photos
  const fill = new THREE.DirectionalLight(0xfff6ea, 0.8);
  fill.position.set(8, 3, 3);
  scene.add(fill);
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.3);
  sun.position.set(4, 6, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  scene.add(sun);

  return { scene, renderer, camera, controls, flatCamera, flatControls };
}

// ---------------------------------------------------------------------------
// Drawing in mm
// ---------------------------------------------------------------------------
export const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x3b2a12 });

// A box from one room corner to the opposite one, in mm:
// box({ from: [x0, y0, z0], to: [x1, y1, z1] }, mat, parent), with `from`
// the low corner (smallest x, y and z). `edges` false leaves out the dark
// outline (walls have none).
// Empty `group`, first freeing its pieces' geometry on the graphics card:
// a drawing rebuilt again and again (each slider move) without this fills
// it, and the page loses its WebGL context. Materials are shared, so stay
export function clearDrawing(group) {
  group.traverse(o => o.geometry?.dispose());
  group.clear();
}

export function box({ from: [x0, y0, z0], to: [x1, y1, z1] }, mat, parent, edges = true) {
  if (x1 <= x0 || y1 <= y0 || z1 <= z0) return null;          // nothing to draw, e.g. with no left-wall cupboard
  const g = new THREE.BoxGeometry((x1 - x0) * MM, (z1 - z0) * MM, (y1 - y0) * MM);
  const m = new THREE.Mesh(g, mat);
  m.position.set((x0 + x1) / 2 * MM, (z0 + z1) / 2 * MM, (y0 + y1) / 2 * MM);
  m.castShadow = m.receiveShadow = true;
  if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMaterial));
  parent.add(m);
  return m;
}

// A flat slab from z0 to z1 whose plan is the polygon `points` ([x, y] in mm)
export function slab(points, z0, z1, mat, parent) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: (z1 - z0) * MM, bevelEnabled: false });
  g.rotateX(Math.PI / 2);                                       // plan (x, y) -> scene (x, z), extruded downwards
  const m = new THREE.Mesh(g, mat);
  m.position.y = z1 * MM;
  m.castShadow = m.receiveShadow = true;
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMaterial));
  parent.add(m);
  return m;
}

// A flat piece standing upright, from y0 to y1, whose side view is the
// polygon `points` ([x, z] in mm): for a piece with a sloping edge
export function profile(points, y0, y1, mat, parent) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x * MM, z * MM)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: (y1 - y0) * MM, bevelEnabled: false });   // side view (x, z) -> scene (x, y), extruded along the scene's z (the plan's y)
  const m = new THREE.Mesh(g, mat);
  m.position.z = y0 * MM;
  m.castShadow = m.receiveShadow = true;
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMaterial));
  parent.add(m);
  return m;
}

// Names a part, mesh `m` (a cupboard's board, say, for the cutting list)
export function part(name, m) {
  if (m) m.userData.part = name;
  return m;
}

// A door that turns about a vertical hinge at room (hx, hy). The door's
// boxes are given in mm relative to the hinge.
export function hinge(hx, hy, parent) {
  const g = new THREE.Group();
  g.userData.hinge = true;                                       // a door's, so not the cupboard's outline
  g.position.set(hx * MM, 0, hy * MM);
  parent.add(g);
  return g;
}

// As hinge(), but the door's own x axis runs at `degrees` from the room's x
// axis, turning from +x towards -y. `dir` sets which way the slider opens it.
export function skewHinge(hx, hy, degrees, dir, parent) {
  const outer = hinge(hx, hy, parent);
  outer.rotation.y = THREE.MathUtils.degToRad(degrees);
  const inner = new THREE.Group();
  inner.userData.dir = dir;
  outer.add(inner);
  return inner;
}

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------

// RAL Classic colours for the floor, cupboards and walls. RAL is a paint
// standard with no exact screen equivalent: these are the usual published
// approximations, so check against a real RAL card before buying.
export const RAL = {
  1000: ['Green beige', '#BEBD7F'],
  1001: ['Beige', '#C2B078'],
  1002: ['Sand yellow', '#C6A664'],
  1011: ['Brown beige', '#8A6642'],
  1013: ['Oyster white', '#EAE6CA'],
  1014: ['Ivory', '#E1CC4F'],
  1015: ['Light ivory', '#E6D690'],
  1019: ['Grey beige', '#9E9764'],
  1020: ['Olive yellow', '#999950'],
  1024: ['Ochre yellow', '#AEA04B'],
  3000: ['Flame red', '#AF2B1E'],
  3004: ['Purple red', '#75151E'],
  3005: ['Wine red', '#5E2129'],
  3009: ['Oxide red', '#642424'],
  3012: ['Beige red', '#C1876B'],
  3015: ['Light pink', '#EA899A'],
  5000: ['Violet blue', '#354D73'],
  5003: ['Sapphire blue', '#1D1E33'],
  5008: ['Grey blue', '#26252D'],
  5010: ['Gentian blue', '#0E294B'],
  5011: ['Steel blue', '#231A24'],
  5012: ['Light blue', '#3B83BD'],
  5013: ['Cobalt blue', '#1E213D'],
  5014: ['Pigeon blue', '#606E8C'],
  5015: ['Sky blue', '#2271B3'],
  5018: ['Turquoise blue', '#3F888F'],
  5023: ['Distant blue', '#49678D'],
  5024: ['Pastel blue', '#5D9B9B'],
  6000: ['Patina green', '#316650'],
  6003: ['Olive green', '#424632'],
  6005: ['Moss green', '#2F4538'],
  6009: ['Fir green', '#31372B'],
  6011: ['Reseda green', '#587246'],
  6012: ['Black green', '#343E40'],
  6019: ['Pastel green', '#BDECB6'],
  6020: ['Chrome green', '#2E3A23'],
  6021: ['Pale green', '#89AC76'],
  7000: ['Squirrel grey', '#78858B'],
  7001: ['Silver grey', '#8A9597'],
  7002: ['Olive grey', '#7E7B52'],
  7003: ['Moss grey', '#6C7059'],
  7004: ['Signal grey', '#969992'],
  7005: ['Mouse grey', '#646B63'],
  7006: ['Beige grey', '#6D6552'],
  7008: ['Khaki grey', '#6A5F31'],
  7009: ['Green grey', '#4D5645'],
  7010: ['Tarpaulin grey', '#4C514A'],
  7011: ['Iron grey', '#434B4D'],
  7012: ['Basalt grey', '#4E5754'],
  7013: ['Brown grey', '#464531'],
  7015: ['Slate grey', '#434750'],
  7016: ['Anthracite grey', '#293133'],
  7021: ['Black grey', '#23282B'],
  7022: ['Umbra grey', '#332F2C'],
  7023: ['Concrete grey', '#686C5E'],
  7024: ['Graphite grey', '#474A51'],
  7026: ['Granite grey', '#2F353B'],
  7030: ['Stone grey', '#8B8C7A'],
  7031: ['Blue grey', '#474B4E'],
  7032: ['Pebble grey', '#B8B799'],
  7033: ['Cement grey', '#7D8471'],
  7034: ['Yellow grey', '#8F8B66'],
  7035: ['Light grey', '#D7D7D7'],
  7036: ['Platinum grey', '#7F7679'],
  7037: ['Dusty grey', '#7D7F7D'],
  7038: ['Agate grey', '#B5B8B1'],
  7039: ['Quartz grey', '#6C6960'],
  7040: ['Window grey', '#9DA1AA'],
  7042: ['Traffic grey A', '#8D948D'],
  7043: ['Traffic grey B', '#4E5452'],
  7044: ['Silk grey', '#CAC4B0'],
  7045: ['Telegrey 1', '#909090'],
  7046: ['Telegrey 2', '#82898F'],
  7047: ['Telegrey 4', '#D0D0D0'],
  8000: ['Green brown', '#826C34'],
  8001: ['Ochre brown', '#955F20'],
  8003: ['Clay brown', '#734222'],
  8007: ['Fawn brown', '#59351F'],
  8011: ['Nut brown', '#5B3A29'],
  8014: ['Sepia brown', '#382C1E'],
  8016: ['Mahogany brown', '#4C2F27'],
  8017: ['Chocolate brown', '#45322E'],
  8019: ['Grey brown', '#403A3A'],
  8022: ['Black brown', '#212121'],
  8024: ['Beige brown', '#79553D'],
  8025: ['Pale brown', '#755C48'],
  8028: ['Terra brown', '#4E3B31'],
  9001: ['Cream', '#FDF4E3'],
  9002: ['Grey white', '#E7EBDA'],
  9003: ['Signal white', '#F4F4F4'],
  9004: ['Signal black', '#282828'],
  9005: ['Jet black', '#0A0A0A'],
  9006: ['White aluminium', '#A5A5A5'],
  9007: ['Grey aluminium', '#8F8F8F'],
  9010: ['Pure white', '#FFFFFF'],
  9011: ['Graphite black', '#1C1C1C'],
  9016: ['Traffic white', '#F6F6F6'],
  9017: ['Traffic black', '#1E1E1E'],
  9018: ['Papyrus white', '#D7D7D7'],
};

// A canvas to draw a texture on: the page's; or where there's no page (Node,
// for the model's tests), a stand-in that draws nothing, so the shapes and
// the labels' text are the same and only the pictures are missing
export function makeCanvas() {
  if (typeof document !== 'undefined') return document.createElement('canvas');
  const nothing = new Proxy(() => nothing, { get: (target, key) => (key === 'measureText' ? () => ({ width: 0 }) : nothing), set: () => true });
  return { width: 0, height: 0, getContext: () => nothing };
}

// Oak boards for the floor, drawn once: rows of 69 mm strips (three to a
// 207 mm board) of varied lengths and tones, as a texture tiling every 1104 mm
let oakTexture = null;
export function oakBoards() {
  if (oakTexture) return oakTexture;
  const px = 1024, mmPx = px / 1104, canvas = makeCanvas();
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext('2d');
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let row = 0; row < 16; row++) {
    const y = row * 69 * mmPx;
    let x = -rand() * 600 * mmPx;
    while (x < px) {
      const len = (280 + rand() * 520) * mmPx;
      // Tones calibrated against daylight photos of the room: a bright honey
      // oak, averaging about #D29A50
      const light = 50 + rand() * 14, hue = 32 + rand() * 6;
      ctx.fillStyle = `hsl(${hue}, ${56 + rand() * 12}%, ${light}%)`;
      ctx.fillRect(x, y, len, 69 * mmPx);
      ctx.strokeStyle = `hsla(${hue - 4}, 45%, ${light - 14}%, 0.35)`;  // grain
      for (let k = 0; k < 6; k++) {
        const gy = y + rand() * 69 * mmPx;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(x + len * 0.3, gy + (rand() - 0.5) * 8, x + len * 0.7, gy + (rand() - 0.5) * 8, x + len, gy + (rand() - 0.5) * 6);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(70, 45, 20, 0.45)';                          // joints
      ctx.fillRect(x, y, 1.5, 69 * mmPx);
      x += len;
    }
    ctx.fillStyle = 'rgba(70, 45, 20, 0.35)';
    ctx.fillRect(0, y, px, 1.2);
  }
  oakTexture = new THREE.CanvasTexture(canvas);
  oakTexture.colorSpace = THREE.SRGBColorSpace;
  oakTexture.wrapS = oakTexture.wrapT = THREE.RepeatWrapping;
  oakTexture.repeat.set(1 / 1.104, 1 / 1.104);                    // the floor's texture runs in metres: a tile every 1104 mm
  oakTexture.anisotropy = 8;
  return oakTexture;
}

// The value at a path in the settings, and setting it: the configuration
// kit's (kit/config_kit.js), for the rooms' modules
export { valueAt, setValueAt } from './config_kit.js';

// ---------------------------------------------------------------------------
// Menus and buttons
// ---------------------------------------------------------------------------
// Narrow screens, phones: the drawers cover the model there
export const narrow = () => window.innerWidth <= 900;
// Up to this wide (a phone held upright), the drawers are a sheet from the
// bottom, the room live above it (room_3d.css's matching media query), its
// height dragged by its handle between SHEET_LOWEST and SHEET_HIGHEST of
// the screen, SHEET_START to start (chosen)
const SHEET_WIDTH = 600, SHEET_LOWEST = 0.33, SHEET_HIGHEST = 0.67, SHEET_START = 0.45;
// Where the sheet's height, as dragged, is remembered on this device
export const SHEET_HEIGHT_KEY = 'room_3d:sheetHeight';
export const asSheet = () => window.innerWidth <= SHEET_WIDTH;

// The pop-up menus, every .pop on the page, each a .popToggle button and its
// group: a button opens its menu and closes the others; Escape or a click on
// anything else but `canvas` (the 3D view) closes them (they stay open while
// you move about, to save a view, say). Returns setPop(menu), null for none.
export function popMenus(canvas) {
  const pops = [...document.querySelectorAll('.pop')];
  function setPop(open) {
    for (const p of pops) {
      p.classList.toggle('open', p === open);
      p.querySelector('.popToggle').setAttribute('aria-expanded', String(p === open));
    }
  }
  for (const p of pops) p.querySelector('.popToggle').addEventListener('click', () => setPop(p.classList.contains('open') ? null : p));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setPop(null); });
  window.addEventListener('pointerdown', e => { if (e.target !== canvas && !pops.some(p => p.contains(e.target))) setPop(null); });
  return setPop;
}

// Drawers that slide in from the left, one open at a time: `drawers` is
// { drawer's id: [its button's id, the class on <body> while it's open] }
// (the CSS does the sliding). Its button opens and closes it; a drawer with
// no button of its own (null) is opened by the page, with setMenu(); its ✕
// (.close) and Escape close it. moved() is called each time one opens or
// closes, or a sheet's height changes. No scrim: an open drawer leaves the
// room live beside it or above it, so a slider's change can be watched.
export function createDrawers(drawers, moved) {
  // The drawer open, or null
  const openDrawer = () => Object.keys(drawers).find(id => document.body.classList.contains(drawers[id][1])) ?? null;
  // Open drawer `id`, closing the others; null closes them all
  function setMenu(id) {
    for (const [drawer, [button, open]] of Object.entries(drawers)) {
      document.body.classList.toggle(open, drawer === id);
      if (button) document.getElementById(button).setAttribute('aria-expanded', String(drawer === id));
    }
    moved();
  }
  for (const [drawer, [button]] of Object.entries(drawers)) {
    if (button) document.getElementById(button).addEventListener('click', () => setMenu(openDrawer() === drawer ? null : drawer));
  }
  document.querySelectorAll('.drawer .close').forEach(b => b.addEventListener('click', () => setMenu(null)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(null); });
  sheetHandles(moved);
  // The part of the screen the open drawer covers, in pixels: the left, on
  // a wider screen, or the bottom, as a sheet
  function covering() {
    const open = openDrawer();
    if (!open) return { left: 0, bottom: 0 };
    const el = document.getElementById(open);
    return asSheet() ? { left: 0, bottom: el.offsetHeight } : { left: el.offsetWidth, bottom: 0 };
  }
  return { setMenu, openDrawer, menuOpen: () => openDrawer() !== null, covering };
}

// The sheets' handles: a bar along each drawer's top, shown only as a sheet
// (the CSS), dragged up and down to set its height, --sheet, kept on this
// device as a share of the screen's height
function sheetHandles(moved) {
  const KEY = SHEET_HEIGHT_KEY;
  const setHeight = share => {
    const clamped = clamp(share, SHEET_LOWEST, SHEET_HIGHEST);
    document.documentElement.style.setProperty('--sheet', `${Math.round(clamped * 100)}vh`);
    return clamped;
  };
  let share = SHEET_START;
  try { share = Number(localStorage.getItem(KEY)) || SHEET_START; } catch (e) { /* not important */ }
  share = setHeight(share);
  for (const drawer of document.querySelectorAll('.drawer')) {
    const handle = Object.assign(document.createElement('div'), { className: 'sheetHandle', title: 'Drag to make the options taller or shorter' });
    drawer.prepend(handle);
    handle.addEventListener('pointerdown', e => {
      handle.setPointerCapture(e.pointerId);
      const move = ev => { share = setHeight(1 - ev.clientY / window.innerHeight); moved(); };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        try { localStorage.setItem(KEY, String(share)); } catch (err) { /* not important */ }
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up, { once: true });
      handle.addEventListener('pointercancel', up, { once: true });
    });
  }
}

// Reload: load the page afresh, as a new deploy would be seen, with no
// settings in the address, so everything is back to its default (asked for,
// 18 Oct 2026, in place of Reset), with nothing to confirm. The keys
// forget() gives (what's remembered on this device but the saved views,
// looks and configurations) are cleared first, so it opens as a first
// visit would; the button says so and the page fades
// (`reloading` on the body) for RELOAD_FADE_MS before it goes, so it can be
// seen to happen (asked for, 18 Oct 2026: it looked as if nothing did)
const RELOAD_FADE_MS = 300;                           // chosen: long enough to see, short enough not to wait for
export function reloadButton(button, forget = () => []) {
  button.addEventListener('click', () => {
    for (const key of forget()) { try { localStorage.removeItem(key); } catch (e) { /* not important */ } }
    loadAfresh(button, 'Reloading…');
  });
}
// The button saying `words`, the room fading, then the page with an empty address
function loadAfresh(button, words) {
  button.textContent = words;
  button.disabled = true;
  document.body.classList.add('reloading');
  setTimeout(() => location.replace(location.pathname), RELOAD_FADE_MS);
}

// Reset: as a first visit ever would see it (asked for, 19 Oct 2026). Once
// confirmed, as it can't be undone: everything this site keeps on the
// device is forgotten, the saved views, looks and configurations too, and
// the offline copy (the service worker and its caches) dropped, so the
// newest page is fetched, then loaded as Reload does
export function resetButton(button) {
  button.addEventListener('click', async () => {
    if (!confirm('Reset forgets everything kept on this device, saved views, looks and configurations too, and loads the newest page. Go ahead?')) return;
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* not important */ }
    await Promise.all([
      navigator.serviceWorker?.getRegistrations().then(list => Promise.all(list.map(r => r.unregister()))),
      window.caches?.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))),
    ]).catch(() => { /* not important: the page still loads */ });
    loadAfresh(button, 'Resetting…');
  });
}

// Share a link to exactly what's on show: the page at `publicUrl` with this
// address, which holds every setting. Phones get their own share sheet, with
// text() as its text; elsewhere it's copied.
export function shareButton(button, publicUrl, text) {
  button.addEventListener('click', async () => {
    const url = publicUrl + location.hash;
    const said = words => {
      button.textContent = words;
      setTimeout(() => { button.textContent = 'Share'; }, 2000);
    };
    if (navigator.share && narrow()) {
      try { await navigator.share({ title: document.title, text: text(), url }); } catch (err) { /* closed without sharing */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      said('Link copied');
    } catch (err) {
      window.prompt('Copy this link:', url);
    }
  });
}

// Screenshot: the view on show as a PNG on the clipboard, to paste into a
// message or a document. `canvas` is the renderer's; draw() draws it, since
// the canvas is cleared after each frame reaches the screen, so it's drawn
// again just before it's read. name() names the file when the clipboard
// can't take pictures (some browsers) and it's downloaded instead.
export function screenshotButton(button, canvas, draw, name) {
  const label = button.textContent;                   // as the page gives it (📷)
  const said = words => {
    button.textContent = words;
    setTimeout(() => { button.textContent = label; }, 2000);
  };
  const png = () => new Promise(done => { draw(); canvas.toBlob(done, 'image/png'); });
  button.addEventListener('click', async () => {
    try {
      // The ClipboardItem is made in the click itself, with the picture to
      // come, as Safari needs
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png() })]);
      said('Copied');
    } catch (err) {
      const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(await png()), download: `${name()}.png` });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      said('Downloaded');
    }
  });
}

// Work offline once installed, with the service worker `worker`. Not on this
// computer (localhost), where its saved copies would get in the way of
// trying out changes: there any worker installed before is removed, with
// what it saved.
export function workOffline(worker) {
  const onThisComputer = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  if (onThisComputer) {
    navigator.serviceWorker.getRegistrations().then(list => list.forEach(r => r.unregister())).catch(() => { /* not important */ });
    window.caches?.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => { /* not important */ });
  } else {
    navigator.serviceWorker.register(worker).catch(() => { /* the page still works without it */ });
  }
}

// ---------------------------------------------------------------------------
// The 2D/3D switch, fitting the views to the screen, and the render loop
// ---------------------------------------------------------------------------
// `stage` is createStage()'s; `view` is the room's, read as needed: flat (on
// a 2D view, read and set), flatFit ([width, height] in m to fit on screen),
// flatPerM (the 2D views' scale, pixels per metre at zoom 1, read and set),
// hfov (the 3D view's angle across, when it sets one) and drawers
// (createDrawers()'s). Returns setFlat(), resize(), startLoop(), draw() and
// drawSoon(), which asks for the scene to be drawn again at the next frame.
export function flatViews(stage, view) {
  const { scene, renderer, camera, controls, flatCamera, flatControls } = stage;

  function setFlat(on) {
    view.flat = on;
    controls.enabled = !on;
    flatControls.enabled = on;
    document.querySelectorAll('[data-mode]').forEach(b => { b.style.display = b.dataset.mode === (on ? '2d' : '3d') ? '' : 'none'; });
    drawSoon();
  }

  // keepScale: the drawer opened or closed, so slide the drawing clear of it
  // but keep its size, and any zooming, as it was
  function resize(keepScale = false) {
    const { drawers } = view;
    // The drawers open just below the top bar, however many rows it takes
    document.documentElement.style.setProperty('--below-bar', `${Math.ceil(document.getElementById('bar').getBoundingClientRect().bottom) + 8}px`);
    const { clientWidth: w, clientHeight: h } = renderer.domElement.parentElement;
    renderer.setSize(w, h);
    // An open drawer stays open over the model, so the views fit the part it
    // leaves clear: to its right, or above it as a sheet. The 3D view is the
    // whole view in that part, its frustum stretched over the rest
    const { left, bottom } = drawers.covering();
    // ...and below the top bar on a phone (as the 2D views are), where the
    // bar's rows take a good part of the screen, so the room sits in the
    // space under them rather than up behind them (asked for, 19 Oct 2026)
    const barBottom = Math.min(document.getElementById('bar').getBoundingClientRect().bottom, h / 3);
    const top = bottom || asSheet() ? barBottom : 0;
    const clearW = w - left, clearH = h - bottom - top;
    camera.aspect = clearW / clearH;
    // On narrow screens, keep about 55° across rather than 45° up and down, so
    // the room isn't cropped at the sides
    const across = view.hfov || (clearW / clearH < 1.4 ? 55 : null);   // degrees across, when fixed
    // Up and down, capped so a tall phone screen doesn't stretch the view
    camera.fov = across ? Math.min(80, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(across / 2)) * clearH / clearW))) : 45;
    if (left || top || bottom) camera.setViewOffset(clearW, clearH, -left, -top, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    // Fit flatFit on screen, whichever way round is tighter, in that clear
    // part, below the top bar, and clear of anything else the page keeps
    // over the model at its edges (view.insets(), in px, if it has any)
    const [fw, fh] = view.flatFit;
    const inset = view.insets?.() ?? { left: 0, top: 0, bottom: 0 };
    const flatLeft = Math.max(left, inset.left), flatBottom = Math.max(bottom, inset.bottom), flatW = w - flatLeft;
    const below = Math.max(barBottom, inset.top), high = h - flatBottom - below;
    // (a sheet leaves too little to keep the scale: the plan's fitted again)
    if (!keepScale || !view.flatPerM || bottom) view.flatPerM = Math.min(flatW / fw, high / fh);
    const perM = view.flatPerM;
    Object.assign(flatCamera, { left: -(flatLeft + flatW / 2) / perM, right: flatW / 2 / perM, top: (below + high / 2) / perM, bottom: -(high / 2 + flatBottom) / perM });
    flatCamera.updateProjectionMatrix();
    drawSoon();                                       // setSize() cleared the canvas
  }
  window.addEventListener('resize', () => resize());

  // Draw the view on show, 2D or 3D, once
  function draw() {
    renderer.render(scene, view.flat ? flatCamera : camera);
  }

  // Drawn only when something's changed (21 Oct 2026). Drawing the flat
  // takes most of a frame where it's drawn in software (measured: 86 ms in
  // headless Chrome, the page busy 98% of the time doing nothing new), and
  // drawn every frame it left the page too busy to answer the tests under
  // load. What's on screen changes only when the camera moves, its glide
  // to a stop included (cameraMoved()), or the page changes the scene: in
  // answer to an event (a click, a key, a slider, the window resized), as
  // it starts, and when a configuration's loaded (drawSoon()).
  let drawWanted = true;
  const drawSoon = () => { drawWanted = true; };
  const SCENE_EVENTS = ['input', 'change', 'click', 'pointerdown', 'pointermove', 'pointerup', 'wheel', 'keydown',
    'touchstart', 'touchmove', 'touchend', 'resize', 'visibilitychange', 'pageshow'];
  // (capturing, so it's seen before any handler, whether it bubbles or not)
  for (const type of SCENE_EVENTS) window.addEventListener(type, drawSoon, { capture: true, passive: true });

  // Whether the camera on show has moved, turned or zoomed since it was
  // last drawn, by its matrices, so it's seen however it was moved (the
  // views set the 2D camera's zoom without its controls)
  const lastDrawn = { camera: null, world: new THREE.Matrix4(), projection: new THREE.Matrix4() };
  function cameraMoved(cam) {
    cam.updateMatrixWorld();
    if (cam === lastDrawn.camera && cam.matrixWorld.equals(lastDrawn.world) && cam.projectionMatrix.equals(lastDrawn.projection)) return false;
    lastDrawn.camera = cam;
    lastDrawn.world.copy(cam.matrixWorld);
    lastDrawn.projection.copy(cam.projectionMatrix);
    return true;
  }

  // onFirstDraw(), if given, once the scene's first drawn
  function startLoop(onFirstDraw = null) {
    renderer.setAnimationLoop(() => {
      (view.flat ? flatControls : controls).update();
      const moved = cameraMoved(view.flat ? flatCamera : camera);
      if (!moved && !drawWanted) return;
      drawWanted = false;
      draw();
      onFirstDraw?.();
      onFirstDraw = null;
    });
  }

  return { setFlat, resize, startLoop, draw, drawSoon };
}

// ---------------------------------------------------------------------------
// Dimensions for the 2D views: lines and labels in red, each added to group g
// ---------------------------------------------------------------------------
const dimMat = new THREE.LineBasicMaterial({ color: 0x9b1c1c, depthTest: false });

export function dimLine(points, g) {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), dimMat);
  l.renderOrder = 10;
  g.add(l);
}

export function dimLabel(text, at, g, colour = '#9b1c1c', size = 0.13) {
  const canvas = makeCanvas();
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
  canvas.width = Math.ceil(ctx.measureText(text).width) + 12;
  canvas.height = 48;
  ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = colour;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 6, 25);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false }));
  sprite.scale.set(size * canvas.width / canvas.height, size, 1);
  sprite.position.copy(at);
  sprite.renderOrder = 11;
  sprite.userData.text = text;                  // for window.plans.snapshot()'s dimension figures
  g.add(sprite);
}

// A chain of dimensions between successive values in `at` (mm). place(v, off)
// gives the scene point for value v, `off` mm out from the chain's line.
export function chain(at, place, g) {
  const v = [...new Set(at.map(Math.round))].sort((a, b) => a - b);
  dimLine([place(v[0], 0), place(v[v.length - 1], 0)], g);
  for (const x of v) dimLine([place(x, -40), place(x, 40)], g);
  // Labels on short neighbouring gaps would overlap, so every other one moves further out
  for (let i = 1; i < v.length; i++) {
    const len = v[i] - v[i - 1];
    dimLabel(String(len), place((v[i] + v[i - 1]) / 2, len < 250 && i % 2 ? 260 : 110), g);
  }
}

// Cut views: in a wall view, anything wholly on the camera's side of the
// view's cut is left out, so what's behind it isn't hidden. `view` is the
// room's, read as needed: cut, the view's cut or null, and only, null or a
// test only the meshes to show pass. Returns applyCut().
export function cutViews(scene, view) {
  // A cut is [axis, where in mm, which side the camera is: 1 for the higher
  // side, -1 the lower].
  function applyCut() {
    const { cut, only } = view;
    scene.updateMatrixWorld(true);
    const b = new THREE.Box3();
    scene.traverse(o => {
      if (!o.isMesh) return;
      o.visible = true;
      if (!cut) return;
      const [axis, at, side] = cut;
      b.setFromObject(o);
      const k = axis === 'x' ? 'x' : 'z';                            // room y is the scene's z
      o.visible = side > 0 ? b.min[k] / MM <= at : b.max[k] / MM >= at;
    });
    if (only) scene.traverse(o => { if (o.isMesh && !only(o)) o.visible = false; });
  }

  return applyCut;
}
