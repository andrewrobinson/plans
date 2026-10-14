# room_3d.html — how the page is put together

A guide to the HTML, CSS and JS in `room_3d.html` (3,040 lines),
`kit/floor_kit.js` (538 lines) and `room_3d.css` (124 lines), focused on the UI: the menus, the controls, and how
they drive three.js. The room modelling is only sketched. Line numbers in the
map below are as of 14 Oct 2026, after the cupboards were built from boards
with rear panels against the walls and the engine moved into `kit/`. They go stale with
every change, so the sections after the map name functions and ids instead:
search for those.

This describes the page as it is: one room, with the engine in `kit/`.
`PLAN.md` plans to turn it into one page for the whole flat (a second room,
the hallway, and the staircase and entrance), starting with the living room
moving into `floor.js` and `living_room.js`. When that happens, the map
below will need redoing; the HTML, CSS and control patterns it explains
stay the same.

---

## 1. Top-to-bottom map

### The `<head>` of room_3d.html (lines 1–22)

| Lines | What |
|---|---|
| 1–14 | Doctype, charset, the **viewport meta** (makes phones lay the page out at device width rather than as a zoomed-out desktop page), plus the PWA bits: `manifest.webmanifest`, icons and the "add to home screen" metas |
| **15** | `<link rel="stylesheet" href="room_3d.css">`: **all the CSS**, in its own file (see section 2) |
| 16–21 | The **import map**: tells the browser that `import … from 'three'` means the three.js file on the jsDelivr CDN (see section 6) |

### The `<body>` HTML (lines 23–302)

The HTML only lays out the controls. It contains no logic.

| Lines | Element | What it is on screen |
|---|---|---|
| 24 | `#view` | An empty div that fills the screen. JS puts the three.js `<canvas>` inside it |
| 27–33 | `#bar` | The top bar: ☰ (`#menu`, opens **Other options**), the **option list** (`#current`), **Cupboard options** (`#cupMenu`, opens its drawer), Share and Reset |
| 36–60 | `#topRight` | Two pop-up menus at the top right: **Views** (`#viewsMenu`, purple) and **Look** (`#viewMenu`, blue) |
| 62–72 | `#corner` | The **Scenes** pop-up menu at the bottom right (`#sceneMenu`, green) |
| 74–77 | `#cutBox` | The **cutting list** (`#cutList`) and its Show/Hide button (`#cutToggle`), bottom left, in the 2D views only |
| 78 | `#scrim` | A grey see-through overlay. On phones it dims the model while a drawer is open |
| 79 | `#tip` | A tooltip that follows the pointer over things to store |
| **80–246** | `#panel` | **Other options**, a drawer that slides in from the left. It is made of `<details>` sections: |
| 85–130 | `#secFrontWall` | Island radios, front-piece radios, dresser and larder dropdowns plus sliders |
| 131–147 | `#secSofa` | Sofa dropdown plus sliders |
| 148–174 | `#secBench` | Bench switch, bench-height radios, "above the bench" radios, TV and shelf sliders |
| 175–187 | `#secDoors` | Three door-angle sliders |
| 188–222 | `#secColours` | Colour dropdowns with ◀ ▶ buttons and swatches, plus a nested `<details>` palette |
| 223–238 | `#secStored` | Things to store: packing dropdown, where-radios, buttons, heights off the floor |
| 239–245 | `#about` | The description text (`#summary`), which JS fills in |
| **247–302** | `#cupPanel` | **Cupboard options**, the other drawer: the cupboard-only switch, board thickness, the left-wall depth and front, and each option's own sliders in blocks shown only for it (`#wardBlock` for 9, `#cornerBlock` and `#sideShelfBlock` for 10 and 11, `#legBlock` for 7) |

### Scripts (lines 304–3038)

| Lines | What |
|---|---|
| 304–308 | **Plain data scripts**: `room_3d.views.js`, `.dressers.js`, `.larders.js`, `.sofas.js`, `.scenes.js`. Each one sets a global such as `window.ROOM_SOFAS = {…}` |
| 309 | `<script type="module">` starts. Everything from here to line 3038 is one module, the room's, which imports the engine from `kit/floor_kit.js` and the view and scene kits from `kit/view_kit.js` and `kit/scene_kit.js` |

Inside the module:

| Lines | Section | Notes |
|---|---|---|
| 310–316 | `import` three.js, the engine's pieces from `kit/floor_kit.js`, and the view and scene kits as `ViewKit` and `SceneKit` | |
| 317–344 | Set-up | The room's size (`W`, `D`, `H`), `createStage()` for the scene, renderer, cameras and controls, the cupboards' materials, and `board()` (a named board, for the cutting list) |
| 345–598 | The fixed room | Walls, floor, recesses, door frame, ceiling, windows, kitchen, desk, chair, island, room door |
| 600–645 | **`state`, the settings** | One object holding every setting: `T`, `R`, `F`, `BOARD`, `BENCH`, `LEG`, …, `above`, `colours`, `sofa`, `stored`, … These are the values the controls write to and the address saves |
| 647–735 | Corner-cupboard shelves | `cupShelf()` records them; `drawCupShelves()` draws them, cut back over things stored under them |
| 737–803 | Parts of options 7 and 8 | `tallDoor()`, `fullHeightL()` (option 7), `diagonal()` (option 8) |
| 805–890 | Bench, TV and shelves | `TV_SIZES`, `benchHeights()`, `benchWall()` |
| 892–962 | Colours | The room's `FINISHES`, `COLOUR_TARGETS`, `setRal()` (the RAL table and the oak floor are in the kit) |
| 964–1245 | Option 9's base cupboards, dresser, larders, island, sofa, front wall | Includes `DRESSER_SLIDERS` (1007), `placeIsland()` (1165), `sofa()` (1203), `frontWall()` (1220) |
| 1246–1345 | Option 9's shelving tower, options 10 and 11's corner cupboard, option 10's side bookshelf | `shelvingTower()`, `cornerCupboard()`, `sideBookshelf()` |
| 1347–1526 | **`OPTIONS`** | An array of cupboard designs, each with `name`, `summary` and `build(group)`; then `optionAt()` and the address codes |
| 1527–1710 | 2D dimensions | `updateDims()`, the kit's `cutViews()` giving `applyCut()`, the cupboard-only view, `cupboardDims()`, `doorDims()` (the kit draws the lines, labels and chains) |
| 1712–1777 | **The cutting list** | `CUT_RULE`, `cuttingList()` (read from the model's named boards), `showCuttingList()` |
| 1779–2207 | Things to store | Packing, `cupboardSpaces()` (each option's inside), `insideText()`, drawing, and dragging in plan view |
| **2209–2310** | **`update()` and `show(i)`** | **The heart of the UI-to-3D link** (section 5) |
| 2312–2389 | **The address**: `ADDRESS`, `settingsAddress()`, `readAddress()`, `writeAddress()` | The room's list of fields; the kit's `writeFields()` and `readFields()` write `state` into the URL `#hash` and read it back (section 5) |
| **2390–2793** | **Control wiring** | One event listener per slider, radio group and dropdown (sections 4 and 5) |
| 2794–2894 | Built-in views and "anchors" (things the Look menu can aim at), and the Packing view | At 2856–2869 the 2D views' framing (`flatFit`, `flatPerM`), and the kit's `flatViews()`, which gives `setFlat()`, `resize()` and `startLoop()` |
| 2895–2948 | `ViewKit.create({...})` | Hands the Views and Look dropdowns to `kit/view_kit.js` |
| **2949–2963** | **Pop-up menus** (the kit's `popMenus()`) and `SceneKit.create` | |
| 2965–2974 | The Dimensions and Door sizes buttons | |
| **2976–2982** | **The two drawers** (`DRAWERS`, the kit's `createDrawers()`) | |
| 2984–2990 | Reset, Share and offline support (the kit's `resetButton()`, `shareButton()`, `workOffline()`) | |
| 2996–3025 | `syncControls()` | Puts every slider, radio, switch and dropdown in step with `state` |
| 3027–3036 | **Startup** | `readAddress()` from the URL hash into `state`, then `syncControls()`, then `show(state.option)`, then the view |
| 3037 | **Render loop** | The kit's `startLoop()`: `renderer.setAnimationLoop(...)` draws a frame about 60 times a second |

### kit/floor_kit.js (538 lines)

The engine, an ES module: what any room needs, and nothing about this one.

| What | Exports |
|---|---|
| The stage | `MM`, `createStage(container)`: the scene, renderer, 3D and 2D cameras with their controls, the lights |
| Drawing in mm | `material()`, `box()`, `slab()`, `part()`, `hinge()`, `skewHinge()` |
| Colours | `RAL` (the RAL Classic table), `oakBoards()` (the oak floor's texture) |
| The address | `number()`, `within()`, `radio()`, `sizes()` (readers for a room's fields), `valueAt()`, `setValueAt()`, `writeFields()`, `readFields()` |
| Menus and buttons | `narrow()`, `popMenus()`, `createDrawers()`, `resetButton()`, `shareButton()`, `workOffline()` |
| The 2D/3D switch | `flatViews(stage, view)`: `setFlat()`, `resize()` (fitting the 3D and 2D views to the screen) and `startLoop()` (the render loop), reading the room's framing (`flat`, `flatFit`, `flatPerM`), the view kit's `hfov` and the drawers through `view` |
| 2D dimensions | `dimLine()`, `dimLabel()`, `chain()` (a chain of dimensions), `cutViews(scene, view)`: `applyCut()`, reading the view's cut and what alone to show through `view` |

### kit/view_kit.js (471 lines) and kit/scene_kit.js (93 lines)

The Views and Look menus, and the Scenes menu: ES modules too, each
exporting `create()`, which the room imports as `ViewKit` and `SceneKit`.

### room_3d.css (124 lines)

| Lines | What |
|---|---|
| 1–4 | Base: colour scheme, page background and font, `#view` filling the window |
| 5–19 | The two drawers (`.drawer`, `#panel`, `#cupPanel`) and their open states |
| 20–48 | `#bar`, `#corner` and the pop-up menus (`.pop`, `.group`, `.popToggle`, each menu's `--tint`), and the floating text buttons (`.chip`) |
| 49–66 | The menus' groups, tags and dropdowns (`.group`, `.pick`), and the option list in the top bar |
| 67–69 | The scrim, and the phone-only rule for it |
| 71–99 | The drawers' sections, labels, sliders, buttons, radio rows and switch |
| 100–113 | Tooltip, things to store, description |
| 114–124 | The cutting list |

---

## 2. How the HTML and CSS tie together

### The link: selectors

`room_3d.html` loads the stylesheet in its `<head>`. CSS rules in `room_3d.css` find
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
- `#bar`, `#topRight`, `#corner`, `#cutBox`, the two drawers, `#scrim` and `#tip` are all
  `position: fixed`. They sit on top of the canvas at the screen edges, set by
  `top`/`left`/`right`/`bottom`.
- `z-index` sets which layer is on top: canvas (0) < bars and menus (2) < scrim (2,
  later in the HTML) < drawer (3) < tooltip (4).
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
#sceneMenu { --tint: #2e7d4f; }
.popToggle { color: var(--tint); box-shadow: ... inset 0 0 0 2px var(--tint); }
.group .tag { color: var(--tint); }
```

`--tint` is set on each menu, and **children inherit it**. One `.popToggle`
rule therefore gives each menu button its own colour.

### One class for many buttons

The floating text buttons (Cupboard options, Share, Reset, Dimensions, Show
cutting list, and the menus' Save and Delete) all have `class="chip"` in the
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
- `@media (max-width: 900px) { body.menu-open #scrim { display: block; } }`
 : the scrim only appears on narrow screens. On a wide screen the
  drawer sits over the model and the model stays usable.

---

## 3. How the menus are built, and whether they're HTML, CSS or JS

There are three kinds of menu. **All of them are HTML + CSS + a little JS.** The
JS adds or removes a class or sets an attribute, and the CSS reacts to that.
The one exception is `<details>`, which is pure HTML.

### a) The two drawers (`#panel` and `#cupPanel`)

| Part | Where |
|---|---|
| HTML | `<div id="panel" class="drawer">` (**Other options**, opened by ☰ `#menu`) and `<div id="cupPanel" class="drawer">` (**Cupboard options**, opened by `#cupMenu` in the top bar), each with a ✕ (`.close`) |
| CSS | Normally moved off-screen to the left with `transform`. With `body.menu-open #panel` or `body.cup-open #cupPanel` it is back on screen. A `transition` on `transform` animates the slide |
| JS | `DRAWERS` maps each drawer to its button and its class on `<body>`. `setMenu(id)` opens drawer `id` and closes the other (`setMenu(null)` closes both), so one is open at a time. Its button toggles it; ✕, the scrim and Escape close it |

The JS doesn't move the drawers. It only switches a class on `<body>`, and the
CSS does the movement and the animation.

### b) The three pop-up menus (Views, Look, Scenes)

| Part | Where |
|---|---|
| HTML | `<div class="pop">` holding a `<button class="popToggle">` and a `<div class="group">` |
| CSS | `.pop > .group { display: none }` hides the group. `.pop.open > .group { display: flex }` shows it |
| JS | `setPop(open)` adds `open` to the menu clicked and removes it from the others, and sets `aria-expanded` for screen readers. Escape, or a click outside the menus that isn't on the 3D view, closes them |

Scenes opens upwards for a reason. In `#sceneMenu` the group comes **before** the
button in the HTML, and `#corner` stacks its children in a column
from the bottom of the screen.

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

- Views and Look (`#viewPick`, `#where`, `#lookAt`, `#eye`, `#lookPick`) are filled by
  `kit/view_kit.js`. The page passes the elements in to `ViewKit.create()`.
- Scenes (`#scenePick`) is filled by `kit/scene_kit.js`, through `SceneKit.create()`.
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
`<div id="legBlock">`. `show(i)` sets `style.display = 'none'` or
`''` on these blocks, so only the controls that apply to the current option are visible.
It finds the option by its number (`option.no`, read from the start of its
name), not by its place in `OPTIONS`, as the list starts at option 7 (options 1 to 6
were taken out): `optionAt(n)` gives option n's index, or -1. Options 10 and 11
show `cornerBlock`, the corner cupboard's width and depth (`CORNER_W`, `CORNER_D`),
and hide the left-wall cupboard front's buttons (`#front`), as they have `front()`.
Option 10 alone shows `sideShelfBlock` in it, the Show side bookshelf switch
(`SIDE_SHELF`), and its width and depth sliders (`SIDE_W`, `SIDE_D`) in
`sideShelfDetails` when it's on.

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
   The list comes from the data file (`room_3d.dressers.js`). Adding a dresser
   there adds it to the dropdown.
3. **The kits** (`kit/view_kit.js` and `kit/scene_kit.js`) use the `createElement` style internally.

The dresser, larder and sofa dropdowns also have a disabled **"Custom"** option.
JS selects it when the sliders no longer match any preset (`showDresserPick()`).

---

## 5. How the controls send their values to three.js

### The pattern

Every control follows the same pattern:

```
user moves control
  → browser fires an event ('input' or 'change')
  → listener reads element.value (always a STRING, so Number(...) it)
  → stores it in state (state.T, state.R, state.BENCH, state.sofa.size...)
  → updates the readout <span>
  → calls show(state.option): rebuilds the current option's 3D objects from state
       → which also updates the visible blocks, the description, the dimensions and the URL
  → the render loop draws the new scene on the next frame
```

**Example: a slider**:

```js
const legSlider = document.getElementById('leg');
legSlider.addEventListener('input', () => {
  state.LEG = Number(legSlider.value);                          // 1. into state
  document.getElementById('legValue').textContent = state.LEG;  // 2. the readout
  show(state.option);                                           // 3. rebuild the 3D
});
```

**Example: a radio group**. The code listens on each radio in the group:

```js
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => {
  state.BENCH = Number(r.value);
  benchHeights();
  show(state.option);
}));
```

**Example: a dropdown**:

```js
currentSelect.addEventListener('change', () => chooseOption(Number(currentSelect.value)));
```

**Example: a loop over several similar sliders**. This avoids
repeating the same block for each slider:

```js
for (const [id, key] of [['ward', 'WARD'], ['wardD', 'WARD_D'], ...]) {
  const slider = document.getElementById(id);
  slider.addEventListener('input', () => { state[key] = Number(slider.value); ...; show(state.option); });
}
```

The dresser, larder and sofa sliders do the same, driven by arrays such as
`DRESSER_SLIDERS`: `[key, sliderId, min, max, step]`.

### `input` vs `change`

- **`input`** fires continuously **while a slider is dragged**, so the 3D model
  updates as you drag. All the sliders use it.
- **`change`** fires once the choice is final. It's used for radios, dropdowns,
  checkboxes and the shelf text boxes.

### What `show(i)` does

It's the single place where settings become 3D objects:

1. Removes the old option's `THREE.Group` from the scene.
2. Creates a new group and calls `OPTIONS[i].build(group)`. That function reads the
   sizes it needs from `state` (`const { T, R, LEG } = state;`) to size its boxes.
3. Adds the bench wall, the front-wall piece and the sofa.
4. **Updates the UI to match**: enables or disables dropdown options, writes the
   description, and shows or hides the slider blocks.
5. Calls `updateDims()`, `updatePalette()`, the stored-things code and
   `writeAddress()` (saves the state into the URL), then `update()`.

The approach is simple: **rebuild everything** whenever something changes. It's
fast enough for a model of this size, and it means the 3D model always matches
`state`.

### The faster path for doors

The three door sliders don't rebuild. `update()` only rotates
the existing hinge objects:

```js
roomHinge.rotation.y = THREE.MathUtils.degToRad(Number(roomSlider.value));
```

### Colours

`colourPicker()` builds each colour dropdown and its ◀ ▶
buttons. A choice goes through `setRal(target, code)`, which sets
`.color` on the three.js **materials** shared by those objects. It then calls
`show(state.option)`.

### Views and Look

The Views and Look dropdowns don't change the model. They move the **camera**.
`kit/view_kit.js` handles the dropdowns and calls back into the page through the
`hooks.place()` function, which sets `camera.position` and
`controls.target`.

### The URL holds the state

`ADDRESS` lists the settings' fields in their order in the
`#hash`, each as `[its place in state, how to write it, how to read it back]`,
e.g. `['R', String, within(300, 800)]`. `settingsAddress()` writes
every field and joins them with `-`. At startup
`readAddress()` splits the hash again and reads each field into
`state`, skipping any that fail their check; then `syncControls()`
sets every slider and radio from `state`, e.g. the radio found with
`document.querySelector('input[name=front][value="1329"]')`. This is how Share
links and Scenes work. Reset simply loads the page with no hash.

---

## 6. What is `<script type="module">`?

A normal `<script>` and a `<script type="module">` differ as follows:

| | `<script>` (classic) | `<script type="module">` |
|---|---|---|
| `import` / `export` | Not allowed | **Allowed**. This is the reason it's used here: `import * as THREE from 'three'` |
| Variables at the top level | Become globals (on `window` for `var`/functions) | **Private to the module**. Other scripts can't see `scene`, `state`, `show()` and so on |
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

### Why the data files are classic scripts

They were written to work when the page was opened from a file, which it no
longer can be (see above); they become modules as the room moves into
`living_room.js` (`REFACTOR_PLAN.md`). The kits (`kit/floor_kit.js`, `kit/view_kit.js`, `kit/scene_kit.js`)
are modules already, which the room's module imports. For now the data files
load as classic scripts before the module and hand over their contents
through globals (`window.ROOM_SOFAS`, …). The module then reads those
globals, e.g. `window.ROOM_DRESSERS?.list`.

The order matters, and it works out as follows: the classic scripts run first, as
they're parsed. The module is deferred, so by the time it runs the globals exist
and every HTML element above it is in the DOM.

---

## 7. Quick reference: finding things

- **To add a slider**: add the `<label>`, `<span id="xValue">` and
  `<input id="x" type="range">` inside a block in a drawer's HTML (`#cupPanel` for a cupboard size). Add `X`
  to `state`. Add an `input` listener that sets `state.X`,
  updates the span and calls `show(state.option)`, and set the slider in
  `syncControls()`. Use `X` in a `build()` (`const { X } = state;`). To keep it
  in links, add a field to the end of `ADDRESS`.
- **To change how something looks**: find its id or class in the HTML, then search
  `room_3d.css` for that `#id` or `.class`.
- **To find what happens when a control is used**: search for its id in quotes,
  e.g. `'sofaW'`, or for `name=bench` for a radio group.
- **To hide a control for some options**: add a condition in `show()`, where it
  sets the blocks' `style.display`.
- **To add a board to a cupboard**: draw it with `board(name, x0, y0, z0, x1, y1, z1, g)`
  in the option's `build()`. Its name is what the cutting list shows; boards
  `BOARD` thick are listed, anything else is left out.
