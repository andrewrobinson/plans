# Shelves and pictures over the stairs

Agreed 19 Oct 2026 (first written down in PLAN.md that day), built 19 Oct
2026 in [stair_walls.js](stair_walls.js). Also here, all asked for the same
day after the first build: the switch to hide the bathroom and WC, the
third wall (the TV wall), the defaults the user set, longer and lower
shelves on the TV wall, and L-shaped shelves joining the TV and WC walls.

## Where

The open space round the stairwell rises from the hallway floor to the
ceiling (2443, no ceiling drawn). Three walls in it, all seen from the
hallway:

| Wall | Where it is | Stretch used, and where positions along it are from |
| --- | --- | --- |
| **The WC wall** | The hallway's far end (`HALLWAY.xEnd`, x −2480): the wall shared with the bathroom, over the stairwell and on to the lobby | 1598, from the TV wall to the lobby's side of the bathroom wall (`BATHROOM.yLobby`) |
| **The lounge door wall** | In front of you as you take the first step down: the hallway side of the living room door's wall (`HALLWAY.x0`, x −150), over the winders | 1327, from the TV wall to the living room door's frame |
| **The TV wall** (added 19 Oct 2026) | On your right going down the stairs: the stairwell's outside wall (`HALLWAY.yHallOut`), in line with the lounge's TV wall, its back wall | 2330 (the hallway's length), from the lounge door wall to the WC wall |

PLAN.md first called the lounge door wall "the hallway side of the lounge's
TV / bench wall"; it's the door's wall, the TV wall is the third one.

The WC wall's bottom over the well is still to measure; it's drawn at the
hallway floor's level (MEASUREMENTS_NEEDED.md).

## What was agreed

- **Shelves** on each wall separately, each wall with its own switch and
  count, 0 to 3 shelves. Plain white floating shelves.
- **One picture per wall**, each with its own switch and size: a blank
  white picture in a thin black frame.
- **High up**, heights measured from the hallway floor, not the stairs.
  First 1600 (eye height, estimated) to start; then the user's own
  settings (below).
- **Sliders** for the height above the hallway floor, the width and the
  position along the wall of each; the shelves' spacing and depth too.
- **Kept apart**: on the same wall, the shelves and the picture never
  overlap.
- **Controls** in a new section of Hallway and stairs options, all off to
  start (for a while the pictures were on; the user then asked for
  everything off, starting at their sizes when switched on).
- **The TV wall's shelves** can be as long as the wall (2330) and start
  lower, from 200 above the hallway floor, just above the white board
  along it (chosen).
- **L-shaped shelves**: one set along the TV wall and the WC wall, joined
  in the corner where they meet, with their own controls (one count,
  height, spacing and depth, and a length along each wall from the
  corner), taking the place of those walls' own shelves while on. Off to
  start.

## What it starts as

All off. Switched on, each is as the user set it in their link (19 Oct
2026: "Default to these when pictures and shelves are enabled"):

| Wall | Picture: middle's height, width × height, middle along | Shelves: count, lowest's height, width, middle along, spacing, depth |
| --- | --- | --- |
| WC | 1420, 670 × 930, 830 | 2, 1350, 1200, 810, 440, 220 |
| Lounge door | 1220, 680 × 1000, 660 | 2, 1290, 1200, 600, 300, 200 |
| TV | 1430, 1200 × 1000, 1160 | 3, 1000, 1200, 1180, 440, 240 |

The L starts as the TV wall's shelves: 3 shelves, the lowest at 1000,
440 apart, 240 deep, 1200 along each wall from the corner (chosen).

On each wall the shelves and the picture are where each other are, so
with one on there's no room for the other: switching the second on says
so. Narrow one, move one above the other, or turn one off first.

## The sliders

In **Hallway and stairs options → Shelves and pictures over the stairs**,
for each wall a **Shelves** switch and an **A picture** switch, each
showing its sliders when on:

| Slider | Range (step) |
| --- | --- |
| Shelves | 0 to 3 |
| Lowest shelf, above the hallway floor (its top) | 1000 to 2300 (10); the TV wall's from 200 |
| Shelves' width | 300 to 1200 (10); the TV wall's to 2330 |
| Shelves' middle, from the wall's start | 0 to the wall's length (10) |
| Spacing, shelf to shelf | 200 to 500 (10) |
| Shelves' depth | 150 to 300 (10) |
| Picture's middle, above the hallway floor | 1000 to 2200 (10) |
| Picture's width × height (with its frame) | 200 to 1200 × 200 to 1000 (10) |
| Picture's middle, from the wall's start | 0 to the wall's length (10) |

The **L-shaped shelves**' block, under the walls: its switch, then
Shelves (1 to 3), Lowest shelf (200 to 2300), Along the TV wall from the
corner (300 to 2330), Along the WC wall from the corner (400 to 1598),
Spacing (200 to 500) and Depth (150 to 300). Each shelf is one joined L:
the TV wall's arm runs right into the corner, the WC wall's starts behind
it, a shelf's depth out (so it's at least 400). While it's on, the TV and
WC walls' own Shelves switches are greyed out, saying the L is in their
place; their settings are kept for when it's off.

Fixed, all chosen: the shelves 38 thick; the frame 20 wide round the
picture and 25 deep off the wall.

How the rules work:

- **Kept apart, with a 50 gap.** Move the shelves or the picture so they'd
  meet and the one you moved goes along the wall to the nearer side of the
  other that it fits on; drag on far enough and it jumps past. One above
  the other is fine. If it fits on neither side, the change isn't made and
  the menu says why. A configuration that has them overlapping moves the
  shelves, or leaves them out if they can't fit.
- **On the wall.** Each stays within its wall's stretch, and under the
  ceiling: 150 clear above the top shelf, 50 above the picture. More
  shelves or wider spacing bring the lowest shelf down if they must.
- **The L is fixed in its corner**: a change to it that would meet the
  picture on the TV or WC wall isn't made, and the menu says why; a
  picture moved onto one of its arms goes past it, as with shelves. A
  configuration with a picture on an arm moves the picture, or leaves it
  out.
- **Between walls** nothing else is checked: at the corners where the TV wall
  meets the others, separate shelves near the end of each could meet (the
  L is the way to have them join).

## The bathroom and WC switch

Asked for with the build, as the bathroom and WC get in the way of seeing
the hallway and stairs. **Hallway and stairs options → The bathroom and
WC → Show the bathroom and WC**: on to start; off hides the bathroom, the
lobby and the WC (floor.js's `bathroom` group). The WC wall's hallway face
stays, for its shelves and picture.

## In the configuration

Under `hallway`: `wcWall`, `loungeWall` and `tvWall`, each with `shelves`
(`on`, `count`, `height`, `width`, `along`, `spacing`, `depth`) and
`picture` (`on`, `height`, `width`, `tall`, `along`); `cornerShelves`
(`on`, `count`, `height`, `tvLength`, `wcLength`, `spacing`, `depth`);
each number held to its slider's range; and `bathroomShown`. The page's
settings are `state.stairWalls.wc` / `.lounge` / `.tv` / `.corner` and
`state.bathroomShown`. The saved addresses all have them off, so their
screenshots are as before.

## Shoe boxes on the sills (asked for and agreed, 19 Oct 2026)

At the top of the stairs, a white sill board runs either side of the
stairwell (floor.js's `HALLWAY.leftSill` and `rightSill`). The user asked
for a box on each, for shoes. Agreed one question at a time:

- **The box.** Closed on its bottom, top, back and both ends, open on the
  long side facing the stairs. 18 white panels, like the sills, with
  nothing inside.
- **Its sizes.** Length along the stairs, width from the wall (or the
  banister's base) out towards the stairs, height up from the sill's top.
  The width can't be more than the sill's: 240 on the left, 120 on the
  right. Height 100 to 1000.
- **Where.** A slider for where its near end is, from the winders' end of
  its sill (the newel post on the left, the lounge door wall on the
  right). The box is held on its sill: made longer, it comes back towards
  the winders to fit.
- **Under the WC wall.** The left sill's last 220 is under the WC wall,
  with 210 of headroom (the sill's drop below the hallway floor). A box
  that goes in there steps down at the wall's face, then slopes from 210
  (or its own height, if lower) to nothing at the sill's far corner.
- **Kept clear of the walls.** The right box stands against the TV wall,
  and either box can reach the WC wall or the lounge door wall. On those
  walls the box and the shelves or picture keep the same 50 gap: a box
  change that would meet them isn't made and the menu says why; shelves or
  a picture moved onto a box go along past it; the L-shaped shelves
  aren't moved onto one.
- **Menu and start.** A section of its own, Shoe boxes on the sills, in
  Hallway and stairs options, a switch and four sliders for each. Both off
  to start; switched on, 1200 long and 300 high from the winders' end, as
  wide as the sill. (Later the same day the left one starts 370 high, the
  user's, from their link.)

The sills' heights, from the user (19 Oct 2026, to check, in
MEASUREMENTS_NEEDED.md): the left one's top 210 below the hallway floor,
20 below the first step down; the right one's 25 below it (it was drawn
level with the floor), so the right box sits 25 below the floor and the
left one 185 lower than that.

Later the same day the second newel post went in (floor.js), standing on
the left sill's end by the winders, so the left box starts behind it
(agreed): its near end is measured from the posts, and it can be up to
1560 long (1340 clear of the WC wall).

Asked for the same evening:

- **The right box level with the left.** A switch on the right box, Top
  level with the left box's: while on, its height follows the left one's
  so their tops are level (the left's height less 185, the right sill
  being that much higher), its own height slider greyed out; off to
  start.
- **A view to see them**: Stairs from the side, in the Hallway ▾ list
  beside Bird's eye and Plan (2D), the user's camera from their link,
  high up past the TV wall looking across at the stairs.

In the configuration as `hallway.shoeBoxes.left` and `.right` (`on`,
`from`, `length`, `width`, `height`; the right one's `levelWithLeft` too), in the page's settings
`state.stairWalls.shoeBoxes`. The saved addresses all have them off, so
their screenshots are as before.
