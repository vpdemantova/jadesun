# 94 · Os outros visitantes e o seu boneco
#vitordemantova #laboratorio #3d #privacidade #publicacao #pedido-grande

**"faça com que todas as pessoas que acessarem o site vejam umas às outras e customizem seus bonecos!"** (da lista de 12/out/2026, perto da meia-noite)

## No ar

- **www.vitordemantova.com**: commit `c44dbe7`, às 23h22 de 13/out.

## O que mudou

- Quem está no Laboratório ao mesmo tempo aparece andando e pulando, com o boneco que escolheu; nos mapas, um ponto na cor do cachecol.
- O botão Seu boneco: a cor do corpo, a do cachecol e o que vai na cabeça (a faixa, um chapéu ou nada); "Aparecer para os outros" desligado: você vê, mas ninguém vê você.
- Só a posição e as escolhas vão para o servidor: nenhum nome, nenhum texto livre, nada pessoal.
- No celular, o Laboratório cortava 14 px à direita; corrigido.
- Para funcionar no ar, falta ligar o Redis da Upstash ao projeto na Vercel (o mesmo do Mural, que também está desligado por isso).

## Conferido

- `npm run check` e o build numa cópia limpa.
- Dois navegadores ao mesmo tempo no Laboratório (no desenvolvimento, com os dados na memória): um vê o outro andando, pulando e trocando de cor.

---
[[0 Índice|Índice]] · ← [[093 — A Malha num painel só|093]] · [[095 — O piano, a luz ultravioleta, o repolho roxo e o plano da altura dos olhos|095]] →
