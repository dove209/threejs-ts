import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlakesTexture } from './utils/flaskesTexture';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:false });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.5;
  
// Light
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(200, 200, 200);
scene.add(pointLight);

// Ball
let envmaploader = new THREE.PMREMGenerator(renderer);

new RGBELoader().load('img/neon_photostudio_2k.hdr', function(hdrmap) {
  let envmap = envmaploader.fromCubemap(hdrmap as any);

  let texture = new THREE.CanvasTexture(new FlakesTexture() as HTMLCanvasElement);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.x = 10;
  texture.repeat.y = 6;
  
  
  const ballGeo = new THREE.SphereBufferGeometry(100, 64, 64);
  const ballMat = new THREE.MeshPhysicalMaterial({
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness:0.9,
    roughness: 0.5,
    color: 0x8418ca,
    normalMap: texture,
    normalScale: new THREE.Vector2(0.15, 0.15),
    envMap: envmap.texture
  });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  scene.add(ballMesh)
})






function animate() {
  requestAnimationFrame(animate);

  controls.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
