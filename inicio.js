/* ============================================================
   A CASA DE ENTRADA (25/out/2026, registro 118)
   "a home deve ser mais simétrica, porque o atlas no menu não é simétrico, ou algo diferente, mais
   universal e mais de boas-vindas.. algo mais cara de home, mas nada comercial, e sim o máximo da
   utopia..!!"
   A home não é mais uma porta de um lado (o Atlas): é o centro, como o Quadrado no menu.
   · As boas-vindas, o lema dele ("Somos projetos do Sol…") e o dia de hoje; e, para quem volta, o lugar
     onde parou (as fixadas e os caminhos do aparelho).
   · O mapa espelhado: o mundo à esquerda, você à direita, as mesmas portas do menu, cada uma com a
     pergunta e as páginas; no meio, o Quadrado (o mapa de tudo).
   · A utopia: uma das "palavras", lidas do caderno (Manifestos/A Revolução Ontológica.md), o mesmo
     texto que o Manifesto lê; mudou lá, muda aqui.
   · A Terra agora: o dia e a noite deste minuto.
   Sem número para impressionar, sem convite para comprar: o lugar e o porquê.
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {}, M = window.MAPA;
  var raiz = document.getElementById('inicio');
  if (!raiz || !M) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var publico = !!(P.ehPublico && P.ehPublico());
  var estatico = P.estatico ? P.estatico() : null;
  var permitida = P.permitida || function () { return true; };
  function portaOk(id) {
    var po = M.porta(id);
    if (!po || (publico && po.publico === false)) return false;
    return po.paginas.some(function (p) { return permitida(p[0]); });
  }
  function paginas(po) { return po.paginas.filter(function (p) { return permitida(p[0]) && !(estatico && (p[5] === false || po.publico === false)); }); }

  /* ---------- quem volta: o lugar onde parou ---------- */
  function continuar() {
    var L = null;
    try { L = JSON.parse(localStorage.getItem('portal-lugares') || 'null'); } catch (e) { L = null; }
    if (!L) return '';
    /* a própria casa não conta (nem a raiz antiga, anotada como atlas.html com o nome Início) */
    var fora = function (x) { return x && x.u && !/^inicio\.html/.test(x.u) && x.t !== 'Início'; };
    var fixada = (L.fixadas || []).filter(fora)[0];
    var ultimo = null;
    (L.caminhos || []).some(function (c) { var ps = (c.passos || []).filter(fora); if (ps.length) { ultimo = ps[ps.length - 1]; return true; } return false; });
    var item = function (x, rot) {
      return '<a class="in-cont-a" href="' + esc(x.u) + '" data-y="' + (x.y || 0) + '"><span class="in-cont-rot">' + rot + '</span><b>' + esc(x.t) + '</b>' + (x.s && x.s !== x.t ? '<small>' + esc(x.s) + '</small>' : '') + '</a>';
    };
    var h = '';
    if (ultimo) h += item(ultimo, 'Onde você parou');
    if (fixada && (!ultimo || fixada.u !== ultimo.u)) h += item(fixada, 'Fixada');
    return h ? '<nav class="in-continuar" aria-label="Continuar">' + h + '</nav>' : '';
  }

  /* ---------- as boas-vindas ---------- */
  var hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function boas() {
    return '<section class="in-boas" data-secao="boas-vindas" data-rotulo="Boas-vindas" aria-labelledby="in-nome">' +
      '<span class="in-marca" aria-hidden="true"></span>' +
      '<p class="in-ola">Boas-vindas ao</p>' +
      '<h1 class="in-nome" id="in-nome">Portal Solar</h1>' +
      '<p class="in-lema">Somos projetos do Sol: devemos espelhar as obras da luz.</p>' +
      '<p class="in-dia">' + esc(hoje.charAt(0).toUpperCase() + hoje.slice(1)) + '</p>' +
      continuar() +
    '</section>';
  }

  /* ---------- o mapa espelhado ---------- */
  function porta(id) {
    var po = M.porta(id), pags = paginas(po);
    return '<li class="in-porta"><a class="in-porta-a" href="' + esc(pags[0][1]) + '"><b>' + esc(po.nome) + '</b><span>' + esc(po.pergunta) + '</span></a>' +
      (pags.length > 1 ? '<p class="in-porta-pags">' + pags.map(function (p) { return '<a href="' + esc(p[1]) + '">' + esc(p[2]) + '</a>'; }).join('') + '</p>'
        /* uma página só, com vistas (o Atlas): as vistas */
        : (pags[0][4] || []).length ? '<p class="in-porta-pags">' + pags[0][4].map(function (x) { return '<a href="' + esc(x[0]) + '">' + esc(x[1]) + '</a>'; }).join('') + '</p>' : '') + '</li>';
  }
  function mapa() {
    var mundo = (publico ? M.PUB_MUNDO : M.MUNDO).filter(portaOk), voce = (publico ? M.PUB_VOCE : M.VOCE).filter(portaOk);
    return '<section class="in-mapa" data-secao="portas" data-rotulo="As portas" aria-labelledby="in-mapa-t">' +
      '<h2 class="h2 in-mapa-t" id="in-mapa-t">As portas</h2>' +
      '<div class="in-mapa-grade">' +
        '<div class="in-lado in-mundo"><p class="in-lado-rot">' + (publico ? 'O porquê<span>e o que ler agora</span>' : 'O mundo<span>o que existe</span>') + '</p><ul class="in-portas">' + mundo.map(porta).join('') + '</ul></div>' +
        '<div class="in-centro"><button type="button" class="in-q" data-abrir-indice aria-label="O mapa de tudo"><span aria-hidden="true"></span></button><p>O mapa de tudo</p></div>' +
        '<div class="in-lado in-voce"><p class="in-lado-rot">' + (publico ? 'O que existe<span>e onde você parou</span>' : 'Você<span>o que é seu</span>') + '</p><ul class="in-portas">' + voce.map(porta).join('') + '</ul></div>' +
      '</div>' +
    '</section>';
  }

  /* ---------- a utopia, nas palavras dele ---------- */
  function utopia() {
    return '<section class="in-utopia" data-secao="utopia" data-rotulo="O que queremos" aria-labelledby="in-utopia-t" hidden>' +
      '<p class="rot">O máximo da utopia</p><h2 class="h2" id="in-utopia-t">O que queremos</h2>' +
      '<blockquote class="in-frase"><p id="in-frase"></p></blockquote>' +
      '<p class="in-assina"><a href="manifesto.html#mf-xvi">Vitor de Mantova, A revolução ontológica</a></p>' +
    '</section>';
  }

  /* ---------- a Terra agora ---------- */
  function terra() {
    return '<section class="in-terra" data-secao="terra" data-rotulo="A Terra agora" aria-labelledby="in-terra-t">' +
      '<p class="rot">O dia e a noite deste minuto</p><h2 class="h2" id="in-terra-t">A Terra agora</h2>' +
      '<div class="in-terra-mapa" id="in-terra"></div>' +
    '</section>';
  }

  raiz.innerHTML = boas() + mapa() + utopia() + terra();

  raiz.addEventListener('click', function (ev) {
    var q = ev.target.closest('[data-abrir-indice]');
    if (q) { if (P.abrirIndice) P.abrirIndice(q); return; }
    var c = ev.target.closest('.in-cont-a');
    if (c && P.irPara && !(ev.metaKey || ev.ctrlKey || ev.shiftKey)) { ev.preventDefault(); P.irPara(c.getAttribute('href'), +c.getAttribute('data-y') || 0); }
  });

  fetch('/api/manifesto', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
    var O = window.Ontologica;
    if (!O || !d || !d.ontologica || !d.ontologica.existe) return;
    var p = O.partes(d.ontologica.texto), frase = p.palavras[2] || p.palavras[p.palavras.length - 1];
    if (!frase) return;
    document.getElementById('in-frase').textContent = frase.replace(/\*\*?([^*]+)\*\*?/g, '$1');
    raiz.querySelector('.in-utopia').hidden = false;
  });

  if (window.TerraAgora) window.TerraAgora.montar(document.getElementById('in-terra'), { rotulo: publico ? 'Campinas' : '' });
  if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
})();
