# Ücretsiz Workers deneme yayını

Hedef: ürün/fiyat/stok vitrini ve WhatsApp iletişimi. Ödeme sistemi ve özel domain yok.
Varsayılan yayın adresi `tekin-magaza.<hesap-alt-alanı>.workers.dev` olacaktır.
Türkiye'den VPN kapalı mobil ve sabit internet testleri geçmeden adresi müşterilere dağıtmayın.

## Hesap olmadan doğrulama

Node.js 22+ kullanın. GitHub Actions `Cloudflare Worker checks and optional publish`
akışı Linux üzerinde şu kontrolleri yapar:

1. Kilit dosyasından `npm ci`.
2. `npm run build:worker`: Next.js ve OpenNext Worker derlemesi.
3. `npm run check:worker`: gerçek yükleme yapmadan Wrangler paket kontrolü.
4. `npm run test:worker`: geçici, yerel D1/R2 üzerinde ürün ekleme, fiyat/stok
   değiştirme, görsel yükleme, yetkisiz yazma engeli, yeniden başlatma sonrası
   kalıcılık, silme ve çıkış kontrolü. Gerçek hesaba/veriye erişmez.

Push ve PR kontrolleri siteyi yayımlamaz. İşlem sonunda yedi gün saklanan
`cloudflare-worker` derleme çıktısı oluşur. Windows'ta Next.js geliştirmesi yapılabilir;
OpenNext paketleme hataları için Linux GitHub Actions kullanılır, WSL kurulumu gerekmez.

## Hesap sahibi tarafından tamamlanacak kurulum

1. Cloudflare hesabını doğrulayın. Bu projeye ait hesabı seçin.
2. D1 üzerinde `tekin-store`, R2 üzerinde `tekin-product-images` oluşturun.
   R2 etkinleştirmesi ödeme yöntemi gerektirebilir; ücretsiz kota üstü kullanım ücretlidir.
3. Worker secret olarak `ADMIN_PIN` (güçlü yönetici parolası) ve en az 32 rastgele
   karakterlik `ADMIN_SESSION_SECRET` tanımlayın. Varsayılan `1234` parolası yoktur.
   Secret değerlerini GitHub'a commit etmeyin ve mesajlara yazmayın.
4. GitHub repository Actions secrets içine bu hesaba sınırlı `CLOUDFLARE_API_TOKEN`
   ve `CLOUDFLARE_ACCOUNT_ID`; Actions variable olarak gerçek D1 UUID'sini
   `CF_D1_DATABASE_ID` adıyla ekleyin. Token yalnız bu hesabın Workers dağıtımı,
   gerekli D1 işlemleri ve R2/OpenNext dağıtım işlemleri için yetkili olmalıdır.
   Yetkiler hesabın gerektirdiği kapsamla sınırlı tutulmalıdır.
5. Akış default branch'e alındığında Actions → ilgili akış → Run workflow açın.
   `publish` seçiliyse önce tüm kontroller tekrarlanır; gerçek veritabanı kimliği
   doğrulanır, migration uygulanır ve kontrol edilmiş Worker yayımlanır.

İlk yayında yönetici secret'ları Worker henüz yokken panelden eklenemiyorsa
yayın sonrasında tanımlayın. Secret'lar tanımlanana kadar yazma/giriş uçları kapalı
kalır; genel vitrin görüntülenebilir. Uygulama parolasını belirlemeden ürün girişine başlamayın.
Token'ın ve hesabın doğruluğu kullanıcı oturumu üzerinden kontrol edilmelidir.

## Teslim kontrolü

- Genel vitrin VPN olmadan Wi-Fi ve mobil internetten açılıyor.
- `/admin` girişi, ürün ve renk görseli yükleme, fiyat değişikliği ve stokta var/yok
  seçimi çalışıyor. Adet bazlı stok sistemi yoktur.
- Başka tarayıcıda aynı ürünler görünüyor; yeni kod yayımlanınca ürün ve görseller kaybolmuyor.
- Paneldeki JSON yedeği ürünler/ayarlar/görsel bağlantılarını içerir; görsel dosyalarını
  içermez. R2 görselleri ayrıca yedeklenmelidir. D1 yedek/geri yükleme de kontrol edilmelidir.
- Worker CPU/paket ve D1/R2 kullanım limitleri izlenir. Küçük site olması tek başına
  bütün limitlere sığacağını garanti etmez; ücretsiz planın yeterliliği yayın testinde doğrulanır.

Katalog halen D1'de tek JSON kaydıdır; bu ilk küçük vitrin için korunmuştur.
D1 satır sınırı 2 MB'dir ve iki yöneticinin eşzamanlı yazması çakışabilir.
Şimdilik Ozan'ın tek başına ürün girmesi uygundur; çoklu editör/büyük katalog
gerektiğinde ürün başına kayıt ve çakışma kontrolüne geçilmelidir.
