# room_3d.html: tidying the code, steps 2–4

Step 1 is done: the CSS is in `room_3d.css`, and the floating text buttons
share a `.chip` class (commit `8b51792`, branch `ui-guide-and-menu-demo`).

The steps below change how the code is organised, not what the page does.
After each one the page should look and behave exactly as before, and every
old link should still open the same thing. Do one step per session, and make
each step its own commit, so any one of them can be undone on its own.

Line numbers are as of 11 Oct 2026. See `room_3d_ui_guide.md` for the map.

**How this fits with `PLAN.md`:** `PLAN.md` step 1 already plans to pull the
engine out of `room_3d.html` into `kit/floor_kit.js`, so the whole flat (the
second room, hallway and stairs) can be one floor plan. Steps 2 and 3 here
(one `state` object, the address from one list) should be done **as part of
that work**, not as a separate pass. Step 4's file split is replaced by
`PLAN.md`'s file layout. The test suite below comes first either way: it's
`PLAN.md`'s step 0.

**Do the test suite below first**, before step 2. Every step after it is
checked by running the suite.

---

## Before step 2: a browser test suite (Playwright)

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
- Add `node_modules/`, `test-results/` and `playwright-report/` to `.gitignore`.
  Commit the reference screenshots (`tests/*-snapshots/`): they are the record
  of how the page should look.
- Node here is v18.12 (via nvm). Current Playwright may need a newer Node; if
  so, `nvm install --lts` first.

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

## Step 4: split the module into files

> **Superseded by `PLAN.md`'s file layout** (`kit/floor_kit.js`, `floor.js`,
> `living_room.js`, …), which is shaped for a whole floor rather than one
> room. The notes below on `file://`, import order and `sw.js` still apply.

### Why

One 3,000-line `<script type="module">` is hard to find your way around. Each
file should have one job, and say what it needs with `import`.

### Proposed files

```
room_3d.html          the page: HTML only, plus <script type="module" src="js/main.js">
room_3d.css           (done)
js/
  three-setup.js      scene, renderer, cameras, controls, lights      (now lines 284–331)
  geometry.js         box(), slab(), hinge(), skewHinge(), materials  (333–378)
  room.js             the fixed room: walls, kitchen, desk, door       (379–626)
  bench.js            bench, TV and shelves                           (856–941)
  colours.js          RAL table, finishes, setRal(), oak texture      (942–1160)
  furniture.js        dresser, larders, island, sofa, front wall      (1161–1536)
  cupboards.js        shared parts and shelves                        (670–855)
  options.js          OPTIONS                                         (1537–1808)
  dims.js             2D dimensions, cut, cupboard-only               (1809–2016)
  stored.js           things to store, packing, dragging              (2017–2425)
  state.js            the state object and defaults                   (step 2)
  address.js          the ADDRESS table, read and write               (step 3)
  show.js             show(), update()                                (2426–2533)
  controls.js         every control's listener, syncControls()        (2557–2939)
  menus.js            drawer, pop-ups, Share, Reset                   (3099–3207)
  views.js            built-in views, anchors, ViewKit/SceneKit setup (2940–3098)
  main.js             startup and the render loop                     (3209–3324)
```

The data files (`room_3d.views.js`, `.dressers.js`, …) and the kits stay as
they are.

### A decision first: opening from a file

Today the page works when opened straight from disk (`file://`), because all
its JS is inline or in classic scripts. **Module files loaded with
`<script type="module" src>` or `import` don't work from `file://`**; the
browser blocks them. After this step the page needs a server:

- **GitHub Pages**, where it's published, works.
- **Locally**: `python3 -m http.server` in the folder, then open
  `http://localhost:8000/room_3d.html`.
- **The installed phone app** works, as it is served from GitHub Pages.

If opening from a file matters, the alternative is a build step, e.g. Vite or
esbuild, that bundles the modules back into one file. That brings in npm and a
`package.json`, which I'd avoid unless it's needed.

### How, safely

- **Move one section at a time**, from the bottom of the dependency chain up:
  `geometry.js` first, `options.js` and `controls.js` late, `main.js` last.
  Load the page after each move.
- **Watch for shared variables.** In one module everything can see everything.
  Split into files, each file has to `export` what others use and `import`
  what it needs. A missing import shows as `ReferenceError` in the console, so
  check the console after each move.
- **Watch for two-way dependencies.** `show()` calls the options and the
  options call helpers that read state. Keep `state.js` and `geometry.js` free
  of imports from the rest, so there are no import cycles.
- **Update the offline list.** Add every new file to `FILES` in `sw.js` and
  bump `CACHE`, or the installed app will break offline.

### Check

The same saved addresses as steps 2 and 3, plus:

- no errors in the console;
- the drawer, all three pop-up menus, Share, Reset, and the 2D views with
  dimensions;
- dragging a stored thing in the plan view;
- going offline after one load (DevTools → Network → Offline) and reloading.

---

## After each step

- Update `room_3d_ui_guide.md`: its line numbers, and after step 4 its file names.
- Commit with a message in the repo's "Plans: …" style.

## Rough size

| Step | Size | Risk |
|---|---|---|
| Test suite | Medium: about a session to write, then free to run | Low: it changes nothing in the site |
| Board thickness (`PLAN.md`) | Medium: about 115 places, each checked by eye | Medium: the screenshot tests must show no change at 18 |
| 2 | Medium: touches most of the module, mechanically | Low with option (a), as long as each group is tested |
| 3 | Medium: replaces about 130 lines with a table and two loops | Medium: old links are easy to break, hence the round-trip test |
| 4 | Large: moves everything | Medium: mostly missing imports, which the console shows straight away |

Each is roughly a session's work. On the Pro plan, do them after the weekly
limit resets, one per session.
