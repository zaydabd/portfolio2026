// The stage: renderer, scene and camera, and how the picture fits the window
import * as THREE from "three";
import { CONFIG } from "../config.js";
import { state, reduceMotion } from "../state.js";
import { color } from "../utils/theme.js";
import { PICTURES } from "../utils/assets.js";
import { IMG_W, IMG_H, FOCAL, CX, CY, HALF_W, HALF_H } from "./picture.js";

export const canvas = document.getElementById("scene");

export let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
} catch (err) {
  // No WebGL: show the still picture instead.
  document.body.classList.add("fallback");
  document.body.style.backgroundImage = `url(${PICTURES.plate})`;
  throw err;
}
renderer.setClearColor(color("--night"), 1);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
  2 * THREE.MathUtils.radToDeg(Math.atan(HALF_H / FOCAL)),
  HALF_W / HALF_H,
  0.05,
  200
);

// Pole, cable, bulbs and signs: they drift together with the mouse
export const rig = new THREE.Group();

// The part of the picture on screen, in picture pixels
export const view = { x: 0, y: 0, w: IMG_W, h: IMG_H, m: 0, aw: IMG_W };

// Phones and tablets: the view's left edge as it glides along the lights (null on desktop)
export const pan = { at: null, target: null };
export const clampPan = (x) =>
  Math.min(Math.max(x, view.m), view.m + view.aw - view.w);
export function panTo(i) {
  pan.target = clampPan(CONFIG.bulbs[i].x - view.w / 2);
  if (pan.at === null || reduceMotion.matches) {
    pan.at = pan.target;
    applyView();
  }
}
export function applyView() {
  const vx = state.carousel && pan.at !== null ? pan.at : view.x;
  camera.setViewOffset(
    2 * HALF_W,
    2 * HALF_H,
    vx - (CX - HALF_W),
    view.y - (CY - HALF_H),
    view.w,
    view.h
  );
}

// Fit the picture to the window like CSS "cover", keeping a spare edge for the parallax
export function fitPicture(W, H) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);
  const m = Math.max(CONFIG.parallax.plate, CONFIG.parallax.grass) + 1;
  const aw = IMG_W - 2 * m,
    ah = IMG_H - 2 * m,
    a = W / H;
  let vw, vh;
  if (a > aw / ah) {
    vw = aw;
    vh = aw / a;
  } else {
    vh = ah;
    vw = ah * a;
  }
  const vx = m + (aw - vw) * CONFIG.crop.x;
  const vy = m + (ah - vh) * CONFIG.crop.y;
  Object.assign(view, { x: vx, y: vy, w: vw, h: vh, m, aw });
}
