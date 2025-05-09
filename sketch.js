// CONFIGURATION
const MAX_FISH = 150;
const BUBBLE_COUNT = 30;
const CORAL_COUNT = 8;

let fishes = [], bubbles = [], corals = [];
let oceanBg, coralImg, bubbleImg, rippleShader;
let oceanTexture;

function preload() {
  // Load assets first
  oceanTexture = loadImage('assets/ocean-bg.jpg');
  
  // Load shaders as strings
  loadStrings('assets/shaders/water.vert', vertShaderLoaded);
  loadStrings('assets/shaders/water.frag', fragShaderLoaded);
}

let vertShaderCode, fragShaderCode;

function vertShaderLoaded(data) {
  vertShaderCode = join(data, '\n');
  tryInitShader();
}

function fragShaderLoaded(data) {
  fragShaderCode = join(data, '\n');
  tryInitShader();
}

function tryInitShader() {
  if (vertShaderCode && fragShaderCode) {
    rippleShader = createShader(vertShaderCode, fragShaderCode);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // ... rest of setup
}

function draw() {
  if (!rippleShader) {
    background(0, 50, 100);
    text("Loading shaders...", 0, 0);
    return;
  }

  // Draw with shader
  shader(rippleShader);
  rippleShader.setUniform('uTexture', oceanTexture);
  rippleShader.setUniform('time', millis() / 1000); // Use seconds
  
  push();
  translate(0, 100);
  plane(width * 1.5, height * 0.7);
  pop();
  
  resetShader();
  
  // Draw environment
  drawCorals();
  drawBubbles();
  drawFish();
}

// Environment initialization
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

// Drawing functions
function drawWater() {
  background(0, 50, 100);
  shader(rippleShader);
  rippleShader.setUniform('uTexture', oceanBg);
  rippleShader.setUniform('time', frameCount * 0.01);
  translate(0, 100);
  plane(width * 1.5, height * 0.7);
  resetShader();
}

function drawCorals() {
  corals.forEach(coral => {
    push();
    translate(coral.x, coral.y + sin(coral.wavePhase + frameCount * 0.03) * 5);
    scale(coral.size);
    image(coralImg, 0, 0);
    pop();
    coral.wavePhase += 0.005;
  });
}

function drawBubbles() {
  bubbles.forEach(bubble => {
    bubble.update();
    bubble.display();
  });
  
  // Add new bubbles occasionally
  if (frameCount % 60 === 0 && bubbles.length < BUBBLE_COUNT * 1.5) {
    bubbles.push(new Bubble());
  }
}

function updateAndDrawFish() {
  fishes.forEach(fish => {
    fish.update();
    fish.display();
  });
}

// Fish Class
class Fish {
  constructor(img, type = 'default') {
    this.img = img;
    this.type = type;
    this.reset();
  }
  
  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.speed = random(0.3, 1.2);
    this.angle = random(TWO_PI);
    this.flipPhase = 0;
    this.tailWiggle = 0;
  }
  
  update() {
    this.tailWiggle = sin(frameCount * 0.2) * 10;
    
    if (this.flipPhase > 0) {
      this.flipPhase -= 0.05;
    } else {
      this.x += cos(this.angle) * this.speed;
      this.y += sin(this.angle) * this.speed;
      
      if (abs(this.x) > width/2 || abs(this.y) > height/2) {
        this.flipPhase = PI;
        this.angle += PI + random(-0.5, 0.5);
      }
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    if (this.flipPhase > 0) {
      rotate(this.angle - PI);
      scale(1, map(this.flipPhase, PI, 0, -1, 1));
    } else {
      rotate(this.angle);
    }
    
    imageMode(CENTER);
    image(this.img, 0, 0, 100, 40);
    
    fill(255, 200, 0);
    beginShape();
    vertex(40, 0);
    vertex(60, this.tailWiggle - 15);
    vertex(60, this.tailWiggle + 15);
    endShape(CLOSE);
    
    pop();
  }
}

// Bubble Class
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

// Upload handling
function setupUpload() {
  uploadBtn.mousePressed(() => fishUpload.elt.click());
  
  fishUpload.elt.addEventListener('change', function(e) {
    if (fishes.length >= MAX_FISH) {
      statusText.html('Aquarium is full! Thank you!');
      return;
    }
    
    const file = e.target.files[0];
    if (file) {
      statusText.html('Processing...');
      const img = new Image();
      img.onload = () => {
        fishes.push(new Fish(img));
        statusText.html('Added! Your fish is swimming!');
        e.target.value = '';
      };
      img.src = URL.createObjectURL(file);
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
