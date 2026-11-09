'use client';

import React, { useState } from 'react';
import { Product, ProductColor } from '@/types';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product, selectedColor?: ProductColor) => void;
}

export default function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );
  const [imageError, setImageError] = useState(false);
  const visibleImage = selectedColor?.image || product.image;

  const handleColorClick = (e: React.MouseEvent, color: ProductColor) => {
    e.stopPropagation();
    setSelectedColor(color);
    setImageError(false);
  };

  return (
    <div
      onClick={() => onOpenDetails(product, selectedColor)}
      className="group cursor-pointer rounded-2xl p-2 pb-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(37,27,19,0.09)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden mb-4" style={{ background: '#eee9e2' }}>
        {visibleImage && !imageError ? (
          <img
            src={visibleImage}
            alt={`${product.name}${selectedColor?.name ? ` – ${selectedColor.name}` : ''}`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.05] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--muted)' }}>
            <span className="text-3xl mb-1">📦</span>
            <span className="text-xs">Görsel Yok</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        {/* Name */}
        <h3 className="text-sm font-medium leading-snug line-clamp-1" style={{ color: 'var(--text)' }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs line-through" style={{ color: 'var(--muted)' }}>
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Color dots */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.map((color, idx) => {
              const isSelected = (selectedColor?.name || product.colors?.[0]?.name) === color.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleColorClick(e, color)}
                  title={color.name}
                  aria-label={`${color.name} rengini göster`}
                  className="relative w-3.5 h-3.5 rounded-full transition-all"
                  style={{
                    backgroundColor: color.hex,
                    boxShadow: isSelected ? '0 0 0 1.5px var(--bg), 0 0 0 2.5px var(--accent)' : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
