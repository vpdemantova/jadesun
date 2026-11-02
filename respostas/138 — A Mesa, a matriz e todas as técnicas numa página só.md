# 138 · A Mesa, a matriz e todas as técnicas numa página só
#mesa #hoje #caderno #privacidade #design #celular #referencias #pedido-grande

> **Espera você:** abrir o Portal no computador (dois cliques em `jadesun/hoje.command`) → Hoje → A Mesa, e fazer a Triagem da Entrada

## O pedido

> *"faça um eisenhower da minha vida toda e de todas as tarefas estudo trabalhos objetivos! e use todas as outras técnicas de organização e ordem e produtividade e equilíbrio! TODAS! uma site simples e original, com filtros ou assistentes que ajudam a tudo isso virar trabalho feito! aprenda a usar esses dois sites e extraia os prompts de vários sites que combinam com esse projeto! … mas só como exemplo! precisamos ampliar e expandir o nível! já temos muito em Montagne de Jade, precisamos fazer tudo em um app só, da maneira mais mínima e usável possível, mais bem feita e pensada, todos os serviços, finanças, roupas, livros, coleções, tarefas, um guia e hub pessoal máximo! decente! que funcione!!!"* (02/nov/2026)

## O que eu fiz

**A Mesa** (`mesa.html`), a primeira página da porta Hoje: tudo o que é seu numa página só. A frase dela: *O que importa, primeiro.*

- **Dez vistas, em cima, e a escolhida embaixo** (o explorador): Agora · Matriz · Dia · Semana · Mandala | Dinheiro · Roupas · Livros · Coleções | Guia. O endereço guarda a vista e os filtros.
- **A matriz de Eisenhower são quatro quadrados de Malevich:** o Fazer é o quadrado negro, o Marcar é o contorno, o Passar é a trama, o Soltar é branco sobre branco. Arrastar leva de um ao outro; a cruz abre cada tarefa ali mesmo. O prazo que chega sobe do Marcar para o Fazer (uma vez: o que você puser de volta fica).
- **O Agora é o quadrado negro com uma tarefa só**, escolhida pelo quadrante, pelo prazo, pelo plano do dia e pelo que você tem agora (tempo, energia, lugar). O quadrado é também o timer: a tinta desce enquanto o tempo corre, e a letra se inverte sozinha onde ela passa.
- **A linha de cima entende o que se escreve:** "Ligar amanhã 15min #obra !" vira uma tarefa no Fazer com a área, o prazo e os minutos; "-35 mercado" vira um lançamento; "livro: título — autor", um livro. Enquanto se escreve, os selos mostram o que foi entendido.
- **Os assistentes:** a Triagem (o GTD, uma pergunta de cada vez), Planejar o dia (Ivy Lee ou 1-3-5, com o sapo primeiro), Destravar (o primeiro movimento e cinco minutos), Pedir à I.A. (um pedido pronto para colar no Claude: a I.A. explica, a mão é sua) e Fechar o dia (as seis linhas do Registro).
- **O Dia, a Semana e a Mandala:** "Que bem farei hoje?" e "Que bem fiz hoje?" (as perguntas de Franklin), o plano, os hábitos com a corrente de dias seguidos; a revisão da semana em seis passos e a tábua de Franklin dos hábitos; a malha 3 × 3 com a nota de cada área.
- **O Dinheiro, as Roupas, os Livros e as Coleções:** os três envelopes (50/30/20), o livro-caixa, os fixos e as metas; o custo por uso, a cápsula e as peças paradas; a antibiblioteca e "o próximo livro"; um armário por coleção.
- **O Guia:** 48 técnicas, de Eisenhower (1954) e do GTD a Sêneca, Franklin, Pacioli, o Pomodoro, a Mandala-Art e o KonMari, cada uma com quem fez, quando, a ideia numa frase, onde ela mora na Mesa e a fonte. Todas as fontes foram abertas e conferidas hoje; as que não diziam o que a frase dizia saíram.

**Onde mora:**

- **No computador**, num arquivo do caderno, `A Mesa.md`, achado pelo nome (nenhum caminho do caderno no código). Ele se lê no Obsidian: as tarefas em listas com caixas de marcar (marcou lá, aparece aqui), o resto em tabelas. Gravação atômica, a cópia do dia, e nunca às cegas: se o arquivo mudou fora, a Mesa pergunta qual fica. Os livros são os do catálogo do caderno, a mesma lista da Estante e das Leituras.
- **No site**, neste aparelho, com Levar e Trazer o mesmo arquivo. A Mesa vai ao público pelo Índice (■), não pela barra de cima, que continua com três e três.

**O Eisenhower da sua vida** foi montado a partir do caderno, num arquivo privado do caderno (não aqui: este registro é público). Cada linha diz de que página veio; nada foi apagado nem movido nas páginas de origem.

**Os dois sites de prompts:** lidos por dentro. No MotionSites nenhum prompt é grátis e os termos proíbem repassar o texto; no GetLayers há 11 grátis, mas copiar pede uma conta sua. Não contornei nenhuma das duas travas. O que combina com a Mesa e a camada de técnica que vale levar de cada um estão no caderno. O **prompt da Mesa**, na mesma anatomia dos deles e um degrau acima (com a frase, a herança, a fonte de cada técnica e a conferência), está em `MESA.md`.

## Conferido

- `node testes/mesa.mjs`: o arquivo vai e volta igual; a linha e a seção escritas à mão ficam; a caixa marcada no Obsidian vai para as Feitas; trocar a ordem das colunas não quebra; janeiro escrito em novembro é do ano que vem.
- De ponta a ponta, num clone do caderno, com o servidor de casa e o Chrome sem janela: 29 de 29, entre eles a captura, mover entre os quadrados, a Triagem até o fim, o timer e o tempo na tarefa, o plano com o sapo, o mês do Dinheiro, os 85 livros do catálogo, o Guia com a fonte de 1954, o arquivo gravado e, no celular (390 px), nada passando da tela.
- As fotos de cada vista em 1440 × 900 e em 390 × 844, olhadas uma a uma; dois defeitos achados e corrigidos (o vão herdado das seções empurrava o app para baixo da dobra; o estilo Almanaque deixava os filtros de canto vivo).

## Os arquivos

`mesa.html`, `mesa.css`, `mesa.js`, `mesa-formato.js`, `mesa-tecnicas.js`, `lib/mesa.mjs`, `testes/mesa.mjs`, `MESA.md` (novos); `servir.mjs` (as rotas `/api/mesa` e `/api/mesa/registro`), `mapa-dados.js` (a Mesa na porta Hoje; a porta no Índice do público), `perfil.js` (o Índice do público), `telas.js` (a Mesa sem as telas), `exportar.mjs` (a Mesa no site), `TAREFAS.md` (PS-94 a PS-97).

## O que vem depois

- **PS-95:** a Mesa no seu Drive, junto com as notas, quando o Client ID do Google existir (PS-72).
- **PS-96:** o Guarda-roupa 3D lendo as peças da Mesa (uma lista só).
- **PS-97:** os 11 prompts grátis do GetLayers, se você quiser: entrar com uma conta grátis e copiar.

## O que espera você

- **Abrir a Mesa e fazer a Triagem da Entrada:** dois cliques em `jadesun/hoje.command` → Hoje → A Mesa → Matriz → Triagem. São onze coisas, uma pergunta de cada vez.

---
[[0 Índice|Índice]] · ← [[137 — Os insetos e as metamorfoses, na Vida|137]]
