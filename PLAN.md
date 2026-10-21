# Plan

What's next, in order. Only what's still to do is here: what's done is in
git history (`git log`), what was agreed for a piece in its own note
(`HALLWAY_SHELVES.md`, `UI_CRITIQUE.md`), the model in
`room_dimensions.md` and the code's layout in `room_3d_ui_guide.md`.

How work goes: each piece on its own branch, `npm run test:quick` while
working, the full `npm test` before it goes live, and "deploy to main" puts
it on GitHub Pages. Two sessions testing at once need separate ports
(`PORT=8766 npm test`).

**Scope:** the top-floor (second-floor) flat: its rooms, hallway and
bathroom, and, beyond it, only the staircase and the entrance from ground
level up, so you can see the way in. The flat below and the other
properties aren't modelled. The floor plans are `drawings/
second_floor_plan.png` (this flat, in red) and `drawings/
first_floor_plan.png` (only for the stairs, in red, and the entrance's
lobby and route, in blue).

## Next steps

1. **The tests first** (`REFACTOR_PLAN.md`'s items 1 to 5, reviewed 21
   Oct 2026; the first two, the flaky tests' cause and the screenshots, done): the new wall views
   and the room buttons' ▾ tested, a guard on `state`, and the phone's top
   bar checked to fit (with UI step 1). The choices for them, made on 21
   Oct 2026, are in `REFACTOR_PLAN.md`. Deployed to main once done. Then:
2. **The UI fixes agreed on 19 Oct 2026** (`UI_CRITIQUE.md`): Look ▾ and
   Configuration ▾ in place of the coloured ☰ (the Views menu went on 21
   Oct 2026, its views into the room buttons' ▾: `VIEWS_MENU.md`); Reload and
   Reset into Other options; a number box beside the millimetre sliders;
   Stored and See-through cupboards as switches; the title *The flat in
   3D*, shorter labels and a tip on Look's greyed Save. `REFACTOR_PLAN.md`'s
   item 8 (the menus' helpers in `kit/controls_kit.js`) goes first, as the
   number box is built there. Deployed to main once done. Then:
3. **The refactor's small, standalone items** (`REFACTOR_PLAN.md`'s 6, 7,
   9 and 10), deployed to main once done; then stop and decide on
   `state`'s track (11 to 16).
4. **Measurements still to come in** (`MEASUREMENTS_NEEDED.md`, with
   `drawings/measure_sheet.html`; the values come back as "A = 2240"
   lines, to go into `room_dimensions.md` and the model):
   - Y to check (2330, against 3360 on the drawing); S, the bedroom's
     ceiling (2445, worked out), one check.
   - The stairs' going (X) and the winders' sizes; the WC wall's bottom
     over the stairs (how deep, how far down).
   - The right sill, lowered to 25 below the hallway floor (the user, to
     check; the left is 210 below).
   - The skirting that joins the second newel post.
   - The bathroom and WC's real sizes (a first pass, scaled off the
     drawing, in `floor.js`'s `BATHROOM`).
   - The shoe rack's real sizes; where rack 2 and the tub stand (guesses,
     neither clear in the photo).
5. **The rest of the flat, drawn**:
   - Walls seen from above in the bedroom's and the hallway's plans (they're
     faces seen from inside, so the plan shows only floors).
   - Stopping furniture at the walls.
   - Looking from the hallway into a room. *Still wanted?* The page is
     used a room at a time (the user, 19 Oct 2026).

Smaller pieces, any time:

- **Other parts in the cutting list**: parts not `BOARD` thick (option 9's
  tower plinth and its 25-thick oak shelves) are left out today; list them
  under "other parts". Each cupboard is an instance with its own cutting
  list and its boards tagged by kind (`userData.kind`), so this can start.
- **An overlap check** between things to store: today each is checked only
  against the cupboard's walls, so two can overlap and still show green.
- **Turning things to store by 45°**, so the racks can be shown diagonally
  across option 7's inside corner, where the doors meet (with both open the
  gap is about 844 across at 45°, more than the racks' 800).
- **Shelves at a corner over the stairs**: nothing is checked between
  walls, so separate shelves at a corner can meet (the L-shaped shelves are
  the way to join them).
- **The Configuration list**: choosing one loads the page again; an empty
  list could say so.
- **Designs**: a cupboard design as data (its kind, sizes, doors, shelves per
  leg, notes) in `living_room.designs.js`, one marked the finished design,
  the others prototypes, chosen in Lounge options. Configurations would then
  refer to a design, plus the packing, furniture and view. A design starts
  as a cupboard piece's configuration (its settings record and instance are
  there). Later, the L-shaped cupboard built from the data alone, so
  prototypes need no code, and a printable spec for the maker from the
  finished design.
- **Engineering drawings** from each cupboard's snapshot.
- **`menu_demo/`** keeps its own copy of the room; its `room.js` could load
  the walls from `floor.js`.

## The design to build

Option 7 (`option07` in `tests/addresses.js` is close): each leg 618 deep
outside, the back-wall leg 582 wide, the front at 1200; inside, with the
rear panels against the walls (boards 18), 1164 × 582 along the back wall
and 582 × 582 along the left wall, 2407 high, and all seven things to store
fit; shelves 790, 1300, 1850 in the back-wall leg and corner, 1710 and 2150
in the left-wall leg; the tub on the 790 shelf over the racks.

## Where it's heading: one floor plan, with rooms

**One floor plan as the single source of truth**, rather than rooms placed
side by side:

- **Walls** once each, as lines with a thickness: the wall between the
  hallway and the living room is one wall, not two to keep in step.
- **Openings** in walls: doors (frames, which way they swing) and windows
  (sills, radiators). A door belongs to its wall, so the rooms either side
  share it.
- **Rooms** as named areas, each with its own origin at one corner, so its
  measurements stay in its own mm (as today: the living room's x and y, the
  bedroom's u and v, the hallway's along and across).
- **Each room's fittings and contents** in its own coordinates.
- **One page** for the whole floor, a room chosen to frame it and show its
  options (as today).

Measuring: rooms measured apart rarely add up exactly when joined, so the
floor plan needs measurements across the hallway and through the door
frames (wall thicknesses, where each room's corner sits), settled once.

Later, the hallway's drawing could leave `floor.js` for a `hallway.js`
beside `other_room.js`.
