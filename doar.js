/* ============================================================
   Portal Solar · doar.js (12/out/2026)
   A página escondida de doação (doar.html), achada pelo ponto do Índice
   ou digitando "doar" em qualquer página.

   Três colunas, como o resto do Portal:
     esquerda: o mapa das causas (um quadrado por organização, na cor da urgência);
     meio: as famílias, as áreas e as organizações (três abertas, o resto num toque);
     direita: busca, filtros (urgência, no Brasil, aceita reais, pouco conhecidas) e o índice.
   No fim, "a minha": o texto, os ingressos simbólicos e o Pix (BR Code do Banco Central,
   montado aqui com CRC16-CCITT; o QR sai do qrcode-gen.js, MIT).
   Dados: doar-dados.js (gerado pela pesquisa) e doar-config.js (a parte dele).
   ============================================================ */
(function () {
  'use strict';
  var D = window.DOAR || { familias: [] };
  var C = window.DOAR_CONFIG || {};
  var P = window.Perfil || {};
  var raiz = document.getElementById('doar');
  if (!raiz) return;

  var CH = 'portal-doar';
  var POR_AREA = 3;
  var URG = {
    imediata: 'Salva vidas agora',
    preventiva: 'Evita o pior',
    estrutural: 'Muda as causas',
  };
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function ic(n) { return P.icone ? P.icone(n) : ''; }
  function dominio(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  function estatico() { return !!(P.estatico ? P.estatico() : window.JADESUN_ESTATICO); }
  /* *itálico* e [^n] nos textos da configuração */
  function miudo(s) {
    return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\[\^(\d+)\]/g, function (m, n) {
      return '<sup class="dr-nr"><a href="#dr-nota-' + n + '" id="dr-ref-' + n + '" role="doc-noteref">' + n + '</a></sup>';
    });
  }

  function ler() {
    var e = { urg: '', br: false, reais: false, pouco: false, q: '', tudo: false };
    try { var s = JSON.parse(localStorage.getItem(CH) || '{}'); Object.keys(e).forEach(function (k) { if (k !== 'q' && s[k] !== undefined) e[k] = s[k]; }); } catch (x) { /* ok */ }
    return e;
  }
  function gravar() { try { var c = {}; Object.keys(estado).forEach(function (k) { if (k !== 'q') c[k] = estado[k]; }); localStorage.setItem(CH, JSON.stringify(c)); } catch (x) { /* ok */ } }
  var estado = ler();
  var abertas = {};

  /* ── os dados, com índices para os filtros ── */
  var AREAS = [];
  D.familias.forEach(function (f) {
    f.areas.forEach(function (a) {
      a.fam = f;
      a.orgs.forEach(function (o, i) {
        o.area = a; o.id = 'o-' + a.id + '-' + (i + 1);
        o.busca = norm([o.nome, o.oque, o.onde, (o.assuntos || []).join(' '), a.nome, a.nota, f.nome].join(' '));
      });
      AREAS.push(a);
    });
  });
  var TOTAL = AREAS.reduce(function (n, a) { return n + a.orgs.length; }, 0);

  function passa(o) {
    if (estado.urg && o.urgencia !== estado.urg) return false;
    if (estado.br && !o.brasil) return false;
    if (estado.reais && !o.emReais) return false;
    if (estado.pouco && !o.pouco) return false;
    if (estado.q) { var t = norm(estado.q).split(/\s+/).filter(Boolean); for (var i = 0; i < t.length; i++) if (o.busca.indexOf(t[i]) < 0) return false; }
    return true;
  }

  /* ── o desenho ── */
  function htmlOrg(o) {
    var tags = '<span class="dr-u dr-u-' + o.urgencia + '">' + esc(URG[o.urgencia]) + '</span>' +
      (o.brasil ? '<span class="dr-tag">no Brasil</span>' : '') +
      (o.pouco ? '<span class="dr-tag dr-tag-ouro" title="Excelente e pouco conhecida">pouco conhecida</span>' : '');
    var prova = o.prova ? (o.prova_url ? '<a href="' + esc(o.prova_url) + '" target="_blank" rel="noopener">' + esc(o.prova) + ' <span class="dr-dom">' + esc(dominio(o.prova_url)) + ' ↗</span></a>' : esc(o.prova)) : 'Não achamos balanço publicado.';
    return '<li class="dr-org" id="' + o.id + '" data-u="' + o.urgencia + '">' +
      '<div class="dr-org-tags">' + tags + '</div>' +
      '<h4 class="dr-org-n">' + esc(o.nome) + '</h4>' +
      '<p class="dr-org-o">' + esc(o.oque) + '</p>' +
      (o.onde ? '<p class="dr-org-onde">' + ic('lugar') + esc(o.onde) + '</p>' : '') +
      (o.assuntos && o.assuntos.length ? '<p class="dr-org-ass">' + o.assuntos.map(esc).join(' · ') + '</p>' : '') +
      '<p class="dr-prova"><span class="dr-rot">Prova de transparência</span>' + prova + '</p>' +
      (o.reais ? '<p class="dr-reais"><span class="dr-rot">Em reais</span>' + esc(o.reais) + '</p>' : '') +
      (!o.conferido ? '<p class="dr-aconferir">A conferir' + (o.nota ? ': ' + esc(o.nota) : '') + '</p>' : (o.nota ? '<p class="dr-nota-org">' + esc(o.nota) + '</p>' : '')) +
      '<div class="dr-org-acoes">' +
        '<a class="dr-doar" href="' + esc(o.doar) + '" target="_blank" rel="noopener">' + ic('doar') + 'Doar <span class="dr-dom">' + esc(dominio(o.doar)) + ' ↗</span></a>' +
        '<a class="dr-site" href="' + esc(o.site) + '" target="_blank" rel="noopener">Site</a>' +
      '</div>' +
    '</li>';
  }
  function htmlArea(a) {
    return '<section class="dr-area" id="a-' + a.id + '" aria-labelledby="h-' + a.id + '">' +
      '<h3 id="h-' + a.id + '">' + esc(a.nome) + ' <small class="dr-n" data-n-area="' + a.id + '">' + a.orgs.length + '</small></h3>' +
      (a.nota ? '<p class="dr-area-nota">' + esc(a.nota) + '</p>' : '') +
      (a.porque ? '<p class="dr-porque">' + esc(a.porque) + (a.fonte ? ' <a class="dr-fonte" href="' + esc(a.fonte) + '" target="_blank" rel="noopener" title="A fonte do número">' + esc(dominio(a.fonte)) + '</a>' : '') + '</p>' : '') +
      '<ol class="dr-orgs" id="l-' + a.id + '">' + a.orgs.map(htmlOrg).join('') + '</ol>' +
      '<button type="button" class="dr-mais" data-area="' + a.id + '" aria-controls="l-' + a.id + '" aria-expanded="false" hidden></button>' +
      '<p class="dr-vazia" hidden>Nenhuma organização desta área passa nos filtros.</p>' +
    '</section>';
  }
  function htmlMapa() {
    return '<div class="dr-col-cab"><p class="rot">O mapa <b>' + TOTAL + '</b></p></div>' +
      D.familias.map(function (f) {
        return '<div class="dr-mf"><p class="dr-mf-n">' + esc(f.nome) + '</p>' + f.areas.map(function (a) {
          return '<a class="dr-ma" href="#a-' + a.id + '" data-area="' + a.id + '"><span class="dr-ma-n">' + esc(a.nome) + '</span><span class="dr-ma-q">' +
            a.orgs.map(function (o) { return '<i class="dr-q dr-q-' + o.urgencia + '" data-o="' + o.id + '" title="' + esc(o.nome) + '"></i>'; }).join('') +
          '</span></a>';
        }).join('') + '</div>';
      }).join('') +
      '<ul class="dr-legenda">' + Object.keys(URG).map(function (k) { return '<li><i class="dr-q dr-q-' + k + '"></i>' + esc(URG[k]) + '</li>'; }).join('') + '</ul>' +
      '<p class="dr-mapa-dica">Cada quadrado é uma organização.</p>';
  }
  function htmlNav() {
    var urg = [['', 'Todas']].concat(Object.keys(URG).map(function (k) { return [k, URG[k]]; }));
    return '<div class="dr-col-cab"><p class="rot">Procurar</p></div>' +
      '<div class="dr-nav-linha"><label class="dr-busca">' + ic('buscar') + '<input type="search" id="dr-q" placeholder="Causa, assunto ou nome" autocomplete="off" aria-label="Buscar causa, assunto ou organização"></label>' +
        '<button type="button" class="dr-nav-abre" aria-expanded="false">' + ic('filtro') + 'Filtros</button></div>' +
      '<div class="dr-grupo" role="group" aria-label="Urgência">' + urg.map(function (u) { return '<button type="button" data-urg="' + u[0] + '" aria-pressed="' + (estado.urg === u[0]) + '">' + (u[0] ? '<i class="dr-q dr-q-' + u[0] + '"></i>' : '') + esc(u[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="dr-grupo" role="group" aria-label="Mais filtros">' +
        '<button type="button" data-f="br" aria-pressed="' + estado.br + '">No Brasil</button>' +
        '<button type="button" data-f="reais" aria-pressed="' + estado.reais + '">Aceita reais</button>' +
        '<button type="button" data-f="pouco" aria-pressed="' + estado.pouco + '">Pouco conhecidas</button>' +
      '</div>' +
      '<button type="button" class="dr-tudo" aria-pressed="' + estado.tudo + '">' + (estado.tudo ? 'Recolher tudo' : 'Expandir tudo') + '</button>' +
      '<p class="dr-conta" id="dr-conta" role="status"></p>' +
      '<ol class="dr-indice">' + D.familias.map(function (f) {
        return '<li><a class="dr-if" href="#f-' + f.id + '">' + esc(f.nome) + '</a><ol>' + f.areas.map(function (a) {
          return '<li><a href="#a-' + a.id + '" data-area="' + a.id + '">' + esc(a.nome) + ' <small data-n-ind="' + a.id + '">' + a.orgs.length + '</small></a></li>';
        }).join('') + '</ol></li>';
      }).join('') + '</ol>' +
      '<a class="dr-ir-minha" href="#minha">' + ic('doar') + 'E, por fim, a minha</a>';
  }
  function htmlMinha() {
    var ing = (C.ingressos || []).map(function (g, i) {
      var n = 'Nº ' + String(diaDoAno()).padStart(3, '0') + '·' + (i + 1);
      return '<li><button type="button" class="dr-ing" data-i="' + i + '" aria-controls="dr-pix">' +
        '<span class="dr-ing-canhoto" aria-hidden="true"><b>' + n + '</b><i>Temporada ' + new Date().getFullYear() + '</i></span>' +
        '<span class="dr-ing-corpo">' +
          '<span class="dr-ing-casa">Portal Solar · ingresso simbólico</span>' +
          '<span class="dr-ing-nome">' + esc(g.nome) + '</span>' +
          '<span class="dr-ing-linha">' + esc(g.linha) + '</span>' +
          '<span class="dr-ing-valor">' + (g.valor ? 'R$ ' + g.valor : 'valor livre') + '</span>' +
        '</span></button></li>';
    }).join('');
    var apoio = (C.apoio || []).filter(function (a) { return a && a.url; });
    var notas = (C.notas || []).map(function (n, i) { return '<li id="dr-nota-' + (i + 1) + '">' + miudo(n) + ' <a href="#dr-ref-' + (i + 1) + '" role="doc-backlink" aria-label="Voltar ao texto">↩</a></li>'; }).join('');
    return '<section class="dr-minha" id="minha" aria-labelledby="h-minha">' +
      '<canvas class="dr-minha-luz" aria-hidden="true"></canvas>' +
      '<div class="dr-minha-in">' +
        '<p class="rot">Depois das causas</p>' +
        '<h2 id="h-minha">' + esc(C.titulo || 'E, por fim, a minha') + '</h2>' +
        '<div class="dr-minha-texto">' + (C.texto || []).map(function (p) { return '<p>' + miudo(p) + '</p>'; }).join('') + '</div>' +
        '<ul class="dr-bilheteria" aria-label="Ingressos simbólicos">' + ing + '</ul>' +
        '<div class="dr-pix" id="dr-pix" aria-live="polite" hidden></div>' +
        (apoio.length ? '<p class="dr-apoio">Outros jeitos de apoiar: ' + apoio.map(function (a) { return '<a href="' + esc(a.url) + '" target="_blank" rel="noopener">' + esc(a.nome) + ' ↗</a>'; }).join(' · ') + '</p>' : '') +
        (notas ? '<ol class="dr-notas" role="doc-endnotes">' + notas + '</ol>' : '') +
      '</div>' +
    '</section>';
  }
  function htmlPe() {
    var d = (D.conferidoEm || '').split('-');
    return '<footer class="dr-pe">' +
      '<p><b>Como esta lista foi feita.</b> Pesquisa de ' + (d.length === 3 ? d[2] + '/' + d[1] + '/' + d[0] : 'outubro de 2026') + ': para cada área, um número recente de uma fonte oficial (o link vai no fim da frase) e organizações com impacto comprovado e contas publicadas, metade delas no Brasil quando havia boas opções. Cada site, página de doação e prova foi aberto antes de entrar; quando não deu para abrir, a organização aparece com "a conferir".</p>' +
      '<p><b>Onde conferir por conta própria.</b> <a href="https://www.givewell.org/" target="_blank" rel="noopener">GiveWell</a> e <a href="https://www.givingwhatwecan.org/" target="_blank" rel="noopener">Giving What We Can</a> (avaliam custo e efeito), <a href="https://www.charitynavigator.org/" target="_blank" rel="noopener">Charity Navigator</a> (contas das organizações dos EUA) e o <a href="https://selodoar.org/" target="_blank" rel="noopener">Selo Doar</a> (gestão e transparência de organizações brasileiras).</p>' +
      '<p class="suave">' + TOTAL + ' organizações em ' + AREAS.length + ' áreas. A ordem dentro de cada área põe primeiro as conferidas; não é um ranking.</p>' +
    '</footer>';
  }

  raiz.innerHTML =
    '<div class="dr">' +
      '<aside class="dr-col dr-mapa" aria-label="O mapa das causas">' + htmlMapa() + '</aside>' +
      '<div class="dr-col dr-texto">' +
        D.familias.map(function (f) {
          return '<section class="dr-fam" id="f-' + f.id + '" aria-labelledby="hf-' + f.id + '">' +
            '<header class="dr-fam-cab"><h2 id="hf-' + f.id + '">' + esc(f.nome) + '</h2><p>' + esc(f.desc) + '</p></header>' +
            f.areas.map(htmlArea).join('') + '</section>';
        }).join('') +
        htmlMinha() + htmlPe() +
      '</div>' +
      '<nav class="dr-col dr-nav" aria-label="Filtros e áreas">' + htmlNav() + '</nav>' +
    '</div>';

  /* ── os filtros: esconde e mostra sem redesenhar ── */
  function aplicar() {
    var vistos = 0, areasVivas = 0;
    AREAS.forEach(function (a) {
      var sec = document.getElementById('a-' + a.id);
      var vivos = a.orgs.filter(passa);
      var aberta = estado.tudo || abertas[a.id];
      a.orgs.forEach(function (o) {
        var li = document.getElementById(o.id);
        var k = vivos.indexOf(o);
        li.hidden = k < 0 || (!aberta && k >= POR_AREA);
        var q = raiz.querySelector('.dr-q[data-o="' + o.id + '"]');
        if (q) q.classList.toggle('fora', k < 0);
      });
      var mais = sec.querySelector('.dr-mais');
      var resto = vivos.length - POR_AREA;
      mais.hidden = resto <= 0 || estado.tudo;
      mais.setAttribute('aria-expanded', String(!!aberta));
      mais.textContent = aberta ? 'Mostrar só três' : 'Ver mais ' + resto;
      sec.querySelector('.dr-vazia').hidden = vivos.length > 0;
      sec.classList.toggle('dr-apagada', vivos.length === 0);
      var n1 = sec.querySelector('[data-n-area]'); if (n1) n1.textContent = vivos.length === a.orgs.length ? a.orgs.length : vivos.length + ' de ' + a.orgs.length;
      var n2 = raiz.querySelector('[data-n-ind="' + a.id + '"]'); if (n2) n2.textContent = vivos.length;
      var ai = raiz.querySelector('.dr-indice a[data-area="' + a.id + '"]'); if (ai) ai.classList.toggle('vazia', vivos.length === 0);
      vistos += vivos.length; if (vivos.length) areasVivas++;
    });
    var filtrando = estado.urg || estado.br || estado.reais || estado.pouco || estado.q;
    document.getElementById('dr-conta').textContent = filtrando ?
      vistos + ' de ' + TOTAL + ' organizações, em ' + areasVivas + ' áreas' :
      TOTAL + ' organizações em ' + AREAS.length + ' áreas';
  }

  var nav = raiz.querySelector('.dr-nav');
  nav.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-urg')) {
      estado.urg = b.getAttribute('data-urg');
      nav.querySelectorAll('[data-urg]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    } else if (b.dataset.f) {
      estado[b.dataset.f] = !estado[b.dataset.f];
      b.setAttribute('aria-pressed', String(estado[b.dataset.f]));
    } else if (b.classList.contains('dr-nav-abre')) {
      var ab = nav.classList.toggle('aberta'); b.setAttribute('aria-expanded', String(ab)); return;
    } else if (b.classList.contains('dr-tudo')) {
      estado.tudo = !estado.tudo;
      b.setAttribute('aria-pressed', String(estado.tudo));
      b.textContent = estado.tudo ? 'Recolher tudo' : 'Expandir tudo';
    } else return;
    gravar(); aplicar();
  });
  var campo = document.getElementById('dr-q');
  var tq;
  campo.addEventListener('input', function () { clearTimeout(tq); tq = setTimeout(function () { estado.q = campo.value.trim(); aplicar(); }, 120); });

  raiz.addEventListener('click', function (ev) {
    var m = ev.target.closest('.dr-mais');
    if (m) {
      var id = m.dataset.area;
      abertas[id] = !abertas[id];
      aplicar();
      if (abertas[id]) { var a = AREAS.filter(function (x) { return x.id === id; })[0]; var vivos = a.orgs.filter(passa); if (vivos[POR_AREA]) { var li = document.getElementById(vivos[POR_AREA].id); var f = li.querySelector('a'); if (f) f.focus({ preventScroll: true }); } }
      return;
    }
    var q = ev.target.closest('.dr-q[data-o]');
    if (q) { ev.preventDefault(); irPara(q.dataset.o); }
  });
  /* o quadrado do mapa acende quando o cartão está sob o ponteiro (e vice-versa) */
  raiz.addEventListener('pointerover', function (ev) {
    var li = ev.target.closest('.dr-org'), q = ev.target.closest('.dr-q[data-o]');
    var id = li ? li.id : q ? q.dataset.o : '';
    raiz.querySelectorAll('.dr-q.on, .dr-org.on').forEach(function (x) { x.classList.remove('on'); });
    if (!id) return;
    var alvoQ = raiz.querySelector('.dr-q[data-o="' + id + '"]'); if (alvoQ) alvoQ.classList.add('on');
    if (q) { var alvoL = document.getElementById(id); if (alvoL) alvoL.classList.add('on'); }
  });

  function irPara(oid) {
    var o = null;
    AREAS.some(function (a) { return a.orgs.some(function (x) { if (x.id === oid) { o = x; return true; } return false; }); });
    if (!o) return;
    if (!passa(o)) { estado.urg = ''; estado.br = estado.reais = estado.pouco = false; estado.q = ''; campo.value = ''; nav.querySelectorAll('[data-urg]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-urg') === '')); }); nav.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); gravar(); }
    abertas[o.area.id] = true; aplicar();
    var li = document.getElementById(oid);
    li.scrollIntoView({ behavior: REDUZIR ? 'auto' : 'smooth', block: 'center' });
    li.classList.remove('brilha'); void li.offsetWidth; li.classList.add('brilha');
    var f = li.querySelector('.dr-doar'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, REDUZIR ? 0 : 500);
  }

  /* o índice acompanha a leitura */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.id.replace(/^a-/, '');
        raiz.querySelectorAll('.dr-indice a[aria-current], .dr-ma[aria-current]').forEach(function (x) { x.removeAttribute('aria-current'); });
        raiz.querySelectorAll('[data-area="' + id + '"]').forEach(function (x) { if (x.tagName === 'A') x.setAttribute('aria-current', 'true'); });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    raiz.querySelectorAll('.dr-area').forEach(function (s) { io.observe(s); });
  }

  /* ── a bilheteria: Pix BR Code (Manual do BR Code, Banco Central) ── */
  function diaDoAno() { var h = new Date(), i = new Date(h.getFullYear(), 0, 0); return Math.floor((h - i) / 864e5); }
  function emv(id, v) { v = String(v); return id + String(v.length).padStart(2, '0') + v; }
  function crc16(s) {
    var c = 0xFFFF;
    for (var i = 0; i < s.length; i++) {
      c ^= s.charCodeAt(i) << 8;
      for (var j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
    }
    return c.toString(16).toUpperCase().padStart(4, '0');
  }
  function ascii(s, max) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 .,-]/g, '').trim().slice(0, max); }
  function brcode(o) {
    if (String(o.chave).length > 77) throw new Error('chave Pix longa demais');
    var sobra = 99 - 18 - (4 + String(o.chave).length) - 4;
    var info = o.info && sobra > 0 ? ascii(o.info, Math.min(40, sobra)) : '';
    var conta = emv('00', 'br.gov.bcb.pix') + emv('01', o.chave) + (info ? emv('02', info) : '');
    var p = emv('00', '01') + emv('26', conta) + emv('52', '0000') + emv('53', '986') +
      (o.valor ? emv('54', Number(o.valor).toFixed(2)) : '') + emv('58', 'BR') +
      emv('59', ascii(o.nome, 25) || 'Portal Solar') + emv('60', ascii(o.cidade, 15) || 'Brasil') +
      emv('62', emv('05', o.txid || '***')) + '6304';
    return p + crc16(p);
  }
  window.PortalPix = { brcode: brcode, crc16: crc16 };

  var caixaPix = document.getElementById('dr-pix');
  function copiar(txt, botao) {
    botao.dataset.rot = botao.dataset.rot || botao.textContent;
    function ok() { clearTimeout(botao._t); botao.textContent = 'Copiado'; botao._t = setTimeout(function () { botao.textContent = botao.dataset.rot; }, 1800); }
    function pedir() { clearTimeout(botao._t); botao.textContent = 'Selecionei o código: copie com Ctrl+C'; botao._t = setTimeout(function () { botao.textContent = botao.dataset.rot; }, 3200); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, function () { manual(); });
    else manual();
    function manual() { var a = caixaPix.querySelector('textarea'); if (!a) return; a.focus(); a.select(); var foi = false; try { foi = document.execCommand('copy'); } catch (e) { foi = false; } if (foi) ok(); else pedir(); }
  }
  raiz.querySelector('.dr-bilheteria').addEventListener('click', function (ev) {
    var b = ev.target.closest('.dr-ing');
    if (!b) return;
    var g = (C.ingressos || [])[+b.dataset.i];
    raiz.querySelectorAll('.dr-ing[aria-pressed]').forEach(function (x) { x.removeAttribute('aria-pressed'); });
    b.setAttribute('aria-pressed', 'true');
    var chave = (C.pix && C.pix.chave || '').trim();
    caixaPix.hidden = false;
    if (!chave) {
      caixaPix.innerHTML = '<p class="dr-pix-t"><b>Em breve.</b> A bilheteria ainda não abriu: falta a chave Pix.</p>' +
        (estatico() ? '' : '<p class="dr-pix-dica">Para abrir: escreva a sua chave em <code>jadesun/doar-config.js</code> (linha <code>pix: { chave: \'…\' }</code>) e recarregue. O QR e o "copia e cola" saem sozinhos.</p>');
      return;
    }
    var codigo;
    try { codigo = brcode({ chave: chave, nome: C.pix.nome, cidade: C.pix.cidade, valor: g.valor, info: 'Ingresso ' + g.nome }); }
    catch (e) { caixaPix.innerHTML = '<p class="dr-pix-t"><b>A chave Pix parece errada.</b> Ela tem mais de 77 caracteres; confira em doar-config.js.</p>'; return; }
    var svg = '';
    try { var q = window.qrcode(0, 'M'); q.addData(codigo); q.make(); svg = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { svg = ''; }
    caixaPix.innerHTML =
      '<div class="dr-pix-qr" role="img" aria-label="QR Code do Pix">' + svg + '</div>' +
      '<div class="dr-pix-lado">' +
        '<p class="dr-pix-t"><b>' + esc(g.nome) + '</b> · ' + (g.valor ? 'R$ ' + Number(g.valor).toFixed(2).replace('.', ',') : 'você escolhe o valor no app do banco') + '</p>' +
        '<p class="dr-pix-dica">Aponte a câmera do app do banco para o QR, ou copie o código e cole em "Pix Copia e Cola". Obrigado. De verdade.</p>' +
        '<button type="button" class="dr-pix-copiar">Copiar o código Pix</button>' +
        '<textarea class="dr-pix-cod" readonly rows="3" aria-label="Código Pix copia e cola">' + esc(codigo) + '</textarea>' +
      '</div>';
    caixaPix.querySelector('.dr-pix-copiar').addEventListener('click', function (e) { copiar(codigo, e.currentTarget); });
    if (!REDUZIR) caixaPix.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' });
  });

  /* ── a luz: poeira de estrelas no alto e um sol baixo atrás da bilheteria ── */
  function luz(canvas, efeito, cada) {
    if (!canvas || !P.carregarLuz) return;
    P.carregarLuz().then(function () {
      if (!window.Luz || !window.LuzEfeitos) return;
      return window.Luz.criar(canvas, window.LuzEfeitos[efeito]).then(function (fx) { if (fx) fx.animar(cada); });
    }).catch(function () { /* sem luz, a página segue */ });
  }
  var sinal = function (a) { return window.Luz ? window.Luz.token('--sinal', '#E9822A').slice(0, 3).concat([a]) : [0.91, 0.51, 0.16, a]; };
  luz(document.querySelector('.dr-minha-luz'), 'poeira', function () { return { p: [1.4, 0, 0, 0, 0, 0, 0, 0], c: [0.96, 0.78, 0.46, 0.75, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }; });
  luz(document.querySelector('.dr-ceu'), 'poeira', function () { return { p: [0.7, 0, 0, 0, 0, 0, 0, 0], c: sinal(0.55).concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) }; });

  aplicar();
  /* chegou por um endereço (#a-clima, #minha)? vai até lá */
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    var alvo = document.getElementById(location.hash.slice(1));
    if (alvo.classList.contains('dr-org')) irPara(alvo.id);
    else setTimeout(function () { alvo.scrollIntoView({ block: 'start' }); }, 60);
  }
})();
