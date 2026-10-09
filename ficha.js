/* ============================================================
   FICHA — a sua ficha de pessoa, no modelo da "Rede da Vida"
   (1 Villages/a Social/0 A Rede da Vida.md): uma rede feita de fichas em vez
   de perfis, sem feed, sem curtidas, sem seguidores; os elos são nomes com um
   porquê escrito; e, se um dia se federar, "por arquivos que viajam".
   08/out/2026, PERFIL.md item 72.

   · ler(texto) / escrever(d): a Ficha.md (Logboard/# Profile/Ficha.md)
   · html(v, opcoes): desenha uma ficha (a sua ou a de outra pessoa)
   · md(v): a ficha inteira como um arquivo .md, para mandar a alguém
   Roda no navegador e no servidor (lib/vitrine.mjs), como o entradas.js.
   ============================================================ */
(function (raiz) {
  'use strict';

  var SECOES = ['Quem é', 'O caminho', 'A obra', 'A voz', 'Os elos'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function semFm(t) { return String(t || '').replace(/^﻿/, '').replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, ''); }

  function ler(texto) {
    var t = String(texto || '').replace(/^﻿/, '').replace(/\r\n/g, '\n');
    var meta = {};
    var fm = t.match(/^---\n([\s\S]*?)\n---\n?/);
    if (fm) fm[1].split('\n').forEach(function (l) { var m = l.match(/^([^:#]+):\s*(.*)$/); if (m) meta[m[1].trim().toLowerCase()] = m[2].trim(); });
    var corpo = semFm(t);
    var titulo = (corpo.match(/^#\s+(.+)$/m) || [])[1] || meta.nome || '';
    var secoes = {}, atual = null, frase = [];
    corpo.split('\n').forEach(function (l) {
      var h = l.match(/^##\s+(.+?)\s*$/);
      if (h) { atual = h[1]; secoes[atual] = []; return; }
      if (/^#\s/.test(l)) return;
      if (atual) secoes[atual].push(l); else frase.push(l);
    });
    Object.keys(secoes).forEach(function (k) { secoes[k] = secoes[k].join('\n').trim(); });
    return {
      nome: meta.nome || titulo.trim(),
      oficio: meta['ofício'] || meta.oficio || '',
      area: meta['área'] || meta.area || '',
      onde: meta.onde || '',
      visibilidade: (meta.visibilidade || 'privado').toLowerCase(),
      frase: frase.join('\n').replace(/^\s*>\s?/gm, '').trim(),
      quemE: secoes['Quem é'] || '',
      voz: (secoes['A voz'] || '').replace(/^\s*>\s?/gm, '').trim(),
      secoes: secoes,
    };
  }

  /* a Ficha.md guarda o que só você escreve; O caminho, A obra e Os elos são montados dos outros arquivos */
  function escrever(d) {
    var linha = function (k, v) { return v ? k + ': ' + String(v).replace(/\n/g, ' ') + '\n' : ''; };
    return '---\nformato: ficha\ntipo: pessoa\n' + linha('nome', d.nome) + linha('ofício', d.oficio) + linha('área', d.area) + linha('onde', d.onde) +
      'visibilidade: ' + (d.visibilidade === 'publico' ? 'publico' : 'privado') + '\n---\n\n' +
      '# ' + (d.nome || 'Sem nome') + '\n\n' + (d.frase ? d.frase.trim() + '\n\n' : '') +
      '## Quem é\n\n' + (d.quemE ? d.quemE.trim() + '\n\n' : '') +
      '## O caminho\n\n> Montado pelo Portal Solar a partir de Feitos.md (só o que estiver marcado como público).\n\n' +
      '## A obra\n\n> Montado pelo Portal Solar a partir das suas estantes de obras.\n\n' +
      '## A voz\n\n' + (d.voz ? d.voz.trim().split('\n').map(function (l) { return '> ' + l; }).join('\n') + '\n\n' : '') +
      '## Os elos\n\n> Montado pelo Portal Solar a partir de Pessoas.md: cada elo com o seu porquê.\n';
  }

  /* ---------- a ficha como arquivo que viaja ---------- */
  function md(v) {
    var out = '---\nformato: ficha\ntipo: pessoa\n' + (v.nome ? 'nome: ' + v.nome + '\n' : '') + (v.oficio ? 'ofício: ' + v.oficio + '\n' : '') +
      (v.area ? 'área: ' + v.area + '\n' : '') + (v.onde ? 'onde: ' + v.onde + '\n' : '') + (v.endereco ? 'endereço: ' + v.endereco + '\n' : '') + 'visibilidade: publico\n---\n\n';
    out += '# ' + (v.nome || 'Sem nome') + '\n\n' + (v.frase ? v.frase + '\n\n' : '');
    out += '## Quem é\n\n' + (v.quemE || '') + '\n\n';
    out += '## O caminho\n\n' + (v.caminho || []).map(function (c) { return '- ' + (c.quando ? c.quando + ' · ' : '') + c.titulo; }).join('\n') + '\n\n';
    out += '## A obra\n\n' + (v.obra || []).map(function (o) { return '- ' + o.nome + (o.pecas ? ' (' + o.pecas + ')' : ''); }).join('\n') +
      ((v.estante || []).length ? '\n\n### A estante\n\n' + v.estante.map(function (x) { return '- ' + (x.url ? '[' + x.titulo + '](' + x.url + ')' : x.titulo) + (x.por ? ', ' + x.por : '') + (x.grupo ? ' · ' + x.grupo : '') + (x.corpo ? ' — ' + x.corpo.split('\n')[0] : ''); }).join('\n') : '') + '\n\n';
    out += '## A voz\n\n' + (v.voz ? v.voz.split('\n').map(function (l) { return '> ' + l; }).join('\n') : '') + '\n\n';
    out += '## Os elos\n\n' + (v.elos || []).map(function (e) { return '- [[' + e.titulo + ']]' + (e.corpo ? ' — ' + e.corpo.split('\n')[0] : ''); }).join('\n') + '\n';
    return out;
  }

  /* ---------- desenho ---------- */
  function paragrafos(t) { return String(t || '').split(/\n{2,}/).map(function (p) { return p.trim() ? '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>' : ''; }).join(''); }
  function inicial(nome) { var n = String(nome || '').trim(); return n ? n[0].toUpperCase() : '·'; }
  function selo(vis, o) { return o.dono && vis && vis !== 'publico' ? '<span class="fi-selo" title="Só você vê. Para aparecer na ficha compartilhada, marque “Quem vê: público”.">só você</span>' : ''; }
  function estrelas(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

  function html(v, o) {
    o = o || {};
    if (!v) return '';
    var h = '<article class="fi">';
    h += '<header class="fi-cab"><span class="fi-avatar" aria-hidden="true">' + esc(inicial(v.nome)) + '</span><div>' +
      (v.nome ? '<h2 class="fi-nome">' + esc(v.nome) + '</h2>' : '<h2 class="fi-nome fi-nome-vazio">Seu nome aqui</h2>') +
      '<p class="fi-meta">' + [v.oficio, v.onde, v.area].filter(Boolean).map(esc).join(' · ') + '</p>' +
      (v.frase ? '<p class="fi-frase">' + esc(v.frase) + '</p>' : '') + '</div></header>';
    if (v.voz) h += '<section class="fi-voz" aria-label="A voz"><p class="fi-t">A voz</p><blockquote>' + esc(v.voz).replace(/\n/g, '<br>') + '</blockquote></section>';
    if (v.quemE) h += '<section class="fi-sec"><h3 class="fi-t">Quem é</h3>' + paragrafos(v.quemE) + '</section>';
    var est = v.estante || [];
    if (est.length) {
      var grupos = {}, ordem = [];
      est.forEach(function (x) { var g = x.grupo || 'Estante'; if (!grupos[g]) { grupos[g] = []; ordem.push(g); } grupos[g].push(x); });
      h += '<section class="fi-sec"><h3 class="fi-t">A estante <small>' + est.length + (est.length === 1 ? ' item' : ' itens') + '</small></h3>' + ordem.map(function (g) {
        return '<div class="fi-grupo"><p class="fi-g">' + esc(g) + '</p><div class="fi-itens">' + grupos[g].map(function (x) {
          var tit = x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.titulo) + ' <span aria-hidden="true">↗</span></a>' : esc(x.titulo);
          return '<div class="fi-item' + (x.fav ? ' fav' : '') + '"><b>' + tit + '</b>' + (x.por ? '<span>' + esc(x.por) + '</span>' : '') +
            (x.nota ? '<span class="fi-nota" title="Nota ' + x.nota + ' de 5">' + estrelas(x.nota) + '</span>' : '') +
            (x.corpo ? '<p>' + esc(x.corpo.split('\n')[0]) + '</p>' : '') + selo(x.vis, o) + '</div>';
        }).join('') + '</div></div>';
      }).join('') + '</section>';
    }
    if ((v.obra || []).length) h += '<section class="fi-sec"><h3 class="fi-t">A obra</h3><p class="fi-obra">' + v.obra.map(function (x) { return '<span>' + esc(x.nome) + (x.pecas ? ' <small>' + x.pecas + '</small>' : '') + '</span>'; }).join('') + '</p></section>';
    if ((v.caminho || []).length) h += '<section class="fi-sec"><h3 class="fi-t">O caminho</h3><ol class="fi-caminho">' + v.caminho.map(function (c) {
      return '<li><span class="fi-q">' + esc(c.quando || '') + '</span><div><b>' + esc(c.titulo) + '</b>' + (c.corpo ? '<p>' + esc(c.corpo.split('\n')[0]) + '</p>' : '') + selo(c.vis, o) + '</div></li>';
    }).join('') + '</ol></section>';
    if ((v.elos || []).length) h += '<section class="fi-sec"><h3 class="fi-t">Os elos</h3><ul class="fi-elos">' + v.elos.map(function (e) {
      var nome = e.url ? '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' + esc(e.titulo) + ' <span aria-hidden="true">↗</span></a>' : esc(e.titulo);
      return '<li><b>' + nome + '</b>' + (e.corpo ? '<span>' + esc(e.corpo.split('\n')[0]) + '</span>' : '<span class="fi-sem">sem o porquê ainda</span>') + selo(e.vis, o) + '</li>';
    }).join('') + '</ul></section>';
    if (!v.voz && !v.quemE && !est.length && !(v.caminho || []).length && !(v.elos || []).length) h += '<p class="fi-vazia">Esta ficha ainda está quase vazia.</p>';
    h += '</article>';
    return h;
  }

  var api = { SECOES: SECOES, ler: ler, escrever: escrever, md: md, html: html, esc: esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Ficha = api;
})(typeof window !== 'undefined' ? window : globalThis);
