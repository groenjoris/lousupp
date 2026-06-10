import React from 'react';
import { CmsIcon } from './CmsIcon.jsx';
import { CmsIconButton } from './CmsIconButton.jsx';

/* The editing panel shell: header (title + close), scrollable body,
   optional footer for actions. Floats with a soft shadow. */
export function CmsPanel({
  title = 'Edit',
  eyebrow = null,
  onClose,
  footer = null,
  width = 320,
  className = '',
  style = {},
  children,
  ...rest
}) {
  return (
    <section
      className={`cms ${className}`}
      style={{
        width,
        maxWidth: '92vw',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '82vh',
        background: 'var(--cms-canvas)',
        border: '1px solid var(--cms-border)',
        borderRadius: 'var(--cms-radius-lg)',
        boxShadow: 'var(--cms-shadow-pop)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 12px 12px 16px',
        borderBottom: '1px solid var(--cms-border)',
      }}>
        <div style={{ display: 'grid', gap: '1px' }}>
          {eyebrow && (
            <span style={{
              font: `var(--cms-weight-semibold) var(--cms-tiny)/1 var(--font-cms-sans)`,
              letterSpacing: 'var(--cms-track-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--cms-ink-faint)',
            }}>{eyebrow}</span>
          )}
          <h2 style={{ margin: 0, font: `var(--cms-weight-semibold) var(--cms-title)/1.2 var(--font-cms-sans)`, color: 'var(--cms-ink)', whiteSpace: 'nowrap' }}>
            {title}
          </h2>
        </div>
        {onClose && (
          <CmsIconButton icon={<CmsIcon name="close" size={16} />} label="Close" onClick={onClose} />
        )}
      </header>

      <div style={{
        padding: '16px',
        display: 'grid',
        gap: 'var(--space-5)',
        overflowY: 'auto',
      }}>
        {children}
      </div>

      {footer && (
        <footer style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '12px 16px',
          borderTop: '1px solid var(--cms-border)',
          background: 'var(--cms-surface)',
        }}>
          {footer}
        </footer>
      )}
    </section>
  );
}
