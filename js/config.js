/* ==========================================================================
   WAN ZAYD ABDULLAH: the content and settings you might want to change.
   Colours, fonts and spacing are in css/tokens.css.
   ========================================================================== */

// Shown in the top corners
export const PERSON = {
  name: 'Wan Zayd Abdullah',
  title: 'OutSystems Technical Lead',
  linkedin: 'https://www.linkedin.com/in/wan-zayd-abdullah-690033230/'
};

// Your career: one chapter per company bulb (bulbs 1–4, left to right, newest first).
// Every fact comes from your own words or portfolio-references/; career-sources.md says which.
//   sign      the wooden tag under the bulb; phones and tablets show a small one with the logo only
//   title     the company; its logo row shows instead when `logos` is set (the company first, then its clients)
//   role, dates, kind   shown under the logos
//   where     who the work was for, or the team, in words
//   lead      a short opening line, for a chapter without a main project
//   project   the main project: name and lead (a sentence or two) in the first part; short (its short name),
//             facts ([label, text, team]) and tools in a part of its own
//             team = { size, devs, open } draws the team as dots: devs in gold, the first ringed as you
//   more      a second project: name, lead, art (a drawing, see js/ui/drawings.js), facts and tools, in a part of its own
//   also      smaller projects, each a name with a line or two under it: { name, line, art, meta, tools }
//   alsoTitle a heading over them, or alsoName to name the part without a heading; moon: true shows it by moonlight
//   logos and sign.logo name files in assets/marks (avepoint → assets/marks/avepoint.png)
//   aside     a small closing line, such as a career break
export const CAREER = [
  {
    sign: { logo: 'avepoint', dates: '2026 – PRESENT', role: ['TECHNICAL LEAD'], ring: true },
    title: 'AvePoint', logos: ['avepoint', 'sunway', 'sunway-education'],
    role: 'Technical Lead',
    dates: 'Jan 2026 – present', kind: 'full-time',
    where: 'For Sunway Digital Hub, stationed at Sunway University',
    project: {
      name: 'iZone, Sunway University’s student portal', short: 'iZone',
      lead: 'The legacy portal buckled every peak season. I led the rebuild, which holds up to 60k enrolments sustained over an hour.',
      facts: [
        ['Scope', 'A large portal: around four enrolment modules, plus a student profile and a dashboard.'],
        ['Team', 'Ten on the project, three of us developers.', { size: 10, devs: 3 }],
        ['Hats I wore', 'Technical lead, developer, business analyst and solution architect.']
      ],
      tools: ['OutSystems ODC', '.NET (iZone API layer)']
    },
    more: {
      name: 'Sunway City', short: 'Sunway City', art: 'responsive',
      lead: 'A mobile-responsive version of the Sunway City website.',
      facts: [
        ['Team', 'Four developers within a larger project team.', { devs: 4, open: true }],
        ['My role', 'Senior developer. I helped build the mobile version, and helped solve complex requirements and issues.']
      ],
      tools: ['OutSystems ODC']
    },
    also: []
  },
  {
    sign: { logo: 'maybank', dates: '2024 – 2026', role: ['SENIOR OUTSYSTEMS', 'ENGINEER'], ring: true },
    title: 'Maybank', logos: ['maybank'],
    role: 'Senior OutSystems Engineer',
    dates: 'Sep 2024 – Jan 2026', kind: 'full-time',
    where: 'Platform and Delivery teams, Digitalisation and Automation Department',
    project: {
      name: 'Digital Form', short: 'Digital Form',
      lead: 'Maybank’s in-house answer to Google Forms, built for sensitive data that can’t be hosted on external SaaS.',
      facts: [
        ['My role', 'Sole developer. I led the technical and business design, through to implementation.', { devs: 1 }],
        ['How it grew', 'Extensible question types. Each of five MVP cycles added types and features, and stabilised the platform.'],
        ['Outcome', 'By MVP 5: over 80 forms, thousands of submissions, and four other applications using it.']
      ],
      tools: ['OutSystems O11']
    },
    alsoName: 'Other projects',
    also: [
      { name: 'CAB-Q', art: 'queue', line: 'Maybank’s internal app for deployment approvals. It cut a daily 6-hour process to 30 minutes.' },
      { name: 'Audit Log', art: 'log', line: 'One standard audit log for every OutSystems application at Maybank, for traceability and compliance.' },
      { name: 'Tokenizer', art: 'token', line: 'A platform component that tokenises public display strings, backed by an encrypted database to keep data private.' },
      { name: 'MPowered', art: 'board', line: 'Maybank’s internal agile project management platform. I resolved recurring defects in its core modules, improving stability and performance.' },
      { name: 'RPSST', art: 'swap', line: 'An OutSystems prototype to replace legacy transaction processes in Maybank’s RBS system.' }
    ]
  },
  {
    sign: { logo: 'fpt', dates: '2022 – 2024', role: ['SOFTWARE', 'CONSULTANT'], ring: true },
    title: 'FPT Software', logos: ['fpt', 'petronas'],
    role: 'Software Consultant',
    dates: 'Sep 2022 – Sep 2024', kind: 'contract',
    where: 'Placed at PETRONAS Digital, on the financing and auditing software team',
    project: {
      name: 'MyInsights', short: 'MyInsights',
      lead: 'Auditors checked exceptions by hand, on files and paper. MyInsights detects exceptions and anomalies automatically, and brings them into one system.',
      facts: [
        ['Team', 'One of four developers.', { size: 4, devs: 4 }],
        ['What I built', 'Nearly every area but email: user management, permissions, the auditing screens from Figma designs, and parts of the audit rules and data sync.'],
        ['Scale', 'I optimised the business logic to run millions of records through the audit rules.'],
        ['Data from', 'Finance, Assets, Maintenance, Procurement and other departments.']
      ],
      tools: ['OutSystems O11']
    },
    alsoTitle: 'Moonlighting', moon: true,
    also: [
      { name: 'Adam Digital Assets', art: 'signage', meta: 'May – Jul 2024, part-time, remote',
        line: 'A mosque signage app with management features, plus its website twin. Another developer and I wrote the requirements, then designed and built both.',
        tools: 'Flutter' }
    ]
  },
  {
    sign: { logo: null, name: ['IMPACT', 'BUSINESS SOLUTIONS'], dates: '2021 – 2022', role: ['SOFTWARE', 'CONSULTANT'], ring: false },
    title: 'Impact Business Solutions', logos: [],
    role: 'Software Consultant',
    dates: 'Apr 2021 – May 2022', kind: 'contract',
    lead: 'Where my working record begins.',
    project: null,
    also: [
      { name: 'VIP Dashboard', art: 'map', line: 'A static web dashboard of Sarawak data, which I processed and visualised for a VIP presentation.', tools: 'Power BI, QGIS' },
      { name: 'QR Asset Management', art: 'qr', line: 'Real-time asset tracking by QR code, built on a Firebase backend.', tools: 'Flutter, Firebase' }
    ],
    aside: { dates: 'Apr – Aug 2022', text: 'A career break, for a personal goal.' }
  }
];

export const CONFIG = {
  // One wind moves everything. Gusts roll across the screen from left to right.
  wind: {
    strength: 1,     // overall wind (0 = still, 2 = double)
    breeze: 0.2,     // gentle sway between gusts
    gustSpeed: 240,  // how fast a gust crosses the screen, in picture pixels per second
    gustSize: 380,   // how wide a gust is, in picture pixels
    gustEvery: 8     // seconds between gusts
  },
  sway: {            // how strongly each thing answers the wind (0 = still, 2 = double)
    cable: 1,
    bulbs: 1,
    grass: 1,
    speed: 1         // wind clock: 2 = everything happens twice as fast
  },
  grass: {           // grass blades built in code, across the front of the picture
    count: 2400,     // blades on desktop
    phoneCount: 2000,// blades on phones (spread over the whole picture for the carousel)
    height: 1,       // blade height (1 = about 0.5 to 1 m)
    seedHeads: 0.04, // share of front blades that are tall stalks with seed heads
    depth: 10,       // how far back the blades reach, in metres; the painted field takes over after that
    floorShade: 0.6, // painted grass under the blades is darkened to this (1 = unchanged)
    lampWarmth: 1    // extra warm tint on blades near the lamps
  },
  glow: {
    size: 5.5,       // glow diameter, in bulb widths
    opacity: 0.9,    // 0 to 1
    hover: 1.15,     // glow growth while the mouse is on a bulb
    lit: 1.7,        // glow growth once a bulb is clicked
    time: 0.3        // seconds a clicked bulb takes to brighten
  },
  switchOn: 0.16,    // seconds between bulbs switching on when the page opens
  signs: {           // wooden tags hanging under the company bulbs, in picture pixels (colours: css/tokens.css)
    width: 150,
    height: 118,
    minWidth: 139,   // desktop: never smaller than this on screen, in CSS pixels, so the lettering stays readable
    phone: { width: 100, height: 56 },   // phones and tablets: a small tag with the logo only
    cord: 22,        // cord between the glass and the tag
    grain: 0.28      // how strong the wood grain is (0 = plain plank)
  },
  sheet: {
    grassOverlap: 40 // desktop: how far the reading area may reach into the top of the grass, in CSS pixels
  },
  parallax: {        // mouse parallax: how far each layer drifts, in picture pixels
    plate: 3,
    grass: 4,
    objects: 10
  },
  // Which part of the picture stays on screen when the window isn't 4:3.
  // 0 = keep the left / top edge, 1 = keep the right / bottom edge.
  crop: { x: 0.5, y: 0.32 },

  // Bulb glass centres measured on night.png (pixels), left to right.
  // w = glass width in pixels on night.png; it sets each bulb's size.
  bulbs: [
    { x: 186.5,  y: 219,   w: 25.6 },
    { x: 461.5,  y: 216.5, w: 24.1 },
    { x: 698,    y: 201.5, w: 22.3 },
    { x: 899.5,  y: 195,   w: 22.7 },
    { x: 1093.5, y: 172,   w: 21.1 },
    { x: 1250,   y: 156.5, w: 19.4 },
    { x: 1328.5, y: 199,   w: 20.4 }
  ],

  // Cable path on night.png as [x, y] points, left of the pole and right of it.
  cable: {
    left:  [[-300, 129.7], [-150, 133.4], [0, 136.7], [100, 138.5], [200, 139.8], [300, 140.5],
            [400, 140.5], [500, 139.6], [600, 137.7], [700, 134.6], [800, 130.1], [900, 124.1],
            [1000, 116.4], [1100, 106.7], [1180, 97.5], [1224, 91.8]],
    right: [[1238, 88.7], [1260, 100.5], [1300, 121.6], [1332, 138.1], [1400, 171.8],
            [1447, 194.2], [1550, 240.5], [1700, 301.2]]
  },

  // Metal pole on night.png: centre of its top and of the bottom edge, and its width at each.
  pole: { top: [1237.7, 80], bottom: [1281.5, 1086], width: [28, 30] }
};
