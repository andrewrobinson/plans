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
    // racks 1 and 2 along the main door (they swing out, one at a time, or
    // better lie diagonally across the inside corner, where the doors meet:
    // with both open the gap is about 844 across at 45°; the model can't
    // draw them at an angle), the ladders side by side in the left-wall leg
    // (out through its door), the mop and hoover in the corner, and the tub
    // on the 2nd shelf (the model puts it on the floor)
    finished7: { label: '7. Finished design, 1200 × 1200, ready packed', title: 'The full-height L, 1200 × 1200, legs 600 deep inside, packed',
      address: '7-618-330-1200-3-250-780-500-700-582-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-618~1.0.2_382.490.0_100.842.0_40.1072.0_20.10.0_30.345.0_600.10.0_382.380.0' },
  },
};
