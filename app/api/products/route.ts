import { NextRequest, NextResponse } from 'next/server';
import { getStoreData, saveStoreData } from '@/lib/products';
import { Product, StoreData, SiteSettings } from '@/types';

export async function GET() {
  try {
    const data = getStoreData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentData = getStoreData();

    // Check if updating entire settings or a single product
    if (body.type === 'update_settings') {
      currentData.settings = { ...currentData.settings, ...(body.settings as Partial<SiteSettings>) };
      saveStoreData(currentData);
      return NextResponse.json({ success: true, settings: currentData.settings });
    }

    if (body.type === 'sync_all') {
      // Full sync (e.g. from JSON import)
      if (body.data) {
        saveStoreData(body.data as StoreData);
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

    const saved = saveStoreData(currentData);

    return NextResponse.json({
      success: true,
      savedToFile: saved,
      product: existingIndex >= 0 ? currentData.products[existingIndex] : currentData.products[0],
      products: currentData.products,
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

    const currentData = getStoreData();
    const initialCount = currentData.products.length;
    currentData.products = currentData.products.filter((p) => p.id !== id);

    if (currentData.products.length === initialCount) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    saveStoreData(currentData);

    return NextResponse.json({ success: true, message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ error: 'Silme hatası' }, { status: 500 });
  }
}
