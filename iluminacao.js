/* ============================================================
   A LUZ (21/out/2026, registro 115)
   "todas as alternativas de iluminação, do móvel à cidade, repensando tudo… somos projetos do sol,
   devemos espelhar as obras da luz".

   Quatro partes: as cinco perguntas antes de qualquer luz; todas as alternativas (seis famílias,
   em tábua); a escada do olho ao céu (sete degraus, com uma régua presa ao lado que acende o degrau
   da vez); e as fontes, numeradas na ordem em que aparecem. Cada princípio e cada obra leva o número
   da sua fonte. Os dados moram em iluminacao-dados.js; campos.css empresta os fios e os rótulos.
   ============================================================ */
(function () {
  'use strict';
  var L = window.LUZ_DADOS;
  var raiz = document.getElementById('lz');
  if (!L || !raiz) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CALMO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* as fontes ganham número na ordem em que aparecem na página */
  var ordem = [];
  function num(id) { var i = ordem.indexOf(id); if (i < 0) { ordem.push(id); i = ordem.length - 1; } return i + 1; }
  function cita(id) { var n = num(id), f = L.fontes[id]; return '<a class="lz-cita" href="#lz-f' + n + '" title="' + esc(f ? f[0] : '') + '" aria-label="Fonte ' + n + ': ' + esc(f ? f[0] : '') + '">' + n + '</a>'; }
  var dois = function (n) { return String(n).padStart(2, '0'); };

  /* ── o alto: o lema e o texto ── */
  var lema = document.getElementById('lz-lema');
  if (lema) lema.innerHTML = '<blockquote>' + esc(L.texto.lema) + '</blockquote><figcaption>' + esc(L.texto.lemaDe) + '</figcaption>';
  var corpo = document.getElementById('lz-corpo');
  if (corpo) corpo.textContent = L.texto.corpo;

  /* ── 1. as cinco perguntas ── */
  function htmlPerguntas() {
    return '<section class="lz-perguntas lz-chega" id="perguntas" aria-labelledby="perguntas-t">' +
      '<header class="cp-sec-cab"><h2 id="perguntas-t">Antes de acender</h2><p class="cp-sec-sub">Cinco perguntas para qualquer luz, da mesa de cabeceira ao plano de uma cidade.</p></header>' +
      '<ol class="lz-perg-lista">' + L.perguntas.map(function (p, i) {
        return '<li><span class="lz-n">' + dois(i + 1) + '</span><h3>' + esc(p[0]) + '</h3><p>' + esc(p[1]) + '</p></li>';
      }).join('') + '</ol>' +
    '</section>';
  }

  /* ── 2. todas as alternativas ── */
  function htmlAlternativas() {
    var total = L.alternativas.reduce(function (n, f) { return n + f[3].length; }, 0);
    return '<section class="lz-alt" id="alternativas" aria-labelledby="alt-t">' +
      '<header class="cp-sec-cab lz-chega"><h2 id="alt-t">Todas as alternativas</h2><p class="cp-sec-sub">' + total + ' maneiras de ter luz, em seis famílias: do Sol que entra pela janela à noite que se deixa escura de propósito.</p></header>' +
      L.alternativas.map(function (f, i) {
        return '<section class="lz-familia lz-chega" aria-labelledby="fam-' + f[0] + '">' +
          '<header class="lz-fam-cab"><span class="lz-n">' + dois(i + 1) + '</span><h3 id="fam-' + f[0] + '">' + esc(f[1]) + '</h3><p>' + esc(f[2]) + '</p></header>' +
          '<div class="lz-tabua" role="table" aria-label="' + esc(f[1]) + '">' +
            '<div class="lz-linha lz-linha-cab" role="row"><span role="columnheader">A alternativa</span><span role="columnheader">Como funciona</span><span role="columnheader">Onde serve</span></div>' +
            f[3].map(function (it) {
              return '<div class="lz-linha" role="row"><span role="cell" class="lz-alt-n">' + esc(it[0]) + '</span><span role="cell">' + esc(it[1]) + '</span><span role="cell" class="lz-alt-o">' + esc(it[2]) + '</span></div>';
            }).join('') +
          '</div>' +
        '</section>';
      }).join('') +
    '</section>';
  }

  /* ── 3. a escada, do olho ao céu ── */
  function htmlEscada() {
    var saarinen = cita('saarinen');
    var regua = '<nav class="lz-regua" aria-label="Os degraus"><ol>' + L.escalas.map(function (e, i) {
      return '<li><a href="#d-' + e.id + '" data-degrau="' + e.id + '"><span class="lz-n">' + (i + 1) + '</span><span class="lz-r-nome">' + esc(e.nome) + '</span><span class="lz-r-esc">' + esc(e.escala) + '</span></a></li>';
    }).join('') + '</ol></nav>';
    var degraus = L.escalas.map(function (e, i) {
      return '<article class="lz-degrau lz-chega" id="d-' + e.id + '" aria-labelledby="d-' + e.id + '-t">' +
        '<header class="lz-d-cab">' +
          '<span class="lz-d-num" aria-hidden="true">' + (i + 1) + '</span>' +
          '<div><p class="lz-d-esc">' + esc(e.escala) + '</p><h3 class="lz-d-t" id="d-' + e.id + '-t">' + esc(e.nome) + '</h3><p class="lz-d-perg">' + esc(e.pergunta) + '</p></div>' +
        '</header>' +
        '<div class="lz-d-corpo">' +
          '<p class="lz-d-txt">' + esc(e.texto) + '</p>' +
          (e.principios.length ? '<ul class="lz-princ">' + e.principios.map(function (p) { return '<li>' + esc(p[0]) + ' ' + cita(p[1]) + '</li>'; }).join('') + '</ul>' : '') +
          (e.obras.length ? '<ol class="lz-obras">' + e.obras.map(function (o) {
            return '<li><span class="lz-o-ano">' + esc(o[1]) + '</span><span class="lz-o-c"><b>' + esc(o[0]) + '</b><span class="lz-o-quem">' + esc(o[2]) + '</span><span class="lz-o-o">' + esc(o[3]) + ' ' + cita(o[4]) + '</span></span></li>';
          }).join('') + '</ol>' : '') +
          '<p class="lz-fazer"><span class="cp-rot">Amanhã</span> ' + esc(e.fazer) + '</p>' +
        '</div>' +
      '</article>';
    }).join('');
    return '<section class="lz-escada" id="escada" aria-labelledby="escada-t">' +
      '<header class="cp-sec-cab lz-chega"><h2 id="escada-t">Do olho ao céu</h2><p class="cp-sec-sub">Sete degraus, cada um dentro do seguinte, como na regra que o arquiteto Eero Saarinen repetia: desenhe sempre uma coisa pensando no contexto maior seguinte ' + saarinen + '. O olho no objeto, o objeto no cômodo, até a cidade debaixo do céu.</p></header>' +
      '<div class="lz-escada-grade">' + regua + '<div class="lz-degraus">' + degraus + '</div></div>' +
    '</section>';
  }

  /* ── 4. as fontes, numeradas ── */
  function htmlFontes() {
    return '<section class="lz-fontes lz-chega" id="fontes" aria-labelledby="fontes-t">' +
      '<h2 id="fontes-t">As fontes</h2>' +
      '<p class="cp-txt">' + esc(L.texto.metodo) + '</p>' +
      '<ol class="lz-f-lista">' + ordem.map(function (id, i) {
        var f = L.fontes[id];
        return '<li id="lz-f' + (i + 1) + '"><span class="lz-n">' + (i + 1) + '</span><a href="' + esc(f[1]) + '" target="_blank" rel="noopener">' + esc(f[0]) + '</a></li>';
      }).join('') + '</ol>' +
    '</section>';
  }

  /* a escada primeiro: é ela que numera as fontes na ordem da página */
  var escada = htmlEscada();
  raiz.innerHTML = htmlPerguntas() + htmlAlternativas() + escada + htmlFontes();

  /* a régua da escada acende o degrau que está no meio da tela */
  var links = raiz.querySelectorAll('.lz-regua a');
  if ('IntersectionObserver' in window) {
    var visto = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) {
        if (!x.isIntersecting) return;
        links.forEach(function (a) { if (a.dataset.degrau === x.target.id.slice(2)) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    raiz.querySelectorAll('.lz-degrau').forEach(function (d) { visto.observe(d); });
  }

  /* a chegada: cada bloco se compõe uma vez, quando aparece */
  var els = raiz.querySelectorAll('.lz-chega');
  if (CALMO || !('IntersectionObserver' in window)) els.forEach(function (e) { e.classList.add('lz-ok'); });
  else {
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('lz-ok'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
})();
