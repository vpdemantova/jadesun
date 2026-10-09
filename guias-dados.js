/* ============================================================
   OS GUIAS — os dados (09/out/2026, PERFIL.md item 74)
   "esses guias são cruciais: a máxima síntese de toda a plataforma"
   · as fontes: quem é cada uma e por que está aqui (a curadoria vale também para as notícias)
   · os livros: os especiais, por necessidade (com o porquê)
   · as necessidades do mundo: os 17 Objetivos de Desenvolvimento Sustentável da ONU (2015)
   · os caminhos: cada guia leva a um lugar do Portal Solar
   ============================================================ */
(function (raiz) {
  'use strict';

  var GRUPOS = [
    ['mundo', 'O mundo', 'agências e jornais com correspondentes no mundo todo'],
    ['brasil', 'O Brasil', 'jornalismo independente e serviço público'],
    ['ciencia', 'A ciência', 'das revistas que publicam as descobertas'],
    ['planeta', 'O planeta', 'clima, florestas e dados'],
    ['cultura', 'A cultura', 'ensaios, obras em domínio público, aulas abertas'],
  ];
  /* id, grupo, nome, site, língua, por que está aqui */
  var FONTES = [
    ['bbc', 'mundo', 'BBC News, Mundo', 'https://www.bbc.com/news/world', 'en', 'serviço público britânico, financiado pela licença dos espectadores'],
    ['aljazeera', 'mundo', 'Al Jazeera', 'https://www.aljazeera.com/', 'en', 'o Sul Global visto de dentro, com muitos correspondentes'],
    ['guardian', 'mundo', 'The Guardian, Mundo', 'https://www.theguardian.com/world', 'en', 'de um fundo sem dono acionista (o Scott Trust), aberto sem paywall'],
    ['dw', 'mundo', 'Deutsche Welle', 'https://www.dw.com/en/', 'en', 'serviço público alemão para o exterior'],
    ['onu', 'mundo', 'ONU News', 'https://news.un.org/pt/', 'pt', 'as Nações Unidas, em português'],
    ['bbcbrasil', 'brasil', 'BBC News Brasil', 'https://www.bbc.com/portuguese', 'pt', 'o mesmo serviço público, em português'],
    ['publica', 'brasil', 'Agência Pública', 'https://apublica.org/', 'pt', 'reportagem investigativa sem fins lucrativos, de reprodução livre'],
    ['agenciabrasil', 'brasil', 'Agência Brasil', 'https://agenciabrasil.ebc.com.br/', 'pt', 'agência pública de notícias (EBC), de reprodução livre'],
    ['nexo', 'brasil', 'Nexo Jornal', 'https://www.nexojornal.com.br/', 'pt', 'contexto e explicação, com dados'],
    ['piaui', 'brasil', 'piauí', 'https://piaui.folha.uol.com.br/', 'pt', 'reportagem longa e ensaio'],
    ['nature', 'ciencia', 'Nature', 'https://www.nature.com/', 'en', 'a revista científica de referência desde 1869'],
    ['quanta', 'ciencia', 'Quanta Magazine', 'https://www.quantamagazine.org/', 'en', 'matemática, física e biologia explicadas por quem entende, sem anúncio'],
    ['nasa', 'ciencia', 'NASA', 'https://www.nasa.gov/', 'en', 'o espaço, direto da agência (e a foto astronômica do dia)'],
    ['fapesp', 'ciencia', 'Revista Pesquisa FAPESP', 'https://revistapesquisa.fapesp.br/', 'pt', 'a ciência feita no Brasil, da fundação paulista de pesquisa'],
    ['jornalusp', 'ciencia', 'Jornal da USP', 'https://jornal.usp.br/', 'pt', 'a universidade pública conta o que pesquisa'],
    ['carbonbrief', 'planeta', 'Carbon Brief', 'https://www.carbonbrief.org/', 'en', 'clima com dados e checagem de fatos'],
    ['mongabay', 'planeta', 'Mongabay', 'https://news.mongabay.com/', 'en', 'florestas e biodiversidade, sem fins lucrativos'],
    ['oeco', 'planeta', '((o))eco', 'https://oeco.org.br/', 'pt', 'jornalismo ambiental brasileiro'],
    ['owid', 'planeta', 'Our World in Data', 'https://ourworldindata.org/', 'en', 'os grandes problemas do mundo, em dados abertos (Oxford)'],
    ['aeon', 'cultura', 'Aeon', 'https://aeon.co/', 'en', 'ensaios de filosofia, ciência e cultura, sem paywall'],
    ['pdr', 'cultura', 'The Public Domain Review', 'https://publicdomainreview.org/', 'en', 'obras raras em domínio público, com ensaios'],
    ['openculture', 'cultura', 'Open Culture', 'https://www.openculture.com/', 'en', 'cursos, livros, filmes e áudios abertos'],
  ];

  /* os livros especiais, por necessidade: [autor, título, ano, por quê] */
  var LIVROS = [
    { id: 'mundo', nome: 'Para entender o mundo agora', livros: [
      ['Hans Rosling', 'Factfulness', 2018, 'o mundo melhora e piora ao mesmo tempo: ver com números, não com medo'],
      ['Ailton Krenak', 'Ideias para adiar o fim do mundo', 2019, 'a Terra não é recurso; nós somos a Terra'],
      ['Davi Kopenawa e Bruce Albert', 'A queda do céu', 2010, 'um xamã yanomami fala aos brancos'],
      ['Kate Raworth', 'Economia Donut', 2017, 'o espaço justo e seguro entre o piso social e o teto do planeta'],
      ['Amartya Sen', 'Desenvolvimento como liberdade', 1999, 'desenvolver é ampliar o que as pessoas podem ser e fazer'],
      ['Elizabeth Kolbert', 'A sexta extinção', 2014, 'o que está acontecendo com a vida no planeta'],
    ] },
    { id: 'alma', nome: 'Para a alma: música e arte', livros: [
      ['Alex Ross', 'O resto é ruído', 2007, 'o século XX ouvido de ponta a ponta'],
      ['Leonard Bernstein', 'The Joy of Music', 1959, 'como ouvir uma sinfonia, por quem regia e ensinava'],
      ['E. H. Gombrich', 'A história da arte', 1950, 'a melhor porta de entrada, para qualquer idade'],
      ['John Berger', 'Modos de ver', 1972, 'como a imagem nos olha de volta'],
      ['Wassily Kandinsky', 'Do espiritual na arte', 1911, 'a cor e o som como caminho interior'],
      ['Rainer Maria Rilke', 'Cartas a um jovem poeta', 1929, 'sobre a solidão de quem cria'],
    ] },
    { id: 'canone', nome: 'O cânone (a sua lista)', livros: [
      ['Hesíodo', 'Teogonia', -700, 'o nascimento dos deuses: a primeira árvore genealógica do Ocidente'],
      ['Homero', 'Odisseia', -700, 'a volta para casa'],
      ['Dante Alighieri', 'A Divina Comédia', 1321, 'do inferno ao paraíso, em três cantos de cem'],
      ['John Milton', 'Paraíso perdido', 1667, 'a queda contada em verso'],
      ['Machado de Assis', 'Memórias póstumas de Brás Cubas', 1881, 'o Brasil visto por um defunto irônico'],
      ['João Guimarães Rosa', 'Grande sertão: veredas', 1956, 'o mundo inteiro no sertão'],
      ['Ezra Pound', 'ABC da literatura', 1934, 'como ler: o guia de quem quer ler os melhores'],
    ] },
    { id: 'pensar', nome: 'Para pensar e viver', livros: [
      ['Marco Aurélio', 'Meditações', 180, 'um imperador anota como ser bom'],
      ['Michel de Montaigne', 'Ensaios', 1580, 'pensar em voz alta sobre si e sobre tudo'],
      ['Simone Weil', 'A gravidade e a graça', 1947, 'atenção é a forma mais rara de generosidade'],
      ['Hannah Arendt', 'A condição humana', 1958, 'trabalho, obra e ação'],
      ['Paulo Freire', 'Pedagogia do oprimido', 1968, 'ninguém educa ninguém; as pessoas se educam juntas'],
    ] },
    { id: 'tecnica', nome: 'Para a técnica e o futuro', livros: [
      ['Carl Sagan', 'Pálido ponto azul', 1994, 'a Terra vista de longe'],
      ['Richard Feynman', 'Física em seis lições', 1994, 'a física explicada pelo maior professor'],
      ['Douglas Hofstadter', 'Gödel, Escher, Bach', 1979, 'a mente, a música e a matemática numa trança'],
      ['Christopher Alexander', 'Uma linguagem de padrões', 1977, 'como fazer lugares vivos, do quarto à cidade'],
      ['Ivan Illich', 'A convivencialidade', 1973, 'ferramentas que servem às pessoas'],
    ] },
  ];

  /* os 17 Objetivos de Desenvolvimento Sustentável (ONU, 2015), com as cores oficiais */
  var ODS = [
    [1, 'Erradicação da pobreza', '#E5243B'], [2, 'Fome zero e agricultura sustentável', '#DDA63A'], [3, 'Saúde e bem-estar', '#4C9F38'],
    [4, 'Educação de qualidade', '#C5192D'], [5, 'Igualdade de gênero', '#FF3A21'], [6, 'Água potável e saneamento', '#26BDE2'],
    [7, 'Energia limpa e acessível', '#FCC30B'], [8, 'Trabalho decente e crescimento econômico', '#A21942'], [9, 'Indústria, inovação e infraestrutura', '#FD6925'],
    [10, 'Redução das desigualdades', '#DD1367'], [11, 'Cidades e comunidades sustentáveis', '#FD9D24'], [12, 'Consumo e produção responsáveis', '#BF8B2E'],
    [13, 'Ação contra a mudança global do clima', '#3F7E44'], [14, 'Vida na água', '#0A97D9'], [15, 'Vida terrestre', '#56C02B'],
    [16, 'Paz, justiça e instituições eficazes', '#00689D'], [17, 'Parcerias e meios de implementação', '#19486A'],
  ];

  /* os caminhos: cada guia leva a um lugar do Portal Solar (a síntese da plataforma) */
  var CAMINHOS = [
    ['domino.html', 'domino', 'Como estudar para a prova', 'o mapa geral: marque o que já sabe, veja o que falta'],
    ['curadoria.html', 'curadoria', 'Como ouvir música e ver arte', 'a curadoria assinada: a praça, o pavão, o éter'],
    ['atlas.html#planeta', 'planeta', 'Como cuidar do planeta', 'os doze aspectos da vida e os hábitos de cada um'],
    ['atlas.html#terra', 'atlas', 'Como olhar a Terra agora', 'onde é dia, onde é noite, quem está acordado'],
    ['eu.html', 'ficha', 'Como fazer a sua ficha', 'o seu cartão, para mandar a um amigo'],
    ['biblioteca.html', 'biblioteca', 'Como achar qualquer coisa', 'todas as fichas do caderno, em seções'],
    ['casa.html', 'casa', 'Como morar no Portal', 'a casa em 3D: a estante, o guarda-roupa, o jardim'],
    ['manifesto.html', 'manifesto', 'Por que tudo isso', 'o manifesto, os manifestos e a filosofia'],
  ];

  var api = { grupos: GRUPOS, fontes: FONTES, livros: LIVROS, ods: ODS, caminhos: CAMINHOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.GUIAS = api;
})(typeof window !== 'undefined' ? window : globalThis);
