// Mouse, touch, keys and wheel
import * as THREE from 'three';
import { state, reduceMotion, COMPANIES } from '../state.js';
import { canvas, camera } from '../scene/stage.js';
import { hits } from '../models/bulbs.js';
import { careerEl, sceneEls, sceneAt, edge, select, goScene, turnChapter, partRest } from './sheet.js';

// Which company bulb or sign is under a point on screen (-1 for none)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function pick(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const found = raycaster.intersectObjects(hits.filter(h => h.parent && h.parent.visible !== false), false);
  return found.length ? found[0].object.userData.index : -1;
}

// The mouse, -1 to 1 across the window: the parallax follows it (js/main.js)
export const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  const i = pick(e.clientX, e.clientY);
  state.hovered = i;
  canvas.classList.toggle('hot', i >= 0);
});
window.addEventListener('mouseout', e => {
  if (e.relatedTarget) return;   // still inside the page
  state.hovered = -1;
  mouse.tx = mouse.ty = 0;
  canvas.classList.remove('hot');
});

// Click or tap a company bulb to read its chapter; on phones, swipe sideways to move along the lights
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', e => {
  if (!down) return;
  const dx = e.clientX - down.x, dy = e.clientY - down.y;
  down = null;
  if (state.carousel && Math.abs(dx) > 40 && Math.abs(dx) > 1.3 * Math.abs(dy)) {
    select(Math.max(0, Math.min(COMPANIES - 1, state.active + (dx < 0 ? 1 : -1))));
    return;
  }
  if (Math.hypot(dx, dy) < 12) { const i = pick(e.clientX, e.clientY); if (i >= 0) select(i); }
});
canvas.addEventListener('pointercancel', () => { down = null; });

// Keys: left and right move along the lights; up and down move through the parts (desktop)
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') select(Math.min(COMPANIES - 1, state.active + 1));
  if (e.key === 'ArrowLeft') select(Math.max(0, state.active - 1));
  if (state.carousel) return;
  const dir = e.key === 'ArrowDown' || e.key === 'PageDown' ? 1 : e.key === 'ArrowUp' || e.key === 'PageUp' ? -1 : 0;
  if (!dir) return;
  e.preventDefault();
  const rest = partRest(dir);   // a part taller than the sheet (short windows): read on through it first
  if (rest > 2) { careerEl.scrollBy({ top: dir * Math.min(rest, careerEl.clientHeight * 0.8), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); return; }
  const k = sceneAt + dir;
  if (k >= 0 && k < sceneEls.length) goScene(k, dir < 0 ? 'end' : 'start');
  else if (!e.repeat) turnChapter(dir);   // past the end (or the start): the next (or previous) chapter
});

// Wheel and trackpad. A gesture is a run of wheel events less than 200 ms apart.
// Desktop: the page steps through the chapter's parts itself, one part per notch (or per 700 ms of a long swipe),
// so a small scroll never snaps back. A part taller than the sheet (short windows) scrolls through first; the
// gesture that brings it in stops at its edge, and stepping on from it takes a fresh gesture. Turning to another
// chapter takes a fresh gesture that starts once the chapter is already at its last (or first) part, so a
// flick's momentum can't skip ahead.
// Phones: the card scrolls itself, and a fresh gesture past its end opens the next chapter.
export const gesture = { start: 0, last: 0, sum: 0, done: false, inner: false, stepped: false };
let wheelWait = 0;
window.addEventListener('wheel', e => {
  if (state.active < 0 || !e.deltaY) return;
  const now = performance.now(), dir = Math.sign(e.deltaY);
  if (now - gesture.last > 200 || Math.sign(gesture.sum) === -dir) Object.assign(gesture, { start: now, sum: 0, done: false, inner: false, stepped: false });
  gesture.last = now;
  gesture.sum += e.deltaY;
  if (state.carousel) {
    if (dir > 0 && !gesture.done && edge.bottom && edge.bottom < gesture.start && gesture.sum >= 60) gesture.done = turnChapter(1);
    return;
  }
  const rest = partRest(dir);   // a part taller than the sheet scrolls through first, up to its edge
  if (rest > 2) {
    if (e.cancelable) e.preventDefault();
    else if (careerEl.contains(e.target)) return;   // the browser is already scrolling the sheet
    if (gesture.stepped) return;
    gesture.inner = true;
    const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * careerEl.clientHeight : e.deltaY;
    careerEl.scrollBy({ top: dir * Math.min(rest, Math.abs(px)) });
    return;
  }
  if (e.cancelable) e.preventDefault();
  if (gesture.done || gesture.inner || Math.abs(gesture.sum) < 40) return;
  const k = sceneAt + dir;
  if (k >= 0 && k < sceneEls.length) {
    if (now < wheelWait) return;
    wheelWait = now + 700;
    gesture.sum = 0;
    gesture.stepped = true;
    goScene(k, dir < 0 ? 'end' : 'start');
    return;
  }
  const edgeAt = dir > 0 ? edge.bottom : edge.top;
  if (edgeAt && edgeAt < gesture.start && Math.abs(gesture.sum) >= 60 && turnChapter(dir)) gesture.done = true;
}, { passive: false });

// Touch: pull the chapter up past its end for the next one (on desktop, down past its start for the previous one)
let touch = null;
careerEl.addEventListener('touchstart', e => {
  touch = e.touches.length === 1 ? { y: e.touches[0].clientY, top: edge.top > 0, bottom: edge.bottom > 0 } : null;
}, { passive: true });
careerEl.addEventListener('touchmove', e => {
  if (!touch || e.touches.length !== 1) return;
  const dy = touch.y - e.touches[0].clientY;   // > 0: the finger moved up
  const lastPart = state.carousel || sceneAt === sceneEls.length - 1, firstPart = !state.carousel && sceneAt === 0;
  if ((touch.bottom && lastPart && dy > 70 && turnChapter(1)) || (touch.top && firstPart && dy < -70 && turnChapter(-1))) touch = null;
}, { passive: true });
careerEl.addEventListener('touchend', () => { touch = null; }, { passive: true });
careerEl.addEventListener('touchcancel', () => { touch = null; }, { passive: true });
