# The Views menu and the rooms: what was decided

Decided and built 21 Oct 2026. Trimmed 22 Oct 2026 to the decision; the
analysis (the old Views list, what was wrong, choices A to E) is in git
(`git show 05f88b7:VIEWS_MENU.md`).

The flat-wide Views menu went: it offered lounge-only views from any room
and moved you to the lounge without saying so. Now:

- Each room button's ▾ lists that room's views: Bird's eye, Plan (2D), its
  four walls in 2D (named as that room's own: `WALL_NAMES` in
  `living_room.js`), its config-defined views and the views saved in it.
  The other rooms' walls are framed and cut by `wallView()` from
  `ROOM_BOXES` (`flat_model.js`).
- Top is gone; Corner is unlisted, kept as Packing's view with no cupboard.
- Save view and Delete view are in the Look menu.
- Dimensions and Door sizes show in a 2D view at the bottom right.
- Downstairs' views are under the Hallway's ▾ ("Downstairs: …").
- Look's Room list is gone: Where and Looking at are the room on screen's.
