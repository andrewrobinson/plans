// Shelves and pictures over the stairs (agreed 19 Oct 2026, PLAN.md and
// notes/HALLWAY_SHELVES.md): on the three walls that rise from the hallway floor
// to the ceiling round the stairwell, each wall with its own white
// floating shelves (0 to 3) and one blank picture in a thin black frame,
// high up, from the hallway floor. None bought yet, so all sliders,
// starting at the sizes and places the user set, all off to start.
//
// flat_model.js holds the settings (config.hallway, as the configuration's
// hallway, starting as STAIR_WALLS_START: each wall by its name there,
// wcWall, loungeWall and tvWall, and the L, cornerShelves); this file gives their entries in the configuration
// (STAIR_WALLS_SCHEMA), keeps a wall's shelves and picture apart
// (keepApart()), draws them (drawStairWalls()) and makes the menu block
// (stairWallsControls()). It holds the shoe boxes on the sills' settings
// too (shoe_boxes.js), as shoeBoxes, and keeps the walls' shelves and
// pictures clear of them (shoeBoxRefusal()).
import * as THREE from 'three';
import { material, box, clearDrawing, valueAt } from './kit/floor_kit.js';
import * as Config from './kit/config_kit.js';
import { hallway, HALLWAY, BATHROOM, CEILING_HEIGHT, DOOR_FRAME_STARTS_AT } from './floor.js';
import { slider } from './kit/controls_kit.js';
import { SHOE_BOXES_START, onTheSill, levelled, shoeBoxBounds } from './shoe_boxes.js';

// ---------------------------------------------------------------------------
// The three walls, all seen from the hallway, in the living room's mm (as
// floor.js's HALLWAY). Each: the end of its stretch that positions along
// it are measured from (start, [x, y], on its face), the way along it
// (dir) and the way off it into the hallway (out), each a unit step in
// [x, y], and how long the stretch is. alongFrom names the start, for its
// sliders
// ---------------------------------------------------------------------------
const WALLS = {
  // The WC wall: the wall shared with the bathroom at the hallway's far
  // end, over the stairwell and on to the lobby. Its bottom over the well
  // is still to measure (floor.js draws it at the hallway floor's level)
  wcWall: { label: 'The WC wall', where: 'At the hallway’s far end, over the stairwell: the wall shared with the bathroom.',
    alongFrom: 'the TV wall', start: [HALLWAY.xEnd, HALLWAY.yHallOut], dir: [0, 1], out: [1, 0], length: BATHROOM.yLobby - HALLWAY.yHallOut },
  // The lounge door wall: in front of you as you take the first step
  // down, the hallway side of the living room door's wall, over the
  // winders, as far as the door's frame
  loungeWall: { label: 'The lounge door wall', where: 'In front of you as you take the first step down: the hallway side of the living room door’s wall, over the winders.',
    alongFrom: 'the TV wall', start: [HALLWAY.x0, HALLWAY.yHallOut], dir: [0, 1], out: [-1, 0], length: DOOR_FRAME_STARTS_AT - HALLWAY.yHallOut },
  // The TV wall (asked for, 19 Oct 2026): on the right going down the
  // stairs, the stairwell's outside wall, in line with the lounge's TV
  // wall (its back wall), from the lounge door wall to the WC wall
  // Its shelves can be as long as the wall and start lower (asked for,
  // 19 Oct 2026): ranges of their own, set below
  tvWall: { label: 'The TV wall', where: 'On your right going down the stairs: the stairwell’s outside wall, in line with the lounge’s TV wall.',
    alongFrom: 'the lounge door wall', start: [HALLWAY.x0, HALLWAY.yHallOut], dir: [-1, 0], out: [0, 1], length: HALLWAY.length },
};
const WALL_KEYS = Object.keys(WALLS);
const wallLength = key => WALLS[key].length;                         // WC wall 1598, lounge door wall 1327, TV wall 2330

// ---------------------------------------------------------------------------
// Sizes, in mm
// ---------------------------------------------------------------------------
const SHELF_T = 38;                // a floating shelf's thickness (chosen, as a common white floating shelf)
const FRAME = { border: 20, depth: 25 };   // the picture's thin black frame: its width round the picture and its depth off the wall (chosen)
const APART = 50;                  // the least gap kept between a wall's shelves and its picture (chosen)
const TOP_SHELF_ROOM = 150;        // above the top shelf, to the ceiling, room to put something on it (chosen)
const PICTURE_ROOM = 50;           // above the picture, to the ceiling (chosen)
// The TV wall's lowest shelf can come down to here: just above the white
// board along it, 25 below the hallway floor (chosen)
const TV_WALL_LOWEST_SHELF = 200;

const shelfMat = material(0xf7f7f5);       // white (agreed)
const frameMat = material(0x1a1a1a);       // black (agreed)
const pictureMat = material(0xffffff);     // a blank white picture (agreed)

// Each wall's settings, as they start. shelves.height is the lowest
// shelf's top, picture.height the picture's middle, both above the hallway
// floor; along is each one's middle, from the wall's start. The sizes and
// places as the user set them (19 Oct 2026, from their link), all off to
// start, as they asked: switched on, each is as they set it. On a wall the
// shelves and picture are where each other are, so to have both, move or
// shrink one
// The L-shaped shelves (asked for, 19 Oct 2026): one set of shelves on
// the TV wall and the WC wall, joined in the corner where they meet,
// replacing those walls' own shelves while they're on. Each arm's length
// is from the corner; the rest as the TV wall's shelves start (the user's)
const CORNER_WALLS = ['tvWall', 'wcWall'];
const CORNER_START = { on: false, count: 3, height: 1000, spacing: 440, depth: 240, tvLength: 1200, wcLength: 1200 };

const STAIR_WALLS_START = {
  shoeBoxes: SHOE_BOXES_START,
  cornerShelves: CORNER_START,
  wcWall: {
    shelves: { on: false, count: 2, height: 1350, width: 1200, along: 810, spacing: 440, depth: 220 },
    picture: { on: false, height: 1420, width: 670, tall: 930, along: 830 },
  },
  loungeWall: {
    shelves: { on: false, count: 2, height: 1290, width: 1200, along: 600, spacing: 300, depth: 200 },
    picture: { on: false, height: 1220, width: 680, tall: 1000, along: 660 },
  },
  tvWall: {
    shelves: { on: false, count: 3, height: 1000, width: 1200, along: 1180, spacing: 440, depth: 240 },
    picture: { on: false, height: 1430, width: 1200, tall: 1000, along: 1160 },
  },
};
export { STAIR_WALLS_START };

// The sliders: [key, label, lowest, highest, step] (along's highest is the
// wall's length). Each wall's shelves, then its picture
const SHELF_SLIDERS = [
  ['count', 'Shelves', 0, 3, 1],
  ['height', 'Lowest shelf, above the hallway floor', 1000, 2300, 10],
  ['width', 'Width', 300, 1200, 10],
  ['along', 'Middle, from', 0, null, 10],
  ['spacing', 'Spacing, shelf to shelf', 200, 500, 10],
  ['depth', 'Depth', 150, 300, 10],
];
const PICTURE_SLIDERS = [
  ['height', 'Middle, above the hallway floor', 1000, 2200, 10],
  ['width', 'Width', 200, 1200, 10],
  ['tall', 'Height', 200, 1000, 10],
  ['along', 'Middle, from', 0, null, 10],
];
const SLIDERS = { shelves: SHELF_SLIDERS, picture: PICTURE_SLIDERS };
const ITEMS = Object.keys(SLIDERS);
// A wall's own ends for a slider, where they differ: the TV wall's shelves
// as long as the wall, and lower
const WALL_RANGES = { tvWall: { shelves: { width: [300, wallLength('tvWall')], height: [TV_WALL_LOWEST_SHELF, 2300] } } };
const rangeOf = (wall, item, key) => {
  const [, , lo, hi, step] = SLIDERS[item].find(([k]) => k === key);
  const [ownLo, ownHi] = WALL_RANGES[wall]?.[item]?.[key] ?? [lo, hi ?? wallLength(wall)];
  return [ownLo, ownHi, step];
};
// The L's sliders. An arm on the WC wall must be longer than the deepest
// shelf, as it starts behind the TV wall's arm
const CORNER_SLIDERS = [
  ['count', 'Shelves', 1, 3, 1],
  ['height', 'Lowest shelf, above the hallway floor', TV_WALL_LOWEST_SHELF, 2300, 10],
  ['tvLength', 'Along the TV wall, from the corner', 300, wallLength('tvWall'), 10],
  ['wcLength', 'Along the WC wall, from the corner', 400, wallLength('wcWall'), 10],
  ['spacing', 'Spacing, shelf to shelf', 200, 500, 10],
  ['depth', 'Depth', 150, 300, 10],
];

// The configuration's entries: hallway.<wall>.<shelves|picture>.<key>,
// and the L's, hallway.cornerShelves.<key>
export const STAIR_WALLS_SCHEMA = [
  ...WALL_KEYS.flatMap(wall => ITEMS.flatMap(item => [
    Config.onOff(`hallway.${wall}.${item}.on`),
    ...SLIDERS[item].map(([key]) => {
      const [lo, hi, step] = rangeOf(wall, item, key);
      return Config.number(`hallway.${wall}.${item}.${key}`, lo, hi, step);
    }),
  ])),
  Config.onOff('hallway.cornerShelves.on'),
  ...CORNER_SLIDERS.map(([key, , lo, hi, step]) => Config.number(`hallway.cornerShelves.${key}`, lo, hi, step)),
];

// ---------------------------------------------------------------------------
// Where each one is on its wall: a rectangle, along the wall and up it
// (heights above the hallway floor), or null when it's not there
// ---------------------------------------------------------------------------
function shelvesSpan(s) {
  if (!s.on || s.count === 0) return null;
  return { a0: s.along - s.width / 2, a1: s.along + s.width / 2, z0: s.height - SHELF_T, z1: s.height + (s.count - 1) * s.spacing };
}
function pictureSpan(p) {
  if (!p.on) return null;
  return { a0: p.along - p.width / 2, a1: p.along + p.width / 2, z0: p.height - p.tall / 2, z1: p.height + p.tall / 2 };
}
const spanOf = (item, settings) => (item === 'shelves' ? shelvesSpan : pictureSpan)(settings);
const overlap = (r, q) => r && q && r.a0 < q.a1 + APART && q.a0 < r.a1 + APART && r.z0 < q.z1 + APART && q.z0 < r.z1 + APART;

// One of them held to its wall: below the ceiling (its height brought
// down, no lower than its slider goes), and within the wall's length
function onTheWall(wall, item, s) {
  const [lowest] = rangeOf(wall, item, 'height');
  const highest = item === 'shelves'
    ? CEILING_HEIGHT - TOP_SHELF_ROOM - (s.count - 1) * s.spacing
    : CEILING_HEIGHT - PICTURE_ROOM - s.tall / 2;
  const half = s.width / 2;
  return { ...s, height: Math.max(lowest, Math.min(s.height, highest)), along: Math.min(Math.max(s.along, half), wallLength(wall) - half) };
}

// A wall's settings with `moving` (shelves or picture) kept on the wall
// and clear of the other and of `boxes` (the shoe boxes' spans against the
// wall, boxSpansOn()): if they'd meet, it goes along to the nearest side
// of one of them where it meets none. Returns null if there's no such side
export function keepApart(wall, settings, moving, boxes = []) {
  const other = ITEMS.find(item => item !== moving);
  const s = { ...settings, [moving]: settings[moving].on ? onTheWall(wall, moving, settings[moving]) : settings[moving] };
  const fixed = [spanOf(other, s[other]), ...boxes].filter(Boolean);
  const clearAt = along => !fixed.some(q => overlap(spanOf(moving, { ...s[moving], along }), q));
  if (clearAt(s[moving].along)) return s;
  const half = s[moving].width / 2, gap = half + APART;
  const sides = fixed.flatMap(q => [q.a0 - gap, q.a1 + gap])
    .filter(along => along >= half && along <= wallLength(wall) - half && clearAt(along))
    .sort((a, b) => Math.abs(a - s[moving].along) - Math.abs(b - s[moving].along));
  return sides.length ? { ...s, [moving]: { ...s[moving], along: sides[0] } } : null;
}

// ---------------------------------------------------------------------------
// The shoe boxes on the sills (shoe_boxes.js), as spans on the walls they
// stand against: a box is against a wall where it comes to within APART
// of its face on the hallway side; its span is its ends (or sides) along
// the wall and its bottom and top
// ---------------------------------------------------------------------------
function boxSpanOn(wallKey, bounds) {
  if (!bounds) return null;
  const { start, dir, out } = WALLS[wallKey];
  const corners = [[bounds.x0, bounds.y0], [bounds.x1, bounds.y1]];
  const along = corners.map(([x, y]) => (x - start[0]) * dir[0] + (y - start[1]) * dir[1]);
  const off = corners.map(([x, y]) => (x - start[0]) * out[0] + (y - start[1]) * out[1]);
  if (Math.min(...off) > APART || Math.max(...off) <= 0) return null;
  return { a0: Math.min(...along), a1: Math.max(...along), z0: bounds.z0, z1: bounds.z1 };
}
const boxSpansOn = (walls, wallKey) =>
  Object.entries(walls.shoeBoxes).map(([key, b]) => boxSpanOn(wallKey, shoeBoxBounds(key, b))).filter(Boolean);

// Why the shoe box `key` can't be as `b` asks, with the walls as `state`
// has them: it would meet a wall's shelves (the L's arm, where it's on) or
// its picture. Null when it can
export function shoeBoxRefusal(walls, key, b) {
  const meets = WALL_KEYS.filter(wall => {
    const span = boxSpanOn(wall, shoeBoxBounds(key, b));
    return span && (overlap(span, shelvesSpan(shelvesOn(walls, wall))) || overlap(span, pictureSpan(walls[wall].picture)));
  });
  return meets.length
    ? `No room for this box beside the shelves or picture on ${meets.map(wall => WALLS[wall].label.replace(/^The/, 'the')).join(' and ')}: make it shorter or lower, or move them, first.`
    : null;
}

// The L, held under the ceiling (its lowest shelf brought down, no lower
// than its slider goes)
function cornerUnderCeiling(c) {
  const highest = CEILING_HEIGHT - TOP_SHELF_ROOM - (c.count - 1) * c.spacing;
  return { ...c, height: Math.max(TV_WALL_LOWEST_SHELF, Math.min(c.height, highest)) };
}
// One of the L's arms, as shelves on its wall: on the TV wall it runs back
// from the wall's far end, on the WC wall out from its start
function cornerArm(wall, c) {
  const length = wall === 'tvWall' ? c.tvLength : c.wcLength;
  const along = wall === 'tvWall' ? wallLength('tvWall') - length / 2 : length / 2;
  return { on: c.on, count: c.count, height: c.height, spacing: c.spacing, depth: c.depth, width: length, along };
}
const cornerOn = (walls, wall) => walls.cornerShelves.on && CORNER_WALLS.includes(wall);
// The shelves on a wall: its own, or, while the L is on, its arm
const shelvesOn = (walls, wall) => (cornerOn(walls, wall) ? cornerArm(wall, walls.cornerShelves) : walls[wall].shelves);
// Whether the L meets the picture on either of its walls, or a shoe box
const cornerMeetsPicture = (walls, c) => CORNER_WALLS.some(wall => overlap(shelvesSpan(cornerArm(wall, c)), pictureSpan(walls[wall].picture)));
const cornerMeetsBox = (walls, c) => CORNER_WALLS.some(wall => boxSpansOn(walls, wall).some(span => overlap(shelvesSpan(cornerArm(wall, c)), span)));

// Every wall's, as a configuration may hold them: the shoe boxes held on
// their sills, the right one level with the left if it's kept so; the picture held to its wall; the L under the ceiling, and
// a shoe box it meets left out; on its walls the pictures giving way to it
// and to the boxes, or left out where they can't; elsewhere the shelves
// giving way to the picture and the boxes, or left out
export function settleStairWalls(walls) {
  for (const key of Object.keys(walls.shoeBoxes)) walls.shoeBoxes[key] = onTheSill(key, walls.shoeBoxes[key]);
  walls.shoeBoxes = levelled(walls.shoeBoxes);
  if (walls.cornerShelves.on) walls.cornerShelves = cornerUnderCeiling(walls.cornerShelves);
  if (walls.cornerShelves.on) {
    for (const key of Object.keys(walls.shoeBoxes)) {
      if (cornerMeetsBox({ ...walls, shoeBoxes: { [key]: walls.shoeBoxes[key] } }, walls.cornerShelves)) walls.shoeBoxes[key] = { ...walls.shoeBoxes[key], on: false };
    }
  }
  for (const wall of WALL_KEYS) {
    const { picture } = walls[wall], boxes = boxSpansOn(walls, wall);
    if (picture.on) walls[wall] = { ...walls[wall], picture: onTheWall(wall, 'picture', picture) };
    if (cornerOn(walls, wall)) {
      const kept = keepApart(wall, { shelves: cornerArm(wall, walls.cornerShelves), picture: walls[wall].picture }, 'picture', boxes);
      walls[wall] = { ...walls[wall], picture: kept ? kept.picture : { ...walls[wall].picture, on: false } };
    } else {
      const kept = keepApart(wall, walls[wall], 'shelves', boxes);
      walls[wall] = kept ?? { ...walls[wall], shelves: { ...walls[wall].shelves, on: false } };
    }
  }
}

// ---------------------------------------------------------------------------
// Drawing, in a group in the hallway's: on each wall its shelves, each a
// white board out from the wall, and its picture, a black frame with the
// white picture in it, standing just proud of it
// ---------------------------------------------------------------------------
const stairWalls = new THREE.Group();
hallway.add(stairWalls);

// A box on a wall, from `off` to `off + depth` out from its face, along it
// from a0 to a1, from z0 to z1: its two opposite corners in plan, lowest
// x and y first
function onWall({ start, dir, out }, { a0, a1, z0, z1 }, off, depth, mat) {
  const at = (a, o) => [0, 1].map(k => start[k] + a * dir[k] + o * out[k]);
  const [p, q] = [at(a0, off), at(a1, off + depth)];
  const [x0, x1] = [p[0], q[0]].sort((u, v) => u - v), [y0, y1] = [p[1], q[1]].sort((u, v) => u - v);
  return box({ from: [x0, y0, z0], to: [x1, y1, z1] }, mat, stairWalls);
}

// Shelves on a wall, along it from a0 to a1, as `s` stacks them
function shelvesAlong(wall, s, a0, a1) {
  for (let i = 0; i < s.count; i++) {
    const top = s.height + i * s.spacing;
    onWall(wall, { a0, a1, z0: top - SHELF_T, z1: top }, 0, s.depth, shelfMat);
  }
}

// The L: the TV wall's arm runs right into the corner, the WC wall's
// starts behind it, a shelf's depth out, so each shelf is one joined L
function drawCorner(c) {
  shelvesAlong(WALLS.tvWall, c, wallLength('tvWall') - c.tvLength, wallLength('tvWall'));
  shelvesAlong(WALLS.wcWall, c, c.depth, c.wcLength);
}

export function drawStairWalls(walls) {
  clearDrawing(stairWalls);
  if (walls.cornerShelves.on) drawCorner(walls.cornerShelves);
  for (const key of WALL_KEYS) {
    const wall = WALLS[key], { shelves: s, picture: p } = walls[key];
    if (!cornerOn(walls, key) && shelvesSpan(s)) shelvesAlong(wall, s, s.along - s.width / 2, s.along + s.width / 2);
    const span = pictureSpan(p);
    if (span) {
      const b = FRAME.border;
      onWall(wall, span, 0, FRAME.depth, frameMat);
      onWall(wall, { a0: span.a0 + b, a1: span.a1 - b, z0: span.z0 + b, z1: span.z1 - b }, 0, FRAME.depth + 1, pictureMat);   // 1 proud of the frame's face, so it shows
    }
  }
}

// ---------------------------------------------------------------------------
// The menu's block, built into `container`: for each wall, its shelves and
// its picture, each a switch and its sliders, then the L-shaped shelves.
// change(edits) is called with a list of [path in the hallway's settings, value];
// an edit that would put shelves and a picture on top of one another moves
// the one changed along the wall, clear of the other, or isn't made if it
// can't be (the L, fixed in its corner, isn't moved). The function
// returned puts the controls in step with the settings `s`
// ---------------------------------------------------------------------------
const noRoom = what => `No room for ${what}: make one narrower, or move one above the other, first.`;

// The controls' ids, by their paths in the hallway's settings
const id = path => `stairWalls_${path.replace(/\./g, '_')}`;
const el = path => document.getElementById(id(path));

export function stairWallsControls(container, change) {
  container.innerHTML = menuHtml();
  let shown = null;                                                    // the settings last put in the controls
  const sync = s => {
    shown = s;
    showSettings(s);
  };
  const refuse = (prefix, why) => {
    sync(shown);
    el(`${prefix}.blocked`).textContent = why;
    el(`${prefix}.blocked`).hidden = false;
  };
  // The edits that make `kept` of what's at `prefix`: each setting that differs
  const editsTo = (prefix, kept) => Object.keys(kept).filter(k => kept[k] !== valueAt(shown, `${prefix}.${k}`)).map(k => [`${prefix}.${k}`, kept[k]]);

  // One of a wall's settings changed, kept clear of the wall's other one
  // (the L's arm, where it's on)
  const edit = (wall, item, key, value) => {
    const asked = { shelves: shelvesOn(shown, wall), picture: shown[wall].picture, [item]: { ...shown[wall][item], [key]: value } };
    const kept = keepApart(wall, asked, item, boxSpansOn(shown, wall));
    if (!kept) return refuse(`${wall}.${item}`, noRoom(item === 'shelves' ? 'these shelves beside the picture or shoe box on this wall' : 'this picture beside the shelves or shoe box on this wall'));
    change(editsTo(`${wall}.${item}`, kept[item]));
  };
  // One of the L's: under the ceiling, and clear of the pictures on its walls
  const editCorner = (key, value) => {
    const asked = cornerUnderCeiling({ ...shown.cornerShelves, [key]: value });
    if (asked.on && cornerMeetsPicture(shown, asked)) return refuse('cornerShelves', noRoom('the L-shaped shelves beside the pictures on the TV and WC walls'));
    if (asked.on && cornerMeetsBox(shown, asked)) return refuse('cornerShelves', noRoom('the L-shaped shelves above the shoe boxes on the sills'));
    change(editsTo('cornerShelves', asked));
  };
  listen(edit, editCorner);
  return sync;
}

// The menu's HTML: each wall's shelves and picture, then the L
function menuHtml() {
  const sliderOf = (prefix, labelOf) => ([key, label, lo, hi, step]) => slider(id)([`${prefix}.${key}`, labelOf(key, label), lo, hi, step]);
  const switchAndBlock = (prefix, label, sliders) =>
    `<label class="switch"><input type="checkbox" id="${id(`${prefix}.on`)}"> ${label}</label>` +
    `<div class="hint" id="${id(`${prefix}.blocked`)}" hidden></div>` +
    `<div class="depth" id="${id(`${prefix}.block`)}">${sliders}</div>`;
  const itemBlock = (wall, item) => {
    const sliders = SLIDERS[item].map(([key, label, , , step]) => [key, label, ...rangeOf(wall, item, key).slice(0, 2), step])
      .map(sliderOf(`${wall}.${item}`, (key, label) => (key === 'along' ? `${label} ${WALLS[wall].alongFrom}` : label))).join('');
    const replaced = item === 'shelves' && CORNER_WALLS.includes(wall)
      ? `<div class="hint" id="${id(`${wall}.shelves.replaced`)}" hidden>The L-shaped shelves are on, in place of these (below).</div>` : '';
    return switchAndBlock(`${wall}.${item}`, item === 'shelves' ? 'Shelves' : 'A picture', sliders) + replaced;
  };
  return WALL_KEYS.map(wall =>
    `<div class="depth"><div><b>${WALLS[wall].label}</b></div><div class="hint">${WALLS[wall].where}</div>` +
    `${itemBlock(wall, 'shelves')}${itemBlock(wall, 'picture')}</div>`).join('') +
    `<div class="depth"><div><b>L-shaped shelves</b></div><div class="hint">One set of shelves along the TV wall and the WC wall, joined in the corner where they meet. While on, it takes the place of those walls’ own shelves.</div>` +
    `${switchAndBlock('cornerShelves', 'L-shaped shelves', CORNER_SLIDERS.map(sliderOf('cornerShelves', (key, label) => label)).join(''))}</div>`;
}

// The settings `s` in the controls
function showSettings(s) {
  const showSliders = (prefix, sliders, now) => {
    for (const [key] of sliders) {
      el(`${prefix}.${key}`).value = String(now[key]);
      document.getElementById(`${id(`${prefix}.${key}`)}Value`).textContent = String(now[key]);
    }
  };
  const showSwitch = (prefix, now) => {
    el(`${prefix}.on`).checked = now.on;
    el(`${prefix}.blocked`).hidden = true;
    el(`${prefix}.block`).hidden = !now.on;
  };
  for (const wall of WALL_KEYS) {
    for (const item of ITEMS) {
      showSwitch(`${wall}.${item}`, s[wall][item]);
      showSliders(`${wall}.${item}`, SLIDERS[item], s[wall][item]);
    }
    if (CORNER_WALLS.includes(wall)) {                                 // its own shelves out of use while the L is on
      const replaced = s.cornerShelves.on;
      el(`${wall}.shelves.on`).disabled = replaced;
      el(`${wall}.shelves.replaced`).hidden = !replaced;
      if (replaced) el(`${wall}.shelves.block`).hidden = true;
    }
  }
  showSwitch('cornerShelves', s.cornerShelves);
  showSliders('cornerShelves', CORNER_SLIDERS, s.cornerShelves);
}

// Each control to its edit: a wall's (edit(wall, item, key, value)) or the L's (editCorner(key, value))
function listen(edit, editCorner) {
  for (const wall of WALL_KEYS) {
    for (const item of ITEMS) {
      el(`${wall}.${item}.on`).addEventListener('change', e => edit(wall, item, 'on', e.target.checked));
      for (const [key] of SLIDERS[item]) el(`${wall}.${item}.${key}`).addEventListener('input', e => edit(wall, item, key, Number(e.target.value)));
    }
  }
  el('cornerShelves.on').addEventListener('change', e => editCorner('on', e.target.checked));
  for (const [key] of CORNER_SLIDERS) el(`cornerShelves.${key}`).addEventListener('input', e => editCorner(key, Number(e.target.value)));
}
