'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings, Category } from '@/types';
import { Sparkles, Phone, Settings, ShieldCheck } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (cat: string) => void;
}

export default function Footer({ settings, categories, onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center font-bold text-base">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">{settings.siteName}</span>
            </div>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
              En son teknoloji süpürgeler, lüks saatler, tasarım güneş gözlükleri, kalıcı parfümler, elektronik cihazlar ve dayanıklı çelik termoslar için dijital ürün vitrini.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Güvenilir ürün ve şeffaf fiyat bilgisi.</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Kategoriler
            </h4>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Contact & Admin */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              İletişim & Yönetim
            </h4>
            <div className="space-y-3 text-sm">
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp ile İletişim</span>
                </a>
              )}
              <div>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition"
                >
                  <Settings className="w-4 h-4" />
                  <span>Yönetim Paneli Girişi</span>
                </Link>
              </div>
              <p className="text-xs text-neutral-500">
                Bu site ürün tanıtım ve fiyat vitrinidir. Doğrudan sepete ekleme veya ödeme adımı içermez.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.siteName}. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-neutral-400 transition">
              Ürün Ekle / Düzenle
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
