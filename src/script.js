// import Fish from "./components/fish/Fish.js";

// ============== GLOBAL VARIABLES ==============
let fishes = [];

// ============== RENDERING ==============
function draw() {
  // Update and draw fish
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
}

// ============== FISH FUNCTIONS ==============
function addFishToAquarium(img) {
  fishes.push(new Fish(img));
  updateFishCount();
}

function updateFishCount() {
  const counter = document.getElementById('fish-count');
  if (counter) counter.textContent = `${fishes.length} fish`;
}

// ============== FISH CLASS ==============
class Fish {
  constructor(img) {
    this.img = img;
    this.size = 150;
    this.parts = {
      "tail": {
        "x": 0.2,
        "y": 1.4,
        "width": 2.2,
        "height": 1.2,
        "pivotX": 2.4,
        "pivotY": 4.4
      },
      "fin": {
        "x": 3,
        "y": 0.6,
        "width": 4.9,
        "height": 1.5,
        "pivotX": 4.2,
        "pivotY": 2.1
      }
    };
    this.reset();
  }

  reset() {
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);
    this.speed = random(0.5, 2);
    this.direction = 1; // 1=right
    this.angle = 0; // Swimming direction (radians)
    this.isUpsideDown = false;
  }

  update() {
    // Movement (head direction)
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;

    // Prevent upside-down orientation
    if (abs(this.angle) > PI / 2) {
      this.isUpsideDown = true;
    } else {
      this.isUpsideDown = false;
    }

    // Edge bounce with direction flip
    if (this.x > width / 2 || this.x < -width / 2) {
      this.direction *= -1;
      this.angle = atan2(sin(this.angle), -cos(this.angle));
    }
  }

  display() {
    push();
    translate(this.x, this.y);

    // Correct orientation
    scale(this.direction, this.isUpsideDown ? -1 : 1);
    rotate(this.angle);

    // Draw base image (body/head)
    image(this.img, 0, 0, this.size, this.size * 0.4);

    // ANIMATE TAIL
    push();
    translate(this.parts.tail.pivotX, this.parts.tail.pivotY);
    rotate(sin(frameCount * 0.2) * 0.5);
    translate(-this.parts.tail.pivotX, -this.parts.tail.pivotY);
    image(
      this.img,
      0, 0,
      this.parts.tail.width, this.parts.tail.height,
      this.parts.tail.x, this.parts.tail.y,
      this.parts.tail.width, this.parts.tail.height
    );
    pop();

    // ANIMATE FIN
    if (this.parts.fin) {
      push();
      translate(this.parts.fin.pivotX, this.parts.fin.pivotY);
      rotate(sin(frameCount * 0.15 + 1) * 0.3);
      translate(-this.parts.fin.pivotX, -this.parts.fin.pivotY);
      image(
        this.img,
        0, 0,
        this.parts.fin.width, this.parts.fin.height,
        this.parts.fin.x, this.parts.fin.y,
        this.parts.fin.width, this.parts.fin.height
      );
      pop();
    }

    pop();
  }
}