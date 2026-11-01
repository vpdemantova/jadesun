/* ============================================================
   AS EDIÇÕES DO INÍCIO — o fio de cada parte e a folha de folhear (01/nov/2026, PS-91, registro 133)
   Pedido dele: "coloque um histórico no final de cada parte da home, porque ela sempre muda, pra ficar
   salvo os artigos passados, já que vamos mudar e atualizar, com um histórico dos textos e do que já foi
   mais importante, pra gente ver o progresso, de forma criativa e bem implementada!"

   · No fim de cada parte, "As edições": um fio com uma conta por edição (a de agora, cheia), como o fio
     da volta (●): uma edição é a parte como ela estava num dia.
   · O fio abre a folha: a régua das edições; a edição com a data, a leva em que mudou, o que entrou e o
     que saiu; e o texto de então, riscado o que saiu e sublinhado o que entrou, como um manuscrito
     revisado. As setas (← →) e o deslizar do dedo folheiam. "A casa inteira" mostra todas as partes,
     dia a dia: o progresso. Em "Como está o mundo" (o que importa agora), é o que já foi mais importante.
   · A Terra agora não tem texto: a folha dela mostra a Terra no minuto de cada edição da casa.
   · O seu dia (só no computador) vem do caderno: o próximo passo de cada pasta, pelo git do Grande Plano.

   De onde vem: inicio-edicoes-dados.js (guardar-edicoes.mjs) e a régua comum (inicio-edicoes.js).
   Para onde vai: o inicio.js põe o fio no fim de cada parte (Edicoes.fio) e avisa da frase da utopia.
   ============================================================ */
(function () {
  'use strict';
  var E = window.EdicoesInicio;
  if (!E) return;
  var P = window.Perfil || {};
  var publico = !!(P.ehPublico && P.ehPublico());
  var estatico = !!window.JADESUN_ESTATICO;
  var GUARDADAS = (window.INICIO_EDICOES && window.INICIO_EDICOES.partes) || {};
  var casa = {};          /* as partes que só o computador tem (O seu dia), de /api/inicio-edicoes */
  var frase = '';         /* a frase da utopia de agora (o inicio.js avisa quando chega) */
  var REDUZ = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ORDEM = E.PARTES.map(function (p) { return p[0]; });
  var NOMES = {}; E.PARTES.forEach(function (p) { NOMES[p[0]] = p[1]; });

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var FUSO = 'America/Sao_Paulo';
  function data(d, jeito) {
    var x = new Date(d);
    if (isNaN(x)) return '';
    try {
      if (jeito === 'longa') return x.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: FUSO });
      if (jeito === 'hora') return x.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO });
      return x.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: FUSO }).replace(/\./g, '').replace(' de ', ' ');
    } catch (e) { return x.toISOString().slice(0, 10); }
  }
  var dia = function (d) { try { return new Date(d).toLocaleDateString('sv-SE', { timeZone: FUSO }); } catch (e) { return String(d).slice(0, 10); } };
  /* uma nota de commit que não diz nada ("." ou só "Test of Hope.") não aparece */
  var leva = function (m) { m = String(m || '').trim(); return /^[.\s]*$/.test(m) ? '' : m; };

  /* ---------- as edições de cada parte, como este site mostra ---------- */
  /* o texto de agora, tirado das mesmas fontes que a página acabou de ler */
  var memo = null, memoFrase = null;
  function agora() {
    if (memo && memoFrase === frase) return memo;
    memoFrase = frase;
    return (memo = E.tirar({ I: window.INICIO, M: window.MAPA, A: window.AVISO, G: window.GUIAS, PL: window.PLANETA, H: window.HUMANIDADE, frase: frase }));
  }
  var linhasDe = function (ed) { return (!publico && ed.lc) ? ed.lc : ed.l; };
  /* oldest → newest; edições seguidas iguais (nesta vista) viram uma só; e, se o texto de agora ainda não
     foi guardado, ele entra no fim como "agora" */
  function lista(id) {
    var guardadas = id === 'seu-dia' ? (casa['seu-dia'] || []) : (GUARDADAS[id] || []);
    var out = [];
    guardadas.forEach(function (ed) {
      var l = linhasDe(ed);
      if (!l || !l.length) return;
      var u = out[out.length - 1];
      if (u && JSON.stringify(u.l) === JSON.stringify(l)) return;
      out.push({ d: ed.d, m: ed.m, c: ed.c, l: l });
    });
    if (id !== 'seu-dia' && id !== 'terra') {
      var a = agora()[id];
      if (a) {
        var l = linhasDe(a), u = out[out.length - 1];
        if (!u || JSON.stringify(u.l) !== JSON.stringify(l)) out.push({ d: new Date().toISOString(), m: '', l: l, agora: true });
      }
    }
    return out;
  }
  /* os momentos da casa: cada data em que alguma parte mudou, com as partes daquela edição */
  function momentos() {
    var por = {};
    ORDEM.forEach(function (id) {
      if (id === 'terra') return;
      lista(id).forEach(function (ed, k) {
        var chave = String(ed.d).slice(0, 16);
        (por[chave] = por[chave] || { d: ed.d, m: ed.m, partes: [] }).partes.push({ id: id, k: k });
        if (!por[chave].m && ed.m) por[chave].m = ed.m;
      });
    });
    return Object.keys(por).sort().map(function (k) { return por[k]; });
  }

  /* ---------- o fio, no fim de cada parte ---------- */
  /* as contas: metade pelo tempo, metade pela ordem (no mesmo dia elas não se encavalam) */
  function posicoes(ds) {
    var n = ds.length;
    if (n === 1) return [50];
    var t0 = +new Date(ds[0]), t1 = +new Date(ds[n - 1]), span = Math.max(1, t1 - t0);
    return ds.map(function (d, i) { return ((+new Date(d) - t0) / span * 50) + (i / (n - 1) * 50); });
  }
  function fio(id) {
    var eds = id === 'terra' ? momentos() : lista(id);
    /* sem edição ainda (o seu dia chega depois, do servidor): só o lugar dele */
    if (!eds.length) return '<span class="ed-lugar" data-ed-lugar="' + id + '" hidden></span>';
    var xs = posicoes(eds.map(function (e) { return e.d; }));
    var n = eds.length, desde = data(eds[0].d, 'longa');
    var rot = id === 'terra' ? 'A Terra em cada edição' : n > 1 ? 'As edições' : 'A primeira edição';
    var conta = id === 'terra' ? n + (n === 1 ? ' edição da casa' : ' edições da casa') : n > 1 ? n + ' · desde ' + data(eds[0].d) : data(eds[0].d);
    return '<button type="button" class="ed-fio" data-ed-abrir="' + id + '" aria-haspopup="dialog" aria-label="' +
        esc(rot + ' de ' + NOMES[id] + ': ' + (n > 1 ? n + ' edições, desde ' + desde : 'de ' + desde)) + '">' +
      '<span class="ed-fio-rot">' + rot + '</span>' +
      '<span class="ed-fio-linha" aria-hidden="true">' + xs.map(function (x, i) {
        return '<i class="ed-conta' + (i === n - 1 ? ' ed-hoje' : '') + '" style="--x:' + x.toFixed(2) + '%"></i>';
      }).join('') + '</span>' +
      '<span class="ed-fio-n">' + esc(conta) + '</span></button>';
  }
  /* o que a página já desenhou se refaz no lugar (a frase da utopia e o seu dia chegam depois) */
  function refazerFios() {
    document.querySelectorAll('.ed-fio[data-ed-abrir], .ed-lugar[data-ed-lugar]').forEach(function (b) {
      b.outerHTML = fio(b.getAttribute('data-ed-abrir') || b.getAttribute('data-ed-lugar'));
    });
    /* a parte cresceu ou encolheu: o Início refaz as telas */
    document.dispatchEvent(new CustomEvent('edicoes:mudou'));
  }

  /* ---------- a folha ---------- */
  function texto(ed, ant, marcar) {
    var dif = ant ? E.comparar(ant.l, ed.l) : ed.l.map(function (x) { return { tipo: 'igual', n: x[0], t: x[1] }; });
    return dif.map(function (d) {
      var cls = 'ed-l ed-n' + d.n + (marcar && d.tipo !== 'igual' ? ' ed-' + d.tipo : '');
      if (d.tipo === 'saiu') return marcar ? '<p class="' + cls + '"><del>' + esc(d.t) + '</del></p>' : '';
      if (!marcar || d.tipo === 'igual') return '<p class="' + cls + '">' + esc(d.t) + '</p>';
      if (d.tipo === 'entrou') return '<p class="' + cls + '"><ins>' + esc(d.t) + '</ins></p>';
      return '<p class="' + cls + '">' + d.partes.map(function (p) {
        return p[0] === 'igual' ? esc(p[1]) : p[0] === 'entrou' ? '<ins>' + esc(p[1]) + '</ins>' : '<del>' + esc(p[1]) + '</del>';
      }).join('') + '</p>';
    }).join('');
  }
  function mudou(ed, ant) {
    if (!ant) return '<p class="ed-resumo-1">A primeira edição desta parte.</p>';
    var r = E.resumo(E.comparar(ant.l, ed.l));
    var curta = function (s) { return s.length > 90 ? s.slice(0, 88).replace(/\s+\S*$/, '') + '…' : s; };
    var linha = function (rot, xs) { return xs.length ? '<p><b>' + rot + '</b> ' + xs.map(function (x) { return '<span>' + esc(curta(x)) + '</span>'; }).join('') + '</p>' : ''; };
    return linha('Entrou', r.entrou) + linha('Saiu', r.saiu) || '<p class="ed-resumo-1">Só mudou a ordem.</p>';
  }
  function regua(eds, i) {
    /* duas edições no mesmo dia levam a hora embaixo da data */
    var porDia = {}; eds.forEach(function (ed) { var x = dia(ed.d); porDia[x] = (porDia[x] || 0) + 1; });
    return '<nav class="ed-regua" aria-label="As edições">' + eds.map(function (ed, k) {
      var hora = !ed.agora && porDia[dia(ed.d)] > 1 ? data(ed.d, 'hora') : '';
      return '<button type="button" class="ed-r" data-ed-ir="' + k + '"' + (k === i ? ' aria-current="true"' : '') + ' title="' + esc(data(ed.d, 'longa') + (hora ? ', ' + hora : '')) + '">' +
        '<i class="ed-conta' + (ed.agora ? ' ed-agora' : '') + '" aria-hidden="true"></i><span>' + esc(ed.agora ? 'agora' : data(ed.d)) + '</span>' + (hora ? '<small>' + esc(hora) + '</small>' : '') + '</button>';
    }).join('') + '</nav>';
  }
  function passo(eds, i) {
    return '<div class="ed-passo"><button type="button" data-ed-passo="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="A edição anterior">‹</button>' +
      '<span>' + (i + 1) + 'ª de ' + eds.length + '</span>' +
      '<button type="button" data-ed-passo="1"' + (i === eds.length - 1 ? ' disabled' : '') + ' aria-label="A edição seguinte">›</button></div>';
  }
  var marcar = true;
  function htmlParte(id, eds, i) {
    var ed = eds[i], ant = eds[i - 1];
    var l = leva(ed.m);
    return regua(eds, i) + passo(eds, i) +
      '<article class="ed-ed">' +
        '<p class="rot">' + (ed.agora ? 'Agora' : 'Edição de') + '</p>' +
        '<h3 class="ed-data">' + (ed.agora ? 'o texto de hoje, ainda não guardado' : esc(data(ed.d, 'longa'))) + '</h3>' +
        (l ? '<p class="ed-leva">Na mesma leva: ' + esc(l) + '</p>' : '') +
        '<div class="ed-resumo">' + mudou(ed, ant) + '</div>' +
        '<label class="ed-marcas"><input type="checkbox" data-ed-marcar' + (marcar ? ' checked' : '') + '> <span>Riscar o que saiu e sublinhar o que entrou</span></label>' +
        '<div class="ed-texto">' + texto(ed, ant, marcar && !!ant) + '</div>' +
      '</article>';
  }
  function htmlTerra(eds, i) {
    var mo = eds[i];
    return regua(eds, i) + passo(eds, i) +
      '<article class="ed-ed ed-terra">' +
        '<p class="rot">A Terra no minuto da edição</p>' +
        '<h3 class="ed-data">' + esc(data(mo.d, 'longa')) + ', ' + esc(data(mo.d, 'hora')) + '</h3>' +
        '<div class="ed-terra-mapa" id="ed-terra-mapa"></div>' +
        '<p class="ed-leva">Nesta edição da casa mudaram: ' + mo.partes.map(function (p) {
          return '<button type="button" class="ed-link" data-ed-parte="' + p.id + '" data-ed-k="' + p.k + '">' + esc(NOMES[p.id]) + '</button>';
        }).join(', ') + '.</p>' +
      '</article>';
  }
  /* a casa inteira: todas as partes, dia a dia, do mais novo ao mais velho */
  function htmlTodas() {
    var itens = [];
    ORDEM.forEach(function (id) {
      if (id === 'terra') return;
      var eds = lista(id);
      eds.forEach(function (ed, k) { itens.push({ id: id, k: k, ed: ed, ant: eds[k - 1] }); });
    });
    itens.sort(function (a, b) { return String(b.ed.d).localeCompare(String(a.ed.d)); });
    var dias = [], porDia = {};
    itens.forEach(function (it) { var d = dia(it.ed.d); if (!porDia[d]) { porDia[d] = []; dias.push(d); } porDia[d].push(it); });
    var contas = ORDEM.filter(function (id) { return id !== 'terra' && lista(id).length; }).map(function (id) {
      var n = lista(id).length;
      return '<li><button type="button" class="ed-link" data-ed-parte="' + id + '">' + esc(NOMES[id]) + '</button> <span>' + n + (n === 1 ? ' edição' : ' edições') + '</span></li>';
    }).join('');
    return '<p class="ed-todas-abre">Cada parte do Início, dia a dia: o que entrou e o que saiu. ' + itens.length + ' edições, desde ' + esc(data(itens.length ? itens[itens.length - 1].ed.d : '', 'longa')) + '.</p>' +
      '<ul class="ed-todas-contas">' + contas + '</ul>' +
      '<ol class="ed-dias">' + dias.map(function (d) {
        return '<li class="ed-dia"><h3 class="ed-dia-t">' + esc(data(d + 'T12:00:00', 'longa')) + '</h3><ul>' + porDia[d].map(function (it) {
          var r = it.ant ? E.resumo(E.comparar(it.ant.l, it.ed.l)) : null;
          var sobre = !r ? 'a primeira edição' : [r.entrou.length ? 'entrou ' + r.entrou.slice(0, 3).join(', ') : '', r.saiu.length ? 'saiu ' + r.saiu.slice(0, 3).join(', ') : ''].filter(Boolean).join('; ') || 'a ordem mudou';
          return '<li><button type="button" class="ed-link" data-ed-parte="' + it.id + '" data-ed-k="' + it.k + '">' + esc(NOMES[it.id]) + '</button>' +
            '<span>' + esc(sobre.length > 160 ? sobre.slice(0, 158) + '…' : sobre) + '</span></li>';
        }).join('') + '</ul></li>';
      }).join('') + '</ol>';
  }

  var folha = null, estado = null;
  function pintar() {
    if (!folha || !estado) return;
    var c = folha.corpo.querySelector('.ed');
    if (!c) return;
    if (estado.id === 'todas') c.innerHTML = htmlTodas();
    else {
      var eds = estado.id === 'terra' ? momentos() : lista(estado.id);
      estado.i = Math.max(0, Math.min(eds.length - 1, estado.i));
      c.innerHTML = (estado.id === 'terra' ? htmlTerra(eds, estado.i) : htmlParte(estado.id, eds, estado.i)) +
        '<p class="ed-pe"><button type="button" class="ed-link" data-ed-parte="todas">A casa inteira, edição a edição</button></p>';
      if (estado.id === 'terra' && window.TerraAgora) window.TerraAgora.montar(c.querySelector('#ed-terra-mapa'), { quando: eds[estado.i].d, rotulo: publico ? 'Campinas' : '' });
      var at = c.querySelector('.ed-r[aria-current]');
      if (at && at.scrollIntoView) { var r = c.querySelector('.ed-regua'); r.scrollLeft = at.offsetLeft - r.clientWidth / 2 + at.offsetWidth / 2; }
    }
    var t = folha.corpo.closest('.folha');
    if (t) {
      var h = t.querySelector('#folha-t'), s = t.querySelector('.folha-cab .rot');
      if (h) h.textContent = estado.id === 'todas' ? 'A casa inteira' : NOMES[estado.id];
      if (s) s.textContent = estado.id === 'mundo' ? 'As edições · o que já foi mais importante' : estado.id === 'todas' ? 'As edições do Início' : 'As edições';
    }
  }
  /* folhear: a edição sai para o lado e a nova entra; o foco fica no mesmo botão (a régua e o passo se redesenham) */
  function ir(i, dir) {
    if (!estado || estado.id === 'todas') return;
    var n = (estado.id === 'terra' ? momentos() : lista(estado.id)).length;
    if (i < 0 || i >= n) return;
    estado.i = i;
    var a = document.activeElement, quem = a && a.getAttribute ? (a.hasAttribute('data-ed-passo') ? '[data-ed-passo="' + a.getAttribute('data-ed-passo') + '"]' : a.hasAttribute('data-ed-ir') ? '.ed-r[aria-current]' : '') : '';
    var depois = function () {
      pintar();
      var f = quem && folha && folha.corpo.querySelector(quem);
      if (f && f.disabled) f = folha.corpo.querySelector('.ed-r[aria-current]');
      if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* ok */ }
    };
    var art = folha && folha.corpo.querySelector('.ed-ed');
    if (art && !REDUZ && dir) { art.classList.add(dir > 0 ? 'ed-sai-e' : 'ed-sai-d'); setTimeout(depois, 140); }
    else depois();
  }
  /* as setas folheiam, com a folha aberta (fora de um campo) */
  document.addEventListener('keydown', function (ev) {
    if (!folha || !estado || estado.id === 'todas' || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    var t = ev.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    ev.preventDefault();
    var d = ev.key === 'ArrowLeft' ? -1 : 1;
    ir(estado.i + d, d);
  });
  function abrir(id, k) {
    if (!P.folha) return;
    var eds = id === 'todas' ? [] : id === 'terra' ? momentos() : lista(id);
    if (id !== 'todas' && !eds.length) return;
    estado = { id: id, i: k == null ? eds.length - 1 : +k };
    if (folha) { pintar(); return; }
    folha = P.folha({ titulo: esc(NOMES[id] || ''), sub: 'As edições', larga: true, html: '<div class="ed"></div>', aoFechar: function () { folha = null; estado = null; }, aoAbrir: function (corpo) {
      corpo.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-ed-ir], [data-ed-passo], [data-ed-parte]');
        if (!b) return;
        if (b.hasAttribute('data-ed-ir')) ir(+b.getAttribute('data-ed-ir'), +b.getAttribute('data-ed-ir') - estado.i);
        else if (b.hasAttribute('data-ed-passo')) { var d = +b.getAttribute('data-ed-passo'); ir(estado.i + d, d); }
        else { var id2 = b.getAttribute('data-ed-parte'), k2 = b.getAttribute('data-ed-k'); abrir(id2, k2); corpo.scrollTop = 0; }
      });
      corpo.addEventListener('change', function (ev) { if (ev.target.matches('[data-ed-marcar]')) { marcar = ev.target.checked; pintar(); } });
      /* o dedo folheia: deslizar para o lado sobre a edição (o edicoes.css deixa o lado para cá: touch-action pan-y) */
      var x0 = null, y0 = null;
      corpo.addEventListener('pointerdown', function (ev) { x0 = ev.pointerType !== 'mouse' && ev.target.closest('.ed-ed') ? ev.clientX : null; y0 = ev.clientY; });
      corpo.addEventListener('pointercancel', function () { x0 = null; });
      corpo.addEventListener('pointerup', function (ev) {
        if (x0 == null || !estado || estado.id === 'todas') { x0 = null; return; }
        var dx = ev.clientX - x0, dy = ev.clientY - y0; x0 = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { var d = dx < 0 ? 1 : -1; ir(estado.i + d, d); }
      });
    } });
    pintar();
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-ed-abrir]');
    if (b) { ev.preventDefault(); abrir(b.getAttribute('data-ed-abrir')); }
  });

  /* O seu dia: só no computador, do caderno */
  if (!publico && !estatico) {
    fetch('/api/inicio-edicoes', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (d) {
      if (!d || !d.partes) return;
      casa = d.partes;
      refazerFios();
    });
  }

  window.Edicoes = {
    fio: fio, abrir: abrir, lista: lista, momentos: momentos,
    /* o inicio.js avisa quando a frase da utopia chega */
    frase: function (f) { frase = f || ''; refazerFios(); },
  };
})();
