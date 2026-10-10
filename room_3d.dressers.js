// Dressers for the menu's Dresser dropdown in room_3d.html. Edit freely, add
// more, then reload the page. Choosing one sets the dresser's sliders; moving
// a slider shows "Custom" until the sizes match one of these again.
//
// Sizes in mm:
// - w: overall width, at the base's top, which overhangs the body by 20 each
//   side (900 to 1415: the wall between the kitchen counter and the desk
//   recess is 1415)
// - h: overall height, floor to the top of the upper part (1500 to 2400)
// - baseD: the base's depth (300 to 600)
// - baseH: the base's height, to the top of its worktop (700 to 1000)
// - upperD: the upper part's depth, no deeper than the base (150 to 600)
// Sizes outside those ranges are held to them.
window.ROOM_DRESSERS = {
  start: 'chester',                // the dresser the page starts with (a link keeps its own)
  list: {
    // The first sizes drawn: estimates, a bit like the Chester below
    estimate: { label: 'First estimate', w: 1320, h: 2100, baseD: 400, baseH: 900, upperD: 290 },
    // Cotswold Company, Chester Dove Grey large dresser: the dresser top
    // (H 111 × W 137 × D 34 cm) on the large sideboard (H 83 × W 137 × D 41 cm)
    // https://www.cotswoldco.com/dining-room-furniture/dressers/chester-dove-grey-dresser/
    chester: { label: 'Chester Large Dresser', w: 1370, h: 1940, baseD: 410, baseH: 830, upperD: 340 },
    // Cotswold Company, Inglesham Whitewash Oak small dresser: the dresser top
    // (H 110 × W 100 × D 42 cm) on the small sideboard (H 83 × W 100 × D 42 cm)
    // https://www.cotswoldco.com/dining-room-furniture/dressers/inglesham-whitewash-oak-small-dresser/
    inglesham: { label: 'Inglesham Small Dresser', w: 1000, h: 1930, baseD: 420, baseH: 830, upperD: 420 },
  },
};
