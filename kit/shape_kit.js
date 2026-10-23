// Shapes meeting, for any room: ranges and boxes (as [lo, hi] along each
// axis), and convex outlines in plan, with clipping. Touching isn't
// meeting (chosen, 23 Oct 2026): two things meet only where they overlap,
// by more than `gap` if a negative one is given, or come within `gap` of
// each other if a positive one is.

// Whether the ranges [a0, a1] and [b0, b1] meet
export const rangesMeet = ([a0, a1], [b0, b1], gap = 0) => a0 < b1 + gap && b0 < a1 + gap;

// Whether two boxes meet: each a list of ranges, one along each axis
export const boxesMeet = (a, b, gap = 0) => a.every((range, axis) => rangesMeet(range, b[axis], gap));

// A three.js Box3's ranges along `axes` (as 'xz', its plan; or 'xyz')
export const rangesOf = (box, axes) => [...axes].map(k => [box.min[k], box.max[k]]);

// Whether two convex outlines overlap: they don't if some edge of either
// has the other wholly on its far side (separating axes)
export function overlap(p, q) {
  for (const poly of [p, q]) {
    for (let i = 0; i < poly.length; i++) {
      const [x0, y0] = poly[i], [x1, y1] = poly[(i + 1) % poly.length], axis = [y0 - y1, x1 - x0];
      const span = pts => pts.map(([x, y]) => x * axis[0] + y * axis[1]);
      const sp = span(p), sq = span(q);
      if (Math.max(...sp) <= Math.min(...sq) || Math.max(...sq) <= Math.min(...sp)) return false;
    }
  }
  return true;
}

// An outline less the part where f < 0, f being straight (Sutherland-Hodgman)
export function clip(points, f) {
  const out = [];
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length], fp = f(p), fq = f(q);
    if (fp >= 0) out.push(p);
    if (fp * fq < 0) {
      const t = fp / (fp - fq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  });
  return out;
}
