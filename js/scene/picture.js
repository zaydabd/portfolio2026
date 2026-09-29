// The picture the 3D scene is built in: the photo's own frame and camera. The photo itself is the page's
// background (css/base.css) and the canvas lies exactly over it, so a model at picture pixel (x, y) lands on the
// photo's pixel (x, y). Where the models go comes from css/scene.css (js/scene/layout.js).
import * as THREE from "three";

export const PICTURE_WIDTH = 1672,
  PICTURE_HEIGHT = 941; // plate.webp and grass.webp size in pixels (16:9)
export const FOCAL_LENGTH = 1153; // focal length in pixels: 26 mm equivalent on this 16:9 frame
export const CENTRE_X = PICTURE_WIDTH / 2; // optical centre
export const GRASS_DEPTH = 59; // the painted grass, far behind everything else

// Eye level: the horizon row, from --horizon in css/scene.css (js/main.js sets it from the layout)
export const picture = { horizon: 613 };

// Bulb and cable sizes in metres
export const GLASS_RADIUS = 0.0222,
  GLASS_HEIGHT = 0.061,
  SOCKET_HEIGHT = 0.0278,
  CABLE_RADIUS = 0.0033;

// The field: flat ground 1.6 m below the camera. With that height, blades about 0.9 m tall
// put their tips where the tall grass tips are in grass.webp. Blades start just behind the pole (about 2.7 m away).
export const EYE_HEIGHT = 1.6,
  BLADE_NEAR = 3.1;

// The point in 3D that shows at picture pixel (pixelX, pixelY), distance metres away
export const toWorld = (pixelX, pixelY, distance) =>
  new THREE.Vector3(
    ((pixelX - CENTRE_X) * distance) / FOCAL_LENGTH,
    (-(pixelY - picture.horizon) * distance) / FOCAL_LENGTH,
    -distance
  );
