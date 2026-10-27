/* ============================================================
   AS TELAS EM TODO O SITE (27/out/2026, registro 128)
   "isso é pro site todo!" — o Início já era assim (inicio.js): cada seção numa tela, sem pedaço
   de outra. Aqui vale para as outras páginas, do jeito que cabe nelas:
   · cada seção começa no alto de uma tela nova, logo abaixo da barra (a seção é a que o índice
     "Nesta página" já conhece: a que começa num <h2 class="h2">);
   · a seção curta ocupa a tela inteira (o espaço que sobra fica no fim dela, antes da próxima);
   · a longa (um capítulo do Manifesto, uma lista) continua rolando, e a próxima começa depois;
   · a rolagem para nos começos (scroll-snap de proximidade: nunca prende no meio de um texto).
   A primeira tela é o cabeçalho da página com a primeira seção. Nas cenas 3D (a Casa, o Jardim…)
   e no Início, nada muda. Carregado pelo perfil.js; o desenho mora no respiro.css (seção 9).
   ============================================================ */
(function () {
  'use strict';
  var doc = document.documentElement;
  var pagina = (document.body && document.body.dataset.pagina) || '';
  if (/^(inicio|casa|jardim|estante|guarda-roupa|protetor|celular|entrar|vitrine)$/.test(pagina) || doc.classList.contains('embutido')) return;
  var miolo = document.querySelector('.miolo');
  if (!miolo) return;

  /* a barra de cima, onde as telas começam (as de baixo se recolhem ao descer: não entram na conta) */
  function medirCasca() {
    var barra = document.getElementById('trilho');
    var topo = barra ? Math.max(0, Math.round(barra.getBoundingClientRect().bottom)) : 0;
    /* a barra de ferramentas que a própria página prende no alto (a busca do Doar, as vistas do Domínio)
       também cobre o começo da seção: entra na conta do alto */
    var largura = miolo.getBoundingClientRect().width, extra = 0;
    /* só nos primeiros níveis (as barras presas moram ali; olhar todos pesaria nas páginas grandes) */
    miolo.querySelectorAll(':scope > *, :scope > * > *, :scope > * > * > *').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.position !== 'sticky') return;
      var t = parseFloat(cs.top);
      if (!(t <= topo + 8) || el.getBoundingClientRect().width < largura * 0.6) return;
      extra = Math.max(extra, Math.max(0, t - topo) + el.offsetHeight);
    });
    topo += Math.round(extra);
    doc.style.setProperty('--tl-topo', topo + 'px');
    return { topo: topo };
  }

  /* onde cada seção começa. As seções são os tópicos do "Nesta página" (perfil.js): os destinos do sumário
     da página, quando ela tem um (o Manifesto, a Curadoria), ou os títulos h2. O começo é o maior bloco
     que abre com aquele título (a <section>, o cabeçalho da seção), para o fio de cima vir junto. */
  var TITULO = /^H[1-3]$/;
  function blocoDe(alvo) {
    if (!TITULO.test(alvo.tagName)) return alvo;
    var el = alvo;
    while (el.parentElement && el.parentElement !== miolo && miolo.contains(el.parentElement) && el.parentElement.querySelector('h1, h2, h3') === alvo) el = el.parentElement;
    if (el === alvo && alvo.previousElementSibling && alvo.previousElementSibling.classList.contains('rot')) el = alvo.previousElementSibling;
    return el;
  }
  /* um título dentro de uma grade de cartões (lado a lado) não é uma seção empilhada: não vira tela */
  function emFila(el) {
    var pai = el.parentElement;
    if (!pai) return false;
    var cs = getComputedStyle(pai);
    if (/grid/.test(cs.display)) return cs.gridTemplateColumns.trim().split(/\s+/).length > 1;
    if (/flex/.test(cs.display)) return !/column/.test(cs.flexDirection) && cs.flexWrap !== 'nowrap';
    return false;
  }
  function comecos() {
    var itens = window.Perfil && window.Perfil.topicos ? window.Perfil.topicos() : [];
    var alvos = itens.map(function (it) { return it.alvo; }).filter(function (a) { return a && a.offsetParent !== null && miolo.contains(a); });
    if (!alvos.length) alvos = Array.prototype.filter.call(miolo.querySelectorAll('h2.h2'), function (h) { return h.offsetParent; });
    var lista = [];
    alvos.forEach(function (a) {
      if (a.closest('.folha, dialog, [role="dialog"], details:not([open]), .baixo, .ind')) return;
      var el = blocoDe(a);
      if (lista.indexOf(el) >= 0 || emFila(el)) return;
      lista.push(el);
    });
    lista.sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
    return lista;
  }

  var marcados = [], fazendo = false, pedido = 0;
  function limpar() {
    marcados.forEach(function (el) { el.style.removeProperty('margin-top'); el.classList.remove('tl-comeco'); });
    marcados = [];
  }
  function arrumar() {
    if (fazendo) return;
    fazendo = true;
    try {
      var c = medirCasca();
      limpar();
      var els = comecos();
      var tela = innerHeight - c.topo; /* o que cabe embaixo da barra */
      var topoDe = function (el) { return el.getBoundingClientRect().top + scrollY; };
      /* a primeira tela é o cabeçalho com a primeira seção; ela começa logo abaixo da barra (no alto da página) */
      var anterior = c.topo;
      for (var i = 1; i < els.length; i++) {
        var el = els[i];
        var y = topoDe(el), falta = anterior + tela - y;
        if (falta > 0) {
          var base = parseFloat(getComputedStyle(el).marginTop) || 0;
          el.style.setProperty('margin-top', Math.ceil(base + falta) + 'px', 'important');
          /* as margens podem se somar ou se engolir com as vizinhas: confere e completa */
          var resto = anterior + tela - topoDe(el);
          if (resto > 0.5) el.style.setProperty('margin-top', Math.ceil(base + falta + resto) + 'px', 'important');
        }
        el.classList.add('tl-comeco');
        marcados.push(el);
        anterior = topoDe(el);
      }
      doc.classList.toggle('telas', marcados.length > 0);
      if (marcados.length && window.Movimento && window.Movimento.semRolagemSuave) window.Movimento.semRolagemSuave();
    } finally {
      fazendo = false;
    }
  }
  function agendar() {
    cancelAnimationFrame(pedido);
    pedido = requestAnimationFrame(arrumar);
  }

  addEventListener('resize', agendar, { passive: true });
  /* as páginas montam o conteúdo depois (o que vem do caderno, as abas): refaz, sem contar o que ele mesmo mudou */
  if (window.MutationObserver) {
    var espera = 0;
    new MutationObserver(function (lista) {
      if (fazendo) return;
      var deFora = lista.some(function (m) { return m.type === 'childList' || (m.attributeName !== 'style' && m.attributeName !== 'class'); });
      if (!deFora) return;
      clearTimeout(espera);
      espera = setTimeout(agendar, 220);
    }).observe(miolo, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(agendar);
  addEventListener('load', agendar);
  arrumar();
  window.Telas = { arrumar: agendar };
})();
