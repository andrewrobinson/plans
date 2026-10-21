# The page's UI: a critique, and a plan to fix it

Written 19 Oct 2026 after using the page on the desktop (800 × 600) and at
phone size (375 × 812) on main at `edbd7cd`. Nothing here is agreed yet:
each step lists its choices, to be decided before it's built (as
`PLAN.md`'s sections are). Refactors stay checked by the screenshot tests;
the steps that change what's on screen will change screenshots, and say so.

---

## What's wrong, most serious first

### 1. Four ☰ buttons, four meanings

The top left ☰ is Other options; the top right's purple and blue ☰ are
Views and Look; the bottom right's green ☰ is Configuration. They differ only
by a 2px coloured ring (`.popToggle`'s `--tint` in `room_3d.css`), so each
has to be learnt by clicking it. ☰ usually means "the one menu".

### 2. Reload throws work away, unasked

Reload (top bar) "loads the page afresh, every setting back to its default",
with no question asked, while the Configuration menu says *Yours (not
saved)*. It sits between Share and Reset, as a chip like both. Reset does
ask, but it's the more drastic of the two and looks the same as Share.

### 3. Too many settings to find anything

| Drawer | Sliders | Switches | Radios | Dropdowns | Sections |
|---|---|---|---|---|---|
| Lounge options | 63 | 15 | 19 | 11 | 11 |
| Hallway and stairs | 51 | 14 | 0 | 0 | 5 |
| Bedroom options | 49 | 15 | 0 | 12 | 6 |
| Garage options | 40 | 13 | 3 | 0 | **none** |
| Other options | 13 | 3 | 0 | 0 | 2 |

About 216 sliders, all alike, all full width. Lounge options scrolls about
2,360px, Garage options about 2,490px with no sections. There's no search.

### 4. Millimetres set by sliders alone

A slider about 245px wide over 1000 to 1329 (the left-wall cupboard's
length) or 0 to 2330 (the TV wall) can't land on a chosen number by
dragging, worse with a finger. The value shows in the label but can't be
typed: the page has 7 number inputs in all, for the things to store's
heights.

### 5. The open drawer doesn't follow the room

With Lounge options open, pressing **Hallway** moves the camera to the stairs
but the drawer still shows the lounge's corner cupboard. The options button
says it's for the room in view; the drawer already open doesn't.

### 6. Controls in all four corners

Top bar top left, Views and Look top right, the options button bottom left,
Configuration bottom right. The eye has nowhere to start, and the room is
framed by chrome on every side.

### 7. The top bar mixes three kinds of thing

Going somewhere (Lounge, Bedroom, Garage, Hallway), what's shown (Stored:
on) and the app's own actions (Share, 📷, Reload, Reset), all the same white
chip. On a phone it takes three rows, about 15% of the screen, before
anything is opened.

### 8. Two places to choose a view

Each room's ▾ (Bird's eye, Plan, Stairs from the side) is a views menu of its
own, beside the purple Views menu.

### 9. Toggles in three styles

Switches (`label.switch`) for most on/off settings, but buttons with the
state in their text for **Stored: on** and **See-through cupboards: off**,
and native radios and selects beside the custom switches.

### 10. Smaller things

- The tab's title is still **Cupboard options in 3D**; the page is the flat.
- The cupboard's option list starts **16. Current room, no cupboards yet**:
  the number is the order the options were designed in, which means nothing
  to someone choosing.
- Long labels wrap ("Left-wall cupboard length, out from the back wall:
  1200").
- The Look menu's dropdowns read Where, Looking at and Eye height until
  chosen, and its Save is greyed out without saying why.

### What works, to keep

- The room fills the screen, and an open drawer leaves it live beside it (a
  sheet below it on a phone, its handle dragging it taller or shorter).
- Sections fold and remember being open.
- Every setting is in the address, so Share is a true link.
- Tooltips everywhere, in plain words; the names of things to store by the
  pointer.

---

## The plan

Each step stands alone and can be built in any order. All decided (19 Oct
2026): to build, steps 1, 2, 3, 8 and most of 9; dropped or put off, steps
4, 5, 6 and 7.

### Step 1: tell the corner menus apart

Replace the three coloured ☰ with something that says what each is.

Choices:

- **a.** Text with a ▾: *Views ▾*, *Look ▾*, *Configuration ▾* (clearest;
  wider, so check the phone's top bar still fits).
- **b.** Distinct icons (eye, camera, folder) with the tooltip as now.
- **c.** Icon and a short word under it.

Leave the top left ☰ (Other options) as the one ☰? Changes screenshots.

**Decided (19 Oct 2026): a.** *Views ▾*, *Look ▾*, *Configuration ▾*,
checked to still fit on a phone. The top left ☰ (Other options) stays as it is.
Since 21 Oct 2026 there's no Views menu (VIEWS_MENU.md): only *Look ▾* and
*Configuration ▾* are left to do.

### Step 2: make Reload and Reset safe

Choices:

- **a.** Move both into the Other options drawer (or a ⋯ menu), out of the
  top bar.
- **b.** Keep them in the bar, but Reload asks first when the configuration
  isn't saved, and Reset is drawn as a danger (red text).
- **c.** Drop Reload (the browser's own reload does the same once the
  address is cleared?), keep Reset in a menu.

Changes screenshots (the bar).

**Decided (19 Oct 2026): a.** Both move out of the top bar into a menu.
They go in the Other options panel (the top left ☰), Reset still asking
first.

### Step 3: type a number beside each slider

A small number box at the end of each size or place slider's label, kept in
step with the slider through the same `change()` path, refused or held to
the slider's range as the slider is. Built once in the kit so
`otherRoomControls()`, `stair_walls.js`, `shoe_boxes.js` and `garage.js`
get it too.

Choices:

- **a.** Every slider.
- **b.** Only the millimetre ones (not door angles, not colours).
- **c.** Tap the value to edit it, no box shown otherwise (smallest change
  on screen).

Changes screenshots (every drawer).

**Decided (19 Oct 2026): b.** A number box beside the millimetre sliders
only; door angles and the like keep the slider alone.

### Step 4: the open drawer follows the room

Going to another room (its top bar button, a view or a look) while a room's
drawer is open opens that room's drawer in its place.

Choices:

- **a.** Always follow.
- **b.** Follow, but keep each drawer's scroll place, so coming back finds
  the same slider.
- **c.** Leave the drawer, but say in its head that it's not the room in
  view.

**Dropped (19 Oct 2026).** Moving between rooms isn't how the page is used,
so a drawer left on another room's options doesn't matter.

### Step 5: Garage options in sections

The garage door, then a section for each thing (or for groups: shelving,
furniture, stored), closed to start, as Bedroom options does. Changes the
garage drawer's screenshots.

**Dropped (19 Oct 2026).** Garage options stays one list.

### Step 6: find a setting

A search box at the top of each drawer (or one across all of them) that
shows only the labels that match and opens their sections.

Choices:

- **a.** Per drawer.
- **b.** Across every drawer, opening the right one.
- **c.** Not now.

**Decided (19 Oct 2026): c, not now.** Look again once steps 1 to 3 are in.

### Step 7: one row of rooms, the rest out of the way

Rework the top bar into the rooms (with their ▾) and Share; Stored, 📷 and
whatever stays of step 2 into a ⋯ menu or Other options. Aim: one row on a
390-wide phone. Depends on step 2's choice.

Choices for the two views menus (point 8): keep both, or fold the rooms'
▾ lists into Views.

**Dropped (19 Oct 2026).** Only Reload and Reset leave the top bar (step 2);
the rest stays, the rooms' ▾ lists too.

### Step 8: one style of toggle

**Stored: on** and **See-through cupboards: off** become switches, as the
rest. Radios for long choices (the island) stay.

**Decided (19 Oct 2026): yes.** Changes screenshots (the lounge drawer, and
the top bar's Stored).

### Step 9: the small things

- The title: *The flat in 3D*. **Decided (19 Oct 2026).**
- Shorter labels where they wrap, the detail in a tooltip. **Decided.**
- The Look menu's Save says why it's greyed out (its tooltip). **Decided.**
- ~~The cupboard options without their numbers in the list~~: **dropped**,
  the numbers stay.

---

## Not in this plan

- A new look (fonts, colours, custom radios and selects). The page looks
  like a tool, which suits it; worth a separate decision.
- Moving the corner menus together (point 6): steps 1, 2 and 7 change it
  enough to look again after.
