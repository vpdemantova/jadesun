# 115 · Todas as áreas, a Luz, Projetos do Sol e o acabamento
#pedido-grande #areas #carreiras #noticias #vagas #luz #arquitetura #poema #design #acabamento #celular #publicacao

**O pedido de 21/out/2026, à noite:** "monte um sistema que pegue todos os nichos e todas as áreas e traga notícias e trabalhos, pois todos os dias cada pessoa pode ter 10 minutos com uma ontologia global em todas as áreas. vamos definir todas as áreas e subáreas, e conhecer os mercados e nichos e comunidades de cada uma, se especializar e mudar de carreira e foco por saber tudo…" · "e outro que mostre todas as alternativas de iluminação, do móvel à cidade, repensando tudo, vamos juntar tudo isso no portal solar" · "portal solar: somos projetos do sol, devemos espelhar as obras da luz" · "vou escrever um poema desde o átomo e célula que se reproduz e percebe a realidade! me ajude a estruturar isso tudo no portal solar..! e publique o quanto antes uma versão sem ser essa barata e feita por i.a... quem sabe melhorar a interface, pra ter uma mínima futurista e minimalista, já como está, mas mais acabada e qualidade.." · "vamos superar archdaily e todas as absolutas plataformas!"

## 1. Todas as áreas (no ar)

**Guias › Todas as áreas** (`campos.html`): a ontologia do trabalho e do saber, inteira, e dez minutos por dia.

- **A espinha não é inventada:** as dez grandes áreas e as subáreas com número são a classificação da UNESCO para os campos de estudo e formação (ISCED-F 2013), a mesma que os países usam para contar quem estuda o quê. Três **caminhos** atravessam todas e ficam à parte: a pesquisa, o serviço público e o terceiro setor.
- **O tamanho:** 40 áreas, 267 subáreas, 264 nichos e mercados, 161 fontes (137 com feed), 55 quadros de vagas, 126 comunidades (conselhos, associações, redes). As 21 áreas do aviso estão todas lá, com os mesmos nomes de antes, e a escolha guardada no aparelho continua valendo.
- **Os seus dez minutos:** escolhe-se a área e vêm quatro passos: **o que mudou** (as manchetes de hoje das fontes da área, sem algoritmo, só a data ordena), **uma subárea** (gira a cada dia, com os nichos, a comunidade e como se entra no Brasil), **o mercado** (vagas remotas abertas, da Jobicy, e buscas prontas no LinkedIn, Indeed, Gupy e nos concursos) e **fora da sua área** (uma área do mundo por dia). "Começar os dez minutos" liga um relógio: um fio cresce no alto e o passo da vez se acende.
- **O mapa:** os onze grupos, cada área numa linha (o nome, a pergunta, as subáreas); um clique abre a folha com tudo: subáreas com o código da UNESCO, nichos, o que mudou, vagas, comunidade, como se entra, as vizinhas (para mudar de área) e as fontes com o porquê.
- **Os links:** todos abertos em 21/out; os que barram robôs foram abertos no Chrome. Saíram os que nem o Chrome abriu (Poynter, a página de vagas da APA, IJNet, o FMI) e os feeds parados há anos (Ciência Hoje, Teatrojornal, Hakai).
- **De onde vêm as manchetes e as vagas:** um motor só, `lib/agora-motor.cjs`, que roda no servidor de casa (`/api/agora`) e numa função da Vercel no site público. A Vercel guarda a resposta de cada área por meia hora; cada fonte recebe no máximo um pedido a cada meia hora por área, venha quanta gente vier. Se a função faltar, a página usa a cópia gravada na exportação.
- **Conferido no ar:** as 40 áreas trazem manchetes (de 6 a 12 cada) e 19 trazem vagas remotas. Oito feeds não respondem ao servidor da Vercel (ZUM, The Architect's Newspaper, Mercado & Eventos, Café História, Plus, Bachtrack, Revista Proteção, Le Monde Diplomatique); continuam como links em Fontes e cada área tem outros feeds.
- **Uma lista num lugar só:** o "Na sua área" do aviso passou a ler daqui (as três primeiras fontes de cada área). Saiu a lista de 21 áreas do `aviso-dados.js`. No Início, a área se escolhe num seletor (40 botões não cabiam) e há um link para os dez minutos.

## 2. A Luz (no ar)

**Atlas › A Luz** (`iluminacao.html`): todas as alternativas de iluminação, do móvel à cidade.

- O lema, a sua frase: "Somos projetos do Sol: devemos espelhar as obras da luz."
- **Antes de acender:** cinco perguntas para qualquer luz (precisa? de onde vem? para onde vai? quanta? quando?).
- **Todas as alternativas:** 26, em seis famílias: do Sol direto (janela, claraboia, prateleira de luz, tubo de luz, garrafa de Moser, espelho e heliostato, cobogó, brise, superfícies claras), do Sol guardado, da chama, da eletricidade (da incandescente ao OLED), da vida e da química (bioluminescência…) e nenhuma luz (a escuridão escolhida).
- **Do olho ao céu:** sete degraus, cada um dentro do seguinte (a regra que Eero Saarinen repetia): o olho, o objeto, o cômodo, a casa, a rua, a cidade, o céu. Em cada um: o texto, os princípios, as obras (PH, Akari, Arco, Little Sun, a Igreja da Luz, o cobogó, o Ministério da Educação e Saúde, o SESC Pompeia, a garrafa de Moser, o Plano Luz de Lyon, Flagstaff, os espelhos de Viganella e Rjukan, Liter of Light, a petúnia que brilha) e "amanhã", o que fazer. Uma régua presa ao lado acende o degrau da vez.
- **31 fontes numeradas**, cada número ao lado da frase. Cada frase foi conferida contra o texto da fonte; as que não bateram foram corrigidas ou saíram (o "1958" de Flagstaff, os "450 m" de Rjukan, os "85%" da África, o ano de 2023 do plano de Lyon). Onde a ciência discorda (a cor dos postes de LED), as duas partes aparecem.

## 3. Projetos do Sol, o poema (só no seu computador)

- **O poema é seu.** Nenhum verso foi escrito por mim. Ficou montada a escada: **doze cantos**, do átomo ao ser que percebe e cria (a primeira luz, o átomo, o Sol, a molécula que guarda, a primeira célula, a célula que come luz, a que se divide, a que percebe, o corpo que sente, o ser que percebe tudo, o ser que cria, a volta ao Sol).
- Em cada canto: **o que aconteceu** (o fato, com a fonte, fechado para não ocupar o lugar do poema), **uma pergunta** (provocação, não verso) e **o lugar vazio dos versos**. No fim, **os que subiram antes** (Lucrécio, o Grande Hino ao Aton, o Cântico do Irmão Sol, Augusto dos Anjos, Carl Sagan) e **três formas possíveis** (doze cantos, sete dias, um canto contínuo). O título é provisório, tirado da sua frase.
- **Onde mora:** um arquivo só no caderno, na pasta dos seus poemas, com `visibilidade: privado`. No Portal, **Eu › Projetos do Sol** mostra a escada e os versos já escritos ("0 / 12"); **Escrever** abre o próprio arquivo na Nota. Nada disso vai ao site público.

## 4. O acabamento (no ar)

- **O menu de baixo** perdeu a letra mono em caixa-alta ("DENTRO DE GUIAS", "NESTA PÁGINA"): agora fala na letra do menu, como a régua do `forma.css` pede. O "CTRL K" da busca virou "Ctrl K".
- **A contagem do alto** dizia "Prova feita" em caixa-alta e, no celular, empurrava a barra 12 px para fora da tela, em todas as páginas (a PS-48). Agora, passada a prova, mostra o dia ("qua, 21 de out"); no telefone ela sai da barra (continua no Hoje).
- **As duas páginas novas** nascem na mesma régua: fios finos em vez de caixas, números tabulares, monocromático, cada bloco se compõe uma vez ao chegar e nada se mexe em repouso.
- **Conferido:** 1440 e 390 px; nenhuma página passa da largura da tela no celular; a auditoria de cores passa nas cinco cores e nos dois estilos (a única falha é a etiqueta "você · Campinas" do mapa da Terra, que já existia).

## 5. A publicação

- Commit `e603c32` (o código) no GitHub, e a publicação `dpl_BdqdbnTeVUyPbNKdMqrJdKquAt8r` em **montagnedejade.org** (21/out, 21:10), com a função `/api/agora`. Este registro e o poema vão no commit seguinte.
- Endereços: montagnedejade.org/campos.html · montagnedejade.org/iluminacao.html.
- **Para voltar:** Vercel → portal-solar → Deployments → a de 21/out, 16:42 → Promote.
- **O disco do Mac estava quase cheio** (226 MB livres no meio da publicação). Apaguei só o que os meus testes tinham criado nesta noite (26 perfis temporários do Chrome, 1,1 GB); ficaram cerca de 3 GB livres. Nada seu foi apagado.

## Onde está

- **Novos:** `campos-dados.js`, `campos.js`, `campos.css`, `campos.html`, `iluminacao-dados.js`, `iluminacao.js`, `iluminacao.css`, `iluminacao.html`, `poema.html`, `poema.js`, `lib/agora-motor.cjs`, `lib/agora.mjs`.
- **Mudados:** `aviso.js` e `aviso-dados.js` (as áreas vêm do mapa), `atlas.html`, `perfil.js` (a contagem, o aviso), `casca.css` (o menu de baixo, a barra do celular, o seletor), `estatico.js` (o `/api/agora` no site estático), `servir.mjs` (a rota), `exportar.mjs` (as páginas e a cópia do agora), `vercel-montar.mjs` (a função), `mapa-dados.js` (as três páginas), `estrutura/dados.mjs` e `ESTRUTURA.md` (o mapa novo), `TAREFAS.md` (PS-48 a PS-51).

---
[[0 Índice|Índice]] · ← [[114 — O aviso emergencial e a estrutura da interface nova|114]]
