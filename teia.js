/* ============================================================
   Portal Solar · teia.js — a Teia (31/out/2026): o desenho da rede de todas as pessoas do Atlas.

   De onde veio: o pedido dele ("uma rede, network, data visualization, de todas as pessoas, por área… desde o
   primeiro registrado, as famílias, escolas, grupos… bem fácil de usar e perfeito"). Os dados vêm de /api/teia
   (lib/teia.mjs: as fichas + os elos do Wikidata; no site estático, api/teia.json).

   Duas vistas, uma de cada vez:
     · A TEIA: cada área tem o seu lugar num círculo (como uma mandala); cada pessoa e cada grupo é puxado para o
       lugar da sua área, e cada elo puxa os dois lados um para o outro (uma simulação de forças simples: mola nos
       elos, repulsão entre vizinhos, por uma grade, e atrito). Quem liga áreas fica no meio do caminho.
     · NO TEMPO: da esquerda para a direita, do primeiro registro até hoje (antes do ano 1000 o tempo é
       comprimido); uma faixa por área; os elos viram arcos.
   Tocar numa pessoa acende os elos dela e abre o painel: as datas, a área, o resumo da ficha, quem ela teve por
   mestre, quem ensinou, as influências, a família, as escolas e os grupos, cada um um botão; e "Abrir a ficha".
   Monocromático: os tipos de elo se distinguem pelo traço (cheio, pontilhado, tracejado), não pela cor.
   O endereço guarda quem foi escolhido (#p=<id da ficha>): o jogo Atlantis e as fichas podem apontar para cá.

   Para onde vai: teia.html (porta das Fichas). O que falta: os místicos, os teósofos e os insetos (fichas novas
   entram sozinhas; os elos, rodando de novo o colher-teia.mjs).
   ============================================================ */
(function () {
  'use strict';
  var REDUZIR = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function ano(n) { return n == null ? '' : n < 0 ? (-n) + ' a.C.' : String(n); }
  function datas(no) { return no.nasc == null && no.morte == null ? '' : ano(no.nasc) + (no.morte != null ? ' – ' + ano(no.morte) : no.nasc != null && no.nasc > 1900 ? '' : ''); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

  var tela = $('te-tela'), palco = $('te-palco'), painel = $('te-painel'), g = tela.getContext('2d');
  var D = null, nos = [], porId = {}, elos = [], vizinhos = {};
  var areasOn = {}, tiposOn = { mestre: true, influencia: true, familia: true, movimento: true, grupo: true, escola: true, cita: true };
  var vista = 'teia', escolhido = null, sobre = null;
  var cam = { x: 0, y: 0, s: 1 }, W = 0, H = 0, DPR = 1;
  var cores = {}, fonte = 'sans-serif';

  /* os traços de cada tipo de elo */
  var TRACO = {
    mestre: { a: 0.62, w: 1.5, d: [] }, familia: { a: 0.75, w: 2.4, d: [] }, influencia: { a: 0.34, w: 1.1, d: [2, 3] },
    movimento: { a: 0.24, w: 1, d: [6, 4] }, grupo: { a: 0.2, w: 1, d: [6, 4] }, escola: { a: 0.22, w: 1, d: [3, 5] }, cita: { a: 0.22, w: 1, d: [1, 3] },
  };
  var TAM_ELO = { mestre: 34, familia: 30, influencia: 64, movimento: 52, grupo: 58, escola: 56, cita: 50 };
  var FORCA_ELO = { mestre: 0.04, familia: 0.05, influencia: 0.012, movimento: 0.02, grupo: 0.012, escola: 0.014, cita: 0.015 };

  function lerCores() {
    var cs = getComputedStyle(document.documentElement);
    ['tinta', 'papel', 'papel-2', 'suave', 'fio'].forEach(function (k) { cores[k] = (cs.getPropertyValue('--' + k) || '').trim() || (k === 'papel' ? '#fff' : '#111'); });
    fonte = getComputedStyle(document.body).fontFamily || 'sans-serif';
  }
  function alfa(cor, a) {
    var c = document.createElement('canvas').getContext('2d');
    c.fillStyle = cor; var v = c.fillStyle;
    if (v[0] === '#') { var n = parseInt(v.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
    return v.replace(/rgba?\(([^)]+)\)/, function (m, p) { var q = p.split(',').slice(0, 3); return 'rgba(' + q.join(',') + ',' + a + ')'; });
  }
  var tintaA = {};
  function tinta(a) { var k = Math.round(a * 100); return tintaA[k] || (tintaA[k] = alfa(cores.tinta, k / 100)); }

  /* ---------- os dados ---------- */
  fetch('/api/teia').then(function (r) { if (!r.ok) throw new Error('sem a teia'); return r.json(); }).then(iniciar).catch(function () {
    $('te-abrindo').textContent = 'A teia não abriu agora. Tente de novo em instantes.';
  });

  function iniciar(d) {
    D = d; lerCores();
    nos = d.nos.map(function (n) { var o = Object.assign({}, n); o.x = 0; o.y = 0; o.vx = 0; o.vy = 0; o.grau = 0; return o; });
    nos.forEach(function (n) { porId[n.id] = n; vizinhos[n.id] = []; });
    elos = d.elos.filter(function (e) { return porId[e.de] && porId[e.para]; }).map(function (e) { return { de: porId[e.de], para: porId[e.para], tipo: e.tipo, rel: e.rel || '' }; });
    elos.forEach(function (e) { e.de.grau++; e.para.grau++; vizinhos[e.de.id].push(e); vizinhos[e.para.id].push(e); });
    d.areas.forEach(function (a) { areasOn[a.id] = true; });
    nos.forEach(function (n) { n.r = raio(n); });
    montarControles();
    posicoesDaTeia(true);
    medir();
    enquadrar(false);
    $('te-abrindo').hidden = true;
    // (PS-81) as pessoas da lista entram na conta, e a frase diz quantas já têm ficha
    var pessoas = nos.filter(function (n) { return !n.fora && n.tipo === 'pessoa'; }).length, semFicha = nos.filter(function (n) { return n.semente; }).length;
    $('te-resumo').textContent = 'A rede das ' + pessoas + ' pessoas' + (semFicha ? ' (' + (pessoas - semFicha) + ' com ficha no Atlas)' : '') + ' e dos ' +
      nos.filter(function (n) { return !n.fora && n.tipo === 'grupo'; }).length + ' grupos: quem aprendeu com quem, as famílias, as escolas, os movimentos e os grupos, desde o primeiro registro (' + ano(menorAno()) + ').';
    $('te-fonte').textContent = (d.fonte || '') + (d.colhido ? ' · elos colhidos em ' + d.colhido.split('-').reverse().join('/') : '') + ' · ' + nos.length + ' nós e ' + elos.length + ' elos.';
    var h = location.hash.match(/[#&]p=([^&]+)/);
    if (h) { var alvo = porId[decodeURIComponent(h[1])]; if (alvo) escolher(alvo, true); }
    desenhar();
    if (!REDUZIR) animar();
  }
  function menorAno() { var m = Infinity; nos.forEach(function (n) { if (!n.fora && n.nasc != null && n.nasc < m) m = n.nasc; }); return m === Infinity ? null : m; }
  function raio(n) {
    var base = n.fora ? 3.6 : n.tipo === 'pessoa' ? 7 : 6;
    return Math.min(n.fora ? 9 : 17, base + Math.sqrt(n.grau) * (n.fora ? 0.9 : 1.5));
  }

  /* ---------- a vista da teia: as forças ---------- */
  var ancora = {};
  function posicoesDaTeia(inicio) {
    var areas = D.areas.map(function (a) { return a.id; });
    var R = 120 + areas.length * 52;
    areas.forEach(function (a, i) { var t = -Math.PI / 2 + (i / areas.length) * Math.PI * 2; ancora[a] = { x: Math.cos(t) * R, y: Math.sin(t) * R }; });
    nos.forEach(function (n) {
      var an = ancora[n.area] || { x: 0, y: 0 };
      n.ax = an.x; n.ay = an.y;
      if (inicio) { var u = hash(n.id) * Math.PI * 2, v = 30 + hash(n.id + '·') * 120; n.x = an.x + Math.cos(u) * v; n.y = an.y + Math.sin(u) * v; }
      n.tx = null;
    });
    for (var k = 0; k < (REDUZIR ? 320 : 140); k++) passo(1);
  }
  function visivel(n) { return areasOn[n.area] !== false; }
  function eloVisivel(e) { return tiposOn[e.tipo] && visivel(e.de) && visivel(e.para); }
  function passo(calor) {
    var i, n, grade = {}, C = 46;
    for (i = 0; i < nos.length; i++) {
      n = nos[i];
      n.vx += (n.ax - n.x) * 0.006 * calor; n.vy += (n.ay - n.y) * 0.006 * calor;
      var k = Math.floor(n.x / C) + ',' + Math.floor(n.y / C);
      (grade[k] || (grade[k] = [])).push(n);
    }
    for (i = 0; i < nos.length; i++) {
      n = nos[i];
      var cx = Math.floor(n.x / C), cy = Math.floor(n.y / C);
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        var cel = grade[(cx + dx) + ',' + (cy + dy)];
        if (!cel) continue;
        for (var j = 0; j < cel.length; j++) {
          var m = cel[j];
          if (m === n) continue;
          var ex = n.x - m.x, ey = n.y - m.y, dd = ex * ex + ey * ey;
          var minimo = n.r + m.r + 8;
          if (dd > C * C * 1.6) continue;
          if (dd < 0.01) { ex = hash(n.id) - 0.5; ey = hash(m.id) - 0.5; dd = 0.01; }
          var d = Math.sqrt(dd), f = (d < minimo ? 0.5 * (minimo - d) / d : 0) + 26 / dd;
          n.vx += ex * f * calor * 0.5; n.vy += ey * f * calor * 0.5;
        }
      }
    }
    for (i = 0; i < elos.length; i++) {
      var e = elos[i];
      if (!tiposOn[e.tipo]) continue;
      var a = e.de, b = e.para, lx = b.x - a.x, ly = b.y - a.y, ld = Math.sqrt(lx * lx + ly * ly) || 1;
      var s = (ld - TAM_ELO[e.tipo]) * FORCA_ELO[e.tipo] * calor / ld;
      var pa = b.grau / (a.grau + b.grau), pb = 1 - pa;
      a.vx += lx * s * pa; a.vy += ly * s * pa; b.vx -= lx * s * pb; b.vy -= ly * s * pb;
    }
    for (i = 0; i < nos.length; i++) { n = nos[i]; n.vx *= 0.8; n.vy *= 0.8; n.x += n.vx; n.y += n.vy; }
  }
  var calor = 1, animando = false;
  function animar() {
    if (animando) return;
    animando = true; calor = 1;
    (function quadro() {
      if (vista === 'teia') { for (var k = 0; k < 2; k++) passo(calor); calor *= 0.985; }
      if (transicao) andarTransicao();
      desenhar();
      if (calor > 0.04 || transicao) requestAnimationFrame(quadro); else animando = false;
    })();
  }

  /* ---------- a vista no tempo ---------- */
  var LARGURA_TEMPO = 2600;
  function xDoAno(a) {
    var t = a < 1000 ? ((a + 1000) / 2000) * 0.2 : 0.2 + ((a - 1000) / 1030) * 0.8;
    return -LARGURA_TEMPO / 2 + Math.max(0, Math.min(1, t)) * LARGURA_TEMPO;
  }
  function posicoesDoTempo() {
    var faixas = D.areas.map(function (a) { return a.id; }), alto = 120;
    var ocup = {};
    nos.slice().sort(function (a, b) { return (a.nasc || 0) - (b.nasc || 0); }).forEach(function (n) {
      if (n.nasc == null) { n.tx = n.x; n.ty = n.y; n.semAno = true; return; }
      n.semAno = false;
      var f = Math.max(0, faixas.indexOf(n.area)), y0 = (f - (faixas.length - 1) / 2) * alto;
      var x = xDoAno(n.nasc), linhas = ocup[f] || (ocup[f] = []), lin = 0;
      while (linhas[lin] != null && x - linhas[lin] < (n.r * 2 + 6)) lin++;
      linhas[lin] = x;
      n.tx = x; n.ty = y0 + (lin % 2 ? 1 : -1) * Math.ceil(lin / 2) * 15;
    });
  }
  var transicao = null;
  function trocarVista(v) {
    if (v === vista) return;
    vista = v;
    document.querySelectorAll('.te-vista').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.vista === v)); });
    nos.forEach(function (n) { n.ox = n.x; n.oy = n.y; });
    if (v === 'tempo') posicoesDoTempo();
    else { nos.forEach(function (n) { n.tx = n.tempoX = null; }); var salvo = nos.map(function (n) { return [n.x, n.y]; }); posicoesDaTeia(false); nos.forEach(function (n, i) { n.tx = n.x; n.ty = n.y; n.x = salvo[i][0]; n.y = salvo[i][1]; }); }
    transicao = { t0: performance.now(), dur: REDUZIR ? 1 : 700 };
    if (REDUZIR) { andarTransicao(); enquadrar(false); desenhar(); } else { enquadrar(true); animar(); }
  }
  function andarTransicao() {
    var u = Math.min(1, (performance.now() - transicao.t0) / transicao.dur), k = u * u * (3 - 2 * u);
    nos.forEach(function (n) { if (n.tx == null) return; n.x = n.ox + (n.tx - n.ox) * k; n.y = n.oy + (n.ty - n.oy) * k; n.vx = n.vy = 0; });
    if (u >= 1) { transicao = null; if (vista === 'teia') nos.forEach(function (n) { n.tx = null; }); }
  }

  /* ---------- a câmera ---------- */
  function medir() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    var b = palco.getBoundingClientRect(); W = b.width; H = b.height;
    tela.width = Math.round(W * DPR); tela.height = Math.round(H * DPR);
  }
  var alvoCam = null;
  function enquadrar(suave) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    nos.forEach(function (n) {
      if (!visivel(n) || (vista === 'tempo' && n.semAno)) return;
      var x = n.tx != null ? n.tx : n.x, y = n.tx != null ? n.ty : n.y;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    });
    if (!isFinite(x0)) return;
    if (vista === 'tempo') { x0 -= 170; y0 -= 90; y1 += 40; }   // os nomes das faixas, à esquerda; os arcos, em cima; os anos, embaixo
    var s = Math.min(W / (x1 - x0 + 120), H / (y1 - y0 + 140));
    var c = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s: Math.max(0.12, Math.min(2.2, s)) };
    // no celular, o tempo inteiro não cabe na largura: enquadra pela altura e começa pelos séculos mais cheios
    if (vista === 'tempo' && W < 700) { c.s = Math.max(0.12, Math.min(0.6, H / (y1 - y0 + 140))); c.x = xDoAno(1830); }
    if (suave && !REDUZIR) { alvoCam = c; voar(); } else { cam = c; desenhar(); }
  }
  function voar() {
    if (!alvoCam) return;
    cam.x += (alvoCam.x - cam.x) * 0.16; cam.y += (alvoCam.y - cam.y) * 0.16; cam.s += (alvoCam.s - cam.s) * 0.16;
    if (Math.abs(alvoCam.s - cam.s) < 0.002 && Math.abs(alvoCam.x - cam.x) < 0.5) { cam = alvoCam; alvoCam = null; }
    desenhar();
    if (alvoCam) requestAnimationFrame(voar);
  }
  function telaParaMundo(px, py) { return { x: (px - W / 2) / cam.s + cam.x, y: (py - H / 2) / cam.s + cam.y }; }
  function noEm(px, py) {
    var p = telaParaMundo(px, py), melhor = null, md = Infinity;
    nos.forEach(function (n) {
      if (!visivel(n) || (vista === 'tempo' && n.semAno)) return;
      var d = Math.hypot(n.x - p.x, n.y - p.y), lim = Math.max(n.r + 3, 10 / cam.s);
      if (d < lim && d < md) { md = d; melhor = n; }
    });
    return melhor;
  }

  /* ---------- o desenho ---------- */
  var fotos = {};
  function foto(n) {
    if (!n.capa) return null;
    var f = fotos[n.id];
    if (f === undefined) {
      f = fotos[n.id] = new Image();
      f.decoding = 'async';
      f.onload = function () { f.pronta = true; if (!animando) desenhar(); };
      f.onerror = function () { fotos[n.id] = null; };
      f.src = n.capa;
    }
    return f && f.pronta ? f : null;
  }
  function aceso(n) {
    if (!escolhido) return true;
    if (n === escolhido) return true;
    return vizinhos[escolhido.id].some(function (e) { return eloVisivel(e) && (e.de === n || e.para === n); });
  }
  function desenhar() {
    if (!D) return;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.fillStyle = cores.papel; g.fillRect(0, 0, W, H);
    g.save();
    g.translate(W / 2, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y);
    if (vista === 'teia') rotulosDasAreas(); else eixoDoTempo();
    // os elos
    elos.forEach(function (e) {
      if (!eloVisivel(e)) return;
      if (vista === 'tempo' && (e.de.semAno || e.para.semAno)) return;
      var t = TRACO[e.tipo], dele = escolhido && (e.de === escolhido || e.para === escolhido);
      g.strokeStyle = tinta(escolhido ? (dele ? Math.min(1, t.a + 0.35) : t.a * 0.18) : t.a);
      g.lineWidth = (dele ? t.w + 0.8 : t.w) / Math.sqrt(cam.s);
      g.setLineDash(t.d.map(function (v) { return v / Math.sqrt(cam.s); }));
      g.beginPath();
      if (vista === 'tempo') { var mx = (e.de.x + e.para.x) / 2, my = Math.min(e.de.y, e.para.y) - Math.min(Math.abs(e.para.x - e.de.x) * 0.22, 70); g.moveTo(e.de.x, e.de.y); g.quadraticCurveTo(mx, my, e.para.x, e.para.y); }
      else { g.moveTo(e.de.x, e.de.y); g.lineTo(e.para.x, e.para.y); }
      g.stroke();
    });
    g.setLineDash([]);
    // os nós
    nos.forEach(function (n) {
      if (!visivel(n) || (vista === 'tempo' && n.semAno)) return;
      var luz = aceso(n), a = luz ? 1 : 0.18;
      g.globalAlpha = a;
      forma(n);
      g.globalAlpha = 1;
    });
    // os nomes
    g.font = '600 ' + (12 / cam.s) + 'px ' + fonte;
    g.textAlign = 'center'; g.textBaseline = 'top';
    nos.forEach(function (n) {
      if (!visivel(n) || (vista === 'tempo' && n.semAno)) return;
      var mostra = n === escolhido || n === sobre || (escolhido && aceso(n)) ||
        (!escolhido && ((!n.fora && n.grau >= 7 && cam.s > 0.45) || (!n.fora && cam.s > 1.15) || (n.fora && cam.s > 1.8)));
      if (!mostra) return;
      var nome = n.nome.length > 26 ? n.nome.slice(0, 25) + '…' : n.nome;
      g.lineWidth = 4 / cam.s; g.strokeStyle = cores.papel; g.strokeText(nome, n.x, n.y + n.r + 3 / cam.s);
      g.fillStyle = tinta(n.fora ? 0.62 : 0.92); g.fillText(nome, n.x, n.y + n.r + 3 / cam.s);
    });
    g.restore();
  }
  function forma(n) {
    var r = n.r, x = n.x, y = n.y;
    g.lineWidth = (n === escolhido ? 2.4 : 1.2) / Math.sqrt(cam.s);
    g.strokeStyle = tinta(n.fora ? 0.55 : 0.9);
    if (n.tipo === 'pessoa') {
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
      if (n.fora) { g.setLineDash([2 / cam.s, 2 / cam.s]); g.fillStyle = cores.papel; g.fill(); g.stroke(); g.setLineDash([]); return; }
      if (n.semente) { g.fillStyle = tinta(0.4); g.fill(); g.stroke(); return; }   // (PS-81) da lista, sem ficha ainda: cheia e mais clara
      var f = r * cam.s > 9 ? foto(n) : null;
      if (f) {
        g.save(); g.clip(); g.filter = 'grayscale(1)';
        var lado = Math.min(f.naturalWidth, f.naturalHeight);
        g.drawImage(f, (f.naturalWidth - lado) / 2, (f.naturalHeight - lado) * 0.25, lado, lado, x - r, y - r, r * 2, r * 2);
        g.restore(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      } else { g.fillStyle = tinta(0.82); g.fill(); }
      if (n.atlantis) { g.beginPath(); g.arc(x, y, r + 3 / cam.s, 0, Math.PI * 2); g.lineWidth = 1 / cam.s; g.stroke(); }
    } else if (n.tipo === 'escola') {
      g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath();
      g.fillStyle = n.fora ? cores.papel : tinta(0.15); g.fill(); g.stroke();
    } else {
      var q = r * 0.9;
      g.beginPath(); if (g.roundRect) g.roundRect(x - q, y - q, q * 2, q * 2, q * 0.3); else g.rect(x - q, y - q, q * 2, q * 2);
      g.fillStyle = n.fora ? cores.papel : tinta(0.15);
      if (n.fora) g.setLineDash([3 / cam.s, 2 / cam.s]);
      g.fill(); g.stroke(); g.setLineDash([]);
    }
  }
  function rotulosDasAreas() {
    g.font = '700 ' + Math.max(15, 18 / cam.s) + 'px ' + fonte;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    D.areas.forEach(function (a) {
      if (areasOn[a.id] === false) return;
      var an = ancora[a.id], R = Math.hypot(an.x, an.y) || 1, k = (R + 150) / R;
      g.fillStyle = tinta(0.3);
      g.fillText(a.nome.toUpperCase(), an.x * k, an.y * k);
    });
  }
  function eixoDoTempo() {
    var marcas = [-800, -400, 0, 500, 1000, 1200, 1400, 1500, 1600, 1700, 1800, 1850, 1900, 1950, 2000];
    var faixas = D.areas.map(function (a) { return a.id; }), alto = 120, topo = -((faixas.length) / 2) * alto - 20, fundo = ((faixas.length) / 2) * alto + 10;
    g.font = '600 ' + (11 / cam.s) + 'px ' + fonte; g.textAlign = 'center'; g.textBaseline = 'top';
    marcas.forEach(function (m) {
      var x = xDoAno(m);
      g.strokeStyle = tinta(0.1); g.lineWidth = 1 / cam.s; g.beginPath(); g.moveTo(x, topo); g.lineTo(x, fundo); g.stroke();
      g.fillStyle = tinta(0.45); g.fillText(ano(m), x, fundo + 6 / cam.s);
    });
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '700 ' + (13 / cam.s) + 'px ' + fonte;
    faixas.forEach(function (f, i) {
      if (areasOn[f] === false) return;
      var y = (i - (faixas.length - 1) / 2) * alto;
      g.fillStyle = tinta(0.4); g.fillText(f.toUpperCase(), -LARGURA_TEMPO / 2 - 10 / cam.s - g.measureText(f.toUpperCase()).width, y);
    });
  }

  /* ---------- escolher e o painel ---------- */
  function escolher(n, voarAte) {
    escolhido = n;
    if (!n) { painel.hidden = true; history.replaceState(null, '', location.pathname + location.search); desenhar(); return; }
    history.replaceState(null, '', '#p=' + encodeURIComponent(n.id));
    montarPainel(n);
    if (voarAte) { alvoCam = { x: n.x + (W > 700 ? 110 / Math.max(cam.s, 0.6) : 0), y: n.y + (W > 700 ? 0 : 90 / Math.max(cam.s, 0.6)), s: Math.max(cam.s, 0.9) }; if (REDUZIR) { cam = alvoCam; alvoCam = null; } else voar(); }
    desenhar();
  }
  function montarPainel(n) {
    var grupos = {};
    vizinhos[n.id].forEach(function (e) {
      var outro = e.de === n ? e.para : e.de, ida = e.de === n;
      var rot = e.tipo === 'mestre' ? (ida ? 'Ensinou' : 'Aprendeu com') : e.tipo === 'influencia' ? (ida ? 'Influenciou' : 'Influências') :
        e.tipo === 'familia' ? 'Família' : e.tipo === 'cita' ? 'As fichas se citam' : e.tipo === 'escola' ? (n.tipo === 'pessoa' ? 'Estudou em' : 'Estudaram aqui') :
        e.tipo === 'movimento' ? (n.tipo === 'pessoa' ? 'Movimentos' : 'Gente deste movimento') : (n.tipo === 'pessoa' ? 'Grupos' : 'Membros');
      (grupos[rot] || (grupos[rot] = [])).push({ no: outro, rel: e.rel });
    });
    var html = '<button type="button" class="te-p-fechar" data-fechar aria-label="Fechar">×</button>';
    if (n.capa) html += '<img class="te-p-foto" src="' + esc(n.capa) + '" alt="">';
    html += '<h2 class="te-p-nome">' + esc(n.nome) + '</h2>';
    var dt = datas(n);
    if (dt) html += '<p class="te-p-datas">' + esc(dt) + '</p>';
    html += '<p class="te-p-sub">' + esc([n.fora ? (n.tipo === 'pessoa' ? 'Sem ficha ainda' : n.tipo === 'escola' ? 'Escola, sem ficha ainda' : 'Grupo, sem ficha ainda') : n.semente ? n.area + ' · sem ficha ainda' : n.area, n.sub, n.origem].filter(Boolean).join(' · ')) + '</p>';
    if (n.resumo) html += '<p class="te-p-resumo">' + esc(n.resumo.length > 210 ? n.resumo.slice(0, 209).replace(/\s+\S*$/, '') + '…' : n.resumo) + '</p>';
    if (n.atlantis) html += '<a class="te-p-atl" href="https://serafim-resistence.vercel.app/" target="_blank" rel="noopener">Também no Hall da Fama do jogo Atlantis ↗</a>';
    var ordem = ['Aprendeu com', 'Ensinou', 'Família', 'Influências', 'Influenciou', 'Movimentos', 'Grupos', 'Estudou em', 'Gente deste movimento', 'Membros', 'Estudaram aqui', 'As fichas se citam'];
    ordem.forEach(function (rot) {
      var l = grupos[rot];
      if (!l) return;
      l.sort(function (a, b) { return (a.no.fora ? 1 : 0) - (b.no.fora ? 1 : 0) || a.no.nome.localeCompare(b.no.nome, 'pt'); });
      html += '<p class="te-p-grupo">' + esc(rot) + '</p><ul class="te-p-lista">' + l.map(function (x) {
        return '<li><button type="button" class="te-p-elo' + (x.no.fora ? ' fora' : '') + '" data-id="' + esc(x.no.id) + '">' + esc(x.no.nome) + (x.rel ? ' · ' + esc(x.rel) : '') + '</button></li>';
      }).join('') + '</ul>';
    });
    if (n.extras && n.extras.length) {
      html += '<p class="te-p-grupo">Mais elos (sem ficha)</p><ul class="te-p-lista">' + n.extras.map(function (x) {
        var r = x.tipo === 'mestre' ? (x.ida ? 'aluno' : 'mestre') : x.rel;
        return '<li><a class="te-p-elo fora" href="' + esc(x.wikidata) + '" target="_blank" rel="noopener">' + esc(x.nome) + (r ? ' · ' + esc(r) : '') + '</a></li>';
      }).join('') + '</ul>';
    }
    html += '<div class="te-p-acoes">' + (n.fora || n.semente
      ? (n.wikipedia ? '<a class="te-p-acao leve" href="' + esc(n.wikipedia) + '" target="_blank" rel="noopener">Na Wikipédia ↗</a>' : '') +
        (n.wikidata ? '<a class="te-p-acao leve" href="' + esc(n.wikidata) + '" target="_blank" rel="noopener">No Wikidata ↗</a>' : '')
      : '<a class="te-p-acao" href="biblioteca.html#f=' + encodeURIComponent(n.id) + '">Abrir a ficha</a>') + '</div>';
    painel.innerHTML = html;
    painel.hidden = false;
    painel.scrollTop = 0;
  }
  painel.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-fechar]')) { escolher(null); return; }
    var b = ev.target.closest('.te-p-elo[data-id]');
    if (b && porId[b.dataset.id]) escolher(porId[b.dataset.id], true);
  });

  /* ---------- os controles ---------- */
  function montarControles() {
    $('te-areas').innerHTML = D.areas.map(function (a) {
      return '<button type="button" class="te-chip" data-area="' + esc(a.id) + '" aria-pressed="true">' + esc(a.nome) + '<b>' + a.fichas + '</b></button>';
    }).join('');
    var conta = {};
    elos.forEach(function (e) { conta[e.tipo] = (conta[e.tipo] || 0) + 1; });
    $('te-tipos').innerHTML = Object.keys(TRACO).filter(function (t) { return conta[t]; }).map(function (t) {
      return '<button type="button" class="te-chip" data-tipo="' + t + '" aria-pressed="true">' + esc(D.tipos[t] || t) + '<b>' + conta[t] + '</b></button>';
    }).join('');
    $('te-nomes').innerHTML = nos.filter(function (n) { return !n.fora; }).map(function (n) { return '<option value="' + esc(n.nome) + '">'; }).join('');
    $('te-legenda').innerHTML = Object.keys(TRACO).filter(function (t) { return conta[t]; }).map(function (t) {
      var s = TRACO[t];
      return '<span><svg viewBox="0 0 34 10" aria-hidden="true"><line x1="1" y1="5" x2="33" y2="5" stroke="currentColor" stroke-opacity="' + Math.min(1, s.a + 0.3) + '" stroke-width="' + s.w + '" stroke-dasharray="' + s.d.join(' ') + '"/></svg>' + esc(D.tipos[t] || t) + '</span>';
    }).join('') + '<span><svg viewBox="0 0 34 10" aria-hidden="true"><circle cx="6" cy="5" r="4" fill="currentColor"/><rect x="15" y="1" width="8" height="8" rx="2" fill="none" stroke="currentColor"/><path d="M29 1 L33 5 L29 9 L25 5 Z" fill="none" stroke="currentColor"/></svg>pessoa · grupo · escola (mais clara: da lista, sem ficha ainda; tracejado: de fora)</span>';
  }
  document.querySelector('.te-vistas').addEventListener('click', function (ev) { var b = ev.target.closest('[data-vista]'); if (b) trocarVista(b.dataset.vista); });
  $('te-filtros-b').addEventListener('click', function () {
    var f = $('te-filtros'), abrir = f.hidden; f.hidden = !abrir; this.setAttribute('aria-expanded', String(abrir));
  });
  $('te-filtros').addEventListener('click', function (ev) {
    var b = ev.target.closest('.te-chip');
    if (!b) return;
    var on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    if (b.dataset.area) areasOn[b.dataset.area] = on; else tiposOn[b.dataset.tipo] = on;
    if (escolhido && !visivel(escolhido)) escolher(null);
    if (vista === 'teia') { posicoesDaTeia(false); if (!REDUZIR) animar(); }
    desenhar();
  });
  function buscar(q, final) {
    var t = norm(q).trim();
    if (!t) return;
    var achado = nos.filter(function (n) { return !n.fora && visivel(n); }).find(function (n) { return norm(n.nome) === t; }) ||
      (final ? nos.filter(function (n) { return visivel(n); }).find(function (n) { return norm(n.nome).indexOf(t) >= 0; }) : null);
    if (achado) escolher(achado, true);
  }
  $('te-q').addEventListener('input', function () { buscar(this.value, false); });
  $('te-q').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); buscar(this.value, true); } });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && escolhido) escolher(null); });
  document.querySelector('.te-zoom').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-zoom]');
    if (!b) return;
    var z = +b.dataset.zoom;
    if (!z) { enquadrar(true); return; }
    alvoCam = { x: cam.x, y: cam.y, s: Math.max(0.12, Math.min(4, cam.s * (z > 0 ? 1.4 : 1 / 1.4))) };
    if (REDUZIR) { cam = alvoCam; alvoCam = null; desenhar(); } else voar();
  });

  /* ---------- arrastar, aproximar, tocar ---------- */
  var toques = new Map(), arrasto = null, pinca = null, moveu = false;
  function dica() { var d = $('te-dica'); if (d && !d.classList.contains('some')) d.classList.add('some'); }
  tela.addEventListener('pointerdown', function (ev) {
    tela.setPointerCapture(ev.pointerId);
    toques.set(ev.pointerId, { x: ev.offsetX, y: ev.offsetY });
    moveu = false;
    if (toques.size === 1) arrasto = { x: ev.offsetX, y: ev.offsetY, cx: cam.x, cy: cam.y };
    else if (toques.size === 2) { var p = [...toques.values()]; pinca = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: cam.s }; arrasto = null; }
  });
  tela.addEventListener('pointermove', function (ev) {
    if (!toques.has(ev.pointerId)) {
      var n = noEm(ev.offsetX, ev.offsetY);
      if (n !== sobre) { sobre = n; tela.classList.toggle('sobre', !!n); if (!animando) desenhar(); }
      return;
    }
    toques.set(ev.pointerId, { x: ev.offsetX, y: ev.offsetY });
    if (pinca && toques.size === 2) {
      var p = [...toques.values()], d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      cam.s = Math.max(0.12, Math.min(4, pinca.s * d / Math.max(1, pinca.d))); moveu = true; dica(); desenhar();
    } else if (arrasto) {
      var dx = ev.offsetX - arrasto.x, dy = ev.offsetY - arrasto.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) { moveu = true; tela.classList.add('arrastando'); dica(); }
      cam.x = arrasto.cx - dx / cam.s; cam.y = arrasto.cy - dy / cam.s; alvoCam = null; desenhar();
    }
  });
  function soltar(ev) {
    if (!toques.has(ev.pointerId)) return;
    toques.delete(ev.pointerId);
    tela.classList.remove('arrastando');
    if (toques.size < 2) pinca = null;
    if (toques.size === 0) {
      if (!moveu) { var n = noEm(ev.offsetX, ev.offsetY); escolher(n || null, false); }
      arrasto = null;
    }
  }
  tela.addEventListener('pointerup', soltar);
  tela.addEventListener('pointercancel', soltar);
  tela.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var antes = telaParaMundo(ev.offsetX, ev.offsetY);
    cam.s = Math.max(0.12, Math.min(4, cam.s * Math.exp(-ev.deltaY * 0.0015)));
    var depois = telaParaMundo(ev.offsetX, ev.offsetY);
    cam.x += antes.x - depois.x; cam.y += antes.y - depois.y; alvoCam = null; dica();
    desenhar();
  }, { passive: false });
  window.addEventListener('resize', function () { if (!D) return; medir(); desenhar(); });
  // o tema (claro, escuro, papel…) pode mudar com a página aberta: as cores do desenho acompanham
  new MutationObserver(function () { if (!D) return; tintaA = {}; lerCores(); desenhar(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-cor', 'data-estilo', 'data-tema', 'class'] });

  /* para os testes: o estado da teia */
  window.Teia = {
    get pronta() { return !!D; },
    get escolhido() { return escolhido && escolhido.id; },
    get vista() { return vista; },
    resumo: function () { return D ? { nos: nos.length, elos: elos.length, areas: D.areas.length } : null; },
    escolher: function (id) { if (porId[id]) escolher(porId[id], true); },
    naTela: function (id) { var n = porId[id]; return n ? { x: (n.x - cam.x) * cam.s + W / 2, y: (n.y - cam.y) * cam.s + H / 2 } : null; },
  };
})();
