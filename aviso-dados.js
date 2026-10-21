/* ============================================================
   O AVISO — os dados (21/out/2026, registro 114)
   Pedido dele: "coloque um aviso de que essa interface é emergencial e provisória, link em baixo
   as causas e as notícias mais necessárias, avanços, novas tecnologias, tendências, pra cada pessoa
   e profissional ficar a par de tudo! na sua área e no mundo vasto".

   A regra da curadoria vale aqui: cada fonte com o porquê; fonte aberta ou de serviço público
   sempre que possível; link novo só depois de aberto (todos foram abertos no Chrome em 21/out/2026;
   os que nem o navegador abriu, por barrarem robôs, ficaram de fora).
   As notícias não se repetem aqui: vêm das fontes do Guias (guias-dados.js), pelo id.
   Para mudar o texto, uma fonte ou uma área, mude só este arquivo.
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

  /* na sua área: [id, nome, [notícias, pesquisa, no Brasil ou os dados]]; cada fonte = [nome, endereço, por quê] */
  var AREAS = [
    ['saude', 'Saúde', [
      ['OMS', 'https://www.who.int/news', 'as notícias da saúde no mundo'],
      ['STAT', 'https://www.statnews.com/', 'a fronteira da medicina e da saúde'],
      ['Agência Fiocruz', 'https://agencia.fiocruz.br/', 'a saúde pública no Brasil']]],
    ['educacao', 'Educação', [
      ['UNESCO', 'https://www.unesco.org/en/education', 'a educação no mundo'],
      ['Porvir', 'https://porvir.org/', 'o que se inventa nas escolas do Brasil'],
      ['Todos Pela Educação', 'https://todospelaeducacao.org.br/', 'dados e política da educação básica']]],
    ['ciencia', 'Ciência e pesquisa', [
      ['Nature', 'https://www.nature.com/news', 'as notícias da ciência'],
      ['Pesquisa FAPESP', 'https://revistapesquisa.fapesp.br/', 'a pesquisa brasileira, explicada'],
      ['SciELO', 'https://www.scielo.br/', 'os artigos da América Latina, de acesso aberto']]],
    ['tecnologia', 'Tecnologia e computação', [
      ['Rest of World', 'https://restofworld.org/', 'a tecnologia no mundo inteiro'],
      ['AI Index', 'https://hai.stanford.edu/ai-index', 'o estado da inteligência artificial'],
      ['Núcleo', 'https://nucleo.jor.br/', 'as plataformas e a internet no Brasil']]],
    ['engenharia', 'Engenharia e indústria', [
      ['IEEE Spectrum', 'https://spectrum.ieee.org/', 'a engenharia de ponta'],
      ['Inovação Tecnológica', 'https://www.inovacaotecnologica.com.br/', 'a pesquisa aplicada, em português'],
      ['ISO', 'https://www.iso.org/insights', 'as normas que o mundo usa']]],
    ['energia', 'Energia', [
      ['Ember', 'https://ember-energy.org/', 'a transição elétrica, em dados'],
      ['Our World in Data', 'https://ourworldindata.org/energy', 'a energia do mundo, país por país'],
      ['EPE', 'https://www.epe.gov.br/pt', 'o planejamento energético do Brasil']]],
    ['clima', 'Clima', [
      ['IPCC', 'https://www.ipcc.ch/', 'o consenso científico sobre o clima'],
      ['Carbon Brief', 'https://www.carbonbrief.org/', 'clima com dados e checagem'],
      ['Observatório do Clima', 'https://oc.eco.br/', 'a política climática no Brasil']]],
    ['florestas', 'Florestas e biodiversidade', [
      ['Mongabay', 'https://news.mongabay.com/', 'florestas e vida selvagem, sem fins lucrativos'],
      ['Global Nature Watch', 'https://globalnaturewatch.org/', 'o desmatamento visto por satélite'],
      ['((o))eco', 'https://oeco.org.br/', 'o jornalismo ambiental brasileiro']]],
    ['agro', 'Agro e alimentação', [
      ['FAO', 'https://www.fao.org/newsroom/en', 'a comida e a fome no mundo'],
      ['Embrapa', 'https://www.embrapa.br/busca-de-noticias', 'a pesquisa agropecuária brasileira'],
      ['Civil Eats', 'https://civileats.com/', 'o sistema alimentar, de quem planta a quem come']]],
    ['direito', 'Direito e justiça', [
      ['JOTA', 'https://www.jota.info/', 'os tribunais e o Estado, por dentro'],
      ['Conjur', 'https://conjur.com.br/', 'o dia a dia do direito brasileiro'],
      ['CNJ', 'https://www.cnj.jus.br/', 'os dados e as decisões do Judiciário']]],
    ['economia', 'Economia e trabalho', [
      ['OIT', 'https://www.ilo.org/', 'o trabalho no mundo'],
      ['Banco Mundial', 'https://blogs.worldbank.org/en/home', 'o desenvolvimento explicado por quem pesquisa'],
      ['Agência IBGE', 'https://agenciadenoticias.ibge.gov.br/', 'o Brasil em números oficiais']]],
    ['cidades', 'Arquitetura e cidades', [
      ['ArchDaily', 'https://www.archdaily.com/pt', 'as obras do mundo, em português'],
      ['Caos Planejado', 'https://caosplanejado.com/', 'as cidades brasileiras pensadas a fundo'],
      ['LabCidade', 'https://labcidade.fau.usp.br/', 'o direito à cidade, da FAU USP']]],
    ['design', 'Design', [
      ['Dezeen', 'https://www.dezeen.com/', 'arquitetura e design, todo dia'],
      ['It’s Nice That', 'https://www.itsnicethat.com/', 'o design gráfico e a ilustração de agora'],
      ['Eye on Design', 'https://eyeondesign.aiga.org/', 'a crítica de design da AIGA']]],
    ['arte', 'Arte e cultura', [
      ['The Art Newspaper', 'https://www.theartnewspaper.com/', 'o mundo da arte, com apuração'],
      ['e-flux', 'https://www.e-flux.com/', 'a arte contemporânea e o pensamento'],
      ['ZUM', 'https://revistazum.com.br/', 'a fotografia, do Instituto Moreira Salles']]],
    ['musica', 'Música', [
      ['Bachtrack', 'https://bachtrack.com/', 'a música de concerto no mundo'],
      ['Revista Concerto', 'https://www.concerto.com.br/', 'a música clássica no Brasil'],
      ['NPR Music', 'https://www.npr.org/music', 'a música nova, da rádio pública americana']]],
    ['jornalismo', 'Jornalismo e comunicação', [
      ['Nieman Lab', 'https://www.niemanlab.org/', 'o futuro do jornalismo (Harvard)'],
      ['Reuters Institute', 'https://reutersinstitute.politics.ox.ac.uk/', 'como o mundo se informa (Oxford)'],
      ['Abraji', 'https://www.abraji.org.br/', 'o jornalismo investigativo no Brasil']]],
    ['mente', 'Mente e comportamento', [
      ['Psyche', 'https://psyche.co/', 'psicologia e filosofia para viver'],
      ['APA Monitor', 'https://www.apa.org/monitor', 'a psicologia como profissão'],
      ['The Transmitter', 'https://www.thetransmitter.org/', 'a neurociência de agora']]],
    ['sociedade', 'Sociedade e direitos', [
      ['Pew Research', 'https://www.pewresearch.org/', 'o que as pessoas pensam, em pesquisas abertas'],
      ['Fórum de Segurança', 'https://forumseguranca.org.br/', 'a violência no Brasil, em dados'],
      ['Anistia Internacional', 'https://anistia.org.br/', 'os direitos humanos no Brasil']]],
    ['espaco', 'Espaço', [
      ['NASA', 'https://www.nasa.gov/', 'o espaço, direto da agência'],
      ['ESA', 'https://www.esa.int/', 'a agência espacial europeia'],
      ['INPE', 'https://www.gov.br/inpe/pt-br', 'satélites, clima e espaço no Brasil']]],
    ['humanidades', 'Filosofia e humanidades', [
      ['Aeon', 'https://aeon.co/', 'ensaios de filosofia, ciência e cultura'],
      ['Daily Nous', 'https://dailynous.com/', 'a filosofia como profissão'],
      ['Public Domain Review', 'https://publicdomainreview.org/', 'as obras raras em domínio público']]],
    ['impacto', 'Terceiro setor e impacto', [
      ['SSIR', 'https://ssir.org/', 'a inovação social, de Stanford'],
      ['GIFE', 'https://gife.org.br/', 'o investimento social no Brasil'],
      ['Observatório do Terceiro Setor', 'https://observatorio3setor.org.br/', 'as organizações e as causas']]],
  ];

  var api = { quando: QUANDO, texto: TEXTO, colunas: COLUNAS, areas: AREAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.AVISO = api;
})(typeof window !== 'undefined' ? window : globalThis);
