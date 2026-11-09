import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ authenticated: await hasAdminSession() }, { headers: { 'Cache-Control': 'no-store' } });
}
