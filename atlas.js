(function () {
  'use strict';

  /* ============================================================
     O ATLAS, UM EXPLORADOR SÓ (25/out/2026, registro 119)
     "a atlas está muito disperso, temos muitas abas e categorias.. o sistema de navegar os 24 reinos,
     as espécies, etc, está quase perfeito, clicando e mudando os filtros, deve ser assim sempre, uns
     botões em cima com todas as opções e vai mudando o que aparece em baixo. muitas categorias estão
     fora do lugar e sem sentido e sem nexo..!"
     Em cima, os botões: tudo o que o Atlas tem, na ordem do mais vasto ao mais perto (a Terra agora, o
     tempo, a vida, as energias, a luz, o saber, o planeta, os números). Embaixo, o escolhido, na hora.
     O endereço guarda a escolha (#ver=vida): a bola de volta, o voltar do navegador e as fixadas
     acompanham. As páginas que já existiam (vida.html, energias.html, iluminacao.html, dados.html)
     entram inteiras aqui, na primeira vez que são pedidas, e continuam abrindo sozinhas pelo endereço.
     O que estava no Atlas sem ser do Atlas voltou para o seu lugar: a revolução ontológica e "Quem fez"
     (no Manifesto e na casa de entrada), os guias e a curadoria (nas portas deles), as fichas por seção
     e o próximo tijolo (nas Fichas e em Falta), o "o que é" (na casa de entrada).
     ============================================================ */
  var P = window.Perfil;
  var esc = P.esc;
  var PUBLICO = !!(window.JADESUN_ESTATICO && window.JADESUN_ESTATICO.modo === 'publico');
  var raiz = document.getElementById('atlas');
  var barra = document.getElementById('at-ver');
  if (!raiz || !barra) return;
  var quando = document.getElementById('atlas-quando');
  if (quando) quando.textContent = P.dataExtenso();
  var horaEl = document.getElementById('atlas-hora');
  function relogio() { if (horaEl) horaEl.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' em Campinas'; }
  relogio(); setInterval(relogio, 30000);

  function n(v) { return Number(v || 0).toLocaleString('pt-BR'); }
  var ic = function (nome) { return P.icone(nome); };
  function sec(id, rotulo, titulo, acao, corpo, classe) {
    return '<section class="atlas-sec ' + (classe || '') + '" data-secao="' + id + '" data-rotulo="' + esc(rotulo) + '" aria-labelledby="at-' + id + '">' +
      '<header class="at-cab"><div><p class="rot">' + esc(rotulo) + '</p><h2 class="h2" id="at-' + id + '">' + titulo + '</h2></div>' + (acao || '') + '</header>' + corpo + '</section>';
  }

  /* [id, o botão, o que é (o title do botão), a página que entra inteira, ou nada quando o Atlas desenha] */
  var VER = [
    ['terra', 'A Terra agora', 'O dia e a noite deste minuto, as cidades, o sol a pino', null],
    ['tempo', 'O tempo', 'As revoluções, da formação da Terra até agora', null],
    ['vida', 'A vida', 'Todos os reinos e grupos, as espécies, as formas e as origens', 'vida.html'],
    ['energias', 'As energias', 'A lei, as formas, como uma vira a outra e de onde vem cada uma', 'energias.html'],
    ['luz', 'A luz', 'Todas as alternativas de iluminação, do olho ao céu', 'iluminacao.html'],
    ['saber', 'O saber', 'Todo o saber humano, em dez partes', null],
    ['planeta', 'O planeta', 'As cinco medidas que mais pesam e o que cada um pode fazer', null],
    ['numeros', 'Os números', 'O mundo em números, com a fonte de cada um', 'dados.html'],
  ];
  var IDS = VER.map(function (v) { return v[0]; });
  /* os endereços antigos continuam valendo */
  var ANTIGOS = { '#planeta': 'planeta', '#at-revolucoes': 'tempo', '#at-terra': 'terra', '#humanidade': 'saber' };

  barra.innerHTML = VER.map(function (v) {
    return '<button type="button" class="chip at-ver-b" role="tab" data-ver="' + v[0] + '" aria-selected="false" title="' + esc(v[2]) + '">' + esc(v[1]) + '</button>';
  }).join('');
  raiz.innerHTML = VER.map(function (v) { return '<div class="at-painel" data-painel="' + v[0] + '" role="tabpanel" hidden></div>'; }).join('');

  /* ---------- a Terra, agora ---------- */
  function terra(el) {
    el.innerHTML = '<section class="atlas-sec at-terra-sec" data-secao="terra" data-rotulo="A Terra, agora" aria-labelledby="at-terra-t">' +
      '<header class="at-cab"><div><p class="rot">Onde é dia, onde é noite</p><h2 class="h2" id="at-terra-t">A Terra agora</h2></div></header>' +
      '<figure class="at-terra"><p class="at-agora-mundo" id="at-agora-mundo" aria-live="polite"></p><div id="at-terra"></div>' +
      '<figcaption class="at-legenda"><span class="lg-dia">dia</span><span class="lg-noite">noite</span><span class="lg-cid">cidades acesas</span><span class="lg-sol">o sol a pino</span><span class="lg-voce">' + (PUBLICO ? 'Campinas, onde ele é feito' : 'você') + '</span>' +
      '<span class="lg-fonte">Natural Earth · projeção Equal Earth · o sol deste minuto</span></figcaption></figure></section>';
    if (window.TerraAgora) window.TerraAgora.montar(document.getElementById('at-terra'), { rotulo: PUBLICO ? 'Campinas' : '', aoAtualizar: function (r) {
      var a = document.getElementById('at-agora-mundo'); if (!a) return;
      var hora = r.hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      var km = Math.round(r.distancia * 111.2 / 100) * 100;
      a.innerHTML = 'Agora, ' + hora + ' em Campinas, é noite em <b>' + r.noite + ' das ' + r.total + '</b> maiores cidades do mundo, onde vivem cerca de <b>' + Math.round(r.pessoasNoite / 1e6) + ' milhões</b> de pessoas. ' +
        'O sol está a pino ' + (km < 300 ? 'sobre <b>' + esc(r.perto[5]) + '</b>' : 'a uns ' + n(km) + ' km de <b>' + esc(r.perto[5]) + '</b>') + (r.perto[6] ? ', ' + esc(window.TerraAgora.pais(r.perto)) : '') + '.';
    } });
  }

  /* ---------- o tempo: as revoluções ---------- */
  function tempo(el) {
    el.innerHTML = sec('revolucoes', 'Da formação da Terra até agora', 'As revoluções', '<a class="botao leve" href="linha-do-tempo.html">' + ic('quando') + 'A linha do tempo inteira</a>',
      '<div id="at-rv"></div>', 'at-rv-sec');
    if (window.Revolucoes) window.Revolucoes.montar(document.getElementById('at-rv'));
  }

  /* ---------- o saber: as dez partes ---------- */
  function saber(el) {
    el.innerHTML = sec('humanidade', 'O mapa da humanidade', 'Todo o saber, em dez partes',
      '<p class="at-cab-nota">A área de cada fatia é o quanto ' + (PUBLICO ? 'o acervo já tem' : 'você já tem') + '; os anéis são as eras; os pontos, os eventos.</p>',
      '<div class="hm"><div class="hm-rosa" id="hm-rosa"><p class="rot suave">Desenhando o mapa…</p></div><ol class="hm-lista" id="hm-lista"></ol></div>');
    fetch('/api/biblioteca').then(function (r) { if (!r.ok) throw new Error('biblioteca'); return r.json(); }).then(function (ind) {
      var L = window.LINHA || { EVENTS: [], ERAS: [], AREAS: [] };
      if (!window.MapaHumanidade) return;
      var m = window.MapaHumanidade.desenhar(document.getElementById('hm-rosa'), ind, L);
      document.getElementById('hm-lista').innerHTML = m.partes.map(function (p, i) {
        return '<li><button type="button" data-parte="' + i + '" style="--c:' + p.def.cor + '"><i aria-hidden="true"></i><b>' + esc(p.def.nome) + '</b><span>' + n(p.total) + '</span></button></li>';
      }).join('');
      document.getElementById('hm-lista').addEventListener('click', function (ev) { var b = ev.target.closest('[data-parte]'); if (b) m.abrir(+b.getAttribute('data-parte')); });
    }).catch(function () {
      var r = document.getElementById('hm-rosa'); if (r) r.innerHTML = '<p class="rot suave">O mapa do saber precisa do servidor ligado.</p>';
    });
  }

  /* ---------- o planeta: as medidas e os hábitos ---------- */
  var CHAVE = 'planeta-habitos-v1';
  function lerHab() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function gravarHab(h) { try { localStorage.setItem(CHAVE, JSON.stringify(h)); } catch (e) {} }
  function contagemPlaneta() {
    var f = lerHab(), t = 0, m = 0;
    window.PLANETA.aspectos.forEach(function (a) { a.habitos.forEach(function (h) { t++; if (f[a.id + '.' + h[0]]) m++; }); });
    return { t: t, m: m };
  }
  function planeta(el) {
    var PL = window.PLANETA;
    if (!PL) { el.innerHTML = ''; return; }
    var f = lerHab(), c = contagemPlaneta();
    var blocos = PL.aspectos.map(function (a, i) {
      var feitos = a.habitos.filter(function (h) { return f[a.id + '.' + h[0]]; }).length, pct = Math.round(feitos / a.habitos.length * 100);
      return '<button type="button" class="pl-bloco ' + a.cor + '" data-asp="' + i + '">' +
        '<span class="pl-b-topo"><span class="pl-b-nome">' + esc(a.nome) + '</span><span class="pl-anel" style="--p:' + pct + '" aria-hidden="true"></span></span>' +
        '<span class="pl-b-porque">' + esc(a.porque) + '</span>' +
        '<span class="pl-b-pe"><b data-conta="' + a.id + '">' + feitos + ' de ' + a.habitos.length + '</b> hábitos<span aria-hidden="true">' + ic('seguir') + '</span></span></button>';
    }).join('');
    el.innerHTML = sec('planeta', 'O planeta', 'O que cada um pode fazer',
      '<p class="at-cab-nota" id="pl-total">Você já faz <b>' + c.m + '</b> de ' + c.t + ' hábitos</p>',
      '<p class="pl-abre">' + esc(PL.abertura) + ' <small><a href="' + esc(PL.aberturaFonte[1]) + '" target="_blank" rel="noopener">' + esc(PL.aberturaFonte[0]) + '</a></small></p>' +
      '<ol class="pl-cinco" aria-label="As cinco medidas que mais pesam">' + PL.cinco.map(function (x, i) { return '<li><b>' + (i + 1) + '</b><span><strong>' + esc(x[0]) + '</strong>' + esc(x[1]) + '</span></li>'; }).join('') + '</ol>' +
      '<div class="pl-grade">' + blocos + '</div>', 'pl');
    el.addEventListener('click', function (ev) { var b = ev.target.closest('.pl-bloco'); if (b) abrirAspecto(+b.getAttribute('data-asp')); });
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

  /* ---------- as páginas que entram inteiras (a vida, as energias, a luz, os números) ----------
     Na primeira vez: as folhas de estilo dela (esperando carregar, para não piscar), o conteúdo do miolo
     (sem o aviso e sem os créditos, que a casca já tem) e os scripts dela, na ordem. */
  var CASCA = /^(tema|icones|mapa-dados|perfil|solar|lenis|motion|meudia|estatico|arrumar)\.js$/;
  function carregarScript(src) {
    return new Promise(function (ok, falha) {
      if (document.querySelector('script[src="' + src + '"]')) { ok(); return; }
      var s = document.createElement('script'); s.src = src; s.onload = function () { ok(); }; s.onerror = falha; document.body.appendChild(s);
    });
  }
  function carregarEstilo(href) {
    return new Promise(function (ok) {
      if (document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) { ok(); return; }
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.onload = ok; l.onerror = ok;
      document.head.insertBefore(l, document.querySelector('link[href="respiro.css"]'));
    });
  }
  function pagina(el, url) {
    el.innerHTML = '<p class="rot suave at-abrindo">Abrindo…</p>';
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url); return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var estilos = Array.prototype.map.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (l) { return l.getAttribute('href'); })
        .filter(function (h) { return h && !/^https?:/.test(h); });
      return Promise.all(estilos.map(carregarEstilo)).then(function () {
        var miolo = doc.querySelector('main.miolo');
        el.innerHTML = '';
        Array.prototype.forEach.call(miolo ? miolo.children : [], function (c) {
          if (c.matches('.faixa, #aviso-linha, .creditos-linha')) return;
          var no = document.importNode(c, true);
          /* o título da página vira o título da vista (um h1 por página: o do Atlas) */
          no.querySelectorAll('h1').forEach(function (h) { var h2 = document.createElement('h2'); h2.className = h.className; h2.innerHTML = h.innerHTML; h.replaceWith(h2); });
          el.appendChild(no);
        });
        var scripts = Array.prototype.map.call(doc.querySelectorAll('script[src]'), function (s) { return s.getAttribute('src'); })
          .filter(function (src) { return !CASCA.test(src.split('/').pop()); });
        return scripts.reduce(function (p, src) { return p.then(function () { return carregarScript(src); }); }, Promise.resolve());
      });
    }).catch(function () { el.innerHTML = '<p class="rot suave">Não consegui abrir agora.</p>'; });
  }

  /* ---------- a escolha ---------- */
  var montados = {}, atual = 'terra';
  /* uma marca que não é do Atlas (#fonte-…, #arvore) não troca a vista: só rola até ela */
  function lerVer() {
    var h = location.hash, m = h.match(/^#ver=([a-z]+)/);
    if (m && IDS.indexOf(m[1]) >= 0) atual = m[1];
    else if (ANTIGOS[h]) atual = ANTIGOS[h];
    return atual;
  }
  var mostrado = null;
  function mostrar() {
    var id = lerVer(), v = VER[IDS.indexOf(id)];
    if (id === mostrado) return;
    mostrado = id;
    barra.querySelectorAll('[data-ver]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-ver') === id)); });
    raiz.querySelectorAll('[data-painel]').forEach(function (el) { el.hidden = el.getAttribute('data-painel') !== id; });
    document.title = (id === 'terra' && !/#ver=/.test(location.hash) ? 'O Atlas' : v[1] + ' · Atlas') + ' — Portal Solar';
    var el = raiz.querySelector('[data-painel="' + id + '"]');
    if (!montados[id]) {
      montados[id] = true;
      if (v[3]) pagina(el, v[3]).then(function () { if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar(); });
      else ({ terra: terra, tempo: tempo, saber: saber, planeta: planeta })[id](el);
    }
    el.classList.remove('at-chega'); void el.offsetWidth; el.classList.add('at-chega');
    if (window.Movimento && window.Movimento.revalidar) window.Movimento.revalidar();
  }
  barra.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ver]'); if (!b) return;
    var alvo = '#ver=' + b.getAttribute('data-ver');
    if (location.hash !== alvo) location.hash = alvo; else { mostrado = null; mostrar(); }
    var topo = barra.getBoundingClientRect().top;
    if (topo < 0 || window.scrollY > barra.offsetTop) window.scrollTo({ top: Math.max(0, barra.offsetTop - 80) });
  });
  window.addEventListener('hashchange', mostrar);
  mostrar();
})();
