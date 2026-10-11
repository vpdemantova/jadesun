# 9 · A Biblioteca: o diretório de tudo
#fichas #caderno

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

9. **Biblioteca (2026-09-21):** `biblioteca.html` é o único diretório de tudo que está em `2 Academy` (Seleção, Atlas, Guias, Fundação, Aulas: ~1.360 fichas, ~1.750 imagens). O servidor (`lib/biblioteca.mjs`) indexa os `.md` a cada 60 s e entrega: ficha completa com imagens e crédito, hierarquia (acima, abaixo, ao lado, pré-requisito, abre — lidos das seções “Elos” e do cabeçalho), quem cita, quem é citado, parecidas (ligações em comum), menções no texto sem link, e a mesma pasta. IDs são o caminho sem acento (`atlas/f-oficios/marcenaria`); códigos como `MAT-03` também abrem a ficha. Imagens saem por `/midia?p=`, só de `2 Academy` e só extensões de imagem. Fichas de Atlas com só a introdução mostram “Copiar esqueleto”.

---
[[0 Índice|Índice]] · ← [[008 — Segurança, o que o servidor nunca lê|008]] · [[010 — O Eu, o perfil editável|010]] →
