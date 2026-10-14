# 61 · A Casa em 3D: a planta que vira casa
#casa #3d

**61. A Casa em 3D: "minha casa, eu desenho ela e ela modela a casa, eu faço a planta e ela constrói, do meu quarto, da casa, tudo integrado, e quando clico nos botões ela vai mudando as views!" + "incluir os móveis, as cores, e também planejar casas dos sonhos! outras arquiteturas, referências da Bauhaus, VKHUTEMAS e mundo afora!!" (28/set/2026)**
- **Página nova `casa.html` (+ `casa3d.js`, `casa3d-construir.js`, `casa-modelo.js`, `casa.css`), família do Eu.** A chave do topo agora é "Estante · Guarda-roupa · Casa" nas três páginas, e a Coleção ganhou "Abrir a Casa em 3D →".
- **Quatro vistas, trocadas por botões:**
  - **Planta:** de cima, pra desenhar, com o nome e os m² de cada cômodo.
  - **Maquete:** casa de bonecas. As paredes de fora que ficam de frente pra câmera descem sozinhas até 1,1 m, então dá pra ver dentro de qualquer lado que se gire. O botão troca entre Frente aberta, Paredes baixas e Paredes inteiras.
  - **Fachada:** por fora, com telhado.
  - **Andar:** por dentro, na altura dos olhos. A entrada é pela porta do cômodo. No computador anda com WASD ou as setas e olha arrastando; no celular, com um joystick. As paredes seguram, as portas deixam passar e degraus baixos se sobem.
- **Desenhar (na Planta):**
  - **Cômodo:** arraste, e as medidas aparecem enquanto você arrasta (grade de 10 cm).
  - **Mover:** arraste um cômodo (os móveis vão junto), puxe a borda pra esticar ou arraste um móvel.
  - **Porta e Janela:** toque perto de uma parede.
  - **Móvel:** escolha no catálogo, que encolhe numa linha depois da escolha, e toque na planta.
  - **Apagar:** toque no que quer apagar.
  - Onde dois cômodos se encostam, vira uma parede só.
  - O painel de cada coisa edita: nome, medidas, forma (retângulo, cilindro, cilindro hexagonal, pátio), nível, pé-direito, piso (8 tipos), paredes (cores da paleta do estilo ou vidro, shoji, tijolo, madeira, nenhuma), cor e giro do móvel, duplicar, trocar e apagar.
- **29 tipos de móvel.** Entre eles: cama, futon, escrivaninha, piano vertical e de cauda, estante de partitura, poltrona tubular (homenagem à de Breuer), cozinha e banheiro. **A estante e o guarda-roupa da casa são os dele de verdade:** tocar neles abre as páginas deles, e o painel mostra os números reais (85 livros, 27 peças).
- **Casas:**
  - **"Minha casa"**, a real, começa pelo quarto, com medidas de EXEMPLO marcadas pra ele trocar.
  - **Quatro casas dos sonhos**, simplificadas e "inspiradas em", com fatos conferidos na web e fontes no arquivo:
    - **Bauhaus:** Casas dos Mestres, Gropius, Dessau, 1925–26, UNESCO 1996, com as cores reais da casa Kandinsky/Klee.
    - **Construtivista:** Casa Melnikov, Moscou, 1927–29, dois cilindros com janelas hexagonais. Melnikov ensinou na VKHUTEMAS de 1920 a 1924.
    - **Casa de Vidro:** Lina Bo Bardi, São Paulo, 1951, sobre pilotis, com piso de pastilha de vidro azul.
    - **Japonesa:** medida em tatamis, com shoji, engawa e genkan.
  - "Duplicar pra desenhar" copia uma casa sem mexer na original. Dá pra criar casa em branco e escolher o estilo (Livre, Bauhaus, VKHUTEMAS, Modernismo brasileiro, Japonesa), que muda as cores e os pisos sugeridos.
- **Dados:** `Focos/Minha Casa.md`, com quatro tabelas legíveis (Casas, Cômodos, Portas e janelas, Móveis), editáveis à mão, e as fontes no fim. Rotas `GET/POST /api/casa` (`lib/casa.mjs`). O arquivo é gravado inteiro, com cópia do dia em `dados/`, e a gravação é recusada se o arquivo mudou por fora.
- **Atlas:** fichas novas **Bauhaus** e **VKHUTEMAS** em `5 Groups/`, escritas por mim a partir de fontes (Wikipedia, Bauhaus Kooperation), com 4 imagens do Commons com licença conferida (2 em domínio público, CC BY-SA 3.0, CC BY 2.0). Os livros sugeridos no fim estão marcados "de memória, conferir".
- **Um defeito antigo achado no teste e corrigido também no Guarda-roupa:** duas gravações seguidas podiam dar um "o arquivo mudou fora da página" falso, porque a segunda saía com a versão velha. Agora o pedido é montado na hora do envio.
- **Testado em Edge headless, num caderno de cópia:**
  - o modelo puro (`node testes/casa-modelo.mjs`);
  - desenhar cômodo, porta, janela e piano; mover o cômodo com o piano junto; renomear (as portas acompanham) e trocar o piso;
  - salvar no arquivo e o 409 com versão velha;
  - no Andar, as paredes segurando e a porta deixando passar;
  - as vistas por botão, duplicar casa e tocar na estante (abre a Estante);
  - celular a 390 px, sem rolagem lateral;
  - fotos em qualidade máxima das casas;
  - regressão da Estante e do Guarda-roupa.
- **NÃO feito ainda:**
  - andares empilhados na Planta (hoje uma casa de dois pisos se faz com cômodos em nível diferente, mas a Planta mostra tudo junto);
  - escada;
  - portas de correr;
  - telhado inclinado;
  - as medidas reais do quarto dele (faltam: ele mede ou me passa).

---
[[0 Índice|Índice]] · ← [[060 — A Estante no padrão dos projetos de ouro|060]] · [[062 — O lançamento só preparado (29 set)|062]] →

---
[[0 Índice|Índice]] · ← [[060 — A Estante no padrão dos projetos de ouro|060]] · [[062 — O lançamento só preparado (29 set)|062]] →
