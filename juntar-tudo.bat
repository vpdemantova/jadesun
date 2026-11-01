@echo off
chcp 65001 >nul
rem Dois cliques: todos os repositórios de D:\www juntos com o GitHub, sem perder nada (o juntar-tudo.mjs explica como).
cd /d "%~dp0"
node juntar-tudo.mjs %*
if errorlevel 9009 echo O Node não foi encontrado. Ele está instalado? Rode: node --version
echo.
pause
