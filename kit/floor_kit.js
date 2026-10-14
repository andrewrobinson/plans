// The engine for the floor plan pages: what any room needs, and nothing
// about one room in particular. An ES module: room_3d.html imports it, so
// the page needs a server (GitHub Pages, the installed app, or
// `python3 serve.py` here), as menu_demo/ does. three.js comes from the
// page's import map.
//
// Coordinates, as in each room: mm, x along the room's back wall from its
// left wall, y from the back wall towards the front, z up. The scene is y-up
// in metres: room (x, y, z) -> scene (x, z, y).
//
// REFACTOR_PLAN.md step 4 moves the general code here a piece at a time.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const MM = 0.001;

// ---------------------------------------------------------------------------
// The stage: the scene, its renderer (its canvas put in `container`), the 3D
// camera and the 2D views' camera, each with its controls, and the lights
// ---------------------------------------------------------------------------
export function createStage(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeef0f2);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // The 2D views: a parallel projection, to scale, with panning and zooming
  // but no rotating
  const flatCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const flatControls = new OrbitControls(flatCamera, renderer.domElement);
  flatControls.enableRotate = false;
  flatControls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  flatControls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN };
  flatControls.enabled = false;

  // Bright, even light like a lit room, so white paint reads as white on every
  // wall: soft light all round, a main light casting shadows, and a fill light
  // on the left wall (the door and its frame) from across the room
  scene.add(new THREE.HemisphereLight(0xfffaf2, 0xe8dcc8, 1.9));     // a touch warm, as in the room photos
  const fill = new THREE.DirectionalLight(0xfff6ea, 0.8);
  fill.position.set(8, 3, 3);
  scene.add(fill);
  const sun = new THREE.DirectionalLight(0xfff4e6, 1.3);
  sun.position.set(4, 6, 7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 });
  scene.add(sun);

  return { scene, renderer, camera, controls, flatCamera, flatControls };
}

// ---------------------------------------------------------------------------
// Drawing in mm
// ---------------------------------------------------------------------------
export const material = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x3b2a12 });

// A box from room corner (x0, y0, z0) to (x1, y1, z1), in mm.
export function box(x0, y0, z0, x1, y1, z1, mat, parent, edges = true) {
  if (x1 <= x0 || y1 <= y0 || z1 <= z0) return null;          // nothing to draw, e.g. with no left-wall cupboard
  const g = new THREE.BoxGeometry((x1 - x0) * MM, (z1 - z0) * MM, (y1 - y0) * MM);
  const m = new THREE.Mesh(g, mat);
  m.position.set((x0 + x1) / 2 * MM, (z0 + z1) / 2 * MM, (y0 + y1) / 2 * MM);
  m.castShadow = m.receiveShadow = true;
  if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMaterial));
  parent.add(m);
  return m;
}

// A flat slab from z0 to z1 whose plan is the polygon `points` ([x, y] in mm)
export function slab(points, z0, z1, mat, parent) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: (z1 - z0) * MM, bevelEnabled: false });
  g.rotateX(Math.PI / 2);                                       // plan (x, y) -> scene (x, z), extruded downwards
  const m = new THREE.Mesh(g, mat);
  m.position.y = z1 * MM;
  m.castShadow = m.receiveShadow = true;
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMaterial));
  parent.add(m);
  return m;
}

// Names a part, mesh `m` (a cupboard's board, say, for the cutting list)
export function part(name, m) {
  if (m) m.userData.part = name;
  return m;
}

// A door that turns about a vertical hinge at room (hx, hy). The door's
// boxes are given in mm relative to the hinge.
export function hinge(hx, hy, parent) {
  const g = new THREE.Group();
  g.userData.hinge = true;                                       // a door's, so not the cupboard's outline
  g.position.set(hx * MM, 0, hy * MM);
  parent.add(g);
  return g;
}

// As hinge(), but the door's own x axis runs at `degrees` from the room's x
// axis, turning from +x towards -y. `dir` sets which way the slider opens it.
export function skewHinge(hx, hy, degrees, dir, parent) {
  const outer = hinge(hx, hy, parent);
  outer.rotation.y = THREE.MathUtils.degToRad(degrees);
  const inner = new THREE.Group();
  inner.userData.dir = dir;
  outer.add(inner);
  return inner;
}
