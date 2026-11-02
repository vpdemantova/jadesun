# 137 · Os insetos e as metamorfoses, na Vida
#vida #atlas #design #jogo #teia #espera-voce

> **Espera você:** dois cliques em `jadesun/publicar-montagne.bat` e aprovar o login da Vercel no navegador

## O pedido

> *"alem de todas as especies, falta muito, mas ja temos uma boa base, precisamos de todos os insetos, as metamorfoses!!! - os processos, enfim, tudo"* (31/out/2026, a PS-82)
>
> *"faca uma integracao entre o jogo e a plataforma"* (31/out/2026, a PS-83)
>
> *"siga implementando e melhorando! publique sempre!"* (02/nov/2026)

## O que eu fiz

- **Onde:** dentro da Vida (Atlas › A vida). Ela já tinha a árvore do Catalogue of Life até as ordens, com a ficha de cada uma ao vivo, com as imagens. Então os insetos cresceram ali, em vez de virar fichas soltas.
- **O traço Crescimento** (em "Filtrar por traço"): Sem metamorfose, Metamorfose incompleta, Metamorfose completa e Larva na água.
  - Cada um acende os seus grupos na árvore. As 27 ordens vivas de insetos estão todas classificadas, nenhuma de fora e nenhuma repetida: 2 sem metamorfose, 14 com a incompleta e 11 com a completa. A Larva na água acende os sapos, as rãs e as salamandras.
  - As contas, do catálogo: a completa soma 830.019 espécies, a incompleta 181.791 e a sem metamorfose 911.
  - A ficha de cada ordem agora diz como ela cresce.
- **A aba "Os ciclos de vida"** (em As formas), sete desenhos feitos no código, no traço da página:
  - **Sem metamorfose:** a traça só cresce, e a volta pequena mostra que ela continua trocando de casca depois de adulta.
  - **Metamorfose incompleta:** o gafanhoto: ovo, ninfa, ninfa com os brotos das asas, adulto.
  - **Metamorfose completa:** ovos, lagarta, crisálida, borboleta.
  - **A muda depois das asas:** a efêmera: a ninfa na água, a subimago de asas foscas, o adulto.
  - **Do girino à rã:** as ovas, o girino, o girino com patas, a rã jovem com o toco da cauda, a rã.
  - **Por dentro:** os discos imaginais (a larva com os discos ligados às partes da mosca que eles formam) e "Quem manda mudar" (o hormônio juvenil e os pulsos de ecdisona).
  - As cinco primeiras têm "Ver na árvore": acende o traço e abre os insetos (ou os anfíbios). O das efêmeras abre a ficha delas.
  - Na tela grande, os ciclos são maiores que as outras formas; no celular, um por linha.
- **As origens:** duas datas novas, há cerca de 300 milhões de anos (quase todos os insetos com asas já crescem em ninfa e adulto) e há cerca de 280 milhões (os primeiros fósseis de metamorfose completa).
- **As fontes:** cada linha cita a sua, lida no texto em 02/nov: OpenStax Biology 2e (28.6, os artrópodes; 29.3, os anfíbios) e os artigos da Wikipedia Ametabolism, Hemimetabolism, Holometabolism, Imaginal disc e Mayfly. Duas frases foram acertadas para dizer só o que a fonte diz: da traça sai um filhote com a forma do adulto, não "um adulto pequeno"; o girino "muitas vezes" come plantas, não "quase sempre".
- **O jogo e o Portal (PS-83), o lado do Portal:** o `vercel-montar.mjs` deixa o jogo perguntar pelo `api/teia.json` (a permissão vale só para esse arquivo). Assim, o "Ver na Teia" do Hall da Fama acende sozinho quando a Teia estiver no ar e some se o site cair. O lado do jogo ficou para a janela do jogo, que estava trabalhando nele hoje; o pedido pronto está na PS-83.

## Conferido

- **Clique e toque de verdade, em 1440 e 390 px:**
  - os 4 botões do traço e a aba com os 7 desenhos;
  - o filtro "Por dentro";
  - o "Ver na árvore": 11 ordens acesas, as outras apagadas, e a página sobe até a árvore;
  - o "Ver as efêmeras", que abre a ficha;
  - "Sem metamorfose", que leva às duas ordens.
- **Sem defeito:** nada passa da tela, e o console fica sem erro.
- **Auditoria de cor:** zero problemas nas cinco cores e nos dois estilos, com a página como ela abre e também com a aba dos ciclos aberta e o traço aceso. A auditoria passa a incluir a Vida.

## Os arquivos

- `vida-dados.js`: as fontes, os traços, a aba dos ciclos e as origens.
- `vida.js`: os desenhos e o botão que leva à árvore.
- `vida.css`, `testes/cores-auditoria.mjs` (com a Vida) e `vercel-montar.mjs` (PS-83).
- O que havia antes está em `dados/antes-ps82/` e `dados/antes-ps83/`.

## O que vem depois (a PS-82 continua)

- A Teia da vida: as espécies na mesma teia das pessoas.
- As fichas dos bichos do jogo, que ainda não existem em `g Species`: capivara, tamanduá-bandeira, tucano, arara-vermelha e arara-azul.
- Mais processos: a alternância de gerações das plantas (o musgo, a samambaia), o pólipo e a medusa, as larvas do mar.

## O que espera você

- **Publicar:** dois cliques em `jadesun/publicar-montagne.bat`. Ele exporta, pede o login da Vercel no navegador (você aprova) e publica. Vai junto tudo o que já esperava (a Teia, Os índices, as Ferramentas, as Boas-vindas, o Distribuir, as edições do Início) e a Vida com os ciclos.
- **O domínio (PS-35):** o montagnedejade.org vence em 14/nov. A renovação precisa da conta da Squarespace, que só você recupera.

---
[[0 Índice|Índice]] · ← [[136 — O índice dos índices|136]]
