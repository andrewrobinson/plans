// The sliders in the box menu: one for each of the box's sizes and one for
// each direction it can move. Each slider row is built here from the list
// below, so adding a slider is adding a line to the list.

import { SIZE_LIMITS, furthestItCanMove } from './box.js';

// Every slider moves in steps of this many mm. Steps of 1 let the box reach
// any wall exactly: the room's sizes (3838, 5379, 2443) aren't round numbers.
const SLIDER_STEP = 1;

// The sliders, in the order they appear. `setting` is the name of the box
// setting it changes (see STARTING_BOX in box.js).
const SIZE_SLIDERS = [
  { setting: 'width', label: 'Width (along the back wall)' },
  { setting: 'depth', label: 'Depth (out from the back wall)' },
  { setting: 'height', label: 'Height' },
];
const POSITION_SLIDERS = [
  { setting: 'distanceFromLeftWall', label: 'From the left wall' },
  { setting: 'distanceFromBackWall', label: 'From the back wall' },
  { setting: 'heightOffFloor', label: 'Off the floor' },
];

// One labelled slider with its value shown beside it, as HTML elements:
//   <label class="slider-row">
//     <span class="slider-name">Width</span> <output>1200 mm</output>
//     <input type="range">
//   </label>
function buildSliderRow({ setting, label }) {
  const row = document.createElement('label');
  row.className = 'slider-row';

  const name = document.createElement('span');
  name.className = 'slider-name';
  name.textContent = label;

  const readout = document.createElement('output');

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.step = SLIDER_STEP;
  slider.id = `slider-${setting}`;

  row.append(name, readout, slider);
  return { row, slider, readout, setting };
}

// Puts the sliders into the two containers, starting at `box`'s settings.
// Whenever a slider moves, `onChange` is called with the setting's name and
// its new value in mm. Returns `showSettings(box)`, which moves every slider
// to match the box (and sets how far the position sliders can go).
export function createSliders({ sizeContainer, positionContainer, box, onChange }) {
  const sizeRows = SIZE_SLIDERS.map(buildSliderRow);
  const positionRows = POSITION_SLIDERS.map(buildSliderRow);
  sizeContainer.append(...sizeRows.map(r => r.row));
  positionContainer.append(...positionRows.map(r => r.row));

  // The size sliders' limits never change
  for (const { slider, setting } of sizeRows) {
    slider.min = SIZE_LIMITS[setting].smallest;
    slider.max = SIZE_LIMITS[setting].largest;
  }

  const allRows = [...sizeRows, ...positionRows];
  for (const { slider, setting } of allRows) {
    slider.addEventListener('input', () => onChange(setting, Number(slider.value)));
  }

  function showSettings(box) {
    // A bigger box has less room to move in, so the position sliders' ends
    // move with its size
    const furthest = furthestItCanMove(box);
    for (const { slider, setting } of positionRows) {
      slider.min = 0;
      slider.max = furthest[setting];
    }
    for (const { slider, readout, setting } of allRows) {
      slider.value = box[setting];
      readout.textContent = `${box[setting]} mm`;
    }
  }

  showSettings(box);
  return { showSettings };
}
