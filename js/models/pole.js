// The metal pole the cable is tied to, with the bulbs' warm light on it
import * as THREE from "three";
import { CONFIG } from "../config.js";
import { FOCAL, NIGHT_DY, toWorld } from "../scene/picture.js";
import { POLE_X, cableDepth } from "./cable.js";
import { gradientTexture } from "../utils/textures.js";
import { color } from "../utils/theme.js";

export const pole = (() => {
  const P = CONFIG.pole;
  const dc = cableDepth(POLE_X);
  const dTop = (dc + 0.034) / (1 - P.width[0] / (2 * FOCAL)); // pole sits just behind the cable
  const dBottom = (dTop * P.width[0]) / P.width[1];
  const r = ((P.width[0] / 2) * dTop) / FOCAL;
  const top = toWorld(P.top[0], P.top[1] + NIGHT_DY, dTop);
  const bottom = toWorld(P.bottom[0], P.bottom[1] + NIGHT_DY, dBottom);
  const up = new THREE.Vector3().subVectors(top, bottom);
  const visible = up.length();
  up.normalize();
  const length = visible * 1.5; // runs well past the frame
  const turn = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    up
  );

  // Warm light the bulbs throw on the pole, matched to night.png: a strong band on the front
  // (bulb 6 hangs in front of the pole) and a faint one on the left edge (bulb 5), both fading
  // down from the top. u = 0 faces the camera, u = 0.75 faces left; v = 1 is the top.
  const band = (u, centre, width) => {
    const du = Math.min(Math.abs(u - centre), 1 - Math.abs(u - centre));
    return Math.exp(-((du / width) ** 2));
  };
  const fade = (s, reach) =>
    s < 0.1 ? 1 : Math.exp(-(((s - 0.1) / reach) ** 2));
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
  const clampAt = (97 - P.top[1]) / (P.bottom[1] - P.top[1]);
  const clampMaterial = new THREE.MeshStandardMaterial({
    color: color("--pole-clamp"),
    roughness: 0.5,
    emissive: lampLight,
    emissiveIntensity: 0.012,
  });
  const clamp = new THREE.Mesh(
    new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.032, 24, 1),
    clampMaterial
  );
  clamp.position.lerpVectors(top, bottom, clampAt);
  clamp.quaternion.copy(turn);

  const group = new THREE.Group();
  group.add(mesh, cap, clamp);
  group.userData.depth = dTop;
  return group;
})();
