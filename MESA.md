# Prompt: A Mesa, tudo o que é seu numa página só

> 02/nov/2026, registro 138. Este é o prompt completo para refazer a Mesa do Portal Solar exatamente como ela é: o que ela é, a frase, a herança, as letras, a régua, cada vista, os dados, o movimento, os gestos, o celular e a conferência. Foi escrito na mesma anatomia dos prompts de sites (o que é · mídia · letras · paleta · leiaute · dados · motor · gestos · celular · movimento reduzido · acessibilidade · conferência), com três coisas que eles não têm: **a frase** que organiza a obra, **a herança** de onde vem a forma e **a fonte** de cada técnica.
>
> O código: `mesa.html`, `mesa.css`, `mesa.js`, `mesa-formato.js`, `mesa-tecnicas.js`, `lib/mesa.mjs` (o servidor de casa), `testes/mesa.mjs`.

## O que é

Uma página só para a vida inteira de uma pessoa: o que fazer (Agora, Matriz, Dia, Semana, Mandala), o que se tem (Dinheiro, Roupas, Livros, Coleções) e o Guia das técnicas de ordem, tempo, hábito, equilíbrio, revisão, dinheiro e coisas, cada uma com a fonte. HTML, CSS e JavaScript sem framework, dentro da casca do Portal Solar (a barra de cima, os índices, a folha que sobe da direita).

- **A frase:** *O que importa, primeiro.*
- **A herança:** o discurso de Eisenhower em Evanston (19/ago/1954: "os urgentes não são importantes, e os importantes nunca são urgentes") e o *Quadrado Negro* de Malevich (1915), que já é a marca do Portal. A matriz de Eisenhower são quatro quadrados suprematistas: o mais escuro é o que mais pesa.
- **A regra da casa:** a interface é a instrução (nenhuma frase de "clique aqui"); efeito só no gesto; monocromático; botões em pílula ou círculo; o quadrado, que é a marca, tem canto vivo.

## Mídia

Nenhuma imagem. A Mesa é feita de letra, de tinta e de papel. As únicas formas desenhadas são CSS: o quadrado, a trama do Passar (`repeating-linear-gradient` a 135°), a linha tracejada do Soltar e o risco de pena.

## Letras

| Família | Uso |
|---|---|
| **Archivo** (`--f-display`, variável, 62–125 de largura) | tudo o que é interface: abas, botões, títulos das tarefas, números (`tabular-nums`), o título do quadrado (800, `font-stretch: 108%`) |
| **Newsreader** (`--f-texto`, variável, com itálico) | o que é texto: a frase do alto, as perguntas do Dia ("Que bem farei hoje?" escrita à mão numa linha), o próximo passo em itálico dentro do quadrado, as notas |

## Paleta e régua

Nada de cor própria: as cores vêm do tema do Portal (branco, preto, papel, floresta, azul-noite) por `--papel`, `--papel-2`, `--tinta`, `--suave`, `--fio`, `--linha`, `--linha-2`. A régua é a do `forma.css`: espaço de 4 em 4 (`--e-1…9`), alturas 32 · 40 · 48 (`--h-p/m/g`), tempos 120 · 200 · 320 · 480 ms (`--t-1…4`) e a curva `--curva`. Pílula = `border-radius: 999px`; o filtro tem classe própria (`.ms-chip`), porque o estilo Almanaque deixa o `.chip` de canto vivo.

## O leiaute, de cima para baixo

1. **O cabeçalho da página:** a etiqueta "Hoje · A Mesa" e a frase, em Newsreader, de 1,6 a 2,25 rem, com o fio do Portal embaixo. Pequeno de propósito: o trabalho começa na primeira tela.
2. **A linha de cima** (`#ms-linha`): um campo em pílula de 56 px, Archivo 500 a 1,19 rem, e o botão cheio "Pôr na mesa". O texto de dentro muda com a vista (é a única ajuda, e é exemplo, não instrução): no Dinheiro, "-35 mercado · +300 freela"; nos Livros, "título — autor". Enquanto se escreve, uma linha de selos mostra o que foi entendido (Fazer · A obra · prazo amanhã · 15 min).
3. **As abas** (`role="tablist"`): Agora · Matriz · Dia · Semana · Mandala | Dinheiro · Roupas · Livros · Coleções | Guia. Pílulas de 36 px; a escolhida cheia de tinta. O endereço guarda a vista e os filtros (`mesa.html#ver=matriz&area=obra`); no celular, a fileira rola para o lado.
4. **A vista escolhida**, embaixo (o explorador: os botões em cima, o escolhido embaixo).
5. **O pé:** onde está guardado ("No caderno: A Mesa.md · guardada às 21h40", ou "Neste aparelho") e Levar · Trazer.

### Agora: o quadrado negro

- Duas colunas: o quadrado (`min(560px, 58vh)`, `aspect-ratio: 1`, fundo `--tinta`, letra `--papel`) e, ao lado, os botões, os passos, o contexto e o "Depois".
- **Dentro do quadrado**, encostado embaixo: o porquê (Fazer · o sapo de hoje · prazo amanhã · A obra · 15 min), o título em Archivo 800 de 1,6 a 2,9 rem, o próximo passo em Newsreader itálico.
- **Os botões:** Feito (cheio) · 25 min · 5 min · Outra · Destravar · Pedir à I.A.
- **O contexto:** Tenho (5 min · 15 · 30 · 1 h · mais) · Energia (baixa · média · alta · tanto faz) · Onde (casa · computador · rua · telefone · qualquer). A escolha fica no aparelho.
- **A escolha da tarefa** (só entre Fazer, Marcar e Passar, e só as que cabem no contexto): Fazer 1000 · Marcar 500 · Passar 200; o sapo do dia +400; no plano do dia +250 − 15 por posição; prazo vencido +450, senão +160 − 12 por dia que falta; marcada para hoje +260; marcada para depois −300; passada a alguém −150; já começada +20.
- **O timer:** o quadrado vira papel com um contorno de tinta, e uma camada de tinta (`.ms-q-nivel`) desce de cima para baixo com `transform: scaleY(var(--resta))`, a cada quarto de segundo. A letra fica por cima com `mix-blend-mode: difference`: onde há tinta ela é papel, onde há papel ela é tinta, sem cálculo. Ao fim, dois tons curtos (880 e 660 Hz, Web Audio, criados no clique), uma vibração no celular e a folha "Feito · Mais 25 · Pausa de 5". O tempo vai para a tarefa (`foco N min`).

### Matriz: os quatro quadrados

- Uma grade de 28 px + 2 colunas × 2 linhas, com os eixos escritos: Urgente · Sem pressa em cima; Importante · Não importante na vertical. Altura `max(420px, 100vh − 500px)`: os quatro cabem numa tela, e cada lista rola por dentro.
- **Fazer:** quadrado cheio de tinta, letra de papel. **Marcar:** contorno de 2 px de tinta. **Passar:** a trama fina a 135°. **Soltar:** linha tracejada e letra suave, o branco sobre branco.
- Cada tarefa: a caixinha quadrada (22 px, cheia quando feita), o título em Archivo 600, a linha de dados (área · prazo · minutos · @lugar · para quem · passos) e a cruz que abre ali mesmo: o próximo passo, as notas, a fonte, os quatro destinos (Fazer, Marcar, Passar, Soltar) e Agora · No dia de hoje · Editar · Passos · Apagar.
- **Arrastar** (computador) leva de um quadrado a outro; o quadrado que recebe respira uma vez (`scale(1.006)`). No celular, quatro quadradinhos com o número de cada um ficam em cima, e o escolhido abre embaixo.
- **A Entrada** é uma linha só acima da matriz ("Entrada · 10 ✚ · Triagem"); a cruz abre a lista ali.
- **A promoção:** uma tarefa do Marcar com prazo a 3 dias ou menos sobe sozinha para o Fazer (é a ideia de Covey: o Marcar existe para o Fazer não encher). Uma vez por prazo: o que for posto de volta à mão fica onde foi posto.
- **Feito** risca o título com uma linha de 2 px que corre da esquerda para a direita em 0,42 s, e só então a tarefa sai.

### Dia

"Que bem farei hoje?" (Franklin) numa linha de escrever; **O plano** (Ivy Lee, seis em ordem, ou 1-3-5), com o sapo primeiro e a soma dos minutos, multiplicada por 1,5 pela lei de Hofstadter; os **hábitos de hoje** com a corrente de dias seguidos; os **prazos da semana**; e, à noite, "Que bem fiz hoje?" com **Fechar o dia**.

### Semana

A revisão do GTD em seis passos que abrem no lugar: esvaziar a Entrada · olhar o Fazer e o Marcar · os prazos de duas semanas · uma nota de 0 a 10 para cada área · três resultados para a semana (OKR) · o Soltar. Embaixo, **a tábua de Franklin**: os hábitos em sete colunas, segunda a domingo, um quadradinho por dia.

### Mandala

A malha 3 × 3 de Imaizumi: o centro (o objetivo, escrito ali mesmo) e as oito áreas em volta, no sentido do relógio a partir do canto de cima. A tinta de cada área cresce com a nota da semana (`color-mix` de 0 a 88% de tinta); com nota 6 ou mais a letra vira papel. A área aberta mostra as oito ações dela ("pôr na mesa" leva ao Marcar) e as tarefas abertas.

### Dinheiro

O mês, com ‹ ›; Entrou · Saiu · Sobra em números grandes; **os três envelopes** (50/30/20: essencial, livre, futuro), cada um com a barra contra o teto do mês; os lançamentos (o livro-caixa); os fixos (por mês ou por ano, com o vencimento); as metas, com Guardar (que também lança no futuro).

### Roupas, Livros, Coleções

- **Roupas:** cartões de altura igual; o tipo, a cor, os usos, a última vez, o custo por uso; "Vesti hoje"; os filtros A cápsula (contra 33, o Projeto 333), Paradas (90 dias, KonMari), Doar e cada tipo.
- **Livros:** Lendo · Quero ler · Tenho · Lido · Parei, com a contagem; a barra de páginas; a antibiblioteca (os que se tem e não se leu); "O próximo" tira um da pilha. No computador, os livros são os do catálogo do caderno (a mesma lista da Estante e das Leituras), e o que se marca volta para lá.
- **Coleções:** uma por armário, com Tenho · Quero · Troca.

### Guia

As técnicas, filtradas por família (O que fazer · O tempo · Destravar · Hábitos · Equilíbrio · Revisão · Dinheiro · As coisas) e pela busca. Cada uma abre no lugar: a ideia numa frase, onde ela mora na Mesa (com o botão que leva lá) e as fontes, abertas e conferidas.

## Os assistentes

| Assistente | De onde vem | O que faz |
|---|---|---|
| **Triagem** | GTD (David Allen) | uma coisa da Entrada de cada vez: pede ação? · leva menos de dois minutos? · é você quem faz? · importa? · tem prazo? · qual área? · o primeiro movimento; o quadrante sai das respostas |
| **Planejar o dia** | Ivy Lee (1918), a regra 1-3-5 | as candidatas em ordem de peso; seis no máximo (ou nove no 1-3-5); a primeira é o sapo |
| **Destravar** | a próxima ação física (GTD), o "se, então" (Gollwitzer) | o menor movimento do corpo, o quando, e cinco minutos de timer |
| **Pedir à I.A.** | — | um pedido pronto para colar no Claude, com a tarefa, a área, o centro, o prazo e as notas, terminando em "não faça por mim: explique, e eu faço" |
| **Fechar o dia** | Sêneca (*Da ira* III, 36), as perguntas de Franklin | as seis linhas do Registro (Pratiquei · Aprendi · Travei em · Achados · Gratidão · Amanhã); no computador, viram o Registro do dia no caderno |

## Os dados: um arquivo .md que se lê em qualquer editor

- **No computador**, a Mesa mora em `A Mesa.md`, achado pelo nome em qualquer pasta do caderno (nenhum caminho do caderno no código); se não existe, nasce ao lado das Tarefas Simples. A gravação é a do caderno de notas: atômica, com a cópia do dia, e nunca às cegas (se o arquivo mudou no Obsidian ou no outro computador, nada se grava e a Mesa pergunta qual fica). Ao voltar à aba, a Mesa relê o arquivo.
- **Fora do computador**, mora neste aparelho (`localStorage`), com Levar (baixa o mesmo `.md`) e Trazer.
- **O formato** (`mesa-formato.js`, o mesmo no navegador e no Node):
  - tarefas em listas, uma seção por quadrante (`## Entrada`, `## Fazer`, `## Marcar`, `## Passar`, `## Soltar`, `## Feitas`), uma linha por tarefa: `- [ ] título · prazo 14/11/2026 · #area · @lugar · 30 min · energia média · para Fulano · foco 25 min · criada 02/11/2026 ^t12`, e embaixo, recuados, `próximo:`, `nota:`, `fonte:` e os passos como caixas;
  - o resto em tabelas: as áreas (com as oito ações), o dia, os hábitos e as marcas, os registros, as semanas, o dinheiro (lançamentos, fixos, metas, grupos), as roupas, os livros, as coleções;
  - as colunas se acham pelo nome; uma linha ou uma seção que a Mesa não conhece volta no mesmo lugar; a caixa marcada no Obsidian vira "feita" e vai para as Feitas com `de fazer`.

## A linha de cima: a gramática

| Escrito | Entendido |
|---|---|
| `Ligar para a Squarespace amanhã 15min #obra !` | tarefa · A obra · prazo amanhã · 15 min · importante (com o prazo perto: Fazer) |
| `!!` · `!` · `para Fulano` · nada | Fazer · Marcar · Passar · Entrada |
| `hoje` · `amanhã` · `sexta` · `14/11` · `em 3 dias` | o prazo |
| `15min` · `1h` · `1h 30` | os minutos |
| `@casa` · `#3d` | o lugar · a área |
| `-35 mercado` · `+300 freela` · `-40 cinema #livre` | dinheiro: saiu · entrou · o grupo |
| `livro: Título — Autor` · `roupa: camisa de linho R$ 120` · `col Discos: Clube da Esquina` | um livro · uma peça · um item |

Teclas: `/` leva à linha de cima; Esc sai dela; Enter põe na mesa.

## Celular (até 760 px)

A linha de cima com 52 px; as abas e os filtros rolam para o lado numa fileira só; o quadrado do Agora ocupa a largura; a matriz vira os quatro quadradinhos e a lista do escolhido; o Dinheiro em duas colunas; sem rolagem para o lado em 390 px.

## Movimento reduzido

Com `prefers-reduced-motion: reduce`, nenhuma transição nem animação: o risco não corre (a tarefa sai na hora), o nível do timer pula de um valor ao outro.

## Acessibilidade

As abas são `tablist`/`tab` com `aria-selected`; toda cruz é um botão com `aria-expanded`; toda caixa de marcar é um botão com `aria-pressed` e o nome da tarefa no `aria-label`; os avisos ("Feito.", "Na mesa, em Fazer.") moram num `role="status"`; a tábua de Franklin é uma `table` com cabeçalhos; o foco de teclado é o anel do Portal.

## A conferência (o que o teste `testes/mesa.mjs` e o de ponta a ponta verificam)

- O arquivo vai e volta igual; a linha solta e a seção desconhecida ficam no lugar; a caixa marcada no Obsidian vai para as Feitas; trocar a ordem das colunas à mão não quebra nada; janeiro escrito em novembro é do ano que vem.
- No servidor de casa, a Mesa lê o arquivo do caderno; a linha de cima entende "Ligar para a Squarespace amanhã 15min #obra !" como Fazer · A obra · prazo amanhã · 15 min; os quatro quadrados mostram as listas; mover do Soltar para o Marcar grava; a Triagem leva uma coisa da Entrada até o Marcar com a área e o próximo passo; o timer corre e o tempo fica na tarefa; o plano de três tem o sapo; +300, −35,50 e −40 dão Entrou 300, Saiu 75,50, Sobra 224,50; os livros são os 85 do catálogo; o Guia abre Eisenhower com o discurso de 1954; o arquivo do caderno recebeu tudo; no celular, nada passa de 390 px.

## De onde veio cada coisa (o crédito)

- **As técnicas:** cada uma tem a fonte no Guia (`mesa-tecnicas.js`), aberta e conferida em 02/nov/2026.
- **Dos sites de prompts, só a técnica, nunca a aparência** (a receita da mistura): de *Flowstate* (GetLayers, grátis), a ideia de uma tela feita só para o foco, que aqui virou o quadrado negro do Agora; de *Shelf Hero* (MotionSites), a regra de revelar por escala e por máscara em vez de esmaecer, que aqui virou o timer que esvazia (escala) e o risco de pena (máscara). O texto dos prompts não foi copiado: o MotionSites proíbe repassá-lo, e os do GetLayers pedem uma conta.
- **A forma:** Malevich (o quadrado negro, 1915) e o desenho do Portal (`forma.css`, `respiro.css`, a gramática ■ ● ✚).
