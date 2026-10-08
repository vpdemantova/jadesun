/* Museus e fundações (07/out/2026): "pra que todos os museus e fundações
   da humanidade sejam listados". A lista mora no caderno, no arquivo do
   Atlas "Museus e Fundações da Humanidade" (tabelas por continente, sob
   "## Museus" e "## Fundações e institutos"); esta página lê o arquivo ao
   vivo (pelo índice da Biblioteca), e dá busca, filtro por tipo e por
   continente e a contagem. Para somar um museu: uma linha na tabela. */
(function () {
  'use strict';
  var TITULO = 'Museus e Fundações da Humanidade';
  var $ = function (id) { return document.getElementById(id); };
  var estado = { itens: [], tipo: 'todos', cont: 'todos', busca: '', fichaId: '' };

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* as tabelas do arquivo: "## Museus" / "## Fundações…" → tipo;
     "### continente" → grupo; cada linha | Nome | Cidade | País | Desde | Acervo | */
  function ler(corpo) {
    var itens = [], tipo = '', grupo = '';
    corpo.split(/\r?\n/).forEach(function (l) {
      var h2 = l.match(/^##\s+(.+)$/), h3 = l.match(/^###\s+(.+)$/);
      if (h2) { tipo = /funda/i.test(h2[1]) ? 'fundacao' : 'museu'; grupo = ''; return; }
      if (h3) { grupo = h3[1].trim(); return; }
      if (!tipo || !/^\|/.test(l) || /^\|\s*-/.test(l) || /^\|\s*Nome\s*\|/i.test(l)) return;
      var c = l.split('|').slice(1, -1).map(function (x) { return x.trim(); });
      if (c.length < 5 || !c[0]) return;
      itens.push({ tipo: tipo, grupo: grupo, nome: c[0].replace(/\[\[|\]\]/g, ''), cidade: c[1], pais: c[2], ano: c[3], acervo: c[4] });
    });
    return itens;
  }

  function chips(el, valores, atual, aoEscolher) {
    el.innerHTML = valores.map(function (v) {
      return '<button type="button" class="mu-chip' + (v[0] === atual ? ' on' : '') + '" data-v="' + esc(v[0]) + '">' + esc(v[1]) + ' <span>' + v[2] + '</span></button>';
    }).join('');
    el.onclick = function (e) {
      var b = e.target.closest('button');
      if (b) aoEscolher(b.getAttribute('data-v'));
    };
  }

  function desenhar() {
    var q = norm(estado.busca);
    var base = estado.itens.filter(function (it) {
      if (estado.tipo !== 'todos' && it.tipo !== estado.tipo) return false;
      if (q && norm([it.nome, it.cidade, it.pais, it.acervo, it.ano].join(' ')).indexOf(q) < 0) return false;
      return true;
    });
    var grupos = [];
    base.forEach(function (it) { if (grupos.indexOf(it.grupo) < 0) grupos.push(it.grupo); });
    var visiveis = base.filter(function (it) { return estado.cont === 'todos' || it.grupo === estado.cont; });

    var nM = estado.itens.filter(function (x) { return x.tipo === 'museu'; }).length;
    var nF = estado.itens.length - nM;
    chips($('mu-tipos'), [['todos', 'Todos', estado.itens.length], ['museu', 'Museus', nM], ['fundacao', 'Fundações', nF]], estado.tipo, function (v) { estado.tipo = v; estado.cont = 'todos'; desenhar(); });
    chips($('mu-cont'), [['todos', 'Todo o mundo', base.length]].concat(grupos.map(function (g) {
      return [g, g, base.filter(function (x) { return x.grupo === g; }).length];
    })), estado.cont, function (v) { estado.cont = v; desenhar(); });

    var html = '';
    var ordem = [];
    visiveis.forEach(function (it) { var k = it.tipo + '|' + it.grupo; if (ordem.indexOf(k) < 0) ordem.push(k); });
    ordem.forEach(function (k) {
      var partes = k.split('|');
      var lista = visiveis.filter(function (x) { return x.tipo + '|' + x.grupo === k; });
      html += '<div class="mu-grupo"><h2 class="mu-h">' + esc(partes[1]) + ' <span>' + (partes[0] === 'museu' ? 'museus' : 'fundações') + ' · ' + lista.length + '</span></h2><ol class="mu-itens">';
      lista.forEach(function (it) {
        html += '<li class="mu-item"><span class="mu-ano">' + (it.ano ? esc(it.ano) : '<i title="a conferir">—</i>') + '</span>' +
          '<span class="mu-nome">' + esc(it.nome) + '</span>' +
          '<span class="mu-onde">' + esc(it.cidade) + ' · ' + esc(it.pais) + '</span>' +
          '<span class="mu-acervo">' + esc(it.acervo) + '</span></li>';
      });
      html += '</ol></div>';
    });
    $('mu-lista').innerHTML = html || '<p class="resposta">Nada com esse nome na lista. Para somar, escreva uma linha na tabela do arquivo do Atlas.</p>';
  }

  function iniciar() {
    $('mu-busca').addEventListener('input', function (e) { estado.busca = e.target.value; desenhar(); });
    fetch('/api/biblioteca').then(function (r) { return r.json(); }).then(function (idx) {
      var achado = (idx.itens || []).find(function (i) { return i[1] === TITULO; });
      if (!achado) throw new Error('sem ficha');
      estado.fichaId = achado[0];
      return fetch('/api/ficha?id=' + encodeURIComponent(achado[0])).then(function (r) { return r.json(); });
    }).then(function (f) {
      estado.itens = ler(f.corpo || '');
      var nM = estado.itens.filter(function (x) { return x.tipo === 'museu'; }).length;
      var paises = {};
      estado.itens.forEach(function (x) { paises[x.pais] = 1; });
      $('mu-resumo').innerHTML = '<b>' + nM + ' museus</b> e <b>' + (estado.itens.length - nM) + ' fundações e institutos</b>, em ' + Object.keys(paises).length + ' países, por continente.';
      $('mu-nota').innerHTML = 'Lista escrita de memória (07/out/2026): o ano é o da fundação ou da abertura ao público; "—" quer dizer a conferir. Para somar um lugar, escreva uma linha no arquivo do Atlas <a href="biblioteca.html#f=' + encodeURIComponent(estado.fichaId) + '">' + TITULO + '</a>.';
      desenhar();
    }).catch(function () {
      $('mu-lista').innerHTML = '<p class="resposta">Não achei o arquivo "' + TITULO + '" no Atlas (2 Academy › 3 Atlas › 0 Coleções).</p>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
