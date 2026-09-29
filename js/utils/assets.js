// Pictures: files in assets/
const file = (path) => new URL(`../../assets/${path}`, import.meta.url).href;

// The painted grass the 3D scene waves (the photo itself, plate.webp, is the page's CSS background)
export const PICTURES = {
  grass: file("grass.webp"),
};
