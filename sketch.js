// ============== CONFIGURATION ==============
const MAX_FISH = 150;
const BUBBLE_COUNT = 30;
const CORAL_COUNT = 5;

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg, fishImg;
let rippleShader;
let shaderReady = false;
let canvas;

// ============== PRELOAD ASSETS ==============
function preload() {
  // Load images
  oceanBg = loadImage('assets/ocean-bg.jpg');
  coralImg = loadImage('assets/coral.png');
  bubbleImg = loadImage('assets/bubble.png');
  fishImg = loadImage('assets/fish.png');
  
  // Load shaders using fetch for better error handling
  Promise.all([
    fetch('assets/shaders/water.vert').then(r => r.text()),
    fetch('assets/shaders/water.frag').then(r => r.text())
  ]).then(([vertCode, fragCode]) => {
    try {
      rippleShader = createShader(vertCode, fragCode);
      shaderReady = true;
      console.log("Shaders loaded successfully");
    } catch (err) {
      console.error("Shader compilation failed:", err);
    }
  }).catch(err => {
    console.warn("Shader loading failed:", err);
  });
}

// ============== SETUP ==============
function setup() {
  // Create canvas with WEBGL context
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Verify WebGL support
  if (!canvas.elt.getContext('webgl')) {
    console.error("WebGL not supported - using fallback rendering");
    const fallbackMsg = createDiv("WebGL not supported - Some effects disabled");
    fallbackMsg.style('color', 'white').style('padding', '20px');
  }
  
  // Initialize environment
  initCorals();
  initBubbles();
}

// ============== MAIN DRAW LOOP ==============
function draw() {
  // Clear background
  background(0, 50, 100);
  
  // Draw ocean with shader or fallback
  if (shaderReady && rippleShader) {
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    plane(width * 2, height * 2);
    resetShader();
  } else {
    // Fallback rendering
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }
  
  // Draw environment elements
  drawCorals();
  drawBubbles();
  
  // Update and draw fish
  updateAndDrawFish();
  
  // Add new bubbles occasionally
  if (frameCount % 60 === 0 && bubbles.length < BUBBLE_COUNT * 1.5) {
    bubbles.push(new Bubble());
  }
}

// ============== FISH FUNCTIONS ==============
function addFishToAquarium(img) {
  if (fishes.length < MAX_FISH) {
    fishes.push(new Fish(img));
    updateFishCount();
  }
}

function updateAndDrawFish() {
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
}

function updateFishCount() {
  const counter = document.getElementById('fish-count');
  if (counter) counter.textContent = `${fishes.length} fish`;
}

// ============== FISH CLASS ==============
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
    this.angle = random(TWO_PI); // Random initial direction
    this.tailWiggle = 0;
  }
  
  update() {
    // Tail animation
    this.tailWiggle = sin(frameCount * 0.2) * 10;
    
    // Movement in facing direction
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    
    // Border collision - bounce off walls
    if (abs(this.x) > width/2 || abs(this.y) > height/2) {
      this.angle = atan2(-sin(this.angle), -cos(this.angle)); // Reverse direction
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle); // Face movement direction
    
    // Draw fish body
    imageMode(CENTER);
    image(this.img, 0, 0, this.size, this.size * 0.4);
    
    // Draw tail (always at back)
    fill(255, 200, 0);
    noStroke();
    beginShape();
    vertex(-this.size * 0.3, 0); // Connect to body
    vertex(-this.size * 0.5, this.tailWiggle - this.size * 0.1); // Tail tip
    vertex(-this.size * 0.5, this.tailWiggle + this.size * 0.1); // Tail tip
    endShape(CLOSE);
    
    pop();
  }
}

// ============== BUBBLE CLASS ==============
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

// ============== ENVIRONMENT FUNCTIONS ==============
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

// ============== WINDOW RESIZE ==============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ============== COMMUNICATION ==============
// For receiving new fish from upload page
if (typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('aquarium');
  channel.onmessage = (e) => {
    if (e.data.type === 'newFish') {
      const img = new Image();
      img.onload = () => {
        const p5Img = createImage(img.width, img.height);
        p5Img.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
        addFishToAquarium(p5Img);
      };
      img.src = e.data.data;
    }
  };
}
