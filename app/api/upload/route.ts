import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya yüklenmedi' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(originalName) || '.jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        type: 'local_file',
      });
    } catch (fsError) {
      // In serverless / read-only filesystem environments, fall back to base64 Data URL
      console.warn('Filesystem is read-only, falling back to base64 Data URL:', fsError);
      const mimeType = file.type || 'image/jpeg';
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        type: 'base64',
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Görsel yüklenirken bir hata oluştu: ' + (error as Error).message }, { status: 500 });
  }
}

