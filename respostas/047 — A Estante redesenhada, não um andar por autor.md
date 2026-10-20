# 47 · A Estante redesenhada: não um andar por autor
#estante #3d #correcao

> Seção original no PERFIL.md: 16. A Estante em 3D (26/set/2026)

**47. A prateleira estava com um andar por autor — 46 andares pra 47 livros. Redesenhada do zero.** Ele voltou bravo, com razão: *"tá bem ruim! nenhuma estante tem mais de 20 andares.. precisamos de lateralidade.. mais ordem e esperteza"*. O item 45 abria uma linha nova da prateleira a cada grupo (autor/tema/status) — com quase todo autor tendo só 1 livro, isso virava uma torre de 46 andares, cada um quase vazio. Errado desde o desenho, não só um ajuste fino.

- **Empacotamento de verdade:** a lista inteira (já ordenada por autor/tema/status + título) agora é **uma sequência só**, e a prateleira quebra linha apenas quando o espaço da linha atual acaba — nunca por causa de troca de grupo. Resultado real, testado com os 47 livros do catálogo: **1 andar só** (a largura da prateleira, 4,6 unidades, cabe todos lado a lado). Com um catálogo bem maior, o número de andares cresce proporcional à quantidade de *livros*, não à quantidade de autores — do jeito que qualquer estante de verdade funciona.
- **Onde a troca de grupo acontecia (era uma linha nova inteira), agora é só uma marcação discreta:** um divisor fino (tipo um encosto de livro de verdade) mais uma etiqueta pequena — sem quebrar a linha, sem tomar o espaço todo. Como cada lombada já mostra o nome do autor embaixo do título, a etiqueta principal virou reforço, não a única pista.
- **Câmera trocada de "girar" pra "andar ao lado":** antes, arrastar girava a câmera num arco pequeno (±0,9 rad) ao redor da origem — não dava pra ver uma prateleira larga de verdade. Agora arrastar na horizontal **translada** a câmera ao longo da largura da prateleira inteira (a "lateralidade" pedida), e arrastar na vertical sobe/desce entre andares — os dois com limites calculados a partir da largura/altura real da prateleira montada, não fixos.
- **A rotação do livro ao ser seguro ficou mais simples também:** como a câmera não gira mais (só translada), o ângulo pra virar a capa pra ela deixou de depender de `camCfg.azim` (que não existe mais) e virou uma constante — menos uma variável acoplada, menos chance de o próximo ajuste quebrar de novo.
- **Testado em Edge headless:** com os 47 livros reais do catálogo, contagem confirmada em "1 andar" (era 46); arrastar na horizontal move a câmera de ponta a ponta da prateleira, revelando livros diferentes e a parede lateral no limite; segurar um livro ainda vira a capa certa pra câmera (reconferido depois da mudança na fórmula de rotação); zero erros de console em todos os testes.
- **Em aberto:** as etiquetas de grupo (autor/tema) ficam pequenas e podem ficar difíceis de ler de longe quando há muitas trocas de grupo seguidas (catálogo com poucos livros por autor, como o dele hoje) — se incomodar, dá pra aumentar só a etiqueta sem voltar a quebrar linha.

---
[[0 Índice|Índice]] · ← [[046 — A Estante, tela cheia, botão próprio e edição ao vivo|046]] · [[048 — O Eu no celular de 390 px|048]] →
