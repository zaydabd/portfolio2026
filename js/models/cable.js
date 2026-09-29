// The cable: two spans, each a tube that sways between its anchors, with the bulbs' light on it.
// Its shape comes from css/scene.css: tied to the pole, it sags across to the picture's left edge (and on past it),
// and runs straight down past the right edge.
import * as THREE from "three";
import {
  PICTURE_WIDTH,
  FOCAL_LENGTH,
  CENTRE_X,
  GLASS_RADIUS,
  CABLE_RADIUS,
  toWorld,
} from "../scene/picture.js";
import { windAt } from "../utils/wind.js";
import { gradientTexture } from "../utils/textures.js";
import { color } from "../utils/theme.js";

// How much a point between two anchors sways: nothing at the anchors, most halfway
export function swayWeight(x, [a, b]) {
  const s = (x - a) / (b - a);
  return s <= 0 || s >= 1 ? 0 : Math.sin(Math.PI * s);
}

// The cable for this layout (js/scene/layout.js): its two spans, where they meet (the pole), and how far away
// it hangs, from the bulbs' size (the cable and bulbs share one distance)
export function buildCable(layout) {
  const { cable: C, pole: P, bulbs: B } = layout;
  const poleX = P.x;
  const depth = (FOCAL_LENGTH * 2 * GLASS_RADIUS) / B.size;
  // left: a straight line from the left edge to the pole, dipping by the sag in the middle
  const leftY = (x) => {
    const t = x / poleX;
    return C.left + (C.tie - C.left) * t + 4 * C.sag * t * (1 - t);
  };
  // right: straight from the pole down to the right edge
  const rightY = (x) =>
    C.tie + ((C.right - C.tie) * (x - poleX)) / (PICTURE_WIDTH - poleX);
  const left = [],
    right = [];
  for (let x = -300; x < poleX; x += 50) left.push([x, leftY(x)]);
  left.push([poleX, C.tie]);
  for (let x = poleX; x <= PICTURE_WIDTH + 330; x += 50) right.push([x, rightY(x)]);
  return {
    poleX,
    depth,
    spans: {
      left: buildSpan(left, [-700, poleX], depth, B.x),
      right: buildSpan(right, [poleX, 2300], depth, B.x),
    },
  };
}

function buildSpan(points, anchors, depth, bulbXs) {
  const flat = new THREE.SplineCurve(
    points.map(([x, y]) => new THREE.Vector2(x, y))
  ).getSpacedPoints(220);
  const path = new THREE.CatmullRomCurve3(
    flat.map((p) => toWorld(p.x, p.y, depth)),
    false,
    "centripetal"
  );
  const SEG = 360,
    RAD = 6;
  const geometry = new THREE.TubeGeometry(path, SEG, CABLE_RADIUS, RAD, false);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  const ringX = new Float32Array(SEG + 1),
    ringW = new Float32Array(SEG + 1);
  for (let i = 0; i <= SEG; i++) {
    const p = path.getPointAt(i / SEG);
    ringX[i] = (p.x * FOCAL_LENGTH) / -p.z + CENTRE_X;
    ringW[i] = swayWeight(ringX[i], anchors);
  }
  const glowMap = gradientTexture(SEG + 1, 1, (u) => {
    // warm where the bulbs hang
    const x = ringX[Math.round(u * SEG)];
    let v = 0;
    for (const bx of bulbXs) v += Math.exp(-(((x - bx) / 22) ** 2));
    return 0.004 + 0.12 * v;
  });
  const material = new THREE.MeshStandardMaterial({
    color: color("--cable"),
    roughness: 0.55,
    metalness: 0.1,
    emissive: color("--lamp-light"),
    emissiveMap: glowMap,
    emissiveIntensity: 1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; // vertices move every frame
  return {
    mesh,
    flat,
    path,
    geometry,
    home: Float32Array.from(geometry.attributes.position.array),
    ringX,
    ringW,
    SEG,
    RAD,
    anchors,
  };
}

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
    0.01 * Math.sin(t * 1.17 - k + 0.4) * a,
    0.045 * Math.sin(t * 0.91 - k * 0.8) * a + 0.03 * gust * w * amount
  );
}

// Move a span's rings for this frame
export function updateSpan(span, t, amount) {
  const pos = span.geometry.attributes.position;
  const arr = pos.array,
    home = span.home,
    per = span.RAD + 1;
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
