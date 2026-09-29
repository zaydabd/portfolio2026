// The metal pole the cable is tied to, with the bulbs' warm light on it. Where it stands comes from
// css/scene.css (--pole-x, --pole-top, --pole-foot-x, --pole-width).
import * as THREE from "three";
import { PICTURE_HEIGHT, FOCAL_LENGTH, toWorld } from "../scene/picture.js";
import { gradientTexture } from "../utils/textures.js";
import { color } from "../utils/theme.js";

// Warm light the bulbs throw on the pole: a strong band on the front (bulb 7 hangs in front of the pole)
// and a faint one on the left edge (bulb 6), both fading down from the top.
// u = 0 faces the camera, u = 0.75 faces left; v = 1 is the top.
const band = (u, centre, width) => {
  const du = Math.min(Math.abs(u - centre), 1 - Math.abs(u - centre));
  return Math.exp(-((du / width) ** 2));
};
const fade = (s, reach) => (s < 0.1 ? 1 : Math.exp(-(((s - 0.1) / reach) ** 2)));
const glowMap = gradientTexture(128, 256, (u, v) => {
  const s = (1 - v) * 1.5; // 0 at the top, 1 at the bottom of the frame
  return (
    0.004 +
    0.65 * band(u, 0, 0.06) * fade(s, 0.21) +
    0.17 * band(u, 0.76, 0.05) * fade(s, 0.18)
  );
});
const lampLight = color("--lamp-light");
const metal = new THREE.MeshStandardMaterial({
  color: color("--pole"),
  metalness: 0.1,
  roughness: 0.55,
  emissive: lampLight,
  emissiveMap: glowMap,
  emissiveIntensity: 1,
});
const clampMaterial = new THREE.MeshStandardMaterial({
  color: color("--pole-clamp"),
  roughness: 0.5,
  emissive: lampLight,
  emissiveIntensity: 0.012,
});
for (const shared of [glowMap, metal, clampMaterial]) shared.userData.shared = true; // kept across rebuilds

// The pole for this layout (js/scene/layout.js), standing just behind the cable
export function buildPole(layout, cable) {
  const P = layout.pole;
  const depth = (cable.depth + 0.034) / (1 - P.width / (2 * FOCAL_LENGTH));
  const r = ((P.width / 2) * depth) / FOCAL_LENGTH;
  const top = toWorld(P.x, P.top, depth);
  const bottom = toWorld(P.footX, PICTURE_HEIGHT, depth);
  const up = new THREE.Vector3().subVectors(top, bottom);
  const visible = up.length();
  up.normalize();
  const length = visible * 1.5; // runs well past the frame
  const turn = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    up
  );

  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, length, 28, 1),
    metal
  );
  mesh.position.copy(top).addScaledVector(up, -length / 2);
  mesh.quaternion.copy(turn);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.02, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    metal
  );
  cap.scale.set(1, 0.35, 1);
  cap.position.copy(top);
  cap.quaternion.copy(turn);

  // Clamp where the cable is tied on
  const clamp = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.032, 24, 1),
    clampMaterial
  );
  clamp.position.lerpVectors(
    top,
    bottom,
    (layout.cable.tie - P.top) / (PICTURE_HEIGHT - P.top)
  );
  clamp.quaternion.copy(turn);

  const group = new THREE.Group();
  group.add(mesh, cap, clamp);
  group.userData.depth = depth;
  return group;
}
