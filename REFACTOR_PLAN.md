# Tidying the code: what's left

Two steps are left. Step 5, readable code, is all but done. Step 6, one
configuration as JSON (agreed 16 Oct 2026), puts a configuration between
the menus and what's drawn, makes the URL that configuration, compressed,
and lets the model be built and tested without a browser; 6a, the safety
net, 6b, the configuration and its URL, and 6c, the model without the
page, are done. Both change how
the code is organised, not what the page does: the page must look and
behave exactly as before, which the Playwright tests check (`tests/`).
Step 6 changes the URL's format; old links needn't work.

Done, and in git history: the browser tests; one `state` object; the
address read and written from one list (`ADDRESS`); and the engine, the
general code, moved into `kit/` as ES modules (`kit/floor_kit.js`, with
`view_kit.js` and `scene_kit.js`), so the page now needs a server
(`python3 serve.py`, GitHub Pages, or the installed app); and the living
room out of `room_3d.html` into `index.html`, `floor.js` and
`living_room.js` (step 4).
`room_3d_ui_guide.md` maps where everything is now.

**How to work.** A branch per step, one kind of change per commit, so any
one can be undone on its own. `npm run test:quick` (phone size, WebKit,
about a minute) after each commit; the full `npm test` before it goes live.
Two sessions testing at once need separate ports (`PORT=8766 npm test`), or
one tests the other's files. Old links and what's saved in the browser
needn't survive (agreed 12 Oct 2026).

---

## When a second room comes

Step 4 is done (14 Oct 2026): `index.html` is the page, `floor.js` has the
walls, door frame, ceiling and windows, `living_room.js` the rest of the
room, and `room_3d.html` redirects. Two parts of it wait for a second room,
as there's nothing to test them against until then:

- **The engine takes a room's `build(group)`**: today's `show()` less the
  menu work, drawn into a group placed at the room's corner, so its numbers
  stay in its own mm. The room hands the engine its `state`, `ADDRESS`,
  `syncControls()`, views, anchors, scenes and dimensions. Keep the engine
  free of anything room-specific, so there are no import cycles.
- **The address**: each room's part needs its name in front of it (old links
  needn't survive).

The bedroom came on 15 Oct 2026, ahead of this: its walls are in
`floor.js`'s `otherRoom` group, placed at its corner so its numbers stay in
its own mm, and its furniture in `other_room.js`. Its settings are
`state.otherRoom` in `living_room.js`, written at the end of `ADDRESS`
(`OTHER_ROOM_ADDRESS`), redrawn from `redrawAround()`, and its sliders made
by `otherRoomControls()`. That's the piece to lift out when the engine
takes each room's `build(group)`.

The hallway followed the same day, in `floor.js`'s `hallway` group, in the
living room's mm. The view kit now knows the rooms (`config.rooms`, each
place and thing's `room`, built-in views with `rooms` that frame whichever
is chosen) and puts the room chosen at the end of the view's part of the
address, unless it's the living room, so the living room's addresses
didn't change. The settings' part still has no room names.

**Replaced by step 6 (16 Oct 2026).** The two parts above become step 6's:
`buildFlat(config)` (6c) in place of each room's `build(group)`, and a
configuration by piece, each piece saying which rooms it's in (6b), in
place of room names in front of the address's parts.

---

## Step 5: readable code, in the style of `menu_demo/`

`menu_demo/` (14 Oct 2026) draws the same room, written from scratch to be
read. It's far easier to follow than `living_room.js`. Most of that is because
it does far less, but some comes from choices `living_room.js` can copy. This
step applies those choices to `living_room.js`, `floor.js` and the kit.

One kind of change per commit, a file at a time, `npm test` after each.

### Where it's got to (15 Oct 2026, later)

On the `refactor` branch, a commit each, and on main up to "the handles'
heights named":

- Done: `box()` takes `{ from, to }` (every call, by script); the room's
  constants have long names (`ROOM_WIDTH`, `ROOM_DEPTH`, `CEILING_HEIGHT`,
  `DOOR_FRAME_STARTS_AT`, `DOOR_HINGE_AT`, `WALL_THICKNESS`,
  `KITCHEN_RECESS_BACK_WALL_X`); `show()` split into `buildOption()`,
  `takeOutBench()`, `showInMenus()` and `redrawAround()`; the handles'
  heights named (`HANDLE_BOTTOM`, `HANDLE_TOP`); the door gaps named
  (`DOOR_GAP`, with the 6s and 9s as 2 and 3 gaps), and the kitchen's
  worktop (`KITCHEN.worktopT`, `worktopProud`), the island's top
  (`island.topT`), the desk's top (`DESK_TOP_T`) and option 8's
  `SHELF_SETBACK`. The dresser and larders keep their own 3s and 40s, as
  bought furniture; the handles' 20s and 22s could be named too. Options
  8's and 9's `build()` and `cornerCupboard()` in named steps
  (`diagonalCarcass()`, `diagonalShelves()`, `diagonalDoors()`;
  `wardCarcass()`, `wardDoors()`; `cornerCarcass()`,
  `cornerDoorsToKitchen()`, `cornerDoorsToWindows()`), drawing in the
  same order so the cutting lists don't change. The other options'
  `build()`s were already short, as is `fullHeightL()`. One function
  changes the settings: every settings control calls `changeSettings(edit,
  { option, look })`, which changes `state`, puts every control in step
  (`syncControls()`), shows the option and, with `look`, refreshes the
  view; `setDepth()` and `setTvSize()` are gone, and `setDresser()`,
  `setSofaSize()` and `setLarderSize()` only change `state`. Not through
  it: the door sliders and view switches (not settings), and the things
  to store, which have their own (`drawStored()`).
  Each file opens with what it's for: `living_room.js` now also says how
  a change flows through the page and maps its sections, `index.html` and
  `floor.js` say what they hold, and `room_3d.css` names its page.
  `room_3d_ui_guide.md` has the new names, line numbers and
  `changeSettings()`.
- Done (16 Oct 2026, on the `loose-ends` branch): `board()` takes
  `{ from, to }` as `box()` does (all 36 calls, by script; the snapshots
  unchanged).

Scripts that rename only in code (not comments or strings) and rewrite
calls by their arguments made the first two safe; write one again for
any change across many lines, and let the screenshots check it.
`tests/controls.spec.js`'s corner cupboard sizes test can time out under
load and pass when run again.

### What to change

- **Name the box's corners.** `box(x0, y0, z0, x1, y1, z1, mat, parent,
  edges)` has nine arguments in a row. Make it
  `box({ from: [x0, y0, z0], to: [x1, y1, z1] }, mat, parent)`, as
  `addSolidBox()` in `menu_demo/room.js` does. Do it as one mechanical change
  (a script, checked by the screenshots), then add names to the corners where
  sums are hard to read.
- **Name the numbers.** Measurements typed straight into the code (950 and
  1250 for handles, the 3s and 9s of door gaps, 25 and 40 for worktops)
  become named constants next to a comment saying where they came from, as
  `room.js` does for the room (`WINDOW_SILL_HEIGHT`, `DOOR_HINGE_AT`).
- **Longer names for the room's own constants**: `W` →
  `ROOM_WIDTH`, `D` → `ROOM_DEPTH`, `H` → `CEILING_HEIGHT`, `FRAME` →
  `DOOR_FRAME_STARTS_AT`, `RECESS_X` → `KITCHEN_RECESS_BACK_WALL_X`, and so
  on, with `room_dimensions.md` updated to match.
- **Keep the cupboard settings' short names** (`T`, `R`, `F`, `BOARD`,
  `BENCH`, …), as agreed in step 2: they match `room_dimensions.md` and keep the
  geometry lines short. Instead, give `state` a comment for each, which it
  mostly has already.
- **Split long functions into named steps**, as `buildTheRoom()` calls
  `addFloor()`, `addBackWall()`, `addLeftWall()`, …. Do this first for each
  option's `build()` and for `cornerCupboard()`, `fullHeightL()` and
  `show()`.
- **One function changes the settings.** In `menu_demo/main.js` every
  slider goes through `showTheBox()`, which keeps the box inside the room,
  redraws it and updates the controls and the debug text. Step 3's
  `syncControls()` is half of this. Look for `set…()` functions that still
  update controls on their own, and route them through one place.
- **Write the comments for someone new.** Each file opens with what it's for
  and how its coordinates work, as `menu_demo/room.js` does.

### Not to change

- What the page does, or the address format (step 6 changes the format,
  not step 5).
- The short cupboard names in drawing code (above).

### Check

`npm run test:quick` after each commit, the full `npm test` before it goes
live, with no screenshot changes.

---

## Step 6: one configuration, as JSON

### Why

Settings, menus, drawing and the address all reach into one global
`state` in `living_room.js`, with blocks of their own for the bedroom
(`otherRoom`), the wicker bench, the shoe rack and the garage. The
address is about 75 values joined by `-`, in the order they were added,
with no names, so a field can't be moved or taken out, and the controls
tests read it by position (`settingsField(hash, k)`). Which rooms a piece
is in is said a different way for each piece (`otherRoom.cupboardOn`,
`pineOn`, `garage.pine.on`, `wickerBench.hallway.on`). The flat can only
be built inside the page, so every test drives a browser, and trying many
combinations of settings is slow.

Step 6 puts a configuration between the menus and what's drawn, and makes
everything else follow from it.

### Decided (16 Oct 2026)

| Question | Decided |
|---|---|
| The menus | Stay exactly as they are, in look and behaviour. They change the configuration through one `set(path, value)` instead of `state` directly |
| The configuration's shape | **By piece**: each piece once, with its design (sizes, option, colours) and `in: { room: { on, place, turn } }`. The two corner cupboards are two pieces |
| The view | **A file of its own**: the room you're in, where you stand and look, eye height. Not part of the configuration, so configuring rooms and looking at one stay apart |
| Door angles | In the configuration (they're the flat's state), so scenes keep them. Today they're in the view's part of the address |
| Dimensions, Door sizes, Cupboard only, See-through | In the view, so links show them. Today they're in no address |
| The URL | `#<configuration>~<view>`, each the full JSON, deflated and base64url'd (the browser's and Node's own `CompressionStream`). The full configuration, not changes from defaults, so a link never changes meaning when a default does. Old links needn't work |
| JSON in and out of the page | Only `window.plans` for now: `export()`, `load(json)`, `snapshot()`, for the tests and the browser console. No buttons |
| Testing the model | Node's own test runner, with `three@0.160.0` (the version the page loads) as a devDependency: `npm run test:model` |
| Order | 6a safety net, 6b configuration and URL, 6c model API and Node tests, 6d corner cupboards. Each on main before the next starts |
| The corner cupboard | All of 6d below. The bedroom gets **a second instance** built from the living room's settings (A, a copy, for now), not a clone of what's drawn |
| Where it fits | Each cupboard is built against its room's `place`: ceiling height, wall lengths, and the fits options need (option 8's diagonal clear of the room door, `CORNER_D` up to the door frame). The bedroom's ceiling is 2445, so its copy is 2 mm taller than the living room's (2443) |
| Cupboard colours | Each cupboard has its own materials and its boards tagged by kind, which separate cutting lists need. The bedroom's copies the living room's colour; a picker of its own comes when it's wanted |

### Two JSON documents

- **The configuration** (input): everything chosen. Each piece, its design,
  which rooms it's in and where; colours; doors; the things to store.
  Written by the menus, by tests, and by generators of test cases. The
  URL's first part is this, compressed. It has a `version`.
- **The snapshot** (output): what the model makes of a configuration. The
  configuration as resolved, each cupboard's cutting list, the dimension
  figures, the description text, what fits where. Never written by hand.
  Saved beside each test configuration and compared exactly; later the
  source for engineering drawings.

The view's JSON is the URL's second part.

### 6a. A safety net (nothing on the page changes)

The screenshots pass if under 0.2% of pixels differ, so a board moved by
2 mm or a board fewer in the cutting list can pass, and they only see the
views they open. Before anything moves:

1. **`window.plans.snapshot()`**: `state` as JSON, each cupboard's cutting
   list, the dimension figures and the description text.
2. **Saved snapshots**: `tests/snapshots/<name>.json` for each saved
   address and scene, compared exactly. More addresses for what none
   covers yet: the garage (pieces moved, raised, taken out), the
   bedroom's copy of the cupboard, the wicker bench in every room.
3. **The controls tests read settings, not the address**: through
   `window.plans`, not `settingsField(hash, k)`, so a new URL format
   leaves them alone.

**Done (16 Oct 2026)**, on the `safety-net` branch, a commit each:

- `window.plans.get()` gives `state` as JSON and the doors' angles
  (`doors`: `room`, `tall`, `second`, `bedroom`, `flat`, `outside`), as
  6b puts them in the configuration. `snapshot()` gives `settings` (as
  `get()`), `cupboards` (`livingRoom` and `bedroom`, each a cutting list
  as rows `{ kind, length, width, shaped, count, parts }`, or `null`),
  `dimensions` (the labels on show, so only 2D views have any) and
  `description` (`#summary`'s text). `cuttingList()` takes the cupboard to
  read, so the bedroom's copy has its own list (the same as the living
  room's until 6d's 2 mm).
- `expectSnapshot()` in `tests/helpers.js` compares them with `toEqual`,
  beside each screenshot: one file for both devices, which must agree;
  written when missing, or changed with `npm run test:update`.
- New addresses: `garage-moved-plan`, `bedroom-new-cupboard-option07` and
  `-option10`. The wicker bench in every room was already saved.
- The controls tests in `controls.spec.js` and `room_3d.spec.js` read
  `setting(page, path)` by `state`'s paths, and the option's number from
  the option list; `settingsField()` is gone.
- Left for 6b: the tests of older links (the shoe rack's, the garage's,
  and room_3d.spec.js's link without the last 25 fields) still write the
  address's fields by number, and the Views and Look tests read the
  view's part of the address (its id, eye height and room). Both change
  with the URL.
- Later, at 6c's start: a bounding box for each piece drawn in the
  snapshot, so a 2 mm move of anything is caught, not only the
  cupboard's boards (agreed 16 Oct 2026).

### 6b. The configuration and its URL

1. **The schema**: one entry per setting, with its path in the
   configuration, kind (a number with its range and step, on/off, a
   choice, a colour) and default. Each module gives its own pieces'
   entries. To start, a two-way map between `state` and the configuration,
   so the drawing code needn't change yet.
2. **Doors into the configuration; the display switches into the view.**
3. **The URL**: written and read through the schema. The page reads it
   before building (decompressing is asynchronous).
4. **Converting the tests**: the old reader stays for one commit, as a
   converter: each saved address is read the old way and written the new.
   Its snapshot must match exactly and its screenshot pass. Then the old
   reader, the `ADDRESS` lists and `settingsField` go. `living_room.scenes.js`
   is converted the same way; scenes and views saved in a browser are lost
   (agreed 12 Oct 2026).
5. **`room_dimensions.md`**: its address format becomes the
   configuration's.

**Done (16 Oct 2026)**, on the `configuration` branch, a commit each. The
user's choices, put to them first:

| Question | Chosen |
|---|---|
| Names inside a piece | `state`'s (`T`, `R`, `LEG_D`, `L_SHELVES`, …), renamed only where the piece says it (`BENCH` → `bench.design.height`), so the map to `state` is exact |
| Places | Flat, in each room's own axes, as the sliders: `{ on, x, y, turn }` in the living room and garage, `u, v` in the bedroom, `along, across` in the hallway |
| Choices | Words (`above: "tvAndShelves"`, `where: "byHand"`); options by number (7 to 11, 16); colours stay codes; sizes in mm |
| `version` | 1; up only when a setting changes its path or meaning. Missing settings take their defaults, unknown ones are ignored, another version is ignored with a warning |
| Waiting for the URL | A top-level `await` before `syncControls()` and `show()`; each write numbered, so only the latest lands |
| Schema entries | Each module's list (`OTHER_ROOM_SCHEMA`, …), ranges from its sliders, defaults from its `…_START`; the general code in `kit/config_kit.js`. Ranges are checked, steps not (saved designs have sizes between steps), bar quarter turns |
| `window.plans` | `export()`, `view()`, `load(json)` (in place, keeping the view) |
| Saved addresses and scenes | Full JSON: `tests/configs/<name>.json` (`{ configuration, view }`), and each scene's configuration in `living_room.scenes.js` |
| The view | `version`, `room`, `view` (or `camera`: kind, position, target, fov), `eye`, `dimensions`, `doorSizes`, `cupboardOnly`, `seeThrough` |
| Snapshots | `settings` stays `state`, so all 36 matched unchanged |
| Menus | Still `changeSettings()` on `state`; `set(path, value)` comes with 6c |
| Room names | `livingRoom`, `hallway`, `bedroom`, `downstairs`, `garage` everywhere (the views file's `living` renamed) |

What went in: the doors' angles in `state.doors`; `kit/config_kit.js`
and the schema; the view as JSON, its display switches each set by a
function; the URL `#<configuration>~<view>`; the saved addresses and the
scene converted by the old reader (kept for that one commit), every
snapshot unchanged and every screenshot passing; then the old reader,
the `ADDRESS` lists, the kit's field readers and the view kit's address
gone. Pieces always in one place have no `in` (the corner cupboard, what's
above the bench, the recess cupboards, the shoe rack). Scenes saved in a
browser before are dropped (agreed 12 Oct 2026); saved views and looks
are kept, as they were never addresses.

Left for 6c: the configuration is still a map onto `state`, so the drawing
code reads `state`; `buildFlat(config)` reads the configuration itself.
The tests compare what the page reads back (`plans.export()`,
`plans.view()`), not the address's text, as Node's deflate needn't give
the browser's bytes.

### 6c. The model without the page

1. **`buildFlat(config)`**: the flat's groups, each cupboard's cutting
   list and dimensions, and the description, with no DOM, camera or
   menus. The page calls it; `living_room.js` keeps the page's work
   (menus, views, the address). This is the biggest piece: the drawing in
   `living_room.js` is mixed with page work today.
2. **`tests/model/`**, run by `npm run test:model`:
   - every configuration in `tests/configs/` gives its saved snapshot;
   - generated configurations (every option, each board thickness, sizes
     at the ends of their ranges, each piece in each room it can be in)
     build without error, have no board of zero or negative size, keep
     pieces inside their rooms, and round-trip through the URL.

   A failing configuration is a link, to open and look at.
3. **The browser tests shrink** to what needs a browser: that each control
   changes the configuration as it should, and the screenshots.

**Done (16 Oct 2026)**, on the `model` branch, a commit each. The user's
choices, put to them first:

| Question | Chosen |
|---|---|
| Where the model goes | One `flat_model.js`, with `buildFlat(config, view)`; `living_room.js` keeps the page |
| Its working state | Module state, one flat: `buildFlat()` starts again and rebuilds. Instances come with 6d's cupboards |
| `set(path, value)` | After 6d: the menus keep `changeSettings()` on `state` |
| `dressers.js`, `larders.js`, `sofas.js` | ES modules, imported by the model |
| Canvases in Node | A stand-in, the kit's `makeCanvas()`: same shapes and text, no pictures |
| The schema's ranges | Written in it (`SLIDER_RANGES`); a browser test checks each against its slider |
| Dimensions | `buildFlat()` takes the view (`setDisplay()`'s fields) and gives the figures the page would show |
| Bounding boxes | Each piece's, to the mm, in the snapshots (`boxes`) |
| Generated configurations | For every option, each setting at its ends and each board thickness: 1,728 |
| Snapshots | Hold the configuration in place of `state` |
| The browser tests | Keep the screenshots and snapshots; the tests of reading a configuration moved to Node |
| Runner | `node --test`: `npm run test:model` |

What went in: the snapshots' configuration and boxes; the data files as
modules; the schema's ranges written in it; `makeCanvas()`; then
`flat_model.js`, drawing into `world`, with `setDisplay()`, `settle()`,
`build()`, `turnDoors()`, `describe()`, `buildFlat()` and `startAgain()`
(all the settings back as the page starts, before a configuration's read:
`plans.load()` had left the things to store's places and the dresser's
place from the configuration before); and `tests/model/`, where every
saved configuration gives its saved snapshot exactly, in about half a
second, and the generated ones in about 30 seconds.

Found by the generated configurations, not fixed (the model as it is):
option 8's and option 10's second door, opened to 180° (its slider's
end), swings out through the wall. The room check skipped configurations
with a door opened. **Fixed (16 Oct 2026, `loose-ends`)**: each of the
cupboard's second doors stops where it would meet a wall (`opensTo()`,
found a degree at a time, once per build), and the room check now
includes the doors opened. It also stopped option 9's left door, with no
left-wall cupboard, 409 into the left wall in `view-packing` (its snapshot
and screenshots updated).

Left for 6d: the model still keeps one flat in module state, and
`living_room.js` still reaches into it for much (its export list); the
corner cupboard's module and instance are 6d's.

### 6d. The corner cupboards

1. **Their own module**: `corner_cupboard.js`, with `OPTIONS`, the
   builders, the shelves, the cutting list and the cupboard's dimensions,
   out of `living_room.js`.
2. **One settings record**: `option`, `T`, `R`, `F`, `BOARD`, `LEG`,
   `LEG_D`, `L_SHELVES`, `WARD`, `WARD_D`, `TOWER`, `CORNER_W`,
   `CORNER_D`, `SIDE_*`, the living room cupboard's piece in the
   configuration.
3. **Builders take arguments**: `buildCupboard(settings, place,
   materials)`, reading neither `state` nor the living room's constants
   (`CEILING_HEIGHT` 46 times, `ROOM_WIDTH`, `DOOR_HINGE_AT`,
   `roomDoorGap()`).
4. **The bench out of the options**: the living room draws its bench
   beside the cupboard, so a cupboard's build is the cupboard only;
   `isBench()` and `takeOutBench()` go.
5. **An instance**: `makeCupboard(settings, place, materials)` gives
   `{ group, shelves, cuttingList(), dims(), doors }`. `current`,
   `cupShelves`, `cupCuts` and `cupShelfGroup` become its fields; each
   board is tagged with its kind (`userData.kind`), so the cutting list no
   longer finds parts by material.
6. **The bedroom's instance**: built from the living room's settings,
   against the bedroom's `place`, in place of `copyCupboardToBedroom()`'s
   clone.

Later, not in step 6: the bedroom cupboard's own design and Options list,
its own colour picker, and engineering drawings from each cupboard's
snapshot.

### Elsewhere, reconciled (16 Oct 2026)

- **"When a second room comes"**, above: replaced by 6b and 6c.
- **Step 5**: unaffected; its one optional item (`board()` taking
  `{ from, to }`) is done (16 Oct 2026), before 6d moves the builders.
- **`PLAN.md`'s "Designs"** (a cupboard design as data, a printable spec
  for the maker): 6d's settings record and instance are the start of it;
  a design becomes a cupboard piece's configuration.
- **`PLAN.md`'s "Other parts in the cutting list"**: easier after 6d, as
  the cutting list belongs to an instance and reads `userData.kind`.
- **`testing_questions.md`**: still open (phone or desktop, window size,
  how often). 6c moves most combinations into Node, so browser runs get
  fewer whichever way they're answered.
- **`room_3d_ui_guide.md`**: updated at the end of each of 6a to 6d.

---

## After each step

- Update `room_3d_ui_guide.md` (its map and file names), and `PLAN.md`'s
  next steps.
- Commit with a message in the repo's "Plans: …" style.

## Rough size

| Step | Size | Risk |
|---|---|---|
| 5 | Medium to large: a file at a time, a session or two each for the room and the options | Low to medium: renames and splits, each checked by the screenshots |
| 6a | Done (16 Oct 2026). Medium: 1 session. Mostly mechanical: 49 controls tests rewritten, a hook, snapshot files | Low: nothing on the page changes |
| 6b | Done in 1 session (16 Oct 2026). Large. Every setting gets a schema entry (about 75, across five files); the URL, its tests and scenes converted | Medium: the snapshots and the old reader as converter catch mistakes |
| 6c | Done in 1 session (16 Oct 2026): the drawing moved into `flat_model.js` (2,200 lines), `living_room.js` now the page (1,160) | The snapshots, with each piece's box, matched throughout |
| 6d | Medium to large: 2 sessions. The corner cupboard's module, builders with arguments, the bench apart, the instance, the bedroom's | Medium: the cutting lists in the snapshots must not change, bar the bedroom's 2 mm |

### Usage, estimated

About 7 to 8 sessions for step 6, each a sitting of a few hours. What
uses the most:

- **Reading `living_room.js`.** At about 3000 lines it's the biggest
  thing each session loads, and 6b, 6c and 6d all work in it. It shrinks
  as 6c and 6d move code out, so later sessions cost less.
- **Browser test runs.** The full suite is about 4.5 minutes. One full run
  per piece, at "deploy to main", and targeted runs (`-g`) while working.
  6a adds snapshot checks to tests that already run, not new page loads.
- **After 6c**, most checks run in Node in seconds, and the browser suite
  is smaller, so each later change (6d, and work after step 6) needs
  fewer browser runs. As measured on 16 Oct 2026: `npm run test:model`
  about 30 seconds (the 33 saved snapshots half a second of it, the 1,728
  generated configurations the rest); the phone suite about 1.3 minutes;
  the full browser suite about 5.5 minutes, 4 of them the desktop's.
- **6d** reads `flat_model.js` (2,200 lines) rather than all of
  `living_room.js`.

6a is the cheapest and the one to start with: it's worth having even if
the rest waits.
