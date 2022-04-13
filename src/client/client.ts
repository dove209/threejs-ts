import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import State from 'three/examples/jsm/libs/stats.module';
import { CSG } from './utils/CSGMesh';

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const light1 = new THREE.SpotLight();
light1.position.set(2.5, 5, 5);
light1.angle = Math.PI / 4;
light1.penumbra = 0.5;
light1.castShadow = true;
light1.shadow.mapSize.width = light1.shadow.mapSize.height = 1024;
light1.shadow.camera.near = 0.5;
light1.shadow.camera.far = 20;
scene.add(light1);

const light2 = new THREE.SpotLight();
light2.position.set(-2.5, 5, 5);
light2.angle = Math.PI / 4;
light2.penumbra = 0.5;
light2.castShadow = true;
light2.shadow.mapSize.width = light2.shadow.mapSize.height = 1024;
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 20;
scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0.5, 2, 2.5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const material = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load('img/grid.png')
})

{
  const cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
  )

  const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 8, 8),
    new THREE.MeshPhongMaterial({ color: 0x0000ff })
  )

  const cylinderMesh1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshPhongMaterial({ color: 0x00ff00 })
  )

  const cylinderMesh2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshPhongMaterial({ color: 0x00ff00 })
  )

  const cylinderMesh3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.85, 2, 8, 1, false),
    new THREE.MeshPhongMaterial({ color: 0x00ff00 })
  )

  cubeMesh.position.set(-5, 0, -6);
  scene.add(cubeMesh);
  sphereMesh.position.set(-2, 0, -6);
  scene.add(sphereMesh)

  const cubeCSG = CSG.fromMesh(cubeMesh);
  const sphereCSG = CSG.fromMesh(sphereMesh);

  const cubeSphereIntersectCSG = cubeCSG.intersect(sphereCSG);
  const cubeSphereIntersectMesh = CSG.toMesh(
    cubeSphereIntersectCSG,
    new THREE.Matrix4()
  )
  cubeSphereIntersectMesh.material = new THREE.MeshPhongMaterial({
    color: 0xff00ff
  })
  cubeSphereIntersectMesh.position.set(-2.5, 0, -3);
  scene.add(cubeSphereIntersectMesh);


  cylinderMesh1.position.set(1, 0, -6)
  scene.add(cylinderMesh1);
  cylinderMesh2.position.set(3, 0, -6)
  cylinderMesh2.geometry.rotateX(Math.PI / 2);
  scene.add(cylinderMesh2);
  cylinderMesh3.position.set(5, 0, -6);
  cylinderMesh3.geometry.rotateZ(Math.PI / 2)
  scene.add(cylinderMesh3);

  const cylinderCSG1 = CSG.fromMesh(cylinderMesh1);
  const cylinderCSG2 = CSG.fromMesh(cylinderMesh2);
  const cylinderCSG3 = CSG.fromMesh(cylinderMesh3);

  const cylinderUnionCSG = cylinderCSG1.union(cylinderCSG2.union(cylinderCSG3))
  const cylinderUnionMesh = CSG.toMesh(
    cylinderUnionCSG,
    new THREE.Matrix4()
  )
  cylinderUnionMesh.material = new THREE.MeshPhongMaterial({
    color: 0xffa500
  })
  cylinderUnionMesh.position.set(2.5, 0, -3);
  scene.add(cylinderUnionMesh)

  const finalCSG = cubeSphereIntersectCSG.subtract(cylinderUnionCSG);
  const finalMesh = CSG.toMesh(finalCSG, new THREE.Matrix4())
  finalMesh.material = material;
  scene.add(finalMesh)

}


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)
  render();
}

const stats = State();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock()
let delta;

function animate() {
  requestAnimationFrame(animate)

  controls.update();

  delta = Math.min(clock.getDelta(), 0.1)



  render()
  stats.update()

}

function render() {
  renderer.render(scene, camera)
}

animate()

