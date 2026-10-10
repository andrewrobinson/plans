// Sofas for the menu's Sofa dropdown in room_3d.html. Edit freely, add more,
// then reload the page. A sofa stands facing the TV, centred on it, its
// front a set distance from the TV wall (the menu's slider).
//
// Sizes in mm:
// - w, d, h: overall width, depth and height (to the top of the back)
// - seatH: seat height, to the top of the seat cushion; seatD: seat depth,
//   from the front to the back cushions
// - armH, armW: the arms' height and width; legH: the legs' height
// - colour: the fabric, as a screen colour
//
// The menu's sliders resize the sofa chosen (width 1200 to 2600, depth 700 to
// 1200, height 700 to 1100): the seat keeps its depth and height, the back
// gets thinner or taller, and the arms stay under the top of the back.
window.ROOM_SOFAS = {
  start: '',                       // the sofa to start with: '' for none (a link keeps its own)
  front: 1900,                     // its front from the TV wall, to start with (1000 to 3500)
  list: {
    // Habitat x Morris & Co. Merton Sunflower fabric 2 seater sofa:
    // H 92 × W 169 × D 100 cm, seat height 50.5 cm, seat depth 65 cm. Rolled
    // arms, lower than the back, and turned wooden legs; their heights are
    // estimated from the photos. The fabric's a grey and white print.
    // https://www.habitat.co.uk/product/7681635
    merton: { label: 'Merton 2 Seater (Habitat x Morris & Co.)', w: 1690, d: 1000, h: 920,
              seatH: 505, seatD: 650, armH: 680, armW: 180, legH: 150, colour: '#9DA3A6' },
  },
};
