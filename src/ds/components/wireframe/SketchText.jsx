import React from 'react';

const VARIANTS = {
  lead:    { size: 'var(--wf-lead)',    color: 'var(--wf-ink)',      weight: 400, lh: '1.5' },
  body:    { size: 'var(--wf-body)',    color: 'var(--wf-ink)',      weight: 400, lh: 'var(--wf-lh-body)' },
  caption: { size: 'var(--wf-caption)', color: 'var(--wf-ink-soft)', weight: 400, lh: '1.45' },
};

/* Handwritten running text. `measure` caps line length for an
   easy read; `lead` is the larger intro paragraph. */
export function SketchText({
  variant = 'body',
  measure = '60ch',
  italic = false,
  as: Tag = 'p',
  className = '',
  style = {},
  children,
  ...rest
}) {
  const cfg = VARIANTS[variant] || VARIANTS.body;
  return (
    <Tag
      className={className}
      style={{
        margin: 0,
        maxWidth: measure,
        font: `${cfg.weight} ${cfg.size}/${cfg.lh} var(--font-wf-hand)`,
        fontStyle: italic ? 'italic' : 'normal',
        color: cfg.color,
        textWrap: 'pretty',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
