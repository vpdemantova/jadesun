/* ============================================================
   DOMÍNIO — O MAPA GERAL (09/out/2026, PERFIL.md item 74)
   "O guia de estudos não é cronograma nem lista: é o mapa geral e os domínios que eu vou
   marcando. Os domínios precisam de várias views, 6 diferentes, na disposição dos títulos
   (as matérias grandes, uma abaixo da outra) e de cada conteúdo dentro delas. Expanda os
   filtros, tópicos e subtópicos: o mapa completo." E: "Domínio e Áreas integrados, com o
   menu que passa pelos tópicos fixos, e um dentro da área pra voltar e marcar os domínios."

   COMPONENTE (não lê a URL):
     Dominio.montar(el, { so: 'Química' | null, embutido })  → o mapa, com barra de vistas e filtros
     Dominio.trilho(el, { atual: 'Química' | null, modo: 'dominio' | 'area' }) → o menu fixo das matérias
     Dominio.estudo(codigo)        → abre a folha do estudo (conceitos e itens para marcar)
     Dominio.blocoEstudo(el, cod)  → os conceitos e itens de um estudo, marcáveis (painel da Área)
     Dominio.carregar(), Dominio.marcarConceitos(est, nomes, feito), Dominio.marcarItem(mat, item, feito)

   Os níveis: matéria → unidade → estudo (tópico) → conceito (subtópico) → item da prova.
   Marcas: os conceitos no arquivo "Domínio — conceitos.md" do caderno (lib/dominio.mjs);
   os itens no Checklist, como sempre (/api/marcar). Um estudo está dominado quando todos os
   seus conceitos e itens estão marcados.
   As seis vistas: Mapa · Índice · Mosaico · Linhas · Constelação · Sol.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function slug(t) { return norm(t).replace(/ /g, '-'); }
  function corDe(n) { return P ? P.corDe(n) : 'ing'; }
  function pct(f) { return Math.round((f || 0) * 100) + '%'; }
  function ler(k, padrao) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? padrao : v; } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } }
  function mov() { return document.documentElement.getAttribute('data-mov') === 'off' ? 'auto' : 'smooth'; }
  function md(t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  var H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };
  var ORDEM = ['Linguagens', 'História', 'Geografia', 'Química', 'Biologia', 'Matemática', 'Física', 'Filosofia', 'Sociologia'];

  var VISTAS = [
    ['mapa', 'Mapa', 'As unidades em faixas; os estudos em cartões, com os conceitos para marcar',
      '<rect x="3" y="4" width="8" height="7"/><rect x="13" y="4" width="8" height="7"/><rect x="3" y="13" width="8" height="7"/><rect x="13" y="13" width="8" height="7"/>'],
    ['indice', 'Índice', 'Como o sumário de um livro: linha a linha, do estudo ao subtópico',
      '<path d="M4 5.5h16M7 10h13M7 14h13M4 18.5h16"/><path class="f" d="M3 9h2v2H3zM3 13h2v2H3z"/>'],
    ['mosaico', 'Mosaico', 'Um quadrado por conceito: o tamanho do todo, de uma vez',
      '<path class="f" d="M3 3h5v5H3zM9.5 3h5v5h-5zM16 3h5v5h-5zM3 9.5h5v5H3zM16 9.5h5v5h-5zM9.5 16h5v5h-5z"/><path d="M10 10h4v4h-4zM3.5 16.5h4v4h-4zM16.5 16.5h4v4h-4z"/>'],
    ['linhas', 'Linhas', 'Cada matéria é uma linha de metrô; os estudos são as estações, na ordem do caminho',
      '<path d="M2.5 8h19M2.5 16h19"/><circle class="f" cx="7" cy="8" r="2.2"/><circle cx="14" cy="8" r="2.2"/><circle class="f" cx="10" cy="16" r="2.2"/><circle cx="18" cy="16" r="2.2"/>'],
    ['constelacao', 'Constelação', 'Os estudos como estrelas; as linhas são os pré-requisitos',
      '<path d="M5 18 10 9l5 6 4-10"/><circle class="f" cx="5" cy="18" r="2"/><circle class="f" cx="10" cy="9" r="2"/><circle class="f" cx="15" cy="15" r="2"/><circle class="f" cx="19" cy="5" r="2"/>'],
    ['sol', 'Sol', 'Tudo num círculo: matérias, unidades, estudos e conceitos, do centro para fora',
      '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.2"/><circle cx="12" cy="12" r="9.4"/><path d="M12 2.6v6.2M21.4 12h-6.2"/>'],
  ];
  var MOSTRAR = [['estudos', 'Estudos'], ['conceitos', '+ Subtópicos'], ['itens', '+ Itens da prova']];
  var SITUACOES = [['todos', 'Tudo'], ['falta', 'A estudar'], ['parcial', 'Em parte'], ['dominado', 'Dominado']];
  var ROTULO_SIT = { falta: 'a estudar', parcial: 'em parte', dominado: 'dominado', vazio: 'sem subtópicos' };

  /* ======================= o modelo ======================= */
  var modelo = null, pendente = null;
  function ok(r) { if (!r.ok) throw new Error('O servidor respondeu ' + r.status); return r.json(); }
  function carregar(forcar) {
    if (modelo && !forcar) return Promise.resolve(modelo);
    if (pendente) return pendente;
    pendente = Promise.all([
      P.estado(!!forcar),
      fetch('/api/areas?mapa=1', { cache: 'no-store' }).then(ok),
      fetch('/api/dominio', { cache: 'no-store' }).then(ok).catch(function () { return { existe: false, marcas: {} }; }),
    ]).then(function (r) { pendente = null; modelo = construir(r[0], r[1], r[2]); return modelo; }, function (e) { pendente = null; throw e; });
    return pendente;
  }

  function construir(e, A, D) {
    var marcas = D.marcas || {}, porCodigo = {};
    var porSecao = {}; (e.checklist || []).forEach(function (s, i) { porSecao[s.nome] = s; s._i = i; });
    var materias = ORDEM.filter(function (n) { return A.materias && A.materias[n]; }).map(function (nome) {
      var a = A.materias[nome], s = porSecao[nome] || { itens: [], nota: '' };
      var porTexto = {}; s.itens.forEach(function (it) { porTexto[it.texto] = it; });
      var usados = {};
      var estudos = (a.nos || []).map(function (n) {
        var mc = marcas[n.codigo] || {};
        var est = {
          codigo: n.codigo, id: n.id, titulo: n.titulo, unidade: n.unidade, uOrdem: n.uOrdem, frase: n.frase || '', programa: n.programa || '',
          prioridade: n.prioridade || '', pre: n.pre || [], abre: n.abre || [], lado: n.lado || [], fora: n.fora || [], nivel: n.nivel || 0,
          exercicios: n.exercicios || 0, capa: n.capa || '', museu: n.museu || 0, praticas: n.praticas || 0, materia: nome,
          conceitos: (n.conceitos || []).map(function (c) { return { nome: c, feito: !!mc[c], data: mc[c] || '' }; }),
          itens: (n.itens || []).map(function (x) { usados[x.texto] = true; return porTexto[x.texto] || { texto: x.texto, feito: !!x.feito }; }),
        };
        contarEstudo(est);
        porCodigo[est.codigo] = est;
        return est;
      });
      var unidades = (a.unidades || []).slice().sort(function (x, y) { return x.ordem - y.ordem; }).map(function (u, k) {
        return { nome: u.nome, num: k + 1, estudos: estudos.filter(function (x) { return x.unidade === u.nome; }) };
      });
      var semUni = estudos.filter(function (x) { return !unidades.some(function (u) { return u.nome === x.unidade; }); });
      if (semUni.length) unidades.push({ nome: 'Outros estudos', num: unidades.length + 1, estudos: semUni });
      var m = {
        nome: nome, cor: corDe(nome), nota: s.nota || '', unidades: unidades, estudos: estudos,
        soltos: s.itens.filter(function (it) { return !usados[it.texto]; }), itens: s.itens,
        caminho: a.caminho || estudos.map(function (x) { return x.codigo; }), proximo: a.proximo, contas: a.contas || {}, gerais: a.gerais || [],
      };
      contarMateria(m);
      return m;
    });
    var M = { materias: materias, porCodigo: porCodigo, arquivo: D.arquivo, existe: D.existe, estado: e };
    somarTudo(M);
    return M;
  }

  function contarEstudo(est) {
    var cf = 0, itf = 0;
    est.conceitos.forEach(function (c) { if (c.feito) cf++; });
    est.itens.forEach(function (i) { if (i.feito) itf++; });
    var total = est.conceitos.length + est.itens.length;
    est.n = { c: est.conceitos.length, cf: cf, i: est.itens.length, iF: itf, total: total, feitos: cf + itf };
    est.frac = total ? (cf + itf) / total : 0;
    est.sit = !total ? 'vazio' : cf + itf === total ? 'dominado' : cf + itf ? 'parcial' : 'falta';
  }
  function contarMateria(m) {
    var n = { c: 0, cf: 0, i: 0, iF: 0, est: m.estudos.length, estDom: 0 };
    m.estudos.forEach(function (x) { n.c += x.n.c; n.cf += x.n.cf; if (x.sit === 'dominado') n.estDom++; });
    m.itens.forEach(function (it) { n.i++; if (it.feito) n.iF++; });
    n.total = n.c + n.i; n.feitos = n.cf + n.iF;
    m.n = n; m.frac = n.total ? n.feitos / n.total : 0;
    m.unidades.forEach(function (u) {
      var t = 0, f = 0;
      u.estudos.forEach(function (x) { t += x.n.total; f += x.n.feitos; });
      u.n = { total: t, feitos: f }; u.frac = t ? f / t : 0;
    });
  }
  function somarTudo(M) {
    var n = { c: 0, cf: 0, i: 0, iF: 0, est: 0, estDom: 0 };
    M.materias.forEach(function (m) { Object.keys(n).forEach(function (k) { n[k] += m.n[k]; }); });
    n.total = n.c + n.i; n.feitos = n.cf + n.iF;
    M.n = n; M.frac = n.total ? n.feitos / n.total : 0;
  }
  function materiaDe(nome) { return modelo && modelo.materias.filter(function (m) { return m.nome === nome; })[0]; }

  /* ======================= marcar ======================= */
  var ouvintes = [];
  function emitir(motivo) {
    if (!modelo) return;
    modelo.materias.forEach(contarMateria); somarTudo(modelo);
    ouvintes.forEach(function (f) { try { f(motivo); } catch (e) { /* um ouvinte quebrado não para os outros */ } });
    window.dispatchEvent(new CustomEvent('dominio:mudou', { detail: { motivo: motivo } }));
  }
  function aoMudar(f) { ouvintes.push(f); return function () { ouvintes = ouvintes.filter(function (x) { return x !== f; }); }; }

  function hoje() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function marcarConceitos(est, nomes, feito) {
    if (!est || !nomes.length) return Promise.resolve();
    var antes = {};
    est.conceitos.forEach(function (c) { if (nomes.indexOf(c.nome) >= 0) { antes[c.nome] = c.feito; c.feito = feito; c.data = feito ? hoje() : ''; } });
    contarEstudo(est); emitir('conceito');
    return fetch('/api/dominio/marcar', { method: 'POST', headers: H, body: JSON.stringify({ codigo: est.codigo, titulo: est.titulo, conceitos: nomes, todos: est.conceitos.map(function (c) { return c.nome; }), feito: feito }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui gravar.'); return j; }); })
      .then(function (D) {
        modelo.existe = true;
        var mc = (D.marcas || {})[est.codigo] || {};
        est.conceitos.forEach(function (c) { c.feito = !!mc[c.nome]; c.data = mc[c.nome] || ''; });
        contarEstudo(est); emitir('gravado');
      })
      .catch(function (erro) {
        est.conceitos.forEach(function (c) { if (c.nome in antes) c.feito = antes[c.nome]; });
        contarEstudo(est); emitir('erro');
        avisar('Não consegui gravar: ' + erro.message, true);
        throw erro;
      });
  }
  function marcarItem(nomeMat, it, feito) {
    var antes = it.feito;
    it.feito = feito;
    estudosDoItem(nomeMat, it.texto).forEach(contarEstudo);
    emitir('item');
    return P.marcar(nomeMat, it.texto, feito).then(function (novo) {
      var s = (novo.checklist || []).filter(function (x) { return x.nome === nomeMat; })[0];
      if (s) s.itens.forEach(function (x) { if (x.texto === it.texto) it.feito = !!x.feito; });
      estudosDoItem(nomeMat, it.texto).forEach(contarEstudo);
      emitir('gravado');
    }).catch(function (erro) {
      it.feito = antes; estudosDoItem(nomeMat, it.texto).forEach(contarEstudo); emitir('erro');
      avisar('Não consegui marcar: ' + erro.message, true);
      throw erro;
    });
  }
  function estudosDoItem(nomeMat, texto) {
    var m = materiaDe(nomeMat); if (!m) return [];
    return m.estudos.filter(function (e) { return e.itens.some(function (i) { return i.texto === texto; }); });
  }
  function itemDe(nomeMat, texto) { var m = materiaDe(nomeMat); return m && m.itens.filter(function (i) { return i.texto === texto; })[0]; }

  /* o estudo inteiro de uma vez (todos os conceitos e itens) */
  function marcarEstudo(est, feito) {
    var nomes = est.conceitos.filter(function (c) { return c.feito !== feito; }).map(function (c) { return c.nome; });
    var its = est.itens.filter(function (i) { return i.feito !== feito; });
    var p = nomes.length ? marcarConceitos(est, nomes, feito) : Promise.resolve();
    return p.then(function () { return its.reduce(function (cad, it) { return cad.then(function () { return marcarItem(est.materia, it, feito); }); }, Promise.resolve()); });
  }

  /* um aviso com "desfazer", no canto */
  var avisoEl = null, avisoT = 0;
  function avisar(texto, erro, desfazer) {
    if (!avisoEl) { avisoEl = document.createElement('div'); avisoEl.className = 'dm2-aviso'; avisoEl.setAttribute('role', 'status'); document.body.appendChild(avisoEl); }
    avisoEl.innerHTML = '<span>' + esc(texto) + '</span>' + (desfazer ? '<button type="button" class="dm2-desfazer">Desfazer</button>' : '');
    avisoEl.classList.toggle('erro', !!erro);
    avisoEl.classList.add('on');
    if (desfazer) avisoEl.querySelector('.dm2-desfazer').onclick = function () { avisoEl.classList.remove('on'); desfazer(); };
    clearTimeout(avisoT); avisoT = setTimeout(function () { avisoEl.classList.remove('on'); }, erro ? 6000 : 4200);
  }

  /* a chave de cada coisa marcável: c|CÓDIGO|conceito · i|Matéria|texto do item */
  function chaveC(est, c) { return 'c|' + est.codigo + '|' + c.nome; }
  function chaveI(nomeMat, it) { return 'i|' + nomeMat + '|' + it.texto; }
  function alternar(chave) {
    var p = chave.split('|'), tipo = p[0];
    if (tipo === 'c') {
      var est = modelo.porCodigo[p[1]], nome = p.slice(2).join('|');
      var c = est && est.conceitos.filter(function (x) { return x.nome === nome; })[0]; if (!c) return;
      var novo = !c.feito;
      marcarConceitos(est, [nome], novo).then(function () {
        avisar((novo ? 'Dominado: ' : 'Desmarcado: ') + nome, false, function () { marcarConceitos(est, [nome], !novo); });
      }).catch(function () {});
    } else if (tipo === 'i') {
      var nomeMat = p[1], texto = p.slice(2).join('|'), it = itemDe(nomeMat, texto); if (!it) return;
      var v = !it.feito;
      marcarItem(nomeMat, it, v).then(function () {
        avisar((v ? 'Item dominado: ' : 'Item desmarcado: ') + texto, false, function () { marcarItem(nomeMat, it, !v); });
      }).catch(function () {});
    }
  }

  /* pinta, no lugar, tudo o que mostra marcas (sem redesenhar: o foco e a rolagem ficam) */
  function pintar(raiz) {
    if (!modelo || !raiz) return;
    raiz.querySelectorAll('[data-k]').forEach(function (el) {
      var p = el.getAttribute('data-k').split('|'), feito = false;
      if (p[0] === 'c') { var est = modelo.porCodigo[p[1]], nome = p.slice(2).join('|'); feito = !!(est && est.conceitos.some(function (c) { return c.nome === nome && c.feito; })); }
      else { var it = itemDe(p[1], p.slice(2).join('|')); feito = !!(it && it.feito); }
      el.classList.toggle('feito', feito);
      if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', String(feito));
      if (el.tagName === 'INPUT') el.checked = feito;
    });
    raiz.querySelectorAll('[data-est]').forEach(function (el) {
      var est = modelo.porCodigo[el.getAttribute('data-est')]; if (!est) return;
      el.style.setProperty('--f', est.frac.toFixed(3));
      ['falta', 'parcial', 'dominado', 'vazio'].forEach(function (s) { el.classList.toggle('s-' + s, est.sit === s); });
      el.querySelectorAll('[data-est-n]').forEach(function (n) { if (n.closest('[data-est]') === el) n.textContent = est.n.feitos + '/' + est.n.total; });
    });
    raiz.querySelectorAll('[data-mat-n]').forEach(function (el) {
      var m = materiaDe(el.getAttribute('data-mat-n')); if (!m) return;
      el.textContent = el.hasAttribute('data-pct') ? pct(m.frac) : m.n.feitos + '/' + m.n.total;
    });
    raiz.querySelectorAll('[data-mat-f]').forEach(function (el) { var m = materiaDe(el.getAttribute('data-mat-f')); if (m) el.style.setProperty('--f', m.frac.toFixed(3)); });
    raiz.querySelectorAll('[data-uni-f]').forEach(function (el) {
      var p = el.getAttribute('data-uni-f').split('|'), m = materiaDe(p[0]); if (!m) return;
      var u = m.unidades.filter(function (x) { return x.nome === p[1]; })[0]; if (u) el.style.setProperty('--f', u.frac.toFixed(3));
    });
    raiz.querySelectorAll('[data-tudo-n]').forEach(function (el) { el.textContent = el.hasAttribute('data-pct') ? pct(modelo.frac) : modelo.n.feitos + '/' + modelo.n.total; });
    raiz.querySelectorAll('[data-tudo-f]').forEach(function (el) { el.style.setProperty('--f', modelo.frac.toFixed(3)); });
  }

  /* ======================= pedaços de desenho ======================= */
  function anel(f, cls) {
    var r = 15.9155, c = 100;
    return '<svg class="dm2-anel ' + (cls || '') + '" viewBox="0 0 36 36" aria-hidden="true"><circle class="a0" cx="18" cy="18" r="' + r + '"/><circle class="a1" cx="18" cy="18" r="' + r + '" stroke-dasharray="' + (f * c).toFixed(1) + ' ' + c + '"/></svg>';
  }
  function anelVivo(atrib) {
    /* o anel que se repinta sozinho via --f (CSS: stroke-dasharray calc) */
    return '<svg class="dm2-anel vivo" viewBox="0 0 36 36" aria-hidden="true" ' + atrib + '><circle class="a0" cx="18" cy="18" r="15.9155"/><circle class="a1" cx="18" cy="18" r="15.9155" pathLength="100"/></svg>';
  }
  function cabMateria(m, op) {
    var area = 'area.html?m=' + encodeURIComponent(m.nome);
    return '<header class="dm2-mat-cab">' +
      '<div class="dm2-mat-tit"><p class="rot">' + (ORDEM.indexOf(m.nome) + 1) + ' de ' + ORDEM.length + (m.nota ? ' · ' + esc(m.nota) : '') + '</p>' +
      '<h2 class="dm2-mat-h"><i class="q" aria-hidden="true"></i>' + esc(m.nome) + '</h2>' +
      '<p class="dm2-mat-sub">' + m.unidades.length + ' unidades · ' + m.estudos.length + ' estudos · ' + m.n.c + ' subtópicos · ' + m.n.i + ' itens da prova</p></div>' +
      '<div class="dm2-mat-num" data-mat-f="' + esc(m.nome) + '" style="--f:' + m.frac.toFixed(3) + '">' + anelVivo('') +
      '<b data-mat-n="' + esc(m.nome) + '" data-pct>' + pct(m.frac) + '</b><span><b data-mat-n="' + esc(m.nome) + '">' + m.n.feitos + '/' + m.n.total + '</b> marcados</span></div>' +
      (op && op.semArea ? '' : '<a class="botao dm2-entrar" href="' + area + '">' + ic('area') + 'Entrar na área</a>') +
      '</header>';
  }
  function chipsConceitos(est, b) {
    if (!est.conceitos.length) return '';
    return '<ul class="dm2-chips">' + est.conceitos.map(function (c) {
      return '<li><button type="button" class="dm2-c' + (c.feito ? ' feito' : '') + (b.casa(c.nome) ? ' achado' : '') + '" data-k="' + esc(chaveC(est, c)) + '" aria-pressed="' + c.feito + '"><i aria-hidden="true"></i>' + b.realce(c.nome) + '</button></li>';
    }).join('') + '</ul>';
  }
  function listaItens(nomeMat, itens, b) {
    if (!itens.length) return '';
    return '<ul class="dm2-itens">' + itens.map(function (it) {
      return '<li><button type="button" class="dm2-i' + (it.feito ? ' feito' : '') + '" data-k="' + esc(chaveI(nomeMat, it)) + '" aria-pressed="' + !!it.feito + '"><i aria-hidden="true"></i><span>' + b.realce(it.texto) + '</span></button>' +
        '<button type="button" class="dm2-estudar" data-estudar="' + esc(nomeMat + '|' + it.texto) + '" title="Estudar este item (a carta, as perguntas)">' + ic('estudos') + '<span class="sr">Estudar</span></button></li>';
    }).join('') + '</ul>';
  }

  /* ======================= a folha do estudo ======================= */
  function abrirEstudo(codigo) {
    var abrir = function () {
      var est = modelo.porCodigo[codigo]; if (!est || !P || !P.folha) return;
      var f = P.folha({ titulo: esc(est.codigo) + ' · ' + esc(est.titulo), sub: esc(est.materia) + ' · ' + esc(est.unidade), larga: true, html: '<div class="dm2-folha"></div>', aoFechar: function () { solta(); } });
      var corpo = f.corpo.querySelector('.dm2-folha');
      corpo.classList.add(corDe(est.materia));
      var desenhar = function () { corpo.innerHTML = htmlEstudo(est); pintar(corpo); };
      desenhar();
      var solta = aoMudar(function () { pintar(corpo); var cab = corpo.querySelector('.dm2-f-num'); if (cab) cab.outerHTML = numEstudo(est); });
      corpo.addEventListener('click', function (ev) {
        var k = ev.target.closest('[data-k]'); if (k) { alternar(k.getAttribute('data-k')); return; }
        var t = ev.target.closest('[data-todos]'); if (t) { marcarEstudo(est, t.getAttribute('data-todos') === '1').then(function () { avisar(t.getAttribute('data-todos') === '1' ? 'O estudo inteiro foi marcado.' : 'O estudo foi desmarcado.'); }).catch(function () {}); return; }
        var s = ev.target.closest('[data-estudar]'); if (s) { estudarItem(s.getAttribute('data-estudar'), corpo, desenhar); return; }
        var o = ev.target.closest('[data-abrir]'); if (o) { ev.preventDefault(); abrirEstudo(o.getAttribute('data-abrir')); }
      });
    };
    if (modelo) abrir(); else carregar().then(abrir);
  }
  function numEstudo(est) {
    return '<div class="dm2-f-num s-' + est.sit + '" data-est="' + esc(est.codigo) + '" style="--f:' + est.frac.toFixed(3) + '"><i class="dm2-barra"><i></i></i><span><b data-est-n>' + est.n.feitos + '/' + est.n.total + '</b> · ' + esc(ROTULO_SIT[est.sit]) + '</span></div>';
  }
  function htmlEstudo(est) {
    var b = buscador('');
    var link = function (c) { var x = modelo.porCodigo[c]; return x ? '<a href="#" data-abrir="' + esc(c) + '" class="dm2-f-elo s-' + x.sit + '"><code>' + esc(c) + '</code> ' + esc(x.titulo) + '</a>' : '<span class="dm2-f-elo"><code>' + esc(c) + '</code></span>'; };
    return numEstudo(est) +
      (est.frase ? '<p class="dm2-f-frase">' + md(est.frase.charAt(0).toUpperCase() + est.frase.slice(1)) + '</p>' : '') +
      '<div class="dm2-f-acoes"><button type="button" class="botao pri" data-todos="1">' + ic('check') + 'Marcar o estudo inteiro</button><button type="button" class="botao leve" data-todos="0">Desmarcar tudo</button></div>' +
      (est.conceitos.length ? '<h3 class="dm2-f-t">Os subtópicos <small>' + est.n.c + '</small></h3>' + chipsConceitos(est, b) : '') +
      (est.itens.length ? '<h3 class="dm2-f-t">O que a prova cobra <small>itens do Checklist</small></h3>' + listaItens(est.materia, est.itens, b) : '<p class="rot suave">Nenhum item do Checklist ligado a este estudo: o domínio dele é medido pelos subtópicos.</p>') +
      (est.pre.length || est.abre.length || est.fora.length ? '<h3 class="dm2-f-t">As ligações</h3><div class="dm2-f-elos">' +
        (est.pre.length ? '<p><span class="rot">vem de</span>' + est.pre.map(link).join('') + '</p>' : '<p><span class="rot">vem de</span><span class="suave">é um ponto de partida</span></p>') +
        (est.abre.length ? '<p><span class="rot">abre</span>' + est.abre.map(link).join('') + '</p>' : '') +
        (est.fora.length ? '<p><span class="rot">conversa com</span>' + est.fora.slice(0, 8).map(function (f) { return '<a href="#" data-abrir="' + esc(f.codigo) + '" class="dm2-f-elo ' + corDe(f.materia) + '"><i class="q"></i><code>' + esc(f.codigo) + '</code> ' + esc(f.titulo) + '</a>'; }).join('') + '</p>' : '') + '</div>' : '') +
      '<div class="dm2-f-links"><a class="botao" href="area.html?m=' + encodeURIComponent(est.materia) + '#n=' + esc(est.codigo) + '">' + ic('area') + 'Ver na área</a>' +
      '<a class="botao" href="biblioteca.html#f=' + encodeURI(est.id) + '">' + ic('estudos') + 'Ler o estudo' + (est.exercicios ? ' · ' + est.exercicios + ' exercícios' : '') + '</a></div>' +
      (est.programa ? '<p class="dm2-f-prog"><span class="rot">No edital</span>' + esc(est.programa) + '</p>' : '');
  }
  /* "estudar" um item: a carta de sempre (cartao.js), dentro da folha */
  function estudarItem(chave, corpo, voltar) {
    var p = chave.split('|'), nomeMat = p[0], texto = p.slice(1).join('|');
    var s = (modelo.estado.checklist || []).filter(function (x) { return x.nome === nomeMat; })[0];
    var it = s && s.itens.filter(function (x) { return x.texto === texto; })[0];
    if (!it || !window.Cartao) { avisar('Não achei a carta deste item.', true); return; }
    corpo.innerHTML = '<button type="button" class="botao leve dm2-voltar">' + ic('voltar') + 'Voltar ao estudo</button><div class="dm2-carta"></div>';
    corpo.querySelector('.dm2-voltar').onclick = function () { if (vivo) vivo.destruir(); voltar(); };
    var vivo = window.Cartao.montar(corpo.querySelector('.dm2-carta'), {
      secao: nomeMat, item: it, cor: corDe(nomeMat), contexto: 'domino', compacto: false, iSecao: s._i,
      baralho: function () { window.Cartao.baralho(modelo.estado, nomeMat, function () {}); },
      dominar: function (feito) { var real = itemDe(nomeMat, texto); return marcarItem(nomeMat, real || it, feito); },
    });
  }

  /* ======================= filtros e busca ======================= */
  function buscador(q) {
    var n = norm(q), partes = n ? n.split(' ') : [];
    var casa = function (t) { if (!partes.length) return false; var x = norm(t); return partes.every(function (p) { return x.indexOf(p) >= 0; }); };
    var re = null;
    var longas = partes.filter(function (p) { return p.length >= 2; }).sort(function (a, b) { return b.length - a.length; });
    if (longas.length) re = new RegExp('(' + longas.map(function (p) { return p.split('').map(function (ch) { return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\u0300-\\u036f]*'; }).join(''); }).join('|') + ')', 'ig');
    /* realce sem acento: compara na forma decomposta (NFD) e devolve o texto original */
    var realce = function (t) { if (!re) return esc(t); return esc(String(t).normalize('NFD')).replace(re, '<mark>$1</mark>').normalize('NFC'); };
    return { q: n, casa: casa, realce: realce, ativo: !!partes.length };
  }

  /* ======================= o componente ======================= */
  function montar(raiz, op) {
    op = op || {};
    var pref = ler('dominio:pref', {});
    var cfg = {
      vista: op.vista || pref.vista || 'mapa', mostrar: pref.mostrar || 'conceitos', sit: 'todos', prio: false, comItem: false,
      q: '', so: op.so || null, sel: op.so ? [op.so] : (pref.sel || []), sol: null,
    };
    if (!VISTAS.some(function (v) { return v[0] === cfg.vista; })) cfg.vista = 'mapa';
    function salvarPref() { if (op.embutido) return; if (!op.so) gravar('dominio:pref', { vista: cfg.vista, mostrar: cfg.mostrar, sel: cfg.sel }); else gravar('dominio:pref', { vista: cfg.vista, mostrar: cfg.mostrar, sel: (ler('dominio:pref', {}).sel || []) }); }

    raiz.classList.add('dm2');
    if (op.embutido) raiz.classList.add('dm2-embutido');
    raiz.innerHTML =
      '<div class="dm2-ferr-cx"><div class="dm2-ferr" role="toolbar" aria-label="Como ver o mapa">' +
        '<div class="dm2-vistas" role="radiogroup" aria-label="Vista">' + VISTAS.map(function (v) {
          return '<button type="button" role="radio" data-vista="' + v[0] + '" title="' + esc(v[2]) + '"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">' + v[3] + '</svg><span>' + v[1] + '</span></button>';
        }).join('') + '</div>' +
        '<div class="dm2-filtros">' +
          '<div class="dm2-seg" role="radiogroup" aria-label="Mostrar">' + MOSTRAR.map(function (m) { return '<button type="button" role="radio" data-mostrar="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div>' +
          '<div class="dm2-seg" role="radiogroup" aria-label="Situação">' + SITUACOES.map(function (s) { return '<button type="button" role="radio" data-sit="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div>' +
          '<button type="button" class="dm2-tog" data-prio aria-pressed="false" title="Só os estudos de prioridade máxima no edital">★★★</button>' +
          '<button type="button" class="dm2-tog" data-comitem aria-pressed="false" title="Só os estudos ligados a itens do Checklist (o que a prova cobra)">Cai na prova</button>' +
          '<label class="dm2-busca">' + ic('buscar') + '<span class="sr">Buscar no mapa</span><input type="search" placeholder="Buscar estudo, subtópico ou item" autocomplete="off"></label>' +
        '</div>' +
      '</div></div>' +
      (op.so ? '' : '<div class="dm2-mats" role="group" aria-label="Mostrar só estas matérias"></div>') +
      '<p class="dm2-legenda" aria-live="polite"></p>' +
      '<div class="dm2-vista" aria-live="off"></div>';

    var $ = function (s) { return raiz.querySelector(s); };
    var vistaEl = $('.dm2-vista');
    var tBusca = 0;

    function pintarBarra() {
      raiz.querySelectorAll('[data-vista]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-vista') === cfg.vista)); });
      raiz.querySelectorAll('[data-mostrar]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-mostrar') === cfg.mostrar)); });
      raiz.querySelectorAll('[data-sit]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-sit') === cfg.sit)); });
      $('[data-prio]').setAttribute('aria-pressed', String(cfg.prio));
      $('[data-comitem]').setAttribute('aria-pressed', String(cfg.comItem));
      raiz.setAttribute('data-dm-vista', cfg.vista);
      raiz.setAttribute('data-dm-mostrar', cfg.mostrar);
      var mats = $('.dm2-mats');
      if (mats && modelo) mats.innerHTML = '<button type="button" class="chip' + (!cfg.sel.length ? ' on' : '') + '" data-mat="">Todas</button>' + modelo.materias.map(function (m) {
        var on = cfg.sel.indexOf(m.nome) >= 0;
        return '<button type="button" class="chip ' + m.cor + (on ? ' on' : '') + '" data-mat="' + esc(m.nome) + '" aria-pressed="' + on + '"><i class="q"></i>' + esc(m.nome) + '</button>';
      }).join('');
    }

    function visiveis() {
      var b = buscador(cfg.q);
      var mats = modelo.materias.filter(function (m) { return cfg.so ? m.nome === cfg.so : !cfg.sel.length || cfg.sel.indexOf(m.nome) >= 0; });
      var passa = function (e) {
        if (cfg.sit !== 'todos' && !(cfg.sit === 'falta' ? e.sit === 'falta' || e.sit === 'vazio' : e.sit === cfg.sit)) return false;
        if (cfg.prio && e.prioridade.indexOf('★★★') < 0) return false;
        if (cfg.comItem && !e.itens.length) return false;
        if (b.ativo && !(b.casa(e.titulo) || b.casa(e.codigo) || e.conceitos.some(function (c) { return b.casa(c.nome); }) || e.itens.some(function (i) { return b.casa(i.texto); }) || b.casa(e.unidade))) return false;
        return true;
      };
      return { b: b, mats: mats.map(function (m) {
        var uni = m.unidades.map(function (u) { return { u: u, estudos: u.estudos.filter(passa) }; }).filter(function (x) { return x.estudos.length; });
        var soltos = m.soltos.filter(function (it) {
          var sitOk = cfg.sit === 'todos' || (cfg.sit === 'dominado' && it.feito) || (cfg.sit === 'falta' && !it.feito);
          return sitOk && (!b.ativo || b.casa(it.texto)) && !cfg.prio;
        });
        return { m: m, uni: uni, n: uni.reduce(function (s, x) { return s + x.estudos.length; }, 0), soltos: soltos };
      }) };
    }

    function legenda(V) {
      var n = V.mats.reduce(function (s, x) { return s + x.n; }, 0), tot = V.mats.reduce(function (s, x) { return s + x.m.estudos.length; }, 0);
      var filtros = [];
      if (cfg.sit !== 'todos') filtros.push(SITUACOES.filter(function (s) { return s[0] === cfg.sit; })[0][1].toLowerCase());
      if (cfg.prio) filtros.push('prioridade ★★★');
      if (cfg.comItem) filtros.push('só o que cai na prova');
      if (cfg.q) filtros.push('“' + cfg.q + '”');
      var v = VISTAS.filter(function (x) { return x[0] === cfg.vista; })[0];
      $('.dm2-legenda').innerHTML = '<b>' + v[1] + '.</b> ' + esc(v[2]) + '. ' + (n === tot ? n + ' estudos' : n + ' de ' + tot + ' estudos') + (filtros.length ? ' · ' + esc(filtros.join(' · ')) + ' <button type="button" class="dm2-limpar">limpar filtros</button>' : '') +
        (cfg.vista === 'mosaico' || cfg.vista === 'mapa' || cfg.vista === 'indice' ? ' <span class="suave">Toque num subtópico para marcar; no título, para abrir o estudo.</span>' : ' <span class="suave">Toque num estudo para abrir e marcar.</span>');
    }

    function desenhar() {
      if (!modelo) return;
      pintarBarra();
      var V = visiveis();
      legenda(V);
      var fn = { mapa: vMapa, indice: vIndice, mosaico: vMosaico, linhas: vLinhas, constelacao: vConstelacao, sol: vSol }[cfg.vista] || vMapa;
      var vazio = !V.mats.some(function (x) { return x.n || x.soltos.length; });
      vistaEl.innerHTML = vazio ? '<div class="cx dm2-vazio"><p class="rot">Nada com esses filtros</p><p>Tente outra situação, outra matéria ou limpe a busca.</p><button type="button" class="botao dm2-limpar">Limpar filtros</button></div>' : fn(V);
      if (cfg.vista === 'sol' && !vazio) ligarSol();
      if (cfg.vista === 'linhas' || cfg.vista === 'constelacao') requestAnimationFrame(function () { vistaEl.classList.add('dm2-pronto'); });
      pintar(raiz);
      if (op.aoDesenhar) op.aoDesenhar(V);
      window.dispatchEvent(new CustomEvent('dominio:desenhado'));
    }

    /* ---------- 1. MAPA: unidades em faixas, estudos em cartões ---------- */
    function vMapa(V) {
      return V.mats.map(function (x) {
        if (!x.n && !x.soltos.length) return '';
        var m = x.m;
        return '<section class="dm2-mat ' + m.cor + '" id="m-' + slug(m.nome) + '" data-mat-sec="' + esc(m.nome) + '">' + cabMateria(m, op) +
          x.uni.map(function (y) {
            var u = y.u;
            return '<section class="dm2-uni"><header class="dm2-uni-cab" data-uni-f="' + esc(m.nome + '|' + u.nome) + '" style="--f:' + u.frac.toFixed(3) + '"><span class="dm2-uni-n">' + u.num + '</span><h3>' + V.b.realce(u.nome) + '</h3><i class="dm2-barra"><i></i></i></header>' +
              '<div class="dm2-cartoes">' + y.estudos.map(function (e) {
                return '<article class="dm2-cartao s-' + e.sit + '" data-est="' + esc(e.codigo) + '" style="--f:' + e.frac.toFixed(3) + '">' +
                  '<header><code>' + esc(e.codigo) + '</code>' + (e.prioridade ? '<span class="dm2-prio" title="Prioridade no edital">' + esc(e.prioridade) + '</span>' : '') + '<b data-est-n>' + e.n.feitos + '/' + e.n.total + '</b></header>' +
                  '<h4><button type="button" data-abrir="' + esc(e.codigo) + '">' + V.b.realce(e.titulo) + '</button></h4>' +
                  '<i class="dm2-barra"><i></i></i>' +
                  (cfg.mostrar !== 'estudos' ? chipsConceitos(e, V.b) : '') +
                  (cfg.mostrar === 'itens' ? listaItens(m.nome, e.itens, V.b) : '') +
                  '</article>';
              }).join('') + '</div></section>';
          }).join('') +
          (x.soltos.length && cfg.mostrar === 'itens' ? '<section class="dm2-uni dm2-soltos"><header class="dm2-uni-cab"><span class="dm2-uni-n">+</span><h3>Itens da prova sem estudo ligado</h3></header>' + listaItens(m.nome, x.soltos, V.b) + '</section>' : '') +
          '</section>';
      }).join('');
    }

    /* ---------- 2. ÍNDICE: o sumário do livro, do estudo ao subtópico ---------- */
    function vIndice(V) {
      return V.mats.map(function (x) {
        if (!x.n && !x.soltos.length) return '';
        var m = x.m;
        return '<section class="dm2-mat dm2-ind ' + m.cor + '" id="m-' + slug(m.nome) + '" data-mat-sec="' + esc(m.nome) + '">' + cabMateria(m, op) +
          '<ol class="dm2-ind-us">' + x.uni.map(function (y) {
            return '<li class="dm2-ind-u"><h3 class="dm2-ind-ut" data-uni-f="' + esc(m.nome + '|' + y.u.nome) + '" style="--f:' + y.u.frac.toFixed(3) + '"><span>' + y.u.num + '</span>' + V.b.realce(y.u.nome) + '<i class="dm2-barra"><i></i></i></h3><ol class="dm2-ind-es">' +
              y.estudos.map(function (e) {
                return '<li class="dm2-ind-e s-' + e.sit + '" data-est="' + esc(e.codigo) + '" style="--f:' + e.frac.toFixed(3) + '">' +
                  '<div class="dm2-ind-l"><button type="button" class="dm2-caixa" data-todo-est="' + esc(e.codigo) + '" aria-label="Marcar ou desmarcar o estudo inteiro" title="Marcar o estudo inteiro"></button>' +
                  '<code>' + esc(e.codigo) + '</code><button type="button" class="dm2-ind-t" data-abrir="' + esc(e.codigo) + '">' + V.b.realce(e.titulo) + '</button><span class="dm2-pontos" aria-hidden="true"></span><b data-est-n>' + e.n.feitos + '/' + e.n.total + '</b></div>' +
                  (cfg.mostrar !== 'estudos' && e.conceitos.length ? '<ul class="dm2-ind-cs">' + e.conceitos.map(function (c) {
                    return '<li><button type="button" class="dm2-ind-c' + (c.feito ? ' feito' : '') + (V.b.casa(c.nome) ? ' achado' : '') + '" data-k="' + esc(chaveC(e, c)) + '" aria-pressed="' + c.feito + '"><i aria-hidden="true"></i>' + V.b.realce(c.nome) + '</button></li>';
                  }).join('') + '</ul>' : '') +
                  (cfg.mostrar === 'itens' ? listaItens(m.nome, e.itens, V.b) : '') + '</li>';
              }).join('') + '</ol></li>';
          }).join('') + '</ol>' +
          (x.soltos.length && cfg.mostrar === 'itens' ? '<div class="dm2-soltos"><h3 class="dm2-ind-ut"><span>+</span>Itens sem estudo ligado</h3>' + listaItens(m.nome, x.soltos, V.b) + '</div>' : '') + '</section>';
      }).join('');
    }

    /* ---------- 3. MOSAICO: um quadrado por subtópico (ou item, ou estudo) ---------- */
    function vMosaico(V) {
      return V.mats.map(function (x) {
        if (!x.n) return '';
        var m = x.m;
        return '<section class="dm2-mat dm2-mos ' + m.cor + '" id="m-' + slug(m.nome) + '" data-mat-sec="' + esc(m.nome) + '">' + cabMateria(m, op) +
          '<div class="dm2-mos-us">' + x.uni.map(function (y) {
            return '<div class="dm2-mos-u"><p class="dm2-mos-ut"><span>' + y.u.num + '</span>' + esc(y.u.nome) + '</p><div class="dm2-mos-es">' +
              y.estudos.map(function (e) {
                var qs;
                if (cfg.mostrar === 'estudos') qs = '<button type="button" class="dm2-q dm2-q-e" data-abrir="' + esc(e.codigo) + '" title="' + esc(e.codigo + ' · ' + e.titulo) + '"><i></i></button>';
                else {
                  var lista = e.conceitos.map(function (c) { return '<button type="button" class="dm2-q' + (c.feito ? ' feito' : '') + (V.b.casa(c.nome) ? ' achado' : '') + '" data-k="' + esc(chaveC(e, c)) + '" aria-pressed="' + c.feito + '" title="' + esc(c.nome) + '"><span class="sr">' + esc(c.nome) + '</span></button>'; });
                  if (cfg.mostrar === 'itens') lista = lista.concat(e.itens.map(function (it) { return '<button type="button" class="dm2-q dm2-q-i' + (it.feito ? ' feito' : '') + '" data-k="' + esc(chaveI(m.nome, it)) + '" aria-pressed="' + !!it.feito + '" title="Item da prova: ' + esc(it.texto) + '"><span class="sr">' + esc(it.texto) + '</span></button>'; }));
                  qs = lista.join('') || '<span class="dm2-q dm2-q-vazio" title="sem subtópicos"></span>';
                }
                return '<div class="dm2-mos-e s-' + e.sit + '" data-est="' + esc(e.codigo) + '" style="--f:' + e.frac.toFixed(3) + '"><button type="button" class="dm2-mos-cod" data-abrir="' + esc(e.codigo) + '" title="' + esc(e.titulo) + '">' + esc(e.codigo.slice(4)) + '</button><div class="dm2-mos-qs">' + qs + '</div></div>';
              }).join('') + '</div></div>';
          }).join('') + '</div></section>';
      }).join('') + '<p class="dm2-mos-leg"><span class="dm2-q"></span> a estudar <span class="dm2-q feito"></span> dominado <span class="dm2-q dm2-q-i"></span> item da prova · o número é o estudo (toque nele para abrir)</p>';
    }

    /* ---------- 4. LINHAS: cada matéria é uma linha de metrô ---------- */
    function vLinhas(V) {
      return V.mats.map(function (x) {
        if (!x.n) return '';
        var m = x.m, vis = {};
        x.uni.forEach(function (y) { y.estudos.forEach(function (e) { vis[e.codigo] = e; }); });
        var ordem = m.caminho.filter(function (c) { return vis[c]; });
        Object.keys(vis).forEach(function (c) { if (ordem.indexOf(c) < 0) ordem.push(c); });
        var PASSO = 104, X0 = 96, W = Math.max(640, X0 * 2 + (ordem.length - 1) * PASSO), Y = 118, Hh = 290;
        var trilho = '<path class="dm2-l-trilho" d="M' + (X0 - 30) + ' ' + Y + 'H' + (W - X0 + 30) + '"/>';
        var feitoAte = 0; ordem.forEach(function (c, k) { if (vis[c].sit === 'dominado' && k === feitoAte) feitoAte = k + 1; });
        var andado = feitoAte ? '<path class="dm2-l-andado" d="M' + (X0 - 30) + ' ' + Y + 'H' + (X0 + (feitoAte - 1) * PASSO) + '"/>' : '';
        var uniAtual = null, faixas = '';
        ordem.forEach(function (c, k) {
          var e = vis[c];
          if (e.unidade !== uniAtual) { uniAtual = e.unidade; faixas += '<g class="dm2-l-uni"><path d="M' + (X0 + k * PASSO - PASSO / 2 + 4) + ' ' + (Y + 26) + 'V' + (Y + 150) + '"/><text x="' + (X0 + k * PASSO - PASSO / 2 + 12) + '" y="' + (Y + 146) + '">' + esc(e.unidade) + '</text></g>'; }
        });
        var est = ordem.map(function (c, k) {
          var e = vis[c], cx = X0 + k * PASSO, r = 9 + Math.min(9, e.n.total * 0.7), cima = k % 2 === 0;
          var ang = e.frac * Math.PI * 2, fx = cx + r * Math.sin(ang), fy = Y - r * Math.cos(ang), grande = e.frac > 0.5 ? 1 : 0;
          var fatia = e.frac >= 0.999 ? '<circle class="dm2-l-cheio" cx="' + cx + '" cy="' + Y + '" r="' + (r - 2.5) + '"/>' : e.frac > 0 ? '<path class="dm2-l-cheio" d="M' + cx + ' ' + Y + 'L' + cx + ' ' + (Y - r + 2.5) + 'A' + (r - 2.5) + ' ' + (r - 2.5) + ' 0 ' + grande + ' 1 ' + (cx + (r - 2.5) * Math.sin(ang)).toFixed(1) + ' ' + (Y - (r - 2.5) * Math.cos(ang)).toFixed(1) + 'Z"/>' : '';
          var pontes = e.fora.slice(0, 4).map(function (f, i) { return '<circle class="dm2-l-ponte ' + corDe(f.materia) + '" cx="' + (cx - 9 + i * 6) + '" cy="' + (Y + r + 9) + '" r="2.6"><title>conversa com ' + esc(f.codigo + ' · ' + f.titulo + ' (' + f.materia + ')') + '</title></circle>'; }).join('');
          var ty = cima ? Y - r - 30 : Y + r + 30;
          var tit = e.titulo.length > 26 ? e.titulo.slice(0, 25).trim() + '…' : e.titulo;
          return '<g class="dm2-l-est s-' + e.sit + '" data-est="' + esc(e.codigo) + '" data-abrir="' + esc(e.codigo) + '" tabindex="0" role="button" aria-label="' + esc(e.codigo + ' · ' + e.titulo + ': ' + e.n.feitos + ' de ' + e.n.total + '. Abrir.') + '" style="--k:' + k + '">' +
            '<path class="dm2-l-haste" d="M' + cx + ' ' + (cima ? Y - r : Y + r) + 'V' + (cima ? ty + 8 : ty - 22) + '"/>' +
            '<circle class="dm2-l-bola" cx="' + cx + '" cy="' + Y + '" r="' + r + '"/>' + fatia + pontes +
            '<text class="dm2-l-cod" x="' + cx + '" y="' + (cima ? ty - 12 : ty - 4) + '" text-anchor="middle">' + esc(e.codigo) + '</text>' +
            '<text class="dm2-l-tit" x="' + cx + '" y="' + (cima ? ty + 2 : ty + 10) + '" text-anchor="middle">' + esc(tit) + '</text></g>';
        }).join('');
        return '<section class="dm2-mat dm2-lin ' + m.cor + '" id="m-' + slug(m.nome) + '" data-mat-sec="' + esc(m.nome) + '">' + cabMateria(m, op) +
          '<div class="dm2-l-rolo" data-lenis-prevent><svg class="dm2-l-svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '" role="group" aria-label="A linha ' + esc(m.nome) + '">' + trilho + andado + faixas + est + '</svg></div></section>';
      }).join('') + '<p class="dm2-mos-leg">A linha grossa é o caminho já dominado, do começo até o primeiro estudo que falta. O tamanho da estação é o número de subtópicos e itens; o preenchimento, o quanto já está marcado; os pontinhos embaixo são as pontes com outras matérias.</p>';
    }

    /* ---------- 5. CONSTELAÇÃO: estrelas ligadas pelos pré-requisitos ---------- */
    function vConstelacao(V) {
      return V.mats.map(function (x) {
        if (!x.n) return '';
        var m = x.m, vis = {};
        x.uni.forEach(function (y) { y.estudos.forEach(function (e) { vis[e.codigo] = e; }); });
        var niveis = {};
        Object.keys(vis).forEach(function (c) { var e = vis[c]; (niveis[e.nivel] = niveis[e.nivel] || []).push(e); });
        var ks = Object.keys(niveis).map(Number).sort(function (a, b) { return a - b; });
        var COL = 150, LIN = 74, M0 = 70, alto = Math.max.apply(null, ks.map(function (k) { return niveis[k].length; }).concat([1]));
        var W = Math.max(640, M0 * 2 + (ks.length - 1) * COL), Hh = Math.max(240, M0 * 2 + (alto - 1) * LIN), pos = {};
        ks.forEach(function (k, ci) {
          var l = niveis[k].sort(function (a, b) { return a.uOrdem - b.uOrdem || (a.codigo < b.codigo ? -1 : 1); });
          var y0 = (Hh - (l.length - 1) * LIN) / 2;
          l.forEach(function (e, i) { var h = (parseInt(e.codigo.slice(4), 10) * 37) % 23 - 11; pos[e.codigo] = [M0 + ci * COL + h, y0 + i * LIN + ((ci % 2) ? 14 : -6)]; });
        });
        var fios = '';
        Object.keys(vis).forEach(function (c) {
          var e = vis[c];
          e.pre.forEach(function (p) {
            if (!pos[p] || !pos[c]) return;
            var a = pos[p], b2 = pos[c], mx = (a[0] + b2[0]) / 2;
            fios += '<path class="dm2-k-fio' + (vis[p].sit === 'dominado' ? ' aceso' : '') + '" d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'C' + mx.toFixed(1) + ' ' + a[1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + b2[1].toFixed(1) + ' ' + b2[0].toFixed(1) + ' ' + b2[1].toFixed(1) + '"/>';
          });
        });
        var estrelas = Object.keys(vis).map(function (c, i) {
          var e = vis[c], p = pos[c], r = 6 + Math.min(10, e.n.total * 0.75);
          return '<g class="dm2-k-est s-' + e.sit + '" data-est="' + esc(e.codigo) + '" data-abrir="' + esc(e.codigo) + '" tabindex="0" role="button" aria-label="' + esc(e.codigo + ' · ' + e.titulo + ': ' + e.n.feitos + ' de ' + e.n.total + '. Abrir.') + '" style="--k:' + i + '">' +
            '<circle class="dm2-k-halo" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (r + 10) + '"/>' +
            '<circle class="dm2-k-bola" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + r + '"/>' +
            '<circle class="dm2-k-luz" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (r * Math.max(0.15, e.frac)).toFixed(1) + '"/>' +
            '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + r + 15).toFixed(1) + '" text-anchor="middle">' + esc(e.codigo) + '</text><title>' + esc(e.codigo + ' · ' + e.titulo + ' — ' + e.n.feitos + '/' + e.n.total) + '</title></g>';
        }).join('');
        var ceu = '';
        for (var s = 0; s < 70; s++) { var h1 = (s * 7919 + m.nome.length * 131) % 997 / 997, h2 = (s * 104729 + 17) % 991 / 991; ceu += '<circle class="dm2-k-poeira" cx="' + (h1 * W).toFixed(0) + '" cy="' + (h2 * Hh).toFixed(0) + '" r="' + (0.5 + (s % 3) * 0.4) + '"/>'; }
        return '<section class="dm2-mat dm2-con ' + m.cor + '" id="m-' + slug(m.nome) + '" data-mat-sec="' + esc(m.nome) + '">' + cabMateria(m, op) +
          '<div class="dm2-k-ceu" data-lenis-prevent><svg class="dm2-k-svg" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '" role="group" aria-label="A constelação ' + esc(m.nome) + '">' + ceu + fios + estrelas + '</svg></div></section>';
      }).join('') + '<p class="dm2-mos-leg">Da esquerda para a direita, o que depende de menos coisas vem antes. A estrela acende por dentro conforme você marca; o fio acende quando o pré-requisito está dominado.</p>';
    }

    /* ---------- 6. SOL: tudo num círculo, do centro para fora ---------- */
    var solRaiz = null; /* null = todas as matérias visíveis; 'Química' = só ela; 'Química|Unidade' = a unidade */
    function vSol(V) {
      var C = 400, R0 = 70, ANEIS = cfg.mostrar === 'estudos' ? [R0, 160, 250, 330] : [R0, 140, 215, 290, 372];
      var mats = V.mats.filter(function (x) { return x.n; });
      var foco = cfg.sol ? cfg.sol.split('|') : null;
      if (foco) mats = mats.filter(function (x) { return x.m.nome === foco[0]; });
      if (!mats.length) { cfg.sol = null; mats = V.mats.filter(function (x) { return x.n; }); foco = null; }
      /* o peso de cada pedaço é o número de coisas marcáveis dentro dele (um estudo vazio vale 1) */
      var peso = function (e) { return Math.max(1, cfg.mostrar === 'estudos' ? 1 : e.conceitos.length + (cfg.mostrar === 'itens' ? e.itens.length : 0)); };
      var arcos = '', rotulos = '';
      var pol = function (r, a) { return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
      var setor = function (r0, r1, a0, a1) {
        var g = a1 - a0 > Math.PI ? 1 : 0, p0 = pol(r1, a0), p1 = pol(r1, a1), p2 = pol(r0, a1), p3 = pol(r0, a0);
        return 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + r1 + ' ' + r1 + ' 0 ' + g + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'L' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) + 'A' + r0 + ' ' + r0 + ' 0 ' + g + ' 0 ' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + 'Z';
      };
      var unis = function (x) { return foco && foco[1] ? x.uni.filter(function (y) { return y.u.nome === foco[1]; }) : x.uni; };
      var total = 0;
      mats.forEach(function (x) { unis(x).forEach(function (y) { y.estudos.forEach(function (e) { total += peso(e); }); }); });
      var a = -Math.PI / 2, folga = 0.004;
      var rot = function (r, a0, a1, texto, cls, tam) {
        if (a1 - a0 < (tam || 0.12)) return;
        var am = (a0 + a1) / 2, p = pol(r, am), graus = am * 180 / Math.PI, vira = Math.cos(am) < 0;
        rotulos += '<text class="' + cls + '" x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (vira ? graus + 180 : graus).toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')">' + esc(texto) + '</text>';
      };
      mats.forEach(function (x) {
        var m = x.m, am0 = a, arcosGeral = arcos;
        arcos = '';
        unis(x).forEach(function (y) {
          var au0 = a;
          y.estudos.forEach(function (e) {
            var ae0 = a, w = peso(e) / total * Math.PI * 2;
            if (cfg.mostrar !== 'estudos') {
              var coisas = e.conceitos.map(function (c) { return { k: chaveC(e, c), nome: c.nome, feito: c.feito }; });
              if (cfg.mostrar === 'itens') coisas = coisas.concat(e.itens.map(function (it) { return { k: chaveI(m.nome, it), nome: 'Item: ' + it.texto, feito: it.feito, item: true }; }));
              if (!coisas.length) coisas = [{ vazio: true }];
              var passo = w / coisas.length;
              coisas.forEach(function (c, i) {
                var c0 = a + i * passo, c1 = c0 + passo;
                arcos += c.vazio ? '<path class="dm2-s-c vazio" d="' + setor(ANEIS[3] + 3, ANEIS[4], c0 + folga, c1 - folga) + '"/>' :
                  '<path class="dm2-s-c' + (c.feito ? ' feito' : '') + (c.item ? ' item' : '') + '" data-k="' + esc(c.k) + '" d="' + setor(ANEIS[3] + 3, ANEIS[4], c0 + folga / 2, c1 - folga / 2) + '"><title>' + esc(c.nome) + '</title></path>';
              });
            }
            a = ae0 + w;
            arcos += '<path class="dm2-s-e s-' + e.sit + '" data-est="' + esc(e.codigo) + '" data-abrir="' + esc(e.codigo) + '" style="--f:' + e.frac.toFixed(3) + '" d="' + setor(ANEIS[2] + 3, ANEIS[3], ae0 + folga, a - folga) + '"><title>' + esc(e.codigo + ' · ' + e.titulo + ' — ' + e.n.feitos + '/' + e.n.total) + '</title></path>';
            rot((ANEIS[2] + ANEIS[3]) / 2 + 2, ae0, a, e.codigo, 'dm2-s-te', 0.075);
          });
          arcos += '<path class="dm2-s-u" data-uni-f="' + esc(m.nome + '|' + y.u.nome) + '" data-dm-sol="' + esc(m.nome + '|' + y.u.nome) + '" style="--f:' + y.u.frac.toFixed(3) + '" d="' + setor(ANEIS[1] + 3, ANEIS[2], au0 + folga, a - folga) + '"><title>' + esc(y.u.nome + ' — ' + pct(y.u.frac)) + '</title></path>';
          rot((ANEIS[1] + ANEIS[2]) / 2 + 2, au0, a, y.u.nome.length > 18 ? y.u.nome.slice(0, 17) + '…' : y.u.nome, 'dm2-s-tu', 0.32);
        });
        arcos += '<path class="dm2-s-m ' + m.cor + '" data-mat-f="' + esc(m.nome) + '" data-dm-sol="' + esc(m.nome) + '" style="--f:' + m.frac.toFixed(3) + '" d="' + setor(ANEIS[0] + 3, ANEIS[1], am0 + folga, a - folga) + '"><title>' + esc(m.nome + ' — ' + pct(m.frac)) + '</title></path>';
        rot((ANEIS[0] + ANEIS[1]) / 2 + 2, am0, a, m.nome, 'dm2-s-tm', 0.36);
        /* cada matéria pinta os seus anéis com a sua cor */
        arcos = arcosGeral + arcos.replace(/class="dm2-s-(c|e|u)( |")/g, function (t, k, fim) { return 'class="dm2-s-' + k + ' ' + m.cor + fim; });
      });
      var tituloCentro = foco ? (foco[1] || foco[0]) : 'tudo';
      var fr = foco ? (function () { var x = mats[0]; if (!foco[1]) return x.m.frac; var u = x.m.unidades.filter(function (z) { return z.nome === foco[1]; })[0]; return u ? u.frac : 0; })() : modelo.frac;
      return '<div class="dm2-sol">' +
        '<svg class="dm2-s-svg" viewBox="0 0 ' + (C * 2) + ' ' + (C * 2) + '" role="group" aria-label="O sol do domínio">' +
        '<circle class="dm2-s-halo" cx="' + C + '" cy="' + C + '" r="' + (ANEIS[ANEIS.length - 1] + 18) + '"/>' + arcos + rotulos +
        '<g class="dm2-s-centro" data-dm-volta role="button" tabindex="0" aria-label="' + (foco ? 'Voltar ao sol inteiro' : 'O domínio de tudo') + '"><circle cx="' + C + '" cy="' + C + '" r="' + (R0 - 4) + '"/>' +
        '<text class="dm2-s-pct" x="' + C + '" y="' + (C + 4) + '" text-anchor="middle">' + pct(fr) + '</text><text class="dm2-s-sub" x="' + C + '" y="' + (C + 28) + '" text-anchor="middle">' + esc(tituloCentro.length > 16 ? tituloCentro.slice(0, 15) + '…' : tituloCentro) + '</text>' +
        (foco ? '<text class="dm2-s-sub" x="' + C + '" y="' + (C - 30) + '" text-anchor="middle">↺ voltar</text>' : '') + '</g></svg>' +
        '<aside class="dm2-s-lado"><p class="rot">Do centro para fora</p><ol class="dm2-s-aneis"><li>matérias</li><li>unidades</li><li>estudos</li>' + (cfg.mostrar !== 'estudos' ? '<li>subtópicos' + (cfg.mostrar === 'itens' ? ' e itens' : '') + '</li>' : '') + '</ol>' +
        '<p class="suave">Toque numa matéria ou unidade para chegar perto; num estudo, para abrir e marcar' + (cfg.mostrar !== 'estudos' ? '; num subtópico, para marcar' : '') + '. O centro volta.</p>' +
        '<ul class="dm2-s-lista">' + mats.map(function (x) { return '<li class="' + x.m.cor + '"><button type="button" data-dm-sol="' + esc(x.m.nome) + '"><i class="q"></i>' + esc(x.m.nome) + '<b data-mat-n="' + esc(x.m.nome) + '" data-pct>' + pct(x.m.frac) + '</b></button></li>'; }).join('') + '</ul></aside></div>';
    }
    function ligarSol() { /* nada a ligar: os cliques são delegados (abaixo) */ }

    /* ---------- eventos ---------- */
    raiz.addEventListener('click', function (ev) {
      var t = ev.target;
      var v = t.closest('button[data-vista]'); if (v) { cfg.vista = v.getAttribute('data-vista'); cfg.sol = null; salvarPref(); trocar(); return; }
      var mo = t.closest('button[data-mostrar]'); if (mo) { cfg.mostrar = mo.getAttribute('data-mostrar'); salvarPref(); trocar(); return; }
      var si = t.closest('button[data-sit]'); if (si) { cfg.sit = si.getAttribute('data-sit'); trocar(); return; }
      if (t.closest('[data-prio]')) { cfg.prio = !cfg.prio; trocar(); return; }
      if (t.closest('[data-comitem]')) { cfg.comItem = !cfg.comItem; trocar(); return; }
      if (t.closest('.dm2-limpar')) { cfg.sit = 'todos'; cfg.prio = false; cfg.comItem = false; cfg.q = ''; var bi = $('.dm2-busca input'); if (bi) bi.value = ''; trocar(); return; }
      var ma = t.closest('.dm2-mats [data-mat]'); if (ma) {
        var nome = ma.getAttribute('data-mat');
        if (!nome) cfg.sel = []; else if (cfg.sel.indexOf(nome) >= 0) cfg.sel = cfg.sel.filter(function (x) { return x !== nome; }); else cfg.sel = cfg.sel.concat([nome]);
        salvarPref(); trocar(); return;
      }
      var k = t.closest('[data-k]'); if (k && raiz.contains(k)) { alternar(k.getAttribute('data-k')); return; }
      var te = t.closest('[data-todo-est]'); if (te) { var est = modelo.porCodigo[te.getAttribute('data-todo-est')]; var novo = est.sit !== 'dominado'; marcarEstudo(est, novo).then(function () { avisar((novo ? 'Dominado: ' : 'Desmarcado: ') + est.codigo + ' · ' + est.titulo, false, function () { marcarEstudo(est, !novo); }); }).catch(function () {}); return; }
      var es = t.closest('[data-estudar]'); if (es) { var p = es.getAttribute('data-estudar').split('|'); var est2 = estudosDoItem(p[0], p.slice(1).join('|'))[0]; if (est2) abrirEstudo(est2.codigo); return; }
      var sol = t.closest('[data-dm-sol]'); if (sol && raiz.contains(sol)) { cfg.sol = sol.getAttribute('data-dm-sol'); trocar(); return; }
      var vt = t.closest('[data-dm-volta]'); if (vt && raiz.contains(vt)) { if (cfg.sol) { var pp = cfg.sol.split('|'); cfg.sol = pp.length > 1 ? pp[0] : null; trocar(); } return; }
      var ab = t.closest('[data-abrir]'); if (ab && raiz.contains(ab)) { abrirEstudo(ab.getAttribute('data-abrir')); return; }
    });
    raiz.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var g = ev.target.closest('g[data-abrir], g[data-dm-volta], g[data-dm-sol]'); if (!g || !raiz.contains(g)) return;
      ev.preventDefault(); g.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    var entrada = $('.dm2-busca input');
    entrada.addEventListener('input', function () { clearTimeout(tBusca); tBusca = setTimeout(function () { cfg.q = entrada.value.trim(); trocar(); }, 160); });

    /* trocar de vista: a vista velha sai e a nova entra (View Transitions quando houver) */
    function trocar() {
      if (document.startViewTransition && document.documentElement.getAttribute('data-mov') !== 'off') {
        vistaEl.style.viewTransitionName = 'dm2-vista';
        var t = document.startViewTransition(function () { desenhar(); });
        t.finished.then(function () { vistaEl.style.viewTransitionName = ''; }, function () { vistaEl.style.viewTransitionName = ''; });
      } else desenhar();
    }

    var solta = aoMudar(function (motivo) {
      pintar(raiz);
      /* o sol e as linhas desenham a fração na geometria: esses redesenham */
      if (cfg.vista === 'sol' || cfg.vista === 'linhas' || cfg.vista === 'constelacao') { if (motivo !== 'conceito' && motivo !== 'item') desenhar(); }
    });

    var pronto = carregar().then(function () { desenhar(); return api; }).catch(function (e) {
      vistaEl.innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra o <b>hoje.command</b> (ou o hoje.bat) e deixe a janelinha aberta. ' + esc(e.message || '') + '</p></div>';
    });
    var api = {
      pronto: pronto, desenhar: desenhar, cfg: cfg,
      ir: function (nome) { var s = raiz.querySelector('[data-mat-sec="' + nome + '"]'); if (s) s.scrollIntoView({ behavior: mov(), block: 'start' }); },
      destruir: function () { solta(); raiz.innerHTML = ''; },
    };
    return api;
  }

  /* ======================= o menu fixo das matérias ======================= */
  /* No Domínio ele passa pelas matérias (rola até cada uma e acende a que está na tela);
     nas Áreas ele leva de uma área a outra, volta ao mapa geral e abre "Marcar domínios". */
  function trilho(el, op) {
    op = op || {};
    var modo = op.modo || 'dominio';
    el.classList.add('dm2-trilho');
    el.setAttribute('aria-label', 'Matérias');
    function html() {
      var M = modelo;
      var item = function (m) {
        var href = modo === 'area' ? 'area.html?m=' + encodeURIComponent(m.nome) : '#m-' + slug(m.nome);
        var atual = op.atual === m.nome;
        return '<a class="dm2-t-m ' + m.cor + '" href="' + href + '" data-ir-mat="' + esc(m.nome) + '"' + (atual ? ' aria-current="page"' : '') + ' data-mat-f="' + esc(m.nome) + '" style="--f:' + m.frac.toFixed(3) + '">' +
          '<i class="q" aria-hidden="true"></i><span class="dm2-t-nome">' + esc(m.nome) + '</span><b data-mat-n="' + esc(m.nome) + '" data-pct>' + pct(m.frac) + '</b><i class="dm2-t-barra" aria-hidden="true"></i></a>';
      };
      return '<a class="dm2-t-geral" href="' + (modo === 'area' ? 'domino.html' + (op.atual ? '#m-' + slug(op.atual) : '') : '#dm2-topo') + '" data-ir-geral data-tudo-f style="--f:' + (M ? M.frac.toFixed(3) : 0) + '">' + anelVivo('') +
        '<span><b>' + (modo === 'area' ? 'Mapa geral' : 'Tudo') + '</b><small data-tudo-n data-pct>' + (M ? pct(M.frac) : '…') + '</small></span></a>' +
        '<div class="dm2-t-lista">' + (M ? M.materias.map(item).join('') : '') + '</div>' +
        (modo === 'area' && op.atual ? '<button type="button" class="botao pri dm2-t-marcar" data-marcar-area>' + ic('check') + 'Marcar domínios</button>' : '');
    }
    function render() { el.innerHTML = html(); pintar(el); }
    carregar().then(render).catch(function () { el.innerHTML = ''; });
    render();
    aoMudar(function () { pintar(el); });
    el.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-marcar-area]')) { abrirMarcarArea(op.atual); return; }
      if (modo !== 'dominio') return;
      var a = ev.target.closest('[data-ir-mat]');
      if (a) {
        ev.preventDefault();
        var s = document.querySelector('[data-mat-sec="' + a.getAttribute('data-ir-mat') + '"]');
        if (s) { s.scrollIntoView({ behavior: mov(), block: 'start' }); try { history.replaceState(null, '', '#m-' + slug(a.getAttribute('data-ir-mat'))); } catch (e) { /* file: */ } }
        else if (op.aoPedir) op.aoPedir(a.getAttribute('data-ir-mat'));
        return;
      }
      if (ev.target.closest('[data-ir-geral]')) { ev.preventDefault(); window.scrollTo({ top: 0, behavior: mov() }); }
    });
    /* acende a matéria que está na tela */
    if (modo === 'dominio' && 'IntersectionObserver' in window) {
      var vistos = new Map();
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) { vistos.set(e.target, e.isIntersecting ? e.intersectionRect.height : 0); });
        var melhor = null, h = 0;
        vistos.forEach(function (v, k) { if (v > h) { h = v; melhor = k; } });
        el.querySelectorAll('[data-ir-mat]').forEach(function (a) { a.classList.toggle('na-tela', !!melhor && a.getAttribute('data-ir-mat') === melhor.getAttribute('data-mat-sec')); });
        var at = el.querySelector('.na-tela'); if (at && el.scrollWidth > el.clientWidth + 4) { var lista = el.querySelector('.dm2-t-lista'); if (lista) lista.scrollTo({ left: at.offsetLeft - 40, behavior: 'smooth' }); }
      }, { threshold: [0, 0.1, 0.3, 0.6], rootMargin: '-20% 0px -40% 0px' });
      var observar = function () { ob.disconnect(); vistos.clear(); document.querySelectorAll('[data-mat-sec]').forEach(function (s) { ob.observe(s); }); };
      window.addEventListener('dominio:desenhado', observar);
      setTimeout(observar, 400);
    }
    return { render: render };
  }

  /* "Marcar domínios" de dentro da Área: o índice daquela matéria, numa folha larga */
  function abrirMarcarArea(nome) {
    if (!P || !P.folha) return;
    var f = P.folha({ titulo: 'Marcar domínios · ' + esc(nome), sub: 'O índice da matéria: marque cada subtópico que você já domina', larga: true, html: '<div class="dm2-folha-area"></div>' });
    var c = montar(f.corpo.querySelector('.dm2-folha-area'), { so: nome, vista: 'indice', embutido: true });
    c.pronto && c.pronto.then && c.pronto.then(function () { c.cfg.vista = 'indice'; c.desenhar(); });
  }

  /* o painel do estudo dentro da Área: os subtópicos e os itens, marcáveis */
  function blocoEstudo(el, codigo) {
    if (!el) return;
    var render = function () {
      var est = modelo && modelo.porCodigo[codigo];
      if (!est) { el.innerHTML = ''; return; }
      var b = buscador('');
      el.innerHTML = '<div class="dm2-bloco ' + corDe(est.materia) + '">' + numEstudo(est) +
        (est.conceitos.length ? '<p class="rot">Subtópicos: toque no que já domina</p>' + chipsConceitos(est, b) : '') +
        (est.itens.length ? '<p class="rot">Itens da prova</p>' + listaItens(est.materia, est.itens, b) : '') +
        '<p class="dm2-bloco-links"><a href="domino.html#m-' + slug(est.materia) + '" class="ar-link">Ver no mapa geral</a> · <button type="button" class="ar-link" data-abrir-est="' + esc(est.codigo) + '">Abrir a folha do estudo</button></p></div>';
      pintar(el);
    };
    carregar().then(render);
    if (!el._dm2) {
      el._dm2 = true;
      var solta = aoMudar(function () { if (!document.body.contains(el)) { solta(); return; } pintar(el); var n = el.querySelector('.dm2-f-num'); var est = modelo.porCodigo[codigo]; if (n && est) n.outerHTML = numEstudo(est); });
      el.addEventListener('click', function (ev) {
        var k = ev.target.closest('[data-k]'); if (k) { alternar(k.getAttribute('data-k')); return; }
        var s = ev.target.closest('[data-estudar]'); if (s) { abrirEstudo(codigo); return; }
        var a = ev.target.closest('[data-abrir-est]'); if (a) abrirEstudo(a.getAttribute('data-abrir-est'));
      });
    }
  }

  window.Dominio = {
    montar: montar, trilho: trilho, estudo: abrirEstudo, blocoEstudo: blocoEstudo, carregar: carregar, marcarConceitos: marcarConceitos, marcarItem: marcarItem,
    marcarArea: abrirMarcarArea, aoMudar: aoMudar, modelo: function () { return modelo; }, VISTAS: VISTAS, ORDEM: ORDEM, slug: slug,
  };
})();
