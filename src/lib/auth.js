// Single shared-password edit gate. Viewing is open; editing requires the
// password (set via EDIT_PASSWORD). On success an httpOnly cookie holds a
// token derived from the password — not the password itself.

import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'lousupp_edit';

const PASSWORD = process.env.EDIT_PASSWORD || 'lousupp';
const SECRET = process.env.EDIT_SECRET || 'lousupp-wireframe-edit-secret';

export function expectedToken() {
  return createHmac('sha256', SECRET).update(PASSWORD).digest('hex');
}

export function checkPassword(password) {
  return typeof password === 'string' && password.length > 0 && password === PASSWORD;
}

export async function isUnlocked() {
  const store = await cookies();
  return store.get(COOKIE)?.value === expectedToken();
}
