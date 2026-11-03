@echo off
chcp 65001 > nul
title Vercel Urun Guncellemesi
echo ========================================================
echo        VERCEL / GITHUB GÜNCELLEME SİHİRBAZI
echo ========================================================
echo.
echo Yaptığınız tüm ürün ve görsel değişiklikleri kaydediliyor...
echo.

git add .
git commit -m "Urunler ve fiyatlar guncellendi - %date% %time%"
git push

echo.
echo ========================================================
echo Güncellemeler GitHub / Vercel'e gönderildi!
echo Vercel yaklaşık 30-45 saniye içinde sitenizi otomatik güncelleyecektir.
echo ========================================================
echo.
pause
