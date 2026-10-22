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
small, standalone items (6 to 10), all on main by 21 Oct 2026; and
`state`'s track, items 11 to 16 (22 Oct 2026): the option held as its
number, the door angles in the view, what's worked out out of the
settings, the settings laid out as the configuration is (a room at a
time), the configuration as the store (the model's `config`, each choice
by its word, the schema's entries a path each), and the controls tests
from the page as it opens. Each step kept what the page does (no snapshot
or screenshot changes) unless it said otherwise.

### Cheaper changes (agreed 22 Oct 2026, in progress)

Changes had started to feel expensive in run time, test time and tokens
(what Claude reads is sent again with every step after it, so big files
cost over and over). In order:

1. **Notes**: finished ones moved to `notes/` and trimmed to their
   decisions (full text in git at `05f88b7`). Done.
2. **Measure**: time each test file and `rebuild()`, then go after the
   slowest (a device-free check on one device only, the model's tests in
   parallel).
3. **`flat_model.js` into `model/`**: shared state in `model/state.js`
   (`config`, `world`, what's shown, what's drawn); the settings, the
   kitchen, colours, the front wall, the bench wall, loose pieces, things
   to store, dimensions and the cupboards a file each; `flat_model.js`
   left as the front door, its exports unchanged.
4. **`living_room.js` into `page/`**: stored controls, tips, colours,
   piece controls, views, room buttons; `living_room.js` keeps start-up.
5. **`tests/controls.spec.js` into `tests/controls/`** (inputs, pieces,
   hallway and garage, views), and the demos into `demos/`.
6. **`CODE_MAP.md`**: a line per file, read first.

Put off: the configurations as differences from a frozen base (would take
`living_room.configurations.js` from 208 KB to about 20 KB): the user is
thinking about it.

Nothing else is on a track. `notes/ui_paradigm_analysis.md`'s
recommendations 3, 4 and 6 are on no list yet.

As you go (CLAUDE.md): a function's numbers named and long functions split
when they're next changed; `stairWallsControls()` (about 80 lines) is the
first.

Any time:

- **`notes/testing_questions.md`**: question 4 (the desktop screenshots'
  size) still open.

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
