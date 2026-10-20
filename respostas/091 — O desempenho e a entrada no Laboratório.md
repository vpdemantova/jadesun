# 91 · O desempenho e a entrada no Laboratório
#vitordemantova #desempenho #laboratorio #publicacao #pedido-grande

**"a transição para o laboratório está travada e não muito fluida apesar de perfeita, tem como você melhorar isso?… como está a performance e otimização?"** (da lista de 12/out/2026, perto da meia-noite)

## No ar

- **www.vitordemantova.com**: commit `dc89a92`, às 15h30 de 13/out.

## O que mudou

- A entrada sem trancos durante o movimento: o mundo monta com a escotilha parada, e os shaders são compilados antes de ela abrir, um pedaço por quadro.
- Com o Laboratório aberto, o Estúdio por trás deixa de ser pintado; o terreno e a grama são contados uma vez por visita.
- O site parado gasta menos: o visualizador do tocador não desenha mais escondido, e o fundo não mede a página a cada quadro.
- Nada mudou na tela.

## Conferido

- `npm run check` e o build numa cópia limpa.
- Perfis de CPU e quadro a quadro, antes e depois, na build de produção.

## Pode esperar

- Dois ganhos que pedem uma escolha sua (não feitos): o `logo.glb` quantizado (de 480 KB para uns 100 KB) e trocar o p5 (1 MB) por um desenho próprio, num trabalho maior.

---
[[0 Índice|Índice]] · ← [[090 — O Editorial, a logo de papel inteira e o pied-de-poule de um dente só|090]] · [[092 — O Guia do Laboratório, patrocinado pelo Portal Solar|092]] →
