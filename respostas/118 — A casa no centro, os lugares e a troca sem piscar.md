# 118 · A casa no centro, os Lugares, a passagem sem piscar, a tela cheia, o aviso discreto e as áreas como botões
#pedido-grande #design #navegacao #home #transicao #lugares #dominio #estudo #aviso #publicacao

**Os pedidos de 25/out/2026, à tarde** (quatro recados, na ordem):

> *"tire o aviso da interface provisória, coloque em outro lugar mais discreto / e um modo de tela cheia / as áreas não devem ser toggle, mas sim botões pra mudar mais rapidamente, e ver tudo mais eficientemente"*
>
> *"a home deve ser mais simétrica, porque o atlas no menu não é simétrico, ou algo diferente, mais universal e mais de boas-vindas.. algo mais cara de home, mas nada comercial, e sim o máximo da utopia..!!"*
>
> *"as transições de páginas estão ruins, não deve piscar, deve ser mais unificada, cada uma e todas, e pra navegação? não achei o que eu pedi, foi feito? se não, faça e adicione um histórico fácil das últimas páginas que fiz, e uma opção de fixar as que mais estou gostando, e caminhos, e que a fixada mude, ex, geografia 5, quando vou pra 6 fica na 6, mas que seja tudo bem feito e usável.."*

## 1. A passagem entre páginas, uma só, sem piscar

- **Por que piscava.** O menu e os índices eram montados pelo script depois que a página nova já tinha aparecido. Na passagem entre páginas, a casca inteira (o alto, os índices) sumia e voltava, com um borrão e um atraso que deixavam o fundo aparecer no meio da troca.
- **Agora:**
  - a casca nasce antes da primeira pintura (o `perfil.js` passou a ser carregado com `blocking="render"`, nas 34 páginas) e fica parada;
  - só o miolo troca, num esmaecer cruzado de 0,24 s, sem borrão;
  - o sol do menu desliza até a porta nova.
- **Conferido:** no instante em que cada página nova se revela, a barra de cima, as portas, o índice da esquerda e a linha dos créditos já estão lá. Em câmera lenta, a barra não se mexe.

## 2. Os Lugares: voltar, fixar e os caminhos

- **A navegação do registro 117 estava lá, mas escondida:** a bola só aparecia depois de andar na mesma aba, e o fio só com o mouse em cima. Agora tudo está à vista.
- **Onde ficam:**
  - nas telas largas, no índice da esquerda, que tem dois botões no alto: **O todo** e **Lugares**;
  - nas outras telas, na bola do meio da barra de baixo;
  - em qualquer tela, na tecla H.
- **Voltar:** a bola de onde você veio, como antes.
- **Fixar:** "Fixar esta página". A fixada anda com você dentro do assunto dela, como pediu (Geografia 5, Geografia 6):
  - você fixa Geografia no GEO-05, vai ao GEO-06, e ela está no GEO-06, no ponto da página em que você parou;
  - vale para a página da área (`?m=Geografia`), para a área aberta no Domínio e para as fichas da mesma matéria na Biblioteca;
  - numa página sem divisões, a fixada guarda o ponto da leitura.
- **Os caminhos:** cada visita (uma aba aberta) é um caminho, com os lugares na ordem em que foram vistos e o tópico em que você estava. Ficam os oito últimos, no seu aparelho. "Todos os lugares" abre a lista inteira.
- **Na casa de entrada:** "Onde você parou" e a fixada, para continuar com um toque.

## 3. A tela cheia

- A tecla F, ou o botão Tela cheia (no alto; nas telas largas, no pé do índice da direita).
- **O que muda:**
  - o navegador fica em tela cheia;
  - os índices e a barra de baixo descansam;
  - a barra de cima se recolhe e volta quando o mouse chega ao alto, ou ao rolar para cima;
  - o miolo se alarga.
- F ou Esc saem. Trocar de página sai da tela cheia, como em todo navegador. No Domínio, trocar de área não troca de página, então a tela cheia continua.

## 4. O aviso, discreto

- Saiu da linha no alto de cada página e do bloco grande do Início.
- Agora mora na linha da obra, no fim de cada página: "Portal Solar · uma obra de Vitor de Mantova · Campinas, 2026 · **interface provisória**". Ao lado, **O que importa agora** abre a mesma folha de antes, com as causas, o mundo agora, os avanços, as tecnologias, as tendências e a sua área.

## 5. As áreas como botões

- **No Domínio:**
  - o menu de matérias da esquerda virou o seletor: um toque numa matéria mostra a área inteira dela no lugar do mapa, na hora (o mapa, o museu, a Tábua, os itens, as obras, as práticas e o horizonte);
  - "Tudo" volta ao mapa;
  - cada matéria do mapa tem o botão "A área de …".
  - Saiu a cruz de abrir embaixo da matéria (a do registro 117).
- **Na página das Áreas:** as matérias também trocam sem recarregar.
- **O endereço guarda a escolha** (`domino.html#area=Geografia&n=GEO-05`, `area.html?m=Química`). Por isso a bola, o voltar do navegador e as fixadas acompanham.

## 6. A casa de entrada, no centro

- **O problema que você viu:** o Início era uma página da porta Atlas, à esquerda do menu, e por isso o menu acendia um lado só.
- **Agora a casa é o centro**, como o Quadrado: nenhuma porta acende, e o sol fica embaixo do Quadrado. É `inicio.html`, e a raiz do site e do servidor abre nela.
- **O que tem, sobre um eixo só:**
  - **As boas-vindas:** o Quadrado grande, "Boas-vindas ao Portal Solar", o seu lema ("Somos projetos do Sol: devemos espelhar as obras da luz.") e o dia de hoje; para quem volta, onde parou e a fixada.
  - **As portas espelhadas, como no menu:** o mundo à esquerda, alinhado ao eixo; você à direita, alinhado ao eixo; o Quadrado no meio (o mapa de tudo). Cada porta mostra a pergunta e as páginas. No site público, são três de cada lado.
  - **O que queremos:** "o máximo da utopia", nas suas palavras. É a terceira das "palavras" de *A revolução ontológica* ("Inclusão e clareza, para que qualquer um tenha a chance de acompanhar os desenvolvimentos de cada canto do globo…"), lida do caderno: mudou lá, muda aqui.
  - **A Terra agora:** o dia e a noite deste minuto.
- Nada de número para impressionar nem convite para comprar.
- A antiga primeira página do Atlas continua inteira e passou a se chamar **O Atlas**.

## 7. Conferido

- **Sem erro de script:** 22 páginas a 1440 px e 8 a 390 px; nenhuma passa da largura da tela.
- **Funcionando:**
  - a passagem, em câmera lenta;
  - a fixada que anda (GEO-05 → GEO-06);
  - os caminhos;
  - as áreas trocando, e o voltar do navegador;
  - a tela cheia;
  - a casa no site no ar ("Onde você parou: As energias").
- **As cores:** a auditoria passa nas cinco cores e nos dois estilos. A única falha é a etiqueta antiga "você · Campinas" do mapa da Terra.

## 8. A publicação

- **Commits** no GitHub: `a09aa6e` (o código) e `1bb10ee` (a raiz do site anotada como a casa).
- **No ar:** a publicação `dpl_4yZzUX4hjPVDgwihKhCpPEd1DpNb` em **montagnedejade.org** (25/out, 17:45); a raiz já abre a casa nova.
- **Para voltar:** Vercel → portal-solar → Deployments → a de 25/out, 16:11 → Promote.

## Onde está

- **Novos:** `inicio.html`, `inicio.js`, `inicio.css`.
- **Mudados:**
  - `perfil.js`: a casca antes da primeira pintura, os Lugares, a tela cheia, o aviso na linha da obra, o Início no índice;
  - `respiro.css`: a passagem, os Lugares, a tela cheia;
  - `dominio.js`, `dominio.css`, `domino.html`: o seletor das áreas;
  - `area.html`, `area.js`: a troca sem recarregar;
  - `aviso.js`, `aviso-dados.js`: o aviso discreto;
  - `mapa-dados.js`: O Atlas;
  - `exportar.mjs`, `vercel-montar.mjs`, `servir.mjs`: a casa na raiz;
  - as 34 páginas `.html` (`blocking="render"`);
  - `ESTRUTURA.md` e `estrutura/`;
  - `TAREFAS.md` (PS-63 a PS-68).
- **As cópias de antes** estão em `dados/versao-2026-10-25-b-a-casca/`.

---
[[0 Índice|Índice]] · ← [[117 — A gramática, a volta, o que abre e os créditos|117]]
