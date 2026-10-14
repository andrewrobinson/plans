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
// Scenes from room_3d.scenes.js are added by room_3d.spec.js itself, so a new
// scene is tested as soon as it's added (run `npm run test:update` once to
// take its screenshot).

// The default settings after the option and the left-wall depth, the default
// places of the things to store, and the default view
const REST = '330-1200-3-250-780-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18-800-650-0-400-330';
const STORED = '0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1';
const VIEW = 'birdseye.sit-tall.90-0-0';

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
  { name: 'default', address: `#11-600-${REST}~${STORED}~${VIEW}` },       // option 10 (code 11), as the page opens
  ...OPTIONS.map(([name, code, left]) => ({ name, address: `#${code}-${left}-${REST}~${STORED}~${VIEW}` })),

  // Option 10's side bookshelf, between the corner cupboard and the TV
  { name: 'option10-side-bookshelf', address: `#11-0-${REST.replace(/-0-400-330$/, '-1-400-330')}~${STORED}~back.sit-tall.90-0-0` },

  // The views: 2D with dimensions, and from places in the room
  { name: 'view-plan', address: `#9-0-${REST}~${STORED}~plan.sit-tall.90-0-0` },
  { name: 'view-back-wall', address: `#9-0-${REST}~${STORED}~back.sit-tall.90-0-0` },
  { name: 'view-packing', address: `#9-0-${REST}~${STORED}~packing.stand-tall.0-170-170` },
  { name: 'view-desk', address: `#9-0-${REST}~${STORED}~desk.sit-tall.90-0-0` },

  // Board thickness, at both ends of its slider: the cupboards' outside
  // sizes stay put, and the boards eat into the inside
  { name: 'board-25-option07-packing', address: `#7-600-${REST.replace(/-18-800-650-/, '-25-800-650-')}~${STORED}~packing.stand-tall.0-170-170` },
  { name: 'board-12-option09-plan', address: `#9-600-${REST.replace(/-18-800-650-/, '-12-800-650-')}~${STORED}~plan.sit-tall.90-0-0` },

  // Nearly every setting away from its default, so each field of the
  // address is read and written back (refactor step 3). Checked against the
  // code before step 3: the same address, description and picture.
  { name: 'settings-option07-no-bench', address: '#7-500-450-1200-1-200-700-900-900-400-600-0-5-0-0-3-43-0-1000.1800.350.800.250-2-chester-2-none-1900-1100.1950.510-1690.1000.920-0-900-300.900.1500-0-1000.2000.170-25-1200-900-0-800-150~1.3.2_100.100.1_200.900.0_300.1000.0.400_400.400.1_500.500.0_600.600.0_700.700.1~plan.sit-tall.90-0-0' },
  { name: 'settings-current-room', address: '#10-0-330-1200-2-250-800-600-900-400-600-0-0-0-0-1-86-1-1370.1940.410.830.340-0-chester-3-merton-3000-1100.1950.510-2600.1200.1100-1-600-600.1200.1800-600.1200.1800-1395.3571.0-12-800-1200-1-200-800~0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1~birdseye.sit-tall.90-0-0' },
];

module.exports = { ADDRESSES, VIEW };
