@echo off
title BOREL – Čištění Live Photo dat
echo ==============================================
echo   🧹  Odstraňování Live/Motion dat z fotek
echo   Cíl: public/foto/originals
echo ==============================================
echo.

REM === Relativní cesta ke složce s originály (vůči tomuhle .bat) ===
set "PHOTO_DIR=public\foto\originals"

REM === Přepni se do složky, kde leží tenhle .bat (kořen projektu) ===
cd /d "%~dp0"

REM === Ověření, že exiftool existuje ===
if not exist "%PHOTO_DIR%\exiftool.exe" (
    echo ❌ CHYBA: Nenalezen exiftool.exe v "%PHOTO_DIR%"
    pause
    exit /b
)

REM === Přepni se do složky s fotkami ===
cd /d "%PHOTO_DIR%"

REM === Čištění všech JPG souborů ===
echo Spouštím ExifTool...
exiftool.exe -overwrite_original -P ^
  -MotionPhoto -MotionPhotoVersion -MotionPhotoPresentationTimestamp ^
  -MotionPhotoMovieLength -MotionPhotoMovieMimeType -MotionPhotoMovieOffset ^
  -SamsungTrailerLength -TrailerLength -MPImageStart -MPImageLength ^
  -MPImageType -MPImage -all:all= ^
  -tagsFromFile @ -all:all -unsafe ^
  *.jpg

echo.
echo ✅ Hotovo! Všechna Live/Motion data byla odstraněna.
echo ==============================================
pause