# Room dimensions

The room, door, door frame and ceiling as modelled in [room_3d.html](room_3d.html), followed by every dimension the model uses. All sizes are in mm.

## How positions are given

- **x** runs along the back wall, from the left wall (x = 0) to the right wall (x = 3838).
- **y** runs from the back wall (y = 0) towards the front of the room (y = 5379, the front wall).
- **z** is height from the floor.
- "Left wall" is the wall at x = 0, as you face the back wall. The doorway is in it.

## Room

| What | Size | Notes |
| --- | --- | --- |
| Width, along the back wall | 3838 | |
| Depth, back wall to front wall | 5379 | Measured. 5751 into the alcove above the sink |
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

## Kitchen recess and kitchen

Past the door frame, the left wall steps back: a short return wall faces the front of the room (the light switch is on it), and the kitchen sits in a recess behind it.

| What | Size or position | Notes |
| --- | --- | --- |
| Return wall | y = 2251 | Just past the door frame (2231). **Assumed** 20 past it |
| Kitchen fronts behind the door wall | 405 | Measured: the fridge front is 405 behind the door frame's wall |
| Fridge unit depth | 590 | Measured |
| Recess back wall | x = −995 | 405 + 590 behind the door wall |
| Wall cupboards depth | 400 | Measured |
| Worktop height | 894 | Measured, to the top |
| Tall fridge unit | 590 wide along the wall, 2400 high | Width and height estimated |
| Wall cupboards | 1450 to 2400 | Estimated |
| Front-wall run | from the recess wall to x = 725, ending at the alcove's edge | From the measurements below |
| Alcove above the sink | 372 deep into the front wall (5751 − 5379, measured); x −595 to 725, from the worktop (894) to about 1990 | Depth and right edge from measurements; left edge and top estimated. Tiled inside |
| Wall between the alcove and the desk recess | 1490 | Measured |
| Desk recess | 1623 across, 372 deep, full height, x 2215 to the right-hand wall | Measured, assuming it runs to the right-hand wall |
| Desk | white, 1600 wide (filling the recess), 802 deep from the recess back (so 430 out into the room), 830 high | Measured |
| Monitors | 2 screens, 610 wide × 360 high, tops 550 above the desk, spaced evenly across it, on a riser 1080 wide × 230 deep × 10 high, centred, 80 from the back of the recess | Measured, except the riser being centred |
| Office chair | seat at 590, headrest top at 1400, 600 wide across the armrests | Measured; position and other sizes estimated |
| Sink | stainless, x −250 to 550, below the alcove | Estimated |
| Wall cupboards | over the drawers, and from the washing machine on to the front corner | The extractor is between |
| Island (loose) | Top 770 wide × 1260 long, 900 high, long side along the room; long edge 1010 from the door wall, short end 2941 from the back wall (so x 1010–1780, y 2941–4201); the top overhangs the base by 10 all round | Measured |

The kitchen and island are rough blocks in their real colours: units in Clerkenwell Gloss White, a light stone laminate worktop (`#CFC3B0`, estimated), the island in a warmer painted white (`#EDE6D5`) with a honey oak top (`#D6A562`).

## Outer wall: windows and radiators

The right-hand wall (x = 3838), drawn so it's only visible from inside. The **Windows** view faces it.

| What | Size or position | Notes |
| --- | --- | --- |
| Windows | 3 recesses, each 923 wide × 1390 high × 207 deep, sills at 912, so tops at 2302 (measured), with a white sill. They start 734, 2446 and 4137 from the back wall | Measured |
| Outer wall, outside face | 300 out from the inside face, brick-coloured; only visible from outside | Thickness and colour are placeholders |
| Radiators | 600 wide × 600 high × 100 thick, 240 off the floor (top at 840), fronts 132 out from the wall; centred under each window | Measured, except the position under the windows |

## Parameters you can change on the page

| Parameter | In the code | Values | Default | What it sets |
| --- | --- | --- | --- | --- |
| Option | `shown` | 1–10 (10 is the current room, with nothing built; the Current room button picks it) | 10 | Which cupboard layout |
| Left-wall cupboard depth | `T` | 0 (none), 400, 500, 600, 700, 800 | 0 | How far the left-wall cupboard comes out from the left wall. Everything along the back wall starts from x = T. At 0 there's no left-wall cupboard, and options 2 and 8 aren't available |
| Left-wall cupboard front | `F` | 1200, 1329 | 1200 | How far the left-wall cupboard comes out from the back wall. 1329 is up to the door frame |
| Rear wall cupboard depth | `R` | 330, 400, 500, 600, 700, 800 | 500 | How deep the bench and the back-wall cupboards are, from the back wall |
| Upper cupboard width | `UPPER` | 400 to 1200, in 50s | 700 | Width along the back wall of option 4's upper cupboard, and of options 3 and 5, which are built on it. Its door is UPPER − 24 wide. Shown on options 3–5 |
| Back-wall leg width | `LEG` | 400 to 1200, in 50s | 700 | Option 7 only: inside leg of the full-height L along the back wall. Its door is LEG − 24 wide, and the bench starts at x = T + LEG |
| Double-door cupboard width | `WARD` | 600 to 1400, in 50s | 900 | Option 9: width of the full-height double-door cupboard on the back wall. Each door is (WARD − 27) / 2 |
| Double-door cupboard depth | `WARD_D` | 330 to 1000, in 10s | 600 | Option 9: its depth from the back wall, independent of the bench |
| Shelving tower width | `TOWER` | 0 to 600, in 50s | 400 | Option 9: the open shelving tower beside it, R deep (0 for none) |
| Option 5 second bay | `EXTRA` | 300 to 900, in 50s | 500 | Width of option 5's second upper cupboard bay, beyond the upper cupboard. Its door is EXTRA − 6 wide. Only shown on option 5 |
| Bench height | `BENCH` | 700, 780, 800, 900 | 780 | Height of the bench top. Upper cupboards, corner shelves and everything above the bench move with it |
| Above the bench | `above` | Nothing, Shelves, TV, TV and shelves, TV and top shelf | TV and shelves | What's on the back wall over the bench |
| Shelf depth | `shelfDepth` | 150 to 400, in 10s | 250 | Depth of the shelves above the bench |
| Cupboard colour | `ralChosen.cupboard` | Four to compare (◀ ▶ flip between them): Clerkenwell Gloss White, AI Olive, same colour as the door (Pure Brilliant White), same colour as the walls (Crown Gallery White). Or "Other colours…", which opens a second dropdown of 23 popular cupboard colours and all 99 RAL Classic colours by family | AI Olive | Covers carcasses, doors and the bench. Floor, walls and woodwork are fixed as the room is. Screen colours are approximate |
| Left-wall cupboard door | slider | 0°–110° | 0° | How far it's opened |
| Second door(s) | slider | 0°–110° | 0° | The option's other door or doors |
| Room door | slider | 0°–110° | 90° | How far it's opened |

The page address records the option and settings as `#option-T-R-F-above-shelfDepth-BENCH-EXTRA-UPPER-LEG-WARD-TOWER-WARD_D-floor-cupboard-wall-woodwork`, for example `#9-0-330-1200-4-250-780-500-700-700-900-400-600-3-9010-1-2`. A code of 0 means the default (the room as it is now); 1, 2 and 3 are the room's finishes below.

## The room's finishes

| Where | Finish | Code in the address | Screen colour (approx.) | Nearest RAL |
| --- | --- | --- | --- | --- |
| Walls | Crown Gallery White (K9710C), matt emulsion | 1 | `#DCDEDB` | 7035 Light grey / 9018 Papyrus white |
| Woodwork | Dulux Pure Brilliant White, gloss | 2 | `#F8F8F6`, a clean white (one paint database gives `#EDECE7`) | 9003 Signal white / 9016 Traffic white |
| Ceilings | Dulux Pure Brilliant White, matt | — | `#EDECE7` | 9003 / 9016. Drawn with six downlights, seen only from inside the room |
| Floor | Howdens Oak 3 Strip Engineered Flooring (SDH3220): oak, 2200 × 207 × 14 boards of three 69 strips, click fit, 3.18 m² packs | 3 | About `#D29A50` in daylight photos of the room; drawn as oak boards | 1002 Sand yellow (darker strips near 1011 Brown beige) |

| Cupboards (idea) | **Clerkenwell Gloss White**: Howdens kitchen units (FRK24), as on the kitchen in the room. Howdens call it a crisp, neutral white (their warmer one is Clerkenwell Gloss Porcelain). Drawn as high gloss | 5 | `#F5F4EF`, a hair warmer than the woodwork and clearly whiter than the walls in a photo of the kitchen | 9010 Pure white / 9016 Traffic white |
| Cupboards (idea) | **AI Olive**: taken from the cupboards in an AI-generated picture of the room, corrected for its dim, warm light | 4 | `#B8B0A4`, a light olive-grey greige | 7032 Pebble grey (7038 Agate grey close) |

The wall spec mentions "Indulgence", but Crown's Indulgence is a blue (CRAFTED by Crown), so check the tin.

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
| `D` | 5379 | Room depth, back wall to front wall (measured) |
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
