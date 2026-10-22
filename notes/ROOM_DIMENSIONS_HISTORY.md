# Room dimensions: settled history

Moved out of `room_dimensions.md` (22 Oct 2026), which keeps what's current.

## How the configuration was decided (16 Oct 2026)

**Why**: settings, menus, drawing and the address all reached into one
global `state`; the address was about 75 unnamed values in the order they
were added; and the flat could only be built inside the page, so every
test drove a browser. So a configuration went between the menus and what's
drawn: two JSON documents, **the configuration** (input: everything chosen,
each piece once, with a `version`; the address's first part) and **the
snapshot** (output: the configuration as read, each cupboard's cutting
list, the dimension figures, the description and each piece's box; saved
beside each test configuration in `tests/snapshots/` and compared exactly;
later the source for engineering drawings). The view is the address's
second part.

| Question | Decided |
|---|---|
| The configuration's shape | **By piece**: each piece once, with its design and where it is in each room. The two corner cupboards are two pieces |
| Names inside a piece | `state`'s (`T`, `R`, `LEG_D`, `L_SHELVES`, …), renamed only where the piece says it (`BENCH` → `bench.design.height`) |
| Places | Flat, in each room's own axes, as the sliders: `{ on, x, y, turn }` in the living room and garage, `u, v` in the bedroom, `along, across` in the hallway |
| Choices | Words (`above: "tvAndShelves"`); options by number (7 to 11, 16); colours stay codes; sizes in mm |
| `version` | 1; up only when a setting changes its path or meaning. Missing settings take their defaults, unknown ones are ignored, another version is ignored with a warning |
| The view | A document of its own: `room`, `view` (or `camera`), `eye`, and the display switches |
| Door angles | In the configuration, as the flat's state. Moved into the view on 22 Oct 2026 (`REFACTOR_PLAN.md` item 12) |
| The address | `#<configuration>~<view>`, each the full JSON, deflated and base64url'd. The full configuration, not changes from defaults, so a link never changes meaning when a default does |
| Schema entries | Each module's list (`OTHER_ROOM_SCHEMA`, …), ranges written in it (`SLIDER_RANGES`, checked against the sliders by a browser test), defaults from its `…_START`; the general code in `kit/config_kit.js` |
| JSON in and out of the page | Only `window.plans`: `export()`, `view()`, `load(json)`, `snapshot()`, for the tests and the browser console |
| The model | `flat_model.js`, with `buildFlat(config, view)`, no DOM; `living_room.js` keeps the page. Canvases in Node are the kit's `makeCanvas()` stand-in |
| Testing the model | `node --test` with `three@0.160.0` (the page's version): `npm run test:model`. Every saved configuration gives its saved snapshot; generated ones (every option, each setting at its ends, each board thickness) build, fit their rooms with the doors opened, and round-trip through the address |
| The corner cupboards | Instances (`makeCupboard()`), each built against its room's `place`, with its own materials and its boards tagged by kind |

## Checked against the floor plan

The second floor plan (`drawings/second_floor_plan.png`), scaled at about
8.4 mm a pixel, agrees with these measurements when scaled, though it isn't meant to be
scaled:

| | Scaled from the drawing | Measured here |
|---|---|---|
| Room door frame, from the back wall | about 1470–2270 | 1329–2231 |
| `W`, back wall to outer wall | about 3840 | 3838 |
| `D`, back wall to front wall | about 5380 | 5379 |
| Kitchen recess, beyond the left wall | about 990 | 995 |

On the drawing, the outer wall (three windows) is at the top, the back wall
(bench) on the left, the front wall with the chimney breast on the right, and
the left wall, with the room door, along the room's lower edge. The drawing's
kitchen fittings don't match the room; its walls do. Everything below the
living room on the drawing (hallway, stairs, bathroom, the other room) is
at negative x, beyond the kitchen recess.
