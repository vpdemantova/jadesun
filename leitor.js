(function () {
  'use strict';

  /* ============================================================
     O LEITOR (12/out/2026) — três colunas para ler de verdade.

     "Teremos sempre três colunas: a da esquerda com todas as imagens,
     a do meio com o texto super diagramado e estruturado e a da direita
     com toda a navegação e widgets." (o dono, 12/out)

     · ESQUERDA, as imagens: descem junto com o texto, cada uma presa ao
       parágrafo que a cita ("Seguir o texto"), ou rolam soltas ("Livre").
       Tamanhos diferentes (a principal grande, as do texto médias, as da
       galeria pequenas), e cada uma muda de tamanho num clique. A legenda:
       completa, curta, só um ícone ou oculta; o título: menor ou expandido.
     · MEIO, o texto: cada parágrafo tem um número; as referências no fim
       do parágrafo (completas, só o número com a nota ao lado, ou ocultas),
       nunca inventadas: vêm das notas de rodapé do caderno, dos links do
       próprio parágrafo, da linha "Da Wikipédia…" e da seção "Fontes".
     · DIREITA, a navegação: a leitura (quanto falta, parei aqui, os modos),
       os textos abertos (ao lado, dormindo, grupos), o sumário, a ficha,
       as suas marcas e as referências.
     · CELULAR: três painéis lado a lado (arraste), "Ver tudo" (afasta e
       mostra os três), e o modo Página (o texto vira páginas contadas,
       com as imagens da página em cima).

     Uso: Leitor.montar({ grade, artigo, lateral, dados, ampliar }).
     A memória (posição, marcas, abertos) mora no abertos.js.
     ============================================================ */

  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = function (n) { return P.icone ? P.icone(n) : ''; };
  var A = function () { return window.Abertos; };
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CEL = function () { return window.matchMedia && matchMedia('(max-width: 900px)').matches; };

  /* ── as preferências de leitura (no navegador) ── */
  var CH_PREF = 'portal-leitor';
  var PADRAO = { img: 'seguir', tam: 'm', leg: 'completa', tit: 'menor', refs: 'numero', modo: 'colunas', modoCel: 'colunas', figs: {} };
  var pref = (function () { var o = {}; try { o = JSON.parse(localStorage.getItem(CH_PREF) || '{}') || {}; } catch (e) { o = {}; } var r = {}; Object.keys(PADRAO).forEach(function (k) { r[k] = o[k] != null ? o[k] : PADRAO[k]; }); return r; })();
  function gravarPref() { try { localStorage.setItem(CH_PREF, JSON.stringify(pref)); } catch (e) { /* ok */ } }
  /* o modo Página é lembrado à parte no celular e no computador */
  var CHAVE_MODO = (window.matchMedia && matchMedia('(max-width: 900px)').matches) ? 'modoCel' : 'modo';
  pref.modo = pref[CHAVE_MODO] || 'colunas';

  var atual = null;

  /* ============ a montagem ============ */
  function montar(o) {
    desmontar();
    if (!o || !o.grade || !o.artigo) return null;
    var d = o.dados || {};
    var id = d.id || location.pathname + location.hash;
    var raiz = document.createElement('div');
    raiz.className = 'lt';
    raiz.setAttribute('data-refs', pref.refs);
    raiz.setAttribute('data-img', pref.img);
    raiz.setAttribute('data-tam', pref.tam);
    raiz.setAttribute('data-leg', pref.leg);
    raiz.setAttribute('data-tit', pref.tit);
    raiz.setAttribute('data-modo', pref.modo);
    raiz.setAttribute('data-cel', 'texto');
    raiz.innerHTML =
      '<div class="lt-barra" role="toolbar" aria-label="Como ler">' +
        '<div class="lt-abas" role="tablist" aria-label="Colunas">' +
          '<button type="button" role="tab" data-pane="imagens" aria-selected="false">' + ic('protetor') + '<span>Imagens</span></button>' +
          '<button type="button" role="tab" data-pane="texto" aria-selected="true">' + ic('pagina') + '<span>Texto</span></button>' +
          '<button type="button" role="tab" data-pane="nav" aria-selected="false">' + ic('mapa') + '<span>Navegar</span></button>' +
        '</div>' +
        '<div class="lt-barra-dir">' +
          '<button type="button" class="lt-b" data-lt="geral" aria-pressed="false" title="Ver as três colunas juntas">' + ic('colunas') + '<span>Ver tudo</span></button>' +
          '<button type="button" class="lt-b" data-lt="pagina" aria-pressed="' + (pref.modo === 'pagina') + '" title="Ler como páginas">' + ic('pagina') + '<span>Página</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="lt-panes">' +
        '<aside class="lt-col lt-imgs" data-pane="imagens" aria-label="Imagens deste texto" data-lenis-prevent>' +
          '<header class="lt-col-cab"><p class="rot">Imagens <b class="lt-n-img"></b></p>' +
            '<div class="lt-seg" role="group" aria-label="As imagens">' +
              '<button type="button" data-img="seguir" aria-pressed="' + (pref.img === 'seguir') + '" title="As imagens acompanham o parágrafo que você lê">Seguir o texto</button>' +
              '<button type="button" data-img="livre" aria-pressed="' + (pref.img === 'livre') + '" title="As imagens rolam soltas">Livre</button>' +
            '</div>' +
            '<button type="button" class="lt-ic" data-lt="ajustes-img" aria-expanded="false" title="Tamanho, legenda e título">' + ic('pers') + '</button>' +
          '</header>' +
          '<div class="lt-ajustes" hidden>' + htmlAjustesImg() + '</div>' +
          '<div class="lt-imgs-lista"></div>' +
        '</aside>' +
        '<div class="lt-col lt-texto" data-pane="texto"></div>' +
        '<aside class="lt-col lt-nav" data-pane="nav" aria-label="Navegação, notas e referências" data-lenis-prevent></aside>' +
      '</div>' +
      '<div class="lt-prog" aria-hidden="true"><i></i></div>' +
      '<div class="lt-pg" hidden><button type="button" class="lt-pg-b" data-lt="pg-ant" aria-label="Página anterior">' + ic('voltar') + '</button><span class="lt-pg-n" aria-live="polite"></span><i class="lt-pg-barra"><i></i></i><button type="button" class="lt-pg-b" data-lt="pg-prox" aria-label="Próxima página">' + ic('seguir') + '</button></div>' +
      '<div class="lt-pop" role="dialog" aria-label="Marcar o trecho" hidden></div>';

    o.grade.replaceWith(raiz);
    var colTexto = raiz.querySelector('.lt-texto');
    colTexto.appendChild(o.artigo);
    var nav = raiz.querySelector('.lt-nav');

    var ctx = { raiz: raiz, artigo: o.artigo, nav: nav, id: id, d: d, o: o, figs: [], refs: [], blocos: [], obs: [], limpar: [] };
    atual = ctx;

    indexar(ctx);
    imagens(ctx);
    referencias(ctx);
    painel(ctx, o.lateral);
    pintarMarcas(ctx);
    ligar(ctx);
    if (A()) A().abrir({ id: id, titulo: d.titulo, href: d.href || location.pathname + location.hash, tipo: d.tipo, tema: d.tema, livro: d.livro, capa: ctx.figs[0] ? ctx.figs[0].src : '' });
    retomar(ctx);
    /* no celular, o leitor abre no painel do texto */
    if (CEL()) { var pn = raiz.querySelector('.lt-panes'); pn.scrollLeft = colTexto.offsetLeft; marcarAba(ctx, 'texto'); }
    if (pref.modo === 'pagina') ligarPagina(ctx, true);
    return { raiz: raiz };
  }

  function desmontar() {
    if (!atual) return;
    atual.obs.forEach(function (x) { x.disconnect(); });
    atual.limpar.forEach(function (f) { try { f(); } catch (e) { /* ok */ } });
    atual = null;
  }

  /* ── 1. cada bloco do texto ganha um número (a posição, as marcas e as imagens se prendem a ele) ── */
  function indexar(ctx) {
    var n = 0, lista = [];
    Array.prototype.forEach.call(ctx.artigo.children, function (el) {
      if (/^(UL|OL)$/.test(el.tagName)) {
        Array.prototype.forEach.call(el.children, function (li) { li.setAttribute('data-p', ++n); lista.push(li); });
      } else if (!el.classList.contains('cx') && !el.classList.contains('md-notas')) {
        el.setAttribute('data-p', ++n); lista.push(el);
      }
    });
    ctx.blocos = lista;
  }
  function blocoDe(no) {
    var el = no && no.nodeType === 1 ? no : no && no.parentElement;
    return el && el.closest ? el.closest('[data-p]') : null;
  }

  /* ── 2. as imagens vão para a coluna da esquerda, cada uma presa ao seu parágrafo ── */
  function chaveSrc(s) { try { return decodeURIComponent(String(s || '')).replace(/^https?:\/\/[^/]+/, ''); } catch (e) { return String(s || ''); } }
  function imagens(ctx) {
    var d = ctx.d, lista = ctx.raiz.querySelector('.lt-imgs-lista');
    var porSrc = {};
    (d.imagens || []).forEach(function (im) { porSrc[chaveSrc(im.src)] = im; });
    var vistos = {};
    var add = function (src, alt, p, peso) {
      var k = chaveSrc(src);
      if (!src || vistos[k]) return null;
      vistos[k] = true;
      var info = porSrc[k] || {};
      var f = { k: ctx.figs.length + 1, src: src, legenda: info.legenda || alt || '', autor: info.autor || '', licenca: info.licenca || '', fonte: info.fonte || '', p: p, peso: peso };
      ctx.figs.push(f);
      return f;
    };
    /* a imagem de abertura (hero) é a grande, no topo */
    var hero = ctx.artigo.querySelector('figure.hero');
    if (hero) {
      var hi = hero.querySelector('img');
      if (hi) add(hi.getAttribute('src'), hi.getAttribute('alt'), 0, 'g');
      hero.remove();
    }
    /* as do texto: a imagem sai do texto e deixa no lugar uma âncora pequena */
    Array.prototype.slice.call(ctx.artigo.querySelectorAll('img')).forEach(function (img) {
      var b = blocoDe(img);
      var p = b ? +b.getAttribute('data-p') : 0;
      var f = add(img.getAttribute('src'), img.getAttribute('alt'), p, 'm');
      if (!f) { img.remove(); return; }
      var ancora = document.createElement('button');
      ancora.type = 'button';
      ancora.className = 'lt-ancora';
      ancora.setAttribute('data-fig', f.k);
      ancora.innerHTML = '<span class="lt-ancora-q" aria-hidden="true"></span><span>Imagem ' + f.k + '</span>' + (f.legenda ? '<em>' + esc(curta(f.legenda, 60)) + '</em>' : '');
      ancora.setAttribute('aria-label', 'Ver a imagem ' + f.k + (f.legenda ? ': ' + f.legenda : ''));
      var fig = img.closest('figure.fig');
      if (fig && fig.querySelectorAll('img').length === 1 && !fig.textContent.trim()) fig.replaceWith(ancora);
      else img.replaceWith(ancora);
    });
    /* as que só estão na galeria da ficha: pequenas, no fim */
    var ultimo = ctx.blocos.length;
    (d.imagens || []).forEach(function (im) { add(im.src, im.legenda, ultimo, 'p'); });
    ctx.raiz.querySelector('.lt-n-img').textContent = ctx.figs.length ? String(ctx.figs.length) : '';
    if (!ctx.figs.length) { ctx.raiz.classList.add('lt-sem-img'); lista.innerHTML = '<p class="lt-vazio">Este texto não tem imagens.</p>'; return; }
    lista.innerHTML = ctx.figs.map(function (f) { return htmlFig(ctx, f); }).join('');
  }
  function tamDe(ctx, f) { return (pref.figs && pref.figs[ctx.id + '#' + f.k]) || f.peso; }
  function htmlFig(ctx, f) {
    var cred = [f.autor, f.licenca].filter(Boolean).map(esc).join(' · ') + (f.fonte && /^https?:/.test(f.fonte) ? ' · <a href="' + esc(f.fonte) + '" target="_blank" rel="noopener noreferrer">origem</a>' : '');
    return '<figure class="lt-fig" data-k="' + f.k + '" data-p="' + f.p + '" data-t="' + tamDe(ctx, f) + '">' +
      '<button type="button" class="lt-fig-img" data-lt="ir-fig" aria-label="Ir ao trecho que cita a imagem ' + f.k + '"><img src="' + esc(f.src) + '" alt="' + esc(f.legenda) + '" loading="lazy" decoding="async"></button>' +
      '<figcaption><span class="lt-fig-n">' + f.k + '</span>' +
        (f.legenda ? '<span class="lt-fig-t">' + esc(f.legenda) + '</span>' : '') +
        (cred ? '<span class="lt-fig-c">' + cred + '</span>' : '') +
        '<span class="lt-fig-ic" aria-hidden="true" title="' + esc(f.legenda) + '">i</span>' +
      '</figcaption>' +
      '<div class="lt-fig-acoes"><button type="button" class="lt-mini" data-lt="tam-fig" title="Mudar o tamanho desta imagem">' + ({ p: 'P', m: 'M', g: 'G' }[tamDe(ctx, f)] || 'M') + '</button>' +
      '<button type="button" class="lt-mini" data-lt="ampliar" title="Ampliar">' + ic('tela-cheia') + '</button></div>' +
    '</figure>';
  }
  function htmlAjustesImg() {
    var grupo = function (rot, k, ops) {
      return '<div class="lt-aj"><span class="rot">' + rot + '</span><div class="lt-seg" role="group" aria-label="' + rot + '">' + ops.map(function (o) {
        return '<button type="button" data-pref="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (pref[k] === o[0]) + '">' + o[1] + '</button>';
      }).join('') + '</div></div>';
    };
    return grupo('Tamanho', 'tam', [['p', 'Pequenas'], ['m', 'Médias'], ['g', 'Grandes']]) +
      grupo('Legenda', 'leg', [['completa', 'Completa'], ['curta', 'Curta'], ['icone', 'Só ícone'], ['oculta', 'Oculta']]) +
      grupo('Título', 'tit', [['menor', 'Menor'], ['expandido', 'Expandido']]);
  }

  /* ── 3. as referências: de onde veio cada parágrafo, sem inventar ── */
  function referencias(ctx) {
    var art = ctx.artigo, refs = [], porUrl = {};
    var nova = function (r) {
      var k = r.url || r.texto;
      if (porUrl[k]) return porUrl[k];
      r.n = refs.length + 1; refs.push(r); porUrl[k] = r;
      return r;
    };
    /* (a) a fonte do texto inteiro: a linha "Da Wikipédia, sob CC BY-SA. Colhido em…" */
    var doc = null;
    Array.prototype.forEach.call(art.querySelectorAll('[data-p]'), function (b) {
      if (doc || b.tagName !== 'P') return;
      var t = b.textContent;
      if (/^\s*Da Wikip[ée]dia/i.test(t) && /Colhido/i.test(t)) {
        var a = b.querySelector('a.ext');
        var data = (t.match(/Colhido em (\d{4}-\d{2}-\d{2})/) || [])[1];
        doc = nova({ tipo: 'documento', texto: 'Wikipédia, “' + (ctx.d.titulo || '') + '”' + (data ? ', colhido em ' + data.split('-').reverse().join('/') : ''), url: a ? a.href : '', licenca: /CC BY-SA/i.test(t) ? 'CC BY-SA 4.0' : '' });
        b.classList.add('lt-fonte-doc');
      }
    });
    /* (b) a seção "Fontes" de um estudo: a bibliografia, geral */
    var biblio = null;
    var hFontes = Array.prototype.filter.call(art.querySelectorAll('h2, h3'), function (h) { return /\bFontes\b/i.test(h.textContent); })[0];
    if (hFontes) {
      var partes = [], el = hFontes.nextElementSibling;
      while (el && !/^H[23]$/.test(el.tagName)) { partes.push(el.textContent); el = el.nextElementSibling; }
      biblio = nova({ tipo: 'bibliografia', texto: 'Fontes deste estudo (bibliografia geral, não ligada a uma frase)', itens: partes.join(' · ').split(/\s·\s|\n/).map(function (s) { return s.trim(); }).filter(Boolean), alvo: hFontes.id });
    }
    /* (c) as notas de rodapé do caderno ([^1]) */
    var notas = {};
    Array.prototype.forEach.call(art.querySelectorAll('.md-notas li'), function (li) {
      var a = li.querySelector('a.ext');
      notas[li.getAttribute('data-nota')] = nova({ tipo: 'nota', texto: li.textContent.replace(/↩\s*$/, '').trim(), url: a ? a.href : '' });
    });
    /* patrocínio/financiamento, quando o caderno diz */
    var fatos = ctx.d.fatos || {};
    var patro = fatos['patrocínio'] || fatos.patrocinio || fatos.financiamento || '';
    if (patro && doc) doc.patrocinio = patro;

    /* a marca no fim de cada parágrafo */
    var secaoAtual = null, ultimoDaSecao = {};
    ctx.blocos.forEach(function (b) {
      if (/^H[23]$/.test(b.tagName)) { secaoAtual = b; return; }
      if (b.classList.contains('lt-fonte-doc') || b.closest('.md-notas')) return;
      if (!/^(P|LI|BLOCKQUOTE)$/.test(b.tagName)) return;
      var meus = [];
      Array.prototype.forEach.call(b.querySelectorAll('sup.md-nota a'), function (a) { var r = notas[a.getAttribute('data-nota')]; if (r) meus.push(r); });
      Array.prototype.forEach.call(b.querySelectorAll('a.ext'), function (a) {
        if (/creativecommons\.org/.test(a.href)) return;
        meus.push(nova({ tipo: 'link', texto: a.textContent.trim() + ' — ' + a.hostname.replace(/^www\./, ''), url: a.href }));
      });
      if (!meus.length && doc) meus.push(doc);
      if (!meus.length && biblio) { ultimoDaSecao[secaoAtual ? secaoAtual.id || 'x' : 'x'] = b; return; }
      var unicos = meus.filter(function (r, i) { return meus.indexOf(r) === i; });
      if (unicos.length) b.insertAdjacentHTML('beforeend', htmlMarcaRef(unicos));
    });
    /* sem fonte própria, num estudo com bibliografia: uma marca no fim de cada seção, que leva às Fontes */
    if (biblio) Object.keys(ultimoDaSecao).forEach(function (k) { ultimoDaSecao[k].insertAdjacentHTML('beforeend', htmlMarcaRef([biblio], true)); });
    ctx.refs = refs;
  }
  function htmlMarcaRef(rs, geral) {
    return '<span class="lt-ref' + (geral ? ' lt-ref-geral' : '') + '">' +
      '<sup class="lt-ref-n">' + rs.map(function (r) { return '<button type="button" data-ref="' + r.n + '" aria-label="Referência ' + r.n + ': ' + esc(r.texto) + '">' + (r.tipo === 'bibliografia' ? 'F' : r.n) + '</button>'; }).join('') + '</sup>' +
      '<span class="lt-ref-c">' + rs.map(function (r) { return '— ' + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.texto) + '</a>' : esc(r.texto)) + (r.licenca ? ' (' + esc(r.licenca) + ')' : '') + (r.patrocinio ? '; apoio: ' + esc(r.patrocinio) : ''); }).join(' ') + '</span>' +
    '</span>';
  }
  function htmlListaRefs(ctx) {
    if (!ctx.refs.length) return '<p class="lt-vazio">Este texto ainda não tem fontes marcadas. No caderno, uma nota de rodapé ([^1]) ou um link no parágrafo vira referência aqui.</p>';
    return '<ol class="lt-refs">' + ctx.refs.map(function (r) {
      return '<li id="lt-ref-' + r.n + '" data-n="' + r.n + '"><span class="lt-refs-n">' + (r.tipo === 'bibliografia' ? 'F' : r.n) + '</span><div>' +
        (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.texto) + '</a>' : '<span>' + esc(r.texto) + '</span>') +
        (r.licenca ? '<small> · ' + esc(r.licenca) + '</small>' : '') + (r.patrocinio ? '<small> · apoio: ' + esc(r.patrocinio) + '</small>' : '') +
        (r.itens ? '<ul class="lt-biblio">' + r.itens.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
        '<small class="lt-refs-tipo">' + ({ documento: 'fonte do texto inteiro', bibliografia: 'bibliografia geral', nota: 'nota do caderno', link: 'link no parágrafo' }[r.tipo] || '') + '</small></div></li>';
    }).join('') + '</ol>';
  }

  /* ── 4. a coluna da direita ── */
  function painel(ctx, lateral) {
    var nav = ctx.nav;
    var min = Math.max(1, Math.round(ctx.artigo.textContent.split(/\s+/).length / 200));
    nav.innerHTML =
      '<section class="lt-sec lt-leitura">' +
        '<header><p class="rot">A leitura</p><span class="lt-pct">0%</span></header>' +
        '<div class="lt-barra-l"><i></i></div>' +
        '<p class="lt-falta">~' + min + ' min · <span class="lt-falta-n">' + min + ' min</span> restantes</p>' +
        '<div class="lt-voltar" hidden></div>' +
        '<div class="lt-botoes">' +
          '<button type="button" class="lt-b2" data-lt="modo-parei" aria-pressed="false" title="Toque na palavra em que você parou (ou Alt + clique)">' + ic('leituras') + '<span>Parei aqui</span></button>' +
          '<button type="button" class="lt-b2" data-lt="nota-livre" title="Uma nota sobre este texto">' + ic('nota') + '<span>Nota</span></button>' +
        '</div>' +
        '<div class="lt-aj"><span class="rot">Referências</span><div class="lt-seg" role="group" aria-label="Referências">' +
          [['numero', 'Número'], ['completo', 'Completas'], ['oculto', 'Ocultas']].map(function (o) { return '<button type="button" data-pref="refs" data-v="' + o[0] + '" aria-pressed="' + (pref.refs === o[0]) + '">' + o[1] + '</button>'; }).join('') +
        '</div></div>' +
      '</section>' +
      '<section class="lt-sec lt-abertos"><header><p class="rot">Abertos</p><a href="leituras.html" class="lt-mais">Todas as leituras</a></header><div class="lt-abertos-lista"></div></section>' +
      '<div class="lt-lateral"></div>' +
      '<section class="lt-sec lt-marcas-sec"><header><p class="rot">As suas marcas</p><span class="lt-n-marcas"></span></header><div class="lt-marcas"></div></section>' +
      '<section class="lt-sec lt-refs-sec" id="lt-referencias"><header><p class="rot">Referências</p><span>' + ctx.refs.length + '</span></header>' + htmlListaRefs(ctx) + '</section>';
    if (lateral) {
      var lugar = nav.querySelector('.lt-lateral');
      /* o sumário sobe para perto da leitura; a galeria da ficha não repete as imagens da esquerda */
      var toc = lateral.querySelector('#toc-cx');
      if (toc) nav.insertBefore(toc, nav.querySelector('.lt-abertos'));
      Array.prototype.forEach.call(lateral.querySelectorAll('.gal'), function (g) { var c = g.closest('.cx'); if (c) c.classList.add('lt-esconde'); });
      lateral.classList.add('lt-lateral-in');
      lugar.appendChild(lateral);
    }
    pintarAbertos(ctx);
  }

  function pintarAbertos(ctx) {
    var alvo = ctx.nav.querySelector('.lt-abertos-lista');
    if (!alvo || !A()) return;
    var todos = A().lista().filter(function (x) { return x.aberto; });
    var acordados = todos.filter(function (x) { return !x.dormindo; }), dormindo = todos.filter(function (x) { return x.dormindo; });
    var linha = function (x) {
      var aqui = x.id === ctx.id;
      return '<li class="' + (aqui ? 'aqui' : '') + '"><a href="' + esc(x.href || '#') + '"' + (aqui ? ' aria-current="true"' : '') + '><b>' + esc(x.titulo || x.id) + '</b><span>' + (x.lidoPct ? x.lidoPct + '% lido' : 'começar') + (x.grupo ? ' · ' + esc(x.grupo) : '') + '</span></a>' +
        (aqui ? '' : '<button type="button" class="lt-mini" data-lt="ao-lado" data-id="' + esc(x.id) + '" title="Ler ao lado">' + ic('colunas') + '</button>') +
        '<button type="button" class="lt-mini" data-lt="' + (x.dormindo ? 'acordar' : 'dormir') + '" data-id="' + esc(x.id) + '" title="' + (x.dormindo ? 'Acordar' : 'Deixar dormindo (fica guardado, não pesa)') + '">' + ic(x.dormindo ? 'sol' : 'dormir') + '</button>' +
        '<button type="button" class="lt-mini" data-lt="fechar-ab" data-id="' + esc(x.id) + '" title="Fechar (vai para o histórico)">' + ic('fechar') + '</button></li>';
    };
    alvo.innerHTML = (acordados.length ? '<ul class="lt-ab">' + acordados.slice(0, 8).map(linha).join('') + '</ul>' : '<p class="lt-vazio">Só este texto aberto.</p>') +
      (dormindo.length ? '<details class="lt-dorm"><summary>Dormindo · ' + dormindo.length + '</summary><ul class="lt-ab">' + dormindo.map(linha).join('') + '</ul></details>' : '') +
      '<div class="lt-grupo"><label><span class="rot">Grupo deste texto</span><input type="text" list="lt-grupos" class="lt-grupo-in" placeholder="tema, livro, projeto…" value="' + esc((A().item(ctx.id) || {}).grupo || '') + '"></label>' +
      '<datalist id="lt-grupos">' + A().grupos().map(function (g) { return '<option value="' + esc(g) + '">'; }).join('') + '</datalist></div>';
  }

  /* ── 5. as marcas (destaques, notas, parei aqui) ── */
  function textoNodos(el) {
    var r = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentElement && n.parentElement.closest('.lt-ref, .lt-ancora, sup.md-nota') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var n; while ((n = w.nextNode())) r.push(n);
    return r;
  }
  function textoDo(b) { return textoNodos(b).map(function (n) { return n.nodeValue; }).join(''); }
  /* envolve [ini, fim) do texto do bloco num elemento (respeitando os negritos e os links de dentro) */
  function envolver(b, ini, fim, criar) {
    var pos = 0;
    textoNodos(b).forEach(function (n) {
      var a = pos, z = pos + n.nodeValue.length; pos = z;
      if (z <= ini || a >= fim) return;
      var s = Math.max(ini, a) - a, e = Math.min(fim, z) - a;
      var meio = n;
      if (s > 0) meio = n.splitText(s);
      if (e - s < meio.nodeValue.length) meio.splitText(e - s);
      var w = criar();
      meio.parentNode.insertBefore(w, meio);
      w.appendChild(meio);
    });
  }
  function pintarMarcas(ctx) {
    var x = A() && A().item(ctx.id);
    /* limpa as de antes */
    Array.prototype.forEach.call(ctx.artigo.querySelectorAll('mark.lt-m'), function (m) { var pai = m.parentNode; while (m.firstChild) pai.insertBefore(m.firstChild, m); pai.removeChild(m); pai.normalize(); });
    /* o "parei aqui" é desembrulhado como as marcas (antes, remove() levava a palavra junto) */
    Array.prototype.forEach.call(ctx.artigo.querySelectorAll('.lt-parei'), function (m) { var pai = m.parentNode; while (m.firstChild) pai.insertBefore(m.firstChild, m); pai.removeChild(m); pai.normalize(); });
    var marcas = (x && x.marcas) || [];
    marcas.forEach(function (m) {
      var b = ctx.artigo.querySelector('[data-p="' + m.p + '"]');
      /* se o texto mudou no caderno, procura o trecho de novo; se não achar, a marca fica só na lista */
      if (b && m.texto && textoDo(b).slice(m.ini, m.fim) !== m.texto) {
        var k2 = textoDo(b).indexOf(m.texto);
        if (k2 >= 0) m = Object.assign({}, m, { ini: k2, fim: k2 + m.texto.length });
        else {
          b = null;
          ctx.blocos.some(function (bb) { var k3 = textoDo(bb).indexOf(m.texto); if (k3 >= 0) { b = bb; m = Object.assign({}, m, { ini: k3, fim: k3 + m.texto.length }); return true; } return false; });
        }
      }
      if (!b) return;
      envolver(b, m.ini, m.fim, function () { var k = document.createElement('mark'); k.className = 'lt-m lt-m-' + (m.cor || 'sol') + (m.nota ? ' lt-m-nota' : ''); k.setAttribute('data-m', m.id); if (m.nota) k.title = m.nota; return k; });
    });
    if (x && x.parei) {
      var b = ctx.artigo.querySelector('[data-p="' + x.parei.p + '"]');
      if (b) envolver(b, x.parei.ini, x.parei.ini + Math.max(1, (x.parei.palavra || ' ').length), function () { var s = document.createElement('span'); s.className = 'lt-parei'; s.title = 'Você parou aqui'; return s; });
    }
    var lista = ctx.nav.querySelector('.lt-marcas');
    ctx.nav.querySelector('.lt-n-marcas').textContent = marcas.length ? String(marcas.length) : '';
    if (lista) lista.innerHTML = (x && x.parei ? '<button type="button" class="lt-marca-i lt-marca-parei" data-lt="ir-parei"><b>Parou em “' + esc(x.parei.palavra || '') + '”</b><span>' + quando(x.parei.em) + '</span></button>' : '') +
      (marcas.length ? marcas.slice().sort(function (a, b) { return a.p - b.p || a.ini - b.ini; }).map(function (m) {
        return '<div class="lt-marca-i"><button type="button" data-lt="ir-marca" data-m="' + esc(m.id) + '"><i class="lt-cor lt-m-' + (m.cor || 'sol') + '"></i><span class="lt-marca-t">' + esc(curta(m.texto, 140)) + '</span>' + (m.nota ? '<em>' + esc(m.nota) + '</em>' : '') + '</button>' +
          '<button type="button" class="lt-mini" data-lt="apagar-marca" data-m="' + esc(m.id) + '" title="Apagar esta marca">' + ic('lixeira') + '</button></div>';
      }).join('') : (x && x.parei ? '' : '<p class="lt-vazio">Selecione um trecho para destacar ou anotar. Dois cliques numa palavra (ou Alt + clique) marcam onde você parou.</p>'));
  }
  function quando(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
  function curta(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }

  /* a seleção vira marca: um bloco por vez (se pegar vários, vira uma marca por bloco) */
  function selecaoNoTexto(ctx) {
    var s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return null;
    var r = s.getRangeAt(0);
    if (!ctx.artigo.contains(r.commonAncestorContainer)) return null;
    var pedacos = [];
    ctx.blocos.forEach(function (b) {
      if (!r.intersectsNode(b)) return;
      var antes = document.createRange();
      antes.selectNodeContents(b);
      var ini = 0, fim;
      var cheio = textoDo(b);
      if (b.contains(r.startContainer)) { antes.setEnd(r.startContainer, r.startOffset); ini = textoAte(b, r.startContainer, r.startOffset); }
      fim = b.contains(r.endContainer) ? textoAte(b, r.endContainer, r.endOffset) : cheio.length;
      if (fim > ini) pedacos.push({ p: +b.getAttribute('data-p'), ini: ini, fim: fim, texto: cheio.slice(ini, fim) });
    });
    return pedacos.length ? { pedacos: pedacos, rect: r.getBoundingClientRect() } : null;
  }
  /* quantos caracteres do texto do bloco vêm antes do ponto (no, desvio) */
  function textoAte(b, no, desvio) {
    /* o ponto (no, desvio) pode ser um texto ou um elemento (desvio = índice do filho): compara pela ordem do documento */
    var ponto = document.createRange();
    try { ponto.setStart(no, desvio); } catch (e) { return 0; }
    ponto.collapse(true);
    var total = 0;
    textoNodos(b).some(function (n) {
      if (n === no) { total += desvio; return true; }
      if (ponto.comparePoint(n, n.nodeValue.length) <= 0) { total += n.nodeValue.length; return false; }
      return true;
    });
    return total;
  }
  /* a palavra num ponto da tela (para o "parei aqui") */
  function palavraEm(ctx, x, y) {
    var no, off;
    if (document.caretPositionFromPoint) { var cp = document.caretPositionFromPoint(x, y); if (!cp) return null; no = cp.offsetNode; off = cp.offset; }
    else if (document.caretRangeFromPoint) { var cr = document.caretRangeFromPoint(x, y); if (!cr) return null; no = cr.startContainer; off = cr.startOffset; }
    if (!no || no.nodeType !== 3) return null;
    if (no.parentElement && no.parentElement.closest('.lt-ref, .lt-ancora, sup.md-nota')) return null;
    var b = blocoDe(no); if (!b || !ctx.artigo.contains(b)) return null;
    var txt = no.nodeValue, a = off, z = off;
    while (a > 0 && /[\p{L}\p{N}'’-]/u.test(txt[a - 1])) a--;
    while (z < txt.length && /[\p{L}\p{N}'’-]/u.test(txt[z])) z++;
    if (z <= a) return null;
    var ini = textoAte(b, no, a);
    return { p: +b.getAttribute('data-p'), ini: ini, palavra: txt.slice(a, z) };
  }

  function popover(ctx, html, rect) {
    var pop = ctx.raiz.querySelector('.lt-pop');
    pop.innerHTML = html;
    pop.hidden = false;
    var w = Math.min(320, innerWidth - 16);
    var x = Math.max(8, Math.min(innerWidth - w - 8, rect.left + rect.width / 2 - w / 2));
    var y = rect.top - 8;
    pop.style.width = w + 'px';
    pop.style.left = x + 'px';
    if (y < 140) { pop.style.top = (rect.bottom + 8) + 'px'; pop.classList.add('embaixo'); } else { pop.style.top = y + 'px'; pop.classList.remove('embaixo'); }
    var f = pop.querySelector('textarea, button');
    if (f && f.tagName === 'TEXTAREA') f.focus();
  }
  function fecharPop(ctx) { var pop = ctx.raiz.querySelector('.lt-pop'); if (pop) { pop.hidden = true; pop.innerHTML = ''; } }

  /* ── 6. os gestos ── */
  function ligar(ctx) {
    var raiz = ctx.raiz, art = ctx.artigo;
    var selPendente = null, modoParei = false;

    raiz.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-lt], [data-pref], [data-img], [data-pane], [data-ref], [data-fig]');
      if (!b || !raiz.contains(b)) return;
      if (b.hasAttribute('data-pref')) { mudarPref(ctx, b.getAttribute('data-pref'), b.getAttribute('data-v')); return; }
      if (b.hasAttribute('data-img') && b.closest('.lt-seg')) { mudarPref(ctx, 'img', b.getAttribute('data-img')); return; }
      if (b.hasAttribute('data-pane') && b.closest('.lt-abas')) { irPane(ctx, b.getAttribute('data-pane')); return; }
      if (b.hasAttribute('data-ref') && b.closest('.lt-ref-n')) { ev.preventDefault(); mostrarRef(ctx, +b.getAttribute('data-ref'), b); return; }
      if (b.hasAttribute('data-fig') && b.classList.contains('lt-ancora')) { irFig(ctx, +b.getAttribute('data-fig'), true); return; }
      var o = b.getAttribute('data-lt'), fig = b.closest('.lt-fig'), id = b.getAttribute('data-id');
      if (o === 'ir-fig' && fig) irBloco(ctx, +fig.getAttribute('data-p'), fig);
      else if (o === 'tam-fig' && fig) mudarTamFig(ctx, fig);
      else if (o === 'ampliar' && fig) { var f = ctx.figs[+fig.getAttribute('data-k') - 1]; if (ctx.o.ampliar) ctx.o.ampliar(f.src); }
      else if (o === 'ajustes-img') { var aj = raiz.querySelector('.lt-ajustes'); aj.hidden = !aj.hidden; b.setAttribute('aria-expanded', String(!aj.hidden)); }
      else if (o === 'geral') alternarGeral(ctx);
      else if (o === 'pagina') { pref.modo = pref.modo === 'pagina' ? 'colunas' : 'pagina'; pref[CHAVE_MODO] = pref.modo; gravarPref(); raiz.setAttribute('data-modo', pref.modo); b.setAttribute('aria-pressed', String(pref.modo === 'pagina')); ligarPagina(ctx, pref.modo === 'pagina'); }
      else if (o === 'pg-ant') virar(ctx, -1);
      else if (o === 'pg-prox') virar(ctx, 1);
      else if (o === 'modo-parei') { modoParei = !modoParei; b.setAttribute('aria-pressed', String(modoParei)); raiz.classList.toggle('lt-marcando', modoParei); }
      else if (o === 'nota-livre') notaLivre(ctx, b);
      else if (o === 'ir-parei') { var p1 = raiz.querySelector('.lt-parei'); if (p1) rolarAte(p1, true); }
      else if (o === 'ir-marca') { var mk = art.querySelector('mark[data-m="' + b.getAttribute('data-m') + '"]'); if (mk) rolarAte(mk, true); }
      else if (o === 'apagar-marca') { A().desmarcar(ctx.id, b.getAttribute('data-m')); pintarMarcas(ctx); }
      else if (o === 'dormir' && id) { A().dormir(id, true); }
      else if (o === 'acordar' && id) { A().dormir(id, false); }
      else if (o === 'fechar-ab' && id) { A().fechar(id); }
      else if (o === 'ao-lado' && id) aoLado(ctx, id);
      else if (o === 'fechar-lado') fecharLado(ctx);
      else if (o === 'continuar') { var pos = ctx.retomarPos || (A().item(ctx.id) || {}).pos; ctx.mexeu = true; if (pos) irBloco(ctx, pos.p, null, pos.frac); raiz.querySelector('.lt-voltar').hidden = true; }
    });

    /* selecionar texto: o balão para destacar, anotar, parei aqui, copiar com a fonte */
    var aoSoltar = function () {
      setTimeout(function () {
        var s = selecaoNoTexto(ctx);
        if (!s) return;
        selPendente = s;
        popover(ctx, '<div class="lt-pop-cores" role="group" aria-label="Destacar">' +
          ['sol', 'jade', 'ceu', 'rosa'].map(function (c) { return '<button type="button" class="lt-cor-b lt-m-' + c + '" data-cor="' + c + '" aria-label="Destacar (' + c + ')"></button>'; }).join('') +
          '</div><button type="button" class="lt-pop-b" data-pop="nota">' + ic('nota') + 'Nota</button>' +
          '<button type="button" class="lt-pop-b" data-pop="parei">' + ic('leituras') + 'Parei aqui</button>' +
          '<button type="button" class="lt-pop-b" data-pop="copiar">' + ic('copiar') + 'Copiar com a fonte</button>', s.rect);
      }, 10);
    };
    art.addEventListener('mouseup', aoSoltar);
    art.addEventListener('keyup', function (ev) { if (ev.shiftKey) aoSoltar(); });
    art.addEventListener('touchend', function () { setTimeout(aoSoltar, 250); }, { passive: true });

    var pop = raiz.querySelector('.lt-pop');
    pop.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    pop.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-cor], [data-pop], [data-pop-ok], [data-mk]');
      if (!b) return;
      if (b.hasAttribute('data-cor') && selPendente) {
        selPendente.pedacos.forEach(function (pd) { A().marcar(ctx.id, { p: pd.p, ini: pd.ini, fim: pd.fim, texto: pd.texto, cor: b.getAttribute('data-cor') }); });
        window.getSelection().removeAllRanges(); fecharPop(ctx); pintarMarcas(ctx); onda(b);
      } else if (b.getAttribute('data-pop') === 'nota' && selPendente) {
        var r = pop.getBoundingClientRect();
        popover(ctx, '<label class="lt-pop-nota"><span class="rot">Nota sobre o trecho</span><textarea rows="3" placeholder="O que você pensou aqui?"></textarea></label><button type="button" class="lt-pop-b lt-pop-ok" data-pop-ok="1">Guardar</button>', { left: r.left, width: r.width, top: r.top + 40, bottom: r.bottom });
      } else if (b.hasAttribute('data-pop-ok') && selPendente) {
        var nota = pop.querySelector('textarea').value.trim();
        selPendente.pedacos.forEach(function (pd, i) { A().marcar(ctx.id, { p: pd.p, ini: pd.ini, fim: pd.fim, texto: pd.texto, cor: 'jade', nota: i === 0 ? nota : '' }); });
        window.getSelection().removeAllRanges(); fecharPop(ctx); pintarMarcas(ctx);
      } else if (b.getAttribute('data-pop') === 'parei' && selPendente) {
        var pd0 = selPendente.pedacos[0];
        A().parei(ctx.id, { p: pd0.p, ini: pd0.ini, palavra: pd0.texto.split(/\s+/)[0] });
        window.getSelection().removeAllRanges(); fecharPop(ctx); pintarMarcas(ctx);
      } else if (b.getAttribute('data-pop') === 'copiar' && selPendente) {
        var refs = ctx.refs.filter(function (r) { return r.tipo !== 'link'; }).map(function (r) { return r.texto + (r.url ? ' <' + r.url + '>' : ''); });
        var txt = '“' + selPendente.pedacos.map(function (p) { return p.texto; }).join(' ') + '” — ' + (ctx.d.titulo || document.title) + (refs.length ? '. Fonte: ' + refs[0] : '') + '. ' + location.href;
        if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {});
        b.textContent = 'Copiado';
        setTimeout(function () { fecharPop(ctx); }, 700);
      } else if (b.hasAttribute('data-mk')) {
        var acao = b.getAttribute('data-mk'), mid = b.getAttribute('data-id');
        if (acao === 'apagar') { A().desmarcar(ctx.id, mid); pintarMarcas(ctx); fecharPop(ctx); }
        if (acao === 'nota') {
          var x = A().item(ctx.id), m = (x.marcas || []).filter(function (y) { return y.id === mid; })[0];
          var rr = pop.getBoundingClientRect();
          popover(ctx, '<label class="lt-pop-nota"><span class="rot">Nota</span><textarea rows="3">' + esc(m ? m.nota || '' : '') + '</textarea></label><button type="button" class="lt-pop-b lt-pop-ok" data-mk="guardar" data-id="' + esc(mid) + '">Guardar</button>', { left: rr.left, width: rr.width, top: rr.top + 40, bottom: rr.bottom });
        }
        if (acao === 'guardar') { var x2 = A().item(ctx.id), m2 = (x2.marcas || []).filter(function (y) { return y.id === mid; })[0]; if (m2) { m2.nota = pop.querySelector('textarea').value.trim(); A().marcar(ctx.id, m2); } pintarMarcas(ctx); fecharPop(ctx); }
      }
    });

    /* as notas de rodapé andam dentro da página (o # do endereço é da Biblioteca) */
    art.addEventListener('click', function (ev) {
      var na = ev.target.closest('a[href^="#nota-"], a[href^="#ref-"]');
      if (!na) return;
      ev.preventDefault();
      var alvoN = document.getElementById(na.getAttribute('href').slice(1));
      if (alvoN) rolarAte(alvoN, true);
    });
    /* as notas de rodapé andam dentro da página (o # do endereço é da Biblioteca) */
    art.addEventListener('click', function (ev) {
      var na = ev.target.closest('a[href^="#nota-"], a[href^="#ref-"]');
      if (!na) return;
      ev.preventDefault();
      var alvoN = document.getElementById(na.getAttribute('href').slice(1));
      if (alvoN) rolarAte(alvoN, true);
    });
    /* tocar numa marca: a nota e apagar */
    art.addEventListener('click', function (ev) {
      if (modoParei || ev.altKey) {
        var w = palavraEm(ctx, ev.clientX, ev.clientY);
        if (w) { ev.preventDefault(); A().parei(ctx.id, w); pintarMarcas(ctx); modoParei = false; raiz.classList.remove('lt-marcando'); var bp = raiz.querySelector('[data-lt="modo-parei"]'); if (bp) bp.setAttribute('aria-pressed', 'false'); onda(raiz.querySelector('.lt-parei')); }
        return;
      }
      var mk = ev.target.closest('mark.lt-m');
      if (mk && window.getSelection().isCollapsed) {
        popover(ctx, (mk.title ? '<p class="lt-pop-txt">' + esc(mk.title) + '</p>' : '') + '<button type="button" class="lt-pop-b" data-mk="nota" data-id="' + esc(mk.getAttribute('data-m')) + '">' + ic('nota') + (mk.title ? 'Mudar a nota' : 'Escrever uma nota') + '</button><button type="button" class="lt-pop-b" data-mk="apagar" data-id="' + esc(mk.getAttribute('data-m')) + '">' + ic('lixeira') + 'Apagar o destaque</button>', mk.getBoundingClientRect());
      }
      /* os links de fora que você abre também vão para as Leituras */
      var a = ev.target.closest('a.ext, .lt-ref-c a');
      if (a && A()) A().link(a.href, a.textContent.trim(), ctx.d.titulo || '');
    });
    art.addEventListener('dblclick', function (ev) {
      var w = palavraEm(ctx, ev.clientX, ev.clientY);
      if (!w) return;
      setTimeout(function () {
        var s = window.getSelection();
        if (s && !s.isCollapsed) return; /* o balão da seleção cuida */
        A().parei(ctx.id, w); pintarMarcas(ctx);
      }, 30);
    });
    document.addEventListener('mousedown', fora, true);
    function fora(ev) { if (!ev.target.closest('.lt-pop') && !ev.target.closest('mark.lt-m')) fecharPop(ctx); }
    ctx.limpar.push(function () { document.removeEventListener('mousedown', fora, true); });
    document.addEventListener('keydown', teclas);
    function teclas(ev) {
      if (ev.key === 'Escape') { fecharPop(ctx); if (raiz.classList.contains('lt-geral')) alternarGeral(ctx); }
      var alvo = ev.target || {};
      var lb = document.querySelector('.lb');
      if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.defaultPrevented) return;
      if (/INPUT|TEXTAREA|SELECT/.test(alvo.tagName || '') || alvo.isContentEditable || (alvo.closest && alvo.closest('[role=tablist], .lt-pop')) || (lb && !lb.hidden && lb.offsetParent !== null)) return;
      if (pref.modo === 'pagina') {
        if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { ev.preventDefault(); virar(ctx, 1); }
        if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); virar(ctx, -1); }
      }
    }
    ctx.limpar.push(function () { document.removeEventListener('keydown', teclas); });

    /* o grupo do texto */
    ctx.nav.addEventListener('change', function (ev) { if (ev.target.classList.contains('lt-grupo-in')) A().grupo(ctx.id, ev.target.value.trim()); });
    var mudou = function () { pintarAbertos(ctx); };
    window.addEventListener('abertos:mudou', mudou);
    ctx.limpar.push(function () { window.removeEventListener('abertos:mudou', mudou); });

    /* as imagens seguem o texto; a posição é guardada */
    seguir(ctx);
    var t = 0;
    /* o que conta como "mexer": roda, toque, teclas de rolar e a virada de página */
    var mexer = function (ev) { if (ev.type !== 'keydown' || /^(Arrow|Page|Home|End| )/.test(ev.key || '')) ctx.mexeu = true; };
    ['wheel', 'touchmove', 'keydown'].forEach(function (tp) { addEventListener(tp, mexer, { passive: true }); });
    ctx.limpar.push(function () { ['wheel', 'touchmove', 'keydown'].forEach(function (tp) { removeEventListener(tp, mexer); }); });
    var colTexto = ctx.raiz.querySelector('.lt-texto');
    if (colTexto) colTexto.addEventListener('scroll', function () { if (pref.modo === 'pagina') ctx.mexeu = true; }, { passive: true });
    var aoRolar = function () {
      if (t) return;
      t = requestAnimationFrame(function () { t = 0; progresso(ctx); });
    };
    addEventListener('scroll', aoRolar, { passive: true });
    ctx.limpar.push(function () { removeEventListener('scroll', aoRolar); });
    progresso(ctx);

    /* no celular: os painéis lado a lado acendem a aba certa */
    var panes = raiz.querySelector('.lt-panes');
    if ('IntersectionObserver' in window) {
      var obsP = new IntersectionObserver(function (es) {
        if (!CEL() || raiz.classList.contains('lt-geral')) return;
        es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio > 0.6) marcarAba(ctx, e.target.getAttribute('data-pane')); });
      }, { root: panes, threshold: [0.6] });
      Array.prototype.forEach.call(raiz.querySelectorAll('.lt-col'), function (c) { obsP.observe(c); });
      ctx.obs.push(obsP);
    }
    raiz.querySelector('.lt-panes').addEventListener('click', function (ev) {
      if (!raiz.classList.contains('lt-geral')) return;
      var col = ev.target.closest('.lt-col');
      if (col) { ev.preventDefault(); ev.stopPropagation(); alternarGeral(ctx); irPane(ctx, col.getAttribute('data-pane')); }
    }, true);
  }

  function onda(el) {
    if (!el || REDUZIR) return;
    el.classList.remove('lt-onda'); void el.offsetWidth; el.classList.add('lt-onda');
  }

  function mudarPref(ctx, k, v) {
    pref[k] = v; gravarPref();
    var attr = { refs: 'data-refs', img: 'data-img', tam: 'data-tam', leg: 'data-leg', tit: 'data-tit' }[k];
    if (attr) ctx.raiz.setAttribute(attr, v);
    Array.prototype.forEach.call(ctx.raiz.querySelectorAll('[data-pref="' + k + '"]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
    if (k === 'img') Array.prototype.forEach.call(ctx.raiz.querySelectorAll('.lt-seg [data-img]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-img') === v)); });
    if (k === 'tam') { pref.figs = {}; gravarPref(); Array.prototype.forEach.call(ctx.raiz.querySelectorAll('.lt-fig'), function (f) { var fi = ctx.figs[+f.getAttribute('data-k') - 1]; f.setAttribute('data-t', v === 'm' ? fi.peso : v); var mb = f.querySelector('[data-lt="tam-fig"]'); if (mb) mb.textContent = (v === 'm' ? fi.peso : v).toUpperCase(); }); }
  }
  function mudarTamFig(ctx, fig) {
    var ordem = ['p', 'm', 'g'], t = fig.getAttribute('data-t'), novo = ordem[(ordem.indexOf(t) + 1) % 3];
    fig.setAttribute('data-t', novo);
    fig.querySelector('[data-lt="tam-fig"]').textContent = novo.toUpperCase();
    pref.figs = pref.figs || {}; pref.figs[ctx.id + '#' + fig.getAttribute('data-k')] = novo; gravarPref();
  }

  /* ── 7. seguir o texto ── */
  function seguir(ctx) {
    if (!('IntersectionObserver' in window) || !ctx.figs.length) return;
    var col = ctx.raiz.querySelector('.lt-imgs'), pausaAte = 0, ativa = 0;
    col.addEventListener('wheel', function () { pausaAte = Date.now() + 3500; }, { passive: true });
    col.addEventListener('touchstart', function () { pausaAte = Date.now() + 3500; }, { passive: true });
    var obs = new IntersectionObserver(function (es) {
      var vis = es.filter(function (e) { return e.isIntersecting; });
      if (!vis.length) return;
      var p = +vis[vis.length - 1].target.getAttribute('data-p');
      ctx.pAtual = p;
      /* a imagem do trecho: a última citada até aqui (ou a primeira, se nenhuma ainda) */
      var alvo = null;
      ctx.figs.forEach(function (f) { if (f.p <= p && f.p > 0 && (!alvo || f.p >= alvo.p)) alvo = f; });
      if (!alvo) alvo = ctx.figs[0];
      if (alvo.k === ativa) return;
      ativa = alvo.k;
      Array.prototype.forEach.call(col.querySelectorAll('.lt-fig'), function (f) { f.classList.toggle('lt-fig-ativa', +f.getAttribute('data-k') === alvo.k); });
      Array.prototype.forEach.call(ctx.artigo.querySelectorAll('.lt-ancora'), function (b) { b.classList.toggle('ativa', +b.getAttribute('data-fig') === alvo.k); });
      if (pref.img !== 'seguir' || Date.now() < pausaAte || pref.modo === 'pagina') return;
      var el = col.querySelector('.lt-fig[data-k="' + alvo.k + '"]');
      if (el && !CEL()) col.scrollTo({ top: Math.max(0, el.offsetTop - col.clientHeight * 0.18), behavior: REDUZIR ? 'auto' : 'smooth' });
    }, { rootMargin: '-30% 0px -60% 0px' });
    ctx.blocos.forEach(function (b) { obs.observe(b); });
    ctx.obs.push(obs);
  }
  function irFig(ctx, k, rolarColuna) {
    var col = ctx.raiz.querySelector('.lt-imgs'), el = col.querySelector('.lt-fig[data-k="' + k + '"]');
    if (!el) return;
    if (CEL()) { irPane(ctx, 'imagens'); setTimeout(function () { el.scrollIntoView({ block: 'center', behavior: REDUZIR ? 'auto' : 'smooth' }); }, 60); }
    else if (rolarColuna) col.scrollTo({ top: Math.max(0, el.offsetTop - 24), behavior: REDUZIR ? 'auto' : 'smooth' });
    onda(el);
  }
  function irBloco(ctx, p, deFig, frac) {
    var b = ctx.artigo.querySelector('[data-p="' + p + '"]') || ctx.blocos[ctx.blocos.length - 1];
    if (!b) return;
    if (CEL()) irPane(ctx, 'texto');
    if (pref.modo === 'pagina') { irPaginaDoBloco(ctx, b); onda(b); return; }
    var y = b.getBoundingClientRect().top + scrollY - 110 + (frac ? b.offsetHeight * frac : 0);
    if (window.Movimento && window.Movimento.rolarPara && !frac) window.Movimento.rolarPara(b); else window.scrollTo({ top: y, behavior: REDUZIR ? 'auto' : 'smooth' });
    onda(b);
  }
  function rolarAte(el, piscar) {
    var y = el.getBoundingClientRect().top + scrollY - innerHeight * 0.35;
    window.scrollTo({ top: y, behavior: REDUZIR ? 'auto' : 'smooth' });
    if (piscar) onda(el);
  }

  /* ── 8. a referência aberta num balão ── */
  function mostrarRef(ctx, n, b) {
    var r = ctx.refs[n - 1];
    if (!r) return;
    var item = ctx.nav.querySelector('#lt-ref-' + n);
    if (item) { item.classList.add('lt-ref-acesa'); setTimeout(function () { item.classList.remove('lt-ref-acesa'); }, 1600); }
    popover(ctx, '<p class="rot">' + (r.tipo === 'bibliografia' ? 'Fontes do estudo' : 'Referência ' + n) + '</p><p class="lt-pop-txt">' + (r.url ? '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.texto) + '</a>' : esc(r.texto)) + (r.licenca ? ' · ' + esc(r.licenca) : '') + '</p>' +
      (r.itens ? '<ul class="lt-biblio">' + r.itens.slice(0, 8).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + (r.itens.length > 8 ? '<li>…</li>' : '') + '</ul>' : '') +
      '<button type="button" class="lt-pop-b" data-pop-fechar onclick="this.closest(\'.lt-pop\').hidden=true">Fechar</button>', b.getBoundingClientRect());
  }

  /* ── 9. o progresso e a posição ── */
  function progresso(ctx) {
    var art = ctx.artigo, r = art.getBoundingClientRect();
    var total = Math.max(1, art.offsetHeight - innerHeight * 0.6);
    var pct = pref.modo === 'pagina' ? ctx.pctPagina || 0 : Math.max(0, Math.min(100, (-r.top + innerHeight * 0.2) / total * 100));
    ctx.raiz.querySelector('.lt-prog i').style.transform = 'scaleX(' + (pct / 100).toFixed(4) + ')';
    var pe = ctx.nav.querySelector('.lt-pct'); if (pe) pe.textContent = Math.round(pct) + '%';
    var bl = ctx.nav.querySelector('.lt-barra-l i'); if (bl) bl.style.transform = 'scaleX(' + (pct / 100).toFixed(4) + ')';
    var min = Math.max(1, Math.round(art.textContent.split(/\s+/).length / 200));
    var fn = ctx.nav.querySelector('.lt-falta-n'); if (fn) fn.textContent = Math.max(0, Math.round(min * (1 - pct / 100))) + ' min';
    /* a posição exata: o bloco do alto da tela e quanto dele já passou */
    clearTimeout(ctx.tPos);
    ctx.tPos = setTimeout(function () {
      /* abrir e sair sem ler não apaga onde você estava: só grava depois de rolar, virar a página ou pular */
      if (!ctx.mexeu || !A()) return;
      var topo, frac = 0;
      if (pref.modo === 'pagina') {
        var colT = ctx.raiz.querySelector('.lt-texto'), cr = colT ? colT.getBoundingClientRect() : null;
        topo = cr ? ctx.blocos.filter(function (b) { var rr = b.getBoundingClientRect(); return rr.right > cr.left + 4 && rr.left < cr.right - 4; })[0] : null;
      } else {
        topo = ctx.blocos.filter(function (b) { var rr = b.getBoundingClientRect(); return rr.bottom > 90; })[0];
        if (topo) { var rr = topo.getBoundingClientRect(); frac = Math.max(0, Math.min(1, (90 - rr.top) / Math.max(1, rr.height))); }
      }
      if (!topo) return;
      A().posicao(ctx.id, { p: +topo.getAttribute('data-p'), frac: frac }, pct);
    }, 400);
  }
  function retomar(ctx) {
    var x = A() && A().item(ctx.id);
    if (!x || !x.pos || x.pos.p < 3) return;
    ctx.retomarPos = x.pos;
    var v = ctx.nav.querySelector('.lt-voltar');
    var onde = x.parei && x.parei.palavra ? 'em “' + esc(x.parei.palavra) + '”' : 'no parágrafo ' + x.pos.p;
    v.innerHTML = '<p>Você parou ' + onde + '.</p><button type="button" class="botao" data-lt="continuar">' + ic('seguir') + 'Continuar de onde parei</button>';
    v.hidden = false;
  }

  /* ── 10. o celular: painéis, visão geral ── */
  function irPane(ctx, nome) {
    var col = ctx.raiz.querySelector('.lt-col[data-pane="' + nome + '"]');
    if (!col) return;
    ctx.raiz.setAttribute('data-cel', nome);
    marcarAba(ctx, nome);
    if (CEL()) ctx.raiz.querySelector('.lt-panes').scrollTo({ left: col.offsetLeft, behavior: REDUZIR ? 'auto' : 'smooth' });
    else col.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function marcarAba(ctx, nome) {
    ctx.raiz.setAttribute('data-cel', nome);
    Array.prototype.forEach.call(ctx.raiz.querySelectorAll('.lt-abas [data-pane]'), function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-pane') === nome)); });
  }
  function alternarGeral(ctx) {
    var on = !ctx.raiz.classList.contains('lt-geral');
    ctx.raiz.classList.toggle('lt-geral', on);
    var b = ctx.raiz.querySelector('[data-lt="geral"]'); if (b) b.setAttribute('aria-pressed', String(on));
    if (on) { ctx.raiz.querySelector('.lt-panes').scrollTo({ left: 0 }); window.scrollTo({ top: ctx.raiz.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }); }
  }

  /* ── 11. o modo Página: o texto vira páginas contadas ── */
  function ligarPagina(ctx, on) {
    var raiz = ctx.raiz, col = raiz.querySelector('.lt-texto'), info = raiz.querySelector('.lt-pg');
    info.hidden = !on;
    document.documentElement.classList.toggle('lt-paginando', on);
    if (!on) { col.scrollLeft = 0; if (ctx.pgObs) { ctx.pgObs(); ctx.pgObs = null; } progresso(ctx); return; }
    col.scrollLeft = 0;
    var atualizar = function () {
      var largura = col.clientWidth + parseFloat(getComputedStyle(col).columnGap || 0);
      var total = Math.max(1, Math.round(col.scrollWidth / largura));
      var n = Math.min(total, Math.round(col.scrollLeft / largura) + 1);
      raiz.querySelector('.lt-pg-n').textContent = 'Página ' + n + ' de ' + total;
      raiz.querySelector('.lt-pg-barra i').style.transform = 'scaleX(' + (n / total).toFixed(3) + ')';
      ctx.pctPagina = n / total * 100;
      progresso(ctx);
      /* as imagens da página, em cima */
      var esq = col.getBoundingClientRect().left, dir = esq + col.clientWidth;
      var naPagina = ctx.blocos.filter(function (b) { var r = b.getBoundingClientRect(); return r.left >= esq - 4 && r.left < dir; }).map(function (b) { return +b.getAttribute('data-p'); });
      if (naPagina.length) {
        var lo = Math.min.apply(null, naPagina), hi = Math.max.apply(null, naPagina);
        var fig = ctx.figs.filter(function (f) { return f.p >= lo && f.p <= hi; })[0] || ctx.figs.filter(function (f) { return f.p <= lo; }).slice(-1)[0];
        var faixa = raiz.querySelector('.lt-pg-img');
        if (!faixa) { faixa = document.createElement('figure'); faixa.className = 'lt-pg-img'; raiz.insertBefore(faixa, raiz.querySelector('.lt-panes')); }
        faixa.innerHTML = fig ? '<img src="' + esc(fig.src) + '" alt="' + esc(fig.legenda) + '"><figcaption>' + esc(curta(fig.legenda, 90)) + '</figcaption>' : '';
        faixa.hidden = !fig;
      }
    };
    var aoRolar = function () { cancelAnimationFrame(ctx.pgRaf); ctx.pgRaf = requestAnimationFrame(atualizar); };
    col.addEventListener('scroll', aoRolar, { passive: true });
    addEventListener('resize', aoRolar);
    ctx.pgObs = function () { col.removeEventListener('scroll', aoRolar); removeEventListener('resize', aoRolar); var f = raiz.querySelector('.lt-pg-img'); if (f) f.remove(); };
    setTimeout(atualizar, 60);
    window.scrollTo({ top: raiz.getBoundingClientRect().top + scrollY - 64, behavior: 'smooth' });
  }
  function virar(ctx, d) {
    var col = ctx.raiz.querySelector('.lt-texto');
    var largura = col.clientWidth + parseFloat(getComputedStyle(col).columnGap || 0);
    col.scrollBy({ left: d * largura, behavior: REDUZIR ? 'auto' : 'smooth' });
  }
  function irPaginaDoBloco(ctx, b) {
    var col = ctx.raiz.querySelector('.lt-texto');
    var largura = col.clientWidth + parseFloat(getComputedStyle(col).columnGap || 0);
    var x = b.getBoundingClientRect().left - col.getBoundingClientRect().left + col.scrollLeft;
    col.scrollTo({ left: Math.floor(x / largura) * largura, behavior: REDUZIR ? 'auto' : 'smooth' });
  }

  /* ── 12. ler ao lado: um segundo texto aberto na mesma tela ── */
  function aoLado(ctx, id) {
    var x = A().item(id);
    if (!x) return;
    fecharLado(ctx);
    var lado = document.createElement('section');
    lado.className = 'lt-col lt-lado';
    lado.setAttribute('data-pane', 'lado');
    lado.setAttribute('aria-label', 'Ao lado: ' + (x.titulo || id));
    lado.innerHTML = '<header class="lt-lado-cab"><div><p class="rot">Ao lado</p><h2>' + esc(x.titulo || id) + '</h2></div>' +
      '<a class="lt-mini" href="' + esc(x.href || '#') + '" title="Abrir este no lugar">' + ic('seguir') + '</a>' +
      '<button type="button" class="lt-mini" data-lt="fechar-lado" title="Fechar o lado">' + ic('fechar') + '</button></header><div class="lt-lado-corpo md"><p class="rot suave">Abrindo…</p></div>';
    var panes = ctx.raiz.querySelector('.lt-panes');
    panes.insertBefore(lado, ctx.raiz.querySelector('.lt-nav'));
    ctx.raiz.classList.add('lt-com-lado');
    var corpo = lado.querySelector('.lt-lado-corpo');
    corpo.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[href^="#nota-"], a[href^="#ref-"]');
      if (!a) return;
      ev.preventDefault();
      var alvoL = corpo.querySelector('[data-lado-id="' + a.getAttribute('href').slice(1) + '"]');
      if (alvoL) alvoL.scrollIntoView({ block: 'center', behavior: REDUZIR ? 'auto' : 'smooth' });
    });
    var m = /#f=(.+)$/.exec(x.href || '');
    var fid = m ? decodeURIComponent(m[1]) : null;
    if (fid && window.MD) {
      fetch('/api/ficha?id=' + encodeURIComponent(fid)).then(function (r) { if (!r.ok) throw new Error('nf'); return r.json(); }).then(function (f) {
        corpo.innerHTML = window.MD.render(f.corpo.replace(/^\s*#\s+.*\n?/, ''));
        /* os ids das notas do painel não podem repetir os do texto principal */
        Array.prototype.forEach.call(corpo.querySelectorAll('[id^="nota-"], [id^="ref-"]'), function (el) { el.setAttribute('data-lado-id', el.id); el.removeAttribute('id'); });
        Array.prototype.forEach.call(corpo.querySelectorAll('img'), function (im) { im.loading = 'lazy'; });
      }).catch(function () { corpo.innerHTML = '<p class="lt-vazio">Não consegui abrir este texto aqui. <a href="' + esc(x.href) + '">Abrir na página dele</a>.</p>'; });
    } else corpo.innerHTML = '<p class="lt-vazio">Este texto abre na página dele: <a href="' + esc(x.href || '#') + '">abrir</a>.</p>';
    if (CEL()) irPane(ctx, 'lado'); else lado.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  function fecharLado(ctx) {
    var l = ctx.raiz.querySelector('.lt-lado');
    if (l) l.remove();
    ctx.raiz.classList.remove('lt-com-lado');
  }

  /* uma nota sobre o texto inteiro (não sobre um trecho): vira uma marca no primeiro parágrafo */
  function notaLivre(ctx, b) {
    var r = b.getBoundingClientRect();
    popover(ctx, '<label class="lt-pop-nota"><span class="rot">Nota sobre este texto</span><textarea rows="4" placeholder="O que fica deste texto para você?"></textarea></label><button type="button" class="lt-pop-b lt-pop-ok" data-livre="1">Guardar</button>', r);
    var pop = ctx.raiz.querySelector('.lt-pop');
    pop.querySelector('[data-livre]').addEventListener('click', function () {
      var t = pop.querySelector('textarea').value.trim();
      if (t) { var b0 = ctx.blocos.filter(function (x) { return x.tagName === 'P'; })[0] || ctx.blocos[0]; var txt = textoDo(b0); A().marcar(ctx.id, { p: +b0.getAttribute('data-p'), ini: 0, fim: Math.min(txt.length, 60), texto: '(nota sobre o texto) ' + curta(txt, 60), cor: 'jade', nota: t }); pintarMarcas(ctx); }
      fecharPop(ctx);
    });
  }

  window.Leitor = { montar: montar, desmontar: desmontar, pref: pref };
})();
