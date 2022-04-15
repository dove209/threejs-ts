import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'



const LABEL_TEXT = 'ABC';

const clock = new THREE.Clock();
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x222222);
renderer.setClearAlpha(0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
document.body.appendChild(renderer.domElement);


const camera = new THREE.OrthographicCamera(
  -window.innerWidth / 2,
  window.innerWidth / 2,
  window.innerHeight / 2,
  -window.innerHeight / 2,
  0.1,
  10
);
camera.position.set(0, 0, 1);
camera.lookAt(new THREE.Vector3(0, 0, 0))


const labelMeshSize = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth
const labelGeometry = new THREE.PlaneBufferGeometry(
  labelMeshSize,
  labelMeshSize
)

let labelTextureCanvas;
{
  labelTextureCanvas = document.createElement('canvas');
  const labelTextureCtx = labelTextureCanvas.getContext('2d');

  const textureSize = Math.min(renderer.capabilities.maxTextureSize, 2048);
  const relativeFontSize = 20;

  labelTextureCanvas.width = textureSize;
  labelTextureCanvas.height = textureSize;
  if (labelTextureCtx) {
    labelTextureCtx.textAlign = 'center';
    labelTextureCtx.textBaseline = 'middle';
    labelTextureCtx.font = `${relativeFontSize}px Helvetica`;
    const textWidth = labelTextureCtx.measureText(LABEL_TEXT).width
    const widthDelta = labelTextureCanvas.width / textWidth
    const fontSize = relativeFontSize * widthDelta
    labelTextureCtx.font = `${fontSize}px Helvetica`
    labelTextureCtx.fillStyle = 'white'
    labelTextureCtx.fillText(LABEL_TEXT, labelTextureCanvas.width / 2, labelTextureCanvas.height / 2)
  }
}

const labelMaterial = new THREE.MeshBasicMaterial({
  map: new THREE.CanvasTexture(labelTextureCanvas),
  transparent: true
})

const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
scene.add(labelMesh)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const stats = Stats()
document.body.appendChild(stats.dom)

renderer.setAnimationLoop(onAnimLoop)

function onAnimLoop() {

  renderer.render(scene, camera)
}
