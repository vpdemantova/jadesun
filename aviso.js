/* ============================================================
   O AVISO (21/out/2026, registro 114)
   "Esta interface é emergencial e provisória", e logo embaixo o que não pode esperar:
   as causas, o mundo agora, os avanços, as novas tecnologias, as tendências e a sua área.
   · no Início (atlas.html): o bloco inteiro, antes do cabeçalho do Portal Solar;
   · nas outras páginas: a linha do aviso (perfil.js) abre o mesmo conteúdo numa folha.
   Os dados moram em aviso-dados.js; as notícias vêm das fontes do Guias (guias-dados.js).
   A área escolhida fica neste aparelho ('aviso-area'), como tudo o que é preferência.
   ============================================================ */
(function () {
  'use strict';
  var D = window.AVISO;
  if (!D) return;
  var P = window.Perfil || {};
  var esc = P.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var CHAVE = 'aviso-area';
  /* desde 21/out/2026 (registro 115) as áreas moram num lugar só, o mapa de Todas as áreas (campos-dados.js):
     as três primeiras fontes de cada área são as do aviso. Sem o mapa carregado, a parte das áreas não aparece. */
  var CA = window.CAMPOS;
  var AREAS = CA ? CA.areas.map(function (a) { return [a.id, a.nome, a.fontes.slice(0, 3).map(function (f) { return [f[0], f[1], f[2]]; })]; }) : D.areas;
  var temCampos = !!CA && aqui('campos');

  /* uma fonte: [nome, endereço, por quê]; { guias: 'id' } busca a do Guias (as notícias não se repetem) */
  function fonte(f) {
    if (Array.isArray(f)) return f;
    var g = window.GUIAS && window.GUIAS.fontes.filter(function (x) { return x[0] === f.guias; })[0];
    return g ? [g[2], g[3], g[5]] : null;
  }
  /* a página de dentro só aparece se estiver neste site (o público não leva o Doar, por exemplo) */
  function aqui(id) {
    if (P.permitida && !P.permitida(id)) return false;
    var e = P.estatico && P.estatico();
    if (e && e.modo === 'publico' && window.MAPA) {
      var po = window.MAPA.porta(window.MAPA.paiDe(id));
      if (po && po.publico === false) return false;
    }
    return true;
  }
  function link(f, classe) {
    return '<a' + (classe ? ' class="' + classe + '"' : '') + ' href="' + esc(f[1]) + '" target="_blank" rel="noopener" title="' + esc(f[2]) + '">' + esc(f[0]) + '</a>';
  }
  function lerArea() { try { return localStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } }
  function gravarArea(id) { try { localStorage.setItem(CHAVE, id); } catch (e) {} }
  function areaPorId(id) { return AREAS.filter(function (a) { return a[0] === id; })[0] || AREAS[0]; }

  /* "OMS, as notícias da saúde no mundo; STAT, a fronteira…; e Agência Fiocruz, a saúde pública no Brasil." */
  function corrido(fontes) {
    var partes = fontes.map(function (f) { return link(f) + ', ' + esc(f[2]); });
    if (partes.length > 1) partes[partes.length - 1] = 'e ' + partes[partes.length - 1];
    return partes.join('; ') + '.';
  }

  function colunas() {
    return '<div class="aviso-grade">' + D.colunas.map(function (c) {
      var fontes = c[3].map(fonte).filter(Boolean);
      var dentro = (c[4] || []).filter(function (d) { return aqui(d[0]); });
      return '<section class="aviso-col" id="aviso-' + c[0] + '" aria-labelledby="aviso-' + c[0] + '-t">' +
        '<h3 class="aviso-col-t" id="aviso-' + c[0] + '-t">' + esc(c[1]) + '</h3>' +
        '<p class="aviso-col-sub">' + esc(c[2]) + '</p>' +
        '<ul class="aviso-lista">' + fontes.map(function (f) { return '<li>' + link(f) + '<span>' + esc(f[2]) + '</span></li>'; }).join('') + '</ul>' +
        '<p class="aviso-corrido">' + fontes.map(function (f) { return link(f); }).join(' · ') + '</p>' +
        (dentro.length ? '<p class="aviso-dentro">No Portal: ' + dentro.map(function (d) { return '<a href="' + esc(d[1]) + '">' + esc(d[2]) + '</a>'; }).join(' · ') + '</p>' : '') +
      '</section>';
    }).join('') + '</div>';
  }

  /* na sua área: no Início, os nomes das áreas e a escolhida em texto corrido; na folha, todas */
  function areas(todas) {
    if (!AREAS.length) return '';
    var sel = areaPorId(lerArea());
    if (todas) {
      return '<section class="aviso-areas aviso-areas-todas" id="aviso-areas" aria-labelledby="aviso-areas-t">' +
        '<h3 class="aviso-col-t" id="aviso-areas-t">Na sua área</h3><p class="aviso-col-sub">três fontes para cada uma das ' + AREAS.length + ' áreas' + (temCampos ? '; as subáreas, as vagas e as comunidades estão em <a href="campos.html">Todas as áreas</a>' : '') + '</p>' +
        AREAS.map(function (a) { return '<p class="aviso-area-linha' + (a[0] === sel[0] ? ' sua' : '') + '"><b>' + esc(a[1]) + '.</b> ' + corrido(a[2]) + '</p>'; }).join('') +
      '</section>';
    }
    return '<section class="aviso-areas" id="aviso-areas" aria-labelledby="aviso-areas-t">' +
      '<h3 class="aviso-col-t" id="aviso-areas-t">Na sua área</h3>' +
      '<div class="aviso-areas-corpo">' +
        '<p class="aviso-areas-escolha"><label for="aviso-sel">A sua área</label> <select id="aviso-sel" data-aviso-sel>' + AREAS.map(function (a) {
          return '<option value="' + a[0] + '"' + (a[0] === sel[0] ? ' selected' : '') + '>' + esc(a[1]) + '</option>';
        }).join('') + '</select></p>' +
        '<p class="aviso-area-linha" aria-live="polite" data-aviso-painel><b>' + esc(sel[1]) + '.</b> ' + corrido(sel[2]) + '</p>' +
        '<p class="aviso-dentro">' + (temCampos ? '<a href="campos.html#dez">Os seus dez minutos de hoje</a>, com as manchetes, as vagas e uma subárea por dia · ' : '') +
          '<button type="button" class="aviso-mais" data-aviso-abrir="areas">Todas as áreas, em texto corrido</button></p>' +
      '</div>' +
    '</section>';
  }

  function cabeca(emFolha) {
    var T = D.texto;
    if (emFolha) return '<p class="aviso-folha-txt">' + esc(T.corpo) + '</p>';
    return '<div class="aviso-cab"><p class="rot">' + esc(T.rotulo) + '</p>' +
      '<div class="aviso-cab-txt"><h2 class="aviso-t" id="aviso-t" data-indice="Aviso">' + esc(T.titulo) + '</h2>' +
      '<p class="aviso-txt">' + esc(T.corpo) + '</p></div></div>';
  }
  function html(o) {
    o = o || {};
    var T = D.texto;
    return cabeca(o.emFolha) + colunas() + areas(o.emFolha) +
      '<p class="aviso-assina">' + esc(T.assinatura) + (aqui('participe') ? ' Falta uma fonte ou a sua área? <a href="participe.html#curadoria">Proponha</a>.' : '') + '</p>';
  }

  function ligar(raiz) {
    raiz.addEventListener('change', function (ev) {
      if (!ev.target.matches || !ev.target.matches('[data-aviso-sel]')) return;
      var a = areaPorId(ev.target.value);
      gravarArea(a[0]);
      var painel = raiz.querySelector('[data-aviso-painel]');
      if (painel) painel.innerHTML = '<b>' + esc(a[1]) + '.</b> ' + corrido(a[2]);
    });
    raiz.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-aviso-area]');
      if (b) {
        var a = areaPorId(b.getAttribute('data-aviso-area'));
        gravarArea(a[0]);
        Array.prototype.forEach.call(raiz.querySelectorAll('[data-aviso-area]'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var painel = raiz.querySelector('[data-aviso-painel]');
        if (painel) painel.innerHTML = '<b>' + esc(a[1]) + '.</b> ' + corrido(a[2]);
        return;
      }
      var m = ev.target.closest('[data-aviso-abrir]');
      if (m) abrir(m.getAttribute('data-aviso-abrir'));
    });
  }

  /* a folha: o mesmo conteúdo, com todas as áreas; abre na parte pedida */
  function abrir(parte) {
    if (!P.folha) return;
    P.folha({ titulo: esc(D.texto.titulo), sub: esc(D.texto.rotulo), larga: true, html: '<div class="aviso aviso-na-folha">' + html({ emFolha: true }) + '</div>', aoAbrir: function (corpo) {
      ligar(corpo);
      var alvo = parte && corpo.querySelector('#aviso-' + parte);
      if (alvo) setTimeout(function () { alvo.scrollIntoView({ block: 'start' }); }, 60);
    } });
  }

  /* no Início, o bloco inteiro vem antes de tudo */
  function montarInicio() {
    if (document.body.dataset.pagina !== 'atlas' || document.getElementById('aviso')) return;
    var antes = document.querySelector('.ps-cab') || document.querySelector('.at-topo');
    if (!antes) return;
    var s = document.createElement('section');
    s.className = 'aviso';
    s.id = 'aviso';
    s.setAttribute('aria-labelledby', 'aviso-t');
    s.setAttribute('data-secao', 'aviso');
    s.setAttribute('data-rotulo', 'Aviso');
    s.innerHTML = html();
    antes.parentNode.insertBefore(s, antes);
    ligar(s);
  }
  /* 25/out/2026 (registro 118): o bloco não entra mais no Início; o aviso ficou discreto, na linha dos
     créditos de cada página ("O que importa agora"), que abre esta mesma folha */

  window.Aviso = { abrir: abrir, html: html };
})();
