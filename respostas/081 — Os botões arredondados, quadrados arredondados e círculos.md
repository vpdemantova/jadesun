# 81 · Os botões arredondados: quadrados arredondados e círculos
#vitordemantova #design #menus #correcao #erro-meu #publicacao

**"que horror, você deixou os botões quadrados?!?! era pra ser circulares! quadrados arredondados! isso sim! S.O.S. mude todos e publique logo em seguida!"** (12/out/2026, à tarde)

- **O erro foi meu:** em 11/out, "absolutamente nenhum botão oval" virou canto vivo em tudo. Oval era a elipse e a pílula; o certo era arredondar.
- **Agora, no site inteiro:**
  - os botões com texto são quadrados arredondados (12 px de canto);
  - os botões só de ícone são círculos;
  - as etiquetas pequenas têm um canto menor (6 px), para não virarem pílula;
  - as barras e os painéis têm 18 px, e os pontinhos são redondos.
- **Em círculo de novo**, como eram até 10/out:
  - no menu, o botão do Editorial (com o anel pontilhado);
  - a espiral do fim, outra vez num anel que se enche;
  - os botões de ícone da barra do celular e o tocador;
  - os botões de fechar (Perfil, Malha, cartão, Ajustes, Laboratório);
  - as etapas do Perfil;
  - no Editorial, as setas, a bola e o tocar da Música;
  - os ícones dos modos no rodapé;
  - os controles do Laboratório (minimapa, joystick, pulo).
- **Como achei cada um:** medi no navegador todo elemento que usa o canto dos botões, nas telas principais, e separei os quadrados em tamanho, que são os só de ícone. Depois conferi no git o canto que cada um tinha antes: todos eram círculos.
- **O painel de Ajustes:** todas as versões ficaram arredondadas e trocam só as medidas. Saiu a lista que forçava um canto único em todos os botões, porque ela apagava os círculos. O módulo "forma dos botões" tem Arredondado e Reto.
- **Conferido:**
  - um detector de ovais (canto que faz pílula ou elipse num botão visível) passou pelo Estúdio, pela folha do Menu, pelo Perfil, pela Malha e pelo Editorial, no computador e no celular, e não achou nenhum;
  - `npm run check` e o build passaram.
- **Publicado:** o commit `3485e3a` foi para a `main` do site pessoal. As regras do `CLAUDE.md`, o `ESTADO-DO-SITE.md` e o `CHANGELOG.md` dizem a forma nova, para ela não voltar ao canto vivo.

---
[[0 Índice|Índice]] · ← [[080 — A publicação, o site pessoal no ar e o domínio de volta|080]] · [[082 — A logo que não estoura, o painel de Ajustes e a entrada do menu|082]] →
