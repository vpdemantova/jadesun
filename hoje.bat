@echo off
cd /d "%~dp0"
node servir.mjs
if errorlevel 1 (
  echo.
  echo Falhou. O Node esta instalado? Rode: node --version
  pause
)
