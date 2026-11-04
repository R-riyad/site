'use client';

import React from 'react';
import { Category, Product } from '@/types';

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
}: CategoryTabsProps) {
  const getCount = (slug: string) =>
    slug === 'all' ? products.length : products.filter((p) => p.category === slug).length;

  return (
    <div className="sticky top-16 z-40 py-3 backdrop-blur-md" style={{ background: 'rgba(250,248,244,0.9)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* All */}
          <button
            onClick={() => onSelectCategory('all')}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: selectedCategory === 'all' ? 'var(--text)' : 'transparent',
              color: selectedCategory === 'all' ? 'var(--bg)' : 'var(--muted)',
            }}
          >
            Tümü ({getCount('all')})
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--text)' : 'transparent',
                  color: isActive ? 'var(--bg)' : 'var(--muted)',
                }}
              >
                {cat.name} ({getCount(cat.slug)})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
