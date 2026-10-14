(function () {
  'use strict';

  /* ============================================================
     OS EFEITOS DE LUZ (12/out/2026) — cada um escrito duas vezes,
     em WGSL (WebGPU) e em GLSL (WebGL2), com a mesma conta.

     O que cada um recebe (ver luz.js): p = a posição do pixel, com o
     centro da tela em (0,0) e a menor dimensão valendo 1; uv = de 0
     a 1, com (0,0) no canto de cima à esquerda; e U.tempo, U.progresso,
     U.ponteiro, U.p[0..1] (oito números) e U.c[0..3] (quatro cores).
     No GLSL os mesmos nomes são uTempo, uProgresso, uPonteiro, uP, uC.
     ============================================================ */

  var E = {};

  /* ── O QUADRADO NEGRO, rachado ──
     Malevich pintou o Quadrado Negro em 1915; a tinta preta rachou com
     o tempo, e a rede de rachaduras deixa ver as camadas de baixo (uma
     composição colorida que ele cobriu). Aqui: o quadrado cresce a
     partir de um ponto (p[0].xy, em uv) até cobrir a tela (progresso 0→1),
     com rachaduras de voronoi em duas escalas e um fio de sol na borda.
     c[0] = a cor do quadrado; c[1] = a cor das rachaduras; c[2] = o sol. */
  E.quadrado = {
    wgsl: [
      'fn efeito(p: vec2f, uv: vec2f) -> vec4f {',
      '  let asp = U.res.x / U.res.y;',
      '  let o = vec2f((U.p[0].x - 0.5) * max(asp, 1.0), (0.5 - U.p[0].y) * max(1.0 / asp, 1.0));',
      '  let alvo = length(vec2f(max(asp, 1.0), max(1.0 / asp, 1.0))) * 1.2;',
      '  let t = U.progresso; let e = t * t * (3.0 - 2.0 * t);',
      '  let lado = mix(0.012, alvo, e);',
      '  let q = rot(U.p[0].z * (1.0 - e)) * (p - o * (1.0 - e));',
      '  let d = caixa(q, vec2f(lado));',
      '  let dentro = 1.0 - smoothstep(-0.002, 0.002, d);',
      '  let s = q * 15.0 + U.semente;',
      '  let r1 = voronoiBorda(s); let r2 = voronoiBorda(s * 2.7 + 7.0);',
      '  let racha = (1.0 - smoothstep(0.0, 0.03, r1)) * 0.55 + (1.0 - smoothstep(0.0, 0.045, r2)) * 0.22;',
      '  let grao = (fbm(q * 40.0) - 0.5) * 0.05;',
      '  var cor = mix(U.c[0].rgb + grao, U.c[1].rgb, clamp(racha * (0.25 + 0.4 * e), 0.0, 1.0));',
      '  let borda = exp(-abs(d) * 160.0) * (1.0 - e) * 1.2;',
      '  cor += U.c[2].rgb * borda;',
      '  return vec4f(cor, max(dentro, borda * 0.9));',
      '}',
    ].join('\n'),
    glsl: [
      'vec4 efeito(vec2 p, vec2 uv) {',
      '  float asp = uRes.x / uRes.y;',
      '  vec2 o = vec2((uP[0].x - 0.5) * max(asp, 1.0), (0.5 - uP[0].y) * max(1.0 / asp, 1.0));',
      '  float alvo = length(vec2(max(asp, 1.0), max(1.0 / asp, 1.0))) * 1.2;',
      '  float t = uProgresso; float e = t * t * (3.0 - 2.0 * t);',
      '  float lado = mix(0.012, alvo, e);',
      '  vec2 q = rot(uP[0].z * (1.0 - e)) * (p - o * (1.0 - e));',
      '  float d = caixa(q, vec2(lado));',
      '  float dentro = 1.0 - smoothstep(-0.002, 0.002, d);',
      '  vec2 s = q * 15.0 + uSemente;',
      '  float r1 = voronoiBorda(s); float r2 = voronoiBorda(s * 2.7 + 7.0);',
      '  float racha = (1.0 - smoothstep(0.0, 0.03, r1)) * 0.55 + (1.0 - smoothstep(0.0, 0.045, r2)) * 0.22;',
      '  float grao = (fbm(q * 40.0) - 0.5) * 0.05;',
      '  vec3 cor = mix(uC[0].rgb + grao, uC[1].rgb, clamp(racha * (0.25 + 0.4 * e), 0.0, 1.0));',
      '  float borda = exp(-abs(d) * 160.0) * (1.0 - e) * 1.2;',
      '  cor += uC[2].rgb * borda;',
      '  return vec4(cor, max(dentro, borda * 0.9));',
      '}',
    ].join('\n'),
  };

  /* ── O CAMPO: fumaça de jade e sol (domain warping de Inigo Quilez) ──
     O ruído deforma o próprio ruído duas vezes: fbm(p + fbm(p + fbm(p))).
     p[0].x = velocidade; p[0].y = escala; c[0..2] = as três cores. */
  E.campo = {
    wgsl: [
      'fn efeito(p: vec2f, uv: vec2f) -> vec4f {',
      '  let t = U.tempo * max(U.p[0].x, 0.05) * 0.12;',
      '  let s = p * max(U.p[0].y, 0.3) * 2.2 + (U.ponteiro - 0.5) * 0.35;',
      '  let q = vec2f(fbm(s + vec2f(0.0, t)), fbm(s + vec2f(5.2, 1.3 - t)));',
      '  let r = vec2f(fbm(s + 4.0 * q + vec2f(1.7, 9.2) + 0.15 * t), fbm(s + 4.0 * q + vec2f(8.3, 2.8) - 0.12 * t));',
      '  let f = fbm(s + 4.0 * r);',
      '  var cor = mix(U.c[0].rgb, U.c[1].rgb, clamp(f * f * 2.2, 0.0, 1.0));',
      '  cor = mix(cor, U.c[2].rgb, clamp(length(q) * 0.7 * r.x, 0.0, 1.0));',
      '  cor *= 0.55 + 0.75 * f;',
      '  return vec4f(cor, 1.0);',
      '}',
    ].join('\n'),
    glsl: [
      'vec4 efeito(vec2 p, vec2 uv) {',
      '  float t = uTempo * max(uP[0].x, 0.05) * 0.12;',
      '  vec2 s = p * max(uP[0].y, 0.3) * 2.2 + (uPonteiro - 0.5) * 0.35;',
      '  vec2 q = vec2(fbm(s + vec2(0.0, t)), fbm(s + vec2(5.2, 1.3 - t)));',
      '  vec2 r = vec2(fbm(s + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(s + 4.0 * q + vec2(8.3, 2.8) - 0.12 * t));',
      '  float f = fbm(s + 4.0 * r);',
      '  vec3 cor = mix(uC[0].rgb, uC[1].rgb, clamp(f * f * 2.2, 0.0, 1.0));',
      '  cor = mix(cor, uC[2].rgb, clamp(length(q) * 0.7 * r.x, 0.0, 1.0));',
      '  cor *= 0.55 + 0.75 * f;',
      '  return vec4(cor, 1.0);',
      '}',
    ].join('\n'),
  };

  /* ── O SOL: o disco e a coroa, com a granulação da superfície ──
     A coroa é o fbm em coordenadas polares (ângulo e raio), que faz
     os jatos saírem do disco; p[0].x = tamanho; c[0] = o fundo;
     c[1] = o disco; c[2] = a coroa. */
  E.sol = {
    wgsl: [
      'fn efeito(p: vec2f, uv: vec2f) -> vec4f {',
      '  let R = max(U.p[0].x, 0.08);',
      '  let r = length(p); let a = atan2(p.y, p.x);',
      '  let t = U.tempo * 0.05;',
      '  let gran = fbm(p * 18.0 + vec2f(t * 3.0, -t * 2.0));',
      '  let disco = 1.0 - smoothstep(R - 0.003, R + 0.003, r);',
      '  let limbo = pow(clamp(1.0 - r / R, 0.0, 1.0), 0.35);',
      '  let jatos = fbm(vec2f(a * 3.0 + t, r * 4.0 - t * 4.0)) * fbm(vec2f(a * 7.0 - t, r * 2.0));',
      '  let coroa = exp(-(r - R) * 7.0) * (0.35 + 1.4 * jatos) * step(R, r);',
      '  var cor = U.c[0].rgb + U.c[2].rgb * coroa;',
      '  cor = mix(cor, U.c[1].rgb * (0.75 + 0.5 * gran) * (0.55 + 0.45 * limbo), disco);',
      '  return vec4f(cor, 1.0);',
      '}',
    ].join('\n'),
    glsl: [
      'vec4 efeito(vec2 p, vec2 uv) {',
      '  float R = max(uP[0].x, 0.08);',
      '  float r = length(p); float a = atan(p.y, p.x);',
      '  float t = uTempo * 0.05;',
      '  float gran = fbm(p * 18.0 + vec2(t * 3.0, -t * 2.0));',
      '  float disco = 1.0 - smoothstep(R - 0.003, R + 0.003, r);',
      '  float limbo = pow(clamp(1.0 - r / R, 0.0, 1.0), 0.35);',
      '  float jatos = fbm(vec2(a * 3.0 + t, r * 4.0 - t * 4.0)) * fbm(vec2(a * 7.0 - t, r * 2.0));',
      '  float coroa = exp(-(r - R) * 7.0) * (0.35 + 1.4 * jatos) * step(R, r);',
      '  vec3 cor = uC[0].rgb + uC[2].rgb * coroa;',
      '  cor = mix(cor, uC[1].rgb * (0.75 + 0.5 * gran) * (0.55 + 0.45 * limbo), disco);',
      '  return vec4(cor, 1.0);',
      '}',
    ].join('\n'),
  };

  /* ── A MANDALA SUPREMATISTA: o quadrado, o círculo e a cruz de Malevich
     dobrados em simetria polar (n setores, p[0].x), girando devagar. ── */
  E.mandala = {
    wgsl: [
      'fn efeito(p: vec2f, uv: vec2f) -> vec4f {',
      '  let n = max(floor(U.p[0].x), 3.0);',
      '  let t = U.tempo * 0.06;',
      '  let pc = (p - vec2f(0.0, 0.06)) * (1.75 + 0.05 * sin(U.tempo * 0.35));',
      '  var a = atan2(pc.y, pc.x) + t; let r = length(pc);',
      '  let setor = 6.28318 / n; a = abs(((a % setor) + setor) % setor - setor * 0.5);',
      '  let q = vec2f(cos(a), sin(a)) * r;',
      '  let q2 = rot(t * 2.0) * (q - vec2f(0.32, 0.0));',
      '  let quad = caixa(q2, vec2f(0.055));',
      '  let circ = abs(length(q - vec2f(0.18 + 0.03 * sin(t * 3.0), 0.0)) - 0.035) - 0.004;',
      '  let cruz = min(caixa(q - vec2f(0.5, 0.0), vec2f(0.06, 0.008)), caixa(q - vec2f(0.5, 0.0), vec2f(0.008, 0.06)));',
      '  let anel = abs(r - 0.42) - 0.0015;',
      '  var cor = U.c[0].rgb;',
      '  cor = mix(cor, U.c[1].rgb, 1.0 - smoothstep(0.0, 0.005, quad));',
      '  cor = mix(cor, U.c[2].rgb, 1.0 - smoothstep(0.0, 0.005, circ));',
      '  cor = mix(cor, U.c[3].rgb, 1.0 - smoothstep(0.0, 0.005, min(cruz, anel)));',
      '  cor *= 1.0 - 0.35 * smoothstep(0.3, 0.9, r);',
      '  return vec4f(cor, 1.0);',
      '}',
    ].join('\n'),
    glsl: [
      'vec4 efeito(vec2 p, vec2 uv) {',
      '  float n = max(floor(uP[0].x), 3.0);',
      '  float t = uTempo * 0.06;',
      '  vec2 pc = (p - vec2(0.0, 0.06)) * (1.75 + 0.05 * sin(uTempo * 0.35));',
      '  float a = atan(pc.y, pc.x) + t; float r = length(pc);',
      '  float setor = 6.28318 / n; a = abs(mod(a, setor) - setor * 0.5);',
      '  vec2 q = vec2(cos(a), sin(a)) * r;',
      '  vec2 q2 = rot(t * 2.0) * (q - vec2(0.32, 0.0));',
      '  float quad = caixa(q2, vec2(0.055));',
      '  float circ = abs(length(q - vec2(0.18 + 0.03 * sin(t * 3.0), 0.0)) - 0.035) - 0.004;',
      '  float cruz = min(caixa(q - vec2(0.5, 0.0), vec2(0.06, 0.008)), caixa(q - vec2(0.5, 0.0), vec2(0.008, 0.06)));',
      '  float anel = abs(r - 0.42) - 0.0015;',
      '  vec3 cor = uC[0].rgb;',
      '  cor = mix(cor, uC[1].rgb, 1.0 - smoothstep(0.0, 0.005, quad));',
      '  cor = mix(cor, uC[2].rgb, 1.0 - smoothstep(0.0, 0.005, circ));',
      '  cor = mix(cor, uC[3].rgb, 1.0 - smoothstep(0.0, 0.005, min(cruz, anel)));',
      '  cor *= 1.0 - 0.35 * smoothstep(0.3, 0.9, r);',
      '  return vec4(cor, 1.0);',
      '}',
    ].join('\n'),
  };

  /* ── A POEIRA DE ESTRELAS: pontos que piscam numa grade embaralhada
     (para segredos e o céu da noite). p[0].x = densidade. ── */
  E.poeira = {
    wgsl: [
      'fn efeito(p: vec2f, uv: vec2f) -> vec4f {',
      '  var luz = 0.0;',
      '  for (var k = 0; k < 3; k++) {',
      '    let esc = 18.0 + f32(k) * 22.0 * max(U.p[0].x, 0.3);',
      '    let g = p * esc + f32(k) * 13.7; let id = floor(g); let f = fract(g) - 0.5;',
      '    let h = hash22(id + U.semente); let pos = (h - 0.5) * 0.7;',
      '    let brilho = 0.5 + 0.5 * sin(U.tempo * (1.0 + h.x * 3.0) + h.y * 6.28);',
      '    luz += smoothstep(0.06 - f32(k) * 0.015, 0.0, length(f - pos)) * brilho * step(0.55, h.x);',
      '  }',
      '  return vec4f(U.c[0].rgb, clamp(luz, 0.0, 1.0) * U.c[0].a);',
      '}',
    ].join('\n'),
    glsl: [
      'vec4 efeito(vec2 p, vec2 uv) {',
      '  float luz = 0.0;',
      '  for (int k = 0; k < 3; k++) {',
      '    float esc = 18.0 + float(k) * 22.0 * max(uP[0].x, 0.3);',
      '    vec2 g = p * esc + float(k) * 13.7; vec2 id = floor(g); vec2 f = fract(g) - 0.5;',
      '    vec2 h = hash22(id + uSemente); vec2 pos = (h - 0.5) * 0.7;',
      '    float brilho = 0.5 + 0.5 * sin(uTempo * (1.0 + h.x * 3.0) + h.y * 6.28);',
      '    luz += smoothstep(0.06 - float(k) * 0.015, 0.0, length(f - pos)) * brilho * step(0.55, h.x);',
      '  }',
      '  return vec4(uC[0].rgb, clamp(luz, 0.0, 1.0) * uC[0].a);',
      '}',
    ].join('\n'),
  };

  window.LuzEfeitos = E;
})();
