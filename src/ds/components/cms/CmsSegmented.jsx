import React from 'react';

/* Segmented control. Each option is { value, label, icon? }.
   With `iconsOnly`, renders a compact icon row (used for the
   chapter-layout picker). */
export function CmsSegmented({
  options = [],
  value,
  onChange,
  iconsOnly = false,
  label = null,
  className = '',
  style = {},
}) {
  return (
    <div className={`cms ${className}`} style={{ display: 'grid', gap: '6px', ...style }}>
      {label && (
        <span style={{ font: `var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)`, color: 'var(--cms-ink-soft)' }}>
          {label}
        </span>
      )}
      <div
        role="tablist"
        style={{
          display: iconsOnly ? 'grid' : 'flex',
          gridTemplateColumns: iconsOnly ? `repeat(${options.length}, 1fr)` : undefined,
          gap: '3px',
          padding: '3px',
          background: 'var(--cms-surface)',
          border: '1px solid var(--cms-border)',
          borderRadius: 'var(--cms-radius)',
        }}
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={selected}
              title={opt.label}
              onClick={() => onChange && onChange(opt.value)}
              className="cms-seg-opt"
              style={{
                display: 'flex',
                flexDirection: iconsOnly ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: iconsOnly ? '4px' : '6px',
                flex: iconsOnly ? undefined : 1,
                padding: iconsOnly ? '8px 4px' : '6px 12px',
                font: `var(--cms-weight-medium) ${iconsOnly ? 'var(--cms-tiny)' : 'var(--cms-body)'}/1.1 var(--font-cms-sans)`,
                color: selected ? 'var(--cms-ink)' : 'var(--cms-ink-soft)',
                background: selected ? 'var(--cms-canvas)' : 'transparent',
                border: '1px solid ' + (selected ? 'var(--cms-border)' : 'transparent'),
                borderRadius: 'var(--cms-radius-sm)',
                boxShadow: selected ? 'var(--cms-shadow-1)' : 'none',
                cursor: 'pointer',
              }}
            >
              {opt.icon}
              {(opt.label && (!iconsOnly || opt.showLabel !== false)) && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
