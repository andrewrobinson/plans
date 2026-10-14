// The debug text: what the page knows, written out as plain text, for the
// debug menu. Each section is a heading and lines of "name  value".

import { ROOM_WIDTH, ROOM_DEPTH, CEILING_HEIGHT } from './room.js';
import { cornersOf, gapsAroundThe } from './box.js';

const METRES_TO_MILLIMETRES = 1000;

// A number of mm as text, e.g. "1200 mm"
function mm(value) {
  return `${Math.round(value)} mm`;
}

// A room point [x, y, z] in mm as text, e.g. "(800, 1500, 0)"
function point([x, y, z]) {
  return `(${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)})`;
}

// Lines of "name  value", with the values lined up
function section(heading, rows) {
  const widestName = Math.max(...rows.map(([name]) => name.length));
  const lines = rows.map(([name, value]) => `  ${name.padEnd(widestName)}  ${value}`);
  return [heading, ...lines].join('\n');
}

// The camera's position and where it's looking, turned back from three.js
// metres (y up) into room mm (z up)
function roomPointFromScene(scenePoint) {
  return [scenePoint.x, scenePoint.z, scenePoint.y].map(metres => metres * METRES_TO_MILLIMETRES);
}

// All the debug text, for `box` and the view's camera
export function debugText(box, { camera, cameraControls }) {
  const { from, to } = cornersOf(box);
  const gaps = gapsAroundThe(box);
  const volumeInCubicMetres = (box.width * box.depth * box.height) / 1e9;
  const floorAreaInSquareMetres = (box.width * box.depth) / 1e6;

  return [
    'Room coordinates are in mm: x from the left wall, y from the back wall, z up from the floor.',
    '',
    section('ROOM (the main rectangle)', [
      ['width (x)', mm(ROOM_WIDTH)],
      ['depth (y)', mm(ROOM_DEPTH)],
      ['ceiling height (z)', mm(CEILING_HEIGHT)],
    ]),
    '',
    section('BOX SIZE', [
      ['width (x)', mm(box.width)],
      ['depth (y)', mm(box.depth)],
      ['height (z)', mm(box.height)],
      ['floor area', `${floorAreaInSquareMetres.toFixed(2)} m²`],
      ['volume', `${volumeInCubicMetres.toFixed(3)} m³`],
    ]),
    '',
    section('BOX POSITION', [
      ['back-left-bottom corner', point(from)],
      ['front-right-top corner', point(to)],
      ['middle', point(from.map((start, k) => (start + to[k]) / 2))],
    ]),
    '',
    section('SPACE AROUND THE BOX', [
      ['to the left wall', mm(gaps.toLeftWall)],
      ['to the right wall', mm(gaps.toRightWall)],
      ['to the back wall', mm(gaps.toBackWall)],
      ['to the front wall', mm(gaps.toFrontWall)],
      ['to the floor', mm(gaps.toFloor)],
      ['to the ceiling', mm(gaps.toCeiling)],
    ]),
    '',
    section('CAMERA', [
      ['standing at', point(roomPointFromScene(camera.position))],
      ['looking at', point(roomPointFromScene(cameraControls.target))],
      ['field of view', `${camera.fov}°`],
    ]),
  ].join('\n');
}
