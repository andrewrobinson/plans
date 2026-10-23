# Code map

One line per file: what it holds and the names to search for. Read this
first, then open only the file you need. Sizes are rough line counts
(22 Oct 2026).

## The page

| File | Lines | What, and its main names |
|---|---|---|
| `index.html` | 680 | The page's HTML: the top bar (`#bar`), Look and Configs (`#topRight`), the drawers (`#panel`, `#loungePanel`, `#hallPanel`, `#bedPanel`, `#garagePanel`) and their sliders |
| `room_3d.css` | 216 | The page's styles; each menu's colour is its `--tint` |
| `living_room.js` | 220 | Imports the page's pieces in the order they set it up, and passes names between them; `window.plans` (for the tests and console) and starting the page |
| `page/stage.js` | 3 | The renderer, cameras and controls (`createStage()`), with the model in the scene |
| `page/display.js` | 15 | What the page shows (`display`, given to each build) and `setDisplay` |
| `page/stored_controls.js` | 160 | The things to store's menu, lifting and dragging them, the cutting lists: `showStored`, `moveStored`, `restow` |
| `page/controls.js` | 185 | `change(edits)`, which every control goes through; `show()`, `showInMenus()`, `redrawAround()`; the doors' sliders; the address (`writeAddress`) |
| `page/colours.js` | 125 | The colour pickers and palette: `colourPicker`, `updatePalette` |
| `page/piece_controls.js` | 290 | The lounge's pieces' controls: dresser, sofa, larder, back wall, Ivar, tables, castor desk, speakers, island, See-through (`placeControls`, `setCupboardOnly`) |
| `page/views.js` | 125 | The built-in views (`builtInViews`): each room's plan and 2D walls (`wallView`), Packing (`packingView`) |
| `page/tips.js` | 105 | The tip under the pointer (`showTip`), and where things are for the views to aim at (`anchors`, `pointOn`) |
| `page/view.js` | 140 | The 2D views' fit (`frameCupboard`), `viewKit`, the Configuration list, loading cover, Dimensions buttons |
| `page/room_buttons.js` | 240 | The room buttons and drawers (`goToRoom`, `showRoomOptions`), and `syncControls()`, which puts every control in step |
| `cupboard_controls.js` | 130 | A corner cupboard's controls, copied for the bedroom's (`copyControls`) |
| `living_room.views.js` | 240 | Data: rooms, places (Where), things (Looking at), eye heights, config-defined views |
| `living_room.configurations.js` | 8,500 | Data: the named configurations in Configs ▾. Large: search it, don't read it |
| `sw.js` | 110 | The service worker: the files cached for offline use, and `CACHE`, set on each commit from a hash of those files (`githooks/cache_version.mjs`; `npm install` turns the hook on) |

## The model (no page: Node builds it too)

| File | Lines | What, and its main names |
|---|---|---|
| `flat_model.js` | 340 | Builds the flat from its pieces: `build`, `rebuild`, `settle`, `turnDoors`, `describe`, `buildFlat`, `startAgain`; what the page and tests import |
| `model/state.js` | 270 | Shared state: `world`, `config` (every setting), what's shown as the page opens (`DISPLAY_START`, given to each build), `showHallway`, `drawn`, `ROOM_BOXES`, `inLivingRoom` |
| `model/materials.js` | 15 | The materials things are drawn in |
| `model/slider_ranges.js` | 15 | `SLIDER_RANGES`: the sliders' ranges the settings are held to |
| `model/settings.js` | 250 | The schema (`SCHEMA`), reading and writing a configuration, `set`, `get`, `setAll`, `DEFAULT_CONFIGURATION` |
| `model/kitchen.js` | 200 | `KITCHEN`, which island and where it stands (`ISLAND_TYPES`, `islandSize`, `placeIsland`), the desk and monitors in the desk recess and the shelves over them (`deskShelves`), the office chair, the room door |
| `model/cupboards.js` | 175 | The two corner cupboards: `buildOption`, `buildBedroomCupboard`, `cupboardLimits`, the bedroom door they clear, `drawBench` |
| `model/bench_wall.js` | 230 | The back wall: `benchWall`, the TV and shelves (`benchHeights`, `drawTv`), base cupboards, Billy, the pine cupboard, the daybed (`BACK_WALL_PIECES`) |
| `model/colours.js` | 75 | `FINISHES`, `COLOUR_TARGETS`, `applyColour` |
| `model/front_wall.js` | 285 | The dresser, larder, sofa, front wall and bookcase: `DRESSERS`, `LARDERS`, `SOFAS`, `frontWall` |
| `model/loose_pieces.js` | 310 | The daybed desk's chair and what's in its way, the first radiator, Ivar, the tables, the castor desk, the speakers |
| `model/stored.js` | 275 | The things to store: `STORED`, `PACKINGS`, `placeStored`, `drawStored` |
| `model/dimensions.js` | 155 | The 2D views' dimensions (`updateDims`), door sizes, `cuttingList` |
| `corner_cupboard.js` | 1,030 | The corner cupboard: each option's build (`OPTIONS`), shelves, inside spaces, dimensions, cutting list; `makeCupboard` |
| `floor.js` | 915 | The walls, doors, windows and radiators of every room: `drawFloor`, `HALLWAY`, `ENTRANCE`, `OTHER_ROOM` |
| `other_room.js` | 565 | The bedroom's furniture and fitted cupboards, and their sliders |
| `garage.js` | 460 | The garage, what's in it, and Garage options' sliders |
| `stair_walls.js`, `shoe_boxes.js` | 415, 235 | The shelves and pictures over the stairs; the shoe boxes on the sills |
| `wicker_bench.js`, `shoe_rack.js` | 275, 315 | The hallway's wicker bench; the shoe rack downstairs |
| `bedroom_door.js` | 50 | The bedroom door, both ways it can swing, as `kit/door_kit.js`'s doors (`DOOR_SWINGS`), and how far it sweeps into the room (`sweepInto`, `opensTo`) |
| `tornviken.js`, `rosentorp.js`, `loshult.js`, `ekby_alex.js` | 170, 45, 35, 35 | The kitchen island (IKEA's TORNVIKEN): its layouts, IKEA's, facing, trolleys and drawers (`ISLAND_LAYOUTS`), and where its chairs go (`placeTornviken`); its bar stools (ROSENTORP), trolleys (LOSHULT) and drawers (EKBY ALEX). Photos in `images/tornvikken_options/` |
| `custom_island.js` | 105 | The custom built-in island from Howdens' plan, in place of TORNVIKEN: drawers both sides, the worktop running on past them for two ROSENTORP stools, its length, width and overhang from sliders (`CUSTOM_ISLAND`, `customIsland`, `placeCustomIsland`). The plan and renders in `images/custom_island/` |
| Furniture: `billy.js`, `bookcase.js`, `castor_desk.js`, `daybed.js`, `desk_daybed.js`, `ivar.js`, `knarrevik.js`, `kvistbro.js`, `laundry_basket.js`, `speakers.js`, `tables.js`, `work_chairs.js` | 25 to 115 | One piece each, drawn wherever it stands |
| Catalogues: `dressers.js`, `larders.js`, `sofas.js` | 30 to 50 | Models and sizes, for editing |

## The engine (`kit/`)

| File | Lines | What |
|---|---|---|
| `kit/floor_kit.js` | 685 | The stage (renderer, cameras, lights), drawing helpers in mm (`box`, `slab`, `hinge`), the 2D views, menus and drawers |
| `kit/view_kit.js` | 620 | Views, rooms, Where and Looking at, eye heights, walking with the keys (`cameraControls`) |
| `kit/config_kit.js` | 170 | A configuration through a schema; packing it for the address |
| `kit/configuration_kit.js` | 105 | The Configuration list |
| `kit/controls_kit.js` | 80 | Sliders, switches and the number boxes beside them: `slider`, `numberBoxes`, `resetButtons` |
| `kit/tabs_kit.js` | 90 | The long drawers' tabs |
| `kit/shape_kit.js` | 45 | Shapes meeting, for any room, touching not counting: ranges and boxes (`rangesMeet`, `boxesMeet`, a Box3's `rangesOf`), convex outlines (`overlap`) and `clip`. Used by the stair walls, the shelves cut round stored things, the tables stacking, the radiator check and the doors |
| `kit/door_kit.js` | 150 | A hinged door in plan, for any room (`planDoor`): its outline at an angle, what it sweeps, how far it opens before something (in whole degrees, `OPEN_STEP`), its gap to a shape in line with it, and its swing marked on the floor (`swingMark`). The bedroom door, the shoe rack's internal door and option 8's room door use it |

## Tests

| File | What |
|---|---|
| `tests/model/*.test.mjs` | The model in Node (`npm run test:model`, about 20 s; the generated configurations shared among `generated_1` to `_6`, from `generated.mjs`) |
| `tests/room_3d.spec.js` | The page in the browser: saved addresses, screenshots, menus; on the desktop only those tagged `@desktop` (its size or keyboard) |
| `tests/controls/*.spec.js` | Every control, phone only: `inputs`, `pieces`, `hallway_garage`, `views`; shared `helpers.js` |
| `tests/menu_demo.spec.js` | The menu demo |
| `tests/helpers.js`, `tests/addresses.js` | Shared helpers; the saved addresses |
| `tests/quiet_reporter.js`, `tests/model/quiet_reporter.mjs` | The reporters both runs use: nothing for a pass, each failure in a few lines (no call log; a long diff cut to where it differs), then the totals. The whole of a browser run is in its html report (`npm run report`) |
| `tests/configs/`, `tests/snapshots/` | Saved configurations and their snapshots (`npm run regen` rewrites them) |

## How the page works

**A control's change.** Every settings control calls `change(edits, { look })`
(`page/controls.js`), each edit `[path in the configuration, value]`, as
`change([['pieces.bench.design.height', 900]])`. It has the model's
`setAll()` check each against its `SCHEMA` entry, then `syncControls()`
puts every control and readout in step, `show()` rebuilds (the model's
`rebuild(display)`: `build()`, the things to store, the doors, the
dimensions), `redrawAround()` does the colours, menus and address, and
with `look` the view follows. Listeners only say what changes. A slider
uses `input` (it rebuilds as it's dragged); radios, dropdowns and switches
use `change`. Everything is rebuilt each time: fast enough, and the
drawing always matches `config`.

**Not rebuilt.** The doors (`turnDoorsTo()`, the view's, not the
configuration's: `doorsNow()`, `readDoors()`, `DOORS_SCHEMA`) and the
things to store redraw only themselves. What's shown (2D or 3D, which
view, Cupboard only, Dimensions, Door sizes) is the page's `display`
(`page/display.js`), given to each build. Colours: `colourPicker()`, then
`settle()` sets the shared materials' colours.

**The address** is `#<configuration>~<view>`, each deflated and in base64url
(`kit/config_kit.js`; the format in `room_dimensions.md`). `writeAddress()`
writes it after each change, one history entry a change (a slider's drag
being one), and Back and Forward load the configuration in it. At start
the page reads it before building (a top-level `await`).

**`window.plans`**, for the tests and the console: `export()`, `view()`,
`load(configuration)`, `schema()`, `get()` (`config` as JSON, with the
doors), `snapshot()` (configuration, cutting lists, dimensions,
description, each piece's box: `tests/snapshots/`) and `viewSnapshot()`
(the camera, frames, cut, what each piece shows: `tests/view_snapshots/`).
The tests read settings through `get()`, not the address.

**The model in Node.** `buildFlat(configuration, view)` needs no page:
`npm run test:model` builds every saved configuration against its snapshot,
and about 1,700 generated ones. Canvases are stood in for by
`makeCanvas()`.

**Loading.** `index.html`'s import map points `three` at jsDelivr, so
there's no build step, but modules need a server (`npm run serve`). The
views and named configurations load first as classic scripts
(`window.ROOM_VIEWS`, `window.ROOM_CONFIGURATIONS`), as only the page
needs them.

### To add a slider

Its `<label>`, `<span id="xValue">` and `<input id="x" type="range">` in
a drawer's HTML; `X` in `config` under its piece's `design` or `in`, with a
comment; an entry in `SCHEMA` (or its module's) at the same path, as
`fromSlider(at('X'), 'x')` in `cupboardEntries()`; an `input` listener
calling `change([[path, Number(slider.value)]])` (a cupboard's: in
`cupboard_controls.js`'s `CUPBOARD_SLIDERS`, the bedroom's too); set in
`syncControls()`; used in a `build()`. Then `npm run regen` and check the
diff adds only it.

### Finding things

A control's code: search for its id in quotes (`'sofaW'`) or `name=bench`.
Its look: its `#id` or `.class` in `room_3d.css`. Hiding it for some
options: `showInMenus()`. A board in a cupboard: `board(name, { from, to }, g)`
in the option's `build()`, listed in the cutting list when `BOARD` thick.

## Elsewhere

- `demos/`: the controls and menu demos.
- `notes/`: finished or set-aside notes, trimmed to their decisions.
- `drawings/`: the floor plans and the measuring sheet.
- `serve.py`: the local server (`npm run serve`, port 8765).
