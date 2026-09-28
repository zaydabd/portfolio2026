// What the page is showing, shared by the 3D scene and the page around it
import { CAREER } from './config.js';

export const state = {
  active: -1,        // the open chapter (-1 until the first one opens)
  hovered: -1,       // the bulb or sign under the mouse, or the chapter with keyboard focus
  tier: 'desktop',   // 'phone', 'tablet' or 'desktop' (see TIER)
  carousel: false    // phones and tablets: swipe along the lights, parts stacked in a card
};

// Bulbs 1 to COMPANIES each hold a chapter
export const COMPANIES = CAREER.length;

// Screen tiers at the standard breakpoints (Tailwind's md 768 px and lg 1024 px):
// phone under 768 px; tablet 768–1023 px, or any upright screen 768 px or wider; desktop 1024 px and up, wider than tall.
// Phones and tablets share the swipe layout (`carousel`); desktop hangs the signs along the cable.
export const TIER = {
  desktop: window.matchMedia('(min-width: 1024px) and (orientation: landscape)'),
  tablet: window.matchMedia('(min-width: 768px)')
};

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
