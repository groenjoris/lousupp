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

/* ---------------- the product-detail hero ----------------
   A "shopify" style PDP block, drawn in pencil: media (main image +
   thumbnail gallery) left, buy-info right. Content comes from the
   chapter; `image`, `body`, `editButton`, `annotation` are prepared
   nodes so editing behaves exactly like a normal chapter. */
export default function ProductHero({ chapter: c, image, body, editButton, annotation }) {
  const hasTitle = !!c.title?.trim();

  return (
    <div className="wf-pdp">
      {/* media column */}
      <div className="wf-pdp-media" style={{ display: 'grid', gap: 'var(--space-3)' }}>
        {image}
        {/* thumbnail gallery — loose empty sketch boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
          {[7, 8, 9].map((s) => (
            <div key={s} style={{ position: 'relative', aspectRatio: '1 / 1' }}>
              <SketchFrame radius={12} stroke={1.25} color="var(--wf-line-ghost)" roughness={2.4} seed={s} />
            </div>
          ))}
          <div style={{ position: 'relative', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center' }}>
            <SketchFrame radius={12} stroke={1.25} color="var(--wf-line-ghost)" roughness={2.4} seed={11} />
            <span style={{ position: 'relative', font: '500 var(--wf-caption)/1 var(--font-wf-hand)', color: 'var(--wf-ink-faint)' }}>+3</span>
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
          ✓ 30-day money-back guarantee&nbsp;&nbsp;·&nbsp;&nbsp;✓ free shipping&nbsp;&nbsp;·&nbsp;&nbsp;✓ pause or cancel anytime
        </SketchText>

        {editButton && <div style={{ justifySelf: 'end' }}>{editButton}</div>}
        {annotation && <div style={{ marginTop: 'var(--space-2)' }}>{annotation}</div>}
      </div>
    </div>
  );
}
