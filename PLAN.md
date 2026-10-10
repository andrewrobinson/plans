# Plan

Where the cupboard planner is heading, as agreed so far. The model itself is
described in `room_dimensions.md`.

## Next: one floor plan, with rooms

A second room (a bedroom, or similar) is coming, with a hallway between it
and the living room. Rather than separate room pages placed side by side,
the plan is **one floor plan as the single source of truth**:

- **Walls** once each, as lines with a thickness: the wall between the
  hallway and the living room is one wall, not two to keep in step.
- **Openings** in walls: doors (frames, which way they swing) and windows
  (sills, radiators). A door belongs to its wall, so the rooms either side
  share it.
- **Rooms** as named areas, each with its own origin at one corner, so its
  measurements stay in its own mm. The living room keeps x from its left
  wall and y from its back wall: none of today's numbers or links change.
- **Each room's fittings and contents** (kitchen, island, desk, cupboard
  options and designs, furniture, places to stand and things to look at,
  scenes) in its own coordinates.
- **One page** for the whole floor. "A room" becomes a focus: choosing it
  frames it and shows its menus. You can stand in the hallway and look
  through a door into either room.

Measuring: rooms measured apart rarely add up exactly when joined, so the
floor plan needs measurements across the hallway and through the door
frames (wall thicknesses, where each room's corner sits), settled once.

### Files

```
index.html                  the floor app: one page for the whole floor
floor.js                    the floor plan: walls, doors and windows, where each room's corner is
living_room.js              the living room's fittings: kitchen, island, desk, its cupboard options
living_room.views.js        its places, things to look at, looks, preset views (today's room_3d.views.js)
living_room.scenes.js       its scenes (today's room_3d.scenes.js)
living_room.designs.js      (later) its cupboard designs: the finished design and prototypes
dressers.js                 furniture catalogues, for any room (today's room_3d.dressers.js, ...)
larders.js
sofas.js
kit/
  floor_kit.js              the engine: builds the floor and its rooms, cameras, menus, the address
  view_kit.js
  scene_kit.js
room_3d.html                a redirect into index.html, focused on the living room, for old links
living_room.md              today's room_dimensions.md; floor.md for the floor plan's measurements
```

Later, `hallway.js` and the other room's file sit alongside `living_room.js`.

### Steps

1. **Pull the engine out** of `room_3d.html` (about 3,300 lines: roughly a
   third is general, the rest this room) into `kit/floor_kit.js`, shaped for
   a floor plan of walls, openings and rooms. Test against the living room at
   each step; nothing visible changes.
2. **Describe the living room** in `floor.js` and `living_room.js`; rename the
   data files as above; keep browser storage under the id `room_3d`, so saved
   views, looks and scenes survive.
3. **Redirect** `room_3d.html` (with its `#...` address) into the floor app,
   so shared links, scenes and the installed app keep working. Update
   `manifest.webmanifest` and `sw.js`.
4. **Add the hallway and the other room** when their measurements are in.

Work on a branch; show the result before it goes live.

## Also open

- **Designs**: a cupboard design as data (its kind, sizes, doors, shelves per
  leg, notes), one marked the finished design, the others prototypes, chosen
  in the corner cupboard section. Scenes would then refer to a design, plus
  the packing, furniture and view. Later, the L-shaped cupboard built from the
  data alone, so prototypes need no code, and a printable spec for the maker
  from the finished design.
- **Turning things to store by 45°**, so the racks can be shown diagonally
  across option 7's inside corner, where the doors meet (with both open the
  gap is about 844 across at 45°, more than the racks' 800).
- **An overlap check** between things to store: today each is checked only
  against the cupboard's walls, so two can overlap and still show green.
- **The finished design** today: the scene "7. Finished design, 1200 × 1200,
  ready packed" in `room_3d.scenes.js`: option 7, each leg 600 deep inside
  (618 with its panel), the back-wall leg 582 wide, the front at 1200;
  shelves 790, 1300, 1850 in the back-wall leg and corner, 1710 and 2150 in
  the left-wall leg; the tub on the 790 shelf over the racks.
