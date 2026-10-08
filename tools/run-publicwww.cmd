@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title TaskForge PublicWWW CSV Export
echo.
echo TaskForge PublicWWW Export - Windows Launcher
echo ==============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 or newer is needed. Install it from https://nodejs.org/
  echo No search has been run.
  pause
  exit /b 1
)
if not exist "publicwww-locations.csv" (
  copy /Y "publicwww-locations.example.csv" "publicwww-locations.csv" >nul
  echo Created editable publicwww-locations.csv from the example.
  echo Edit towns, telephone codes and postcode districts, then run again.
  echo No API request has been made.
  pause
  exit /b 0
)
echo Checking the location CSV and generating a preview...
node "publicwww-export.mjs" --locations "publicwww-locations.csv" --out "publicwww-results.csv" --max-queries 200
if errorlevel 1 (
  echo The preview failed. Check the error above and fix the input.
  pause
  exit /b 1
)
echo.
echo Review publicwww-results.csv.plan.csv before spending API quota.
echo Requires a customer-provided PAID PublicWWW API account.
echo NO API requests have been made yet.
echo.
choice /C YN /N /M "Run the approved API searches now? This uses your PublicWWW quota. [Y/N]: "
if errorlevel 2 goto cancel
echo.
echo Your API key will be typed into a hidden prompt. It is not saved to disk.
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; $s=Read-Host 'PublicWWW API key' -AsSecureString; $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s); try { $env:PUBLICWWW_API_KEY=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr); & node 'publicwww-export.mjs' '--locations' 'publicwww-locations.csv' '--out' 'publicwww-results.csv' '--max-queries' '200' '--execute'; exit $LASTEXITCODE } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }"
if errorlevel 1 (
  echo API export failed or ended partially; review publicwww-results.csv.report.json.
  pause
  exit /b 1
)
echo.
echo Done. Open publicwww-results.csv and publicwww-results.csv.report.json.
pause
exit /b 0
:cancel
echo Cancelled. Preview saved; no API requests were made.
pause
exit /b 0
