/* ============================================================
   AS ENERGIAS (22/out/2026, registro 116) — a segunda página do atlas digital
   "quero o atlas mais parecido com um atlas digital… todas as energias…"

   · A lei: a energia total não muda, só muda de forma (e o que vem disso).
   · As formas: oito, cada uma com um desenho feito aqui, a fórmula quando o livro dá uma
     e um exemplo; "no que vira" leva às transformações dela.
   · Como uma vira a outra: uma usina a carvão de ponta a ponta e as passagens descritas
     nas fontes, com filtro por forma.
   · De onde vem: cada fonte de energia no caminho da origem (o Sol, a Lua, o calor de
     dentro da Terra, os átomos) até nós, com filtro por renovável. "Renovável" só aparece
     quando a fonte diz.
   · Os números de agora ficam nas fontes abertas (envelhecem; aqui, só os links).
   Os textos e as fontes estão em energias-dados.js. Funciona sem internet.
   ============================================================ */
(function () {
  'use strict';
  var E = window.ENERGIAS;
  var raiz = document.getElementById('en');
  if (!raiz) return;
  if (!E) { raiz.innerHTML = '<p class="rot">Não consegui abrir as energias.</p>'; return; }
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CALMO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FORMA = {}, FONTE = {}, ORIGEM = {};
  E.formas.forEach(function (f) { FORMA[f[0]] = f; });
  E.fontesDeEnergia.forEach(function (f) { FONTE[f[0]] = f; });
  E.origensDe.forEach(function (o) { ORIGEM[o[0]] = o; });
  var KS = Object.keys(E.fontes);
  function fonteLink(ids) {
    return [].concat(ids).map(function (f) { return '<a class="vd-fonte" href="#fonte-' + f + '" title="' + esc(E.fontes[f] ? E.fontes[f][0] : f) + '">' + (KS.indexOf(f) + 1) + '</a>'; }).join('');
  }
  var estado = { forma: '', fonte: '' };

  /* ================================================================
     OS DESENHOS (feitos aqui; o traço se desenha quando o cartão chega)
     ================================================================ */
  var T = 'class="en-traco" pathLength="1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';
  var C = 'class="en-traco vd-d-cheio" pathLength="1"';
  var TR = 'class="en-tracejado" fill="none" stroke="currentColor" stroke-width=".9" stroke-dasharray="2.5 2.5"';
  var PONTO = 'fill="currentColor"';
  function svg(corpo, vb) { return '<svg viewBox="' + (vb || '0 0 120 120') + '" aria-hidden="true" focusable="false">' + corpo + '</svg>'; }
  function seta(x1, y1, x2, y2) {
    var a = Math.atan2(y2 - y1, x2 - x1), p = function (d) { return (x2 + 6 * Math.cos(a + d)).toFixed(1) + ' ' + (y2 + 6 * Math.sin(a + d)).toFixed(1); };
    return '<path ' + T + ' d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' M' + p(Math.PI * .82) + ' L' + x2 + ' ' + y2 + ' L' + p(-Math.PI * .82) + '"/>';
  }
  function rot(x, y, t) { return '<text x="' + x + '" y="' + y + '" class="vd-d-rot en-d-rot">' + t + '</text>'; }
  function chao(y) { var h = ''; for (var x = 16; x < 112; x += 14) h += 'M' + x + ' ' + (y + 6) + ' L' + (x + 7) + ' ' + y + ' '; return '<path ' + T + ' d="M8 ' + y + ' L112 ' + y + '"/><path class="en-tracejado" fill="none" stroke="currentColor" stroke-width=".7" d="' + h + '"/>'; }
  function onda(x0, x1, y, A, L) { var d = 'M' + x0 + ' ' + y; for (var x = x0 + 2; x <= x1; x += 2) d += ' L' + x + ' ' + (y - A * Math.sin((x - x0) / L * 2 * Math.PI)).toFixed(1); return '<path ' + T + ' d="' + d + '"/>'; }
  function raios(cx, cy, r1, r2, n) { var d = ''; for (var i = 0; i < n; i++) { var a = i / n * 2 * Math.PI; d += 'M' + (cx + r1 * Math.cos(a)).toFixed(1) + ' ' + (cy + r1 * Math.sin(a)).toFixed(1) + ' L' + (cx + r2 * Math.cos(a)).toFixed(1) + ' ' + (cy + r2 * Math.sin(a)).toFixed(1) + ' '; } return '<path ' + T + ' d="' + d + '"/>'; }
  var DESENHOS = {
    /* a bola que corre, com as linhas da velocidade */
    cinetica: function () { return svg(chao(96) + '<circle ' + C + ' cx="80" cy="76" r="20"/>' + '<path ' + T + ' d="M20 62 L50 62 M12 76 L50 76 M24 90 L50 90"/>' + seta(62, 36, 100, 36) + rot(103, 39, 'v') + rot(76, 80, 'm')); },
    /* o bloco no alto, a régua da altura e a gravidade para baixo */
    gravitacional: function () { return svg(chao(100) + '<rect ' + C + ' x="30" y="20" width="30" height="24"/>' + rot(41, 35, 'm') + seta(45, 52, 45, 80) + rot(50, 72, 'g') + '<path ' + TR + ' d="M84 44 L84 100"/><path ' + T + ' d="M78 44 L90 44"/>' + rot(90, 76, 'h')); },
    /* a mola presa na parede, esticada de x */
    elastica: function () { return svg('<path ' + T + ' d="M16 36 L16 96 L112 96"/><path class="en-tracejado" fill="none" stroke="currentColor" stroke-width=".7" d="M10 44 L16 38 M10 56 L16 50 M10 68 L16 62 M10 80 L16 74 M10 92 L16 86"/>' + '<path ' + T + ' d="M16 76 L24 76 L28 64 L36 88 L44 64 L52 88 L60 64 L64 76 L72 76"/>' + '<rect ' + C + ' x="72" y="60" width="28" height="32"/>' + '<path ' + TR + ' d="M58 46 L58 96"/>' + seta(58, 48, 72, 48) + rot(62, 42, 'x')); },
    /* uma molécula, e a energia que sai dela numa reação */
    quimica: function () { return svg('<path ' + T + ' d="M40.7 75.3 L30.4 85.6 M63.3 75.3 L73.6 85.6"/>' + '<circle ' + C + ' cx="52" cy="64" r="16"/><circle ' + C + ' cx="24" cy="92" r="9"/><circle ' + C + ' cx="80" cy="92" r="9"/>' + '<path ' + T + ' d="M78 44 L90 32 M84 54 L100 50 M70 38 L74 24"/>'); },
    /* as moléculas soltas na caixa, cada uma para um lado */
    termica: function () {
      var P = [[34, 40, 20], [60, 36, 150], [86, 44, 260], [30, 64, 300], [56, 62, 80], [84, 70, 200], [38, 88, 120], [64, 86, 340], [88, 92, 230]];
      return svg('<rect ' + T + ' x="16" y="22" width="88" height="82" rx="3"/>' + P.map(function (p) { var a = p[2] * Math.PI / 180; return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" ' + PONTO + '/>' + seta(p[0], p[1], +(p[0] + 13 * Math.cos(a)).toFixed(1), +(p[1] + 13 * Math.sin(a)).toFixed(1)); }).join(''));
    },
    /* o circuito: a pilha, o fio e a resistência */
    eletrica: function () { return svg('<path ' + T + ' d="M24 90 L24 38 L48 38 L52 30 L58 46 L64 30 L70 46 L74 38 L96 38 L96 90 L66 90"/><path ' + T + ' d="M58 90 L24 90"/>' + '<path ' + T + ' stroke-width="1.6" d="M66 80 L66 100"/><path ' + T + ' stroke-width="3" d="M58 84 L58 96"/>' + rot(70, 82, '+') + rot(48, 82, '−') + seta(96, 56, 96, 72)); },
    /* o Sol e a onda que sai dele */
    radiante: function () { return svg('<circle ' + C + ' cx="24" cy="60" r="11"/>' + raios(24, 60, 15, 20, 8) + onda(42, 100, 60, 14, 19) + seta(100, 60, 112, 60)); },
    /* o núcleo, prótons cheios e nêutrons vazados, e a energia saindo */
    nuclear: function () {
      var N = [[48, 60, 1], [59, 60, 0], [53.5, 69.5, 1], [42.5, 69.5, 0], [37, 60, 1], [42.5, 50.5, 0], [53.5, 50.5, 1]];
      return svg(N.map(function (p) { return p[2] ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.6" ' + PONTO + '/>' : '<circle ' + C + ' cx="' + p[0] + '" cy="' + p[1] + '" r="5.6"/>'; }).join('') + seta(70, 50, 92, 36) + seta(72, 60, 100, 60) + seta(70, 70, 92, 84) + raios(48, 60, 24, 28, 12));
    },
  };
  /* as origens, em ícone pequeno (sem elipse: a lua é um crescente de dois círculos) */
  var GLIFOS = {
    sol: function () { return svg('<circle ' + C + ' cx="24" cy="24" r="8"/>' + raios(24, 24, 12, 18, 8), '0 0 48 48'); },
    lua: function () { return svg('<path ' + C + ' d="M25.28 10.06 A14 14 0 1 0 35.92 31.34 A12 12 0 0 1 25.28 10.06 Z"/>', '0 0 48 48'); },
    terra: function () { return svg('<circle ' + T + ' cx="24" cy="24" r="16"/><circle ' + TR + ' cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4.5" ' + PONTO + '/>', '0 0 48 48'); },
    atomo: function () { return svg('<circle ' + T + ' cx="24" cy="24" r="16"/><circle cx="21.5" cy="24" r="3.4" ' + PONTO + '/><circle ' + C + ' cx="26.5" cy="24" r="3.4"/><circle cx="24" cy="19.8" r="3.4" ' + PONTO + '/><circle cx="40" cy="24" r="2.4" ' + PONTO + '/>', '0 0 48 48'); },
  };

  /* ================================================================
     O CABEÇALHO: os números
     ================================================================ */
  var numeros = document.getElementById('en-numeros');
  if (numeros) numeros.innerHTML = E.destaques.map(function (d) { return '<p><b>' + esc(d[0]) + '</b><span>' + esc(d[1]) + fonteLink(d[2]) + '</span></p>'; }).join('');

  /* ================================================================
     AS SEÇÕES
     ================================================================ */
  function cab(id, rotulo, titulo, nota) {
    return '<header class="vd-cab"><div><p class="rot">' + rotulo + '</p><h2 class="h2" id="en-' + id + '-t">' + titulo + '</h2></div>' + (nota ? '<p class="vd-cab-nota">' + nota + '</p>' : '') + '</header>';
  }
  function secLei() {
    return '<section class="vd-sec" id="lei" data-secao="lei" data-rotulo="A lei" aria-labelledby="en-lei-t">' +
      cab('lei', 'O que nunca muda', 'A lei', 'Quatro frases para ler o resto da página: a lei, de onde vem a maior parte da energia, o que a massa tem a ver com isso e o que é eficiência.') +
      '<ol class="en-leis">' + E.lei.map(function (l) { return '<li data-revela><span class="en-lei-n">' + esc(l[0]) + '</span><p>' + esc(l[1]) + fonteLink(l[2]) + '</p></li>'; }).join('') + '</ol>' +
    '</section>';
  }
  function secFormas() {
    return '<section class="vd-sec" id="formas" data-secao="formas" data-rotulo="As formas" aria-labelledby="en-formas-t">' +
      cab('formas', 'Oito formas, e a fórmula quando há uma', 'As formas', 'Cada desenho é feito aqui, a partir da definição; a fórmula é a do livro de física.') +
      '<div class="vd-formas en-formas">' + E.formas.map(function (f, k) {
        return '<figure class="vd-forma en-forma" id="forma-' + f[0] + '" style="--k:' + k + '" data-revela>' +
          '<div class="vd-desenho">' + DESENHOS[f[0]]() + '</div>' +
          '<figcaption><b>' + esc(f[1]) + '</b>' + (f[2] ? '<span class="en-formula">' + esc(f[2]) + '</span>' : '<span class="en-formula en-sem" aria-hidden="true">—</span>') +
            '<span>' + esc(f[3]) + fonteLink(f[5]) + '</span>' +
            '<span class="en-ex">Por exemplo: ' + esc(f[4]) + '.</span>' +
            '<button type="button" class="vd-link en-ver" data-ver-forma="' + f[0] + '">No que vira</button>' +
          '</figcaption></figure>';
      }).join('') + '</div>' +
    '</section>';
  }
  function nomeForma(id) { var s = FORMA[id] ? FORMA[id][1].replace('Potencial ', '') : id; return s.charAt(0).toUpperCase() + s.slice(1); }
  function secVira() {
    var U = E.usina, conta = {};
    E.vira.forEach(function (v) { conta[v[0]] = (conta[v[0]] || 0) + 1; if (v[1] !== v[0]) conta[v[1]] = (conta[v[1]] || 0) + 1; });
    var usina = '<figure class="en-usina" data-revela><figcaption class="rot">Uma usina a carvão, de ponta a ponta</figcaption><ol class="en-usina-fila">' +
      U.formas.map(function (f, i) {
        return '<li class="en-usina-no"><span class="en-usina-d">' + DESENHOS[f]() + '</span><b>' + esc(nomeForma(f)) + '</b></li>' +
          (i < U.passos.length ? '<li class="en-usina-passo" aria-hidden="true"><span>' + esc(U.passos[i]) + '</span></li>' : '');
      }).join('') + '</ol><p class="en-usina-nota">' + esc(U.nota) + fonteLink(U.fontes) + '</p></figure>';
    return '<section class="vd-sec" id="transformacoes" data-secao="transformacoes" data-rotulo="Como uma vira a outra" aria-labelledby="en-transformacoes-t">' +
      cab('transformacoes', 'As transformações', 'Como uma vira a outra', 'A energia total é a mesma antes e depois; só a forma muda. Estas são as passagens descritas nas fontes, uma por linha.') +
      usina +
      '<div class="en-filtro" id="en-vira-filtro" role="group" aria-label="Filtrar por forma"><p class="rot">Ver as passagens de uma forma</p><div class="vd-chips">' +
        '<button type="button" class="chip" data-vira="" aria-pressed="true">Todas</button>' +
        E.formas.map(function (f) { return conta[f[0]] ? '<button type="button" class="chip" data-vira="' + f[0] + '" aria-pressed="false">' + esc(nomeForma(f[0])) + ' <small>' + conta[f[0]] + '</small></button>' : ''; }).join('') +
      '</div></div>' +
      '<ol class="en-vira" id="en-vira">' + E.vira.map(function (v) {
        return '<li data-de="' + v[0] + '" data-para="' + v[1] + '"><span class="en-v-par"><b data-f="' + v[0] + '">' + esc(nomeForma(v[0])) + '</b><span class="en-v-seta" aria-label="vira">→</span><b data-f="' + v[1] + '">' + esc(nomeForma(v[1])) + '</b></span><span class="en-v-como">' + esc(v[2]) + fonteLink(v[3]) + '</span></li>';
      }).join('') + '</ol>' +
    '</section>';
  }
  function selos(f) {
    var s = [];
    if (f[4] === true) s.push('renovável'); else if (f[4] === false) s.push('não renovável');
    if (f[5] !== 'em uso') s.push(f[5]);
    return s.map(function (x) { return '<span class="en-selo">' + esc(x) + '</span>'; }).join('');
  }
  function cartaoFonte(id) {
    var f = FONTE[id];
    return '<article class="en-elo" id="fonte-de-' + id + '" data-fonte="' + id + '" data-revela><header><b>' + esc(f[2]) + '</b>' + selos(f) + '</header><p>' + esc(f[3]) + fonteLink(f[6]) + '</p></article>';
  }
  var FILTROS = [['', 'Todas'], ['renovavel', 'Renováveis'], ['nao', 'Não renováveis'], ['teste', 'Em teste ou em desenvolvimento']];
  function passa(f, filtro) { return !filtro || (filtro === 'renovavel' && f[4] === true) || (filtro === 'nao' && f[4] === false) || (filtro === 'teste' && f[5] !== 'em uso'); }
  function secCaminho() {
    return '<section class="vd-sec" id="caminho" data-secao="caminho" data-rotulo="De onde vem" aria-labelledby="en-caminho-t">' +
      cab('caminho', 'As fontes de energia, da origem até nós', 'De onde vem', '“Renovável” só aparece quando a fonte citada diz.') +
      '<div class="en-filtro" role="group" aria-label="Filtrar as fontes"><div class="vd-chips">' + FILTROS.map(function (x) { return '<button type="button" class="chip" data-filtro-fonte="' + x[0] + '" aria-pressed="' + (x[0] === estado.fonte) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div>' +
        '<p class="en-filtro-txt" id="en-filtro-txt" aria-live="polite"></p></div>' +
      '<div class="en-origens">' + E.origensDe.map(function (o) {
        var cams = E.caminhos.filter(function (c) { return c[0] === o[0]; });
        return '<div class="en-origem" data-origem="' + o[0] + '"><header class="en-origem-cab" data-revela><span class="en-glifo">' + GLIFOS[o[0]]() + '</span><h3>' + esc(o[1]) + '</h3><p>' + esc(o[2]) + '</p></header>' +
          '<ol class="en-cams">' + cams.map(function (c) {
            var elos = c[2].map(cartaoFonte), meio = c[3] ? '<span class="en-meio"><i aria-hidden="true">→</i><small>' + esc(c[3]) + '</small></span>' : '';
            return '<li class="en-cam"><span class="en-passo">' + esc(c[1]) + '</span><div class="en-elos">' + elos[0] + (elos[1] ? meio + elos[1] : '') + '</div></li>';
          }).join('') + '</ol></div>';
      }).join('') + '</div>' +
      '<p class="en-fundo" data-revela>' + esc(E.noFundo[0]) + fonteLink(E.noFundo[1]) + '</p>' +
    '</section>';
  }
  function secNumeros() {
    return '<section class="vd-sec" id="numeros" data-secao="numeros" data-rotulo="Os números de agora" aria-labelledby="en-numeros-t">' +
      cab('numeros', 'Quanto o mundo usa de cada uma', 'Os números de agora', 'Os números de consumo mudam todo ano, e por isso não ficam nesta página: ficam nas fontes abertas abaixo, que se atualizam sozinhas.') +
      '<ul class="en-links">' + E.numeros.map(function (x) { return '<li data-revela><a href="' + esc(x[1]) + '" target="_blank" rel="noopener"><b>' + esc(x[0]) + '</b><span>' + esc(x[2]) + '</span><i aria-hidden="true">↗</i></a></li>'; }).join('') + '</ul>' +
      '<p class="en-ver-tambem">No Portal: <a href="vida.html">A vida</a>, os seres vivos que guardam a luz do Sol, e <a href="iluminacao.html">A Luz</a>, todas as alternativas de iluminação.</p>' +
    '</section>';
  }
  function secFontes() {
    return '<section class="vd-sec" id="fontes-energias" data-secao="fontes" data-rotulo="As fontes" aria-labelledby="en-fontes-t">' +
      cab('fontes', 'De onde vem cada frase', 'As fontes', 'Conferidas no texto de cada fonte em 22 de outubro de 2026. Os livros da OpenStax são abertos e gratuitos; os números dos livros de 2006 ficaram de fora.') +
      '<ol class="vd-fontes">' + KS.map(function (k) { var f = E.fontes[k]; return '<li id="fonte-' + k + '"><a href="' + esc(f[1]) + '" target="_blank" rel="noopener">' + esc(f[0]) + '</a><span>' + esc(f[2]) + '</span></li>'; }).join('') + '</ol>' +
    '</section>';
  }
  raiz.innerHTML = secLei() + secFormas() + secVira() + secCaminho() + secNumeros() + secFontes();

  /* ================================================================
     OS FILTROS
     ================================================================ */
  function pintarVira() {
    raiz.querySelectorAll('[data-vira]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vira') === estado.forma)); });
    raiz.querySelectorAll('#en-vira li').forEach(function (li) {
      var tem = !estado.forma || li.getAttribute('data-de') === estado.forma || li.getAttribute('data-para') === estado.forma;
      li.classList.toggle('apagado', !tem);
      li.querySelectorAll('b[data-f]').forEach(function (b) { b.classList.toggle('en-esta', !!estado.forma && b.getAttribute('data-f') === estado.forma); });
    });
  }
  function pintarFontes() {
    raiz.querySelectorAll('[data-filtro-fonte]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filtro-fonte') === estado.fonte)); });
    var n = 0;
    raiz.querySelectorAll('.en-elo').forEach(function (el) { var ok = passa(FONTE[el.getAttribute('data-fonte')], estado.fonte); el.classList.toggle('apagado', !ok); if (ok) n++; });
    var conta = function (fl) { return E.fontesDeEnergia.filter(function (f) { return passa(f, fl); }).length; };
    document.getElementById('en-filtro-txt').textContent = estado.fonte
      ? n + ' de ' + E.fontesDeEnergia.length + ' fontes.'
      : conta('renovavel') + ' renováveis, ' + conta('nao') + ' não renováveis e ' + conta('teste') + ' ainda em teste ou em desenvolvimento, segundo as fontes citadas.';
  }

  raiz.addEventListener('click', function (ev) {
    var b;
    if ((b = ev.target.closest('[data-vira]'))) { estado.forma = b.getAttribute('data-vira'); pintarVira(); return; }
    if ((b = ev.target.closest('[data-ver-forma]'))) {
      estado.forma = b.getAttribute('data-ver-forma'); pintarVira();
      var alvo = document.getElementById('en-vira-filtro');
      if (alvo) alvo.scrollIntoView({ behavior: CALMO ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if ((b = ev.target.closest('[data-filtro-fonte]'))) { estado.fonte = b.getAttribute('data-filtro-fonte'); pintarFontes(); }
  });

  pintarVira(); pintarFontes();
  if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
})();
