/* ============================================================
   AS ENERGIAS — os dados (22/out/2026, registro 116)
   Do pedido do Atlas digital: "…todas as energias…". As formas da energia (com a fórmula, quando
   o livro dá uma), como uma vira a outra e de onde vem cada fonte: do Sol, da Lua, de dentro da
   Terra e dos átomos. Cada frase foi conferida no texto da fonte em 22/out/2026 (o id em FONTES).
   Sem números de consumo: os do livro de física são de 2006, e os de agora envelhecem; ficam nos
   links de "Os números de agora", que se atualizam sozinhos.
   ============================================================ */
(function (raiz) {
  'use strict';

  var FONTES = {
    cp72: ['OpenStax, College Physics 2e, 7.2 Kinetic Energy and the Work-Energy Theorem', 'https://openstax.org/books/college-physics-2e/pages/7-2-kinetic-energy-and-the-work-energy-theorem', 'livro aberto de física (CC BY 4.0)'],
    cp73: ['OpenStax, College Physics 2e, 7.3 Gravitational Potential Energy', 'https://openstax.org/books/college-physics-2e/pages/7-3-gravitational-potential-energy', 'livro aberto de física (CC BY 4.0)'],
    cp74: ['OpenStax, College Physics 2e, 7.4 Conservative Forces and Potential Energy', 'https://openstax.org/books/college-physics-2e/pages/7-4-conservative-forces-and-potential-energy', 'livro aberto de física (CC BY 4.0)'],
    cp76: ['OpenStax, College Physics 2e, 7.6 Conservation of Energy', 'https://openstax.org/books/college-physics-2e/pages/7-6-conservation-of-energy', 'livro aberto de física (CC BY 4.0)'],
    cp79: ['OpenStax, College Physics 2e, 7.9 World Energy Use', 'https://openstax.org/books/college-physics-2e/pages/7-9-world-energy-use', 'livro aberto de física (CC BY 4.0): o que é renovável'],
    cp326: ['OpenStax, College Physics 2e, 32.6 Fission', 'https://openstax.org/books/college-physics-2e/pages/32-6-fission', 'livro aberto de física (CC BY 4.0)'],
    q51: ['OpenStax, Chemistry 2e, 5.1 Energy Basics', 'https://openstax.org/books/chemistry-2e/pages/5-1-energy-basics', 'livro aberto de química (CC BY 4.0)'],
    a162: ['OpenStax, Astronomy 2e, 16.2 Mass, Energy, and the Theory of Relativity', 'https://openstax.org/books/astronomy-2e/pages/16-2-mass-energy-and-the-theory-of-relativity', 'livro aberto de astronomia (CC BY 4.0)'],
    b81: ['OpenStax, Biology 2e, 8.1 Overview of Photosynthesis', 'https://openstax.org/books/biology-2e/pages/8-1-overview-of-photosynthesis', 'livro aberto de biologia (CC BY 4.0)'],
    wpvento: ['Wikipedia, Wind', 'https://en.wikipedia.org/wiki/Wind', 'as causas do vento (CC BY-SA 4.0)'],
    wpondas: ['Wikipedia, Wave power', 'https://en.wikipedia.org/wiki/Wave_power', 'a energia das ondas (CC BY-SA 4.0)'],
    wpagua: ['Wikipedia, Water cycle', 'https://en.wikipedia.org/wiki/Water_cycle', 'o ciclo da água (CC BY-SA 4.0)'],
    wpmare: ['Wikipedia, Tidal power', 'https://en.wikipedia.org/wiki/Tidal_power', 'a energia das marés (CC BY-SA 4.0)'],
    wpgeo: ['Wikipedia, Geothermal energy', 'https://en.wikipedia.org/wiki/Geothermal_energy', 'o calor de dentro da Terra (CC BY-SA 4.0)'],
    wpfossil: ['Wikipedia, Fossil fuel', 'https://en.wikipedia.org/wiki/Fossil_fuel', 'os combustíveis fósseis (CC BY-SA 4.0)'],
    wppv: ['Wikipedia, Photovoltaics', 'https://en.wikipedia.org/wiki/Photovoltaics', 'a luz que vira eletricidade (CC BY-SA 4.0)'],
    wpfusao: ['Wikipedia, Nuclear fusion', 'https://en.wikipedia.org/wiki/Nuclear_fusion', 'a fusão nas estrelas (CC BY-SA 4.0)'],
    wpnr: ['Wikipedia, Non-renewable resource', 'https://en.wikipedia.org/wiki/Non-renewable_resource', 'o que se gasta e não volta, e o urânio (CC BY-SA 4.0)'],
  };

  /* os números do cabeçalho: [o número, o que ele mede, fonte] */
  var DESTAQUES = [
    ['4 milhões', 'de toneladas de matéria viram energia dentro do Sol, a cada segundo', 'a162'],
    ['40%', 'da energia do carvão vira eletricidade numa usina; o resto vira outras formas, como calor', 'cp76'],
    ['350 a 200', 'milhões de anos: a idade da luz do Sol guardada no carvão e no petróleo', 'b81'],
    ['0,72%', 'do urânio natural é o urânio-235, o que a maioria dos reatores usa', 'cp326'],
    ['20%', 'do calor de dentro da Terra sobrou da formação do planeta', 'wpgeo'],
  ];

  /* a lei e o que vem dela: [nome, a frase, fontes] */
  var LEI = [
    ['A lei', 'Em qualquer processo, a energia total não muda: ela pode mudar de forma ou passar de um sistema a outro, mas o total continua o mesmo.', ['cp76']],
    ['O Sol', 'A maior parte das fontes de energia da Terra é energia guardada da que recebemos do Sol.', ['cp76']],
    ['A massa', 'A massa também é energia (E = mc²): é a massa que vira energia que dá ao Sol o calor e a luz.', ['a162']],
    ['A eficiência', 'Nada se perde, mas nem tudo vira o que se quer: eficiência é a parte que sobra útil, em vez de virar, por exemplo, calor.', ['cp76']],
  ];

  /* as formas: [id, nome, fórmula ou '', o que é, por exemplo, fontes] */
  var FORMAS = [
    ['cinetica', 'Cinética', 'E = ½ m v²', 'A energia do movimento: cresce com a massa e com o quadrado da velocidade.', 'a montanha-russa na descida', ['cp72', 'cp73']],
    ['gravitacional', 'Potencial gravitacional', 'E = m g h', 'A energia da altura: a de um corpo de massa m a uma altura h, perto do chão da Terra.', 'a água no alto da cachoeira ou da represa', ['cp73', 'q51']],
    ['elastica', 'Potencial elástica', 'E = ½ k x²', 'A energia guardada numa mola esticada ou comprimida de um comprimento x.', 'o relógio de corda, o timer da cozinha, o brinquedo de dar corda', ['cp74']],
    ['quimica', 'Química', '', 'Um tipo de energia potencial, guardada nas moléculas; sai numa reação, como a queima da gasolina no motor.', 'a gasolina, o almoço, o carvão', ['q51']],
    ['termica', 'Térmica', '', 'A energia cinética do movimento desordenado dos átomos e das moléculas; ligada à temperatura.', 'o vapor da caldeira', ['q51', 'cp76']],
    ['eletrica', 'Elétrica', '', 'Uma forma comum, que se converte em muitas outras e faz trabalho num sem-número de situações práticas.', 'a pilha, a usina', ['cp76']],
    ['radiante', 'Radiante', '', 'A que recebemos do Sol: a radiação eletromagnética, que inclui a luz visível, o infravermelho e o ultravioleta.', 'a luz do dia', ['cp76']],
    ['nuclear', 'Nuclear', 'E = m c²', 'A que vem de processos em que uma parte mensurável da massa vira energia.', 'o Sol, as usinas nucleares', ['cp76', 'a162']],
  ];

  /* como uma vira a outra: [de, para, como, fontes] */
  var VIRA = [
    ['nuclear', 'radiante', 'No Sol, a massa vira a luz do dia.', ['cp76', 'a162']],
    ['radiante', 'quimica', 'Na fotossíntese, a luz que a clorofila absorve vira energia química guardada.', ['cp76', 'b81']],
    ['radiante', 'eletrica', 'No painel solar, a luz vira eletricidade num material semicondutor.', ['wppv']],
    ['quimica', 'termica', 'O alimento vira calor no metabolismo; o carvão, queimando na caldeira, ferve a água.', ['cp76']],
    ['quimica', 'cinetica', 'A gasolina queima no cilindro e os gases empurram o pistão do motor.', ['q51']],
    ['quimica', 'eletrica', 'A pilha tira eletricidade de uma reação química.', ['cp76']],
    ['termica', 'cinetica', 'O vapor da caldeira gira a turbina.', ['cp76']],
    ['cinetica', 'eletrica', 'A turbina, ligada ao gerador, faz eletricidade.', ['cp76']],
    ['gravitacional', 'cinetica', 'A água que cai perde altura e ganha velocidade.', ['q51']],
    ['gravitacional', 'cinetica', 'A montanha-russa desce e acelera; é mais rápida no ponto mais baixo.', ['cp73']],
    ['nuclear', 'eletrica', 'Na usina nuclear, a massa vira eletricidade.', ['cp76']],
    ['eletrica', 'radiante', 'A pilha acende a luz, uma forma muito pura de energia.', ['cp76']],
    ['elastica', 'cinetica', 'A energia guardada na mola do brinquedo de corda volta como trabalho.', ['cp74']],
  ];
  /* uma usina a carvão, de ponta a ponta */
  var USINA = { formas: ['quimica', 'termica', 'cinetica', 'eletrica'], passos: ['o carvão queima', 'o vapor gira a turbina', 'o gerador'], nota: 'Cerca de 40% da energia química do carvão vira eletricidade útil; os outros 60% viram outras formas, como o calor que vai para o ambiente com os gases da queima e pelas torres de resfriamento.', fontes: ['cp76'] };

  /* as fontes: [id, origem, nome, como a energia chega até nós, renovável (true, false ou null quando as fontes não dizem), uso, fontes] */
  var FONTES_DE_ENERGIA = [
    ['solar', 'sol', 'Solar fotovoltaica', 'A luz vira eletricidade nos módulos solares, feitos de células de material semicondutor (o efeito fotovoltaico).', true, 'em uso', ['wppv', 'cp79']],
    ['vento', 'sol', 'Vento', 'O ar se move porque o Sol esquenta o equador mais que os polos, e porque a Terra gira (o efeito Coriolis).', true, 'em uso', ['wpvento', 'cp79']],
    ['ondas', 'sol', 'Ondas', 'Energia de terceira mão: o Sol esquenta a Terra de modo desigual, isso faz o vento, e o vento sobre o mar faz as ondas. Até 2023, quase não tinha uso comercial, depois de uma longa série de projetos de teste.', null, 'em testes', ['wpondas']],
    ['agua', 'sol', 'Água dos rios', 'O ciclo da água é movido pelo Sol: ele evapora a água, que volta como chuva; no alto da represa, ela tem energia de altura, e ao descer pelos geradores, vira eletricidade.', true, 'em uso', ['wpagua', 'q51', 'cp79']],
    ['biomassa', 'sol', 'Biomassa', 'A energia que a fotossíntese guardou nas plantas, a partir da luz: a lenha, o esterco.', true, 'em uso', ['b81', 'cp79']],
    ['fosseis', 'sol', 'Carvão, petróleo e gás', 'Restos soterrados de organismos de antes da história. A energia tirada hoje do carvão e do petróleo é luz do Sol guardada pela fotossíntese de 350 a 200 milhões de anos atrás, no período Carbonífero.', false, 'em uso', ['wpfossil', 'b81', 'cp79']],
    ['mares', 'lua', 'Marés', 'O mar sobe e desce pela gravidade da Lua e do Sol e pela rotação da Terra, de um jeito regular e previsível, mais que o vento e o sol. Por isso a maré é contada como renovável.', true, 'em uso', ['wpmare']],
    ['geotermica', 'terra', 'Geotérmica', 'O calor de dentro da Terra: cerca de 20% sobrou da formação do planeta; o resto vem da radioatividade natural. Contada como renovável porque o que se tira é ínfimo perto do calor que a Terra tem.', true, 'em uso', ['wpgeo']],
    ['fissao', 'atomo', 'Fissão nuclear', 'O núcleo pesado do urânio se parte, a massa diminui e a energia sai. A maioria dos reatores usa o urânio-235, só 0,72% do urânio natural, tirado de minas; a fissão comum não é contada como renovável.', false, 'em uso', ['cp326', 'wpnr']],
    ['fusao', 'atomo', 'Fusão nuclear', 'Núcleos leves se juntam e soltam energia: é o que acende as estrelas, o Sol também. Nas usinas, a tecnologia ainda está em desenvolvimento.', null, 'em desenvolvimento', ['wpfusao']],
  ];
  var ORIGENS_DE = [
    ['sol', 'Do Sol', 'a luz de agora, e a de milhões de anos atrás'],
    ['lua', 'Da Lua', 'a gravidade dela sobre o mar'],
    ['terra', 'De dentro da Terra', 'o calor guardado no planeta'],
    ['atomo', 'Dos átomos', 'a massa que vira energia'],
  ];
  /* os caminhos: [origem, o passo (como a energia chega), [as fontes, em cadeia], o que acontece entre elas] */
  var CAMINHOS = [
    ['sol', 'a luz', ['solar']],
    ['sol', 'o calor desigual', ['vento', 'ondas'], 'o vento sopra sobre o mar'],
    ['sol', 'a evaporação e a chuva', ['agua']],
    ['sol', 'a fotossíntese', ['biomassa', 'fosseis'], 'soterrada por milhões de anos'],
    ['lua', 'a gravidade e a rotação', ['mares']],
    ['terra', 'o calor de dentro', ['geotermica']],
    ['atomo', 'partir um núcleo pesado', ['fissao']],
    ['atomo', 'juntar núcleos leves', ['fusao']],
  ];
  /* e no fundo: [a frase, fontes] */
  var NO_FUNDO = ['Quase tudo, no fundo, vem dos átomos: a luz do Sol é a fusão dentro dele, e a maior parte do calor de dentro da Terra é radioatividade. As marés são a exceção: vêm da gravidade e da rotação.', ['a162', 'wpfusao', 'wpgeo', 'wpmare']];

  /* os números de agora: não ficam aqui (envelhecem); ficam nas fontes abertas, com o porquê */
  var NUMEROS = [
    ['Our World in Data, Energy', 'https://ourworldindata.org/energy', 'A energia do mundo, país por país e ano a ano, em dados abertos (Universidade de Oxford).'],
    ['Ember, os dados da eletricidade', 'https://ember-energy.org/data/', 'A eletricidade do mundo, de que fonte vem, mês a mês, em dados abertos.'],
    ['EPE, o Balanço Energético Nacional', 'https://www.epe.gov.br/pt/publicacoes-dados-abertos/publicacoes/balanco-energetico-nacional-ben', 'A energia do Brasil, todo ano, da Empresa de Pesquisa Energética.'],
  ];

  var api = { fontes: FONTES, destaques: DESTAQUES, lei: LEI, formas: FORMAS, vira: VIRA, usina: USINA, fontesDeEnergia: FONTES_DE_ENERGIA, origensDe: ORIGENS_DE, caminhos: CAMINHOS, noFundo: NO_FUNDO, numeros: NUMEROS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.ENERGIAS = api;
})(typeof window !== 'undefined' ? window : globalThis);
