import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';


const scene = new THREE.Scene();
// scene.add(new THREE.AxesHelper(1000));

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
camera.position.set(0, 1000, 3000);

// setupRenderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//light
{
  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(0, 5200, 0);
  spotLight.angle = Math.PI / 7;
  spotLight.penumbra = 0.1;
  spotLight.distance = 70000;

  spotLight.castShadow = true;
  const shadow = spotLight.shadow;
  shadow.mapSize.width = shadow.mapSize.height = 1024;
  shadow.camera.near = 600;
  shadow.camera.far = 1300;

  // scene.add(spotLight);
}

// PostProcessing 적용
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerHeight, window.innerHeight), 0, 0.1, 0.1);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);

const _bloomPass = bloomPass;
const _composer = composer;



//Model
let _mixer: THREE.AnimationMixer | null = null;
let _path: THREE.CatmullRomCurve3 | null = null;
let _bird: THREE.Object3D | null = null;
new GLTFLoader().load('models/phoenix_bird.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(2,2,2);
  model.rotation.y = -Math.PI / 2;
  const parent = new THREE.Object3D();
  parent.add(model);
  scene.add(parent)
  _bird = parent;



  model.traverse((obj3d: any) => {
    obj3d.castShadow = true;
    obj3d.receiveShadow = true;


    if(obj3d.material) {
      obj3d.material.depthWrite = true;
      obj3d.material.alphaTest = 0.5;

      if(obj3d.material.map) {
        obj3d.material.map.encoding = THREE.sRGBEncoding;
      }
    }
  })

  const clips = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const clip = clips[0];
  const action = mixer.clipAction(clip);
  action.play()
  _mixer = mixer;


  // 경로 설정
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(2000, -1100, -3000),
    new THREE.Vector3(-500, -900, 500),
    new THREE.Vector3(-1500, -800, -1500),
    new THREE.Vector3(1500, -700, -1500),

    new THREE.Vector3(1500, -600, 1500),
    new THREE.Vector3(-1500, -500, 1500),
    new THREE.Vector3(-1500, -400, -1500),
    new THREE.Vector3(1500, -300, -1500),

    new THREE.Vector3(1500, -200, 1500),
    new THREE.Vector3(-1500, -1500, 3500),
  ]);

  _path = path;
  const points = path.getPoints(1000);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x555555 });
  const pathLine = new THREE.Line(geometry, material);
  // scene.add(pathLine);


  // 바닥 설정
  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(7000, 7000),
    new THREE.MeshStandardMaterial({ color: 0x4f4f4f })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1100;
  floor.receiveShadow = true;
  scene.add(floor)
})


// Control
const controls = new OrbitControls(camera, renderer.domElement)

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  _composer.setSize(window.innerWidth, window.innerHeight);

  render();
}

let clock = new THREE.Clock();

function animate() {
  const delta = clock.getDelta(); // 이전 프레임과 현재 프레임의 시간 차이

  controls.update();

  if (_mixer) {
    _mixer.update(delta)
  }

  const time = clock.oldTime * 0.00003; // clock 객체가 생성된 이후에 경과된 시간
  if(_path) {
    const currentPosition = new THREE.Vector3();
    const nextPosition = new THREE.Vector3();

    _path.getPointAt(time % 1, currentPosition);
    _path.getPointAt((time+0.001) % 1, nextPosition);

    _bird?.position.copy(currentPosition)
    _bird?.lookAt(nextPosition.x, nextPosition.y, nextPosition.z);

    _bloomPass.strength += delta * 2;
  }


  render();
  requestAnimationFrame(animate);

}

function render() {
  // renderer.render(scene, camera);
  _composer.render()
}

animate();
