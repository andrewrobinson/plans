# Tabs in the long drawers

Agreed with the user on 22 Oct 2026, and built that day (branch
`menu-tabs`): the small choices are settled under "Small choices"; segmented
controls followed the same day (branch `segmented-controls`). The aim is to make the
page simpler to use, for me and for a designer (`SHARING.md` has the
sharing side, set aside for now). It builds on `UI_CRITIQUE.md`'s problem
3, "Too many settings to find anything", and on the Tabs card in
`demos/controls_demo.html`.

## What's wrong

Lounge options is one scroll of 13 folding sections, about 2,360px long.
Garage options is about 2,490px long, with no sections at all: 12 pieces
and the door, one after another. On a phone both run long inside the
bottom sheet, and finding a setting means scrolling past everything else.

## What was decided

1. **Tabs in three drawers:** Lounge options, Hallway and stairs, and
   Garage options. Bedroom options (3 sections) and Other options (2) are
   short enough to stay as they are.
2. **The tabs sit under the drawer's title** and stay there as the drawer
   scrolls. The folding sections stay inside each tab, as they are now.
3. **Each drawer opens on the tab last used**, kept in localStorage as the
   sections' open or closed state is now (`room_3d:<id>` in
   `living_room.js`). The tab is how the page is used, not part of the
   room, so it doesn't go in the configuration or the address.
4. **Segmented controls**, a step of their own (below), built.

### Lounge options: four tabs

| Tab | Sections |
|---|---|
| **Cupboard** | The corner cupboard (with its cutting list) |
| **Furniture** | Sofa; The back wall: bench, TV and shelves; Speakers; Ivar; Cornwall table; Chesham table; Desk on castors |
| **Walls & doors** | The front wall and the island; Doors |
| **Colours & stored** | Colours; Things to store; Description |

### Hallway and stairs: two tabs

| Tab | Sections |
|---|---|
| **Upstairs** | The bathroom and WC; Shelves and pictures over the stairs; Shoe boxes on the sills |
| **Downstairs** | The shoe rack (downstairs); Doors downstairs |

### Garage options: grouped, then tabbed

The garage's pieces are first put into folding sections (`garageControls()`
in `garage.js`), then into tabs:

| Tab | Its pieces |
|---|---|
| **Cupboards & shelves** | Sean, Billy, BillyChest, Small Billy, Potters, Yellow, Pine cupboard, Ivar |
| **Tables & benches** | Metal, Scaffold bench |
| **Boxes** | Biltong, Trellis |

The garage door's radios stay above the tabs, as they're about the room
and not a piece. Each piece's group would be a field of its entry in
`PIECES`, so a new piece says where it goes.

## Small choices, settled while building (22 Oct 2026)

- **A phone's width.** The tabs are spaced closer together (6px each side
  of a name, 8px at the row's ends), so the Lounge's four fit across a 375
  phone at 361, Safari too. The desktop's drawer was 340 wide, narrower
  than a phone, so it's now 380 (`--drawer-width` in `room_3d.css`). Every
  drawer's tabs fit, with no sideways scrolling, checked by a test on both
  devices.
- **Opening a drawer from the 3D room.** Nothing in the page opens a
  section by itself, so no tab needs choosing for it.
- **Description** sits under the tabs, shown whichever tab is open.

## How it's built

- A small `kit/tabs_kit.js`, from `demos/controls_demo.html`'s tabs: a
  `role=tablist` of buttons, a `role=tabpanel` around each tab's sections,
  arrow keys to move between tabs, and the last tab kept by drawer.
- `index.html` wraps the existing `<details class="sec">` in each drawer
  in its tab's panel; the sections' ids, and so their saved open or closed
  state, stay the same.
- `window.plans.showTabOf(id)` shows the tab holding an element, for the
  tests' `openSection()`.
- Tests: "the drawers' tabs" in `room_3d.spec.js` (switching, the arrow
  keys, remembered after a reload, the garage's groups, the tabs fitting)
  on both devices. Lounge options' screenshot was taken again. The
  controls tests' `openDrawer()` shows every tab at once, as it unfolds
  every section; the room tests choose the tab a person would
  (`openTab()` in `tests/helpers.js`).

## Segmented controls (built 22 Oct 2026)

Every radio group became one row of joined buttons (`.seg` in
`room_3d.css`; the radios are still there, invisible over their buttons,
so the page's code and the tests didn't change). Agreed with the user: all
eleven, "None" everywhere, the long wording in each button's tooltip.

| Group | Buttons |
|---|---|
| The bench's height | 700 · 780 · 800 · 900 |
| Above the bench | None · Shelves · TV · TV + shelves · TV + top |
| Speakers on | None · Bench · Billy · Daybed · Cupboard |
| The daybed's chair | None · Small · Office |
| Desk on castors | By door · At TV |
| Kitchen island | In room · Long side · Short side · None |
| The front wall | Dresser · Larder · Bookshelf · None |
| Option 10's fold-down desk | Folded · Down |
| Things to store | Window · Cupboard |
| Bedroom door swings | Right · Left |
| Garage door (`GARAGE_DOOR`) | Hidden · Open · Closed |

At 375 wide the widest, Above the bench, is 339 of the 347 there is; a
narrower screen wraps it onto two rows.
