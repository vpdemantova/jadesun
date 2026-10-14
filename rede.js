/* ============================================================
   Portal Solar · rede.js (13/out/2026) — a Rede da Vida, desenhada.
   Pedido: "mostrar a rede, e ter as fotos nos cards".

   Você no centro (o Quadrado), os seus elos em volta (com o retrato do Atlas
   quando a pessoa está lá) e, num segundo anel, quem as fichas desses elos
   citam no Atlas: a rede de verdade, um passo além da sua mesa. Passar o
   mouse ou o foco num elo mostra o porquê; tocar abre o elo.

   RedeVida.html({ id, centro: { nome }, elos: [{ titulo, corpo, i }], compacta })
   RedeVida.montar(el, { fotoDe(nome), segundo: true })   — linhas, fotos, legenda e 2º anel
   Os nós dos elos são <button data-a="rede-elo" data-i>, que o eu.js já sabe abrir.
   ============================================================ */
(function () {
  'use strict';
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function iniciais(nome) { return String(nome || '·').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join(''); }
  function corta(s, n) { s = String(s || '').split('\n')[0]; return s.length > n ? s.slice(0, n - 1).replace(/[\s,;:]+\S*$/, '') + '…' : s; }

  /* as posições, em % da caixa: um anel (ou dois, se forem muitos) em elipse */
  function posicoes(n, rx, ry) {
    var p = [];
    for (var k = 0; k < n; k++) {
      var duplo = n > 12, r = duplo && k % 2 ? 0.78 : 1;
      var a = -Math.PI / 2 + (2 * Math.PI * k) / n;
      p.push({ x: 50 + Math.cos(a) * rx * r, y: 50 + Math.sin(a) * ry * r, a: a });
    }
    return p;
  }

  function html(o) {
    var elos = o.elos || [];
    var id = o.id || 'rdv';
    var ps = posicoes(elos.length, 33, 31);
    var q = window.Icones && window.Icones.quadrado ? window.Icones.quadrado('rdv-q-svg') : '<svg class="rdv-q-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3z"/></svg>';
    if (!elos.length) {
      return '<div class="rdv rdv-vazia' + (o.compacta ? ' compacta' : '') + '" id="' + esc(id) + '"><div class="rdv-centro" style="left:50%;top:50%"><span class="rdv-q">' + q + '</span><b>' + esc(o.centro && o.centro.nome || 'Você') + '</b><small>você</small></div>' +
        '<p class="rdv-legenda rdv-legenda-vazia">A sua rede nasce do primeiro elo: alguém do Atlas, ou a carta de um amigo, com o porquê escrito.</p></div>';
    }
    return '<div class="rdv' + (o.compacta ? ' compacta' : '') + '" id="' + esc(id) + '" data-n="' + elos.length + '">' +
      '<svg class="rdv-fios" aria-hidden="true" focusable="false"></svg>' +
      '<div class="rdv-centro" style="left:50%;top:50%"><span class="rdv-q">' + q + '</span><b>' + esc(o.centro && o.centro.nome || 'Você') + '</b><small>você</small></div>' +
      elos.map(function (e, k) {
        var p = ps[k];
        var rotulo = e.titulo + (e.corpo ? ': ' + corta(e.corpo, 140) : '');
        return '<button type="button" class="rdv-no rdv-1" data-a="rede-elo" data-i="' + e.i + '" data-k="' + k + '" data-foto="' + esc(e.titulo) + '" data-porque="' + esc(corta(e.corpo || 'sem o porquê ainda', 160)) + '"' +
          ' style="left:' + p.x.toFixed(2) + '%;top:' + p.y.toFixed(2) + '%;--k:' + k + '" aria-label="' + esc(rotulo) + '">' +
          '<span class="rdv-ini" aria-hidden="true">' + esc(iniciais(e.titulo)) + '</span><span class="rdv-nome">' + esc(e.titulo) + '</span></button>';
      }).join('') +
      '<p class="rdv-legenda" aria-hidden="true">Passe o mouse num elo para ler o porquê. Tocar abre o elo.</p>' +
    '</div>';
  }

  /* as linhas são desenhadas em pixels (a caixa muda de tamanho; um ResizeObserver redesenha) */
  function desenharFios(el) {
    var svg = el.querySelector('.rdv-fios');
    if (!svg) return;
    var w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    var centro = { x: w / 2, y: h / 2 };
    var pos = function (no) { return { x: parseFloat(no.style.left) / 100 * w, y: parseFloat(no.style.top) / 100 * h }; };
    var linhas = [];
    el.querySelectorAll('.rdv-1').forEach(function (no) {
      var p = pos(no);
      linhas.push('<line class="rdv-fio" data-k="' + no.dataset.k + '" x1="' + centro.x.toFixed(1) + '" y1="' + centro.y.toFixed(1) + '" x2="' + p.x.toFixed(1) + '" y2="' + p.y.toFixed(1) + '" pathLength="1" style="--k:' + no.dataset.k + '"/>');
    });
    el.querySelectorAll('.rdv-2').forEach(function (no) {
      var pai = el.querySelector('.rdv-1[data-k="' + no.dataset.de + '"]');
      if (!pai) return;
      var a = pos(pai), b = pos(no);
      linhas.push('<line class="rdv-fio rdv-fio-2" data-k="' + no.dataset.de + '" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '" pathLength="1" style="--k:' + (+no.dataset.de + 4) + '"/>');
    });
    svg.innerHTML = linhas.join('');
  }

  function legenda(el, no) {
    var p = el.querySelector('.rdv-legenda');
    if (!p) return;
    el.querySelectorAll('.rdv-fio.on, .rdv-no.on').forEach(function (x) { x.classList.remove('on'); });
    if (!no) { p.innerHTML = p.dataset.padrao || p.innerHTML; return; }
    if (!p.dataset.padrao) p.dataset.padrao = p.innerHTML;
    var k = no.classList.contains('rdv-2') ? no.dataset.de : no.dataset.k;
    el.querySelectorAll('.rdv-fio[data-k="' + k + '"]').forEach(function (x) { x.classList.add('on'); });
    no.classList.add('on');
    p.innerHTML = no.classList.contains('rdv-2')
      ? '<b>' + esc(no.dataset.nome) + '</b> · na ficha de ' + esc(no.dataset.denome) + ', no Atlas. Tocar abre a ficha.'
      : '<b>' + esc(no.querySelector('.rdv-nome').textContent) + '</b> · ' + esc(no.dataset.porque);
  }

  function porFoto(el, fotoDe) {
    if (!fotoDe) return;
    el.querySelectorAll('.rdv-no[data-foto]:not(.com-foto)').forEach(function (no) {
      var u = fotoDe(no.dataset.foto);
      if (!u) return;
      no.classList.add('com-foto');
      no.insertAdjacentHTML('afterbegin', '<img class="rdv-foto" src="' + esc(u) + '" alt="" loading="lazy" decoding="async">');
    });
  }

  /* o segundo anel: as pessoas que a ficha de cada elo cita (do /api/carta), até duas por elo */
  function segundoAnel(el, fotoDe) {
    var nos = [].slice.call(el.querySelectorAll('.rdv-1'));
    if (!nos.length || el.dataset.segundo) return;
    el.dataset.segundo = '1';
    var ja = {};
    nos.forEach(function (no) { ja[no.dataset.foto.toLowerCase()] = 1; });
    var total = 0, MAX = nos.length > 10 ? 10 : 14;
    nos.forEach(function (no) {
      fetch('/api/carta?nome=' + encodeURIComponent(no.dataset.foto)).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (c) {
        if (!c || !c.elos || !document.body.contains(el)) return;
        var pessoas = c.elos.filter(function (x) { return /^atlas\/3-people\//.test(x.id) && !ja[String(x.titulo).toLowerCase()]; }).slice(0, 2);
        pessoas.forEach(function (x, j) {
          if (total >= MAX) return;
          total++; ja[String(x.titulo).toLowerCase()] = 1;
          var a = Math.atan2((parseFloat(no.style.top) - 50) / 31, (parseFloat(no.style.left) - 50) / 33);
          var desvio = (pessoas.length === 1 ? 0 : (j ? 0.2 : -0.2));
          var x2 = 50 + Math.cos(a + desvio) * 46, y2 = 50 + Math.sin(a + desvio) * 44;
          x2 = Math.max(5, Math.min(95, x2)); y2 = Math.max(6, Math.min(92, y2));
          el.insertAdjacentHTML('beforeend', '<a class="rdv-no rdv-2" href="biblioteca.html#f=' + encodeURI(x.id) + '" data-de="' + no.dataset.k + '" data-denome="' + esc(no.dataset.foto) + '" data-nome="' + esc(x.titulo) + '" data-foto="' + esc(x.titulo) + '"' +
            ' style="left:' + x2.toFixed(2) + '%;top:' + y2.toFixed(2) + '%;--k:' + (+no.dataset.k + 6) + '" aria-label="' + esc(x.titulo + ', na ficha de ' + no.dataset.foto + ' no Atlas') + '">' +
            '<span class="rdv-ini" aria-hidden="true">' + esc(iniciais(x.titulo)) + '</span><span class="rdv-nome">' + esc(x.titulo) + '</span></a>');
        });
        porFoto(el, fotoDe);
        desenharFios(el);
      });
    });
  }

  /* cada redesenho da página cria caixas novas: os observadores das que saíram da página são desligados */
  var vivos = [];
  function limpar() { vivos = vivos.filter(function (v) { if (v.el.isConnected) return true; if (v.ro) v.ro.disconnect(); if (v.io) v.io.disconnect(); return false; }); }
  function montar(el, o) {
    limpar();
    if (!el || el.dataset.montada) return;
    el.dataset.montada = '1';
    o = o || {};
    var reg = { el: el };
    vivos.push(reg);
    porFoto(el, o.fotoDe);
    desenharFios(el);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(function () { desenharFios(el); }); ro.observe(el); reg.ro = ro; }
    el.addEventListener('pointerover', function (ev) { var no = ev.target.closest('.rdv-no'); if (no) legenda(el, no); });
    el.addEventListener('pointerleave', function () { legenda(el, null); });
    el.addEventListener('focusin', function (ev) { var no = ev.target.closest('.rdv-no'); if (no) legenda(el, no); });
    el.addEventListener('focusout', function (ev) { if (!el.contains(ev.relatedTarget)) legenda(el, null); });
    if (o.segundo) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); segundoAnel(el, o.fotoDe); } }, { rootMargin: '200px' });
        io.observe(el); reg.io = io;
      } else segundoAnel(el, o.fotoDe);
    }
    if (REDUZIR) el.classList.add('rdv-calma');
  }

  /* chamada de novo quando os retratos chegam depois do desenho */
  function fotos(el, fotoDe) { if (el) porFoto(el, fotoDe); }

  window.RedeVida = { html: html, montar: montar, fotos: fotos, iniciais: iniciais };
})();
