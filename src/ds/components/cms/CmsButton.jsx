import React from 'react';

/* CMS chrome button — crisp, greyscale. */
export function CmsButton({
  children,
  variant = 'soft',   // 'solid' | 'soft' | 'ghost'
  size = 'md',        // 'sm' | 'md'
  iconLeft = null,
  block = false,
  className = '',
  style = {},
  ...rest
}) {
  const pad = size === 'sm' ? '5px 10px' : '7px 14px';
  const fs = size === 'sm' ? 'var(--cms-meta)' : 'var(--cms-body)';

  const tones = {
    solid: { background: 'var(--cms-solid)', color: 'var(--cms-on-solid)', border: '1px solid transparent' },
    soft:  { background: 'var(--cms-surface)', color: 'var(--cms-ink)', border: '1px solid var(--cms-border)' },
    ghost: { background: 'transparent', color: 'var(--cms-ink-soft)', border: '1px solid transparent' },
  };

  return (
    <button
      className={`cms cms-btn cms-btn--${variant} ${className}`}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: pad,
        font: `var(--cms-weight-medium) ${fs}/1 var(--font-cms-sans)`,
        borderRadius: 'var(--cms-radius)',
        cursor: 'pointer',
        ...tones[variant],
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
    </button>
  );
}
