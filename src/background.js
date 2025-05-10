let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg;

async function preload() {
  oceanBg = loadImage('./assets/backgrounds/ocean-bg.jpg');
  coralImg = loadImage('./assets/decorations/coral.png');
  bubbleImg = loadImage('./assets/decorations/bubble.png');

  // Load shaders
  const vertShader = await fetch('./assets/shaders/water.vert');
  const fragShader = await fetch('./assets/shaders/water.frag');
  const vertCode = await vertShader.text();
  const fragCode = await fragShader.text();
  rippleShader = createShader(vertCode, fragCode);
  shaderReady = true;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Initialize environment
  for (let i = 0; i < 8; i++) {
    corals.push({
      x: random(-width/2, width/2),
      y: height/2 - random(50, 200),
      size: random(0.7, 1.3)
    });
  }
  
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: random(-width/2, width/2),
      y: random(height/2, height/2 + 100),
      size: random(5, 15)
    });
  }
}

function draw() {
  background(0, 50, 100);
  
  // Draw ocean
  image(oceanBg, -width/2, -height/2, width*2, height*2);
  
  // Draw corals
  corals.forEach(coral => {
    image(coralImg, coral.x, coral.y, 
         coralImg.width * coral.size, coralImg.height * coral.size);
  });
  
  // Draw bubbles
  bubbles.forEach(bubble => {
    image(bubbleImg, bubble.x, bubble.y, bubble.size, bubble.size);
    bubble.y -= 2;
    if (bubble.y < -height/2) bubble.y = height/2 + 100;
  });
}