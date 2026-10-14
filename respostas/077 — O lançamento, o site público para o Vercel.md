# 77 · O lançamento: o site público para o Vercel
#publicacao #home #menus #celular #privacidade

> **Feito em 12/out** (080): o login na Vercel e a publicação; o site abre em montagnedejade.org.

77. **"era só de uma pessoa que eu precisava pra lançar isso.. vou publicar agora na vercel! … meu domínio montagnedejade.org está na Squarespace em um e-mail que não tenho mais acesso … publique já em montagnedejade.vercel.app até a gente o quanto antes recuperar o domínio, e que a versão esteja perfeita para celular, explique tudo e tenha os conteúdos.." (09/out/2026, fim da tarde)**

- **O site público abre no Início** (antes abria na Biblioteca): a página inicial em versão pública. No alto, **"O que é"**: um parágrafo e as seis portas (Fichas, Quando, Guias, Curadoria, Manifesto, Dados). Depois, a linha das revoluções, a revolução ontológica, a Terra agora (o ponto diz só "Campinas"), o mapa da humanidade ("o quanto o acervo já tem"), o planeta (cada visitante marca os próprios hábitos, no navegador dele), o que existe e "Quem fez". Fica de fora só "o próximo tijolo" (a sua lista de fichas a escrever).
- **O menu público, enxuto:** Início · Fichas · Quando · Guias · Curadoria · Manifesto (as mesmas seis abas no celular) e, ao lado, Dados.
- **A Sobre** passou a ser gerada com a cabeça das outras páginas (antes vinha sem os estilos atuais, alargava a tela no celular e pedia arquivos que o site público não tem) e diz "Feito por Vitor de Mantova. Contato: vitordemantova.com" (`publicar.json`; antes mostrava "Autor: a preencher"). O seu e-mail não vai ao site.
- **O celular, conferido do jeito certo:** o meu teste antigo deixava o celular simulado afastar a página, e assim não via o que passava da largura. Com a largura travada em 390 px apareceram e foram corrigidos: a linha das revoluções alargava a página inteira (a coluna crescia até caber a fileira de botões; agora as fileiras rolam de lado), a barra do alto do app passava 6 px (margens menores até 400 px) e a página Sistema (o logotipo grande). Agora as 12 páginas públicas e as 20 do app cabem em 390 px. Na home, a lista da linha vem fechada (a página ficava 3 mil px mais longa).
- **As imagens:** o `sharp` foi instalado com as versões travadas do projeto (`npm ci`, nada mudou no repositório); as 1.830 imagens foram reduzidas (349 MB → 198 MB, com miniaturas). O site público tem 1.244 fichas, 4.073 arquivos, 227 MB.
- **Privacidade conferida no site exportado:** nenhum caminho do seu disco, nenhum conteúdo do b Studio além da XV lapidada e do "0 O Manifesto" (que você aprovou), sem as palavras cruas do discurso, sem senha, sem o seu e-mail.
- **A publicação:** a pasta `exportado/vercel/.vercel/output` está pronta (o site já construído; a raiz abre o Início sem redirecionar; imagens e fontes ficam guardadas no celular de quem visita). Falta o seu login no Vercel neste Mac (`npx vercel login`). Hoje montagnedejade.vercel.app mostra a versão antiga do Portal Solar (a do repositório `interface`); a nova entra no lugar, e a antiga fica guardada no Vercel.
- **Para voltar atrás:** `dados/versao-2026-10-09-antes-do-lancamento/` (perfil.js, atlas.js, terra.js, exportar.mjs, atlas-inicio.css, publicar.json).

  **Nada foi commitado.**

---
[[0 Índice|Índice]] · ← [[076 — A home sem as revoluções e o painel do tweak|076]] · [[078 — A prancha, dez estilos, os menus e o registro em arquivos|078]] →

---
[[0 Índice|Índice]] · ← [[076 — A home sem as revoluções e o painel do tweak|076]] · [[078 — A prancha, dez estilos, os menus e o registro em arquivos|078]] →
