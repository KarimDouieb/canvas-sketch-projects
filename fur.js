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
  const noiseFrequency = 1

  const createGrid = (size) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const u = size > 1 ? i / (size - 1) : 0.5
        const v = size > 1 ? j / (size - 1) : 0.5
        
        const length = ( random.noise2D(u * noiseFrequency, v * noiseFrequency) * 0.5 + 0.5 ) * random.range(1, 2)
        const angle = (random.noise2D(u * noiseFrequency, v * noiseFrequency) * 0.5 + 0.5 ) * random.range(1, 1.1)
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
