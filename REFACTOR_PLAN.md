# Tidying the code: what's left

Step 6 (one configuration, as JSON) finished with **6d, the corner
cupboards**, on 17 Oct 2026 (below, until this is pruned again). It
changed how the code is organised, not what the page does, which the
tests check (`tests/`), bar the bedroom cupboard's 2 mm. Then, the same
day, `set(path, value)`, and the bedroom cupboard's own design with the
menus by room. What's left is
"Left over, after 6d".

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

6. **The bedroom's instance** (17 Oct 2026): `buildBedroomCupboard()`
   makes its own, against `BEDROOM_PLACE` (3682 along the chimney breast,
   2841 out, 2445 high) in its own materials (`makeMaterials()`), its
   shelves whole (nothing's stored in it) and its cutting list its own,
   in place of `copyCupboardToBedroom()`'s clone. The two are to evolve
   apart (agreed 17 Oct 2026): for now it takes the living room's settings
   and colours through one seam each (`bedroomCupboardSettings()`,
   `copyColours()`), and its doors follow the living room's sliders.
   See-through became a display setting (`setDisplay({ seeThrough })`),
   set on every cupboard's materials.

**Checked**: every snapshot unchanged bar the bedroom's: its ceiling is
2445, so its boards came out 2 mm taller than the living room's (2443),
its doors 2439. 6d is done.

## `set(path, value)` (17 Oct 2026)

The menus change the settings by their paths in the configuration, in
place of `changeSettings()` writing `state` (decided in 6b, put off to
after 6d in 6c). Decided first (17 Oct 2026):

| Question | Decided |
|---|---|
| `state` | Stays, for now, as the store the drawing code reads, but the menus no longer write it: `set()` is the only way in. The configuration becomes the store, and `state` goes, later (below) |
| The value | The configuration's (an option's number, `above: 'shelves'`, sizes in mm), checked by its schema entry as a link's are; one refused is a console error, so the tests catch a control and its entry disagreeing. Controls holding the page's own values give the word through `wordAt()` |
| Several at once | `setAll([[path, value], …])`, one rebuild: an option with its default left-wall depth, a model with its sizes |
| The cupboard | Its settings gathered in `state.cornerCupboard` (`cupboardSettings(piece)`); its schema entries from `cupboardEntries(design, setting)`; its controls write and read through `cupboardPath`, so they can be pointed at the bedroom's |
| The doors | Through `set()` too, but only turning them (`turnDoorsTo()`, `update()`), nothing built again |
| Where | The model's `set`, `setAll`, `get`; the page's `change(edits, { look })` builds again round them. `plans.get()` still gives `state` |

**Done** (one commit each; every snapshot and screenshot unchanged): the
kit's one-setting steps (`readEntry()`, `configurationValue()`,
`wordFor()`, `entryAt()`, `entryOfSetting()`); the cupboard's settings in
`state.cornerCupboard` (the tests read them there); the model's `set()`,
`setAll()`, `get()`, `wordAt()` and `pathOfSetting()`, with a model test;
the cupboard's controls by `cupboardPath`, `build()` told the option on
show till then (`onShow`), as `set()` writes the new one first; every
other menu through `change()` (the rooms' modules' edits by
`roomEdits()`, the things to store by `setStored()`); the doors through
`turnDoorsTo()`. Nothing in `living_room.js` writes `state` now.

## The bedroom cupboard's own design, and the menus by room (17 Oct 2026)

Decided first (17 Oct 2026): the two corner cupboards can have completely
separate options, sizes, colours and doors; the bedroom's has its own
controls in Bedroom options (not the living room's switching with the
room), offering every option bar the current room, with no front to the
door frame; it starts as the living room's; its colour follows the living
room's until set; each has its own cutting list. And, asked for the same
day, the menus by room: **Cupboard options became Lounge options**, taking
the option list from the top bar and the living room's sections from
Other options; Bedroom options took the bedroom door and the carpet's
colour; Other options kept the hallway and stairs (the wicker bench, the
shoe rack, the doors downstairs) and the colours in this view.

**Done** (one commit each): the model's half (`state.bedroomCupboard`, a
second `cupboardEntries()` against the bedroom's ceiling, its doors
`doors.bedroomCupboardTall` and `Second`, its colour target
`colours.bedroomCupboard`, `optionsOnShow()` so each cupboard knows a new
option, `cupboardOf()` and `cuttingList(piece)`; `bedroomCupboardSettings()`
and `copyColours()` went), with the generated tests building the bedroom's
every option; the saved configurations and snapshots with its settings
at their defaults (checked: nothing else changed; bedroom-new-cupboard-
option07 set to option 7, as it showed); the menus by room (the
screenshots changed with the top bar only, the 2D views having more room
below it); the cupboard controls as a module, `cupboard_controls.js`
(`cupboardControls()`, `copyControls()`); the bedroom's controls, a copy
of the lounge's, with its colour, door sliders and cutting list.

## The rooms' buttons and options, on phones too (18 Oct 2026)

Decided with the user, one piece at a time, each tried locally first:

- **Room buttons**: the top bar has a split button for each room, Lounge,
  Bedroom, Garage and Hallway view. Its name goes to the room (the menus
  shut, Cupboard only off), seen as its ▾ says, Bird's eye or Plan (2D),
  kept for each on that device (the view kit's `showRoom()`).
- **The options button**, at the bottom left, follows the room in view,
  however you got there: Lounge, Bedroom, Garage options, or Hallway and
  stairs (the hallway and downstairs), each a drawer of its own. Other
  options (☰) keeps the wicker bench and the colours in this view; the
  shoe rack and the doors downstairs went to Hallway and stairs options.
- **On phones held upright** (up to 600 wide) a drawer is a sheet from
  the bottom, the room live above it, with a handle to make it taller or
  shorter (a third to two thirds of the screen), and only ☰ left in the
  top bar while it's open. Wider, the drawer's on the left, the room live
  beside it. No scrim: the views fit the part a drawer leaves clear
  (`covering()` in `kit/floor_kit.js`, the 3D view by `setViewOffset()`),
  so a slider's change can be watched while it's dragged. Checked at
  iPhone 13, iPhone SE, landscape and iPad sizes.
- **The cutting lists**: one in Lounge options, one in Bedroom options,
  each folded away till opened; none for the garage or the hallway. The
  2D views' Show cutting list button went.
- **The garage door** (Garage options): not shown (to start), open or
  closed, as `doors.garage`. Up and over, as the user described it: open,
  a canopy on its rail, its bottom edge 1 m out over the drive.

Every snapshot gained only `doors.garage`; the screenshots changed with
the top bar, the options button and the garage door (checked by eye); the
full suite passed on both devices. On the phone, a long menu scrolls in
its sheet; the old iPhone SE's narrow screen (320) still takes about five rows of bar
while no sheet's open.

## Left over, after 6d

- **The configuration as the store**, `state` going
  (`ui_paradigm_analysis.md`, recommendation 1's second half): the
  drawing code reads the configuration (or a cupboard's settings from it)
  in place of `state`. Easier after the door angles move into the view and
  what `settle()` and `placeStored()` work out leaves `state`
  (recommendation 5), as `configurationNow()` writes the things to
  store's worked-out places and `build()` turns option 8 into 7.
- **The handles' 20s and 22s** (a bar's width and how far it stands off
  the door) could be named, as `HANDLE_BOTTOM` and `HANDLE_TOP` are.
- **Engineering drawings** from each cupboard's snapshot, now each has
  its own design.
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
