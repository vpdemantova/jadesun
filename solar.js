/* ============================================================
   SOLAR — o céu de agora (08/out/2026, PERFIL.md item 71)
   · Põe em :root a cor do céu de Campinas neste minuto (--ceu-z, --ceu-h)
     e a fase do dia (data-sol: dia | dourado | crepusculo | noite).
   · No Agora, desenha o arco do sol de hoje: horizonte com as horas,
     o caminho do nascer ao poente, onde o sol está agora; à noite, a Lua
     com a fase vista de Campinas (hemisfério sul: o lado aceso é invertido).
   Usa o motor do céu do Jardim (ceu.js) e a mesma paleta (j-ceu.js).
   Só vale no acabamento Solar; nos outros não faz nada visível.
   ============================================================ */
(function () {
  'use strict';

  var PONTOS = [ /* a mesma paleta do céu do Jardim (j-ceu.js): altura do sol → zênite, horizonte */
    [30, [0.22, 0.45, 0.80], [0.70, 0.84, 0.95]],
    [10, [0.22, 0.45, 0.80], [0.72, 0.85, 0.95]],
    [3, [0.25, 0.38, 0.62], [1.00, 0.72, 0.42]],
    [-3, [0.10, 0.14, 0.34], [0.86, 0.42, 0.30]],
    [-9, [0.04, 0.06, 0.16], [0.22, 0.16, 0.24]],
    [-18, [0.010, 0.016, 0.045], [0.030, 0.042, 0.085]],
  ];
  function mis(a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); }
  function paleta(alt) {
    if (alt >= PONTOS[0][0]) return { z: PONTOS[0][1], h: PONTOS[0][2] };
    for (var i = 0; i < PONTOS.length - 1; i++) {
      var a = PONTOS[i], b = PONTOS[i + 1];
      if (alt <= a[0] && alt >= b[0]) { var t = (a[0] - alt) / (a[0] - b[0]); return { z: mis(a[1], b[1], t), h: mis(a[2], b[2], t) }; }
    }
    var u = PONTOS[PONTOS.length - 1];
    return { z: u[1], h: u[2] };
  }
  function rgb(c) { return 'rgb(' + c.map(function (v) { return Math.round(v * 255); }).join(',') + ')'; }
  function hh(d) { return d ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'; }
  function ativo() { return document.documentElement.getAttribute('data-acabamento') === 'solar'; }

  function comCeu(f) {
    if (window.Ceu) return f(window.Ceu);
    var s = document.querySelector('script[data-ceu]');
    if (!s) { s = document.createElement('script'); s.src = 'ceu.js'; s.setAttribute('data-ceu', ''); document.head.appendChild(s); }
    s.addEventListener('load', function () { if (window.Ceu) f(window.Ceu); });
  }

  function agoraDe() {
    var q = new URLSearchParams(location.search).get('hora'); /* para testar: ?hora=18:10 */
    if (q && /^\d{1,2}:\d{2}$/.test(q)) { var d = new Date(); var p = q.split(':'); d.setHours(+p[0], +p[1], 0, 0); return d; }
    return new Date();
  }

  function estado(C) {
    var agora = agoraDe();
    var s = C.sol(agora), pos = C.horizonte(s.ra, s.dec, agora, C.LOCAL);
    return { agora: agora, alt: pos.alt, np: C.nascerEPoente(agora, C.LOCAL) };
  }

  function pintar(C) {
    var e = estado(C), p = paleta(e.alt), raiz = document.documentElement;
    raiz.style.setProperty('--ceu-z', rgb(p.z));
    raiz.style.setProperty('--ceu-h', rgb(p.h));
    raiz.setAttribute('data-sol', e.alt > 10 ? 'dia' : e.alt > -1 ? 'dourado' : e.alt > -9 ? 'crepusculo' : 'noite');
    return e;
  }

  /* ---------- o arco do sol de hoje (Agora) ---------- */
  function lua(C, agora) {
    var f = C.faseDaLua(agora), k = Math.max(0, Math.min(1, f.iluminada)), r = 15;
    var crescente = f.fase < 0.5;
    /* hemisfério sul: na crescente o lado aceso fica à esquerda */
    var aceso = crescente ? -1 : 1;
    var rx = Math.abs(1 - 2 * k) * r;
    var d = 'M0 ' + (-r) + ' A' + r + ' ' + r + ' 0 0 ' + (aceso > 0 ? 1 : 0) + ' 0 ' + r + ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + ((k > 0.5) === (aceso > 0) ? 1 : 0) + ' 0 ' + (-r) + 'Z';
    var l = C.lua(agora), h = C.horizonte(l.ra, l.dec, agora, C.LOCAL);
    return { d: d, nome: f.nome, pct: Math.round(k * 100), acima: h.alt > 0, alt: Math.round(h.alt) };
  }

  function arco(svg) {
    if (!svg) return;
    comCeu(function (C) {
      var e = estado(C), agora = e.agora, np = e.np;
      if (!np.nascer || !np.poente) { svg.innerHTML = ''; return; }
      /* k: quanto o desenho encolheu na tela (no celular, ~1,6); as letras crescem na mesma razão e o arco abaixa um pouco */
      var larg = svg.getBoundingClientRect().width || 560, k = Math.max(1, Math.min(1.6, 560 / larg));
      svg.style.setProperty('--k', k.toFixed(2));
      var W = 560, H0 = 176, X0 = 24, X1 = 536, ALT = Math.round(132 - 50 * (k - 1));
      var meia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
      var t0 = np.nascer.getTime(), t1 = np.poente.getTime(), maxAlt = 1, pts = [];
      for (var t = t0; t <= t1; t += 9e5) {
        var s = C.sol(new Date(t)), hz = C.horizonte(s.ra, s.dec, new Date(t), C.LOCAL);
        pts.push([t, Math.max(0, hz.alt)]); if (hz.alt > maxAlt) maxAlt = hz.alt;
      }
      pts.push([t1, 0]);
      var X = function (t) { return X0 + (t - t0) / (t1 - t0) * (X1 - X0); };
      var dia = agora.getTime() >= t0 && agora.getTime() <= t1;
      if (!dia) ALT = Math.round(ALT * .45); /* à noite o caminho do sol abaixa e a Lua sobe */
      var Y = function (a) { return H0 - a / maxAlt * ALT; };
      var caminho = function (lista) { return lista.map(function (q, i) { return (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1); }).join(''); };
      var tA = Math.max(t0, Math.min(t1, agora.getTime()));
      var o = '<line class="ar-h" x1="0" x2="' + W + '" y1="' + H0 + '" y2="' + H0 + '"/>';
      for (var hr = 6; hr <= 18; hr += 3) {
        var th = meia + hr * 36e5; if (th < t0 + 18e5 || th > t1 - 18e5) continue;
        var xx = X(th).toFixed(1);
        o += '<line class="ar-t" x1="' + xx + '" x2="' + xx + '" y1="' + H0 + '" y2="' + (H0 + 6) + '"/><text class="ar-tl" x="' + xx + '" y="' + (H0 + 9 + 13 * k).toFixed(1) + '" text-anchor="middle">' + (hr < 10 ? '0' : '') + hr + 'h</text>';
      }
      o += '<path class="ar-falta" d="' + caminho(pts) + '"/>';
      if (dia) o += '<path class="ar-feito" d="' + caminho(pts.filter(function (q) { return q[0] <= tA; }).concat([[tA, Math.max(0, e.alt)]])) + '"/>';
      o += '<g class="ar-ponta"><path d="M' + X0 + ' ' + (H0 + 10) + 'l-5 7h10z"/><text x="' + (X0 - 8) + '" y="' + (H0 + 14 + 20 * k).toFixed(1) + '" text-anchor="start">nasce ' + hh(np.nascer) + '</text></g>';
      o += '<g class="ar-ponta"><path d="M' + X1 + ' ' + (H0 + 17) + 'l-5 -7h10z"/><text x="' + (X1 + 8) + '" y="' + (H0 + 14 + 20 * k).toFixed(1) + '" text-anchor="end">põe-se ' + hh(np.poente) + '</text></g>';
      if (dia) {
        var sx = X(tA), sy = Y(Math.max(0, e.alt)), dir = sx > W * 0.6;
        o += '<circle class="ar-halo" cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="24"/><circle class="ar-anel" cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="14"/><circle class="ar-disco" cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="7.5"/>';
        /* a leitura fica num canto fixo, do lado oposto ao sol: o arco nunca passa por ali */
        var min = Math.max(0, Math.round((t1 - agora.getTime()) / 6e4));
        var resto = min < 120 ? 'o sol se põe em ' + min + ' min' : 'ainda ' + Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : '') + ' de luz';
        var lx = dir ? 0 : W, anc = dir ? 'start' : 'end';
        o += '<text class="ar-agora" x="' + lx + '" y="' + (6 + 16 * k).toFixed(1) + '" text-anchor="' + anc + '">' + hh(agora) + ' · sol a ' + Math.round(e.alt) + '°</text><text class="ar-sub" x="' + lx + '" y="' + (12 + 29 * k).toFixed(1) + '" text-anchor="' + anc + '">' + resto + '</text>';
      } else {
        var L = lua(C, agora), amanha = C.nascerEPoente(new Date(agora.getTime() + 864e5), C.LOCAL).nascer;
        var antesDoNascer = agora.getTime() < t0;
        /* à noite, a Lua e a leitura ficam na faixa de cima, sobre o caminho do sol já baixo */
        o += '<g class="ar-lua" transform="translate(' + (W / 2) + ' 18)"><circle r="15" class="ar-lua-f"/><path d="' + L.d + '"/></g>';
        o += '<text class="ar-agora" x="' + (W / 2) + '" y="' + Math.round(41 + 16 * k) + '" text-anchor="middle">' + hh(agora) + ' · noite</text>';
        o += '<text class="ar-sub" x="' + (W / 2) + '" y="' + Math.round(47 + 29 * k) + '" text-anchor="middle">Lua ' + L.nome.toLowerCase() + ', ' + L.pct + '% acesa, ' + (L.acima ? 'no céu' : 'abaixo do horizonte') + '</text>';
        o += '<text class="ar-sub" x="' + (W / 2) + '" y="' + Math.round(51 + 42 * k) + '" text-anchor="middle">o sol nasce às ' + hh(antesDoNascer ? np.nascer : amanha) + '</text>';
      }
      svg.innerHTML = o;
      svg.setAttribute('aria-label', dia ? 'O caminho do sol hoje em Campinas: nasceu às ' + hh(np.nascer) + ', põe-se às ' + hh(np.poente) + '; agora está a ' + Math.round(e.alt) + ' graus.' : 'Noite em Campinas; o sol nasce às ' + hh(np.nascer) + '.');
    });
  }

  function iniciar() {
    if (!ativo()) return;
    comCeu(function (C) { pintar(C); setInterval(function () { pintar(C); var s = document.getElementById('ag-arco'); if (s) arco(s); }, 60000); });
  }

  var redesenho;
  window.addEventListener('resize', function () {
    clearTimeout(redesenho);
    redesenho = setTimeout(function () { document.querySelectorAll('svg.ag-arco').forEach(function (s) { if (s.innerHTML) arco(s); }); }, 200);
  });

  window.Solar = { arco: arco, paleta: paleta };
  window.addEventListener('pers:mudou', iniciar);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
