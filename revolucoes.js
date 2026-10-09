/* ============================================================
   A LINHA DAS REVOLUÇÕES (09/out/2026, PERFIL.md item 75)
   "Uma linha do tempo dinâmica com todas as revoluções desde a formação da Terra, com destaque nas
   principais revoluções humanas, até chegar na revolução ontológica; que dê para navegar e adicionar
   filtros incluindo outras áreas e assuntos, eventos, pessoas, obras, lugares."

   A régua é do tempo profundo (logarítmica): cada passo para a esquerda é dez vezes mais antigo, e assim
   cabem os 4,54 bilhões de anos da Terra e os últimos 50 anos na mesma faixa. Arrastar anda no tempo;
   a pinça (dois dedos, ou o trackpad) e os botões aproximam; "Ir para" vai direto a um tempo.
   Camadas: as revoluções (sempre) e, se você ligar, os eventos da linha do tempo, as obras e pessoas
   (a Curadoria e os manifestos da humanidade) e os lugares (os museus e fundações do Atlas).
   Tocar numa marca abre a folha dela, com o que aconteceu perto no tempo. Embaixo, a mesma linha em lista.
   Revolucoes.montar(el)
   ============================================================ */
(function () {
  'use strict';

  var R = window.REVOLUCOES;
  if (!R) return;
  var HOJE = R.HOJE;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function lg(atras) { return Math.log10(Math.max(0, atras) + 1); }
  var T_MAX = lg(R.tempos[0].de);
  var LIMITE = { a: T_MAX + 0.12, b: -0.08 };
  var corArea = {}, nomeArea = {};
  R.areas.forEach(function (a) { corArea[a[0]] = a[2]; nomeArea[a[0]] = a[1]; });
  var TIPOS = { revolucao: 'Revolução', evento: 'Evento', pessoa: 'Pessoa', obra: 'Obra', lugar: 'Lugar' };

  /* ---------- o tempo: como escrever "quando" e como se lê a régua ---------- */
  function fmtAtras(atras) {
    if (atras >= 1e9) return 'há ' + (atras / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bilhões de anos';
    if (atras >= 1e6) return 'há ' + (atras / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' milhões de anos';
    if (atras >= 12000) return 'há ' + Math.round(atras / 1000).toLocaleString('pt-BR') + ' mil anos';
    var ano = Math.round(HOJE - atras);
    return ano <= 0 ? (Math.abs(ano) || 1) + ' a.C.' : String(ano);
  }
  function rotuloTique(atras) {
    if (atras < 0.9) return 'agora';
    if (atras >= 1e9) return (atras / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' bi';
    if (atras >= 1e6) return (atras / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi';
    if (atras >= 12000) return Math.round(atras / 1000).toLocaleString('pt-BR') + ' mil';
    var ano = Math.round(HOJE - atras);
    return ano <= 0 ? (Math.abs(ano) || 1) + ' a.C.' : String(ano);
  }
  /* "~20.000 a.C.", "séc. VI a.C.", "622/800/1215", "27 a.C.–476 d.C." → o ano (negativo antes de Cristo) */
  function anoDoTexto(t) {
    t = String(t || '').replace(/[~≈]/g, '').replace(/c\.\s*/g, '').trim();
    var sec = t.match(/s[ée]c(?:ulo|\.)?\s*([IVXL]+)/i);
    var ac = /a\.\s*C\./i;
    if (sec) {
      var n = romano(sec[1]), antes = ac.test(t.slice(sec.index, sec.index + sec[0].length + 8));
      return antes ? -((n - 1) * 100 + 50) : (n - 1) * 100 + 50;
    }
    var m = t.match(/(\d{1,3}(?:\.\d{3})+|\d+)/);
    if (!m) return null;
    var v = parseInt(m[1].replace(/\./g, ''), 10);
    var depois = t.slice(m.index + m[0].length, m.index + m[0].length + 8);
    return ac.test(depois) ? -v : v;
  }
  function romano(r) { var V = { I: 1, V: 5, X: 10, L: 50, C: 100 }, n = 0; r = r.toUpperCase(); for (var i = 0; i < r.length; i++) { var a = V[r[i]] || 0, b = V[r[i + 1]] || 0; n += a < b ? -a : a; } return n; }
  function atrasDoAno(ano) { return Math.max(0.5, HOJE - ano); }

  /* ---------- os itens: as revoluções e as camadas ---------- */
  var itens = R.revolucoes.map(function (r) { return { id: 'r-' + r.id, tipo: 'revolucao', area: r.area, titulo: r.titulo, quando: r.quando, atras: r.atras, texto: r.texto, fonte: r.fonte, principal: r.principal }; });
  var camadas = { revolucao: true, evento: false, obra: false, lugar: false };
  var carregadas = { revolucao: true };
  var contagem = { revolucao: itens.length };
  var AREA_DA_LINHA = { mat: 'ciencia', fis: 'ciencia', qui: 'ciencia', bio: 'ciencia', geo: 'ciencia', his: 'sociedade', soc: 'sociedade', fil: 'pensamento', ing: 'comunicacao' };
  var AREA_DO_MANIFESTO = { direitos: 'sociedade', arte: 'arte', tecnica: 'ciencia', educacao: 'pensamento', terra: 'cosmos' };

  function script(src) {
    return new Promise(function (ok, falha) {
      if (document.querySelector('script[src="' + src + '"]')) return ok();
      var s = document.createElement('script'); s.src = src; s.onload = function () { ok(); }; s.onerror = function () { falha(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function carregarCamada(nome) {
    if (carregadas[nome]) return Promise.resolve();
    if (nome === 'evento') {
      var L = window.LINHA;
      var novos = (L ? L.EVENTS : []).map(function (e, i) {
        var ano = anoDoTexto(e[1]); if (ano == null) return null;
        return { id: 'e-' + i, tipo: 'evento', area: AREA_DA_LINHA[e[2]] || 'sociedade', titulo: e[3], quando: e[1], atras: atrasDoAno(ano), texto: e[4], fonte: ['A linha do tempo', 'linha-do-tempo.html'] };
      }).filter(Boolean);
      itens = itens.concat(novos); contagem.evento = novos.length; carregadas.evento = true;
      return Promise.resolve();
    }
    if (nome === 'obra') {
      return Promise.all([script('curadoria-dados.js').catch(function () {}), script('manifesto-dados.js').catch(function () {})]).then(function () {
        var novos = [];
        var C = window.CURADORIA, M = window.MANIFESTO;
        if (C && C.posts && C.posts[0]) {
          var p = C.posts[0];
          (p.linha || []).forEach(function (e, i) { novos.push({ id: 'c-' + i, tipo: 'obra', area: 'arte', titulo: e[1], quando: e[0] < 0 ? Math.abs(e[0]) + ' a.C.' : String(e[0]), atras: atrasDoAno(e[0]), texto: 'Da Curadoria nº 1, ' + p.titulo + '.', fonte: ['A Curadoria', 'curadoria.html?p=' + p.slug + '#linha'] }); });
          (p.linhagem || []).forEach(function (x, i) {
            var ano = parseInt(String(x.anos), 10); if (!ano) return;
            novos.push({ id: 'l-' + i, tipo: 'pessoa', area: 'arte', titulo: x.nome, quando: x.anos, atras: atrasDoAno(ano), texto: x.obra + '. ' + x.fez + '.', fonte: x.url ? [x.nome, x.url] : ['A linhagem', 'curadoria.html#linhagem'] });
          });
        }
        if (M && M.manifestos) M.manifestos.forEach(function (m, i) {
          novos.push({ id: 'm-' + i, tipo: 'obra', area: AREA_DO_MANIFESTO[m.familia] || 'pensamento', titulo: m.titulo, quando: String(m.ano), atras: atrasDoAno(m.ano), texto: m.quem + (m.onde ? ', ' + m.onde : '') + '. Pede ' + m.pede + '.', fonte: m.url ? [m.titulo, m.url] : ['Os manifestos', 'manifestos.html'] });
        });
        itens = itens.concat(novos); contagem.obra = novos.length; carregadas.obra = true;
      });
    }
    if (nome === 'lugar') {
      return fetch('/api/biblioteca').then(function (r) { return r.json(); }).then(function (idx) {
        var achado = (idx.itens || []).filter(function (i) { return /^Museus e Funda/.test(i[1]); })[0];
        if (!achado) throw new Error('sem a lista');
        return fetch('/api/ficha?id=' + encodeURIComponent(achado[0])).then(function (r) { return r.json(); });
      }).then(function (f) {
        var novos = [], tipo = '';
        String(f.corpo || '').split(/\r?\n/).forEach(function (l, i) {
          var h2 = l.match(/^##\s+(.+)$/); if (h2) { tipo = /funda/i.test(h2[1]) ? 'fundação' : 'museu'; return; }
          if (!tipo || !/^\|/.test(l) || /^\|\s*-/.test(l) || /^\|\s*Nome\s*\|/i.test(l)) return;
          var c = l.split('|').slice(1, -1).map(function (x) { return x.trim(); });
          var ano = anoDoTexto(c[3]); if (c.length < 5 || !c[0] || ano == null) return;
          novos.push({ id: 'u-' + i, tipo: 'lugar', area: 'arte', titulo: c[0].replace(/\[\[|\]\]/g, ''), quando: c[3], atras: atrasDoAno(ano), texto: (tipo === 'museu' ? 'Museu' : 'Fundação') + ' em ' + c[1] + ', ' + c[2] + '. ' + c[4] + ' (lista do Atlas, a conferir).', fonte: ['Museus e fundações', 'museus.html'] });
        });
        itens = itens.concat(novos); contagem.lugar = novos.length; carregadas.lugar = true;
      });
    }
    return Promise.resolve();
  }

  /* ---------- montar ---------- */
  function montar(el) {
    if (!el) return;
    var vista = { a: LIMITE.a, b: LIMITE.b };
    var areas = {}; R.areas.forEach(function (a) { areas[a[0]] = true; });
    var busca = '';
    var movel = matchMedia('(max-width: 700px)').matches;

    el.innerHTML =
      '<div class="revo">' +
        '<div class="revo-barra">' +
          '<div class="revo-camadas" role="group" aria-label="Camadas">' +
            [['revolucao', 'Revoluções'], ['evento', 'Eventos'], ['obra', 'Obras e pessoas'], ['lugar', 'Lugares']].map(function (c) {
              return '<button type="button" class="chip' + (camadas[c[0]] ? ' on' : '') + '" data-revo-camada="' + c[0] + '" aria-pressed="' + camadas[c[0]] + '">' + c[1] + ' <small data-revo-n="' + c[0] + '">' + (contagem[c[0]] || '') + '</small></button>';
            }).join('') +
          '</div>' +
          '<div class="revo-ir" role="group" aria-label="Ir para">' +
            [['tudo', 'Tudo'], ['terra', 'A Terra e a vida'], ['humanos', 'Os humanos'], ['historia', 'A história'], ['hoje', 'Os últimos séculos']].map(function (j) { return '<button type="button" class="botao leve" data-revo-ir="' + j[0] + '">' + j[1] + '</button>'; }).join('') +
          '</div>' +
          '<div class="revo-zoom" role="group" aria-label="Aproximar"><button type="button" class="ic" data-revo-zoom="-1" aria-label="Afastar" title="Afastar (−)">' + icone('afastar') + '</button><button type="button" class="ic" data-revo-zoom="1" aria-label="Aproximar" title="Aproximar (+)">' + icone('aproximar') + '</button></div>' +
        '</div>' +
        '<div class="revo-filtros"><div class="revo-areas" role="group" aria-label="Áreas">' + R.areas.filter(function (a) { return a[0] !== 'ontologica'; }).map(function (a) {
            return '<button type="button" class="chip on" data-revo-area="' + a[0] + '" aria-pressed="true" style="--c:' + a[2] + '"><i class="revo-ponto" aria-hidden="true"></i>' + esc(a[1]) + '</button>';
          }).join('') + '</div>' +
          '<label class="revo-busca"><span class="sr">Procurar na linha</span><input type="search" placeholder="Procurar: escrita, Darwin, Bolshoi…" data-revo-busca></label></div>' +
        '<div class="revo-palco" tabindex="0" role="application" aria-roledescription="linha do tempo" aria-label="A linha do tempo das revoluções: arraste para andar no tempo, use + e − para aproximar, ou a lista abaixo" data-lenis-prevent>' +
          '<div class="revo-tempos" aria-hidden="true"></div><div class="revo-grade" aria-hidden="true"></div><div class="revo-pontos"></div><div class="revo-marcas"></div><div class="revo-eixo" aria-hidden="true"></div>' +
        '</div>' +
        '<p class="revo-dica">Arraste para andar no tempo · pinça, Ctrl + roda ou + e − para aproximar · toque numa marca para ler</p>' +
        '<details class="revo-lista-d"><summary>A mesma linha, em lista</summary><div class="revo-lista"></div></details>' +
      '</div>';

    var palco = el.querySelector('.revo-palco');
    var temposEl = el.querySelector('.revo-tempos'), gradeEl = el.querySelector('.revo-grade'), pontosEl = el.querySelector('.revo-pontos'), marcasEl = el.querySelector('.revo-marcas'), eixoEl = el.querySelector('.revo-eixo');
    var nos = {}; /* id → { el, larg } */
    var W = 1, H = 1;

    function visivel(it) {
      if (!camadas[it.tipo === 'pessoa' ? 'obra' : it.tipo]) return false;
      /* a revolução ontológica não é uma área a filtrar: é o ponto de chegada, sempre à vista */
      if (it.area !== 'ontologica' && !areas[it.area]) return false;
      if (busca) { var t = norm(it.titulo + ' ' + it.texto + ' ' + it.quando); if (t.indexOf(busca) < 0) return false; }
      return true;
    }
    function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
    function xDe(atras) { return (vista.a - lg(atras)) / (vista.a - vista.b) * W; }

    /* cria os nós que faltam (uma vez por item) */
    function garantirNos() {
      itens.forEach(function (it) {
        if (nos[it.id]) return;
        var b = document.createElement('button');
        b.type = 'button'; b.dataset.revoId = it.id;
        if (it.tipo === 'revolucao') {
          b.className = 'revo-m' + (it.principal ? ' principal' : '') + (it.area === 'ontologica' ? ' ontologica' : '');
          b.style.setProperty('--c', corArea[it.area] || 'var(--tinta)');
          b.innerHTML = '<i class="revo-haste" aria-hidden="true"></i><i class="revo-cabeca" aria-hidden="true"></i><span class="revo-r"><b>' + esc(it.titulo) + '</b><small>' + esc(it.quando) + '</small></span>';
          b.setAttribute('aria-label', it.titulo + ', ' + it.quando);
          marcasEl.appendChild(b);
          nos[it.id] = { el: b, larg: 0, rot: b.querySelector('.revo-r') };
        } else {
          b.className = 'revo-p tipo-' + it.tipo;
          b.style.setProperty('--c', corArea[it.area] || 'var(--tinta)');
          b.title = it.quando + ' · ' + it.titulo;
          b.setAttribute('aria-label', it.titulo + ', ' + it.quando + ' (' + TIPOS[it.tipo].toLowerCase() + ')');
          pontosEl.appendChild(b);
          nos[it.id] = { el: b };
        }
      });
    }

    var pedido = 0;
    function pedir() { if (!pedido) pedido = requestAnimationFrame(function () { pedido = 0; desenhar(); }); }

    function desenhar() {
      W = palco.clientWidth || 1; H = palco.clientHeight || 1;
      /* os grandes tempos, em duas faixas (a geológica e a humana) */
      temposEl.innerHTML = R.tempos.map(function (t, i) {
        var x0 = xDe(t.de), x1 = xDe(Math.max(t.ate, 0.01));
        if (x1 < 0 || x0 > W) return '';
        var humano = i >= 6, l = Math.max(0, x0), r = Math.min(W, x1);
        return '<span class="revo-tempo' + (humano ? ' humano' : '') + (i % 2 ? ' par' : '') + '" style="left:' + l.toFixed(1) + 'px;width:' + Math.max(0, r - l).toFixed(1) + 'px"><b>' + (r - l > 64 ? esc(t.nome) : '') + '</b></span>';
      }).join('');
      /* a régua: tiques "redondos", sem se encostar */
      var cand = [4.54e9, 4e9, 3e9, 2e9, 1e9, 5e8, 2e8, 1e8, 5e7, 2e7, 1e7, 5e6, 2e6, 1e6, 5e5, 2e5, 1e5, 5e4, 2e4, 1e4];
      [-8000, -5000, -3000, -2000, -1000, -500, 0, 500, 1000, 1250, 1500, 1600, 1700, 1800, 1850, 1900, 1925, 1950, 1975, 2000, 2010, 2020].forEach(function (ano) { cand.push(HOJE - ano); });
      cand.push(0.5);
      var ultimo = -1e9, tiques = '', grade = '';
      cand.sort(function (a, b) { return b - a; }).forEach(function (at) {
        var x = xDe(at); if (x < 8 || x > W - 8 || x - ultimo < (movel ? 54 : 74)) return;
        ultimo = x;
        tiques += '<span class="revo-tique" style="left:' + x.toFixed(1) + 'px">' + esc(rotuloTique(at)) + '</span>';
        grade += '<i style="left:' + x.toFixed(1) + 'px"></i>';
      });
      eixoEl.innerHTML = tiques; gradeEl.innerHTML = grade;

      /* as revoluções: cada rótulo na primeira faixa livre (as principais primeiro); sem lugar, só a marca */
      var faixas = [], N_FAIXAS = movel ? 6 : 7, ALT_FAIXA = movel ? 40 : 44, BASE = movel ? 70 : 82; /* cabem na altura do palco (revolucoes.css) */
      var vis = itens.filter(function (it) { return it.tipo === 'revolucao'; }).map(function (it) {
        var n = nos[it.id], x = xDe(it.atras), ok = visivel(it) && x >= -2 && x <= W + 2; /* fora das bordas, nada de rótulo cortado ao meio */
        n.el.hidden = !ok; return ok ? { it: it, n: n, x: x } : null;
      }).filter(Boolean);
      /* a revolução ontológica é o ponto de chegada: escolhe a faixa antes de todas */
      vis.sort(function (a, b) { return ((b.it.area === 'ontologica') - (a.it.area === 'ontologica')) || (b.it.principal - a.it.principal) || (a.x - b.x); });
      for (var f = 0; f < N_FAIXAS; f++) faixas.push([]);
      vis.forEach(function (v) {
        if (!v.n.larg) v.n.larg = v.n.rot.offsetWidth || 120;
        /* o rótulo prefere a direita da marca; se lá não houver faixa livre, tenta a esquerda */
        var L = v.n.larg, lados = [];
        if (v.x + L + 14 <= W) lados.push(false);
        if (v.x - L - 10 >= 0) lados.push(true);
        if (!lados.length) lados.push(v.x > W / 2);
        var lugar = -1, esq = lados[0];
        for (var s = 0; s < lados.length && lugar < 0; s++) {
          var e = lados[s], ini = e ? v.x - L - 10 : v.x - 6, fim = e ? v.x + 6 : v.x + L + 14;
          for (var k = 0; k < N_FAIXAS; k++) {
            if (faixas[k].every(function (o) { return fim < o[0] || ini > o[1]; })) { lugar = k; esq = e; faixas[k].push([ini, fim]); break; }
          }
        }
        v.n.el.classList.toggle('esq', esq);
        v.n.el.classList.toggle('sem-rotulo', lugar < 0);
        /* sem lugar numa faixa, a marca desce para rente da régua: nunca fica em cima de um rótulo */
        var y = lugar < 0 ? (movel ? 18 : 22) : BASE + lugar * ALT_FAIXA;
        /* "left" e não "transform": sem transform, as marcas não viram camadas próprias,
           e todos os rótulos ficam por cima de todas as hastes (revolucoes.css) */
        v.n.el.style.left = v.x.toFixed(1) + 'px';
        v.n.el.style.setProperty('--y', y + 'px');
      });
      /* as camadas: pontos em três faixas rentes à régua */
      var LINHA_TIPO = { evento: 0, obra: 1, pessoa: 1, lugar: 2 };
      itens.forEach(function (it) {
        if (it.tipo === 'revolucao') return;
        var n = nos[it.id], x = xDe(it.atras), ok = visivel(it) && x >= -6 && x <= W + 6;
        n.el.hidden = !ok; if (!ok) return;
        var j = (hash(it.id) % 5) - 2;
        n.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (-(40 + LINHA_TIPO[it.tipo] * 12 + j * 1.5)) + 'px)';
      });
    }
    function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

    /* ---------- a lista (o mesmo conteúdo, em ordem, por tempo) ---------- */
    var listaEl = el.querySelector('.revo-lista');
    function pintarLista() {
      var vis = itens.filter(visivel).sort(function (a, b) { return b.atras - a.atras; });
      var html = '', atual = null;
      vis.forEach(function (it) {
        var t = R.tempos.filter(function (t, i) { return (i >= 6 || it.atras >= 3.3e6) && it.atras <= t.de && it.atras > t.ate; }).pop() || R.tempos[R.tempos.length - 1];
        if (t !== atual) { if (atual) html += '</ol>'; html += '<h4 class="revo-l-t">' + esc(t.nome) + '</h4><ol class="revo-l">'; atual = t; }
        html += '<li class="' + (it.principal ? 'principal ' : '') + 'tipo-' + it.tipo + '" style="--c:' + (corArea[it.area] || 'var(--tinta)') + '"><button type="button" data-revo-id="' + esc(it.id) + '"><span class="revo-l-q">' + esc(it.quando) + '</span><b>' + esc(it.titulo) + '</b><small>' + esc(TIPOS[it.tipo]) + ' · ' + esc(nomeArea[it.area] || '') + '</small></button></li>';
      });
      listaEl.innerHTML = html ? html + '</ol>' : '<p class="revo-vazio">Nada com esses filtros.</p>';
    }
    function tudo() { garantirNos(); desenhar(); pintarLista(); }

    /* ---------- ir para um tempo (com movimento) ---------- */
    var IR = { tudo: [LIMITE.a, LIMITE.b], terra: [lg(4.7e9), lg(3e7)], humanos: [lg(8e6), lg(3000)], historia: [lg(13000), lg(150)], hoje: [lg(700), -0.08] };
    var animacao = 0;
    function irPara(a, b, ja) {
      cancelAnimationFrame(animacao);
      var de = { a: vista.a, b: vista.b }, t0 = performance.now(), dur = ja || matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620;
      (function passo(t) {
        var u = dur ? Math.min(1, (t - t0) / dur) : 1, e = 1 - Math.pow(1 - u, 3);
        vista.a = de.a + (a - de.a) * e; vista.b = de.b + (b - de.b) * e;
        desenhar();
        if (u < 1) animacao = requestAnimationFrame(passo);
      })(t0);
    }
    function prender() {
      var span = Math.min(LIMITE.a - LIMITE.b, Math.max(0.12, vista.a - vista.b));
      if (vista.a > LIMITE.a) { vista.a = LIMITE.a; vista.b = vista.a - span; }
      if (vista.b < LIMITE.b) { vista.b = LIMITE.b; vista.a = vista.b + span; }
    }
    function zoom(fator, fx) {
      fx = fx == null ? 0.5 : fx;
      var tc = vista.a - fx * (vista.a - vista.b);
      var span = Math.min(LIMITE.a - LIMITE.b, Math.max(0.12, (vista.a - vista.b) * fator));
      vista.a = tc + fx * span; vista.b = vista.a - span; prender(); pedir();
    }

    /* ---------- arrastar, pinça, roda (só com Ctrl ou na horizontal: a página continua rolando) ---------- */
    var toques = new Map(), arrasto = null, moveu = false;
    palco.addEventListener('pointerdown', function (ev) {
      if (ev.button && ev.pointerType === 'mouse') return;
      toques.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      moveu = false;
      if (toques.size === 1) arrasto = { x: ev.clientX, a: vista.a, b: vista.b };
      if (toques.size === 2) { var p = Array.from(toques.values()); arrasto = { pinca: Math.abs(p[0].x - p[1].x) || 1, a: vista.a, b: vista.b, cx: (p[0].x + p[1].x) / 2 }; }
    });
    palco.addEventListener('pointermove', function (ev) {
      if (!toques.has(ev.pointerId) || !arrasto) return;
      toques.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      var r = palco.getBoundingClientRect();
      if (toques.size === 2 && arrasto.pinca) {
        var p = Array.from(toques.values()), d = Math.abs(p[0].x - p[1].x) || 1;
        var fx = (arrasto.cx - r.left) / W, tc = arrasto.a - fx * (arrasto.a - arrasto.b);
        var span = Math.min(LIMITE.a - LIMITE.b, Math.max(0.12, (arrasto.a - arrasto.b) * arrasto.pinca / d));
        vista.a = tc + fx * span; vista.b = vista.a - span; prender(); moveu = true; pedir(); return;
      }
      var dx = ev.clientX - arrasto.x;
      if (Math.abs(dx) > 4) { moveu = true; if (!palco.hasPointerCapture(ev.pointerId)) try { palco.setPointerCapture(ev.pointerId); } catch (e) {} }
      var dt = dx / W * (arrasto.a - arrasto.b);
      vista.a = arrasto.a + dt; vista.b = arrasto.b + dt; prender(); pedir();
    });
    function soltar(ev) { toques.delete(ev.pointerId); if (toques.size === 1) { var p = Array.from(toques.values())[0]; arrasto = { x: p.x, a: vista.a, b: vista.b }; } else if (!toques.size) arrasto = null; }
    palco.addEventListener('pointerup', soltar);
    palco.addEventListener('pointercancel', soltar);
    palco.addEventListener('wheel', function (ev) {
      var r = palco.getBoundingClientRect();
      if (ev.ctrlKey || ev.metaKey) { ev.preventDefault(); zoom(Math.exp(ev.deltaY * 0.01), (ev.clientX - r.left) / W); return; }
      if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) { ev.preventDefault(); var dt = ev.deltaX / W * (vista.a - vista.b); vista.a -= dt; vista.b -= dt; prender(); pedir(); }
    }, { passive: false });
    palco.addEventListener('keydown', function (ev) {
      var passo = (vista.a - vista.b) * 0.08;
      if (ev.key === 'ArrowLeft') { vista.a += passo; vista.b += passo; }
      else if (ev.key === 'ArrowRight') { vista.a -= passo; vista.b -= passo; }
      else if (ev.key === '+' || ev.key === '=') { zoom(0.8); return; }
      else if (ev.key === '-' || ev.key === '_') { zoom(1.25); return; }
      else return;
      ev.preventDefault(); prender(); pedir();
    });

    /* ---------- cliques: camadas, áreas, ir para, zoom, abrir ---------- */
    el.addEventListener('click', function (ev) {
      var c = ev.target.closest('[data-revo-camada]');
      if (c) {
        var nome = c.dataset.revoCamada; if (nome === 'revolucao') return;
        camadas[nome] = !camadas[nome];
        c.classList.toggle('on', camadas[nome]); c.setAttribute('aria-pressed', String(camadas[nome]));
        if (camadas[nome] && !carregadas[nome]) {
          c.classList.add('carregando');
          carregarCamada(nome).then(function () { c.classList.remove('carregando'); var n = el.querySelector('[data-revo-n="' + nome + '"]'); if (n) n.textContent = contagem[nome] || ''; tudo(); })
            .catch(function () { c.classList.remove('carregando'); camadas[nome] = false; c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); if (window.Perfil) avisar('Não consegui abrir esta camada agora.'); });
        } else tudo();
        return;
      }
      var a = ev.target.closest('[data-revo-area]');
      if (a) {
        var chaves = Object.keys(areas).filter(function (x) { return x !== 'ontologica'; });
        var k = a.dataset.revoArea, todas = chaves.every(function (x) { return areas[x]; });
        /* o primeiro toque isola a área; os seguintes somam ou tiram; tirar a última volta a todas */
        if (todas) chaves.forEach(function (x) { areas[x] = x === k; });
        else areas[k] = !areas[k];
        if (!chaves.some(function (x) { return areas[x]; })) chaves.forEach(function (x) { areas[x] = true; });
        el.querySelectorAll('[data-revo-area]').forEach(function (b) { var on = areas[b.dataset.revoArea]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
        tudo(); return;
      }
      var ir = ev.target.closest('[data-revo-ir]'); if (ir) { var j = IR[ir.dataset.revoIr]; if (j) irPara(j[0], j[1]); return; }
      var z = ev.target.closest('[data-revo-zoom]'); if (z) { zoom(z.dataset.revoZoom === '1' ? 0.6 : 1.6); return; }
      var m = ev.target.closest('[data-revo-id]');
      if (m) { if (moveu && palco.contains(m)) { moveu = false; return; } abrir(m.dataset.revoId); }
    });
    el.querySelector('[data-revo-busca]').addEventListener('input', function (ev) { busca = norm(ev.target.value.trim()); tudo(); });
    function avisar(t) { var a = document.createElement('div'); a.className = 'dm2-aviso on'; a.setAttribute('role', 'status'); a.innerHTML = '<span>' + esc(t) + '</span>'; document.body.appendChild(a); setTimeout(function () { a.remove(); }, 3600); }

    /* ---------- a folha de uma marca: o que foi, a fonte, e o que aconteceu perto ---------- */
    function abrir(id) {
      var it = itens.filter(function (x) { return x.id === id; })[0]; if (!it || !window.Perfil) return;
      var t = lg(it.atras);
      var perto = itens.filter(function (x) { return x !== it && visivel(x) && Math.abs(lg(x.atras) - t) < Math.max(0.06, t * 0.05); })
        .sort(function (a, b) { return Math.abs(lg(a.atras) - t) - Math.abs(lg(b.atras) - t); }).slice(0, 8);
      var fonte = it.fonte ? (/^https?:/.test(it.fonte[1]) ? '<a class="revo-f-fonte" href="' + esc(it.fonte[1]) + '" target="_blank" rel="noopener">' + esc(it.fonte[0]) + ' →</a>' : '<a class="revo-f-fonte" href="' + esc(it.fonte[1]) + '">' + esc(it.fonte[0]) + ' →</a>') : '';
      var html = '<div class="revo-folha" style="--c:' + (corArea[it.area] || 'var(--tinta)') + '">' +
        '<p class="revo-f-meta"><span class="revo-f-area"><i class="revo-ponto"></i>' + esc(nomeArea[it.area] || '') + '</span><span>' + esc(TIPOS[it.tipo]) + '</span><span>' + esc(it.atras >= 12000 ? fmtAtras(it.atras) : it.quando) + '</span></p>' +
        '<p class="revo-f-texto">' + esc(it.texto) + '</p>' + fonte +
        (it.area === 'ontologica' ? '<p class="revo-f-mais"><a class="botao pri" href="manifesto.html#mf-xvi">Ler a revolução ontológica no Manifesto</a></p>' : '') +
        (perto.length ? '<h3 class="revo-f-t">Perto no tempo</h3><ul class="revo-f-perto">' + perto.map(function (x) {
          return '<li style="--c:' + (corArea[x.area] || 'var(--tinta)') + '"><button type="button" data-revo-perto="' + esc(x.id) + '"><span>' + esc(x.quando) + '</span><b>' + esc(x.titulo) + '</b><small>' + esc(TIPOS[x.tipo]) + '</small></button></li>';
        }).join('') + '</ul>' : '') + '</div>';
      window.Perfil.folha({ titulo: esc(it.titulo), sub: esc(it.quando), html: html, aoAbrir: function (corpo) {
        corpo.addEventListener('click', function (ev) { var b = ev.target.closest('[data-revo-perto]'); if (b) abrir(b.dataset.revoPerto); });
      } });
      /* a linha vai até a marca, se ela estiver fora da tela */
      var x = xDe(it.atras); if (x < 0 || x > W) { var span = vista.a - vista.b; irPara(t + span / 2, t - span / 2); }
    }

    function icone(n) { return window.Icones ? window.Icones.svg(n) : (n === 'aproximar' ? '+' : '−'); }
    tudo();
    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () { pedir(); }) : null;
    if (ro) ro.observe(palco); else window.addEventListener('resize', pedir);
    /* começa pelo tempo humano (onde mora quase tudo), e mostra a Terra inteira se a pessoa quiser */
    irPara(IR.tudo[0], IR.tudo[1], true);
  }

  window.Revolucoes = { montar: montar, anoDoTexto: anoDoTexto };
})();
