'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CategoryShowcase, { CATEGORY_GROUPS } from '@/components/CategoryShowcase';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import HeroBanner from '@/components/HeroBanner';
import Footer from '@/components/Footer';
import { StoreData, Product, ProductColor } from '@/types';
import defaultStoreData from '@/data/products.json';
import { ArrowUp, Phone, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState<StoreData>(defaultStoreData as StoreData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalInitialColor, setModalInitialColor] = useState<ProductColor | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // 1. Try to load from localStorage first for instant display
    if (typeof window !== 'undefined') {
      try {
        const localSaved = localStorage.getItem('vitrin_store_data');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.products) {
            setData(parsed);
          }
        }
      } catch (e) {
        console.warn('LocalStorage read error:', e);
      }
    }

    // 2. Fresh fetch without browser cache
    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vitrin_store_data', JSON.stringify(json));
          }
        }
      })
      .catch((err) => console.log('Using local fallback:', err));

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const availableColors = useMemo(() => {
    const colors = new Map<string, string>();
    data.products.forEach((product) => product.colors?.forEach((color) => {
      const key = color.name.trim().toLocaleLowerCase('tr-TR');
      if (key) colors.set(key, color.name.trim());
    }));
    return [...colors.entries()].sort((a, b) => a[1].localeCompare(b[1], 'tr-TR'));
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    const filtered = data.products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category.toLocaleLowerCase('tr-TR') === selectedCategory.toLocaleLowerCase('tr-TR');
      const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase('tr-TR').includes(query) ||
        product.description.toLocaleLowerCase('tr-TR').includes(query) ||
        product.category.toLocaleLowerCase('tr-TR').includes(query) ||
        product.colors?.some((color) => color.name.toLocaleLowerCase('tr-TR').includes(query)) ||
        (product.features && product.features.some((f) => f.toLocaleLowerCase('tr-TR').includes(query)));
      const matchesColor = selectedColor === 'all' || product.colors?.some((color) => color.name.toLocaleLowerCase('tr-TR') === selectedColor);
      const matchesMinPrice = !minPrice || product.price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || product.price <= Number(maxPrice);
      const matchesStock = !inStockOnly || product.inStock !== false;
      return matchesCategory && matchesSearch && matchesColor && matchesMinPrice && matchesMaxPrice && matchesStock;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'tr-TR');
      if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return 0;
    });
  }, [data.products, selectedCategory, searchQuery, selectedColor, minPrice, maxPrice, inStockOnly, sortBy]);

  const preferredColorForProduct = (product: Product) => {
    if (selectedColor !== 'all') return product.colors?.find((color) => color.name.toLocaleLowerCase('tr-TR') === selectedColor);
    const query = searchQuery.trim().toLocaleLowerCase('tr-TR');
    return query ? product.colors?.find((color) => color.name.toLocaleLowerCase('tr-TR').includes(query)) : undefined;
  };

  const activeFilterCount = [selectedCategory !== 'all', selectedColor !== 'all', Boolean(minPrice), Boolean(maxPrice), inStockOnly].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || Boolean(searchQuery.trim()) || sortBy !== 'recommended';
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedColor('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('recommended');
  };

  const groupedSections = useMemo(() => {
    return CATEGORY_GROUPS.map((group) => ({
      key: group.key,
      title: group.title,
      slugs: group.slugs,
      categories: data.categories.filter((category) => group.slugs.some((slug) => slug === category.slug)),
      products: filteredProducts.filter((product) => group.slugs.some((slug) => slug === product.category)),
    })).filter((section) => section.products.length > 0);
  }, [data.categories, filteredProducts]);

  const handleOpenDetails = (product: Product, selectedColor?: ProductColor) => {
    setModalProduct(product);
    setModalInitialColor(selectedColor);
  };

  const handleCloseModal = () => {
    setModalProduct(null);
    setModalInitialColor(undefined);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const cleanPhone = (data.settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <Navbar
        settings={data.settings}
        categories={data.categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero */}
      <HeroBanner
        settings={data.settings}
        categories={data.categories}
        totalProducts={data.products.length}
        onSelectCategory={setSelectedCategory}
      />

      {/* Grouped category navigation */}
      <CategoryShowcase
        categories={data.categories}
        products={data.products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content */}
      <main id="collection" className="flex-1 scroll-mt-8 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <section className="mb-8 rounded-2xl border p-4 sm:p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }} aria-label="Ürün filtreleri">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Koleksiyonu filtrele</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{filteredProducts.length} ürün listeleniyor</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="product-sort">Sıralama</label>
              <select
                id="product-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-10 rounded-full border bg-transparent px-3 text-xs outline-none focus:ring-1"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <option value="recommended">Önerilen sıralama</option>
                <option value="newest">En yeni</option>
                <option value="price-asc">Fiyat: artan</option>
                <option value="price-desc">Fiyat: azalan</option>
                <option value="name">İsim: A–Z</option>
              </select>
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-medium transition hover:opacity-75"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtreler{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: 'var(--border)' }}>
              <label className="grid gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                Kategori
                <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="h-10 rounded-xl border bg-transparent px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <option value="all">Tüm kategoriler</option>
                  {data.categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                Renk
                <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="h-10 rounded-xl border bg-transparent px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <option value="all">Tüm renkler</option>
                  {availableColors.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
                </select>
              </label>

              <fieldset className="grid gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                <legend>Fiyat aralığı (₺)</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label className="sr-only" htmlFor="min-price">En düşük fiyat</label>
                  <input id="min-price" type="number" min="0" inputMode="numeric" placeholder="En az" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className="h-10 min-w-0 rounded-xl border bg-transparent px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
                  <label className="sr-only" htmlFor="max-price">En yüksek fiyat</label>
                  <input id="max-price" type="number" min="0" inputMode="numeric" placeholder="En çok" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="h-10 min-w-0 rounded-xl border bg-transparent px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
                </div>
              </fieldset>

              <div className="flex items-end">
                <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                  <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
                  Yalnızca stokta olanlar
                </label>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2 lg:col-span-4">
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{filteredProducts.length} ürün bu filtrelerle eşleşiyor.</p>
                <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70" style={{ color: 'var(--accent)' }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Filtreleri temizle
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Search result banner */}
        {searchQuery && (
          <div className="mb-8 flex items-center justify-between text-sm" style={{ color: 'var(--muted)' }}>
            <p>
              <span style={{ color: 'var(--text)' }}>"{searchQuery}"</span> için{' '}
              <span className="font-medium" style={{ color: 'var(--accent)' }}>{filteredProducts.length}</span> sonuç
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs underline hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              Temizle
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredProducts.length === 0 ? (
          <div className="mx-auto my-2 w-full max-w-3xl rounded-[2rem] border px-6 py-12 text-center sm:py-14" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--card-hover)' }}>
              <Sparkles className="h-7 w-7" style={{ color: 'var(--accent)' }} />
            </span>
            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text)' }}>
              {data.products.length === 0 ? 'İlk seçkimiz hazırlanıyor' : 'Ürün Bulunamadı'}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              {data.products.length === 0
                ? 'TEKİN koleksiyonuna yeni parçalar ekleniyor. Ürünler hazır olduğunda burada görebilirsiniz.'
                : 'Farklı bir arama terimi deneyin veya tüm ürünleri görüntüleyin.'}
            </p>
            {data.products.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >Tüm Ürünler</button>
            )}
          </div>
        ) : (
          <>
            {/* Sections view */}
            {!hasActiveFilters ? (
              <div className="space-y-16">
                {groupedSections.map(({ key, title, categories, products }) => (
                  <section key={key} className="scroll-mt-36">
                    {/* Section header */}
                    <div className="flex items-baseline justify-between mb-6 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <h2 className="text-lg font-medium" style={{ color: 'var(--text)' }}>{title}</h2>
                        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{categories.map((category) => category.name).join(' · ')}</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{products.length} ürün</span>
                    </div>

                    {/* Products grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          preferredColor={preferredColorForProduct(product)}
                          onOpenDetails={handleOpenDetails}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* Grid / filtered view */
              <div>
                {selectedCategory !== 'all' && (
                  <div className="mb-8 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    {(() => {
                      const activeCat = data.categories.find((c) => c.slug === selectedCategory);
                      return activeCat ? (
                        <div>
                          <h2 className="text-lg font-medium mb-1" style={{ color: 'var(--text)' }}>
                            {activeCat.name}
                          </h2>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {filteredProducts.length} ürün
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      preferredColor={preferredColorForProduct(product)}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition hover:opacity-80"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
            title="Başa Dön"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Merhaba, ürünler hakkında bilgi almak istiyorum.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg transition hover:opacity-90"
          style={{ background: '#25D366' }}
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

      {/* Modal */}
      <ProductModal
        product={modalProduct}
        initialColor={modalInitialColor}
        settings={data.settings}
        onClose={handleCloseModal}
      />

      {/* Footer */}
      <Footer
        settings={data.settings}
        categories={data.categories}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
