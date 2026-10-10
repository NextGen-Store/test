// icons.js — inline SVG icon library (24x24 grid, colour via currentColor).
// No emoji anywhere in the UI: every symbol is drawn here.

const ICONS = {
  // ----- food categories (stroke icons) -----
  pizza: `<path d="M3.5 6.2C9 3.4 15 3.4 20.5 6.2L12 21 3.5 6.2Z"/>
          <path d="M5.6 9.9c4.2-1.9 8.6-1.9 12.8 0"/>
          <circle cx="10" cy="11.6" r="1.1"/><circle cx="14.2" cy="12.4" r="1.1"/><circle cx="12" cy="16" r="1"/>`,
  shawarma: `<path d="M12 1.800v20.400"/>
             <path d="M8.200 6.200c0-1.500 7.600-1.500 7.600 0l1.700 11.800c0 1.800-11 1.800-11 0L8.200 6.200Z"/>
             <path d="M7.600 10.400c2.700 1.200 6.100 1.200 8.800 0M7 14.400c3 1.300 7 1.300 10 0"/>`,
  tacos: `<path d="M3 18.5a9 9 0 0 1 18 0H3Z"/>
          <path d="M6.2 14.6c.9-1.8 2.4-2.2 3.6-1.2.8-1.9 3-2.2 4.1-.6 1.2-.8 2.6-.2 3.5 1.1"/>
          <path d="M3 18.5h18"/>`,
  sandwich: `<g transform="rotate(-22 12 12)">
               <rect x="2" y="8.5" width="20" height="7" rx="3.5"/>
               <path d="M7.5 8.7l1.3 3.2M11.5 8.5l1.3 3.4M15.5 8.7l1.3 3.2"/>
             </g>`,
  burger: `<path d="M4.5 11a7.5 5.5 0 0 1 15 0h-15Z"/>
           <path d="M3.5 14.2c1.6 1.4 3.2 1.4 4.8 0s3.2-1.4 4.8 0 3.2 1.4 4.8 0 1.6-.6 2.6-.6"/>
           <path d="M4.5 17.2h15v.8a2.4 2.4 0 0 1-2.4 2.4H6.9A2.4 2.4 0 0 1 4.5 18v-.8Z"/>
           <path d="M8.5 8.2h.01M12 7.4h.01M15.5 8.2h.01"/>`,
  salad: `<path d="M3 12.5h18c0 4.4-3.9 7.8-9 7.8s-9-3.400-9-7.8Z"/>
          <path d="M6.2 12.3c.4-2.700 2.200-3.800 3.800-3.200 1-2.200 3.200-2.200 4.200 0 1.700-.6 3.400.5 3.700 3.200"/>
          <path d="M9.500 9.400c.3 1 .3 1.900 0 2.800M14 9.300c-.3 1-.2 1.900.2 2.900"/>`,
  drink: `<path d="M6.300 8.500h11.400l-1.200 11.200a1.200 1.200 0 0 1-1.200 1H8.700a1.200 1.200 0 0 1-1.200-1L6.300 8.500Z"/>
          <path d="M5 8.500h14M13 8.500l1.500-5.500h3M7 13h10"/>`,

  // ----- dietary / taste badges -----
  leaf: `<path d="M20 4C10.500 4 5 8.800 5 15c0 1.500.3 2.800.9 3.800C7 19.700 8.400 20 10 20c6.200 0 10-5 10-16Z"/>
         <path d="M5.500 20.500C8.500 14.500 12.500 11 17 9"/>`,
  chili: `<path d="M13.500 7.500c4.500-.5 7.200 3 5 8-2.200 4.600-8 6.200-14 4.500 5-1.300 8.500-4.300 9-9.300V7.500Z"/>
          <path d="M13.500 7.500c-.2-1.800.6-3.200 2.300-3.800"/>`,
  star: { fill: true, body: `<path d="M12 2.800l2.800 5.800 6.300.9-4.600 4.400 1.100 6.300L12 17.200l-5.600 3 1.100-6.300L2.900 9.500l6.300-.9L12 2.800Z"/>` },

  // ----- UI -----
  phone: { fill: true, body: `<path d="M6.600 10.800a15 15 0 0 0 6.600 6.600l2.200-2.200a1 1 0 0 1 1-.25 11.400 11.400 0 0 0 3.600.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.500a1 1 0 0 1 1 1c0 1.250.2 2.450.57 3.600a1 1 0 0 1-.25 1l-2.220 2.200Z"/>` },
  pin: { fill: true, body: `<path d="M12 2a7 7 0 0 0-7 7c0 5.200 7 13 7 13s7-7.800 7-13a7 7 0 0 0-7-7Zm0 9.500A2.500 2.500 0 1 1 12 6a2.500 2.500 0 0 1 0 5.500Z"/>` },
  sun: `<circle cx="12" cy="12" r="4"/>
        <path d="M12 2.500v2.200M12 19.300v2.200M2.500 12h2.200M19.300 12h2.200M5.300 5.300l1.500 1.500M17.200 17.200l1.500 1.500M5.300 18.700l1.500-1.500M17.200 6.800l1.500-1.500"/>`,
  moon: `<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500Z"/>`,
};

/** Returns an <svg> string for a named icon. Colour comes from currentColor. */
export function icon(name, { size = 20, cls = '' } = {}) {
  const def = ICONS[name];
  if (!def) return '';
  const filled = typeof def === 'object';
  const body = filled ? def.body : def;
  const attrs = filled && def.fill
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><g ${attrs}>${body}</g></svg>`;
}

/** Raw inner markup (for nesting inside another svg). */
export function iconInner(name) {
  const def = ICONS[name];
  if (!def) return '';
  const filled = typeof def === 'object';
  const body = filled ? def.body : def;
  const attrs = filled && def.fill
    ? 'fill="currentColor"'
    : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  return `<g ${attrs}>${body}</g>`;
}
