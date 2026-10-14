/* ============================================================
   Portal Solar · galeria-dados.js (13/out/2026) — os dados da Galeria de design.

   OPCOES: o que já dá para experimentar agora (as mesmas chaves do Personalizar).
   REFERENCIAS: interfaces atemporais e futuristas. Só nome, data, quem fez, por que
     está aqui e o link (aberto em 13/out/2026). Nenhuma imagem de terceiros: as obras
     são de quem as fez; aqui só se aponta para elas.
   PROPOSTAS: os designs da comunidade, públicos, com autor e licença. Para pôr uma:
     { titulo, autor, data: 'aaaa-mm-dd', licenca: 'CC BY-SA 4.0', link: 'https://… (Figma, site)',
       imagem: 'galeria/arquivo.png' (opcional, com a licença da própria pessoa), descricao, funcao: 'design' }
   ============================================================ */
(function () {
  'use strict';

  var OPCOES = [
    { chave: 'tema', grupo: 'Cores', desc: 'O papel, a tinta e o sinal de cada tema.', itens: [
      ['auto', 'Do aparelho', 'claro de dia, escuro à noite', { papel: '#ECE6D3', tinta: '#100F0B', sinal: '#FF3B1D', meio: '#0F0E0B' }],
      ['claro', 'Claro', 'papel e tinta', { papel: '#ECE6D3', tinta: '#100F0B', sinal: '#FF3B1D' }],
      ['escuro', 'Escuro', 'a noite do caderno', { papel: '#0F0E0B', tinta: '#ECE6D3', sinal: '#FF3B1D' }],
      ['sepia', 'Sépia', 'livro antigo', { papel: '#F1E7D0', tinta: '#2E2416', sinal: '#E07A3A' }],
      ['azul-noite', 'Azul da noite', 'céu de observatório', { papel: '#0A1020', tinta: '#E4EAF7', sinal: '#5B8CFF' }],
      ['floresta', 'Floresta', 'o verde do jardim', { papel: '#0C1510', tinta: '#E3EFDF', sinal: '#7BD86A' }],
      ['pb-claro', 'Preto e branco', 'só luz e sombra', { papel: '#FFFFFF', tinta: '#000000', sinal: '#D0D0D0' }],
      ['pb-escuro', 'Branco e preto', 'o mesmo, invertido', { papel: '#000000', tinta: '#FFFFFF', sinal: '#5C5C5C' }],
    ] },
    { chave: 'aparencia', grupo: 'Aparência', desc: 'O desenho das caixas, das linhas e do vidro.', itens: [
      ['fino|solar', 'Fino · Solar', 'o padrão: jade, sol e o céu de agora', { estilo: 'fino', acabamento: 'solar' }],
      ['fino|almanaque', 'Fino · Almanaque', 'papel e fios', { estilo: 'fino', acabamento: 'almanaque' }],
      ['fino|casa', 'Fino · Casa', 'vidro quente, como o 3D', { estilo: 'fino', acabamento: 'casa' }],
      ['fino|simples', 'Fino · Simples', 'sem enfeite', { estilo: 'fino', acabamento: 'simples' }],
      ['classico|solar', 'Clássico', 'bordas fortes e sombra chapada', { estilo: 'classico' }],
    ] },
    { chave: 'marca', grupo: 'A marca', desc: 'O Quadrado de Malevich, em cinco cores.', itens: [
      ['auto', 'Negro', 'branco no escuro', { q: '#100F0B', fundo: '#ECE6D3' }],
      ['vermelho', 'Vermelho', 'o quadrado vermelho, 1915', { q: '#C8211D', fundo: '#ECE6D3' }],
      ['branco', 'Branco sobre branco', '1918', { q: '#F7F4EC', fundo: '#E6E1D3' }],
      ['sol', 'Da cor do sol', 'o sinal do Portal', { q: '#E9A84A', fundo: '#120D08' }],
      ['jade', 'Jade', 'a montanha de jade', { q: '#1B5A44', fundo: '#ECE6D3' }],
    ] },
    { chave: 'menu', grupo: 'O menu', desc: 'Como as portas se arrumam no alto.', itens: [
      ['simetrico', 'Simétrico', 'o mundo, o Quadrado, você', {}],
      ['antigo', 'O de antes', 'cinco portas em fila', {}],
    ] },
    { chave: 'movimento', grupo: 'Movimento', desc: 'Quanto as coisas se mexem.', itens: [
      ['calmo', 'Calmo', 'quase nada se mexe', {}],
      ['fino', 'Fino', 'o padrão', {}],
      ['imersivo', 'Imersivo', 'cursor de luz e partículas', {}],
    ] },
  ];

  /* grupo, ano, nome, quem, por que está aqui, links [rótulo, endereço] */
  var REFERENCIAS = [
    /* ── atemporais ── */
    ['atemporal', '1910–1934', 'O Mundaneum', 'Paul Otlet e Henri La Fontaine', 'Milhões de fichas e uma rede universal do conhecimento antes da internet: o avô do Atlas.', [['Wikipédia (pt)', 'https://pt.wikipedia.org/wiki/Mundaneum'], ['Wikipedia (en)', 'https://en.wikipedia.org/wiki/Mundaneum']]],
    ['atemporal', '1925–', 'Isotype', 'Otto e Marie Neurath, Gerd Arntz', 'Estatística em pictogramas, para qualquer pessoa entender os números do mundo.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Isotype_(picture_language)']]],
    ['atemporal', '1944', 'O relógio das ferrovias suíças', 'Hans Hilfiker', 'Uma interface que se lê de longe, num relance; o ponteiro vermelho dos segundos espera no alto antes de cada minuto.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Swiss_railway_clock']]],
    ['atemporal', '1945', 'As We May Think e o Memex', 'Vannevar Bush', 'Trilhas de leitura que se guardam e se passam adiante: o avô das Leituras.', [['O ensaio', 'https://en.wikipedia.org/wiki/As_We_May_Think'], ['O Memex', 'https://en.wikipedia.org/wiki/Memex']]],
    ['atemporal', '1960–', 'Project Xanadu', 'Ted Nelson', 'Hipertexto com o caminho de volta para a fonte de cada trecho: o sonho das referências ao lado de cada frase.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Project_Xanadu']]],
    ['atemporal', '1968', 'A mãe de todas as demonstrações', 'Douglas Engelbart', 'Mouse, hipertexto e edição a várias mãos, ao vivo: tudo o que o Portal quer ser, já em 1968.', [['Wikipedia', 'https://en.wikipedia.org/wiki/The_Mother_of_All_Demos'], ['Instituto Engelbart', 'https://www.dougengelbart.org/content/view/209/']]],
    ['atemporal', '1950–1981', 'A grade', 'Josef Müller-Brockmann', 'Tudo alinhado a uma regra que se vê; os cartazes de Zurique e o livro Sistemas de grelha.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Josef_M%C3%BCller-Brockmann']]],
    ['atemporal', '1972', 'O diagrama do metrô de Nova York', 'Massimo Vignelli', 'Simplificar o mapa até ele virar um diagrama claro.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Massimo_Vignelli'], ['Vignelli Center', 'https://www.rit.edu/vignellicenter/']]],
    ['atemporal', '1972', 'Os pictogramas de Munique', 'Otl Aicher', 'Um sistema de sinais numa grade de ângulos fixos, entendido em qualquer língua.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Otl_Aicher']]],
    ['atemporal', '1975', 'O manual de identidade da NASA', 'Richard Danne e Bruce Blackburn', 'O "worm" e um manual que ensina a pensar em sistema.', [['A reedição', 'https://www.standardsmanual.com/products/nasa-graphics-standards-manual'], ['Wikipedia', 'https://en.wikipedia.org/wiki/NASA_insignia']]],
    ['atemporal', 'anos 1970–80', 'Dez princípios do bom design', 'Dieter Rams', '"Menos, porém melhor": útil, honesto, discreto, duradouro.', [['Vitsœ', 'https://www.vitsoe.com/us/about/good-design']]],
    ['atemporal', '1981', 'Xerox Star', 'Xerox PARC', 'A área de trabalho, as janelas e os ícones como os conhecemos.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Xerox_Star']]],
    ['atemporal', '1984', 'Os ícones do Macintosh', 'Susan Kare', 'Desenhos de poucos pontos que qualquer pessoa entende de primeira.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Susan_Kare']]],
    ['atemporal', '1983–', 'Mostrar dado sem mentir', 'Edward Tufte', 'Pequenos múltiplos e gráficos do tamanho de uma palavra.', [['Edward Tufte', 'https://www.edwardtufte.com/']]],
    /* ── futuristas ── */
    ['futurista', '2011', 'OP-1', 'Teenage Engineering', 'Um instrumento que é computador, com uma interface que dá vontade de brincar.', [['O OP-1', 'https://teenage.engineering/products/op-1']]],
    ['futurista', '2012', 'Wikidata', 'Fundação Wikimedia e milhões de pessoas', 'Uma ontologia feita a muitas mãos: cada coisa com um nome único e as suas relações.', [['Wikidata', 'https://www.wikidata.org/wiki/Wikidata:Main_Page']]],
    ['futurista', '2012', 'Inventing on Principle', 'Bret Victor', 'Ver na hora o efeito de cada mudança; as ideias que viraram ferramentas.', [['Bret Victor', 'https://worrydream.com/']]],
    ['futurista', '2013', 'Her', 'Spike Jonze', 'O futuro calmo: tecnologia quase invisível, cores quentes, nenhuma tela fria.', [['Wikipedia', 'https://en.wikipedia.org/wiki/Her_(film)']]],
    ['futurista', 'anos 2010', 'Explicações exploráveis', 'Bret Victor (o nome, 2011) e Nicky Case (o acervo)', 'Textos que se mexem quando você mexe: aprender brincando com o modelo.', [['Explorable Explanations', 'https://explorabl.es/']]],
    ['futurista', '2017–', 'Dynamicland', 'Bret Victor e equipe', 'Computação na sala, a muitas mãos: o computador é o espaço onde as pessoas estão.', [['Dynamicland', 'https://dynamicland.org/']]],
    ['futurista', 'hoje', 'Interfaces de cinema', 'Territory Studio', 'Gráficos de tela para o cinema, com lógica visual que parece de verdade.', [['Territory Studio', 'https://territorystudio.com/']]],
    ['futurista', '2023–', 'Interfaces no espaço', 'Apple (visionOS)', 'Vidro, profundidade, olhar e gesto: o desenho de telas que flutuam.', [['As diretrizes', 'https://developer.apple.com/design/human-interface-guidelines/designing-for-visionos']]],
  ].map(function (r) { return { grupo: r[0], ano: r[1], nome: r[2], quem: r[3], porque: r[4], links: r[5] }; });

  var PROPOSTAS = [];

  window.GALERIA = { opcoes: OPCOES, referencias: REFERENCIAS, propostas: PROPOSTAS, conferidoEm: '2026-10-13' };
})();
