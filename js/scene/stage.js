// The stage: renderer, scene and camera. The canvas is the photo's box (css/base.css, css/scene.css), and the
// camera always shows the whole picture, so every model lands on the photo where css/scene.css puts it.
import * as THREE from "three";
import {
  PICTURE_WIDTH,
  PICTURE_HEIGHT,
  FOCAL_LENGTH,
  CENTRE_X,
  picture,
} from "./picture.js";

export const canvas = document.getElementById("stage-canvas");

// Transparent, so the photo behind the canvas shows through. Without WebGL this throws, and the page keeps
// the photo and the header.
export const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setClearColor(0x000000, 0);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(
  50,
  PICTURE_WIDTH / PICTURE_HEIGHT,
  0.05,
  200
);

// Pole, cable and bulbs: they drift together with the mouse (the captions follow the bulbs, js/ui/captions.js)
export const rig = new THREE.Group();

// Size the renderer to the canvas, and aim the camera so the whole picture fills it, looking level at the horizon
export function fitCamera(width, height) {
  const most = Math.sqrt(4e6 / (width * height)); // about 4 million pixels at most (phones draw the photo's full width)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2, most));
  renderer.setSize(width, height, false);
  const halfWidth = Math.max(CENTRE_X, PICTURE_WIDTH - CENTRE_X),
    halfHeight = Math.max(picture.horizon, PICTURE_HEIGHT - picture.horizon);
  camera.fov = 2 * THREE.MathUtils.radToDeg(Math.atan(halfHeight / FOCAL_LENGTH));
  camera.aspect = halfWidth / halfHeight;
  camera.setViewOffset(
    2 * halfWidth,
    2 * halfHeight,
    halfWidth - CENTRE_X,
    halfHeight - picture.horizon,
    PICTURE_WIDTH,
    PICTURE_HEIGHT
  );
}
