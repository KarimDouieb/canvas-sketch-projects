const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')

function addNode(type, str) {
  var node = document.createElement(type);
  node.innerHTML = str;
  document.body.appendChild(node);
}
addNode('style', `
canvas{
  display:block;
  -webkit-filter: url("#goo");
  filter: url("#goo");
}
svg{
  display:none;
}
`
);
var svg = d3.select("body").append("svg")

var filter = svg.append("defs")
    .append("filter")
    //use a unique id to reference again later on
    .attr("id","goo");

//Append multiple "pieces" to the filter
filter.append("feGaussianBlur")
  .attr("in","SourceGraphic")
  .attr("stdDeviation","8")
  .attr("color-interpolation-filters","sRGB")
  .attr("result","blur");
filter.append("feColorMatrix")
  //the class used later to transition the gooey effect
  .attr("class","blurValues")
  .attr("in","blur")
  .attr("mode","matrix")
  .attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
  .attr("result","gooey");
/*filter.append("feBlend")
    .attr("in2","gooey")
    .attr("in","SourceGraphic")
    .attr("result","mix");*/

//const seed = 2873245354
const seed = random.getRandomSeed()
random.setSeed(seed)

const settings = {
  dimensions: [512, 512],
  suffix: seed,
  animate: true,
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
      s += e * (1 + random.noise2D(k * x, k * y)) / 2;
      k *= 2;
    }
    return s;
  }

  noise3D(x, y, z) {
    let e = 1,
        k = 1,
        s = 0;
    for (let i = 0; i < this.octaves; ++i) {
      e *= 0.5;
      s += e * (1 + random.noise3D(k * x, k * y, z)) / 2;
      k *= 2;
    }
    return s;
  }
}

const sketch = () => {

  const noiseFrequency = 2
  const octaves = 2.5
  const perlin = new Noise(octaves)

  const createGrid = (size, time) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const u = i / size
        const v = j / size
        const noise = perlin.noise3D((u > 0.5 ? 1 - u : u ) * noiseFrequency, v * noiseFrequency, time * 0.5)
        grid.push({ u, v, noise })
      }
    }
    return grid;
  }

  drawPoints = (points, width, res, time, context) => {
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    const noiseExtent = [0.25, 0.6]//d3.extent(points, p => p.noise)
    const waterThreshold = 0.6
    const noiseThreshold = noiseExtent[0] + (waterThreshold * (noiseExtent[1] - noiseExtent[0]))

    points.forEach(p => {
      const circleWidth = Math.sqrt(1 - (p.v < 0.5 ? 1 - p.v : p.v ) ** 2) * 0.8 + 0.2 * random.noise2D(p.v, time * 0.1, 3)
      if ( p.noise > noiseThreshold && (p.u > 0.5 ? 1 - p.u : p.u ) > 0.5 - (circleWidth / 2)){
        context.fillStyle = 'black'
        context.beginPath();
        context.arc(x(p.u), x(p.v), res, 0, Math.PI * 2, false);
        context.fill();
      } else {
        context.fillStyle = 'white'
      }
    })
  }

  return ({ context, width, height, time }) => {
    context.clearRect(0, 0, width, height);

    const res = 4
    const gridSize = width / res
    const grid = createGrid(gridSize, time * 0.5)
    drawPoints(grid, width, res, time, context)
  };
};

canvasSketch(sketch, settings);