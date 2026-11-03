'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductColor, SiteSettings } from '@/types';
import { formatPrice } from '@/lib/format';
import { X, Check, Phone, Sparkles, ShieldCheck } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  initialColor?: ProductColor;
  settings: SiteSettings;
  onClose: () => void;
}

export default function ProductModal({
  product,
  initialColor,
  settings,
  onClose,
}: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(initialColor);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(initialColor || (product.colors && product.colors[0]));
      setImageError(false);
    }
  }, [product, initialColor]);

  if (!product) return null;

  // Generate pre-filled WhatsApp message
  const colorText = selectedColor?.name ? ` (Renk: ${selectedColor.name})` : '';
  const message = `Merhaba, "${product.name}"${colorText} - Fiyat: ${formatPrice(product.price)} hakkında bilgi almak istiyorum.`;
  const whatsappUrl = `https://wa.me/${(settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-3xl my-8 border border-neutral-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Product Image */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-neutral-100 flex items-center justify-center overflow-hidden">
              {product.image && !imageError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center max-h-[420px] md:max-h-none"
                />
              ) : (
                <div className="p-12 text-center text-neutral-400">
                  <span className="text-5xl block mb-2">📦</span>
                  <p className="text-sm">Görsel bulunamadı</p>
                </div>
              )}

              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold tracking-wide uppercase bg-neutral-900/90 text-white rounded-full backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Details & Price */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Tag */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-neutral-400">
                    {product.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Orijinal Ürün
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-snug mb-3">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mb-5">
                  <span className="text-xs text-neutral-400 font-semibold block uppercase tracking-wider mb-0.5">
                    Fiyat Bilgisi
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-sm sm:text-base text-neutral-400 line-through font-medium">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 mb-2">
                      <span>Mevcut Renk Seçenekleri:</span>
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                        {selectedColor?.name || product.colors[0]?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {product.colors.map((color, idx) => {
                        const isSelected = selectedColor?.name === color.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm ring-2 ring-neutral-900/20'
                                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-inner flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-2.5 h-2.5 ${
                                    color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#f8fafc'
                                      ? 'text-neutral-900'
                                      : 'text-white'
                                  }`}
                                />
                              )}
                            </span>
                            <span>{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1.5">
                    Ürün Açıklaması
                  </h4>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features List */}
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                      Özellikler & Bilgiler
                    </h4>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp ile Bilgi Al</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-neutral-500 hover:text-neutral-800 font-semibold transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
