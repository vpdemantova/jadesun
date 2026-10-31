/* ============================================================
   O CADERNO DE NOTAS — o editor zen (09/out/2026, PERFIL.md item 75)
   "Nota e somente nota: abre um plano e escreve, já salva e tem certeza de que aquilo fica armazenado e
   seguro logo de cara; se clicar, dá pra salvar em outro lugar (mover), acessar todos os outros arquivos,
   criar pastas e projetos, navegar por todas as ideias."

   · Abre por um botão em todas as páginas (o caderno, na barra do alto) ou pela tecla N.
   · A primeira tecla já cria a nota na Entrada do caderno; depois, cada pausa grava (lib/notas.mjs).
   · Enquanto isso, uma cópia fica neste navegador: se o servidor cair, nada se perde, e a nota vai para o
     caderno quando ele voltar.
   · Ao fechar, a nota recém-criada ganha o nome da primeira linha.
   · Mover, todas as notas, procurar, nova pasta, novo projeto: tudo numa gaveta que só abre se você pedir.
   window.Nota = { abrir, fechar }
   ============================================================ */
(function () {
  'use strict';

  var H = { 'Content-Type': 'application/json', 'X-Perfil': '1' };
  var CHAVE_RASCUNHO = 'nota:rascunho';
  /* 25/out/2026 (registro 119): no site, as notas moram neste aparelho (o estatico.js responde as mesmas
     rotas); dá para baixar uma, baixar todas num .zip e trazer notas do computador */
  var LOCAL = !!window.JADESUN_ESTATICO;
  var T = LOCAL
    ? { guardado: 'guardado neste aparelho às ', aberta: 'neste aparelho · mudada em ', raiz: 'as notas', arvore: 'Neste aparelho',
        sumiu: 'A nota não existe mais neste aparelho (foi movida ou apagada?). O texto continua aqui: ao escrever, ele vira uma nota nova.',
        mudou: 'Esta nota mudou em outro aparelho (chegou pelo seu Drive). O seu texto continua aqui.', ver: 'Ver a outra versão',
        viu: 'a outra versão · a sua ficou guardada à parte neste aparelho', falhou: 'não deu para guardar; tentando de novo',
        semArvore: 'As notas deste aparelho não abriram.' }
    : { guardado: 'guardado no caderno às ', aberta: 'no caderno · mudada em ', raiz: 'o caderno', arvore: 'O caderno',
        sumiu: 'A nota não existe mais no caderno (foi movida ou apagada?). O texto continua aqui: ao escrever, ele vira uma nota nova na Entrada.',
        mudou: 'Esta nota mudou fora daqui (no Obsidian ou em outro aparelho). O seu texto continua aqui.', ver: 'Ver a versão do caderno',
        viu: 'versão do caderno · a sua ficou guardada neste navegador', falhou: 'sem servidor: guardado neste navegador; vai para o caderno quando ele voltar',
        semArvore: 'Sem servidor: as notas aparecem quando ele voltar.' };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function ler(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function guardar(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem memória */ } }
  function post(rota, corpo) {
    return fetch('/api/notas/' + rota, { method: 'POST', headers: H, body: JSON.stringify(corpo) }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.erro || 'Não deu certo.'); e.status = r.status; e.atual = j.atual; throw e; } return j; });
    });
  }
  function hora(d) { return (d ? new Date(d) : new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  var PADRAO = /^\d{4}-\d{2}-\d{2} \d{2}h\d{2}( \d+)?\.md$/;

  var el = null, area = null;
  var n = { rel: null, hash: '', criadaAgora: false, pasta: null, sujo: false, gravando: null, espera: 0, conflito: null };
  var entrada = 'Logboard/z Entrada';

  /* ---------- montar o plano (uma vez) ---------- */
  function montar() {
    if (el) return;
    el = document.createElement('div');
    el.className = 'nota';
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Nota');
    el.setAttribute('data-lenis-prevent', '');
    el.innerHTML =
      '<header class="nota-topo">' +
        '<p class="nota-onde"><button type="button" class="nota-pasta" data-nota="mover" title="Mudar de pasta">' + ic('pasta') + '<span id="nota-pasta"></span></button><span class="nota-nome" id="nota-nome">nota nova</span></p>' +
        '<p class="nota-estado" id="nota-estado" aria-live="polite"><i></i><span>pronto para escrever</span></p>' +
        '<div class="nota-acoes">' +
          '<button type="button" class="ic" data-nota="nova" title="Nota nova">' + ic('aproximar') + '</button>' +
          '<button type="button" class="ic" data-nota="notas" title="Todas as notas (Ctrl+O)">' + ic('pasta') + '</button>' +
          '<button type="button" class="ic" data-nota="mover" title="Mover para outra pasta">' + ic('mover') + '</button>' +
          (LOCAL ? '<button type="button" class="ic" data-nota="baixar" title="Baixar esta nota (.md)">' + ic('baixar') + '</button>' : '') +
          '<button type="button" class="ic" data-nota="fechar" title="Fechar (Esc): já está guardada">' + ic('fechar') + '</button>' +
        '</div>' +
      '</header>' +
      '<div class="nota-aviso" id="nota-aviso" hidden></div>' +
      '<div class="nota-plano"><textarea class="nota-texto" id="nota-texto" spellcheck="true" aria-label="A nota" placeholder="Escreva. Já fica guardado."></textarea></div>' +
      '<footer class="nota-pe"><span id="nota-palavras">0 palavras</span><span class="nota-dica">a primeira linha vira o nome da nota</span></footer>' +
      '<aside class="nota-gaveta" id="nota-gaveta" hidden aria-label="Todas as notas">' +
        '<header class="nota-g-cab"><b id="nota-g-titulo">Todas as notas</b><button type="button" class="ic" data-nota="gaveta-fechar" aria-label="Fechar a gaveta">' + ic('fechar') + '</button></header>' +
        '<label class="nota-g-busca"><span class="sr">Procurar nas notas</span><input type="search" id="nota-g-q" placeholder="Procurar em todas as notas…" autocomplete="off"></label>' +
        '<div class="nota-g-acoes"><button type="button" class="botao leve" data-nota-g="pasta">' + ic('pasta') + 'Nova pasta</button><button type="button" class="botao leve" data-nota-g="projeto">' + ic('livro') + 'Novo projeto</button></div>' +
        '<p class="nota-g-sel" id="nota-g-sel"></p>' +
        '<div class="nota-g-corpo" id="nota-g-corpo"></div>' +
        (LOCAL ? '<footer class="nota-g-pe"><p>As notas moram neste aparelho.</p><div>' +
          '<button type="button" class="botao leve" data-nota-x="zip">' + ic('baixar') + 'Baixar todas (.zip)</button>' +
          '<button type="button" class="botao leve" data-nota-x="trazer">' + ic('arquivo') + 'Trazer notas (.md)</button>' +
          (window.Nuvem ? '<button type="button" class="botao leve" data-nota-x="nuvem" id="nota-g-nuvem">Guardar no seu Drive</button>' : '') +
          '</div><input type="file" id="nota-g-arq" accept=".md,.txt,text/markdown,text/plain" multiple hidden></footer>' : '') +
      '</aside>';
    document.body.appendChild(el);
    area = el.querySelector('#nota-texto');
    area.addEventListener('input', aoEscrever);
    el.addEventListener('click', aoClicar);
    el.addEventListener('keydown', aoTecla);
    el.addEventListener('submit', function (ev) { var f = ev.target.closest('[data-nota-criar]'); if (f) { ev.preventDefault(); criarDoCampo(f); } });
    el.addEventListener('mousemove', function () { el.classList.remove('escrevendo'); });
    el.querySelector('#nota-g-q').addEventListener('input', function (ev) { clearTimeout(tBusca); var q = ev.target.value.trim(); tBusca = setTimeout(function () { procurar(q); }, 220); });
    /* no site, gravar é imediato (o aparelho responde na hora) e o rascunho já está guardado: não precisa perguntar */
    window.addEventListener('beforeunload', function (ev) { if (n.sujo) { gravarAgora(); if (!LOCAL) { ev.preventDefault(); ev.returnValue = ''; } } });
    if (LOCAL) el.querySelector('#nota-g-arq').addEventListener('change', function (ev) { trazer(ev.target.files); ev.target.value = ''; });
  }

  /* ---------- o estado (o ponto: verde guardado, âmbar guardando, vermelho sem servidor) ---------- */
  function estado(tipo, texto) {
    var e = el.querySelector('#nota-estado'); e.dataset.tipo = tipo; e.querySelector('span').textContent = texto;
  }
  function crescer() { if (!area || CSS.supports && CSS.supports('field-sizing', 'content')) return; area.style.height = 'auto'; area.style.height = Math.max(area.scrollHeight, window.innerHeight * 0.6) + 'px'; }
  function pintarOnde() {
    var rel = n.rel || ((n.pasta != null ? n.pasta : entrada) + '/');
    var partes = rel.split('/'), nome = n.rel ? partes.pop().replace(/\.(md|txt)$/i, '') : 'nota nova';
    if (!n.rel) partes.pop();
    el.querySelector('#nota-pasta').textContent = partes.join(' › ') || T.raiz;
    el.querySelector('#nota-nome').textContent = nome;
    crescer();
    var p = (area.value.match(/\S+/g) || []).length;
    el.querySelector('#nota-palavras').textContent = p + (p === 1 ? ' palavra' : ' palavras');
  }

  /* ---------- escrever e gravar ---------- */
  function aoEscrever() {
    n.sujo = true;
    el.classList.add('escrevendo');
    guardar(CHAVE_RASCUNHO, { rel: n.rel, hash: n.hash, pasta: n.pasta, texto: area.value, em: Date.now(), criadaAgora: n.criadaAgora });
    estado('guardando', 'guardando…');
    pintarOnde();
    clearTimeout(n.espera);
    n.espera = setTimeout(gravarAgora, n.rel ? 650 : 250);
  }
  function gravarAgora() {
    clearTimeout(n.espera);
    if (n.gravando) return n.gravando.then(function () { return n.sujo ? gravarAgora() : null; });
    if (!n.sujo || n.conflito) return Promise.resolve();
    var texto = area.value;
    if (!n.rel && !texto.trim()) { n.sujo = false; guardar(CHAVE_RASCUNHO, null); estado('pronto', 'pronto para escrever'); return Promise.resolve(); }
    var corpo = n.rel ? { rel: n.rel, texto: texto, base: n.hash } : { texto: texto, pasta: n.pasta != null ? n.pasta : entrada };
    n.gravando = post('gravar', corpo).then(function (j) {
      n.rel = j.rel; n.hash = j.hash; if (j.criada) n.criadaAgora = true;
      if (area.value === texto) { n.sujo = false; guardar(CHAVE_RASCUNHO, null); estado('guardado', T.guardado + hora()); }
      pintarOnde();
    }).catch(function (e) {
      if (e.status === 409 && e.atual) { mostrarConflito(e.atual); return; }
      if (e.status === 404) { n.rel = null; n.hash = ''; avisar(T.sumiu); return; }
      /* no site: o aparelho encheu (o rascunho continua guardado; baixar e apagar libera espaço) */
      if (e.status === 507) { estado('sem', 'não coube neste aparelho'); avisar(e.message); return; }
      estado('sem', T.falhou);
      clearTimeout(n.espera); n.espera = setTimeout(gravarAgora, 5000);
    }).then(function () { n.gravando = null; });
    return n.gravando;
  }
  /* a nota mudou fora daqui: nada se perde; você escolhe */
  function mostrarConflito(atual) {
    n.conflito = atual;
    estado('sem', 'a nota mudou fora daqui');
    avisar(T.mudou, [['ver', T.ver], ['copia', 'Guardar o meu como uma nota nova']]);
  }
  function avisar(t, botoes) {
    var a = el.querySelector('#nota-aviso');
    a.innerHTML = '<p>' + esc(t) + '</p>' + (botoes ? '<div>' + botoes.map(function (b) { return '<button type="button" class="botao" data-nota-conflito="' + b[0] + '">' + esc(b[1]) + '</button>'; }).join('') + '</div>' : '<button type="button" class="ic" data-nota-conflito="ok" aria-label="Fechar o aviso">' + ic('fechar') + '</button>');
    a.hidden = false;
  }

  /* ---------- abrir, nova, fechar ---------- */
  function carregarNota(rel) {
    return fetch('/api/notas/ler?rel=' + encodeURIComponent(rel), { cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não abriu.'); return j; }); })
      .then(function (j) {
        n = { rel: j.rel, hash: j.hash, criadaAgora: false, pasta: null, sujo: false, gravando: null, espera: 0, conflito: null };
        area.value = j.texto; pintarOnde(); estado('guardado', T.aberta + new Date(j.modificado).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
        area.focus(); area.setSelectionRange(area.value.length, area.value.length);
      });
  }
  /* a nota nova que ainda tem o nome da hora ganha o nome da primeira linha */
  function darNome() {
    if (!n.rel || !n.criadaAgora || !PADRAO.test(n.rel.split('/').pop())) return Promise.resolve();
    var linha = (area.value.split('\n').filter(function (l) { return l.trim(); })[0] || '').replace(/^#+\s*/, '').trim();
    if (!linha) return Promise.resolve();
    return post('mover', { rel: n.rel, nome: linha.slice(0, 80) }).then(function (j) { n.rel = j.rel; n.criadaAgora = false; pintarOnde(); }).catch(function () {});
  }
  function terminar() { return gravarAgora().then(darNome); }
  function nova(pasta) {
    return terminar().then(function () {
      n = { rel: null, hash: '', criadaAgora: false, pasta: pasta != null ? pasta : null, sujo: false, gravando: null, espera: 0, conflito: null };
      area.value = ''; el.querySelector('#nota-aviso').hidden = true;
      pintarOnde(); estado('pronto', 'pronto para escrever'); area.focus();
    });
  }
  function abrir(op) {
    op = op || {};
    montar();
    document.documentElement.classList.add('com-nota');
    el.classList.add('aberta');
    var r = ler(CHAVE_RASCUNHO);
    if (op.rel) carregarNota(op.rel).catch(function (e) { avisar(e.message); });
    else if (r && r.texto && r.texto.trim()) {
      /* o que ficou só no navegador volta, e segue para o caderno */
      n = { rel: r.rel || null, hash: r.hash || '', criadaAgora: !!r.criadaAgora, pasta: r.pasta != null ? r.pasta : null, sujo: true, gravando: null, espera: 0, conflito: null };
      area.value = r.texto; pintarOnde(); estado('guardando', 'retomando o que ficou neste navegador…'); gravarAgora();
    } else if (!n.rel && !area.value) { pintarOnde(); estado('pronto', 'pronto para escrever'); }
    setTimeout(function () { area.focus(); }, 40);
    fetch('/api/notas/arvore').then(function (x) { return x.json(); }).then(function (a) { arvoreAtual = a; entrada = a.entrada || entrada; if (!n.rel) pintarOnde(); }).catch(function () {});
  }
  function fechar() {
    if (!el) return Promise.resolve();
    return terminar().then(function () {
      el.classList.remove('aberta'); document.documentElement.classList.remove('com-nota');
      fecharGaveta();
      if (!n.sujo && n.rel) { /* a próxima abertura começa uma nota nova */ n = { rel: null, hash: '', criadaAgora: false, pasta: null, sujo: false, gravando: null, espera: 0, conflito: null }; area.value = ''; }
    });
  }

  /* ---------- a gaveta: todas as notas, procurar, mover, pastas e projetos ---------- */
  var arvoreAtual = null, modoGaveta = 'notas', pastaSel = null, abertas = {}, tBusca = 0;
  function abrirGaveta(modo) {
    modoGaveta = modo || 'notas';
    var g = el.querySelector('#nota-gaveta'); g.hidden = false; el.classList.add('com-gaveta');
    el.querySelector('#nota-g-titulo').textContent = modoGaveta === 'mover' ? 'Mover para…' : 'Todas as notas';
    pastaSel = pastaSel || (n.rel ? n.rel.split('/').slice(0, -1).join('/') : (n.pasta != null ? n.pasta : entrada));
    abrirAte(pastaSel);
    return fetch('/api/notas/arvore?fresco=1').then(function (r) { return r.json(); }).then(function (a) { arvoreAtual = a; pintarGaveta(); })
      .catch(function () { el.querySelector('#nota-g-corpo').innerHTML = '<p class="nota-g-vazio">' + T.semArvore + '</p>'; });
  }
  function fecharGaveta() { var g = el && el.querySelector('#nota-gaveta'); if (g) g.hidden = true; if (el) el.classList.remove('com-gaveta'); }
  function abrirAte(rel) { var p = ''; String(rel || '').split('/').forEach(function (x) { if (!x) return; p = p ? p + '/' + x : x; abertas[p] = true; }); }
  function pintarGaveta() {
    if (!arvoreAtual) return;
    el.querySelector('#nota-g-sel').innerHTML = modoGaveta === 'mover'
      ? 'Escolha a pasta e toque em <b>Mover para cá</b>.'
      : 'Pasta: <b>' + esc((pastaSel || T.raiz).split('/').join(' › ')) + '</b>';
    var bn = el.querySelector('#nota-g-nuvem');
    if (bn && window.Nuvem && window.Nuvem.rotuloDrive) bn.textContent = window.Nuvem.rotuloDrive();
    var notas = arvoreAtual.notas, html = '';
    if (modoGaveta !== 'mover') {
      var rec = notas.slice().sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
      html += '<p class="nota-g-t">Recentes</p><ul class="nota-g-lista">' + rec.map(function (x) { return itemNota(x); }).join('') + '</ul>';
    }
    /* a árvore: as pastas de cima; cada pasta aberta mostra as de dentro e as notas */
    var filhos = {}, notasDe = {};
    arvoreAtual.pastas.forEach(function (p) { var pai = p.indexOf('/') >= 0 ? p.slice(0, p.lastIndexOf('/')) : ''; (filhos[pai] = filhos[pai] || []).push(p); });
    notas.forEach(function (x) { var pai = x[0].indexOf('/') >= 0 ? x[0].slice(0, x[0].lastIndexOf('/')) : ''; (notasDe[pai] = notasDe[pai] || []).push(x); });
    function ramo(pai, fundo) {
      var h = '';
      (filhos[pai] || []).forEach(function (p) {
        var nome = p.slice(p.lastIndexOf('/') + 1), aberta = !!abertas[p], sel = p === pastaSel;
        h += '<li><div class="nota-g-pasta' + (sel ? ' sel' : '') + '" style="--f:' + fundo + '"><button type="button" class="nota-g-abre" data-nota-pasta="' + esc(p) + '" aria-expanded="' + aberta + '"><i aria-hidden="true">' + (aberta ? '▾' : '▸') + '</i>' + ic('pasta') + '<span>' + esc(nome) + '</span></button>' +
          (modoGaveta === 'mover' ? (sel ? '<button type="button" class="botao pri nota-g-aqui" data-nota-mover-para="' + esc(p) + '">Mover para cá</button>' : '') : '<button type="button" class="ic" data-nota-nova-em="' + esc(p) + '" title="Nota nova aqui">' + ic('aproximar') + '</button>') + '</div>';
        if (aberta) h += '<ul>' + ramo(p, fundo + 1) + (modoGaveta === 'mover' ? '' : (notasDe[p] || []).sort(function (a, b) { return a[0].localeCompare(b[0], 'pt-BR'); }).map(function (x) { return itemNota(x, fundo + 1); }).join('')) + '</ul>';
        h += '</li>';
      });
      return h;
    }
    html += '<p class="nota-g-t">' + T.arvore + '</p><ul class="nota-g-arvore">' + ramo('', 0) + '</ul>';
    el.querySelector('#nota-g-corpo').innerHTML = html;
  }
  function itemNota(x, fundo) {
    var rel = x[0], nome = rel.slice(rel.lastIndexOf('/') + 1).replace(/\.(md|txt)$/i, ''), pasta = rel.slice(0, Math.max(0, rel.lastIndexOf('/')));
    return '<li><button type="button" class="nota-g-nota' + (rel === n.rel ? ' atual' : '') + '" data-nota-abrir="' + esc(rel) + '" style="--f:' + (fundo || 0) + '">' + ic('arquivo') + '<span><b>' + esc(nome) + '</b>' + (fundo == null ? '<small>' + esc(pasta.split('/').slice(-2).join(' › ')) + '</small>' : '') + '</span></button></li>';
  }
  function procurar(q) {
    if (!q || q.length < 2) { pintarGaveta(); return; }
    fetch('/api/notas/buscar?q=' + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (j) {
      el.querySelector('#nota-g-corpo').innerHTML = '<p class="nota-g-t">' + j.achados.length + (j.achados.length === 1 ? ' nota' : ' notas') + '</p><ul class="nota-g-lista">' + j.achados.map(function (a) {
        var nome = a.rel.slice(a.rel.lastIndexOf('/') + 1).replace(/\.(md|txt)$/i, '');
        return '<li><button type="button" class="nota-g-nota" data-nota-abrir="' + esc(a.rel) + '">' + ic('arquivo') + '<span><b>' + esc(nome) + '</b><small>' + esc(a.trecho ? '…' + a.trecho + '…' : a.rel.split('/').slice(-3, -1).join(' › ')) + '</small></span></button></li>';
      }).join('') + '</ul>';
    }).catch(function () {});
  }

  /* ---------- cliques e teclas ---------- */
  function aoClicar(ev) {
    var b = ev.target.closest('[data-nota]');
    if (b) {
      var o = b.dataset.nota;
      if (o === 'fechar') fechar();
      if (o === 'nova') nova();
      if (o === 'notas') { if (!el.querySelector('#nota-gaveta').hidden && modoGaveta === 'notas') fecharGaveta(); else abrirGaveta('notas'); }
      if (o === 'mover') abrirGaveta('mover');
      if (o === 'gaveta-fechar') fecharGaveta();
      if (o === 'baixar') baixarNota();
      return;
    }
    var x = ev.target.closest('[data-nota-x]');
    if (x) {
      var qual = x.dataset.notaX;
      if (qual === 'zip') baixarTodas();
      if (qual === 'trazer') el.querySelector('#nota-g-arq').click();
      if (qual === 'nuvem' && window.Nuvem) fechar().then(function () { window.Nuvem.abrir(); });
      return;
    }
    var p = ev.target.closest('[data-nota-pasta]');
    if (p) { var rel = p.dataset.notaPasta; abertas[rel] = !(abertas[rel] && pastaSel === rel); pastaSel = rel; pintarGaveta(); return; }
    var ab = ev.target.closest('[data-nota-abrir]');
    if (ab) { var r = ab.dataset.notaAbrir; terminar().then(function () { return carregarNota(r); }).then(function () { if (matchMedia('(max-width: 900px)').matches) fecharGaveta(); else pintarGaveta(); }).catch(function (e) { avisar(e.message); }); return; }
    var ne = ev.target.closest('[data-nota-nova-em]');
    if (ne) { nova(ne.dataset.notaNovaEm).then(function () { fecharGaveta(); }); return; }
    var mv = ev.target.closest('[data-nota-mover-para]');
    if (mv) {
      var destino = mv.dataset.notaMoverPara;
      if (!n.rel) { n.pasta = destino; pintarOnde(); fecharGaveta(); estado('pronto', 'a nota vai nascer em ' + destino.split('/').pop()); area.focus(); return; }
      terminar().then(function () { return post('mover', { rel: n.rel, pasta: destino }); }).then(function (j) { n.rel = j.rel; pintarOnde(); fecharGaveta(); estado('guardado', 'movida para ' + destino.split('/').pop() + ' às ' + hora()); area.focus(); })
        .catch(function (e) { avisar(e.message); });
      return;
    }
    var g = ev.target.closest('[data-nota-g]');
    if (g) {
      /* um campo na própria gaveta (sem janela do navegador): o nome, e Enter cria */
      var projeto = g.dataset.notaG === 'projeto';
      var sel = el.querySelector('#nota-g-sel');
      sel.innerHTML = '<form class="nota-g-nova" data-nota-criar="' + (projeto ? 'projeto' : 'pasta') + '"><label><span>' + (projeto ? 'O projeto (uma pasta com a nota de entrada)' : 'A pasta nova') + ', dentro de <b>' + esc((pastaSel || T.raiz).split('/').pop()) + '</b></span>' +
        '<input name="nome" autocomplete="off" required placeholder="' + (projeto ? 'O nome do projeto' : 'O nome da pasta') + '"></label><div><button class="botao pri" type="submit">Criar</button><button class="botao leve" type="button" data-nota-g-cancelar>Cancelar</button></div></form>';
      sel.querySelector('input').focus();
      return;
    }
    if (ev.target.closest('[data-nota-g-cancelar]')) { pintarGaveta(); return; }
    var c = ev.target.closest('[data-nota-conflito]');
    if (c) {
      var a = el.querySelector('#nota-aviso');
      if (c.dataset.notaConflito === 'ok') { a.hidden = true; return; }
      var atual = n.conflito; if (!atual) { a.hidden = true; return; }
      if (c.dataset.notaConflito === 'ver') {
        var meu = area.value;
        guardar('nota:minha-versao', { rel: n.rel, texto: meu, em: Date.now() });
        n.conflito = null; n.hash = atual.hash; n.sujo = false; area.value = atual.texto; pintarOnde(); a.hidden = true;
        estado('guardado', T.viu);
      } else {
        var pasta = n.rel.split('/').slice(0, -1).join('/');
        var texto = area.value;
        n = { rel: null, hash: '', criadaAgora: false, pasta: pasta, sujo: true, gravando: null, espera: 0, conflito: null };
        a.hidden = true; area.value = texto; gravarAgora();
      }
    }
  }
  function criarDoCampo(form) {
    var projeto = form.dataset.notaCriar === 'projeto', nome = form.nome.value.trim();
    if (!nome) return;
    post('pasta', { pai: pastaSel || '', nome: nome, projeto: projeto }).then(function (j) {
      abertas[j.rel] = true; pastaSel = j.rel;
      if (j.nota) return terminar().then(function () { return carregarNota(j.nota); }).then(function () { return abrirGaveta('notas'); });
      return abrirGaveta(modoGaveta);
    }).catch(function (e) { avisar(e.message); });
  }
  function aoTecla(ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); if (!el.querySelector('#nota-gaveta').hidden) fecharGaveta(); else fechar(); return; }
    var mod = ev.ctrlKey || ev.metaKey;
    if (mod && (ev.key === 's' || ev.key === 'S')) { ev.preventDefault(); n.sujo = n.sujo || !!area.value; gravarAgora().then(function () { if (!n.sujo) estado('guardado', T.guardado + hora()); }); return; }
    if (mod && (ev.key === 'o' || ev.key === 'O')) { ev.preventDefault(); abrirGaveta('notas'); return; }
    if (ev.key === 'Tab' && ev.target === area) { ev.preventDefault(); var i = area.selectionStart; area.setRangeText('\t', i, area.selectionEnd, 'end'); aoEscrever(); }
  }

  /* ---------- no site: levar e trazer as notas (registro 119) ---------- */
  function baixarArquivo(nome, dados) {
    var url = URL.createObjectURL(dados instanceof Blob ? dados : new Blob([dados], { type: 'text/markdown;charset=utf-8' }));
    var a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function baixarNota() {
    if (!area.value.trim()) return;
    var primeira = (area.value.split('\n').filter(function (l) { return l.trim(); })[0] || 'nota').replace(/^#+\s*/, '');
    baixarArquivo(n.rel ? n.rel.split('/').pop() : primeira.replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) + '.md', area.value);
  }
  /* um .zip sem compressão (o formato "store"): as notas como arquivos, nas suas pastas; abre em qualquer
     computador, e a pasta entra inteira no Obsidian */
  var TAB = null;
  function crc32(b) {
    if (!TAB) { TAB = []; for (var k = 0; k < 256; k++) { var c = k; for (var j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; TAB[k] = c >>> 0; } }
    var x = -1; for (var i = 0; i < b.length; i++) x = (x >>> 8) ^ TAB[(x ^ b[i]) & 255];
    return (x ^ -1) >>> 0;
  }
  function zip(arquivos) {
    var enc = new TextEncoder(), partes = [], central = [], pos = 0;
    arquivos.forEach(function (a) {
      var nome = enc.encode(a.nome), dados = enc.encode(a.texto), crc = crc32(dados), d = a.data;
      var hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dia = ((Math.max(1980, d.getFullYear()) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
      var l = new DataView(new ArrayBuffer(30));
      l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x0800, true); l.setUint16(10, hora, true); l.setUint16(12, dia, true);
      l.setUint32(14, crc, true); l.setUint32(18, dados.length, true); l.setUint32(22, dados.length, true); l.setUint16(26, nome.length, true);
      partes.push(new Uint8Array(l.buffer), nome, dados);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(12, hora, true); c.setUint16(14, dia, true);
      c.setUint32(16, crc, true); c.setUint32(20, dados.length, true); c.setUint32(24, dados.length, true); c.setUint16(28, nome.length, true); c.setUint32(42, pos, true);
      central.push(new Uint8Array(c.buffer), nome);
      pos += 30 + nome.length + dados.length;
    });
    var tam = central.reduce(function (t, p) { return t + p.length; }, 0), f = new DataView(new ArrayBuffer(22));
    f.setUint32(0, 0x06054b50, true); f.setUint16(8, arquivos.length, true); f.setUint16(10, arquivos.length, true); f.setUint32(12, tam, true); f.setUint32(16, pos, true);
    return new Blob(partes.concat(central, [new Uint8Array(f.buffer)]), { type: 'application/zip' });
  }
  function baixarTodas() {
    var o = ler('portal-notas'), rels = o && o.notas ? Object.keys(o.notas).sort() : [];
    if (!rels.length) { avisar('Ainda não há notas neste aparelho.'); return; }
    baixarArquivo('notas-portal-solar-' + new Date().toISOString().slice(0, 10) + '.zip',
      zip(rels.map(function (r) { return { nome: r, texto: o.notas[r].t, data: new Date(o.notas[r].m || Date.now()) }; })));
  }
  /* trazer: cada arquivo .md vira uma nota na pasta escolhida (sem passar por cima de nenhuma) */
  function trazer(arquivos) {
    var lista = Array.prototype.slice.call(arquivos || []).filter(function (f) { return /\.(md|txt)$/i.test(f.name) && f.size < 2000000; });
    if (!lista.length) return;
    var pasta = pastaSel || entrada, feitas = 0;
    fetch('/api/notas/arvore?fresco=1').then(function (r) { return r.json(); }).then(function (a) {
      var tem = {}; a.notas.forEach(function (x) { tem[x[0]] = 1; });
      return lista.reduce(function (p, f) {
        return p.then(function () { return f.text(); }).then(function (texto) {
          var ext = (f.name.match(/\.(md|txt)$/i) || ['.md'])[0], base = f.name.slice(0, -ext.length).replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'nota';
          var rel = pasta + '/' + base + ext, k = 2;
          while (tem[rel]) rel = pasta + '/' + base + ' ' + (k++) + ext;
          tem[rel] = 1;
          return post('gravar', { rel: rel, texto: texto }).then(function () { feitas++; });
        });
      }, Promise.resolve());
    }).then(function () {
      estado('guardado', feitas + (feitas === 1 ? ' nota trazida para ' : ' notas trazidas para ') + pasta.split('/').pop());
      abrirGaveta('notas');
    }).catch(function (e) { avisar(e.message || 'Não deu para trazer as notas.'); });
  }

  window.Nota = { abrir: abrir, fechar: fechar, aberta: function () { return !!(el && el.classList.contains('aberta')); } };
})();
