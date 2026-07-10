'use client';

import React from 'react';
import { SketchHeading, SketchText, SketchButton, SketchFrame } from '@/ds';

/* ---------------- sketchy review stars ---------------- */

function Star({ filled, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      style={{ display: 'block', transform: `rotate(${filled ? -2 : 2}deg)` }}>
      <path
        d="M12 3.2l2.7 5.5 6.1.8-4.5 4.2 1.15 6-5.45-3-5.45 3 1.15-6L3.2 9.5l6.1-.8z"
        fill={filled ? 'currentColor' : 'none'}
        fillOpacity={filled ? 0.38 : 0}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating = 0, count }) {
  const r = Number(rating) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--wf-ink-soft)' }}>
      <span style={{ display: 'flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} filled={r >= i + 0.5} />)}
      </span>
      <span style={{ font: '500 var(--wf-caption)/1 var(--font-wf-hand)', color: 'var(--wf-ink-soft)' }}>
        {r > 0 ? r.toFixed(1) : '—'}{count ? ` · ${count} reviews` : ''}
      </span>
    </div>
  );
}

/* ---------------- sketchy payment badges ---------------- */

function PayBadge({ label, seed }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '5px 12px' }}>
      <SketchFrame radius={6} stroke={1.25} color="var(--wf-line-ghost)" roughness={1.8} seed={seed} />
      <span style={{ position: 'relative', zIndex: 1, font: '600 0.8rem/1 var(--font-wf-hand)', color: 'var(--wf-ink-faint)', letterSpacing: '0.02em' }}>
        {label}
      </span>
    </span>
  );
}

const PAY_METHODS = ['iDEAL', 'PayPal', 'VISA', 'Mastercard', 'Klarna'];

/* ---------------- collapsible info sections ----------------
   Titles with a hand-drawn "+" that rotates open; one section
   expanded at a time, the first one by default. Lines starting
   with "- " render as bullets. */

function sectionLines(body) {
  const lines = (body || '').split('\n').map((l) => l.trim()).filter(Boolean);
  const bullets = [];
  const paras = [];
  lines.forEach((l) => {
    const m = /^[-•]\s+(.*)$/.exec(l);
    if (m) bullets.push(m[1]); else paras.push(l);
  });
  return { bullets, paras };
}

function AccordionSection({ section, open, onToggle, last }) {
  const { bullets, paras } = sectionLines(section.body);
  return (
    <div style={{ borderBottom: last ? 'none' : '1.5px solid var(--wf-line-ghost)' }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '12px 2px', background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ font: '600 1.15rem/1.2 var(--font-wf-hand)', color: 'var(--wf-ink)' }}>{section.title}</span>
        <span aria-hidden="true" style={{
          font: '500 1.5rem/1 var(--font-wf-hand)', color: 'var(--wf-ink-soft)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transition: 'transform var(--wf-dur) var(--wf-ease)',
          display: 'inline-block',
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 2px 14px', display: 'grid', gap: 'var(--space-2)' }}>
          {paras.map((p, i) => (
            <p key={`p${i}`} style={{ margin: 0, font: '400 1.05rem/1.5 var(--font-wf-hand)', color: 'var(--wf-line-soft)' }}>{p}</p>
          ))}
          {bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '1.2em', display: 'grid', gap: '6px' }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ font: '400 1.05rem/1.45 var(--font-wf-hand)', color: 'var(--wf-line-soft)' }}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function InfoAccordion({ sections }) {
  const [openId, setOpenId] = React.useState(sections[0]?.id ?? null);
  if (!sections || sections.length === 0) return null;
  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1.5px solid var(--wf-line-ghost)' }}>
      {sections.map((s, i) => (
        <AccordionSection
          key={s.id}
          section={s}
          open={openId === s.id}
          onToggle={() => setOpenId(openId === s.id ? null : s.id)}
          last={i === sections.length - 1}
        />
      ))}
    </div>
  );
}

/* ---------------- the product-detail hero ----------------
   A "shopify" style PDP block, drawn in pencil: media (main image +
   thumbnail gallery) left, buy-info right. Content comes from the
   chapter; `image`, `body`, `editButton`, `annotation` are prepared
   nodes so editing behaves exactly like a normal chapter. */
export default function ProductHero({ chapter: c, image, body, editButton, annotation }) {
  const hasTitle = !!c.title?.trim();

  return (
    <div className="wf-pdp">
      {/* media column: main image, then a full-width 2×2 quadrant of thumbnails */}
      <div className="wf-pdp-media" style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {image}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          {[7, 8, 9].map((s) => (
            <div key={s} style={{ position: 'relative', aspectRatio: '1 / 1' }}>
              <SketchFrame radius={14} stroke={1.25} color="var(--wf-line-ghost)" roughness={2.4} seed={s} />
            </div>
          ))}
          <div style={{ position: 'relative', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center' }}>
            <SketchFrame radius={14} stroke={1.25} color="var(--wf-line-ghost)" roughness={2.4} seed={11} />
            <span style={{ position: 'relative', font: '500 1.2rem/1 var(--font-wf-hand)', color: 'var(--wf-ink-faint)' }}>+3</span>
          </div>
        </div>
      </div>

      {/* buy-info column */}
      <div className="wf-pdp-info" style={{ display: 'grid', gap: 'var(--space-4)', alignContent: 'start' }}>
        {c.eyebrow && (
          <span style={{ font: '500 var(--wf-caption)/1.2 var(--font-wf-hand)', color: 'var(--wf-ink-soft)', transform: 'rotate(-0.5deg)', transformOrigin: 'left' }}>
            {c.eyebrow}
          </span>
        )}

        <SketchHeading level="h1" style={hasTitle ? undefined : { color: 'var(--wf-line-soft)' }}>
          {hasTitle ? c.title : 'Product name'}
        </SketchHeading>

        <Stars rating={c.rating} count={c.reviewCount} />

        {body}

        {/* price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 'var(--space-2)' }}>
          <span style={{ font: '400 2.2rem/1 var(--font-wf-display)', color: 'var(--wf-ink-strong)' }}>
            {c.price?.trim() || '€ —'}
          </span>
          {c.priceNote?.trim() && (
            <span style={{ font: '500 var(--wf-caption)/1.3 var(--font-wf-hand)', color: 'var(--wf-ink-faint)' }}>{c.priceNote}</span>
          )}
        </div>

        {/* add to cart */}
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <SketchButton variant="primary" size="lg" seed={4} style={{ justifyContent: 'center', width: 'min(340px, 100%)' }}>
            {c.primaryCta?.trim() || 'Add to cart'}
          </SketchButton>
          {c.secondaryCta?.trim() && (
            <SketchButton variant="ghost" style={{ justifySelf: 'start' }}>{c.secondaryCta}</SketchButton>
          )}
        </div>

        {/* payment providers — sketchy badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {PAY_METHODS.map((m, i) => <PayBadge key={m} label={m} seed={i + 21} />)}
        </div>

        {/* trust line */}
        <SketchText variant="caption" style={{ color: 'var(--wf-ink-soft)' }}>
          ✓ 60-night money-back guarantee&nbsp;&nbsp;·&nbsp;&nbsp;✓ free shipping in Europe&nbsp;&nbsp;·&nbsp;&nbsp;✓ third-party tested
        </SketchText>

        {/* collapsible info sections */}
        <InfoAccordion sections={c.sections || []} />

        {editButton && <div style={{ justifySelf: 'end' }}>{editButton}</div>}
        {annotation && <div style={{ marginTop: 'var(--space-2)' }}>{annotation}</div>}
      </div>
    </div>
  );
}
