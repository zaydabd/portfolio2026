// A chapter as HTML, in parts, from CAREER (js/config.js).
// Every piece of text takes one of the five type roles (css/base.css); the layout is css/chapters.css and css/phone.css.
import { CAREER } from '../config.js';
import { MARKS, markImages } from '../utils/assets.js';
import { ART, teamDots } from './drawings.js';

// A logo beside text that already names it. Without a height, wide wordmarks and compact symbols get the same area.
const markDeco = (name, h) => {
  const im = markImages[name], a = im ? im.width / im.height : 4;
  h = h || Math.max(11, Math.min(18, Math.sqrt(1500 / a)));
  const w = h * a;
  return `<span class="mark" aria-hidden="true" style="--mark:url('${MARKS[name]}');width:${w.toFixed(1)}px;height:${h}px"></span>`;
};
// A logo in the logo row: wide wordmarks and compact symbols get the same area, so none shouts over the others
const logoHTML = name => {
  const im = markImages[name], a = im ? im.width / im.height : 4, h = Math.sqrt(4200 / a);
  return `<span class="mark" aria-hidden="true" style="--mark:url('${MARKS[name]}');--w:${(h * a).toFixed(1)}px;--h:${h.toFixed(1)}px"></span>`;
};
// Tools: the OutSystems logo stands in for its name
const toolsHTML = ([first, ...rest]) => {
  const os = first.startsWith('OutSystems ');
  return `<p class="ch-tools type-detail">${os ? `${markDeco('outsystems', 13)}<span class="sr">OutSystems </span>${first.slice(11)}` : first}${rest.map(t => `, ${t}`).join('')}</p>`;
};
const factsHTML = facts => `<div class="ch-facts" style="--n:${facts.length}">${facts.map(([k, v, team]) =>
  `<dl class="fact"><dt class="type-detail">${k}</dt><dd class="type-text">${team ? teamDots(team) : ''}${v}</dd></dl>`).join('')}</div>`;
// A smaller project: a picture, its name, then its details (a few side by side), or a small glyph beside its name (a list)
const tileHTML = (t, moon) => `<li class="tile">
    <div class="t-art">${ART[t.art] || ''}</div>
    <h3 class="${moon ? 'type-moon' : 'type-name'}">${t.name}</h3>
    ${[t.meta, t.line, t.tools].filter(Boolean).map(x => `<p class="type-detail">${x}</p>`).join('')}
  </li>`;
const projHTML = t => `<li class="proj"><div class="p-head">${ART[t.art] || ''}<h3 class="type-name">${t.name}</h3></div><p class="type-detail">${t.line}</p></li>`;

// A chapter's parts: the introduction, the main project in detail, a second project, the smaller projects
function chapterScenes(c) {
  const logos = c.logos.length ? `<h1 class="ch-logos">${c.logos.map(logoHTML).join('')}<span class="sr">${c.title}</span></h1>` : '';
  const head = `<div class="ch-head">
      ${c.logos.length ? '' : `<h1 class="type-name">${c.title}</h1>`}
      <p class="type-name">${c.role}</p>
      <p class="ch-when type-detail">${c.dates}, ${c.kind}</p>
      ${c.where ? `<p class="type-detail">${c.where}</p>` : ''}
      ${c.lead ? `<p class="ch-lead type-text">${c.lead}</p>` : ''}
    </div>`;
  if (!c.project) return [{ name: 'Introduction', cls: 's-title s-solo', html: `${logos}${head}
      <ul class="ch-tiles">${c.also.map(t => tileHTML(t)).join('')}</ul>
      ${c.aside ? `<div class="ch-aside"><p class="type-detail">${c.aside.dates}</p><p class="type-detail">${c.aside.text}</p></div>` : ''}` }];
  const p = c.project;
  const scenes = [{ name: 'Introduction', cls: 's-title', html: `${logos}${head}
      <div class="ch-project"><h2 class="type-name">${p.name}</h2><p class="type-text">${p.lead}</p></div>` },
    { name: p.short, cls: 's-inside', html: `
      <h2 class="ch-kicker type-name">${p.short}</h2>
      ${factsHTML(p.facts)}
      ${toolsHTML(p.tools)}` }];
  if (c.more) scenes.push({ name: c.more.name, cls: 's-more', html: `
      <div class="ch-project"><h2 class="type-name">${c.more.name}</h2><p class="type-text">${c.more.lead}</p></div>
      <figure class="ch-art">${ART[c.more.art]}</figure>
      ${factsHTML(c.more.facts)}
      ${toolsHTML(c.more.tools)}` });
  if (c.also.length) {
    const few = c.also.length < 3;
    scenes.push({ name: c.alsoTitle || c.alsoName, cls: `s-also${few ? ' few' : ''}${c.moon ? ' s-moon' : ''}`, html: `
      ${c.alsoTitle ? `<div class="ch-also"><h2 class="type-detail">${c.alsoTitle}</h2></div>` : `<h2 class="sr">${c.alsoName}</h2>`}
      ${few ? `<ul class="ch-tiles">${c.also.map(t => tileHTML(t, c.moon)).join('')}</ul>` : `<ul class="ch-projs">${c.also.map(projHTML).join('')}</ul>`}` });
  }
  return scenes;
}

// Chapter i as HTML. Each part ends with a link named after what comes next: the next part, or the next chapter.
export function chapterHTML(i) {
  const scenes = chapterScenes(CAREER[i]), next = CAREER[i + 1];
  return scenes.map((sc, k) => `<section class="scene ${sc.cls}" aria-label="${sc.name}">${sc.html}
      ${k < scenes.length - 1 ? `<button class="ch-next type-link" type="button" data-go="${k + 1}">${scenes[k + 1].name}</button>`
        : next ? `<button class="ch-next ch-end type-link" type="button" data-chapter="${i + 1}">${next.title}</button>` : ''}
    </section>`).join('');
}
