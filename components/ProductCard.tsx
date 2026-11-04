'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/types';
import { formatPrice } from '@/lib/format';
import { Eye, Check, Sparkles, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product, selectedColor?: ProductColor) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [imageError, setImageError] = useState(false);

  const handleColorClick = (e: React.MouseEvent, color: ProductColor) => {
    e.stopPropagation();
    setSelectedColor(color);
  };

  return (
    <div
      onClick={() => onOpenDetails(product, selectedColor)}
      className="group relative bg-[#12141c]/60 backdrop-blur-xl rounded-3xl border border-white/[0.08] hover:border-amber-400/40 overflow-hidden shadow-2xl hover:shadow-[0_0_35px_rgba(251,191,36,0.12)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Visual Image Container */}
      <div className="relative aspect-square w-full bg-[#0a0b10] overflow-hidden">
        {/* Subtle Ambient Glow Behind Image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-transparent opacity-80 z-10" />

        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/50 text-neutral-500 p-4 text-center">
            <span className="text-4xl mb-2">📦</span>
            <span className="text-xs font-semibold">Görsel Hazırlanıyor</span>
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
          {product.badge ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black tracking-wider uppercase bg-black/80 text-amber-300 rounded-full backdrop-blur-md border border-amber-400/30 shadow-lg">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {product.badge}
            </span>
          ) : (
            <span />
          )}

          {/* In Stock Dot */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-black/70 backdrop-blur-md text-emerald-400 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mevcut</span>
          </span>
        </div>

        {/* Quick View Hover Overlay Pill */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-xs font-black shadow-2xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-4 h-4 text-black" />
            <span>Detay & Özellikler</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Eyebrow */}
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-1.5">
            <span>{product.category}</span>
            <span className="text-neutral-500">2026 SERİSİ</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors duration-200 line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4 font-normal">
            {product.description}
          </p>

          {/* Interactive Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] mb-2 font-medium">
                <span className="text-neutral-400">Renk Seçeneği:</span>
                <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 text-[10px]">
                  {selectedColor?.name || product.colors[0]?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.colors.map((color, index) => {
                  const isSelected = (selectedColor?.name || product.colors?.[0]?.name) === color.name;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => handleColorClick(e, color)}
                      title={color.name}
                      className={`relative w-6 h-6 rounded-full border transition-all transform hover:scale-115 flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#12141c] border-transparent scale-110 shadow-lg'
                          : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3 h-3 ${
                            color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#f8fafc'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price & Action Row (Always pinned to bottom) */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between mt-auto">
          <div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              Katalog Fiyatı
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-white via-neutral-100 to-amber-200 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-neutral-500 line-through font-medium">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(product, selectedColor);
            }}
            className="group/btn inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/[0.08] hover:bg-amber-400 hover:text-black rounded-xl transition-all duration-200 border border-white/[0.08] hover:border-amber-400 shadow-sm"
          >
            <span>İncele</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
