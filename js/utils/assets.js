// Pictures and logos: files in assets/
import { CAREER } from '../config.js';

const file = path => new URL(`../../assets/${path}`, import.meta.url).href;

export const PICTURES = { plate: file('plate.webp'), grass: file('grass.webp') };

// Logos (white masks in assets/marks): every one CAREER names, plus OutSystems for the signs and tools
const names = new Set([...CAREER.flatMap(c => [...c.logos, c.sign.logo]).filter(Boolean), 'outsystems']);
export const MARKS = Object.fromEntries([...names].map(name => [name, file(`marks/${name}.png`)]));

// The logo images once loaded: their proportions size the logo rows, and the signs draw them
export const markImages = {};
export const loadMarks = () => Promise.all(Object.entries(MARKS).map(([name, src]) => new Promise((resolve, reject) => {
  const im = new Image();
  im.onload = () => { markImages[name] = im; resolve(im); };
  im.onerror = reject;
  im.src = src;
})));
