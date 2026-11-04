'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings, Category } from '@/types';
import { Sparkles, Phone, Settings, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (cat: string) => void;
}

export default function Footer({ settings, categories, onSelectCategory }: FooterProps) {
  const cleanPhone = (settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#06070a] text-neutral-400 border-t border-white/[0.08] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          {/* Brand Presentation */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/10">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="font-black text-2xl text-white tracking-tight">
                {settings.siteName || 'LÜKS VİTRİN'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
              Süpürge, saat, gözlük, parfüm, elektronik aletler ve termos modellerinde seçkin tasarımlar. Şeffaf fiyat bilgisi ve doğrudan danışma vitrini.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Orijinal ürün kalitesi ve doğrudan danışma güvencesi.</span>
            </div>
          </div>

          {/* Categories Links */}
          <div className="md:col-span-4">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">
              Kategoriler & Bölümler
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-left text-neutral-400 hover:text-amber-300 py-1 transition flex items-center gap-1 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 group-hover:bg-amber-400 transition-colors" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Contact & Admin Panel */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-4">
              İletişim & Yönetim
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Merhaba, vitrininizdeki ürünler hakkında bilgi almak istiyorum.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition group"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Danışma Hattı</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ürün Yönetim Paneli</span>
                </Link>
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                Bu platform dijital katalog vitrinidir. Sepete ekleme ve doğrudan ödeme adımları olmadan doğrudan iletişim sağlanır.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.siteName || 'LÜKS VİTRİN'}. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="text-neutral-600 font-mono">v2.0 • Ultra-Lux Edition</span>
            <Link href="/admin" className="hover:text-amber-300 transition">
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
