'use client';

import React from 'react';
import { SiteSettings, Category } from '@/types';

interface HeroBannerProps {
  settings: SiteSettings;
  categories: Category[];
  totalProducts: number;
  onSelectCategory: (slug: string) => void;
}

export default function HeroBanner({
  settings,
  totalProducts,
  onSelectCategory,
  categories,
}: HeroBannerProps) {
  return (
    <div className="px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
      <div className="max-w-6xl mx-auto text-center">
        {/* Minimal eyebrow */}
        <p className="text-xs tracking-[0.25em] uppercase mb-6" style={{ color: 'var(--muted)' }}>
          {totalProducts} ürün • {categories.length} kategori
        </p>

        {/* Main title — clean typography */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6 leading-[1.1]" style={{ color: 'var(--text)' }}>
          {settings.siteName || 'VİTRİN'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
          {settings.siteSubtitle || 'Özenle seçilmiş ürün koleksiyonu'}
        </p>

        {/* Minimal divider */}
        <div className="mt-10 mx-auto w-12 h-px" style={{ background: 'var(--border)' }} />
      </div>
    </div>
  );
}
