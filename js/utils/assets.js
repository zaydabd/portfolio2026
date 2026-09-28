// Pictures and logos: files in assets/
import { CAREER } from "../config.js";

const file = (path) => new URL(`../../assets/${path}`, import.meta.url).href;

export const PICTURES = {
  plate: file("plate.webp"),
  grass: file("grass.webp"),
};

// Logos the wooden signs draw (white masks in assets/marks): each sign's, plus OutSystems.
// The chapters show theirs with plain CSS (css/marks.css), so they aren't loaded here.
const MARKS = Object.fromEntries(
  [...CAREER.map((c) => c.sign.logo).filter(Boolean), "outsystems"].map(
    (name) => [name, file(`marks/${name}.png`)]
  )
);

// The logo images once loaded, for the signs to draw
export const markImages = {};
export const loadMarks = () =>
  Promise.all(
    Object.entries(MARKS).map(
      ([name, src]) =>
        new Promise((resolve) => {
          const im = new Image();
          im.onload = () => {
            markImages[name] = im;
            resolve(im);
          };
          im.onerror = () => {
            console.error(`Couldn't load the logo ${src}`);
            resolve(null);
          };
          im.src = src;
        })
    )
  );
