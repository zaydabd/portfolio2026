/* ==========================================================================
   WAN ZAYD ABDULLAH: the settings you might want to change.
   The words are all in index.html: the name, role and LinkedIn in the top corners, each company's caption under
   its bulb, and its section in the sheet (bulbs 1–4, left to right, newest first; career-sources.md says where each
   fact comes from). To add a company: its caption and its section in index.html (one bulb each: --bulb-x in
   css/scene.css).
   Colours, fonts and spacing are in css/tokens.css; where the photo and each 3D model sit is in css/scene.css.
   ========================================================================== */

export const CONFIG = {
  // One wind moves everything. Gusts roll across the screen from left to right.
  wind: {
    strength: 1, // overall wind (0 = still, 2 = double)
    breeze: 0.2, // gentle sway between gusts
    gustSpeed: 240, // how fast a gust crosses the screen, in picture pixels per second
    gustSize: 380, // how wide a gust is, in picture pixels
    gustEvery: 8, // seconds between gusts
    clockWrap: 3600, // wind clock wraps here to keep GPU floats precise
  },
  sway: {
    // how strongly each thing answers the wind (0 = still, 2 = double)
    cable: 1,
    bulbs: 1,
    grass: 1,
    grassMaterial: 6, // multiplier for the painted-grass sway uniform
    speed: 1, // wind clock: 2 = everything happens twice as fast
  },
  grass: {
    // grass blades built in code, across the front of the picture
    count: 2400, // blades on desktop
    phoneCount: 2000, // blades on phones (spread over the whole picture for the carousel)
    height: 1.4, // blade height (1 = about 0.5 to 1 m)
    seedHeads: 0.04, // share of front blades that are tall stalks with seed heads
    depth: 10, // how far back the blades reach, in metres; the painted field takes over after that
    floorShade: 0.6, // painted grass under the blades is darkened to this (1 = unchanged)
    lampWarmth: 1, // extra warm tint on blades near the lamps
  },
  glow: {
    size: 5.5, // glow diameter, in bulb widths
    opacity: 0.9, // 0 to 1
    hover: 1.15, // glow growth while the mouse is on a bulb
    lit: 1.7, // glow growth while a bulb's chapter is open
    time: 0.3, // seconds a bulb takes to brighten when its chapter opens
    hoverTau: 0.08, // smoothing time constant for hover fade
    onTau: 0.07, // smoothing time constant for switch-on ramp
    onThreshold: 0.95, // bulb counts as "on" above this value
    onFloor: 0.6, // glow floor when on-ramp is at 0
    onRange: 0.4, // glow range added as on-ramp reaches 1
    litOpacityBoost: 0.35, // extra opacity when the bulb is lit
  },
  switchOn: 0.16, // seconds between bulbs switching on when the page opens
  parallax: {
    // mouse parallax: how far the lights (and the nearest grass blades) drift, in picture pixels;
    // the photo and its painted grass stay put
    objects: 10,
    tau: 0.35, // smoothing time constant for parallax easing
  },
  physics: {
    stepsPerSecond: 120, // target substep rate for pendulum integration
    damping: 0.16, // pendulum damping ratio (2 × rate × damping)
    breezeCoupling: 0.12, // how much breeze pushes the pendulum sideways
    foreCoupling: 0.05, // fore-aft coupling (fraction of sideways force)
    forePhase: 0.7, // phase offset for fore-aft wind variation
    jitterFreq: 0.9, // base frequency multiplier for per-bulb desync
    jitterSpread: 0.13, // per-bulb frequency increment
    jitterPhase: 2.1, // per-bulb phase offset multiplier
  },
};
