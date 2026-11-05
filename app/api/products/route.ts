import { NextRequest, NextResponse } from 'next/server';
import { getStoreDataAsync, saveStoreDataAsync } from '@/lib/products';
import { Product, StoreData, SiteSettings } from '@/types';
import defaultData from '@/data/products.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const data = await getStoreDataAsync();
    return NextResponse.json(data, { headers: noCacheHeaders });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json(defaultData, { status: 200, headers: noCacheHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Geçersiz istek verisi (JSON ayrıştırma hatası)' },
        { status: 400, headers: noCacheHeaders }
      );
    }

    const currentData = await getStoreDataAsync();

    // Check if updating entire settings
    if (body.type === 'update_settings') {
      currentData.settings = { ...currentData.settings, ...(body.settings as Partial<SiteSettings>) };
      const saved = await saveStoreDataAsync(currentData);
      if (!saved) {
        return NextResponse.json(
          { error: 'Ayarlar kaydedilemedi (depolama hatası)' },
          { status: 500, headers: noCacheHeaders }
        );
      }
      return NextResponse.json({ success: true, settings: currentData.settings }, { headers: noCacheHeaders });
    }

    if (body.type === 'sync_all') {
      // Full sync (e.g. from JSON import)
      if (body.data) {
        const saved = await saveStoreDataAsync(body.data as StoreData);
        if (!saved) {
          return NextResponse.json(
            { error: 'Veri senkronizasyonu başarısız oldu' },
            { status: 500, headers: noCacheHeaders }
          );
        }
        return NextResponse.json({ success: true }, { headers: noCacheHeaders });
      }
    }

    // Saving or updating a product
    const product: Product = body.product;
    if (!product || !product.name || !product.category) {
      return NextResponse.json({ error: 'Eksik ürün bilgisi' }, { status: 400, headers: noCacheHeaders });
    }

    if (!Array.isArray(currentData.products)) {
      currentData.products = (defaultData as StoreData).products;
    }

    const targetId = String(product.id || '').trim();
    const existingIndex = currentData.products.findIndex((p) => String(p.id).trim() === targetId);

    if (existingIndex >= 0) {
      // Update existing
      currentData.products[existingIndex] = {
        ...currentData.products[existingIndex],
        ...product,
      };
    } else {
      // Create new
      const newProduct: Product = {
        ...product,
        id: product.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      currentData.products.unshift(newProduct);
    }

    const saved = await saveStoreDataAsync(currentData);
    if (!saved) {
      return NextResponse.json(
        { error: 'Ürün kaydedilemedi. Veriler çok büyük olabilir — daha küçük görseller deneyin.' },
        { status: 500, headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: existingIndex >= 0 ? currentData.products[existingIndex] : currentData.products[0],
        products: currentData.products,
        settings: currentData.settings,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası: ' + (error as Error).message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID belirtilmedi' }, { status: 400, headers: noCacheHeaders });
    }

    const currentData = await getStoreDataAsync();
    if (!currentData || !Array.isArray(currentData.products)) {
      currentData.products = (defaultData as StoreData).products;
    }

    const targetId = String(id).trim();
    const beforeCount = currentData.products.length;
    currentData.products = currentData.products.filter((p) => String(p.id).trim() !== targetId);

    if (currentData.products.length === beforeCount) {
      // Product not found — still return success (idempotent delete)
      return NextResponse.json(
        { success: true, message: 'Ürün zaten mevcut değil', products: currentData.products },
        { headers: noCacheHeaders }
      );
    }

    await saveStoreDataAsync(currentData);

    return NextResponse.json(
      {
        success: true,
        message: 'Ürün silindi',
        products: currentData.products,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('API DELETE error:', error);
    return NextResponse.json(
      { error: 'Silme hatası: ' + (error as Error).message },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
