import { NextResponse } from 'next/server';
import { getSite, saveSite } from '@/lib/store';
import { isUnlocked } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — public read of the current site document.
export async function GET() {
  const site = await getSite();
  return NextResponse.json(site);
}

// PUT — save the document (edit-gated). History is recomputed server-side.
export async function PUT(request) {
  if (!(await isUnlocked())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  let incoming;
  try {
    incoming = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!incoming || !Array.isArray(incoming.chapters)) {
    return NextResponse.json({ error: 'Malformed document' }, { status: 400 });
  }
  const saved = await saveSite(incoming);
  return NextResponse.json(saved);
}
