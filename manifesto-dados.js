/* ============================================================
   MANIFESTO — os dados (09/out/2026, PERFIL.md item 74)
   1. O rascunho do Manifesto do Portal Solar, montado das notas do Vitor (as frases são dele;
      o que é proposta minha vem marcado entre colchetes, para ele aceitar, mudar ou apagar).
      Ele levou o rascunho para o caderno em 09/out (07h03); desde então a página lê o arquivo de lá
      (lib/perfil.mjs, chave "manifesto") e este texto só vale para quem ainda não tem o arquivo.
      O "0 O Manifesto" e a XV, "A Nova Maré", entraram com o sim dele (item 75): a página os lê
      do b Studio por lib/manifesto.mjs, sem copiá-los para cá.
   2. Os manifestos da humanidade: de Lutero ao local-first, com data, autor, o que pedem e onde ler.
   3. A filosofia: os princípios do Portal Solar e as leituras de onde vêm.
   ============================================================ */
(function (raiz) {
  'use strict';

  var RASCUNHO = [
    '# Manifesto do Portal Solar',
    '',
    '*Rascunho de 9 de outubro de 2026, montado das notas de Vitor de Mantova. As frases são dele; o que está entre colchetes é proposta, para ele aceitar, mudar ou apagar. A assinatura vem com o sim dele.*',
    '',
    '> A verdade pura é bem-vinda, e o que está em torno dela pode contemplá-la.',
    '',
    '## Contra marcas e falsidades',
    '',
    'Contra as marcas que vendem identidade no lugar da verdade. Contra as falsidades que se vestem de conhecimento. Contra quem esconde quem escolheu, priva e pede dinheiro para mostrar o que é de todos.',
    '',
    '[Por isso a nossa marca é um quadrado: o grau zero, que qualquer um desenha à mão.]',
    '',
    '## Enquanto',
    '',
    'Enquanto existirem nações, países, estados, cidades, bairros, grupos, famílias e relações em que um detém o poder de decidir o que se faz com a vida, e nessas relações outra parte for privada de exercer o seu papel, físico, mental e intelectual, por maus planejamentos e más estruturas, por inocência ou limitação de quem detém o poder; enquanto os poderes forem limitados e inocentes, rasos e superficiais, qualquer chance de desenvolvimento não é só negada: é regredida.',
    '',
    'Enquanto homens e mulheres deixaram obras preciosas, mas, pelo poder exercido sobre os indivíduos, tantos não têm acesso nem chance de conhecê-las, sem a participação mútua de entrar no mundo, na vida, e entender, qualquer chance de alegria não é só negada: é impossível.',
    '',
    '## Quando',
    '',
    'Quando existirem nações que [deem a cada pessoa a chance de participar]…',
    '',
    'Quando as obras de homens e mulheres [estiverem ao alcance de qualquer um, no lugar certo e no formato visível]…',
    '',
    '## A sagrada vida',
    '',
    'A existência na Terra é delicada, e, como civilização, devemos dar a cada um de nós a oportunidade de participar.',
    '',
    'Quando a tecnologia é mantida segura e a vida é sustentada, podemos criar atmosferas, e o humano é valorizado.',
    '',
    'A vida é esta característica de se refazer a cada instante. O sistema não é o que temos: é a interferência a favor da verdadeira beleza e da apreciação.',
    '',
    'O sinal é quando a apreciação é menor que o trabalho e o fazer. Porque o fazer é para sempre, e a apreciação é só agora. Montanhas, paisagens, vidas, e quanto Deus nos dá.',
    '',
    'O novo movimento utópico é protegido pelo lado luminoso de cada indivíduo.',
    '',
    '## O conhecimento no lugar certo',
    '',
    'Nenhum texto é grande senão apresentado no local correto e no formato definido e visível.',
    '',
    'É incondizente com a natureza humana não organizar o que se organiza da matéria e do verbo, como se fosse deixado ao vento e à sorte. Agora temos os meios, e chegou o tempo de se versar nas luzes tantas!',
    '',
    'O problema é dar conhecimento aos que não o usam: a distribuição do conhecimento. Jamais fixar em textos, e navegar entre eles a cada instante.',
    '',
    'Para quem nunca teve acesso, por falta de oportunidade e não de capacidade: não corrija, ofereça. Um convite é uma porta aberta, não uma prova.',
    '',
    '## O ativismo máximo',
    '',
    'Ajam em cada momento com o máximo de amor. Na incerteza, escolha o amor máximo.',
    '',
    'Não ocupe um lugar maior do que o que tem direito. Esse abuso acaba aqui e agora.',
    '',
    'Os valores estão na reconciliação. A oração é a verdade. E devagar nos sintonizamos com os valores e as jornadas de cada um. Todos juntos nessa, com o máximo respeito e integração: esse é o hino do momento, e é o que precisamos fazer!',
    '',
    'Entrega o teu trabalho e descansa; não espera nada por ele. Olha como é vasto o cosmos!',
    '',
    'Se há arte, há vida.',
    '',
    '## Os princípios',
    '',
    '- Equilíbrio. Conexão. Amor.',
    '- Entendimento. Cooperativismo. Plenitude.',
    '- Reduzir. Reutilizar. Reciclar.',
    '- Máxima honra e continuidade aos mestres do ofício.',
    '- Esteja no presente. Não julgue: contemple. Não reclame: agradeça. Aceite ajuda, por favor. Vá e aja!',
    '',
    '## O manifesto na prática',
    '',
    '[O que o Portal Solar já faz por ele:]',
    '',
    '- [Fichas em vez de perfis; elos com um porquê; sem feed, sem curtidas, sem seguidores.]',
    '- [Curadoria assinada, datada e com fontes.]',
    '- [Os seus arquivos são seus: tudo mora no seu caderno, em texto.]',
    '- [O mapa do que você sabe, o planeta e os hábitos para salvá-lo, o mundo agora.]',
    '',
    '## De mim para nós',
    '',
    'De mim para mim. De mim para você. De mim para nós.',
    'De nós para mim. De nós para você. De nós para nós.',
    '',
    'Isto é arte, não ódio.',
    '',
  ].join('\n');

  /* de onde veio cada frase (as notas do caderno) */
  var FONTES = [
    ['A epígrafe e "contra marcas e falsidades"', 'a mensagem de 09/out/2026'],
    ['"Enquanto…" e "Quando…"; "A sagrada vida"', '1 Villages/0 Saudações/MANIFETSO.md (traduzido do inglês onde estava em inglês)'],
    ['"Nenhum texto é grande…"', '1 Villages/0 Saudações/0. Urgências e Manifestos/Manifestos/Solar.md'],
    ['"É incondizente com a natureza humana…"', '…/Manifestos/a necessidade de studar e sondar os extremos.md'],
    ['"Entrega o teu trabalho e descansa…"', '…/Manifestos/Sustento e Trabalho Feito.md'],
    ['"Não corrija: ofereça…"', '…/Manifestos/Convite à Cultura.md'],
    ['"Ajam em cada momento…", "Não ocupe um lugar maior…", "Os valores estão na reconciliação…"', 'Logboard/# Profile/# Work/a.a Manifestos (6)/If There is Art There is Life/Ideias.md'],
    ['Os princípios e "De mim para nós"', '…/If There is Art There is Life/Anexo Textual.md (traduzido do inglês)'],
  ];

  /* os manifestos da humanidade · familia: direitos | arte | tecnica | educacao | terra ; br: do Brasil */
  var W = 'https://en.wikipedia.org/wiki/', WP = 'https://pt.wikipedia.org/wiki/';
  var MANIFESTOS = [
    { ano: 1517, titulo: '95 Teses', quem: 'Martinho Lutero', onde: 'Wittenberg', familia: 'direitos', pede: 'que a fé não se compre: contra a venda de indulgências', frase: '', url: WP + '95_Teses' },
    { ano: 1525, titulo: 'Os Doze Artigos', quem: 'camponeses da Suábia', onde: 'Memmingen', familia: 'direitos', pede: 'o fim da servidão, o direito de caçar, pescar e escolher o próprio pastor', frase: '', url: W + 'Twelve_Articles' },
    { ano: 1776, titulo: 'Declaração de Independência dos Estados Unidos', quem: 'Thomas Jefferson e o Congresso Continental', onde: 'Filadélfia', familia: 'direitos', pede: 'governo pelo consentimento dos governados', frase: 'Todos os homens são criados iguais.', url: WP + 'Declara%C3%A7%C3%A3o_de_Independ%C3%AAncia_dos_Estados_Unidos' },
    { ano: 1789, titulo: 'Declaração dos Direitos do Homem e do Cidadão', quem: 'Assembleia Nacional', onde: 'Paris', familia: 'direitos', pede: 'liberdade, propriedade, segurança e resistência à opressão', frase: 'Os homens nascem e são livres e iguais em direitos.', url: WP + 'Declara%C3%A7%C3%A3o_dos_Direitos_do_Homem_e_do_Cidad%C3%A3o' },
    { ano: 1791, titulo: 'Declaração dos Direitos da Mulher e da Cidadã', quem: 'Olympe de Gouges', onde: 'Paris', familia: 'direitos', pede: 'que os direitos de 1789 valham também para as mulheres', frase: 'A mulher nasce livre e permanece igual ao homem em direitos.', url: W + 'Declaration_of_the_Rights_of_Woman_and_of_the_Female_Citizen' },
    { ano: 1792, titulo: 'Reivindicação dos Direitos da Mulher', quem: 'Mary Wollstonecraft', onde: 'Londres', familia: 'educacao', pede: 'educação igual para meninas e meninos', frase: '', url: W + 'A_Vindication_of_the_Rights_of_Woman' },
    { ano: 1848, titulo: 'Manifesto do Partido Comunista', quem: 'Karl Marx e Friedrich Engels', onde: 'Londres', familia: 'direitos', pede: 'o fim da exploração de uma classe pela outra', frase: 'Proletários de todos os países, uni-vos!', url: WP + 'Manifesto_Comunista' },
    { ano: 1848, titulo: 'Declaração de Sentimentos', quem: 'Elizabeth Cady Stanton e a Convenção de Seneca Falls', onde: 'Seneca Falls', familia: 'direitos', pede: 'o voto e a igualdade civil das mulheres', frase: 'Todos os homens e mulheres são criados iguais.', url: W + 'Declaration_of_Sentiments' },
    { ano: 1849, titulo: 'A Desobediência Civil', quem: 'Henry David Thoreau', onde: 'Concord', familia: 'direitos', pede: 'que a consciência valha mais que a lei injusta', frase: 'O melhor governo é o que governa menos.', url: W + 'Civil_Disobedience_(Thoreau)' },
    { ano: 1886, titulo: 'O Simbolismo', quem: 'Jean Moréas', onde: 'Le Figaro, Paris', familia: 'arte', pede: 'uma poesia que sugira em vez de descrever', frase: '', url: W + 'Symbolist_Manifesto' },
    { ano: 1909, titulo: 'Manifesto do Futurismo', quem: 'F. T. Marinetti', onde: 'Le Figaro, Paris', familia: 'arte', pede: 'a velocidade, a máquina e o fim dos museus', frase: 'Um automóvel que ruge é mais belo que a Vitória de Samotrácia.', url: W + 'Manifesto_of_Futurism' },
    { ano: 1912, titulo: 'Um Tapa na Cara do Gosto Público', quem: 'Burliuk, Khlebnikov, Kruchenykh e Maiakóvski', onde: 'Moscou', familia: 'arte', pede: 'uma língua nova para um tempo novo', frase: 'Atirar Púchkin, Dostoiévski, Tolstói do navio a vapor da modernidade.', url: W + 'A_Slap_in_the_Face_of_Public_Taste' },
    { ano: 1915, titulo: 'Do Cubismo e do Futurismo ao Suprematismo', quem: 'Kazimir Malevich', onde: 'Petrogrado', familia: 'arte', pede: 'a pintura sem objeto: o sentimento puro', frase: 'Eu me transformei no zero das formas.', url: W + 'Suprematism', marca: true },
    { ano: 1918, titulo: 'Manifesto Dada 1918', quem: 'Tristan Tzara', onde: 'Zurique', familia: 'arte', pede: 'a dúvida contra tudo, inclusive contra a arte', frase: 'Dada não significa nada.', url: W + 'Dada_Manifesto' },
    { ano: 1919, titulo: 'Manifesto da Bauhaus', quem: 'Walter Gropius', onde: 'Weimar', familia: 'arte', pede: 'arte, ofício e indústria juntos, numa escola', frase: 'O fim último de toda atividade plástica é a construção!', url: W + 'Bauhaus' },
    { ano: 1920, titulo: 'Manifesto Realista', quem: 'Naum Gabo e Antoine Pevsner', onde: 'Moscou', familia: 'arte', pede: 'uma escultura de espaço e tempo, não de massa', frase: '', url: W + 'Realistic_Manifesto' },
    { ano: 1924, titulo: 'Manifesto da Poesia Pau-Brasil', quem: 'Oswald de Andrade', onde: 'Correio da Manhã, Rio', familia: 'arte', br: true, pede: 'uma poesia de exportação, feita do Brasil de verdade', frase: 'A poesia existe nos fatos.', url: WP + 'Manifesto_da_Poesia_Pau-Brasil' },
    { ano: 1924, titulo: 'Manifesto do Surrealismo', quem: 'André Breton', onde: 'Paris', familia: 'arte', pede: 'o sonho e a realidade fundidos numa realidade maior', frase: '', url: W + 'Surrealist_Manifesto' },
    { ano: 1928, titulo: 'Manifesto Antropófago', quem: 'Oswald de Andrade', onde: 'Revista de Antropofagia, São Paulo', familia: 'arte', br: true, pede: 'devorar o que vem de fora e fazer disso coisa nossa', frase: 'Tupi, or not tupi, that is the question.', url: WP + 'Manifesto_Antrop%C3%B3fago' },
    { ano: 1932, titulo: 'Manifesto dos Pioneiros da Educação Nova', quem: 'Fernando de Azevedo, Anísio Teixeira, Cecília Meireles e outros', onde: 'Brasil', familia: 'educacao', br: true, pede: 'escola pública, laica, gratuita e para todos', frase: 'Na hierarquia dos problemas nacionais, nenhum sobreleva em importância e gravidade ao da educação.', url: WP + 'Manifesto_dos_Pioneiros_da_Educa%C3%A7%C3%A3o_Nova' },
    { ano: 1933, titulo: 'Carta de Atenas', quem: 'Le Corbusier e o CIAM', onde: 'a bordo, entre Marselha e Atenas', familia: 'educacao', pede: 'uma cidade para morar, trabalhar, circular e descansar', frase: '', url: W + 'Athens_Charter' },
    { ano: 1938, titulo: 'Por uma Arte Revolucionária Independente', quem: 'André Breton e Leon Trótski (assinado com Diego Rivera)', onde: 'Cidade do México', familia: 'arte', pede: 'a arte livre de qualquer partido ou Estado', frase: 'Toda licença em arte.', url: W + 'Manifesto_for_an_Independent_Revolutionary_Art' },
    { ano: 1948, titulo: 'Declaração Universal dos Direitos Humanos', quem: 'Assembleia Geral da ONU', onde: 'Paris', familia: 'direitos', pede: 'dignidade e direitos iguais para todos os seres humanos', frase: 'Todos os seres humanos nascem livres e iguais em dignidade e em direitos.', url: WP + 'Declara%C3%A7%C3%A3o_Universal_dos_Direitos_Humanos' },
    { ano: 1948, titulo: 'Refus Global', quem: 'Paul-Émile Borduas e os Automatistas', onde: 'Montreal', familia: 'arte', pede: 'a liberdade contra o medo e a tutela', frase: 'Abram espaço para a magia! Para o amor!', url: W + 'Refus_global' },
    { ano: 1955, titulo: 'Manifesto Russell–Einstein', quem: 'Bertrand Russell, Albert Einstein e outros nove cientistas', onde: 'Londres', familia: 'tecnica', pede: 'que a humanidade renuncie à guerra na era das bombas', frase: 'Lembrem-se da sua humanidade e esqueçam o resto.', url: W + 'Russell%E2%80%93Einstein_Manifesto' },
    { ano: 1955, titulo: 'Carta da Liberdade', quem: 'Congresso do Povo', onde: 'Kliptown, África do Sul', familia: 'direitos', pede: 'o fim do apartheid e um país de todos', frase: 'A África do Sul pertence a todos os que nela vivem.', url: W + 'Freedom_Charter' },
    { ano: 1958, titulo: 'Plano-Piloto para Poesia Concreta', quem: 'Augusto de Campos, Décio Pignatari e Haroldo de Campos', onde: 'São Paulo', familia: 'arte', br: true, pede: 'a palavra como objeto, no espaço da página', frase: '', url: WP + 'Poesia_concreta' },
    { ano: 1959, titulo: 'Manifesto Neoconcreto', quem: 'Ferreira Gullar, Lygia Clark, Lygia Pape e outros', onde: 'Jornal do Brasil, Rio', familia: 'arte', br: true, pede: 'a obra viva, que se completa com o corpo de quem participa', frase: '', url: WP + 'Neoconcretismo' },
    { ano: 1962, titulo: 'Declaração de Port Huron', quem: 'Students for a Democratic Society', onde: 'Port Huron', familia: 'direitos', pede: 'democracia participativa', frase: '', url: W + 'Port_Huron_Statement' },
    { ano: 1963, titulo: 'Carta da Prisão de Birmingham', quem: 'Martin Luther King Jr.', onde: 'Birmingham', familia: 'direitos', pede: 'a ação direta não violenta, agora', frase: 'A injustiça em qualquer lugar é uma ameaça à justiça em todo lugar.', url: W + 'Letter_from_Birmingham_Jail' },
    { ano: 1963, titulo: 'Manifesto Fluxus', quem: 'George Maciunas', onde: 'Nova York', familia: 'arte', pede: 'a arte como vida, para todos, sem mercado', frase: '', url: W + 'Fluxus' },
    { ano: 1965, titulo: 'Estética da Fome', quem: 'Glauber Rocha', onde: 'Gênova', familia: 'arte', br: true, pede: 'um cinema que mostre a fome em vez de escondê-la', frase: '', url: WP + 'Glauber_Rocha' },
    { ano: 1969, titulo: 'Manifesto pela Arte da Manutenção', quem: 'Mierle Laderman Ukeles', onde: 'Nova York', familia: 'terra', pede: 'que o cuidado diário seja reconhecido como obra', frase: 'Depois da revolução, quem vai recolher o lixo na segunda-feira de manhã?', url: W + 'Mierle_Laderman_Ukeles' },
    { ano: 1977, titulo: 'Declaração do Coletivo Combahee River', quem: 'Combahee River Collective', onde: 'Boston', familia: 'direitos', pede: 'a liberdade das mulheres negras como medida da liberdade de todos', frase: '', url: W + 'Combahee_River_Collective_Statement' },
    { ano: 1985, titulo: 'Manifesto GNU', quem: 'Richard Stallman', onde: 'Cambridge (EUA)', familia: 'tecnica', pede: 'software livre para todos', frase: 'Se eu gosto de um programa, devo compartilhá-lo com outras pessoas que gostam dele.', url: W + 'GNU_Manifesto' },
    { ano: 1985, titulo: 'Manifesto Ciborgue', quem: 'Donna Haraway', onde: 'Socialist Review', familia: 'tecnica', pede: 'romper as fronteiras entre humano, animal e máquina', frase: 'Prefiro ser uma ciborgue a uma deusa.', url: W + 'A_Cyborg_Manifesto' },
    { ano: 1989, titulo: 'Manifesto Slow Food', quem: 'Carlo Petrini e Folco Portinari', onde: 'Paris', familia: 'terra', pede: 'o direito ao prazer e ao tempo de comer bem', frase: '', url: W + 'Slow_Food' },
    { ano: 1992, titulo: 'Caranguejos com Cérebro', quem: 'Fred 04 e o Manguebeat', onde: 'Recife', familia: 'arte', br: true, pede: 'ligar a lama do mangue à rede mundial', frase: '', url: WP + 'Manguebeat' },
    { ano: 1993, titulo: 'Manifesto Cypherpunk', quem: 'Eric Hughes', onde: 'Califórnia', familia: 'tecnica', pede: 'privacidade como direito na era eletrônica', frase: 'A privacidade é necessária para uma sociedade aberta na era eletrônica.', url: 'https://www.activism.net/cypherpunk/manifesto.html' },
    { ano: 1996, titulo: 'Declaração de Independência do Ciberespaço', quem: 'John Perry Barlow', onde: 'Davos', familia: 'tecnica', pede: 'uma internet livre dos governos', frase: 'Eu venho do ciberespaço, a nova casa da mente.', url: 'https://www.eff.org/cyberspace-independence' },
    { ano: 1999, titulo: 'O Manifesto Cluetrain', quem: 'Levine, Locke, Searls e Weinberger', onde: 'internet', familia: 'tecnica', pede: 'que as empresas falem como gente', frase: 'Mercados são conversas.', url: W + 'The_Cluetrain_Manifesto' },
    { ano: 2000, titulo: 'A Carta da Terra', quem: 'iniciativa civil global', onde: 'Haia', familia: 'terra', pede: 'respeito e cuidado com a comunidade da vida', frase: 'Estamos num momento crítico da história da Terra, em que a humanidade deve escolher o seu futuro.', url: W + 'Earth_Charter' },
    { ano: 2001, titulo: 'Manifesto Ágil', quem: 'dezessete programadores', onde: 'Snowbird', familia: 'tecnica', pede: 'pessoas e software que funciona antes de processos e papéis', frase: 'Indivíduos e interações mais que processos e ferramentas.', url: 'https://agilemanifesto.org/' },
    { ano: 2008, titulo: 'Manifesto da Guerrilha pelo Acesso Aberto', quem: 'Aaron Swartz', onde: 'internet', familia: 'educacao', pede: 'o conhecimento científico livre para todos', frase: 'A informação é poder. Mas, como todo poder, há quem queira guardá-la para si.', url: W + 'Guerilla_Open_Access_Manifesto' },
    { ano: 2015, titulo: 'Laudato si’', quem: 'Papa Francisco', onde: 'Roma', familia: 'terra', pede: 'o cuidado da casa comum', frase: 'Tudo está interligado.', url: W + 'Laudato_si%27' },
    { ano: 2019, titulo: 'Software local-first', quem: 'Kleppmann, Wiggins, van Hardenberg e McGranaghan (Ink & Switch)', onde: 'internet', familia: 'tecnica', pede: 'que os seus dados morem no seu aparelho, e não no servidor de alguém', frase: 'Você é dono dos seus dados, apesar da nuvem.', url: 'https://www.inkandswitch.com/local-first/' },
    { ano: 2023, titulo: 'File over app', quem: 'Steph Ango', onde: 'internet', familia: 'tecnica', pede: 'arquivos que durem mais que os aplicativos', frase: 'Os arquivos que você cria são mais importantes que as ferramentas que você usa para criá-los.', url: 'https://stephango.com/file-over-app' },
    { ano: 2026, titulo: 'Manifesto do Portal Solar', quem: 'Vitor de Mantova', onde: 'Campinas', familia: 'educacao', br: true, pede: 'a verdade pura, o conhecimento no lugar certo e o amor máximo em cada momento', frase: 'A verdade pura é bem-vinda, e o que está em torno dela pode contemplá-la.', url: 'manifesto.html', nosso: true },
  ];

  var FAMILIAS = [['direitos', 'Direitos e política'], ['arte', 'Arte'], ['tecnica', 'Ciência e técnica'], ['educacao', 'Educação e cultura'], ['terra', 'A Terra e o cuidado']];

  /* A FILOSOFIA: os princípios (cada um com de onde vem) e as leituras */
  var PRINCIPIOS = [
    { id: 'arquivos', titulo: 'Arquivos antes de aplicativos', texto: 'Tudo o que você escreve, marca e guarda mora no seu caderno, em texto que qualquer programa lê. O Portal Solar só mostra e organiza: se ele sumir amanhã, nada se perde. É o que a comunidade local-first chama de "você é dono dos seus dados, apesar da nuvem".', de: 'Ink & Switch (2019); Steph Ango (2023)' },
    { id: 'ficha', titulo: 'Ficha, não perfil', texto: 'Uma pessoa é o que faz, o que lê, o que ama e quem a formou; não um número de seguidores. Por isso a rede do Portal Solar é feita de fichas e de elos com um porquê escrito: sem feed, sem curtidas, sem seguidores.', de: 'A Rede da Vida (no caderno)' },
    { id: 'convite', titulo: 'Convite, não prova', texto: 'Quem nunca teve acesso às sinfonias, aos livros e ao código não teve falta de capacidade: teve falta de oportunidade. Não corrija: ofereça. Cada página começa pela porta que já existe na vida da pessoa.', de: 'Convite à Cultura (no caderno); Paulo Freire, Pedagogia do Oprimido (1968)' },
    { id: 'lugar', titulo: 'O lugar certo e o formato visível', texto: 'Nenhum texto é grande senão apresentado no local correto, no formato definido e visível. O design aqui é uma forma de respeito: cada coisa no seu lugar, legível, sem truque para prender a atenção.', de: 'Solar (no caderno)' },
    { id: 'curadoria', titulo: 'Toda escolha assinada', texto: 'O que direciona a atenção de alguém tem nome, data, fontes e porquê. Contra marcas e falsidades: nada de algoritmo escondido, de patrocínio disfarçado ou de paywall no que é de todos.', de: 'O Manifesto do Portal Solar' },
    { id: 'chave', titulo: 'A conta é chave, não cofre', texto: 'Entrar com senha (ou com uma rede social, se você quiser) serve para abrir a sua casa de outro aparelho, nunca para levar os seus dados para longe. A senha é guardada como um resumo que não se desfaz (scrypt), no seu computador, e não no caderno.', de: 'esta página e a Conta' },
    { id: 'presente', titulo: 'O presente e o amor máximo', texto: 'Esteja no presente. Não julgue: contemple. Não reclame: agradeça. Na incerteza, escolha o amor máximo. Entrega o teu trabalho e descansa.', de: 'If There is Art There is Life (no caderno)' },
  ];
  var LEITURAS = [
    ['Vannevar Bush', 'As We May Think', 1945, 'a máquina que guarda e liga tudo o que lemos (o memex)'],
    ['Douglas Engelbart', 'Augmenting Human Intellect', 1962, 'o computador para ampliar o pensamento, não para substituí-lo'],
    ['Paulo Freire', 'Pedagogia do Oprimido', 1968, 'ninguém educa ninguém; as pessoas se educam juntas'],
    ['Ivan Illich', 'A convivencialidade (Tools for Conviviality)', 1973, 'ferramentas que servem às pessoas, e não o contrário'],
    ['Ted Nelson', 'Computer Lib / Dream Machines', 1974, 'o hipertexto e o direito de todos ao computador'],
    ['Jaron Lanier', 'Você não é um aplicativo (You Are Not a Gadget)', 2010, 'contra a pessoa reduzida a perfil'],
    ['Shoshana Zuboff', 'A era do capitalismo de vigilância', 2019, 'como a atenção virou matéria-prima'],
    ['Jenny Odell', 'Resista: não faça nada (How to Do Nothing)', 2019, 'recuperar a atenção para o lugar onde se vive'],
    ['Martin Kleppmann e outros', 'Local-first software', 2019, 'os sete ideais: rápido, em vários aparelhos, sem rede, colaborativo, duradouro, privado e sob o seu controle'],
    ['Steph Ango', 'File over app', 2023, 'arquivos que você controla, em formatos fáceis de ler'],
  ];

  var api = { rascunho: RASCUNHO, fontes: FONTES, manifestos: MANIFESTOS, familias: FAMILIAS, principios: PRINCIPIOS, leituras: LEITURAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.MANIFESTO = api;
})(typeof window !== 'undefined' ? window : globalThis);
