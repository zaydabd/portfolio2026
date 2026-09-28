// The cable: two spans, each a tube that sways between its anchors, with the bulbs' light on it
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { FOCAL, CX, NIGHT_DY, GLASS_R, CABLE_R, toWorld } from '../scene/picture.js';
import { windAt } from '../utils/wind.js';
import { gradientTexture } from '../utils/textures.js';
import { color } from '../utils/theme.js';

// Where the left span ends and the right span starts (the pole)
export const POLE_X = (CONFIG.cable.left[CONFIG.cable.left.length - 1][0] + CONFIG.cable.right[0][0]) / 2;

// Depth of the cable, fitted to the bulb sizes: bigger bulbs are closer.
export const cableDepth = (() => {
  const pts = CONFIG.bulbs.filter(b => b.x < POLE_X).map(b => [b.x, FOCAL * 2 * GLASS_R / b.w]);
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0;
  for (const [x, y] of pts) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; }
  const slope = sxx > 0 ? sxy / sxx : 0;
  return x => my + slope * (Math.min(x, POLE_X) - mx);
})();

// How much a point between two anchors sways: nothing at the anchors, most halfway
export function swayWeight(x, [a, b]) {
  const s = (x - a) / (b - a);
  return s <= 0 || s >= 1 ? 0 : Math.sin(Math.PI * s);
}

const bulbXs = CONFIG.bulbs.map(b => b.x);

function buildSpan(points, anchors) {
  const flat = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y + NIGHT_DY)))
    .getSpacedPoints(220);
  const path = new THREE.CatmullRomCurve3(flat.map(p => toWorld(p.x, p.y, cableDepth(p.x))), false, 'centripetal');
  const SEG = 360, RAD = 6;
  const geometry = new THREE.TubeGeometry(path, SEG, CABLE_R, RAD, false);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  const ringX = new Float32Array(SEG + 1), ringW = new Float32Array(SEG + 1);
  for (let i = 0; i <= SEG; i++) {
    const p = path.getPointAt(i / SEG);
    ringX[i] = p.x * FOCAL / -p.z + CX;
    ringW[i] = swayWeight(ringX[i], anchors);
  }
  const glowMap = gradientTexture(SEG + 1, 1, u => {   // warm where the bulbs hang
    const x = ringX[Math.round(u * SEG)];
    let v = 0;
    for (const bx of bulbXs) v += Math.exp(-(((x - bx) / 22) ** 2));
    return 0.004 + 0.12 * v;
  });
  const material = new THREE.MeshStandardMaterial({
    color: color('--cable'), roughness: 0.55, metalness: 0.1,
    emissive: color('--lamp-light'), emissiveMap: glowMap, emissiveIntensity: 1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;   // vertices move every frame
  return { mesh, flat, path, geometry, home: Float32Array.from(geometry.attributes.position.array), ringX, ringW, SEG, RAD, anchors };
}

export const spans = {
  left: buildSpan(CONFIG.cable.left, [-700, POLE_X]),
  right: buildSpan(CONFIG.cable.right, [POLE_X, 2300])
};

// The cable's height (picture row) at picture column x
export function spanYAt(span, x) {
  const f = span.flat;
  if (x <= f[0].x) return f[0].y;
  for (let i = 1; i < f.length; i++) {
    if (f[i].x >= x) {
      const t = (x - f[i - 1].x) / (f[i].x - f[i - 1].x || 1);
      return f[i - 1].y + (f[i].y - f[i - 1].y) * t;
    }
  }
  return f[f.length - 1].y;
}

// How far a point on the cable moves (metres), given its picture x and anchor weight.
// A gentle sway all the time; it grows while a gust passes that point, and the cable is pushed
// a little downwind.
const sway = new THREE.Vector3();
export function cableSway(x, w, t, amount) {
  const k = x * 0.0045;
  const gust = Math.max(0, windAt(x, t));
  const a = w * amount * (0.35 + 1.3 * gust);
  return sway.set(
    0.004 * Math.sin(t * 0.83 - k * 0.7 + 1.1) * a + 0.006 * gust * w * amount,
    0.010 * Math.sin(t * 1.17 - k + 0.4) * a,
    0.045 * Math.sin(t * 0.91 - k * 0.8) * a + 0.03 * gust * w * amount
  );
}

// Move a span's rings for this frame
export function updateSpan(span, t, amount) {
  const pos = span.geometry.attributes.position;
  const arr = pos.array, home = span.home, per = span.RAD + 1;
  for (let i = 0; i <= span.SEG; i++) {
    const d = cableSway(span.ringX[i], span.ringW[i], t, amount);
    for (let j = 0; j < per; j++) {
      const k = (i * per + j) * 3;
      arr[k] = home[k] + d.x;
      arr[k + 1] = home[k + 1] + d.y;
      arr[k + 2] = home[k + 2] + d.z;
    }
  }
  pos.needsUpdate = true;
}
