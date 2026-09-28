// The wind: one function sways the grass, the cable and the bulbs.
// x = position across the picture in pixels, t = wind clock in seconds.
// A light breeze everywhere, plus gusts that travel left to right at CONFIG.wind.gustSpeed.
// windAt() runs in JavaScript for the cable and bulbs; WIND_GLSL is the same maths for the grass shaders.
import { CONFIG } from "../config.js";
import { frac } from "./math.js";

export function windAt(x, t) {
  const W = CONFIG.wind;
  const breeze =
    0.55 * Math.sin(0.9 * t - 0.0042 * x) +
    0.3 * Math.sin(1.73 * t - 0.0091 * x + 1.3) +
    0.15 * Math.sin(2.9 * t - 0.017 * x + 0.4);
  const period = W.gustEvery * W.gustSpeed; // pixels between two gusts
  const u = t * W.gustSpeed - x; // how far the gusts have travelled past x
  const k = Math.floor(u / period); // which gust
  const s = (u - k * period) / W.gustSize; // 0 to 1 while that gust passes x
  const gust =
    s < 1 ? (0.55 + 0.45 * frac(k * 0.618034)) * Math.sin(Math.PI * s) ** 2 : 0;
  return W.strength * (W.breeze * breeze + gust);
}

// Shaders share these uniforms (the animation loop in js/main.js updates them) and paste in WIND_GLSL
export const windUniforms = {
  uWindTime: { value: 0 },
  uWindStrength: { value: 1 },
  uBreeze: { value: 0.35 },
  uGustSpeed: { value: 240 },
  uGustSize: { value: 380 },
  uGustEvery: { value: 8 },
};
export const WIND_GLSL = /* glsl */ `
  uniform float uWindTime, uWindStrength, uBreeze, uGustSpeed, uGustSize, uGustEvery;
  float windAt(float x, float t) {
    float breeze = 0.55 * sin(0.9 * t - 0.0042 * x) + 0.30 * sin(1.73 * t - 0.0091 * x + 1.3)
                 + 0.15 * sin(2.9 * t - 0.017 * x + 0.4);
    float period = uGustEvery * uGustSpeed;
    float u = t * uGustSpeed - x;
    float k = floor(u / period);
    float s = (u - k * period) / uGustSize;
    float p = sin(3.14159265 * s);
    float gust = s < 1.0 ? (0.55 + 0.45 * fract(k * 0.618034)) * p * p : 0.0;
    return uWindStrength * (uBreeze * breeze + gust);
  }`;
