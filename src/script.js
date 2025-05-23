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
    // Load background assets
    oceanBg = await loadImage('./assets/backgrounds/ocean-bg.jpg');
    coralImg = await loadImage('./assets/decorations/coral.png');
    bubbleImg = await loadImage('./assets/decorations/bubble.png');
    
    // Load fish template
    fishTemplate = await loadImage('./assets/templates/fish-template.png');
    
    // Load shaders
    const vertShader = await fetch('./assets/shaders/water.vert');
    const fragShader = await fetch('./assets/shaders/water.frag');
    const vertCode = await vertShader.text();
    const fragCode = await fragShader.text();
    
    rippleShader = createShader(vertCode, fragCode);
    shaderReady = true;
  } catch (error) {
    console.error("Error loading assets:", error);
    // Fallback to colored background if oceanBg fails to load
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
  
  // Initialize environment
  initEnvironment();
}

// ============== ENVIRONMENT FUNCTIONS ==============
function initEnvironment() {
  initCorals();
  initBubbles();
  
  // Initialize fish
  for (let i = 0; i < 3; i++) {
    addFish(fishTemplate, fishConfig);
  }
}

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

// ============== RENDERING ==============
function draw() {
  // Clear background
  background(0, 50, 100);
  
  // Draw ocean with shader or fallback
  drawBackground();
  
  // Draw environment
  drawCorals();
  drawBubbles();
  
  // Update and draw fish
  updateFish();
  
  // Occasionally add new bubbles
  if (frameCount % 60 === 0 && bubbles.length < 30) {
    bubbles.push(new Bubble(bubbleImg));
  }
}

function drawBackground() {
  if (shaderReady && rippleShader) {
    shader(rippleShader);
    rippleShader.setUniform('uTexture', oceanBg);
    rippleShader.setUniform('time', millis() / 1000);
    plane(width * 2, height * 2);
    resetShader();
  } else {
    image(oceanBg, -width/2, -height/2, width * 2, height * 2);
  }
}

function drawCorals() {
  push();
  for (let coral of corals) {
    coral.display();
  }
  pop();
}

function drawBubbles() {
  for (let bubble of bubbles) {
    bubble.update();
    bubble.display();
  }
}

function updateFish() {
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
}

// ============== FISH MANAGEMENT ==============
function addFish(img, config) {
  fishes.push(new Fish(img, config || {})); // Ensure config exists
  updateFishCount();
}

function updateFishCount() {
  const counter = document.getElementById('fish-count');
  if (counter) counter.textContent = `${fishes.length} fish`;
}

// ============== EVENT HANDLERS ==============
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Image upload
document.getElementById('fish-upload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const img = await loadImage(URL.createObjectURL(file));
    addFish(img); //
  } catch (error) {
    console.error("Error loading uploaded image:", error);
  }
});

// Public API
window.addFishToAquarium = addFish;