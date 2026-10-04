/* ============================================================
   CARTA — Fichário do Atlas, fase F1 (03/out/2026)
   carta.html?nome=Johann Sebastian Bach  (ou ?id=atlas/…)
   Desenha a carta em milímetros (63 × 88) a partir de /api/carta
   (lib/cartas.mjs). "Uma carta" imprime com marcas de corte;
   "Folha A4 com 9" imprime a grade 3 × 3 de uma folha de fichário.
   ============================================================ */
(function () {
  'use strict';

  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var params = new URLSearchParams(location.search);
  var atual = null;
  var modo = params.get('modo') === '9' ? '9' : '1';
  var folha = document.getElementById('ct-folha');
  var escala = document.getElementById('ct-escala');
  var palco = document.getElementById('ct-palco');
  var MM = 96 / 25.4; /* px por milímetro, em CSS */

  function cartaHtml(c) {
    var img = c.imagem
      ? '<img src="' + esc(c.imagem) + '" alt="">'
      : '<span class="cc-silhueta" aria-hidden="true"></span><span class="cc-sem">ainda sem imagem no Atlas</span>';
    var feitos = c.feitos.length
      ? '<ul class="cc-feitos">' + c.feitos.map(function (f) { return '<li><b>' + esc(f.titulo) + '</b>' + (f.ano ? ' <span>' + esc(f.ano) + '</span>' : '') + '</li>'; }).join('') + '</ul>'
      : '';
    var elos = c.elos.length ? '<p class="cc-elos"><span>Elos</span> ' + c.elos.map(function (e) { return esc(e.titulo); }).join(' · ') + '</p>' : '';
    var cred = c.credito && (c.credito.autor || c.credito.licenca)
      ? 'imagem: ' + esc([c.credito.autor, c.credito.licenca].filter(Boolean).join(' · '))
      : (c.imagem ? '' : 'Atlas · Jadesun');
    var num = c.colecao ? esc(c.colecao.sigla) + ' ' + esc(c.colecao.numero) + '/' + esc(c.colecao.total) : '';
    return '<article class="cc ' + esc(c.classe) + '" aria-label="Carta: ' + esc(c.titulo) + '">' +
      '<div class="cc-dentro">' +
      '<header class="cc-topo"><span>' + esc(c.tipo) + ' · ' + esc(c.area) + '</span><span class="cc-rar">◆ ' + esc(c.raridade) + '</span></header>' +
      '<h2 class="cc-nome">' + esc(c.titulo) + '</h2>' +
      '<div class="cc-img">' + img + '</div>' +
      (c.dados.length ? '<p class="cc-dados">' + c.dados.map(esc).join(' · ') + '</p>' : '') +
      feitos + elos +
      (c.frase ? '<p class="cc-frase">' + esc(c.frase) + '</p>' : '') +
      '<footer class="cc-pe"><span class="cc-cred">' + cred + '</span><span class="cc-num">' + num + '</span></footer>' +
      '</div></article>';
  }

  /* marcas de corte: traços curtos fora da área das cartas, nas linhas de corte */
  function marcas(xs, ys, x0, x1, y0, y1) {
    var h = '';
    xs.forEach(function (x) {
      h += '<i class="ct-marca v" style="left:' + x + 'mm;top:' + (y0 - 7) + 'mm"></i><i class="ct-marca v" style="left:' + x + 'mm;top:' + (y1 + 2) + 'mm"></i>';
    });
    ys.forEach(function (y) {
      h += '<i class="ct-marca h" style="top:' + y + 'mm;left:' + (x0 - 7) + 'mm"></i><i class="ct-marca h" style="top:' + y + 'mm;left:' + (x1 + 2) + 'mm"></i>';
    });
    return h;
  }

  function desenhar() {
    if (!atual) return;
    folha.setAttribute('data-modo', modo);
    var um = cartaHtml(atual);
    if (modo === '9') {
      /* A4 = 210 × 297 mm; 3 × 3 cartas = 189 × 264 mm, centradas */
      var x0 = 10.5, y0 = 16.5;
      var xs = [x0, x0 + 63, x0 + 126, x0 + 189], ys = [y0, y0 + 88, y0 + 176, y0 + 264];
      var h = '<div class="ct-grade" style="left:' + x0 + 'mm;top:' + y0 + 'mm">';
      for (var i = 0; i < 9; i++) h += um;
      folha.innerHTML = h + '</div>' + marcas(xs, ys, x0, x0 + 189, y0, y0 + 264);
    } else {
      var a = 20, b = 20;
      folha.innerHTML = '<div class="ct-uma" style="left:' + a + 'mm;top:' + b + 'mm">' + um + '</div>' + marcas([a, a + 63], [b, b + 88], a, a + 63, b, b + 88);
    }
    ajustar();
  }

  /* na tela, a folha é ampliada (uma carta) ou reduzida (folha A4) para caber */
  function ajustar() {
    var largura = palco.clientWidth || 600;
    var z;
    if (modo === '9') {
      z = Math.min(1, (largura - 8) / (210 * MM));
      escala.style.setProperty('--z', z);
      escala.style.width = (210 * MM * z) + 'px';
      escala.style.height = (297 * MM * z) + 'px';
    } else {
      /* mostra só a carta (com as marcas), recortando a margem da folha */
      z = Math.min(2.4, (largura - 8) / (83 * MM));
      escala.style.setProperty('--z', z);
      escala.style.width = (83 * MM * z) + 'px';
      escala.style.height = (108 * MM * z) + 'px';
    }
  }

  function carregar(q) {
    var url = '/api/carta?' + (q.id ? 'id=' + encodeURIComponent(q.id) : 'nome=' + encodeURIComponent(q.nome));
    folha.innerHTML = '<p class="rot ct-aviso">Carregando a carta…</p>';
    fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }).then(function (c) {
      atual = c;
      document.title = c.titulo + ' — carta — jadesun';
      document.getElementById('ct-ficha').innerHTML = '<a href="biblioteca.html#f=' + encodeURI(c.id) + '">Abrir a ficha de ' + esc(c.titulo) + ' na Biblioteca</a>' +
        (c.colecao ? ' · carta ' + esc(c.colecao.numero) + ' de ' + esc(c.colecao.total) + ' da ' + esc(c.colecao.nome) : '');
      desenhar();
    }).catch(function (e) {
      folha.innerHTML = '<p class="ct-aviso">' + (e === 404 ? 'Não achei uma ficha com esse nome no Atlas. Use o nome exato da ficha (ex.: Johann Sebastian Bach).' : 'Servidor desligado: abra o <b>hoje.bat</b>.') + '</p>';
    });
  }

  document.querySelectorAll('[data-modo]').forEach(function (b) {
    if (b.tagName !== 'BUTTON') return;
    b.addEventListener('click', function () {
      modo = b.getAttribute('data-modo');
      document.querySelectorAll('.ct-modos [data-modo]').forEach(function (x) { x.classList.toggle('on', x === b); });
      desenhar();
    });
  });
  document.getElementById('ct-imprimir').addEventListener('click', function () { window.print(); });
  document.getElementById('ct-busca').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nome = document.getElementById('ct-nome').value.trim();
    if (!nome) return;
    history.replaceState(null, '', 'carta.html?nome=' + encodeURIComponent(nome));
    carregar({ nome: nome });
  });
  window.addEventListener('resize', ajustar);
  document.querySelectorAll('.ct-modos [data-modo]').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-modo') === modo); });

  carregar(params.get('id') ? { id: params.get('id') } : { nome: params.get('nome') || 'Johann Sebastian Bach' });
})();
