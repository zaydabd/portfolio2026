// What the page is showing, shared by the 3D scene and the page around it

export const state = {
  active: -1, // the open chapter: only the reading sheet's scroll sets it (js/ui/sheet.js); -1 until the sheet shows
  hovered: -1, // the bulb or caption under the mouse, or the caption with keyboard focus
  carousel: false, // phones and tablets: swipe along the lights, parts stacked in a card
};

// Each company's chapter has a bulb: one section per company in index.html's sheet
export const COMPANIES = document.querySelectorAll("#chapter-sheet section").length;

// The companies hang on bulbs 2–5, the middle of the cable: chapter i is bulb i + FIRST_BULB (from 0)
export const FIRST_BULB = 1;

// Desktop: 1024 px and up, wider than tall. Everything else (phones and tablets) shares the swipe layout (`carousel`).
// The same media query as the CSS's desktop rules (css/base.css, css/scene.css).
export const desktopScreen = window.matchMedia(
  "(min-width: 1024px) and (orientation: landscape)"
);
