(function () {
  'use strict';

  /* O ATLAS DA TERRA, a casa de entrada (08/out/2026, itens 72 e 73)
     A Terra agora · o mapa da humanidade · o planeta · a linha do tempo · o que existe · o próximo tijolo.
     Cada seção tem data-secao: o "Arrumar" esconde e reordena (e volta ao original). */
  var P = window.Perfil;
  var esc = P.esc;
  /* o site público (lançamento, item 77): a mesma porta, explicando o que é, sem o que é só do dono (o próximo tijolo) */
  var PUBLICO = !!(window.JADESUN_ESTATICO && window.JADESUN_ESTATICO.modo === 'publico');
  var raiz = document.getElementById('atlas');
  var q = document.getElementById('atlas-q');
  var quando = document.getElementById('atlas-quando');
  if (quando) quando.textContent = P.dataExtenso();
  var horaEl = document.getElementById('atlas-hora');
  function relogio() { if (horaEl) horaEl.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' em Campinas'; }
  relogio(); setInterval(relogio, 30000);

  document.getElementById('atlas-busca').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = q.value.trim();
    location.href = 'biblioteca.html' + (v ? '#q=' + encodeURIComponent(v) : '');
  });

  function n(v) { return Number(v || 0).toLocaleString('pt-BR'); }
  var ic = function (nome) { return P.icone(nome); };
  function sec(id, rotulo, titulo, acao, corpo, classe) {
    return '<section class="atlas-sec ' + (classe || '') + '" data-secao="' + id + '" data-rotulo="' + esc(rotulo) + '" aria-labelledby="at-' + id + '">' +
      '<header class="at-cab"><div><p class="rot">' + esc(rotulo) + '</p><h2 class="h2" id="at-' + id + '">' + titulo + '</h2></div>' + (acao || '') + '</header>' + corpo + '</section>';
  }

  /* ---------- os números, na faixa do topo ---------- */
  function numeros(ind, lac, L) {
    var semFicha = lac ? lac.semFicha.length : null;
    var acaso = ind.itens[Math.floor(Math.random() * ind.itens.length)];
    var c = function (href, num, rot, extra) { return '<a class="at-num" href="' + href + '"' + (extra || '') + '><b>' + num + '</b><span>' + rot + '</span></a>'; };
    document.getElementById('at-numeros').innerHTML =
      c('biblioteca.html', n(ind.total), 'fichas e ' + n(ind.imagens) + ' imagens') +
      c('linha-do-tempo.html', n(L.EVENTS.length), 'eventos em ' + L.ERAS.length + ' eras') +
      (PUBLICO && window.REVOLUCOES ? c('#at-revolucoes', n(window.REVOLUCOES.revolucoes.length), 'revoluções, da Terra a hoje') : c('falta.html', semFicha == null ? '—' : n(semFicha), 'nomes ainda sem ficha')) +
      c('biblioteca.html#f=' + encodeURI(acaso[0]), ic('sortear'), 'uma ficha ao acaso: ' + esc(acaso[1]), ' id="ap-acaso"');
  }

  /* ---------- 1. a Terra, agora ---------- */
  function terra() {
    return '<section class="atlas-sec at-terra-sec" data-secao="terra" data-rotulo="A Terra, agora" aria-label="A Terra, agora">' +
      '<figure class="at-terra"><p class="at-agora-mundo" id="at-agora-mundo" aria-live="polite"></p><div id="at-terra"></div>' +
      '<figcaption class="at-legenda"><span class="lg-dia">dia</span><span class="lg-noite">noite</span><span class="lg-cid">cidades acesas</span><span class="lg-sol">o sol a pino</span><span class="lg-voce">você</span>' +
      '<span class="lg-fonte">Natural Earth · projeção Equal Earth · o sol deste minuto</span></figcaption></figure></section>';
  }

  /* ---------- 2. o mapa da humanidade ---------- */
  function humanidade() {
    var H = window.HUMANIDADE;
    return sec('humanidade', 'O mapa da humanidade', 'Todo o saber, em dez partes',
      '<p class="at-cab-nota">A área de cada fatia é o quanto ' + (PUBLICO ? 'o acervo já tem' : 'você já tem') + '; os anéis são as eras; os pontos, os eventos. Toque numa parte.</p>',
      '<div class="hm"><div class="hm-rosa" id="hm-rosa"><p class="rot suave">Desenhando o mapa…</p></div><ol class="hm-lista" id="hm-lista"></ol></div>');
  }

  /* ---------- 3. o planeta ---------- */
  var CHAVE = 'planeta-habitos-v1';
  function lerHab() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function gravarHab(h) { try { localStorage.setItem(CHAVE, JSON.stringify(h)); } catch (e) {} }
  function contagemPlaneta() {
    var f = lerHab(), t = 0, m = 0;
    window.PLANETA.aspectos.forEach(function (a) { a.habitos.forEach(function (h) { t++; if (f[a.id + '.' + h[0]]) m++; }); });
    return { t: t, m: m };
  }
  function planeta() {
    var PL = window.PLANETA;
    if (!PL) return '';
    var f = lerHab(), c = contagemPlaneta();
    var blocos = PL.aspectos.map(function (a, i) {
      var feitos = a.habitos.filter(function (h) { return f[a.id + '.' + h[0]]; }).length, pct = Math.round(feitos / a.habitos.length * 100);
      return '<button type="button" class="pl-bloco ' + a.cor + '" data-asp="' + i + '">' +
        '<span class="pl-b-topo"><span class="pl-b-nome">' + esc(a.nome) + '</span><span class="pl-anel" style="--p:' + pct + '" aria-hidden="true"></span></span>' +
        '<span class="pl-b-porque">' + esc(a.porque) + '</span>' +
        '<span class="pl-b-pe"><b data-conta="' + a.id + '">' + feitos + ' de ' + a.habitos.length + '</b> hábitos<span aria-hidden="true">' + ic('seguir') + '</span></span></button>';
    }).join('');
    return sec('planeta', 'O planeta', 'O que cada um pode fazer',
      '<p class="at-cab-nota" id="pl-total">Você já faz <b>' + c.m + '</b> de ' + c.t + ' hábitos</p>',
      '<p class="pl-abre">' + esc(PL.abertura) + ' <small><a href="' + esc(PL.aberturaFonte[1]) + '" target="_blank" rel="noopener">' + esc(PL.aberturaFonte[0]) + '</a></small></p>' +
      '<ol class="pl-cinco" aria-label="As cinco medidas que mais pesam">' + PL.cinco.map(function (x, i) { return '<li><b>' + (i + 1) + '</b><span><strong>' + esc(x[0]) + '</strong>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>' +
      '<div class="pl-grade">' + blocos + '</div>', 'pl');
  }
  function abrirAspecto(i) {
    var a = window.PLANETA.aspectos[i], f = lerHab();
    var fonte = function (x) { return '<a href="' + esc(x[2]) + '" target="_blank" rel="noopener">' + esc(x[1]) + '</a>'; };
    var html = '<p class="pl-f-porque">' + esc(a.porque) + '</p><ul class="pl-habitos">' + a.habitos.map(function (h) {
      var k = a.id + '.' + h[0];
      return '<li><button type="button" class="pl-hab ' + a.cor + '" data-hab="' + k + '" aria-pressed="' + !!f[k] + '"><i aria-hidden="true"></i><span>' + esc(h[1]) + '</span></button></li>';
    }).join('') + '</ul>' + (a.fatos.length ? '<h3 class="pl-f-t">O que se sabe</h3><div class="pl-fatos">' + a.fatos.map(function (x) { return '<p>' + esc(x[0]) + '<small>' + fonte(x) + '</small></p>'; }).join('') + '</div>' : '');
    P.folha({ titulo: esc(a.nome), sub: 'O planeta · hábitos conscientes', html: html, aoAbrir: function (corpo) {
      corpo.addEventListener('click', function (ev) {
        var b = ev.target.closest('.pl-hab'); if (!b) return;
        var k = b.getAttribute('data-hab'), h = lerHab();
        if (h[k]) delete h[k]; else h[k] = new Date().toISOString().slice(0, 10);
        gravarHab(h); b.setAttribute('aria-pressed', String(!!h[k]));
        atualizarPlaneta();
      });
    } });
  }
  function atualizarPlaneta() {
    var f = lerHab(), c = contagemPlaneta();
    var tot = document.getElementById('pl-total'); if (tot) tot.innerHTML = 'Você já faz <b>' + c.m + '</b> de ' + c.t + ' hábitos';
    window.PLANETA.aspectos.forEach(function (a, i) {
      var feitos = a.habitos.filter(function (h) { return f[a.id + '.' + h[0]]; }).length;
      var b = raiz.querySelector('.pl-bloco[data-asp="' + i + '"]'); if (!b) return;
      b.querySelector('[data-conta]').textContent = feitos + ' de ' + a.habitos.length;
      b.querySelector('.pl-anel').style.setProperty('--p', Math.round(feitos / a.habitos.length * 100));
    });
  }

  /* ---------- 4. a linha do tempo, numa faixa ---------- */
  function eras(L) {
    var porEra = {};
    L.EVENTS.forEach(function (e) { var o = porEra[e[0]] || (porEra[e[0]] = { total: 0, areas: {} }); o.total += 1; o.areas[e[2]] = (o.areas[e[2]] || 0) + 1; });
    var maior = Math.max.apply(null, L.ERAS.map(function (e) { return (porEra[e.n] || { total: 0 }).total; }).concat([1]));
    return sec('eras', 'A linha do tempo', 'Era por era', '<a class="botao leve" href="linha-do-tempo.html">Abrir a linha do tempo ' + ic('seguir') + '</a>',
      '<div class="at-eras">' + L.ERAS.map(function (e) {
        var o = porEra[e.n] || { total: 0, areas: {} };
        var barras = L.AREAS.filter(function (a) { return o.areas[a.code]; }).map(function (a) { return '<i class="' + a.code + '" style="flex:' + o.areas[a.code] + '" title="' + esc(a.name) + ': ' + o.areas[a.code] + '"></i>'; }).join('');
        return '<a class="at-era" href="linha-do-tempo.html#e' + e.n + '" style="--h:' + Math.round(14 + 86 * o.total / maior) + '%"><span class="at-era-n">' + e.n + '</span><b>' + esc(e.title) + '</b><span class="at-era-r">' + esc(e.range) + '</span><span class="at-era-b">' + barras + '</span><span class="at-era-c">' + o.total + ' eventos</span></a>';
      }).join('') + '</div>');
  }

  /* ---------- 5. o que existe ---------- */
  function acervos(ind) {
    var sel = ind.acervos[0], resto = ind.acervos.slice(1);
    return sec('acervos', 'O que existe', n(ind.total) + ' fichas, por seção', '<a class="botao leve" href="biblioteca.html">Abrir a biblioteca ' + ic('seguir') + '</a>',
      '<div class="at-capas">' + sel.secoes.map(function (s) {
        var capa = s.capas && s.capas[0] ? '<img src="' + esc(s.capas[0]) + '" alt="" loading="lazy" decoding="async">' : '<span class="at-capa-vazia"></span>';
        return '<a class="at-capa ' + P.corDe(s.nome) + '" href="biblioteca.html#s=' + encodeURI(s.id) + '">' + capa + '<span class="at-capa-t"><b>' + esc(s.nome) + '</b><span>' + s.total + (s.total === 1 ? ' ficha' : ' fichas') + '</span></span></a>';
      }).join('') + '</div>' +
      '<div class="at-indice">' + resto.map(function (a) {
        return '<div class="at-ind-col"><p class="at-ind-t"><b>' + esc(a.nome) + '</b><span>' + n(a.total) + '</span></p><ul>' + a.secoes.map(function (s) {
          return '<li><a href="biblioteca.html#s=' + encodeURI(s.id) + '" class="' + P.corDe(s.nome) + '"><span>' + esc(s.nome.replace(/^[#\s.0-9]+(?=[A-ZÀ-ÚA-Za-z])/, '')) + '</span><small>' + s.total + '</small></a></li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div>');
  }

  /* ---------- 6. o próximo tijolo ---------- */
  function falta(lac) {
    if (PUBLICO || !lac || !lac.semFicha[0]) return '';
    var topo = lac.semFicha[0], lista = lac.semFicha.slice(1, 9);
    return sec('tijolo', 'O que falta', 'O próximo tijolo', '<a class="botao leve" href="falta.html">Ver tudo o que falta ' + ic('seguir') + '</a>',
      '<div class="at-proximo"><div class="at-prox-t"><p class="rot">30 minutos</p><h3 class="h3">Escrever a ficha de “' + esc(topo.nome) + '”</h3><p>Citado ' + topo.vezes + (topo.vezes === 1 ? ' vez' : ' vezes') + ' em ' + topo.citadoPor.slice(0, 4).map(function (c) { return '<a href="biblioteca.html#f=' + encodeURI(c.id) + '">' + esc(c.titulo) + '</a>'; }).join(', ') + ', mas ainda sem ficha própria. Um fio fechado vale mais do que dez pontas soltas.</p></div>' +
      (lista.length ? '<div class="at-prox-l"><p class="rot">Depois</p><p class="at-chips">' + lista.map(function (f) { return '<span class="chip-h sem">' + esc(f.nome) + ' <small>' + f.vezes + '</small></span>'; }).join('') + '</p></div>' : '') + '</div>');
  }

  /* ---------- montagem ---------- */
  /* 09/out/2026 (item 74): para onde ir agora — os Guias, a Curadoria e o Manifesto, logo depois da Terra */
  function caminhos() {
    return sec('caminhos', 'Para onde ir agora', 'Os guias, a curadoria e o porquê', '<button type="button" class="botao leve" data-portal>' + ic('portal') + 'Ver tudo numa esfera</button>',
      '<div class="at-caminhos">' +
        '<a class="at-cam at-cam-guias" href="guias.html"><span class="at-cam-ic">' + ic('guias') + '</span><b>Guias</b><span>O que ler, estudar e ouvir agora; as manchetes das melhores fontes, sem algoritmo; os livros especiais; as necessidades do mundo.</span><i>Abrir os guias ' + ic('seguir') + '</i></a>' +
        '<a class="at-cam at-cam-cura" href="curadoria.html"><span class="at-cam-capa" aria-hidden="true"><i class="s"></i><i class="q"></i></span><b>Curadoria nº 1</b><span>A praça, o pavão e o éter: o Bolshoi, a Sala do Pavão, as Bachianas e a Capela Rothko, com 42 palavras e os livros de cada uma.</span><i>Ler a curadoria ' + ic('seguir') + '</i></a>' +
        '<a class="at-cam at-cam-man" href="manifesto.html"><span class="at-cam-q" aria-hidden="true"></span><b>Manifesto</b><span>Contra marcas e falsidades. A verdade pura é bem-vinda, e o que está em torno dela pode contemplá-la.</span><i>Ler o manifesto ' + ic('seguir') + '</i></a>' +
      '</div>');
  }
  /* item 75: a home abre com a linha das revoluções (da formação da Terra à revolução ontológica), o resumo da
     revolução ontológica e, no fim, "Quem fez"; os textos vêm da nota do caderno (Manifestos/A Revolução Ontológica.md) */
  function revolucoes() {
    return sec('revolucoes', 'Da formação da Terra até agora', 'As revoluções', '<a class="botao leve" href="linha-do-tempo.html">' + ic('quando') + 'A linha do tempo inteira</a>',
      '<div id="at-rv"></div>', 'at-rv-sec');
  }
  function ontologica() {
    return sec('ontologica', 'A necessidade primordial', 'A revolução ontológica', '', '<div id="at-on"></div>', 'at-on-sec');
  }
  function quemFez() {
    return '<section class="atlas-sec at-qf-sec" data-secao="quemfez" data-rotulo="Quem fez" aria-label="Quem fez"><div id="at-qf"></div></section>';
  }
  /* o que é e por onde começar (só no site público): um parágrafo e as seis portas */
  function comeco() {
    var porta = function (href, icone, nome, txt) { return '<a class="at-porta" href="' + href + '"><span class="at-porta-ic">' + ic(icone) + '</span><b>' + nome + '</b><span>' + txt + '</span></a>'; };
    return sec('comeco', 'O que é', 'Um atlas aberto, com tudo ligado', '',
      '<div class="at-comeco"><p class="at-comeco-txt">O Portal Solar é um atlas aberto do conhecimento: matérias, elementos, ofícios, objetos, línguas, mitologia, pessoas e linhas do tempo, com imagens e créditos. Nada de conteúdo em cima de conteúdo: cada ficha leva às que se ligam a ela, cada evento ao seu tempo, cada escolha a quem a assinou.</p>' +
      '<nav class="at-portas" aria-label="Por onde começar">' +
        porta('biblioteca.html', 'biblioteca', 'Fichas', 'Tudo o que existe, ficha por ficha, com fontes, imagens e os elos entre elas.') +
        porta('linha-do-tempo.html', 'quando', 'Quando', 'A linha do tempo: os eventos, as eras e quem fez o quê.') +
        porta('guias.html', 'guias', 'Guias', 'O que ler, estudar e ouvir agora; as manchetes das melhores fontes, sem algoritmo.') +
        porta('curadoria.html', 'curadoria', 'Curadoria', 'Escolhas assinadas e datadas, com as palavras e os livros de cada uma.') +
        porta('manifesto.html', 'manifesto', 'Manifesto', 'O porquê: contra marcas e falsidades, e a revolução ontológica.') +
        porta('dados.html', 'dados', 'Dados', 'O mundo em números: planetas, elementos, constantes, cidades e estrelas.') +
      '</nav></div>', 'at-comeco-sec');
  }
  raiz.innerHTML = PUBLICO
    ? comeco() + revolucoes() + ontologica() + terra() + humanidade() + planeta() + '<div id="at-resto"></div>' + quemFez()
    : revolucoes() + ontologica() + terra() + caminhos() + humanidade() + planeta() + '<div id="at-resto"></div>' + quemFez();
  if (window.Revolucoes) window.Revolucoes.montar(document.getElementById('at-rv'));
  fetch('/api/manifesto', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
    var O = window.Ontologica, on = document.getElementById('at-on'), qf = document.getElementById('at-qf');
    if (!O || !d || !d.ontologica || !d.ontologica.existe) { var s1 = raiz.querySelector('[data-secao="ontologica"]'), s2 = raiz.querySelector('[data-secao="quemfez"]'); if (s1) s1.hidden = true; if (s2) s2.hidden = true; return; }
    var p = O.partes(d.ontologica.texto);
    if (on) on.innerHTML = O.htmlResumo(p, { link: 'manifesto.html#mf-xvi' });
    if (qf) qf.innerHTML = O.htmlQuemFez(p);
  });
  if (PUBLICO) { var lgv = raiz.querySelector('.lg-voce'); if (lgv) lgv.textContent = 'Campinas, onde ele é feito'; }
  if (window.TerraAgora) window.TerraAgora.montar(document.getElementById('at-terra'), { rotulo: PUBLICO ? 'Campinas' : '', aoAtualizar: function (r) {
    var el = document.getElementById('at-agora-mundo'); if (!el) return;
    var hora = r.hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    var km = Math.round(r.distancia * 111.2 / 100) * 100;
    el.innerHTML = 'Agora, ' + hora + ' em Campinas, é noite em <b>' + r.noite + ' das ' + r.total + '</b> maiores cidades do mundo, onde vivem cerca de <b>' + Math.round(r.pessoasNoite / 1e6) + ' milhões</b> de pessoas. ' +
      'O sol está a pino ' + (km < 300 ? 'sobre <b>' + esc(r.perto[5]) + '</b>' : 'a uns ' + n(km) + ' km de <b>' + esc(r.perto[5]) + '</b>') + (r.perto[6] ? ', ' + esc(window.TerraAgora.pais(r.perto)) : '') + '.';
  } });
  raiz.addEventListener('click', function (ev) { var b = ev.target.closest('.pl-bloco'); if (b) abrirAspecto(+b.getAttribute('data-asp')); });
  if (location.hash === '#planeta') { var pl = raiz.querySelector('[data-secao="planeta"]'); if (pl) setTimeout(function () { pl.scrollIntoView(); }, 50); }

  Promise.all([
    fetch('/api/biblioteca').then(function (r) { if (!r.ok) throw new Error('biblioteca'); return r.json(); }),
    PUBLICO ? Promise.resolve(null) : fetch('/api/lacunas').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }), /* o que falta é só do dono */
  ]).then(function (r) {
    var ind = r[0], lac = r[1], L = window.LINHA || { EVENTS: [], ERAS: [], AREAS: [] };
    numeros(ind, lac, L);
    var resto = document.getElementById('at-resto');
    resto.outerHTML = acervos(ind) + falta(lac); /* item 75: as eras viraram a camada "Eventos" da linha das revoluções */
    if (window.MapaHumanidade) {
      var m = window.MapaHumanidade.desenhar(document.getElementById('hm-rosa'), ind, L);
      document.getElementById('hm-lista').innerHTML = m.partes.map(function (p, i) {
        return '<li><button type="button" data-parte="' + i + '" style="--c:' + p.def.cor + '"><i aria-hidden="true"></i><b>' + esc(p.def.nome) + '</b><span>' + n(p.total) + '</span></button></li>';
      }).join('');
      document.getElementById('hm-lista').addEventListener('click', function (ev) { var b = ev.target.closest('[data-parte]'); if (b) m.abrir(+b.getAttribute('data-parte')); });
    }
    if (window.Arrumar) window.Arrumar.aplicar();
    if (window.Movimento) window.Movimento.revalidar();
  }).catch(function () {
    document.getElementById('at-resto').innerHTML = '<div class="cx"><p class="rot">Servidor desligado</p><p>Abra <b>hoje.command</b> (no Mac) ou <b>hoje.bat</b> (no Windows) e deixe a janela aberta.</p></div>';
  });
})();
