const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3-scale')
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

  const getCirclePoints = (width, size, time, index) => {
    const radius = width * 0.2;
    return Array(size)
      .fill(1)
      .map((_, i) => {
        const angle = (Math.PI * 2 / size) * i
        let x = Math.sin(angle) * (radius)// + time * 5)
        let y = Math.cos(angle) * (radius)// + time * 5)
        const noise = random.noise3D(Math.sin(angle), Math.cos(angle), time / 5, noiseFrequency, 50) * 0.5 + 0.5
        const noise2 = random.noise4D(Math.sin(angle), Math.cos(angle), index, angle, time / 5, noiseFrequency) * 0.5 + 0.5
        x += Math.sin(angle) * (noise * index / 2) //+ noise2 //* time * 10
        y += Math.cos(angle) * (noise * index / 2) //+ noise2 //* time * 10
        return {
          x, y,
        }
      });
  }

  drawCircle = (points, context) => {
    context.strokeStyle = 'rgb(0,0,0, 1)'
    context.lineWidth = 5
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

    const circleCount = 20
    return Array(circleCount)
      .fill(1)
      .forEach((_, i) => {
        const circleWidth = width + i * (width / circleCount)
        const circlePoints = getCirclePoints(circleWidth, 200, time, i);
        drawCircle(circlePoints, context);
      });
  }
};

canvasSketch(sketch, settings);
