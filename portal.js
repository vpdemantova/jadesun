/* ============================================================
   O PORTAL (09/out/2026, PERFIL.md item 74)
   "Que dê pra ver o site em uma bola, em círculo, que tudo da tela se comprima e se expanda;
   inove nisso, e que tenha coisas que mexam com os planos e dimensões, tudo em um botão bem pensado."

   O botão é o Círculo Negro de Malevich (1915), o par do Quadrado da marca; a tecla O também abre.
   · A tela de agora se comprime numa esfera e vira um mundo do sistema do Portal Solar.
   · No centro, o Sol é o Quadrado: o Manifesto. Em volta, as portas como planetas, de perto
     para longe: o dia (Hoje), a pessoa (Eu), o lugar (Casa), o mundo (Atlas). Cada página de
     dentro é uma lua do seu planeta.
   · Três dimensões: Plano (o mapa visto de cima), Órbita (o sistema inclinado, girando devagar)
     e Esfera (todas as páginas sobre um globo). Arraste para girar o plano, role (ou pince)
     para aproximar; as setas também giram.
   · Tocar num mundo: ele se expande e vira a página (a página nova nasce do mesmo ponto).
   · Esc, ou tocar no seu mundo, devolve a tela.
   Os lugares vêm do mesmo mapa do menu (Perfil.lugares()): mudou o menu, mudou o Portal.
   ============================================================ */
(function () {
  'use strict';

  var P = window.Perfil;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function ic(n) { return window.Icones ? window.Icones.svg(n) : ''; }
  function calmo() { return document.documentElement.getAttribute('data-mov') === 'off' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function ler(k, p) { try { var v = localStorage.getItem(k); return v == null ? p : v; } catch (e) { return p; } }
  function gravar(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ok */ } }
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var mola = function (t) { return 1 - Math.pow(1 - t, 4); };

  /* as cores das portas (as mesmas dos ícones das abas, em tema.js) */
  var COR = { agora: '#E9822A', eu: '#E0559A', casa: '#D99A2B', atlas: '#3D8FE0', manifesto: '#14130F' };
  var ICONE = { agora: 'hoje', eu: 'eu', casa: 'casa', atlas: 'atlas', manifesto: 'manifesto', domino: 'domino', area: 'area', copiar: 'copiar', guias: 'guias', curadoria: 'curadoria', biblioteca: 'biblioteca', quando: 'quando', falta: 'sobre', museus: 'museu', jardim: 'jardim', estante: 'estante', 'guarda-roupa': 'guarda-roupa', entrar: 'conta', manifestos: 'manifestos', filosofia: 'filosofia' };
  var ORDEM_PLANETAS = ['agora', 'eu', 'casa', 'atlas'];
  var MODOS = [['plano', 'Plano', 'O mapa visto de cima'], ['orbita', 'Órbita', 'O sistema inclinado, girando'], ['esfera', 'Esfera', 'Todas as páginas sobre um globo']];

  var aberto = false, el = null, cima = null, casca = null, corpos = [], modo = 'orbita', anterior = null, troca = 1, t0 = 0, raf = 0;
  var cam = { tilt: 0, spin: 0, zoom: 1, alvoTilt: 0, alvoSpin: 0, alvoZoom: 1, yaw: 0, pitch: 0, alvoYaw: 0, alvoPitch: 0 };
  var vw = 0, vh = 0, base = 0, atualCorpo = null, relogio = 0, ultimo = 0, abrindo = false, fechando = false, arrasto = null;
  var bolaR = 0, bolaO = null, fator = 1;

  /* ---------- os corpos do sistema ---------- */
  function montarCorpos() {
    var L = P.lugares(), lista = [];
    var porta = function (id) { return L.portas.filter(function (p) { return p[0] === id; })[0]; };
    var m = porta('manifesto') || ['manifesto', 'manifesto.html', 'Manifesto', 'O Portal Solar'];
    lista.push({ id: 'manifesto', tipo: 'sol', href: m[1], nome: 'Portal Solar', desc: 'o Sol é o Quadrado: o Manifesto', cor: COR.manifesto, r: 34 * fator });
    ORDEM_PLANETAS.forEach(function (id, i) {
      var p = porta(id); if (!p) return;
      var corpo = { id: id, tipo: 'planeta', href: p[1], nome: p[2], desc: p[3], cor: COR[id], r: (24 - i * 1.2) * fator, orbita: i, ang0: [0.4, 2.3, 4.1, 5.6][i], vel: [0.16, 0.11, 0.08, 0.06][i] };
      lista.push(corpo);
      var fam = L.familias[id];
      (fam ? fam[1] : []).filter(function (x) { return x[0] !== id; }).forEach(function (x, k, todos) {
        lista.push({ id: x[0], tipo: 'lua', pai: corpo, href: x[1], nome: x[2], desc: x[3], cor: COR[id], r: 9 * Math.max(.85, fator), ang0: (k / todos.length) * Math.PI * 2, vel: 0.5 - k * 0.03, n: todos.length, k: k });
      });
    });
    var famM = L.familias.manifesto;
    (famM ? famM[1] : []).filter(function (x) { return x[0] !== 'manifesto'; }).forEach(function (x, k, todos) {
      lista.push({ id: x[0], tipo: 'lua', pai: lista[0], href: x[1], nome: x[2], desc: x[3], cor: '#6B6A63', r: 9 * Math.max(.85, fator), ang0: Math.PI * 0.25 + (k / todos.length) * Math.PI * 2, vel: 0.35, n: todos.length, k: k });
    });
    /* onde você está: a página, a lua dela ou a porta da família */
    atualCorpo = lista.filter(function (c) { return c.id === L.atual; })[0] || lista.filter(function (c) { return c.id === L.pai; })[0] || lista[0];
    /* na esfera: as portas no equador, as luas em volta, o Sol no polo de cima */
    var luasDe = {};
    lista.forEach(function (c) { if (c.tipo === 'lua') (luasDe[c.pai.id] = luasDe[c.pai.id] || []).push(c); });
    lista.forEach(function (c) {
      if (c.tipo === 'sol') { c.lat = 1.18; c.lon = 0; }
      else if (c.tipo === 'planeta') { c.lat = 0; c.lon = c.orbita * Math.PI / 2; }
      else {
        var irmas = luasDe[c.pai.id], k = irmas.indexOf(c), n = irmas.length;
        if (c.pai.tipo === 'sol') { c.lat = 0.82; c.lon = (k / n) * Math.PI * 2 + 0.6; }
        else { var fila = k % 2 ? -1 : 1; c.lat = fila * (0.42 + 0.16 * Math.floor(k / 2)); c.lon = c.pai.lon + (Math.floor(k / 2) - (Math.ceil(n / 2) - 1) / 2) * 0.34; }
      }
    });
    return lista;
  }

  /* ---------- as posições (antes da câmera), em cada dimensão ---------- */
  function raioOrbita(i) { return base * (0.4 + 0.16 * i); }
  function posPlano(c, t, gira) {
    if (c.tipo === 'sol') return [0, 0, 0];
    if (c.tipo === 'planeta') { var a = c.ang0 + (gira ? t * c.vel : 0), r = raioOrbita(c.orbita); return [r * Math.cos(a), r * Math.sin(a), 0]; }
    var p = posPlano(c.pai, t, gira), ra = (c.pai.tipo === 'sol' ? base * 0.24 : c.pai.r * 2.3 + c.r * 1.4 + (c.n > 4 ? 14 : 0)) + (c === atualCorpo ? Math.max(46, Math.min(vw, vh) * 0.105) * 0.62 : 0);
    var b = c.ang0 + (gira ? t * c.vel : 0);
    return [p[0] + ra * Math.cos(b), p[1] + ra * Math.sin(b), 0];
  }
  function posEsfera(c) {
    var R = base * 0.78, cl = Math.cos(c.lat);
    return [R * cl * Math.sin(c.lon), -R * Math.sin(c.lat), R * cl * Math.cos(c.lon)];
  }
  function posModo(nome, c, t) {
    if (nome === 'esfera') return posEsfera(c);
    return posPlano(c, t, nome === 'orbita' && !calmo());
  }
  /* a câmera: no Plano e na Órbita gira em volta do eixo do sistema e inclina; na Esfera gira o globo */
  function camera(nome, p) {
    var x = p[0], y = p[1], z = p[2];
    if (nome === 'esfera') {
      var cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      var y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      return [x1, y2, z2];
    }
    var cs = Math.cos(cam.spin), ss = Math.sin(cam.spin), ct = Math.cos(cam.tilt), st = Math.sin(cam.tilt);
    var xa = x * cs - y * ss, ya = x * ss + y * cs;
    return [xa, ya * ct - z * st, ya * st + z * ct];
  }
  function projetar(q) {
    var D = base * 3.2, s = D / (D - q[2] * cam.zoom) * cam.zoom;
    return { x: vw / 2 + q[0] * s, y: vh / 2 + 10 + q[1] * s, s: s, z: q[2] };
  }

  /* o tamanho do sistema acompanha a tela: no celular, tudo encolhe para caber */
  function medir() {
    vw = window.innerWidth; vh = window.innerHeight;
    fator = vw < 640 ? 0.7 : vw < 1000 ? 0.85 : 1;
    base = Math.min(vw * (vw < 640 ? 0.44 : 0.5), vh * 0.62);
  }

  /* ---------- montar a cena ---------- */
  function html() {
    return '<canvas class="po-estrelas" aria-hidden="true"></canvas><svg class="po-linhas" aria-hidden="true"></svg>' +
      '<div class="po-corpos">' + corpos.map(function (c, i) {
        var atual = c === atualCorpo;
        return '<a class="po-corpo po-' + c.tipo + (atual ? ' po-atual' : '') + '" href="' + esc(c.href) + '" data-i="' + i + '" style="--c:' + c.cor + ';--r:' + c.r + 'px;--i:' + i + '" ' +
          'aria-label="' + esc(c.nome + (c.desc ? ': ' + c.desc : '') + (atual ? ' (você está aqui)' : '')) + '"' + (atual ? ' aria-current="page"' : '') + '>' +
          '<span class="po-disco">' + (c.tipo === 'sol' ? '<i class="po-quadrado"></i>' : ic(ICONE[c.id] || 'mais')) + '</span>' +
          '<span class="po-nome">' + esc(c.nome) + (c.tipo === 'planeta' ? '<small>' + esc(c.desc) + '</small>' : '') + '</span></a>';
      }).join('') + '</div>';
  }
  function htmlCima() {
    return '<div class="po-brilho" aria-hidden="true"></div><button type="button" class="po-voltar-bola" aria-label="Voltar para a página">' +
      '<span class="po-aqui">você está aqui · ' + esc(atualCorpo.nome) + '</span></button>' +
      '<header class="po-cab"><p class="po-marca">' + (window.Icones ? window.Icones.quadrado() : '') + 'Portal Solar</p><p class="po-dica">arraste para girar · role para aproximar · toque num mundo para entrar · Esc volta</p></header>' +
      '<div class="po-ui" role="toolbar" aria-label="Dimensões do Portal">' +
        '<div class="po-modos" role="radiogroup" aria-label="Dimensão">' + MODOS.map(function (m) { return '<button type="button" role="radio" data-modo="' + m[0] + '" title="' + esc(m[2]) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        '<div class="po-zoom"><button type="button" data-zoom="-1" aria-label="Afastar">−</button><button type="button" data-zoom="1" aria-label="Aproximar">+</button></div>' +
        '<button type="button" class="po-fechar" data-fechar>' + ic('fechar') + '<span>Voltar</span></button>' +
      '</div>';
  }
  function estrelas() {
    var cv = el.querySelector('.po-estrelas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = vw * dpr; cv.height = vh * dpr;
    var g = cv.getContext('2d'); g.scale(dpr, dpr);
    var s = 7;
    var rnd = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (var i = 0; i < Math.round(vw * vh / 2600); i++) {
      var x = rnd() * vw, y = rnd() * vh, r = rnd() < 0.92 ? rnd() * 0.9 + 0.2 : rnd() * 1.6 + 0.8;
      g.globalAlpha = 0.25 + rnd() * 0.65; g.fillStyle = rnd() < 0.15 ? '#FFD9A8' : rnd() < 0.3 ? '#BFD6FF' : '#FFFFFF';
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }

  /* ---------- o quadro: posições, linhas, a bola da página ---------- */
  function quadro(agora) {
    raf = 0;
    if (!aberto) return;
    var dt = Math.min(0.05, (agora - (ultimo || agora)) / 1000); ultimo = agora;
    if (!arrasto && !abrindo && !fechando && modo === 'orbita' && !calmo()) relogio += dt;
    if (!arrasto && modo === 'esfera' && !calmo()) cam.alvoYaw += dt * 0.12;
    var k = 1 - Math.exp(-dt * 6);
    cam.tilt = lerp(cam.tilt, cam.alvoTilt, k); cam.spin = lerp(cam.spin, cam.alvoSpin, k); cam.zoom = lerp(cam.zoom, cam.alvoZoom, k);
    cam.yaw = lerp(cam.yaw, cam.alvoYaw, k); cam.pitch = lerp(cam.pitch, cam.alvoPitch, k);
    if (troca < 1) troca = Math.min(1, troca + dt / 0.9);
    var e = mola(troca);
    var nos = el.querySelectorAll('.po-corpo');
    corpos.forEach(function (c, i) {
      var pa = camera(modo, posModo(modo, c, relogio));
      if (anterior && troca < 1) { var pb = camera(anterior, posModo(anterior, c, relogio)); pa = [lerp(pb[0], pa[0], e), lerp(pb[1], pa[1], e), lerp(pb[2], pa[2], e)]; }
      var pr = projetar(pa);
      c.tela = pr;
      var n = nos[i]; if (!n) return;
      var atras = modo === 'esfera' ? Math.max(0, -pr.z / (base * 0.78)) : 0;
      n.style.transform = 'translate3d(' + pr.x.toFixed(1) + 'px,' + pr.y.toFixed(1) + 'px,0) scale(' + pr.s.toFixed(3) + ')';
      n.style.zIndex = String(1000 + Math.round(pr.z));
      n.style.opacity = (1 - atras * 0.72).toFixed(2);
      n.classList.toggle('po-longe', atras > 0.35);
    });
    linhas(e);
    seguirBola();
    if (aberto) raf = requestAnimationFrame(quadro);
  }
  function anelPath(pontos) { return pontos.map(function (p, i) { return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); }).join('') + 'Z'; }
  function linhas(e) {
    var svg = el.querySelector('.po-linhas'), d = '', dLua = '', fios = '';
    var desenhaModo = (anterior && troca < 0.5) ? anterior : modo;
    if (desenhaModo === 'esfera') {
      var R = base * 0.78;
      for (var la = -60; la <= 60; la += 30) {
        var pts = []; for (var a = 0; a <= 64; a++) { var lon = a / 64 * Math.PI * 2, rl = la * Math.PI / 180; pts.push(projetar(camera('esfera', [R * Math.cos(rl) * Math.sin(lon), -R * Math.sin(rl), R * Math.cos(rl) * Math.cos(lon)]))); }
        d += anelPath(pts);
      }
      for (var lo = 0; lo < 180; lo += 30) {
        var pm = []; for (var b = 0; b <= 64; b++) { var lt = b / 64 * Math.PI * 2, ln = lo * Math.PI / 180; pm.push(projetar(camera('esfera', [R * Math.cos(lt) * Math.sin(ln), -R * Math.sin(lt), R * Math.cos(lt) * Math.cos(ln)]))); }
        dLua += anelPath(pm);
      }
    } else {
      for (var i = 0; i < ORDEM_PLANETAS.length; i++) {
        var r = raioOrbita(i), pts2 = [];
        for (var j = 0; j <= 96; j++) { var an = j / 96 * Math.PI * 2; pts2.push(projetar(camera(desenhaModo, [r * Math.cos(an), r * Math.sin(an), 0]))); }
        d += anelPath(pts2);
      }
      /* os fios das luas até o planeta */
      corpos.forEach(function (c) { if (c.tipo === 'lua' && c.tela && c.pai.tela) fios += 'M' + c.pai.tela.x.toFixed(1) + ' ' + c.pai.tela.y.toFixed(1) + 'L' + c.tela.x.toFixed(1) + ' ' + c.tela.y.toFixed(1); });
    }
    svg.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
    svg.innerHTML = '<path class="po-anel" d="' + d + '"/>' + (dLua ? '<path class="po-anel po-meridiano" d="' + dLua + '"/>' : '') + (fios ? '<path class="po-fio" d="' + fios + '"/>' : '');
    svg.style.opacity = anterior && troca < 1 ? Math.abs(1 - 2 * mola(troca)).toFixed(2) : '1';
  }

  /* a página de verdade, comprimida, segue o seu mundo */
  function alvoBola() {
    var t = atualCorpo.tela; if (!t) return null;
    var tam = Math.max(46, Math.min(vw, vh) * 0.105);
    var rTela = Math.max(18, (atualCorpo.tipo === 'sol' ? tam * 1.1 : atualCorpo.tipo === 'planeta' ? tam : tam * 0.68) * t.s);
    return { x: t.x, y: t.y, k: rTela / bolaR, r: rTela };
  }
  function transformeBola(a) { return 'translate(' + (a.x - vw / 2).toFixed(1) + 'px,' + (a.y - vh / 2).toFixed(1) + 'px) scale(' + a.k.toFixed(4) + ')'; }
  function seguirBola() {
    if (!casca || abrindo || fechando) return;
    var a = alvoBola(); if (!a) return;
    casca.style.transform = transformeBola(a);
    var b = cima.querySelector('.po-brilho'), v = cima.querySelector('.po-voltar-bola');
    var est = 'left:' + (a.x - a.r).toFixed(1) + 'px;top:' + (a.y - a.r).toFixed(1) + 'px;width:' + (a.r * 2).toFixed(1) + 'px;height:' + (a.r * 2).toFixed(1) + 'px';
    b.style.cssText = est; v.style.cssText = est;
    /* a etiqueta "você está aqui" nunca sai da tela */
    var et = v.querySelector('.po-aqui');
    if (et) { var w = et.offsetWidth || 160, cx = Math.max(8 + w / 2, Math.min(vw - 8 - w / 2, a.x)); et.style.transform = 'translateX(calc(-50% + ' + (cx - a.x).toFixed(1) + 'px))'; }
    /* na esfera, quando o seu mundo passa para trás do globo, ele escurece */
    var atras = modo === 'esfera' ? Math.max(0, -atualCorpo.tela.z / (base * 0.78)) : 0;
    casca.style.opacity = (1 - atras * 0.6).toFixed(2); b.style.opacity = casca.style.opacity;
  }
  function prepararBola() {
    casca = document.querySelector('.casca') || document.querySelector('main') || document.body.firstElementChild;
    var r = casca.getBoundingClientRect();
    bolaO = { x: vw / 2 - r.left, y: vh / 2 - r.top };
    bolaR = Math.min(vw, vh) * 0.5;
    casca.classList.add('po-bola');
    casca.style.transformOrigin = bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px';
    casca.style.clipPath = 'circle(' + bolaR.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)';
  }

  /* ---------- abrir e fechar ---------- */
  function abrir() {
    if (aberto || !P || !P.lugares) return;
    aberto = true; abrindo = true;
    medir();
    modo = ler('portal:modo', 'orbita'); if (!MODOS.some(function (m) { return m[0] === modo; })) modo = 'orbita';
    corpos = montarCorpos();
    relogio = 0; troca = 1; anterior = null; ultimo = 0;
    definirCamera(true);
    document.documentElement.classList.add('portal-aberto');
    el = document.createElement('div'); el.className = 'portal'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Portal: o site inteiro numa esfera');
    el.innerHTML = html(); document.body.appendChild(el);
    cima = document.createElement('div'); cima.className = 'portal-cima'; cima.innerHTML = htmlCima(); document.body.appendChild(cima);
    pintarModos();
    estrelas();
    var lenis = window.Movimento && window.Movimento.lenis && window.Movimento.lenis(); if (lenis) lenis.stop();
    /* o primeiro quadro calcula onde fica o seu mundo; a página encolhe até lá */
    quadro(performance.now());
    prepararBola();
    var a = alvoBola();
    var grande = Math.hypot(vw, vh) / 2 + 4;
    var fim = function () { abrindo = false; casca.style.clipPath = 'circle(' + bolaR.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)'; seguirBola(); el.classList.add('po-pronto'); cima.classList.add('po-pronto'); };
    if (calmo() || !casca.animate) { casca.style.transform = transformeBola(a); fim(); }
    else {
      var anim = casca.animate([
        { transform: 'none', clipPath: 'circle(' + grande.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)', borderRadius: '0' },
        { transform: 'scale(.86)', clipPath: 'circle(' + (bolaR * 1.02).toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)', offset: 0.42 },
        { transform: transformeBola(a), clipPath: 'circle(' + bolaR.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)' },
      ], { duration: 1050, easing: 'cubic-bezier(.65, 0, .25, 1)', fill: 'forwards' });
      anim.onfinish = function () { casca.style.transform = transformeBola(a); anim.cancel(); fim(); };
    }
    ligarEventos();
    raf = requestAnimationFrame(quadro);
    setTimeout(function () { var b = cima.querySelector('[data-modo="' + modo + '"]'); if (b) b.focus({ preventScroll: true }); }, 60);
  }

  function fechar(depois) {
    if (!aberto || fechando) return;
    fechando = true;
    var a = alvoBola() || { x: vw / 2, y: vh / 2, k: 0.2 };
    var grande = Math.hypot(vw, vh) / 2 + 4;
    el.classList.add('po-saindo'); cima.classList.add('po-saindo');
    var limpar = function () {
      cancelAnimationFrame(raf); raf = 0;
      aberto = false; fechando = false;
      desligarEventos();
      if (casca) { casca.classList.remove('po-bola'); casca.style.transform = ''; casca.style.clipPath = ''; casca.style.transformOrigin = ''; casca.style.opacity = ''; }
      if (el) el.remove(); if (cima) cima.remove(); el = cima = null;
      document.documentElement.classList.remove('portal-aberto');
      var lenis = window.Movimento && window.Movimento.lenis && window.Movimento.lenis(); if (lenis) lenis.start();
      var b = document.getElementById('b-portal'); if (b && !depois) b.focus({ preventScroll: true });
      if (depois) depois();
    };
    if (calmo() || !casca || !casca.animate) { limpar(); return; }
    var anim = casca.animate([
      { transform: transformeBola(a), clipPath: 'circle(' + bolaR.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)' },
      { transform: 'none', clipPath: 'circle(' + grande.toFixed(1) + 'px at ' + bolaO.x.toFixed(1) + 'px ' + bolaO.y.toFixed(1) + 'px)' },
    ], { duration: 820, easing: 'cubic-bezier(.65, 0, .25, 1)', fill: 'forwards' });
    anim.onfinish = function () { limpar(); anim.cancel(); };
  }

  /* entrar num mundo: ele cresce até cobrir a tela e a página nova nasce do mesmo ponto */
  function entrar(c) {
    if (!c) return;
    if (c === atualCorpo) { fechar(); return; }
    var t = c.tela || { x: vw / 2, y: vh / 2, s: 1 };
    try { sessionStorage.setItem('portal:chegada', JSON.stringify({ x: Math.round(t.x), y: Math.round(t.y), quando: Date.now() })); } catch (e) { /* ok */ }
    var ir = function () { location.href = c.href; };
    if (calmo()) { ir(); return; }
    var circ = document.createElement('div');
    circ.className = 'po-expande';
    circ.style.setProperty('--x', t.x.toFixed(0) + 'px'); circ.style.setProperty('--y', t.y.toFixed(0) + 'px'); circ.style.setProperty('--c', c.cor);
    cima.appendChild(circ);
    var r0 = c.r * t.s, r1 = Math.hypot(Math.max(t.x, vw - t.x), Math.max(t.y, vh - t.y)) + 10;
    var anim = circ.animate([{ clipPath: 'circle(' + r0.toFixed(1) + 'px at ' + t.x.toFixed(0) + 'px ' + t.y.toFixed(0) + 'px)' }, { clipPath: 'circle(' + r1.toFixed(1) + 'px at ' + t.x.toFixed(0) + 'px ' + t.y.toFixed(0) + 'px)' }],
      { duration: 620, easing: 'cubic-bezier(.7, 0, .3, 1)', fill: 'forwards' });
    anim.onfinish = ir;
  }

  /* ---------- dimensões e câmera ---------- */
  function definirCamera(ja) {
    var estreito = vw < 640;
    if (modo === 'plano') { cam.alvoTilt = 0; cam.alvoZoom = estreito ? 0.98 : 0.92; }
    else if (modo === 'orbita') { cam.alvoTilt = estreito ? 1.0 : 1.08; cam.alvoZoom = estreito ? 0.84 : 1.06; }
    else { cam.alvoTilt = 0; cam.alvoZoom = estreito ? 0.9 : 0.95; cam.alvoPitch = -0.18; }
    if (ja) { cam.tilt = cam.alvoTilt; cam.zoom = cam.alvoZoom; cam.spin = cam.alvoSpin; cam.yaw = cam.alvoYaw; cam.pitch = cam.alvoPitch; }
  }
  function trocarModo(m) {
    if (m === modo) return;
    anterior = modo; modo = m; troca = calmo() ? 1 : 0;
    gravar('portal:modo', m);
    definirCamera(false);
    pintarModos();
  }
  function pintarModos() { if (el) el.setAttribute('data-modo', modo); if (!cima) return; cima.querySelectorAll('[data-modo]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-modo') === modo)); }); }
  function zoom(f) { cam.alvoZoom = Math.max(0.45, Math.min(2.6, cam.alvoZoom * f)); }

  /* ---------- eventos ---------- */
  function aoClicar(ev) {
    var b = ev.target.closest('[data-modo]'); if (b) { trocarModo(b.getAttribute('data-modo')); return; }
    var z = ev.target.closest('[data-zoom]'); if (z) { zoom(+z.getAttribute('data-zoom') > 0 ? 1.18 : 1 / 1.18); return; }
    if (ev.target.closest('[data-fechar]') || ev.target.closest('.po-voltar-bola')) { fechar(); return; }
    var a = ev.target.closest('.po-corpo');
    if (a) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return; /* nova aba: deixa o link agir */
      ev.preventDefault();
      if (arrasto && arrasto.mexeu) return;
      entrar(corpos[+a.getAttribute('data-i')]);
    }
  }
  function aoTeclar(ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(); return; }
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { if (ev.target.closest && ev.target.closest('.po-corpo')) { navegarFoco(ev.key === 'ArrowRight' ? 1 : -1); ev.preventDefault(); return; } if (modo === 'esfera') cam.alvoYaw += ev.key === 'ArrowRight' ? 0.35 : -0.35; else cam.alvoSpin += ev.key === 'ArrowRight' ? 0.3 : -0.3; ev.preventDefault(); }
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') { if (modo === 'esfera') cam.alvoPitch = Math.max(-1.2, Math.min(1.2, cam.alvoPitch + (ev.key === 'ArrowUp' ? -0.25 : 0.25))); else cam.alvoTilt = Math.max(0, Math.min(1.35, cam.alvoTilt + (ev.key === 'ArrowUp' ? 0.15 : -0.15))); ev.preventDefault(); }
    if (ev.key === '+' || ev.key === '=') zoom(1.18);
    if (ev.key === '-') zoom(1 / 1.18);
    if (ev.key === '1' || ev.key === '2' || ev.key === '3') trocarModo(MODOS[+ev.key - 1][0]);
    if (ev.key === 'Tab') prenderFoco(ev);
  }
  function navegarFoco(d) {
    var l = Array.prototype.slice.call(el.querySelectorAll('.po-corpo'));
    var i = l.indexOf(document.activeElement);
    l[(i + d + l.length) % l.length].focus();
  }
  function prenderFoco(ev) {
    var foc = Array.prototype.slice.call(el.querySelectorAll('.po-corpo')).concat(Array.prototype.slice.call(cima.querySelectorAll('button')));
    var i = foc.indexOf(document.activeElement);
    if (i < 0) return;
    if (ev.shiftKey && i === 0) { ev.preventDefault(); foc[foc.length - 1].focus(); }
    else if (!ev.shiftKey && i === foc.length - 1) { ev.preventDefault(); foc[0].focus(); }
  }
  var ponteiros = new Map();
  function aoPegar(ev) {
    if (ev.target.closest('.po-ui, .po-cab button')) return;
    ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ponteiros.size === 1) arrasto = { x: ev.clientX, y: ev.clientY, mexeu: false };
    else if (ponteiros.size === 2) { var p = Array.from(ponteiros.values()); arrasto = { pinca: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mexeu: true }; }
  }
  function aoMover(ev) {
    if (!arrasto || !ponteiros.has(ev.pointerId)) return;
    ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (arrasto.pinca) { var p = Array.from(ponteiros.values()); if (p.length < 2) return; var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); zoom(d / arrasto.pinca); arrasto.pinca = d; return; }
    var dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y;
    if (!arrasto.mexeu && Math.hypot(dx, dy) > 6) { arrasto.mexeu = true; try { el.setPointerCapture(ev.pointerId); } catch (e) { /* ok */ } el.classList.add('po-arrastando'); }
    if (!arrasto.mexeu) return;
    arrasto.x = ev.clientX; arrasto.y = ev.clientY;
    if (modo === 'esfera') { cam.alvoYaw += dx * 0.006; cam.alvoPitch = Math.max(-1.25, Math.min(1.25, cam.alvoPitch + dy * 0.006)); }
    else { cam.alvoSpin += dx * 0.005; cam.alvoTilt = Math.max(0, Math.min(1.35, cam.alvoTilt + dy * 0.005)); }
  }
  function aoSoltar(ev) {
    ponteiros.delete(ev.pointerId);
    if (ponteiros.size) return;
    el.classList.remove('po-arrastando');
    var a = arrasto; setTimeout(function () { if (arrasto === a) arrasto = null; }, 0);
  }
  function aoRolar(ev) { ev.preventDefault(); zoom(Math.exp(-ev.deltaY * 0.0012)); }
  function aoRedimensionar() {
    if (!aberto) return;
    medir();
    estrelas();
    if (casca) { casca.style.clipPath = ''; casca.style.transform = ''; prepararBola(); }
  }
  function ligarEventos() {
    el.addEventListener('click', aoClicar); cima.addEventListener('click', aoClicar);
    el.addEventListener('pointerdown', aoPegar); el.addEventListener('pointermove', aoMover); el.addEventListener('pointerup', aoSoltar); el.addEventListener('pointercancel', aoSoltar);
    el.addEventListener('wheel', aoRolar, { passive: false }); cima.addEventListener('wheel', aoRolar, { passive: false });
    document.addEventListener('keydown', aoTeclar, true);
    window.addEventListener('resize', aoRedimensionar);
  }
  function desligarEventos() {
    document.removeEventListener('keydown', aoTeclar, true);
    window.removeEventListener('resize', aoRedimensionar);
    ponteiros.clear(); arrasto = null;
  }

  window.addEventListener('pageshow', function (ev) {
    if (!ev.persisted || !aberto) return;
    fechando = true; cancelAnimationFrame(raf); raf = 0; aberto = false; fechando = false; desligarEventos();
    if (casca) { casca.classList.remove('po-bola'); casca.style.transform = ''; casca.style.clipPath = ''; casca.style.transformOrigin = ''; casca.style.opacity = ''; }
    if (el) el.remove(); if (cima) cima.remove(); el = cima = null;
    document.documentElement.classList.remove('portal-aberto');
  });

  window.Portal = { abrir: abrir, fechar: function () { fechar(); }, aberto: function () { return aberto; } };
})();
