(function () {
  'use strict';

  var P = window.Perfil;
  var esc = P.esc;
  var CHAVE = 'jadesun-cartao';

  /* ---------- utilidades e estado local ---------- */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  function chave(secao, texto) { return secao + '|' + texto; }
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}') || {}; } catch (e) { return {}; } }
  function gravar(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {} }
  function estadoDe(secao, texto) { return ler()[chave(secao, texto)] || {}; }
  function salvar(secao, texto, parte) {
    var o = ler();
    var k = chave(secao, texto);
    o[k] = Object.assign({}, o[k], parte);
    gravar(o);
    return o[k];
  }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function hojeISO() { return iso(new Date()); }
  function amanhaISO() { var d = new Date(); d.setDate(d.getDate() + 1); return iso(d); }

  function guardados() {
    var o = ler();
    return Object.keys(o).filter(function (k) { return o[k].guardado; }).map(function (k) { var p = k.split('|'); return { secao: p[0], texto: p.slice(1).join('|'), chave: k }; });
  }
  function revisoesDeHoje() {
    var o = ler();
    var h = hojeISO();
    return Object.keys(o).filter(function (k) { return o[k].rever && o[k].rever <= h; }).map(function (k) { var p = k.split('|'); return { secao: p[0], texto: p.slice(1).join('|'), chave: k }; });
  }

  /* ---------- título em tópicos ---------- */
  function dividirTitulo(texto) {
    var m = String(texto).match(/^(.*?)\s*\(([^()]*)\)\s*$/);
    if (!m) return { base: String(texto), subs: [] };
    var subs = m[2].split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    return { base: m[1].trim() || String(texto), subs: subs };
  }

  function casar(subs, lembrar) {
    var usados = {};
    var por = subs.map(function (s) {
      var sn = norm(s);
      if (sn.length >= 3) {
        for (var i = 0; i < lembrar.length; i++) {
          if (usados[i]) continue;
          var l = lembrar[i];
          var dp = l.indexOf(':');
          var cab = dp > 0 && dp < 70 ? l.slice(0, dp) : l.slice(0, 45);
          if (norm(cab).indexOf(sn) >= 0) { usados[i] = true; return { sub: s, texto: dp > 0 && dp < 70 ? l.slice(dp + 1).trim() : l }; }
        }
      }
      return { sub: s, texto: null };
    });
    return { por: por, sobras: lembrar.filter(function (_, i) { return !usados[i]; }), casou: por.filter(function (x) { return x.texto; }).length };
  }

  /* ---------- baralho (visão geral da matéria) ---------- */
  function baralho(estado, secaoNome, ao) {
    var s = estado.checklist.filter(function (x) { return x.nome === secaoNome; })[0];
    if (!s) return;
    var loc = ler();
    var h = hojeISO();
    var caixa = document.createElement('div');
    caixa.className = 'lb ce-baralho';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-label', 'Baralho de ' + secaoNome);
    caixa.setAttribute('data-lenis-prevent', '');
    var feitos = s.itens.filter(function (i) { return i.feito; }).length;
    caixa.innerHTML = '<div class="bx-caixa"><header><div><p class="rot">Baralho</p><h2 class="h2">' + esc(secaoNome) + '</h2></div><span class="rot">' + feitos + ' de ' + s.itens.length + ' dominados</span><button type="button" class="lb-x" aria-label="Fechar">×</button></header>' +
      '<p class="bx-leg"><span><i class="d"></i>dominado</span><span><i class="t"></i>com respostas</span><span><i class="g"></i>guardado</span><span><i class="r"></i>rever hoje</span><span><i class="n"></i>novo</span></p>' +
      '<div class="bx-grade">' + s.itens.map(function (i, n) {
        var st = loc[chave(secaoNome, i.texto)] || {};
        var cls = i.feito ? 'd' : st.rever && st.rever <= h ? 'r' : st.resp && st.resp.some(function (x) { return x !== null; }) ? 't' : 'n';
        var t = dividirTitulo(i.texto);
        return '<button type="button" class="bx ' + cls + (st.guardado ? ' g' : '') + '" data-i="' + n + '"><b>' + (n + 1) + '</b><span>' + esc(t.base) + '</span>' + (t.subs.length ? '<small>' + t.subs.length + (t.subs.length === 1 ? ' tópico' : ' tópicos') + '</small>' : '') + '</button>';
      }).join('') + '</div></div>';
    document.body.appendChild(caixa);
    var fechar = function () { document.removeEventListener('keydown', tecla); caixa.remove(); };
    var tecla = function (ev) { if (ev.key === 'Escape') fechar(); };
    document.addEventListener('keydown', tecla);
    caixa.addEventListener('click', function (ev) {
      if (ev.target === caixa || ev.target.classList.contains('lb-x')) return fechar();
      var b = ev.target.closest('.bx');
      if (b) { var item = s.itens[+b.getAttribute('data-i')]; fechar(); ao(secaoNome, item); }
    });
    caixa.querySelector('.lb-x').focus();
  }

  /* ---------- baralho de uma seção do Atlas (módulos da página inicial) ---------- */
  function baralhoAtlas(titulo, itens, ao) {
    var caixa = document.createElement('div');
    caixa.className = 'lb ce-baralho';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-label', 'Fichas de ' + titulo);
    caixa.setAttribute('data-lenis-prevent', '');
    caixa.innerHTML = '<div class="bx-caixa"><header><div><p class="rot">Módulo · Atlas</p><h2 class="h2">' + esc(titulo) + '</h2></div><span class="rot">' + itens.length + (itens.length === 1 ? ' ficha' : ' fichas') + '</span><button type="button" class="lb-x" aria-label="Fechar">×</button></header>' +
      '<div class="bx-grade">' + itens.map(function (i, n) {
        var img = i.capa ? '<span class="bx-img" style="background-image:url(\'' + esc(i.capa) + '\')"></span>' : '';
        return '<button type="button" class="bx n bx-atlas" data-i="' + n + '">' + img + '<span>' + esc(i.titulo) + '</span>' + (i.sub ? '<small>' + esc(i.sub) + '</small>' : '') + '</button>';
      }).join('') + '</div></div>';
    document.body.appendChild(caixa);
    var fechar = function () { document.removeEventListener('keydown', tecla); caixa.remove(); };
    var tecla = function (ev) { if (ev.key === 'Escape') fechar(); };
    document.addEventListener('keydown', tecla);
    caixa.addEventListener('click', function (ev) {
      if (ev.target === caixa || ev.target.classList.contains('lb-x')) return fechar();
      var b = ev.target.closest('.bx');
      if (b) { var item = itens[+b.getAttribute('data-i')]; fechar(); ao(item); }
    });
    caixa.querySelector('.lb-x').focus();
  }

  /* ---------- cada pergunta mostra a que tópico do título ela pertence ---------- */
  function casarPerguntas(subs, testes) {
    return testes.map(function (q) {
      var texto = norm((q.p || '') + ' ' + (q.r || ''));
      for (var i = 0; i < subs.length; i++) {
        var sn = norm(subs[i]);
        if (sn.length >= 3 && texto.indexOf(sn) >= 0) return i;
      }
      return null;
    });
  }

  /* ---------- o card ---------- */
  function montar(alvo, o) {
    var item = o.item;
    var carta = item.carta;
    var t = dividirTitulo(item.texto);
    var st = estadoDe(o.secao, item.texto);
    var nPerg = carta && carta.testes ? carta.testes.length : 0;
    var respostas = (st.resp && st.resp.length === nPerg ? st.resp : new Array(nPerg).fill(null)).slice();
    var passos = carta
      ? [{ id: 'perguntas', rot: 'Perguntas' }, { id: 'essencia', rot: 'Essência' }, { id: 'marcar', rot: 'Marcar' }]
      : [{ id: 'tente', rot: 'Tente' }, { id: 'marcar', rot: 'Marcar' }];
    var passo = Math.min(st.passo || 0, passos.length - 1);
    var visitados = {};
    var vivo = true;
    var casado = carta ? casar(t.subs, carta.lembrar || []) : null;
    var casadoPerg = carta && t.subs.length > 1 ? casarPerguntas(t.subs, carta.testes) : null;

    var menu = (o.irOutro ? '<button type="button" class="pop-i" data-ce="outro">Outro tópico</button>' : '') +
      (o.voltar ? '<button type="button" class="pop-i" data-ce="voltar">Voltar ao tópico anterior</button>' : '') +
      '<button type="button" class="pop-i" data-ce="baralho">Ver o baralho de ' + esc(o.secao) + '</button>' +
      (carta ? '<a class="pop-i" href="copiar.html?c=' + encodeURIComponent(o.secao) + '&t=' + encodeURIComponent(item.texto) + '">Copiar à mão</a>' : '') +
      (o.estudos || []).map(function (x, i) { return '<a class="pop-i" href="biblioteca.html#f=' + encodeURI(x.id) + '" title="' + esc(x.titulo) + '">' + (i === 0 ? 'Estudo completo · ' : '') + esc(x.codigo) + '</a>'; }).join('') +
      (o.todos ? '<a class="pop-i" href="domino.html' + (o.iSecao >= 0 ? '#s' + o.iSecao : '') + '">Ver todos os ' + o.todos + '</a>' : '');

    alvo.innerHTML = '<article class="cx cor ce ' + (o.compacto ? 'ce-compacto ' : '') + esc(o.cor || '') + '" data-ce-raiz>' +
      '<header class="ce-cab"><span class="ce-mat"><i class="q"></i>' + esc(o.secao) + (item.grupo ? '<em> · ' + esc(item.grupo) + '</em>' : '') + '</span>' +
      (o.tempo ? '<span class="rot">' + esc(o.tempo) + '</span>' : '') +
      (st.rever && st.rever <= hojeISO() ? '<span class="ce-rever rot">rever hoje</span>' : '') +
      '<div class="ce-icos">' +
        (o.voltar ? '<button type="button" class="ic" data-ce="voltar" aria-label="Voltar ao tópico anterior" title="Voltar ao tópico anterior">' + P.icone('voltar') + '</button>' : '') +
        '<button type="button" class="ic" data-ce="guardar" aria-pressed="' + (st.guardado ? 'true' : 'false') + '" aria-label="Guardar para depois" title="Guardar para depois">' + P.icone('coracao') + '</button>' +
        '<div class="ag-mais"><button type="button" class="ic" data-ce="mais" aria-haspopup="true" aria-expanded="false" aria-label="Mais opções" title="Mais opções">' + P.icone('mais') + '</button>' +
        '<div class="popover" hidden data-lenis-prevent>' + menu + '</div></div></div></header>' +
      '<div class="ce-titulo"><h2 class="ce-t">' + esc(t.base) + '</h2>' +
      (t.subs.length ? '<p class="ce-cont rot">' + t.subs.length + (t.subs.length === 1 ? ' tópico' : ' tópicos') + '</p><ol class="ce-subs">' + t.subs.map(function (s, i) { return '<li style="--n:' + (i + 1) + '"><b>' + (i + 1) + '</b>' + esc(s) + '</li>'; }).join('') + '</ol>' : '') + '</div>' +
      '<ol class="ag-passos ce-passos" style="--k:' + passos.length + ';--i:' + passo + '" aria-label="Passos">' + passos.map(function (p, i) { return '<li data-p="' + i + '"><button type="button" data-p="' + i + '"><b>' + (i + 1) + '</b>' + p.rot + '</button></li>'; }).join('') + '</ol>' +
      '<div class="ce-corpo" aria-live="polite"></div><footer class="ce-acoes acoes"></footer></article>';

    var raiz = alvo.querySelector('[data-ce-raiz]');
    var corpo = raiz.querySelector('.ce-corpo');
    var acoes = raiz.querySelector('.ce-acoes');
    var pop = raiz.querySelector('.popover');
    var bMais = raiz.querySelector('[data-ce=mais]');

    function acertos() { return respostas.filter(function (r) { return r === 1; }).length; }
    function respondidas() { return respostas.filter(function (r) { return r !== null; }).length; }

    function htmlPerguntas() {
      var quadros = '<p class="ce-prog" aria-hidden="true">' + respostas.map(function (r) { return '<i class="' + (r === 1 ? 'ok' : r === 0 ? 'no' : '') + '"></i>'; }).join('') + '</p>';
      return quadros + '<ol class="ce-perg">' + carta.testes.map(function (q, i) {
        var r = respostas[i];
        var iSub = casadoPerg ? casadoPerg[i] : null;
        var tag = iSub != null ? '<b class="ce-ptag' + (iSub % 2 ? ' par' : '') + '">' + esc(t.subs[iSub]) + '</b>' : '';
        return '<li data-q="' + i + '"' + (r !== null ? ' class="feita"' : '') + '>' + tag + '<p>' + esc(q.p) + '</p>' +
          '<details class="resp"' + (r !== null ? ' open' : '') + '><summary>Ver resposta</summary><div class="r">' + esc(q.r) + '</div>' +
          '<div class="ce-nota"><button type="button" class="opt' + (r === 1 ? ' on' : '') + '" data-r="1" data-q="' + i + '">Acertei</button><button type="button" class="opt' + (r === 0 ? ' on' : '') + '" data-r="0" data-q="' + i + '">Errei</button></div></details></li>';
      }).join('') + '</ol>' + (respondidas() === nPerg && nPerg ? '<p class="ce-placar">Você acertou <b>' + acertos() + ' de ' + nPerg + '</b>. ' + (acertos() * 2 >= nPerg ? 'Acertou a maioria: já pode marcar.' : 'Errou a maioria: leia a essência e refaça amanhã.') + '</p>' : '');
    }

    function htmlEssencia() {
      var resumo = carta.resumo ? '<p class="ce-resumo">' + esc(carta.resumo) + '</p>' : '';
      if (casado && casado.casou) {
        return resumo + '<ol class="ce-grade">' + casado.por.map(function (x, i) {
          return '<li style="--n:' + (i + 1) + '"><b class="ce-n">' + (i + 1) + '</b><h4>' + esc(x.sub) + '</h4><p>' + (x.texto ? esc(x.texto) : '<span class="suave">sem resumo ainda</span>') + '</p></li>';
        }).join('') + '</ol>' + (casado.sobras.length ? '<p class="rot ce-mais">Mais para lembrar</p><ul class="lembrar-l">' + casado.sobras.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>' : '');
      }
      return resumo + '<ul class="lembrar-l">' + (carta.lembrar || []).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
    }

    function htmlMarcar() {
      var tem = nPerg && respondidas() ? '<p class="ce-placar">Você acertou <b>' + acertos() + ' de ' + nPerg + '</b> nas perguntas.</p>' : '';
      return '<div class="ag-marque"><p class="ag-pergunta">Acertou a maioria?</p><p class="suave">Então marque como dominado e siga. Se errou, leia de novo e refaça o teste amanhã.</p>' + tem + '</div>';
    }

    function htmlTente() {
      return '<p>Tente 2 ou 3 questões de prova antiga sobre ele, sem ver aula. Errou? Dedique 10 a 15 minutos só a este tópico e tente de novo. Para criar a carta, escreva em <span class="mono">Cartas — ' + esc(o.secao) + '.md</span>, ao lado do Checklist.</p>';
    }

    var DICAS = { perguntas: 'Responda antes de ler, sem consultar.', essencia: 'Leia só isto (10 a 15 min) e refaça o que errou.', tente: 'Este tópico ainda não tem carta.', marcar: '' };

    function irPara(i, dir) {
      passo = Math.max(0, Math.min(passos.length - 1, i));
      visitados[passo] = true;
      salvar(o.secao, item.texto, { passo: passo });
      var id = passos[passo].id;
      var corpoHtml = id === 'perguntas' ? htmlPerguntas() : id === 'essencia' ? htmlEssencia() : id === 'tente' ? htmlTente() : htmlMarcar();
      corpo.style.setProperty('--dx', (dir || 1) * 26 + 'px');
      corpo.innerHTML = '<div class="ce-in">' + (DICAS[id] ? '<p class="rot ag-dica">' + esc(DICAS[id]) + '</p>' : '') + corpoHtml + '</div>';
      raiz.querySelector('.ce-passos').style.setProperty('--i', passo);
      raiz.querySelectorAll('.ag-passos li').forEach(function (li, k) {
        li.classList.toggle('on', k === passo);
        li.classList.toggle('feito', !!visitados[k] && k < passo);
        var b = li.querySelector('button');
        if (k === passo) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      desenharAcoes();
      if (window.Movimento) window.Movimento.revalidar();
    }

    function desenharAcoes() {
      var ultimo = passo === passos.length - 1;
      var html = '';
      if (!ultimo) {
        var pronto = passos[passo].id === 'perguntas' && respondidas() === nPerg && nPerg;
        html += '<button class="botao pri' + (pronto ? ' pulsa' : '') + '" type="button" data-ce="seguir">Próximo: ' + passos[passo + 1].rot.toLowerCase() + '</button>';
        if (passo > 0) html += '<button class="botao leve" type="button" data-ce="volta-passo">Voltar</button>';
      } else {
        html += item.feito
          ? '<button class="botao" type="button" data-ce="dominei">Dominado. Desmarcar</button>'
          : '<button class="botao pri" type="button" data-ce="dominei">Dominei</button><button class="botao" type="button" data-ce="rever">Rever amanhã</button>';
        if (o.irOutro && !item.feito) html += '<button class="botao leve" type="button" data-ce="outro">Ainda não, outro tópico</button>';
      }
      acoes.innerHTML = html;
    }

    function fecharPop() { pop.hidden = true; bMais.setAttribute('aria-expanded', 'false'); }

    function clique(ev) {
      var b = ev.target.closest('[data-ce], [data-p], [data-r]');
      if (!b || !raiz.contains(b)) return;
      if (b.hasAttribute('data-r')) {
        var q = +b.getAttribute('data-q');
        respostas[q] = +b.getAttribute('data-r');
        salvar(o.secao, item.texto, { resp: respostas });
        var pr = corpo.querySelector('.ce-prog');
        irPara(passo, 0);
        if (pr) { /* mantém a leitura do placar */ }
        return;
      }
      if (b.hasAttribute('data-p')) { var alvoP = +b.getAttribute('data-p'); irPara(alvoP, alvoP >= passo ? 1 : -1); return; }
      var acao = b.getAttribute('data-ce');
      if (acao === 'mais') { pop.hidden = !pop.hidden; bMais.setAttribute('aria-expanded', pop.hidden ? 'false' : 'true'); ev.stopPropagation(); return; }
      fecharPop();
      if (acao === 'seguir') return irPara(passo + 1, 1);
      if (acao === 'volta-passo') return irPara(passo - 1, -1);
      if (acao === 'guardar') {
        var novo = !estadoDe(o.secao, item.texto).guardado;
        salvar(o.secao, item.texto, { guardado: novo });
        b.setAttribute('aria-pressed', novo ? 'true' : 'false');
        if (o.aoGuardar) o.aoGuardar(novo);
        return;
      }
      if (acao === 'rever') { salvar(o.secao, item.texto, { rever: amanhaISO() }); b.textContent = 'Volta amanhã'; b.disabled = true; if (o.irOutro) setTimeout(function () { o.irOutro(); }, 700); return; }
      if (acao === 'dominei') { b.disabled = true; salvar(o.secao, item.texto, { rever: null }); Promise.resolve(o.dominar(!item.feito)).catch(function (e) { b.disabled = false; alert(e && e.message); }); return; }
      if (acao === 'outro' && o.irOutro) return o.irOutro();
      if (acao === 'voltar' && o.voltar) return o.voltar();
      if (acao === 'baralho' && o.baralho) return o.baralho();
    }

    var fora = function (ev) { if (!pop.hidden && !pop.contains(ev.target) && ev.target !== bMais) fecharPop(); };
    var tecla = function (ev) {
      if (!vivo || !document.body.contains(raiz)) return;
      if (o.contexto === 'domino' && !raiz.contains(document.activeElement) && !raiz.matches(':hover')) return;
      var tg = ev.target && ev.target.tagName;
      if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (ev.key === 'Escape') fecharPop();
      var n = +ev.key;
      if (n >= 1 && n <= passos.length && document.querySelector('.lb')) return;
      if (n >= 1 && n <= passos.length) { irPara(n - 1, n - 1 >= passo ? 1 : -1); }
      else if (ev.key === 'ArrowRight' && passo < passos.length - 1) irPara(passo + 1, 1);
      else if (ev.key === 'ArrowLeft' && passo > 0) irPara(passo - 1, -1);
    };
    var x0 = null, y0 = null;
    var toqueIni = function (ev) { if (ev.pointerType === 'mouse' || ev.target.closest('button, a, summary')) { x0 = null; return; } x0 = ev.clientX; y0 = ev.clientY; };
    var toqueFim = function (ev) {
      if (x0 === null) return;
      var dx = ev.clientX - x0, dy = ev.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dy) < 50) { if (dx < 0 && passo < passos.length - 1) irPara(passo + 1, 1); else if (dx > 0 && passo > 0) irPara(passo - 1, -1); }
    };

    raiz.addEventListener('click', clique);
    document.addEventListener('click', fora);
    document.addEventListener('keydown', tecla);
    corpo.addEventListener('pointerdown', toqueIni);
    corpo.addEventListener('pointerup', toqueFim);
    if (respondidas() && passo === 0 && nPerg && respondidas() === nPerg) passo = 0;
    irPara(passo, 1);

    return {
      irPara: irPara,
      estudos: function (lista) {
        if (!lista || !lista.length || !vivo) return;
        var ancora = pop.querySelector('a[href^="domino.html"]');
        var html = lista.map(function (x, i) { return '<a class="pop-i" href="biblioteca.html#f=' + encodeURI(x.id) + '" title="' + esc(x.titulo) + '">' + (i === 0 ? 'Estudo completo · ' : '') + esc(x.codigo) + '</a>'; }).join('');
        if (ancora) ancora.insertAdjacentHTML('beforebegin', html); else pop.insertAdjacentHTML('beforeend', html);
      },
      /* "página geral" do card: o(s) Mapa(s) da matéria inteira (XXX-00), ao lado do
         estudo específico acima — panorama, não só o tópico de hoje. */
      mapas: function (lista) {
        if (!lista || !lista.length || !vivo) return;
        var ancora = pop.querySelector('a[href^="domino.html"]');
        var html = lista.map(function (x, i) { return '<a class="pop-i" href="biblioteca.html#f=' + encodeURI(x.id) + '" title="' + esc(x.titulo) + '">' + (i === 0 ? 'Mapa da matéria · ' : '') + esc(x.codigo) + '</a>'; }).join('');
        if (ancora) ancora.insertAdjacentHTML('beforebegin', html); else pop.insertAdjacentHTML('beforeend', html);
      },
      destruir: function () { vivo = false; document.removeEventListener('click', fora); document.removeEventListener('keydown', tecla); },
    };
  }

  window.Cartao = { montar: montar, baralho: baralho, baralhoAtlas: baralhoAtlas, dividirTitulo: dividirTitulo, casar: casar, estadoDe: estadoDe, salvar: salvar, guardados: guardados, revisoesDeHoje: revisoesDeHoje, chave: chave, hojeISO: hojeISO };
})();
