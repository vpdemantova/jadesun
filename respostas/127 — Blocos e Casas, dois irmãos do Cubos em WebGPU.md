# 127 · Blocos e Casas: dois irmãos do Cubos, em WebGPU, no ar
#blocos #casas #minecraft #arquitetura #webgpu #webgl2 #motor #sol #referencias #publicacao #espera-voce

> **Espera você:** abrir os dois links e responder numa linha o que mudar primeiro em cada um (ou "pode seguir").

**O pedido de 26/out/2026 (à noite):**

> *"crie parecido com o do cubo magico, mas outro projeto, com webgpu tambem e mais tecnicas avancadas … ensinando e mostrando a beleza dos modpacks do minecraft … gtnh, terrafirmacraft, create e gregtech … um tutorial completo de cada fase … e tambem do all the mods 11 … tambem um pra arquitetura (outro projeto) pra cada um projetar sua casa com segurança da engenharia, consciencia e responsabilidade na forma, na maior inovacao dos materiais, com as maiores referencias literarias e historicas … esses sites é bom serem externos pra mostrar minhas habilidades de comandar projetos e construir sites"*

## 1. Blocos: os modpacks do Minecraft, degrau por degrau

**No ar:** <https://blocos-flame.vercel.app> (projeto `blocos` na Vercel; o código em `~/www/blocos`, commit `f6c8be7`; o repositório é só local, como o dos Cubos).

- **A frase:** *"Todo modpack é uma escada de materiais: cada degrau é a ferramenta do próximo."*
- **A capa** é uma torre em espiral, à maneira da Torre de Tatlin (1920): cada degrau é um material, da pedra lascada ao último casco do GregTech (o MAX, de 2.147.483.648 V), com a estrela no alto. Cada degrau diz o próprio nome.
- **Os seis caminhos, em 43 degraus:**
  - os mods: o TerraFirmaCraft (7), o Create (7) e o GregTech (6);
  - os packs: o GT New Horizons (11), o TerraFirmaGreg (5) e o All the Mods 11 (5).
  - Cada degrau tem o objetivo, os passos, os cuidados, o marco de chegada e as fontes, e pode ser marcado como feito.
- **As versões de hoje, conferidas:** o ATM11 0.12.0-beta (Minecraft 26.1.2), o GTNH 2.8.4 (e a 2.9 em teste), o TFC 4.2.12, o Create 6.0.10, o GregTech CEu 7.5.3 e o TerraFirmaGreg 0.13.6.
- **As 37 maquetes**, uma por degrau. As **sete estruturas** de vários blocos (o bloomery, o alto-forno, a forja, o forno de coque, o alto-forno primitivo, o elétrico e o congelador a vácuo) montam camada por camada, com a conta dos blocos de cada uma; a forma foi tirada do código do próprio mod.
- **As texturas** são desenhadas pelo motor na hora: nenhuma é do Minecraft nem dos mods. No rodapé fica o aviso que a Mojang pede.

### O motor, em palavras simples

- **O raio:** cada ponto da tela manda um raio, que anda pela grade de blocos (o algoritmo de Amanatides e Woo, de 1987) até tocar alguma coisa.
- **A luz:** dali saem um raio para o sol (que tem tamanho, e por isso a sombra é macia), outro para uma luz da cena (a lava, as bobinas, o fogo) e outro que rebate nas paredes. É o traçado de caminhos, a técnica do cinema de animação.
- **Parado,** o motor soma os quadros em resolução cheia até a imagem ficar limpa, e então para de gastar.
- **Em movimento,** desenha uma imagem menor, lembra o que via no quadro anterior e passa um filtro que alisa a luz sem borrar as quinas (as ondas "à trous", de 2010).
- **As peças que giram** (a roda d'água, as engrenagens, o moinho, o misturador) têm a sua própria grade fina.
- **A hora do dia** muda a luz. De noite, a lava ilumina a grama em volta.
- **O chão é o papel da página:** a maquete parece pousada na folha, no tema claro e no escuro.
- **Os dois motores:** onde não há WebGPU, o mesmo desenho roda em WebGL2. Parados, os dois dão a mesma imagem (diferença média de 0,33 em 255).

**O teste** (`npm run verificar`) confere 1.282 coisas. Uma delas: as estruturas, contra as regras escritas no código de cada mod.

## 2. Casas: pensar a própria casa

**No ar:** <https://casas-sage-one.vercel.app> (projeto `casas`; o código em `~/www/casas`, commit `2eec4de`; só local).

- **A frase é a de Vitrúvio:** *"Toda casa responde a três perguntas: fica de pé? serve a quem mora? é bela?"*
- **O motor é o do Blocos com o sol de verdade.** As contas da NOAA dão o sol de seis cidades, em qualquer dia e hora do relógio: Manaus, Recife, Brasília, Campinas, Porto Alegre e Lisboa, esta para comparar com o hemisfério norte.
- **A casa de estudo** é feita em blocos de 25 cm: sala e cozinha ao norte, dois quartos ao sul, varanda, a sala com luz de dois lados. Ela pode ser maquete branca ou ter os materiais de verdade, e pode ser cortada a 1,25 m do chão, como uma planta.
- **Os oito degraus:** o lugar, o programa, a forma, a estrutura, os materiais, o desenho, a imagem e a obra. Cada um tem a sua maquete (o caminho do sol em três arcos sobre o terreno, os cômodos em volumes coloridos, o esqueleto de concreto…) e diz a quais das três perguntas responde.
- **O laboratório do sol:** a cidade, o dia, a hora, a casa girada e o tamanho do beiral, e as horas de sol de cada fachada. Em Campinas, a fachada norte tem 10h35 de sol em 21 de junho e nenhuma em 21 de dezembro, quando o sol passa a 89,5°, um pouco ao sul.
- **Os materiais:** dez paredes, da taipa de pilão ao CLT. Cada uma tem o que é, o cuidado, a norma com o ano (taipa NBR 17014:2022, bambu NBR 16828:2020, adobe NBR 16814:2020, light steel framing NBR 16970:2022, wood frame NBR 16936:2023) e o carbono em ordem de grandeza.
- **A biblioteca:** 27 obras e livros, de Vitrúvio a Francis Kéré, cada um com a lição para quem desenha uma casa.
- **A responsabilidade:**
  - o que é seu e o que é do profissional;
  - as leis: a ART (Lei 6.496/1977), o CAU e o RRT (Lei 12.378/2010) e a assistência técnica pública e gratuita para famílias com renda de até três salários mínimos (Lei 11.888/2008);
  - as normas que protegem quem mora.
- **O aviso, em todas as páginas:** o site ensina a pensar uma casa e não substitui um projeto.

**O teste** confere 399 coisas, entre elas as contas do sol contra valores conhecidos. Os dois motores conferem também aqui (0,32 em 255).

## 3. O que é honesto saber

- **O All the Mods 11 está em beta.** O guia ainda não fala da estrela, a meta final da série; o site diz isso e aponta o ATM10 para quem começa.
- **As ordens de grandeza da estrutura** (o pilar de 19 cm, a laje de 8 cm, a viga de um décimo do vão) servem para entender a conversa, não para construir. O site repete que o cálculo é de um engenheiro ou de um arquiteto habilitado.
- **O carbono por quilo** vem do inventário ICE (Universidade de Bath), pela tabela da HKUST. É uma ordem de grandeza.
- **A zona bioclimática de Campinas** não foi confirmada numa fonte aberta, então o site não a afirma: ele explica as 8 zonas e aponta a norma.

## 4. O disco do Mac

No meio das fotos das maquetes, o disco chegou a 199 MB livres. Não era coisa minha: o espaço sobe e desce sozinho com as sincronizações.

- **O que apaguei:** só os meus arquivos de teste. Nada seu foi tocado.
- **Para abrir espaço:** o cache do npm ocupa 4,6 GB e pode ser limpo com `npm cache clean --force`. Os programas baixam de novo o que precisarem. Não é urgente para os sites.

## 5. Depois

- **As próximas ideias** estão no `TAREFAS.md` de cada projeto:
  - no Blocos: o mundo de rocha do TerraFirmaCraft gerado na placa de vídeo e o construtor de estruturas;
  - nas Casas: medir um cômodo e vê-lo virar maquete com o sol do seu endereço.
- **A ordem do registro 125 continua:** os Cubos ainda esperam a escolha da prancha (A, B, C ou "as três"). Ela pode ficar para depois do retorno sobre estes dois.

## Fontes

- [TerraFirmaCraft: o livro do jogo](https://terrafirmacraft.github.io/Field-Guide/en_us/) e [o código](https://github.com/TerraFirmaCraft/TerraFirmaCraft)
- [Create: o código](https://github.com/Creators-of-Create/Create) · [Create 6.0.0](https://wiki.createmod.net/users/changelogs/6.0.0)
- [GregTech CEu Modern: a documentação](https://gregtechceu.github.io/GregTech-Modern/1.20.1/) e [o código](https://github.com/GregTechCEu/GregTech-Modern)
- [GT New Horizons: a wiki](https://wiki.gtnewhorizons.com/wiki/Main_Page) · [as versões](https://www.gtnewhorizons.com/version-history/)
- [All the Mods 11 no CurseForge](https://www.curseforge.com/minecraft/modpacks/all-the-mods-11) · [o guia do ATM11](https://www.minecraft-guides.com/modpacks/all-the-mods-11-atm11/)
- [NOAA: as contas da posição do sol](https://gml.noaa.gov/grad/solcalc/solareqns.PDF)
- [ONU (PNUMA): o setor de edifícios, 2025](https://unep.org/news-and-stories/press-release/not-yet-built-purpose-global-building-sector-emissions-still-high)
- [Lei 11.888/2008](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/lei/l11888.htm) · [Lei 12.378/2010](https://www.planalto.gov.br/ccivil_03/_Ato2007-2010/2010/Lei/L12378.htm)
- [Christopher Alexander, padrão 159](https://www.patternlanguage.com/apl/apl159/apl159.htm)

---
[[0 Índice|Índice]] · ← [[126 — O Início em telas, sem o Quadrado no menu|126]]
