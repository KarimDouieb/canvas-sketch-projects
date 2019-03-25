const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed()
};


class Noise {
  static lerp(t, a, b) {
    return a + t * (b - a);
  }
  static grad2d(i, x, y) {
    const v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }
  constructor(octaves = 1) {
    this.p = new Uint8Array(512);
    this.octaves = octaves;
    this.init();
  }
  init() {
    for (let i = 0; i < 512; ++i) {
      this.p[i] = random.value() * 256;
    }
  }
  noise2d(x2d, y2d) {
    const X = Math.floor(x2d) & 255;
    const Y = Math.floor(y2d) & 255;
    const x = x2d - Math.floor(x2d);
    const y = y2d - Math.floor(y2d);
    const fx = (3 - 2 * x) * x * x;
    const fy = (3 - 2 * y) * y * y;
    const p0 = this.p[X] + Y;
    const p1 = this.p[X + 1] + Y;
    return Noise.lerp(
      fy,
      Noise.lerp(
        fx,
        Noise.grad2d(this.p[p0], x, y),
        Noise.grad2d(this.p[p1], x - 1, y)
      ),
      Noise.lerp(
        fx,
        Noise.grad2d(this.p[p0 + 1], x, y - 1),
        Noise.grad2d(this.p[p1 + 1], x - 1, y - 1)
      )
    );
  }
  noise(x, y) {
    let e = 1,
        k = 1,
        s = 0;
    for (let i = 0; i < this.octaves; ++i) {
      e *= 0.5;
      s += e * (1 + this.noise2d(k * x, k * y)) / 2;
      k *= 2;
    }
    return s;
  }
}

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 5
  const octaves = 10
  const perlin = new Noise(octaves)

  const createGrid = (size) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const u = size > 1 ? i / (size - 1) : 0.5
        const v = size > 1 ? j / (size - 1) : 0.5
        
        const length = (perlin.noise(u * noiseFrequency, v * noiseFrequency) * 0.5 + 0.5 ) * random.range(1, 1.1)
        const angle = (perlin.noise(u * noiseFrequency, v * noiseFrequency) * 0.5 + 0.5 ) * random.range(1, 1)
        grid.push({
          u, 
          v,
          angle,
          length,
        })
      }
    }
    return grid;
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const gridSize = 300
    const grid = createGrid(gridSize)
      .filter(() => random.value() > 0.8)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, height - margin]);
    grid.forEach(data => {
      const { u, v, length, angle } = data
      const l = (width / gridSize * length * 20)
      context.save()
      context.fillStyle = 'white'
      context.translate(x(u), y(v))
      context.rotate(angle * Math.PI * 2)
      context.beginPath();
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(l, 0);
      context.closePath();
      context.lineWidth = 0.6;
      context.strokeStyle = 'rgb(255,255,255, 0.8)';
      context.stroke();
      context.restore()
    })
  };
};

canvasSketch(sketch, settings);
