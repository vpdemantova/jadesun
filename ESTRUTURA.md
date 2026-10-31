# A estrutura do Portal Solar: a interface nova

> Para o Figma e para refazer tudo. 21/out/2026 (registro 114).
> As partes marcadas *gerado* saem de `estrutura/dados.mjs` pelo `node estrutura/gerar.mjs`: mude lá, rode o gerador, e este arquivo e os desenhos do Figma mudam juntos. O resto é escrito à mão.
> Os arquivos para arrastar no Figma estão em **`estrutura/figma/`** (seção 11).

## 0. Em uma página

- O Portal Solar é **uma lente sobre uma pasta de arquivos** `.md`. Desligue-o e tudo continua lá, legível em qualquer editor.
- Só há **duas espécies de página**: o **arquivo** (qualquer `.md`, no endereço do seu caminho) e a **lente** (uma vista sobre muitos arquivos). Não existe terceira: o Hoje é uma lente sobre as tarefas, o Atlas uma lente sobre as fichas, a Casa uma lente sobre os cômodos.
- **Oito lentes**: corrido, lista, grade, tábua, tempo, mapa, rede, espaço. O **corrido** está em toda parte: é a lente desligada, o arquivo como ele é.
- **Oito portas**, quatro de cada lado do Quadrado: **Manifesto · Obras · Guias · Atlas ■ Hoje · Caderno · Eu · Casa**. Eram dez; nenhuma página se perdeu (seção 5).
- **Quinze moldes** de tela cobrem o site inteiro (seção 7).
- **Todos os produtos entram no hub** por três degraus: **ficha → casca → motor** (seção 10).
- **Minimalista**: monocromático, texto corrido, menus só com palavras, efeito só no gesto.
- **A interface é a instrução** (registro 117): nenhuma frase ensina a usar a tela; três formas, três gestos, em todo lugar: **■ o todo**, **● a volta**, **✚ o que abre ali mesmo** (seção 1, lei 15).

## 1. As leis (o que não muda)

1. **O acervo é a verdade.** Os arquivos no disco são a obra; toda interface é acessório e pode ser jogada fora sem perda.
2. **Números são de todos, letras são de cada um.** Estantes `0` a `3`, a ordem acordada; `A` a `C`, livres.
3. **A ficha universal é uma ficha vazia.** Cada tipo de coisa pede os poucos campos que tem.
4. **A pasta é a arrumação; o cabeçalho é a verdade.** A lente corta pelo que o arquivo declara, não pelo lugar onde está.
5. **O disco manda.** Renomear é sempre legítimo; o programa aprende o nome novo.
6. **Os três são um.** Site, Portátil e Aplicativo mudam juntos; a lógica mora no motor.
7. **Uma lista mora num lugar só.** Escrita duas vezes, já divergiu.
8. **O corrido é sagrado.** Sempre existe o talhe que mostra o arquivo como ele é: a prova de que a interface não inventa.
9. **Monocromático.** Tinta e papel num tom só; o destaque é a própria tinta. As cores vivas ficam nas cenas 3D.
10. **Uma régua.** Espaço de 4 em 4, cinco cantos, três alturas, quatro tempos (`forma.css`). Nenhuma medida escrita à mão.
11. **O que abre numa grade é folha**, nunca dentro dela; numa lista ou num índice, abre ali mesmo, com a cruz. Grades com linhas de altura igual. Painel com várias vistas não muda de tamanho: o conteúdo rola por dentro.
12. **Menus com palavras.** O Quadrado Negro é a única marca e o único desenho do menu.
13. **Efeito só no gesto.** Em repouso nada se mexe; a página que chega se compõe uma vez, e para.
14. **Nada inventado.** A fonte ao lado de cada frase; link novo só depois de aberto; toda escolha assinada e datada.
15. **A interface é a instrução** (registro 117). Nenhuma frase ensina a usar a tela (nada de "toque", "clique", "escolha"): a forma diz. Três formas, as do Suprematismo de Malevich, e cada uma é um gesto em todo o Portal: o **quadrado** é o todo (o Índice); o **círculo** é a volta (para onde se estava, no mesmo ponto); a **cruz** é o que abre ali mesmo (girada, o fechar). A regra antiga por trás: a taça de cristal de Beatrice Warde (1930), a impressão que não se nota.
16. **Toda ida deixa a volta.** Entrar numa página, numa matéria ou numa ficha acrescenta uma conta ao fio da visita; a bola de onde se veio fica no alto (no topo do índice do todo, nas telas largas).

## 2. Local-first: onde cada coisa mora

| Camada | O que é | Onde mora |
|---|---|---|
| **O acervo** | a pasta de `.md`: estantes `0` a `3` (de todos) e `A` a `C` (de cada um) | no disco de quem usa, sincronizada como a pessoa quiser (git, Syncthing, nuvem, pen drive) |
| **O motor** | lógica pura: ler, ligar, buscar, as lentes, exportar | código sem disco e sem rede, que roda em qualquer lugar |
| **As portas** | quem entrega os bytes: `node` (servidor), `navegador` (File System Access), `opfs` (celular), `tauri` (mesa e Android) | uma por aparelho; ganhar um aparelho é escrever uma porta |
| **Os corpos** | o site, o Portátil (PWA), o Aplicativo (mesa e APK), o papel (HTML e PDF) | o mesmo programa em quatro roupas |
| **As preferências** | a lente, a cor, a área escolhida, os hábitos marcados | no aparelho (`localStorage`), nunca no acervo |
| **A conta** | a chave da casa, não o cofre; só para abrir a casa pela rede | resumo scrypt, fora do acervo |
| **A conta do site** | entrar com o Google no site público: o nome e o retrato, e a chave do Drive da pessoa (registro 119) | o nome no aparelho; a cópia no Drive de cada um; no Portal, nada |
| **O público** | as estantes `0` a `3` e o que estiver com `visibilidade: publico` | o site estático (montagnedejade.org) |

- **Sem internet, tudo abre.** Cópia offline (service worker), letras locais.
- **Sem conta, tudo funciona.** A conta da casa só serve para entrar na casa de longe; a do site, para levar o que é seu de um aparelho a outro (pelo seu Drive).
- **Sincronizar é da pasta, não do app.** O Portal não prende ninguém: a pasta vai com a pessoa.
- **Compartilhar é mandar um arquivo**: a ficha `.md`, o cartão, o zip. A rede é feita de arquivos que viajam.
- **O que ainda é código vira arquivo.** Hoje as fontes do Aviso e do Guias moram em `aviso-dados.js` e `guias-dados.js`; na interface nova elas viram notas do acervo (estante `1 Villages`), como tudo o mais.

### A conta do site e a rede oficial: o plano em cinco fases (25/out/2026, registro 119)

> O pedido: "já planeje ou faça o login com google pra rede social oficial! e integre as funções do offline ao online pouco a pouco!"

A regra que não muda: **a conta é chave, não cofre**. O que é de cada pessoa mora no aparelho dela e, se ela quiser, no Drive dela. O Portal só guarda o que alguém publicou de propósito.

| Fase | O quê | Onde mora | Estado |
|---|---|---|---|
| 1 | **As funções da casa no site, uma por vez.** A primeira é a Nota (tecla N): as mesmas rotas da casa, respondidas pelo próprio navegador (`estatico.js`); baixar uma nota, baixar todas num `.zip` (as pastas inteiras, prontas para o Obsidian), trazer `.md` do computador. | o navegador (`portal-notas`) | **feito** (25/out) |
| 2 | **Entrar com o Google** (Google Identity Services, o botão do próprio Google). O nome e o retrato ficam só no aparelho; não há servidor de contas. | o navegador | **pronto**, desligado até o Client ID |
| 3 | **O seu Drive.** Uma chave na folha da conta: as notas, os lugares, as leituras e a ficha vão para a pasta escondida do Drive da pessoa (`appDataFolder`, escopo `drive.appdata`, que só este site abre) e voltam em outro aparelho. Mudou de um lado só, vale esse lado; a mesma nota mudada nos dois vira duas ("outra versão"); o que foi apagado não volta. O que desce do Drive entra no começo da página seguinte, antes de qualquer parte ler o aparelho. `nuvem.js`; as regras de juntar em `testes/nuvem.mjs`. | o Drive de cada pessoa | **pronto**, desligado até o Client ID |
| 4 | **A rede oficial.** "Publicar a minha ficha": a ficha pública (o cartão: nome, frase, o que estuda, a coleção marcada pública) e os elos, cada um com o porquê. Uma página **A rede**: botões em cima (as áreas, os interesses), embaixo quem está nelas. Sem feed, sem curtidas, sem número de seguidores, sem anúncio, sem algoritmo: a ordem é a da área e a do tempo. Convite pelo QR do cartão; denunciar e tirar; apagar a própria ficha a qualquer hora. | um registro pequeno, só com o que foi publicado (nunca notas nem leituras); uma função da Vercel confere a credencial do Google pelas chaves públicas dele a cada publicação | a decidir: onde fica o registro |
| 5 | **O caderno inteiro no site.** Hoje, Domínio, Eu e Casa lendo a pasta de `.md` da pessoa: no computador pela File System Access, no celular pelo Drive (`drive.file`, a pasta que ela escolher). O mesmo programa da casa, sem servidor. | os arquivos da pessoa | depois da fase 4 |

**A ordem das funções que sobem (fase 1, pouco a pouco):** a Nota (feito) → as marcas do Domínio e do Checklist (já funcionam no navegador, no site privado) → a ficha do Eu (o "Faça a sua" do cartão já existe e vira a ficha da rede) → a Casa 3D (a estante e o guarda-roupa já guardam no navegador) → o Hoje (pede o caderno, fase 5).

**Ligar o Google (a parte que é sua, uma vez):**
1. [console.cloud.google.com](https://console.cloud.google.com): um projeto novo, "Portal Solar".
2. APIs e serviços → Biblioteca → **Google Drive API** → Ativar.
3. Google Auth Platform → **Branding**: o nome "Portal Solar", o seu e-mail de suporte, o domínio `montagnedejade.org`. **Público**: Externo, e **Publicar o app** (sai do modo de teste). **Acesso a dados**: o escopo `https://www.googleapis.com/auth/drive.appdata` (não sensível: não pede verificação).
4. **Clientes** → Criar cliente → Aplicativo da Web → **Origens JavaScript autorizadas**: `https://montagnedejade.org`, `https://www.montagnedejade.org`, `https://montaignedejade.org`, `https://www.montaignedejade.org`, `https://montagnedejade.vercel.app`, `http://localhost`, `http://localhost:5051`.
5. Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`) e mande. Ele é público (aparece na página); o "segredo do cliente" não é usado e não deve ser mandado. Ele entra em `publicar.json` (`"google"`), e a exportação seguinte liga a conta no site.

## 3. O conteúdo: estantes, formatos e tipos

| | Estante | De quem | O que guarda |
|---|---|---|---|
| `0` | Fundação | de todos | os documentos que explicam o todo |
| `1` | Villages | de todos | o convívio: urgências, notícias, causas, a rede das pessoas |
| `2` | Academy | de todos | o ensino: a base científica, as aulas, os guias, as línguas |
| `3` | Atlas | de todos | a cartografia: uma ficha por coisa que existe |
| `A` | Profile | de cada um | quem a pessoa é: a ficha, o calendário, os cadernos |
| `B` | Work | de cada um | a obra: projetos, textos, música, os produtos |
| `C` | Logs | de cada um | o tempo vivido: registros, notas, lugares |

- **O endereço é o caminho.** `3 Atlas/3 People/Cecilia Payne.md` abre em `/3-atlas/3-people/cecilia-payne`. Não há endereço inventado.
- **O formato é o traje** (`formato:` no cabeçalho): `ficha` (tábua de dados), `wiki` (índice das seções), `manual` (passos), `livro` (recuo e capitular), `publicacao` (autor e data), `atlas` (tábua e índice), `casa` (a porta de uma estante), `foco` (um grupo de páginas que abre de uma vez). Sem formato, prosa simples.
- **O tipo é a natureza** (`tipo:`): pessoa, lugar, elemento, obra, instituição, grupo, acontecimento. Cada um com os poucos campos que tem; a tábua se monta com o que houver.
- **Os elos** são `[[nomes]]` dentro do texto, com o porquê ao lado. Quem cita quem sai sozinho da leitura de todos os arquivos.

## 4. As lentes

Uma lente muda o olhar, nunca a coisa. Ela se escolhe no aparelho e não grava nada no acervo. Toda coleção tem a **barra da lente** no alto; toda página tem **vestida · corrido**; a tecla **L** desliga a lente da página inteira.

<!-- gerado:lentes -->
| Lente | O que mostra | Para quê | Vale em | Precisa nos arquivos | De onde vem hoje |
|---|---|---|---|---|---|
| **corrido** | o arquivo como ele é, só texto | ler; a prova de que a interface não inventa | toda página e toda coleção | nada | interface (LENTE_*), "a lente desligada" |
| **lista** | uma coisa por linha, densa | percorrer muitas | coleções, Índice, menus | um nome | Galeria, Índice (lista), Domínio (Índice) |
| **grade** | blocos lado a lado, com retrato | comparar de relance | coleções, Obras, Eu | retrato (opcional) | Fichas, Galeria, Domínio (Mosaico) |
| **tábua** | colunas alinhadas, campo a campo | comparar dados | coleções, Dados, ficha | campos no cabeçalho | Dados da Terra, a tábua da ficha |
| **tempo** | a data à margem, em ordem de nascimento | ver quando | coleções, revoluções, Caderno | data, nascimento, ano | Quando, linha das revoluções, Domínio (Linhas) |
| **mapa** | onde: o globo, o mapa do saber, o mapa da matéria | ver onde e quanto | Atlas, Terra agora, Domínio, Museus | onde/coordenadas ou área | Terra agora, rosa da Propædia, Domínio (Mapa, Sol) |
| **rede** | os elos, em constelação | ver o que se liga | ficha, Eu, Domínio, Índice | [[elos]] e quem cita | Rede da Vida, Domínio (Constelação) |
| **espaço** | em 3D, como um lugar | morar, guardar, passear | Casa, estante, esfera do Índice | nada (a casa é desenhada) | Casa, Jardim, Estante, Guarda-roupa, o Portal (esfera) |

A lente da página (um arquivo só): **vestida** (o traje do formato: ficha, wiki, manual, livro, publicação, atlas, casa) · **corrido** (só o que está escrito, nada mais).
<!-- /gerado:lentes -->

**As vistas de hoje viram lentes.** As seis do Domínio (Mapa, Índice, Mosaico, Linhas, Constelação, Sol) são mapa, lista, grade, tempo, rede e mapa; as do Índice (lista, mapa, esfera) são lista, mapa e espaço; as da Galeria do motor (grade, tempo, lista, tábua, corrido) já são lentes. Uma vista nova só nasce se nenhuma das oito der conta.

## 5. O mapa do site

O Quadrado no centro; **o Mundo** (o que é de todos) à esquerda, **Você** (o que é seu) à direita; nas pontas, o porquê (Manifesto) e o lar (Casa). A ordem no menu vai de fora para dentro.

**De dez portas para oito.** Fichas, Quando e Dados viram lentes do **Atlas**; a Curadoria e o Aviso entram nos **Guias**; o Domínio entra no **Hoje**; as Leituras e as notas formam o **Caderno** (nova); os produtos e os sites pessoais ganham as **Obras** (nova). Nenhuma página some: a coluna "De onde vem hoje" diz para onde foi cada uma.

<!-- gerado:mapa -->
**O Quadrado** (o centro): o Índice de tudo: busca, as portas e as páginas, nas lentes lista, mapa e espaço (a esfera). Gesto: clique ou M; segurar abre a esfera (O). Hoje: Índice (indice.js), o Portal (portal.js).

### O Mundo · estantes 0 a 3, de todos · vai ao site público

#### Manifesto · Por quê?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **O Manifesto** | o porquê do Portal Solar, contra marcas e falsidades | corrido | Página (um arquivo) | manifesto.html |
| **Os manifestos** | os da humanidade, de Lutero ao local-first | tempo · lista · corrido | Coleção | manifestos.html |
| **Os créditos** | quem fez, a gramática, as fontes, as letras, as bibliotecas, a licença e o caminho para doar (registro 117) | corrido | Página (um arquivo) | creditos.html |
| **Doar** | as causas primeiro; no fim, o caminho para sustentar esta obra | mapa · lista | Coleção | doar.html (público desde o registro 117) |
| **A filosofia** | os seus arquivos, a sua casa (local-first) | corrido | Página (um arquivo) | filosofia.html |
| **Faça parte** | as funções, o primeiro passo e a candidatura em .md | lista · corrido | Porta | participe.html |
| **O sistema** | o desenho aberto: tokens, letras, régua, propostas | grade · corrido | Coleção | sistema.html, galeria.html |

#### Obras (nova) · O que fazemos?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **As obras** | os produtos e os mundos feitos sobre o Portal, cada um com a sua ficha | grade · lista · tempo · corrido | Coleção | nova (os repositórios de ~/www) |
| **Uma obra** | o que é, quem fez, o estado, abrir aqui ou à parte | vestida · corrido | Obra (um produto no hub) | nova |
| **As vitrines** | a ficha pública de cada pessoa, como revista ou galeria | grade · corrido | Vitrine (a ficha pública de uma pessoa) | vitrine.html e os sites pessoais |

#### Guias · O que importa agora?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **Agora** | o instante, o mundo agora, as causas, os avanços, as tecnologias, as tendências | lista · tempo · corrido | Porta | guias.html e o aviso (aviso-dados.js) |
| **Todas as áreas** | as 40 áreas (UNESCO e três caminhos): subáreas, nichos, fontes, vagas e comunidades; os dez minutos do dia | lista · mapa · corrido | Coleção | campos.html (registro 115); o aviso lê daqui |
| **Curadoria** | escolhas assinadas, datadas, com fontes; o glossário | corrido · rede · tempo | Leitor | curadoria.html |
| **Livros por necessidade** | os especiais, com o porquê | lista · grade · corrido | Coleção | guias.html#livros |
| **As causas** | os 17 ODS e onde ajudar (Doar) | lista · tábua · corrido | Coleção | guias.html#necessidades, doar.html |

#### Atlas · O que existe?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **As fichas** | tudo o que existe: pessoas, obras, lugares, elementos, eventos | todas as lentes | Coleção | biblioteca.html (nove grupos, do átomo à obra, um botão cada: #g=…; registro 119) |
| **Uma ficha** | o arquivo vestido: retrato, tábua, texto, fontes, elos | vestida · corrido · rede | Página (um arquivo) | biblioteca.html#f=…, interface […caminho] |
| **A Terra agora** | dia e noite deste minuto, as cidades, o sol a pino | mapa | Mapa (uma lente em tela cheia) | atlas.html#ver=terra (terra.js) |
| **As revoluções** | da formação da Terra à revolução ontológica | tempo · lista | Mapa (uma lente em tela cheia) | atlas.html#ver=tempo (revolucoes.js), linha-do-tempo.html |
| **O mapa do saber** | as dez partes da Propædia, em rosa | mapa · lista | Mapa (uma lente em tela cheia) | atlas.html#ver=saber (humanidade.js) |
| **A vida** | todos os reinos e grupos do Catalogue of Life, as espécies ao vivo, os filtros por traço, as formas (folhas, galhos, penas, corpos, geometrias) e as origens | lista · grade · mapa · corrido | Coleção | atlas.html#ver=vida (vida.html dentro do Atlas; registro 116) |
| **As energias** | a lei, as oito formas com a fórmula, como uma vira a outra e de onde vem cada fonte (do Sol, da Lua, de dentro da Terra, dos átomos) | lista · corrido | Página (um arquivo) | atlas.html#ver=energias (energias.html dentro do Atlas; registro 116) |
| **A Luz** | todas as alternativas de iluminação e a escada do olho ao céu, com as fontes | tábua · corrido | Coleção | atlas.html#ver=luz (iluminacao.html dentro do Atlas; registro 115) |
| **O planeta** | as cinco medidas e os hábitos (marcados no aparelho) | grade · lista | Coleção | atlas.html#ver=planeta |
| **Dados** | o mundo em números | tábua · mapa | Coleção | atlas.html#ver=numeros (dados.html dentro do Atlas) |
| **Onde está guardado** | os museus e os acervos do mundo | mapa · lista | Coleção | museus.html |
| **Falta** | o que ainda falta escrever (só no aparelho) | lista · rede | Coleção | falta.html |

### Você · estantes A a C, de cada um · fica no aparelho (o que for marcado público vai à vitrine)

#### Hoje · O que faço agora?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **Hoje** | o dia, a tarefa do momento com o guia ao lado, os prazos, esperando você | corrido · lista | Hoje | hoje.html |
| **Domínio** | o mapa geral das matérias: o que já sei, o que falta | mapa · lista · grade · tempo · rede | Mapa (uma lente em tela cheia) | domino.html, area.html |
| **Fichário** | as cartas de estudo | grade · corrido | Coleção | carta.html |
| **Copiar à mão** | escrever para lembrar | corrido | Nota | copiar.html |

#### Caderno (nova) · O que escrevi?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **Projetos do Sol** | o poema em escrita: a escada dos cantos, lida do caderno | corrido | Leitor | poema.html (registro 115, só no computador) |
| **Notas** | nota e somente nota: abre e escreve, já salvo | tempo · lista · corrido | Nota | nota.js (tecla N); no site, as notas no aparelho e o .zip (registro 119) |
| **Leituras** | os textos abertos, onde parei, destaques e notas | lista · tempo · corrido | Leitor | leituras.html |
| **Coleção** | o que guardo: links, discos, livros, imagens | grade · lista · corrido | Coleção | album.html, eu.html#colecao |
| **Os arquivos** | a pasta inteira, como ela é | corrido · lista | Coleção | eu.html#arquivos, interface (árvore) |

#### Eu · Quem sou?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **A ficha** | quem é, o caminho, a obra, a voz (o que é público vai à vitrine) | vestida · corrido | Vitrine (a ficha pública de uma pessoa) | eu.html |
| **A rede** | os elos, cada um com um porquê; sem feed, sem curtidas, sem seguidores | rede · grade · lista | Mapa (uma lente em tela cheia) | eu.html#rede; a rede oficial é a fase 4 do plano (seção 2) |
| **O cartão** | o cartão de visita e o convite | espaço · corrido | Vitrine (a ficha pública de uma pessoa) | vitrine.html?convite=1 |
| **A chave** | entrar, convites, o celular (a chave da casa, não o cofre) | corrido | Portão (o primeiro acesso) | entrar.html, celular.html; no site, Entrar com o Google e o seu Drive (nuvem.js, registro 119) |

#### Casa · Onde moro?

| Página | O que é | Lentes | Molde | De onde vem hoje |
|---|---|---|---|---|
| **A casa** | a planta e os cômodos | espaço · mapa | Cena (3D) | casa.html |
| **O jardim** | o que cresceu | espaço | Cena (3D) | jardim.html |
| **A estante** | os livros | espaço · grade · lista | Cena (3D) | casa.html?area=estante |
| **O guarda-roupa** | as roupas | espaço · grade | Cena (3D) | casa.html?area=guarda-roupa |

### Em toda página

| Ferramenta | Tecla | O que faz |
|---|---|---|
| **Buscar** | Ctrl K | fichas, páginas, notas, o Checklist |
| **Nota** | N | abre um plano e você escreve |
| **Corrido** | L | a lente desligada na página inteira: o arquivo como ele é |
| **Ajustes** | · | estilo (Almanaque, Casa), cor (preto, branco, papel, floresta, azul noite), movimento e Arrumar (a ordem das seções de cada página, guardada no aparelho) |
| **A volta** | · | a bola de onde você veio, no alto; um toque volta ao mesmo ponto (registro 117) |
| **Lugares** | H | voltar, fixar (a fixada anda com você: do GEO-05 ao GEO-06) e os caminhos de cada visita; no índice da esquerda ou na bola do meio da barra de baixo (registro 118) |
| **Tela cheia** | F | a página inteira na tela: os índices descansam, a barra de cima volta com o mouse no alto (registro 118) |
| **Levar** | · | exportar: o papel (HTML, PDF), o zip, a ficha .md |
| **Protetor** | · | o relógio, os lembretes, o céu |
| **Aviso** | · | enquanto a interface for emergencial (depois, vira o Agora dos Guias) |
<!-- /gerado:mapa -->

## 6. A navegação

- **Barra de cima** (64 px; no celular, 56): `Buscar · Nota | Manifesto · Obras · Guias · Atlas ■ Hoje · Caderno · Eu · Casa | Corrido · Ajustes`. Só palavras; a porta atual marcada por um traço embaixo.
- **O Quadrado**: um clique abre o **Índice** (tudo, de uma vez), que se abre a partir do próprio quadrado; segurar abre a **esfera** (a lente espaço do site inteiro).
- **Barra de baixo** (64 px): à esquerda, **Dentro de ‹porta›** (as páginas da porta); à direita, **Nesta página** (os tópicos, o atual acompanha a rolagem).
- **Os dois índices** (telas de 1360 px ou mais, registro 116): à esquerda, **O todo** (as portas e, na porta em que se está, as páginas dela); à direita, **Nesta página** (os tópicos, o atual acompanhando a rolagem e o quanto já se leu). Ficam parados nas margens e a barra de baixo descansa; o miolo cabe entre eles.
- **O respiro** (registro 116): cada seção começa com um fio e um vão largo (de 96 a 160 px), o título em Archivo 800; os blocos de dentro, de 44 a 72 px.
- **A volta** (●, registro 117): no alto, à esquerda (nas telas largas, no topo do índice do todo), a bola de onde você veio, com o nome; um toque volta ao mesmo ponto da página. O dedo segurando abre os Lugares.
- **Os Lugares** (registro 118): voltar, fixar e os caminhos. Cada visita (uma aba) é um caminho, com os lugares na ordem em que foram vistos; ficam os oito últimos, no aparelho. Uma **fixada** guarda o contexto (a página e a matéria, ?m=; a área aberta no Domínio, #area=; a matéria das fichas) e anda junto: fixada no GEO-05, você vai ao GEO-06, ela está no GEO-06, no ponto em que você parou. Nas telas largas, o botão Lugares ao lado de O todo, no índice da esquerda; nas outras, a bola do meio da barra de baixo; em toda tela, a tecla H.
- **A tela cheia** (registro 118): a tecla F ou o botão Tela cheia; os índices e a barra de baixo descansam, a barra de cima volta com o mouse no alto, o miolo se alarga. F ou Esc saem.
- **A passagem entre páginas** (registro 118): uma só, em todas. A casca (as barras e os índices) nasce pronta e fica parada; só o miolo troca, num esmaecer cruzado de 0,24 s, sem borrão. O sol do menu desliza até a porta nova.
- **A casa de entrada** (registro 118): o centro, como o Quadrado (nenhuma porta acende); no menu, o sol fica sob o Quadrado. O Atlas virou uma porta como as outras (a primeira página dele é O Atlas).
- **O todo que abre** (✚, registro 117): no índice do todo, cada porta tem a cruz que abre as páginas dela ali mesmo, e cada página com partes abre as partes (as matérias do Domínio, as Áreas, as seções do Atlas). No Domínio, a cruz de cada matéria abre embaixo dela a área inteira (o mapa, o museu, a Tábua, os itens, as obras, as práticas, o horizonte), sem sair da página.
- **Os créditos** (registro 117): no fim de cada página, a linha da obra (Portal Solar · uma obra de Vitor de Mantova · Campinas, 2026 · interface provisória), com O que importa agora (o aviso, discreto desde o registro 118), Os créditos e Doar (as causas primeiro).
- **No celular**: em cima, Buscar · ■ · Ajustes; embaixo, os dois botões (Dentro de · Nesta página) e as portas de dentro (Guias · Atlas · ■ · Hoje · Caderno); as outras quatro no Índice.
- **A folha**: tudo o que abre sobe da direita (de baixo, no celular), com rótulo, título e um fechar.
- **Teclas**: Ctrl K (buscar) · N (nota) · M (Índice) · O (esfera) · H (Lugares) · F (tela cheia) · L (corrido) · Esc (fechar).
- **Endereços**: o arquivo no endereço do seu caminho; a lente em `?lente=`; a parte da página em `#`. Todo endereço se compartilha e abre igual em qualquer aparelho.

## 7. Os moldes (as telas)

Cada molde é um quadro no Figma, em 1440 e em 390. Os números entre colchetes são colunas de 12 (`+2` é um deslocamento); no celular os blocos se empilham na mesma ordem.

<!-- gerado:moldes -->
**01 · Início** (inicio): a casa de entrada: o centro, como o Quadrado; boas-vindas, as portas espelhadas, a utopia, a Terra agora.  
  As boas-vindas [+3 6/12]  
  O mundo [5/12] · O Quadrado [2/12] · Você [5/12]  
  O que queremos [+2 8/12]  
  A Terra agora [12/12]  
  A linha da obra [12/12]

**02 · Porta** (porta): a entrada de cada porta (Atlas, Guias, Hoje…): as páginas de dentro, em texto corrido.  
  O nome da porta [8/12] · O que mudou [4/12]  
  As páginas da porta [12/12]  
  O destaque [8/12] · Atalhos [4/12]

**03 · Coleção** (colecao): muitas coisas de uma vez, vistas pela lente escolhida.  
  A trilha [12/12]  
  O título [8/12] · A contagem [4/12]  
  A barra da lente [8/12] · Buscar e filtrar [4/12]  
  A vista [12/12]  
  O pé [12/12]

**04 · Página (um arquivo)** (pagina): uma ficha ou um texto: o arquivo vestido pelo formato.  
  A trilha [12/12]  
  A lente da página [12/12]  
  O retrato [3/12] · O título e a tábua [9/12]  
  Sumário [2/12, some no celular] · O texto corrido [7/12] · As fontes [3/12]  
  Os elos [12/12]  
  O pé do arquivo [12/12]

**05 · Leitor** (leitor): ler um texto longo em três colunas: sumário, texto, notas.  
  A barra de leitura [12/12]  
  Sumário [3/12, some no celular] · O texto [6/12] · Notas e destaques [3/12]

**06 · Hoje** (hoje): tudo o que é da pessoa para hoje, num lugar só.  
  O dia [8/12] · Meu dia [4/12]  
  Agora [8/12] · Prazos [4/12]  
  O caminho de cada área [12/12]  
  Domínio [12/12]  
  Esperando você [6/12] · Para respirar [6/12]

**07 · Mapa (uma lente em tela cheia)** (mapa): quando a vista é o conteúdo: Terra agora, Domínio, rede, revoluções.  
  A barra da lente [12/12]  
  A vista [9/12] · Legenda e o que está aberto [3/12]

**08 · Cena (3D)** (cena): a Casa, o Jardim, a Estante: a cena embaixo, a barra do Portal por cima.  
  A cena [12/12]

**09 · Nota** (nota): escrever: abre e escreve, já salvo.  
  O nome e onde mora [+2 6/12] · Guardado [2/12]  
  A folha de escrever [+2 8/12]

**10 · Obra (um produto no hub)** (obra): cada produto e cada mundo tem a sua ficha, e abre aqui ou à parte.  
  A capa [12/12]  
  O que é [7/12] · A ficha técnica [5/12]  
  Abrir [4/12] · O nível [8/12]  
  A obra em si [12/12]  
  Os elos [12/12]

**11 · Vitrine (a ficha pública de uma pessoa)** (vitrine): o site pessoal como lente sobre a ficha e as obras.  
  A capa [12/12]  
  Quem é [7/12] · O cartão [5/12]  
  A obra [12/12]  
  O caminho [7/12] · Os elos [5/12]

**12 · Portão (o primeiro acesso)** (portao): local-first: escolher a pasta, começar do modelo ou só ler.  
  O que é [+2 8/12]  
  Escolher a pasta [+2 4/12] · Começar do modelo [4/12]  
  Só ler [+2 8/12]  
  Onde ficam os seus arquivos [+2 8/12]

**13 · Índice (o Quadrado)** (indice): tudo, de uma vez: a busca e as portas.  
  A busca [12/12]  
  As lentes do todo [12/12]  
  O Mundo [6/12] · Você [6/12]

**14 · Folha** (folha): tudo o que abre: sobe da direita (de baixo, no celular); nunca dentro da grade.  
  A página, por baixo [5/12, some no celular] · A folha [7/12]

**15 · Aviso (nas outras páginas)** (aviso): a linha do aviso no alto; abre a folha com o que importa agora.  
  A linha do aviso [12/12]  
  A página de sempre [12/12]
<!-- /gerado:moldes -->

## 8. Os componentes (a biblioteca do Figma)

| Componente | Medida | Estados e regras |
|---|---|---|
| Barra de cima | 64 px (celular 56) | porta atual com traço; no celular, as portas descem |
| Barra de baixo | 64 px (celular: dois botões de 50 + portas de 64) | as duas metades do mesmo tamanho |
| O Quadrado | 22 px no menu; 64 a 132 como selo | clique, segurar; é a marca, sem texto |
| Botão | 40 px, canto 10 | principal (tinta cheia), secundário (linha), leve (só a palavra) |
| Chip | 32 px, pílula | ligado = tinta cheia |
| Campo | 44 px, canto 10 | foco com um anel só, só no teclado |
| Cartão | canto 14, linha fina, chapado | linhas de altura igual na grade |
| Barra da lente | chips numa fileira | um ligado; o corrido sempre presente |
| Folha | 760 px de largura, canto 18, margem 12 | sobe da direita; no celular, de baixo, com a alça |
| Janela | canto 26 | o Índice; no celular, a tela inteira |
| Aviso | faixa em tinta (Início) e linha fina (outras páginas) | enquanto a interface for emergencial |
| Texto | rótulo, título, linha-fina, corrido (60 a 72 letras por linha), nota de margem, citação | itálico só no sumário, nas citações e no nome |
| Tábua de dados | duas colunas: o campo e o valor | os campos do cabeçalho da ficha |
| Trilha | o caminho do arquivo | cada pedaço é um link |
| Retrato | o do arquivo ou o gerado (cor e trama a partir do nome) | nunca vazio |

## 9. Os tokens

O arquivo **`estrutura/figma/variaveis.json`** (formato W3C, que o Tokens Studio lê) é gerado de `cores.css`, `forma.css` e `perfil.css`: as cinco cores, o espaço, os cantos, as alturas, os tempos, as camadas, a curva e as letras.

| | Valores |
|---|---|
| Cores | **branco** (o padrão de dia) · **preto** (o padrão à noite) · papel · floresta · azul noite. Cada uma tem papel, papel-2, tinta, suave e fio |
| Espaço | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 |
| Cantos | 6 · 10 · 14 · 18 · 26 · pílula |
| Alturas | 32 · 40 · 48 |
| Tempos | 120 · 200 · 320 · 480 ms, e uma curva de entrada |
| Letras | **Archivo** (títulos, menus, botões) · **Newsreader** (o texto de ler) · JetBrains Mono (só código) |
| Grade | 1440: 12 colunas de 88, margem 60, calha 24 · 390: 4 colunas, margem 16, calha 12 |

## 10. Os produtos no hub

Um produto sobe um degrau de cada vez. **Ficha**: tem a sua ficha nas Obras (o que é, quem fez, o estado, o endereço); custa um arquivo `.md`. **Casca**: abre dentro do hub, com a mesma barra, as mesmas letras e o Quadrado para voltar. **Motor**: lê e escreve a mesma pasta, pela mesma Porta.

<!-- gerado:produtos -->
| Produto | O que é | Hoje | Alvo |
|---|---|---|---|
| **O motor e os três corpos** | o núcleo puro e as portas do disco; o site, o Portátil (PWA) e o Aplicativo (mesa e Android) | motor | o próprio hub |
| **Portal Solar (este app)** | Atlas, Guias, Hoje, Eu, Casa, Manifesto: as páginas de hoje | casca | motor (entra no repositório do motor como casa/, ver UNIAO.md) |
| **O acervo** | a pasta de arquivos .md: estantes 0 a 3 (de todos) e A a C (de cada um) | motor | é a verdade; a interface é a lente |
| **vitordemantova.com** | o site pessoal, a revista | ficha | casca: a vitrine do Vitor (lente revista) |
| **Vitor Petri** | o portfólio em galeria 3D | ficha | casca: a lente espaço sobre as obras |
| **Jardim Serafim** | o jogo da vila onde ninguém come sozinho | ficha | motor: as etapas reais da obra viram trabalho no jogo |
| **Vilageoise** | a cidade de luz (jogo) | ficha | casca |
| **Paz por Contraponto** | a música e o Violino Turul | ficha | casca |
| **Sistema Quântico** | os instrumentos de harmonia | ficha | casca |
| **Plaza** | a praça em 3D | ficha | casca (lente espaço) |
| **A oficina** | texturas e motores gráficos | ficha | motor (já entrou no repositório do motor como oficina/) |
<!-- /gerado:produtos -->

As ferramentas pessoais ficam do lado **Você** e não aparecem no público. Os sites feitos para outras pessoas só entram nas Obras com o sim delas, como fichas de obra com o nome de quem fez.

## 11. No Figma, passo a passo

1. **Um arquivo, nove páginas**: 00 Capa · 01 Mapa · 02 Lentes · 03 Produtos · 04 Fluxos · 05 Moldes 1440 · 06 Moldes 390 · 07 Componentes · 08 Mockups.
2. **Arraste os SVG** de `estrutura/figma/` para a página certa: `00-mapa.svg` em 01, `01-lentes.svg` em 02, `02-produtos.svg` em 03, `03-moldes-1440.svg` em 05 e `04-moldes-390.svg` em 06. Viram camadas editáveis, com o nome de cada bloco. Para um quadro por tela, use os arquivos soltos de `moldes-1440/` e `moldes-390/`.
3. **A grade** em cada quadro: 1440 com 12 colunas, margem 60, calha 24; 390 com 4 colunas, margem 16, calha 12.
4. **Os tokens**: plugin Tokens Studio → Import → `variaveis.json`.
5. **As letras**: Archivo e Newsreader (Google Fonts, já estão no Figma).
6. **Os nomes**: quadros e camadas com os mesmos nomes do mapa (`molde/pagina`, `porta/atlas`), para cada tela voltar ao código sem tradução.
7. **A ordem**: os moldes 01 a 04 (Início, Porta, Coleção, Página) cobrem quase todas as telas; faça o wireframe deles primeiro, depois o mockup do Início e da Página nas duas larguras. Com o link, eu implemento e comparo pixel a pixel (a PS-36).

**Os fluxos para prototipar** (página 04):
1. Chegar: Início → o aviso → uma fonte, ou uma porta.
2. Achar qualquer coisa: Ctrl K ou o Quadrado → a página do arquivo → um elo → outra página.
3. Ver muitas: Atlas → Fichas → a lente (grade → tempo → mapa) → abrir uma.
4. Escrever: N → a nota se guarda sozinha → aparece no Caderno, na lente tempo.
5. O dia: Hoje → a tarefa do momento com o guia → marcar → o Domínio acende.
6. Ler longo: Leituras → o Leitor → marcar → levar para o caderno.
7. Ser alguém: Eu → a ficha em cinco passos → o cartão → o convite → a outra pessoa faz a dela → o elo, com o porquê.
8. O primeiro acesso: o Portão → escolher a pasta, começar do modelo, ou só ler.
9. Uma obra: Obras → a obra → abrir aqui → voltar pelo Quadrado.
10. Levar: Levar → o papel, o zip ou a ficha.

## 12. A ordem da obra

| Fase | O quê | Quem |
|---|---|---|
| F0 | o aviso no ar e esta estrutura (21/out) | feito |
| F1 | o wireframe dos moldes 01 a 04, em 1440 e 390 | você, no Figma |
| F2 | o mockup do Início e da Página; os componentes | você, e eu comparo |
| F3 | a união: este app entra no repositório do motor como `casa/` (`UNIAO.md`); uma raiz só | eu, com o seu sim |
| F4 | as lentes no motor (`lente.ts` ganha tempo, mapa, rede, espaço) e o Corrido em toda página | eu |
| F5 | as portas novas (Obras, Caderno) e a ficha de cada produto (o degrau 1 de todos) | eu |
| F6 | os moldes do Figma, tela por tela, conferidos em 1440 e 390; publicar | eu |
| F7 | os produtos sobem de degrau, um de cada vez | nós |

## 13. O que é decisão sua

- As **oito portas** e os nomes novos (**Obras**, **Caderno**).
- Quais produtos entram nas Obras e em que ordem sobem de degrau.
- O **Doar** no site público (PS-04).
- Até quando o **aviso** fica; depois ele vira o **Agora** dos Guias.
- A **união** dos repositórios (`UNIAO.md`).
- O **Client ID do Google** (seção 2, "Ligar o Google"): com ele, a conta e o Drive se ligam no site.
- Onde fica o **registro da rede** (fase 4): só as fichas publicadas e os elos. A sugestão: o Upstash Redis do painel da Vercel (gratuito até 256 MB), sem outro servidor.

## 14. De onde veio

- Do motor (`interface`): *A Bússola* (as seis leis, o núcleo, as portas, as estantes), *A Reconstrução* (o corrido sagrado), `lib/motor/lente.ts` (as lentes), `paridade.md` (os três são um).
- Deste app: `SISTEMA.md` (o desenho), `mapa-dados.js` (as portas de hoje), `forma.css` e `cores.css` (a régua e as cores), `TAREFAS.md` (as PS), o registro em `respostas/`.
- Do pedido de 21/out/2026: "local first… integrar todos os produtos e apps no portalsolar, pra termos um hub global de fato… na versão minimalista, do texto corrido, do conceito das lentes".
