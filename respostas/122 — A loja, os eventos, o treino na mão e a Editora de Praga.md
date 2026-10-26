# 122 · A loja, os eventos, o treino na mão e a Editora de Praga
#cubos #loja #negocio #eventos #comunidade #campinas #treino #cronometro #cadernos #editora #publicacao

**O pedido de 26/out/2026:**

> *"vamos abrir a loja, me diga aonde comprar a bom preço, coloque eventos também, online e presencial em Campinas, Barão Geraldo e em Campinas em um lugar legal em qualquer região, com convidados, e tudo mais, no treinar coloque um cronômetro pra pessoa que tiver o cubo pessoalmente, esses dois modos! vamos estruturar esse negócio de vendas e comunidade! podemos até fazer apostilas e vender cópias, mas nada apostilado, vou também montar uma editora! talvez se chame Editora de Praga! Falando que livros alienam e ensinam ao mesmo tempo, que a leitura da realidade é a maior, mas os livros que fazem a gente ler ela melhor, um paradoxo engraçado.. enfim.. preciso subir meus negócios todos!"*

## 1. O treino tem dois jeitos

- **Na tela:** o cubo da tela, para quem não tem um à mão (o de antes).
- **Na mão:** para quem tem o cubo de verdade. A tela mostra o embaralhamento e o cubo já embaralhado, para conferir. **Segurar o espaço (ou o dedo na tela) até o tempo ficar verde; soltar começa; qualquer tecla (ou toque) para.** É o jeito do Stackmat e do csTimer.
- **A inspeção de 15 segundos da WCA**, quem quiser: o aviso aos 8 e aos 12, +2 entre 15 e 17, DNF depois. Cada tempo pode virar +2 ou DNF, ou ser apagado.
- **Os casos da OLL e da PLL na mão:** o site dá o texto para montar o caso no cubo de verdade (o algoritmo ao contrário, com a de cima girada ao acaso).
- **O desafio da semana:** cinco embaralhamentos iguais para todo mundo, trocados toda segunda-feira, uma vez só. Desistir no meio vale DNF. No fim, o botão "Copiar o resultado" gera a linha para mandar no grupo. Funciona sem servidor: os embaralhamentos saem de uma semente (o ano, a semana, o quebra-cabeça e a vez), iguais em qualquer navegador.
- **Conferido:** no Chrome com a placa de vídeo do Mac (segurar, soltar, parar, a inspeção, o +2, o desafio até o fim, o dedo no celular) e no endereço no ar. `npm run verificar` monta cada um dos 78 casos pelo texto ao contrário, nas quatro posições da camada de cima, e confere que o algoritmo resolve.

## 2. Os eventos

**Uma página nova, `eventos`, e a porta "Eventos" no menu.**
- **Online:** o desafio da semana (no ar), a aula ao vivo e a conversa com quem faz (em preparação).
- **Em Barão Geraldo e em Campinas (em preparação, com os lugares possíveis e o porquê de cada um):**
  - **Os sábados de Barão:** um sábado por mês. Lugares: o Centro Cultural Casarão do Barão, a Unicamp no IMECC (a casa do UNICAMP Cube) ou uma mesa na Feira de Barão.
  - **O Grande Encontro de Campinas:** um sábado por semestre, com convidados, a exposição dos 20, um mosaico de todo mundo e um torneio aberto. Lugares: o Museu Dinâmico de Ciências e o Planetário, na Lagoa do Taquaral, ou a Biblioteca Pública Municipal, que já recebeu duas competições oficiais (as CubeBook de 2024).
  - **As oficinas:** escolas e bibliotecas, sob encomenda.
- **As competições oficiais, ao vivo da WCA,** com a distância de Campinas. As próximas perto: Jaú (14/nov), Santos (6/dez), São Paulo (13/dez) e, em 2/jan/2027, **a primeira com o FTO**, em São Bernardo do Campo.
- **Campinas já tem uma cena:** o UNICAMP Cube aconteceu há dois dias (24/out/2026), no IMECC. Quem organiza as competições daqui é o primeiro grupo para conversar, e os primeiros convidados (os nomes estão no `NEGOCIO.md`, vindos da WCA). Nenhum nome vai para o site antes de a pessoa aceitar.

## 3. A loja

A página agora diz **como vai ser**: testar antes, nos encontros; encomendar (sem estoque parado); só cubos com o selo do Inmetro, de distribuidores no Brasil, com nota. E ganhou uma quarta prateleira: **os cadernos**.

**Onde comprar a bom preço, em três degraus:**
1. **Agora: distribuidores no Brasil, com nota e selo.** A El King diz ser a distribuidora oficial da MoYu no Brasil, com todos os cubos certificados pelo Inmetro (pede CNPJ). O Atacado Cubos, da Oncube, vende para lojas (cadastro no site). Os preços só aparecem depois do cadastro.
2. **Para testar modelos: as lojas oficiais das marcas no AliExpress, como pessoa física.** Desde maio de 2026, compras de até US$ 50 nas lojas do Remessa Conforme pagam só o ICMS. Não serve para revender.
3. **Quando o volume pagar: importar direto** das fábricas ou de atacadistas de fora (a Cuboss, na Suécia, pede € 350 de pedido mínimo). Aí entram CNPJ importador, impostos cheios, despachante e a certificação do Inmetro de cada modelo.

**O preço de referência:** o MoYu RS3M V5, o 3×3 magnético mais vendido nas lojas que pesquisei, sai de R$ 64,50 a R$ 89,90; a versão Maglev, de R$ 132,90 a R$ 185.

## 4. A estrutura do negócio

Está em `~/www/cubos/NEGOCIO.md` (fora do site público). Em resumo:
- **A roda:** o site traz gente → a comunidade (o grupo, os encontros) → a loja (quem vem, testa e compra) → os cadernos (quem compra quer aprender) → de volta ao site.
- **Três fontes de dinheiro:** os cubos, as oficinas (a escola que faz a oficina compra os cubos da turma) e os cadernos. A comunidade é o motor das três.
- **Três regras:** encomenda paga antes da compra (nada de estoque antes de vender); o MEI na primeira venda (os distribuidores pedem CNPJ); três vezes o custo nos cadernos e nas oficinas (nos cubos, quem manda é o preço do mercado).
- **A conta de cada cubo,** os canais na ordem (os encontros, o WhatsApp Business, o site, as oficinas, depois o Mercado Livre e a Shopee) e a lei em quatro linhas (MEI, nota, Inmetro, os 7 dias de arrependimento).
- **Os primeiros 90 dias:** o canal e o grupo; os dez nomes e as primeiras encomendas; o MEI na primeira venda e o cadastro nos distribuidores; uma competição oficial como visitante; o primeiro Sábado de Barão em dezembro; o FTO na vitrine antes de 2/1/2027; o caderno 1 e a primeira oficina no começo do ano; o Grande Encontro em março.

## 5. Os cadernos (as apostilas, sem cara de apostila)

Pequenos livros (A5, de 32 a 64 páginas), com o desenho do site e os desenhos feitos pelo próprio motor. Cada um começa por uma pergunta e termina com o cubo resolvido na mão. Os primeiros títulos:
1. *O cubo em oito passos*;
2. *As 78 da última camada*;
3. *Um sólido cortado por planos*;
4. *A matemática do cubo*;
5. *O treino*.

Para os encontros, impressos numa gráfica de Campinas; para a internet, impressão sob demanda.

## 6. A Editora de Praga

- **A sua frase já é o manifesto:** *"Os livros alienam e ensinam ao mesmo tempo. A leitura da realidade é a maior, mas são os livros que fazem a gente lê-la melhor: um paradoxo engraçado."*
- **Três pessoas que escreveram esse paradoxo antes**, para você ler:
  - **Schopenhauer (1851):** "ler significa pensar com uma cabeça alheia, em vez de pensar com a própria". É o lado que aliena.
  - **Kafka, em Praga (carta a Oskar Pollak, 1904):** "um livro tem de ser o machado para o mar congelado dentro de nós". É o lado que acorda.
  - **Paulo Freire, em Campinas (1981):** "a leitura do mundo precede a leitura da palavra". Foi a palestra que abriu o Congresso Brasileiro de Leitura, aqui em Campinas. É o paradoxo resolvido: a palavra volta para o mundo.
- **O nome:** Praga é a cidade de Kafka e, em português, também é a peste; para uma editora que diz que os livros alienam, a ironia é boa. **Atenção:** a Editora TAUP lançou em abril de 2025 um selo chamado "Praga". Antes de adotar o nome, conferir no INPI.
- **Os primeiros passos, quando for a vez:**
  - o nome conferido;
  - o primeiro ISBN, que pessoa física pode pedir na Câmara Brasileira do Livro;
  - os cadernos do cubo como primeiros livros, porque já têm onde vender;
  - e, um dia, os seus livros.
- A ideia ficou como uma linha no CentroPlus, esperando a vez.

## 7. A publicação

- **No ar: <https://cubos-five.vercel.app>** (o treino na mão em `/treino`, os eventos em `/eventos`). Commit `358a827`, ainda só no Mac.
- `npm run verificar`: tudo certo.

## Fontes

- [El King: o atacado](https://elking.com.br/cubo-magico-atacado/) · [Oncube: o atacado](https://www.oncube.com.br/pagina/cubo-magico-em-atacado.html) · [Cuboss](https://cuboss.com/speedcubes-wholesale/)
- Os preços: [Oncube](https://www.oncube.com.br/cubo-magico-3x3x3-moyu-rs3m-v5-magnetico) · [Cubo ao Cubo](https://www.cuboaocubo.com.br/cubo-magico-3x3x3-moyu-rs3m-v5-magnetico-ajuste-duplo) · [Cuber Brasil](https://cuberbrasil.com/products/cubo-magico-3x3-rs3m-v5-ajuste-duplo-magnetico-moyu) · [Casa do Cubo](https://www.casadocubo.com.br/produtos/cubo-magico-3x3x3-moyu-rs3-m-v5-maglev-robo-magnetico/)
- A importação: [SimulaDinheiro](https://www.simuladinheiro.com/consulta-rapida/taxacao-de-importacao/) · [Mundo Logística: a Lei 15.502/2026](https://mundologistica.com.br/noticias/nova-lei-remessas-expressas)
- [Inmetro: brinquedos](http://www.inmetro.gov.br/brinquedo/)
- [WCA: as competições no Brasil](https://www.worldcubeassociation.org/competitions?region=Brazil)
- Os lugares: [Casarão do Barão](https://www.buser.com.br/destinos/pontos-turisticos/sp/campinas/centro-cultural-casarao-do-barao) · [Museu Dinâmico de Ciências](https://www.guiadasemana.com.br/campinas/arte/estabelecimento/museu-dinamico-de-ciencias-de-campinas)
- A editora: [PublishNews: o selo Praga (2025)](https://www.publishnews.com.br/materias/2025/04/16/area-indie-sandra-godinho-autora-tres-vezes-finalista-do-leya-lanca-novo-romance-pela-editora-taup) · [Freire, A importância do ato de ler](https://www.unirio.br/cchs/ess/Members/raquel.moratori/a-importancia-do-ato-de-ler) · [Kafka a Oskar Pollak](https://www.themarginalian.org/2014/06/06/kafka-on-books-and-reading/)

---
[[0 Índice|Índice]] · ← [[121 — Cubos no ar, stickerless e o treino em tela cheia|121]]
