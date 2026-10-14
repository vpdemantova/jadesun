# 21 · A exportação estática
#publicacao

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

21. **Exportação estática (`exportar.mjs`, `exportar.bat`):** `node exportar.mjs publico|privado [--limpo] [--rapido] [--sem-fontes]` gera `exportado/<modo>/` (ignorado pelo git). `estatico.js` substitui o `fetch('/api/...')` por JSON prontos (`api/biblioteca.json`, `api/ficha/<id>.json`, `api/busca.json`, `api/codigos.json`, `api/linha.json`; no privado também `estado`, `estudos`, `lacunas`, `perfil`); o "Dominei" do privado fica em `localStorage` (`jadesun-marcas`); o perfil é só leitura. Imagens: Seleção em `midia/s/<nome>`, Atlas em `midia/a/<sha1>`, miniaturas em `midia/t/`, reduzidas com `sharp` (`npm install` na pasta; `larguraMax` em `publicar.json`). Fontes do Google baixadas para `fontes/` (latin e latin-ext). `sw.js` dá o modo offline. O **público** só inclui os acervos de `publicar.json` (`selecao`, `atlas`), tira `visibilidade: privado|rascunho`, exclui fichas com CPF, chave privada, senha explícita ou dado pessoal do autor, e lista avisos (e-mail, telefone, caminho local) em `RELATORIO.md`; esconde o caminho do arquivo no caderno e as páginas privadas. Testado: servir sozinho, busca, ficha, código `MAT-03`, linha do tempo com 103 imagens, offline com o servidor desligado. **Limite:** as fichas usam `#` na URL, então buscadores não indexam cada ficha; próxima versão: uma página HTML por ficha. Publicar (Cloudflare Pages, Netlify ou GitHub Pages) é ação dele.

---
[[0 Índice|Índice]] · ← [[020 — O modo celular|020]] · [[022 — O mapa de conceitos|022]] →

---
[[0 Índice|Índice]] · ← [[020 — O modo celular|020]] · [[022 — O mapa de conceitos|022]] →
