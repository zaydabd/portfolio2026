// The chapters: index.html's #chapter-sheet, one <section data-chapter> per company, as one long scroll. Its scroll decides what the
// page shows: the chapter at its reading line is the open one (state.active), and its bulb, its caption, the
// announcer and, on phones, the photo follow it. Inputs (js/ui/input.js) never set the chapter; they move the scroll
// with goToChapter, pageSheet and scrollSheet. On phones the photo's sideways scroll is synced back the other way:
// a swipe that comes to rest on another company's bulb opens that chapter.
import { state, COMPANIES, FIRST_BULB } from "../state.js";
import { bulbLeft } from "../scene/layout.js";
import { captionEls } from "./captions.js";

export const sheetEl = document.getElementById("chapter-sheet");
const announcerEl = document.getElementById("chapter-announcer");
const photoEl = document.getElementById("photo");

const parts = [...sheetEl.querySelectorAll("section")]; // the sheet's sections, top to bottom
const chapterOf = (part) => +part.dataset.chapter;
const behavior = (instant) => (instant ? "auto" : "smooth");

let shown = false, // the sheet has faded in (it waits for the bulbs to switch on)
  heading = -1; // the chapter a jump is on its way to, which the photo waits for (-1 for none)

// Show the sheet: once the bulbs are on (js/main.js), or as soon as a chapter is opened
export function showSheet() {
  if (shown) return;
  shown = true;
  sheetEl.style.opacity = 1; // fades in (css/base.css)
  startReveal();
  markPart();
}

// The sheet's blocks fade in the first time they scroll into view, and stay (css/base.css .reveal). Those that
// arrive together follow one another, so the first screen cascades in as the sheet appears.
function startReveal() {
  const revealer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e, k) => {
          e.target.style.transitionDelay = `${k * 80}ms`;
          e.target.classList.add("revealed");
          revealer.unobserve(e.target);
        });
    },
    { root: sheetEl, rootMargin: "0px 0px -10% 0px" } // a little above the bottom fade
  );
  sheetEl.classList.add("reveal");
  sheetEl
    .querySelectorAll(".credit-line, .title-card, .credit-rows > div")
    .forEach((el) => revealer.observe(el));
}

// Open chapter i: scroll the sheet to its first part. Phones slide the photo straight to its bulb, and hold the
// slides for the chapters the sheet passes on the way.
export function goToChapter(i, { instant = false } = {}) {
  if (i < 0 || i >= COMPANIES) return;
  showSheet();
  heading = instant || i === state.active ? -1 : i;
  sheetEl.scrollTo({
    top: sheetEl.querySelector(`section[data-chapter="${i}"]`).offsetTop,
    behavior: behavior(instant),
  });
  if (state.carousel) panToBulb(i, { instant });
}

// Keys: a page down (dir 1) or up (dir -1)
export function pageSheet(dir) {
  sheetEl.scrollBy({ top: dir * sheetEl.clientHeight * 0.8, behavior: behavior() });
}

// Wheel: px down (or up, below 0)
export function scrollSheet(px) {
  sheetEl.scrollBy({ top: px });
}

// On every scroll: the top edge's fade (css/base.css --scrolled, grown in over the first 32px so it doesn't pop),
// and which part is showing
sheetEl.addEventListener(
  "scroll",
  () =>
    requestAnimationFrame(() => {
      sheetEl.style.setProperty("--scrolled", Math.min(1, sheetEl.scrollTop / 32));
      markPart();
    }),
  { passive: true }
);

// Which part is showing: the last one whose top has passed 40% down the sheet (or the last, at the very end)
function markPart() {
  if (!shown) return;
  const { scrollTop, clientHeight, scrollHeight } = sheetEl;
  const atEnd = scrollTop + clientHeight >= scrollHeight - 2;
  const current = atEnd
    ? parts.at(-1)
    : parts.findLast((p) => p.offsetTop <= scrollTop + clientHeight * 0.4) ||
      parts[0];
  showChapter(chapterOf(current));
}

// The chapter showing: its bulb and caption light up (js/models/bulbs.js, js/ui/captions.js), screen readers hear
// it, and phones slide the photo to it (unless a jump is on its way to another one)
function showChapter(i) {
  if (i === state.active) return;
  state.active = i;
  announcerEl.textContent = `Showing ${captionEls[i].getAttribute("aria-label")}`;
  captionEls.forEach((c, k) => c.setAttribute("aria-current", k === i));
  if (state.carousel && heading < 0) panToBulb(i);
}

// A jump has landed, or been cut short: the photo catches up with the chapter showing
onRest(sheetEl, () => {
  if (heading < 0) return;
  heading = -1;
  markPart();
  if (state.carousel) panToBulb(state.active);
});

/* ---------- Phones and tablets: the photo's sideways scroll, in step with the chapters ---------- */

// Where the photo scrolls to put chapter i's bulb in the middle of the screen (as near as its edges allow)
function panFor(i) {
  const max = photoEl.scrollWidth - photoEl.clientWidth;
  return Math.min(max, Math.max(0, bulbLeft(i + FIRST_BULB) - photoEl.clientWidth / 2));
}

// Slide the photo so chapter i's bulb is in the middle (on desktop the photo fits the screen, and nothing moves)
export function panToBulb(i, { instant = false } = {}) {
  photoEl.scrollTo({ left: panFor(i), behavior: behavior(instant) });
}

// A swipe that leaves the photo resting nearest another company's bulb opens that chapter; out past the last
// company, towards the pole, it's only looking around. The page's own slides rest on the open chapter's bulb, so
// they never open anything.
onRest(photoEl, () => {
  if (!state.carousel || !shown || heading >= 0) return;
  const at = photoEl.scrollLeft,
    last = panFor(COMPANIES - 1);
  if (at > last + (last - panFor(COMPANIES - 2)) / 2) return;
  let nearest = state.active; // a tie keeps the open chapter
  for (let i = 0; i < COMPANIES; i++)
    if (Math.abs(at - panFor(i)) < Math.abs(at - panFor(nearest))) nearest = i;
  if (nearest !== state.active) goToChapter(nearest);
});

// Call fn whenever el's scroll comes to rest (scrollend, or 150 ms after the last scroll where there's none)
function onRest(el, fn) {
  if ("onscrollend" in window) {
    el.addEventListener("scrollend", fn);
    return;
  }
  let timer = 0;
  el.addEventListener(
    "scroll",
    () => {
      clearTimeout(timer);
      timer = setTimeout(fn, 150);
    },
    { passive: true }
  );
}
