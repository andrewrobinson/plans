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
    // Option 7, the full-height L, 1200 along the back wall (a 600-deep
    // left-wall leg and a 600-wide back-wall leg) and 1329 along the left
    // wall, to the door frame; the back-wall leg 1000 deep, the bench 330.
    // Packed so the bulky things come out easily: the racks end-on behind
    // the main door, the mop beside them, the ladders side by side in the
    // left-wall leg (sliding out through its door), the hoover at the front
    // of the inside corner, and the tub at its back (on the 2nd shelf, in
    // reality: the model puts things on the floor)
    finished7: { label: '7. Finished design, 1200 × 1329, ready packed', title: 'The full-height L, 1200 × 1329, packed',
      address: '7-600-330-1329-3-250-780-500-700-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-1000~1.0.2_880.180.1_100.985.0_40.1206.0_560.575.1_230.690.0_10.10.0' },
    // 1200 × 1200 with 600 × 600 legs (582 inside each): the racks lie
    // along the main door, to swing out one at a time, right end first
    // (better still, diagonally across the inside corner, where the doors
    // meet: with both open the gap is about 844 across at 45°, so they come
    // straight out; the model can't draw them at an angle). The ladders lie
    // side by side in the left-wall leg, the hoover in front of them (both
    // out through its door), the mop in the corner; the tub, in the corner,
    // is on the 2nd shelf, in reality, above them
    finished7square: { label: '7. Finished design, 1200 × 1200, 600 legs, ready packed', title: 'The full-height L, 1200 × 1200, 600 × 600 legs, packed',
      address: '7-600-330-1200-3-250-780-500-700-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-600~1.0.2_382.282.0_100.858.0_40.1080.0_30.170.1_30.578.0_10.10.0' },
    // 1200 × 1200 with the back-wall leg 870 deep (852 inside), so the
    // racks stand end-on behind the main door and slide straight out (or lie
    // flat on a shelf); the left-wall leg is 330 inside for the ladders
    // (320 side by side)
    finished7compact: { label: '7. Finished design, 1200 × 1200, 870-deep back leg, ready packed', title: 'The full-height L, 1200 × 1200, the back-wall leg 870 deep, packed',
      address: '7-600-330-1200-3-250-780-500-700-600-900-400-600-0-4-0-0-0-75-0-1370.1940.410.830.340-0-chester-0-none-1900-1100.1950.510-1690.1000.920-1-870~1.0.2_880.50.1_100.855.0_40.1078.0_560.450.1_230.570.0_10.10.0' },
  },
};
