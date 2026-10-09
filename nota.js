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
      '</aside>';
    document.body.appendChild(el);
    area = el.querySelector('#nota-texto');
    area.addEventListener('input', aoEscrever);
    el.addEventListener('click', aoClicar);
    el.addEventListener('keydown', aoTecla);
    el.addEventListener('submit', function (ev) { var f = ev.target.closest('[data-nota-criar]'); if (f) { ev.preventDefault(); criarDoCampo(f); } });
    el.addEventListener('mousemove', function () { el.classList.remove('escrevendo'); });
    el.querySelector('#nota-g-q').addEventListener('input', function (ev) { clearTimeout(tBusca); var q = ev.target.value.trim(); tBusca = setTimeout(function () { procurar(q); }, 220); });
    window.addEventListener('beforeunload', function (ev) { if (n.sujo) { gravarAgora(); ev.preventDefault(); ev.returnValue = ''; } });
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
    el.querySelector('#nota-pasta').textContent = partes.join(' › ') || 'o caderno';
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
      if (area.value === texto) { n.sujo = false; guardar(CHAVE_RASCUNHO, null); estado('guardado', 'guardado no caderno às ' + hora()); }
      pintarOnde();
    }).catch(function (e) {
      if (e.status === 409 && e.atual) { mostrarConflito(e.atual); return; }
      if (e.status === 404) { n.rel = null; n.hash = ''; avisar('A nota não existe mais no caderno (foi movida ou apagada?). O texto continua aqui: ao escrever, ele vira uma nota nova na Entrada.'); return; }
      estado('sem', 'sem servidor: guardado neste navegador; vai para o caderno quando ele voltar');
      clearTimeout(n.espera); n.espera = setTimeout(gravarAgora, 5000);
    }).then(function () { n.gravando = null; });
    return n.gravando;
  }
  /* a nota mudou fora daqui: nada se perde; você escolhe */
  function mostrarConflito(atual) {
    n.conflito = atual;
    estado('sem', 'a nota mudou fora daqui');
    avisar('Esta nota mudou fora daqui (no Obsidian ou em outro aparelho). O seu texto continua aqui.', [['ver', 'Ver a versão do caderno'], ['copia', 'Guardar o meu como uma nota nova']]);
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
        area.value = j.texto; pintarOnde(); estado('guardado', 'no caderno · mudada em ' + new Date(j.modificado).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
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
      .catch(function () { el.querySelector('#nota-g-corpo').innerHTML = '<p class="nota-g-vazio">Sem servidor: as notas aparecem quando ele voltar.</p>'; });
  }
  function fecharGaveta() { var g = el && el.querySelector('#nota-gaveta'); if (g) g.hidden = true; if (el) el.classList.remove('com-gaveta'); }
  function abrirAte(rel) { var p = ''; String(rel || '').split('/').forEach(function (x) { if (!x) return; p = p ? p + '/' + x : x; abertas[p] = true; }); }
  function pintarGaveta() {
    if (!arvoreAtual) return;
    el.querySelector('#nota-g-sel').innerHTML = modoGaveta === 'mover'
      ? 'Escolha a pasta e toque em <b>Mover para cá</b>.'
      : 'Pasta: <b>' + esc((pastaSel || 'o caderno').split('/').join(' › ')) + '</b>';
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
    html += '<p class="nota-g-t">O caderno</p><ul class="nota-g-arvore">' + ramo('', 0) + '</ul>';
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
      sel.innerHTML = '<form class="nota-g-nova" data-nota-criar="' + (projeto ? 'projeto' : 'pasta') + '"><label><span>' + (projeto ? 'O projeto (uma pasta com a nota de entrada)' : 'A pasta nova') + ', dentro de <b>' + esc((pastaSel || 'o caderno').split('/').pop()) + '</b></span>' +
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
        estado('guardado', 'versão do caderno · a sua ficou guardada neste navegador');
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
    if (mod && (ev.key === 's' || ev.key === 'S')) { ev.preventDefault(); n.sujo = n.sujo || !!area.value; gravarAgora().then(function () { if (!n.sujo) estado('guardado', 'guardado no caderno às ' + hora()); }); return; }
    if (mod && (ev.key === 'o' || ev.key === 'O')) { ev.preventDefault(); abrirGaveta('notas'); return; }
    if (ev.key === 'Tab' && ev.target === area) { ev.preventDefault(); var i = area.selectionStart; area.setRangeText('\t', i, area.selectionEnd, 'end'); aoEscrever(); }
  }

  window.Nota = { abrir: abrir, fechar: fechar, aberta: function () { return !!(el && el.classList.contains('aberta')); } };
})();
