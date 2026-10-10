# Room dimensions

The room, door, door frame and ceiling as modelled in [room_3d.html](room_3d.html), followed by every dimension the model uses. All sizes are in mm.

## How positions are given

- **x** runs along the back wall, from the left wall (x = 0) to the right wall (x = 3838).
- **y** runs from the back wall (y = 0) towards the front of the room (y = 5379, the front wall).
- **z** is height from the floor.
- "Left wall" is the wall at x = 0, as you face the back wall. The doorway is in it.

## Room

| What | Size | Notes |
| --- | --- | --- |
| Width, along the back wall | 3838 | |
| Depth, back wall to front wall | 5379 | Measured. 5751 into the sink recess and the desk recess |
| Ceiling height | 2443 | Measured between 2441 and 2446 across the room (the floor is uneven); 2443 is used everywhere. Near the door frame it measured 2434 |

The model draws the walls 100 thick. That's only for the picture; it's not a measurement.

## Door and door frame

The doorway is in the left wall, near the back of the room. The door opens into the room.

| What | Size or position | Notes |
| --- | --- | --- |
| Door frame starts | y = 1329 | Measured. The furthest a left-wall cupboard can come out from the back wall |
| Hinge | y = 1400 | Measured. Hinge side of the frame is 71 wide (1400 − 1329) |
| Door width | 760 | From y = 1400 to 2160 |
| Door height | 1978 | Measured to the floor |
| Door thickness | 44 | |
| Door frame height | 2050 | Measured to the floor. The frame head fills the 72 between the door top and the frame top |
| Door frame ends | y = 2231 | **Assumed.** The far side of the frame is taken to be 71 wide, like the hinge side. Not yet measured |
| Wall above the frame | 2050 to the ceiling | Measured 384 (ceiling 2434 there); the model, at 2443, shows 393 |

Opened to 90°, the door lies along x 0 to 760, at y 1400 to 1444.

## Kitchen recess and kitchen

Past the door frame, the left wall steps back: a short return wall faces the front of the room (the light switch is on it), and the kitchen sits in a recess behind it.

| What | Size or position | Notes |
| --- | --- | --- |
| Return wall | y = 2386 | 155 past the door frame (2231): from the back of the sink recess (5751), 610 (the corner) + 2125 (the counter's inner edge) + 630 (the fridge cabinet), all measured |
| Kitchen fronts behind the door wall | 405 | Measured: the fridge front is 405 behind the door frame's wall |
| Fridge unit depth | 590 | Measured |
| Recess back wall | x = −995 | 405 + 590 behind the door wall |
| Wall cupboards depth | 400 | Measured |
| Worktop height | 894 | Measured, to the top |
| Tall fridge unit | 630 wide along the wall, 2400 high | Width measured, height estimated |
| Wall cupboards | 1450 to 2400 | Estimated |
| Front-wall run | 590 units and a 610 worktop against the back of the sink recess (y = 5751), so the worktop's front is at 5141, 238 out from the front wall. From the recess wall to x = 800: the sink recess's edge (725), then 75 in front of the wall between it and the desk recess | The 725 from the measurements below; the 75 measured |
| Sink recess | 372 deep into the front wall (5751 − 5379, measured), as deep as the desk recess; from the floor to about 1990; x −995 (the kitchen recess's back wall, so the L of units turns into it, and the left-wall run carries on to 5751) to 725. The floor runs into it | Depth and right edge from measurements; left edge and top estimated. Tiled above the worktop |
| Wall between the sink recess and the desk recess | 1490 | Measured |
| Desk recess | 1623 across, 372 deep, full height, x 2215 to the right-hand wall | Measured, assuming it runs to the right-hand wall |
| Desk | white, 1600 wide (filling the recess), 802 deep from the recess back (so 430 out into the room), 830 high | Measured |
| Monitors | 2 screens, 610 wide × 360 high, tops 550 above the desk, spaced evenly across it, on a black riser 1080 wide × 230 deep × 100 high, centred, 80 from the back of the recess | Measured, except the riser being centred |
| Office chair | seat at 590, headrest top at 1400, 600 wide across the armrests | Measured; position and other sizes estimated |
| Sink | stainless, x −250 to 550, in the worktop in the sink recess | Estimated |
| Wall cupboards | over the drawers, and from the washing machine on to the front corner | The extractor is between |
| Island (loose) | Top 770 wide × 1260 long, 900 high, long side along the room; long edge 1010 from the door wall, short end 2941 from the back wall (so x 1010–1780, y 2941–4201); the top overhangs the base by 10 all round | Measured |

The kitchen and island are rough blocks in their real colours: units in Clerkenwell Gloss White, a light stone laminate worktop (`#CFC3B0`, estimated), the island in a warmer painted white (`#EDE6D5`) with a honey oak top (`#D6A562`).

## Dresser (idea)

Its sizes below are where its sliders start. The menu's **Dresser** dropdown sets them to a listed dresser (the first estimate, the Chester Large Dresser: 1370 wide, 1940 high, base 410 deep and 830 high, upper part 340 deep, or the Inglesham Small Dresser: 1000 wide, 1930 high, 420 deep throughout, base 830 high); the list is in `room_3d.dressers.js`, for editing.

**Larders.** The front-wall spot can hold the dresser, a larder or nothing (the menu's **On the front wall**), in every option but the current room. The larders are in `room_3d.larders.js`, for editing, their fronts stacked from the floor up as read from the product photos: the **Chester Double Larder** (1100 wide, 1950 high, 510 deep: four drawers on short legs under an oak top, then a pair of doors and a cornice) and the **Stow Narrow Single Larder** (670 wide, 1860 high, 500 deep: on a plinth, a lower door, a drawer and a tall upper door, both doors hinged on the right). A larder takes the dresser's colour.

**Options 12 to 15** put the dresser or the larder chosen in the corner instead of a built cupboard, against the back wall (facing the room) or the left wall (facing the windows), with the bench from it to the right-hand wall and the front wall left clear. Against the left wall anything over 1329 along it runs past the door frame into the doorway, as the 1370 Chester dresser does by 41; the description says so. In the larder options the door slider opens the larder's doors, and the Packing view stands you at its front with them open. The current room is now option 16 (its address code stays 10; options 12 to 15 are 13 to 16).

**The island** can be moved in any option (the menu's **Kitchen island**): out there (where it is now), or against the front wall between the sink and the desk in place of the dresser or larder, either long side out, its end against the wall and against the end of the kitchen counter (770 along the wall, x 800-1570, coming 1260 out to y 4119), or short side out, its long side along the wall, centred on the 1415 there (1260 along the wall, x 878-2138, coming 770 out to y 4609), or **None**, not there at all. "The island" is in Looking at.

**A sofa** can be added in any option (the menu's **Sofa, facing the TV**), from `room_3d.sofas.js`, for editing: the Habitat x Morris & Co. **Merton 2 Seater** (1690 wide, 1000 deep, 920 high, seat 505 high and 650 deep; its arm and leg heights estimated). It's centred on the TV, facing it, its front a slider's distance from the TV wall (1000 to 3500, starting at 1900, where its back is 41 short of the island's end). **Sitting on the sofa** is in Where, and "the sofa" in Looking at.

**Scenes**, to show people the options: everything on show bar where you're looking from (the option, the dresser, larder, island and sofa, what's above the bench, sizes and colours). The **Scenes** menu (the green ☰ at the bottom right; at the top right, the views list in the purple ☰, where you are and what you look at in the blue ☰ under it, and the option in the brown ☰ under that; and the page opens on Bird's eye unless its address has a view) has those in `room_3d.scenes.js` (the same on every device; it says how to add one) and those kept with **Save scene** (on that device only; **Delete scene** removes one). Choosing a scene loads the page again with its settings, keeping the view. The list shows the scene on screen, or "Your scene (not saved)" once anything's changed. `scene_kit.js` does this and is meant to serve other rooms too. On the front wall between the sink and the desk, a bit like the Cotswold Company's Chester Dove Grey large dresser. Drawn in options 1 to 9, not in the current room. Painted parts are in the dresser colour, which is the cupboards' unless you choose another; the top and shelves are in the shelf colour.

| What | Size or position | Notes |
| --- | --- | --- |
| Dresser | 1320 wide overall × 2100 high, x 848 to 2168 (its body 1280, with the top overhanging 20 each side) | Centred in the 1415 between the end of the kitchen counter (x 800) and the desk recess (x 2215), leaving about 48 each side; 1415 at most |
| Base | 400 deep, up to 900 | Two drawers (160 high) over two doors, on a set-back 100 plinth, under a 30 wooden top that's 15 proud |
| Upper part | 290 deep, from 900 to 2100 | Open, with shelf tops at 1250, 1550 and 1850 (spread evenly as the sizes change), and a 40 top that's 20 proud |

## Outer wall: windows and radiators

The right-hand wall (x = 3838), drawn so it's only visible from inside. The **Right wall** 2D view faces it.

| What | Size or position | Notes |
| --- | --- | --- |
| Windows | 3 recesses, each 923 wide × 1390 high × 207 deep, sills at 912, so tops at 2302 (measured), with a white sill. They start 734, 2446 and 4137 from the back wall | Measured |
| Outer wall, outside face | 300 out from the inside face, brick-coloured; only visible from outside | Thickness and colour are placeholders |
| Radiators | 600 wide × 600 high × 100 thick, 240 off the floor (top at 840), fronts 132 out from the wall; centred under each window | Measured, except the position under the windows |

## Parameters you can change on the page

| Parameter | In the code | Values | Default | What it sets |
| --- | --- | --- | --- | --- |
| Option | `shown` | 1–16 (16 is the current room, with nothing built) | 9 | Which cupboard layout. Options 10 and 11 are a full-height cupboard in the corner, 800 along the back wall and F out along the left wall, with the bench from it to the right-hand wall: 10 has a pair of doors on its end facing the kitchen, 11 a pair on its side facing the windows, where it's clear of the bench (y R to F). The left-wall cupboard depth doesn't apply to them |
| Left-wall cupboard depth | `T` | none, or 300 to 800 in 10s (slider; none is at its far left) | none (0) | How far the left-wall cupboard comes out from the left wall. Everything along the back wall starts from x = T. At 0 there's no left-wall cupboard, and options 2 and 8 aren't available |
| Left-wall cupboard front | `F` | 1200, 1329 | 1200 | How far the left-wall cupboard comes out from the back wall. 1329 is up to the door frame |
| Rear wall cupboard depth | `R` | 300 to 800, in 10s (slider) | 330 | How deep the bench and the back-wall cupboards are, from the back wall |
| Upper cupboard width | `UPPER` | 400 to 1200, in 50s | 700 | Width along the back wall of option 4's upper cupboard, and of options 3 and 5, which are built on it. Its door is UPPER − 24 wide. Shown on options 3–5 |
| Back-wall leg width | `LEG` | 400 to 1200, in 50s | 700 | Option 7 only: inside leg of the full-height L along the back wall. Its door is LEG − 24 wide, and the bench starts at x = T + LEG |
| Double-door cupboard width | `WARD` | 600 to 1400, in 50s | 900 | Option 9: width of the full-height double-door cupboard on the back wall. Each door is (WARD − 27) / 2 |
| Double-door cupboard depth | `WARD_D` | 330 to 1000, in 10s | 600 | Option 9: its depth from the back wall, independent of the bench |
| Shelving tower width | `TOWER` | 0 to 600, in 50s | 400 | Option 9: the open shelving tower beside it, R deep (0 for none) |
| Option 5 second bay | `EXTRA` | 300 to 900, in 50s | 500 | Width of option 5's second upper cupboard bay, beyond the upper cupboard. Its door is EXTRA − 6 wide. Only shown on option 5 |
| Bench height | `BENCH` | 700, 780, 800, 900 | 780 | Height of the bench top. Upper cupboards, corner shelves and everything above the bench move with it |
| Above the bench | `above` | Nothing, Shelves, TV, TV and shelves, TV and top shelf | TV and shelves | What's on the back wall over the bench |
| Shelf depth | `shelfDepth` | 150 to 400, in 10s | 250 | Depth of the shelves above the bench |
| TV size | `TV_INCHES` (slider) | 32, 40, 42, 43, 48, 50, 55, 60, 65, 70, 75, 77, 83, 85, 86 inches | 75 | The TV's overall width and height, `TV_W` × `TV_H`, from LG UK's size guide: 720 × 440 at 32" up to 1930 × 1110 at 86" (75" is 1680 × 960). Shown when there's a TV above the bench |
| Cupboard colour | `ralChosen.cupboard` | Named colours to compare (◀ ▶ flip between them): Clerkenwell Gloss White, AI Olive, Bella Brittany, Blinds as drawn, Kitchen worktop, Kitchen island, Kitchen island top, same colour as the door (Pure Brilliant White), same colour as the walls (Crown Gallery White). Or "Other colours…", which opens a second dropdown of 23 popular cupboard colours and all 99 RAL Classic colours by family | AI Olive | Covers carcasses, doors and the bench. Floor, walls and woodwork are fixed as the room is. Screen colours are approximate |
| Dresser colour | `ralChosen.dresser` | The same named colours and "Other colours…" as the cupboards, plus Same as the cupboards (0), Same colour as the door (2) and Same colour as the walls (1) | Same as the cupboards | The dresser's painted body, doors and drawers. Its top and shelves follow the shelf colour |
| Dresser sizes | `DRESSER` (sliders) | Width 900 to 1415 in 5s, height 1500 to 2400, base depth 300 to 600, base height 700 to 1000, upper depth 150 to 600 (no deeper than the base), all in 10s | 1370, 1940, 410, 830, 340 (the Chester; see `room_3d.dressers.js`) | The dresser stays centred between the end of the kitchen counter and the desk recess; its three shelves spread evenly up the upper part. Hidden for the current room |
| Shelf colour | `shelfWood` | 0 As drawn (pale oak `#D6BC8F`, option 9's oak `#C8A26B`), 1 Honey oak (as the island top, `#D6A562`), 2 Dark oak (`#8A5A33`), 3 Walnut (`#5C3D26`) | 0 | All the wooden shelves (above the bench, corner and upper units, option 9's tower) and option 9's oak bench top |
| Left-wall cupboard door | slider | 0°–110° | 0° | How far it's opened |
| Second door(s) | slider | 0°–110° | 0° | The option's other door or doors |
| Room door | slider | 0°–110° | 90° | How far it's opened |

The page address records the option (by a code that never changes, so old links keep working: 1 to 9 for options 1 to 9, 10 for the current room, 11 and 12 for options 10 and 11) and settings as `#option-T-R-F-above-shelfDepth-BENCH-EXTRA-UPPER-LEG-WARD-TOWER-WARD_D-floor-cupboard-wall-woodwork-shelfWood-TV_INCHES-dresser-dresserSizes~stored` (dresserSizes is `w.h.baseD.baseH.upperD`), for example `#9-0-330-1200-4-250-780-500-700-700-900-400-600-3-9010-1-2-3-65-6-1320.2100.400.900.290~1.0.0_2550.2642.1_2100.2362.0_2000.2362.1_2100.2582.0_2500.2362.0_2000.2902.0`. After the `~` are the things to store: `shown.packing.where` (shown 1 or 0; packing 0 to 3 as listed; where 0 by the window, 1 in the corner cupboard, 2 moved by hand), then `x.y.turned` for each, in the order of the table below, which are used when they've been moved by hand. A colour code of 0 means the default (the room as it is now); 1 to 10 are the room's finishes and the named cupboard colours below, and four-figure codes are RAL colours. After a second `~` is the view, so a shared link shows just what was on screen: a view's id (as `desk`, `plan` or `look:desk:tv`), or for anywhere else `cam`, `walk` or `seat` and the camera's place and aim in mm and its angle across, joined by `:`; then `.` and the eye height, and `.` and the room door's, left-wall cupboard's and option's own door angles, joined by `-`. For example `~look:desk:dresser.sit-tall.90-0-0`.

## Things to store

Bulky things that the corner cupboard must eventually hold, drawn standing on the floor as plain blocks (the tub as a cylinder). They're hidden to start with; **Stored things** in the menu shows them. In the 2D plan view each can be dragged, and double-clicked or double-tapped to turn it round. A blue outline round them all, labelled with its size, is the floor area they need.

In the menu, **Packing** picks one of the four packings below, and **Where** puts it **By the middle window** (loose on the floor right of the island) or **In the corner cupboard** of the option on show. In the cupboard it's pushed into whichever inside corner, and whichever way round, fits the most; it moves again whenever the option or its sizes change. Anything partly in the cupboard that doesn't fit, because it sticks out or is too tall there, turns red, the outline turns red, and the menu says how many fit and why the others don't. **Pack them again** puts them back after moving them by hand.

In the plan view the cupboard's inside is outlined (a rectangle, or an L of two), green when everything in it fits and red when something doesn't, with its size on the back wall. Over anything that sticks out, the part outside the inside is shaded red and labelled with how far it goes past the inside's edges (or the size of the part outside, when it's in the notch of an L).

**Packing** (in the top bar's views list) stands you 750 in front of the corner cupboard's door, at standing eye height, looking in, with that door open to 90°: the left-wall cupboard's in options 1–5 (and 6 with one), else the option's own doors. Any other cupboard door is shut, as it could swing open in front of you, and in option 10 the room door is too. It follows the option as you change it. With no corner cupboard it's the corner view.

**Views.** The top bar picks where you are and what you're looking at (**Where** and **Looking at**), your **eye height** (short or tall, sitting or standing), or a view from the **views list**: config-defined ones, ones saved with **Save view** (kept in that browser, so on that device only), and the built-in ones (from above, and the 2D views). The places, things to look at, eye heights and config-defined views are in `room_3d.views.js`, in mm, for editing; `view_kit.js` does the choosing and is meant to serve other rooms too. **Looks** and **views** are saved apart: the Look menu's **Save** keeps a Where, Looking at and eye height by name (a look aims at its thing wherever it is, so it follows a changed dresser or a moved island; only a look just chosen can be saved, not anywhere moved to by hand), and the Views menu's **Save** keeps the camera's spot and direction, wherever you've got to. Looks can also go in `room_3d.views.js` (its `looks`), to be the same on every device. As a person (sitting or standing), dragging looks round where you are, and in the desk chair the chair swivels with you; right-drag, shift-drag, the arrow keys or WASD walk, and scrolling zooms like a lens. From above, dragging swings round the room as before.

### The shelfless bay

While the things are shown, each shelf inside the corner cupboard is cut back across its short way wherever something stands under it that comes within 50 of its underside (things stand on the cupboard's 18 bottom; 50 is room to lift them in), with 10 spare either side. What's left of a shelf under 100 long is left out. It follows them as they're dragged, and shelves above the bay stay. The menu lists which shelves are cut, over what, and the shelf left over the bay. Hidden, the cupboard has all its shelves.

A shelf can stay over a thing when its top is at least the thing's height + 18 + 50 + 18:

| Thing | Height | Lowest shelf top over it |
| --- | --- | --- |
| Long ladder | 1620 | 1706 |
| Folding ladder, mop | 1200 | 1286 |
| Dustpan and hoover | 1000 | 1086 |
| Drying racks | 700 | 786 |
| Yellow tub | 450 | 536 |

So in every option the top shelf (1800, or 1803 in the left-wall cupboard) stays right across, 1764 (1767) clear of the cupboard floor, 144 (147) over the long ladder. The 1200 (1203) shelf is cut over the ladders and the mop but can stay over the hoover, the racks and the tub; the 600 shelf is cut over everything but the tub. With the tightest packing (850 × 1090) and a 600-deep left-wall cupboard (T = 600, R = 330, F = 1200, other sliders as they start):

| Options | Shelves | Cut back for the bay | Fit |
| --- | --- | --- | --- |
| 1–5 | 1203, 1803 in the left-wall cupboard | 1203 over y 348–858 (folding ladder, long ladder, mop) | 4 of 6: the racks and tub stick out |
| 6 | 600, 1200, 1800 in the left-wall leg; 390 in the lower cupboard | 600 over y 348–1182, 1200 over y 348–858 | 4 of 6: the racks and tub stick out |
| 7 | 600, 1200, 1800 in both legs | 600 over x 0–860 and y 312–1090; 1200 over x 0–510 and y 312–550 | 5 of 6: the racks stick out |
| 8 | 600, 1200, 1800 | 600 over x 0–860, 1200 over x 0–510 | 5 of 6: the racks stick out |
| 9 | 600, 1200, 1800 in the double-door cupboard and the leg | 600 over x 0–860 and y 582–1090; 1200 over x 0–510 | 5 of 6: the racks stick out (the 580 × 1770 packing leaves only the tub out) |
| 10, 11 | 600, 1200, 1800 | 600 over y 0–1090, 1200 over y 0–550 | 4 of 6: the racks and hoover stick out |

Without a left-wall cupboard (T = 0), options 1–5 have no corner cupboard, option 6 fits none (its lower cupboard is only 744 high), and option 7 fits 1 of 6.

The corner cupboard's inside, for each option (shelves are cut back as above; bench tops, dividers and panels count):

| Options | Inside |
| --- | --- |
| 1–5 | The left-wall cupboard: full height (2407) from y = R + 18 to F − 18, and under the bench (BENCH − 36) behind that, x 0 to T |
| 6 | The back-wall leg's lower cupboard (BENCH − 36 high), and the left-wall leg at full height |
| 7 | Both legs of the L at full height |
| 8 | The corner unit at full height, to 25 behind its diagonal doors |
| 9 | The double-door cupboard (x 0 to T + WARD − 18, WARD_D deep) and the left-wall leg, at full height |
| 10, 11 | The 800 × F corner cupboard at full height, x 0 to 782, y 0 to F − 18 |
| 12 | None: they stay by the window |

| Thing | Footprint (along x × along y, in the 850 × 1090 packing) | Height | Colour | Notes |
| --- | --- | --- | --- | --- |
| Drying racks, 2 | 300 × 800 (turned) | 700 | `#D9DDE2`, light grey | Each 800 wide × 700 high × 100 thick; they can't stack, so they're one block 300 thick |
| Folding ladder | 380 × 220 | 1200 | `#AAB0B6`, aluminium | |
| Long ladder | 100 × 520 (turned) | 1620 | `#8A9199`, darker aluminium | The tallest thing |
| Mop | 400 × 320 | 1200 | `#4F86B8`, blue | |
| Dustpan and hoover | 320 × 280 | 1000 | `#B8473A`, red | |
| Yellow tub | 550 across (550 × 550) | 450 | `#F2C230`, yellow | |

Packed as tightly as they go (found by trying every order and turn), they need **850 × 1090** of floor, 0.93 m² for 0.90 m² of footprints. They start like this, loose on the floor right of the island, opposite the middle window (x 2000 to 2850, y 2362 to 3452). The other packings to choose from: 860 × 1080 (0.93 m²); 700 × 1370 (0.96 m²) if one side can be no more than 700; 580 × 1770 (1.03 m²) if one side can be no more than 600. Inside, the corner cupboard needs at least one of these floor areas, and 1620 of height for the long ladder.

## The room's finishes

| Where | Finish | Code in the address | Screen colour (approx.) | Nearest RAL |
| --- | --- | --- | --- | --- |
| Walls | Crown Gallery White (K9710C), matt emulsion | 1 | `#DCDEDB` | 7035 Light grey / 9018 Papyrus white |
| Woodwork | Dulux Pure Brilliant White, gloss | 2 | `#F8F8F6`, a clean white (one paint database gives `#EDECE7`) | 9003 Signal white / 9016 Traffic white |
| Ceilings | Dulux Pure Brilliant White, matt | — | `#EDECE7` | 9003 / 9016. Drawn with six downlights, seen only from inside the room |
| Floor | Howdens Oak 3 Strip Engineered Flooring (SDH3220): oak, 2200 × 207 × 14 boards of three 69 strips, click fit, 3.18 m² packs | 3 | About `#D29A50` in daylight photos of the room; drawn as oak boards | 1002 Sand yellow (darker strips near 1011 Brown beige) |
| Cupboards (idea) | **Clerkenwell Gloss White**: Howdens kitchen units (FRK24), as on the kitchen in the room. Howdens call it a crisp, neutral white (their warmer one is Clerkenwell Gloss Porcelain). Drawn as high gloss | 5 | `#F5F4EF`, a hair warmer than the woodwork and clearly whiter than the walls in a photo of the kitchen | 9010 Pure white / 9016 Traffic white |
| Cupboards (idea) | **AI Olive**: taken from the cupboards in an AI-generated picture of the room, corrected for its dim, warm light | 4 | `#B8B0A4`, a light olive-grey greige | 7032 Pebble grey (7038 Agate grey close) |
| Cupboards (idea) | **Bella Brittany**: the blinds' fabric, a blockout roller blind fabric from The Fabric Box's Bella range | 6 | `#85A3B4`, a dusty blue, averaged from the maker's swatch photo | 7040 Window grey / 7001 Silver grey (no close RAL blue) |
| Cupboards (idea) | **Blinds as drawn**: the window panes as the model shows them (`#CFE3EF`, see-through), as a solid colour that shows the same on screen (`#B8C0BF` in the island view) | 7 | `#BECEDB`, a pale blue-grey | 7047 Telegrey 4 / 7035 Light grey |
| Cupboards (idea) | **Kitchen worktop**: the kitchen's light stone laminate worktop, as drawn | 8 | `#CFC3B0` (estimated) | 7044 Silk grey |
| Cupboards (idea) | **Kitchen island**: the island's painted white, warmer than the kitchen units, as drawn | 9 | `#EDE6D5` | 9002 Grey white / 1013 Oyster white |
| Cupboards (idea) | **Kitchen island top**: the island's honey oak top, as a plain colour (the oak's grain isn't drawn) | 10 | `#D6A562` | 1002 Sand yellow / 1001 Beige |

The wall spec mentions "Indulgence", but Crown's Indulgence is a blue (CRAFTED by Crown), so check the tin.

### Every colour in the model

The screen colours each part is drawn in, as set in [room_3d.html](room_3d.html). The room's light is slightly warm, so on screen they show a little darker and warmer than these values.

| Part | Colour | Notes |
| --- | --- | --- |
| Walls | `#DCDEDB` | Crown Gallery White (finish 1) |
| Door, door frame, window sills | `#F8F8F6` | Dulux Pure Brilliant White (finish 2) |
| Ceiling | `#EDECE7` | Pure Brilliant White, matt |
| Floor | oak boards averaging `#D29A50` | Howdens oak (finish 3), drawn as a texture |
| Cupboards: carcasses, doors and bench | the cupboard colour | AI Olive `#B8B0A4` by default; see the named colours above |
| Shelves | `#D6BC8F` | Or the shelf colour chosen |
| Option 9's tower shelves and oak top | `#C8A26B` | Or the shelf colour chosen |
| Option 9's shelf lights | `#FFF1D0`, glowing `#FFD28A` | |
| Handles | `#333333` | |
| TV | `#1A1A1A`, screen `#0C1824` | |
| Kitchen units | `#F5F4EF`, high gloss | Clerkenwell Gloss White |
| Kitchen worktop | `#CFC3B0` | Light stone laminate (estimated) |
| Sink | `#C4C8CC`, metallic | Stainless steel |
| Sink recess tiles | `#EEEEEA` | |
| Island | `#EDE6D5`, oak top `#D6A562` | |
| Desk | `#F2F1EE` | |
| Chair, monitors, riser | `#222222` | |
| Window panes (the blinds) | `#CFE3EF`, 60% see-through | Shows as about `#B8C0BF` |
| Radiators | `#F6F6F4` | |
| Outer wall, outside | `#A0614A` | Brick colour, a placeholder |
| Downlights | `#FFF6E0` | |
| Background | `#EEF0F2` | |
| Outlines | `#3B2A12` | Edges of the boxes |
| Dimensions (2D views) | `#9B1C1C` | |
| Things to store | See [Things to store](#things-to-store) | Their outline and plan labels are `#1F4E79` |

### Sizes that follow from the parameters

| What | Size |
| --- | --- |
| Left-wall cupboard door width | F − R − 6 |
| Inside leg along the left wall | F − R |
| Bench, options 1–5 | from x = T, length 3838 − T, depth R |
| Bench, options 6 and 8 | from x = T + 700, length 3138 − T, depth R |
| Bench, option 7 | from x = T + LEG, length 3838 − T − LEG, depth R |
| Corner above the bench (options 1–2) | T × R |
| Door over the corner shelves (option 2) | (R − 6) × (H − 6 − BENCH) |
| Upper cupboard doors (options 4, 5) | UPPER − 24 wide, and in option 5 a second one EXTRA − 6 wide; from BENCH + 3 to H − 3 |
| Option 6 lower door | 676 × (BENCH − 24) |
| Option 8 diagonal front | from (T, F) to (T + 700, R), length √(700² + (F − R)²), two doors each (length − 9) / 2 |

## Hardcoded dimensions

### Room and doorway

| Name in code | Value | What |
| --- | --- | --- |
| `W` | 3838 | Room width |
| `D` | 5379 | Room depth, back wall to front wall (measured) |
| `H` | 2443 | Ceiling height, measured 2441 to 2446 across the room |
| `WALL` | 100 | Wall thickness, drawing only |
| `FRAME` | 1329 | Door frame start, from the back wall |
| `HINGE` | 1400 | Door hinge, from the back wall |
| `JAMB` | 71 | Frame width each side (HINGE − FRAME) |
| `ROOM_DOOR` | 760 | Door width |
| `ROOM_DOOR_H` | 1978 | Door height |
| `FRAME_H` | 2050 | Door frame height |
| `FRAME_END` | 2231 | Door frame end (assumed far side) |
| — | 44 | Door thickness |

### Bench and cupboards

| Name in code | Value | What |
| --- | --- | --- |
| — | 18 | Panel thickness: carcass sides, tops, bottoms, shelves inside cupboards, doors |
| — | 3 | Gap round each cupboard door (doors stop 3 short of floor, ceiling and neighbours, so full-height doors are H − 6 = 2437 high) |
| — | 700 | Inside leg of the full-height L along the back wall, options 6 and 8 (x T to T + 700) |
| — | 1203, 1803 | Shelf tops inside the left-wall cupboard |
| `upperTops()` | BENCH, BENCH + 423, + 828, + 1233 | Shelf tops in the corner and upper units above the bench (780, 1203, 1608, 2013 at the default bench) |
| — | 600, 1200, 1800 | Shelf tops inside the full-height L and option 8 |
| — | 390 | Option 6's shelf inside the lower cupboard (top) |
| — | 25 | Option 8: shelves stop this far behind the diagonal front |
| — | 950 to 1250 | Full-height door handles. Doors above the bench: BENCH + 170 to + 470. Option 6 lower door: BENCH − 300 to − 80 |

### Above the bench

Heights here are set from the bench height; the value at the default bench of 780 is in brackets.

| Name in code | Value | What |
| --- | --- | --- |
| `SHELF_T` | 25 | Shelf thickness |
| `SHELF_TOPS` | BENCH + 420, + 770, + 1120 (1200, 1550, 1900) | Shelf tops, "Shelves" |
| `TV_W` × `TV_H` | 1680 × 960 at 75" | TV size, from the TV size slider (`TV_SIZES`) |
| `TV_BOTTOM` | BENCH + 320 (1100) | TV bottom edge; top is 830 higher (1930) |
| — | 50 | TV depth off the wall |
| `TV_GAP` | 150 | Clear space between the TV and the shelves beside it |
| `TV_SHELF_TOPS` | BENCH + 220, + 1300 (1000, 2080) | Full-width shelf tops below and above the TV, "TV and shelves". A TV over 65" raises the top shelf to stay 150 clear of it; if that brings it within 60 of the ceiling, there's no top shelf |
| `TV_MIDDLE_SHELF` | BENCH + 770 (1550) | Shelf top either side of the TV, "TV and shelves" (left out when there's under 200 each side) |

## TODO

### Kitchen measurements, not yet in the model

The model is good enough to show the dresser, so these are parked. Measured (October 2026):

- The counter is an L, 610 wide on both legs. Its inner edges (closest to someone standing at it) were given as 1190 and 2125.
- From the sink, along the left wall towards the room door: the counter comes 610 (the corner), then 215 more of counter, then 630 of fridge cabinet, to the wall with the light switch.
- "The counter extends 105 cm left of the base."

How these fit, with the counter at the back of the 372-deep sink recess (y = 5751) and its front-wall leg's front at 5141:

- The front-wall leg's 1190 inner edge matches the model: the counter ends at x = 805, within 5 of the 800 drawn.
- Confirmed: 2125 of counter (its inner edge) then 630 of fridge cabinet, so the "215" was 2125. The left leg's inner edge runs from y = 3016 to 5141 and the light-switch wall is at 2386; both now drawn.
- What the 105 cm is measured from isn't known yet: perhaps how far the counter carries on past the base units under it.
- The sink recess's left edge (taken as the kitchen recess's back wall, x = −995, so the L of units turns into it) and its top (about 1990) are estimates.

### Other open points

- Option 11's doors are only on the part of its side clear of the bench; doors along the whole side would need the bench to stop short of it.
- The fit check for the things to store counts the space behind the bench line in options 1 to 5 as only bench height.
- The shelfless bay cuts shelves straight across; a real one would want an upright panel at each cut to carry the shelf ends.
- The Window viewpoint faces the sink with the front wall to its left; not confirmed that's what was meant.
- With a small TV, the middle shelves either side sit level with its top edge, not halfway up it.
- A thin brick-coloured strip shows at one edge of the back and front wall views (a window's outer reveal, seen through the wall's thickness).
- Ideas: automated checks (text snapshots of the description, screenshots of the 2D views) and a guided tour through chosen options.
- Tidying: a `.gitignore` for `.DS_Store`, and deleting branches already merged.
