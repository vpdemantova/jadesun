/* ============================================================
   OS GUIAS — a página (09/out/2026, PERFIL.md item 74)
   1. O instante: o que ler, estudar, ouvir e abrir agora (muda com a hora do dia).
   2. O mundo agora: as manchetes das fontes, por grupo e língua (/api/guias/agora).
   3. Os livros, por necessidade. 4. As necessidades do mundo (os 17 ODS). 5. Os caminhos.
   ============================================================ */
(function () {
  'use strict';

  var G = window.GUIAS, P = window.Perfil, C = window.CURADORIA;
  var raiz = document.getElementById('gu');
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function ano(a) { return a < 0 ? Math.abs(a) + ' a.C.' : String(a); }
  function ha(iso) {
    if (!iso) return '';
    var m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (!isFinite(m)) return '';
    if (m < 1) return 'agora'; if (m < 60) return 'há ' + m + ' min'; var h = Math.round(m / 60); if (h < 24) return 'há ' + h + ' h';
    var d = Math.round(h / 24); return d === 1 ? 'ontem' : 'há ' + d + ' dias';
  }
  /* um sorteio que muda com o dia (e com a hora, quando pedido): o mesmo instante dá a mesma escolha */
  function semente(porHora) { var d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + (porHora ? d.getHours() * 7 : 0); }
  function escolher(lista, s) { return lista.length ? lista[Math.abs(Math.imul(s, 2654435761) >>> 0) % lista.length] : null; }
  var porFonte = {}; G.fontes.forEach(function (f) { porFonte[f[0]] = f; });
  /* no site exportado, só se mostra o caminho para uma página que foi junto (item 75: os Guias também no público) */
  var EST = window.JADESUN_ESTATICO || null, PUBLICO = !!(EST && EST.modo === 'publico');
  function existe(href) {
    if (!EST || !EST.paginas || /^https?:/.test(href) || href.charAt(0) === '#') return true;
    var pg = href.split(/[?#]/)[0].replace(/\.html$/, '');
    return EST.paginas.indexOf({ 'linha-do-tempo': 'quando' }[pg] || pg) >= 0;
  }

  var dados = null, filtro = { grupo: '', lingua: '' };

  /* ---------- 1. o instante ---------- */
  function periodo() { var h = new Date().getHours(); return h < 5 ? ['madrugada', 'Boa madrugada', 'cultura'] : h < 12 ? ['manha', 'Bom dia', 'mundo'] : h < 18 ? ['tarde', 'Boa tarde', 'ciencia'] : ['noite', 'Boa noite', 'cultura']; }
  function htmlInstante(dom) {
    var pe = periodo(), s = semente(true);
    var grupoLer = pe[2], fontesG = G.fontes.filter(function (f) { return f[1] === grupoLer; });
    var ler = null;
    if (dados) { for (var k = 0; k < fontesG.length && !ler; k++) { var f = escolher(fontesG, s + k), it = dados.fontes[f[0]] && dados.fontes[f[0]].itens[0]; if (it) ler = { f: f, it: it }; } }
    var ouvirTodos = []; (C ? C.posts : []).forEach(function (p) { p.partes.forEach(function (x) { x.ouvir.forEach(function (o) { ouvirTodos.push(o); }); }); });
    var ouvir = escolher(ouvirTodos, semente(true) + 3);
    var todosLivros = []; G.livros.forEach(function (g) { g.livros.forEach(function (l) { todosLivros.push(l); }); });
    var livro = escolher(todosLivros, semente(false));
    var estudo = dom;
    return '<section class="gu-instante" data-secao="instante" data-rotulo="O instante"><div class="gu-inst-cab"><p class="rot">' + esc(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })) + ' · ' + esc(pe[0] === 'manha' ? 'manhã' : pe[0]) + '</p><h2 class="gu-inst-t">' + esc(pe[1]) + '. O que fazer com este instante:</h2></div>' +
      '<div class="gu-inst-grade">' +
        '<a class="gu-inst-c" href="' + (ler ? esc(ler.it.link) + '" target="_blank" rel="noopener' : '#mundo') + '"><span class="gu-inst-q">' + ic('buscar') + 'Ler agora</span><b>' + (ler ? esc(ler.it.titulo) : 'As manchetes estão chegando…') + '</b><small>' + (ler ? esc(ler.f[2]) + ' · ' + esc(ha(ler.it.data)) : 'das melhores fontes, sem algoritmo') + '</small></a>' +
        (PUBLICO ? '' : '<a class="gu-inst-c gu-inst-estudo" href="' + (estudo ? 'area.html?m=' + encodeURIComponent(estudo.materia) + '#n=' + esc(estudo.codigo) : 'domino.html') + '"><span class="gu-inst-q">' + ic('domino') + 'Estudar agora</span><b>' + (estudo ? esc(estudo.codigo + ' · ' + estudo.titulo) : 'O mapa geral') + '</b><small>' + (estudo ? esc(estudo.materia) + ' · ' + estudo.n.feitos + '/' + estudo.n.total + ' marcados · ' + esc(estudo.porque) : 'marque o que já sabe') + '</small></a>') +
        (ouvir ? '<a class="gu-inst-c" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(ouvir[0] + ' ' + ouvir[1]) + '" target="_blank" rel="noopener"><span class="gu-inst-q">' + ic('musica') + 'Ouvir agora</span><b>' + esc(ouvir[0]) + ', ' + esc(ouvir[1]) + '</b><small>' + esc(ouvir[2]) + ' · da Curadoria nº 1</small></a>' : '') +
        (livro ? '<a class="gu-inst-c" href="#livros"><span class="gu-inst-q">' + ic('livro') + 'Um livro para hoje</span><b>' + esc(livro[1]) + '</b><small>' + esc(livro[0]) + ', ' + ano(livro[2]) + ' · ' + esc(livro[3]) + '</small></a>' : '') +
      '</div></section>';
  }
  /* o estudo do instante: na matéria menos marcada (prioridade antes), o primeiro estudo do caminho ainda por fazer */
  function estudoDoInstante(M) {
    if (!M) return null;
    var mats = M.materias.slice().sort(function (a, b) { var pa = /prioridade 1/.test(a.nota) ? 0 : /prioridade 2/.test(a.nota) ? 1 : 2, pb = /prioridade 1/.test(b.nota) ? 0 : /prioridade 2/.test(b.nota) ? 1 : 2; return pa - pb || a.frac - b.frac; });
    for (var i = 0; i < mats.length; i++) {
      var m = mats[i], porC = {}; m.estudos.forEach(function (e) { porC[e.codigo] = e; });
      var cam = (m.caminho || []).map(function (c) { return porC[c]; }).filter(Boolean);
      var e = cam.filter(function (x) { return x.sit !== 'dominado' && x.n.total; })[0];
      if (e) { e.porque = i === 0 && /prioridade/.test(m.nota) ? m.nota : 'a matéria menos marcada'; return e; }
    }
    return null;
  }

  /* ---------- 2. o mundo agora ---------- */
  function htmlMundo() {
    var quando = dados ? (dados.semInternet ? 'sem internet: a última cópia, de ' : 'atualizado ') + ha(new Date(dados.em).toISOString()) : 'buscando…';
    return '<section class="gu-sec" id="mundo" data-secao="mundo" data-rotulo="O mundo agora"><div class="gu-sec-cab"><div><h2 class="h2">O mundo agora</h2><p class="gu-lead">Direto das fontes, sem algoritmo: só a data ordena. Cada fonte diz por que está aqui.</p></div>' +
      '<div class="gu-quando"><span>' + esc(EST ? 'como estavam em ' + new Date(EST.gerado).toLocaleDateString('pt-BR') : quando) + '</span>' + (EST ? '' : '<button type="button" class="botao leve" data-atualizar>' + ic('restaurar') + 'Atualizar</button>') + '</div></div>' +
      '<div class="gu-filtros"><div class="gu-chips" role="group" aria-label="Grupos"><button type="button" class="chip' + (!filtro.grupo ? ' on' : '') + '" data-grupo="">Tudo</button>' + G.grupos.map(function (g) { return '<button type="button" class="chip' + (filtro.grupo === g[0] ? ' on' : '') + '" data-grupo="' + g[0] + '">' + esc(g[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="gu-chips" role="group" aria-label="Língua"><button type="button" class="chip' + (!filtro.lingua ? ' on' : '') + '" data-lingua="">Todas as línguas</button><button type="button" class="chip' + (filtro.lingua === 'pt' ? ' on' : '') + '" data-lingua="pt">Português</button><button type="button" class="chip' + (filtro.lingua === 'en' ? ' on' : '') + '" data-lingua="en">Inglês</button></div></div>' +
      G.grupos.filter(function (g) { return !filtro.grupo || g[0] === filtro.grupo; }).map(function (g) {
        var fs = G.fontes.filter(function (f) { return f[1] === g[0] && (!filtro.lingua || f[4] === filtro.lingua); });
        if (!fs.length) return '';
        return '<div class="gu-grupo"><h3 class="gu-grupo-t">' + esc(g[1]) + '<small>' + esc(g[2]) + '</small></h3><div class="gu-fontes">' + fs.map(function (f) {
          var d = dados && dados.fontes[f[0]], itens = d ? d.itens.slice(0, 4) : null;
          return '<article class="gu-fonte"><header><a href="' + esc(f[3]) + '" target="_blank" rel="noopener"><b>' + esc(f[2]) + '</b></a><span class="gu-lingua">' + f[4] + '</span></header><p class="gu-porque">' + esc(f[5]) + '</p>' +
            (itens === null ? '<p class="gu-carregando">buscando…</p>' : itens.length ? '<ul class="gu-itens">' + itens.map(function (it) { return '<li><a href="' + esc(it.link) + '" target="_blank" rel="noopener">' + esc(it.titulo) + '</a><small>' + esc(ha(it.data)) + (d.velho ? ' · cópia' : '') + '</small></li>'; }).join('') + '</ul>' : '<p class="gu-carregando">não respondeu agora</p>') + '</article>';
        }).join('') + '</div></div>';
      }).join('') + '</section>';
  }

  /* ---------- 3, 4, 5 ---------- */
  function htmlLivros() {
    return '<section class="gu-sec" id="livros" data-secao="livros" data-rotulo="Os livros"><h2 class="h2">Os livros</h2><p class="gu-lead">Os especiais, por necessidade: cada um com o porquê. O cânone começa pela sua lista (a Teogonia, a Comédia, o Paraíso perdido, o ABC da literatura).</p>' +
      '<div class="gu-livros">' + G.livros.map(function (g) {
        return '<div class="gu-livros-g"><h3>' + esc(g.nome) + '</h3><ol>' + g.livros.map(function (l) { return '<li><b>' + esc(l[1]) + '</b><span>' + esc(l[0]) + ' · ' + ano(l[2]) + '</span><small>' + esc(l[3]) + '</small></li>'; }).join('') + '</ol></div>';
      }).join('') + '</div></section>';
  }
  function htmlNecessidades() {
    return '<section class="gu-sec" id="necessidades" data-secao="necessidades" data-rotulo="As necessidades"><h2 class="h2">As necessidades</h2><p class="gu-lead">As do mundo: os 17 Objetivos de Desenvolvimento Sustentável, que os países da ONU assinaram em 2015 para 2030. As do planeta, nos hábitos do Atlas. As suas, no Hoje.</p>' +
      '<ol class="gu-ods">' + G.ods.map(function (o) { return '<li style="--c:' + o[2] + '"><span>' + o[0] + '</span><b>' + esc(o[1]) + '</b></li>'; }).join('') + '</ol>' +
      '<div class="gu-nec-links">' + (existe('atlas.html') ? '<a class="botao" href="atlas.html#planeta">' + ic('planeta') + 'O planeta e os hábitos</a>' : '') + (existe('hoje.html') ? '<a class="botao" href="hoje.html#hj-painel">' + ic('hoje') + 'As suas, no Hoje</a>' : '') + '<a class="botao leve" href="https://brasil.un.org/pt-br/sdgs" target="_blank" rel="noopener">Os ODS na ONU Brasil →</a></div></section>';
  }
  function htmlCaminhos() {
    return '<section class="gu-sec" id="caminhos" data-secao="caminhos" data-rotulo="Os caminhos"><h2 class="h2">Os caminhos</h2><p class="gu-lead">O Portal Solar inteiro, como guia: cada pergunta leva a um lugar.</p><div class="gu-caminhos">' +
      G.caminhos.filter(function (c) { return existe(c[0]); }).map(function (c) { return '<a class="gu-caminho" href="' + esc(c[0]) + '">' + ic(c[1]) + '<span><b>' + esc(c[2]) + '</b><small>' + esc(c[3]) + '</small></span></a>'; }).join('') + '</div></section>';
  }

  var estudoAtual = null, adiado = false;
  function desenhar() {
    /* enquanto as seções estão sendo arrumadas, não redesenha por baixo: espera o "Pronto" */
    if (document.documentElement.classList.contains('arrumando')) { adiado = true; return; }
    raiz.innerHTML = htmlInstante(estudoAtual) + htmlMundo() + htmlLivros() + htmlNecessidades() + htmlCaminhos();
    if (window.Arrumar) window.Arrumar.aplicar();
  }
  document.addEventListener('arrumar:saiu', function () { if (adiado) { adiado = false; desenhar(); } });
  function carregarMundo(fresco) {
    return fetch('/api/guias/agora' + (fresco ? '?fresco=1' : ''), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (d) { if (d) { dados = d; desenhar(); } });
  }
  raiz.addEventListener('click', function (ev) {
    var g = ev.target.closest('[data-grupo]'); if (g) { filtro.grupo = g.dataset.grupo; desenhar(); return; }
    var l = ev.target.closest('[data-lingua]'); if (l) { filtro.lingua = l.dataset.lingua; desenhar(); return; }
    var a = ev.target.closest('[data-atualizar]'); if (a) { a.disabled = true; carregarMundo(true); }
  });

  if (!G || !raiz) return;
  desenhar();
  carregarMundo(false);
  if (window.Dominio) window.Dominio.carregar().then(function (M) { estudoAtual = estudoDoInstante(M); desenhar(); }).catch(function () {});
  /* o instante muda com a hora: a cada 10 minutos, redesenha (sem buscar de novo) */
  setInterval(function () { if (!document.hidden) desenhar(); }, 10 * 60 * 1000);
})();
