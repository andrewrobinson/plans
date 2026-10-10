// Views of the room in room_3d.html, read by view_kit.js. Edit freely, then
// reload the page.
//
// Positions are in mm, as in room_dimensions.md: [x, y] across the floor, or
// [x, y, height] with height up from the floor.
// - x runs along the TV (back) wall, from the door wall (0) to the window
//   wall (3838). The kitchen recess is beyond the door wall, so its x is
//   below 0.
// - y runs from the TV wall (0) to the front wall (5379); the desk and sink
//   recesses go on to 5751.
window.ROOM_VIEWS = {
  // Eye heights, keyed '<sit or stand>-<who>'. Choosing a view where you sit
  // or stand switches to the same person sitting or standing. Tall sitting
  // is measured in the desk chair; short is an estimate for someone about
  // 1.6 m tall.
  eyes: {
    'sit-short':   { label: 'Short, sitting',  height: 1200 },
    'sit-tall':    { label: 'Tall, sitting',   height: 1400 },
    'stand-short': { label: 'Short, standing', height: 1500 },
    'stand-tall':  { label: 'Tall, standing',  height: 1750 },
  },
  eye: 'sit-tall',                 // the eye height to start with, until one's chosen

  // Where you can be (the top bar's Where): a spot on the floor [x, y], and
  // whether you sit or stand there.
  // - chair: you're in the swivel chair, `at` its middle; it turns to face
  //   what you look at, and turns with you as you look round.
  // - cannotSee: things not to offer from here.
  // - arrive: something the room does when you get here (see the actions
  //   in room_3d.html).
  places: {
    desk:   { label: 'Seated at the desk', at: [3026, 4599], posture: 'sit', chair: true },
    window: { label: 'Back to the middle window', at: [3500, 2907], posture: 'stand', cannotSee: ['window2'] },
    island: { label: 'Beside the island', at: [2150, 3571], posture: 'stand' },      // halfway along its room side, 370 clear of it
    // The door's shut behind you, as open it stands in the room in front of you
    door:   { label: 'In the doorway, walking in', at: [150, 1780], posture: 'stand', cannotSee: ['door'], arrive: 'shutRoomDoor' },
  },

  // What you can look at (the top bar's Looking at): the point to aim at,
  // [x, y, height]. Things that move with the option on show or the sliders
  // have an `anchor` instead, worked out in room_3d.html.
  things: {
    monitors: { label: 'the monitors', at: [3026, 5486, 1200] },   // between the two screens
    dresser:  { label: 'the dresser', anchor: 'dresser' },
    sink:     { label: 'the kitchen sink', at: [150, 5446, 894] },
    fridge:   { label: 'the fridge', at: [-405, 2701, 1200] },      // the middle of its front
    door:     { label: 'the door', at: [0, 1780, 989] },            // the doorway's middle
    cupboard: { label: 'the corner cupboard', anchor: 'cupboard' },
    tv:       { label: 'the TV', anchor: 'tv' },
    // The three windows, numbered from the TV end: the middle of each, on the
    // window wall's face
    window1:  { label: 'window 1 (TV end)', at: [3838, 1196, 1607] },
    window2:  { label: 'window 2 (middle)', at: [3838, 2907, 1607] },
    window3:  { label: 'window 3 (desk end)', at: [3838, 4598, 1607] },
  },
  look: { place: 'desk', thing: 'dresser' },   // Where and Looking at, until chosen
  hfov: 79,                        // the angle across, in degrees, looking from a place

  // User-defined views (the views list): the camera at `position`, looking
  // at `target`, both [x, y, height]. hfov: the angle across, in degrees.
  // posture: you're in the view as a person, sitting or standing, so it's
  // drawn at the chosen eye height (looking at the same angle) rather than
  // the height given. chair: you're in the swivel chair. compute: worked out
  // in room_3d.html when chosen.
  views: {
    // In the office chair, swivelled round to face the room, 20° towards the
    // door and tilted 5° down, as in the photo taken there (69° across in
    // the photo, opened out a little)
    desk:     { label: 'Seated', title: 'Seated at my desk, facing the TV', posture: 'sit', chair: true,
                position: [3026, 4449, 1400], target: [1658, 690, 1050], hfov: 79 },
    // On the room side of the island, so it's on your left, facing the TV wall
    standing: { label: 'Island', title: 'Standing, island on my left', posture: 'stand',
                position: [2350, 4600, 1750], target: [2350, 0, 1200], hfov: 79 },
    // In front of the sink run, looking across the room towards the TV wall,
    // as far back as the front wall allows
    kitchen:  { label: 'Kitchen', title: 'Standing in the kitchen', posture: 'stand',
                position: [-3, 5294, 1750], target: [1597, 1094, 1150], hfov: 79 },
    // Back to the middle window, just clear of the radiator, looking over the
    // island at the sink and, to its left, the front wall along to the desk recess
    window:   { label: 'Window', title: 'Back to the middle window, looking at the sink and the wall to its left', posture: 'stand',
                position: [3500, 2907, 1700], target: [1000, 5379, 1100], hfov: 79 },
    // High above the windows, looking down across the room towards the door
    // and the kitchen. The outer wall and ceiling only show from inside, so
    // the room is open from here; any further out and the outer wall's brick
    // face would hide the floor along it
    birdseye: { label: "Bird's eye", title: 'Looking down from above the windows',
                position: [4500, 2750, 7500], target: [1200, 2750, 0], hfov: 66 },
    // Just inside the entrance door, looking across the room (over the
    // island) to the desk
    door:     { label: 'Door', title: 'Looking in from the entrance door, towards my desk', posture: 'stand',
                position: [150, 1780, 1700], target: [3026, 5350, 1000], hfov: 79 },
    packing:  { label: 'Packing', title: "Within arm's reach of the corner cupboard, its doors open", posture: 'stand', compute: 'packing' },
    windows:  { label: 'Windows', title: 'Facing the windows from the door side of the room', posture: 'stand',
                position: [400, 3000, 1500], target: [3838, 3000, 1350], hfov: 79 },
    // Where the room photo was taken, worked back from where the room's
    // corners fall in it: tilted 6° down, seeing 69° across like an iPhone's
    // main camera. Kept at the camera's height, to match the photo
    photo:    { label: 'Photo', title: 'Where the room photo was taken from',
                position: [1450, 4200, 1300], target: [1450, 0, 860], hfov: 69 },
  },
  startView: 'desk',               // the view to start with, until one's chosen
};
