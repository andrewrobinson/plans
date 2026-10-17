# Tidying the code: what's left

One step is left: **6d, the corner cupboards**, the last part of step 6
(one configuration, as JSON). It changes how the code is organised, not
what the page does: the page must look and behave exactly as before,
which the tests check (`tests/`), bar the bedroom cupboard's 2 mm (below).

What's done is in git history: the browser tests, one `state`, the kit,
the rooms' files (steps 1 to 4); readable code in the style of
`menu_demo/` (step 5, finished 16 Oct 2026); and step 6's 6a (the
snapshots), 6b (the configuration and its URL) and 6c (the model in
`flat_model.js`, tested in Node). `room_3d_ui_guide.md` maps where
everything is now; `room_dimensions.md` describes the configuration.

**How to work.** A branch per step, one kind of change per commit, so any
one can be undone on its own. `npm run test:model` (Node, about 30
seconds) and targeted browser runs (`-g`) while working; the full
`npm test` (both devices, about 5.5 minutes) once, before it goes live.
Two sessions testing at once need separate ports (`PORT=8766 npm test`).
For a change across many lines, write a script that rewrites the calls by
their arguments, and let the snapshots check it. The controls tests'
corner cupboard sizes test can time out under load and pass when run
again.

---

## 6d. The corner cupboards

Where 6c left it: the model kept one flat in module state, and
`living_room.js` reaches into it for much (its export list).

**Done 17 Oct 2026** (items 4, then 1 to 3, as one step; snapshots and
screenshots unchanged bar the first):

4. **The bench out of the options**: the living room draws it beside the
   cupboard (`drawBench()`, from the option's `benchFrom()`), so a
   cupboard's build is the cupboard only; `isBench()` and `takeOutBench()`
   went. The snapshots' `cornerCupboard` box became the cupboard alone.
1. **Their own module**: `corner_cupboard.js`, with `OPTIONS`, the
   builders, the shelves, the inside spaces, `opensTo()`, the dimensions
   and the cutting list; `flat_model.js` went from 2,220 lines to 1,582.
2. **One settings record**: `CUPBOARD_SETTINGS` (`option`, `T`, `R`, `F`,
   `BOARD`, `LEG`, `LEG_D`, `L_SHELVES`, `WARD`, `WARD_D`, `TOWER`,
   `CORNER_W`, `CORNER_D`, `SIDE_*`), the cupboard's piece in the
   configuration. For now `cupboardSettings()` picks it from `state`, which
   keeps them flat (the menus use them in 73 places); gathering them in
   `state` goes with `set(path, value)`, below.
3. **Builders take arguments**: `buildCupboard(settings, place,
   materials)`, reading neither `state` nor the living room's constants;
   the living room is `LIVING_ROOM_PLACE` (width, depth, ceiling, its
   door). `opensTo()` checks against the cupboard's own room.

5. **An instance** (17 Oct 2026): `makeCupboard(settings, place,
   materials)` gives `{ group, doors, shelves, drawShelves(),
   shelfCutText(), turnDoors(), cuttingList(), cuttingRows(), partOf(),
   dims(), doorDims() }`; `current`, `cupShelves`, `cupCuts` and
   `cupShelfGroup` went, the living room keeping `cupboard` and
   `livingGroup`. Each board is marked with its kind (`userData.kind`), so
   the cutting list and door sizes no longer find parts by material.

**Left**:
6. **The bedroom's instance**: built from the living room's settings,
   against the bedroom's `place`, in place of `copyCupboardToBedroom()`'s
   clone.

**Check**: the cutting lists in the snapshots must not change, bar the
bedroom's: its ceiling is 2445, so its copy comes out 2 mm taller than
the living room's (2443). About half a session left.

## Left over, after 6d

- **`set(path, value)`**: the menus change the configuration through it,
  in place of `changeSettings()` on `state` (decided in 6b, put off to
  after 6d in 6c).
- **The handles' 20s and 22s** (a bar's width and how far it stands off
  the door) could be named, as `HANDLE_BOTTOM` and `HANDLE_TOP` are.
- **The bedroom cupboard's own design** and Options list, its own colour
  picker, and engineering drawings from each cupboard's snapshot.
- **`PLAN.md`'s "Designs"** (a cupboard design as data, a printable spec
  for the maker) starts from 6d's settings record and instance: a design
  becomes a cupboard piece's configuration. **"Other parts in the cutting
  list"** is easier once the cutting list belongs to an instance and reads
  `userData.kind`.
- **`testing_questions.md`**: still open (phone or desktop, window size,
  how often), with fewer browser runs now most combinations run in Node.
- **The review of the abstractions** (17 Oct 2026),
  `ui_paradigm_analysis.md`: the configuration, the view and the URL
  against the usual UI patterns, and six recommendations, `set(path,
  value)` first. Decided there: **the door angles move into the view**,
  out of the configuration, so Packing and walking in no longer change
  the flat (it reverses 6b's "Door angles" row, below). After 6d.

---

## How step 6 was decided (16 Oct 2026)

**Why**: settings, menus, drawing and the address all reached into one
global `state`; the address was about 75 unnamed values in the order they
were added; and the flat could only be built inside the page, so every
test drove a browser. Step 6 puts a configuration between the menus and
what's drawn, and everything else follows from it.

Two JSON documents: **the configuration** (input: everything chosen, each
piece once, with a `version`; the URL's first part, compressed) and **the
snapshot** (output: the configuration as read, each cupboard's cutting
list, the dimension figures, the description and each piece's box; saved
beside each test configuration in `tests/snapshots/` and compared
exactly; later the source for engineering drawings). The view is the
URL's second part.

| Question | Decided |
|---|---|
| The menus | Stay exactly as they are, in look and behaviour |
| The configuration's shape | **By piece**: each piece once, with its design and where it is in each room. The two corner cupboards are two pieces |
| Names inside a piece | `state`'s (`T`, `R`, `LEG_D`, `L_SHELVES`, …), renamed only where the piece says it (`BENCH` → `bench.design.height`) |
| Places | Flat, in each room's own axes, as the sliders: `{ on, x, y, turn }` in the living room and garage, `u, v` in the bedroom, `along, across` in the hallway |
| Choices | Words (`above: "tvAndShelves"`); options by number (7 to 11, 16); colours stay codes; sizes in mm |
| `version` | 1; up only when a setting changes its path or meaning. Missing settings take their defaults, unknown ones are ignored, another version is ignored with a warning |
| The view | A document of its own: `room`, `view` (or `camera`), `eye`, and the display switches (Dimensions, Door sizes, Cupboard only, See-through) |
| Door angles | In the configuration (they're the flat's state), so scenes keep them |
| The URL | `#<configuration>~<view>`, each the full JSON, deflated and base64url'd. The full configuration, not changes from defaults, so a link never changes meaning when a default does. Old links needn't work (agreed 12 Oct 2026) |
| Schema entries | Each module's list (`OTHER_ROOM_SCHEMA`, …), ranges written in it (`SLIDER_RANGES`, checked against the sliders by a browser test), defaults from its `…_START`; the general code in `kit/config_kit.js`. Ranges are checked, steps not, bar quarter turns |
| JSON in and out of the page | Only `window.plans`: `export()`, `view()`, `load(json)`, `snapshot()`, for the tests and the browser console |
| The model | One `flat_model.js`, with `buildFlat(config, view)`; `living_room.js` keeps the page. `dressers.js`, `larders.js` and `sofas.js` are ES modules; canvases in Node are the kit's `makeCanvas()` stand-in |
| Its working state | Module state, one flat, until 6d's cupboard instances |
| Testing the model | `node --test` with `three@0.160.0` (the page's version): `npm run test:model`. Every saved configuration gives its saved snapshot; 1,728 generated ones (every option, each setting at its ends, each board thickness) build, fit their rooms with the doors opened, and round-trip through the URL |
| The browser tests | Keep the controls, the screenshots and the snapshots |
| The corner cupboard (6d) | The bedroom gets **a second instance** built from the living room's settings (a copy, for now), not a clone of what's drawn, built against its room's `place`. Each cupboard has its own materials and its boards tagged by kind; the bedroom's copies the living room's colour |

---

## After each step

- Update `room_3d_ui_guide.md` (its map and file names), and `PLAN.md`'s
  next steps.
- Commit with a message in the repo's "Plans: …" style.
