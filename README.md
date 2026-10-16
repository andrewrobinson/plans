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
`npm run test:model` (about half a minute). The browser tests (Playwright):
`npm run test:quick` (a phone, about a minute) after each change, and the
full `npm test` before anything goes to `main`. `npm run test:update`
takes new screenshots and snapshots when a change is meant to show.

## Where things are

| File | What |
| --- | --- |
| `index.html` | The page and its menus |
| `floor.js` | The walls, doors and windows: the living room's, the hallway's (`HALLWAY`, with the stairs), downstairs (`ENTRANCE`) and the bedroom's (`OTHER_ROOM`, in its own u, v mm) |
| `flat_model.js` | The model: the living room's fittings and cupboard options, the settings and the configuration's schema, the dimensions, cutting list and things to store, with no page, so Node builds it too (`buildFlat()`) |
| `living_room.js` | The page: the menus and controls, the built-in views, the scenes and the page address |
| `other_room.js` | The bedroom's furniture and fitted cupboards, and their sliders |
| `wicker_bench.js` | The hallway's wicker bench, which can be on in any room, and its sliders |
| `shoe_rack.js` | The shoe rack at the foot of the stairs, downstairs, and its sliders |
| `garage.js` | The garage (off the site plan, in its own x, y mm), what's in it, and Garage options' sliders |
| `living_room.views.js` | The rooms, places (Where), things (Looking at), eye heights and config-defined views, for editing |
| `living_room.scenes.js`, `dressers.js`, `larders.js`, `sofas.js` | Scenes and furniture catalogues, for editing |
| `kit/config_kit.js` | The configuration: reading and writing it through a schema, and packing it for the address |
| `tests/` | The browser tests, the saved configurations (`configs/`) and snapshots (`snapshots/`), and the model's tests in Node (`model/`) |
| `kit/` | The engine: `floor_kit.js`, `view_kit.js` (views, rooms, Where and Looking at), `scene_kit.js` |
| `drawings/` | The floor plans, and `measure_sheet.html` for sending measurements |

The notes:

- `CLAUDE.md`: how to write the code.
- `PLAN.md`: what's done and what's next.
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
  (boxes open at the top) and the bedroom's pine cupboard. Yellow and
  Biltong have a height above the floor, as they sit on the bench and on
  Trellis; Small Billy and Potters a gap from the wall behind. Sizes and
  where each starts in `room_dimensions.md`, "The garage".
- **The Look menu** chooses the **Room** (living room, hallway, bedroom,
  downstairs, garage):
  Where and Looking at offer that room's, and Bird's eye and Plan (2D)
  frame it.

Next (`PLAN.md`): Y to check (2330, against 3360 on the drawing); the
stairs' going (X) and the winders' sizes; the right sill board's 2370
against the hallway's 2330, and the WC wall's bottom over the stairs (how
deep, how far down); the bathroom and WC; walls seen from above in the bedroom's
and hallway's plans; looking from the hallway into a room; stopping
furniture at the walls.

Working rule: a branch for each piece of work; when it's done and tested,
it's merged into `main` and pushed, which publishes it.
