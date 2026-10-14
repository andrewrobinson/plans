// Scenes for the top bar's Scenes list in room_3d.html, to show people the
// options: the same on every device, unlike those saved with Save scene. Edit
// freely, then reload the page.
//
// A scene is everything the page shows bar where you're looking from: the
// option, the dresser, larder, island and sofa, what's above the bench (the
// TV), sizes and colours. Its address is the part of the page's address
// after the # and before the second ~ (the view comes after that). To add
// one: set the page up as you want it, copy that part of the address, and
// add it below, as
//
//   id: { label: 'What it shows', address: '9-0-330-...~0.0.0_...' },
//
// with an id of your own (letters and digits, no spaces).
window.ROOM_SCENES = {
  list: {
    // Option 7, the full-height L: 1200 × 1200 outside, each leg 600 deep
    // inside (618 with its 18 panel): the left-wall cupboard 618 deep, the
    // back-wall leg 582 wide and 618 deep, the front at 1200. Packed:
    // racks 1 and 2 at the back, against the back wall behind the main door;
    // the tub at the front there, on the 790 shelf just above them (they're
    // 630 high, and need 50 to lift them in over the cupboard's bottom);
    // the ladders side by side in the left-wall leg, out through its door,
    // with the hoover right by them, in front of that door, and the mop
    // behind the hoover, in the corner. Shelves: in the back-wall leg and
    // corner 790 (cut back in the corner, for the mop and hoover), 1300 and
    // 1850; in the left-wall leg 1710 (clear of the long ladder) and 2150
    finished7: { label: '7. Finished design, 1200 × 1200, ready packed', title: 'The full-height L, 1200 × 1200, legs 600 deep inside, packed',
      address: '7-618-330-1200-3-250-780-582-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-618-790.1300.1850-1710.2150-1395.3571.0-18-800-1200-0-400-330~1.0.2_382.10.0_100.852.0_40.1077.0_30.240.0_30.570.0_620.45.0.790_382.120.0' },
  },
};
