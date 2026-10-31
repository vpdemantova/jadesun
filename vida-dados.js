/* ============================================================
   A VIDA — o que é escrito à mão (22/out/2026, registro 116)
   Pedido dele: "quero o atlas mais parecido com um atlas digital, todas as espécies de animais,
   todos os reinos, todas as energias, todas as plantas, as formações delas, filtros de cada
   categoria e parte, divisões, formações, origens, geometrias, tipos de folha, galhos, tipo de
   penugens, etc!"

   A árvore (os reinos, os filos, as classes, as ordens e as contagens) vem do Catalogue of Life,
   em vida-arvore.js, gerado por vida-gerar.mjs. Aqui mora só o que é curadoria, e cada linha diz
   a fonte (o id em FONTES), conferida no texto da fonte em 22/out/2026:
   · os traços que filtram a árvore (simetria, corpo, esqueleto, cobertura, temperatura, plantas);
   · as formas, para desenhar e filtrar por parte (folhas, galhos, penas, corpos, geometrias);
   · as origens: quando cada grande grupo aparece no registro.
   Para mudar um texto, mude aqui; nada mais depende da redação.
   ============================================================ */
(function (raiz) {
  'use strict';

  /* [nome, endereço, o que é] */
  var FONTES = {
    col: ['Catalogue of Life, edição de 14 de outubro de 2026', 'https://www.catalogueoflife.org/', 'a lista das espécies descritas, revista por especialistas de cada grupo (CC BY 4.0)'],
    wd: ['Wikidata e Wikimedia Commons', 'https://www.wikidata.org/', 'os nomes em português e as imagens, cada imagem com o autor e a licença dela'],
    os251: ['OpenStax, Biology 2e, 25.1 Early Plant Life', 'https://openstax.org/books/biology-2e/pages/25-1-early-plant-life', 'livro aberto de biologia (CC BY 4.0)'],
    os261: ['OpenStax, Biology 2e, 26.1 Evolution of Seed Plants', 'https://openstax.org/books/biology-2e/pages/26-1-evolution-of-seed-plants', 'livro aberto de biologia (CC BY 4.0)'],
    os263: ['OpenStax, Biology 2e, 26.3 Angiosperms', 'https://openstax.org/books/biology-2e/pages/26-3-angiosperms', 'livro aberto de biologia (CC BY 4.0)'],
    os272: ['OpenStax, Biology 2e, 27.2 Features Used to Classify Animals', 'https://openstax.org/books/biology-2e/pages/27-2-features-used-to-classify-animals', 'livro aberto de biologia (CC BY 4.0)'],
    os282: ['OpenStax, Biology 2e, 28.2 Phylum Cnidaria', 'https://openstax.org/books/biology-2e/pages/28-2-phylum-cnidaria', 'livro aberto de biologia (CC BY 4.0)'],
    os286: ['OpenStax, Biology 2e, 28.6 Superphylum Ecdysozoa: Arthropods', 'https://openstax.org/books/biology-2e/pages/28-6-superphylum-ecdysozoa-arthropods', 'livro aberto de biologia (CC BY 4.0)'],
    os287: ['OpenStax, Biology 2e, 28.7 Superphylum Deuterostomia', 'https://openstax.org/books/biology-2e/pages/28-7-superphylum-deuterostomia', 'livro aberto de biologia (CC BY 4.0)'],
    os292: ['OpenStax, Biology 2e, 29.2 Fishes', 'https://openstax.org/books/biology-2e/pages/29-2-fishes', 'livro aberto de biologia (CC BY 4.0)'],
    os293: ['OpenStax, Biology 2e, 29.3 Amphibians', 'https://openstax.org/books/biology-2e/pages/29-3-amphibians', 'livro aberto de biologia (CC BY 4.0)'],
    os294: ['OpenStax, Biology 2e, 29.4 Reptiles', 'https://openstax.org/books/biology-2e/pages/29-4-reptiles', 'livro aberto de biologia (CC BY 4.0)'],
    os295: ['OpenStax, Biology 2e, 29.5 Birds', 'https://openstax.org/books/biology-2e/pages/29-5-birds', 'livro aberto de biologia (CC BY 4.0)'],
    os296: ['OpenStax, Biology 2e, 29.6 Mammals', 'https://openstax.org/books/biology-2e/pages/29-6-mammals', 'livro aberto de biologia (CC BY 4.0)'],
    os304: ['OpenStax, Biology 2e, 30.4 Leaves', 'https://openstax.org/books/biology-2e/pages/30-4-leaves', 'livro aberto de biologia (CC BY 4.0)'],
    wpfolha: ['Wikipedia, Glossary of leaf morphology', 'https://en.wikipedia.org/wiki/Glossary_of_leaf_morphology', 'o vocabulário das formas da folha (CC BY-SA 4.0)'],
    wppena: ['Wikipedia, Feather', 'https://en.wikipedia.org/wiki/Feather', 'os tipos e as partes da pena (CC BY-SA 4.0)'],
    wpfilo: ['Wikipedia, Phyllotaxis', 'https://en.wikipedia.org/wiki/Phyllotaxis', 'a disposição das folhas no caule (CC BY-SA 4.0)'],
    wpsimp: ['Wikipedia, Sympodial branching', 'https://en.wikipedia.org/wiki/Sympodial_branching', 'o crescimento monopodial e o simpodial (CC BY-SA 4.0)'],
    wpraunk: ['Wikipedia, Raunkiær plant life-form', 'https://en.wikipedia.org/wiki/Raunki%C3%A6r_plant_life-form', 'as formas de vida das plantas, pela altura da gema (CC BY-SA 4.0)'],
    wpbarn: ['Wikipedia, Barnsley fern', 'https://en.wikipedia.org/wiki/Barnsley_fern', 'a samambaia desenhada por quatro transformações (CC BY-SA 4.0)'],
    wpouro: ['Wikipedia, Golden angle', 'https://en.wikipedia.org/wiki/Golden_angle', 'o ângulo de ouro, cerca de 137,5° (CC BY-SA 4.0)'],
    wpfavo: ['Wikipedia, Honeycomb theorem', 'https://en.wikipedia.org/wiki/Honeycomb_conjecture', 'por que o favo é hexagonal (CC BY-SA 4.0)'],
    wpsim: ['Wikipedia, Symmetry in biology', 'https://en.wikipedia.org/wiki/Symmetry_in_biology', 'as simetrias dos corpos (CC BY-SA 4.0)'],
    wplinha: ['Wikipedia, Timeline of the evolutionary history of life', 'https://en.wikipedia.org/wiki/Timeline_of_the_evolutionary_history_of_life', 'a linha da vida, com as datas e as referências de cada uma (CC BY-SA 4.0)'],
  };

  /* os filos de animais com simetria bilateral: todos menos esponjas, placozoários, cnidários e ctenóforos
     (os equinodermos são bilaterais na larva e pentarradiais no adulto) */
  var BILATERAIS = ['Chordata', 'Arthropoda', 'Mollusca', 'Annelida', 'Platyhelminthes', 'Nematoda', 'Echinodermata', 'Bryozoa', 'Rotifera', 'Tardigrada',
    'Nemertea', 'Acanthocephala', 'Gastrotricha', 'Xenacoelomorpha', 'Brachiopoda', 'Kinorhyncha', 'Nematomorpha', 'Onychophora', 'Sipuncula', 'Entoprocta',
    'Hemichordata', 'Chaetognatha', 'Gnathostomulida', 'Loricifera', 'Priapulida', 'Phoronida', 'Cycliophora', 'Micrognathozoa'];

  /* os traços: [id, grupo, nome, o que é, [grupos do Catalogue of Life], fonte] */
  var TRACOS = [
    ['sem-simetria', 'Simetria', 'Sem simetria', 'O corpo não tem eixo nem plano que o divida em partes iguais: as esponjas e os placozoários.', ['Porifera', 'Placozoa'], 'os272'],
    ['radial', 'Simetria', 'Radial', 'As partes se repetem em volta de um eixo, como os raios de uma roda: águas-vivas, corais, anêmonas.', ['Cnidaria'], 'os282'],
    ['birradial', 'Simetria', 'Birradial', 'Dois planos de simetria, o dos tentáculos e o da faringe: os ctenóforos.', ['Ctenophora'], 'wpsim'],
    ['pentarradial', 'Simetria', 'Pentarradial', 'No adulto, braços em cinco ou múltiplos de cinco em volta de um eixo; a larva é bilateral: estrelas-do-mar, ouriços, pepinos-do-mar.', ['Echinodermata'], 'os287'],
    ['bilateral', 'Simetria', 'Bilateral', 'Um plano só divide o corpo em duas metades espelhadas, com frente e trás, cima e baixo: quase todos os outros animais.', BILATERAIS, 'os272'],
    ['duas-camadas', 'Corpo', 'Duas camadas no embrião', 'Diploblásticos: o corpo se forma de duas camadas, a ectoderme e a endoderme.', ['Cnidaria'], 'os282'],
    ['acelomados', 'Corpo', 'Sem cavidade no corpo', 'Três camadas, mas sem celoma: a região do meio é toda preenchida de tecido. Os platelmintos.', ['Platyhelminthes'], 'os272'],
    ['pseudocelomados', 'Corpo', 'Uma falsa cavidade', 'Uma cavidade que não é um celoma verdadeiro: os nematódeos.', ['Nematoda'], 'os272'],
    ['exoesqueleto', 'Esqueleto', 'Esqueleto por fora', 'Um exoesqueleto de quitina e patas articuladas; para crescer, trocam de casca.', ['Arthropoda'], 'os286'],
    ['ossiculos', 'Esqueleto', 'Esqueleto de placas, por dentro', 'Ossículos de calcário sob a pele: um endoesqueleto, como o nosso.', ['Echinodermata'], 'os287'],
    ['penas', 'Cobertura', 'Penas', 'As penas, que hoje só as aves têm; provavelmente apareceram no ancestral comum de dois grandes ramos dos dinossauros.', ['Aves'], 'os295'],
    ['pelos', 'Cobertura', 'Pelos', 'Pelos e glândulas mamárias: o que define os mamíferos.', ['Mammalia'], 'os296'],
    ['escamas', 'Cobertura', 'Escamas', 'Escamas, garras e unhas; a pele não respira, e eles trocam de pele a vida inteira: os répteis.', ['Reptilia'], 'os294'],
    ['escamas-placoides', 'Cobertura', 'Escamas como dentes', 'A pele dos tubarões e das raias, áspera, coberta de escamas placoides; os dentes vieram delas.', ['Elasmobranchii'], 'os292'],
    ['pele-umida', 'Cobertura', 'Pele úmida que respira', 'Úmida pelo muco, a pele dos anfíbios bebe a água e é uma das três superfícies por onde eles respiram.', ['Amphibia'], 'os293'],
    ['endotermicos', 'Temperatura', 'Sangue quente', 'Endotérmicos: o corpo produz e mantém o próprio calor.', ['Aves', 'Mammalia'], 'os296'],
    ['sem-vasos', 'Plantas', 'Sem vasos', 'Hepáticas, musgos e antóceros: sem células próprias para levar a água e os nutrientes.', ['Marchantiophyta', 'Bryophyta', 'Anthocerotophyta'], 'os251'],
    ['com-vasos', 'Plantas', 'Com vasos', 'Uma rede de células que conduz a água e o que vai nela, da raiz à folha.', ['Tracheophyta'], 'os251'],
    ['esporos', 'Plantas', 'Esporos, sem sementes', 'Espalham-se por esporos: as hepáticas, os musgos, os antóceros, as samambaias e as licófitas.', ['Marchantiophyta', 'Bryophyta', 'Anthocerotophyta', 'Polypodiopsida', 'Lycopodiopsida'], 'os251'],
    ['sementes', 'Plantas', 'Sementes', 'O pólen e a semente deixaram as plantas se reproduzirem longe da água.', ['Pinopsida', 'Cycadopsida', 'Ginkgoopsida', 'Magnoliopsida', 'Liliopsida'], 'os261'],
    ['flores', 'Plantas', 'Flores e frutos', 'A flor garante a polinização e protege o embrião; o fruto protege e espalha as sementes.', ['Magnoliopsida', 'Liliopsida'], 'os263'],
  ];

  /* as formas: cada uma com o desenho (vida.js desenha), a parte (o filtro), o nome, o que é e a fonte.
     [id do desenho, parte, nome, o que é, fonte] */
  var FORMAS = {
    folhas: { nome: 'As folhas', sub: 'a forma, a margem, a composição, as nervuras e a disposição no caule', itens: [
      ['acicular', 'Forma', 'Acicular', 'Fina e pontuda, como uma agulha.', 'wpfolha'],
      ['linear', 'Forma', 'Linear', 'Longa e muito estreita, como uma folha de capim.', 'wpfolha'],
      ['lanceolada', 'Forma', 'Lanceolada', 'Longa, mais larga perto da base, afinando como a ponta de uma lança.', 'wpfolha'],
      ['oblanceolada', 'Forma', 'Oblanceolada', 'Bem mais longa que larga, com a parte mais larga perto da ponta: a lanceolada ao contrário.', 'wpfolha'],
      ['eliptica', 'Forma', 'Elíptica', 'Como uma elipse: mais larga no meio, afinando por igual para a ponta e para a base.', 'wpfolha'],
      ['oblonga', 'Forma', 'Oblonga', 'Alongada, com os lados quase paralelos; quase um retângulo.', 'wpfolha'],
      ['ovada', 'Forma', 'Ovada', 'Em forma de ovo, com a parte mais larga perto do pecíolo.', 'wpfolha'],
      ['obovada', 'Forma', 'Obovada', 'Como uma gota, com o caule preso na ponta fina: a ovada ao contrário.', 'wpfolha'],
      ['cordada', 'Forma', 'Cordada', 'Em forma de coração, com o pecíolo preso no recorte.', 'wpfolha'],
      ['reniforme', 'Forma', 'Reniforme', 'Em forma de rim, com uma curva para dentro de um lado.', 'wpfolha'],
      ['sagitada', 'Forma', 'Sagitada', 'Ponta de flecha, com os lobos de baixo voltados para baixo.', 'wpfolha'],
      ['hastada', 'Forma', 'Hastada', 'Ponta de lança, com lobos pontudos abertos para os lados na base.', 'wpfolha'],
      ['orbicular', 'Forma', 'Orbicular', 'Redonda.', 'wpfolha'],
      ['espatulada', 'Forma', 'Espatulada', 'Como uma colher: a ponta larga e chata, afinando até a base.', 'wpfolha'],
      ['deltoide', 'Forma', 'Deltoide', 'Como a letra grega delta: um triângulo preso ao caule por um dos lados.', 'wpfolha'],
      ['romboide', 'Forma', 'Rômbica', 'Em forma de losango.', 'wpfolha'],
      ['falcada', 'Forma', 'Falcada', 'Em forma de foice.', 'wpfolha'],
      ['peltada', 'Forma', 'Peltada', 'Redonda, com o pecíolo preso perto do centro, como a folha do lótus.', 'wpfolha'],
      ['m-inteira', 'Margem', 'Inteira', 'A borda lisa, sem dentes nem recortes.', 'wpfolha'],
      ['m-serreada', 'Margem', 'Serreada', 'Dentes de serra, desiguais, apontando para a frente.', 'wpfolha'],
      ['m-denteada', 'Margem', 'Denteada', 'Com dentes.', 'wpfolha'],
      ['m-crenada', 'Margem', 'Crenada', 'Dentes arredondados, em ondas.', 'wpfolha'],
      ['m-lobada', 'Margem', 'Lobada', 'Dividida por recortes em lobos.', 'wpfolha'],
      ['m-pinatifida', 'Margem', 'Pinatífida', 'Lobos com recortes que vão menos da metade do caminho até a nervura do meio.', 'wpfolha'],
      ['m-ondulada', 'Margem', 'Ondulada', 'A borda em ondas.', 'wpfolha'],
      ['m-espinhosa', 'Margem', 'Espinhosa', 'Com pontas duras e afiadas, como a do cardo.', 'wpfolha'],
      ['c-simples', 'Composição', 'Simples', 'Uma lâmina só: inteira, como a da bananeira, ou com lobos que não chegam à nervura do meio, como a do bordo.', 'os304'],
      ['c-palmada', 'Composição', 'Composta palmada', 'Os folíolos saem de um ponto só, como os dedos de uma mão.', 'os304'],
      ['c-pinada', 'Composição', 'Composta pinada', 'Os folíolos se enfileiram ao longo da nervura do meio, como numa pena: a da roseira, a da nogueira.', 'os304'],
      ['c-bipinada', 'Composição', 'Bipinada', 'Os próprios folíolos são pinados: duas vezes pinada.', 'wpfolha'],
      ['c-trifoliolada', 'Composição', 'Trifoliolada', 'Três folíolos.', 'wpfolha'],
      ['n-paralela', 'Nervuras', 'Paralelas', 'As nervuras correm em linha reta pelo comprimento da folha, sem se encontrar: as monocotiledôneas, como a tulipa.', 'os304'],
      ['n-reticulada', 'Nervuras', 'Em rede', 'As nervuras formam uma rede: as dicotiledôneas, como a tília.', 'os304'],
      ['n-dicotomica', 'Nervuras', 'Em forquilha', 'As nervuras se dividem em dois, e de novo em dois: só o ginkgo, hoje.', 'os304'],
      ['d-alterna', 'Disposição', 'Alterna', 'Uma folha por nó, alternando de um lado e do outro do caule.', 'os304'],
      ['d-espiral', 'Disposição', 'Em espiral', 'Uma folha por nó, subindo em espiral pelo caule; o ângulo entre uma e a próxima tende ao ângulo de ouro.', 'wpfilo'],
      ['d-oposta', 'Disposição', 'Oposta', 'Duas folhas no mesmo nó, uma de cada lado.', 'os304'],
      ['d-verticilada', 'Disposição', 'Verticilada', 'Três ou mais folhas no mesmo nó, em roda.', 'os304'],
    ] },
    galhos: { nome: 'Os galhos e as formas de vida', sub: 'como o caule cresce e onde a planta guarda a gema para o tempo ruim', itens: [
      ['g-monopodial', 'Crescimento', 'Monopodial', 'O caule cresce de um meristema só, na ponta: um eixo que continua.', 'wpsimp'],
      ['g-simpodial', 'Crescimento', 'Simpodial', 'O caule é feito pelos meristemas de vários ramos laterais, um continuando o outro.', 'wpsimp'],
      ['g-dicotomico', 'Crescimento', 'Em forquilha', 'Dois ramos laterais iguais continuam o crescimento.', 'wpsimp'],
      ['r-fanerofita', 'Forma de vida', 'Fanerófitas', 'Árvores e arbustos: as gemas de repouso ficam a mais de 50 cm do chão.', 'wpraunk'],
      ['r-camefita', 'Forma de vida', 'Caméfitas', 'As gemas ficam em ramos perto do chão, no máximo a 25 cm.', 'wpraunk'],
      ['r-hemicriptofita', 'Forma de vida', 'Hemicriptófitas', 'As gemas ficam no nível do chão, como na margarida e no dente-de-leão.', 'wpraunk'],
      ['r-criptofita', 'Forma de vida', 'Criptófitas', 'As gemas ficam debaixo da terra (bulbo, rizoma) ou debaixo da água.', 'wpraunk'],
      ['r-terofita', 'Forma de vida', 'Terófitas', 'Plantas de um ano: vivem rápido e passam o tempo ruim como semente.', 'wpraunk'],
    ] },
    penas: { nome: 'As penas', sub: 'os tipos e as partes', itens: [
      ['p-remige', 'Tipo', 'Rêmiges', 'As penas de voo da asa: as mais importantes para voar.', 'wppena'],
      ['p-retriz', 'Tipo', 'Retrizes', 'As penas de voo da cauda.', 'wppena'],
      ['p-contorno', 'Tipo', 'De contorno', 'Penas com bandeira, que cobrem o corpo inteiro; barbas paralelas presas a um eixo.', 'os295'],
      ['p-penugem', 'Tipo', 'Penugem', 'As bárbulas soltas não se prendem umas nas outras: seguram o ar e o calor. O filhote nasce quase todo coberto delas.', 'os295'],
      ['p-filopluma', 'Tipo', 'Filoplumas', 'Finas como fios de cabelo, quase sempre escondidas sob as de contorno.', 'wppena'],
      ['p-cerda', 'Tipo', 'Cerdas', 'Duras e afinadas, com um eixo grosso e poucas barbas; em volta dos olhos e do bico.', 'wppena'],
      ['p-po', 'Tipo', 'Penas de pó', 'Crescem sem parar e soltam um pó das pontas, que se espalha pelas outras penas e as impermeabiliza.', 'wppena'],
      ['p-partes', 'Partes', 'As partes', 'O cálamo (a base oca), a ráquis (o eixo), as barbas que saem dela e as bárbulas, presas umas às outras por ganchos mínimos, que fazem a bandeira firme e flexível.', 'os295'],
    ] },
    corpos: { nome: 'Os corpos', sub: 'as simetrias, do corpo sem eixo ao corpo espelhado', itens: [
      ['s-assimetrico', 'Simetria', 'Sem simetria', 'Esponjas e placozoários.', 'os272'],
      ['s-radial', 'Simetria', 'Radial', 'Em volta de um eixo: cnidários.', 'os282'],
      ['s-birradial', 'Simetria', 'Birradial', 'Dois planos: ctenóforos.', 'wpsim'],
      ['s-pentarradial', 'Simetria', 'Pentarradial', 'Cinco partes em volta de um eixo: equinodermos adultos.', 'os287'],
      ['s-bilateral', 'Simetria', 'Bilateral', 'Duas metades espelhadas: quase todos os animais.', 'os272'],
      ['s-esferica', 'Simetria', 'Esférica', 'Igual em todas as direções a partir do centro: algumas bactérias, os cocos.', 'wpsim'],
    ] },
    geometrias: { nome: 'As geometrias', sub: 'o que se repete nas formas vivas', itens: [
      ['ge-espiral', 'Espiral', 'A espiral das sementes', 'Cada folha ou semente nasce no lugar menos apertado do broto, e o ângulo entre uma e a próxima fica no ângulo de ouro, perto de 137,5°. No girassol, as espirais que se cruzam, contadas num sentido e no outro, dão números de Fibonacci.', ['wpfilo', 'wpouro']],
      ['ge-fractal', 'Fractal', 'A samambaia que se repete', 'A samambaia de Barnsley: quatro transformações simples, repetidas muitas vezes, desenham uma folha inteira, feita de folhas menores iguais a ela.', 'wpbarn'],
      ['ge-hexagono', 'Hexágono', 'O favo', 'De todas as maneiras de dividir um plano em partes de mesma área, a grade de hexágonos é a de menor perímetro total (provado por Thomas Hales em 1999).', 'wpfavo'],
      ['ge-radial', 'Simetria', 'A estrela de cinco', 'A estrela-do-mar adulta: cinco braços em volta de um centro.', 'os287'],
    ] },
  };

  /* as origens: [milhões de anos (ou [de, até]), o que aparece, o grupo na árvore (nome do Catalogue of Life) ou null, fonte] */
  var ORIGENS = [
    [[4280, 3770], 'A vida, no mais cedo possível', 'Bacteria', 'wplinha'],
    [3000, 'Cianobactérias fazem fotossíntese e soltam oxigênio', null, 'wplinha'],
    [2500, 'A Grande Oxidação: o oxigênio enche o ar', null, 'wplinha'],
    [1850, 'As células com núcleo (eucariontes)', 'Eukaryota', 'wplinha'],
    [1000, 'Os fungos em terra, pelo relógio molecular', 'Fungi', 'wplinha'],
    [[580, 542], 'Os primeiros corpos grandes e complexos (Ediacara)', 'Animalia', 'wplinha'],
    [[550, 540], 'Esponjas, ctenóforos, corais e anêmonas', 'Porifera', 'wplinha'],
    [[580, 500], 'A explosão cambriana: aparecem quase todos os filos de animais de hoje', null, 'wplinha'],
    [550, 'Os peixes sem mandíbula: a linhagem dos vertebrados', 'Chordata', 'os292'],
    [500, 'As primeiras plantas em terra, parentes dos musgos', 'Plantae', 'os261'],
    [500, 'A era dos artrópodes começa', 'Arthropoda', 'os286'],
    [425, 'Os insetos com asas', 'Insecta', 'os286'],
    [400, 'Os primeiros tetrápodes: os vertebrados de quatro patas', 'Amphibia', 'os293'],
    [370, 'Os peixes de cartilagem: tubarões e raias', 'Elasmobranchii', 'os292'],
    [360, 'As primeiras samambaias', 'Polypodiopsida', 'wplinha'],
    [350, 'As primeiras plantas com semente', 'Pinopsida', 'os261'],
    [340, 'Os amniotas: o ovo que pode ser posto em terra', null, 'os294'],
    [300, 'Os répteis', 'Reptilia', 'os294'],
    [205, 'Os mamíferos (os fósseis mais antigos)', 'Mammalia', 'os296'],
    [150, 'As aves', 'Aves', 'os295'],
    [135, 'As plantas com flor se espalham', 'Magnoliopsida', 'wplinha'],
    [35, 'As gramíneas se diversificam e os campos se abrem', 'Poales', 'wplinha'],
  ];

  /* os reinos, em palavras, para os atalhos (o nome em português e o do catálogo) */
  var REINOS = [['Animalia', 'Animais'], ['Plantae', 'Plantas'], ['Fungi', 'Fungos'], ['Chromista', 'Cromistas'], ['Protozoa', 'Protozoários'], ['Bacteria', 'Bactérias'], ['Archaea', 'Arqueias'], ['Viruses', 'Vírus']];

  var api = { fontes: FONTES, tracos: TRACOS, formas: FORMAS, origens: ORIGENS, reinos: REINOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.VIDA = api;
})(typeof window !== 'undefined' ? window : globalThis);
