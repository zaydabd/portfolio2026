// One Edison bulb model, hung 7 times along the cable: connector, wire, socket, glass and glow
import * as THREE from "three";
import { CONFIG } from "../config.js";
import { COMPANIES } from "../state.js";
import {
  FOCAL,
  NIGHT_DY,
  GLASS_R,
  GLASS_H,
  SOCKET_H,
  toWorld,
} from "../scene/picture.js";
import { POLE_X, spans, spanYAt, cableDepth, swayWeight } from "./cable.js";
import { frac } from "../utils/math.js";
import { gradientTexture } from "../utils/textures.js";
import { color, vec3, paint } from "../utils/theme.js";

const lathe = (pts, segments) =>
  new THREE.LatheGeometry(
    new THREE.SplineCurve(
      pts.map(([r, y]) => new THREE.Vector2(r, y))
    ).getPoints(48),
    segments
  );

// Profiles run bottom to top, (radius, height) in metres
const glassGeometry = lathe(
  [
    [0.0001, -0.061],
    [0.007, -0.0608],
    [0.014, -0.0595],
    [0.0192, -0.056],
    [0.0215, -0.051],
    [0.0222, -0.046],
    [0.0214, -0.04],
    [0.0195, -0.032],
    [0.0165, -0.024],
    [0.0135, -0.016],
    [0.0112, -0.009],
    [0.0105, -0.004],
    [0.0118, 0],
  ],
  40
);
const socketGeometry = new THREE.LatheGeometry(
  [
    [0.0001, -0.0278],
    [0.0148, -0.0278],
    [0.015, -0.0262],
    [0.015, -0.0232],
    [0.0142, -0.0226],
    [0.0146, -0.0214],
    [0.0146, -0.0188],
    [0.0137, -0.0182],
    [0.0138, -0.017],
    [0.013, -0.011],
    [0.0122, -0.003],
    [0.0112, -0.0006],
    [0.006, 0],
    [0.0001, 0],
  ].map(([r, y]) => new THREE.Vector2(r, y)),
  28
);
const wireGeometry = new THREE.CylinderGeometry(0.0032, 0.0032, 1, 8).translate(
  0,
  -0.5,
  0
);
const sleeveGeometry = new THREE.CylinderGeometry(0.0068, 0.0068, 0.05, 12);
const knobGeometry = new THREE.CylinderGeometry(
  0.0036,
  0.0044,
  0.011,
  10
).translate(0, 0.0095, 0);
const stemGeometry = new THREE.CylinderGeometry(
  0.0056,
  0.0044,
  0.02,
  10
).translate(0, -0.012, 0);
const hitGeometry = new THREE.SphereGeometry(0.05, 12, 8);

const lampLight = color("--lamp-light");
const plasticMaterial = new THREE.MeshStandardMaterial({
  color: color("--fitting"),
  roughness: 0.5,
  emissive: lampLight,
  emissiveIntensity: 0.012,
});
const socketMaterial = new THREE.MeshStandardMaterial({
  color: color("--fitting"),
  roughness: 0.45,
  emissive: lampLight,
  emissiveIntensity: 1,
  emissiveMap: gradientTexture(
    4,
    64,
    (u, v) => 0.006 + 0.2 * Math.pow(1 - v, 8)
  ), // rim lit by the glass below
});
const glassMaterial = new THREE.ShaderMaterial({
  uniforms: { uBoost: { value: 0 }, uOn: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec3 vN; varying vec3 vV; varying vec3 vP;
    void main() {
      vP = position;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vN = normalize(normalMatrix * normal);
      vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uBoost, uOn;
    varying vec3 vN; varying vec3 vV; varying vec3 vP;
    void main() {
      float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
      // amber glass with a bright outline where it curves away
      vec3 col = mix(${vec3("--bulb-glass")}, ${vec3(
    "--bulb-glass-edge"
  )}, smoothstep(0.55, 0.95, 1.0 - facing));
      // soft light around the filaments, then the filaments themselves
      float band = (1.0 - smoothstep(-0.019, -0.012, vP.y)) * smoothstep(-0.056, -0.046, vP.y);
      col = mix(col, ${vec3(
        "--bulb-core"
      )}, exp(-pow(vP.x / 0.009, 2.0)) * band * 0.75);
      float fil = 0.0;
      for (int k = 0; k < 4; k++) {
        float fx = (float(k) - 1.5) * 0.0030;
        fil += 1.0 - smoothstep(0.0004, 0.0012, abs(vP.x - fx));
      }
      col = mix(col, ${vec3(
        "--bulb-filament"
      )}, clamp(fil, 0.0, 1.0) * band * smoothstep(0.2, 0.6, facing));
      // clicked: brighter and whiter
      col = mix(col * (1.0 + 0.3 * uBoost), ${vec3(
        "--bulb-lit"
      )}, 0.25 * uBoost);
      // switched off: dark glass with a faint cool edge from the moon
      vec3 off = mix(${vec3("--bulb-off")}, ${vec3(
    "--bulb-off-edge"
  )}, pow(1.0 - facing, 2.0));
      col = mix(off, col, uOn);
      gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
    }`,
});

// The glow around each bulb
const glowTexture = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  [0, 0.15, 0.35, 0.6, 1].forEach((at, k) =>
    grd.addColorStop(at, paint(`--halo-${k + 1}`))
  );
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });

// What a click or tap can land on: the company bulbs, and their signs (js/models/signs.js adds those)
export const hits = [];

export const bulbs = CONFIG.bulbs.map((cfg, index) => {
  const span = cfg.x > POLE_X ? spans.right : spans.left;
  const cy = spanYAt(span, cfg.x); // cable height above this bulb
  const gy = cfg.y + NIGHT_DY; // glass centre
  const depth = cableDepth(cfg.x);
  const scale = cfg.w / ((2 * GLASS_R * FOCAL) / depth);
  const drop = ((gy - cy) * depth) / FOCAL / scale; // junction to glass centre, model units
  const hang = Math.max(0.005, drop - SOCKET_H - GLASS_H / 2 - 0.02);

  const root = new THREE.Group();
  root.position.copy(toWorld(cfg.x, cy, depth));
  root.scale.setScalar(scale);
  root.userData.home = root.position.clone();

  // T-connector, lined up with the cable
  const a = toWorld(cfg.x - 6, spanYAt(span, cfg.x - 6), cableDepth(cfg.x - 6));
  const b = toWorld(cfg.x + 6, spanYAt(span, cfg.x + 6), cableDepth(cfg.x + 6));
  const sleeve = new THREE.Mesh(sleeveGeometry, plasticMaterial);
  sleeve.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.sub(a).normalize()
  );
  root.add(
    sleeve,
    new THREE.Mesh(knobGeometry, plasticMaterial),
    new THREE.Mesh(stemGeometry, plasticMaterial)
  );

  // Everything below the connector swings
  const swing = new THREE.Group();
  swing.position.y = -0.02;
  root.add(swing);
  const wire = new THREE.Mesh(wireGeometry, plasticMaterial);
  wire.scale.y = hang + 0.002;
  const socket = new THREE.Mesh(socketGeometry, socketMaterial);
  socket.position.y = -hang;
  const material = glassMaterial.clone();
  const glass = new THREE.Mesh(glassGeometry, material);
  glass.position.y = -hang - SOCKET_H;
  glass.renderOrder = 1;
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity: CONFIG.glow.opacity,
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.position.y = -hang - SOCKET_H - GLASS_H * 0.55;
  glow.renderOrder = 2;
  const hit = new THREE.Mesh(hitGeometry, hitMaterial);
  hit.position.y = -hang - SOCKET_H - GLASS_H / 2;
  hit.userData.index = index;
  if (index < COMPANIES) hits.push(hit);
  swing.add(wire, socket, glass, glow, hit);

  return {
    root,
    swing,
    glow,
    material,
    glowMaterial,
    weight: swayWeight(cfg.x, span.anchors),
    x: cfg.x,
    // each bulb is a small pendulum with its own swing rate, so they drift out of step
    rate: 2 * Math.PI * (0.62 + 0.16 * frac(index * 0.618034)),
    side: 0,
    sideV: 0,
    fore: 0,
    foreV: 0,
    hover: 0,
    lit: 0,
    on: 0,
    hit,
    gy,
    depth,
    scale,
    hang,
    sign: null,
    signSmall: null,
    signTag: null,
    signMats: null,
  };
});

// The picture row where a bulb's glass ends: the signs hang from here
export function glassBottomRow(b) {
  return b.gy + ((GLASS_H / 2) * b.scale * FOCAL) / b.depth;
}
