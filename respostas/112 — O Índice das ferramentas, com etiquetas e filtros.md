# 112 · O Índice das ferramentas, com etiquetas e filtros
#pedido-grande #atlas #indice #celular #espera-voce

> **Espera você:** abrir o `hoje.bat` e olhar Atlas › Curadoria › **Ferramentas** (no computador e no celular); aprovar as facetas (o P1 do plano) e dizer se publica (o P5). Nada foi para o git nem para a Vercel.

**"preciso que seja feito um index no portal solar de todos os apps de i.a. e ferramentas pra desenvolvimento e aprendizado, e plataformas em geral, sem i.a., sabe aquele negócio de tags e filtros, esse é o melhor jeito de navegar porque você pode ver muito e mudar muito rapidamente e dinamicamente e visualizar tudo e abrir o que interessa..! me ajude a ampliar essa ideia!"** (27/out/2026)

## O que foi feito

- **A ideia ampliada** (o plano): `blessednotebook/Logboard/# Board/Focos/O Índice — Plano.md`. Um índice é uma mesa: tudo à vista, e as etiquetas tiram o que não serve. Sete qualidades (ver muito, filtrar em um toque, mudar de vista, abrir, guardar e mandar, descobrir, confiar) e nove coleções onde a mesma página cabe (cursos, livros, museus, espécies, causas, o Hall da Fama, os 11 mil favoritos do Chrome, as empreitadas).
- **A lista:** `2 Academy/3 Atlas…/0 Coleções/Ferramentas e Plataformas.md`, 120 ferramentas em 13 áreas (41 com IA, 79 sem). Os links foram conferidos por robô: 104 abriram, 15 barram robôs (o site existe), o Midjourney não respondeu a tempo.
- **A página:** `ferramentas.html` (Atlas › Curadoria › Ferramentas; no menu Tudo, Ctrl+K). Busca (tecla /), seis facetas com a contagem (Área, Para quê, IA, Preço, Onde, Nível; dentro de uma faceta as etiquetas somam, entre facetas apertam, e as que não trazem nada se apagam), três vistas (grade de fichas da mesma altura, lista, tabela que se ordena pelo cabeçalho), o Ao acaso e o endereço que guarda os filtros (`ferramentas.html#ia=sim&preco=gratis`: mandar o link é mandar a busca pronta). No celular, os filtros começam recolhidos.
- **O motor:** `catalogo.js` + `catalogo.css`, configurado por `ferramentas.js`. Chama-se Catálogo porque "Índice" já é o menu (a tecla M). Uma coleção nova é outra folha de configuração.
- **De quebra:** no celular de 390 px a barra do alto (a contagem e os Ajustes) passava 12 px da tela em todas as páginas, e a página encolhia; agora cabe (`casca.css`).

## Como foi conferido

- `node testes/catalogo.mjs 4322`: 25 conferências com o mouse de verdade (o teste rola, mira no meio do botão e confere que nada está por cima), no computador e no celular; console sem erro.
- `node testes/cores-auditoria.mjs 4322 ferramentas`, no Almanaque e na Casa: 0 texto abaixo do contraste nas cinco cores.
- Cópia de antes: `dados/versao-2026-10-27-antes-do-indice/`.

## O que vem depois

- **P4:** os Museus e as Causas do Doar no mesmo motor.
- **P5 (seu):** publicar. É pôr `ferramentas` (e os scripts `catalogo`, `ferramentas`) nas listas do `exportar.mjs` e a lista do Atlas como pública.
