import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { Octree } from 'three/examples/jsm/math/Octree';
import { Capsule } from 'three/examples/jsm/math/Capsule';

let speed = 0;
let maxSpeed = 0;
let acceleration = 0;

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
controls.enablePan = false;
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

// 충돌 구현
let worldOctree = new Octree();




//Model
let _boxHelper: THREE.BoxHelper;
let _model: THREE.Object3D;
let _mixer: THREE.AnimationMixer;
let _animationMap: any = {};
let _currentAnimationAction: any;
const loader = new GLTFLoader();
let modelCapsule: any;
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

  const height = box.max.y - box.min.y;
  const diameter = box.max.z - box.min.z;

  modelCapsule = new Capsule(
    new THREE.Vector3(0, diameter/2, 0), //start
    new THREE.Vector3(0, height - diameter / 2, 0), //end
    diameter / 2  //radius
  )

  const boxHelper = new THREE.BoxHelper(model);
  scene.add(boxHelper);
  _boxHelper = boxHelper;
  _model = model;

  //장애물 추가
  const boxG = new THREE.BoxGeometry(100, diameter-5, 100);
  const boxM = new THREE.Mesh(boxG, planeMet);
  boxM.receiveShadow = true;
  boxM.castShadow = true;
  boxM.position.set(150, 0, 0);
  scene.add(boxM);
  worldOctree.fromGraphNode(boxM)
});

//floor
const planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
const planeMet = new THREE.MeshPhongMaterial({ color: 0x878787 });
const plane = new THREE.Mesh(planeGeo, planeMet);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);
worldOctree.fromGraphNode(plane);

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
      maxSpeed = 350;
      acceleration = 3;
    } else {
      _currentAnimationAction = _animationMap["Walk"];
      maxSpeed = 80;
      acceleration = 3;
    }
  } else {
    _currentAnimationAction = _animationMap["Idle"];
    speed = 0
    maxSpeed = 0;
    acceleration = 0;
  }

  if(prevAnimationAction !== _currentAnimationAction) { //동작을 바꿀떄
    prevAnimationAction.fadeOut(0.5);
    _currentAnimationAction.reset().fadeIn(0.5).play();
  }
};

let previousDirectionOffset = 0;

const directionOffset = () => {
  const pressedKeys = _pressedKeys;
  let directionOffset = 0 //w
  if(pressedKeys['w']) {
    if(pressedKeys['a']) {
      directionOffset = Math.PI / 4 // w + a (45도)
    } else if(pressedKeys['d']) {
      directionOffset = - Math.PI / 4 // w + d(-45도)
    }
  } else if (pressedKeys['s']) {
    if(pressedKeys['a']) {
      directionOffset = Math.PI / 4 + Math.PI / 2 // s + a(135도)
    } else if(pressedKeys['d']) {
      directionOffset = - Math.PI / 4 - Math.PI / 2 // s + d(-135도)
    } else {
      directionOffset = Math.PI // s (180도)
    }
  } else if (pressedKeys['a']) {
    directionOffset = Math.PI / 2 // a (90도)
  } else if (pressedKeys['d']) {
    directionOffset = - Math.PI / 2 // d (-90도)
  } else {
    directionOffset = previousDirectionOffset;
  }

  previousDirectionOffset = directionOffset;

  return directionOffset;
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

let clock = new THREE.Clock();
let delta = 0; // 이전 프레임과 현재 프레임의 시간 차이
let bOnTheGround = false; //true이면 지면에 있고, false이면 케릭터가 허공에 있다.
let fallingAcceleration = 0;
let fallingSpeed = 0;

function animate() {
  requestAnimationFrame(animate);

  delta = clock.getDelta();
  controls.update();

  if (_boxHelper) {
    _boxHelper.update();
  }

  if (_mixer) {
    _mixer.update(delta);

    // 케릭터가 카메라가 바라보는 방향과 일치시키기
    const angleCameraDirectionAxisY = Math.atan2(
      (camera.position.x - _model.position.x),
      (camera.position.z - _model.position.z)
    ) + Math.PI;
    
    const rotateQuarternion = new THREE.Quaternion();
    rotateQuarternion.setFromAxisAngle(
      new THREE.Vector3(0,1,0),
      angleCameraDirectionAxisY + directionOffset()
    )
    _model.quaternion.rotateTowards(rotateQuarternion, THREE.MathUtils.degToRad(5))
  
    // 캐릭터 이동하기
    const walkDirection = new THREE.Vector3();
    camera.getWorldDirection(walkDirection);
    walkDirection.y = bOnTheGround ? 0 : -1;
    walkDirection.normalize();
    walkDirection.applyAxisAngle(new THREE.Vector3(0,1,0), directionOffset());

    if(speed < maxSpeed) speed += acceleration
    else speed -= acceleration * 2;

    if(!bOnTheGround) {
      fallingAcceleration += 1;
      fallingSpeed += Math.pow(fallingAcceleration, 2);
    } else {
      fallingAcceleration = 0;
      fallingSpeed = 0;
    }

    const velocity = new THREE.Vector3(
      walkDirection.x * speed,
      walkDirection.y * fallingSpeed,
      walkDirection.z * speed
    )

    const deltaPosition = velocity.clone().multiplyScalar(delta);

    modelCapsule.translate(deltaPosition);

    const result = worldOctree.capsuleIntersect(modelCapsule);
    if(result) { // 충돌한 경구
      modelCapsule.translate(result.normal.multiplyScalar(result.depth));
      bOnTheGround = true;
    } else { // 충돌하지 않은 경우
      bOnTheGround = false;
    }

    const previousPosition = _model.position.clone();
    const capsuleHeight =  modelCapsule.end.y - modelCapsule.start.y + modelCapsule.radius*2;
    _model.position.set(
      modelCapsule.start.x,
      modelCapsule.start.y - modelCapsule.radius + capsuleHeight / 2,
      modelCapsule.start.z
    )

    //카메라가 캐릭터 따라가기
    // camera.position.x += moveX;
    // camera.position.z += moveZ;
    camera.position.x -= previousPosition.x - _model.position.x;
    camera.position.z -= previousPosition.z - _model.position.z
    controls.target.set(
      _model.position.x,
      _model.position.y,
      _model.position.z
    )
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}

animate();