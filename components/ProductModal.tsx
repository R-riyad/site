'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductColor, SiteSettings } from '@/types';
import { formatPrice } from '@/lib/format';
import { X, Check, Phone, Copy } from 'lucide-react';

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
  const [copiedToast, setCopiedToast] = useState(false);
  const visibleImage = selectedColor?.image || product?.image;

  useEffect(() => {
    if (product) {
      setSelectedColor(initialColor || (product.colors && product.colors[0]));
      setImageError(false);
      setCopiedToast(false);
    }
  }, [product, initialColor]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const colorText = selectedColor?.name ? ` (Renk: ${selectedColor.name})` : '';
  const message = `Merhaba, "${product.name}"${colorText} - ${formatPrice(product.price)} hakkında bilgi almak istiyorum.`;
  const whatsappUrl = `https://wa.me/${(settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  const handleCopyDetails = () => {
    const textToCopy = `${product.name} | ${formatPrice(product.price)}${colorText}\n${product.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="relative transform overflow-hidden rounded-2xl text-left shadow-2xl w-full max-w-3xl my-8"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-30 p-2 rounded-full transition hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square lg:aspect-auto overflow-hidden" style={{ background: '#f0ece6' }}>
              {visibleImage && !imageError ? (
                <img
                  src={visibleImage}
                  alt={`${product.name}${selectedColor?.name ? ` – ${selectedColor.name}` : ''}`}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center" style={{ color: 'var(--muted)' }}>
                  <span className="text-5xl mb-2">📦</span>
                  <span className="text-xs">Görsel yok</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Category */}
                <p className="text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--muted)' }}>
                  {product.category}
                </p>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-medium leading-tight mb-4" style={{ color: 'var(--text)' }}>
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-sm line-through" style={{ color: 'var(--muted)' }}>
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Color selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs mb-2.5" style={{ color: 'var(--muted)' }}>
                      Renk: <span style={{ color: 'var(--text)' }}>{selectedColor?.name || product.colors[0]?.name}</span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.colors.map((color, idx) => {
                        const isSelected = (selectedColor?.name || product.colors?.[0]?.name) === color.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { setSelectedColor(color); setImageError(false); }}
                            title={color.name}
                            aria-label={`${color.name} rengini göster`}
                            className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: color.hex,
                              boxShadow: isSelected
                                ? '0 0 0 2px var(--card), 0 0 0 3.5px var(--accent)'
                                : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                            }}
                          >
                            {isSelected && (
                              <Check
                                className="w-3.5 h-3.5"
                                style={{
                                  color: ['#ffffff', '#f8fafc', '#f3f4f6', '#d1d5db', '#d6d3d1'].includes(color.hex.toLowerCase())
                                    ? '#000' : '#fff',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>
                  {product.description}
                </p>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <ul className="space-y-1.5">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
                          <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-5 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-medium text-white transition hover:opacity-90"
                  style={{ background: '#25D366' }}
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp ile Bilgi Al</span>
                </a>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="inline-flex items-center gap-1.5 text-xs transition hover:opacity-70"
                    style={{ color: 'var(--muted)' }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToast ? 'Kopyalandı!' : 'Bilgileri Kopyala'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs transition hover:opacity-70"
                    style={{ color: 'var(--muted)' }}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
