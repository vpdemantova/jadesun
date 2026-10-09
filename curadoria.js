/* ============================================================
   CURADORIA — a página (09/out/2026, PERFIL.md item 74)
   Lista os posts (os do app e os que moram no caderno) e mostra um post inteiro:
   a capa, quem curou, como foi feito, a abertura, a linhagem, as partes (com o que ouvir,
   o que ler e as fontes), o glossário (filtros por área e por sentimento), a linha do tempo
   (a régua expande o tempo recente) e as ramificações (quem liga a quem).
   ?p=slug abre um post; #g-termo leva a um termo do glossário.
   Item 75: quando o post mora no caderno, a página mostra a versão de lá (curadoria-md.js lê o .md
   inteiro de volta): o que o curador muda no Obsidian aparece aqui, e o que não deu para entender
   vira um aviso no alto do post.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil, C = window.CURADORIA, MDC = window.CuradoriaMD;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function md(t) { return esc(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function ano(a) { return a < 0 ? Math.abs(a) + ' a.C.' : String(a); }
  function dataExt(iso) { var p = String(iso || '').split('-'); if (p.length < 3) return iso || ''; var M = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']; return +p[2] + ' de ' + M[+p[1] - 1] + ' de ' + p[0]; }
  function mov() { return document.documentElement.getAttribute('data-mov') === 'off' ? 'auto' : 'smooth'; }
  function busca(q) { return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q); }
  var corArea = {}; (C ? C.areas : []).forEach(function (a) { corArea[a[0]] = a[2]; });
  var nomeArea = {}; (C ? C.areas : []).forEach(function (a) { nomeArea[a[0]] = a[1]; });

  var raiz = document.getElementById('cu');
  var postsCaderno = [], curadorFicha = null;
  var EST = window.JADESUN_ESTATICO || null, PUBLICO = !!(EST && EST.modo === 'publico');

  /* ---------- os posts: o do caderno (lido de volta) vale mais que o do app ---------- */
  function lerDoCaderno(v) {
    if (!MDC || !v || !v.bruto) return null;
    var r = MDC.ler(v.bruto, C.areas);
    if (!r.estruturado) return null;
    var app = C.posts.filter(function (x) { return x.slug === r.post.slug; })[0] || null;
    var p = Object.assign({}, app || {}, r.post);
    p.curador = Object.assign({}, app ? app.curador : {}, r.post.curador.nome ? r.post.curador : {});
    if (!p.capa) p.capa = app ? app.capa : { cor: '#14130F', sol: '#E9822A' };
    p._caderno = v; p._problemas = r.problemas;
    return p;
  }
  function postsEfetivos() {
    var lidos = postsCaderno.map(lerDoCaderno).filter(Boolean);
    var porSlug = {}; lidos.forEach(function (p) { porSlug[p.slug] = p; });
    var lista = C.posts.map(function (p) { return porSlug[p.slug] || p; });
    lidos.forEach(function (p) { if (!C.posts.some(function (a) { return a.slug === p.slug; })) lista.push(p); });
    return lista;
  }
  function numero(p) { return p.numero ? 'Curadoria nº ' + p.numero + ' · ' : 'Curadoria · '; }

  /* ---------- a lista ---------- */
  function htmlLista(atual) {
    var efetivos = postsEfetivos();
    var dosApp = efetivos.map(function (p) {
      return '<a class="cu-card cu-card-destaque' + (p.slug === atual ? ' atual' : '') + '" href="?p=' + esc(p.slug) + '#post">' +
        '<span class="cu-card-capa" aria-hidden="true"><i class="cu-q"></i><i class="cu-s"></i></span>' +
        '<span class="cu-card-txt"><span class="rot">' + numero(p) + esc(dataExt(p.data)) + '</span><b>' + esc(p.titulo) + '</b><span>' + esc(p.sub) + '</span>' +
        '<span class="cu-card-quem">' + esc(p.curador.nome) + ' · ' + (p._caderno ? 'no caderno' : esc(p.estado)) + '</span></span></a>';
    });
    var doCaderno = postsCaderno.filter(function (x) { return !efetivos.some(function (p) { return p.slug === x.slug; }); }).map(function (x) {
      return '<a class="cu-card' + (x.slug === atual ? ' atual' : '') + '" href="?p=' + esc(x.slug) + '#post"><span class="cu-card-txt"><span class="rot">' + esc(dataExt(x.data)) + ' · do caderno</span><b>' + esc(x.titulo) + '</b><span class="cu-card-quem">' + esc(x.curador || 'sem curador no cabeçalho') + '</span></span></a>';
    });
    return '<div class="cu-cards">' + dosApp.concat(doCaderno).join('') + '</div>';
  }

  /* ---------- quem curou: a ficha (Rede da Vida) ou o nome do post ---------- */
  function htmlCurador(p) {
    var f = curadorFicha && curadorFicha.nome ? curadorFicha : null;
    var nome = f ? f.nome : p.curador.nome;
    var linha = f ? [f.oficio, f.onde].filter(Boolean).join(' · ') : 'a ficha dele nasce na aba Eu';
    var ini = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(function (x) { return x[0].toUpperCase(); }).join('');
    return '<div class="cu-curador"><span class="cu-curador-q" aria-hidden="true">' + esc(ini) + '</span><span><span class="rot">curadoria de</span><b>' + esc(nome) + '</b><small>' + esc(linha) + '</small></span>' +
      (p.curador.ficha ? '<a class="botao leve" href="' + esc(PUBLICO ? 'vitrine.html' : p.curador.ficha) + '">' + ic('ficha') + 'Ver a ficha</a>' : '') + '</div>';
  }

  /* ---------- o post ---------- */
  function htmlPost(p) {
    var toc = [['abertura', 'A abertura'], ['linhagem', 'A linhagem']].concat(p.partes.map(function (x, i) { return [x.id, (i + 1) + ' · ' + x.titulo]; }))
      .concat([['glossario', 'O glossário'], ['linha', 'A linha do tempo'], ['ramificacoes', 'As ramificações'], ['perguntas', 'Para você']]);
    return '<article class="cu-post" id="post" aria-labelledby="cu-t">' +
      '<header class="cu-capa"><div class="cu-capa-arte" aria-hidden="true"><i class="cu-capa-sol"></i><i class="cu-capa-q"></i></div>' +
        '<div class="cu-capa-txt"><p class="cu-capa-n">' + numero(p) + esc(dataExt(p.data)) + '</p><h2 class="cu-capa-t" id="cu-t">' + esc(p.titulo) + '</h2><p class="cu-capa-sub">' + esc(p.sub) + '</p>' +
        '<p class="cu-capa-estado">' + esc(p.estado) + '</p>' +
        (p._caderno && !PUBLICO ? '<p class="cu-capa-origem">' + ic('livro') + '<span>Lido do caderno: ' + esc(p._caderno.rel) + ' · editado em ' + esc(new Date(p._caderno.modificado).toLocaleDateString('pt-BR')) + '</span></p>' : '') +
        '</div></header>' +
      (p._problemas && p._problemas.length && !EST ? '<details class="cu-problemas"><summary>' + p._problemas.length + (p._problemas.length === 1 ? ' coisa' : ' coisas') + ' do arquivo que o app não entendeu (o arquivo não muda)</summary><ul>' + p._problemas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>' : '') +
      '<div class="cu-corpo"><nav class="cu-toc" aria-label="Neste post"><p class="rot">Neste post</p><ol>' + toc.map(function (t) { return '<li><a href="#' + t[0] + '" data-toc="' + t[0] + '">' + esc(t[1]) + '</a></li>'; }).join('') + '</ol>' +
        '<div class="cu-toc-acoes"><button type="button" class="botao" data-acao="md">' + ic('baixar') + 'Baixar .md</button>' +
          (p._caderno ? (p._caderno.abs ? '<a class="botao" href="obsidian://open?path=' + encodeURIComponent(String(p._caderno.abs).replace(/\\/g, '/')) + '">' + ic('editar') + 'Abrir no Obsidian</a>' : '')
            : (window.JADESUN_ESTATICO ? '' : '<button type="button" class="botao" data-acao="levar">' + ic('livro') + 'Levar para o caderno</button>')) +
          '<button type="button" class="botao leve" data-acao="link">' + ic('link') + 'Copiar o link</button></div></nav>' +
      '<div class="cu-texto">' + htmlCurador(p) +
        '<aside class="cu-como"><p class="rot">Como esta curadoria foi feita</p><p>' + esc(p.como) + '</p></aside>' +
        '<section class="cu-sec cu-abertura" id="abertura"><h3 class="cu-h">A abertura</h3>' + p.abertura.map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') + '<p class="cu-assina">— ' + esc(p.curador.nome) + '</p></section>' +
        '<section class="cu-sec" id="linhagem"><h3 class="cu-h">A linhagem</h3><p class="cu-lead">Quem "fez o mesmo": levou a música da sua terra para dentro da grande tradição. Em ordem de nascimento, até quem segue.</p>' +
          '<ol class="cu-linhagem">' + p.linhagem.map(function (l) {
            return '<li class="' + (l.voce ? 'cu-voce' : '') + '"><span class="cu-lin-anos">' + esc(l.anos) + '</span><b>' + (l.url ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.nome) + '</a>' : esc(l.nome)) + '</b><span class="cu-lin-terra">' + esc(l.terra) + '</span><span class="cu-lin-obra">' + esc(l.obra) + '</span><span class="cu-lin-fez">' + esc(l.fez) + '</span></li>';
          }).join('') + '</ol></section>' +
        p.partes.map(function (x, i) {
          return '<section class="cu-sec cu-parte" id="' + x.id + '"><p class="cu-parte-n"><span>' + (i + 1) + '</span>' + esc(x.lugar) + '</p><h3 class="cu-h">' + esc(x.titulo) + '</h3><p class="cu-lead">' + md(x.lead) + '</p>' +
            x.texto.map(function (t) { return '<p>' + md(t) + '</p>'; }).join('') +
            '<div class="cu-ouvir-ler"><div><p class="rot">Ouvir</p><ul class="cu-ouvir">' + x.ouvir.map(function (o) { return '<li><a href="' + busca(o[0] + ' ' + o[1]) + '" target="_blank" rel="noopener"><b>' + esc(o[0]) + '</b><span>' + esc(o[1]) + '</span><small>' + esc(o[2]) + '</small></a></li>'; }).join('') + '</ul></div>' +
            '<div><p class="rot">Ler</p><ul class="cu-ler">' + x.ler.map(function (l) { return '<li><b>' + esc(l[1]) + '</b><span>' + esc(l[0]) + ' · ' + esc(l[2]) + '</span></li>'; }).join('') + '</ul></div></div>' +
            '<p class="cu-fontes"><span class="rot">Fontes conferidas</span>' + x.fontes.map(function (f) { return '<a href="' + esc(f[1]) + '" target="_blank" rel="noopener">' + esc(f[0]) + '</a>'; }).join('') + '</p></section>';
        }).join('') +
        '<section class="cu-sec" id="glossario"><h3 class="cu-h">O glossário</h3><p class="cu-lead">' + p.glossario.length + ' palavras que expandem, aproximam e conectam: cada uma com a data, os livros e as vizinhas. Filtre por área ou pelo que ela faz sentir.</p>' +
          '<div class="cu-filtros"><div class="cu-chips" role="group" aria-label="Áreas"><button type="button" class="chip on" data-area="">Todas as áreas</button>' + C.areas.map(function (a) { return '<button type="button" class="chip" data-area="' + a[0] + '" style="--c:' + a[2] + '"><i class="q"></i>' + esc(a[1]) + '</button>'; }).join('') + '</div>' +
          '<div class="cu-chips cu-sentes" role="group" aria-label="Sentimentos"><button type="button" class="chip on" data-sente="">Todos os sentimentos</button>' + sentimentos(p).map(function (s) { return '<button type="button" class="chip" data-sente="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</div>' +
          '<label class="cu-busca">' + ic('buscar') + '<span class="sr">Buscar no glossário</span><input type="search" placeholder="Buscar palavra, autor ou livro"></label></div>' +
          '<div class="cu-glossario">' + p.glossario.map(function (g) { return htmlTermo(g, p); }).join('') + '</div></section>' +
        '<section class="cu-sec" id="linha"><h3 class="cu-h">A linha do tempo</h3><p class="cu-lead">A régua se expande onde a história se adensa: os séculos quietos encolhem, as décadas cheias se abrem. Em cima, o que aconteceu; embaixo, quando nasceu cada palavra do glossário.</p><p class="cu-linha-dica">← role para o passado</p><div class="cu-linha-rolo" data-lenis-prevent>' + svgLinha(p) + '</div></section>' +
        '<section class="cu-sec" id="ramificacoes"><h3 class="cu-h">As ramificações</h3><p class="cu-lead">Cada palavra em volta do círculo, agrupada por área; as linhas ligam as vizinhas. Passe o mouse (ou o dedo) numa palavra para ver com quem ela conversa; toque para ir até ela.</p><div class="cu-rami">' + svgRami(p) + '</div></section>' +
        '<section class="cu-sec cu-perguntas" id="perguntas"><h3 class="cu-h">Para você</h3><ol>' + p.perguntas.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
          '<p class="cu-fim">' + (window.Icones ? window.Icones.quadrado() : '') + 'Portal Solar · Curadoria nº ' + p.numero + ' · ' + esc(dataExt(p.data)) + '</p></section>' +
      '</div></div></article>';
  }
  function sentimentos(p) { var v = []; p.glossario.forEach(function (g) { if (v.indexOf(g.sente) < 0) v.push(g.sente); }); return v; }
  function htmlTermo(g, p) {
    var nomes = {}; p.glossario.forEach(function (x) { nomes[x.id] = x.termo; });
    return '<article class="cu-termo" id="g-' + g.id + '" data-area="' + g.area + '" data-sente="' + esc(g.sente) + '" style="--c:' + corArea[g.area] + '">' +
      '<header><h4>' + esc(g.termo) + '</h4><span class="cu-termo-orig">' + esc(g.original) + '</span></header>' +
      '<p class="cu-termo-meta"><span>' + esc(g.quando) + '</span><span>' + esc(nomeArea[g.area]) + '</span><span class="cu-termo-sente">' + esc(g.sente) + '</span></p>' +
      '<p>' + esc(g.texto) + '</p>' +
      '<ul class="cu-termo-livros">' + g.livros.map(function (l) { return '<li><b>' + esc(l[1]) + '</b> · ' + esc(l[0]) + ', ' + ano(l[2]) + '</li>'; }).join('') + '</ul>' +
      '<p class="cu-termo-liga"><span class="rot">liga com</span>' + g.liga.map(function (id) { return '<a href="#g-' + id + '" data-ir-termo="' + id + '">' + esc(nomes[id] || id) + '</a>'; }).join('') + '</p></article>';
  }

  /* a régua que expande o tempo: posição ~ log(distância até 2040) */
  /* a régua que expande o tempo onde a história se adensa: cada ano marcado ganha espaço parecido
     (séculos vazios encolhem, décadas cheias se abrem), sem perder a ordem nem a proporção geral */
  var ancoras = null;
  function prepararEscala(p) {
    var anos = {}; p.linha.forEach(function (e) { anos[e[0]] = 1; }); p.glossario.forEach(function (g) { anos[Math.min(g.ano, 2025)] = 1; });
    [-600, 2026].forEach(function (a) { anos[a] = 1; });
    var lista = Object.keys(anos).map(Number).sort(function (a, b) { return a - b; });
    var L = function (a) { return Math.log(2046 - a); }, n = lista.length;
    ancoras = lista.map(function (a, i) { var t = 1 - (L(a) - L(2026)) / (L(-600) - L(2026)); return [a, 0.72 * (i / (n - 1)) + 0.28 * t]; });
  }
  function escala(y, W) {
    var A = ancoras; if (!A) return 0;
    if (y <= A[0][0]) return 0; if (y >= A[A.length - 1][0]) return W;
    for (var i = 1; i < A.length; i++) if (y <= A[i][0]) { var t = (y - A[i - 1][0]) / (A[i][0] - A[i - 1][0]); return W * (A[i - 1][1] + (A[i][1] - A[i - 1][1]) * t); }
    return W;
  }
  function svgLinha(p) {
    prepararEscala(p);
    var W = 2600, FILAS = 4, PASSO = 30, Y = 40 + FILAS * PASSO + 20, H = Y + FILAS * PASSO + 90, marcos = [-500, 0, 1000, 1500, 1700, 1800, 1850, 1900, 1950, 2000, 2026];
    var ev = p.linha.slice().sort(function (a, b) { return a[0] - b[0]; });
    var reg = marcos.map(function (m) { var x = escala(m, W - 80) + 40; return '<g class="cu-l-marco"><path d="M' + x.toFixed(1) + ' ' + (Y - 6) + 'v12"/><text x="' + x.toFixed(1) + '" y="' + (Y + 22) + '" text-anchor="middle">' + ano(m) + '</text></g>'; }).join('');
    /* cada rótulo vai para a primeira fileira (em cima ou embaixo) onde cabe sem encostar no anterior */
    var fim = []; for (var f = 0; f < FILAS * 2; f++) fim.push(-1e9);
    var evs = ev.map(function (e) {
      var x = escala(e[0], W - 80) + 40, rot = e[1].length > 30 ? e[1].slice(0, 29) + '…' : e[1], w = Math.max(rot.length, ano(e[0]).length) * 5.9 + 10;
      var ordem = []; for (var k = 0; k < FILAS; k++) { ordem.push(k * 2); ordem.push(k * 2 + 1); }
      var fila = ordem.filter(function (f2) { return fim[f2] < x - w / 2; })[0];
      if (fila == null) { fila = 0; for (var f3 = 1; f3 < fim.length; f3++) if (fim[f3] < fim[fila]) fila = f3; }
      fim[fila] = x + w / 2;
      var cima = fila % 2 === 0, nivel = Math.floor(fila / 2), d = 30 + nivel * PASSO, ty = cima ? Y - d - 14 : Y + d + 26;
      var tx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x)); /* o texto não sai da régua; a haste fica no ano certo */
      return '<g class="cu-l-ev" tabindex="0"><path d="M' + x.toFixed(1) + ' ' + Y + 'V' + (cima ? ty + 18 : ty - 14) + '"/><circle cx="' + x.toFixed(1) + '" cy="' + Y + '" r="4.5"/>' +
        '<text x="' + tx.toFixed(1) + '" y="' + ty + '" text-anchor="middle"><tspan class="cu-l-ano">' + ano(e[0]) + '</tspan><tspan x="' + tx.toFixed(1) + '" dy="13">' + esc(rot) + '</tspan></text><title>' + esc(ano(e[0]) + ' · ' + e[1]) + '</title></g>';
    }).join('');
    var termos = p.glossario.map(function (g) { var x = escala(Math.min(g.ano, 2025), W - 80) + 40; return '<circle class="cu-l-termo" cx="' + x.toFixed(1) + '" cy="' + (H - 18) + '" r="5" style="--c:' + corArea[g.area] + '"><title>' + esc(g.termo + ' · ' + g.quando) + '</title></circle>'; }).join('');
    return '<svg class="cu-linha" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Linha do tempo do post, com escala que expande o tempo recente">' +
      '<path class="cu-l-eixo" d="M40 ' + Y + 'H' + (W - 40) + '"/>' + reg + evs + '<text class="cu-l-rot" x="40" y="' + (H - 34) + '">as palavras do glossário, na data em que nasceram</text>' + termos + '</svg>';
  }
  /* as ramificações: as palavras em volta do círculo, por área; as cordas ligam as vizinhas */
  function svgRami(p) {
    var S = 760, Cx = S / 2, R = 248, lista = [];
    C.areas.forEach(function (a) { p.glossario.filter(function (g) { return g.area === a[0]; }).forEach(function (g) { lista.push(g); }); });
    var n = lista.length, pos = {}, h = '';
    var folgaArea = 0.09, total = Math.PI * 2 - folgaArea * C.areas.length, passo = total / n, ang = -Math.PI / 2, areaAnt = null;
    lista.forEach(function (g) { if (g.area !== areaAnt) { if (areaAnt) ang += folgaArea; areaAnt = g.area; } pos[g.id] = ang; ang += passo; });
    var feitas = {};
    lista.forEach(function (g) {
      g.liga.forEach(function (id) {
        var k = [g.id, id].sort().join('|'); if (feitas[k] || pos[id] == null) return; feitas[k] = 1;
        var a1 = pos[g.id], a2 = pos[id];
        var x1 = Cx + R * Math.cos(a1), y1 = Cx + R * Math.sin(a1), x2 = Cx + R * Math.cos(a2), y2 = Cx + R * Math.sin(a2);
        h += '<path class="cu-r-fio" data-de="' + g.id + '" data-para="' + id + '" d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'Q' + Cx + ' ' + Cx + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" style="--c:' + corArea[g.area] + '"/>';
      });
    });
    var arcos = C.areas.map(function (a) {
      var ids = lista.filter(function (g) { return g.area === a[0]; }); if (!ids.length) return '';
      var a0 = pos[ids[0].id] - passo / 2, a1 = pos[ids[ids.length - 1].id] + passo / 2, r = R + 10;
      var p0 = [Cx + r * Math.cos(a0), Cx + r * Math.sin(a0)], p1 = [Cx + r * Math.cos(a1), Cx + r * Math.sin(a1)];
      var am = (a0 + a1) / 2, pt = [Cx + (R + 118) * Math.cos(am), Cx + (R + 118) * Math.sin(am)];
      return '<path class="cu-r-area" d="M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + '" style="stroke:' + a[2] + '"/>' +
        '<text class="cu-r-area-t" x="' + pt[0].toFixed(1) + '" y="' + pt[1].toFixed(1) + '" text-anchor="middle" style="fill:' + a[2] + '">' + esc(a[1]) + '</text>';
    }).join('');
    var nos = lista.map(function (g) {
      var a = pos[g.id], x = Cx + (R + 22) * Math.cos(a), y = Cx + (R + 22) * Math.sin(a), graus = a * 180 / Math.PI, vira = Math.cos(a) < 0;
      return '<g class="cu-r-no" data-termo="' + g.id + '" tabindex="0" role="link" aria-label="' + esc(g.termo) + '"><circle cx="' + (Cx + R * Math.cos(a)).toFixed(1) + '" cy="' + (Cx + R * Math.sin(a)).toFixed(1) + '" r="4.5" style="fill:' + corArea[g.area] + '"/>' +
        '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" dominant-baseline="middle" text-anchor="' + (vira ? 'end' : 'start') + '" transform="rotate(' + (vira ? graus + 180 : graus).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' + esc(g.termo) + '</text></g>';
    }).join('');
    return '<svg class="cu-r-svg" viewBox="-170 -110 ' + (S + 340) + ' ' + (S + 230) + '" role="group" aria-label="As ramificações do glossário">' + arcos + '<g class="cu-r-fios">' + h + '</g>' + nos + '</svg>';
  }

  /* ---------- o post em Markdown (baixar ou levar para o caderno) ----------
     Item 75: o formato de ida e volta (curadoria-md.js); se o post veio do caderno, baixa o arquivo como está. */
  function markdown(p) {
    if (p._caderno && p._caderno.bruto) return p._caderno.bruto;
    if (MDC) return MDC.escrever(p, C.areas);
    return markdownAntigo(p);
  }
  function markdownAntigo(p) {
    var l = ['# ' + p.titulo, '', '*' + p.sub + '* · Curadoria nº ' + p.numero + ' · ' + dataExt(p.data) + ' · curadoria de ' + p.curador.nome, '', '> ' + p.como, '', '## A abertura', ''];
    p.abertura.forEach(function (t) { l.push(t, ''); });
    l.push('## A linhagem', '');
    p.linhagem.forEach(function (x) { l.push('- **' + x.nome + '** (' + x.anos + ', ' + x.terra + '): ' + x.obra + '. ' + x.fez); });
    p.partes.forEach(function (x, i) {
      l.push('', '## ' + (i + 1) + '. ' + x.titulo + ' — ' + x.lugar, '', '*' + x.lead + '*', '');
      x.texto.forEach(function (t) { l.push(t, ''); });
      l.push('**Ouvir:** ' + x.ouvir.map(function (o) { return o[0] + ', ' + o[1] + ' (' + o[2] + ')'; }).join(' · '), '');
      l.push('**Ler:** ' + x.ler.map(function (o) { return o[0] + ', *' + o[1] + '* (' + o[2] + ')'; }).join(' · '), '');
      l.push('**Fontes:** ' + x.fontes.map(function (f) { return '[' + f[0] + '](' + f[1] + ')'; }).join(' · '));
    });
    l.push('', '## O glossário', '');
    p.glossario.forEach(function (g) {
      l.push('### ' + g.termo + ' (' + g.original + ')', '', '*' + g.quando + ' · ' + nomeArea[g.area] + ' · ' + g.sente + '*', '', g.texto, '');
      g.livros.forEach(function (b) { l.push('- ' + b[0] + ', *' + b[1] + '* (' + ano(b[2]) + ')'); });
      l.push('', 'Liga com: ' + g.liga.join(', '), '');
    });
    l.push('## A linha do tempo', '');
    p.linha.forEach(function (e) { l.push('- ' + ano(e[0]) + ' — ' + e[1]); });
    l.push('', '## Para você', '');
    p.perguntas.forEach(function (q) { l.push('- ' + q); });
    return l.join('\n') + '\n';
  }
  function baixar(nome, texto) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }));
    a.download = nome; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function aviso(t, erro) {
    var el = document.querySelector('.cu-aviso');
    if (!el) { el = document.createElement('div'); el.className = 'cu-aviso dm2-aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + esc(t) + '</span>'; el.classList.toggle('erro', !!erro); el.classList.add('on');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('on'); }, 4200);
  }

  /* ---------- montar ---------- */
  function slugPedido() { return new URLSearchParams(location.search).get('p') || (C.posts[0] && C.posts[0].slug); }
  function desenhar() {
    var slug = slugPedido();
    var p = postsEfetivos().filter(function (x) { return x.slug === slug; })[0];
    var doCaderno = postsCaderno.filter(function (x) { return x.slug === slug; })[0];
    raiz.innerHTML = '<section class="cu-sec-lista" data-secao="lista" data-rotulo="Os posts"><h2 class="h2">Os posts</h2>' + htmlLista(slug) + '</section>' +
      (p ? htmlPost(p) : doCaderno ? '<article class="cu-post cu-post-md" id="post"><header class="cu-capa"><div class="cu-capa-txt"><p class="cu-capa-n">' + esc(dataExt(doCaderno.data)) + ' · do caderno</p><h2 class="cu-capa-t">' + esc(doCaderno.titulo) + '</h2><p class="cu-capa-sub">curadoria de ' + esc(doCaderno.curador || '—') + ' · ' + esc(doCaderno.rel) + '</p></div></header><div class="cu-texto md">' + (window.MD ? window.MD.render(doCaderno.texto) : '<pre>' + esc(doCaderno.texto) + '</pre>') + '</div></article>' : '');
    if (p) ligarPost(p);
  }
  function ligarPost(p) {
    var post = raiz.querySelector('.cu-post');
    /* filtros do glossário */
    var filtro = { area: '', sente: '', q: '' };
    var aplicar = function () {
      var q = filtro.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      post.querySelectorAll('.cu-termo').forEach(function (el) {
        var t = el.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        el.hidden = !((!filtro.area || el.dataset.area === filtro.area) && (!filtro.sente || el.dataset.sente === filtro.sente) && (!q || t.indexOf(q) >= 0));
      });
    };
    post.addEventListener('click', function (ev) {
      var a = ev.target.closest('[data-area]'); if (a && a.tagName === 'BUTTON') { filtro.area = a.dataset.area; post.querySelectorAll('[data-area].chip').forEach(function (b) { b.classList.toggle('on', b === a); }); aplicar(); return; }
      var s = ev.target.closest('button[data-sente]'); if (s) { filtro.sente = s.dataset.sente; post.querySelectorAll('button[data-sente]').forEach(function (b) { b.classList.toggle('on', b === s); }); aplicar(); return; }
      var t = ev.target.closest('[data-ir-termo]'); if (t) { ev.preventDefault(); irTermo(t.dataset.irTermo); return; }
      var n = ev.target.closest('.cu-r-no'); if (n) { irTermo(n.dataset.termo); return; }
      var ac = ev.target.closest('[data-acao]'); if (ac) acao(ac.dataset.acao, p, ac);
    });
    post.querySelector('.cu-busca input').addEventListener('input', function (ev) { filtro.q = ev.target.value.trim(); aplicar(); });
    /* ramificações: acender as vizinhas */
    var rami = post.querySelector('.cu-r-svg');
    var acender = function (id) {
      rami.classList.toggle('foco', !!id);
      rami.querySelectorAll('.cu-r-fio').forEach(function (f) { f.classList.toggle('on', !!id && (f.dataset.de === id || f.dataset.para === id)); });
      var viz = {}; if (id) rami.querySelectorAll('.cu-r-fio.on').forEach(function (f) { viz[f.dataset.de] = viz[f.dataset.para] = 1; });
      rami.querySelectorAll('.cu-r-no').forEach(function (g) { g.classList.toggle('on', !!id && !!viz[g.dataset.termo]); g.classList.toggle('eu', g.dataset.termo === id); });
    };
    rami.addEventListener('pointerover', function (ev) { var g = ev.target.closest('.cu-r-no'); acender(g ? g.dataset.termo : null); });
    rami.addEventListener('pointerleave', function () { acender(null); });
    rami.addEventListener('focusin', function (ev) { var g = ev.target.closest('.cu-r-no'); if (g) acender(g.dataset.termo); });
    rami.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { var g = ev.target.closest('.cu-r-no'); if (g) irTermo(g.dataset.termo); } });
    /* a régua abre no tempo recente (onde mora quase tudo); o passado fica à esquerda, rolando */
    var rolo = post.querySelector('.cu-linha-rolo'); if (rolo) requestAnimationFrame(function () { rolo.scrollLeft = rolo.scrollWidth; });
    /* o sumário acende a seção que está na tela */
    if ('IntersectionObserver' in window) {
      var ob = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) post.querySelectorAll('[data-toc]').forEach(function (a) { a.classList.toggle('on', a.dataset.toc === e.target.id); }); });
      }, { rootMargin: '-30% 0px -60% 0px' });
      post.querySelectorAll('.cu-sec').forEach(function (s) { ob.observe(s); });
    }
  }
  function irTermo(id) {
    var el = document.getElementById('g-' + id); if (!el) return;
    if (el.hidden) { document.querySelectorAll('.cu-termo').forEach(function (x) { x.hidden = false; }); document.querySelectorAll('.cu-filtros .chip').forEach(function (b) { b.classList.toggle('on', !b.dataset.area && !b.dataset.sente); }); }
    el.scrollIntoView({ behavior: mov(), block: 'center' });
    el.classList.remove('pisca'); void el.offsetWidth; el.classList.add('pisca');
    try { history.replaceState(null, '', location.pathname + location.search + '#g-' + id); } catch (e) { /* file: */ }
  }
  function acao(qual, p, botao) {
    if (qual === 'md') { baixar(p.data + ' — ' + p.titulo + '.md', markdown(p)); return; }
    if (qual === 'link') { var u = location.origin + location.pathname + '?p=' + p.slug; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { aviso('Link copiado.'); }, function () { aviso(u); }); return; }
    if (qual === 'levar') {
      botao.disabled = true;
      fetch('/api/curadoria/levar', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Perfil': '1' }, body: JSON.stringify({ slug: p.slug, titulo: p.titulo, data: p.data, curador: p.curador.nome, md: markdown(p) }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.erro || 'Não consegui gravar.'); return j; }); })
        .then(function (j) { aviso('No caderno: ' + j.rel + '. Edite lá à vontade: esta página passa a mostrar o arquivo.'); carregarCaderno().then(desenhar); })
        .catch(function (e) { aviso(e.message, true); botao.disabled = false; });
    }
  }

  function carregarCaderno() {
    return fetch('/api/curadoria', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : { posts: [] }; }).catch(function () { return { posts: [] }; })
      .then(function (d) { postsCaderno = d.posts || []; var l = raiz.querySelector('.cu-sec-lista .cu-cards'); if (l) l.outerHTML = htmlLista(slugPedido()); });
  }
  function carregarCurador() {
    return fetch('/api/vitrine', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
      .then(function (v) { if (v && v.nome) { curadorFicha = v; var c = raiz.querySelector('.cu-curador'); var p = postsEfetivos().filter(function (x) { return x.slug === slugPedido(); })[0]; if (c && p) c.outerHTML = htmlCurador(p); } });
  }

  if (!C || !raiz) return;
  desenhar();
  Promise.all([carregarCaderno(), carregarCurador()]).then(function () {
    var atual = postsEfetivos().filter(function (x) { return x.slug === slugPedido(); })[0];
    if (!C.posts.some(function (x) { return x.slug === slugPedido(); }) || (atual && atual._caderno)) desenhar();
    var h = location.hash;
    if (/^#g-/.test(h)) setTimeout(function () { irTermo(h.slice(3)); }, 200);
    else if (h) { var alvo = document.querySelector(h); if (alvo) setTimeout(function () { alvo.scrollIntoView({ block: 'start' }); }, 120); }
  });
  if (window.Arrumar) window.Arrumar.aplicar();
})();
