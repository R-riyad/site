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
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [data, setData] = useState<StoreData>(defaultStoreData as StoreData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'sections' | 'grid'>('sections');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalInitialColor, setModalInitialColor] = useState<ProductColor | undefined>(undefined);

  // Fetch updated data on mount from API if running
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
        }
      })
      .catch((err) => console.log('Using default local store:', err));
  }, []);

  // Filtered products based on search query and category
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

  // Group products by category for sectioned view
  const categorizedSections = useMemo(() => {
    return data.categories.map((cat) => {
      const items = filteredProducts.filter(
        (p) => p.category.toLowerCase() === cat.slug.toLowerCase()
      );
      return {
        category: cat,
        products: items,
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

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Navigation */}
      <Navbar
        settings={data.settings}
        categories={data.categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Welcome Banner */}
      <HeroBanner settings={data.settings} totalProducts={data.products.length} />

      {/* Category Pills Navigation & View Switcher */}
      <CategoryTabs
        categories={data.categories}
        products={data.products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Active Filter Notice */}
        {searchQuery && (
          <div className="mb-8 p-4 bg-white rounded-2xl border border-neutral-200/80 flex items-center justify-between shadow-sm">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">"{searchQuery}"</span> araması için{' '}
              <span className="font-bold text-neutral-900">{filteredProducts.length}</span> ürün bulundu.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
            >
              Filtreyi Temizle
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Aradığınız Ürün Bulunamadı</h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
              Farklı bir arama terimi deneyebilir veya kategoriler arasında geçiş yapabilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: SECTIONS VIEW (Ayrı ayrı bölümler halinde) */}
            {selectedCategory === 'all' && viewMode === 'sections' && !searchQuery ? (
              <div className="space-y-16">
                {categorizedSections.map(({ category, products }) => (
                  <section
                    key={category.id}
                    id={`section-${category.slug}`}
                    className="scroll-mt-36"
                  >
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 mb-6 border-b border-neutral-200/90">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                          <CategoryIcon name={category.icon} className="w-4 h-4" />
                          <span>{category.name} Bölümü</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                          {category.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
                          {category.description}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedCategory(category.slug)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 self-start sm:self-auto group transition"
                      >
                        <span>Tümünü Gör ({products.length})</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
              /* VIEW MODE 2: UNIFIED GRID (Tekli Kategori veya Izgara) */
              <div>
                {/* Header for single category */}
                {selectedCategory !== 'all' && (
                  <div className="mb-8 pb-4 border-b border-neutral-200">
                    {(() => {
                      const activeCat = data.categories.find((c) => c.slug === selectedCategory);
                      return activeCat ? (
                        <div>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                            <CategoryIcon name={activeCat.icon} className="w-4 h-4" />
                            <span>Kategori Vitrini</span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
                            {activeCat.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                            {activeCat.description} ({filteredProducts.length} ürün)
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
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
