// The sliders' ranges (a piece of flat_model.js), which the settings'
// numbers are held to. model/settings.js adds the dresser's, larder's and
// sofa's.

// The ranges of the sliders the schema's numbers follow, chosen, as in
// index.html: [lowest, highest, step], by the slider's id. A test checks
// they agree with index.html's (room_3d.spec.js). The dresser's, larder's
// and sofa's are in DRESSER_SLIDERS, LARDER_SLIDERS and SOFA_SLIDERS
const SLIDER_RANGES = {
  roomDoor: [0, 110, 1], tallDoor: [0, 180, 1], secondDoor: [0, 180, 1], bedroomDoor: [0, 180, 1], flatDoor: [0, 90, 1], outsideDoor: [0, 90, 1],
  bedroomCupboardTallDoor: [0, 180, 1], bedroomCupboardSecondDoor: [0, 180, 1],
  rear: [300, 800, 10], board: [12, 25, 1], leg: [400, 1200, 1], legD: [330, 1000, 1],
  ward: [600, 1400, 50], wardD: [330, 1000, 10], tower: [0, 600, 50],
  cornerW: [500, 1200, 10], cornerD: [0, 1329, 1], sideW: [200, 800, 10], sideD: [150, 800, 10],
  deskW: [300, 1200, 10], deskD: [300, 700, 10], deskH: [650, 800, 10],
  leftLen: [1000, 1329, 1], top: [1800, 2450, 10], diagRun: [400, 1200, 10], diagBack: [0, 1800, 10], diagLeft: [0, 2700, 10],
  endBack: [100, 1200, 10], endBackD: [150, 800, 10], endLeft: [100, 1300, 10], endLeftD: [150, 800, 10],   // options 7 and 8's shallow ends (chosen)
  shelfDepth: [150, 400, 10], islandTurn: [0, 180, 5], sofaFront: [1000, 3500, 50],
  islandLength: [1200, 3000, 10], islandWidth: [600, 1200, 10],   // the custom island's worktop (chosen: round Howdens' 2400 x 950)
  islandOverhang: [400, 800, 10],   // and how far it runs past the units (the user's, 22 Oct 2026: the plan's 2400 over a 1600 carcass is 800)
  deskShelfDepth: [150, 400, 10],   // the desk shelves', as the TV wall's shelves' (shelfDepth)
  speakerSpacing: [400, 3000, 10],   // between the speakers' middles, chosen: their 170 wide apart, to past the TV's width
  bedroomDoorMustOpenTo: [45, 90, 1],   // swinging left, how far the bedroom door must open: from half open (chosen) to flat along the wall
};

// What the other pieces of the model use
export {
  SLIDER_RANGES
};
