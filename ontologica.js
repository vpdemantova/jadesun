/* ============================================================
   A REVOLUÇÃO ONTOLÓGICA E "QUEM FEZ" (09/out/2026, PERFIL.md item 75)
   Uma nota só do caderno (Manifestos/A Revolução Ontológica.md), lida em dois lugares: a home (o resumo,
   depois da linha das revoluções, e "Quem fez" no fim) e o Manifesto (a XVI inteira e "Quem fez").
   Ontologica.partes(texto) → { resumo, quemFez, palavras: [..], corpo, data }
   Ontologica.htmlQuemFez(partes), Ontologica.htmlResumo(partes, { link })
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function md(t) { return window.MD ? window.MD.render(t) : '<p>' + esc(t) + '</p>'; }
  function inline(t) { return window.MD ? window.MD.inline(t) : esc(t); }

  function partes(texto) {
    var t = String(texto || '').replace(/\r\n?/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '');
    var secs = {}, atual = null;
    t.split('\n').forEach(function (l) {
      var h = l.match(/^##\s+(.*?)\s*$/);
      if (h) { atual = h[1].toLowerCase(); secs[atual] = []; return; }
      if (atual) secs[atual].push(l);
    });
    var de = function (re) { var k = Object.keys(secs).filter(function (x) { return re.test(x); })[0]; return k ? secs[k].join('\n').trim() : ''; };
    var palavras = de(/^as palavras/).split(/\n\s*\n/).map(function (b) { return b.replace(/^>\s?/gm, '').trim(); }).filter(Boolean);
    return { resumo: de(/^em poucas palavras|^resumo/), quemFez: de(/^quem fez/), palavras: palavras, corpo: de(/^a revolu..o ontol/) };
  }

  /* "Quem fez": a assinatura do movimento e as palavras de quem fez, como um colofão */
  function htmlQuemFez(p) {
    if (!p || (!p.quemFez && !p.palavras.length)) return '';
    return '<div class="on-quem">' +
      '<div class="on-quem-cab"><span class="on-q" aria-hidden="true">' + (window.Icones ? window.Icones.quadrado() : '') + '</span><p class="rot">Quem fez</p></div>' +
      (p.quemFez ? '<p class="on-assina">' + inline(p.quemFez) + '</p>' : '') +
      (p.palavras.length ? '<div class="on-palavras">' + p.palavras.map(function (x) { return '<blockquote><p>' + inline(x) + '</p></blockquote>'; }).join('') + '</div>' : '') +
    '</div>';
  }

  /* o resumo da revolução ontológica, para a home */
  function htmlResumo(p, op) {
    op = op || {};
    if (!p || !p.resumo) return '';
    return '<div class="on-resumo"><div class="on-resumo-txt">' + md(p.resumo) + '</div>' +
      '<p class="on-grito">Chega de livros sem nexo e sem conexão, de conteúdo em cima de conteúdo.</p>' +
      (op.link ? '<a class="botao" href="' + esc(op.link) + '">Ler inteira no Manifesto</a>' : '') + '</div>';
  }

  window.Ontologica = { partes: partes, htmlQuemFez: htmlQuemFez, htmlResumo: htmlResumo };
})();
