export default class Coral {
    constructor(img) {
      this.img = img;
      this.x = random(-width/2, width/2);
      this.y = height/2 - random(50, 200);
      this.size = random(0.7, 1.3);
      this.wavePhase = random(TWO_PI);
    }
    
    display() {
      const waveOffset = sin(this.wavePhase + frameCount * 0.03) * 5;
      imageMode(CENTER);
      image(this.img, this.x, this.y + waveOffset, 
            this.img.width * this.size, this.img.height * this.size);
      this.wavePhase += 0.005;
    }
  }