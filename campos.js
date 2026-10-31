/* ============================================================
   TODAS AS ÁREAS (21/out/2026, registro 115)
   "todos os dias cada pessoa pode ter 10 minutos com uma ontologia global em todas as áreas…
   conhecer os mercados e nichos e comunidades de cada uma, se especializar e mudar de carreira".

   Três partes, na ordem da página:
   1. OS SEUS DEZ MINUTOS: a área escolhida (a mesma do aviso, 'aviso-area', guardada no aparelho)
      e quatro passos: o que mudou (as manchetes de hoje), uma subárea (gira a cada dia), o mercado
      (as vagas) e fora da sua área (uma área do mundo por dia). "Começar" liga um relógio de dez
      minutos: um fio cresce no alto e o passo da vez se acende. Nada se mexe sem o gesto.
   2. O MAPA: as onze grandes áreas, cada área numa linha; um clique abre a folha com tudo.
   3. COMO FOI FEITO: a classificação, as fontes, a data.
   Os dados moram em campos-dados.js; as manchetes e as vagas vêm de /api/agora (o servidor de casa
   ou a função da Vercel, o mesmo motor) e, se ela faltar, da cópia api/agora-<área>.json.
   ============================================================ */
(function () {
  'use strict';
  var C = window.CAMPOS;
  var raiz = document.getElementById('cp');
  if (!C || !raiz) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CHAVE = 'aviso-area';
  var CALMO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lerArea() { try { return localStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } }
  function gravarArea(id) { try { localStorage.setItem(CHAVE, id); } catch (e) {} }
  function minha() { return C.area(lerArea()) || C.areas[0]; }

  /* ---------- o agora de uma área: a função (ou o servidor de casa) e, se faltar, a cópia ---------- */
  var pedidos = {};
  function agoraDe(id) {
    if (!pedidos[id]) {
      var ler = function (u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
      pedidos[id] = ler('/api/agora?area=' + encodeURIComponent(id))
        .catch(function () { return ler('api/agora-' + id + '.json'); })
        .catch(function () { return null; });
    }
    return pedidos[id];
  }

  /* ---------- pequenos ---------- */
  function quando(iso) {
    if (!iso) return '';
    var d = new Date(iso), h = (Date.now() - d.getTime()) / 36e5;
    if (h < 1) return 'agora há pouco';
    if (h < 24) return 'há ' + Math.floor(h) + ' h';
    if (h < 48) return 'ontem';
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
  }
  function fora(href, txt, titulo, classe) {
    return '<a' + (classe ? ' class="' + classe + '"' : '') + ' href="' + esc(href) + '" target="_blank" rel="noopener"' + (titulo ? ' title="' + esc(titulo) + '"' : '') + '>' + esc(txt) + '</a>';
  }
  function corrido(lista) {
    if (lista.length < 2) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
  }
  function nomeSub(s) { return s[1]; }
  function grandeDe(a) { return C.grande(a.g); }
  function codGrande(g) { return g[0] === 'C' ? '—' : g[0]; }
  function hojeExtenso() {
    var t = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /* as manchetes: título, fonte, quando */
  function htmlNoticias(lista, n) {
    if (!lista || !lista.length) return '<p class="cp-vazio">As fontes desta área não trouxeram manchetes agora. Os sites estão logo abaixo, em Fontes.</p>';
    return '<ol class="cp-lista">' + lista.slice(0, n).map(function (it) {
      return '<li><a href="' + esc(it.link) + '" target="_blank" rel="noopener"><span class="cp-l-t">' + esc(it.titulo) + '</span><span class="cp-l-m">' + esc(it.fonte) + ' · ' + esc(quando(it.data)) + '</span></a></li>';
    }).join('') + '</ol>';
  }
  function htmlVagas(dados, n) {
    if (!dados || !dados.vagas || !dados.vagas.length) return '';
    return '<ol class="cp-lista cp-lista-vagas">' + dados.vagas.slice(0, n).map(function (v) {
      var meta = [v.empresa, v.lugar, quando(v.data)].filter(Boolean).join(' · ');
      return '<li><a href="' + esc(v.link) + '" target="_blank" rel="noopener"><span class="cp-l-t">' + esc(v.titulo) + '</span><span class="cp-l-m">' + esc(meta) + '</span></a></li>';
    }).join('') + '</ol>' +
      (dados.vagasDe ? '<p class="cp-credito">Vagas remotas abertas, da ' + fora(dados.vagasDe[1], dados.vagasDe[0]) + '; a candidatura é no endereço de cada vaga.</p>' : '');
  }
  function htmlBuscas(a) {
    var gerais = C.buscas(a).map(function (b) { return fora(b[1], b[0], b[2]); });
    var proprias = a.vagas.map(function (v) { return fora(v[1], v[0], v[2]); });
    return '<p class="cp-buscas"><span class="cp-rot">Buscas prontas</span> ' + gerais.join(' · ') + '</p>' +
      (proprias.length ? '<p class="cp-buscas"><span class="cp-rot">Quadros da área</span> ' + proprias.join(' · ') + '</p>' : '');
  }
  function atualizado(d) {
    if (!d || !d.em) return '';
    return '<p class="cp-credito">Atualizado ' + esc(quando(d.em)) + (d.semInternet ? ', a última cópia guardada' : '') + '. Sem algoritmo: só a data ordena.</p>';
  }

  /* ============================================================
     1. OS SEUS DEZ MINUTOS
     ============================================================ */
  function opcoes(sel) {
    return C.grandes.map(function (g) {
      var as = C.areas.filter(function (a) { return a.g === g[0]; });
      return '<optgroup label="' + esc(codGrande(g) + ' · ' + g[1]) + '">' + as.map(function (a) {
        return '<option value="' + a.id + '"' + (a.id === sel ? ' selected' : '') + '>' + esc(a.nome) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  function htmlDez() {
    var a = minha();
    return '<section class="cp-dez cp-chega" id="dez" aria-labelledby="dez-t">' +
      '<header class="cp-sec-cab">' +
        '<h2 id="dez-t">Os seus dez minutos</h2>' +
        '<p class="cp-sec-sub">' + esc(hojeExtenso()) + '. Três minutos para o que mudou, três para uma subárea, três para o mercado e um para fora da sua área.</p>' +
      '</header>' +
      '<div class="cp-escolha">' +
        '<label class="cp-escolha-r" for="cp-area">A sua área</label>' +
        '<span class="cp-sel"><select id="cp-area">' + opcoes(a.id) + '</select></span>' +
        '<button type="button" class="cp-comecar" id="cp-comecar" aria-pressed="false"><span class="cp-comecar-t">Começar os dez minutos</span><span class="cp-relogio" id="cp-relogio" aria-live="off">10:00</span></button>' +
      '</div>' +
      '<div class="cp-fio" aria-hidden="true"><i id="cp-fio"></i></div>' +
      '<ol class="cp-passos" id="cp-passos"></ol>' +
    '</section>';
  }

  function passo(i, de, ate, titulo, corpo) {
    return '<li class="cp-passo" data-de="' + de + '" data-ate="' + ate + '">' +
      '<p class="cp-min"><span>' + String(i).padStart(2, '0') + '</span>' + de + '–' + ate + ' min</p>' +
      '<h3 class="cp-passo-t">' + titulo + '</h3>' +
      '<div class="cp-passo-c">' + corpo + '</div>' +
    '</li>';
  }

  function preencherPassos() {
    var lista = document.getElementById('cp-passos');
    if (!lista) return;
    var a = minha(), sub = C.subDoDia(a), outra = C.doDia(a.id), g = grandeDe(a);
    var comunidades = a.comunidades.slice(0, 3).map(function (c) { return fora(c[1], c[0], c[2]); });
    lista.innerHTML =
      passo(1, 0, 3, 'O que mudou', '<div data-cp="noticias"><p class="cp-espera">Buscando as manchetes de hoje nas fontes de ' + esc(a.nome) + '…</p></div>') +
      passo(2, 3, 6, 'Uma subárea',
        '<p class="cp-sub-hoje"><b>' + esc(sub[1]) + '</b></p>' +
        '<p class="cp-de">' + (sub[0] ? 'ISCED ' + esc(sub[0]) + ' · ' : '') + esc(a.nome) + '</p>' +
        '<p class="cp-txt"><span class="cp-rot">Os nichos e mercados da área</span> ' + esc(corrido(a.nichos)) + '.</p>' +
        (comunidades.length ? '<p class="cp-txt"><span class="cp-rot">Onde a comunidade se encontra</span> ' + comunidades.join(' · ') + '</p>' : '') +
        '<p class="cp-txt"><span class="cp-rot">Como se entra</span> ' + esc(a.entrar) + '</p>') +
      passo(3, 6, 9, 'O mercado', '<div data-cp="vagas"><p class="cp-espera">Buscando vagas abertas…</p></div>' + htmlBuscas(a)) +
      passo(4, 9, 10, 'Fora da sua área',
        '<p class="cp-sub-hoje"><b>' + esc(outra.nome) + '</b></p>' +
        '<p class="cp-de">' + esc(grandeDe(outra)[1]) + '</p>' +
        '<p class="cp-txt cp-perg">' + esc(outra.pergunta) + '</p>' +
        '<div data-cp="fora"><p class="cp-espera">…</p></div>' +
        '<p class="cp-txt"><button type="button" class="cp-link" data-abrir-area="' + outra.id + '">Abrir ' + esc(outra.nome) + '</button></p>');

    agoraDe(a.id).then(function (d) {
      if (minha().id !== a.id) return;
      var n = lista.querySelector('[data-cp="noticias"]'), v = lista.querySelector('[data-cp="vagas"]');
      if (n) n.innerHTML = d ? htmlNoticias(d.noticias, 5) + atualizado(d) : htmlNoticias(null);
      if (v) v.innerHTML = d && d.vagas && d.vagas.length ? htmlVagas(d, 4) : '<p class="cp-txt">Para esta área, as vagas estão nos quadros do Brasil: as buscas abaixo já levam a palavra certa.</p>';
    });
    agoraDe(outra.id).then(function (d) {
      var f = lista.querySelector('[data-cp="fora"]');
      if (!f) return;
      var it = d && d.noticias && d.noticias[0];
      f.innerHTML = it ? '<ol class="cp-lista"><li><a href="' + esc(it.link) + '" target="_blank" rel="noopener"><span class="cp-l-t">' + esc(it.titulo) + '</span><span class="cp-l-m">' + esc(it.fonte) + ' · ' + esc(quando(it.data)) + '</span></a></li></ol>' : '';
    });
    marcarPasso();
  }

  /* o relógio dos dez minutos: um fio que cresce e o passo da vez aceso; nada guardado */
  var inicio = 0, tique = null;
  function marcarPasso() {
    var fio = document.getElementById('cp-fio'), rel = document.getElementById('cp-relogio'), bt = document.getElementById('cp-comecar');
    var passos = document.querySelectorAll('.cp-passo');
    if (!inicio) {
      if (fio) fio.style.transform = 'scaleX(0)';
      if (rel) rel.textContent = '10:00';
      passos.forEach(function (p) { p.removeAttribute('aria-current'); });
      return;
    }
    var s = Math.min(600, (Date.now() - inicio) / 1000), m = s / 60, resta = Math.max(0, Math.ceil(600 - s));
    if (fio) fio.style.transform = 'scaleX(' + (s / 600).toFixed(4) + ')';
    if (rel) rel.textContent = s >= 600 ? 'Pronto' : String(Math.floor(resta / 60)).padStart(2, '0') + ':' + String(resta % 60).padStart(2, '0');
    passos.forEach(function (p) { if (m >= +p.dataset.de && m < +p.dataset.ate) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current'); });
    if (s >= 600) { clearInterval(tique); tique = null; if (bt) { bt.setAttribute('aria-pressed', 'false'); bt.querySelector('.cp-comecar-t').textContent = 'Até amanhã'; } }
  }
  function alternar() {
    var bt = document.getElementById('cp-comecar');
    if (tique || (inicio && Date.now() - inicio >= 600000)) {
      clearInterval(tique); tique = null; inicio = 0;
      bt.setAttribute('aria-pressed', 'false'); bt.querySelector('.cp-comecar-t').textContent = 'Começar os dez minutos';
      document.documentElement.classList.remove('cp-correndo');
      marcarPasso();
      return;
    }
    inicio = Date.now();
    bt.setAttribute('aria-pressed', 'true'); bt.querySelector('.cp-comecar-t').textContent = 'Parar';
    document.documentElement.classList.add('cp-correndo');
    tique = setInterval(marcarPasso, 1000);
    marcarPasso();
  }

  /* ============================================================
     2. O MAPA
     ============================================================ */
  function htmlMapa() {
    var tot = C.areas.length;
    return '<section class="cp-mapa" id="mapa" aria-labelledby="mapa-t">' +
      '<header class="cp-sec-cab cp-chega">' +
        '<h2 id="mapa-t">O mapa das áreas</h2>' +
        '<p class="cp-sec-sub">As dez grandes áreas da UNESCO e os três caminhos que atravessam todas: ' + tot + ' áreas. Cada uma abre com as subáreas, os nichos, o que muda hoje, as vagas, a comunidade e o jeito de entrar.</p>' +
      '</header>' +
      C.grandes.map(function (g) {
        var as = C.areas.filter(function (a) { return a.g === g[0]; });
        return '<section class="cp-grande cp-chega" aria-labelledby="g-' + g[0] + '">' +
          '<header class="cp-g-cab"><span class="cp-g-cod" aria-hidden="true">' + esc(codGrande(g)) + '</span>' +
            '<h3 class="cp-g-t" id="g-' + g[0] + '">' + esc(g[1]) + '</h3><p class="cp-g-o">' + esc(g[2]) + '</p></header>' +
          '<ul class="cp-areas">' + as.map(function (a) {
            return '<li><button type="button" class="cp-area" data-abrir-area="' + a.id + '">' +
              '<span class="cp-a-nome">' + esc(a.nome) + '</span>' +
              '<span class="cp-a-perg">' + esc(a.pergunta) + '</span>' +
              '<span class="cp-a-sub">' + esc(a.sub.map(nomeSub).join(' · ')) + '</span>' +
              '<span class="cp-a-n">' + a.sub.length + ' subáreas · ' + a.nichos.length + ' nichos · ' + a.fontes.length + ' fontes</span>' +
            '</button></li>';
          }).join('') + '</ul>' +
        '</section>';
      }).join('') +
    '</section>';
  }

  /* a folha de uma área: tudo dela, numa coluna */
  function abrirArea(id) {
    var a = C.area(id);
    if (!a || !P.folha) return;
    var g = grandeDe(a), sua = minha().id === a.id;
    var html =
      '<p class="cp-f-perg">' + esc(a.pergunta) + '</p>' +
      '<p class="cp-f-acoes">' + (sua ? '<span class="cp-f-sua">É a sua área</span>' : '<button type="button" class="cp-link" data-escolher="' + a.id + '">Escolher como a minha área</button>') + '</p>' +
      '<section class="cp-f-sec"><h3>Subáreas</h3><ol class="cp-f-subs">' + a.sub.map(function (s) {
        return '<li>' + (s[0] ? '<span class="cp-cod">' + esc(s[0]) + '</span>' : '<span class="cp-cod cp-cod-v" aria-hidden="true">·</span>') + '<span>' + esc(s[1]) + '</span></li>';
      }).join('') + '</ol></section>' +
      '<section class="cp-f-sec"><h3>Nichos e mercados</h3><p class="cp-txt">' + esc(corrido(a.nichos)) + '.</p></section>' +
      '<section class="cp-f-sec"><h3>O que mudou</h3><div data-cp-f="noticias"><p class="cp-espera">Buscando as manchetes…</p></div></section>' +
      '<section class="cp-f-sec"><h3>Vagas</h3><div data-cp-f="vagas"></div>' + htmlBuscas(a) + '</section>' +
      '<section class="cp-f-sec"><h3>Onde a comunidade se encontra</h3><ul class="cp-f-fontes">' + a.comunidades.map(function (c) {
        return '<li>' + fora(c[1], c[0]) + '<span>' + esc(c[2]) + '</span></li>';
      }).join('') + '</ul></section>' +
      '<section class="cp-f-sec"><h3>Como se entra</h3><p class="cp-txt">' + esc(a.entrar) + '</p></section>' +
      '<section class="cp-f-sec"><h3>Para mudar de área</h3><p class="cp-txt">As vizinhas, onde o que se sabe aqui serve: ' + a.vizinhas.map(function (v) {
        var x = C.area(v); return x ? '<button type="button" class="cp-link" data-abrir-area="' + x.id + '">' + esc(x.nome) + '</button>' : '';
      }).filter(Boolean).join(', ') + '.</p></section>' +
      '<section class="cp-f-sec"><h3>As fontes</h3><ul class="cp-f-fontes">' + a.fontes.map(function (f) {
        return '<li>' + fora(f[1], f[0]) + '<span>' + esc(f[2]) + '</span></li>';
      }).join('') + '</ul></section>' +
      (a.isced.length ? '<p class="cp-credito">Na classificação da UNESCO (ISCED-F 2013): ' + esc(a.isced.join(', ')) + '.</p>' : '<p class="cp-credito">Um caminho que atravessa todas as áreas; não é um campo da classificação da UNESCO.</p>');
    P.folha({
      titulo: esc(a.nome), sub: esc(codGrande(g) + ' · ' + g[1]), html: html,
      aoAbrir: function (corpo) {
        agoraDe(a.id).then(function (d) {
          var n = corpo.querySelector('[data-cp-f="noticias"]'), v = corpo.querySelector('[data-cp-f="vagas"]');
          if (n) n.innerHTML = d ? htmlNoticias(d.noticias, 8) + atualizado(d) : htmlNoticias(null);
          if (v) v.innerHTML = htmlVagas(d, 6);
        });
      },
    });
  }

  /* ============================================================
     3. COMO FOI FEITO
     ============================================================ */
  function htmlComo() {
    return '<section class="cp-como cp-chega" id="como" aria-labelledby="como-t">' +
      '<h2 id="como-t">Como foi feito</h2>' +
      '<p class="cp-txt">' + esc(C.texto.metodo) + '</p>' +
      '<p class="cp-txt">A classificação: ' + fora('https://uis.unesco.org/en/topic/international-standard-classification-education-isced', 'ISCED, Instituto de Estatística da UNESCO') + '. Os três caminhos (a pesquisa, o serviço público e o terceiro setor) não são campos de estudo: são jeitos de trabalhar em qualquer um deles, e por isso ficam à parte.</p>' +
      '<p class="cp-txt">Falta alguma coisa, ou uma fonte deixou de ser boa? ' + '<a href="participe.html">Faça parte</a>: a lista é um arquivo só, aberto.</p>' +
    '</section>';
  }

  /* ---------- os números do alto ---------- */
  function numeros() {
    var dl = document.getElementById('cp-numeros');
    if (!dl) return;
    var soma = function (k) { return C.areas.reduce(function (n, a) { return n + a[k].length; }, 0); };
    var itens = [['grandes áreas', C.grandes.length - 1], ['caminhos', 3], ['áreas', C.areas.length], ['subáreas', soma('sub')], ['nichos', soma('nichos')], ['fontes', soma('fontes')], ['comunidades', soma('comunidades')]];
    dl.innerHTML = itens.map(function (x) { return '<div><dt>' + esc(x[0]) + '</dt><dd>' + x[1] + '</dd></div>'; }).join('');
    var corpo = document.getElementById('cp-corpo');
    if (corpo) corpo.textContent = C.texto.corpo;
  }

  /* ---------- a chegada: cada bloco se compõe uma vez, quando aparece (nada em repouso) ---------- */
  function chegar() {
    var els = document.querySelectorAll('.cp-chega');
    if (CALMO || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('cp-ok'); }); return; }
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('cp-ok'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- montar ---------- */
  numeros();
  raiz.innerHTML = htmlDez() + htmlMapa() + htmlComo();
  preencherPassos();
  chegar();

  document.getElementById('cp-area').addEventListener('change', function (ev) {
    gravarArea(ev.target.value);
    if (tique) alternar();
    preencherPassos();
  });
  document.getElementById('cp-comecar').addEventListener('click', alternar);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-abrir-area]');
    if (b) { abrirArea(b.getAttribute('data-abrir-area')); return; }
    var e = ev.target.closest && ev.target.closest('[data-escolher]');
    if (e) {
      var id = e.getAttribute('data-escolher');
      gravarArea(id);
      var sel = document.getElementById('cp-area');
      if (sel) sel.value = id;
      preencherPassos();
      e.outerHTML = '<span class="cp-f-sua">É a sua área</span>';
    }
  });
  /* #area=… abre a folha da área (o aviso e o Índice levam direto) */
  var m = location.hash.match(/^#area=([a-z-]+)/);
  if (m && C.area(m[1])) setTimeout(function () { abrirArea(m[1]); }, 200);

  window.Campos = { abrir: abrirArea };
})();
