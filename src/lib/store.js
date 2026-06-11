// Storage adapter. ONE async API regardless of backend:
//   getSite() -> doc      saveSite(doc) -> doc
//
// Backend is chosen by environment:
//   - Vercel KV  (KV_REST_API_URL present)  -> shared JSON doc, key "site"
//   - otherwise  (local dev)                -> data/site.json on disk
//
// History (title/paragraph, capped 30, newest-first) is maintained HERE, on
// save, by comparing the incoming doc to the stored one. The server is the
// authoritative owner of history — clients never write it directly.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { makeSeed } from './seed.js';

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

/* ---------------- public API ---------------- */

export async function getSite() {
  const stored = await read();
  if (stored) return stored;
  // first run: persist the seed so the doc exists as the source of truth
  return write(makeSeed());
}

// Merge an incoming doc with stored history. For every chapter, if title/body
// changed, push the PREVIOUS value (with timestamp) onto its history, capped.
export async function saveSite(incoming) {
  const stored = (await read()) || makeSeed();
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

  const doc = {
    version: incoming.version || stored.version || 1,
    pillars: incoming.pillars || stored.pillars,
    chapters,
  };
  return write(doc);
}
