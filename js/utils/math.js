// Small maths helpers

// How much of the way to a target to move this frame: dt = seconds since the last frame, tau = time constant in seconds
export const smooth = (dt, tau) => 1 - Math.exp(-dt / Math.max(tau, 1e-4));

// The part after the decimal point
export const frac = v => v - Math.floor(v);

// Small repeatable random numbers, so the QR pattern and each sign's grain never change
export function seeded(n) {
  return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}

// Another repeatable generator, so the grass field looks the same each visit
export function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
