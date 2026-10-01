// The captions under the company bulbs (index.html). Each frame (js/main.js) a caption sits just under its bulb's
// glass as if the bulb hung still: it follows the cable and the mouse parallax, never the swing. It shines with the
// bulb, which hands it its light as --on, --hover and --lit (css/base.css).
import * as THREE from "three";
import { canvas, camera } from "../scene/stage.js";
import { SOCKET_HEIGHT, GLASS_HEIGHT } from "../scene/picture.js";
import { FIRST_BULB } from "../state.js";

export const captionEls = [...document.querySelectorAll("nav button")];

const point = new THREE.Vector3();
export function updateCaptions(bulbs) {
  const width = canvas.clientWidth,
    height = canvas.clientHeight;
  captionEls.forEach((el, i) => {
    const b = bulbs[i + FIRST_BULB];
    // the bottom of the glass, in the bulb's own units: under the connector, the wire, the socket and the glass
    point.set(0, -0.02 - b.hang - SOCKET_HEIGHT - GLASS_HEIGHT, 0);
    b.root.localToWorld(point).project(camera);
    el.style.transform = `translate(${((point.x + 1) / 2) * width}px, ${
      ((1 - point.y) / 2) * height
    }px) translateX(-50%)`;
    el.style.setProperty("--on", b.on.toFixed(3));
    el.style.setProperty("--hover", b.hover.toFixed(3));
    el.style.setProperty("--lit", b.lit.toFixed(3));
  });
}
