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

  function drawSite(site, context) {
    context.moveTo(site[0] + 2.5, site[1]);
    context.arc(site[0], site[1], 2.5, 0, 2 * Math.PI, false);
  }
  
  function drawLink(link, context) {
    context.moveTo(link.source[0], link.source[1]);
    context.lineTo(link.target[0], link.target[1]);
  }
  
  function drawCell(cell, context) {
    if (!cell) return false;
    context.moveTo(cell[0][0], cell[0][1]);
    for (var j = 1, m = cell.length; j < m; ++j) {
      context.lineTo(cell[j][0], cell[j][1]);
    }
    context.closePath();
    return true;
  }

  return ({ context, width, height, time }) => {
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)

    const gridSize = 1000
    const grid = createFibonacciGrid(gridSize, time)
    const margin = - width * 0.3;
    const x = d3.scaleLinear()
      .domain([-1, 1])
      .range([margin, height - margin]);

    const voronoi = d3.voronoi()
      .extent([[-1, -1], [width + 1, height + 1]])
    const diagram = voronoi(grid.map(d => [x(d.u), x(d.v)]))
    const links = diagram.links()
    const polygons = diagram.polygons()

    context.beginPath();
    for (var i = 0, n = polygons.length; i < n; ++i) drawCell(polygons[i], context);
    context.strokeStyle = "#000";
    context.stroke();

    context.beginPath();
    for (var i = 0, n = links.length; i < n; ++i) drawLink(links[i], context);
    context.strokeStyle = "rgba(0,0,0,0.2)";
    context.stroke();

    context.beginPath();
    for (var i = 1, n = grid.length; i < n; ++i) drawSite(grid[i], context);
    context.fillStyle = "#000";
    context.fill();
    context.strokeStyle = "#fff";
    context.stroke();
  };
};

canvasSketch(sketch, settings);
