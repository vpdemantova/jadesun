# 39 · O tablet do Jardim
#jardim #3d

> Seção original no PERFIL.md: 13. O tablet do Jardim (23/set/2026)

**39. Sexta ferramenta no Jardim: um tablet 3D que abre a biblioteca de aprender a codar.** Pedido dele: *"o jardim precisa ter aquele tablet... vai ser um dispositivo que fica no canto esquerdo da tela, que o personagem pega e usa, eu uso a interface, ela fica reta na tela... como aprender cada coisa, puxaremos do nosso blessednotebook, como codar, as bibliotecas, os exemplos"*. Perguntei duas coisas antes de construir: onde o tablet mora (escolhido: ferramenta selecionável no canto, como o telescópio — não objeto solto no mundo) e o que ele mostra primeiro (escolhido: aprender/codar, notícias e ativismo ficam pra depois).

- **O objeto 3D:** `tabletGrupo` em `jardim3d.js` — uma tela com `THREE.ShaderMaterial` próprio (`uTempo`/`uAceso`: scanline, vinheta, pulso de "ligado"), preso à **câmera** (não à cena — por isso `cena.add(camera)`, senão a câmera nunca é percorrida no render), no canto inferior esquerdo, só visível quando a ferramenta "Tablet" está selecionada (6ª opção na barra, atalho tecla `6`).
- **O conteúdo:** nada novo pra indexar — reaproveitei o que já existe. `2 Academy/2 Guias - Expressões Manifestas/c Computing` já tem os "casos de uso" (Portal Solar, Site Pessoal) e o "Practical" (HTML/CSS/JavaScript, bibliotecas, exemplos), já indexado por `lib/biblioteca.mjs` e servido por `/api/biblioteca` e `/api/ficha` — o tablet só filtra por essas pastas e lista por grupo.
- **A interface:** `.jd-tablet-tela` (painel plano, vidro fosco, `backdrop-filter`) cobre a tela inteira ao clicar com a ferramenta ativa — cabeçalho "Aprender a codar", lista de lições agrupada por pasta, cada uma abre o markdown de verdade (`MD.render`, mesmo motor do resto do app) com botão "← Voltar" pra lista. Fecha com Escape ou X, como o resto dos painéis do Jardim.
- **Bug achado e corrigido durante o teste:** o atalho numérico de ferramentas era travado em `k <= '5'`, ignorando a 6ª; virou genérico (`k <= '9' && +k <= FERR.length`). Outro: a dica flutuante (`.jd-dica`) tinha z-index acima do painel do tablet e ficava por cima da lista, sobretudo em telas estreitas — `.jd-tablet-tela` ganhou z-index próprio (7), acima de tudo.
- **Testado em Edge headless:** ferramenta 6 seleciona e destaca "Tablet" na barra; clicar abre o painel com a lista certa (Casos de Uso → Practical); abrir "JavaScript — a Lógica Viva" traz o corpo certo (1862 caracteres, título batendo) e "Voltar" retorna à lista; Escape fecha; sem erro de console em nenhum passo; 1440 px e 390 px sem rolagem horizontal, sem sobreposição depois da correção do z-index.
- **Em aberto:** só a trilha de aprender/codar por enquanto — notícias e ativismo (a outra metade do pedido original) ficam pra uma rodada futura, a pedido dele mesmo.

---
[[0 Índice|Índice]] · ← [[038 — O cronômetro por bloco do Meu dia|038]] · [[040 — A ecovila no Jardim|040]] →

---
[[0 Índice|Índice]] · ← [[038 — O cronômetro por bloco do Meu dia|038]] · [[040 — A ecovila no Jardim|040]] →
