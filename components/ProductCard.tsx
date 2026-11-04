'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/types';
import { formatPrice } from '@/lib/format';
import { ArrowUpRight, Sparkles } from 'lucide-react';

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
      className="group relative bg-[#0f1118]/70 hover:bg-[#141722] rounded-2xl sm:rounded-3xl border border-white/[0.06] hover:border-amber-400/40 p-3 sm:p-4 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(251,191,36,0.08)]"
    >
      {/* 1. Clean Product Image Frame */}
      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl bg-[#090a10] overflow-hidden mb-3.5 flex items-center justify-center border border-white/[0.03]">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-500 p-4">
            <span className="text-3xl mb-1">📦</span>
            <span className="text-[11px] font-medium">Görsel Hazırlanıyor</span>
          </div>
        )}

        {/* Minimalist Floating Badge (Top Left) */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black/80 text-amber-300 rounded-full border border-amber-400/30 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              {product.badge}
            </span>
          </div>
        )}

        {/* Discreet "İncele" Floating Hover Indicator (Bottom Right of Image) */}
        <div className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* 2. Content Area (Zero Clutter, Pure Elegance) */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Category Tag */}
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 mb-1">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-1 mb-2.5">
            {product.name}
          </h3>

          {/* Color Swatches (Minimalist Dots) */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                {product.colors.map((color, idx) => {
                  const isSelected = (selectedColor?.name || product.colors?.[0]?.name) === color.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleColorClick(e, color)}
                      title={color.name}
                      className={`relative w-4 h-4 rounded-full border transition-all ${
                        isSelected
                          ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0f1118] border-transparent scale-110'
                          : 'border-white/20 hover:border-white/60 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>

              {/* Selected Color Name Preview */}
              <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[120px]">
                {selectedColor?.name || product.colors[0]?.name}
              </span>
            </div>
          )}
        </div>

        {/* 3. Price & Action (Clean Bottom Row) */}
        <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-white group-hover:text-amber-200 transition-colors">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-[11px] text-neutral-500 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-neutral-400 group-hover:text-white flex items-center gap-1 transition-colors">
            <span>İncele</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
