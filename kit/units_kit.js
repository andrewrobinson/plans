// Numbers every room uses: a value held between two others, and pieces
// turned in quarter turns. Nothing here needs the page or three.js.

// `value` held from `lowest` to `highest`; if they cross, `lowest` (as a
// size never below its least). Where the highest should win instead (a
// piece on a wall too short for it, against its far end), say so there
export const clamp = (value, lowest, highest) => Math.max(lowest, Math.min(value, highest));

// A piece's turn, in degrees, goes in quarter turns (the menus' Turned)
export const QUARTER_TURN = 90;

// `piece` (a three.js object) turned `turn` degrees, as the menus' Turned:
// clockwise seen from above
const DEGREE = Math.PI / 180;     // as three.js's degToRad, so a turn comes out the same
export function turnPiece(piece, turn) {
  piece.rotation.y = -turn * DEGREE;
}
