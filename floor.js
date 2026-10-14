// The floor plan: the walls, the door frame and the windows, drawn into
// `floor`, a group the page adds to its scene. For now only the living room's
// (PLAN.md has the floor plan to come), in its mm: x along the back wall from
// the left wall, y from the back wall towards the front, z up.
import * as THREE from 'three';
import { MM, material, box, slab } from './kit/floor_kit.js';

export const floor = new THREE.Group();

const W = 3838, D = 5379, H = 2443, WALL = 100;   // D: back wall to front wall, measured; H: ceiling, measured 2441-2446

const wallMat = material(0xf2efe9);
const floorMat = material(0xd9d3c5);
// Past the door frame the left wall steps back: a short return wall (with the
// light switch on it) and a recess for the kitchen. The kitchen's fronts are
// 405 behind the door wall and the fridge unit is 590 deep (both measured), so
// the recess's back wall is at x = -(405 + 590).
// The return wall: from the back of the sink recess (D + 372) along the left
// wall come the corner (the 610 worktop), the counter's 2125 inner edge and
// the 630 fridge cabinet (all measured), so it's at 2386, 155 past the door frame
const FRIDGE_W = 630;
const RECESS_FROM = D + 372 - 610 - 2125 - FRIDGE_W;
const KITCHEN_SETBACK = 405, KITCHEN_DEPTH = 590;
const RECESS_X = -(KITCHEN_SETBACK + KITCHEN_DEPTH);
// The floor: L-shaped, the room plus the recess. Its texture is laid by
// position, in metres, so the oak boards keep their size everywhere.
// The front wall has a full-height recess for the desk, 1623 across (measured)
// and taken to run to the right-hand wall, as deep as the alcove over the sink
// (372, measured). Between it and the sink alcove is 1490 of wall (measured).
const DESK_RECESS = { x0: W - 1623, depth: 372 };
const WALL_BETWEEN_RECESSES = 1490;
// The recess over the sink, also from the floor: from the kitchen recess's
// back wall (so the L of units turns into it) to 1490 short of the desk
// recess, 372 deep (5751 - 5379, both measured), up to about 1990 (estimated)
const SINK_RECESS = { x0: RECESS_X, x1: DESK_RECESS.x0 - WALL_BETWEEN_RECESSES, depth: 372, top: 1990 };
const DESK_TOP = 830;                                                // the desk in the recess, measured
slab([[0, 0], [W, 0], [W, D + DESK_RECESS.depth], [DESK_RECESS.x0, D + DESK_RECESS.depth], [DESK_RECESS.x0, D],
  [SINK_RECESS.x1, D], [SINK_RECESS.x1, D + SINK_RECESS.depth], [RECESS_X, D + SINK_RECESS.depth], [RECESS_X, RECESS_FROM], [0, RECESS_FROM]], -20, 0, floorMat, floor);
box(-WALL, -WALL, 0, W + WALL, 0, H, wallMat, floor, false);         // back wall
// The doorway: the frame starts 1329 from the back wall, the furthest a
// cupboard on the left wall can come. The door hinges at 1400, so the frame
// is 71 each side of the door; the far side is assumed to match. The frame
// is 2050 high and the door 1978, both measured to the floor.
const FRAME = 1329, HINGE = 1400, ROOM_DOOR = 760, JAMB = HINGE - FRAME;
const FRAME_H = 2050, ROOM_DOOR_H = 1978;
const FRAME_END = HINGE + ROOM_DOOR + JAMB;                          // 2231
const frameMat = material(0xffffff);
box(-WALL, 0, 0, 0, FRAME, H, wallMat, floor, false);                // left wall, behind the doorway
box(-WALL, FRAME_END, 0, 0, RECESS_FROM, H, wallMat, floor, false);  // left wall, past the doorway to the return
box(RECESS_X - WALL, RECESS_FROM - WALL, 0, 0, RECESS_FROM, H, wallMat, floor, false); // the return wall, facing the front
box(RECESS_X - WALL, RECESS_FROM, 0, RECESS_X, D + SINK_RECESS.depth, H, wallMat, floor, false);   // the recess's back wall, on into the sink recess
box(-WALL, FRAME, FRAME_H, 0, FRAME_END, H, wallMat, floor, false);     // over the doorway
box(-WALL, FRAME, 0, 0, HINGE, FRAME_H, frameMat, floor);               // frame, hinge side
box(-WALL, FRAME_END - JAMB, 0, 0, FRAME_END, FRAME_H, frameMat, floor); // frame, far side
box(-WALL, HINGE, ROOM_DOOR_H, 0, FRAME_END - JAMB, FRAME_H, frameMat, floor); // frame head, down to the door

// The ceiling, white, with six downlights. It faces down only, so from above
// (the corner and top views) it can't be seen and the room stays open.
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xedece7, roughness: 0.9, side: THREE.FrontSide });
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry((W - RECESS_X) * MM, D * MM), ceilingMat);
ceiling.rotation.x = Math.PI / 2;                                   // facing down
ceiling.position.set((W + RECESS_X) / 2 * MM, H * MM, D / 2 * MM);
floor.add(ceiling);
const downlightMat = new THREE.MeshBasicMaterial({ color: 0xfff6e0, side: THREE.FrontSide });
for (const x of [960, 1920, 2880]) {
  for (const y of [1500, 3700]) {
    const light = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), downlightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(x * MM, H * MM - 0.002, y * MM);
    floor.add(light);
  }
}

// The outer (right-hand) wall, seen only from inside like the front wall, with
// three windows and a radiator under each. Window recesses (measured): 923
// wide, 1390 high, 207 deep, sills at 912, starting 734, 2446 and 4137 from
// the back wall. Radiators (measured): 600 wide, 600 high, 100 thick, 240 off
// the floor, their fronts 132 out from the wall; centred under the windows
// (assumed).
const OUTER = {
  end: D + 372,                                  // the wall runs on past the desk recess
  windows: [734, 2446, 4137].map(y => ({ y: [y, y + 923] })),   // where each recess starts
  sill: 912, top: 912 + 1390, reveal: 207,      // sill height measured
  radiator: { width: 600, bottom: 240, top: 840, out: 132, thick: 100 },
};
{
  const { end, windows, sill, top, reveal, radiator } = OUTER;
  const intoRoom = Math.PI / -2;                 // a face at x = W looking back into the room
  const face = (w, h, mat, y, z, x = W, turn = [0, intoRoom]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * MM, h * MM), mat);
    m.position.set(x * MM, z * MM, y * MM);
    m.rotation.set(turn[0], turn[1], 0);
    m.receiveShadow = true;
    floor.add(m);
  };
  face(end, sill, wallMat, end / 2, sill / 2);                      // below the windows
  face(end, H - top, wallMat, end / 2, (top + H) / 2);              // above them
  const edges = [0, ...windows.flatMap(w => w.y), end];             // the wall between them
  for (let k = 0; k < edges.length; k += 2) face(edges[k + 1] - edges[k], top - sill, wallMat, (edges[k] + edges[k + 1]) / 2, (sill + top) / 2);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfe3ef, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6, side: THREE.DoubleSide });

  // The outside of this wall, 300 out from the inside face (the thickness is
  // estimated; the recesses are 207 to the glass). It faces outwards only, so
  // it shows when looking in from outside and not from inside. Brick colour
  // is a placeholder.
  const OUT = W + 300, outward = [0, Math.PI / 2];
  const brickMat = material(0xa0614a);
  face(end + WALL, sill, brickMat, (end - WALL) / 2, sill / 2, OUT, outward);
  face(end + WALL, H - top + 200, brickMat, (end - WALL) / 2, (top + H + 200) / 2, OUT, outward);   // up past the ceiling a little
  const outEdges = [-WALL, ...windows.flatMap(w => w.y), end];
  for (let k = 0; k < outEdges.length; k += 2) face(outEdges[k + 1] - outEdges[k], top - sill, brickMat, (outEdges[k] + outEdges[k + 1]) / 2, (sill + top) / 2, OUT, outward);
  for (const { y: [y0, y1] } of windows) {                         // the outer reveals, from the glass out
    const t = OUT - W - reveal, mid = (y0 + y1) / 2;
    face(t, top - sill, brickMat, y0, (sill + top) / 2, W + reveal + t / 2, [0, 0]);
    face(t, top - sill, brickMat, y1, (sill + top) / 2, W + reveal + t / 2, [0, Math.PI]);
    face(t, y1 - y0, brickMat, mid, top, W + reveal + t / 2, [Math.PI / 2, 0]);
    face(t, y1 - y0, brickMat, mid, sill, W + reveal + t / 2, [-Math.PI / 2, 0]);
  }
  const radMat = material(0xf6f6f4);
  for (const { y: [y0, y1] } of windows) {
    const mid = (y0 + y1) / 2, wide = y1 - y0;
    face(wide, top - sill, glassMat, mid, (sill + top) / 2, W + reveal);                       // glass, at the back of the reveal
    face(reveal, top - sill, wallMat, y0, (sill + top) / 2, W + reveal / 2, [0, 0]);          // reveal sides, facing into the opening
    face(reveal, top - sill, wallMat, y1, (sill + top) / 2, W + reveal / 2, [0, Math.PI]);
    face(reveal, wide, wallMat, mid, top, W + reveal / 2, [Math.PI / 2, 0]);                  // reveal top, facing down
    box(W - 30, y0 - 30, sill - 25, W + reveal, y1 + 30, sill, frameMat, floor);               // window sill
    box(W - radiator.out, mid - radiator.width / 2, radiator.bottom, W - radiator.out + radiator.thick, mid + radiator.width / 2, radiator.top, radMat, floor);  // radiator
  }
}

export { W, D, H, WALL, wallMat, floorMat, FRIDGE_W, RECESS_FROM, KITCHEN_SETBACK, KITCHEN_DEPTH, RECESS_X, DESK_RECESS, WALL_BETWEEN_RECESSES, SINK_RECESS, DESK_TOP, FRAME, HINGE, ROOM_DOOR, JAMB, FRAME_H, ROOM_DOOR_H, FRAME_END, frameMat, ceilingMat, ceiling, downlightMat, OUTER };
