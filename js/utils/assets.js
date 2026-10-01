// Pictures: files in assets/, found from the page (index.html), not from this file: the build (package.json) moves
// the code into dist/
const file = (path) => new URL(`assets/${path}`, document.baseURI).href;

// The painted grass the 3D scene waves (the photo itself, plate.webp, is the page's CSS background)
export const PICTURES = {
  grass: file("grass.webp"),
};
