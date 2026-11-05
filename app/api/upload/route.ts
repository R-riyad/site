import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya yüklenmedi' }, { status: 400 });
    }

    // Check file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Görsel çok büyük. Maksimum 4MB yükleyebilirsiniz.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Try Vercel Blob first (works on Vercel with BLOB_READ_WRITE_TOKEN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = require('@vercel/blob');
        const blob = await put(file.name, buffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: file.type || 'image/jpeg',
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          type: 'vercel_blob',
        });
      } catch (blobError) {
        console.warn('Vercel Blob upload failed, falling back:', blobError);
      }
    }

    // Fallback: Try local filesystem (works on localhost)
    try {
      const fs = require('fs');
      const path = require('path');
      const ext = path.extname(file.name) || '.jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadsDir, fileName), buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        type: 'local_file',
      });
    } catch (fsError) {
      console.warn('Filesystem write failed:', fsError);
    }

    // Last fallback: base64 Data URL
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Reject if base64 is too large for Redis storage
    if (dataUrl.length > 500_000) {
      return NextResponse.json(
        { error: 'Görsel çok büyük. Lütfen daha küçük bir görsel seçin veya bir görsel URL adresi girin.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      type: 'base64',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Görsel yüklenirken bir hata oluştu: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
