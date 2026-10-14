# 42 · O riacho e as pontes
#jardim #3d

> Seção original no PERFIL.md: 15. Segunda rodada da ecovila: mirante, riacho, pontes e galinheiro (23/set/2026, mais noite ainda)

**42. Um riacho de verdade contorna o núcleo da vila, com duas pontes de madeira.** Um anel d'água (raio 30, ao redor da praça) corta as duas trilhas — cada uma ganhou uma ponte de tábuas com corrimão. **Bug real, achado e corrigido durante o teste:** a primeira versão da água era um `RingGeometry` plano numa altura fixa — ficava enterrado ou flutuando dependendo do ângulo, porque o chão ali não é plano (tem o relevo ondulado de sempre). Corrigido deslocando cada vértice do anel pra seguir `altura(x,z)` de verdade, do mesmo jeito que o chão principal já fazia — só assim a água aparece exatamente onde o terreno afunda, dos dois lados de cada ponte, como confirmei no teste visual antes/depois da correção.

---
[[0 Índice|Índice]] · ← [[041 — A trilha do mirante|041]] · [[043 — O galinheiro|043]] →

---
[[0 Índice|Índice]] · ← [[041 — A trilha do mirante|041]] · [[043 — O galinheiro|043]] →
