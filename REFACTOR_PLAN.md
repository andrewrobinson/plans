# Tidying the code: what's left

Two steps are left: the living room out of `room_3d.html` (the rest of step
4), then readable code (step 5). Both change how the code is organised, not
what the page does: after each, the page must look and behave exactly as
before, which the Playwright tests check (`tests/`).

Done, and in git history: the browser tests; one `state` object; the
address read and written from one list (`ADDRESS`); and the engine, the
general code, moved into `kit/` as ES modules (`kit/floor_kit.js`, with
`view_kit.js` and `scene_kit.js`), so the page now needs a server
(`python3 serve.py`, GitHub Pages, or the installed app).
`room_3d_ui_guide.md` maps where everything is now.

**How to work.** A branch per step, one kind of change per commit, so any
one can be undone on its own. `npm run test:quick` (phone size, WebKit,
about a minute) after each commit; the full `npm test` before it goes live.
Two sessions testing at once need separate ports (`PORT=8766 npm test`), or
one tests the other's files. Old links and what's saved in the browser
needn't survive (agreed 12 Oct 2026).

---

## Step 4, the rest: the living room into `floor.js` and `living_room.js`

What's left in `room_3d.html`'s module is the living room: about 2,700
lines. Split it into the files `PLAN.md` lays out:

```
index.html                 the page: today's HTML and the drawers' controls, then the
                           room's module. It replaces the redirect in index.html today
floor.js                   the floor plan: the walls as lines with a thickness, the door
                           and windows in them, where each room's corner is. For now
                           only the living room's walls, door frame and windows
living_room.js             the living room, in its own mm from its corner:
                             its state and ADDRESS list
                             its fittings: kitchen, desk, chair, island
                             its cupboard options and their parts, the cutting list
                             its 2D dimensions (updateDims(), cupboardDims(), doorDims())
                             the things to store
                             show(), update()
                             its controls' listeners and syncControls()
                             its built-in views and anchors
living_room.views.js       today's room_3d.views.js
living_room.scenes.js      today's room_3d.scenes.js
dressers.js, larders.js,   today's room_3d.dressers.js, .larders.js, .sofas.js
sofas.js
room_3d.html               a redirect into index.html, with its #address, so the
                           installed app keeps working
```

The things to store could later go into a kit of their own, if another room
needs them.

### The engine and a room

The engine knows nothing about cupboards. A room hands it:

- `state`, its settings, and `ADDRESS`, its fields in the address (both
  exist now, from steps 2 and 3);
- `build(group)`: draws the room's fittings and whatever its settings say,
  i.e. today's `show()` less the menu work;
- `syncControls()` and its controls' listeners, which call back into the
  engine to rebuild and to write the address;
- its views, anchors, scenes and dimensions.

The engine draws the floor from `floor.js`, then each room in a group placed
at its corner, so a room's numbers stay in its own mm. Today's address is
the living room's; when there are more rooms, each room's part of the
address needs a name in front of it (`PLAN.md`: old links needn't survive).

### How, safely

- **The walls and openings first**, into `floor.js`; then the fittings and
  options into `living_room.js`, a section at a time.
- **Watch for shared variables.** In one module everything can see
  everything. Split into files, each has to export what the others use. A
  missing one shows as a `ReferenceError`, which the tests fail on. Watch
  too for a `const` that now replaces a hoisted function: used before its
  line, it throws.
- **Watch for two-way dependencies.** The room calls the engine's helpers,
  and the engine calls the room's `build()`; keep the engine free of
  anything room-specific so there are no cycles.
- **Rename the data files**; update the imports or `<script>` tags, and the
  test that reads `room_3d.scenes.js` (`tests/room_3d.spec.js`).
- **Update the offline list**: every file in `FILES` in `sw.js`, and bump
  `CACHE`, or the installed app breaks offline; and `manifest.webmanifest`'s
  start page.

### Check

The tests, against `index.html` focused on the living room: the same
screenshots and addresses as now. Point `tests/helpers.js`'s `openRoom()`
at the new page. Then, by hand: the drawers, the three pop-up menus, Share,
Reset, the 2D views with dimensions, dragging a stored thing in the plan
view, and going offline after one load (DevTools → Network → Offline) and
reloading.

---

## Step 5: readable code, in the style of `menu_demo/`

`menu_demo/` (14 Oct 2026) draws the same room, written from scratch to be
read. It's far easier to follow than `room_3d.html`. Most of that is because
it does far less, but some comes from choices `room_3d.html` can copy. This
step applies those choices to the files step 4 makes.

**Do it after step 4, not during it.** Step 4 moves code without changing
it, so if a test fails, the cause is a missing name. If code were renamed
while it moved, a failure could come from either the move or the rename.
Here, one kind of change per commit, a file at a time, `npm test` after each.

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
| 4, the room | Large: about 2,700 lines into two files, over a session or two | Medium: mostly missing names, which the tests catch at once |
| 5 | Medium to large: a file at a time, a session or two each for the room and the options | Low to medium: renames and splits, each checked by the screenshots |
