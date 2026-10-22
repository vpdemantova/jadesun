/* ============================================================
   PROJETOS DO SOL (21/out/2026, registro 115)
   "vou escrever um poema desde o átomo e célula que se reproduz e percebe a realidade!
   me ajude a estruturar isso tudo no portal solar".

   O poema mora no caderno, num arquivo só (…/3 Projetos do Sol/0. A escada.md), e é dele: esta página
   é uma lente sobre esse arquivo. O caminho inteiro não fica escrito aqui (este repositório é público):
   a página acha o arquivo pelo nome, na busca das notas do servidor de casa. Cada "## " é um canto; dentro dele, o bloco
   "> [!ciencia]" (o que aconteceu, com a fonte), o "> [!pergunta]" e, fora dos blocos, os versos.
   "Escrever" abre o próprio arquivo na Nota (tecla N); ao fechar a nota, a página relê o arquivo.
   Só no computador: no site estático, o caderno não vai junto.
   ============================================================ */
(function () {
  'use strict';
  var NOME = '3 Projetos do Sol/0. A escada.md';
  var REL = '';
  var raiz = document.getElementById('pm');
  if (!raiz) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var inline = function (t) { return window.MD ? window.MD.inline(t) : esc(t); };

  /* o arquivo em cantos: { titulo, num, ciencia, pergunta, versos[] } e o resto (o que vem depois do último canto) */
  function ler(texto) {
    var corpo = texto.replace(/^---[\s\S]*?\n---\s*\n/, '');
    var partes = corpo.split(/\n(?=## )/);
    var cantos = [], resto = [];
    partes.forEach(function (p) {
      var m = p.match(/^## ([IVXLC]+) · (.+)/);
      if (!m) { if (cantos.length) resto.push(p); return; }
      var linhas = p.split('\n').slice(1), c = { num: m[1], titulo: m[2].trim(), ciencia: [], pergunta: '', versos: [] }, bloco = null;
      linhas.forEach(function (l) {
        var b = l.match(/^>\s*\[!(\w+)\][-+]?\s*(.*)$/);
        if (b) { bloco = b[1].toLowerCase(); if (bloco === 'pergunta') c.pergunta = b[2]; return; }
        if (/^>/.test(l) && bloco) { if (bloco === 'ciencia') c.ciencia.push(l.replace(/^>\s?/, '')); return; }
        bloco = null;
        if (/^---\s*$/.test(l)) return;
        c.versos.push(l.replace(/&nbsp;/g, ''));
      });
      while (c.versos.length && !c.versos[0].trim()) c.versos.shift();
      while (c.versos.length && !c.versos[c.versos.length - 1].trim()) c.versos.pop();
      cantos.push(c);
    });
    return { cantos: cantos, resto: resto.join('\n') };
  }

  function montar(n) {
    var d = ler(n.texto);
    var escritos = d.cantos.filter(function (c) { return c.versos.length; }).length;
    var acoes = document.getElementById('pm-acoes');
    if (acoes) acoes.innerHTML = '<button type="button" class="cp-comecar" data-pm-escrever><span class="cp-comecar-t">Escrever</span><span class="cp-relogio">' + escritos + ' / ' + d.cantos.length + '</span></button>' +
      '<span class="pm-onde">No caderno: ' + esc(REL.split('/').slice(-3).join(' › ')) + ' · mudado ' + esc(new Date(n.modificado).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</span>';
    var regua = '<nav class="lz-regua" aria-label="Os cantos"><ol>' + d.cantos.map(function (c, i) {
      return '<li><a href="#c-' + (i + 1) + '" data-degrau="' + (i + 1) + '"><span class="lz-n">' + esc(c.num) + '</span><span class="lz-r-nome">' + esc(c.titulo) + '</span><span class="lz-r-esc">' + (c.versos.length ? 'com versos' : 'em branco') + '</span></a></li>';
    }).join('') + '</ol></nav>';
    var cantos = d.cantos.map(function (c, i) {
      return '<article class="lz-degrau pm-canto" id="c-' + (i + 1) + '" aria-labelledby="c-' + (i + 1) + '-t">' +
        '<header class="lz-d-cab"><span class="lz-d-num pm-num" aria-hidden="true">' + esc(c.num) + '</span>' +
          '<div><h2 class="lz-d-t" id="c-' + (i + 1) + '-t">' + esc(c.titulo) + '</h2>' + (c.pergunta ? '<p class="lz-d-perg">' + esc(c.pergunta) + '</p>' : '') + '</div></header>' +
        '<div class="lz-d-corpo">' +
          (c.versos.length ? '<div class="pm-versos">' + c.versos.map(function (v) { return v.trim() ? '<p>' + inline(v) + '</p>' : '<p class="pm-vazio" aria-hidden="true">&nbsp;</p>'; }).join('') + '</div>'
            : '<p class="pm-branco">Ainda em branco.</p>') +
          (c.ciencia.length ? '<details class="pm-ciencia"><summary>O que aconteceu</summary><p>' + inline(c.ciencia.join(' ')) + '</p></details>' : '') +
        '</div>' +
      '</article>';
    }).join('');
    var resto = d.resto.trim() && window.MD ? '<section class="pm-resto">' + window.MD.render(d.resto) + '</section>' : '';
    raiz.innerHTML = '<div class="lz-escada-grade pm-grade">' + regua + '<div class="lz-degraus">' + cantos + '</div></div>' + resto;
    vigiar();
  }

  function vigiar() {
    var links = raiz.querySelectorAll('.lz-regua a');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) { if (x.isIntersecting) links.forEach(function (a) { if ('c-' + a.dataset.degrau === x.target.id) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    raiz.querySelectorAll('.pm-canto').forEach(function (c) { io.observe(c); });
  }

  function carregar() {
    if (P.estatico && P.estatico()) { raiz.innerHTML = '<p class="cp-txt">Este poema mora no seu caderno e só abre no Portal Solar do seu computador.</p>'; return; }
    var json = function (u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não abriu.'); return j; }); }); };
    (REL ? Promise.resolve(REL) : json('/api/notas/buscar?q=' + encodeURIComponent(NOME.replace(/\.md$/, ''))).then(function (b) {
      var a = (b.achados || []).filter(function (x) { return x.rel.slice(-NOME.length) === NOME; })[0];
      if (!a) throw new Error('o arquivo "' + NOME + '" não está no caderno.');
      return (REL = a.rel);
    })).then(function (rel) { return json('/api/notas/ler?rel=' + encodeURIComponent(rel)); })
      .then(montar)
      .catch(function (e) { raiz.innerHTML = '<p class="cp-txt">Não consegui abrir o poema: ' + esc(e.message) + '</p>'; });
  }
  carregar();

  document.addEventListener('click', function (ev) {
    if (!ev.target.closest || !ev.target.closest('[data-pm-escrever]')) return;
    if (P.abrirNota && REL) P.abrirNota({ rel: REL });
  });
  /* ao voltar para a página (a nota fechou, ou o Obsidian gravou), relê o arquivo */
  document.addEventListener('visibilitychange', function () { if (!document.hidden) carregar(); });
  window.addEventListener('focus', function () { if (!(window.Nota && window.Nota.aberta && window.Nota.aberta())) carregar(); });
})();
