import Fish from "./components/fish/Fish.js";

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
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
    plane(width * 2, height * 2);
    resetShader();
  } else {
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
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
// class Fish {
//   constructor(img) {
//     this.img = img;
//     this.size = random(80, 150);
//     this.reset();
//   }
  
//   reset() {
//     this.x = random(-width/2, width/2);
//     this.y = random(-height/2, height/2);
//     this.speed = random(0.5, 1.5);
//     this.angle = random(TWO_PI);
//     this.tailWiggle = 0;
//   }
  
//   update() {
//     // Tail animation
//     this.tailWiggle = sin(frameCount * 0.2) * 10;
    
//     // Movement
//     this.x += cos(this.angle) * this.speed;
//     this.y += sin(this.angle) * this.speed;
    
//     // Bounce off walls
//     if (abs(this.x) > width/2 || abs(this.y) > height/2) {
//       this.angle = atan2(-sin(this.angle), -cos(this.angle));
//     }
//   }
  
//   display() {
//     push();
//     translate(this.x, this.y);
//     rotate(this.angle);
    
//     imageMode(CENTER);
//     image(this.img, 0, 0, this.size, this.size * 0.4);
    
//     pop();
//   }
// }

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
  for (let i = 0; i < 8; i++) {
    corals.push({
      x: random(-width/2, width/2),
      y: height/2 - random(50, 200),
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

// ============== WINDOW RESIZE ==============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}