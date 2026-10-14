(function () {
  'use strict';

  /* ============================================================
     AS LEITURAS (12/out/2026) — a memória de tudo o que você lê.

     "Que dê pra ler mais de um artigo ao mesmo tempo, agrupar eles,
     salvar, deixar dormindo pra não sobrecarregar, deixar na posição
     exata aonde você parou, clicar na palavra aonde você parou, fazer
     notas e highlights e ir pro seu perfil, agrupado por tema, por
     livro, e todos os links abertos também."

     Tudo fica no navegador (funciona também no site público, sem
     servidor). No app da casa, "Levar para o caderno" grava uma nota
     legível em Logboard/# Profile/Leituras.md (com cópia antes).

     Cada texto: { id, titulo, href, tipo, tema, livro, capa,
       aberto, dormindo, grupo, abertoEm, vistoEm, lidoPct,
       pos: { p, frac }, parei: { p, ini, palavra, em },
       marcas: [ { id, p, ini, fim, texto, cor, nota, em } ] }
     ============================================================ */

  var CHAVE = 'portal-leituras';
  var LIMITE_HIST = 400;
  var estado = carregar();

  function agora() { return new Date().toISOString(); }
  function carregar() {
    var e = null;
    try { e = JSON.parse(localStorage.getItem(CHAVE) || 'null'); } catch (x) { e = null; }
    if (!e || e.v !== 1) e = { v: 1, itens: {}, links: [], grupos: [] };
    e.itens = e.itens || {}; e.links = e.links || []; e.grupos = e.grupos || [];
    return e;
  }
  var gravarTimer = 0;
  function gravar(silencioso) {
    clearTimeout(gravarTimer);
    gravarTimer = setTimeout(escrever, 250);
    if (!silencioso) avisar();
  }
  /* a escrita de fato; também roda ao sair da página (nada se perde num clique rápido) */
  function escrever() {
    clearTimeout(gravarTimer); gravarTimer = 0;
    (function () {
      /* o histórico não cresce para sempre: os mais antigos fechados saem primeiro */
      var ids = Object.keys(estado.itens);
      if (ids.length > LIMITE_HIST) {
        ids.filter(function (id) { return !estado.itens[id].aberto && !(estado.itens[id].marcas || []).length; })
          .sort(function (a, b) { return (estado.itens[a].vistoEm || '').localeCompare(estado.itens[b].vistoEm || ''); })
          .slice(0, ids.length - LIMITE_HIST).forEach(function (id) { delete estado.itens[id]; });
      }
      if (estado.links.length > 300) estado.links = estado.links.slice(-300);
      try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (x) { /* sem espaço ou janela privada: segue na memória */ }
    })();
  }
  function pendente() { if (gravarTimer) escrever(); }
  window.addEventListener('pagehide', pendente);
  document.addEventListener('visibilitychange', function () { if (document.hidden) pendente(); });
  function avisar() { try { window.dispatchEvent(new CustomEvent('abertos:mudou')); } catch (x) { /* ok */ } }

  /* outra aba mudou: lê de novo */
  window.addEventListener('storage', function (ev) {
    if (ev.key !== CHAVE) return;
    /* o que esta aba ainda não gravou vai antes de ler a outra (senão se perderia) */
    if (gravarTimer) { escrever(); return; }
    estado = carregar(); avisar();
  });

  function item(id) { return estado.itens[id] || null; }

  function abrir(o) {
    if (!o || !o.id) return null;
    var x = estado.itens[o.id] || { id: o.id, marcas: [], abertoEm: agora() };
    ['titulo', 'href', 'tipo', 'tema', 'livro', 'capa'].forEach(function (k) { if (o[k]) x[k] = o[k]; });
    x.aberto = true; x.dormindo = false; x.vistoEm = agora();
    estado.itens[o.id] = x;
    gravar();
    return x;
  }
  function posicao(id, pos, pct) {
    var x = item(id); if (!x) return;
    x.pos = pos; if (pct != null) x.lidoPct = Math.max(x.lidoPct || 0, Math.round(pct));
    x.vistoEm = agora();
    gravar(true);
  }
  function parei(id, marca) {
    var x = item(id); if (!x) return;
    x.parei = marca ? { p: marca.p, ini: marca.ini, palavra: marca.palavra, em: agora() } : null;
    gravar();
  }
  function marcar(id, m) {
    var x = item(id); if (!x) return null;
    m.id = m.id || 'm' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    m.em = m.em || agora();
    x.marcas = (x.marcas || []).filter(function (y) { return y.id !== m.id; }).concat([m]);
    gravar();
    return m;
  }
  function desmarcar(id, mid) {
    var x = item(id); if (!x) return;
    x.marcas = (x.marcas || []).filter(function (y) { return y.id !== mid; });
    gravar();
  }
  function dormir(id, sim) { var x = item(id); if (!x) return; x.dormindo = sim !== false; gravar(); }
  function fechar(id) { var x = item(id); if (!x) return; x.aberto = false; x.dormindo = false; x.fechadoEm = agora(); gravar(); }
  function reabrir(id) { var x = item(id); if (!x) return; x.aberto = true; x.dormindo = false; gravar(); }
  function grupo(id, nome) {
    var x = item(id); if (!x) return;
    x.grupo = nome || '';
    if (nome && estado.grupos.indexOf(nome) < 0) estado.grupos.push(nome);
    gravar();
  }
  function renomearGrupo(antigo, novo) {
    Object.keys(estado.itens).forEach(function (id) { if (estado.itens[id].grupo === antigo) estado.itens[id].grupo = novo; });
    estado.grupos = estado.grupos.map(function (g) { return g === antigo ? novo : g; }).filter(function (g, i, a) { return g && a.indexOf(g) === i; });
    gravar();
  }
  function link(url, titulo, origem) {
    if (!/^https?:/.test(url || '')) return;
    estado.links = estado.links.filter(function (l) { return l.url !== url; });
    estado.links.push({ url: url, titulo: titulo || url, origem: origem || '', em: agora() });
    gravar();
  }
  function esquecerLink(url) { estado.links = estado.links.filter(function (l) { return l.url !== url; }); gravar(); }

  function lista() {
    return Object.keys(estado.itens).map(function (id) { return estado.itens[id]; })
      .sort(function (a, b) { return (b.vistoEm || '').localeCompare(a.vistoEm || ''); });
  }
  function todasMarcas() {
    var r = [];
    lista().forEach(function (x) { (x.marcas || []).forEach(function (m) { r.push({ marca: m, texto: x }); }); });
    return r.sort(function (a, b) { return (b.marca.em || '').localeCompare(a.marca.em || ''); });
  }

  /* a nota do caderno: legível no Obsidian, agrupada por tema e por livro */
  function umaLinha(t) { return String(t == null ? '' : t).replace(/\s*\n\s*/g, ' ').trim(); }
  function exportarMd() {
    var dia = new Date().toLocaleDateString('pt-BR');
    var linhas = ['# Leituras', '', '> Gerado pelo Portal Solar em ' + dia + ' (página Leituras → Levar para o caderno). O que estiver aqui volta a ser gerado inteiro na próxima vez: para escrever à mão, use outra nota.', ''];
    var grupos = {};
    lista().forEach(function (x) {
      var g = x.grupo || x.livro || x.tema || 'Sem grupo';
      (grupos[g] = grupos[g] || []).push(x);
    });
    Object.keys(grupos).sort(function (a, b) { return a.localeCompare(b, 'pt'); }).forEach(function (g) {
      linhas.push('## ' + umaLinha(g), '');
      grupos[g].forEach(function (x) {
        var estadoTxt = x.aberto ? (x.dormindo ? 'dormindo' : 'aberto') : 'lido';
        linhas.push('### ' + umaLinha(x.titulo || x.id), '');
        linhas.push('- ' + estadoTxt + (x.lidoPct ? ' · ' + x.lidoPct + '% lido' : '') + (x.parei && x.parei.palavra ? ' · parou em "' + x.parei.palavra + '"' : '') + (x.href ? ' · [abrir](' + x.href + ')' : ''));
        (x.marcas || []).forEach(function (m) {
          linhas.push('- ==' + String(m.texto || '').replace(/\s+/g, ' ').trim() + '==' + (m.nota ? ' — ' + umaLinha(m.nota) : ''));
        });
        linhas.push('');
      });
    });
    if (estado.links.length) {
      linhas.push('## Links abertos', '');
      estado.links.slice().reverse().forEach(function (l) { linhas.push('- [' + umaLinha(l.titulo).replace(/[\[\]]/g, '') + '](' + umaLinha(l.url).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\s/g, '%20') + ')' + (l.origem ? ' — de ' + umaLinha(l.origem) : '')); });
      linhas.push('');
    }
    return linhas.join('\n');
  }

  window.Abertos = {
    abrir: abrir, item: item, posicao: posicao, parei: parei, marcar: marcar, desmarcar: desmarcar,
    dormir: dormir, fechar: fechar, reabrir: reabrir, grupo: grupo, renomearGrupo: renomearGrupo,
    link: link, esquecerLink: esquecerLink, lista: lista, todasMarcas: todasMarcas,
    grupos: function () { return estado.grupos.slice(); }, links: function () { return estado.links.slice(); },
    exportarMd: exportarMd,
  };
})();
