import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'edge'; // Edge runtime for faster uploads

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

    // Try Vercel Blob first (works on Vercel with BLOB_READ_WRITE_TOKEN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true,
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

    // Fallback: base64 Data URL (for local dev or if Blob not configured)
    const buffer = await file.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Warn if base64 is very large (will cause issues with Redis)
    if (dataUrl.length > 500_000) {
      return NextResponse.json(
        {
          error:
            'Görsel çok büyük. Lütfen daha küçük bir görsel seçin veya görseli sıkıştırın. Alternatif olarak görsel URL adresi kullanabilirsiniz.',
        },
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
