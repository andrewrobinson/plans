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

then open http://localhost:8765/index.html. The browser tests (Playwright):
`npm run test:quick` (a phone, about a minute) after each change, and the
full `npm test` before anything goes to `main`. `npm run test:update`
takes new screenshots when a change is meant to show.

## Where things are

| File | What |
| --- | --- |
| `index.html` | The page and its menus |
| `floor.js` | The walls, doors and windows: the living room's, the hallway's (`HALLWAY`, with the stairs), downstairs (`ENTRANCE`) and the bedroom's (`OTHER_ROOM`, in its own u, v mm) |
| `living_room.js` | The living room's fittings and cupboard options, the settings and the page address, and the built-in views |
| `other_room.js` | The bedroom's furniture and fitted cupboards, and their sliders |
| `wicker_bench.js` | The hallway's wicker bench, which can be on in any room, and its sliders |
| `shoe_rack.js` | The shoe rack at the foot of the stairs, downstairs, and its sliders |
| `living_room.views.js` | The rooms, places (Where), things (Looking at), eye heights and config-defined views, for editing |
| `living_room.scenes.js`, `dressers.js`, `larders.js`, `sofas.js` | Scenes and furniture catalogues, for editing |
| `kit/` | The engine: `floor_kit.js`, `view_kit.js` (views, rooms, Where and Looking at), `scene_kit.js` |
| `drawings/` | The floor plans, and `measure_sheet.html` for sending measurements |

The notes:

- `CLAUDE.md`: how to write the code.
- `PLAN.md`: what's done and what's next.
- `room_dimensions.md`: every dimension the model uses, and the page address's format.
- `MEASUREMENTS_NEEDED.md`: what's measured and what's still to measure, in "Where it's got to".
- `REFACTOR_PLAN.md`: tidying the code.
- `room_3d_ui_guide.md`: where each part of the page is.

## Where it's got to (15 Oct 2026)

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
  menu. A **shoe rack** at the foot, an open rack of shelves (430 wide,
  190 deep, 1240 high to start), always in the back right corner looking
  down the stairs: its back to the window, its end against the outside
  wall. Its sizes are sliders in **The shoe rack (downstairs)** in Other
  options. Its shelves slope down towards the window (30° to start, a
  slider), and it says how long a shoe fits along them, with a pair of UK
  11 shoes on each shelf, as far right as they go. **Bevel for the door**
  makes it as wide as the well and cuts off the corner the internal door
  swings through to the angle on its **Bevel for internal door angle**
  slider (78° to start); the cut stays as the door opens and shuts.
  Without it, the menu says how far the door opens before meeting the rack
  (79° as it starts).
- **The pine cupboard** can be switched off in the bedroom, and on in
  the living room in place of the bench, as the bookcase can.
- **The bedroom mirror** can be switched off too (**In the bedroom**, under
  Mirror in Bedroom options).
- **The carpet** (bedroom and stairs) is Cormar's Hampstead wool twist in
  Dormouse, drawn in its colour in the photo from the bedroom doorway,
  corrected for the photo's warm light by the woodwork's white (the
  maker's swatch came out too brown); its colour can be changed under
  **Carpet** in the Colours menu.
- **The Look menu** chooses the **Room** (living room, hallway, bedroom,
  downstairs):
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
