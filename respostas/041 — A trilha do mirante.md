# 41 · A trilha do mirante
#jardim #3d

> Seção original no PERFIL.md: 15. Segunda rodada da ecovila: mirante, riacho, pontes e galinheiro (23/set/2026, mais noite ainda)

Ele voltou animado — "CONTINUE A RODADA!!! VAMOS COM TUDO!" — pedindo pra seguir nos itens que eu tinha deixado "em aberto" no item 14: montanha de verdade (não só cenário) e mais vida na vila.

**41. Uma segunda trilha, saindo da mesma praça, sobe um morro de verdade até um mirante.** Em vez de dobrar a trilha existente (que exigiria calcular distância a um caminho com curva — mais caro), criei uma **segunda trilha reta independente**, saindo da praça num ângulo bem diferente (`ANGULO_MIRANTE`), do jeito "raios saindo do centro" — mais simples de calcular e visualmente lê como duas estradas saindo da vila pra lugares diferentes. `distTrilha(x,z)` virou o mínimo entre as duas trilhas, então grama e árvores continuam abrindo espaço pras duas.
- **O morro é de verdade, não só achatamento:** a função `altura()` ganhou uma "colina gaussiana" (`ALT_MIRANTE * exp(-r²/2σ²)`) somada por cima do relevo — um morro suave e liso (a própria forma de sino já é caminhável a pé, sem precisar de escada ou zigue-zague artificial: testei subindo com WASD de verdade a partir da praça e o personagem sobe liso até o alto).
- **No topo:** uma plataforma achatada (mesma técnica de achatamento da vila/cachoeira, só que aqui o "morro" em si continua by cima), um banco de madeira com corrimão semicircular de proteção, e a placa "Mirante — o jardim visto de cima". De lá dá pra ver as montanhas distantes muito mais de perto — um final de trilha que recompensa a subida.
- **Uma placa de bifurcação** ("Duas trilhas — vila e cachoeira · mirante") no meio do caminho, onde as duas trilhas se separam.

---
[[0 Índice|Índice]] · ← [[040 — A ecovila no Jardim|040]] · [[042 — O riacho e as pontes|042]] →

---
[[0 Índice|Índice]] · ← [[040 — A ecovila no Jardim|040]] · [[042 — O riacho e as pontes|042]] →
