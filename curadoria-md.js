/* ============================================================
   A CURADORIA EM MARKDOWN, IDA E VOLTA (09/out/2026, PERFIL.md item 75)
   "VOU ALTERANDO E MELHORANDO!": o post que vai para o caderno é o mesmo post que o app mostra.
   escrever(post, areas) → o .md (bom de ler e de mexer no Obsidian)
   ler(texto, areas)     → { post, problemas } — o post inteiro de volta (abertura, linhagem, partes,
                           glossário, linha do tempo, perguntas); o que não entendeu vira um aviso,
                           nunca some calado.
   O formato, em resumo:
     ---  formato, slug, numero, titulo, sub, data, curador, estado, capa  ---
     # Título
     > **Como foi feita.** …
     ## A abertura                (parágrafos)
     ## A linhagem                - **Nome** · anos · terra · *obra* · o que fez · [mais](url)
     ## 1. Título · Lugar         <!-- id: … -->, *a chamada*, parágrafos, ### Ouvir / ### Ler / ### Fontes
     ## O glossário               ### Termo · original, <!-- id: … -->, - **quando:** … **ano:** … **área:** …
                                  **sente:** … **liga com:** Termo; Termo · **livros:** Autor, *Título* (ano); …
     ## A linha do tempo          - 1776 — o que aconteceu   (antes de Cristo: "380 a.C.")
     ## Para você                 - perguntas
   ============================================================ */
(function (raiz) {
  'use strict';

  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function anoTxt(a) { a = Number(a); return a < 0 ? Math.abs(a) + ' a.C.' : String(a); }
  function anoNum(t) {
    var m = String(t || '').trim().match(/^(?:c\.\s*)?(-?\d+)(\s*a\.\s*C\.)?$/i);
    if (!m) return null;
    var n = parseInt(m[1], 10);
    return m[2] ? -Math.abs(n) : n;
  }
  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function norm(s) { return slug(s).replace(/-/g, ''); }
  function linha1(s) { return String(s == null ? '' : s).replace(/\s*\n+\s*/g, ' ').trim(); }
  /* endereços com parênteses (Black_Square_(painting)) quebram o [texto](url): vão como %28 %29 e voltam iguais */
  function urlIda(u) { return String(u || '').replace(/\(/g, '%28').replace(/\)/g, '%29'); }
  function urlVolta(u) { return String(u || '').replace(/%28/gi, '(').replace(/%29/gi, ')'); }
  var LINK = /^\[([^\]]+)\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/;

  /* ================= escrever ================= */
  function escrever(p, areas) {
    var nomeArea = {}; (areas || []).forEach(function (a) { nomeArea[a[0]] = a[1]; });
    var nomeTermo = {}; (p.glossario || []).forEach(function (g) { nomeTermo[g.id] = g.termo; });
    var L = ['---', 'formato: curadoria', 'slug: ' + p.slug, 'numero: ' + (p.numero || ''), 'titulo: ' + linha1(p.titulo), 'sub: ' + linha1(p.sub || ''),
      'data: ' + (p.data || ''), 'curador: ' + linha1(p.curador && p.curador.nome || p.curador || ''), 'estado: ' + linha1(p.estado || ''),
      'capa: ' + (p.capa ? [p.capa.cor, p.capa.sol].filter(Boolean).join(' ') : ''), '---', '', '# ' + linha1(p.titulo), ''];
    if (p.como) L.push('> **Como foi feita.** ' + linha1(p.como), '');
    if (p.abertura && p.abertura.length) { L.push('## A abertura', ''); p.abertura.forEach(function (t) { L.push(linha1(t), ''); }); }
    if (p.linhagem && p.linhagem.length) {
      L.push('## A linhagem', '');
      p.linhagem.forEach(function (x) {
        L.push('- **' + linha1(x.nome) + '** · ' + linha1(x.anos) + ' · ' + linha1(x.terra) + ' · *' + linha1(x.obra) + '* · ' + linha1(x.fez) + (x.url ? ' · [mais](' + urlIda(x.url) + ')' : x.voce ? ' · você' : ''));
      });
      L.push('');
    }
    (p.partes || []).forEach(function (x, i) {
      L.push('## ' + (i + 1) + '. ' + linha1(x.titulo) + (x.lugar ? ' · ' + linha1(x.lugar) : ''), '<!-- id: ' + x.id + ' -->', '');
      if (x.lead) L.push('*' + linha1(x.lead) + '*', '');
      (x.texto || []).forEach(function (t) { L.push(linha1(t), ''); });
      if (x.ouvir && x.ouvir.length) { L.push('### Ouvir', ''); x.ouvir.forEach(function (o) { L.push('- ' + o.map(linha1).join(' · ')); }); L.push(''); }
      if (x.ler && x.ler.length) { L.push('### Ler', ''); x.ler.forEach(function (o) { L.push('- ' + o.map(linha1).join(' · ')); }); L.push(''); }
      if (x.fontes && x.fontes.length) { L.push('### Fontes', ''); x.fontes.forEach(function (f) { L.push('- [' + linha1(f[0]) + '](' + urlIda(f[1]) + ')'); }); L.push(''); }
    });
    if (p.glossario && p.glossario.length) {
      L.push('## O glossário', '');
      p.glossario.forEach(function (g) {
        L.push('### ' + linha1(g.termo) + (g.original ? ' · ' + linha1(g.original) : ''), '<!-- id: ' + g.id + ' -->', '',
          '- **quando:** ' + linha1(g.quando), '- **ano:** ' + anoTxt(g.ano), '- **área:** ' + (nomeArea[g.area] || g.area), '- **sente:** ' + linha1(g.sente),
          '- **liga com:** ' + (g.liga || []).map(function (id) { return nomeTermo[id] || id; }).join('; '),
          '- **livros:** ' + (g.livros || []).map(function (b) { return linha1(b[0]) + ', *' + linha1(b[1]) + '* (' + anoTxt(b[2]) + ')'; }).join('; '),
          '', linha1(g.texto), '');
      });
    }
    if (p.linha && p.linha.length) { L.push('## A linha do tempo', ''); p.linha.forEach(function (e) { L.push('- ' + anoTxt(e[0]) + ' — ' + linha1(e[1])); }); L.push(''); }
    if (p.perguntas && p.perguntas.length) { L.push('## Para você', ''); p.perguntas.forEach(function (q) { L.push('- ' + linha1(q)); }); L.push(''); }
    return L.join('\n');
  }

  /* ================= ler ================= */
  function topo(t) {
    var o = {}, corpo = t, m;
    /* um cabeçalho, ou dois seguidos (um arquivo antigo pode ter saído assim): o segundo completa o primeiro */
    while ((m = corpo.replace(/^\s+/, '').match(/^---\n([\s\S]*?)\n---\n?/))) {
      m[1].split('\n').forEach(function (l) { var k = l.match(/^([\wçãéí]+):\s*(.*)$/i); if (k) o[k[1].toLowerCase()] = k[2].trim(); });
      corpo = corpo.replace(/^\s+/, '').slice(m[0].length);
    }
    return { meta: o, corpo: corpo };
  }
  /* blocos: parágrafos, listas e títulos, separados por linha em branco */
  function blocos(linhas) {
    var out = [], cur = null;
    function fecha() { if (cur) { out.push(cur); cur = null; } }
    linhas.forEach(function (l) {
      var t = l.trim();
      if (!t) { fecha(); return; }
      var id = t.match(/^<!--\s*id:\s*([a-z0-9-]+)\s*-->$/i);
      if (id) { fecha(); out.push({ tipo: 'id', valor: id[1] }); return; }
      if (/^<!--[\s\S]*-->$/.test(t)) return;
      var h = t.match(/^(#{3,6})\s+(.*)$/);
      if (h) { fecha(); out.push({ tipo: 'h', valor: h[2].trim() }); return; }
      var li = t.match(/^[-*+]\s+(.*)$/);
      if (li) { if (!cur || cur.tipo !== 'lista') { fecha(); cur = { tipo: 'lista', itens: [] }; } cur.itens.push(li[1]); return; }
      if (cur && cur.tipo === 'lista') { cur.itens[cur.itens.length - 1] += ' ' + t; return; }
      if (!cur) cur = { tipo: 'p', linhas: [] };
      cur.linhas.push(t);
    });
    fecha();
    return out.map(function (b) { if (b.tipo === 'p') b.texto = b.linhas.join(' '); return b; });
  }
  function separar(corpo) {
    var secs = [], cur = { titulo: '', linhas: [] }, h1 = '';
    corpo.split('\n').forEach(function (l) {
      var a = l.match(/^#\s+(.*)$/); if (a && !h1) { h1 = a[1].trim(); return; }
      var h = l.match(/^##\s+(.*)$/);
      if (h) { secs.push(cur); cur = { titulo: h[1].trim(), linhas: [] }; return; }
      cur.linhas.push(l);
    });
    secs.push(cur);
    return { h1: h1, secs: secs };
  }
  var tira = function (s) { return String(s).replace(/^\*\*|\*\*$/g, '').replace(/^\*(?!\*)|(?<!\*)\*$/g, '').trim(); };

  function ler(texto, areas) {
    var problemas = [];
    var t = String(texto || '').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var tp = topo(t), meta = tp.meta;
    var sp = separar(tp.corpo);
    var idArea = {}; (areas || []).forEach(function (a) { idArea[norm(a[1])] = a[0]; idArea[norm(a[0])] = a[0]; });
    var capa = (meta.capa || '').split(/[\s,]+/).filter(Boolean);
    var p = {
      slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug || '') ? meta.slug : slug(sp.h1 || meta.titulo || ''),
      numero: meta.numero ? Number(meta.numero) || meta.numero : '',
      titulo: sp.h1 || meta.titulo || '', sub: meta.sub || '', data: meta.data || '',
      curador: { nome: meta.curador || '' }, estado: meta.estado || '',
      capa: capa.length ? { cor: capa[0], sol: capa[1] || capa[0] } : null,
      como: '', abertura: [], linhagem: [], partes: [], glossario: [], linha: [], perguntas: [],
    };
    /* o que vem antes da primeira seção: a nota de como foi feita */
    var antes = blocos(sp.secs[0].linhas).filter(function (b) { return b.tipo === 'p'; });
    antes.forEach(function (b) { var m = b.texto.match(/^>\s*(?:\*\*Como foi feita\.\*\*\s*)?(.*)$/); if (m && /^>/.test(b.texto)) p.como = (p.como ? p.como + ' ' : '') + m[1].replace(/^>\s*/, ''); });

    sp.secs.slice(1).forEach(function (s) {
      var tit = s.titulo, bs = blocos(s.linhas);
      if (/^a abertura$/i.test(tit)) { bs.forEach(function (b) { if (b.tipo === 'p') p.abertura.push(b.texto); }); return; }
      if (/^a linhagem$/i.test(tit)) {
        bs.forEach(function (b) {
          if (b.tipo !== 'lista') return;
          b.itens.forEach(function (it) {
            var c = it.split(/\s+·\s+/);
            var x = { nome: tira(c[0] || ''), anos: c[1] || '', terra: c[2] || '', obra: tira(c[3] || ''), fez: '', url: null };
            var ult = c.length > 5 ? c[c.length - 1] : '';
            var link = ult.match(LINK);
            if (link) x.url = urlVolta(link[2]);
            else if (/^voc[eê]$/i.test(ult)) x.voce = true;
            x.fez = c.slice(4, link || x.voce ? -1 : undefined).join(' · ');
            if (!x.nome) problemas.push('Uma linha da linhagem ficou sem nome: "' + it.slice(0, 60) + '"');
            else p.linhagem.push(x);
          });
        });
        return;
      }
      var parte = tit.match(/^(\d+)\.\s+(.*)$/);
      if (parte) {
        var tl = parte[2].split(/\s+·\s+/);
        var x = { id: '', titulo: tl[0], lugar: tl.slice(1).join(' · '), lead: '', texto: [], ouvir: [], ler: [], fontes: [] };
        var onde = 'texto';
        bs.forEach(function (b) {
          if (b.tipo === 'id') { x.id = b.valor; return; }
          if (b.tipo === 'h') { onde = /ouvir/i.test(b.valor) ? 'ouvir' : /^ler/i.test(b.valor) ? 'ler' : /fontes/i.test(b.valor) ? 'fontes' : 'texto'; return; }
          if (onde === 'texto' && b.tipo === 'p') {
            if (!x.lead && !x.texto.length && /^\*[^*][\s\S]*\*$/.test(b.texto) && !/^\*\*/.test(b.texto)) x.lead = b.texto.slice(1, -1).trim();
            else x.texto.push(b.texto);
            return;
          }
          if (b.tipo !== 'lista') return;
          b.itens.forEach(function (it) {
            if (onde === 'fontes') { var f = it.match(LINK); if (f) x.fontes.push([f[1], urlVolta(f[2])]); else problemas.push('Fonte sem link em "' + x.titulo + '": ' + it.slice(0, 60)); return; }
            if (onde === 'ouvir' || onde === 'ler') {
              var c = it.split(/\s+·\s+/);
              if (c.length < 2) { problemas.push('Em "' + x.titulo + '", ' + onde + ': faltou separar com " · " — ' + it.slice(0, 60)); return; }
              x[onde].push([c[0], c.slice(1, c.length > 2 ? -1 : undefined).join(' · '), c.length > 2 ? c[c.length - 1] : '']);
              return;
            }
            x.texto.push(it);
          });
        });
        if (!x.id) x.id = slug(x.titulo) || 'parte-' + parte[1];
        p.partes.push(x);
        return;
      }
      if (/gloss[aá]rio/i.test(tit)) {
        var g = null;
        var fecha = function () { if (g) { if (!g.id) g.id = slug(g.termo); p.glossario.push(g); } };
        bs.forEach(function (b) {
          if (b.tipo === 'h') {
            fecha();
            var hc = b.valor.split(/\s+·\s+/);
            g = { id: '', termo: hc[0], original: hc.slice(1).join(' · '), ano: null, quando: '', area: '', sente: '', texto: '', livros: [], liga: [] };
            return;
          }
          if (!g) return;
          if (b.tipo === 'id') { g.id = b.valor; return; }
          if (b.tipo === 'p') { g.texto = g.texto ? g.texto + '\n\n' + b.texto : b.texto; return; }
          if (b.tipo !== 'lista') return;
          b.itens.forEach(function (it) {
            var m = it.match(/^\*\*([^*:]+):\*\*\s*(.*)$/);
            if (!m) { g.texto = g.texto ? g.texto + ' ' + it : it; return; }
            var k = norm(m[1]), v = m[2].trim();
            if (k === 'quando') g.quando = v;
            else if (k === 'ano') { g.ano = anoNum(v); if (g.ano === null) problemas.push('"' + g.termo + '": o ano "' + v + '" não é um número (use 1849 ou 380 a.C.)'); }
            else if (k === 'area') { g.area = idArea[norm(v)] || slug(v); if (!idArea[norm(v)]) problemas.push('"' + g.termo + '": a área "' + v + '" não existe (use ' + (areas || []).map(function (a) { return a[1]; }).join(', ') + ')'); }
            else if (k === 'sente') g.sente = v;
            else if (k === 'ligacom' || k === 'liga') g._liga = v.split(/\s*;\s*/).filter(Boolean); /* resolvidos depois que o glossário todo foi lido */
            else if (k === 'livros') {
              v.split(/;\s+/).forEach(function (lv) {
                var b2 = lv.trim().match(/^(.*?),\s*\*(.+?)\*\s*(?:\((.+?)\))?\.?$/);
                if (b2) { var a2 = anoNum(b2[3]); g.livros.push([b2[1].trim(), b2[2].trim(), a2 === null ? (b2[3] || '') : a2]); }
                else if (lv.trim()) problemas.push('"' + g.termo + '": não entendi o livro "' + lv.trim().slice(0, 60) + '" (use Autor, *Título* (ano))');
              });
            }
          });
        });
        fecha();
        return;
      }
      if (/linha do tempo/i.test(tit)) {
        bs.forEach(function (b) {
          if (b.tipo !== 'lista') return;
          b.itens.forEach(function (it) {
            var m = it.match(/^(.+?)\s+[—–-]\s+(.*)$/), a = m ? anoNum(m[1]) : null;
            if (m && a !== null) p.linha.push([a, m[2].trim()]);
            else problemas.push('Linha do tempo: não entendi "' + it.slice(0, 60) + '" (use 1776 — o que aconteceu)');
          });
        });
        return;
      }
      if (/para voc[eê]|perguntas/i.test(tit)) { bs.forEach(function (b) { if (b.tipo === 'lista') b.itens.forEach(function (q) { p.perguntas.push(q); }); else if (b.tipo === 'p') p.perguntas.push(b.texto); }); return; }
      if (tit) problemas.push('A seção "' + tit + '" não é uma das conhecidas; ela fica só no arquivo.');
    });

    /* um termo escrito duas vezes: os dois ficam, cada um com o seu endereço, e o aviso diz qual */
    var vistos = {};
    p.glossario.forEach(function (g) {
      if (vistos[g.id]) { var n = 2; while (vistos[g.id + '-' + n]) n++; problemas.push('"' + g.termo + '" aparece mais de uma vez no glossário; a repetição ficou como ' + g.id + '-' + n + '.'); g.id = g.id + '-' + n; }
      vistos[g.id] = 1;
    });
    /* as ligações: pelo nome do termo (ou pelo id); a primeira vez que um nome aparece é a que vale */
    var porNome = {}; p.glossario.forEach(function (g) { if (!porNome[norm(g.termo)]) porNome[norm(g.termo)] = g.id; if (!porNome[norm(g.id)]) porNome[norm(g.id)] = g.id; });
    p.glossario.forEach(function (g) {
      var nomes = g._liga || []; delete g._liga;
      nomes.forEach(function (n) {
        var id = porNome[norm(n)];
        if (id) { if (id !== g.id && g.liga.indexOf(id) < 0) g.liga.push(id); }
        else problemas.push('"' + g.termo + '" liga com "' + n + '", que não está no glossário.');
      });
      if (g.ano === null) g.ano = anoNum((String(g.quando).match(/-?\d{3,4}/g) || []).pop()) || 2000;
    });
    var estruturado = !!(p.abertura.length || p.linhagem.length || p.partes.length || p.glossario.length);
    return { post: p, problemas: problemas, estruturado: estruturado };
  }

  var api = { escrever: escrever, ler: ler, anoTxt: anoTxt, anoNum: anoNum };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.CuradoriaMD = api;
})(typeof window !== 'undefined' ? window : globalThis);
