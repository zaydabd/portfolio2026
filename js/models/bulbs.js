// One Edison bulb model, hung along the cable wherever css/scene.css says (--bulb-x): connector, wire, socket,
// glass and glow
import * as THREE from "three";
import { CONFIG } from "../config.js";
import { COMPANIES } from "../state.js";
import {
  FOCAL_LENGTH,
  GLASS_RADIUS,
  GLASS_HEIGHT,
  SOCKET_HEIGHT,
  toWorld,
} from "../scene/picture.js";
import { canvas, camera } from "../scene/stage.js";
import { spanYAt, swayWeight, cableSway } from "./cable.js";
import { windAt } from "../utils/wind.js";
import { frac, smooth } from "../utils/math.js";
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
      // its chapter open: brighter and whiter
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

// Every bulb shares these; a rebuild (js/main.js) must keep them
for (const shared of [
  glassGeometry,
  socketGeometry,
  wireGeometry,
  sleeveGeometry,
  knobGeometry,
  stemGeometry,
  hitGeometry,
  plasticMaterial,
  socketMaterial,
  socketMaterial.emissiveMap,
  glowTexture,
  hitMaterial,
])
  shared.userData.shared = true;

// What a click or tap can land on: the company bulbs
const hits = [];

// Which company bulb is under a point on screen (-1 for none)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
export function bulbAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  pointer.set(
    ((clientX - r.left) / r.width) * 2 - 1,
    -((clientY - r.top) / r.height) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);
  const found = raycaster.intersectObjects(hits, false);
  return found.length ? found[0].object.userData.index : -1;
}

// The bulbs for this layout, hanging from this cable. previous: the bulbs they replace, which hand on
// how far they've switched on, glowed and swung.
export function buildBulbs(layout, cable, previous = []) {
  hits.length = 0;
  return layout.bulbs.x.map((x, index) => buildBulb(layout, cable, x, index, previous[index]));
}

function buildBulb(layout, cable, x, index, was) {
  const span = x > cable.poleX ? cable.spans.right : cable.spans.left;
  const cy = spanYAt(span, x); // cable height above this bulb
  const gy = cy + layout.bulbs.drop; // glass centre
  const depth = cable.depth;
  const scale = layout.bulbs.size / ((2 * GLASS_RADIUS * FOCAL_LENGTH) / depth);
  const drop = ((gy - cy) * depth) / FOCAL_LENGTH / scale; // junction to glass centre, model units
  const hang = Math.max(0.005, drop - SOCKET_HEIGHT - GLASS_HEIGHT / 2 - 0.02);

  const root = new THREE.Group();
  root.position.copy(toWorld(x, cy, depth));
  root.scale.setScalar(scale);
  root.userData.home = root.position.clone();

  // T-connector, lined up with the cable
  const a = toWorld(x - 6, spanYAt(span, x - 6), depth);
  const b = toWorld(x + 6, spanYAt(span, x + 6), depth);
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
  glass.position.y = -hang - SOCKET_HEIGHT;
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
  glow.position.y = -hang - SOCKET_HEIGHT - GLASS_HEIGHT * 0.55;
  glow.renderOrder = 2;
  const hit = new THREE.Mesh(hitGeometry, hitMaterial);
  hit.position.y = -hang - SOCKET_HEIGHT - GLASS_HEIGHT / 2;
  hit.userData.index = index;
  if (index < COMPANIES) hits.push(hit);
  swing.add(wire, socket, glass, glow, hit);

  return {
    root,
    swing,
    glow,
    material,
    glowMaterial,
    weight: swayWeight(x, span.anchors),
    x,
    // each bulb is a small pendulum with its own swing rate, so they drift out of step
    rate: 2 * Math.PI * (0.62 + 0.16 * frac(index * 0.618034)),
    side: was ? was.side : 0,
    sideV: was ? was.sideV : 0,
    fore: was ? was.fore : 0,
    foreV: was ? was.foreV : 0,
    hover: was ? was.hover : 0,
    lit: was ? was.lit : 0,
    on: was ? was.on : 0,
    hit,
    hang, // the wire's length: js/ui/captions.js finds the bottom of the glass with it
  };
}

// Each frame: switch on one by one, swing in the wind, and glow.
// hovered and active are bulb numbers from 0 (-1 for none): the one under the mouse, and the open chapter's.
const baseGlow = 2 * GLASS_RADIUS * CONFIG.glow.size;
export function updateBulbs(bulbs, tick, { hovered, active }) {
  const { dt, since, wind } = tick;
  const onRate = smooth(dt, CONFIG.glow.onTau);
  const push = CONFIG.sway.bulbs;
  const steps = Math.max(1, Math.ceil(dt * CONFIG.physics.stepsPerSecond));
  const step = dt / steps;
  const litRate = smooth(dt, CONFIG.glow.time / 3);
  const hoverRate = smooth(dt, CONFIG.glow.hoverTau);
  const P = CONFIG.physics;
  const G = CONFIG.glow;

  bulbs.forEach((b, i) => {
    // Switch-on: bulbs light up one by one
    const target = since > 0.35 + i * CONFIG.switchOn ? 1 : 0;
    b.on += (target - b.on) * onRate;

    // Position: follow the cable sway
    b.root.position
      .copy(b.root.userData.home)
      .add(cableSway(b.x, b.weight, wind, CONFIG.sway.cable));

    // Pendulum physics: spring-damper driven by wind
    const force =
      push *
      (windAt(b.x, wind) +
        P.breezeCoupling *
          Math.sin(wind * (P.jitterFreq + P.jitterSpread * i) + P.jitterPhase * i));
    const k = b.rate * b.rate,
      damp = P.damping * b.rate;
    for (let s = 0; s < steps; s++) {
      b.sideV += (-k * b.side - damp * b.sideV + P.breezeCoupling * k * force) * step;
      b.side += b.sideV * step;
      b.foreV +=
        (-k * b.fore -
          damp * b.foreV +
          P.foreCoupling * k * force * Math.sin(wind * P.forePhase + i)) *
        step;
      b.fore += b.foreV * step;
    }
    b.swing.rotation.z = b.side;
    b.swing.rotation.x = b.fore;

    // Hover and lit interpolation
    b.hover += ((i === hovered && i < COMPANIES ? 1 : 0) - b.hover) * hoverRate;
    b.lit += ((i === active ? 1 : 0) - b.lit) * litRate;

    // Glow size and opacity
    const size =
      baseGlow *
      (1 + (G.hover - 1) * b.hover) *
      (1 + (G.lit - 1) * b.lit) *
      (G.onFloor + G.onRange * b.on);
    b.glow.scale.set(size, size, 1);
    b.glowMaterial.opacity =
      Math.min(1, G.opacity * (1 + G.litOpacityBoost * b.lit)) * b.on;
    b.material.uniforms.uBoost.value = b.lit;
    b.material.uniforms.uOn.value = b.on;
  });
}
