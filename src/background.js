// ============== GLOBAL VARIABLES ==============
let let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg;
let rippleShader;
let shaderReady = false;
let canvas;
let isWebGLSupported = true;

// ============== PRELOAD ASSETS ==============
function preload() {
  oceanBg = loadImage('./assets/backgrounds/ocean-bg.jpg');
  coralImg = loadImage('./assets/backgrounds/coral.png');
  bubbleImg = loadImage('./assets/backgrounds/bubble.png');

  // Load shaders
  loadStrings('./assets/shaders/water.vert', vert => {
    loadStrings('./assets/shaders/water.frag', frag => {
      try {
        rippleShader = createShader(vert.join('\n'), frag.join('\n'));
        shaderReady = true;
      } catch (err) {
        console.error("Shader error:", err);
      }
    });
  });
}

// ============== SETUP ==============
function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLSupported = !!canvas.elt.getContext('webgl');

  // Verify WebGL support
  if (!canvas.elt.getContext('webgl')) {
    console.error("WebGL not supported - using fallback");
    const fallbackMsg = createDiv("WebGL not supported - Some effects disabled");
    fallbackMsg.style('color', 'white').style('padding', '20px');
  }

  // Initialize environment
  initCorals();
  initBubbles();
}

// ============== RENDERING ==============
function draw() {
  // Clear background
  background(0, 50, 100);

  // Draw ocean with shader or fallback
  if (shaderReady && rippleShader) {
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    plane(width * 2 + 2, height * 2 + 2);
    resetShader();
  } else {
    image(oceanBg, -width / 2, -height / 2, width * 2, height * 2);
  }

  // Draw environment
  drawCorals();
  drawBubbles();

  // Update and draw fish
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }

  // Add new bubbles occasionally
  if (frameCount % 60 === 0 && bubbles.length < 30) {
    bubbles.push(new Bubble());
  }
}

// ============== FISH CLASS ==============
class Fish {
  constructor(img) {
    this.img = img;
    this.size = 150;
    this.parts = {
      "tail": {
        "x": 1690,
        "y": 488,
        "width": 508,
        "height": 706,
        "pivotX": 1682,
        "pivotY": 810
      },
      "fin": {
        "x": 1184,
        "y": 128,
        "width": 470,
        "height": 308,
        "pivotX": 1182,
        "pivotY": 318
      }
    };
    this.reset();
  }

  reset() {
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);
    this.speed = random(0.5, 2);
    this.direction = -1; // 1=right
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

// ============== BUBBLE CLASS ==============
class Bubble {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(-width / 2, width / 2);
    this.y = random(height / 2, height / 2 + 100);
    this.size = random(5, 20);
    this.speed = random(1, 3);
  }

  update() {
    this.y -= this.speed;
    if (this.y < -height / 2) this.reset();
  }

  display() {
    push();
    translate(this.x, this.y);
    image(bubbleImg, 0, 0, this.size, this.size);
    pop();
  }
}

// ============== ENVIRONMENT FUNCTIONS ==============
function initCorals() {
  for (let i = 0; i < 6; i++) {
    corals.push({
      x: random(-width / 2, width / 2),
      y: height / 2 - random(50, 200),
      size: random(0.7, 1.3),
      wavePhase: random(TWO_PI)
    });
  }
}

function initBubbles() {
  for (let i = 0; i < 30; i++) {
    bubbles.push(new Bubble());
  }
}

function drawCorals() {
  push();
  for (let coral of corals) {
    const waveOffset = sin(coral.wavePhase + frameCount * 0.03) * 5;
    imageMode(CENTER);
    image(coralImg, coral.x, coral.y + waveOffset,
      coralImg.width * coral.size, coralImg.height * coral.size);
    coral.wavePhase += 0.005;
  }
  pop();
}

function drawBubbles() {
  for (let bubble of bubbles) {
    bubble.update();
    bubble.display();
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

// ============== WINDOW RESIZE ==============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}