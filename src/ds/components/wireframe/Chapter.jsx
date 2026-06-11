import React from 'react';

/* A chapter — the building block of a wireframe page. ~75vh tall,
   it arranges a text block (eyebrow/title/body/actions) and an
   image block per `layout`. The CMS edit control mounts into the
   `toolbar` slot, top-right. */
export function Chapter({
  layout = 'image-right',  // image-right | image-left | image-full | image-below | text-only
  imageWidth = 'half',     // half | two-thirds  (ignored for full/below/text-only)
  align = 'center',        // vertical alignment of the two columns
  eyebrow = null,
  title = null,
  body = null,
  actions = null,
  image = null,
  toolbar = null,          // CMS EditTrigger goes here
  annotation = null,       // faint handwritten pillar/story note, top-right
  index = null,            // optional chapter number, shown faintly
  className = '',
  style = {},
  children,
  ...rest
}) {
  const sideBySide = layout === 'image-right' || layout === 'image-left';
  const imageFirst = layout === 'image-left';
  const centered = layout === 'text-only' || layout === 'image-below';

  let columns = '1fr';
  if (sideBySide) {
    if (imageWidth === 'two-thirds') {
      columns = imageFirst ? '1.9fr 1fr' : '1fr 1.9fr';
    } else {
      columns = '1fr 1fr';
    }
  }

  const TextBlock = (
    <div style={{ display: 'grid', gap: 'var(--space-4)', alignContent: 'center' }}>
      {eyebrow && (
        <span style={{
          font: '500 var(--wf-caption)/1.2 var(--font-wf-hand)',
          color: 'var(--wf-ink-soft)',
          transform: 'rotate(-0.5deg)',
          transformOrigin: 'left',
        }}>{eyebrow}</span>
      )}
      {title}
      {body}
      {toolbar && (
        <div style={{ justifySelf: 'end' }}>{toolbar}</div>
      )}
      {actions && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-2)', justifyContent: centered ? 'center' : 'flex-start' }}>
          {actions}
        </div>
      )}
      {annotation && (
        <div style={{
          font: `400 9pt/1.4 var(--font-cms-sans)`,
          color: 'var(--wf-ink-soft)',
          letterSpacing: '0.01em',
          marginTop: 'var(--space-4)',
        }}>{annotation}</div>
      )}
    </div>
  );

  let inner;
  if (layout === 'text-only') {
    inner = <div style={{ maxWidth: '46ch', margin: '0 auto', textAlign: 'center' }}>{TextBlock}</div>;
  } else if (layout === 'image-full') {
    inner = (
      <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ maxWidth: '60ch' }}>{TextBlock}</div>
        <div>{image}</div>
      </div>
    );
  } else if (layout === 'image-below') {
    inner = (
      <div style={{ display: 'grid', gap: 'var(--space-6)', justifyItems: 'center', textAlign: 'center' }}>
        <div style={{ maxWidth: '52ch' }}>{TextBlock}</div>
        <div style={{ width: 'min(680px, 100%)' }}>{image}</div>
      </div>
    );
  } else {
    // side-by-side. DOM order is always text→image; for image-left, CSS `order`
    // puts the image on the left on desktop. On mobile it collapses to a single
    // column with text first (see chapter responsive CSS in base.css).
    inner = (
      <div
        className={`wf-cols${imageFirst ? ' wf-cols--image-first' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: columns,
          gap: 'clamp(28px, 5vw, 80px)',
          alignItems: align,
        }}
      >
        <div className="wf-col-text">{TextBlock}</div>
        <div className="wf-col-img">{image}</div>
      </div>
    );
  }

  return (
    <section
      className={className}
      style={{
        position: 'relative',
        minHeight: 'var(--chapter-min-h)',
        display: 'grid',
        alignContent: 'center',
        padding: 'var(--chapter-gap) var(--page-gutter)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ width: '100%', maxWidth: 'var(--page-max)', margin: '0 auto', position: 'relative' }}>
        {index != null && (
          <span aria-hidden="true" style={{
            position: 'absolute',
            top: '-0.4em',
            right: 0,
            font: '700 clamp(3rem, 7vw, 6rem)/1 var(--font-wf-display)',
            color: 'var(--wf-line-ghost)',
            pointerEvents: 'none',
          }}>{String(index).padStart(2, '0')}</span>
        )}
        {children || inner}
      </div>
    </section>
  );
}
