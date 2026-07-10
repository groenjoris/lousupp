'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  SketchHeading, SketchText, SketchButton, SketchFrame,
  CmsButton, CmsIconButton, CmsIcon, CmsPanel, CmsField,
} from '@/ds';

function Wordmark() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: '700 1.9rem/1 var(--font-wf-display)', color: 'var(--wf-ink-strong)' }}>
      <span aria-hidden="true" style={{ fontSize: '1.1em' }}>✎</span> lousupp
    </span>
  );
}

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
            label="Password" type="password" value={password}
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

function PageRow({ page, unlocked, onDelete }) {
  const [copied, setCopied] = React.useState(false);
  const seed = (page.slug.length % 5) + 1;

  async function share(e) {
    e.preventDefault();
    const url = `${window.location.origin}/p/${page.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this link', url);
    }
  }

  return (
    <a
      href={`/p/${page.slug}`}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 22px', textDecoration: 'none', color: 'inherit',
      }}
    >
      <SketchFrame radius={12} stroke={1.5} color="var(--wf-line-ghost)" roughness={2} seed={seed} />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, display: 'grid', gap: 2 }}>
        <span style={{ font: '400 1.7rem/1.15 var(--font-wf-display)', color: 'var(--wf-ink-strong)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {page.title}
        </span>
        <span style={{ font: '400 0.85rem/1.3 var(--font-cms-sans)', color: 'var(--wf-ink-faint)' }}>
          /p/{page.slug} · {page.chapterCount} chapters · edited {relativeTime(page.updatedAt)}
        </span>
      </div>
      <div className="cms" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.preventDefault()}>
        <CmsButton variant="soft" size="sm" onClick={share}>{copied ? 'Copied!' : 'Share'}</CmsButton>
        {unlocked && (
          <CmsIconButton icon={<CmsIcon name="trash" size={15} />} label="Delete page" onClick={(e) => { e.preventDefault(); onDelete(page); }} />
        )}
      </div>
    </a>
  );
}

export default function StartScreen({ initialPages, initialUnlocked }) {
  const router = useRouter();
  const [pages, setPages] = React.useState(initialPages);
  const [unlocked, setUnlocked] = React.useState(initialUnlocked);
  const [showUnlock, setShowUnlock] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  async function lock() {
    await fetch('/api/auth', { method: 'DELETE' });
    setUnlocked(false);
  }

  async function create() {
    if (!newTitle.trim() || busy) return;
    setBusy(true);
    const res = await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) });
    setBusy(false);
    if (res.status === 401) { setUnlocked(false); setShowUnlock(true); return; }
    if (!res.ok) return;
    const page = await res.json();
    router.push(`/p/${page.slug}`);
  }

  async function doDelete(page) {
    setBusy(true);
    const res = await fetch(`/api/pages/${page.id}`, { method: 'DELETE' });
    setBusy(false);
    setConfirmDelete(null);
    if (res.status === 401) { setUnlocked(false); setShowUnlock(true); return; }
    if (res.ok) setPages((ps) => ps.filter((p) => p.id !== page.id));
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'color-mix(in srgb, var(--wf-paper) 86%, transparent)', backdropFilter: 'blur(6px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px var(--page-gutter)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Wordmark />
          <div className="cms">
            {unlocked ? (
              <CmsButton variant="soft" size="sm" iconLeft={<CmsIcon name="unlock" size={14} />} onClick={lock}>Editing on</CmsButton>
            ) : (
              <CmsButton variant="solid" size="sm" iconLeft={<CmsIcon name="lock" size={14} />} onClick={() => setShowUnlock(true)}>Editing off</CmsButton>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px var(--page-gutter) 96px', display: 'grid', gap: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          <SketchHeading level="h1">Your pages</SketchHeading>
          <SketchText variant="caption">Wireframes drawn in pencil — open one to view or edit, share the link with anyone.</SketchText>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {pages.length === 0 && (
            <SketchText variant="lead" style={{ color: 'var(--wf-line-soft)' }}>No pages yet — create the first one below.</SketchText>
          )}
          {pages.map((p) => (
            <PageRow key={p.id} page={p} unlocked={unlocked} onDelete={setConfirmDelete} />
          ))}
        </div>

        {unlocked ? (
          creating ? (
            <div className="cms" style={{ display: 'flex', gap: 8, alignItems: 'flex-end', maxWidth: 420 }}>
              <CmsField
                label="New page" value={newTitle} placeholder="Page name — e.g. Night Formula v2"
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setCreating(false); }}
                style={{ flex: 1 }}
                autoFocus
              />
              <CmsButton variant="solid" onClick={create} disabled={busy || !newTitle.trim()}>{busy ? 'Creating…' : 'Create'}</CmsButton>
              <CmsButton variant="ghost" onClick={() => { setCreating(false); setNewTitle(''); }}>Cancel</CmsButton>
            </div>
          ) : (
            <div>
              <SketchButton variant="primary" onClick={() => setCreating(true)}>+ New page</SketchButton>
            </div>
          )
        ) : (
          <SketchText variant="caption" style={{ color: 'var(--wf-ink-faint)' }}>Unlock editing to create or delete pages.</SketchText>
        )}
      </main>

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'grid', placeItems: 'center', background: 'rgba(28,31,35,0.28)' }} onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CmsPanel title="Delete page" eyebrow={confirmDelete.title} width={360} onClose={() => setConfirmDelete(null)}
              footer={
                <>
                  <CmsButton variant="soft" onClick={() => setConfirmDelete(null)}>Cancel</CmsButton>
                  <CmsButton variant="solid" iconLeft={<CmsIcon name="trash" size={14} />} onClick={() => doDelete(confirmDelete)} disabled={busy}>
                    {busy ? 'Deleting…' : 'Delete forever'}
                  </CmsButton>
                </>
              }
            >
              <span style={{ font: 'var(--cms-weight-regular) var(--cms-body)/1.5 var(--font-cms-sans)', color: 'var(--cms-ink)' }}>
                This removes “{confirmDelete.title}” and all its chapters, drawings and history. There is no undo.
              </span>
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
