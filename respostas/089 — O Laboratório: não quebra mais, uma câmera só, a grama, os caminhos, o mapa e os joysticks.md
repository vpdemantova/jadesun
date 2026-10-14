# 89 · O Laboratório: não quebra mais, uma câmera só, a grama, os caminhos, o mapa e os joysticks
#vitordemantova #laboratorio #3d #correcao #publicacao #pedido-grande

**"o boneco está com as pernas quebradas… crie uma transição smooth e gradual entre as duas câmeras… pedrinhas e pedregulhos nos caminhos… uma url pra cada seção do laboratório… quando eu vou de um lugar pro outro… o laboratório quebra e não renderiza mais"** (da lista de 12/out/2026, perto da meia-noite)

## No ar

- **www.vitordemantova.com**: commit `e08a313`, às 11h02 de 13/out.

## O que mudou

- O Laboratório não fica mais preto na segunda entrada: no primeiro quadro, o relógio do 3D andava zero e a velocidade do boneco virava 0 ÷ 0. Por segurança, o mundo também se refaz sozinho se a placa de vídeo derrubar o contexto dele.
- O boneco: o joelho dobra no balanço, o quadril não escorrega, os braços sobem e se abrem no pulo; o pulo solta a onda de pedras acesas no saguão.
- Uma câmera só: a de cima é a mesma câmera, muito longe e com a lente quase fechada; entre as duas, ela viaja. A entrada desce do alto até o boneco.
- A grama em todo lugar (touceiras até 96 m em volta; mais longe, o chão gramado com o vento); pedrinhas de borda e cascalho nos caminhos.
- Um endereço para cada lugar e para o mapa (`#laboratorio/quimica`, `#laboratorio/mapa/quimica`); o mapa em três seções, abrindo derretendo.
- Os controles se escondem sozinhos depois de 12 s; três jeitos de andar (o teclado, 1 joystick ou 2); a barra da câmera de cima (girar, zoom, "Ao boneco").
- O botão da hora com o tamanho fixo (o nome mais comprido quebra em duas linhas) e a interface numa grade.
- Ao sair de um lugar, tudo desliga devagar; o telhado da Química não pisca mais.

## Conferido

- `npm run check` e o build numa cópia limpa.
- Com a placa de vídeo: o boneco, as câmeras, a grama, o mapa, os joysticks e o celular em 390, 360 e 320 px; 60 quadros por segundo na build de produção.

---
[[0 Índice|Índice]] · ← [[088 — Tudo abre derretendo|088]] · [[090 — O Editorial: a logo de papel inteira e o pied-de-poule de um dente só|090]] →
