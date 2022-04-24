import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

let loaded = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f1f1);
scene.fog = new THREE.Fog(0xf1f1f1, 20, 100);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.x = 0;

const canvas = document.querySelector('#c') as HTMLCanvasElement ;
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(window.devicePixelRatio || 1);
document.body.appendChild(renderer.domElement)

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

const INITIAL_MTL = new THREE.MeshPhongMaterial({
  color: 0xf1f1f1,
  shininess: 10,
});
const INITIAL_MAP = [
  { childID: 'back', mtl: INITIAL_MTL },
  { childID: 'base', mtl: INITIAL_MTL },
  { childID: 'cushions', mtl: INITIAL_MTL },
  { childID: 'legs', mtl: INITIAL_MTL },
  { childID: 'supports', mtl: INITIAL_MTL },
];

function initColor(parent: any, type: any, mtl: any) {
  parent.traverse((o: any) => {
    if((o as THREE.Mesh).isMesh) {
      if(o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type;
      }
    }
  })
}
const LOADER: any = document.getElementById('js-loader');

let theModel: any;
const MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";

let loader = new GLTFLoader();
loader.load(MODEL_PATH, function(gltf) {
  theModel = gltf.scene;
  
  theModel.traverse((o: any) => {
    if((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  })

  theModel.scale.set(2, 2, 2);
  theModel.position.y = -1;
  theModel.rotateY(Math.PI);

  for(let object of INITIAL_MAP) {
    initColor(theModel, object.childID, object.mtl);
  }

  scene.add(theModel);
  LOADER.remove();

},
function(xhr) {
  console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
},
function(err) {
  console.log(err)
}
)

// Floor
let floorGeometry = new THREE.PlaneBufferGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0
});
let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotateX(-Math.PI / 2);
floor.receiveShadow = true;
floor.position.y = -1;
scene.add(floor)


// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.2;

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const DRAG_NOTICE = document.getElementById('js-drag-notice');

function animate() {
  render()
  controls.update();
  requestAnimationFrame(animate);

  if(theModel != null && loaded == false) {
    initialRotaion();
    DRAG_NOTICE?.classList.add('start');
  }
}



function render() {
  renderer.render(scene, camera)
}

animate();

let activeOption = 'legs';

const colors = [
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/wood_.jpg',
      size: [2,2,2],
      shininess: 60
  },
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/fabric_.jpg',
      size: [4, 4, 4],
      shininess: 0
  },
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/pattern_.jpg',
      size: [8, 8, 8],
      shininess: 10
  },
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/denim_.jpg',
      size: [3, 3, 3],
      shininess: 0
  },
  {
      texture: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/quilt_.jpg',
      size: [6, 6, 6],
      shininess: 0
  },
  { color: '131417' }, 
  { color: '374047' },
  { color: '5f6e78' },
  { color: '7f8a93' },
  { color: '97a1a7' },
  { color: 'acb4b9' },
  { color: 'DF9998' },
  { color: '7C6862' },
  { color: 'A3AB84' },
  { color: 'D6CCB1' },
  { color: 'F8D5C4' },
  { color: 'A3AE99' },
  { color: 'EFF2F2' },
  { color: 'B0C5C1' },
  { color: '8B8C8C' },
  { color: '565F59' },
  { color: 'CB304A' },
  { color: 'FED7C8' },
  { color: 'C7BDBD' },
  { color: '3DCBBE' },
  { color: '264B4F' },
  { color: '389389' },
  { color: '85BEAE' },
  { color: 'F2DABA' },
  { color: 'F2A97F' },
  { color: 'D85F52' },
  { color: 'D92E37' },
  { color: 'FC9736' },
  { color: 'F7BD69' },
  { color: 'A4D09C' },
  { color: '4C8A67' },
  { color: '25608A' },
  { color: '75C8C6' },
  { color: 'F5E4B7' },
  { color: 'E69041' },
  { color: 'E56013' },
  { color: '11101D' },
  { color: '630609' },
  { color: 'C9240E' },
  { color: 'EC4B17' },
  { color: '281A1C' },
  { color: '4F556F' },
  { color: '64739B' },
  { color: 'CDBAC7' },
  { color: '946F43' },
  { color: '66533C' },
  { color: '173A2F' },
  { color: '153944' },
  { color: '27548D' },
  { color: '438AAC' }
]
const TRAY = document.getElementById('js-tray-slide');

function buildColor(colors: any) {
  colors.forEach((ele: any, index: number) => {
    let swatch = document.createElement('div');
    swatch.classList.add('tray__swatch');
    if(ele.texture) {
      swatch.style.backgroundImage = "url(" + ele.texture + ")";  
    } else {
      swatch.style.background = '#' + ele.color;
    }
    swatch.setAttribute('data-key', String(index));
    TRAY?.append(swatch);
  });
}
buildColor(colors);

const swatches = document.querySelectorAll(".tray__swatch");
swatches.forEach(swatch => {
  swatch.addEventListener('click', selectSwatch)  
});
function selectSwatch(e: any) {
  let color = colors[parseInt(e.target.dataset.key)];
  let new_mtl;

  if (color.texture) {
    let txt = new THREE.TextureLoader().load(color.texture);
    txt.repeat.set( color.size[0], color.size[1]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;
    new_mtl = new THREE.MeshPhongMaterial( {
      map: txt,
      shininess: color.shininess ? color.shininess : 10
    });    
  } else {
    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color ),
      shininess: color.shininess ? color?.shininess : 10
    })
  }
  setMaterial(theModel, activeOption, new_mtl);
};

function setMaterial(parent: any, type: string, mtl:THREE.Material) {
  parent.traverse((o: any) => {
    if(o.isMesh && o.nameID != null) {
      if(o.nameID == type) {
        o.material = mtl;
      }
    }
  })
}


// Select Option
const options = document.querySelectorAll('.option');
options.forEach(option => {
    option.addEventListener('click', selectOption);
});

function selectOption(e: any) {
  let option = e.target;
  activeOption = e.target.dataset.option;
  options.forEach(otherOption => {
    otherOption.classList.remove('--is-active');
  });
  option.classList.add('--is-active')
}


// Opening rotate
let initRotate = 0;
function initialRotaion() {
  initRotate++;
  if(initRotate <= 120) {
    theModel.rotateY(Math.PI / 60);
  } else {
    loaded = true
  }
}

let slider: any = document.getElementById('js-tray'), sliderItems: any = document.getElementById('js-tray-slide'), difference: any;

function slide(wrapper: any, items: any) {
  let posX1 = 0,
      posX2 = 0,
      posInitial: any,
      threshold = 20,
      posFinal,
      slides = items.getElementsByClassName('tray__swatch');
  
  // Mouse events
  items.onmousedown = dragStart;
  
  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);


  function dragStart (e: any) {
    e = e || window.event;
     posInitial = items.offsetLeft;
     difference = sliderItems.offsetWidth - slider.offsetWidth;
     difference = difference * -1;
    
    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction (e: any) {
    e = e || window.event;
    
    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }
    
    if (items.offsetLeft - posX2 <= 0 && items.offsetLeft - posX2 >= difference) {
        items.style.left = (items.offsetLeft - posX2) + "px";
    }
  }
  
  function dragEnd (e: any) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) { } else if (posFinal - posInitial > threshold) {

    } else {
      items.style.left = (posInitial) + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

}

slide(slider, sliderItems);