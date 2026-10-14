# room_3d.html — how the page is put together

A guide to the HTML, CSS and JS in `room_3d.html` (3,423 lines) and
`room_3d.css` (105 lines), focused on the UI: the menus, the controls, and how
they drive three.js. The room modelling is only sketched. Line numbers are as
of 12 Oct 2026, after the settings moved into one `state` object and the
address into one list (`REFACTOR_PLAN.md` steps 2 and 3).

This describes the page as it is: one room. `PLAN.md` plans to turn it into
one page for the whole flat (a second room, the hallway, and the staircase
and entrance), with the engine in `kit/floor_kit.js`. When that happens, the
map below will need redoing; the HTML, CSS and control patterns it explains
stay the same.

---

## 1. Top-to-bottom map

### The `<head>` of room_3d.html (lines 1–22)

| Lines | What |
|---|---|
| 1–14 | Doctype, charset, the **viewport meta** (makes phones lay the page out at device width rather than as a zoomed-out desktop page), plus the PWA bits: `manifest.webmanifest`, icons and the "add to home screen" metas |
| **15** | `<link rel="stylesheet" href="room_3d.css">`: **all the CSS**, in its own file (see section 2) |
| 16–21 | The **import map**: tells the browser that `import … from 'three'` means the three.js file on the jsDelivr CDN (see section 6) |

### The `<body>` HTML (lines 23–280)

The HTML only lays out the controls. It contains no logic.

| Lines | Element | What it is on screen |
|---|---|---|
| 24 | `#view` | An empty div that fills the screen. JS puts the three.js `<canvas>` inside it |
| 25–29 | `#bar` | Top-left buttons: ☰ (opens the settings drawer), Share, Reset |
| 32–55 | `#topRight` | Two pop-up menus at the top right: **Views** (`#viewsMenu`, purple) and **Look** (`#viewMenu`, blue) |
| 57–67 | `#corner` | The **Scenes** pop-up menu at the bottom right (`#sceneMenu`, green) |
| 68 | `#scrim` | A grey see-through overlay. On phones it dims the model while the drawer is open |
| 69 | `#tip` | A tooltip that follows the pointer over things to store |
| **70–280** | `#panel` | **The settings drawer**, which slides in from the left. It is made of `<details>` sections: |
| 75–120 | `#secFrontWall` | Island radios, front-piece radios, dresser and larder dropdowns plus sliders |
| 121–137 | `#secSofa` | Sofa dropdown plus sliders |
| 138–164 | `#secBench` | Bench switch, bench-height radios, "above the bench" radios, TV and shelf sliders |
| 165–211 | `#secCupboard` | Cupboard-only switch, depth sliders, front radios, **Option** dropdown (`#current`), x-ray button, option-specific sliders, shelf text inputs |
| 212–224 | `#secDoors` | Three door-angle sliders |
| 225–259 | `#secColours` | Colour dropdowns with ◀ ▶ buttons and swatches, plus a nested `<details>` palette |
| 260–275 | `#secStored` | Packing dropdown, where-radios, buttons |
| 276–279 | `#about` | The description text, which JS fills in |

### Scripts (lines 283–3421)

| Lines | What |
|---|---|
| 283–287 | **Plain data scripts**: `room_3d.views.js`, `.dressers.js`, `.larders.js`, `.sofas.js`, `.scenes.js`. Each one sets a global such as `window.ROOM_SOFAS = {…}` |
| 288–289 | **Plain helper scripts**: `view_kit.js` (sets `window.ViewKit`) and `scene_kit.js` (sets `window.SceneKit`) |
| 290 | `<script type="module">` starts. Everything from here to line 3421 is one module |

Inside the module:

| Lines | Section | Notes |
|---|---|---|
| 291–292 | `import` three.js and OrbitControls | |
| 294–341 | Scene setup | Units (`MM = 0.001`), room size, `scene`, `renderer`, the 3D camera and the 2D (orthographic) camera, each with its controls, lights and materials |
| 342–387 | Geometry helpers | `box()`, `slab()`, `hinge()`, `skewHinge()` |
| 389–635 | The fixed room | Walls, floor, recesses, door frame, ceiling, windows, kitchen, desk, chair, island, room door |
| 637–685 | **`state`, the settings** | One object holding every setting: `T`, `R`, `F`, `BOARD`, `BENCH`, `LEG`, …, `above`, `colours`, `sofa`, `stored`, … These are the values the controls write to and the address saves |
| 687–775 | Corner-cupboard shelves | |
| 777–880 | Parts of options 7 to 9 | `tallDoor()`, `fullHeightL()` (option 7), `diagonal()` (option 8) |
| 882–967 | Bench, TV and shelves | `TV_SIZES`, `benchHeights()`, `benchWall()` |
| 969–1184 | Colours | The `RAL` table, `FINISHES`, `COLOUR_TARGETS`, `setRal()` |
| 1186–1577 | Option 9 parts, dresser, larders, island, sofa, front wall | Includes `DRESSER_SLIDERS` (1229), `placeIsland()` (1400), `sofa()` (1438), `frontWall()` (1455) |
| 1579–1861 | **`OPTIONS`** | An array of cupboard designs, each with `name`, `summary` and `build(group)` |
| 1863–2071 | 2D dimensions | `updateDims()`, `applyCut()`, the cupboard-only view |
| 2073–2482 | Things to store | Packing, drawing, and dragging in plan view |
| **2484–2591** | **`update()` and `show(i)`** | **The heart of the UI-to-3D link** (section 5) |
| 2593–2694 | **The address**: `ADDRESS`, `settingsAddress()`, `readAddress()`, `writeAddress()` | One list of the settings' fields, which writes `state` into the URL `#hash` and reads it back (section 5) |
| **2695–3096** | **Control wiring** | One event listener per slider, radio group and dropdown (sections 4 and 5) |
| 3098–3205 | Built-in views and "anchors" (things the Look menu can aim at) | |
| 3206–3257 | `ViewKit.create({...})` | Hands the Views and Look dropdowns to `view_kit.js` |
| **3258–3283** | **Pop-up menus** (`setPop`) and `SceneKit.create` | |
| 3285–3319 | `setFlat()` (2D/3D), Dimensions button, `resize()` | |
| **3321–3333** | **Settings drawer** (`setMenu`) | |
| 3335–3366 | Reset and Share buttons | |
| 3368–3371 | Service worker (offline support) | |
| 3373–3405 | `syncControls()` | Puts every slider, radio, switch and dropdown in step with `state` |
| 3407–3416 | **Startup** | `readAddress()` from the URL hash into `state`, then `syncControls()`, then `show(state.option)`, then the view |
| 3417–3420 | **Render loop** | `renderer.setAnimationLoop(...)` draws a frame about 60 times a second |

### room_3d.css (105 lines)

| Lines | What |
|---|---|
| 1–4 | Base: colour scheme, page background and font, `#view` filling the window |
| 5–14 | The settings drawer (`#panel`) and its open state |
| 15–27 | `#bar`, `#corner` and the pop-up menus (`.pop`, `.group`) |
| 28–43 | Menu buttons (`#menu`, `.popToggle`), each menu's `--tint`, and the floating text buttons (`.chip`) |
| 44–58 | The menus' groups, tags and dropdowns (`.group`, `.pick`) |
| 59–61 | The scrim, and the phone-only rule for it |
| 62–79 | The drawer's sections, labels, sliders, buttons, radio rows and switch |
| 80–105 | Colours, palette, tooltip, things to store, description |

---

## 2. How the HTML and CSS tie together

### The link: selectors

`room_3d.html` loads the stylesheet at line 15. CSS rules in `room_3d.css` find
HTML elements by **id** (`#panel`), **class** (`.pop`), **tag** (`label`),
**attribute** (`input[type=range]`) or a combination of these. A few patterns:

```css
#panel label { display: block; }             /* any <label> inside #panel */
.pop > .group { display: none; }             /* a .group that is a DIRECT child of a .pop */
.pop.open > .group { display: flex; }        /* ...but shown when the .pop also has class "open" */
body.menu-open #panel { transform: none; }   /* #panel when <body> has class "menu-open" */
.chip[hidden] { display: none; }             /* a .chip with the hidden attribute */
```

The key idea is that **CSS describes how each state looks, and JS only changes
the state** by adding or removing a class. Most of the menu behaviour works this way.

### Layout: everything floats over a full-screen canvas

- `#view` is `position: fixed; inset: 0` (css line 4), so it fills the window.
  The 3D canvas lives inside it.
- `#bar`, `#topRight`, `#corner`, `#panel`, `#scrim` and `#tip` are all
  `position: fixed`. They sit on top of the canvas at the screen edges, set by
  `top`/`left`/`right`/`bottom`.
- `z-index` sets which layer is on top: canvas (0) < bars and menus (2) < scrim (2,
  later in the HTML) < drawer (3) < tooltip (4).
- **`pointer-events: none`** on the containers (`#bar`, `#topRight`, `.pop`,
  `.group`), with `pointer-events: auto` on the buttons and dropdowns themselves
  (css lines 19, 24–29, 39, 55). A container is an invisible box, and without
  this it would block mouse drags meant for the 3D model. With it, clicks pass
  through the gaps to the canvas and only the visible controls catch them.

### Flexbox for arranging rows and columns

`display: flex` lays a container's children out in a row (or in a column with
`flex-direction: column`). `gap` sets the spacing, `align-items` the alignment,
and `flex-wrap: wrap` lets the children wrap onto new lines. Every menu group and
colour row uses it (css lines 17–18, 24, 25, 46, 83).

### CSS variables give each menu its colour

```css
#viewMenu  { --tint: #1f4e79; }   /* css line 33 */
#viewsMenu { --tint: #6a3d9a; }
#sceneMenu { --tint: #2e7d4f; }
.popToggle { color: var(--tint); box-shadow: ... inset 0 0 0 2px var(--tint); }
.group .tag { color: var(--tint); }
```

`--tint` is set on each menu, and **children inherit it**. One `.popToggle`
rule therefore gives each menu button its own colour.

### One class for many buttons

The nine floating text buttons (Share, Reset, Dimensions, and the menus' Save
and Delete) all have `class="chip"` in the HTML, and one `.chip` rule (css line
38) styles them. To give a new button the same look, add `class="chip"` to it.

### Hand-styled controls

- **The sliding switch** (css lines 74–79): a real checkbox with its look removed
  (`appearance: none`), resized into a pill shape. `::after` draws the white knob,
  and `:checked` moves it (`left: 18px`) and colours the track. This is pure CSS:
  the checkbox still behaves as a normal checkbox.
- **Range sliders** are only resized to `width: 100%` (css line 66). Otherwise
  they are the browser's own.
- **`.depth` radio groups** (css lines 71–72): the labels are set to
  `display: inline` so the radios sit side by side. The island group overrides
  this to one per line (css line 73).

### Responsive (phone) behaviour

- `max-width: 88vw` on the drawer (css line 8) means it never takes more than
  88% of the screen width.
- `@media (max-width: 900px) { body.menu-open #scrim { display: block; } }`
  (css line 61): the scrim only appears on narrow screens. On a wide screen the
  drawer sits over the model and the model stays usable.

---

## 3. How the menus are built, and whether they're HTML, CSS or JS

There are three kinds of menu. **All of them are HTML + CSS + a little JS.** The
JS adds or removes a class or sets an attribute, and the CSS reacts to that.
The one exception is `<details>`, which is pure HTML.

### a) The settings drawer (`#panel`)

| Part | Where |
|---|---|
| HTML | `<div id="panel">` (line 70), plus the ☰ button `#menu` (line 26) and ✕ `#close` (line 73) |
| CSS | Normally `transform: translateX(-105%)`, i.e. moved off-screen to the left (css line 11). With `body.menu-open #panel { transform: none; }` (css line 13) it is back on screen. `transition: transform 0.25s` animates the slide |
| JS | `setMenu(open)` (lines 3324–3328) runs `document.body.classList.toggle('menu-open', open)`. ☰, ✕, the scrim and Escape all call it (3330–3333) |

The JS doesn't move the drawer. It only switches a class on `<body>`, and the
CSS does the movement and the animation.

### b) The three pop-up menus (Views, Look, Scenes)

| Part | Where |
|---|---|
| HTML | `<div class="pop">` holding a `<button class="popToggle">` and a `<div class="group">` (lines 33–66) |
| CSS | `.pop > .group { display: none }` hides the group. `.pop.open > .group { display: flex }` shows it (css lines 26–27) |
| JS | `setPop(open)` (3265–3270) adds `open` to the menu clicked and removes it from the others, and sets `aria-expanded` for screen readers. Escape, or a click outside the menus that isn't on the 3D view, closes them (3272–3273) |

Scenes opens upwards for a reason. In `#sceneMenu` the group comes **before** the
button in the HTML (lines 59–65), and `#corner` stacks its children in a column
from the bottom of the screen.

### c) The collapsible sections in the drawer

These are `<details><summary>Heading</summary> …content… </details>`, a **built-in
HTML element**. Clicking the summary opens or closes it with no JS or CSS. The
`open` attribute in the HTML (e.g. `<details class="sec" id="secSofa" open>`)
makes a section start open.

The only JS involved (lines 2730–2742, 2894–2898) **remembers** each section's
open/closed state in `localStorage`, using the `toggle` event.

### What fills the menus' dropdowns

The `<select>` elements in the HTML are **empty** (e.g. `<select id="where"
class="pick"></select>`). JS adds every `<option>`:

- Views and Look (`#viewPick`, `#where`, `#lookAt`, `#eye`, `#lookPick`) are filled by
  `view_kit.js`. The page passes the elements in at lines 3220–3224.
- Scenes (`#scenePick`) is filled by `scene_kit.js` (3274–3283).
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
  Some JS relies on it, for example `` document.getElementById(`${id}Value`) `` (line 2754).

**Showing and hiding controls.** Many sliders are wrapped in a block such as
`<div id="legBlock">`. `show(i)` (lines 2564–2579) sets `style.display = 'none'` or
`''` on these blocks, so only the controls that apply to the current option are visible.
It finds the option by its number (`option.no`, read from the start of its
name), not by its place in `OPTIONS`, as the list starts at option 7 (options 1 to 6
were taken out): `optionAt(n)` gives option n's index, or -1. Options 10 and 11
show `cornerBlock`, the corner cupboard's width and depth (`CORNER_W`, `CORNER_D`),
and hide the left-wall cupboard front's buttons (`#front`), as they have `front()`.

### Dropdowns are filled by JS

Three styles are used, which do the same thing:

1. **An HTML string** (line 2506):
   ```js
   currentSelect.innerHTML = OPTIONS.map((o, i) => `<option value="${i}">${o.name}</option>`).join('');
   ```
   The colour pickers use the same approach, with `<optgroup label="...">` for the
   headed sub-lists (lines 2787–2791, 2799–2801).
2. **`createElement`** (lines 2935–2936, 2949–2950, 3043–3044):
   ```js
   dresserPick.append(...Object.entries(DRESSERS).map(([id, d]) =>
     Object.assign(document.createElement('option'), { value: id, textContent: `${d.label} (${d.w} × ${d.h})` })));
   ```
   The list comes from the data file (`room_3d.dressers.js`). Adding a dresser
   there adds it to the dropdown.
3. **The kits** (`view_kit.js` and `scene_kit.js`) use the `createElement` style internally.

The dresser, larder and sofa dropdowns also have a disabled **"Custom"** option.
JS selects it when the sliders no longer match any preset (`showDresserPick()`, line 2937).

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
  → the render loop (line 3417) draws the new scene on the next frame
```

**Example: a slider** (lines 2706–2711):

```js
const legSlider = document.getElementById('leg');
legSlider.addEventListener('input', () => {
  state.LEG = Number(legSlider.value);                          // 1. into state
  document.getElementById('legValue').textContent = state.LEG;  // 2. the readout
  show(state.option);                                           // 3. rebuild the 3D
});
```

**Example: a radio group** (lines 2725–2729). The code listens on each radio in the group:

```js
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => {
  state.BENCH = Number(r.value);
  benchHeights();
  show(state.option);
}));
```

**Example: a dropdown** (line 2507):

```js
currentSelect.addEventListener('change', () => chooseOption(Number(currentSelect.value)));
```

**Example: a loop over several similar sliders** (lines 2750–2757). This avoids
repeating the same block for each slider:

```js
for (const [id, key] of [['ward', 'WARD'], ['wardD', 'WARD_D'], ...]) {
  const slider = document.getElementById(id);
  slider.addEventListener('input', () => { state[key] = Number(slider.value); ...; show(state.option); });
}
```

The dresser, larder and sofa sliders do the same, driven by arrays such as
`DRESSER_SLIDERS` (line 1229): `[key, sliderId, min, max, step]`.

### `input` vs `change`

- **`input`** fires continuously **while a slider is dragged**, so the 3D model
  updates as you drag. All the sliders use it.
- **`change`** fires once the choice is final. It's used for radios, dropdowns,
  checkboxes and the shelf text boxes.

### What `show(i)` does (lines 2533–2590)

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

The three door sliders don't rebuild. `update()` (lines 2491–2501) only rotates
the existing hinge objects:

```js
roomHinge.rotation.y = THREE.MathUtils.degToRad(Number(roomSlider.value));
```

### Colours

`colourPicker()` (lines 2796–2827) builds each colour dropdown and its ◀ ▶
buttons. A choice goes through `setRal(target, code)` (line 1163), which sets
`.color` on the three.js **materials** shared by those objects. It then calls
`show(state.option)`.

### Views and Look

The Views and Look dropdowns don't change the model. They move the **camera**.
`view_kit.js` handles the dropdowns and calls back into the page through the
`hooks.place()` function (lines 3226–3242), which sets `camera.position` and
`controls.target`.

### The URL holds the state

`ADDRESS` (line 2619) lists the settings' fields in their order in the
`#hash`, each as `[its place in state, how to write it, how to read it back]`,
e.g. `['R', String, within(300, 800)]`. `settingsAddress()` (line 2666) writes
every field and joins them with `-`. At startup (lines 3407–3413)
`readAddress()` (line 2672) splits the hash again and reads each field into
`state`, skipping any that fail their check; then `syncControls()` (line 3373)
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
| Opened from a `file://` URL | Works | An inline module works. `import`ing *local* module files usually fails because of browser security |

### The import map (lines 16–21)

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
283–289 and hand over their contents through globals (`window.ROOM_SOFAS`,
`window.ViewKit`, …). The module then reads those globals, e.g.
`window.ROOM_DRESSERS?.list` (line 1232).

The order matters, and it works out as follows: the classic scripts run first, as
they're parsed. The module is deferred, so by the time it runs the globals exist
and every HTML element above it is in the DOM.

---

## 7. Quick reference: finding things

- **To add a slider**: add the `<label>`, `<span id="xValue">` and
  `<input id="x" type="range">` inside a block in the drawer HTML. Add `X`
  to `state` (lines 637–685). Add an `input` listener that sets `state.X`,
  updates the span and calls `show(state.option)`, and set the slider in
  `syncControls()`. Use `X` in a `build()` (`const { X } = state;`). To keep it
  in links, add a field to the end of `ADDRESS`.
- **To change how something looks**: find its id or class in the HTML, then search
  `room_3d.css` for that `#id` or `.class`.
- **To find what happens when a control is used**: search for its id in quotes,
  e.g. `'sofaW'`, or for `name=bench` for a radio group.
- **To hide a control for some options**: add a condition in `show()` around
  lines 2564–2579.
