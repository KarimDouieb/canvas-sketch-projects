const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const createGrid = (size) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        grid.push([
          size > 1 ? i / (size - 1) : 0.5, 
          size > 1 ? j / (size - 1) : 0.5,
        ])
      }
    }
    return grid;
  }

  return ({ context, width, height }) => {
    context.fillStyle = 'dodgerblue'
    context.fillRect(0, 0, width, height)

    const gridSize = 50
    random.setSeed(42)
    const grid = createGrid(gridSize)
      .filter(() => random.value() > 0.5)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, height - margin]);
    grid.forEach(([u, v]) => {
      context.beginPath();
      context.arc(x(u), y(v), width / gridSize * 0.15, 0, Math.PI * 2)
      context.strokeStyle = 'white'
      context.lineWidth = width * 0.15 / gridSize
      context.stroke()
    })
  };
};

canvasSketch(sketch, settings);
