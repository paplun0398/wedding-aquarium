export default class Bubble {
    constructor(img) {
      this.img = img;
      this.reset();
    }
    
    reset() {
      this.x = random(-width/2, width/2);
      this.y = random(height/2, height/2 + 100);
      this.size = random(5, 15);
      this.speed = random(1, 3);
      this.wobble = random(TWO_PI);
    }
    
    update() {
      this.y -= this.speed;
      this.wobble += 0.05;
      if (this.y < -height/2) this.reset();
    }
    
    display() {
      push();
      translate(this.x, this.y);
      rotate(sin(this.wobble) * 0.1);
      image(this.img, 0, 0, this.size, this.size);
      pop();
    }
  }