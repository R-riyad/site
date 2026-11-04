'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Settings, Phone, Menu, X, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { SiteSettings, Category } from '@/types';

interface NavbarProps {
  settings: SiteSettings;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function Navbar({
  settings,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanPhone = (settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-50 transition-all">
      {/* Top Ticker Status Bar */}
      <div className="bg-black/90 border-b border-white/[0.06] text-[11px] py-1.5 px-4 text-center font-medium tracking-wider flex items-center justify-between text-neutral-400">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-neutral-300 font-semibold uppercase tracking-widest text-[10px]">
              2026 Koleksiyonu
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="hidden sm:inline text-neutral-400">
              {settings.announcementText || 'Tüm ürünler orijinal ve faturalı olarak sergilenmektedir.'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span className="hidden md:flex items-center gap-1 text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Güvenli Fiyat Vitrini</span>
            </span>
            <Link
              href="/admin"
              className="hover:text-amber-400 transition flex items-center gap-1 text-neutral-400 hover:text-white"
            >
              <Settings className="w-3 h-3" />
              <span>Yönetim</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <div className="glass-panel border-b border-white/[0.08] backdrop-blur-2xl bg-[#090a0f]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0">
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-neutral-900 p-[1px] shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/25 transition-all duration-300">
                <div className="w-full h-full bg-[#0d0f17] rounded-[15px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div>
                <span className="block font-black text-xl tracking-tight text-white group-hover:text-amber-300 transition duration-300">
                  {settings.siteName || 'LÜKS VİTRİN'}
                </span>
                <span className="block text-[10px] font-semibold text-neutral-400 tracking-[0.2em] uppercase">
                  {settings.siteSubtitle || 'PREMIUM KATALOG'}
                </span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ürün adı, model, renk veya kategori ara..."
                  className="w-full pl-11 pr-10 py-2.5 text-xs bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] text-white placeholder-neutral-500 rounded-full border border-white/[0.08] focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs w-5 h-5 flex items-center justify-center rounded-full bg-neutral-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Merhaba, vitrininizdeki ürünler hakkında bilgi almak istiyorum.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-full transition-all duration-200 shadow-lg shadow-emerald-950/40 border border-emerald-400/20"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Danışma</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-full border border-white/[0.08] transition"
                title="Ürün & Fiyat Yönetim Paneli"
              >
                <Settings className="w-3.5 h-3.5 text-neutral-400" />
                <span>Panel</span>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-emerald-400 bg-emerald-950/50 rounded-xl border border-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-neutral-300 hover:text-white rounded-xl bg-white/[0.05] border border-white/[0.08]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden pb-3.5">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ürün veya kategori ara..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.06] text-white placeholder-neutral-500 rounded-full border border-white/[0.08] focus:border-amber-400/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-white/[0.08] py-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-2 py-1">
                Kategoriler
              </div>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-amber-400 text-black'
                    : 'text-neutral-300 hover:bg-white/[0.05]'
                }`}
              >
                Tüm Vitrin
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 text-xs rounded-xl font-semibold transition ${
                    selectedCategory === cat.slug
                      ? 'bg-amber-400 text-black'
                      : 'text-neutral-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              <div className="pt-3 border-t border-white/[0.08] flex gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-neutral-300 bg-white/[0.05] border border-white/[0.08] rounded-xl"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Yönetim Paneline Git</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
