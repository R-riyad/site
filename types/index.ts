export interface ProductColor {
  name: string;
  hex: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  category: string; // matches Category slug (e.g. "supurge", "saat", "gozluk", "parfum", "elektronik", "termos")
  price: number;
  oldPrice?: number;
  description: string;
  features?: string[];
  image: string;
  colors?: ProductColor[];
  badge?: string; // e.g. "Yeni", "Popüler", "Fırsat", "Özel Seri"
  inStock?: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  siteName: string;
  siteSubtitle: string;
  whatsappNumber: string; // e.g. "905551234567"
  announcementText: string;
  adminPin: string;
}

export interface StoreData {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
}

