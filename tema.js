(function () {
  'use strict';

  var CHAVE = 'perfil-pers';
  var calmo = false;
  try { calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var PADRAO = {
    estilo: 'fino', tema: 'auto', cor: 'tema', tam: 'm', dens: 'n', fonte: 'serifa', img: 'pb',
    anima: calmo ? 'off' : 'suave', rolagem: calmo ? 'normal' : 'suave', cursor: 'off', polen: 'off',
    faixa: 'off', ruido: 'off',
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
    if (o.v !== 2) { delete o.faixa; delete o.ruido; delete o.mov; }
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
    c.v = 2;
    try { localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) {}
  }

  window.PersTema = { padrao: PADRAO, presets: PRESETS, salvo: salvo, efetivo: efetivo, aplicar: aplicar, gravar: gravar };
  aplicar(efetivo());
})();
