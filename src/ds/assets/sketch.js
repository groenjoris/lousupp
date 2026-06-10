/* ============================================================
   sketch.js — vanilla pencil borders for plain HTML.
   Scans [data-sketch] elements and injects a hand-drawn SVG frame
   that tracks the element's size. Mirrors the React SketchFrame.

   Usage:
     <div data-sketch data-fill="var(--wf-paper-raised)">…</div>
     <span data-sketch-underline>title</span>
   Attributes (all optional):
     data-radius, data-stroke, data-roughness, data-seed,
     data-color, data-fill
   ============================================================ */
(function () {
  function mulberry(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function roughRoundedRect(w, h, o) {
    const r0 = o.radius, j = o.roughness, inset = Math.max(o.stroke, 2);
    const rand = mulberry((o.seed * 2654435761) >>> 0);
    const J = () => (rand() * 2 - 1) * j;
    const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
    const r = Math.max(2, Math.min(r0, (x1 - x0) / 2, (y1 - y0) / 2));
    const P = (x, y) => `${(x + J()).toFixed(1)} ${(y + J()).toFixed(1)}`;
    const edge = (sx, sy, ex, ey) => `Q ${P((sx + ex) / 2, (sy + ey) / 2)} ${P(ex, ey)} `;
    let d = `M ${P(x0 + r, y0)} `;
    d += edge(x0 + r, y0, x1 - r, y0);
    d += `Q ${P(x1, y0)} ${P(x1, y0 + r)} `;
    d += edge(x1, y0 + r, x1, y1 - r);
    d += `Q ${P(x1, y1)} ${P(x1 - r, y1)} `;
    d += edge(x1 - r, y1, x0 + r, y1);
    d += `Q ${P(x0, y1)} ${P(x0, y1 - r)} `;
    d += edge(x0, y1 - r, x0, y0 + r);
    d += `Q ${P(x0, y0)} ${P(x0 + r, y0)} Z`;
    return d;
  }

  function roughUnderline(w, h, o) {
    const rand = mulberry((o.seed * 40503 + 7) >>> 0);
    const J = () => (rand() * 2 - 1) * o.roughness;
    const y = h / 2;
    const P = (x) => `${x.toFixed(1)} ${(y + J()).toFixed(1)}`;
    return `M ${P(2)} C ${P(w * 0.3)} ${P(w * 0.62)} ${P(w - 2)}`;
  }

  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function num(v, d) { const n = parseFloat(v); return isNaN(n) ? d : n; }

  function mountFrame(host) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const opts = {
      radius: num(host.dataset.radius, 10),
      stroke: num(host.dataset.stroke, 2),
      roughness: num(host.dataset.roughness, 1.6),
      seed: num(host.dataset.seed, 1),
      color: host.dataset.color || 'var(--wf-line)',
      fill: host.dataset.fill || 'transparent',
    };
    const svg = svgEl('svg', { 'aria-hidden': 'true' });
    Object.assign(svg.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: '0' });
    const path = svgEl('path', { fill: opts.fill, stroke: opts.color, 'stroke-width': opts.stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    svg.appendChild(path);
    host.insertBefore(svg, host.firstChild);
    // lift real content above the frame
    Array.from(host.children).forEach((c) => {
      if (c !== svg && getComputedStyle(c).position === 'static') { c.style.position = 'relative'; c.style.zIndex = '1'; }
    });
    const draw = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w > 4 && h > 4) path.setAttribute('d', roughRoundedRect(w, h, opts));
    };
    draw();
    if (window.ResizeObserver) { const ro = new ResizeObserver(draw); ro.observe(host); }
  }

  function mountUnderline(host) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    if (getComputedStyle(host).display === 'inline') host.style.display = 'inline-block';
    const opts = { roughness: num(host.dataset.roughness, 2), seed: num(host.dataset.seed, 3), color: host.dataset.color || 'var(--wf-ink-strong)', stroke: num(host.dataset.stroke, 3) };
    const svg = svgEl('svg', { 'aria-hidden': 'true' });
    Object.assign(svg.style, { position: 'absolute', left: '0', right: '0', bottom: '-0.18em', width: '100%', height: '0.5em', overflow: 'visible', pointerEvents: 'none' });
    const path = svgEl('path', { fill: 'none', stroke: opts.color, 'stroke-width': opts.stroke, 'stroke-linecap': 'round' });
    svg.appendChild(path);
    host.appendChild(svg);
    const draw = () => { const w = host.clientWidth, h = svg.clientHeight || 12; if (w > 8) path.setAttribute('d', roughUnderline(w, h, opts)); };
    draw();
    if (window.ResizeObserver) { const ro = new ResizeObserver(draw); ro.observe(host); }
  }

  function init(root) {
    (root || document).querySelectorAll('[data-sketch]').forEach(mountFrame);
    (root || document).querySelectorAll('[data-sketch-underline]').forEach(mountUnderline);
  }

  window.WFSketch = { init, roughRoundedRect, roughUnderline };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init());
  else init();
})();
