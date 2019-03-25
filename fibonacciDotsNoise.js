const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed(),
  animate: true,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 1

  const createFibonacciGrid = (size, time) => {
    const theta = Math.PI * (3 - Math.sqrt(5));
    return Array(size).fill(1)
      .map((_, i) => {
      const radius = Math.sqrt(i) / Math.sqrt(size);
      const angle = i * theta;
      const u = radius * Math.cos(angle);
      const v = radius * Math.sin(angle);
      const color = d3.interpolateSinebow(angle / (2 * Math.PI));
      const r = ( random.noise3D(u, v, time, noiseFrequency, 1) * 0.5 + 0.5 )
      return { u, v, color, length, r }
    })
  }

  return ({ context, width, height, time }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    const gridSize = 3000
    const grid = createFibonacciGrid(gridSize, time)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin, height - margin]);
    grid.forEach(data => {
      const { u, v, r, color } = data
      context.fillStyle = color
      context.beginPath();
      context.arc(x(u), x(v), width * 0.008 * r, 0, 2 * Math.PI)
      context.fill()
    })
  };
};

canvasSketch(sketch, settings);
