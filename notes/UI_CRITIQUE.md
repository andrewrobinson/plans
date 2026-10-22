# The page's UI: what was decided

Written 19 Oct 2026, built 21 Oct 2026 (branch `ui-fixes`). Trimmed 22 Oct
2026 to the decisions; the full critique and each step's choices are in
git (`git show 05f88b7:UI_CRITIQUE.md`). The code's comments cite the step
numbers.

| Step | What | Outcome |
|---|---|---|
| 1 | Tell the corner menus apart | Built: *Look ▾* and *Configuration ▴* in words, chips in their menu's colour; the top left ☰ (Other options) stays |
| 2 | Make Reload and Reset safe | Built: both out of the top bar, into Other options' last section, *This page*; Reset in red, asking first |
| 3 | Type a number beside each slider | Built: a box in place of the value, millimetre sliders only (`numberBoxes()` in `kit/controls_kit.js`), held to the slider's range and step |
| 4 | The open drawer follows the room | Dropped: moving between rooms isn't how the page is used |
| 5 | Garage options in sections | Dropped then; it has tabs now (`MENU_TABS.md`) |
| 6 | Find a setting | Put off; in `PLAN.md`'s smaller pieces |
| 7 | One row of rooms in the top bar | Dropped: only Reload and Reset left it |
| 8 | One style of toggle | Built: Stored and See-through are switches |
| 9 | The small things | Built: the title *The flat in 3D*; no drawer label wraps, the detail in its tooltip; Save look and Save view say why they're greyed out. The options keep their numbers |

Not in the plan: a new look (fonts, colours, custom controls), and moving
the corner menus together.
