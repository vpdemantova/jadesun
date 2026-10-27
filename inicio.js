/* ============================================================
   A CASA DE ENTRADA (25/out/2026, registro 118)
   "a home deve ser mais simétrica, porque o atlas no menu não é simétrico, ou algo diferente, mais
   universal e mais de boas-vindas.. algo mais cara de home, mas nada comercial, e sim o máximo da
   utopia..!!"
   A home não é mais uma porta de um lado (o Atlas): é o centro, como o Quadrado no menu.
   · As boas-vindas, o lema dele ("Somos projetos do Sol…") e o dia de hoje; e, para quem volta, o lugar
     onde parou (as fixadas e os caminhos do aparelho).
   · O mapa espelhado: o mundo à esquerda, você à direita, as mesmas portas do menu, cada uma com a
     pergunta e as páginas; no meio, o Quadrado (o mapa de tudo).
   · A utopia: uma das "palavras", lidas do caderno (Manifestos/A Revolução Ontológica.md), o mesmo
     texto que o Manifesto lê; mudou lá, muda aqui.
   · A Terra agora: o dia e a noite deste minuto.
   Sem número para impressionar, sem convite para comprar: o lugar e o porquê.

   AS TELAS (26/out/2026): "tirar o quadrado do menu porque já temos ele bem grande! e dividir as
   seções pra caber somente ela na tela do dispositivo! e não ficar partes de outras seções".
   · Cada seção é uma tela: da barra de cima até a de baixo, e a rolagem para de tela em tela
     (scroll-snap; aqui sem a rolagem suave, que brigaria com ele).
   · O Quadrado grande faz o que o do menu fazia (abre o mapa de tudo; segurado, a esfera); o do
     menu fica escondido só aqui.
   · O mapa espelhado é uma tela no computador; onde não cabe (o celular, uma janela baixa), cada
     lado vira a sua tela, e cada lado em duas, se ainda faltar altura.
   · Sobrando pouco, o conteúdo encolhe um pouco (zoom) para caber, sem cortar nada.
   ============================================================ */
(function () {
  'use strict';
  var P = window.Perfil || {}, M = window.MAPA;
  var raiz = document.getElementById('inicio');
  if (!raiz || !M) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var publico = !!(P.ehPublico && P.ehPublico());
  var estatico = P.estatico ? P.estatico() : null;
  var permitida = P.permitida || function () { return true; };
  function portaOk(id) {
    var po = M.porta(id);
    if (!po || (publico && po.publico === false)) return false;
    return po.paginas.some(function (p) { return permitida(p[0]); });
  }
  function paginas(po) { return po.paginas.filter(function (p) { return permitida(p[0]) && !(estatico && (p[5] === false || po.publico === false)); }); }

  /* ---------- quem volta: o lugar onde parou ---------- */
  function continuar() {
    var L = null;
    try { L = JSON.parse(localStorage.getItem('portal-lugares') || 'null'); } catch (e) { L = null; }
    if (!L) return '';
    /* a própria casa não conta (nem a raiz antiga, anotada como atlas.html com o nome Início) */
    var fora = function (x) { return x && x.u && !/^inicio\.html/.test(x.u) && x.t !== 'Início'; };
    var fixada = (L.fixadas || []).filter(fora)[0];
    var ultimo = null;
    (L.caminhos || []).some(function (c) { var ps = (c.passos || []).filter(fora); if (ps.length) { ultimo = ps[ps.length - 1]; return true; } return false; });
    var item = function (x, rot) {
      return '<a class="in-cont-a" href="' + esc(x.u) + '" data-y="' + (x.y || 0) + '"><span class="in-cont-rot">' + rot + '</span><b>' + esc(x.t) + '</b>' + (x.s && x.s !== x.t ? '<small>' + esc(x.s) + '</small>' : '') + '</a>';
    };
    var h = '';
    if (ultimo) h += item(ultimo, 'Onde você parou');
    if (fixada && (!ultimo || fixada.u !== ultimo.u)) h += item(fixada, 'Fixada');
    return h ? '<nav class="in-continuar" aria-label="Continuar">' + h + '</nav>' : '';
  }

  /* ---------- as boas-vindas ---------- */
  var hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  function boas() {
    return '<section class="in-boas in-tela" data-secao="boas-vindas" data-rotulo="Boas-vindas" aria-labelledby="in-nome"><div class="in-tela-in">' +
      /* o Quadrado grande é o do menu (que sai desta página): o mapa de tudo e, segurado, a esfera */
      '<button type="button" class="in-marca" data-quadrado-casa aria-haspopup="dialog" aria-label="O mapa de tudo (Índice). Segure para a esfera." title="O mapa de tudo · segure para a esfera (tecla M)"></button>' +
      '<p class="in-ola">Boas-vindas ao</p>' +
      '<h1 class="in-nome" id="in-nome">Portal Solar</h1>' +
      '<p class="in-lema">Somos projetos do Sol: devemos espelhar as obras da luz.</p>' +
      '<p class="in-dia">' + esc(hoje.charAt(0).toUpperCase() + hoje.slice(1)) + '</p>' +
      continuar() +
    '</div></section>';
  }

  /* ---------- o mapa espelhado ---------- */
  function porta(id) {
    var po = M.porta(id), pags = paginas(po);
    return '<li class="in-porta"><a class="in-porta-a" href="' + esc(pags[0][1]) + '"><b>' + esc(po.nome) + '</b><span>' + esc(po.pergunta) + '</span></a>' +
      (pags.length > 1 ? '<p class="in-porta-pags">' + pags.map(function (p) { return '<a href="' + esc(p[1]) + '">' + esc(p[2]) + '</a>'; }).join('') + '</p>'
        /* uma página só, com vistas (o Atlas): as vistas */
        : (pags[0][4] || []).length ? '<p class="in-porta-pags">' + pags[0][4].map(function (x) { return '<a href="' + esc(x[0]) + '">' + esc(x[1]) + '</a>'; }).join('') + '</p>' : '') + '</li>';
  }
  var MUNDO = (publico ? M.PUB_MUNDO : M.MUNDO).filter(portaOk), VOCE = (publico ? M.PUB_VOCE : M.VOCE).filter(portaOk);
  var ROT_MUNDO = publico ? ['O porquê', 'e o que ler agora'] : ['O mundo', 'o que existe'];
  var ROT_VOCE = publico ? ['O que existe', 'e onde você parou'] : ['Você', 'o que é seu'];
  function lado(classe, rot, ids, parte) {
    return '<div class="in-lado ' + classe + '"><p class="in-lado-rot">' + rot[0] + '<span>' + rot[1] + (parte ? ' · ' + parte[0] + ' de ' + parte[1] : '') + '</span></p>' +
      '<ul class="in-portas">' + ids.map(porta).join('') + '</ul></div>';
  }
  /* n pedaços quase iguais, os primeiros com uma porta a mais */
  function partir(lista, n) {
    var r = [], k = Math.ceil(lista.length / n);
    for (var i = 0; i < lista.length; i += k) r.push(lista.slice(i, i + k));
    return r;
  }
  /* três jeitos: "espelho" (uma tela: o mundo | o Quadrado | você), "dois" (uma tela para cada lado)
     e "quatro" (cada lado em duas telas). O Quadrado do mapa de tudo abre o lado de você. */
  function mapa(jeito) {
    var titulo = '<h2 class="h2 in-mapa-t" id="in-mapa-t">As portas</h2>';
    var centro = '<div class="in-centro"><button type="button" class="in-q" data-abrir-indice aria-label="O mapa de tudo"><span aria-hidden="true"></span></button><p>O mapa de tudo</p></div>';
    if (jeito === 'espelho') {
      return '<section class="in-mapa in-tela" data-secao="portas" data-rotulo="As portas" aria-labelledby="in-mapa-t"><div class="in-tela-in">' + titulo +
        '<div class="in-mapa-grade">' + lado('in-mundo', ROT_MUNDO, MUNDO) + centro + lado('in-voce', ROT_VOCE, VOCE) + '</div>' +
      '</div></section>';
    }
    var n = jeito === 'quatro' ? 2 : 1, telas = [];
    partir(MUNDO, n).forEach(function (ids, i, todas) { telas.push({ cls: 'in-mundo', rot: ROT_MUNDO, ids: ids, parte: todas.length > 1 ? [i + 1, todas.length] : null }); });
    partir(VOCE, n).forEach(function (ids, i, todas) { telas.push({ cls: 'in-voce', rot: ROT_VOCE, ids: ids, parte: todas.length > 1 ? [i + 1, todas.length] : null, centro: i === 0 }); });
    return telas.map(function (t, i) {
      return '<section class="in-mapa in-mapa-lado in-tela"' + (i === 0 ? ' data-secao="portas" data-rotulo="As portas" aria-labelledby="in-mapa-t"' : ' aria-label="' + esc(t.rot[0]) + '"') + '><div class="in-tela-in">' +
        (i === 0 ? titulo : '') + (t.centro ? centro : '') + lado(t.cls, t.rot, t.ids, t.parte) +
      '</div></section>';
    }).join('');
  }

  /* ---------- a utopia, nas palavras dele ---------- */
  function utopia() {
    return '<section class="in-utopia in-tela" data-secao="utopia" data-rotulo="O que queremos" aria-labelledby="in-utopia-t" hidden><div class="in-tela-in">' +
      '<p class="rot">O máximo da utopia</p><h2 class="h2" id="in-utopia-t">O que queremos</h2>' +
      '<blockquote class="in-frase"><p id="in-frase"></p></blockquote>' +
      '<p class="in-assina"><a href="manifesto.html#mf-xvi">Vitor de Mantova, A revolução ontológica</a></p>' +
    '</div></section>';
  }

  /* ---------- a Terra agora ---------- */
  function terra() {
    return '<section class="in-terra in-tela" data-secao="terra" data-rotulo="A Terra agora" aria-labelledby="in-terra-t"><div class="in-tela-in">' +
      '<p class="rot">O dia e a noite deste minuto</p><h2 class="h2" id="in-terra-t">A Terra agora</h2>' +
      '<div class="in-terra-mapa" id="in-terra"></div>' +
    '</div></section>';
  }

  raiz.innerHTML = boas() + '<div class="in-mapas" data-mapas></div>' + utopia() + terra();
  var mapas = raiz.querySelector('[data-mapas]');
  /* o primeiro desenho já vem com o mapa (o jeito certo para a altura se confirma logo abaixo, em arrumar) */
  mapas.innerHTML = mapa(innerWidth > 760 ? 'espelho' : 'dois');
  var JEITO_INICIAL = innerWidth > 760 ? 'espelho' : 'dois';
  var marca = raiz.querySelector('[data-quadrado-casa]');
  if (marca && P.ligarQuadrado) P.ligarQuadrado(marca);
  else if (marca) marca.addEventListener('click', function () { if (P.abrirIndice) P.abrirIndice(marca); });

  raiz.addEventListener('click', function (ev) {
    var q = ev.target.closest('[data-abrir-indice]');
    if (q) { if (P.abrirIndice) P.abrirIndice(q); return; }
    var c = ev.target.closest('.in-cont-a');
    if (c && P.irPara && !(ev.metaKey || ev.ctrlKey || ev.shiftKey)) { ev.preventDefault(); P.irPara(c.getAttribute('href'), +c.getAttribute('data-y') || 0); }
  });

  fetch('/api/manifesto', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
    var O = window.Ontologica;
    if (!O || !d || !d.ontologica || !d.ontologica.existe) return;
    var p = O.partes(d.ontologica.texto), frase = p.palavras[2] || p.palavras[p.palavras.length - 1];
    if (!frase) return;
    document.getElementById('in-frase').textContent = frase.replace(/\*\*?([^*]+)\*\*?/g, '$1');
    raiz.querySelector('.in-utopia').hidden = false;
    arrumar(false);
  });

  if (window.TerraAgora) window.TerraAgora.montar(document.getElementById('in-terra'), { rotulo: publico ? 'Campinas' : '' });

  /* ---------- as telas: cada seção cabe inteira entre a barra de cima e as de baixo ---------- */
  var doc = document.documentElement;
  var BOM = 0.86;     /* precisando encolher mais que isto, o mapa se divide em mais telas */
  var MINIMO = 0.7;   /* e a letra nunca fica menor que isto */
  var toque = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var menorAltura = {}, jeito = JEITO_INICIAL, largura = 0, altura = 0, pedido = 0;

  /* a barra de cima, as de baixo (o menu de baixo; no celular, também as portas) e a linha dos créditos */
  function medirCasca() {
    var barra = document.getElementById('trilho');
    var topo = barra ? Math.max(0, Math.round(barra.getBoundingClientRect().bottom)) : 0;
    var pe = 0;
    var baixo = document.getElementById('baixo');
    if (baixo && !baixo.hidden) {
      var cb = getComputedStyle(baixo);
      /* aberto ou recolhido junto com o risco, conta o lugar que ele ocupa aberto */
      if (cb.display !== 'none' && cb.position === 'fixed') pe = Math.max(pe, (parseFloat(cb.bottom) || 0) + baixo.offsetHeight);
    }
    var abas = document.querySelector('nav.abas.abas-sim');
    if (abas && getComputedStyle(abas).display !== 'none') pe = Math.max(pe, innerHeight - abas.getBoundingClientRect().top);
    var cred = document.querySelector('.creditos-linha');
    var hc = cred ? cred.getBoundingClientRect().height : 0;
    doc.style.setProperty('--in-topo', topo + 'px');
    doc.style.setProperty('--in-pe', Math.ceil(pe) + 'px');
    doc.style.setProperty('--in-cred', Math.ceil(hc) + 'px');
    /* no celular, a conta usa a menor altura vista nesta largura (com as barras do navegador à mostra):
       quando elas somem, a tela cresce em volta do conteúdo, sem a letra mudar de tamanho */
    menorAltura[innerWidth] = Math.min(menorAltura[innerWidth] || Infinity, innerHeight);
    return { topo: topo, pe: Math.ceil(pe), cred: Math.ceil(hc), altura: toque ? menorAltura[innerWidth] : innerHeight };
  }

  /* o espaço de dentro de uma tela (a última divide a tela com os créditos) */
  function livre(t, c) {
    var cs = getComputedStyle(t);
    var alto = c.altura - c.topo - (t.classList.contains('in-terra') ? c.cred + c.pe : 0);
    return alto - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  }
  /* quanto o conteúdo precisa encolher para caber (1 = cabe como está) */
  function precisa(t, c) {
    var dentro = t.querySelector('.in-tela-in');
    if (!dentro || t.hidden) return 1;
    dentro.style.zoom = '';
    var h = dentro.getBoundingClientRect().height, l = livre(t, c);
    return h > l && h > 0 ? l / h : 1;
  }
  function ajustar(t, c) {
    var dentro = t.querySelector('.in-tela-in');
    var z = precisa(t, c);
    if (z >= 1) return;
    /* com a letra menor, as linhas se juntam e sobra espaço: o zoom sobe de novo até encher */
    var l = livre(t, c), bom = MINIMO;
    z = Math.max(MINIMO, z);
    for (var i = 0; i < 4; i++) {
      dentro.style.zoom = z.toFixed(3);
      var h = dentro.getBoundingClientRect().height;
      if (h <= l) { bom = z; if (h > l * 0.97 || z >= 1) break; z = Math.min(1, z * l / h); }
      else z = Math.max(MINIMO, z * l / h * 0.995);
    }
    dentro.style.zoom = bom >= 1 ? '' : bom.toFixed(3);
  }

  /* o mapa: o jeito com menos telas em que tudo cabe sem encolher demais */
  function escolherJeito(c) {
    var jeitos = innerWidth > 760 ? ['espelho', 'dois', 'quatro'] : ['dois', 'quatro'];
    for (var i = 0; i < jeitos.length; i++) {
      if (jeito !== jeitos[i]) { mapas.innerHTML = mapa(jeitos[i]); jeito = jeitos[i]; }
      var cabe = Array.prototype.every.call(mapas.querySelectorAll('.in-tela'), function (t) { return precisa(t, c) >= BOM; });
      if (cabe) return;
    }
  }

  function arrumar(refazer) {
    cancelAnimationFrame(pedido);
    pedido = requestAnimationFrame(function () {
      var c = medirCasca();
      /* o jeito do mapa muda com a largura (girar o celular) ou com uma janela bem mais baixa ou mais alta;
         no celular, as barras do navegador que vêm e vão não mexem nele */
      if (refazer || innerWidth !== largura || (!toque && Math.abs(innerHeight - altura) > 120)) {
        largura = innerWidth; altura = innerHeight;
        var antes = jeito;
        escolherJeito(c);
        if (jeito !== antes && window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
      }
      Array.prototype.forEach.call(raiz.querySelectorAll('.in-tela'), function (t) { ajustar(t, c); });
    });
  }
  addEventListener('resize', function () { arrumar(false); }, { passive: true });
  if (window.ResizeObserver) {
    /* a barra de cima muda na tela cheia; a de baixo e os créditos, com a letra */
    var ro = new ResizeObserver(function () { arrumar(false); });
    [document.getElementById('trilho'), document.getElementById('baixo'), document.querySelector('.creditos-linha')].forEach(function (el) { if (el) ro.observe(el); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { arrumar(true); });
  /* as medidas das barras vêm antes das telas: com a barra de cima medida, a rolagem nasce parada no 0
     (com uma medida provisória, o navegador parava a 1 px do lugar) */
  medirCasca();
  doc.classList.add('in-telas');
  arrumar(true);

  if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
})();
