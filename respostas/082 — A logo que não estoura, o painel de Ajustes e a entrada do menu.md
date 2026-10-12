# 82 · A logo que não estoura, a logo nos Ajustes, o painel refeito e a entrada do menu
#vitordemantova #design #3d #menus #movimento #correcao #publicacao

> **Publicado** por você às 14h07 de 12/out (commit `07514c3` no site; este registro, `df3b5b3`).

**"deixe o botão de malha do mesmo tamanho que os outros 2 do footer, e cada um deve ocupar a linha inteira; quando copio um link de uma seção, o botão deve voltar ao estado anterior bem mais rápido; a logo 3D está muito branca, preciso de uma textura ou processamento mínimo… mas manter ainda bem branca e no mesmo tom quase; nos ajustes, inclua uma opção pra eu mudar a logo da seção hero com todas as opções da aba malha e outras ainda! aumente o tamanho desse menu de ajustes… um botão pra abrir de volta, e um pra sair dessa url e voltar pro site… mais instruções… uma seção explicando todo o CMS; o botão do modo estúdio, quando entra-se no site, deve animar igual o loader! surgir, pequeno, girar, chacoalhar; o menu deve aparecer aos poucos também, e os textos animar quase igual quando troca de idioma, mas no sentido oposto, e mais rápido"** (12/out/2026, à tarde)

## A logo branca demais: a causa

- **Medi com a placa de vídeo do Mac**, o mesmo motor do seu Chrome. Com o filtro "Película", a logo do topo saía em **branco 255 chapado**, uma silhueta sem sombra nenhuma. Sem o filtro, saía a porcelana com sombra e volume.
- **O filtro é neutro no resto da página.** Uma régua de cinzas e caixas no meio da tela não mudaram. O estouro vinha só da composição do canvas do filtro, com transparência por pixel, por cima do canvas 3D da logo.
- **A correção:** o filtro ficou opaco, e a força dele passou a ser a opacidade da camada. A mistura é a mesma, a luz do ponteiro continua laranja, e a logo voltou a ter sombra e textura.
- **E a textura que você pediu:** um grão fino de porcelana preso à peça, veios leves, reflexos mais suaves e o branco mais forte em 95%. Continua bem branca, no mesmo tom.

## A logo nos Ajustes (aba Logo)

- **Acabamento**: porcelana (padrão), mármore, quartzo azul, citrino, original, tinta envernizada, cobre e vidro (transparente, mostra o mosaico por trás).
- **Faces**: com ou sem o sólido.
- **Arame**: nenhum, as arestas ou a malha inteira. Por cima da porcelana, o arame fica escuro e fino, como um desenho técnico.
- **Girar sozinha**: parada, lenta ou rápida.
- **E mais**: textura fina (lisa, leve, média), veios (sem, leves, fortes) e brilho (suave, normal, forte).
- Vale só para a logo do topo; o Perfil e a Malha ficam como estão.

## O painel de Ajustes refeito

- **Tamanho**: 560 px de largura (no celular, a tela inteira), letra de 13 px, nada abaixo de 11.
- **Estrutura**: o cabeçalho e as abas ficam presos no alto, e o corpo rola.
- **Seis abas**: Versões, Logo, Módulos, Fino, Salvas e **Como usar**.
  - **Os ajustes**: escolher, salvar, copiar e colar, publicar para todos, voltar ao padrão, abrir e sair.
  - **O CMS**: o caminho de sempre (mudar o arquivo, ver no computador, publicar) e o arquivo de cada coisa: fotos, textos, projetos, músicas, serviços, Agora, Perfil, redes, as frases nos 22 idiomas, as seções, o nome, a imagem do link, o Laboratório e o visual.
- **"Voltar ao site"** no cabeçalho: tira o `?ajustes` do endereço e fecha.
- **Fechado**: no alto à direita, "Ajustes" reabre e "Voltar ao site" sai.
- **"Colar ajustes"**, ao lado de "Copiar": aplica uma combinação copiada.

## A entrada do menu

- **No fim da abertura**, a barra sobe.
- **O botão de modo** nasce minúsculo e girando, com o mesmo giro e a mesma curva da espiral do loader (de −620° a 0° em 1,2 s). Depois chacoalha, e o anel dele se desenha.
- **Os outros botões** vêm numa onda que sai dele para as pontas.
- **Os textos** descem de cima (na troca de idioma eles sobem) e se decodificam da direita para a esquerda, mais depressa.
- **No Editorial**: se o site abre direto nele, a bola faz o mesmo.

## O resto

- **O rodapé**: Laboratório, Mosaico e Malha do mesmo tamanho, um por linha.
- **O link copiado** de uma seção volta ao normal em 1,2 s (eram 5).
- **O `COMO-POPULAR.md`**: ganhou os 22 idiomas e o caminho no Mac.

## Conferido

- `npm run check` e o build passaram.
- Com a placa de vídeo, no computador e no celular, nos dois modos, em português e alemão: sem rolagem lateral e sem texto abaixo de 11 px.
- A entrada filmada quadro a quadro.
- Fotografados: os acabamentos, o arame e o vidro; o painel, o acesso, o "Voltar ao site" e o link copiado.

**Publicado por você às 14h07** (`07514c3`).

---
[[0 Índice|Índice]] · ← [[081 — Os botões arredondados, quadrados arredondados e círculos|081]] · [[083 — O menu do celular, o ícone do Contato e o mapa dos idiomas|083]] →
