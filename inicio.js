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

   O CENTRO DO MUNDO (27/out/2026): "o início precisa ter mais coisas, mais para ficar na tela, mais
   atlas e hub do mundo, pra gente ter noção e saber como está e o que fazer". Depois das portas, as
   telas do agora e do fazer, cada uma lida de um dado que já existe (mudou lá, muda aqui):
   · A Terra agora (o dia e a noite deste minuto);
   · Como está o mundo: as cinco colunas de "O que importa agora" (aviso-dados.js), com as fontes abertas;
   · O que fazer: as cinco escolhas que mais pesam (planeta-dados.js, IPCC) e onde agir junto;
   · O seu dia (só no computador): os próximos passos "Em foco" das pastas (/api/pastas);
   · O saber inteiro: as dez partes (humanidade-dados.js), cada uma levando à sua no Atlas;
   · e, por último, a utopia, com a linha dos créditos.
   O mundo agora e o saber se dividem em mais telas quando a altura não dá, como o mapa.
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

  /* ---------- o mundo agora: as cinco colunas de "O que importa agora" ---------- */
  /* a página de dentro só aparece se estiver neste site (o público não leva o Doar, por exemplo) */
  function aqui(id) {
    if (!permitida(id)) return false;
    if (estatico && estatico.modo === 'publico') {
      var po = M.porta(M.paiDe(id));
      if (po && po.publico === false) return false;
    }
    return true;
  }
  /* uma fonte: [nome, endereço, por quê]; { guias: 'id' } busca a do Guias (as notícias não se repetem) */
  function fonteDe(f) {
    if (Array.isArray(f)) return f;
    var g = window.GUIAS && window.GUIAS.fontes.filter(function (x) { return x[0] === f.guias; })[0];
    return g ? [g[2], g[3], g[5]] : null;
  }
  function coluna(col) {
    var fontes = (col[3] || []).map(fonteDe).filter(Boolean).slice(0, 3);
    var dentro = (col[4] || []).filter(function (l) { return aqui(l[0]); });
    return '<div class="in-col"><h3 class="in-col-t">' + esc(col[1]) + '</h3><p class="in-col-fina">' + esc(col[2]) + '</p>' +
      '<ul class="in-fontes">' + fontes.map(function (f) { return '<li><a href="' + esc(f[1]) + '" target="_blank" rel="noopener"><b>' + esc(f[0]) + '</b><span>' + esc(f[2]) + '</span></a></li>'; }).join('') + '</ul>' +
      (dentro.length ? '<p class="in-col-dentro">' + dentro.map(function (l) { return '<a href="' + esc(l[1]) + '">' + esc(l[2]) + '</a>'; }).join('') + '</p>' : '') +
    '</div>';
  }
  function mundoAgora(n) {
    var A = window.AVISO;
    if (!A || !A.colunas) return '';
    var partes = partir(A.colunas, n);
    return partes.map(function (lista, i) {
      return '<section class="in-agora in-tela"' + (i === 0 ? ' data-secao="mundo" data-rotulo="Como está o mundo" aria-labelledby="in-agora-t"' : ' aria-label="Como está o mundo, ' + (i + 1) + ' de ' + partes.length + '"') + '><div class="in-tela-in">' +
        (i === 0 ? '<p class="rot">As fontes abertas de cada assunto</p><h2 class="h2" id="in-agora-t">Como está o mundo</h2>' : '<p class="rot">Como está o mundo · ' + (i + 1) + ' de ' + partes.length + '</p>') +
        '<div class="in-colunas" style="--n:' + lista.length + '">' + lista.map(coluna).join('') + '</div>' +
        (i === partes.length - 1 && A.texto ? '<p class="in-assina">' + esc(A.texto.assinatura) + '</p>' : '') +
      '</div></section>';
    }).join('');
  }

  /* ---------- o que fazer: as cinco escolhas que mais pesam, e onde agir junto ---------- */
  function fazer(n) {
    var PL = window.PLANETA;
    if (!PL || !PL.cinco) return '';
    var agir = [['atlas', 'atlas.html#ver=planeta', 'Os hábitos, aspecto por aspecto'], ['participe', 'participe.html', 'Faça parte do Portal'], ['doar', 'doar.html', 'As causas para doar'], ['guias', 'guias.html#necessidades', 'Os 17 objetivos da ONU']]
      .filter(function (l) { return aqui(l[0]); });
    var cab = '<p class="rot">Cada um, a partir de hoje</p><h2 class="h2" id="in-fazer-t">O que fazer</h2>';
    var abre = '<p class="in-fazer-abre">' + esc(PL.abertura) + (PL.aberturaFonte ? ' <a href="' + esc(PL.aberturaFonte[1]) + '" target="_blank" rel="noopener">' + esc(PL.aberturaFonte[0]) + '</a>' : '') + '</p>';
    var cinco = '<ol class="in-cinco">' + PL.cinco.map(function (c) { return '<li><b>' + esc(c[0]) + '</b><span>' + esc(c[1]) + '</span></li>'; }).join('') + '</ol>' +
      (agir.length ? '<p class="in-agir">' + agir.map(function (l) { return '<a href="' + esc(l[1]) + '">' + esc(l[2]) + '</a>'; }).join('') + '</p>' : '');
    var tela = function (dentro, primeira) {
      return '<section class="in-fazer in-tela"' + (primeira ? ' data-secao="fazer" data-rotulo="O que fazer" aria-labelledby="in-fazer-t"' : ' aria-label="O que fazer: as cinco que mais pesam"') + '><div class="in-tela-in">' + dentro + '</div></section>';
    };
    /* sem altura para tudo (o celular pequeno): a abertura numa tela, as cinco e onde agir na outra */
    if (n === 2) return tela(cab + abre, true) + tela('<p class="rot">O que fazer · as cinco que mais pesam</p>' + cinco, false);
    return tela(cab + abre + cinco, true);
  }

  /* ---------- o seu dia: só no computador, os próximos passos das pastas ---------- */
  function seuDia() {
    if (publico || estatico) return '';
    return '<section class="in-seu in-tela" data-secao="seu-dia" data-rotulo="O seu dia" aria-labelledby="in-seu-t" hidden><div class="in-tela-in">' +
      '<p class="rot">Só neste computador</p><h2 class="h2" id="in-seu-t">O seu dia</h2>' +
      '<ol class="in-passos" id="in-passos"></ol><p class="in-cuidado" id="in-cuidado" hidden></p>' +
      '<p class="in-agir">' + (aqui('pastas') ? '<a href="pastas.html">As pastas</a>' : '') + (aqui('agora') ? '<a href="hoje.html">Hoje</a>' : '') + '</p>' +
    '</div></section>';
  }

  /* ---------- o saber inteiro: as dez partes, cada uma levando à sua no Atlas ---------- */
  function saber(n) {
    var H = window.HUMANIDADE;
    if (!H || !H.partes) return '';
    var partes = partir(H.partes.map(function (p, i) { return [p, i]; }), n);
    var atlas = aqui('atlas');
    return partes.map(function (lista, k) {
      return '<section class="in-saber in-tela"' + (k === 0 ? ' data-secao="saber" data-rotulo="O saber inteiro" aria-labelledby="in-saber-t"' : ' aria-label="O saber inteiro, ' + (k + 1) + ' de ' + partes.length + '"') + '><div class="in-tela-in">' +
        (k === 0 ? '<p class="rot">Todo o saber humano, em dez partes</p><h2 class="h2" id="in-saber-t">O saber inteiro</h2>' : '<p class="rot">O saber inteiro · ' + (k + 1) + ' de ' + partes.length + '</p>') +
        '<ol class="in-dez" start="' + (lista[0][1] + 1) + '">' + lista.map(function (x) {
          var dentro = '<b>' + esc(x[0].nome) + '</b><span>' + esc(x[0].frase) + '</span>';
          return '<li>' + (atlas ? '<a href="atlas.html#ver=saber&amp;parte=' + x[1] + '">' + dentro + '</a>' : '<div>' + dentro + '</div>') + '</li>';
        }).join('') + '</ol>' +
        (k === partes.length - 1 ? '<p class="in-assina">As dez partes são as do Círculo do Saber da Propædia (Mortimer Adler, Encyclopædia Britannica, 1974).</p>' : '') +
      '</div></section>';
    }).join('');
  }

  /* ---------- a utopia, nas palavras dele ---------- */
  var FRASE = '';
  function utopia(n) {
    var u = '<section class="in-utopia in-tela" data-secao="utopia" data-rotulo="O que queremos" aria-labelledby="in-utopia-t"' + (FRASE ? '' : ' hidden') + '><div class="in-tela-in">' +
      '<p class="rot">O máximo da utopia</p><h2 class="h2" id="in-utopia-t">O que queremos</h2>' +
      '<blockquote class="in-frase"><p id="in-frase">' + esc(FRASE) + '</p></blockquote>' +
      '<p class="in-assina"><a href="manifesto.html#mf-xvi">Vitor de Mantova, A revolução ontológica</a></p>' +
    '</div></section>';
    /* a última tela divide o espaço com os créditos; quando não dá (o celular pequeno), o fecho fica com eles:
       a página começa e termina no Quadrado, o todo */
    if (n === 2) u += '<section class="in-fecho in-tela" aria-label="O fecho"><div class="in-tela-in">' +
      '<button type="button" class="in-q in-q-fecho" data-abrir-indice aria-label="O mapa de tudo"><span aria-hidden="true"></span></button><p>O mapa de tudo</p></div></section>';
    return u;
  }

  /* ---------- a Terra agora ---------- */
  function terra() {
    return '<section class="in-terra in-tela" data-secao="terra" data-rotulo="A Terra agora" aria-labelledby="in-terra-t"><div class="in-tela-in">' +
      '<p class="rot">O dia e a noite deste minuto</p><h2 class="h2" id="in-terra-t">A Terra agora</h2>' +
      '<div class="in-terra-mapa" id="in-terra"></div>' +
    '</div></section>';
  }

  raiz.innerHTML = boas() + '<div class="in-partes" data-mapas></div>' + terra() + '<div class="in-partes" data-agora></div>' + '<div class="in-partes" data-fazer></div>' + seuDia() +
    '<div class="in-partes" data-saber></div>' + '<div class="in-partes" data-utopia></div>';
  /* as seções que se dividem em mais telas quando a altura não dá: o jeito com menos telas que caiba */
  var PARTIVEIS = [
    { el: raiz.querySelector('[data-mapas]'), jeitos: function () { return innerWidth > 760 ? ['espelho', 'dois', 'quatro'] : ['dois', 'quatro']; }, desenhar: mapa },
    { el: raiz.querySelector('[data-agora]'), jeitos: function () { return innerWidth > 760 ? [1, 2, 3] : [2, 3, 5]; }, desenhar: mundoAgora },
    { el: raiz.querySelector('[data-fazer]'), jeitos: function () { return [1, 2]; }, desenhar: fazer },
    { el: raiz.querySelector('[data-saber]'), jeitos: function () { return [1, 2]; }, desenhar: saber },
    { el: raiz.querySelector('[data-utopia]'), jeitos: function () { return [1, 2]; }, desenhar: utopia },
  ];
  /* o primeiro desenho já vem com tudo (o jeito certo para a altura se confirma logo abaixo, em arrumar) */
  PARTIVEIS.forEach(function (pt) { pt.atual = pt.jeitos()[0]; pt.el.innerHTML = pt.desenhar(pt.atual); });
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
    FRASE = frase.replace(/\*\*?([^*]+)\*\*?/g, '$1');
    var pu = PARTIVEIS[PARTIVEIS.length - 1];
    pu.el.innerHTML = utopia(pu.atual);
    arrumar(true);
  });

  if (window.TerraAgora) window.TerraAgora.montar(document.getElementById('in-terra'), { rotulo: publico ? 'Campinas' : '' });

  if (raiz.querySelector('.in-seu')) {
    fetch('/api/pastas', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
      if (!d || !d.pastas) return;
      var pl = (d.plano && d.plano.pastas) || {};
      var foco = d.pastas.filter(function (p) { return pl[p.nome] && pl[p.nome].grupo === 'Em foco' && pl[p.nome].proximo; });
      if (!foco.length) return;
      var linha = function (s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); };
      document.getElementById('in-passos').innerHTML = foco.map(function (p) {
        return '<li><a href="pastas.html#p=' + encodeURI(p.nome) + '"><b>' + esc(p.nome) + '</b></a><span>' + linha(pl[p.nome].proximo) + '</span></li>';
      }).join('') + '<li class="in-passo-depois"><span>Depois, um passo de <b>A obra</b>; à noite, o Registro.</span></li>';
      var risco = d.pastas.filter(function (p) { return !p.git || p.git.semRemoto; }).length;
      if (risco) { var c = document.getElementById('in-cuidado'); c.textContent = risco + (risco === 1 ? ' pasta só existe' : ' pastas só existem') + ' neste computador.'; c.hidden = false; }
      raiz.querySelector('.in-seu').hidden = false;
      arrumar(false);
    });
  }

  /* ---------- as telas: cada seção cabe inteira entre a barra de cima e as de baixo ---------- */
  var doc = document.documentElement;
  var BOM = 0.86;     /* precisando encolher mais que isto, o mapa se divide em mais telas */
  var MINIMO = 0.7;   /* e a letra nunca fica menor que isto */
  var toque = window.matchMedia && matchMedia('(pointer: coarse)').matches;
  var menorAltura = {}, largura = 0, altura = 0, pedido = 0, refazerPedido = false;

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
    var risco = document.getElementById('b-risco');
    /* 27/out: no celular, o menu de baixo se fecha ao descer e, aqui, só reabre na primeira tela (perfil.js):
       nas outras telas fica só o risco, no pé (casca.css), e o lugar guardado é só o dele */
    var fechado = -1;
    if (abas && getComputedStyle(abas).display !== 'none') {
      /* aberto: do alto do menu ao pé (a medida da caixa, sem o deslize do fechado) */
      pe = Math.max(pe, (parseFloat(getComputedStyle(abas).bottom) || 0) + abas.offsetHeight);
      if (risco) fechado = (parseFloat(getComputedStyle(abas).bottom) || 0) + risco.offsetHeight;
    }
    var peFechado = fechado >= 0 ? Math.min(pe, fechado) : pe;
    var cred = document.querySelector('.creditos-linha');
    var hc = cred ? cred.getBoundingClientRect().height : 0;
    doc.style.setProperty('--in-topo', topo + 'px');
    doc.style.setProperty('--in-pe-1', Math.ceil(pe) + 'px');
    doc.style.setProperty('--in-pe', Math.ceil(peFechado) + 'px');
    doc.style.setProperty('--in-cred', Math.ceil(hc) + 'px');
    /* no celular, a conta usa a menor altura vista nesta largura (com as barras do navegador à mostra):
       quando elas somem, a tela cresce em volta do conteúdo, sem a letra mudar de tamanho */
    menorAltura[innerWidth] = Math.min(menorAltura[innerWidth] || Infinity, innerHeight);
    return { topo: topo, pe: Math.ceil(peFechado), cred: Math.ceil(hc), altura: toque ? menorAltura[innerWidth] : innerHeight };
  }

  /* a última tela visível divide a tela com a linha dos créditos */
  function marcarUltima() {
    var vis = Array.prototype.filter.call(raiz.querySelectorAll('.in-tela'), function (t) { return !t.hidden; });
    vis.forEach(function (t, i) { t.classList.toggle('in-ultima', i === vis.length - 1); });
  }
  /* o espaço de dentro de uma tela */
  function livre(t, c) {
    var cs = getComputedStyle(t);
    var alto = c.altura - c.topo - (t.classList.contains('in-ultima') ? c.cred + c.pe : 0);
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

  /* cada seção partível: o jeito com menos telas em que tudo cabe sem encolher demais */
  function escolherJeito(pt, c) {
    var jeitos = pt.jeitos();
    for (var i = 0; i < jeitos.length; i++) {
      if (pt.atual !== jeitos[i]) { pt.el.innerHTML = pt.desenhar(jeitos[i]); pt.atual = jeitos[i]; }
      marcarUltima();
      var cabe = Array.prototype.every.call(pt.el.querySelectorAll('.in-tela'), function (t) { return precisa(t, c) >= BOM; });
      if (cabe) return;
    }
  }

  function arrumar(refazer) {
    /* um pedido de refazer não se perde quando outro, sem refazer, chega antes do quadro (a frase e as pastas
       chegam quase juntas: era a utopia sem o fecho no celular pequeno) */
    refazerPedido = refazerPedido || !!refazer;
    cancelAnimationFrame(pedido);
    pedido = requestAnimationFrame(function () {
      refazer = refazerPedido; refazerPedido = false;
      var c = medirCasca();
      /* o jeito do mapa muda com a largura (girar o celular) ou com uma janela bem mais baixa ou mais alta;
         no celular, as barras do navegador que vêm e vão não mexem nele */
      marcarUltima();
      if (refazer || innerWidth !== largura || (!toque && Math.abs(innerHeight - altura) > 120)) {
        largura = innerWidth; altura = innerHeight;
        var antes = PARTIVEIS.map(function (pt) { return pt.atual; }).join();
        PARTIVEIS.forEach(function (pt) { escolherJeito(pt, c); });
        if (PARTIVEIS.map(function (pt) { return pt.atual; }).join() !== antes && window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
      }
      marcarUltima();
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
