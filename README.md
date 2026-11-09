# TEKİN Mağaza

Next.js ile hazırlanmış, ürün kataloğu ve yönetim paneli içeren mağaza vitrini. Cloudflare Workers üzerinde OpenNext, D1 ve R2 ile çalışacak şekilde yapılandırılmıştır.

## Yerelde çalıştırma

1. Node.js LTS kurulu olmalı.
2. Proje klasöründe terminal açın ve `npm install` komutunu çalıştırın.
3. `npm run dev` komutuyla siteyi başlatın.
4. Vitrin: [http://localhost:3000](http://localhost:3000) · Yönetim: [http://localhost:3000/admin](http://localhost:3000/admin)

Yerel geliştirmede ürün verileri `data/products.json` dosyasına yazılır; Cloudflare'da D1 kullanılır. Yüklenen görseller yerelde `public/uploads`, yayında R2 içinde saklanır. Yönetim paneli ürün ekleme, silme, ayar değiştirme ve görsel yükleme uçları sunucu tarafı oturumuyla korunur.

## Yerel yönetici girişi

1. `.dev.vars.example` dosyasını `.dev.vars` olarak kopyalayın.
2. Yönetim için güçlü bir parola ve en az 32 karakterlik rastgele bir `ADMIN_SESSION_SECRET` belirleyin.
3. `npm run db:local` ile yerel D1 tablolarını oluşturun.
4. `npm run dev` ile geliştirme sunucusunu başlatın.

## Cloudflare dağıtımı

OpenNext, Workers ve Wrangler bağımlılıkları hazırdır. Cloudflare hesabında `tekin-store` adlı D1 veritabanı ile `tekin-product-images` adlı R2 bucket oluşturulmalı; D1 kimliği `wrangler.jsonc` içine yazılmalıdır. Ardından D1 migration'ları `npx wrangler d1 migrations apply STORE --remote` ile uygulanmalı ve `ADMIN_PIN` ile güçlü bir `ADMIN_SESSION_SECRET` Worker secret olarak eklenmelidir (`npx wrangler secret put ADMIN_PIN`, `npx wrangler secret put ADMIN_SESSION_SECRET`). Son olarak `npm run deploy` dağıtımı yapar. Worker'ın ücretsiz plan limitleri aşılırsa Cloudflare isteklere limit uygulayabilir; kullanımı panelden takip edin.

Ürün ve ayarlar için mağaza panelinin **Yedek Al** özelliğini kullanın.

## Vercel bağlantısını kesme

Bu proje klasöründe Vercel proje bağlantısı (`.vercel`) bulunmuyor. Git tabanlı otomatik dağıtım açıksa Vercel panelinde **Project Settings → Git → Disconnect** adımlarını izleyin. Siteyi yerelde kullanmak için Vercel hesabı veya ortam değişkeni gerekmez.

Yeniden dağıtım yapmadan önce yönetim panelinden ürün yedeği alın. Vercel gibi sunucusuz dağıtımlarda yerel dosyaya yazılan katalog değişiklikleri kalıcı olmayabilir; tekrar yayınlarken kalıcı depolama ayrıca yapılandırılmalıdır.
