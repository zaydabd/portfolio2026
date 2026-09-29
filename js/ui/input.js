// Mouse, touch, keys and wheel. None of them sets the chapter or reaches into the 3D scene: they move the reading
// sheet's scroll (js/ui/sheet.js), and the chapter, its bulb and the photo follow the scroll. Only the hover glow
// and the parallax follow the pointer itself.
import { CONFIG } from "../config.js";
import { state, COMPANIES } from "../state.js";
import { canvas } from "../scene/stage.js";
import { bulbAt } from "../models/bulbs.js";
import { sheetEl, goToChapter, pageSheet, scrollSheet } from "./sheet.js";
import { smooth } from "../utils/math.js";

// The caption (a button in the nav, index.html) an event happened on, if any
const captionOf = (e) => e.target instanceof Element && e.target.closest("nav button");

// The mouse, -1 to 1 across the window: tx, ty where it is, x, y where the parallax has eased to (js/main.js)
export const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
// Each frame: ease x, y towards the mouse
export function followMouse(mouse, tick) {
  const follow = smooth(tick.dt, CONFIG.parallax.tau);
  mouse.x += (mouse.tx - mouse.x) * follow;
  mouse.y += (mouse.ty - mouse.y) * follow;
}
// Pointing at a bulb or its caption lights the bulb up a little
window.addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  const caption = captionOf(e);
  const i = caption ? +caption.dataset.chapter : bulbAt(e.clientX, e.clientY);
  state.hovered = i;
  canvas.style.cursor = !caption && i >= 0 ? "pointer" : "";
});
window.addEventListener("mouseout", (e) => {
  if (e.relatedTarget) return; // still inside the page
  state.hovered = -1;
  mouse.tx = mouse.ty = 0;
  canvas.style.cursor = "";
});

// Click or tap a company bulb to read its chapter (on phones a swipe scrolls the photo sideways instead)
let down = null;
canvas.addEventListener("pointerdown", (e) => {
  down = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointerup", (e) => {
  if (!down) return;
  const dx = e.clientX - down.x,
    dy = e.clientY - down.y;
  down = null;
  if (Math.hypot(dx, dy) < 12) {
    const i = bulbAt(e.clientX, e.clientY);
    if (i >= 0) goToChapter(i);
  }
});
canvas.addEventListener("pointercancel", () => {
  down = null;
});

// The captions are the chapter list too: focusing one lights its bulb, pressing it opens its chapter
const captionsEl = document.querySelector("nav");
captionsEl.addEventListener("focusin", (e) => {
  const caption = captionOf(e);
  if (caption) state.hovered = +caption.dataset.chapter;
});
captionsEl.addEventListener("focusout", () => {
  state.hovered = -1;
});
captionsEl.addEventListener("click", (e) => {
  const caption = captionOf(e);
  if (caption) goToChapter(+caption.dataset.chapter);
});

// Keys: left and right move along the lights; up and down scroll the chapters when the sheet isn't focused
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goToChapter(Math.min(COMPANIES - 1, state.active + 1));
  if (e.key === "ArrowLeft") goToChapter(Math.max(0, state.active - 1));
  const dir =
    e.key === "ArrowDown" || e.key === "PageDown"
      ? 1
      : e.key === "ArrowUp" || e.key === "PageUp"
      ? -1
      : 0;
  if (!dir || sheetEl.contains(document.activeElement)) return; // a focused sheet scrolls itself
  e.preventDefault();
  pageSheet(dir);
});

// Wheel over the picture scrolls the chapters too (over the sheet, the browser already does)
window.addEventListener(
  "wheel",
  (e) => {
    if (sheetEl.contains(e.target)) return;
    scrollSheet(
      e.deltaMode === 1
        ? e.deltaY * 16
        : e.deltaMode === 2
        ? e.deltaY * sheetEl.clientHeight
        : e.deltaY
    );
  },
  { passive: true }
);
