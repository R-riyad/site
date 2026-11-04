'use client';

import React from 'react';
import { Category, Product } from '@/types';
import CategoryIcon from './CategoryIcon';
import { Layers, Grid3X3, Sparkles } from 'lucide-react';

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
    <div className="sticky top-[72px] sm:top-20 z-40 py-3 backdrop-blur-xl bg-[#090a0f]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Scrollable Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 scroll-smooth">
            {/* All Products Pill */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 border border-white/[0.08] hover:border-white/20'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-black' : 'text-amber-400'}`} />
              <span>Tüm Vitrin</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-black/20 text-black'
                    : 'bg-white/[0.08] text-neutral-400'
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Individual Categories */}
            {categories.map((cat) => {
              const count = getProductCount(cat.slug);
              const isActive = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-white/[0.05] hover:bg-white/[0.09] text-neutral-300 border border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <CategoryIcon
                    name={cat.icon}
                    className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`}
                  />
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/[0.08] text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] flex-shrink-0">
            <button
              onClick={() => onToggleViewMode('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                viewMode === 'sections'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Ayrı ayrı bölümler halinde göster"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Bölümlü Görünüm</span>
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-white'
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
