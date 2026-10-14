# 63 · Um mundo 3D só, as portas da vida e o menu Tudo
#casa #3d #menus

**63. "A parte 3D está muito mal feita, deve ser tudo no mesmo ambiente! … as views devem ficar integradas e fixas quando entro em uma área e quando organizo minha vida com base nela! … mais UX! … e que o Jadesun acompanhe esse design." + "não sei como está a situação toda … com aquele menu maior e máximo, com o grande sistema de tags" (29–30/set/2026)**

As escolhas dele: tudo dentro da Casa; um menu novo que junta tudo; e quatro portas da casa para a vida (escrivaninha → estudos, piano → música, janela/planta → Jardim, quadro e porta-retrato → Atlas e Eu).

**Um mundo só:**
- **A Estante e o Guarda-roupa de verdade agora moram dentro da Casa.** Com os livros e as roupas reais, nos móveis ligados, no lugar das caixas genéricas.
- **Os mesmos arquivos servem os dois modos.** `estante3d.js` e `guarda-roupa3d.js` viraram módulos com `montar(ctx)`: sozinhos (`estante.html?sozinha=1`, `guarda-roupa.html?sozinha=1`) funcionam como antes; embutidos, usam o palco, a luz e o laço da casa.
- **`casa-areas.js` (novo) cuida das áreas:**
  - monta cada área no móvel dela, e o móvel assume o tamanho real (a estante tem 3,18 m);
  - ao tocar, a câmera voa até a frente da área;
  - na chegada troca o referencial (a casa passa a ser desenhada em volta da área), e a área assume a câmera e o mouse com o código dela;
  - Esc ou a seta voltam para casa.
- **A vista da área fica fixa:**
  - a câmera não recua além da parede em frente;
  - o giro do guarda-roupa é limitado;
  - as paredes e os móveis entre a câmera e a área somem;
  - aparece o forro.
- **Visto da casa, o guarda-roupa fica de portas fechadas; ao entrar, elas abrem uma a uma.** O manequim só aparece com os Looks abertos e a caixa de doação fica em cima do móvel.
- **Os endereços antigos continuam valendo.** `estante.html` e `guarda-roupa.html` abrem a casa já dentro da área, com `?livro=` e `?peca=` para chegar direto num livro ou numa peça.

**As portas da vida (`casa-portas.js`, novo):**
- **Escrivaninha** abre "Hoje na escrivaninha":
  - os dias até a 1ª fase;
  - o alerta dos vídeos de Música;
  - o roteiro de hoje (da mãe);
  - as tarefas simples;
  - os próximos itens do Checklist, marcáveis;
  - "Abrir o Agora inteiro".
- **Piano e estante de partitura** abrem a Música: o checklist dos vídeos, marcável no próprio arquivo. A rota nova é `/api/musica` (`lib/musica.mjs`, com cópia em `dados/`).
- **Quadro na parede** (móvel novo, um mapa antigo) abre o **Atlas**, e **porta-retrato** (móvel novo) abre o **Eu**. Os dois abrem numa folha por cima da casa: é a própria página, com `?embutido=1`, que esconde o menu dela.
- **Planta** leva ao **Jardim**.
- **A "Minha casa" de exemplo cresceu para 4,4 × 4,0 m**, para caber a estante de verdade, e ganhou quadro, porta-retrato e estante de partitura.

**Acabamento e experiência de uso na casa:**
- **Oclusão de ambiente (GTAO do Three.js r160, MIT, em `vendor/`)** no palco comum: cantos e contato dos móveis ganham profundidade. Fica desligada no celular e é a primeira coisa a sair na qualidade adaptativa.
- Partitura de verdade na estante de partitura, e forro nas vistas de dentro.
- **Desfazer e refazer na Planta** (Ctrl+Z / Ctrl+Shift+Z e botões). Edições rápidas seguidas viram um passo só.
- **Atalhos:**
  - as teclas 1 a 4 trocam a vista;
  - Enter entra no móvel selecionado;
  - ao passar o mouse, uma etiqueta diz o que cada móvel abre.
- **Três dicas na primeira visita** (não voltam) e um aviso de "montando a estante e o guarda-roupa…".
- **A barra de cima da casa tem atalhos para cada área e porta.** No celular ela fica em 3 linhas.

**O menu "Tudo" (`tudo.js` e `tudo.css`, novos, em todas as páginas):**
- **Abre pelo botão Tudo** (menu de baixo e barra de cima) ou pelo atalho **Ctrl+K**.
- **A situação agora:**
  - os prazos com contagem (vídeos de Música, 1ª fase);
  - o Checklist em %;
  - o que está pronto;
  - o que espera ele.
- **Todos os lugares** (20).
- **Uma busca só:** livros, roupas, looks, casas e cômodos, itens do Checklist e fichas (`/api/buscar`).
- **As tags de livros e roupas juntas**, com filtro.
- **Cada resultado leva ao lugar:** um livro abre a casa na estante com ele na mão.
- **Rota nova `/api/cofre`:** o link para o Mapa de Tudo no Obsidian.

**O Jadesun inteiro no mesmo design (`vidro.css`, novo): o acabamento "Casa", padrão.**
- **É um acabamento somado por cima do Fino**, com vidro fosco quente e ouro no lugar do vermelho:
  - rótulos em Archivo (sem a letra de máquina em todo canto);
  - barra de cima flutuante;
  - menu de baixo em pílula de vidro;
  - cartões de vidro.
- **Vale nos temas Automático, Papel e Escuro.** Os outros temas mantêm as cores deles e ganham só o vidro.
- **Em Personalizar → "Acabamento do Fino": Casa ou Simples.** O Clássico continua intacto.
- **O item do menu de baixo "Estante" virou "Casa"**, porque a estante mora na casa. A Estante está a um toque, na barra de cima da casa, e no Tudo.

**Defeitos meus achados nos testes e corrigidos:**
- as medidas das áreas saíam no espaço do mundo e não no do móvel;
- o laço não chamava o voo quando havia redesenho pendente;
- o voo andava por quadro, e num computador lento se arrastava (agora vai pelo relógio);
- as paredes recém-montadas eram medidas antes de o Three.js calcular a posição delas, então a parede na frente do guarda-roupa não sumia;
- a câmera da estante recuava 5 m, para fora do quarto;
- duas vezes a barra invertida de uma expressão regular se perdeu no caminho;
- o quadro flutuava de costas quando a parede dele estava cortada na maquete.

**Testado em Edge headless**, num caderno de cópia e, só para leitura, no caderno de verdade:
- entrar na estante e no guarda-roupa e voltar com Esc;
- `estante.html?livro=Teogonia` abre a casa com o livro na mão;
- escrivaninha → piano, com item marcado e desmarcado no arquivo;
- a folha do Atlas sem menu duplicado;
- as casas dos sonhos recebendo as áreas;
- o fluxo inteiro da Planta;
- desfazer e refazer;
- o Tudo (Ctrl+K, busca, tag);
- Agora, Eu e Atlas no acabamento Casa, escuro e claro;
- celular a 390 px;
- fotos em qualidade máxima.

**Ainda não feito:**
- rodapés e batentes das portas;
- a partitura e o quadro como fotos reais do Commons;
- a Estante dentro do Jardim;
- "Esperando você" no Tudo ainda é uma lista escrita no `tudo.js` (atualizar junto com o Mapa de Tudo).

---
[[0 Índice|Índice]] · ← [[062 — O lançamento só preparado (29 set)|062]] · [[064 — O Domínio, o módulo de expandir das áreas|064]] →

---
[[0 Índice|Índice]] · ← [[062 — O lançamento só preparado (29 set)|062]] · [[064 — O Domínio, o módulo de expandir das áreas|064]] →
