# Tidying the code: what's left

One step is left: readable code (step 5). It changes how the code is
organised, not what the page does: the page must look and behave exactly as
before, which the Playwright tests check (`tests/`).

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
- Left: `board()` could take `{ from, to }` as `box()` now does; then
  step 5's "after each step": `room_3d_ui_guide.md` still has the old
  short names (`W`, `D`, `H`, `WALL`, `FRAME`, `HINGE`) and old line
  numbers.

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

- What the page does, or the address format.
- The short cupboard names in drawing code (above).

### Check

`npm run test:quick` after each commit, the full `npm test` before it goes
live, with no screenshot changes.

---

---

## After each step

- Update `room_3d_ui_guide.md` (its map and file names), and `PLAN.md`'s
  next steps.
- Commit with a message in the repo's "Plans: …" style.

## Rough size

| Step | Size | Risk |
|---|---|---|
| 5 | Medium to large: a file at a time, a session or two each for the room and the options | Low to medium: renames and splits, each checked by the screenshots |
