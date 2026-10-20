# 72 · Quase: botões, protetor de tela e o Atlas como casa
#design #home #atlas #protetor #eu #rede

72. **"Quase! Faça alguns tweaks, capriche nos elementos e modernize os botões… corrija o protetor de tela, nada dá pra ler e fica quase invisível… integre a Casa e o Jardim… misture todas as abas e deixe tudo mais conciso! A aba Eu e o Atlas estão um desastre de UX: é pra ser um caderno amigável e uma rede social de compartilhar livros, links, estudos, mostrar pra cada um sua essência… que a home seja o Atlas, e que lá tenha também as medidas pra salvar o planeta e ter hábitos completamente conscientes sobre cada aspecto da vida" + "preciso que todos os meus menus de organização pessoal estejam em um só" (08/out/2026).**

- **Quatro portas** em vez de cinco entradas e várias abas soltas: **Atlas** (a entrada; `/` abre o Atlas), **Hoje** (toda a organização), **Eu** (a ficha de pessoa) e **Casa** (casa e jardim). Cada porta tem a sua família na fileira de baixo do menu. Nada foi apagado: as páginas antigas abrem pelo endereço e os links antigos do Eu levam à aba nova.
- **Hoje, tudo num lugar só** (`organizar.js`): o estudo do momento, o roteiro, **Meu dia, Prazos, Domínio por matéria, Para onde vou (os quatro eixos e os Objetivos) e Esperando você**, com um índice no topo. O anel dos dias leva ao painel. O jardim e o protetor desceram para "Para respirar".
- **Atlas, a entrada:** mais curto (de 5 000 para 3 500 px). As perguntas numa faixa só, **o Planeta** logo abaixo, a linha do tempo numa faixa, o que existe recolhido por acervo e o próximo tijolo.
- **O Planeta** (`planeta-dados.js`): as cinco medidas que mais pesam e doze aspectos da vida, com 49 hábitos para marcar e fatos com fonte (IPCC AR6, Poore & Nemecek, SEEG, PNUMA, BEN/EPE, Ellen MacArthur, OCDE, Global E-waste Monitor, OMS, AASM, SNIS). O caderno não tinha uma nota sobre isso; o texto é novo e mora no app. Pode virar nota do caderno se você quiser.
- **Eu, a ficha de pessoa e a Rede**, no modelo da sua nota *A Rede da Vida* (fichas em vez de perfis, sem feed, sem curtidas, sem seguidores, elos com um porquê, federação por arquivos que viajam):
  - de sete abas para cinco: Ficha · Coleção · Caminho · Rede · Arquivos (o Domínio foi para o Hoje);
  - a ficha é um arquivo, `Logboard/# Profile/Ficha.md`, que **só nasce quando você clica em "Criar a minha ficha"**;
  - compartilhar por link (`vitrine.html`) ou pelo arquivo `.md`; só sai o que está marcado como público;
  - a Rede abre a ficha de alguém por link ou arquivo e guarda o elo em `Pessoas.md`, com o porquê;
  - a Coleção ganhou a prateleira **Links** (`Links.md`), e todo item aceita um endereço.
- **Botões e elementos v2** (`solar.css`, seção 8): 44 px, cantos de 12 px, o principal em jade com relevo e sombra da própria cor, resposta ao toque, foco visível; ações pequenas, filtros, campos, seletores e mensagens no mesmo desenho.
- **O protetor de tela:** as cores e as letras estavam presas a uma regra que nunca valia (`:root[data-pagina]`, mas o `data-pagina` fica no `<body>`), e tudo saía preto sobre preto. Agora tem a letra do Jadesun, um relógio grande com a data, os dias até a prova e as frases do caderno, modos num seletor, ajustes num painel e flores do tamanho da tela; parado, os controles somem e o relógio fica.
- **Para voltar atrás:** `dados/versao-2026-10-08-antes-da-reorganizacao/` (97 arquivos, de antes desta rodada). Os acabamentos continuam em Personalizar.
- **Testado** (Chrome sem janela):
  - 14 páginas a 1 440 e a 390 px, no claro e no escuro, sem erro nem rolagem lateral; Atlas, Hoje e Eu também no Almanaque, no Casa, no Simples e no Clássico;
  - o protetor nos quatro modos, parado e com os painéis;
  - marcar hábitos do Planeta (e continuarem marcados depois de recarregar), o anel levando ao painel, o Meu dia marcando;
  - o ciclo inteiro da ficha **num clone do caderno** (o seu não foi tocado): criar a ficha, um link público, a página pública, abrir pela Rede e guardar o elo.
- **Ainda não feito:**
  - a Casa e o Jardim estão juntos na navegação, mas ainda são duas cenas 3D (andar da casa ao jardim numa cena só é uma obra grande);
  - a Rede lê fichas por link e por arquivo, mas não avisa quando alguém muda a ficha (de propósito: sem feed);
  - o link da ficha só alcança quem chega a este computador; para o mundo, é preciso publicar o site exportado.

  **E nada foi commitado nem enviado.**

---
[[0 Índice|Índice]] · ← [[071 — Ficou péssimo, o Almanaque recusado|071]] · [[073 — O menu dentro das experiências 3D|073]] →
