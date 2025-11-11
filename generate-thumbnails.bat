@echo off
echo ======================================
echo  🖼️  GENEROVÁNÍ MINIATUR PRO BOREL
echo ======================================

REM --- Kontrola Node.js ---
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Node.js nebyl nalezen. Stáhni ho z https://nodejs.org/ a zkus to znovu.
  pause
  exit /b
)

REM --- Instalace závislostí, pokud nejsou ---
if not exist "node_modules" (
  echo 📦 Instalují se potřebné moduly...
  npm install sharp
)

REM --- Kontrola složek ---
if not exist "foto\originals" (
  echo ❌ Složka "foto\originals" nebyla nalezena!
  pause
  exit /b
)

if not exist "foto\thumbnails" (
  echo 📁 Vytvářím složku pro thumbnaily...
  mkdir foto\thumbnails
)

REM --- Spuštění Node skriptu ---
echo 🚀 Spouštím generování...
node scripts\generate-thumbnails.js

echo.
echo ✅ Hotovo! Miniatury jsou ve složce foto\thumbnails
echo ======================================
pause