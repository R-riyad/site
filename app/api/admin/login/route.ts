import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/admin-auth';
import { getCloudflareEnv, getSecret } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';
const localAttempts = new Map<string, { count: number; started: number }>();
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const pin = await getSecret('ADMIN_PIN');
  const sessionSecret = await getSecret('ADMIN_SESSION_SECRET');
  if (!pin || !sessionSecret || sessionSecret.length < 32) {
    return NextResponse.json({ error: 'Yönetim girişi sunucuda yapılandırılmamış.' }, { status: 503 });
  }

  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const now = Date.now();
  const env = await getCloudflareEnv();
  if (env?.STORE) {
    const current = await env.STORE.prepare('SELECT attempts, window_started_at FROM admin_login_attempts WHERE ip = ?').bind(ip).first();
    if (current && now - Number(current.window_started_at) < WINDOW_MS && Number(current.attempts) >= 5) {
      return NextResponse.json({ error: 'Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.' }, { status: 429 });
    }
  } else {
    const current = localAttempts.get(ip);
    if (current && now - current.started < WINDOW_MS && current.count >= 5) {
      return NextResponse.json({ error: 'Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin.' }, { status: 429 });
    }
  }

  let input = '';
  try {
    input = String((await request.json()).pin || '');
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (input !== pin) {
    if (env?.STORE) {
      await env.STORE.prepare(`INSERT INTO admin_login_attempts (ip, attempts, window_started_at) VALUES (?, 1, ?)
        ON CONFLICT(ip) DO UPDATE SET attempts = CASE WHEN ? - window_started_at >= ? THEN 1 ELSE attempts + 1 END,
        window_started_at = CASE WHEN ? - window_started_at >= ? THEN ? ELSE window_started_at END`)
        .bind(ip, now, now, WINDOW_MS, now, WINDOW_MS, now).run();
    } else {
      const current = localAttempts.get(ip);
      localAttempts.set(ip, !current || now - current.started >= WINDOW_MS ? { count: 1, started: now } : { ...current, count: current.count + 1 });
    }
    return NextResponse.json({ error: 'Hatalı şifre girdiniz.' }, { status: 401 });
  }

  if (env?.STORE) await env.STORE.prepare('DELETE FROM admin_login_attempts WHERE ip = ?').bind(ip).run();
  else localAttempts.delete(ip);
  try {
    await createAdminSession();
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Oturum oluşturulamadı.' }, { status: 503 });
  }
}
