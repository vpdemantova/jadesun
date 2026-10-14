/* ============================================================
   Portal Solar · caminho.js (13/out/2026) — "O caminho de cada área", no Hoje.
   As tarefas e os guias num lugar só (pedido de 12/out: "centralizar as tarefas
   e juntar com os guias; melhorar os caminhos e pré-requisitos; listas de leitura
   mais claras").

   Em cima: as tarefas do Tarefas Simples, cada uma com o seu guia (achado na
   busca do caderno, só entre aulas e guias).
   Depois, uma linha por matéria: o anel do progresso e o próximo estudo. Aberta,
   a matéria mostra a trilha inteira (um quadrado por estudo), o próximo passo
   (o primeiro estudo cujos pré-requisitos já estão feitos, de lib/areas.mjs),
   o que vem antes e depois, o que ler (as leituras do estudo e as Grandes Obras)
   e onde aquilo vive no mundo real. "Estudar agora" leva o item ao cartão do topo.

   Dados: /api/areas?resumo=1, /api/areas?m=…, /api/tabuas-e-obras, /api/buscar.
   Só lê; o que fica aberto mora no navegador (portal-caminho).
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function ic(n) { return P.icone ? P.icone(n) : ''; }
  var CH = 'portal-caminho';
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function json(u) { return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  var pResumo = null, pObras = null, pDet = {}, pGuia = {};
  function resumo() { return pResumo || (pResumo = json('/api/areas?resumo=1').then(function (r) { if (!r) pResumo = null; return r; })); }
  function obras() { return pObras || (pObras = json('/api/tabuas-e-obras').then(function (r) { if (!r) pObras = null; return r; })); }
  function detalhe(m) { return pDet[m] || (pDet[m] = json('/api/areas?m=' + encodeURIComponent(m)).then(function (r) { if (!r) delete pDet[m]; return r; })); }

  function abertas() { try { return JSON.parse(localStorage.getItem(CH) || '{}'); } catch (e) { return {}; } }
  function marcarAberta(m, sim) { try { var a = abertas(); if (sim) a[m] = 1; else delete a[m]; localStorage.setItem(CH, JSON.stringify(a)); } catch (e) { /* ok */ } }

  /* markdown pequeno das leituras: **negrito**, *itálico* (um dentro do outro), [texto](link).
     13/out (revisão): os links saem antes e voltam no fim; só valem http(s), # e páginas .html
     (um "javascript:" vira texto); "#f=…" aponta para a Biblioteca, não para o próprio Hoje. */
  function italico(t) { return t.replace(/(^|[^*])\*(?=\S)([^*\n]*?\S)\*/g, '$1<em>$2</em>'); }
  function negritoItalico(t) {
    return italico(t
      .replace(/\*\*\*([^*]+)\*\*\*/g, '<b><em>$1</em></b>')
      .replace(/\*\*((?:[^*]|\*[^*]+\*)+?)\*\*/g, function (m, c) { return '<b>' + italico(c) + '</b>'; }));
  }
  function md(s) {
    var links = [];
    var t = String(s || '').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, h) { links.push([txt, h]); return '\u0000' + (links.length - 1) + '\u0000'; });
    t = negritoItalico(esc(t));
    return t.replace(/\u0000(\d+)\u0000/g, function (m, k) {
      var l = links[+k], h = l[1].replace(/^#f=/, 'biblioteca.html#f=');
      var seguro = /^(https?:\/\/|#|[\w][\w.\/-]*\.html([?#]\S*)?$)/i.test(h);
      var txt = negritoItalico(esc(l[0]));
      return seguro ? '<a href="' + esc(h) + '">' + txt + '</a>' : txt;
    });
  }
  function corta(s, n) { s = String(s || ''); if (s.length <= n) return s; var k = s.lastIndexOf(' ', n); return s.slice(0, k > n * 0.6 ? k : n) + '…'; }
  function ficha(id) { return 'biblioteca.html#f=' + encodeURI(id); }

  /* ── as tarefas, cada uma com o seu guia ── */
  function guiaDe(t) {
    var chave = norm(t.area);
    if (pGuia[chave]) return pGuia[chave];
    var q = t.area.replace(/\s*\/.*$/, '');
    pGuia[chave] = json('/api/buscar?q=' + encodeURIComponent(q)).then(function (r) {
      var lista = r ? (r.resultados || r.itens || r) : [];
      if (!Array.isArray(lista)) return null;
      /* só vale como guia se a palavra da tarefa aparece no título ou no começo do texto */
      var palavras = norm(q).split(' ').filter(function (w) { return w.length > 2; });
      return lista.filter(function (x) {
        if (!x || (x.acervo !== 'aulas' && x.acervo !== 'guias')) return false;
        var t = norm((x.titulo || '') + ' ' + (x.trecho || ''));
        return palavras.some(function (w) { return t.indexOf(w) >= 0; });
      })[0] || null;
    });
    return pGuia[chave];
  }
  function htmlTarefas(e) {
    var ts = (e.tarefas || []).filter(function (t) { return t && t.tarefa; });
    if (!ts.length) return '';
    return '<div class="hc-tarefas" role="list" aria-label="As tarefas de hoje, com o guia">' + ts.map(function (t, i) {
      var pausada = /pausad/i.test(t.tarefa);
      var vest = /vestibular/i.test(t.area);
      return '<article class="hc-t' + (pausada ? ' pausada' : '') + '" role="listitem" data-t="' + i + '">' +
        '<p class="hc-t-area">' + esc(t.area) + (t.tempo && t.tempo !== '—' ? ' <span>' + esc(t.tempo) + '</span>' : '') + '</p>' +
        '<p class="hc-t-txt">' + esc(t.tarefa) + '</p>' +
        '<p class="hc-t-guia">' + (vest ? '<a href="#ag-principal">' + ic('seta-cima') + 'O estudo de agora, lá em cima</a>' : pausada ? '<span>Volta depois da prova.</span>' : '<span class="hc-t-busca">procurando o guia…</span>') + '</p>' +
      '</article>';
    }).join('') + '</div>';
  }
  function ligarGuias(el, e) {
    (e.tarefas || []).forEach(function (t, i) {
      if (!t || !t.tarefa || /pausad/i.test(t.tarefa) || /vestibular/i.test(t.area)) return;
      guiaDe(t).then(function (g) {
        var alvo = el.querySelector('.hc-t[data-t="' + i + '"] .hc-t-guia');
        if (!alvo) return;
        alvo.innerHTML = g ? '<a href="' + ficha(g.id) + '">' + ic('livro') + 'O guia: ' + esc(g.titulo) + '</a>' : '<span>Sem guia no caderno ainda.</span>';
      });
    });
  }

  /* ── uma linha por matéria ── */
  function htmlMateria(s, i, R, hojeM, aberta) {
    var r = R && R.materias ? R.materias[s.nome] : null;
    var prox = r && r.proximo;
    var p = s.total ? s.feitos / s.total : 0;
    /* a cor da matéria é uma classe (lin, his, geo…) que define --c, como no resto do Portal */
    var cor = P.corDe ? P.corDe(s.nome) : '';
    return '<li class="hc-m ' + esc(cor) + (hojeM === s.nome ? ' hoje' : '') + '" data-m="' + esc(s.nome) + '" style="--p:' + p.toFixed(3) + '">' +
      '<button type="button" class="hc-m-cab" aria-expanded="' + aberta + '" aria-controls="hc-c-' + i + '">' +
        '<span class="hc-anel" aria-hidden="true"></span>' +
        '<span class="hc-m-nome">' + esc(s.nome) + (hojeM === s.nome ? ' <i class="hc-hoje">no roteiro de hoje</i>' : '') + '</span>' +
        '<span class="hc-m-n">' + s.feitos + ' / ' + s.total + '</span>' +
        '<span class="hc-m-prox">' + (prox ? (prox.codigo ? '<b>' + esc(prox.codigo) + '</b> ' : '') + esc(prox.titulo || '') : s.feitos === s.total && s.total ? 'Tudo dominado.' : '') + '</span>' +
        '<span class="hc-seta" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="hc-m-corpo" id="hc-c-' + i + '"' + (aberta ? '' : ' hidden') + '><p class="rot suave">Abrindo…</p></div>' +
    '</li>';
  }

  function htmlCorpo(s, d, O, contagem) {
    if (!d || !d.nos) return '<p class="hc-vazio">Esta matéria ainda não tem estudos ligados no caderno.</p>';
    var por = {}; d.nos.forEach(function (n) { por[n.codigo] = n; });
    var prox = d.proximo && por[d.proximo.codigo];
    var trilha = (d.caminho || []).map(function (c) {
      var n = por[c]; if (!n) return '';
      return '<a class="hc-q ' + n.situacao + (prox && n.codigo === prox.codigo ? ' prox' : '') + '" href="' + ficha(n.id) + '" title="' + esc(n.codigo + ' · ' + n.titulo) + '" aria-label="' + esc(n.codigo + ', ' + n.titulo + ', ' + ({ dominado: 'dominado', parcial: 'começado', pendente: 'a estudar', 'sem-item': 'sem item no Checklist' }[n.situacao] || '')) + '"></a>';
    }).join('');
    var faltam = s.total - s.feitos;
    var sentido = s.total ? (faltam ? 'Faltam <b>' + faltam + '</b> de ' + s.total + ' itens. Hoje, um passo.' : 'Tudo dominado. Agora é revisar com as cartas.') : '';
    if (contagem && contagem.fase === 'dentro' && contagem.faltam > 0 && faltam) sentido += ' <span>Até a prova: ' + contagem.faltam + ' dia' + (contagem.faltam === 1 ? '' : 's') + '.</span>';

    var h = '<div class="hc-trilha" role="group" aria-label="A trilha de ' + esc(s.nome) + ', na ordem dos pré-requisitos">' + trilha + '</div>' +
      '<p class="hc-legenda"><i class="hc-q dominado"></i>dominado <i class="hc-q parcial"></i>começado <i class="hc-q pendente"></i>a estudar <i class="hc-q prox"></i>o próximo</p>' +
      (sentido ? '<p class="hc-sentido">' + sentido + '</p>' : '');
    if (!prox) return h + '<p class="hc-vazio">Nenhum estudo pendente com pré-requisitos prontos.</p>';

    var itemLivre = (prox.itens || []).filter(function (x) { return !x.feito; })[0];
    var antes = (prox.pre || []).map(function (c) { var n = por[c]; return n ? '<li class="' + n.situacao + '"><a href="' + ficha(n.id) + '"><b>' + esc(n.codigo) + '</b> ' + esc(n.titulo) + '</a></li>' : ''; }).join('');
    var depois = (prox.abre || []).map(function (c) { var n = por[c]; return n ? '<li><a href="' + ficha(n.id) + '"><b>' + esc(n.codigo) + '</b> ' + esc(n.titulo) + '</a></li>' : ''; }).join('');
    var leit = (d.leituras || []).filter(function (l) { return l.codigo === prox.codigo; })[0];
    var mundo = (d.mundo || []).filter(function (l) { return l.codigo === prox.codigo; })[0];
    var ob = O && O.materias && O.materias[s.nome] ? (O.materias[s.nome].obras || []) : [];
    var mundoLinha = mundo ? String(mundo.md || '').split(/\n/).filter(function (l) { return l.trim(); })[0] || '' : '';

    h += '<div class="hc-grade">' +
      '<section class="hc-passo" aria-label="O próximo passo">' +
        '<p class="hc-rot">O próximo passo</p>' +
        '<h4><a href="' + ficha(prox.id) + '"><b>' + esc(prox.codigo) + '</b> ' + esc(prox.titulo) + '</a></h4>' +
        (prox.frase ? '<p class="hc-frase">' + md(prox.frase) + '</p>' : '') +
        '<p class="hc-meta">' + [prox.unidade, prox.prioridade ? 'prioridade ' + prox.prioridade : '', prox.exercicios ? prox.exercicios + ' exercícios com gabarito' : ''].filter(Boolean).map(esc).join(' · ') + '</p>' +
        (itemLivre ? '<p class="hc-item"><span class="hc-rot">No Checklist</span>' + esc(itemLivre.texto) + '</p>' : '') +
        '<div class="hc-acoes">' +
          (itemLivre ? '<button type="button" class="hc-b hc-b-forte" data-estudar="' + esc(itemLivre.texto) + '">' + ic('alvo') + 'Estudar agora</button>' : '') +
          '<a class="hc-b" href="' + ficha(prox.id) + '">' + ic('livro') + 'Ler no leitor</a>' +
          '<button type="button" class="hc-b" data-cartas="1">' + ic('baralho') + 'Cartas</button>' +
          '<a class="hc-b" href="area.html?m=' + encodeURIComponent(s.nome) + '">' + ic('mapa') + 'A área inteira</a>' +
        '</div>' +
      '</section>' +
      '<section class="hc-antes" aria-label="O que vem antes e depois">' +
        '<p class="hc-rot">Antes, saiba</p>' + (antes ? '<ul class="hc-lista">' + antes + '</ul>' : '<p class="hc-nada">Nada: este estudo é uma porta de entrada.</p>') +
        (depois ? '<p class="hc-rot">Depois, ele abre</p><ul class="hc-lista">' + depois + '</ul>' : '') +
      '</section>' +
      '<section class="hc-ler" aria-label="O que ler">' +
        '<p class="hc-rot">Para ler</p>' +
        (leit ? '<p class="hc-leit">' + md(corta(leit.md, 420)) + '</p>' : '') +
        (ob.length ? '<p class="hc-rot hc-rot-2">As Grandes Obras de ' + esc(s.nome) + '</p><ul class="hc-obras">' + ob.slice(0, 3).map(function (o) {
          return '<li><a href="' + ficha(o.id) + '"><b>' + esc(o.obra || o.titulo) + '</b> <span>' + esc([o.autor, o.ano].filter(Boolean).join(', ')) + '</span></a></li>';
        }).join('') + (ob.length > 3 ? '<li class="hc-mais"><a href="area.html?m=' + encodeURIComponent(s.nome) + '">e mais ' + (ob.length - 3) + ' na área</a></li>' : '') + '</ul>' : '') +
        (!leit && !ob.length ? '<p class="hc-nada">Sem lista de leitura ainda.</p>' : '') +
      '</section>' +
      (mundoLinha ? '<section class="hc-mundo" aria-label="Onde isso vive no mundo"><p class="hc-rot">Onde isso vive no mundo</p><p>' + md(mundoLinha.replace(/^[-*]\s*/, '')) + '</p></section>' : '') +
    '</div>';
    return h;
  }

  function montar(el, e, op) {
    if (!el) return;
    op = op || {};
    var ab = abertas();
    var hojeM = op.alvo || '';
    if (hojeM && !(hojeM in ab) && !Object.keys(ab).length) ab[hojeM] = 1;
    var contagem = P.contagem ? P.contagem(e) : null;
    el.innerHTML =
      '<header class="hc-cab"><p class="rot">O caminho de cada área</p>' +
        '<h2 class="h3">Uma tarefa por área, com o guia ao lado</h2>' +
        '<p class="hc-lead">Primeiro as tarefas de hoje. Depois, cada matéria com o próximo estudo (o primeiro cujos pré-requisitos você já tem), o que vem antes, o que ler e onde aquilo vive no mundo. Toque numa matéria para abrir.</p></header>' +
      htmlTarefas(e) +
      '<ol class="hc-materias" aria-label="As matérias">' + (e.checklist || []).map(function (s, i) { return htmlMateria(s, i, null, hojeM, !!ab[s.nome]); }).join('') + '</ol>';
    ligarGuias(el, e);

    function preencher(li) {
      var m = li.getAttribute('data-m');
      var s = (e.checklist || []).filter(function (x) { return x.nome === m; })[0];
      var corpo = li.querySelector('.hc-m-corpo');
      Promise.all([detalhe(m), obras()]).then(function (r) {
        if (!r[0]) { corpo.innerHTML = '<p class="hc-vazio">Não consegui falar com o servidor. <button type="button" class="hc-b" data-tentar="1">Tentar de novo</button></p>'; return; }
        var d = r[0].materias ? r[0].materias[m] : r[0];
        corpo.innerHTML = htmlCorpo(s, d, r[1], contagem);
        corpo.dataset.pronto = '1';
      });
    }
    /* o resumo chega depois: o próximo estudo de cada matéria entra na linha */
    resumo().then(function (R) {
      if (!R || !document.body.contains(el)) return;
      (e.checklist || []).forEach(function (s) {
        var li = el.querySelector('.hc-m[data-m="' + CSS.escape(s.nome) + '"] .hc-m-prox');
        var r = R.materias && R.materias[s.nome];
        if (li && r && r.proximo) li.innerHTML = (r.proximo.codigo ? '<b>' + esc(r.proximo.codigo) + '</b> ' : '') + esc(r.proximo.titulo || '');
      });
    });
    el.querySelectorAll('.hc-m').forEach(function (li) { if (!li.querySelector('.hc-m-corpo').hidden) preencher(li); });

    el.addEventListener('click', function (ev) {
      var cab = ev.target.closest('.hc-m-cab');
      if (cab) {
        var li = cab.parentNode, corpo = li.querySelector('.hc-m-corpo');
        var abrir = corpo.hidden;
        corpo.hidden = !abrir; cab.setAttribute('aria-expanded', String(abrir));
        marcarAberta(li.getAttribute('data-m'), abrir);
        if (abrir && !corpo.dataset.pronto) preencher(li);
        if (abrir && !REDUZIR && corpo.animate) corpo.animate([{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
        return;
      }
      var tt = ev.target.closest('[data-tentar]');
      if (tt) { preencher(tt.closest('.hc-m')); return; }
      var b = ev.target.closest('[data-estudar]');
      if (b && op.estudar) { op.estudar(b.closest('.hc-m').getAttribute('data-m'), b.getAttribute('data-estudar')); return; }
      var c = ev.target.closest('[data-cartas]');
      if (c && op.cartas) { op.cartas(c.closest('.hc-m').getAttribute('data-m')); }
    });
  }

  window.Caminho = { montar: montar };
})();
