# Portal Solar (Jadesun) — tarefas, prompts, controles e melhorias

Criado em 13/out/2026, pelo modelo `D:\www\MODELO-TAREFAS.md`, a partir do pedido grande de 12/out ("master design… o menu simétrico com o quadrado no meio… arrume o protetor… referências… três colunas… ler mais de um artigo… um botão de doação escondido…") e do de 13/out ("as referências de estética e design para este e todos os projetos").
O registro de cada resposta continua em `respostas/` (o 083 é o desta rodada).

## Como usar

- Cada tarefa tem um número: **PS-12**. Para pedir: "faz a PS-12".
- Situação: `[ ]` a fazer · `[~]` começada · `[x]` feita (com a data) · `[-]` descartada.
- Prioridade: **P1** agora · **P2** logo · **P3** quando der. Tamanho: pequena, média, grande.
- **Até 18/10 a frente ativa é o vestibular** (Nova Fase): o que não for P1 espera.

## 1. Controles

| Para | Comando ou endereço |
|---|---|
| Abrir o Portal | `hoje.bat` (porta 4321; é o seu, nunca derrubar) |
| Testar sem mexer no seu | Git Bash: `PORTA=4322 SEM_NAVEGADOR=1 node servir.mjs` · PowerShell: `$env:PORTA=4322; $env:SEM_NAVEGADOR=1; node servir.mjs` |
| Celular pela rede | `celular.bat` (QR e código) |
| Site estático | `exportar.bat`, ou `node exportar.mjs publico` / `node exportar.mjs privado` → `exportado/` |
| Testes | `node testes/ceu.mjs` (céu) · `node testes/casa-modelo.mjs` (Casa) · `node testes/cores-auditoria.mjs 4322` (contraste e cor de todas as páginas nas cinco cores; `ESTILO=casa` para o Casa) |
| Registro | `node indice-respostas.mjs` (refaz `respostas/0 Índice.md`) |
| Forçar WebGL2 (sem WebGPU) | `?webgl` no fim do endereço · 3D sem placa: `?qualidade=min` |
| Abrir o Índice | o Quadrado do menu, ou a tecla **M** · segurar o Quadrado: a esfera |
| Página escondida de doação | o ponto quase invisível no Índice, ou digitar **doar** fora de um campo |
| Referências | design: `blessednotebook/2 Academy/2 Guias - Expressões Manifestas/b Design/Referências de Ouro.md` · agências: `…/b Design/Agências/` · código: `REFERENCIAS-CODIGO.md` |

**Antes de dar uma tarefa por pronta:**
- [ ] `node --check` nos arquivos mexidos; console sem erro.
- [ ] `node testes/cores-auditoria.mjs 4322`: nenhum texto abaixo do contraste e nada fora do tom (monocromático, desde 14/out).
- [ ] 1440 px e 390 px, sem rolagem para os lados; o menu simétrico e o risco do celular no lugar.
- [ ] Com WebGPU e com `?webgl`; com "reduzir movimento", nada essencial depende de animação.
- [ ] Só pelo teclado: Tab, Enter, Esc; o foco volta para onde estava.
- [ ] Exportação pública sem páginas privadas (Hoje, Domínio, Eu, Casa, protetor, Doar).
- [ ] Nada inventado; link novo só depois de aberto.

**O que não fazer:** nome de arquivo com dois-pontos `:` (o Windows não aceita; em 19/out os registros 089, 090 e 107 tiveram de ser renomeados: use vírgula) · commit ou push sem ele pedir · abrir arquivos `senha*`, `pass*`, `secret*`, `token*` · derrubar a porta 4321 · remover ou reduzir o que existe (copiar para `dados/` antes de mexer).

## 2. Conteúdo

- [x] **PS-01** · [P1 · grande] **A página Doar.** 28 áreas, 158 organizações, a prova de transparência ao lado de cada uma, 3 abertas por área e o resto num toque. *(13/out)*
- [ ] **PS-02** · [P2 · média] **Conferir as 30 "a conferir".** Na própria página, cada uma diz por que ficou assim (site que barra robôs, página de doação não achada). *Prompt:* "faz a PS-02: confere as organizações a conferir da página Doar, abrindo cada site no navegador".
- [ ] **PS-03** · [P1 · pequena · **sua**] **A sua chave Pix.** Em `doar-config.js`, linha `pix: { chave: '' }`. Com ela, os ingressos geram o QR e o "copia e cola".
- [ ] **PS-04** · [P2 · pequena · **sua**] **Doar no site público?** Hoje ela vai só no app e no site privado. Diga "pode" e eu ponho na lista pública.
- [ ] **PS-05** · [P2 · pequena · **sua**] **O texto "E, por fim, a minha".** Está em `doar-config.js`, na sua voz, com a sua frase ("o ideal seria um sistema mais humano… governo dos sábios"). Reescreva à vontade.

## 3. Design e interface

- [x] **PS-06** · [P1] **Menu simétrico** com o Quadrado no centro, sem texto: o mundo à esquerda, você à direita. *(12/out)*
- [x] **PS-07** · [P1] **O cabeçalho do Atlas** com as três frases do Portal Solar antigo, a descrição e a necessidade. *(12/out)*
- [x] **PS-08** · [P2 · grande] **Cores íntegras.** *(14/out, de outro jeito: um conjunto só, monocromático, em `cores.css`; ver PS-40)* Um só conjunto de cores (tokens) para Fino, Solar e Casa, com as cores das matérias no mesmo peso (OKLCH). *Prompt:* "faz a PS-08".
- [x] **PS-38** · [P1] **Estilo: só o Almanaque (padrão) e a Casa;** o Clássico saiu por completo (o painel lateral, o botão, a opção na Galeria e no Sistema); o Solar e o Simples saíram de Ajustes. *(14/out)*
- [x] **PS-39** · [P1] **Ajustes enxuto:** só Estilo, Cor e Movimento. Saíram os atalhos, a cor de destaque, a letra, o tamanho, o espaçamento, as imagens coloridas, a marca colorida, o menu de antes, a faixa e a textura (o que estava salvo nesses campos volta ao padrão). *(14/out)*
- [x] **PS-40** · [P1] **Monocromático:** cinco cores (preto, branco, papel, floresta, azul noite) e a do aparelho (preto ou branco, o padrão), todas em `cores.css`; o destaque é a tinta; as matérias sem cor; os tokens que só o Solar tinha (`--cavalete`, `--jade`…) existem em todos os estilos; imagens e desenhos das páginas em preto e branco. *(14/out)*
- [x] **PS-41** · [P1] **O menu só com texto:** Buscar, Nota, Arrumar e Ajustes em palavras, a contagem sem o anel, as portas do celular só com o nome, o Índice e o menu Tudo sem ícones (o Quadrado Negro fica: é a marca). *(14/out)*
- [x] **PS-42** · [P1] **O menu de baixo:** "Dentro de <porta>" à esquerda (as páginas da porta, a antiga fileira de cima) e "Nesta página" à direita (os tópicos; o item atual acompanha a rolagem); os índices do alto (Eu, Hoje, Faça parte, Galeria, Leituras, Quando, Dados) desceram; no celular, dois botões do mesmo tamanho acima das portas. *(14/out)*
- [x] **PS-43** · [P1] **"Chega de novas criações sem nexo e sem conexão"** no lugar de "livros" (Atlas, a XVI do Manifesto e a nota do caderno). *(14/out)*
- [x] **PS-44** · [P1] **Cada seção em cada cor:** a auditoria (`testes/cores-auditoria.mjs`) passou por todas as páginas nas cinco cores; os textos que sumiam e as cores fora do tom foram corrigidos (ver `respostas/111`). *(14/out)*
- [x] **PS-45** · [P1] **O aviso:** "esta interface é emergencial e provisória", no alto do Início (a faixa, as cinco colunas e Na sua área, com 21 áreas) e numa linha fina nas outras páginas, que abre a folha; 83 links abertos um a um (`aviso-dados.js`, `aviso.js`; ver `respostas/114`). *(21/out)*
- [x] **PS-46** · [P1] **A estrutura da interface nova:** `ESTRUTURA.md` (as leis, o local-first, as oito lentes, as oito portas, os quinze moldes, os produtos no hub, o passo a passo no Figma) e `estrutura/figma/` (o mapa, as lentes, os produtos, os moldes em 1440 e 390, `variaveis.json`), tudo gerado de `estrutura/dados.mjs`. *(21/out)*
- [ ] **PS-47** · [P1 · grande · **sua**] **O wireframe no Figma:** arrastar os SVG de `estrutura/figma/` e desenhar os moldes 01 a 04 (Início, Porta, Coleção, Página) em 1440 e 390; depois segue a PS-36. *Prompt:* "faz a PS-36 com este link do Figma: …"
- [x] **PS-48** · [P2 · pequena] **A barra de cima no celular passava 12 px da tela** (390 px, todas as páginas): no telefone a contagem sai da barra (continua no Hoje) e, passada a prova, diz o dia ("qua, 21 de out") em vez de "Prova feita"; o menu de baixo perdeu a letra mono em caixa-alta. *(21/out, `respostas/115`)*
- [x] **PS-49** · [P1 · grande] **Todas as áreas** (`campos.html`): as dez grandes áreas da UNESCO (ISCED-F 2013) e três caminhos, 40 áreas, 267 subáreas, 264 nichos, 161 fontes (137 com RSS), 55 quadros de vagas, 126 comunidades; **os seus dez minutos** (o que mudou, uma subárea por dia, o mercado, uma área de fora), com relógio; o mapa abre cada área numa folha. As manchetes e as vagas vêm da função `/api/agora` (o motor `lib/agora-motor.cjs`, o mesmo do servidor de casa). O "Na sua área" do aviso lê daqui. *(21/out)*
- [x] **PS-50** · [P1] **A Luz** (`iluminacao.html`): as cinco perguntas antes de acender, 26 alternativas em seis famílias e a escada do olho ao céu (sete degraus), 31 fontes numeradas. *(21/out)*
- [x] **PS-51** · [P1] **Projetos do Sol** (o poema): a escada de doze cantos no caderno (`b.c Poemas/3 Projetos do Sol/0. A escada.md`, privada) e a página que a lê (`poema.html`, Eu, só no computador); o botão Escrever abre o arquivo na Nota. *(21/out)*
- [ ] **PS-09** · [P2 · média] **O leitor em mais páginas:** Curadoria, Manifesto, Guias e os estudos das Áreas.

## 4. Experiência (UX)

- [x] **PS-10** · [P1] **O Índice**, aberto pelo Quadrado (M), com busca, mapa, lista e esfera. *(12/out)*
- [x] **PS-11** · [P1] **O caminho de cada área**, no Hoje: as tarefas com o guia ao lado e, por matéria, o próximo estudo, o que vem antes e depois, o que ler e onde aquilo vive no mundo. *(13/out)*
- [x] **PS-12** · [P1] **Leituras:** várias abertas, dormir, grupos, marcas e notas por tema e por livro, links, histórico e "levar para o caderno". *(12/out)*
- [x] **PS-13** · [P1] **Celular:** o risco embaixo, as três colunas na vertical com a visão geral, o modo página com contagem. *(12/out)*
- [ ] **PS-14** · [P3 · pequena] **Um cartão das Leituras no Eu** (onde parei, quantas marcas).
- [x] **PS-31** · [P1] **A ficha mais centrada e com exemplos de perfil:** a ficha no meio da página e as fichas de exemplo (pessoas reais do Atlas, com retrato e crédito; a voz fica vazia). *(13/out, do `portalsolarprompts.md`)*
- [x] **PS-32** · [P1] **A rede à mostra, com fotos nos cartões:** a constelação (você no centro, os elos com foto e, no segundo anel, quem as fichas deles citam no Atlas), na Ficha e na Rede; fotos na mesa e na lista de elos. *(13/out)*
- [x] **PS-33** · [P1] **As Leituras com a Estante:** a aba Estante (lendo agora com a página em que parou, as listas de leitura, quero ler e lidos, o estudo do Atlas no leitor); o selo "na sua estante" nos textos abertos; o link de volta na Estante 3D. *(13/out)*

## 5. Técnica: luz, shaders e movimento

- [x] **PS-15** · [P1] **O motor `luz.js`:** WebGPU, com WebGL2 de reserva. *(12/out)*
- [x] **PS-16** · [P1] **O protetor de tela:** quatro modos de luz, os lembretes de volta na tela, os painéis nascendo do Quadrado, e abrindo sozinho por cima da página depois de 10 minutos parado (Personalizar muda). *(12–13/out)*
- [x] **PS-17** · [P2] **A passagem entre páginas:** o Quadrado fica parado e o sol do menu desliza para a porta nova. *(13/out)*
- [ ] **PS-18** · [P3 · grande] **Transição "duas folhas"** (ideia da Immersive Garden, ficha 1): a página que sai e a que entra misturadas por um ruído que nasce do Quadrado.
- [ ] **PS-19** · [P3 · média] **Mais segredos:** um por página, achado sem querer (segurar o sol do menu, uma constelação no rodapé).

## 6. Desempenho

- [ ] **PS-20** · [P2 · pequena] **Medir no celular fraco:** a luz já carrega só quando precisa; conferir o tempo até a primeira tela no Hoje e no Doar.

## 7. Acessibilidade

- [x] **PS-21** · [P1] **Revisão do código novo** por quatro revisores (luz, menu e Índice, leitor, doar e caminho): 45 defeitos reais achados e corrigidos, entre eles os acentos partidos nas gravações do servidor, a palavra do "parei aqui" que sumia e o link `javascript:` no Caminho. *(13/out)*
- [ ] **PS-22** · [P2 · pequena] **Botão "pausar o movimento"** sempre à mão (ideia da Mouthwash, ficha 3).

## 8. Compartilhamento

- [ ] **PS-23** · [P3 · pequena] **Imagem de compartilhamento** para Leituras e Doar, se forem ao público.

## 9. Código e organização

- [x] **PS-24** · [P1] **`mapa-dados.js`**, a fonte única das páginas, usada pelo menu, pelo Índice e pela subnavegação. *(12/out)*
- [x] **PS-25** · [P1] **`REFERENCIAS-CODIGO.md`**, as fontes técnicas de cada arquivo. *(13/out)*
- [ ] **PS-26** · [P3 · grande] **Uma língua para os dois motores:** se os efeitos crescerem, gerar WGSL e GLSL da mesma fonte (a TSL do three.js, ficha 18).

## 10. Publicação

- [x] **PS-27** · [P1] **A exportação leva as peças novas;** o público não leva protetor nem Doar, e o Índice esconde o que não foi junto. *(13/out)*
- [x] **PS-28** · [P1] *(21/out: publicado junto com o aviso, ver `respostas/114`)* **Publicar em montagnedejade.org:** dois cliques em `publicar-montagne.bat` (exporta, monta a pasta da Vercel, abre o login na primeira vez, liga ao projeto portal-solar e publica). Trocar o site não precisa da Squarespace.
- [ ] **PS-35** · [P1 · **sua** · antes de 14/nov] **Renovar o domínio:** recuperar a conta da Squarespace (o e-mail antigo não abre). Sem isso, o montagnedejade.org pode sair do ar em 14/nov/2026; o montagnedejade.vercel.app continua.

## 11. Ideias grandes

- [x] **PS-34** · [P1] **O Portal a muitas mãos:** o bloco na entrada (o que fica, o que se faz junto), a página **Faça parte** (14 funções com um primeiro passo, a candidatura em .md) e a **Galeria de design** (as opções para experimentar, o sistema aberto com os tokens para o Figma, as propostas e 22 referências atemporais e futuristas). *(13/out)*
- [ ] **PS-36** · [P2 · grande] **O design do Figma, pixel a pixel:** você redesenha no Figma (importe os tokens da galeria pelo Tokens Studio) e eu implemento e comparo nas larguras de 1440 e 390. *Prompt:* "faz a PS-36 com este link do Figma: …"
- [ ] **PS-37** · [P2 · pequena · **sua**] **O canal das candidaturas:** um e-mail do projeto ou um link de formulário em `coletivo-config.js`.
- [ ] **PS-29** · [P3] **Escolher três agências** do estudo e levar uma ideia de cada uma (o "lockdown" do seu `Systems.md`).
- [ ] **PS-30** · [P3] **Fichário F2 a F4** (o plano em `Focos/O Fichário — Plano.md`).

## 12. Prompts prontos

- "faz a PS-02" · "faz a PS-08" · "faz a PS-09" · "faz a PS-18".
- "Abre o Portal na porta de teste e me mostra o Hoje e o Doar no celular."
- "Exporta o site público e me diz o que entrou e o que ficou de fora."

## 13. Registro

- 12/out/2026 · menu simétrico, Índice, luz, leitor, Leituras, cabeçalho do Atlas, notas de rodapé · vários arquivos (ver `respostas/083`)
- 13/out/2026 · protetor por cima da página, Doar, Caminho no Hoje, passagem entre páginas, referências de design e de código, estudo das 83 agências, exportação · idem
- 13/out/2026 · o Portal a muitas mãos (entrada, Faça parte, Galeria) e a pasta da Vercel pronta para o montagnedejade.org (PS-34, PS-28) · `respostas/084`
- 13/out/2026 · revisão com 45 correções; a ficha centrada com exemplos, a rede com fotos, as Leituras com a Estante (PS-31 a PS-33) · `eu.js`, `rede.js`, `rede.css`, `ficha.js`, `leituras.js`, `estante3d.js`
- 14/out/2026 · monocromático, Ajustes enxuto, o Almanaque de volta, o Clássico fora, o menu só texto e o menu de baixo (PS-38 a PS-44) · `tema.js`, `cores.css` (novo), `perfil.js`, `casca.css`, `galeria*.js`, `sistema.html`, `indice.js`, `tudo.js`, `testes/cores-auditoria.mjs` (novo) · `respostas/111`
- 21/out/2026 · o aviso emergencial e a estrutura da interface nova; o montagnedejade.org publicado (PS-45, PS-46, PS-28) · `aviso.js`, `aviso-dados.js` (novos), `perfil.js`, `casca.css`, `atlas.html`, `exportar.mjs`, `ESTRUTURA.md` e `estrutura/` (novos) · `respostas/114`
- 21/out/2026, à noite · Todas as áreas, A Luz, Projetos do Sol e o acabamento da casca; publicado (PS-48 a PS-51) · `campos*`, `iluminacao*`, `poema*`, `lib/agora*.{mjs,cjs}` (novos), `aviso.js`, `aviso-dados.js`, `casca.css`, `perfil.js`, `estatico.js`, `servir.mjs`, `exportar.mjs`, `vercel-montar.mjs`, `mapa-dados.js`, `estrutura/dados.mjs` · `respostas/115`

**Último número em uso: PS-51.**
