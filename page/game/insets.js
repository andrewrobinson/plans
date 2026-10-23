// The game UI's edges, in px, which the 2D views fit between (a piece of
// living_room.js, for page/view.js): the picker on the left while it's
// shown (in the lounge and the bedroom), the room chips at the top and the view switch at
// the bottom. None with ?classic.
const NONE = { left: 0, top: 0, bottom: 0 };
const PICKER_ROOMS = ['livingRoom', 'bedroom'];   // furniture.js's ROOMS (not imported: this loads before the model's set up)
const GAP = 6;                     // px between the plan and the game UI (chosen)
// roomNow(): the room on show, the view kit's, once it's set up
export function gameInsets(roomNow) {
  if (document.body.classList.contains('classic')) return NONE;
  let room = null;
  try { room = roomNow(); } catch (e) { /* the view kit isn't set up yet */ }
  const picker = document.getElementById('picker'), rooms = document.getElementById('gameRooms'), modes = document.getElementById('gameModes');
  // The picker's place, from its style, as it may be hidden till the room's shown
  const pickerStyle = getComputedStyle(picker);
  const left = PICKER_ROOMS.includes(room) ? parseFloat(pickerStyle.left) + parseFloat(pickerStyle.width) + GAP : 0;
  const top = getComputedStyle(rooms).display !== 'none' ? rooms.getBoundingClientRect().bottom + GAP : 0;
  const bottom = innerHeight - modes.getBoundingClientRect().top + GAP;
  return { left, top, bottom };
}
