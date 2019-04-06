const canvasSketch = require('canvas-sketch')
const random = require('canvas-sketch-util/random')
const d3 = require('d3')
const gaussian = require('gaussian');

random.setSeed(random.getRandomSeed());

const settings = {
  dimensions: [1024, 1024],
  suffix: random.getSeed(),
  animate: true,
  fps: 24,
  //duration: 10,
};

class Noise {
  static lerp(t, a, b) {
    return a + t * (b - a);
  }
  static grad2d(i, x, y) {
    const v = (i & 1) === 0 ? x : y;
    return (i & 2) === 0 ? -v : v;
  }
  constructor(octaves = 1) {
    this.p = new Uint8Array(512);
    this.octaves = octaves;
    this.init();
  }
  init() {
    for (let i = 0; i < 512; ++i) {
      this.p[i] = random.value() * 256;
    }
  }
  noise2d(x2d, y2d) {
    const X = Math.floor(x2d) & 255;
    const Y = Math.floor(y2d) & 255;
    const x = x2d - Math.floor(x2d);
    const y = y2d - Math.floor(y2d);
    const fx = (3 - 2 * x) * x * x;
    const fy = (3 - 2 * y) * y * y;
    const p0 = this.p[X] + Y;
    const p1 = this.p[X + 1] + Y;
    return Noise.lerp(
      fy,
      Noise.lerp(
        fx,
        Noise.grad2d(this.p[p0], x, y),
        Noise.grad2d(this.p[p1], x - 1, y)
      ),
      Noise.lerp(
        fx,
        Noise.grad2d(this.p[p0 + 1], x, y - 1),
        Noise.grad2d(this.p[p1 + 1], x - 1, y - 1)
      )
    );
  }
  noise(x, y) {
    let e = 1,
        k = 1,
        s = 0;
    for (let i = 0; i < this.octaves; ++i) {
      e *= 0.5;
      s += e * (1 + random.noise2D(k * x, k * y)) / 2;
      k *= 2;
    }
    return s;
  }

  noise3D(x, y, z) {
    let e = 1,
        k = 1,
        s = 0;
    for (let i = 0; i < this.octaves; ++i) {
      e *= 0.5;
      s += e * (1 + random.noise3D(k * x, k * y, z)) / 2;
      k *= 2;
    }
    return s;
  }
}

const sketch = () => {
  
  const getSlicePoints = (width, pointsOnSphere, index, sliceCount, time) => {
    const angleStep = (1 / pointsOnSphere * Math.PI * 2)
    const yStep = 1 / sliceCount
    const z = index / sliceCount * 2 - 1 
    const radius = Math.sqrt(1 - z ** 2)
    const frequency = 100
    return Array(pointsOnSphere)
      .fill(1)
      .map((_, i) => {
        const angle = (i * angleStep) + Math.PI * 2
        let x = 0.5 + ((Math.sin(angle) / 2) * radius)  //( Math.sqrt(1 - Math.sin((index * yStep) - 0.5) ** 2)))
        let y = (((Math.cos(angle) / 2) * radius) + (index * yStep)) //* (index * xRadiusStep) 
        let noise = random.noise3D(x, y, z, frequency) * 0.5 + 0.5
        return {
          x, y, opacity: Math.sin(angle) * 0.5 + 0.5, noise
        }
      });
  }

  const getSquaredGrid = (size, index, sliceCount, time) => {
    const cellSize = 1 / size
    const z = index / sliceCount * 2 - 1 
    const frequency = 1
    return Array((size + 1) ** 2)
      .fill(1)
      .map((_, i) => {
        const x = (i % (size + 1)) * cellSize
        const y = Math.floor(i / (size + 1)) * cellSize
        let noise = random.noise4D(x, y, z, time * 0.1, frequency) * 0.5 + 0.5
        return {
          x, y, opacity: noise > 0.5 ? 1 : 0, noise
        }
      });
  }

  const getContour = (grid, index, sliceCount) => {
    const size = Math.sqrt(grid.length - 1)
    const values = grid.map(c => c.noise)
    const contours = d3.contours().size([size, size])
    const contour = contours.contour(values, 0.5)
    const z = index / sliceCount * 2 - 1 
    const radius = size * Math.sqrt(1 - z ** 2) / 2
    contour.coordinates = contour.coordinates.map(poly => {
      return poly.map(island => {
        return island.map(p => {
          const dist = Math.sqrt((p[0] - (size/2)) ** 2 + (p[1] - (size/2)) ** 2)
          if (Math.abs(dist - radius) < size * 0.005) {
            const angle = Math.atan2((p[1] - (size/2)), (p[0] - (size/2))) 
            return [(size/2) + (Math.cos(angle) * radius), (size/2) + (Math.sin(angle) * radius)];
          } 
          return p; 
        })
      })
    })
    return contour
  }

  const getContourCoordinates = (grid, index, sliceCount) => {
    const size = Math.sqrt(grid.length - 1)
    const yStep = 1 / sliceCount * size
    const values = grid.map(c => c.noise)
    const contours = d3.contours().size([size, size])
    const contour = contours.contour(values, 0.5)
    const coordinates = contour.coordinates.map(poly => {
      return poly.map(island => {
        return island
          .map(p => [p[0], p[1]])
      })
    })
    return coordinates
  }

  drawGrid = (points, context) => {
    points.forEach(p => {
      context.fillStyle = `rgb(255, 255, 255, ${p.opacity})`
      context.fillRect(p.x, p.y, 1, 1)
    })
  }

  drawSlice = (points, width, context) => {
    context.lineWidth = width * 0.003
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    for (i = 1; i < l - 1; i ++)
    {
      context.beginPath();
      context.strokeStyle = `rgb(255, 255, 255)`
      context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      context.stroke();
    }
    context.beginPath();
    context.strokeStyle = `rgb(255, 255, 255)`
    context.quadraticCurveTo(points[i].x, points[i].y,points[1].x, points[1].y);
    context.stroke();
  }

  drawFilledSlice = (points, width, index, context) => {
    context.save()
    context.translate(width / 2, width / 2);
    context.rotate(-Math.PI / 4);
    context.translate(-width / 2, -width / 2);
    context.translate(-(width/8) + width * index * 0.3 , (width/8) - width * index * 0.3)
    context.transform(1, 0, 0.5, 1, -width/ 4, 0);

    context.lineWidth = width * 0.0015
    context.moveTo(points[0].x, points[0].y);
    const l = points.length;
    context.beginPath();
    for (i = 1; i < l - 1; i ++)
    {
      context.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
    context.fillStyle= d3.interpolateYlGnBu(index)//'black';
    context.strokeStyle = `rgb(255, 255, 255)`
    context.quadraticCurveTo(points[i].x, points[i].y,points[1].x, points[1].y);
    context.closePath();
    context.fill();
    context.stroke();
    context.restore();
    //context.rotate(-45 * Math.PI / 180);
    //context.translate(-width / 2, 0);*/
  }

  drawContour = (contour, width, margin, size, context) => {
    const q = width * margin
    const scale = (width - (width * margin * 2)) / size
    projection = d3.geoIdentity().translate([q, q]).scale(scale)
    const path = d3.geoPath(projection, context);

    context.beginPath();
    path(contour);
    context.strokeStyle = 'white';
    context.lineWidth = 3;
    context.stroke()
  }

  drawContourCoordinates = (contourCoordinates, xScale, yScale, width, size, index, context) => {
    contourCoordinates.forEach(contour => {
      const points = contour[0].map(c => ({
        x: xScale(c[0] / size),
        y: yScale(c[1] / size),
        opacity: 1,
      }))
      drawFilledSlice(points, width, index, context);
    })
  }

  return ({ context, width, height, time }) => {
    
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    const size = 100
    const sliceCount = 30
    const margin = 0.3
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([margin * width, (1 - margin) * width])
    const squeeze = 0.5
    const sliceHeight = (height) * squeeze
    const yScale = d3.scaleLinear()
      .domain([1, 0])
      .range([(height - sliceHeight) / 2,  (height + sliceHeight) / 2])
    return Array(sliceCount)
      .fill(1)
      .forEach((_, i) => {
        //const line = getSlicePoints(width, pointsOnSlice, i, sliceCount, time)
        //  .map(p => ({ ...p, x: xScale(p.x), y: yScale(p.y) }))
        //drawSlice(line, width, context)
        const grid = getSquaredGrid(size, i, sliceCount, time)
        //drawGrid(grid.map(p => ({ ...p, x: xScale(p.x), y: xScale(p.y) })), context)
        //const contour = getContour(grid, i, sliceCount)
        //drawContour(contour, width, margin, size, context)
        const contourCoordinates = getContourCoordinates(grid, i, sliceCount)
        drawContourCoordinates(contourCoordinates, xScale, xScale, width, size, i/sliceCount, context)
      });
  }
};

canvasSketch(sketch, settings);
