/* ============================================================
   O MAPA DA HUMANIDADE (08/out/2026, PERFIL.md item 73)
   A rosa de Florence Nightingale (1858) desenhando o Círculo do Saber da
   Propædia (1974): dez fatias, uma por parte do conhecimento humano. A área
   de cada fatia é proporcional ao número de fichas que você tem nela; os anéis
   são as dez eras; os pontos, os eventos da linha do tempo, na sua era.
   Toque numa fatia (ou use as setas) para abrir a parte numa folha.
   ============================================================ */
(function () {
  'use strict';

  var C = 500, R0 = 92, RMAX = 392;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function n(v) { return Number(v || 0).toLocaleString('pt-BR'); }
  function pol(r, a) { return [C + r * Math.cos(a), C + r * Math.sin(a)]; }
  function fatia(r0, r1, a0, a1) {
    var p0 = pol(r1, a0), p1 = pol(r1, a1), p2 = pol(r0, a1), p3 = pol(r0, a0), g = a1 - a0 > Math.PI ? 1 : 0;
    return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + r1 + ' ' + r1 + ' 0 ' + g + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
      'L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + 'A' + r0 + ' ' + r0 + ' 0 ' + g + ' 0 ' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + 'Z';
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

  /* soma as fichas de cada parte e distribui os eventos */
  function calcular(ind, L) {
    var H = window.HUMANIDADE, porSecao = {}, nomeSecao = {}, dono = {};
    ind.acervos.forEach(function (a) { a.secoes.forEach(function (s) { porSecao[s.id] = s.total; nomeSecao[s.id] = s.nome; }); });
    H.partes.forEach(function (p) { p.secoes.forEach(function (id) { dono[id] = p.id; }); });
    var partes = H.partes.map(function (p) { return { def: p, total: 0, secoes: [], eventos: [] }; });
    var porId = {}; partes.forEach(function (p) { porId[p.def.id] = p; });
    Object.keys(porSecao).forEach(function (id) {
      var p = porId[dono[id] || 'ramos'];
      p.total += porSecao[id];
      p.secoes.push({ id: id, nome: nomeSecao[id], total: porSecao[id] });
    });
    var porArea = {}; partes.forEach(function (p) { p.def.areas.forEach(function (a) { porArea[a] = p; }); });
    (L.EVENTS || []).forEach(function (e) { var p = porArea[e[2]]; if (p) p.eventos.push(e); });
    partes.forEach(function (p) { p.secoes.sort(function (a, b) { return b.total - a.total; }); });
    return partes;
  }

  function desenhar(el, ind, L) {
    var partes = calcular(ind, L), total = partes.reduce(function (s, p) { return s + p.total; }, 0);
    var maior = Math.max.apply(null, partes.map(function (p) { return p.total; }).concat([1]));
    var passo = Math.PI * 2 / partes.length, inicio = -Math.PI / 2 - passo / 2, eras = (L.ERAS || []).length || 10;
    var aneis = '', h = '';
    for (var k = 1; k <= eras; k++) { var rr = R0 + (RMAX - R0) * k / eras; aneis += '<circle class="hm-anel' + (k === eras ? ' ultimo' : '') + '" cx="' + C + '" cy="' + C + '" r="' + rr.toFixed(1) + '"/>'; }
    partes.forEach(function (p, i) {
      var a0 = inicio + i * passo + 0.012, a1 = inicio + (i + 1) * passo - 0.012, am = (a0 + a1) / 2;
      var r1 = Math.sqrt(R0 * R0 + (RMAX * RMAX - R0 * R0) * (p.total / maior)); /* área proporcional, como na rosa */
      var lado = Math.cos(am) >= 0 ? 'start' : 'end', pr = pol(RMAX + 26, am), pd = pol(RMAX + 6, am), pf = pol(r1, am);
      var pontos = p.eventos.map(function (e) {
        var t = hash(e[3] + e[1]), r = R0 + (RMAX - R0) * (e[0] - 0.5) / eras, a = a0 + (a1 - a0) * (0.12 + 0.76 * t);
        var q = pol(r, a);
        return '<circle class="hm-ev" cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="3.4"><title>' + esc(e[1] + ' · ' + e[3]) + '</title></circle>';
      }).join('');
      h += '<g class="hm-parte" data-parte="' + i + '" style="--c:' + p.def.cor + ';--i:' + i + '" tabindex="0" role="button" aria-label="' + esc(p.def.nome + ': ' + p.total + ' fichas, ' + p.eventos.length + ' eventos. Abrir.') + '">' +
        '<path class="hm-fundo" d="' + fatia(R0, RMAX, a0, a1) + '"/>' +
        '<path class="hm-fatia" d="' + fatia(R0, Math.max(R0 + 6, r1), a0, a1) + '"/>' + pontos +
        '<line class="hm-guia" x1="' + pf[0].toFixed(1) + '" y1="' + pf[1].toFixed(1) + '" x2="' + pd[0].toFixed(1) + '" y2="' + pd[1].toFixed(1) + '"/>' +
        '<text class="hm-rot" x="' + pr[0].toFixed(1) + '" y="' + (pr[1] - 4).toFixed(1) + '" text-anchor="' + lado + '">' + esc(p.def.nome) + '</text>' +
        '<text class="hm-num" x="' + pr[0].toFixed(1) + '" y="' + (pr[1] + 14).toFixed(1) + '" text-anchor="' + lado + '">' + n(p.total) + ' fichas · ' + p.eventos.length + ' eventos</text></g>';
    });
    var eraMarcas = '';
    (L.ERAS || []).forEach(function (e, k) {
      if (k % 3 !== 0 && k !== eras - 1) return;
      var rr = R0 + (RMAX - R0) * (k + 0.5) / eras;
      eraMarcas += '<text class="hm-era" x="' + (C + 4) + '" y="' + (C - rr + 3).toFixed(1) + '">' + esc(e.title.split(':')[0]) + '</text>';
    });
    el.innerHTML = '<svg class="hm-svg" viewBox="-130 -10 1260 1020" role="group" aria-label="O mapa da humanidade, em dez partes">' + aneis + h +

      '<circle class="hm-centro" cx="' + C + '" cy="' + C + '" r="' + (R0 - 6) + '"/>' +
      '<text class="hm-c1" x="' + C + '" y="' + (C - 6) + '" text-anchor="middle">' + n(total) + '</text><text class="hm-c2" x="' + C + '" y="' + (C + 20) + '" text-anchor="middle">fichas</text></svg>' +
      '<p class="hm-legenda"><span class="hm-l-aneis" aria-hidden="true"></span>Do centro para a borda, as eras: das <b>' + esc(((L.ERAS || [])[0] || {}).title || 'origens') + '</b> ao <b>' + esc(((L.ERAS || [])[eras - 1] || {}).title || 'século XXI') + '</b>. Cada ponto é um evento.</p>';
    var svg = el.querySelector('svg'), gs = svg.querySelectorAll('.hm-parte');
    /* na tela estreita, a rosa recorta no círculo e os nomes ficam só na lista ao lado */
    function ajustar() { var estreito = el.clientWidth < 560; svg.setAttribute('viewBox', estreito ? '96 96 808 808' : '-130 -10 1260 1020'); svg.classList.toggle('estreito', estreito); }
    ajustar(); window.addEventListener('resize', ajustar);
    function abrir(i) {
      var p = partes[i], H = window.HUMANIDADE;
      var porEra = {}; p.eventos.forEach(function (e) { (porEra[e[0]] = porEra[e[0]] || []).push(e); });
      var html = '<p class="hm-f-frase">' + esc(p.def.frase) + '</p>' +
        '<div class="hm-f-num"><span><b>' + n(p.total) + '</b> fichas</span><span><b>' + p.secoes.length + '</b> seções</span><span><b>' + p.eventos.length + '</b> eventos</span></div>' +
        '<h3 class="hm-f-t">As seções</h3><div class="hm-f-secoes">' + p.secoes.map(function (s) {
          return '<a class="hm-f-sec" href="biblioteca.html#s=' + encodeURI(s.id) + '"><b>' + esc(s.nome) + '</b><span>' + s.total + (s.total === 1 ? ' ficha' : ' fichas') + '</span></a>';
        }).join('') + '</div>' +
        (p.eventos.length ? '<h3 class="hm-f-t">Na linha do tempo</h3><ol class="hm-f-eventos">' + Object.keys(porEra).sort(function (a, b) { return a - b; }).map(function (k) {
          var era = (L.ERAS || []).filter(function (x) { return String(x.n) === String(k); })[0];
          return '<li><a href="linha-do-tempo.html#e' + k + '"><span>' + esc(era ? era.title : 'Era ' + k) + '</span><b>' + porEra[k].map(function (e) { return esc(e[3]); }).join(' · ') + '</b></a></li>';
        }).join('') + '</ol>' : '') +
        '<p class="hm-f-fonte">' + 'A divisão em dez partes vem da <a href="' + H.fonte[1] + '" target="_blank" rel="noopener">Propædia</a>; o desenho, da <a href="' + H.fonteRosa[1] + '" target="_blank" rel="noopener">rosa de Nightingale</a>.</p>';
      if (window.Perfil && window.Perfil.folha) window.Perfil.folha({ titulo: esc(p.def.nome), sub: 'O mapa da humanidade · parte ' + (i + 1) + ' de ' + partes.length, html: html });
    }
    svg.addEventListener('click', function (ev) { var g = ev.target.closest('.hm-parte'); if (g) abrir(+g.getAttribute('data-parte')); });
    svg.addEventListener('keydown', function (ev) {
      var g = ev.target.closest('.hm-parte'); if (!g) return;
      var i = +g.getAttribute('data-parte');
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(i); }
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') { ev.preventDefault(); gs[(i + 1) % gs.length].focus(); }
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') { ev.preventDefault(); gs[(i - 1 + gs.length) % gs.length].focus(); }
    });
    /* a rosa floresce quando entra na tela */
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { el.classList.add('aberta'); ob.disconnect(); } }); }, { threshold: 0.2 });
      ob.observe(el);
    } else el.classList.add('aberta');
    return { partes: partes, abrir: abrir };
  }

  window.MapaHumanidade = { desenhar: desenhar, calcular: calcular };
})();
