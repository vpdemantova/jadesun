(function () {
  'use strict';

  var CHAVE = 'perfil-pers';
  var calmo = false;
  try { calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var PADRAO = {
    estilo: 'fino', acabamento: 'solar', tema: 'auto', cor: 'tema', tam: 'm', dens: 'n', fonte: 'serifa', img: 'pb',
    anima: calmo ? 'off' : 'suave', rolagem: calmo ? 'normal' : 'suave', cursor: 'off', polen: 'off',
    faixa: 'off', ruido: 'off', marca: 'auto',
  };

  var PRESETS = {
    calmo: { anima: 'off', rolagem: 'normal', cursor: 'off', polen: 'off', faixa: 'off', ruido: 'off' },
    fino: { anima: 'suave', rolagem: 'suave', cursor: 'off', polen: 'off', faixa: 'off', ruido: 'off' },
    imersivo: { anima: 'imersivo', rolagem: 'suave', cursor: 'on', polen: 'on', faixa: 'off', ruido: 'off' },
  };

  function salvo() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { o = {}; }
    if (!o.tema) {
      try {
        var antigo = localStorage.getItem('perfil-tema');
        if (antigo === 'claro' || antigo === 'escuro') o.tema = antigo;
      } catch (e) {}
    }
    if (o.v !== 2 && o.v !== 3 && o.v !== 4) { delete o.faixa; delete o.ruido; delete o.mov; }
    /* 08/out/2026: o Almanaque vira o padrão. Quem estava no Casa (o padrão anterior) passa uma vez
       para o Almanaque; o Casa continua em Personalizar → Acabamento. */
    if (o.v !== 3 && o.v !== 4 && o.acabamento === 'casa') o.acabamento = 'almanaque';
    /* 08/out/2026, mais tarde: o Almanaque não agradou; o Solar vira o padrão. Quem estava no Almanaque
       ou no Casa (os padrões anteriores) passa uma vez para o Solar; os dois continuam em Personalizar. */
    if (o.v !== 4 && (o.acabamento === 'almanaque' || o.acabamento === 'casa')) o.acabamento = 'solar';
    var r = {};
    Object.keys(PADRAO).forEach(function (k) { r[k] = o[k] || PADRAO[k]; });
    return r;
  }

  function efetivo() {
    var o = salvo();
    var url = new URLSearchParams(location.search).get('tema');
    if (url) o.tema = url;
    return o;
  }

  function aplicar(o) {
    var raiz = document.documentElement;
    Object.keys(PADRAO).forEach(function (k) {
      if (k === 'estilo') { raiz.setAttribute('data-estilo', o.estilo === 'classico' ? 'classico' : 'fino'); return; }
      // os acabamentos valem por cima do Fino: Almanaque (padrão), Casa (vidro quente) ou Simples (o Fino puro)
      if (k === 'acabamento') { raiz.setAttribute('data-acabamento', ['simples', 'casa', 'almanaque'].indexOf(o.acabamento) >= 0 ? o.acabamento : 'solar'); return; }
      if (k === 'anima' || k === 'rolagem' || k === 'faixa' || k === 'ruido' || k === 'cursor' || k === 'polen') { raiz.setAttribute('data-' + k, o[k]); return; }
      if (o[k] === PADRAO[k]) raiz.removeAttribute('data-' + k);
      else raiz.setAttribute('data-' + k, o[k]);
    });
    if (o.anima === 'off') raiz.setAttribute('data-mov', 'off'); else raiz.removeAttribute('data-mov');
    try { window.dispatchEvent(new CustomEvent('pers:mudou', { detail: o })); } catch (e) {}
  }

  function gravar(o) {
    var c = {};
    Object.keys(o).forEach(function (k) { c[k] = o[k]; });
    c.v = 4;
    try { localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) {}
  }

  window.PersTema = { padrao: PADRAO, presets: PRESETS, salvo: salvo, efetivo: efetivo, aplicar: aplicar, gravar: gravar };
  aplicar(efetivo());

  /* o Portal (item 74): quem entra por um mundo do Portal nasce do mesmo ponto — a página nova se abre
     num círculo a partir de onde o mundo estava (transição entre páginas, tipo "portal"). Fica aqui
     porque o tema.js roda antes da primeira pintura, que é quando o "pagereveal" acontece. */
  window.addEventListener('pagereveal', function (ev) {
    var c = null;
    try { c = JSON.parse(sessionStorage.getItem('portal:chegada') || 'null'); sessionStorage.removeItem('portal:chegada'); } catch (e) { c = null; }
    if (!c || Date.now() - c.quando > 10000) return;
    var raiz = document.documentElement;
    raiz.style.setProperty('--po-x', c.x + 'px'); raiz.style.setProperty('--po-y', c.y + 'px');
    if (ev.viewTransition && ev.viewTransition.types) ev.viewTransition.types.add('portal');
  });
})();

/* ============================================================
   O ÍCONE DE CADA PÁGINA (04/out/2026)
   Para diferenciar as abas abertas no navegador: cada página ganha
   uma cor e uma forma próprias, sempre uma variação do quadrado, no
   mesmo fundo escuro arredondado do icone.svg. Feito aqui (e não em
   arquivos) porque o tema.js já abre todas as páginas, inclusive no
   site exportado: o ícone é um SVG embutido (data:).
   ============================================================ */
(function () {
  'use strict';

  var FUNDO = '#0F0E0B';
  /* cada forma desenha dentro de 512 × 512, em volta do centro (256, 256) */
  var FORMAS = {
    /* o losango original: o quadrado girado 45° (Agora) */
    losango: function (c) { return '<g transform="translate(256 256) rotate(45)"><rect x="-96" y="-96" width="192" height="192" rx="22" fill="' + c + '"/></g><circle cx="256" cy="256" r="14" fill="' + FUNDO + '"/>'; },
    /* mosaico 3 × 3 de quadradinhos (Domino) */
    mosaico: function (c) {
      var s = '';
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) s += '<rect x="' + (136 + j * 86) + '" y="' + (136 + i * 86) + '" width="68" height="68" rx="12" fill="' + c + '"' + ((i + j) % 2 ? ' opacity=".55"' : '') + '/>';
      return s;
    },
    /* folha: quadrado com dois cantos opostos bem redondos (Jardim) */
    folha: function (c) { return '<path d="M136 376V236q0-100 100-100h140v140q0 100-100 100z" fill="' + c + '"/><path d="M168 344l176-176" stroke="' + FUNDO + '" stroke-width="16" stroke-linecap="round"/>'; },
    /* moldura: quadrado vazado com um quadradinho no meio (Atlas) */
    moldura: function (c) { return '<rect x="140" y="140" width="232" height="232" rx="26" fill="none" stroke="' + c + '" stroke-width="34"/><rect x="226" y="226" width="60" height="60" rx="10" fill="' + c + '"/>'; },
    /* rede: quatro quadradinhos ligados por fios (Área: o mapa dos conceitos) */
    rede: function (c) { return '<path d="M178 178L334 178M178 178L256 334M334 178L256 334M256 334L370 370" stroke="' + c + '" stroke-width="16" stroke-linecap="round" opacity=".6"/><rect x="128" y="128" width="100" height="100" rx="20" fill="' + c + '"/><rect x="296" y="140" width="76" height="76" rx="16" fill="' + c + '"/><rect x="218" y="296" width="76" height="76" rx="16" fill="' + c + '"/><rect x="340" y="340" width="56" height="56" rx="12" fill="' + c + '" opacity=".8"/>'; },
    /* dois quadrados sobrepostos (Biblioteca) */
    pilha: function (c) { return '<rect x="176" y="120" width="216" height="216" rx="26" fill="' + c + '" opacity=".5"/><rect x="120" y="176" width="216" height="216" rx="26" fill="' + c + '"/>'; },
    /* três quadrados subindo em degrau (Linha do tempo) */
    degraus: function (c) { return '<rect x="112" y="296" width="96" height="96" rx="16" fill="' + c + '" opacity=".55"/><rect x="208" y="208" width="96" height="96" rx="16" fill="' + c + '" opacity=".8"/><rect x="304" y="120" width="96" height="96" rx="16" fill="' + c + '"/>'; },
    /* quadrado com um canto faltando (Falta) */
    entalhe: function (c) { return '<path d="M136 162q0-26 26-26h214v124H260v116H162q-26 0-26-26z" fill="' + c + '"/><rect x="296" y="296" width="80" height="80" rx="14" fill="none" stroke="' + c + '" stroke-width="14" stroke-dasharray="20 14"/>'; },
    /* um quadrado pequeno sobre um maior (Eu) */
    pessoa: function (c) { return '<rect x="206" y="112" width="100" height="100" rx="30" fill="' + c + '"/><rect x="136" y="236" width="240" height="164" rx="40" fill="' + c + '"/>'; },
    /* quadrado com telhado (Casa) */
    casa: function (c) { return '<path d="M256 112l144 120v136q0 24-24 24H136q-24 0-24-24V232z" fill="' + c + '"/><rect x="226" y="300" width="60" height="92" rx="8" fill="' + FUNDO + '"/>'; },
    /* quadrado em lombadas (Estante) */
    lombadas: function (c) { return '<rect x="128" y="136" width="62" height="240" rx="10" fill="' + c + '"/><rect x="206" y="160" width="62" height="216" rx="10" fill="' + c + '" opacity=".7"/><rect x="284" y="136" width="62" height="240" rx="10" fill="' + c + '"/><rect x="112" y="388" width="288" height="20" rx="6" fill="' + c + '" opacity=".6"/>'; },
    /* quadrado em duas portas (Guarda-roupa) */
    portas: function (c) { return '<rect x="128" y="120" width="120" height="272" rx="18" fill="' + c + '"/><rect x="264" y="120" width="120" height="272" rx="18" fill="' + c + '"/><circle cx="230" cy="256" r="10" fill="' + FUNDO + '"/><circle cx="282" cy="256" r="10" fill="' + FUNDO + '"/>'; },
    /* retângulo em pé na proporção 63 × 88, um pouco girado (Carta) */
    carta: function (c) { return '<g transform="translate(256 256) rotate(-8)"><rect x="-100" y="-140" width="200" height="280" rx="22" fill="' + c + '"/><rect x="-76" y="-112" width="152" height="112" rx="10" fill="' + FUNDO + '" opacity=".55"/></g>'; },
    /* quadrados concêntricos (Protetor de tela) */
    tela: function (c) { return '<rect x="120" y="120" width="272" height="272" rx="34" fill="none" stroke="' + c + '" stroke-width="22"/><rect x="180" y="180" width="152" height="152" rx="22" fill="none" stroke="' + c + '" stroke-width="22" opacity=".7"/><rect x="232" y="232" width="48" height="48" rx="8" fill="' + c + '"/>'; },
    /* dois quadrados, um vazado e um cheio, sobrepostos (Copiar) */
    copia: function (c) { return '<rect x="190" y="120" width="200" height="200" rx="26" fill="none" stroke="' + c + '" stroke-width="28" opacity=".6"/><rect x="122" y="192" width="200" height="200" rx="26" fill="' + c + '"/>'; },
    /* retângulo alto com a tela (Celular) */
    celular: function (c) { return '<rect x="176" y="104" width="160" height="304" rx="30" fill="' + c + '"/><rect x="196" y="136" width="120" height="216" rx="10" fill="' + FUNDO + '" opacity=".6"/><circle cx="256" cy="380" r="10" fill="' + FUNDO + '"/>'; },
  };

  /* página → [forma, cor] */
  var PAGINAS = {
    hoje: ['losango', '#FF3B1D'], index: ['losango', '#FF3B1D'],
    domino: ['mosaico', '#F2B705'],
    area: ['rede', '#E8743B'],
    sistema: ['mosaico', '#D9411E'],
    jardim: ['folha', '#3FB36B'],
    atlas: ['moldura', '#3D8FE0'],
    biblioteca: ['pilha', '#6B7BFF'],
    'linha-do-tempo': ['degraus', '#22B8CF'],
    falta: ['entalhe', '#9AA3AE'],
    museus: ['moldura', '#C9A227'],
    eu: ['pessoa', '#E0559A'], album: ['pessoa', '#E0559A'],
    casa: ['casa', '#E0A040'],
    estante: ['lombadas', '#C0703A'],
    'guarda-roupa': ['portas', '#9B7BE0'],
    carta: ['carta', '#14B8A6'],
    protetor: ['tela', '#F6F1E7'],
    copiar: ['copia', '#B8C46A'],
    celular: ['celular', '#F6F1E7'],
  };

  function pagina() {
    var p = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/i, '');
    return p || 'index';
  }

  function svg(forma, cor) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="' + FUNDO + '"/>' + FORMAS[forma](cor) + '</svg>';
  }

  function trocar() {
    var par = PAGINAS[pagina()];
    if (!par || !FORMAS[par[0]]) return;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;
    Array.prototype.forEach.call(document.querySelectorAll('link[rel="icon"]'), function (l) { l.parentNode.removeChild(l); });
    var l = document.createElement('link');
    l.rel = 'icon';
    l.type = 'image/svg+xml';
    l.href = 'data:image/svg+xml,' + encodeURIComponent(svg(par[0], par[1]));
    head.appendChild(l);
  }

  window.IconeDaPagina = { formas: FORMAS, paginas: PAGINAS, svg: svg, trocar: trocar };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', trocar);
  else trocar();
})();
