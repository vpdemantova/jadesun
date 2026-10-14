# 103 · A grade do site inteiro, os textos do menu em grãos e a logo que explode sozinha
#vitordemantova #design #menus #celular #movimento #pedido-grande #publicacao

**"vamos refazer a grid pela última vez! o mosaico deve ser uma grid profissional, quadrada mesmo, mas alinhada com todos os elementos e botões e tudo mais. deixe tudo alinhado a essa grid, bem perceptível e implementada, para mobile também / todos os textos do menu devem ser partículas igual os ícones, interativos / depois de entrar no site, no modo estúdio, depois de 3 segundos a logo expande, como se fosse um clique, o fundo laranja reage, só pra pessoa ver a animação!"** (14/out/2026, à tarde)

## No ar

- **www.vitordemantova.com**: commit `799f49b`, às 17h49.

## A grade

- **Uma medida só para o Estúdio:** a célula quadrada.
  - As colunas cabem exatas na largura e são em número ímpar, para o botão de modo e o Contato ficarem na coluna do meio.
  - Perto de 66 px no computador (21 colunas numa tela de 1440); 9 colunas no celular; 7 abaixo de 360 px; no celular deitado, 9 linhas.
  - A medida é feita antes da primeira pintura, e de novo quando a tela muda.
- **Antes**, o mosaico tinha a célula fixa e começava no canto da tela: não batia com nada. No celular, o fundo saía esticado e as pedras viravam retângulos.
- **O mosaico é a grade:**
  - uma pedra por célula;
  - por cima, as linhas e uma cruz em cada encontro, no pixel exato da tela (bem visíveis, também no rodapé).
- **As barras:**
  - uma célula de altura, um botão no meio de cada célula, os trilhos em células inteiras;
  - o Contato e o botão de modo na mesma coluna; o Perfil e o idioma sobre os Links e o ∞.
- **As seções:**
  - o conteúdo fica entre as linhas e começa duas linhas abaixo do alto;
  - cada bloco ocupa células inteiras (o cabeçalho, o título, a abertura, cada serviço, os cartões, a lista de obras, o rodapé), em qualquer língua;
  - as entrelinhas são frações da célula;
  - os cartões dos Projetos ficam em duas colunas (três cartões iguais não cabem nas linhas).
- **A rolagem**, quando para, para sempre numa linha.

## Os textos do menu

- Viraram grãos, no mesmo campo dos ícones: as letras são desenhadas com a letra de verdade de cada um, e os grãos chegam da esquerda para a direita, abrem sob o ponteiro e se espalham no clique.
- Vale para o nome nas duas barras, as dicas de todos os botões (os grãos chegam quando o ponteiro entra) e a folha do Menu do celular (as seções, os números, os modos e a música).
- O texto de verdade fica no lugar, transparente, para quem usa leitor de tela.

## A logo

- Três segundos depois de ficar inteira, a logo do topo explode sozinha, como num clique, e a onda laranja corre pelo mosaico.
- Uma vez por visita. Não acontece se a pessoa já clicou, nem com "reduzir movimento".

## Conferido

- `npm run check` e o build numa cópia limpa.
- Na build de produção, com a placa de vídeo, em 10 telas: do computador de 1920 px ao celular de 320 e ao celular deitado. As barras ficam na grade, sem nenhum botão sobreposto ou fora da tela e sem rolagem lateral.
- Cada seção parada no começo, com o conteúdo nas linhas.
- Os textos em grãos e a explosão da logo 3 s depois da entrada.
- O Editorial inteiro.

---
[[0 Índice|Índice]] · ← [[102 — As duas barras iguais e os desenhos no lugar dos nomes|102]]
