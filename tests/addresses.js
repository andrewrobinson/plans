// Saved addresses for the screenshot and round-trip tests: each a
// configuration and a view (room_dimensions.md has their format), in
// tests/configs/<name>.json. They were recorded from room_3d.html on 12 Oct
// 2026, before the refactor (REFACTOR_PLAN.md), with what's been added
// since, and converted from the old address format, the settings' fields
// joined by "-", on 16 Oct 2026 (step 6b): each read the old way and
// written the new, its snapshot and screenshot unchanged.
//
// Each entry: a name (the file name of its configuration, of its
// screenshot and of its snapshot, tests/snapshots/<name>.json), and what it
// shows. Loaded, each must give its configuration and view back unchanged.
// Old share links needn't keep working (agreed 12 Oct 2026), so none are
// tested.
//
// Configurations from living_room.configurations.js are added by room_3d.spec.js
// itself, so a new one is tested as soon as it's added (run `npm run test:update` once to
// take its screenshot).
//
// Most are option 9, with the Chester dresser's sizes (the page now starts
// with the Inglesham's), the things to store where they start, and the view
// from above (birdseye), unless they say.
const fs = require('fs');
const path = require('path');

const SAVED = [
  // The lounge as it is now (18 Oct 2026), as the page opens
  'default',
  // Option 10 with the bench and the dresser, as the page opened until
  // then: the controls' tests start from it, as they were written for it
  'designed',
  // Each option, from the default page: options 7 and 8 with the 600
  // left-wall cupboard the page picks for them, the current room (option 16)
  'option07', 'option08', 'option09', 'option10', 'option11', 'option16-current-room',
  // Option 10's side bookshelf, between the corner cupboard and the TV
  'option10-side-bookshelf',

  // The views: 2D with dimensions, and from places in the room
  'view-plan', 'view-back-wall',
  // The bedroom's bookcase on the back wall in place of the bench
  'view-back-wall-bookshelf',
  // The pine cupboard on the back wall, in the window corner, beside the bookshelf
  'view-back-wall-pine',
  // The bookshelf there moved out into the room (x 2500, y 2000) and turned
  // to face the left wall (90°)
  'bookshelf-moved',
  // The bookcase on the front wall between the sink and the desk instead
  'front-wall-bookshelf',
  // The bedroom from above without its bookcase
  'bedroom-no-bookcase',
  // The bedroom from above without its mirror, the carpet a light grey (RAL
  // 7035) to show the colour reaches it
  'bedroom-no-mirror-grey-carpet',
  // The bedroom from above, the mirror on the kitchen-side wall, 1400 from
  // the hallway wall, 1200 × 1600 from 300 up
  'bedroom-mirror-kitchen-wall',
  // The recess cupboards from the bedroom window, the upper one with drawers
  // over its open shelves and mirrors on its tall doors
  'bedroom-recess-drawers-mirrors',
  // Downstairs in plan, the internal door open 60° into the stairs' foot
  // and the external door 45° into the lobby
  'downstairs-doors-plan',
  // The shoe rack at the foot of the stairs, seen from halfway down
  'shoe-rack-stairs',
  // The wicker bench in the hallway, seen from outside the living room
  // door; then in all three rooms, 1200 long on 150 legs, the hallway's
  // turned to face its far end, the bedroom's under the window and the
  // living room's out in the room
  'wicker-bench-hallway', 'wicker-bench-every-room',
  // The garage's plan, its things moved, raised and taken out: Sean moved
  // and turned, Billy out, BillyChest in and moved, Yellow down off the
  // scaffold bench onto the floor beside it, Biltong raised above Trellis,
  // Small Billy 25 off the wall and the pine cupboard out
  'garage-moved-plan',
  // The living room's corner cupboard copied into the bedroom, from above:
  // option 7, then option 10, as the page opens
  'bedroom-new-cupboard-option07', 'bedroom-new-cupboard-option10',
  // The sofa in plan, moved towards the left wall (its middle at x 1500,
  // y 2000) and turned 90° to face the right-hand (window) wall
  'sofa-moved-turned-plan',
  // Packing the corner cupboard, its doors open wide and the room door
  // shut; and seated at the desk
  'view-packing', 'view-desk',

  // Board thickness, at both ends of its slider: the cupboards' outside
  // sizes stay put, and the boards eat into the inside
  'board-25-option07-packing', 'board-12-option09-plan',

  // The other rooms' walls in 2D, as the page opens (REFACTOR_PLAN.md item
  // 3, 21 Oct 2026): the bedroom's hallway wall, the garage's back wall,
  // and the hallway's lounge door wall. Their view snapshots say what each
  // shows, which would have caught the garage's wall views coming out empty
  'bedroom-hallway-wall', 'garage-back-wall', 'hallway-lounge-door-wall',

  // Nearly every setting away from its default, so each is read and
  // written back (refactor step 3)
  'settings-option07-no-bench', 'settings-current-room',
];

const CONFIGS = path.join(__dirname, 'configs');
const ADDRESSES = SAVED.map(name => ({ name, ...JSON.parse(fs.readFileSync(path.join(CONFIGS, `${name}.json`), 'utf8')) }));

module.exports = { ADDRESSES };
