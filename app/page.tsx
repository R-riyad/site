'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import HeroBanner from '@/components/HeroBanner';
import Footer from '@/components/Footer';
import { StoreData, Product, ProductColor } from '@/types';
import defaultStoreData from '@/data/products.json';
import { ArrowUp, Phone } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState<StoreData>(defaultStoreData as StoreData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'sections' | 'grid'>('sections');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalInitialColor, setModalInitialColor] = useState<ProductColor | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
        }
      })
      .catch((err) => console.log('Using local fallback:', err));

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return data.products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.features && product.features.some((f) => f.toLowerCase().includes(query)));
      return matchesCategory && matchesSearch;
    });
  }, [data.products, selectedCategory, searchQuery]);

  const categorizedSections = useMemo(() => {
    return data.categories
      .map((cat) => ({
        category: cat,
        products: filteredProducts.filter((p) => p.category.toLowerCase() === cat.slug.toLowerCase()),
      }))
      .filter((section) => section.products.length > 0);
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

      {/* Category Filter */}
      <CategoryTabs
        categories={data.categories}
        products={data.products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
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
          <div className="text-center py-20 max-w-sm mx-auto">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text)' }}>Ürün Bulunamadı</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
              Farklı bir arama terimi deneyin veya tüm ürünleri görüntüleyin.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-white transition hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              Tüm Ürünler
            </button>
          </div>
        ) : (
          <>
            {/* Sections view */}
            {selectedCategory === 'all' && viewMode === 'sections' && !searchQuery ? (
              <div className="space-y-16">
                {categorizedSections.map(({ category, products }) => (
                  <section key={category.id} id={`section-${category.slug}`} className="scroll-mt-36">
                    {/* Section header */}
                    <div className="flex items-baseline justify-between mb-6 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <h2 className="text-lg font-medium" style={{ color: 'var(--text)' }}>
                        {category.name}
                      </h2>
                      <button
                        onClick={() => setSelectedCategory(category.slug)}
                        className="text-xs transition hover:opacity-70"
                        style={{ color: 'var(--accent)' }}
                      >
                        Tümünü Gör →
                      </button>
                    </div>

                    {/* Products grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
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
