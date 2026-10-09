/* ============================================================
   ARRUMAR (08/out/2026, PERFIL.md item 73)
   "opções de ocultar e mexer na ordem das seções de cada página, salvar e
   voltar pro original." Toda seção com data-secao (e data-rotulo) entra.
   · No modo Arrumar, as seções recolhem em faixas: arraste pela alça, use as
     setas, ou o olho para esconder. Os vizinhos deslizam (animação FLIP).
   · "Pronto" guarda (neste navegador, por página); "Voltar ao original" apaga;
     "Cancelar" desfaz o que mexeu agora.
   ============================================================ */
(function () {
  'use strict';

  var pagina = document.body && document.body.dataset.pagina;
  var CHAVE = 'arrumar:' + pagina;
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; } }
  function gravar(v) { try { if (v) localStorage.setItem(CHAVE, JSON.stringify(v)); else localStorage.removeItem(CHAVE); } catch (e) {} }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function secoes() { return Array.prototype.slice.call(document.querySelectorAll('[data-secao]')).filter(function (s) { return !s.parentElement.closest('[data-secao]'); }); }
  function caixa() { var s = secoes(); return s.length ? s[0].parentElement : null; }
  function marcarOriginal() {
    secoes().forEach(function (s, i) { if (!s.hasAttribute('data-ordem-original')) s.setAttribute('data-ordem-original', String(i)); });
  }

  /* move as seções na ordem pedida (as que não estão na lista ficam onde estavam, no fim) */
  function ordenar(ordem, animar) {
    var cx = caixa(); if (!cx) return;
    var todas = secoes(), porId = {};
    todas.forEach(function (s) { porId[s.dataset.secao] = s; });
    var antes = animar ? todas.map(function (s) { return s.getBoundingClientRect(); }) : null;
    var lista = ordem.map(function (id) { return porId[id]; }).filter(Boolean);
    todas.forEach(function (s) { if (lista.indexOf(s) < 0) lista.push(s); });
    var ancora = todas[todas.length - 1].nextSibling;
    lista.forEach(function (s) { cx.insertBefore(s, ancora); });
    if (animar) flip(todas, antes);
  }
  function flip(todas, antes) {
    todas.forEach(function (s, i) {
      var depois = s.getBoundingClientRect(), dy = antes[i].top - depois.top;
      if (!dy) return;
      s.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    });
  }

  function aplicar() {
    marcarOriginal();
    var v = ler();
    secoes().forEach(function (s) { s.toggleAttribute('data-oculta', !!(v && v.ocultas && v.ocultas.indexOf(s.dataset.secao) >= 0)); });
    if (v && v.ordem) ordenar(v.ordem, false);
    mostrarBotao();
  }

  function estadoAtual() {
    return { v: 1, ordem: secoes().map(function (s) { return s.dataset.secao; }), ocultas: secoes().filter(function (s) { return s.hasAttribute('data-oculta'); }).map(function (s) { return s.dataset.secao; }) };
  }

  /* ---------- o modo Arrumar ---------- */
  var ativo = false, guardado = null, barra = null;
  function entrar() {
    if (ativo) return;
    var cx = caixa(); if (!cx) return;
    ativo = true; guardado = estadoAtual();
    var antes = secoes().map(function (s) { return s.getBoundingClientRect().top; });
    secoes().forEach(function (s) {
      var f = document.createElement('div');
      f.className = 'arr-faixa';
      f.innerHTML = '<button type="button" class="arr-alca" aria-label="Arrastar ' + esc(s.dataset.rotulo || s.dataset.secao) + '" title="Arraste para mudar de lugar">' + ic('arrastar') + '</button>' +
        '<span class="arr-nome">' + esc(s.dataset.rotulo || s.dataset.secao) + '</span><span class="arr-estado"></span>' +
        '<button type="button" class="arr-b" data-arr="sobe" aria-label="Subir">' + ic('acima') + '</button>' +
        '<button type="button" class="arr-b" data-arr="desce" aria-label="Descer">' + ic('abaixo') + '</button>' +
        '<button type="button" class="arr-b arr-olho" data-arr="olho" aria-label="Esconder ou mostrar">' + ic('olho') + '</button>';
      s.prepend(f);
    });
    pintarEstados();
    document.documentElement.classList.add('arrumando');
    cx.classList.add('arr-caixa');
    window.scrollTo({ top: Math.max(0, cx.getBoundingClientRect().top + window.scrollY - 120), behavior: 'smooth' });
    barra = document.createElement('div');
    barra.className = 'arr-barra';
    barra.setAttribute('role', 'toolbar');
    barra.innerHTML = '<span class="arr-dica">' + ic('arrumar') + 'Arraste, suba, desça ou esconda as seções</span>' +
      '<button type="button" class="botao leve" data-arr="original">' + ic('restaurar') + 'Voltar ao original</button>' +
      '<button type="button" class="botao" data-arr="cancelar">Cancelar</button><button type="button" class="botao pri" data-arr="pronto">' + ic('check') + 'Pronto</button>';
    document.body.appendChild(barra);
    barra.addEventListener('click', aoClicarBarra);
    cx.addEventListener('click', aoClicarFaixa);
    cx.addEventListener('pointerdown', aoPegar);
    document.addEventListener('keydown', aoTecla);
    secoes().forEach(function (s, i) { s.animate([{ opacity: .4, transform: 'translateY(' + (antes[i] - s.getBoundingClientRect().top) * 0.15 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16, 1, .3, 1)' }); });
  }
  function sair(salvar) {
    if (!ativo) return;
    var cx = caixa();
    if (salvar === true) gravar(estadoAtual());
    else if (salvar === 'original') gravar(null);
    if (salvar === false && guardado) { secoes().forEach(function (s) { s.toggleAttribute('data-oculta', guardado.ocultas.indexOf(s.dataset.secao) >= 0); }); ordenar(guardado.ordem, false); }
    if (salvar === 'original') { var orig = secoes().slice().sort(function (a, b) { return +a.dataset.ordemOriginal - +b.dataset.ordemOriginal; }).map(function (s) { return s.dataset.secao; }); secoes().forEach(function (s) { s.removeAttribute('data-oculta'); }); ordenar(orig, false); }
    document.querySelectorAll('.arr-faixa').forEach(function (f) { f.remove(); });
    document.documentElement.classList.remove('arrumando');
    if (cx) { cx.classList.remove('arr-caixa'); cx.removeEventListener('click', aoClicarFaixa); cx.removeEventListener('pointerdown', aoPegar); }
    document.removeEventListener('keydown', aoTecla);
    if (barra) { var b = barra; b.classList.add('saindo'); setTimeout(function () { b.remove(); }, 300); barra = null; }
    ativo = false;
    document.dispatchEvent(new CustomEvent('arrumar:saiu'));
    secoes().forEach(function (s, i) { if (!s.hasAttribute('data-oculta')) s.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }); });
  }
  function pintarEstados() {
    secoes().forEach(function (s) {
      var oculta = s.hasAttribute('data-oculta'), f = s.querySelector('.arr-faixa'); if (!f) return;
      f.querySelector('.arr-estado').textContent = oculta ? 'escondida' : '';
      var o = f.querySelector('.arr-olho'); o.innerHTML = ic(oculta ? 'olho-fechado' : 'olho'); o.setAttribute('aria-pressed', String(oculta));
    });
    var lista = secoes();
    lista.forEach(function (s, i) {
      var f = s.querySelector('.arr-faixa'); if (!f) return;
      f.querySelector('[data-arr="sobe"]').disabled = i === 0;
      f.querySelector('[data-arr="desce"]').disabled = i === lista.length - 1;
    });
  }
  function mover(s, delta) {
    var lista = secoes(), i = lista.indexOf(s), j = i + delta;
    if (j < 0 || j >= lista.length) return;
    var ordem = lista.map(function (x) { return x.dataset.secao; });
    ordem.splice(j, 0, ordem.splice(i, 1)[0]);
    ordenar(ordem, true); pintarEstados();
    var b = s.querySelector('[data-arr="' + (delta < 0 ? 'sobe' : 'desce') + '"]'); if (b && !b.disabled) b.focus({ preventScroll: true });
  }
  function aoClicarFaixa(ev) {
    var b = ev.target.closest('[data-arr]'); if (!b) return;
    var s = b.closest('[data-secao]'); if (!s) return;
    ev.preventDefault();
    if (b.dataset.arr === 'sobe') mover(s, -1);
    if (b.dataset.arr === 'desce') mover(s, 1);
    if (b.dataset.arr === 'olho') { s.toggleAttribute('data-oculta'); pintarEstados(); }
  }
  function aoClicarBarra(ev) {
    var b = ev.target.closest('[data-arr]'); if (!b) return;
    if (b.dataset.arr === 'pronto') sair(true);
    if (b.dataset.arr === 'cancelar') sair(false);
    if (b.dataset.arr === 'original') sair('original');
  }
  function aoTecla(ev) { if (ev.key === 'Escape') sair(false); }

  /* arrastar pela alça: a faixa acompanha o dedo; ao passar do meio do vizinho, troca de lugar */
  function aoPegar(ev) {
    var alca = ev.target.closest('.arr-alca'); if (!alca) return;
    var s = alca.closest('[data-secao]'); if (!s) return;
    ev.preventDefault();
    var y0 = ev.clientY, desloc = 0;
    s.classList.add('arr-pegada'); alca.setPointerCapture(ev.pointerId);
    function mexe(e) {
      desloc = e.clientY - y0;
      s.style.transform = 'translateY(' + desloc + 'px)';
      var lista = secoes(), i = lista.indexOf(s), r = s.getBoundingClientRect(), meio = r.top + r.height / 2;
      var prox = lista[i + 1], ant = lista[i - 1];
      if (prox && meio > prox.getBoundingClientRect().top + prox.getBoundingClientRect().height / 2) { var t = s.getBoundingClientRect().top; s.style.transform = ''; mover(s, 1); y0 += s.getBoundingClientRect().top - t; desloc = e.clientY - y0; s.style.transform = 'translateY(' + desloc + 'px)'; }
      else if (ant && meio < ant.getBoundingClientRect().top + ant.getBoundingClientRect().height / 2) { var t2 = s.getBoundingClientRect().top; s.style.transform = ''; mover(s, -1); y0 += s.getBoundingClientRect().top - t2; desloc = e.clientY - y0; s.style.transform = 'translateY(' + desloc + 'px)'; }
    }
    function solta() {
      alca.removeEventListener('pointermove', mexe); alca.removeEventListener('pointerup', solta); alca.removeEventListener('pointercancel', solta);
      s.classList.remove('arr-pegada');
      s.animate([{ transform: 'translateY(' + desloc + 'px)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      s.style.transform = '';
    }
    alca.addEventListener('pointermove', mexe); alca.addEventListener('pointerup', solta); alca.addEventListener('pointercancel', solta);
  }

  /* o botão no topo só aparece em páginas com seções */
  function mostrarBotao() {
    var b = document.getElementById('b-arrumar');
    if (b) { b.hidden = !secoes().length; return; }
  }
  document.addEventListener('click', function (ev) { if (ev.target.closest('#b-arrumar')) { if (ativo) sair(true); else entrar(); } });

  window.Arrumar = { aplicar: aplicar, entrar: entrar, sair: sair };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar); else aplicar();
})();
