@echo off
cd /d "%~dp0"
chcp 65001 > nul
title Vitrin Yonetim Paneli Baslatiliyor...
echo ========================================================
echo       LÜKS VITRIN - YÖNETİM PANELİ BAŞLATILIYOR
echo ========================================================
echo.
echo 1. Sunucu başlatılıyor...
echo 2. Tarayıcınızda Yönetim Paneli açılacak.
echo.
echo Yonetici parolasi .dev.vars dosyasindaki ADMIN_PIN degeridir.
echo Ilk kurulum icin README.md dosyasindaki adimlari uygulayin.
echo.
echo Panel penceresini kapatmak istediğinizde bu siyah ekranı kapatabilirsiniz.
echo ========================================================
echo.

start "" http://localhost:3000/admin
npm run dev
pause

