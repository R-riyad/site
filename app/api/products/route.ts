import { NextRequest, NextResponse } from 'next/server';
import { getStoreDataAsync, saveStoreDataAsync } from '@/lib/products';
import { Product, StoreData, SiteSettings } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getStoreDataAsync();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentData = await getStoreDataAsync();

    // Check if updating entire settings
    if (body.type === 'update_settings') {
      currentData.settings = { ...currentData.settings, ...(body.settings as Partial<SiteSettings>) };
      await saveStoreDataAsync(currentData);
      return NextResponse.json({ success: true, settings: currentData.settings });
    }

    if (body.type === 'sync_all') {
      // Full sync (e.g. from JSON import)
      if (body.data) {
        await saveStoreDataAsync(body.data as StoreData);
        return NextResponse.json({ success: true });
      }
    }

    // Saving or updating a product
    const product: Product = body.product;
    if (!product || !product.name || !product.category) {
      return NextResponse.json({ error: 'Eksik ürün bilgisi' }, { status: 400 });
    }

    const existingIndex = currentData.products.findIndex((p) => p.id === product.id);

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

    await saveStoreDataAsync(currentData);

    return NextResponse.json({
      success: true,
      product: existingIndex >= 0 ? currentData.products[existingIndex] : currentData.products[0],
      products: currentData.products,
      settings: currentData.settings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Kaydetme hatası: ' + (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ürün ID belirtilmedi' }, { status: 400 });
    }

    const currentData = await getStoreDataAsync();
    const initialCount = currentData.products.length;
    currentData.products = currentData.products.filter((p) => p.id !== id);

    if (currentData.products.length === initialCount) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    await saveStoreDataAsync(currentData);

    return NextResponse.json({ success: true, message: 'Ürün silindi', products: currentData.products });
  } catch (error) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 });
  }
}
