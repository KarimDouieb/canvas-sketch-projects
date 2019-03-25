const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {

  //random.setSeed(42);
  const palette = random.pick(palettes).slice(0, 3)

  const createGrid = (size) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        grid.push({
          u: size > 1 ? i / (size - 1) : 0.5, 
          v: size > 1 ? j / (size - 1) : 0.5,
          r: Math.abs(random.gaussian()),
          color: random.pick(palette),
        })
      }
    }
    return grid;
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    const gridSize = 40
    const grid = createGrid(gridSize)
      .filter(() => random.value() > 0.5)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, height - margin]);
    grid.forEach(data => {
      const { u, v, r, color } = data
      context.beginPath();
      context.arc(x(u), y(v), width / gridSize * r * 0.5, 0, Math.PI * 2)
      context.fillStyle = color
      context.fill()
    })
  };
};

canvasSketch(sketch, settings);
