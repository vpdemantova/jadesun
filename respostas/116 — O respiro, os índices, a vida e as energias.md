# 116 · O respiro, os dois índices, a vida e as energias
#pedido-grande #design #respiro #navegacao #indice #arrumar #atlas #vida #biologia #energia #fisica #fontes #publicacao

**O pedido de 22/out/2026:** "esta quase perfeita a interface provisoria, precisamos arrumar mais os espaços e cada lettering e algumas que ficam muito proximas das outras e mais importante! dar muito respiro e amplitude pra cada seção, dividir na tela e ter bastante espaço para se respirar, e sempre acompanhar o indice de cada pagina e do todo! de mais atencao a animacao de entrar no menu do quadrado e o mapa tambem pode ser mais claro e mais bem diagramado, sempre com respiro e qualidade / o arrumar fica dentro de ajustes - tambem aprimorada..! / quero o atlas mais parecido com um atlas digital, todas as especies de animais, todos os reinos, todas as energias, todas as plantas, as formacoes delas, filtros de cada categoria e parte, divisoes, formacoes, origens, geometrias, tipos de folha, galhos, tipo de penugens, etc!"

## 1. O respiro (no ar, em 32 páginas)

- **Entre as seções:** um vão grande e igual (de 96 a 160 px, conforme a tela) e um fio de tinta que abre cada seção. Os blocos de dentro ficam a 44–72 px uns dos outros.
- **As letras:** os títulos de seção num só tamanho, em Archivo 800. O título do Almanaque, em serifa fina, vencia por força de seletor o que cada página pedia, e por isso os tamanhos variavam de página para página. O rótulo, o título e a linha-fina ganharam ar entre si (antes ficavam a 0–16 px uns dos outros). As etiquetas ficaram na voz do rótulo, e as grades de cartões e as fileiras de chips ganharam vãos.
- Tudo num arquivo só, `respiro.css`, carregado por último. Para desfazer, basta tirar a linha dele de uma página.

## 2. Os dois índices que acompanham

- Nas telas de **1360 px ou mais** há um índice em cada margem.
  - À esquerda, **O todo:** as portas e, na porta em que se está, as páginas dela.
  - À direita, **Nesta página:** os tópicos. O atual acompanha a rolagem, com "3 de 9" e uma linha do quanto já se leu.
- O miolo fica entre os dois índices, e a barra de baixo descansa.
- Abaixo de 1360 px (tablet e celular), a barra de baixo de sempre continua.

## 3. O Quadrado e o mapa

- **A entrada:** um clique no Quadrado e ele se abre até cobrir a tela, num recorte de 0,44 s. Depois o quadrado, o título e o fio da busca se compõem, e as portas chegam uma a uma.
  - Antes, a tela ficava meio segundo parada, esperando o desenho do fundo, e o conteúdo só aparecia perto de 1,2 s.
- **O mapa:**
  - duas fileiras, O mundo e Você;
  - as portas lado a lado, na ordem da barra;
  - a pergunta de cada porta embaixo do nome;
  - a página em que se está, marcada;
  - monocromático, com mais espaço.

## 4. O Arrumar, dentro de Ajustes

- O Arrumar saiu da barra de cima. Agora fica em **Ajustes › Arrumar esta página**: a lista das seções, com mostrar ou esconder e subir ou descer. A mudança vale na hora e fica guardada por página, no aparelho.
- Vale em toda página que tem seções (antes, só em quatro).
- Cada grupo se reordena no próprio lugar. Antes, reordenar o Início quebrava a página. O modo de arrastar continua.

## 5. A vida (Atlas › A vida, no ar)

O atlas digital dos seres vivos.

- **A árvore inteira, dos domínios às ordens**, do Catalogue of Life (edição de 14/out/2026, CC BY 4.0).
  - O tamanho: 2.472 grupos, entre eles 24 reinos, 146 filos, 465 classes e 1.833 ordens.
  - As espécies vivas já descritas são 2.104.203; com as extintas, 2.276.639.
  - Nomes em português, imagens (1.071, cada uma com autor e licença) e artigos da Wikipédia vêm do Wikidata e do Commons.
- **As lentes:** lista (com a parte de cada grupo no total), grade (as imagens), mapa (a área de cada retângulo é o número de espécies) e corrido. O grupo aberto fica no endereço, para mandar a alguém.
- **A ficha de cada grupo:** o caminho, os números, os traços e a origem. Nas ordens, há também **Por dentro**: famílias, gêneros e espécies vivas, abertos um nível de cada vez, ao vivo do catálogo, com as fotos.
- **A busca:** pelo nome científico (no catálogo) e pelo popular (onça-pintada, ipê-amarelo, no Wikidata).
- **Os filtros:** 21 traços, como simetria, esqueleto, cobertura do corpo, temperatura e sementes. Os grupos que têm o traço acendem, e os ramos que levam até eles também.
- **As formas, desenhadas aqui a partir da definição:**
  - folhas (forma, margem, composição, nervuras, disposição no galho);
  - galhos e as formas de vida de Raunkiær;
  - penas (os tipos e as partes);
  - corpos e simetrias;
  - geometrias: a espiral de 137,5°, a samambaia de Barnsley e o favo.
- **As origens:** 22 marcos, da primeira vida às gramíneas, numa régua de tempo logarítmica.
- **25 fontes** (OpenStax Biology 2e e Wikipedia), conferidas no texto.
- **Sem internet:** fica tudo, menos as espécies ao vivo e as imagens.
- **Para atualizar a árvore:** rode `node vida-gerar.mjs --baixar`, que gera `vida-arvore.js` de novo. Esse arquivo não se edita à mão.

## 6. As energias (Atlas › As energias, no ar)

- **No alto, cinco números, cada um com a fonte:**
  - 4 milhões de toneladas de matéria viram energia dentro do Sol a cada segundo;
  - 40% da energia do carvão vira eletricidade numa usina;
  - a luz guardada no carvão e no petróleo tem de 350 a 200 milhões de anos;
  - o urânio-235 é 0,72% do urânio natural;
  - 20% do calor de dentro da Terra sobrou da formação do planeta.
- **A lei, em quatro frases:**
  - a energia total não muda, só muda de forma;
  - a maior parte da energia da Terra veio do Sol;
  - a massa é energia;
  - eficiência é a parte que sobra útil.
- **As oito formas:** cinética, potencial gravitacional, potencial elástica, química, térmica, elétrica, radiante e nuclear.
  - Cada uma tem um desenho, cujo traço se desenha quando o cartão chega, a fórmula (quando o livro dá uma) e um exemplo tirado do próprio livro.
  - "No que vira" leva às passagens daquela forma.
- **Como uma vira a outra:** uma usina a carvão de ponta a ponta (química → térmica → cinética → elétrica) e 13 passagens descritas nas fontes, com filtro por forma.
- **De onde vem:** as dez fontes de energia, no caminho da origem até nós.
  - Do Sol: a luz, o vento e as ondas, a água dos rios, a biomassa e, soterrada por milhões de anos, o carvão, o petróleo e o gás.
  - Da Lua: as marés.
  - De dentro da Terra: o calor geotérmico.
  - Dos átomos: a fissão e a fusão.
  - O filtro separa renováveis, não renováveis e em teste ou em desenvolvimento.
  - No fim, a frase que junta tudo: quase toda energia, no fundo, vem dos átomos, e as marés são a exceção.
- **Os números de agora:** os de consumo mudam todo ano e por isso não ficam na página. Ficam três links abertos que se atualizam sozinhos: Our World in Data, Ember e o Balanço Energético Nacional da EPE.
- **18 fontes** (OpenStax, de física, química, astronomia e biologia, e Wikipedia). Cada frase foi conferida no texto da fonte em 22/out.
  - "Renovável" só aparece quando a fonte diz.
  - A fusão e as ondas ficaram sem esse selo; a fissão comum leva "não renovável", como diz a fonte.
  - Ficaram de fora os números de consumo do livro de física (de 2006) e a frase de que as estrelas fizeram "todos" os elementos mais leves que o níquel (o texto da fonte conta também o Big Bang).

## 7. Conferido

- Telas de 1440, 1100 e 390 px; cores preto e branco; estilos Almanaque e Casa; o site exportado, aberto como estático, antes de publicar.
- A auditoria de cores passa nas duas páginas novas, nas cinco cores e nos dois estilos. A única falha conhecida no site é a etiqueta antiga "você · Campinas" do mapa da Terra, que já existia.

## 8. A publicação

- **Commits no GitHub:**
  - `e0a475b`: o respiro, os índices, o Índice e o Arrumar;
  - `a38a38f`: a vida;
  - `05888b6`: as energias;
  - o commit deste registro.
- **No ar:** publicação `dpl_GfsBiSSx5YARMaBHLSxMvKKZ6ojp` em **montagnedejade.org** (22/out, 15:17).
- **Endereços:** montagnedejade.org/vida.html · montagnedejade.org/energias.html
- **Para voltar:** Vercel → portal-solar → Deployments → a publicação de 21/out, 21:10 → Promote.

## Onde está

- **Novos:**
  - `respiro.css`;
  - `vida-gerar.mjs`, `vida-arvore.js` (gerado), `vida-dados.js`, `vida.js`, `vida.css`, `vida.html`;
  - `energias-dados.js`, `energias.js`, `energias.css`, `energias.html`.
- **Mudados:**
  - `perfil.js` (os dois índices, o Arrumar em Ajustes);
  - `indice.js` (a entrada, o mapa) e `casca.css` (o desenho do Índice);
  - `arrumar.js` (refeito);
  - `atlas.js` (o título de "A Terra agora", a única seção que estava fora do índice da página);
  - as 32 páginas `.html` (o `respiro.css`);
  - `exportar.mjs`, `mapa-dados.js` (as duas páginas novas na porta Atlas);
  - `estrutura/dados.mjs`, `ESTRUTURA.md` e `estrutura/figma/` (as páginas novas, os dois índices, o respiro e o Arrumar);
  - `TAREFAS.md` (PS-52 a PS-56).
- **As cópias de antes** estão em `dados/versao-2026-10-22-antes-do-respiro/`.

---
[[0 Índice|Índice]] · ← [[115 — Todas as áreas, a Luz, o poema e o acabamento|115]] · [[117 — A gramática, a volta, o que abre e os créditos|117]] →
