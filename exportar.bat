@echo off
cd /d "%~dp0"
echo.
echo  EXPORTAR o Portal Solar como site (funciona sem o computador)
echo.
echo   1 = PUBLICO  (Biblioteca + linha do tempo; para publicar na internet)
echo   2 = PRIVADO  (tudo, com o seu progresso; para uso pessoal. NAO publique)
echo.
set /p op=Escolha 1 ou 2: 
if "%op%"=="2" (node exportar.mjs privado) else (node exportar.mjs publico)
if errorlevel 1 (
  echo.
  echo Falhou. Rode primeiro: npm install
  pause
  exit /b 1
)
echo.
echo Pronto. A pasta gerada esta em jadesun\exportado. Leia o LEIA-ME.txt e o RELATORIO.md dentro dela.
start "" explorer "%~dp0exportado"
pause
