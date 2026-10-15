// Saved addresses for the screenshot and round-trip tests, recorded from
// room_3d.html as it was on 12 Oct 2026, before the refactor (REFACTOR_PLAN.md),
// with options 10 and 11's corner cupboard width and depth (CORNER_W,
// CORNER_D) added at the end of the settings on 14 Oct 2026, then option
// 10's side bookshelf (SIDE_SHELF, SIDE_W, SIDE_D), and options 1 to
// 6's upper cupboard and second bay (EXTRA, UPPER) taken out of them.
// The address format is in room_dimensions.md.
//
// Each entry: a name (also the screenshot's file name) and the address to
// load, which must come back unchanged. Old share links needn't keep working
// (agreed 12 Oct 2026), so none are tested.
//
// Scenes from living_room.scenes.js are added by room_3d.spec.js itself, so a new
// scene is tested as soon as it's added (run `npm run test:update` once to
// take its screenshot).

// The bedroom's furniture as it starts (other_room.js, added 15 Oct 2026):
// the bed, the bookcase and the pine cupboard, then the lower recess
// cupboard's depth
const BEDROOM = '1360.0.0-2569.2841.180.1490.290.1220-3682.1901.90.1300.500.1790-301';
// Then the bookshelf (the bedroom's bookcase in place of the bench), off
// (added 15 Oct 2026)
const BOOKSHELF = '0';
// Then the bedroom's mirror (added 15 Oct 2026): on the chimney breast
// (wall 0), its middle 2569 along, its bottom 1400 up, 1000 × 800
const MIRROR = '0.2569.1400.1000.800';
// Then the upper recess cupboard's drawers over its open shelves and
// mirrors on its tall doors, both off (added 15 Oct 2026)
const RECESS_FRONTS = '0.0';
// Then the bookshelf's place, where it starts against the back wall (added
// 15 Oct 2026)
const BOOKSHELF_PLACE = 'wall';
// Then whether the bookcase is in the bedroom, as it is (added 15 Oct 2026)
const BOOKCASE_ON = '1';
// Then the wicker bench (added 15 Oct 2026): its sizes, w.d.h.legs, then
// on.a.b.turn in the hallway (on, against the banister), the bedroom (off,
// at the foot of the bed) and the living room (off, by the middle window)
const WICKER_BENCH = '920.410.450.80-1.1470.1372.0-0.1360.1985.0-0.3686.2910.90';
// The default settings after the option and the left-wall depth, the default
// places of the things to store, and the default view
const REST = `330-1200-3-250-780-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18-800-650-0-400-330-${BEDROOM}-${BOOKSHELF}-${MIRROR}-${RECESS_FRONTS}-${BOOKSHELF_PLACE}-${BOOKCASE_ON}-${WICKER_BENCH}`;
const STORED = '0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1';
const VIEW = 'birdseye.sit-tall.90-0-0-90';
// The page now starts with the Inglesham dresser (dressers.js, 15 Oct 2026);
// the other addresses keep the Chester's sizes, as recorded
const START = REST.replace('-1370.1940.410.830.340-', '-1000.1930.420.830.420-');

// Option codes in the address are not the dropdown's order: 10 is the
// current room, so options 10 and 11 are 11 and 12 (optionCode() in
// room_3d.html). The left-wall depth is what the page picks when you choose
// that option from the default page. There are no options 1 to 6 or 12 to 15
// (taken out), so the list is 7 to 11 and the current room, 16.
const OPTIONS = [
  ['option07', 7, 600],
  ['option08', 8, 600],                     // needs a left-wall cupboard
  ['option09', 9, 0], ['option10', 11, 0], ['option11', 12, 0],
  ['option16-current-room', 10, 0],
];

const ADDRESSES = [
  { name: 'default', address: `#11-600-${START}~${STORED}~${VIEW}` },       // option 10 (code 11), as the page opens
  ...OPTIONS.map(([name, code, left]) => ({ name, address: `#${code}-${left}-${REST}~${STORED}~${VIEW}` })),

  // Option 10's side bookshelf, between the corner cupboard and the TV
  { name: 'option10-side-bookshelf', address: `#11-0-${REST.replace(/-0-400-330-/, '-1-400-330-')}~${STORED}~back.sit-tall.90-0-0-90` },

  // The views: 2D with dimensions, and from places in the room
  { name: 'view-plan', address: `#9-0-${REST}~${STORED}~plan.sit-tall.90-0-0-90` },
  { name: 'view-back-wall', address: `#9-0-${REST}~${STORED}~back.sit-tall.90-0-0-90` },
  // The bedroom's bookcase on the back wall in place of the bench (the last setting, 1)
  { name: 'view-back-wall-bookshelf', address: `#9-0-${REST.replace(`-${BOOKSHELF}-${MIRROR}`, `-1-${MIRROR}`)}~${STORED}~back.sit-tall.90-0-0-90` },
  // The bedroom from above, the mirror on the kitchen-side wall (wall 3),
  // 1400 from the hallway wall, 1200 × 1600 from 300 up
  // The bookshelf there moved out into the room (x 2500, y 2000) and turned
  // to face the left wall (90°)
  { name: 'bookshelf-moved', address: `#9-0-${REST.replace(`-${BOOKSHELF}-${MIRROR}`, `-1-${MIRROR}`).replace(`-${BOOKSHELF_PLACE}-`, '-2500.2000.90-')}~${STORED}~${VIEW}` },
  // The bookcase on the front wall between the sink and the desk instead
  // (front piece 3)
  { name: 'front-wall-bookshelf', address: `#9-0-${REST.replace('.340-0-chester-', '.340-3-chester-')}~${STORED}~${VIEW}` },
  // The bedroom from above without its bookcase (bookcaseOn, 0)
  { name: 'bedroom-no-bookcase', address: `#9-0-${REST.replace(`-${BOOKCASE_ON}-${WICKER_BENCH}`, `-0-${WICKER_BENCH}`)}~${STORED}~birdseye.sit-tall.90-0-0-90.bedroom` },
  { name: 'bedroom-mirror-kitchen-wall', address: `#9-0-${REST.replace(`-${MIRROR}`, '-3.1400.300.1200.1600')}~${STORED}~birdseye.sit-tall.90-0-0-90.bedroom` },
  // The recess cupboards from the bedroom window, the upper one with drawers
  // over its open shelves and mirrors on its tall doors
  { name: 'bedroom-recess-drawers-mirrors', address: `#9-0-${REST.replace(`-${RECESS_FRONTS}`, '-1.1')}~${STORED}~look:bedroomWindow:recessCupboards.stand-tall.90-0-0-90.bedroom` },
  // The wicker bench in the hallway, seen from outside the living room
  // door; then in all three rooms, 1200 long on 150 legs, the hallway's
  // turned to face its far end, the bedroom's under the window and the
  // living room's out in the room
  { name: 'wicker-bench-hallway', address: `#9-0-${REST}~${STORED}~look:hallLivingDoor:hallBench.stand-tall.90-0-0-90.hallway` },
  { name: 'wicker-bench-every-room', address: `#9-0-${REST.replace(`-${WICKER_BENCH}`, '-1200.410.450.150-1.1800.1800.90-1.200.1425.270-1.2000.2500.0')}~${STORED}~${VIEW}` },
  { name: 'view-packing', address: `#9-0-${REST}~${STORED}~packing.stand-tall.0-170-170-90` },
  { name: 'view-desk', address: `#9-0-${REST}~${STORED}~desk.sit-tall.90-0-0-90` },

  // Board thickness, at both ends of its slider: the cupboards' outside
  // sizes stay put, and the boards eat into the inside
  { name: 'board-25-option07-packing', address: `#7-600-${REST.replace(/-18-800-650-/, '-25-800-650-')}~${STORED}~packing.stand-tall.0-170-170-90` },
  { name: 'board-12-option09-plan', address: `#9-600-${REST.replace(/-18-800-650-/, '-12-800-650-')}~${STORED}~plan.sit-tall.90-0-0-90` },

  // Nearly every setting away from its default, so each field of the
  // address is read and written back (refactor step 3). Checked against the
  // code before step 3: the same address, description and picture.
  { name: 'settings-option07-no-bench', address: '#7-500-450-1200-1-200-700-900-900-400-600-0-5-0-0-3-43-0-1000.1800.350.800.250-2-chester-2-none-1900-1100.1950.510-1690.1000.920-0-900-300.900.1500-0-1000.2000.170-25-1200-900-0-800-150-2000.500.90-1000.2000.0.1000.250.1000-500.500.270.1000.400.2000-450-0-2.1500.900.600.1200-1.0-1200.300.180-1-1000.500.500.100-0.2000.2000.180-0.1000.1500.90-0.1000.3000.270~1.3.2_100.100.1_200.900.0_300.1000.0.400_400.400.1_500.500.0_600.600.0_700.700.1~plan.sit-tall.90-0-0-90' },
  { name: 'settings-current-room', address: `#10-0-330-1200-2-250-800-600-900-400-600-0-0-0-0-1-86-1-1370.1940.410.830.340-0-chester-3-merton-3000-1100.1950.510-2600.1200.1100-1-600-600.1200.1800-600.1200.1800-1395.3571.0-12-800-1200-1-200-800-${BEDROOM}-${BOOKSHELF}-${MIRROR}-${RECESS_FRONTS}-${BOOKSHELF_PLACE}-${BOOKCASE_ON}-${WICKER_BENCH}~0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1~birdseye.sit-tall.90-0-0-90` },
];

module.exports = { ADDRESSES, VIEW, BEDROOM };
