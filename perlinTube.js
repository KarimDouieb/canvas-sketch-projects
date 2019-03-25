const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
const palettes = require('nice-color-palettes')

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [1024, 1024],
  suffix: random.getSeed(),
  animate: true,
  duration: 8,
  fps: 24,
};

const sketch = () => {

  const palette = random.pick(palettes).slice(0, random.rangeFloor(2, 6))
  const noiseFrequency = 0.6

  const getCirclePoints = (width, size, time, relativeIndex) => {
    const radius = width * 0.3;
    return Array(size)
      .fill(1)
      .map((_, i) => {
        const angle = (Math.PI * 2 / size) * i
        let x = Math.sin(angle) * radius
        let y = Math.cos(angle) * radius
        const noise = random.noise4D(Math.sin(angle), Math.cos(angle), relativeIndex * 2, time * 0.2, noiseFrequency, 200) * 0.5 + 0.5
        x += Math.sin(angle) * noise
        y += Math.cos(angle) * noise
        return {
          x, y,
        }
      });
  }

  drawCircle = (points, context) => {
    context.strokeStyle = 'rgb(0,0,0, 0.2)'
    context.lineWidth = 1
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 1; i < l - 1; i ++)
    {
        var xc = (points[i].x + points[i + 1].x) / 2;
        var yc = (points[i].y + points[i + 1].y) / 2;
        context.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    context.quadraticCurveTo(points[i].x, points[i].y, points[0].x,points[0].y);
    context.stroke();
  }

  return ({ context, width, height, time }) => {
    
    if(time) {
      context.fillStyle = 'white'
      context.fillRect(0, 0, width, height)
    }
    context.translate(width / 2, height / 2)

    const circleCount = 50
    return Array(circleCount)
      .fill(1)
      .forEach((_, i) => {
        const circlePoints = getCirclePoints(width, 200, time, i/circleCount);
        drawCircle(circlePoints, context);
      });
  }
};

canvasSketch(sketch, settings);
