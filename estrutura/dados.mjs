/* ============================================================
   A ESTRUTURA DO PORTAL SOLAR — a fonte única (21/out/2026, registro 114)
   Pedido dele: "me passe toda a estrutura do site, pra eu colocar no figma, fazer um wireframe e
   um mockup pra gente refazer o projeto todo na nova interface! … local first … integrar todos os
   produtos e apps no portalsolar, pra termos um hub global de fato … na versão minimalista, do
   texto corrido, do conceito das lentes".

   Daqui saem, pelo `node estrutura/gerar.mjs`:
   · as tabelas geradas do ESTRUTURA.md (entre os marcadores <!-- gerado:… -->);
   · os arquivos para o Figma em estrutura/figma/ (o mapa, as lentes, os moldes em 1440 e 390).
   Uma lista escrita duas vezes já divergiu: mude aqui e rode o gerador.
   ============================================================ */

/* ---------- AS LENTES: o mesmo arquivo, outro olhar (nunca outra coisa) ---------- */
/* [id, nome, o que mostra, para quê, onde vale, o que precisa nos arquivos, de onde vem hoje] */
export const LENTES = [
  ['corrido', 'corrido', 'o arquivo como ele é, só texto', 'ler; a prova de que a interface não inventa', 'toda página e toda coleção', 'nada', 'interface (LENTE_*), "a lente desligada"'],
  ['lista', 'lista', 'uma coisa por linha, densa', 'percorrer muitas', 'coleções, Índice, menus', 'um nome', 'Galeria, Índice (lista), Domínio (Índice)'],
  ['grade', 'grade', 'blocos lado a lado, com retrato', 'comparar de relance', 'coleções, Obras, Eu', 'retrato (opcional)', 'Fichas, Galeria, Domínio (Mosaico)'],
  ['tabua', 'tábua', 'colunas alinhadas, campo a campo', 'comparar dados', 'coleções, Dados, ficha', 'campos no cabeçalho', 'Dados da Terra, a tábua da ficha'],
  ['tempo', 'tempo', 'a data à margem, em ordem de nascimento', 'ver quando', 'coleções, revoluções, Caderno', 'data, nascimento, ano', 'Quando, linha das revoluções, Domínio (Linhas)'],
  ['mapa', 'mapa', 'onde: o globo, o mapa do saber, o mapa da matéria', 'ver onde e quanto', 'Atlas, Terra agora, Domínio, Museus', 'onde/coordenadas ou área', 'Terra agora, rosa da Propædia, Domínio (Mapa, Sol)'],
  ['rede', 'rede', 'os elos, em constelação', 'ver o que se liga', 'ficha, Eu, Domínio, Índice', '[[elos]] e quem cita', 'Rede da Vida, Domínio (Constelação)'],
  ['espaco', 'espaço', 'em 3D, como um lugar', 'morar, guardar, passear', 'Casa, estante, esfera do Índice', 'nada (a casa é desenhada)', 'Casa, Jardim, Estante, Guarda-roupa, o Portal (esfera)'],
];
/* a lente da página (um arquivo só): vestida (o traje do formato) ou corrido */
export const LENTE_DA_PAGINA = [['vestida', 'o traje do formato: ficha, wiki, manual, livro, publicação, atlas, casa'], ['corrido', 'só o que está escrito, nada mais']];

/* ---------- O MAPA NOVO: o Quadrado no centro, o Mundo à esquerda, Você à direita ---------- */
/* porta: { id, nome, pergunta, paginas: [[id, nome, o que é, lentes, molde, de onde vem hoje]] } */
export const CENTRO = {
  nome: 'O Quadrado', o_que: 'o Índice de tudo: busca, as portas e as páginas, nas lentes lista, mapa e espaço (a esfera)',
  gesto: 'clique ou M; segurar abre a esfera (O)', hoje: 'Índice (indice.js), o Portal (portal.js)',
};
export const LADOS = [
  { id: 'mundo', nome: 'O Mundo', estantes: '0 a 3, de todos', publico: true, portas: [
    { id: 'manifesto', nome: 'Manifesto', pergunta: 'Por quê?', paginas: [
      ['manifesto', 'O Manifesto', 'o porquê do Portal Solar, contra marcas e falsidades', 'corrido', 'pagina', 'manifesto.html'],
      ['manifestos', 'Os manifestos', 'os da humanidade, de Lutero ao local-first', 'tempo · lista · corrido', 'colecao', 'manifestos.html'],
      ['creditos', 'Os créditos', 'quem fez, a gramática, as fontes, as letras, as bibliotecas, a licença e o caminho para doar (registro 117)', 'corrido', 'pagina', 'creditos.html'],
      ['doar', 'Doar', 'as causas primeiro; no fim, o caminho para sustentar esta obra', 'mapa · lista', 'colecao', 'doar.html (público desde o registro 117)'],
      ['filosofia', 'A filosofia', 'os seus arquivos, a sua casa (local-first)', 'corrido', 'pagina', 'filosofia.html'],
      ['participe', 'Faça parte', 'as funções, o primeiro passo e a candidatura em .md', 'lista · corrido', 'porta', 'participe.html'],
      ['sistema', 'O sistema', 'o desenho aberto: tokens, letras, régua, propostas', 'grade · corrido', 'colecao', 'sistema.html, galeria.html'],
    ] },
    { id: 'obras', nome: 'Obras', pergunta: 'O que fazemos?', nova: true, paginas: [
      ['obras', 'As obras', 'os produtos e os mundos feitos sobre o Portal, cada um com a sua ficha', 'grade · lista · tempo · corrido', 'colecao', 'nova (os repositórios de ~/www)'],
      ['obra', 'Uma obra', 'o que é, quem fez, o estado, abrir aqui ou à parte', 'vestida · corrido', 'obra', 'nova'],
      ['vitrines', 'As vitrines', 'a ficha pública de cada pessoa, como revista ou galeria', 'grade · corrido', 'vitrine', 'vitrine.html e os sites pessoais'],
    ] },
    { id: 'guias', nome: 'Guias', pergunta: 'O que importa agora?', paginas: [
      ['agora', 'Agora', 'o instante, o mundo agora, as causas, os avanços, as tecnologias, as tendências', 'lista · tempo · corrido', 'porta', 'guias.html e o aviso (aviso-dados.js)'],
      ['area', 'Todas as áreas', 'as 40 áreas (UNESCO e três caminhos): subáreas, nichos, fontes, vagas e comunidades; os dez minutos do dia', 'lista · mapa · corrido', 'colecao', 'campos.html (registro 115); o aviso lê daqui'],
      ['curadoria', 'Curadoria', 'escolhas assinadas, datadas, com fontes; o glossário', 'corrido · rede · tempo', 'leitor', 'curadoria.html'],
      ['livros', 'Livros por necessidade', 'os especiais, com o porquê', 'lista · grade · corrido', 'colecao', 'guias.html#livros'],
      ['causas', 'As causas', 'os 17 ODS e onde ajudar (Doar)', 'lista · tábua · corrido', 'colecao', 'guias.html#necessidades, doar.html'],
    ] },
    { id: 'atlas', nome: 'Atlas', pergunta: 'O que existe?', paginas: [
      ['fichas', 'As fichas', 'tudo o que existe: pessoas, obras, lugares, elementos, eventos', 'todas as lentes', 'colecao', 'biblioteca.html (Seleção e Atlas)'],
      ['ficha', 'Uma ficha', 'o arquivo vestido: retrato, tábua, texto, fontes, elos', 'vestida · corrido · rede', 'pagina', 'biblioteca.html#f=…, interface […caminho]'],
      ['terra', 'A Terra agora', 'dia e noite deste minuto, as cidades, o sol a pino', 'mapa', 'mapa', 'atlas.html (terra.js)'],
      ['revolucoes', 'As revoluções', 'da formação da Terra à revolução ontológica', 'tempo · lista', 'mapa', 'atlas.html (revolucoes.js), linha-do-tempo.html'],
      ['saber', 'O mapa do saber', 'as dez partes da Propædia, em rosa', 'mapa · lista', 'mapa', 'atlas.html (humanidade.js)'],
      ['vida', 'A vida', 'todos os reinos e grupos do Catalogue of Life, as espécies ao vivo, os filtros por traço, as formas (folhas, galhos, penas, corpos, geometrias) e as origens', 'lista · grade · mapa · corrido', 'colecao', 'vida.html (registro 116)'],
      ['energias', 'As energias', 'a lei, as oito formas com a fórmula, como uma vira a outra e de onde vem cada fonte (do Sol, da Lua, de dentro da Terra, dos átomos)', 'lista · corrido', 'pagina', 'energias.html (registro 116)'],
      ['luz', 'A Luz', 'todas as alternativas de iluminação e a escada do olho ao céu, com as fontes', 'tábua · corrido', 'colecao', 'iluminacao.html (registro 115)'],
      ['planeta', 'O planeta', 'as cinco medidas e os hábitos (marcados no aparelho)', 'grade · lista', 'colecao', 'atlas.html#planeta'],
      ['dados', 'Dados', 'o mundo em números', 'tábua · mapa', 'colecao', 'dados.html'],
      ['museus', 'Onde está guardado', 'os museus e os acervos do mundo', 'mapa · lista', 'colecao', 'museus.html'],
      ['falta', 'Falta', 'o que ainda falta escrever (só no aparelho)', 'lista · rede', 'colecao', 'falta.html'],
    ] },
  ] },
  { id: 'voce', nome: 'Você', estantes: 'A a C, de cada um', publico: false, portas: [
    { id: 'hoje', nome: 'Hoje', pergunta: 'O que faço agora?', paginas: [
      ['hoje', 'Hoje', 'o dia, a tarefa do momento com o guia ao lado, os prazos, esperando você', 'corrido · lista', 'hoje', 'hoje.html'],
      ['dominio', 'Domínio', 'o mapa geral das matérias: o que já sei, o que falta', 'mapa · lista · grade · tempo · rede', 'mapa', 'domino.html, area.html'],
      ['carta', 'Fichário', 'as cartas de estudo', 'grade · corrido', 'colecao', 'carta.html'],
      ['copiar', 'Copiar à mão', 'escrever para lembrar', 'corrido', 'nota', 'copiar.html'],
    ] },
    { id: 'caderno', nome: 'Caderno', pergunta: 'O que escrevi?', nova: true, paginas: [
      ['poema', 'Projetos do Sol', 'o poema em escrita: a escada dos cantos, lida do caderno', 'corrido', 'leitor', 'poema.html (registro 115, só no computador)'],
      ['notas', 'Notas', 'nota e somente nota: abre e escreve, já salvo', 'tempo · lista · corrido', 'nota', 'nota.js (tecla N)'],
      ['leituras', 'Leituras', 'os textos abertos, onde parei, destaques e notas', 'lista · tempo · corrido', 'leitor', 'leituras.html'],
      ['colecao', 'Coleção', 'o que guardo: links, discos, livros, imagens', 'grade · lista · corrido', 'colecao', 'album.html, eu.html#colecao'],
      ['arquivos', 'Os arquivos', 'a pasta inteira, como ela é', 'corrido · lista', 'colecao', 'eu.html#arquivos, interface (árvore)'],
    ] },
    { id: 'eu', nome: 'Eu', pergunta: 'Quem sou?', paginas: [
      ['eu', 'A ficha', 'quem é, o caminho, a obra, a voz (o que é público vai à vitrine)', 'vestida · corrido', 'vitrine', 'eu.html'],
      ['rede', 'A rede', 'os elos, cada um com um porquê; sem feed, sem curtidas, sem seguidores', 'rede · grade · lista', 'mapa', 'eu.html#rede'],
      ['cartao', 'O cartão', 'o cartão de visita e o convite', 'espaço · corrido', 'vitrine', 'vitrine.html?convite=1'],
      ['conta', 'A chave', 'entrar, convites, o celular (a chave da casa, não o cofre)', 'corrido', 'portao', 'entrar.html, celular.html'],
    ] },
    { id: 'casa', nome: 'Casa', pergunta: 'Onde moro?', paginas: [
      ['casa', 'A casa', 'a planta e os cômodos', 'espaço · mapa', 'cena', 'casa.html'],
      ['jardim', 'O jardim', 'o que cresceu', 'espaço', 'cena', 'jardim.html'],
      ['estante', 'A estante', 'os livros', 'espaço · grade · lista', 'cena', 'casa.html?area=estante'],
      ['guarda-roupa', 'O guarda-roupa', 'as roupas', 'espaço · grade', 'cena', 'casa.html?area=guarda-roupa'],
    ] },
  ] },
];
/* a ordem no menu, de fora para dentro (Mundo) e de dentro para fora (Você) */
export const MENU = { mundo: ['manifesto', 'obras', 'guias', 'atlas'], voce: ['hoje', 'caderno', 'eu', 'casa'] };

/* as ferramentas: em toda página, nas pontas da barra de cima */
export const FERRAMENTAS = [
  ['Buscar', 'Ctrl K', 'fichas, páginas, notas, o Checklist'],
  ['Nota', 'N', 'abre um plano e você escreve'],
  ['Corrido', 'L', 'a lente desligada na página inteira: o arquivo como ele é'],
  ['Ajustes', '', 'estilo (Almanaque, Casa), cor (preto, branco, papel, floresta, azul noite), movimento e Arrumar (a ordem das seções de cada página, guardada no aparelho)'],
  ['A volta', '', 'a bola de onde você veio, no alto; um toque volta ao mesmo ponto (registro 117)'],
  ['Lugares', 'H', 'voltar, fixar (a fixada anda com você: do GEO-05 ao GEO-06) e os caminhos de cada visita; no índice da esquerda ou na bola do meio da barra de baixo (registro 118)'],
  ['Tela cheia', 'F', 'a página inteira na tela: os índices descansam, a barra de cima volta com o mouse no alto (registro 118)'],
  ['Levar', '', 'exportar: o papel (HTML, PDF), o zip, a ficha .md'],
  ['Protetor', '', 'o relógio, os lembretes, o céu'],
  ['Aviso', '', 'enquanto a interface for emergencial (depois, vira o Agora dos Guias)'],
];

/* ---------- OS MOLDES: as telas do Figma ----------
   Cada linha é uma fileira da grade de 12 colunas (1440: margens de 60, calha de 24).
   bloco = [colunas, altura, nome, nota] ou { o: deslocamento, s: colunas, h, n, d, cel: false (some no celular), h390 }
   No celular (390: 4 colunas, margens de 16), os blocos se empilham na mesma ordem. */
export const MOLDES = [
  /* 25/out/2026 (registro 118): a casa de entrada é o centro, simétrica como o menu; o aviso saiu para a linha dos créditos */
  { id: 'inicio', nome: 'Início', para: 'a casa de entrada: o centro, como o Quadrado; boas-vindas, as portas espelhadas, a utopia, a Terra agora', linhas: [
    [{ o: 3, s: 6, h: 420, n: 'As boas-vindas', d: 'o Quadrado grande, o nome, o lema ("Somos projetos do Sol…"), o dia de hoje; e, para quem volta, onde parou e a fixada' }],
    [[5, 520, 'O mundo', 'as portas do lado esquerdo do menu, alinhadas ao eixo: o nome, a pergunta, as páginas'], [2, 520, 'O Quadrado', 'o mapa de tudo, no eixo'], [5, 520, 'Você', 'as portas do lado direito, alinhadas ao eixo']],
    [{ o: 2, s: 8, h: 300, n: 'O que queremos', d: 'a utopia, nas palavras dele (A revolução ontológica, lida do caderno)' }],
    [[12, 420, 'A Terra agora', 'lente mapa: dia e noite deste minuto']],
    [[12, 60, 'A linha da obra', 'Portal Solar · uma obra de Vitor de Mantova · interface provisória · O que importa agora · Os créditos · Doar']],
  ] },
  { id: 'porta', nome: 'Porta', para: 'a entrada de cada porta (Atlas, Guias, Hoje…): as páginas de dentro, em texto corrido', linhas: [
    [[8, 160, 'O nome da porta', 'e a pergunta que ela responde'], [4, 160, 'O que mudou', 'as últimas páginas mexidas, com a data']],
    [[12, 260, 'As páginas da porta', 'em texto corrido: o nome, o que responde, o que há dentro']],
    [[8, 320, 'O destaque', 'a vista principal da porta'], [4, 320, 'Atalhos', 'o que se faz daqui']],
  ] },
  { id: 'colecao', nome: 'Coleção', para: 'muitas coisas de uma vez, vistas pela lente escolhida', linhas: [
    [[12, 32, 'A trilha', 'Atlas › Fichas › Pessoas']],
    [[8, 140, 'O título', 'e a linha-fina'], [4, 140, 'A contagem', '1.543 fichas · 1.832 imagens']],
    [[8, 48, 'A barra da lente', 'corrido · lista · grade · tábua · tempo · mapa · rede'], { s: 4, h: 48, n: 'Buscar e filtrar', d: 'dentro desta coleção', h390: 44 }],
    [[12, 640, 'A vista', 'o que a lente mostra; o tamanho não muda entre lentes, o conteúdo rola por dentro']],
    [[12, 48, 'O pé', 'mais 40 · voltar ao alto']],
  ] },
  { id: 'pagina', nome: 'Página (um arquivo)', para: 'uma ficha ou um texto: o arquivo vestido pelo formato', linhas: [
    [[12, 32, 'A trilha', 'o caminho do arquivo na pasta']],
    [[12, 40, 'A lente da página', 'vestida · corrido']],
    [[3, 300, 'O retrato', 'retrato: no cabeçalho, ou o gerado'], [9, 300, 'O título e a tábua', 'os campos do cabeçalho viram dados']],
    [{ s: 2, h: 520, n: 'Sumário', d: 'as seções', cel: false }, [7, 520, 'O texto corrido', '60 a 72 caracteres por linha'], [3, 520, 'As fontes', 'a fonte de cada frase, na margem']],
    [[12, 200, 'Os elos', 'o que se liga a este arquivo, com o porquê; quem o cita']],
    [[12, 48, 'O pé do arquivo', 'editar · levar · a data · a licença']],
  ] },
  { id: 'leitor', nome: 'Leitor', para: 'ler um texto longo em três colunas: sumário, texto, notas', linhas: [
    [[12, 40, 'A barra de leitura', 'onde parei · marcas · tamanho · fechar']],
    [{ s: 3, h: 720, n: 'Sumário', d: 'e onde estou', cel: false }, [6, 720, 'O texto', 'uma coluna de leitura'], [3, 720, 'Notas e destaques', 'as minhas e as do texto']],
  ] },
  { id: 'hoje', nome: 'Hoje', para: 'tudo o que é da pessoa para hoje, num lugar só', linhas: [
    [[8, 200, 'O dia', 'a data grande e o arco do sol de hoje'], [4, 200, 'Meu dia', 'o que estou fazendo, o cronômetro']],
    [[8, 240, 'Agora', 'a tarefa do momento, com o guia ao lado'], [4, 240, 'Prazos', 'em ordem, com os dias']],
    [[12, 260, 'O caminho de cada área', 'o próximo estudo, o que vem antes e depois']],
    [[12, 300, 'Domínio', 'o mapa geral, na lente escolhida']],
    [[6, 160, 'Esperando você', 'as decisões que são suas'], [6, 160, 'Para respirar', 'o jardim, o protetor']],
  ] },
  { id: 'mapa', nome: 'Mapa (uma lente em tela cheia)', para: 'quando a vista é o conteúdo: Terra agora, Domínio, rede, revoluções', linhas: [
    [[12, 48, 'A barra da lente', 'e os filtros']],
    [[9, 680, 'A vista', 'o mapa, a rede ou o tempo, arrastar e aproximar'], [3, 680, 'Legenda e o que está aberto', 'tocar num ponto abre a folha']],
  ] },
  { id: 'cena', nome: 'Cena (3D)', para: 'a Casa, o Jardim, a Estante: a cena embaixo, a barra do Portal por cima', linhas: [
    [[12, 760, 'A cena', 'ocupa a tela; as abas de dentro (Casa · Estante · Guarda-roupa · Jardim) e um painel por cima, no vidro']],
  ] },
  { id: 'nota', nome: 'Nota', para: 'escrever: abre e escreve, já salvo', linhas: [
    [{ o: 2, s: 6, h: 40, n: 'O nome e onde mora', d: 'Caderno › Notas › 21 de outubro' }, [2, 40, 'Guardado', 'há 2 segundos']],
    [{ o: 2, s: 8, h: 640, n: 'A folha de escrever', d: 'nota e somente nota: nada em volta' }],
  ] },
  { id: 'obra', nome: 'Obra (um produto no hub)', para: 'cada produto e cada mundo tem a sua ficha, e abre aqui ou à parte', linhas: [
    [[12, 320, 'A capa', 'o nome, quem fez, o estado (em obra, no ar, guardado)']],
    [[7, 260, 'O que é', 'texto corrido'], [5, 260, 'A ficha técnica', 'tábua: tipo, ano, código, licença, endereço']],
    [[4, 56, 'Abrir', 'aqui · à parte · os arquivos'], { s: 8, h: 56, n: 'O nível', d: 'ficha · casca · motor (o quanto já está integrado)' }],
    [[12, 360, 'A obra em si', 'imagens, a cena ou o próprio app (lente grade ou espaço)']],
    [[12, 160, 'Os elos', 'quem fez, o que usa, de onde veio']],
  ] },
  { id: 'vitrine', nome: 'Vitrine (a ficha pública de uma pessoa)', para: 'o site pessoal como lente sobre a ficha e as obras', linhas: [
    [[12, 360, 'A capa', 'o nome, o ofício, a voz numa frase']],
    [[7, 240, 'Quem é', 'texto corrido'], [5, 240, 'O cartão', '63 × 88 mm, vira ao toque, o QR do convite']],
    [[12, 320, 'A obra', 'as obras, na lente grade']],
    [[7, 220, 'O caminho', 'feitos e linha da vida'], [5, 220, 'Os elos', 'nomes com um porquê']],
  ] },
  { id: 'portao', nome: 'Portão (o primeiro acesso)', para: 'local-first: escolher a pasta, começar do modelo ou só ler', linhas: [
    [{ o: 2, s: 8, h: 200, n: 'O que é', d: 'o Portal é uma lente sobre uma pasta sua; desligue-o e tudo continua lá' }],
    [{ o: 2, s: 4, h: 200, n: 'Escolher a pasta', d: 'no computador ou no celular' }, [4, 200, 'Começar do modelo', 'o acervo-modelo, para preencher']],
    [{ o: 2, s: 8, h: 80, n: 'Só ler', d: 'o acervo público, sem pasta nenhuma' }],
    [{ o: 2, s: 8, h: 120, n: 'Onde ficam os seus arquivos', d: 'no seu disco; a conta é a chave da casa, não o cofre' }],
  ] },
  { id: 'indice', nome: 'Índice (o Quadrado)', para: 'tudo, de uma vez: a busca e as portas', linhas: [
    [[12, 80, 'A busca', 'Darwin, 1789, fotossíntese…']],
    [[12, 44, 'As lentes do todo', 'lista · mapa · espaço (a esfera)']],
    [[6, 560, 'O Mundo', 'as portas e as páginas, em texto corrido'], [6, 560, 'Você', 'as portas e as páginas da pessoa']],
  ] },
  { id: 'folha', nome: 'Folha', para: 'tudo o que abre: sobe da direita (de baixo, no celular); nunca dentro da grade', linhas: [
    [{ s: 5, h: 760, n: 'A página, por baixo', d: 'esmaecida', cel: false }, [7, 760, 'A folha', 'rótulo, título e fechar; o corpo rola por dentro']],
  ] },
  { id: 'aviso', nome: 'Aviso (nas outras páginas)', para: 'a linha do aviso no alto; abre a folha com o que importa agora', linhas: [
    [[12, 44, 'A linha do aviso', 'Aviso · Esta interface é emergencial e provisória · As causas · O mundo agora · …']],
    [[12, 600, 'A página de sempre', '']],
  ] },
];

/* ---------- OS PRODUTOS: como cada um entra no hub ----------
   nível: ficha (o produto tem a sua ficha nas Obras) → casca (abre dentro do hub: a mesma barra, as
   mesmas letras, o Quadrado) → motor (lê e escreve a mesma pasta, pela mesma Porta: local-first de verdade).
   Só as obras dele, pelo nome público. As ferramentas pessoais e os trabalhos para outras pessoas
   ficam fora deste arquivo (o repositório é público). */
export const PRODUTOS = [
  ['O motor e os três corpos', 'o núcleo puro e as portas do disco; o site, o Portátil (PWA) e o Aplicativo (mesa e Android)', 'motor', 'o próprio hub'],
  ['Portal Solar (este app)', 'Atlas, Guias, Hoje, Eu, Casa, Manifesto: as páginas de hoje', 'casca', 'motor (entra no repositório do motor como casa/, ver UNIAO.md)'],
  ['O acervo', 'a pasta de arquivos .md: estantes 0 a 3 (de todos) e A a C (de cada um)', 'motor', 'é a verdade; a interface é a lente'],
  ['vitordemantova.com', 'o site pessoal, a revista', 'ficha', 'casca: a vitrine do Vitor (lente revista)'],
  ['Vitor Petri', 'o portfólio em galeria 3D', 'ficha', 'casca: a lente espaço sobre as obras'],
  ['Jardim Serafim', 'o jogo da vila onde ninguém come sozinho', 'ficha', 'motor: as etapas reais da obra viram trabalho no jogo'],
  ['Vilageoise', 'a cidade de luz (jogo)', 'ficha', 'casca'],
  ['Paz por Contraponto', 'a música e o Violino Turul', 'ficha', 'casca'],
  ['Sistema Quântico', 'os instrumentos de harmonia', 'ficha', 'casca'],
  ['Plaza', 'a praça em 3D', 'ficha', 'casca (lente espaço)'],
  ['A oficina', 'texturas e motores gráficos', 'ficha', 'motor (já entrou no repositório do motor como oficina/)'],
];
