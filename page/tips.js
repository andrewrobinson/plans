// Tips and pointing (a piece of living_room.js): the name of what's under
// the pointer, and where each thing is, for the views to aim at.
import * as THREE from 'three';
import { MM } from '../kit/floor_kit.js';
import { otherRoomPieces, BED_SPOTS } from '../other_room.js';
import { wickerBenches } from '../wicker_bench.js';
import { shoeRack } from '../shoe_rack.js';
import { garagePieces } from '../garage.js';
import { CASTOR_DESK } from '../castor_desk.js';
import {
  flat, SOFAS, STORED, cupboardSettings, currentSofa, deskSpot, frontFrom, frontGap, islandGroup, pieces, config, 
  storedSize, drawn, dresserSpan
} from '../flat_model.js';
import { ROOM_WIDTH, ROOM_DEPTH, floor } from '../floor.js';
import { camera, flatCamera, packingSpot, renderer, storedDrag, storedUnder } from '../living_room.js';

// The name and size of the thing under the pointer, in any view: on hover
// with a mouse, and for a moment after a tap on a touch screen
const tip = document.getElementById('tip');
let tipTimer = null;
function showTip(e) {
  const { k } = config.thingsToStore.shown && !storedDrag ? storedUnder(e, flat ? flatCamera : camera) : { k: -1 };
  if (k < 0) {
    tip.style.display = 'none';
    return;
  }
  const s = STORED[k], [w, d] = storedSize(k);
  tip.textContent = `${s.name}: ${s.round ? `${w} across` : `${w} × ${d} on the floor`}, ${s.h} high`;
  tip.style.display = 'block';
  const left = e.clientX + 14 + tip.offsetWidth > window.innerWidth ? e.clientX - 14 - tip.offsetWidth : e.clientX + 14;
  tip.style.left = `${left}px`;
  tip.style.top = `${e.clientY + 14}px`;
}
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' && !e.buttons) showTip(e);
  else if (e.pointerType === 'mouse') tip.style.display = 'none';   // not while rotating or panning
});
renderer.domElement.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
renderer.domElement.addEventListener('pointerup', e => {
  if (e.pointerType === 'mouse') return;
  showTip(e);
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { tip.style.display = 'none'; }, 2500);
});
// Things to look at that move with the option or the sliders: where to aim,
// room [x, y, height] in mm
// The middle of what's drawn, room [x, y, height] in mm
function middleOf(object) {
  const c = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  return [c.x / MM, c.z / MM, c.y / MM];
}
// A point given in a piece's own mm (across it, along it), on the floor,
// room [x, y] in mm, wherever the piece now stands and however it's turned
function pointOn(piece, [across, along]) {
  piece.updateWorldMatrix(true, false);
  const p = piece.localToWorld(new THREE.Vector3(across * MM, 0, along * MM));
  return [p.x / MM, p.z / MM];
}
// Sitting at the fold-down desk or the desk on castors: your eyes this far
// back from its front edge (chosen, as the seat's middle in a chair pulled
// up to it)
const DESK_SEAT_BACK = 350;
const anchors = {
  // Wherever they are, else where they'd be on the front wall
  dresser: () => pieces.dresser ? middleOf(pieces.dresser) : [(dresserSpan().x0 + dresserSpan().x1) / 2, ROOM_DEPTH - config.pieces.dresser.design.baseD / 2, config.pieces.dresser.design.h / 2],
  larder: () => pieces.larder ? middleOf(pieces.larder) : [frontFrom() + frontGap() / 2, ROOM_DEPTH - 250, 1000],
  island: () => middleOf(islandGroup),
  sofa: () => pieces.sofa ? middleOf(pieces.sofa) : [ROOM_WIDTH / 2, 2400, 500],
  // Sitting on it: in the middle, eyes over the back of the seat
  sofaSeat: () => {
    if (!SOFAS[config.pieces.sofa.design.model] || !pieces.sofa) return [ROOM_WIDTH / 2, 2500];
    const S = currentSofa();
    return pointOn(pieces.sofa, [0, -S.d / 2 + S.seatD - 100]);
  },
  cupboard: () => {                                             // the middle of its door, else the corner
    const at = packingSpot();
    return at ? [at.x, at.y, 1200] : [400, 400, 1200];
  },
  tv: () => drawn.tvAt ?? [ROOM_WIDTH / 2, 0, 1400],
  // Option 10's fold-down desk, as open: the middle of its top, and sitting
  // at it, facing the cupboard's side; with no desk, where option 12's
  // would be (living_room.configurations.js)
  foldDownDesk: () => {
    const desk = deskSpot(cupboardSettings());
    return desk ? [desk.x + desk.d / 2, (desk.y0 + desk.y1) / 2, desk.h] : [1150, 740, 740];
  },
  // The desk on castors, wherever it is, and sitting at it, at its front
  // (where it's drawn, else where it parks)
  castorDesk: () => (pieces.castorDesk ? middleOf(pieces.castorDesk) : [CASTOR_DESK.W / 2, 830, CASTOR_DESK.H]),
  castorDeskSeat: () => (pieces.castorDesk ? pointOn(pieces.castorDesk, [0, CASTOR_DESK.W + DESK_SEAT_BACK]) : [CASTOR_DESK.W + DESK_SEAT_BACK, 830]),
  foldDownDeskSeat: () => {
    const desk = deskSpot(cupboardSettings());
    return desk ? [desk.x + desk.d + DESK_SEAT_BACK, (desk.y0 + desk.y1) / 2] : [1750, 740];
  },
  // The bedroom's furniture (other_room.js), and where you lie on the bed
  // and stand beside it, as it's moved and turned
  bed: () => middleOf(otherRoomPieces.bed),
  bookcase: () => middleOf(otherRoomPieces.bookcase),
  pineCupboard: () => middleOf(otherRoomPieces.cupboard),
  bedroomBilly: () => middleOf(otherRoomPieces.billy),
  bedroomBillyChest: () => middleOf(otherRoomPieces.billyChest),
  bedroomIvar: () => middleOf(otherRoomPieces.ivar),
  bedsideTable: () => middleOf(otherRoomPieces.bedsideTable),
  bedsideTableByCupboard: () => middleOf(otherRoomPieces.bedsideTableByCupboard),
  kvistbro: () => middleOf(otherRoomPieces.kvistbro),
  laundryBasket: () => middleOf(otherRoomPieces.laundryBasket),
  newCupboard: () => {                                          // with none (switched off, or option 16), the pine cupboard's spot
    const newBox = new THREE.Box3().setFromObject(otherRoomPieces.newCupboard);
    return middleOf(newBox.isEmpty() ? otherRoomPieces.cupboard : otherRoomPieces.newCupboard);
  },
  mirror: () => middleOf(otherRoomPieces.mirror),
  bedPillow: () => pointOn(otherRoomPieces.bed, BED_SPOTS.pillow),
  bedSide: () => pointOn(otherRoomPieces.bed, BED_SPOTS.side),
  // The wicker bench (wicker_bench.js), wherever it is in each room
  hallBench: () => middleOf(wickerBenches.hallway),
  bedroomBench: () => middleOf(wickerBenches.bedroom),
  livingBench: () => middleOf(wickerBenches.livingRoom),
  // The shoe rack (shoe_rack.js), wherever it stands at the foot of the stairs
  shoeRack: () => middleOf(shoeRack),
  // Sean, Billy, BillyChest and the rest (garage.js), wherever they stand in the garage
  ...Object.fromEntries(Object.keys(garagePieces).map(piece => [piece, () => middleOf(garagePieces[piece])])),
};

// What the other pieces of the model use
export {
  anchors
};
