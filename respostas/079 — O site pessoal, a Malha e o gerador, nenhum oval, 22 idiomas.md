# 79 · O site pessoal: a Malha e o gerador, nenhum oval, 22 idiomas e o endereço dos modos
#vitordemantova #menus #idiomas #3d #design #celular #correcao #registro #espera-voce

> **Espera você:** ligar o Mural na Vercel (Storage › Create Database › Upstash for Redis › ligar ao projeto vitordemantova › Redeploy).

**"Para o vitordemantova, quando entramos em mesh, deve ter uma transição melhor! e está muito crua e seca essa parte.. quero que tenha um gerador 3D de logos, você coloca suas iniciais, e o gerador faz uma forma geométrica parecida com a minha que tenha as iniciais abstratas da pessoa! deixar o botão que troca de modo dentro do menu, sem ele sair pra fora, e tirar qualquer botão oval do site! … absolutamente nenhum botão oval! a espiral do the end is the beginning deve ser maior e ter mais voltas"** — e, no meio da obra: **"detecte a região do usuário e coloque o idioma dele … quando clicar, dividido por continente, vai ter vários idiomas, mais de 20, com bandeiras de cada um! no modo editorial, o raio dos padrões vermelhos deve ser menor ainda! vamos lançar o quadro de mensagens, por onde eu configuro?"**; **"tire os highlights de dribbble e behance no footer do modo editorial"**; **"quais são os arquivos de controle dos projetos e dos prompts que eu dou e recebo de volta? aonde eu acho como popular o site de conteúdo e informação? … dê um espaço, parágrafo, depois do título de cada serviço … colocar meu nome na fonte em itálico que estava, em todos os lugares, até as siglas"**; **"em the spiral, dentro de perfil, deixe mais animado e com mais estados enquanto o scroll acontece … em baixo de let's talk, um botão de voltar pro site; remova a parte de que o portfólio está sendo construído … adicione no footer o portfólio do notion e o primeiro portfólio; mude o link do portal solar para https://montagnedejade.org; atualize a url, quando entrarmos em laboratório, mosaico, malha, e até no modo editorial, em cada parte dele"** (11/out/2026)

## O que foi feito

- **Nenhum botão oval.** Os cantos do site viraram três medidas: botões retos, barras e painéis com 6 px, pontinhos com 1 px. As versões do painel de Ajustes trocam só entre "reto" e "suave". O botão do Editorial ficou dentro do trilho do menu, como um ladrilho quadrado. Os anéis em volta dos desenhos das seções (no título de cada seção e no Menu do celular) viraram quadros.
- **A espiral do fim:** 7 voltas (eram 3), até a borda, num quadro que se enche pelo contorno enquanto se rola.
- **A Malha:** a entrada nasce do botão clicado. Um círculo se abre, uma trama de triângulos acende em onda, a logo chega em arame, aresta por aresta, e cristaliza nas faces. No celular, a peça cabe na tela.
- **O gerador de logos** (a aba "Faça a sua", na Malha): até 4 iniciais viram uma forma na gramática da sua logo, com traços retos e grossos e triângulos vazados. Dá para mexer na espessura, na inclinação, na junção e na profundidade, pedir "Outra variação" e baixar em SVG e PNG. As suas iniciais, VPD, saem parecidas com a sua logo.
- **22 idiomas, com bandeira.**
  - A primeira visita detecta o idioma do navegador e o país. Um navegador em alemão no fuso de São Paulo mostra a bandeira alemã, porque o Brasil não fala alemão.
  - O PT|EN virou um botão quadrado com a bandeira e o código ("PT"). Ele abre a escolha por continente: 30 entradas, com o português do Brasil, de Portugal, de Angola e de Moçambique, o inglês de quatro países e assim por diante. No Editorial ela vem nas cores do papel; no celular, sobe de baixo.
  - A escolha fica guardada no navegador, e a troca usa a animação de ontem.
  - Mudam o menu, o rodapé, os botões, os títulos das seções e o cabeçalho. Os textos longos (Serviços, Perfil, poemas, fichas, o Editorial) existem em português e inglês: quem escolhe outro idioma lê o inglês, e a escolha avisa isso.
  - Um título de seção que não cabe no celular (como "Φωτογραφία") diminui a letra até caber.
- **O endereço acompanha os modos:** `#laboratorio`, `#mosaico`, `#malha`. No Editorial, `?modo=editorial` e a seção do meio da tela (`#ed-foto`, `#ed-escrita`…). Abrir um desses endereços leva até lá, então dá para mandar o link.
- **O Perfil:**
  - a espiral tem nove estados que andam com os fatos ao rolar: a do site, Arquimedes, Bernoulli, o girassol, o náutilo, Vertigo, a espiral dos primos, a galáxia e a arquitetura;
  - a linha laranja que aparecia em pontinhos foi corrigida;
  - embaixo de "Vamos conversar", o botão "Voltar para o site".
- **O resto:**
  - o aviso do portfólio em construção saiu dos dois modos. O portfólio no Notion e o primeiro portfólio estão no rodapé do Estúdio e no Expediente do Editorial;
  - o Portal Solar aponta para https://montagnedejade.org;
  - o seu nome está em itálico em todo lugar, até em VPD;
  - Serviços têm um respiro depois de cada título;
  - o pied-de-poule vermelho tem a lupa menor;
  - o rodapé do Editorial ficou sem o destaque do Behance e do Dribbble.
- **Uma correção minha:** a legenda da galáxia dizia "a mesma curva do túmulo de Basileia". Bernoulli pediu a espiral logarítmica para o túmulo, mas o pedreiro gravou uma de Arquimedes. Agora a legenda diz "a curva que Bernoulli pediu".

## O Mural: por onde configurar

Na Vercel: o projeto vitordemantova › **Storage** › **Create Database** › **Upstash for Redis** (o plano grátis basta) › ligar ao projeto (ele põe sozinho `KV_REST_API_URL` e `KV_REST_API_TOKEN`) › **Redeploy**. O código do Mural já está no ar desde 10/out: assim que o Redeploy acabar, o Mural do Editorial abre.

Para moderar, crie também a variável `MURAL_CHAVE` (uma senha sua). O mesmo Upstash guarda as versões publicadas do painel de Ajustes, com a variável `AJUSTES_CHAVE`.

## Os arquivos de controle

**No site pessoal** (`vitordemantova/`):
- `CLAUDE.md`: as regras para quem mexe no site (eu inclusive);
- `ESTADO-DO-SITE.md`: o que aparece, o que está escondido, onde mudar e o que espera você;
- `CHANGELOG.md`: cada sessão, a mais nova no topo, com os seus pedidos citados;
- `COMO-POPULAR.md`: **o guia de como pôr conteúdo** (fotos, textos, projetos, músicas, serviços, o Agora, o Perfil, as redes, o Laboratório, o mural);
- `COMO-FUNCIONA.md`: a programação e a matemática;
- `PLANO-GRANDES-OBRAS.md`: as obras grandes que esperam a sua assinatura;
- `CONFERENCIA-08-09-OUT.md`: a conferência dos pedidos de 08 e 09/out;
- `DOC_TASKS.md`: pedidos antigos, ainda crus.

**No Portal Solar:** esta pasta, `jadesun/respostas/` (um arquivo por resposta, com o índice em `0 Índice.md`), e a sua nota `blessednotebook/portalsolarprompts.md`.

## Conferido

- `npm run check` e `npm run build` passaram.
- No navegador, nos dois modos, em 1440 px (português e grego) e em 390 px (português, alemão, francês, russo, grego, polonês, hindi, japonês e suaíli): o topo, o rodapé e a folha do Menu ficaram sem rolagem lateral e sem texto abaixo de 11 px.
- A detecção, a escolha guardada, o Esc e o foco que volta ao botão também foram conferidos.

## Pode esperar (nada quebra)

- **Publicar:** tudo de hoje está só no computador, sem commit. O site no ar continua o de 10/out. Quando quiser, é dizer "pode publicar".
- **As traduções:** os 20 idiomas novos foram traduzidos por mim, sem revisão de quem fala cada um. Cada arquivo de `vitordemantova/lib/idiomas/` tem uns 50 textos curtos e avisa isso no topo.
- **Textos pequenos fora das telas principais:** ainda há textos abaixo de 11 px no Laboratório, no painel de Ajustes, no índice do Perfil e no Mosaico. Isso pede uma passada própria.
- **montagnedejade.org** ainda não abre: o domínio está na Squarespace, num e-mail sem acesso.
- **O Portal Solar** continua esperando o login na Vercel (077) e a sua escolha na prancha (078).

  **Nada foi commitado.**

---
[[0 Índice|Índice]] · ← [[078 — A prancha, dez estilos, os menus e o registro em arquivos|078]] · [[080 — A publicação, o site pessoal no ar e o domínio de volta|080]] →

---
[[0 Índice|Índice]] · ← [[078 — A prancha, dez estilos, os menus e o registro em arquivos|078]] · [[080 — A publicação, o site pessoal no ar e o domínio de volta|080]] →
