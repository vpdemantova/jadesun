# 83 · O Portal Solar repaginado: o menu do Quadrado, o leitor, o Doar, o Caminho, a Rede e as referências
#pedido-grande #menus #marca #design #movimento #protetor #fichas #hoje #estudo #eu #rede #doar #leitor #referencias #publicacao #correcao #copia #espera-voce

> **Espera você:** pôr a sua chave Pix em `doar-config.js` e reler o texto "E, por fim, a minha"; dizer se o Doar vai ao site público; nada foi para o git.

**"master design… o menu deve ser simétrico e o quadrado de portal solar ficar no meio, sem o texto… arrume o protetor de tela, volte com os reminders… pesquise mais 80 agências… colocar referências de onde saiu a informação… teremos sempre três colunas… que dê pra ler mais de um artigo ao mesmo tempo… crie bem escondido um botão de doação… mova a parte de baixo que explica sobre minhas frases do portal solar antigo jade sun pra cima…"** (12/out/2026) + **"include on the reference and detailed study of aesthetics and design the references for this and all future projects"** (13/out) + do `portalsolarprompts.md`: **"melhorar a ficha, deixar mais centralizada e com mais exemplos de perfil; mostrar a rede, e ter as fotos nos cards; integrar a lista de leituras com a estante"** (13/out).

## O que mudou, página por página

- **O menu:** simétrico, com o mundo à esquerda (Manifesto, Curadoria, Guias, Fichas, Atlas), o **Quadrado Negro no meio, sem texto**, e você à direita (Hoje, Domínio, Leituras, Eu, Casa). A fonte única das páginas é `mapa-dados.js`. Em Personalizar, "O de antes" volta o menu antigo.
- **O Índice:** tocar no Quadrado (ou a tecla **M**) abre o mapa de tudo, com rachaduras em shader nascendo do Quadrado. Tem busca, Mapa, Lista, Esfera, o agora e as ferramentas. Segurar o Quadrado abre a esfera.
- **No celular:** o "risco" embaixo, que se esconde ao rolar. Arrastar para cima abre o Índice.
- **A luz (`luz.js`):** WebGPU, com WebGL2 de reserva. Respeita "menos movimento" e economia de dados, para fora da tela e baixa a resolução sozinha. **Entre páginas**, o Quadrado fica parado e o sol do menu desliza para a porta nova.
- **O leitor (Biblioteca):** três colunas, com as imagens à esquerda e presas ao trecho, o texto no meio e a navegação à direita.
  - Referências em número, completas ou ocultas, e notas de rodapé de verdade.
  - Destaques e notas; "parei aqui" com dois cliques na palavra; modo página com contagem.
  - No celular, as três colunas na vertical e a visão geral.
- **Leituras:** vários textos abertos, dormir, grupos por tema e por livro, marcas, links, histórico, e "levar para o caderno".
  - **Novo, a aba Estante:** os livros de papel, com a página em que você parou (grava no mesmo arquivo da Estante 3D), as listas de leitura e o estudo do Atlas que abre no leitor.
  - Na Estante 3D, o antigo "Em breve" virou o link para cá.
- **Hoje, o Caminho de cada área:** as suas tarefas com o guia ao lado. Por matéria:
  - a trilha na ordem dos pré-requisitos e o próximo estudo pronto;
  - o que vem antes e depois, o que ler (as leituras do estudo e as Grandes Obras) e onde aquilo vive no mundo;
  - "Estudar agora" leva o item ao cartão do topo.
- **O protetor de tela:**
  - os lembretes voltaram para a tela;
  - quatro modos novos em shader (Campo, Sol, Mandala, Poeira), com o código à vista;
  - os painéis nascem do Quadrado;
  - **depois de 10 minutos parado, ele abre por cima da página** (Personalizar: 5, 10, 20 ou nunca).
- **O Atlas:** as três frases do Portal Solar antigo subiram para o cabeçalho, com a descrição e a necessidade.
- **Doar (escondido):** pelo ponto quase invisível no Índice ou digitando **doar** fora de um campo.
  - 28 áreas e 158 organizações, cada uma com a prova de transparência ao lado. Três ficam abertas por área, e o resto abre num toque.
  - Filtros por urgência, Brasil, reais e "pouco conhecidas", e o mapa das causas.
  - No fim, **a sua bilheteria**: quatro ingressos simbólicos e o Pix gerado na página. O código foi conferido contra o exemplo do Manual do BR Code do Banco Central (CRC 1D3D).
- **Eu:**
  - a ficha **centrada**;
  - **fichas de exemplo** de pessoas reais do Atlas, com retrato e crédito (a voz fica vazia: ninguém escreve no lugar de ninguém);
  - **a rede desenhada:** você no centro, os elos com foto e, no segundo anel, quem as fichas deles citam no Atlas;
  - **fotos nos cartões da mesa** e na lista de elos.

## A pesquisa

- **Causas:** 28 áreas, 158 organizações, metade brasileiras quando havia boas opções. Cada site, página de doação e prova foi aberto. 454 links foram conferidos de novo por conexão direta, e três links quebrados foram trocados. 30 organizações ficaram "a conferir", com o motivo escrito.
- **Agências:** 83 estúdios no caderno, em `2 Academy/2 Guias - Expressões Manifestas/b Design/Agências/`. São 20 a fundo, com fotos e o raio-X do código, e 63 em catálogo. As fotos ficam fora do caderno, em `D:\www\_Logs\Agencias-fotos\`. A sua lista `Design.md` ganhou só uma linha apontando para lá.
- **Referências de Ouro**, ao lado (`…/b Design/Referências de Ouro.md`): os seus 5 sites corrigidos (`designreviewd.com` não existe; o certo é **designreviewed.com**) e mais 9 seções, com 108 links, todos conferidos.
- **Código:** `jadesun/REFERENCIAS-CODIGO.md`, a fonte técnica de cada arquivo e as regras de WebGPU, WebGL e acessibilidade.
- **Para todo projeto futuro:** uma linha no `D:\www\CLAUDE.md` aponta para as três.

## A revisão

Quatro revisores leram todo o código novo e acharam **45 defeitos reais**. Todos foram conferidos e corrigidos. Os mais graves:
- **O servidor corrompia acentos** cortados entre dois pedaços de um envio grande (valia para toda gravação no caderno);
- **o leitor apagava a palavra** do "parei aqui" ao repintar, e **gravava o começo do texto como posição** só de abrir;
- **no protetor, clicar num modo de sempre não desligava a luz**;
- **um link `javascript:` vindo de uma nota viraria link clicável** no Caminho.

## Como testei

- Edge sem janela, em 1440 px e em 390 px, com fotos de cada tela.
- As oito páginas mexidas, sem erro no console.
- O Índice pelo teclado (M, Lista, Esc), e o site público exportado servido de verdade.
- O mini-markdown do Caminho com os textos reais.

## Onde está

- **Arquivos novos em `jadesun/`:** `mapa-dados.js`, `casca.css`, `indice.js`, `luz.js`, `luz-efeitos.js`, `leitor.js`, `leitor.css`, `abertos.js`, `leituras.html`, `leituras.js`, `lib/leituras.mjs`, `protetor-luz.js`, `doar.html`, `doar.js`, `doar.css`, `doar-dados.js`, `doar-config.js`, `caminho.js`, `caminho.css`, `rede.js`, `rede.css`, `REFERENCIAS-CODIGO.md`, `TAREFAS.md` (prefixo **PS**).
- **Cópias de antes:** em `dados/versao-2026-10-12-antes-da-grande-repaginada/`, `dados/versao-2026-10-13-antes-do-caminho/` e `dados/versao-2026-10-13-antes-da-rede/`.

**Nada foi commitado nem publicado.**

---
[[0 Índice|Índice]] · ← [[082 — A logo que não estoura, o painel de Ajustes e a entrada do menu|082]] · [[083 — O menu do celular, o ícone do Contato e o mapa dos idiomas|083]] →
