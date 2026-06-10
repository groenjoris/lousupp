import React from 'react';

/* Labelled text input / textarea for the editing panel. */
export function CmsField({
  label,
  value,
  onChange,
  placeholder = '',
  multiline = false,
  rows = 3,
  hint = null,
  id,
  className = '',
  style = {},
  ...rest
}) {
  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: multiline ? '9px 11px' : '7px 11px',
    font: `var(--cms-weight-regular) var(--cms-body)/1.5 var(--font-cms-sans)`,
    color: 'var(--cms-ink)',
    background: 'var(--cms-canvas)',
    border: '1px solid var(--cms-border)',
    borderRadius: 'var(--cms-radius)',
    resize: multiline ? 'vertical' : undefined,
    outline: 'none',
  };

  return (
    <label className={`cms ${className}`} htmlFor={id} style={{ display: 'grid', gap: '6px', ...style }}>
      {label && (
        <span style={{
          font: `var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)`,
          color: 'var(--cms-ink-soft)',
        }}>{label}</span>
      )}
      {multiline ? (
        <textarea id={id} className="cms-field" value={value} onChange={onChange}
          placeholder={placeholder} rows={rows} style={fieldStyle} {...rest} />
      ) : (
        <input id={id} className="cms-field" value={value} onChange={onChange}
          placeholder={placeholder} style={fieldStyle} {...rest} />
      )}
      {hint && (
        <span style={{ font: `var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)`, color: 'var(--cms-ink-faint)' }}>
          {hint}
        </span>
      )}
    </label>
  );
}
