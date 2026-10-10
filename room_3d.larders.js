// Larders for the menu's Larder dropdown in room_3d.html. Edit freely, add
// more, then reload the page. A larder stands on the front wall (between the
// sink and the desk) when the menu's "On the front wall" says Larder, and in
// the corner in the options for that. It takes the dresser's colour.
//
// Sizes in mm. w: width; d: depth, front to back. Its parts stack from the
// floor up, and their heights add up to its height:
// - { legs: h }       short legs, open underneath
// - { plinth: h }     a plinth, set back a little
// - { drawers: n, h } a row of n drawers, or { drawers: [rows, columns], h }
// - { doors: n, h, shelves: k }  n doors (1 or 2) with k shelves behind;
//                     a single door is hinged on the 'left' or 'right', as
//                     you face it (hinge)
// - { top: h }        a wooden top, a little proud of what's below it
// - { cornice: h }    the top moulding, a little proud
// Any part can have its own d, as when the top section is shallower than
// the base.
window.ROOM_LARDERS = {
  start: 'chester',                // the larder the dropdown starts with (a link keeps its own)
  list: {
    // Cotswold Company, Chester double larder: H 195 × W 110 × D 51 cm, in
    // two sections. Read from the product photos: a base on short legs with
    // four drawers under an oak top (about 600 high, as its 68 cm box), and
    // a top section with two doors, hinged at the outer edges, and a
    // cornice. Its top section's depth is a guess.
    // https://www.cotswoldco.com/kitchen-furniture/kitchen-pantry-and-larder-cupboards/double-larders/chester-limestone-double-larder/
    chester: { label: 'Chester Double Larder', w: 1100, d: 510, parts: [
      { legs: 80 }, { drawers: [2, 2], h: 475 }, { top: 40 },
      { doors: 2, h: 1250, shelves: 3, d: 450 }, { cornice: 105, d: 450 },
    ] },
    // Cotswold Company, Stow narrow single larder: H 186 × W 67 × D 50 cm.
    // Read from the product photos: on a plinth, a lower door with a shelf
    // behind, a drawer, and a tall upper door with four shelves behind, both
    // doors hinged on the right.
    // https://www.cotswoldco.com/kitchen-furniture/pantry-cupboards/single-larders/stow-white-painted-single-larder/
    stow: { label: 'Stow Narrow Single Larder', w: 670, d: 500, parts: [
      { plinth: 95 }, { doors: 1, hinge: 'right', h: 600, shelves: 1 }, { drawers: 1, h: 185 },
      { doors: 1, hinge: 'right', h: 930, shelves: 4 }, { cornice: 50 },
    ] },
  },
};
