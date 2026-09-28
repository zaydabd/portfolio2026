// Start-up: put the models on the stage, fit the page to the screen, and run the animation loop
import * as THREE from "three";
import { CONFIG, PERSON } from "./config.js";
import { state, TIER, reduceMotion, COMPANIES } from "./state.js";
import {
  renderer,
  scene,
  camera,
  rig,
  canvas,
  view,
  pan,
  clampPan,
  applyView,
  fitPicture,
} from "./scene/stage.js";
import { FOCAL, GLASS_R } from "./scene/picture.js";
import {
  plate,
  grass,
  plateMaterial,
  grassMaterial,
} from "./models/backdrop.js";
import { skyLight, moon } from "./models/moonlight.js";
import { pole } from "./models/pole.js";
import { spans, updateSpan, cableSway } from "./models/cable.js";
import { bulbs } from "./models/bulbs.js";
import { createBlades, placeBlades, checkSpeed } from "./models/blades.js";
import { buildSigns } from "./models/signs.js";
import {
  renderChapter,
  select,
  layoutCareer,
  loadChapters,
} from "./ui/sheet.js";
import { mouse } from "./ui/input.js";
import { windAt, windUniforms } from "./utils/wind.js";
import { smooth } from "./utils/math.js";
import { token } from "./utils/theme.js";
import { PICTURES, loadMarks } from "./utils/assets.js";

document.getElementById("who-name").textContent = PERSON.name;
document.getElementById("who-title").textContent = PERSON.title;
document.getElementById("who-link").href = PERSON.linkedin;

/* ---------- The scene: picture layers, moonlight, then the rig (pole, cable, bulbs) and the grass blades ---------- */
scene.add(plate, grass, skyLight, moon, moon.target, rig);
rig.add(pole, spans.left.mesh, spans.right.mesh, ...bulbs.map((b) => b.root));
rig.updateMatrixWorld(true);
const blades = createBlades(
  bulbs.map((b) => b.hit.getWorldPosition(new THREE.Vector3()))
); // lit by the lamps
scene.add(blades);

/* ---------- Fit everything to the window ---------- */
function fitView() {
  fitPicture(window.innerWidth, window.innerHeight);
  const was = state.carousel;
  state.tier = TIER.desktop.matches
    ? "desktop"
    : TIER.tablet.matches
    ? "tablet"
    : "phone";
  state.carousel = state.tier !== "desktop";
  document.body.classList.toggle("carousel", state.carousel);
  document.body.classList.toggle("tablet", state.tier === "tablet");
  if (state.carousel) {
    pan.target = clampPan(
      CONFIG.bulbs[Math.max(0, state.active)].x - view.w / 2
    );
    if (!was || pan.at === null) pan.at = pan.target;
  } else pan.at = pan.target = null;
  if (was !== state.carousel && state.active >= 0) renderChapter(state.active); // parts stack on phones and tablets
  applyView();
  for (const b of bulbs)
    if (b.sign) {
      b.sign.visible = !state.carousel;
      b.signSmall.visible = state.carousel;
    }
  layoutCareer();
}
window.addEventListener("resize", fitView);

/* ---------- Animation ---------- */
let wind = 0,
  motion = reduceMotion.matches ? 0 : 1,
  last = performance.now(),
  startAt = 0;
const baseGlow = 2 * GLASS_R * CONFIG.glow.size;

function frame(now) {
  const gap = (now - last) / 1000;
  const dt = Math.min(0.05, Math.max(0, gap));
  last = now;
  checkSpeed(now, gap);
  motion += ((reduceMotion.matches ? 0 : 1) - motion) * smooth(dt, 0.25);
  wind += dt * CONFIG.sway.speed;
  if (wind > 3600) wind -= 3600; // keep the wind clock small for the GPU

  // Parallax: the picture barely moves, the 3D objects a little more
  const follow = smooth(dt, 0.35);
  mouse.x += (mouse.tx * motion - mouse.x) * follow;
  mouse.y += (mouse.ty * motion - mouse.y) * follow;
  for (const [layer, px] of [
    [plate, CONFIG.parallax.plate],
    [grass, CONFIG.parallax.grass],
  ]) {
    const s = px * layer.userData.pxToWorld;
    layer.position.set(
      layer.userData.home.x - mouse.x * s,
      layer.userData.home.y + mouse.y * s,
      layer.userData.home.z
    );
  }
  const rs = (CONFIG.parallax.objects * pole.userData.depth) / FOCAL;
  rig.position.set(-mouse.x * rs, mouse.y * rs, 0);

  // Wind: the same values drive the painted grass, the blades, the cable and the bulbs
  const W = CONFIG.wind;
  windUniforms.uWindTime.value = wind;
  windUniforms.uWindStrength.value = W.strength * motion;
  windUniforms.uBreeze.value = W.breeze;
  windUniforms.uGustSpeed.value = W.gustSpeed;
  windUniforms.uGustSize.value = W.gustSize;
  windUniforms.uGustEvery.value = W.gustEvery;
  grassMaterial.uniforms.uSway.value = CONFIG.sway.grass * 6;
  blades.material.uniforms.uSway.value = CONFIG.sway.grass;
  blades.material.uniforms.uMouse.value.set(mouse.x, mouse.y);
  blades.material.uniforms.uParallax.value.set(
    CONFIG.parallax.objects,
    CONFIG.parallax.grass
  );
  updateSpan(spans.left, wind, CONFIG.sway.cable * motion);
  updateSpan(spans.right, wind, CONFIG.sway.cable * motion);

  // Opening: bulbs switch on one by one, then the first chapter lights up
  const since = (now - startAt) / 1000;
  const onRate = smooth(dt, 0.07);
  bulbs.forEach((b, i) => {
    const target =
      reduceMotion.matches || since > 0.35 + i * CONFIG.switchOn ? 1 : 0;
    b.on = reduceMotion.matches ? target : b.on + (target - b.on) * onRate;
  });
  if (state.active < 0 && bulbs.every((b) => b.on > 0.95)) select(0);

  // Phones and tablets: glide along the string of lights
  if (
    state.carousel &&
    pan.at !== null &&
    pan.target !== null &&
    Math.abs(pan.at - pan.target) > 0.05
  ) {
    pan.at = reduceMotion.matches
      ? pan.target
      : pan.at + (pan.target - pan.at) * smooth(dt, 0.16);
    applyView();
  }

  // Bulbs: pendulums pushed by the wind where they hang, so a gust swings them one after another
  const push = CONFIG.sway.bulbs * motion;
  const steps = Math.max(1, Math.ceil(dt * 120)),
    step = dt / steps;
  const litRate = reduceMotion.matches ? 1 : smooth(dt, CONFIG.glow.time / 3); // reduced motion: instant
  const hoverRate = reduceMotion.matches ? 1 : smooth(dt, 0.08);
  bulbs.forEach((b, i) => {
    b.root.position
      .copy(b.root.userData.home)
      .add(cableSway(b.x, b.weight, wind, CONFIG.sway.cable * motion));
    const force =
      push *
      (windAt(b.x, wind) + 0.12 * Math.sin(wind * (0.9 + 0.13 * i) + 2.1 * i));
    const k = b.rate * b.rate,
      damp = 0.16 * b.rate;
    for (let s = 0; s < steps; s++) {
      b.sideV += (-k * b.side - damp * b.sideV + 0.12 * k * force) * step;
      b.side += b.sideV * step;
      b.foreV +=
        (-k * b.fore -
          damp * b.foreV +
          0.05 * k * force * Math.sin(wind * 0.7 + i)) *
        step;
      b.fore += b.foreV * step;
    }
    if (motion < 0.01) b.side = b.sideV = b.fore = b.foreV = 0;
    b.swing.rotation.z = b.side;
    b.swing.rotation.x = b.fore;
    b.hover +=
      ((i === state.hovered && i < COMPANIES ? 1 : 0) - b.hover) * hoverRate;
    b.lit += ((i === state.active ? 1 : 0) - b.lit) * litRate;
    const size =
      baseGlow *
      (1 + (CONFIG.glow.hover - 1) * b.hover) *
      (1 + (CONFIG.glow.lit - 1) * b.lit) *
      (0.6 + 0.4 * b.on);
    b.glow.scale.set(size, size, 1);
    b.glowMaterial.opacity =
      Math.min(1, CONFIG.glow.opacity * (1 + 0.35 * b.lit)) * b.on;
    b.material.uniforms.uBoost.value = b.lit;
    b.material.uniforms.uOn.value = b.on;
    if (b.signMats)
      for (const m of b.signMats)
        m.color.setScalar(
          Math.min(1, 0.72 + 0.14 * b.hover + 0.2 * b.lit) *
            (0.35 + 0.65 * b.on)
        );
  });

  renderer.render(scene, camera);
}

/* ---------- Start: load the pictures, logos and font, then build the blades and signs ---------- */
const loader = new THREE.TextureLoader();
const load = (src) =>
  new Promise((resolve, reject) =>
    loader.load(src, resolve, undefined, reject)
  );

fitView();
const fontReady = Promise.race([
  document.fonts.load(`600 36px ${token("--serif")}`).catch(() => null),
  new Promise((r) => setTimeout(r, 2500)), // offline: draw the signs with the fallback font
]);
Promise.all([
  load(PICTURES.plate),
  load(PICTURES.grass),
  fontReady,
  loadMarks(),
  loadChapters(),
]).then(([plateTex, grassTex]) => {
  for (const t of [plateTex, grassTex]) {
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  }
  plateMaterial.uniforms.map.value = plateTex;
  grassMaterial.uniforms.map.value = grassTex;
  placeBlades(grassTex.image);
  buildSigns();
  fitView();
  startAt = performance.now();
  renderer.setAnimationLoop(frame);
  requestAnimationFrame(() => canvas.classList.add("ready"));
});
