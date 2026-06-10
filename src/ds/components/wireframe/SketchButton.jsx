import React from 'react';
import { SketchFrame } from './sketch.jsx';

/* A hand-drawn button. The wobbly edge is an inline SVG path; the
   label stays crisp on top. Three intents, three sizes. */
export function SketchButton({
  children,
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost'
  size = 'md',           // 'sm' | 'md' | 'lg'
  seed = 1,
  iconLeft = null,
  iconRight = null,
  as: Tag = 'button',
  className = '',
  style = {},
  ...rest
}) {
  const pads = { sm: '6px 16px', md: '10px 22px', lg: '14px 32px' };
  const sizes = { sm: '1rem', md: 'var(--wf-body)', lg: '1.35rem' };

  const isGhost = variant === 'ghost';
  const isPrimary = variant === 'primary';

  return (
    <Tag
      className={`wf-btn wf-btn--${variant} ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        font: `var(--wf-weight-strong) ${sizes[size]}/1.1 var(--font-wf-hand)`,
        color: isPrimary ? 'var(--wf-paper)' : 'var(--wf-ink-strong)',
        background: 'transparent',
        border: 'none',
        padding: pads[size],
        cursor: 'pointer',
        userSelect: 'none',
        textDecoration: isGhost ? 'underline' : 'none',
        textDecorationThickness: isGhost ? '2px' : undefined,
        textUnderlineOffset: isGhost ? '4px' : undefined,
        textDecorationColor: isGhost ? 'var(--wf-line-soft)' : undefined,
        transition: 'transform var(--wf-dur) var(--wf-ease), color var(--wf-dur) var(--wf-ease)',
        ...style,
      }}
      {...rest}
    >
      {!isGhost && (
        <SketchFrame
          radius={10}
          stroke={2}
          color="var(--wf-ink-strong)"
          fill={isPrimary ? 'var(--wf-ink-strong)' : 'transparent'}
          roughness={1.5}
          seed={seed}
        />
      )}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {iconLeft}
        <span>{children}</span>
        {iconRight}
      </span>
    </Tag>
  );
}
