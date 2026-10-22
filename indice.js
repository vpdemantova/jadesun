(function () {
  'use strict';

  /* ============================================================
     O ÍNDICE (12/out/2026; refeito em 22/out/2026, registro 116): o mapa de tudo, por dentro do Quadrado.

     "Que em um só lugar possamos ver tudo, e navegar por muitos meios e menus entre tudo."
     22/out: "dê mais atenção à animação de entrar no menu do quadrado, e o mapa também pode ser
     mais claro e mais bem diagramado, sempre com respiro e qualidade."

     A entrada: o próprio Quadrado da barra se abre até cobrir a tela (um recorte que cresce do
     botão, sem esperar efeito nenhum carregar: antes, nada acontecia por meio segundo e o
     conteúdo só chegava perto de 1,2 s). Logo atrás, o Índice se compõe: o quadrado pequeno e
     o título, o fio da busca que se abre do centro, e as portas, uma a uma, cada uma com o seu
     fio. A saída faz o caminho de volta, até o botão de onde saiu.

     O mapa: duas fileiras, O mundo e Você, cada uma com as portas lado a lado, na mesma ordem
     da barra do alto. Em cada porta: o nome, a pergunta que ela responde, e as páginas; a página
     em que se está vem marcada. As seções de dentro de cada página moram no "Nesta página".

     Teclado: M abre de qualquer página; digite para buscar; ↑ ↓ para escolher; Enter abre; Esc
     fecha. Leitor de tela: é um diálogo, a página atrás fica inerte, o foco volta para quem abriu.
     ============================================================ */

  var M = window.MAPA;
  if (!M) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); };
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CURVA = 'cubic-bezier(.76, 0, .24, 1)';

  var el = null, origem = null, aberto = false, vista = 'mapa', resultados = [], ativo = -1;

  function estatico() { return P.estatico ? P.estatico() : window.JADESUN_ESTATICO || null; }
  function permitida(id) { return P.permitida ? P.permitida(id) : true; }
  function publico() { var e = estatico(); return !!e && e.modo === 'publico'; }
  function portaOk(id) {
    var po = M.porta(id);
    if (!po || (publico() && po.publico === false)) return false;
    return po.paginas.some(function (p) { return permitida(p[0]) && !(publico() && p[5] === false); });
  }
  function paginasOk(po) { return po.paginas.filter(function (p) { return permitida(p[0]) && !(publico() && p[5] === false); }); }

  /* ---------- o mapa: duas fileiras de portas ---------- */
  function htmlPorta(id, i) {
    var po = M.porta(id), pags = paginasOk(po);
    var atual = document.body ? document.body.dataset.pagina : '';
    var aqui = pags.some(function (p) { return p[0] === atual; });
    return '<div class="indice-porta' + (aqui ? ' aqui' : '') + '" style="--i:' + i + '">' +
      '<a class="indice-porta-cab" href="' + esc(pags[0][1]) + '"><b>' + esc(po.nome) + '</b><em>' + esc(po.pergunta) + '</em></a>' +
      '<ul class="indice-paginas">' + pags.map(function (p) {
        return '<li><a href="' + esc(p[1]) + '"' + (p[0] === atual ? ' aria-current="page"' : '') + ' title="' + esc(p[3]) + '">' + esc(p[2]) + '</a></li>';
      }).join('') + '</ul></div>';
  }
  function htmlLinha(titulo, sub, ids, n0) {
    var lista = ids.filter(portaOk);
    if (!lista.length) return '';
    return '<section class="indice-linha" aria-label="' + esc(titulo) + '">' +
      '<header class="indice-linha-cab"><h3>' + esc(titulo) + '</h3><span>' + esc(sub) + '</span></header>' +
      '<div class="indice-portas" style="--n:' + lista.length + '">' + lista.map(function (id, i) { return htmlPorta(id, n0 + i); }).join('') + '</div></section>';
  }

  function htmlFerramentas() {
    var f = [];
    f.push('<button type="button" data-ind="buscar">Buscar em tudo</button>');
    if (!estatico()) f.push('<button type="button" data-ind="nota">Escrever uma nota</button>');
    /* no site exportado só aparece o que foi exportado junto (o público não leva o protetor) */
    var pode = function (id) { return !estatico() || !P.permitida || P.permitida(id); };
    if (pode('protetor')) f.push(estatico() ? '<a href="protetor.html">Protetor de tela</a>' : '<button type="button" data-ind="protetor">Protetor de tela</button>');
    f.push('<button type="button" data-ind="esfera">Ver numa esfera</button>');
    if (pode('leituras')) f.push('<a href="leituras.html">As suas leituras</a>');
    f.push('<button type="button" data-ind="pers">Ajustes</button>');
    return '<nav class="indice-ferr" aria-label="Ferramentas">' + f.join('') + '</nav>';
  }

  function htmlAgora() {
    var d = new Date();
    var dia = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    var abertos = 0;
    try {
      var lista = window.Abertos ? window.Abertos.lista() : Object.values((JSON.parse(localStorage.getItem('portal-leituras') || 'null') || {}).itens || {});
      abertos = lista.filter(function (a) { return a && a.aberto && !a.dormindo; }).length;
    } catch (e) { abertos = 0; }
    return '<div class="indice-agora" id="indice-agora"><p class="indice-agora-dia">' + esc(dia.charAt(0).toUpperCase() + dia.slice(1)) + '</p>' +
      '<p id="indice-prova"></p>' +
      (abertos ? '<p><a href="leituras.html">' + abertos + (abertos === 1 ? ' texto aberto' : ' textos abertos') + ', continuar de onde parou</a></p>' : '') + '</div>';
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
    var pub = publico();
    var mundo = pub ? M.PUB_MUNDO.concat(['biblioteca', 'atlas']) : M.MUNDO;
    var voce = pub ? M.PUB_VOCE.filter(function (id) { return ['atlas', 'biblioteca'].indexOf(id) < 0; }) : M.VOCE;
    var nMundo = mundo.filter(portaOk).length;
    el.innerHTML = '<div class="indice-veu" aria-hidden="true"></div>' +
      '<button type="button" class="indice-fechar" data-ind="fechar" aria-label="Fechar o Índice (Esc)">Fechar</button>' +
      '<div class="indice-in' + (vista === 'lista' ? ' indice-vista-lista' : '') + '">' +
        '<header class="indice-cab">' +
          '<button type="button" class="indice-q" data-ind="fechar" aria-label="Fechar o Índice">' + q + '</button>' +
          '<h2 class="indice-titulo">Índice</h2>' +
          '<label class="indice-busca"><input type="search" id="indice-q" placeholder="Para onde? Digite: fichas, hoje, manifesto…" autocomplete="off" aria-label="Buscar um lugar" aria-controls="indice-res"><i class="indice-busca-fio" aria-hidden="true"></i></label>' +
          '<ul class="indice-resultados" id="indice-res" role="listbox" aria-label="Lugares encontrados" hidden></ul>' +
          '<div class="indice-vistas" role="group" aria-label="Como ver">' +
            '<button type="button" data-vista="mapa" aria-pressed="' + (vista === 'mapa') + '">Mapa</button>' +
            '<button type="button" data-vista="lista" aria-pressed="' + (vista === 'lista') + '">Lista</button>' +
            '<button type="button" data-ind="esfera" aria-pressed="false">Esfera</button>' +
          '</div>' +
        '</header>' +
        '<div class="indice-mapa">' + htmlLinha('O mundo', 'o que existe', mundo, 0) + htmlLinha('Você', 'o que é seu', voce, nMundo) + '</div>' +
        '<footer class="indice-rodape">' + htmlAgora() + htmlFerramentas() +
          '<p class="indice-teclas"><kbd>M</kbd> abre de qualquer página · <kbd>Esc</kbd> fecha · segure o Quadrado para a esfera' +
            (estatico() && permitida('sobre') ? ' · <a href="sobre.html">Licença e créditos</a>' : '') + '</p>' +
          (!estatico() || !P.permitida || P.permitida('doar') ? '<a class="indice-segredo" href="doar.html" aria-label="Um segredo: doar" title="·"></a>' : '') +
        '</footer>' +
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

  /* a vista Lista: tudo numa coluna só, na ordem do mapa, porta por porta */
  function pintarLista() {
    var mapa = el.querySelector('.indice-mapa');
    var ul = document.createElement('ul');
    ul.className = 'indice-lista-toda';
    var ids = M.MUNDO.concat(M.VOCE).filter(portaOk);
    ul.innerHTML = ids.map(function (id) {
      var po = M.porta(id);
      return paginasOk(po).map(function (p) { return '<li><a href="' + esc(p[1]) + '"><b>' + esc(p[2]) + '</b><span>' + esc(po.nome + ' · ' + p[3]) + '</span></a></li>'; }).join('');
    }).join('');
    mapa.parentNode.insertBefore(ul, mapa);
  }

  function buscar() {
    var entrada = el.querySelector('#indice-q'), ul = el.querySelector('#indice-res');
    var q = norm(entrada.value);
    if (!q) { ul.hidden = true; ul.innerHTML = ''; resultados = []; ativo = -1; el.classList.remove('buscando'); return; }
    resultados = M.todas().filter(function (x) { return (!estatico() || x.publico) && permitida(x.id.split('#')[0]) && norm(x.nome + ' ' + x.desc + ' ' + x.portaNome).indexOf(q) >= 0; }).slice(0, 12);
    var extra = window.Tudo ? '<li><a href="#" data-ind="tudo"><b>Buscar “' + esc(entrada.value) + '” em tudo</b><span>fichas, livros, roupas, o Checklist (Ctrl+K)</span></a></li>' : '';
    ul.innerHTML = resultados.map(function (r, i) {
      return '<li><a href="' + esc(r.href) + '" data-i="' + i + '" role="option"><b>' + esc(r.nome) + '</b><span>' + esc(r.portaNome + ' · ' + r.desc) + '</span></a></li>';
    }).join('') + extra || '<li><span class="indice-nada">Nenhum lugar com esse nome.</span></li>';
    ul.hidden = false;
    el.classList.add('buscando');
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

  /* ---------- a abertura: o recorte do Quadrado da barra cresce até a tela inteira ---------- */
  function recorte(b) {
    var alvo = b && (b.querySelector('svg') || b);
    var r = alvo && alvo.getBoundingClientRect ? alvo.getBoundingClientRect() : null;
    if (!r || !r.width) { var m = Math.min(innerWidth, innerHeight) * 0.02; return 'inset(' + (innerHeight * 0.03) + 'px ' + (innerWidth / 2 - m) + 'px ' + (innerHeight * 0.97 - 2 * m) + 'px ' + (innerWidth / 2 - m) + 'px)'; }
    return 'inset(' + Math.max(0, r.top) + 'px ' + Math.max(0, innerWidth - r.right) + 'px ' + Math.max(0, innerHeight - r.bottom) + 'px ' + Math.max(0, r.left) + 'px)';
  }

  var sessao = 0;
  function abrir(quem) {
    if (aberto) return;
    if (!el) montar();
    var minha = ++sessao;
    origem = quem || document.getElementById('b-quadrado');
    aberto = true;
    pintar();
    el.hidden = false;
    el.classList.remove('pronto', 'saindo');
    document.documentElement.classList.add('indice-aberto');
    var casca = document.querySelector('.casca'), abas = document.querySelector('nav.abas');
    if (casca) casca.inert = true;
    if (abas) abas.inert = true;
    document.querySelectorAll('.ind').forEach(function (x) { x.inert = true; });
    document.querySelectorAll('#b-quadrado, #b-quadrado-cel').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var veu = el.querySelector('.indice-veu');
    var pronto = function () {
      if (!aberto || minha !== sessao) return;
      el.classList.add('pronto');
      var entrada = el.querySelector('#indice-q');
      if (entrada) entrada.focus({ preventScroll: true });
    };
    if (REDUZIR || !veu.animate) { pronto(); return; }
    veu.animate([{ clipPath: recorte(origem) }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: 440, easing: CURVA, fill: 'both' });
    setTimeout(pronto, 170);
  }

  function fechar(rapido) {
    if (!aberto || !el) return;
    aberto = false;
    el.classList.remove('pronto', 'buscando');
    el.classList.add('saindo');
    var casca = document.querySelector('.casca'), abas = document.querySelector('nav.abas');
    if (casca) casca.inert = false;
    if (abas) abas.inert = false;
    document.querySelectorAll('.ind').forEach(function (x) { x.inert = false; });
    document.querySelectorAll('#b-quadrado, #b-quadrado-cel').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    var fim = function () {
      if (aberto) return;
      el.hidden = true;
      el.classList.remove('saindo');
      document.documentElement.classList.remove('indice-aberto');
      el.innerHTML = '';
      if (origem && origem.focus && !rapido) try { origem.focus({ preventScroll: true }); } catch (e) { /* ok */ }
    };
    var veu = el.querySelector('.indice-veu');
    if (rapido || REDUZIR || !veu || !veu.animate) { setTimeout(fim, rapido ? 0 : 120); return; }
    /* o conteúdo sai primeiro (rápido), depois o recorte volta até o botão de onde saiu */
    setTimeout(function () {
      var a = veu.animate([{ clipPath: 'inset(0px 0px 0px 0px)' }, { clipPath: recorte(origem) }], { duration: 340, easing: CURVA, fill: 'both' });
      a.onfinish = fim;
    }, 110);
  }

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
