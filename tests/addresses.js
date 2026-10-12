// Saved addresses for the screenshot and round-trip tests, recorded from
// room_3d.html as it was on 12 Oct 2026, before the refactor (REFACTOR_PLAN.md).
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
const REST = '330-1200-3-250-780-500-700-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600-600.1200.1800-600.1200.1800-1395.3571.0';
const STORED = '0.0.0_2550.2640.1_2100.2360.0_2000.2360.1_2100.2580.0_2500.2360.0_2000.2900.0_2700.2640.1';
const VIEW = 'birdseye.sit-tall.90-0-0';

// Option codes in the address are not the dropdown's order: 10 is the
// current room, so the options listed as 10 to 15 are 11 to 16
// (optionCode() in room_3d.html). The left-wall depth is what the page picks
// when you choose that option from the default page.
const OPTIONS = [
  ['option01', 1, 360], ['option02', 2, 360], ['option03', 3, 0], ['option04', 4, 0],
  ['option05', 5, 0], ['option06', 6, 0], ['option07', 7, 600],
  ['option08', 8, 600],                     // needs a left-wall cupboard
  ['option09', 9, 0], ['option10', 11, 0], ['option11', 12, 0], ['option12', 13, 0],
  ['option13', 14, 0], ['option14', 15, 0], ['option15', 16, 0],
  ['option16-current-room', 10, 0],
];

const ADDRESSES = [
  { name: 'default', address: `#9-0-${REST}~${STORED}~${VIEW}` },
  ...OPTIONS.map(([name, code, left]) => ({ name, address: `#${code}-${left}-${REST}~${STORED}~${VIEW}` })),

  // The views: 2D with dimensions, and from places in the room
  { name: 'view-plan', address: `#9-0-${REST}~${STORED}~plan.sit-tall.90-0-0` },
  { name: 'view-back-wall', address: `#9-0-${REST}~${STORED}~back.sit-tall.90-0-0` },
  { name: 'view-packing', address: `#9-0-${REST}~${STORED}~packing.stand-tall.0-170-170` },
  { name: 'view-desk', address: `#9-0-${REST}~${STORED}~desk.sit-tall.90-0-0` },
];

module.exports = { ADDRESSES, VIEW };
