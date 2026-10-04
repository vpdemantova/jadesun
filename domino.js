(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var mosaico = document.getElementById('mosaico');
  var lista = document.getElementById('lista');
  var estadoAtual = null;

  function primeiroPendente(e) {
    for (var s = 0; s < e.checklist.length; s++) {
      for (var i = 0; i < e.checklist[s].itens.length; i++) if (!e.checklist[s].itens[i].feito) return { s: s, i: i };
    }
    return null;
  }

  var mapaEstudos = {};
  var mapaMapas = {};
  var selecionadas = new Set();
  var modo = 'itens';

  var vivos = {};

  function destruirVivos() { Object.keys(vivos).forEach(function (k) { vivos[k].destruir(); }); vivos = {}; }

  function abrirItem(idAlvo) {
    var el = document.getElementById(idAlvo);
    if (!el) return;
    el.querySelector('details').open = true;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function montarItem(id) {
    if (vivos[id] || !estadoAtual) return;
    var caixa = document.getElementById(id);
    var alvo = caixa && caixa.querySelector('.ce-mount');
    if (!alvo) return;
    var si = +alvo.getAttribute('data-s'), ii = +alvo.getAttribute('data-i');
    var s = estadoAtual.checklist[si], it = s.itens[ii];
    var pro = -1;
    for (var k = 1; k < s.itens.length && pro < 0; k++) { var j = (ii + k) % s.itens.length; if (!s.itens[j].feito) pro = j; }
    vivos[id] = window.Cartao.montar(alvo, {
      secao: s.nome, item: it, cor: P.corDe(s.nome), contexto: 'domino', compacto: true, iSecao: si,
      irOutro: pro >= 0 ? function () { abrirItem('i' + si + '-' + pro); } : null,
      baralho: function () { window.Cartao.baralho(estadoAtual, s.nome, function (_, alvoItem) { abrirItem('i' + si + '-' + s.itens.indexOf(alvoItem)); }); },
      dominar: function (feito) {
        var abertos = abertosAgora();
        return P.marcar(s.nome, it.texto, feito).then(function (novo) {
          desenhar(novo, abertos);
          window.dispatchEvent(new CustomEvent('perfil:estado', { detail: novo }));
        });
      },
    });
    var lista = mapaEstudos[s.nome + '|' + it.texto];
    if (lista) vivos[id].estudos(lista);
    var mapas = mapaMapas[s.nome];
    if (mapas) vivos[id].mapas(mapas);
  }

  function materiaVisivel(nome) { return selecionadas.size === 0 || selecionadas.has(nome); }

  function desenharPills(e) {
    var pills = document.getElementById('dm-pills');
    pills.innerHTML = '<button type="button" class="chip dm-pill-todas' + (selecionadas.size === 0 ? ' on' : '') + '" data-mat="">Todas</button>' +
      e.checklist.map(function (s) {
        var on = materiaVisivel(s.nome);
        return '<button type="button" class="chip ' + P.corDe(s.nome) + (on ? ' on' : '') + '" data-mat="' + esc(s.nome) + '"><i class="q"></i>' + esc(s.nome) + '<b class="dm-conta">' + s.feitos + '/' + s.total + '</b></button>';
      }).join('');
  }

  function conceitoHtml(si, ii, s, it) {
    var t = window.Cartao.dividirTitulo(it.texto);
    var carta = it.carta;
    var corpo;
    if (carta) {
      var resumo = carta.resumo ? '<p class="ce-resumo">' + esc(carta.resumo) + '</p>' : '';
      var casado = t.subs.length ? window.Cartao.casar(t.subs, carta.lembrar || []) : null;
      if (casado && casado.casou) {
        corpo = resumo + '<ol class="ce-grade">' + casado.por.map(function (x, i) {
          return '<li style="--n:' + (i + 1) + '"><b class="ce-n">' + (i + 1) + '</b><h4>' + esc(x.sub) + '</h4><p>' + (x.texto ? esc(x.texto) : '<span class="suave">sem resumo ainda</span>') + '</p></li>';
        }).join('') + '</ol>';
      } else {
        corpo = resumo + '<ul class="lembrar-l">' + (carta.lembrar || []).slice(0, 6).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
      }
    } else {
      corpo = '<p class="suave vg-sem">Sem carta ainda — abra o item para estudar.</p>';
    }
    return '<article class="ce vg-c ' + P.corDe(s.nome) + (it.feito ? ' feito' : '') + '" data-vg="i' + si + '-' + ii + '">' +
      '<h3 class="vg-t">' + esc(t.base) + '</h3>' +
      (t.subs.length ? '<ol class="ce-subs">' + t.subs.map(function (sb, i) { return '<li style="--n:' + (i + 1) + '"><b>' + (i + 1) + '</b>' + esc(sb) + '</li>'; }).join('') + '</ol>' : '') +
      corpo + '</article>';
  }

  function desenharVisaoGeral(e) {
    var vg = document.getElementById('visao-geral');
    var vis = e.checklist.filter(function (s) { return materiaVisivel(s.nome); });
    if (!vis.length) { vg.innerHTML = '<div class="cx"><p class="rot">Nenhuma matéria selecionada</p><p>Escolha ao menos uma pílula acima para ver os conceitos.</p></div>'; return; }
    vg.innerHTML = vis.map(function (s) {
      var si = e.checklist.indexOf(s);
      var ultimoGrupo = null, corpo = '';
      s.itens.forEach(function (it, ii) {
        if (it.grupo !== ultimoGrupo) { corpo += it.grupo ? '<p class="rot vg-grupo-t">' + esc(it.grupo) + '</p>' : ''; ultimoGrupo = it.grupo; }
        corpo += conceitoHtml(si, ii, s, it);
      });
      return '<div class="vg-mat ' + P.corDe(s.nome) + '"><header class="vg-cab"><h2 class="h2">' + esc(s.nome) + '</h2><span class="rot">' + s.feitos + '/' + s.total + ' dominados</span></header>' + corpo + '</div>';
    }).join('');
  }

  function desenhar(e, abertos) {
    estadoAtual = e;
    destruirVivos();
    var atual = primeiroPendente(e);
    var feitos = 0, todos = 0;
    e.checklist.forEach(function (s) { feitos += s.feitos; todos += s.total; });
    document.getElementById('resumo-topo').textContent = feitos + ' / ' + todos + ' dominados';
    desenharPills(e);

    mosaico.innerHTML = e.checklist.map(function (s, si) {
      if (!materiaVisivel(s.nome)) return '';
      return '<div class="m-linha ' + P.corDe(s.nome) + '"><div class="m-nome"><i></i>' + esc(s.nome) + '</div><div class="celulas">' +
        s.itens.map(function (it, ii) {
          var cls = 'cel' + (it.feito ? ' feito' : '') + (atual && atual.s === si && atual.i === ii ? ' atual' : '');
          return '<button type="button" class="' + cls + '" data-s="' + si + '" data-i="' + ii + '" title="' + esc(it.texto) + '" aria-label="' + esc(it.texto) + '"></button>';
        }).join('') + '</div><div class="m-conta">' + s.feitos + '/' + s.total + '</div></div>';
    }).join('');

    lista.innerHTML = e.checklist.map(function (s, si) {
      if (!materiaVisivel(s.nome)) return '';
      var ultimoGrupo = null, corpo = '';
      s.itens.forEach(function (it, ii) {
        if (it.grupo !== ultimoGrupo) { corpo += it.grupo ? '<div class="grupo-d">' + esc(it.grupo) + '</div>' : ''; ultimoGrupo = it.grupo; }
        var id = 'i' + si + '-' + ii;
        corpo += '<div class="item-d' + (it.feito ? ' feito' : '') + '" id="' + id + '">' +
          '<button type="button" class="marca-i" aria-pressed="' + it.feito + '" data-s="' + si + '" data-i="' + ii + '" aria-label="Marcar como dominado: ' + esc(it.texto) + '"></button>' +
          '<details' + (abertos && abertos.has(id) ? ' open' : '') + '><summary>' + esc(it.texto) + (it.carta ? '<span class="tag">carta</span>' : '') + '</summary>' +
          '<div class="corpo ce-mount" data-s="' + si + '" data-i="' + ii + '"></div></details></div>';
      });
      return '<section class="secao-d ' + P.corDe(s.nome) + ' revela" id="s' + si + '"><header><h2 class="h2">' + esc(s.nome) + '</h2>' +
        '<span class="rot">' + (s.nota ? esc(s.nota) + ' · ' : '') + s.feitos + '/' + s.total + '</span>' +
        '<button type="button" class="ic bx-abre" data-bx="' + si + '" aria-label="Ver o baralho de ' + esc(s.nome) + '" title="Ver o baralho">' + P.icone('baralho') + '</button></header>' +
        '<div class="dmx-antes" data-mat="' + esc(s.nome) + '"></div>' + corpo + '<div class="dmx-depois" data-mat="' + esc(s.nome) + '"></div></section>';
    }).join('');
    lista.querySelectorAll('.item-d details[open]').forEach(function (d) { montarItem(d.parentElement.id); });
    if (window.DominoMais) window.DominoMais.preencher(lista); /* Tábua antes, Grandes Obras depois (domino-mais.js) */
    desenharVisaoGeral(e);
  }

  function abertosAgora() {
    var set = new Set();
    lista.querySelectorAll('.item-d details[open]').forEach(function (d) { set.add(d.parentElement.id); });
    return set;
  }

  document.getElementById('dm-pills').addEventListener('click', function (ev) {
    var b = ev.target.closest('.chip');
    if (!b || !estadoAtual) return;
    var nome = b.dataset.mat;
    if (!nome) selecionadas.clear();
    else if (selecionadas.has(nome)) selecionadas.delete(nome);
    else selecionadas.add(nome);
    desenhar(estadoAtual, abertosAgora());
  });

  function trocarModo(m) {
    modo = m;
    if (m === 'geral') document.body.setAttribute('data-modo', 'geral');
    else document.body.removeAttribute('data-modo');
    document.querySelectorAll('.dm-modo').forEach(function (x) { x.classList.toggle('on', x.dataset.modo === m); });
  }

  document.querySelector('.dm-modos').addEventListener('click', function (ev) {
    var b = ev.target.closest('.dm-modo');
    if (!b) return;
    trocarModo(b.dataset.modo);
  });

  document.getElementById('visao-geral').addEventListener('click', function (ev) {
    var c = ev.target.closest('.vg-c');
    if (!c) return;
    trocarModo('itens');
    abrirItem(c.dataset.vg);
  });

  mosaico.addEventListener('click', function (ev) {
    var b = ev.target.closest('.cel');
    if (!b) return;
    var alvo = document.getElementById('i' + b.dataset.s + '-' + b.dataset.i);
    if (!alvo) return;
    alvo.querySelector('details').open = true;
    alvo.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });

  lista.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (d.tagName === 'DETAILS' && d.open && d.parentElement && d.parentElement.classList.contains('item-d')) montarItem(d.parentElement.id);
  }, true);

  lista.addEventListener('click', function (ev) {
    var bx = ev.target.closest('.bx-abre');
    if (bx) {
      var sec = estadoAtual.checklist[+bx.dataset.bx];
      window.Cartao.baralho(estadoAtual, sec.nome, function (_, alvoItem) { abrirItem('i' + bx.dataset.bx + '-' + sec.itens.indexOf(alvoItem)); });
      return;
    }
    var b = ev.target.closest('.marca-i');
    if (!b) return;
    var s = estadoAtual.checklist[+b.dataset.s];
    var it = s.itens[+b.dataset.i];
    b.disabled = true;
    var abertos = abertosAgora();
    P.marcar(s.nome, it.texto, !it.feito).then(function (novo) {
      desenhar(novo, abertos);
      window.dispatchEvent(new CustomEvent('perfil:estado', { detail: novo }));
    }).catch(function (erro) { b.disabled = false; alert(erro.message); });
  });

  Promise.all([P.estudos(), P.estado(true), P.mapas()]).then(function (r) {
    mapaEstudos = r[0] || {};
    var e = r[1];
    mapaMapas = r[2] || {};
    desenhar(e);
    if (location.hash) { try { var alvo = document.querySelector(location.hash); if (alvo) alvo.scrollIntoView(); } catch (x) {} }
  }).catch(function () {
    mosaico.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.bat</b> e deixe a janelinha preta aberta.</p></div>';
  });
})();
