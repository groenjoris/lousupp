import React from 'react';

/* ============================================================
   The pencil look — hand-drawn SVG paths.
   Instead of CSS filters (fragile to capture, weak wobble) we
   generate a gently-jittered rounded-rectangle PATH and draw it
   as an inline <svg> that sizes to its parent. Renders crisply
   everywhere, scales to any box, and looks genuinely drawn.
   ============================================================ */

/* tiny seeded PRNG so a given element always wobbles the same way */
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* a hand-drawn rounded rectangle path string */
export function roughRoundedRect(w, h, { r = 10, j = 1.6, seed = 1, inset = 2 } = {}) {
  const rand = mulberry((seed * 2654435761) >>> 0);
  const J = () => (rand() * 2 - 1) * j;
  const x0 = inset, y0 = inset, x1 = w - inset, y1 = h - inset;
  r = Math.max(2, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
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

/* a hand-drawn near-horizontal stroke (for underlines) */
export function roughUnderline(w, h, { j = 2, seed = 1 } = {}) {
  const rand = mulberry((seed * 40503 + 7) >>> 0);
  const J = () => (rand() * 2 - 1) * j;
  const y = h / 2;
  const P = (x, yy) => `${x.toFixed(1)} ${(yy + J()).toFixed(1)}`;
  return `M ${P(2, y)} C ${P(w * 0.3, y)} ${P(w * 0.62, y)} ${P(w - 2, y)}`;
}

/* size-tracking hook: reports the live pixel size of a ref'd node */
function useBoxSize() {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

/* A drawn border layer. Drop it as the FIRST child of a
   position:relative box; it fills the box and draws the frame. */
export function SketchFrame({
  radius = 10,
  stroke = 2,
  color = 'var(--wf-line)',
  fill = 'transparent',
  roughness = 1.6,
  seed = 1,
}) {
  const [ref, { w, h }] = useBoxSize();
  const d = w > 4 && h > 4
    ? roughRoundedRect(w, h, { r: radius, j: roughness, seed, inset: Math.max(stroke, 2) })
    : '';
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}
    >
      {d && <path d={d} fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/* A drawn underline that sits beneath inline text. */
export function SketchLine({ color = 'var(--wf-ink-strong)', stroke = 3, roughness = 2, seed = 1 }) {
  const [ref, { w, h }] = useBoxSize();
  const d = w > 8 ? roughUnderline(w, h, { j: roughness, seed }) : '';
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', left: 0, right: 0, bottom: '-0.18em', width: '100%', height: '0.5em', overflow: 'visible', pointerEvents: 'none' }}
    >
      {d && <path d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />}
    </svg>
  );
}

/* kept for backwards compatibility — no longer needed, now a no-op */
export function ensureSketchDefs() {}
export function SketchDefs() { return null; }
