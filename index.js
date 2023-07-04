window.onload = function () {
  const app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundColor: 0x000000,
  });

  const gameContainer = document.createElement("div");
  gameContainer.classList.add("game");
  document.body.appendChild(gameContainer);
  gameContainer.appendChild(app.view);

  const canvasRect = new PIXI.Graphics();
  canvasRect.beginFill(0xffffff);
  canvasRect.drawRect(0, 0, 800, 600);
  canvasRect.endFill();
  app.stage.addChild(canvasRect);

  const shapes = [];
  const shapeTypes = [
    "3sides",
    "4sides",
    "5sides",
    "6sides",
    "circle",
    "ellipse",
    "star",
  ];

  const shapeCountText = document.getElementById("shapeCount");
  const surfaceAreaText = document.getElementById("surfaceArea");
  const shapesPerSecondText = document.getElementById("shapesPerSecond");
  const decreaseShapesPerSecondButton = document.getElementById(
    "decreaseShapesPerSecond"
  );
  const increaseShapesPerSecondButton = document.getElementById(
    "increaseShapesPerSecond"
  );
  const gravityText = document.getElementById("gravity");
  const decreaseGravityButton = document.getElementById("decreaseGravity");
  const increaseGravityButton = document.getElementById("increaseGravity");

  let shapesPerSecond = 1;
  let gravity = 5;

  function getRandomShapeType() {
    const randomIndex = Math.floor(Math.random() * shapeTypes.length);
    return shapeTypes[randomIndex];
  }

  function getRandomColor() {
    return Math.random() * 0xffffff;
  }

  class Shape extends PIXI.Graphics {
    constructor(type, color) {
      super();

      this.type = type;
      this.color = color;
      this.beginFill(this.color);

      switch (this.type) {
        case "3sides":
          this.drawPolygon([0, 0, 50, 100, 100, 0]);
          break;
        case "4sides":
          this.drawRect(0, 0, 100, 100);
          break;
        case "5sides":
          this.drawPolygon([50, 0, 100, 50, 75, 100, 25, 100, 0, 50]);
          break;
        case "6sides":
          this.drawPolygon([50, 0, 100, 30, 75, 100, 25, 100, 0, 30, 50, 0]);
          break;
        case "circle":
          this.drawCircle(50, 50, 50);
          break;
        case "ellipse":
          this.drawEllipse(50, 50, 50, 30);
          break;
        case "star":
          this.drawStar(50, 50, 5, 50, 25);
          break;
        default:
          this.drawIrregularShape();
          break;
      }

      this.endFill();

      this.x = Math.random() * 800;
      this.y = -100;

      this.interactive = true;
      this.buttonMode = true;
      this.on("click", () => {
        this.remove();
      });

      app.stage.addChild(this);
    }

    remove() {
      app.stage.removeChild(this);
      const index = shapes.indexOf(this);
      if (index !== -1) {
        shapes.splice(index, 1);
      }
      updateTextFields();
    }

    update() {
      this.y += gravity;

      if (this.y > 600) {
        app.stage.removeChild(this);
      }
    }

    drawStar(x, y, numPoints, outerRadius, innerRadius) {
      const rotation = (Math.PI / 2) * 3;
      const angle = Math.PI / numPoints;

      this.moveTo(x, y - outerRadius);

      for (let i = 0; i < numPoints; i++) {
        const x1 = x + Math.cos(rotation + angle * i) * outerRadius;
        const y1 = y + Math.sin(rotation + angle * i) * outerRadius;
        this.lineTo(x1, y1);

        const x2 = x + Math.cos(rotation + angle * (i + 0.5)) * innerRadius;
        const y2 = y + Math.sin(rotation + angle * (i + 0.5)) * innerRadius;
        this.lineTo(x2, y2);
      }

      this.closePath();
    }

    drawIrregularShape() {
      const numPoints = Math.floor(Math.random() * 6) + 3;

      this.moveTo(Math.random() * 100, Math.random() * 100);

      for (let i = 0; i < numPoints - 1; i++) {
        this.lineTo(Math.random() * 100, Math.random() * 100);
      }

      this.closePath();
    }
  }

  function generateShape(x, y) {
    const shapeType = getRandomShapeType();
    const color = getRandomColor();
    const shape = new Shape(shapeType, color);
    if (x !== undefined && y !== undefined) {
      shape.x = x;
      shape.y = y;
    }
    shapes.push(shape);
    updateTextFields();
  }

  let shapeInterval = setInterval(generateShape, 1000 / shapesPerSecond);

  decreaseShapesPerSecondButton.addEventListener("click", () => {
    if (shapesPerSecond > 1) {
      shapesPerSecond--;
      clearInterval(shapeInterval);
      shapeInterval = setInterval(generateShape, 1000 / shapesPerSecond);
      updateTextFields();
    }
  });

  increaseShapesPerSecondButton.addEventListener("click", () => {
    shapesPerSecond++;
    clearInterval(shapeInterval);
    shapeInterval = setInterval(generateShape, 1000 / shapesPerSecond);
    updateTextFields();
  });

  decreaseGravityButton.addEventListener("click", () => {
    if (gravity > 1) {
      gravity--;
      updateTextFields();
    }
  });

  increaseGravityButton.addEventListener("click", () => {
    gravity++;
    updateTextFields();
  });

  function updateTextFields() {
    shapeCountText.textContent = shapes.length;
    surfaceAreaText.textContent = calculateSurfaceArea();
    shapesPerSecondText.textContent = shapesPerSecond;
    gravityText.textContent = gravity;
  }

  function calculateSurfaceArea() {
    let surfaceArea = 0;
    shapes.forEach((shape) => {
      if (shape.type === "circle") {
        surfaceArea += Math.PI * Math.pow(shape.width / 2, 2);
      } else if (shape.type === "ellipse") {
        surfaceArea += (Math.PI * shape.width * shape.height) / 4;
      } else {
        surfaceArea += shape.width * shape.height;
      }
    });
    return surfaceArea.toFixed(2);
  }

  app.ticker.add(() => {
    shapes.forEach((shape) => shape.update());
  });

  app.stage.interactive = true;

  function isPointInsideRectangle(point, rectangle) {
    return (
      point.x >= rectangle.x &&
      point.x <= rectangle.x + rectangle.width &&
      point.y >= rectangle.y &&
      point.y <= rectangle.y + rectangle.height
    );
  }

  app.stage.on("click", (event) => {
    const { x, y } = event.data.global;
    let clickedShape = null;

    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (isPointInsideRectangle(new PIXI.Point(x, y), shape)) {
        clickedShape = shape;
        break;
      }
    }
    if (clickedShape === null) {
      generateShape(x, y);
    }
  });

  updateTextFields();
};
