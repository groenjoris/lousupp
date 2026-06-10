import React from 'react';
import { SketchFrame } from './sketch.jsx';

/* A panel drawn with a hand-drawn pencil border. Content stays
   crisp; the frame is an inline SVG path sized to the box. */
export function SketchPanel({
  as: Tag = 'div',
  tone = 'paper',      // 'paper' | 'raised' | 'blank'
  stroke = 'regular',  // 'regular' | 'bold' | 'hair'
  seed = 1,            // varies the wobble between neighbours
  rough = false,       // heavier, more gestural edge
  radius = 10,
  pad = 'var(--space-5)',
  className = '',
  style = {},
  children,
  ...rest
}) {
  const fill = tone === 'raised'
    ? 'var(--wf-paper-raised)'
    : tone === 'blank'
      ? 'transparent'
      : 'var(--wf-paper)';

  const strokeW = stroke === 'bold' ? 3 : stroke === 'hair' ? 1.25 : 2;

  return (
    <Tag
      className={`wf-sketch ${className}`}
      style={{ position: 'relative', padding: pad, ...style }}
      {...rest}
    >
      <SketchFrame
        radius={radius}
        stroke={strokeW}
        color="var(--wf-line)"
        fill={fill}
        roughness={rough ? 3 : 1.6}
        seed={seed}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </Tag>
  );
}
