# room_3d.html: tidying the code, steps 2–5

Step 1 is done: the CSS is in `room_3d.css`, and the floating text buttons
share a `.chip` class (commit `8b51792`, branch `ui-guide-and-menu-demo`).
Steps 2 and 3 are done too (12 Oct 2026, branch `state-and-address`). Step 4
is `PLAN.md`'s steps 1 and 2, and step 5 makes the code readable. Both come
third in `PLAN.md`'s order of work, after options 10 and 11 and the panels,
both done (14 Oct 2026): step 4 is next.

The steps below change how the code is organised, not what the page does.
After each one the page should look and behave exactly as before.

**Old links and saved storage needn't survive** (agreed 12 Oct 2026): share
links from before a change, and views, looks, scenes and section states saved
in the browser, may stop working. Where the notes below say to keep old
links working, that no longer applies. Do one step per session, and make
each step its own commit, so any one of them can be undone on its own.

Line numbers in steps 2 and 3 are as of 11 Oct 2026, before them; in step 4
they're as of 12 Oct 2026, after them. See `room_3d_ui_guide.md` for the map.

**How this fits with `PLAN.md`:** `PLAN.md` step 1 already plans to pull the
engine out of `room_3d.html` into `kit/floor_kit.js`, so the whole flat (the
second room, hallway and stairs) can be one floor plan. Steps 2 and 3 here
(one `state` object, the address from one list) were planned as part of that
work, but were done first, on their own, which leaves the engine work smaller.
Step 4 below is that work, with `PLAN.md`'s file layout. The test suite below
came first: it's `PLAN.md`'s step 0.

**Do the test suite below first**, before step 2. Every step after it is
checked by running the suite.

---

## Before step 2: a browser test suite (Playwright)

**Done** (12 Oct 2026, branch `playwright-tests`): `playwright.config.js`
and `tests/`. Run it with `nvm use` (Node 24, from `.nvmrc`), then `npm test`;
`npm run test:quick` runs it in WebKit only, in about a minute, for while
you're working (the full run is for before merging or deploying);
`npm run test:update` retakes the screenshots, `npm run report` shows the last
run. `tests/controls.spec.js` uses every control once (each slider to both
ends and back), in WebKit only. `tests/menu_demo.spec.js` is a commented walk-through of Playwright on
`menu_demo.html`, one group per KIND.

### Why

Steps 2–4 should change nothing visible, and "nothing changed" is exactly
what automated browser tests check well. So far, checking has meant Claude
driving the app's built-in browser by hand. That works for exploring, but
it isn't repeatable, it uses Claude allowance on every run, and it only
covers one browser. A test suite is written once and then runs for free in
seconds, the same way every time.

**Playwright** (Microsoft, 2020) is the usual choice today. It came after
Selenium/WebDriver, Puppeteer and Cypress. It drives Chromium, Firefox and
WebKit (Safari's engine, close to an iPhone) from one script, can mimic phone
screen sizes, and compares screenshots pixel by pixel against saved
reference images.

### What the suite checks

- **Saved addresses look the same.** For the default page, every scene in
  `room_3d.scenes.js` and a few shared links: load it and compare a
  screenshot with a reference image (`toHaveScreenshot`).
- **The address round-trips.** After loading an address, `location.hash`
  equals the one loaded. This is step 3's round-trip test.
- **The menus work.** Open and close the drawer and each pop-up menu. Move a
  slider and check that its number and the address update. Pick an option and
  check the right slider blocks are shown.
- **No console errors** on any page.
- **Phone size.** At least one run at phone width, e.g. iPhone 13 in WebKit.

An example test:

```js
test('Share link round-trips', async ({ page }) => {
  await page.goto('http://localhost:8765/room_3d.html#9-0-330-...');
  await expect(page).toHaveScreenshot('option9-default.png');
  expect(await page.evaluate(() => location.hash)).toBe('#9-0-330-...');
});
```

### Set-up

- `npm init playwright@latest` adds a `package.json`, `playwright.config.js`,
  a `tests/` folder and the test browsers (about 300 MB, outside the repo).
- Playwright is a **development-only** dependency. The site itself stays
  dependency-free with no build step, and GitHub Pages serves it exactly as now.
- In `playwright.config.js`, the `webServer` setting starts
  `python3 -m http.server 8765` for the tests, so no server needs starting by hand.
- Keep `node_modules/`, `test-results/` and `playwright-report/` out of git.
  Commit the reference screenshots (`tests/*-snapshots/`): they are the record
  of how the page should look.
- Node: `.nvmrc` asks for Node 24 (`nvm use`), which current Playwright needs.

### Order

1. Write the suite against the code **as it is now**, and take the reference
   screenshots: `npx playwright test --update-snapshots`.
2. Check the references by eye once, since they become the standard.
3. Commit.
4. From then on, after each refactor step, run `npx playwright test`. Any
   difference fails, with a side-by-side image report
   (`npx playwright show-report`).

The 3D rendering may differ by a few pixels between runs (anti-aliasing). If
it does, allow a small tolerance (`maxDiffPixelRatio`) rather than turning
screenshot checks off.

---

## Step 2: one `state` object instead of loose variables

**Done** (12 Oct 2026, branch `state-and-address`). As planned, with two
differences from the notes below:

- The cupboard sizes kept their short names in `state` (`state.T`,
  `state.R`, `state.BOARD`, `state.BENCH`, `state.UPPER`, …), as used in the
  code and `room_dimensions.md`, so a drawing function starts with
  `const { T, R, BOARD } = state;` rather than renaming each one. The other
  settings got longer names (`state.above`, `state.sofa.key`,
  `state.stored.where`, …).
- The options' one-line parts read state through a default parameter:
  `clearFrom: ({ T, UPPER } = state) => T + UPPER`.

The view toggles (cupboard only, dimensions, see-through) stay outside
`state`, as the address doesn't save them.

### Why

The settings are about 30 separate `let` variables spread through the module
(`T` at line 632, `R`, `F`, `UPPER`, `LEG`, `BENCH`, `above`, `sofaKey`, …).
Nothing lists them all in one place. To find every setting, or to save and
restore them, you have to know where each one lives. `settingsAddress()`
(line 2539) is currently the only full list.

### What

Gather them into one object near the top of the module:

```js
const state = {
  option: 8,            // shown
  leftDepth: 0,         // T: the left-wall cupboard's depth, 0 for none
  rearDepth: 330,       // R
  leftFront: 1200,      // F
  bench: { on: true, height: 780 },
  above: 3,             // 0 nothing … 4 TV and top shelf
  shelfDepth: 250,
  tv: 75,               // inches; TV_W and TV_H are looked up from it
  upper: 700, leg: 600, legDepth: 600, extra: 500,
  ward: 900, wardDepth: 600, tower: 400,
  shelves: { back: [600, 1200, 1800], left: [600, 1200, 1800] },
  colours: { floor: 0, cupboard: 0, wall: 0, woodwork: 0, dresser: 0 },   // ralChosen
  shelfWood: 0,
  frontPiece: 'dresser', dresser: {...}, larder: { key, w, h, d },
  islandAt: 'room',
  sofa: { key, front: 1900, w, d, h },
  cupboardOnly: false,
  stored: { shown, packing, where, spots },
};
```

The variables to collect, by where they're declared now:

| Lines | Variables |
|---|---|
| 627–669 | `T`, `R`, `F`, `UPPER`, `LEG`, `LEG_D`, `L_SHELVES`, `EXTRA`, `WARD`, `TOWER`, `WARD_D` |
| 289 | `BENCH` |
| 863–873 | `above`, `shelfDepth`, `benchOn`, `TV_INCHES` (with `TV_W`, `TV_H`) |
| 942–1160 | `ralChosen` |
| around 2689 | `shelfWood` |
| 1161–1536 | `DRESSER`, `frontPiece`, `larderKey`, `larderSize`, `islandAt`, `sofaKey`, `sofaFront`, `sofaSize` |
| 2017–2425 | `showStored`, `storedPacking`, `storedWhere`, `storedState` |
| 2426–2533 | `shown`, `cupboardOnly` |

**Not state:** values worked out from the settings stay as they are, computed
from `state`. These are `SHELF_TOPS`, `TV_BOTTOM` and the rest from
`benchHeights()`, `TV_W`/`TV_H`, and the doors' angles, which belong to the
view. Constants such as `W`, `D`, `H` and `KITCHEN` aren't state either.

### How, safely

- **Rename in small groups and test after each one.** Do the cupboard sizes
  first, then the bench and TV, then the front wall and sofa, then colours,
  then the stored things.
- **Watch for the short names.** `T`, `R` and `F` appear hundreds of times in
  the options' `build()` functions. Two ways to handle them:
  - **(a)** Write `const { leftDepth: T, rearDepth: R, leftFront: F } = state;`
    at the top of each `build()`. The geometry code stays unchanged and readable.
  - **(b)** Rename every use.

  (a) is far less risky, and is what I'd do.
- **Watch `F`.** Some functions use a local `F` for something else, e.g.
  `const F = X + depth` in the kitchen at line 531. Check each search hit
  rather than doing a blind replace.

### Check

Run `npx playwright test`. The saved addresses (the default page, every scene
in `room_3d.scenes.js`, and a few links you've shared) must look the same as
the reference screenshots, and give back the same `location.hash` after load.

---

## Step 3: save and load the address from one list

**Done** (12 Oct 2026, branch `state-and-address`): `ADDRESS`,
`settingsAddress()`, `readAddress()` and `syncControls()`; startup is
`readAddress()` → `syncControls()` → `show()`. The address format is
unchanged. Two small changes in reading: the floor, wall and woodwork
colours in a link are now read like the others (the page always writes 0,
so links it made are unaffected), and links from before option 7's leg had
its own depth no longer get the back-wall depth for it. Three addresses with
nearly every setting changed are now in the test suite; before they went in,
each was checked to load the same in the code before and after.
Reset is still a page reload.

### Why

Adding one setting today means editing three places:

- the variable;
- the long template string in `settingsAddress()` (line 2539);
- the startup code that splits the hash and checks each value (lines
  3214–3320, about 100 lines).

The format also has history: old links in other forms must keep working. For
example, `legDAddress` can be `'back'` (line 655), the option codes come from
`optionCode()`, and the dresser's sizes are a `.`-separated field at position 20.

### What

Make one table describing each field of the address, in today's exact order
(documented in `room_dimensions.md`):

```js
// [state path, how to write it, how to read it (and check it), default]
const ADDRESS = [
  ['option',     s => optionCode(s.option), t => optionIndex(t)],
  ['leftDepth',  s => s.leftDepth,          t => t === 0 || (t >= 300 && t <= 800) ? t : undefined],
  ['rearDepth',  s => s.rearDepth,          t => t >= 300 && t <= 800 ? t : undefined],
  ...
];
```

- `settingsAddress()` becomes a loop that writes each field and joins them with `-`.
- The startup becomes a loop that reads each field into `state`, skipping any
  that fail their check, then calls one `syncControls()`.

### `syncControls()`

The second half of this step. It's one function that puts every slider, radio,
switch and dropdown in step with `state`: the reverse of the event listeners.
At the moment startup and several `set…()` functions each do part of this job.
With `syncControls()`:

- startup is: read address → `syncControls()` → `show()`;
- Reset could become a state reset instead of a page reload.

### Check

Use the same saved addresses as step 2. Also write a small round-trip test:
for each saved address, read it into `state`, write it back out, and compare.
It must come back identical, including old-format links. The Playwright
suite's round-trip test covers this; add an old-format link or two to it.

---

## Step 4: the engine into `kit/floor_kit.js`, the room into `living_room.js`

**Under way** (14 Oct 2026, branch `engine-kit`). Decided: **ES modules**.
Moved so far, unchanged bar what each now takes as arguments, a commit and
a full `npm test` each:

1. the stage (`createStage()`: scene, renderer, cameras, controls, lights)
   and the helpers that draw in mm (`material()`, `box()`, `slab()`,
   `part()`, `hinge()`, `skewHinge()`);
2. the `RAL` table and the oak floor's texture (`oakBoards()`); the room
   keeps its finishes and `setRal()`;
3. the address's readers (`number()`, `within()`, `radio()`, `sizes()`) and
   loops (`writeFields()`, `readFields()`); the room keeps `ADDRESS`;
4. the pop-up menus, the drawers, Share, Reset and offline support
   (`popMenus()`, `createDrawers()`, `resetButton()`, `shareButton()`,
   `workOffline()`);
5. `resize()` and the 2D/3D switch (`setFlat()`, the render loop), as
   `flatViews(stage, view)`; the room hands it the 2D views' framing
   (`flat`, `flatFit`, `flatPerM`), the view kit's `hfov` and the drawers
   as getters, and keeps those variables.

Still to move into the engine: the general part of the 2D dimensions (`dimLine()`,
`dimLabel()`, `chain()`, `applyCut()`). Then `view_kit.js` and
`scene_kit.js` into `kit/` as modules, and the room into `floor.js` and
`living_room.js`.

This is `PLAN.md`'s steps 1 and 2: pull the general code out of
`room_3d.html` into an engine, and describe the living room as data and
room code that the engine draws. It replaces the earlier plan of splitting
the module into a dozen files by topic (`js/geometry.js`, `js/options.js`,
…), which was shaped for one room; `PLAN.md`'s layout is shaped for a floor
of rooms. Nothing visible changes in this step: the hallway and the other
room come later (`PLAN.md` step 4).

### Why

One 3,400-line `<script type="module">` is hard to find your way around, and
about a third of it is general (the 3D set-up, cameras, menus, the address,
2D dimensions) while the rest is this room. A second room shouldn't copy the
general part.

### Files

As in `PLAN.md`, with what moves into each from today's `room_3d.html`
(lines as of 12 Oct 2026):

```
index.html                 the page: today's HTML (lines 1–280) and the drawer's
                           controls, then the scripts. It replaces the redirect
                           in index.html today
kit/floor_kit.js           the engine:
                             3D set-up: scene, renderer, cameras, controls, lights (294–341)
                             box(), slab(), hinge(), skewHinge() (342–387)
                             colours: RAL, finishes, setRal(), the oak floor (969–1184)
                             2D dimensions and cut views: dimLine(), chain(), applyCut() (1863–2071, the general part)
                             the address loop: valueAt(), settingsAddress(), readAddress() (2593–2694), for a
                               room's own ADDRESS list
                             menus: setPop(), setMenu(), resize(), Share, Reset (3258–3366)
                             startup and the render loop (3407–3420)
kit/view_kit.js            today's view_kit.js
kit/scene_kit.js           today's scene_kit.js
floor.js                   the floor plan: the walls as lines with a thickness, the
                           door and windows in them, where each room's corner is.
                           For now only the living room's walls, door frame and
                           windows (389–509, 630–635)
living_room.js             the living room, in its own mm from its corner:
                             its state and ADDRESS list (637–685, 2619–2665)
                             its fittings: kitchen, desk, chair, island (510–629)
                             its cupboard options and their parts (687–967, 1186–1861)
                             its 2D dimensions (updateDims(), cupboardDims())
                             the things to store (2073–2482)
                             show(), update() (2484–2591)
                             its controls' listeners and syncControls() (2695–3096, 3373–3405)
                             its built-in views and anchors (3098–3205)
living_room.views.js       today's room_3d.views.js
living_room.scenes.js      today's room_3d.scenes.js
dressers.js, larders.js,   today's room_3d.dressers.js, .larders.js, .sofas.js
sofas.js
room_3d.html               a redirect into index.html, with its #address (PLAN.md step 3)
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

### A decision first: modules or classic scripts

Today the page works when opened straight from disk (`file://`), because its
JS is inline or in classic scripts. **Module files loaded with
`<script type="module" src>` or `import` don't work from `file://`**; the
browser blocks them. Two ways:

Decided (14 Oct 2026): **modules**. Until then `room_3d.html` still worked
opened from disk (`file://`); now it needs a server, as `menu_demo/` already
did (`python3 serve.py`), and as the tests, the installed app and GitHub
Pages always had.

- **Modules** (`import` / `export` between the files): the cleanest code,
  but the page then needs a server. GitHub Pages, where it's published, and
  the installed phone app are fine; locally, `python3 -m http.server` in the
  folder (the tests already do this).
- **Classic scripts, as the kits are now**: each file sets a global
  (`window.FloorKit`, `window.LIVING_ROOM`), and a short inline module passes
  in three.js. This keeps `file://` working, with no build step.

A build step (Vite, esbuild) bundling modules back into one file is a third
way, but adds tooling the site doesn't otherwise need.

### How, safely

- **Work on a branch; show the result before it goes live** (`PLAN.md`).
- **Move the general code first**, from the bottom of the dependency chain
  up: the 3D set-up and geometry helpers, then colours, then menus, then the
  address loop. Run the tests after each move.
- **Then draw the room from data**: the walls and openings into `floor.js`,
  then the fittings and options into `living_room.js`.
- **Watch for shared variables.** In one module everything can see
  everything. Split into files, each one has to export (or hang on its
  global) what the others use. A missing one shows as `ReferenceError` in
  the console, which the tests fail on.
- **Watch for two-way dependencies.** The room calls the engine's helpers
  (`box()`, `setRal()`), and the engine calls the room's `build()`; keep the
  helpers free of anything room-specific so there are no cycles.
- **Rename the data files** and move the kits into `kit/`; update the
  `<script>` tags, and the tests that read `room_3d.scenes.js`.
- **Update the offline list.** Every file in `FILES` in `sw.js`, and bump
  `CACHE`, or the installed app breaks offline; and `manifest.webmanifest`'s
  start page (`PLAN.md` step 3).

### Check

The Playwright suite, against `index.html` focused on the living room: the
same screenshots and addresses as now. Point `tests/helpers.js`'s
`openRoom()` at the new page. Plus, by hand:

- the drawer, all three pop-up menus, Share, Reset, and the 2D views with
  dimensions;
- dragging a stored thing in the plan view;
- going offline after one load (DevTools → Network → Offline) and reloading.

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

As step 4: `npm test` after each commit, with no screenshot changes.

---

## After each step

- Update `room_3d_ui_guide.md`: its line numbers, and after step 4 its file
  names (the map needs redoing then, as its first section says).
- Commit with a message in the repo's "Plans: …" style.

## Rough size

| Step | Size | Risk |
|---|---|---|
| Test suite | Medium: about a session to write, then free to run | Low: it changes nothing in the site |
| Board thickness (`PLAN.md`) | Done | |
| 2 | Done | |
| 3 | Done | |
| 4 | Large: moves everything, over several sessions (general code first, then the room) | Medium: mostly missing names, which the console shows straight away and the tests fail on |
| 5 | Medium to large: a file at a time, a session or two each for the room and the options | Low to medium: renames and splits, each checked by the screenshots |

Each is roughly a session's work. On the Pro plan, do them after the weekly
limit resets, one per session.
