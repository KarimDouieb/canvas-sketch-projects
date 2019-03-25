const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')
const palettes = require('nice-color-palettes')

//const seed = 287879
const seed = random.getRandomSeed()
random.setSeed(seed)

const settings = {
  dimensions: [1024, 1024],
  suffix: seed,
  //animate: true,
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

  const palette = random.pick(palettes)
  const noiseFrequency = 2.5
  const octaves = 3
  const perlin = new Noise(octaves)

  const createGrid = (size, time) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < 2 * size; j++) {
        const u = i / size
        const v = j / size
        //const noise = random.noise3D((u * noiseFrequencyX) + 200, (v * noiseFrequencyY) - 324, time * 0.1) * 0.5 + 0.5
        const noise = perlin.noise(u * noiseFrequency, v * noiseFrequency)
        grid.push({ u, v, noise })
      }
    }
    return grid;
  }

  drawPoints = (points, width, height, context) => {
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, height])
      .range([0, 6]);

    const noiseExtent = d3.extent(points, p => p.noise)
    console.log('noiseExtent', noiseExtent)
    const waterThreshold = 0.3
    const adjustedNoiseExtent = [noiseExtent[0] + (waterThreshold * (noiseExtent[1] - noiseExtent[0])), noiseExtent[1]]
    const color = d3.scaleQuantize()
      .domain(adjustedNoiseExtent)
      .range(palette);
    const noiseStep = (adjustedNoiseExtent[1] - adjustedNoiseExtent[0]) / palette.length;

    points.forEach(p => {
      if (
        p.noise > adjustedNoiseExtent[0] 
        && (p.noise - adjustedNoiseExtent[0]) % noiseStep > noiseStep * 0.1
        //&& ((p.v * width) + (p.u * height)) % 10 === 0 
        //&& Math.sqrt(((p.u - 0.5) ** 2) + ((p.v - 0.5) ** 2)) < 0.45
      ) {
        context.fillStyle = color(p.noise)
        context.save();
        context.translate(x(p.u), x(p.v) - p.noise * 300 * y(x(p.v)));
        //context.rotate(this.noise * Math.PI * 2);
        context.fillRect(0, 0, 1, 1)
        //context.arc(0, 0, 1, 0, Math.PI * 2);
        context.restore();
      } else {
        context.fillStyle = 'white'
      }
      //context.fillRect(x(p.u), x(p.v), 1, 1)
    })
  }

  return ({ context, width, height, time }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    const gridSize = width
    const grid = createGrid(gridSize, time)
    drawPoints(grid, width, 2*width, context)
  };
};

canvasSketch(sketch, settings);
