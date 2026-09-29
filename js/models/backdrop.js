// The painted grass (grass.webp, the photo's field cut out): it lies exactly over the photo (the page's
// background) and waves in the same wind as everything else. Under the 3D blades it is darkened so it reads
// as the shade beneath them (js/models/blades.js sets where).
import * as THREE from "three";
import { CONFIG } from "../config.js";
import {
  PICTURE_WIDTH,
  PICTURE_HEIGHT,
  FOCAL_LENGTH,
  GRASS_DEPTH,
  toWorld,
} from "../scene/picture.js";
import { windUniforms, WIND_GLSL } from "../utils/wind.js";

export const grassMaterial = new THREE.ShaderMaterial({
  uniforms: {
    ...windUniforms,
    map: { value: null },
    uSway: { value: CONFIG.sway.grass * CONFIG.sway.grassMaterial }, // tip movement at full wind, in picture pixels
    uHorizon: { value: 0.65 }, // no movement at the horizon (placeGrass sets these two from the layout)
    uTip: { value: 0.82 }, // row where the tall blades have their tips
    uBaseDamp: { value: 0.55 }, // bases move this much less than tips
    uShadeFrom: { value: 1 },
    uShadeTo: { value: 1 },
    uFloorShade: { value: 1 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
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
      float w = windAt(uv.x * ${PICTURE_WIDTH}.0, uWindTime);
      uv.x -= w * uSway * rise * fall / ${PICTURE_WIDTH}.0;
      vec4 c = texture2D(map, uv);
      c.rgb *= mix(1.0, uFloorShade, smoothstep(uShadeFrom, uShadeTo, y));
      gl_FragColor = c;
    }`,
  transparent: true,
  depthWrite: false,
});

// A flat picture far away, sized so it exactly fills the frame
const s = GRASS_DEPTH / FOCAL_LENGTH;
export const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(PICTURE_WIDTH * s, PICTURE_HEIGHT * s),
  grassMaterial
);

// Put it over the photo (it moves with the horizon, which the camera looks level at), and set which rows wave
export function placeGrass(layout) {
  grass.position.copy(toWorld(PICTURE_WIDTH / 2, PICTURE_HEIGHT / 2, GRASS_DEPTH));
  grassMaterial.uniforms.uHorizon.value = layout.horizon / PICTURE_HEIGHT;
  grassMaterial.uniforms.uTip.value = layout.grassWave / PICTURE_HEIGHT;
}
