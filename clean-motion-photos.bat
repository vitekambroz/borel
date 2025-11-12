@echo off
title BOREL – Čištění Live Photo dat
echo ==============================================
echo   🧹  Odstraňování Live/Motion dat z fotek
echo   Cíl: public/foto/originals
echo ==============================================
echo.

REM === Absolutní cesta ke složce s originály ===
set "PHOTO_DIR=public\foto\originals"
set "EXIFTOOL=%PHOTO_DIR%\exiftool.exe"

REM === Ověření, že exiftool existuje ===
if not exist "%EXIFTOOL%" (
    echo ❌ CHYBA: Nenalezen exiftool.exe v "%PHOTO_DIR%"
    pause
    exit /b
)

cd /d "%PHOTO_DIR%"

REM === Čištění všech JPG souborů ===
echo Spouštím ExifTool...
"%EXIFTOOL%" -overwrite_original -P ^
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