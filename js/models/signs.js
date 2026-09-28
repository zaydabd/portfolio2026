// Wooden signs hanging under the company bulbs: a big tag with the logo, dates and role on desktop,
// and a small tag with the logo only on phones and tablets. Colours: css/tokens.css (the wood, the ink).
import * as THREE from "three";
import { CONFIG, CAREER } from "../config.js";
import { state, COMPANIES } from "../state.js";
import { FOCAL, GLASS_H, SOCKET_H } from "../scene/picture.js";
import { renderer } from "../scene/stage.js";
import { bulbs, hits } from "./bulbs.js";
import { markImages } from "../utils/assets.js";
import { seeded } from "../utils/math.js";
import { color, paint, token } from "../utils/theme.js";

const cordGeometry = new THREE.CylinderGeometry(0.0011, 0.0011, 1, 6).translate(
  0,
  -0.5,
  0
);
const cordMaterial = new THREE.MeshBasicMaterial({ color: color("--twine") });

function tint(g, im, x, y, w, h, ink) {
  // draw a logo mask in one ink
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const t = c.getContext("2d");
  t.drawImage(im, 0, 0, c.width, c.height);
  t.globalCompositeOperation = "source-in";
  t.fillStyle = ink;
  t.fillRect(0, 0, c.width, c.height);
  g.drawImage(c, x, y);
}

// One tag, painted on a canvas: the plank, its grain and knot, the screw eye, then the lettering
function drawSign(sign, seed, small = false) {
  // small: the phone and tablet tag, logo only
  const S = CONFIG.signs,
    R = 3; // canvas pixels per picture pixel
  const T = small ? S.phone : S,
    W = T.width * R,
    H = T.height * R;
  const ink = paint("--ink");
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const rnd = seeded(seed * 7919 + 17);
  const x0 = 1.5 * R,
    y0 = 1.5 * R,
    w = W - 3 * R,
    h = H - 3 * R;
  // the plank, a little lighter at the top where the bulb lights it
  g.save();
  g.beginPath();
  g.roundRect(x0, y0, w, h, 4 * R);
  g.clip();
  const wood = g.createLinearGradient(0, 0, 0, H);
  wood.addColorStop(0, paint("--wood-top"));
  wood.addColorStop(1, paint("--wood-bottom"));
  g.fillStyle = wood;
  g.fillRect(0, 0, W, H);
  // grain: long wavy lines along the plank, flowing round one small knot near a lower corner
  const knot = {
      x: W * (rnd() < 0.5 ? 0.12 : 0.88),
      y: H * (0.7 + rnd() * 0.14),
    },
    kr = 8 * R;
  for (let k = 0; k < 30; k++) {
    const base = y0 + rnd() * h,
      amp = (0.5 + rnd() * 1.6) * R,
      len = (40 + rnd() * 70) * R,
      ph = rnd() * 6.283;
    g.beginPath();
    for (let x = -6; x <= W + 6; x += 4) {
      let y = base + amp * Math.sin((x / len) * 6.283 + ph);
      const dx = x - knot.x,
        dy = y - knot.y;
      y +=
        (dy >= 0 ? 1 : -1) *
        kr *
        0.9 *
        Math.exp(-(dx * dx + dy * dy) / (kr * kr));
      if (x === -6) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokeStyle = paint(
      "--wood-grain",
      (S.grain * (0.35 + 0.65 * rnd())).toFixed(3)
    );
    g.lineWidth = (0.25 + rnd() * 0.8) * R;
    g.stroke();
  }
  for (let k = 3; k >= 1; k--) {
    g.beginPath();
    g.ellipse(knot.x, knot.y, k * 1.9 * R, k * 1.2 * R, 0, 0, Math.PI * 2);
    g.strokeStyle = paint("--wood-knot", S.grain * 1.1);
    g.lineWidth = 0.6 * R;
    g.stroke();
  }
  g.beginPath();
  g.ellipse(knot.x, knot.y, 1.3 * R, 0.8 * R, 0, 0, Math.PI * 2);
  g.fillStyle = paint("--wood-knot-core", S.grain * 1.6);
  g.fill();
  // weathering: darker ends, a light bevel along the top, a darker strip for the plank's thickness
  const ends = g.createLinearGradient(0, 0, W, 0);
  ends.addColorStop(0, paint("--wood-ends", 0.3));
  ends.addColorStop(0.1, paint("--wood-ends", 0));
  ends.addColorStop(0.9, paint("--wood-ends", 0));
  ends.addColorStop(1, paint("--wood-ends", 0.3));
  g.fillStyle = ends;
  g.fillRect(0, 0, W, H);
  g.fillStyle = paint("--wood-bevel");
  g.fillRect(0, y0, W, 1.2 * R);
  g.fillStyle = paint("--wood-side");
  g.fillRect(0, H - 3.6 * R, W, 2.1 * R);
  g.restore();
  g.beginPath();
  g.roundRect(x0, y0, w, h, 4 * R);
  g.lineWidth = 1.1 * R;
  g.strokeStyle = paint("--wood-outline");
  g.stroke();
  // a small metal screw eye where the cord ties on
  g.beginPath();
  g.arc(W / 2, 9 * R, 2.3 * R, 0, Math.PI * 2);
  g.lineWidth = 1.1 * R;
  g.strokeStyle = paint("--screw-eye");
  g.stroke();
  g.beginPath();
  g.arc(W / 2, 9 * R, 1 * R, 0, Math.PI * 2);
  g.fillStyle = paint("--screw-hole");
  g.fill();
  // lettering burnt into the wood: logo (or name), dates, role, OutSystems
  g.shadowColor = paint("--ink-burn");
  g.shadowBlur = 1.4 * R;
  const rows = [];
  if (small) {
    if (sign.logo) {
      const im = markImages[sign.logo],
        k = Math.min((W * 0.76) / im.width, (20 * R) / im.height);
      rows.push({
        h: im.height * k,
        draw: (y) =>
          tint(
            g,
            im,
            (W - im.width * k) / 2,
            y,
            im.width * k,
            im.height * k,
            ink
          ),
      });
    } else
      rows.push({ h: 17 * R, draw: (y) => text(sign.name[0], y, 16, ".14em") });
  } else if (sign.logo) {
    const im = markImages[sign.logo],
      k = Math.min((W * 0.74) / im.width, (30 * R) / im.height);
    rows.push({
      h: im.height * k,
      draw: (y) =>
        tint(
          g,
          im,
          (W - im.width * k) / 2,
          y,
          im.width * k,
          im.height * k,
          ink
        ),
    });
  } else {
    rows.push({ h: 19 * R, draw: (y) => text(sign.name[0], y, 17, ".16em") });
    rows.push({ h: 13 * R, draw: (y) => text(sign.name[1], y, 11, ".1em") });
  }
  if (!small) {
    rows.push({ h: 7 * R });
    rows.push({ h: 14 * R, draw: (y) => text(sign.dates, y, 12, ".14em") });
    rows.push({ h: 3 * R });
    for (const line of sign.role)
      rows.push({ h: 13 * R, draw: (y) => text(line, y, 11, ".1em") });
  }
  if (sign.ring && !small) {
    const im = markImages.outsystems,
      k = Math.min((W * 0.46) / im.width, (10 * R) / im.height);
    rows.push({ h: 5 * R });
    rows.push({
      h: im.height * k,
      draw: (y) =>
        tint(
          g,
          im,
          (W - im.width * k) / 2,
          y,
          im.width * k,
          im.height * k,
          ink
        ),
    });
  }
  const total = rows.reduce((t, r) => t + r.h, 0);
  let y = 14 * R + (H - 18 * R - total) / 2;
  for (const r of rows) {
    if (r.draw) r.draw(y);
    y += r.h;
  }
  return c;
  function text(t, y, size, spacing) {
    g.fillStyle = ink;
    g.textAlign = "center";
    g.textBaseline = "top";
    let px = size * R;
    const fit = () => {
      g.font = `600 ${px}px ${token("--serif")}`;
      g.letterSpacing = spacing.replace("em", "") * px + "px";
    };
    fit();
    const room = W * 0.88;
    if (g.measureText(t).width > room) {
      px *= room / g.measureText(t).width;
      fit();
    } // shrink to fit the tag
    g.fillText(t, W / 2, y);
  }
}

// Hang both tags under each company bulb, from a cord; they swing with the bulb
export function buildSigns() {
  const S = CONFIG.signs;
  bulbs.slice(0, COMPANIES).forEach((b, i) => {
    const lpp = b.depth / FOCAL / b.scale; // bulb units per picture pixel
    const glassBottom = -b.hang - SOCKET_H - GLASS_H;
    const hang = (canvas, w, h) => {
      // a cord from the glass, and a tag hanging by its hole
      const group = new THREE.Group();
      const cord = new THREE.Mesh(cordGeometry, cordMaterial);
      cord.position.y = glassBottom;
      cord.scale.y = S.cord * lpp;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        alphaTest: 0.5,
        toneMapped: false,
      });
      const tag = new THREE.Mesh(
        new THREE.PlaneGeometry(w * lpp, h * lpp),
        mat
      );
      tag.userData = {
        index: i,
        hole: glassBottom - S.cord * lpp,
        holeDrop: 9 * lpp,
        half: (h * lpp) / 2,
      };
      tag.position.y =
        tag.userData.hole + tag.userData.holeDrop - tag.userData.half;
      hits.push(tag);
      group.add(cord, tag);
      b.swing.add(group);
      return { group, tag, mat };
    };
    const big = hang(drawSign(CAREER[i].sign, i + 1), S.width, S.height);
    const small = hang(
      drawSign(CAREER[i].sign, i + 1, true),
      S.phone.width,
      S.phone.height
    );
    b.sign = big.group;
    b.signTag = big.tag;
    b.signSmall = small.group;
    b.signMats = [big.mat, small.mat];
    big.group.visible = !state.carousel;
    small.group.visible = state.carousel;
  });
}

// Desktop: scale the tags up on smaller screens so the lettering stays readable, still hanging by their holes
export function sizeSigns(k) {
  for (const b of bulbs.slice(0, COMPANIES)) {
    const t = b.signTag;
    if (!t) continue; // not built yet
    const u = t.userData;
    t.scale.setScalar(k);
    t.position.y = u.hole + (u.holeDrop - u.half) * k;
  }
}
