// The engine for the floor plan pages: what any room needs, and nothing
// about one room in particular. An ES module: room_3d.html imports it, so
// the page needs a server (GitHub Pages, the installed app, or
// `python3 serve.py` here), as menu_demo/ does. three.js comes from the
// page's import map.
//
// Coordinates, as in each room: mm, x along the room's back wall from its
// left wall, y from the back wall towards the front, z up. The scene is y-up
// in metres: room (x, y, z) -> scene (x, z, y).
//
// REFACTOR_PLAN.md step 4 moves the general code here a piece at a time.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// A box from room corner (x0, y0, z0) to (x1, y1, z1), in mm.
export function box(x0, y0, z0, x1, y1, z1, mat, parent, edges = true) {
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

// Oak boards for the floor, drawn once: rows of 69 mm strips (three to a
// 207 mm board) of varied lengths and tones, as a texture tiling every 1104 mm
let oakTexture = null;
export function oakBoards() {
  if (oakTexture) return oakTexture;
  const px = 1024, mmPx = px / 1104, canvas = document.createElement('canvas');
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

// ---------------------------------------------------------------------------
// The address: a room's settings as fields joined with "-". A room lists its
// fields, each [its place in the settings as a path like 'sofa.front', how to
// write it, how to read it back]. Reading checks the text and gives the new
// value, or undefined to leave the setting as it was; it's given the value as
// it is, for fields of several parts. These are the usual readers.
// ---------------------------------------------------------------------------
// A number, checked by `check`; one in [lo, hi]; the value of one of the
// radio buttons called `name`
export const number = check => text => check(Number(text));
export const within = (lo, hi) => number(v => (v >= lo && v <= hi ? v : undefined));
export const radio = name => number(v => (document.querySelector(`input[name=${name}][value="${v}"]`) ? v : undefined));
// Sizes as a.b.c, in their sliders' order ([key, id, lowest, highest]): each
// held to its slider's range, or with `strict`, left as it was outside it
export const sizes = (sliders, strict = false) => [
  s => sliders.map(([k]) => s[k]).join('.'),
  (text, s) => {
    const out = { ...s };
    text.split('.').forEach((part, k) => {
      const [key, , lo, hi] = sliders[k] ?? [], v = part ? Number(part) : NaN;
      if (!key || !Number.isFinite(v)) return;
      if (!strict) out[key] = Math.min(hi, Math.max(lo, v));
      else if (v >= lo && v <= hi) out[key] = v;
    });
    return out;
  },
];

// The value at `path` in `settings`, and setting it
export const valueAt = (settings, path) => path.split('.').reduce((o, k) => o[k], settings);
export function setValueAt(settings, path, value) {
  const keys = path.split('.'), last = keys.pop();
  keys.reduce((o, k) => o[k], settings)[last] = value;
}
// Every field written, joined with "-"
export const writeFields = (fields, settings) => fields.map(([path, write]) => write(valueAt(settings, path))).join('-');
// The fields in `text` read into `settings`, those whose paths are in
// `first` before the rest (as others are checked against them); a field left
// empty, or that fails its check, leaves its setting as it was
export function readFields(fields, settings, text, first = []) {
  const parts = text.split('-');
  const early = first.map(path => fields.findIndex(([p]) => p === path)).filter(k => k >= 0);
  for (const k of [...early, ...[...fields.keys()].filter(k => !early.includes(k))]) {
    const [path, , read] = fields[k], part = parts[k];
    if (part === undefined || part === '') continue;
    const value = read(part, valueAt(settings, path));
    if (value !== undefined) setValueAt(settings, path, value);
  }
}
