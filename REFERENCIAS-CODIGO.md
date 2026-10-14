# Referências de código do Portal Solar

13/out/2026. As fontes técnicas de cada parte do Jadesun, para conferir, aprender e reusar nos próximos projetos.
Cada link foi aberto em 13/out/2026. **⊘** = o site barra leitura automática (403) e abre normal no navegador.
As referências de estética e design (acervos, cartazes, cor, web) estão no caderno, em
`2 Academy/2 Guias - Expressões Manifestas/b Design/Referências de Ouro.md`, e o estudo das 83 agências em `…/b Design/Agências/`.

## 1. Onde cada técnica mora

| Arquivo | O que faz | De onde vem |
|---|---|---|
| `luz.js` | Motor de shader: tenta **WebGPU (WGSL)**, cai para **WebGL2 (GLSL)**, e sem os dois deixa o canvas vazio. Triângulo de tela cheia, 128 bytes de uniforms, alfa pré-multiplicado, pausa fora da tela, resolução que cai sozinha, um quadro só com "menos movimento", recriação quando a placa perde o dispositivo. `?webgl` no endereço força o WebGL2 (para testar). | [WebGPU, W3C](https://www.w3.org/TR/webgpu/) ⊘ · [WGSL, W3C](https://www.w3.org/TR/WGSL/) ⊘ · [WebGPU API, MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) · [`configure` e `alphaMode`, MDN](https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure) · [WebGPU Fundamentals](https://webgpufundamentals.org/) · [WebGL2, MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) · [WebGL2 Fundamentals](https://webgl2fundamentals.org/) · [explicação do WebGPU (gpuweb)](https://gpuweb.github.io/gpuweb/explainer/) |
| `luz-efeitos.js` | Os efeitos, nas duas línguas: **quadrado** (as rachaduras do Quadrado Negro por voronoi), **campo** (fbm com dobra de domínio), **sol** (coroa em fbm polar), **mandala** (quadrado, círculo e cruz em simetria polar, por funções de distância), **poeira** (estrelas numa grade embaralhada por hash). | Inigo Quilez: [distâncias 2D](https://iquilezles.org/articles/distfunctions2d/), [bordas de voronoi](https://iquilezles.org/articles/voronoilines/), [fbm](https://iquilezles.org/articles/fbm/), [dobra de domínio](https://iquilezles.org/articles/warp/), [paletas](https://iquilezles.org/articles/palettes/) · The Book of Shaders: [ruído](https://thebookofshaders.com/11/), [ruído celular](https://thebookofshaders.com/12/), [fbm](https://thebookofshaders.com/13/) |
| `indice.js` | O Índice que abre do Quadrado: diálogo com o fundo **inerte**, foco preso dentro, Esc fecha e o foco volta a quem abriu. | [Padrão de diálogo modal, APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) ⊘ · [`inert`, MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert) |
| `casca.css` | Menu simétrico, o anel de "segurar" (propriedade CSS registrada) e a **passagem entre páginas**: o Quadrado fica parado e o sol do menu desliza da porta antiga para a nova. | [`@property`, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property) · [View Transition API, MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) · [entre documentos, Chrome](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) · [suporte (caniuse)](https://caniuse.com/view-transitions) |
| `md.js` | Notas de rodapé do Obsidian (`[^1]`) viram notas com papéis de livro digital. | [DPUB-ARIA 1.1](https://www.w3.org/TR/dpub-aria-1.1/) ⊘ |
| `leitor.js`, `leitor.css` | Leitura em três colunas, imagens presas à referência no texto, marcas por trecho, "parei aqui" no ponto do clique, modo página com contagem, painéis do celular. | [`caretPositionFromPoint`, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint) · [`TreeWalker`, MDN](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker) · [colunas, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Multicol_layout) · [scroll snap, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap) · [IntersectionObserver, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) |
| `abertos.js`, `leituras.js` | Várias leituras abertas, dormir, grupos, marcas, links e histórico; tudo neste navegador, com o botão que leva para o caderno. | [`localStorage`, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |
| `doar.js`, `doar.css` | Filtros que se apertam (`aria-pressed`), "ver mais" (`aria-expanded`), contagem anunciada (`role="status"`); o **Pix** montado aqui (BR Code com CRC16-CCITT, conferido contra o exemplo do manual: `1D3D`) e o QR; ingressos com recortes por máscara. | [Manual do BR Code, Banco Central](https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf) · [Padrões para Iniciação do Pix, BC](https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf) · [Pix, BC](https://www.bcb.gov.br/estabilidadefinanceira/pix) · [QR da EMVCo](https://www.emvco.com/emv-technologies/qr-codes/) · [qrcode-generator (MIT)](https://github.com/kazuhikoarase/qrcode-generator) · [botão, APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/) ⊘ · [disclosure, APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) ⊘ · [`mask`, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask) · [`color-mix()`, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix) · [`clipboard.writeText`, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) |
| `caminho.js`, `caminho.css` | O caminho de cada área no Hoje: a trilha na ordem dos pré-requisitos (de `lib/areas.mjs`), matérias que abrem e fecham. | [disclosure, APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) ⊘ |
| `protetor-luz.js` | O protetor de tela: os quatro modos de luz (usa `luz.js`), os lembretes de volta na tela, os painéis que nascem do Quadrado e o modo "por cima da página". | (as fontes de `luz.js`) · [Page Visibility, MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) |
| `lenis.js` | Rolagem suave. | [Lenis (MIT)](https://github.com/darkroomengineering/lenis) |
| `vendor/` | 3D do Jardim, da Casa e da Estante; estrelas do céu. | [three.js (MIT)](https://threejs.org/) · [d3-celestial (BSD-3)](https://github.com/ofrohn/d3-celestial) |

## 2. As regras que o Portal segue (WebGPU, WebGL e acessibilidade)

1. **Nunca exigir WebGPU.** Testar `navigator.gpu` e o adaptador; sem ele, WebGL2; sem os dois, a página funciona igual, só sem a luz. O shader é enfeite: **texto e botões são sempre HTML**.
2. **Respeitar quem pede menos movimento** (`prefers-reduced-motion`): um quadro só, sem passagem entre páginas, sem animação de entrada. Também respeitar a economia de dados (`saveData`): resolução menor e placa em modo econômico. [MDN, reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) · [MDN, saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)
3. **Não desenhar o que ninguém vê:** aba escondida ou canvas fora da tela, o motor para.
4. **Resolução com teto:** densidade de pixel limitada (1,5) e queda automática se o quadro passar de ~22 ms várias vezes.
5. **Compor certo com a página:** alfa pré-multiplicado nos dois motores.
6. **Sobreviver à perda da placa:** WebGPU (`device.lost`) e WebGL (`webglcontextlost`) desligam o efeito sem quebrar a página.
7. **Diálogos de verdade:** fundo inerte, foco preso, Esc fecha, foco volta. **Alternâncias** com `aria-pressed`, **abre e fecha** com `aria-expanded`, **contagens** com `role="status"`.
8. **Atalhos só fora dos campos de texto** (M abre o Índice; digitar "doar" abre a página escondida).
9. **Contraste** no nível AA das [WCAG 2.2](https://www.w3.org/TR/WCAG22/) ⊘ (4,5:1 para texto comum).
10. **Testar nos dois motores:** Edge sem janela com WebGPU e com `?webgl`; o celular a 390 px. Suporte atual: [WebGPU (caniuse)](https://caniuse.com/webgpu) · [o que o seu aparelho tem (webgpureport)](https://webgpureport.org/).

## 3. Das agências para o código

Do estudo das agências (`…/b Design/Agências/`), as técnicas que mais servem ao Portal, com o número da ficha:

- **Duas folhas** (1, Immersive Garden): a tela que sai e a que entra em duas texturas, misturadas por uma máscara de ruído que nasce do Quadrado. É o próximo passo natural da passagem entre páginas.
- **Botão de pausar o movimento sempre à mão** (3, Mouthwash): além do "menos movimento" do sistema, um botão do próprio Portal.
- **Estado da rolagem no `html`** (6, Locomotive): classes como `is-top` deixam o CSS reagir ao lugar da página sem JavaScript a cada quadro.
- **Um canvas que persiste entre telas** (10, 14islands): uma só cena de luz para o app inteiro, com planos presos aos elementos da página.
- **Uma linguagem para os dois motores** (18, Bruno Simon): a TSL do three.js gera WGSL e GLSL da mesma fonte. Hoje o `luz.js` mantém as duas versões à mão; a TSL é a saída quando os efeitos crescerem.

## 4. Para aprender mais

A seção 8 das Referências de Ouro: The Book of Shaders, Inigo Quilez, WebGPU Fundamentals, Shadertoy, Three.js Journey, LYGIA, OGL, Maxime Heckel, The Nature of Code, p5.js.
