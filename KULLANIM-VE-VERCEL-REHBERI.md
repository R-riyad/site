# 🛍️ Özel Ürün Kataloğu & Fiyat Vitrini Kullanım Rehberi

Bu proje, ürünlerinizi bilgisayarınızdan kolayca yönetebileceğiniz, sepetsiz yalnızca **ürün bilgisi, fiyatı, görselleri ve renk seçeneklerini** sergileyen ve **Vercel** üzerinden herkese gönderebileceğiniz bir link oluşturan modern bir katalog web sitesidir.

---

## 🌟 Hazır Olarak Eklenen Bölümler (Kategoriler)
1. **Süpürge** (`supurge`) - Kablosuz, dikey ve akıllı süpürgeler
2. **Saat** (`saat`) - Klasik çelik, spor ve AMOLED akıllı saatler
3. **Gözlük** (`gozluk`) - Polarize titanyum ve asetat tasarım güneş gözlükleri
4. **Parfüm** (`parfum`) - Niş, kalıcı extrait ve eau de parfum kokuları
5. **Elektronik Aletler** (`elektronik`) - ANC kulaklıklar, bluetooth hoparlörler vb.
6. **Termos** (`termos`) - Çift cidarlı çelik ve LED sıcaklık göstergeli akıllı termoslar

*(İstediğiniz zaman yeni kategoriler ekleyebilir veya mevcutları düzenleyebilirsiniz).*

---

## 💻 1. Kendi Bilgisayarınızdan Yönetim Paneline Giriş

Klasör içerisinde sizin için tek tıkla çalışan hazır dosyalar oluşturuldu:

1. **`Yonetim-Paneli-Baslat.bat`** dosyasına **çift tıklayın**.
2. Siyah ekran açılacak ve tarayıcınızda otomatik olarak şu adres açılacaktır:
   👉 **`http://localhost:3000/admin`**
3. **Giriş Şifresi:** `1234` *(Paneldeki Ayarlar sekmesinden dilediğiniz zaman değiştirebilirsiniz).*

### Panelde Neler Yapabilirsiniz?
- **Yeni Ürün Ekle:** Ürün adını girin, kategorisini seçin, fiyatını belirleyin.
- **Bilgisayarınızdan Görsel Yükleyin:** "Bilgisayardan Resim Seç" butonuna basarak istediğiniz ürün fotoğrafını yükleyin veya doğrudan bir web resim linki yapıştırın.
- **Renk Seçenekleri Ekleyin:**
  - İster hazır renklere tıklayın (Siyah, Beyaz, Gümüş, Altın, Rose Gold, vb.),
  - İster renk paletinden kendi özel renginizi seçip isim verin.
- **Özellikler Ekleyin:** Alt alta maddeler halinde özellikler yazın (Örn: "2 yıl garanti", "UV400 koruma").
- **Rozet Belirleyin:** "Yeni", "Çok Satan", "Özel Seri" gibi etiketler ekleyin.
- **Düzenle / Sil:** İstediğiniz ürünün fiyatını veya bilgisini saniyeler içinde güncelleyin.
- **Yedek Al (JSON):** "JSON Yedekle" butonuyla tüm ürünlerinizi tek tıkla bilgisayarınıza dosya olarak indirin.

---

## 🌐 2. Vercel'den Canlı Link Oluşturma (İnsanlara Göndermek İçin)

Vercel tamamen **ücretsizdir** ve sitenizi tüm dünyaya saniyeler içinde açar.

### Yöntem A: GitHub ile Otomatik Bağlantı (En Kolay ve Tavsiye Edilen)
1. **GitHub Hesabı:** [github.com](https://github.com) adresine ücretsiz üye olun veya giriş yapın.
2. Sağ üstten **"New Repository"** deyin, örneğin adını `urun-katalogu` yapın ve **Create** butonuna tıklayın.
3. Bu klasörde PowerShell veya komut satırını açıp şu iki satırı yazın (GitHub'ın size verdiği bağlantı ile):
   ```bash
   git remote add origin https://github.com/KULLANICI_ADINIZ/urun-katalogu.git
   git push -u origin main
   ```
4. **Vercel'e Giriş:** [vercel.com](https://vercel.com) adresine gidin ve **"Continue with GitHub"** ile giriş yapın.
5. **"Add New"** -> **"Project"** butonuna basın ve `urun-katalogu` projenizin yanındaki **"Import"** butonuna tıklayın.
6. Hiçbir ayarı değiştirmeden **"Deploy"** butonuna basın.
7. 🎉 **Tebrikler!** Yaklaşık 1 dakika sonra Vercel size şu formatta bir bağlantı verecektir:
   👉 `https://urun-katalogu.vercel.app` (Bu linki müşterilerinize, Instagram biyografinize veya WhatsApp'tan herkese gönderebilirsiniz).

---

### Yöntem B: Vercel CLI ile Doğrudan Terminalden Link Oluşturma
Eğer GitHub kullanmak istemiyorsanız doğrudan bilgisayarınızdan şu komutla da deploy edebilirsiniz:
```bash
npx vercel
```
Ekrana gelen sorulara `Enter` basarak onay verin, size hemen canlı link oluşturacaktır.

---

## 🔄 3. Ürün Eklediğinizde Vercel'i Güncelleme

Bilgisayarınızdaki yönetim panelinden yeni ürünler ekledikten veya fiyatları değiştirdikten sonra:

1. Klasördeki **`Vercel-Guncelle.bat`** dosyasına **çift tıklayın**.
2. Bu sihirbaz tüm yeni ürün ve görsellerinizi GitHub'a aktarır.
3. Vercel değişikliği otomatik algılar ve 30 saniye içinde sitenizi günceller!

---

## 📱 4. Müşterileriniz Sitenizi Nasıl Görecek?

- **Sepetsiz Şık Vitrin:** Müşteriler gereksiz sepet veya üyelik adımlarıyla uğraşmaz, doğrudan ürünleri ve fiyatları görür.
- **Bölümlü Görünüm:** Süpürge, Saat, Gözlük, Parfüm, Elektronik, Termos bölümleri başlıkları ve açıklamalarıyla ayrı ayrı listelenir.
- **İnteraktif Renk Seçicisi:** Müşteriler ürün kartındaki renk noktalarına tıklayarak renkleri inceleyebilir.
- **Detay & WhatsApp:** Ürünün üzerine tıkladıklarında büyük fotoğraf, tam açıklama, renk seçenekleri ve **"WhatsApp ile Bilgi Al"** butonu açılır.
- **Otomatik WhatsApp Mesajı:** Müşteri butona bastığında WhatsApp'ta otomatik olarak şu mesaj hazırlanır:
  > *"Merhaba, Titanium AMOLED Akıllı Saat (Renk: Uzay Grisi) - Fiyat: 3.490 ₺ hakkında bilgi almak istiyorum."*
  (Paneldeki Ayarlar sekmesinden kendi WhatsApp numaranızı girmeniz yeterlidir).

---

## 📁 Dosya Yapısı

- `data/products.json` -> Tüm ürünlerin ve ayarların saklandığı ana veri dosyası.
- `public/uploads/` -> Bilgisayarınızdan yüklediğiniz ürün resimlerinin saklandığı klasör.
- `Yonetim-Paneli-Baslat.bat` -> Yönetim panelini açan Windows kısayolu.
- `Siteyi-Goruntule.bat` -> Vitrin sitesini yerel olarak açan kısayol.
- `Vercel-Guncelle.bat` -> Yapılan değişiklikleri Vercel'e gönderen kısayol.

