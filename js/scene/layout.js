// Where each 3D model sits: the inputs in css/scene.css. Each is a length from the photo's top-left corner; the
// browser works it out in pixels, and this turns them into picture pixels, the frame the models are built in. It
// only reads the page's CSS: the one style it writes is on its own hidden probe.
import { PICTURE_WIDTH, PICTURE_HEIGHT } from "./picture.js";

// The probe: a hidden grid in the body, which takes a length (or a list of them) as its columns, because a grid
// reports its columns in pixels. In the body, so the scene's cqw and cqh measure the body's safe area.
const probe = document.body.appendChild(document.createElement("div"));
probe.setAttribute("aria-hidden", "true");
probe.style.cssText = "position: absolute; display: grid; visibility: hidden; pointer-events: none";

// A length input, or a list of them, in screen pixels
function pixels(name) {
  probe.style.gridTemplateColumns = `var(${name})`;
  const resolved = getComputedStyle(probe).gridTemplateColumns;
  const values = resolved.split(/\s+/).filter(Boolean).map(parseFloat);
  if (!values.length || values.some((v) => !Number.isFinite(v)))
    throw new Error(
      `css/scene.css: ${name} should be a length (or lengths), not "${resolved}"`
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
