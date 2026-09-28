// Picture geometry, measured on the photograph (not meant for tweaking)
import * as THREE from "three";

export const IMG_W = 1447,
  IMG_H = 1087; // plate and grass size in pixels
export const NIGHT_DY = -7.5; // night.png's scene sits 7.5 px lower than plate.png's
export const FOCAL = 1087; // focal length in pixels: the photo was shot at 26 mm equivalent
export const CX = IMG_W / 2; // optical centre
export const CY = 692; // eye level = the horizon row on plate.png
export const HALF_W = Math.max(CX, IMG_W - CX);
export const HALF_H = Math.max(CY, IMG_H - CY);
export const PLATE_DEPTH = 60,
  GRASS_DEPTH = 59;

// Bulb and cable sizes in metres
export const GLASS_R = 0.0222,
  GLASS_H = 0.061,
  SOCKET_H = 0.0278,
  CABLE_R = 0.0033;

// The field: flat ground 1.6 m below the camera. With that height, blades about 0.9 m tall
// put their tips where the tall grass tips are in grass.png. Blades start just behind the pole.
export const EYE_HEIGHT = 1.6,
  BLADE_NEAR = 2.6;

// The point in 3D that shows at picture pixel (x, y), d metres away
export const toWorld = (x, y, d) =>
  new THREE.Vector3(((x - CX) * d) / FOCAL, (-(y - CY) * d) / FOCAL, -d);
