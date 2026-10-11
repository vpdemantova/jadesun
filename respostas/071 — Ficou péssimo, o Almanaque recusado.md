# 71 · Ficou péssimo: o Almanaque recusado
#design #erro-meu

71. **"Ficou péssimo o design! 100 vezes pior que antes… que brega, menu sem pegada. Mais referências, mais artigos… pesquise história do design, tipografia, e mais… aja como um profissional… faça melhor que agora e melhor que antes, pra ficar final" (08/out/2026).**

- **O diagnóstico do Almanaque (item 70):** a etiqueta em caixa-alta e monoespaçada em cima de cada título é um dos tiques mais reconhecíveis de interface feita por IA; o itálico decorativo e os colchetes imitavam uma referência sem ter a razão dela; tudo cinza e fino, sem cor em massa e sem nada que fosse do Jadesun; o menu era uma lista numerada sem peso.
- **A pesquisa:** Lina Bo Bardi (os cavaletes de cristal do MASP), Burle Marx (cor em massa), Alexandre Wollner e a poesia concreta (grade e palavra), Vignelli (poucas fontes, escala com contraste), Tschichold (composição assimétrica), Bringhurst (medida de leitura), Albers (a cor é relativa), Igloo Inc (Site of the Year 2024, interface sobre cena), artigos sobre "AI slop" e sobre menus premiados. Links no `SISTEMA.md`, seção 3.
- **O sistema "Solar":** `solar.css` e `solar.js`, um acabamento novo que passa a ser o padrão.
  - **O céu de agora:** o tom do topo de cada página vem da altura real do sol sobre Campinas, com o motor e a paleta do Jardim 3D, atualizado a cada minuto.
  - **O arco do sol no Agora:** um instrumento com o horizonte, as horas, o caminho do nascer ao poente e onde o sol está; a leitura ("17:50 · sol a 4° / o sol se põe em 20 min") fica num canto onde a curva nunca passa. À noite o caminho abaixa e aparece a Lua, com a fase vista daqui. Para ver outras horas: `hoje.html?hora=06:30`.
  - **Cor:** papel `#F3EFE6`, cavalete `#FFFDF9`, tinta `#14201B`, jade `#1B5A44` (em massa: a capa do estudo do momento, o próximo passo, o botão principal) e sol `#E9822A` (o agora). No escuro, o jade de preencher e o de texto são dois tokens.
  - **Tipo:** Gabarito (geométrica brasileira, feita para uma plataforma de estudos) para mostrar, Newsreader para ler; nada de letra de máquina fora do código.
  - **Menu:** marca nova (quadrado de jade e sol), quatro destinos com a barra de sol embaixo da página atual, o campo "Buscar em tudo" visível, e o anel dos dias até a prova.
  - **Superfícies:** cavaletes opacos de 12 px; uma superfície por conteúdo (tirei as caixas dentro de caixas do Agora e da linha do tempo).
- **A página viva** `sistema.html` e o **`SISTEMA.md`** foram reescritos para o Solar.
- **Para voltar atrás:** Personalizar → Acabamento: Almanaque, Casa ou Simples; o Clássico também continua. As preferências passaram para `v: 4`, e quem estava no Casa ou no Almanaque migra uma vez para o Solar. A cópia de antes do dia está em `dados/versao-2026-10-08-antes-do-almanaque/`.
- **Testado** (Chrome sem janela): as páginas a 1 440 e a 390 px, no claro e no escuro, sem erro de console nem rolagem lateral; o arco às 04:30, 06:30, 12:10, 17:50 e 22:00, no computador e no celular; o teste das nove áreas (18 combinações) e a impressão (História, 4 páginas A4); Personalizar, Meu dia e o menu Tudo; os cinco acabamentos e as migrações de `v: 2` e `v: 3`; os 56 arquivos JS passam no `node --check`.
- **Ainda não feito** (`SISTEMA.md`, seção 7): fontes guardadas no próprio computador, ícones próprios, o painel das cenas 3D em jade, Álbum e Protetor. **E nada foi commitado nem enviado.**

---
[[0 Índice|Índice]] · ← [[070 — Repaginar tudo para não parecer feito por IA|070]] · [[072 — Quase, botões, protetor de tela e o Atlas como casa|072]] →
