import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCloudflareEnv } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';
const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp|avif)$/.test(key)) return new NextResponse(null, { status: 404 });
  const env = await getCloudflareEnv();
  if (env?.PRODUCT_IMAGES) {
    const object = await env.PRODUCT_IMAGES.get(key);
    if (!object) return new NextResponse(null, { status: 404 });
    return new NextResponse(object.body, { headers: { 'Content-Type': object.httpMetadata?.contentType || TYPES[key.split('.').pop()!] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  }
  try {
    const file = await fs.readFile(path.join(process.cwd(), 'public', 'uploads', key));
    return new NextResponse(file, { headers: { 'Content-Type': TYPES[key.split('.').pop()!] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
