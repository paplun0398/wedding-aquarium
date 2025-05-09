// ============== IMPORTS ==============
import { loadImage } from './utils/imageLoader.js';
import Fish from './components/Fish.js';
import Bubble from './components/Bubble.js';
import Coral from './components/Coral.js';

// ============== GLOBAL VARIABLES ==============
let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg;
let fishTemplate, fishConfig;
let rippleShader;
let shaderReady = false;
let canvas;

// ============== PRELOAD ASSETS ==============
async function preload() {
  try {
    // Load environment assets
    oceanBg = await loadImage('./assets/backgrounds/ocean-bg.jpg');
    coralImg = await loadImage('./assets/decorations/coral.png');
    bubbleImg = await loadImage('./assets/decorations/bubble.png');
    
    // Load fish template system
    fishConfig = await (await fetch('./assets/templates/fish-config.json')).json();
    fishTemplate = await loadImage(`./assets/templates/${fishConfig.templateImage}`);
    
    // Load shaders
    const vertShader = await fetch('./assets/shaders/water.vert');
    const fragShader = await fetch('./assets/shaders/water.frag');
    const vertCode = await vertShader.text();
    const fragCode = await fragShader.text();
    
    rippleShader = createShader(vertCode, fragCode);
    shaderReady = true;
  } catch (error) {
    console.error("Error loading assets:", error);
    // Fallback to colored background
    oceanBg = createGraphics(width, height);
    oceanBg.background(0, 50, 100);
  }
}

// ============== SETUP ==============
function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Verify WebGL support
  if (!canvas.elt.getContext('webgl')) {
    console.warn("WebGL not supported - using fallback rendering");
    const fallbackMsg = createDiv("WebGL not supported - Some effects disabled");
    fallbackMsg.style('color', 'white').style('padding', '20px');
  }
  
  // Initialize with template-based fish
  initEnvironment();
}

function initEnvironment() {
  // Create corals
  for (let i = 0; i < 8; i++) {
    corals.push(new Coral(coralImg));
  }
  
  // Create initial bubbles
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(bubbleImg));
  }
  
  // Create initial fish using template
  for (let i = 0; i < 3; i++) {
    addFish(fishTemplate, fishConfig);
  }
}

// ============== FISH MANAGEMENT ==============
function addFish(img, config = null) {
  const newFish = config ? 
    new Fish(img, config) :
    new Fish(img);
  
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

// Handle image uploads
document.getElementById('fish-upload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const img = await loadImage(URL.createObjectURL(file));
    addFish(img);
  } catch (error) {
    console.error("Error loading uploaded image:", error);
  }
});

// Export for HTML access
window.addFishToAquarium = addFish;