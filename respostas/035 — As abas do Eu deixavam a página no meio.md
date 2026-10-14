# 35 · As abas do Eu deixavam a página no meio
#eu #menus #correcao

> Seção original no PERFIL.md: 12. Navegação consertada, e conteúdo antes da pergunta (22/set/2026, mesma noite)

O dono voltou de novo, mais forte: *"os botões e a navegação está péssima, em todos os sentidos, não me acho, não consigo entender"*, mais um pedido antigo que eu não tinha aplicado: *"pedi pra informação vir antes da pergunta nos cards"*. Fui atrás dos dois, achei bugs de verdade (não só "gosto"):

**35. Bug real: trocar de aba no Eu deixava a página no meio, sem barra nenhuma.** Os links `#numeros`/`#domino`/`#obras`/etc eram âncoras comuns — o navegador saltava pro elemento nativamente ANTES do JS (`hashchange` → `Movimento.topo()`) conseguir zerar a rolagem, numa corrida que o salto nativo várias vezes vencia, prendendo a página a meio caminho, com a barra de cima fora da tela. Corrigido: cliques em qualquer link `#aba` dentro do miolo agora usam `history.pushState` (nunca deixa o navegador saltar sozinho) e forçam a rolagem pro topo de forma síncrona. Também faltava destacar qual aba está aberta (`aria-current="page"` já existia no HTML, mas sem nenhum CSS) — adicionado.

---
[[0 Índice|Índice]] · ← [[034 — A aba Obras no Eu|034]] · [[036 — A barra de abas do Eu fixa ao rolar|036]] →

---
[[0 Índice|Índice]] · ← [[034 — A aba Obras no Eu|034]] · [[036 — A barra de abas do Eu fixa ao rolar|036]] →
