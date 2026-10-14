# 102 · As duas barras iguais e os desenhos no lugar dos nomes
#vitordemantova #menus #design #celular #correcao #erro-meu #publicacao

**"não era isso! você voltou com os nomes nos botões..!? o menu de cima está estragado, está uma vergonha, é pra ser igualzinho o de baixo! elegante! e que faça sentido!"**, **"e no desktop, os textos devem se transformar em partículas! o ícone da música e da escrita precisam ser tão bons quanto o de fotografia, o de serviços e o de now também, capriche mais neles..!"** e **"a altura do menu de cima era brincadeira, está minúsculo, 0 design, 0 grid, 0 proporção e design system.. por favor.. tenha certeza de entregar algo decente!"** (14/out/2026, à tarde)

## No ar

- **www.vitordemantova.com**: commit `87775c0`, às 14h10.

## O erro

- Na 086, li "metade do tamanho" como a altura e deixei os nomes escritos no Contato e no Perfil, quando o pedido era só o desenho. A barra de cima virou uma tira de 22 px, sem nada da barra de baixo. Na 101, eu ainda disse que ela estava certa.

## O que mudou

- **As duas barras são a mesma peça.**
  - No computador, a de cima tem as medidas da de baixo: 66 px de altura, os trilhos afundados de 52 px e os botões redondos de 38 px, com os desenhos de grãos.
  - No celular, as duas usam a mesma conta.
- **As colunas batem.**
  - O Contato fica no centro exato, em cima do botão de modo.
  - O Perfil e o idioma (a bandeira) ficam nas mesmas colunas dos Links e do ∞.
  - À esquerda: a logo pequena, o nome e o trilho do tocador (o tocar, com o anel do progresso, e a próxima).
- **Nenhum nome escrito nos botões, em tela nenhuma.**
  - No computador, os nomes da barra de baixo viraram os desenhos de grãos, como no celular.
  - O nome de cada botão aparece numa dica, com o mouse em cima ou com o foco do teclado, no mesmo desenho da "Editorial" do botão de modo.
- **As seções começam abaixo da barra de cima** (no computador, a 100 px do alto; no celular, a 80).
- **Os desenhos refeitos, na medida do olho da Foto:**
  - Música: a clave de sol (a de "Sol"), um traço só, com a bolinha cheia;
  - Escrita: a pena de caneta-tinteiro inclinada, escrevendo, com a linha de tinta;
  - Serviços: o compasso de pé, com a dobradiça, a agulha e o grafite (sem o arco que o fazia um "A");
  - Agora: o sol nascendo, com o disco cheio no meio, como a pupila do olho.
  - Os quatro valem na barra, nas marcas das seções, na folha do Menu e no Sumário do Editorial.

## Conferido

- `npm run check` e o build numa cópia limpa.
- Com a placa de vídeo, em 11 telas: do computador de 1440 px e do notebook de 1280 × 720 ao celular de 320 px e ao celular deitado.
- As duas barras com as mesmas medidas, nenhum botão sobreposto ou fora da tela, sem rolagem lateral.
- As dicas, o Contato aberto (vira o fechar), o idioma e o Perfil abrindo pelos botões novos, e o alto de cada seção abaixo da barra.
- Os quatro desenhos comparados com o olho antes de entrar, em SVG e em grãos, em três tamanhos.

---
[[0 Índice|Índice]] · ← [[101 — Onde fica o Upstash, e a barra de cima com 22 px|101]]
