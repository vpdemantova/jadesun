(function () {
  'use strict';

  var VARS = { lin: '--lin', his: '--his', geo: '--geo', qui: '--qui', bio: '--bio', mat: '--mat', fis: '--fis', fil: '--fil', soc: '--soc', ing: '--ing' };

  function css(nome, padrao) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    return v || padrao;
  }

  function suave(p) { return p <= 0 ? 0 : 1 - Math.pow(1 - Math.min(1, p), 2.2); }

  function pontoNaCurva(x0, y0, cx, cy, x1, y1, t) {
    var u = 1 - t;
    return { x: u * u * x0 + 2 * u * t * cx + t * t * x1, y: u * u * y0 + 2 * u * t * cy + t * t * y1 };
  }

  function hex(c, a) {
    if (c.charAt(0) === '#' && c.length === 7) {
      var n = parseInt(c.slice(1), 16);
      return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    return c;
  }

  function montar(canvas, dados, opcoes) {
    opcoes = opcoes || {};
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var n = dados.length;
    var alvo = dados.map(function (d) { return d.total ? d.feitos / d.total : 0; });
    var atual = dados.map(function (d, i) {
      var de = opcoes.de && opcoes.de[d.nome];
      return de != null ? de : 0;
    });
    var petalas = [];
    var pausado = false;
    var visivel = true;
    var cores = {};
    var tinta = '#111';
    var fixa = '#fff';
    var w = 0, h = 0;
    var destaque = -1;
    var parar = null;
    var t0 = performance.now();
    var vivos = true;

    function lerCores() {
      tinta = css('--tinta', '#111');
      dados.forEach(function (d) { cores[d.cor] = css(VARS[d.cor] || '--ing', '#999'); });
    }

    function tamanho() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(120, r.width);
      h = Math.max(120, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function animado() {
      var c = window.Movimento && window.Movimento.config();
      return c ? c.anima !== 'off' : !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    function imersivo() {
      var c = window.Movimento && window.Movimento.config();
      return !!c && c.anima === 'imersivo';
    }

    function folha(x, y, ang, len, cor) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -len * 0.42, len, 0);
      ctx.quadraticCurveTo(len * 0.5, len * 0.42, 0, 0);
      ctx.fillStyle = hex(cor, 0.9);
      ctx.fill();
      ctx.restore();
    }

    function flor(x, y, r, cor, giro) {
      var petalasN = 6;
      for (var k = 0; k < petalasN; k++) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(giro + (k * Math.PI * 2) / petalasN);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.72, r * 0.42, r * 0.78, 0, 0, Math.PI * 2);
        ctx.fillStyle = hex(cor, 0.92);
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, r * 0.28), 0, Math.PI * 2);
      ctx.fillStyle = tinta;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function desenhar(t) {
      ctx.clearRect(0, 0, w, h);
      var chao = h * 0.84;
      var maxH = h * 0.66;
      ctx.strokeStyle = hex(tinta.charAt(0) === '#' ? tinta : '#888888', 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.03, chao + 0.5);
      ctx.lineTo(w * 0.97, chao + 0.5);
      ctx.stroke();
      var mov = animado();
      var seg = t / 1000;

      for (var g0 = 0; g0 < 9; g0++) {
        var gx = w * (0.04 + 0.92 * ((g0 * 0.618 + 0.13) % 1));
        ctx.beginPath();
        ctx.strokeStyle = hex(tinta.charAt(0) === '#' ? tinta : '#888888', 0.2);
        ctx.lineWidth = 1;
        for (var b = -1; b <= 1; b++) {
          ctx.moveTo(gx + b * 2.4, chao);
          ctx.lineTo(gx + b * 4.4 + (mov ? Math.sin(seg * 1.2 + g0 + b) * 1.2 : 0), chao - 7 - ((g0 + b + 3) % 3) * 3);
        }
        ctx.stroke();
      }

      for (var i = 0; i < n; i++) {
        var d = dados[i];
        var p = Math.pow(atual[i], 0.5);
        var x = w * (0.07 + 0.86 * ((i + 0.5) / n));
        var cor = cores[d.cor];
        var alt = 16 + (maxH - 16) * suave(p);
        var balanco = mov ? Math.sin(seg * 0.9 + i * 1.3) * (1.5 + 5.5 * p) : 0;
        var topoX = x + balanco;
        var topoY = chao - alt;
        var cx = x + balanco * 0.25 - 3 * (i % 2 ? 1 : -1);
        var cy = chao - alt * 0.55;

        if (i === destaque) {
          ctx.beginPath();
          ctx.arc(x, chao - alt * 0.5, alt * 0.55 + 14, 0, Math.PI * 2);
          ctx.fillStyle = hex(cor, 0.1);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(x, chao);
        ctx.quadraticCurveTo(cx, cy, topoX, topoY);
        ctx.strokeStyle = hex(tinta.charAt(0) === '#' ? tinta : '#888888', 0.55);
        ctx.lineWidth = 1.4 + 1.3 * p;
        ctx.lineCap = 'round';
        ctx.stroke();

        var folhas = 2 + Math.floor(p * 6);
        for (var k = 0; k < folhas; k++) {
          var tt = 0.22 + 0.68 * (folhas === 1 ? 0.4 : k / (folhas - 1));
          var pt = pontoNaCurva(x, chao, cx, cy, topoX, topoY, tt);
          var lado = k % 2 ? 1 : -1;
          folha(pt.x, pt.y, (lado > 0 ? -0.5 : Math.PI + 0.5) + (mov ? Math.sin(seg * 1.1 + k + i) * 0.09 : 0), 5 + 8 * Math.min(1, p + 0.2), cor);
        }

        if (p >= 0.3) {
          var flora = Math.min(1, (p - 0.3) / 0.6);
          flor(topoX, topoY, 3 + 10 * suave(flora), cor, mov ? seg * 0.15 + i : i);
        } else {
          ctx.beginPath();
          ctx.arc(topoX, topoY, 3 + 6 * p, 0, Math.PI * 2);
          ctx.fillStyle = hex(cor, 0.95);
          ctx.fill();
        }

        if (i === destaque) {
          ctx.font = '500 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = tinta;
          ctx.fillText(d.nome + ' ' + d.feitos + '/' + d.total, Math.min(w - 50, Math.max(50, x)), Math.max(14, topoY - 20));
        }
      }

      petalas = petalas.filter(function (q) { return q.vida > 0; });
      petalas.forEach(function (q) {
        q.vida -= 0.012;
        q.x += q.vx;
        q.y += q.vy;
        q.vy += 0.045;
        q.giro += q.vg;
        ctx.save();
        ctx.translate(q.x, q.y);
        ctx.rotate(q.giro);
        ctx.globalAlpha = Math.max(0, q.vida);
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.2, 4.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = q.cor;
        ctx.fill();
        ctx.restore();
      });
      ctx.globalAlpha = 1;

      if (imersivo()) {
        for (var v = 0; v < 7; v++) {
          var fx = w * (0.1 + 0.8 * ((Math.sin(seg * 0.23 + v * 2.1) + 1) / 2));
          var fy = h * (0.2 + 0.55 * ((Math.cos(seg * 0.31 + v * 1.7) + 1) / 2));
          var brilho = 0.35 + 0.65 * Math.abs(Math.sin(seg * 1.3 + v));
          var g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 9);
          g.addColorStop(0, hex('#FFE9A0', 0.9 * brilho));
          g.addColorStop(1, hex('#FFE9A0', 0));
          ctx.fillStyle = g;
          ctx.fillRect(fx - 9, fy - 9, 18, 18);
        }
      }
    }

    function quadro(t) {
      if (!vivos) return;
      if (!document.body.contains(canvas)) { destruir(); return; }
      if (!visivel || document.hidden) return;
      var mov = animado();
      var mexeu = false;
      for (var i = 0; i < n; i++) {
        var dif = alvo[i] - atual[i];
        if (Math.abs(dif) > 0.0008) { atual[i] += mov ? dif * 0.05 : dif; mexeu = true; } else atual[i] = alvo[i];
      }
      if (mov || mexeu || petalas.length) desenhar(t - t0);
    }

    function celebrar(i) {
      var d = dados[i];
      if (!d) return;
      var x = w * (0.07 + 0.86 * ((i + 0.5) / n));
      var y = h * 0.84 - (8 + (h * 0.66 - 8) * suave(alvo[i]));
      for (var k = 0; k < 16; k++) {
        petalas.push({ x: x, y: y, vx: (Math.random() - 0.5) * 2.8, vy: -1.2 - Math.random() * 2, vg: (Math.random() - 0.5) * 0.3, giro: Math.random() * 6, vida: 1, cor: hex(cores[d.cor] || '#f0a', 0.95) });
      }
    }

    function mover(e) {
      var r = canvas.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var idx = Math.round(((px - 0.07) / 0.86) * n - 0.5);
      var novo = idx >= 0 && idx < n ? idx : -1;
      if (novo !== destaque) { destaque = novo; if (!animado()) desenhar(performance.now() - t0); }
    }
    function sair() { if (destaque !== -1) { destaque = -1; if (!animado()) desenhar(performance.now() - t0); } }

    function atualizar(novos, celebrarMudancas) {
      novos.forEach(function (d, i) {
        var novo = d.total ? d.feitos / d.total : 0;
        if (celebrarMudancas && d.feitos > dados[i].feitos) celebrar(i);
        dados[i] = d;
        alvo[i] = novo;
      });
      canvas.setAttribute('aria-label', rotulo());
      if (!animado()) { atual = alvo.slice(); desenhar(performance.now() - t0); }
    }

    function rotulo() {
      var f = 0, t = 0;
      dados.forEach(function (d) { f += d.feitos; t += d.total; });
      return 'Jardim: ' + f + ' de ' + t + ' itens dominados. ' + dados.map(function (d) { return d.nome + ' ' + d.feitos + ' de ' + d.total; }).join('; ') + '.';
    }

    function destruir() {
      vivos = false;
      if (parar) parar();
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('pers:mudou', aoMudar);
      if (obs) obs.disconnect();
    }

    function aoRedimensionar() { tamanho(); desenhar(performance.now() - t0); }
    function aoMudar() { lerCores(); if (!animado()) { atual = alvo.slice(); desenhar(performance.now() - t0); } }

    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', rotulo());
    lerCores();
    tamanho();
    if (!animado()) atual = alvo.slice();
    desenhar(0);

    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerleave', sair);
    window.addEventListener('resize', aoRedimensionar);
    window.addEventListener('pers:mudou', aoMudar);
    var obs = null;
    if ('IntersectionObserver' in window) {
      obs = new IntersectionObserver(function (es) { visivel = es[0].isIntersecting; }, { threshold: 0.01 });
      obs.observe(canvas);
    }
    if (window.Movimento) parar = window.Movimento.aoFrame(quadro);
    else { var id = 0; var lp = function (t) { quadro(t); if (vivos) id = requestAnimationFrame(lp); }; id = requestAnimationFrame(lp); parar = function () { cancelAnimationFrame(id); }; }

    return { atualizar: atualizar, celebrar: celebrar, destruir: destruir };
  }

  window.Jardim = { montar: montar };
})();
