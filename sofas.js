// Sofas for the menu's Sofa dropdown in living_room.js. Edit freely, add more,
// then reload the page. A sofa stands facing the TV, centred on it, its
// front a set distance from the TV wall (the menu's slider).
//
// Sizes in mm:
// - w, d, h: overall width, depth and height (to the top of the back)
// - seatH: seat height, to the top of the seat cushion; seatD: seat depth,
//   from the front to the back cushions
// - armH, armW: the arms' height and width; legH: the legs' height
// - colour: the fabric, as a screen colour
// - daybed: for a daybed, drawn as one (daybed.js) rather than upholstered:
//   bedW, its width as a bed, its arms let down; armLong, each arm's length,
//   hinged at the end of the base; futon, the futon's thickness; rail, the
//   base's oak frame's; leg, its legs' thickness; backRail, the oak rail at
//   the back: its width w and height h, on posts `post` square
//
// The menu's sliders resize the sofa chosen (width 1200 to 2600, depth 700 to
// 1200, height 600 to 1100): the seat keeps its depth and height, the back
// gets thinner or taller, and the arms stay under the top of the back.
//
// An ES module: living_room.js imports it.
export const SOFA_MODELS = {
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
    // Futon Company's Oak Drift Sofa bed, a daybed: W 148 × D 79 cm, seat
    // height 39 cm and back rest 67 cm as a sofa; W 198 as a bed, its arms
    // let down flat (the maker's specification and line drawing). An oak
    // base on four legs with a futon on it; its ends hinge up as the arms;
    // an oak rail at the back, with a back cushion. From the drawing
    // (estimated): the base 1300 long, so each arm 340; the futon 120 thick;
    // the frame 50 and the legs 45 thick; the back rail 1000 wide and 60
    // high on 40 posts. The futon's the one it comes with, the Comfy day bed
    // futon in Acer Red Coast Weave (its colour estimated). The seat's depth
    // is the futon's 750 (the sleeping area's width) less the back cushion.
    // https://www.futoncompany.co.uk/shop-by-product/sofa-beds/type/daybeds/drift-oak-sofa-bed.html
    drift: { label: 'Drift Oak Sofa Bed (Futon Company)', w: 1480, d: 790, h: 670,
             seatH: 390, seatD: 600, colour: '#9B3A32',
             daybed: { bedW: 1980, armLong: 340, futon: 120, rail: 50, leg: 45, backRail: { w: 1000, h: 60, post: 40 } } },
  },
};
