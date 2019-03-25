const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed(),
  animate: true,
  duration: 4,
  fps: 24,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 2.5

  const getLine = (count, size, playhead, direction) => {
    return Array(size)
      .fill(1)
      .map((_, i) => {
        let x = direction === 'horizontal' ? i / size : count / size
        let y = direction === 'horizontal' ? count / size : i / size
        const noise = random.noise4D(x, y, Math.sin(playhead * Math.PI * 2) * 0.2, Math.cos(playhead * Math.PI * 2) * 0.2, noiseFrequency, 1) 
        x += Math.sin(noise * Math.PI) * 0.025
        y += Math.cos(noise * Math.PI) * 0.025

        //const noise = random.noise4D(x, y, Math.sin(playhead * Math.PI * 2) * 0.1, Math.cos(playhead * Math.PI * 2) * 0.1, noiseFrequency, 0.05) 
        //x += noise
        //y += noise
        return {
          x, y,
        }
      });
  }

  drawLine = (points, context) => {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 1; i < l - 2; i ++)
    {
        var xc = (points[i].x + points[i + 1].x) / 2;
        var yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
    context.stroke();
  }

  return ({ context, width, height, time, playhead }) => {
    
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
    const lineCount = 50

    context.strokeStyle = 'rgb(0,0,0, 1)'
    context.lineWidth = 2
    Array(lineCount)
      .fill(1)
      .forEach((_, i) => {
        const linePoints1 = getLine(i, lineCount, playhead, 'horizontal');
        const linePoints2 = getLine(i, lineCount, playhead, 'vertical');
        drawLine(
          linePoints1.map(p => ({...p, x: x(p.x), y: y(p.y) })), 
          context
        );
        drawLine(
          linePoints2.map(p => ({...p, x: x(p.x), y: y(p.y) })), 
          context
        );
      });

    context.strokeStyle = 'rgb(0,255,255, 1)'
    context.lineWidth = 2
    Array(lineCount)
      .fill(1)
      .forEach((_, i) => {
        const linePoints1 = [{x: x(0), y: y(i / lineCount)}, {x: x(0), y: y(i / lineCount)}, {x: x(1 - (1/lineCount)), y: y(i / lineCount)}];
        const linePoints2 = [{x: x(i / lineCount), y: y(0)}, {x: x(i / lineCount), y: y(0)}, {x: x(i / lineCount), y: y(1 - (1/lineCount))}];
        drawLine(
          linePoints1, 
          context
        );
        drawLine(
          linePoints2, 
          context
        );
      });
  }
};

canvasSketch(sketch, settings);
