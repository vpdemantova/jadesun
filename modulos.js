(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;

  var ICONE_ATLAS = {
    'Espécies': '🐾', 'Elementos': '⚛️', 'Objetos e instrumentos': '🪐', 'Pessoas': '🧑', 'Obras': '📖',
    'Mitologia': '⚡', 'Línguas': '🗣️', 'Conceitos': '💡', 'Ofícios': '🛠️', 'Escolas e grupos': '🎭',
    'Reinos e países': '🌍', 'Linhas do tempo (eras)': '⏳', 'Mapas': '🗺️', 'Matérias-primas': '⛏️', 'Componentes': '🔩', 'Computação': '💻', 'Tábuas': '📐',
  };

  function decksVestibular(e) {
    return e.checklist.map(function (s) {
      return { grupo: 'vestibular', nome: s.nome, cor: P.corDe(s.nome), feitos: s.feitos, total: s.total, pct: s.total ? Math.round(s.feitos / s.total * 100) : 0 };
    });
  }

  function decksAtlas(indice) {
    var atlas = indice.acervos.filter(function (a) { return a.id === 'atlas'; })[0];
    if (!atlas) return [];
    return atlas.secoes.map(function (s) {
      return { grupo: 'atlas', nome: s.nome, secaoId: s.id, total: s.total, imagens: s.imagens, capa: s.capas && s.capas[0], icone: ICONE_ATLAS[s.nome] || '◆' };
    });
  }

  function cartaoVestibular(d, i) {
    return '<button type="button" class="md-c ' + d.cor + '" data-i="' + i + '"><span class="md-barra"><i style="width:' + d.pct + '%"></i></span>' +
      '<b class="md-nome">' + esc(d.nome) + '</b><span class="md-n">' + d.feitos + '/' + d.total + '</span><span class="rot">' + d.pct + '% dominado</span></button>';
  }

  function cartaoAtlas(d, i) {
    var fundo = d.capa ? ' style="background-image:url(\'' + esc(d.capa) + '\')"' : '';
    return '<button type="button" class="md-c md-atlas' + (d.capa ? ' md-com-capa' : '') + '" data-i="' + i + '"' + fundo + '>' +
      '<span class="md-vu">' + (d.icone || '◆') + '</span><b class="md-nome">' + esc(d.nome) + '</b><span class="rot">' + d.total + (d.total === 1 ? ' ficha' : ' fichas') + (d.imagens ? ' · ' + d.imagens + ' img' : '') + '</span></button>';
  }

  function montar(alvo, o) {
    var vivo = true;
    var grupo = 'vestibular';
    var vest = decksVestibular(o.estado);
    var atl = decksAtlas(o.indice);
    if (!vest.length && atl.length) grupo = 'atlas';

    alvo.innerHTML = '<div class="cx md-mod">' +
      '<div class="md-topo"><p class="rot">Módulos · o que estudar agora</p>' +
      '<div class="md-abas" role="tablist"><button type="button" class="md-aba" data-g="vestibular" role="tab">Vestibular <small>' + vest.length + '</small></button>' +
      '<button type="button" class="md-aba" data-g="atlas" role="tab">Atlas <small>' + atl.length + '</small></button></div></div>' +
      '<div class="md-faixa-wrap"><button type="button" class="md-seta md-esq" aria-label="Anterior">‹</button>' +
      '<div class="md-faixa" id="md-faixa-el" tabindex="0" aria-label="Módulos, role para o lado"></div>' +
      '<button type="button" class="md-seta md-dir" aria-label="Próximo">›</button></div></div>';

    var raiz = alvo.querySelector('.md-mod');
    var faixa = alvo.querySelector('#md-faixa-el');
    var btEsq = alvo.querySelector('.md-esq');
    var btDir = alvo.querySelector('.md-dir');

    function pintarAbas() {
      raiz.querySelectorAll('.md-aba').forEach(function (b) { var on = b.getAttribute('data-g') === grupo; b.setAttribute('aria-selected', on); b.classList.toggle('on', on); });
    }

    function desenharFaixa() {
      var lista = grupo === 'vestibular' ? vest : atl;
      var fn = grupo === 'vestibular' ? cartaoVestibular : cartaoAtlas;
      faixa.innerHTML = lista.length ? lista.map(fn).join('') : '<p class="rot suave md-vazio">Nada aqui ainda.</p>';
      faixa.scrollLeft = 0;
      pintarAbas();
    }

    function rolar(dir) { faixa.scrollBy({ left: dir * Math.min(520, faixa.clientWidth * 0.85), behavior: 'smooth' }); }

    /* arraste com o mouse: navega a faixa sem barra de rolagem visível */
    var arrastando = false, arrastou = false, comecoX = 0, comecoScroll = 0;
    faixa.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      arrastando = true; arrastou = false;
      comecoX = ev.clientX; comecoScroll = faixa.scrollLeft;
      faixa.setPointerCapture(ev.pointerId);
      faixa.classList.add('arrastando');
    });
    faixa.addEventListener('pointermove', function (ev) {
      if (!arrastando) return;
      var dx = ev.clientX - comecoX;
      if (Math.abs(dx) > 4) arrastou = true;
      faixa.scrollLeft = comecoScroll - dx;
    });
    function soltarArraste() { arrastando = false; faixa.classList.remove('arrastando'); }
    faixa.addEventListener('pointerup', soltarArraste);
    faixa.addEventListener('pointerleave', soltarArraste);
    faixa.addEventListener('pointercancel', soltarArraste);

    raiz.addEventListener('click', function (ev) {
      var aba = ev.target.closest('.md-aba');
      if (aba) { grupo = aba.getAttribute('data-g'); desenharFaixa(); return; }
      var seta = ev.target.closest('.md-seta');
      if (seta) { rolar(seta.classList.contains('md-esq') ? -1 : 1); return; }
      var c = ev.target.closest('.md-c');
      if (!c) return;
      if (arrastou) { arrastou = false; return; } /* foi arraste, não clique */
      var i = +c.getAttribute('data-i');
      if (grupo === 'vestibular') { if (o.aoVestibular) o.aoVestibular(vest[i]); }
      else if (o.aoAtlas) o.aoAtlas(atl[i]);
    });
    faixa.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { rolar(1); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { rolar(-1); ev.preventDefault(); }
    });

    desenharFaixa();

    return {
      atualizar: function (novoEstado) { vest = decksVestibular(novoEstado); if (grupo === 'vestibular') desenharFaixa(); },
      destruir: function () { vivo = false; },
    };
  }

  window.Modulos = { montar: montar };
})();
