// A spectrum to drag over, for both colour pickers (the game's colour sheet
// and the classic drawers' swatches): hue across, pale at the top to dark at
// the bottom, and a band of greys at the right. Whatever is under the finger
// snaps to the nearest RAL colour (by how different the two look), so what's
// chosen can still be ordered as paint.
import { RAL } from '../kit/floor_kit.js';
import { colourOf } from '../flat_model.js';

// Chosen: how vivid the spectrum's colours are. RAL colours are mostly muted;
// at 0.45 the rectangle reaches 76 of the 99 (tried 0.25 to 0.6: 71 to 78,
// the lower ones looking washed out). The rest are in the lists.
const SATURATION = 0.45;
const LIGHTEST = 0.95, DARKEST = 0.1;      // chosen: the top and bottom rows' lightness
const GREY_BAND = 0.08;                    // chosen: the share of the width given to greys
const GREYISH = 0.12;                      // chosen: a colour less saturated than this sits in the grey band
// Chosen: the canvas's own pixels; CSS stretches it, and a smooth gradient stretches cleanly
const DRAWN_WIDTH = 360, DRAWN_HEIGHT = 120;

// --- Colours as numbers -----------------------------------------------------

const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
function rgbFromHsl(hue, s, l) {
  const k = n => (n + hue / 30) % 12, a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map(n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
}
function hslOf([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const hue = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hue * 60, s, l];
}
// CIELAB (D65), in which distance is roughly how different two colours look
function labOf(rgb) {
  const [r, g, b] = rgb.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const x = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
  const y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
  const z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const RAL_LABS = Object.entries(RAL).map(([code, [, hex]]) => [Number(code), labOf(rgbOf(hex))]);
function nearestRal(rgb) {
  const [L, a, b] = labOf(rgb);
  let best = null, bestDistance = Infinity;
  for (const [code, [L2, a2, b2]] of RAL_LABS) {
    const distance = (L - L2) ** 2 + (a - a2) ** 2 + (b - b2) ** 2;
    if (distance < bestDistance) { best = code; bestDistance = distance; }
  }
  return best;
}

// --- Places on the rectangle, as fractions of its width and height ----------

const greyStart = 1 - GREY_BAND;
const lightnessAt = y => LIGHTEST - (LIGHTEST - DARKEST) * y;
const rgbAt = (x, y) => (x >= greyStart ? rgbFromHsl(0, 0, lightnessAt(y)) : rgbFromHsl(360 * x / greyStart, SATURATION, lightnessAt(y)));
// Where a colour sits: by its hue and lightness, or in the greys
function placeOf(hex) {
  const [hue, s, l] = hslOf(rgbOf(hex));
  const y = Math.min(1, Math.max(0, (LIGHTEST - l) / (LIGHTEST - DARKEST)));
  return [s < GREYISH ? greyStart + GREY_BAND / 2 : greyStart * hue / 360, y];
}

function drawRectangle(canvas) {
  canvas.width = DRAWN_WIDTH;
  canvas.height = DRAWN_HEIGHT;
  const context = canvas.getContext('2d'), image = context.createImageData(DRAWN_WIDTH, DRAWN_HEIGHT);
  for (let row = 0; row < DRAWN_HEIGHT; row++) {
    for (let column = 0; column < DRAWN_WIDTH; column++) {
      const rgb = rgbAt(column / DRAWN_WIDTH, row / (DRAWN_HEIGHT - 1)), at = 4 * (row * DRAWN_WIDTH + column);
      rgb.forEach((c, i) => { image.data[at + i] = Math.round(255 * c); });
      image.data[at + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
}

// A spectrum element. While a finger or the mouse drags over it, `onSlide`
// hears each RAL colour as the one under it changes; `onLetGo` hears when the
// drag ends (with false if it was cancelled). `show(code)` puts the ring on a
// colour, for when it's chosen some other way.
function spectrum({ onSlide, onLetGo = () => {} }) {
  const element = document.createElement('div'), canvas = document.createElement('canvas'), ring = document.createElement('div');
  element.className = 'spectrum';
  ring.className = 'ring';
  element.append(canvas, ring);
  drawRectangle(canvas);
  const putRing = ([x, y], hex) => {
    ring.style.left = `${100 * x}%`;
    ring.style.top = `${100 * y}%`;
    ring.style.background = hex;
  };
  let last = null;
  function slideTo(e) {
    const box = element.getBoundingClientRect();
    const x = Math.min(0.9999, Math.max(0, (e.clientX - box.left) / box.width));
    const y = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height));
    const code = nearestRal(rgbAt(x, y));
    putRing([x, y], RAL[code][1]);
    if (code !== last) { last = code; onSlide(code); }
  }
  element.addEventListener('pointerdown', e => {
    element.setPointerCapture(e.pointerId);
    last = null;
    slideTo(e);
  });
  element.addEventListener('pointermove', e => { if (element.hasPointerCapture(e.pointerId)) slideTo(e); });
  element.addEventListener('pointerup', () => onLetGo(true));
  element.addEventListener('pointercancel', () => onLetGo(false));
  const show = code => {
    const colour = colourOf(code);
    ring.hidden = !colour;
    if (colour) putRing(placeOf(colour.hex), colour.hex);
  };
  return { element, show };
}

export { spectrum, nearestRal };
