import * as THREE from "three";

const fontURL = "fonts/droid_sans_mono_regular.typeface.json";

class Menu {
  $navItems: any;
  scene: THREE.Scene;
  loader: THREE.FontLoader;
  words: any[];

  constructor(scene: THREE.Scene) {
    // DOM elements
    this.$navItems = document.querySelectorAll(".mainNav a");

    // Three components
    this.scene = scene;
    this.loader = new THREE.FontLoader();

    // Constants
    this.words = [];

    this.loader.load(fontURL, f => {
      this.setup(f);
    });
  }

  setup(f: any) {
    const fontOption = {
      font: f,
      size: 3,
      height: 0.4,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: 0.9,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 10
    };

    Array.from(this.$navItems)
      .reverse()
      .forEach(($item, i) => {
        const { innerText }: any = $item;

        const words = new THREE.Group();
        Array.from(innerText).forEach((letter: any, j) => {
          const material = new THREE.MeshPhongMaterial({ color: 0x97df5e });
          const geometry = new THREE.TextBufferGeometry(letter, fontOption);

          const mesh = new THREE.Mesh(geometry, material);
          words.add(mesh);
        });

        this.words.push(words);
        this.scene.add(words);
      });
  }
}


class Scene {
  scene!: THREE.Scene;
  camera!: any;
  clock!: THREE.Clock;
  renderer!: THREE.WebGLRenderer;
  menu: any;


  $container: any;
  W!: number;
  H!: number
  
  constructor() {
    this.$container = document.getElementById('stage');
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.setup()
    this.bindEvents();
  }


  bindEvents() {
    window.addEventListener("resize", () => {
      this.onResize();
    });
  }
  setup() {
    // Set Three componets
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x202533, -1, 100);
    this.clock = new THREE.Clock();

    // Set options of our scene
    this.setCamera();
    this.setLight();
    this.setRender();
    this.addObject();
    this.renderer.setAnimationLoop(() => { this.draw() })

  }
  setRender() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.$container
    });
    this.renderer.setClearColor(0x202533);
    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.setAnimationLoop(() => {
      this.draw();
    })
  }

  setCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    const distance = 15;

    this.camera = new THREE.OrthographicCamera(-distance * aspect, distance * aspect, distance, -distance, -1, 100);
    this.camera.position.set(-10, 10, 10)
    this.camera.lookAt(new THREE.Vector3());
  }
  draw() {
    this.renderer.render(this.scene, this.camera);
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    const foreLight = new THREE.DirectionalLight(0xffffff, 0.5);
    foreLight.position.set(5, 5, 20);
    this.scene.add(foreLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1);
    backLight.position.set(-5, -5, -10);
    this.scene.add(backLight);
  }

  addObject() {
    this.menu = new Menu(this.scene);
  }

  onResize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.camera.aspect = this.W / this.H;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.W, this.H);
  }
}

new Scene();