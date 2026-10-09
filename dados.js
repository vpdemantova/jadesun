/* ============================================================
   OS DADOS DA TERRA — o explorador (09/out/2026, PERFIL.md item 75)
   Um conjunto por vez (os planetas, as constantes, os elementos, o zodíaco, os tempos da Terra, as cidades,
   as estrelas, as revoluções), e as lentes para olhar o mesmo conjunto de jeitos diferentes:
     Tabela (ordena por qualquer coluna) · Cartões · Barras (compara um número) · Escala (a régua de dez em
     dez, para o que vai do minúsculo ao gigante) · Mapa (as cidades) · Céu (as estrelas) · Tábua (os elementos).
   Procurar e filtrar valem para todas as lentes. A estrela de cada linha guarda o item na sua lista; a lista
   vai para o caderno como uma nota com tabela (pelo caderno de notas) ou sai em CSV.
   ?c=conjunto&l=lente abre direto.
   ============================================================ */
(function () {
  'use strict';

  var D = window.DADOS_TERRA, P = window.Perfil;
  var raiz = document.getElementById('dd');
  if (!D || !raiz) return;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function norm(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  function num(v) {
    if (v == null || v === '' || isNaN(v)) return '—';
    var a = Math.abs(v);
    if (a !== 0 && (a >= 1e10 || a < 1e-3)) {
      var e = Math.floor(Math.log10(a)), m = v / Math.pow(10, e);
      return m.toLocaleString('pt-BR', { maximumFractionDigits: 4 }) + ' × 10' + String(e).split('').map(function (c) { return SUP[c] || c; }).join('');
    }
    return Number(v).toLocaleString('pt-BR', { maximumFractionDigits: a < 1 ? 6 : a < 100 ? 3 : 1 });
  }

  /* ---------- os conjuntos que já moram no app (sem cópia): cidades, estrelas, revoluções ---------- */
  function script(src) {
    return new Promise(function (ok, falha) {
      if (document.querySelector('script[src="' + src + '"]')) return ok();
      var s = document.createElement('script'); s.src = src; s.onload = function () { ok(); }; s.onerror = function () { falha(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  var EXTRAS = [
    { id: 'cidades', nome: 'As cidades', sub: 'as 243 maiores do mundo', arquivo: 'terra-dados.js', lentes: ['mapa'],
      montar: function () {
        var T = window.TERRA; if (!T) return null;
        return { fonte: ['Natural Earth (domínio público), lugares povoados 1:110m', 'https://www.naturalearthdata.com/'], nota: 'A população é a da área urbana, segundo o Natural Earth (anos variados).',
          colunas: [{ id: 'nome', nome: 'Cidade', tipo: 'texto' }, { id: 'pais', nome: 'País', tipo: 'categoria' }, { id: 'populacao', nome: 'População', tipo: 'numero', log: true }, { id: 'lat', nome: 'Latitude', tipo: 'numero', unidade: '°' }, { id: 'lon', nome: 'Longitude', tipo: 'numero', unidade: '°' }],
          linhas: T.cidades.map(function (c) { return [c[5], c[6], c[4], c[3], c[2], c[0], c[1]]; }) };
      } },
    { id: 'estrelas', nome: 'As estrelas', sub: 'as que têm nome, no céu de Campinas', arquivo: 'ceu-dados.js', lentes: ['ceu'],
      montar: function () {
        var C = window.CEU_DADOS; if (!C) return null;
        var cor = function (bv) { return bv < 0 ? 'azul' : bv < 0.3 ? 'branco-azulada' : bv < 0.6 ? 'branca' : bv < 0.9 ? 'amarela' : bv < 1.4 ? 'laranja' : 'vermelha'; };
        return { fonte: ['Hipparcos e Bright Star Catalogue (via d3-celestial)', 'https://github.com/ofrohn/d3-celestial'], nota: 'A magnitude é o brilho visto daqui: quanto menor, mais brilhante (Sirius, a mais brilhante da noite, tem −1,4). A cor vem do índice B−V.',
          colunas: [{ id: 'nome', nome: 'Estrela', tipo: 'texto' }, { id: 'mag', nome: 'Magnitude', tipo: 'numero' }, { id: 'cor', nome: 'Cor', tipo: 'categoria' }, { id: 'ra', nome: 'Ascensão reta', tipo: 'numero', unidade: '°' }, { id: 'dec', nome: 'Declinação', tipo: 'numero', unidade: '°' }],
          linhas: C.estrelas.filter(function (e) { return e[4]; }).map(function (e) { return [e[4], e[2], cor(e[3]), e[0], e[1], e[3]]; }) };
      } },
    { id: 'revolucoes', nome: 'As revoluções', sub: 'da formação da Terra à revolução ontológica', arquivo: 'revolucoes-dados.js', lentes: [],
      montar: function () {
        var R = window.REVOLUCOES; if (!R) return null;
        var area = {}; R.areas.forEach(function (a) { area[a[0]] = a[1]; });
        return { fonte: ['A linha das revoluções (Atlas)', 'atlas.html#at-revolucoes'], nota: 'A régua é em anos antes de 2026.',
          colunas: [{ id: 'titulo', nome: 'Revolução', tipo: 'texto' }, { id: 'quando', nome: 'Quando', tipo: 'texto' }, { id: 'atras', nome: 'Anos atrás', tipo: 'numero', log: true }, { id: 'area', nome: 'Área', tipo: 'categoria' }, { id: 'principal', nome: 'Grande virada', tipo: 'categoria' }],
          linhas: R.revolucoes.map(function (r) { return [r.titulo, r.quando, Math.max(1, Math.round(r.atras)), area[r.area] || r.area, r.principal ? 'sim' : 'não']; }) };
      } },
  ];
  var conjuntos = D.conjuntos.map(function (c) { return Object.assign({ lentes: c.id === 'elementos' ? ['tabua'] : [] }, c); }).concat(EXTRAS);
  var LENTES = { tabela: 'Tabela', cartoes: 'Cartões', barras: 'Barras', escala: 'Escala', mapa: 'Mapa', ceu: 'Céu', tabua: 'Tábua periódica' };

  /* ---------- o estado ---------- */
  var q = new URLSearchParams(location.search);
  var est = { c: q.get('c') || 'planetas', l: q.get('l') || '', busca: '', filtro: '', ordem: null, dir: 1, numCol: null, log: true };
  var CHAVE_LISTA = 'dados:lista';
  function lerLista() { try { return JSON.parse(localStorage.getItem(CHAVE_LISTA) || '[]') || []; } catch (e) { return []; } }
  function gravarLista(l) { try { localStorage.setItem(CHAVE_LISTA, JSON.stringify(l)); } catch (e) { /* sem memória */ } }

  function conj() { return conjuntos.filter(function (c) { return c.id === est.c; })[0] || conjuntos[0]; }
  function preparar(c) {
    if (c.linhas) return Promise.resolve(c);
    return script(c.arquivo).then(function () { var m = c.montar(); if (m) Object.assign(c, m); return c; });
  }
  function lentesDe(c) { return ['tabela', 'cartoes'].concat(c.colunas.some(function (k) { return k.tipo === 'numero'; }) ? ['barras', 'escala'] : []).concat(c.lentes || []); }
  function colCat(c) { return c.colunas.filter(function (k) { return k.tipo === 'categoria'; })[0] || null; }
  function idx(c, id) { for (var i = 0; i < c.colunas.length; i++) if (c.colunas[i].id === id) return i; return -1; }
  function chave(c, l) { return c.id === 'elementos' ? l[1] : String(l[0]); }

  function linhasVistas(c) {
    var cat = colCat(c), ic2 = cat ? idx(c, cat.id) : -1, b = norm(est.busca);
    var ls = c.linhas.filter(function (l) {
      if (est.filtro && ic2 >= 0 && String(l[ic2]) !== est.filtro) return false;
      if (b && norm(l.slice(0, c.colunas.length).join(' ')).indexOf(b) < 0) return false;
      return true;
    });
    if (est.ordem != null) {
      var i = idx(c, est.ordem), tipo = c.colunas[i].tipo;
      ls = ls.slice().sort(function (a, bb) {
        var x = a[i], y = bb[i];
        if (x == null) return 1; if (y == null) return -1;
        return (tipo === 'numero' ? x - y : String(x).localeCompare(String(y), 'pt-BR')) * est.dir;
      });
    }
    return ls;
  }

  /* ---------- desenhar ---------- */
  function desenhar() {
    var c = conj();
    raiz.innerHTML = '<p class="dd-carregando">Abrindo: ' + esc(c.nome) + '…</p>';
    preparar(c).then(function () {
      var lentes = lentesDe(c);
      if (lentes.indexOf(est.l) < 0) est.l = (c.lentes && c.lentes[0]) || 'tabela';
      var numericas = c.colunas.filter(function (k) { return k.tipo === 'numero'; });
      if (!est.numCol || idx(c, est.numCol) < 0 || c.colunas[idx(c, est.numCol)].tipo !== 'numero') est.numCol = numericas.length ? (numericas.filter(function (k) { return k.log; })[0] || numericas[0]).id : null;
      var cat = colCat(c), valores = {};
      if (cat) c.linhas.forEach(function (l) { var v = l[idx(c, cat.id)]; if (v != null) valores[v] = (valores[v] || 0) + 1; });
      var vs = Object.keys(valores).sort(function (a, b) { return valores[b] - valores[a]; });
      var lista = lerLista();
      raiz.innerHTML =
        '<nav class="dd-conjuntos" aria-label="Conjuntos">' + conjuntos.map(function (x) {
          return '<button type="button" class="dd-conj' + (x.id === c.id ? ' on' : '') + '" data-dd-c="' + x.id + '" aria-pressed="' + (x.id === c.id) + '"><b>' + esc(x.nome) + '</b><small>' + esc(x.sub) + '</small></button>';
        }).join('') + '</nav>' +
        '<div class="dd-barra">' +
          '<div class="dd-lentes" role="tablist" aria-label="Lentes">' + lentes.map(function (l) { return '<button type="button" role="tab" aria-selected="' + (l === est.l) + '" data-dd-l="' + l + '">' + esc(LENTES[l]) + '</button>'; }).join('') + '</div>' +
          '<label class="dd-busca"><span class="sr">Procurar</span><input type="search" data-dd-busca placeholder="Procurar neste conjunto…" value="' + esc(est.busca) + '"></label>' +
          '<button type="button" class="botao" data-dd-lista>' + ic('livro') + 'A sua lista <b data-dd-n>' + lista.length + '</b></button>' +
        '</div>' +
        (cat ? (vs.length <= 14 ? '<div class="dd-filtros" role="group" aria-label="' + esc(cat.nome) + '"><button type="button" class="chip' + (!est.filtro ? ' on' : '') + '" data-dd-f="">Todos <small>' + c.linhas.length + '</small></button>' + vs.map(function (v) { return '<button type="button" class="chip' + (est.filtro === v ? ' on' : '') + '" data-dd-f="' + esc(v) + '">' + esc(v) + ' <small>' + valores[v] + '</small></button>'; }).join('') + '</div>'
          : '<label class="dd-sel"><span>' + esc(cat.nome) + '</span><select data-dd-fsel><option value="">todos</option>' + vs.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); }).map(function (v) { return '<option' + (est.filtro === v ? ' selected' : '') + ' value="' + esc(v) + '">' + esc(v) + ' (' + valores[v] + ')</option>'; }).join('') + '</select></label>') : '') +
        ((est.l === 'barras' || est.l === 'escala') && numericas.length ? '<div class="dd-opcoes"><label class="dd-sel"><span>Comparar</span><select data-dd-num>' + numericas.map(function (k) { return '<option value="' + k.id + '"' + (k.id === est.numCol ? ' selected' : '') + '>' + esc(k.nome) + (k.unidade ? ' (' + esc(k.unidade) + ')' : '') + '</option>'; }).join('') + '</select></label>' +
          (est.l === 'barras' ? '<label class="dd-check"><input type="checkbox" data-dd-log' + (est.log ? ' checked' : '') + '> régua de dez em dez</label>' : '') + '</div>' : '') +
        '<div class="dd-vista" data-lente="' + est.l + '">' + vista(c) + '</div>' +
        '<p class="dd-fonte">' + (c.fonte ? 'Fonte: ' + (/^https?:/.test(c.fonte[1]) ? '<a href="' + esc(c.fonte[1]) + '" target="_blank" rel="noopener">' + esc(c.fonte[0]) + '</a>' : '<a href="' + esc(c.fonte[1]) + '">' + esc(c.fonte[0]) + '</a>') : '') + (c.nota ? '<br>' + esc(c.nota) : '') + '</p>';
      try { history.replaceState(null, '', location.pathname + '?c=' + c.id + '&l=' + est.l); } catch (e) { /* file: */ }
    }).catch(function () { raiz.innerHTML = '<p class="dd-carregando">Não consegui abrir este conjunto.</p>'; });
  }

  /* rótulos em SVG sem se encostar: cada um ocupa uma caixa; quem esbarra fica só no ponto (o nome aparece ao passar o mouse) */
  function cabe(caixas, x, y, texto, tam) {
    var w = String(texto).length * tam * 0.58 + 4, h = tam + 2, c = [x - 2, y - h, x + w, y + 3];
    if (caixas.some(function (o) { return !(c[2] < o[0] || c[0] > o[2] || c[3] < o[1] || c[1] > o[3]); })) return false;
    caixas.push(c); return true;
  }
  function estrela(c, l) {
    var k = c.id + '|' + chave(c, l), on = lerLista().some(function (x) { return x.k === k; });
    return '<button type="button" class="dd-guardar' + (on ? ' on' : '') + '" data-dd-g="' + esc(k) + '" aria-pressed="' + on + '" title="' + (on ? 'Tirar da sua lista' : 'Guardar na sua lista') + '"><span aria-hidden="true">' + (on ? '★' : '☆') + '</span></button>';
  }
  function celula(k, v) {
    if (k.tipo === 'numero') return num(v);
    return esc(v == null ? '—' : v);
  }

  function vista(c) {
    var ls = linhasVistas(c);
    if (!ls.length) return '<p class="dd-vazio">Nada com essa busca.</p>';
    var n = c.colunas.length;
    if (est.l === 'tabela') {
      return '<div class="dd-tabela-cx"><table class="dd-tabela"><thead><tr><th class="dd-th-g"><span class="sr">Guardar</span></th>' + c.colunas.map(function (k) {
        var on = est.ordem === k.id;
        return '<th' + (k.tipo === 'numero' ? ' class="num"' : '') + ' aria-sort="' + (on ? (est.dir > 0 ? 'ascending' : 'descending') : 'none') + '"><button type="button" data-dd-o="' + k.id + '">' + esc(k.nome) + (k.unidade ? '<small>' + esc(k.unidade) + '</small>' : '') + '<i aria-hidden="true">' + (on ? (est.dir > 0 ? '↑' : '↓') : '') + '</i></button></th>';
      }).join('') + '</tr></thead><tbody>' + ls.map(function (l) {
        return '<tr><td class="dd-td-g">' + estrela(c, l) + '</td>' + c.colunas.map(function (k, i) { return '<td' + (k.tipo === 'numero' ? ' class="num"' : '') + '>' + celula(k, l[i]) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table></div><p class="dd-conta">' + ls.length + ' de ' + c.linhas.length + '</p>';
    }
    if (est.l === 'cartoes') {
      var cat = colCat(c);
      return '<div class="dd-cartoes">' + ls.map(function (l) {
        return '<article class="dd-cartao">' + estrela(c, l) + '<h3>' + esc(c.id === 'elementos' ? l[0] + ' · ' + l[1] + ' · ' + l[2] : l[0]) + '</h3>' +
          (cat ? '<p class="dd-c-cat">' + esc(l[idx(c, cat.id)]) + '</p>' : '') +
          '<dl>' + c.colunas.slice(1).filter(function (k) { return k !== cat && !(c.id === 'elementos' && (k.id === 'simbolo' || k.id === 'nome')); }).slice(0, 5).map(function (k) { var i = idx(c, k.id); return '<div><dt>' + esc(k.nome) + '</dt><dd>' + celula(k, l[i]) + (k.unidade && k.tipo === 'numero' && l[i] != null ? ' <small>' + esc(k.unidade) + '</small>' : '') + '</dd></div>'; }).join('') + '</dl></article>';
      }).join('') + '</div>';
    }
    if (est.l === 'barras' || est.l === 'escala') {
      var i = idx(c, est.numCol), k = c.colunas[i], vals = ls.filter(function (l) { return l[i] != null && !isNaN(l[i]); });
      if (!vals.length) return '<p class="dd-vazio">Sem números nesta coluna.</p>';
      var usaLog = (est.l === 'escala' || est.log) && vals.every(function (l) { return l[i] > 0; });
      var f = function (v) { return usaLog ? Math.log10(v) : v; };
      var mn = Math.min.apply(null, vals.map(function (l) { return f(l[i]); })), mx = Math.max.apply(null, vals.map(function (l) { return f(l[i]); }));
      if (est.l === 'barras') {
        var base = usaLog ? Math.min(mn, Math.floor(mn)) : Math.min(0, mn), alcance = (mx - base) || 1;
        var ord = vals.slice().sort(function (a, b) { return b[i] - a[i]; });
        return '<ol class="dd-barras">' + ord.map(function (l) {
          var w = Math.max(0.5, (f(l[i]) - base) / alcance * 100);
          return '<li><span class="dd-b-nome">' + esc(c.id === 'elementos' ? l[1] + ' ' + l[2] : l[0]) + '</span><span class="dd-b-trilho"><i style="width:' + w.toFixed(2) + '%"></i></span><span class="dd-b-v">' + num(l[i]) + (k.unidade ? ' <small>' + esc(k.unidade) + '</small>' : '') + '</span></li>';
        }).join('') + '</ol>' + (usaLog ? '<p class="dd-conta">Régua de dez em dez: cada passo da barra é dez vezes mais.</p>' : '');
      }
      /* a escala: cada item no seu lugar numa régua; os rótulos em faixas, sem se encostar */
      var W = 1000, alc = (mx - mn) || 1, faixas = [[], [], [], [], [], []];
      var pts = vals.slice().sort(function (a, b) { return f(a[i]) - f(b[i]); }).map(function (l) {
        var x = 30 + (f(l[i]) - mn) / alc * (W - 60), nome = c.id === 'elementos' ? l[1] : String(l[0]), larg = nome.length * 7 + 14, fx = -1;
        var ini = x + larg + 10 > W ? x - larg : x, fim = x + larg + 10 > W ? x : x + larg;
        for (var a = 0; a < faixas.length && fx < 0; a++) if (faixas[a].every(function (o) { return fim < o[0] || ini > o[1]; })) fx = a;
        if (fx >= 0) faixas[fx].push([ini, fim]);
        return { l: l, x: x, fx: fx, nome: nome };
      });
      var tiques = '';
      if (usaLog) for (var e = Math.ceil(mn); e <= Math.floor(mx); e++) { var tx = 30 + (e - mn) / alc * (W - 60); tiques += '<g class="dd-e-t"><line x1="' + tx.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y1="20" y2="250"/><text x="' + tx.toFixed(1) + '" y="272" text-anchor="middle">' + num(Math.pow(10, e)) + '</text></g>'; }
      return '<div class="dd-escala-cx"><svg class="dd-escala" viewBox="0 0 ' + W + ' 284" role="img" aria-label="' + esc(k.nome) + ' de cada um, numa régua">' + tiques +
        '<line class="dd-e-eixo" x1="20" x2="' + (W - 20) + '" y1="250" y2="250"/>' +
        pts.map(function (p) {
          var y = p.fx < 0 ? 0 : 230 - p.fx * 34;
          return '<g class="dd-e-p"><title>' + esc(p.nome + ': ' + num(p.l[i]) + (k.unidade ? ' ' + k.unidade : '')) + '</title><line x1="' + p.x.toFixed(1) + '" x2="' + p.x.toFixed(1) + '" y1="250" y2="' + (p.fx < 0 ? 244 : y + 4) + '"/><circle cx="' + p.x.toFixed(1) + '" cy="250" r="4.5"/>' +
            (p.fx >= 0 ? (p.x + p.nome.length * 7 + 10 > W ? '<text x="' + (p.x - 5).toFixed(1) + '" y="' + y + '" text-anchor="end">' : '<text x="' + (p.x + 5).toFixed(1) + '" y="' + y + '">') + esc(p.nome) + '</text>' : '') + '</g>';
        }).join('') + '</svg></div><p class="dd-conta">' + esc(k.nome) + (k.unidade ? ' (' + esc(k.unidade) + ')' : '') + (usaLog ? ', numa régua de dez em dez.' : '.') + ' Passe o dedo ou o mouse para ver cada valor.</p>';
    }
    if (est.l === 'mapa' && window.TERRA) {
      var T = window.TERRA, maxp = Math.max.apply(null, ls.map(function (l) { return l[2] || 0; })) || 1;
      var ordC = ls.slice().sort(function (a, b) { return (b[2] || 0) - (a[2] || 0); }), caixasM = [], nomes = 0;
      return '<div class="dd-mapa-cx"><svg class="dd-mapa" viewBox="0 0 ' + T.w + ' ' + T.h + '" role="img" aria-label="As cidades no mapa"><path class="dd-terra" d="' + T.terra + '"/>' +
        ordC.map(function (l, k2) { var r = 2 + Math.sqrt((l[2] || 0) / maxp) * 14; return '<circle cx="' + l[5] + '" cy="' + l[6] + '" r="' + r.toFixed(1) + '"><title>' + esc(l[0] + ', ' + l[1] + ': ' + num(l[2]) + ' habitantes') + '</title></circle>' + (k2 < 24 && nomes < 14 && cabe(caixasM, l[5] + r + 2, l[6] + 4, l[0], 9) && ++nomes ? '<text x="' + (l[5] + r + 2).toFixed(1) + '" y="' + (l[6] + 4).toFixed(1) + '">' + esc(l[0]) + '</text>' : ''); }).join('') +
        '</svg></div><p class="dd-conta">O tamanho do círculo é a população; as maiores levam o nome (as outras, ao passar o mouse).</p>';
    }
    if (est.l === 'ceu') {
      var WW = 1000, HH = 500, caixasC = [];
      return '<div class="dd-ceu-cx"><svg class="dd-ceu" viewBox="0 0 ' + WW + ' ' + HH + '" role="img" aria-label="As estrelas com nome, no céu">' +
        '<line class="dd-ceu-eq" x1="0" x2="' + WW + '" y1="' + HH / 2 + '" y2="' + HH / 2 + '"/>' +
        ls.map(function (l) {
          var x = WW - (l[3] / 360) * WW, y = HH / 2 - (l[4] / 90) * (HH / 2), r = Math.max(1.2, 5.5 - l[1] * 1.1), bv = l[5] || 0.6;
          var cor = bv < 0 ? '#9DB7FF' : bv < 0.3 ? '#CFDBFF' : bv < 0.6 ? '#FFFFFF' : bv < 0.9 ? '#FFF1C8' : bv < 1.4 ? '#FFD39A' : '#FFB07A';
          return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + cor + '"><title>' + esc(l[0] + ' · magnitude ' + num(l[1])) + '</title></circle>' + (l[1] < 1.3 && cabe(caixasC, x + r + 3, y + 4, l[0], 10) ? '<text x="' + (x + r + 3).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '">' + esc(l[0]) + '</text>' : '');
        }).join('') + '</svg></div><p class="dd-conta">O céu inteiro aberto como um mapa: a linha do meio é o equador celeste; acima, o céu do norte; abaixo, o do sul. O tamanho é o brilho.</p>';
    }
    if (est.l === 'tabua') {
      var vis = {}; ls.forEach(function (l) { vis[l[0]] = true; });
      var CORES = { 'metal alcalino': '#E07A5F', 'metal alcalinoterroso': '#F2B05E', 'metal de transição': '#C9A227', 'lantanídeo': '#C2417A', 'actinídeo': '#9B5DE5', 'metal pós-transição': '#7FA03A', 'semimetal': '#2E9E66', 'não metal': '#2F7FD0', 'halogênio': '#00A6A6', 'gás nobre': '#5B7FA6' };
      var lan = 0, act = 0;
      return '<div class="dd-tabua-cx"><div class="dd-tabua">' + c.linhas.map(function (l) {
        var col = l[4], lin = l[5];
        if (col == null) { if (l[6] === 'lantanídeo') { col = 3 + lan++; lin = 9; } else { col = 3 + act++; lin = 10; } }
        return '<button type="button" class="dd-el' + (vis[l[0]] ? '' : ' fora') + '" style="grid-column:' + col + ';grid-row:' + lin + ';--c:' + (CORES[l[6]] || '#888') + '" data-dd-el="' + l[0] + '" title="' + esc(l[2] + ' · ' + l[6] + ' · ' + l[7]) + '"><small>' + l[0] + '</small><b>' + esc(l[1]) + '</b><span>' + esc(l[2]) + '</span></button>';
      }).join('') + '<p class="dd-tabua-lan" style="grid-column:3;grid-row:6">57–71</p><p class="dd-tabua-lan" style="grid-column:3;grid-row:7">89–103</p><p class="dd-tabua-lan" style="grid-column:1/3;grid-row:9">lantanídeos</p><p class="dd-tabua-lan" style="grid-column:1/3;grid-row:10">actinídeos</p></div></div>' +
        '<ul class="dd-legenda">' + Object.keys(CORES).map(function (k2) { return '<li style="--c:' + CORES[k2] + '"><i></i>' + esc(k2) + '</li>'; }).join('') + '</ul>';
    }
    return '';
  }

  /* ---------- a sua lista ---------- */
  function abrirLista() {
    var lista = lerLista();
    var porConj = {}; lista.forEach(function (x) { (porConj[x.c] = porConj[x.c] || []).push(x); });
    var html = lista.length ? Object.keys(porConj).map(function (cid) {
      var c = conjuntos.filter(function (x) { return x.id === cid; })[0];
      return '<h3 class="dd-l-t">' + esc(c ? c.nome : cid) + '</h3><ul class="dd-l">' + porConj[cid].map(function (x) { return '<li><span>' + esc(x.r) + '</span><button type="button" class="ic" data-dd-tirar="' + esc(x.k) + '" aria-label="Tirar">' + ic('fechar') + '</button></li>'; }).join('') + '</ul>';
    }).join('') : '<p class="dd-vazio">Toque na ☆ de qualquer linha para guardar aqui.</p>';
    var f = P.folha({ titulo: 'A sua lista', sub: lista.length + (lista.length === 1 ? ' item guardado' : ' itens guardados') + ' · fica neste navegador', html:
      '<div class="dd-lista">' + html + (lista.length ? '<div class="dd-l-acoes">' + (window.JADESUN_ESTATICO ? '' : '<button type="button" class="botao pri" data-dd-caderno>' + ic('nota') + 'Guardar no caderno</button>') + '<button type="button" class="botao" data-dd-csv>' + ic('baixar') + 'Baixar CSV</button><button type="button" class="botao leve" data-dd-limpar>Limpar</button></div>' : '') + '</div>',
      aoAbrir: function (corpo, api) {
        corpo.addEventListener('click', function (ev) {
          var t = ev.target.closest('[data-dd-tirar]'); if (t) { gravarLista(lerLista().filter(function (x) { return x.k !== t.dataset.ddTirar; })); api.fechar(true); abrirLista(); pintarContador(); desenharVista(); return; }
          if (ev.target.closest('[data-dd-limpar]')) { gravarLista([]); api.fechar(); pintarContador(); desenharVista(); return; }
          if (ev.target.closest('[data-dd-csv]')) { baixarCSV(); return; }
          var cad = ev.target.closest('[data-dd-caderno]'); if (cad) levarAoCaderno(cad);
        });
      } });
    return f;
  }
  function linhasDaLista() {
    var lista = lerLista(), out = [];
    return Promise.all(conjuntos.filter(function (c) { return lista.some(function (x) { return x.c === c.id; }); }).map(preparar)).then(function () {
      conjuntos.forEach(function (c) {
        var ks = lista.filter(function (x) { return x.c === c.id; }).map(function (x) { return x.k.slice(c.id.length + 1); });
        if (!ks.length || !c.linhas) return;
        out.push({ c: c, linhas: c.linhas.filter(function (l) { return ks.indexOf(chave(c, l)) >= 0; }) });
      });
      return out;
    });
  }
  function levarAoCaderno(bt) {
    bt.disabled = true;
    linhasDaLista().then(function (grupos) {
      var hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      var md = '# A minha lista de dados\n\nGuardada em ' + hoje + ', nos Dados da Terra do Portal Solar.\n';
      grupos.forEach(function (g) {
        var cs = g.c.colunas;
        md += '\n## ' + g.c.nome + '\n\n| ' + cs.map(function (k) { return k.nome + (k.unidade ? ' (' + k.unidade + ')' : ''); }).join(' | ') + ' |\n|' + cs.map(function () { return ' --- '; }).join('|') + '|\n';
        g.linhas.forEach(function (l) { md += '| ' + cs.map(function (k, i) { return String(k.tipo === 'numero' ? num(l[i]) : (l[i] == null ? '—' : l[i])).replace(/\|/g, '/'); }).join(' | ') + ' |\n'; });
        if (g.c.fonte) md += '\nFonte: [' + g.c.fonte[0] + '](' + g.c.fonte[1] + ')\n';
      });
      return fetch('/api/notas/gravar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ texto: md }) }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não gravou.'); return j; }); })
        .then(function (j) { return fetch('/api/notas/mover', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ rel: j.rel, nome: 'Lista de dados ' + new Date().toISOString().slice(0, 10) }) }).then(function (r) { return r.json(); }); });
    }).then(function (j) { bt.disabled = false; avisar('No caderno: ' + (j.rel || 'na Entrada') + '. Abra pelo caderno de notas.'); })
      .catch(function (e) { bt.disabled = false; avisar(e.message || 'Não consegui guardar no caderno (o servidor está ligado?).'); });
  }
  function baixarCSV() {
    linhasDaLista().then(function (grupos) {
      var csv = grupos.map(function (g) { return [g.c.nome].concat([g.c.colunas.map(function (k) { return k.nome; }).join(';')], g.linhas.map(function (l) { return g.c.colunas.map(function (k, i) { return '"' + String(l[i] == null ? '' : l[i]).replace(/"/g, '""') + '"'; }).join(';'); })).join('\n'); }).join('\n\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'dados-da-terra.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
  }
  function avisar(t) { var a = document.createElement('div'); a.className = 'dm2-aviso on'; a.setAttribute('role', 'status'); a.innerHTML = '<span>' + esc(t) + '</span>'; document.body.appendChild(a); setTimeout(function () { a.remove(); }, 4200); }
  function pintarContador() { var n = raiz.querySelector('[data-dd-n]'); if (n) n.textContent = lerLista().length; }
  function desenharVista() { var v = raiz.querySelector('.dd-vista'); if (v) v.innerHTML = vista(conj()); }

  /* ---------- cliques e campos ---------- */
  raiz.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-dd-c]'); if (b) { est.c = b.dataset.ddC; est.l = ''; est.filtro = ''; est.busca = ''; est.ordem = null; desenhar(); return; }
    var l = ev.target.closest('[data-dd-l]'); if (l) { est.l = l.dataset.ddL; desenhar(); return; }
    var f = ev.target.closest('[data-dd-f]'); if (f) { est.filtro = f.dataset.ddF; desenhar(); return; }
    var o = ev.target.closest('[data-dd-o]'); if (o) { if (est.ordem === o.dataset.ddO) est.dir = -est.dir; else { est.ordem = o.dataset.ddO; est.dir = conj().colunas[idx(conj(), est.ordem)].tipo === 'numero' ? -1 : 1; } desenharVista(); return; }
    var g = ev.target.closest('[data-dd-g]');
    if (g) {
      var k = g.dataset.ddG, lista = lerLista(), c = conj();
      if (lista.some(function (x) { return x.k === k; })) lista = lista.filter(function (x) { return x.k !== k; });
      else { var linha = c.linhas.filter(function (x) { return c.id + '|' + chave(c, x) === k; })[0]; lista.push({ k: k, c: c.id, r: c.id === 'elementos' ? linha[2] + ' (' + linha[1] + ')' : String(linha[0]) }); }
      gravarLista(lista); pintarContador();
      var on = lista.some(function (x) { return x.k === k; });
      raiz.querySelectorAll('[data-dd-g="' + k.replace(/"/g, '\\"') + '"]').forEach(function (x) { x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); x.innerHTML = '<span aria-hidden="true">' + (on ? '★' : '☆') + '</span>'; });
      return;
    }
    if (ev.target.closest('[data-dd-lista]')) { abrirLista(); return; }
    var el = ev.target.closest('[data-dd-el]');
    if (el) {
      var c2 = conj(), lin = c2.linhas.filter(function (x) { return String(x[0]) === el.dataset.ddEl; })[0]; if (!lin) return;
      P.folha({ titulo: esc(lin[2]) + ' (' + esc(lin[1]) + ')', sub: 'Elemento ' + lin[0] + ' · ' + esc(lin[6]), html: '<div class="dd-el-folha"><dl>' + c2.colunas.map(function (k, i) { return '<div><dt>' + esc(k.nome) + '</dt><dd>' + celula(k, lin[i]) + (k.unidade && lin[i] != null ? ' ' + esc(k.unidade) : '') + (k.id === 'massa' && lin[8] ? ' <small>(isótopo mais estável)</small>' : '') + '</dd></div>'; }).join('') + '</dl>' +
        '<p>' + estrela(c2, lin) + ' <a class="botao" href="biblioteca.html#q=' + encodeURIComponent(lin[2]) + '">' + ic('buscar') + 'Procurar nas fichas</a></p></div>' });
    }
  });
  raiz.addEventListener('input', function (ev) {
    if (ev.target.matches('[data-dd-busca]')) { est.busca = ev.target.value; desenharVista(); }
  });
  raiz.addEventListener('change', function (ev) {
    if (ev.target.matches('[data-dd-fsel]')) { est.filtro = ev.target.value; desenhar(); }
    if (ev.target.matches('[data-dd-num]')) { est.numCol = ev.target.value; desenharVista(); }
    if (ev.target.matches('[data-dd-log]')) { est.log = ev.target.checked; desenharVista(); }
  });
  document.addEventListener('click', function (ev) {
    var g = ev.target.closest('.folha [data-dd-g]'); if (!g) return;
    var k = g.dataset.ddG, lista = lerLista(), c = conj();
    if (lista.some(function (x) { return x.k === k; })) lista = lista.filter(function (x) { return x.k !== k; });
    else { var linha = c.linhas.filter(function (x) { return c.id + '|' + chave(c, x) === k; })[0]; if (linha) lista.push({ k: k, c: c.id, r: c.id === 'elementos' ? linha[2] + ' (' + linha[1] + ')' : String(linha[0]) }); }
    gravarLista(lista); pintarContador(); var on = lista.some(function (x) { return x.k === k; }); g.classList.toggle('on', on); g.innerHTML = '<span aria-hidden="true">' + (on ? '★' : '☆') + '</span>';
  });

  desenhar();
})();
