# Plans

A 3D model of the top-floor flat, in the browser, for planning cupboards
and furniture: the living room (with its corner cupboard options), the
hallway and the bedroom. Published at
https://andrewrobinson.github.io/plans/index.html, and installable as an app
that works offline.

## Running it

The page uses ES modules, so it needs a server:

```bash
python3 serve.py
```

then open http://localhost:8765/index.html. The model's tests, in Node:
`npm run test:model` (about a minute and a half). The browser tests
(Playwright): only those a change can break while working
(`npx playwright test --project=iphone -g "<name>"`), at most one
`npm run test:quick` (a phone, about two to four minutes) before a commit,
and the full `npm test` (both devices) once, before anything goes to
`main`. `npm run test:update`
takes new screenshots and snapshots when a change is meant to show.

## Where things are

| File | What |
| --- | --- |
| `index.html` | The page and its menus |
| `controls_demo.html` | A demo of the page's controls and menus beside others it could use (UI_CRITIQUE.md's agreed steps); it touches nothing in the model |
| `floor.js` | The walls, doors and windows: the living room's, the hallway's (`HALLWAY`, with the stairs), downstairs (`ENTRANCE`) and the bedroom's (`OTHER_ROOM`, in its own u, v mm) |
| `flat_model.js` | The model: the living room's fittings and cupboard options, the settings and the configuration's schema, the dimensions, cutting list and things to store, with no page, so Node builds it too (`buildFlat()`) |
| `living_room.js` | The page: the menus and controls, the built-in views, the configurations and the page address |
| `other_room.js` | The bedroom's furniture and fitted cupboards, and their sliders |
| `bookcase.js`, `billy.js` | The bedroom's bookcase, and Billy (drawn as one, standing or lying) and BillyChest, each drawn wherever it stands |
| `daybed.js` | A daybed sofa (the Drift), as a sofa or a bed |
| `ivar.js` | The Ivar, standing or lying, wherever it is |
| `knarrevik.js` | The Knarrevik bedside table (the bedroom has two) |
| `kvistbro.js` | The Kvistbro storage table, in the bedroom |
| `laundry_basket.js` | The laundry basket, in the bedroom |
| `tables.js` | The kitchen tables, Chesham and Cornwall: on their legs, Chesham on its end, Cornwall with its legs off |
| `castor_desk.js` | The desk on castors, parked by the door or wheeled out to the TV |
| `wicker_bench.js` | The hallway's wicker bench, which can be on in any room, and its sliders |
| `shoe_rack.js` | The shoe rack at the foot of the stairs, downstairs, and its sliders |
| `stair_walls.js` | The shelves and pictures on the walls over the stairs, and their sliders ([HALLWAY_SHELVES.md](HALLWAY_SHELVES.md)) |
| `shoe_boxes.js` | The shoe boxes on the sills either side of the top of the stairs, and their sliders ([HALLWAY_SHELVES.md](HALLWAY_SHELVES.md)) |
| `garage.js` | The garage (off the site plan, in its own x, y mm), what's in it, and Garage options' sliders |
| `living_room.views.js` | The rooms, places (Where), things (Looking at), eye heights and config-defined views, for editing |
| `living_room.configurations.js`, `dressers.js`, `larders.js`, `sofas.js` | Named configurations and furniture catalogues, for editing |
| `kit/config_kit.js` | The configuration: reading and writing it through a schema, and packing it for the address |
| `tests/` | The browser tests, the saved configurations (`configs/`) and snapshots (`snapshots/`), and the model's tests in Node (`model/`) |
| `kit/` | The engine: `floor_kit.js`, `view_kit.js` (views, rooms, Where and Looking at), `configuration_kit.js` (the Configuration list) |
| `drawings/` | The floor plans, and `measure_sheet.html` for sending measurements |

The notes:

- `CLAUDE.md`: how to write the code.
- `PLAN.md`: what's next.
- `room_dimensions.md`: every dimension the model uses, and the configuration's and the page address's format.
- `MEASUREMENTS_NEEDED.md`: what's measured and what's still to measure, in "Where it's got to".
- `REFACTOR_PLAN.md`: tidying the code.
- `room_3d_ui_guide.md`: where each part of the page is.

## Where it's got to (16 Oct 2026)

- **The living room**, measured, with the corner cupboard options, dresser,
  larders, sofa, island and things to store.
- **The bedroom**, measured but for its ceiling (S, worked out as 2445 from
  the recess cupboards), with its furniture on sliders.
- **The hallway**, from the measured A to E, AB, AC, G and Y, with no
  ceiling drawn; its wicker bench, measured, can be switched on in the
  bedroom and the living room too.
- **The stairs**, measured and counted: 900 wall to wall, 11 straight steps,
  3 winders and a top step level with the hallway, 15 risers of 190. Only
  the going (X) is still the drawing's 220. At the top, a sill board on
  each side bridges to the hallway floor (240 wide and 210 down on the
  banister's side, 120 wide and level on the outside), and the WC wall
  stops at the floor's level over the stairs.
- **Downstairs**, from the first floor plan, estimated: the stairs' foot,
  your (internal) door into it and the lobby shared with the downstairs
  neighbour, with its external door; both doors on sliders in the Doors
  menu. A **shoe rack** at the foot, an open rack of sloping shelves, always in
  the back right corner looking down the stairs: its back to the window,
  its end against the outside wall. It starts as the user worked out to fit
  a pair of UK 11 shoes on each shelf: 300 deep, 1290 high, its shelves
  sloping 45° down towards the window, and **Bevel for the door** on, cut
  for the internal door opening to 72°. With the bevel it's as wide as the
  well, its front-left corner cut where the door swings to the angle on
  **Bevel for internal door angle** (its front is then 252 wide); the cut
  stays as the door opens and shuts. Its sliders are in **The shoe rack
  (downstairs)** in Other options, which also says how long a shoe fits
  along a shelf and, without the bevel, how far the door opens.
- **Over the stairs**, in Hallway and stairs options: white floating
  shelves (0 to 3) and a blank picture in a thin black frame on each of
  the WC wall, the lounge door wall over the winders and the TV wall (the
  stairwell's outside wall), kept apart, all off to start; L-shaped
  shelves joining the TV and WC walls in their corner; and a switch to hide the
  bathroom and WC, which stand in the way of seeing them
  ([HALLWAY_SHELVES.md](HALLWAY_SHELVES.md)).
- **The corner cupboards** (the lounge's, and the bedroom's New cupboard)
  each have a **Cupboard height** slider, from 1800 up to the ceiling, and
  the left-wall cupboard's length is a slider. The bedroom's reaches along
  the chimney breast to the recess and out to the bedroom door's swing,
  and option 8 has its back-wall leg's length and where its diagonal starts
  on each leg (18 Oct 2026; `room_dimensions.md` has each).
- **The pine cupboard** can be switched off in the bedroom, and on in
  the living room in place of the bench, as the bookcase can.
- **The bedroom mirror** can be switched off too (**In the bedroom**, under
  Mirror in Bedroom options).
- **The carpet** (bedroom and stairs) is Cormar's Hampstead wool twist in
  Dormouse, drawn in its colour in the photo from the bedroom doorway,
  corrected for the photo's warm light by the woodwork's white (the
  maker's swatch came out too brown); its colour can be changed under
  **Carpet** in the Colours menu.
- **The garage**, 5327 long, 2866 wide and 2432 high (measured), placed
  off the site plan about 28 m out past the back wall, its door
  (estimated) drawn open. In it, in **Garage options**, each with an **In
  the garage** switch, a place and a quarter turn: Sean, Billy,
  BillyChest, Metal (a table), Yellow (a cupboard), the scaffold bench,
  Small Billy (a cupboard), Potters (open shelves), Biltong and Trellis
  (boxes open at the top) and the bedroom's pine cupboard. Billy can lie
  on its long side, and Billy and BillyChest can be in the living room (in
  the bench's place) and the bedroom (on any wall) too, each on its own.
  So can an Ivar (2 × 2 pine cubes), which starts in the living room,
  lying by the first radiator, as it is now. Yellow and
  Biltong have a height above the floor, as they sit on the bench and on
  Trellis; Small Billy and Potters a gap from the wall behind. Sizes and
  where each starts in `room_dimensions.md`, "The garage".
- **The Look menu** chooses the **Room** (living room, hallway, bedroom,
  downstairs, garage):
  Where and Looking at offer that room's, and Bird's eye and Plan (2D)
  frame it.

What's next: `PLAN.md`.

Working rule: a branch for each piece of work; when it's done and tested,
it's merged into `main` and pushed, which publishes it.
