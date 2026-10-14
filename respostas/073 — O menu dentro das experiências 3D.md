# 73 · O menu dentro das experiências 3D
#menus #3d #casa #design

73. **"Traga o menu e a interface toda para dentro das experiências… que essa casa fique integrada com o menu, carregue disfarçadamente e pareça que tudo é uma coisa só… refaça as interfaces 3D… cards com tamanhos e alturas diferentes, a disposição está inaceitável… melhore a home pra parecer realmente o Atlas da Terra e a base de todo conhecimento… a rede social precisa ser inovadora, dinâmica, refrescante… transições ultra trabalhadas… refazer todos os ícones, inclusive a logo… melhore a navegação do mapa dos conteúdos e faça um mapa geral da humanidade… opções de ocultar e mexer na ordem das seções, salvar e voltar pro original… orgulhe a vida!" (08/out/2026).**

- **A marca:** o logotipo é a Gabarito com o "ȷ" sem pingo e **o sol no lugar do pingo** (medido na fonte); o símbolo do app é o mesmo j em arcos de círculo. Novos `icone.svg`, `icone-192.png`, `icone-512.png` e `icone-maskable-512.png`.
- **Os ícones, todos refeitos** (`icones.js`, 74): grade de 24, só 0°/45°/90° e arcos de círculo, pontas retas, um sólido quando ajuda a ler (Aicher, Kare, Rand). Valem no menu, no Tudo, no protetor e nas três cenas 3D.
- **O 3D dentro do Jadesun** (`mundo.css`): o menu do Jadesun em vidro por cima da Casa e do Jardim, a cena por baixo; as barras e os painéis das cenas na pele do Solar (claro ou escuro); a navegação de dentro da Casa no desenho das abas do app; o Jardim com a mesma moldura da Casa; a abertura com o símbolo e o sol nascendo, sem tela preta; o motor 3D começa a vir quando o mouse passa em Casa ou Jardim.
- **Movimento e navegação:** transição entre páginas (a de antes desce, a nova nasce em três tempos, o menu fica e o marcador de sol desliza com mola); páginas preparadas ao passar o mouse (navegação instantânea); o mesmo gesto para abrir Personalizar, Tudo, a folha e o Arrumar; os blocos nascem ao rolar.
- **Disposição:** a folha (`Perfil.folha`) passou a abrir o conteúdo fora da grade; toda grade de cartões tem linhas de altura igual (planeta, painel do Hoje, eras, capas, Rede).
- **A home, o Atlas da Terra:** **a Terra, agora** (Equal Earth, Natural Earth, a noite real deste minuto, as cidades acesas, o sol a pino, a Lua, você; uma frase diz quantas cidades estão de noite e onde o sol está a pino) e **o mapa da humanidade** (as dez partes do saber da Propædia, desenhadas como a rosa de Nightingale, com as eras e os eventos), seguidos do planeta, das eras, do que existe e do próximo tijolo.
- **A Rede da Vida, nova:** a sua carta (vira, tem QR code, baixa como imagem), a sua mesa (os elos como cartas, com o porquê), receber cartas e **quem já foi** (as 167 pessoas do Atlas, uma carta de cada vez, para fazer elos também). Sem feed, sem curtidas, sem seguidores, como na sua nota.
- **Arrumar:** esconder e reordenar as seções do Atlas e do Hoje; "Pronto" guarda, "Voltar ao original" apaga, "Cancelar" desfaz.
- **O mapa de cada matéria:** atalhos por unidade, minimapa com a janela do que está visível, arrastar o fundo para mover; o caminho Hoje › Domínio › a matéria.
- **O sistema** (`sistema.html` e `SISTEMA.md`): a marca, a grade dos ícones, o movimento e as fontes.
- **Para voltar atrás:** `dados/versao-2026-10-08-antes-da-terra/` (109 arquivos, de antes desta rodada). Os acabamentos continuam em Personalizar.
- **Testado** (Chrome sem janela):
  - 15 páginas a 1 440 e 390 px, no claro e no escuro, sem erro nem rolagem lateral; Atlas, Hoje e Eu também nos quatro outros acabamentos;
  - com o movimento ligado e desligado (o Chrome de teste vem com "reduzir movimento"; a regra que zerava os botões nesse modo foi corrigida);
  - a Casa e o Jardim no computador e no celular;
  - o Arrumar de ponta a ponta (mexer, esconder, salvar, recarregar, voltar ao original);
  - a carta, a mesa e o baralho da Rede;
  - a navegação do mapa da matéria.
- **Ainda não feito:**
  - andar da Casa ao Jardim numa cena 3D só (hoje são duas cenas com a mesma moldura);
  - o Arrumar nas outras páginas (é marcar as seções com `data-secao`).

  **E nada foi commitado nem enviado.**

---
[[0 Índice|Índice]] · ← [[072 — Quase, botões, protetor de tela e o Atlas como casa|072]] · [[074 — O nome Portal Solar, o Quadrado Negro e menus que rolam|074]] →

---
[[0 Índice|Índice]] · ← [[072 — Quase, botões, protetor de tela e o Atlas como casa|072]] · [[074 — O nome Portal Solar, o Quadrado Negro e menus que rolam|074]] →
