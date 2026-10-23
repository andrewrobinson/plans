// A hinged door in plan, for any room: where it is at an angle, the floor
// it sweeps, how far it opens before it meets something, and its swing
// marked on the floor. Worked in whatever plan coordinates the room gives
// (its mm, two numbers a point), so a room only says where its door is.
//
// A door is hinged at `hinge`, `width` long from the hinge to its free
// edge and `thick` thick. Shut, it runs from the hinge along `shut` (a
// unit vector); it opens by turning `turn` (+1 anticlockwise, -1
// clockwise, in the room's plan) up to `stopsAt` degrees, where it meets a
// wall. Its leading face, the side it swings towards, runs through the
// hinge; its thickness trails behind.
import * as THREE from 'three';
import { MM } from './floor_kit.js';
import { overlap, clip } from './shape_kit.js';

// Every door's opening is tried in whole degrees, as the doors' sliders
// set them (chosen, 23 Oct 2026: one step for every door)
export const OPEN_STEP = 1;
const DEGREE = Math.PI / 180;
const NEAR = 1e-9;                   // what rounding can leave of a point on a line

const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const plus = (p, u, k = 1) => [p[0] + k * u[0], p[1] + k * u[1]];

export function planDoor({ hinge, width, thick = 0, shut, turn, stopsAt = 180 }) {
  const sideways = [-turn * shut[1], turn * shut[0]];             // the way it swings from shut: shut turned a quarter `turn`
  // Unit vectors at `deg` open: along the door from its hinge, and ahead of its leading face
  const along = deg => {
    const a = deg * DEGREE;
    return plus([Math.cos(a) * shut[0], Math.cos(a) * shut[1]], sideways, Math.sin(a));
  };
  const lead = deg => along(deg + 90);
  const edge = deg => plus(hinge, along(deg), width);             // the free edge, on the leading face

  // A point's place against the door at `deg`: how far ahead of its leading
  // face (`ahead`), and how far out along it from the hinge (`out`)
  const at = deg => {
    const u = along(deg), l = lead(deg), rel = p => [p[0] - hinge[0], p[1] - hinge[1]];
    return { ahead: p => dot(rel(p), l), out: p => dot(rel(p), u) };
  };

  // The door's outline at `deg`: its leading face, then its back
  const outline = deg => {
    const u = along(deg), back = lead(deg);
    return [hinge, plus(hinge, u, width), plus(plus(hinge, u, width), back, -thick), plus(hinge, back, -thick)];
  };

  // The floor its leading face sweeps opening from shut to `deg`: the hinge,
  // then its free edge each OPEN_STEP round the arc
  const swept = deg => {
    const points = [hinge];
    for (let a = 0; a < deg; a += OPEN_STEP) points.push(edge(a));
    points.push(edge(deg));
    return points;
  };

  // How far along the unit vector `toward` the swept floor reaches, opened
  // from shut to `deg`, over the part of the floor where p·n <= c (a
  // half-plane, as the floor up to a cupboard's front): null if none of it
  // is there. The sweep is a sector, so the furthest is at a corner of
  // what's left of it (the hinge, the free edge shut and at `deg`, where
  // either edge or the arc crosses the line), or where the arc is furthest
  // along `toward`.
  const reach = (deg, toward, n, c) => {
    const opened = deg * DEGREE, rim = a => plus(hinge, along(a / DEGREE), width);
    const onArc = a => a >= -NEAR && a <= opened + NEAR;
    const points = [hinge, edge(0), edge(deg)];
    const furthest = Math.atan2(dot(toward, sideways), dot(toward, shut));     // the arc's angle furthest along `toward`
    if (onArc(furthest)) points.push(rim(furthest));
    // Where the arc crosses the line: A cos a + B sin a = K
    const A = dot(shut, n), B = dot(sideways, n), K = (c - dot(hinge, n)) / width, R = Math.hypot(A, B);
    if (R > 0 && Math.abs(K) <= R) {
      const phi = Math.atan2(B, A), spread = Math.acos(K / R);
      for (const a of [phi + spread, phi - spread]) {
        const wrapped = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (onArc(wrapped)) points.push(rim(wrapped));
      }
    }
    // Where either edge of the sweep crosses it
    for (const u of [along(0), along(deg)]) {
      const across = dot(u, n);
      if (across === 0) continue;
      const s = (c - dot(hinge, n)) / across;
      if (s >= 0 && s <= width) points.push(plus(hinge, u, s));
    }
    const there = points.filter(p => dot(p, n) <= c + NEAR).map(p => dot(p, toward));
    return there.length ? Math.max(...there) : null;
  };

  // How far it opens, in OPEN_STEPs, before `blocked(deg)` (or its stop)
  const opensTo = blocked => {
    let deg = 0;
    while (deg + OPEN_STEP <= stopsAt && !blocked(deg + OPEN_STEP)) deg += OPEN_STEP;
    return deg;
  };

  // How far past its free edge, out along the door at `deg`, the convex
  // outline `shape` is where it's in line with the door (within its
  // thickness): below 0, it overlaps the door by that much; Infinity if
  // it's never in line with it
  const clearBeyond = (deg, shape) => {
    const { ahead, out } = at(deg);
    const inLine = clip(clip(shape, p => -ahead(p)), p => ahead(p) + thick);
    return inLine.length ? Math.min(...inLine.map(out)) - width : Infinity;
  };

  return { hinge, width, thick, stopsAt, along, at, outline, swept, reach, opensTo, clearBeyond,
    opensClearOf: shape => opensTo(deg => overlap(outline(deg), shape)) };
}

// The swing opened to `deg` marked on the floor in `material`, `lift` above
// it so it shows: lying flat in the room's group, its plan's x and y as
// the room's
export function swingMark(door, deg, material, lift) {
  const outline = new THREE.Shape();
  door.swept(deg).forEach(([x, y], i) => (i ? outline.lineTo(x * MM, y * MM) : outline.moveTo(x * MM, y * MM)));
  const mark = new THREE.Mesh(new THREE.ShapeGeometry(outline), material);
  mark.rotation.x = Math.PI / 2;                                   // lying flat: the shape's y along the room's
  mark.position.y = lift * MM;
  return mark;
}
