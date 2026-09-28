// Colours and fonts from css/tokens.css, for the three.js models and the canvas drawings.
// The CSS uses the same tokens directly, so css/tokens.css is the one place to change them.
import * as THREE from 'three';

const style = getComputedStyle(document.documentElement);

// A token as written in css/tokens.css
export const token = name => style.getPropertyValue(name).trim();

// A colour token as [r, g, b, a], each 0 to 1. Reads #rgb, #rrggbb, rgb() and rgba(), with numbers or percentages.
export function rgba(name) {
  const value = token(name);
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map(c => c + c).join('') : hex[1];
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
  }
  const fn = value.match(/^rgba?\(([^)]*)\)$/i);
  if (fn) {
    const [r, g, b, a] = fn[1].split(/[\s,/]+/).filter(Boolean);
    const part = (p, full) => (p.endsWith('%') ? parseFloat(p) / 100 : parseFloat(p) / full);
    return [part(r, 255), part(g, 255), part(b, 255), a === undefined ? 1 : part(a, 1)];
  }
  throw new Error(`css/tokens.css: ${name} should be a colour (#hex, rgb() or rgba()), not "${value}"`);
}

// A colour token for three.js materials and lights
export function color(name) {
  const [r, g, b] = rgba(name);
  return new THREE.Color().setRGB(r, g, b, THREE.SRGBColorSpace);
}

// A colour token as a GLSL vec3, for shaders that write their colours directly
const glslFloat = v => (Number.isInteger(v) ? v.toFixed(1) : String(v));
export const vec3 = name => `vec3(${rgba(name).slice(0, 3).map(glslFloat).join(', ')})`;

// A colour token for the canvas; with an alpha, the token's colour at that alpha
export function paint(name, alpha) {
  if (alpha === undefined) return token(name);
  const [r, g, b] = rgba(name).map(c => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
