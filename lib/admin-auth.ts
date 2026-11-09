import { cookies } from 'next/headers';
import { getSecret } from './cloudflare';

const COOKIE_NAME = 'tekin_admin_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createAdminSession() {
  const secret = await getSecret('ADMIN_SESSION_SECRET');
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters');
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expires);
  const signature = await sign(payload, secret);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
}

export async function hasAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  const secret = await getSecret('ADMIN_SESSION_SECRET');
  if (!value || !secret || secret.length < 32) return false;
  const [payload, provided, extra] = value.split('.');
  if (!payload || !provided || extra || !/^\d+$/.test(payload) || Number(payload) <= Date.now() / 1000) return false;
  const expected = await sign(payload, secret);
  if (expected.length !== provided.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  return difference === 0;
}

export function unauthorized() {
  return Response.json({ error: 'Yönetim oturumu gerekli.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
