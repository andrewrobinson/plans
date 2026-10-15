# index.html — how the page is put together

A guide to the HTML, CSS and JS in `index.html` (321 lines), the living
room's `living_room.js` (2,696 lines) and `floor.js` (341 lines),
`kit/floor_kit.js` (541 lines) and `room_3d.css` (125 lines), focused on the UI: the menus, the controls, and how
they drive three.js. The room modelling is only sketched. Line numbers in the
map below are as of 15 Oct 2026, after step 5 of `REFACTOR_PLAN.md` (longer
names, named steps, and one function, `changeSettings()`, for every
settings control). They go stale with
every change, so the sections after the map name functions and ids instead:
search for those.

This describes the page as it is: one room, the living room, with its walls
in `floor.js` and the engine in `kit/`. `room_3d.html`, the old address, now
only redirects to `index.html`. `PLAN.md` plans one page for the whole flat
(a second room, the hallway, and the staircase and entrance); the HTML, CSS
and control patterns this explains stay the same.

---

## 1. Top-to-bottom map

### The `<head>` of index.html (lines 1–27)

| Lines | What |
|---|---|
| 1–19 | Doctype, charset, the **viewport meta** (makes phones lay the page out at device width rather than as a zoomed-out desktop page), the title and a comment on what the page is, plus the PWA bits: `manifest.webmanifest`, icons and the "add to home screen" metas |
| **20** | `<link rel="stylesheet" href="room_3d.css">`: **all the CSS**, in its own file (see section 2) |
| 21–26 | The **import map**: tells the browser that `import … from 'three'` means the three.js file on the jsDelivr CDN (see section 6) |

### The `<body>` HTML (lines 28–307)

The HTML only lays out the controls. It contains no logic.

| Lines | Element | What it is on screen |
|---|---|---|
| 29 | `#view` | An empty div that fills the screen. JS puts the three.js `<canvas>` inside it |
| 32–38 | `#bar` | The top bar: ☰ (`#menu`, opens **Other options**), the **option list** (`#current`), **Cupboard options** (`#cupMenu`, opens its drawer), **Bedroom options** (`#bedMenu`, opens `#bedPanel`), Share and Reset |
| 41–65 | `#topRight` | Two pop-up menus at the top right: **Views** (`#viewsMenu`, purple) and **Look** (`#viewMenu`, blue) |
| 67–77 | `#corner` | The **Scenes** pop-up menu at the bottom right (`#sceneMenu`, green) |
| 79–82 | `#cutBox` | The **cutting list** (`#cutList`) and its Show/Hide button (`#cutToggle`), bottom left, in the 2D views only |
| 83 | `#scrim` | A grey see-through overlay. On phones it dims the model while a drawer is open |
| 84 | `#tip` | A tooltip that follows the pointer over things to store |
| **85–251** | `#panel` | **Other options**, a drawer that slides in from the left. It is made of `<details>` sections: |
| 90–135 | `#secFrontWall` | Island radios, front-piece radios, dresser and larder dropdowns plus sliders |
| 136–152 | `#secSofa` | Sofa dropdown plus sliders |
| 153–179 | `#secBench` | Bench switch, bench-height radios, "above the bench" radios, TV and shelf sliders |
| 180–192 | `#secDoors` | Three door-angle sliders |
| 193–227 | `#secColours` | Colour dropdowns with ◀ ▶ buttons and swatches, plus a nested `<details>` palette |
| 228–243 | `#secStored` | Things to store: packing dropdown, where-radios, buttons, heights off the floor |
| 244–250 | `#about` | The description text (`#summary`), which JS fills in |
| **252–307** | `#cupPanel` | **Cupboard options**, the other drawer: the cupboard-only switch, board thickness, the left-wall depth and front, and each option's own sliders in blocks shown only for it (`#wardBlock` for 9, `#cornerBlock` and `#sideShelfBlock` for 10 and 11, `#legBlock` for 7) |

### Scripts (index.html, lines 309–314)

| Lines | What |
|---|---|
| 309–313 | **Plain data scripts**: `living_room.views.js`, `dressers.js`, `larders.js`, `sofas.js`, `living_room.scenes.js`. Each one sets a global such as `window.ROOM_SOFAS = {…}` |
| 314 | `<script type="module" src="living_room.js">`: the room's module, which imports the floor plan from `floor.js`, the engine from `kit/floor_kit.js` and the view and scene kits from `kit/view_kit.js` and `kit/scene_kit.js` |

### floor.js (341 lines)

The floor plan: the room's size (`ROOM_WIDTH`, `ROOM_DEPTH`, `CEILING_HEIGHT`, `WALL_THICKNESS`), the floor, the walls with their recesses (kitchen, sink, desk: `KITCHEN_RECESS_BACK_WALL_X`, `SINK_RECESS`, `DESK_RECESS`, …), the doorway and its frame (`DOOR_FRAME_STARTS_AT`, `DOOR_HINGE_AT`, `FRAME_END`, …), the ceiling and downlights, and the outer wall with its windows and radiators (`OUTER`). It draws them into `floor`, a group `living_room.js` adds to the scene, and exports the measurements and the materials the colours menu changes (`wallMat`, `frameMat`, `floorMat`, `ceilingMat`). The living room's in its mm; then the bedroom's walls, door and window (`OTHER_ROOM`, in the `otherRoom` group at `OTHER_ROOM_CORNER`, in its own u, v mm), and the hallway's walls, floor, stairs and banister (`HALLWAY`, in the `hallway` group, in the living room's mm).

### other_room.js (the bedroom's furniture)

The bedroom's bed, bookcase, pine cupboard and recess cupboards, drawn
into `floor.js`'s `otherRoom` group in the room's own u, v mm. It exports
`OTHER_ROOM_START` (the settings as they start), `OTHER_ROOM_ADDRESS` (their
address fields), `drawOtherRoom(settings)` (called from `redrawAround()`)
(the bookcase hidden while it's in the living room) and `bookcase(sizes)`
(drawn in the living room by `bookcaseOnBenchWall()` when the back wall's
Bookshelf is on), and `otherRoomControls(container, change)`, which writes
the **Bedroom options** drawer's sliders into `#otherRoomBlock` from
`OTHER_ROOM_SLIDERS` and returns the function `syncControls()` calls to put
them in step. Unlike the other sections, its sliders aren't in the HTML.
The bedroom's walls, door and window are in `floor.js` (`OTHER_ROOM`).

### living_room.js (2,696 lines)

| Lines | Section | Notes |
|---|---|---|
| 1–20 | What the file is for | How a change flows through the page, and its sections in order |
| 22–29 | `import` three.js, the engine's pieces from `kit/floor_kit.js`, the view and scene kits as `ViewKit` and `SceneKit`, and the room's measurements from `floor.js` | |
| 31–62 | Set-up | `createStage()` for the scene, renderer, cameras and controls, the cupboards' materials, the handles' heights (`HANDLE_BOTTOM`, `HANDLE_TOP`), `DOOR_GAP`, and `board()` (a named board, for the cutting list) |
| 63–191 | The fixed room's fittings | `KITCHEN` (with its worktop's sizes), front-wall faces, desk, chair, island, room door. The walls, floor, recesses, door frame, ceiling and windows are in `floor.js` |
| 193–245 | **`state`, the settings** | One object holding every setting: `T`, `R`, `F`, `BOARD`, `BENCH`, `LEG`, …, `above`, `colours`, `sofa`, `stored`, … These are the values the controls change and the address saves |
| 247–335 | Corner-cupboard shelves | `cupShelf()` records them; `drawCupShelves()` draws them, cut back over things stored under them |
| 337–486 | Parts of options 7 to 9 | `tallDoor()`, `fullHeightL()` (option 7); `diagonal()`, `roomDoorGap()`, `diagonalCarcass()`, `diagonalShelves()`, `diagonalDoors()` (option 8); `wardCarcass()`, `wardDoors()` (option 9) |
| 488–573 | Bench, TV and shelves | `TV_SIZES`, `benchHeights()`, `benchWall()` |
| 575–645 | Colours | The room's `FINISHES`, `COLOUR_TARGETS`, `setRal()` (the RAL table and the oak floor are in the kit) |
| 647–929 | Option 9's base cupboards, dresser, larders, island, sofa, front wall | Includes `baseCupboards()` (655), `DRESSER_SLIDERS` (690), `placeIsland()` (848), `sofa()` (886), `frontWall()` (903) |
| 930–1049 | Option 9's shelving tower, options 10 and 11's corner cupboard, option 10's side bookshelf | `shelvingTower()`, `cornerCupboard()` with `cornerCarcass()`, `cornerDoorsToKitchen()` and `cornerDoorsToWindows()`, `sideBookshelf()` |
| 1051–1184 | **`OPTIONS`** | An array of cupboard designs, each with `name`, `summary` and `build(group)`; then `optionAt()` and the address codes |
| 1186–1368 | 2D dimensions | `updateDims()`, the kit's `cutViews()` giving `applyCut()`, the cupboard-only view, `cupboardDims()`, `doorDims()` (the kit draws the lines, labels and chains) |
| 1370–1435 | **The cutting list** | `CUT_RULE`, `cuttingList()` (read from the model's named boards), `showCuttingList()` |
| 1437–1858 | Things to store | Packing, `cupboardSpaces()` (each option's inside), `insideText()`, drawing, and dragging in plan view |
| **1860–1988** | **`update()` and `show(i)`** | **The heart of the UI-to-3D link** (section 5): `show()` calls `buildOption()`, `takeOutBench()`, `showInMenus()` and `redrawAround()` |
| 1990–2071 | **The address**: `ADDRESS`, `settingsAddress()`, `readAddress()`, `writeAddress()` | The room's list of fields; the kit's `writeFields()` and `readFields()` write `state` into the URL `#hash` and read it back (section 5) |
| **2073–2371** | **Control wiring** | `changeSettings()` (2078), then one event listener per slider, radio group and dropdown, each calling it (sections 4 and 5) |
| 2373–2482 | Built-in views and "anchors" (things the Look menu can aim at), and the Packing view | At 2442–2461 the 2D views' framing (`flatFit`, `flatPerM`), and the kit's `flatViews()`, which gives `setFlat()`, `resize()` and `startLoop()` |
| 2483–2535 | `ViewKit.create({...})` | Hands the Views and Look dropdowns to `kit/view_kit.js` |
| **2536–2549** | **Pop-up menus** (the kit's `popMenus()`) and `SceneKit.create` | |
| 2551–2560 | The Dimensions and Door sizes buttons | |
| **2562–2568** | **The two drawers** (`DRAWERS`, the kit's `createDrawers()`) | |
| 2570–2576 | Reset, Share and offline support (the kit's `resetButton()`, `shareButton()`, `workOffline()`) | |
| 2578–2613 | `syncControls()` | Puts every slider, radio, switch and dropdown in step with `state` |
| 2615–2624 | **Startup** | `readAddress()` from the URL hash into `state`, then `syncControls()`, then `show(state.option)`, then the view |
| 2625 | **Render loop** | The kit's `startLoop()`: `renderer.setAnimationLoop(...)` draws a frame about 60 times a second |

### kit/floor_kit.js (541 lines)

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

### kit/view_kit.js (532 lines) and kit/scene_kit.js (93 lines)

The Views and Look menus, and the Scenes menu: ES modules too, each
exporting `create()`, which the room imports as `ViewKit` and `SceneKit`.

### room_3d.css (125 lines)

| Lines | What |
|---|---|
| 1–5 | Base: what the file is for, colour scheme, page background and font, `#view` filling the window |
| 6–20 | The two drawers (`.drawer`, `#panel`, `#cupPanel`) and their open states |
| 21–49 | `#bar`, `#corner` and the pop-up menus (`.pop`, `.group`, `.popToggle`, each menu's `--tint`), and the floating text buttons (`.chip`) |
| 50–67 | The menus' groups, tags and dropdowns (`.group`, `.pick`), and the option list in the top bar |
| 68–70 | The scrim, and the phone-only rule for it |
| 72–100 | The drawers' sections, labels, sliders, buttons, radio rows and switch |
| 101–114 | Tooltip, things to store, description |
| 115–125 | The cutting list |

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
| HTML | `<div id="panel" class="drawer">` (**Other options**, opened by ☰ `#menu`) `<div id="cupPanel" class="drawer">` (**Cupboard options**, opened by `#cupMenu` in the top bar) and `<div id="bedPanel" class="drawer">` (**Bedroom options**, opened by `#bedMenu`), each with a ✕ (`.close`) |
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

- Views and Look (`#viewPick`, `#room`, `#where`, `#lookAt`, `#eye`, `#lookPick`) are filled by
  `kit/view_kit.js`, Where and Looking at again each time the room changes. The page passes the elements in to `ViewKit.create()`.
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
`<div id="legBlock">`. `showInMenus()`, called by `show(i)`, sets
`style.display = 'none'` or `''` on these blocks, so only the controls that apply to the current option are visible.
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
   The list comes from the data file (`dressers.js`). Adding a dresser
   there adds it to the dropdown.
3. **The kits** (`kit/view_kit.js` and `kit/scene_kit.js`) use the `createElement` style internally.

The dresser, larder and sofa dropdowns also have a disabled **"Custom"** option.
JS selects it when the sliders no longer match any preset (`showDresserPick()`).

---

## 5. How the controls send their values to three.js

### The pattern

Every settings control follows the same pattern, through one function,
`changeSettings(edit, { option, look })`:

```
user moves control
  → browser fires an event ('input' or 'change')
  → listener reads element.value (always a STRING, so Number(...) it)
  → calls changeSettings() with an edit that stores it in state
       (state.T, state.R, state.BENCH, state.sofa.size...)
  → changeSettings() runs the edit, then
       syncControls(): every control and readout <span> in step with state
       show(state.option): rebuilds the current option's 3D objects from state,
         which also updates the visible blocks, the description, the dimensions and the URL
       with look: viewKit.refresh(), so a view of the dresser, sofa… follows it
  → the render loop draws the new scene on the next frame
```

The listener only says what changes. Putting the controls in step, rebuilding
and saving the address all happen in one place, so a new control can't
forget one of them.

**Example: a slider**:

```js
const legSlider = document.getElementById('leg');
legSlider.addEventListener('input', () => changeSettings(s => { s.LEG = Number(legSlider.value); }));
```

`changeSettings()` passes `state` to the edit as `s`. `syncControls()` then
writes the new value into `#legValue`, the slider's readout.

**Example: a radio group**. The code listens on each radio in the group:

```js
document.querySelectorAll('input[name=bench]').forEach(r => r.addEventListener('change', () => changeSettings(s => { s.BENCH = Number(r.value); })));
```

**Example: a dropdown**, which also moves the view to follow (`look`):

```js
dresserPick.addEventListener('change', () => changeSettings(() => setDresser(DRESSERS[dresserPick.value]), { look: true }));
```

`setDresser()` holds the sizes to their sliders' ranges and places the
dresser; like `setSofaSize()` and `setLarderSize()`, it only changes `state`.

**Example: choosing an option** passes the option to show:

```js
currentSelect.addEventListener('change', () => chooseOption(Number(currentSelect.value)));
// chooseOption(i): changeSettings(s => { …a left-wall depth, if it needs one… }, { option: i })
```

**Example: a loop over several similar sliders**. This avoids
repeating the same line for each slider:

```js
for (const [id, key] of [['ward', 'WARD'], ['wardD', 'WARD_D'], ...]) {
  const slider = document.getElementById(id);
  slider.addEventListener('input', () => changeSettings(s => { s[key] = Number(slider.value); }));
}
```

The dresser, larder and sofa sliders do the same, driven by arrays such as
`DRESSER_SLIDERS`: `[key, sliderId, min, max, step]`.

Not every control changes a setting. The door sliders, the view switches
(Dimensions, Cupboard only, See-through) and the things to store don't go
through `changeSettings()`; see below.

### `input` vs `change`

- **`input`** fires continuously **while a slider is dragged**, so the 3D model
  updates as you drag. All the sliders use it.
- **`change`** fires once the choice is final. It's used for radios, dropdowns,
  checkboxes and the shelf text boxes.

### What `show(i)` does

It's the single place where settings become 3D objects, in named steps:

1. `buildOption()` removes the old option's `THREE.Group` from the scene,
   creates a new group and calls `OPTIONS[i].build(group)`. That function reads
   the sizes it needs from `state` (`const { T, R, LEG } = state;`) to size its
   boxes, itself in named steps (`diagonalCarcass()`, `wardDoors()`, …).
2. `takeOutBench()` removes the bench again when it's switched off.
3. Adds the bench wall, the front-wall piece and the sofa.
4. `showInMenus()` **updates the UI to match**: enables or disables dropdown
   options, writes the description, and shows or hides the slider blocks.
5. `redrawAround()` calls `updateDims()`, `updatePalette()`, the stored-things
   code and `writeAddress()` (saves the state into the URL), then `update()`.

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
buttons. A choice goes through `changeSettings(() => setRal(target, code))`.
`setRal()` sets `.color` on the three.js **materials** shared by those
objects, and anything that follows that colour.

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
  to `state`, with a comment. Add an `input` listener that calls
  `changeSettings(s => { s.X = Number(slider.value); })`, and set the slider
  and its span in `syncControls()`. Use `X` in a `build()`
  (`const { X } = state;`). To keep it in links, add a field to the end of
  `ADDRESS`.
- **To change how something looks**: find its id or class in the HTML, then search
  `room_3d.css` for that `#id` or `.class`.
- **To find what happens when a control is used**: search for its id in quotes,
  e.g. `'sofaW'`, or for `name=bench` for a radio group.
- **To hide a control for some options**: add a condition in `showInMenus()`,
  where it sets the blocks' `style.display`.
- **To add a board to a cupboard**: draw it with `board(name, x0, y0, z0, x1, y1, z1, g)`
  in the option's `build()`. Its name is what the cutting list shows; boards
  `BOARD` thick are listed, anything else is left out.
