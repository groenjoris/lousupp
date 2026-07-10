import { NextResponse } from 'next/server';
import { getSite, savePage, deletePage } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — public read of one page.
export async function GET(request, { params }) {
  const { id } = await params;
  const site = await getSite();
  const page = site.pages.find((p) => p.id === id);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(page);
}

// PUT — save one page (edit-gated). History is recomputed server-side.
export async function PUT(request, { params }) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await params;
  let incoming;
  try {
    incoming = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!incoming || !Array.isArray(incoming.chapters)) {
    return NextResponse.json({ error: 'Malformed page' }, { status: 400 });
  }
  const saved = await savePage(id, incoming);
  if (!saved) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(saved);
}

// DELETE — remove a page entirely (edit-gated).
export async function DELETE(request, { params }) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deletePage(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
