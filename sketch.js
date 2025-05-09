// ============== CONFIGURATION ==============
const MAX_FISH = 150;
const BUBBLE_COUNT = 30;
const CORAL_COUNT = 8;

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg;
let rippleShader, oceanPlane;
let vertShaderCode, fragShaderCode;

// ============== PRELOAD ASSETS ==============
function preload() {
  // Load images
  oceanBg = loadImage('assets/ocean-bg.jpg');
  coralImg = loadImage('assets/coral.png');
  bubbleImg = loadImage('assets/bubble.png');
  
  // Load shaders as raw text
  loadStrings('assets/shaders/water.vert', (data) => {
    vertShaderCode = join(data, '\n');
    tryInitShader();
  });
  
  loadStrings('assets/shaders/water.frag', (data) => {
    fragShaderCode = join(data, '\n');
    tryInitShader();
  });
}

// ============== SETUP ==============
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Create fullscreen ocean plane
  oceanPlane = createPlaneGeometry(width * 2, height * 2);
  
  // Set camera perspective
  camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
  
  // Initialize environment
  initCorals();
  initBubbles();
  
  // Start with some fish
  for (let i = 0; i < 5; i++) {
    addRandomFish();
  }
}

// ============== MAIN DRAW LOOP ==============
function draw() {
  // Draw ocean background
  drawOcean();
  
  // Draw environment elements
  drawCorals();
  drawBubbles();
  
  // Draw all fish
  updateAndDrawFish();
  
  // Add new bubbles occasionally
  if (frameCount % 60 === 0 && bubbles.length < BUBBLE_COUNT * 1.5) {
    bubbles.push(new Bubble());
  }
}

// ============== CORE FUNCTIONS ==============

function drawOcean() {
  if (rippleShader && oceanBg) {
    // Draw with shader effect
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    rippleShader.setUniform('resolution', [width, height]);
    model(oceanPlane);
    resetShader();
  } else {
    // Fallback: plain background
    background(0, 50, 100);
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }
}

function initCorals() {
  for (let i = 0; i < CORAL_COUNT; i++) {
    corals.push({
      x: random(-width/2, width/2),
      y: height/2 - random(50, 200),
      size: random(0.7, 1.3),
      wavePhase: random(TWO_PI)
    });
  }
}

function initBubbles() {
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push(new Bubble());
  }
}

function updateAndDrawFish() {
  for (let fish of fishes) {
    fish.update();
    fish.display();
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
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].shouldRemove) bubbles.splice(i, 1);
  }
}

// ============== CLASS DEFINITIONS ==============

class Fish {
  constructor(img) {
    this.img = img;
    this.size = random(80, 150);
    this.reset();
  }
  
  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.speed = random(0.5, 1.5);
    this.angle = random(TWO_PI);
    this.tailWiggle = 0;
    this.flipPhase = 0;
    this.isFacingRight = random() > 0.5; // Random initial orientation
  }
  
  update() {
    // Tail animation
    this.tailWiggle = sin(frameCount * 0.2) * 10;
    
    // Movement - always move forward relative to head direction
    if (this.flipPhase > 0) {
      this.flipPhase -= 0.05;
    } else {
      const moveAngle = this.isFacingRight ? this.angle : this.angle + PI;
      this.x += cos(moveAngle) * this.speed;
      this.y += sin(moveAngle) * this.speed;
      
      // Border collision with flip
      if (abs(this.x) > width/2 || abs(this.y) > height/2) {
        this.flipPhase = PI;
        this.angle += PI + random(-0.5, 0.5);
      }
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Flip animation
    if (this.flipPhase > 0) {
      const flipDirection = this.isFacingRight ? 1 : -1;
      rotate(this.angle - PI/2);
      scale(flipDirection, map(this.flipPhase, PI, 0, -1, 1));
    } else {
      // Face forward based on orientation
      rotate(this.angle - PI/2); // Head faces direction of movement
      scale(this.isFacingRight ? 1 : -1, 1); // Flip horizontally if needed
    }
    
    // Draw fish body
    imageMode(CENTER);
    image(this.img, 0, 0, this.size, this.size * 0.4);
    
    // Draw tail (fixed to always be at the back)
    fill(255, 200, 0);
    noStroke();
    beginShape();
    vertex(this.size * -0.3, 0); // Connected to body
    vertex(this.size * -0.5, this.tailWiggle - this.size * 0.1); // Tail tip
    vertex(this.size * -0.5, this.tailWiggle + this.size * 0.1); // Tail tip
    endShape(CLOSE);
    
    pop();
  }
}

class Bubble {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(height/2, height/2 + 100);
    this.size = random(5, 15);
    this.speed = random(1, 3);
    this.shouldRemove = false;
  }
  
  update() {
    this.y -= this.speed;
    if (this.y < -height/2 - 50) this.shouldRemove = true;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    image(bubbleImg, 0, 0, this.size, this.size);
    pop();
  }
}

// ============== UTILITY FUNCTIONS ==============

function createPlaneGeometry(w, h) {
  let g = createGraphics(w, h, WEBGL);
  g.noStroke();
  g.beginShape();
  g.vertex(-w/2, -h/2, 0, 0);
  g.vertex(w/2, -h/2, 1, 0);
  g.vertex(w/2, h/2, 1, 1);
  g.vertex(-w/2, h/2, 0, 1);
  g.endShape(CLOSE);
  return g;
}

function tryInitShader() {
  if (vertShaderCode && fragShaderCode) {
    try {
      rippleShader = createShader(vertShaderCode, fragShaderCode);
    } catch (err) {
      console.error("Shader error:", err);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
  oceanPlane = createPlaneGeometry(width * 2, height * 2);
}

// ============== FISH CREATION ==============

function addRandomFish() {
  if (fishes.length >= MAX_FISH) return;
  
  // Create a placeholder fish graphic
  let pg = createGraphics(200, 80);
  pg.fill(255, 200, 0);
  pg.ellipse(60, 40, 100, 40); // Body
  pg.triangle(110, 40, 160, 20, 160, 60); // Tail
  
  fishes.push(new Fish(pg));
}

// For upload functionality (connect to your HTML)
function handleUploadedImage(img) {
  if (fishes.length >= MAX_FISH) return;
  
  let p5Img = createImage(img.width, img.height);
  p5Img.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
  p5Img.resize(200, 0); // Standardize size
  
  fishes.push(new Fish(p5Img));
}
