'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { SiteSettings, Category } from '@/types';
import BrandLogo from '@/components/BrandLogo';

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
    <header className="sticky top-0 z-50 bg-[var(--bg)]/95 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <BrandLogo />
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border bg-transparent focus:outline-none focus:ring-1 transition"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{ color: 'var(--muted)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-sm">
            <Link
              href="/admin"
              className="transition hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              Yönetim
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2"
            style={{ color: 'var(--text)' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Koleksiyonda ara..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full border bg-transparent focus:outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t py-4 space-y-1" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => { onSelectCategory('all'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                selectedCategory === 'all' ? 'font-semibold' : ''
              }`}
              style={{
                color: selectedCategory === 'all' ? 'var(--accent)' : 'var(--text)',
                background: selectedCategory === 'all' ? 'var(--card-hover)' : 'transparent',
              }}
            >
              Tümü
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { onSelectCategory(cat.slug); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition ${
                  selectedCategory === cat.slug ? 'font-semibold' : ''
                }`}
                style={{
                  color: selectedCategory === cat.slug ? 'var(--accent)' : 'var(--text)',
                  background: selectedCategory === cat.slug ? 'var(--card-hover)' : 'transparent',
                }}
              >
                {cat.name}
              </button>
            ))}
            <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm"
                style={{ color: 'var(--muted)' }}
              >
                Yönetim Paneli
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
