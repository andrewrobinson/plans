# index.html — how the page is put together

A guide to the HTML, CSS and JS in `index.html` (321 lines), the page's
`living_room.js` (1,159 lines), the model's `flat_model.js` (1,568 lines)
and its corner cupboard's `corner_cupboard.js` (805 lines),
`floor.js` (341 lines),
`kit/floor_kit.js` (541 lines) and `room_3d.css` (125 lines), focused on the UI: the menus, the controls, and how
they drive three.js. The room modelling is only sketched. Line numbers in the
map below are as of 15 Oct 2026 (`corner_cupboard.js`'s as of 17 Oct 2026,
step 6d; `flat_model.js`'s and `living_room.js`'s as of 17 Oct 2026, after
`set(path, value)`), after step 5 of `REFACTOR_PLAN.md` (longer names,
named steps, and one function, `change()`, for every settings control).
They go stale with
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

### The `<body>` HTML (lines 28–466)

The HTML only lays out the controls. It contains no logic. The settings are
in five drawers (18 Oct 2026): one for each room, the hallway and stairs
too, opened by the options button at the bottom left for the room in view,
and Other options, by ☰. Each is made of `<details>` sections that remember
being open. On a phone held upright (up to 600 wide) a drawer is a sheet
from the bottom, the room live above it; wider, it's on the left, the room
live beside it.

| Lines | Element | What it is on screen |
|---|---|---|
| 29 | `#view` | An empty div that fills the screen. JS puts the three.js `<canvas>` inside it |
| 35–41 | `#bar` | The top bar: ☰ (`#menu`, opens **Other options**), `#roomViews` (living_room.js puts a split button there for each room: **Lounge view**, **Bedroom view**, **Garage view**, **Hallway view**, each going to its room, with a ▾ dropdown of Bird's eye or Plan), Share, Screenshot and Reload (the page afresh, nothing in the address). On a phone, while a sheet's open, only ☰ shows |
| 44–69 | `#topRight` | Two pop-up menus at the top right: **Views** (`#viewsMenu`, purple) and **Look** (`#viewMenu`, blue) |
| 71–81 | `#corner` | The **Configuration** pop-up menu at the bottom right (`#configurationMenu`, green) |
| 83–85 | `#bottomLeft` | The options button (`#roomOptions`), named for the room in view: Lounge, Bedroom or Garage options, or Hallway and stairs. It moves clear of an open drawer, onto a sheet's top edge on a phone |
| 86 | `#tip` | A tooltip that follows the pointer over things to store |
| **87–104** | `#panel` | **Other options**: `#secWickerBench` (the wicker bench, in any room) and `#palette`, the colours in this view |
| **106–127** | `#hallPanel` | **Hallway and stairs options**: `#secShoeRack` (shoe_rack.js fills it) and `#secDownstairsDoors` (the flat's door and the lobby's) |
| **129–428** | `#loungePanel` | **Lounge options**, the living room: |
| 134–196 | `#secCupboard` | The corner cupboard: its **option list** (`#current`), Cupboard only, its cutting list (`#loungeCutting`, folded away), and `#cupboardControls`: board thickness, the left-wall depth and front, and each option's own sliders in blocks shown only for it (`#wardBlock` for 9, `#cornerBlock` and `#sideShelfBlock` for 10 and 11, `#legBlock` for 7). The bedroom's cupboard copies these |
| 197–247 | `#secFrontWall` | Island radios, front-piece radios, dresser and larder dropdowns plus sliders |
| 248–279 | `#secSofa` | Sofa dropdown (with As a bed for a daybed) plus sliders |
| 280–347 | `#secBench` | Bench switch, the bookshelf, pine cupboard, Billy (with its Lying switch) and BillyChest in its place, bench-height radios, "above the bench" radios, TV and shelf sliders |
| 348–361 | `#secIvar` | The Ivar: In the lounge and Lying switches, its X, Y and Turn sliders and Reset location (`placeControls()`, as the back wall's pieces), starting by the first radiator (`ivarHome()`) |
| 361–388 | `#secCornwall`, `#secChesham` | The kitchen tables (`tables.js`): each its In the lounge switch, its pose (Cornwall's Legs off, Chesham's On its end), X, Y and Turn sliders and Reset location (`placeControls()`), starting where they are now (`LOUNGE_NOW`) |
| 362–374 | `#secDoors` | The cupboard's tall and second doors (`#tallBlock`, `#secondBlock`) and the room door |
| 375–405 | `#secColours` | The cupboard, dresser and shelf colours: dropdowns with ◀ ▶ buttons and swatches (`.colours`) |
| 406–421 | `#secStored` | Things to store: packing dropdown, where-radios, buttons, heights off the floor |
| 422–428 | `#about` | The description text (`#summary`), which JS fills in |
| **430–491** | `#bedPanel` | **Bedroom options**: the New cupboard switch (`#otherRoomTop`, other_room.js's), then `#secBedroomCupboard`, the new cupboard's own option list (`#bedroomCupboardCurrent`), its copied sliders and door sliders (`#bedroomCupboardControls`, `#bedroomCupboardDoors`, filled by living_room.js), its colour and its cutting list (`#bedroomCutting`); the rest of the furniture (`#otherRoomBlock`, other_room.js's); `#secBedroomDoors` (the bedroom door) and `#secBedroomColours` (the carpet, the stairs' too) |
| 493–500 | `#garagePanel` | **Garage options** (`#garageBlock`, garage.js's): the garage door (not shown, open or closed), then each thing in it (Billy with its Lying switch) |

### Scripts (index.html, lines 502–504)

| Lines | What |
|---|---|
| | **Plain data scripts**: `living_room.views.js` and `living_room.configurations.js`, each setting a global (`window.ROOM_VIEWS`, `window.ROOM_CONFIGURATIONS`). The dressers, larders and sofas are ES modules (`DRESSER_MODELS`, …) the model imports |
| 314 | `<script type="module" src="living_room.js">`: the room's module, which imports the floor plan from `floor.js`, the engine from `kit/floor_kit.js` and the view and configuration kits from `kit/view_kit.js` and `kit/configuration_kit.js` |

### floor.js (341 lines)

The floor plan: the room's size (`ROOM_WIDTH`, `ROOM_DEPTH`, `CEILING_HEIGHT`, `WALL_THICKNESS`), the floor, the walls with their recesses (kitchen, sink, desk: `KITCHEN_RECESS_BACK_WALL_X`, `SINK_RECESS`, `DESK_RECESS`, …), the doorway and its frame (`DOOR_FRAME_STARTS_AT`, `DOOR_HINGE_AT`, `FRAME_END`, …), the ceiling and downlights, and the outer wall with its windows and radiators (`OUTER`). It draws them into `floor`, a group `living_room.js` adds to the scene, and exports the measurements and the materials the colours menu changes (`wallMat`, `frameMat`, `floorMat`, `ceilingMat`). The living room's in its mm; then the bedroom's walls, door and window (`OTHER_ROOM`, in the `otherRoom` group at `OTHER_ROOM_CORNER`, in its own u, v mm), and the hallway's walls, floor, stairs and banister (`HALLWAY`, in the `hallway` group, in the living room's mm).

### other_room.js (the bedroom's furniture)

The bedroom's bed, bookcase, pine cupboard, Billy (on any of `WALLS`, as the mirror) and recess cupboards, drawn
into `floor.js`'s `otherRoom` group in the room's own u, v mm. It exports
`OTHER_ROOM_START` (the settings as they start), `OTHER_ROOM_SCHEMA` (their
entries in the configuration), `drawOtherRoom(settings)` (called from `redrawAround()`)
(`bookcase(sizes)` is `bookcase.js`'s, drawn in the living room by
`pieceOnBenchWall()` when the back wall's Bookshelf is on, and as the
garage's Billy and Potters; `billy.js`'s `billy(lying)` draws Billy,
standing or lying, in all three rooms, and `billyChest()` BillyChest; `ivar.js`'s `ivar(lying)` the Ivar; `tables.js`'s `kitchenTable(table, pose)` the kitchen tables, drawn by `flat_model.js`'s `tablesInLivingRoom()`), and `otherRoomControls(topContainer, container, change)`, which writes
the **Bedroom options** drawer's sliders into `#otherRoomBlock` (the New
cupboard switch, marked `top`, into `#otherRoomTop`, over the new cupboard's section) from
`PIECES` (each piece's size and place sliders, its reset buttons, and the
mirror's and Billy's choice of wall, `WALLS`, `ON_A_WALL`) and returns the function `syncControls()` calls to put
them in step. Unlike the other sections, its sliders aren't in the HTML.
The **New cupboard** switch puts a corner cupboard of its own in the
bedroom (`NEW_CUPBOARD`, its corner): `flat_model.js`'s
`buildBedroomCupboard()` makes it with `makeCupboard()`, against the
bedroom (`BEDROOM_PLACE`) in its own materials, from the living room's
settings and colours for now, and hands its group to `showNewCupboard()`.
The bedroom's walls, door and window are in `floor.js` (`OTHER_ROOM`).

### flat_model.js (1,645 lines): the model

Everything drawn, from the settings, with no DOM, so Node builds it too
(`tests/model/`, step 6c of `REFACTOR_PLAN.md`). It draws into `world`, a
group the page adds to its scene. The corner cupboard itself is
`corner_cupboard.js`'s (below): the living room keeps its instance in
`cupboard`, and everything round it in `livingGroup`.

| Lines | Section | Notes |
|---|---|---|
| 1–39 | What the file is for, `import`s | three.js, the kit's drawing helpers, the configuration kit, `corner_cupboard.js`, the data modules (`dressers.js`, `larders.js`, `sofas.js`), the other rooms' modules and `floor.js` |
| 40–59 | **`world`** and **`setDisplay()`** | What the page shows that the drawing follows: 2D or not, which view and room, Cupboard only, the Dimensions and Door sizes buttons (the hallway's hidden in the wall views) |
| 61–196 | Materials and the fixed room's fittings | The cupboard's materials (from `CUPBOARD_MATERIALS`), the bench's; `KITCHEN`, the front wall's faces, desk, chair, island, room door |
| 202–276 | **`state`, the settings** | One object holding every setting: the corner cupboard's in `cornerCupboard` (`option`, `T`, `R`, `F`, `BOARD`, `LEG`, …), then `BENCH`, `above`, `colours`, `sofa`, `stored`, `doors` … The drawing code reads it; the menus change it only through `set()` |
| 277–315 | The corner cupboards, as the rooms have them | `cupboardSettings(piece)` (a copy of `state[piece]`, as `state.cornerCupboard`), `LIVING_ROOM_PLACE`, `BEDROOM_PLACE` and `BEDROOM_MATERIALS`, `storedThings()` (for the living room's shelves to be cut round) |
| 316–809 | Bench, TV and shelves; colours; the base cupboards, dresser, larders, island, sofa, front wall | `benchWall()`, `setRal()`, `baseCupboards()`, `placeDresser()`, `placeIsland()`, `sofa()`, `frontWall()` |
| 810–948 | 2D dimensions | `updateDims()` (following `setDisplay()`), the other rooms' plans, `cupboardPart()`, `doorDims()`, `cuttingList()` (the instance's, for the page) |
| 949–1185 | Things to store | `STORED`, `PACKINGS`, `placeStored()`, `drawStored()` (which gives the menu's text) |
| 1186–1317 | The cupboards, the back wall's pieces, the option and its bench | `cupboard`, `livingGroup`, `bedroomCupboard`, `buildBedroomCupboard()`, `BACK_WALL_PIECES`, `withoutBench()`, `buildOption()` (`makeCupboard()`), `drawBench()` |
| 1318–1443 | **The configuration** | `SLIDER_RANGES`, `cupboardEntries(design, setting)` (a corner cupboard's entries), `SCHEMA` (with the other rooms' entries from their modules), `configurationNow()`, `readConfiguration()` |
| 1444–1481 | **Changing the settings, by path** | **`set(path, value)`**, `setAll(edits)`, `get(path)`, `wordAt()` (the configuration's word for a page's value), `pathOfSetting()` (a path from a place in `state`) |
| 1482–1515 | What's shown, for the snapshot | `dimensionFigures()`, each piece's box (`pieceBoxes()`) |
| 1516–1617 | **Building** | `settle()` (what's worked out first), **`build(i, onShow)`**, `turnDoors()` (the cupboard's through its `turnDoors()`), `describe()`, **`buildFlat(configuration, view)`**, `cupboardRows()` |
| 1618–1645 | `startAgain()` and what the page reads | The settings as the page starts, put back before a configuration's read |

### corner_cupboard.js (805 lines): the corner cupboard

Its options and everything about it, reading neither `state` nor a room's
constants: `makeCupboard()` is given the cupboard's **settings** (its piece
of the configuration), its **place** (the room's width, depth, ceiling and
door) and its **materials**, and gives an instance (step 6d of
`REFACTOR_PLAN.md`).

| Lines | Section | Notes |
|---|---|---|
| 1–81 | What it's given, materials, sizes | `CUPBOARD_MATERIALS`, `CUPBOARD_SETTINGS`, `DOOR_GAP`, `HANDLE_BOTTOM`, `DIAGONAL_RUN`, `board()` and `ofKind()` (a named board marked with its kind, for the cutting list) |
| 82–173 | Shelves | `cupShelf()` records them as the boards go up; `drawShelves()` draws them, cut back over things stored under them; `shelfCutText()` |
| 174–446 | The options' parts | `fullHeightL()`, `diagonal()`, `diagonalCarcass()`, `wardCarcass()`, `wardDoors()`, `shelvingTower()`, `cornerCupboard()`, `sideBookshelf()`, `cornerTooShallow()` |
| 447–609 | **`OPTIONS`** and **`makeCupboard()`** | Each option's `name`, `clearFrom(s)`, `benchFrom(s)`, `summary(s, place, around)` and `build(job, group)`; `optionAt()`; `makeCupboard(settings, place, materials)` gives `{ group, doors, shelves, drawShelves(), shelfCutText(), turnDoors(), cuttingList(), cuttingRows(), partOf(), dims(), doorDims() }` |
| 610–676 | The inside and the doors | `insideSpaces()` (for the things to store), `opensTo()` (a door stopping at its room's walls) |
| 677–757 | Dimensions | `partOfCupboard()`, `cupboardDims()`, `doorDims()` |
| 758–805 | **The cutting list** | `CUT_RULE`, `cuttingList()` (each board by its `userData.kind`), `cuttingRows()` |

### cupboard_controls.js (103 lines): a corner cupboard's controls

`cupboardControls({ piece, id, change, options, front })` wires one
cupboard's option list, sizes, side bookshelf, shelves and front to its
design's path (`pieces.<piece>.design`), and gives `choose(i)`, `sync()`
and `showBlocks()` (only the blocks its option has, its door sliders' too).
The lounge's are index.html's own; the bedroom's are a copy of them,
`copyControls(elements, piece)`, each id with the piece's name before it
(`idIn(piece)`: `depth` becomes `bedroomCupboardDepth`).

### living_room.js (1,209 lines): the page

| Lines | Section | Notes |
|---|---|---|
| 1–21 | What the file is for | How a change flows through the page, and its sections in order |
| 22–46 | `import`s | The kits, the other rooms' controls, the cupboard controls, the model's pieces from `flat_model.js`, `floor.js` |
| 47–86 | The stage, the 2D views' cuts and Cupboard only's framing | `createStage()`, `scene.add(world)`, the kit's `cutViews()` giving `applyCut()`, `frameCupboard()` |
| 87–275 | The cutting lists, the things to store's controls and dragging in plan | `cuttingListHtml(piece)` and `showCuttingLists()` (the lounge's in Lounge options, the bedroom's in Bedroom options), `showStored()` (the model's `drawStored()`, then the menu); `setStored()` and `moveStored()`, their settings by path |
| 276–385 | **The bedroom cupboard's copied controls, door sliders, `show(i)`** | `copyControls()` into Bedroom options; `update()` (the model's `turnDoors()`, then the sliders), `turnDoorsTo()`; **`show(i, onShow)`**: the model's `build()`, then `showInMenus()` and `redrawAround()` |
| 386–403 | **The address**: `writeAddress()` | The configuration and the view, packed into the URL `#hash` (section 5) |
| **404–791** | **Control wiring** | **`change(edits, { look })`** (404), the two cupboards' controls (`loungeCupboard`, `bedroomCupboardControls`, `showBedroomCupboard()`), then one event listener per slider, radio group and dropdown, each calling it (sections 4 and 5); the colour pickers (`colourPicker()`, the bedroom cupboard's too); `sizeEdits()` |
| 787–922 | Built-in views and "anchors" (things the Look menu can aim at), and the Packing view | The 2D views' framing (`flatFit`, `flatPerM`), and the kit's `flatViews()` |
| 923–1007 | `ViewKit.create({...})`, the pop-up menus and `SceneKit.create` | Hands the Views and Look dropdowns to `kit/view_kit.js`; `hooks.place()` tells the model what's shown (`setDisplay()`) |
| 1008–1100 | The view as JSON; **the rooms' buttons and the drawers**; Reload, Share and offline support | `viewNow()`, `readDisplay()`; `ROOM_BUTTONS` (each room's name, drawer and options), the split buttons (`goToRoom()`, each room's Bird's eye or Plan kept on this device), `DRAWERS` (Other, Lounge, Bedroom, Garage, Hallway and stairs), the options button (`showRoomOptions()`, from `hooks.place()`) |
| 1101–1152 | The rooms' modules' controls and `syncControls()` | `roomEdits()` (their settings' places in `state` as the configuration's paths); the model's `settle()`, then every slider, radio, switch and dropdown in step with the settings |
| 1153–1193 | **`window.plans`** (steps 6a to 6c) | `get()`, `export()`, `load()`, `view()`, `schema()` and `snapshot()`, for the tests and the browser console (section 5) |
| 1194–1209 | **Startup** and the render loop | The URL hash unpacked (awaited) and read into `state`, then `syncControls()`, `show()`, the view; the kit's `startLoop()` |

### kit/floor_kit.js (541 lines)

The engine, an ES module: what any room needs, and nothing about this one.

| What | Exports |
|---|---|
| The stage | `MM`, `createStage(container)`: the scene, renderer, 3D and 2D cameras with their controls, the lights |
| Drawing in mm | `material()`, `box()`, `slab()`, `part()`, `hinge()`, `skewHinge()` |
| Colours | `RAL` (the RAL Classic table), `oakBoards()` (the oak floor's texture) |
| Settings by path | `valueAt()`, `setValueAt()` (from `kit/config_kit.js`) |
| Menus and buttons | `narrow()`, `popMenus()`, `createDrawers()`, `resetButton()`, `shareButton()`, `workOffline()` |
| The 2D/3D switch | `flatViews(stage, view)`: `setFlat()`, `resize()` (fitting the 3D and 2D views to the screen) and `startLoop()` (the render loop), reading the room's framing (`flat`, `flatFit`, `flatPerM`), the view kit's `hfov` and the drawers through `view` |
| 2D dimensions | `dimLine()`, `dimLabel()`, `chain()` (a chain of dimensions), `cutViews(scene, view)`: `applyCut()`, reading the view's cut and what alone to show through `view` |

### kit/view_kit.js (532 lines) and kit/configuration_kit.js (107 lines)

The Views and Look menus, and the Configuration menu: ES modules too, each
exporting `create()`, which the room imports as `ViewKit` and `ConfigurationKit`.
The view kit's `view()` gives the view as JSON for the address, and
`start()` reads one; the Configuration list's entries are configurations.

### kit/config_kit.js (156 lines)

The configuration: a schema's entries (`number()`, `onOff()`, `choice()`,
`colour()`, `other()`), `writeConfiguration()` and `readConfiguration()`
through them, one entry at a time for `set()` (`readEntry()`,
`configurationValue()`, `wordFor()`, found by `entryAt()` or
`entryOfSetting()`), `withDefaults()` and `defaultConfiguration()`, and `pack()` and
`unpack()` for the address (JSON deflated, in base64url). It needs no page,
DOM or three.js, so Node can use it too (step 6c).

### room_3d.css (125 lines)

| Lines | What |
|---|---|
| 1–5 | Base: what the file is for, colour scheme, page background and font, `#view` filling the window |
| 6–20 | The five drawers (`.drawer`: `#panel`, `#hallPanel`, `#loungePanel`, `#bedPanel`, `#garagePanel`) and their open states; further down, the sheet on phones and the split buttons (`.split`) |
| 21–49 | `#bar`, `#corner` and the pop-up menus (`.pop`, `.group`, `.popToggle`, each menu's `--tint`), and the floating text buttons (`.chip`) |
| 50–67 | The menus' groups, tags and dropdowns (`.group`, `.pick`), and the option list in the top bar |
| 68–70 | The options button moving clear of an open drawer |
| 72–100 | The drawers' sections, labels, sliders, buttons, radio rows and switch |
| 101–114 | Tooltip, things to store, description |
| 115–125 | The cutting lists (`.cutList`), in the lounge's and bedroom's options |

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

The floating text buttons (Lounge options, Share, Reload, Dimensions, Show
the room buttons, and the menus' Save and Delete) all have `class="chip"` in the
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
| JS | `DRAWERS` maps each drawer to its button (null for the rooms', which `#roomOptions` opens by `setMenu()`) and its class on `<body>`. `setMenu(id)` opens drawer `id` and closes the others (`setMenu(null)` closes them all), so one is open at a time. ✕ and Escape close it. `ROOM_BUTTONS` in living_room.js names each room's button, drawer and options |

The JS doesn't move the drawers. It only switches a class on `<body>`, and the
CSS does the movement and the animation.

### b) The three pop-up menus (Views, Look, Scenes)

| Part | Where |
|---|---|
| HTML | `<div class="pop">` holding a `<button class="popToggle">` and a `<div class="group">` |
| CSS | `.pop > .group { display: none }` hides the group. `.pop.open > .group { display: flex }` shows it |
| JS | `setPop(open)` adds `open` to the menu clicked and removes it from the others, and sets `aria-expanded` for screen readers. Escape, or a click outside the menus that isn't on the 3D view, closes them |

Configuration opens upwards for a reason. In `#configurationMenu` the group comes **before** the
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
       entry and put it in state (one it refuses is a console error), then
       syncControls(): every control and readout <span> in step with the settings
       show(): rebuilds the current option's 3D objects from state,
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
controls (`otherRoomControls()` and the rest) name their settings by their
place in `state`; `roomEdits()` turns those into the configuration's paths.

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
`state`.

### The faster path for doors

The door sliders don't rebuild. Each sets its angle through
`turnDoorsTo({ name: degrees })`, which `set()`s `doors.<name>` (they're
in the configuration, so a saved configuration keeps them) and calls `update()`, which
only rotates the existing hinge objects and puts the sliders in step.
Packing and walking in turn them the same way:

```js
roomHinge.rotation.y = turn(doors.room);
```

### Colours

`colourPicker()` builds each colour dropdown and its ◀ ▶
buttons. A choice goes through `change([[`colours.${target}`, code]])`;
`settle()` then has `setRal()` set `.color` on the three.js **materials**
shared by those objects, and anything that follows that colour.

### Views and Look

The Views and Look dropdowns don't change the model. They move the **camera**.
`kit/view_kit.js` handles the dropdowns and calls back into the page through the
`hooks.place()` function, which sets `camera.position` and
`controls.target`.

### The URL holds the configuration and the view

The address is `#<configuration>~<view>`: the settings as a
**configuration**, JSON by piece, and the **view**, each deflated and in
base64url (`pack()` and `unpack()` in `kit/config_kit.js`;
`room_dimensions.md` has the format). `SCHEMA` (near the end of
`living_room.js`) has an entry for each setting: its path in the
configuration, its place in `state`, its kind and range and its default,
e.g. `fromSlider(at('R'), of('R'), 'rear')` in `cupboardEntries()`, the
back-wall depth held to the `#rear` slider's range. The other rooms' modules give their own
entries (`OTHER_ROOM_SCHEMA`, `WICKER_BENCH_SCHEMA`, `SHOE_RACK_SCHEMA`,
`GARAGE_SCHEMA`). For now the configuration is a two-way map onto `state`,
which the drawing code still reads: `configurationNow()` writes it,
`readConfiguration()` reads one into `state`, and the menus' `set()`
changes one setting by its path, through its entry. The view is the view kit's
`view()` (the room, a listed view's id or the camera, the eye height) and
the Dimensions, Door sizes, Cupboard only and See-through switches
(`viewNow()`, `readDisplay()`).

`writeAddress()` packs both, which is asynchronous, so each write is
numbered and only the latest lands. At startup the page unpacks the
address before it builds anything (a top-level `await`), reads the
configuration into `state`, then `syncControls()` sets every slider and
radio from `state`, e.g. the radio found with
`document.querySelector('input[name=front][value="1329"]')`, `show()`
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
- `plans.schema()`: the configuration's entries, bar their functions.
- `plans.get()`: the settings, `state` as JSON, with the doors' angles as
  `doors` (`room`, `tall`, `second`, `bedroom`, `flat`, `outside`, in
  degrees). The tests read settings through it (`setting(page, 'garage.sean')`
  in `tests/helpers.js`), not from the address, so a new address format
  leaves them alone.
- `plans.snapshot()`: what the page makes of them: `configuration` (as
  `export()`), `cupboards` (the living room's corner cupboard's cutting list as rows,
  `{ kind, length, width, shaped, count, parts }`, and the bedroom's own cupboard's,
  or `null` when there isn't one), `dimensions` (the figures on show, in a
  2D view or with Cupboard only), `description` (the text under the
  option) and `boxes` (where each piece is drawn, to the mm, and whether
  it's on show). Each saved address and named configuration has its snapshot in
  `tests/snapshots/<name>.json`, compared exactly beside its screenshot, so a
  board 2 mm out or one fewer fails even when the picture passes.
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
  to `state` (a cupboard's to `state.cornerCupboard`), with a comment. Give
  it an entry in `SCHEMA` (or its module's list), under its piece's
  `design` or `in`, as `fromSlider(at('X'), of('X'), 'x')` in
  `cupboardEntries()`: `set()` needs it. Add an `input` listener that calls
  `change([[path, Number(slider.value)]])` (a cupboard's: add it to
  `cupboard_controls.js`'s `CUPBOARD_SLIDERS`, and give the bedroom's an
  entry too, as `cupboardEntries()` makes both), and set the slider and its span in `syncControls()`.
  Use `X` in a `build()` (`const { X } = state.cornerCupboard;`). Its value is then in
  `plans.get()`, `plans.export()` and the snapshots, so run
  `npm run test:update` once and check the snapshots' diff adds only it;
  the saved configurations in `tests/configs/` go without it, so they show
  its default.
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
