# 105 · As barras do celular: a mesma altura, nas bordas, e o botão de modo no meio
#vitordemantova #design #menus #celular #grade #correcao #publicacao

**"o menu mobile nao esta nada responsivel e navegalvel / o tamanho deve ser o mesmo e eles devem quase encontar o extremo das telas, em cima e me baixo, pra otimizar o espaco, e o botao de mudar o modo deve ficar no meio! concilicar tres botoes na barra de baixo, e em cima deve ter a mesma altura..!"** (15/out/2026, de manhã)

## No ar

- **www.vitordemantova.com**: commit `442165e`, às 7h02.

## O que estava errado

Medido num celular de 390 × 844:

- A barra de cima tinha 41 px de altura e a de baixo, 61.
- A de cima ficava a 8 px do alto; a de baixo, a 23 px do pé.
- O botão de modo não estava na barra (só dentro do Menu).
- No tablet, as duas barras ficavam a 39 px das bordas.
- Com o celular deitado, as setas e o nome da seção saíam do trilho em pé.

## As duas barras agora

- **A mesma altura**: 61 px no celular, uma célula e meia da grade. No tablet, uma célula.
- **Quase nas bordas**: a 8 px do alto e a 8 px do pé, no celular; a 12 px, no tablet.
- **O mesmo desenho nas duas**, 4 · 1 · 4 colunas da grade:
  - em cima: o nome · o Contato · o tocar, os sons, o Perfil e o idioma;
  - embaixo, **três peças**: a seção (a seta de subir, o nome, a de descer) · **o botão de modo, no meio**, logo abaixo do Contato · o Menu, de ponta a ponta.
- **Todos os botões do mesmo tamanho**. Antes, as setas e o Menu eram maiores que os outros.
- **O nome da seção mostra o que cabe**:
  - no celular, o nome;
  - no tablet, o desenho, o número e o nome;
  - em telas de menos de 360 px e no celular deitado, só o desenho;
  - no fim, só o ∞.
- **O celular deitado**: as mesmas três peças, de cima para baixo, no trilho da direita.
- **No Menu**: saiu o Editorial, que agora é o botão do meio. Ficam o Laboratório, o Mosaico, a Malha e os sons, dois a dois.

## Conferido

- `npm run check` e o build numa cópia limpa.
- No navegador, com a placa de vídeo, em dez telas: de 320 a 1024 px de largura, em pé e deitado. Em todas:
  - as duas barras com a mesma altura;
  - o botão de modo no centro;
  - nenhum botão fora da barra;
  - nenhuma rolagem de lado.
- Usei como uma pessoa usaria: as setas, o toque no nome, o Menu (abrir e fechar), o fim e o botão de modo, que abriu o Editorial.

---
[[0 Índice|Índice]] · ← [[104 — O Editorial como revista, o cartão de contato e a escolha de idioma na grade|104]] · [[106 — O menu do celular em tela cheia, o cartão, as línguas e o Laboratório|106]] →
