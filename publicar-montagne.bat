@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  ================================================================
echo   Portal Solar: publicar a versão nova em montagnedejade.org
echo  ================================================================
echo   O domínio já aponta para o projeto "portal-solar" da Vercel.
echo   Trocar o site NÃO precisa da conta da Squarespace.
echo   (A renovação do domínio, em 14/nov/2026, ainda precisa dela.)
echo.
echo   1) Exportando o site público...
node exportar.mjs publico || goto erro
echo.
echo   2) Montando a pasta da Vercel...
node vercel-montar.mjs || goto erro
cd exportado\vercel
echo.
echo   3) Entrando na Vercel (na primeira vez o navegador abre: aprove o login)...
call npx --yes vercel@latest whoami >nul 2>&1
if errorlevel 1 call npx --yes vercel@latest login || goto erro
echo.
echo   4) Ligando esta pasta ao projeto portal-solar (o do montagnedejade.org)...
if not exist ".vercel\project.json" call npx --yes vercel@latest link --yes --project portal-solar || goto erro
echo.
echo   5) Publicando...
call npx --yes vercel@latest deploy --prebuilt --prod || goto erro
echo.
echo   Pronto: https://montagnedejade.org
echo   (A versão anterior fica guardada na Vercel: dá para voltar em Deployments ^> Promote.)
echo.
choice /C SN /M "   Desligar o repositório antigo (interface) deste projeto, para um push antigo não publicar por cima? S = sim, N = agora não"
if errorlevel 2 goto fim
call npx --yes vercel@latest git disconnect
:fim
echo.
pause
exit /b 0
:erro
echo.
echo   Algo deu errado acima. O site que está no ar não foi apagado.
pause
exit /b 1
