@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

cd /d "%~dp0"

echo.
echo ========================================
echo   Teknomuallim - GitHub Push
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [HATA] Git yuklu degil. https://git-scm.com adresinden kurun.
  pause
  exit /b 1
)

set "GIT_AUTHOR_NAME=RECEP BALOGLU"
set "GIT_COMMITTER_NAME=RECEP BALOGLU"
set "GIT_AUTHOR_EMAIL=baloglurecep@users.noreply.github.com"
set "GIT_COMMITTER_EMAIL=baloglurecep@users.noreply.github.com"

git status
echo.

set /p MSG=Commit mesaji (Enter = otomatik mesaj): 
if "!MSG!"=="" (
  for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set D=%%c-%%a-%%b
  for /f "tokens=1-2 delims=: " %%a in ("%time%") do set T=%%a-%%b
  set "MSG=Manual update !D! !T!"
)

echo.
echo Dosyalar ekleniyor...
git add -A
if errorlevel 1 (
  echo [HATA] git add basarisiz.
  pause
  exit /b 1
)

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo Kaydedilecek degisiklik yok. Push atlaniyor.
  git status
  pause
  exit /b 0
)

echo.
echo Commit: !MSG!
git commit -m "!MSG!"
if errorlevel 1 (
  echo [HATA] Commit basarisiz.
  pause
  exit /b 1
)

echo.
echo GitHub'a gonderiliyor (origin main)...
git push origin main
if errorlevel 1 (
  echo [HATA] Push basarisiz. Internet veya GitHub oturumunu kontrol edin.
  pause
  exit /b 1
)

echo.
echo [OK] Push tamamlandi. Netlify birkaç dakika icinde deploy eder.
echo.
git log -1 --oneline
echo.
pause
endlocal
