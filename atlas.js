(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var raiz = document.getElementById('atlas');
  var q = document.getElementById('atlas-q');
  var quando = document.getElementById('atlas-quando');
  if (quando) quando.textContent = P.dataExtenso();

  document.getElementById('atlas-busca').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = q.value.trim();
    location.href = 'biblioteca.html' + (v ? '#q=' + encodeURIComponent(v) : '');
  });

  function n(v) { return Number(v || 0).toLocaleString('pt-BR'); }

  function perguntas(ind, lac, L) {
    var semFicha = lac ? lac.semFicha.length : null;
    var curtas = lac ? lac.curtas.reduce(function (s, x) { return s + x.curtas; }, 0) : null;
    var acaso = ind.itens[Math.floor(Math.random() * ind.itens.length)];
    return '<section class="atlas-perg" aria-label="As perguntas do Atlas">' +
      '<a class="cx ap" href="biblioteca.html"><p class="rot">O que existe?</p><b class="ap-n">' + n(ind.total) + '</b><span>fichas e ' + n(ind.imagens) + ' imagens</span><em>Abrir a biblioteca</em></a>' +
      '<a class="cx ap" href="linha-do-tempo.html"><p class="rot">Quando e quem?</p><b class="ap-n">' + n(L.EVENTS.length) + '</b><span>eventos em ' + L.ERAS.length + ' eras, das origens até hoje</span><em>Abrir a linha do tempo</em></a>' +
      '<a class="cx ap" href="falta.html"><p class="rot">O que falta?</p><b class="ap-n">' + (semFicha == null ? '—' : n(semFicha)) + '</b><span>nomes citados que ainda não têm ficha' + (curtas != null ? ' e ' + n(curtas) + ' fichas curtas' : '') + '</span><em>Abrir a cadeia da Terra</em></a>' +
      '<a class="cx ap ap-acaso" href="biblioteca.html#f=' + encodeURI(acaso[0]) + '" id="ap-acaso"><p class="rot">Surpreenda-me</p><b class="ap-n">?</b><span>uma ficha ao acaso: ' + esc(acaso[1]) + '</span><em>Abrir esta ficha</em></a>' +
      '</section>';
  }

  function eras(L) {
    var porEra = {};
    L.EVENTS.forEach(function (e) {
      var o = porEra[e[0]] || (porEra[e[0]] = { total: 0, areas: {} });
      o.total += 1;
      o.areas[e[2]] = (o.areas[e[2]] || 0) + 1;
    });
    var maior = Math.max.apply(null, L.ERAS.map(function (e) { return (porEra[e.n] || { total: 0 }).total; }).concat([1]));
    return '<section class="atlas-sec" aria-labelledby="at-eras"><header><h2 class="h2" id="at-eras">A linha do tempo, era por era</h2><span class="rot suave">a altura mostra quantos eventos já estão contados</span></header>' +
      '<div class="atlas-eras">' + L.ERAS.map(function (e) {
        var o = porEra[e.n] || { total: 0, areas: {} };
        var barras = L.AREAS.filter(function (a) { return o.areas[a.code]; }).map(function (a) { return '<i class="' + a.code + '" style="flex:' + o.areas[a.code] + '" title="' + esc(a.name) + ': ' + o.areas[a.code] + '"></i>'; }).join('');
        return '<a class="era" href="linha-do-tempo.html#e' + e.n + '" style="--h:' + Math.round(20 + 80 * o.total / maior) + '%"><span class="era-n">' + e.n + '</span><b>' + esc(e.title) + '</b><span class="rot">' + esc(e.range) + '</span><span class="era-b">' + barras + '</span><span class="era-c">' + o.total + ' eventos</span></a>';
      }).join('') + '</div></section>';
  }

  function acervos(ind) {
    return '<section class="atlas-sec" aria-labelledby="at-acervos"><header><h2 class="h2" id="at-acervos">O que existe, por seção</h2><span class="rot suave">' + n(ind.total) + ' fichas</span></header>' +
      ind.acervos.map(function (a) {
        return '<div class="atlas-acervo"><p class="rot">' + esc(a.nome) + ' · ' + n(a.total) + ' fichas</p><div class="atlas-tiles">' + a.secoes.map(function (s) {
          var capa = s.capas && s.capas[0] ? '<img src="' + esc(s.capas[0]) + '" alt="" loading="lazy" decoding="async">' : '';
          return '<a class="at-tile ' + P.corDe(s.nome) + '" href="biblioteca.html#s=' + encodeURI(s.id) + '">' + capa + '<span class="at-t"><b>' + esc(s.nome) + '</b><span class="rot">' + s.total + (s.total === 1 ? ' ficha' : ' fichas') + (s.imagens ? ' · ' + s.imagens + ' img' : '') + '</span></span></a>';
        }).join('') + '</div></div>';
      }).join('') + '</section>';
  }

  function falta(lac) {
    if (!lac) return '';
    var topo = lac.semFicha[0];
    var lista = lac.semFicha.slice(0, 14);
    var curtas = lac.curtas.slice().sort(function (a, b) { return b.curtas / b.total - a.curtas / a.total; }).slice(0, 6);
    return '<section class="atlas-sec" aria-labelledby="at-falta"><header><h2 class="h2" id="at-falta">O que falta, e o próximo tijolo</h2><span class="rot suave">medido nas fichas do Atlas</span></header>' +
      '<div class="atlas-falta">' +
      (topo ? '<div class="cx at-proximo"><p class="rot">Próximo tijolo · 30 min</p><h3 class="h3">Escrever a ficha de “' + esc(topo.nome) + '”</h3><p>Citado ' + topo.vezes + (topo.vezes === 1 ? ' vez' : ' vezes') + ' em ' + topo.citadoPor.map(function (c) { return '<a href="biblioteca.html#f=' + encodeURI(c.id) + '">' + esc(c.titulo) + '</a>'; }).join(', ') + ', mas ainda sem ficha própria. Um fio fechado vale mais do que dez pontas soltas.</p></div>' : '') +
      '<div class="cx"><p class="rot">Também citados sem ficha</p><p class="at-chips">' + lista.map(function (f) {
        return '<span class="chip-h sem" title="Citado ' + f.vezes + ' vez(es) em: ' + esc(f.citadoPor.map(function (c) { return c.titulo; }).join(', ')) + '">' + esc(f.nome) + ' <small>' + f.vezes + '</small></span>';
      }).join('') + '</p></div>' +
      '<div class="cx"><p class="rot">Seções com mais fichas curtas</p><ul class="at-curtas">' + curtas.map(function (s) {
        var pct = s.total ? Math.round(s.curtas / s.total * 100) : 0;
        return '<li><a href="biblioteca.html#s=' + encodeURI(s.secaoId) + '"><span>' + esc(s.secao) + '</span><span class="rot">' + s.curtas + '/' + s.total + '</span><span class="at-b"><i style="width:' + pct + '%"></i></span></a></li>';
      }).join('') + '</ul><p class="rot suave">Ficha curta: menos de 900 caracteres e sem seções. Boa para ampliar quando sobrar tempo.</p></div>' +
      '</div></section>';
  }

  Promise.all([
    fetch('/api/biblioteca').then(function (r) { if (!r.ok) throw new Error('biblioteca'); return r.json(); }),
    fetch('/api/lacunas').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
  ]).then(function (r) {
    var ind = r[0], lac = r[1], L = window.LINHA || { EVENTS: [], ERAS: [], AREAS: [] };
    raiz.innerHTML = perguntas(ind, lac, L) + eras(L) + acervos(ind) + falta(lac);
    if (window.Movimento) window.Movimento.revalidar();
  }).catch(function () {
    raiz.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b> (na pasta jadesun) e deixe a janelinha preta aberta.</p></div>';
  });
})();
