# Plan

What's next for the cupboard planner, in order. The model itself is
described in `room_dimensions.md`; the code's layout in
`room_3d_ui_guide.md`. What's done is in git history (`git log`), not here.

How work goes: each piece on its own branch, `npm run test:quick` while
working, the full `npm test` before it goes live, and "deploy to main" puts
it on GitHub Pages. Two sessions testing at once need separate ports
(`PORT=8766 npm test`).

## Next steps

1. **Readable code**: `REFACTOR_PLAN.md` step 5, in the style of
   `menu_demo/` (all but done). Then **one configuration, as JSON**:
   `REFACTOR_PLAN.md` step 6 (agreed 16 Oct 2026), a configuration
   between the menus and what's drawn, the URL as that configuration
   compressed, the model built and tested in Node, and the corner
   cupboard as an instance, the bedroom getting a second one. 6a (the
   safety net) and 6b (the configuration and its URL) are done; 6c (the
   model in Node) is next.
2. **Measure the rest of the flat**: `MEASUREMENTS_NEEDED.md`, priority 1,
   with `drawings/measure_sheet.html` (lettered on the plan; the values come
   back as "A = 2240" lines, to go into `floor.md` and the model).
   Any time before step 3, so the floor plan starts from measured numbers,
   not ones scaled off the drawing.
3. **The other room, the hallway and the stairs**, drawn from
   `drawings/second_floor_plan.png` and `drawings/first_floor_plan.png`
   (below), into `floor.js`. This is when the engine takes each room's
   `build(group)` and the address gets a room's name in front of each part
   (`REFACTOR_PLAN.md`, "When a second room comes", now replaced by its
   step 6: `buildFlat(config)` and a configuration by piece).
   Its furniture ("The other room's furniture", below) comes with it.
   **Started 15 Oct 2026**: the other room (the bedroom) is drawn, its shell
   in `floor.js` (`OTHER_ROOM`, its own u, v coordinates) and its furniture
   and recess cupboards in `other_room.js`, with sliders (now in a
   **Bedroom options** drawer of their own, turning in quarter turns), and
   the address's fields after SIDE_D (`room_dimensions.md`, "The other
   room"). The back wall's **Bookshelf** switch puts the bedroom's bookcase
   in the living room in place of the bench. Each piece has Reset
   dimensions and Reset location buttons, and a mirror (sized, and moved
   along and up any of the four walls), and the upper recess cupboard can
   have drawers over its open shelves and mirrors on its tall doors (the
   address's last field). Later the mirror got an **In the bedroom**
   switch, as the bookcase and the pine cupboard have, and the carpet a
   colour in the Colours menu, its colour in the doorway photo as it starts. Its settings still live in
   `living_room.js`'s `state.otherRoom`. Later on 15 Oct 2026 the hallway
   and the top of the stairs (`floor.js`'s `HALLWAY`, from the measured A
   to E, AB, AC and Y), and a **Room** choice in the Look menu: Where and
   Looking at offer that room's, and Bird's eye and Plan (2D) frame it
   (`room_dimensions.md`, "Views"). That evening the stairs from the
   user's measurements and photos: 11 straight steps, 3 winders turning
   right by the living room door, a top step level with the hallway, 15
   risers of 190; the hallway's ceiling left out, as asked. Then the top
   of the well from photos: a sill board each side bridging to the
   hallway floor, the banister's 110 base, and the WC wall stopping at
   the floor's level over the stairs. The bedroom's door and window views
   became places in its Where. Then downstairs, from the first floor plan
   (estimated): the stairs' foot, the flat's internal door and the shared
   lobby with its external door, both doors on sliders, and a
   **Downstairs** room in the Look menu with places on the first
   floor's level. Then a shoe rack at the foot (`shoe_rack.js`): an open
   rack of shelves, 600 × 200 × 1200 to start, its sizes, place on the
   foot's floor and quarter turns on sliders, starting against the outside
   wall clear of the internal door's swing; Looking at offers it
   downstairs. Its real sizes to come. Still to do: the measured numbers as they
   come in (S, W, X: `MEASUREMENTS_NEEDED.md`); the
   bathroom and WC; walls drawn from above in the bedroom's and hallway's
   plans (they're faces seen from inside, so the plan shows only floors);
   looking from the hallway into a room; stopping furniture at the walls;
   and the engine refactor below, now `REFACTOR_PLAN.md` step 6.

Smaller pieces, any time:

- **Other parts in the cutting list**: parts not `BOARD` thick (option 9's
  tower plinth and its 25-thick oak shelves) are left out today; list them
  under "other parts". Easier after `REFACTOR_PLAN.md` 6d, when the
  cutting list belongs to a cupboard instance and its boards are tagged by
  kind.
- **An overlap check** between things to store: today each is checked only
  against the cupboard's walls, so two can overlap and still show green.
- **Turning things to store by 45°**, so the racks can be shown diagonally
  across option 7's inside corner, where the doors meet (with both open the
  gap is about 844 across at 45°, more than the racks' 800).
- **Designs**: a cupboard design as data (its kind, sizes, doors, shelves per
  leg, notes), one marked the finished design, the others prototypes, chosen
  in Cupboard options. Scenes would then refer to a design, plus the
  packing, furniture and view. Later, the L-shaped cupboard built from the
  data alone, so prototypes need no code, and a printable spec for the maker
  from the finished design. `REFACTOR_PLAN.md` step 6 starts this: a
  cupboard's settings become a piece in the JSON configuration (6b), built
  by an instance with its own cutting list (6d).
- **`menu_demo/`** keeps its own copy of the room; its `room.js` could load
  the walls from `floor.js`.

## The finished design today

The scene "7. Finished design, 1200 × 1200, ready packed" in
`living_room.scenes.js`: option 7, each leg 618 deep outside, the back-wall leg
582 wide, the front at 1200; inside, with the rear panels against the walls
(boards 18), 1164 × 582 along the back wall and 582 × 582 along the left
wall, 2407 high, and all seven things to store fit; shelves 790, 1300, 1850
in the back-wall leg and corner, 1710 and 2150 in the left-wall leg; the tub
on the 790 shelf over the racks.

## Where it's heading: one floor plan, with rooms

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

All there since the split (14 Oct 2026) but `living_room.designs.js`, and
the two .md files, still `room_dimensions.md`.

```
index.html                  the floor app: one page for the whole floor
floor.js                    the floor plan: walls, doors and windows, where each room's corner is
living_room.js              the living room's fittings: kitchen, island, desk, its cupboard options
living_room.views.js        its places, things to look at, looks, preset views
living_room.scenes.js       its scenes
living_room.designs.js      (later) its cupboard designs: the finished design and prototypes
dressers.js                 furniture catalogues, for any room
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

Agreed 12 Oct 2026: saved views, looks and scenes in the browser, and old
share links, needn't survive the move.

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

### The other room's furniture (measured 15 Oct 2026)

The user wants the bookcase and the cupboard resizable with sliders and
movable around the room, as the living room's sofa and larders are; the
bed is a fixed size. Done 15 Oct 2026 (`other_room.js`), with the lower
recess cupboard's depth on a slider too, as the user asked. The headboard
was measured as well: 25 thick, 950 high. Sizes in mm, width × depth × height:

| Piece | Size | Colour | Adjustable |
|---|---|---|---|
| Bookcase, open shelves | 1490 × 290 × 1220 | dark brown | sliders and position |
| Free-standing cupboard: three doors over five drawers, cornice on top | 1300 × 500 × 1790; stands 560 out from the wall (the cornice, the carpet and its lean) | pine | sliders and position |
| Bed base | 1360 × 1940, 350 high off the carpet | | position only |
| Mattress, on the bed | 1360 × 1940, 260 thick (top at 610) | | fixed |

Where they stand now, from a photo (to confirm): the cupboard against the
kitchen-side wall, near the chimney breast corner; the bookcase against
the chimney breast face, beside the recess cupboards; the bed in the
middle of the room. The recess's fitted cupboards are measured too
(`MEASUREMENTS_NEEDED.md`, section 2) and are fixed.

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
