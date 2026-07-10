// Storage adapter. ONE async API regardless of backend:
//   getSite() -> doc (v2)   plus page-level ops: createPage / savePage / deletePage
//
// Backend is chosen by environment:
//   - Vercel KV / Upstash (KV_REST_API_URL present) -> shared JSON doc, key "site"
//   - otherwise (local dev)                         -> data/site.json on disk
//
// Document shape (v2):
//   { version: 2, pillars: [...], pages: [{ id, slug, title, createdAt,
//     updatedAt, chapters: [...] }] }
// A v1 doc ({ chapters }) is migrated in place: its chapters become the first
// page ("Night Formula" at /p/night-formula), so existing URLs keep working.
//
// History (title/paragraph, capped 30, newest-first) is maintained HERE, on
// save, by comparing the incoming page to the stored one. The server is the
// authoritative owner of history — clients never write it directly.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { makeSeed, emptyChapters } from './seed.js';

const HISTORY_CAP = 30;
const KEY = 'site';

// Works with either the Vercel-KV style vars or the Upstash marketplace vars.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useKv = !!KV_URL;

/* ---------------- backends ---------------- */

let _kv;
async function kvClient() {
  if (!_kv) {
    const { createClient } = await import('@vercel/kv');
    _kv = createClient({ url: KV_URL, token: KV_TOKEN });
  }
  return _kv;
}
async function kvRead() {
  const kv = await kvClient();
  return (await kv.get(KEY)) || null;
}
async function kvWrite(doc) {
  const kv = await kvClient();
  await kv.set(KEY, doc);
  return doc;
}

const FILE = () => path.join(process.cwd(), 'data', 'site.json');

async function fileRead() {
  try {
    return JSON.parse(await readFile(FILE(), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
async function fileWrite(doc) {
  await mkdir(path.dirname(FILE()), { recursive: true });
  await writeFile(FILE(), JSON.stringify(doc, null, 2), 'utf8');
  return doc;
}

const read = useKv ? kvRead : fileRead;
const write = useKv ? kvWrite : fileWrite;

/* ---------------- migration ---------------- */

function migrate(doc) {
  if (!doc) return null;
  if (doc.version >= 2 && Array.isArray(doc.pages)) return doc;
  const now = new Date().toISOString();
  return {
    version: 2,
    pillars: doc.pillars || [],
    pages: [{
      id: 'p1',
      slug: 'night-formula',
      title: 'Night Formula',
      createdAt: now,
      updatedAt: now,
      chapters: doc.chapters || [],
    }],
  };
}

/* ---------------- helpers ---------------- */

export function slugify(title) {
  return (title || 'untitled')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function uniqueSlug(doc, base) {
  let slug = base;
  let n = 2;
  while (doc.pages.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
  return slug;
}

/* ---------------- public API ---------------- */

export async function getSite() {
  const stored = await read();
  if (!stored) return write(migrate(makeSeed()));
  const migrated = migrate(stored);
  if (migrated !== stored) await write(migrated);
  return migrated;
}

export async function getPageBySlug(slug) {
  const doc = await getSite();
  return doc.pages.find((p) => p.slug === slug) || null;
}

export async function createPage(title) {
  const doc = await getSite();
  const now = new Date().toISOString();
  const id = `pg-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
  const page = {
    id,
    slug: uniqueSlug(doc, slugify(title)),
    title: title?.trim() || 'Untitled',
    createdAt: now,
    updatedAt: now,
    chapters: emptyChapters(8),
  };
  doc.pages.push(page);
  await write(doc);
  return page;
}

// Save one page; recompute title/body history per chapter server-side.
export async function savePage(pageId, incoming) {
  const doc = await getSite();
  const idx = doc.pages.findIndex((p) => p.id === pageId);
  if (idx === -1) return null;
  const stored = doc.pages[idx];
  const storedById = new Map(stored.chapters.map((c) => [c.id, c]));
  const now = new Date().toISOString();

  const chapters = (incoming.chapters || []).map((c) => {
    const prev = storedById.get(c.id);
    const titleHistory = prev ? prev.titleHistory || [] : [];
    const bodyHistory = prev ? prev.bodyHistory || [] : [];

    let nextTitleHistory = titleHistory;
    if (prev && (prev.title || '') !== (c.title || '') && (prev.title || '') !== '') {
      nextTitleHistory = [{ value: prev.title, at: now }, ...titleHistory].slice(0, HISTORY_CAP);
    }
    let nextBodyHistory = bodyHistory;
    if (prev && (prev.body || '') !== (c.body || '') && (prev.body || '') !== '') {
      nextBodyHistory = [{ value: prev.body, at: now }, ...bodyHistory].slice(0, HISTORY_CAP);
    }
    return { ...c, titleHistory: nextTitleHistory, bodyHistory: nextBodyHistory };
  });

  const page = {
    ...stored,
    title: typeof incoming.title === 'string' && incoming.title.trim() ? incoming.title.trim() : stored.title,
    chapters,
    updatedAt: now,
  };
  doc.pages[idx] = page;
  await write(doc);
  return page;
}

export async function deletePage(pageId) {
  const doc = await getSite();
  const before = doc.pages.length;
  doc.pages = doc.pages.filter((p) => p.id !== pageId);
  if (doc.pages.length === before) return false;
  await write(doc);
  return true;
}
