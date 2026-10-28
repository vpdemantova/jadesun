/* Portal Solar · ferramentas.js — a página das ferramentas e plataformas (27/out/2026).

   De onde veio: o pedido dele em 27/out/2026, "um index no portal solar de todos os apps de i.a. e
   ferramentas pra desenvolvimento e aprendizado, e plataformas em geral, sem i.a." (o plano: Logboard/
   # Board/Focos/O Índice — Plano.md). A lista mora no caderno, no arquivo do Atlas "Ferramentas e
   Plataformas" (2 Academy › 3 Atlas › 0 Coleções), uma tabela por área; a página lê o arquivo ao vivo.
   Para somar uma ferramenta: uma linha na tabela da área dela.

   Para onde vai: o motor catalogo.js desenha tudo; esta folha só diz o que é faceta, em que ordem e com
   que nome. Outra coleção (museus, causas, cursos) é outra folha como esta. */
(function () {
  'use strict';
  window.Catalogo.montar({
    arquivo: 'Ferramentas e Plataformas',
    grupo: 'Área',
    nome: 'Nome', texto: 'O que faz', link: 'Link',
    unidade: ['ferramenta', 'ferramentas'],
    busca: 'Buscar por nome ou pelo que faz (tecla /)',
    facetas: [
      { campo: 'Área', nome: 'Área' },
      { campo: 'Para quê', nome: 'Para quê', varios: true, ordem: ['aprender', 'criar', 'programar', 'pesquisar', 'organizar', 'publicar', 'cuidar'] },
      { campo: 'IA', nome: 'IA', ordem: ['sim', 'não'], rotulos: { sim: 'com IA', 'não': 'sem IA' } },
      { campo: 'Preço', nome: 'Preço', ordem: ['grátis', 'aberto', 'grátis + pago', 'pago'], rotulos: { aberto: 'código aberto' } },
      { campo: 'Onde', nome: 'Onde', varios: true, ordem: ['navegador', 'celular', 'computador'] },
      { campo: 'Nível', nome: 'Nível', ordem: ['começar', 'meio', 'avançado'], rotulos: { 'começar': 'para começar', meio: 'no meio do caminho' } },
    ],
    colunas: ['Área', 'Para quê', 'IA', 'Preço', 'Onde', 'Nível'],
    cartao: {
      cima: 'Área',
      baixo: ['Preço', 'Nível', 'Onde'],
      selo: function (it) { return it.IA === 'sim' ? 'com IA' : ''; },
    },
    textoResumo: function (itens) {
      var comIA = itens.filter(function (it) { return it.IA === 'sim'; }).length;
      var areas = {};
      itens.forEach(function (it) { areas[it['Área']] = 1; });
      return '<b>' + itens.length + ' ferramentas e plataformas</b> para aprender, criar e programar, ' + comIA + ' com IA e ' + (itens.length - comIA) +
        ' sem, em ' + Object.keys(areas).length + ' áreas. Cada toque numa etiqueta deixa só o que serve, e o número ao lado diz quantas ela traz.';
    },
    textoNota: function (fichaId) {
      return 'A lista mora no caderno, no arquivo do Atlas <a href="biblioteca.html#f=' + encodeURIComponent(fichaId) + '">Ferramentas e Plataformas</a>: uma tabela por área. ' +
        'Os links foram conferidos em 27/out/2026; o resto foi escrito de memória, e preços e planos mudam: confira no site antes de assinar. ' +
        'Para somar uma ferramenta, escreva uma linha na tabela; o endereço desta página guarda os filtros, então mandar o link é mandar a busca pronta.';
    },
  });
})();
