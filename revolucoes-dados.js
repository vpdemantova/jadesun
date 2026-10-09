/* ============================================================
   AS REVOLUÇÕES — os dados (09/out/2026, PERFIL.md item 75)
   "Uma linha do tempo dinâmica com todas as revoluções desde a formação da Terra, com destaque nas
   principais revoluções humanas, até chegar na revolução ontológica."
   Cada revolução: quando (como se escreve), atrás (anos antes de 2026, para a régua do tempo profundo),
   a área, o título, o que mudou e a fonte. "principal": as grandes viradas humanas (ficam em destaque).
   As datas são as aceitas hoje (conferidas em 09/out/2026); onde a ciência discute, o texto diz.
   ============================================================ */
(function (raiz) {
  'use strict';

  var HOJE = 2026;
  var W = 'https://pt.wikipedia.org/wiki/', E = 'https://en.wikipedia.org/wiki/';

  var AREAS = [
    ['cosmos', 'A Terra', '#5B7FA6'],
    ['vida', 'A vida', '#2E9E66'],
    ['humano', 'Os humanos', '#B0562D'],
    ['tecnica', 'Técnica e matéria', '#8A6A3A'],
    ['comunicacao', 'Escrita e comunicação', '#7E62D6'],
    ['pensamento', 'Pensamento e fé', '#C9A227'],
    ['ciencia', 'Ciência', '#2F7FD0'],
    ['sociedade', 'Sociedade e direitos', '#D9534F'],
    ['arte', 'Arte e música', '#C2417A'],
    ['ontologica', 'A revolução ontológica', '#14130F'],
  ];

  /* os grandes tempos, do fundo para cá (a faixa de cor atrás da linha) */
  var TEMPOS = [
    { nome: 'Hadeano', de: 4540e6, ate: 4000e6 },
    { nome: 'Arqueano', de: 4000e6, ate: 2500e6 },
    { nome: 'Proterozoico', de: 2500e6, ate: 538.8e6 },
    { nome: 'Paleozoico', de: 538.8e6, ate: 251.9e6 },
    { nome: 'Mesozoico', de: 251.9e6, ate: 66e6 },
    { nome: 'Cenozoico', de: 66e6, ate: 2.58e6 },
    { nome: 'Paleolítico', de: 3.3e6, ate: 12000 },
    { nome: 'Neolítico', de: 12000, ate: 5200 },
    { nome: 'Antiguidade', de: 5200, ate: 1550 },
    { nome: 'Idade Média', de: 1550, ate: 574 },
    { nome: 'Moderna', de: 574, ate: 237 },
    { nome: 'Contemporânea', de: 237, ate: 0 },
  ];

  /* [id, quando, atrás, área, título, o que mudou, principal, [fonte, url]] */
  var R = [
    ['terra', 'há 4,54 bilhões de anos', 4540e6, 'cosmos', 'A Terra se forma', 'Poeira e rocha em volta de um Sol jovem se juntam num planeta. A idade vem dos meteoritos e das rochas mais antigas.', false, ['Idade da Terra', W + 'Idade_da_Terra']],
    ['lua', 'há uns 4,5 bilhões de anos', 4500e6, 'cosmos', 'A Lua', 'A hipótese mais aceita: um corpo do tamanho de Marte (Theia) bate na Terra, e os destroços formam a Lua, que estabiliza o eixo e as estações.', false, ['Hipótese do grande impacto', W + 'Teoria_do_grande_impacto']],
    ['agua', 'há 4,4 bilhões de anos', 4400e6, 'cosmos', 'A água', 'Cristais de zircão da Austrália guardam sinais de água líquida e de crosta quando a Terra tinha menos de 150 milhões de anos.', false, ['Zircões de Jack Hills', E + 'Jack_Hills']],
    ['vida', 'há uns 3,5 bilhões de anos', 3500e6, 'vida', 'A vida', 'Os estromatólitos da Austrália são os sinais mais aceitos de vida; pode ter começado antes. Daqui em diante, tudo o que vive é parente.', true, ['Primeiras formas de vida', E + 'Earliest_known_life_forms']],
    ['oxigenio', 'há 2,4 bilhões de anos', 2400e6, 'vida', 'O oxigênio', 'Cianobactérias fazendo fotossíntese enchem o ar de oxigênio: a Grande Oxidação muda a química do planeta inteiro.', false, ['Grande Oxidação', W + 'Grande_Oxida%C3%A7%C3%A3o']],
    ['eucariota', 'há uns 2 bilhões de anos', 1900e6, 'vida', 'A célula com núcleo', 'Uma célula engole outra e as duas passam a viver juntas: nascem as células com núcleo e mitocôndrias, de que são feitos os animais, as plantas e os fungos.', false, ['Eucariontes', W + 'Eucarionte']],
    ['cambriano', 'há 538,8 milhões de anos', 538.8e6, 'vida', 'A explosão cambriana', 'Em pouco tempo geológico aparecem quase todos os grandes grupos de animais: olhos, carapaças, predadores.', false, ['Explosão cambriana', W + 'Explos%C3%A3o_cambriana']],
    ['terra-firme', 'há uns 470 milhões de anos', 470e6, 'vida', 'A vida sobe à terra', 'As primeiras plantas deixam a água; depois delas, os insetos e os anfíbios. Os continentes ficam verdes.', false, ['Evolução das plantas', E + 'Evolutionary_history_of_plants']],
    ['flores', 'há uns 130 milhões de anos', 130e6, 'vida', 'As flores', 'As angiospermas se espalham com os insetos que as polinizam: frutos, sementes, a maior parte do que comemos.', false, ['Angiospermas', W + 'Magnoliophyta']],
    ['k-pg', 'há 66 milhões de anos', 66e6, 'vida', 'O fim dos dinossauros', 'Um asteroide cai em Chicxulub (México). Três quartos das espécies somem; os mamíferos herdam o mundo.', false, ['Extinção K-Pg', W + 'Extin%C3%A7%C3%A3o_do_Cret%C3%A1ceo-Paleogeno']],
    ['em-pe', 'há 3,66 milhões de anos', 3.66e6, 'humano', 'Andar em pé', 'As pegadas de Laetoli (Tanzânia) mostram hominíneos andando sobre dois pés: as mãos ficam livres.', false, ['Pegadas de Laetoli', W + 'Pegadas_de_Laetoli']],
    ['pedra', 'há 3,3 milhões de anos', 3.3e6, 'tecnica', 'A ferramenta de pedra', 'Em Lomekwi (Quênia), as lascas mais antigas: a mão começa a fazer coisas que a natureza não faz sozinha.', true, ['Lomekwi', E + 'Lomekwi']],
    ['fogo', 'há uns 1 milhão de anos', 1e6, 'tecnica', 'O fogo', 'Na caverna de Wonderwerk (África do Sul), os sinais mais antigos de fogo controlado: comida cozida, noite iluminada, a roda em volta da chama.', true, ['Controle do fogo', W + 'Controle_do_fogo_pelos_primeiros_humanos']],
    ['sapiens', 'há uns 300 mil anos', 300000, 'humano', 'O Homo sapiens', 'Em Jebel Irhoud (Marrocos), os fósseis mais antigos da nossa espécie.', false, ['Jebel Irhoud', W + 'Jebel_Irhoud']],
    ['cognitiva', 'há uns 70 mil anos', 70000, 'pensamento', 'A revolução cognitiva', 'A linguagem complexa, o mito, o símbolo: humanos passam a cooperar em grande número em volta de coisas que só existem na imaginação. A pintura mais antiga conhecida, em Sulawesi, tem pelo menos 51 mil anos.', true, ['Modernidade comportamental', E + 'Behavioral_modernity']],
    ['agricola', 'há uns 12 mil anos', 12000, 'tecnica', 'A revolução agrícola', 'No Crescente Fértil, e depois na China, nos Andes e na Mesoamérica, plantar e criar animais: comida guardada, aldeias, e também o trabalho pesado e a desigualdade.', true, ['Revolução Neolítica', W + 'Revolu%C3%A7%C3%A3o_Neol%C3%ADtica']],
    ['urbana', 'há uns 6 mil anos', 6000, 'sociedade', 'A revolução urbana', 'Uruk, na Mesopotâmia: cidades com templos, mercados, ofícios e governo. O nome é de V. Gordon Childe (1950).', true, ['Revolução urbana', E + 'Urban_revolution']],
    ['escrita', 'por volta de 3200 a.C.', HOJE + 3200, 'comunicacao', 'A escrita', 'Os sumérios (cuneiforme) e os egípcios (hieróglifos): a memória sai da cabeça e vai para a argila. Começa a história escrita.', true, ['Escrita', W + 'Escrita']],
    ['alfabeto', 'por volta de 1850 a.C.', HOJE + 1850, 'comunicacao', 'O alfabeto', 'Uns poucos sinais, um para cada som: do proto-sinaítico vêm o fenício, o grego, o latino. Ler fica ao alcance de quase todos.', false, ['Alfabeto', W + 'Alfabeto']],
    ['axial', '800 a 200 a.C.', HOJE + 500, 'pensamento', 'A Era Axial', 'Ao mesmo tempo, sem se conhecerem: Buda, Confúcio, Laozi, os profetas hebreus, os filósofos gregos. Nascem as perguntas sobre o bem e a verdade que ainda fazemos (o nome é de Karl Jaspers).', true, ['Era Axial', W + 'Era_Axial']],
    ['democracia', '508 a.C.', HOJE + 508, 'sociedade', 'A democracia', 'Em Atenas, as reformas de Clístenes: os cidadãos decidem em assembleia. Muitos ficam de fora (mulheres, escravizados), mas a ideia fica.', false, ['Democracia ateniense', W + 'Democracia_ateniense']],
    ['zero', '628', HOJE - 628, 'ciencia', 'O zero', 'O indiano Brahmagupta dá ao zero regras de número. Com os algarismos indo-arábicos, contar fica fácil para todos.', false, ['Zero', W + 'Zero']],
    ['notacao', 'por volta de 1025', HOJE - 1025, 'arte', 'A pauta musical', 'Guido d’Arezzo dá à música as linhas da pauta e os nomes das notas (ut, ré, mi…): a música passa a ser escrita, lida e levada adiante.', false, ['Guido d’Arezzo', W + 'Guido_d%27Arezzo']],
    ['perspectiva', 'por volta de 1415', HOJE - 1415, 'arte', 'A perspectiva', 'Brunelleschi mostra em Florença como pintar o espaço como o olho o vê: começa o Renascimento.', false, ['Perspectiva', W + 'Perspectiva_(gr%C3%A1fica)']],
    ['imprensa', 'por volta de 1450', HOJE - 1450, 'comunicacao', 'A imprensa', 'Gutenberg, em Mainz, imprime com tipos móveis de metal (os chineses já tinham tipos móveis desde Bi Sheng, por volta de 1040). Os livros se multiplicam.', true, ['Prensa móvel', W + 'Prensa_m%C3%B3vel']],
    ['mundos', '1492', HOJE - 1492, 'sociedade', 'O encontro dos mundos', 'As navegações ligam os continentes: plantas, ideias e doenças cruzam o oceano. A conquista também traz o genocídio dos povos originários e a escravidão.', false, ['Grandes Navegações', W + 'Era_dos_Descobrimentos']],
    ['cientifica', '1543 a 1687', HOJE - 1543, 'ciencia', 'A revolução científica', 'De Copérnico (o Sol no centro, 1543) a Newton (os Principia, 1687): medir, testar, duvidar. A natureza passa a ter leis que qualquer um pode conferir.', true, ['Revolução Científica', W + 'Revolu%C3%A7%C3%A3o_Cient%C3%ADfica']],
    ['industrial', '1760 a 1840', HOJE - 1760, 'tecnica', 'A revolução industrial', 'Na Inglaterra, o vapor e a fábrica: a força das máquinas multiplica o que se produz. E multiplica a fumaça, a cidade operária e o carvão no céu.', true, ['Revolução Industrial', W + 'Revolu%C3%A7%C3%A3o_Industrial']],
    ['direitos', '1776 a 1804', HOJE - 1789, 'sociedade', 'As revoluções dos direitos', 'A independência dos Estados Unidos (1776), a Revolução Francesa e a Declaração dos Direitos do Homem (1789), a revolução no Haiti (1791–1804): o poder passa a precisar de razão.', true, ['Revoluções atlânticas', E + 'Atlantic_Revolutions']],
    ['vacina', '1796', HOJE - 1796, 'ciencia', 'A vacina', 'Edward Jenner protege um menino da varíola com o vírus da vacina. Em 1980, a varíola é declarada erradicada da Terra.', false, ['Varíola', W + 'Var%C3%ADola']],
    ['abolicao', '1794 a 1888', HOJE - 1888, 'sociedade', 'As abolições', 'A escravidão é proibida, país por país: a França (1794, revogada em 1802 e refeita em 1848), o Haiti independente (1804), o Império Britânico (1833), os Estados Unidos (1865) e o Brasil, o último das Américas, com a Lei Áurea, em 13 de maio de 1888.', true, ['Lei Áurea', W + 'Lei_%C3%81urea']],
    ['evolucao', '1859', HOJE - 1859, 'ciencia', 'A evolução', 'Darwin publica A origem das espécies: todos os seres vivos são parentes, e o mundo vivo tem história.', false, ['A Origem das Espécies', W + 'A_Origem_das_Esp%C3%A9cies']],
    ['eletricidade', '1870 a 1914', HOJE - 1879, 'tecnica', 'A eletricidade', 'A segunda revolução industrial: a lâmpada, o telefone, o motor elétrico, o aço. A noite se acende e a voz atravessa o mundo.', false, ['Segunda Revolução Industrial', W + 'Segunda_Revolu%C3%A7%C3%A3o_Industrial']],
    ['voto', '1893', HOJE - 1893, 'sociedade', 'O voto das mulheres', 'A Nova Zelândia é o primeiro país a dar o voto às mulheres; o Brasil, em 1932.', false, ['Sufrágio feminino', W + 'Sufr%C3%A1gio_feminino']],
    ['fisica', '1905 a 1927', HOJE - 1905, 'ciencia', 'A física nova', 'A relatividade de Einstein (1905) e a mecânica quântica (1925–27): o espaço, o tempo e a matéria não são o que pareciam.', false, ['Física moderna', W + 'F%C3%ADsica_moderna']],
    ['vanguardas', '1913 a 1915', HOJE - 1915, 'arte', 'As vanguardas', 'A Sagração da Primavera de Stravinsky (1913) e o Quadrado Negro de Malevich (1915): a arte recomeça do grau zero. É o quadrado da marca do Portal Solar.', false, ['Quadrado Negro', W + 'Quadrado_Negro']],
    ['antibiotico', '1928', HOJE - 1928, 'ciencia', 'O antibiótico', 'Alexander Fleming descobre a penicilina. Feridas e infecções deixam de ser sentença.', false, ['Penicilina', W + 'Penicilina']],
    ['dudh', '1948', HOJE - 1948, 'sociedade', 'Os direitos humanos', 'Em 10 de dezembro, a ONU aprova a Declaração Universal dos Direitos Humanos: a dignidade de cada pessoa, escrita para todas.', true, ['Declaração Universal dos Direitos Humanos', W + 'Declara%C3%A7%C3%A3o_Universal_dos_Direitos_Humanos']],
    ['dna', '1953', HOJE - 1953, 'ciencia', 'O DNA', 'Watson e Crick, com a fotografia de Rosalind Franklin, mostram a dupla hélice: a vida tem um código que se copia.', false, ['DNA', W + '%C3%81cido_desoxirribonucleico']],
    ['espaco', '1957 a 1969', HOJE - 1969, 'ciencia', 'A Terra vista de fora', 'O Sputnik (1957), o nascer da Terra fotografado da Lua (1968), a pegada na Lua (1969): pela primeira vez, a humanidade vê o próprio planeta inteiro.', false, ['Nascer da Terra', W + 'Earthrise']],
    ['digital', '1969 a 1991', HOJE - 1991, 'comunicacao', 'A revolução digital', 'A ARPANET (1969) e a World Wide Web de Tim Berners-Lee (1991): qualquer texto, em qualquer lugar, de graça. E com ela, a enxurrada.', true, ['World Wide Web', W + 'World_Wide_Web']],
    ['maquinas', '2017 a 2022', HOJE - 2022, 'tecnica', 'As máquinas que falam', 'Os modelos de linguagem (o artigo do Transformer, 2017; os assistentes de 2022): máquinas que escrevem e conversam. O conteúdo deixa de ser escasso de vez.', false, ['Transformer', E + 'Transformer_(deep_learning_architecture)']],
    ['ontologica', 'agora', 0.5, 'ontologica', 'A revolução ontológica', 'Depois de multiplicar as coisas, ordená-las: dar a cada pessoa, lugar, obra, ideia e acontecimento o seu lugar e os seus elos, com fonte, em arquivos que qualquer um copia. Chega de conteúdo em cima de conteúdo: o saber humano como um todo navegável.', true, ['O Manifesto', 'manifesto.html#mf-xvi']],
  ];

  var revolucoes = R.map(function (r) {
    return { id: r[0], quando: r[1], atras: r[2], area: r[3], titulo: r[4], texto: r[5], principal: !!r[6], fonte: r[7] };
  });

  var api = { HOJE: HOJE, areas: AREAS, tempos: TEMPOS, revolucoes: revolucoes };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.REVOLUCOES = api;
})(typeof window !== 'undefined' ? window : globalThis);
