import React from 'react';

/* Square icon button for the CMS toolbars. `active` gives the
   dark pressed state. */
export function CmsIconButton({
  icon,
  label,            // accessible label (required for icon-only)
  active = false,
  size = 30,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <button
      className={`cms cms-iconbtn ${className}`}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        padding: 0,
        color: 'var(--cms-ink-soft)',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 'var(--cms-radius-sm)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
