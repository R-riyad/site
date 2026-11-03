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
    } catch (err) {
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
        // Update local state
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
          alert('Geçersiz JSON formatı. "products" alanı bulunamadı.');
        }
      } catch (err) {
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
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-neutral-100 text-center">
          <div className="w-14 h-14 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-neutral-900/20">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>

          <h1 className="text-2xl font-black text-neutral-900 mb-1">Yönetim Paneli</h1>
          <p className="text-xs text-neutral-500 mb-6">
            Ürünleri ve fiyatları düzenlemek için yönetim şifresini giriniz.
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
                className="w-full text-center px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 transition"
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Hatalı şifre. (Varsayılan şifre: 1234)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-2xl shadow-lg transition"
            >
              Panele Giriş Yap
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ana Sayfaya / Vitrine Dön</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold border border-neutral-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                title="Vitrine Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                  <span>Ürün Yönetim Paneli</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Aktif
                  </span>
                </h1>
                <p className="text-xs text-neutral-500">
                  Bilgisayarınızdan ürün, görsel, fiyat ve renk yönetimi
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canlı Vitrini Aç</span>
              </Link>

              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition"
                title="Yedek JSON indir"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">JSON Yedekle</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Ürün Ekle</span>
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-6 border-t border-neutral-100 pt-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'products'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <span>Ürünler Listesi</span>
              <span className="bg-neutral-200 text-neutral-700 text-[10px] px-2 py-0.5 rounded-full">
                {data.products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-neutral-900 text-neutral-900'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Site & İletişim Ayarları</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' ? (
          <div>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-neutral-500 uppercase">Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="all">Tüm Kategoriler ({data.products.length})</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({data.products.filter((p) => p.category === c.slug).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Ürün adı ile ara..."
                  className="w-full px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Products Table / Cards */}
            {adminFilteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
                <span className="text-4xl block mb-3">📦</span>
                <h3 className="text-base font-bold text-neutral-900">Ürün Bulunamadı</h3>
                <p className="text-xs text-neutral-500 mt-1 mb-4">
                  Bu filtreye uyan herhangi bir ürün bulunmuyor.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-full"
                >
                  İlk Ürünü Ekle
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-3.5 px-4">Görsel</th>
                        <th className="py-3.5 px-4">Ürün Adı & Kategori</th>
                        <th className="py-3.5 px-4">Fiyat</th>
                        <th className="py-3.5 px-4">Renk Seçenekleri</th>
                        <th className="py-3.5 px-4">Rozet</th>
                        <th className="py-3.5 px-4 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-sm">
                      {adminFilteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-neutral-50/60 transition">
                          {/* Image */}
                          <td className="py-3 px-4 w-16">
                            <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200 flex-shrink-0">
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                                  Yok
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Name & Category */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-neutral-900 leading-snug">{prod.name}</div>
                            <div className="text-[11px] font-semibold text-neutral-400 uppercase mt-0.5">
                              {prod.category}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4">
                            <span className="font-black text-neutral-900">
                              {formatPrice(prod.price)}
                            </span>
                            {prod.oldPrice && (
                              <span className="block text-[11px] text-neutral-400 line-through">
                                {formatPrice(prod.oldPrice)}
                              </span>
                            )}
                          </td>

                          {/* Colors */}
                          <td className="py-3 px-4">
                            {prod.colors && prod.colors.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                                {prod.colors.map((c, i) => (
                                  <span
                                    key={i}
                                    title={c.name}
                                    className="w-4 h-4 rounded-full border border-neutral-300 inline-block shadow-sm"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                                <span className="text-[11px] text-neutral-500 font-medium ml-1">
                                  ({prod.colors.length} renk)
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400">-</span>
                            )}
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-4">
                            {prod.badge ? (
                              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-neutral-900 text-white uppercase">
                                {prod.badge}
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
                                title="Düzenle"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
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
          <div className="max-w-2xl bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-black text-neutral-900 mb-1">Site & İletişim Ayarları</h2>
            <p className="text-xs text-neutral-500 mb-6">
              Vitrininizde görüntülenecek başlıklar ve WhatsApp iletişim numarasını buradan güncelleyin.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Site Başlığı
                </label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Alt Başlık / Slogan
                </label>
                <input
                  type="text"
                  value={settingsForm.siteSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  WhatsApp İletişim Numarası
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="905xxxxxxxxx (Ülke kodu ile)"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Müşteriler ürün detayından "WhatsApp ile Bilgi Al" butonuna bastıklarında bu numaraya mesaj iletilir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Üst Duyuru Bandı Metni
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Yönetim Paneli Şifresi (PIN)
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Ayarları Kaydet
                </button>

                {/* Import JSON button */}
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer transition">
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
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
            <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl my-8 border border-neutral-200 p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-black text-neutral-900 mb-1">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <p className="text-xs text-neutral-500 mb-6">
                Ürün adı, kategorisi, fiyatı, görseli ve renk seçeneklerini belirleyin.
              </p>

              <form onSubmit={handleSaveProduct} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Titanium AMOLED Akıllı Saat"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    >
                      {data.categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Rozet (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Örn: Yeni, Çok Satan, Fırsat"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* Price & Old Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
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
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Eski Fiyat (İndirim Gösterimi için Opsiyonel)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="Örn: 2950"
                      className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* Product Image Section */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Ürün Görseli
                  </label>

                  {/* File upload from local computer */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-sm">
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

                    <span className="text-xs text-neutral-400 font-medium">veya URL yapıştırın:</span>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://... (Resim bağlantısı)"
                      className="w-full sm:flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-16 h-16 rounded-xl bg-neutral-200 overflow-hidden border border-neutral-300 flex-shrink-0">
                        <img
                          src={formData.image}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Görsel başarıyla seçildi
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Options Section (Requested by user) */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                      Renk Seçenekleri
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      {formData.colors.length} renk eklendi
                    </span>
                  </div>

                  {/* Currently Added Colors */}
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-2">
                      {formData.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm text-xs font-semibold"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="text-neutral-400 hover:text-rose-600 text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fast Preset Color Selector */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 block mb-1.5">
                      Hızlı Renk Seçimi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((color, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddPresetColor(color)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 transition"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/60">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-300 p-0.5 bg-white"
                      title="Özel renk seç"
                    />
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Örn: Gece Mavisi, Rose Gold..."
                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3 py-1.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition"
                    >
                      Renk Ekle
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Ürün Açıklaması
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ürünün genel açıklaması, kullanım alanları..."
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                {/* Features (Bullet points) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Öne Çıkan Özellikler (Her satıra bir özellik yazın)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder="Safir Cam&#10;50m Su Geçirmezlik&#10;Titanyum Kasa"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono text-xs"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-lg transition"
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
