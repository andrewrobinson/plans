# Working on the plans

## Keep the code readable

- Write new code for a person reading it for the first time: names that say
  what things are, short functions in named steps, and a comment where the
  reason isn't obvious.
- No unexplained numbers. A measurement or a chosen size becomes a named
  constant (or a field of the room's objects, as `KITCHEN.worktopT`), with a
  comment saying where it came from: measured, estimated or chosen. See
  `DOOR_GAP` and `HANDLE_BOTTOM` in `living_room.js`.
- Refactor as you go. When a change makes a function long or repeats a
  sum, split or name it in the same piece of work, or note it in
  `REFACTOR_PLAN.md`. Refactors keep what the page does, checked by the
  screenshot tests with no changes.
