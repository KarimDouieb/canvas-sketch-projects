const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed()
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 2

  const createFibonacciGrid = (size) => {
    const theta = Math.PI * (3 - Math.sqrt(5));
    return Array(size).fill(1)
      .map((_, i) => {
      const radius = Math.sqrt(i) / Math.sqrt(size);
      const angle = i * theta;
      const u = radius * Math.cos(angle);
      const v = radius * Math.sin(angle);
      const color = d3.interpolateRainbow(angle / (2 * Math.PI));
      const length = ( random.noise2D(u, v, noiseFrequency, 10) * 0.5 + 0.5 ) * 5
      const a = (random.noise2D(u, v, noiseFrequency, 10) )
      return { u, v, color, length, angle: a }
    })
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const gridSize = 10000
    const grid = createFibonacciGrid(gridSize)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin, height - margin]);
      grid.forEach(data => {
        const { u, v, length, angle } = data
        const l = (width / gridSize * length * 20)
        context.save()
        context.fillStyle = 'white'
        context.translate(x(u), x(v))
        context.rotate(angle * Math.PI * 2)
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
