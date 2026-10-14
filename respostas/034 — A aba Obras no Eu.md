# 34 · A aba Obras no Eu
#eu #colecao #caderno

> Seção original no PERFIL.md: 11. A vitrine de Obras (22/set/2026, tarde/noite — "acho que não foi feito o que eu pedi")

**34. Aba "Obras" no Eu — lê o acervo pessoal de verdade.** O dono voltou insatisfeito: "Números do caderno" (item 25/numeros) só mostrava contagem de arquivos e palavras por pasta (`x.obras`, de `lib/perfil.mjs`), sem dar pra **ler** nada — e ele já tem "muito estruturado" em `Logboard/# Profile/# Work`: Manifestos, Pesquisas (inclui **Arte e Ativismo**), Crítica, Filosofia, o Livro (romance em andamento, "O Último Comerciante de Quartzo" etc.), Poemas, Música, Roteiros, Design, Arquitetura, Pintura — 149 arquivos, ~27 mil palavras, **nenhum com cabeçalho `---`** (são rascunhos crus, sem `visibilidade:`, tratados como privados por padrão).

- **`lib/obras.mjs` (novo):** indexador dedicado, mais simples que `lib/biblioteca.mjs` (sem hierarquia, sem código, sem casamento de estudos — não se aplica aqui). Anda a árvore de `Logboard/# Profile/# Work` (respeitando o mesmo `PROIBIDO` de sempre), limpa nomes de pasta (`"a.a Manifestos (6)"` → `"Manifestos"`), agrupa por categoria (pasta de topo) e projeto (subpastas no meio, juntas com `›`), com memo de 5 min igual ao resto do app.
- **Rota `/api/obras`** em `servir.mjs`: manda tudo de uma vez (categorias com as peças, corpo incluído) — o acervo inteiro pesa ~160 KB, não precisa de busca sob demanda por peça como a Biblioteca.
- **`eu.js`/`eu.html`:** nova aba **Obras** (entre Domínio e Feitos). Cards por categoria (cor por hash do nome, como as estantes), agrupados por projeto quando existe subpasta, cada peça um `<details>` que abre e renderiza o markdown fiel (mesmo `MD.render` de sempre) — sem limpar nem "consertar" o texto dele, nem os erros de digitação da escrita crua.
- Manifestos e Pesquisas (com Ativismo dentro) vêm **primeiro** na ordem das categorias, a pedido explícito.
- **Testado:** `node` importando `obterObras()` direto contra o vault real (149 peças, 10 categorias não-vazias conferidas); em Edge headless (cópia temporária da pasta no vault de teste, apagada depois do teste) — abre a aba, expande uma peça (o manifesto "Texto", conferido palavra por palavra contra o arquivo original), sem erro de console, sem rolagem horizontal em 1440 px e 390 px.
- **Em aberto:** isto é v1 — lê e mostra, não edita (diferente de Feitos/Vida/Documentos, que gravam de volta no `.md`); a numeros() ("Números do caderno") continua com a contagem antiga (`lib/perfil.mjs`), agora meio redundante com a aba Obras — decidir depois se uma aponta pra outra ou se uma delas sai; nenhuma peça tem `visibilidade: publico`, então nada disso vai pro site exportado ainda (certo, considerando que é material cru).

---
[[0 Índice|Índice]] · ← [[033+ — Domínio virou também uma aba do Eu|033+]] · [[035 — As abas do Eu deixavam a página no meio|035]] →
