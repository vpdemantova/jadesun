/* ============================================================
   A LUZ — os dados (21/out/2026, registro 115)
   Pedido dele: "outro que mostre todas as alternativas de iluminação, do móvel à cidade, repensando
   tudo… portal solar: somos projetos do sol, devemos espelhar as obras da luz".

   Duas partes, e nada mais:
   · AS ALTERNATIVAS: todas as maneiras de ter luz, em seis famílias (do Sol direto à escuridão
     escolhida). O que é de definição não leva fonte; número e data levam.
   · A ESCADA: sete escalas, do olho ao céu, a mesma régua da escada de Saarinen que está no caderno
     (Praticas/Arquitetura.md: "desenhe sempre uma coisa pensando no contexto maior seguinte").
     Em cada degrau: o texto, os princípios (com a fonte ao lado), as obras e o que fazer amanhã.
   Regra da curadoria: link novo só depois de aberto (todos abertos em 21/out/2026; os que só abrem
   num navegador de verdade foram abertos no Chrome). Para mudar, mude só este arquivo.
   ============================================================ */
(function (raiz) {
  'use strict';

  var QUANDO = '21 de outubro de 2026';

  var TEXTO = {
    titulo: 'A Luz',
    linha: 'todas as alternativas de iluminação, do móvel à cidade',
    lema: 'Somos projetos do Sol: devemos espelhar as obras da luz.',
    lemaDe: 'Vitor de Mantova, 2026',
    corpo: 'Antes de acender uma lâmpada, existe o Sol; depois dela, existe o céu. Esta página põe todas as alternativas de luz numa mesa só ' +
      'e sobe uma escada de sete degraus, do olho ao céu, perguntando em cada um o que a luz deve fazer, e o que ela não deve.',
    metodo: 'Seleção de ' + QUANDO + '. Cada número traz a fonte ao lado, aberta link a link; quando a ciência discorda, as duas partes aparecem.',
  };

  /* as cinco perguntas antes de qualquer luz (a síntese da página: o Sol primeiro, depois os cinco princípios da DarkSky e da IES) */
  var PERGUNTAS = [
    ['Precisa?', 'Primeiro a luz do dia; depois, só a luz que alguém vai usar.'],
    ['De onde vem?', 'Do Sol, direto ou guardado; da chama; da rede; da vida.'],
    ['Para onde vai?', 'Para baixo e para a tarefa, nunca para o céu nem para o olho.'],
    ['Quanta?', 'A menor que serve; o olho se adapta.'],
    ['Quando?', 'Clara de dia, baixa e quente à noite, nenhuma para dormir.'],
  ];

  /* as alternativas: [id, família, o que une a família, itens]; item = [nome, como funciona, onde serve] */
  var ALTERNATIVAS = [
    ['sol', 'Do Sol, direto', 'a luz do dia, deixada entrar, conduzida, filtrada ou refletida', [
      ['Janela', 'a abertura na parede; a luz vem de lado e muda com a hora', 'todo cômodo; de dois lados, melhor'],
      ['Claraboia e lanternim', 'a abertura no teto ou no alto da parede; a luz vem de cima', 'cômodos fundos, galpões, escadas'],
      ['Prateleira de luz', 'uma aba clara na janela que sombreia embaixo e joga a luz para o teto', 'salas fundas, escritórios, escolas'],
      ['Tubo de luz', 'um tubo espelhado que leva o sol do telhado até o forro', 'banheiros, corredores, cômodos sem janela'],
      ['Garrafa de Moser', 'uma garrafa de água num furo do telhado, que refrata o sol para dentro', 'casas sem luz elétrica de dia'],
      ['Espelho e heliostato', 'um espelho que acompanha o Sol e o reflete onde ele não chega', 'pátios, praças em vales, poços de luz'],
      ['Cobogó e muxarabi', 'um muro vazado que filtra a luz e deixa passar o ar', 'varandas, fachadas, divisórias'],
      ['Brise-soleil', 'lâminas fora da janela que cortam o sol direto e deixam a luz', 'fachadas ao sol, no clima quente'],
      ['Superfícies claras', 'paredes, tetos e pisos claros que devolvem a luz', 'qualquer cômodo, de graça'],
    ]],
    ['guardado', 'Do Sol, guardado', 'o Sol do dia, guardado numa bateria para a noite', [
      ['Lanterna solar', 'uma placa pequena, uma bateria e um LED, na mão', 'casas sem rede, a rua, o campo, as emergências'],
      ['Poste solar', 'a placa no alto do poste, a bateria e o LED; acende sozinho', 'estradas, praças e comunidades longe da rede'],
      ['Placa, bateria e LED', 'a casa que gera de dia a luz que usa à noite', 'casas e escolas, na rede ou fora dela'],
    ]],
    ['chama', 'Da chama', 'a luz mais antiga: o fogo que queima alguma coisa', [
      ['Vela', 'cera ou parafina, um pavio; luz baixa e quente', 'a mesa, o ritual, a falta de luz'],
      ['Lamparina e lampião', 'óleo, querosene ou gás num recipiente com pavio ou camisa', 'onde não há rede (com cuidado: fumaça e fogo)'],
      ['Fogueira e lareira', 'o fogo aberto: luz, calor e roda de gente', 'o encontro, o frio, o campo'],
    ]],
    ['rede', 'Da eletricidade', 'a luz da tomada, do filamento ao diodo', [
      ['Incandescente', 'um filamento aquecido até brilhar; quase toda a energia vira calor', 'saindo do mercado no Brasil desde 2012'],
      ['Halógena', 'a incandescente com gás halogênio; um pouco mais eficiente', 'restos de vitrines e faróis antigos'],
      ['Fluorescente', 'gás com mercúrio que faz brilhar o pó da parede do tubo', 'saindo do mundo, por causa do mercúrio'],
      ['Vapor de sódio e vapor metálico', 'descarga em gás sob alta pressão; amarela ou branca', 'postes e galpões de antes do LED'],
      ['LED', 'um diodo que emite luz quando a corrente passa; o mais eficiente', 'tudo, da lanterna à cidade'],
      ['OLED', 'uma lâmina orgânica que brilha inteira, sem ponto de luz', 'telas e luminárias planas'],
    ]],
    ['vida', 'Da vida e da química', 'a luz fria dos seres vivos e das reações', [
      ['Bioluminescência', 'seres vivos que fazem luz: vaga-lumes, fungos, plânctons e já plantas editadas', 'a pesquisa, o jardim, a noite escura'],
      ['Quimioluminescência', 'uma reação química que acende sem calor (o bastão de luz)', 'emergência, mergulho, festa'],
      ['Fotoluminescência', 'a tinta que guarda a luz do dia e devolve no escuro', 'rotas de fuga, degraus, interruptores'],
    ]],
    ['escuro', 'Nenhuma luz', 'a escolha de não acender', [
      ['A noite inteira', 'deixar escuro onde ninguém precisa ver', 'parques, quintais, matas, o céu'],
      ['O quarto escuro', 'escuridão para dormir', 'todo quarto'],
    ]],
  ];

  /* as fontes, uma vez só: id → [nome, endereço] */
  var F = {
    saarinen: ['Jorge Arango: o contexto maior seguinte (Saarinen)', 'https://jarango.com/2020/11/11/thinking-contextually/'],
    brown: ['Brown e outros, PLOS Biology, 2022', 'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001571'],
    ph: ['A lâmpada PH (Wikipédia)', 'https://en.wikipedia.org/wiki/PH-lamp'],
    akari: ['Noguchi Museum: a história das Akari', 'https://www.noguchi.org/isamu-noguchi/digital-features/the-history-of-akari-light-sculptures/'],
    arco: ['MoMA: Achille Castiglioni, Arco', 'https://www.moma.org/interactives/exhibitions/1997/castiglioni/arco.html'],
    littlesun: ['Tate Modern: Little Sun, 2012', 'https://www.tate.org.uk/whats-on/tate-modern/olafur-eliasson-little-sun'],
    kelly: ['Architect, as três luzes de Richard Kelly', 'https://www.architectmagazine.com/technology/lighting/richard-kellys-three-tenets-of-lighting-design_o'],
    alexander: ['Uma Linguagem de Padrões, padrão 159', 'https://www.patternlanguage.com/apl/apl159/apl159.htm'],
    ando: ['ArchDaily: a Igreja da Luz', 'https://www.archdaily.com/101260/ad-classics-church-of-the-light-tadao-ando'],
    norte: ['InfoEscola: arquitetura bioclimática', 'https://www.infoescola.com/arquitetura/arquitetura-bioclimatica'],
    cobogo: ['Revista ARQ (UFCG): o cobogó', 'https://revistas.editora.ufcg.edu.br/index.php/arql/article/download/6610/4674/14170'],
    capanema: ['Palácio Capanema (Wikipédia)', 'https://en.wikipedia.org/wiki/Gustavo_Capanema_Palace'],
    lina: ['Architectuul: o SESC Pompeia', 'https://architectuul.com/architecture/sesc-pompeia'],
    moser: ['BBC, 2013: Alfredo Moser', 'https://www.bbc.com/news/magazine-23536914'],
    darksky: ['DarkSky e IES: os cinco princípios', 'https://darksky.org/resources/guides-and-how-tos/lighting-principles/'],
    ama: ['NPR, 2016: a AMA e os postes de LED', 'https://www.npr.org/sections/thetwo-way/2016/06/21/482936520/bright-bluish-white-led-streetlamps-bad-for-our-health-ama-says'],
    ies: ['Inside Lighting, 2025: o debate da cor', 'https://inside.lighting/news/25-01/renewed-debate-streetlight-color-and-health-implications'],
    owens: ['Owens e outros, Biological Conservation, 2020', 'https://sites.warnercnr.colostate.edu/wp-content/uploads/sites/146/2020/11/biologicalconservation2020.pdf'],
    lyon: ['Cidade de Lyon: o Plano Luz', 'https://www.lyon.fr/projets-urbains/plan-lumiere'],
    flagstaff: ['Flagstaff Dark Skies Coalition', 'https://www.flagstaffdarkskies.org/international-dark-sky-city/'],
    viganella: ['Viganella (Wikipédia)', 'https://en.wikipedia.org/wiki/Viganella'],
    rjukan: ['The Local, 2013: os espelhos de Rjukan', 'https://www.thelocal.com/20131030/norway-town-beams-in-sunlight-with-giant-mirrors'],
    portaria: ['CLASP: a Portaria 1.007/2010', 'https://cprc-clasp.ngo/policies/mmemctmdic-ordinance-no-1007-31-december-2010'],
    proibida: ['eCycle, 2016: a venda proibida', 'https://www.ecycle.com.br/venda-de-lampadas-incandescentes-esta-oficialmente-proibida-no-pais/'],
    falchi: ['Falchi e outros, Science Advances, 2016', 'https://www.science.org/doi/10.1126/sciadv.1600377'],
    sdg7: ['Tracking SDG7, relatório de 2025', 'https://www.who.int/publications/m/item/2025-tracking-sdg7-report'],
    literoflight: ['Liter of Light (Wikipédia)', 'https://en.wikipedia.org/wiki/Liter_of_Light'],
    minamata: ['CLASP: a decisão da COP5 de Minamata', 'https://www.clasp.ngo/updates/cop5-decision/'],
    doe: ['Departamento de Energia dos EUA: o LED', 'https://www.energy.gov/eere/ssl/led-basics'],
    lightbio: ['Sunset, 2024: as petúnias da Light Bio', 'https://sunset.com/home-garden/flowers-plants/light-bio-firefly-petunias'],
    oms: ['OMS: diretrizes de combustíveis domésticos, 2014', 'https://www.who.int/publications/i/item/9789241548885'],
  };

  /* a escada: id, nome, escala (a medida), pergunta, texto, principios [texto, fonte], obras [nome, ano, quem, o que resolve, fonte], fazer */
  var ESCALAS = [
    { id: 'olho', nome: 'O olho', escala: 'o corpo', pergunta: 'Como a luz chega em nós?',
      texto: 'Toda iluminação termina num olho. Além de ver, ele mede o dia: uma parte da retina conta a luz e acerta o relógio do corpo, que decide quando acordar e quando dormir.',
      principios: [
        ['De dia, pelo menos 250 lux melanópicos no olho, de preferência luz do dia.', 'brown'],
        ['Nas três horas antes de dormir, no máximo 10 lux melanópicos.', 'brown'],
        ['Para dormir, no máximo 1 lux: o quarto escuro.', 'brown'],
      ],
      obras: [],
      fazer: 'Trabalhe perto da janela de manhã. À noite, luz baixa, quente e abaixo dos olhos. No quarto, escuro.' },

    { id: 'objeto', nome: 'O objeto', escala: 'o móvel', pergunta: 'O que uma luminária resolve?',
      texto: 'A luminária é um móvel que segura a luz. Os desenhos que duram resolvem um problema só, e bem: esconder a fonte, espalhar a luz, levá-la longe, ou levá-la para onde não há rede.',
      principios: [],
      obras: [
        ['PH', '1925–26', 'Poul Henningsen', 'cúpulas concêntricas escondem a lâmpada e só deixam sair a luz refletida: nada ofusca', 'ph'],
        ['Akari', '1951', 'Isamu Noguchi', 'a lanterna de Gifu, feita à mão com papel da casca da amoreira: a luz espalhada, sem ponto', 'akari'],
        ['Arco', '1962', 'Achille e Pier Giacomo Castiglioni', 'a luz que vem do alto sem furar o teto; duas pessoas a levam com um cabo de vassoura no furo da base de mármore', 'arco'],
        ['Little Sun', '2012', 'Olafur Eliasson e Frederik Ottesen', 'uma lâmpada solar de mão, para quem vive sem rede elétrica', 'littlesun'],
      ],
      fazer: 'Antes de comprar, olhe a luminária de lado: se a lâmpada aparece nua no olho, ela ofusca.' },

    { id: 'comodo', nome: 'O cômodo', escala: 'o quarto', pergunta: 'Como se compõe a luz de um lugar?',
      texto: 'Um cômodo bem iluminado tem camadas, como um quadro, e luz natural de mais de um lado.',
      principios: [
        ['Richard Kelly, 1952: três luzes. O brilho focal (o que se destaca), a luminescência ambiente (o banho que envolve) e o jogo de brilhos (o detalhe que cintila).', 'kelly'],
        ['Christopher Alexander, 1977: luz dos dois lados de cada cômodo; quando podem escolher, as pessoas ficam nos cômodos com luz de dois lados.', 'alexander'],
      ],
      obras: [
        ['Igreja da Luz', '1989', 'Tadao Ando', 'em Ibaraki, no Japão: a cruz é uma abertura no concreto da parede do leste, e a luz é o desenho', 'ando'],
      ],
      fazer: 'Uma luz geral fraca, luzes de tarefa onde se lê e se trabalha, um ponto de brilho; e um dimmer em tudo.' },

    { id: 'casa', nome: 'A casa', escala: 'a planta', pergunta: 'De onde vem o Sol?',
      texto: 'A casa é o primeiro instrumento solar: a orientação, as aberturas e as sombras decidem a luz antes de qualquer lâmpada.',
      principios: [
        ['No hemisfério sul, a fachada voltada para o norte recebe mais sol no inverno e menos no verão.', 'norte'],
      ],
      obras: [
        ['Cobogó', '1929', 'Amadeu Oliveira Coimbra, Ernest August Boeckmann e Antônio de Góis', 'o bloco vazado nascido em Pernambuco, com o nome feito das sílabas dos três: filtra a luz e deixa passar o ar', 'cobogo'],
        ['Ministério da Educação e Saúde', '1937–45', 'Lúcio Costa e equipe, com Le Corbusier', 'no Rio, hoje Palácio Capanema: os brises na fachada', 'capanema'],
        ['SESC Pompeia', '1977–86', 'Lina Bo Bardi', 'as janelas em forma de ameba nas torres de concreto, que ela chamava de buracos da guerra civil espanhola', 'lina'],
        ['Garrafa de Moser', '2002', 'Alfredo Moser, em Uberaba', 'água com um pouco de água sanitária numa garrafa presa no telhado: segundo a medição que ele contou à BBC, ilumina como uma lâmpada de 40 a 60 watts', 'moser'],
      ],
      fazer: 'Antes de pôr uma lâmpada, pergunte de onde vem o Sol, a que horas, e o que ele esquenta.' },

    { id: 'rua', nome: 'A rua', escala: 'o quarteirão', pergunta: 'A quem a luz da rua serve, e a quem fere?',
      texto: 'Na rua, a luz serve a quem anda; e alcança também quem dorme, os bichos e o céu.',
      principios: [
        ['Os cinco princípios da DarkSky e da IES: útil (só onde precisa), dirigida (para baixo), baixa (o mínimo que serve), controlada (timer, sensor, dimmer) e quente (pouca luz azul).', 'darksky'],
        ['A Associação Médica Americana, em 2016, recomendou nas ruas LED de 3000 K ou menos, com a luz bem coberta.', 'ama'],
        ['A IES discordou do limite de cor em 2017, e o autor do relatório da AMA, em 2025, defendeu uma luz ainda mais quente: o debate continua.', 'ies'],
        ['A luz artificial à noite é uma causa importante, e muitas vezes esquecida, do declínio dos insetos; ao contrário das outras, é relativamente simples de reverter.', 'owens'],
      ],
      obras: [],
      fazer: 'Na sua rua: postes com cúpula que não deixam a luz subir, luz quente, e luz mais baixa de madrugada.' },

    { id: 'cidade', nome: 'A cidade', escala: 'o mapa', pergunta: 'Uma cidade pode ter um plano de luz?',
      texto: 'Uma cidade pode desenhar a sua noite como desenha as suas ruas: o que se acende, o que fica escuro, e por quê.',
      principios: [
        ['A Portaria 1.007, de 31 de dezembro de 2010, fixou um rendimento mínimo para as lâmpadas incandescentes.', 'portaria'],
        ['Por causa dela, a venda das incandescentes de 41 a 60 W ficou proibida no Brasil em 30 de junho de 2016.', 'proibida'],
      ],
      obras: [
        ['Plano Luz de Lyon', '1989', 'a cidade de Lyon', 'o primeiro plano, para o centro inteiro, pensado para os morros e os rios; o terceiro cuida da noite: qualidade, sobriedade (sem luz contínua, pela biodiversidade) e quem vive ali', 'lyon'],
        ['Flagstaff', '2001', 'a cidade, no Arizona', 'a primeira Cidade Internacional do Céu Escuro do mundo', 'flagstaff'],
        ['O espelho de Viganella', '2006', 'a aldeia de Viganella, nos Alpes', 'sem sol direto de novembro a fevereiro, a aldeia pôs um espelho orientável na montanha', 'viganella'],
        ['Os espelhos de Rjukan', '2013', 'a cidade de Rjukan, na Noruega', 'seis meses por ano sem sol no fundo do vale; três espelhos que seguem o Sol, nos morros, iluminam 500 m² da praça', 'rjukan'],
      ],
      fazer: 'Pergunte à prefeitura: há um plano de iluminação? Os postes novos são de 3000 K ou menos? O que fica escuro de propósito?' },

    { id: 'ceu', nome: 'O céu', escala: 'o planeta', pergunta: 'O que a luz da Terra faz com a noite?',
      texto: 'Vista de cima, a Terra à noite mostra onde estamos e onde a luz falta. As duas coisas são verdade ao mesmo tempo: luz demais em uns lugares, nenhuma em outros.',
      principios: [
        ['Mais de 80% da humanidade vive sob um céu poluído de luz; nos Estados Unidos e na Europa, mais de 99%. A Via Láctea está escondida para um terço das pessoas.', 'falchi'],
        ['Mais de 666 milhões de pessoas ainda vivem sem eletricidade, segundo o relatório de 2025 sobre o ODS 7.', 'sdg7'],
        ['O LED é a tecnologia de iluminação mais eficiente: um bom LED dura de 30 a 50 mil horas; uma incandescente, cerca de mil.', 'doe'],
        ['Os países da Convenção de Minamata decidiram tirar do mercado as fluorescentes compactas (até 2025) e as tubulares (até 2027), por causa do mercúrio.', 'minamata'],
        ['A OMS recomenda não usar querosene em casa, por causa da fumaça e dos acidentes.', 'oms'],
      ],
      obras: [
        ['Liter of Light', '2011', 'Illac Diaz e a MyShelter Foundation, nas Filipinas', 'a garrafa de Moser virou movimento: luz de dia para casas sem rede', 'literoflight'],
        ['Firefly Petunia', '2024', 'Light Bio', 'uma petúnia com genes de um cogumelo luminoso, que brilha sozinha no escuro', 'lightbio'],
      ],
      fazer: 'Uma noite por mês, apague tudo e olhe para cima.' },
  ];

  var api = { quando: QUANDO, texto: TEXTO, perguntas: PERGUNTAS, alternativas: ALTERNATIVAS, fontes: F, escalas: ESCALAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.LUZ_DADOS = api;
})(typeof window !== 'undefined' ? window : globalThis);
