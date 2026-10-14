# 10 · O Eu: o perfil editável
#eu #caderno

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

10. **Eu (perfil editável):** `eu.html` lê e grava, direto nos `.md` do caderno, sete arquivos: Feitos, Linha da minha vida, Capacidades, Objetivos, Estudos, Cidade a dois e Frases (`lib/perfil.mjs`, lista fixa). Cada gravação: exige o cabeçalho `X-Perfil`, confere a versão que a página abriu (senão recusa, 409), copia a versão anterior para `dados/perfil-backups/` e escreve de forma atômica preservando CRLF/LF. “Desfazer” devolve a última cópia. Feitos e Linha da vida são blocos `## quando · título` + linha `*categoria: x · visibilidade: y*` (`entradas.js` lê e escreve sem perder texto; ida e volta testada byte a byte). Os “seis anos” não aparecem no git (primeiro commit 2026-03-28): a página diz isso e deixa a linha da vida para ele preencher.

---
[[0 Índice|Índice]] · ← [[009 — A Biblioteca, o diretório de tudo|009]] · [[011 — Copiar à mão|011]] →

---
[[0 Índice|Índice]] · ← [[009 — A Biblioteca, o diretório de tudo|009]] · [[011 — Copiar à mão|011]] →
