export default class Fish {
    constructor(img) {
      this.img = img;
      this.size = random(80, 150);
      this.reset();
      
      // Fish parts configuration
      this.parts = this.createParts();
      this.animation = {
        tailWagSpeed: random(0.1, 0.3),
        tailWagAmount: random(5, 15),
        finFlapSpeed: random(0.05, 0.15),
        finFlapAmount: random(3, 8)
      };
    }
    
    createParts() {
      // Adjust these values to match your template
      return {
        head: { x: 0, y: 0, width: 40, height: 40, pivotX: 30, pivotY: 20 },
        body: { x: 40, y: 5, width: 60, height: 30, pivotX: 0, pivotY: 15 },
        tail: { x: 100, y: 0, width: 50, height: 40, pivotX: 10, pivotY: 20 }
      };
    }
    
    reset() {
      this.x = random(-width/2, width/2);
      this.y = random(-height/2, height/2);
      this.speed = random(0.5, 1.5);
      this.angle = random(TWO_PI);
      this.direction = random() > 0.5 ? 1 : -1;
      this.flipProgress = 0;
      this.isFlipping = false;
    }
    
    update() {
      // Movement
      this.x += cos(this.angle) * this.speed * this.direction;
      this.y += sin(this.angle) * this.speed;
      
      // Bounce off walls with flip animation
      if (abs(this.x) > width/2) {
        this.isFlipping = true;
        this.direction *= -1;
      }
      
      // Handle flip animation
      if (this.isFlipping) {
        this.flipProgress += 0.1;
        if (this.flipProgress >= 1) {
          this.flipProgress = 0;
          this.isFlipping = false;
        }
      }
      
      // Random direction changes
      if (random() < 0.01) {
        this.angle += random(-0.5, 0.5);
      }
    }
    
    display() {
      push();
      translate(this.x, this.y);
      
      // Apply flip animation if needed
      if (this.isFlipping) {
        const flipScale = abs(this.flipProgress - 0.5) * 2;
        scale(1 - flipScale * 0.8, 1);
      }
      
      rotate(this.angle);
      scale(this.direction, 1);
      
      // Draw each part with animation
      for (const partName in this.parts) {
        const part = this.parts[partName];
        
        push();
        translate(part.pivotX, part.pivotY);
        
        // Part-specific animations
        if (partName === 'tail') {
          const wag = sin(frameCount * this.animation.tailWagSpeed) * this.animation.tailWagAmount;
          rotate(radians(wag));
        } else if (partName === 'head') {
          const bob = sin(frameCount * this.animation.finFlapSpeed) * this.animation.finFlapAmount;
          rotate(radians(bob));
        }
        
        translate(-part.pivotX, -part.pivotY);
        image(this.img, 
             -part.x, -part.y, 
             this.img.width, this.img.height, 
             part.x, part.y, part.width, part.height);
        pop();
      }
      
      pop();
    }
  }