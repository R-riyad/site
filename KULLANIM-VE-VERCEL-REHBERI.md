# Lüks Vitrin Kullanım Rehberi

## Siteyi başlatma

`Siteyi-Goruntule.bat` dosyasını açın veya proje klasöründe `npm run dev` komutunu çalıştırın. Vitrin `http://localhost:3000`, yönetim paneli `http://localhost:3000/admin` adresindedir.

## Yönetim paneli

Varsayılan giriş PIN'i `212408`'dir. Panelden ürün ekleyip düzenleyebilir, görsel yükleyebilir, site bilgilerini ve WhatsApp numarasını güncelleyebilir, ürün verilerini JSON olarak yedekleyebilirsiniz. Görseller `public/uploads` altında, ürünler ve ayarlar `data/products.json` içinde tutulur.

## Vercel bağlantısı

Projede Vercel'e gönderim düğmesi veya otomatik Git push işlemi bulunmaz; site bu klasörde yerel olarak çalışır. Git entegrasyonunu hesabınızda kapatmak için Vercel projesinde **Project Settings → Git → Disconnect** adımlarını izleyin. Proje klasöründe `.vercel` bağlantı dizini de bulunmuyor.

Yeniden yayınlamadan önce JSON yedeği alın. Sunucusuz barındırmada yerel dosya değişiklikleri kalıcı değildir; yeniden yayınlarken kalıcı veri deposu ayrıca kurulmalıdır.
