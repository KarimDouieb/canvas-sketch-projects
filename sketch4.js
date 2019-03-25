const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed()
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 1.5

  const createGrid = (size) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const u = size > 1 ? i / (size - 1) : 0.5
        const v = size > 1 ? j / (size - 1) : 0.5
        
        const r = random.noise2D(u * noiseFrequency, v * noiseFrequency) * 0.5 + 0.5
        const angle = random.noise2D(u * noiseFrequency, v * noiseFrequency)
        grid.push({
          u, 
          v,
          r,
          angle,
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
      const { u, v, r, color, angle } = data
      context.save()
      context.fillStyle = color
      context.translate(x(u), y(v))
      context.rotate(angle)
      context.font = `${width / gridSize * r * 10}px Raleway`
      context.fillText('_', 0, 0)
      context.restore()
    })
  };
};

canvasSketch(sketch, settings);
