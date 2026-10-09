/* ============================================================
   OS DADOS DA TERRA — os conjuntos (09/out/2026, PERFIL.md item 75)
   "Lista todos os dados da Terra, de geografia, física, astrologia: enumerar, filtrar, guardar todos em
   uma lista e aplicar diversas lentes."
   Cada conjunto diz de onde vêm os números. Os que já moram no app (as cidades do mapa, as estrelas do
   céu do Jardim, as revoluções) entram por dados.js, sem cópia.
   Coluna: { id, nome, tipo: texto | categoria | numero | ano, unidade, log (a escala pede régua de dez em dez) }
   ============================================================ */
(function (raiz) {
  'use strict';

  /* ---------- os planetas (NASA, Planetary Fact Sheet) ---------- */
  var PLANETAS = {
    id: 'planetas', nome: 'Os planetas', sub: 'o Sistema Solar, planeta por planeta', area: 'astronomia',
    fonte: ['NASA, Planetary Fact Sheet', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/'],
    nota: 'As luas são as conhecidas em 2025: a contagem cresce a cada descoberta.',
    colunas: [
      { id: 'nome', nome: 'Planeta', tipo: 'texto' },
      { id: 'tipo', nome: 'Tipo', tipo: 'categoria' },
      { id: 'distancia', nome: 'Distância média do Sol', tipo: 'numero', unidade: 'milhões de km', log: true },
      { id: 'diametro', nome: 'Diâmetro', tipo: 'numero', unidade: 'km', log: true },
      { id: 'massa', nome: 'Massa', tipo: 'numero', unidade: '× a da Terra', log: true },
      { id: 'gravidade', nome: 'Gravidade', tipo: 'numero', unidade: 'm/s²' },
      { id: 'dia', nome: 'Duração do dia', tipo: 'numero', unidade: 'horas', log: true },
      { id: 'ano', nome: 'Duração do ano', tipo: 'numero', unidade: 'dias terrestres', log: true },
      { id: 'temperatura', nome: 'Temperatura média', tipo: 'numero', unidade: '°C' },
      { id: 'luas', nome: 'Luas', tipo: 'numero' },
    ],
    linhas: [
      ['Mercúrio', 'rochoso', 57.9, 4879, 0.0553, 3.7, 4222.6, 88.0, 167, 0],
      ['Vênus', 'rochoso', 108.2, 12104, 0.815, 8.9, 2802.0, 224.7, 464, 0],
      ['Terra', 'rochoso', 149.6, 12756, 1, 9.8, 24.0, 365.2, 15, 1],
      ['Marte', 'rochoso', 227.9, 6792, 0.107, 3.7, 24.7, 687.0, -65, 2],
      ['Júpiter', 'gigante gasoso', 778.5, 142984, 317.8, 23.1, 9.9, 4331, -110, 97],
      ['Saturno', 'gigante gasoso', 1432.0, 120536, 95.2, 9.0, 10.7, 10747, -140, 274],
      ['Urano', 'gigante de gelo', 2867.0, 51118, 14.5, 8.7, 17.2, 30589, -195, 29],
      ['Netuno', 'gigante de gelo', 4515.0, 49528, 17.1, 11.0, 16.1, 59800, -200, 16],
    ],
  };

  /* ---------- as constantes e medidas fundamentais (SI de 2019, CODATA 2018, IAU) ---------- */
  var CONSTANTES = {
    id: 'constantes', nome: 'As constantes', sub: 'os números que medem o mundo', area: 'fisica',
    fonte: ['NIST, CODATA 2018 e o SI de 2019', 'https://physics.nist.gov/cuu/Constants/'],
    nota: '"Exata" quer dizer definida por lei: desde 2019, o metro, o quilo, o segundo e o kelvin se definem fixando estes números.',
    colunas: [
      { id: 'nome', nome: 'Constante', tipo: 'texto' },
      { id: 'simbolo', nome: 'Símbolo', tipo: 'texto' },
      { id: 'valor', nome: 'Valor', tipo: 'numero', log: true },
      { id: 'unidade', nome: 'Unidade', tipo: 'texto' },
      { id: 'campo', nome: 'Campo', tipo: 'categoria' },
      { id: 'exata', nome: 'Exata?', tipo: 'categoria' },
    ],
    linhas: [
      ['Velocidade da luz no vácuo', 'c', 299792458, 'm/s', 'física', 'exata'],
      ['Constante de Planck', 'h', 6.62607015e-34, 'J·s', 'física quântica', 'exata'],
      ['Carga elementar', 'e', 1.602176634e-19, 'C', 'eletricidade', 'exata'],
      ['Constante de Boltzmann', 'k', 1.380649e-23, 'J/K', 'termodinâmica', 'exata'],
      ['Número de Avogadro', 'Nₐ', 6.02214076e23, 'por mol', 'química', 'exata'],
      ['Constante gravitacional', 'G', 6.6743e-11, 'm³/(kg·s²)', 'gravitação', 'medida'],
      ['Gravidade padrão na Terra', 'g₀', 9.80665, 'm/s²', 'gravitação', 'exata'],
      ['Massa do elétron', 'mₑ', 9.1093837015e-31, 'kg', 'física de partículas', 'medida'],
      ['Massa do próton', 'mₚ', 1.67262192369e-27, 'kg', 'física de partículas', 'medida'],
      ['Permissividade do vácuo', 'ε₀', 8.8541878128e-12, 'F/m', 'eletricidade', 'medida'],
      ['Constante dos gases', 'R', 8.314462618, 'J/(mol·K)', 'química', 'exata'],
      ['Constante de Stefan-Boltzmann', 'σ', 5.670374419e-8, 'W/(m²·K⁴)', 'termodinâmica', 'exata'],
      ['Constante de estrutura fina', 'α', 0.0072973525693, '(sem unidade, ≈ 1/137)', 'física quântica', 'medida'],
      ['Unidade astronômica', 'au', 149597870700, 'm', 'astronomia', 'exata'],
      ['Ano-luz', 'al', 9460730472580800, 'm', 'astronomia', 'exata'],
      ['Raio médio da Terra', 'R⊕', 6371000, 'm', 'astronomia', 'medida'],
      ['Massa da Terra', 'M⊕', 5.972e24, 'kg', 'astronomia', 'medida'],
      ['Massa do Sol', 'M☉', 1.989e30, 'kg', 'astronomia', 'medida'],
      ['Idade do universo', 't₀', 13.787e9, 'anos', 'cosmologia', 'medida'],
      ['Idade da Terra', '', 4.54e9, 'anos', 'geologia', 'medida'],
      ['Velocidade do som no ar (20 °C)', 'v', 343, 'm/s', 'física', 'medida'],
      ['Zero absoluto', '0 K', -273.15, '°C', 'termodinâmica', 'exata'],
    ],
  };

  /* ---------- os elementos (IUPAC, pesos atômicos padrão abreviados; [ ] = do isótopo mais estável) ---------- */
  var CATEGORIAS = { a: 'metal alcalino', t: 'metal alcalinoterroso', m: 'metal de transição', l: 'lantanídeo', c: 'actinídeo', p: 'metal pós-transição', s: 'semimetal', n: 'não metal', h: 'halogênio', g: 'gás nobre' };
  /* número, símbolo, nome, massa, grupo, período, categoria, estado a 20 °C (s, l, g; x = sintético, não se sabe) */
  var E = 'H Hidrogênio 1.008 1 1 n g|He Hélio 4.0026 18 1 g g|Li Lítio 6.94 1 2 a s|Be Berílio 9.0122 2 2 t s|B Boro 10.81 13 2 s s|C Carbono 12.011 14 2 n s|N Nitrogênio 14.007 15 2 n g|O Oxigênio 15.999 16 2 n g|F Flúor 18.998 17 2 h g|Ne Neônio 20.180 18 2 g g|' +
    'Na Sódio 22.990 1 3 a s|Mg Magnésio 24.305 2 3 t s|Al Alumínio 26.982 13 3 p s|Si Silício 28.085 14 3 s s|P Fósforo 30.974 15 3 n s|S Enxofre 32.06 16 3 n s|Cl Cloro 35.45 17 3 h g|Ar Argônio 39.95 18 3 g g|' +
    'K Potássio 39.098 1 4 a s|Ca Cálcio 40.078 2 4 t s|Sc Escândio 44.956 3 4 m s|Ti Titânio 47.867 4 4 m s|V Vanádio 50.942 5 4 m s|Cr Cromo 51.996 6 4 m s|Mn Manganês 54.938 7 4 m s|Fe Ferro 55.845 8 4 m s|Co Cobalto 58.933 9 4 m s|Ni Níquel 58.693 10 4 m s|Cu Cobre 63.546 11 4 m s|Zn Zinco 65.38 12 4 m s|Ga Gálio 69.723 13 4 p s|Ge Germânio 72.630 14 4 s s|As Arsênio 74.922 15 4 s s|Se Selênio 78.971 16 4 n s|Br Bromo 79.904 17 4 h l|Kr Criptônio 83.798 18 4 g g|' +
    'Rb Rubídio 85.468 1 5 a s|Sr Estrôncio 87.62 2 5 t s|Y Ítrio 88.906 3 5 m s|Zr Zircônio 91.224 4 5 m s|Nb Nióbio 92.906 5 5 m s|Mo Molibdênio 95.95 6 5 m s|Tc Tecnécio [98] 7 5 m s|Ru Rutênio 101.07 8 5 m s|Rh Ródio 102.91 9 5 m s|Pd Paládio 106.42 10 5 m s|Ag Prata 107.87 11 5 m s|Cd Cádmio 112.41 12 5 m s|In Índio 114.82 13 5 p s|Sn Estanho 118.71 14 5 p s|Sb Antimônio 121.76 15 5 s s|Te Telúrio 127.60 16 5 s s|I Iodo 126.90 17 5 h s|Xe Xenônio 131.29 18 5 g g|' +
    'Cs Césio 132.91 1 6 a s|Ba Bário 137.33 2 6 t s|La Lantânio 138.91 - 6 l s|Ce Cério 140.12 - 6 l s|Pr Praseodímio 140.91 - 6 l s|Nd Neodímio 144.24 - 6 l s|Pm Promécio [145] - 6 l s|Sm Samário 150.36 - 6 l s|Eu Európio 151.96 - 6 l s|Gd Gadolínio 157.25 - 6 l s|Tb Térbio 158.93 - 6 l s|Dy Disprósio 162.50 - 6 l s|Ho Hólmio 164.93 - 6 l s|Er Érbio 167.26 - 6 l s|Tm Túlio 168.93 - 6 l s|Yb Itérbio 173.05 - 6 l s|Lu Lutécio 174.97 - 6 l s|' +
    'Hf Háfnio 178.49 4 6 m s|Ta Tântalo 180.95 5 6 m s|W Tungstênio 183.84 6 6 m s|Re Rênio 186.21 7 6 m s|Os Ósmio 190.23 8 6 m s|Ir Irídio 192.22 9 6 m s|Pt Platina 195.08 10 6 m s|Au Ouro 196.97 11 6 m s|Hg Mercúrio 200.59 12 6 m l|Tl Tálio 204.38 13 6 p s|Pb Chumbo 207.2 14 6 p s|Bi Bismuto 208.98 15 6 p s|Po Polônio [209] 16 6 p s|At Astato [210] 17 6 h s|Rn Radônio [222] 18 6 g g|' +
    'Fr Frâncio [223] 1 7 a s|Ra Rádio [226] 2 7 t s|Ac Actínio [227] - 7 c s|Th Tório 232.04 - 7 c s|Pa Protactínio 231.04 - 7 c s|U Urânio 238.03 - 7 c s|Np Netúnio [237] - 7 c s|Pu Plutônio [244] - 7 c s|Am Amerício [243] - 7 c s|Cm Cúrio [247] - 7 c s|Bk Berquélio [247] - 7 c s|Cf Califórnio [251] - 7 c s|Es Einstênio [252] - 7 c s|Fm Férmio [257] - 7 c x|Md Mendelévio [258] - 7 c x|No Nobélio [259] - 7 c x|Lr Laurêncio [266] - 7 c x|' +
    'Rf Rutherfórdio [267] 4 7 m x|Db Dúbnio [268] 5 7 m x|Sg Seabórgio [269] 6 7 m x|Bh Bóhrio [270] 7 7 m x|Hs Hássio [269] 8 7 m x|Mt Meitnério [278] 9 7 m x|Ds Darmstádio [281] 10 7 m x|Rg Roentgênio [282] 11 7 m x|Cn Copernício [285] 12 7 m x|Nh Nihônio [286] 13 7 p x|Fl Fleróvio [289] 14 7 p x|Mc Moscóvio [290] 15 7 p x|Lv Livermório [293] 16 7 p x|Ts Tenesso [294] 17 7 h x|Og Oganessônio [294] 18 7 g x';
  var ESTADOS = { s: 'sólido', l: 'líquido', g: 'gasoso', x: 'sintético (não se sabe)' };
  var ELEMENTOS = {
    id: 'elementos', nome: 'Os elementos', sub: 'a tabela periódica, de que tudo é feito', area: 'quimica',
    fonte: ['IUPAC, pesos atômicos padrão', 'https://iupac.qmul.ac.uk/AtWt/'],
    nota: 'A massa entre colchetes é a do isótopo mais estável (o elemento não tem peso atômico padrão). O estado é a 20 °C e 1 atmosfera.',
    colunas: [
      { id: 'numero', nome: 'Número', tipo: 'numero' },
      { id: 'simbolo', nome: 'Símbolo', tipo: 'texto' },
      { id: 'nome', nome: 'Elemento', tipo: 'texto' },
      { id: 'massa', nome: 'Massa atômica', tipo: 'numero', unidade: 'u' },
      { id: 'grupo', nome: 'Grupo', tipo: 'numero' },
      { id: 'periodo', nome: 'Período', tipo: 'numero' },
      { id: 'categoria', nome: 'Família', tipo: 'categoria' },
      { id: 'estado', nome: 'Estado', tipo: 'categoria' },
    ],
    linhas: E.split('|').map(function (t, i) {
      var c = t.split(' '), massa = c[2].charAt(0) === '[' ? Number(c[2].slice(1, -1)) : Number(c[2]);
      return [i + 1, c[0], c[1], massa, c[3] === '-' ? null : Number(c[3]), Number(c[4]), CATEGORIAS[c[5]], ESTADOS[c[6]], c[2].charAt(0) === '['];
    }),
  };

  /* ---------- o céu do zodíaco: as constelações que o Sol atravessa hoje (IAU) e os signos da tradição ---------- */
  var ZODIACO = {
    id: 'zodiaco', nome: 'O zodíaco', sub: 'as constelações do caminho do Sol, e os signos', area: 'astronomia',
    fonte: ['IAU, fronteiras das constelações (1930)', 'https://www.iau.org/public/themes/constellations/'],
    nota: 'Os signos foram fixados há uns 2 mil anos. Com a precessão dos equinócios (o eixo da Terra gira como um pião, uma volta a cada ~26 mil anos), o Sol hoje está, na data de cada signo, quase sempre na constelação vizinha. E ele passa também por uma 13ª, o Serpentário (Ofiúco). As datas mudam um dia para lá ou para cá a cada ano.',
    colunas: [
      { id: 'nome', nome: 'Constelação', tipo: 'texto' },
      { id: 'latim', nome: 'Em latim', tipo: 'texto' },
      { id: 'sol', nome: 'O Sol passa (hoje)', tipo: 'texto' },
      { id: 'dias', nome: 'Dias', tipo: 'numero' },
      { id: 'signo', nome: 'O signo da tradição', tipo: 'texto' },
      { id: 'signoDatas', nome: 'Datas do signo', tipo: 'texto' },
    ],
    linhas: [
      ['Capricórnio', 'Capricornus', '19/jan a 15/fev', 28, 'Capricórnio', '22/dez a 19/jan'],
      ['Aquário', 'Aquarius', '16/fev a 11/mar', 24, 'Aquário', '20/jan a 18/fev'],
      ['Peixes', 'Pisces', '12/mar a 18/abr', 38, 'Peixes', '19/fev a 20/mar'],
      ['Áries', 'Aries', '19/abr a 13/mai', 25, 'Áries', '21/mar a 19/abr'],
      ['Touro', 'Taurus', '14/mai a 19/jun', 37, 'Touro', '20/abr a 20/mai'],
      ['Gêmeos', 'Gemini', '20/jun a 20/jul', 31, 'Gêmeos', '21/mai a 20/jun'],
      ['Câncer', 'Cancer', '21/jul a 9/ago', 20, 'Câncer', '21/jun a 22/jul'],
      ['Leão', 'Leo', '10/ago a 15/set', 37, 'Leão', '23/jul a 22/ago'],
      ['Virgem', 'Virgo', '16/set a 30/out', 45, 'Virgem', '23/ago a 22/set'],
      ['Libra', 'Libra', '31/out a 22/nov', 23, 'Libra', '23/set a 22/out'],
      ['Escorpião', 'Scorpius', '23/nov a 29/nov', 7, 'Escorpião', '23/out a 21/nov'],
      ['Serpentário (Ofiúco)', 'Ophiuchus', '30/nov a 17/dez', 18, '(nenhum: a tradição não o conta)', '—'],
      ['Sagitário', 'Sagittarius', '18/dez a 18/jan', 32, 'Sagitário', '22/nov a 21/dez'],
    ],
  };

  /* ---------- os tempos da Terra (Comissão Internacional de Estratigrafia) ---------- */
  var TEMPOS = {
    id: 'tempos', nome: 'Os tempos da Terra', sub: 'os éons e as eras, do mais antigo ao de agora', area: 'geologia',
    fonte: ['ICS, Tabela Cronoestratigráfica Internacional', 'https://stratigraphy.org/chart'],
    colunas: [
      { id: 'nome', nome: 'Tempo', tipo: 'texto' },
      { id: 'nivel', nome: 'Nível', tipo: 'categoria' },
      { id: 'inicio', nome: 'Começou há', tipo: 'numero', unidade: 'milhões de anos', log: true },
      { id: 'fim', nome: 'Terminou há', tipo: 'numero', unidade: 'milhões de anos' },
      { id: 'marca', nome: 'O que marca', tipo: 'texto' },
    ],
    linhas: [
      ['Hadeano', 'éon', 4540, 4000, 'a Terra se forma, a Lua, os primeiros oceanos'],
      ['Arqueano', 'éon', 4000, 2500, 'as rochas mais antigas que restaram; a vida microbiana'],
      ['Proterozoico', 'éon', 2500, 538.8, 'o oxigênio no ar; as células com núcleo; os primeiros seres de muitas células'],
      ['Paleozoico', 'era', 538.8, 251.9, 'a explosão cambriana, os peixes, as florestas, os anfíbios; termina na maior extinção'],
      ['Mesozoico', 'era', 251.9, 66, 'os dinossauros, as primeiras aves e flores; termina com o asteroide'],
      ['Cenozoico', 'era', 66, 0, 'os mamíferos, as gramíneas, os humanos'],
      ['Quaternário', 'período', 2.58, 0, 'as glaciações; o gênero Homo; nós'],
    ],
  };

  var api = { conjuntos: [PLANETAS, CONSTANTES, ELEMENTOS, ZODIACO, TEMPOS] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.DADOS_TERRA = api;
})(typeof window !== 'undefined' ? window : globalThis);
