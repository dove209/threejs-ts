import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { gsap } from 'gsap';

const group = new THREE.Object3D();
const gridSize = 40;

const buildings: any = [];
const fogConfig = {
  color: '#353c3c',
  near: 1,
  far: 208,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#fff");
scene.fog = new THREE.Fog(fogConfig.color, fogConfig.near, fogConfig.far);

const AexisHelper = new THREE.AxesHelper(10);
const gridHelper = new THREE.GridHelper(200, 200)
// scene.add(gridHelper)
scene.add(AexisHelper)

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(3, 50, 155);


const ambientLight = new THREE.AmbientLight('#a00a0a');
scene.add(ambientLight);

const spotLight = new THREE.SpotLight('#ff0000', 1);
spotLight.position.set(641, -462, 509);
spotLight.castShadow = true;
scene.add(spotLight);

const pointLight = new THREE.PointLight('#ffff00', 4);
pointLight.position.set(18, 22, -9);
scene.add(pointLight);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio || 1);

const container = document.getElementById('world');
container?.appendChild(renderer.domElement);

//Ground
const planeGeometry = new THREE.PlaneBufferGeometry(200, 200);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: '#fff'
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotateX(-Math.PI / 2);
scene.add(plane);

const boxSize = 3;
const max = 0.009;
const min = 0.001;

const meshParams = {
  color: '#fff',
  metalness: 0.58,
  emissive: '#000000',
  roughness: 0.18
};

//Build Loader
const loader = new OBJLoader();
let models: any[] = []
loader.load('models/buildings.obj', function(model) {
  // buildings.obj file contains many models
  models = model.children.map((model) => {
    const scale = 0.01;
    model.scale.set(scale, scale, scale);

    model.position.set(0, -14, 0);

    model.receiveShadow = true;
    model.castShadow = true;

    return model;
  });

  const material = new THREE.MeshPhysicalMaterial(meshParams);

  function getRandomBuiding() {
    return models[Math.floor(Math.random() * Math.floor(models.length))];
  }

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const building = getRandomBuiding().clone();
      building.material = material;
      building.scale.y = Math.random() * (max - min + 0.01);
      building.position.x = (i * boxSize);
      building.position.z = (j * boxSize);

      group.add(building);

      buildings.push(building)
    }
  }

  scene.add(group);
  group.position.set(-gridSize - 10, 1, -gridSize - 10);

  //SortBuildingsByDistance
  buildings.sort((a: THREE.Mesh, b: THREE.Mesh) => {

    if(a.position.z > b.position.z) {
      return 1
    }
    if (a.position.z < b.position.z) {
      return -1;
    }
     return 0
  }).reverse();

  // Animate Models(showBuilding)
  buildings.map((building: THREE.Mesh, index: number) => {
    gsap.to(building.position, 0.3 + (index / 350), {
      y : 1,
      ease: "Power3.easeOut",
      delay: index / 350
    })
  })

})


console.log(buildings)








const controls = new OrbitControls(camera, renderer.domElement)






window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const stats = Stats()
document.body.appendChild(stats.dom);



function animate() {
  render()

  stats.update()

  requestAnimationFrame(animate)
}



function render() {
  renderer.render(scene, camera)
}

animate()

