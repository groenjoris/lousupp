import { NextResponse } from 'next/server';
import { COOKIE, expectedToken, checkPassword, isUnlocked } from '@/lib/auth';

export const runtime = 'nodejs';

// GET — is the current visitor unlocked for editing?
export async function GET() {
  return NextResponse.json({ unlocked: await isUnlocked() });
}

// POST { password } — unlock editing
export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch { /* ignore */ }

  if (!checkPassword(body.password)) {
    return NextResponse.json({ unlocked: false, error: 'Wrong password' }, { status: 401 });
  }

  const res = NextResponse.json({ unlocked: true });
  res.cookies.set(COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

// DELETE — lock again (clear the cookie)
export async function DELETE() {
  const res = NextResponse.json({ unlocked: false });
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
