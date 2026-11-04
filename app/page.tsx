'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import HeroBanner from '@/components/HeroBanner';
import Footer from '@/components/Footer';
import CategoryIcon from '@/components/CategoryIcon';
import { StoreData, Product, ProductColor } from '@/types';
import defaultStoreData from '@/data/products.json';
import { ArrowRight, Phone, ArrowUp, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState<StoreData>(defaultStoreData as StoreData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'sections' | 'grid'>('sections');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalInitialColor, setModalInitialColor] = useState<ProductColor | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch updated data on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
        }
      })
      .catch((err) => console.log('Using local fallback:', err));

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filtered products based on search and selected category
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

  // Group products by category for Sectioned View
  const categorizedSections = useMemo(() => {
    return data.categories.map((cat, index) => {
      const items = filteredProducts.filter(
        (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
      );
      return {
        category: cat,
        products: items,
        indexNumber: `0${index + 1}`.slice(-2),
      };
    }).filter((section) => section.products.length > 0);
  }, [data.categories, filteredProducts]);

  const handleOpenDetails = (product: Product, selectedColor?: ProductColor) => {
    setModalProduct(product);
    setModalInitialColor(selectedColor);
  };

  const handleCloseModal = () => {
    setModalProduct(null);
    setModalInitialColor(undefined);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = (data.settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Navigation */}
      <Navbar
        settings={data.settings}
        categories={data.categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Spotlight Stage */}
      <HeroBanner
        settings={data.settings}
        categories={data.categories}
        totalProducts={data.products.length}
        onSelectCategory={setSelectedCategory}
      />

      {/* Floating Dynamic Category Dock */}
      <CategoryTabs
        categories={data.categories}
        products={data.products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Showcase Feed */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Active Search / Filter Banner */}
        {searchQuery && (
          <div className="mb-10 p-5 rounded-2xl glass-panel border border-white/[0.08] flex items-center justify-between shadow-xl">
            <p className="text-sm text-neutral-300">
              <span className="text-white font-bold">"{searchQuery}"</span> araması için{' '}
              <span className="font-black text-amber-400">{filteredProducts.length}</span> ürün bulundu.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
            >
              Filtreyi Temizle
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-[32px] border border-white/[0.08] p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto mb-4 text-3xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aradığınız Ürün Bulunamadı</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Aradığınız kriterlere uygun ürün bulunamadı. Farklı bir terim deneyebilir veya tüm koleksiyonu görüntüleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black rounded-full text-xs font-black transition-all shadow-lg shadow-amber-400/20"
            >
              Tüm Ürünleri Görüntüle
            </button>
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: SECTIONS VIEW (Ayrı ayrı lüks bölümler halinde) */}
            {selectedCategory === 'all' && viewMode === 'sections' && !searchQuery ? (
              <div className="space-y-24">
                {categorizedSections.map(({ category, products, indexNumber }) => (
                  <section
                    key={category.id}
                    id={`section-${category.slug}`}
                    className="scroll-mt-36 relative"
                  >
                    {/* Editorial Section Header */}
                    <div className="relative pb-6 mb-8 border-b border-white/[0.08]">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                          {/* Roman / Index Number & Badge */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-amber-400">
                              {indexNumber}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                              <CategoryIcon name={category.icon} className="w-4 h-4 text-amber-400" />
                              <span>{category.name} Bölümü</span>
                            </div>
                          </div>

                          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            {category.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl font-normal leading-relaxed">
                            {category.description}
                          </p>
                        </div>

                        {/* Quick Action Button for Section */}
                        <button
                          onClick={() => setSelectedCategory(category.slug)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-neutral-300 bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-amber-400/40 hover:text-white transition group self-start sm:self-auto"
                        >
                          <span>Yalnızca {category.name} ({products.length})</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 text-amber-400 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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
              /* VIEW MODE 2: UNIFIED GRID (Tekli Kategori veya Kompakt Izgara) */
              <div>
                {/* Active Category Header */}
                {selectedCategory !== 'all' && (
                  <div className="mb-10 pb-6 border-b border-white/[0.08]">
                    {(() => {
                      const activeCat = data.categories.find((c) => c.slug === selectedCategory);
                      return activeCat ? (
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-2">
                            <CategoryIcon name={activeCat.icon} className="w-4 h-4" />
                            <span>Özel Kategori Vitrini</span>
                          </div>
                          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
                            {activeCat.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                            {activeCat.description} — Toplam {filteredProducts.length} seçkin model.
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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

      {/* Floating Sticky WhatsApp Consultation Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.1] backdrop-blur-xl flex items-center justify-center transition shadow-lg"
            title="Başa Dön"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Merhaba, vitrindeki ürünler hakkında bilgi almak istiyorum.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3 px-4 py-3 bg-[#11131c]/90 hover:bg-emerald-950 text-white rounded-full border border-emerald-500/30 backdrop-blur-2xl shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
        >
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="text-left hidden sm:block">
            <span className="block text-[10px] text-neutral-400 font-semibold leading-none">Canlı Destek</span>
            <span className="block text-xs font-bold text-emerald-400">WhatsApp Danışma</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
            <Phone className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Product Detail Modal */}
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
