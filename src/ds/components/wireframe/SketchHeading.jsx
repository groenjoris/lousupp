import React from 'react';
import { SketchLine } from './sketch.jsx';

const LEVELS = {
  display: { tag: 'h1', size: 'var(--wf-display)', font: 'var(--font-wf-display)', lh: 'var(--wf-lh-display)', weight: 700, color: 'var(--wf-ink-strong)' },
  h1:      { tag: 'h1', size: 'var(--wf-h1)',      font: 'var(--font-wf-display)', lh: 'var(--wf-lh-head)',    weight: 700, color: 'var(--wf-ink-strong)' },
  h2:      { tag: 'h2', size: 'var(--wf-h2)',      font: 'var(--font-wf-display)', lh: 'var(--wf-lh-head)',    weight: 600, color: 'var(--wf-ink-strong)' },
  h3:      { tag: 'h3', size: 'var(--wf-h3)',      font: 'var(--font-wf-hand)',    lh: '1.2',                  weight: 600, color: 'var(--wf-ink-strong)' },
};

/* A wireframe title. Optional drawn underline and a small
   handwritten eyebrow above it. */
export function SketchHeading({
  level = 'h1',
  underline = false,
  eyebrow = null,
  as,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const cfg = LEVELS[level] || LEVELS.h1;
  const Tag = as || cfg.tag;

  return (
    <div className={className} style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {eyebrow && (
        <span style={{
          font: `500 var(--wf-caption)/1.2 var(--font-wf-hand)`,
          color: 'var(--wf-ink-soft)',
          letterSpacing: '0.02em',
          transform: 'rotate(-0.6deg)',
          transformOrigin: 'left',
        }}>{eyebrow}</span>
      )}
      <Tag
        style={{
          margin: 0,
          font: `${cfg.weight} ${cfg.size}/${cfg.lh} ${cfg.font}`,
          color: cfg.color,
          textWrap: 'balance',
          ...style,
        }}
        {...rest}
      >
        {underline
          ? <span style={{ position: 'relative', display: 'inline-block' }}>
              {children}
              <SketchLine seed={3} />
            </span>
          : children}
      </Tag>
    </div>
  );
}
