# 143 · A marca nova, a família e a Oficina
#estudio #design #marca #pedido-grande #copia #espera-voce

> **Espera você:** até 14/nov, renove o domínio montagnedejade.org. Depois, quando puder, dê dois cliques no `juntar-tudo.command` (os envios ao GitHub de hoje pararam no chaveiro) e arraste a pasta `~/www/copias-do-codigo/2026-11-03` para o seu Google Drive.

## O pedido (03/nov/2026, à noite)

> *"a logo em svg que voce fez esta pessima - era so pra abstrair a forma e nao fazer ela quase que fiel.. mais minimalista / crie para mim, um sistema de design e criacao de posters e logos do scriptorium studio. nele eu vou poder manipular a forma em cristal e em diferentes materiais e juntar com o texto que eu quiser e fazer postagens pras redes! identidade visual ao extremo."*

Junto vieram outros pedidos, de agência inteira:
- os cartões de visita;
- uma caixa de ferramentas de design;
- uma biblioteca que ensine como cada projeto é feito;
- os casos de clientes;
- a empresa de curadoria;
- um arquivo de ideias;
- os primeiros clientes.

Eles viraram um plano em cinco ondas, para nada se perder. Esta é a primeira.

## O que eu fiz

### A marca nova

- **Os estudos:** a janela da parede leste (o óculo sobre o arco) virou oito estudos, tirados da geometria e não desenhados à mão. Eles estão numa folha de comparação:
  - em 16, 24, 32 e 48 px, no papel e na noite;
  - como avatar, como ícone e como cartaz;
  - borrados e em pixels.
- **A escolha:** o estudo III, o arco de volta perfeita num retângulo áureo (w × φw), com o óculo de diâmetro w/φ vazado no centro do arco.
  - É uma figura só, que não lembra nenhum ícone comum.
  - O estudo I parecia o "i" de informação, e o VII, o ícone de pessoa.
- **A família:** o selo com o nome em volta (cada letra em contorno, fechando os 360°), o sólido de Dürer em traço, cheio e planificado, a fachada (com as medidas lidas do modelo 3D), as assinaturas e o monograma.
- **O gerador:** um só, `ferramentas/marcas.mjs`. Ele escreve os SVG e troca a marca nas páginas. Duas rodadas dão o mesmo resultado, byte a byte.
- **O manual da marca:** a construção áurea, o respiro, os mínimos, as cores com o contraste medido, a família e o que não fazer.

### A Oficina (o núcleo)

- **O que é:** a prancheta da identidade. O sólido de Dürer é o mesmo traçador da Forma, e o vidro refrata as camadas de baixo, como o texto do pôster.
- **Os materiais:** são 12 (cristal, fumê, fosco, pedra, mármore, ouro, bronze, obsidiana, gesso, papel, tinta e buril).
- **O documento:** é um JSON, e o mesmo código faz a prévia, a exportação e as provas.
- **As provas:** cada combinação é desenhada duas vezes na GPU e precisa dar o mesmo hash. As letras precisam ser as de verdade, o miolo do sólido precisa mudar, e o lado de fora precisa ficar igual.
- **O estado:** as duas primeiras combinações estão prontas, o post com cristal e o cartaz A3 com ouro.
- **Uma decisão de diretor:** a obsidiana, sobre o cartaz preto, sumia. Um espelho negro numa mesa negra reflete a mesa. Ela vai para o cartaz claro, e o concerto escuro ficou com o ouro.
- **A Forma aprovada não mudou:** o traçador foi dividido em pedaços, e a soma dá o mesmo texto de antes, byte a byte (`ferramentas/conferir-forma.mjs`).

### O resto da onda

- **O trilho do folio:** as linhas mais grossas, o hover e as setas.
- **Os portões de qualidade:** dez portões antes de qualquer entrega.
- **A cópia de dois projetos de cliente:** eles só existiam neste Mac, sem GitHub. Viraram duas cópias inteiras (git bundle), testadas: restauram o mesmo commit e todos os arquivos. A cópia para a nuvem não foi permitida daqui, por isso o pedido acima.

## Os commits

O folio está no repositório privado, e os commits ficaram locais porque o envio falhou no chaveiro:
- 852b143, o trilho;
- 41b863c, a família de marcas;
- 83e0b51, a Oficina;
- 771a19f, a entrada.

O folio ainda não foi para a Vercel: isso espera o seu "pode publicar".

## O que vem depois

A segunda onda, em novembro, sem tomar hora sua:
- as 12 combinações;
- o SVG e o PDF;
- os 6 cartões de visita testados;
- a caixa de ferramentas: os pigmentos com a história, a roda de cores, as proporções, as grades e a tipografia.

---
[[0 Índice|Índice]] · ← [[142 — A rolagem contínua, a entrada viva e a mesa de ajustes|142]] · [[144 — Blocos e Casas, cada um com a sua cara|144]] →
