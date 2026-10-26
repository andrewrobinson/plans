# Hanging space in the new cupboards

Started 24 Oct 2026. What the user asked for, the choices agreed, and
Claude's comments, kept while the feature is built.

## What the user said

- Model whether a cupboard has hanging space, and how much.
- The pine cupboard is the yardstick. Its inside is **475 deep**, just
  enough for hanging. Its 2-door section has **840** of rail and its
  1-door section **400**: **1,240** in all.
- New bedroom cupboards need at least as much hanging as the pine
  cupboard, and ideally 50% more: **1,860**.
- Add "Compare hanging space to pine cupboard" to the bedroom's and the
  lounge's cupboards. Sections less than 475 deep go red.
- Not every section of a new cupboard needs to be that deep. But the
  bedroom's cupboard in particular needs at least 1,240 of rail at 475
  deep.
- The ladders might be stored in the deepest corner of the L-shaped
  bedroom cupboard, which would use up some of its space.
- The user doesn't know exactly how hanging works in an L-shaped
  cupboard.

## Agreed (the user went with the recommendations, 24 Oct 2026)

1. **Depth** is measured inside: from the rear panel's face to the back
   of the doors. A section 475 deep or more gets a rail across its whole
   inside width. A shallower one gets no rail and goes red.
2. **Red means "too shallow to hang", not "wrong".** A shallow section
   is still fine for shelves. It just doesn't count towards the rail.
3. **In an L, the corner counts once** (see below).
4. **Option 8's diagonal:** a rail along each leg, counting only the
   stretch where it's 475 or more back to the diagonal front.
5. **Height:** shelves are treated as removable, as packing treats them.
   Each section's clear height is shown but not judged.
6. **The bedroom's recess cupboards** (420 deep) are included, and show
   red.
7. **Each room's cupboard is compared on its own.** The bedroom's line
   passes only at 1,240 or more: it's red below that, amber from 1,240,
   and green at 1,860 or more. The lounge's line gives its total beside
   the pine cupboard's 1,240, with no pass or fail.
8. **The switch** is a way of looking, like See-through, and isn't saved
   in the configuration or the address.

## How hanging works in an L-shaped cupboard (Claude's comments)

- A hanger needs about 475 to 550 of depth, so clothes on a rail stick
  out about that far on either side of where they hang.
- Two rails can't both run into the corner: the clothes on one would
  clash with the clothes on the other. So one rail (here, the back-wall
  leg's) runs right into the corner, and the other leg's rail starts
  where the first rail's clothes end: one leg's depth out from the back
  wall.
- The corner's length counts once, on the rail that runs into it.
- The clothes in the corner are reached by sliding them along the rail
  to the doors (a "blind corner"). That suits things worn rarely.
  Fittings like a carousel or a corner rail with a curve exist, but they
  hold about what the straight rails do.
- If the back-wall leg is too shallow to hang in, the left-wall leg's
  rail runs into the corner instead.

## How deep is enough (Claude's comments, open)

The user has read that 475 is really a minimum. General guidance, from
Claude's own knowledge (no sources were searched):

- An adult hanger is about 430 to 460 wide, and clothes stick out a
  little past it. About 500 inside is where hanging stops being tight.
- Usual advice is 550 to 600 inside. Standard fitted wardrobes are 600
  deep outside, which is about 560 to 580 inside. Coats and jackets want
  the deeper end.
- Below about 450, front-to-back pull-out rails or angled hanging are
  used instead.

Open: should sections between 475 and about 550 show as "hangs, but
tight" (amber)? For now the line is 475, a named constant.

## The recess cupboard, and front-to-back rails (open)

The user, 24 Oct 2026:

- The recess cupboard is **42 cm deep**. It's built into the recess, but
  it's an IKEA PLATSA layout, **180 × 162.9** (plus a 41.8 base): three
  columns.
  - The two outer columns each have a short shelf at the top, a
    front-to-back clothes rail (IKEA HJÄLPA), and a shelf and wire
    basket at the bottom.
  - The middle column has shelves.
- The front-to-back rails don't hold much.
- Front-to-back rails like these might also go in the new custom
  cupboard.

Claude's comments:

- With a front-to-back rail, the hangers sit across the column, so the
  clothes hold only the rail's own length: about 350 in a 42-deep
  cupboard. A 600-wide section with a rail across it would hold about
  560. So two columns give roughly 700 of hanging, against the pine
  cupboard's 1,240. That fits the user's sense that they hold little.
- A front-to-back rail needs the column to be about 450 or more *wide*
  rather than deep, so it suits a shallow section (under 475 deep).
- As built now, the recess cupboard shows red as "too shallow". Its two
  front-to-back rails aren't counted.
- To decide:
  - Should front-to-back rails be counted, at their own length?
  - If so, are they shown on their own line ("front-to-back"), or added
    to the total against the pine cupboard?
  - Should a shallow section of the new cupboards be able to have one?
    It would count as front-to-back hanging rather than going red.

## The ladders in the corner (open)

- The ladders are two of the things to store: the folding ladder (380 ×
  220 × 1200) and the long ladder (520 × 100 × 1620). At the moment
  they're only packed in the lounge's cupboard; the bedroom's cupboard
  stores nothing.
- Standing in the L's corner, they'd fill the blind corner. That's the
  part of the rail that's hardest to reach anyway, so it may cost little
  usable hanging.
- To model it later: let the ladders be put in the bedroom cupboard's
  corner, and take the length they stand along off the rail they're
  under. Until that's decided, the hanging count doesn't allow for them.

## Decided (the user, 26 Oct 2026)

The open questions above, answered:

- **Front-to-back rails** count at their own length, on a line of their
  own. The total compared with the pine cupboard's 1,240 stays rails
  across only.
- **A shallow section of the new cupboards** doesn't get a front-to-back
  rail: it stays red.
- **475 to 549 deep** still counts, but shows amber and says "tight".
  550 or more is plain.
- **The ladders:** a switch, "Ladders in the corner", draws them in the
  L's corner and takes the length they stand along off the corner rail.

Built 26 Oct 2026: `HANG_TIGHT` (550) in corner_cupboard.js; the recess
columns' `frontToBack` (other_room.js's `recessHanging()`); the ladders as
`pieces.bedroomCupboard.in.bedroom.ladders`, for options 7 to 9, both
upright side by side from the corner (380 + 520 = 900 off that rail).
