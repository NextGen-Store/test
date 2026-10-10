// renderMenu.js — data loading and HTML rendering (no DOM state lives here).

import { icon, iconInner } from './icons.js';

const DATA_URL = 'assets/data.json';

export async function loadData() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${DATA_URL} (HTTP ${res.status})`);
  return res.json();
}

/* ---------- helpers ---------- */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Lowercase + strip accents so "cafe" matches "café".
export const normalize = (s) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').trim();

export const BADGES = {
  veg: { icon: 'leaf', label: 'Vegetarian' },
  spicy: { icon: 'chili', label: 'Spicy' },
  popular: { icon: 'star', label: 'Popular' },
};

// Rounded SVG category icon (drawn glyph inside a circle).
export function categoryIcon(name, size = 56) {
  return `<svg class="cat-svg" viewBox="0 0 56 56" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    <circle class="cat-svg-bg" cx="28" cy="28" r="26"/>
    <g transform="translate(14 14) scale(1.1667)">${iconInner(name)}</g>
  </svg>`;
}

const menuOf = (data, catId) => data.categories.find((c) => c.id === catId);

/* ---------- Home ---------- */

export function renderHeroSlides(data) {
  return data.hero.slides
    .map(
      (s, i) => `<img class="hero-slide${i === 0 ? ' is-active' : ''}" src="${esc(s.image)}" alt="${esc(s.alt)}"
        ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
    )
    .join('');
}

export function renderHeroDots(data) {
  return data.hero.slides.map((_, i) => `<span class="hero-dot${i === 0 ? ' is-active' : ''}"></span>`).join('');
}

export function renderCatIcons(data) {
  return data.categories
    .map(
      (c) => `<li><button class="cat-icon" type="button" data-menu="${esc(c.menu)}" data-cat="${esc(c.id)}">
        ${categoryIcon(c.icon)}
        <span>${esc(c.name)}</span>
      </button></li>`
    )
    .join('');
}

export function renderActions(data) {
  const b = data.business;
  const hours = b.hours.display
    .map((h) => `<div class="hours-row"><dt>${esc(h.label)}</dt><dd>${esc(h.value)}</dd></div>`)
    .join('');
  return `
    <h2 class="actions-title">Order & visit</h2>
    <div class="actions-buttons">
      <a class="btn btn-primary" href="tel:${esc(b.phone)}">${icon('phone', { size: 18 })}<span>Call for Delivery</span></a>
      <a class="btn btn-ghost" href="${esc(b.mapsUrl)}" target="_blank" rel="noopener">${icon('pin', { size: 18 })}<span>Open in Google Maps</span></a>
    </div>
    <p class="actions-address">${esc(b.address)}</p>
    <h3 class="hours-title">Opening hours</h3>
    <dl class="hours">${hours}</dl>`;
}

/* ---------- Menu ---------- */

export function renderMenuToggle(data, activeMenu) {
  return data.menus
    .map(
      (m) => `<button class="toggle-btn" type="button" role="tab" data-menu="${esc(m.id)}"
        aria-selected="${m.id === activeMenu}">${esc(m.label)}</button>`
    )
    .join('');
}

export function renderPills(data, menuId, activeCat) {
  const cats = data.categories.filter((c) => c.menu === menuId);
  const all = `<button class="pill${activeCat === 'all' ? ' is-active' : ''}" type="button" data-cat="all" aria-pressed="${activeCat === 'all'}">All</button>`;
  const rest = cats
    .map(
      (c) => `<button class="pill${activeCat === c.id ? ' is-active' : ''}" type="button" data-cat="${esc(c.id)}" aria-pressed="${activeCat === c.id}">
        ${icon(c.icon, { size: 18 })}<span>${esc(c.name)}</span></button>`
    )
    .join('');
  return all + rest;
}

function renderBadges(badges = []) {
  return badges
    .filter((k) => BADGES[k])
    .map((k) => `<span class="badge badge-${k}" role="img" aria-label="${BADGES[k].label}" title="${BADGES[k].label}">${icon(BADGES[k].icon, { size: 16 })}</span>`)
    .join('');
}

// Keep the badges glued to the last word so they never wrap onto a line alone.
function nameWithBadges(item) {
  const name = String(item.name);
  const cut = name.lastIndexOf(' ') + 1;
  return `${esc(name.slice(0, cut))}<span class="nowrap">${esc(name.slice(cut))}${renderBadges(item.badges)}</span>`;
}

function renderItem(item, cat, currency) {
  const search = normalize(
    [item.name, item.description, cat.name, ...(item.badges || []).map((b) => BADGES[b]?.label)].join(' ')
  );
  return `<li class="item" data-id="${esc(item.id)}" data-search="${esc(search)}">
    <div class="item-inner">
      <div class="item-head">
        <h3 class="item-name">${nameWithBadges(item)}</h3>
        <span class="leader" aria-hidden="true"></span>
        <span class="item-price">${esc(item.price)}<span class="cur"> ${esc(currency)}</span></span>
      </div>
      <p class="item-desc">${esc(item.description)}</p>
    </div>
  </li>`;
}

export function renderLegend() {
  return `<p class="legend" aria-label="Legend">
    ${Object.values(BADGES).map((b) => `<span class="legend-item legend-${b.icon}">${icon(b.icon, { size: 15 })}${b.label}</span>`).join('')}
  </p>`;
}

export function renderMenuSections(data) {
  const currency = data.business.currency;
  let flip = 0;
  const html = data.categories
    .map((cat) => {
      const items = data.items.filter((i) => i.category === cat.id);
      if (!items.length) return '';
      const hasImage = Boolean(cat.image);
      const side = flip++ % 2 ? 'is-flip' : '';
      const figure = hasImage
        ? `<figure class="cat-figure"><img src="${esc(cat.image)}" alt="${esc(cat.imageAlt)}" loading="lazy" decoding="async"></figure>`
        : '';
      return `<section class="cat ${side}" id="cat-${esc(cat.id)}" data-menu="${esc(cat.menu)}" data-cat="${esc(cat.id)}" aria-labelledby="h-${esc(cat.id)}">
        <header class="cat-head">
          <h2 class="cat-title" id="h-${esc(cat.id)}">${esc(cat.name)}</h2>
          ${cat.blurb ? `<p class="cat-blurb">${esc(cat.blurb)}</p>` : ''}
        </header>
        <div class="cat-body${hasImage ? '' : ' no-image'}">
          ${figure}
          <ul class="items">${items.map((i) => renderItem(i, menuOf(data, i.category), currency)).join('')}</ul>
        </div>
      </section>`;
    })
    .join('');
  return renderLegend() + html;
}
