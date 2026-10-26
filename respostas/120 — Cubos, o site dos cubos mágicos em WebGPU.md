# 120 · Cubos: o site dos cubos mágicos, em WebGPU
#pedido-grande #cubos #webgpu #3d #algoritmos #aulas #loja #design #fontes #motor

**O pedido de 25/out/2026, à noite:**

> *"em webgpu todos os cubos mágicos, vou estudar interface dos sites com algoritmos e fazer a melhor interface e design com todos os algoritmos e aulas desse mundo! e montar no futuro uma loja e revender aqui no brasil os melhores cubos! monte o site inicial agora!!!"*

## 1. A ideia: todo cubo mágico é um sólido cortado por planos

- **Um motor só desenha todos.** Um quebra-cabeça é uma forma (cubo, tetraedro, octaedro, dodecaedro), os eixos de giro (pelas faces, pelos vértices ou pelas arestas) e a distância dos cortes ao centro. As peças são os pedaços que sobram.
- **As peças são de plástico de verdade:** cada uma é arredondada (as quinas macias de um cubo de verdade), com folga entre elas e adesivos de cantos redondos. Tudo calculado, nenhum modelo 3D baixado.
- **Os vinte do catálogo:**
  - os cubos, do 2×2×2 ao 7×7×7 (e qualquer tamanho até 12×12×12);
  - as pirâmides: Pyraminx e Master Pyraminx;
  - os octaedros: Skewb Diamond e FTO;
  - os dodecaedros: Megaminx, Gigaminx e Pyraminx Crystal;
  - os que giram pelos cantos: Skewb, Dino Cube e Helicopter Cube;
  - as formas que mudam: Mirror Blocks, Fisher Cube, Pyramorphix e Master Pyramorphix.
- **Conferido:** as peças batem com as de verdade (26 no 3×3, 62 no Megaminx, 42 no FTO, 12 no Dino…).

## 2. As cinco páginas

- **A capa:** o cubo chega se resolvendo sozinho (uma vez, na chegada) e depois é de quem chegou. Arrastar uma peça gira a camada dela; arrastar o fundo gira a vista; o teclado também gira. Depois de embaralhar, ele conta os giros e dá uma volta quando a pessoa resolve. Embaixo: três números com fonte, as quatro portas e a notícia do FTO.
- **Os cubos:** os vinte em cima (a vitrine), o escolhido embaixo (a mesa), com a história, quem fez, as posições, as peças e como é feito. O endereço guarda a escolha (`cubos#p=megaminx`).
- **Algoritmos:** a notação (um cubo que obedece às letras), os dois passos (16 algoritmos), as 57 OLL e as 21 PLL. Cada desenho é montado pelo próprio motor; cada caso abre numa folha do lado, com o cubo tocando o algoritmo giro por giro.
- **Aulas:** o método das camadas em oito passos, da margarida às quinas viradas. Cada passo chega com uma demonstração, com o resto das peças em cinza.
- **Loja:** em preparação. O que vai ter (para aprender, competir e colecionar) e como se escolhe um cubo.

## 3. Os fatos têm fonte

- Os textos de cada quebra-cabeça vêm da Wikipedia, da Jaap’s Puzzle Page, do Twisty Puzzles, do Smithsonian e da WCA. Ficou de fora o que não foi conferido.
- **A notícia mais importante para a loja:** em 24/jun/2026 a WCA anunciou que **o FTO vira modalidade oficial em 2 de janeiro de 2027** (média de 5), a primeira nova desde o Skewb, em 2014. O Clock sai depois do Mundial de 2027.
- As posições do N×N×N são contas exatas do próprio site, e batem com as fontes até o 7×7×7.
- As OLL e PLL são as principais do SpeedCubeDB, conferidas pelo motor: cada uma mantém as duas camadas de baixo e cai num caso diferente (57 e 21).

## 4. O design

- Papel e tinta; a cor vem dos próprios cubos. Gabarito para ver, Newsreader para ler, as duas no próprio site.
- Botões em pílula, os de sinal em círculo; o explorador (os botões em cima, o escolhido embaixo); as grades com cartões da mesma altura; o caso abre numa folha do lado.
- Nenhuma frase de como usar a tela. Os efeitos só aparecem quando a pessoa age, e a página parada não gasta a placa de vídeo.
- Claro e escuro; conferido no computador e no celular, com a placa de vídeo do Mac.

## 5. A publicação

- **Commit** `d184099`, num repositório novo e só local: `~/www/cubos`.
- **Ainda não está no ar:** a publicação na Vercel (projeto novo "cubos", equipe vitordes-projects) parou numa trava de permissão desta sessão. Depende de um "pode publicar".
- **Para ver agora, no Mac:** dois cliques em `~/www/cubos/abrir.command`.

## Onde está

- `~/www/cubos/LEIA-ME.md`: o mapa do projeto, onde mudar cada coisa e as referências para estudar as interfaces.
- `js/dados/`: o catálogo, os algoritmos e as aulas (mudar aqui, não no motor).
- `js/motor/`: o motor (geometria, giros, notação, WebGPU, gestos).
- `npm run verificar`: confere as peças, a notação, as OLL, as PLL, as aulas e as contas.
- O nome "Cubos" é provisório.

---
[[0 Índice|Índice]] · ← [[119 — O Atlas num explorador, a Nota no site e a conta com o Google|119]]
