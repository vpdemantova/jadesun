/* Espécies do Jardim. Cada matéria do Domino tem uma planta real; as extras são plantadas com sementes.
   Fatos escritos de memória, de forma conservadora, a partir de conhecimento botânico geral:
   confira nas fichas do Atlas e em fontes antes de citar. */
(function () {
  'use strict';

  window.ESPECIES = [
    { id: 'papiro', tipo: 'nucleo', materia: 'Linguagens', nome: 'Papiro', cient: 'Cyperus papyrus', familia: 'Cyperaceae', origem: 'África, vale do Nilo e áreas alagadas', cor: '#7fb55a', busca: ['papiro', 'cyperus papyrus'],
      porque: 'Da fibra desta planta veio o papel, o suporte de escrita do Egito antigo.',
      fato: 'O miolo do caule, cortado em tiras e prensado, virou o papiro. A palavra “papel” vem do latim papyrus.' },
    { id: 'pau-brasil', tipo: 'nucleo', materia: 'História', nome: 'Pau-brasil', cient: 'Paubrasilia echinata', familia: 'Fabaceae', origem: 'Mata Atlântica, litoral do Brasil', cor: '#c2452d', busca: ['pau-brasil', 'paubrasilia', 'pau brasil'],
      porque: 'A árvore que deu nome ao país e ao primeiro ciclo econômico da colônia.',
      fato: 'A madeira de cor de brasa produzia um corante vermelho e foi explorada desde o início da colonização. Hoje a espécie está ameaçada.' },
    { id: 'araucaria', tipo: 'nucleo', materia: 'Geografia', nome: 'Araucária', cient: 'Araucaria angustifolia', familia: 'Araucariaceae', origem: 'Planaltos do Sul e partes do Sudeste do Brasil', cor: '#2f6b46', busca: ['araucaria', 'araucária', 'pinheiro-do-parana'],
      porque: 'Árvore-símbolo de um bioma: a Floresta com Araucárias, dos planaltos frios do Sul.',
      fato: 'A semente, o pinhão, alimenta pessoas e fauna. A espécie está criticamente ameaçada por causa do desmatamento.' },
    { id: 'lavanda', tipo: 'nucleo', materia: 'Química', nome: 'Lavanda', cient: 'Lavandula angustifolia', familia: 'Lamiaceae', origem: 'Região do Mediterrâneo', cor: '#8f6bd6', busca: ['lavanda', 'lavandula'],
      porque: 'O perfume é química de compostos voláteis, extraídos por destilação.',
      fato: 'O óleo essencial tem como componentes principais o linalol e o acetato de linalila, obtidos por destilação a vapor das flores.' },
    { id: 'vitoria-regia', tipo: 'nucleo', materia: 'Biologia', nome: 'Vitória-régia', cient: 'Victoria amazonica', familia: 'Nymphaeaceae', origem: 'Bacia Amazônica', cor: '#2f9f8a', busca: ['vitoria-regia', 'vitória-régia', 'victoria amazonica'],
      porque: 'Um caso de engenharia natural: folhas que flutuam e flores que mudam de cor.',
      fato: 'As folhas circulares passam de 2 metros de diâmetro, sustentadas por nervuras radiais. A flor abre à noite, branca, e no dia seguinte fica rosada.' },
    { id: 'girassol', tipo: 'nucleo', materia: 'Matemática', nome: 'Girassol', cient: 'Helianthus annuus', familia: 'Asteraceae', origem: 'América do Norte', cor: '#f2b91f', busca: ['girassol', 'helianthus'],
      porque: 'Fibonacci e o ângulo áureo aparecem no arranjo das sementes.',
      fato: 'O que parece uma flor é uma inflorescência com centenas de florzinhas. As sementes formam espirais em dois sentidos, e o número delas costuma ser termos consecutivos da sequência de Fibonacci.' },
    { id: 'sequoia', tipo: 'nucleo', materia: 'Física', nome: 'Sequoia-gigante', cient: 'Sequoiadendron giganteum', familia: 'Cupressaceae', origem: 'Sierra Nevada, Califórnia', cor: '#7a4a32', busca: ['sequoiadendron', 'sequoia'],
      porque: 'Como a água sobe dezenas de metros sem bomba? Coesão, tensão e evaporação.',
      fato: 'Está entre os maiores seres vivos do mundo em volume. A água sobe pela tensão criada quando evapora das folhas e pela coesão entre as moléculas de água.' },
    { id: 'oliveira', tipo: 'nucleo', materia: 'Filosofia', nome: 'Oliveira', cient: 'Olea europaea', familia: 'Oleaceae', origem: 'Região do Mediterrâneo', cor: '#8fa07a', busca: ['oliveira', 'olea europaea'],
      porque: 'A árvore de Atena, deusa da sabedoria, símbolo de Atenas.',
      fato: 'No mito de fundação de Atenas, Atena oferece a oliveira à cidade e vence Posêidon. Segundo a tradição, a Academia de Platão tinha oliveiras consagradas a ela.' },
    { id: 'bambu', tipo: 'nucleo', materia: 'Sociologia', nome: 'Bambu', cient: 'Bambusoideae', familia: 'Poaceae', origem: 'Regiões tropicais e temperadas', cor: '#8fb04a', busca: ['bambu', 'bambusoideae'],
      porque: 'Muitos indivíduos, uma só rede: os colmos se ligam por rizomas debaixo da terra.',
      fato: 'É uma gramínea. Algumas espécies crescem quase 1 metro por dia, e muitos bambuzais florescem juntos, de tempos em tempos.' },

    { id: 'ipe', tipo: 'extra', nome: 'Ipê-amarelo', cient: 'Handroanthus albus', familia: 'Bignoniaceae', origem: 'Brasil', cor: '#f5c518', busca: ['ipe', 'ipê', 'handroanthus'],
      fato: 'Floresce entre o fim do inverno e o início da primavera, muitas vezes com a árvore sem folhas, e a copa vira uma mancha amarela na paisagem.' },
    { id: 'samambaia', tipo: 'extra', nome: 'Samambaia', cient: 'Nephrolepis exaltata', familia: 'Nephrolepidaceae', origem: 'Regiões tropicais', cor: '#3f8f3f', busca: ['samambaia', 'nephrolepis', 'pteridophyta'],
      fato: 'Samambaias não têm flores nem sementes. Reproduzem-se por esporos, que ficam em pontinhos na face de baixo das folhas.' },
    { id: 'mandacaru', tipo: 'extra', nome: 'Mandacaru', cient: 'Cereus jamacaru', familia: 'Cactaceae', origem: 'Caatinga, Nordeste do Brasil', cor: '#4c7a4a', busca: ['mandacaru', 'cereus'],
      fato: 'É um símbolo do sertão e guarda água no caule. As grandes flores brancas abrem à noite.' },
    { id: 'orquidea', tipo: 'extra', nome: 'Orquídea', cient: 'Phalaenopsis', familia: 'Orchidaceae', origem: 'Sudeste da Ásia e Oceania', cor: '#e58bd0', busca: ['orquidea', 'orquídea', 'phalaenopsis'],
      fato: 'As sementes das orquídeas são minúsculas, quase sem reserva; na natureza, dependem de fungos para germinar.' },
    { id: 'cogumelo', tipo: 'extra', nome: 'Cogumelo-do-mel', cient: 'Armillaria mellea', familia: 'Physalacriaceae', origem: 'Regiões temperadas do hemisfério norte', cor: '#c99a4b', busca: ['cogumelo-do-mel', 'armillaria'],
      fato: 'Não é planta: pertence ao Reino Fungi. O que vemos é só o corpo de frutificação; o organismo é uma rede de micélio no solo.' },
  ];

  window.ESPECIES_POR_MATERIA = function (nomeMateria) {
    var n = String(nomeMateria || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    for (var i = 0; i < window.ESPECIES.length; i++) {
      var e = window.ESPECIES[i];
      if (e.materia && n.indexOf(e.materia.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').slice(0, 5)) === 0) return e;
    }
    return null;
  };
})();
