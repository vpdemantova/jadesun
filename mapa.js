(function () {
  'use strict';

  var LIMITES = { cita: 9, citada: 9, parecida: 5 };

  function css(nome, padrao) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    return v || padrao;
  }

  function construir(f) {
    var nos = [{ id: f.id, titulo: f.titulo, tipo: 'centro', tem: true }];
    var por = {};
    por[f.id] = nos[0];
    var links = [];

    function no(id, titulo, tipo, tem) {
      var chave = tem && id ? id : 'x:' + titulo;
      if (por[chave]) return por[chave];
      var n = { id: tem ? id : null, titulo: titulo, tipo: tipo, tem: !!tem };
      por[chave] = n;
      nos.push(n);
      return n;
    }
    function ligar(a, b, tipo, dir) { links.push({ a: a, b: b, tipo: tipo, dir: dir || 0 }); }

    (f.hierarquia || []).forEach(function (g) {
      var tipo = /Acima|Pré/.test(g.rotulo) ? 'acima' : /Abaixo|Abre/.test(g.rotulo) ? 'abaixo' : 'lado';
      g.itens.slice(0, 10).forEach(function (x) {
        var n = no(x.id, x.titulo, tipo, !!x.id);
        ligar(nos[0], n, tipo, tipo === 'acima' ? -1 : tipo === 'abaixo' ? 1 : 0);
      });
    });
    (f.saem || []).slice(0, LIMITES.cita).forEach(function (c) { if (!por[c.id]) ligar(nos[0], no(c.id, c.titulo, 'cita', true), 'cita', 1); });
    (f.chegam || []).slice(0, LIMITES.citada).forEach(function (c) { if (!por[c.id]) ligar(nos[0], no(c.id, c.titulo, 'citada', true), 'citada', -1); });
    (f.parecidos || []).slice(0, LIMITES.parecida).forEach(function (c) { if (!por[c.id]) ligar(nos[0], no(c.id, c.titulo, 'parecida', true), 'parecida', 0); });
    return { nos: nos, links: links };
  }

  function posicoesIniciais(g, w, h) {
    var angulos = { acima: -Math.PI / 2, abaixo: Math.PI / 2, lado: 0, cita: -Math.PI / 4, citada: (3 * Math.PI) / 4, parecida: Math.PI };
    var contagem = {};
    g.nos.forEach(function (n) { contagem[n.tipo] = (contagem[n.tipo] || 0) + 1; });
    var visto = {};
    g.nos.forEach(function (n, i) {
      if (n.tipo === 'centro') { n.x = w / 2; n.y = h / 2; n.vx = n.vy = 0; return; }
      var k = visto[n.tipo] = (visto[n.tipo] || 0) + 1;
      var leque = 1.5;
      var base = angulos[n.tipo] + (contagem[n.tipo] > 1 ? (k - 1) / (contagem[n.tipo] - 1) * leque - leque / 2 : 0);
      var raio = Math.min(w, h) * 0.34 + (i % 3) * 8;
      n.x = w / 2 + Math.cos(base) * raio * (w / h > 1.4 ? 1.5 : 1);
      n.y = h / 2 + Math.sin(base) * raio;
      n.vx = n.vy = 0;
    });
  }

  function montar(canvas, f, opcoes) {
    opcoes = opcoes || {};
    var g = construir(f);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, cores = {}, alpha = 1, raf = 0, hover = null, vivo = true;

    function lerCores() {
      cores = {
        tinta: css('--tinta', '#111'), suave: css('--suave', '#888'), sinal: css('--sinal', '#f33'), papel: css('--papel', '#fff'),
        acima: css('--mat', '#a184f0'), abaixo: css('--bio', '#4cc17e'), lado: css('--fis', '#4fa0f0'),
        cita: css('--sinal', '#f33'), citada: css('--qui', '#ff8a3d'), parecida: css('--suave', '#888'),
      };
    }

    function tamanho() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(200, r.width); h = Math.max(160, r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function passo() {
      var nos = g.nos;
      for (var i = 0; i < nos.length; i++) {
        for (var j = i + 1; j < nos.length; j++) {
          var dx = nos[j].x - nos[i].x, dy = nos[j].y - nos[i].y;
          var d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2);
          var forca = (2600 / d2) * alpha;
          var fx = (dx / d) * forca, fy = (dy / d) * forca;
          nos[i].vx -= fx; nos[i].vy -= fy; nos[j].vx += fx; nos[j].vy += fy;
        }
      }
      g.links.forEach(function (l) {
        var dx = l.b.x - l.a.x, dy = l.b.y - l.a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        var alvo = l.tipo === 'parecida' ? 150 : l.tipo === 'cita' || l.tipo === 'citada' ? 115 : 92;
        var k = (d - alvo) * 0.035 * alpha;
        var fx = (dx / d) * k, fy = (dy / d) * k;
        l.a.vx += fx; l.a.vy += fy; l.b.vx -= fx; l.b.vy -= fy;
      });
      nos.forEach(function (n) {
        if (n.tipo === 'centro') { n.x += (w / 2 - n.x) * 0.2; n.y += (h / 2 - n.y) * 0.2; n.vx = n.vy = 0; return; }
        n.vx += (w / 2 - n.x) * 0.002 * alpha; n.vy += (h / 2 - n.y) * 0.002 * alpha;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x = Math.max(28, Math.min(w - 28, n.x + n.vx));
        n.y = Math.max(18, Math.min(h - 18, n.y + n.vy));
      });
      alpha *= 0.985;
    }

    function texto(t, max) { return t.length > max ? t.slice(0, max - 1) + '…' : t; }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    var STAGGER = 0.5; /* fração do progresso dedicada a espalhar o início de cada letra */
    var EASE_TXT = 0.13; /* um pouco mais lenta que EASE, pro texto ter mais "peso" que o resto */

    function deveMostrarRotulo(n) {
      var vizinho = hover && g.links.some(function (l) { return (l.a === hover && l.b === n) || (l.b === hover && l.a === n); });
      return n.tipo === 'centro' || hover === n || vizinho || (!hover && n.tipo !== 'parecida');
    }

    /* decide, uma vez por quadro, quais rótulos cabem sem se sobrepor — usando sempre a
       posição de DESTINO (nunca a posição animada), senão um rótulo que já apareceu quase
       inteiro poderia sumir de repente ao cruzar um limiar de colisão no meio da animação */
    function calcularAlvosRotulo() {
      var usados = [];
      g.nos.slice().sort(function (a, b) { return prioridade(a) - prioridade(b); }).forEach(function (n) {
        if (!deveMostrarRotulo(n)) { n.rotAlvo = 0; return; }
        var centro = n.tipo === 'centro';
        var r = centro ? 11 : n.tipo === 'parecida' ? 4.5 : 6.5;
        ctx.font = (centro ? '600 13px ' : '400 11.5px ') + '"Archivo", system-ui, sans-serif';
        var t = texto(n.titulo.replace(/^[A-Z]{3}-\d{2}\s*·\s*/, ''), centro || hover === n ? 44 : 20);
        var larg = ctx.measureText(t).width;
        var x = Math.max(larg / 2 + 4, Math.min(w - larg / 2 - 4, n.x));
        var y = n.y + r + 13 > h - 4 ? n.y - r - 6 : n.y + r + 13;
        var ret = { x0: x - larg / 2 - 2, x1: x + larg / 2 + 2, y0: y - 11, y1: y + 3 };
        if (hover !== n && usados.some(function (u) { return ret.x0 < u.x1 && ret.x1 > u.x0 && ret.y0 < u.y1 && ret.y1 > u.y0; })) { n.rotAlvo = 0; return; }
        usados.push(ret);
        n._rot = { t: t, larg: larg, x: x, y: y }; /* posição/texto de destino, congelados até o próximo "cabe" */
        n.rotAlvo = 1;
      });
    }

    /* ---------- transições suaves de destaque (hover) ----------
       Em vez de trocar o alfa de golpe quando o mouse entra ou sai de um nó,
       cada nó e cada linha guardam um valor "atual" que persegue um "alvo"
       a cada quadro, andando uma fração (EASE) da distância que falta — a
       curva clássica de suavização por interpolação exponencial. Sem isso,
       o realce pisca; com isso, ele "respira". */
    var EASE = 0.16;
    function aproximar(atual, alvo) { return atual + (alvo - atual) * EASE; }
    function ehVizinho(n) { return !!hover && g.links.some(function (l) { return (l.a === hover && l.b === n) || (l.b === hover && l.a === n); }); }
    function tocaHover(l) { return hover === l.a || hover === l.b; }

    function atualizarDestaque() {
      var pronto = true;
      g.nos.forEach(function (n) {
        var centro = n.tipo === 'centro';
        var alvo = !hover || centro || n === hover || ehVizinho(n) ? 1 : 0.22;
        if (n.foco === undefined) n.foco = alvo;
        if (!mov) n.foco = alvo; else n.foco = aproximar(n.foco, alvo);
        var alvoBrilho = n === hover ? 1 : 0;
        if (n.brilho === undefined) n.brilho = 0;
        n.brilho = mov ? aproximar(n.brilho, alvoBrilho) : alvoBrilho;
        if (n.rotAlvo === undefined) n.rotAlvo = 0;
        if (n.rotProg === undefined) n.rotProg = n.rotAlvo;
        if (!mov) n.rotProg = n.rotAlvo; else n.rotProg += (n.rotAlvo - n.rotProg) * EASE_TXT;
        if (Math.abs(n.foco - alvo) > 0.004 || Math.abs(n.brilho - alvoBrilho) > 0.004 || Math.abs(n.rotProg - n.rotAlvo) > 0.004) pronto = false;
      });
      g.links.forEach(function (l) {
        var forte = l.tipo === 'acima' || l.tipo === 'abaixo' || l.tipo === 'lado';
        var base = forte ? 0.7 : 0.4;
        var alvo = !hover ? base : tocaHover(l) ? 0.95 : 0.1;
        if (l.foco === undefined) l.foco = alvo;
        if (!mov) l.foco = alvo; else l.foco = aproximar(l.foco, alvo);
        if (Math.abs(l.foco - alvo) > 0.004) pronto = false;
      });
      return pronto;
    }

    function desenhar() {
      ctx.clearRect(0, 0, w, h);
      g.links.forEach(function (l) {
        var forte = l.tipo === 'acima' || l.tipo === 'abaixo' || l.tipo === 'lado';
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.strokeStyle = cores[l.tipo];
        ctx.globalAlpha = l.foco === undefined ? (forte ? 0.7 : 0.4) : l.foco;
        ctx.lineWidth = forte ? 1.8 : 1;
        ctx.setLineDash(l.tipo === 'parecida' ? [3, 4] : []);
        /* o brilho da linha acompanha, suavizado, o quanto ela "toca" o nó sob o cursor */
        var brilhoLinha = tocaHover(l) ? (hover.brilho || 0) : 0;
        if (brilhoLinha > 0.01) { ctx.shadowColor = cores.sinal; ctx.shadowBlur = 14 * brilhoLinha; } else { ctx.shadowBlur = 0; }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      g.nos.forEach(function (n) {
        var centro = n.tipo === 'centro';
        var r = centro ? 11 : n.tipo === 'parecida' ? 4.5 : 6.5;
        var brilho = n.brilho || 0;
        ctx.globalAlpha = n.foco === undefined ? 1 : n.foco;
        /* desfoque suave: um halo de sombra colorida atrás do nó em foco — cresce e
           esmaece junto com "brilho", nunca aparece nem some de repente */
        if (brilho > 0.01) { ctx.shadowColor = centro ? cores.papel : cores[n.tipo]; ctx.shadowBlur = 22 * brilho; }
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + brilho * 3, 0, Math.PI * 2);
        if (!n.tem) {
          ctx.setLineDash([2.5, 2.5]);
          ctx.strokeStyle = cores.suave; ctx.lineWidth = 1.4; ctx.fillStyle = 'transparent';
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = centro ? cores.sinal : cores[n.tipo];
          ctx.fill();
          if (centro) { ctx.lineWidth = 3; ctx.strokeStyle = cores.papel; ctx.stroke(); }
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });
      rotular();
    }

    function prioridade(n) {
      if (n === hover) return 0;
      return { centro: 1, acima: 2, abaixo: 2, lado: 2, cita: 3, citada: 4, parecida: 5 }[n.tipo];
    }

    function rotular() {
      /* o rótulo NUNCA sai do seu lugar (não desliza pelo mapa) — quem anima é cada
         letra, que nasce/recolhe no centro da própria palavra e "abre" até seu lugar
         natural, em cascata, com fade junto */
      ctx.fillStyle = cores.tinta;
      ctx.textAlign = 'left';
      g.nos.forEach(function (n) {
        var prog = n.rotProg || 0;
        if (prog < 0.003 || !n._rot) return;
        var centro = n.tipo === 'centro';
        ctx.font = (centro ? '600 13px ' : '400 11.5px ') + '"Archivo", system-ui, sans-serif';
        var t = n._rot.t, x = n._rot.x, y = n._rot.y;
        var baseAlpha = n.foco === undefined ? 1 : Math.max(0.3, n.foco);
        var d = t.length > 1 ? STAGGER / (t.length - 1) : 0;
        var larguras = [];
        for (var i = 0; i < t.length; i++) larguras.push(ctx.measureText(t[i]).width);
        var naturalX = x - n._rot.larg / 2;
        for (i = 0; i < t.length; i++) {
          var pLetra = Math.max(0, Math.min(1, (prog - i * d) / (1 - STAGGER + 0.0001)));
          var eLetra = easeOutCubic(pLetra);
          if (eLetra > 0.01) {
            var centrado = x - larguras[i] / 2; /* letra "recolhida": seu próprio centro cai no centro da palavra */
            var drawX = centrado + (naturalX - centrado) * eLetra;
            ctx.globalAlpha = baseAlpha * eLetra;
            ctx.fillText(t[i], drawX, y);
          }
          naturalX += larguras[i];
        }
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center';
    }

    function laco() {
      raf = 0;
      if (!vivo || !document.body.contains(canvas)) return;
      if (alpha > 0.03) { passo(); passo(); }
      calcularAlvosRotulo();
      var destaquePronto = atualizarDestaque();
      desenhar();
      if (alpha > 0.03 || !destaquePronto) raf = requestAnimationFrame(laco);
    }

    function no_em(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top, melhor = null, dmin = 16 * 16;
      g.nos.forEach(function (n) { var d = (n.x - x) * (n.x - x) + (n.y - y) * (n.y - y); if (d < dmin) { dmin = d; melhor = n; } });
      return melhor;
    }

    function mover(e) {
      var n = no_em(e);
      if (n !== hover) {
        hover = n;
        canvas.style.cursor = n && n.tem && n.tipo !== 'centro' ? 'pointer' : n && !n.tem ? 'help' : 'default';
        canvas.title = n && !n.tem ? 'Citado, mas ainda sem ficha: um bom próximo tijolo para escrever.' : '';
        if (!raf) raf = requestAnimationFrame(laco);
      }
    }
    function clicar(e) {
      var n = no_em(e);
      if (n && n.tem && n.tipo !== 'centro' && opcoes.ir) opcoes.ir(n.id);
    }
    function sair() { if (hover) { hover = null; if (!raf) raf = requestAnimationFrame(laco); } }
    function aoRedimensionar() { tamanho(); alpha = 0.6; if (!raf) raf = requestAnimationFrame(laco); }
    function aoMudar() { lerCores(); if (!raf) desenhar(); }

    lerCores(); tamanho(); posicoesIniciais(g, w, h);
    var mov = !(window.Movimento && window.Movimento.config().anima === 'off');
    if (!mov) { for (var i = 0; i < 260; i++) passo(); alpha = 0; }
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Mapa de conceitos de ' + f.titulo + ': ' + (g.nos.length - 1) + ' ligações.');
    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerleave', sair);
    canvas.addEventListener('click', clicar);
    window.addEventListener('resize', aoRedimensionar);
    window.addEventListener('pers:mudou', aoMudar);
    raf = requestAnimationFrame(laco);

    return {
      total: g.nos.length - 1, semFicha: g.nos.filter(function (n) { return !n.tem; }).length,
      destruir: function () { vivo = false; window.removeEventListener('resize', aoRedimensionar); window.removeEventListener('pers:mudou', aoMudar); },
    };
  }

  window.Mapa = { montar: montar };
})();
