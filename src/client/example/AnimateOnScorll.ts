import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene = new THREE.Scene();

const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf);
scene.add(gridHelper)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxBufferGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true
})

const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0.5, -10);
scene.add(cube)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render()
}

// 선형 보간법
function lerp(x: number, y: number, r: number): number {
  return (1 - r) * x + r * y
}

// Used to fit the lerps to start and end at specific scrolling percentages(0~1)
function scalePercent(start: number, end: number): number {
  return (scrollPercent - start) / (end - start)
}

const animationScripts: { start: number; end: number, func: () => void }[] = []

//add an animation that flashes the cube through 100 percent of scroll
animationScripts.push({
  start: 0,
  end: 101,
  func: () => {
    let g = material.color.g
    g -= 0.05
    if (g <= 0) {
      g = 1.0
    }
    material.color.g = g
  },
})

// 0 ~ 40
animationScripts.push({
  start: 0,
  end: 40,
  func: () => {
    camera.lookAt(cube.position);
    camera.position.set(0, 1, 2);
    cube.position.z = lerp(-10, 0, scalePercent(0, 40))
  }
})

// 40 ~ 60
animationScripts.push({
  start: 40,
  end: 60,
  func: () => {
    camera.lookAt(cube.position);
    camera.position.set(0, 1, 2);
    cube.rotation.z = lerp(0, Math.PI, scalePercent(40, 60))
  }
})

// 60 ~ 80
animationScripts.push({
  start: 60,
  end: 80,
  func: () => {
    camera.position.x = lerp(0, 5, scalePercent(60, 80));
    camera.position.y = lerp(1, 5, scalePercent(60, 80));
    camera.lookAt(cube.position)
  }
})

// 80 ~ 100
animationScripts.push({
  start: 80,
  end: 101,
  func: () => {
    cube.rotateX(0.01);
    cube.rotateY(0.01);
  }
})


function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent >= a.start && scrollPercent < a.end) {
      a.func()
    }
  })
}

let scrollPercent = 0

document.body.onscroll = () => {
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) / ((document.documentElement.scrollHeight || document.body.scrollHeight) - document.documentElement.clientHeight)) * 100;
  (document.getElementById('scrollProgress') as HTMLDivElement).innerText = 'Scroll Progress : ' + scrollPercent.toFixed(2)
}


const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
  requestAnimationFrame(animate)

  playScrollAnimations();

  render()

  stats.update()
}

function render() {
  renderer.render(scene, camera)
}


animate()