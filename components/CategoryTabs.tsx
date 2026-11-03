'use client';

import React from 'react';
import { Category, Product } from '@/types';
import CategoryIcon from './CategoryIcon';
import { Layers, Grid3X3 } from 'lucide-react';

interface CategoryTabsProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  viewMode: 'sections' | 'grid';
  onToggleViewMode: (mode: 'sections' | 'grid') => void;
}

export default function CategoryTabs({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onToggleViewMode,
}: CategoryTabsProps) {
  const getProductCount = (slug: string) => {
    if (slug === 'all') return products.length;
    return products.filter((p) => p.category === slug).length;
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-neutral-200/70 py-3.5 sticky top-[72px] sm:top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Scrollable Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 scroll-smooth">
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white shadow-neutral-900/15'
                  : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/60'
              }`}
            >
              <CategoryIcon name="LayoutGrid" className="w-3.5 h-3.5" />
              <span>Tüm Ürünler</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {products.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = getProductCount(cat.slug);
              const isActive = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-neutral-900/15'
                      : 'bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border border-neutral-200/60'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Sections vs Grid) */}
          <div className="hidden lg:flex items-center gap-1 bg-neutral-100 p-1 rounded-full border border-neutral-200/80 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => onToggleViewMode('sections')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition ${
                viewMode === 'sections'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Kategorilere göre ayrı bölümler halinde göster"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bölümlü Görünüm</span>
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Kompakt ızgara görünümü"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Izgara</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
