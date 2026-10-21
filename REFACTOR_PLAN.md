# Tidying the code: what's left

Only what's still to do is here. What's done is in git history;
`room_3d_ui_guide.md` maps where everything is now, and
`room_dimensions.md` describes the configuration and how it was decided.

**How to work.** A branch per step, one kind of change per commit, so any
one can be undone on its own. Refactors keep what the page does, checked by
the snapshots and screenshots with no changes. `npm run test:model` (Node,
about a minute and a half) and targeted browser runs (`-g`) while working; the full
`npm test` (both devices, about 5.5 minutes) once, before it goes live.
Two sessions testing at once need separate ports (`PORT=8766 npm test`).
For a change across many lines, write a script that rewrites the calls by
their arguments, and let the snapshots check it. After a new setting,
`npm run regen` writes the saved configurations and snapshots again
through the model; check the diff holds only the new setting.

---

## Left to do

Done, and so gone from here (in `git log`): the tests (items 1 to 5), the
small, standalone items (6 to 10), all on main by 21 Oct 2026. Each step
keeps what the page does (no snapshot or screenshot changes) unless it
says otherwise. Before starting, decide with the user how far to go
(`PLAN.md`'s next step).

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
