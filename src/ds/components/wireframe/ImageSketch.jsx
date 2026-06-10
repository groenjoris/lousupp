import React from 'react';
import { SketchFrame } from './sketch.jsx';

/* Loose gesture sketches that read as "a real image will live here".
   Abstract, faint, hand-wobbled — not the ugly box-with-a-cross. */
const MOTIFS = {
  landscape: (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <path d="M40 158 Q150 118 250 150 T470 150" strokeWidth="2" opacity="0.55" />
      <path d="M70 160 Q140 96 210 150" strokeWidth="2" opacity="0.42" />
      <path d="M190 158 Q300 70 410 158" strokeWidth="2" opacity="0.42" />
      <circle cx="372" cy="74" r="26" strokeWidth="2" opacity="0.5" />
      <path d="M86 178 H444" strokeWidth="2.4" opacity="0.6" />
    </g>
  ),
  portrait: (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <ellipse cx="250" cy="92" rx="46" ry="54" strokeWidth="2" opacity="0.5" />
      <path d="M150 196 Q250 120 350 196" strokeWidth="2.2" opacity="0.5" />
      <path d="M196 196 V172 M304 196 V172" strokeWidth="2" opacity="0.4" />
    </g>
  ),
  abstract: (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <path d="M70 150 C140 60 230 60 250 120 S360 200 430 110" strokeWidth="2.2" opacity="0.5" />
      <path d="M110 96 Q250 150 400 80" strokeWidth="2" opacity="0.34" />
      <circle cx="150" cy="86" r="14" strokeWidth="2" opacity="0.45" />
    </g>
  ),
  none: null,
};

/* Pencil-sketch image placeholder. Fills its container; the parent
   (e.g. <Chapter>) controls width. Caption names the image to come. */
export function ImageSketch({
  caption = '',
  motif = 'abstract',     // 'landscape' | 'portrait' | 'abstract' | 'none'
  aspect = '4 / 3',
  seed = 1,
  className = '',
  style = {},
  children,               // optional: a real <img> once you have one
  ...rest
}) {
  const hasImage = !!children;

  return (
    <figure
      className={`wf-sketch ${className}`}
      style={{
        margin: 0,
        width: '100%',
        aspectRatio: aspect,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 'var(--wf-radius-lg)',
        background: 'var(--wf-paper-raised)',
        ...style,
      }}
      {...rest}
    >
      <SketchFrame radius={18} stroke={2} color="var(--wf-line)" fill="transparent" roughness={3} seed={seed} />
      {hasImage ? (
        children
      ) : (
        <>
          <svg
            viewBox="0 0 500 230"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              inset: '8% 6%',
              width: '88%',
              height: '84%',
              zIndex: 1,
              color: 'var(--wf-line-soft)',
            }}
            aria-hidden="true"
          >
            {MOTIFS[motif] || MOTIFS.abstract}
          </svg>
          {caption && (
            <figcaption style={{
              position: 'relative',
              zIndex: 2,
              marginTop: 'auto',
              alignSelf: 'end',
              justifySelf: 'start',
              padding: '6px 12px',
              font: `500 var(--wf-caption)/1.3 var(--font-wf-hand)`,
              color: 'var(--wf-ink-soft)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span aria-hidden="true" style={{ fontSize: '1.1em' }}>✎</span>
              {caption}
            </figcaption>
          )}
        </>
      )}
    </figure>
  );
}
