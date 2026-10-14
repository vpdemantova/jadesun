# 55 · O botão de ajuda e os andares de verdade
#estante #ajuda

> Seção original no PERFIL.md: 23. Botão de ajuda, e "Minha Estante" ganhou andar de verdade (26/set/2026, manhã, rodada 2)

**55. Ele voltou pedindo dois ajustes concretos dentro de uma mensagem bem mais pesada emocionalmente** ("faça um botão que explique como usar tudo"; "na Minha Estante, que eu possa criar manualmente as divisões e ela se remodele com vários andares e seções, igual a de casa"). No meio da mensagem tinha a mesma visão grande de sempre (unificar tudo numa plataforma, publicar como rede social/ativismo) — **e ele mesmo pediu pra eu não tomar as rédeas sozinho nisso**, então virou semente no `CentroPlus.md` de novo, não código. Só as duas partes concretas foram construídas:

- **Botão "?" na barra, abre um guia dentro da Estante** (mesmo painel deslizante de sempre) explicando: como andar/segurar um livro, como adicionar, como os chips de Status/Prioridade/Físico-digital funcionam (toca, lápis renomeia, "+novo" cria), como o progresso de leitura funciona, o que Ambiente/Móvel fazem — e a seção mais importante, explicando o truque de numeração do item abaixo.
- **"Minha Estante" ganhou andar de verdade — não só um "modo de agrupar" a mais.** Antes, "Minha Estante" empacotava as seções do jeito automático de sempre (só quebra linha quando o espaço acaba) — ele pediu andares de verdade, controlados por ele. Agora: se o nome da seção começa com um número ("1 Romances", "1 Poesia", "2 Espiritualidade"), esse número vira o **andar**, e a prateleira **sempre** quebra linha quando o andar muda — mesmo que coubesse tudo na mesma linha. Duas seções com o mesmo número (ex. "1 Romances" e "1 Poesia") caem juntas no mesmo andar, uma do lado da outra, com uma divisória e etiqueta entre elas — exatamente como duas seções dividindo uma prateleira física de madeira. Sem número, o livro cai num andar "solto" no fim, empacotado automaticamente. `analisarSecao()`, novo em `estante3d.js`.
- **Bug real achado e corrigido no próprio teste, antes de reportar como pronto:** a primeira versão só forçava quebra de linha ao *entrar* num andar numerado, mas não ao *sair* dele de volta pro grupo "sem seção" — resultado: o andar 2 (só a Senhora, teste) engolia os 79 livros sem seção logo atrás, virando uma linha só, contagem errada ("2 andares" em vez de 3). Corrigido comparando os dois lados da troca (`linha.andarForcado !== item.andarForcado`, contando null como lado também), não só um lado.
- **Testado em Edge headless, de ponta a ponta, sem confiar só na tela:** marquei 3 livros reais via API direto (`1 Romances`, `1 Poesia`, `2 Espiritualidade`), conferi no arquivo que salvou certo, troquei pro modo "Minha Estante" e conferi a POSIÇÃO Y de cada mesh 3D (não só a contagem): os dois do andar 1 ficaram na mesma altura (mesma linha), o do andar 2 numa altura bem diferente, contagem final "82 livros · 3 andares" — bate exatamente com o esperado (andar 1 + andar 2 + o andar solto dos outros 79). O botão de ajuda abre, mostra o texto certo (inclusive a explicação do truque do número), e fecha com X ou Esc.

---
[[0 Índice|Índice]] · ← [[054 — Móveis de estante e a Minha Estante|054]] · [[056 — A estante não está com andares|056]] →

---
[[0 Índice|Índice]] · ← [[054 — Móveis de estante e a Minha Estante|054]] · [[056 — A estante não está com andares|056]] →
