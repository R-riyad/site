'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductColor, SiteSettings } from '@/types';
import { formatPrice } from '@/lib/format';
import { X, Check, Phone, Sparkles, ShieldCheck, Share2, Copy } from 'lucide-react';

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

  useEffect(() => {
    if (product) {
      setSelectedColor(initialColor || (product.colors && product.colors[0]));
      setImageError(false);
      setCopiedToast(false);
    }
  }, [product, initialColor]);

  // Lock body scroll when modal is open
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

  // Build custom WhatsApp message with product name, selected color, and price
  const colorText = selectedColor?.name ? ` (Seçtiğim Renk: ${selectedColor.name})` : '';
  const message = `Merhaba, "${product.name}"${colorText} - Fiyat: ${formatPrice(product.price)} hakkında detaylı bilgi ve sipariş için danışmak istiyorum.`;
  const whatsappUrl = `https://wa.me/${(settings.whatsappNumber || '905000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  const handleCopyDetails = () => {
    const textToCopy = `${product.name} | Fiyat: ${formatPrice(product.price)}${colorText}\n${product.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div className="relative transform overflow-hidden rounded-[32px] bg-[#0f111a] border border-white/[0.12] text-left shadow-2xl transition-all w-full max-w-4xl my-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-30 p-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-400 hover:text-white transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Product Imagery Showcase */}
            <div className="lg:col-span-5 relative bg-[#090a0f] flex items-center justify-center overflow-hidden p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
              {/* Radial Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

              <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-2xl overflow-hidden shadow-2xl">
                {product.image && !imageError ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/40 text-neutral-500 text-center p-4">
                    <span className="text-5xl mb-2">📦</span>
                    <span className="text-xs">Görsel yüklenmedi</span>
                  </div>
                )}

                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider bg-black/80 text-amber-300 rounded-full backdrop-blur-md border border-amber-400/40 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Technical Specs, Colors & Price */}
            <div className="lg:col-span-7 p-6 sm:p-8 sm:py-10 flex flex-col justify-between space-y-6">
              <div>
                {/* Eyebrow */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
                    {product.category}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-neutral-600" />
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    %100 Orijinal Ürün
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                  {product.name}
                </h2>

                {/* Price Display Block */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block mb-0.5">
                      Vitrin Fiyatı
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black bg-gradient-to-r from-white via-neutral-100 to-amber-300 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-sm text-neutral-500 line-through font-medium">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 rounded-full border border-emerald-500/20">
                      Stokta Hazır
                    </span>
                  </div>
                </div>

                {/* Interactive Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
                      <span className="text-neutral-300">Renk Seçenekleri:</span>
                      <span className="text-amber-300 font-bold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/25">
                        {selectedColor?.name || product.colors[0]?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {product.colors.map((color, idx) => {
                        const isSelected = (selectedColor?.name || product.colors?.[0]?.name) === color.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                              isSelected
                                ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/20 font-bold'
                                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border-white/[0.08]'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 inline-block shadow-inner flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: color.hex }}
                            >
                              {isSelected && (
                                <Check
                                  className={`w-2.5 h-2.5 ${
                                    color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#f8fafc'
                                      ? 'text-black'
                                      : 'text-black'
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
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                    Ürün Açıklaması
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                    {product.description}
                  </p>
                </div>

                {/* Features List */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
                      Öne Çıkan Özellikler & Teknik Detaylar
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-neutral-200"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-950/60 transition duration-300 border border-emerald-400/30 group"
                >
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp ile Sipariş & Bilgi Al</span>
                </a>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToast ? 'Kopyalandı!' : 'Bilgileri Kopyala'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-xs text-neutral-400 hover:text-white font-semibold transition"
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
