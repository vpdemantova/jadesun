# 56 · A estante não está com andares
#estante #correcao

> Seção original no PERFIL.md: 23. Botão de ajuda, e "Minha Estante" ganhou andar de verdade (26/set/2026, manhã, rodada 2)

**56. Ele voltou logo depois: *"a estante não está com andares!!"*** — fui direto no vault real (só leitura, servidor numa porta separada, nada de escrever) pra ver com os próprios olhos o que ele via. Achado: **"Minha Estante" estava vazia** — zero dos 82 livros tinham qualquer seção atribuída ainda, então caía tudo no balde "ainda sem seção", 1 andar só. O item 55 funcionava, só que exigia abrir livro por livro pra atribuir seção — pra 82 livros, isso é uma tarde inteira, não um clique. Bug de UX real, não bug de código.

- **Corrigido com um atalho em massa, não com mais instrução:** botão novo "Atribuir 'Minha Estante' a estes N" na barra — filtra pelas tags que já existem (ex. toca em "espiritualidade") e o botão atribui a seção pra **todos os livros filtrados de uma vez**, não um por um. Nova rota `POST /api/livros/atribuir-secao` (`atribuirSecao()` em `lib/livros.mjs`) faz uma leitura+escrita só no arquivo pra N livros, em vez de N chamadas separadas.
- **A dica da barra muda sozinha** quando ele está no modo "Minha Estante": em vez do texto genérico, mostra "filtre por tag e toque em 'Atribuir' pra organizar rápido, sem abrir livro por livro".
- **Testado com o catálogo real (82 livros), de ponta a ponta:** filtrei pela tag "espiritualidade" (o botão mostrou "...a estes 19", batendo exato com a contagem da pilha que eu mesmo escrevi em [[Arrumar os Livros]]); toquei "Atribuir", digitei "1 Espiritualidade"; conferi no arquivo que os 19 certos (e só eles) ganharam a seção; troquei pro modo "Minha Estante" e vi, de verdade, dois andares separados na tela — um com os 19 livros de espiritualidade, rotulado, e outro com o resto. Com isso, ele consegue montar a estante inteira em ~6 toques (um por pilha: Romances, Espiritualidade, Filosofia, Música, Consulta, Quadrinhos — as mesmas pilhas que já tinham sido calculadas e escritas no arquivo), em vez de 82.

---
[[0 Índice|Índice]] · ← [[055 — O botão de ajuda e os andares de verdade|055]] · [[057 — O Atribuir bagunçou a Estante|057]] →
