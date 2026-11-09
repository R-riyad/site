'use client';

import React from 'react';
import { SiteSettings, Category } from '@/types';
import { ArrowDown, Sparkles } from 'lucide-react';

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
    <div className="px-4 sm:px-6 pt-10 pb-10 sm:pt-16 sm:pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="hero-panel relative overflow-hidden rounded-[2rem] px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.16em] uppercase text-white/75">
              <Sparkles className="h-3.5 w-3.5" /> Özenle seçilmiş koleksiyon
            </p>
            <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              {settings.siteName || 'TEKİN'}<span className="text-[#d6b69a]">.</span>
            </h1>
            {settings.siteSubtitle?.trim() && (
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                {settings.siteSubtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={() => onSelectCategory('all')} className="inline-flex items-center gap-2 rounded-full bg-[#d6b69a] px-5 py-3 text-sm font-semibold text-[#211a16] transition hover:bg-[#e4c8ae]">
                Koleksiyonu keşfet <ArrowDown className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs text-white/50">{totalProducts} ürün <span className="mx-1.5">·</span> {categories.length} kategori</span>
            </div>
          </div>
          <div className="hero-mark" aria-hidden="true">T</div>
        </div>
      </div>
    </div>
  );
}
