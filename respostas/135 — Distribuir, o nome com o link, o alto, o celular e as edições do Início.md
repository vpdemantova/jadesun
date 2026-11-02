# 135 · Distribuir, o nome com o link, o alto, o celular e as edições do Início
#pedido-grande #design #menus #celular #home #historico #doar #creditos #correcao #dois-computadores #espera-voce

> **Espera você:** dois cliques em `jadesun/publicar-montagne.bat` e aprovar o login da Vercel no navegador

## O pedido (01/nov/2026)

> *"no portal soalr, ao inves de doar, coloque Distribuir*
>
> *e ao inves de Vitor de Mantova, coloque Vitor Demantova, ja com o link do meu site, vitordemantova.com*
>
> *coloque um historico no final de cada parte da home, porque ela sempre muda, pra ficar salvo os artigos passados, ja que vamos mudar e atualizar, com um historico dos textos e do que ja foi mais imporante, pra gente ver o progresso, e forma criativo e bem implementada!*
>
> *o ajustes em cima nao fica legal no menu, precisa sero utra coisa mias imporante, e a navegacao pro mobile esta sendo cortada, e nao ta bonita nem entendivel..!"*

## O que eu fiz

- **Distribuir (PS-89):** a página Doar se chama Distribuir em tudo o que se lê: o título, o menu, o Índice, a linha dos créditos, a página dos créditos, o aviso, o Início e o botão de cada organização ("Distribuir ↗ site"). Digitar "distribuir" fora de um campo também abre a página (o "doar" continua valendo). O endereço continua `doar.html`, e o "Selo Doar" fica: é o nome da certificadora.
- **Vitor Demantova, com o link (PS-90):** na linha da obra no fim de cada página ("uma obra de Vitor Demantova", com o link para vitordemantova.com), nos créditos (o nome grande leva ao site), na assinatura da utopia no Início, no Manifesto, na Curadoria e na Luz. No caderno, nos quatro arquivos que o Portal lê: A Revolução Ontológica e o Manifesto (com o link), o post da Curadoria e a ficha de Atlantis (esta sem o link, porque a exportação tira do site público toda ficha que contém "vitordemantova").
- **O alto (PS-92):** no lugar dos Ajustes, à direita, está o **Distribuir**: uma pílula, espelho da busca do outro lado (e cheia quando se está na página dela). Os Ajustes não sumiram: estão na linha dos créditos, no fim de cada página, no pé do índice "Nesta página" (telas largas) e no Índice (o Quadrado). Junto, a data do alto, que subia por causa de uma linha vazia, voltou ao eixo.
- **O celular (PS-93):** embaixo havia três camadas soltas e translúcidas (os dois botões, o risco e as portas), com o texto da página vazando por trás, e as portas espremidas até "Manif…" e "Curad…". Agora é uma faixa só, sólida, de borda a borda:
  - o **puxador** no alto (um toque fecha e abre; ao descer a página ela se recolhe e fica só ele, no pé);
  - a linha **Páginas · Lugares · Nesta página**, com o nome curto em cima, o de agora embaixo e a cruz nas pontas (perto da bola do meio, pareciam "+ ● +");
  - as **portas com o nome inteiro**: o Quadrado repetido saiu de baixo (ele mora no alto, no centro), e um fio separa o mundo de você. No computador dele, a porta em que se está aparece sempre (no Manifesto, ela faltava).
  - No alto, as pílulas Buscar e Distribuir com ar dentro (uma regra de 27/out deixava 4 px e o texto encostava na borda).
  - De quebra: o céu desenhado da página Distribuir passava 8 px da tela, e os botões de domínio comprido passavam do cartão; os dois cabem agora (e era isso que interrompia a transição ao entrar nela).
- **As edições do Início (PS-91):** o histórico de cada parte da home.
  - **No fim de cada parte, o fio das edições:** uma conta por edição num fio fino, a de agora cheia (o mesmo desenho do fio da volta, ●, que já guarda por onde se passou). Uma edição é a parte como ela estava num dia.
  - **A folha de folhear:** a conta abre a régua das edições (com a hora quando há duas no mesmo dia); ‹ ›, as setas do teclado e o deslizar do dedo folheiam. Cada edição mostra a data, a leva em que mudou (o nome do commit, com o registro), **o que entrou e o que saiu** e o texto de então, **riscado o que saiu e sublinhado o que entrou**, como um manuscrito revisado. Uma caixa desliga as marcas, para ler limpo.
  - **"A casa inteira":** todas as partes, dia a dia, num fio vertical, cada dia com o que entrou e saiu: o progresso da casa num lugar só.
  - **O que já foi mais importante:** em Como está o mundo (que é o "O que importa agora"), a folha diz isso no alto; cada edição guarda as colunas e as fontes daquele dia.
  - **A Terra agora** não tem texto: a folha dela mostra a Terra no minuto de cada edição da casa (o dia, a noite, o Sol a pino e a Lua daquele instante) e quais partes mudaram nele.
  - **O seu dia** (só no seu computador) vem do caderno: o próximo passo de cada pasta em foco, uma edição por commit do Grande Plano (hoje há uma; cresce a cada commit do caderno).
  - **De onde veio o passado:** do git do jadesun e do caderno, 19 edições desde 9/out. Em 28/out, um commit de outra janela partiu da versão de 19/out e, pela data, parecia um retrocesso; o gerador segue a linha principal (na junção de 31/out, o lado que estava no ar), e o que veio do outro lado entra na data da junção.
  - **Daqui em diante, sozinho:** cada exportação (e o `publicar-montagne.bat`) e cada vez que o Portal abre (`hoje.bat`) guardam uma edição nova das partes que mudaram. Nada se apaga. À mão: `node guardar-edicoes.mjs "a nota"`.
  - As frases da primeira tela moram agora em `inicio-dados.js` (para mudar uma, mude lá).

## Conferido

- Clique de verdade (mouse no computador, toque no celular) em 1440, 1180, 390 e 360 px, no site exportado: o Distribuir do alto leva à página e fica marcado; os Ajustes abrem pela linha dos créditos e pelo pé do índice; Páginas, Nesta página e Lugares abrem; o puxador fecha e abre; nada coberto por outra coisa; nada rola para o lado; sem erro no console.
- As 26 páginas públicas em 360 px: nenhuma passa da tela, nenhuma porta fora.
- Auditoria de cor (Início, Manifesto, Distribuir, Créditos, Curadoria, Luz), nos estilos Almanaque e Casa e nas cinco cores: 0 texto abaixo do contraste, 0 cor fora do tom.
- As edições, ao vivo (porta 4322) e no site exportado (4331), no computador (mouse) e no celular (toque): um fio em cada parte (8 no computador, 7 no público, sem O seu dia), a folha abre na última edição, ‹ e a seta voltam, o dedo avança, A casa inteira, Como está o mundo, a Terra do minuto, o Esc fecha; nos temas preto, papel e branco; sem erro no console.
- Cópia de antes em `dados/versao-2026-11-01-antes-do-distribuir-e-historico/`.

## A junção com o Mac (01/nov, à noite)

> *"publique agora! resolva os merges!"*

- **O número:** neste dia, os dois computadores escreveram um registro 133. O do Mac (os dois computadores numa história só) já estava no GitHub, com o 134 (o Scriptorium Studio). Este, que nasceu 133, passou a ser o 135. O índice e os rodapés foram refeitos pelo `indice-respostas.mjs`, e o TAREFAS e os cabeçalhos do código acompanham o número novo.
- **O jadesun:** o trabalho deste computador e os três commits do Mac (o `juntar-tudo`, o 133 e o 134) estão juntos no GitHub.
- **O caderno:** uma junção começada em 28/out tinha parado no CentroPlus, onde os dois computadores escreveram depois da mesma entrada. Ficaram as duas partes, em ordem de data, sem perder uma linha. Depois entraram os três commits do Mac de 30/out a 01/nov, sem conflito, e o caderno também está no GitHub.
- **O site:** exportado de novo, conferido (todas as páginas em 360 px, as edições no computador e no celular) e montado para a Vercel. O código do login esperou dez minutos e expirou: a publicação espera o seu clique.

## O que espera você

- **Publicar:** dois cliques em `jadesun/publicar-montagne.bat`. Ele exporta (um minuto), pede o login da Vercel no navegador, você aprova, e publica. Vai junto o que já esperava: a Montanha de Jade, a Teia, o Índice das ferramentas e as Boas-vindas.
- **O lugar do Ajustes:** escolhi o Distribuir para o alto porque foi o seu primeiro pedido e é a ação do Portal (as causas primeiro). Se preferir outra coisa ali, é uma linha em `perfil.js` (`botaoDistribuir`).

---
[[0 Índice|Índice]] · ← [[134 — O Scriptorium Studio e a prancha do folio|134]] · [[136 — O índice dos índices|136]] →
