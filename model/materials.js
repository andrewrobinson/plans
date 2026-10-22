// The model's materials (a piece of flat_model.js): the colours and
// finishes things are drawn in, made once as it loads. applyColour()
// (model/colours.js) changes those the settings choose.
import * as THREE from 'three';
import { material } from '../kit/floor_kit.js';
import { CUPBOARD_MATERIALS, makeMaterials } from '../corner_cupboard.js';

const { carcass: carcassMat, shelf: shelfMat, door: doorMat, handle: handleMat, oak: oakMat } = CUPBOARD_MATERIALS;
const benchMat = material(0xe8d9bf);
const kitchenMat = new THREE.MeshStandardMaterial({ color: 0xf5f4ef, roughness: 0.18 });   // Clerkenwell Gloss White
const worktopMat = material(0xcfc3b0);                                                     // light stone laminate
const islandMat = material(0xede6d5);                                                      // the island's painted white, warmer than the kitchen
const islandTopMat = material(0xd6a562);                                                   // the island's oak top
const roomDoorMat = material(0x8fb3d9);
const BEDROOM_MATERIALS = makeMaterials();
const tvMat = material(0x1a1a1a);
const screenMat = new THREE.MeshStandardMaterial({ color: 0x0c1824, roughness: 0.3, metalness: 0.2 });
// Each box's default (`room`) is the room as it is now: its own finishes. The
// cupboards (and the bench with them) default to whatever the woodwork is.
const dresserMat = material(0xc9a877), dresserDoorMat = material(0xd8bd92);   // set by applyColour() (model/colours.js)
const sofaMat = material(0x9da3a6);

// What the other pieces of the model use
export {
  BEDROOM_MATERIALS, benchMat, carcassMat, doorMat, dresserDoorMat, dresserMat, handleMat, islandMat, 
  islandTopMat, kitchenMat, oakMat, roomDoorMat, screenMat, shelfMat, sofaMat, tvMat, worktopMat
};
