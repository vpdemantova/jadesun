# 70 · Repaginar tudo para não parecer feito por IA
#design

70. **"Veja tudo que podemos aprimorar e ajustar… repagine TODA a interface, para não parecer um a.i. slop. Amplie as referências, veja todos do Awwwards e FWA e crie um sistema de design de ponta" (08/out/2026).**

- **O diagnóstico:** o acabamento padrão (o "Casa") tinha cartões brancos arredondados com sombra, vidro, brilho radial dourado, pílulas em tudo e um fio colorido no topo de cada cartão. É o visual genérico de interface feita por IA.
- **A pesquisa:**
  - li os Sites of the Year do Awwwards (2017–2025) e os Typography Honors (2023–2026) e fotografei, no Chrome sem janela, os premiados e as referências que mais se parecem com o Jadesun: Poor Charlie's Almanack (Stripe Press), Cooper Hewitt, FWA, Linear, teenage engineering, The Pudding, MONOLOG, Lifeworld, Are.na, Rijksmuseum e Persepolis Reimagined;
  - o que eles têm em comum: grade visível em fios, tipografia em escala extrema, números protagonistas, metadado em mono, uma cor de sinal, nada de vidro e de sombra.
- **O sistema "Almanaque":** `almanaque.css`, um acabamento novo que passa a ser o padrão.
  - Papel `#EDEBE4`, tinta `#121211` e um sinal, o vermelho `#D9411E` (no escuro, papel `#0E0E0D` e sinal `#FF6B3D`).
  - Três vozes, com as fontes que já existiam: Newsreader para ler, Archivo estreita (62%) para números e Archivo para a interface, JetBrains Mono para metadados.
  - Espaço de 4 em 4, folha de 1 320 px com margens desenhadas, blocos separados por fios e grades de cartões viradas grades de fios.
  - A barra de cima vira um cabeçalho numerado, e a de baixo, no celular, uma régua.
  - 293 raios dos CSS de página passaram a usar `var(--raio…)`, que no Almanaque vale 0 e nos outros acabamentos guarda o valor de antes.
- **Ajustes de comportamento** (pequenos, e valem para todos os acabamentos):
  - o Agora ganhou uma manchete (a data, "faltam N dias", o que fazer agora); a saudação saiu do cartão do jardim;
  - o leitor de Markdown marca o emoji do começo dos títulos (`.md-emo`), e o Almanaque o esconde, sem tocar no caderno;
  - o índice da Biblioteca respeita a mesma marca.
- **A página viva:** `sistema.html` (princípios, cor, tipo, espaço, componentes, "o que não fazer", como voltar), também no menu Tudo e na exportação. **A documentação:** `SISTEMA.md` (pesquisa com links, arquitetura dos CSS, página por página e a lista do que ainda melhorar).
- **Para voltar atrás:** Personalizar → Acabamento: Casa ou Simples; o Clássico também continua. As preferências passaram para `v: 3`, e quem estava no Casa (o padrão antigo) migra uma vez para o Almanaque. A cópia de antes está em `dados/versao-2026-10-08-antes-do-almanaque/` (39 arquivos).
- **Testado** (Chrome sem janela; as cenas 3D com WebGL em software):
  - 17 páginas, a 1 440 e a 390 px, no claro e no escuro, sem erro de console nem rolagem lateral. Só o Jardim no computador estourou a espera "rede parada" do teste, por ser animação contínua; aberto sem essa espera, carregou sem erro;
  - o teste funcional das nove áreas (18 combinações) passou de novo, e a impressão continua em A4 (História, 4 páginas);
  - Personalizar, Meu dia e o menu Tudo foram conferidos;
  - Casa, Simples, Clássico e a migração abrem sem erro.
- **Ainda não feito** (está no `SISTEMA.md`, seção 7): fontes guardadas no próprio computador, ícones próprios, decidir o vidro das cenas 3D, o Álbum e o Protetor fora do sistema, impressão em toda página, uma busca só e o teste de fumaça dentro do repositório. **E nada foi commitado nem enviado.**

---
[[0 Índice|Índice]] · ← [[069 — Mapa, museu, horizonte e práticas de cada área|069]] · [[071 — Ficou péssimo, o Almanaque recusado|071]] →

---
[[0 Índice|Índice]] · ← [[069 — Mapa, museu, horizonte e práticas de cada área|069]] · [[071 — Ficou péssimo, o Almanaque recusado|071]] →
