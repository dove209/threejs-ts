import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5))
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0.25,
    0xffff00
)
scene.add(arrowHelper)

const material = new THREE.MeshNormalMaterial()
const coneGeometry = new THREE.ConeGeometry(0.05, 0.2, 8);

const raycaster = new THREE.Raycaster();
const sceneMeshes: THREE.Object3D[] = []

const loader = new GLTFLoader()
loader.load(
    'models/monkey.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                const m = child as THREE.Mesh
                m.receiveShadow = true
                m.castShadow = true;
                (m.material as THREE.MeshStandardMaterial).flatShading = true
                sceneMeshes.push(m)
            }
            if ((child as THREE.Light).isLight) {
                const l = child as THREE.Light
                l.castShadow = true
                l.shadow.bias = -0.003
                l.shadow.mapSize.width = 2048
                l.shadow.mapSize.height = 2048
            }
        })
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
renderer.domElement.addEventListener('dblclick', onDoubleClick, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event: MouseEvent) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sceneMeshes, false);
    if (intersects.length > 0) {
        const n = new THREE.Vector3();
        n.copy((intersects[0].face as THREE.Face).normal);
        n.transformDirection(intersects[0].object.matrixWorld);

        arrowHelper.setDirection(n);
        arrowHelper.position.copy(intersects[0].point)
    }

}
function onDoubleClick(event: MouseEvent) {
    const mouse = {
        x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(sceneMeshes, false);
    if (intersects.length > 0) {
        const n = new THREE.Vector3();
        n.copy((intersects[0].face as THREE.Face).normal);
        n.transformDirection(intersects[0].object.matrixWorld);

        const cone = new THREE.Mesh(coneGeometry, material);
        cone.lookAt(n);
        cone.rotateX(Math.PI / 2);
        cone.position.copy(intersects[0].point);
        cone.position.addScaledVector(n, 0.1);

        scene.add(cone);
        sceneMeshes.push(cone)
    }
}


const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
    controls.update();
    render();
    stats.update();

    requestAnimationFrame(animate)
}

function render() {
    renderer.render(scene, camera)
}

animate();
