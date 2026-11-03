'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/types';
import { formatPrice } from '@/lib/format';
import { Eye, Check, Sparkles } from 'lucide-react';

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
      className="group relative bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 text-center">
            <span className="text-3xl mb-1">📦</span>
            <span className="text-xs font-medium">Görsel Eklenmedi</span>
          </div>
        )}

        {/* Badge Overlay */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-neutral-900/90 text-white rounded-full backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick View Hover Pill */}
        <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-full text-xs font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-4 h-4 text-neutral-700" />
            <span>Detayları İncele</span>
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 mb-1">
            {product.category.toUpperCase()}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-base sm:text-lg text-neutral-900 group-hover:text-amber-700 transition line-clamp-1 mb-2">
            {product.name}
          </h3>

          {/* Description Snippet */}
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Color Options Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4 pt-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1.5 font-medium">
                <span>Renk:</span>
                <span className="font-semibold text-neutral-800">
                  {selectedColor?.name || product.colors[0]?.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.colors.map((color, index) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => handleColorClick(e, color)}
                      title={color.name}
                      className={`relative w-6 h-6 rounded-full border transition-all transform hover:scale-110 flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-neutral-900 ring-offset-2 border-transparent scale-105'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#f8fafc'
                              ? 'text-neutral-900'
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

        {/* Price & CTA Button (Always at bottom) */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between mt-auto">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-semibold">Fiyat</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black text-neutral-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs text-neutral-400 line-through font-medium">
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
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-900 hover:text-white rounded-lg transition-colors duration-200"
          >
            İncele
          </button>
        </div>
      </div>
    </div>
  );
}
