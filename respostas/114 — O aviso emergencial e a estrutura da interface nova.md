# 114 · O aviso emergencial e a estrutura da interface nova
#pedido-grande #aviso #curadoria #guias #estrutura #figma #lentes #local-first #publicacao

**O pedido de 21/out/2026:** "no portalsolar/jadesun, coloque um aviso de que essa interface é emergencial e provisória, link em baixo as causas e as noticias mais necessarias, avanços, novas tecnologias, tendencias, pra cada pessoa e profissional ficar a par de tudo! na sua area e no mundo vasto" · "logo em seguida, me passe toda a estrutura do site, pra eu colocar no figma, fazer um wireframe e um mockup pra gente refazer o projeto todo na nova interface! quero sempre pensar em local first, e integrar todos os produtos e apps no portalsolar, pra termos um hub global de fato… na versao minimalista, do texto corrido, do conceito das lentes…"

## 1. O aviso (no ar)

- **No Início**, antes de tudo: a faixa em tinta cheia, "Esta interface é emergencial e provisória.", com uma frase sobre por quê; logo embaixo, **cinco colunas**: as causas, o mundo agora, os avanços, as novas tecnologias, as tendências (quatro fontes em cada, com o porquê); depois **Na sua área**, 21 áreas profissionais (saúde, educação, ciência, tecnologia, engenharia, energia, clima, florestas, agro, direito, economia, cidades, design, arte, música, jornalismo, mente, sociedade, espaço, humanidades, terceiro setor), três fontes cada, em texto corrido. A área escolhida fica no aparelho.
- **Nas outras páginas**, uma linha fina no alto ("Aviso · Esta interface é emergencial e provisória") com os seis nomes; cada um abre a folha já na parte certa. No celular, a linha vira "Ver o que importa agora", e as colunas viram texto corrido.
- **As fontes**: 83 links, todos abertos no Chrome em 21/out. Ficaram de fora os que nem o navegador abriu, por barrarem robôs (The Lancet, Science, IEA, Anistia Internacional (o site mundial), ONU-Habitat, Ars Technica, ReliefWeb); entraram no lugar STAT, Science News, Ember, OCHA, Anistia Brasil e LabCidade. As notícias não se repetem: vêm das fontes do Guias, pelo id.
- **Doar**: no app, as causas mostram "Doar" e "Os 17 ODS"; no site público, só os ODS (o Doar público ainda espera a PS-04).
- **Conferido**: 1440 e 390 px; preto e branco; a auditoria de cores em seis páginas, nas cinco cores, Almanaque e Casa. O aviso passa; a única falha é a etiqueta "você · Campinas" do mapa da Terra, que já existia (o auditor não vê a pílula escura atrás dela).
- **Visto de passagem, não mexido**: no celular (390 px) a barra de cima passa 12 px da tela, em todas as páginas; quem empurra é o "PROVA FEITA" no lugar da contagem. Fica para uma tarefa à parte.

## 2. A estrutura (para o Figma)

- **`ESTRUTURA.md`**, na raiz: em uma página; as 14 leis; o local-first (onde cada coisa mora); as estantes, os formatos e os tipos; **as oito lentes**; **o mapa novo**; a navegação; **os quinze moldes**; os componentes; os tokens; **os produtos no hub**; o passo a passo no Figma, com os dez fluxos; a ordem da obra (F0 a F7); o que é decisão sua.
- **A ideia central**, tirada do motor: só há duas espécies de página, **o arquivo** e **a lente** sobre muitos arquivos. As oito lentes: corrido, lista, grade, tábua, tempo, mapa, rede, espaço; o corrido em toda parte (a tecla L desliga a lente da página inteira).
- **O mapa novo**: oito portas em vez de dez, **Manifesto · Obras · Guias · Atlas ■ Hoje · Caderno · Eu · Casa**. Fichas, Quando e Dados viram lentes do Atlas; a Curadoria e o aviso entram nos Guias; o Domínio entra no Hoje; nascem o **Caderno** (notas, leituras, coleção, os arquivos) e as **Obras** (os produtos). Nenhuma página some: cada linha diz de onde vem.
- **Os produtos** entram por três degraus: **ficha** (um `.md` nas Obras) → **casca** (abre dentro do hub, com a mesma barra) → **motor** (lê e escreve a mesma pasta). Só as obras aparecem pelo nome; as ferramentas pessoais e os sites de outras pessoas ficaram fora do arquivo público.
- **`estrutura/figma/`**: `00-mapa.svg`, `01-lentes.svg`, `02-produtos.svg`, `03-moldes-1440.svg`, `04-moldes-390.svg`, um SVG por molde em `moldes-1440/` e `moldes-390/`, e `variaveis.json` (Tokens Studio). Arrastados no Figma, viram camadas com os nomes dos blocos.
- **Uma fonte só**: tudo sai de `estrutura/dados.mjs` pelo `node estrutura/gerar.mjs`, que também lê as cores e a régua dos CSS de verdade e costura as tabelas no `ESTRUTURA.md`.

## 3. A publicação

- Commit `9b2dc91` (o aviso), no GitHub e em **montagnedejade.org** (publicação `dpl_TeABER1WJyKLRbZFeoH2FfpeFnA7`, 21/out, 16:42).
- A publicação anterior era de 12/out, então foram juntos ao ar o **Portal repaginado** (12–13/out: Faça parte, a Galeria de design, as Leituras), o **monocromático** (111) e o aviso. Para voltar: Vercel → portal-solar → Deployments → a de 12/out → Promote.
- A estrutura vai no commit seguinte a este registro.

## Onde está

- **Novos:** `aviso-dados.js`, `aviso.js`, `ESTRUTURA.md`, `estrutura/dados.mjs`, `estrutura/gerar.mjs`, `estrutura/figma/`.
- **Mudados:** `perfil.js` (a linha do aviso), `casca.css` (o desenho), `atlas.html` (os três scripts), `exportar.mjs` (os arquivos novos vão junto), `TAREFAS.md` (PS-45 e PS-46).

---
[[0 Índice|Índice]] · ← [[113 — A revista viva, a capa que abre e o índice que mostra|113]]
