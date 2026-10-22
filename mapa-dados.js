/* ============================================================
   O MAPA DE TUDO (12/out/2026) — a fonte única da navegação.

   O menu de cima, as abas do celular, a fileira de dentro de cada
   porta, o Índice (o Quadrado), o menu Tudo e a esfera do Portal
   leem daqui. Mudou um nome ou uma página? Muda aqui, muda em todo
   lugar. (O perfil.js guarda as listas antigas como reserva.)

   Os dois lados do menu, simétricos, com o Quadrado no meio:
     O MUNDO (o que existe)   ■   VOCÊ (o que é seu)
   Do centro para fora: Atlas e Hoje são as casas de entrada de
   cada lado; nas pontas, o Manifesto (o porquê) e a Casa (o lar).

   Cada página: [id, endereço, nome, a pergunta que ela responde]
   e, quando tem, as seções de dentro (para o Índice e a busca).
   "publico: false" = só no app (precisa do servidor da casa).
   ============================================================ */
(function () {
  'use strict';

  var PORTAS = {
    /* ── O MUNDO ── */
    manifesto: {
      nome: 'Manifesto', icone: 'manifesto', lado: 'mundo',
      pergunta: 'Por quê?', desc: 'O porquê do Portal Solar, os manifestos da humanidade e a filosofia',
      paginas: [
        ['manifesto', 'manifesto.html', 'Manifesto', 'O do Portal Solar: contra marcas e falsidades', [
          ['manifesto.html#mf-xv', 'XV · A nova maré'], ['manifesto.html#mf-xvi', 'XVI · A revolução ontológica']]],
        /* 13/out/2026: o Portal a muitas mãos */
        ['participe', 'participe.html', 'Faça parte', 'O Portal Solar a muitas mãos: as funções e a candidatura'],
        ['manifestos', 'manifestos.html', 'Os manifestos', 'Da humanidade, de Lutero ao local-first'],
        ['filosofia', 'filosofia.html', 'A filosofia', 'Os seus arquivos, a sua casa (local-first)'],
        ['sistema', 'sistema.html', 'O sistema', 'O desenho do Portal: cor, letra, espaço, movimento'],
        ['galeria', 'galeria.html', 'Galeria de design', 'As opções de agora, as propostas e as referências'],
      ],
    },
    curadoria: {
      nome: 'Curadoria', icone: 'curadoria', lado: 'mundo',
      pergunta: 'Quem escolhe?', desc: 'Escolhas assinadas, datadas, com fontes',
      paginas: [
        ['curadoria', 'curadoria.html', 'Curadoria', 'Quem escolhe, e por quê', [
          ['curadoria.html#glossario', 'O glossário: 42 palavras']]],
        ['museus', 'museus.html', 'Museus', 'Onde o mundo está guardado'],
      ],
    },
    guias: {
      nome: 'Guias', icone: 'guias', lado: 'mundo',
      pergunta: 'O que ler agora?', desc: 'O instante, o mundo agora, os livros, as necessidades, os caminhos',
      paginas: [
        ['guias', 'guias.html', 'Guias', 'Ler o mundo a cada instante', [
          ['guias.html#instante', 'O instante'], ['guias.html#mundo', 'O mundo agora'], ['guias.html#livros', 'Os livros'],
          ['guias.html#necessidades', 'As necessidades'], ['guias.html#caminhos', 'Os caminhos']]],
        /* 21/out/2026 (registro 115): todas as áreas, em dez minutos por dia */
        ['campos', 'campos.html', 'Todas as áreas', 'O mundo do trabalho e do saber, em dez minutos por dia', [
          ['campos.html#dez', 'Os seus dez minutos'], ['campos.html#mapa', 'O mapa das áreas']]],
      ],
    },
    biblioteca: {
      nome: 'Fichas', icone: 'biblioteca', lado: 'mundo',
      pergunta: 'O que existe?', desc: 'Tudo o que existe, ficha por ficha, com imagens, fontes e elos',
      paginas: [
        ['biblioteca', 'biblioteca.html', 'Fichas', 'A Biblioteca: Seleção e Atlas'],
        ['quando', 'linha-do-tempo.html', 'Quando', 'A linha do tempo: quando e quem'],
        ['dados', 'dados.html', 'Dados', 'O mundo em números'],
        ['falta', 'falta.html', 'Falta', 'O que ainda falta escrever', null, false],
      ],
    },
    atlas: {
      nome: 'Atlas', icone: 'atlas', lado: 'mundo',
      pergunta: 'Onde estamos?', desc: 'A casa de entrada: o mundo, o planeta e as revoluções',
      paginas: [
        ['atlas', 'atlas.html', 'Início', 'O que é o Portal Solar, a Terra agora, as revoluções', [
          ['atlas.html#at-revolucoes', 'As revoluções'], ['atlas.html#planeta', 'O planeta e os hábitos']]],
        /* 21/out/2026 (registro 115): a luz, do móvel à cidade */
        ['iluminacao', 'iluminacao.html', 'A Luz', 'Todas as alternativas de iluminação, do móvel à cidade', [
          ['iluminacao.html#alternativas', 'As alternativas'], ['iluminacao.html#escada', 'Do olho ao céu']]],
      ],
    },
    /* ── VOCÊ ── */
    agora: {
      nome: 'Hoje', icone: 'hoje', lado: 'voce', publico: false,
      pergunta: 'O que faço agora?', desc: 'O dia, as tarefas com o guia de cada uma, os prazos',
      paginas: [
        ['agora', 'hoje.html', 'Hoje', 'Tudo o que é seu para hoje, num lugar só', [
          ['hoje.html#hj-painel', 'O painel'], ['hoje.html#hj-caminho', 'O caminho de cada área']]],
        ['copiar', 'copiar.html', 'Copiar à mão', 'Escrever para lembrar'],
      ],
    },
    domino: {
      nome: 'Domínio', icone: 'domino', lado: 'voce', publico: false,
      pergunta: 'O que já sei?', desc: 'O mapa geral das matérias e as áreas, com os pré-requisitos',
      paginas: [
        ['domino', 'domino.html', 'Domínio', 'O mapa geral, em seis vistas'],
        ['area', 'area.html', 'Áreas', 'O mapa de cada matéria', [
          ['area.html?m=Linguagens', 'Linguagens'], ['area.html?m=História', 'História'], ['area.html?m=Geografia', 'Geografia'],
          ['area.html?m=Química', 'Química'], ['area.html?m=Biologia', 'Biologia'], ['area.html?m=Matemática', 'Matemática'],
          ['area.html?m=Física', 'Física'], ['area.html?m=Filosofia', 'Filosofia'], ['area.html?m=Sociologia', 'Sociologia']]],
      ],
    },
    leituras: {
      nome: 'Leituras', icone: 'leituras', lado: 'voce',
      pergunta: 'Onde parei?', desc: 'Os textos abertos, os grupos, os destaques e as notas',
      paginas: [
        ['leituras', 'leituras.html', 'Leituras', 'Abertos, grupos, destaques, notas e histórico'],
      ],
    },
    eu: {
      nome: 'Eu', icone: 'eu', lado: 'voce', publico: false,
      pergunta: 'Quem sou?', desc: 'A sua ficha de pessoa, a coleção e a rede',
      paginas: [
        ['eu', 'eu.html', 'Eu', 'A ficha, a coleção, o caminho, a rede', [
          ['eu.html#colecao', 'Coleção'], ['eu.html#caminho', 'Caminho'], ['eu.html#rede', 'Rede'], ['eu.html#arquivos', 'Arquivos']]],
        ['vitrine', 'vitrine.html?convite=1', 'O cartão', 'O cartão de visita e o convite'],
        ['entrar', 'entrar.html', 'Conta', 'Entrar, senha, convites'],
      ],
    },
    casa: {
      nome: 'Casa', icone: 'casa', lado: 'voce', publico: false,
      pergunta: 'Onde moro?', desc: 'A casa e o jardim, em 3D',
      paginas: [
        ['casa', 'casa.html', 'Casa', 'A planta e os cômodos'],
        ['jardim', 'jardim.html', 'Jardim', 'O que cresceu'],
        ['estante', 'casa.html?area=estante', 'Estante', 'Os seus livros'],
        ['guarda-roupa', 'casa.html?area=guarda-roupa', 'Guarda-roupa', 'As suas roupas'],
      ],
    },
  };

  /* a ordem no menu, de fora para dentro à esquerda e de dentro para fora à direita */
  var MUNDO = ['manifesto', 'curadoria', 'guias', 'biblioteca', 'atlas'];
  var VOCE = ['agora', 'domino', 'leituras', 'eu', 'casa'];
  /* nas telas médias, três de cada lado (os de dentro); o resto mora no Índice */
  var MUNDO_CURTO = ['guias', 'biblioteca', 'atlas'];
  var VOCE_CURTO = ['agora', 'leituras', 'eu'];
  /* o site público (sem as páginas da casa): três e três */
  var PUB_MUNDO = ['manifesto', 'curadoria', 'guias'];
  var PUB_VOCE = ['atlas', 'biblioteca', 'leituras'];

  /* as ferramentas: nas pontas do menu e no Índice */
  var FERRAMENTAS = [
    ['buscar', null, 'Buscar em tudo', 'Livros, fichas, páginas, o Checklist (Ctrl+K)', 'buscar'],
    ['nota', '#nota', 'Nota', 'Abre um plano e você escreve (tecla N)', 'nota'],
    ['protetor', 'protetor.html', 'Protetor de tela', 'O relógio, os lembretes, o céu e a luz', 'protetor'],
    ['portal', '#portal', 'A esfera', 'O site inteiro numa esfera (tecla O)', 'portal'],
    ['pers', null, 'Personalizar', 'Tema, letra, movimento, a marca', 'pers'],
  ];

  /* página → porta (quem acende no menu); vale para as páginas de dentro também */
  var PAI = {};
  Object.keys(PORTAS).forEach(function (id) { PORTAS[id].paginas.forEach(function (p) { PAI[p[0]] = id; }); });
  /* páginas que não aparecem no menu mas pertencem a uma porta */
  PAI.li = 'eu'; PAI.album = 'eu'; PAI.carta = 'domino'; PAI.celular = 'agora'; PAI.protetor = 'agora'; PAI.doar = 'manifesto';

  function porta(id) { return PORTAS[id] || null; }
  function paiDe(pagina) { return PAI[pagina] || pagina; }
  /* todas as entradas, achatadas (para a busca e o Índice) */
  function todas() {
    var lista = [];
    Object.keys(PORTAS).forEach(function (id) {
      var po = PORTAS[id];
      po.paginas.forEach(function (p) {
        lista.push({ id: p[0], href: p[1], nome: p[2], desc: p[3], porta: id, portaNome: po.nome, lado: po.lado, publico: p[5] !== false && po.publico !== false });
        (p[4] || []).forEach(function (s) { lista.push({ id: p[0] + '#' + s[1], href: s[0], nome: s[1], desc: p[2], porta: id, portaNome: po.nome, lado: po.lado, secao: true, publico: p[5] !== false && po.publico !== false }); });
      });
    });
    return lista;
  }

  window.MAPA = {
    PORTAS: PORTAS, MUNDO: MUNDO, VOCE: VOCE, MUNDO_CURTO: MUNDO_CURTO, VOCE_CURTO: VOCE_CURTO,
    PUB_MUNDO: PUB_MUNDO, PUB_VOCE: PUB_VOCE, FERRAMENTAS: FERRAMENTAS,
    porta: porta, paiDe: paiDe, todas: todas,
  };
})();
