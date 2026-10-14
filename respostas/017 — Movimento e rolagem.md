# 17 · Movimento e rolagem
#movimento #design

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

17. **Movimento e rolagem (`motion.js` + `lenis.js` local, MIT):** rolagem suave (Lenis) ligável; animações em três níveis (nenhuma, suaves = revelar ao rolar, imersivas = títulos em palavras, paralaxe, botões magnéticos, cursor luminoso, partículas, vaga-lumes no jardim, contagem de números); presets Calmo, Fino e Imersivo; barra de leitura. Respeita `prefers-reduced-motion` (padrão: sem animação e rolagem normal). Um só laço `requestAnimationFrame`, que pausa com a aba oculta (60 fps medido no Imersivo).

---
[[0 Índice|Índice]] · ← [[016 — O Agora, um passo por vez|016]] · [[018 — As preferências|018]] →

---
[[0 Índice|Índice]] · ← [[015 — A repaginada Fino|015]] · [[018 — As preferências|018]] →
