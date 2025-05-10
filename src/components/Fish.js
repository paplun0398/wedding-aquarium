export default class Fish {
  constructor(img, config = {}) {
    this.img = img;
    this.config = config;
    this.size = 150;
    
    // Set directional multipliers
    this.headDirMult = (config.headDirection || "right") === "left" ? -1 : 1;
    this.uprightMult = (config.uprightOrientation || "top") === "bottom" ? -1 : 1;
    
    this.reset();
  }

  reset() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.speed = random(0.5, 2);
    this.angle = random(TWO_PI);
  }

  update() {
    // Movement in head direction
    this.x += cos(this.angle) * this.speed * this.headDirMult;
    this.y += sin(this.angle) * this.speed * this.uprightMult;
    
    // Edge bounce with direction preservation
    if (this.x > width/2 || this.x < -width/2) {
      this.angle = PI - this.angle;
    }
    if (this.y > height/2 || this.y < -height/2) {
      this.angle = -this.angle;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // Auto-orientation
    rotate(this.angle);
    scale(this.headDirMult, this.uprightMult);
    
    // Draw base image
    image(this.img, 0, 0, this.size, this.size * 0.4);
    
    // Animate tail
    this.animatePart('tail', 0.2, 0.5);
    
    // Animate fin if configured
    if (this.config.fin) {
      this.animatePart('fin', 0.15, 0.3, 1.0);
    }
    
    pop();
  }

  animatePart(partName, speed, amount, phaseOffset = 0) {
    const part = this.config[partName];
    push();
    translate(part.pivotX, part.pivotY);
    rotate(sin(frameCount * speed + phaseOffset) * amount);
    translate(-part.pivotX, -part.pivotY);
    image(
      this.img,
      0, 0,
      part.width, part.height,
      part.x, part.y,
      part.width, part.height
    );
    pop();
  }
}