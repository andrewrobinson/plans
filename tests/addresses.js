// Saved addresses for the screenshot and round-trip tests, recorded from
// room_3d.html as it was on 12 Oct 2026, before the refactor (REFACTOR_PLAN.md),
// with options 10 and 11's corner cupboard width (CORNER_W) added at the end
// of the settings on 14 Oct 2026.
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
const REST = '330-1200-3-250-780-500-700-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0-18-800';
const STORED = '0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1';
const VIEW = 'birdseye.sit-tall.90-0-0';

// Option codes in the address are not the dropdown's order: 10 is the
// current room, so the options listed as 10 to 15 are 11 to 16
// (optionCode() in room_3d.html). The left-wall depth is what the page picks
// when you choose that option from the default page. Options 1 to 6 are left
// out of the option list for now, so their links read as the default option:
// put them back here when they're back.
const OPTIONS = [
  // ['option01', 1, 360], ['option02', 2, 360], ['option03', 3, 0], ['option04', 4, 0],
  // ['option05', 5, 0], ['option06', 6, 0],
  ['option07', 7, 600],
  ['option08', 8, 600],                     // needs a left-wall cupboard
  ['option09', 9, 0], ['option10', 11, 0], ['option11', 12, 0], ['option12', 13, 0],
  ['option13', 14, 0], ['option14', 15, 0], ['option15', 16, 0],
  ['option16-current-room', 10, 0],
];

const ADDRESSES = [
  { name: 'default', address: `#7-600-${REST}~${STORED}~${VIEW}` },        // option 7, as the page opens
  ...OPTIONS.map(([name, code, left]) => ({ name, address: `#${code}-${left}-${REST}~${STORED}~${VIEW}` })),

  // The views: 2D with dimensions, and from places in the room
  { name: 'view-plan', address: `#9-0-${REST}~${STORED}~plan.sit-tall.90-0-0` },
  { name: 'view-back-wall', address: `#9-0-${REST}~${STORED}~back.sit-tall.90-0-0` },
  { name: 'view-packing', address: `#9-0-${REST}~${STORED}~packing.stand-tall.0-170-170` },
  { name: 'view-desk', address: `#9-0-${REST}~${STORED}~desk.sit-tall.90-0-0` },

  // Board thickness, at both ends of its slider: the cupboards' outside
  // sizes stay put, and the boards eat into the inside
  { name: 'board-25-option07-packing', address: `#7-600-${REST.replace(/-18-800$/, '-25-800')}~${STORED}~packing.stand-tall.0-170-170` },
  { name: 'board-12-option09-plan', address: `#9-600-${REST.replace(/-18-800$/, '-12-800')}~${STORED}~plan.sit-tall.90-0-0` },

  // Nearly every setting away from its default, so each field of the
  // address is read and written back (refactor step 3). Checked against the
  // code before step 3: the same address, description and picture.
  // (option 5, left out for now: put back with it)
  // { name: 'settings-option05', address: '#5-450-400-1329-4-300-900-600-800-700-1000-300-700-0-9010-0-0-2-65-7035-1300.2000.450.850.300-1-stow-1-merton-2200-1000.2000.480-2000.900.850-1-800-500.1000-700.1400-1500.3000.45-22-650~1.2.1_0.0.1_300.0.0_0.800.1_300.220.0_300.540.0_100.820.0_150.0.1~corner.sit-tall.90-0-0' },
  { name: 'settings-option07-no-bench', address: '#7-500-450-1200-1-200-700-500-700-900-900-400-600-0-5-0-0-3-43-0-1000.1800.350.800.250-2-chester-2-none-1900-1100.1950.510-1690.1000.920-0-900-300.900.1500-0-1000.2000.170-25-1200~1.3.2_100.100.1_200.900.0_300.1000.0.400_400.400.1_500.500.0_600.600.0_700.700.1~plan.sit-tall.90-0-0' },
  { name: 'settings-current-room', address: '#16-0-330-1200-2-250-800-500-700-600-900-400-600-0-0-0-0-1-86-1-1370.1940.410.830.340-0-chester-3-merton-3000-1100.1950.510-2600.1200.1100-1-600-600.1200.1800-600.1200.1800-1395.3571.0-12-800~0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1~birdseye.sit-tall.90-0-0' },
];

module.exports = { ADDRESSES, VIEW };
