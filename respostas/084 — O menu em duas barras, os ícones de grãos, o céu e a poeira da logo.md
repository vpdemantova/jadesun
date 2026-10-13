# 84 · O menu em duas barras, os ícones de grãos, o céu de Campinas e a poeira da logo
#vitordemantova #menus #design #3d #celular #movimento #correcao #publicacao

**"no footer o espaço da linha do meu nome tá muito grande!! os botões estão péssimos, é pra ter o corner radius máximo em todoooos eles. o negócio de sky over campinas, tente algo com partículas e glsl/webgl/webgpu avançado, tire o atual! faça o mesmo para todos os ícones… os guarde em uma pasta com gitignore! a animação dos filtros deve ser mais lenta! crie uma categoria tipografia… outra categoria editorial… vamos refazer o menu: devem ter dois agora, um embaixo e outro em cima bem menor… o player de música coloque em um lugar inteligente… aprimore as partículas da logo 3D… tenha certeza de que o botão de mudar de modo fica do mesmo tamanho dos dois modos"** (12/out/2026, à noite)

## No ar

- **Primeira leva**, às 22h27 (`4896352`): o menu, os ícones, os cantos, as categorias, o nome do rodapé, o botão de modo.
- **Segunda leva**, às 23h00 (`3c825c1`): o céu, os ícones de grãos, a poeira da logo.

## O menu em duas barras

- **Em cima**, menor: a logo pequena, o nome e o tocador; o **Contato** no meio; o **Perfil** e o idioma à direita.
- **Embaixo**: **Serviços** e **Agora** · o trilho de sempre · **Links** e **∞**.
  - **Agora** foi o nome que dei à seção embaixo dos Serviços (a hora, o "Agora", o céu de Campinas).
  - **Links** leva ao rodapé.
  - **∞** leva ao fim da página e, lá, dá a volta ao começo.
- **O tocador** ficou ao lado do nome, na barra de cima: era onde ele já morava desde 08/out.
- **No celular**: em cima, o nome, o Contato e o Perfil com o idioma; embaixo, o Menu, o botão de modo, o tocador e o ∞.
- **Conferido** em 7 idiomas, de 320 a 1920 px: nenhum botão em cima de outro.

## O canto máximo, o nome, os filtros, o botão de modo

- **Os botões**: o "oval" de 11/out era a elipse (o `50%` num retângulo). Agora todo botão tem o canto máximo: pílula nos de texto, círculo nos de ícone. Os painéis grandes ganharam um canto próprio, para nunca virarem pílula.
- **O nome do rodapé**: as versões davam a todo parágrafo a entrelinha do texto (1,5); o nome voltou à dele (0,9).
- **Projetos**: os filtros Tipografia (De tanta luz dói olhar pro sol) e Editorial (o cartaz do Conservatório Carlos Gomes e o Instituto Lênin). O "dar as cartas" ficou mais lento: 1,7 s por cartão.
- **O botão de modo**: era 38 px no Estúdio e 76 px no Editorial. Agora são 48 px nos dois, com o centro na mesma altura.

## Os ícones

- **Um conjunto só**, desenhado numa grade de 24: o compasso dos Serviços, o Sol do Agora, a logo, o diafragma, o ƒ, a pena, os elos, o ∞, o envelope, o busto, a espiral, a esfera, as pedras, o icosaedro, o tocador, as setas, o Laboratório.
- **Os de antes** estão numa pasta fora do git, só no computador (`_guardados/`, com um LEIA-ME para reaproveitar).
- **De grãos** (os de destaque): 260 grãos tirados do próprio traço.
  - Chegam juntando-se, abrem-se sob o mouse e se espalham no clique.
  - Passam de um desenho a outro: tocar ↔ pausar, o envelope ↔ o fechar.
  - Parados, não gastam nada.

## O céu de Campinas

- **O céu da hora** (dia, crepúsculo, noite) e **as 2.309 estrelas reais** no lugar de agora, cada uma com a cor dela.
- **A Via Láctea** em grãos.
- **O Sol e a Lua** com a fase e os caminhos de hoje.
- **O mouse é uma lente**: mostra a constelação e o nome dela.
- **Arrastar** avança ou volta até 12 h.
- **O instrumento de antes** está guardado em `_guardados/ceu-ate-12-out/`.

## A poeira da logo

- **16 mil grãos** presos à superfície, calculados na placa de vídeo (GLSL).
- **Parada**, a porcelana fica limpa.
- **O que solta os grãos**: o mouse (perto dele), o giro forte (o rastro), o clique (a explosão, e eles voltam quando a logo se refaz) e a música (respira com os graves).

## Conferido

- `npm run check` e o build numa cópia limpa.
- Com a placa de vídeo, no computador e no celular:
  - as barras;
  - o céu de noite, de madrugada e de manhã;
  - os ícones parados, com o mouse e na troca;
  - a logo parada, com o mouse, no giro forte e na explosão até assentar.

---
[[0 Índice|Índice]] · ← [[083 — O menu do celular, o ícone do Contato e o mapa dos idiomas|083]] · [[085 — Os ícones antigos do Laboratório, do Mosaico e da Malha de volta|085]] →
