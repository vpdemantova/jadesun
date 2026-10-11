# 53 · A Estante ligada ao Atlas
#estante #atlas #fichas

> Seção original no PERFIL.md: 21. Estante ligada ao Atlas — só onde é verdade (26/set/2026, madrugada, rodada 3)

**53. Pedido enorme, respondido em duas partes — uma construída, uma registrada como semente.** *"vamos integrar com o Atlas e linkar com todos os autores e períodos e temas e áreas, e alavancar todas as editoras por país! ... assim descobrimos com uma grande lista todos os títulos do mundo, um pouco por dia."*

- **O que construí — o recorte real e finito:** cada um dos 47 livros catalogados agora é conferido contra as ~167 fichas de Pessoa já existentes no Atlas (`lib/biblioteca.mjs`'s `obterIndice()`, reaproveitado, não reinventado). Quando o autor do livro bate com o título de uma ficha real — testando "Sobrenome, Nome" e "Nome Sobrenome", os dois formatos que aparecem no catálogo — o livro ganha um link "Ver [Autor] no Atlas →" no painel, e o resumo de progresso mostra "N de 47 autores já ligados". **6 autores bateram de verdade:** Machado de Assis, Dante Alighieri, García Márquez, Marcel Proust, Platão (ficha existe como "Plato", grafia inglesa) e Arnold Schoenberg (ficha como "Arnold Schönberg") — os dois últimos entraram numa pequena lista de aliases conferidos à mão (`ALIAS_ATLAS` em `lib/livros.mjs`), não um chute automático de nomes parecidos.
- **O que eu NÃO fiz, e por quê está escrito no `CentroPlus.md` (26/set), não no código:** "todas as editoras do mundo por país, por relevância" e "todos os títulos do mundo" não têm fonte real pra eu consultar e conferir — qualquer lista assim hoje seria número inventado fingindo ser dado, exatamente o oposto do "fonte de verdade, não chute" que está escrito no topo de [[Arrumar os Livros]]. É a mesma visão grande da "Estante Global" que já tinha virado semente em 25/set, só que crescendo — registrada de novo, maior, ainda esperando a conversa dedicada de depois do vestibular.
- **Testado com o catálogo real:** os 6 links aparecem certos (autor, id, texto) no painel; a contagem "7 de 47" (6 autores, García Márquez com 2 livros) bate no resumo de progresso; zero erros de console.

---
[[0 Índice|Índice]] · ← [[052 — A ficha técnica dos livros e o dock flutuante|052]] · [[054 — Móveis de estante e a Minha Estante|054]] →
