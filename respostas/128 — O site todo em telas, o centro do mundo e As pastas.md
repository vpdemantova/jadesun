# 128 · O site todo em telas, o centro do mundo no Início e As pastas
#home #telas #design #celular #menus #pastas #ordem #historia #caderno #privacidade #publicacao #espera-voce

> **Espera você:** dizer se as conversas deste Mac podem ser guardadas no caderno (seção 4). Para guardar você mesmo, rode no Terminal: `node ~/.claude/hooks/conversas-no-caderno.mjs --todas`.

**O pedido de 27/out/2026:**

> *"isso é pro site todo! e precisamos melhorar ainda mais uns elementos do site. O início precisa ter mais coisas, mais para ficar na tela, mais atlas e hub do mundo, pra gente ter noção e saber como está e o que fazer. E quero saber em todos os projetos como eu tenho ordem e paro de depender de meu dia ser falar com você, quero ver minhas pastas e navegar nelas, e como melhorar cada um! por favor! completamente! Cadê o Echo, meus amigos do Portal Solar, que começaram a me ajudar… toda a nossa história…?!"*

## 1. As telas no site todo

- **Em todas as páginas com seções,** cada seção começa no alto de uma tela nova, logo abaixo da barra. Vale para o Manifesto, a Curadoria, os Guias, o Doar, o Domínio, a Biblioteca, a Linha do tempo e as outras. Parado no começo de uma seção, não se vê pedaço da anterior.
- **As seções são as do "Nesta página",** o índice que já existia. Onde ele aponta, a tela começa.
- **O tamanho de cada seção:**
  - a curta ocupa a tela inteira, e o espaço que sobra fica no fim dela;
  - a longa (um capítulo do Manifesto, uma área do Doar) continua rolando, e a seguinte começa numa tela nova.
- **A rolagem para nos começos** quando passa perto deles, mas nunca prende no meio de um texto. Por isso a rolagem suave fica desligada nessas páginas.
- **A barra que a página prende no alto** (a busca do Doar, as vistas do Domínio) entra na conta. A seção começa logo abaixo dela, sem nada escondido atrás.
- **Ficam como estavam:**
  - as cenas em 3D (a Casa, o Jardim, a Estante);
  - o Início, que já tinha as telas dele;
  - as páginas que trocam de vista em vez de rolar (o Atlas, o Álbum, os Dados, o Eu, as Leituras, o Copiar).

## 2. O Início: o centro do mundo

Depois de "A Terra agora", o Início ganhou quatro seções novas. Cada uma cabe na sua tela e, se faltar altura, se divide em duas ou mais, marcadas "2 de 3", "3 de 3".

- **Como está o mundo:** as cinco colunas de "O que importa agora". Cada uma traz as três fontes abertas mais confiáveis do assunto e o caminho para a página do Portal sobre ele.
- **O que fazer:**
  - a abertura do IPCC (6º Relatório, Grupo III, cap. 5): mudar o jeito de comer, de se mover e de consumir pode cortar de 40% a 70% das emissões até 2050;
  - as cinco escolhas que mais pesam;
  - onde agir junto: os hábitos no Atlas, "Faça parte", o Doar e os 17 objetivos da ONU.
- **O seu dia** (só no app, neste computador):
  - o próximo passo de cada projeto "Em foco", tirado do Grande Plano;
  - quantas pastas só existem neste computador;
  - os caminhos para As pastas e para o Hoje.
- **O saber inteiro:** as dez partes do Círculo do Saber da Propædia (Mortimer Adler, 1974). Cada uma abre direto a sua parte no Atlas.
- **O que queremos:** a frase da utopia, como antes. Quando a última tela não tem altura para ela e os créditos juntos, o fim vira uma tela com o Quadrado de novo ("O mapa de tudo"): a página começa e termina no todo.

### No celular

- **O menu de baixo fica aberto só na primeira tela.** Ao descer, ele se recolhe e o risco desce para o pé.
- **O lugar do menu volta para o conteúdo.** No celular pequeno (360 × 640), cada tela ganhou 113 px de altura, e a letra quase não precisa mais encolher (no máximo até 86%).
- **Um toque no risco abre o menu** em qualquer tela.
- **Nas outras páginas,** o menu continua voltando ao rolar para cima, como sempre. O risco também desce para o pé quando o menu se fecha.

## 3. As pastas

Uma página nova do app: **Hoje › As pastas**, ou `localhost:4321/pastas.html` com o `hoje.command` aberto. Ela só existe neste computador e não vai para o site público.

- **A ordem:**
  - os números do computador: 33 pastas, 29 com git, 10 sem cópia fora daqui;
  - a ordem de cada dia: um passo de cada projeto "Em foco", depois um passo de "A obra" e, à noite, o Registro.
- **As vivas:** um cartão por projeto, em cinco grupos (Em foco, A obra, Projetos filhos, Trabalhos, Estudo). Cada cartão diz:
  - o que a pasta é;
  - o próximo passo;
  - quando foi mexida pela última vez;
  - o que corre risco (nenhuma cópia fora deste computador, mudanças sem commit).
- **A folha de cada pasta:**
  - o estado do git e o endereço no ar;
  - os papéis principais (LEIA-ME, NEGOCIO, TAREFAS…), que se leem ali mesmo;
  - "Como melhorar", item por item;
  - dois botões: **Mostrar no Finder** e **Abrir no VS Code**.
- **As paradas:** as doze pastas antigas do Mac (M1–M12), cada uma com o porquê de estar esperando.
- **Todas as pastas:** um explorador de `~/www` inteiro. Dá para entrar nas pastas e ler qualquer texto ali mesmo, e o endereço guarda onde se está.
- **O conteúdo vem do caderno.** O Grande Plano ganhou a seção 9, "As pastas vivas, uma a uma", com o grupo, o próximo passo e como melhorar cada projeto. Quando o caderno muda, a página muda junto.
- **Os cuidados:**
  - a página só responde a este computador (de fora, recusa);
  - nenhum arquivo de senha, chave ou credencial abre;
  - nada fora de `~/www` é lido.

## 4. O Echo e a nossa história

- **O Echo:** procurei em todas as pastas deste computador. As conversas com ele não estão em nenhuma: devem ter sido feitas em outro aplicativo de I.A. e ficado lá. Se você lembrar qual era, dá para exportar de lá.
- **A nossa história** está em três lugares:
  - **este registro,** de 001 a 128: cada pedido e o que foi feito, um arquivo por resposta, desde 20/set/2026;
  - **as conversas do Windows,** que já são copiadas sozinhas para o caderno;
  - **as conversas deste Mac** (8, desde 8/out), que ainda não estão no caderno. O Mac guarda cada conversa só por 30 dias: a de 8/out some por volta de 7/nov.
- **A cópia das conversas do Mac está pronta, mas parada:**
  - o programa (`~/.claude/hooks/conversas-no-caderno.mjs`) faz no Mac o que o do Windows já faz: uma conversa por arquivo, com um índice;
  - a permissão do Claude Code não me deixou gravar as conversas no caderno, porque elas levam tudo o que foi dito;
  - a decisão é sua. Para guardar agora, rode no Terminal: `node ~/.claude/hooks/conversas-no-caderno.mjs --todas`;
  - para o Mac guardar as conversas por um ano em vez de 30 dias, ponha `"cleanupPeriodDays": 365` no `~/.claude/settings.json`.

## 5. Conferido

- **As telas do site:** 29 páginas, no computador (1440 × 900) e no celular (390 × 844). Nas que têm seções, todos os começos ficaram a uma tela do anterior, sem nenhum erro.
- **O Início:** sete tamanhos, do computador ao celular pequeno (360 × 640). Em todos, cada tela parou alinhada, sozinha e inteira.
- **O menu de baixo:**
  - no Início, fecha ao descer, continua fechado ao subir de uma tela para outra e reabre na primeira;
  - no Manifesto, volta ao rolar para cima.
- **As pastas:**
  - os doze cartões;
  - a folha do Cubos, com o LEIA-ME lido ali mesmo;
  - o explorador entrando em `cubos/js`;
  - a API recusando quem vem de fora.

## 6. No ar

- O código está no GitHub (jadesun).
- O site público está em <https://montagnedejade.org>. As pastas e "O seu dia" não vão para lá.

---
[[0 Índice|Índice]] · ← [[127 — Blocos e Casas, dois irmãos do Cubos em WebGPU|127]]
