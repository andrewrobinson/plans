// The finishes and colours (a piece of flat_model.js): each target's
// colour, from the settings, put on its materials.
import { RAL, oakBoards } from '../kit/floor_kit.js';
import { floor, wallMat, floorMat, frameMat, carpetMat, CARPET_COLOURS } from '../floor.js';
import { config, drawn } from './state.js';
import { cupboard } from './cupboards.js';
import {
  BEDROOM_MATERIALS, benchMat, carcassMat, doorMat, dresserDoorMat, dresserMat, roomDoorMat
} from './materials.js';

// ---------------------------------------------------------------------------
// The room's colours. The RAL table and the oak floor's texture are in
// kit/floor_kit.js.
// What each colour box changes, and the model's own colours when it's empty
// The room's own finishes, chosen by name. Numbered below 1000 so they share
// the configuration's colour codes with RAL's. Their screen colours are approximate too.
const FINISHES = {
  1: { name: 'Crown Gallery White', hex: '#DCDEDB' },              // Crown K9710C
  2: { name: 'Dulux Pure Brilliant White', hex: '#F8F8F6' },       // shown as a clean white, as it looks in the room
  3: { name: 'Howdens oak 3-strip', hex: '#D29A50', oak: true },    // SDH3220, as in the room photos; nearest RAL 1002
  // From the cupboards in an AI-generated picture of the room, corrected for
  // its dim, warm light; nearest RAL 7032 Pebble grey
  4: { name: 'AI Olive', hex: '#B8B0A4' },
  // Howdens Clerkenwell Gloss White (FRK24), as on the kitchen units: a crisp,
  // neutral high-gloss white, a hair warmer than the woodwork in the room photo
  5: { name: 'Clerkenwell Gloss White', hex: '#F5F4EF', gloss: true },
  // The blinds' fabric, Bella Brittany (blockout, The Fabric Box): a dusty
  // blue, averaged from the maker's swatch photo; nearest RAL 7040 / 7001
  6: { name: 'Bella Brittany', hex: '#85A3B4' },
  // The window panes as they show on screen (#B8C0BF in the island view), as
  // a solid colour that shows the same under the room's light
  7: { name: 'Blinds as drawn', hex: '#BECEDB' },
  // The kitchen's own colours, as drawn: its light stone laminate worktop,
  // and the island's warmer painted white
  8: { name: 'Kitchen worktop', hex: '#CFC3B0' },
  9: { name: 'Kitchen island', hex: '#EDE6D5' },
  10: { name: 'Kitchen island top', hex: '#D6A562' },                // the island's honey oak top, as a plain colour
  // The carpet (bedroom and stairs): Dormouse from the maker's swatch, the
  // colour from the room photos, that made lighter, and the colour from the
  // doorway photo, as it's drawn (floor.js's CARPET_COLOURS)
  11: { name: 'Cormar Dormouse', hex: CARPET_COLOURS.dormouse },
  12: { name: 'Carpet from the photos', hex: CARPET_COLOURS.fromPhotos },
  13: { name: 'Carpet, lighter', hex: CARPET_COLOURS.lighter },
  14: { name: 'Carpet from the doorway photo', hex: CARPET_COLOURS.doorwayPhoto },
};
const colourOf = code => RAL[code] ? { name: RAL[code][0], hex: RAL[code][1] } : FINISHES[code];

const COLOUR_TARGETS = {
  floor: { mats: [floorMat], room: 3 },
  cupboard: { mats: [carcassMat, doorMat, benchMat], follows: 'woodwork' },
  wall: { mats: [wallMat], room: 1 },
  woodwork: { mats: [frameMat, roomDoorMat], room: 2 },
  dresser: { mats: [dresserMat, dresserDoorMat], follows: 'cupboard' },
  carpet: { mats: [carpetMat], room: 14 },
  bedroomCupboard: { mats: [BEDROOM_MATERIALS.carcass, BEDROOM_MATERIALS.door], follows: 'cupboard' },
};


// Set one target to a RAL code or finish (0 for its default). Returns the
// colour's name, or null if the code isn't known.
// The code a target actually shows: its own, else its default
function shownCode(target) {
  const { room, follows } = COLOUR_TARGETS[target];
  return config.colours[target] || room || (follows ? shownCode(follows) : 0);
}

// A colour target's materials coloured as its setting (config.colours) says
function applyColour(target) {
  const { mats } = COLOUR_TARGETS[target];
  // Every target resolves to a colour: its own, its room finish, or the one it follows
  const colour = colourOf(shownCode(target));
  mats.forEach(m => {
    const oak = colour.oak && target === 'floor';
    m.map = oak ? oakBoards() : null;
    m.color.set(oak ? 0xffffff : colour.hex);
    // High-gloss finishes shine; the bench top stays matt
    m.roughness = colour.gloss && m !== benchMat ? 0.18 : 0.8;
    m.needsUpdate = true;
  });
  // Anything that follows this target, and is on its default, follows it now
  for (const [other, t] of Object.entries(COLOUR_TARGETS)) {
    if (t.follows === target && !config.colours[other]) applyColour(other);
  }
}
for (const target of Object.keys(COLOUR_TARGETS)) applyColour(target);   // the room as it is now, with AI Olive cupboards

// What the other pieces of the model use
export {
  COLOUR_TARGETS, FINISHES, applyColour, colourOf, shownCode
};
