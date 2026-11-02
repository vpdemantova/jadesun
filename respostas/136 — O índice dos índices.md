# 136 · O índice dos índices
#fichas #atlas #design #menus #linha-do-tempo #museus #manifesto #doar #privacidade #espera-voce

> **Espera você:** dois cliques em `jadesun/publicar-montagne.bat` e aprovar o login da Vercel no navegador

## O pedido

> *"preciso que o portal solar seja o indice dos indices"* (31/out/2026, a PS-85)
>
> *"siga implementando e melhorando! publique sempre!"* (02/nov/2026)

## O que eu fiz

- **A página (PS-85):** Fichas › **Os índices** (`indices.html`). Cada índice do Portal é um volume, como numa enciclopédia: o número (vol. 01 a 16), o nome, o que tem (a conta grande e as outras ao lado), para que serve, as partes, **quando mudou** ("mudou hoje", "há 3 dias", "em 22 de setembro") e de onde vem. O volume inteiro abre o índice.
- **Os 16 volumes:**
  - Fichas (1.547), A Teia (322 pessoas, 65 grupos, 1.581 elos), Quando (109 marcos);
  - Ferramentas (189), Museus (126 museus e 37 fundações, só no seu computador, como a página), Distribuir (158 organizações);
  - Os manifestos (48), Todas as áreas (40), Curadoria, O glossário (42 palavras), Guias (29 livros e 22 fontes de notícia), O Atlas (8 vistas), Galeria de design (22 referências);
  - Domínio (o Checklist, só no seu computador), As edições do Início (19 edições) e As páginas (o mapa do Portal, que abre o Índice do Quadrado).
- **A busca única:** procura em todos de uma vez. Cada volume diz quantos trazem a palavra e mostra os quatro primeiros; os que não trazem nada descem para o fim. Na Teia, quem tem ficha e mais elos vem antes (J. S. Bach antes dos filhos).
  - Quem sabe buscar recebe a busca: "Ver os 18 em Ferramentas", "Ver todas em Fichas". Quem não sabe abre a lista ali mesmo ("Mostrar mais").
  - O endereço guarda a busca (`indices.html#q=bach`): mandar o link é mandar a busca pronta. A tecla / leva à busca; o Esc limpa.
- **A ordem:** Do Portal, Mais recentes (o progresso: o que mudou por último em cima) e Maiores.
- **"Quando mudou":** a data do último commit que tocou a fonte de cada índice; se a fonte mudou depois e ainda não foi guardada, a data do arquivo.
- **Cada índice agora abre direto num item, vindo de qualquer lugar:**
  - Quando aceita `#q=` (com todas as áreas ligadas);
  - os Museus aceitam `#q=`;
  - cada manifesto da humanidade tem endereço (`manifestos.html#mv-1517-95-teses`), com um contorno por um instante;
  - no Distribuir, uma organização fechada na área abre a área e vai até ela.
- **No site:** só os 14 índices que vão ao público, só os itens deles e só os que levam a uma página que existe lá. Nada do computador: nem Museus, nem o Domínio, nem caminhos do disco.

## Conferido

- Clique de verdade (mouse em 1440 px, toque em 390 e 360 px), ao vivo (porta 4322) e no site exportado (4331):
  - os volumes;
  - a ordem;
  - a busca "bach" (a Teia, as Fichas, a Curadoria, o glossário e os Guias), com o achado da Teia abrindo o J. S. Bach;
  - o `#q=musica` chegando pronto, o "Ver todas em Fichas", o Esc e o "Mostrar mais";
  - os seis endereços novos (Quando, manifestos, Distribuir, Ferramentas, Todas as áreas, glossário; e Museus no computador);
  - nada passa da tela, nada coberto e sem erro no console (no site exportado, só os 404 esperados do `/api/agora`, que existe só na Vercel).
- Auditoria de cor da página, com e sem busca, e das páginas mexidas (Manifestos, Distribuir, Quando, Museus), nos estilos Almanaque e Casa e nas cinco cores: 0 texto abaixo do contraste, 0 cor fora do tom.
- Cópia de antes em `dados/versao-2026-11-02-antes-do-indice-dos-indices/`.

## Os arquivos

- **Novos:** `indices.html`, `indices.js`, `indices.css` e `lib/indices.mjs` (o motor: conta cada índice, data e monta a busca; `/api/indices` ao vivo, `api/indices.json` no site).
- **Mexidos:**
  - a ligação: `servir.mjs`, `estatico.js`, `exportar.mjs`, `mapa-dados.js`, `perfil.js`, `portal.js`, `tema.js`, `tudo.js` e `testes/cores-auditoria.mjs`;
  - os endereços: `museus.js`, `linha-do-tempo.html`, `manifesto.js`, `doar.js` e `cores.css`.
- **Um índice novo no Portal:** entra como um volume em `lib/indices.mjs`. A página não muda.

## O que espera você

- **Publicar:** dois cliques em `jadesun/publicar-montagne.bat`. Ele exporta, pede o login da Vercel no navegador (você aprova) e publica. Vão juntos o índice dos índices e o que já esperava: a Montanha de Jade, a Teia, o Índice das ferramentas, as Boas-vindas, o Distribuir e as edições do Início. Depois desse login, eu consigo publicar sozinho as próximas.
- **O domínio (PS-35):** o montagnedejade.org vence em 14/nov. A renovação precisa da conta da Squarespace, que só você recupera.

---
[[0 Índice|Índice]] · ← [[135 — Distribuir, o nome com o link, o alto, o celular e as edições do Início|135]]
