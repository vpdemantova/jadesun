# 111 · Monocromático: o Almanaque de volta, Ajustes com três coisas, o menu só texto e o menu de baixo
#pedido-grande #design #menus #personalizar #celular #manifesto #correcao #copia #espera-voce

> **Espera você:** abrir o `hoje.bat` e olhar (Atlas, Hoje, Eu, Manifesto, Doar, no computador e no celular); dizer se commita e se publica no montagnedejade.org (nada foi para o git nem para a Vercel).

**"no portal solar, para o estilo: deixe somente o modo almanaque (como padrão) e o casa como segunda opção! tire os ícones do menu e substitua por texto somente; ao invés de chega de livros, chega de novas criações sem nexo e conexão, pra não parecer um ataque aos livros! sabe os sub menus? eles devem ficar em um novo menu igual ao menu padrão, em baixo ao invés de em cima! e cada tópico da página deve ficar na direita desse menu… cada sub menu dentro de cada página deve ficar na esquerda inferior, com um menu separado, e do mesmo tamanho, outro menu na direita inferior com o índice da página!"** · **"remova completamente a opção de tema clássico!"** · **"remova os atalhos e todas as opções de configuração de tema e ajustes, deixe só o de movimento e mudar a cor, ex. preto, branco, papel, floresta, azul noite; o padrão deve ser preto ou branco, sem cor de destaque mais! foque no monocromaticismo! e tenha certeza que cada seção fica bem com as cores definidas, pois está quebrando e carente a visualização, as cores não funcionam juntas e se opacam, se murcham e somem!"** (14/out/2026)

## Ajustes: três coisas só

- **Estilo:** Almanaque (o padrão, papel e fios) ou Casa (vidro, como nas cenas 3D). Quem estava no Solar, no Simples ou no Casa passou uma vez para o Almanaque.
- **Cor:** preto ou branco (do aparelho: branco de dia, preto à noite, o padrão), preto, branco, papel, floresta, azul noite. Os nomes antigos viram os novos (o "claro" é o papel; o "escuro", o preto; a sépia, o papel).
- **Movimento:** rolagem, animações, cursor luminoso, partículas.
- **Saíram:** os atalhos, a cor de destaque, a letra, o tamanho, o espaçamento, as imagens coloridas, a marca colorida, o menu de antes, a faixa, a textura e o **Clássico, por completo** (o painel lateral e o código dele, a opção na Galeria, as variantes no Sistema). O que um navegador guardava nesses campos volta ao padrão; só o tempo do protetor de tela, sem botão, continua respeitado.

## Monocromático (cores.css)

- Cada cor é um papel e uma tinta, num tom só; o destaque é a própria tinta e o texto sobre ela é o papel. Contraste da tinta sobre o papel de 14:1 a 19:1; o texto suave, acima de 6:1.
- As matérias não têm mais cor (o nome diz qual é). Imagens e desenhos das páginas em preto e branco; as cenas 3D (Casa, Jardim, Estante, Guarda-roupa) e o protetor guardam as cores delas.
- **Por que "quebrava":** desde 08/out as peças novas foram feitas no Solar e usavam tokens que só ele tinha (`--cavalete`, `--jade`…); no Almanaque e na Casa eles não existiam, e cartões ficavam sem fundo e botões sem cor. Agora existem em todos os estilos.
- **Seção por seção:** 100 cores fixas de "texto claro sobre o verde" viraram `--sobre-tinta` (o botão principal do site inteiro ficava branco sobre branco no tema escuro); o Doar distingue as três naturezas de causa pela forma (cheio, contorno, meio cheio) e o palco do fim ficou invertido, com os ingressos de papel; o Sol do mapa da Terra é um disco de papel com contorno de tinta; a árvore da Curadoria, a carta do Fichário, os blocos escuros (O instante, "nosso", Como a conta funciona) e o "G" do Google ficaram na tinta; a tela do Malevich, cinza neutro.
- **A prova:** `node testes/cores-auditoria.mjs 4322` passa por 24 páginas nas cinco cores (contraste de todo texto e toda cor fora do tom). Antes: 36 textos apagados e 118 cores fora do tom em só duas cores. Depois: nenhum texto apagado de verdade (sobram um botão desligado de propósito e os cartões com foto, que a auditoria não lê), e as cores "fora do tom" que sobram são o próprio azul do Azul noite.

## O menu só texto

Buscar, Nota, Arrumar e Ajustes em palavras; a contagem da prova sem o anel ("2 dias"); as portas do celular só com o nome; o Índice e o menu Tudo sem ícones (o fechar é a palavra "Fechar"). O Quadrado Negro fica no centro: é a marca, e você pediu, em 12/out, que ele ficasse sem texto.

## O menu de baixo

O mesmo grid da barra de cima, então as metades ficam uma sob a outra:
- **à esquerda, "Dentro de <porta>":** as páginas da porta (a antiga fileira de cima, que não aparece mais);
- **à direita, "Nesta página":** os tópicos, com o atual acompanhando a rolagem ou a aba aberta. Vêm do índice que a página já tinha no alto (Eu, Hoje, Faça parte, Galeria, Leituras, Quando, Dados: descem e somem de cima), do sumário lateral (Manifesto, Curadoria) ou dos títulos;
- clicar no nome de cada metade abre a lista inteira; **no celular**, as duas metades são dois botões do mesmo tamanho, logo acima das portas, e somem junto com o risco ao rolar.

## O resto

- **"Chega de novas criações sem nexo e sem conexão"** no Atlas, na XVI do Manifesto e na nota do caderno (`Manifestos/A Revolução Ontológica.md`).
- O subtítulo dos títulos grandes vai para a linha de baixo ("O Atlas da Terra" e "tudo o que a humanidade sabe…" grudavam no Almanaque).
- A Conta e O cartão passaram a carregar o Almanaque e a Casa (antes, não carregavam); a exportação leva o `cores.css`.
- A página do Sistema (cor, marca, ajustes) e a Galeria de design contam o sistema novo.

## Onde está

- **Novos:** `cores.css`, `testes/cores-auditoria.mjs`, `testes/cores-auditoria-pagina.js`.
- **Mudados:** `tema.js`, `perfil.js` (Ajustes, menu, menu de baixo, sem o Clássico), `casca.css`, `almanaque.css`, `vidro.css`, `fino.css`, `solar.css` (só o cabeçalho), `forma.css` e outros oito CSS (o `--sobre-tinta`), `galeria*.js`, `sistema.html`, `indice.js`, `tudo.js`, `atlas.js`, `ontologica.js`, `exportar.mjs` e as 29 páginas (o `cores.css`).
- **Cópia de antes:** `dados/versao-2026-10-14-antes-do-monocromatico/`.
- **Testado:** 1440 e 390 px; as cinco cores e os dois estilos; o menu de baixo aberto, rolando e no celular; a Casa 3D intacta.

**Nada foi commitado nem publicado.**

---
[[0 Índice|Índice]] · ← [[085 — Os ícones antigos do Laboratório, do Mosaico e da Malha de volta|085]]
