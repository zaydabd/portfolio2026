// The reading sheet: which chapter is open, its parts, and where the sheet sits on screen.
// Desktop shows one part at a time (scroll, arrow keys or the ticks); phones and tablets stack the parts in a card.
// Scrolling on past a chapter's last part opens the next chapter; back past its first part, the previous one at its end.
import { CONFIG, CAREER } from "../config.js";
import { state, reduceMotion, COMPANIES } from "../state.js";
import { FOCAL, CY, EYE_HEIGHT } from "../scene/picture.js";
import { view, panTo } from "../scene/stage.js";
import { bulbs, glassBottomRow } from "../models/bulbs.js";
import { sizeSigns } from "../models/signs.js";

// Each company's chapter: chapters/<folder>/<folder>.html (the folders are named in CAREER),
// fetched once at start-up so switching chapters stays instant
const chapterFiles = [];
export const loadChapters = () =>
  Promise.all(
    CAREER.map(async (c, i) => {
      const url = new URL(
        `../../chapters/${c.folder}/${c.folder}.html`,
        import.meta.url
      );
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        chapterFiles[i] = await res.text();
      } catch (err) {
        console.error(`Couldn't load ${url}:`, err);
        chapterFiles[i] = `<section class="scene s-title" aria-label="Introduction"><p class="type-detail">Couldn’t load chapters/${c.folder}/${c.folder}.html</p></section>`;
      }
    })
  );

export const careerEl = document.getElementById("career");
const ticksEl = document.getElementById("ticks");
const dotsEl = document.getElementById("dots");
const navEl = document.getElementById("chapters");
const statusEl = document.getElementById("status");

export let sceneEls = [],
  sceneAt = 0; // the open chapter's parts, and the one showing (or being glided to)
let glideUntil = 0,
  glideTo = 0; // when that glide ends, and where
export const edge = { top: 0, bottom: 0 }; // when the sheet reached its top and its bottom (0 = it isn't there)
function trackEdges() {
  const now = performance.now(),
    el = careerEl;
  edge.top = el.scrollTop <= 2 ? edge.top || now : 0;
  edge.bottom =
    el.scrollTop + el.clientHeight >= el.scrollHeight - 2
      ? edge.bottom || now
      : 0;
}

// Fill the sheet with chapter i, opened at its 'start' or at its 'end'
export function renderChapter(i, at = "start") {
  careerEl.dataset.company = CAREER[i].folder; // for the company's own css (chapters/<folder>/<folder>.css)
  careerEl.innerHTML = chapterFiles[i] || "";
  sceneEls = [...careerEl.querySelectorAll(".scene")];
  careerEl.scrollTop = at === "end" ? careerEl.scrollHeight : 0;
  sceneAt = 0;
  glideUntil = 0;
  edge.top = edge.bottom = 0;
  trackEdges();
  ticksEl.replaceChildren(
    ...sceneEls.map((sc, k) => {
      const t = document.createElement("button");
      t.type = "button";
      t.setAttribute(
        "aria-label",
        `Part ${k + 1} of ${sceneEls.length}: ${sc.getAttribute("aria-label")}`
      );
      t.addEventListener("click", () => goScene(k));
      return t;
    })
  );
  ticksEl.classList.toggle("on", sceneEls.length > 1);
  careerEl
    .querySelectorAll(".ch-next")
    .forEach((b) =>
      b.addEventListener("click", () =>
        b.dataset.chapter ? select(+b.dataset.chapter) : goScene(+b.dataset.go)
      )
    );
  if (reduceMotion.matches || state.carousel) {
    sceneEls.forEach((sc) => sc.classList.add("in"));
    markScene();
    hintRest();
  } else
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        markScene();
        hintRest();
      })
    ); // let the first scene fade in
}
function markScene() {
  // which part is showing, from where the sheet is scrolled to
  if (performance.now() < glideUntil) return; // gliding to a part that's already marked
  const y = careerEl.scrollTop + careerEl.clientHeight * 0.4;
  let at = 0;
  sceneEls.forEach((sc, k) => {
    if (sc.offsetTop <= y) at = k;
  });
  showScene(at);
}
function showScene(k) {
  sceneAt = k;
  if (sceneEls[k]) sceneEls[k].classList.add("in");
  [...ticksEl.children].forEach((t, j) =>
    t.setAttribute("aria-current", j === k ? "true" : "false")
  );
}
// Glide to part k. A part taller than the sheet opens at its 'start' or at its 'end'.
export function goScene(k, at = "start") {
  if (!sceneEls.length) return;
  k = Math.max(0, Math.min(sceneEls.length - 1, k));
  showScene(k); // mark it now, and start its fade while it glides in
  const sc = sceneEls[k],
    smooth = !reduceMotion.matches;
  glideUntil = smooth ? performance.now() + 600 : 0;
  glideTo =
    sc.offsetTop +
    (at === "end" ? Math.max(0, sc.offsetHeight - careerEl.clientHeight) : 0);
  careerEl.scrollTo({ top: glideTo, behavior: smooth ? "smooth" : "auto" });
  hintRest();
}
function hintRest() {
  // fade the sheet's edge where the part runs on past it
  const sc = sceneEls[sceneAt],
    c = careerEl,
    top = performance.now() < glideUntil ? glideTo : c.scrollTop;
  c.classList.toggle(
    "more-above",
    !state.carousel && !!sc && top - sc.offsetTop > 2
  );
  c.classList.toggle(
    "more-below",
    !state.carousel &&
      !!sc &&
      sc.offsetTop + sc.offsetHeight - top - c.clientHeight > 2
  );
}
// On to the next chapter's first part (dir 1), or back to the previous chapter's last (dir -1)
let chapterWait = 0;
export function turnChapter(dir) {
  const i = state.active + dir,
    now = performance.now();
  if (state.active < 0 || i < 0 || i >= COMPANIES || now < chapterWait)
    return false;
  chapterWait = now + 900;
  select(i, dir < 0 ? "end" : "start");
  return true;
}
// How far the current part runs on past the sheet's bottom (dir 1) or top (dir -1), in pixels
export function partRest(dir) {
  const sc = sceneEls[sceneAt];
  if (!sc || performance.now() < glideUntil) return 0; // none while gliding to it
  return dir > 0
    ? sc.offsetTop +
        sc.offsetHeight -
        careerEl.scrollTop -
        careerEl.clientHeight
    : careerEl.scrollTop - sc.offsetTop;
}
careerEl.addEventListener(
  "scroll",
  () => {
    trackEdges();
    requestAnimationFrame(() => {
      markScene();
      hintRest();
    });
  },
  { passive: true }
);

// The chapters as a list for keyboards and screen readers, plus the phone dots
CAREER.forEach((c, i) => {
  const b = document.createElement("button");
  b.textContent = `${c.title}, ${c.role}, ${c.dates}`;
  b.addEventListener("focus", () => {
    state.hovered = i;
  });
  b.addEventListener("blur", () => {
    state.hovered = -1;
  });
  b.addEventListener("click", () => select(i));
  navEl.append(b);
  const d = document.createElement("button");
  d.setAttribute("aria-label", c.title);
  d.addEventListener("click", () => select(i));
  dotsEl.append(d);
});

// Open chapter i, at its 'start' or at its 'end'
export function select(i, at = "start") {
  if (i < 0 || i >= COMPANIES || i === state.active) return;
  const first = state.active < 0;
  state.active = i;
  [...dotsEl.children].forEach((d, k) =>
    d.setAttribute("aria-current", k === i ? "true" : "false")
  );
  statusEl.textContent = `Showing ${CAREER[i].title}`;
  if (state.carousel) panTo(i);
  const show = () => {
    renderChapter(i, at);
    careerEl.classList.remove("fading");
  };
  if (first || reduceMotion.matches) {
    show();
    return;
  }
  careerEl.classList.add("fading");
  setTimeout(show, 220);
}

// Place the sheet under the signs. Desktop: from under the lowest sign to just into the grass, content up to
// 960 px wide, stopping short of the pole. Phones and tablets: css/phone.css runs the card down into the grass.
export function layoutCareer() {
  const W = window.innerWidth,
    H = window.innerHeight,
    S = CONFIG.signs;
  const toY = (row) => ((row - view.y) * H) / view.h;
  const toX = (col) => ((col - view.x) * W) / view.w;
  const company = bulbs.slice(0, COMPANIES);
  const k = state.carousel
    ? 1
    : Math.max(1, S.minWidth / ((S.width * H) / view.h));
  sizeSigns(k);
  const below = state.carousel
    ? Math.max(
        ...company.map((b) => glassBottomRow(b) + S.cord + S.phone.height - 9)
      ) // under the small signs
    : Math.max(
        ...company.map((b) => glassBottomRow(b) + S.cord + (S.height - 9) * k)
      ); // under the lowest sign
  const top = Math.max(56, toY(below) + 10);
  careerEl.style.top = `${top}px`;
  if (state.carousel) {
    careerEl.style.height = careerEl.style.left = careerEl.style.width = careerEl.style.transform =
      "";
    hintRest();
    return;
  }
  const grassTop = toY(
    CY + ((EYE_HEIGHT - 0.9 * CONFIG.grass.height) * FOCAL) / CONFIG.grass.depth
  );
  let bottom = Math.min(H - 8, grassTop + CONFIG.sheet.grassOverlap);
  if (bottom - top < 240) bottom = Math.min(H - 8, top + 240); // always room to read
  const P = CONFIG.pole,
    row = view.y + (((top + bottom) / 2) * view.h) / H;
  const poleLeft =
    P.top[0] +
    ((P.bottom[0] - P.top[0]) * (row - P.top[1])) / (P.bottom[1] - P.top[1]) -
    P.width[0] / 2;
  const right = Math.min(W - 24, toX(poleLeft) - 44),
    pad = 64; // pad: clear of the sheet's faded edges
  const width = Math.min(960 + 2 * pad, right - 24);
  const left = 24 + (right - 24 - width) / 2;
  Object.assign(careerEl.style, {
    height: `${bottom - top}px`,
    left: `${left}px`,
    width: `${width}px`,
    transform: "none",
  });
  ticksEl.style.left = `${left + width + 8}px`;
  ticksEl.style.top = `${(top + bottom) / 2}px`;
  hintRest();
}
