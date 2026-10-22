# index.html: how the page is put together

How the page's HTML, CSS and JS fit together, focused on the UI: the
menus, the controls, and how they drive three.js. Where each file is and
what it holds is in `CODE_MAP.md`; the old top-to-bottom map (section 1,
with line numbers) is in git (`git show 05f88b7:room_3d_ui_guide.md`).
Since 22 Oct 2026 the page is split into `page/` and the model into
`model/`: the functions named below are in those pieces (search for them).

---

## 2. How the HTML and CSS tie together

### The link: selectors

`index.html` loads the stylesheet in its `<head>`. CSS rules in `room_3d.css` find
HTML elements by **id** (`#panel`), **class** (`.pop`), **tag** (`label`),
**attribute** (`input[type=range]`) or a combination of these. A few patterns:

```css
.drawer label { display: block; }            /* any <label> inside a drawer */
.pop > .group { display: none; }             /* a .group that is a DIRECT child of a .pop */
.pop.open > .group { display: flex; }        /* ...but shown when the .pop also has class "open" */
body.menu-open #panel { transform: none; }   /* #panel when <body> has class "menu-open" */
.chip[hidden] { display: none; }             /* a .chip with the hidden attribute */
```

The key idea is that **CSS describes how each state looks, and JS only changes
the state** by adding or removing a class. Most of the menu behaviour works this way.

### Layout: everything floats over a full-screen canvas

- `#view` is `position: fixed; inset: 0`, so it fills the window.
  The 3D canvas lives inside it.
- `#bar`, `#topRight`, `#corner`, `#bottomLeft`, the drawers and `#tip` are all
  `position: fixed`. They sit on top of the canvas at the screen edges, set by
  `top`/`left`/`right`/`bottom`.
- `z-index` sets which layer is on top: canvas (0) < bars and menus (2) <
  drawer (3) < tooltip (4).
- **`pointer-events: none`** on the containers (`#bar`, `#topRight`, `.pop`,
  `.group`), with `pointer-events: auto` on the buttons and dropdowns themselves
 . A container is an invisible box, and without
  this it would block mouse drags meant for the 3D model. With it, clicks pass
  through the gaps to the canvas and only the visible controls catch them.

### Flexbox for arranging rows and columns

`display: flex` lays a container's children out in a row (or in a column with
`flex-direction: column`). `gap` sets the spacing, `align-items` the alignment,
and `flex-wrap: wrap` lets the children wrap onto new lines. Every menu group and
colour row uses it.

### CSS variables give each menu its colour

```css
#viewMenu  { --tint: #1f4e79; }
#viewsMenu { --tint: #6a3d9a; }
#configurationMenu { --tint: #2e7d4f; }
.popToggle { color: var(--tint); box-shadow: ... inset 0 0 0 2px var(--tint); }
.group .tag { color: var(--tint); }
```

`--tint` is set on each menu, and **children inherit it**. One `.popToggle`
rule therefore gives each menu button its own colour.

### One class for many buttons

The floating text buttons (Lounge options, Share, Look ▾, Configs ▾,
Dimensions, the room buttons, and the menus' Save and Delete) all have `class="chip"` in the
HTML, and one `.chip` rule styles them. To give a new button the same look, add `class="chip"` to it.

### Hand-styled controls

- **The sliding switch**: a real checkbox with its look removed
  (`appearance: none`), resized into a pill shape. `::after` draws the white knob,
  and `:checked` moves it (`left: 18px`) and colours the track. This is pure CSS:
  the checkbox still behaves as a normal checkbox.
- **Range sliders** are only resized to `width: 100%`. Otherwise
  they are the browser's own.
- **`.depth` radio groups**: the labels are set to
  `display: inline` so the radios sit side by side. The island group overrides
  this to one per line.

### Responsive (phone) behaviour

- `max-width: 88vw` on the drawer means it never takes more than
  88% of the screen width.
- `@media (max-width: 600px)`: on a phone held upright a drawer is a sheet
  from the bottom, `--sheet` high (its handle, `.sheetHandle`, drags it
  between a third and two thirds of the screen), and while one's open only
  ☰ stays in the top bar. There's no scrim: an open drawer leaves the room
  live, and the views fit the part it leaves clear (`drawers.covering()` in
  `kit/floor_kit.js`: the 3D view with `setViewOffset()`, the 2D views
  fitted again), so a slider's change can be watched as it's dragged.

---

## 3. How the menus are built, and whether they're HTML, CSS or JS

There are three kinds of menu. **All of them are HTML + CSS + a little JS.** The
JS adds or removes a class or sets an attribute, and the CSS reacts to that.
The one exception is `<details>`, which is pure HTML.

### a) The five drawers (`#panel`, `#hallPanel`, `#loungePanel`, `#bedPanel`, `#garagePanel`)

| Part | Where |
|---|---|
| HTML | `<div id="panel" class="drawer">` (**Other options**, opened by ☰ `#menu`), and each room's: `#loungePanel` (**Lounge options**), `#bedPanel` (**Bedroom options**), `#garagePanel` (**Garage options**) and `#hallPanel` (**Hallway and stairs options**, the hallway's and downstairs'), opened by the options button (`#roomOptions`) for the room in view; each with a ✕ (`.close`) |
| CSS | Normally moved off-screen with `transform` (to the left, or below as a sheet on a phone). With `body.menu-open #panel`, `body.lounge-open #loungePanel` and so on it is back on screen. A `transition` on `transform` animates the slide |
| Tabs | Lounge, Hallway and stairs, and Garage options have tabs (`notes/MENU_TABS.md`): a `.tabs` holding an empty `.tablist` and a `.tabpanel` per tab, named by `data-tab` (the garage's built by `garageControls()`, by each piece's `group`). `drawerTabs()` (`kit/tabs_kit.js`) makes the buttons and remembers the tab last used (`room_3d:tab:<id>` in localStorage). The CSS keeps the row at the top as the drawer scrolls; `--drawer-width` (380 on a desktop) leaves room for the Lounge's four |
| JS | `DRAWERS` maps each drawer to its button (null for the rooms', which `#roomOptions` opens by `setMenu()`) and its class on `<body>`. `setMenu(id)` opens drawer `id` and closes the others (`setMenu(null)` closes them all), so one is open at a time. ✕ and Escape close it. `ROOM_BUTTONS` in living_room.js names each room's button, drawer and options |

The JS doesn't move the drawers. It only switches a class on `<body>`, and the
CSS does the movement and the animation.

### b) The two pop-up menus (Look, Configuration)

| Part | Where |
|---|---|
| HTML | `<div class="pop">` holding a `<button class="popToggle">` and a `<div class="group">` |
| CSS | `.pop > .group { display: none }` hides the group. `.pop.open > .group { display: flex }` shows it |
| JS | `setPop(open)` adds `open` to the menu clicked and removes it from the others, and sets `aria-expanded` for screen readers. Escape, or a click outside the menus that isn't on the 3D view, closes them |

Both open downwards: in each the button comes **before** the group in the
HTML, and `#topRight` stacks them in a column from the top of the screen.
(Configuration opened upwards from the bottom right until 22 Oct 2026.)

### c) The collapsible sections in the drawer

These are `<details><summary>Heading</summary> …content… </details>`, a **built-in
HTML element**. Clicking the summary opens or closes it with no JS or CSS. The
`open` attribute in the HTML (e.g. `<details class="sec" id="secSofa" open>`)
makes a section start open.

The only JS involved **remembers** each section's
open/closed state in `localStorage`, using the `toggle` event.

### What fills the menus' dropdowns

The `<select>` elements in the HTML are **empty** (e.g. `<select id="where"
class="pick"></select>`). JS adds every `<option>`:

- Look (`#where`, `#lookAt`, `#eye`, `#lookPick`) is filled by
  `kit/view_kit.js`, Where and Looking at again each time the room changes. The room buttons' ▾ (`#loungeViewKind` and so on) are filled by `fillRoomKinds()` in living_room.js, again when a view's saved or deleted. The page passes the elements in to `ViewKit.create()`.
- Configuration (`#configurationPick`) is filled by `kit/configuration_kit.js`, through `ConfigurationKit.create()`.
- The rest are filled in the module (section 4).

---

## 4. How the radio buttons, sliders and dropdowns are created

### Radio buttons and sliders are written in the HTML

They are not generated by JS. They are typed out in the HTML.

**A radio group:**

```html
<div id="bench" class="depth">Bench height:
  <label><input type="radio" name="bench" value="700"> 700</label>
  <label><input type="radio" name="bench" value="780" checked> 780</label>
  ...
</div>
```

- **`name="bench"`** is what makes these four one group: the browser lets only one
  radio with a given `name` be checked.
- `value` is the string JS reads back. `checked` sets the default.
- Wrapping the input in a `<label>` makes the text clickable too.

**A slider:**

```html
<label for="sofaW">Sofa width: <span id="sofaWValue">1690</span></label>
<input id="sofaW" type="range" min="1200" max="2600" step="10" value="1690">
```

- `type="range"` is the slider. `min`, `max`, `step` and `value` are its range and
  starting point, so the browser does the dragging and snapping for you.
- `for="sofaW"` ties the label to the input.
- The number shown next to the label is a separate `<span id="sofaWValue">`. The
  slider doesn't display its value itself, so JS writes it into the span on every move.
- The id naming convention is **`<id>` for the slider and `<id>Value` for its readout**.
  Some JS relies on it, for example `` document.getElementById(`${id}Value`) ``.

**Showing and hiding controls.** Many sliders are wrapped in a block such as
`<div id="legBlock">`. `showInMenus()`, called by `show(i)`, sets
`style.display = 'none'` or `''` on these blocks, so only the controls that apply to the current option are visible.
The option is held by its number (`option.no`, read from the start of its
name; `config`, the configuration and the list's values all have it), never its
place in `OPTIONS`, as the list starts at option 7 (options 1 to 6 were taken
out): `optionOf(n)` gives option n, or undefined. Options 10 and 11
show `cornerBlock`, the corner cupboard's width and depth (`CORNER_W`, `CORNER_D`),
and hide the left-wall cupboard's length slider (`#leftLenBlock`), as they have `front()`.
Option 8 shows `diagBlock`: its back-wall leg's length (`DIAG_RUN`) and where
its diagonal starts on each leg (`DIAG_BACK`, `DIAG_LEFT`). The bedroom's
copies of the sliders that reach further (`BEDROOM_CUPBOARD_RANGES` in
`flat_model.js`) get their own ends in `living_room.js`, and a size dragged
past where its room lets it go is held there (`cupboardLimits()`).
Option 10 alone shows `sideShelfBlock` in it, the Show side bookshelf switch
(`SIDE_SHELF`), and its width and depth sliders (`SIDE_W`, `SIDE_D`) in
`sideShelfDetails` when it's on; and `deskBlock`, the Fold-down desk switch
(`DESK`), with its width, depth and height sliders in `deskDetails` when it's
on. Whether the desk is folded away or down is two radios in the Doors
section (`deskDoorBlock`, shown while there's a desk), as words in the
view's `doors.desk` (`DESK_SHOWN` in `flat_model.js`).

### Dropdowns are filled by JS

Three styles are used, which do the same thing:

1. **An HTML string**, here for the option list in the top bar (`#current`):
   ```js
   currentSelect.innerHTML = OPTIONS.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');
   ```
   The colour pickers use the same approach, with `<optgroup label="...">` for the
   headed sub-lists.
2. **`createElement`**:
   ```js
   dresserPick.append(...Object.entries(DRESSERS).map(([id, d]) =>
     Object.assign(document.createElement('option'), { value: id, textContent: `${d.label} (${d.w} × ${d.h})` })));
   ```
   The list comes from the data file (`dressers.js`). Adding a dresser
   there adds it to the dropdown.
3. **The kits** (`kit/view_kit.js` and `kit/configuration_kit.js`) use the `createElement` style internally.

The dresser, larder and sofa dropdowns also have a disabled **"Custom"** option.
JS selects it when the sliders no longer match any preset (`showDresserPick()`).

---

## 5. How the controls send their values to three.js

### The pattern

Every settings control follows the same pattern, through one function,
`change(edits, { look })`. Each edit is `[path, value]`: the setting's path
in the configuration, and its value as the configuration holds it (an
option's number, `above`'s word, sizes in mm):

```
user moves control
  → browser fires an event ('input' or 'change')
  → listener reads element.value (always a STRING, so Number(...) it)
  → calls change() with the edits, as [['pieces.bench.design.height', 900]]
  → change() has the model's setAll(edits) check each against its schema
       entry and put it in config (one it refuses is a console error), then
       syncControls(): every control and readout <span> in step with the settings
       show(): rebuilds the current option's 3D objects from config,
         which also updates the visible blocks, the description, the dimensions and the URL
       with look: viewKit.refresh(), so a view of the dresser, sofa… follows it
  → the render loop draws the new scene on the next frame
```

The listener only says what changes. Putting the controls in step, rebuilding
and saving the address all happen in one place, so a new control can't
forget one of them.

**Example: a slider**:

```js
shelfSlider.addEventListener('input', () => change([['pieces.aboveBench.design.shelfDepth', Number(shelfSlider.value)]]));
```

`syncControls()` then writes the new value into `#shelfDepthValue`, the
slider's readout.

**Example: a radio group**. The code listens on each radio in the group:

```js
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => change([['pieces.bench.design.height', Number(r.value)]])));
```

A radio holding the page's own value, not the configuration's (`above`'s
0 to 4), gives the word through the model's `wordAt(path, value)`.

**Example: a dropdown**, which also moves the view to follow (`look`):

```js
dresserPick.addEventListener('change', () => change(setDresser(DRESSERS[dresserPick.value]), { look: true }));
```

`setDresser(sizes)` gives the sizes as edits, each held to its slider's
range (`sizeEdits()`), as `setSofaSize()` and `setLarderSize()` do.

**Example: the corner cupboards' controls** (`cupboard_controls.js`) are
made once for each cupboard by its piece's name, so each changes its own
design by path: the lounge's in Lounge options, the bedroom's (a copy, its
ids with `bedroomCupboard` before them) in Bedroom options. Inside, a
setting changes by `set(key, value)` and is put in step from `value(key)`
(the model's `get()`), looping over `CUPBOARD_SLIDERS`:

```js
for (const [name, key] of CUPBOARD_SLIDERS) el(name).addEventListener('input', e => set(key, Number(e.target.value)));
```

Choosing an option is one change with several edits: the option's number,
and a left-wall depth if it needs one (`chooseOption()`). The dresser,
larder and sofa sliders loop the same way, driven by arrays such as
`DRESSER_SLIDERS`: `[key, sliderId, min, max, step]`. The rooms' modules'
controls (`otherRoomControls()` and the rest) name their settings as
their controls' ids do (`bed.u`, `sean.x`), and each module's
`settingPath()` gives their paths in the configuration.

Not every control rebuilds. The door sliders and the things to store set
theirs through the model's `set()` too, but redraw only themselves; the
view switches (Dimensions, Cupboard only, See-through) aren't settings.
See below.

### `input` vs `change`

- **`input`** fires continuously **while a slider is dragged**, so the 3D model
  updates as you drag. All the sliders use it.
- **`change`** fires once the choice is final. It's used for radios, dropdowns,
  checkboxes and the shelf text boxes.

### What `show(i)` does

It's the single place where settings become 3D objects, in named steps:

1. `buildOption()` removes the old option's `THREE.Group` from the scene,
   creates a new group and adds the cupboard `makeCupboard()` makes
   (`corner_cupboard.js`), from the cupboard's settings (`cupboardSettings()`),
   the living room as its place and its materials. Each option's
   `build(job, group)` reads the sizes it needs from `job.s`
   (`const { T, R, LEG } = job.s;`), itself in named steps
   (`diagonalCarcass()`, `wardDoors()`, …).
2. `drawBench()` draws the bench beside it, from the option's `benchFrom()`,
   when the bench is on.
3. Adds the bench wall, the front-wall piece and the sofa.
4. `showInMenus()` **updates the UI to match**: enables or disables dropdown
   options, writes the description, and shows or hides the slider blocks.
5. `redrawAround()` calls `updateDims()`, `updatePalette()`, the stored-things
   code and `writeAddress()` (saves the configuration and view into the URL), then `update()`.

Steps 1 to 3 are the model's `build(i)` (`flat_model.js`), which also draws
the other rooms' furniture and places the things to store; `show(i)` on the
page calls it, then does 4 and 5.

The approach is simple: **rebuild everything** whenever something changes. It's
fast enough for a model of this size, and it means the 3D model always matches
`config`.

### The faster path for doors

The door sliders don't rebuild. Each sets its angle through
`turnDoorsTo({ name: degrees })`, which gives it to the model's
`setDoors()` (the doors are the view's, not the configuration's: the
view's `doors`, read by `readDoors()` and written by `doorsNow()`,
checked by `DOORS_SCHEMA`) and calls `update()`, which only rotates the
existing hinge objects, draws the garage door, and puts the door controls
in step. Packing and walking in turn them the same way:

```js
roomHinge.rotation.y = turn(doors.room);
```

### Colours

`colourPicker()` builds each colour dropdown and its ◀ ▶
buttons. A choice goes through `change([[`colours.${target}`, code]])`;
`settle()` then has `applyColour()` set `.color` on the three.js **materials**
shared by those objects, and anything that follows that colour.

### Views and Look

The room buttons' ▾ and the Look dropdowns don't change the model. They move the **camera**.
`kit/view_kit.js` handles the dropdowns and calls back into the page through the
`hooks.place()` function, which sets `camera.position` and
`controls.target`.

### The URL holds the configuration and the view

The address is `#<configuration>~<view>`: the settings as a
**configuration**, JSON by piece, and the **view**, each deflated and in
base64url (`pack()` and `unpack()` in `kit/config_kit.js`;
`room_dimensions.md` has the format). `SCHEMA` (near the end of
`living_room.js`) has an entry for each setting: its path in the
configuration (and in `config`, which is laid out the same), its kind and
range and its default, e.g. `fromSlider(at('R'), 'rear')` in
`cupboardEntries()`, the back-wall depth held to the `#rear` slider's
range. The other rooms' modules give their own entries
(`OTHER_ROOM_SCHEMA`, `WICKER_BENCH_SCHEMA`, `SHOE_RACK_SCHEMA`,
`GARAGE_SCHEMA`). `config` is the configuration as the page holds it:
`configurationNow()` writes it out (in the schema's order, the things to
store's places only once moved by hand), `readConfiguration()` reads one
into it, entry by entry, and the menus' `set()` changes one setting by its
path, through its entry. The view is the view kit's
`view()` (the room, a listed view's id or the camera, the eye height) and
the Dimensions, Door sizes, Cupboard only and See-through switches
(`viewNow()`, `readDisplay()`).

`writeAddress()` packs both, which is asynchronous, so each write is
numbered and only the latest lands. At startup the page unpacks the
address before it builds anything (a top-level `await`), reads the
configuration into `config`, then `syncControls()` sets every slider and
radio from it, e.g. the radio found with
`document.querySelector('input[name=bench][value="780"]')`, `show()`
builds it, and the view is applied. This is how Share links and the
Configuration list work. Reload simply loads the page with no
hash.

### `window.plans`: the settings, for the tests and the console

For the tests and the browser console (REFACTOR_PLAN.md, steps 6a and
6b); only `load()` changes the page. Try it in the console:

- `plans.export()`: the configuration, as the address holds it.
- `plans.view()`: the view, as the address holds it.
- `plans.load(configuration)`: shows a configuration, everything it leaves
  out as the page starts, keeping the view.
- `plans.schema()`: the configuration's entries, then the view's doors'
  (`DOORS_SCHEMA`), bar their functions.
- `plans.get()`: the settings, `config` as JSON, with the view's doors'
  angles as `doors` (`room`, `tall`, `second`, `bedroom`, `flat`,
  `outside` and so on, in degrees; the garage door's as its word). The tests read settings through it (`setting(page, 'garage.sean')`
  in `tests/helpers.js`), not from the address, so a new address format
  leaves them alone.
- `plans.snapshot()`: what the page makes of them: `configuration` (as
  `export()`), `cupboards` (the living room's corner cupboard's cutting list as rows,
  `{ kind, length, width, shaped, count, parts }`, and the bedroom's own cupboard's,
  or `null` when there isn't one), `dimensions` (the figures on show, in a
  2D view or with Cupboard only), `description` (the text under the
  option) and `boxes` (where each piece is drawn, to the mm, and whether
  it's on show). Each saved address and named configuration has its snapshot in
  `tests/snapshots/<name>.json`, compared exactly (and, for the 7 in
  `PICTURED` in `room_3d.spec.js`, beside a screenshot of the 3D view
  alone; one a room), so a board 2 mm out or one fewer fails even when the picture
  passes. The bar and menus have screenshots of their own, the 3D view
  hidden.
- `plans.viewSnapshot()`: what the view makes of it, which Node can't say
  (it has no camera): `room`, `view` (its id, or null), `flat`, `camera`
  (`at` and `aim`, in the living room's mm), `frames` (what a 2D view fits
  on screen, mm), `cut`, `cupboardOnly`, and `shown`: each room's shell
  (`shell.livingRoom` and so on) and each piece (as `boxes` names them)
  `all`, `part` (some cut away) or `none`, null where it isn't built. Each
  saved address's is in `tests/view_snapshots/<name>.json`, compared
  exactly on both devices (`expectSnapshot(page, name, { of: 'view' })`).
  `npm run test:update` writes them again, with the screenshots.

### The model in Node

`flat_model.js` needs no page, so `npm run test:model` (Node's own test
runner, about half a minute) builds it there with `buildFlat(configuration,
view)`: every saved configuration must give its saved snapshot, exactly
(`tests/model/snapshots.test.mjs`); about 1,700 generated configurations
(every option, each setting at its ends, each board thickness) must build
with sensible sizes, the cupboard inside the room, and come back the same
through the address (`generated.test.mjs`, which gives a failure's link);
and reading a configuration keeps defaults and ranges as it should
(`configuration.test.mjs`). What a page needs, in Node, is stood in for:
canvases by the kit's `makeCanvas()`, which draws nothing there.

---

## 6. What is `<script type="module">`?

A normal `<script>` and a `<script type="module">` differ as follows:

| | `<script>` (classic) | `<script type="module">` |
|---|---|---|
| `import` / `export` | Not allowed | **Allowed**. This is the reason it's used here: `import * as THREE from 'three'` |
| Variables at the top level | Become globals (on `window` for `var`/functions) | **Private to the module**. Other scripts can't see `scene`, `config`, `show()` and so on |
| When it runs | As soon as the parser reaches it, blocking the page | **Deferred**: after the whole HTML has been parsed |
| Strict mode | Opt-in (`'use strict'`) | Always on |
| Opened from a `file://` URL | Works | Browsers block `import`ing *local* module files from `file://`. Since the room's module imports `kit/floor_kit.js`, the page needs a server: GitHub Pages, the installed app, or `python3 serve.py` here (as `menu_demo/` does) |

### The import map

`import 'three'` is a "bare name", not a URL, so the browser needs to be told
where it lives. The import map does that:

```json
{ "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
} }
```

It works like `node_modules` resolution, but in the browser and without a build
step. The second entry maps a whole prefix, so
`'three/addons/controls/OrbitControls.js'` resolves to a file under `examples/jsm/`.

### Why two data files are classic scripts

They were written to work when the page was opened from a file, which it no
longer can be (see above). `dressers.js`, `larders.js` and `sofas.js` are ES
modules now (step 6c), as the model needs them in Node too. The views and
named configurations, which only the page needs, still load as classic scripts before the
module and hand over their contents through globals (`window.ROOM_VIEWS`,
`window.ROOM_CONFIGURATIONS`).

The order matters, and it works out as follows: the classic scripts run first, as
they're parsed. The module is deferred, so by the time it runs the globals exist
and every HTML element above it is in the DOM.

---

## 7. Quick reference: finding things

- **To add a slider**: add the `<label>`, `<span id="xValue">` and
  `<input id="x" type="range">` inside a block in a drawer's HTML (`#cupboardControls` in `#loungePanel` for a cupboard size, which the bedroom's copy then has too). Add `X`
  to `config`, under its piece's `design` or `in` (a cupboard's to
  `config.pieces.cornerCupboard.design`), with a comment. Give it an entry
  in `SCHEMA` (or its module's list), at the same path, as
  `fromSlider(at('X'), 'x')` in
  `cupboardEntries()`: `set()` needs it. Add an `input` listener that calls
  `change([[path, Number(slider.value)]])` (a cupboard's: add it to
  `cupboard_controls.js`'s `CUPBOARD_SLIDERS`, and give the bedroom's an
  entry too, as `cupboardEntries()` makes both), and set the slider and its span in `syncControls()`.
  Use `X` in a `build()` (`const { X } = config.pieces.cornerCupboard.design;`). Its value is then in
  `plans.get()`, `plans.export()` and the snapshots, so run
  `npm run test:update` once and check the snapshots' diff adds only it;
  or regenerate the saved configurations (`tests/configs/`,
  `living_room.configurations.js`) and their snapshots through the model
  with `npm run regen` (`tests/model/regenerate.mjs`), as done since
  18 Oct 2026, checking the diff only adds the new setting.
- **To change how something looks**: find its id or class in the HTML, then search
  `room_3d.css` for that `#id` or `.class`.
- **To find what happens when a control is used**: search for its id in quotes,
  e.g. `'sofaW'`, or for `name=bench` for a radio group.
- **To hide a control for some options**: add a condition in `showInMenus()`,
  where it sets the blocks' `style.display`.
- **To add a board to a cupboard**: draw it with `board(name, { from: [x0, y0, z0], to: [x1, y1, z1] }, g)`,
  as `box()` takes its corners,
  in the option's `build()`. Its name is what the cutting list shows; boards
  `BOARD` thick are listed, anything else is left out.
