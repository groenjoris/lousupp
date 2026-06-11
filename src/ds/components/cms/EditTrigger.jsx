import React from 'react';
import { CmsIcon } from './CmsIcon.jsx';

/* The small control that sits in every chapter (top-right) and
   opens the editing panel. Belongs to the CMS world, so it's crisp
   and greyscale — deliberately distinct from the sketch around it. */
export function EditTrigger({
  onClick,
  label = 'Edit',
  icon = 'edit',     // CmsIcon name
  compact = false,   // icon-only round button
  active = false,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <button
      className={`cms wf-edit-trigger ${className}`}
      onClick={onClick}
      aria-label={label}
      data-active={active ? 'true' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: compact ? '0' : '6px 11px 6px 9px',
        width: compact ? 32 : undefined,
        height: 32,
        justifyContent: 'center',
        font: `var(--cms-weight-medium) var(--cms-meta)/1 var(--font-cms-sans)`,
        color: active ? 'var(--cms-on-solid)' : 'var(--cms-ink)',
        background: active ? 'var(--cms-solid)' : 'var(--cms-canvas)',
        border: '1px solid ' + (active ? 'transparent' : 'var(--cms-border)'),
        borderRadius: 999,
        boxShadow: 'var(--cms-shadow-1)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      <CmsIcon name={icon} size={14} />
      {!compact && <span>{label}</span>}
    </button>
  );
}
