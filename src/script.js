import Fish from "./components/fish/Fish.js";

// ============== GLOBAL VARIABLES ==============
let fishes = [];

// ============== RENDERING ==============
function draw() {
  // Clear background
  background(0, 50, 100);
  
  // Update and draw fish
  for (let fish of fishes) {
    fish.update();
    fish.display();
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
//     this.size = 150;
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