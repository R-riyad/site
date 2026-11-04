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
  CloudUpload,
} from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Siyah', hex: '#18181b' },
  { name: 'Beyaz', hex: '#ffffff' },
  { name: 'Gümüş Gri', hex: '#9ca3af' },
  { name: 'Altın / Sarı', hex: '#d97706' },
  { name: 'Rose Gold', hex: '#fb7185' },
  { name: 'Lacivert', hex: '#1e3a8a' },
  { name: 'Okyanus Mavisi', hex: '#0284c7' },
  { name: 'Zümrüt Yeşili', hex: '#15803d' },
  { name: 'Haki / Yeşil', hex: '#4d7c0f' },
  { name: 'Bordo / Kırmızı', hex: '#dc2626' },
  { name: 'Krem / Bej', hex: '#e7e2d9' },
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
  const [isPublishing, setIsPublishing] = useState(false);
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

  // Fetch real data on load with no-cache and localStorage sync
  useEffect(() => {
    // 1. Try to load from localStorage first for instant state
    if (typeof window !== 'undefined') {
      try {
        const localSaved = localStorage.getItem('vitrin_store_data');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (parsed && parsed.products) {
            setData(parsed);
            setSettingsForm(parsed.settings);
          }
        }
      } catch (e) {
        console.warn('LocalStorage read error:', e);
      }
    }

    // 2. Fetch fresh data from API
    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json && json.products) {
          setData(json);
          setSettingsForm(json.settings);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vitrin_store_data', JSON.stringify(json));
          }
        }
      })
      .catch((err) => console.log('Could not fetch /api/products:', err));
  }, []);

  // Check auth - strictly validate against current saved adminPin
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = (data.settings.adminPin || '1234').trim();
    if (pinInput.trim() === activePin) {
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
        const updatedProducts = data.products.some((p) => p.id === productPayload.id)
          ? data.products.map((p) => (p.id === productPayload.id ? productPayload : p))
          : [productPayload, ...data.products];

        const updatedData = { ...data, products: updatedProducts };
        setData(updatedData);

        if (typeof window !== 'undefined') {
          localStorage.setItem('vitrin_store_data', JSON.stringify(updatedData));
        }

        setIsModalOpen(false);
        showToast(editingProduct ? 'Ürün güncellendi ve kaydedildi!' : 'Yeni ürün başarıyla eklendi!');
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

    // 1. Optimistic immediate UI update
    const updatedProducts = data.products.filter((p) => String(p.id) !== String(id));
    const updatedData = { ...data, products: updatedProducts };
    setData(updatedData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('vitrin_store_data', JSON.stringify(updatedData));
    }

    // 2. Send DELETE request to API
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Ürün başarıyla silindi.');
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn('Delete server note:', errJson);
        showToast('Ürün silindi.');
      }
    } catch (err) {
      console.warn('Network issue during delete:', err);
      showToast('Ürün silindi.');
    }
  };

  // Save Settings (including PIN change)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.adminPin || !settingsForm.adminPin.trim()) {
      alert('Yönetim şifresi boş bırakılamaz.');
      return;
    }

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
        const updatedData = { ...data, settings: settingsForm };
        setData(updatedData);

        if (typeof window !== 'undefined') {
          localStorage.setItem('vitrin_store_data', JSON.stringify(updatedData));
        }
        showToast('Ayarlar ve yeni şifreniz başarıyla kaydedildi!');
      } else {
        alert('Ayarlar kaydedilemedi.');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  // Publish to Vercel via Git
  const handlePublishToVercel = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast(result.message);
      } else {
        alert(result.message || 'Güncelleme gönderilemedi. Masaüstündeki Vercel-Guncelle.bat dosyasını çalıştırabilirsiniz.');
      }
    } catch {
      alert('Yerel sunucuya ulaşılamadı. Masaüstündeki Vercel-Guncelle.bat dosyasını çift tıklayarak Vercel\'e gönderebilirsiniz.');
    } finally {
      setIsPublishing(false);
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('vitrin_store_data', JSON.stringify(parsed));
            }
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
    }, 4500);
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
    const currentActivePin = data.settings.adminPin || '1234';

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div
          className="rounded-2xl p-8 max-w-sm w-full shadow-lg text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--card-hover)', color: 'var(--accent)' }}
          >
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="text-xl font-medium mb-1" style={{ color: 'var(--text)' }}>Yönetim Girişi</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
            Katalog ve ürünleri yönetmek için PIN şifrenizi giriniz.
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
                placeholder="PIN Şifreniz"
                autoFocus
                className="w-full text-center px-4 py-2.5 rounded-full border text-sm font-medium focus:outline-none focus:ring-1 transition"
                style={{
                  background: 'var(--bg)',
                  borderColor: pinError ? '#ef4444' : 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              {pinError && (
                <p className="text-xs mt-2 flex items-center justify-center gap-1 text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Hatalı şifre girdiniz.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full text-sm font-medium text-white transition hover:opacity-90 shadow-sm"
              style={{ background: 'var(--text)', color: 'var(--bg)' }}
            >
              Giriş Yap
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs transition hover:opacity-70"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Vitrine Dön</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-medium border animate-in fade-in"
          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b" style={{ background: 'rgba(250,248,244,0.95)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-full transition hover:opacity-70"
                style={{ color: 'var(--muted)' }}
                title="Vitrine Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-base font-medium" style={{ color: 'var(--text)' }}>
                  Yönetim Paneli
                </h1>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePublishToVercel}
                disabled={isPublishing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition hover:opacity-80"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                title="Değişiklikleri GitHub ve Vercel'e gönderir"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isPublishing ? 'Gönderiliyor...' : 'Vercel\'e Gönder'}</span>
              </button>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition hover:opacity-70"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Canlı Vitrin</span>
              </Link>

              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition hover:opacity-70"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                title="Yedek İndir"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Yedek Al</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-white transition hover:opacity-90 shadow-sm"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ürün Ekle</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-6 pt-1">
            <button
              onClick={() => setActiveTab('products')}
              className="py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5"
              style={{
                borderColor: activeTab === 'products' ? 'var(--text)' : 'transparent',
                color: activeTab === 'products' ? 'var(--text)' : 'var(--muted)',
              }}
            >
              <span>Ürünler</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full" style={{ background: 'var(--card-hover)', color: 'var(--muted)' }}>
                {data.products.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="py-2.5 text-xs font-medium border-b-2 transition flex items-center gap-1.5"
              style={{
                borderColor: activeTab === 'settings' ? 'var(--text)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--text)' : 'var(--muted)',
              }}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ayarlar & Şifre</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {activeTab === 'products' ? (
          <div>
            {/* Filter / Search Bar */}
            <div className="p-3 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
                <span style={{ color: 'var(--muted)' }}>Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border text-xs focus:outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  <option value="all">Tümü ({data.products.length})</option>
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name} ({data.products.filter((p) => p.category === c.slug).length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Ürün ara..."
                  className="w-full px-3 py-1.5 rounded-full border text-xs focus:outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>
            </div>

            {/* Products Table */}
            {adminFilteredProducts.length === 0 ? (
              <div className="text-center py-16 rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <p className="text-3xl mb-2">📦</p>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ürün Bulunamadı</h3>
                <p className="text-xs mt-1 mb-4" style={{ color: 'var(--muted)' }}>
                  Arama kriterini değiştirebilir veya yeni ürün ekleyebilirsiniz.
                </p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  Yeni Ürün Ekle
                </button>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        <th className="py-3 px-4 font-medium">Görsel</th>
                        <th className="py-3 px-4 font-medium">Ürün & Kategori</th>
                        <th className="py-3 px-4 font-medium">Fiyat</th>
                        <th className="py-3 px-4 font-medium">Renkler</th>
                        <th className="py-3 px-4 text-right font-medium">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {adminFilteredProducts.map((prod) => (
                        <tr key={prod.id} className="transition hover:opacity-90" style={{ background: 'var(--card)' }}>
                          {/* Image */}
                          <td className="py-2.5 px-4 w-14">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border flex items-center justify-center flex-shrink-0" style={{ background: '#f0ece6', borderColor: 'var(--border)' }}>
                              {prod.image ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Yok</span>
                              )}
                            </div>
                          </td>

                          {/* Name & Category */}
                          <td className="py-2.5 px-4">
                            <div className="font-medium" style={{ color: 'var(--text)' }}>{prod.name}</div>
                            <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--muted)' }}>
                              {prod.category}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-2.5 px-4">
                            <span className="font-semibold" style={{ color: 'var(--text)' }}>
                              {formatPrice(prod.price)}
                            </span>
                            {prod.oldPrice && (
                              <span className="block text-[10px] line-through" style={{ color: 'var(--muted)' }}>
                                {formatPrice(prod.oldPrice)}
                              </span>
                            )}
                          </td>

                          {/* Colors */}
                          <td className="py-2.5 px-4">
                            {prod.colors && prod.colors.length > 0 ? (
                              <div className="flex items-center gap-1 flex-wrap max-w-xs">
                                {prod.colors.map((c, i) => (
                                  <span
                                    key={i}
                                    title={c.name}
                                    className="w-3.5 h-3.5 rounded-full border inline-block"
                                    style={{ backgroundColor: c.hex, borderColor: 'rgba(0,0,0,0.15)' }}
                                  />
                                ))}
                                <span className="text-[10px] ml-1" style={{ color: 'var(--muted)' }}>
                                  ({prod.colors.length})
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--muted)' }}>-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="p-1.5 rounded-lg border transition hover:opacity-70"
                                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                                title="Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 rounded-lg border transition hover:opacity-70 text-red-600"
                                style={{ borderColor: 'var(--border)' }}
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          <div className="max-w-xl rounded-xl p-6 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>Site & Şifre Ayarları</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
              Site başlığı, WhatsApp numarası ve yönetim giriş şifrenizi buradan güncelleyin.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Site Adı
                </label>
                <input
                  type="text"
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={settingsForm.siteSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                  WhatsApp Danışma Numarası
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="905xxxxxxxxx"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border focus:outline-none"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                  Yönetim Paneli Giriş Şifresi (PIN)
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                  placeholder="Yeni şifrenizi girin"
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none font-mono"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                  Değiştirdikten sonra "Ayarları Kaydet" butonuna basınız. Girişte bu şifre istenecektir.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-medium text-white transition hover:opacity-90 shadow-sm"
                  style={{ background: 'var(--accent)' }}
                >
                  Ayarları & Şifreyi Kaydet
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs cursor-pointer transition hover:opacity-70" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Yedek Yükle</span>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative transform overflow-hidden rounded-2xl text-left shadow-2xl w-full max-w-xl my-8 p-6"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {/* Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full transition hover:opacity-70"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base font-medium mb-1" style={{ color: 'var(--text)' }}>
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
                Ürün bilgilerini ve renk seçeneklerini belirleyin.
              </p>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Product Name */}
                <div>
                  <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Ürün Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Titanyum Akıllı Saat"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>

                {/* Category & Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Kategori *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      {data.categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Rozet (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      placeholder="Örn: Yeni, Özel"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                {/* Price & Old Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Fiyat (₺) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="Örn: 2450"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                      Eski Fiyat (İndirim Gösterimi)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="Örn: 2950"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>
                </div>

                {/* Image Section */}
                <div className="p-3 rounded-lg border space-y-2" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <label className="block font-medium" style={{ color: 'var(--text)' }}>
                    Ürün Görseli
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition hover:opacity-70" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUploadLoading ? 'Yükleniyor...' : 'Bilgisayardan Seç'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploadLoading}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="veya resim bağlantısı yapıştırın"
                      className="flex-1 px-3 py-1.5 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                  </div>

                  {formData.image && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-10 h-10 rounded overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                        <img
                          src={formData.image}
                          alt="Önizleme"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" />
                        Görsel seçildi
                      </span>
                    </div>
                  )}
                </div>

                {/* Color Section */}
                <div className="p-3 rounded-lg border space-y-2.5" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <label className="block font-medium" style={{ color: 'var(--text)' }}>
                      Renk Seçenekleri
                    </label>
                    <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                      {formData.colors.length} renk
                    </span>
                  </div>

                  {/* Added colors */}
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px]"
                          style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                          <span
                            className="w-3 h-3 rounded-full border inline-block"
                            style={{ backgroundColor: c.hex, borderColor: 'rgba(0,0,0,0.1)' }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(idx)}
                            className="hover:opacity-70 ml-0.5"
                            style={{ color: 'var(--muted)' }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1">
                    {PRESET_COLORS.map((color, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddPresetColor(color)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] transition hover:opacity-70"
                        style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border inline-block"
                          style={{ backgroundColor: color.hex, borderColor: 'rgba(0,0,0,0.1)' }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom color */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border p-0.5"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <input
                      type="text"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      placeholder="Özel renk adı..."
                      className="flex-1 px-2.5 py-1 rounded-lg border focus:outline-none"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      className="px-3 py-1 rounded-lg border text-xs font-medium transition hover:opacity-70"
                      style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Açıklama
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ürün açıklaması..."
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>

                {/* Features */}
                <div>
                  <label className="block font-medium mb-1" style={{ color: 'var(--text)' }}>
                    Özellikler (Her satıra bir tane)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.featuresText}
                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                    placeholder="Safir Cam&#10;50m Su Geçirmezlik"
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none font-mono text-[11px]"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full border text-xs font-medium transition hover:opacity-70"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  >
                    İptal
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-medium text-white transition hover:opacity-90 shadow-sm"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
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
