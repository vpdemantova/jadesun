# 20 · O modo celular
#celular #seguranca

> Seção original no PERFIL.md: 2. Decisões (2026-09-20)

20. **Modo celular (`celular.bat`, `lib/rede.mjs`):** `LAN=1` faz o servidor escutar em `0.0.0.0`; só o próprio computador (loopback) entra sem código. Os outros aparelhos precisam do código de 12 hexadecimais (`dados/celular-token.txt`, criado uma vez), que entra por `?t=`, vira cookie `jt` (HttpOnly, SameSite=Lax) e é conferido em tempo constante; 15 tentativas erradas bloqueiam o IP por 10 minutos. O `Host` só pode ser um IP local ou o nome do computador (protege contra DNS rebinding); `/api/celular` (o código) só responde em loopback. `celular.html` mostra o QR (`qrcode-gen.js` local, MIT). Testado pelo IP de rede do próprio computador. Tailscale é o caminho recomendado fora de casa (o servidor já aceita o IP `100.x`).

---
[[0 Índice|Índice]] · ← [[019 — O desempenho do servidor|019]] · [[021 — A exportação estática|021]] →

---
[[0 Índice|Índice]] · ← [[019 — O desempenho do servidor|019]] · [[021 — A exportação estática|021]] →
