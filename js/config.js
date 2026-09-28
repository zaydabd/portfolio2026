/* ==========================================================================
   WAN ZAYD ABDULLAH: the content and settings you might want to change.
   Colours, fonts and spacing are in css/tokens.css.
   ========================================================================== */

// Shown in the top corners
export const PERSON = {
  name: "Wan Zayd Abdullah",
  title: "OutSystems Technical Lead",
  linkedin: "https://www.linkedin.com/in/wan-zayd-abdullah-690033230/",
};

// Your career: one chapter per company bulb (bulbs 1–4, left to right, newest first).
// Every fact comes from your own words or portfolio-references/; career-sources.md says which.
// The words and layout of each chapter are in chapters/<folder>/<folder>.html, its own styles in <folder>.css.
//   folder    the company's folder in chapters/
//   title, role, dates   the chapter list for keyboards and screen readers
//   sign      the wooden tag under the bulb; phones and tablets show a small one with the logo only
//             sign.logo names a file in assets/marks (avepoint → assets/marks/avepoint.png)
// To add a company: a new folder in chapters/, an entry here, and its <link> in index.html (up to 7 bulbs).
export const CAREER = [
  {
    folder: "avepoint",
    title: "AvePoint",
    role: "Technical Lead",
    dates: "Jan 2026 – present",
    sign: {
      logo: "avepoint",
      dates: "2026 – PRESENT",
      role: ["TECHNICAL LEAD"],
      ring: true,
    },
  },
  {
    folder: "maybank",
    title: "Maybank",
    role: "Senior OutSystems Engineer",
    dates: "Sep 2024 – Jan 2026",
    sign: {
      logo: "maybank",
      dates: "2024 – 2026",
      role: ["SENIOR OUTSYSTEMS", "ENGINEER"],
      ring: true,
    },
  },
  {
    folder: "fpt",
    title: "FPT Software",
    role: "Software Consultant",
    dates: "Sep 2022 – Sep 2024",
    sign: {
      logo: "fpt",
      dates: "2022 – 2024",
      role: ["SOFTWARE", "CONSULTANT"],
      ring: true,
    },
  },
  {
    folder: "impact",
    title: "Impact Business Solutions",
    role: "Software Consultant",
    dates: "Apr 2021 – May 2022",
    sign: {
      logo: null,
      name: ["IMPACT", "BUSINESS SOLUTIONS"],
      dates: "2021 – 2022",
      role: ["SOFTWARE", "CONSULTANT"],
      ring: false,
    },
  },
];

export const CONFIG = {
  // One wind moves everything. Gusts roll across the screen from left to right.
  wind: {
    strength: 1, // overall wind (0 = still, 2 = double)
    breeze: 0.2, // gentle sway between gusts
    gustSpeed: 240, // how fast a gust crosses the screen, in picture pixels per second
    gustSize: 380, // how wide a gust is, in picture pixels
    gustEvery: 8, // seconds between gusts
  },
  sway: {
    // how strongly each thing answers the wind (0 = still, 2 = double)
    cable: 1,
    bulbs: 1,
    grass: 1,
    speed: 1, // wind clock: 2 = everything happens twice as fast
  },
  grass: {
    // grass blades built in code, across the front of the picture
    count: 2400, // blades on desktop
    phoneCount: 2000, // blades on phones (spread over the whole picture for the carousel)
    height: 1, // blade height (1 = about 0.5 to 1 m)
    seedHeads: 0.04, // share of front blades that are tall stalks with seed heads
    depth: 10, // how far back the blades reach, in metres; the painted field takes over after that
    floorShade: 0.6, // painted grass under the blades is darkened to this (1 = unchanged)
    lampWarmth: 1, // extra warm tint on blades near the lamps
  },
  glow: {
    size: 5.5, // glow diameter, in bulb widths
    opacity: 0.9, // 0 to 1
    hover: 1.15, // glow growth while the mouse is on a bulb
    lit: 1.7, // glow growth once a bulb is clicked
    time: 0.3, // seconds a clicked bulb takes to brighten
  },
  switchOn: 0.16, // seconds between bulbs switching on when the page opens
  signs: {
    // wooden tags hanging under the company bulbs, in picture pixels (colours: css/tokens.css)
    width: 150,
    height: 118,
    minWidth: 139, // desktop: never smaller than this on screen, in CSS pixels, so the lettering stays readable
    phone: { width: 100, height: 56 }, // phones and tablets: a small tag with the logo only
    cord: 22, // cord between the glass and the tag
    grain: 0.28, // how strong the wood grain is (0 = plain plank)
  },
  sheet: {
    grassOverlap: 40, // desktop: how far the reading area may reach into the top of the grass, in CSS pixels
  },
  parallax: {
    // mouse parallax: how far each layer drifts, in picture pixels
    plate: 3,
    grass: 4,
    objects: 10,
  },
  // Which part of the picture stays on screen when the window isn't 4:3.
  // 0 = keep the left / top edge, 1 = keep the right / bottom edge.
  crop: { x: 0.5, y: 0.32 },

  // Bulb glass centres measured on night.png (pixels), left to right.
  // w = glass width in pixels on night.png; it sets each bulb's size.
  bulbs: [
    { x: 186.5, y: 219, w: 25.6 },
    { x: 461.5, y: 216.5, w: 24.1 },
    { x: 698, y: 201.5, w: 22.3 },
    { x: 899.5, y: 195, w: 22.7 },
    { x: 1093.5, y: 172, w: 21.1 },
    { x: 1250, y: 156.5, w: 19.4 },
    { x: 1328.5, y: 199, w: 20.4 },
  ],

  // Cable path on night.png as [x, y] points, left of the pole and right of it.
  cable: {
    left: [
      [-300, 129.7],
      [-150, 133.4],
      [0, 136.7],
      [100, 138.5],
      [200, 139.8],
      [300, 140.5],
      [400, 140.5],
      [500, 139.6],
      [600, 137.7],
      [700, 134.6],
      [800, 130.1],
      [900, 124.1],
      [1000, 116.4],
      [1100, 106.7],
      [1180, 97.5],
      [1224, 91.8],
    ],
    right: [
      [1238, 88.7],
      [1260, 100.5],
      [1300, 121.6],
      [1332, 138.1],
      [1400, 171.8],
      [1447, 194.2],
      [1550, 240.5],
      [1700, 301.2],
    ],
  },

  // Metal pole on night.png: centre of its top and of the bottom edge, and its width at each.
  pole: { top: [1237.7, 80], bottom: [1281.5, 1086], width: [28, 30] },
};
