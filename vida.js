/* ============================================================
   A VIDA (22/out/2026, registro 116) — o atlas digital dos seres vivos
   "quero o atlas mais parecido com um atlas digital, todas as espécies de animais, todos os
   reinos… todas as plantas, as formações delas, filtros de cada categoria e parte, divisões,
   formações, origens, geometrias, tipos de folha, galhos, tipo de penugens, etc!"

   · A árvore: dos domínios às ordens, do Catalogue of Life (vida-arvore.js), nas lentes lista,
     grade, mapa (a área de cada retângulo é o número de espécies) e corrido. Tocar desce; o nome
     abre a ficha do grupo, com as espécies ao vivo, do próprio catálogo, e as imagens do Commons.
   · Os traços filtram a árvore (vida-dados.js): os grupos com o traço acendem, e os ramos que
     levam até eles também.
   · A busca: pelo nome científico (no catálogo) e pelo nome popular (no Wikidata).
   · As formas: folhas, galhos e formas de vida, penas, corpos e geometrias, cada uma desenhada
     aqui mesmo, com filtro por parte.
   · As origens: quando cada grande grupo aparece, numa régua de tempo em escala logarítmica.
   Sem internet, fica tudo menos as espécies ao vivo e as imagens.
   ============================================================ */
(function () {
  'use strict';
  var A = window.VIDA_ARVORE, V = window.VIDA, P = window.Perfil || {};
  var raiz = document.getElementById('vd');
  if (!raiz) return;
  if (!A || !V) { raiz.innerHTML = '<p class="rot">Não consegui abrir a árvore.</p>'; return; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var n = function (v) { return Number(v || 0).toLocaleString('pt-BR'); };
  var CALMO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL = 'https://api.checklistbank.org/dataset/3LR';
  var CAT = { d: 'domínio', r: 'reino', f: 'filo', c: 'classe', o: 'ordem', raiz: '' };
  var CATP = { d: 'domínios', r: 'reinos', f: 'filos', c: 'classes', o: 'ordens' };
  var PT_TOPO = { Eukaryota: 'Eucariontes', Bacteria: 'Bactérias', Archaea: 'Arqueias', Viruses: 'Vírus' };
  V.reinos.forEach(function (r) { PT_TOPO[r[0]] = r[1]; });

  /* ---------- a árvore: o índice ---------- */
  var porId = {}, pai = {}, porNome = {};
  var somaV = 0, somaT = 0;
  A.arvore.forEach(function (d) { somaV += d[3]; somaT += d[4]; });
  var RAIZ = ['raiz', 'A vida', 'raiz', somaV, somaT, '', -1, '', A.arvore];
  porId.raiz = RAIZ;
  (function andar(lista, p) {
    lista.forEach(function (x) { porId[x[0]] = x; pai[x[0]] = p; if (!porNome[x[1]]) porNome[x[1]] = x; andar(x[8], x[0]); });
  })(A.arvore, 'raiz');
  var contaCat = { d: 0, r: 0, f: 0, c: 0, o: 0 };
  Object.keys(porId).forEach(function (k) { var c = porId[k][2]; if (c in contaCat) contaCat[c]++; });

  /* nos domínios e reinos vale o nome no plural daqui (o Wikidata dá "bactéria"); abaixo deles, o do Wikidata */
  /* as origens em ordem do tempo, da mais antiga à mais nova (pelo começo do intervalo) */
  var ORIG = V.origens.slice().sort(function (a, b) { var va = Array.isArray(a[0]) ? a[0][0] : a[0], vb = Array.isArray(b[0]) ? b[0][0] : b[0]; return vb - va; });
  function ptDe(x) { return PT_TOPO[x[1]] || x[5] || ''; }
  function nomeDe(x) { return ptDe(x) || x[1]; }
  function caminho(id) { var c = []; while (id && id !== 'raiz') { c.unshift(id); id = pai[id]; } return c; }
  function imagem(x) { return x[6] >= 0 ? A.imagens[x[6]] : null; }

  /* ---------- o estado (o grupo aberto fica no endereço, para mandar a alguém) ---------- */
  var LENTES = [['lista', 'lista'], ['grade', 'grade'], ['mapa', 'mapa'], ['corrido', 'corrido']];
  var estado = { no: 'raiz', lente: 'lista', traco: null, forma: 'folhas', parte: '' };
  try { estado.lente = localStorage.getItem('vida-lente') || 'lista'; } catch (e) {}
  (function () { var q = new URLSearchParams(location.search).get('no'); if (q && porId[q]) estado.no = q; })();
  function guardarNo() { try { var u = new URL(location.href); if (estado.no === 'raiz') u.searchParams.delete('no'); else u.searchParams.set('no', estado.no); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {} }

  /* ---------- os traços: quem tem, e os ramos que levam até quem tem ---------- */
  var tracoIds = {};
  function acesosDo(t) {
    if (tracoIds[t[0]]) return tracoIds[t[0]];
    var set = {};
    t[4].forEach(function (nome) { var x = porNome[nome]; if (!x) return; set[x[0]] = 'tem'; var p = pai[x[0]]; while (p && p !== 'raiz') { if (!set[p]) set[p] = 'ramo'; p = pai[p]; } });
    tracoIds[t[0]] = set; return set;
  }
  function fonteLink(id) {
    return [].concat(id).map(function (f) { var i = Object.keys(V.fontes).indexOf(f) + 1; return '<a class="vd-fonte" href="#fonte-' + f + '" title="' + esc(V.fontes[f] ? V.fontes[f][0] : f) + '">' + i + '</a>'; }).join('');
  }

  /* ================================================================
     O CABEÇALHO: os números
     ================================================================ */
  var numeros = document.getElementById('vd-numeros');
  if (numeros) numeros.innerHTML =
    '<p><b>' + n(somaV) + '</b><span>espécies vivas já descritas</span></p>' +
    '<p><b>' + n(somaT) + '</b><span>contando as extintas</span></p>' +
    '<p><b>' + n(contaCat.r) + '</b><span>reinos</span></p>' +
    '<p><b>' + n(contaCat.f) + '</b><span>filos</span></p>' +
    '<p><b>' + n(contaCat.c) + '</b><span>classes</span></p>' +
    '<p><b>' + n(contaCat.o) + '</b><span>ordens</span></p>';
  var ed = document.getElementById('vd-edicao');
  if (ed) ed.textContent = A.fonte.nome + ', edição de ' + A.fonte.versao.split('-').reverse().join('/');

  /* ================================================================
     AS SEÇÕES
     ================================================================ */
  var grupos = [];
  V.tracos.forEach(function (t) { if (grupos.indexOf(t[1]) < 0) grupos.push(t[1]); });
  raiz.innerHTML =
    '<section class="vd-sec" id="arvore" data-secao="arvore" data-rotulo="A árvore" aria-labelledby="vd-arvore-t">' +
      '<header class="vd-cab"><div><p class="rot">Os domínios, os reinos, os filos, as classes, as ordens</p><h2 class="h2" id="vd-arvore-t">A árvore</h2></div>' +
        '<p class="vd-cab-nota">Cada número é de espécies vivas já descritas, segundo o catálogo. Tocar num grupo desce um nível; o nome em negrito abre a ficha, com as espécies.</p></header>' +
      '<div class="vd-busca-linha">' +
        '<form class="vd-busca" id="vd-busca" role="search"><input type="search" id="vd-q" placeholder="Buscar uma espécie: onça-pintada, ipê-amarelo, Panthera onca…" aria-label="Buscar uma espécie pelo nome" autocomplete="off"><button class="botao pri" type="submit">Buscar</button></form>' +
        '<nav class="vd-reinos" aria-label="Ir direto a um reino">' + V.reinos.map(function (r) { var x = porNome[r[0]]; return x ? '<button type="button" class="chip" data-ir="' + x[0] + '">' + esc(r[1]) + '</button>' : ''; }).join('') + '</nav>' +
      '</div>' +
      '<div class="vd-res" id="vd-res" hidden aria-live="polite"></div>' +
      '<div class="vd-tracos" role="group" aria-label="Filtrar por traço">' +
        '<p class="rot">Filtrar por traço</p>' +
        '<div class="vd-tracos-grade">' + grupos.map(function (g) {
          return '<div class="vd-traco-grupo"><p class="vd-traco-g">' + esc(g) + '</p><div class="vd-chips">' + V.tracos.filter(function (t) { return t[1] === g; }).map(function (t) {
            return '<button type="button" class="chip" data-traco="' + t[0] + '" aria-pressed="false">' + esc(t[2]) + '</button>';
          }).join('') + '</div></div>';
        }).join('') + '</div>' +
        '<p class="vd-traco-txt" id="vd-traco-txt" aria-live="polite"></p>' +
      '</div>' +
      '<div class="vd-nav"><nav class="vd-trilha" id="vd-trilha" aria-label="Onde você está na árvore"></nav>' +
        '<div class="vd-lentes" role="group" aria-label="Como ver">' + LENTES.map(function (l) { return '<button type="button" class="chip" data-lente="' + l[0] + '" aria-pressed="false">' + l[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="vd-vista" id="vd-vista"></div>' +
      '<p class="vd-pe-arvore">' + esc(A.fonte.nome) + ', edição de ' + esc(A.fonte.versao.split('-').reverse().join('/')) + ' (' + esc(A.fonte.licenca) + '). Algumas algas ainda não têm as espécies contadas no catálogo; onde não há número, aparece um traço. Nomes em português e imagens do Wikidata e do Wikimedia Commons.</p>' +
    '</section>' +
    secFormas() + secOrigens() + secFontes();

  var vista = document.getElementById('vd-vista');

  /* ================================================================
     A ÁRVORE: a trilha, as lentes, a vista
     ================================================================ */
  function pintarTrilha() {
    var c = caminho(estado.no);
    document.getElementById('vd-trilha').innerHTML = '<button type="button" data-ir="raiz"' + (estado.no === 'raiz' ? ' aria-current="location"' : '') + '>A vida</button>' +
      c.map(function (id, i) { var x = porId[id]; return '<span aria-hidden="true">›</span><button type="button" data-ir="' + id + '"' + (i === c.length - 1 ? ' aria-current="location"' : '') + '>' + esc(nomeDe(x)) + '</button>'; }).join('');
  }
  function contagem(x) { return x[3] ? n(x[3]) : x[4] ? '†' : '—'; }
  function notaContagem(x) { return x[3] ? 'espécies vivas' : x[4] ? 'só extintas (' + n(x[4]) + ')' : 'sem contagem no catálogo'; }

  function pintarVista() {
    var x = porId[estado.no], fs = x[8];
    var acesos = estado.traco ? acesosDo(V.tracos.filter(function (t) { return t[0] === estado.traco; })[0]) : null;
    var classe = function (f) { return acesos ? (acesos[f[0]] === 'tem' ? ' tem' : acesos[f[0]] === 'ramo' ? ' ramo' : ' apagado') : ''; };
    document.querySelectorAll('[data-lente]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lente') === estado.lente)); });
    vista.setAttribute('data-lente', estado.lente);
    if (!fs.length) { vista.innerHTML = '<p class="vd-vazio">Este é o último nível da árvore guardada aqui. As espécies estão na ficha.</p>'; return; }
    var cab = '<p class="vd-vista-cab"><b>' + esc(nomeDe(x)) + '</b>' + (x[0] !== 'raiz' && ptDe(x) ? ' <i>' + esc(x[1]) + '</i>' : '') + ' · ' + n(x[3]) + ' espécies vivas em ' + fs.length + ' ' + (fs.length === 1 ? CAT[fs[0][2]] : CATP[fs[0][2]] || 'grupos') +
      (x[0] !== 'raiz' ? ' · <button type="button" class="vd-link" data-ficha="' + x[0] + '">abrir a ficha</button>' : '') + '</p>';
    var max = Math.max.apply(null, fs.map(function (f) { return f[3]; }).concat([1]));
    if (estado.lente === 'lista') {
      vista.innerHTML = cab + '<ol class="vd-lista">' + fs.map(function (f) {
        var pct = f[3] ? Math.max(.4, f[3] / max * 100) : 0;
        return '<li class="vd-item' + classe(f) + '"><button type="button" class="vd-desce" data-no="' + f[0] + '" title="' + (f[8].length ? 'Descer para ' : 'Abrir ') + esc(nomeDe(f)) + '">' +
          '<span class="vd-nome"><b>' + esc(nomeDe(f)) + '</b>' + (ptDe(f) ? '<i>' + esc(f[1]) + '</i>' : '') + '</span>' +
          '<span class="vd-cat">' + CAT[f[2]] + (f[8].length ? ' · ' + f[8].length + ' ' + (CATP[f[8][0][2]] || '') : '') + '</span>' +
          '<span class="vd-num" title="' + notaContagem(f) + '">' + contagem(f) + '</span>' +
          '<span class="vd-barra" aria-hidden="true"><i style="width:' + pct.toFixed(2) + '%"></i></span></button>' +
          '<button type="button" class="vd-ficha" data-ficha="' + f[0] + '" aria-label="A ficha de ' + esc(nomeDe(f)) + '">ficha</button></li>';
      }).join('') + '</ol>';
    } else if (estado.lente === 'grade') {
      vista.innerHTML = cab + '<div class="vd-grade">' + fs.map(function (f) {
        var im = imagem(f);
        return '<button type="button" class="vd-cartao' + classe(f) + '" data-no="' + f[0] + '">' +
          '<span class="vd-cartao-img">' + (im ? '<img src="' + esc(im[0]) + '" alt="" loading="lazy" decoding="async">' : '<i class="vd-sem-img" aria-hidden="true">' + esc(f[1].charAt(0)) + '</i>') + '</span>' +
          '<span class="vd-cartao-t"><b>' + esc(nomeDe(f)) + '</b>' + (ptDe(f) ? '<i>' + esc(f[1]) + '</i>' : '') + '<small>' + contagem(f) + ' ' + (f[3] ? 'espécies' : '') + ' · ' + CAT[f[2]] + '</small></span></button>';
      }).join('') + '</div>';
    } else if (estado.lente === 'mapa') {
      var com = fs.filter(function (f) { return f[3] > 0; }), sem = fs.filter(function (f) { return !f[3]; });
      /* em unidades de 100 × 56,25 (16:9), para os retângulos saírem quase quadrados na tela; desenhado em HTML, as letras não deformam */
      var W = 100, H = vista.clientWidth && vista.clientWidth < 640 ? 133.33 : 56.25;
      var rets = quadricular(com.map(function (f) { return { v: f[3], f: f }; }), 0, 0, W, H);
      vista.innerHTML = cab + '<div class="vd-mapa" style="aspect-ratio:' + (W / H).toFixed(4) + '" role="group" aria-label="O mapa: a área de cada retângulo é o número de espécies vivas">' + rets.map(function (r) {
        var f = r.f;
        return '<button type="button" class="vd-ret' + classe(f) + (r.w * r.h < 6 ? ' pequeno' : '') + '" data-no="' + f[0] + '" style="left:' + r.x.toFixed(3) + '%;top:' + (r.y / H * 100).toFixed(3) + '%;width:' + r.w.toFixed(3) + '%;height:' + (r.h / H * 100).toFixed(3) + '%" title="' + esc(nomeDe(f)) + ': ' + n(f[3]) + ' espécies vivas">' +
          '<b>' + esc(nomeDe(f)) + '</b><small>' + n(f[3]) + '</small></button>';
      }).join('') + '</div>' +
        (sem.length ? '<p class="vd-sem">Sem espécies vivas contadas: ' + sem.map(function (f) { return '<button type="button" class="vd-link" data-no="' + f[0] + '">' + esc(nomeDe(f)) + '</button>' + (f[4] ? ' (†)' : ''); }).join(', ') + '.</p>' : '');
    } else {
      /* corrido: a lente desligada, a árvore como texto */
      vista.innerHTML = cab + '<div class="vd-corrido"><p><b>' + esc(nomeDe(x)) + '</b>' + (x[0] !== 'raiz' && ptDe(x) ? ' (' + esc(x[1]) + ')' : '') + ': ' + n(x[3]) + ' espécies vivas descritas, ' + n(x[4]) + ' contando as extintas, em ' + fs.length + ' ' + (CATP[fs[0][2]] || 'grupos') + ': ' +
        fs.map(function (f, i) { return (i === fs.length - 1 && i ? 'e ' : '') + '<button type="button" class="vd-link" data-no="' + f[0] + '">' + esc(nomeDe(f)) + '</button>' + (ptDe(f) ? ' (<i>' + esc(f[1]) + '</i>)' : '') + ', ' + (f[3] ? n(f[3]) : f[4] ? 'só extintas' : 'sem contagem'); }).join('; ') + '.</p></div>';
    }
  }

  /* o mapa: retângulos "quase quadrados" (squarified, Bruls, Huizing e van Wijk, 2000) */
  function quadricular(itens, x, y, w, h) {
    var soma = itens.reduce(function (s, o) { return s + o.v; }, 0) || 1, area = w * h, fila = itens.slice().sort(function (a, b) { return b.v - a.v; }), out = [], linha = [];
    fila.forEach(function (o) { o.a = o.v / soma * area; });
    function pior(l, lado) { if (!l.length) return Infinity; var s = 0, mx = 0, mn = Infinity; l.forEach(function (o) { s += o.a; mx = Math.max(mx, o.a); mn = Math.min(mn, o.a); }); return Math.max(lado * lado * mx / (s * s), (s * s) / (lado * lado * mn)); }
    function assentar(l) {
      var s = l.reduce(function (t, o) { return t + o.a; }, 0); if (!s) return;
      if (w >= h) { var esp = s / h, yy = y; l.forEach(function (o) { var hh = o.a / esp; out.push({ x: x, y: yy, w: esp, h: hh, f: o.f }); yy += hh; }); x += esp; w -= esp; }
      else { var esp2 = s / w, xx = x; l.forEach(function (o) { var ww = o.a / esp2; out.push({ x: xx, y: y, w: ww, h: esp2, f: o.f }); xx += ww; }); y += esp2; h -= esp2; }
    }
    while (fila.length) {
      var lado = Math.min(w, h), c = fila[0];
      if (!linha.length || pior(linha.concat([c]), lado) <= pior(linha, lado)) { linha.push(fila.shift()); continue; }
      assentar(linha); linha = [];
    }
    assentar(linha);
    return out;
  }

  function ir(id) {
    if (!porId[id]) return;
    estado.no = id;
    guardarNo(); pintarTrilha(); pintarVista();
    var v = document.getElementById('vd-vista'); if (v) v.scrollTop = 0;
  }

  /* ================================================================
     A FICHA DE UM GRUPO, com as espécies ao vivo
     ================================================================ */
  function fichaGrupo(id) {
    var x = porId[id]; if (!x || !P.folha) return;
    var im = imagem(x), c = caminho(id);
    var tracos = V.tracos.filter(function (t) { return t[4].indexOf(x[1]) >= 0; });
    var orig = V.origens.filter(function (o) { return o[2] === x[1]; });
    var fs = x[8];
    var html = (im ? '<figure class="vd-f-img"><img src="' + esc(im[0]) + '" alt="' + esc(nomeDe(x)) + '"><figcaption>' + esc(im[1] || 'autor não informado') + ' · ' + esc(im[2]) + ' · <a href="' + esc(im[3]) + '" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>' : '') +
      '<p class="vd-f-caminho">' + c.map(function (k) { return '<button type="button" class="vd-link" data-ir="' + k + '">' + esc(nomeDe(porId[k])) + '</button>'; }).join(' › ') + '</p>' +
      '<dl class="vd-f-dados"><div><dt>Espécies vivas</dt><dd>' + (x[3] ? n(x[3]) : '—') + '</dd></div><div><dt>Com as extintas</dt><dd>' + (x[4] ? n(x[4]) : '—') + '</dd></div>' +
        (fs.length ? '<div><dt>Dentro</dt><dd>' + fs.length + ' ' + (CATP[fs[0][2]] || 'grupos') + '</dd></div>' : '') + '<div><dt>Categoria</dt><dd>' + CAT[x[2]] + '</dd></div></dl>' +
      (orig.length ? '<p class="vd-f-orig">' + orig.map(function (o) { return '<b>' + tempoTxt(o[0]) + ':</b> ' + esc(o[1]) + fonteLink(o[3]); }).join('<br>') + '</p>' : '') +
      (tracos.length ? '<ul class="vd-f-tracos">' + tracos.map(function (t) { return '<li><b>' + esc(t[2]) + '.</b> ' + esc(t[3]) + fonteLink(t[5]) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="vd-f-links"><a href="https://www.catalogueoflife.org/data/taxon/' + encodeURIComponent(x[0]) + '" target="_blank" rel="noopener">No Catalogue of Life</a>' +
        (x[7] ? ' · <a href="https://pt.wikipedia.org/wiki/' + encodeURIComponent(x[7]) + '" target="_blank" rel="noopener">Na Wikipédia</a>' : '') +
        (fs.length ? ' · <button type="button" class="vd-link" data-ir="' + x[0] + '" data-fechar-folha>Descer na árvore</button>' : '') + '</p>' +
      (fs.length ? '' : '<section class="vd-f-especies"><h3>Por dentro</h3><p class="vd-f-nota">As famílias, os gêneros e as espécies vivas, do catálogo, ao vivo: toque para abrir. As imagens vêm do Wikimedia Commons, quando há.</p>' +
        '<div class="vd-ramo-raiz" data-ramo-raiz="' + x[0] + '"><p><button type="button" class="botao" data-ramo-abrir="' + x[0] + '">Abrir as famílias</button></p></div></section>');
    P.folha({ titulo: esc(nomeDe(x)), sub: esc(CAT[x[2]] + (ptDe(x) ? ' · ' + x[1] : '')), larga: true, html: html, aoAbrir: function (corpo, api) {
      corpo.addEventListener('click', function (ev) {
        var irB = ev.target.closest('[data-ir]');
        if (irB) { ev.preventDefault(); api.fechar(); ir(irB.getAttribute('data-ir')); var a = document.getElementById('arvore'); if (a) a.scrollIntoView({ behavior: CALMO ? 'auto' : 'smooth', block: 'start' }); return; }
        var abrirB = ev.target.closest('[data-ramo-abrir]');
        if (abrirB) { ev.preventDefault(); carregarRamo(abrirB.getAttribute('data-ramo-abrir'), 0, abrirB.closest('[data-ramo-raiz]')); return; }
        var ramoB = ev.target.closest('[data-ramo]');
        if (ramoB) {
          ev.preventDefault();
          var dentro = ramoB.nextElementSibling, aberto = ramoB.getAttribute('aria-expanded') === 'true';
          ramoB.setAttribute('aria-expanded', String(!aberto)); dentro.hidden = aberto;
          if (!aberto && !dentro.childElementCount) carregarRamo(ramoB.getAttribute('data-ramo'), 0, dentro);
          return;
        }
        var maisB = ev.target.closest('[data-ramo-mais]');
        if (maisB) { ev.preventDefault(); var caixa = maisB.closest('.vd-ramo-caixa'); maisB.parentNode.remove(); carregarRamo(maisB.getAttribute('data-ramo-mais'), +maisB.getAttribute('data-off'), caixa); return; }
        var esp = ev.target.closest('[data-especie]');
        if (esp) { ev.preventDefault(); var d = JSON.parse(esp.getAttribute('data-especie')); fichaEspecie(d); }
      });
    } });
  }

  /* por dentro de um grupo: os filhos vivos, do Catalogue of Life (a árvore dele, que é estável; a busca por
     grupo, sem termo, devolvia só sinônimos em 22/out/2026); 100 de cada vez; as espécies com imagem do Wikidata */
  var RANK_PT = { superfamily: 'superfamília', family: 'família', subfamily: 'subfamília', tribe: 'tribo', subtribe: 'subtribo', genus: 'gênero', subgenus: 'subgênero', section: 'seção', species: 'espécie', subspecies: 'subespécie', variety: 'variedade', form: 'forma' };
  function autoria(html, nome) { var t = document.createElement('div'); t.innerHTML = String(html || ''); return (t.textContent || '').replace(nome, '').trim(); }
  function carregarRamo(id, off, caixa) {
    if (!caixa) return;
    if (!off) caixa.innerHTML = '<p class="vd-f-nota">Buscando no catálogo…</p>';
    caixa.classList.add('vd-ramo-caixa');
    fetch(COL + '/tree/' + encodeURIComponent(id) + '/children?extinct=false&limit=100&offset=' + off)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var itens = (d.result || []).filter(function (r) { return !r.status || r.status === 'accepted'; });
        if (!off) caixa.innerHTML = '<ul class="vd-ramo"></ul>';
        var ul = caixa.querySelector(':scope > ul');
        if (!itens.length && !off) { caixa.innerHTML = '<p class="vd-f-nota">O catálogo não tem espécies vivas aqui.</p>'; return; }
        ul.insertAdjacentHTML('beforeend', itens.map(function (r) {
          if (r.rank === 'species') {
            var e = { sci: r.name, aut: autoria(r.labelHtml, r.name), id: r.id };
            return '<li><button type="button" class="vd-esp-b" data-especie="' + esc(JSON.stringify(e)) + '"><span class="vd-esp-img" data-img-de="' + esc(r.name) + '"></span><span><i>' + esc(r.name) + '</i><small>' + esc(e.aut) + '</small></span></button></li>';
          }
          return '<li><button type="button" class="vd-ramo-b" data-ramo="' + esc(r.id) + '" aria-expanded="false"><span class="vd-ramo-seta" aria-hidden="true"></span>' +
            '<b' + (/genus|species/.test(r.rank) ? ' class="it"' : '') + '>' + esc(r.name) + '</b><small>' + esc(RANK_PT[r.rank] || r.rank) + '</small><span class="vd-num">' + (r.count ? n(r.count) : '—') + '</span></button><div class="vd-ramo-dentro" hidden></div></li>';
        }).join(''));
        var especies = itens.filter(function (r) { return r.rank === 'species'; }).map(function (r) { return r.name; });
        if (especies.length) imagensDe(especies, caixa);
        var feito = off + (d.result || []).length;
        if ((d.total || 0) > feito) caixa.insertAdjacentHTML('beforeend', '<p><button type="button" class="botao" data-ramo-mais="' + esc(id) + '" data-off="' + feito + '">Mais (faltam ' + n(d.total - feito) + ')</button></p>');
      })
      .catch(function () { caixa.innerHTML = '<p class="vd-f-nota">Isto vem do Catalogue of Life pela internet; sem conexão, fica a árvore.</p>'; });
  }
  function imagensDe(nomes, alvo) {
    if (!nomes.length) return;
    var q = 'SELECT ?n ?img ?rot WHERE { VALUES ?n { ' + nomes.map(function (s) { return '"' + s.replace(/["\\]/g, '') + '"'; }).join(' ') + ' } ?i wdt:P225 ?n . OPTIONAL { ?i wdt:P18 ?img } OPTIONAL { ?i rdfs:label ?rot FILTER(lang(?rot) = "pt") } }';
    fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { accept: 'application/sparql-results+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d) return;
        var vistos = {};
        d.results.bindings.forEach(function (b) {
          var nome = b.n.value; if (vistos[nome]) return; if (!b.img) return; vistos[nome] = 1;
          var arq = decodeURIComponent(b.img.value.split('/').pop());
          alvo.querySelectorAll('[data-img-de="' + nome.replace(/"/g, '') + '"]').forEach(function (s) {
            s.innerHTML = '<img src="https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(arq) + '?width=160" alt="" loading="lazy" decoding="async">';
            var bt = s.closest('[data-especie]'); if (bt) { var e = JSON.parse(bt.getAttribute('data-especie')); e.img = arq; if (!e.pt && b.rot && b.rot.value.toLowerCase() !== nome.toLowerCase()) e.pt = b.rot.value; bt.setAttribute('data-especie', JSON.stringify(e)); }
          });
        });
      }).catch(function () {});
  }

  /* a ficha de uma espécie (da busca ou da lista): o nome, a imagem com o autor, o caminho na árvore */
  function fichaEspecie(e) {
    if (!P.folha) return;
    var html = '<div class="vd-esp-ficha"><p class="vd-f-nota">Buscando no catálogo…</p></div>';
    P.folha({ titulo: esc(e.pt || e.sci), sub: '<i>' + esc(e.sci) + '</i>' + (e.aut ? ' ' + esc(e.aut) : ''), larga: true, html: html, aoAbrir: function (corpo, api) {
      var alvo = corpo.querySelector('.vd-esp-ficha');
      var pronto = function (cls, colId, autor) {
        var no = null; for (var i = cls.length - 1; i >= 0 && !no; i--) { var x = porNome[cls[i]]; if (x && ['o', 'c', 'f', 'r'].indexOf(x[2]) >= 0) no = x; }
        alvo.innerHTML = (e.img ? '<figure class="vd-f-img"><img src="https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(e.img) + '?width=900" alt="' + esc(e.pt || e.sci) + '"><figcaption id="vd-credito">Wikimedia Commons</figcaption></figure>' : '') +
          (cls.length ? '<p class="vd-f-caminho">' + cls.map(function (c) { return esc(c); }).join(' › ') + '</p>' : '') +
          '<p class="vd-f-links">' + (colId ? '<a href="https://www.catalogueoflife.org/data/taxon/' + encodeURIComponent(colId) + '" target="_blank" rel="noopener">No Catalogue of Life</a>' : '') +
          (e.art ? ' · <a href="https://pt.wikipedia.org/wiki/' + encodeURIComponent(e.art) + '" target="_blank" rel="noopener">Na Wikipédia</a>' : ' · <a href="https://pt.wikipedia.org/w/index.php?search=' + encodeURIComponent(e.sci) + '" target="_blank" rel="noopener">Procurar na Wikipédia</a>') +
          (no ? ' · <button type="button" class="vd-link" data-ir-no="' + no[0] + '">Ver o grupo na árvore (' + esc(nomeDe(no)) + ')</button>' : '') + '</p>';
        if (e.img) creditoCommons(e.img, corpo.querySelector('#vd-credito'));
        var b = alvo.querySelector('[data-ir-no]');
        if (b) b.addEventListener('click', function () { api.fechar(); var alvoNo = b.getAttribute('data-ir-no'); ir(pai[alvoNo] || 'raiz'); marcarNaVista(alvoNo); var a = document.getElementById('arvore'); if (a) a.scrollIntoView({ behavior: CALMO ? 'auto' : 'smooth', block: 'start' }); });
      };
      if (e.cls && e.cls.length) { pronto(e.cls.slice(0, -1), e.id); return; }
      fetch(COL + '/nameusage/search?q=' + encodeURIComponent(e.sci) + '&content=SCIENTIFIC_NAME&rank=species&limit=5')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { var r = d && d.result && (d.result.filter(function (x) { return x.usage && x.usage.status === 'accepted' && x.usage.name && x.usage.name.scientificName === e.sci; })[0] || d.result[0]); pronto(r ? (r.classification || []).map(function (c) { return c.name; }).slice(0, -1) : [], r ? r.id : ''); })
        .catch(function () { pronto([], ''); });
    } });
  }
  function creditoCommons(arq, alvo) {
    if (!alvo) return;
    fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&titles=' + encodeURIComponent('File:' + arq))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var p = d && d.query && Object.values(d.query.pages)[0], m = p && p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata; if (!m) return;
        var limpo = function (h) { var t = document.createElement('div'); t.innerHTML = String(h || ''); return (t.textContent || '').replace(/\s+/g, ' ').trim(); };
        alvo.innerHTML = esc(limpo(m.Artist && m.Artist.value).slice(0, 90) || 'autor não informado') + ' · ' + esc(limpo(m.LicenseShortName && m.LicenseShortName.value)) + ' · <a href="https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(arq) + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
      }).catch(function () {});
  }
  function marcarNaVista(id) {
    var el = vista.querySelector('[data-no="' + id + '"]');
    if (!el) return;
    var item = el.closest('li, .vd-cartao, .vd-ret') || el;
    item.classList.add('vd-achado');
    setTimeout(function () { item.classList.remove('vd-achado'); }, 2400);
    if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: CALMO ? 'auto' : 'smooth' });
  }

  /* ================================================================
     A BUSCA: o nome científico (catálogo) e o nome popular (Wikidata)
     ================================================================ */
  var res = document.getElementById('vd-res'), buscaN = 0;
  function buscar(texto) {
    texto = texto.trim();
    if (texto.length < 3) { res.hidden = true; res.innerHTML = ''; return; }
    var meu = ++buscaN;
    res.hidden = false; res.innerHTML = '<p class="vd-f-nota">Buscando “' + esc(texto) + '”…</p>';
    var porCol = fetch(COL + '/nameusage/search?q=' + encodeURIComponent(texto) + '&content=SCIENTIFIC_NAME&rank=species&limit=12')
      .then(function (r) { return r.ok ? r.json() : { result: [] }; })
      .then(function (d) { return (d.result || []).filter(function (r) { return r.usage && r.usage.status === 'accepted'; }).slice(0, 6).map(function (r) { return { sci: r.usage.name.scientificName, aut: r.usage.name.authorship || '', pt: '', cls: (r.classification || []).map(function (c) { return c.name; }), id: r.id }; }); })
      .catch(function () { return []; });
    var porWd = fetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*&language=pt&uselang=pt&type=item&limit=10&search=' + encodeURIComponent(texto))
      .then(function (r) { return r.ok ? r.json() : { search: [] }; })
      .then(function (d) {
        var ids = (d.search || []).map(function (s) { return s.id; });
        if (!ids.length) return [];
        return fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=claims|labels|sitelinks&languages=pt&sitefilter=ptwiki&ids=' + ids.join('|'))
          .then(function (r) { return r.ok ? r.json() : { entities: {} }; })
          .then(function (e) {
            return ids.map(function (k) { return e.entities[k]; }).filter(function (it) { return it && it.claims && it.claims.P225; }).map(function (it) {
              var sci = it.claims.P225[0].mainsnak.datavalue ? it.claims.P225[0].mainsnak.datavalue.value : '';
              var img = it.claims.P18 && it.claims.P18[0].mainsnak.datavalue ? it.claims.P18[0].mainsnak.datavalue.value : '';
              return { sci: sci, pt: it.labels && it.labels.pt ? it.labels.pt.value : '', img: img, art: it.sitelinks && it.sitelinks.ptwiki ? it.sitelinks.ptwiki.title : '' };
            }).filter(function (x) { return x.sci; });
          });
      }).catch(function () { return []; });
    Promise.all([porWd, porCol]).then(function (r) {
      if (meu !== buscaN) return;
      var vistos = {}, todos = [];
      r[0].concat(r[1]).forEach(function (e) { if (vistos[e.sci]) return; vistos[e.sci] = 1; todos.push(e); });
      if (!todos.length) { res.innerHTML = '<p class="vd-f-nota">Nada com esse nome. Tente o nome científico, ou outro nome popular.</p>'; return; }
      res.innerHTML = '<p class="rot">Encontrados</p><ul class="vd-res-lista">' + todos.slice(0, 10).map(function (e) {
        return '<li><button type="button" class="vd-esp-b" data-especie="' + esc(JSON.stringify(e)) + '"><span class="vd-esp-img">' + (e.img ? '<img src="https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(e.img) + '?width=120" alt="" loading="lazy">' : '') + '</span><span>' + (e.pt ? '<b>' + esc(e.pt) + '</b>' : '') + '<i>' + esc(e.sci) + '</i>' + (e.cls && e.cls.length ? '<small>' + esc(e.cls.slice(-4, -1).join(' › ')) + '</small>' : '') + '</span></button></li>';
      }).join('') + '</ul>';
    });
  }
  document.getElementById('vd-busca').addEventListener('submit', function (ev) { ev.preventDefault(); buscar(document.getElementById('vd-q').value); });
  var esperaBusca = 0;
  document.getElementById('vd-q').addEventListener('input', function (ev) { clearTimeout(esperaBusca); var v = ev.target.value; esperaBusca = setTimeout(function () { buscar(v); }, 450); });

  /* ================================================================
     AS FORMAS: os desenhos
     ================================================================ */
  var TRACO = 'fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';
  var CHEIO = 'class="vd-d-cheio"';
  function svg(corpo, vb) { return '<svg viewBox="' + (vb || '0 0 120 120') + '" aria-hidden="true" focusable="false">' + corpo + '</svg>'; }
  /* uma folha pela meia-largura w(t), da base (t = 0) à ponta (t = 1), sobre uma nervura que pode curvar */
  function contorno(w, o) {
    o = o || {}; var base = o.base || 108, topo = o.topo || 12, cx = o.cx || 60, curva = o.curva || function () { return 0; }, N = 120, e = [], d = [];
    for (var i = 0; i <= N; i++) { var t = i / N, y = base - (base - topo) * t, x = cx + curva(t), m = Math.max(0, w(t)); e.push([x - m, y]); d.push([x + m, y]); }
    var pts = e.concat(d.reverse());
    return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z';
  }
  function beta(a, b, H) { var tm = a / (a + b), mx = Math.pow(tm, a) * Math.pow(1 - tm, b); return function (t) { return H * Math.pow(t, a) * Math.pow(1 - t, b) / mx; }; }
  function elipse(H) { return function (t) { return H * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2))); }; }
  function folha(w, o) { o = o || {}; return '<path ' + CHEIO + ' d="' + contorno(w, o) + '"/>' + (o.semNervura ? '' : '<path ' + TRACO + ' d="M' + (o.cx || 60) + ' ' + ((o.base || 108) + 8) + ' L' + (o.cx || 60) + ' ' + ((o.base || 108) - ((o.base || 108) - (o.topo || 12)) * .92) + '"/>'); }
  function margem(fn) { var b = elipse(24); return function (t) { var f = fn(t); return b(t) + f * Math.min(1, t * 8, (1 - t) * 8); }; }
  function frac(x) { return x - Math.floor(x); }
  function folhinha(cx, cy, ang, L, H) { return '<g transform="rotate(' + ang + ' ' + cx + ' ' + cy + ')">' + '<path ' + CHEIO + ' d="' + contorno(beta(.8, 1, H), { base: cy, topo: cy - L, cx: cx }) + '"/></g>'; }

  var DESENHOS = {
    acicular: function () { return svg('<path ' + TRACO + ' d="M60 112 L60 10"/><path ' + CHEIO + ' d="' + contorno(function (t) { return 2.2 * Math.pow(1 - t, .5); }) + '"/>'); },
    linear: function () { return svg(folha(function (t) { return 5.5 * Math.min(1, t * 20, (1 - t) * 9); })); },
    lanceolada: function () { return svg(folha(beta(.6, 1.4, 16))); },
    oblanceolada: function () { return svg(folha(beta(1.4, .6, 15))); },
    eliptica: function () { return svg(folha(elipse(26))); },
    oblonga: function () { return svg(folha(function (t) { return 20 * Math.pow(Math.min(1, t * 7, (1 - t) * 7), .5); })); },
    ovada: function () { return svg(folha(beta(.75, 1.15, 30))); },
    obovada: function () { return svg(folha(beta(1.15, .75, 30))); },
    orbicular: function () { return svg(folha(elipse(44), { base: 104, topo: 16 })); },
    espatulada: function () { return svg(folha(function (t) { return Math.max(4 + 6 * t, 26 * Math.sqrt(Math.max(0, 1 - Math.pow((t - .7) / .3, 2)))); })); },
    deltoide: function () { return svg(folha(function (t) { return 42 * Math.min(1, t * 14) * (1 - t); }, { base: 100 })); },
    romboide: function () { return svg(folha(function (t) { return 30 * (1 - Math.abs(2 * t - 1)); })); },
    falcada: function () { return svg(folha(beta(.7, 1.3, 12), { curva: function (t) { return 26 * Math.sin(Math.PI * t * .9) - 6; }, semNervura: true })); },
    cordada: function () {
      var p = []; for (var i = 0; i <= 80; i++) { var a = i / 80 * 2 * Math.PI, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); p.push((60 + x * 2.9).toFixed(1) + ' ' + (60 + y * 2.9).toFixed(1)); }
      return svg('<path ' + CHEIO + ' d="M' + p.join(' L') + ' Z"/><path ' + TRACO + ' d="M60 114 L60 36"/>');
    },
    reniforme: function () { return svg('<path ' + CHEIO + ' d="M60 84 C40 100 10 92 12 64 C14 36 40 28 60 32 C80 28 106 36 108 64 C110 92 80 100 60 84 Z"/><path ' + TRACO + ' d="M60 114 L60 84"/>'); },
    sagitada: function () { return svg('<path ' + CHEIO + ' d="M60 12 C70 40 84 62 86 82 L82 112 L64 88 L60 92 L56 88 L38 112 L34 82 C36 62 50 40 60 12 Z"/><path ' + TRACO + ' d="M60 116 L60 22"/>'); },
    hastada: function () { return svg('<path ' + CHEIO + ' d="M60 12 C68 40 72 60 72 76 L104 88 L72 92 L60 98 L48 92 L16 88 L48 76 C48 60 52 40 60 12 Z"/><path ' + TRACO + ' d="M60 116 L60 22"/>'); },
    peltada: function () { var r = ''; for (var i = 0; i < 9; i++) { var a = i / 9 * 2 * Math.PI; r += 'M60 60 L' + (60 + 38 * Math.cos(a)).toFixed(1) + ' ' + (60 + 38 * Math.sin(a)).toFixed(1) + ' '; } return svg('<circle ' + CHEIO + ' cx="60" cy="60" r="44"/><path ' + TRACO + ' d="' + r + '"/><circle cx="60" cy="60" r="3.2" fill="currentColor"/>'); },
    'm-inteira': function () { return svg(folha(margem(function () { return 0; }))); },
    'm-serreada': function () { return svg(folha(margem(function (t) { var f = frac(t * 14); return 3.4 * (f < .78 ? f / .78 : (1 - f) / .22) - 1.7; }))); },
    'm-denteada': function () { return svg(folha(margem(function (t) { var f = frac(t * 12); return 3.2 * (1 - Math.abs(2 * f - 1)) - 1.6; }))); },
    'm-crenada': function () { return svg(folha(margem(function (t) { return 3.4 * Math.abs(Math.sin(Math.PI * t * 10)) - 1.7; }))); },
    'm-lobada': function () { var b = elipse(30); return svg(folha(function (t) { return b(t) * (.5 + .5 * Math.abs(Math.cos(Math.PI * t * 3.5))); })); },
    'm-pinatifida': function () { var b = elipse(30); return svg(folha(function (t) { return b(t) * (.6 + .4 * Math.pow(Math.abs(Math.sin(Math.PI * t * 6)), .6)); })); },
    'm-ondulada': function () { return svg(folha(margem(function (t) { return 2.8 * Math.sin(2 * Math.PI * t * 6); }))); },
    'm-espinhosa': function () { return svg(folha(margem(function (t) { var f = frac(t * 9); return f < .14 ? 9 * (1 - f / .14) : -1; }))); },
    'c-simples': function () { return svg(folha(elipse(22), { base: 96 }) + '<path ' + TRACO + ' d="M60 116 L60 96"/>'); },
    'c-palmada': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 78"/>'; [-70, -35, 0, 35, 70].forEach(function (a) { s += folhinha(60, 78, a, 52, 9); }); return svg(s); },
    'c-pinada': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 14"/>'; [96, 76, 56, 36].forEach(function (y) { s += folhinha(60, y, -62, 30, 7) + folhinha(60, y, 62, 30, 7); }); return svg(s + folhinha(60, 26, 0, 22, 7)); },
    'c-bipinada': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 14"/>'; [92, 64, 36].forEach(function (y) { [-1, 1].forEach(function (lado) { var x2 = 60 + lado * 40, y2 = y - 16; s += '<path ' + TRACO + ' d="M60 ' + y + ' L' + x2 + ' ' + y2 + '"/>'; for (var k = 1; k <= 4; k++) { var px = 60 + lado * 40 * k / 4.6, py = y - 16 * k / 4.6; s += '<ellipse ' + CHEIO + ' cx="' + px.toFixed(1) + '" cy="' + (py - 4).toFixed(1) + '" rx="2.2" ry="4.4"/><ellipse ' + CHEIO + ' cx="' + px.toFixed(1) + '" cy="' + (py + 4).toFixed(1) + '" rx="2.2" ry="4.4"/>'; } }); }); return svg(s); },
    'c-trifoliolada': function () { return svg('<path ' + TRACO + ' d="M60 116 L60 70"/>' + folhinha(60, 70, 0, 56, 12) + folhinha(60, 70, -64, 44, 11) + folhinha(60, 70, 64, 44, 11)); },
    'n-paralela': function () { var w = function (t) { return 13 * Math.min(1, t * 12) * Math.pow(1 - t, .7); }, s = '<path ' + CHEIO + ' d="' + contorno(w) + '"/>'; [-.66, -.33, 0, .33, .66].forEach(function (k) { var p = []; for (var i = 0; i <= 30; i++) { var t = i / 30; p.push((60 + k * w(t)).toFixed(1) + ' ' + (108 - 96 * t).toFixed(1)); } s += '<path ' + TRACO + ' d="M' + p.join(' L') + '"/>'; }); return svg(s); },
    'n-reticulada': function () { var w = beta(.8, 1.1, 28), s = folha(w), r = ''; for (var i = 1; i <= 6; i++) { var t = i / 7.5, y = 108 - 96 * t, m = w(t) * .85; r += 'M60 ' + y.toFixed(1) + ' L' + (60 - m).toFixed(1) + ' ' + (y - 9).toFixed(1) + ' M60 ' + y.toFixed(1) + ' L' + (60 + m).toFixed(1) + ' ' + (y - 9).toFixed(1) + ' '; } r += 'M44 70 L48 58 M76 70 L72 58 M42 50 L47 40 M78 50 L73 40 M50 86 L53 74 M70 86 L67 74'; return svg(s + '<path ' + TRACO + ' stroke-width="1" d="' + r + '"/>'); },
    'n-dicotomica': function () {
      var s = '<path ' + CHEIO + ' d="M60 104 L22 40 C34 22 50 16 58 30 L60 34 L62 30 C70 16 86 22 98 40 Z"/><path ' + TRACO + ' d="M60 116 L60 104"/>';
      var linhas = ''; (function ramo(x, y, ang, comp, nivel) { if (nivel > 4) return; var x2 = x + comp * Math.sin(ang), y2 = y - comp * Math.cos(ang); linhas += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' '; ramo(x2, y2, ang - .2, comp * .78, nivel + 1); ramo(x2, y2, ang + .2, comp * .78, nivel + 1); })(60, 104, 0, 18, 1);
      return svg(s + '<path ' + TRACO + ' stroke-width="1" d="' + linhas + '"/>');
    },
    'd-alterna': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 8"/>'; [96, 76, 56, 36, 18].forEach(function (y, i) { s += folhinha(60, y, i % 2 ? 58 : -58, 26, 7); }); return svg(s); },
    'd-oposta': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 8"/>'; [92, 64, 36].forEach(function (y) { s += folhinha(60, y, -60, 28, 7) + folhinha(60, y, 60, 28, 7); }); return svg(s); },
    'd-verticilada': function () { var s = '<path ' + TRACO + ' d="M60 116 L60 8"/>'; [90, 52].forEach(function (y) { [-75, -38, 38, 75].forEach(function (a) { s += folhinha(60, y, a, 26, 6); }); }); return svg(s + folhinha(60, 22, 0, 16, 5)); },
    'd-espiral': function () { var s = ''; for (var i = 14; i >= 1; i--) { var a = i * 137.508 * Math.PI / 180, r = 6 + i * 3.1; s += '<g transform="rotate(' + (a * 180 / Math.PI).toFixed(1) + ' 60 60)"><ellipse ' + CHEIO + ' cx="' + (60 + r).toFixed(1) + '" cy="60" rx="' + (6 + i * .9).toFixed(1) + '" ry="' + (3 + i * .35).toFixed(1) + '"/></g>'; } return svg(s + '<circle cx="60" cy="60" r="2.6" fill="currentColor"/>'); },
    'g-monopodial': function () { var s = '<path ' + TRACO + ' stroke-width="2.2" d="M60 116 L60 8"/>'; [100, 84, 68, 52, 36, 22].forEach(function (y, i) { var l = 40 - i * 5.5; s += '<path ' + TRACO + ' d="M60 ' + y + ' L' + (60 - l) + ' ' + (y - 12) + ' M60 ' + (y - 6) + ' L' + (60 + l) + ' ' + (y - 18) + '"/>'; }); return svg(s); },
    'g-simpodial': function () { var x = 60, y = 116, ang = 0, s = '', pts = 'M60 116'; for (var i = 0; i < 6; i++) { ang = (i % 2 ? -1 : 1) * .42; var x2 = x + 18 * Math.sin(ang), y2 = y - 17 * Math.cos(ang) - 2; pts += ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1); s += '<path ' + TRACO + ' d="M' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (x2 - 14 * Math.sin(ang)).toFixed(1) + ' ' + (y2 - 12).toFixed(1) + '"/><circle cx="' + (x2 - 14 * Math.sin(ang)).toFixed(1) + '" cy="' + (y2 - 12).toFixed(1) + '" r="3" fill="currentColor"/>'; x = x2; y = y2; } return svg('<path ' + TRACO + ' stroke-width="2.2" d="' + pts + '"/>' + s); },
    'g-dicotomico': function () { var linhas = ''; (function ramo(x, y, ang, comp, nivel) { if (nivel > 5) return; var x2 = x + comp * Math.sin(ang), y2 = y - comp * Math.cos(ang); linhas += 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' '; ramo(x2, y2, ang - .42, comp * .74, nivel + 1); ramo(x2, y2, ang + .42, comp * .74, nivel + 1); })(60, 116, 0, 30, 1); return svg('<path ' + TRACO + ' stroke-width="1.8" d="' + linhas + '"/>'); },
    'r-fanerofita': function () { return svg(chao() + '<path ' + TRACO + ' stroke-width="2" d="M60 86 L60 40"/><circle ' + CHEIO + ' cx="60" cy="32" r="22"/>' + gema(60, 24) + regua(24)); },
    'r-camefita': function () { return svg(chao() + '<path ' + TRACO + ' d="M60 86 L60 66 M60 72 L46 62 M60 70 L74 60"/><ellipse ' + CHEIO + ' cx="60" cy="62" rx="22" ry="10"/>' + gema(60, 70) + regua(70)); },
    'r-hemicriptofita': function () { var s = chao(); [-60, -30, 0, 30, 60].forEach(function (a) { s += folhinha(60, 86, a * 1.2, 30, 6); }); return svg(s + gema(60, 86)); },
    'r-criptofita': function () { return svg(chao() + '<path ' + CHEIO + ' d="M60 92 C48 96 46 110 60 112 C74 110 72 96 60 92 Z"/><path ' + TRACO + ' d="M60 92 L60 40 M60 60 L48 50 M60 54 L72 44"/>' + gema(60, 100)); },
    'r-terofita': function () { return svg(chao() + '<path ' + TRACO + ' stroke-dasharray="3 4" d="M60 86 L60 42 M60 60 L46 50 M60 54 L74 44"/><ellipse cx="60" cy="83" rx="5" ry="3" fill="currentColor"/>'); },
    'p-remige': function () { return pena(-.18, 1.9, .7, 104); },
    'p-retriz': function () { return pena(0, 1.25, 1.25, 104); },
    'p-contorno': function () { return pena(0, 1.6, 1.6, 74, true); },
    'p-penugem': function () { var s = ''; for (var i = 0; i < 22; i++) { var a = i / 22 * 2 * Math.PI, r = 24 + (i % 3) * 7; s += 'M60 84 Q' + (60 + r * .5 * Math.cos(a + .6)).toFixed(1) + ' ' + (60 + r * .5 * Math.sin(a + .6)).toFixed(1) + ' ' + (60 + r * Math.cos(a)).toFixed(1) + ' ' + (60 + r * Math.sin(a)).toFixed(1) + ' '; } return svg('<path ' + TRACO + ' stroke-width="1" d="' + s + '"/><path ' + TRACO + ' d="M60 84 L60 112"/>'); },
    'p-filopluma': function () { var s = '<path ' + TRACO + ' d="M60 114 C60 80 61 50 62 22"/>'; for (var i = 0; i < 9; i++) { var a = -1.2 + i * .3; s += '<path ' + TRACO + ' stroke-width="1" d="M62 22 L' + (62 + 12 * Math.sin(a)).toFixed(1) + ' ' + (22 - 12 * Math.cos(a)).toFixed(1) + '"/>'; } return svg(s); },
    'p-cerda': function () { return svg('<path ' + TRACO + ' stroke-width="2.4" d="M60 114 L60 18"/><path ' + TRACO + ' stroke-width="1" d="M60 100 L50 92 M60 100 L70 92 M60 92 L53 86 M60 92 L67 86"/>'); },
    'p-po': function () { var s = pena(0, 1.3, 1.3, 70, false, true), p = ''; for (var i = 0; i < 26; i++) { var x = 26 + (i * 37 % 68), y = 18 + (i * 53 % 30); p += '<circle cx="' + x + '" cy="' + y + '" r="1.1" fill="currentColor"/>'; } return s.replace('</svg>', p + '</svg>'); },
    'p-partes': function () {
      var s = pena(0, 1.5, 1.5, 96, false, true).replace(/<\/?svg[^>]*>/g, '');
      var r = function (x1, y1, x2, y2, t, ancora) { return '<path ' + TRACO + ' stroke-width=".8" d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + '"/><text x="' + x2 + '" y="' + (y2 + 3) + '" class="vd-d-rot" text-anchor="' + (ancora || 'start') + '">' + t + '</text>'; };
      return svg('<g transform="translate(-14 0)">' + s + '</g>' + r(46, 108, 70, 112, 'cálamo') + r(46, 60, 72, 66, 'ráquis') + r(30, 40, 72, 30, 'barbas') + r(60, 22, 74, 14, 'bandeira'), '0 0 120 120');
    },
    's-assimetrico': function () { return svg('<path ' + CHEIO + ' d="M42 104 C26 96 30 74 36 60 C40 46 32 30 46 22 C58 16 64 30 72 34 C88 40 94 54 88 70 C84 82 92 96 78 104 C66 110 54 108 42 104 Z"/><circle ' + TRACO + ' cx="56" cy="46" r="4"/><circle ' + TRACO + ' cx="66" cy="72" r="3"/><circle ' + TRACO + ' cx="48" cy="82" r="3.4"/>'); },
    's-radial': function () { var r = ''; for (var i = 0; i < 8; i++) { var a = i / 8 * 2 * Math.PI; r += 'M60 60 L' + (60 + 40 * Math.cos(a)).toFixed(1) + ' ' + (60 + 40 * Math.sin(a)).toFixed(1) + ' '; } return svg('<circle ' + CHEIO + ' cx="60" cy="60" r="42"/><path ' + TRACO + ' stroke-dasharray="2 3" d="' + r + '"/><circle ' + TRACO + ' cx="60" cy="60" r="10"/>'); },
    's-birradial': function () { return svg('<ellipse ' + CHEIO + ' cx="60" cy="60" rx="30" ry="44"/><path ' + TRACO + ' stroke-dasharray="2 3" d="M60 10 L60 110 M24 60 L96 60"/><path ' + TRACO + ' d="M42 30 L42 90 M78 30 L78 90"/>'); },
    's-pentarradial': function () { return svg(estrela(5, 46, 15)); },
    's-bilateral': function () { return svg('<path ' + CHEIO + ' d="M60 14 C74 14 80 26 78 40 C76 50 90 58 96 72 C100 84 88 92 78 86 C72 98 68 110 60 110 C52 110 48 98 42 86 C32 92 20 84 24 72 C30 58 44 50 42 40 C40 26 46 14 60 14 Z"/><path ' + TRACO + ' stroke-dasharray="3 3" d="M60 6 L60 116"/>'); },
    's-esferica': function () { var r = ''; for (var i = 0; i < 16; i++) { var a = i / 16 * 2 * Math.PI; r += '<circle cx="' + (60 + 30 * Math.cos(a)).toFixed(1) + '" cy="' + (60 + 30 * Math.sin(a)).toFixed(1) + '" r="1.6" fill="currentColor"/>'; } return svg('<circle ' + CHEIO + ' cx="60" cy="60" r="44"/><circle ' + TRACO + ' cx="60" cy="60" r="18"/>' + r); },
    'ge-espiral': function () { var s = ''; for (var i = 1; i <= 240; i++) { var a = i * 137.508 * Math.PI / 180, r = 3.5 * Math.sqrt(i); s += '<circle cx="' + (60 + r * Math.cos(a)).toFixed(1) + '" cy="' + (60 + r * Math.sin(a)).toFixed(1) + '" r="' + (.8 + i / 240 * 1.6).toFixed(2) + '" fill="currentColor"/>'; } return svg(s); },
    'ge-fractal': function () {
      var x = 0, y = 0, d = '', semente = 7;
      var rnd = function () { semente = (semente * 16807) % 2147483647; return semente / 2147483647; };
      for (var i = 0; i < 5200; i++) {
        var r = rnd(), nx, ny;
        if (r < .01) { nx = 0; ny = .16 * y; } else if (r < .86) { nx = .85 * x + .04 * y; ny = -.04 * x + .85 * y + 1.6; } else if (r < .93) { nx = .2 * x - .26 * y; ny = .23 * x + .22 * y + 1.6; } else { nx = -.15 * x + .28 * y; ny = .26 * x + .24 * y + .44; }
        x = nx; y = ny; if (i > 20) d += 'M' + (60 + x * 10.4).toFixed(1) + ' ' + (114 - y * 10.4).toFixed(1) + 'h.6';
      }
      return svg('<path d="' + d + '" stroke="currentColor" stroke-width=".9" stroke-linecap="round" fill="none"/>');
    },
    'ge-hexagono': function () { var s = '', R = 11, h = R * Math.sqrt(3); for (var col = -1; col < 7; col++) for (var lin = -1; lin < 7; lin++) { var cx = col * R * 1.5 + 6, cy = lin * h + (col % 2 ? h / 2 : 0) + 4, p = []; for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3; p.push((cx + R * Math.cos(a)).toFixed(1) + ' ' + (cy + R * Math.sin(a)).toFixed(1)); } s += '<path ' + TRACO + ' d="M' + p.join(' L') + ' Z"/>'; } return svg(s); },
    'ge-radial': function () { return svg(estrela(5, 46, 15)); },
  };
  function chao() { return '<path ' + TRACO + ' d="M8 86 L112 86"/><path stroke="currentColor" stroke-width=".7" d="M14 92 L22 86 M30 92 L38 86 M46 92 L54 86 M66 92 L74 86 M82 92 L90 86 M98 92 L106 86"/>'; }
  function gema(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="currentColor"/><circle cx="' + x + '" cy="' + y + '" r="7.5" fill="none" stroke="currentColor" stroke-width="1"/>'; }
  function regua(y) { return '<path ' + TRACO + ' stroke-width=".8" stroke-dasharray="2 2" d="M100 86 L100 ' + y + ' M96 ' + y + ' L104 ' + y + '"/>'; }
  function estrela(pontas, R, r) { var p = []; for (var i = 0; i < pontas * 2; i++) { var a = -Math.PI / 2 + i * Math.PI / pontas, rr = i % 2 ? r : R; p.push((60 + rr * Math.cos(a)).toFixed(1) + ' ' + (62 + rr * Math.sin(a)).toFixed(1)); } return '<path ' + CHEIO + ' d="M' + p.join(' L') + ' Z"/><circle ' + TRACO + ' cx="60" cy="62" r="6"/>'; }
  /* uma pena: a ráquis, a bandeira (larguras dos dois lados) e as barbas; penugem na base, se pedir */
  function pena(curv, esq, dir, comp, felpuda, semSvg) {
    var base = 114, topo = base - comp, s = '', barbas = '';
    var w = function (t, k) { return 11 * k * Math.sin(Math.PI * Math.min(1, t * 1.15)) * Math.pow(1 - t, .25); };
    var cx = function (t) { return 60 + curv * 60 * t * t; };
    var e = [], d = [];
    for (var i = 0; i <= 60; i++) { var t = .12 + .88 * i / 60, y = base - comp * t; e.push([cx(t) - w(t, esq), y]); d.push([cx(t) + w(t, dir), y]); }
    var pts = e.concat(d.reverse());
    s += '<path ' + CHEIO + ' d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z"/>';
    for (var j = 1; j < 18; j++) { var tt = .14 + j / 18 * .84, yy = base - comp * tt, xx = cx(tt); barbas += 'M' + xx.toFixed(1) + ' ' + yy.toFixed(1) + ' L' + (xx - w(tt, esq) * .96).toFixed(1) + ' ' + (yy - 6).toFixed(1) + ' M' + xx.toFixed(1) + ' ' + yy.toFixed(1) + ' L' + (xx + w(tt, dir) * .96).toFixed(1) + ' ' + (yy - 6).toFixed(1) + ' '; }
    s += '<path ' + TRACO + ' stroke-width=".7" d="' + barbas + '"/>';
    if (felpuda) { var f = ''; for (var k = 0; k < 12; k++) { var yb = base - comp * (.1 + k * .012), lado = k % 2 ? 1 : -1; f += 'M' + cx(.1).toFixed(1) + ' ' + yb.toFixed(1) + ' q' + (lado * 8) + ' -4 ' + (lado * 14) + ' ' + (2 - k % 3 * 3) + ' '; } s += '<path ' + TRACO + ' stroke-width=".8" d="' + f + '"/>'; }
    var raq = []; for (var q = 0; q <= 30; q++) { var tq = q / 30; raq.push(cx(tq).toFixed(1) + ' ' + (base - comp * tq).toFixed(1)); }
    s += '<path ' + TRACO + ' stroke-width="1.8" d="M' + raq.join(' L') + '"/>';
    return semSvg ? svg(s) : svg(s);
  }

  /* ---------- a seção das formas ---------- */
  function secFormas() {
    var abas = Object.keys(V.formas);
    return '<section class="vd-sec" id="formas" data-secao="formas" data-rotulo="As formas" aria-labelledby="vd-formas-t">' +
      '<header class="vd-cab"><div><p class="rot">As partes e as formações</p><h2 class="h2" id="vd-formas-t">As formas</h2></div>' +
        '<p class="vd-cab-nota">Folhas, galhos, penas, corpos e as geometrias que se repetem. Cada desenho é feito aqui, a partir da definição ao lado; o número leva à fonte.</p></header>' +
      '<div class="vd-formas-nav"><div class="vd-abas" role="tablist" aria-label="As formas">' + abas.map(function (k) {
        return '<button type="button" class="tab" role="tab" id="vd-aba-' + k + '" aria-controls="vd-formas-vista" aria-selected="' + (k === estado.forma) + '" data-forma="' + k + '">' + esc(V.formas[k].nome) + '</button>';
      }).join('') + '</div><div class="vd-partes" id="vd-partes" role="group" aria-label="Filtrar por parte"></div></div>' +
      '<p class="vd-formas-sub" id="vd-formas-sub"></p>' +
      '<div class="vd-formas" id="vd-formas-vista" role="tabpanel"></div>' +
    '</section>';
  }
  function pintarFormas() {
    var F = V.formas[estado.forma], partes = [];
    F.itens.forEach(function (i) { if (partes.indexOf(i[1]) < 0) partes.push(i[1]); });
    if (partes.indexOf(estado.parte) < 0) estado.parte = '';
    document.querySelectorAll('[data-forma]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-forma') === estado.forma)); });
    document.getElementById('vd-formas-sub').textContent = F.sub.charAt(0).toUpperCase() + F.sub.slice(1) + '.';
    document.getElementById('vd-partes').innerHTML = partes.length > 1 ? ['<button type="button" class="chip" data-parte="" aria-pressed="' + (estado.parte === '') + '">Todas</button>'].concat(partes.map(function (p) {
      return '<button type="button" class="chip" data-parte="' + esc(p) + '" aria-pressed="' + (estado.parte === p) + '">' + esc(p) + '</button>';
    })).join('') : '';
    var itens = F.itens.filter(function (i) { return !estado.parte || i[1] === estado.parte; });
    document.getElementById('vd-formas-vista').innerHTML = itens.map(function (i, k) {
      var d = DESENHOS[i[0]];
      return '<figure class="vd-forma" style="--k:' + k + '"><div class="vd-desenho">' + (d ? d() : '') + '</div><figcaption><span class="vd-parte">' + esc(i[1]) + '</span><b>' + esc(i[2]) + '</b><span>' + esc(i[3]) + fonteLink(i[4]) + '</span></figcaption></figure>';
    }).join('');
  }

  /* ---------- as origens: uma régua logarítmica e a lista ---------- */
  function tempoTxt(m) {
    var f = function (v) { return v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : v.toLocaleString('pt-BR'); };
    if (Array.isArray(m)) { var bi = m[0] >= 1000; return 'há ' + f(m[0]) + ' a ' + f(m[1]) + (bi ? ' bilhões de anos' : ' milhões de anos'); }
    return 'há ' + f(m) + (m >= 1000 ? (m < 2000 ? ' bilhão de anos' : ' bilhões de anos') : ' milhões de anos');
  }
  function secOrigens() {
    var max = 4300, min = 10, W = 1000, H = 120;
    var xDe = function (m) { return W - (Math.log(m) - Math.log(min)) / (Math.log(max) - Math.log(min)) * W; };
    var marcas = [4000, 2000, 1000, 500, 200, 100, 50, 20];
    var pontos = ORIG.map(function (o, i) { var m = Array.isArray(o[0]) ? (o[0][0] + o[0][1]) / 2 : o[0]; return { x: xDe(m), o: o, i: i }; });
    var regua = '<svg class="vd-regua" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">' +
      '<line x1="0" y1="70" x2="' + W + '" y2="70" class="vd-regua-l"/>' +
      marcas.map(function (m) { var x = xDe(m); return '<line x1="' + x.toFixed(1) + '" y1="64" x2="' + x.toFixed(1) + '" y2="76" class="vd-regua-l"/><text x="' + x.toFixed(1) + '" y="96" class="vd-regua-t" text-anchor="middle">' + (m >= 1000 ? (m / 1000) + ' bi' : m + ' mi') + '</text>'; }).join('') +
      pontos.map(function (p) { return '<circle cx="' + p.x.toFixed(1) + '" cy="70" r="5" class="vd-regua-p" data-orig="' + p.i + '"/>'; }).join('') +
      '<text x="' + W + '" y="40" class="vd-regua-t" text-anchor="end">agora →</text><text x="0" y="40" class="vd-regua-t">← a Terra tem 4,5 bilhões de anos</text></svg>';
    return '<section class="vd-sec" id="origens" data-secao="origens" data-rotulo="As origens" aria-labelledby="vd-origens-t">' +
      '<header class="vd-cab"><div><p class="rot">Quando cada grupo aparece</p><h2 class="h2" id="vd-origens-t">As origens</h2></div>' +
        '<p class="vd-cab-nota">Na régua, cada passo para a direita encolhe o tempo dez vezes (escala logarítmica): o começo da vida, à esquerda, e as gramíneas, à direita.</p></header>' +
      '<div class="vd-regua-caixa">' + regua + '</div>' +
      '<ol class="vd-origens">' + ORIG.map(function (o, i) {
        var g = o[2] && porNome[o[2]];
        return '<li id="orig-' + i + '"><span class="vd-o-t">' + tempoTxt(o[0]) + '</span><span class="vd-o-txt">' + esc(o[1]) + fonteLink(o[3]) + '</span>' +
          (g ? '<button type="button" class="vd-link" data-ir="' + g[0] + '">' + esc(nomeDe(g)) + ' na árvore</button>' : '<span></span>') + '</li>';
      }).join('') + '</ol>' +
    '</section>';
  }
  function secFontes() {
    var ks = Object.keys(V.fontes);
    return '<section class="vd-sec" id="fontes-vida" data-secao="fontes" data-rotulo="As fontes" aria-labelledby="vd-fontes-t">' +
      '<header class="vd-cab"><div><p class="rot">De onde vem cada frase</p><h2 class="h2" id="vd-fontes-t">As fontes</h2></div>' +
        '<p class="vd-cab-nota">Conferidas no texto de cada fonte em 22 de outubro de 2026. As contagens são de espécies descritas: a ciência estima que muitas mais esperam descrição.</p></header>' +
      '<ol class="vd-fontes">' + ks.map(function (k) { var f = V.fontes[k]; return '<li id="fonte-' + k + '"><a href="' + esc(f[1]) + '" target="_blank" rel="noopener">' + esc(f[0]) + '</a><span>' + esc(f[2]) + '</span></li>'; }).join('') + '</ol>' +
    '</section>';
  }

  /* ================================================================
     OS GESTOS
     ================================================================ */
  raiz.addEventListener('click', function (ev) {
    var b;
    if ((b = ev.target.closest('[data-ficha]'))) { ev.preventDefault(); fichaGrupo(b.getAttribute('data-ficha')); return; }
    if ((b = ev.target.closest('[data-no]'))) {
      ev.preventDefault();
      var x = porId[b.getAttribute('data-no')];
      if (x && x[8].length) ir(x[0]); else if (x) fichaGrupo(x[0]);
      return;
    }
    if ((b = ev.target.closest('[data-ir]'))) {
      ev.preventDefault(); ir(b.getAttribute('data-ir'));
      if (b.closest('.vd-origens')) { var a = document.getElementById('arvore'); if (a) a.scrollIntoView({ behavior: CALMO ? 'auto' : 'smooth', block: 'start' }); }
      return;
    }
    if ((b = ev.target.closest('[data-lente]'))) { estado.lente = b.getAttribute('data-lente'); try { localStorage.setItem('vida-lente', estado.lente); } catch (e) {} pintarVista(); return; }
    if ((b = ev.target.closest('[data-traco]'))) {
      var id = b.getAttribute('data-traco');
      estado.traco = estado.traco === id ? null : id;
      document.querySelectorAll('[data-traco]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-traco') === estado.traco)); });
      var txt = document.getElementById('vd-traco-txt'), t = V.tracos.filter(function (x) { return x[0] === estado.traco; })[0];
      if (t) {
        var grs = t[4].map(function (nm) { return porNome[nm]; }).filter(Boolean);
        txt.innerHTML = '<b>' + esc(t[2]) + '.</b> ' + esc(t[3]) + fonteLink(t[5]) + ' <span class="vd-traco-grupos">' + grs.map(function (g) { return '<button type="button" class="vd-link" data-ir="' + (g[8].length ? g[0] : (pai[g[0]] || 'raiz')) + '">' + esc(nomeDe(g)) + '</button> (' + (g[3] ? n(g[3]) : '—') + ')'; }).join(', ') + '</span>';
      } else txt.innerHTML = '';
      pintarVista(); return;
    }
    if ((b = ev.target.closest('[data-forma]'))) { estado.forma = b.getAttribute('data-forma'); estado.parte = ''; pintarFormas(); return; }
    if ((b = ev.target.closest('[data-parte]'))) { estado.parte = b.getAttribute('data-parte'); pintarFormas(); return; }
    if ((b = ev.target.closest('[data-especie]'))) { ev.preventDefault(); fichaEspecie(JSON.parse(b.getAttribute('data-especie'))); return; }
    if ((b = ev.target.closest('.vd-regua-p'))) { var li = document.getElementById('orig-' + b.getAttribute('data-orig')); if (li) { li.scrollIntoView({ block: 'center', behavior: CALMO ? 'auto' : 'smooth' }); li.classList.add('vd-achado'); setTimeout(function () { li.classList.remove('vd-achado'); }, 2000); } }
  });
  /* as abas das formas pelas setas */
  raiz.addEventListener('keydown', function (ev) {
    var t = ev.target; if (!t.matches || !t.matches('[data-forma]') || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
    var abas = Array.prototype.slice.call(document.querySelectorAll('[data-forma]')), i = abas.indexOf(t) + (ev.key === 'ArrowRight' ? 1 : -1);
    var prox = abas[(i + abas.length) % abas.length]; prox.focus(); prox.click();
  });

  pintarTrilha(); pintarVista(); pintarFormas();
  if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
})();
