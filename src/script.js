// ============== IMPORTS ==============
import { loadImage } from './utils/imageLoader.js';
import Fish from './components/Fish.js';
import Bubble from './components/Bubble.js';
import Coral from './components/Coral.js';

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg, fishTemplate;
let fishConfig = {}; // Stores template configuration
let rippleShader;
let shaderReady = false;
let canvas;
let isWebGLSupported = true;

// ============== PRELOAD ASSETS ==============
async function preload() {
  try {
    // Load core assets
    [oceanBg, coralImg, bubbleImg] = await Promise.all([
      loadImage('./assets/backgrounds/ocean-bg.jpg'),
      loadImage('./assets/decorations/coral.png'),
      loadImage('./assets/decorations/bubble.png')
    ]);

    // Load fish template system
    try {
      fishConfig = await (await fetch('./assets/templates/fish-config.json')).json();
      fishTemplate = await loadImage(`./assets/templates/${fishConfig.templateImage}`);
    } catch (templateError) {
      console.warn("Using fallback fish - template missing:", templateError);
      fishTemplate = await loadImage('./assets/fallback-fish.png');
    }

    // Load shaders
    const [vertResponse, fragResponse] = await Promise.all([
      fetch('./assets/shaders/water.vert'),
      fetch('./assets/shaders/water.frag')
    ]);
    rippleShader = createShader(
      await vertResponse.text(),
      await fragResponse.text()
    );
  } catch (error) {
    console.error("Critical load error:", error);
    // Create fallback background
    oceanBg = createGraphics(100, 100);
    oceanBg.background(0, 50, 100);
  }
}

// ============== SETUP ==============
function setup() {
  // Canvas setup
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  isWebGLSupported = !!canvas.elt.getContext('webgl');
  
  if (!isWebGLSupported) {
    const msg = createDiv("WebGL not supported - Reduced effects");
    msg.style('color', 'white').style('padding', '20px');
  }

  // Initialize environment
  initCorals();
  initBubbles();
  initFish();
}

function initCorals() {
  for (let i = 0; i < 8; i++) {
    corals.push(new Coral({
      img: coralImg,
      x: random(-width/2, width/2),
      y: height/2 - random(50, 200),
      size: random(0.7, 1.3)
    }));
  }
}

function initBubbles() {
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble({
      img: bubbleImg,
      x: random(-width/2, width/2),
      y: random(height/2, height/2 + 100),
      size: random(5, 15)
    }));
  }
}

function initFish() {
  for (let i = 0; i < 3; i++) {
    addFish(fishTemplate, fishConfig);
  }
}

// ============== MAIN DRAW LOOP ==============
function draw() {
  // Background
  background(0, 50, 100);
  
  // Draw ocean
  drawOcean();

  // Environment
  drawCorals();
  drawBubbles();

  // Fish
  updateAndDrawFish();

  // Add occasional bubbles
  if (frameCount % 60 === 0 && bubbles.length < 30) {
    bubbles.push(new Bubble({
      img: bubbleImg,
      x: random(-width/2, width/2),
      y: height/2 + 50,
      size: random(5, 15)
    }));
  }
}

function drawOcean() {
  if (shaderReady && isWebGLSupported) {
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
  corals.forEach(coral => coral.display());
  pop();
}

function drawBubbles() {
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.display();
  });
}

function updateAndDrawFish() {
  fishes.forEach(fish => {
    fish.update();
    fish.display();
    
    // Edge detection with config-aware bouncing
    if (fish.shouldReverse()) {
      fish.reverseDirection();
    }
  });
}

// ============== FISH MANAGEMENT ==============
function addFish(img, config = null) {
  const newFish = new Fish({
    img: img,
    config: config,
    x: random(-width/2, width/2),
    y: random(-height/2, height/2),
    size: config?.baseSize || random(80, 150)
  });
  
  fishes.push(newFish);
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

// Image upload handler
document.getElementById('fish-upload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const img = await loadImage(URL.createObjectURL(file));
    addFish(img); // Add without config for custom fish
  } catch (error) {
    console.error("Upload failed:", error);
  }
});

// Public API
window.addFishToAquarium = (img) => addFish(img);
window.resetAquarium = () => {
  fishes = [];
  updateFishCount();
};