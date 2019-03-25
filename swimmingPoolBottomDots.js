const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [2048, 2048],
  suffix: random.getSeed(),
  animate: true,
  duration: 8,
  fps: 24,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 2

  const getLine = (count, size, playhead, direction) => {
    return Array(size)
      .fill(1)
      .map((_, i) => {
        let x = direction === 'horizontal' ? i / size : count / size
        let y = direction === 'horizontal' ? count / size : i / size
        const noise = random.noise4D(x, y, Math.sin(playhead * Math.PI * 2) * 0.5, Math.cos(playhead * Math.PI * 2) * 0.5, noiseFrequency, 1) 
        x += Math.sin(noise * Math.PI) * 0.025
        y += Math.cos(noise * Math.PI) * 0.025
        r = noise * 0.5 + 0.5

        //const noise = random.noise4D(x, y, Math.sin(playhead * Math.PI * 2) * 0.2, Math.cos(playhead * Math.PI * 2) * 0.2, noiseFrequency, 0.05) 
        //x += noise
        //y += noise
        //r = noise * 0.5 + 0.5
        return {
          x, y, r,
        }
      });
  }

  drawPoints = (points, context) => {
      points.forEach(p => {
        context.beginPath()
        context.arc(p.x, p.y, 15 * p.r, 0, Math.PI * 2)
        context.fillStyle = 'black'
        context.fill()
      })
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
        drawPoints(
          linePoints1.map(p => ({...p, x: x(p.x), y: y(p.y) })), 
          context
        );
        drawPoints(
          linePoints2.map(p => ({...p, x: x(p.x), y: y(p.y) })), 
          context
        );
      });
  }
};

canvasSketch(sketch, settings);
