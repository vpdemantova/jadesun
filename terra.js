/* ============================================================
   A TERRA, AGORA — o mapa vivo do Atlas (08/out/2026, PERFIL.md item 73)
   Camadas: oceano · grade · continentes · a noite real (pixel a pixel, com o sol
   deste minuto, o mesmo motor do céu do Jardim e do arco do Hoje) · as cidades,
   que acendem do lado escuro · o sol a pino · a Lua · você, em Campinas.
   Ao abrir, a Terra gira até a hora certa. Atualiza a cada minuto.
   Dados: Natural Earth (domínio público), projeção Equal Earth (terra-dados.js).
   ============================================================ */
(function () {
  'use strict';

  var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, M = Math.sqrt(3) / 2, R = Math.PI / 180;
  var CAMPINAS = [-47.06, -22.91];

  function projetar(T, lon, lat) {
    var l = lon * R, p = lat * R, t = Math.asin(M * Math.sin(p)), t2 = t * t, t6 = t2 * t2 * t2;
    var x = l * Math.cos(t) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
    var y = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
    return [(x + T.xmax) * T.s, (T.ymax - y) * T.s];
  }
  /* o inverso (Newton): do papel para latitude e longitude; null fora do mundo */
  function inverso(T, X, Y) {
    var x = X / T.s - T.xmax, y = T.ymax - Y / T.s, t = y;
    for (var i = 0; i < 6; i++) {
      var t2 = t * t, t6 = t2 * t2 * t2;
      var f = t * (A1 + A2 * t2 + t6 * (A3 + A4 * t2)) - y, d = A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2);
      t -= f / d;
    }
    if (Math.abs(t) > Math.PI / 2) return null;
    var tt = t * t, t66 = tt * tt * tt, dd = A1 + 3 * A2 * tt + t66 * (7 * A3 + 9 * A4 * tt);
    var lon = M * x * dd / Math.cos(t), s = Math.sin(t) / M;
    if (Math.abs(lon) > Math.PI || Math.abs(s) > 1) return null;
    return [lon / R, Math.asin(s) / R];
  }

  function pontoSob(C, corpo, data) {
    var p = corpo === 'lua' ? C.lua(data) : C.sol(data);
    var lon = p.ra - C.gmst(data);
    lon = ((lon + 540) % 360) - 180;
    return [lon, p.dec];
  }
  function altitude(lon, lat, sLon, sLat) {
    var c = Math.sin(lat * R) * Math.sin(sLat * R) + Math.cos(lat * R) * Math.cos(sLat * R) * Math.cos((lon - sLon) * R);
    return Math.asin(Math.max(-1, Math.min(1, c))) / R;
  }

  /* a noite: uma imagem pequena, suavizada pelo navegador; a cor do crepúsculo vem do horizonte */
  var LARG = 400, ALT = 195;
  function noite(T, mapa, sLon, sLat) {
    var cv = document.createElement('canvas'); cv.width = LARG; cv.height = ALT;
    var cx = cv.getContext('2d'), img = cx.createImageData(LARG, ALT), d = img.data;
    for (var j = 0; j < ALT; j++) for (var i = 0; i < LARG; i++) {
      var k = (j * LARG + i) * 4, ll = mapa[j * LARG + i];
      if (!ll) { d[k + 3] = 0; continue; }
      var h = altitude(ll[0], ll[1], sLon, sLat);
      var a = h > 1 ? 0 : h > -18 ? Math.pow((1 - h) / 19, 0.9) * 0.56 : 0.56;
      var brilho = h < 2 && h > -7 ? Math.max(0, 1 - Math.abs(h + 1.5) / 5.5) * 0.24 : 0;
      d[k] = 8 + 220 * brilho; d[k + 1] = 18 + 120 * brilho; d[k + 2] = 48 + 12 * brilho; d[k + 3] = Math.round(Math.min(1, a + brilho) * 255);
    }
    cx.putImageData(img, 0, 0);
    return cv.toDataURL('image/png');
  }
  var mapaCache = null;
  function mapaLatLon(T) {
    if (mapaCache) return mapaCache;
    mapaCache = new Array(LARG * ALT);
    for (var j = 0; j < ALT; j++) for (var i = 0; i < LARG; i++) mapaCache[j * LARG + i] = inverso(T, (i + 0.5) / LARG * T.w, (j + 0.5) / ALT * T.h);
    return mapaCache;
  }

  function hhmm(h) { h = ((h % 24) + 24) % 24; var hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh = (hh + 1) % 24; mm = 0; } return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* o país em português, pelo próprio navegador (código ISO do Natural Earth) */
  var nomesPais = null;
  try { nomesPais = new Intl.DisplayNames(['pt-BR'], { type: 'region' }); } catch (e) {}
  var PAIS_PT = { CD: 'República Democrática do Congo', CG: 'República do Congo' };
  function pais(c) { if (PAIS_PT[c[7]]) return PAIS_PT[c[7]]; try { if (nomesPais && c[7]) return nomesPais.of(c[7]); } catch (e) {} return c[6]; }

  function montar(el, op) {
    op = op || {};
    var T = window.TERRA, C = window.Ceu;
    if (!el || !T || !C) return null;
    var voce = projetar(T, CAMPINAS[0], CAMPINAS[1]);
    var rotulo = op.rotulo || 'você · Campinas'; /* no site público: só "Campinas" (item 77) */
    el.classList.add('terra');
    el.innerHTML = '<svg class="terra-svg" viewBox="0 0 ' + T.w + ' ' + T.h + '" role="img" aria-label="A Terra agora: o lado do dia e o da noite, as cidades e o lugar onde o sol está a pino">' +
      '<defs><clipPath id="terra-clip"><path d="' + T.borda + '"/></clipPath>' +
      '<radialGradient id="terra-luz"><stop offset="0" stop-color="#FFE3A3" stop-opacity="1"/><stop offset=".35" stop-color="#FFC56B" stop-opacity=".55"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="terra-halo"><stop offset="0" stop-color="#FFD27A" stop-opacity=".55"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient></defs>' +
      '<path class="terra-oceano" d="' + T.borda + '"/>' +
      '<path class="terra-grade" d="' + T.grade + '" clip-path="url(#terra-clip)"/>' +
      '<path class="terra-terra" d="' + T.terra + '" clip-path="url(#terra-clip)"/>' +
      '<g clip-path="url(#terra-clip)"><image class="terra-noite" x="0" y="0" width="' + T.w + '" height="' + T.h + '" preserveAspectRatio="none"/></g>' +
      '<path class="terra-borda" d="' + T.borda + '"/>' +
      '<g class="terra-cidades"></g>' +
      '<g class="terra-lua"><circle r="5"/><path d=""/><text y="-11" text-anchor="middle">Lua</text></g>' +
      '<g class="terra-sol"><circle class="ts-halo" r="26"/><circle class="ts-disco" r="7"/><path class="ts-raios" d="M0-15v5M0 10v5M-15 0h5M10 0h5M-10.6-10.6l3.5 3.5M7.1 7.1l3.5 3.5M-10.6 10.6l3.5-3.5M7.1-7.1l3.5-3.5"/><text y="-22" text-anchor="middle">o sol a pino</text></g>' +
      '<g class="terra-voce" transform="translate(' + voce[0].toFixed(1) + ' ' + voce[1].toFixed(1) + ')"><circle class="tv-onda" r="5"/><circle class="tv-ponto" r="4.2"/><g class="tv-etiqueta" transform="translate(10 -9)"><rect width="' + Math.round(14 + rotulo.length * 6.3) + '" height="18" rx="5"/><text x="7" y="12.5">' + rotulo + '</text></g></g>' +
      '</svg><div class="terra-tip" role="tooltip" hidden></div>';
    var svg = el.querySelector('svg'), imgNoite = el.querySelector('.terra-noite'), gCid = el.querySelector('.terra-cidades');
    var gSol = el.querySelector('.terra-sol'), gLua = el.querySelector('.terra-lua'), tip = el.querySelector('.terra-tip');
    var cidades = T.cidades.slice(0, op.cidades || 243);
    gCid.innerHTML = cidades.map(function (c, i) {
      var r = Math.max(1.1, Math.min(4.2, Math.log10(Math.max(c[4], 1e4)) - 4.1));
      return '<g class="tc" data-i="' + i + '" transform="translate(' + c[0] + ' ' + c[1] + ')"><circle class="tc-luz" r="' + (r * 4.2).toFixed(1) + '" fill="url(#terra-luz)"/><circle class="tc-ponto" r="' + r.toFixed(2) + '"/></g>';
    }).join('');
    var gs = gCid.querySelectorAll('.tc');

    var estado = { sLon: 0, sLat: 0 };
    function pintar(sLon, sLat, data) {
      estado.sLon = sLon; estado.sLat = sLat;
      imgNoite.setAttribute('href', noite(T, mapaLatLon(T), sLon, sLat));
      var ps = projetar(T, sLon, sLat);
      gSol.setAttribute('transform', 'translate(' + ps[0].toFixed(1) + ' ' + ps[1].toFixed(1) + ')');
      cidades.forEach(function (c, i) {
        var h = altitude(c[2], c[3], sLon, sLat);
        var g = gs[i];
        g.style.setProperty('--noite', h < 0 ? Math.min(1, -h / 8).toFixed(2) : '0');
        g.classList.toggle('acesa', h < -2);
      });
      if (data) {
        var pl = pontoSob(C, 'lua', data), pp = projetar(T, pl[0], pl[1]);
        gLua.setAttribute('transform', 'translate(' + pp[0].toFixed(1) + ' ' + pp[1].toFixed(1) + ')');
        if (op.aoAtualizar) op.aoAtualizar(resumoAgora(sLon, sLat, data));
      }
    }
    /* o mundo agora, em uma frase: quantas cidades estão de noite e onde o sol está a pino */
    function distancia(lon1, lat1, lon2, lat2) {
      var a = Math.sin((lat2 - lat1) * R / 2), b = Math.sin((lon2 - lon1) * R / 2);
      return 2 * Math.asin(Math.sqrt(a * a + Math.cos(lat1 * R) * Math.cos(lat2 * R) * b * b)) / R;
    }
    function resumoAgora(sLon, sLat, data) {
      var noite = 0, pessoas = 0, perto = null, dPerto = 1e9;
      T.cidades.forEach(function (c) {
        if (altitude(c[2], c[3], sLon, sLat) < 0) { noite++; pessoas += c[4]; }
        var d = distancia(c[2], c[3], sLon, sLat); if (d < dPerto) { dPerto = d; perto = c; }
      });
      return { noite: noite, total: T.cidades.length, pessoasNoite: pessoas, perto: perto, distancia: dPerto, hora: data };
    }

    function agora() { var q = new URLSearchParams(location.search).get('hora'); if (q && /^\d{1,2}:\d{2}$/.test(q)) { var d = new Date(); var p = q.split(':'); d.setHours(+p[0], +p[1], 0, 0); return d; } return new Date(); }
    function atualizar(animar) {
      var data = agora(), s = pontoSob(C, 'sol', data);
      var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!animar || reduz || document.documentElement.getAttribute('data-anima') === 'off') return pintar(s[0], s[1], data);
      /* a abertura: a Terra gira 48° até a hora de agora */
      var de = s[0] + 48, quadros = 14, k = 0;
      (function passo() {
        var t = k / quadros, e = 1 - Math.pow(1 - t, 3);
        pintar(de + (s[0] - de) * e, s[1], data);
        if (++k <= quadros) setTimeout(function () { requestAnimationFrame(passo); }, 40);
      })();
    }

    /* a dica: a cidade, a hora solar de lá e se é dia ou noite */
    svg.addEventListener('pointermove', function (ev) {
      var g = ev.target.closest && ev.target.closest('.tc');
      if (!g) { tip.hidden = true; return; }
      var c = cidades[+g.getAttribute('data-i')], data = agora();
      var h = altitude(c[2], c[3], estado.sLon, estado.sLat);
      var utc = data.getUTCHours() + data.getUTCMinutes() / 60, solar = utc + c[2] / 15;
      var r = el.getBoundingClientRect();
      tip.innerHTML = '<b>' + esc(c[5]) + '</b><span>' + esc(pais(c)) + '</span><span>' + (h > 0 ? 'dia, sol a ' + Math.round(h) + '°' : h > -6 ? 'crepúsculo' : 'noite') + ' · ' + hhmm(solar) + ' (hora solar)</span>';
      tip.hidden = false;
      tip.style.left = Math.min(r.width - 220, ev.clientX - r.left + 14) + 'px';
      tip.style.top = (ev.clientY - r.top + 14) + 'px';
    });
    svg.addEventListener('pointerleave', function () { tip.hidden = true; });

    atualizar(true);
    var relogio = setInterval(function () { if (!document.body.contains(el)) return clearInterval(relogio); atualizar(false); }, 60000);
    return { atualizar: atualizar };
  }

  window.TerraAgora = { montar: montar, projetar: projetar, inverso: inverso, pais: pais };
})();
