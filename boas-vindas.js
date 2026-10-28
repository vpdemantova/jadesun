/* Portal Solar · boas-vindas.js — as Boas-vindas: as mesmas palavras que abrem cada vila de Atlantis (27/out/2026).

   De onde veio: o pedido dele em 26/out/2026: "espelho no portal solar, na home do site portal solar vai ter
   as mesmas palavras de solidariedade e condução ao estudo e saúde mental, física, espiritual etc, como ler
   e escrever, o que ler, como estudar, técnicas de 1 hora pra cognição, e tudo mais.. direções nesse mundo
   desinformado e fragmentado" (TAREFAS PS-46; no jogo, VS-69 e VS-71). O texto é um só, no caderno:
   2 Academy/0 Aulas…/0. Motivos sob a Verdade/4. As Boas-vindas.md ("## A fala", "## As Direções",
   "## Fontes dos dados"). Esta página o lê ao vivo pelo índice da Biblioteca, como os Museus e as Ferramentas;
   as notas do caderno para ele (as citações "> …") não aparecem aqui.

   Para onde vai: boas-vindas.html (a porta do Manifesto). Quando a Abertura da home for feita (o plano em
   Focos/A Abertura — Plano.md), ela abre com a fala daqui. */
(function () {
  'use strict';
  var ID = 'aulas/0-motivos-sob-a-verdade/4-as-boas-vindas';
  var TITULO = 'As Boas-vindas';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* o corpo do arquivo em seções "## …", sem as citações (são notas do caderno, não texto da página) */
  function secoes(corpo) {
    var out = {}, atual = null;
    String(corpo || '').replace(/\r\n/g, '\n').split('\n').forEach(function (l) {
      var h = l.match(/^##\s+(.+)$/);
      if (h) { atual = h[1].trim(); out[atual] = []; return; }
      if (atual && !/^\s*>/.test(l)) out[atual].push(l);
    });
    Object.keys(out).forEach(function (k) { out[k] = out[k].join('\n').trim(); });
    return out;
  }
  function chave(s, re) { return Object.keys(s).find(function (k) { return re.test(k); }); }

  function desenhar(f) {
    var s = secoes(f.corpo);
    var fala = (s[chave(s, /fala/i)] || '').split(/\n\s*\n/).map(function (p) { return p.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    if (!fala.length) throw new Error('sem fala');
    var md = window.MD && window.MD.render ? window.MD.render : function (t) { return '<p>' + esc(t) + '</p>'; };
    $('bv-titulo').textContent = fala[0];
    $('bv-fala').innerHTML = fala.slice(1).map(function (p, i) {
      return '<p class="bv-p' + (i === fala.length - 2 ? ' bv-fim' : '') + '">' + (window.MD ? window.MD.inline(p) : esc(p)) + '</p>';
    }).join('');
    // as Direções: um cartão por "### …"
    var dir = s[chave(s, /dire/i)] || '';
    var cartoes = dir.split(/\n(?=###\s)/).map(function (b) { return b.trim(); }).filter(function (b) { return /^###\s/.test(b); });
    $('bv-direcoes').innerHTML = cartoes.map(function (b) {
      var nome = b.match(/^###\s+(.+)/)[1];
      var corpo = b.replace(/^###.+\n?/, '');
      return '<article class="bv-cartao"><h3>' + esc(nome) + '</h3><div class="bv-md">' + md(corpo) + '</div></article>';
    }).join('');
    var fontes = s[chave(s, /fonte/i)] || '';
    $('bv-fontes').innerHTML = fontes ? md(fontes) : '';
    $('bv-nota').innerHTML = 'O texto mora no caderno, em <a href="biblioteca.html#f=' + encodeURIComponent(f.id || ID) + '">' + TITULO + '</a>; as mesmas palavras abrem cada vila de ' +
      '<a href="https://serafim-resistence.vercel.app" target="_blank" rel="noopener">Atlantis</a>, ditas por Serafim, a anciã fundadora.';
  }

  function iniciar() {
    fetch('/api/ficha?id=' + encodeURIComponent(ID)).then(function (r) {
      if (r.ok) return r.json();
      // o id mudou? procura pelo título no índice
      return fetch('/api/biblioteca').then(function (x) { return x.json(); }).then(function (idx) {
        var a = (idx.itens || []).find(function (i) { return i[1] === TITULO; });
        if (!a) throw new Error('sem ficha');
        return fetch('/api/ficha?id=' + encodeURIComponent(a[0])).then(function (x) { return x.json(); });
      });
    }).then(desenhar).catch(function () {
      $('bv-fala').innerHTML = '<p class="bv-p">Não achei o arquivo "' + TITULO + '" no caderno (2 Academy › 0 Aulas › 0. Motivos sob a Verdade).</p>';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
