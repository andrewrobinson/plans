// The built-in views (a piece of living_room.js): each room's plan and
// 2D walls, the room's own views, and Packing.
import { MM } from '../kit/floor_kit.js';
import { garage, GARAGE, GARAGE_CORNER } from '../garage.js';
import { ROOM_BOXES, cornerTooShallow, cupboardSettings, diagonal, config } from '../flat_model.js';
import { OTHER_ROOM, OTHER_ROOM_CORNER, HALLWAY, ENTRANCE, hallway } from '../floor.js';
import { turnDoorsTo } from '../living_room.js';

// The room's own views, in scene metres: [x, height, y], so room (x, y, z)
// in mm / 1000 as (x, z, y). 3D views place the perspective camera at
// `position`, looking at `target`, and may set hfov, the angle across in
// degrees; 2D views place the flat one and give the width and height (m) to
// fit on screen. The config-defined views, the places you can be and the
// things you can look at are in living_room.views.js, for editing; kit/view_kit.js
// does the choosing (see viewKit below).
// The bedroom and the hallway (floor.js), for the bird's eye and the plan,
// which frame whichever room is chosen (the kit's `rooms`): each one's
// middle and size, in scene metres, and the bedroom's window wall's x
const BEDROOM_AREA = { x: (OTHER_ROOM_CORNER.x + OTHER_ROOM.length / 2) * MM, y: (OTHER_ROOM_CORNER.y + OTHER_ROOM.recessBack / 2) * MM,
  w: OTHER_ROOM.length * MM, d: OTHER_ROOM.recessBack * MM };
const HALLWAY_AREA = { x: (HALLWAY.x0 + HALLWAY.xEnd) / 2 * MM, y: HALLWAY.ySetBack / 2 * MM, w: HALLWAY.length * MM, d: HALLWAY.ySetBack * MM };
// The stairs and the entrance: from the hallway's door wall to the
// building's back wall, and from the stairs' outside wall across the lobby
const ENTRANCE_AREA = { x: (HALLWAY.x0 + ENTRANCE.xBack) / 2 * MM, y: ENTRANCE.yLobby1 / 2 * MM, w: (HALLWAY.x0 - ENTRANCE.xBack) * MM, d: ENTRANCE.yLobby1 * MM };
const BEDROOM_WINDOW_WALL = OTHER_ROOM_CORNER.x * MM;
// The garage (garage.js), likewise, and its floor's level
const GARAGE_AREA = { x: (GARAGE_CORNER.x + GARAGE.length / 2) * MM, y: (GARAGE_CORNER.y + GARAGE.width / 2) * MM, w: GARAGE.length * MM, d: GARAGE.width * MM };
const GARAGE_FLOOR = ENTRANCE.floor * MM;
// A room's plan: straight down on its middle, the back wall's side at the
// top as in the living room's, with room round it for its dimensions
const PLAN_MARGIN = 1.4;                                        // metres, chosen
const planOf = ({ x, y, w, d }) => ({ position: [x, 20, y + 0.001], target: [x, 0, y], fit: [w + PLAN_MARGIN, d + PLAN_MARGIN] });
// A room's wall, in 2D (`side`: 'back', 'front', 'left' or 'right', as
// ROOM_BOXES in flat_model.js has them), seen from inside the room: framed
// on the wall's length and the room's height, with what's in the nearer
// part of the room left out (the cut), as the living room's own wall views
// are. Those are kept as they were drawn; the other rooms' are worked out
const WALL_VIEW = {
  far: 30,                         // metres from the room to the camera, as the living room's (the 2D camera is straight on)
  margin: 1.2,                     // metres round the wall for its dimensions (chosen)
  high: 3.2,                       // metres of height framed, as the living room's
  eye: 1.0,                        // metres above the floor the wall's framed on, as the living room's
  cut: 0.4,                        // the share of the room's depth kept, from the wall (the living room's back wall view keeps 2240 of 5379)
};
function wallView({ x0, x1, y0, y1, floor: f }, side) {
  const m = v => v * MM, cx = m((x0 + x1) / 2), cy = m((y0 + y1) / 2), h = m(f) + WALL_VIEW.eye;
  const w = x1 - x0, d = y1 - y0, { far, margin, high, cut } = WALL_VIEW;
  return {
    back: { position: [cx, h, m(y1) + far], target: [cx, h, m(y0)], fit: [m(w) + margin, high], cut: ['y', y0 + cut * d, 1] },
    front: { position: [cx, h, m(y0) - far], target: [cx, h, m(y1)], fit: [m(w) + margin, high], cut: ['y', y1 - cut * d, -1] },
    left: { position: [m(x1) + far, h, cy], target: [m(x0), h, cy], fit: [m(d) + margin, high], cut: ['x', x0 + cut * w, 1] },
    right: { position: [m(x0) - far, h, cy], target: [m(x1), h, cy], fit: [m(d) + margin, high], cut: ['x', x1 - cut * w, -1] },
  }[side];
}
// The other rooms' wall views, for builtInViews' wall views' `rooms`
const OTHER_ROOMS_WITH_WALLS = ['bedroom', 'hallway', 'garage'];
const otherWalls = side => Object.fromEntries(OTHER_ROOMS_WITH_WALLS.map(room => [room, wallView(ROOM_BOXES[room], side)]));
const builtInViews = {
  // From high in the lounge's corner by the desk: not offered (the room
  // buttons' ▾ don't list it), but Packing's view when there's no corner
  // cupboard to stand in front of
  corner: { label: 'Corner', title: 'From high in the corner by the desk', position: [4.6, 3.4, 5.4], target: [1.0, 1.0, 1.0] },
  // High above the windows, looking down across the room towards the door
  // and the kitchen. The outer wall and ceiling only show from inside, so
  // the room is open from here; any further out and the outer wall's brick
  // face would hide the floor along it. The same over the bedroom, from
  // above its window, and over the hallway, from above the stairs' outside
  // wall, which likewise only shows from inside
  birdseye: { label: "Bird's eye", title: 'Looking down on the room', position: [4.5, 7.5, 2.75], target: [1.2, 0, 2.75], hfov: 66,
    rooms: {
      bedroom: { position: [BEDROOM_WINDOW_WALL - 0.66, 7.5, BEDROOM_AREA.y], target: [BEDROOM_WINDOW_WALL + 2.6, 0, BEDROOM_AREA.y] },
      hallway: { position: [HALLWAY_AREA.x, 6.0, -1.8], target: [HALLWAY_AREA.x, 0, 1.6] },
      downstairs: { position: [ENTRANCE_AREA.x, 3.6, -3.4], target: [ENTRANCE_AREA.x, ENTRANCE.floor / 2 * MM, 1.2] },   // aimed halfway down the stairs, chosen to fit
      garage: { position: [GARAGE_AREA.x + 4.5, GARAGE_FLOOR + 6.5, GARAGE_AREA.y], target: [GARAGE_AREA.x - 0.6, GARAGE_FLOOR, GARAGE_AREA.y] },   // above its door, looking in (chosen to fit)
    } },
  // The hallway's own (asked for, 19 Oct 2026, from the user's link): the
  // stairwell from beside it, high up past the TV wall (which only shows
  // from inside), looking across at the stairs, the banister and the shoe
  // boxes on the sills
  stairsSide: { label: 'Stairs from the side', title: 'The stairwell from beside it, past the TV wall', room: 'hallway',
    position: [-2.035, 2.861, -4.124], target: [-2.346, 0.105, 2.19], hfov: 66 },
  // The wall views leave out what's on the camera's side of their cut (see
  // applyCut): in the living room, the back wall view everything past the
  // return wall, the left wall view the island, the dresser and beyond, the
  // front wall view everything short of the island's far end, the right
  // wall view everything left of the desk recess; the other rooms' as
  // wallView() works them out
  plan:   { label: 'Plan (2D)', position: [1.4, 20, 2.861], target: [1.4, 0, 2.86], fit: [6.0, 6.9],    // back wall at the top
    rooms: { bedroom: planOf(BEDROOM_AREA), hallway: planOf(HALLWAY_AREA), downstairs: planOf(ENTRANCE_AREA), garage: planOf(GARAGE_AREA) } },
  back:   { label: 'Back wall (2D)', position: [1.9, 1.0, 30], target: [1.9, 1.0, 0], fit: [5.0, 3.2], cut: ['y', 2240, 1], rooms: otherWalls('back') },        // facing the back wall
  left:   { label: 'Left wall (2D)', position: [30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.0, 3.2], cut: ['x', 700, 1], rooms: otherWalls('left') },         // facing the left wall, back wall on the right
  front:  { label: 'Front wall (2D)', position: [1.37, 1.0, -30], target: [1.37, 1.0, 0], fit: [6.2, 3.2], cut: ['y', 4300, -1], rooms: otherWalls('front') },   // facing the front wall, left wall on the right
  right:  { label: 'Right wall (2D)', position: [-30, 1.0, 2.7], target: [0, 1.0, 2.7], fit: [7.2, 3.2], cut: ['x', 2220, -1], rooms: otherWalls('right') },   // facing the right wall, back wall on the left
};

// Packing: standing back from the corner cupboard's door (PACK_BACK, below),
// eyes at standing height, looking in and down a little, with its doors open wide.
// Where that is depends on the option, so it's worked out when chosen.
// Returns the middle of the door opening (or for an L, its inside corner)
// and the way out of it.
function packingSpot() {
  const { T, R, F, LEG, LEG_D, WARD, WARD_D, CORNER_W, CORNER_D } = config.pieces.cornerCupboard.design;
  const mid = (x, y, nx, ny) => ({ x, y, nx, ny });
  // An L (back-wall leg Dl deep, left-wall leg T deep): standing diagonally
  // in front of its inside corner, looking into it, to see into both legs
  const lCorner = Dl => mid(T, Dl, Math.SQRT1_2, Math.SQRT1_2);
  switch (config.pieces.cornerCupboard.design.option) {
    case 7:                                                      // an L: in front of its inside corner; else the back-wall leg's door
      return T ? lCorner(LEG_D) : mid(T + LEG / 2, LEG_D, 0, 1);
    case 8: {                                                    // the diagonal doors' middle
      const { from, to, ux, uy } = diagonal(cupboardSettings());
      return mid((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, -uy, ux);
    }
    case 9:                                                      // likewise an L, else the double doors
      return T ? lCorner(WARD_D) : mid(T + WARD / 2, WARD_D, 0, 1);
    case 10:                                                     // doors on its end, facing the kitchen
      return cornerTooShallow(cupboardSettings(), 'kitchen') ? null : mid(CORNER_W / 2, CORNER_D, 0, 1);
    case 11:                                                     // doors on its side, facing the windows
      return cornerTooShallow(cupboardSettings(), 'windows') ? null : mid(CORNER_W, (R + CORNER_D) / 2, 1, 0);
    default:
      return null;
  }
}
const PACK_BACK = 1250;             // mm out from the cupboard's door: arm's reach (750) and half a metre
const PACKING_DOORS = 170;          // degrees: the cupboard's doors folded back, out of the way (chosen; the sliders go to 180)
function packingView() {
  const at = packingSpot();
  if (!at) return builtInViews.corner;                                  // no corner cupboard: the corner view
  // Its doors open wide, all of them, folded back out of the way (at 90° one
  // can stand across the front of the other; an option with only one has
  // the other slider unused)
  turnDoorsTo({ tall: PACKING_DOORS, second: PACKING_DOORS, room: 0 });   // the room door shut, as it can hide the cupboard
  const { x, y, nx, ny } = at, m = v => v / 1000;
  return { posture: 'stand', position: [m(x + PACK_BACK * nx), 1.6, m(y + PACK_BACK * ny)], target: [m(x - 300 * nx), 0.9, m(y - 300 * ny)], hfov: 95 };
}

// What the other pieces of the model use
export {
  builtInViews, packingSpot, packingView
};
