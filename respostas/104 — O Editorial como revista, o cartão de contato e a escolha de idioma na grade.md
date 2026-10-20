# 104 · O Editorial como revista, o cartão de contato e a escolha de idioma na grade
#vitordemantova #design #editorial #menus #idiomas #movimento #pedido-grande #correcao #erro-meu #publicacao

**"the editorial version is very off, improve the processing and make it more like a european magazine level of design and editoring"** e **"SAME FOR CONTACT CARD!"**; depois, **"os ícones em partículas das seções não devem rotacionar e todas as partículas de ícones e textos devem ser menores, mais número! a definição delas não está muito boa agora / dê um destaque pro botão do card de contato / o menu de choose a language está bem brega e slopped.. quando muda pro mapa ele não deve mudar de tamanho - refaça todo o design e diagramação dele também, com mais grid e modernidade / Diminua o tamanho da espiral de the end is the beginning"** (14/out/2026, à noite)

## No ar

- **www.vitordemantova.com**: commit `3b90a45`, às 19h07.

## O Editorial, uma revista

- **Páginas de papel** sobre a mesa de pied-de-poule: a capa, o sumário, uma página por seção e a contracapa. Cada uma tem o cabeço no alto e o fólio no pé, com o número da página.
- **Três letras fixas:** Instrument Serif nos títulos e no nome, Newsreader no texto, Instrument Sans nos rótulos. A letra mono saiu.
- **A capa:** o nome na largura toda, com o "P." em vermelho; os ofícios; a abertura com capitular; os papéis numa tabela; o selo com a legenda "Fig. 1"; as chamadas das quatro seções.
- **Cada seção:** o numeral romano em vermelho ao lado do título, a linha de apoio embaixo e um fio.
- **Menos itálico** (o pedido de 10/out continua valendo): o itálico fica só no sumário, nas citações e no nome.
- **Os Serviços** num anúncio de página inteira, em tinta.
- **A contracapa:** o expediente, com o nome na largura toda, como na capa.
- **No celular:** os Projetos continuam nas duas colunas de jornal (o seu pedido de 08/out), agora com o texto alinhado à esquerda, sem os buracos entre as palavras.

## O cartão de contato

- **Nas letras da revista**, tinta preta e um vermelho só. Saíram a letra mono e as cores das marcas (o azul do Behance, o rosa do Dribbble).
- **À esquerda, a identidade:** o nome em duas linhas, os ofícios e a cidade.
- **À direita, uma ficha:** cada linha com o seu rótulo (E-mail, WhatsApp, Portfólio, Também, Instagram, LinkedIn, X, YouTube), com um fio entre os grupos.
- Embaixo, o site e "Ver o perfil". O verso continua só com a logo.
- O cartão cresce se a letra pedir: nada é cortado. No celular, em pé, a ficha fica embaixo.

## O botão de contato em destaque

- No meio da barra de cima, o mesmo disco de papel do botão de modo, que fica no meio da de baixo: o mesmo tamanho e o mesmo anel de pontos laranja, que se fecha com o mouse em cima ou com o cartão aberto. Os dois centros se respondem.

## Os grãos

- **Nos ícones:** 900 grãos (eram 260), bem menores, espalhados também na largura do traço, para ele não afinar. A borda de cada grão ficou nítida (o grão pequeno era um borrão).
- **A logo dos Projetos** saía em zigue-zague, porque a escolha dos grãos embaralhava as fileiras; agora sai limpa.
- **Nos textos:** mais grãos, e menores.
- **As marcas das seções não giram mais:** abrem e fecham, sem rotação, na chegada e no clique.

## A escolha de idioma

- **O painel mora na grade do site:** 15 colunas no computador, a largura toda no celular, e linhas inteiras entre as duas barras.
- **O mesmo tamanho na lista, no mapa e na busca.** Antes, no computador, tinha 810 px de altura na lista e 764 no mapa; no celular, 743 e 536.
- **Por dentro, tudo em células:** a cabeça numa linha, a lista em três colunas como um índice (a bandeira, o nome na língua, o país e o código, que vira o "olá" sob o mouse) e o pé. As linhas da grade aparecem de leve no papel.
- Uma letra só, sem mono e sem as bordas duplas de antes.

## A espiral do fim

- Agora ocupa uma célula da grade: 67 px no computador e 41 no celular. Era o dobro.

## Erros meus, corrigidos

- **Na barra nova (commit `87775c0`)**, o cartão de contato não achava mais o botão Contato e voava de um canto qualquer. Agora sai do botão de novo.
- **Na grade (commit `799f49b`)**, os quatro cartões do fim do Estúdio no celular (Laboratório, Guia, Mosaico, Malha) ganharam uma altura fixa, e o texto de três linhas vazava; a seta aparecia fora do cartão. Agora os quatro têm o mesmo tamanho, o texto cabe e a seta saiu.
- **Também da grade:** com a janela em tamanho zero (uma prévia, uma aba que ainda não abriu), as linhas da grade contavam sem parar e travavam a página. Agora isso não acontece.

## Conferido

- `npm run check` e o build numa cópia limpa.
- No navegador, com a placa de vídeo, no computador (1440) e no celular (390):
  - as páginas do Editorial;
  - o cartão, frente e verso;
  - a escolha de idioma (lista, mapa e busca, no Estúdio e no Editorial), medindo que o painel tem o mesmo tamanho nas três;
  - as barras, os grãos de perto e o fim do Estúdio.
- Depois da publicação, os estilos novos estão no CSS do site no ar.

---
[[0 Índice|Índice]] · ← [[103 — A grade do site inteiro, os textos do menu em grãos e a logo que explode sozinha|103]] · [[105 — As barras do celular, a mesma altura, nas bordas, e o botão de modo no meio|105]] →
