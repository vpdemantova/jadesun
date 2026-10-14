# 52 · A ficha técnica dos livros e o dock flutuante
#estante #menus

> Seção original no PERFIL.md: 20. Ficha técnica dos livros, e o menu virou um dock flutuante sempre embaixo e ao centro (26/set/2026, madrugada, rodada 2)

**52. Dois pedidos em CAIXA ALTA, sinal de pressa/cansaço — respondidos com calma mesmo assim.** *"adicionar formato, tamanho, material, medidas, físico ou digital, tipo do scan, dados comerciais... o menu sempre deve ficar no canto inferior da tela e ao centro! no responsivo ele deve sempre mostrar todos os botões! remodele as outras navegações pra empilharem em cima do menu!"*

- **Ficha técnica do livro:** mais 7 colunas na tabela (Formato, Tamanho, Material, Medidas, Físico ou digital, Tipo do scan, Dados comerciais) — mesmo truque de sempre, só no cabeçalho, sem tocar nas linhas antigas. Ficam num `<details>` recolhido dentro do formulário ("Ficha técnica — formato, tamanho, material...") pra não pesar o formulário do dia a dia, e aparecem no painel do livro só quando preenchidas (sem poluir livro que ainda não tem esse dado).
- **Achado um bug real ao mexer nisso:** `corpoDoLivro()` (usada pelo toque rápido de status/prioridade e pelo progresso) não incluía os campos antigos de prioridade/página — se alguém tocasse um chip de status DEPOIS de preencher a ficha técnica, a gravação ia reescrever a linha inteira e apagar tudo isso sem querer. Corrigido antes de virar problema de verdade: `corpoDoLivro()` agora sempre manda a linha inteira, todos os campos.
- **O menu virou um dock flutuante:** a barra de baixo do celular (que já era uma grade fixa de 5 colunas, mas só usava 4 — a Estante nunca tinha entrado nela) agora: (1) mostra as 5 (ganhou um ícone novo, uma estante de livros) — nunca mais falta botão; (2) não é mais uma barra grudada de ponta a ponta na borda — é uma pílula flutuante, centralizada, com uma margem embaixo, sombra e cantos arredondados — testado até 340 px de largura sem cortar nenhum botão; (3) ganhou `z-index` mais alto que qualquer página em tela cheia (Jardim, Estante) — fica sempre por cima, nunca escondido atrás de um painel.
- **As folhas que sobem de baixo na Estante (livro, formulário, progresso) foram reposicionadas pra nascerem ACIMA do dock**, não atrás dele — é a "empilhar em cima do menu" pedida: o dock com Agora/Jardim/Atlas/Eu/Estante continua sempre alcançável, mesmo com um livro aberto ocupando a metade de baixo da tela.
- **Testado em Edge headless:** dock aparece completo (5 botões) em 390 px e em 340 px (o mais estreito que testei), em `hoje.html` e `eu.html`; na Estante, abrir um livro no celular mostra o painel flutuando por cima do dock, com o dock continuando clicável; preencher a ficha técnica de um livro (formato/tamanho/material/medidas/físico ou digital/dados comerciais), salvar, fechar e reabrir mostra tudo certo no painel; zero erros de console.
- **Escopo que fica pra depois, se ele pedir:** "remodele TODAS as outras navegações" e "remodele a grid" — só mexi no que tinha um problema concreto e testável (o dock e as folhas da Estante). Não toquei no `.eu-nav` (abas Perfil/Domínio/Obras...) nem nos chips da Coleção, que já foram ajustados numa rodada anterior (itens 46/48) e não têm o mesmo problema de "empilhar sobre o menu" (rolam com a página, não competem com o dock fixo). Se ele apontar uma tela específica que ainda incomoda, é pra testar e ajustar do mesmo jeito.

---
[[0 Índice|Índice]] · ← [[051 — Status, progresso de leitura e ambientes|051]] · [[053 — A Estante ligada ao Atlas|053]] →

---
[[0 Índice|Índice]] · ← [[051 — Status, progresso de leitura e ambientes|051]] · [[053 — A Estante ligada ao Atlas|053]] →
