/* ============================================================
   PLANETA — medidas pelo planeta e hábitos conscientes em cada aspecto da vida
   (08/out/2026, PERFIL.md item 72). Aparece no Atlas, a casa de entrada.
   Cada fato traz a fonte; os números foram conferidos na pesquisa daquele dia
   (ver SISTEMA.md e PERFIL.md). Os hábitos marcados ficam neste navegador
   (localStorage "planeta-habitos-v1"), como o Meu dia.
   Para mudar um texto, mude aqui: nada mais depende da redação.
   ============================================================ */
window.PLANETA = {
  abertura: 'Mudar o jeito de comer, de se mover e de consumir pode cortar de 40% a 70% das emissões até 2050, e o bem-estar ganha onze vezes mais do que perde. Metade disso depende de cada um; a outra metade, de cobrar quem decide.',
  aberturaFonte: ['IPCC, 6º Relatório, Grupo III, cap. 5 (2022)', 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/'],

  /* as cinco que mais pesam (IPCC cap. 5; Project Drawdown) */
  cinco: [
    ['Comer mais plantas', 'e bem menos carne, sobretudo de boi'],
    ['Não desperdiçar comida', 'comprar o que vai comer, comer as sobras'],
    ['Andar, pedalar, ir de ônibus', 'o carro por último'],
    ['Voar menos', 'uma viagem de avião a menos pesa muito'],
    ['Usar mais e trocar menos', 'roupas, aparelhos, móveis: consertar antes'],
  ],

  aspectos: [
    {
      id: 'comida', nome: 'Comida', cor: 'bio',
      porque: 'É onde a escolha de cada dia mais pesa, e no Brasil pesa ainda mais.',
      habitos: [
        ['plantas', 'Feijão, arroz, legumes e frutas como base do prato'],
        ['boi', 'Carne de boi rara, não diária'],
        ['sobras', 'Planejar a feira e comer as sobras antes de cozinhar de novo'],
        ['feira', 'Comprar da estação e de quem planta perto'],
        ['agua-torneira', 'Água da torneira filtrada em vez de garrafinha'],
      ],
      fatos: [
        ['Carne e laticínios dão 18% das calorias do mundo, mas ocupam cerca de 83% das terras agrícolas e emitem cerca de 60% dos gases da agricultura.', 'Poore & Nemecek, Science (2018)', 'https://www.science.org/doi/10.1126/science.aaq0216'],
        ['No Brasil, desmatamento e agropecuária somaram 74% das emissões brutas em 2023 (46% e 28%).', 'SEEG, Observatório do Clima (2024)', 'https://seeg.eco.br'],
        ['Em 2022, 1,05 bilhão de toneladas de comida foram para o lixo, quase um quinto do que chega ao consumidor; 60% disso nas casas.', 'PNUMA, Food Waste Index (2024)', 'https://www.unep.org/resources/publication/food-waste-index-report-2024'],
      ],
    },
    {
      id: 'agua', nome: 'Água', cor: 'fis',
      porque: 'Água tratada custa energia e rio. Cada litro poupado fica no rio.',
      habitos: [
        ['banho', 'Banho de até 5 minutos, chuveiro fechado ao ensaboar'],
        ['torneira', 'Torneira fechada ao escovar os dentes e lavar a louça'],
        ['vazamento', 'Consertar vazamento no mesmo dia'],
        ['reuso', 'Reusar a água da máquina de lavar no chão e no quintal'],
      ],
      fatos: [
        ['Cada brasileiro atendido pela rede consome em média cerca de 152 litros de água por dia.', 'SNIS (ano-base 2020), via Agência Brasil', 'https://agenciabrasil.ebc.com.br/geral/noticia/2022-06/termina-hoje-prazo-para-municipios-informarem-dados-sobre-saneamento'],
      ],
    },
    {
      id: 'energia', nome: 'Energia em casa', cor: 'lin',
      porque: 'A luz do Brasil já é quase toda renovável; poupar pesa mais nos rios e na conta do que no clima, mas ainda pesa.',
      habitos: [
        ['luz-dia', 'Luz do dia primeiro; apagar ao sair do cômodo'],
        ['tomada', 'Tirar da tomada o que fica em espera'],
        ['ar', 'Ventilador antes do ar-condicionado; ar em 24–25 °C'],
        ['eficiente', 'Ao trocar um aparelho, escolher o de selo A'],
      ],
      fatos: [
        ['Em 2024, 88,2% da eletricidade do Brasil veio de fontes renováveis.', 'Balanço Energético Nacional 2025 (EPE/MME)', 'https://eixos.com.br/energias-renovaveis/matriz-eletrica-fechou-2024-com-88-de-participacao-renovavel-mostra-balanco-da-epe/'],
        ['Ajustar o termostato e usar menos os aparelhos estão entre as mudanças de maior potencial nas casas.', 'IPCC, 6º Relatório, Grupo III, cap. 5', 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/'],
      ],
    },
    {
      id: 'mover', nome: 'Ir e vir', cor: 'geo',
      porque: 'Andar e pedalar fazem bem ao corpo e à cidade; o carro e o avião pesam mais.',
      habitos: [
        ['pe', 'Até 2 km, a pé ou de bicicleta'],
        ['onibus', 'Transporte coletivo para o dia a dia'],
        ['carona', 'Carro dividido quando não tem jeito'],
        ['aviao', 'Uma viagem de avião a menos por ano; trem ou ônibus quando der'],
      ],
      fatos: [
        ['Voar menos e trocar o carro pelo transporte coletivo estão entre as opções de maior potencial apontadas pelo IPCC.', 'IPCC, 6º Relatório, Grupo III, cap. 5', 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/'],
      ],
    },
    {
      id: 'roupa', nome: 'Roupas', cor: 'fil',
      porque: 'A roupa mais limpa é a que já está no armário.',
      habitos: [
        ['usar', 'Usar cada peça muitas vezes antes de trocar'],
        ['consertar', 'Costurar, remendar, levar à costureira'],
        ['brecho', 'Brechó e troca antes de loja'],
        ['lavar', 'Lavar com a máquina cheia e secar no varal'],
      ],
      fatos: [
        ['A cada segundo, o equivalente a um caminhão de lixo de tecidos vai para o aterro ou é queimado; menos de 1% das roupas vira roupa nova.', 'Fundação Ellen MacArthur (2017)', 'https://www.circularonline.co.uk/news/one-truck-textiles-landfilled-burned-every-second-says-new-macarthur-report/'],
      ],
    },
    {
      id: 'coisas', nome: 'Coisas e aparelhos', cor: 'mat',
      porque: 'A maior parcela da pegada de um celular vem de fabricá-lo: usar por mais anos é o que mais conta.',
      habitos: [
        ['anos', 'Usar o celular e o computador por muitos anos'],
        ['consertar-ap', 'Consertar e trocar a bateria antes de trocar o aparelho'],
        ['emprestar', 'Pedir emprestado o que se usa pouco (furadeira, escada, livro)'],
        ['coleta', 'Levar pilhas e eletrônicos a um ponto de coleta'],
      ],
      fatos: [
        ['O mundo gerou 62 milhões de toneladas de lixo eletrônico em 2022; só 22,3% foram coletados e reciclados de forma documentada.', 'Global E-waste Monitor 2024 (ONU: UNITAR e UIT)', 'https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx'],
      ],
    },
    {
      id: 'lixo', nome: 'Lixo e plástico', cor: 'qui',
      porque: 'Reciclar ajuda, mas recusar o descartável ajuda muito mais.',
      habitos: [
        ['sacola', 'Sacola, garrafa e pote próprios na mochila'],
        ['recusar', 'Recusar canudo, talher e copo descartáveis'],
        ['separar', 'Separar seco e orgânico; o seco limpo para a coleta'],
        ['compostar', 'Compostar o orgânico, nem que seja num balde'],
      ],
      fatos: [
        ['Só 9% do lixo plástico do mundo é de fato reciclado; 22% vaza para a natureza ou é queimado a céu aberto.', 'OCDE, Global Plastics Outlook (2022)', 'https://www.circularonline.co.uk/news/9-of-global-plastic-waste-is-recycled-while-22-is-mismanaged-oecd/'],
      ],
    },
    {
      id: 'corpo', nome: 'Corpo', cor: 'his',
      porque: 'Um corpo cuidado gasta menos remédio e mais tempo com o que importa.',
      habitos: [
        ['mover-se', '150 a 300 minutos de atividade por semana'],
        ['forca', 'Força duas vezes por semana (calistenia, yoga)'],
        ['dormir', 'Sete horas de sono ou mais, no mesmo horário'],
        ['rotina', 'A rotina da manhã, 15 minutos, todos os dias'],
      ],
      fatos: [
        ['A OMS recomenda a adultos 150–300 minutos de atividade moderada por semana (ou 75–150 de vigorosa), e exercícios de força.', 'OMS, diretrizes de 2020', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7719906/'],
        ['Adultos precisam de 7 horas de sono ou mais por noite, regularmente.', 'AASM e Sleep Research Society (2015)', 'https://aasm.org/seven-or-more-hours-of-sleep-per-night-a-health-necessity-for-adults/'],
      ],
    },
    {
      id: 'mente', nome: 'Mente e atenção', cor: 'soc',
      porque: 'Atenção é o que se tem de mais precioso: é com ela que se aprende e se ama.',
      habitos: [
        ['uma-coisa', 'Uma coisa de cada vez, com o celular longe'],
        ['tela-quarto', 'Telas fora do quarto na hora de dormir'],
        ['ler', 'Ler um pouco todo dia, sem pressa'],
        ['respirar', 'Parar para respirar fundo três vezes antes de responder'],
      ],
      fatos: [],
    },
    {
      id: 'dinheiro', nome: 'Dinheiro', cor: 'lin',
      porque: 'Cada compra é um voto no tipo de mundo que continua existindo.',
      habitos: [
        ['esperar', 'Esperar uma semana antes de comprar o que não é essencial'],
        ['perto', 'Comprar de quem produz perto e trata bem quem trabalha'],
        ['durar', 'Pagar um pouco mais pelo que dura muito mais'],
        ['onde', 'Saber onde o seu dinheiro está guardado e o que ele financia'],
      ],
      fatos: [],
    },
    {
      id: 'gente', nome: 'Gente e lugar', cor: 'bio',
      porque: 'Ninguém muda sozinho: a vizinhança é a primeira rede.',
      habitos: [
        ['vizinhos', 'Conhecer os vizinhos pelo nome'],
        ['partilhar', 'Emprestar e pedir livros, ferramentas e receitas'],
        ['arvore', 'Cuidar de uma árvore, uma horta ou uma praça perto de casa'],
        ['ensinar', 'Ensinar o que você sabe a alguém, de graça'],
      ],
      fatos: [],
    },
    {
      id: 'voz', nome: 'Voz e voto', cor: 'his',
      porque: 'Ciclovia, ônibus bom, saneamento e floresta em pé não se compram no mercado: se cobram.',
      habitos: [
        ['votar', 'Votar olhando o que cada um propõe para o clima e a cidade'],
        ['cobrar', 'Cobrar da prefeitura ônibus, ciclovia e coleta seletiva'],
        ['conversar', 'Conversar sobre isso em casa, sem sermão'],
        ['assinar', 'Apoiar quem defende floresta, rio e quem mora neles'],
      ],
      fatos: [
        ['Os 40–70% de corte possíveis pelo lado da demanda dependem de políticas, infraestrutura e tecnologia que tornem as mudanças possíveis.', 'IPCC, 6º Relatório, Grupo III, cap. 5', 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-5/'],
      ],
    },
  ],
};
