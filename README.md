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
| `floor.js` | The walls, doors and windows: the living room's, the hallway's (`HALLWAY`, with the top of the stairs) and the bedroom's (`OTHER_ROOM`, in its own u, v mm) |
| `living_room.js` | The living room's fittings and cupboard options, the settings and the page address, and the built-in views |
| `other_room.js` | The bedroom's furniture and fitted cupboards, and their sliders |
| `wicker_bench.js` | The hallway's wicker bench, which can be on in any room, and its sliders |
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
- **The hallway**, from the measured A to E, AB, AC, G and Y; the stairs
  are estimated, as W and X aren't measured; its wicker bench, measured,
  can be switched on in the bedroom and the living room too.
- **The Look menu** chooses the **Room** (living room, hallway, bedroom):
  Where and Looking at offer that room's, and Bird's eye and Plan (2D)
  frame it.

Next (`PLAN.md`): Y to check (2330, against 3360 on the drawing); the
stairs (W, X); the bathroom and WC; walls seen from above in the bedroom's
and hallway's plans; looking from the hallway into a room; stopping
furniture at the walls.

Working rule: a branch for each piece of work; when it's done and tested,
it's merged into `main` and pushed, which publishes it.
