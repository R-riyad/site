import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'LÜKS VİTRİN | Yeni Nesil Özel Ürün Kataloğu & Fiyat Listesi',
  description:
    'Süpürge, saat, gözlük, parfüm, elektronik ve termos modelleri. Üst düzey tasarım, canlı fiyat ve renk seçenekleri.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#090a0f] text-neutral-100 selection:bg-amber-400 selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
