# Plan

What's next, in order. Only what's still to do is here: what's done is in
git history (`git log`), what was agreed for a piece in its own note
(`HALLWAY_SHELVES.md`, `UI_CRITIQUE.md`, `VIEWS_MENU.md`, all built), the
model in `room_dimensions.md` and the code's layout in
`room_3d_ui_guide.md`. `REFACTOR_PLAN.md` has the code's tidying still to do.

How work goes: each piece on its own branch, only the tests a change can
break while working (`-g`), at most one `npm run test:quick` before a
commit, the full `npm test` once before it goes live, and "deploy to main"
puts it on GitHub Pages. Two sessions testing at once need separate ports
(`PORT=8766 npm test`).

**Scope:** the top-floor (second-floor) flat: its rooms, hallway and
bathroom, and, beyond it, only the staircase and the entrance from ground
level up, so you can see the way in. The flat below and the other
properties aren't modelled. The floor plans are `drawings/
second_floor_plan.png` (this flat, in red) and `drawings/
first_floor_plan.png` (only for the stairs, in red, and the entrance's
lobby and route, in blue).

## Next steps

Done: the code's tidying, `REFACTOR_PLAN.md`'s tracks (the tests, the
small items, and `state`'s track, 11 to 16, by 22 Oct 2026). Its any-time
list stays.

1. **Measurements still to come in** (`MEASUREMENTS_NEEDED.md`, with
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
2. **The rest of the flat, drawn**:
   - Walls seen from above in the bedroom's and the hallway's plans (they're
     faces seen from inside, so the plan shows only floors).
   - Stopping furniture at the walls.
   - Looking from the hallway into a room. *Still wanted?* The page is
     used a room at a time (the user, 19 Oct 2026).

Smaller pieces, any time:

- **Find a setting** (`UI_CRITIQUE.md`'s step 6, put off till steps 1 to 3
  were in, as they now are): a search box in a drawer, or across them.
  To decide.
- **The desktop screenshots' size** (`testing_questions.md`'s question 4,
  still open): 1280 × 800 now, or the user's window size.

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
