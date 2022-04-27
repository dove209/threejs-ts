class WaterTexture {
  size: number;
  width: number;
  height: number;
  radius: number = 0;
  canvas: any = null;
  ctx: any;
  points: any[];
  maxAge: number;
  constructor(options: any) {
    this.size = 64;
    this.radius = this.size * 0.1;
    this.points = [];
    this.maxAge = 64;
    this.width = this.height = this.size;
    if (options.debug) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.radius = this.width * 0.05;
    }

    this.initTexture();
    if (options.debug) document.body.append(this.canvas);
  }

  initTexture() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'WaterTexture';
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    this.clear();
  }

  clear() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addPoint(point: any) {
    this.points.push({ x: point.x, y: point.y, age: 0 })
  }

  update() {
    this.clear();
    this.points.forEach((point, i) => {
      point.age += 1;
      if (point.age > this.maxAge) {
        this.points.splice(i, i)
      }
    })
    this.points.forEach(point => {
      this.drawPoint(point);
    })
  }

  drawPoint(point: any) {
    // Convert normalized position into canvas coordinates
    let pos = {
      x: point.x * this.width,
      y: point.y * this.height
    }
    const radius = this.radius;
    const ctx = this.ctx;

    // Lower the opacity at it gets older
    let intensity = 1;
    intensity = 1 - point.age / this.maxAge;

    let color = '255, 255, 255';

    let offset = this.width * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color}, ${0.2 * intensity})`;

    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}




class App {
  waterTexture: any;
  constructor() {
    this.waterTexture = new WaterTexture({ debug: true })
    this.tick = this.tick.bind(this);
    this.init();
  }

  init() {
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.tick()
  }

  onMouseMove(e: MouseEvent) {
    const point = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight
    };

    this.waterTexture.addPoint(point)
  }

  tick() {
    this.waterTexture.update();
    requestAnimationFrame(this.tick)
  }
}


const myApp = new App()