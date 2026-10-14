(function () {
  'use strict';

  /* ============================================================
     O PROTETOR, COM LUZ (12/out/2026)

     1. MODOS DE LUZ: Campo, Sol, Mandala e Poeira, desenhados por
        shaders na placa de vídeo (WebGPU; WebGL2 de reserva; sem os
        dois, os botões nem aparecem). Os ajustes mexem nos números do
        shader; "Código" mostra o WGSL e o GLSL de verdade.
     2. OS LEMBRETES de volta na tela: um de cada vez, com de onde vêm.
        O lembrete cósmico, as suas frases do caderno, o agora (o bloco
        do roteiro, as tarefas) e o kit da reta final.
     3. OS PAINÉIS abrem com o Quadrado crescendo do botão.
     4. POR CIMA DAS PÁGINAS: protetor.html?sobreposto=1 é o protetor
        que o Portal abre sozinho quando você fica parado; uma tecla ou
        um toque fecha e devolve a página como estava.
     ============================================================ */

  var T = window.ProtetorTela, L = window.Luz, E = window.LuzEfeitos;
  if (!T) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var SOBREPOSTO = /[?&]sobreposto=1/.test(location.search) && window.parent !== window;
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. os modos de luz ── */
  var LUZ = {
    campo: { rot: 'Campo', efeito: 'campo', params: [
      { k: 'vel', rot: 'Velocidade', min: 0.1, max: 3, passo: 0.05, v: 1 },
      { k: 'esc', rot: 'Escala', min: 0.4, max: 3, passo: 0.05, v: 1 },
      { k: 'tom', rot: 'Tom (jade → sol)', min: 0, max: 1, passo: 0.01, v: 0.5 },
    ], cores: function (p) { var t = p.tom; return [0.03, 0.08 + 0.05 * (1 - t), 0.06, 1, 0.1 + 0.6 * t, 0.35 - 0.1 * t, 0.25 - 0.15 * t, 1, 0.95, 0.55 + 0.1 * t, 0.2, 1, 0, 0, 0, 1]; },
      uni: function (p) { return [p.vel, p.esc, 0, 0, 0, 0, 0, 0]; },
      mat: '<p><b>Domain warping</b> (Inigo Quilez): o ruído deforma o próprio ruído duas vezes. Em vez de pintar <code>fbm(p)</code>, pinta-se <code>fbm(p + 4·r)</code>, onde <code>r</code> também é um fbm de <code>p + 4·q</code>, e <code>q</code> é outro fbm. O fbm (<i>fractional Brownian motion</i>) soma o mesmo ruído em cinco escalas, cada uma com o dobro da frequência e metade da força: é por isso que parece fumaça, com detalhe dentro do detalhe.</p>' },
    sol: { rot: 'Sol', efeito: 'sol', params: [
      { k: 'raio', rot: 'Tamanho do disco', min: 0.08, max: 0.4, passo: 0.01, v: 0.2 },
    ], cores: function () { return [0.03, 0.02, 0.02, 1, 1.0, 0.72, 0.32, 1, 1.0, 0.45, 0.12, 1, 0, 0, 0, 1]; },
      uni: function (p) { return [p.raio, 0, 0, 0, 0, 0, 0, 0]; },
      mat: '<p>O disco é um círculo com a borda escurecida (o <b>escurecimento do limbo</b>: na borda vemos camadas mais frias do Sol). A granulação é um fbm que corre devagar. A coroa é o fbm em <b>coordenadas polares</b>: o ângulo e a distância ao centro viram a entrada do ruído, então os jatos saem do disco para fora, e a luz cai com <code>exp(-distância × 7)</code>.</p>' },
    mandala: { rot: 'Mandala', efeito: 'mandala', params: [
      { k: 'n', rot: 'Setores (simetria)', min: 3, max: 16, passo: 1, v: 8 },
    ], cores: function () { return [0.06, 0.05, 0.045, 1, 0.92, 0.9, 0.86, 1, 0.91, 0.51, 0.16, 1, 0.42, 0.79, 0.62, 1]; },
      uni: function (p) { return [p.n, 0, 0, 0, 0, 0, 0, 0]; },
      mat: '<p>O <b>caleidoscópio</b>: o ângulo de cada pixel é dobrado em <i>n</i> setores iguais (<code>mod(ângulo, 2π/n)</code>) e espelhado no meio do setor. Dentro de um setor só, desenham-se as formas de Malevich (o quadrado, o círculo, a cruz) como <b>funções de distância</b> (SDF): cada uma diz a que distância o pixel está da borda; perto de zero, pinta.</p>' },
    poeira: { rot: 'Poeira', efeito: 'poeira', params: [
      { k: 'dens', rot: 'Densidade', min: 0.3, max: 2, passo: 0.05, v: 1 },
    ], cores: function () { return [0.95, 0.88, 0.7, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; },
      uni: function (p) { return [p.dens, 0, 0, 0, 0, 0, 0, 0]; },
      fundo: '#07060A',
      mat: '<p>Uma grade invisível cobre a tela; em cada célula, um número embaralhado (<code>hash</code>) decide se há uma estrela, onde ela fica e com que ritmo pisca (um seno com fase própria). Três grades de tamanhos diferentes, uma sobre a outra, dão a profundidade.</p>' },
  };
  var params = {};
  Object.keys(LUZ).forEach(function (k) { params[k] = {}; LUZ[k].params.forEach(function (p) { params[k][p.k] = p.v; }); });
  var luzAtual = null, fx = null, canvas = null, temLuz = false;

  function prepararCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement('canvas');
    canvas.id = 'pt-luz';
    canvas.className = 'pt-luz';
    canvas.setAttribute('aria-hidden', 'true');
    document.getElementById('pt-palco').appendChild(canvas);
    return canvas;
  }
  var pont = [0.5, 0.5];
  addEventListener('pointermove', function (ev) { pont = [ev.clientX / innerWidth, ev.clientY / innerHeight]; }, { passive: true });
  var geracao = 0, capLuz = '';
  function ligarLuz(nome) {
    if (!L || !E || !LUZ[nome]) return;
    var minha = ++geracao;
    luzAtual = nome;
    T.motor.pausar(true);
    document.body.classList.add('pt-com-luz');
    var m = LUZ[nome];
    if (fx) { fx.destruir(); fx = null; }
    var c = prepararCanvas();
    var novo = c.cloneNode(false); c.replaceWith(novo); canvas = novo;
    document.getElementById('pt-palco').style.background = m.fundo || '';
    L.criar(canvas, Object.assign({ dpr: 1.5, mesmoReduzido: false }, E[m.efeito])).then(function (f) {
      if (minha !== geracao || luzAtual !== nome) { f.destruir(); if (f.canvas && f.canvas !== canvas) f.canvas.remove(); return; }
      fx = f; canvas = f.canvas;
      if (f.tipo === 'nenhum') { desligarLuz(); return; }
      /* #3: se a placa de vídeo cair, volta ao modo desenhado de sempre */
      f.aoPerder = function () { if (fx === f) desligarLuz(); };
      pintarModos();
      f.animar(function () { var p = params[nome]; return { p: m.uni(p), c: m.cores(p), ponteiro: pont }; });
    });
    pintarModos();
  }
  function desligarLuz() {
    luzAtual = null;
    if (fx) { fx.destruir(); fx = null; }
    if (canvas) { canvas.remove(); canvas = null; }
    document.getElementById('pt-palco').style.background = '';
    document.body.classList.remove('pt-com-luz');
    T.motor.pausar(false);
    pintarModos();
  }

  /* os botões dos modos de luz entram na mesma fileira dos modos de sempre */
  function pintarModos() {
    var grupo = document.getElementById('pt-modos');
    if (!grupo) return;
    var velhos = grupo.querySelectorAll('[data-luz]');
    velhos.forEach(function (b) { b.remove(); });
    if (!temLuz) return;
    grupo.querySelectorAll('[data-modo]').forEach(function (b) { if (luzAtual) b.setAttribute('aria-pressed', 'false'); });
    var sep = document.createElement('span'); sep.className = 'pt-sep'; sep.setAttribute('data-luz', ''); sep.setAttribute('aria-hidden', 'true');
    grupo.appendChild(sep);
    Object.keys(LUZ).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pt-modo pt-modo-luz'; b.setAttribute('data-luz', k);
      b.setAttribute('aria-pressed', String(luzAtual === k));
      var motorNome = fx ? fx.tipo : capLuz;
      b.title = LUZ[k].rot + ' · desenhado na placa de vídeo (' + (motorNome === 'webgl2' ? 'WebGL2' : 'WebGPU') + ')';
      b.innerHTML = LUZ[k].rot + '<i aria-hidden="true"></i>';
      grupo.appendChild(b);
    });
    if (luzAtual) pintarParams();
  }
  function pintarParams() {
    var m = LUZ[luzAtual], el = document.getElementById('pt-params');
    if (!m || !el) return;
    el.innerHTML = m.params.map(function (p) {
      var v = params[luzAtual][p.k];
      return '<div class="pt-param"><label for="pt-l-' + p.k + '">' + p.rot + ' <b>' + (Math.round(v * 100) / 100).toLocaleString('pt-BR') + '</b></label><input id="pt-l-' + p.k + '" type="range" data-lk="' + p.k + '" min="' + p.min + '" max="' + p.max + '" step="' + p.passo + '" value="' + v + '"></div>';
    }).join('');
    var t = document.getElementById('pt-ajustes-t'); if (t) t.textContent = 'Ajustes de ' + m.rot;
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#pt-modos [data-luz]');
    if (b) { ligarLuz(b.getAttribute('data-luz')); return; }
    var m = ev.target.closest && ev.target.closest('#pt-modos [data-modo]');
    if (m && luzAtual) { desligarLuz(); setTimeout(function () { T.desenharControles(); pintarModos(); }, 0); }
  }, true);
  /* quando o protetor redesenha os seus botões, os de luz voltam */
  var obsModos = new MutationObserver(function () { if (!document.querySelector('#pt-modos [data-luz]')) pintarModos(); });
  var gm = document.getElementById('pt-modos'); if (gm) obsModos.observe(gm, { childList: true });
  document.addEventListener('input', function (ev) {
    var i = ev.target.closest && ev.target.closest('input[data-lk]');
    if (!i || !luzAtual) return;
    params[luzAtual][i.getAttribute('data-lk')] = parseFloat(i.value);
    var b = i.parentNode.querySelector('label b'); if (b) b.textContent = (Math.round(parseFloat(i.value) * 100) / 100).toLocaleString('pt-BR');
    if (fx && fx.redesenhar && REDUZIR) fx.redesenhar();
  });
  /* "Código": para um modo de luz, o shader de verdade, nas duas línguas */
  var bCodigo = document.getElementById('pt-ver-codigo');
  if (bCodigo) bCodigo.addEventListener('click', function (ev) {
    if (!luzAtual) return;
    ev.stopImmediatePropagation();
    var m = LUZ[luzAtual], ef = E[m.efeito];
    document.getElementById('pt-codigo-titulo').textContent = 'O shader de "' + m.rot + '"';
    document.getElementById('pt-codigo-matematica').innerHTML = m.mat + '<p>Este modo roda em <b>' + (fx && fx.tipo === 'webgl2' ? 'WebGL2 (GLSL)' : 'WebGPU (WGSL)') + '</b>. A mesma conta está escrita nas duas línguas: o motor (luz.js) escolhe a melhor que o seu aparelho tem. Cada linha abaixo roda uma vez para cada pixel da tela, todos ao mesmo tempo.</p>';
    document.getElementById('pt-codigo-fonte').textContent = '// WGSL (WebGPU)\n' + ef.wgsl + '\n\n// GLSL (WebGL2)\n' + ef.glsl + '\n\n// as funções de apoio (ruído, fbm, voronoi, rot, caixa) estão em luz.js';
    T.abrirPainel('pt-painel-codigo');
  }, true);

  if (L) L.capacidade().then(function (c) { capLuz = c; temLuz = c !== 'nenhum'; pintarModos(); if (SOBREPOSTO && temLuz && !REDUZIR && Math.random() < 0.5) ligarLuz(['campo', 'sol', 'mandala', 'poeira'][Math.floor(Math.random() * 4)]); });

  /* ── 2. os lembretes, de volta na tela ── */
  var LEMBRETES = [];
  var KIT = [
    'Um minuto de respiração: puxe pelo nariz, mais um pouquinho por cima, solte bem devagar. Cinco vezes.',
    'Três ou quatro blocos de 50 minutos, com 10 de pausa. Quatro a seis horas de verdade bastam.',
    'Cada bloco: ler 10 a 15 minutos, escrever três linhas, 5 a 10 questões da Unicamp, conferir, anotar o erro.',
    'Fórmulas numa folha só, escrita à mão. Releia de manhã.',
    'Dormir e acordar sempre no mesmo horário. A prova é às 9h: acorde às 7h.',
    'Domingo, 18/10, 9h (portões às 8h). Responda as 72: errar não desconta.',
    'Ideia nova: uma linha no papel, e volta para o bloco.',
  ];
  function montarLembretes(estado) {
    var lista = [];
    var lit = (window.Protetor && window.Protetor.htmlLembrete) ? window.Protetor.htmlLembrete().litania : '';
    var div = document.createElement('div'); div.innerHTML = lit;
    div.querySelectorAll('p').forEach(function (p) { var n = p.querySelector('.n'); if (n) n.remove(); lista.push({ t: p.textContent.trim(), de: 'lembrete cósmico' }); });
    if (estado) {
      var hoje = new Date(); var iso = hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
      var dia = (estado.roteiro || []).filter(function (r) { return r.data === iso; })[0];
      if (dia) {
        if (dia.bloco1) lista.push({ t: 'Bloco 1 de hoje: ' + dia.bloco1, de: 'o roteiro da reta final' });
        if (dia.bloco2) lista.push({ t: 'Bloco 2 de hoje: ' + dia.bloco2, de: 'o roteiro da reta final' });
        if (dia.treino) lista.push({ t: 'O treino de hoje: ' + dia.treino, de: 'o roteiro da reta final' });
      }
      (estado.tarefas || []).slice(0, 3).forEach(function (t) { if (t.tarefa) lista.push({ t: t.tarefa + (t.tempo ? ' (' + t.tempo + ')' : ''), de: 'tarefas · ' + (t.area || '') }); });
      (estado.frases || []).forEach(function (f) { if (f.texto) lista.push({ t: f.texto, de: f.fonte || 'as suas frases' }); });
      if (estado.contagem && estado.contagem.prova) {
        var p = estado.contagem.prova.split('-'), dp = new Date(+p[0], +p[1] - 1, +p[2]);
        var dias = Math.ceil((dp - new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())) / 864e5);
        if (dias >= 0 && dias <= 30) KIT.forEach(function (k) { lista.push({ t: k, de: 'Nova Fase · o kit até a prova' }); });
      }
    } else KIT.forEach(function (k) { lista.push({ t: k, de: 'o kit até a prova' }); });
    /* intercala as origens, para não vir tudo de um lugar só */
    var porOrigem = {};
    lista.forEach(function (x) { (porOrigem[x.de] = porOrigem[x.de] || []).push(x); });
    var chaves = Object.keys(porOrigem), out = [], i = 0, sobrou = true;
    while (sobrou) { sobrou = false; chaves.forEach(function (k) { if (porOrigem[k][i]) { out.push(porOrigem[k][i]); sobrou = true; } }); i++; }
    LEMBRETES = out;
  }
  var caixa = document.createElement('aside');
  caixa.className = 'pt-lembretes';
  caixa.setAttribute('aria-live', 'polite');
  caixa.setAttribute('aria-label', 'Lembretes');
  caixa.innerHTML = '<p class="pt-lem-t"></p><p class="pt-lem-de"></p><div class="pt-lem-ctl"><button type="button" class="pt-lem-b" data-lem="ant" aria-label="Lembrete anterior">‹</button><button type="button" class="pt-lem-b" data-lem="prox" aria-label="Próximo lembrete">›</button><button type="button" class="pt-lem-b" data-lem="ocultar" aria-label="Esconder os lembretes" title="Esconder os lembretes">×</button></div>';
  var relogio = document.querySelector('.pt-relogio');
  if (relogio) relogio.parentNode.insertBefore(caixa, relogio.nextSibling);
  var iLem = 0, CH_LEM = 'portal-protetor-lembretes';
  var lemLigado = true; try { lemLigado = localStorage.getItem(CH_LEM) !== 'off'; } catch (e) { /* ok */ }
  caixa.hidden = !lemLigado;
  function mostrarLembrete(d) {
    if (!LEMBRETES.length) return;
    iLem = (iLem + (d || 1) + LEMBRETES.length) % LEMBRETES.length;
    var x = LEMBRETES[iLem];
    caixa.classList.remove('pt-lem-entra'); void caixa.offsetWidth; caixa.classList.add('pt-lem-entra');
    caixa.querySelector('.pt-lem-t').textContent = x.t;
    caixa.querySelector('.pt-lem-de').textContent = '— ' + x.de;
  }
  caixa.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-lem]'); if (!b) return;
    var o = b.getAttribute('data-lem');
    if (o === 'ant') mostrarLembrete(-1); else if (o === 'prox') mostrarLembrete(1);
    else { caixa.hidden = true; lemLigado = false; try { localStorage.setItem(CH_LEM, 'off'); } catch (e) { /* ok */ } ligaBotao(); }
  });
  /* o botão "Lembrete" do alto também liga e desliga os lembretes na tela (o painel cósmico continua) */
  function ligaBotao() {
    var acoes = document.querySelector('.pt-acoes');
    if (!acoes || document.getElementById('pt-lem-liga')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pt-btn'; b.id = 'pt-lem-liga';
    b.title = 'Lembretes na tela: liga e desliga';
    b.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="8" aria-hidden="true" focusable="false"><path d="M3.5 4.5h17v11H11l-4.5 4v-4h-3z"/><path d="M7.5 8.5h9M7.5 11.5h5.5"/></svg><span class="pt-btn-t">Lembretes na tela</span>';
    b.setAttribute('aria-pressed', String(lemLigado));
    b.addEventListener('click', function () { lemLigado = !lemLigado; caixa.hidden = !lemLigado; b.setAttribute('aria-pressed', String(lemLigado)); try { localStorage.setItem(CH_LEM, lemLigado ? 'on' : 'off'); } catch (e) { /* ok */ } if (lemLigado) mostrarLembrete(1); });
    acoes.insertBefore(b, acoes.firstChild);
  }
  ligaBotao();
  fetch('/api/estado').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (e) { montarLembretes(e); iLem = -1; mostrarLembrete(1); });
  setInterval(function () { if (!document.hidden && lemLigado) mostrarLembrete(1); }, 15000);

  /* ── 3. os painéis abrem com o Quadrado ── */
  var ultimoClique = [innerWidth - 60, 40];
  document.addEventListener('pointerdown', function (ev) { ultimoClique = [ev.clientX, ev.clientY]; }, true);
  if (L && E && !REDUZIR) {
    var obsPaineis = new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        var p = m.target;
        if (m.attributeName !== 'hidden' || p.hidden || !p.classList.contains('pt-painel') && p.id !== 'pt-ajustes') return;
        var r = p.getBoundingClientRect();
        var cv = document.createElement('canvas');
        cv.className = 'pt-painel-luz'; cv.setAttribute('aria-hidden', 'true');
        var fundo = getComputedStyle(p).backgroundColor;
        var nums = (fundo.match(/[\d.]+/g) || []).map(Number);
        var cor = /^color\(/.test(fundo) ? nums.slice(0, 3).map(function (x) { return x * 255; }) : nums.slice(0, 3);
        if (cor.length < 3 || (nums.length > 3 && nums[3] === 0)) cor = [26, 20, 12];
        p.insertBefore(cv, p.firstChild);
        p.classList.add('pt-abrindo');
        L.criar(cv, E.quadrado).then(function (f) {
          if (f.tipo === 'nenhum') { (f.canvas || cv).remove(); cv.remove(); p.classList.remove('pt-abrindo'); return; }
          var o = [(ultimoClique[0] - r.left) / Math.max(1, r.width), (ultimoClique[1] - r.top) / Math.max(1, r.height)];
          var t0 = performance.now();
          (function q(agora) {
            var k = Math.min(1, (agora - t0) / 520);
            f.desenhar(agora / 1000, { progresso: k, p: [o[0], o[1], 0.4, 0, 0, 0, 0, 0], c: [cor[0] / 255, cor[1] / 255, cor[2] / 255, 1, 0.25, 0.2, 0.14, 1, 0.91, 0.51, 0.16, 1, 0, 0, 0, 1] });
            if (k < 1) requestAnimationFrame(q); else { p.classList.remove('pt-abrindo'); setTimeout(function () { f.destruir(); (f.canvas || cv).remove(); cv.remove(); }, 60); }
          })(performance.now());
        });
      });
    });
    document.querySelectorAll('.pt-painel, #pt-ajustes').forEach(function (p) { obsPaineis.observe(p, { attributes: true, attributeFilter: ['hidden'] }); });
  }

  /* ── 4. por cima das páginas: o Portal abre isto quando você fica parado ── */
  if (SOBREPOSTO) {
    document.documentElement.classList.add('pt-sobreposto');
    var voltar = document.querySelector('.pt-marca');
    if (voltar) { voltar.setAttribute('href', '#'); voltar.innerHTML = voltar.innerHTML.replace(/Portal Solar/, 'Voltar'); }
    var abriuEm = performance.now();
    var fechar = function () { try { window.parent.postMessage({ protetor: 'fechar' }, location.origin); } catch (e) { /* ok */ } };
    if (voltar) voltar.addEventListener('click', function (ev) { ev.preventDefault(); fechar(); });
    /* uma tecla ou um toque no fundo fecham (o mouse só mostra os controles) */
    document.addEventListener('keydown', function (ev) { if (performance.now() - abriuEm < 800) return; if (ev.key === 'Escape' || !ev.target.closest || !ev.target.closest('.pt-ajustes, .pt-painel, .pt-dock, .pt-topo, .pt-lembretes')) fechar(); });
    document.getElementById('pt-palco').addEventListener('pointerdown', function () { if (performance.now() - abriuEm > 800 && !T.painelAberto()) fechar(); });
  }
})();
