import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import { gsap } from 'gsap';

const radians = (degrees: number): number => {
  return degrees * Math.PI / 180
}

const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

const map = (value: number, start1: number, stop1: number, start2: number, stop2: number): number => {
  return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

const getRandomGeometry = (): any => {
  return geometries[Math.floor(Math.random() * Math.floor(geometries.length))]
}

const getMesh = (geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const AexisHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(10, 10)
// scene.add(gridHelper)
// scene.add(AexisHelper)

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 65, 0);
camera.rotation.x = -1.57;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio || 1);

const container = document.getElementById('world');
container?.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight('#2900af', 1);
scene.add(ambientLight)

const spotLight = new THREE.SpotLight('#e000ff', 1, 1000);
spotLight.position.set(0, 27, 0)
spotLight.castShadow = true;
scene.add(spotLight);

const RectLight = new THREE.RectAreaLight('#0077ff', 1, 2000, 2000);
RectLight.position.set(5, 50, 50)
RectLight.lookAt(0, 0, 0);
scene.add(RectLight);

const pointLight = new THREE.PointLight('#ffffff', 1, 1000, 1);
pointLight.position.set(0, 20, 0);
scene.add(pointLight)

// const controls = new OrbitControls(camera, renderer.domElement)

const meshPrams = {
  color: '#ff00ff',
  metalness: 0.58,
  emissive: '#000000',
  roughness: 0.18
}

const geomRoundBox = new RoundedBoxGeometry(0.5, 0.5, 0.5, .02, 0.2);

const geomCone = new THREE.ConeBufferGeometry(0.3, 0.5, 32);

const torus = new THREE.SphereBufferGeometry(0.3, 6, 5);


let geometries = [geomRoundBox, geomCone, torus];
let gutter = { size: 1 };
let meshes: any[] = []
let grid = { cols: 14, rows: 6 };
let groupMesh = new THREE.Object3D();

const mateial = new THREE.MeshPhysicalMaterial(meshPrams)

for (let row = 0; row < grid.rows; row++) {
  meshes[row] = [];
  for (let col = 0; col < grid.cols; col++) {
    const geometry = getRandomGeometry()
    const mesh = getMesh(geometry, mateial);
    mesh.position.set(col + (col * gutter.size), 0, row + (row * gutter.size));
    groupMesh.add(mesh);
    meshes[row][col] = mesh
  }
}

const centerX = ((grid.cols - 1) + ((grid.cols - 1) * gutter.size)) * 0.5;
const centerZ = ((grid.rows - 1) + ((grid.rows - 1) * gutter.size)) * 0.5;
groupMesh.position.set(-centerX, 0, -centerZ);
scene.add(groupMesh)


const geomFloor = new THREE.PlaneBufferGeometry(100, 100);
const matFloor = new THREE.MeshPhongMaterial({ color: '#000000' });
const floor = new THREE.Mesh(geomFloor, matFloor);
floor.receiveShadow = true;
floor.rotateX(-Math.PI / 2);
scene.add(floor)



window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const stats = Stats()
document.body.appendChild(stats.dom);

let mousePos = {
  x: 0,
  y: 0
}

// const controls = new OrbitControls(camera, renderer.domElement);
renderer.domElement.addEventListener('mousemove', handleMouseMove, false);
function handleMouseMove(e: MouseEvent) {
  let tx = -1 + (e.clientX / renderer.domElement.clientWidth) * 2
  let ty = 1 - (e.clientY / renderer.domElement.clientHeight) * 2

  mousePos = {
    x: tx,
    y: ty
  }
};


function draw() {
  raycaster.setFromCamera(mousePos, camera);

  const intersects = raycaster.intersectObjects([floor]);
  if (intersects.length) {
    const { x, z } = intersects[0].point;

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const mesh = meshes[row][col];

        const mouseDistance = distance(x, z, mesh.position.x + groupMesh.position.x, mesh.position.z + groupMesh.position.z);

        const maxPositioY = 10;
        const minPositionY = 0;
        const startDistance = 5;
        const endDistance = 0;
        const y = map(mouseDistance, startDistance, endDistance, minPositionY, maxPositioY);

        gsap.to(mesh.position, .4, { y: y < 1 ? 1 : y });

        const scaleFactor = mesh.position.y / 2.5;

        const scale = scaleFactor < 1 ? 1 : scaleFactor;

        gsap.to(mesh.scale, 0.4, {
          ease: "back.out.config(1.7)",
          x: scale,
          y: scale,
          z: scale
        })

        gsap.to(mesh.rotation, 0.7, {
          ease: "back.Out.config(1.7)",
          x: map(mesh.position.y, -1, 1, radians(45), 0),
          y: map(mesh.position.y, -1, 1, radians(-90), 0),
          z: map(mesh.position.y, -1, 1, radians(90), 0),
        })
      }
    }
  }
}


function animate() {
  draw()

  render()

  stats.update()

  requestAnimationFrame(animate)
}



function render() {
  renderer.render(scene, camera)
}

animate()

