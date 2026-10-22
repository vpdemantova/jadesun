/* ============================================================
   O AVISO — os dados (21/out/2026, registro 114)
   Pedido dele: "coloque um aviso de que essa interface é emergencial e provisória, link em baixo
   as causas e as notícias mais necessárias, avanços, novas tecnologias, tendências, pra cada pessoa
   e profissional ficar a par de tudo! na sua área e no mundo vasto".

   A regra da curadoria vale aqui: cada fonte com o porquê; fonte aberta ou de serviço público
   sempre que possível; link novo só depois de aberto (todos foram abertos no Chrome em 21/out/2026;
   os que nem o navegador abriu, por barrarem robôs, ficaram de fora).
   As notícias não se repetem aqui: vêm das fontes do Guias (guias-dados.js), pelo id; as áreas, do
   mapa de Todas as áreas (campos-dados.js). Para mudar o texto ou uma coluna, mude só este arquivo.
   ============================================================ */
(function (raiz) {
  'use strict';

  var QUANDO = '21 de outubro de 2026';

  var TEXTO = {
    rotulo: 'Aviso',
    titulo: 'Esta interface é emergencial e provisória.',
    corpo: 'Ela fica no ar enquanto o Portal Solar inteiro é refeito: local-first, em texto corrido e com todos os produtos num lugar só. ' +
      'Até lá, cumpre o que não pode esperar: levar cada pessoa às causas que precisam de ajuda agora e ao que muda no mundo e na sua área.',
    assinatura: 'Seleção de ' + QUANDO + ', aberta link a link. Fontes abertas ou de serviço público sempre que possível; nenhuma paga para estar aqui.',
  };

  /* as cinco colunas do mundo vasto: [id, título, linha-fina, fontes, links de dentro do Portal]
     fonte = [nome, endereço, por que está aqui]; ou { guias: 'id' } para usar a do Guias.
     link de dentro = [página (o id do mapa), endereço, nome]; some se a página não estiver neste site. */
  var COLUNAS = [
    ['causas', 'As causas', 'onde a ajuda falta agora', [
      ['OCHA', 'https://www.unocha.org/', 'as crises humanitárias, coordenadas pela ONU'],
      ['HungerMap LIVE', 'https://hungermap.wfp.org/', 'a fome no mundo, quase em tempo real (PMA)'],
      ['MapBiomas', 'https://brasil.mapbiomas.org/', 'o território brasileiro, ano a ano, em dados abertos'],
      ['Climate Action Tracker', 'https://climateactiontracker.org/', 'o que cada país promete e cumpre no clima'],
    ], [['doar', 'doar.html', 'Doar'], ['guias', 'guias.html#necessidades', 'Os 17 ODS']]],
    ['mundo', 'O mundo agora', 'as notícias necessárias', [
      { guias: 'onu' }, { guias: 'bbcbrasil' }, { guias: 'publica' }, { guias: 'aljazeera' },
    ], [['guias', 'guias.html#mundo', 'As 22 fontes do Guias']]],
    ['avancos', 'Os avanços', 'a ciência que acabou de sair', [
      ['Nature', 'https://www.nature.com/news', 'a revista de referência desde 1869'],
      ['EurekAlert!', 'https://www.eurekalert.org/', 'as pesquisas no dia em que saem (AAAS)'],
      ['Quanta Magazine', 'https://www.quantamagazine.org/', 'matemática, física, biologia e computação, sem anúncio'],
      ['Agência FAPESP', 'https://agencia.fapesp.br/', 'a ciência feita no Brasil, todo dia'],
    ], []],
    ['tecnologias', 'As novas tecnologias', 'o que muda o trabalho e a vida', [
      ['MIT Technology Review', 'https://www.technologyreview.com/', 'a tecnologia que vem aí, com crítica'],
      ['IEEE Spectrum', 'https://spectrum.ieee.org/', 'a revista dos engenheiros (IEEE)'],
      ['Rest of World', 'https://restofworld.org/', 'a tecnologia fora do Vale do Silício'],
      ['Núcleo', 'https://nucleo.jor.br/', 'tecnologia e internet, do Brasil'],
    ], []],
    ['tendencias', 'As tendências', 'os números que mostram para onde vamos', [
      ['Our World in Data', 'https://ourworldindata.org/', 'os grandes problemas, em dados abertos (Oxford)'],
      ['Desenvolvimento Humano', 'https://hdr.undp.org/', 'o relatório do PNUD: a vida das pessoas medida'],
      ['AI Index', 'https://hai.stanford.edu/ai-index', 'a inteligência artificial medida ano a ano (Stanford)'],
      ['Ember', 'https://ember-energy.org/', 'a eletricidade do mundo, em dados abertos'],
    ], []],
  ];

  /* "Na sua área" (as 21 áreas, três fontes cada) saiu daqui em 21/out/2026 (registro 115): as áreas moram
     num lugar só, o mapa de Todas as áreas (campos-dados.js), e as três primeiras fontes de cada uma são as do aviso. */

  var api = { quando: QUANDO, texto: TEXTO, colunas: COLUNAS, areas: [] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.AVISO = api;
})(typeof window !== 'undefined' ? window : globalThis);
