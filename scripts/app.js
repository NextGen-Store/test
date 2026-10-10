// app.js — tab switching, UI state, live search, status bar, hero carousel, theme.
import { icon } from './icons.js';
import {
  loadData, normalize, esc,
  renderHeroSlides, renderHeroDots, renderCatIcons, renderActions,
  renderMenuToggle, renderPills, renderMenuSections,
} from './renderMenu.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = { data: null, view: 'home', menu: 'food', category: 'all', query: '' };
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- theme ---------------- */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#121212' : '#FFFBF5';
  const btn = $('#themeToggle');
  btn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon', { size: 18 });
  btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function initTheme() {
  let theme = 'dark';
  try { theme = localStorage.getItem('menu-theme') || 'dark'; } catch { /* storage unavailable */ }
  applyTheme(theme);
  $('#themeToggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('menu-theme', next); } catch { /* ignore */ }
  });
}

/* ---------------- layout helpers ---------------- */

function setHeaderHeight() {
  const h = $('#siteHeader').offsetHeight;
  document.documentElement.style.setProperty('--header-h', `${h}px`);
  const s = $('#menuSticky').offsetHeight;
  document.documentElement.style.setProperty('--sticky-h', `${s}px`);
}

/* ---------------- views / tabs ---------------- */

function setView(view, { push = true } = {}) {
  state.view = view;
  for (const v of ['home', 'menu']) {
    $(`#view-${v}`).hidden = v !== view;
    const tab = $(`#tab-${v}`);
    tab.setAttribute('aria-selected', String(v === view));
    tab.tabIndex = v === view ? 0 : -1;
  }
  if (push && history.state?.view !== view) history.pushState({ view }, '', `#${view}`);
  window.scrollTo({ top: 0 });
  requestAnimationFrame(setHeaderHeight);
}

function initTabs() {
  const tabs = $$('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      setView(next.dataset.view);
    });
  });
  window.addEventListener('popstate', (e) => {
    const view = e.state?.view || (location.hash === '#menu' ? 'menu' : 'home');
    setView(view, { push: false });
  });
  $$('[data-goto-menu]').forEach((b) => b.addEventListener('click', () => setView('menu')));
}

/* ---------------- menu: toggle, pills, search ---------------- */

function renderMenuControls() {
  $('#menuToggle').innerHTML = renderMenuToggle(state.data, state.menu);
  $('#pills').innerHTML = renderPills(state.data, state.menu, state.query ? 'all' : state.category);
}

function applyFilters() {
  const q = normalize(state.query);
  let visibleSections = 0;

  $$('.cat').forEach((section) => {
    const inMenu = section.dataset.menu === state.menu;
    const inCategory = q || state.category === 'all' || section.dataset.cat === state.category;
    let visibleItems = 0;

    $$('.item', section).forEach((item) => {
      const match = !q || item.dataset.search.includes(q);
      item.classList.toggle('is-hidden', !match);
      item.inert = !match;
      if (match) visibleItems++;
    });

    const show = inMenu && inCategory && visibleItems > 0;
    section.classList.toggle('is-hidden', !show);
    section.inert = !show;
    if (show) visibleSections++;
  });

  $('#menuList .legend')?.classList.toggle('is-hidden', visibleSections === 0);
  $('#empty').hidden = visibleSections > 0;
  $('#emptyQ').textContent = state.query.trim();

  $$('.pill').forEach((p) => {
    const active = p.dataset.cat === (q ? 'all' : state.category);
    p.classList.toggle('is-active', active);
    p.setAttribute('aria-pressed', String(active));
  });
  requestAnimationFrame(setHeaderHeight);
}

function scrollMenuIntoView() {
  const target = $('#menuToggle');
  const top = target.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || 0);
  if (window.scrollY > top) window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function setMenu(menuId) {
  state.menu = menuId;
  state.category = 'all';
  renderMenuControls();
  applyFilters();
}

function goToCategory(menuId, catId) {
  state.query = '';
  $('#search').value = '';
  state.menu = menuId;
  state.category = catId;
  renderMenuControls();
  applyFilters();
  setView('menu');
}

function initMenu() {
  $('#menuList').innerHTML = renderMenuSections(state.data);
  renderMenuControls();
  applyFilters();

  $('#menuToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-menu]');
    if (btn && btn.dataset.menu !== state.menu) setMenu(btn.dataset.menu);
  });

  $('#pills').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.query = '';
    $('#search').value = '';
    state.category = btn.dataset.cat;
    applyFilters();
    scrollMenuIntoView();
  });

  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    applyFilters();
  });

  $('#catIcons').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (btn) goToCategory(btn.dataset.menu, btn.dataset.cat);
  });
}

/* ---------------- status bar ---------------- */

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

function minutesNow(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).formatToParts(new Date());
    return Number(parts.find((p) => p.type === 'hour').value) * 60 + Number(parts.find((p) => p.type === 'minute').value);
  } catch {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}

function updateStatus() {
  const { hours } = state.data.business;
  const now = minutesNow(hours.timezone);
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const isOpen = open < close ? now >= open && now < close : now >= open || now < close;
  const minsToClose = (close - now + 1440) % 1440;

  const el = $('#status');
  el.classList.toggle('is-open', isOpen);
  el.classList.toggle('is-soon', isOpen && minsToClose <= 30);
  $('#statusLabel').textContent = isOpen
    ? (minsToClose <= 30 ? `Closing soon · ${hours.close}` : `Open now · until ${hours.close}`)
    : `Closed · opens ${hours.open}`;
}

/* ---------------- hero carousel ---------------- */

function initCarousel() {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  if (slides.length < 2) return;
  let i = 0;
  let timer = null;

  const show = (n) => {
    slides[i].classList.remove('is-active');
    dots[i].classList.remove('is-active');
    i = n % slides.length;
    slides[i].classList.add('is-active');
    dots[i].classList.add('is-active');
  };
  const start = () => { if (!timer && !reduceMotion) timer = setInterval(() => show(i + 1), 5000); };
  const stop = () => { clearInterval(timer); timer = null; };

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

/* ---------------- boot ---------------- */

function fillStaticText() {
  const { business: b, hero } = state.data;
  document.title = `${b.name} | Menu`;
  $('#heroEyebrow').textContent = hero.eyebrow || b.name;
  $('#heroTitle').textContent = hero.headline;
  $('#heroSub').textContent = hero.subline || b.tagline;
  $('#mapLink').href = b.mapsUrl;
  $('#phoneLink').href = `tel:${b.phone}`;
  $('#phoneText').textContent = b.phoneDisplay;
  $('#footerText').innerHTML = `© ${new Date().getFullYear()} ${esc(b.name)} · Prices in ${esc(b.currency)}`;
}

async function init() {
  initTheme();
  initTabs();
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);

  try {
    state.data = await loadData();
  } catch (err) {
    console.error(err);
    const box = $('#loadError');
    box.hidden = false;
    box.textContent = location.protocol === 'file:'
      ? 'The menu data could not be loaded. Browsers block this when the page is opened as a file. Serve the folder over http (for example: python3 -m http.server) and open it again.'
      : 'Sorry, the menu could not be loaded. Please refresh the page.';
    $('#statusLabel').textContent = 'Menu unavailable';
    return;
  }

  fillStaticText();
  $('#heroSlides').innerHTML = renderHeroSlides(state.data);
  $('#heroDots').innerHTML = renderHeroDots(state.data);
  $('#catIcons').innerHTML = renderCatIcons(state.data);
  $('#actions').innerHTML = renderActions(state.data);

  initMenu();
  initCarousel();
  updateStatus();
  setInterval(updateStatus, 60_000);

  const startView = location.hash === '#menu' ? 'menu' : 'home';
  history.replaceState({ view: startView }, '', `#${startView}`);
  setView(startView, { push: false });
  setHeaderHeight();
}

init();
