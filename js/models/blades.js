// Grass blades built in code, across the front of the picture.
// One blade shape drawn thousands of times in a single call. Each copy has its own spot, size,
// lean and colour (taken from grass.png where it stands). The wind bends it on the GPU.
import * as THREE from "three";
import { CONFIG } from "../config.js";
import {
  IMG_W,
  IMG_H,
  FOCAL,
  CX,
  CY,
  EYE_HEIGHT,
  BLADE_NEAR,
} from "../scene/picture.js";
import { windUniforms, WIND_GLSL } from "../utils/wind.js";
import { mulberry32 } from "../utils/math.js";
import { rgba, vec3 } from "../utils/theme.js";
import { grassMaterial } from "./backdrop.js";

export const bladeGeometry = new THREE.InstancedBufferGeometry();
{
  const SEG = 4,
    pos = [],
    index = [];
  for (let s = 0; s < SEG; s++) pos.push(-1, s / SEG, 0, 1, s / SEG, 0); // two edges per row
  pos.push(0, 1, 0); // the tip
  for (let s = 0; s < SEG - 1; s++) {
    const a = s * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  index.push((SEG - 1) * 2, (SEG - 1) * 2 + 1, SEG * 2);
  bladeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(pos, 3)
  );
  bladeGeometry.setIndex(index);
}
const MAX_BLADES = Math.max(CONFIG.grass.count, CONFIG.grass.phoneCount);
const bladeAttr = {
  aBase: new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_BLADES * 3),
    3
  ), // foot of the blade
  aShape: new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_BLADES * 4),
    4
  ), // height, width, turn, seed stalk?
  aLean: new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_BLADES * 4),
    4
  ), // lean x, lean z, flutter, picture x
  aColA: new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_BLADES * 3),
    3
  ), // colour at the foot
  aColB: new THREE.InstancedBufferAttribute(
    new Float32Array(MAX_BLADES * 3),
    3
  ), // colour at the tip
};
for (const [name, attr] of Object.entries(bladeAttr))
  bladeGeometry.setAttribute(name, attr);
bladeGeometry.instanceCount = 0;

// The blades, lit warm near the lamps (their positions in 3D)
let bladeMaterial = null;
export function createBlades(lamps) {
  bladeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      ...windUniforms,
      uSway: { value: 1 },
      uMouse: { value: new THREE.Vector2() },
      uParallax: { value: new THREE.Vector2() }, // picture pixels: near blades, far blades
      uNear: { value: BLADE_NEAR },
      uFar: { value: CONFIG.grass.depth },
      uLamps: { value: lamps },
      uWarmth: { value: CONFIG.grass.lampWarmth },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aBase; attribute vec4 aShape; attribute vec4 aLean; attribute vec3 aColA; attribute vec3 aColB;
      uniform float uSway, uNear, uFar, uWarmth;
      uniform vec2 uMouse, uParallax;
      uniform vec3 uLamps[${lamps.length}];
      varying vec3 vColor; varying vec2 vBlade; varying float vKind;
      ${WIND_GLSL}
      void main() {
        float v = position.y, h = aShape.x, kind = aShape.w;
        // a leaf tapers to a point; a seed stalk is a thin stem with a wider head for the grains
        float leaf = 1.0 - pow(v, 3.0);
        float stalk = mix(0.3, 1.0, smoothstep(0.74, 0.8, v)) * (1.0 - 0.7 * smoothstep(0.9, 1.0, v));
        float width = aShape.y * mix(leaf, stalk, kind);
        vec3 across = vec3(cos(aShape.z), 0.0, -sin(aShape.z));
        // wind: lean downwind, plus a quick flutter that grows in a gust
        float w = windAt(aLean.w, uWindTime) * uSway;
        float flutter = sin(uWindTime * (2.2 + 1.6 * aLean.z) + 6.2832 * aLean.z)
                      * (0.08 + 0.5 * clamp(w, 0.0, 1.0)) * uSway * uWindStrength;
        vec2 lean = aLean.xy + vec2(0.55 * w + 0.07 * flutter, 0.03 * flutter);
        vec2 bend = lean * h * v * v;                              // the foot stays put, the tip moves most
        vec3 p = aBase + across * position.x * width * 0.5
               + vec3(bend.x, v * h - 0.5 * dot(bend, bend) / max(h, 0.01), bend.y);
        // parallax: near blades drift like the pole and bulbs, far ones like grass.png
        float depth = -aBase.z;
        float px = mix(uParallax.x, uParallax.y, smoothstep(uNear, uFar, depth));
        p.xy += vec2(-uMouse.x, uMouse.y) * px * depth / ${FOCAL}.0;
        // colour from grass.png, warmer near the lamps, a touch of cool moonlight higher up
        vec3 col = mix(aColA, aColB, smoothstep(0.0, 0.85, v));
        float warm = 0.0;
        for (int i = 0; i < ${
          lamps.length
        }; i++) { vec3 d = p - uLamps[i]; warm += exp(-dot(d, d) / 3.0); }
        col += ${vec3("--grass-lamp-tint")} * uWarmth * min(warm, 1.5) * v;
        col += ${vec3("--grass-moon-tint")} * v;
        vColor = col; vBlade = vec2(position.x, v); vKind = kind;
        gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor; varying vec2 vBlade; varying float vKind;
      void main() {
        vec3 col = vColor * (0.88 + 0.24 * (1.0 - abs(vBlade.x)));
        if (vKind > 0.5 && vBlade.y > 0.76) {
          // seed head: rows of grains, alternating either side of the stem
          float grain = 0.5 + 0.5 * sin(vBlade.y * 377.0 + step(0.0, vBlade.x) * 3.14159);
          col *= 0.8 + 0.4 * grain;
        }
        gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
      }`,
    side: THREE.DoubleSide,
  });
  const blades = new THREE.Mesh(bladeGeometry, bladeMaterial);
  blades.frustumCulled = false; // blades move in the shader
  return blades;
}

// Colours are read from grass.png once it has loaded: a small patch's average, and its brightest pixel (a lit leaf)
function makeSampler(image) {
  const c = document.createElement("canvas");
  c.width = image.width;
  c.height = image.height;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(image, 0, 0);
  const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
  return (x, y, r = 3) => {
    let R = 0,
      G = 0,
      B = 0,
      n = 0,
      best = -1,
      bR = 0,
      bG = 0,
      bB = 0;
    const xi = Math.round(x),
      yi = Math.round(y);
    for (let yy = yi - r; yy <= yi + r; yy++) {
      for (let xx = xi - r; xx <= xi + r; xx++) {
        const k =
          (Math.min(height - 1, Math.max(0, yy)) * width +
            Math.min(width - 1, Math.max(0, xx))) *
          4;
        R += data[k];
        G += data[k + 1];
        B += data[k + 2];
        n++;
        const lum = data[k] * 0.3 + data[k + 1] * 0.6 + data[k + 2] * 0.1;
        if (lum > best) {
          best = lum;
          bR = data[k];
          bG = data[k + 1];
          bB = data[k + 2];
        }
      }
    }
    return {
      mean: [R / n / 255, G / n / 255, B / n / 255],
      bright: [bR / 255, bG / 255, bB / 255],
    };
  };
}

let bladeShare = 1; // drops if the device is slow
const isPhone = () =>
  window.matchMedia("(pointer: coarse)").matches ||
  Math.min(window.innerWidth, window.innerHeight) < 600;
const seedHead = rgba("--seed-head");

// Scatter the blades over the field, coloured from the painted grass (grass.png, once loaded)
export function placeBlades(grassImage) {
  const sample = makeSampler(grassImage);
  const G = CONFIG.grass,
    A = bladeAttr;
  const count = Math.floor(
    Math.min(MAX_BLADES, isPhone() ? G.phoneCount : G.count) * bladeShare
  );
  const rand = mulberry32(20260927);
  const far = Math.max(BLADE_NEAR + 1, G.depth);
  const rowNear = CY + (EYE_HEIGHT * FOCAL) / BLADE_NEAR; // below the frame: only the tips show
  const rowFar = CY + (EYE_HEIGHT * FOCAL) / far;
  const x0 = -60,
    x1 = IMG_W + 60; // the whole picture, so the carousel can pan
  for (let i = 0; i < count; i++) {
    const row = rowFar + (rowNear - rowFar) * Math.pow(rand(), 1.35); // more rows at the back, where blades are small
    const d = (EYE_HEIGHT * FOCAL) / (row - CY);
    const px = x0 + (x1 - x0) * rand();
    const seed = d < 6 && rand() < G.seedHeads;
    const shrink = 1 - 0.6 * THREE.MathUtils.smoothstep(d, far * 0.65, far); // fade out towards the back
    const h =
      (seed ? 0.8 + 0.35 * rand() : 0.5 + 0.45 * rand()) * G.height * shrink;
    const w = Math.max(
      seed ? 0.014 : 0.013 + 0.012 * rand(),
      (1.4 * d) / FOCAL
    );
    const leanDir = rand() * Math.PI * 2,
      leanBy = (seed ? 0.25 : 0.2) + (seed ? 0.35 : 0.55) * rand(); // blades arch
    A.aBase.setXYZ(i, ((px - CX) * d) / FOCAL, -EYE_HEIGHT, -d);
    A.aShape.setXYZW(i, h, w, (rand() - 0.5) * 2.2, seed ? 1 : 0);
    A.aLean.setXYZW(
      i,
      Math.cos(leanDir) * leanBy,
      Math.sin(leanDir) * leanBy,
      rand(),
      px
    );
    // tip colour from where the tip lands in grass.png, foot colour from where it stands (darker)
    // most blades take the patch's average colour; about a third catch the light like the lit leaves
    const at = sample(px, Math.max(708, CY + ((EYE_HEIGHT - h) * FOCAL) / d));
    const lit = seed || rand() < 0.3;
    let tip = lit
      ? at.mean.map((c, k) => c * 0.4 + at.bright[k] * 0.6)
      : at.mean;
    if (seed) tip = tip.map((c, k) => c * 0.8 + seedHead[k] * 0.2); // a little more yellow
    const foot = sample(px, Math.min(IMG_H - 1, row)).mean;
    A.aColB.setXYZ(i, tip[0], tip[1], tip[2]);
    A.aColA.setXYZ(i, foot[0] * 0.45, foot[1] * 0.45, foot[2] * 0.45);
  }
  for (const attr of Object.values(A)) attr.needsUpdate = true;
  bladeGeometry.instanceCount = count;
  bladeMaterial.uniforms.uFar.value = far;
  // darken the painted grass from the row where the blade tips begin
  const shadeFrom =
    (CY + ((EYE_HEIGHT - 0.9 * G.height) * FOCAL) / far) / IMG_H;
  grassMaterial.uniforms.uShadeFrom.value = shadeFrom;
  grassMaterial.uniforms.uShadeTo.value = Math.min(1, shadeFrom + 0.12);
  grassMaterial.uniforms.uFloorShade.value = G.floorShade;
}

// Speed safety: if the first seconds run under 45 frames a second, draw half the blades (at most twice)
const safety = { from: 0, frames: 0, checks: 0 };
export function checkSpeed(now, gap) {
  if (
    window.__paddyNoSafety ||
    safety.checks >= 2 ||
    bladeGeometry.instanceCount === 0
  )
    return;
  if (gap > 0.25 || !safety.from) {
    safety.from = now;
    safety.frames = 0;
    return;
  } // hidden tab or first frame
  safety.frames++;
  if (now - safety.from < 3000) return;
  const fps = (safety.frames * 1000) / (now - safety.from);
  if (fps < 45) {
    bladeShare /= 2;
    bladeGeometry.instanceCount = Math.floor(bladeGeometry.instanceCount / 2);
    safety.checks++;
  } else {
    safety.checks = 2; // fast enough: stop watching
  }
  safety.from = 0;
}
