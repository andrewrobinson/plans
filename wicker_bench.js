// The wicker bench: the hallway's, a white wicker ottoman with a padded
// floral lid, on four short turned legs. There's one, at one set of sizes,
// but it can be switched on in the hallway, the bedroom and the living room,
// each with a place of its own, to try where it might go (asked for, 15 Oct
// 2026). Called the wicker bench to keep it apart from the living room's
// bench along its back wall.
//
// living_room.js holds the settings (state.wickerBench, starting as
// WICKER_BENCH_START) and puts them in its address (WICKER_BENCH_ADDRESS);
// this file says how it looks, draws it in each room (drawWickerBench()) and
// makes its menu block (wickerBenchControls()).
import * as THREE from 'three';
import { MM, material, box, valueAt } from './kit/floor_kit.js';
import { floor, hallway, otherRoom, HALLWAY, OUTER, OTHER_ROOM, ROOM_WIDTH, ROOM_DEPTH } from './floor.js';
import { OTHER_ROOM_START, BED_FOOT, QUARTER_TURN, SIZE_LABEL, slider } from './other_room.js';

// ---------------------------------------------------------------------------
// Its sizes, in mm: measured 15 Oct 2026 (920 long, 410 deep, 450 high to the
// top of its lid, on 80 legs); the rest estimated from the photo.
// ---------------------------------------------------------------------------
const BENCH = {
  w: 920, d: 410, h: 450, legs: 80,
  lid: 60,                         // the lid's thickness: a wooden rim with the padded top on it
  rim: 20,                         // ...the rim's
  lidProud: 10,                    // how far the lid stands out over the wicker, all round
  legTop: 55, legFoot: 40,         // the turned legs' width at the top and at the foot
  legIn: 30,                       // the legs' middles in from the wicker's corners
  minWicker: 100,                  // the least wicker between the legs and the lid, however the sliders are set (chosen)
};
const wickerMat = material(0xebe7db);              // white wicker, aged
const rimMat = material(0x6b4a2e);                 // the lid's wooden rim, with its studs
const legMat = material(0xf3f1ea);

// Where it starts in each room, all chosen to be clear of what's near:
// in the hallway (as in the photo, 15 Oct 2026) its back to the banister,
// against the rail's line, its near end just past the newel post at the
// top of the flight; in the bedroom, its back to the foot of the bed,
// centred on it; in the living room, in front of the middle window's
// radiator, facing into the room.
const NEWEL_GAP = 20;              // its end from the newel post (estimated from the photo)
const BED_GAP = 20;                // from the foot of the bed (chosen)
const RADIATOR_GAP = 20;           // from the radiator's front (chosen)
const step5 = mm => Math.round(mm / 5) * 5;        // onto the place sliders' steps
const radiatorFront = ROOM_WIDTH - OUTER.radiator.out;
const middleWindow = OUTER.windows[1].y;

export const WICKER_BENCH_START = {
  w: BENCH.w, d: BENCH.d, h: BENCH.h, legs: BENCH.legs,
  // along: from the living room door's wall; across: from the outside wall
  // behind the stairs (the living room's y)
  hallway: { on: true, along: HALLWAY.well + HALLWAY.post + NEWEL_GAP + BENCH.w / 2, across: HALLWAY.yBanister + HALLWAY.railW, turn: 0 },
  bedroom: { on: false, u: OTHER_ROOM_START.bed.u, v: BED_FOOT + BED_GAP, turn: 0 },
  livingRoom: { on: false, x: radiatorFront - RADIATOR_GAP, y: step5((middleWindow[0] + middleWindow[1]) / 2), turn: 90 },
};

// ---------------------------------------------------------------------------
// The rooms it can be in. Each: its switch's label; the group it's drawn
// in; its two place sliders ([key, label, lowest, highest]) and its turn's
// label; and where those put the middle of its back in that group's mm.
// Turns are in quarter turns, as the bedroom's furniture's; which way 0°
// and 90° face in each room is in its turn's label.
// ---------------------------------------------------------------------------
const ROOMS = {
  hallway: {
    label: 'In the hallway', group: hallway,
    place: [['along', 'Back’s middle from the living room door’s wall', 0, HALLWAY.length],
      ['across', 'Back’s middle from the outside wall behind the stairs', 0, HALLWAY.ySetBack]],
    turnLabel: 'Turned (0° faces the kitchen side, 90° the far end)',
    at: ({ along, across }) => [HALLWAY.x0 - along, across],
  },
  bedroom: {
    label: 'In the bedroom', group: otherRoom,
    place: [['u', 'Back’s middle from the window wall', 0, OTHER_ROOM.length],
      ['v', 'Back’s middle from the hallway wall', 0, OTHER_ROOM.recessBack]],
    turnLabel: 'Turned (0° faces away from the hallway wall, 90° the window wall)',
    at: ({ u, v }) => [u, v],
  },
  livingRoom: {
    label: 'In the living room', group: floor,
    place: [['x', 'Back’s middle from the left wall', 0, ROOM_WIDTH],
      ['y', 'Back’s middle from the back wall', 0, ROOM_DEPTH]],
    turnLabel: 'Turned (0° faces the front wall, 90° the left wall)',
    at: ({ x, y }) => [x, y],
  },
};
const ROOM_KEYS = Object.keys(ROOMS);

// The sliders, as other_room.js's: [path in state.wickerBench, label,
// lowest, highest, step, unit]
const SIZE_SLIDERS = [['w', 400, 2000], ['d', 250, 800], ['h', 250, 900]].map(([k, lo, hi]) => [k, SIZE_LABEL[k], lo, hi, 10, ''])
  .concat([['legs', 'Legs', 0, 300, 5, '']]);
const placeSliders = room => [
  ...ROOMS[room].place.map(([k, label, lo, hi]) => [`${room}.${k}`, label, lo, hi, 5, '']),
  [`${room}.turn`, ROOMS[room].turnLabel, 0, 360 - QUARTER_TURN, QUARTER_TURN, '°'],
];
const SLIDERS = [...SIZE_SLIDERS, ...ROOM_KEYS.flatMap(placeSliders)];

// ---------------------------------------------------------------------------
// The address: its sizes as `w.d.h.legs`, then each room's `on.a.b.turn`
// (on 1 or 0), each number held to its slider's range
// ---------------------------------------------------------------------------
const RANGES = Object.fromEntries(SLIDERS.map(([path, , lo, hi]) => [path, [lo, hi]]));
function held(path, text, was) {
  const [lo, hi] = RANGES[path], n = text ? Number(text) : NaN;
  if (path.endsWith('.turn') && n % QUARTER_TURN !== 0) return was;   // only quarter turns
  return n >= lo && n <= hi ? n : was;
}
const onOff = (text, was) => (text === '1' ? true : text === '0' ? false : was);
const SIZE_KEYS = SIZE_SLIDERS.map(([k]) => k);
const roomField = room => {
  const keys = [...ROOMS[room].place.map(([k]) => k), 'turn'];
  return [`wickerBench.${room}`,
    r => [r.on ? 1 : 0, ...keys.map(k => r[k])].join('.'),
    (text, r) => {
      const [on, ...parts] = text.split('.');
      return { on: onOff(on, r.on), ...Object.fromEntries(keys.map((k, i) => [k, held(`${room}.${k}`, parts[i], r[k])])) };
    }];
};
export const WICKER_BENCH_ADDRESS = [
  ['wickerBench',
    b => SIZE_KEYS.map(k => b[k]).join('.'),
    (text, b) => {
      const parts = text.split('.');
      return { ...b, ...Object.fromEntries(SIZE_KEYS.map((k, i) => [k, held(k, parts[i], b[k])])) };
    }],
  ...ROOM_KEYS.map(roomField),
];

// ---------------------------------------------------------------------------
// Drawing: the bench in its own group, its back's middle at the origin, its
// length along x and its depth out along y, as the bedroom's pieces are
// ---------------------------------------------------------------------------
// The bench as drawn in each room now, to look at (hidden where it's off,
// but still placed, so Looking at it aims at its spot)
export const wickerBenches = { hallway: null, bedroom: null, livingRoom: null };

export function drawWickerBench(s) {
  for (const room of ROOM_KEYS) {
    if (wickerBenches[room]) wickerBenches[room].removeFromParent();
    const g = wickerBench(s), [x, y] = ROOMS[room].at(s[room]);
    g.position.set(x * MM, 0, y * MM);
    g.rotation.y = THREE.MathUtils.degToRad(-s[room].turn);
    g.visible = s[room].on;
    ROOMS[room].group.add(g);
    wickerBenches[room] = g;
  }
}

// The lid's fabric, drawn: a floral chintz on a periwinkle ground, cream
// branches with sage leaves, pink roses and a few rust and red flowers. Its
// colours are picked by eye from the user's photo of the bench (15 Oct
// 2026); the pattern is made up, in its manner, as the photo couldn't be
// read as a file. One tile covers the top, so it's drawn at the lid's shape.
const FABRIC = {
  ground: '#6870B6', cream: '#EEE3C6', sage: '#8DB89C', leaf: '#6E9E7E',
  rose: '#E6A9A3', roseHeart: '#C2625F', rust: '#C9844E', red: '#C4555A',
  px: 1024,                        // the tile's width in pixels, across the lid's 920 mm (chosen), so a pixel is about 0.9 mm
  sprays: 14, roses: 34, flowers: 10, // how many of each to scatter (chosen, to look as busy as the photo)
  roseR: 20, leafL: 22, leafW: 9,  // a rose's radius and a leaf's half-length and half-width in pixels: roses about 40 mm across, as in the photo
};
function floralFabric() {
  const { px } = FABRIC, high = Math.round(px * BENCH.d / BENCH.w);
  const canvas = document.createElement('canvas');
  canvas.width = px; canvas.height = high;
  const ctx = canvas.getContext('2d');
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const at = () => [rand() * px, rand() * high];
  ctx.fillStyle = FABRIC.ground;
  ctx.fillRect(0, 0, px, high);
  // Branches: cream curves, each with sage leaves along it
  for (let k = 0; k < FABRIC.sprays; k++) {
    const [x0, y0] = at(), [x1, y1] = at(), cx = (x0 + x1) / 2 + (rand() - 0.5) * 200, cy = (y0 + y1) / 2 + (rand() - 0.5) * 200;
    ctx.strokeStyle = FABRIC.cream; ctx.lineWidth = 5 + rand() * 6;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke();
    for (let t = 0.06; t < 1; t += 0.07) {
      const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1;
      leafAt(ctx, x + (rand() - 0.5) * 40, y + (rand() - 0.5) * 40, rand() * Math.PI, rand() < 0.5 ? FABRIC.sage : FABRIC.leaf);
    }
  }
  // Roses, often in twos and threes, and a few larger rust and red flowers
  for (let k = 0; k < FABRIC.roses; k++) {
    const [x, y] = at();
    for (let n = 1 + Math.floor(rand() * 3); n > 0; n--) roseAt(ctx, x + (rand() - 0.5) * 70, y + (rand() - 0.5) * 70, FABRIC.roseR * (0.7 + rand() * 0.5), FABRIC.rose, FABRIC.roseHeart);
  }
  for (let k = 0; k < FABRIC.flowers; k++) {
    const [x, y] = at();
    roseAt(ctx, x, y, FABRIC.roseR * (1.2 + rand() * 0.5), rand() < 0.5 ? FABRIC.rust : FABRIC.red, FABRIC.cream);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
function leafAt(ctx, x, y, turn, colour) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(turn);
  ctx.fillStyle = colour;
  ctx.beginPath(); ctx.ellipse(0, 0, FABRIC.leafL, FABRIC.leafW, 0, 0, 2 * Math.PI); ctx.fill();
  ctx.restore();
}
function roseAt(ctx, x, y, r, colour, heart) {
  ctx.fillStyle = colour;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = heart; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 1.6 * Math.PI); ctx.stroke();
  ctx.fillStyle = heart;
  ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, 2 * Math.PI); ctx.fill();
}

const lidMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: floralFabric(), roughness: 0.9 });   // the lid's floral fabric

// Legs at its corners, the wicker on them, and the lid over it: a wooden
// rim with the padded top on it, standing out over the wicker all round
function wickerBench({ w, d, h, legs }) {
  const g = new THREE.Group(), half = w / 2;
  const { lid, rim, lidProud: p, legIn } = BENCH;
  const lidFrom = h - lid, legH = Math.min(legs, lidFrom - BENCH.minWicker);
  box({ from: [-half + p, p, Math.max(legH, 0)], to: [half - p, d - p, lidFrom] }, wickerMat, g);
  box({ from: [-half, 0, lidFrom], to: [half, d, lidFrom + rim] }, rimMat, g);
  box({ from: [-half, 0, lidFrom + rim], to: [half, d, h] }, lidMat, g);
  if (legH > 0) {
    for (const x of [-half + p + legIn, half - p - legIn]) {
      for (const y of [p + legIn, d - p - legIn]) g.add(leg(x, y, legH));
    }
  }
  return g;
}

// A turned leg, wider at the top than the foot, `high` tall, its middle at x, y
function leg(x, y, high) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(BENCH.legTop / 2 * MM, BENCH.legFoot / 2 * MM, high * MM, 16), legMat);
  m.position.set(x * MM, high / 2 * MM, y * MM);
  m.castShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// The menu's block, built into `container`: its sizes, with a button to put
// them back as they started, then for each room a switch and, while it's
// on, the sliders that place it there and a button to put it back.
// change(edits) is called with a list of [path, value]; the function
// returned puts the controls in step with the settings `s`.
// ---------------------------------------------------------------------------
export function wickerBenchControls(container, change) {
  const id = path => `wickerBench_${path.replace('.', '_')}`;
  const reset = (what, text) => `<div class="row"><button data-reset="${what}">${text}</button></div>`;
  container.innerHTML =
    `<div class="depth"><div><b>Its sizes</b> (the same in every room)</div>${SIZE_SLIDERS.map(slider(id)).join('')}${reset('sizes', 'Reset dimensions')}</div>` +
    ROOM_KEYS.map(room => `<div class="depth"><label class="switch"><input type="checkbox" id="${id(`${room}.on`)}"> ${ROOMS[room].label}</label>` +
      `<div id="${id(room)}">${placeSliders(room).map(slider(id)).join('')}${reset(room, 'Reset location')}</div></div>`).join('');

  for (const [path] of SLIDERS) document.getElementById(id(path)).addEventListener('input', e => change([[path, Number(e.target.value)]]));
  for (const room of ROOM_KEYS) document.getElementById(id(`${room}.on`)).addEventListener('change', e => change([[`${room}.on`, e.target.checked]]));
  container.querySelectorAll('button[data-reset]').forEach(b => b.addEventListener('click', () => {
    const what = b.dataset.reset;
    const paths = what === 'sizes' ? SIZE_KEYS : placeSliders(what).map(([path]) => path);
    change(paths.map(path => [path, valueAt(WICKER_BENCH_START, path)]));
  }));

  return s => {
    for (const [path, , , , , unit] of SLIDERS) {
      const value = valueAt(s, path);
      document.getElementById(id(path)).value = String(value);
      document.getElementById(`${id(path)}Value`).textContent = `${value}${unit}`;
    }
    for (const room of ROOM_KEYS) {
      document.getElementById(id(`${room}.on`)).checked = s[room].on;
      document.getElementById(id(room)).hidden = !s[room].on;
    }
  };
}
