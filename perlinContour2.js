const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [1024, 1024],
  suffix: random.getSeed(),
  animate: true,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 2

  const createGrid = (size, time) => {
    const grid = []
    for(let i = 0; i < size; i++) {
      for(let j = 0; j < size; j++) {
        const u = size > 1 ? i / (size - 1) : 0.5
        const v = size > 1 ? j / (size - 1) : 0.5
        
        const length = ( random.noise3D(u * noiseFrequency, v * noiseFrequency, time * 0.1) * 0.5 + 0.5 ) * random.range(1, 2)
        const angle = (random.noise3D(u * noiseFrequency, v * noiseFrequency, time * 0.1) * 0.5 + 0.5 ) * random.range(1, 1.1)
        const noise = random.noise3D(u * noiseFrequency, v * noiseFrequency, time * 0.1) * 0.5 + 0.5
        grid.push({
          u, 
          v,
          noise,
          angle,
          length,
        })
      }
    }
    return grid;
  }

  drawPoints = (points, context) => {
    points.forEach(p => {
      context.beginPath()
      context.arc(p.x, p.y, 1, 0, Math.PI * 2)
      context.fillStyle = 'white'
      context.fill()
    })
  }

  return ({ context, width, height, time }) => {
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const gridSize = 300
    const grid = createGrid(gridSize, time)
    const margin = width * 0.15;
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);

    const contours = d3.contours()
      .size([gridSize, gridSize])
      //.thresholds(d3.range(2, 21).map(p => Math.pow(2, p)))
      (grid.map(cell => cell.noise));

    const q = width / gridSize
    projection = d3.geoIdentity().translate([q/2, q/2]).scale(q)
    const path = d3.geoPath(projection, context);

    const color = d3.scaleSequential([0, contours.length], d3.interpolateViridis)
    contours.forEach((contour, i) => {
      context.beginPath();
      path(contour);
      context.strokeStyle = color(i);
      context.lineWidth = 3;
      context.stroke()
    })
  };
};

canvasSketch(sketch, settings);
