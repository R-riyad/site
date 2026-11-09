# Lüks Vitrin Kullanım Rehberi

## Siteyi başlatma

`Siteyi-Goruntule.bat` dosyasını açın veya proje klasöründe `npm run dev` komutunu çalıştırın. Vitrin `http://localhost:3000`, yönetim paneli `http://localhost:3000/admin` adresindedir.

## Yönetim paneli

Varsayılan parola yoktur. Yönetici parolası `ADMIN_PIN` ve oturum anahtarı
`ADMIN_SESSION_SECRET` ile sunucuda tanımlanır. Panelden ürün ekleyip düzenleyebilir,
görsel yükleyebilir, fiyat ve stokta var/yok bilgisini değiştirebilirsiniz.
Cloudflare yayınında ürünler D1, görseller R2 içinde tutulur. JSON yedeği görsel
dosyalarını içermez; görseller ayrıca yedeklenmelidir. Güncel yayın adımları
[DEPLOYMENT.md](DEPLOYMENT.md) dosyasındadır.

## Vercel bağlantısı

Projede Vercel'e gönderim düğmesi veya otomatik Git push işlemi bulunmaz; site bu klasörde yerel olarak çalışır. Git entegrasyonunu hesabınızda kapatmak için Vercel projesinde **Project Settings → Git → Disconnect** adımlarını izleyin. Proje klasöründe `.vercel` bağlantı dizini de bulunmuyor.

Yeniden yayınlamadan önce JSON yedeği alın. Sunucusuz barındırmada yerel dosya değişiklikleri kalıcı değildir; yeniden yayınlarken kalıcı veri deposu ayrıca kurulmalıdır.
