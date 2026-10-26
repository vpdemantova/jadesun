# 125 · Por que os Cubos ficaram bons, o molde dos projetos filhos e o motor também em WebGL2
#cubos #webgpu #webgl2 #motor #design #referencias #publicacao #espera-voce

> **Espera você:** uma palavra para terminar os Cubos numa forma só: A, B, C ou "as três" (o menu da A, o movimento da B e a galeria da C, juntos).

**O pedido de 26/out/2026 (à noite):**

> *"porque ficou tão bom! ideias maravilhosas! preciso refazer todos meus projetos nesse nível..! … voltar ao meu centro e finalizar ele, de uma só forma, talvez misturar duas, e acabar de vez … quero fazer um site nesse nível pra cada skill … projetos filhos do Portal Solar … quais todas as techs e métodos pros navegadores que não suportam WebGPU acompanhar e não perder nada? refazer a mesma experiência? ou alguma ferramenta que transcreve e adapta?"*

## 1. Por que ficou bom: oito regras

1. **Uma frase organiza tudo.** *"Todo cubo mágico é um sólido cortado por planos."* O motor, o catálogo, as páginas e a prancha saem dela, e cada decisão nova se mede contra ela.
2. **Um mundo que acaba.** São vinte quebra-cabeças, 57 OLL, 21 PLL e oito aulas: dá para terminar e dá para conferir.
3. **Um motor só.** O 2×2 e o Gigaminx saem do mesmo código, e nada é desenhado duas vezes. Os dados mandam: um quebra-cabeça novo é uma linha em `js/dados/cubos.js`, e um produto é uma linha na planilha.
4. **Estudar os melhores antes.** O Twizzle, o csTimer, o J Perm e a página do Jaap: o pedido do começo já era estudar as interfaces.
5. **Conferir sempre.** O `npm run verificar` confere as peças, as 78 da última camada e cada tecla do treino. O site não consegue mostrar uma coisa errada sem um teste reclamar.
6. **Publicar a cada passo.** Cada pedido terminou no ar no mesmo dia, e nunca houve duas versões pela metade.
7. **Comparar antes de reformar.** A prancha pôs três direções vivas lado a lado, em vez de trocar tudo no escuro.
8. **Ser útil, não só bonito.** O treino, o desafio da semana e a loja fazem do site uma ferramenta, não um cartaz.

## 2. O molde dos projetos filhos (um site por skill)

Cada skill vira um site com as mesmas seis partes:
- **a frase** que organiza tudo;
- **o mundo que acaba**, com uma lista fechada do que há para aprender;
- **o motor** que desenha;
- **a prática:** o treino, com o cronômetro e os casos que voltam;
- **a comunidade:** os encontros;
- **a renda:** a loja, as oficinas e os cadernos.

Os Cubos são o primeiro. O próximo nasce copiando a estrutura, não do zero, e cada filho termina antes de o outro começar.

**A ordem, sem frente nova:**
1. os Cubos numa forma só (a prancha, CB-33);
2. o centro, com o mesmo método: as duas cópias do Portal Solar viram uma (o plano está em `UNIAO.md`), e a navegação única é a da `ESTRUTURA.md`;
3. um filho de cada vez.

## 3. Os navegadores sem WebGPU

### Quem não tem (out/2026)

Uns 12% das pessoas: segundo o caniuse, 87,8% têm WebGPU. Faltam:
- o iPhone e o iPad antes do iOS 26;
- o Firefox no Linux e no Android (no Windows, ele tem desde o 141; no Mac, desde o 145);
- o Chrome no Linux, salvo nas placas Intel novas e na NVIDIA com Wayland;
- o Android antes do 12 e algumas placas da Samsung (Xclipse).

A WebGL2 chega a 97%, e no iPhone desde o iOS 15.

### Os quatro caminhos

1. **Refazer só a parte que desenha, em WebGL2.** Dá a mesma experiência, e foi o caminho escolhido.
2. **Uma biblioteca que escolhe sozinha.** O three.js, com o `WebGPURenderer`, usa a WebGPU e cai sozinho na WebGL2. Os sombreadores escritos em TSL viram WGSL ou GLSL, conforme o navegador (a parte de cálculo, a *compute*, não funciona igual na WebGL2). O Babylon.js e o PlayCanvas também têm os dois motores. É o caminho dos próximos projetos em 3D, e é o three.js do estudo.
3. **Um tradutor de sombreador.** O Naga (do wgpu) e o Tint (do Chrome) traduzem WGSL para GLSL. Isso ajuda a começar, mas não traduz o resto do programa (os buffers, a ordem de desenhar). O wgpu, em Rust, tem a WebGL2 só como "melhor esforço".
4. **O último recurso:** a foto ou o vídeo, feitos pelo próprio motor.

### Feito nos Cubos

- **Antes**, quem não tinha WebGPU via uma caixa cinza no lugar de cada cubo.
- **O que mudou:**
  - o que não depende da placa de vídeo (as malhas, a câmera, o toque) ficou numa base comum;
  - a WebGPU continuou idêntica, pixel a pixel;
  - a WebGL2 desenha o mesmo, com o sombreador escrito em GLSL;
  - sem nenhuma das duas, aparece a foto do quebra-cabeça.
- **A comparação:** nos 20 quebra-cabeças e nos três corpos, a diferença média entre os dois motores ficou abaixo de 1 em 255. Só as bordas finas, do antisserrilhado, mudam.
- **Para ver a WebGL2 em qualquer navegador:** <https://cubos-five.vercel.app/?motor=webgl2>.

## 4. Conferido e publicado

- **Os testes:** `npm run verificar` passa inteiro. Foram 30 retratos nos dois motores, comparados pixel a pixel.
- **As páginas em WebGL2:**
  - a capa girando, aberta em peças e com os planos de corte;
  - os cubos, os algoritmos, as aulas, o treino, a loja e a prancha B;
  - o celular.
- **Sem placa nenhuma,** aparece a foto.
- **No ar,** conferido nos três casos: com WebGPU, sem WebGPU e com a WebGL2 forçada. Commit `24de2d1`, em ~/www/cubos.

## Fontes

- [WebGPU: a situação de cada navegador (gpuweb, 2/out/2026)](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)
- [Can I use: WebGPU](https://caniuse.com/webgpu) e [WebGL 2.0](https://caniuse.com/webgl2) (dados de set/2026)
- [web.dev: a WebGPU nos principais navegadores](https://web.dev/blog/webgpu-supported-major-browsers)
- [three.js: o WebGPURenderer e a volta para a WebGL2](https://threejs.org/manual/en/webgpurenderer)
- [three.js: TSL e WebGL2 × WebGPU](https://discourse.threejs.org/t/tsl-and-webgl2-vs-webgpu/87974)
- [wgpu: a WebGL2 pelo Naga](https://github.com/gfx-rs/wgpu)

---
[[0 Índice|Índice]] · ← [[124 — A loja quase pronta, o balcão e o manual da loja|124]]
