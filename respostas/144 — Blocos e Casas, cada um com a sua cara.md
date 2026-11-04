# 144 · Blocos e Casas, cada um com a sua cara: a forja e as pranchas
#blocos #casas #design #interface #webgpu #desenho-tecnico #sol #publicacao #espera-voce

> **Espera você:** abrir os dois links e responder numa linha o que mudar primeiro em cada um (ou "pode seguir").

**O pedido de 1º/nov/2026:**

> *"que tragedia, eram pra ser projetos originais.. interfaces e designs unicos.. especiais integrados e visioaniros pra aplicacao propria"*

Você tinha razão. Os dois sites do registro 127 tinham nascido na régua do Cubos: as mesmas letras, as mesmas pílulas, a mesma maquete ao lado de uma coluna de texto. Agora cada um tem uma interface que nasce do próprio assunto. O motor (o traçado de caminhos em WebGPU) e todo o conteúdo ficaram. Mudou tudo o que se vê e o jeito de andar por eles.

## 1. Blocos: a forja

**No ar:** <https://blocos-minecraft.vercel.app> (o código em `~/www/blocos`, commits `e61a749` e `a51fcff`; o repositório é só local).

- **A cara:** a página é a fornalha à noite.
  - Os títulos têm a letra de estêncil das caixas de fábrica (Big Shoulders Stencil), os rótulos e os números a Big Shoulders Text, e o texto corrido a Barlow.
  - Há uma cor só de destaque, **o calor**: a cor do metal na era em que se está. Ela vai do vermelho do barro e do laranja do bronze ao amarelo do aço, ao azul do arco elétrico, ao magenta do plasma e ao branco da estrela. A interface esquenta enquanto se sobe.
- **A escada (a capa):** a torre dos materiais fica ao lado do texto, e cada uma das dez eras que chega na tela a constrói até ali.
  - A torre sobe, gira para mostrar o degrau da era, e a câmera se afasta junto com a altura. A luz anda da manhã para o fim da tarde.
  - Na margem fica o termômetro das dez eras (no celular, uma faixa de cores embaixo da barra).
  - Na abertura, a torre aparece inteira, com a estrela no alto: o fim que a escada promete.
- **A árvore:** os seis caminhos numa grade só, que é o mapa do site.
  - Cada linha é um caminho, cada coluna uma era, cada círculo um degrau, com a maquete dele dentro.
  - Os fios tracejados ligam o mesmo degrau visto em dois caminhos (o vapor do GregTech, do GT New Horizons e do TerraFirmaGreg, por exemplo).
  - Dá para ver de relance onde cada pack começa e até onde vai. No celular, a grade vira de lado.
- **A missão:** cada degrau é o cartão de uma missão. Em cima fica a linha dos degraus. O cartão tem as tarefas numeradas, o cuidado e o "você chegou quando", que se marca como feito. Ele também mostra o mesmo degrau em outro caminho.
- **As estruturas:** a pilha das camadas fica na maquete, e a conta dos blocos aparece como um inventário: cada bloco no seu espaço, com a quantidade no canto.
- **O motor:** um painel de dentro diz ao vivo quem desenha (WebGPU ou WebGL2), o tamanho da imagem e quantos quadros já se somaram. Parado, a imagem pronta não gasta nada.
- **O teste** confere 1.411 coisas, entre elas que as dez eras cobrem a torre inteira sem buraco e que, nos caminhos que seguem os metais, nenhum degrau volta de era.

## 2. Casas: as pranchas

**No ar:** <https://casas-arquitetura.vercel.app> (o código em `~/www/casas`, commit `b879f6f`; só local).

- **A cara:** o site é um jogo de pranchas de arquitetura.
  - Cada tela é uma folha, com a moldura e as marcas de centro.
  - A primeira folha de cada página tem o carimbo: o projeto, o número da prancha (de 00 a 12), a escala e a data. O campo do **responsável técnico fica em branco**, porque o site não assina projetos. O aviso virou parte do desenho.
  - No tema claro, é a cópia de linhas azuis sobre o papel; no escuro, a cianotipia, com as linhas claras sobre o azul da Prússia.
  - As letras são a Instrument Serif e a Instrument Sans. A única cor quente é a do sol.
- **Os desenhos técnicos saem dos mesmos dados da maquete:** a planta (com as áreas: 66,38 m² de área útil, fora a varanda), a planta da estrutura (os eixos e os doze pilares), o corte AA, a fachada norte, a carta solar e as hachuras das dez paredes. Mudou a casa, mudam os desenhos.
- **A carta solar é o controle** (prancha 09): o desenho que os arquitetos usam para ler o céu, de seis cidades. O disco do sol anda pelo caminho do dia, e uma curva escolhe outra data. A maquete, as horas de sol de cada fachada e o corte acompanham.
- **O corte mostra até onde o sol entra:** ele desenha o raio que passa rente ao beiral e a mancha de sol no piso.
  - Um achado da própria casa de estudo: em Campinas, ao meio-dia de 21 de junho, o sol (a 43,6°) não alcança a porta de vidro da sala. A varanda de 2,5 m, com o beiral de 0,75 m, faz sombra até ali.
  - O sol só entra quando fica abaixo de 38° no plano do corte: nesse dia, até as 9h37 e depois das 14h43. É o tipo de coisa que um desenho ensina e que a intuição erra.
- **As outras pranchas:**
  - os materiais se escolhem pela hachura (a de 45° da alvenaria, os pontos e triângulos do concreto, os anéis do bambu), e o carbono vira uma régua logarítmica;
  - a biblioteca é uma escala do tempo com as interrupções em zigue-zague do desenho técnico, onde os séculos vazios saltam;
  - a responsabilidade mostra o carimbo de uma casa de verdade, com o campo que este site deixa em branco.
- **As fotos das maquetes** foram refeitas sem fundo (as antigas tinham uma caixa cinza no papel novo).
- **O teste** confere 461 coisas, entre elas o sol do corte contra os valores conhecidos (43,6° em junho e quase a pino em dezembro) e as áreas da planta.

## 3. Para comparar com a primeira versão

As versões antigas ficaram nos endereços próprios da Vercel, que abrem com a sua conta:
- o Blocos: <https://blocos-9zr4ncugl-vitordes-projects.vercel.app>;
- as Casas: <https://casas-aie4ztxnh-vitordes-projects.vercel.app>.

No git de cada pasta, elas também ficaram guardadas na etiqueta `v1-regua-do-cubos`.

## 4. O que é honesto saber

- **As dez eras da escada são uma leitura minha:** um eixo para juntar os seis caminhos. Os números de cada era vêm dos dados conferidos em 26/out. O Create e o All the Mods não seguem os metais um a um, e a árvore diz que a posição deles é aproximada.
- **Os desenhos das Casas são da casa de estudo do site, não de uma casa sua.** As medidas da estrutura são ordens de grandeza para entender a conversa com o profissional.
- **O disco do Mac** está com 3,7 GB livres. Apaguei só as minhas fotos de teste. O cache do npm (4,6 GB) continua lá, esperando o seu sim.
- **Os envios ao GitHub de hoje:** se este registro não aparecer no GitHub, é o chaveiro de novo (como no 143), e o `juntar-tudo.command` resolve.

## 5. Depois

- **As próximas ideias** estão no `TAREFAS.md` de cada projeto:
  - nas Casas: a carta solar com a metade do céu que a fachada escolhida vê, e as pranchas impressas em A3, na escala;
  - no Blocos: o mundo de rocha do TerraFirmaCraft e o construtor de estruturas.
- **O mesmo cuidado** vale para os próximos sites de "um site por assunto": cada um nasce com a sua própria interface, nunca com a régua de outro.

## Fontes

- [NOAA: as contas da posição do sol](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)
- [TerraFirmaCraft: o livro do jogo](https://terrafirmacraft.github.io/Field-Guide/en_us/)
- [GregTech CEu Modern: a documentação](https://gregtechceu.github.io/GregTech-Modern/1.20.1/)
- [Google Fonts: Big Shoulders](https://fonts.google.com/specimen/Big+Shoulders+Stencil), [Barlow](https://fonts.google.com/specimen/Barlow) e [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif)

---
[[0 Índice|Índice]] · ← [[143 — A marca nova, a família e a Oficina|143]]
