// Views of the room in living_room.js, read by kit/view_kit.js. Edit freely, then
// reload the page.
//
// Positions are in mm, as in room_dimensions.md: [x, y] across the floor, or
// [x, y, height] with height up from the floor. In the living room and the
// hallway:
// - x runs along the TV (back) wall, from the door wall (0) to the window
//   wall (3838). The kitchen recess, the hallway and the bedroom are beyond
//   the door wall, so their x is below 0.
// - y runs from the TV wall (0) to the front wall (5379); the desk and sink
//   recesses go on to 5751.
// In the bedroom, its own (other_room.js): u from its window wall (0) to
// the kitchen-side wall (3682), v from the hallway wall (0) to the chimney
// breast (2841) and its recess (3189). u runs as x, v as y.
window.ROOM_VIEWS = {
  // Eye heights, keyed '<sit, stand or lie>-<who>'. Choosing a view where
  // you sit, stand or lie switches to the same person doing that. Tall
  // sitting is measured in the desk chair; short is an estimate for someone
  // about 1.6 m tall. Lying, on the bed: its mattress's top (610, measured)
  // and your head on a pillow (estimated), the same whoever you are
  eyes: {
    'sit-short':   { label: 'Short, sitting',  height: 1200 },
    'sit-tall':    { label: 'Tall, sitting',   height: 1400 },
    'stand-short': { label: 'Short, standing', height: 1500 },
    'stand-tall':  { label: 'Tall, standing',  height: 1750 },
    'lie-short':   { label: 'Short, lying',    height: 800 },
    'lie-tall':    { label: 'Tall, lying',     height: 800 },
  },
  eye: 'sit-tall',                 // the eye height to start with, until one's chosen

  // The rooms (the Look menu's Room). Choosing one takes you in at its
  // doorway (`enter`: a place and a thing to look at), and Where and
  // Looking at offer its own. Places and things are in the living room
  // unless they say (`room`).
  rooms: {
    living:  { label: 'Living room', enter: { place: 'door', thing: 'monitors' } },
    hallway: { label: 'Hallway', enter: { place: 'hallLivingDoor', thing: 'bedroomDoor' } },
    bedroom: { label: 'Bedroom', enter: { place: 'bedroomDoorway', thing: 'bedroomWindow' } },
    downstairs: { label: 'Downstairs', enter: { place: 'outsideFlatDoor', thing: 'flatDoor' } },
  },

  // Where you can be (the Look menu's Where): a spot on the floor [x, y], and
  // whether you sit, stand or lie there.
  // - chair: you're in the swivel chair, `at` its middle; it turns to face
  //   what you look at, and turns with you as you look round.
  // - cannotSee: things not to offer from here.
  // - arrive: something the room does when you get here (see the actions
  //   in living_room.js).
  // - anchor: instead of `at`, worked out in living_room.js, for places that move.
  // - floor: the height of the floor you stand on, in mm, for a place on
  //   the stairs or at their foot (0 unless it says).
  places: {
    desk:   { label: 'Seated at the desk', at: [3026, 4599], posture: 'sit', chair: true },
    // Back to each window, centred on it and just clear of its radiator
    window1: { label: 'Back to window 1 (TV end)', at: [3500, 1196], posture: 'stand', cannotSee: ['window1'] },
    window2: { label: 'Back to window 2 (middle)', at: [3500, 2907], posture: 'stand', cannotSee: ['window2'] },
    window3: { label: 'Back to window 3 (desk end)', at: [3500, 4598], posture: 'stand', cannotSee: ['window3'] },
    island: { label: 'Beside the island', at: [2150, 3571], posture: 'stand' },      // halfway along its room side, 370 clear of it
    // On the sofa, if there is one (see sofas.js): where it is, worked
    // out in living_room.js, as it moves with the TV and its slider
    sofa:   { label: 'Sitting on the sofa', anchor: 'sofaSeat', posture: 'sit', cannotSee: ['sofa'] },
    // The door's shut behind you, as open it stands in the room in front of you
    door:   { label: 'In the doorway, walking in', at: [150, 1780], posture: 'stand', cannotSee: ['door'], arrive: 'shutRoomDoor' },
    // In the hallway (floor.js's HALLWAY): just out of the living room's
    // door, by the bedroom's (its doorway's middle, 470 out from it), and on
    // the top step, level with the hallway floor (its middle)
    hallLivingDoor:  { room: 'hallway', label: 'Outside the living room door', at: [-500, 1780], posture: 'stand', cannotSee: ['livingRoomDoor'] },
    hallBedroomDoor: { room: 'hallway', label: 'Outside the bedroom door', at: [-1600, 1900], posture: 'stand' },
    hallStairs:      { room: 'hallway', label: 'At the top of the stairs', at: [-600, 1197], posture: 'stand' },
    // Downstairs, on the first floor (2850 down; floor.js's ENTRANCE): in
    // the well's middle between the bottom step and your door; in the
    // shared lobby outside that door, as far back from it as the lobby
    // allows (200 from its far side); and outdoors, 1000 out from the
    // external door's middle, its ground taken as the lobby's level (not known)
    // Halfway down the stairs, on the 4th step up from the foot (as the
    // user asked, 15 Oct 2026): 4 risers of 190 up from the first floor
    // (`floor`), in the middle of that tread and of the well (floor.js's
    // HALLWAY: the flight's 8th tread down, 7.5 goings of 220 on from the
    // winders' turn at -1050), facing on down: from there, the foot, its
    // window and the internal door
    stairsHalfway:   { room: 'downstairs', label: 'Halfway down the stairs', at: [-2700, 572], floor: -2090, posture: 'stand', cannotSee: ['outsideDoor', 'lobby', 'stairsUp'] },
    stairsFoot:      { room: 'downstairs', label: 'At bottom of stairs', at: [-3750, 572], floor: -2850, posture: 'stand' },
    outsideFlatDoor: { room: 'downstairs', label: 'Outside internal door', at: [-4347, 1942], floor: -2850, posture: 'stand', cannotSee: ['lobby'] },
    outsideExternal: { room: 'downstairs', label: 'Outside external door', at: [-6177, 1657], floor: -2850, posture: 'stand' },
    // In the bedroom: in from its door, at the doorway's middle, just past
    // the door (open, it stands 760 into the room); on the bed, your head on
    // the pillow, and beside it, halfway along its side
    // away from the window (both worked out in living_room.js, as the bed
    // moves with its sliders); and between the bed and the window, centred
    // on it, clear of the radiator
    bedroomDoorway: { room: 'bedroom', label: 'In the bedroom doorway, walking in', at: [3242, 940], posture: 'stand' },
    bed:            { room: 'bedroom', label: 'Lying on the bed', anchor: 'bedPillow', posture: 'lie', cannotSee: ['bed'] },
    bedSide:        { room: 'bedroom', label: 'Standing beside the bed', anchor: 'bedSide', posture: 'stand' },
    bedroomWindow:  { room: 'bedroom', label: 'Standing at the bedroom window', at: [450, 1425], posture: 'stand', cannotSee: ['bedroomWindow'] },
  },

  // What you can look at (the Look menu's Looking at): the point to aim at,
  // [x, y, height]. Things that move with the option on show or the sliders
  // have an `anchor` instead, worked out in living_room.js.
  things: {
    monitors: { label: 'the monitors', at: [3026, 5486, 1200] },   // between the two screens
    dresser:  { label: 'the dresser', anchor: 'dresser' },        // on the front wall
    larder:   { label: 'the larder', anchor: 'larder' },          // likewise
    island:   { label: 'the island', anchor: 'island' },          // wherever it stands
    sofa:     { label: 'the sofa', anchor: 'sofa' },              // if there is one
    sink:     { label: 'the kitchen sink', at: [150, 5446, 894] },
    fridge:   { label: 'the fridge', at: [-405, 2701, 1200] },      // the middle of its front
    door:     { label: 'the door', at: [0, 1780, 989] },            // the doorway's middle
    cupboard: { label: 'the corner cupboard', anchor: 'cupboard' },
    tv:       { label: 'the TV', anchor: 'tv' },
    livingBench: { label: 'the wicker bench', anchor: 'livingBench' },   // if it's on in here (wicker_bench.js)
    // The three windows, numbered from the TV end: the middle of each, on the
    // window wall's face
    window1:  { label: 'window 1 (TV end)', at: [3838, 1196, 1607] },
    window2:  { label: 'window 2 (middle)', at: [3838, 2907, 1607] },
    window3:  { label: 'window 3 (desk end)', at: [3838, 4598, 1607] },
    // In the hallway: the two doors' middles, the stairs halfway down, and
    // the far end, where the bathroom and WC are
    livingRoomDoor: { room: 'hallway', label: 'the living room door', at: [-150, 1780, 989] },
    bedroomDoor:    { room: 'hallway', label: 'the bedroom door', at: [-1600, 2371, 989] },
    stairs:         { room: 'hallway', label: 'the stairs', at: [-2260, 572, -1710] },
    hallEnd:        { room: 'hallway', label: 'the far end, by the bathroom', at: [-2480, 1840, 1200] },
    hallBench:      { room: 'hallway', label: 'the wicker bench', anchor: 'hallBench' },     // wherever it stands (wicker_bench.js)
    // Downstairs, heights from the hallway floor (the first floor is 2850
    // down): the foot's floor; the internal (the flat's) door and the
    // external door, their middles; the window at the foot, its middle
    // (floor.js's ENTRANCE.stairWindow: 1395 + 990 / 2 off the floor); the
    // lobby, its middle; and back up the stairs, the top step
    stairsFoot:   { room: 'downstairs', label: 'the foot of the stairs', at: [-3900, 572, -2850] },
    stairWindow:  { room: 'downstairs', label: 'the window at the foot of the stairs', at: [-4827, 572, -960] },
    flatDoor:     { room: 'downstairs', label: 'the internal door', at: [-4347, 1022, -1861] },
    outsideDoor:  { room: 'downstairs', label: 'the external door', at: [-4827, 1657, -1850] },
    lobby:        { room: 'downstairs', label: 'the lobby', at: [-4282, 1657, -2000] },
    stairsUp:     { room: 'downstairs', label: 'up the stairs', at: [-600, 572, 0] },
    shoeRack:     { room: 'downstairs', label: 'the shoe rack', anchor: 'shoeRack' },   // wherever it stands (shoe_rack.js)
    // In the bedroom (other_room.js): the fitted cupboards in the recess
    // (its middle, 1824 wide, at the upper one's front, 2769, measured);
    // the bookcase, the bed, the pine cupboard (the wardrobe) and the
    // mirror, wherever they stand; and the window's middle (floor.js's OTHER_ROOM.window)
    recessCupboards: { room: 'bedroom', label: 'the cupboards in the recess', at: [912, 2769, 1200] },
    bookcase:        { room: 'bedroom', label: 'the bookcase', anchor: 'bookcase' },
    pineCupboard:    { room: 'bedroom', label: 'the wardrobe', anchor: 'pineCupboard' },
    bedroomBench:    { room: 'bedroom', label: 'the wicker bench', anchor: 'bedroomBench' },
    bedroomWindow:   { room: 'bedroom', label: 'the window', at: [0, 1425, 1630] },
    bed:             { room: 'bedroom', label: 'the bed', anchor: 'bed' },
    mirror:          { room: 'bedroom', label: 'the mirror', anchor: 'mirror' },
  },
  look: { place: 'desk', thing: 'dresser' },   // Where and Looking at, until chosen
  hfov: 79,                        // the angle across, in degrees, looking from a place

  // Config-defined views (the views list), in the living room: the camera
  // at `position`, looking at `target`, both [x, y, height]. hfov: the angle
  // across, in degrees.
  // posture: you're in the view as a person, sitting or standing, so it's
  // drawn at the chosen eye height (looking at the same angle) rather than
  // the height given. chair: you're in the swivel chair. compute: worked out
  // in living_room.js when chosen.
  views: {
    // In the office chair, swivelled round to face the room, 20° towards the
    // door and tilted 5° down, as in the photo taken there (69° across in
    // the photo, opened out a little)
    desk:     { label: 'Seated', title: 'Seated at my desk, facing the TV', posture: 'sit', chair: true,
                position: [3026, 4449, 1400], target: [1658, 690, 1050], hfov: 79 },
    // In front of the sink run, looking across the room towards the TV wall,
    // as far back as the front wall allows
    kitchen:  { label: 'Kitchen', title: 'Standing in the kitchen', posture: 'stand',
                position: [-3, 5294, 1750], target: [1597, 1094, 1150], hfov: 79 },
    // Back to the middle window, just clear of the radiator, looking over the
    // island at the sink and, to its left, the front wall along to the desk recess
    window:   { label: 'Window', title: 'Back to the middle window, looking at the sink and the wall to its left', posture: 'stand',
                position: [3500, 2907, 1700], target: [1000, 5379, 1100], hfov: 79 },
    // Just inside the entrance door, looking across the room (over the
    // island) to the desk
    door:     { label: 'Door', title: 'Looking in from the entrance door, towards my desk', posture: 'stand',
                position: [150, 1780, 1700], target: [3026, 5350, 1000], hfov: 79 },
    packing:  { label: 'Packing', title: 'In front of the corner cupboard, its doors open', posture: 'stand', compute: 'packing' },
    // Downstairs (heights from the hallway floor, the first floor 2850
    // down): high over the stairs' foot, near its ceiling, 250 in from the
    // back wall in the well's middle, looking down at the foot's floor and
    // the shoe rack; where the user stood the camera (15 Oct 2026)
    footFromAbove: { label: 'Foot of the stairs', title: 'Looking down on the foot of the stairs, from near its ceiling', room: 'downstairs',
                position: [-4577, 583, -308], target: [-5072, 569, -3267], hfov: 100 },
  },
  // Looks (the Look menu's list): a Where, Looking at and eye height by
  // name, the same on every device, alongside those saved with its Save. A
  // look aims at its thing wherever it is now. For example
  //   deskDresser: { label: 'From the desk, the dresser', place: 'desk', thing: 'dresser', eye: 'sit-tall' },
  // (eye can be left out, to keep whatever eye height is chosen).
  looks: {
  },
  startView: 'birdseye',           // the view a page opens on, unless its address has one (it can be a built-in view)
};
