'use client';

import React from 'react';
import {
  Chapter, SketchHeading, SketchText, SketchButton, ImageSketch,
  EditTrigger, CmsPanel, CmsField, CmsSegmented, CmsToggle, CmsButton,
  CmsIconButton, CmsIcon,
} from '@/ds';

/* ---------------- constants ---------------- */

const LAYOUTS = [
  { value: 'image-left', label: 'Left', icon: <CmsIcon name="image-left" size={20} /> },
  { value: 'image-right', label: 'Right', icon: <CmsIcon name="image-right" size={20} /> },
  { value: 'image-full', label: 'Full', icon: <CmsIcon name="image-full" size={20} /> },
  { value: 'image-below', label: 'Below', icon: <CmsIcon name="image-below" size={20} /> },
  { value: 'text-only', label: 'Text', icon: <CmsIcon name="text-only" size={20} /> },
];
const MOTIFS = [
  { value: 'landscape', label: 'Scene' },
  { value: 'portrait', label: 'Person' },
  { value: 'abstract', label: 'Abstract' },
];

/* ---------------- helpers ---------------- */

function relativeTime(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const s = Math.round((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(iso).toLocaleDateString();
}

function pillarById(site, id) {
  return site.pillars.find((p) => p.id === id) || null;
}

/* Faint handwritten annotation: pillar name + chosen story names. */
function annotationFor(site, c) {
  const pillar = pillarById(site, c.pillarId);
  if (!pillar) return null;
  const stories = pillar.stories.filter((s) => (c.storyIds || []).includes(s.id));
  return (
    <span>
      {pillar.name}
      {stories.length > 0 && (
        <>
          {' — '}
          {stories.map((s) => s.name).join(' · ')}
        </>
      )}
    </span>
  );
}

/* ---------------- branding chrome ---------------- */

function Wordmark() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: '700 1.9rem/1 var(--font-wf-display)', color: 'var(--wf-ink-strong)' }}>
      <span aria-hidden="true" style={{ fontSize: '1.1em' }}>✎</span> lousupp
    </span>
  );
}

function Header({ unlocked, onUnlock, onLock }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--wf-paper) 86%, transparent)', backdropFilter: 'blur(6px)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '18px var(--page-gutter)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Wordmark />
        <div className="cms">
          {unlocked ? (
            <CmsButton variant="soft" size="sm" iconLeft={<CmsIcon name="eye" size={14} />} onClick={onLock}>
              Editing on — lock
            </CmsButton>
          ) : (
            <CmsButton variant="solid" size="sm" iconLeft={<CmsIcon name="edit" size={14} />} onClick={onUnlock}>
              Unlock to edit
            </CmsButton>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ padding: 'var(--space-9) var(--page-gutter) var(--space-8)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark />
        <SketchText variant="caption">a wireframe, drawn in pencil</SketchText>
      </div>
    </footer>
  );
}

/* ---------------- field history (title / paragraph) ---------------- */

function FieldHistory({ history, onRestore }) {
  const [open, setOpen] = React.useState(false);
  const count = history?.length || 0;

  return (
    <div className="cms" style={{ display: 'grid', gap: '6px' }}>
      <CmsButton
        variant="ghost"
        size="sm"
        iconLeft={<CmsIcon name="undo" size={14} />}
        onClick={() => setOpen((o) => !o)}
        disabled={count === 0}
        style={{ justifySelf: 'start', opacity: count === 0 ? 0.5 : 1, paddingLeft: 0 }}
      >
        {count === 0 ? 'No earlier versions' : `History — ${count} earlier ${count === 1 ? 'version' : 'versions'}`}
      </CmsButton>
      {open && count > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '6px', maxHeight: 220, overflowY: 'auto', border: '1px solid var(--cms-border)', borderRadius: 'var(--cms-radius)', background: 'var(--cms-surface)' }}>
          {history.map((v, i) => (
            <li key={i} style={{ padding: '8px 10px', borderBottom: i < history.length - 1 ? '1px solid var(--cms-border)' : 'none', display: 'grid', gap: '4px' }}>
              <span style={{ font: 'var(--cms-weight-regular) var(--cms-tiny)/1 var(--font-cms-mono)', color: 'var(--cms-ink-faint)' }}>{relativeTime(v.at)}</span>
              <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)', color: 'var(--cms-ink-soft)' }}>
                {v.value.length > 120 ? v.value.slice(0, 120) + '…' : v.value}
              </span>
              <CmsButton variant="soft" size="sm" onClick={() => onRestore(v.value)} style={{ justifySelf: 'start' }}>
                Restore this
              </CmsButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- pillar + stories ---------------- */

function PillarPicker({ site, chapter, onChange }) {
  const pillar = pillarById(site, chapter.pillarId);
  const selectStyle = {
    width: '100%', boxSizing: 'border-box', padding: '7px 11px',
    font: 'var(--cms-weight-regular) var(--cms-body)/1.5 var(--font-cms-sans)',
    color: 'var(--cms-ink)', background: 'var(--cms-canvas)',
    border: '1px solid var(--cms-border)', borderRadius: 'var(--cms-radius)', outline: 'none',
  };
  return (
    <div className="cms" style={{ display: 'grid', gap: '10px' }}>
      <label style={{ display: 'grid', gap: '6px' }}>
        <span style={{ font: 'var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink-soft)' }}>Message pillar</span>
        <select
          value={chapter.pillarId || ''}
          onChange={(e) => onChange({ pillarId: e.target.value || null, storyIds: [] })}
          style={selectStyle}
        >
          <option value="">— none —</option>
          {site.pillars.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      {pillar && (
        <div style={{ display: 'grid', gap: '6px' }}>
          <span style={{ font: 'var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink-soft)' }}>Stories in this pillar</span>
          <div style={{ display: 'grid', gap: '4px' }}>
            {pillar.stories.map((s) => {
              const checked = (chapter.storyIds || []).includes(s.id);
              return (
                <label key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', cursor: 'pointer', padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? chapter.storyIds.filter((id) => id !== s.id)
                        : [...(chapter.storyIds || []), s.id];
                      onChange({ storyIds: next });
                    }}
                    style={{ marginTop: 3, accentColor: 'var(--cms-solid)' }}
                  />
                  <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)', color: 'var(--cms-ink)' }}>{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- unlock prompt ---------------- */

function UnlockModal({ onClose, onUnlocked }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  async function submit() {
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      if (res.ok) { onUnlocked(); } else { setError('Wrong password'); }
    } catch { setError('Something went wrong'); }
    setBusy(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', background: 'rgba(28,31,35,0.28)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <CmsPanel title="Unlock editing" eyebrow="lousupp" width={340} onClose={onClose}
          footer={<CmsButton variant="solid" iconLeft={<CmsIcon name="check" size={15} />} onClick={submit} disabled={busy}>{busy ? 'Checking…' : 'Unlock'}</CmsButton>}
        >
          <CmsField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            hint="Editing is shared — changes are saved for everyone."
            autoFocus
          />
          {error && <span style={{ font: 'var(--cms-weight-medium) var(--cms-meta)/1.3 var(--font-cms-sans)', color: '#c0392b' }}>{error}</span>}
        </CmsPanel>
      </div>
    </div>
  );
}

/* ---------------- main editor ---------------- */

export default function Editor({ initialSite, initialUnlocked }) {
  const [site, setSite] = React.useState(initialSite);
  const [unlocked, setUnlocked] = React.useState(initialUnlocked);
  const [editing, setEditing] = React.useState(null);
  const [showUnlock, setShowUnlock] = React.useState(false);
  const [saveState, setSaveState] = React.useState('idle'); // idle | saving | saved | error

  const current = site.chapters.find((c) => c.id === editing) || null;
  const update = (id, patch) =>
    setSite((s) => ({ ...s, chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  async function save() {
    setSaveState('saving');
    try {
      const res = await fetch('/api/site', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(site),
      });
      if (res.status === 401) { setUnlocked(false); setShowUnlock(true); setSaveState('error'); return; }
      if (!res.ok) { setSaveState('error'); return; }
      const saved = await res.json();
      setSite(saved); // pick up server-recomputed history
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch {
      setSaveState('error');
    }
  }

  async function closePanel() {
    await save();
    setEditing(null);
  }

  async function lock() {
    await fetch('/api/auth', { method: 'DELETE' });
    setUnlocked(false);
    setEditing(null);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header unlocked={unlocked} onUnlock={() => setShowUnlock(true)} onLock={lock} />

      <main>
        {site.chapters.map((c, i) => {
          const headingLevel = i === 0 ? 'display' : 'h1';
          const hasTitle = !!c.title?.trim();
          const hasBody = !!c.body?.trim();
          const effLayout = c.showImage ? c.template : 'text-only';

          const image = c.showImage ? (
            <ImageSketch
              motif={c.motif}
              aspect={c.template === 'image-full' ? '21 / 9' : '4 / 3'}
              caption={c.caption}
              seed={(i % 2) + 1}
            />
          ) : null;

          const title = (
            <SketchHeading level={headingLevel} underline={i === 0} style={hasTitle ? undefined : { color: 'var(--wf-line-soft)' }}>
              {hasTitle ? c.title : 'Chapter title'}
            </SketchHeading>
          );
          const body = (
            <SketchText variant="lead" style={hasBody ? undefined : { color: 'var(--wf-line-soft)' }}>
              {hasBody ? c.body : 'Write the paragraph for this chapter — two or three sentences read best.'}
            </SketchText>
          );

          return (
            <Chapter
              key={c.id}
              layout={effLayout}
              imageWidth={c.imageWidth}
              eyebrow={c.eyebrow || null}
              title={title}
              body={body}
              image={image}
              annotation={annotationFor(site, c)}
              toolbar={unlocked ? (
                <EditTrigger label="Edit" active={editing === c.id} onClick={() => setEditing(editing === c.id ? null : c.id)} />
              ) : null}
            />
          );
        })}
      </main>

      <Footer />

      {current && (
        <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 40, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <CmsPanel
              eyebrow={`Chapter ${site.chapters.findIndex((c) => c.id === current.id) + 1}`}
              title="Edit content"
              onClose={closePanel}
              footer={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1 var(--font-cms-sans)', color: 'var(--cms-ink-faint)' }}>
                    {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : saveState === 'error' ? 'Save failed' : ''}
                  </span>
                  <CmsButton variant="solid" iconLeft={<CmsIcon name="check" size={15} />} onClick={closePanel}>Done</CmsButton>
                </div>
              }
            >
              <CmsField label="Title" value={current.title} onChange={(e) => update(current.id, { title: e.target.value })} placeholder="Chapter title" />
              <FieldHistory history={current.titleHistory} onRestore={(v) => update(current.id, { title: v })} />

              <CmsField label="Paragraph" multiline rows={4} value={current.body} onChange={(e) => update(current.id, { body: e.target.value })} placeholder="Write the paragraph…" hint="Two or three sentences reads best." />
              <FieldHistory history={current.bodyHistory} onRestore={(v) => update(current.id, { body: v })} />

              <CmsSegmented iconsOnly label="Chapter template" options={LAYOUTS} value={current.template} onChange={(v) => update(current.id, { template: v })} />
              {(current.template === 'image-left' || current.template === 'image-right') && (
                <CmsSegmented label="Image width" options={[{ value: 'half', label: 'Half' }, { value: 'two-thirds', label: 'Two-thirds' }]} value={current.imageWidth} onChange={(v) => update(current.id, { imageWidth: v })} />
              )}

              <CmsToggle label="Show image" hint="Off makes a text-only chapter" checked={current.showImage} onChange={(v) => update(current.id, { showImage: v })} />
              {current.showImage && (
                <>
                  <CmsSegmented label="Image sketch" options={MOTIFS} value={current.motif} onChange={(v) => update(current.id, { motif: v })} />
                  <CmsField label="Image note" value={current.caption} onChange={(e) => update(current.id, { caption: e.target.value })} hint="What the picture will show" />
                </>
              )}

              <PillarPicker site={site} chapter={current} onChange={(patch) => update(current.id, patch)} />
            </CmsPanel>
          </div>
        </div>
      )}

      {showUnlock && (
        <UnlockModal onClose={() => setShowUnlock(false)} onUnlocked={() => { setUnlocked(true); setShowUnlock(false); }} />
      )}
    </div>
  );
}
