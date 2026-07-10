import { NextResponse } from 'next/server';
import { getSite, createPage } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — public list of pages (without chapter bodies).
export async function GET() {
  const site = await getSite();
  const pages = site.pages.map(({ id, slug, title, createdAt, updatedAt, chapters }) => ({
    id, slug, title, createdAt, updatedAt, chapterCount: chapters.length,
  }));
  return NextResponse.json({ pages });
}

// POST { title } — create a new page (edit-gated).
export async function POST(request) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  let body = {};
  try { body = await request.json(); } catch { /* ignore */ }
  const page = await createPage(body.title || '');
  return NextResponse.json(page, { status: 201 });
}
