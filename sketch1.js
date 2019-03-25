const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [2048, 2048],
  /*dimensions: 'A4',
  units: 'cm',
  pixelPerInch: 300*/
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, width, height);

    context.beginPath();
    context.arc(width / 2, height / 2, width * 0.4, 0, Math.PI * 2);
    context.fillStyle = 'dodgerblue';
    context.fill();
    context.lineWidth = width * 0.01;
    context.strokeStyle = 'black';
    context.stroke();
  };
};

canvasSketch(sketch, settings);
