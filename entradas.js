(function (raiz) {
  'use strict';

  var META = /^\*\s*(categoria:.*?)\s*\*$/i;
  var ORDEM = ['por', 'status', 'favorito', 'nota', 'idioma'];

  function lerMeta(texto) {
    var o = {};
    texto.split(/\s*·\s*/).forEach(function (p) {
      var m = p.match(/^([a-zç]+):\s*(.*)$/i);
      if (m) o[m[1].toLowerCase()] = m[2].trim();
    });
    return o;
  }

  function ler(texto) {
    var linhas = String(texto || '').replace(/\r\n?/g, '\n').split('\n');
    var pre = [];
    var entradas = [];
    var atual = null;
    linhas.forEach(function (l) {
      var h = l.match(/^##\s+(.+?)\s*$/);
      if (h) {
        var partes = h[1].split(' · ');
        atual = { quando: partes.length > 1 ? partes.shift().trim() : '', titulo: partes.join(' · ').trim(), categoria: '', visibilidade: '', extra: {}, corpo: [] };
        entradas.push(atual);
        return;
      }
      (atual ? atual.corpo : pre).push(l);
    });
    entradas.forEach(function (e) {
      var i = 0;
      while (i < e.corpo.length && !e.corpo[i].trim()) i++;
      var m = e.corpo[i] && e.corpo[i].trim().match(META);
      if (m) {
        var meta = lerMeta(m[1]);
        e.categoria = meta.categoria || '';
        e.visibilidade = meta.visibilidade || '';
        Object.keys(meta).forEach(function (k) { if (k !== 'categoria' && k !== 'visibilidade') e.extra[k] = meta[k]; });
        e.corpo.splice(i, 1);
      }
      e.corpo = e.corpo.join('\n').replace(/^\n+|\s+$/g, '');
    });
    return { pre: pre.join('\n').replace(/\s+$/, ''), entradas: entradas };
  }

  function escrever(modelo) {
    var blocos = modelo.entradas.map(function (e) {
      var cab = '## ' + (e.quando ? e.quando + ' · ' : '') + e.titulo;
      var extra = e.extra || {};
      var chaves = ORDEM.concat(Object.keys(extra).filter(function (k) { return ORDEM.indexOf(k) < 0; })).filter(function (k) { return extra[k]; });
      var meta = '';
      if (e.categoria || e.visibilidade || chaves.length) {
        var partes = ['categoria: ' + (e.categoria || 'geral')];
        chaves.forEach(function (k) { partes.push(k + ': ' + extra[k]); });
        if (e.visibilidade) partes.push('visibilidade: ' + e.visibilidade);
        meta = '*' + partes.join(' · ') + '*';
      }
      var b = cab + '\n';
      if (meta) b += '\n' + meta + '\n';
      if (e.corpo && e.corpo.trim()) b += '\n' + e.corpo.replace(/\s+$/, '') + '\n';
      return b;
    });
    return modelo.pre.replace(/\s+$/, '') + '\n\n' + blocos.join('\n');
  }

  function ano(quando) {
    var m = String(quando || '').match(/(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/);
    if (!m) return { chave: 9999, texto: '' };
    return { chave: +m[1] * 10000 + (m[2] ? +m[2] * 100 : 0) + (m[3] ? +m[3] : 0), texto: m[1] };
  }

  var api = { ler: ler, escrever: escrever, ano: ano };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.Entradas = api;
})(typeof window !== 'undefined' ? window : globalThis);
