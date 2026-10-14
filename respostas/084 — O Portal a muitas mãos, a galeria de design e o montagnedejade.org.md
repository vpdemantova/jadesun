# 84 · O Portal a muitas mãos: a entrada, "Faça parte", a galeria de design e o montagnedejade.org
#publicacao #home #design #manifesto #menus #celular #espera-voce

> **Espera você:** dar dois cliques em `jadesun\publicar-montagne.bat` e aprovar o login da Vercel no navegador; recuperar a conta da Squarespace antes de 14/nov/2026, para a renovação do domínio.

**"explique que esse é o projeto na entrada, e que coletivamente vamos fazer essa estrutura; o que mantém é o nome e parte da estrutura! os designs vão ser públicos; coloque um lugar pra candidatos a fazer design, código e outras funções, como ontologia… o novo projeto é coletivo e necessário e precisa de muito auxílio e cooperação; uma galeria de design com opções pra todas as novas U.I. e sites com referências de designs e interfaces futuristas e timeless… faça com carinho"** + **"tem como a gente ver daqui qual projeto está com o domínio montagnedejade.org? qual pasta? … só precisamos trocar de pasta todo o projeto um pelo outro pra eu não ter que recuperar minha conta"** (13/out/2026) + no `portalsolarprompts.md`: **"dá pra eu refazer todo o design no Figma e você fazer em cima dele pixel perfect?"**

## A entrada

Logo depois das três frases do Atlas, o bloco **"Agora, a muitas mãos: o Portal Solar vai ser refeito em conjunto"**:
- **o que fica:** o nome e parte da estrutura (o Quadrado no centro, o Atlas, as fichas em vez de perfis, as três colunas e a fonte ao lado de cada frase);
- **o que se faz junto:** todo o resto, com os designs públicos;
- **os botões:** "Faça parte" e "A galeria de design";
- **"Precisamos de":** as 14 funções, cada uma levando direto à sua descrição.

## Faça parte (`participe.html`)

- **O que fica e o que se refaz**, lado a lado.
- **14 funções:** design de interface, movimento e luz, código da interface, código de dados, **ontologia**, curadoria, pesquisa e checagem, escrita, tradução, acessibilidade, imagem, música e som, educação, comunidade. Cada uma traz o que é, **um primeiro passo de verdade** e do que precisa.
- **A candidatura** é uma ficha `.md` da própria pessoa, que se monta ao vivo enquanto ela escreve. Nada sai do navegador até ela mandar: dá para baixar, copiar ou enviar.
- **O envio** usa o e-mail ou o link de `coletivo-config.js`. Hoje os dois estão vazios: a página diz que o envio abre em breve, e o resto funciona.
- **Como funciona e os princípios:** nada inventado, sem feed, feito para todos, licença aberta, e o trabalho voluntário dito com honestidade.

## Galeria de design (`galeria.html`)

- **Experimente:** cores, aparência, a marca, o menu e o movimento. Cada opção tem uma página em miniatura, e um toque aplica no Portal inteiro (neste navegador). "Voltar ao padrão" desfaz.
- **O sistema aberto:**
  - as cores de cada tema e as das matérias, as letras e a marca;
  - **"Baixar os tokens (JSON)"**, no formato dos Design Tokens do W3C, que o Figma lê com o plugin Tokens Studio.
- **As propostas:** começa vazia, com o convite para a primeira.
- **As referências:** 14 interfaces atemporais e 8 futuristas, com nome, data, quem fez, por que importa e links conferidos. Entre elas, o Mundaneum, o Memex, o Xanadu, Engelbart, o relógio suíço, Vignelli, Aicher, a NASA, Rams, o Xerox Star, Susan Kare, Dynamicland, o OP-1, o Wikidata e o visionOS. Nenhuma imagem de terceiros.
- **"O sistema" (`sistema.html`)** passa a ir ao site público, como você pediu ("os designs vão ser públicos"). Ele não usa nada do servidor.

## O montagnedejade.org

- **Qual projeto:** o domínio aponta para o projeto **portal-solar** da Vercel (registro 080). O que está no ar hoje é a exportação pública de 09/out, publicada do Mac a partir da pasta `exportado/vercel`.
- **Trocar o site não precisa da Squarespace:** basta publicar a versão nova nesse projeto.
  - Montei a pasta aqui no Windows (`vercel-montar.mjs`): 4.094 arquivos, 220 MB, já com as páginas novas.
  - Conferi a privacidade: nenhum caminho do disco, nenhum e-mail, nenhuma chave.
- **Não publiquei:** esta máquina não tem login na Vercel (o login foi feito no Mac). O `publicar-montagne.bat` faz tudo num clique duplo:
  1. exporta;
  2. monta a pasta;
  3. abre o login no navegador, na primeira vez;
  4. liga a pasta ao portal-solar;
  5. publica.

  No fim, ele pergunta se você quer **desligar o repositório antigo (`interface`)** do projeto, para que um push antigo não publique por cima. A versão anterior fica guardada na Vercel e dá para voltar a ela (Deployments › Promote).
- **O que continua dependendo da Squarespace:** a **renovação do domínio em 14/nov/2026**. Trocar o site não resolve isso. Se não renovar, o endereço sai do ar, e o montagnedejade.vercel.app continua.

## O Figma, pixel a pixel

Dá. Há dois caminhos:
- **O servidor MCP do Figma** (Dev Mode, no app de mesa, se o seu plano tiver) ligado ao Claude Code: eu leio os quadros direto, com medidas, cores e letras.
- **Em qualquer plano:** você exporta cada quadro em PNG (1440 e 390 de largura) e manda o link do arquivo. Eu implemento e comparo lado a lado nas mesmas larguras, até bater.

Para ficar exato desde o começo, importe no Figma os tokens da galeria (Tokens Studio): assim o seu desenho já usa as mesmas cores e letras do código.

## Onde está

- **Arquivos novos:** `coletivo-config.js`, `coletivo.css`, `participe.html`, `participe.js`, `galeria.html`, `galeria.js`, `galeria-dados.js`, `vercel-montar.mjs`, `publicar-montagne.bat`.
- **Mudados:** `atlas.js` e `atlas.html` (o bloco da entrada), `mapa-dados.js` ("Faça parte" e a galeria na porta Manifesto) e `exportar.mjs` (as páginas novas e o "O sistema" no público).
- **Testado:** em 1440 e 390 px, sem rolagem lateral; o tema aplicado ao vivo; a ficha de candidatura montada e limpa.

**Nada foi commitado nem publicado.**

---
[[0 Índice|Índice]] · ← [[083 — O menu do celular, o ícone do Contato e o mapa dos idiomas|083]] · [[084 — O menu em duas barras, os ícones de grãos, o céu e a poeira da logo|084]] →
