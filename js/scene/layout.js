// Where each 3D model sits: the inputs in css/scene.css. Each is a length from the photo's top-left corner, and
// the browser works it out in pixels (they're registered with @property); this turns them into picture pixels,
// the frame the models are built in. It only reads the CSS, it never writes styles.
import { PICTURE_WIDTH, PICTURE_HEIGHT } from "./picture.js";
import { token } from "../utils/theme.js";

// A length input, or a list of them, in screen pixels
function pixels(name) {
  const values = token(name).split(/\s+/).filter(Boolean).map(parseFloat);
  if (!values.length || values.some((v) => !Number.isFinite(v)))
    throw new Error(
      `css/scene.css: ${name} should be a length (or lengths), not "${token(name)}"`
    );
  return values;
}

// Bulb i's centre, in pixels from the photo's left edge (phones slide the photo along to it)
export const bulbLeft = (i) => pixels("--bulb-x")[i];

// Everything the models need, in picture pixels. photoWidth, photoHeight: the photo's size on screen. The photo
// is stretched to fit the screen unless it's a phone held upright, so lengths across and down convert separately.
export function readLayout(photoWidth, photoHeight) {
  const kx = PICTURE_WIDTH / photoWidth,
    ky = PICTURE_HEIGHT / photoHeight;
  const across = (name) => pixels(name)[0] * kx;
  const down = (name) => pixels(name)[0] * ky;
  return {
    pole: {
      x: across("--pole-x"),
      top: down("--pole-top"),
      footX: across("--pole-foot-x"),
      width: across("--pole-width"),
    },
    cable: {
      tie: down("--cable-tie"),
      left: down("--cable-left"),
      sag: down("--cable-sag"),
      right: down("--cable-right"),
    },
    bulbs: {
      x: pixels("--bulb-x").map((v) => v * kx),
      drop: down("--bulb-drop"),
      size: across("--bulb-size"),
    },
    horizon: down("--horizon"),
    grassWave: down("--grass-wave"),
  };
}
