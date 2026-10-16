# Room dimensions

The room, door, door frame and ceiling as modelled in [floor.js](floor.js) and [living_room.js](living_room.js), followed by every dimension the model uses. All sizes are in mm.

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

Its sizes below are where its sliders start. The menu's **Dresser** dropdown sets them to a listed dresser (the first estimate, the Chester Large Dresser: 1370 wide, 1940 high, base 410 deep and 830 high, upper part 340 deep, or the Inglesham Small Dresser: 1000 wide, 1930 high, 420 deep throughout, base 830 high); the list is in `dressers.js`, for editing.

**Options 1 to 6** (the side cupboard with open shelves, the side cupboard with door above bench, the upper open shelves and upper cupboard on the bench, the longer upper cupboard, and the L with open shelves) were taken out on 14 Oct 2026, so the option list starts at 7. Their address codes (1 to 6) now read as none, and the page keeps its own option.

**Cupboard only, with dimensions** (the switch at the top of the menu's corner cupboard section) hides the rest of the room, so the chosen option's cupboard (bar its bench) stands on its own, with its dimensions in the 3D views and the 2D ones alike: along the back wall and out from it, the edges of its outline in plan (not the panels' thicknesses), each chain with the overall size outside it, and up, the shelves inside it and its height. The 2D views frame it to fill the screen. Its doors are left out of the measuring, as they may be open; shelf heights are the model's (600, 1200 and 1800), not decided ones.

**Option 7's** back-wall leg has its own depth (**Single-door cupboard depth**, 330 to 1000, starting at 600), as option 9's double-door cupboard does, so it can stand deeper than the bench, which stays at the back-wall cupboard depth; the left-wall leg runs on from its front. Links from before keep it at the back-wall depth. Choosing option 7 with no left-wall cupboard gives a 600-deep one (which can be taken away again).

**Option 7's shelves** are set in the menu, as lists of shelf tops in mm: one for the back-wall leg (with the inside corner), one for the left-wall leg (600, 1200 and 1800 in each, to start with). As before, a shelf is cut back where something stored stands up through it. **Things to store** can stand **off the floor** (the menu's *Off the floor* for each), as on a shelf: drawn there, not cutting a shelf they rest on, and fitting only if their top is under the cupboard's. Both are in the address (shelves after the other settings; a thing's height as a fourth number after its x, y and turn, left out at 0).

**How the cupboards are built** (14 Oct 2026). Every cupboard is made of boards `BOARD` thick (18 to start; the **Board thickness** slider, 12 to 25), each named, **including rear panels against the walls**, so no leg of a cupboard leans on a wall. Outside sizes stay as set, so thicker boards take room from the inside. The rule, which the cutting list states at its head:

- **Rear panels** (against the walls) and **ends** (exposed sides) run full height.
- **In a corner** the back-wall rear panel runs through; the left-wall rear panel stops at it. For option 7's 1200 × 1200 L at 18: 1200 × 2443 and 1182 × 2443.
- **Tops, bottoms and dividers** fit between them; option 8's top and bottom run out to its diagonal front.
- **Shelves** fit inside; **doors** cover the front edges, 3 clear.
- Exceptions: option 10's left-wall rear panel stops behind its doors; option 11's end facing the kitchen runs across the left-wall rear panel. Option 9's shelving tower and option 10's side bookshelf have rear panels of their own.

The inside of each cupboard therefore starts a board out from each wall; the description gives it (e.g. option 7 as it starts: 1164 × 564 along the back wall and 564 × 600 along the left wall, 2407 high), and the things to store are packed and checked against it. **Show cutting list** (bottom left, in the 2D views) lists every board by kind (panels, doors, shelves) and size, length × width, with what each is for. Parts not `BOARD` thick (option 9's tower plinth and oak shelves) are left out of it.

**The bench** can be left out, in any option (the **Bench** switch, first in the menu's back wall section, then the bench height): with it off, the bench (or option 9's base cupboards) isn't drawn, and nor is anything above it (TV and shelves), whose settings hide till it's on again. The options' descriptions then say there's no bench.

**Larders.** The front-wall spot can hold the dresser, a larder, the bookshelf (a bookcase like the bedroom's, centred there with its back to the wall, at the bedroom one's sizes, which its sliders there also change) or nothing (the menu's **On the front wall**), in every option but the current room. In the address the front piece is 0 dresser, 1 larder, 2 nothing, 3 bookshelf. The larders are in `larders.js`, for editing, their fronts stacked from the floor up as read from the product photos: the **Chester Double Larder** (1100 wide, 1950 high, 510 deep: four drawers on short legs under an oak top, then a pair of doors and a cornice) and the **Stow Narrow Single Larder** (670 wide, 1860 high, 500 deep: on a plinth, a lower door, a drawer and a tall upper door, both doors hinged on the right). Sliders resize the larder chosen, as the dresser's do (width 400 to 1500, height 1500 to 2400, depth 300 to 700): a change of height goes on its tallest doors, and a shallower top section stays as much shallower; the dropdown then says Custom. A larder takes the dresser's colour.

**Options 12 to 15** (the dresser or the larder as the corner cupboard, against the back wall or the left wall) were taken out on 14 Oct 2026 too. The current room keeps its number, 16, and its address code, 10; codes 13 to 16, for the options taken out, now read as none.

**The island** can be moved in any option (the menu's **Kitchen island**): out there (where it is now), or against the front wall between the sink and the desk in place of the dresser or larder, either long side out, its end against the wall and against the end of the kitchen counter (770 along the wall, x 800-1570, coming 1260 out to y 4119), or short side out, its long side along the wall, centred on the 1415 there (1260 along the wall, x 878-2138, coming 770 out to y 4609), or **None**, not there at all. "The island" is in Looking at. Out there, three sliders move and turn it: **its middle from the left wall** (x, 0 to 3838) and **from the back wall** (y, 0 to 5379), starting where it is (x 1395, y 3571), and **how far it's turned** (0 to 180° about its middle, starting at 0). They show only while it's out there. In the address they come after the shelves, as `x.y.turn` (e.g. `1395.3571.0`); links from before keep the island where it is. **The board thickness** (the menu's corner cupboard section, 12 to 25, 18 to start) comes after the island; links from before keep 18. **Options 10 and 11's corner cupboard width** and then **depth** come last before the first `~`.

**A sofa** can be added in any option (the menu's **Sofa, facing the TV**), from `sofas.js`, for editing: the Habitat x Morris & Co. **Merton 2 Seater** (1690 wide, 1000 deep, 920 high, seat 505 high and 650 deep; its arm and leg heights estimated). Sliders resize it (width 1200 to 2600, depth 700 to 1200, height 700 to 1100), the seat keeping its depth and height; the dropdown then says Custom. It's centred on the TV, facing it, its front a slider's distance from the TV wall (1000 to 3500, starting at 1900, where its back is 41 short of the island's end). Its **X** and **Y** sliders move it about the room (its middle, in mm from the left wall and the TV wall) and **Sofa turned** turns it about its middle in quarter turns: 0° faces the TV wall, 90° the right-hand (window) wall, 180° the front wall, 270° the left wall (360° is 0° again). The first move starts from where it stands; once moved, the front slider hides, and **Reset location** puts it back centred on the TV. **Sitting on the sofa** is in Where, and "the sofa" in Looking at.

**Scenes**, to show people the options: everything on show bar where you're looking from (the option, the dresser, larder, island and sofa, what's above the bench, sizes and colours). The **Scenes** menu (the green ☰ at the bottom right; at the top right, the views list in the purple ☰ and where you are and what you look at in the blue ☰ under it; the option is in the settings drawer's corner cupboard section; and the page opens on Bird's eye unless its address has a view) has those in `living_room.scenes.js` (the same on every device; it says how to add one) and those kept with **Save scene** (on that device only; **Delete scene** removes one). Choosing a scene loads the page again with its settings, keeping the view. The list shows the scene on screen, or "Your scene (not saved)" once anything's changed. `kit/scene_kit.js` does this and is meant to serve other rooms too. On the front wall between the sink and the desk, a bit like the Cotswold Company's Chester Dove Grey large dresser. Drawn in options 7 to 11, not in the current room. Painted parts are in the dresser colour, which is the cupboards' unless you choose another; the top and shelves are in the shelf colour.

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
| Option | `option` | 7–11, 16 (16 is the current room, with no cupboards: a bench along the whole back wall, with the Bench switch on) | 10 | Which cupboard layout. Options 10 and 11 (*Corner cupboard, doors facing the kitchen* and *…facing the windows*) are a full-height cupboard in the corner, `CORNER_W` (800 to start) along the back wall and `CORNER_D` (650 to start) out along the left wall, with the bench from it to the right-hand wall: 10 has a pair of doors on its end facing the kitchen, 11 a pair on its side facing the windows, where it's clear of the bench (y R to F). The left-wall cupboard depth doesn't apply to them |
| Left-wall cupboard depth | `T` | none, or 300 to 800 in 10s (slider; none is at its far left) | none (0) | How far the left-wall cupboard comes out from the left wall. Everything along the back wall starts from x = T. At 0 there's no left-wall cupboard, and option 8 isn't available |
| Left-wall cupboard front | `F` | 1200, 1329 | 1200 | How far the left-wall cupboard comes out from the back wall. 1329 is up to the door frame |
| Rear wall cupboard depth | `R` | 300 to 800, in 10s (slider) | 330 | How deep the bench and the back-wall cupboards are, from the back wall |
| Back-wall leg width | `LEG` | 400 to 1200, in 50s | 600 | Option 7 only: inside leg of the full-height L along the back wall. Its door is LEG − BOARD − 6 wide (576 at 18), and the bench starts at x = T + LEG |
| Double-door cupboard width | `WARD` | 600 to 1400, in 50s | 900 | Option 9: width of the full-height double-door cupboard on the back wall. Each door is (WARD − BOARD − 9) / 2 |
| Double-door cupboard depth | `WARD_D` | 330 to 1000, in 10s | 600 | Option 9: its depth from the back wall, independent of the bench |
| Shelving tower width | `TOWER` | 0 to 600, in 50s | 400 | Option 9: the open shelving tower beside it, R deep (0 for none) |
| Board thickness | `BOARD` | 12 to 25, in 1s | 18 | The thickness of every cupboard board: rear panels, ends, tops, bottoms, shelves and doors. Outside sizes stay as set, so it takes room from the inside (see *How the cupboards are built*). The dresser and larders keep their own 18s, as bought furniture |
| Corner cupboard width | `CORNER_W` | 500 to 1200, in 10s | 800 | Options 10 and 11: the full-height corner cupboard's width along the back wall; the bench starts at it. Option 10's doors are each (CORNER_W − BOARD − 9) / 2 (391 at 800) |
| Corner cupboard depth | `CORNER_D` | 0 to 1329, in 1s | 650 | Options 10 and 11: how far the corner cupboard comes out along the left wall (1329 is up to the door frame), shown in place of the left-wall cupboard front's 1200 / 1329 buttons, which stay for the other options. Too shallow to build (under 2 × BOARD + 1 for option 10, room for its left-wall rear panel and doors; under R + BOARD + 10 for option 11, to leave room for its doors beside the bench), the cupboard isn't drawn and the description says so. Option 11's doors are each (CORNER_D − R − BOARD − 9) / 2 |
| Show side bookshelf | `SIDE_SHELF` | on, off | off | Option 10: a full-height open bookshelf on the back wall between the corner cupboard and the TV, x CORNER_W to CORNER_W + SIDE_W, sharing the cupboard's side (with a side of its own where it's deeper than the cupboard). Five lit shelves evenly up it. The bench, and the TV's clear wall, start past it. Its boards (rear panel, sides, top, bottom, shelves) are part of the cupboard, so they're in its cutting list. Not in option 11, whose doors open where it would stand |
| Side bookshelf width | `SIDE_W` | 200 to 800, in 10s | 400 | Option 10, with the side bookshelf on: its width along the back wall. Its top, bottom and shelves are SIDE_W − BOARD long |
| Side bookshelf depth | `SIDE_D` | 150 to 800, in 10s | 330 | Option 10, with the side bookshelf on: its depth from the back wall |
| Bench height | `BENCH` | 700, 780, 800, 900 | 780 | Height of the bench top. Everything above the bench moves with it |
| Above the bench | `above` | Nothing, Shelves, TV, TV and shelves, TV and top shelf | TV and shelves | What's on the back wall over the bench |
| Shelf depth | `shelfDepth` | 150 to 400, in 10s | 250 | Depth of the shelves above the bench |
| TV size | `tv` (slider) | 32, 40, 42, 43, 48, 50, 55, 60, 65, 70, 75, 77, 83, 85, 86 inches | 75 | The TV's overall width and height, `TV_W` × `TV_H`, from LG UK's size guide: 720 × 440 at 32" up to 1930 × 1110 at 86" (75" is 1680 × 960). Shown when there's a TV above the bench |
| Cupboard colour | `colours.cupboard` | Named colours to compare (◀ ▶ flip between them): Clerkenwell Gloss White, AI Olive, Bella Brittany, Blinds as drawn, Kitchen worktop, Kitchen island, Kitchen island top, same colour as the door (Pure Brilliant White), same colour as the walls (Crown Gallery White). Or "Other colours…", which opens a second dropdown of 23 popular cupboard colours and all 99 RAL Classic colours by family | AI Olive | Covers carcasses, doors and the bench. Floor, walls and woodwork are fixed as the room is. Screen colours are approximate |
| Dresser colour | `colours.dresser` | The same named colours and "Other colours…" as the cupboards, plus Same as the cupboards (0), Same colour as the door (2) and Same colour as the walls (1) | Same as the cupboards | The dresser's painted body, doors and drawers. Its top and shelves follow the shelf colour |
| Dresser sizes | `dresser` (sliders) | Width 900 to 1415 in 5s, height 1500 to 2400, base depth 300 to 600, base height 700 to 1000, upper depth 150 to 600 (no deeper than the base), all in 10s | 1000, 1930, 420, 830, 420 (the Inglesham; see `dressers.js`) | The dresser stays centred between the end of the kitchen counter and the desk recess; its three shelves spread evenly up the upper part. Hidden for the current room |
| Carpet colour | `colours.carpet` | From the doorway photo (0, `#B5A499`), From the room photos, lighter (13, `#ABA5A0`, greyer), From the room photos (12, the darker `#8F8780` it was drawn in first), or Cormar Dormouse swatch (11, `#A2907C`, browner); ◀ ▶ flip between them. Or "Other colours…", any RAL colour as for the cupboards | From the doorway photo | The bedroom's and the stairs' carpet, Cormar Hampstead in Dormouse. Its colour is from the user's photo from the bedroom doorway (15 Oct 2026): the carpet's `#99806C` there, corrected channel by channel, in linear light, by the woodwork's `#D2C3B0` there to the woodwork's `#F8F8F6`. Screen colours are approximate |
| Shelf colour | `shelfWood` | 0 As drawn (pale oak `#D6BC8F`, option 9's oak `#C8A26B`), 1 Honey oak (as the island top, `#D6A562`), 2 Dark oak (`#8A5A33`), 3 Walnut (`#5C3D26`) | 0 | All the wooden shelves (above the bench, option 9's tower) and option 9's oak bench top |
| Left-wall cupboard door | slider | 0°–110° | 0° | How far it's opened |
| Second door(s) | slider | 0°–110° | 0° | The option's other door or doors |
| Room door | slider | 0°–110° | 90° | How far it's opened |
| Bedroom door | slider | 0°–180° | 90° | How far it's opened, into the bedroom |
| Internal door (yours), downstairs | slider | 0°–90° | 0° | The flat's own door, into the stairs' foot; at 90° it lies along the back wall |
| External door, downstairs | slider | 0°–90° | 0° | The shared lobby's outside door, into the lobby; at 90° it lies along the lobby's side wall |

The full list of the address's fields, in order, with how each is checked, is `ADDRESS` in `living_room.js`; new fields go at its end. The page address records the option (by its code: 7 to 9 for options 7 to 9, 10 for the current room, 11 and 12 for options 10 and 11; 1 to 6 and 13 to 16, for the options taken out, read as none) and the settings, joined by `-`:

`#option-T-R-F-above-shelfDepth-BENCH-LEG-WARD-TOWER-WARD_D-floor-cupboard-wall-woodwork-shelfWood-tv-dresserColour-dresserSizes-frontPiece-larder-island-sofa-sofaFront-larderSizes-sofaSizes-benchOn-LEG_D-backShelves-leftShelves-islandMove-BOARD-CORNER_W-CORNER_D-SIDE_SHELF-SIDE_W-SIDE_D-bed-bookcase-pineCupboard-recessLowerD-bookshelfOn-mirror-recessFronts-bookshelfMove-bookcaseOn-wickerBench-hallBench-bedroomBench-livingBench-pineCupboardOn-pineOn-pineMove-mirrorOn-carpet-shoeRack-newCupboardOn-sofaMove~stored~view`

The last three (added 15 Oct 2026): the pine cupboard in the bedroom (1 or 0); on the living room's back wall in place of the bench (the **Pine cupboard** switch under The back wall, 1 or 0), as the Bookshelf is; and its place there, `wall` where it starts (its back to the back wall, in the corner by the right-hand wall, at its bedroom sizes) or `x.y.turn`. With both it and the bookshelf on, the bookshelf starts centred on the clear wall up to the pine cupboard, or against the cupboards if it's wider than that.

Then (added 15 Oct 2026) the bedroom's mirror there or not (its **In the bedroom** switch, 1 or 0), and the carpet's colour (`colours.carpet`, 0 for its colour in the doorway photo).

Then (added 15 Oct 2026) the shoe rack downstairs, `w.d.h.along.across.turn` (see "The shoe rack" below).

Then (added 16 Oct 2026) the **New cupboard** in the bedroom, 1 or 0 (off to start): whatever the option list and Cupboard options build in the living room's corner, bar its bench, copied into the bedroom's corner where the chimney breast's face meets the kitchen-side wall (where the pine cupboard and the bookcase meet). It's turned half round, so the living room's back wall runs along the chimney breast and its left wall along the kitchen-side wall: the only way into that corner without mirroring it. It takes the pine cupboard's place: while it's on, the pine cupboard is hidden and its **In the bedroom** switch can't be used, keeping its setting for when the New cupboard goes. It doesn't move the bookcase, which it can overlap. "The new cupboard" is in Looking at.

Then (added 16 Oct 2026) where Sean and Billy stand in the garage, each `x.y.turn` (see "The garage" below).

Sizes of one thing are joined by `.` (dresserSizes `w.h.baseD.baseH.upperD`, larderSizes and sofaSizes `w.d.h`, shelves as their tops, islandMove `x.y.turn`, sofaMove `x.y.turn` (its middle, quarter turns) or `tv` where it starts; the bedroom's bed `u.v.turn`, bookcase and pineCupboard `u.v.turn.w.d.h`, see below). For example, option 7 with a 600-deep left-wall cupboard and everything else as it starts: `#7-600-330-1200-3-250-780-600-900-400-600-0-4-0-0-0-75-0-1000.1930.420.830.420-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18-800-650-0-400-330-1360.0.0-2569.2841.180.1490.290.1220-3682.1901.90.1300.500.1790-301-0-0.2569.1400.1000.800-0.0-wall-1`. After the first `~` are the things to store: `shown.packing.where` (shown 1 or 0; packing 0 to 3 as listed; where 0 by the window, 1 in the corner cupboard, 2 moved by hand), then `x.y.turned` for each, in the order of the table below, with a fourth number for its height off the floor when it isn't 0; they're used when they've been moved by hand. A colour code of 0 means the default (the room as it is now); 1 to 12 are the room's finishes, the named cupboard colours below and the carpet's two, and four-figure codes are RAL colours. After a second `~` is the view, so a shared link shows just what was on screen: a view's id (as `desk`, `plan` or `look:desk:tv`), or for anywhere else `cam`, `walk` or `seat` and the camera's place and aim in mm and its angle across, joined by `:`; then `.` and the eye height, `.` and the room door's, left-wall cupboard's, option's own, bedroom's, internal (downstairs) and external door angles, joined by `-` (links without the later ones leave those doors as they start), and, unless it's the living room, `.` and the room chosen (`hallway`, `bedroom` or `downstairs`). For example `~look:desk:dresser.sit-tall.90-0-0`, or `~birdseye.sit-tall.90-0-0.bedroom`. Old links needn't keep working (agreed 12 Oct 2026).

## The garage

Added 16 Oct 2026, in [garage.js](garage.js): 5327 long, 2866 wide, 2432 to
the ceiling (the user's). Where it is: scaled off the user's site plan,
square to the flat (the plan has it turned about 20°), its door on the end
facing the driveway, towards the flat: its middle about 28 m out past the
back wall and 11 m to the right looking out (`SITE_PLAN` in garage.js),
its floor at the lobby's level. Its door is estimated: a standard single up-and-over
door, 2134 wide and 1981 high, centred. Its own coordinates: **x** from its
back wall (0) to its door (5327), **y** from the right-hand wall looking in
(0) to the left-hand wall (2866); its corner is `GARAGE_CORNER`.

In it, each drawn as a bookcase and placed by the middle of its back, in
quarter turns (0° faces the left-hand wall, 90° the back wall):

| | Width | Depth | Height | Starts (chosen) |
|---|---|---|---|---|
| Sean | 2500 | 535 | 1575 | along the right-hand wall, in the back corner (`1250.0.0`) |
| Billy | 800 | 280 | 2020 | against the back wall, in the other corner (`0.2466.270`) |

## The other room (the bedroom)

Drawn since 15 Oct 2026: its walls, door, window, floor and ceiling in
[floor.js](floor.js) (`OTHER_ROOM`), its furniture and fitted cupboards in
[other_room.js](other_room.js). It has its own coordinates, as it was
measured: **u** along the hallway wall from the window wall (0) to the
kitchen-side wall (3682), **v** from the hallway wall (0) to the chimney
breast's face (2841) and the recess's back (3189). Its corner (u 0, v 0) is
at living room x −4827, y 2521 (`OTHER_ROOM_CORNER`), with u along x and v
along y. Measured and estimated sizes are in `MEASUREMENTS_NEEDED.md`
("Where it's got to") and each constant's comment.

| What | Size | Source |
| --- | --- | --- |
| Room, window wall to kitchen-side wall | 3682 | Measured (H) |
| Hallway wall to chimney breast face | 2841 | Measured (J) |
| Chimney breast, from the kitchen-side wall | 1858, so the recess is 1824 wide | Measured (L) |
| Recess back | 3189 from the hallway wall | Upper recess cupboard's front 2769 + its 420 depth, measured |
| Ceiling | 2445 | Lower recess cupboard 820 + upper one 1625, measured |
| Window | 655 from the hallway wall, 1540 wide, sill 990 (25 thick), top 2270; its reveal 250 deep and sill 290 from the glass | Measured (N, P, T, U, AP, AQ) |
| Window sill | 1590 across, centred on the window | Measured |
| Radiator | 1000 wide × 600 high × 105 thick, 270 off the floor (top at 870, 95 under the sill), front 135 out from the wall; 290 from the window's hallway side, 255 from the other | Measured |
| Door | 60 from the kitchen-side wall, 760 wide, in a 150 wall; hinged away from the kitchen, opening in | Measured (Q, as 50 or 60; R; G); its frame as the living room's |
| Where it sits | Its hallway wall behind the hallway's stepped-back wall (C + AC + G = 2521), its kitchen-side wall 150 behind the kitchen recess (F, taken as G as it can't be reached). So its recess's back is at 5710, 41 short of the living room's sink recess | Measured, but for F |

Its furniture, each with sliders in the **Bedroom options** drawer (its
button in the top bar; the bookcase and pine cupboard resized as well as
moved, and each piece turned in quarter turns, 0° to 270°). The back
wall's **Bookshelf** switch (in Other options, beside **Bench**) stands a
bookcase like the bedroom's on the living room's back wall in place of the
bench and what's above it, centred on the clear wall as the TV is, at the
bedroom one's sizes; the Bench switch is then off and can't be changed
until the bookshelf's off again. It's in the address after the bedroom's
furniture, `bookshelfOn`, 1 or 0. While it's on, three sliders under the
switch move it round the living room: **its back's middle from the left
wall** (x, 0 to 3838) and **from the back wall** (y, 0 to 5379), and how
far it's **turned**, in quarter turns as in the bedroom (0° facing the
front wall, 90° the left wall, 180° the back wall, 270° the right wall).
They start where it stands against the back wall, and **Reset location**
puts it back there. They come after the recess cupboards' switches in
the address, `bookshelfMove`: `x.y.turn`, or `wall` where it starts (links
from before keep it there).

The bookcases in each place are independent (asked for, 15 Oct 2026): one
can be on the back wall, one on the front wall (the **On the front wall**
choice) and one in the bedroom, in any mix, all at the bedroom one's sizes.
The bedroom's has an **In the bedroom** switch under its heading in
Bedroom options; it's the address's last field before the first `~`,
`bookcaseOn`, 1 or 0 (links from before have it there).

Each piece has **Reset dimensions** and **Reset location** buttons (the
bed only the second, the recess cupboards only the first), back to where
and how big it starts. The **mirror** hangs on a wall chosen in the drawer:
the chimney breast's face (not the recess beside it), the hallway wall, the
window wall or the kitchen-side wall. Its **middle** slider runs along that
wall, from the window wall for the first two and from the hallway wall for
the others, and a new wall keeps it as far along as the wall allows; its
**bottom** is off the carpet. It comes after `bookshelfOn` in the address,
as `wall.along.bottom.w.h`, the wall 0 to 3 in that order (e.g.
`0.2569.1400.1000.800`). "The mirror" is in Looking at. It has an **In
the bedroom** switch too, `mirrorOn` in the address, 1 or 0; switched off,
Looking at it still aims at its spot.

The **recess cupboards** have two switches for the upper one: **drawers
over the open shelves** (as many as fit at about the height of the three
below: three, 215 high, from 1400 to 2045), and **mirrors on the tall
doors** (one on each, 60 in from its edges: chosen). They come after the
mirror in the address, `drawers.mirrors`, each 1 or 0. The pieces:

| Piece | Size (w × d × h) | Starts at (its back's middle, u, v; facing) |
| --- | --- | --- |
| Bed, base 350 high, mattress 260 on it, headboard 25 thick and 950 high | 1360 × 1940 | 1360, 0 (head on the hallway wall, 680 from the window wall, measured); 0° |
| Bookcase, dark brown | 1490 × 290 × 1220 | 2569, 2841 (back to the chimney breast, from the recess); 180° |
| Pine cupboard, 60 off the wall (it stands 560 out) | 1300 × 500 × 1790 | 3682, 1901 (back to the kitchen-side wall, up to the bookcase); 90° |
| Recess cupboards, fixed: upper 1800 wide, 420 deep, 1625 high; lower 820 high | lower 301 deep, its slider 150 to 800 | In the recess, centred |
| Mirror, a 30 dark frame standing 25 off the wall (none there yet: size and place chosen) | 1000 × 800, each 200 to 2000 | On the chimney breast over the bookcase, its middle 2569 from the window wall, its bottom 1400 up (180 over the bookcase) |

A piece's place is the middle of its back (the bed's head end), so a new
size keeps it against its wall; it turns about that point: 0° faces away
from the hallway wall, 90° the window wall, 180° the hallway wall, 270°
the kitchen-side wall. Nothing stops a piece going through a wall.

## The hallway

Drawn 15 Oct 2026, in [floor.js](floor.js) (`HALLWAY`), in the living
room's x and y, from the measure sheet's letters. Its walls are faces seen
from inside only, as the bedroom's, so the bird's eye looks in.

| What | Size or position | Source |
| --- | --- | --- |
| The living room door's wall | 150 thick, so the hallway starts at x −150 | Measured as about 150 (B); the living room draws it 100, so the doorway is lined through the other 50 |
| Kitchen side, opposite the stairs | y 2221 | Measured from the back wall's line (C) |
| Step back at the bedroom's door | 150, at x −1200 (1050 along from the door wall) | Measured (AC, E) |
| The bedroom's wall, hallway side | y 2371, 150 thick (G), so the bedroom's side is at 2521 | Measured (C + AC, G) |
| The banister | y 1312, 909 from the kitchen side, its rail flush with its base's hallway face (y 1372) | Measured (AB; D gives 1317) |
| The far end, the WC wall | x −2480, 2330 along | Measured (Y), to check: the drawing scales 3360 |
| The stairwell | 900 wall to wall, y 122 to 1022; along its hallway side a 110 ledge, then a 240 box (150 high) the banister stands on, to y 1372 | Measured 15 Oct 2026 (the box's height estimated); the outside wall comes 122 in from the back wall's line, as the drawing has it |
| The sill boards | At the top the opening is wider than the well: on each side a white window-sill board (25 thick) bridges the gap from the well's wall to the hallway floor. Looking down the stairs, on the left (hallway side) one 240 wide, 210 below the hallway floor, from the winders' newel 1650 along (1430 to the hallway's far end, then 220 on into a corner under the WC wall), with the banister's 110 base (150 high) between it and the floor; on the right, against the outside wall, one 120 wide, level with the floor, from the door wall to the far end's wall, so above the floor the outside wall is at y 2, all but in line with the living room's | Measured 15 Oct 2026: the right one 2370 to where the stairs turn, drawn the hallway's 2330 (to check); the boards' thickness and the base's height estimated |
| The WC wall over the well | Stops at the hallway floor's level, its bottom 220 deep, to the left board's corner (x −2700); past it, the bathroom floor's underside | From the left board's length; the depth of the bottom not measured |
| The stairs | Up from the foot: 11 straight steps along the outside wall towards the living room door, 3 winders turning right in a 900 square against the door wall, then 1 more step whose tread is level with the hallway floor. 15 risers of 190, 2850 floor to floor; straight steps 810 wide between 45 strings. The newel at the winders' inner corner, x −1050; the flight's foot at x −3470 | Measured and counted 15 Oct 2026; the going (220) is the drawing's, still to measure |
| Under the bathroom | Past the far end the flight runs on under the bathroom's floor (taken as 300 thick), to its foot | Estimated |
| Floors | The hallway's oak boards, as the living room's, with a metal strip (30 wide) where the top step's carpet meets them; the stairs carpet, as the bedroom | From the photos |
| Banister | Rail at 900, 60 wide; spindles 30 thick, about 120 apart; a 90 newel post at each end | Estimated |
| Ceiling | Not drawn, as asked; the walls go to 2443, as the living room's | Assumed |

### Downstairs: the stairs' foot and the shared lobby

On the first floor, 2850 below the hallway (`floor.js`'s `ENTRANCE`), from
`drawings/first_floor_plan.png` (red: the stairs; blue: the lobby shared
with the downstairs neighbour). All scaled off the drawing (about 8.4 mm a
pixel), so **estimated**, in the living room's mm. The Look menu's Room
**Downstairs** has its places: At bottom of stairs, Outside internal door
and Outside external door; Halfway down the stairs is in the hallway's.
Places can stand on a lower floor (`floor` in `living_room.views.js`).

| What | Where | Source |
|---|---|---|
| The back wall | Inside face at x −4827, in line with the bedroom's window wall; 350 thick | Estimated |
| The stairs' foot | From the bottom step (x −3470) to the back wall, 1357, across the well (y 122 to 1022); oak, as drawn before | Estimated |
| The internal door (the flat's) | In the 150 wall between the foot and the lobby (y 1022 to 1172): opening 760 wide, from 100 off the back wall (x −4727 to −3967), hinged at the back wall's end, opening into the foot, 90° at most (lying along the back wall); 1978 high, frame as the living room's. Between its frame and the bottom step, 497 of floor | Estimated: the drawing's swing |
| The lobby | 970 across (y 1172 to 2142) and 1090 deep (x −4827 to −3737); walls 2550 high (to the floor above's underside); no ceiling | Estimated |
| The external door | In the back wall, 800 wide, 85 in from the internal door's wall (y 1257 to 2057), 2000 high, hinged at the far side, opening into the lobby, 90° at most; its frame at the wall's inside face, 100 deep, a plain reveal beyond; dark blue-grey (colour not known) | Estimated |
| The neighbour's door | In the lobby's far wall (150 thick), 760 wide from 80 in from the internal door's wall, opening away from the lobby: drawn shut | Estimated |
| Outside | Only the back wall's outside face, across the well and the lobby; the ground taken as level with the lobby (not known) | Assumed |

### The shoe rack

At the foot of the stairs, a simple open rack of shelves between two sides
(asked for, 15 Oct 2026; not bought yet), in [shoe_rack.js](shoe_rack.js).
Its section in Other options, **The shoe rack (downstairs)**, has sliders
for its sizes and where it stands, with **Reset dimensions** and **Reset
location**. Looking at offers it downstairs.

| What | Size or position | Source |
| --- | --- | --- |
| Width × depth × height | 600 × 200 × 1200 (sliders 300 to 1200, 150 to 500, 300 to 2000, in 10s) | Asked for |
| Boards | 18 thick; shelves evenly spaced about 200 apart, the lowest one's top 40 off the floor, one at the top | Chosen |
| Where it stands | Its back's middle along from the back wall (0 to 1357, the bottom step) and across from the outside wall (0 to 900), in 5s; turned 0° to 360° in quarter turns, 0° facing the internal door's wall, 90° the back wall | |
| Where it starts | Its back to the outside wall, its near end 50 clear of the internal door as it swings (the 760 door passes the rack's front corner 296 along from its hinge): its back's middle 745 from the back wall, about 310 short of the bottom step | Chosen |

In the address, after `carpet`: `w.d.h.along.across.turn`, each held to its
slider's range. Links from before it have it as it starts.

### The wicker bench

The hallway's bench, a white wicker ottoman with a padded floral lid on four
short turned legs, is in [wicker_bench.js](wicker_bench.js) (called the
wicker bench to keep it apart from the living room's back-wall bench).
There's one, at one set of sizes, but it can be switched on in the
hallway, the bedroom and the living room, each with its own place (asked
for, 15 Oct 2026). Its section in Other options, **The wicker bench**, has its size sliders, then for each room a switch and,
while it's on, sliders for where the middle of its back is and how far
it's turned, in quarter turns, with **Reset dimensions** and **Reset
location**. Looking at offers it in each room.

| What | Size or position | Source |
| --- | --- | --- |
| Length × depth × height | 920 × 410 × 450, to the top of the lid (sliders 400 to 2000, 250 to 800, 250 to 900) | Measured |
| Legs | 80 high (slider 0 to 300, held to leave at least 100 of wicker under the lid), turned, 55 across at the top and 40 at the foot | Height measured; the rest estimated from the photo |
| Lid | 60 thick, a 20 wooden rim under the padded top, 10 proud of the wicker all round | Estimated from the photo |
| In the hallway (on) | Its back to the banister, against the rail's line (y 1372), its near end 20 past the newel post at the top of the flight: its back's middle 1470 from the living room door's wall, facing the kitchen side | From the photo |
| In the bedroom (off to start) | Its back to the foot of the bed, 20 off, centred on it (u 1360, v 1985), facing away from the hallway wall | Chosen |
| In the living room (off to start) | Its back 20 in front of the middle window's radiator (x 3686, y 2910), facing the left wall | Chosen |

In the address, after `bookcaseOn`: its sizes `w.d.h.legs`, then for the
hallway, the bedroom and the living room `on.a.b.turn` (on 1 or 0). The
hallway's a and b are its back's middle from the living room door's wall
and from the outside wall behind the stairs (the living room's y), with 0°
facing the kitchen side and 90° the far end; the bedroom's are its u and v,
turned as its furniture; the living room's are x and y, turned as the
bookshelf. Links from before it have it as it starts.

The bathroom and WC beyond its far end aren't drawn yet. The living
room's wall views leave the hallway out, as its stairwell would hang below
their floor.

## Things to store

Bulky things that the corner cupboard must eventually hold, drawn standing on the floor as plain blocks (the tub as a cylinder). They're hidden to start with; **Stored things** in the menu shows them. In the 2D plan view each can be dragged, and double-clicked or double-tapped to turn it round. A blue outline round them all, labelled with its size, is the floor area they need.

In the menu, **Packing** picks one of the four packings below, and **Where** puts it **By the middle window** (loose on the floor right of the island) or **In the corner cupboard** of the option on show. In the cupboard it's pushed into whichever inside corner, and whichever way round, fits the most; it moves again whenever the option or its sizes change. Anything partly in the cupboard that doesn't fit, because it sticks out or is too tall there, turns red, the outline turns red, and the menu says how many fit and why the others don't. **Pack them again** puts them back after moving them by hand.

In the plan view the cupboard's inside is outlined (a rectangle, or an L of two), green when everything in it fits and red when something doesn't, with its size on the back wall. Over anything that sticks out, the part outside the inside is shaded red and labelled with how far it goes past the inside's edges (or the size of the part outside, when it's in the notch of an L).

**Packing** (in the Views menu) stands you 1250 in front of the corner cupboard's door, at standing eye height, looking in: the option's own doors; in an L (options 7 and 9 with a left-wall cupboard) it stands diagonally in front of the L's inside corner instead, to see into both legs. All the cupboard's doors are opened wide (170°), folded back out of the way, and the room door is shut, as it can hide the cupboard. It follows the option as you change it. With no corner cupboard it's the corner view.

**Views.** The Look menu picks the **Room** (the living room, the hallway or the bedroom), where you are in it and what you're looking at (**Where** and **Looking at**, which offer only that room's), your **eye height** (short or tall, sitting, standing or lying), or a view from the **views list**: config-defined ones, ones saved with **Save view** (kept in that browser, so on that device only), and the built-in ones (from above, and the 2D views). Choosing a room in **Bird's eye** or **Plan (2D)** keeps that view, framing the new room (with its own dimensions in the plan); from anywhere else it takes you in at the room's doorway. Choosing a place in another room's list, or a view of the living room's own, changes the room too. The rooms, places, things to look at, eye heights and config-defined views are in `living_room.views.js`, in mm, for editing; `kit/view_kit.js` does the choosing and is meant to serve other rooms too. **Looks** and **views** are saved apart: the Look menu's **Save** keeps a Where, Looking at and eye height by name (a look aims at its thing wherever it is, so it follows a changed dresser or a moved island; only a look just chosen can be saved, not anywhere moved to by hand), and the Views menu's **Save** keeps the camera's spot and direction, wherever you've got to. Looks can also go in `living_room.views.js` (its `looks`), to be the same on every device. As a person (sitting or standing), dragging looks round where you are, and in the desk chair the chair swivels with you; right-drag, shift-drag, the arrow keys or WASD walk, and scrolling zooms like a lens. From above, dragging swings round the room as before.

### The shelfless bay

While the things are shown, each shelf inside the corner cupboard is cut back across its short way wherever something stands under it that comes within 50 of its underside (things stand on the cupboard's bottom, a board thick; 50 is room to lift them in), with 10 spare either side. What's left of a shelf under 100 long is left out. It follows them as they're dragged, and shelves above the bay stay. The menu lists which shelves are cut, over what, and the shelf left over the bay. Hidden, the cupboard has all its shelves.

A shelf can stay over a thing when its top is at least the thing's height + BOARD + 50 + BOARD (at 18):

| Thing | Height | Lowest shelf top over it |
| --- | --- | --- |
| Long ladder | 1620 | 1706 |
| Folding ladder | 1200 | 1286 |
| Dustpan and hoover | 1000 | 1086 |
| Drying racks | 630 | 716 |
| Yellow tub | 450 | 536 |
| Mop | 290 | 376 |

So in every option the top shelf (1800) stays right across, 1764 clear of the cupboard floor, 144 over the long ladder. The 1200 shelf is cut over the ladders but can stay over the hoover, the racks, the tub and the mop; the 600 shelf is cut over everything but the tub and the mop. With the first packing (850 × 1090 as found, 820 × 1090 with the racks and mop at their new sizes) and a 600-deep left-wall cupboard (T = 600, R = 330, F = 1200, other sliders as they start):

| Options | Shelves | Cut back for the bay | Fit |
| --- | --- | --- | --- |
| 7 | 600, 1200, 1800 in both legs | 600 over x 18–848 and y 582–1048; 1200 over x 18–508 | 5 of 7: both racks stick out |
| 8 | 600, 1200, 1800 | 600 over x 18–848, 1200 over x 18–508 | 6 of 7: rack 2 sticks out |
| 9 | 600, 1200, 1800 in the double-door cupboard and the leg | 600 over x 18–848 and y 582–1048; 1200 over x 18–508 | 5 of 7: both racks stick out (the 580 × 1770 packing leaves only the tub out) |
| 10, 11 (at 800 × 1200) | 600, 1200, 1800 | 600 over y 18–1048, 1200 over y 18–548 | 5 of 7: the hoover and rack 2 stick out |

With boards 18 thick and rear panels against the walls, as checked on 14 Oct 2026: the packing starts a board out from each wall. Without a left-wall cupboard (T = 0), option 7 fits 3 of 7 (rack 1, the hoover and the tub stick out; rack 2 has no room).

The corner cupboard's inside, for each option (shelves are cut back as above; bench tops, dividers and panels count, the rear panels against the walls included, so every inside starts at x = BOARD and y = BOARD):

| Options | Inside |
| --- | --- |
| 7 | Both legs of the L at full height: x BOARD to T + LEG − BOARD and y BOARD to LEG_D − BOARD along the back wall, then x BOARD to T − BOARD on to F − BOARD along the left wall (1164 × 564 and 564 × 600 as it starts) |
| 8 | The corner unit at full height, to 25 behind its diagonal doors |
| 9 | The double-door cupboard (x BOARD to T + WARD − BOARD, y BOARD to WARD_D) and the left-wall leg, at full height |
| 10, 11 | The CORNER_W × CORNER_D corner cupboard at full height, x BOARD to CORNER_W − BOARD (764 at 800 and 18), y BOARD to CORNER_D − BOARD; none when too shallow to build. Option 10's side bookshelf is open, so it's no place to store them |
| 16 (the current room) | None: they stay by the window |

| Thing | Footprint (along x × along y, in the 850 × 1090 packing) | Height | Colour | Notes |
| --- | --- | --- | --- | --- |
| Rack 1 and Rack 2 (drying racks) | 740 × 100 each (740 long, 630 wide, 100 thick, stood on edge) | 630 | `#7B5EA7` and `#9B7FD0`, purples (to stand out from the cupboard) | Placed and turned apart; Rack 2 is last in the address, so links from when they were one 800 × 300 block put it beside Rack 1, within the block |
| Folding ladder | 380 × 220 | 1200 | `#AAB0B6`, aluminium | |
| Long ladder | 100 × 520 (turned) | 1620 | `#8A9199`, darker aluminium | The tallest thing |
| Mop | 380 × 310 | 290 | `#4F86B8`, blue | |
| Dustpan and hoover | 320 × 280 | 1000 | `#B8473A`, red | |
| Yellow tub | 550 across (550 × 550) | 450 | `#F2C230`, yellow | |

Packed as tightly as they go (found by trying every order and turn, with the racks as one 800 × 300 block and the mop at its old 400 × 320 × 1200), they needed **850 × 1090** of floor; with the racks and mop at their measured sizes the same packing takes 820 × 1090, 0.89 m² for 0.79 m² of footprints. The packings' names still give the sizes they were found at. They start like this, loose on the floor right of the island, opposite the middle window (x 2000 to 2850, y 2362 to 3452). The other packings to choose from: 860 × 1080 (0.93 m²); 700 × 1370 (0.96 m²) if one side can be no more than 700; 580 × 1770 (1.03 m²) if one side can be no more than 600. Inside (between its boards), the corner cupboard needs at least one of these floor areas, and 1620 of height for the long ladder.

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

The screen colours each part is drawn in, as set in [living_room.js](living_room.js) and [floor.js](floor.js). The room's light is slightly warm, so on screen they show a little darker and warmer than these values.

| Part | Colour | Notes |
| --- | --- | --- |
| Walls | `#DCDEDB` | Crown Gallery White (finish 1) |
| Door, door frame, window sills | `#F8F8F6` | Dulux Pure Brilliant White (finish 2) |
| Ceiling | `#EDECE7` | Pure Brilliant White, matt |
| Floor | oak boards averaging `#D29A50` | Howdens oak (finish 3), drawn as a texture |
| Carpet (bedroom and stairs) | `#B5A499` | Cormar Hampstead in Dormouse, its colour in the doorway photo (finish 14); or the carpet colour chosen |
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
| Left-wall cupboard door width | F − LEG_D − 6 (option 7), F − WARD_D − 6 (option 9) |
| Inside, each option | In the description, and under *Things to store* above: a board in from each wall |
| Bench, option 8 | from x = T + 700, length 3138 − T, depth R |
| Bench, option 7 | from x = T + LEG, length 3838 − T − LEG, depth R |
| Option 8 diagonal front | from (T, F) to (T + 700, R), length √(700² + (F − R)²), two doors each (length − 9) / 2 |

## Hardcoded dimensions

### Room and doorway

In `floor.js`. Elsewhere in these notes the room's sizes keep their short
names, `W`, `D` and `H`.

| Name in code | Value | What |
| --- | --- | --- |
| `ROOM_WIDTH` (`W`) | 3838 | Room width, back wall to outer wall |
| `ROOM_DEPTH` (`D`) | 5379 | Room depth, back wall to front wall (measured) |
| `CEILING_HEIGHT` (`H`) | 2443 | Ceiling height, measured 2441 to 2446 across the room |
| `WALL_THICKNESS` | 100 | Wall thickness, drawing only |
| `DOOR_FRAME_STARTS_AT` | 1329 | Door frame start, from the back wall |
| `DOOR_HINGE_AT` | 1400 | Door hinge, from the back wall |
| `JAMB` | 71 | Frame width each side (`DOOR_HINGE_AT` − `DOOR_FRAME_STARTS_AT`) |
| `ROOM_DOOR` | 760 | Door width |
| `ROOM_DOOR_H` | 1978 | Door height |
| `FRAME_H` | 2050 | Door frame height |
| `FRAME_END` | 2231 | Door frame end (assumed far side) |
| — | 44 | Door thickness |

### Bench and cupboards

| Name in code | Value | What |
| --- | --- | --- |
| `BOARD` | 18 (a setting, 12 to 25) | Board thickness: rear panels, ends, tops, bottoms, shelves inside cupboards, doors |
| — | 3 | Gap round each cupboard door (doors stop 3 short of floor, ceiling and neighbours, so full-height doors are H − 6 = 2437 high) |
| — | 700 | Inside leg of option 8's corner unit along the back wall (x T to T + 700) |
| — | 600, 1200, 1800 | Shelf tops inside the full-height L and option 8 |
| — | 25 | Option 8: shelves stop this far behind the diagonal front |
| — | 950 to 1250 | Full-height door handles |

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

## Checked against the floor plan

The second floor plan (`drawings/second_floor_plan.png`; see `PLAN.md`)
agrees with these measurements when scaled, though it isn't meant to be
scaled:

| | Scaled from the drawing | Measured here |
|---|---|---|
| Room door frame, from the back wall | about 1470–2270 | 1329–2231 |
| `W`, back wall to outer wall | about 3840 | 3838 |
| `D`, back wall to front wall | about 5380 | 5379 |
| Kitchen recess, beyond the left wall | about 990 | 995 |

On the drawing, the outer wall (three windows) is at the top, the back wall
(bench) on the left, the front wall with the chimney breast on the right, and
the left wall, with the room door, along the room's lower edge. The drawing's
kitchen fittings don't match the room; its walls do. `PLAN.md` has first
estimates for the other room, hallway and stairs, in this room's coordinates.

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
- The shelfless bay cuts shelves straight across; a real one would want an upright panel at each cut to carry the shelf ends.
- The Window viewpoint faces the sink with the front wall to its left; not confirmed that's what was meant.
- With a small TV, the middle shelves either side sit level with its top edge, not halfway up it.
- A thin brick-coloured strip shows at one edge of the back and front wall views (a window's outer reveal, seen through the wall's thickness).
- Ideas: a guided tour through chosen options. (Automated checks are done: the Playwright tests in `tests/`, run with `npm test`.)
- Tidying: deleting branches already merged.
