# 76 · A home sem as revoluções e o painel do /tweak
#revolucoes #home #tweak #correcao #erro-meu #celular

76. **"ligue o painel e corrija a homepage que não carrega as revoluções.." (09/out/2026, à tarde)**

- **Por que a linha não aparecia:** um choque de nomes. O `motion.js` usa a classe `.rv` para "esconder até revelar ao rolar", e eu tinha dado esse mesmo nome à linha das revoluções. Com as animações ligadas (o seu navegador), ela ficava invisível para sempre; nos meus testes, com "reduzir movimento", aparecia. A linha agora usa o prefixo `revo` (`revolucoes.js`, `revolucoes.css`).
- **A linha, mais limpa:** as hastes passam por baixo dos rótulos; as marcas sem lugar descem para rente da régua (e mostram o nome ao passar o mouse); o rótulo tenta a esquerda da marca quando a direita está ocupada; marcas fora das bordas não deixam rótulo cortado; mais uma faixa (o palco foi de 420 para 460 px; no celular, 400). **A revolução ontológica escolhe o lugar antes de todas**, sempre com o nome. De 1 280 a 1 728 px, todas as principais aparecem com nome e nenhum rótulo se cruza.
- **O "Quem fez" sumia no tema escuro** (contraste 1,00: a sua assinatura e as três frases invisíveis, na home e no Manifesto, e também o número XVI e o rótulo da ontológica): usavam o preto fixo com a letra da cor do papel, que no escuro também é escura. Agora seguem a regra da marca ("negro no claro, branco no escuro"): no escuro, o bloco é um cartão claro, como o quadrado da barra do alto. Token novo `--marca-tinta` (perfil.css) para o sol e o jade. No Manifesto, as citações e o link dentro do bloco não herdam mais a caixa verde e o verde dos links do texto.
- **O painel do /tweak está ligado no Portal Solar** (servidor em `127.0.0.1:7777`, injetado nas 28 páginas, entre marcas). "Assar no código" escreve no CSS e tira o painel; "Tirar o painel sem assar" (aba Assar) desiste.
- **Um erro meu, desfeito:** ao conferir as opções da skill, rodei `servidor.mjs --help`; ele não conhecia a opção e ligou o painel na pasta em que eu estava (`~/www`), marcando o `layout.tsx` de 12 projetos (interface, portal-solar, vitordemantova, old-website…). Tirei a marca exata de cada um, e o git confirma: **os 12 arquivos estão idênticos ao último commit**; a pasta `.tweak` que ele criou em `~/www` foi apagada. **A skill foi corrigida:** sem `--raiz`, com opção desconhecida ou numa pasta com mais de um projeto, ela recusa sem mexer em nada; e injetar/tirar agora devolve cada arquivo byte por byte (antes, o tirar perdia o recuo do `</body>`). Testado em páginas de quatro formatos, nos três caminhos (tirar, encerrar, assar).
- **Testado:** a home com animações ligadas e desligadas, em 5 larguras e nas vistas de "Ir para"; o contraste nos dois temas (home e Manifesto); as 20 páginas no computador e no celular, sem erro e sem rolagem lateral.

  **E nada foi commitado nem enviado.**

---
[[0 Índice|Índice]] · ← [[075 — O sim, o Manifesto inteiro, a forma, as revoluções, as notas e o tweak|075]] · [[077 — O lançamento, o site público para o Vercel|077]] →

---
[[0 Índice|Índice]] · ← [[075 — O sim, o Manifesto inteiro, a forma, as revoluções, as notas e o tweak|075]] · [[077 — O lançamento, o site público para o Vercel|077]] →
