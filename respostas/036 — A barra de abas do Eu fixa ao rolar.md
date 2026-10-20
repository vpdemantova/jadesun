# 36 · A barra de abas do Eu fixa ao rolar
#eu #menus #correcao

> Seção original no PERFIL.md: 12. Navegação consertada, e conteúdo antes da pergunta (22/set/2026, mesma noite)

**36. A barra de abas do Eu (Perfil/Domínio/Obras/…) não ficava fixa ao rolar — corrigido.** Primeira tentativa (`position: sticky` na `<nav>` de dentro do `<header>`) não funcionou: o `<header>` é curto, então a barra "descolava" assim que o cabeçalho passava — sticky só funciona enquanto o PAI do elemento ainda está na tela. Mudei a `<nav class="eu-nav">` pra fora do `<header class="eu-topo">`, direto dentro do `.miolo` (que é alto, a página inteira) — agora ela gruda embaixo da barra global (`top: var(--topo)`, 60px) e fica visível o tempo todo, em qualquer aba, por mais que role. Isto era o principal motivo do "não me acho": rolando pra ler o Domínio ou a Obras, não tinha como voltar sem rolar tudo de volta manualmente.

---
[[0 Índice|Índice]] · ← [[035 — As abas do Eu deixavam a página no meio|035]] · [[037 — O card de estudo, a Essência antes das Perguntas|037]] →
