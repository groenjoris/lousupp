import { NextResponse } from 'next/server';
import { getSite } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — public read of the full document (pillars + all pages).
export async function GET() {
  const site = await getSite();
  return NextResponse.json(site);
}
