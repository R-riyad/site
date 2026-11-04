@echo off
chcp 65001 > nul
title Vitrin Sitesi Aciliyor...
echo ========================================================
echo               LÜKS VITRIN SİTESİ
echo ========================================================
echo.
echo Tarayıcınızda vitrin sitesi açılıyor: http://localhost:3000
echo.
start "" http://localhost:3000
npm run dev
pause

