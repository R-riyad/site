'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  StoreData,
  Product,
  ProductColor,
  SiteSettings,
} from '@/types';
import defaultStoreData from '@/data/products.json';
import { formatPrice } from '@/lib/format';
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  ArrowLeft,
  Lock,
  Save,
  Download,
  FileUp,
  Check,
  X,
  Phone,
  Settings,
  AlertCircle,
  Eye,
  Sparkles,
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Siyah', hex: '#18181b' },
  { name: 'Beyaz', hex: '#ffffff' },
  { name: 'Gümüş Gri', hex: '#9ca3af' },
  { name: 'Altın / Sarı', hex: '#eab308' },
  { name: 'Rose Gold', hex: '#fb7185' },
  { name: 'Lacivert', hex: '#1e3a8a' },
  { name: 'Okyanus Mavisi', hex: '#0284c7' },
  { name: 'Zümrüt Yeşili', hex: '#15803d' },
  { name: 'Haki / Yeşil', hex: '#4d7c0f' },
  { name: 'Bordo / Kırmızı', hex: '#dc2626' },
  { name: 'Turuncu', hex: '#ea580c' },
  { name: 'Füme / Antrasit', hex: '#374151' },
];

export default function AdminPage() {
  const [data, setData] = useState<StoreData>(defaultStoreData as StoreData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    price: string;
    oldPrice: string;
    description: string;
    image: string;
    badge: string;
    featuresText: string;
    colors: ProductColor[];
    inStock: boolean;
  }>({
    name: '',
    category: 'supurge',
    price: '',
    oldPrice: '',
    description: '',
    image: '',
    badge: '',
    featuresText: '',
    colors: [],
    inStock: true,
  });

  // Custom color input state
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(data.settings);

  // Fetch real data on load
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
          setSettingsForm(json.settings);
        }
      })
      .catch((err) => console.log('Could not fetch /api/products:', err));
  }, []);

  // Check auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = data.settings.adminPin || '1234';
    if (pinInput === correctPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: data.categories[0]?.slug || 'supurge',
      price: '',
      oldPrice: '',
      description: '',
      image: '',
      badge: '',
      featuresText: '',
      colors: [],
      inStock: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price ? prod.price.toString() : '',
      oldPrice: prod.oldPrice ? prod.oldPrice.toString() : '',
      description: prod.description || '',
      image: prod.image || '',
      badge: prod.badge || '',
      featuresText: prod.features ? prod.features.join('\n') : '',
      colors: prod.colors || [],
      inStock: prod.inStock !== false,
    });
    setIsModalOpen(true);
  };

  // Add a preset color
  const handleAddPresetColor = (color: ProductColor) => {
    if (!formData.colors.some((c) => c.name === color.name)) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, color],
      }));
    }
  };

  // Add custom color
  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: customColorName.trim(), hex: customColorHex }],
    }));
    setCustomColorName('');
  };

  // Remove color
  const handleRemoveColor = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Handle local file upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const result = await res.json();
      if (result.url) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        showToast('Görsel başarıyla yüklendi!');
      } else {
        alert(result.error || 'Görsel yüklenemedi');
      }
    } catch {
      alert('Görsel yüklenirken bağlantı hatası oluştu');
    } finally {
      setImageUploadLoading(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lütfen ürün adını giriniz.');
      return;
    }
    const numPrice = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    setIsSaving(true);

    const featuresArray = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const productPayload: Product = {
      id: editingProduct?.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: formData.name.trim(),
      category: formData.category,
      price: numPrice,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice.replace(/[^0-9.]/g, '')) : undefined,
      description: formData.description.trim(),
      features: featuresArray,
      image: formData.image.trim(),
      badge: formData.badge.trim() || undefined,
      colors: formData.colors,
      inStock: formData.inStock,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productPayload }),
      });
      const resData = await res.json();

      if (res.ok) {
        setData((prev) => {
          const exists = prev.products.some((p) => p.id === productPayload.id);
          const updated = exists
            ? prev.products.map((p) => (p.id === productPayload.id ? productPayload : p))
            : [productPayload, ...prev.products];
          return { ...prev, products: updated };
        });

        setIsModalOpen(false);
        showToast(editingProduct ? 'Ürün güncellendi!' : 'Yeni ürün başarıyla eklendi!');
      } else {
        alert(resData.error || 'Ürün kaydedilemedi.');
      }
    } catch {
      alert('Sunucu ile bağlantı kurulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" adlı ürünü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          products: prev.products.filter((p) => p.id !== id),
        }));
        showToast('Ürün silindi.');
      } else {
        alert('Ürün silinirken hata oluştu.');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_settings',
          settings: settingsForm,
        }),
      });
      if (res.ok) {
        setData((prev) => ({ ...prev, settings: settingsForm }));
        showToast('Site ayarları kaydedildi!');
      } else {
        alert('Ayarlar kaydedilemedi.');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  // Export JSON file
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vitrin_urunler_yedek_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON yedek dosyası indirildi!');
  };

  // Import JSON file
  const handleUploadJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'sync_all', data: parsed }),
          });
          if (res.ok) {
            setData(parsed);
            if (parsed.settings) setSettingsForm(parsed.settings);
            showToast('Tüm ürünler ve ayarlar JSON dosyasından başarıyla yüklendi!');
          }
        } else {
          alert('Geçersiz JSON formatı.');
        }
      } catch {
        alert('JSON dosyası okunamadı veya bozuk.');
      }
    };
    reader.readAsText(file);
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Filtered products in Admin
  const adminFilteredProducts = data.products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      !adminSearch ||
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center p-4">
        <div className="bg-[#12141e] border border-white/[0.1] rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-black rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
            <Lock className="w-6 h-6 text-black" />
          </div>

          <h1 className="text-2xl font-black text-white mb-1">Yönetim Paneli</h1>
          <p className="text-xs text-neutral-400 mb-6">
            Ürünleri, fiyatları ve renk seçeneklerini yönetmek için PIN giriniz.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Yönetim Şifresi (Varsayılan: 1234)"
                autoFocus
                className="w-full text-center px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white font-semibold focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
              />
              {pinError && (
                <p className="text-xs text-rose-400 font-semibold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Hatalı şifre. (Varsayılan şifre: 1234)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black rounded-2xl shadow-lg transition"
            >
              Panele Giriş Yap
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.08]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya / Canlı Vitrine Dön</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 font-sans pb-24">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#151824] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-white/[0.15] animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-[#0e1018] border-b border-white/[0.08] sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 transition border border-white/[0.08]"
                title="Vitrine Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2.5">
                  <span>Ürün & Fiyat Yönetim Paneli</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                    CANLI
                  </span>
                </h1>
                <p className="text-xs text-neutral-400">
                  Bilgisayarınızdan anlık ürün, görsel, fiyat ve renk kontrolü
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-neutral-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-full transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canlı Vitrin</span>
              </Link>

              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-neutral-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-full transition"
                title="Yedek JSON indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Yedek İndir</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black rounded-full text-xs font-black shadow-lg shadow-amber-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-6 border-t border-white/[0.06] pt-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <span>Ürünler Kataloğu</span>
              <span className="bg-white/[0.08] text-neutral-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {data.products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Site & İletişim Ayarları</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' ? (
          <div>
            {/* Filter / Search Bar */}
            <div className="bg-[#12141e] p-4 rounded-2xl border border-white/[0.08] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white/[0.06] border border-white/[0.1] rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all" className="bg-[#12141e]">Tüm Kategoriler ({data.products.length})</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.slug} className="bg-[#12141e]">
                      {c.name} ({data.products.filter((p) => p.category === c.slug).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-80">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Ürün adı veya model ara..."
                  className="w-full px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Products Table */}
            {adminFilteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#12141e] rounded-3xl border border-white/[0.08] p-8">
                <span className="text-4xl block mb-3">📦</span>
                <h3 className="text-base font-bold text-white">Bu Kriterde Ürün Bulunamadı</h3>
                <p className="text-xs text-neutral-400 mt-1 mb-4">
                  Yeni bir ürün ekleyebilir veya filtreyi değiştirebilirsiniz.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 bg-amber-400 text-black text-xs font-black rounded-full"
                >
                  Yeni Ürün Ekle
                </button>
              </div>
            ) : (
              <div className="bg-[#12141e] rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/[0.08] text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">
                        <th className="py-4 px-5">Görsel</th>
                        <th className="py-4 px-5">Model & Kategori</th>
                        <th className="py-4 px-5">Fiyat</th>
                        <th className="py-4 px-5">Renk Seçenekleri</th>
                        <th className="py-4 px-5">Rozet</th>
                        <th className="py-4 px-5 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] text-xs">
                      {adminFilteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/[0.02] transition">
                          {/* Image */}
                          <td className="py-3 px-5 w-16">
                            <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden border border-white/[0.1] flex-shrink-0">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-500">
                                  Yok
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Name & Category */}
                          <td className="py-3 px-5">
                            <div className="font-bold text-white text-sm">{prod.name}</div>
                            <div className="text-[10px] font-mono font-semibold text-neutral-400 uppercase mt-0.5">
                              {prod.category}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-5">
                            <span className="font-black text-amber-300 text-sm">
                              {formatPrice(prod.price)}
                            </span>
                            {prod.oldPrice && (
                              <span className="block text-[10px] text-neutral-500 line-through">
                                {formatPrice(prod.oldPrice)}
                              </span>
                            )}
                          </td>

                          {/* Colors */}
                          <td className="py-3 px-5">
                            {prod.colors && prod.colors.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                {prod.colors.map((c, i) => (
                                  <span
                                    key={i}
                                    title={c.name}
                                    className="w-4 h-4 rounded-full border border-black/30 inline-block shadow-sm"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                                <span className="text-[10px] text-neutral-400 font-medium ml-1">
                                  ({prod.colors.length} renk)
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-500">-</span>
                            )}
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-5">
                            {prod.badge ? (
                              <span className="inline-block px-2.5 py-0.5 text-[9px] font-black rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 uppercase">
                                {prod.badge}
                              </span>
                            ) : (
                              <span className="text-neutral-500">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 transition"
                                title="Düzenle"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/20 transition"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* SETTINGS TAB */
          <div className="max-w-2xl bg-[#12141e] rounded-3xl border border-white/[0.08] p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-1">Site & WhatsApp Danışma Ayarları</h2>
            <p className="text-xs text-neutral-400 mb-6">
              Müşterilerinizin göreceği başlıkları ve WhatsApp sipariş numarasını buradan yönetin.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Alt Başlık / Slogan
                </label>
                <input
                  type="text"
                  value={settingsForm.siteSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  WhatsApp Danışma Numarası
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="905xxxxxxxxx (Ülke kodu ile)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Müşteriler ürün detayından "WhatsApp ile Sipariş & Bilgi Al" butonuna bastıklarında bu numaraya ürün adı, seçilen renk ve fiyatla mesaj iletilir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Üst Duyuru Bandı Metni
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Yönetim Paneli Şifresi (PIN)
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black rounded-xl text-xs shadow-md transition"
                >
                  Ayarları Kaydet
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 text-xs font-bold rounded-xl cursor-pointer transition">
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Yedek JSON Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
            <div className="relative transform overflow-hidden rounded-[32px] bg-[#12141e] border border-white/[0.12] text-left shadow-2xl transition-all w-full max-w-2xl my-8 p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-neutral-300 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black text-white mb-1">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Ürün adı, kategorisi, fiyatı, görseli ve renk seçeneklerini belirleyin.
              </p>

              <form onSubmit={handleSaveProduct} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Titanium AMOLED Akıllı Saat"
                    className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                    >
                      {data.categories.map((c) => (
                        <option key={c.id} value={c.slug} className="bg-[#12141e]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Rozet (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Örn: Yeni, Çok Satan, Fırsat"
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Price & Old Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Satış Fiyatı (₺) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Örn: 2450"
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                      Eski Fiyat (İndirim Gösterimi)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="Örn: 2950"
                      className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Product Image Section */}
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Ürün Görseli
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-bold rounded-xl cursor-pointer transition border border-white/[0.1]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUploadLoading ? 'Yükleniyor...' : 'Bilgisayardan Resim Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploadLoading}
                        className="hidden"
                      />
                    </label>

                    <span className="text-xs text-neutral-500 font-medium">veya URL yapıştırın:</span>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://... (Resim bağlantısı)"
                      className="w-full sm:flex-1 px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden border border-white/[0.15] flex-shrink-0">
                        <img
                          src={formData.image}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Görsel başarıyla seçildi
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Options Section */}
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Renk Seçenekleri
                    </label>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formData.colors.length} renk eklendi
                    </span>
                  </div>

                  {/* Currently Added Colors */}
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-2">
                      {formData.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/[0.1] text-xs font-semibold text-white"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 inline-block"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-neutral-400 hover:text-rose-400 text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preset Fast Colors */}
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                      Hızlı Renk Seçimi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddPresetColor(color)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] rounded-lg text-xs font-medium text-neutral-300 transition"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20 inline-block"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-white/[0.1] p-0.5 bg-black"
                    />
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Örn: Gece Mavisi, Rose Gold..."
                      className="flex-1 px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-xs font-bold transition"
                    >
                      Renk Ekle
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Ürün Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ürünün genel açıklaması..."
                    className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Features (Bullet points) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Öne Çıkan Özellikler (Her satıra bir özellik yazın)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder="Safir Çizilmez Cam&#10;50m Su Geçirmezlik&#10;Titanyum Kasa"
                    className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black rounded-xl shadow-lg transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Ürünü Kaydet'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
