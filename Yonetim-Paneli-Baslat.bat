@echo off
chcp 65001 > nul
title Vitrin Yonetim Paneli Baslatiliyor...
echo ========================================================
echo       LÜKS VITRIN - YÖNETİM PANELİ BAŞLATILIYOR
echo ========================================================
echo.
echo 1. Sunucu başlatılıyor...
echo 2. Tarayıcınızda Yönetim Paneli açılacak.
echo.
echo Panel Giriş Şifreniz: 1234
echo (Bu şifreyi panel içerisindeki 'Ayarlar' sekmesinden değiştirebilirsiniz)
echo.
echo Panel penceresini kapatmak istediğinizde bu siyah ekranı kapatabilirsiniz.
echo ========================================================
echo.

start "" http://localhost:3000/admin
npm run dev
pause
