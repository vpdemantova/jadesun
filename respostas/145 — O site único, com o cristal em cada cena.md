# 145 · O site único, com o cristal em cada cena
#estudio #3d #design #publicacao #desempenho #correcao #erro-meu #espera-voce

> **Espera você:** abrir <https://scriptorium-studio.vercel.app> e dizer, numa linha, o que vem depois.

## O pedido (04/nov/2026)

> *"juntar as duas versões e ir pro ar! uma versão só! quero que o cristal fique no canto do site da construção 3D, e vai mudando de acordo com as cenas, e os projetos devem ser mostrados de maneiras mais criativas!… salve o que você fez agora, duplique para que eu ainda acesse depois"*

Eu propus três maneiras de mostrar as obras. A resposta foi: *"construa esses três!"*. A primeira ficou para os projetos, a segunda para os processos e a terceira onde coubesse melhor, que foi a história.

## O que está no ar

Uma versão só: o salão cisterciense em 3D, com a luz calculada no Cycles. As cenas:
- **O portal:** a fachada ao amanhecer.
- **O manifesto:** a nave, vista da porta.
- **As obras: o livro e a lente.** São seis páginas duplas do livro grande do coro, no atril.
  - À esquerda, a pena escreve o nome e a frase.
  - À direita, a imagem do site entra como iluminura, nas margens dos manuscritos.
  - A folha vira com a rolagem.
  - O cristal sai do canto e vira a pedra de leitura dos leitores medievais, que ampliava a página sob o cursor.
- **A história: os vitrais.** São quatro janelas de grisalha, o vidro branco que o Capítulo Geral de Cister mandava pôr, cada uma com uma só peça vermelha.
  - O scriptorium: a inicial S.
  - A gravura de 1514: o quadrado mágico de Dürer.
  - A letra impressa de 1501: a âncora e o golfinho de Aldo Manuzio.
  - A tela, de 2026: os pixels.

  O sol atravessa o vidro e leva a cor dele ao feixe, à poeira e ao chão.
- **Os serviços:** as mesas dos escribas.
- **O processo: dentro do cristal.** O cristal cresce, e a câmera entra nele. As seis faces são os seis passos:
  1. a gravura do Met;
  2. a planificação a tinta;
  3. a maquete de gesso do salão;
  4. as duas versões lado a lado;
  5. o código do cristal;
  6. o site no computador e no celular.
- **Pessoas, escritos e contato.**

**O cristal do canto:**
- ele muda a cada cena: gira para a face da seção, toma a cor de cada vitral, vira gesso em Pessoas e gravura em Escritos;
- um clique nele abre o índice;
- parado, ele fica quieto, e o brilho de prisma só aparece quando há movimento.

**A marca:** a janela saiu do site. O ícone da aba e a carga são a silhueta do sólido.

## O que ficou guardado

- **No git:** as duas versões de 03/nov, a entrada das duas portas, a marca da janela e a Oficina estão na etiqueta `duas-versoes`.
- **No artifact antigo:** tudo isso continua como estava.
- **Fora do ar:** a Oficina e a identidade continuam no git, à espera.

## Como foi conferido

- **As telas:** as 22 foram fotografadas na placa de vídeo, no computador (1440 × 900) e no celular (390 × 844), aqui e depois no ar, sem erro no console.
- **A velocidade:** todas as cenas rodam a 60 quadros por segundo.
  - A cor dos vitrais pesava nos feixes de luz: 50 ms por quadro na mesa da pena. Agora ela entra uma vez por pixel.
  - A qualidade automática só se ajusta com a cena parada, e volta a subir.
- **A Forma aprovada:** o traçador continua idêntico, byte a byte.

## Dois erros meus, corrigidos

- **A primeira publicação saiu sem o 3D.** O cristal lia os materiais de dentro da pasta da Oficina, que eu tinha deixado fora do ar. A foto do site publicado pegou o erro. Os materiais foram para a pasta comum, e a segunda publicação saiu inteira.
- **Uma publicação caiu no lugar errado.** Uma linha minha que sobrou fez a publicação rodar na pasta errada, e a Vercel ganhou um projeto novo, chamado `folio`, com uma cópia do mesmo site (sem nada privado).
  - O sistema não me deixou apagá-lo.
  - Quando quiser, apague no painel da Vercel: equipe vitordes-projects → projeto `folio` → Settings → Delete.
  - O link da pasta voltou a apontar para o projeto certo.

## Os commits

Ficam locais até o `juntar-tudo.command`:
- **folio:** 6e4e7a3, 0f0b4c2 e c621e9e;
- **este registro.**

---
[[0 Índice|Índice]] · ← [[144 — Blocos e Casas, cada um com a sua cara|144]]
