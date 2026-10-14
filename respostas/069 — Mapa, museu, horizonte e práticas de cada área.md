# 69 · Mapa, museu, horizonte e práticas de cada área
#estudo #museus

69. **"Mapas visuais completos de cada área, um museu de cada área, a expansão para o mercado, a academia e o estudo aprofundado, e práticas holísticas e concretas" (08/out/2026).** Pedido em duas mensagens. Na segunda, ele disse para fazer as nove matérias de uma vez, sem parar num protótipo para pedir licença.

*Escopo registrado antes de construir:*

1. **Mapa da área** — interativo e completo, um por matéria. Liga os conceitos e mostra relações, hierarquia (unidade → estudo → conceitos), pré-requisitos e o caminho de estudo. Tem também uma versão limpa, legível e imprimível para copiar no papel. **Sai dos dados que já existem:** os 129 estudos da Seleção (os elos `←` `→` `↔`, o "Pré-requisito/Abre", a seção "O que se estuda" e as conexões entre matérias) e o Checklist (o progresso). Não é escrito à mão.
2. **Museu da área** — obras, objetos, pessoas, lugares e exemplos concretos, cada peça com onde está e o estudo a que se liga. Arquivo novo no caderno, mais a galeria de imagens que os estudos já têm, com crédito.
3. **Horizonte da área**, no fim — profissões e mercado, caminhos acadêmicos, estudo aprofundado e pontes com outras áreas. Arquivo novo; as leituras acadêmicas e o "mundo real" dos estudos entram por elo, sem cópia.
4. **Práticas** — holísticas, concretas e progressivas (relacionar → aplicar → fazer no mundo), com instruções e com resposta ou critério de correção. A marca "feita" é gravada no próprio arquivo do caderno. Os exercícios com gabarito que já existem nos estudos entram por elo.
5. **Sem duplicar** a Tábua e as Grandes Obras: os painéis atuais ficam onde estão e passam a ser etapas do mesmo percurso.

*Critérios de conclusão:*

- as nove matérias do Checklist têm os quatro módulos, abertos a partir do Domino e de uma página própria da área;
- o mapa funciona com mouse, teclado e toque, a 390 px, no claro e no escuro; a versão para papel imprime em A4 e também pode ser baixada;
- todo fato escrito à mão foi conferido ou ficou marcado "a conferir", e nenhuma lacuna foi preenchida com invenção;
- o progresso vem do Checklist e das práticas marcadas, e a página diz qual é o próximo passo;
- a exportação estática (`exportar.mjs`) leva tudo;
- `node --check` passa e o fluxo foi testado num navegador sem janela, nas nove matérias.

*Feito em 08/out/2026 (mesma janela):*

- **Dados:** `lib/areas.mjs`. O mapa sai dos estudos: pré-requisitos, conceitos, pontes, nível, caminho de estudo, progresso pelo Checklist e próximo passo. O Museu e o Horizonte são lidos com o leitor da Tábua; as Práticas, com `lerPraticas`; e `marcarPratica` grava `*Feita:*` no arquivo, com cópia em `dados/`.
  - Rotas: `GET /api/areas` (`?m=` para uma área só, `?resumo=1` para o Domino), `POST /api/areas/pratica` e `GET /api/areas/auditoria`.
  - Exportação: `api/area/<matéria>.json` e `api/areas-resumo.json`; no site estático, as práticas ficam só para leitura.
- **Componente independente de rota:** `area.js`, chamado como `Area.montar(el, { materia, rotas, aoMudar, topo, ids })`, que devolve `ir`, `selecionar`, `irPratica` e `destruir`.
  - `area.html` é só a casca que lê `?m=` e `#n=`.
  - `domino-mais.js` ganhou `DominoMais.rotas` (ficha e área), o leitor de abas `DominoMais.abas` e a faixa "percurso" em cada matéria do Domino.
- **Navegação modular:** os 7 módulos se recolhem e se alargam um a um, em dois arranjos, "corrido" e "lado a lado" (este a partir de 1 100 px). O arranjo fica guardado no navegador.
- **Lentes do estudo:** Resumo, Texto corrido (o próprio estudo, que é a fonte) e Papel.
- **Papel:** a vista Papel, a impressão (folha A4 deitada com o desenho, depois o texto para copiar) e os botões "Baixar texto" (.md) e "Baixar desenho" (.svg).
- **Conteúdo no caderno:** `2 Academy/3 Atlas…/0 Áreas/`, com 27 arquivos (Museu, Horizonte e Práticas das 9 matérias), o leia-me "0 Como estas páginas funcionam", a "Auditoria das áreas" (gerada com `node auditar-areas.mjs`) e a "Proposta — Navegação das áreas".
  - Os fatos menos conhecidos do museu foram conferidos na web: o benzeno de Faraday, os rascunhos de Mendeleiev, o sal do Rio Grande do Norte, os sorteios da Mega-Sena e o Museu das Favelas.
  - O resto foi escrito de memória, com o aviso "a conferir" onde cabia.
- **Navegação:** ícone `rede` em `tema.js`, família `area: 'eu'` em `perfil.js` e as 9 áreas no menu Tudo.
- **Testado** em Chrome sem janela, porta 4337, com o caderno real (só se gravou e desfez uma prática):
  - nas 9 áreas, a 1 440 e a 390 px: os nós batem com a API; setas, museu, práticas, horizonte, Tábua e Obras aparecem; as três lentes funcionam; recolher e lado a lado funcionam; não há rolagem lateral nem erro de console;
  - os links `#n=`, `#museu` e `#p-…` funcionam;
  - marcar e desmarcar uma prática grava no arquivo;
  - a impressão sai em PDF A4 (Química, 3 páginas; História, 4);
  - os downloads saem em .md e .svg;
  - o Domino mostra 9 faixas de percurso.

*O que ainda falta (decisões suas e limites conhecidos):*

- Escolher a navegação (A, B ou C) e o esquema de rotas: está tudo na "Proposta — Navegação das áreas". Nada foi remodelado.
- Revisar as categorias canônicas e os aliases e as 13 duplicidades da auditoria. Nada foi renomeado nem movido; as 13 entradas que eu tinha tirado foram restauradas com o texto e o lugar originais, por pedido seu.
- 15 estudos não têm item no Checklist, e o progresso deles não é medido: veja a auditoria.
- No arranjo lado a lado, com o mapa recolhido, sobra um vão na grade. É um acerto visual secundário.
- A exportação estática foi ligada, mas não rodou nesta janela (o `sharp` não está instalado neste Mac).
- Esta cópia do Jadesun no Mac (`~/www/jadesun`) estava só com o `.git`. Fiz o checkout de `origin/main` e trabalhei aqui. **Nada foi commitado nem enviado**: antes de abrir o `D:\www\jadesun` no Windows, é preciso commitar e enviar daqui e puxar lá.

---
[[0 Índice|Índice]] · ← [[068 — Museus e fundações da humanidade|068]] · [[070 — Repaginar tudo para não parecer feito por IA|070]] →

---
[[0 Índice|Índice]] · ← [[068 — Museus e fundações da humanidade|068]] · [[070 — Repaginar tudo para não parecer feito por IA|070]] →
