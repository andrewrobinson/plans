# Session notes: speakers, the daybed with a desk, its TV and chair (22 Oct 2026)

Everything asked for in this session is deployed to main. The last commit is
`6d88290`, after the full suite passed on both devices (288 passed, 4 skipped).
Live at https://andrewrobinson.github.io/plans/room_3d.html.

## What went live

| Commit | What |
| --- | --- |
| `9ce27e1` | **Speakers.** The Argon Fenris A5 pair, white with their grilles on (`speakers.js`: 170 × 220 × 280). In Lounge options → **Speakers**, on nothing to start. They go on the bench, centred on the TV; on Billy lying; or on the corner cupboard's top, which is offered once the cupboard is set below the ceiling. **Between their middles** sets their spacing, and each place keeps its own. |
| `eff342e` | **The daybed with a desk and bookcase** (B&Q: Abrihome's and Matteo's, one drawing). `desk_daybed.js`, 2630 × 1140 × 1000. A back wall piece, as Billy is: **Daybed with desk**, in place of the bench while on, with X, Y and Turn sliders, and **Desk at the right-hand end**. |
| `936f000` | **The TV above the daybed.** **TV on the wall above it**: centred on the bed, 150 above the daybed's top, at the TV size slider's size, while the daybed's back is to the back wall. **Speakers → The daybed**: on its bookcase top, either side of that TV. |
| `6d88290` | **A work chair at the daybed's desk.** None, **Smaller, armless** (to start) or **Office chair**. The office chair is the kitchen desk's, now drawn from `work_chairs.js`. It's pulled up at the desk's open end and moves with the daybed. The description gives the room from the desk's end to whatever is beyond it, and how far each chair reaches (430 for the smaller, 470 for the office chair), with whether it fits. |

The configuration's paths are in `room_dimensions.md`: `pieces.speakers` and
`pieces.deskDaybed` (`deskAt`, `on`, `move`, `tvAbove`, `chair`). The details
and the estimated sizes are in its sections "The daybed with a desk and
bookcase" and "The speakers".

## Still open (for the user to decide)

1. **The fit along the back wall.** A corner cupboard 800 along the back wall, the daybed (2630) and BillyChest in the window corner need 3914 of wall, but there's 3748 to BillyChest's back. With a cupboard, one of them has to move. The description says so: with option 10 and the daybed against BillyChest, "the corner cupboard reaches 165 in over its end".
2. **The third daybed link** (B&Q, £222.89, Matteo, desk at the head end) isn't modelled. Its page gives no sizes anywhere.
3. **Speakers on the bench with "TV and shelves".** They go through the shelf under the TV, which is only 195 above the bench. That was the choice made: they're drawn there and the description says they clash.
4. **Next, from before this session:** the measurements in `PLAN.md`.

## Worth knowing

- In the room as the page opens, the Drift stands across the daybed's desk end when the desk is at the right-hand end. The description says so.
- In the full suite on the desktop, the bedroom mirror's test once timed out ("element is not stable"). It passed when run again, so it looks like the slow desktop drawing, not these changes.
- The service worker's cache is `cupboards-v54`.
