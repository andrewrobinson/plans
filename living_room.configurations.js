// Configurations for the Configuration list at the bottom right (living_room.js):
// named snapshots of every setting in every room, the same on every device,
// unlike those kept with the list's Save. Edit freely, then reload the page.
//
// A configuration is everything the page shows bar where you're looking from
// (room_dimensions.md has the format): the furniture in every room and where
// it is, the cupboards' designs, sizes, colours, the doors and the things to
// store. To add one: set the page up as you want it, run
// `copy(JSON.stringify(plans.export(), null, 2))` in the browser's console,
// and paste it in below, as
//
//   id: { label: 'What it shows', title: 'A longer note', configuration: { "version": 1, ... } },
//
// with an id of your own (letters and digits, no spaces). Give it every
// setting, as export() does, so it doesn't change when a default does.
window.ROOM_CONFIGURATIONS = {
  list: {
  },
};
