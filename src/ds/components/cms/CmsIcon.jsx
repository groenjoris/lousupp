import React from 'react';

/* Greyscale UI icons for the CMS chrome. Stroke style matches
   Lucide (24-grid, 2px round) — a curated subset is inlined so
   components stay dependency-free. Layout icons are small panel
   diagrams drawn to read at a glance. */
const PATHS = {
  edit: 'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z',
  close: 'M18 6 6 18 M6 6l12 12',
  text: 'M4 7V4h16v3 M9 20h6 M12 4v16',
  image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M21 15l-5-5L5 21',
  check: 'M20 6 9 17l-5-5',
  chevronDown: 'm6 9 6 6 6-6',
  plus: 'M12 5v14 M5 12h14',
  trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v6 M14 11v6',
  grip: 'M9 5h.01 M9 12h.01 M9 19h.01 M15 5h.01 M15 12h.01 M15 19h.01',
  undo: 'M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z',
};

/* layout-diagram icons: text block + image block arrangements */
function LayoutGlyph({ name }) {
  const f = { fill: 'currentColor', opacity: 0.9 };
  const o = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  switch (name) {
    case 'image-right':
      return (<>
        <rect x="3" y="6" width="9" height="2" {...f} /><rect x="3" y="10" width="7" height="1.6" {...f} opacity="0.5" /><rect x="3" y="13" width="8" height="1.6" {...f} opacity="0.5" />
        <rect x="14" y="5" width="7" height="14" rx="1.5" {...o} />
      </>);
    case 'image-left':
      return (<>
        <rect x="3" y="5" width="7" height="14" rx="1.5" {...o} />
        <rect x="12" y="6" width="9" height="2" {...f} /><rect x="12" y="10" width="7" height="1.6" {...f} opacity="0.5" /><rect x="12" y="13" width="8" height="1.6" {...f} opacity="0.5" />
      </>);
    case 'image-full':
      return (<>
        <rect x="3" y="4" width="11" height="2" {...f} /><rect x="3" y="7.5" width="8" height="1.4" {...f} opacity="0.5" />
        <rect x="3" y="11" width="18" height="9" rx="1.5" {...o} />
      </>);
    case 'image-below':
      return (<>
        <rect x="6" y="4" width="12" height="2" {...f} /><rect x="7" y="7.5" width="10" height="1.4" {...f} opacity="0.5" />
        <rect x="5" y="11" width="14" height="9" rx="1.5" {...o} />
      </>);
    case 'text-only':
      return (<>
        <rect x="5" y="6" width="14" height="2.4" {...f} /><rect x="6" y="11" width="12" height="1.6" {...f} opacity="0.5" /><rect x="7" y="14.5" width="10" height="1.6" {...f} opacity="0.5" />
      </>);
    default:
      return null;
  }
}

export function CmsIcon({ name, size = 16, strokeWidth = 2, className = '', style = {}, ...rest }) {
  const layout = ['image-right', 'image-left', 'image-full', 'image-below', 'text-only'].includes(name);
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block', flex: 'none', ...style }}
      {...rest}
    >
      {layout
        ? <LayoutGlyph name={name} />
        : (PATHS[name] || '').split(' M').map((seg, i) => (
            <path key={i} d={(i === 0 ? seg : 'M' + seg)} />
          ))}
    </svg>
  );
}
