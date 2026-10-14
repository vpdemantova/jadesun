# 65 · O Fichário: a primeira carta
#fichas #estudo

**65. "E agora?" → ele escolheu começar o Fichário agora, mesmo com a recomendação de estudar (03/out/2026). Fase F1: a primeira carta.**

- **Página nova `carta.html?nome=<ficha>`** (ou `?id=`), com `carta.js` e `carta.css`, e a rota `GET /api/carta` em `lib/cartas.mjs`. Na página: "Uma carta" (com marcas de corte), "Folha A4 com 9" (grade 3 × 3 de folha de fichário), "Imprimir em tamanho real" e um campo para ver outra ficha. Não está no menu: abre pelo endereço (ou pelo Tudo, numa próxima rodada).
- **A carta mede 63 × 88 mm de verdade** (CSS em mm, cantos de 3 mm). Tem cores próprias, iguais no claro e no escuro, porque é papel, com a cor da borda pela área (música roxo, letras, ciência, filosofia, pintura, história, natureza, lugar). Na impressão, só a folha aparece (`@page A4, margin 0`).
- **Tudo vem da ficha**, nada inventado:
  - tipo e área;
  - nome e retrato (com silhueta "ainda sem imagem no Atlas" quando falta);
  - dados por tipo (pessoa: anos, origem, ofício; instrumento: família; lugar, elemento, obra, espécie);
  - **feitos**: até 2 obras do Atlas cujo `compositor`, `autor`, `artista` ou `pintor` traz o sobrenome (com `y` = `i`, para Tchaikovsky/Tchaikovski);
  - **elos**: até 3 de `chegam`, `mencoes` e `saem`, sem Coleções, Tábuas e índices numerados;
  - **frase**: o 1º parágrafo da ficha, sem parênteses, links e notas, cortado em cerca de 130 caracteres;
  - **crédito** da imagem, limpo da marcação do Commons;
  - **número na coleção**, lido de `0 Coleções/*.md` (`tipo: coleção`, linhas `- 007 · [[…]]`; Bach = MÚS 007/151).
- **Testado** (Edge headless, porta 4337, caderno real só para leitura):
  - Bach: 2 feitos reais (*Cravo Bem Temperado*, *Goldberg*), crédito de Haussmann, 007/151;
  - Mozart (*Don Giovanni*, *Flauta Mágica*), Pachelbel (silhueta), Violino (instrumento), Darwin (feito: *A Origem das Espécies*, sem coleção), Tchaikovski;
  - a carta medida a 63,00 × 88,00 mm na tela e na impressão;
  - `Page.printToPDF`: uma página A4 em cada modo; na folha de 9, as cartas vão de 10,5 a 199,5 mm na largura e de 16,5 a 280,5 mm na altura;
  - escuro; celular a 390 px sem rolagem lateral.
- **Falta a prova dele:** imprimir em A4, escala 100%, recortar e pôr no protetor de 66 × 91 mm.
- **Fica para depois:** entrar no menu Tudo e na exportação estática; F2 (os outros formatos: tarô, deitada, mini). Cópia de antes: `dados/versao-2026-10-03-antes-da-carta/`.

---
[[0 Índice|Índice]] · ← [[064 — O Domínio, o módulo de expandir das áreas|064]] · [[066 — Um ícone de cor e forma para cada área|066]] →

---
[[0 Índice|Índice]] · ← [[064 — O Domínio, o módulo de expandir das áreas|064]] · [[066 — Um ícone de cor e forma para cada área|066]] →
