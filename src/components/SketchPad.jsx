'use client';

import React from 'react';
import { CmsPanel, CmsButton, CmsIcon, CmsSegmented, CmsField, CmsToggle } from '@/ds';

// Drawing coordinate space (also the SVG viewBox used when rendering on the page).
export const PAD_W = 640;
export const PAD_H = 480;
export const STROKE = '#726f67';   // grey graphite — no colour choice needed
export const STROKE_W = 3;

// Placeholder presets (the motif gesture shown when nothing is drawn).
const PRESETS = [
  { value: 'abstract', label: 'Abstract' },
  { value: 'portrait', label: 'Person' },
  { value: 'landscape', label: 'Scene' },
];

// Image position relative to the text (no text-only here — that's the main
// panel's "Show image" toggle).
const POSITIONS = [
  { value: 'image-left', label: 'Left', icon: <CmsIcon name="image-left" size={20} /> },
  { value: 'image-right', label: 'Right', icon: <CmsIcon name="image-right" size={20} /> },
  { value: 'image-full', label: 'Full', icon: <CmsIcon name="image-full" size={20} /> },
  { value: 'image-below', label: 'Below', icon: <CmsIcon name="image-below" size={20} /> },
];

const imgLayout = (c) => (c.template && c.template !== 'text-only' ? c.template : 'image-right');

/* Render saved strokes as an inline SVG (used both here and on the page). */
export function SketchSvg({ sketch, style }) {
  if (!sketch || !Array.isArray(sketch.strokes) || sketch.strokes.length === 0) return null;
  return (
    <svg viewBox={`0 0 ${PAD_W} ${PAD_H}`} preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block', ...style }} aria-hidden="true">
      {sketch.strokes.map((pts, i) => (
        <polyline key={i} points={pts.map((p) => p.join(',')).join(' ')}
          fill="none" stroke={STROKE} strokeWidth={STROKE_W} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/* Modal sketch panel. Edits live (so the wireframe updates) — Cancel reverts to
   the state captured when it opened. Holds: presets, the drawing canvas, and the
   image note. Grey stroke only. */
export function SketchPad({ chapter, onChange, onCommit, onCancel }) {
  const canvasRef = React.useRef(null);
  const strokesRef = React.useRef(((chapter.sketch && chapter.sketch.strokes) || []).map((s) => s.map((p) => [...p])));
  const drawingRef = React.useRef(false);
  const curRef = React.useRef(null);
  // snapshot for Cancel — captured once on open
  const snapshot = React.useRef({
    sketch: chapter.sketch || null,
    motif: chapter.motif,
    caption: chapter.caption || '',
  });
  const [, force] = React.useReducer((n) => n + 1, 0);

  const redraw = React.useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, PAD_W, PAD_H);
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = STROKE_W;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const all = curRef.current ? [...strokesRef.current, curRef.current] : strokesRef.current;
    for (const pts of all) {
      if (pts.length < 1) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      if (pts.length === 1) ctx.lineTo(pts[0][0] + 0.1, pts[0][1] + 0.1);
      ctx.stroke();
    }
  }, []);

  React.useEffect(() => { redraw(); }, [redraw]);

  const commit = () => {
    const strokes = strokesRef.current.filter((s) => s.length > 0);
    onChange({ sketch: strokes.length ? { strokes: strokes.map((s) => s.map((p) => [...p])) } : null });
  };

  function toLocal(e) {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * PAD_W;
    const y = ((e.clientY - r.top) / r.height) * PAD_H;
    return [Math.round(Math.max(0, Math.min(PAD_W, x))), Math.round(Math.max(0, Math.min(PAD_H, y)))];
  }
  function down(e) { e.preventDefault(); drawingRef.current = true; curRef.current = [toLocal(e)]; redraw(); }
  function move(e) {
    if (!drawingRef.current) return;
    const p = toLocal(e);
    const cur = curRef.current;
    const last = cur[cur.length - 1];
    if (!last || Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) >= 2) { cur.push(p); redraw(); }
  }
  function up() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (curRef.current && curRef.current.length) strokesRef.current.push(curRef.current);
    curRef.current = null;
    force(); redraw(); commit();
  }

  const undo = () => { strokesRef.current.pop(); force(); redraw(); commit(); };
  const clear = () => { strokesRef.current = []; curRef.current = null; force(); redraw(); commit(); };
  const cancel = () => { onChange(snapshot.current); onCancel(); };

  const count = strokesRef.current.length;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'grid', placeItems: 'center', background: 'rgba(28,31,35,0.28)' }} onClick={cancel}>
      <div onClick={(e) => e.stopPropagation()}>
        <CmsPanel
          title="Sketch the image"
          eyebrow="Draw with your mouse"
          width={PAD_W + 40}
          onClose={cancel}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <CmsButton variant="ghost" size="sm" iconLeft={<CmsIcon name="undo" size={14} />} onClick={undo} disabled={count === 0}>Undo</CmsButton>
                <CmsButton variant="ghost" size="sm" iconLeft={<CmsIcon name="trash" size={14} />} onClick={clear} disabled={count === 0}>Reset</CmsButton>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <CmsButton variant="soft" size="sm" onClick={cancel}>Cancel</CmsButton>
                <CmsButton variant="solid" size="sm" iconLeft={<CmsIcon name="check" size={14} />} onClick={onCommit}>Save</CmsButton>
              </div>
            </div>
          }
        >
          {/* The image sketcher comes first */}
          <canvas
            ref={canvasRef}
            width={PAD_W}
            height={PAD_H}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            style={{
              width: '100%',
              aspectRatio: `${PAD_W} / ${PAD_H}`,
              background: '#fff',
              border: '1px solid var(--cms-border)',
              borderRadius: 'var(--cms-radius)',
              touchAction: 'none',
              cursor: 'crosshair',
              display: 'block',
            }}
          />
          <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.3 var(--font-cms-sans)', color: 'var(--cms-ink-faint)' }}>
            Grey pencil stroke. A drawing replaces the preset. Reset clears the canvas; Cancel keeps the previous drawing.
          </span>

          {/* Settings below the sketcher */}
          <CmsSegmented label="Preset" options={PRESETS} value={chapter.motif} onChange={(v) => onChange({ motif: v })} />
          <CmsSegmented iconsOnly label="Image position" options={POSITIONS} value={imgLayout(chapter)} onChange={(v) => onChange({ template: v })} />
          {(imgLayout(chapter) === 'image-left' || imgLayout(chapter) === 'image-right') && (
            <CmsSegmented label="Image width" options={[{ value: 'half', label: 'Half' }, { value: 'two-thirds', label: 'Two-thirds' }]} value={chapter.imageWidth} onChange={(v) => onChange({ imageWidth: v })} />
          )}
          <CmsToggle label="Image frame" hint="Off by default — adds a light pencil border" checked={!!chapter.showFrame} onChange={(v) => onChange({ showFrame: v })} />
          <CmsField label="Image note" value={chapter.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} hint="What the picture will show" />
        </CmsPanel>
      </div>
    </div>
  );
}
