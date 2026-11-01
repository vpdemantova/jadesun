#!/bin/zsh
# O juntar-tudo.bat do Mac: dois cliques no Finder juntam todos os repositórios de ~/www com o GitHub, sem perder nada.
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
node juntar-tudo.mjs "$@" || [ $? -eq 1 ] || echo "Falhou. O Node está instalado? Rode: node --version"
echo
read -k1 "?Aperte uma tecla para fechar."
