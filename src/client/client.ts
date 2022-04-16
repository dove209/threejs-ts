import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let Colors = {
  red: 0xf25346,
  whithe: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
}


const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

const AexisHelper = new THREE.AxesHelper(500);
// scene.add(AexisHelper)


const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
camera.position.set(0, 100, 200);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio || 1);

const container = document.getElementById('world');
container?.appendChild(renderer.domElement);


const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
shadowLight.position.set(150, 350, 350);
shadowLight.castShadow = true;
shadowLight.shadow.camera.left = -400;
shadowLight.shadow.camera.right = 400;
shadowLight.shadow.camera.top = 400;
shadowLight.shadow.camera.bottom = -400;
shadowLight.shadow.camera.near = 1;
shadowLight.shadow.camera.far = 1000;
shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048;
let ambientLight = new THREE.AmbientLight(0xdc8874, 0.5)
scene.add(ambientLight);
scene.add(hemisphereLight);
scene.add(shadowLight)

// 바다 Object
const seaGeometry = new THREE.SphereGeometry(650, 18, 8);
seaGeometry.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
const seaMaterial = new THREE.MeshPhongMaterial({
  color: Colors.blue,
  transparent: true,
  opacity: 0.6,
  flatShading: true
})

const seaMesh = new THREE.Mesh(seaGeometry, seaMaterial);

seaMesh.receiveShadow = true;
seaMesh.position.y = -600;
scene.add(seaMesh)

// 구름 Object
function Cloud() {
  const cloudObject = new THREE.Object3D();
  let nBlocs = 3+Math.floor(Math.random()*3);
  for(let i = 0; i < nBlocs; i++) {
    let m = new THREE.Mesh(
      new THREE.BoxBufferGeometry(20, 20, 20),
      new THREE.MeshPhongMaterial({
        color: Colors.whithe
      })
    )
    m.position.set(i * 15, Math.random()* 10, Math.random()*10);
    m.rotation.z = Math.random() * Math.PI * 2;
    m.rotation.y = Math.random() * Math.PI * 2;

    let size = 0.1 + Math.random()*0.9;
    m.scale.set(size, size, size);

    m.castShadow = true;
    m.receiveShadow = true;

    cloudObject.add(m)
  }
  return cloudObject;
}

// 하늘
function Sky() {
  const skyObject = new THREE.Object3D();
  let nClouds = 20;

  let stepAngle = Math.PI *  2 / nClouds;

  for(let i=0;  i < nClouds; i++) {
    let c = Cloud();

    let a = stepAngle * i;
    let h = 750 + Math.random() * 20;

    c.position.y = Math.sin(a) * h;
    c.position.x = Math.cos(a) * h;
    c.position.z = -400 - Math.random() * 400;
    c.rotation.z = a + Math.PI / 2;

    let size = 1 + Math.random() * 2;
    c.scale.set(size, size, size);

    skyObject.add(c)
  }
  return skyObject;
}

const skyMesh = Sky();
skyMesh.position.y = -600;
scene.add(skyMesh)

// 파일럿
function Pilot() {
  const mesh = new THREE.Object3D();
  mesh.name = 'pilot';

  //Body
  let bodyGeom = new THREE.BoxGeometry(15, 15, 15);
  let bodyMat = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
  let body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2, -12, 0);
  mesh.add(body);

  //Face
  let faceGeom = new THREE.BoxGeometry(10, 10, 10);
  let faceMat = new THREE.MeshPhongMaterial({ color: Colors.pink });
  let face = new THREE.Mesh(faceGeom, faceMat);
  mesh.add(face);

  //Hair element
  let hairGeom = new THREE.BoxGeometry(4, 4, 4);
  let hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  let hair = new THREE.Mesh(hairGeom, hairMat);
  hairGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 2, 0));

  let hairs = new THREE.Object3D();
  let hairsTop = new THREE.Object3D();
  hairsTop.name = 'hairsTop';

  for (let i = 0;  i < 12; i++) {
    let h = hair.clone();
    let col = i % 3;
    let row = Math.floor(i/3);
    let startPosZ = -4;
    let startPosX = -4;
    h.position.set(startPosX + row * 4, 0, startPosZ + col*4);
    hairsTop.add(h)
  }
  hairs.add(hairsTop);

  // 옆머리
  let hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
  hairSideGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(-6, 0, 0));
  let hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  let hairSideL = new THREE.Mesh(hairSideGeom, hairMat);
  hairSideR.position.set(8, -2, 6);
  hairSideL.position.set(8, -2, -6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  //뒷머리
  let hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
  let hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1, -4, 0);
  hairs.add(hairBack);
  
  hairs.position.set(-5, 5, 0)
  mesh.add(hairs)

  // 안경
  let glassGeom = new THREE.BoxGeometry(5, 5, 5);
  let glassMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  let glassR = new THREE.Mesh(glassGeom, glassMat);
  glassR.position.set(6, 0, 3);
  let glassL = glassR.clone();
  glassL.position.z = -glassR.position.z;

  let glassAGeom = new THREE.BoxGeometry(11, 1, 11);
  let glassA = new THREE.Mesh(glassAGeom, glassMat);

  mesh.add(glassR);
  mesh.add(glassL);
  mesh.add(glassA);

  // 귀
  let earGeom = new THREE.BoxGeometry(2, 3, 2);
  let earL = new THREE.Mesh(earGeom, faceMat);
  earL.position.set(0, 0, -6);
  let earR = earL.clone();
  earR.position.z = -earL.position.z;

  mesh.add(earL);
  mesh.add(earR)

  return mesh;
}

// 비행기
function AirPlane () {
  const mesh = new THREE.Object3D();

  // 조종석
  // const geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
  // create a simple square shape. We duplicate the top left and bottom right
  // vertices because each vertex needs to appear once per triangle.
  const matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
  let geomCockpit = new THREE.BufferGeometry()
  const points = [
      // front
      new THREE.Vector3(-40, -5, 15),  // 
      new THREE.Vector3(40, -25, 25),
      new THREE.Vector3(-40, 15, 15),   //

      new THREE.Vector3(-40, 15, 15),   //
      new THREE.Vector3(40, -25, 25),
      new THREE.Vector3(40, 25, 25),
      // right
      new THREE.Vector3(40, -25, 25),
      new THREE.Vector3(40, -25, -25),
      new THREE.Vector3(40, 25, 25),

      new THREE.Vector3(40, 25, 25),
      new THREE.Vector3(40, -25, -25),
      new THREE.Vector3(40, 25, -25),
      
      //back
      new THREE.Vector3(40, -25, -25),
      new THREE.Vector3(-40, -5, -15), //
      new THREE.Vector3(40, 25, -25),

      new THREE.Vector3(40, 25, -25),
      new THREE.Vector3(-40, -5, -15), //
      new THREE.Vector3(-40, 15, -15),  //

      //left
      new THREE.Vector3(-40, -5, -15),  //
      new THREE.Vector3(-40, -5, 15),   // 
      new THREE.Vector3(-40, 15, -15),   //

      new THREE.Vector3(-40, 15, -15),   //
      new THREE.Vector3(-40, -5, 15),   //
      new THREE.Vector3(-40, 15, 15),    //

      //top
      new THREE.Vector3(40, 25, -25),
      new THREE.Vector3(-40, 15, -15),   //
      new THREE.Vector3(40, 25, 25),

      new THREE.Vector3(40, 25, 25),
      new THREE.Vector3(-40, 15, -15),   //
      new THREE.Vector3(-40, 15, 15),     //

      //bottom
      new THREE.Vector3(40, -25, 25),
      new THREE.Vector3(-40, -5, 15),   //
      new THREE.Vector3(40, -25, -25),

      new THREE.Vector3(40, -25, -25),
      new THREE.Vector3(-40, -5, 15),   //
      new THREE.Vector3(-40, -5, -15),  //

  ]
  geomCockpit.setFromPoints(points)
  const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = cockpit.receiveShadow = true;
  mesh.add(cockpit)

  // 엔진
  const geomEngin = new THREE.BoxBufferGeometry(20, 50, 50, 1, 1, 1);
  const matEngin = new THREE.MeshPhongMaterial({ color: Colors.whithe, flatShading:true });
  const engine = new THREE.Mesh(geomEngin, matEngin);
  engine.position.x = 40;
  engine.castShadow = engine.receiveShadow = true;
  mesh.add(engine);

  // 꼬리
  const geomTail = new THREE.BoxBufferGeometry(15, 20, 5, 1, 1, 1);
  const matTail = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading:true });
  const tail = new THREE.Mesh(geomTail, matTail);
  tail.position.set(-35, 25, 0);
  tail.castShadow = tail.receiveShadow = true;
  mesh.add(tail);

  // 바퀴몸통
  const geomWheelBody = new THREE.BoxBufferGeometry(40, 20, 60, 1, 1, 1);
  const matWheelBody = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
  const WheelBody = new THREE.Mesh(geomWheelBody, matWheelBody);
  WheelBody.position.set(10, -15, 0);
  WheelBody.castShadow = WheelBody.receiveShadow = true;
  mesh.add(WheelBody);

  // 바퀴(큰)
  const geombigWheel = new THREE.BoxBufferGeometry(30, 30, 5, 1, 1, 1);
  const matbigWheel = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading:true });
  const bigWheel1 = new THREE.Mesh(geombigWheel, matbigWheel);
  bigWheel1.position.set(10, -25, 20);
  bigWheel1.castShadow = bigWheel1.receiveShadow = true;
  mesh.add(bigWheel1);
  const bigWheel2 = new THREE.Mesh(geombigWheel, matbigWheel);
  bigWheel2.position.set(10, -25, -20);
  bigWheel2.castShadow = bigWheel2.receiveShadow = true;
  mesh.add(bigWheel2);
  // 바퀴(내부)
  const geomSmallWheel = new THREE.BoxBufferGeometry(10, 10, 5.1, 1, 1, 1);
  const matSmalWheel = new THREE.MeshPhongMaterial({ color: Colors.pink, flatShading:true });
  const smallWheel1 = new THREE.Mesh(geomSmallWheel, matSmalWheel);
  smallWheel1.position.set(10, -30, 20);
  smallWheel1.castShadow = smallWheel1.receiveShadow = true;
  mesh.add(smallWheel1);
  const smallWheel2 = new THREE.Mesh(geomSmallWheel, matSmalWheel);
  smallWheel2.position.set(10, -30, -20);
  smallWheel2.castShadow = smallWheel2.receiveShadow = true;
  mesh.add(smallWheel2);

  // 날개
  const geomSideWing = new THREE.BoxBufferGeometry(40, 8, 150, 1, 1, 1);
  const matSidewing = new THREE.MeshPhongMaterial({ color: Colors.red, flatShading: true });
  const sideWing = new THREE.Mesh(geomSideWing, matSidewing);
  sideWing.position.y = 10;
  sideWing.castShadow = sideWing.receiveShadow = true;
  mesh.add(sideWing);

  // 프로펠러 기둥
  const geomPropeller = new THREE.BoxBufferGeometry(20, 10, 10, 1, 1, 1);
  const matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, flatShading: true });
  const propeller = new THREE.Mesh(geomPropeller, matPropeller);
  propeller.name='propeller'
  propeller.castShadow = propeller.receiveShadow = true;

  // 프로렐러 날
  const geomBlade = new THREE.BoxBufferGeometry(1, 100, 20, 1, 1, 1);
  const matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, flatShading: true });
  const blade1 = new THREE.Mesh(geomBlade, matBlade);
  blade1.position.set(8, 0, 0);
  blade1.castShadow = blade1.receiveShadow = true;
  propeller.add(blade1);

  const blade2 = new THREE.Mesh(geomBlade, matBlade);
  blade2.position.set(8, 0, 0);
  blade2.castShadow = blade2.receiveShadow = true;
  blade2.rotateX(-Math.PI / 2)
  propeller.add(blade2);

  propeller.position.set(50, 0 ,0);
  mesh.add(propeller)

  // 파일럿
  let pilot = Pilot();
  pilot.position.set(-10, 27, 0)
  mesh.add(pilot)

  return mesh;
}

const airPlane = AirPlane();
airPlane.scale.set(0.25, 0.25, 0.25);
airPlane.position.y = 100;
scene.add(airPlane)

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

let angleHairs = 0;
function updateHairs() {
  let hairs = scene.getObjectByName('hairsTop')?.children;
  if(hairs) {
    let l = hairs?.length;
    for(let i = 0; i < l; i++) {
      let h = hairs[i];
      h.scale.y = 0.75 + Math.cos(angleHairs + i / 3) * .25;
    }
    angleHairs += 0.16;
  } 
}

updateHairs()

function animate() {
  seaMesh.rotation.z += 0.005;
  skyMesh.rotateZ(0.01);
  
  updatePlane()
  
  updateHairs()

  render()

  stats.update()

  requestAnimationFrame(animate)
}

function updatePlane() {
	// let's move the airplane between -100 and 100 on the horizontal axis, 
	// and between 25 and 175 on the vertical axis,
	// depending on the mouse position which ranges between -1 and 1 on both axes;
	// to achieve that we use a normalize function (see below)
  let targetX = map(mousePos.x, -0.75, 0.75, -100, 100);
  let targetY = map(mousePos.y, -0.75, 0.75, 55, 175);
  
  airPlane.position.y += (targetY - airPlane.position.y) * 0.1;
  
  airPlane.rotation.z = (targetY - airPlane.position.y) * 0.0128
  airPlane.rotation.x = (airPlane.position.y - targetY) * 0.0064;

  scene.getObjectByName('propeller')?.rotateX(0.3);
}

function map(v: number, vmin: number, vmax: number, tmin: number, tmax: number): number {
  let nv = Math.max(Math.min(v, vmax), vmin);
  let dv = vmax - vmin;
  let pc = (nv - vmin) / dv;
  let dt = tmax - tmin;
  let tv = tmin + (pc * dt);
  return tv
}


function render() {
  renderer.render(scene, camera)
}


animate()