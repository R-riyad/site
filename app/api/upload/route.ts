import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { hasAdminSession, unauthorized } from '@/lib/admin-auth';
import { getCloudflareEnv } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';
const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export async function POST(req: NextRequest) {
  if (!(await hasAdminSession())) return unauthorized();
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Görsel seçilmedi.' }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: 'Görsel en fazla 4 MB olabilir.' }, { status: 400 });

    const extension = MIME_EXTENSIONS[file.type];
    if (!extension) return NextResponse.json({ error: 'JPG, PNG, WebP veya AVIF görseli yükleyin.' }, { status: 400 });
    const key = `${crypto.randomUUID()}.${extension}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const env = await getCloudflareEnv();
    if (env && !env.PRODUCT_IMAGES) throw new Error('PRODUCT_IMAGES storage binding is missing');

    if (env?.PRODUCT_IMAGES) {
      await env.PRODUCT_IMAGES.put(key, bytes, { httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' } });
      return NextResponse.json({ success: true, url: `/api/uploads/${key}`, type: 'r2' });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, key), bytes);
    return NextResponse.json({ success: true, url: `/api/uploads/${key}`, type: 'local_file' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Görsel yüklenirken hata oluştu.' }, { status: 500 });
  }
}
