'use client';

import React from 'react';
import Link from 'next/link';
import { SiteSettings, Category } from '@/types';
import BrandLogo from '@/components/BrandLogo';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (cat: string) => void;
}

export default function Footer({ settings, categories, onSelectCategory }: FooterProps) {
  const cleanPhone = (settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '');

  return (
    <footer className="pt-16 pb-10" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <BrandLogo className="mb-4" />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Ürünler ve sipariş hakkında bilgi için bize ulaşın.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--muted)' }}>
              Kategoriler
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="block text-sm transition hover:opacity-70"
                  style={{ color: 'var(--text)' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--muted)' }}>
              İletişim
            </h4>
            <div className="space-y-3 text-sm">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                WhatsApp ile Ulaşın →
              </a>
              <Link
                href="/admin"
                className="block transition hover:opacity-70"
                style={{ color: 'var(--muted)' }}
              >
                Yönetim Paneli
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
          <p>© {new Date().getFullYear()} {settings.siteName || 'TEKİN'}</p>
          <p>Dijital Ürün Kataloğu</p>
        </div>
      </div>
    </footer>
  );
}
