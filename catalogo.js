/* ============================================================
   Portal Solar · catalogo.js — o motor dos índices: uma tabela do caderno vira uma mesa com etiquetas.

   De onde veio: o pedido dele em 27/out/2026: "um index no portal solar de todos os apps de i.a. e
   ferramentas pra desenvolvimento e aprendizado, e plataformas em geral, sem i.a., sabe aquele negócio
   de tags e filtros, esse é o melhor jeito de navegar porque você pode ver muito e mudar muito
   rapidamente e dinamicamente e visualizar tudo e abrir o que interessa". O plano está no caderno, em
   Logboard/# Board/Focos/O Índice — Plano.md. A técnica é a da busca facetada (a das lojas e das
   bibliotecas grandes): dentro de uma faceta as etiquetas somam (uma OU outra); entre facetas, apertam
   (esta E aquela); cada etiqueta mostra quantos itens ela traz com os outros filtros de agora, e as que
   não trazem nenhum se apagam. (O nome "Índice" já é o do menu, a tecla M; por isso o motor é o Catálogo.)

   O que faz: lê um arquivo do Atlas pelo índice da Biblioteca (/api/biblioteca e /api/ficha, como os
   Museus; no site exportado, o estatico.js responde pelos .json), faz de cada linha de tabela um item
   (o título "##" de cima vira um campo, ex. a Área) e desenha a busca, as etiquetas com a contagem, três
   vistas (grade, lista, tabela que se ordena), o "ao acaso" e o endereço que guarda os filtros
   (mandar o link é mandar a busca pronta: ferramentas.html#ia=sim&preco=gratis).

   Para onde vai: ferramentas.html (a primeira coleção, configurada em ferramentas.js). Depois, os Museus,
   as Causas do Doar e qualquer tabela do caderno (o passo P4 do plano): uma página com a sua configuração.
   ============================================================ */
(function () {
  'use strict';

  var CHAVE_VISTA = 'portal-catalogo-vista';
  var VISTAS = [['grade', 'Grade'], ['lista', 'Lista'], ['tabela', 'Tabela']];

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function celulas(l) { return l.trim().split('|').slice(1, -1).map(function (x) { return x.trim(); }); }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento: só não lembra */ } }
  var SEPARADOR = /^\s*\|\s*:?-{2,}/;

  /* o arquivo: "## Título" dá o valor do campo de grupo; cada tabela traz o seu cabeçalho
     (as colunas são lidas pelo nome, então a ordem delas no caderno pode mudar) */
  function lerTabelas(corpo, campoGrupo) {
    var itens = [], grupo = '', cab = null;
    var linhas = String(corpo || '').split(/\r?\n/);
    linhas.forEach(function (l, i) {
      var h2 = l.match(/^##\s+(.+)$/);
      if (h2) { grupo = h2[1].trim(); cab = null; return; }
      if (!/^\s*\|/.test(l)) { cab = null; return; }
      if (SEPARADOR.test(l)) return;
      var c = celulas(l);
      if (!cab) { if (SEPARADOR.test(linhas[i + 1] || '')) cab = c; return; }
      var it = {};
      cab.forEach(function (k, j) { it[k] = (c[j] || '').replace(/\[\[|\]\]/g, ''); });
      if (campoGrupo) it[campoGrupo] = grupo;
      itens.push(it);
    });
    return itens;
  }

  function montar(cfg) {
    var raiz = document.getElementById(cfg.raiz || 'ct');
    if (!raiz) return;
    var est = { itens: [], sel: {}, q: '', vista: 'grade', ordem: null, fichaId: '' };
    var todos = {};
    cfg.facetas.forEach(function (f) { est.sel[f.campo] = []; f.chave = f.chave || slug(f.campo); });
    var vistaGuardada = ler(CHAVE_VISTA);
    if (VISTAS.some(function (v) { return v[0] === vistaGuardada; })) est.vista = vistaGuardada;

    function valores(it, f) {
      var v = it[f.campo] || '';
      return f.varios ? v.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : (v.trim() ? [v.trim()] : []);
    }
    function rotulo(f, v) { return (f.rotulos && f.rotulos[v]) || v; }
    function posicao(f, v) {
      var i = f.ordem ? f.ordem.indexOf(v) : -1;
      return i < 0 ? 999 : i;
    }

    /* ---------- o esqueleto ---------- */
    raiz.innerHTML =
      '<section class="ct-barra" aria-label="Busca e filtros">' +
        '<div class="ct-linha">' +
          '<input type="search" class="ct-busca" id="ct-busca" autocomplete="off" placeholder="' + esc(cfg.busca || 'Buscar') + '" aria-label="Buscar">' +
          '<div class="ct-vistas" role="group" aria-label="Vista">' + VISTAS.map(function (v) {
            return '<button type="button" data-vista="' + v[0] + '">' + v[1] + '</button>';
          }).join('') + '</div>' +
          '<button type="button" class="ct-botao" id="ct-acaso" title="Mostra um item ao acaso, entre os que estão à vista">Ao acaso</button>' +
        '</div>' +
        '<details class="ct-filtros" id="ct-filtros" open><summary>Filtros <span id="ct-nfiltros"></span></summary><div class="ct-facetas" id="ct-facetas"></div></details>' +
        '<div class="ct-estado" id="ct-estado"></div>' +
      '</section>' +
      '<section class="ct-res" id="ct-res" aria-label="Resultados"></section>';
    var $ = function (id) { return document.getElementById(id); };
    if (window.matchMedia && matchMedia('(max-width: 720px)').matches) $('ct-filtros').open = false;

    /* ---------- o filtro ---------- */
    function palavras() { return norm(est.q).split(/\s+/).filter(Boolean); }
    function passa(it, exceto, qs) {
      for (var w = 0; w < qs.length; w++) if (it._busca.indexOf(qs[w]) < 0) return false;
      for (var i = 0; i < cfg.facetas.length; i++) {
        var f = cfg.facetas[i];
        var s = est.sel[f.campo];
        if (f.campo === exceto || !s.length) continue;
        var vs = valores(it, f);
        if (!s.some(function (v) { return vs.indexOf(v) >= 0; })) return false;
      }
      return true;
    }
    function nAtivos() {
      return cfg.facetas.reduce(function (n, f) { return n + est.sel[f.campo].length; }, 0) + (est.q.trim() ? 1 : 0);
    }

    /* ---------- o endereço guarda a busca ---------- */
    function escreverEndereco() {
      var partes = [];
      cfg.facetas.forEach(function (f) {
        if (est.sel[f.campo].length) partes.push(f.chave + '=' + est.sel[f.campo].map(encodeURIComponent).join(','));
      });
      if (est.q.trim()) partes.push('q=' + encodeURIComponent(est.q.trim()));
      if (est.vista !== 'grade') partes.push('vista=' + est.vista);
      var alvo = location.pathname + location.search + (partes.length ? '#' + partes.join('&') : '');
      try { history.replaceState(null, '', alvo); } catch (e) { /* arquivo aberto direto: sem histórico */ }
    }
    function lerEndereco() {
      var h = location.hash.replace(/^#/, '');
      var p = {};
      h.split('&').forEach(function (par) {
        var i = par.indexOf('=');
        if (i > 0) p[par.slice(0, i)] = par.slice(i + 1);
      });
      cfg.facetas.forEach(function (f) {
        est.sel[f.campo] = p[f.chave] ? p[f.chave].split(',').map(function (v) {
          try { return decodeURIComponent(v); } catch (e) { return v; }
        }).filter(function (v) { return (todos[f.campo] || []).indexOf(v) >= 0; }) : [];
      });
      try { est.q = p.q ? decodeURIComponent(p.q) : ''; } catch (e) { est.q = ''; }
      if (p.vista && VISTAS.some(function (v) { return v[0] === p.vista; })) est.vista = p.vista;
      $('ct-busca').value = est.q;
    }

    /* ---------- desenhar ---------- */
    function desenharFacetas(qs) {
      var foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('.ct-chip');
      var focoChave = foco ? foco.getAttribute('data-f') + '\u0001' + foco.getAttribute('data-v') : '';
      $('ct-facetas').innerHTML = cfg.facetas.map(function (f) {
        var base = est.itens.filter(function (it) { return passa(it, f.campo, qs); });
        return '<div class="ct-faceta" role="group" aria-label="' + esc(f.nome || f.campo) + '"><span class="ct-fnome">' + esc(f.nome || f.campo) + '</span><div class="ct-chips">' +
          todos[f.campo].map(function (v) {
            var n = 0;
            base.forEach(function (it) { if (valores(it, f).indexOf(v) >= 0) n++; });
            var on = est.sel[f.campo].indexOf(v) >= 0;
            return '<button type="button" class="ct-chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-f="' + esc(f.campo) + '" data-v="' + esc(v) + '"' +
              (!n && !on ? ' disabled' : '') + '>' + esc(rotulo(f, v)) + ' <span>' + n + '</span></button>';
          }).join('') + '</div></div>';
      }).join('');
      var n = nAtivos();
      $('ct-nfiltros').textContent = n ? '· ' + n + (n > 1 ? ' ligados' : ' ligado') : '';
      if (focoChave) {
        var de = $('ct-facetas').querySelectorAll('.ct-chip');
        for (var i = 0; i < de.length; i++) {
          if (de[i].getAttribute('data-f') + '\u0001' + de[i].getAttribute('data-v') === focoChave) { (de[i].disabled ? $('ct-busca') : de[i]).focus({ preventScroll: true }); break; }
        }
      }
    }

    function desenharEstado(visiveis) {
      var u = cfg.unidade || ['item', 'itens'];
      var ativos = [];
      cfg.facetas.forEach(function (f) {
        est.sel[f.campo].forEach(function (v) {
          ativos.push('<button type="button" class="ct-ativo" data-f="' + esc(f.campo) + '" data-v="' + esc(v) + '" title="Tirar este filtro">' + esc(f.nome || f.campo) + ': ' + esc(rotulo(f, v)) + ' <span aria-hidden="true">×</span></button>');
        });
      });
      if (est.q.trim()) ativos.push('<button type="button" class="ct-ativo" data-q="1" title="Limpar a busca">“' + esc(est.q.trim()) + '” <span aria-hidden="true">×</span></button>');
      $('ct-estado').innerHTML =
        '<span class="ct-conta" aria-live="polite"><b>' + visiveis.length + '</b> de ' + est.itens.length + ' ' + (est.itens.length === 1 ? u[0] : u[1]) + '</span>' +
        ativos.join('') +
        (ativos.length ? '<button type="button" class="ct-link" id="ct-limpar">Limpar tudo</button>' : '') +
        '<button type="button" class="ct-link" id="ct-copiar">Copiar o link desta busca</button>';
    }

    function linkDe(it) {
      var l = (it[cfg.link] || '').trim();
      return /^https?:\/\/[^\s"<>]+$/i.test(l) ? l : '';
    }
    function nomeComLink(it) {
      var l = linkDe(it);
      var nome = esc(it[cfg.nome]);
      return l ? '<a href="' + esc(l) + '" target="_blank" rel="noopener noreferrer">' + nome + ' <span class="ct-seta" aria-hidden="true">↗</span></a>' : nome;
    }
    function texto(it, campo) {
      var f = cfg.facetas.find(function (x) { return x.campo === campo; });
      return f ? valores(it, f).map(function (v) { return rotulo(f, v); }).join(', ') : (it[campo] || '');
    }

    function ordenados(lista) {
      if (!est.ordem) return lista;
      var campo = est.ordem.campo, dir = est.ordem.dir;
      var f = cfg.facetas.find(function (x) { return x.campo === campo; });
      return lista.slice().sort(function (a, b) {
        var r = 0;
        if (f && f.ordem) r = posicao(f, valores(a, f)[0]) - posicao(f, valores(b, f)[0]);
        if (!r) r = String(a[campo] || '').localeCompare(String(b[campo] || ''), 'pt-BR', { sensitivity: 'base' });
        if (!r) r = String(a[cfg.nome]).localeCompare(String(b[cfg.nome]), 'pt-BR', { sensitivity: 'base' });
        return r * dir;
      });
    }

    function desenharResultados(visiveis) {
      var c = cfg.cartao || {};
      var html = '';
      if (!visiveis.length) {
        html = '<p class="ct-vazio">Nada com esses filtros. Tire um deles (os botões com ×, acima) ou toque em Limpar tudo.</p>';
      } else if (est.vista === 'grade') {
        html = '<ol class="ct-grade">' + visiveis.map(function (it) {
          var selo = c.selo ? c.selo(it) : '';
          return '<li class="ct-cartao" data-i="' + it._i + '">' +
            '<p class="ct-sobre"><span>' + esc(texto(it, c.cima)) + '</span>' + (selo ? '<span class="ct-selo">' + esc(selo) + '</span>' : '') + '</p>' +
            '<h3 class="ct-nome">' + nomeComLink(it) + '</h3>' +
            '<p class="ct-texto">' + esc(it[cfg.texto]) + '</p>' +
            '<p class="ct-etiq">' + (c.baixo || []).map(function (k) { return esc(texto(it, k)); }).filter(Boolean).join(' · ') + '</p>' +
          '</li>';
        }).join('') + '</ol>';
      } else if (est.vista === 'lista') {
        html = '<ol class="ct-linhas">' + visiveis.map(function (it) {
          return '<li class="ct-linha-item" data-i="' + it._i + '"><span class="ct-nome">' + nomeComLink(it) + '</span>' +
            '<span class="ct-texto">' + esc(it[cfg.texto]) + '</span>' +
            '<span class="ct-etiq">' + esc(texto(it, c.cima)) + '</span>' +
            '<span class="ct-etiq">' + (c.baixo || []).slice(0, 2).map(function (k) { return esc(texto(it, k)); }).join(' · ') + '</span></li>';
        }).join('') + '</ol>';
      } else {
        var cols = [cfg.nome, cfg.texto].concat(cfg.colunas || []);
        html = '<div class="ct-tabela-caixa"><table class="ct-tabela"><thead><tr>' + cols.map(function (k) {
          var ord = est.ordem && est.ordem.campo === k ? (est.ordem.dir > 0 ? 'ascending' : 'descending') : 'none';
          var seta = ord === 'ascending' ? ' ↑' : ord === 'descending' ? ' ↓' : '';
          return '<th scope="col" aria-sort="' + ord + '"><button type="button" data-ordem="' + esc(k) + '">' + esc(k) + '<span aria-hidden="true">' + seta + '</span></button></th>';
        }).join('') + '</tr></thead><tbody>' + ordenados(visiveis).map(function (it) {
          return '<tr data-i="' + it._i + '">' + cols.map(function (k) {
            return k === cfg.nome ? '<th scope="row">' + nomeComLink(it) + '</th>' : '<td class="ct-c-' + slug(k) + '">' + esc(texto(it, k)) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
      }
      $('ct-res').innerHTML = html;
      $('ct-res').setAttribute('data-vista', est.vista);
      Array.prototype.forEach.call(raiz.querySelectorAll('[data-vista]'), function (b) {
        if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.getAttribute('data-vista') === est.vista));
      });
    }

    function desenhar() {
      var qs = palavras();
      var visiveis = est.itens.filter(function (it) { return passa(it, null, qs); });
      desenharFacetas(qs);
      desenharEstado(visiveis);
      desenharResultados(visiveis);
      escreverEndereco();
      return visiveis;
    }

    /* ---------- os toques ---------- */
    function alternar(campo, v) {
      var s = est.sel[campo];
      var i = s.indexOf(v);
      if (i >= 0) s.splice(i, 1); else s.push(v);
      desenhar();
    }
    $('ct-facetas').addEventListener('click', function (e) {
      var b = e.target.closest('.ct-chip');
      if (b && !b.disabled) alternar(b.getAttribute('data-f'), b.getAttribute('data-v'));
    });
    $('ct-estado').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'ct-limpar') {
        cfg.facetas.forEach(function (f) { est.sel[f.campo] = []; });
        est.q = ''; $('ct-busca').value = '';
        desenhar(); $('ct-busca').focus();
      } else if (b.id === 'ct-copiar') {
        var feito = function () { b.textContent = 'Link copiado'; setTimeout(function () { b.textContent = 'Copiar o link desta busca'; }, 2200); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(feito, function () { prompt('Copie o link:', location.href); });
        else prompt('Copie o link:', location.href);
      } else if (b.getAttribute('data-q')) {
        est.q = ''; $('ct-busca').value = ''; desenhar(); $('ct-busca').focus();
      } else if (b.getAttribute('data-f')) {
        alternar(b.getAttribute('data-f'), b.getAttribute('data-v'));
        $('ct-busca').focus({ preventScroll: true });
      }
    });
    $('ct-busca').addEventListener('input', function (e) { est.q = e.target.value; desenhar(); });
    $('ct-busca').addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && est.q) { e.preventDefault(); est.q = ''; e.target.value = ''; desenhar(); }
    });
    raiz.querySelector('.ct-vistas').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-vista]');
      if (!b) return;
      est.vista = b.getAttribute('data-vista');
      gravar(CHAVE_VISTA, est.vista);
      desenhar();
    });
    $('ct-res').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-ordem]');
      if (!b) return;
      var k = b.getAttribute('data-ordem');
      est.ordem = est.ordem && est.ordem.campo === k ? (est.ordem.dir > 0 ? { campo: k, dir: -1 } : null) : { campo: k, dir: 1 };
      desenhar();
      var de = $('ct-res').querySelector('button[data-ordem="' + k.replace(/"/g, '\\"') + '"]');
      if (de) de.focus({ preventScroll: true });
    });
    $('ct-acaso').addEventListener('click', function () {
      var vis = $('ct-res').querySelectorAll('[data-i]');
      if (!vis.length) return;
      var el = vis[Math.floor(Math.random() * vis.length)];
      var antes = $('ct-res').querySelector('.ct-acaso');
      if (antes) antes.classList.remove('ct-acaso');
      el.classList.add('ct-acaso');
      var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'center' });
      var a = el.querySelector('a');
      if (a) a.focus({ preventScroll: true });
      setTimeout(function () { el.classList.remove('ct-acaso'); }, 2600);
    });
    /* "/" leva à busca, como nos catálogos grandes */
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      $('ct-busca').focus();
    });
    window.addEventListener('hashchange', function () { if (est.itens.length) { lerEndereco(); desenhar(); } });

    /* ---------- o arquivo do caderno ---------- */
    $('ct-res').innerHTML = '<p class="ct-vazio">Lendo o caderno…</p>';
    fetch('/api/biblioteca').then(function (r) { return r.json(); }).then(function (idx) {
      var achado = (idx.itens || []).find(function (i) { return i[1] === cfg.arquivo; });
      if (!achado) throw new Error('sem ficha');
      est.fichaId = achado[0];
      return fetch('/api/ficha?id=' + encodeURIComponent(achado[0])).then(function (r) { return r.json(); });
    }).then(function (f) {
      est.itens = lerTabelas(f.corpo || '', cfg.grupo).filter(function (it) { return (it[cfg.nome] || '').trim(); });
      est.itens.forEach(function (it, i) {
        it._i = i;
        it._busca = norm(Object.keys(it).filter(function (k) { return k.charAt(0) !== '_' && k !== cfg.link; }).map(function (k) { return it[k]; }).join(' '));
      });
      cfg.facetas.forEach(function (f) {
        var vistos = [];
        est.itens.forEach(function (it) { valores(it, f).forEach(function (v) { if (vistos.indexOf(v) < 0) vistos.push(v); }); });
        if (f.ordem) vistos.sort(function (a, b) { return posicao(f, a) - posicao(f, b) || a.localeCompare(b, 'pt-BR'); });
        todos[f.campo] = vistos;
      });
      lerEndereco();
      var el = document.getElementById(cfg.resumo || 'ct-resumo');
      if (el && cfg.textoResumo) el.innerHTML = cfg.textoResumo(est.itens, valores);
      var nota = document.getElementById(cfg.nota || 'ct-nota');
      if (nota && cfg.textoNota) nota.innerHTML = cfg.textoNota(est.fichaId);
      desenhar();
    }).catch(function () {
      $('ct-res').innerHTML = '<p class="ct-vazio">Não achei o arquivo "' + esc(cfg.arquivo) + '" no Atlas (2 Academy › 3 Atlas › 0 Coleções).</p>';
    });

    return { estado: est, desenhar: desenhar };
  }

  window.Catalogo = { montar: montar, lerTabelas: lerTabelas };
})();
