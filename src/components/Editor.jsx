'use client';

import React from 'react';
import {
  Chapter, SketchHeading, SketchText, SketchButton, ImageSketch,
  CmsPanel, CmsField, CmsSegmented, CmsToggle, CmsButton,
  CmsIconButton, CmsIcon,
} from '@/ds';
import { SketchPad, SketchSvg } from './SketchPad';

/* ---------------- constants ---------------- */

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

// The image layout for a chapter, normalising any legacy 'text-only' template
// (text-only is now driven by showImage, not the template value).
function imageLayout(c) {
  return c.template && c.template !== 'text-only' ? c.template : 'image-right';
}

// Render the body string: each line is its own paragraph; consecutive lines that
// start with "- " (or "• ") become a bulleted list. `tail` (e.g. the edit button)
// is placed inline right after the last line of text.
function renderBody(text, tail) {
  const lines = (text || '').split('\n');
  const blocks = [];
  let bullets = null;
  const flush = () => { if (bullets) { blocks.push({ type: 'ul', items: bullets }); bullets = null; } };
  lines.forEach((raw) => {
    const m = /^\s*[-•]\s+(.*)$/.exec(raw);
    if (m) { (bullets ||= []).push(m[1]); return; }
    flush();
    if (raw.trim() !== '') blocks.push({ type: 'p', text: raw });
  });
  flush();

  const inlineTail = tail ? <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '10px' }}>{tail}</span> : null;
  const last = blocks.length - 1;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {blocks.map((b, i) => b.type === 'ul' ? (
        <ul key={i} style={{ margin: 0, paddingLeft: '1.3em', display: 'grid', gap: 'var(--space-2)' }}>
          {b.items.map((it, j) => (
            <li key={j} style={{ font: '400 var(--wf-lead)/1.5 var(--font-wf-hand)', color: 'var(--wf-line-soft)' }}>
              {it}{i === last && j === b.items.length - 1 ? inlineTail : null}
            </li>
          ))}
        </ul>
      ) : (
        <SketchText key={i} variant="lead" style={{ color: 'var(--wf-line-soft)' }}>
          {b.text}{i === last ? inlineTail : null}
        </SketchText>
      ))}
    </div>
  );
}

/* Selected stories grouped by their pillar, in pillar order. A pillar only
   appears if at least one of its stories is selected (cross-pillar = multiple
   pillars can show). */
function selectedByPillar(site, c) {
  const ids = new Set(c.storyIds || []);
  return site.pillars
    .map((p) => ({ pillar: p, stories: p.stories.filter((s) => ids.has(s.id)) }))
    .filter((g) => g.stories.length > 0);
}

/* A small "i" marker that reveals the selected brand messages on hover —
   keeps the wireframe itself uncluttered. */
function BrandTag({ stories }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span aria-label="Brand messages" style={{
        width: 18, height: 18, borderRadius: 999,
        border: '1.5px solid var(--wf-ink-soft)', color: 'var(--wf-ink-soft)',
        display: 'grid', placeItems: 'center', cursor: 'help',
        font: 'italic 700 11px/1 Georgia, "Times New Roman", serif',
      }}>i</span>
      {open && (
        <span role="tooltip" style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, zIndex: 30,
          minWidth: 180, maxWidth: 300,
          background: 'var(--wf-paper)', border: '1px solid var(--cms-border)',
          borderRadius: 'var(--cms-radius)', boxShadow: 'var(--cms-shadow-2)',
          padding: '8px 12px', display: 'grid', gap: '3px',
          font: '400 9pt/1.4 var(--font-cms-sans)', color: 'var(--wf-ink-soft)',
        }}>
          <span style={{ font: 'var(--cms-weight-semibold) var(--cms-tiny)/1 var(--font-cms-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--cms-ink-faint)', marginBottom: 2 }}>Brand messages</span>
          {stories.map((s) => <span key={s.id}>{s.name}</span>)}
        </span>
      )}
    </span>
  );
}

/* Wireframe annotation: an info marker that reveals the selected substories. */
function annotationFor(site, c) {
  const stories = selectedByPillar(site, c).flatMap((g) => g.stories);
  if (stories.length === 0) return null;
  return <BrandTag stories={stories} />;
}

/* ---------------- branding chrome ---------------- */

function Wordmark() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: '700 1.9rem/1 var(--font-wf-display)', color: 'var(--wf-ink-strong)' }}>
      <span aria-hidden="true" style={{ fontSize: '1.1em' }}>✎</span> lousupp
    </span>
  );
}

function Header({ unlocked, onUnlock, onLock, onSort }) {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--wf-paper) 86%, transparent)', backdropFilter: 'blur(6px)' }}>
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto', padding: '18px var(--page-gutter)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <Wordmark />
        <div className="cms" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unlocked && (
            <CmsButton variant="soft" size="sm" iconLeft={<CmsIcon name="grip" size={14} />} onClick={onSort}>
              Sort
            </CmsButton>
          )}
          {unlocked ? (
            <CmsButton variant="soft" size="sm" iconLeft={<CmsIcon name="unlock" size={14} />} onClick={onLock}>
              Editing on
            </CmsButton>
          ) : (
            <CmsButton variant="solid" size="sm" iconLeft={<CmsIcon name="lock" size={14} />} onClick={onUnlock}>
              Editing off
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

/* ---------------- paragraph field with bullets ---------------- */

/* Multiline paragraph editor. Enter starts a new paragraph; a "Bullet" button
   toggles "- " at the start of the selected line(s). */
function ParagraphField({ value, onChange }) {
  const ref = React.useRef(null);
  const taStyle = {
    width: '100%', boxSizing: 'border-box', padding: '9px 11px',
    font: 'var(--cms-weight-regular) var(--cms-body)/1.55 var(--font-cms-sans)',
    color: 'var(--cms-ink)', background: 'var(--cms-canvas)',
    border: '1px solid var(--cms-border)', borderRadius: 'var(--cms-radius)',
    resize: 'vertical', outline: 'none',
  };

  const toggleBullet = () => {
    const ta = ref.current;
    const text = value || '';
    const start = ta ? ta.selectionStart : text.length;
    const end = ta ? ta.selectionEnd : text.length;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = text.length;
    const block = text.slice(lineStart, lineEnd);
    const lines = block.split('\n');
    const allBulleted = lines.every((l) => l.trim() === '' || /^\s*[-•]\s+/.test(l));
    const next = lines.map((l) => {
      if (l.trim() === '') return l;
      return allBulleted ? l.replace(/^(\s*)[-•]\s+/, '$1') : `- ${l}`;
    }).join('\n');
    onChange(text.slice(0, lineStart) + next + text.slice(lineEnd));
    requestAnimationFrame(() => ta && ta.focus());
  };

  return (
    <label className="cms" style={{ display: 'grid', gap: '6px' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ font: 'var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink-soft)' }}>Paragraph</span>
        <CmsButton variant="ghost" size="sm" iconLeft={<CmsIcon name="list" size={14} />} onClick={toggleBullet} style={{ padding: '3px 8px' }}>Bullet</CmsButton>
      </span>
      <textarea
        ref={ref}
        className="cms-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Write the paragraph…"
        style={taStyle}
      />
      <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)', color: 'var(--cms-ink-faint)' }}>
        Enter starts a new paragraph. Start a line with “- ” (or use Bullet) for a list.
      </span>
    </label>
  );
}

/* ---------------- brand messages (pop-up) ---------------- */

/* A parent checkbox that shows the tri-state of its children. It can't be
   "on" without children — clicking it selects all / clears all stories. */
function ParentCheckbox({ checked, indeterminate, onChange }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange}
      style={{ width: 16, height: 16, accentColor: 'var(--cms-solid)', cursor: 'pointer' }} />
  );
}

/* The Brand messages pop-up: the full list, grouped by main pillar. Story
   checkboxes drive selection; a pillar is "active" only when ≥1 story is on.
   Stories from multiple pillars can be selected at once. */
function BrandMessages({ pillars, selected, onChange, onClose }) {
  const sel = new Set(selected || []);

  const toggleStory = (id) => {
    const n = new Set(sel);
    n.has(id) ? n.delete(id) : n.add(id);
    onChange([...n]);
  };
  const togglePillar = (p) => {
    const ids = p.stories.map((s) => s.id);
    const any = ids.some((id) => sel.has(id));
    const n = new Set(sel);
    if (any) ids.forEach((id) => n.delete(id));
    else ids.forEach((id) => n.add(id));
    onChange([...n]);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 65, display: 'grid', placeItems: 'center', background: 'rgba(28,31,35,0.28)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <CmsPanel
          title="Brand messages"
          eyebrow="What this chapter says"
          width={440}
          onClose={onClose}
          footer={<CmsButton variant="solid" iconLeft={<CmsIcon name="check" size={15} />} onClick={onClose}>Done</CmsButton>}
        >
          {pillars.map((p, pi) => {
            const ids = p.stories.map((s) => s.id);
            const selCount = ids.filter((id) => sel.has(id)).length;
            const all = ids.length > 0 && selCount === ids.length;
            const any = selCount > 0;
            return (
              <div key={p.id} style={{ display: 'grid', gap: '8px', paddingBottom: pi < pillars.length - 1 ? '14px' : 0, borderBottom: pi < pillars.length - 1 ? '1px solid var(--cms-border)' : 'none' }}>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                  <ParentCheckbox checked={any} indeterminate={any && !all} onChange={() => togglePillar(p)} />
                  <span style={{ font: 'var(--cms-weight-semibold) var(--cms-body)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink)' }}>{p.name}</span>
                </label>
                <div style={{ display: 'grid', gap: '6px', paddingLeft: 24 }}>
                  {p.stories.map((s) => (
                    <label key={s.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input type="checkbox" checked={sel.has(s.id)} onChange={() => toggleStory(s.id)}
                        style={{ marginTop: 2, width: 15, height: 15, accentColor: 'var(--cms-solid)', cursor: 'pointer' }} />
                      <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)', color: 'var(--cms-ink)' }}>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </CmsPanel>
      </div>
    </div>
  );
}

/* ---------------- sort chapters (pop-up) ---------------- */

/* Reorder the titled chapters. Only chapters the user has given a title appear
   — for the user, the title is the identifier. */
function SortPanel({ items, onMove, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 65, display: 'grid', placeItems: 'center', background: 'rgba(28,31,35,0.28)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <CmsPanel
          title="Sort chapters"
          eyebrow="Reorder by title"
          width={400}
          onClose={onClose}
          footer={<CmsButton variant="solid" iconLeft={<CmsIcon name="check" size={15} />} onClick={onClose}>Done</CmsButton>}
        >
          {items.length === 0 ? (
            <span style={{ font: 'var(--cms-weight-regular) var(--cms-meta)/1.4 var(--font-cms-sans)', color: 'var(--cms-ink-faint)' }}>
              No titled chapters yet — give a chapter a title and it will appear here to sort.
            </span>
          ) : (
            <div style={{ display: 'grid', gap: '6px' }}>
              {items.map((it, k) => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', border: '1px solid var(--cms-border)', borderRadius: 'var(--cms-radius)', background: 'var(--cms-surface)' }}>
                  <span style={{ flex: 1, font: 'var(--cms-weight-medium) var(--cms-body)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</span>
                  <CmsIconButton icon={<CmsIcon name="chevronDown" size={16} style={{ transform: 'rotate(180deg)' }} />} label="Move up" disabled={k === 0} onClick={() => onMove(k, k - 1)} style={{ opacity: k === 0 ? 0.4 : 1 }} />
                  <CmsIconButton icon={<CmsIcon name="chevronDown" size={16} />} label="Move down" disabled={k === items.length - 1} onClick={() => onMove(k, k + 1)} style={{ opacity: k === items.length - 1 ? 0.4 : 1 }} />
                </div>
              ))}
            </div>
          )}
        </CmsPanel>
      </div>
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
  const [sketchId, setSketchId] = React.useState(null);
  const [messagesOpen, setMessagesOpen] = React.useState(false);
  const [sortOpen, setSortOpen] = React.useState(false);
  const [saveState, setSaveState] = React.useState('idle'); // idle | saving | saved | error

  const current = site.chapters.find((c) => c.id === editing) || null;
  const sketchChapter = site.chapters.find((c) => c.id === sketchId) || null;

  // Bring a chapter into view when it's being adjusted. 'nearest' means no jitter
  // if it's already visible; it only scrolls when the chapter is off-screen.
  const revealChapter = React.useCallback((id, block = 'nearest') => {
    if (typeof document === 'undefined') return;
    requestAnimationFrame(() => {
      document.getElementById(`chapter-${id}`)?.scrollIntoView({ behavior: 'smooth', block });
    });
  }, []);

  const update = (id, patch) => {
    setSite((s) => ({ ...s, chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    revealChapter(id);
  };

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

  // Save (persist) when the sketch panel is committed — it can be opened on its
  // own from the image pencil, so it needs to persist independently.
  async function commitSketch() {
    await save();
    setSketchId(null);
  }

  // Titled chapters (the user-facing identifiers) + reorder among their slots,
  // leaving untitled chapters in place.
  const titledItems = site.chapters.filter((c) => c.title?.trim()).map((c) => ({ id: c.id, title: c.title }));
  function moveTitled(from, to) {
    setSite((s) => {
      const positions = [];
      const titled = [];
      s.chapters.forEach((c, i) => { if (c.title?.trim()) { positions.push(i); titled.push(c); } });
      if (to < 0 || to >= titled.length) return s;
      const [m] = titled.splice(from, 1);
      titled.splice(to, 0, m);
      const next = [...s.chapters];
      positions.forEach((pos, k) => { next[pos] = titled[k]; });
      return { ...s, chapters: next };
    });
  }
  async function closeSort() {
    await save();
    setSortOpen(false);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header unlocked={unlocked} onUnlock={() => setShowUnlock(true)} onLock={lock} onSort={() => setSortOpen(true)} />

      <main>
        {site.chapters.map((c, i) => {
          const headingLevel = i === 0 ? 'display' : 'h1';
          const hasTitle = !!c.title?.trim();
          const hasBody = !!c.body?.trim();
          const layout = imageLayout(c);
          const effLayout = c.showImage ? layout : 'text-only';

          const hasSketch = c.sketch && Array.isArray(c.sketch.strokes) && c.sketch.strokes.length > 0;
          const showSketch = hasSketch && !c.sketchHidden;
          const image = c.showImage ? (
            <ImageSketch
              motif={c.motif}
              aspect={layout === 'image-full' ? '21 / 9' : '4 / 3'}
              caption={c.caption}
              frame={c.showFrame}
              seed={(i % 2) + 1}
              overlay={unlocked ? (
                <div className="cms" style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 5 }}>
                  <CmsIconButton size={30} icon={<CmsIcon name="edit" size={15} />} label="Sketch the image" onClick={() => setSketchId(c.id)}
                    style={{ background: 'var(--cms-canvas)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow-1)' }} />
                </div>
              ) : null}
            >
              {showSketch ? <SketchSvg sketch={c.sketch} /> : null}
            </ImageSketch>
          ) : null;

          const title = (
            <SketchHeading level={headingLevel} style={hasTitle ? undefined : { color: 'var(--wf-line-soft)' }}>
              {hasTitle ? c.title : 'Chapter title'}
            </SketchHeading>
          );
          const editBtn = unlocked ? (
            <CmsIconButton
              size={30}
              icon={<CmsIcon name="text" size={15} />}
              label="Edit text"
              active={editing === c.id}
              onClick={() => setEditing(editing === c.id ? null : c.id)}
              style={{ background: 'var(--cms-canvas)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow-1)' }}
            />
          ) : null;
          const body = hasBody ? renderBody(c.body, editBtn) : (
            <SketchText variant="lead" style={{ color: 'var(--wf-line-ghost)' }}>
              Write the paragraph for this chapter — two or three sentences read best.
              {editBtn ? <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '10px' }}>{editBtn}</span> : null}
            </SketchText>
          );

          const actions = (c.primaryCta || c.secondaryCta) ? (
            <>
              {c.primaryCta && <SketchButton variant="primary" seed={(i % 2) + 1}>{c.primaryCta}</SketchButton>}
              {c.secondaryCta && <SketchButton variant="secondary" seed={(i % 2) + 2}>{c.secondaryCta}</SketchButton>}
            </>
          ) : null;

          return (
            <Chapter
              key={c.id}
              id={`chapter-${c.id}`}
              layout={effLayout}
              imageWidth={c.imageWidth}
              eyebrow={c.eyebrow || null}
              title={title}
              body={body}
              image={image}
              actions={actions}
              annotation={annotationFor(site, c)}
            />
          );
        })}
      </main>

      <Footer />

      {current && (
        <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 40, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <CmsPanel
              eyebrow="Editing"
              title={current.title?.trim() ? current.title : 'Untitled'}
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
              <CmsField label="Eyebrow" value={current.eyebrow || ''} onChange={(e) => update(current.id, { eyebrow: e.target.value })} placeholder="small line above the title" hint="Optional — a quiet label above the title." />

              <CmsField label="Title" value={current.title} onChange={(e) => update(current.id, { title: e.target.value })} placeholder="Chapter title" />
              <FieldHistory history={current.titleHistory} onRestore={(v) => update(current.id, { title: v })} />

              <ParagraphField value={current.body} onChange={(v) => update(current.id, { body: v })} />
              <FieldHistory history={current.bodyHistory} onRestore={(v) => update(current.id, { body: v })} />

              <CmsField label="Primary button" value={current.primaryCta || ''} onChange={(e) => update(current.id, { primaryCta: e.target.value })} placeholder="e.g. Shop now" hint="Leave empty to hide." />
              <CmsField label="Secondary button" value={current.secondaryCta || ''} onChange={(e) => update(current.id, { secondaryCta: e.target.value })} placeholder="e.g. Learn more" hint="Leave empty to hide." />

              <CmsToggle label="Show image" hint={current.showImage ? 'Layout, width & frame live in the image panel — the pencil on the image' : 'Off makes a text-only chapter'} checked={current.showImage} onChange={(v) => update(current.id, { showImage: v })} />

              <div className="cms" style={{ display: 'grid', gap: '6px' }}>
                <span style={{ font: 'var(--cms-weight-medium) var(--cms-label)/1.2 var(--font-cms-sans)', color: 'var(--cms-ink-soft)' }}>Brand messages</span>
                <CmsButton variant="soft" iconLeft={<CmsIcon name="text" size={14} />} onClick={() => setMessagesOpen(true)}>
                  {(() => { const n = (current.storyIds || []).length; return n === 0 ? 'Choose brand messages' : `${n} message${n === 1 ? '' : 's'} selected`; })()}
                </CmsButton>
              </div>
            </CmsPanel>
          </div>
        </div>
      )}

      {showUnlock && (
        <UnlockModal onClose={() => setShowUnlock(false)} onUnlocked={() => { setUnlocked(true); setShowUnlock(false); }} />
      )}

      {sketchChapter && (
        <SketchPad
          key={sketchChapter.id}
          chapter={sketchChapter}
          onChange={(patch) => update(sketchChapter.id, patch)}
          onCommit={commitSketch}
          onCancel={() => setSketchId(null)}
        />
      )}

      {messagesOpen && current && (
        <BrandMessages
          pillars={site.pillars}
          selected={current.storyIds}
          onChange={(storyIds) => update(current.id, { storyIds })}
          onClose={() => setMessagesOpen(false)}
        />
      )}

      {sortOpen && (
        <SortPanel items={titledItems} onMove={moveTitled} onClose={closeSort} />
      )}
    </div>
  );
}
