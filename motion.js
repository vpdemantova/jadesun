(function () {
  'use strict';

  var PT = window.PersTema;
  if (!PT) return;

  var raiz = document.documentElement;
  var reduz = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var toque = window.matchMedia ? window.matchMedia('(hover: none), (pointer: coarse)').matches : false;

  var M = {
    lenis: null,
    cfg: PT.efetivo(),
    quadros: [],
    rafId: 0,
    obs: null,
    visiveis: new Set(),
    mut: null,
    mutTimer: 0,
    cursor: null,
    ponteiro: { x: -200, y: -200, lx: -200, ly: -200, ativo: false },
    polen: null,
    barra: null,
    ultimoY: 0,
  };

  var ALVOS_REVELA = '.cx, .fc, .mc, .tile, .card, .fe-item, .era, .rel, .eu-sec > header, .acervo > header, .lac-sec, .num-c, .fo-b, .seguro > *, .ag-cartao, .ag-lateral > *, .ag-rodape > *, .m-linha, .secao-d, .ov-card, .sticker, .etapa, .elo, .foto, .hero, .era-mosaico figure, .res';
  var ALVOS_PARALAXE = '.era-mosaico img, .hero img, .tile-capas img, .ev-img img, .md figure img';
  var ALVOS_PREVINE = '.pers, .fo-lista, textarea, .toc-cx, .mais-folha, .popover, .tb-nav, .lb';

  /* ---------- laço único de quadros ---------- */
  function precisaLaco() {
    return M.lenis || M.quadros.length || M.cfg.cursor === 'on' || M.cfg.polen === 'on' || (M.cfg.anima === 'imersivo' && M.visiveis.size);
  }

  function laco(t) {
    M.rafId = 0;
    if (document.hidden) return;
    if (M.lenis) M.lenis.raf(t);
    M.quadros.forEach(function (f) { f(t); });
    quadroCursor();
    quadroPolen(t);
    quadroParalaxe();
    if (precisaLaco()) M.rafId = requestAnimationFrame(laco);
  }

  function acordar() { if (!M.rafId && precisaLaco()) M.rafId = requestAnimationFrame(laco); }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) acordar(); });

  function aoFrame(fn) {
    M.quadros.push(fn);
    acordar();
    return function () { M.quadros = M.quadros.filter(function (x) { return x !== fn; }); };
  }

  /* ---------- rolagem suave (Lenis) ---------- */
  function ligarLenis() {
    if (M.lenis || typeof window.Lenis !== 'function') return;
    document.querySelectorAll(ALVOS_PREVINE).forEach(function (el) { el.setAttribute('data-lenis-prevent', ''); });
    M.lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.4, syncTouch: false });
    M.lenis.on('scroll', atualizarBarra);
    acordar();
  }

  function desligarLenis() {
    if (!M.lenis) return;
    M.lenis.destroy();
    M.lenis = null;
  }

  function rolarPara(alvo, opcoes) {
    var deslocamento = (opcoes && opcoes.deslocamento) || -90;
    if (M.lenis) {
      M.lenis.scrollTo(alvo, { offset: deslocamento, duration: 1.1 });
    } else if (typeof alvo === 'number') {
      window.scrollTo({ top: alvo, behavior: M.cfg.anima === 'off' ? 'auto' : 'smooth' });
    } else if (alvo && alvo.scrollIntoView) {
      alvo.scrollIntoView({ behavior: M.cfg.anima === 'off' ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function topo() {
    if (M.lenis) M.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }

  /* ---------- barra de leitura ---------- */
  function atualizarBarra() {
    if (!M.barra) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    M.barra.style.transform = 'scaleX(' + p + ')';
  }

  function ligarBarra() {
    if (M.barra) return;
    M.barra = document.createElement('div');
    M.barra.className = 'barra-leitura';
    M.barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(M.barra);
    window.addEventListener('scroll', atualizarBarra, { passive: true });
    atualizarBarra();
  }
  function desligarBarra() { if (M.barra) { M.barra.remove(); M.barra = null; window.removeEventListener('scroll', atualizarBarra); } }

  /* ---------- revelar ao rolar ---------- */
  function ligarObservador() {
    if (M.obs || !('IntersectionObserver' in window)) return;
    M.obs = new IntersectionObserver(function (entradas) {
      var lote = 0;
      entradas.forEach(function (e) {
        var el = e.target;
        if (el.matches && el.matches(ALVOS_PARALAXE)) { if (e.isIntersecting) M.visiveis.add(el); else M.visiveis.delete(el); acordar(); }
        if (!e.isIntersecting || el.classList.contains('rv-in')) return;
        el.style.transitionDelay = Math.min(lote * 45, 360) + 'ms';
        lote += 1;
        el.classList.add('rv-in');
        if (el.hasAttribute('data-count')) contar(el);
        var w = el.querySelectorAll ? el.querySelectorAll('[data-count]') : [];
        w.forEach(contar);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.04 });
  }

  function marcarNovos(base) {
    if (!M.obs) return;
    var ativo = M.cfg.anima !== 'off';
    (base || document).querySelectorAll(ALVOS_REVELA).forEach(function (el) {
      if (el.hasAttribute('data-rv')) return;
      el.setAttribute('data-rv', '');
      if (ativo) { el.classList.add('rv'); }
      M.obs.observe(el);
    });
    (base || document).querySelectorAll(ALVOS_PARALAXE).forEach(function (el) {
      if (el.hasAttribute('data-par')) return;
      el.setAttribute('data-par', '');
      M.obs.observe(el);
    });
    (base || document).querySelectorAll('[data-count]').forEach(function (el) {
      if (!el.hasAttribute('data-rv')) { el.setAttribute('data-rv', ''); M.obs.observe(el); }
    });
    if (M.cfg.anima === 'imersivo') dividirTitulos(base || document);
    document.querySelectorAll(ALVOS_PREVINE).forEach(function (el) { if (M.lenis && !el.hasAttribute('data-lenis-prevent')) el.setAttribute('data-lenis-prevent', ''); });
  }

  function ligarMutacao() {
    if (M.mut) return;
    M.mut = new MutationObserver(function () {
      clearTimeout(M.mutTimer);
      M.mutTimer = setTimeout(function () { marcarNovos(document); }, 90);
    });
    M.mut.observe(document.body, { childList: true, subtree: true });
  }

  function ativarRevelacao(ligar) {
    raiz.classList.toggle('rv-ativo', !!ligar);
    document.querySelectorAll('.rv').forEach(function (el) {
      if (!ligar) { el.classList.remove('rv'); el.classList.remove('rv-in'); el.style.transitionDelay = ''; }
    });
    if (ligar) {
      document.querySelectorAll('[data-rv]').forEach(function (el) { if (!el.classList.contains('rv-in')) el.classList.add('rv'); });
    }
  }

  /* ---------- títulos em palavras (imersivo) ---------- */
  function dividirTitulos(base) {
    base.querySelectorAll('.mega, .ficha-t, .tarefa-t, .t-titulo').forEach(function (h) {
      if (h.hasAttribute('data-split') || h.children.length) return;
      var texto = h.textContent;
      if (!texto.trim()) return;
      h.setAttribute('data-split', texto);
      h.setAttribute('aria-label', texto);
      h.innerHTML = texto.split(/(\s+)/).map(function (p, i) {
        return /^\s+$/.test(p) ? ' ' : '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + p.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
      }).join('');
      requestAnimationFrame(function () { h.classList.add('split-in'); });
    });
  }

  function desfazerTitulos() {
    document.querySelectorAll('[data-split]').forEach(function (h) {
      h.textContent = h.getAttribute('data-split');
      h.removeAttribute('data-split');
      h.removeAttribute('aria-label');
      h.classList.remove('split-in');
    });
  }

  /* ---------- contagem de números ---------- */
  function contar(el) {
    if (el.hasAttribute('data-contado')) return;
    var alvo = Number(el.getAttribute('data-count'));
    if (!isFinite(alvo)) return;
    el.setAttribute('data-contado', '');
    if (M.cfg.anima === 'off') return;
    var t0 = performance.now();
    var dur = 900 + Math.min(900, alvo / 40);
    var final = el.textContent;
    function passo(t) {
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = p >= 1 ? final : Math.round(alvo * e).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }

  /* ---------- paralaxe ---------- */
  function quadroParalaxe() {
    if (M.cfg.anima !== 'imersivo' || !M.visiveis.size) return;
    var vh = window.innerHeight;
    M.visiveis.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var d = ((r.top + r.height / 2) - vh / 2) / vh;
      var y = Math.max(-26, Math.min(26, d * -44));
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(1.08)';
    });
  }

  function limparParalaxe() {
    document.querySelectorAll('[data-par]').forEach(function (el) { el.style.transform = ''; });
  }

  /* ---------- cursor luminoso e magnético ---------- */
  function ligarCursor() {
    if (M.cursor || toque) return;
    M.cursor = document.createElement('div');
    M.cursor.className = 'cursor-luz';
    M.cursor.setAttribute('aria-hidden', 'true');
    M.cursor.innerHTML = '<i></i><b></b>';
    document.body.appendChild(M.cursor);
    document.addEventListener('pointermove', mover, { passive: true });
    document.addEventListener('pointerover', sobre, { passive: true });
    document.addEventListener('pointerout', fora, { passive: true });
    raiz.classList.add('cursor-ativo');
    acordar();
  }

  function desligarCursor() {
    if (!M.cursor) return;
    M.cursor.remove();
    M.cursor = null;
    document.removeEventListener('pointermove', mover);
    document.removeEventListener('pointerover', sobre);
    document.removeEventListener('pointerout', fora);
    raiz.classList.remove('cursor-ativo');
  }

  function mover(e) {
    M.ponteiro.x = e.clientX; M.ponteiro.y = e.clientY; M.ponteiro.ativo = true;
    if (M.cfg.anima === 'imersivo') magnetico(e);
  }

  function sobre(e) {
    if (!M.cursor) return;
    M.cursor.classList.toggle('sobre', !!(e.target.closest && e.target.closest('a, button, summary, input, textarea, select, [role="button"], .cel, .sticker')));
  }
  function fora() { if (M.cursor) M.cursor.classList.remove('sobre'); }

  function quadroCursor() {
    if (!M.cursor) return;
    var p = M.ponteiro;
    p.lx += (p.x - p.lx) * 0.16;
    p.ly += (p.y - p.ly) * 0.16;
    M.cursor.style.transform = 'translate3d(' + p.lx.toFixed(1) + 'px,' + p.ly.toFixed(1) + 'px,0)';
    M.cursor.firstChild.style.transform = 'translate3d(' + ((p.x - p.lx) * 0.5).toFixed(1) + 'px,' + ((p.y - p.ly) * 0.5).toFixed(1) + 'px,0)';
  }

  var magAtual = null;
  function magnetico(e) {
    var alvo = e.target.closest ? e.target.closest('.botao.sinal, .botao.pri, .ic, .tb-nav a[aria-current]') : null;
    if (magAtual && magAtual !== alvo) { magAtual.style.transform = ''; magAtual = null; }
    if (!alvo) return;
    var r = alvo.getBoundingClientRect();
    var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    alvo.style.transform = 'translate3d(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px,0)';
    magAtual = alvo;
  }

  /* ---------- partículas de fundo (pólen) ---------- */
  function ligarPolen() {
    if (M.polen || reduz.matches) return;
    var c = document.createElement('canvas');
    c.className = 'polen';
    c.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(c, document.body.firstChild);
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var n = Math.round(Math.min(46, Math.max(18, window.innerWidth / 38)));
    var ps = [];
    function tam() { c.width = Math.floor(window.innerWidth * dpr); c.height = Math.floor(window.innerHeight * dpr); }
    tam();
    for (var i = 0; i < n; i++) ps.push({ x: Math.random(), y: Math.random(), r: 0.8 + Math.random() * 2.2, v: 0.00006 + Math.random() * 0.00014, f: Math.random() * 6.28, a: 0.25 + Math.random() * 0.5 });
    M.polen = { c: c, ctx: ctx, ps: ps, dpr: dpr, tam: tam, cor: '' };
    window.addEventListener('resize', tam);
    acordar();
  }

  function desligarPolen() {
    if (!M.polen) return;
    window.removeEventListener('resize', M.polen.tam);
    M.polen.c.remove();
    M.polen = null;
  }

  function quadroPolen(t) {
    var p = M.polen;
    if (!p) return;
    if (!p.cor) { var cs = getComputedStyle(raiz); p.cor = cs.getPropertyValue('--sinal').trim() || '#ff3b1d'; p.tinta = cs.getPropertyValue('--tinta').trim() || '#111'; }
    var w = p.c.width, h = p.c.height;
    p.ctx.clearRect(0, 0, w, h);
    var mx = M.ponteiro.x / window.innerWidth, my = M.ponteiro.y / window.innerHeight;
    p.ps.forEach(function (o, i) {
      o.y -= o.v * 16;
      o.x += Math.sin(t / 2600 + o.f) * 0.00028;
      if (M.ponteiro.ativo) {
        var dx = o.x - mx, dy = o.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 0.012) { o.x += dx * 0.02; o.y += dy * 0.02; }
      }
      if (o.y < -0.03) { o.y = 1.03; o.x = Math.random(); }
      p.ctx.beginPath();
      p.ctx.globalAlpha = o.a * (0.35 + 0.65 * Math.abs(Math.sin(t / 1900 + o.f)));
      p.ctx.fillStyle = i % 4 === 0 ? p.cor : p.tinta;
      p.ctx.arc(o.x * w, o.y * h, o.r * p.dpr, 0, 6.283);
      p.ctx.fill();
    });
    p.ctx.globalAlpha = 1;
  }

  /* ---------- aplicar a configuração ---------- */
  function aplicarConfig() {
    var c = M.cfg = PT.efetivo();
    if (c.rolagem === 'suave') ligarLenis(); else desligarLenis();
    ligarObservador();
    ligarMutacao();
    ativarRevelacao(c.anima !== 'off');
    marcarNovos(document);
    if (c.anima === 'off') { desfazerTitulos(); limparParalaxe(); desligarBarra(); } else { ligarBarra(); }
    if (c.anima !== 'imersivo') { desfazerTitulos(); limparParalaxe(); }
    else dividirTitulos(document);
    if (c.cursor === 'on') ligarCursor(); else desligarCursor();
    if (c.polen === 'on') ligarPolen(); else desligarPolen();
    acordar();
  }

  function ancoras(e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    var h = a.getAttribute('href');
    if (h.length < 2 || /^#(f|s|q)=|^#sem$/.test(h)) return;
    var alvo = document.getElementById(decodeURIComponent(h.slice(1)));
    if (!alvo) return;
    e.preventDefault();
    /* Rolagem própria em vez do salto padrão do navegador — mas o salto padrão também
       muda a #hash e avisa a página (evento "hashchange"). Páginas como a Eu escutam
       esse aviso pra saber qual aba mostrar; sem ele, o clique rola suave até uma seção
       que continua escondida, e por fora parece um "botão que não clica". Repõe as
       duas coisas que o preventDefault tirou, na ordem certa: primeiro avisa (a aba
       aparece), só depois rola (agora tem algo visível pra rolar até). */
    if (location.hash !== h) {
      history.pushState(null, '', h);
      window.dispatchEvent(new Event('hashchange'));
    }
    rolarPara(alvo, { deslocamento: -84 });
  }
  document.addEventListener('click', ancoras);

  window.addEventListener('pers:mudou', aplicarConfig);
  window.Movimento = { aoFrame: aoFrame, rolarPara: rolarPara, topo: topo, revalidar: function () { marcarNovos(document); }, config: function () { return M.cfg; }, lenis: function () { return M.lenis; } };

  function iniciar() { aplicarConfig(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
