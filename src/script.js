// ============== IMPORTS ==============
import { loadImage } from './utils/imageLoader.js';
import Fish from './components/Fish.js';
import Bubble from './components/Bubble.js';
import Coral from './components/Coral.js';

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg, fishTemplate;
let fishConfig = {};
let rippleShader;
let shaderReady = false;
let canvas;
let isWebGLSupported = true;

// ============== PRELOAD ASSETS ==============
async function preload() {
  try {
    // Load core environment assets (preserved)
    oceanBg = await loadImage('./assets/backgrounds/ocean-bg.jpg');
    coralImg = await loadImage('./assets/decorations/coral.png');
    bubbleImg = await loadImage('./assets/decorations/bubble.png');

    // Try loading template system (new)
    try {
      fishConfig = await (await fetch('./assets/templates/fish-config.json')).json();
      fishTemplate = await loadImage(`./assets/templates/${fishConfig.templateImage}`);
    } catch {
      console.log("Using default fish instead of template");
      fishTemplate = await loadImage('./assets/fish.png'); // Fallback
    }

    // Preserved shader loading
    const [vert, frag] = await Promise.all([
      fetch('./assets/shaders/water.vert').then(r => r.text()),
      fetch('./assets/shaders/water.frag').then(r => r.text())
    ]);
    rippleShader = createShader(vert, frag);
    shaderReady = true;
  } catch (error) {
    console.error("Loading error:", error);
    // Fallback background
    oceanBg = createGraphics(width, height);
    oceanBg.background(0, 50, 100);
  }
}

// ============== SETUP ==============
function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLSupported = !!canvas.elt.getContext('webgl');
  
  if (!isWebGLSupported) {
    createDiv("WebGL not available - Using basic rendering")
      .style('color', 'white').style('padding', '20px');
  }

  // Preserved environment initialization
  initCorals();
  initBubbles();
  
  // Initialize fish (updated to use template)
  for (let i = 0; i < 3; i++) {
    addFish(fishTemplate, fishConfig);
  }
}

// ============== PRESERVED ENVIRONMENT FUNCTIONS ==============
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
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(bubbleImg));
  }
}

// ============== MAIN DRAW LOOP (PRESERVED + ENHANCED) ==============
function draw() {
  // Preserved background rendering
  if (shaderReady && isWebGLSupported) {
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    plane(width * 2, height * 2);
    resetShader();
  } else {
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }

  // Preserved coral rendering
  push();
  for (let coral of corals) {
    const waveOffset = sin(coral.wavePhase + frameCount * 0.03) * 5;
    imageMode(CENTER);
    image(coralImg, coral.x, coral.y + waveOffset, 
          coralImg.width * coral.size, coralImg.height * coral.size);
    coral.wavePhase += 0.005;
  }
  pop();

  // Preserved bubble rendering
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].y < -height/2) {
      bubbles.splice(i, 1);
      bubbles.push(new Bubble(bubbleImg));
    }
  }

  // Enhanced fish rendering
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }

  // Preserved bubble addition
  if (frameCount % 60 === 0 && bubbles.length < 30) {
    bubbles.push(new Bubble(bubbleImg));
  }
}

// ============== FISH MANAGEMENT ==============
function addFish(img, config = null) {
  fishes.push(config ? new Fish(img, config) : new Fish(img));
  updateFishCount();
}

function updateFishCount() {
  const counter = document.getElementById('fish-count');
  if (counter) counter.textContent = `${fishes.length} fish`;
}

// ============== PRESERVED BUBBLE CLASS ==============
class Bubble {
  constructor(img) {
    this.img = img;
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
  }

  display() {
    push();
    translate(this.x, this.y);
    image(this.img, 0, 0, this.size, this.size);
    pop();
  }
}

// ============== EVENT HANDLERS ==============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Preserved image upload
document.getElementById('fish-upload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const img = await loadImage(URL.createObjectURL(file));
    addFish(img); // Add without config for custom fish
  } catch (error) {
    console.error("Error loading uploaded image:", error);
  }
});

// Public API
window.addFishToAquarium = addFish;