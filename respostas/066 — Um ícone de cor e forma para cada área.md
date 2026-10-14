# 66 · Um ícone de cor e forma para cada área
#design #menus

**66. "Que o ícone de cada seção, área, seja de uma cor e formato diferente, mantendo a variação do quadrado, pra diferenciar nas abas abertas" (04/out/2026).**

- **Cada página tem agora o seu ícone de aba**, sempre uma variação do quadrado sobre o mesmo fundo escuro arredondado do `icone.svg`:

  | Página | Forma | Cor |
  |---|---|---|
  | Agora (`hoje` e `index`) | o losango original | vermelho |
  | Domino | mosaico 3 × 3 | amarelo |
  | Jardim | folha | verde |
  | Atlas | moldura | azul |
  | Biblioteca | dois quadrados sobrepostos | anil |
  | Linha do tempo | degraus | ciano |
  | Falta | canto faltando | cinza |
  | Eu (e o `album`) | quadrado pequeno sobre um maior | rosa |
  | Casa | quadrado com telhado | âmbar |
  | Estante | lombadas | marrom |
  | Guarda-roupa | duas portas | violeta |
  | Carta | carta 63 × 88 inclinada | verde-água |
  | Protetor | quadrados concêntricos | creme |
  | Copiar | dois quadrados | oliva |
  | Celular | aparelho | creme |

- **Feito no fim do `tema.js`** (bloco "O ÍCONE DE CADA PÁGINA"), que já abre todas as páginas: o SVG vai embutido (`data:`), troca o `link rel="icon"` depois que a página carrega, e vale também no site exportado, sem arquivo novo. Página nova: uma linha em `PAGINAS`. O `icone.svg`, o `apple-touch-icon` e o manifesto continuam iguais (a instalação no celular segue com o ícone da casa).
- **Testado:** prancha com os 15 ícones a 64 e a 16 px; nas páginas Domino, Jardim, Casa, Carta e Agora fica um ícone só, o certo. Cópia de antes: `dados/versao-2026-10-04-antes-dos-icones/tema.js`.

---
[[0 Índice|Índice]] · ← [[065 — O Fichário, a primeira carta|065]] · [[067 — Evitar abas duplicadas do Agora|067]] →

---
[[0 Índice|Índice]] · ← [[065 — O Fichário, a primeira carta|065]] · [[067 — Evitar abas duplicadas do Agora|067]] →
