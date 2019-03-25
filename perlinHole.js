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
  const noiseFrequency = 0.5

  const getCirclePoints = (width, size, time) => {
    const radius = width * 0.2;
    return Array(size)
      .fill(1)
      .map((_, i) => {
        const angle = (Math.PI * 2 / size) * i
        let x = Math.sin(angle) * (radius + time * 5)
        let y = Math.cos(angle) * (radius + time * 5)
        const noise = random.noise3D(Math.sin(angle), Math.cos(angle), time / 5, noiseFrequency) * 0.5 + 0.5
        x += Math.sin(angle) * noise * time * 10
        y += Math.cos(angle) * noise * time * 10
        return {
          x, y,
        }
      });
  }

  return ({ context, width, height, time }) => {
    
    if(!time) {
      context.fillStyle = 'white'
      context.fillRect(0, 0, width, height)
    }

    const circlePoints = getCirclePoints(width, 200, time);
    context.translate(width / 2, height / 2)
    /*circlePoints.forEach(p => {
      context.fillStyle = 'rgb(255,255,255, 0.2)'
      context.fillRect(p.x, p.y, 3, 3)
    })*/

    context.strokeStyle = 'rgb(0,0,0, 0.2)'
    context.lineWidth = 0.2
    context.beginPath();
    context.moveTo(circlePoints[0].x, circlePoints[0].y);
    for (i = 1; i < circlePoints.length - 2; i ++)
    {
        var xc = (circlePoints[i].x + circlePoints[i + 1].x) / 2;
        var yc = (circlePoints[i].y + circlePoints[i + 1].y) / 2;
        context.quadraticCurveTo(circlePoints[i].x, circlePoints[i].y, xc, yc);
    }
    // curve through the last two circlePoints
    context.quadraticCurveTo(circlePoints[i].x, circlePoints[i].y, circlePoints[i+1].x,circlePoints[i+1].y);
    context.quadraticCurveTo(circlePoints[i+1].x, circlePoints[i+1].y, circlePoints[0].x,circlePoints[0].y);
    context.stroke();
  }
};

canvasSketch(sketch, settings);
