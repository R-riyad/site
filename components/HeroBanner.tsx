'use client';

import React from 'react';
import { SiteSettings, Category } from '@/types';
import CategoryIcon from './CategoryIcon';
import { Sparkles, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  settings: SiteSettings;
  categories: Category[];
  totalProducts: number;
  onSelectCategory: (slug: string) => void;
}

export default function HeroBanner({
  settings,
  categories,
  totalProducts,
  onSelectCategory,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#0d0f17] to-[#090a0f] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06]">
      {/* Ambient Radial Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute -top-24 right-1/4 w-[300px] h-[300px] bg-amber-400/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-amber-300 text-xs font-semibold mb-6 backdrop-blur-xl shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="tracking-wide">Lüks Vitrin & Dijital Ürün Fiyat Kataloğu</span>
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
            <span className="text-[11px] text-neutral-400">{totalProducts} Seçkin Model</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.08]">
            Kusursuz Detaylar.{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
              Seçkin Tasarımlar.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Süpürge, saat, gözlük, parfüm, elektronik aletler ve termos koleksiyonlarımızı inceleyin.
            Şeffaf fiyat bilgileri, özel renk seçenekleri ve doğrudan WhatsApp danışma hattı ile tek platformda.
          </p>

          {/* Key Value Props Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10 text-left">
            <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">%100 Orijinal</span>
                <span className="block text-[10px] text-neutral-400 font-medium">Sertifikalı Ürün</span>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Renk Alternatifleri</span>
                <span className="block text-[10px] text-neutral-400 font-medium">Geniş Seçenek</span>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Güncel Fiyatlar</span>
                <span className="block text-[10px] text-neutral-400 font-medium">Net ve Şeffaf</span>
              </div>
            </div>

            <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-white leading-tight">Sepetsiz Hızlı Vitrin</span>
                <span className="block text-[10px] text-neutral-400 font-medium">Doğrudan İletişim</span>
              </div>
            </div>
          </div>

          {/* Quick Category Chips Preview */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block mb-3">
              Bölümlere Hızlı Geçiş Yapın:
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-amber-400/40 text-xs font-medium text-neutral-300 hover:text-white transition-all duration-200"
                >
                  <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-400 transition" />
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
