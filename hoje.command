#!/bin/zsh
# O hoje.bat do Mac: dois cliques no Finder abrem o Portal Solar no navegador.
# Deixe a janela do Terminal aberta enquanto usa; feche-a para desligar.
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export VAULT="${VAULT:-$(cd .. && pwd)/blessednotebook}"
node servir.mjs || { echo; echo "Falhou. O Node está instalado? Rode: node --version"; read -k1 "?Aperte uma tecla para fechar."; }
