// The page's stage (a piece of living_room.js): the renderer, cameras and
// controls (kit/floor_kit.js's createStage()), with the model in the scene.
import { createStage } from '../kit/floor_kit.js';
import { world } from '../flat_model.js';

// The page: the stage, with the model (flat_model.js) in it
const { scene, renderer, camera, controls, flatCamera, flatControls } = createStage(document.getElementById('view'));
scene.add(world);

// What the other pieces of the model use
export {
  camera, controls, flatCamera, flatControls, renderer, scene
};
