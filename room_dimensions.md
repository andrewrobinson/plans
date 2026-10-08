# Room dimensions

The room, door, door frame and ceiling as modelled in [room_3d.html](room_3d.html), followed by every dimension the model uses. All sizes are in mm.

## How positions are given

- **x** runs along the back wall, from the left wall (x = 0) to the right wall (x = 3838).
- **y** runs from the back wall (y = 0) towards the front of the room (y = 5717).
- **z** is height from the floor.
- "Left wall" is the wall at x = 0, as you face the back wall. The doorway is in it.

## Room

| What | Size | Notes |
| --- | --- | --- |
| Width, along the back wall | 3838 | |
| Depth, back wall to front wall | 5717 | |
| Ceiling height | 2443 | Measured between 2441 and 2446 across the room (the floor is uneven); 2443 is used everywhere. Near the door frame it measured 2434 |

The model draws the walls 100 thick. That's only for the picture; it's not a measurement.

## Door and door frame

The doorway is in the left wall, near the back of the room. The door opens into the room.

| What | Size or position | Notes |
| --- | --- | --- |
| Door frame starts | y = 1329 | Measured. The furthest a left-wall cupboard can come out from the back wall |
| Hinge | y = 1400 | Measured. Hinge side of the frame is 71 wide (1400 − 1329) |
| Door width | 760 | From y = 1400 to 2160 |
| Door height | 1978 | Measured to the floor |
| Door thickness | 44 | |
| Door frame height | 2050 | Measured to the floor. The frame head fills the 72 between the door top and the frame top |
| Door frame ends | y = 2231 | **Assumed.** The far side of the frame is taken to be 71 wide, like the hinge side. Not yet measured |
| Wall above the frame | 2050 to the ceiling | Measured 384 (ceiling 2434 there); the model, at 2443, shows 393 |

Opened to 90°, the door lies along x 0 to 760, at y 1400 to 1444.

## Parameters you can change on the page

| Parameter | In the code | Values | Default | What it sets |
| --- | --- | --- | --- | --- |
| Option | `shown` | 1–8 | 1 | Which cupboard layout |
| Left-wall cupboard depth | `T` | 400, 500, 600, 700, 800 | 500 | How far the left-wall cupboard comes out from the left wall. Everything along the back wall starts from x = T |
| Left-wall cupboard front | `F` | 1200, 1329 | 1200 | How far the left-wall cupboard comes out from the back wall. 1329 is up to the door frame |
| Rear wall cupboard depth | `R` | 330, 400, 500, 600, 700, 800 | 500 | How deep the bench and the back-wall cupboards are, from the back wall |
| Upper cupboard width | `UPPER` | 400 to 1200, in 50s | 700 | Width along the back wall of option 4's upper cupboard, and of options 3 and 5, which are built on it. Its door is UPPER − 24 wide. Shown on options 3–5 |
| Back-wall leg width | `LEG` | 400 to 1200, in 50s | 700 | Option 7 only: inside leg of the full-height L along the back wall. Its door is LEG − 24 wide, and the bench starts at x = T + LEG |
| Option 5 second bay | `EXTRA` | 300 to 900, in 50s | 500 | Width of option 5's second upper cupboard bay, beyond the upper cupboard. Its door is EXTRA − 6 wide. Only shown on option 5 |
| Bench height | `BENCH` | 700, 780, 800, 900 | 780 | Height of the bench top. Upper cupboards, corner shelves and everything above the bench move with it |
| Above the bench | `above` | Nothing, Shelves, TV, TV and shelves | Nothing | What's on the back wall over the bench |
| Shelf depth | `shelfDepth` | 150 to 400, in 10s | 250 | Depth of the shelves above the bench |
| Left-wall cupboard door | slider | 0°–110° | 0° | How far it's opened |
| Second door(s) | slider | 0°–110° | 0° | The option's other door or doors |
| Room door | slider | 0°–110° | 90° | How far it's opened |

The page address records the option and settings as `#option-T-R-F-above-shelfDepth-BENCH-EXTRA-UPPER-LEG`, for example `#7-500-500-1200-3-250-780-500-700-900`.

### Sizes that follow from the parameters

| What | Size |
| --- | --- |
| Left-wall cupboard door width | F − R − 6 |
| Inside leg along the left wall | F − R |
| Bench, options 1–5 | from x = T, length 3838 − T, depth R |
| Bench, options 6 and 8 | from x = T + 700, length 3138 − T, depth R |
| Bench, option 7 | from x = T + LEG, length 3838 − T − LEG, depth R |
| Corner above the bench (options 1–2) | T × R |
| Door over the corner shelves (option 2) | (R − 6) × (H − 6 − BENCH) |
| Upper cupboard doors (options 4, 5) | UPPER − 24 wide, and in option 5 a second one EXTRA − 6 wide; from BENCH + 3 to H − 3 |
| Option 6 lower door | 676 × (BENCH − 24) |
| Option 8 diagonal front | from (T, F) to (T + 700, R), length √(700² + (F − R)²), two doors each (length − 9) / 2 |

## Hardcoded dimensions

### Room and doorway

| Name in code | Value | What |
| --- | --- | --- |
| `W` | 3838 | Room width |
| `D` | 5717 | Room depth |
| `H` | 2443 | Ceiling height, measured 2441 to 2446 across the room |
| `WALL` | 100 | Wall thickness, drawing only |
| `FRAME` | 1329 | Door frame start, from the back wall |
| `HINGE` | 1400 | Door hinge, from the back wall |
| `JAMB` | 71 | Frame width each side (HINGE − FRAME) |
| `ROOM_DOOR` | 760 | Door width |
| `ROOM_DOOR_H` | 1978 | Door height |
| `FRAME_H` | 2050 | Door frame height |
| `FRAME_END` | 2231 | Door frame end (assumed far side) |
| — | 44 | Door thickness |

### Bench and cupboards

| Name in code | Value | What |
| --- | --- | --- |
| — | 18 | Panel thickness: carcass sides, tops, bottoms, shelves inside cupboards, doors |
| — | 3 | Gap round each cupboard door (doors stop 3 short of floor, ceiling and neighbours, so full-height doors are H − 6 = 2437 high) |
| — | 700 | Inside leg of the full-height L along the back wall, options 6 and 8 (x T to T + 700) |
| — | 1203, 1803 | Shelf tops inside the left-wall cupboard |
| `upperTops()` | BENCH, BENCH + 423, + 828, + 1233 | Shelf tops in the corner and upper units above the bench (780, 1203, 1608, 2013 at the default bench) |
| — | 600, 1200, 1800 | Shelf tops inside the full-height L and option 8 |
| — | 390 | Option 6's shelf inside the lower cupboard (top) |
| — | 25 | Option 8: shelves stop this far behind the diagonal front |
| — | 950 to 1250 | Full-height door handles. Doors above the bench: BENCH + 170 to + 470. Option 6 lower door: BENCH − 300 to − 80 |

### Above the bench

Heights here are set from the bench height; the value at the default bench of 780 is in brackets.

| Name in code | Value | What |
| --- | --- | --- |
| `SHELF_T` | 25 | Shelf thickness |
| `SHELF_TOPS` | BENCH + 420, + 770, + 1120 (1200, 1550, 1900) | Shelf tops, "Shelves" |
| `TV_W` × `TV_H` | 1450 × 830 | TV size (65") |
| `TV_BOTTOM` | BENCH + 320 (1100) | TV bottom edge; top is 830 higher (1930) |
| — | 50 | TV depth off the wall |
| `TV_GAP` | 150 | Clear space between the TV and the shelves beside it |
| `TV_SHELF_TOPS` | BENCH + 220, + 1300 (1000, 2080) | Full-width shelf tops below and above the TV, "TV and shelves" |
| `TV_MIDDLE_SHELF` | BENCH + 770 (1550) | Shelf top either side of the TV, "TV and shelves" (left out when there's under 200 each side) |
