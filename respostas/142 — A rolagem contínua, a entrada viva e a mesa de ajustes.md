# 142 · A rolagem contínua, a entrada viva e a mesa de ajustes
#estudio #design #movimento #3d #espera-voce

> **Espera você:** quando quiser refinar, abra o mapa das partes. São dois cliques em `~/www/scriptorium/folio/ver.command` e depois http://127.0.0.1:4430/partes.html. Ajuste pelo painel, escreva as notas e grave. Depois me diga o que gravou, e eu leio as notas e faço.

## O pedido (03/nov/2026, à noite)

> *"UFA! UAU! MILAGRE! a home deve ser melhor, e ser animada, as duas cenas, quase que como está, mas interativa e super caprichada / o que falta é mais fluidez e transicao, esta meio engessado / as transicoes e animados do modo I esta confusa e rapida, nao da pra acompanhar o que acontece - mas esta quase! / ahh e a logo pode ser esse simbolo, construa ela em svg e inclua! / preciso melhorar muitas coisas! pra isso me ajude a ter um controle e um gerenciamento de cada parte, pra ajustar e refinar!!!"*

Junto veio uma foto da janela leste do Scriptorium: o óculo sobre a janela em arco.

## O que eu fiz

- **A passagem contínua:** a roda, o dedo e as setas movem uma posição contínua.
  - A câmera anda junto com a mão. Ao soltar, assenta na tela mais próxima, com uma mola amortecida, sem tranco no começo nem no fim.
  - O texto sai quando o movimento começa e se compõe quando assenta.
  - Num mouse de roda, cada clique passa uma tela.
- **A versão I, em etapas que se acompanham:** o sólido se vira, a câmera chega, a face de cima se desfaz em pó, a câmera atravessa e só então a janela da seção assenta na placa. A saída faz o caminho de volta pela mesma face. A rolagem conduz cada etapa no ritmo de quem rola.
- **A versão II:** a câmera vai do portal aos degraus. A porta se abre conforme a rolagem avança, a câmera atravessa e o olho se acostuma ao escuro.
- **A entrada viva:** as duas metades rodam as versões de verdade, em modo vitrine.
  - O cursor entra na cena: a luz segue no cristal, e a poeira foge na nave.
  - A metade que recebe o cursor se abre, e a cena reage: o sólido gira mais rápido, e a câmera avança na nave.
  - O clique leva a cena à tela inteira (View Transitions). No celular, ficam as fotos.
- **A logo:** o óculo sobre a janela em arco, em SVG (`comum/simbolo.svg`). A pedra do derrame é a tinta, e a luz fica vazada. Aparece na marca, na carga, no fio do meio da entrada e no ícone da aba.
- **A mesa de ajustes:** `?ajustes` no endereço abre o painel ao lado de qualquer versão.
  - Cada parte tem os seus controles ao vivo. São 8 grupos na Forma e 11 no Scriptorium, contando o editor de estação.
  - Na Forma: o vidro, o sólido, o caleidoscópio, as partículas, a página, a passagem, as cores e as letras.
  - No Scriptorium: o ar, a névoa, a poeira, a imagem, as velas, a pena, a porta, a passagem, as cores, as letras e a estação de cada tela, com a câmera livre (arrastar, roda, WASD) e o botão "pegar a câmera".
  - **"Gravar"** escreve o `ajustes.json` da versão (só o que difere do padrão), pelo servidor deste Mac.
  - **As notas** de cada parte são a lista do que refinar.
- **O mapa das partes** (`partes.html`): cada parte de cada versão com o que já foi ajustado, as notas abertas e um link que abre aquela parte com o painel.
- **Conferido** no Chrome com a placa de vídeo, no computador e no celular:
  - a rolagem de trackpad em fotos quadro a quadro, nas duas versões;
  - a entrada com as duas cenas vivas;
  - os dois painéis, o mapa e a gravação, que recusa qualquer arquivo fora dos dois `ajustes.json`;
  - sem erros no console.

## Onde ver

- **No artifact privado:** o link está na conversa, com a nova versão.
- **Neste Mac:** `ver.command`. Para o painel, acrescente `?ajustes` ao endereço de uma versão.

---
[[0 Índice|Índice]] · ← [[141 — O folio refeito, as duas versões inteiras|141]] · [[143 — A marca nova, a família e a Oficina|143]] →
