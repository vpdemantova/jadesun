# Solar — o sistema de design do Jadesun

> Desde 08/out/2026 (item 71 do `PERFIL.md`), o Jadesun tem o acabamento **Solar**: o topo de cada página tem a cor do céu de Campinas naquele minuto; o que importa vem em massas de jade; o conteúdo fica em cavaletes claros; a letra é brasileira. A versão viva está em **`sistema.html`**, montada com os CSS de verdade.

## 1. Por que mudou duas vezes no mesmo dia

**O Casa** (o de antes) nasceu para combinar com as cenas 3D. Nas páginas de leitura, virou o visual genérico de aplicativo feito por IA: vidro fosco, brilho dourado no fundo, pílulas em todo botão, fio colorido em cima de cada cartão.

**O Almanaque** (a primeira tentativa de 08/out) trocou isso por papel, fios e letra de máquina. Foi recusado, e com razão: ficou triste, brega e sem pegada no menu. O diagnóstico, depois de ler os artigos sobre "AI slop":
- a etiqueta em caixa-alta e monoespaçada em cima de cada título é justamente um dos tiques mais reconhecíveis de interface gerada por IA;
- o itálico decorativo e os colchetes `[ Tudo ]` imitavam uma referência (Poor Charlie's Almanack) sem ter a razão dela;
- tudo cinza e fino: sem cor em massa, sem nada que fosse do Jadesun;
- o menu era uma lista numerada sem peso, sem busca visível, sem o tempo.

Nada foi apagado: os dois continuam em Personalizar.

## 2. A ideia

O Jadesun é um lugar de estudo brasileiro, com um jardim que cresce e um céu que já existe no 3D. Em vez de copiar um site premiado, o Solar parte do que só ele tem:

1. **O céu de agora.** O tom do topo vem da altura real do sol sobre Campinas, com o mesmo motor (`ceu.js`) e a mesma paleta do Jardim. De manhã, ao meio-dia, no fim da tarde e à noite, a página não é a mesma.
2. **Um instrumento, não um papel de parede.** No Agora, o arco do sol de hoje: o horizonte com as horas, o caminho do nascer ao poente e onde o sol está agora. À noite, a Lua na fase vista daqui (hemisfério sul, lado aceso invertido).
3. **Jade em massa.** A cor vem em blocos sólidos, nunca salpicada: a capa do estudo do momento, o próximo passo, o botão principal.
4. **Cavaletes.** O conteúdo fica em superfícies claras, nítidas e opacas, em pé sobre o papel. Uma superfície por conteúdo, nunca caixa dentro de caixa.
5. **Duas vozes.** Gabarito para mostrar, Newsreader para ler. A letra de máquina só em código.
6. **O sol é o agora.** O laranja-sol marca a página atual, o progresso e o tempo; o jade marca o que se faz. As cores das matérias são dados.

## 3. As referências

| Referência | O que veio de lá |
|---|---|
| **Lina Bo Bardi, os cavaletes de cristal do MASP (1968)** · [Google Arts & Culture](https://artsandculture.google.com/story/picture-gallery-in-transformation-masp/1QVBD_ndqZAzLg?hl=en), [Stedelijk Studies](https://stedelijkstudies.com/journal/reenactment-lina-bo-bardis-display-sao-paulo-museum-art-1968-2015/), [Lina Bo Bardi's MASP](https://www.academia.edu/19879025/Lina_Bo_Bardis_MASP_Theoretical_and_Critical_Perspectives) | Cada obra em pé, sozinha, sobre um suporte neutro, sem parede e sem moldura: daí os cavaletes. |
| **Roberto Burle Marx** · [Wikipedia](https://en.wikipedia.org/wiki/Roberto_Burle_Marx), [Print](https://www.printmag.com/branding-identity-design/picasso-kiko-burle-marx/), [ASLA](https://www.asla.org/news-insights/dirt/lessons-from-roberto-burle-marx-how-to-design-resilient-urban-landscapes) | Cor em massa, em manchas grandes e de forma clara, e não em pontinhos. O verde-jade como planta, não como enfeite. |
| **Alexandre Wollner e o design concreto** · [AGI](https://a-g-i.org/user/alexandrewollner/), [Pesquisa Fapesp](https://revistapesquisa.fapesp.br/en/a-bridge-to-the-world/), [Unesp](https://repositorio.unesp.br/items/837598f6-6c12-4d61-8d5f-e09796b43f9b) | Uma grade só, marca geométrica (o símbolo: um quadrado de jade e o sol). |
| **Poesia concreta (Noigandres)** · [SciELO, Augusto de Campos](https://www.scielo.br/j/ars/a/hz8sNQ9wLYqBxxJwqdMK3Gs/?lang=pt), [The Art Story](https://theartstory.org/movement/concrete-poetry/history-and-concepts) | A palavra como objeto, na linhagem da Futura: a manchete do Agora é só o dia, grande. |
| **Massimo Vignelli** · [The Vignelli Canon (PDF, RIT)](https://www.rit.edu/vignellicenter/sites/rit.edu.vignellicenter/files/documents/The%20Vignelli%20Canon.pdf) | Poucas fontes, poucos tamanhos, escala com contraste: título forte e corpo calmo. |
| **Jan Tschichold** · [A Nova Tipografia (PDF)](https://openlab.citytech.cuny.edu/langecomd3504fa2019/files/2018/10/Tschichold_NewTypo.pdf), [Print](https://www.printmag.com/daily-heller/jan-tschichold/) | Composição assimétrica: a manchete à esquerda e o instrumento à direita. |
| **Robert Bringhurst** · [The Elements of Typographic Style](https://en.wikipedia.org/wiki/The_Elements_of_Typographic_Style) | Linha de leitura entre 60 e 72 caracteres; números tabulares nas contagens. |
| **Josef Albers** · [Interaction of Color](https://yalebooks.yale.edu/book/9780300179354/interaction-of-color/) | A cor é relativa: o jade de preencher (escuro) e o jade de texto (claro) são dois tokens no escuro, para não virar menta barata. |
| **Igloo Inc**, Site of the Year 2024 do Awwwards · [Awwwards](https://www.awwwards.com/sites/igloo-inc), [estudo de caso](https://www.awwwards.com/igloo-inc-case-study.html) | Interface por cima de uma cena: o HUD das páginas 3D. |
| **Artigos sobre "AI slop"** · [superdesign](https://superdesign.dev/blog/why-ai-design-looks-generic), [925 Studios](https://www.925studios.co/blog/ai-slop-design-tells), [Venngage](https://venngage.com/blog/ai-slop-in-design/) | A lista do que não fazer (seção 5). |
| **Menus premiados** · [Awwwards, menus](https://www.awwwards.com/websites/menu-vertical/), [Orpetron](https://orpetron.com/blog/10-award-winning-websites-redefining-navigation-with-creative-menus/) | Menu com peso: poucas palavras grandes, a página atual marcada por uma barra de sol, a busca visível como campo, e o tempo até a prova num anel. |

**A letra.** A [Gabarito](https://fonts.google.com/specimen/Gabarito) é uma geométrica de seis pesos feita no Brasil (Naipe Foundry, com Leandro Assis, Álvaro Franca e Felipe Casaprima) para uma plataforma de estudos on-line. O nome, para quem vai prestar vestibular, diz o resto. A Newsreader, que já estava no Jadesun, fica para o texto corrido.

## 4. Como está montado

```
perfil.css      a base e a aparência Clássico (intocada)
fino.css        a aparência Fino (os raios por token)
vidro.css       o acabamento Casa       → :root[data-acabamento="casa"]
almanaque.css   o acabamento Almanaque  → :root[data-acabamento="almanaque"]
solar.css       o acabamento Solar      → :root[data-acabamento="solar"]   ← o padrão
solar.js        o céu de agora e o arco do sol (só age no Solar)
sistema.html    a página viva do sistema
```

- **Cor** (claro / escuro): `--papel` #F3EFE6 / #0B1512 · `--cavalete` #FFFDF9 / #13201B · `--tinta` #14201B / #E5EEE8 · `--jade` #1B5A44 / #1D4A3B (preenchimento) · `--jade-t` (o jade de texto; #6CCB9F no escuro) · `--sinal` #E9822A / #F2A64A (o sol) · `--jade-claro`, `--sol-claro` (fundos). O céu: `--ceu-z` e `--ceu-h`, postos pelo `solar.js` a cada minuto, mais `data-sol` = dia | dourado | crepusculo | noite.
- **Tipo:** `--f-display` Gabarito (títulos, rótulos, botões, números) · Newsreader (corpo, linha-fina, o segundo verso da manchete em itálico). No Solar, `--f-mono` aponta para a Gabarito; só `code` e `pre` continuam monoespaçados.
- **Raio:** 12 px nos cavaletes, 8 px nos controles; `--raio-c` 50% para o que é círculo.
- **Topo:** a marca (quadrado de jade e sol), quatro destinos em 600/16 px com a barra de sol embaixo da página atual, o campo "Buscar em tudo" (Ctrl K), o anel dos dias até a prova, Personalizar e Tela cheia. No celular, a régua de baixo continua.
- **Escolha:** `tema.js` tem `acabamento: 'solar'` como padrão; a versão das preferências é `v: 4`. Quem estava no Casa ou no Almanaque passou uma vez para o Solar.
- **Emojis nos títulos dos estudos:** o `md.js` marca o emoji do começo do título com `<span class="md-emo">`, e o Solar e o Almanaque o escondem. O texto do caderno não foi tocado.

## 4b. As quatro portas, os botões e a ficha (08/out/2026, item 72)

**Navegação.** Quatro portas: **Atlas** (a entrada: o mundo e o planeta), **Hoje** (toda a organização pessoal), **Eu** (a ficha de pessoa) e **Casa** (a casa e o jardim em 3D). Cada porta tem a sua família na fileira de baixo do menu (`SUBNAVS` em `perfil.js`). O endereço `/` abre o Atlas. As páginas antigas continuam abrindo pelo endereço, e os links antigos do Eu (`#feitos`, `#docs`, `#numeros`…) levam à aba nova certa; `#domino` vai para `domino.html`.

**Hoje: tudo num lugar só** (`organizar.js`, `organizar.css`). Depois do estudo do momento e do roteiro: Meu dia (o mesmo componente do painel flutuante, com cronômetro), Prazos, Domínio por matéria, Para onde vou (os quatro eixos e os Objetivos) e Esperando você. A lista "Esperando você" é uma só (`Perfil.ESPERANDO`), lida também pelo menu Tudo. O anel dos dias leva ao painel. O jardim e o protetor descem para o fim, em "Para respirar".

**Atlas e o Planeta** (`atlas.js`, `atlas-inicio.css`, `planeta-dados.js`). As cinco medidas que mais pesam e doze aspectos da vida (comida, água, energia, ir e vir, roupas, coisas, lixo, corpo, mente, dinheiro, gente, voz e voto), com 49 hábitos para marcar (ficam no navegador, `planeta-habitos-v1`) e fatos com fonte:
- [IPCC AR6, Grupo III, cap. 5](https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/): 40–70% de corte possível pelo lado da demanda até 2050; bem-estar ganha 11 vezes mais do que perde.
- [Poore & Nemecek, Science 2018](https://www.science.org/doi/10.1126/science.aaq0216): carne e laticínios, 18% das calorias e ~83% das terras agrícolas.
- [SEEG](https://seeg.eco.br): desmatamento e agropecuária, 74% das emissões brutas do Brasil em 2023.
- [PNUMA, Food Waste Index 2024](https://www.unep.org/resources/publication/food-waste-index-report-2024): 1,05 bilhão de toneladas de comida desperdiçadas em 2022.
- [BEN 2025 (EPE)](https://eixos.com.br/energias-renovaveis/matriz-eletrica-fechou-2024-com-88-de-participacao-renovavel-mostra-balanco-da-epe/): 88,2% da eletricidade renovável em 2024.
- [Fundação Ellen MacArthur](https://www.circularonline.co.uk/news/one-truck-textiles-landfilled-burned-every-second-says-new-macarthur-report/), [OCDE](https://www.circularonline.co.uk/news/9-of-global-plastic-waste-is-recycled-while-22-is-mismanaged-oecd/), [Global E-waste Monitor 2024](https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx), [OMS 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/), [AASM](https://aasm.org/seven-or-more-hours-of-sleep-per-night-a-health-necessity-for-adults/), [SNIS via Agência Brasil](https://agenciabrasil.ebc.com.br/geral/noticia/2022-06/termina-hoje-prazo-para-municipios-informarem-dados-sobre-saneamento).

Para mudar um texto ou um hábito, mude `planeta-dados.js`; nada mais depende da redação. Se quiser, ele pode virar uma nota do caderno.

**Eu: a ficha de pessoa e a Rede** (`ficha.js`, `ficha.css`, `lib/vitrine.mjs`, `vitrine.html`). Segue a nota *A Rede da Vida* (`1 Villages/a Social/0 A Rede da Vida.md`): fichas em vez de perfis; sem feed, sem curtidas, sem seguidores; os elos são nomes com um porquê; a federação, por arquivos que viajam.
- **Abas:** Ficha · Coleção · Caminho (Feitos, Linha da vida, Obras) · Rede · Arquivos (números e documentos). O Domínio foi para o Hoje.
- **A ficha é um arquivo:** `Logboard/# Profile/Ficha.md` (`formato: ficha`, `tipo: pessoa`, nome, ofício, área, onde, visibilidade; seções Quem é, O caminho, A obra, A voz, Os elos). Só nasce quando você clica em "Criar a minha ficha".
- **O que sai:** só o que é público: a ficha com `visibilidade: publico`, e os itens da Coleção, Feitos e Pessoas marcados "público". Na sua aba Ficha, o que é só seu leva o selo "só você".
- **Compartilhar:** copiar o link (`vitrine.html`), baixar a ficha `.md` ou enviar pelo sistema. No site exportado, `api/vitrine.json` leva só o público.
- **Rede:** abrir a ficha de alguém por link (o servidor busca `api/vitrine.json`; links da rede local são recusados por segurança) ou por arquivo `.md`, e guardar como elo em `Pessoas.md`, com o porquê e o link.
- **Links:** a Coleção ganhou a prateleira **Links** (`d Recommendations/Links.md`), e todo item aceita um endereço.

**Botões e elementos v2** (fim do `solar.css`, seção 8): 44 px de altura e cantos de 12 px; o principal em jade com brilho no topo e sombra da própria cor (um jade mais claro no escuro, `--jade-botao`); sobe 1 px no hover e afunda ao apertar; foco visível (`--foco`); ações pequenas (`.opt`), filtros (`.chip`), botões de ícone do topo, campos de 46 px, `select` com seta própria, mensagens (`.msg`).

**O protetor de tela** (`protetor.css`, `protetor.html`, `protetor.js`): as cores e as letras dele estavam em `:root[data-pagina]`, mas quem tem `data-pagina` é o `<body>`; nada valia, e os controles saíam pretos sobre o preto. Agora: letra do Jadesun, relógio grande (com a data, os dias até a prova e as frases do caderno), modos num seletor, ajustes num painel, flores do tamanho da tela; parado, os controles somem e o relógio fica.

## 4c. A marca, os ícones, o movimento e o mundo inteiro integrado (08/out/2026, item 73)

**A marca.** O logotipo é a própria Gabarito, com o "ȷ" sem pingo e **o sol no lugar do pingo**: um pouco maior que um pingo comum, centrado na haste (medido na fonte: 0,15 em da origem) e com o mesmo respiro até a altura-x. O símbolo, para o favicon e o app, é o mesmo j desenhado só com retas e arcos de círculo, centralizado no centro óptico. Critérios de Paul Rand: distinto, visível em 16 px, adaptável, memorável. Arquivos: `icones.js` (`Icones.logotipo()`, `Icones.simbolo()`), `icone.svg`, `icone-192.png`, `icone-512.png`, `icone-maskable-512.png`.

**Os ícones** (`icones.js`, 74): grade de 24, área viva de 3 a 21; só retas a 0°, 45° e 90° e arcos de círculo; traço de 1,75 com pontas retas e cantos vivos; um sólido quando ajuda a ler. Referências: as grades de [Otl Aicher para Munique 1972](https://en.wikipedia.org/wiki/Otl_Aicher) e os princípios de [Susan Kare](https://www.aiga.org/membership-community/aiga-awards/2018-aiga-medalist-susan-kare) (a metáfora antes do enfeite; entendido e lembrado). Valem no menu, no Tudo, no protetor e nas cenas 3D.

**O movimento ("nascer")** (seção 9 do `solar.css`): a página que sai desce e esmaece; a que entra surge e o topo dela nasce em três tempos; o menu fica parado e o marcador de sol desliza de uma porta à outra, com mola (View Transitions entre páginas). Ao rolar, os blocos nascem em sequência. Personalizar, Meu dia, o menu Tudo, a folha e o Arrumar abrem com o mesmo gesto. Passar o mouse num link já prepara a página (Speculation Rules), e passar em Casa ou Jardim já baixa o motor 3D. Tudo respeita "reduzir movimento" (atenção: com essa opção ligada no Mac, o Jadesun fica calmo de propósito; Personalizar → Animações muda).

**A folha** (`Perfil.folha`): o conteúdo se abre num painel que sobe da direita (de baixo, no celular), nunca dentro da grade. É a regra que acabou com os cartões de alturas diferentes. **Toda grade de cartões tem linhas de altura igual**, rodapés presos embaixo e textos com linhas contadas.

**O mundo em 3D dentro do Jadesun** (`mundo.css`): o menu do Jadesun fica por cima das cenas, em vidro, e a cena ocupa a tela por baixo (camadas). A Casa e o Jardim usam a mesma moldura; a navegação de dentro da Casa (Casa · Estante · Guarda-roupa · as portas) tem o desenho das abas do app; as barras e os painéis das cenas usam o vidro do Solar (claro ou escuro, conforme o tema), a Gabarito, o jade e o sol. Enquanto a cena monta, o símbolo com o sol nascendo, na cor da cena.

**O Atlas da Terra** (a home: `atlas.js`, `atlas-inicio.css`):
- **A Terra, agora** (`terra.js`, `terra-dados.js`): o mapa na projeção [Equal Earth](https://en.wikipedia.org/wiki/Equal_Earth_projection), com dados do [Natural Earth](https://www.naturalearthdata.com) (domínio público); a noite calculada pixel a pixel com o sol deste minuto (o mesmo `ceu.js` do Jardim e do Hoje); o crepúsculo; as 243 maiores cidades acendendo do lado escuro; o sol a pino, a Lua e você. Ao abrir, a Terra gira até a hora certa. Uma frase diz quantas cidades estão de noite e onde o sol está a pino.
- **O mapa da humanidade** (`humanidade.js`, `humanidade-dados.js`): as dez partes do saber do [Círculo do Saber da Propædia](https://en.wikipedia.org/wiki/Prop%C3%A6dia) (Britannica, 1974), desenhadas como a [rosa de Florence Nightingale](https://en.wikipedia.org/wiki/Pie_chart#Polar_area_diagram) (1858): a área de cada fatia é o número de fichas; os anéis, as eras; os pontos, os eventos. Toque numa parte e ela abre numa folha com as seções e os eventos.
- **O planeta**, **a linha do tempo**, **o que existe** (capas da Seleção e um índice de livro para o resto) e **o próximo tijolo**.

**A Rede da Vida** (aba Rede do Eu, `eu.js`, `ficha.css`): a sua carta (63 × 88 mm, vira ao toque, com o QR code da sua página no verso; baixa como imagem PNG para trocar no mundo real); a sua mesa (os elos como cartas em leque, cada um com o porquê); receber uma carta (link ou `.md`); e **quem já foi**: as 167 pessoas do seu Atlas, uma carta de cada vez, para fazer elos com elas também (a sua nota: "uma rede da vida não separa quem está vivo de quem já foi").

**Arrumar** (`arrumar.js`): o botão no topo (só onde há seções) recolhe a página em faixas; arraste pela alça, use as setas ou o olho para esconder. "Pronto" guarda (neste navegador, por página), "Voltar ao original" apaga, "Cancelar" desfaz. Vale no Atlas e no Hoje; outras páginas entram marcando as seções com `data-secao` e `data-rotulo`.

**O mapa de cada matéria** (`area.js`): atalhos por unidade, um minimapa com a janela do que está visível (clique ou arraste), arrastar o fundo do quadro para mover, e o caminho no topo (Hoje › Domínio › a matéria).

## 4d. Portal Solar: o Quadrado, o mapa geral, o Portal, a Curadoria (09/out/2026, item 74)

**O nome e a marca.** O app passou a se chamar **Portal Solar** (títulos, menu, manifest, cartão, protetor, exportação). A marca é o **Quadrado Negro** de [Kazimir Malevich](https://en.wikipedia.org/wiki/Black_Square_(painting)) (1915), "o ponto zero da pintura", pendurado no canto dos ícones da exposição 0,10. É um quadrado porque é um manifesto: sem mascote nem marca registrada. A cor é a da tinta (negro no claro, branco no escuro) e muda em Personalizar → Marca: o Quadrado Vermelho (1915), o Branco sobre Branco (1918), a cor do sol ou o jade (`data-marca` no `<html>`; as três formas moram no mesmo SVG, `Icones.quadrado()`). O logotipo é o quadrado + "Portal Solar" na Gabarito, em HTML (`Icones.logotipo()`). O ícone do app é o quadrado num campo de papel, como a tela. As chaves antigas do `localStorage` (`jadesun-*`) ficaram como estavam, para ninguém perder o que já marcou.

**O Domínio, o mapa geral** (`dominio.js`, `dominio.css`, `lib/dominio.mjs`): matéria → unidade → estudo → subtópico → item da prova, em **seis vistas** (Mapa, Índice, Mosaico, Linhas, Constelação, Sol) e três profundidades (só estudos, + subtópicos, + itens), com filtros (situação, ★★★, "cai na prova", busca sem acento, matérias). Os subtópicos se marcam num arquivo novo do caderno, `Logboard/# Board/Focos/Domínio — conceitos.md` (texto simples; o Checklist não muda); os itens, no Checklist, como sempre. Um estudo está dominado quando todos os seus subtópicos e itens estão marcados. O **menu fixo das matérias** é o mesmo no Domínio (passa pelas matérias e acende a da tela) e nas Áreas (troca de área, volta ao mapa geral e abre "Marcar domínios"); o painel de cada estudo na Área também marca. `/api/areas?mapa=1` devolve só o esqueleto (233 KB em vez de 1,2 MB).

**O Portal** (`portal.js`, `portal.css`, carregados só quando pedidos): um botão, o Círculo Negro (a tecla O), comprime a tela de agora numa esfera e a põe no sistema do Portal Solar: o Sol é o Quadrado (o Manifesto); os planetas, as portas (Hoje, Eu, Casa, Atlas, de perto para longe); as luas, as páginas de dentro (vêm de `Perfil.lugares()`, o mesmo mapa do menu). Três dimensões: **Plano**, **Órbita** e **Esfera**; arrastar gira o plano, rolar ou pinçar aproxima. Tocar num mundo faz ele crescer e a página nova nascer do mesmo ponto (transição entre páginas do tipo "portal", com `pagereveal` no `tema.js`).

**A Curadoria** (`curadoria.html`, `curadoria-dados.js`, `lib/curadoria.mjs`): toda escolha **assinada** (a ficha do curador), **datada**, **com fontes** e **sem dono escondido**. A nº 1, *A praça, o pavão e o éter*, abre com o texto do Vitor e passa pela Praça do Teatro (Bolshoi), pela Sala do Pavão (Whistler, Leyland, Freer), pelas Bachianas e a Semana de 22, e pela Capela Rothko; um glossário de 42 palavras (área, sentimento, livros, vizinhas), a linha do tempo que se expande onde a história se adensa e as ramificações num círculo. "Levar para o caderno" grava o post em `1 Villages/a Social/d. Curadoria/Posts/` (nunca sobrescreve); os posts que morarem lá aparecem na lista.

**Os Guias** (`guias.html`, `guias-dados.js`, `lib/guias.mjs`): o instante (o que ler, estudar, ouvir e um livro, conforme a hora), o mundo agora (22 fontes por RSS, cada uma com o porquê; só a data ordena; cópia em `dados/guias-cache.json` para quando faltar internet), os livros por necessidade, os 17 ODS e os caminhos pela plataforma.

**A porta do Manifesto** (`manifesto.html`, `manifestos.html`, `filosofia.html`, `manifesto-dados.js`, `movimento.css`): o rascunho do Manifesto do Portal Solar montado das notas dele (as propostas vêm marcadas; o b Studio ficou de fora), que vai para o caderno com um clique e passa a ser lido de lá; 48 manifestos da humanidade por século; e a filosofia local-first com as leituras.

**A Conta** (`entrar.html`, `conta.js`, `lib/contas.mjs`): a chave da casa, não o cofre. Senha guardada só como resumo **scrypt** em `dados/contas.json` (fora do caderno); sessão em cookie HttpOnly + SameSite=Lax (no disco, só o sha256 do token); 10 tentativas erradas por IP em 10 minutos; GitHub e Google (OAuth 2.0 com `state`, e PKCE no Google) prontos e desligados até existir `dados/provedores.json`. No modo celular, entrar com a senha vale como o código do QR.

**A ficha e o cartão** (`cartao-visita.js`, `eu.js`, `vitrine.html`): criar a ficha em cinco passos, com o cartão se montando ao lado; o cartão de visita (frente com a voz, verso com o QR do convite); o link com `?convite=1` mostra a quem chega as boas-vindas, quem convidou, o que é o Portal Solar e o movimento, e um "faça a sua" que vira um `.md` (o rascunho fica no navegador da pessoa).

**A Casa em 3D** (`casa3d-paisagem.js` e ajustes): o céu virou cúpula (zênite, horizonte e o brilho do sol na direção da luz de verdade); o chão tem manchas naturais por vértice; em volta, árvores, arbustos e tufos (instanciados, sempre os mesmos para a mesma casa); a calçada de concreto ancora a casa; o topo das paredes cortadas é o "poché" escuro das maquetes; a cama e o tapete foram refeitos; a madeira procedural perdeu as manchas de "camuflagem". E os menus da Casa rolam: a rolagem suave (Lenis) não roda mais nas cenas 3D e, nas outras páginas, deixa cada caixa rolar por conta própria.

## 4e. A forma: uma régua para tudo (09/out/2026, item 75)

"Existem muitos elementos, muitas coisas que abrem: tenha certeza de que todas sigam um sistema de design, grids, proporções." A auditoria daquele dia contou mais de vinte medidas de canto diferentes, 117 sombras e camadas de 1 a 2000, sem escala. O `forma.css` é a resposta: **carrega por último em todas as páginas** e guarda só as proporções (a cor continua vindo do tema).

| Medida | A escala | Onde |
|---|---|---|
| espaço | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 (`--e-1` a `--e-9`) | base 4, ritmo de 8 |
| canto | 6 · 10 · 14 · 18 · 26 · pílula (`--r-1` a `--r-5`, `--r-pilula`) | o canto cresce com a peça: chip = pílula; controle de 40 px = 10; cartão = 14; painel e folha = 18; bloco grande = 26 |
| altura | 32 · 40 · 48 (`--h-p`, `--h-m`, `--h-g`) | chip; botão, campo e ícone; botão grande |
| sombra | `--s-1` parado · `--s-2` erguido · `--s-3` balão e aviso · `--s-4` folha e janela | luz de cima, sombra quente |
| camada | presa 50 · barra 60 · abas 80 · balão 300 · véu 900 · folha 901 · janela 940 · aviso 960 · Portal 2000 | `--z-*` |
| tempo | 120 · 200 · 320 · 480 ms, e uma curva só para entrar (`--curva`) | `--t-1` a `--t-4` |

**As peças:** botão (40 px, canto 10; primário em jade chapado, secundário de linha, leve só texto), botão de ícone (40 × 40, sem caixa até passar o mouse), chip (pílula de 32 px; ligado = tinta cheia), campo (44 px, canto 10, anel de foco jade), cartão (canto 14, linha fina, chapado), etiqueta (sem caixa-alta, sem mono). **O foco** é um anel só, e só no teclado.

**As camadas que abrem** têm um desenho só: o mesmo véu; a **folha** lateral (canto 18, margem 12; no celular vem de baixo, com a alça); o mesmo cabeçalho (etiqueta, título, fechar); **um botão de fechar** para todas (`.folha-x`, `.pers-x`, `.tudo-x`, `.jd-x`). Personalizar e Meu dia viraram folhas iguais às outras; o Tudo é a **janela** (canto 26; no celular, a tela inteira, com o fechar à vista); o **aviso** fica embaixo, acima das abas do celular.

**A barra do alto:** busca, os dias até a prova e, depois de um fio, os ícones numa família só (o caderno de notas, o Portal, o Arrumar, o Personalizar), sem as caixas brancas de antes; o protetor de tela mudou para o Personalizar. No celular estreito, o Arrumar sai da barra (é gesto de computador) e as abas que rolam de lado esmaecem na borda.

**O que saiu:** o bloco "Botões v2" do `solar.css` (gradiente com brilho, sombra em todo chip, caixas nos ícones) e 176 cantos escritos à mão em 15 arquivos, trocados pelos da régua. Os nomes antigos (`--r`, `--raio`, `--raio-p`, `--pg-r`, `--ar-r`, `--sombra`) passaram a apontar para a régua, então o que já os usava se alinhou sozinho.

**Para ajustar ao vivo:** a skill **/tweak** (em `~/.claude/skills/tweak/`) põe um painel no navegador que acha estas medidas, deixa mexer em tudo (e em bloco), e escreve o resultado de volta no CSS, com cópia.

## 5. O que não fazer

| Não | Sim |
|---|---|
| vidro fosco, brilho radial, sombra borrada | cavaletes opacos e nítidos sobre o papel |
| etiqueta em caixa-alta em cima de cada título | título forte e linha-fina |
| legenda em letra de máquina por toda parte | duas vozes: Gabarito e Newsreader |
| caixa dentro de caixa | uma superfície por conteúdo |
| cor salpicada em fios e bolinhas | cor em massa (jade) onde importa |
| degradê decorativo | o céu de agora: o tom vem do sol real |
| emoji como marcador de seção | número e título |

## 6. Para voltar atrás

- **Um clique:** Personalizar → Acabamento → Almanaque, Casa ou Simples. A aparência Clássico continua lá.
- **Os arquivos de antes do dia 08/out:** `dados/versao-2026-10-08-antes-do-almanaque/` (39 arquivos: CSS, HTML, `tema.js`, `perfil.js`, `exportar.mjs`).
- **Os arquivos de antes desta rodada (marca, ícones, mundo 3D, Atlas da Terra, Rede, Arrumar):** `dados/versao-2026-10-08-antes-da-terra/` (109 arquivos, com `lib/`).
- **Os arquivos de antes do Portal Solar (item 74):** `dados/versao-2026-10-09-antes-do-portal/` (125 arquivos, com `lib/`). Para voltar o nome e a marca antigos, basta copiar de lá o `icones.js`, o `perfil.js`, o `perfil.css` e os ícones `icone*`.
- **Os arquivos de antes das quatro portas:** `dados/versao-2026-10-08-antes-da-reorganizacao/` (97 arquivos: todos os HTML, CSS, JS e `.mjs` da raiz). Para voltar a navegação antiga, basta copiar de lá o `perfil.js`, o `servir.mjs` (a raiz `/`) e o `eu.js`/`eu.html`.
- **Os arquivos de antes do sim (item 75: a forma, as revoluções, o caderno de notas, os dados):** `dados/versao-2026-10-09-antes-do-sim/` (140 arquivos, com `lib/`); o `solar.css` de antes de tirar os Botões v2 está lá como `solar.css.antes-da-forma`. Para tirar a forma inteira, apague a linha `forma.css` dos HTML.
- **Tirar o Solar de vez:** apague as linhas `solar.css` e `solar.js` dos HTML, tire os dois das listas do `exportar.mjs` e mude o padrão em `tema.js`. O `agora.js` só chama o arco se o `solar.js` existir.

## 7. O que ainda dá para melhorar

**Visual**
1. **Fontes no próprio computador.** Sem internet, a Gabarito e a Newsreader caem para as do sistema. O `exportar.mjs` já baixa as fontes para o site estático; falta fazer o mesmo no app.
2. **Ícones próprios** para a régua do celular, no traço da Gabarito.
3. **As cenas 3D:** o HUD por cima do Jardim e da Casa ainda é o vidro escuro; dá para levá-lo ao jade.
4. **Álbum e Protetor de tela** têm desenho próprio, de antes, e ficaram fora.
5. **Movimento:** o sol andando no arco ao abrir o Agora; transições entre páginas.

**Funcional**
1. **Guardar e sincronizar** (o mais urgente): nada disto foi commitado, e há duas cópias do Jadesun (Mac e Windows).
2. **Uma busca só:** o Tudo poderia substituir as buscas do Atlas e da Biblioteca.
3. **Os filtros do Domino na URL.**
4. **`/api/areas` em cache.**
5. **Um teste de fumaça no repositório** (as fotos e a checagem de erros que usei vivem fora do projeto).

## 8. Como conferir

- Abra `sistema.html` no claro e no escuro.
- Para ver outra hora do dia no arco: `hoje.html?hora=06:30`, `?hora=17:50`, `?hora=22:00`.
- Em Personalizar, troque o acabamento e veja o mesmo conteúdo nas quatro vozes.
