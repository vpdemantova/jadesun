# 83 · O menu do celular refeito, o ícone do Contato e a escolha de idioma com o mapa
#vitordemantova #celular #menus #idiomas #design #correcao #publicacao #privacidade #espera-voce

> **Espera você:** decidir se este repositório (jadesun) continua público no GitHub. Hoje qualquer pessoa lê este registro. Para fechar: GitHub › vpdemantova/jadesun › Settings › Danger Zone › Change visibility › Private. Nada do que está no ar depende de ele ser público.

**"o menu no mobile está abandonado e mal implementado, um botão fica em cima do outro… precisa ter ordem e diretriz! / o menu dos idiomas deve ser mais interativo, com uma opção normal, só que bem mais elaborada que essa! e outra com um mapa do mundo, invertido, pra valorizar os países subdesenvolvidos, e uma opção pra ver o mapa normal, tudo bem desenhadinho e nada brega e super showy / … o ícone do botão card de contato está bem mal feito e fora da estética que gosto / publique sempre na hora as alterações"** (12/out/2026, à noite)

## No ar

- **www.vitordemantova.com**: commit `036abf8`, publicado às 18h07. A Vercel recebeu o aviso do GitHub na hora.
- **A rodada anterior (082)** você mesmo publicou, às 14h07 (`07514c3`).

## O menu do celular

- **Três colunas**: o Menu, o botão do modo e, à direita, o tocador, o Perfil e o Contato.
- **Os botões redondos** têm um tamanho só, que acompanha a tela.
- **Nada empurra o vizinho**: o tocador, quando cresce, cobre o Perfil e o Contato no lugar deles.
- **Saíram da barra** as iniciais e a logo pequena, que apertavam tudo a 320 px.
- **Na folha**: o nome leva ao topo; os desenhos das seções ficam no mesmo quadro; os modos, o Perfil e o Contato ficam em duas colunas iguais.
- **Conferido** em português, alemão e grego, de 320 a 1024 px, no topo, no meio de uma seção e com música tocando: nenhuma sobreposição.

## O ícone do Contato

- Era um quadro de CSS que borrava.
- Agora é um **cartão de visita em traço fino**, com o triângulo da logo no lugar da foto e duas linhas de texto. Inclina com o mouse.

## A escolha de idioma, em duas vistas

- **Lista**:
  - a busca procura pelo nome do idioma, no seu idioma, em inglês, pelo país ou pelo código;
  - embaixo de cada idioma, o nome e o país no idioma de quem lê ("Alemão · Alemanha");
  - o código vira o "olá" da língua quando apontado ("Hallo", "Γεια σας", "こんにちは");
  - as setas andam pela lista.
- **Mapa**:
  - a projeção **Equal Earth**, de áreas iguais: a África e a América do Sul aparecem no tamanho que têm;
  - abre com o **Sul em cima**, como a "América invertida" de Joaquín Torres García ("nuestro norte es el Sur"), e tem o **Norte em cima** ao lado. A troca gira o mapa, e os nomes ficam em pé;
  - os 30 países da escolha são clicáveis; o seu fica na cor de acento;
  - no celular, o primeiro toque mostra o idioma no cartão embaixo do mapa, e o segundo escolhe.
- **O mapa** só carrega quando alguém abre a escolha (31,6 KB).
- **As palavras novas** estão nos 22 idiomas, traduzidas por mim, sem revisão de quem fala cada um.

## Consertos achados no caminho

- **A linha das profissões** no topo não quebrava e, em grego, empurrava a página para o lado a 320 px. Conferido nos 22 idiomas: nenhuma rolagem lateral.
- **Uma carinha triste no canto da tela**: no modo de desenvolvimento, o filtro "Película" perdia o contexto 3D, e o Chrome desenhava a carinha. No site publicado isso não acontecia; agora não acontece em lugar nenhum.
- **As datas**: eu tinha marcado "13/out" no código de hoje; corrigi para 12/out.

## Conferido

- `npm run check` e o build numa cópia limpa.
- Com a placa de vídeo:
  - a escolha em 1440, 1280, 390 e 320 px, em português, japonês, alemão e grego;
  - a busca, o mapa, a virada, o toque e as setas.
- A logo, com o filtro funcionando: continua porcelana, sem estourar.

## Pendente, como você pediu

- O `tarefas.md` com as ideias e a resposta à crítica ("showy e brega… não reflete individualidade") esperam os projetos novos do vitorpetri e do brunopetri.
- A recapitulação de onde mora cada coisa ficou na conversa, não aqui, porque este repositório é público.

---
[[0 Índice|Índice]] · ← [[082 — A logo que não estoura, o painel de Ajustes e a entrada do menu|082]] · [[084 — O menu em duas barras, os ícones de grãos, o céu e a poeira da logo|084]] →
