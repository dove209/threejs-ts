import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(1000));

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(0, 100, 500);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 100, 0);

//light
{
  const addPointLight = (x: number, y: number, z: number, helperColor: any) => {
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 2000);
    pointLight.position.set(x, y, z);
    scene.add(pointLight);

    const pointLightHelper = new THREE.PointLightHelper(
      pointLight,
      10,
      helperColor
    );
    scene.add(pointLightHelper);
  };
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  addPointLight(500, 150, 500, 0xff0000);
  addPointLight(-500, 150, 500, 0xffff00);
  addPointLight(-500, 150, -500, 0x00ff00);
  addPointLight(500, 150, -500, 0x0000ff);

  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.2);
  shadowLight.position.set(200, 500, 200);
  shadowLight.target.position.set(0, 0, 0);
  shadowLight.castShadow = true;
  shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 1024;
  shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 700;
  shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -700;
  shadowLight.shadow.camera.near = 100;
  shadowLight.shadow.camera.far = 900;
  shadowLight.shadow.radius = 5;
  const shadowCameraHelper = new THREE.CameraHelper(shadowLight.shadow.camera);
  scene.add(shadowCameraHelper);
  scene.add(shadowLight);
  scene.add(shadowLight.target);

  const directionLightHelper = new THREE.DirectionalLightHelper(
    shadowLight,
    10
  );
  scene.add(directionLightHelper);
}

//Model
let _boxHelper: THREE.BoxHelper;
let _model: THREE.Object3D;
let _mixer: THREE.AnimationMixer;
let _animationMap: any = {};
let _currentAnimationAction: any;
const loader = new GLTFLoader();
loader.load("models/character.glb", (gltf) => {
  const model = gltf.scene;
  scene.add(model);
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });

  const animationClips = gltf.animations;
  const mixer = new THREE.AnimationMixer(model);
  const animationsMap: any = {};
  animationClips.forEach((clip) => {
    const name = clip.name;
    animationsMap[name] = mixer.clipAction(clip);
  });
  _mixer = mixer;
  _animationMap = animationsMap;
  _currentAnimationAction = animationsMap["Idle"];
  _currentAnimationAction.play();

  const box = new THREE.Box3().setFromObject(model);
  model.position.y = (box.max.y - box.min.y) / 2;

  const boxHelper = new THREE.BoxHelper(model);
  scene.add(boxHelper);
  _boxHelper = boxHelper;
  _model = model;
});

//floor
const planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
const planeMet = new THREE.MeshPhongMaterial({ color: 0x878787 });
const plane = new THREE.Mesh(planeGeo, planeMet);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// 키보드 입력(캐릭터 이동)
let _pressedKeys: any = {};
document.addEventListener("keydown", (e) => {
  _pressedKeys[e.key.toLowerCase()] = true;
  processAnimation();
});
document.addEventListener("keyup", (e) => {
  _pressedKeys[e.key.toLowerCase()] = false;
  processAnimation();
});

const processAnimation = () => {
  const prevAnimationAction = _currentAnimationAction;
  if (_pressedKeys["w"] || _pressedKeys["a"] || _pressedKeys["s"] || _pressedKeys["d"]  ) {
    if (_pressedKeys["shift"]) {
      _currentAnimationAction = _animationMap["Run"];
    } else {
      _currentAnimationAction = _animationMap["Walk"];
    }
  } else {
    _currentAnimationAction = _animationMap["Idle"];
  }

  if(prevAnimationAction !== _currentAnimationAction) { //동작을 바꿀떄
    prevAnimationAction.fadeOut(0.5);
    _currentAnimationAction.reset().fadeIn(0.5).play();
  }
};

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

let clock = new THREE.Clock();
let delta = 0; // 이전 프레임과 현재 프레임의 시간 차이

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();
  controls.update();

  if (_boxHelper) {
    _boxHelper.update();
  }

  if (_mixer) {
    _mixer.update(delta);
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();
