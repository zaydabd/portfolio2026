// Layers 1 and 2: the photograph (plate), and its painted grass, which waves in the same wind as everything else
import * as THREE from "three";
import {
  IMG_W,
  IMG_H,
  FOCAL,
  CY,
  PLATE_DEPTH,
  GRASS_DEPTH,
  toWorld,
} from "../scene/picture.js";
import { windUniforms, WIND_GLSL } from "../utils/wind.js";

const pictureVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;

export const plateMaterial = new THREE.ShaderMaterial({
  uniforms: { map: { value: null } },
  vertexShader: pictureVertex,
  fragmentShader: /* glsl */ `
    uniform sampler2D map;
    varying vec2 vUv;
    void main() { gl_FragColor = texture2D(map, vUv); }`,
  depthWrite: false,
});

// Painted grass: the far field waves in the wind; under the 3D blades it is darkened
// so it reads as the shade beneath them (js/models/blades.js sets where).
export const grassMaterial = new THREE.ShaderMaterial({
  uniforms: {
    ...windUniforms,
    map: { value: null },
    uSway: { value: 0 }, // tip movement at full wind, in picture pixels
    uHorizon: { value: CY / IMG_H }, // no movement at the horizon
    uTip: { value: 870 / IMG_H }, // row where the tall blades have their tips
    uBaseDamp: { value: 0.55 }, // bases move this much less than tips
    uShadeFrom: { value: 1 },
    uShadeTo: { value: 1 },
    uFloorShade: { value: 1 },
  },
  vertexShader: pictureVertex,
  fragmentShader: /* glsl */ `
    uniform sampler2D map;
    uniform float uSway, uHorizon, uTip, uBaseDamp, uShadeFrom, uShadeTo, uFloorShade;
    varying vec2 vUv;
    ${WIND_GLSL}
    void main() {
      vec2 uv = vUv;
      float y = 1.0 - uv.y;                                     // 0 = top, 1 = bottom
      float rise = smoothstep(uHorizon, uTip, y);               // still at the horizon, full at the tips
      float fall = 1.0 - uBaseDamp * smoothstep(uTip, 1.0, y);  // bases sway less than tips
      float w = windAt(uv.x * ${IMG_W}.0, uWindTime);
      uv.x -= w * uSway * rise * fall / ${IMG_W}.0;
      vec4 c = texture2D(map, uv);
      c.rgb *= mix(1.0, uFloorShade, smoothstep(uShadeFrom, uShadeTo, y));
      gl_FragColor = c;
    }`,
  transparent: true,
  depthWrite: false,
});

// A flat picture far away, sized so it exactly fills the photograph's frame
function picturePlane(depth, material) {
  const s = depth / FOCAL;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(IMG_W * s, IMG_H * s),
    material
  );
  mesh.position.copy(toWorld(IMG_W / 2, IMG_H / 2, depth));
  mesh.userData.home = mesh.position.clone();
  mesh.userData.pxToWorld = s;
  return mesh;
}
export const plate = picturePlane(PLATE_DEPTH, plateMaterial);
export const grass = picturePlane(GRASS_DEPTH, grassMaterial);
plate.renderOrder = -2;
grass.renderOrder = -1;
