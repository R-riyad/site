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

  const handleColorClick = (e: React.MouseEvent, color: ProductColor) => {
    e.stopPropagation();
    setSelectedColor(color);
  };

  return (
    <div
      onClick={() => onOpenDetails(product, selectedColor)}
      className="group cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden mb-3" style={{ background: '#f0ece6' }}>
        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
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
