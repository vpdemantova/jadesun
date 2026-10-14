# 44 · As pessoas da vila perto do poço
#jardim #3d #correcao

> Seção original no PERFIL.md: 15. Segunda rodada da ecovila: mirante, riacho, pontes e galinheiro (23/set/2026, mais noite ainda)

**44. As pessoas da vila andam mais perto do poço agora**, pra não roçar mais nas casas — reduzi o raio das elipses de patrulha (era até 9,5, agora no máximo 7,3), resolvendo parte do "em aberto" do item 14 sem precisar de desvio de obstáculo de verdade (isso continua pendente pra uma rodada futura, se ele quiser pathing mais esperto).

- **Testado em Edge headless:** subida real com WASD/Shift da praça até passar do topo do morro (confirmei a altura do jogador subindo de ~1,6 pra ~6,9 e depois descendo do outro lado, sem travar); teleporte de depuração pro banco do mirante, pra ponte de cada trilha (água visível dos dois lados depois da correção) e pra horta (galinhas visíveis, cores certas); sem erro de console em nenhum teste; 1440 px e 390 px sem rolagem horizontal.
- **Em aberto:** o corrimão do banco (postes finos numa curva ampla) fica com aparência de "gráfico de barras" vista de longe, por causa da perspectiva em cilindros finos — funciona, mas podia ser mais elegante (um corrimão contínuo em vez de postes soltos); as pessoas e galinhas continuam sem desvio de obstáculo de verdade; ainda não há uma terceira trilha nem um segundo povoado — a ecovila por enquanto é uma vila + uma cachoeira + um mirante, todos a partir da mesma praça.

---
[[0 Índice|Índice]] · ← [[043 — O galinheiro|043]] · [[045 — A Estante em 3D|045]] →

---
[[0 Índice|Índice]] · ← [[043 — O galinheiro|043]] · [[045 — A Estante em 3D|045]] →
