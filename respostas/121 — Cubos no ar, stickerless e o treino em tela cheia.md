# 121 · Cubos no ar: stickerless e o treino em tela cheia
#cubos #webgpu #publicacao #stickerless #treino #cronometro #tela-cheia #melhorias #projetos-especiais #loja

**O pedido de 26/out/2026:**

> *"pode publicar! preciso também uma opção de cubos stickerless! e um modo tela cheia imersivo pra quem não tem cubo usar isso pra treinar! e uma lista de várias melhorias pra esse site (eu já tenho muitas!) e possíveis outros projetos especiais!"*

## 1. No ar

- **<https://cubos-five.vercel.app>**, na Vercel (projeto `cubos`, equipe vitordes-projects).
- Publicado duas vezes: a versão do registro 120 logo no começo, e esta (commit `b06cc4f`) no fim, conferida no endereço de verdade.
- O repositório ainda é só deste Mac (`~/www/cubos`); levá-lo ao GitHub é o primeiro item da lista (CB-60).

## 2. Stickerless

- **O corpo tem três escolhas: Preto, Branco e Stickerless.** Ficam na página dos cubos (embaixo do cubo) e na folha do treino; a escolha vale para o site inteiro e fica guardada no navegador.
- **No stickerless, o próprio plástico é colorido.** Cada ponto da peça toma a cor da face em volta da qual ele foi arredondado: a face plana e a quina macia que sai dela. Onde duas cores da mesma peça se encontram, a divisa fica no meio da curva; para dentro, a cor para no meio da quina e os vãos entre as peças ficam escuros, como no plástico de verdade. Vale para os vinte, do 2×2 ao Gigaminx.
- **As miniaturas acompanham:** cada quebra-cabeça foi fotografado nos três corpos, e a vitrine troca as fotos junto.
- **De brinde:** o Mirror Blocks, que é de metal, refletia só o chão escuro e ficava preto dos lados; agora reflete um chão claro e é prateado inteiro.

## 3. O treino em tela cheia

- **Uma página nova, `treino`, e a porta "Treino" no menu de todas as páginas.** A capa e a mesa de cada quebra-cabeça ganharam o botão "Treinar".
- **A sala escura:** o embaralhamento em cima, o cubo no meio (ocupando o meio inteiro), o tempo embaixo. Enquanto o tempo corre, o resto se apaga: ficam o cubo, o tempo e o botão de parar.
- **Como no cubo virtual do csTimer:** o espaço embaralha; o tempo começa no primeiro giro (virar o cubo inteiro não conta) e para quando ele se resolve; Esc desiste. Mostra os giros e os giros por segundo, o melhor, a média de 5 e a de 12 (tirando o melhor e o pior, como a WCA).
- **O teclado é o do csTimer**, conferido no código dele: as duas mãos no meio do teclado (I e K giram a direita, J e F a de cima, D e E a esquerda…). Na folha do treino, um desenho do teclado mostra o giro de cada tecla, e a tecla acende quando é apertada.
- **No celular, o dedo:** arrastar uma peça gira a camada (e começa o tempo); arrastar o fundo gira a vista. A tela não apaga no meio do treino.
- **Os casos:** no 3×3, "O que treinar" tem também **OLL** e **PLL**: aparece um caso ao acaso (com o amarelo em cima e a de cima girada ao acaso); resolvido, o site diz qual era e o algoritmo.
- **Os 20 quebra-cabeças** treinam; os que ainda não têm notação (o Megaminx, por exemplo) são embaralhados com giros sorteados e giram com o dedo.
- **Tela cheia de verdade** no computador e no Android (o botão dos quatro cantos). No iPhone, a página já ocupa a tela, e **salva na tela de início abre sem a barra do navegador**, com um ícone próprio (o 3×3 stickerless na sala escura).
- **Os tempos ficam no navegador**, separados por quebra-cabeça e por modo; podem ser apagados um a um ou todos.
- **Conferido:** no Chrome com a placa de vídeo do Mac, embaralhado e resolvido pelo teclado (o tempo parou sozinho), Esc, a OLL resolvida e reconhecida; no celular, o dedo começando o tempo e a troca do plástico; e no endereço no ar. `npm run verificar` agora confere também cada tecla do teclado contra a notação, as médias e o tempo escrito.

## 4. As melhorias

A lista viva, com o tamanho de cada uma e os detalhes, está em `~/www/cubos/TAREFAS.md`. Cada item tem um número (CB-…) para as suas ideias entrarem do lado.

**A ordem que eu seguiria:** CB-60 (o GitHub) · CB-10 (o embaralhamento da WCA) · CB-11 e CB-13 (a inspeção e a reconstrução) · CB-12 (escolher os casos) · CB-50 e CB-54 (o Inmetro e a lista de espera, antes de comprar estoque).

- **O treino:** CB-10 embaralhamento de estado aleatório (o da WCA) · CB-11 a inspeção de 15 s, +2 e DNF · CB-12 escolher os casos da OLL e da PLL, e os que demoram voltam mais · CB-13 a reconstrução de cada tempo, fase por fase · CB-14 a dica no meio do caso · CB-15 a notação do Megaminx · CB-16 o 8×8 até o 12×12 · CB-17 levar e trazer os tempos (e ler os do csTimer) · CB-18 sem internet · CB-19 gestos de deslizar no celular · CB-20 o som do plástico · CB-21 o modo cego.
- **O motor e o desenho:** CB-25 a sombra nos vãos · CB-26 mais acabamentos (o miolo colorido, o fosco, o esquema japonês) · CB-27 mais quebra-cabeças da mesma regra (Kilominx, Teraminx, Master Skewb, Redi Cube, os cuboides) · CB-28 o logotipo no centro · CB-29 exportar imagem e vídeo de um algoritmo · CB-30 o celular fraco · CB-31 cores para daltonismo · CB-32 o Mirror Blocks e o Fisher com a notação do 3×3.
- **Algoritmos e aulas:** CB-35 o F2L, COLL e ZBLL · CB-36 aulas de 2×2, Pyraminx, Skewb, Megaminx e 4×4 · CB-37 aulas de métodos (CFOP, Roux, ZZ, cego) · CB-38 a aula que espera a pessoa fazer o passo · CB-39 reconhecer o caso · CB-40 o resolvedor · CB-41 a notação de cada um em desenho.
- **Conteúdo e comunidade:** CB-44 as competições no Brasil · CB-45 os recordes · CB-46 a história do cubo no Brasil · CB-47 o glossário · CB-48 o site em inglês.
- **A loja:** CB-50 o Inmetro e a importação · CB-51 os fornecedores e as amostras · CB-52 cada produto com o 3D de verdade (preto, branco e stickerless como variantes) · CB-53 qual comprar · CB-54 a lista de espera · CB-55 pagamento e entrega (ou começar pelo Mercado Livre e pela Shopee) · CB-56 o FTO à venda antes de 2/1/2027.
- **A técnica:** CB-60 o GitHub · CB-61 o domínio · CB-62 endereços de verdade para cada quebra-cabeça · CB-63 as fotos de conferência automáticas · CB-64 contar as visitas sem rastrear · CB-65 leitores de tela.

## 5. Os projetos especiais

- **CB-80 O laboratório de quebra-cabeças:** escolher a forma, os eixos e arrastar a profundidade dos cortes, e um quebra-cabeça novo nasce e gira. A ideia do site virada brinquedo.
- **CB-81 O cubo inteligente:** os cubos com Bluetooth (GAN, MoYu, QiYi, GoCube) ligados ao site; o da tela gira junto com o da mão. Para a loja, o site vira o aplicativo do cubo que ela vende. (Chrome e Android; o iPhone não tem Bluetooth na web.)
- **CB-82 O mosaico:** uma foto vira um mosaico de cubos, com o passo a passo de cada um; e o kit na loja.
- **CB-83 A câmera lê o cubo** e mostra a solução.
- **CB-84 A batalha:** o mesmo embaralhamento, duas pessoas, ao mesmo tempo.
- **CB-85 O cubo na escola:** um material de matemática para professores.
- **CB-86 A galeria dos padrões** (o superflip, o tabuleiro de xadrez) e vídeos curtos feitos com o motor, para as redes da loja.
- **CB-87 As peças para imprimir** em 3D, saídas do laboratório.
- **CB-88 O estudo de caso:** a história do desenho deste site, em português e em inglês, para o portfólio.

## Onde está

- `~/www/cubos/treino.html`, `css/treino.css`, `js/paginas/treino.js`: o treino.
- `~/www/cubos/js/motor/cronometro.js`: o teclado do csTimer, as médias, o tempo escrito.
- `~/www/cubos/js/motor/sombreador.wgsl.js` (a função `tinta`): o plástico colorido.
- `~/www/cubos/TAREFAS.md`: a lista viva.
- O teclado, conferido em: [csTimer, `src/js/twisty/twistynnn.js`](https://github.com/cs0x7f/cstimer/blob/master/src/js/twisty/twistynnn.js).

---
[[0 Índice|Índice]] · ← [[120 — Cubos, o site dos cubos mágicos em WebGPU|120]]
