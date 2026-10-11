# room_3d.html — how the page is put together

A guide to the HTML, CSS and JS in `room_3d.html` (3,431 lines), focused on the
UI: the menus, the controls, and how they drive three.js. The room modelling is
only sketched. Line numbers are as of 11 Oct 2026.

---

## 1. Top-to-bottom map

### The `<head>` (lines 1–126)

| Lines | What |
|---|---|
| 1–14 | Doctype, charset, the **viewport meta** (makes phones lay the page out at device width rather than as a zoomed-out desktop page), plus the PWA bits: `manifest.webmanifest`, icons and the "add to home screen" metas |
| **15–119** | **All the CSS**, in one `<style>` block (see section 2) |
| 120–125 | The **import map**: tells the browser that `import … from 'three'` means the three.js file on the jsDelivr CDN (see section 6) |

### The `<body>` HTML (lines 127–376)

The HTML only lays out the controls. It contains no logic.

| Lines | Element | What it is on screen |
|---|---|---|
| 128 | `#view` | An empty div that fills the screen. JS puts the three.js `<canvas>` inside it |
| 129–133 | `#bar` | Top-left buttons: ☰ (opens the settings drawer), Share, Reset |
| 136–159 | `#topRight` | Two pop-up menus at the top right: **Views** (`#viewsMenu`, purple) and **Look** (`#viewMenu`, blue) |
| 161–171 | `#corner` | The **Scenes** pop-up menu at the bottom right (`#sceneMenu`, green) |
| 172 | `#scrim` | A grey see-through overlay. On phones it dims the model while the drawer is open |
| 173 | `#tip` | A tooltip that follows the pointer over things to store |
| **174–375** | `#panel` | **The settings drawer**, which slides in from the left. It is made of `<details>` sections: |
| 179–216 | `#secFrontWall` | Island radios, front-piece radios, dresser and larder dropdowns plus sliders |
| 217–233 | `#secSofa` | Sofa dropdown plus sliders |
| 234–260 | `#secBench` | Bench switch, bench-height radios, "above the bench" radios, TV and shelf sliders |
| 261–305 | `#secCupboard` | Cupboard-only switch, depth sliders, front radios, **Option** dropdown (`#current`), x-ray button, option-specific sliders, shelf text inputs |
| 306–318 | `#secDoors` | Three door-angle sliders |
| 319–353 | `#secColours` | Colour dropdowns with ◀ ▶ buttons and swatches, plus a nested `<details>` palette |
| 354–369 | `#secStored` | Packing dropdown, where-radios, buttons |
| 370–373 | `#about` | The description text, which JS fills in |

### Scripts (lines 377–3429)

| Lines | What |
|---|---|
| 377–381 | **Plain data scripts**: `room_3d.views.js`, `.dressers.js`, `.larders.js`, `.sofas.js`, `.scenes.js`. Each one sets a global such as `window.ROOM_SOFAS = {…}` |
| 382–383 | **Plain helper scripts**: `view_kit.js` (sets `window.ViewKit`) and `scene_kit.js` (sets `window.SceneKit`) |
| 384 | `<script type="module">` starts. Everything from here to line 3429 is one module |

Inside the module:

| Lines | Section | Notes |
|---|---|---|
| 385–386 | `import` three.js and OrbitControls | |
| 388–435 | Scene setup | Units (`MM = 0.001`), room size, `scene`, `renderer`, the 3D camera and the 2D (orthographic) camera, each with its controls, lights and materials |
| 437–482 | Geometry helpers | `box()`, `slab()`, `hinge()`, `skewHinge()` |
| 483–730 | The fixed room | Walls, floor, recesses, door frame, ceiling, windows, kitchen, desk, chair, island, room door |
| 731–773 | **Setting variables** | `let T`, `R`, `F`, `UPPER`, `LEG`, `LEG_D`, `EXTRA`, `WARD`, `TOWER`, … These are the values the sliders write to |
| 774–860 | Corner-cupboard shelves | |
| 862–959 | Parts shared by options 1–5 | |
| 960–1045 | Bench, TV and shelves | `above`, `shelfDepth`, `benchOn`, `TV_SIZES`, `benchWall()` |
| 1046–1264 | Colours | The `RAL` table, `FINISHES`, `COLOUR_TARGETS`, `setRal()` |
| 1265–1640 | Option 9 parts, dresser, larders, island, sofa, front wall | Includes `DRESSER_SLIDERS` (1309), `placeIsland()` (1471), `sofa()` (1504), `frontWall()` (1521) |
| 1641–1912 | **`OPTIONS`** | An array of cupboard designs, each with `name`, `summary` and `build(group)` |
| 1913–2120 | 2D dimensions | `updateDims()`, `applyCut()`, the cupboard-only view |
| 2121–2529 | Things to store | Packing, drawing, and dragging in plan view |
| **2530–2637** | **`update()` and `show(i)`** | **The heart of the UI-to-3D link** (section 5) |
| 2638–2660 | `settingsAddress()`, `writeAddress()` | Saves the whole state into the URL `#hash` |
| **2661–3043** | **Control wiring** | One event listener per slider, radio group and dropdown (sections 4 and 5) |
| 3044–3148 | Built-in views and "anchors" (things the Look menu can aim at) | |
| 3149–3202 | `ViewKit.create({...})` | Hands the Views and Look dropdowns to `view_kit.js` |
| **3203–3228** | **Pop-up menus** (`setPop`) and `SceneKit.create` | |
| 3230–3264 | `setFlat()` (2D/3D), Dimensions button, `resize()` | |
| **3266–3278** | **Settings drawer** (`setMenu`) | |
| 3280–3311 | Reset and Share buttons | |
| 3313–3316 | Service worker (offline support) | |
| 3318–3424 | **Startup** | Reads the URL hash and sets the sliders, radios and variables from it, then `show(...)` |
| 3425–3428 | **Render loop** | `renderer.setAnimationLoop(...)` draws a frame about 60 times a second |

---

## 2. How the HTML and CSS tie together

### The link: selectors

CSS rules find HTML elements by **id** (`#panel`), **class** (`.pop`), **tag**
(`label`), **attribute** (`input[type=range]`) or a combination of these. A few
patterns from this file:

```css
#panel label { display: block; }             /* any <label> inside #panel */
.pop > .group { display: none; }             /* a .group that is a DIRECT child of a .pop */
.pop.open > .group { display: flex; }        /* ...but shown when the .pop also has class "open" */
body.menu-open #panel { transform: none; }   /* #panel when <body> has class "menu-open" */
#deleteView[hidden] { display: none; }       /* when the element has the hidden attribute */
```

The key idea is that **CSS describes how each state looks, and JS only changes
the state** by adding or removing a class. Most of the menu behaviour works this way.

### Layout: everything floats over a full-screen canvas

- `#view` is `position: fixed; inset: 0` (line 18), so it fills the window. The
  3D canvas lives inside it.
- `#bar`, `#topRight`, `#corner`, `#panel`, `#scrim` and `#tip` are all
  `position: fixed`. They sit on top of the canvas at the screen edges, set by
  `top`/`left`/`right`/`bottom`.
- `z-index` sets which layer is on top: canvas (0) < bars and menus (2) < scrim (2,
  later in the HTML) < drawer (3) < tooltip (4).
- **`pointer-events: none`** on the containers (`#bar`, `#topRight`, `.pop`,
  `.group`), with `pointer-events: auto` on the buttons and dropdowns themselves
  (lines 33, 38–43, 52, 68). A container is an invisible box, and without this it would
  block mouse drags meant for the 3D model. With it, clicks pass through the gaps
  to the canvas and only the visible controls catch them.

### Flexbox for arranging rows and columns

`display: flex` lays a container's children out in a row (or in a column with
`flex-direction: column`). `gap` sets the spacing, `align-items` the alignment,
and `flex-wrap: wrap` lets the children wrap onto new lines. Every menu group and
colour row uses it (lines 32, 38, 39, 59, 96).

### CSS variables give each menu its colour

```css
#viewMenu  { --tint: #1f4e79; }   /* line 47 */
#viewsMenu { --tint: #6a3d9a; }
#sceneMenu { --tint: #2e7d4f; }
.popToggle { color: var(--tint); box-shadow: ... inset 0 0 0 2px var(--tint); }
.group .tag { color: var(--tint); }
```

`--tint` is set on each menu, and **children inherit it**. One `.popToggle`
rule therefore gives each menu button its own colour.

### Hand-styled controls

- **The sliding switch** (lines 87–92): a real checkbox with its look removed
  (`appearance: none`), resized into a pill shape. `::after` draws the white knob,
  and `:checked` moves it (`left: 18px`) and colours the track. This is pure CSS:
  the checkbox still behaves as a normal checkbox.
- **Range sliders** are only resized to `width: 100%` (line 79). Otherwise they
  are the browser's own.
- **`.depth` radio groups** (lines 84–85): the labels are set to `display: inline`
  so the radios sit side by side. The island group overrides this to one per line (line 86).

### Responsive (phone) behaviour

- `max-width: 88vw` on the drawer (line 22) means it never takes more than 88% of the screen width.
- `@media (max-width: 900px) { body.menu-open #scrim { display: block; } }` (line 74):
  the scrim only appears on narrow screens. On a wide screen the drawer sits over
  the model and the model stays usable.

---

## 3. How the menus are built, and whether they're HTML, CSS or JS

There are three kinds of menu. **All of them are HTML + CSS + a little JS.** The
JS adds or removes a class or sets an attribute, and the CSS reacts to that.
The one exception is `<details>`, which is pure HTML.

### a) The settings drawer (`#panel`)

| Part | Where |
|---|---|
| HTML | `<div id="panel">` (line 174), plus the ☰ button `#menu` (line 130) and ✕ `#close` (line 177) |
| CSS | Normally `transform: translateX(-105%)`, i.e. moved off-screen to the left (line 25). With `body.menu-open #panel { transform: none; }` (line 27) it is back on screen. `transition: transform 0.25s` animates the slide |
| JS | `setMenu(open)` (lines 3269–3274) runs `document.body.classList.toggle('menu-open', open)`. ☰, ✕, the scrim and Escape all call it (3275–3278) |

The JS doesn't move the drawer. It only switches a class on `<body>`, and the
CSS does the movement and the animation.

### b) The three pop-up menus (Views, Look, Scenes)

| Part | Where |
|---|---|
| HTML | `<div class="pop">` holding a `<button class="popToggle">` and a `<div class="group">` (lines 137–170) |
| CSS | `.pop > .group { display: none }` hides the group. `.pop.open > .group { display: flex }` shows it (lines 40–41) |
| JS | `setPop(open)` (3210–3215) adds `open` to the menu clicked and removes it from the others, and sets `aria-expanded` for screen readers. Escape, or a click outside the menus that isn't on the 3D view, closes them (3217–3218) |

Scenes opens upwards for a reason. In `#sceneMenu` the group comes **before** the
button in the HTML (lines 163–169), and `#corner` stacks its children in a column
from the bottom of the screen.

### c) The collapsible sections in the drawer

These are `<details><summary>Heading</summary> …content… </details>`, a **built-in
HTML element**. Clicking the summary opens or closes it with no JS or CSS. The
`open` attribute in the HTML (e.g. `<details class="sec" id="secSofa" open>`)
makes a section start open.

The only JS involved (lines 2685–2697, 2848–2853) **remembers** each section's
open/closed state in `localStorage`, using the `toggle` event.

### What fills the menus' dropdowns

The `<select>` elements in the HTML are **empty** (e.g. `<select id="where"
class="pick"></select>`). JS adds every `<option>`:

- Views and Look (`#viewPick`, `#where`, `#lookAt`, `#eye`, `#lookPick`) are filled by
  `view_kit.js`. The page passes the elements in at lines 3179–3183.
- Scenes (`#scenePick`) is filled by `scene_kit.js` (3219–3228).
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
  Some JS relies on it, for example `` document.getElementById(`${id}Value`) `` (line 2709).

**Showing and hiding controls.** Many sliders are wrapped in a block such as
`<div id="legBlock">`. `show(i)` (lines 2612–2625) sets `style.display = 'none'` or
`''` on these blocks, so only the controls that apply to the current option are visible.

### Dropdowns are filled by JS

Three styles are used, which do the same thing:

1. **An HTML string** (line 2554):
   ```js
   currentSelect.innerHTML = OPTIONS.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');
   ```
   The colour pickers use the same approach, with `<optgroup label="...">` for the
   headed sub-lists (lines 2742–2746, 2754–2756).
2. **`createElement`** (lines 2889–2891, 2904–2905, 2989–2991):
   ```js
   dresserPick.append(...Object.entries(DRESSERS).map(([id, d]) =>
     Object.assign(document.createElement('option'), { value: id, textContent: `${d.label} (${d.w} × ${d.h})` })));
   ```
   The list comes from the data file (`room_3d.dressers.js`). Adding a dresser
   there adds it to the dropdown.
3. **The kits** (`view_kit.js` and `scene_kit.js`) use the `createElement` style internally.

The dresser, larder and sofa dropdowns also have a disabled **"Custom"** option.
JS selects it when the sliders no longer match any preset (`showDresserPick()`, line 2893).

---

## 5. How the controls send their values to three.js

### The pattern

Every control follows the same pattern:

```
user moves control
  → browser fires an event ('input' or 'change')
  → listener reads element.value (always a STRING, so Number(...) it)
  → stores it in a module variable (T, R, BENCH, WARD, sofaSize...)
  → updates the readout <span>
  → calls show(shown): rebuilds the current option's 3D objects using those variables
       → which also updates the visible blocks, the description, the dimensions and the URL
  → the render loop (line 3425) draws the new scene on the next frame
```

**Example: a slider** (lines 2700–2705):

```js
const upperSlider = document.getElementById('upper');
upperSlider.addEventListener('input', () => {
  UPPER = Number(upperSlider.value);                          // 1. into the variable
  document.getElementById('upperValue').textContent = UPPER;  // 2. the readout
  show(shown);                                                // 3. rebuild the 3D
});
```

**Example: a radio group** (lines 2680–2684). The code listens on each radio in the group:

```js
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => {
  BENCH = Number(r.value);
  benchHeights();
  show(shown);
}));
```

**Example: a dropdown** (line 2555):

```js
currentSelect.addEventListener('change', () => chooseOption(Number(currentSelect.value)));
```

**Example: a loop over several similar sliders** (lines 2706–2713). This avoids
repeating the same block for each slider:

```js
for (const [id, set] of [['ward', v => { WARD = v; }], ['wardD', v => { WARD_D = v; }], ...]) {
  const slider = document.getElementById(id);
  slider.addEventListener('input', () => { set(Number(slider.value)); ...; show(shown); });
}
```

The dresser, larder and sofa sliders do the same, driven by arrays such as
`DRESSER_SLIDERS` (line 1309): `[key, sliderId, min, max, step]`.

### `input` vs `change`

- **`input`** fires continuously **while a slider is dragged**, so the 3D model
  updates as you drag. All the sliders use it.
- **`change`** fires once the choice is final. It's used for radios, dropdowns,
  checkboxes and the shelf text boxes.

### What `show(i)` does (lines 2581–2636)

It's the single place where settings become 3D objects:

1. Removes the old option's `THREE.Group` from the scene.
2. Creates a new group and calls `OPTIONS[i].build(group)`. That function reads the
   variables (`T`, `R`, `UPPER`, …) to size its boxes.
3. Adds the bench wall, the front-wall piece and the sofa.
4. **Updates the UI to match**: enables or disables dropdown options, writes the
   description, and shows or hides the slider blocks.
5. Calls `updateDims()`, `updatePalette()`, the stored-things code and
   `writeAddress()` (saves the state into the URL), then `update()`.

The approach is simple: **rebuild everything** whenever something changes. It's
fast enough for a model of this size, and it means the 3D model always matches the
variables.

### The faster path for doors

The three door sliders don't rebuild. `update()` (lines 2539–2550) only rotates
the existing hinge objects:

```js
roomHinge.rotation.y = THREE.MathUtils.degToRad(Number(roomSlider.value));
```

### Colours

`colourPicker()` (lines 2751–2782) builds each colour dropdown and its ◀ ▶
buttons. A choice goes through `setRal(target, code)` (line 1242), which sets
`.color` on the three.js **materials** shared by those objects. It then calls
`show(shown)`.

### Views and Look

The Views and Look dropdowns don't change the model. They move the **camera**.
`view_kit.js` handles the dropdowns and calls back into the page through the
`hooks.place()` function (lines 3184–3201), which sets `camera.position` and
`controls.target`.

### The URL holds the state

`settingsAddress()` (line 2643) joins every setting with `-` into the `#hash`.
At startup (lines 3318–3424) the hash is split again, and each slider and radio is
set from it, e.g. `rearSlider.value = rear`, or `frontRadio.checked = true` for
radios found with `document.querySelector('input[name=front][value="1329"]')`.
This is how Share links and Scenes work. Reset simply loads the page with no hash.

---

## 6. What is `<script type="module">`?

A normal `<script>` and a `<script type="module">` differ as follows:

| | `<script>` (classic) | `<script type="module">` |
|---|---|---|
| `import` / `export` | Not allowed | **Allowed**. This is the reason it's used here: `import * as THREE from 'three'` |
| Variables at the top level | Become globals (on `window` for `var`/functions) | **Private to the module**. Other scripts can't see `scene`, `T`, `show()` and so on |
| When it runs | As soon as the parser reaches it, blocking the page | **Deferred**: after the whole HTML has been parsed |
| Strict mode | Opt-in (`'use strict'`) | Always on |
| Opened from a `file://` URL | Works | An inline module works. `import`ing *local* module files usually fails because of browser security |

### The import map (lines 120–125)

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

### Why the other files are classic scripts

`view_kit.js` notes that it's "a plain script (not a module), so pages work when
opened from a file too". The data and kit files load as classic scripts at lines
377–383 and hand over their contents through globals (`window.ROOM_SOFAS`,
`window.ViewKit`, …). The module then reads those globals, e.g.
`window.ROOM_DRESSERS?.list` (line 1312).

The order matters, and it works out as follows: the classic scripts run first, as
they're parsed. The module is deferred, so by the time it runs the globals exist
and every HTML element above it is in the DOM.

---

## 7. Quick reference: finding things

- **To add a slider**: add the `<label>`, `<span id="xValue">` and
  `<input id="x" type="range">` inside a block in the drawer HTML. Add a
  `let X` variable near lines 731–773. Add an `input` listener that sets `X`,
  updates the span and calls `show(shown)`. Use `X` in a `build()`. To keep it
  in links, add it to `settingsAddress()` and to the startup reading.
- **To change how something looks**: find its id or class in the HTML, then search
  the `<style>` block (lines 15–119) for that `#id` or `.class`.
- **To find what happens when a control is used**: search for its id in quotes,
  e.g. `'sofaW'`, or for `name=bench` for a radio group.
- **To hide a control for some options**: add a condition in `show()` around
  lines 2612–2625.
