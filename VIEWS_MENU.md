# The Views menu and the rooms: an analysis

**Done (21 Oct 2026):** decided and built, on main: the Views menu gone,
its views in each room button's ▾ (see *Choices* below). Kept as the
record of why.

Written 21 Oct 2026, from the code on main plus the uncommitted desk work
(`kit/view_kit.js`, `living_room.js`'s `builtInViews` and room buttons,
`living_room.views.js`).

In short: **yes**. The Views menu is one flat list for the whole flat. It
doesn't know which room you're in, so it offers lounge-only views from any
room. Choosing one of those moves you to the lounge without saying so. Its
2D wall views are drawn and cut for the lounge alone.

---

## How views are chosen now

There are four ways to change what you see, and they overlap:

| Control | Where | What it offers | Room-aware? |
|---|---|---|---|
| **Room buttons** (Lounge, Bedroom, Garage, Hallway) and each one's **▾** | Top bar | Bird's eye or Plan (2D) of that room; the hallway's ▾ also has Stairs from the side | Yes: each button is a room. The ▾'s choice is remembered for that room on this device (`room_3d:viewKind:<room>`) |
| **Views** (purple ☰) | Top right | Every view in the flat, in three groups: Config-defined, Saved on this device, Built-in | No: the same list from every room |
| **Look**: Room, Where, Looking at, eye height | Top right (blue ☰) | Room lists all five rooms (downstairs too); Where and Looking at list only that room's places and things | Yes |
| **Looks** (in Look) | Top right | Saved Where + Looking at + eye height | Partly: a look is in its place's room, but the list isn't filtered |

### What's in the Views list, and what choosing it does

`roomOfView()` in `kit/view_kit.js` decides what room a view is in. A view
with a `rooms` map frames whichever room you're in. A view with a `room`
is in that room. Anything else is in the **first room, the lounge**.
`setView()` then moves you to that room (`setRoom()`).

| In the list as | Id | Frames | From another room, choosing it… |
|---|---|---|---|
| **Config-defined** | | | |
| Seated | `desk` | Lounge | takes you to the lounge |
| Kitchen | `kitchen` | Lounge | takes you to the lounge |
| Window | `window` | Lounge | takes you to the lounge |
| Door | `door` | Lounge | takes you to the lounge |
| Packing | `packing` | The lounge's corner cupboard | takes you to the lounge |
| Garage from above | `garageFromAbove` | Garage | takes you to the garage |
| Foot of the stairs | `footFromAbove` | Downstairs | takes you downstairs |
| **Saved on this device** | `saved:<name>` | The room it was saved in | takes you there |
| **Built-in** | | | |
| Top | `top` | Lounge (its numbers are the lounge's middle) | takes you to the lounge |
| Corner | `corner` | Lounge ("by the desk") | takes you to the lounge |
| Bird's eye | `birdseye` | **The room you're in** (`rooms` map: bedroom, hallway, downstairs, garage) | stays in your room |
| Stairs from the side | `stairsSide` | Hallway | takes you to the hallway |
| Plan (2D) | `plan` | **The room you're in** (`rooms` map, `planOf()` each area) | stays in your room |
| Back wall (2D) | `back` | Lounge: camera, fit and cut (`cut: ['y', 2240, 1]`) are lounge numbers | takes you to the lounge |
| Left wall (2D) | `left` | Lounge (`cut: ['x', 700, 1]`) | takes you to the lounge |
| Front wall (2D) | `front` | Lounge (`cut: ['y', 4300, -1]`) | takes you to the lounge |
| Right wall (2D) | `right` | Lounge (`cut: ['x', 2220, -1]`) | takes you to the lounge |

So only **Bird's eye** and **Plan (2D)** are room-aware, out of 16 entries.
The other 14 each belong to one room, mostly the lounge, but the list
doesn't say which.

---

## What's wrong

### 1. The list is global, but the page is used a room at a time

From the bedroom, the Views list still opens with Seated, Kitchen, Window,
Door and Packing (all the lounge's), then Top, Corner and four wall views
(also the lounge's). Nothing in the list belongs to the bedroom except
Bird's eye and Plan. The garage and downstairs each have one view of their
own, mixed in among the lounge's.

### 2. Choosing a lounge view moves you out of the room without saying so

In the bedroom, choosing **Back wall (2D)** silently takes you to the
lounge's back wall, and the options button switches to Lounge options. That's the right thing for the code to do, as
the view is the lounge's, but nothing in the list warns you.

### 3. The 2D wall views exist only for the lounge

`back`, `left`, `front` and `right` are the lounge's walls. Their camera,
`fit` and `cut` are lounge numbers, and their dimensions are the lounge
cupboard's (`cupboardDims()`, `flatRoom`). The bedroom, hallway, downstairs
and garage have no elevations, though the bedroom has its own corner
cupboard with doors and a cutting list. The labels just say "Back wall", and
the bedroom's back wall is a different wall.

### 4. Top and Corner sound general but aren't

"Top" is straight down on the lounge, and "Corner" is from the lounge's
corner by the desk. Neither has a `rooms` map, so they can't frame another
room. Bird's eye already does that job per room.

### 5. Two places choose Bird's eye and Plan, and they don't agree

The room buttons' ▾ and the Views list both offer Bird's eye and Plan. The
▾ remembers its choice per room. The Views list doesn't update that memory,
so the next press of a room button can undo what the Views list just chose:

- Choose **Plan (2D)** in the Views list while in the lounge.
- Press **Bedroom**: you get the bedroom's *Bird's eye*, because that's
  the bedroom ▾'s remembered choice, not the plan you just picked.

**Stairs from the side** is in both places too.

### 6. A third room switch, in Look

Look's **Room** dropdown also changes room. It keeps the view if it frames
every room (Bird's eye, Plan); otherwise it takes you in at the room's
doorway. It's the only way to reach **downstairs** apart from the "Foot of
the stairs" view, as downstairs has no room button (its options are the
hallway's). That's three controls for "which room", each with its own rule
for what you see on arrival.

### 7. Saved views and looks aren't sorted by room

A saved view keeps its room (`room` in the saved JSON) and a look its
place's room. Both lists show everything from every room, so you can't
tell which belong where.

---

## Choices (to decide before anything's built)

**Decided and built (21 Oct 2026):** the Views menu goes, and each room's
button (its ▾) lists all that room's views, as D a, B a, C (dropped, but
Corner kept unlisted as Packing's view with no cupboard), E a:

- Each ▾: Bird's eye, Plan (2D), the room's four walls in 2D (each named as
  that room's own wall: `WALL_NAMES` in living_room.js), its config-defined
  views, and the views saved in it. The other rooms' walls are framed and
  cut by `wallView()` from `ROOM_BOXES` (flat_model.js), with the wall's
  length and the room's height as dimensions; the lounge's stay as drawn.
- Top is gone, and Corner is no longer listed.
- Save view and Delete view are in the Look menu; a saved view is listed in
  its room's ▾.
- Dimensions and Door sizes show in a 2D view at the bottom right, above
  Configuration (at the top right they'd cover the top bar on a phone).
- Downstairs' views are under the Hallway's ▾ ("Downstairs: …").
- Look's Room list is gone: Where and Looking at are the room on screen's.

The section below is the analysis as it was written, before this.

Each step stands alone. They overlap with `UI_CRITIQUE.md`'s step 1
(*Views ▾*, agreed) and its step 8 (two places to choose a view, listed
there and not yet decided).

### A. Make the Views list follow the room you're in

- **a.** List only the views of the room in view, plus those that frame any
  room (Bird's eye, Plan). Other rooms' views are left out (reached from
  their room).
- **b.** List the room in view's views first, then the others under a heading
  per room ("In the lounge", "In the garage"…), so choosing one says where
  it takes you.
- **c.** Keep one list, but add the room to each label: "Back wall (2D),
  lounge".

### B. Wall elevations for the other rooms

- **a.** Give each room its own 2D wall views (`rooms` maps on `back`,
  `left`, `front` and `right`, with each room's own walls named, cut and
  framed). Start with the bedroom, which has a cupboard to measure.
- **b.** Only the bedroom, for its new cupboard (Cupboard only already shows
  a cupboard's dimensions).
- **c.** Not now: rename the lounge's to "Lounge back wall (2D)" and so on.

### C. Top and Corner

- **a.** Drop them: Bird's eye does the same per room.
- **b.** Give them a `rooms` map, as Bird's eye has.
- **c.** Move them into the lounge's own views (with A), renamed "Lounge from
  above" and "Lounge from the desk corner".

### D. One place for "which room" and "seen how"

- **a.** The room buttons choose the room. Their ▾ lists *all* that room's
  views (Bird's eye, Plan, its wall views, its config-defined and saved
  views). The Views menu goes, and so does Look's Room dropdown, so Look is
  only Where, Looking at and eye height for the room in view. Downstairs
  then needs a button (or goes under Hallway's ▾).
- **b.** Keep both. A choice in the Views list updates the room's remembered
  ▾ (so pressing the room button again keeps it), and Look's Room goes.
- **c.** Keep all three, but make them agree: each shows the room in view,
  and the ▾'s memory follows whatever was last chosen there.

### E. Saved views and looks

- **a.** Filter them to the room in view (with A a).
- **b.** Group them by room (with A b).
- **c.** Leave them.

## Tests

The screenshot tests use the views by id (`birdseye`, `plan`, `back` and so
on, in `tests/configs/*.json`), so renaming labels changes no screenshot.
Changing what the lists hold changes the menus' tests in `room_3d.spec.js`
and `controls.spec.js` (the views list's options and the room buttons'), and
any screenshot taken with a menu open.
