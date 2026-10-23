// Arranging a room in Plan, the lounge or the bedroom (a piece of
// living_room.js): tap a piece to
// select it, drag it to move it, drop it on the picker to take it out,
// drag one in from the picker, turn it, and long-press the sofa to resize
// it. A tap on something painted (the walls, the floor, the cupboards)
// selects it for its colour. Pieces snap to the walls and never go
// through them; one overlapping another shows red, but isn't stopped.
// On the desktop the mouse does the same, a double-click resizes the sofa,
// and the keys: Delete takes out, R turns, the arrows nudge, Esc lets go.
import { SOFAS, SOFA_SLIDERS, config, sofaOwnSize } from '../../flat_model.js';
import { boxesMeet } from '../../kit/shape_kit.js';
import { MM } from '../../kit/floor_kit.js';
import { renderer, change, drawSoon, viewKit } from '../../living_room.js';
import { SOFA, inRoom, roomOf, wallsOf, floorBox, facing } from './furniture.js';
import { planPoint, hitsUnder, pieceOf, colourTargetOf, screenOf } from './picking.js';
import { select, deselect, selection, setActions, setOverlapping, setOverlapCheck } from './selection.js';
import { modeNow, toast, setIn, overPicker, markDropOut, classic } from './shell.js';
import { openColours, TARGET_NAMES } from './colour_sheet.js';
import { optionsFor, thingOf } from './options.js';

const canvas = renderer.domElement;
const SNAP = 50;                   // mm: a piece this near a wall goes against it (chosen)
const STEP = 10;                   // mm: where a dragged piece stops, as the sliders' finest steps
const NUDGE = 10, BIG_NUDGE = 100; // mm an arrow key moves one, with Shift (chosen)
const DRAG_START_PX = 8;           // a finger's wobble on a tap stays under it (chosen)
const LONG_PRESS_MS = 500;         // as phones' own long-press
const SOFA_SNAP = 40;              // mm: resizing, the sofa's own width catches within this (chosen)
const roundTo = (n, step) => Math.round(n / step) * step;
const QUARTER = 90;

// ---------------------------------------------------------------------------
// Keeping a piece in its room: a move (dx, dy, in mm) for a footprint held
// so it stays inside the walls, and goes against one it's near
// ---------------------------------------------------------------------------
function heldInRoom(piece, box, dx, dy) {
  const ROOM = wallsOf(piece.room);
  const hold = (d, lo, hi, min, max) => {
    if (lo + d < min || Math.abs(lo + d - min) < SNAP) return min - lo;
    if (hi + d > max || Math.abs(max - hi - d) < SNAP) return max - hi;
    return d;
  };
  return { dx: hold(dx, box.x0, box.x1, ROOM.x0, ROOM.x1), dy: hold(dy, box.y0, box.y1, ROOM.y0, ROOM.y1) };
}
// The settings' edits for a piece moved by (dx, dy) from where it stands
// (a piece on a wall goes against the one nearest)
const movedBy = (piece, dx, dy) => {
  const { x, y, turn } = piece.spot();
  return piece.moveTo({ x: Math.round(x + dx), y: Math.round(y + dy), turn });
};
// Where a piece's spot is in the living room's mm, which footprints are in
const inWorld = (piece, { x, y, turn }) => ({ x: x + roomOf(piece).origin.x, y: y + roomOf(piece).origin.y, turn });
const canTakeOut = piece => Boolean(piece.on);
// After a change that may have left a piece through a wall (turned, or
// dropped in): moved back in, in the same history entry
function keepInRoom(piece) {
  const object = piece.object();
  if (!object) return;
  const box = floorBox(object), { dx, dy } = heldInRoom(piece, box, 0, 0);
  if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) change(movedBy(piece, dx, dy));
}
// The other pieces' footprints, to see if one being moved overlaps them
const othersBoxes = piece => inRoom(piece.room).filter(p => p !== piece).map(p => floorBox(p.object()));
const meets = (a, b) => boxesMeet([[a.x0, a.x1], [a.y0, a.y1]], [[b.x0, b.x1], [b.y0, b.y1]]);
setOverlapCheck((piece, box) => othersBoxes(piece).some(o => meets(box, o)));

// ---------------------------------------------------------------------------
// The action bar's actions (selection.js shows those that can be used)
// ---------------------------------------------------------------------------
// Turned a quarter about its middle: its back's middle is its middle less
// half its depth, the way it faces
function turn(piece) {
  const object = piece.object(), b = floorBox(object), { x, y, turn: t } = inWorld(piece, piece.spot());
  const mid = { x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2 }, f = facing(t);
  const halfDepth = (mid.x - x) * f.x + (mid.y - y) * f.y;
  const t2 = (t + QUARTER) % 360, f2 = facing(t2), { origin } = roomOf(piece);
  change(piece.moveTo({ x: Math.round(mid.x - f2.x * halfDepth - origin.x), y: Math.round(mid.y - f2.y * halfDepth - origin.y), turn: t2 }));
  keepInRoom(piece);
}
function takeOut(piece) {
  deselect();
  setIn(piece, false, `${piece.name} taken out`);
}
setActions({
  // one on a wall faces out from it, so it's turned by moving it to another
  turn: { can: sel => Boolean(sel.piece && !sel.piece.fixed && !sel.piece.onWall), do: sel => turn(sel.piece) },
  remove: { can: sel => Boolean(sel.piece && canTakeOut(sel.piece)), do: sel => takeOut(sel.piece) },
  resize: { can: sel => sel.piece === SOFA, do: () => startResize() },
  colour: { can: sel => Boolean(sel.surface), do: sel => openColours(sel.surface) },
  options: { can: sel => Boolean(sel.piece && thingOf(sel.piece.object())), do: sel => optionsFor(sel.piece.object()) },
});

// ---------------------------------------------------------------------------
// Pressing on the room in Plan: a piece is picked up (the plan doesn't pan
// under it); anything else is a tap to select or let go, and pans as before
// ---------------------------------------------------------------------------
const inPlan = () => !classic && modeNow() === 'plan';
let press = null;
canvas.addEventListener('pointerdown', e => {
  if (!inPlan() || e.button > 0 || press) return;
  const hit = hitsUnder(e)[0], piece = hit ? pieceOf(hit.object, viewKit.room) : null;
  press = { id: e.pointerId, x: e.clientX, y: e.clientY, piece, hit, dragging: false, longPressed: false };
  if (!piece) {
    // A long-press on anything else: its options (the plan pans as before if it's dragged)
    if (hit) press.timer = setTimeout(() => { press.longPressed = true; optionsFor(hit.object); }, LONG_PRESS_MS);
    return;
  }
  e.stopImmediatePropagation();                                  // the plan stays still
  canvas.setPointerCapture(e.pointerId);
  const object = piece.object();
  Object.assign(press, { from: planPoint(e), box: floorBox(object), at: object.position.clone(), others: othersBoxes(piece), dx: 0, dy: 0 });
  // A long-press: the sofa's resize handles (its options are on the action
  // bar), any other piece's options
  press.timer = setTimeout(() => {
    press.longPressed = true;
    if (piece === SOFA) { select({ piece }); startResize(); } else optionsFor(object);
  }, LONG_PRESS_MS);
}, { capture: true });

canvas.addEventListener('pointermove', e => {
  if (!press || e.pointerId !== press.id) return;
  if (!press.dragging && Math.hypot(e.clientX - press.x, e.clientY - press.y) < DRAG_START_PX) return;
  clearTimeout(press.timer);
  if (!press.piece || resizing || press.longPressed) return;
  e.stopImmediatePropagation();
  if (!press.dragging) {
    press.dragging = true;
    if (selection()?.piece !== press.piece) select({ piece: press.piece });
  }
  dragTo(e);
}, { capture: true });

// The piece under the finger, moved in the scene as it's dragged (the
// settings change once, as it's let go)
function dragTo(e) {
  const p = planPoint(e), { box, at: start, others, piece } = press;
  const { dx, dy } = heldInRoom(piece, box, roundTo(p.x - press.from.x, STEP), roundTo(p.y - press.from.y, STEP));
  Object.assign(press, { dx, dy });
  piece.object().position.set(start.x + dx * MM, start.y, start.z + dy * MM);
  const moved = { x0: box.x0 + dx, x1: box.x1 + dx, y0: box.y0 + dy, y1: box.y1 + dy };
  setOverlapping(others.some(o => meets(moved, o)));
  markDropOut(canTakeOut(piece) && overPicker(e));
  drawSoon();
}

window.addEventListener('pointerup', e => {
  if (!press || e.pointerId !== press.id) return;
  const { piece, hit, dragging, longPressed, dx, dy } = press;
  clearTimeout(press.timer);
  press = null;
  markDropOut(false);
  setOverlapping(false);
  if (dragging) {
    if (canTakeOut(piece) && overPicker(e)) takeOut(piece);
    else if (dx || dy) change(movedBy(piece, dx, dy));
    return;
  }
  if (longPressed) return;
  if (piece) return select({ piece });
  const target = hit ? colourTargetOf(hit.object) : null;
  if (target) return select({ surface: { target, object: hit.object, name: TARGET_NAMES[target] } });
  if (!resizing) deselect();
});
window.addEventListener('pointercancel', () => { if (press) clearTimeout(press.timer); press = null; });

// The desktop's stand-ins for a long-press: a double-click on the sofa resizes it
canvas.addEventListener('dblclick', e => {
  if (!inPlan()) return;
  const hit = hitsUnder(e)[0];
  if (hit && pieceOf(hit.object, viewKit.room) === SOFA) { select({ piece: SOFA }); startResize(); }
});
canvas.addEventListener('contextmenu', e => { if (inPlan() && selection()) e.preventDefault(); });

// ---------------------------------------------------------------------------
// Dragging a piece in from the picker (shell.js): its icon follows the
// finger, and where it's let go in the room the piece stands, its middle
// there, turned as it was last
// ---------------------------------------------------------------------------
function dragFromPicker(piece, e, ensurePlan) {
  ensurePlan();
  const ghost = document.createElement('div');
  ghost.className = 'dragGhost';
  ghost.innerHTML = `<i class="ti ti-${piece.icon}" aria-hidden="true"></i>`;
  document.body.append(ghost);
  const place = m => { ghost.style.left = `${m.clientX}px`; ghost.style.top = `${m.clientY}px`; markDropOut(overPicker(m)); };
  place(e);
  const up = u => {
    window.removeEventListener('pointermove', place);
    window.removeEventListener('pointerup', up);
    ghost.remove();
    markDropOut(false);
    if (overPicker(u) || modeNow() !== 'plan') return;
    dropIn(piece, planPoint(u));
  };
  window.addEventListener('pointermove', place);
  window.addEventListener('pointerup', up);
}
// p: where it's let go, in the living room's mm. Its back's middle goes
// there first, then the piece is moved so its middle is (one on a wall
// stays against the wall nearest)
function dropIn(piece, p) {
  const { origin } = roomOf(piece);
  setIn(piece, true, `${piece.name} put in`, piece.moveTo({ x: Math.round(p.x - origin.x), y: Math.round(p.y - origin.y), turn: piece.spot().turn }));
  const object = piece.object();
  if (!object) return;
  if (!piece.onWall) {
    const b = floorBox(object);
    const { dx, dy } = heldInRoom(piece, b, p.x - (b.x0 + b.x1) / 2, p.y - (b.y0 + b.y1) / 2);
    change(movedBy(piece, dx, dy));
  }
  select({ piece });
}

// ---------------------------------------------------------------------------
// Resizing the sofa: a round handle at each end; dragging one widens or
// narrows it about its middle, in 10s, within its slider's range, catching
// at its own width. It's stretched in the scene as it's dragged, and the
// setting changes as it's let go
// ---------------------------------------------------------------------------
const [, , SOFA_MIN_W, SOFA_MAX_W] = SOFA_SLIDERS.find(([k]) => k === 'w');
const handles = document.getElementById('resizeHandles'), readout = document.getElementById('resizeReadout');
let resizing = false;
function startResize() {
  resizing = true;
  handles.hidden = false;
  readout.hidden = true;
  navigator.vibrate?.(15);
}
function stopResize() {
  resizing = false;
  handles.hidden = true;
  readout.hidden = true;
}
// The sofa's width runs along x, or along y once it's turned a quarter
const alongX = () => SOFA.spot().turn % 180 === 0;
// The handles kept at the sofa's ends, each frame while resizing
(function placeHandles() {
  requestAnimationFrame(placeHandles);
  if (!resizing) return;
  if (selection()?.piece !== SOFA || modeNow() !== 'plan') return stopResize();
  const b = floorBox(SOFA.object());
  const ends = alongX() ? [[b.x0, (b.y0 + b.y1) / 2], [b.x1, (b.y0 + b.y1) / 2]] : [[(b.x0 + b.x1) / 2, b.y0], [(b.x0 + b.x1) / 2, b.y1]];
  [...handles.children].forEach((h, i) => {
    const s = screenOf(ends[i][0], ends[i][1], b.top);
    h.style.left = `${s.x}px`;
    h.style.top = `${s.y}px`;
  });
})();
handles.addEventListener('pointerdown', e => {
  const handle = e.target.closest('.handle');
  if (!handle) return;
  e.stopPropagation();
  handle.setPointerCapture(e.pointerId);
  const side = handle.dataset.side === 'start' ? -1 : 1, from = planPoint(e), startW = config.pieces.sofa.design.w;
  const own = sofaOwnSize(SOFAS[config.pieces.sofa.design.model]).w, object = SOFA.object();
  let w = startW;
  const move = m => {
    const p = planPoint(m), along = alongX() ? p.x - from.x : p.y - from.y;
    w = Math.min(SOFA_MAX_W, Math.max(SOFA_MIN_W, roundTo(startW + 2 * side * along, STEP)));
    if (Math.abs(w - own) < SOFA_SNAP) w = own;
    object.scale.x = w / startW;
    readout.hidden = false;
    readout.textContent = `${w} mm${w === own ? ' (its own)' : ''}`;
    readout.style.left = handle.style.left;
    readout.style.top = handle.style.top;
    drawSoon();
  };
  const up = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    readout.hidden = true;
    if (w !== startW) change([['pieces.sofa.design.w', w]]);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
});

// ---------------------------------------------------------------------------
// The keys, on the desktop, while something's selected in Plan
// ---------------------------------------------------------------------------
const ARROWS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
window.addEventListener('keydown', e => {
  const piece = selection()?.piece;
  if (!inPlan() || e.target.closest?.('input, select, textarea')) return;
  if (e.key === 'Escape') { stopResize(); deselect(); return; }
  if (!piece) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && canTakeOut(piece)) { e.preventDefault(); takeOut(piece); }
  else if (e.key.toLowerCase() === 'r' && !piece.fixed && !piece.onWall && !e.metaKey && !e.ctrlKey) turn(piece);
  else if (ARROWS[e.key] && !piece.fixed) {
    e.preventDefault();
    const step = e.shiftKey ? BIG_NUDGE : NUDGE, [sx, sy] = ARROWS[e.key];
    const { dx, dy } = heldInRoom(piece, floorBox(piece.object()), sx * step, sy * step);
    change(movedBy(piece, dx, dy));
  }
});

export { dragFromPicker, stopResize };
export { deselect } from './selection.js';
