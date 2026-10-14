# 4 · A ponte do caderno para a página
#fundacao #arquitetura #caderno #seguranca

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

4. **Ponte vault → página:** `servir.mjs` (servidor local, só em 127.0.0.1) lê o vault por `lib/vault.mjs` e entrega os dados em `/api/estado`; `/api/marcar` grava `[x]`/`[ ]` de volta no Checklist, com backup diário em `dados/` (ignorado pelo git). Abre com `hoje.bat`. A face pública (fatia 3) usará a mesma biblioteca, só com o que for `publico`.

---
[[0 Índice|Índice]] · ← [[003 — De onde vêm os dados, o caderno|003]] · [[005 — Visibilidade, privado, rascunho, público|005]] →

---
[[0 Índice|Índice]] · ← [[003 — De onde vêm os dados, o caderno|003]] · [[005 — Visibilidade, privado, rascunho, público|005]] →
