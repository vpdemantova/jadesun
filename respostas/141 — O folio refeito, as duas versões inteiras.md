# 141 · O folio refeito, as duas versões inteiras
#estudio #design #3d #movimento #celular #espera-voce

> **Espera você:** abra as duas versões e diga qual fica. Basta responder "I", "II" ou o que mudar. Depois disso eu publico a escolhida na Vercel.

## O pedido (03/nov/2026)

> *"é para ter webgl/gpu/glsl/shaders/particulas/bibliotecas mais avançadas e interações sublimes. voce fez um site de bebe, sinceramente, nao é normal esse resultado, é pessimo, nao entendi mesmo.. isso nao é site de studio de premio.. nada diagramado, nada certo, nao tem as duas versões, só a primeira, e nunca pensei em ver algo tao mal feito"*

## O que estava errado (o meu erro)

- **As duas versões:** li "1 + 2" como a 2 escondida dentro de uma face da 1. Eram duas versões inteiras, para comparar.
- **A forma 2:** era uma maquete branca, longe do "bem realista" do pedido de 1º/nov.
- **A diagramação:** a interface usava pílulas e uma folha de vidro flutuante, os tiques que ele já tinha recusado no Portal Solar. O texto não era diagramado em grade.

## O que eu fiz

- **A entrada:** duas portas lado a lado, papel e noite. A que recebe o cursor se abre.
- **I · A Forma:** o sólido de Dürer (*Melencolia I*, 1514) em vidro, sobre a página impressa.
  - Não é uma malha. Um shader GLSL lança um raio por pixel contra os oito planos do sólido.
  - De fora, o vidro refrata a palavra impressa, com franjas de prisma na saída. A sombra cai no papel.
  - Por dentro, as faces são espelhos (um caleidoscópio). A face de cada seção é a janela com a imagem: a gravura, as obras, a nave do Scriptorium, o quadrado mágico, a planificação.
  - Na carga, 65 mil partículas, simuladas na placa de vídeo, se reúnem na forma.
  - Entrar: a face de cima se desfaz em pó e a câmera passa.
  - O fim é a forma vista de fora: o texto se esconde, o sólido gira e se desmonta.
- **II · O Scriptorium:** um salão cisterciense de 8 × 24 m ao amanhecer, com abóbada de berço, quatro janelas ao sul, os nichos dos livros, o atril, as mesas dos escribas, a arca, a lanterna e o sólido no chão, ao sol, como na gravura.
  - Modelado em Blender por código. A luz foi assada no Cycles e limpa pelo OIDN.
  - Texturas e modelos do Poly Haven, todos CC0.
  - No navegador, a pedra entra nítida por projeção triplanar. Os feixes de sol são analíticos, e a poeira só acende dentro deles.
  - As velas tremem, a porta se abre e a exposição muda por estação, como o olho que se acostuma.
  - Na mesa, uma pena 3D escreve o manifesto com a Hershey Script, com a capitular em vermelho e a sombra da pena na página. Depois, quem visita escreve na página com o cursor.
- **As duas versões juntas:**
  - Cada seção é uma tela composta numa grade de 12 colunas, com entrada a cada chegada: os títulos sobem de trás de uma linha, e a grade aparece na passagem.
  - As letras são Instrument Serif e Instrument Sans, com o rubro dos manuscritos como único destaque.
  - Há português e inglês, som feito na hora (começa desligado) e endereço por seção (`#obras`).
- **Conferido** no Chrome com a placa de vídeo do Mac:
  - no computador e no celular;
  - com movimento reduzido e sem WebGL (as telas viram uma página corrida, com as imagens);
  - sem erros no console;
  - as duas versões rodam a cerca de 110 quadros por segundo em 1440 × 900 num M2, e a resolução se ajusta sozinha.

## Onde ver

- **No artifact privado:** o link está na conversa. Abre em qualquer aparelho.
- **Neste Mac:** dois cliques em `~/www/scriptorium/folio/ver.command`.

## Como seguir

- **Escolher:** responda "I", "II" ou o que mudar.
- **Publicar:** depois da escolha, a versão escolhida vai para a Vercel (projeto `scriptorium`), com o seu "pode publicar".

---
[[0 Índice|Índice]] · ← [[140 — O folio do Scriptorium Studio, a forma 1 com a 2 dentro|140]]
