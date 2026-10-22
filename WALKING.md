# Walking around the flat

Proposed on 22 Oct 2026, from the user's ask: "a way of walking around the
flat that works on both desktop and mobile", with keys on the desktop.
Nothing is built yet. Each choice below has a recommendation, and none of
them is agreed yet.

## What there is now

In a person view (a Look, or a view with an eye height), `cameraControls`
in `kit/view_kit.js` already has the start of a walk:

- each press of an arrow key or WASD moves you `STEP` (10 cm), at the same
  height
- dragging turns your head; scrolling zooms like a lens (30° to 100°)
- panning walks you across the floor (on a phone too, with two fingers)

What it lacks:

- the keys can't turn you
- holding a key doesn't walk smoothly
- you go straight through walls and furniture
- a phone has no proper walk
- you can only get into a person view by choosing a Look first

## Choices

1. **Getting into walking.** A **Walk** button in the top bar, next to
   Look. It stands you in the doorway of the room you're in, at standing
   height, facing in. Esc, or choosing a view, leaves it.
   *Recommended:* yes. Look stays as it is.

2. **Desktop keys.**
   - W/S or ↑/↓: walk forward and back
   - A/D or ←/→: turn left and right
   - Q/E: step sideways
   - Shift: walk faster
   - Dragging still looks around.

   *Alternative:* game-style, where A/D step sideways and only the mouse
   turns you. That's fiddlier on a trackpad.
   *Recommended:* the layout above.

3. **Smooth or stepped.** Holding a key walks you at about 1.2 m/s (a
   normal indoor pace, chosen) and turns you at about 90° a second
   (chosen), each frame by the time since the last.
   *Recommended:* smooth. The 10 cm per press goes.

4. **On a phone.** A thumb stick at the bottom left: push up and down to
   walk, left and right to turn. Dragging anywhere else looks around.
   Pinching zooms the lens, as scrolling does on the desktop.
   *Alternatives:* tap the floor to walk there, or ◀ ▲ ▶ buttons.
   *Recommended:* the stick.

5. **What stops you.**
   - (a) Walls only: you stop at walls and can pass through doorways, but
     furniture doesn't block you. That's simple and dependable, and it
     lets you step into a cupboard to look at it closely.
   - (b) Walls and furniture both stop you. Each piece needs an outline
     worked out from the model, and furniture gets in the way of a close
     look.
   - (c) Nothing stops you, as now.

   *Recommended:* (a).

6. **Between rooms.** The lounge, bedroom and hallway are drawn in one
   space, so you can walk from one to another through the doorways.
   - Crossing into a room moves the room button and the Where and Looking
     at lists to it.
   - Walking over the stairs takes you down them to the floor below.
   - The garage is a building of its own: you get there with its room
     button, not on foot.

   *Recommended:* all of that. If the stairs prove fiddly, a first version
   could stop you at the top of them.

7. **Eye height.** Walking uses the eye height chosen in Look. A sitting
   height switches to the same person's standing height while you walk.
   *Recommended:* yes.

8. **The address and saving.** Where you've walked to goes into the page's
   address, as a view moved by hand does now (`kind: 'walk'`), so it can
   be saved as a view or reloaded.
   *Recommended:* yes. Nothing new is needed.

9. **Where the code goes.** A new `kit/walk_kit.js` holds the keys, the
   stick and the stopping at walls. The walls' outlines come from each
   room's data, as named fields. This takes the walking out of
   `cameraControls`, which is long already.
   *Recommended:* yes, with the split noted in `REFACTOR_PLAN.md`.

10. **Tests.** New walk tests on both devices: the keys, the stick, a wall
    stopping you and walking through a doorway. The top bar's screenshot is
    taken again for the Walk button. While building, only these tests and
    the bar's are run.
    *Recommended:* yes.

## Open questions

- Should the walking speed and eye height be settings in the
  configuration, or fixed in the code as named constants?
- Should the doorway where Walk starts you be each room's existing
  entrance place (`entrance(room)` in `view_kit.js`)?
