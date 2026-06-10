import React from 'react';

/* A small greyscale toggle switch with label. */
export function CmsToggle({
  checked = false,
  onChange,
  label,
  hint = null,
  className = '',
  style = {},
}) {
  return (
    <label
      className={`cms ${className}`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer', ...style }}
    >
      <span style={{ display: 'grid', gap: '2px' }}>
        <span style={{ font: `var(--cms-weight-medium) var(--cms-body)/1.3 var(--font-cms-sans)`, color: 'var(--cms-ink)' }}>{label}</span>
        {hint && <span style={{ font: `var(--cms-weight-regular) var(--cms-meta)/1.3 var(--font-cms-sans)`, color: 'var(--cms-ink-faint)' }}>{hint}</span>}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={(e) => { e.preventDefault(); onChange && onChange(!checked); }}
        style={{
          position: 'relative',
          flex: 'none',
          width: 34,
          height: 20,
          borderRadius: 999,
          background: checked ? 'var(--cms-solid)' : 'var(--cms-border-strong)',
          transition: 'background var(--cms-dur) var(--cms-ease)',
        }}
      >
        <span style={{
          position: 'absolute',
          top: 2,
          left: checked ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--cms-shadow-1)',
          transition: 'left var(--cms-dur) var(--cms-ease)',
        }} />
      </span>
    </label>
  );
}
