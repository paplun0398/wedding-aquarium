// Configuration
const MAX_FISH = 150;
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg, rippleShader;

// Preload assets
function preload() {
  oceanBg = loadImage('assets/ocean-bg.jpg');
  coralImg = loadImage('assets/coral.png');
  bubbleImg = loadImage('assets/bubble.png');
  
  // Shaders
  loadStrings('assets/shaders/water.vert', (data) => {
    window.vertShaderCode = join(data, '\n');
    initShader();
  });
  
  loadStrings('assets/shaders/water.frag', (data) => {
    window.fragShaderCode = join(data, '\n');
    initShader();
  });
}

// Setup aquarium
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Environment
  for (let i = 0; i < 8; i++) {
    corals.push({
      x: random(-width/2, width/2),
      y: height/2 - random(50, 200),
      size: random(0.7, 1.3),
      wavePhase: random(TWO_PI)
    });
  }
  
  // Bubbles
  for (let i = 0; i < 30; i++) bubbles.push(new Bubble());
  
  // Initial fish
  for (let i = 0; i < 3; i++) addRandomFish();
}

// Main loop
function draw() {
  background(0, 50, 100);
  
  // Ocean background
  if (rippleShader) {
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    plane(width * 2, height * 2);
    resetShader();
  } else {
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }
  
  // Environment
  drawCorals();
  drawBubbles();
  
  // Fish
  updateAndDrawFish();
  
  // Add occasional bubbles
  if (frameCount % 60 === 0 && bubbles.length < 50) {
    bubbles.push(new Bubble());
  }
}

// Fish functions
function addFishToAquarium(img) {
  if (fishes.length < MAX_FISH) {
    fishes.push(new Fish(img));
  }
}

function addRandomFish() {
  let pg = createGraphics(200, 80);
  pg.fill(random(100,255), random(100,255), random(100,255));
  pg.ellipse(60, 40, 100, 40); // Body
  pg.triangle(110, 40, 160, 20, 160, 60); // Tail
  fishes.push(new Fish(pg));
}

function updateAndDrawFish() {
  fishes.forEach(fish => {
    fish.update();
    fish.display();
  });
}

// Fish class (with correct movement)
class Fish {
  constructor(img) {
    this.img = img;
    this.reset();
  }
  
  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.size = random(80, 150);
    this.speed = random(0.5, 1.5);
    this.angle = random(TWO_PI);
    this.tailWiggle = 0;
  }
  
  update() {
    this.tailWiggle = sin(frameCount * 0.2) * 10;
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    
    if (abs(this.x) > width/2 || abs(this.y) > height/2) {
      this.angle = atan2(-sin(this.angle), -cos(this.angle));
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    imageMode(CENTER);
    image(this.img, 0, 0, this.size, this.size * 0.4);
    
    fill(255, 200, 0);
    noStroke();
    beginShape();
    vertex(-this.size * 0.3, 0);
    vertex(-this.size * 0.5, this.tailWiggle - this.size * 0.1);
    vertex(-this.size * 0.5, this.tailWiggle + this.size * 0.1);
    endShape(CLOSE);
    
    pop();
  }
}

// Bubble class
class Bubble {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(height/2, height/2 + 100);
    this.size = random(5, 15);
    this.speed = random(1, 3);
  }
  
  update() {
    this.y -= this.speed;
    if (this.y < -height/2) this.reset();
  }
  
  display() {
    push();
    translate(this.x, this.y);
    image(bubbleImg, 0, 0, this.size, this.size);
    pop();
  }
}

// Environment rendering
function drawCorals() {
  corals.forEach(coral => {
    const wave = sin(coral.wavePhase + frameCount * 0.03) * 5;
    image(coralImg, coral.x, coral.y + wave, 
          coralImg.width * coral.size, coralImg.height * coral.size);
    coral.wavePhase += 0.005;
  });
}

function drawBubbles() {
  bubbles.forEach(bubble => bubble.display());
}

// Shader initialization
function initShader() {
  if (window.vertShaderCode && window.fragShaderCode) {
    rippleShader = createShader(vertShaderCode, fragShaderCode);
  }
}

// Window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}