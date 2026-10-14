(function () {
  'use strict';

  /* ============================================================
     O ÍNDICE (12/out/2026): o mapa de tudo, por dentro do Quadrado.

     "Que em um só lugar possamos ver tudo, e navegar por muitos meios
     e menus entre tudo." O Quadrado do menu cresce até cobrir a tela
     (com as rachaduras da tela de 1915, um shader do luz-efeitos.js) e,
     por dentro dele, o site inteiro: o mundo à esquerda, você à direita,
     no meio a busca, o agora e as ferramentas. Esc, o × ou o Quadrado
     fecham; o Quadrado volta a ser o botão de onde saiu.

     Teclado: M abre de qualquer página; digite para buscar; ↑ ↓ para
     escolher; Enter abre; Esc fecha. Leitor de tela: é um diálogo, a
     página atrás fica inerte, o foco volta para quem abriu.
     ============================================================ */

  var M = window.MAPA;
  if (!M) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = function (n) { return P.icone ? P.icone(n) : ''; };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); };
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var el = null, fx = null, origem = null, aberto = false, vista = 'mapa', resultados = [], ativo = -1, animando = 0;

  function estatico() { return P.estatico ? P.estatico() : window.JADESUN_ESTATICO || null; }
  function permitida(id) { return P.permitida ? P.permitida(id) : true; }
  function publico() { var e = estatico(); return !!e && e.modo === 'publico'; }
  function portaOk(id) {
    var po = M.porta(id);
    if (!po || (publico() && po.publico === false)) return false;
    return po.paginas.some(function (p) { return permitida(p[0]) && !(publico() && p[5] === false); });
  }
  function paginasOk(po) { return po.paginas.filter(function (p) { return permitida(p[0]) && !(publico() && p[5] === false); }); }

  function htmlPorta(id, i) {
    var po = M.porta(id), pags = paginasOk(po);
    var atual = document.body ? document.body.dataset.pagina : '';
    return '<section class="indice-porta" style="--i:' + i + '">' +
      '<a class="indice-porta-cab" href="' + esc(pags[0][1]) + '">' + ic(po.icone) + '<b>' + esc(po.nome) + '</b><em>' + esc(po.pergunta) + '</em></a>' +
      '<ul class="indice-paginas">' + pags.map(function (p) {
        var secoes = (p[4] || []);
        return '<li><a href="' + esc(p[1]) + '"' + (p[0] === atual ? ' aria-current="page"' : '') + '><b>' + esc(p[2]) + '</b><span>' + esc(p[3]) + '</span></a>' +
          (secoes.length ? '<div class="indice-secoes">' + secoes.map(function (s) { return '<a href="' + esc(s[0]) + '">' + esc(s[1]) + '</a>'; }).join('') + '</div>' : '') + '</li>';
      }).join('') + '</ul></section>';
  }

  function htmlLado(lado, titulo, sub, ids) {
    /* do centro para fora: a porta mais perto do Quadrado vem primeiro */
    var lista = ids.filter(portaOk);
    if (lado === 'e') lista = lista.slice().reverse();
    return '<div class="indice-lado indice-lado-' + lado + '" role="group" aria-label="' + esc(titulo) + '">' +
      '<header class="indice-lado-cab" style="--i:0"><h2>' + esc(titulo) + '</h2><span>' + esc(sub) + '</span></header>' +
      lista.map(function (id, i) { return htmlPorta(id, i + 1); }).join('') + '</div>';
  }

  function htmlFerramentas() {
    var f = [];
    f.push('<button type="button" data-ind="buscar">' + ic('buscar') + 'Buscar em tudo</button>');
    if (!estatico()) f.push('<button type="button" data-ind="nota">' + ic('nota') + 'Escrever uma nota</button>');
    /* no site exportado só aparece o que foi exportado junto (o público não leva o protetor) */
    var pode = function (id) { return !estatico() || !P.permitida || P.permitida(id); };
    if (pode('protetor')) f.push(estatico() ? '<a href="protetor.html">' + ic('protetor') + 'Protetor de tela</a>' : '<button type="button" data-ind="protetor">' + ic('protetor') + 'Protetor de tela</button>');
    f.push('<button type="button" data-ind="esfera">' + ic('portal') + 'Ver numa esfera</button>');
    if (pode('leituras')) f.push('<a href="leituras.html">' + ic('leituras') + 'As suas leituras</a>');
    f.push('<button type="button" data-ind="pers">' + ic('pers') + 'Personalizar</button>');
    return '<div class="indice-ferr">' + f.join('') + '</div>';
  }

  function htmlAgora() {
    var d = new Date();
    var dia = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    var abertos = 0;
    try {
      var lista = window.Abertos ? window.Abertos.lista() : Object.values((JSON.parse(localStorage.getItem('portal-leituras') || 'null') || {}).itens || {});
      abertos = lista.filter(function (a) { return a && a.aberto && !a.dormindo; }).length;
    } catch (e) { abertos = 0; }
    return '<div class="indice-agora" id="indice-agora"><p class="rot">Agora</p><p class="grande">' + esc(dia.charAt(0).toUpperCase() + dia.slice(1)) + '</p>' +
      '<p id="indice-prova"></p>' +
      (abertos ? '<p><a href="leituras.html">' + abertos + (abertos === 1 ? ' texto aberto' : ' textos abertos') + ' · continuar de onde parou</a></p>' : '') + '</div>';
  }

  function montar() {
    el = document.createElement('div');
    el.className = 'indice';
    el.hidden = true;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Índice: o mapa de tudo');
    el.setAttribute('data-lenis-prevent', '');
    el.tabIndex = -1;
    document.body.appendChild(el);
    el.addEventListener('click', clique);
    el.addEventListener('keydown', teclas);
  }

  function pintar() {
    resultados = []; ativo = -1;
    var q = window.Icones ? window.Icones.quadrado() : '';
    var pub = !!(estatico() && estatico().modo === 'publico');
    el.innerHTML = '<canvas class="indice-luz" aria-hidden="true"></canvas><div class="indice-veu" aria-hidden="true"></div>' +
      '<button type="button" class="indice-fechar" data-ind="fechar" aria-label="Fechar o Índice (Esc)">' + ic('fechar') + '</button>' +
      '<div class="indice-in' + (vista === 'lista' ? ' indice-vista-lista' : '') + '">' +
        htmlLado('e', 'O mundo', 'o que existe', pub ? M.PUB_MUNDO.concat(['biblioteca', 'atlas']) : M.MUNDO) +
        '<div class="indice-centro">' +
          '<button type="button" class="indice-q" data-ind="fechar" aria-label="Fechar o Índice">' + q + '</button>' +
          '<p class="indice-titulo">Índice</p>' +
          '<label class="indice-busca">' + ic('buscar') + '<input type="search" id="indice-q" placeholder="Para onde? Digite: fichas, hoje, manifesto…" autocomplete="off" aria-label="Buscar um lugar" aria-controls="indice-res"></label>' +
          '<ul class="indice-resultados" id="indice-res" role="listbox" aria-label="Lugares encontrados" hidden></ul>' +
          '<div class="indice-vistas" role="group" aria-label="Como ver">' +
            '<button type="button" data-vista="mapa" aria-pressed="' + (vista === 'mapa') + '">Mapa</button>' +
            '<button type="button" data-vista="lista" aria-pressed="' + (vista === 'lista') + '">Lista</button>' +
            '<button type="button" data-ind="esfera" aria-pressed="false">Esfera</button>' +
          '</div>' +
          htmlAgora() + htmlFerramentas() +
          '<p class="indice-pe"><kbd>M</kbd> abre de qualquer página · <kbd>Esc</kbd> fecha · segure o Quadrado para a esfera' +
            (estatico() && permitida('sobre') ? ' · <a href="sobre.html">Licença e créditos</a>' : '') + '</p>' +
          (!estatico() || !P.permitida || P.permitida('doar') ? '<a class="indice-segredo" href="doar.html" aria-label="Um segredo: doar" title="·"></a>' : '') +
        '</div>' +
        htmlLado('d', 'Você', 'o que é seu', pub ? M.PUB_VOCE.filter(function (id) { return ['atlas', 'biblioteca'].indexOf(id) < 0; }) : M.VOCE) +
      '</div>';
    if (vista === 'lista') pintarLista();
    var entrada = el.querySelector('#indice-q');
    entrada.addEventListener('input', buscar);
    /* a prova: os dias que faltam (só no app) */
    if (!estatico() && P.estado && P.contagem) P.estado().then(function (e) {
      var c = P.contagem(e), alvo = el && el.querySelector('#indice-prova');
      if (!alvo || !e.contagem) return;
      alvo.textContent = c.fase === 'depois' ? 'A 1ª fase já foi.' : c.faltam === 0 ? 'Hoje é a prova.' : 'Faltam ' + c.faltam + (c.faltam === 1 ? ' dia' : ' dias') + ' para a prova.';
    }).catch(function () {});
  }

  /* a vista Lista: tudo achatado numa coluna só, em ordem do mapa */
  function pintarLista() {
    var centro = el.querySelector('.indice-centro');
    var ul = document.createElement('ul');
    ul.className = 'indice-paginas indice-lista-toda';
    var ids = M.MUNDO.slice().reverse().concat(M.VOCE).filter(portaOk);
    ul.innerHTML = ids.map(function (id) {
      var po = M.porta(id);
      return paginasOk(po).map(function (p) { return '<li><a href="' + esc(p[1]) + '"><b>' + esc(po.nome + ' · ' + p[2]) + '</b><span>' + esc(p[3]) + '</span></a></li>'; }).join('');
    }).join('');
    centro.insertBefore(ul, centro.querySelector('.indice-agora'));
  }

  function buscar() {
    var entrada = el.querySelector('#indice-q'), ul = el.querySelector('#indice-res');
    var q = norm(entrada.value);
    if (!q) { ul.hidden = true; ul.innerHTML = ''; resultados = []; ativo = -1; return; }
    resultados = M.todas().filter(function (x) { return (!estatico() || x.publico) && permitida(x.id.split('#')[0]) && norm(x.nome + ' ' + x.desc + ' ' + x.portaNome).indexOf(q) >= 0; }).slice(0, 12);
    var extra = window.Tudo ? '<li><a href="#" data-ind="tudo"><b>Buscar “' + esc(entrada.value) + '” em tudo</b><span>fichas, livros, roupas, o Checklist (Ctrl+K)</span></a></li>' : '';
    ul.innerHTML = resultados.map(function (r, i) {
      return '<li><a href="' + esc(r.href) + '" data-i="' + i + '" role="option"><b>' + esc(r.nome) + '</b><span>' + esc(r.portaNome + (r.secao ? ' · ' + r.desc : ' · ' + r.desc)) + '</span></a></li>';
    }).join('') + extra || '<li><span class="indice-pe">Nenhum lugar com esse nome.</span></li>';
    ul.hidden = false;
    ativo = resultados.length ? 0 : -1;
    marcar();
  }
  function marcar() {
    var as = el.querySelectorAll('#indice-res a');
    as.forEach(function (a, i) { a.classList.toggle('ativo', i === ativo); a.setAttribute('aria-selected', String(i === ativo)); });
  }

  function mesmaPagina(href) { try { var u = new URL(href, location.href); return u.pathname === location.pathname && u.search === location.search; } catch (e) { return false; } }
  function clique(ev) {
    var link = ev.target.closest('a[href]');
    if (link && !link.hasAttribute('data-ind') && mesmaPagina(link.getAttribute('href'))) { fechar(true); return; }
    var b = ev.target.closest('[data-ind], [data-vista]');
    if (!b) return;
    var o = b.getAttribute('data-ind');
    if (b.hasAttribute('data-vista')) {
      vista = b.getAttribute('data-vista');
      var inn = el.querySelector('.indice-in');
      if (inn) inn.classList.toggle('indice-vista-lista', vista === 'lista');
      el.querySelectorAll('[data-vista]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-vista') === vista)); });
      var velha = el.querySelector('.indice-lista-toda'); if (velha) velha.remove();
      if (vista === 'lista') pintarLista();
      return;
    }
    ev.preventDefault();
    if (o === 'fechar') fechar();
    else if (o === 'esfera') { fechar(true); if (P.abrirPortal) setTimeout(P.abrirPortal, 60); }
    else if (o === 'nota') { fechar(true); if (P.abrirNota) setTimeout(function () { P.abrirNota(); }, 60); }
    else if (o === 'pers') { fechar(true); if (P.abrirPers) setTimeout(P.abrirPers, 60); }
    else if (o === 'protetor') { fechar(true); if (P.abrirProtetor) setTimeout(P.abrirProtetor, 60); else location.href = 'protetor.html'; }
    else if (o === 'buscar' || o === 'tudo') {
      var texto = el.querySelector('#indice-q').value;
      if (window.Tudo) { fechar(true); setTimeout(function () { window.Tudo.abrir(texto); }, 60); }
      else el.querySelector('#indice-q').focus();
    }
  }

  function teclas(ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(); return; }
    var naBusca = ev.target && ev.target.id === 'indice-q';
    var lista = el.querySelector('#indice-res');
    if (naBusca && resultados.length && lista && !lista.hidden && ev.target.value.trim()) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); ativo = (ativo + 1) % resultados.length; marcar(); return; }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); ativo = (ativo - 1 + resultados.length) % resultados.length; marcar(); return; }
      if (ev.key === 'Enter' && resultados[ativo]) { ev.preventDefault(); var destino = resultados[ativo].href; if (mesmaPagina(destino)) fechar(true); location.href = destino; return; }
    }
    if (ev.key === 'Tab') {
      /* o foco gira dentro do Índice */
      var f = Array.prototype.filter.call(el.querySelectorAll('a[href], button, input'), function (x) { return x.offsetParent !== null && !x.hidden; });
      if (!f.length) return;
      var i = f.indexOf(document.activeElement);
      if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); }
    }
  }

  /* de onde o Quadrado sai: o centro do botão, em fração da tela */
  function pontoDe(b) {
    if (!b || !b.getBoundingClientRect) return [0.5, 0.06];
    var r = b.getBoundingClientRect();
    if (!r.width) return [0.5, 0.06];
    return [(r.left + r.width / 2) / innerWidth, (r.top + r.height / 2) / innerHeight];
  }

  function cores() {
    return [0.059, 0.059, 0.055, 1, 0.24, 0.2, 0.15, 1, 0.91, 0.51, 0.16, 1, 0, 0, 0, 1];
  }

  /* o Quadrado cresce (ida = true) ou volta (ida = false); a promessa resolve quando termina */
  function animarQuadrado(ida, dur) {
    return new Promise(function (ok) {
      if (!fx || fx.tipo === 'nenhum' || REDUZIR) { ok(); return; }
      var pt = pontoDe(origem), t0 = performance.now(), meu = ++animando;
      function quadro(agora) {
        if (meu !== animando) { ok(); return; }
        var k = Math.min(1, (agora - t0) / dur);
        var e = ida ? k : 1 - k;
        fx.desenhar(agora / 1000, { progresso: e, p: [pt[0], pt[1], 0.38, 0, 0, 0, 0, 0], c: cores() });
        if (k < 1) requestAnimationFrame(quadro); else ok();
      }
      requestAnimationFrame(quadro);
    });
  }

  var sessao = 0;
  function abrir(quem) {
    if (aberto) return;
    if (!el) montar();
    var minha = ++sessao;
    if (fx) { try { fx.destruir(); } catch (e) { /* ok */ } fx = null; }
    origem = quem || document.getElementById('b-quadrado');
    aberto = true;
    pintar();
    el.hidden = false;
    document.documentElement.classList.add('indice-aberto');
    var casca = document.querySelector('.casca'), abas = document.querySelector('nav.abas');
    if (casca) casca.inert = true;
    if (abas) abas.inert = true;
    document.querySelectorAll('#b-quadrado, #b-quadrado-cel').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var canvas = el.querySelector('.indice-luz');
    var pronto = function () {
      if (!aberto) return;
      el.classList.add('pronto');
      var entrada = el.querySelector('#indice-q');
      if (entrada) entrada.focus({ preventScroll: true });
    };
    if (window.Luz && window.LuzEfeitos && !REDUZIR) {
      window.Luz.criar(canvas, window.LuzEfeitos.quadrado).then(function (f) {
        if (!aberto || minha !== sessao) { try { f.destruir(); } catch (e) { /* ok */ } return; }
        fx = f;
        if (f.tipo === 'nenhum') { el.classList.add('sem-luz'); pronto(); return; }
        animarQuadrado(true, 620).then(pronto);
      }).catch(function () { el.classList.add('sem-luz'); pronto(); });
    } else { el.classList.add('sem-luz'); pronto(); }
  }

  function fechar(rapido) {
    if (!aberto || !el) return;
    aberto = false;
    el.classList.remove('pronto');
    var casca = document.querySelector('.casca'), abas = document.querySelector('nav.abas');
    if (casca) casca.inert = false;
    if (abas) abas.inert = false;
    document.querySelectorAll('#b-quadrado, #b-quadrado-cel').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    var fim = function () {
      if (aberto) return;
      el.hidden = true;
      el.classList.remove('sem-luz');
      document.documentElement.classList.remove('indice-aberto');
      if (fx) { fx.destruir(); fx = null; }
      el.innerHTML = '';
      if (origem && origem.focus && !rapido) try { origem.focus({ preventScroll: true }); } catch (e) { /* ok */ }
    };
    if (rapido || !fx || fx.tipo === 'nenhum') { setTimeout(fim, rapido ? 0 : 200); return; }
    setTimeout(function () { animarQuadrado(false, 420).then(fim); }, 140);
  }

  addEventListener('resize', function () { if (aberto && fx && fx.tipo !== 'nenhum') { var pt = pontoDe(origem); fx.desenhar(performance.now() / 1000, { progresso: 1, p: [pt[0], pt[1], 0.38, 0, 0, 0, 0, 0], c: cores() }); } });
  /* #14: Esc e Tab funcionam mesmo quando o foco escapou para fora do Índice */
  document.addEventListener('keydown', function (ev) {
    if (!aberto || !el || el.contains(ev.target)) return;
    if (ev.key === 'Escape') { ev.preventDefault(); fechar(); }
    else if (ev.key === 'Tab') { ev.preventDefault(); var e1 = el.querySelector('#indice-q') || el; e1.focus({ preventScroll: true }); }
  }, true);

  /* no site público (sem o menu Tudo), o botão de buscar abre o Índice com a busca */
  document.addEventListener('click', function (ev) {
    if (window.Tudo) return;
    var b = ev.target.closest && ev.target.closest('[data-tudo]');
    if (b) { ev.preventDefault(); abrir(b); }
  });

  window.Indice = { abrir: abrir, fechar: fechar, aberto: function () { return aberto; } };
})();
