/* ============================================================
   ARRUMAR (08/out/2026, PERFIL.md item 73; refeito em 22/out/2026, registro 116)
   "opções de ocultar e mexer na ordem das seções de cada página, salvar e voltar pro original."
   22/out: "o arrumar fica dentro de ajustes - também aprimorada..!"
   · Mora em Ajustes › Arrumar esta página: a lista das seções, cada uma com mostrar/esconder,
     subir e descer. Vale na hora e fica guardado (neste navegador, por página); "Voltar ao
     original" apaga.
   · Vale em toda página que tem seções: as que não traziam data-secao ganham uma, pelo título
     (h2). Antes eram só o Início, os Guias, o Hoje e o Manifesto.
   · Cada grupo de seções se reordena dentro do próprio lugar. No Início, o aviso e o cabeçalho
     do Portal moram fora do #atlas; reordenar tudo num lugar só quebrava a página.
   · O modo de arrastar na página continua ("Arrastar na página", em Ajustes): as seções recolhem
     em faixas; arraste pela alça, use as setas ou o olho. "Pronto" guarda, "Cancelar" desfaz.
   ============================================================ */
(function () {
  'use strict';
  if (window.Arrumar) return;

  var pagina = document.body && document.body.dataset.pagina;
  var CHAVE = 'arrumar:' + pagina;
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; } }
  function gravar(v) { try { if (v) localStorage.setItem(CHAVE, JSON.stringify(v)); else localStorage.removeItem(CHAVE); } catch (e) {} }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function slug(s) { return String(s || 'secao').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'secao'; }
  var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* as seções de primeiro nível que ainda não tinham nome ganham um, pelo título */
  function marcarSecoes() {
    var miolo = document.querySelector('.miolo'); if (!miolo) return;
    var cand = miolo.querySelectorAll(':scope > div[id] > section, #atlas > section, :scope > section');
    Array.prototype.forEach.call(cand, function (s) {
      if (s.hasAttribute('data-secao') || s.parentElement.closest('[data-secao]')) return;
      var h = s.querySelector('h2'); if (!h) return;
      var nome = (h.getAttribute('data-indice') || h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!nome) return;
      var id = s.id || slug(nome), n = 2, base = id;
      while (document.querySelector('[data-secao="' + id + '"]')) id = base + '-' + (n++);
      s.setAttribute('data-secao', id);
      s.setAttribute('data-rotulo', nome.length > 60 ? nome.slice(0, 58) + '…' : nome);
    });
  }
  function secoes() { return Array.prototype.slice.call(document.querySelectorAll('[data-secao]')).filter(function (s) { return !s.parentElement.closest('[data-secao]'); }); }
  function irmas(s) { return secoes().filter(function (x) { return x.parentElement === s.parentElement; }); }
  function marcarOriginal() {
    secoes().forEach(function (s, i) { if (!s.hasAttribute('data-ordem-original')) s.setAttribute('data-ordem-original', String(i)); });
  }

  /* põe as seções na ordem pedida, cada grupo dentro do próprio pai (as que não estão na lista ficam no fim do grupo) */
  function ordenar(ordem, animar) {
    var todas = secoes(); if (!todas.length) return;
    var antes = animar ? todas.map(function (s) { return s.getBoundingClientRect(); }) : null;
    var pos = {}; ordem.forEach(function (id, i) { pos[id] = i; });
    var grupos = new Map();
    todas.forEach(function (s) { var p = s.parentElement; if (!grupos.has(p)) grupos.set(p, []); grupos.get(p).push(s); });
    grupos.forEach(function (lista, pai) {
      var ancora = lista[lista.length - 1].nextSibling;
      var ord = lista.slice().sort(function (a, b) {
        var pa = a.dataset.secao in pos ? pos[a.dataset.secao] : 1e9, pb = b.dataset.secao in pos ? pos[b.dataset.secao] : 1e9;
        return pa - pb;
      });
      ord.forEach(function (s) { pai.insertBefore(s, ancora); });
    });
    if (animar && !calmo) flip(todas, antes);
  }
  function flip(todas, antes) {
    todas.forEach(function (s, i) {
      var depois = s.getBoundingClientRect(), dy = antes[i].top - depois.top;
      if (!dy) return;
      s.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    });
  }

  var tentativas = 0;
  function aplicar() {
    marcarSecoes();
    marcarOriginal();
    var v = ler();
    secoes().forEach(function (s) { s.toggleAttribute('data-oculta', !!(v && v.ocultas && v.ocultas.indexOf(s.dataset.secao) >= 0)); });
    if (v && v.ordem) ordenar(v.ordem, false);
    /* as páginas que montam o conteúdo depois (os Guias, as Áreas…): tenta de novo enquanto ele chega */
    if (v && tentativas < 12 && v.ordem && v.ordem.some(function (id) { return !document.querySelector('[data-secao="' + id + '"]'); })) { tentativas++; setTimeout(aplicar, 700); }
  }

  function estadoAtual() {
    return { v: 2, ordem: secoes().map(function (s) { return s.dataset.secao; }), ocultas: secoes().filter(function (s) { return s.hasAttribute('data-oculta'); }).map(function (s) { return s.dataset.secao; }) };
  }
  function avisar() { document.dispatchEvent(new CustomEvent('arrumar:mudou')); }

  /* ---------- o que Ajustes usa ---------- */
  function lista() {
    marcarSecoes(); marcarOriginal();
    return secoes().map(function (s) {
      var g = irmas(s), i = g.indexOf(s);
      return { id: s.dataset.secao, rotulo: s.dataset.rotulo || s.dataset.secao, oculta: s.hasAttribute('data-oculta'), primeira: i === 0, ultima: i === g.length - 1 };
    });
  }
  function porId(id) { return secoes().filter(function (s) { return s.dataset.secao === id; })[0]; }
  function alternar(id) { var s = porId(id); if (!s) return; s.toggleAttribute('data-oculta'); gravar(estadoAtual()); avisar(); }
  function moverId(id, delta) { var s = porId(id); if (!s) return; mover(s, delta); gravar(estadoAtual()); avisar(); }
  function original() {
    gravar(null);
    var orig = secoes().slice().sort(function (a, b) { return +a.dataset.ordemOriginal - +b.dataset.ordemOriginal; }).map(function (s) { return s.dataset.secao; });
    secoes().forEach(function (s) { s.removeAttribute('data-oculta'); });
    ordenar(orig, true); avisar();
  }
  function mexido() { return !!ler(); }

  /* ---------- o modo de arrastar na página ---------- */
  var ativo = false, guardado = null, barra = null;
  function entrar() {
    if (ativo) return;
    marcarSecoes(); marcarOriginal();
    var todas = secoes(); if (!todas.length) return;
    ativo = true; guardado = estadoAtual();
    var antes = todas.map(function (s) { return s.getBoundingClientRect().top; });
    todas.forEach(function (s) {
      var f = document.createElement('div');
      f.className = 'arr-faixa';
      f.innerHTML = '<button type="button" class="arr-alca" aria-label="Arrastar ' + esc(s.dataset.rotulo || s.dataset.secao) + '" title="Arraste para mudar de lugar">' + ic('arrastar') + '</button>' +
        '<span class="arr-nome">' + esc(s.dataset.rotulo || s.dataset.secao) + '</span><span class="arr-estado"></span>' +
        '<button type="button" class="arr-b" data-arr="sobe" aria-label="Subir">' + ic('acima') + '</button>' +
        '<button type="button" class="arr-b" data-arr="desce" aria-label="Descer">' + ic('abaixo') + '</button>' +
        '<button type="button" class="arr-b arr-olho" data-arr="olho" aria-label="Esconder ou mostrar">' + ic('olho') + '</button>';
      s.prepend(f);
      s.parentElement.classList.add('arr-caixa');
    });
    pintarEstados();
    document.documentElement.classList.add('arrumando');
    window.scrollTo({ top: Math.max(0, todas[0].getBoundingClientRect().top + window.scrollY - 120), behavior: calmo ? 'auto' : 'smooth' });
    barra = document.createElement('div');
    barra.className = 'arr-barra';
    barra.setAttribute('role', 'toolbar');
    barra.innerHTML = '<span class="arr-dica">Arraste, suba, desça ou esconda as seções</span>' +
      '<button type="button" class="botao leve" data-arr="original">Voltar ao original</button>' +
      '<button type="button" class="botao" data-arr="cancelar">Cancelar</button><button type="button" class="botao pri" data-arr="pronto">Pronto</button>';
    document.body.appendChild(barra);
    barra.addEventListener('click', aoClicarBarra);
    document.addEventListener('click', aoClicarFaixa);
    document.addEventListener('pointerdown', aoPegar);
    document.addEventListener('keydown', aoTecla);
    if (!calmo) todas.forEach(function (s, i) { s.animate([{ opacity: .4, transform: 'translateY(' + (antes[i] - s.getBoundingClientRect().top) * 0.15 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16, 1, .3, 1)' }); });
  }
  function sair(salvar) {
    if (!ativo) return;
    if (salvar === true) gravar(estadoAtual());
    else if (salvar === 'original') gravar(null);
    if (salvar === false && guardado) { secoes().forEach(function (s) { s.toggleAttribute('data-oculta', guardado.ocultas.indexOf(s.dataset.secao) >= 0); }); ordenar(guardado.ordem, false); }
    if (salvar === 'original') { var orig = secoes().slice().sort(function (a, b) { return +a.dataset.ordemOriginal - +b.dataset.ordemOriginal; }).map(function (s) { return s.dataset.secao; }); secoes().forEach(function (s) { s.removeAttribute('data-oculta'); }); ordenar(orig, false); }
    document.querySelectorAll('.arr-faixa').forEach(function (f) { f.remove(); });
    document.querySelectorAll('.arr-caixa').forEach(function (c) { c.classList.remove('arr-caixa'); });
    document.documentElement.classList.remove('arrumando');
    document.removeEventListener('click', aoClicarFaixa);
    document.removeEventListener('pointerdown', aoPegar);
    document.removeEventListener('keydown', aoTecla);
    if (barra) { var b = barra; b.classList.add('saindo'); setTimeout(function () { b.remove(); }, 300); barra = null; }
    ativo = false;
    document.dispatchEvent(new CustomEvent('arrumar:saiu'));
    avisar();
    if (!calmo) secoes().forEach(function (s, i) { if (!s.hasAttribute('data-oculta')) s.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: Math.min(i, 8) * 50, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }); });
  }
  function pintarEstados() {
    secoes().forEach(function (s) {
      var oculta = s.hasAttribute('data-oculta'), f = s.querySelector('.arr-faixa'); if (!f) return;
      f.querySelector('.arr-estado').textContent = oculta ? 'escondida' : '';
      var o = f.querySelector('.arr-olho'); o.innerHTML = ic(oculta ? 'olho-fechado' : 'olho'); o.setAttribute('aria-pressed', String(oculta));
      var g = irmas(s), i = g.indexOf(s);
      f.querySelector('[data-arr="sobe"]').disabled = i === 0;
      f.querySelector('[data-arr="desce"]').disabled = i === g.length - 1;
    });
  }
  /* sobe ou desce uma seção entre as irmãs (as do mesmo lugar) */
  function mover(s, delta) {
    var g = irmas(s), i = g.indexOf(s), j = i + delta;
    if (j < 0 || j >= g.length) return;
    var todas = secoes().map(function (x) { return x.dataset.secao; });
    var ia = todas.indexOf(s.dataset.secao), ib = todas.indexOf(g[j].dataset.secao);
    todas[ia] = g[j].dataset.secao; todas[ib] = s.dataset.secao;
    ordenar(todas, true);
    if (ativo) {
      pintarEstados();
      var b = s.querySelector('[data-arr="' + (delta < 0 ? 'sobe' : 'desce') + '"]'); if (b && !b.disabled) b.focus({ preventScroll: true });
    }
  }
  function aoClicarFaixa(ev) {
    var b = ev.target.closest('.arr-faixa [data-arr]'); if (!b) return;
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

  /* arrastar pela alça: a faixa acompanha o dedo; ao passar do meio da vizinha, troca de lugar */
  function aoPegar(ev) {
    var alca = ev.target.closest('.arr-alca'); if (!alca) return;
    var s = alca.closest('[data-secao]'); if (!s) return;
    ev.preventDefault();
    var y0 = ev.clientY, desloc = 0;
    s.classList.add('arr-pegada'); alca.setPointerCapture(ev.pointerId);
    function mexe(e) {
      desloc = e.clientY - y0;
      s.style.transform = 'translateY(' + desloc + 'px)';
      var g = irmas(s), i = g.indexOf(s), r = s.getBoundingClientRect(), meio = r.top + r.height / 2;
      var prox = g[i + 1], ant = g[i - 1];
      if (prox && meio > prox.getBoundingClientRect().top + prox.getBoundingClientRect().height / 2) { var t = s.getBoundingClientRect().top; s.style.transform = ''; mover(s, 1); y0 += s.getBoundingClientRect().top - t; desloc = e.clientY - y0; s.style.transform = 'translateY(' + desloc + 'px)'; }
      else if (ant && meio < ant.getBoundingClientRect().top + ant.getBoundingClientRect().height / 2) { var t2 = s.getBoundingClientRect().top; s.style.transform = ''; mover(s, -1); y0 += s.getBoundingClientRect().top - t2; desloc = e.clientY - y0; s.style.transform = 'translateY(' + desloc + 'px)'; }
    }
    function solta() {
      alca.removeEventListener('pointermove', mexe); alca.removeEventListener('pointerup', solta); alca.removeEventListener('pointercancel', solta);
      s.classList.remove('arr-pegada');
      if (!calmo) s.animate([{ transform: 'translateY(' + desloc + 'px)' }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      s.style.transform = '';
    }
    alca.addEventListener('pointermove', mexe); alca.addEventListener('pointerup', solta); alca.addEventListener('pointercancel', solta);
  }

  window.Arrumar = { aplicar: aplicar, entrar: entrar, sair: sair, lista: lista, alternar: alternar, mover: moverId, original: original, mexido: mexido };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar); else aplicar();
})();
