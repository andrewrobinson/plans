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

0. **Browser tests first** (Playwright; see `REFACTOR_PLAN.md`): reference
   screenshots and address round-trips taken from the page as it is now, so
   every step below can be checked automatically.
1. **Pull the engine out** of `room_3d.html` (about 3,300 lines: roughly a
   third is general, the rest this room) into `kit/floor_kit.js`, shaped for
   a floor plan of walls, openings and rooms. Test against the living room at
   each step; nothing visible changes.
2. **Describe the living room** in `floor.js` and `living_room.js`; rename the
   data files as above. (Saved views, looks and scenes in the browser needn't
   survive, agreed 12 Oct 2026.)
3. **Redirect** `room_3d.html` (with its `#...` address) into the floor app,
   so the installed app keeps working. (Old share links needn't keep
   working, agreed 12 Oct 2026.) Update
   `manifest.webmanifest` and `sw.js`.
4. **Add the hallway and the other room** when their measurements are in.

Work on a branch; show the result before it goes live.

`REFACTOR_PLAN.md` (the code tidy-up) overlaps with step 1: its one `state`
object and the address read and written from one list belong inside the
engine work, and its file split is replaced by the layout above. Do them as
part of step 1, not as a separate pass.

## The other room, the hallway and the stairs, from the floor plans

**Scope:** this repo is about the top-floor (second-floor) flat only: its
rooms, hallway and bathroom. Beyond the flat, only the **staircase and the
entrance to the property** are to be shown, from ground level up to the
flat's hallway, so you can see the way in. The first-floor flat and the
other properties are not modelled; the first floor plan is here only for
where the staircase runs through it.

The floor plans are in `drawings/`:

- `drawings/second_floor_plan.png`: this flat, outlined in red.
- `drawings/first_floor_plan.png`: the flat below, used only for this
  flat's staircase (outlined in red) and the entrance lobby and route
  (outlined in blue).

### What's on the second floor

On the drawing (top = the outer wall with three windows):

- **The living room** (modelled so far): the top of the drawing. Three
  windows in the outer wall; the chimney breast with a recess either side on
  the right; the kitchen recess along its lower edge. The drawing's kitchen
  fittings don't match the room as it is (the model's are measured): trust
  its walls, not its fittings.
- **The other room**: bottom right, with one large window in the bottom
  wall and its own chimney breast and recess on the right, in line with the
  living room's. Its door is at the top of its left wall, from the hallway,
  and swings into the room.
- **The hallway**: down the middle left, from the living room's door, past
  the stairs, to the bathroom.
- **The bathroom**: bottom left: shower, basin, and a separate WC cubicle;
  two small windows.
- **The stairs**: along the left wall. Coming up, you arrive at the top end,
  where winders turn you right into the hallway, beside the living room's door.

### The stairs, from the ground floor up

The flat's own staircase starts at ground level (the narrow stair on the
ground floor plan), reaches a lobby at first-floor level (outlined in blue on
the first floor plan, with the access route), then goes through a door into
an enclosed flight along the left wall of the first floor (outlined in red),
and up into this flat's hallway.

### The drawing against the model's measurements

The plans aren't meant to be scaled, but scaled off them (about 8.4 mm a
pixel) they agree with the measured model to within the
drawing's line widths:

| | From the drawing | Measured (model) |
|---|---|---|
| The room door, from the back wall | about 1470–2270 | 1329–2231 (frame) |
| Back wall (bench) to outer wall, `W` | about 3840 | 3838 |
| Back wall to front wall (chimney breast face), `D` | about 5380 | 5379 |
| Kitchen recess, beyond the left wall | about 990 | 995 (`RECESS_X`) |

So the drawing maps onto the model's coordinates:

- the drawing's **top wall** is the model's outer wall (x = W);
- its **left wall** is the back wall (y = 0, the bench);
- its **right wall**, with the chimney breast, is the front wall (y = D);
- the living room's **lower edge**, with the door, is the left wall (x = 0).
  Everything below it on the drawing (hallway, stairs, bathroom, the other
  room) is at negative x, beyond the kitchen recess.

### First estimates for the other room, hallway and stairs

In the living room's coordinates (mm). These are **estimates scaled off the
drawing, to start shaping the model, not to build to**: measure before
anything is fitted.

| What | Estimate |
|---|---|
| Wall between the kitchen recess and the other room | about 125 thick |
| The other room: across (x) | from about −1110 (kitchen side) to −4760 (window wall): about 3650 |
| The other room: along (y) | from about 2560 (hallway wall) to 5380 at the chimney breast face (about 2860), 5800 in its recess (about 3230) |
| Its chimney breast | from the kitchen-side wall to about x −2960; the recess beyond it about 380 deep (like the living room's 372) |
| Its window | in the bottom wall, about y 3230–4750 (about 1500 wide, outer frame) |
| Its door | in the hallway wall, about x −1150 to −1890 (about 750 wide), hinged at the end away from the kitchen, opening into the room |
| The hallway | about y 1050–2480, from the living room's door down to the bathroom |
| The stairs (second-floor part) | about y 130–1050 (about 920 wide), x 0 to −2490; winders at the top end, by the living room's door |
| The bathroom | about y 0–2480, x −2580 to −4760 |

### To measure

The full checklist, with priorities and how to measure, is
`MEASUREMENTS_NEEDED.md`. In short:

- The other room: both ways across, height (ceilings may differ), the
  chimney breast and recess, the window (position, width, sill, top,
  radiator), the door (position, width, swing).
- Across the hallway, to tie the two rooms together: the wall thicknesses
  and where each room's corner sits, through both door frames.
- The stairs, from ground level up: width, the number of steps and their
  rise and going, the winders at the top, the banister, the opening above,
  and the headroom.
- The entrance: the street or rear door at ground level, the lobby at
  first-floor level and its door into the enclosed flight. Add a ground
  floor plan to `drawings/` when that part is modelled.

## Also open

- **Board thickness as a setting** (agreed 12 Oct 2026). **Done** 12 Oct
  2026, branch `board-thickness`: `BOARD` and its slider; the dresser and
  larders keep their own 18s, as bought furniture, not boards cut to size. Every cupboard is built from boards (MDF or
  chipboard) 18 thick today, but 18 is typed straight into the cupboard code
  about 115 times, with sums of it worked out by hand (36 for two boards, 618
  for a 600 leg and its panel). Make it one value, `BOARD`, with a slider in
  the corner cupboard section: **default 18**; a range of about 12 to 25,
  step 1; all cupboards the same thickness for now; kept in the address,
  with old links keeping 18.
  - **Exterior dimensions stay fixed.** A cupboard's outside sizes don't
    change with the board; thicker boards eat into the inside, thinner ones
    give it back. The sliders' depths and widths are outside sizes.
  - Check each `18` by eye as it's replaced: not every 18 is a board. Watch
    for the hand-worked sums, the door gaps (3 and 6), and the stored
    things' fit check, which assumes an 18 cupboard bottom (`LIFT`).
  - Sizes written as inside sizes become outside sizes: the finished
    design's legs, "600 deep inside (618 with its panel)" below, are 618
    deep outside, so at 18 nothing moves.
  - Do it after the Playwright tests (`REFACTOR_PLAN.md`): at 18 every
    option must look exactly as before, and the screenshot tests prove it.

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
