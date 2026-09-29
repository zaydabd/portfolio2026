// Start-up, in the order it runs; each step is a function further down.
// The photo is the page's background (css/base.css). This builds the 3D scene over it, where css/scene.css
// puts each model, and runs it. The models, the stage and the page each update themselves; main.js hands them
// what they need.
import * as THREE from "three";
import { CONFIG } from "./config.js";
import { state, desktopScreen } from "./state.js";
import { renderer, scene, camera, rig, canvas, fitCamera } from "./scene/stage.js";
import { FOCAL_LENGTH, picture } from "./scene/picture.js";
import { readLayout } from "./scene/layout.js";
import { grass, grassMaterial, placeGrass } from "./models/backdrop.js";
import { skyLight, moon } from "./models/moonlight.js";
import { buildPole } from "./models/pole.js";
import { buildCable, updateSpan } from "./models/cable.js";
import { buildBulbs, updateBulbs } from "./models/bulbs.js";
import {
  blades,
  setBladeLamps,
  placeBlades,
  checkSpeed,
  updateBladeMouse,
} from "./models/blades.js";
import { goToChapter, panToBulb, showSheet } from "./ui/sheet.js";
import { updateCaptions } from "./ui/captions.js";
import { mouse, followMouse } from "./ui/input.js";
import { advanceWind, updateWindUniforms } from "./utils/wind.js";
import { PICTURES } from "./utils/assets.js";

/* ---------- Start-up ---------- */
let layout = null, // where the models sit, from css/scene.css (in picture pixels)
  cable = null,
  pole = null,
  bulbs = [],
  grassImage = null; // grass.webp once loaded: the blades take their colours from it
scene.add(grass, skyLight, moon, moon.target, rig, blades);
fitView();
window.addEventListener("resize", fitView);
start();

/* ---------- Fit the scene to the photo's box (css/scene.css decides it; this only reads it) ---------- */
function fitView() {
  const width = canvas.clientWidth,
    height = canvas.clientHeight;
  if (!width || !height) return;
  const was = state.carousel;
  state.carousel = !desktopScreen.matches; // phones and tablets: the photo scrolls sideways

  const next = readLayout(width, height);
  if (!layout || JSON.stringify(next) !== JSON.stringify(layout)) {
    const horizonMoved = !layout || next.horizon !== layout.horizon;
    layout = next;
    picture.horizon = layout.horizon;
    placeGrass(layout);
    buildRig();
    if (grassImage && horizonMoved) placeBlades(grassImage);
  }
  fitCamera(width, height);
  // Back to the chapter being read: straight to it if the layout changed; if the photo only changed size, its bulb
  // back in the middle (so the new size isn't taken for a swipe)
  if (state.active < 0) return;
  if (was !== state.carousel) goToChapter(state.active, { instant: true });
  else if (state.carousel) panToBulb(state.active, { instant: true });
}

/* ---------- The rig: cable, bulbs and pole, where css/scene.css puts them ---------- */
function buildRig() {
  disposeAll(rig);
  rig.clear();
  cable = buildCable(layout);
  bulbs = buildBulbs(layout, cable, bulbs); // the old bulbs hand on their glow and swing
  pole = buildPole(layout, cable);
  rig.add(pole, cable.spans.left.mesh, cable.spans.right.mesh, ...bulbs.map((b) => b.root));
  rig.updateMatrixWorld(true);
  setBladeLamps(bulbs.map((b) => b.hit.getWorldPosition(new THREE.Vector3()))); // the blades are lit by the lamps
}

// Free what a rebuilt rig no longer uses (anything marked shared is kept for the next one)
function disposeAll(root) {
  root.traverse((o) => {
    if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
    const m = o.material;
    if (!m || m.userData.shared) return;
    for (const value of Object.values(m))
      if (value && value.isTexture && !value.userData.shared) value.dispose();
    m.dispose();
  });
}

/* ---------- Loading: the painted grass, then the blades, then the loop ---------- */
async function start() {
  const grassTex = await loadTexture(PICTURES.grass);
  grassTex.minFilter = THREE.LinearMipmapLinearFilter;
  grassTex.wrapS = grassTex.wrapT = THREE.ClampToEdgeWrapping;
  grassMaterial.uniforms.map.value = grassTex;
  grassImage = grassTex.image;
  placeBlades(grassImage);
  fitView(); // in case the page wasn't laid out yet when the scene was first fitted
  startAt = performance.now();
  renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => (canvas.style.opacity = 1)); // fades in (css/base.css)
}

function loadTexture(src) {
  return new Promise((resolve, reject) =>
    new THREE.TextureLoader().load(src, resolve, undefined, reject)
  );
}

/* ---------- Animation: the loop's own running values, then the loop, which hands them to each step as a tick ---------- */
let wind = 0, // the wind clock, in seconds
  last = performance.now(),
  startAt = 0;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  checkSpeed(now, dt);

  wind = advanceWind(wind, dt);
  const tick = { dt, now, since: (now - startAt) / 1000, wind };

  updateWindUniforms(tick);
  updateBladeMouse(blades, mouse); // before followMouse: the blades use last frame's mouse
  followMouse(mouse, tick);
  updateParallax(mouse);
  updateSpan(cable.spans.left, wind, CONFIG.sway.cable);
  updateSpan(cable.spans.right, wind, CONFIG.sway.cable);
  updateBulbs(bulbs, tick, { hovered: state.hovered, active: state.active });
  // The chapters show once all bulbs are on
  if (state.active < 0 && bulbs.every((b) => b.on > CONFIG.glow.onThreshold)) showSheet();

  renderer.render(scene, camera);
  updateCaptions(bulbs); // after the render, which brings the bulbs' positions up to date
}

// The lights drift a little with the mouse (the photo and its painted grass stay put)
function updateParallax(mouse) {
  const s = (CONFIG.parallax.objects * pole.userData.depth) / FOCAL_LENGTH;
  rig.position.set(-mouse.x * s, mouse.y * s, 0);
}
