// Textures painted in code
import * as THREE from 'three';

const toSRGB = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);

// Greyscale texture from light(u, v) -> light amount (linear, 0 to 1). v = 0 is the bottom.
export function gradientTexture(width, height, light) {
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const g = c.getContext('2d');
  const img = g.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const v = toSRGB(Math.max(0, Math.min(1, light(x / Math.max(1, width - 1), y / Math.max(1, height - 1))))) * 255;
      const k = (y * width + x) * 4;
      img.data[k] = img.data[k + 1] = img.data[k + 2] = v;
      img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  return t;
}
