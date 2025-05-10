// ============== GLOBAL VARIABLES ==============
let bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg;
let rippleShader;
let shaderReady = false;
let canvas;
let isWebGLSupported = true;
let vertShaderSource, fragShaderSource;

// ============== PRELOAD ASSETS ==============
function preload() {
  oceanBg = loadImage('./assets/backgrounds/ocean-bg.jpg');
  coralImg = loadImage('./assets/backgrounds/coral.png');
  bubbleImg = loadImage('./assets/backgrounds/bubble.png');
  
  // Load shader sources
  vertShaderSource = loadStrings('./assets/shaders/water.vert');
  fragShaderSource = loadStrings('./assets/shaders/water.frag');
}

// ============== SETUP ==============
function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLSupported = !!canvas.elt.getContext('webgl');
  
  // Verify WebGL support
  if (!isWebGLSupported) {
    console.error("WebGL not supported - using fallback");
    const fallbackMsg = createDiv("WebGL not supported - Some effects disabled");
    fallbackMsg.style('color', 'white').style('padding', '20px');
  } else {
    // Create shader only if WebGL is supported
    try {
      rippleShader = createShader(
        vertShaderSource.join('\n'), 
        fragShaderSource.join('\n')
      );
      shaderReady = true;
    } catch (err) {
      console.error("Shader error:", err);
      shaderReady = false;
    }
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
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }
  
  // Draw environment
  drawCorals();
  drawBubbles();
  
  // Add new bubbles occasionally
  if (frameCount % 60 === 0 && bubbles.length < 30) {
    bubbles.push(new Bubble());
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
    this.size = random(5, 20);
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
  for (let i = 0; i < 6; i++) {
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