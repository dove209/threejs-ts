import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const sceneMeshes: THREE.Mesh[] = [];

const loader = new GLTFLoader();
loader.load(
  "models/monkey.glb",
  function (gltf) {
    gltf.scene.traverse(function (child) {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.receiveShadow = true;
        m.castShadow = true;
        sceneMeshes.push(m);
      }
      if ((child as THREE.Light).isLight) {
        const l = child as THREE.Light;
        l.castShadow = true;
        l.shadow.bias = -0.003;
        l.shadow.mapSize.width = l.shadow.mapSize.height = 2048;
      }
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log(error);
  }
);

const raycaster = new THREE.Raycaster()

renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
function onDoubleClick(event: MouseEvent){
  const mouse = {
    x : (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y : -(event.clientY / renderer.domElement.clientHeight) * 2 + 1 
  }
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(sceneMeshes, false)
  if(intersects.length > 0) {
    const p = intersects[0].point;

    new TWEEN.Tween(sceneMeshes[0].position).to({
      x: p.x,
      z: p.z
    }, 500)
    .start()

    new TWEEN.Tween(sceneMeshes[0].position).to({
      y: p.y + 3
    }, 250)
    .easing(TWEEN.Easing.Cubic.Out)
    .start()
    .onComplete(() => {
      new TWEEN.Tween(sceneMeshes[0].position).to({
        y: p.y + 1
      }, 250)
      .easing(TWEEN.Easing.Bounce.Out)
      .start()
    })
  }
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  TWEEN.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
