const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const gaussian = require('gaussian');

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [1200, 1700],
  suffix: random.getSeed(),
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

  const octaves = 2
  const perlin = new Noise(octaves)
  const perlinStrong = new Noise(1)
  const gaussianDist = gaussian(0.5, 0.3);
  
  const getLinePoints = (width, height, pointsOnLine, lineCount, index, time) => {
    const stepX = width / (pointsOnLine -1) / width
    const stepY = height / (lineCount - 1) / height
    const rand = random.value()
    return Array(pointsOnLine)
      .fill(1)
      .map((_, i) => {
        let x = stepX * i
        let y = stepY * index
        let y0 = stepY * index
        const lightNoise = (perlin.noise2d((x + 1), random.value() + 2) + 0.5 * 0.5) * 0.02
        const gaussian = Math.max(0, gaussianDist.pdf(x) - gaussianDist.pdf(1/4))
        const strongNoise = Math.max(0, gaussian * rand * 4 * (perlinStrong.noise2d((x + 1) * 12 * rand, 0) + 0.5 * 0.5))
        y -= lightNoise + strongNoise
        random.permuteNoise()
        return {
          x, y, y0,
        }
      });
  }

  drawLine = (points, width, height, context) => {
    context.strokeStyle = 'white'
    context.lineWidth = width * 0.003
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 1; i < l - 1; i ++)
    {
      var xc = (points[i].x + points[i + 1].x) / 2;
      var yc = (points[i].y + points[i + 1].y) / 2;
      context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.quadraticCurveTo(points[i].x, points[i].y,points[i].x, points[i].y);
    context.stroke();
  }

  drawFace = (points, width, height, context) => {
    const betweenEye = width * 0.02
    let minY = height;
    let xMinY = 0;
    let y0 = 0
    let peakHeight = 0
    points.forEach(p => {
      if(p.y < minY) {
        minY = p.y  
        xMinY = p.x
        y0 = p.y0
        peakHeight = (p.y0 - p.y)
      }
    })
    if (peakHeight > 0.05 * height) {
      context.beginPath();
      context.fillStyle = 'white'
      context.fill()
      context.beginPath();
      context.arc(xMinY - betweenEye / 2, y0 - (0.75 * peakHeight), 4, 0, 2 * Math.PI);
      context.fill()
      context.beginPath();
      context.arc(xMinY + betweenEye / 2, y0 - (0.75 * peakHeight), 4, 0, 2 * Math.PI);
      context.fill()
      context.beginPath();
      context.arc(xMinY, y0 - (0.7 * peakHeight), 8, 0, Math.PI);
      context.fill()
    }
  }

  drawArea = (points, context) => {
    context.fillStyle = 'black'
    context.beginPath();
    context.moveTo(points[0].x, points[0].y0);
    context.lineTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 0; i < l - 1; i ++)
    {
      var xc = (points[i].x + points[i + 1].x) / 2;
      var yc = (points[i].y + points[i + 1].y) / 2;
      context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.quadraticCurveTo(points[i].x, points[i].y, points[i].x, points[i].y);
    context.lineTo(points[i].x, points[i].y0);
    context.closePath();
    context.fill();
  }

  return ({ context, width, height, time }) => {
    
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const pointsOnLine = 80
    const lineCount = 80
    const marginX = 0.15
    const marginYTop = 0.20
    const marginYBottom = 0.15
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([marginX * width, (1 - marginX) * width])
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([marginYTop * height, (1 - marginYBottom) * height])
    return Array(lineCount)
      .fill(1)
      .forEach((_, i) => {
        const line = getLinePoints(width, height, pointsOnLine, lineCount, i, time)
          .map(p => ({ x: xScale(p.x), y: yScale(p.y), y0: yScale(p.y0) }))
        drawArea(line, context);
        drawFace(line, width, height, context);
        drawLine(line, width, height, context);
      });
  }
};

canvasSketch(sketch, settings);
