# Tidying the code: what's left

Only what's still to do is here. What's done is in git history;
`CODE_MAP.md` maps where everything is now, and
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
small, standalone items (6 to 10), all on main by 21 Oct 2026; and
`state`'s track, items 11 to 16 (22 Oct 2026): the option held as its
number, the door angles in the view, what's worked out out of the
settings, the settings laid out as the configuration is (a room at a
time), the configuration as the store (the model's `config`, each choice
by its word, the schema's entries a path each), and the controls tests
from the page as it opens. Each step kept what the page does (no snapshot
or screenshot changes) unless it said otherwise.

### Cheaper changes (agreed 22 Oct 2026)

Changes had started to feel expensive in run time, test time and tokens
(what Claude reads is sent again with every step after it, so big files
cost over and over). Done on 22 Oct 2026: finished notes moved to
`notes/` and trimmed; `flat_model.js` split into `model/`,
`living_room.js` into `page/`, the controls tests into
`tests/controls/`, the demos into `demos/`; `CODE_MAP.md` written.

**Measured** (22 Oct 2026, all passing):

- `npm run test:model`: 76 s, of which 75.6 s is one test,
  `generated.test.mjs` (the generated configurations, one after another).
- The full browser suite: 252 s. Test time by file: `room_3d.spec.js` on
  the desktop 478 s (98 tests), the same on the phone 207 s, the controls
  tests 263 s (phone only), the demo 25 s. Desktop Chrome takes over twice
  as long per test as the phone.

**Then** (22 Oct 2026): Playwright no longer picks up the model's tests
(it was running them a second time, as a side effect, in a worker); the
generated configurations are shared among six files (`generated_1` to
`_6.test.mjs`); the desktop runs only the room tests tagged `@desktop`
(screenshots, the bar and drawers fitting, the keys, Share and
Screenshot). `test:model` 76 s to 21 s; the full browser suite 252 s to
138 s.

**Still to do**: time `rebuild()` on a phone.

Put off: the configurations as differences from a frozen base (would take
`living_room.configurations.js` from 208 KB to about 20 KB): the user is
thinking about it.

Nothing else is on a track. `notes/ui_paradigm_analysis.md`'s
recommendations 3 and 4 are done (22 Oct 2026); 6 (every piece an instance,
as `makeCupboard()` is) is put off by the user (22 Oct 2026).

As you go (CLAUDE.md): a function's numbers named and long functions split
when they're next changed. `stairWallsControls()` and
`drawHallwayAndStairs()` split (22 Oct 2026); the longest left are kits'
factories, long for their small inner functions: `flatViews()` and
`cameraControls()` (about 100 lines each), `cupboardControls()` (90).

### Generic rules written more than once (found 23 Oct 2026)

Each is one rule, written again in each room's own names. Not agreed yet.

- **Door swings**: done (23 Oct 2026). One door in `kit/door_kit.js`
  (`planDoor`), used by the bedroom door's limit and its mark on the
  carpet, the shoe rack's door and bevel, and option 8's gap to the room
  door; every door opened in whole degrees. Changed: the shoe rack's door
  without the bevel opens to 65° (was 65.5°), option 8's gap is 93 (was
  94, now measured exactly).
- **Overlap tests**: done (23 Oct 2026). One set in `kit/shape_kit.js`,
  touching not counting: the stair walls' spans, the shelves' clash with
  stored things, the tables stacking, the radiator check, the doors'
  outlines. No snapshot changed. The things to store's fit check stays
  its own (inside a space, not meeting).
- **Moved until clear**: `stair_walls.js`'s `keepApart`,
  `model/cupboards.js`'s `cupboardLimits` with `holdClearOfBedroomDoor`,
  `shoe_boxes.js`'s `onTheSill`: a piece held in its place and out of the
  others' way.
- **Standing on another**: the tables found by overlap
  (`loose_pieces.js`), the garage's by hand (`lifted`), the things to
  store never.
- **Off the wall**: the garage's `offWall`, the bedroom's `PINE.offWall`,
  `model/bench_wall.js`'s `PINE_BY_DOOR_X`.
- **Small ones**: `rotation.y = degToRad(-turn)` in about six files;
  `QUARTER_TURN` kept in `other_room.js`, imported by the hallway's
  pieces; `Math.min(Math.max(…))` in about 14 files, no `clamp`; the
  faint swing material twice (`floor.js`'s `doorSwingMat`, `garage.js`'s
  `swingMat`).

Any time:

- **`notes/testing_questions.md`**: question 4 (the desktop screenshots'
  size) still open.

---

## The steps named in the code's comments

Comments point at these by number; each is in `git log`.

| Step | What it did |
|---|---|
| 1 to 4 | The browser tests, one `state`, the engine in `kit/`, the rooms' files |
| 5 | Readable code in the style of `demos/menu_demo/` (16 Oct 2026) |
| 6a | Saved snapshots beside the tests' configurations, checked exactly |
| 6b | The configuration as JSON, and the address as it, compressed |
| 6c | The model in `flat_model.js`, built and tested in Node |
| 6d | The corner cupboard as `corner_cupboard.js`, an instance per room (17 Oct 2026) |
| `set(path, value)` | The menus change settings by their paths in the configuration (17 Oct 2026) |

---

## After each step

- Update `CODE_MAP.md` (its map and file names), and `PLAN.md`'s
  next steps.
- Commit with a message in the repo's "Plans: …" style.
