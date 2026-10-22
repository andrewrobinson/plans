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
`npm run test:model` (about 20 seconds). The browser tests
(Playwright): only those a change can break while working
(`npx playwright test --project=iphone -g "<name>"`), at most one
`npm run test:quick` (a phone, about two minutes) before a commit,
and the full `npm test` (both devices, about two and a half minutes; on
the desktop only the room tests tagged `@desktop`) once, before anything goes to
`main`. `npm run test:update`
takes new screenshots and snapshots when a change is meant to show.

## Where things are

`CODE_MAP.md` lists every file, what it holds and the names to search for.

The notes:

- `CLAUDE.md`: how to write the code.
- `CODE_MAP.md`: where everything is.
- `PLAN.md`: what's next.
- `room_dimensions.md`: every dimension the model uses, and the configuration's and the page address's format.
- `MEASUREMENTS_NEEDED.md`: what's measured and what's still to measure, in "Where it's got to".
- `REFACTOR_PLAN.md`: tidying the code.
- `room_3d_ui_guide.md`: how the page's HTML, CSS and JS fit together.

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
  ([notes/HALLWAY_SHELVES.md](notes/HALLWAY_SHELVES.md)).
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
