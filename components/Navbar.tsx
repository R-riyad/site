'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Settings, Phone, Menu, X, Sparkles } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 transition-all">
      {/* Top Announcement Bar */}
      {settings.announcementText && (
        <div className="bg-neutral-900 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcementText}</span>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-neutral-800 transition">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="block font-black text-xl tracking-tight text-neutral-900 group-hover:text-neutral-700 transition">
                {settings.siteName}
              </span>
              <span className="block text-[11px] font-medium text-neutral-500 tracking-wider uppercase">
                {settings.siteSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Search Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ürün adı, özellik veya kategori ara..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 hover:bg-neutral-150 focus:bg-white text-neutral-900 placeholder-neutral-400 rounded-full border border-transparent focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs px-1.5 py-0.5 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {settings.whatsappNumber && (
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-full transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>İletişim & Sipariş</span>
              </a>
            )}

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full border border-neutral-200 transition"
              title="Yönetim Paneli"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Yönetim Paneli</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/admin"
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition"
              title="Yönetim"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ürün veya kategori ara..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-100 text-neutral-900 placeholder-neutral-400 rounded-full border border-transparent focus:border-neutral-300 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-neutral-200 py-3 space-y-2">
            <div className="text-xs font-semibold uppercase text-neutral-400 px-2 py-1">Kategoriler</div>
            <button
              onClick={() => {
                onSelectCategory('all');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition ${
                selectedCategory === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Tüm Ürünler
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition ${
                  selectedCategory === cat.slug ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {cat.name}
              </button>
            ))}

            {settings.whatsappNumber && (
              <div className="pt-2 border-t border-neutral-150">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp ile İletişim</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
