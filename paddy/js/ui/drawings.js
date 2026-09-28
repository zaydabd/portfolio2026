// Line drawings in code (SVG): thin lines, decorative; the text beside them carries the meaning.
// Their colours come from css/chapters.css (.art): the drawing colour, and one accent.
import { seeded } from '../utils/math.js';

const svgArt = (w, h, body) => `<svg class="art" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>`;
const rectD = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const pathD = (d, cls = '') => `<path class="draw${cls ? ' ' + cls : ''}" pathLength="1" d="${d}"/>`;
const dot = (x, y, r = 2.4, cls = 'f') => `<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`;
const arrow = (x1, y, x2) => pathD(`M${x1} ${y}H${x2}M${x2 - 6} ${y - 5}L${x2} ${y}L${x2 - 6} ${y + 5}`, 'a');

function qrPattern(x0, y0, s) {   // 21 × 21 modules: three finder squares, the rest repeatable noise (it doesn't scan)
  const rnd = seeded(2021), cells = [];
  const finder = (q, r) => `<path class="draw" pathLength="1" style="stroke-width:${s}" d="${rectD(x0 + (q + 0.5) * s, y0 + (r + 0.5) * s, 6 * s, 6 * s)}"/>`
    + `<rect class="f" x="${x0 + (q + 2) * s}" y="${y0 + (r + 2) * s}" width="${3 * s}" height="${3 * s}"/>`;
  for (let r = 0; r < 21; r++) for (let q = 0; q < 21; q++) {
    const inFinder = (r < 8 && q < 8) || (r < 8 && q > 12) || (r > 12 && q < 8);
    if (!inFinder && rnd() < 0.46) cells.push(`<rect class="f" x="${x0 + q * s}" y="${y0 + r * s}" width="${s - 0.6}" height="${s - 0.6}"/>`);
  }
  return finder(0, 0) + finder(14, 0) + finder(0, 14) + cells.join('');
}

// A team as dots: developers in the accent colour, the first of them ringed as you;
// `open` trails off for a larger, uncounted team
export function teamDots({ size = 0, devs = 1, open = false }) {
  const n = Math.max(size, devs), gap = 14, x0 = 10, end = x0 + (n - 1) * gap;
  const dots = Array.from({ length: n }, (_, k) => dot(x0 + k * gap, 8, 3.2, k < devs ? 'fa' : 'f o')).join('');
  const more = open ? [0.55, 0.35, 0.18].map((o, k) => `<path style="opacity:${o}" d="M${end + 12 + k * 14} 8h8"/>`).join('') : '';
  return svgArt(end + (open ? 58 : 12), 16, `<circle class="a" cx="${x0}" cy="8" r="6.4"/>` + dots + more)
    .replace('class="art"', 'class="art team"');
}

// Drawings named by `art` in js/config.js
export const ART = {
  // Sunway City: the website, and its mobile-responsive version (in the accent colour)
  responsive: svgArt(240, 150,
    pathD(rectD(12, 22, 150, 94)) + pathD('M87 116V130M64 130H110') + pathD('M12 36H162')
    + [[26, 50, 60], [26, 62, 46], [26, 74, 54], [26, 86, 38]].map(([x, y, w]) => pathD(`M${x} ${y}h${w}`)).join('')
    + pathD(rectD(100, 48, 50, 52)) + '<path class="d" d="M168 76H182"/>'
    + pathD('M194 30h30a5 5 0 0 1 5 5v90a5 5 0 0 1 -5 5h-30a5 5 0 0 1 -5 -5v-90a5 5 0 0 1 5 -5Z', 'a')
    + pathD('M189 44H229', 'a') + [54, 62, 70].map((y, k) => pathD(`M196 ${y}h${k === 1 ? 18 : 26}`)).join('')
    + pathD(rectD(196, 80, 26, 26)) + pathD('M203 120h12', 'a')),
  // Adam Digital Assets: mosque signage, as an app and its website twin
  signage: svgArt(240, 150,
    pathD('M30 140V74C30 44 56 26 70 14C84 26 110 44 110 74V140') + pathD('M20 140H120')
    + pathD(rectD(46, 72, 48, 50), 'a') + [84, 96, 108].map(y => pathD(`M54 ${y}h32`)).join('')
    + pathD('M146 58h28a4 4 0 0 1 4 4v54a4 4 0 0 1 -4 4h-28a4 4 0 0 1 -4 -4v-54a4 4 0 0 1 4 -4Z') + pathD('M154 112h12')
    + '<path class="d" d="M178 86H188"/>' + pathD(rectD(188, 50, 46, 40)) + pathD('M188 60h46')),
  // VIP Dashboard: contour lines and data points (a motif, not a map)
  map: svgArt(240, 150,
    pathD('M30 80C28 44 70 22 108 26C150 30 176 50 172 82C168 112 132 126 96 122C60 118 32 108 30 80Z')
    + pathD('M52 78C52 54 80 40 106 42C134 44 152 58 150 80C148 102 124 110 98 108C72 106 52 98 52 78Z')
    + pathD('M76 76C76 64 92 56 106 58C122 60 130 68 128 80C126 92 112 96 100 94C86 92 76 88 76 76Z')
    + [[64, 62], [118, 46], [140, 98], [96, 80], [160, 64]].map(([x, y]) => dot(x, y, 3, 'fa')).join('')
    + [[196, 104, 26], [206, 92, 38], [216, 112, 18], [226, 84, 46]].map(([x, y, h]) => `<rect class="f o" x="${x}" y="${y}" width="6" height="${h}"/>`).join('')),
  // QR Asset Management
  qr: svgArt(240, 150, qrPattern(57, 12, 6)),
  // Small glyphs for the Maybank projects
  queue: svgArt(120, 60, [10, 30, 50].map((y, k) => pathD(rectD(8, y - 7, 76, 14), k === 2 ? 'a' : '')
    + pathD(`M94 ${y}l5 5l11 -11`, k === 2 ? 'a' : '')).join('')),   // CAB-Q: deployment requests, approved
  log: svgArt(120, 60, [[14, 86], [26, 70], [38, 92], [50, 54]].map(([y, w]) => dot(14, y, 2) + pathD(`M22 ${y}h${w}`)).join('')),
  token: svgArt(120, 60, pathD('M16 16h88a6 6 0 0 1 6 6v16a6 6 0 0 1 -6 6h-88a6 6 0 0 1 -6 -6v-16a6 6 0 0 1 6 -6Z')
    + Array.from({ length: 8 }, (_, k) => dot(25 + k * 10, 30, 2.6, k < 3 ? 'fa' : 'f')).join('')),
  board: svgArt(120, 60, [10, 45, 80].map((x, k) => pathD(rectD(x, 6, 30, 48))
    + Array.from({ length: 3 - k }, (_, j) => pathD(rectD(x + 5, 12 + j * 12, 20, 8), k === 1 && j === 0 ? 'a' : '')).join('')).join('')),
  swap: svgArt(120, 60, `<path class="d" d="${rectD(8, 16, 38, 28)}"/>` + arrow(52, 30, 70) + pathD(rectD(76, 16, 36, 28)))
};
