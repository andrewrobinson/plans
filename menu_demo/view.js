// The 3D view: the three.js scene, its lights, and a camera you can turn
// around the room by dragging (or zoom with the scroll wheel or a pinch).

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ROOM_WIDTH, ROOM_DEPTH, MILLIMETRES_TO_METRES } from './room.js';

// A room point (x, y, z) in mm, as a three.js point in metres (see room.js)
function scenePointFromRoom(x, y, z) {
  return new THREE.Vector3(x * MILLIMETRES_TO_METRES, z * MILLIMETRES_TO_METRES, y * MILLIMETRES_TO_METRES);
}

// Where the camera starts: up high, beyond the front-right corner, looking
// down at the middle of the floor
const CAMERA_STARTS_AT = scenePointFromRoom(ROOM_WIDTH + 2500, ROOM_DEPTH + 3500, 5500);
const CAMERA_LOOKS_AT = scenePointFromRoom(ROOM_WIDTH / 2, ROOM_DEPTH / 2, 0);

// Bright, even light like a lit room: soft light from all round, a main light
// that casts shadows, and a weaker fill light from the other side
function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xe8dcc8, 1.9));
  const fillLight = new THREE.DirectionalLight(0xfff6ea, 0.8);
  fillLight.position.set(8, 3, 3);
  scene.add(fillLight);
  const mainLight = new THREE.DirectionalLight(0xfff4e6, 1.3);
  mainLight.position.set(4, 6, 7);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  Object.assign(mainLight.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  scene.add(mainLight);
}

// Sets up the view inside `container` (an element that fills the window) and
// keeps drawing it. Returns the scene, to add things to, and the camera, for
// the debug text.
export function createView(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef0f2);
  addLights(scene);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
  camera.position.copy(CAMERA_STARTS_AT);
  const cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.target.copy(CAMERA_LOOKS_AT);
  cameraControls.enableDamping = true;                               // turning eases to a stop
  cameraControls.update();

  // Keep the drawing the size of its container, as the window changes
  function fitToContainer() {
    const width = container.clientWidth, height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', fitToContainer);
  fitToContainer();

  // Draw every frame, so dragging the camera and moving the box are smooth.
  // `afterEachFrame` lets the debug text keep up with the camera.
  const afterEachFrame = [];
  renderer.setAnimationLoop(() => {
    cameraControls.update();
    renderer.render(scene, camera);
    for (const callback of afterEachFrame) callback();
  });

  return { scene, camera, cameraControls, afterEachFrame };
}
