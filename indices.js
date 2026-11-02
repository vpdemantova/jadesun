/* ============================================================
   Portal Solar · indices.js — o índice dos índices (PS-85, 02/nov/2026).

   De onde veio: o pedido dele em 31/out/2026, "preciso que o portal solar seja o indice dos indices".
   Cada índice do Portal é um volume da estante: o número, o que tem (as contas), as partes, quando
   mudou e de onde vem. A busca é uma só e procura em todos ao mesmo tempo, como as etiquetas do
   Catálogo: cada volume diz quantos trazem a palavra e mostra os primeiros; os que não trazem nada
   descem para o fim. O nome do volume, durante a busca, abre o índice com a mesma busca, quando ele
   sabe buscar (Fichas, Quando, Ferramentas, Museus).

   Os dados vêm de /api/indices (lib/indices.mjs; no site exportado, api/indices.json, só o público);
   as fichas, da busca da Biblioteca (/api/buscar). O endereço guarda a busca (#q=…).

   Para onde vai: indices.html (Fichas › Os índices). Um índice novo no Portal é um volume novo no
   lib/indices.mjs; esta folha não muda.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var CHAVE_ORDEM = 'portal-indices-ordem';
  var ORDENS = [['portal', 'Do Portal'], ['mudou', 'Mais recentes'], ['maior', 'Maiores']];
  /* no celular não há a tecla /: a busca só diz o que faz */
  var TOQUE = !!(window.matchMedia && matchMedia('(hover: none), (max-width: 720px)').matches);
  var MOSTRA = 4, MAXIMO = 60;
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  function norm(s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento: só não lembra */ } }
  function num(n) { return Number(n || 0).toLocaleString('pt-BR'); }
  function plural(c) { return c[0] === 1 ? c[1] : c[2]; }

  /* "mudou hoje", "ontem", "há 3 dias", "em 22 de setembro" */
  function quando(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var zero = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var dias = Math.round((zero(new Date()) - zero(d)) / 864e5);
    if (dias <= 0) return 'mudou hoje';
    if (dias === 1) return 'mudou ontem';
    if (dias < 7) return 'mudou há ' + dias + ' dias';
    return 'mudou em ' + (d.getDate() === 1 ? '1º' : d.getDate()) + ' de ' + MESES[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' de ' + d.getFullYear() : '');
  }

  var raiz = $('ix');
  if (!raiz) return;
  var est = { vols: [], itens: [], q: '', ordem: 'portal', fichas: null, fichasQ: '', abertos: {} };
  var guardada = ler(CHAVE_ORDEM);
  if (ORDENS.some(function (o) { return o[0] === guardada; })) est.ordem = guardada;

  /* ---------- o esqueleto ---------- */
  raiz.innerHTML =
    '<section class="ix-barra" aria-label="Busca">' +
      '<input type="search" class="ix-busca" id="ix-busca" autocomplete="off" placeholder="Buscar em todos os índices' + (TOQUE ? '' : ' (tecla /)') + '" aria-label="Buscar em todos os índices">' +
      '<div class="ix-ordem" role="group" aria-label="Ordem dos índices">' + ORDENS.map(function (o) {
        return '<button type="button" data-ordem="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div>' +
    '</section>' +
    '<div class="ix-estado" id="ix-estado" aria-live="polite"></div>' +
    '<ol class="ix-vols" id="ix-vols"><li class="ix-lendo">Lendo os índices…</li></ol>';

  /* ---------- a busca ---------- */
  function palavras() { return norm(est.q).split(' ').filter(function (t) { return t.length >= 2; }); }
  function achar(ts) {
    var por = {};
    est.itens.forEach(function (it) {
      for (var i = 0; i < ts.length; i++) if (it._b.indexOf(ts[i]) < 0) return;
      var t = it._t, p = 0;
      ts.forEach(function (w) { p += t.indexOf(w) === 0 ? 30 : (' ' + t).indexOf(' ' + w) >= 0 ? 20 : t.indexOf(w) >= 0 ? 10 : 0; });
      if (t === ts.join(' ')) p += 60;
      (por[it[0]] = por[it[0]] || []).push({ p: p, it: it });
    });
    Object.keys(por).forEach(function (k) {
      por[k].sort(function (a, b) { return b.p - a.p || (b.it[5] || 0) - (a.it[5] || 0) || a.it[1].localeCompare(b.it[1], 'pt-BR'); });
      por[k] = por[k].map(function (x) { return x.it; });
    });
    return por;
  }
  /* as fichas: a busca da Biblioteca (no site exportado, o estatico.js responde) */
  var espera = null;
  function buscarFichas(q) {
    clearTimeout(espera);
    if (palavras().length === 0) { est.fichas = null; est.fichasQ = ''; return; }
    espera = setTimeout(function () {
      fetch('/api/buscar?q=' + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (lista) {
        if (q !== est.q) return;
        est.fichasQ = q;
        est.fichas = (Array.isArray(lista) ? lista : []).map(function (f) { return ['fichas', f.titulo, f.secao || '', 'biblioteca.html#f=' + encodeURI(f.id)]; });
        desenhar();
      }).catch(function () { if (q === est.q) { est.fichasQ = q; est.fichas = []; desenhar(); } });
    }, 220);
  }

  /* ---------- desenhar ---------- */
  function ordenados() {
    var l = est.vols.slice();
    if (est.ordem === 'mudou') l.sort(function (a, b) { return String(b.mudou || '').localeCompare(String(a.mudou || '')) || a._n - b._n; });
    else if (est.ordem === 'maior') l.sort(function (a, b) { return (b.contas[0] ? b.contas[0][0] : 0) - (a.contas[0] ? a.contas[0][0] : 0) || a._n - b._n; });
    return l;
  }
  function contas(v) {
    var c = v.contas.filter(function (x, i) { return i === 0 || x[0] > 0; });
    if (!c.length) return '';
    return '<p class="ix-v-conta"><b>' + num(c[0][0]) + '</b> ' + esc(plural(c[0])) +
      (c.length > 1 ? '<span> · ' + c.slice(1).map(function (x) { return num(x[0]) + ' ' + esc(plural(x)); }).join(' · ') + '</span>' : '') + '</p>';
  }
  function partes(v) {
    if (!v.partes || !v.partes.length) return '';
    var max = 6, l = v.partes.slice(0, max).map(esc).join(' · ');
    return '<p class="ix-v-partes">' + l + (v.partes.length > max ? ' · <span>e mais ' + (v.partes.length - max) + '</span>' : '') + '</p>';
  }
  /* uma ação só por volume: o índice que sabe buscar recebe a busca ("Ver os 12 em Ferramentas");
     o que não sabe abre a lista aqui mesmo ("Mostrar mais 8") */
  function achadosDe(v, lista, q) {
    var n = lista.length, aberto = !v.busca && est.abertos[v.id];
    var mais40 = v.id === 'fichas' && n >= 40;
    var mostra = lista.slice(0, aberto ? MAXIMO : MOSTRA);
    var acao = '';
    if (n > MOSTRA && v.busca) acao = '<a class="ix-la" href="' + esc(v.busca.replace('{q}', encodeURIComponent(q))) + '">Ver ' + (mais40 ? 'todas' : 'os ' + num(n)) + ' em ' + esc(v.nome) + ' →</a>';
    else if (n > MOSTRA) acao = '<button type="button" class="ix-mais" data-mais="' + esc(v.id) + '" aria-expanded="' + !!aberto + '">' + (aberto ? 'Mostrar menos' : 'Mostrar mais ' + num(Math.min(n, MAXIMO) - MOSTRA)) + '</button>';
    return '<div class="ix-v-achados">' +
      '<p class="ix-v-n"><b>' + num(n) + (mais40 ? '+' : '') + '</b> com “' + esc(q) + '”</p>' +
      '<ol>' + mostra.map(function (it) {
        return '<li><a href="' + esc(it[3]) + '"><span class="ix-a-t">' + esc(it[1]) + '</span>' + (it[2] ? '<span class="ix-a-s">' + esc(it[2]) + '</span>' : '') + '</a></li>';
      }).join('') + '</ol>' + acao +
    '</div>';
  }
  function volume(v, achados, q) {
    var buscando = !!achados;
    var href = buscando && v.busca ? v.busca.replace('{q}', encodeURIComponent(q)) : v.href;
    var sobre = '<p class="ix-v-sobre"><span>vol. ' + (v._n < 10 ? '0' : '') + v._n + (v.casa ? ' · só no seu computador' : '') + '</span><span>' + esc(quando(v.mudou)) + '</span></p>';
    var nome = '<h2 class="ix-v-nome"><a href="' + esc(href) + '"' + (v.indice ? ' data-ix-indice="1"' : '') + (buscando && v.busca ? ' title="Abrir ' + esc(v.nome) + ' com esta busca"' : '') + '>' + esc(v.nome) + '</a></h2>';
    if (buscando && !achados.length) {
      return '<li class="ix-vol ix-vazio" data-v="' + esc(v.id) + '">' + sobre + nome + '<p class="ix-v-n">nada com “' + esc(q) + '”</p></li>';
    }
    return '<li class="ix-vol" data-v="' + esc(v.id) + '">' + sobre + nome + contas(v) +
      '<p class="ix-v-desc">' + esc(v.desc) + '</p>' +
      (buscando ? achadosDe(v, achados, q) : partes(v)) +
      '<p class="ix-v-fonte">De onde vem: ' + esc(v.fonte) + '</p></li>';
  }

  function desenhar() {
    var ts = palavras(), q = est.q.trim();
    var por = ts.length ? achar(ts) : null;
    if (por) por.fichas = est.fichasQ === est.q ? est.fichas || [] : null;
    var lista = ordenados();
    var html;
    if (!por) {
      html = lista.map(function (v) { return volume(v, null, q); }).join('');
      var novo = est.vols.slice().sort(function (a, b) { return String(b.mudou || '').localeCompare(String(a.mudou || '')); })[0];
      $('ix-estado').innerHTML = '<span class="ix-conta"><b>' + est.vols.length + '</b> índices</span>' +
        (novo && novo.mudou ? '<span class="ix-novo">O último a mudar: <a href="' + esc(novo.href) + '">' + esc(novo.nome) + '</a>, ' + esc(quando(novo.mudou).replace(/^mudou /, '')) + '.</span>' : '');
    } else {
      /* os que trazem algo primeiro (na ordem escolhida); os vazios descem; as fichas, enquanto não chegam, ficam no lugar */
      var cheios = [], vazios = [], total = 0, com = 0;
      lista.forEach(function (v) {
        var a = por[v.id];
        if (a === null && v.id === 'fichas') { cheios.push('<li class="ix-vol" data-v="fichas"><p class="ix-v-sobre"><span>vol. ' + (v._n < 10 ? '0' : '') + v._n + '</span></p><h2 class="ix-v-nome"><a href="' + esc(v.busca.replace('{q}', encodeURIComponent(q))) + '">' + esc(v.nome) + '</a></h2><p class="ix-v-n">procurando nas fichas…</p></li>'); return; }
        a = a || [];
        total += a.length; if (a.length) com += 1;
        (a.length ? cheios : vazios).push(volume(v, a, q));
      });
      html = cheios.join('') + vazios.join('');
      $('ix-estado').innerHTML = '<span class="ix-conta"><b>' + num(total) + '</b> ' + (total === 1 ? 'achado' : 'achados') + ' com “' + esc(q) + '”, em ' + com + ' dos ' + est.vols.length + ' índices</span>' +
        '<button type="button" class="ix-link" id="ix-limpar">Limpar a busca</button>';
    }
    $('ix-vols').innerHTML = html;
    $('ix-vols').classList.toggle('ix-buscando', !!por);
    escreverEndereco();
  }

  /* ---------- o endereço guarda a busca ---------- */
  function escreverEndereco() {
    var q = est.q.trim();
    try { history.replaceState(null, '', location.pathname + location.search + (q ? '#q=' + encodeURIComponent(q) : '')); } catch (e) { /* aberto do disco */ }
  }
  function lerEndereco() {
    var m = location.hash.match(/[#&]q=([^&]*)/);
    try { est.q = m ? decodeURIComponent(m[1]) : ''; } catch (e) { est.q = ''; }
    $('ix-busca').value = est.q;
  }

  /* ---------- os toques ---------- */
  function mudouBusca(v) { est.q = v; est.abertos = {}; buscarFichas(est.q); desenhar(); }
  $('ix-busca').addEventListener('input', function (e) { mudouBusca(e.target.value); });
  $('ix-busca').addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && est.q) { e.preventDefault(); e.target.value = ''; mudouBusca(''); }
  });
  raiz.querySelector('.ix-ordem').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-ordem]');
    if (!b) return;
    est.ordem = b.getAttribute('data-ordem');
    gravar(CHAVE_ORDEM, est.ordem);
    pintarOrdem();
    desenhar();
  });
  function pintarOrdem() {
    Array.prototype.forEach.call(raiz.querySelectorAll('.ix-ordem button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ordem') === est.ordem)); });
  }
  raiz.addEventListener('click', function (e) {
    var m = e.target.closest('[data-mais]');
    if (m) {
      var id = m.getAttribute('data-mais');
      est.abertos[id] = !est.abertos[id];
      desenhar();
      var de = raiz.querySelector('[data-mais="' + id + '"]');
      if (de) de.focus({ preventScroll: true });
      return;
    }
    if (e.target.closest('#ix-limpar')) { $('ix-busca').value = ''; mudouBusca(''); $('ix-busca').focus(); return; }
    /* "As páginas" abre o Índice (o Quadrado), quando não se está buscando */
    var ind = e.target.closest('[data-ix-indice]');
    if (ind && !est.q.trim() && window.Perfil && window.Perfil.abrirIndice) { e.preventDefault(); window.Perfil.abrirIndice(ind); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault();
    $('ix-busca').focus();
  });
  window.addEventListener('hashchange', function () {
    var antes = est.q;
    lerEndereco();
    if (est.q !== antes) { est.abertos = {}; buscarFichas(est.q); desenhar(); }
  });

  /* ---------- os dados ---------- */
  pintarOrdem();
  fetch('/api/indices').then(function (r) { if (!r.ok) throw new Error('sem índices'); return r.json(); }).then(function (d) {
    est.vols = (d.volumes || []).map(function (v, i) { v._n = i + 1; return v; });
    est.itens = (d.itens || []).map(function (it) { it._t = norm(it[1]); it._b = it._t + ' ' + norm(it[2]) + ' ' + (it[4] || ''); return it; });
    var por = {}; est.vols.forEach(function (v) { por[v.id] = v; });
    var c = function (id) { return por[id] && por[id].contas[0] ? num(por[id].contas[0][0]) + ' ' + plural(por[id].contas[0]) : ''; };
    var nomes = ['fichas', 'teia', 'ferramentas', 'distribuir'].map(c).filter(Boolean);
    $('ix-resumo').innerHTML = 'Tudo o que o Portal Solar guarda, índice por índice: ' + esc(nomes.slice(0, -1).join(', ')) + (nomes.length > 1 ? ' e ' : '') + esc(nomes[nomes.length - 1] || '') +
      ', e mais. Cada um diz o que tem e quando mudou; a busca procura em todos de uma vez.';
    $('ix-nota').innerHTML = 'Os números são contados do caderno e dos dados de cada página' + (d.publico ? ', no dia em que este site foi gerado' : ', agora') +
      '. "Mudou" é a data da última mudança guardada da fonte de cada índice. Para somar um índice novo ao Portal, ele entra como um volume em <code>lib/indices.mjs</code>.';
    lerEndereco();
    if (est.q.trim()) buscarFichas(est.q);
    desenhar();
  }).catch(function () {
    $('ix-vols').innerHTML = '<li class="ix-lendo">Não consegui ler os índices. No computador, abra o <b>hoje.bat</b> para ligar o servidor.</li>';
  });
})();
