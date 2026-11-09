'use client';

import React from 'react';
import { ArrowDown, ArrowRight, House, Sparkles } from 'lucide-react';
import { Category, Product } from '@/types';
import CategoryIcon from '@/components/CategoryIcon';

export const CATEGORY_GROUPS = [
  {
    key: 'home-tech',
    number: '01',
    title: 'Ev & Teknoloji',
    description: 'Günlük hayatı kolaylaştıran kullanışlı seçimler.',
    icon: House,
    slugs: ['supurge', 'elektronik', 'termos'],
  },
  {
    key: 'style-accessories',
    number: '02',
    title: 'Stil & Aksesuar',
    description: 'Tarzınızı tamamlayan özenli dokunuşlar.',
    icon: Sparkles,
    slugs: ['gozluk', 'saat', 'parfum'],
  },
] as const;

interface CategoryShowcaseProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryShowcase({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
}: CategoryShowcaseProps) {
  const chooseCategory = (slug: string) => {
    onSelectCategory(slug);
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 sm:pb-6" aria-label="Ürün kategorileri">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>Koleksiyonu keşfet</p>
          <h2 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl" style={{ color: 'var(--text)' }}>İlgi alanınıza göre seçin</h2>
        </div>
        <button
          type="button"
          onClick={() => chooseCategory('all')}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Tüm koleksiyon <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CATEGORY_GROUPS.map((group) => {
          const groupCategories = group.slugs
            .map((slug) => categories.find((category) => category.slug === slug))
            .filter((category): category is Category => Boolean(category));
          const groupCount = products.filter((product) => group.slugs.some((slug) => slug === product.category)).length;
          const GroupIcon = group.icon;

          return (
            <section key={group.key} className="category-group-card rounded-[1.75rem] border p-4 transition-shadow hover:shadow-[0_16px_42px_rgba(37,27,19,0.07)] sm:p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--card-hover)', color: 'var(--accent)' }}>
                    <GroupIcon className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-base font-semibold tracking-[-0.02em] sm:text-lg" style={{ color: 'var(--text)' }}>{group.title}</h3>
                      <span className="text-[9px] font-medium tracking-[0.16em]" style={{ color: 'var(--muted)' }}>{group.number}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed sm:text-xs" style={{ color: 'var(--muted)' }}>{group.description}</p>
                  </div>
                </div>
                <span className="hidden rounded-full px-2.5 py-1 text-[10px] sm:inline-flex" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>{groupCount} ürün</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {groupCategories.map((category) => {
                  const count = products.filter((product) => product.category === category.slug).length;
                  const active = selectedCategory === category.slug;
                  return (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => chooseCategory(category.slug)}
                      aria-pressed={active}
                      className="category-tile group flex min-w-0 flex-col items-start rounded-2xl border px-2.5 py-3 text-left transition duration-200 hover:-translate-y-0.5 sm:px-3 sm:py-3.5"
                      style={{
                        background: active ? 'var(--text)' : 'var(--bg)',
                        borderColor: active ? 'var(--text)' : 'transparent',
                        color: active ? 'var(--bg)' : 'var(--text)',
                      }}
                    >
                      <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition" style={{ background: active ? 'rgba(255,255,255,.12)' : 'var(--card)', color: active ? '#e8c5a4' : 'var(--accent)' }}>
                        <CategoryIcon name={category.icon} className="h-4 w-4" />
                      </span>
                      <span className="w-full truncate text-[11px] font-medium sm:text-xs">{category.name}</span>
                      <span className="mt-1 flex w-full items-center justify-between text-[9px]" style={{ color: active ? 'rgba(255,255,255,.6)' : 'var(--muted)' }}>
                        {count} ürün <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
