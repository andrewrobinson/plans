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
| `page/colours.js` | 160 | The colour pickers and palette: `colourPicker`, its swatch's spectrum (`spectrumUnder`), `paintAll`, `updatePalette` |
| `page/spectrum.js` | 125 | The spectrum to drag over, for both UIs: hue across, light to dark down, greys at the side, snapping to the nearest RAL (`spectrum`, `nearestRal`) |
| `page/piece_controls.js` | 360 | The lounge's pieces' controls: dresser, sofa, larder, back wall, Ivar, tables, the dining table (`showDiningTable`), castor desk, speakers, island, See-through (`placeControls`, `setCupboardOnly`) |
| `page/views.js` | 125 | The built-in views (`builtInViews`): each room's plan and 2D walls (`wallView`), Packing (`packingView`) |
| `page/tips.js` | 105 | The tip under the pointer (`showTip`), and where things are for the views to aim at (`anchors`, `pointOn`) |
| `page/view.js` | 140 | The 2D views' fit (`frameCupboard`), `viewKit`, the Configuration list, loading cover, Dimensions buttons |
| `page/room_buttons.js` | 240 | The room buttons and drawers (`goToRoom`, `showRoomOptions`), and `syncControls()`, which puts every control in step |
| `page/game/shell.js` | 165 | The game UI's frame (mobile first, 23 Oct 2026): the room chips, the view switch (`MODES`: Plan, Overhead, Walk; `goTo`, `modeNow`), ☰'s menu (the top bar's controls), the furniture picker, per room, in every view (tap: in or out) and the note with Undo (`toast`, `setIn`). `?classic` leaves it all out |
| `page/game/furniture.js` | 190 | Each room's pieces for the picker (`ROOMS`): the lounge's (its Front wall and island folder: `ISLAND`, the dresser and larder sharing `livingRoom.frontWall`; Speakers in Other), the bedroom's (`onWall` for its wall pieces), the hallway's switches (also downstairs), the garage's (the flat's pieces in a Home folder), and the things to store (`STORED`, by their own switch); `SOFA` in or out by its model (`NO_SOFA` out), `BED` always there. Each: icon, `on`, `spot()`, `moveTo()`, `object()`; `inRoom(room)`, `floorBox`, `facing` |
| `page/game/plan_edit.js` | 270 | Plan's editing: select, drag (held in the room, snapping to walls), drop from and onto the picker, Turn, the sofa's resize handles, the keys |
| `page/game/selection.js` | 130 | What's selected: the blue outline in the scene (red overlapping) and the action bar (`select`, `setActions`) |
| `page/game/picking.js` | 55 | What's under the pointer: `planPoint`, `hitsUnder`, `pieceOf`, `colourTargetOf`, `screenOf` |
| `page/game/colour_sheet.js` | 100 | The colour sheet: a strip that paints as you slide, Spectrum to drag over, More for every RAL colour, ✓ and ✕ (`openColours`) |
| `page/game/walk.js` | 185 | Walk: tap the floor to go there, tap a thing to face it, pinch to zoom, the mini plan, Sit/Stand; a long-press on a painted surface opens its colours |
| `page/game/options.js` | 140 | A thing's options from a long-press, with its size handles (`sizes`): its controls moved in from Lounge, Bedroom or Hallway options into a sheet and back (`THINGS`, `thingOf`, `optionsFor`); the room's drawer for anything else |
| `page/game/resize.js` | 105 | Resize handles in Plan: they drag a thing's own size sliders (`startResize`, `stopResize`), started with its options |
| `page/game/insets.js` | 20 | The game UI's edges, which the 2D views fit between, and an open sheet, which both views fit above (`gameInsets`) |
| `game.css` | 165 | The game UI's look, mobile first; on a phone it hides the top bar |
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
| `model/cupboards.js` | 230 | The corner cupboards: `buildOption`, the living room's mirrored in the right-hand corner, its own reach short of the first window (`buildRightCupboard`, `rightCupboardSettings`, `RIGHT_REACH_MOST`, `rightCupboardText`), `buildBedroomCupboard`, `cupboardLimits`, the bedroom door they clear and how far it opens (`bedroomDoorOpensTo`: to the cupboard or a bedside table on the hallway wall), `drawBench` |
| `model/bench_wall.js` | 320 | The back wall: the bench (drawn whenever it's on, `benchDrawn`; to the right-hand wall or the right-hand cupboard, `wallEnd`), its shelves (`benchWall`, `aboveNow`), the TV, a piece of its own (`tvSpot`, `tvPiece`, `drawTv`, `tvOn`), base cupboards, Billy, the pine cupboard, the daybed (`BACK_WALL_PIECES`) |
| `model/colours.js` | 75 | `FINISHES`, `COLOUR_TARGETS`, `applyColour` |
| `model/front_wall.js` | 285 | The dresser, larder, sofa, front wall and bookcase: `DRESSERS`, `LARDERS`, `SOFAS`, `frontWall` |
| `model/loose_pieces.js` | 375 | The daybed desk's chair and what's in its way, the first radiator, Ivar, the tables, the dining table (`diningTableSpot`, from the room's middle), the castor desk, the speakers |
| `model/stored.js` | 275 | The things to store: `STORED`, `PACKINGS`, `placeStored`, `drawStored` |
| `model/hanging.js` | 60 | Hanging space against the pine cupboard's 1240 of rail (`PINE_RAIL`, `IDEAL_RAIL`): each room's rail (`railIn`), the bedroom's verdict (`hangingVerdict`), the menus' line (`hangingText`: tight sections, the ladders' share, front-to-back rails on their own), the rails and red drawn while compared (`drawHanging`, after each build; the page's `display.hanging`, switched in `page/controls.js`). HANGING_SPACE.md has the choices |
| `model/walking.js` | 420 | Walking space round the bedroom's bed (Show walking space, at the top of Bedroom options, `display.walking`): everything at body height laid on a 10 mm grid (`blockedGrid`, `clearances`), the route from the door round the bed (`route`), each stretch's narrowest gap measured exactly (`gapAt`) and drawn as a coloured dimension (`drawWalking`); the cupboard's doors' room to open (`doorGaps`) and the bedroom door's swing shut (`swingGap`); `walkingText`, `walkingVerdict`. WALK_EASY 600, WALK_TIGHT 460. notes/WALKING_SPACE.md has the choices |
| `model/dimensions.js` | 155 | The 2D views' dimensions (`updateDims`), door sizes, `cuttingList` |
| `corner_cupboard.js` | 1,280 | The corner cupboard: each option's build (`OPTIONS`), shelves, inside spaces, its sections for hanging (`hangingSections`, `HANG_DEPTH`, `HANG_TIGHT`; the ladders in an L's corner, `withLadders`), dimensions, cutting list; `makeCupboard` |
| `floor.js` | 915 | The walls, doors, windows and radiators of every room: `drawFloor`, `HALLWAY`, `ENTRANCE`, `OTHER_ROOM` |
| `other_room.js` | 690 | The bedroom's furniture and fitted cupboards, and their sliders; the pine cupboard's rails (`PINE.rails`); the recess's upper cupboard, an IKEA PLATSA with SANNIDAL doors that open together (`recessDoor`, `turnRecessDoors`, the view's `doors.recess`), or all drawers under its short doors (`upperAllDrawers`, `sannidalDrawers`) |
| `garage.js` | 490 | The garage, what's in it (its own things, and the flat's furniture put away there: group `home`, Garage options' Home tab and the picker's Home folder), and Garage options' sliders |
| `stair_walls.js`, `shoe_boxes.js` | 415, 235 | The shelves and pictures over the stairs; the shoe boxes on the sills |
| `wicker_bench.js`, `shoe_rack.js` | 275, 315 | The hallway's wicker bench; the shoe rack downstairs |
| `bedroom_door.js` | 50 | The bedroom door, both ways it can swing, as `kit/door_kit.js`'s doors (`DOOR_SWINGS`), and how far it sweeps into the room (`sweepInto`, `opensTo`) |
| `tornviken.js`, `rosentorp.js`, `loshult.js`, `ekby_alex.js` | 170, 45, 35, 35 | The kitchen island (IKEA's TORNVIKEN): its layouts, IKEA's, facing, trolleys and drawers (`ISLAND_LAYOUTS`), and where its chairs go (`placeTornviken`); its bar stools (ROSENTORP), trolleys (LOSHULT) and drawers (EKBY ALEX). Photos in `images/tornvikken_options/` |
| `custom_island.js` | 105 | The custom built-in island, in place of TORNVIKEN: drawers both sides, the worktop running on past them for two ROSENTORP stools, its length, width and overhang from sliders (`CUSTOM_ISLAND`, `customIsland`, `placeCustomIsland`) |
| Furniture: `billy.js`, `bookcase.js`, `castor_desk.js`, `daybed.js`, `desk_daybed.js`, `ivar.js`, `knarrevik.js`, `kvistbro.js`, `laundry_basket.js`, `speakers.js`, `tables.js`, `work_chairs.js` | 25 to 115 | One piece each, drawn wherever it stands |
| `dining_table.js` | 125 | The dining table to try with the user's four Foxglove chairs (navy, colour target `diningChairs`): rectangular (two a side) or round on a pedestal, its size from sliders, chairs tucked in or pulled out (`FOXGLOVE`, `DINING_TABLE`, `diningTable`), and whether they fit (`chairsFit`) |
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
| `kit/units_kit.js` | 20 | Numbers every room uses: `clamp` (the lowest wins if they cross), `QUARTER_TURN`, `turnPiece` (a piece turned as the menus' Turned) |
| `kit/shape_kit.js` | 45 | Shapes meeting, for any room, touching not counting: ranges and boxes (`rangesMeet`, `boxesMeet`, a Box3's `rangesOf`), convex outlines (`overlap`) and `clip`. Used by the stair walls, the shelves cut round stored things, the tables stacking, the radiator check and the doors |
| `kit/door_kit.js` | 150 | A hinged door in plan, for any room (`planDoor`): its outline at an angle, what it sweeps, how far it opens before something (in whole degrees, `OPEN_STEP`), its gap to a shape in line with it, and its swing marked on the floor (`swingMark`, `faint`). The bedroom door, the shoe rack's internal door and option 8's room door use it |

## Tests

| File | What |
|---|---|
| `tests/model/*.test.mjs` | The model in Node (`npm run test:model`, about 20 s; the generated configurations shared among `generated_1` to `_6`, from `generated.mjs`) |
| `tests/room_3d.spec.js` | The page in the browser: saved addresses, screenshots, menus; on the desktop only those tagged `@desktop` (its size or keyboard) |
| `tests/controls/*.spec.js` | Every control, phone only: `inputs`, `pieces`, `hallway_garage`, `views`; shared `helpers.js` |
| `tests/menu_demo.spec.js` | The menu demo |
| `tests/game.spec.js` | The game UI, phone only (the other page tests open it `?classic`) |
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
