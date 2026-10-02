/* O menu "Tudo" (Ctrl+K ou o botão Tudo): um lugar só pra saber como está a situação e achar
   qualquer coisa do Jadesun — as páginas, a casa e as áreas dela, os livros, as roupas, as fichas,
   os itens do Checklist — com as tags de tudo juntas. Não guarda nada: lê as mesmas rotas das páginas.
   Carregado pelo perfil.js em todas as páginas (menos no site público e dentro das folhas da Casa). */
(function () {
  'use strict';
  if (window.JADESUN_ESTATICO) return;
  if (/[?&]embutido=1/.test(location.search) && window.top !== window) return;

  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); };
  var enc = encodeURIComponent;
  var ic = function (p) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>'; };
  var ICONES = {
    tudo: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    lugar: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    livro: '<path d="M5 4.5h10.5a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2z"/><path d="M5 17.5a2 2 0 0 1 2-2h10.5"/>',
    roupa: '<path d="M8 4l-4 3 2 3 2-1v11h8V9l2 1 2-3-4-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>',
    ficha: '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
    casa: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    tag: '<path d="M4 4h7.5L20 12.5 12.5 20 4 11.5z"/><circle cx="8.3" cy="8.3" r="1.3"/>',
  };

  /* todos os lugares do Jadesun, com o que cada um responde */
  var LUGARES = [
    ['Agora', 'hoje.html', 'o que fazer hoje: o roteiro, o Meu dia, o Checklist'],
    ['Casa', 'casa.html', 'a casa em 3D: maquete, planta, andar'],
    ['Estante', 'casa.html?area=estante', 'os seus livros, na casa'],
    ['Guarda-roupa', 'casa.html?area=guarda-roupa', 'roupas e looks, na casa'],
    ['Escrivaninha · estudos de hoje', 'casa.html?porta=estudos', 'roteiro, tarefas e Checklist, na casa'],
    ['Piano · música', 'casa.html?porta=musica', 'os vídeos de Habilidades Específicas'],
    ['Jardim', 'jardim.html', 'o jardim em 3D, com o céu de Campinas'],
    ['Atlas · Mapa', 'atlas.html', 'onde estou no mapa do conhecimento'],
    ['Atlas · Fichas', 'biblioteca.html', 'todas as fichas: Seleção e Atlas'],
    ['Atlas · Quando', 'linha-do-tempo.html', 'a linha do tempo'],
    ['Atlas · Falta', 'falta.html', 'o que falta escrever'],
    ['Eu · Perfil', 'eu.html#numeros', 'quem sou eu, em números'],
    ['Eu · Domínio', 'eu.html#domino', 'o que já domino, matéria por matéria'],
    ['Eu · Obras', 'eu.html#obras', 'poemas, música, lutheria'],
    ['Eu · Feitos', 'eu.html#feitos', 'o que já fiz'],
    ['Eu · Linha da vida', 'eu.html#vida', 'a minha linha do tempo'],
    ['Eu · Coleção', 'eu.html#colecao', 'o que leio, vejo, ouço e amo'],
    ['Eu · Documentos', 'eu.html#docs', 'os documentos'],
    ['Copiar à mão', 'copiar.html', 'treinar a letra e a memória'],
    ['Protetor de tela', 'protetor.html', 'a tela de descanso'],
  ];
  /* o que espera uma decisão sua (o resto da situação é contado ao vivo) — atualizar junto com o Mapa de Tudo */
  var ESPERANDO = [
    ['As medidas do seu quarto', 'o quarto da Casa está com medidas de exemplo', 'casa.html?vista=planta'],
    ['Rever o discurso "A Nova Maré"', 'o rascunho só entra no Manifesto com o seu sim', null],
    ['As pastas (O Grande Plano)', 'depois de 18/10: o que arquivar, o que juntar', null],
  ];

  var dados = null, carregando = null;
  function carregar() {
    if (carregando) return carregando;
    var pega = function (u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
    carregando = Promise.all([
      window.Perfil ? window.Perfil.estado(true).catch(function () { return null; }) : pega('/api/estado'),
      pega('/api/musica'), pega('/api/livros'), pega('/api/guarda-roupa'), pega('/api/casa'), pega('/api/cofre'),
    ]).then(function (r) {
      dados = { estado: r[0], musica: r[1], livros: (r[2] && r[2].livros) || [], roupa: r[3] || { pecas: [], looks: [] }, casa: r[4] || { casas: [], comodos: [] }, cofre: r[5] };
      return dados;
    });
    return carregando;
  }

  /* ---------- tempo ---------- */
  function diasAte(iso, hora) {
    var a = new Date(iso + 'T' + (hora || '09:00') + ':00'); a.setHours(0, 0, 0, 0);
    var h = new Date(); h.setHours(0, 0, 0, 0);
    return Math.round((a - h) / 86400000);
  }
  var dataCurta = function (iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); };

  /* ---------- a janela ---------- */
  var el = null, entrada = null, ativo = -1, links = [], tagAtiva = null, ultimaBusca = '', timerBusca = 0, fichas = [];
  function montar() {
    el = document.createElement('div');
    el.className = 'tudo';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Tudo');
    el.hidden = true;
    el.innerHTML = '<div class="tudo-fundo" data-fechar></div><div class="tudo-caixa">' +
      '<header class="tudo-topo"><span class="tudo-lupa">' + ic(ICONES.tudo) + '</span>' +
      '<input class="tudo-entrada" type="search" placeholder="Buscar em tudo: livros, roupas, fichas, cômodos, páginas, o Checklist…" aria-label="Buscar em tudo" autocomplete="off">' +
      '<kbd class="tudo-kbd">Esc</kbd><button type="button" class="tudo-x" data-fechar aria-label="Fechar">×</button></header>' +
      '<div class="tudo-tags" aria-label="Tags"></div>' +
      '<div class="tudo-corpo"></div>' +
      '<footer class="tudo-pe"><span><kbd>↑</kbd><kbd>↓</kbd> escolher · <kbd>Enter</kbd> abrir · <kbd>Ctrl</kbd>+<kbd>K</kbd> abre de qualquer página</span><span class="tudo-pe-mapa"></span></footer>' +
      '</div>';
    document.body.appendChild(el);
    entrada = el.querySelector('.tudo-entrada');
    el.addEventListener('click', function (ev) { if (ev.target.closest('[data-fechar]')) fechar(); });
    entrada.addEventListener('input', function () { tagAtiva = null; pintar(); });
    entrada.addEventListener('keydown', teclas);
    el.querySelector('.tudo-tags').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-tag]'); if (!b) return;
      tagAtiva = tagAtiva === b.dataset.tag ? null : b.dataset.tag;
      entrada.value = '';
      pintar();
    });
  }
  function abrir(texto) {
    if (!el) montar();
    el.hidden = false;
    document.documentElement.classList.add('tudo-aberto');
    requestAnimationFrame(function () { el.classList.add('aberto'); });
    if (texto != null) entrada.value = texto;
    entrada.focus(); entrada.select();
    el.querySelector('.tudo-corpo').innerHTML = '<p class="tudo-vazio">Juntando tudo…</p>';
    carregar().then(function () { pintarTags(); pintar(); });
  }
  function fechar() {
    if (!el || el.hidden) return;
    el.classList.remove('aberto');
    document.documentElement.classList.remove('tudo-aberto');
    setTimeout(function () { el.hidden = true; }, 180);
  }
  function aberto() { return !!(el && !el.hidden); }

  /* ---------- as tags de tudo ---------- */
  function contarTags() {
    var mapa = new Map();
    var soma = function (t, origem) { var k = norm(t); if (!k) return; var x = mapa.get(k) || { tag: t, n: 0, livros: 0, roupas: 0 }; x.n++; x[origem]++; mapa.set(k, x); };
    dados.livros.forEach(function (l) { (l.tags || []).forEach(function (t) { soma(t, 'livros'); }); });
    (dados.roupa.pecas || []).forEach(function (p) { (p.tags || []).forEach(function (t) { soma(t, 'roupas'); }); });
    return [...mapa.values()].sort(function (a, b) { return b.n - a.n || a.tag.localeCompare(b.tag, 'pt'); });
  }
  function pintarTags() {
    var tags = contarTags().slice(0, 28);
    el.querySelector('.tudo-tags').innerHTML = tags.map(function (t) {
      return '<button type="button" class="tudo-tag' + (tagAtiva && norm(tagAtiva) === norm(t.tag) ? ' on' : '') + '" data-tag="' + esc(t.tag) + '" title="' + t.livros + ' livros · ' + t.roupas + ' roupas">' + esc(t.tag) + '<i>' + t.n + '</i></button>';
    }).join('');
    var pe = el.querySelector('.tudo-pe-mapa');
    if (dados.cofre && dados.cofre.cofre) pe.innerHTML = '<a href="obsidian://open?path=' + enc((dados.cofre.cofre + '/' + dados.cofre.mapa).replace(/\\/g, '/')) + '">Mapa de Tudo no Obsidian →</a>';
  }

  /* ---------- situação (sem busca) ---------- */
  function situacao() {
    var e = dados.estado, h = '';
    var prazos = [];
    var m = dados.musica;
    if (m && m.existe) {
      var feitosM = m.itens.filter(function (i) { return i.feito; }).length;
      var dm = diasAte(m.prazo, '23:59');
      if (dm >= 0 || feitosM < m.itens.length) prazos.push({ n: dm < 0 ? '—' : dm, rot: 'Vídeos de Música', sub: feitosM + ' de ' + m.itens.length + ' feitos · envio até ' + dataCurta(m.prazo), href: 'casa.html?porta=musica', urgente: dm <= 1 && feitosM < m.itens.length });
    }
    if (e && e.contagem && e.contagem.prova) {
      var dp = diasAte(e.contagem.prova);
      prazos.push({ n: Math.max(0, dp), rot: '1ª fase — Unicamp', sub: 'domingo ' + dataCurta(e.contagem.prova) + ', 9h · 72 questões', href: 'hoje.html', urgente: false });
    }
    h += '<section class="tudo-sit"><h3>A situação, agora</h3><div class="tudo-prazos">' + prazos.map(function (p) {
      return '<a class="tudo-prazo' + (p.urgente ? ' urgente' : '') + '" href="' + p.href + '"><b' + (p.n === 0 ? ' class="hoje"' : '') + '>' + (p.n === 0 ? 'hoje' : p.n) + '</b><span><em>' + esc(p.rot) + '</em>' + esc(p.sub) + '</span></a>';
    }).join('') + '</div>';
    if (e && e.checklist) {
      var tot = 0, fei = 0;
      e.checklist.forEach(function (s) { tot += s.total; fei += s.feitos; });
      h += '<a class="tudo-check" href="hoje.html"><span>Checklist do vestibular</span><b>' + fei + ' de ' + tot + '</b><i><i style="width:' + (tot ? Math.round(fei / tot * 100) : 0) + '%"></i></i></a>';
    }
    var nL = dados.livros.length, nP = (dados.roupa.pecas || []).length;
    h += '<div class="tudo-pronto"><p class="tudo-rot">Pronto e funcionando</p><div>' +
      ['Agora', 'Jardim 3D', 'Atlas', 'Eu', 'Casa · ' + nL + ' livros · ' + nP + ' peças'].map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>';
    h += '<div class="tudo-esperando"><p class="tudo-rot">Esperando você</p><ul>' + ESPERANDO.map(function (x) {
      return '<li>' + (x[2] ? '<a href="' + x[2] + '">' : '<span>') + '<b>' + esc(x[0]) + '</b><em>' + esc(x[1]) + '</em>' + (x[2] ? '</a>' : '</span>') + '</li>';
    }).join('') + '</ul></div></section>';
    h += '<section class="tudo-lugares"><h3>Todos os lugares</h3><div class="tudo-grade">' + LUGARES.map(function (l) {
      return '<a class="tudo-lugar" href="' + l[1] + '"><b>' + esc(l[0]) + '</b><span>' + esc(l[2]) + '</span></a>';
    }).join('') + '</div></section>';
    return h;
  }

  /* ---------- resultados ---------- */
  function casa(q, alvo) { return !q || norm(alvo).indexOf(q) >= 0; }
  function resultados(q) {
    var grupos = [];
    var tag = tagAtiva ? norm(tagAtiva) : null;
    var temTag = function (lista) { return (lista || []).some(function (t) { return norm(t) === tag; }); };
    if (!tag) {
      var lug = LUGARES.filter(function (l) { return casa(q, l[0] + ' ' + l[2]); }).map(function (l) { return { href: l[1], titulo: l[0], sub: l[2], ic: 'lugar' }; });
      if (lug.length) grupos.push(['Lugares', lug]);
    }
    var livros = dados.livros.filter(function (l) { return tag ? temTag(l.tags) : casa(q, l.titulo + ' ' + l.autor + ' ' + (l.tags || []).join(' ')); }).slice(0, 12)
      .map(function (l) { return { href: 'casa.html?area=estante&livro=' + enc(l.titulo), titulo: l.titulo, sub: [l.autor, (l.tags || []).slice(0, 3).join(', ')].filter(Boolean).join(' · '), ic: 'livro' }; });
    if (livros.length) grupos.push(['Livros · na Estante', livros]);
    var pecas = (dados.roupa.pecas || []).filter(function (p) { return tag ? temTag(p.tags) : casa(q, p.nome + ' ' + p.tipo + ' ' + p.cor + ' ' + (p.tags || []).join(' ')); }).slice(0, 10)
      .map(function (p) { return { href: 'casa.html?area=guarda-roupa&peca=' + enc(p.nome), titulo: p.nome, sub: [p.tipo, p.cor, p.estado].filter(Boolean).join(' · '), ic: 'roupa' }; });
    if (pecas.length) grupos.push(['Roupas · no Guarda-roupa', pecas]);
    if (!tag && q) {
      var looks = (dados.roupa.looks || []).filter(function (l) { return casa(q, l.nome + ' ' + l.ocasiao); }).slice(0, 5)
        .map(function (l) { return { href: 'casa.html?area=guarda-roupa', titulo: 'Look: ' + l.nome, sub: (l.pecas || []).length + ' peças', ic: 'roupa' }; });
      if (looks.length) grupos.push(['Looks', looks]);
      var casas = (dados.casa.casas || []).filter(function (c) { return casa(q, c.nome + ' ' + c.estilo + ' ' + c.referencia); }).map(function (c) { return { href: 'casa.html?casa=' + enc(c.nome), titulo: c.nome, sub: c.tipo === 'real' ? 'a sua casa' : 'casa dos sonhos · ' + c.referencia.slice(0, 70), ic: 'casa' }; });
      var comodos = (dados.casa.comodos || []).filter(function (c) { return casa(q, c.nome); }).slice(0, 6).map(function (c) { return { href: 'casa.html?casa=' + enc(c.casa), titulo: c.nome, sub: c.casa, ic: 'casa' }; });
      if (casas.length || comodos.length) grupos.push(['Casas e cômodos', casas.concat(comodos)]);
      var itens = [];
      if (dados.estado && dados.estado.checklist) dados.estado.checklist.forEach(function (s) { s.itens.forEach(function (i) { if (casa(q, i.texto + ' ' + s.nome)) itens.push({ href: 'hoje.html', titulo: i.texto, sub: s.nome + (i.feito ? ' · ✓ feito' : ''), ic: 'check' }); }); });
      if (itens.length) grupos.push(['No Checklist', itens.slice(0, 8)]);
    }
    if (fichas.length) grupos.push(['Fichas · Atlas e Seleção', fichas.map(function (f) { return { href: 'biblioteca.html#f=' + encodeURI(f.id), titulo: f.titulo, sub: [f.secao, f.trecho && f.trecho.slice(0, 90)].filter(Boolean).join(' · '), ic: 'ficha' }; })]);
    return grupos;
  }
  function buscarFichas(q) {
    clearTimeout(timerBusca);
    if (!q || q.length < 2) { fichas = []; return; }
    timerBusca = setTimeout(function () {
      var alvo = q;
      fetch('/api/buscar?q=' + enc(alvo)).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (lista) {
        if (alvo !== ultimaBusca) return;
        fichas = (lista || []).slice(0, 10);
        pintarResultados();
      });
    }, 180);
  }
  function pintar() {
    if (!dados) return;
    var bruto = entrada.value.trim();
    var q = norm(bruto);
    pintarTags();
    if (!q && !tagAtiva) { fichas = []; ultimaBusca = ''; el.querySelector('.tudo-corpo').innerHTML = situacao(); links = [...el.querySelectorAll('.tudo-corpo a')]; ativo = -1; return; }
    var alvoFichas = tagAtiva || bruto;
    if (alvoFichas !== ultimaBusca) { ultimaBusca = alvoFichas; fichas = []; buscarFichas(alvoFichas); }
    pintarResultados();
  }
  function pintarResultados() {
    var q = norm(entrada.value.trim());
    var grupos = resultados(q);
    var corpo = el.querySelector('.tudo-corpo');
    corpo.innerHTML = (tagAtiva ? '<p class="tudo-filtro">Tudo com a tag <b>' + esc(tagAtiva) + '</b> <button type="button" data-limpar>limpar</button></p>' : '') +
      (grupos.length ? grupos.map(function (g) {
        return '<section class="tudo-grupo"><h3>' + esc(g[0]) + '<i>' + g[1].length + '</i></h3>' + g[1].map(function (r) {
          return '<a class="tudo-res" href="' + esc(r.href) + '"><span class="tudo-ic">' + ic(ICONES[r.ic]) + '</span><span><b>' + esc(r.titulo) + '</b>' + (r.sub ? '<em>' + esc(r.sub) + '</em>' : '') + '</span></a>';
        }).join('') + '</section>';
      }).join('') : '<p class="tudo-vazio">Nada com "' + esc(entrada.value) + '" ainda' + (ultimaBusca ? ' (as fichas ainda podem chegar)' : '') + '.</p>');
    var lim = corpo.querySelector('[data-limpar]'); if (lim) lim.addEventListener('click', function () { tagAtiva = null; pintar(); });
    links = [...corpo.querySelectorAll('a.tudo-res')];
    ativo = links.length ? 0 : -1;
    marcarAtivo();
  }
  function marcarAtivo() {
    links.forEach(function (a, i) { a.classList.toggle('ativo', i === ativo); });
    if (links[ativo]) links[ativo].scrollIntoView({ block: 'nearest' });
  }
  function teclas(ev) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!links.length) return; ativo = (ativo + 1) % links.length; marcarAtivo(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (!links.length) return; ativo = (ativo - 1 + links.length) % links.length; marcarAtivo(); }
    else if (ev.key === 'Enter') { var a = links[ativo] || links[0]; if (a) { ev.preventDefault(); location.href = a.getAttribute('href'); } }
    else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(); }
  }

  /* Ctrl+K (ou Cmd+K) abre de qualquer página; Esc fecha */
  document.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'k' || ev.key === 'K')) { ev.preventDefault(); ev.stopPropagation(); if (aberto()) fechar(); else abrir(); return; }
    if (ev.key === 'Escape' && aberto()) { ev.preventDefault(); ev.stopImmediatePropagation(); fechar(); }
  }, true);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-tudo]');
    if (b) { ev.preventDefault(); abrir(); }
  });

  window.Tudo = { abrir: abrir, fechar: fechar, aberto: aberto };
})();
