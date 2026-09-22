/* Motor do céu: Sol, Lua, planetas e coordenadas do horizonte.
   Elementos orbitais de baixa precisão (método de P. Schlyter, "How to compute planetary positions").
   Erro típico: ~1 a 2 minutos de arco nos planetas, ~0,3 grau na Lua. Bom para olhar o céu, não para navegar. */
(function (raiz) {
  'use strict';

  var PI = Math.PI;
  var R = PI / 180;
  function rev(x) { return x - Math.floor(x / 360) * 360; }
  function sin(x) { return Math.sin(x * R); }
  function cos(x) { return Math.cos(x * R); }
  function atan2(y, x) { return Math.atan2(y, x) / R; }

  var LOCAL = { lat: -22.9056, lon: -47.0608, nome: 'Campinas' };

  function jd(data) { return data.getTime() / 86400000 + 2440587.5; }
  function dias(data) { return jd(data) - 2451543.5; }

  function kepler(M, e) {
    var E = M + (180 / PI) * e * sin(M) * (1 + e * cos(M));
    for (var i = 0; i < 12; i++) {
      var d = (E - (180 / PI) * e * sin(E) - M) / (1 - e * cos(E));
      E -= d;
      if (Math.abs(d) < 1e-7) break;
    }
    return E;
  }

  var ELEM = {
    mercurio: function (d) { return { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.0e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d }; },
    venus: function (d) { return { N: 76.6799 + 2.46590e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.8910 + 1.38374e-5 * d, a: 0.723330, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d }; },
    marte: function (d) { return { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d }; },
    jupiter: function (d) { return { N: 100.4542 + 2.76854e-5 * d, i: 1.3030 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.8950 + 0.0830853001 * d }; },
    saturno: function (d) { return { N: 113.6634 + 2.38980e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.9670 + 0.0334442282 * d }; },
  };
  var NOMES = { mercurio: 'Mercúrio', venus: 'Vênus', marte: 'Marte', jupiter: 'Júpiter', saturno: 'Saturno' };
  var MAG = { mercurio: 0.0, venus: -4.0, marte: 0.5, jupiter: -2.2, saturno: 0.6 };

  function obliquidade(d) { return 23.4393 - 3.563e-7 * d; }

  function sol(data) {
    var d = dias(data);
    var w = 282.9404 + 4.70935e-5 * d;
    var e = 0.016709 - 1.151e-9 * d;
    var M = rev(356.0470 + 0.9856002585 * d);
    var E = kepler(M, e);
    var xv = cos(E) - e;
    var yv = Math.sqrt(1 - e * e) * sin(E);
    var v = atan2(yv, xv);
    var r = Math.sqrt(xv * xv + yv * yv);
    var lon = rev(v + w);
    var xs = r * cos(lon), ys = r * sin(lon);
    var ecl = obliquidade(d);
    var xe = xs, ye = ys * cos(ecl), ze = ys * sin(ecl);
    return { xs: xs, ys: ys, lon: lon, r: r, M: M, w: w, L: rev(w + M), ra: rev(atan2(ye, xe)), dec: atan2(ze, Math.sqrt(xe * xe + ye * ye)) };
  }

  function planeta(id, data) {
    var d = dias(data);
    var s = sol(data);
    var o = ELEM[id](d);
    var M = rev(o.M);
    var E = kepler(M, o.e);
    var xv = o.a * (cos(E) - o.e);
    var yv = o.a * Math.sqrt(1 - o.e * o.e) * sin(E);
    var v = atan2(yv, xv);
    var r = Math.sqrt(xv * xv + yv * yv);
    var vw = v + o.w;
    var xh = r * (cos(o.N) * cos(vw) - sin(o.N) * sin(vw) * cos(o.i));
    var yh = r * (sin(o.N) * cos(vw) + cos(o.N) * sin(vw) * cos(o.i));
    var zh = r * sin(vw) * sin(o.i);
    var lon = atan2(yh, xh);
    var lat = atan2(zh, Math.sqrt(xh * xh + yh * yh));
    if (id === 'jupiter' || id === 'saturno') {
      var Mj = rev(ELEM.jupiter(d).M), Ms = rev(ELEM.saturno(d).M);
      if (id === 'jupiter') {
        lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
      } else {
        lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
        lat += -0.020 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sin(2 * Mj - 6 * Ms - 49);
      }
      xh = r * cos(lon) * cos(lat);
      yh = r * sin(lon) * cos(lat);
      zh = r * sin(lat);
    }
    var xg = xh + s.xs, yg = yh + s.ys, zg = zh;
    var ecl = obliquidade(d);
    var xe = xg, ye = yg * cos(ecl) - zg * sin(ecl), ze = yg * sin(ecl) + zg * cos(ecl);
    return { id: id, nome: NOMES[id], mag: MAG[id], ra: rev(atan2(ye, xe)), dec: atan2(ze, Math.sqrt(xe * xe + ye * ye)), dist: Math.sqrt(xg * xg + yg * yg + zg * zg) };
  }

  function planetas(data) { return Object.keys(ELEM).map(function (id) { return planeta(id, data); }); }

  function lua(data) {
    var d = dias(data);
    var s = sol(data);
    var N = rev(125.1228 - 0.0529538083 * d);
    var i = 5.1454;
    var w = rev(318.0634 + 0.1643573223 * d);
    var a = 60.2666;
    var e = 0.054900;
    var M = rev(115.3654 + 13.0649929509 * d);
    var E = kepler(M, e);
    var xv = a * (cos(E) - e);
    var yv = a * Math.sqrt(1 - e * e) * sin(E);
    var v = atan2(yv, xv);
    var r = Math.sqrt(xv * xv + yv * yv);
    var vw = v + w;
    var xh = r * (cos(N) * cos(vw) - sin(N) * sin(vw) * cos(i));
    var yh = r * (sin(N) * cos(vw) + cos(N) * sin(vw) * cos(i));
    var zh = r * sin(vw) * sin(i);
    var lon = atan2(yh, xh);
    var lat = atan2(zh, Math.sqrt(xh * xh + yh * yh));
    var Ms = s.M, Mm = M;
    var Lm = rev(N + w + M);
    var D = Lm - s.L;
    var F = Lm - N;
    lon += -1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D) - 0.057 * sin(Mm - 2 * D + Ms) + 0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms) - 0.035 * sin(D) - 0.031 * sin(Mm + Ms) - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D);
    lat += -0.173 * sin(F - 2 * D) - 0.055 * sin(Mm - F - 2 * D) - 0.046 * sin(Mm + F - 2 * D) + 0.033 * sin(F + 2 * D) + 0.017 * sin(2 * Mm + F);
    var xg = r * cos(lon) * cos(lat), yg = r * sin(lon) * cos(lat), zg = r * sin(lat);
    var ecl = obliquidade(d);
    var xe = xg, ye = yg * cos(ecl) - zg * sin(ecl), ze = yg * sin(ecl) + zg * cos(ecl);
    var elong = rev(lon - s.lon);
    return { ra: rev(atan2(ye, xe)), dec: atan2(ze, Math.sqrt(xe * xe + ye * ye)), lon: rev(lon), elong: elong, dist: r };
  }

  function faseDaLua(data) {
    var l = lua(data);
    var f = l.elong / 360;
    var ilum = (1 - cos(l.elong)) / 2;
    var nome = f < 0.03 || f > 0.97 ? 'Lua nova' : f < 0.22 ? 'Crescente (fina)' : f < 0.28 ? 'Quarto crescente' : f < 0.47 ? 'Crescente gibosa' : f < 0.53 ? 'Lua cheia' : f < 0.72 ? 'Minguante gibosa' : f < 0.78 ? 'Quarto minguante' : 'Minguante (fina)';
    return { fase: f, iluminada: ilum, nome: nome };
  }

  function gmst(data) { return rev(280.46061837 + 360.98564736629 * (jd(data) - 2451545.0)); }

  function horizonte(ra, dec, data, obs) {
    obs = obs || LOCAL;
    var lst = rev(gmst(data) + obs.lon);
    var ha = lst - ra;
    var sa = sin(dec) * sin(obs.lat) + cos(dec) * cos(obs.lat) * cos(ha);
    var alt = Math.asin(Math.max(-1, Math.min(1, sa))) / R;
    var az = rev(atan2(sin(ha), cos(ha) * sin(obs.lat) - Math.tan(dec * R) * cos(obs.lat)) + 180);
    return { alt: alt, az: az };
  }

  function altSol(data, obs) { var s = sol(data); return horizonte(s.ra, s.dec, data, obs).alt; }

  /* procura o instante em que o Sol cruza a altura dada, na janela [inicio, inicio+24h] */
  function cruzamento(inicio, alvo, subindo, obs) {
    var passo = 10 * 60 * 1000;
    var t0 = inicio.getTime();
    var anterior = altSol(new Date(t0), obs) - alvo;
    for (var t = t0 + passo; t <= t0 + 24 * 3600 * 1000; t += passo) {
      var atual = altSol(new Date(t), obs) - alvo;
      if (subindo ? anterior < 0 && atual >= 0 : anterior > 0 && atual <= 0) {
        var a = t - passo, b = t;
        for (var k = 0; k < 20; k++) {
          var m = (a + b) / 2;
          var v = altSol(new Date(m), obs) - alvo;
          if (subindo ? v < 0 : v > 0) a = m; else b = m;
        }
        return new Date((a + b) / 2);
      }
      anterior = atual;
    }
    return null;
  }

  function nascerEPoente(data, obs) {
    var meia = new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0);
    return { nascer: cruzamento(meia, -0.833, true, obs), poente: cruzamento(meia, -0.833, false, obs) };
  }

  /* índice de cor B-V para rgb aproximado (azul quente ... laranja frio) */
  function corBV(bv) {
    var t = Math.max(-0.3, Math.min(1.8, bv));
    var r, g, b;
    if (t < 0) { r = 0.61 + 0.11 * (t + 0.3) / 0.3; g = 0.70 + 0.1 * (t + 0.3) / 0.3; b = 1; }
    else if (t < 0.4) { r = 0.72 + 0.28 * t / 0.4; g = 0.80 + 0.2 * t / 0.4; b = 1 - 0.1 * t / 0.4; }
    else if (t < 1.0) { r = 1; g = 1 - 0.32 * (t - 0.4) / 0.6; b = 0.9 - 0.45 * (t - 0.4) / 0.6; }
    else { r = 1; g = 0.68 - 0.3 * (t - 1) / 0.8; b = 0.45 - 0.3 * (t - 1) / 0.8; }
    return [r, g, b];
  }

  var api = { LOCAL: LOCAL, jd: jd, dias: dias, sol: sol, lua: lua, planeta: planeta, planetas: planetas, faseDaLua: faseDaLua, gmst: gmst, horizonte: horizonte, altSol: altSol, nascerEPoente: nascerEPoente, corBV: corBV, rev: rev };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Ceu = api;
})(typeof window !== 'undefined' ? window : globalThis);
