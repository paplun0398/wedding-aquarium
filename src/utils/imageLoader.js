export function loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error(`Failed to load image at ${path}: ${e.message}`));
      
      // Handle Vite's asset handling if needed
      if (import.meta.env) {
        img.src = new URL(path, import.meta.url).href;
      } else {
        img.src = path;
      }
    });
  }