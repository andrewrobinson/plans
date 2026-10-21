# Tidying the code: what's left

Only what's still to do is here. What's done is in git history;
`room_3d_ui_guide.md` maps where everything is now, and
`room_dimensions.md` describes the configuration and how it was decided.

**How to work.** A branch per step, one kind of change per commit, so any
one can be undone on its own. Refactors keep what the page does, checked by
the snapshots and screenshots with no changes. `npm run test:model` (Node,
about 30 seconds) and targeted browser runs (`-g`) while working; the full
`npm test` (both devices, about 5.5 minutes) once, before it goes live.
Two sessions testing at once need separate ports (`PORT=8766 npm test`).
For a change across many lines, write a script that rewrites the calls by
their arguments, and let the snapshots check it. After a new setting,
`npm run regen` writes the saved configurations and snapshots again
through the model; check the diff holds only the new setting. The controls
tests' corner cupboard sizes test can time out under load and pass when
run again (item 1).

---

## Left to do

From the review of the code (19 Oct 2026), merged with what was here, in
order: the tests first, so the rest is checked by a suite that can be
trusted; then the small standalone pieces; then `state`'s track, each step
making the next easier. Each keeps what the page does (no snapshot or
screenshot changes) unless it says otherwise.

**The tests**

Reviewed again on 21 Oct 2026, before the UI fixes and the refactor: the
model's tests (36 saved configurations checked exactly in Node, and every
setting at its ends) guard a refactor of the model well; the browser tests
are weaker for UI changes. These come first, in this order; each has small
choices to settle with the user before it's built.

1. **The flaky test's cause**: the controls tests' "corner cupboard
   sizes" can time out under load and pass when run again (on 20 Oct 2026
   one desktop run had 9 timeouts, all passing on a rerun). Find why it's
   slow (too many rebuilds?) and fix that, rather than a longer timeout or
   retries.
2. **Screenshots free of the page's buttons, and fewer of them**: every
   phone screenshot holds the top bar and the corner buttons, so one UI
   change retakes most of them (taking away the Views ☰ retook 31 on 21
   Oct 2026), and baselines retaken wholesale stop catching anything. Mask
   the top bar, corner buttons and drawers (or take only the 3D view) in
   the rooms' screenshots, and add a few of the bar and menus alone, which
   UI changes are meant to change. Then drop those whose content the
   model's snapshots already check (dimensions, cutting lists, places) and
   keep a few per room: about 70 baselines today, `.git` mostly old
   screenshots. The 0.2% tolerance (`maxDiffPixelRatio` in
   `playwright.config.js`) let a real change through for days (the newel
   posts through the lounge doorway in `view-desk`): look again at it
   once the buttons are masked. Before the UI fixes (`UI_CRITIQUE.md`).
3. **The new views tested**: saved addresses (`tests/configs/`, with
   their snapshots) for a bedroom wall, a garage wall and a hallway wall
   in 2D: the snapshot's boxes say whether each piece is shown, which
   would have caught the garage's wall views coming out empty (21 Oct
   2026, found by eye); and a test of each room button's ▾ options
   (`roomViewChoices()`).
4. **A guard on `state`**: a model test that fails if any file but the
   model writes `state.` (a search of the source), so the menus keep
   writing only through `set(path, value)`. `living_room.js` reads it in 74
   places and writes it in none today. Before `state`'s track (11 to 15).
5. **The phone's top bar fits**: a test that at 390 wide the bar stays in
   its three rows, as `UI_CRITIQUE.md`'s step 1 asks to check by hand.
   With step 1.

**Decided with the user (21 Oct 2026)**, for items 1 to 5:

- **Screenshots of the 3D view only** (the canvas, not the page), so UI
  changes never retake the rooms' shots; a few shots of the top bar and
  menus alone for the UI. **2 or 3 per room** (bird's eye, plan and one
  view inside), plus Option 12 and Pretty, about 15 per device.
- **The tolerance tighter than 0.2%**, as far as the drawing allows
  without false failures, found by running each shot a few times.
- **Both devices stay** (the page is sometimes used on the phone): the
  controls tests move to desktop Chrome for everyday runs, the phone
  running only in the full suite at deploy (`testing_questions.md`).
- **The controls tests find a control by its label only when a UI step
  moves it**, not all rewritten first.
- **Deploy to main after each phase**: the tests, the UI fixes, then items
  6 to 10 (8 brought forward, before UI step 3's number box, which it
  serves); then stop to decide on `state`'s track (11 to 16).

Expect the controls tests to break in bulk as the menus are restructured:
they find controls by id (`#loungeViewKind`), not by what they do.

**Small, standalone**

6. **One `rebuild()`**: `build()`, `drawStored()`, `turnDoors()` and
   `updateDims()` in their order, in one function, which `buildFlat()` and
   the page both call, so nothing has to remember them. (A new flat per
   build, with no module state, was considered and not chosen.)
7. **The repeated measurements named**: `floor.js` has the recesses' 372
   (measured) written five times, and `RECESS_FROM`'s 610 and 2125 (the
   counter's depth and run, measured) bare.
8. **The menus' shared helpers into `kit/controls_kit.js`**: `slider()`,
   `lyingSwitch`, `wallPick()` and `resetButtons()`, from `other_room.js`,
   which the stairs', shoe boxes', wicker bench's and garage's modules
   import today. Each piece keeps its own menu in its own file.
9. **One `drawFloor()`**, in named steps: the living room's walls, the
   ceiling and lights, the outer wall, the bedroom's shell, the hallway and
   stairs, the entrance, the bathroom. Today `floor.js` (841 lines) draws on
   import, partly at its top level, partly in functions called at its end.
   Its numbers named on the way (measured, estimated or chosen). The model's
   own load-time calls (the room door's drawing, `benchHeights()`,
   `placeDresser()`) go too, if the snapshots hold without them.
10. **`kit/view_kit.js`'s `create()` split**: one function of 482 lines
   holding about 40 inner ones. Its parts (rooms and places, eyes, looks,
   saved views, the camera) as functions or modules of their own, each
   given what it needs.

**`state`'s track**

11. **The option held as its number** (7 to 11, 16) in `state`, as the
   configuration has it, not its index in `OPTIONS`; `optionAt()` only
   where the list is indexed, and `CURRENT` no longer "the last one".
12. **The door angles into the view** (decided 17 Oct 2026,
    `ui_paradigm_analysis.md`): out of the configuration (`doors.*`), so
    Packing and walking in no longer change the flat.
13. **What's worked out leaves `state`** (`ui_paradigm_analysis.md`,
    recommendation 5): `settle()` and `placeStored()` keep worked-out values
    (the TV's size, where the dresser stands, the things to store's places)
    beside the settings, so the order of calls matters; `build()` turns
    option 8 into 7.
14. **`state` in the configuration's shape, a room at a time**: the
    lounge's `billyOn`, `billyMove` and `billyLying` become
    `pieces.billy.in.livingRoom.*`, and so on, the bedroom's and the
    garage's likewise, till each schema entry maps a path onto itself. The
    shoe boxes get their own place (now in `state.stairWalls.shoeBoxes`).
    One room per step.
15. **The configuration as the store, `state` going**
    (`ui_paradigm_analysis.md`, recommendation 1's second half): after 14,
    a rename. `flat_model.js` reads `state.` in 113 places.

**Then**

16. **The controls tests from the page as it opens**: today they start
    from `designed` (option 10 with the bench and the dresser), so the
    default page's controls are tested only where a test sets them. All of
    them moved, each switching on what it needs. The largest job here;
    after 14 and 15, which change the paths the tests read.

As you go (CLAUDE.md): a function's numbers named and long functions split
when they're next changed; `stairWallsControls()` (about 80 lines) is the
first.

Any time:

- **The big files**: `flat_model.js` has grown from 1,582 lines after the
  corner cupboard left it to 1,917, and `living_room.js` is 1,309. Which
  pieces could leave each, to decide (suggested 19 Oct 2026, not agreed).
- **Old branches**: ten local branches and a worktree
  (`.claude/worktrees/`) from merged work, to delete once checked merged.
- **`testing_questions.md`**: still open (phone or desktop, window size,
  how often), with fewer browser runs now most combinations run in Node.

---

## The steps named in the code's comments

Comments point at these by number; each is in `git log`.

| Step | What it did |
|---|---|
| 1 to 4 | The browser tests, one `state`, the engine in `kit/`, the rooms' files |
| 5 | Readable code in the style of `menu_demo/` (16 Oct 2026) |
| 6a | Saved snapshots beside the tests' configurations, checked exactly |
| 6b | The configuration as JSON, and the address as it, compressed |
| 6c | The model in `flat_model.js`, built and tested in Node |
| 6d | The corner cupboard as `corner_cupboard.js`, an instance per room (17 Oct 2026) |
| `set(path, value)` | The menus change settings by their paths in the configuration (17 Oct 2026) |

---

## After each step

- Update `room_3d_ui_guide.md` (its map and file names), and `PLAN.md`'s
  next steps.
- Commit with a message in the repo's "Plans: …" style.
