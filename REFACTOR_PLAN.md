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

1. **The flaky test's cause**: the controls tests' "corner cupboard
   sizes" can time out under load and pass when run again. Find why it's
   slow (too many rebuilds?) and fix that, rather than a longer timeout or
   retries.
2. **Fewer screenshots**: 68 baselines (9.1 MB), changed by 50 commits;
   `.git` is 133 MB, mostly old screenshots. Drop those whose content the
   model's snapshots already check (dimensions, cutting lists, places), and
   keep a few per room for how it looks. Before the UI fixes
   (`UI_CRITIQUE.md`), which change many of them.
3. **A guard on `state`**: a model test that fails if any file but the
   model writes `state.` (a search of the source), so the menus keep
   writing only through `set(path, value)`. `living_room.js` reads it in 74
   places and writes it in none today.

**Small, standalone**

4. **One `rebuild()`**: `build()`, `drawStored()`, `turnDoors()` and
   `updateDims()` in their order, in one function, which `buildFlat()` and
   the page both call, so nothing has to remember them. (A new flat per
   build, with no module state, was considered and not chosen.)
5. **The repeated measurements named**: `floor.js` has the recesses' 372
   (measured) written five times, and `RECESS_FROM`'s 610 and 2125 (the
   counter's depth and run, measured) bare.
6. **The menus' shared helpers into `kit/controls_kit.js`**: `slider()`,
   `lyingSwitch`, `wallPick()` and `resetButtons()`, from `other_room.js`,
   which the stairs', shoe boxes', wicker bench's and garage's modules
   import today. Each piece keeps its own menu in its own file.
7. **One `drawFloor()`**, in named steps: the living room's walls, the
   ceiling and lights, the outer wall, the bedroom's shell, the hallway and
   stairs, the entrance, the bathroom. Today `floor.js` (841 lines) draws on
   import, partly at its top level, partly in functions called at its end.
   Its numbers named on the way (measured, estimated or chosen). The model's
   own load-time calls (the room door's drawing, `benchHeights()`,
   `placeDresser()`) go too, if the snapshots hold without them.
8. **`kit/view_kit.js`'s `create()` split**: one function of 482 lines
   holding about 40 inner ones. Its parts (rooms and places, eyes, looks,
   saved views, the camera) as functions or modules of their own, each
   given what it needs.

**`state`'s track**

9. **The option held as its number** (7 to 11, 16) in `state`, as the
   configuration has it, not its index in `OPTIONS`; `optionAt()` only
   where the list is indexed, and `CURRENT` no longer "the last one".
10. **The door angles into the view** (decided 17 Oct 2026,
    `ui_paradigm_analysis.md`): out of the configuration (`doors.*`), so
    Packing and walking in no longer change the flat.
11. **What's worked out leaves `state`** (`ui_paradigm_analysis.md`,
    recommendation 5): `settle()` and `placeStored()` keep worked-out values
    (the TV's size, where the dresser stands, the things to store's places)
    beside the settings, so the order of calls matters; `build()` turns
    option 8 into 7.
12. **`state` in the configuration's shape, a room at a time**: the
    lounge's `billyOn`, `billyMove` and `billyLying` become
    `pieces.billy.in.livingRoom.*`, and so on, the bedroom's and the
    garage's likewise, till each schema entry maps a path onto itself. The
    shoe boxes get their own place (now in `state.stairWalls.shoeBoxes`).
    One room per step.
13. **The configuration as the store, `state` going**
    (`ui_paradigm_analysis.md`, recommendation 1's second half): after 12,
    a rename. `flat_model.js` reads `state.` in 113 places.

**Then**

14. **The controls tests from the page as it opens**: today they start
    from `designed` (option 10 with the bench and the dresser), so the
    default page's controls are tested only where a test sets them. All of
    them moved, each switching on what it needs. The largest job here;
    after 12 and 13, which change the paths the tests read.

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
