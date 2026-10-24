// A dining table to try in the living room with the user's four Foxglove
// chairs (asked for, 24 Oct 2026): neither kitchen table is long enough
// for two of them side by side, so this finds the size of table they
// need. Rectangular, two chairs on each long side, or round on a
// pedestal, a chair on each quarter; its size from sliders, the chairs
// tucked in or pulled out, and a sentence saying whether they fit.
// flat_model.js says where it stands.
import * as THREE from 'three';
import { MM, box, material, slab } from './kit/floor_kit.js';

// The Foxglove winged button-back chair (The Cotswold Company), in the
// user's dark blue: w across its wings, d front to back and h to the top
// of its back, the maker's. The rest estimated from the photos: the seat
// is narrower than the wings, its top and cushion, the oak legs, the
// back's thickness, how far forward the wings come and where they start
export const FOXGLOVE = { w: 520, d: 550, h: 970, seatW: 460, seatH: 480, cushion: 110, leg: 40, back: 90, wingD: 150, wingFrom: 640 };
// The chairs' upholstery, its own colour target (model/colours.js), and their oak legs
export const chairMat = material(0x1f2b45);
const legMat = material(0xc8a26b);                 // as the cupboards' oak shelves
const tableMat = material(0xc99a62);               // an oak top, as Cornwall's

// The table: its height and the top's thickness, a usual dining table's;
// the rectangular one's legs, how far they stand in from the top's edges
// and the rail under the top; the round one's pedestal and its foot. All
// estimated, as such tables are made
export const DINING_TABLE = { H: 760, top: 30, leg: 70, inset: 30, rail: 80, column: 140, foot: 560, footT: 40 };
export const DINING_SHAPES = ['rectangular', 'round'];

// Sitting at it, chosen: the gap between two chairs side by side (room
// to get in and out), and the room the seats want each side of them
// between the legs; how far a tucked-in seat goes under the top; how far
// back a chair pulled out stands, its back then about 1000 out from the
// table's edge, the usual allowance to get up and past
const CHAIR_GAP = 100, LEG_ROOM = 40, TUCK = 150, PULL_OUT = 600;
// The usual guidance: the edge each person wants round a table, and the
// width two people facing across it want
const ELBOW_ROOM = 700, FACING_MIN = 800;
const CIRCLE_POINTS = 64;                          // enough for a smooth edge

// A chair, its seat's front middle at the origin, facing +y (box()'s
// out): x across it, y forward, z up
function foxglove() {
  const { w, d, h, seatW, seatH, cushion, leg, back, wingD, wingFrom } = FOXGLOVE;
  const g = new THREE.Group(), half = seatW / 2, wingHalf = w / 2, rear = -d;
  for (const x of [-half, half - leg]) {
    box({ from: [x, -leg, 0], to: [x + leg, 0, seatH - cushion] }, legMat, g);              // a front leg
    box({ from: [x, rear, 0], to: [x + leg, rear + leg, seatH - cushion] }, legMat, g);     // a back leg
  }
  box({ from: [-half, rear + back, seatH - cushion], to: [half, 0, seatH] }, chairMat, g);  // the seat
  box({ from: [-half, rear, seatH - cushion], to: [half, rear + back, wingFrom] }, chairMat, g);   // the back, up to the wings
  box({ from: [-wingHalf, rear, wingFrom], to: [wingHalf, rear + back, h] }, chairMat, g);  // ...and from them, as wide as they are
  for (const x of [-wingHalf, wingHalf - back / 2]) {
    box({ from: [x, rear + back, wingFrom], to: [x + back / 2, rear + back + wingD, h - back] }, chairMat, g);   // a wing
  }
  return g;
}

// A circle's outline in plan, for slab()
const circle = r => Array.from({ length: CIRCLE_POINTS }, (_, i) => {
  const a = i / CIRCLE_POINTS * 2 * Math.PI;
  return [r * Math.cos(a), r * Math.sin(a)];
});

// The tables, their middle at the origin: x along the length, y across
function rectangularTable(g, { length: L, width: W }) {
  const { H, top, leg, inset, rail } = DINING_TABLE, under = H - top;
  box({ from: [-L / 2, -W / 2, under], to: [L / 2, W / 2, H] }, tableMat, g);               // the top
  const x1 = L / 2 - inset, y1 = W / 2 - inset;
  for (const x of [-x1, x1 - leg]) for (const y of [-y1, y1 - leg]) box({ from: [x, y, 0], to: [x + leg, y + leg, under] }, tableMat, g);   // a leg
  for (const y of [-y1, y1 - 20]) box({ from: [-x1 + leg, y, under - rail], to: [x1 - leg, y + 20, under] }, tableMat, g);              // the long rails
  for (const x of [-x1, x1 - 20]) box({ from: [x, -y1 + leg, under - rail], to: [x + 20, y1 - leg, under] }, tableMat, g);              // ...and the ends
}
function roundTable(g, { diameter }) {
  const { H, top, column, foot, footT } = DINING_TABLE;
  slab(circle(diameter / 2), H - top, H, tableMat, g);          // the top
  slab(circle(column / 2), footT, H - top, tableMat, g);        // the pedestal
  slab(circle(foot / 2), 0, footT, tableMat, g);                // its foot
}

// Where the chairs go: each its side's way out from the middle (an angle,
// 0 along +y), how far out its seat's front is, and how far along that
// side from its middle
function chairPlaces(shape, sizes, pulledOut) {
  const back = pulledOut ? PULL_OUT : 0, pitch = FOXGLOVE.w + CHAIR_GAP;
  if (shape === 'round') {
    const out = sizes.diameter / 2 - TUCK + back;
    return [0, 90, 180, 270].map(deg => ({ angle: THREE.MathUtils.degToRad(deg), out, along: 0 }));
  }
  const out = sizes.width / 2 - TUCK + back;
  return [0, 180].flatMap(deg => [-pitch / 2, pitch / 2].map(along => ({ angle: THREE.MathUtils.degToRad(deg), out, along })));
}

// The table and its four chairs, the table's middle at the origin, its
// length along x
export function diningTable(shape, sizes, { pulledOut = false } = {}) {
  const g = new THREE.Group();
  (shape === 'round' ? roundTable : rectangularTable)(g, sizes);
  for (const { angle, out, along } of chairPlaces(shape, sizes, pulledOut)) {
    const chair = foxglove(), s = Math.sin(angle), c = Math.cos(angle);
    chair.position.set((s * out + c * along) * MM, 0, (c * out - s * along) * MM);
    chair.rotation.y = angle + Math.PI;                         // facing the table's middle
    g.add(chair);
  }
  return g;
}

// Whether the chairs fit, as a sentence: round, the edge each person gets;
// rectangular, the room between the legs for two seats side by side, and
// the width for two people facing
export function chairsFit(shape, sizes) {
  if (shape === 'round') {
    const each = Math.round(Math.PI * sizes.diameter / 4), least = Math.ceil(4 * ELBOW_ROOM / Math.PI);
    const verdict = each >= ELBOW_ROOM ? 'enough' : `short of the ${ELBOW_ROOM} usually wanted: it needs ${least} across`;
    return `Round, its four chairs get ${each} of its edge each, ${verdict}.`;
  }
  const { leg, inset } = DINING_TABLE, pitch = FOXGLOVE.w + CHAIR_GAP;
  const between = sizes.length - 2 * (inset + leg), need = pitch + FOXGLOVE.seatW + 2 * LEG_ROOM, spare = between - need;
  const legs = spare >= 0 ? `${spare} to spare` : `${-spare} short: it needs to be ${sizes.length - spare} long`;
  const across = sizes.width >= FACING_MIN ? '' : ` At ${sizes.width} wide it's narrow for two facing (${FACING_MIN} usually).`;
  return `Between its legs there's ${between}; two chairs side by side, ${CHAIR_GAP} apart, need ${need}: ${legs}.${across}`;
}
