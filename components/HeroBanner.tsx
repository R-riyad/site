'use client';

import React from 'react';
import { SiteSettings } from '@/types';
import { ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  settings: SiteSettings;
  totalProducts: number;
}

export default function HeroBanner({ settings, totalProducts }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-4 backdrop-blur-md border border-white/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{settings.siteSubtitle || 'Güncel Ürün ve Fiyat Vitrini'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto mb-4 leading-tight">
          Özel Seçilmiş Ürün Kataloğu
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Süpürge, saat, gözlük, parfüm, elektronik aletler ve termos modellerimizi inceleyebilir, renk ve fiyat seçeneklerine göz atabilirsiniz.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs font-medium text-neutral-300">
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 px-4 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>%100 Orijinal Ürünler</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 px-4 rounded-xl backdrop-blur-sm">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Farklı Renk Seçenekleri</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 px-4 rounded-xl backdrop-blur-sm">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>{totalProducts} Adet Güncel Ürün</span>
          </div>
        </div>
      </div>
    </div>
  );
}
