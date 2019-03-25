const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2018, 2018],
  suffix: random.getSeed(),
  animate: true,
  //duration: 8,
  //fps: 24,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 3

  const getLine = (count, size, time) => {
    return Array(size)
      .fill(1)
      .map((_, i) => {
        let x = i / size
        let y = count / size
        const noise = random.noise3D(x, y, time * 0.3, noiseFrequency, 0.06) //* 0.5 + 0.5
        //x += 0
        y += noise
        return {
          x, y,
        }
      });
  }

  drawLine = (points, context) => {
    context.strokeStyle = 'rgb(0,0,0, 1)'
    context.lineWidth = 2
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 1; i < l - 1; i ++)
    {
        var xc = (points[i].x + points[i + 1].x) / 2;
        var yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.stroke();
  }

  return ({ context, width, height, time }) => {
    
    if(time) {
      context.fillStyle = 'white'
      context.fillRect(0, 0, width, height)
    }

    const margin = width * 0.1;
    const x = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, width - margin]);
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([margin, height - margin]);
    const lineCount = 100
    return Array(lineCount)
      .fill(1)
      .forEach((_, i) => {
        const linePoints = getLine(i, lineCount, time);
        drawLine(
          linePoints.map(p => ({...p, x: x(p.x), y: y(p.y) })), 
          context
        );
      });
  }
};

canvasSketch(sketch, settings);
