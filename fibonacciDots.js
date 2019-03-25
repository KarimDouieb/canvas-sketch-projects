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
  const noiseFrequency = 1.5

  const createFibonacciGrid = (size) => {
    const theta = Math.PI * (3 - Math.sqrt(5));
    return Array(size).fill(1)
      .map((_, i) => {
      const radius = Math.sqrt(i);
      const angle = i * theta;
      const u = radius * Math.cos(angle);
      const v = radius * Math.sin(angle);
      const color = d3.interpolateRainbow(angle / (2 * Math.PI));
      return { u, v, color }
    })
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    const gridSize = 3000
    const grid = createFibonacciGrid(gridSize)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([-Math.sqrt(gridSize), Math.sqrt(gridSize)])
      .range([margin, height - margin]);
    grid.forEach(data => {
      const { u, v, color } = data
      context.fillStyle = color
      context.beginPath();
      context.arc(x(u), x(v), width * 0.003, 0, 2 * Math.PI)
      context.fill()
    })
  };
};

canvasSketch(sketch, settings);
